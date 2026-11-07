'use strict';
const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const core = path.join(__dirname, '..', 'core');
const { MindMap, createNode } = require(path.join(core, 'model'));
const { readMom, writeMom } = require(path.join(core, 'mom'));
const { layoutMap, textWidth } = require(path.join(core, 'layout'));
const { isFlow } = require(path.join(core, 'flow'));   // fluxograma: o documento muda de visão (flow-ui.js)
const { toSVG, renderGroup } = require(path.join(core, 'svg'));
const { THEMES } = require(path.join(core, 'themes'));

const $ = (s) => document.querySelector(s);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const svg = $('#svg'), view = $('#view'), editor = $('#editor'), notes = $('#notes'), stage = $('#stage');

const { MARKERS } = require(path.join(core, 'markers'));

const { backupBefore, backupDirFor, listBackups } = require(path.join(core, 'backup'));
const { logError } = require(path.join(core, 'errorlog'));

let map, filePath = null, dirty = false, selectedId = null, selectedRel = null, L = null;
let selIds = new Set();     // seleção múltipla; selectedId é sempre o "primário" e pertence ao conjunto
let rev = 0;                // contador de alterações (usado pelo autosave)
let graphOpen = false;      // rede de conhecimento aberta (ver graph-ui.js)
let relateFrom = null;      // modo "criar relação": id do tópico de origem
let hits = null;            // Set de ids encontrados pela busca
let pan = { x: 0, y: 0, k: 1 };
// zoom escolhido pelo usuário: enquanto for falso, o mapa é reajustado à área visível a cada mudança de layout
let userZoomed = false;
let notesOwner = null;      // { rel: bool, id } — a quem pertence o texto exibido no painel lateral

// ---------- ciclo de vida ----------
function newMap() {
  beginTab(true);   // mapa novo sempre abre aba própria
  if (typeof closeHome === 'function') closeHome();
  selectedRel = null; relateFrom = null; hits = null; selIds = new Set(); document.body.classList.remove('relating');
  const root = createNode('Ideia central');
  map = new MindMap(root, { name: 'Novo mapa', theme: $('#theme').value || 'ocean' });
  ['Tópico 1', 'Tópico 2', 'Tópico 3'].forEach((t) => map.addChild(root.id, t));
  map._undo.length = 0;
  filePath = null; dirty = false; selectedId = root.id;
  render(); fit();
}

function setStatus(msg) { $('#status').textContent = msg; }

/** Quantos tópicos existem abaixo de `node` (todos os níveis). */
function descendantCount(node) { let n = 0; for (const c of node.children) n += 1 + descendantCount(c); return n; }
function render() {
  if (map && isFlow(map) && typeof flowRender === 'function') { flowMode(true); flowRender(); flowTail(selectedId && map.find(selectedId)); return; }   // fluxograma: visão própria (flow-ui.js)
  if (typeof flowMode === 'function') flowMode(false);
  L = layoutMap(map);
  // Tópicos soltos do Mindomo: à direita do mapa, em moldura tracejada e só para leitura (para trazê-los: Editar → Trazer tópicos soltos)
  L.floats = placeFloating();
  // As caixas dos soltos entram no mesmo desenho: clicáveis e editáveis no lugar (a estrutura no arquivo não muda)
  for (const { fl, dx, dy } of L.floats) {
    for (const b of fl.boxes.values()) { b.x += dx; b.y += dy; L.boxes.set(b.id, b); }
    L.edges.push(...fl.edges);
  }
  // a seleção pode ter desaparecido (desfazer/refazer, exclusão, restaurar versão): volta para a raiz em vez de ficar apontando para o nada
  if (selectedId && !map.find(selectedId)) { selectedId = map.root.id; selIds = new Set([selectedId]); }
  if (selectedRel && !map.meta.relations.some((r) => r.id === selectedRel)) selectedRel = null;
  if (selectedId && !L.boxes.has(selectedId)) {      // o tópico selecionado ficou escondido por um ramo recolhido: seleciona o ancestral visível mais próximo
    const trail = [];
    (function dfs(n) { if (n.id === selectedId) return true; trail.push(n); for (const c of n.children) if (dfs(c)) return true; trail.pop(); return false; })(map.root);
    const vis = trail.reverse().find((n) => L.boxes.has(n.id)) || map.root;
    selectedId = vis.id; selIds = new Set([vis.id]);
  }
  // selectedId manda: se foi trocado por outro código, descarta a seleção múltipla antiga
  if (!selectedId) selIds = new Set(); else if (!selIds.has(selectedId)) selIds = new Set([selectedId]);
  for (const id of [...selIds]) if (!map.find(id)) selIds.delete(id);
  svg.setAttribute('font-family', L.theme.font);
  view.innerHTML = renderGroup(L, { selectedId, selectedIds: selIds, selectedRel, interactive: true, hits, logo: true });
  view.setAttribute('transform', `translate(${pan.x} ${pan.y}) scale(${pan.k})`);
  syncCustomTheme();
  $('#theme').value = map.meta.theme;
  const sel = selectedId && map.find(selectedId);
  const rel = selectedRel && map.meta.relations.find((r) => r.id === selectedRel);
  $('#sideTitle').textContent = $('#notesLabel').textContent = rel ? 'Rótulo da relação' : 'Notas';
  notes.disabled = !sel && !rel;
  if (document.activeElement !== notes) {
    notes.value = rel ? rel.label || '' : sel ? sel.node.notes : '';
    notesOwner = rel ? { rel: true, id: rel.id } : sel ? { rel: false, id: sel.node.id } : null;
  }
  if (typeof refreshNotesView === 'function') refreshNotesView();
  $('#progress').value = sel && sel.node.progress != null ? String(sel.node.progress) : '';
  document.title = `${dirty ? '• ' : ''}${map.root.title} — BRANIAC`;
  let count = 0; map.walk(() => count++);
  // na barra de status só o nome do arquivo (o caminho completo fica no tooltip): a área de trabalho é o que importa
  setStatus(`${count} tópicos · ${filePath ? path.basename(filePath) : 'sem arquivo'}`);
  { const st = $('#status'); if (st) st.title = filePath || ''; }
  ipcRenderer.send('dirty', dirty);
  syncChrome(sel);
  autosaveTick();
  window.dispatchEvent(new Event('mc:render'));          // quem precisa refletir o estado (ex.: botões da barra do tablet) escuta isto
}

// ---------- interface (barras e painéis) ----------
function syncChrome(sel) {
  if (typeof renderTabs === 'function') renderTabs();   // faixa de abas acompanha o mapa ativo
  $('#undoBtn').disabled = !(map && map.canUndo && map.canUndo());   // botões da barra superior seguem o histórico
  $('#redoBtn').disabled = !(map && map.canRedo && map.canRedo());
  $('#docTitle').textContent = (filePath ? path.basename(filePath) : map.root.title || 'Sem título');
  $('#dirtyDot').hidden = !dirty;
  const pct = Math.round(pan.k * 100);
  $('#zoom').value = Math.min(400, Math.max(10, pct)); $('#zoomVal').textContent = pct + '%';
  document.querySelectorAll('.theme-card').forEach((c) => c.classList.toggle('active', c.dataset.theme === map.meta.theme));
  const mk = sel ? sel.node.markers || [] : [];
  document.querySelectorAll('#markerChips .chip').forEach((c) => c.classList.toggle('active', mk.includes(c.dataset.marker)));
  const pv = sel && sel.node.progress != null ? String(sel.node.progress) : '';
  document.querySelectorAll('#progressChips .chip').forEach((c) => c.classList.toggle('active', c.dataset.value === pv));
  const fillIn = $('#fill'), shapeIn = $('#shape');
  if (sel && L && L.boxes.has(sel.node.id)) {   // L pode não existir ainda (fluxograma aberto antes de qualquer mapa desenhado)
    const st = L.boxes.get(sel.node.id).style;
    if (/^#[0-9a-f]{6}$/i.test(st.fill)) fillIn.value = st.fill;
    shapeIn.value = sel.node.style.shape || '';
    $('#align').value = sel.node.style.align || 'auto';
  }
  buildOutline();
  if (typeof syncLinks === 'function') syncLinks();    // graph-ui.js
  if (typeof syncNodeBar === 'function') syncNodeBar();   // barra flutuante do tópico selecionado (node-bar.js)
  if (typeof syncContextUI === 'function') syncContextUI(); // context-ui.js (barra de opções e rail)
  document.dispatchEvent(new Event('mc:render'));     // painéis React (leitor de PDF, fontes) se atualizam
}

let outlineSig = '';
$('#outline').addEventListener('click', (e) => {
  const tog = e.target.closest('[data-ol-tog]');
  if (tog) { const id = tog.dataset.olTog; const s = map.find(id); if (s) change(() => map.update(id, { collapsed: !s.node.collapsed })); return; }
  const row = e.target.closest('.ol-row');
  if (!row) return;
  commitNotes();
  selectedId = row.dataset.olId; selectedRel = null; render();
  const b = L.boxes.get(selectedId); // se o tópico está fora da tela, centraliza
  if (b) {
    const r = svg.getBoundingClientRect(), sx = (b.x + b.w / 2) * pan.k + pan.x, sy = (b.y + b.h / 2) * pan.k + pan.y;
    if (sx < 20 || sy < 20 || sx > r.width - 20 || sy > r.height - 20) centerOn(selectedId);
  }
});
/** Mostra um painel lateral por vez (abas). Lembra a última aba usada. */
function showPanel(name) {
  if (typeof expandPanels === 'function') expandPanels();          // quem pede uma aba precisa ver o painel (layout-ui.js)
  if (!document.querySelector('.panel[data-panel="' + name + '"]')) name = 'props';
  document.querySelectorAll('#panels .panel').forEach((p) => { p.hidden = p.dataset.panel !== name; });
  document.querySelectorAll('#ptabs .ptab').forEach((b) => { const on = b.dataset.tab === name; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
  try { localStorage.setItem('mc-tab', name); } catch { /* sem storage */ }
}
document.querySelectorAll('#ptabs .ptab').forEach((b) => b.addEventListener('click', () => { showPanel(b.dataset.tab); b.blur(); }));
{ let t = 'props'; try { t = localStorage.getItem('mc-tab') || 'props'; } catch { /* sem storage */ } if (!['props', 'notes', 'links', 'outline'].includes(t)) t = 'props'; showPanel(t); }

/** Grava no modelo o texto do painel (notas/rótulo) para o dono ORIGINAL, mesmo que a seleção já tenha mudado. */
function commitNotes() {
  if (!notesOwner || !map) { notesOwner = null; return; }   // sem mapa aberto (CSV importado da tela inicial) não há o que gravar
  const o = notesOwner;
  if (o.rel) {
    const r = map.meta.relations.find((x) => x.id === o.id);
    if (r && (r.label || '') !== notes.value) change(() => map.updateRelation(o.id, { label: notes.value }));
  } else {
    const s = map.find(o.id);
    if (s && (s.node.notes || '') !== notes.value) change(() => map.update(o.id, { notes: notes.value }));
  }
}

function change(fn) {
  let r;
  try { r = fn(); }
  catch (e) {   // limite de profundidade: aviso claro, nada muda (o lote já foi revertido)
    if (!/^Profundidade máxima/.test(e && e.message)) throw e;
    render(); setStatus(e.message); return null;   // render() reescreve a barra de status: o aviso vem depois
  }
  if (r !== false && r !== null) { dirty = true; rev++; }
  render(); return r;
}

/** Pergunta o que fazer com alterações pendentes. Retorna true se pode prosseguir. */
async function confirmDiscard() {
  commitNotes();
  if (!dirty) return true;
  const c = await ipcRenderer.invoke('dialog:confirm-discard');
  if (c === 0) return (await save(false)) !== false;
  return c === 1;
}

/** Se o tópico está fora da área visível (ou colado na borda), desloca o mapa o mínimo necessário para mostrá-lo. */
function reveal(id, margin = 70) {
  const b = L.boxes.get(id); if (!b) return false;
  const r = svg.getBoundingClientRect();
  const x1 = b.x * pan.k + pan.x, x2 = (b.x + b.w) * pan.k + pan.x, y1 = b.y * pan.k + pan.y, y2 = (b.y + b.h) * pan.k + pan.y;
  let dx = 0, dy = 0;
  if (x1 < margin) dx = margin - x1; else if (x2 > r.width - margin) dx = Math.min(0, r.width - margin - x2);
  if (y1 < margin) dy = margin - y1; else if (y2 > r.height - margin) dy = Math.min(0, r.height - margin - y2);
  if (!dx && !dy) return false;
  pan.x += dx; pan.y += dy; render();
  return true;
}

/** Cada tópico solto é desenhado à parte (layout próprio) e colocado à direita da árvore principal, empilhado de cima para baixo. */
function placeFloating() {
  const list = (map && map.meta._momFloating) || [];
  const out = [];
  let y = L.bounds.y;
  const x0 = L.bounds.x + L.bounds.w + 140;
  for (const f of list) {
    const fl = layoutMap({ root: f.node, meta: map.meta });
    out.push({ fl, dx: x0 - fl.bounds.x, dy: y - fl.bounds.y });
    y += fl.bounds.h + 80;
  }
  return out;
}

function fit() {
  if (typeof flowIsOn === 'function' && flowIsOn()) return flowFit();   // fluxograma: ajusta a própria visão
  userZoomed = false;   // ajustar devolve o zoom ao modo automático (acompanha a área visível)
  const r = svg.getBoundingClientRect();
  // enquadra a árvore principal e os tópicos soltos (se houver)
  let { x, y, w, h } = L.bounds;
  for (const { fl, dx, dy } of L.floats || []) {
    const x1 = Math.min(x, fl.bounds.x + dx - 12), y1 = Math.min(y, fl.bounds.y + dy - 12);
    const x2 = Math.max(x + w, fl.bounds.x + dx + fl.bounds.w + 12), y2 = Math.max(y + h, fl.bounds.y + dy + fl.bounds.h + 12);
    x = x1; y = y1; w = x2 - x1; h = y2 - y1;
  }
  const raw = Math.min((r.width * 0.92) / w, (r.height * 0.92) / h, 1.5); // folga em volta da prancheta
  pan.k = Math.max(0.08, raw);   // enquadra o mapa INTEIRO na tela (mesmo grande); só abaixo de 8% centraliza a raiz
  if (raw < 0.08) {
    const rb = L.boxes.get(map.root.id);
    pan.x = r.width / 2 - (rb.x + rb.w / 2) * pan.k; pan.y = r.height / 2 - (rb.y + rb.h / 2) * pan.k;
  } else {
    pan.x = (r.width - w * pan.k) / 2 - x * pan.k;
    pan.y = (r.height - h * pan.k) / 2 - y * pan.k;
  }
  render();
}

// ---------- arquivos ----------
/** Mapa grande abre organizado: se há muitos tópicos visíveis, os ramos mais profundos são recolhidos para caber na tela.
    É uma ação desfazível (Ctrl+Z) e o mapa passa a constar como alterado, para você saber que mudou algo. */
const AUTO_ORGANIZE_LIMIT = 120;

function autoOrganize() {
  const visible = (n) => 1 + (n.collapsed ? 0 : n.children.reduce((s, c) => s + visible(c), 0));
  if (!map || visible(map.root) <= AUTO_ORGANIZE_LIMIT) return false;
  const level = change(() => map.autoLevels(AUTO_ORGANIZE_LIMIT) || false);
  if (level) setStatus(`Mapa grande: os ramos mais profundos foram recolhidos para caber na tela (nível ${level}). Ctrl+Z desfaz.`);
  return !!level;
}
async function openPath(p, { silent = false } = {}) {
  try {
    const already = tabIndexOfPath(p);
    if (already >= 0) { switchTab(already); return true; }   // arquivo já aberto em outra aba: só vai até ela
    const loaded = readMom(fs.readFileSync(p));
    beginTab();   // o mapa atual continua na sua aba (com alterações, se houver)
    map = loaded;
    filePath = p; dirty = false; selectedId = map.root.id; selIds = new Set(); selectedRel = null; hits = null; rev++;
    if (typeof closeHome === 'function') closeHome();
    render(); autoOrganize(); fit();
    // tópicos soltos do Mindomo: avisa na barra de status (o bloco fica à direita do mapa)
    const soltos = (map.meta._momFloating || []).length;
    if (soltos) setStatus(`${soltos} tópico(s) solto(s) do Mindomo à direita do mapa. Editar → Trazer tópicos soltos para o mapa.`);
    ipcRenderer.invoke('recent:add', p).catch(() => {});
    return true;
  } catch (e) {
    logOnly('Não foi possível abrir ' + p + ': ' + e.message);   // falha esperada (arquivo ruim): só no registro, sem console.error
    if (silent) setStatus('Não reabri o último mapa: ' + e.message); else ipcRenderer.invoke('dialog:error', 'Não foi possível abrir: ' + e.message);
    return false;
  }
}
/** Caminho inicial do "Salvar como": pasta do arquivo atual (ou a última usada) + nome sugerido. O diálogo do sistema deixa mudar nome e pasta. */
function saveDefaultPath(name) {
  try { const dir = filePath ? path.dirname(filePath) : loadCfg().lastSaveDir; if (dir && fs.existsSync(dir)) return path.join(dir, name); } catch { /* sem pasta: só o nome */ }
  return name;
}
const rememberSaveDir = (target) => { try { if (typeof target === 'string' && target) saveCfg({ lastSaveDir: path.dirname(target) }); } catch { /* preferência é opcional */ } };
/** Retorna true se salvou, false se cancelou ou falhou. A gravação é atômica (writeMom: temporário + renomear). */
async function save(as) {
  commitNotes();
  let target = filePath;
  if (!target || as) {
    target = await ipcRenderer.invoke('dialog:save', saveDefaultPath((map.root.title || 'mapa') + '.mom'));
    if (!target) return false;
    if (!/\.mom$/i.test(target)) target += '.mom';
  }
  const r0 = rev;                                          // se o mapa mudar enquanto espera a gravação, continua "alterado"
  try {
    map.meta.name = map.root.title;
    if (userDataDir) { try { backupBefore(target, path.join(userDataDir, 'backups')); } catch (e) { report('Backup falhou (o salvamento continua): ' + e.message); } }   // guarda a versão anterior
    writeMom(map, target);
  } catch (e) { ipcRenderer.invoke('dialog:error', 'Falha ao salvar: ' + e.message); return false; }
  filePath = target; if (rev === r0) dirty = false; render(); rememberSaveDir(target);
  ipcRenderer.invoke('recent:add', target).catch(() => {});
  if (typeof autoObsidian === 'function') autoObsidian();   // o Obsidian acompanha o que foi salvo (falha não afeta o salvamento)
  return true;
}

// ---------- ações de edição ----------
const sel = () => selectedId && map.find(selectedId);
const act = {
  child() { const s = sel(); if (!s) return; const n = change(() => map.addChild(s.node.id)); if (!n) return; selectedId = n.id; render(); reveal(n.id); startEdit(); },
  sibling() { const s = sel(); if (!s) return; const n = s.parent ? change(() => map.addSibling(s.node.id)) : change(() => map.addChild(s.node.id)); if (!n) return; selectedId = n.id; render(); reveal(n.id); startEdit(); },
  moveUp() { reshape('moveSibling', -1, 'Já é o primeiro tópico deste nível.'); },
  moveDown() { reshape('moveSibling', +1, 'Já é o último tópico deste nível.'); },
  indent() { reshape('indent', undefined, 'Não há irmão acima para receber este tópico como filho.'); },
  outdent() { reshape('outdent', undefined, 'Este tópico já está no primeiro nível (disciplina): não dá para subir mais.'); },
  relate() {
    if (relateFrom) return cancelRelate();
    if (!sel()) return setStatus('Selecione o tópico de origem primeiro.');
    relateFrom = selectedId; document.body.classList.add('relating');
    setStatus('Relação: clique no tópico de destino (Esc cancela).');
  },
  delete() {
    if (selectedRel) { const id = selectedRel; selectedRel = null; return change(() => map.removeRelation(id)); }
    const s = sel(); if (!s) return;
    const ids = targets();
    // tópico solto (veio do Mindomo, sem pai na árvore): excluído com o que está dentro dele, em uma ação desfazível
    if (ids.length === 1 && (map.meta._momFloating || []).some((f) => f.node.id === s.node.id)) {
      change(() => map.removeFloating(s.node.id));
      selectedId = null; selIds = new Set(); render();
      return setStatus('Tópico solto excluído, com o que estava dentro dele. Ctrl+Z desfaz.');
    }
    const keep = ids.length > 1 ? (map.topLevel(ids)[0] && map.find(map.topLevel(ids)[0].id).parent) : s.parent; // quem fica selecionado
    if (!keep) return setStatus((map.meta._momFloating || []).some((f) => f.node.id === s.node.id) ? 'Este tópico está solto (veio do Mindomo): traga-o para o mapa em Editar → Trazer tópicos soltos antes de excluir.' : 'A raiz do mapa não pode ser excluída.');
    selectedId = keep.id;
    change(() => map.removeMany(ids));
    setStatus(ids.length > 1 ? `${ids.length} tópicos excluídos (Ctrl+Z desfaz tudo de uma vez)` : '');
  },
  undo() { commitNotes(); if (map.undo()) { dirty = true; rev++; selectedRel = null; render(); } },
  redo() { if (map.redo()) { dirty = true; rev++; selectedRel = null; render(); } },
  fit,
  bold() { const s = sel(); if (s) { const v = !(s.node.style.bold ?? (L.boxes.get(s.node.id) || { style: {} }).style.bold); change(() => map.updateMany(targets(), { style: { bold: v } })); } },
  /** Recolhe ou expande o ramo do tópico selecionado (Espaço; botão ⊟/⊞ da barra do tablet). Sempre diz o que fez ou por que não pôde. */
  toggle() {
    const s = sel();
    if (!s) return setStatus('Selecione um tópico para recolher ou expandir o ramo dele.');
    if (!s.node.children.length) return setStatus('Este tópico não tem subtópicos para recolher.');
    const v = !s.node.collapsed, ids = targets().filter((id) => map.find(id) && map.find(id).node.children.length), hidden = ids.reduce((n, id) => n + descendantCount(map.find(id).node), 0);
    change(() => map.updateMany(ids, { collapsed: v }));
    setStatus(v ? `Ramo recolhido: ${hidden} subtópico(s) escondido(s). Toque de novo para expandir.` : 'Ramo expandido.');
  },
  /** Traz os tópicos soltos do Mindomo para o mapa, como filhos da raiz. Um único Ctrl+Z desfaz tudo. */
  attachFloating() {
    const list = (map.meta._momFloating || []).slice();
    if (!list.length) return setStatus('Não há tópicos soltos neste mapa.');
    try {
      change(() => map.batch(() => { for (const f of list) map.addSubtree(map.root.id, f.node); delete map.meta._momFloating; return true; }));
      setStatus(`${list.length} tópico(s) solto(s) trazido(s) para o mapa. Ctrl+Z desfaz.`);
    } catch (e) { setStatus(e.message || 'Não foi possível trazer os tópicos soltos.'); }
  },
};
/** Reordena/muda o nível do tópico selecionado (um por vez; uma ação desfazível). */
function reshape(method, arg, failMsg) {
  const s = sel(); if (!s) return;
  if (selIds.size > 1) return setStatus('Selecione um único tópico para reordenar ou mudar de nível.');
  const id = s.node.id;
  if (change(() => map[method](id, arg) || false)) { reveal(id); setStatus(''); } else setStatus(failMsg);
}
/** Alvos das ações de formatação: todos os selecionados, ou só o primário. */
const targets = () => (selIds.size ? [...selIds] : selectedId ? [selectedId] : []);
document.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => { b.blur(); act[b.dataset.act](); }));

function cancelRelate() { relateFrom = null; document.body.classList.remove('relating'); render(); }

$('#marker').add(new Option('＋', ''));
for (const [id, m] of Object.entries(MARKERS)) $('#marker').add(new Option(`${m.glyph}  ${m.label}`, id));
$('#marker').addEventListener('change', (e) => {
  const s = sel(); if (s && e.target.value) change(() => map.toggleMarkerMany(targets(), e.target.value));
  e.target.value = '';
});
$('#progress').addEventListener('change', (e) => {
  const s = sel(); if (s) change(() => map.updateMany(targets(), { progress: e.target.value === '' ? null : +e.target.value }));
});

// ---------- busca ----------
let hitList = [], hitIdx = -1;
$('#search').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  hitList = [];
  if (q) map.walk((n) => { if (n.title.toLowerCase().includes(q) || (n.notes || '').toLowerCase().includes(q)) hitList.push(n.id); });
  hits = q ? new Set(hitList) : null; hitIdx = -1;
  render();
  // tópicos soltos do Mindomo não entram na navegação da árvore; a barra de status diz quantos casam com a busca
  let soltos = 0;
  if (q) for (const f of map.meta._momFloating || []) (function walk(n) { if (n.title.toLowerCase().includes(q) || (n.notes || '').toLowerCase().includes(q)) soltos++; n.children.forEach(walk); })(f.node);
  const extra = soltos ? ` · ${soltos} em tópicos soltos à direita (Editar → Trazer tópicos soltos)` : '';
  setStatus(q ? `${hitList.length} resultado(s) — Enter vai para o próximo${extra}` : '');
});
$('#search').addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { e.target.value = ''; e.target.dispatchEvent(new Event('input')); e.target.blur(); }
  if (e.key !== 'Enter' || !hitList.length) return;
  hitIdx = (hitIdx + 1) % hitList.length;
  // se o resultado está dentro de um ramo recolhido, expande o caminho até ele
  const path = []; (function find(n, acc) { if (n.id === hitList[hitIdx]) { path.push(...acc); return true; } return n.children.some((c) => find(c, [...acc, n])); })(map.root, []);
  const closed = path.filter((n) => n.collapsed);
  if (closed.length) closed.forEach((n) => { n.collapsed = false; });
  selectedId = hitList[hitIdx]; selectedRel = null; render(); centerOn(selectedId);
});

// ---------- navegação ----------
function centerOn(id, k) {
  const b = L.boxes.get(id); if (!b) return;
  const r = svg.getBoundingClientRect();
  if (k) pan.k = k;
  pan.x = r.width / 2 - (b.x + b.w / 2) * pan.k; pan.y = r.height / 2 - (b.y + b.h / 2) * pan.k;
  render();
}

for (const [id, t] of Object.entries(THEMES)) {
  $('#theme').add(new Option(t.name, id));
  const card = document.createElement('button');
  card.className = 'theme-card'; card.dataset.theme = id; card.title = t.name;
  const sw = document.createElement('div'); sw.className = 'sw'; sw.style.background = t.background;
  for (const c of t.branches.slice(0, 4)) { const i = document.createElement('i'); i.style.background = c; sw.append(i); }
  const lb = document.createElement('span'); lb.textContent = t.name.replace(/ \(.*\)/, '');
  card.append(sw, lb);
  card.addEventListener('click', () => { $('#theme').value = id; $('#theme').dispatchEvent(new Event('change')); card.blur(); });
  $('#themeGrid').append(card);
}
$('#theme').addEventListener('change', (e) => change(() => { map.meta.theme = e.target.value; }));

/** Mapas importados do Mindomo trazem o tema original (map.meta.customTheme): ele aparece como mais uma opção, só nesses mapas. */
function syncCustomTheme() {
  let opt = $('#theme').querySelector('option[value="custom"]'), card = document.querySelector('.theme-card[data-theme="custom"]');
  if (!opt) { opt = new Option('Original do arquivo', 'custom'); $('#theme').add(opt); }
  if (!card) {
    card = document.createElement('button'); card.className = 'theme-card'; card.dataset.theme = 'custom';
    const sw = document.createElement('div'); sw.className = 'sw'; const lb = document.createElement('span'); card.append(sw, lb);
    card.addEventListener('click', () => { $('#theme').value = 'custom'; $('#theme').dispatchEvent(new Event('change')); card.blur(); });
    $('#themeGrid').prepend(card);
  }
  const ct = map && map.meta.customTheme;
  opt.hidden = opt.disabled = card.hidden = !ct;
  if (ct) {
    opt.textContent = card.title = ct.name; card.querySelector('span').textContent = 'Original';
    const sw = card.querySelector('.sw'); sw.style.background = ct.background; sw.textContent = '';
    for (const c of ct.branches.slice(0, 4)) { const i = document.createElement('i'); i.style.background = c; sw.append(i); }
  }
}

// chips de marcador (alternam) e de progresso (segmentado); os <select> ocultos continuam sendo a fonte da ação
for (const [id, m] of Object.entries(MARKERS)) {
  const b = document.createElement('button');
  b.className = 'chip'; b.dataset.marker = id; b.title = m.label;
  const d = document.createElement('span'); d.className = 'dot'; d.style.background = m.color; d.textContent = m.glyph;
  b.append(d);
  b.addEventListener('click', () => { $('#marker').value = id; $('#marker').dispatchEvent(new Event('change')); b.blur(); });
  $('#markerChips').append(b);
}
for (const [v, label] of [['', '—'], ['0', '0%'], ['25', '25%'], ['50', '50%'], ['75', '75%'], ['100', '100%']]) {
  const b = document.createElement('button');
  b.className = 'chip'; b.dataset.value = v; b.textContent = label; b.title = v === '' ? 'Sem barra de progresso' : `Progresso ${label}`;
  b.addEventListener('click', () => { $('#progress').value = v; $('#progress').dispatchEvent(new Event('change')); b.blur(); });
  $('#progressChips').append(b);
}

// zoom pela barra de status (mantém o centro da vista)
function zoomTo(k) {
  userZoomed = true;
  const r = svg.getBoundingClientRect(), cx = r.width / 2, cy = r.height / 2;
  k = Math.min(4, Math.max(0.1, k));
  pan.x = cx - ((cx - pan.x) / pan.k) * k; pan.y = cy - ((cy - pan.y) / pan.k) * k; pan.k = k;
  render();
}
$('#zoom').addEventListener('input', (e) => zoomTo(+e.target.value / 100));
$('#zoomIn').addEventListener('click', () => zoomTo(pan.k * 1.2));
$('#zoomOut').addEventListener('click', () => zoomTo(pan.k / 1.2));

// tema claro/escuro da interface (preferência por usuário)
// Tema da INTERFACE (barras, painéis, botões): escuro, claro ou desenho à mão. É independente do tema do mapa.
const UI_THEMES = {
  dark: { label: 'Escuro', icon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>' },
  light: { label: 'Claro', icon: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>' },
  draw: { label: 'Desenho (à mão)', icon: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>' },
  pixel: { label: 'Pixel (8 bits)', icon: '<path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM16 10h4v4h-4zM4 16h4v4H4zM16 16h4v4h-4z"/>' },
};
function uiThemeGet() {
  try {
    const v = localStorage.getItem('mc-ui-theme');
    if (UI_THEMES[v]) return v;
    if (localStorage.getItem('mc-light') === '1') return 'light';   // preferência antiga (claro/escuro)
  } catch { /* sem storage */ }
  return 'dark';
}
function setUiTheme(name) {
  if (!UI_THEMES[name]) name = 'dark';
  document.body.classList.toggle('light', name === 'light');
  document.body.classList.toggle('ui-draw', name === 'draw');
  document.body.classList.toggle('ui-pixel', name === 'pixel');
  try { localStorage.setItem('mc-ui-theme', name); } catch { /* sem storage */ }
  const b = $('#lightToggle');
  if (b) {
    b.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${UI_THEMES[name].icon}</svg>`;
    b.title = `Tema da interface: ${UI_THEMES[name].label}. Clique para trocar`; b.setAttribute('aria-label', b.title);
  }
  const sel = $('#uiTheme'); if (sel) sel.value = name;
}
setUiTheme(uiThemeGet());
$('#lightToggle').addEventListener('click', () => { const keys = Object.keys(UI_THEMES); setUiTheme(keys[(keys.indexOf(uiThemeGet()) + 1) % keys.length]); });
$('#uiTheme').addEventListener('change', (e) => setUiTheme(e.target.value));
$('#fill').addEventListener('input', (e) => { const s = sel(); if (s) change(() => map.updateMany(targets(), { style: { fill: e.target.value, color: contrast(e.target.value) } })); });
$('#shape').addEventListener('change', (e) => { const s = sel(); if (s) change(() => map.updateMany(targets(), { style: { shape: e.target.value || undefined } })); });
$('#align').addEventListener('change', (e) => { const s = sel(); if (s) change(() => map.updateMany(targets(), { style: { align: e.target.value } })); });
// Níveis: recolhe/expande por profundidade (essencial em editais com centenas de tópicos); uma ação desfazível
$('#levelSel').addEventListener('change', (e) => {
  const v = e.target.value; e.target.value = '';
  if (v === '') return;
  const n = v === 'all' ? Infinity : +v;
  const changed = change(() => map.showLevels(n) || false);
  fit();
  setStatus(changed ? `${changed} ramo(s) ${n === Infinity ? 'expandido(s)' : 'recolhido(s)/expandido(s)'}` : 'Os níveis já estavam assim.');
});
// o painel edita o rótulo quando uma relação está selecionada; senão, as notas do tópico
notes.addEventListener('change', commitNotes);
notes.addEventListener('blur', () => { commitNotes(); render(); }); // re-render: o painel passa a mostrar a nova seleção

function contrast(hex) {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#111111' : '#ffffff';
}

// ---------- edição inline ----------
function startEdit() {
  const s = sel(); if (!s) return;
  const b = L.boxes.get(s.node.id); if (!b) return;
  const w = Math.max(b.w * pan.k, 120);
  editor.hidden = false;
  editor.value = s.node.title;
  editBase = { cx: (b.x + b.w / 2) * pan.k + pan.x, top: b.y * pan.k + pan.y, minW: w, size: Math.max(12, b.style.size * pan.k), bold: !!b.style.bold };
  Object.assign(editor.style, {
    left: `${(b.x + b.w / 2) * pan.k + pan.x - w / 2}px`, top: `${b.y * pan.k + pan.y}px`,
    width: `${w}px`, height: `${Math.max(b.h * pan.k, 30)}px`, fontSize: `${Math.max(12, b.style.size * pan.k)}px`,
  });
  fitEditor(); editor.focus(); editor.select();
}
/** O campo cresce com o texto (senão a 1ª linha some quando o título quebra em várias). */
let editBase = null;
function fitEditor() {
  const sw = stage.clientWidth, sh = stage.clientHeight;
  if (editBase) { // alarga até a largura máxima de um tópico (como o layout quebra o texto) e mantém o campo dentro da área visível
    const texto = Math.max(...editor.value.split('\n').map((l) => textWidth(l, editBase.size, editBase.bold)));
    const w = Math.min(sw - 16, Math.max(editBase.minW, Math.min(260 * pan.k + 28, texto + 36)));
    editor.style.width = w + 'px';
    editor.style.left = Math.max(8, Math.min(editBase.cx - w / 2, sw - w - 8)) + 'px';
  }
  editor.style.height = 'auto';
  const borda = editor.offsetHeight - editor.clientHeight; // border-box: a altura precisa incluir as bordas, senão sobram 2 px de rolagem
  const h = Math.max(30, editor.scrollHeight + borda);
  editor.style.height = h + 'px';
  if (editBase) editor.style.top = Math.max(8, Math.min(editBase.top, sh - h - 8)) + 'px';
}
editor.addEventListener('input', fitEditor);
/** Depois que o teclado virtual aparece/some ou a tela gira: rola o mapa até o tópico em edição caber e reposiciona o campo de texto. */
function refitEditorToViewport() {
  if (editor.hidden || !selectedId || !L) return;
  reveal(selectedId, 90);                                                    // rola o mapa até o tópico caber na área visível
  const b = L.boxes.get(selectedId); if (!b) return;
  editBase = { cx: (b.x + b.w / 2) * pan.k + pan.x, top: b.y * pan.k + pan.y, minW: Math.max(b.w * pan.k, 120), size: Math.max(12, b.style.size * pan.k), bold: !!b.style.bold };
  editor.style.top = editBase.top + 'px'; fitEditor();                        // fitEditor mantém o campo dentro da área visível
}
/**
 * FACHADA para a camada de plataforma (platform/web/host: toque, teclado virtual). É a ÚNICA porta de entrada da plataforma no estado do mapa:
 * ela não enxerga pan/L/editBase diretamente. Ao mudar o que está aqui, rode test/e2e-tablet.js.
 */
window.MCView = {
  zoomAt: zoomMapAt, panBy(dx, dy) { pan.x += dx; pan.y += dy; render(); }, refitEditor: refitEditorToViewport,
  hasSelection() { return !!sel(); },
  isRoot() { const s = sel(); return !!(s && s.node.id === map.root.id); },
  /** Estado do ramo do tópico selecionado, para o botão recolher/expandir: { can, collapsed, count }. */
  branchState() { const s = sel(); return s && s.node.children.length ? { can: true, collapsed: !!s.node.collapsed, count: descendantCount(s.node) } : { can: false, collapsed: false, count: 0 }; },
};
function endEdit(commit) {
  if (editor.hidden) return;
  editor.hidden = true;
  const s = sel();
  if (commit && s && editor.value.trim() && editor.value !== s.node.title) change(() => map.update(s.node.id, { title: editor.value.trim() }));
  stage.focus();
}
editor.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); endEdit(true); }
  else if (e.key === 'Escape') endEdit(false);
  else if (e.key === 'Tab') { e.preventDefault(); endEdit(true); act.child(); }
  e.stopPropagation();
});
editor.addEventListener('blur', () => endEdit(true));

// ---------- mouse: seleção, pan, zoom, arrastar-e-soltar ----------
const nodeAt = (el) => el && el.closest && el.closest('.node');
let drag = null;
svg.addEventListener('mousedown', (e) => {
  if (document.activeElement === notes) commitNotes(); // o blur só ocorre depois do mousedown; grava antes de trocar a seleção
  if (handPan && e.button === 0) { drag = { sx: e.clientX, sy: e.clientY, ox: pan.x, oy: pan.y, id: null, moved: false, target: null, marquee: false, hand: true }; return; }   // ferramenta Mover: arrasta a vista mesmo sobre um tópico
  const n = nodeAt(e.target);
  if (relateFrom) { // segundo clique do modo relação
    const from = relateFrom;
    cancelRelate();
    if (n) {
      const r = change(() => map.addRelation(from, n.dataset.id));
      if (r) { selectedRel = r.id; selectedId = null; showPanel('notes'); render(); setTimeout(() => notes.focus(), 0); setStatus('Relação criada — digite um rótulo (opcional) no painel.'); } // adiado: o clique ainda vai mover o foco
      else setStatus('Relação inválida ou já existente.');
    }
    return;
  }
  if (n && e.target.closest && e.target.closest('.note-icon') && e.button === 0) { openNotesFor(n.dataset.id); return; }   // ícone de nota: abre a nota do tópico
  const badge = e.target.closest && e.target.closest('.fold-badge');   // botão do próprio tópico: expande (se recolhido) ou recolhe (se aberto)
  if (badge && e.button === 0) { const f = map.find(badge.dataset.fold); if (f) change(() => map.update(f.node.id, { collapsed: !f.node.collapsed })); return; }
  if (n && e.altKey && !e.ctrlKey && !e.metaKey) { linkDrag = { from: n.dataset.id, sx: e.clientX, sy: e.clientY, moved: false }; return; }   // Alt + arrastar: liga a outro tópico
  const rl = e.target.closest && e.target.closest('.rel');
  if (rl) { selectedRel = rl.dataset.rel; selectedId = null; showPanel('notes'); render(); return; }
  selectedRel = null;
  const additive = e.ctrlKey || e.metaKey || (e.shiftKey && !!n); // Shift no fundo = retângulo de seleção
  if (n && additive) { // Ctrl/Shift + clique: inclui ou retira o tópico da seleção
    const id = n.dataset.id;
    if (selIds.has(id)) { selIds.delete(id); selectedId = selIds.size ? [...selIds][selIds.size - 1] : null; }
    else { selIds.add(id); selectedId = id; }
    render(); drag = null; return;
  }
  drag = { sx: e.clientX, sy: e.clientY, ox: pan.x, oy: pan.y, id: n && n.dataset.id, moved: false, target: null, marquee: !n && e.shiftKey };
  if (n) {
    const id = n.dataset.id;
    if (selIds.has(id)) selectedId = id; // clique num já selecionado: mantém o grupo (pode ser o início de um arrasto)
    else { selIds = new Set([id]); selectedId = id; }
    render();
    // Duplo clique: o navegador NÃO emite `dblclick` porque o render() acima recria o DOM entre os cliques,
    // então detectamos pelo contador de cliques do próprio mousedown (adiado para depois do foco padrão).
    if (e.detail === 2) setTimeout(() => { if (selectedId === id) startEdit(); }, 0);
  }
});
let linkDrag = null;   // Alt + arrastar de um tópico até outro: cria a ligação (ver linkEnd)
function linkMove(e) {
  const d = linkDrag;
  if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 5) return;
  d.moved = true;
  const t = nodeAt(document.elementFromPoint(e.clientX, e.clientY));
  view.querySelectorAll('.link-target').forEach((el) => el.classList.remove('link-target'));
  const ok = !!t && t.dataset.id !== d.from;
  if (ok) t.classList.add('link-target');
  setStatus(ok ? 'Solte para ligar a este tópico (Esc cancela).' : 'Arraste até outro tópico para ligar (Esc cancela).');
}
function linkEnd(e) {
  const d = linkDrag; linkDrag = null;
  view.querySelectorAll('.link-target').forEach((el) => el.classList.remove('link-target'));
  if (!d.moved) { selectedId = d.from; selIds = new Set([d.from]); render(); return; }   // Alt + clique sem arrastar: só seleciona
  const t = nodeAt(document.elementFromPoint(e.clientX, e.clientY));
  if (!t || t.dataset.id === d.from) return setStatus('Nada ligado: solte sobre outro tópico.');
  const r = change(() => map.addRelation(d.from, t.dataset.id));
  if (!r) return setStatus('Esses tópicos já estão ligados.');
  selectedRel = r.id; selectedId = null; selIds = new Set(); showPanel('notes'); render();
  setStatus('Ligação criada. Digite um rótulo no painel, se quiser.');
}
window.addEventListener('mousemove', (e) => {
  if (linkDrag) { linkMove(e); return; }
  if (!drag) return;
  const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
  if (!drag.moved && Math.hypot(dx, dy) < 5) return;
  drag.moved = true;
  if (drag.marquee) { // retângulo de seleção
    const r = stage.getBoundingClientRect(), mq = $('#marquee');
    mq.hidden = false;
    Object.assign(mq.style, { left: `${Math.min(drag.sx, e.clientX) - r.left}px`, top: `${Math.min(drag.sy, e.clientY) - r.top}px`, width: `${Math.abs(dx)}px`, height: `${Math.abs(dy)}px` });
    return;
  }
  if (!drag.id) { pan.x = drag.ox + dx; pan.y = drag.oy + dy; view.setAttribute('transform', `translate(${pan.x} ${pan.y}) scale(${pan.k})`); svg.classList.add('panning'); return; }
  const t = nodeAt(document.elementFromPoint(e.clientX, e.clientY));
  if (!drag.hinted) { drag.hinted = true; setStatus('Solte na parte de CIMA ou de BAIXO de um tópico para reordenar (linha laranja); no MEIO, para torná-lo filho.'); }
  clearDropMarks();
  drag.target = t && t.dataset.id !== drag.id ? t.dataset.id : null; drag.mode = 'child';
  if (drag.target) {
    drag.mode = dropMode(drag.target, e.clientY);
    if (drag.mode === 'child') t.classList.add('drop'); else showDropLine(drag.target, drag.mode);
  }
});
/** Remove a marcação do alvo de soltar (contorno de "filho" e linha de "entre irmãos"). */
function clearDropMarks() { view.querySelectorAll('.drop').forEach((el) => el.classList.remove('drop')); const l = view.querySelector('#dropLine'); if (l) l.remove(); }
/**
 * Onde soltar em relação ao tópico-alvo, pela altura do ponteiro: 30% de cima = 'before' (irmão antes), 30% de baixo = 'after' (irmão depois),
 * meio = 'child'. A raiz não tem irmãos: sempre 'child'.
 */
function dropMode(targetId, clientY) {
  const r = map.find(targetId), b = L.boxes.get(targetId);
  if (!r || !r.parent || !b) return 'child';
  const top = svg.getBoundingClientRect().top + b.y * pan.k + pan.y, rel = (clientY - top) / Math.max(1, b.h * pan.k);
  return rel < 0.3 ? 'before' : rel > 0.7 ? 'after' : 'child';
}
/** Linha laranja entre os irmãos: mostra exatamente onde o tópico vai ficar. */
function showDropLine(targetId, mode) {
  const b = L.boxes.get(targetId); if (!b) return;
  const y = mode === 'before' ? b.y - 4 : b.y + b.h + 4, w = 3 / pan.k, ns = 'http://www.w3.org/2000/svg';
  const g = document.createElementNS(ns, 'g'); g.id = 'dropLine'; g.setAttribute('pointer-events', 'none');
  const ln = document.createElementNS(ns, 'line'); for (const [k, v] of Object.entries({ x1: b.x - 6, x2: b.x + b.w + 6, y1: y, y2: y, stroke: '#ff9800', 'stroke-width': w, 'stroke-linecap': 'round' })) ln.setAttribute(k, v);
  g.append(ln); for (const x of [b.x - 6, b.x + b.w + 6]) { const c = document.createElementNS(ns, 'circle'); for (const [k, v] of Object.entries({ cx: x, cy: y, r: 4 / pan.k, fill: '#ff9800' })) c.setAttribute(k, v); g.append(c); }
  view.append(g);
}
window.addEventListener('mouseup', (e) => {
  if (linkDrag) { linkEnd(e); return; }
  if (!drag) return;
  svg.classList.remove('panning');
  const d = drag; drag = null;
  if (d.marquee && d.moved) {
    $('#marquee').hidden = true;
    const r = svg.getBoundingClientRect();
    const x1 = Math.min(d.sx, e.clientX) - r.left, x2 = Math.max(d.sx, e.clientX) - r.left;
    const y1 = Math.min(d.sy, e.clientY) - r.top, y2 = Math.max(d.sy, e.clientY) - r.top;
    const ids = [...L.boxes.values()].filter((b) => {
      const bx1 = b.x * pan.k + pan.x, bx2 = (b.x + b.w) * pan.k + pan.x, by1 = b.y * pan.k + pan.y, by2 = (b.y + b.h) * pan.k + pan.y;
      return bx1 < x2 && bx2 > x1 && by1 < y2 && by2 > y1;
    }).map((b) => b.id);
    selIds = new Set(ids); selectedId = ids.length ? ids[ids.length - 1] : null;
    render(); setStatus(`${ids.length} tópico(s) selecionado(s)`);
    return;
  }
  clearDropMarks();
  if (d.moved && d.id && d.target) {
    const ids = selIds.has(d.id) ? [...selIds] : [d.id]; // arrastar um selecionado leva o grupo todo
    const beside = d.mode === 'before' || d.mode === 'after';
    const ok = change(() => (beside ? map.moveBeside(ids, d.target, d.mode) : map.moveMany(ids, d.target)));
    if (!ok) { if (ok === false) setStatus('Movimento inválido.'); } else setStatus(beside ? 'Tópico reposicionado.' : 'Tópico movido para dentro do tópico escolhido.');
  } else if (d.moved && d.id) render();
  else if (!d.id && !d.moved && !d.marquee && !d.hand) { selectedId = null; render(); }
  else if (d.id && !d.moved && selIds.size > 1) { selIds = new Set([d.id]); selectedId = d.id; render(); } // clique simples reduz o grupo a um
  else if (d.marquee) { $('#marquee').hidden = true; }
});
svg.addEventListener('dblclick', (e) => { if (nodeAt(e.target)) startEdit(); });
svg.addEventListener('wheel', (e) => {
  e.preventDefault();
  const r = svg.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
  if (map) zoomMapAt(mx, my, e.deltaY < 0 ? 1.12 : 1 / 1.12);   // na tela inicial não há mapa para dar zoom
}, { passive: false });
/** Zoom do mapa em torno de um ponto (coordenadas relativas ao #svg): roda do mouse e pinça compartilham esta fórmula. */
function zoomMapAt(mx, my, factor) {
  userZoomed = true;
  const k = Math.min(4, Math.max(0.1, pan.k * factor));
  pan.x = mx - ((mx - pan.x) / pan.k) * k; pan.y = my - ((my - pan.y) / pan.k) * k; pan.k = k;
  render();
}

// ---------- copiar / recortar / colar ----------
let clip = null; // { text, trees } — cópia interna (mantém marcadores, progresso e notas); o texto também vai à área de transferência
const MAX_PASTE_NODES = 3000;
const outlineText = (nodes, depth = 0) => nodes.map((n) => '  '.repeat(depth) + '- ' + n.title.replace(/\s*\n\s*/g, ' ') + '\n' + outlineText(n.children, depth + 1)).join('');
const countNodes = (list) => list.reduce((a, n) => a + 1 + countNodes(n.children), 0);

async function copySelection() {
  commitNotes();
  const tops = map.topLevel(targets());
  if (!tops.length) { setStatus('Selecione um ou mais tópicos (exceto a raiz) para copiar.'); return false; }
  const trees = tops.map((n) => MindMap.cloneSubtree(n));
  const text = outlineText(tops);
  await ipcRenderer.invoke('clip:write', text);
  clip = { text, trees };
  setStatus(`${countNodes(trees)} tópico(s) copiado(s)`);
  return true;
}
async function pasteSelection() {
  commitNotes();
  const text = await ipcRenderer.invoke('clip:read');
  if (!text.trim()) { setStatus('A área de transferência está vazia.'); return; }
  const parent = selectedId || map.root.id;
  const fromInternal = clip && clip.text === text;
  const trees = fromInternal ? clip.trees.map((t) => MindMap.cloneSubtree(t)) : textToNodes(text);
  const total = countNodes(trees);
  if (!total) { setStatus('Nada para colar.'); return; }
  if (total > MAX_PASTE_NODES) { setStatus(`Texto grande demais para colar (${total} tópicos; limite ${MAX_PASTE_NODES}).`); return; }
  let added = [];
  change(() => map.batch(() => { added = trees.map((t) => map.addSubtree(parent, t)); return true; }));
  if (!added.length) return;
  selIds = new Set(added.map((n) => n.id)); selectedId = added[0].id; render(); reveal(added[0].id);
  setStatus(`${total} tópico(s) colado(s)${fromInternal ? '' : ' a partir do texto'}`);
}

// ---------- teclado ----------
window.addEventListener('keydown', (e) => {
  if (typeof flowIsOn === 'function' && flowIsOn() && flowKey(e)) return;   // no fluxograma, Enter/Tab/Delete são do fluxo
  if (graphOpen) return; // com a rede em tela cheia aberta, os atalhos do mapa ficam desligados (Esc fecha: graph-ui.js)
  // O teclado é de quem está na frente: com uma janela ou a tela inicial abertas, e dentro dos painéis/leitor/barras, Tab, Delete, Enter e setas
  // pertencem ao controle focado (antes, Tab numa janela criava tópicos no mapa de baixo e Delete podia apagar o selecionado).
  if (!$('#modal').hidden || (window.MCReact && window.MCReact.homeIsOpen())) return;
  if (!(e.ctrlKey || e.metaKey || e.altKey) && e.target.closest && e.target.closest('#pdfpane, #panels, #ptabs, #appbar')) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); $('#search').focus(); return; }
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || !editor.hidden) return;
  if (e.target.tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) return; // deixa o botão focado agir
  if (e.key === 'Escape') {
    if (relateFrom) cancelRelate();
    if (selIds.size > 1) selIds = new Set([selectedId]); else selectedRel = null;
    render(); return;
  }
  // Ctrl+A/C/X/V/E não são tratados aqui: são aceleradores do menu nativo (consumidos antes da página)
  // e chegam pelo canal 'menu' — ver editCommand() abaixo.
  if (e.altKey && !e.ctrlKey && !e.metaKey) { // Alt+setas: reordenar / mudar de nível · Alt+1…5: abas do painel lateral
    const ops = { ArrowUp: 'moveUp', ArrowDown: 'moveDown', ArrowLeft: 'outdent', ArrowRight: 'indent' };
    const tabs = { 1: 'props', 2: 'notes', 3: 'links', 4: 'ai', 5: 'outline' };   // mesma ordem das abas do painel
    if (ops[e.key]) { e.preventDefault(); return act[ops[e.key]](); }
    if (tabs[e.key]) { e.preventDefault(); return showPanel(tabs[e.key]); }
  }
  if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); return act.relate(); }
  if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey && sel()) { e.preventDefault(); return openNotesFor(selectedId); }   // N: adicionar/editar a nota do tópico
  const s = sel();
  const nav = (fn) => { e.preventDefault(); const t = fn(); if (t) { selectedId = t.id; render(); reveal(t.id); } };
  switch (e.key) {
    case 'Tab': e.preventDefault(); act.child(); break;
    case 'Enter': e.preventDefault(); act.sibling(); break;
    case 'F2': startEdit(); break;
    case 'Delete': case 'Backspace': act.delete(); break;
    case ' ': e.preventDefault(); act.toggle(); break;
    case 'ArrowRight': nav(() => s && L.boxes.get(s.node.id) && (L.boxes.get(s.node.id).side > 0 || !s.parent ? s.node.children[0] : s.parent)); break;
    case 'ArrowLeft': nav(() => s && L.boxes.get(s.node.id) && (L.boxes.get(s.node.id).side < 0 || !s.parent ? s.node.children[0] : s.parent)); break;
    case 'ArrowDown': nav(() => { if (!s || !s.parent) return null; const i = s.parent.children.indexOf(s.node); return s.parent.children[i + 1]; }); break;
    case 'ArrowUp': nav(() => { if (!s || !s.parent) return null; const i = s.parent.children.indexOf(s.node); return s.parent.children[i - 1]; }); break;
  }
});

/** Recortar/copiar/colar/selecionar tudo: em campo de texto agem no texto; fora dele, nos tópicos do mapa. */
async function editCommand(c) {
  const ae = document.activeElement;
  if (ae && ['TEXTAREA', 'INPUT'].includes(ae.tagName)) { document.execCommand(c === 'paste' ? 'paste' : c); return; }
  if (!editor.hidden) return;
  if (c === 'selectAll') { selIds = new Set(L.boxes.keys()); selectedId = selectedId || map.root.id; render(); setStatus(`${selIds.size} tópicos selecionados`); }
  else if (c === 'copy') await copySelection();
  else if (c === 'cut') { if (await copySelection()) act.delete(); }
  else if (c === 'paste') await pasteSelection();
}

ipcRenderer.on('menu', (_e, c) => runMenuCommand(c));
ipcRenderer.on('open-path', async (_e, p) => { await ready; openPath(p); });
window.addEventListener('resize', () => { if (!map) return; if (userZoomed) render(); else fit(); });   // mapa acompanha a área visível (painéis, PDF, rotação)
// erros inesperados nunca devem passar em silêncio
const logOnly = (m) => { try { if (userDataDir) logError(path.join(userDataDir, 'logs'), m); } catch { /* o registro nunca pode causar outro erro */ } };
const report = (m) => {
  setStatus('Erro: ' + m); console.error(m);
  try { if (userDataDir) logError(path.join(userDataDir, 'logs'), m); } catch { /* o registro nunca pode causar outro erro */ }
};
window.addEventListener('error', (e) => report(e.message + (e.error && e.error.stack ? ' | ' + e.error.stack.split('\n').slice(1, 4).map((s) => s.trim()).join(' <- ') : '')));
window.addEventListener('unhandledrejection', (e) => report(e.reason && e.reason.message || e.reason));

// ---------- autosave e recuperação de sessão ----------
// Enquanto há alterações não salvas, um rascunho atômico (tmp + rename) é gravado em userData/drafts/session.json
// ~1,5 s após a última alteração. Ele some ao salvar/descartar; se o app cair, é oferecido na próxima abertura.
let userDataDir = null, draftRev = -1, draftTimer = null, draftExists = false;

// ---------- configuração por usuário (config.json em userData) ----------
const cfgPath = () => (userDataDir ? path.join(userDataDir, 'config.json') : null);
function loadCfg() { try { return JSON.parse(fs.readFileSync(cfgPath(), 'utf8')) || {}; } catch { return {}; } }
function saveCfg(patch) {
  const p = cfgPath(); if (!p) return;
  try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify({ ...loadCfg(), ...patch })); } catch (e) { report('Não foi possível salvar a configuração: ' + e.message); }
}
/** Pasta de mapas da rede de conhecimento: a escolhida pelo usuário, ou a pasta do arquivo aberto (somente leitura, limitada). */
const vaultDirEff = () => { const c = loadCfg(); return c.vaultDir || (filePath ? path.dirname(filePath) : null); };
/** Arquivo mais recente da lista de recentes que ainda existe. */
function lastRecent() {
  try {
    const list = JSON.parse(fs.readFileSync(path.join(userDataDir, 'recent.json'), 'utf8'));
    return (Array.isArray(list) ? list : []).find((p) => typeof p === 'string' && /\.mom$/i.test(p) && fs.existsSync(p)) || null;
  } catch { return null; }
}

/** Versões anteriores (backups automáticos) do arquivo aberto: o escolhido abre como mapa NOVO (o original não é tocado). */
async function restoreVersion() {
  if (!filePath) return setStatus('Salve o mapa primeiro: as versões anteriores são guardadas por arquivo.');
  const dir = backupDirFor(path.join(userDataDir, 'backups'), filePath);
  if (!listBackups(dir).length) return setStatus('Ainda não há versões anteriores deste arquivo (o backup é feito ao salvar por cima de um arquivo existente).');
  if (!(await confirmDiscard())) return;
  const p = await ipcRenderer.invoke('dialog:open-at', dir);
  if (!p) return;
  try {
    // a versão vira um mapa NOVO (sem arquivo): o original não é tocado
    map = readMom(fs.readFileSync(p)); filePath = null; dirty = true; selectedId = map.root.id; selIds = new Set(); selectedRel = null; hits = null; rev++;
    if (typeof closeHome === 'function') closeHome();
    render(); fit();
    setStatus('Versão anterior aberta como mapa novo — use "Salvar como…". O arquivo original não foi alterado.');
  } catch (e) { ipcRenderer.invoke('dialog:error', 'Não foi possível abrir a versão: ' + e.message); }
}
const draftPath = () => (userDataDir ? path.join(userDataDir, 'drafts', 'session.json') : null);
function writeDraft() {
  const p = draftPath(); if (!p) return;
  try {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    const tmp = p + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ v: 1, filePath, savedAt: Date.now(), map: map.toJSON() }));
    fs.renameSync(tmp, p);
    draftRev = rev; draftExists = true;
  } catch (e) { report('Autosave falhou: ' + e.message); }
}
function removeDraft() {
  clearTimeout(draftTimer); draftTimer = null;
  const p = draftPath();
  if (p) {
    try { if (fs.existsSync(p)) fs.rmSync(p, { force: true }); } catch { /* será tentado de novo */ }
    draftExists = false;
  }
}
function autosaveTick() {
  if (!userDataDir) return;
  if (!dirty) { if (draftExists || draftTimer) removeDraft(); return; }
  if (rev !== draftRev && !draftTimer) draftTimer = setTimeout(() => { draftTimer = null; if (dirty) writeDraft(); }, 1500);
}
async function recoverSession() {
  const p = draftPath();
  if (!p || !fs.existsSync(p)) return;
  draftExists = true;
  try {
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!d || !d.map || !d.map.root || typeof d.map.root.id !== 'string' || !Array.isArray(d.map.root.children)) throw new Error('rascunho inválido');
    const when = new Date(d.savedAt).toLocaleString('pt-BR');
    dismissSplash();   // o diálogo de recuperação não pode ficar escondido sob a abertura
    const c = await ipcRenderer.invoke('dialog:confirm', {
      message: 'Encontrei um trabalho não salvo da sessão anterior.',
      detail: `${d.filePath || 'Mapa sem arquivo'} — salvo automaticamente em ${when}.`, buttons: ['Restaurar', 'Descartar'],
    });
    if (c === 0) {
      map = MindMap.fromJSON(d.map);
      filePath = d.filePath || null; dirty = true; rev++; selectedId = map.root.id; selIds = new Set(); selectedRel = null; hits = null;
      render(); fit(); setStatus('Sessão anterior restaurada — salve para não perder.');
    } else removeDraft();
  } catch (e) { // rascunho ilegível: guarda como .bad (para análise) em vez de apagar
    try { fs.renameSync(p, p + '.bad'); } catch { /* ignora */ }
    draftExists = false; setStatus('Rascunho corrompido ignorado (guardado como session.json.bad).');
  }
}

// a abertura sai depois que o vídeo tocou até o fim (ou após o limite em index.html); dismissSplash() sai já
function nativeSplashHide() {
  try {
    if (window.Capacitor?.Plugins?.SplashScreen?.hide) window.Capacitor.Plugins.SplashScreen.hide();
  } catch { /* plugin não disponível */ }
}
function dismissSplash() {
  nativeSplashHide();
  const s = document.getElementById('splash');
  if (!s || s.hidden) return;
  s.classList.add('splash-hide');
  setTimeout(() => { s.hidden = true; s.style.display = 'none'; }, 380);
}
function hideSplash(delay = 180) {
  const gate = window.splashVideoPlayed || Promise.resolve();
  gate.then(() => setTimeout(dismissSplash, delay));
}
// rede de segurança: nenhuma abertura fica na frente da tela mais de 25 s
setTimeout(dismissSplash, 5000);
window.hideSplash = hideSplash;

let firstInit = true;
async function initStartup() {
  let forced; if (firstInit) { try { forced = await ipcRenderer.invoke('app:start-override'); } catch { forced = null; } } firstInit = false;   // só a 1ª inicialização (testes)
  try { userDataDir = await ipcRenderer.invoke('app:path', 'userData'); } catch { userDataDir = null; }
  await recoverSession();
  if (dirty) { hideSplash(); return; }                                    // um rascunho foi restaurado: não mexe
  await new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })));   // espera os demais scripts
  const cfg = loadCfg();
  const start = forced || cfg.startScreen || 'home';   // padrão: tela inicial
  if (start === 'home' && window.MCReact && typeof act.home === 'function') { act.home(true); hideSplash(); return; }
  if (start === 'last') { const last = lastRecent(); if (last) await openPath(last, { silent: true }); }
  if (!map) newMap();   // início em branco (ou nada a reabrir): só aqui nasce um mapa vazio
  hideSplash();
}
// nenhum mapa é criado no boot: a tela inicial aparece antes; um mapa só existe quando o usuário abre ou cria um (ver init)
async function init() {
  try { await initStartup(); }
  catch (e) { report('Falha ao iniciar: ' + e.message); }
  finally { hideSplash(); }   // mesmo se algum passo falhar, a tela não fica presa na abertura
}
const ready = init(); // aberturas por linha de comando esperam a restauração (ver 'open-path')
