'use strict';
const crypto = require('crypto');
const study = require('./study');
const pdfrefs = require('./pdfrefs');

const newId = () => crypto.randomBytes(16).toString('hex');

/** Cria um tópico. style: { fill, color, shape, bold, italic, icon } (todos opcionais). */
function createNode(title = 'Tópico', extra = {}) {
  return { id: newId(), title, notes: '', collapsed: false, style: {}, markers: [], progress: null, children: [], ...extra };
}

class MindMap {
  constructor(root = createNode('Mapa mental'), meta = {}) {
    this.root = root;
    this.meta = { name: root.title, theme: 'ocean', ...meta };
    if (!Array.isArray(this.meta.relations)) this.meta.relations = [];
    this._undo = [];
    this._redo = [];
  }

  find(id, node = this.root, parent = null) {
    if (node.id === id) return { node, parent };
    for (const c of node.children) {
      const r = this.find(id, c, node);
      if (r) return r;
    }
    return null;
  }

  walk(fn, node = this.root, level = 0, parent = null) {
    fn(node, level, parent);
    for (const c of node.children) this.walk(fn, c, level + 1, node);
  }

  // --- histórico (snapshots JSON; simples e robusto para mapas de tamanho normal) ---
  _snapshot() {
    if (this._inBatch) return; // dentro de batch(): um único ponto de desfazer
    this._undo.push(JSON.stringify({ root: this.root, meta: this.meta }));
    if (this._undo.length > 200) this._undo.shift();
    this._redo.length = 0;
  }
  _restore(json) {
    const s = JSON.parse(json);
    this.root = s.root;
    this.meta = s.meta;
  }
  undo() {
    if (!this._undo.length) return false;
    this._redo.push(JSON.stringify({ root: this.root, meta: this.meta }));
    this._restore(this._undo.pop());
    return true;
  }
  redo() {
    if (!this._redo.length) return false;
    this._undo.push(JSON.stringify({ root: this.root, meta: this.meta }));
    this._restore(this._redo.pop());
    return true;
  }

  /**
   * Executa várias alterações como UMA ação desfazível. Se algo lançar erro, tudo é revertido
   * (nenhuma alteração parcial fica no mapa).
   */
  batch(fn) {
    if (this._inBatch) return fn();
    const before = JSON.stringify({ root: this.root, meta: this.meta });
    this._snapshot();
    this._inBatch = true;
    try { return fn(); }
    catch (e) { this._restore(before); this._undo.pop(); throw e; }
    finally { this._inBatch = false; }
  }

  /** Ids ordenados pela ordem do documento, sem repetidos, sem a raiz e sem descendentes de outro id da lista. */
  topLevel(ids) {
    const want = new Set(ids);
    const out = [];
    const rec = (n, covered) => {
      if (want.has(n.id) && n !== this.root) { if (!covered) out.push(n); covered = true; }
      n.children.forEach((c) => rec(c, covered));
    };
    rec(this.root, false);
    return out;
  }

  // --- edição ---
  addChild(parentId, title = 'Tópico', index) {
    const p = this.find(parentId);
    if (!p) return null;
    this._snapshot();
    const n = createNode(title);
    p.node.collapsed = false;
    if (index == null || index > p.node.children.length) p.node.children.push(n);
    else p.node.children.splice(index, 0, n);
    return n;
  }

  addSibling(id, title = 'Tópico') {
    const r = this.find(id);
    if (!r || !r.parent) return null;
    return this.addChild(r.parent.id, title, r.parent.children.indexOf(r.node) + 1);
  }

  remove(id) {
    const r = this.find(id);
    if (!r || !r.parent) return false;
    this._snapshot();
    r.parent.children.splice(r.parent.children.indexOf(r.node), 1);
    const gone = new Set();
    this.walk((n) => gone.add(n.id), r.node);
    this.meta.relations = this.meta.relations.filter((x) => !gone.has(x.from) && !gone.has(x.to));
    return true;
  }

  toggleMarker(id, marker) {
    const r = this.find(id);
    if (!r) return false;
    this._snapshot();
    const m = r.node.markers || (r.node.markers = []);
    const i = m.indexOf(marker);
    if (i >= 0) m.splice(i, 1); else m.push(marker);
    return true;
  }

  /** Relação (seta) entre dois tópicos quaisquer. Retorna a relação ou null se inválida/duplicada. */
  addRelation(from, to, label = '') {
    if (from === to || !this.find(from) || !this.find(to)) return null;
    if (this.meta.relations.some((x) => x.from === from && x.to === to)) return null;
    this._snapshot();
    const rel = { id: newId(), from, to, label };
    this.meta.relations.push(rel);
    return rel;
  }
  updateRelation(id, patch) {
    const r = this.meta.relations.find((x) => x.id === id);
    if (!r) return false;
    this._snapshot();
    Object.assign(r, patch);
    return true;
  }
  removeRelation(id) {
    if (!this.meta.relations.some((x) => x.id === id)) return false;
    this._snapshot();
    this.meta.relations = this.meta.relations.filter((x) => x.id !== id);
    return true;
  }

  /** Remove vários tópicos (e suas relações) como uma ação. Retorna quantos tópicos de topo saíram. */
  removeMany(ids) {
    const tops = this.topLevel(ids);
    if (!tops.length) return 0;
    this.batch(() => tops.forEach((n) => this.remove(n.id)));
    return tops.length;
  }
  updateMany(ids, patch) {
    const list = ids.filter((id) => this.find(id));
    if (!list.length) return false;
    this.batch(() => list.forEach((id) => this.update(id, patch)));
    return true;
  }
  toggleMarkerMany(ids, marker) {
    const list = ids.map((id) => this.find(id)).filter(Boolean);
    if (!list.length) return false;
    const all = list.every((r) => (r.node.markers || []).includes(marker)); // todos têm => remove; senão => adiciona a todos
    this.batch(() => list.forEach((r) => { if ((r.node.markers || []).includes(marker) === all) this.toggleMarker(r.node.id, marker); }));
    return true;
  }
  /** Move vários tópicos (preservando a ordem do documento) para dentro de newParentId. */
  moveMany(ids, newParentId, index) {
    const tops = this.topLevel(ids);
    if (!tops.length || !this.find(newParentId)) return false;
    if (tops.some((n) => this.find(newParentId, n))) return false; // destino dentro de um dos movidos
    this.batch(() => tops.forEach((n, i) => this.move(n.id, newParentId, index == null ? undefined : index + i)));
    return true;
  }

  /**
   * Mostra os tópicos até o nível `n` (0 = só a raiz; 1 = raiz + disciplinas…) e recolhe os mais profundos.
   * `n = Infinity` expande tudo. Uma única ação desfazível. Retorna quantos tópicos mudaram de estado.
   */
  showLevels(n) {
    const changes = [];
    this.walk((node, level) => {
      const want = node.children.length > 0 && level >= n;
      if (!!node.collapsed !== want) changes.push([node, want]);
    });
    if (!changes.length) return 0;
    this._snapshot();
    for (const [node, want] of changes) node.collapsed = want;
    return changes.length;
  }

  // ---- reordenar e mudar de nível (teclado: Alt+setas) ----
  /** Troca de lugar com o irmão anterior (dir = -1) ou seguinte (dir = +1). */
  moveSibling(id, dir) {
    const r = this.find(id);
    if (!r || !r.parent) return false;
    const arr = r.parent.children, i = arr.indexOf(r.node), j = i + dir;
    if (j < 0 || j >= arr.length) return false;
    this._snapshot();
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return true;
  }
  /** Rebaixa: o tópico vira o último filho do irmão que vem logo antes dele. */
  indent(id) {
    const r = this.find(id);
    if (!r || !r.parent) return false;
    const arr = r.parent.children, i = arr.indexOf(r.node);
    if (i <= 0) return false;
    const prev = arr[i - 1];
    this._snapshot();
    arr.splice(i, 1);
    prev.collapsed = false;
    prev.children.push(r.node);
    return true;
  }
  /** Promove: o tópico passa a ser irmão do pai, logo depois dele. Filhos diretos da raiz não podem subir. */
  outdent(id) {
    const r = this.find(id);
    if (!r || !r.parent) return false;
    const g = this.find(r.parent.id);
    if (!g.parent) return false;
    this._snapshot();
    r.parent.children.splice(r.parent.children.indexOf(r.node), 1);
    g.parent.children.splice(g.parent.children.indexOf(g.node) + 1, 0, r.node);
    return true;
  }

  /**
   * Escolhe sozinho o maior nível que mantém no máximo `maxVisible` tópicos visíveis (mínimo 1: as disciplinas sempre
   * aparecem) e recolhe o resto. Serve para importações grandes (editais com centenas de tópicos). Retorna o nível usado.
   */
  autoLevels(maxVisible = 120) {
    const per = []; this.walk((n, l) => { per[l] = (per[l] || 0) + 1; });
    let cum = 0, best = 1;
    for (let l = 0; l < per.length; l++) { cum += per[l]; if (cum <= maxVisible) best = Math.max(best, l); }
    this.showLevels(best);
    return best;
  }

  /** Cópia profunda com ids novos. Por padrão descarta o histórico de estudo (a cópia é um tópico novo). */
  static cloneSubtree(node, { keepStudy = false } = {}) {
    const c = { ...JSON.parse(JSON.stringify(node)), id: newId() };
    delete c._mom;
    if (!keepStudy) delete c.study;
    c.children = node.children.map((k) => MindMap.cloneSubtree(k, { keepStudy }));
    return c;
  }
  /** Insere uma subárvore já com ids novos como filho de parentId. Retorna o nó inserido. */
  addSubtree(parentId, tree, index) {
    const p = this.find(parentId);
    if (!p) return null;
    this._snapshot();
    p.node.collapsed = false;
    if (index == null || index > p.node.children.length) p.node.children.push(tree);
    else p.node.children.splice(index, 0, tree);
    return tree;
  }

  // --- estudo (revisão espaçada, tempo, questões, prova) ---
  /** Aplica uma função pura de core/study.js ao estudo do tópico. Erros de validação lançam antes de qualquer alteração. */
  mutateStudy(id, fn) {
    const r = this.find(id);
    if (!r) return false;
    const next = fn(study.normalizeStudy(r.node.study));
    this._snapshot();
    r.node.study = next;
    return true;
  }
  setExam(exam) {
    if (exam !== null && (!exam || !study.isDateStr(exam.date))) throw new Error('Data da prova inválida.');
    this._snapshot();
    if (exam === null) delete this.meta.exam; else this.meta.exam = { name: String(exam.name || '').slice(0, 120), date: exam.date };
    return true;
  }

  // --- PDFs vinculados e referências de trechos (core/pdfrefs.js) ---
  /** Registra um PDF no mapa (mesmo caminho = mesmo registro). */
  addPdf({ name, path: p }) {
    if (!p || typeof p !== 'string') throw new Error('Caminho do PDF inválido.');
    const cur = (this.meta.pdfs || []).find((x) => x.path.toLowerCase() === p.toLowerCase());
    if (cur) return cur;
    this._snapshot();
    const pdf = { id: newId().slice(0, 16), name: String(name || '').slice(0, 200) || pdfrefs.baseName(p), path: p.slice(0, 1000) };
    (this.meta.pdfs = this.meta.pdfs || []).push(pdf);
    return pdf;
  }
  /** Aponta um PDF registrado para outro arquivo (outro computador, arquivo movido). */
  relinkPdf(id, p) {
    const pdf = (this.meta.pdfs || []).find((x) => x.id === id);
    if (!pdf || !p || typeof p !== 'string') return false;
    this._snapshot(); pdf.path = p.slice(0, 1000);
    return true;
  }
  /** Anexa uma referência (PDF, página, trecho e retângulos) a um tópico. */
  addRef(nodeId, ref) {
    const r = this.find(nodeId); if (!r) return false;
    const clean = pdfrefs.sanitizeRefs([ref])[0];
    if (!clean) throw new Error('Referência de PDF inválida.');
    if (!(this.meta.pdfs || []).some((x) => x.id === clean.pdf)) throw new Error('O PDF da referência não está registrado no mapa.');
    this._snapshot();
    (r.node.refs = r.node.refs || []).push(clean);
    return true;
  }
  removeRef(nodeId, index) {
    const r = this.find(nodeId);
    if (!r || !Array.isArray(r.node.refs) || !r.node.refs[index]) return false;
    this._snapshot(); r.node.refs.splice(index, 1);
    if (!r.node.refs.length) delete r.node.refs;
    return true;
  }

  /** Metas semanais (minutos e questões em 7 dias). null ou zeros = sem metas. */
  setGoals(goals) {
    if (goals !== null && (typeof goals !== 'object')) throw new Error('Metas inválidas.');
    const g = goals === null ? null : study.sanitizeGoals(goals);
    if (goals && !g && (goals.minutesWeek || goals.questionsWeek)) throw new Error('Informe números inteiros positivos (horas por semana e/ou questões por semana).');
    this._snapshot();
    if (g) this.meta.goals = g; else delete this.meta.goals;
    return true;
  }

  update(id, patch) {
    const r = this.find(id);
    if (!r) return false;
    this._snapshot();
    const { style, ...rest } = patch;
    Object.assign(r.node, rest);
    if (style) r.node.style = { ...r.node.style, ...style };
    return true;
  }

  /** Move `id` para ser filho de `newParentId` na posição `index`. Impede ciclos. */
  move(id, newParentId, index) {
    const r = this.find(id);
    const np = this.find(newParentId);
    if (!r || !np || !r.parent) return false;
    if (this.find(newParentId, r.node)) return false; // destino dentro do próprio subtree
    this._snapshot();
    r.parent.children.splice(r.parent.children.indexOf(r.node), 1);
    const i = index == null ? np.node.children.length : Math.min(index, np.node.children.length);
    np.node.children.splice(i, 0, r.node);
    return true;
  }

  toJSON() {
    return { meta: this.meta, root: this.root };
  }
  static fromJSON(j) {
    return new MindMap(j.root, j.meta);
  }
}

module.exports = { MindMap, createNode, newId };

