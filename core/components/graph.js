'use strict';
const { norm, parseLinks } = require('./links');

/**
 * Rede de conhecimento: nós = tópicos (de um ou vários mapas); arestas = links [[...]], relações (setas do mapa)
 * e, opcionalmente, a hierarquia pai→filho. Links sem destino viram nós "fantasma" (como no Obsidian).
 *
 * maps: [{ key, name, map }]  — `key` identifica o mapa (caminho do arquivo); `name` é como ele é citado em [[Mapa/Tópico]].
 */
/** Percorre todos os tópicos do mapa: a árvore principal e os tópicos soltos do Mindomo (cada um é uma raiz própria). */
function walkAll(map, fn) {
  const visit = (node, level, parent) => { fn(node, level, parent); for (const c of node.children) visit(c, level + 1, node); };
  visit(map.root, 0, null);
  for (const f of map.meta._momFloating || []) visit(f.node, 0, null);
}

/** Quanto cada tipo de aresta transmite de importância (a hierarquia conta menos que um link escolhido de propósito). */
const EDGE_POWER = { link: 1, relation: 1.2, hierarchy: 0.5 };

/**
 * Peso dos nós: PageRank (amortecimento 0,85) sobre links, relações e hierarquia. Quem RECEBE links ganha mais e quem
 * os faz ainda ganha um pouco (volta de 30%). Soma ao conteúdo próprio (nota, filhos). Define `rank` (0..1, o mais
 * importante vale 1) e `importance` (>= 0, tamanho do ponto na rede 3D). Determinístico, sem aleatoriedade.
 */
function computeWeights(nodes, edges) {
  const n = nodes.length; if (!n) return;
  const idx = new Map(nodes.map((g, i) => [g.id, i]));
  const outs = nodes.map(() => []);
  const addArc = (a, b, w) => { if (a !== b && w > 0) outs[a].push([b, w]); };
  for (const e of edges) {
    const a = idx.get(e.from), b = idx.get(e.to); if (a == null || b == null) continue;
    const w = EDGE_POWER[e.type] ?? 1;
    addArc(a, b, w); addArc(b, a, e.type === 'hierarchy' ? w : w * 0.3);
  }
  const total = outs.map((l) => l.reduce((t, [, w]) => t + w, 0));
  let r = new Array(n).fill(1 / n);
  for (let it = 0; it < 40; it++) {
    const nx = new Array(n).fill(0); let dangling = 0;
    for (let i = 0; i < n; i++) {
      if (!total[i]) { dangling += r[i]; continue; }
      for (const [j, w] of outs[i]) nx[j] += r[i] * w / total[i];
    }
    let diff = 0;
    for (let i = 0; i < n; i++) { const v = 0.15 / n + 0.85 * (nx[i] + dangling / n); diff += Math.abs(v - r[i]); nx[i] = v; }
    r = nx; if (diff < 1e-9) break;
  }
  const max = Math.max(...r) || 1;
  nodes.forEach((g, i) => {
    g.rank = r[i] / max;
    const own = Math.min(g.childCount || 0, 6) * 0.4 + (g.hasNote ? 1 : 0);
    g.importance = Math.round((g.rank * 10 + own + Math.min(g.deg || 0, 8) * 0.5) * 100) / 100;
  });
}

function buildGraph(maps, { hierarchy = false } = {}) {
  const nodes = [];
  const byId = new Map();
  const edges = [];
  const edgeKeys = new Set();
  const ghosts = new Map();

  const mapIndex = new Map();                       // norm(nome) -> [entradas]
  const add = (k, e) => { if (!mapIndex.has(k)) mapIndex.set(k, []); mapIndex.get(k).push(e); };
  const entries = maps.map((m) => {
    const topics = new Map();                       // norm(título) -> [nós]
    const e = { ...m, topics, root: m.map.root };
    walkAll(m.map, (n) => { const k = norm(n.title); if (!topics.has(k)) topics.set(k, []); topics.get(k).push(n); });
    return e;
  });
  for (const e of entries) { add(norm(e.name), e); if (norm(e.map.root.title) !== norm(e.name)) add(norm(e.map.root.title), e); }
  const idOf = (e, n) => `${e.key}::${n.id}`;

  for (const e of entries) {
    walkAll(e.map, (n, level, parent) => {
      const g = { id: idOf(e, n), kind: 'topic', title: n.title, mapKey: e.key, mapName: e.name, topicId: n.id, isRoot: !parent, progress: n.progress ?? null, deg: 0, childCount: n.children.length, hasNote: !!(n.notes && String(n.notes).trim()), weight: 0 };
      nodes.push(g); byId.set(g.id, g);
    });
  }
  const link = (from, to, type, extra = {}) => {
    if (from === to) return;
    const k = `${from}>${to}>${type}`;
    if (edgeKeys.has(k)) return;
    edgeKeys.add(k); edges.push({ from, to, type, ...extra });
  };
  const ghost = (label, key) => {
    const id = `ghost::${key}`;
    if (!ghosts.has(id)) { const g = { id, kind: 'ghost', title: label, mapKey: null, mapName: null, topicId: null, isRoot: false, progress: null, deg: 0 }; ghosts.set(id, g); nodes.push(g); byId.set(id, g); }
    return id;
  };

  /**
   * Resolve um link escrito dentro do mapa `from`. Devolve { id, ambiguous, heading }: `heading` é a seção do
   * link ([[Nota#Seção]]), que o exportador do Obsidian leva junto; o grafo em si aponta só para a nota.
   */
  const resolve = (lk, from) => {
    const t = lk.topic == null ? null : norm(lk.topic);
    const heading = lk.hashForm ? null : (lk.heading ?? null);
    if (lk.map) {                                   // [[Mapa/Tópico]], [[Mapa]] ou [[Mapa#Tópico]] (legado)
      const cands = (mapIndex.get(norm(lk.map)) || []);
      if (!cands.length && lk.hashForm && lk.note) {  // [[Nota#Seção]]: não há mapa com esse nome, então é a nota
        return resolve({ map: null, topic: lk.note, note: lk.note, heading: lk.heading, hashForm: false }, from);
      }
      if (!cands.length) return { id: ghost(lk.topic ? `${lk.map}#${lk.topic}` : lk.map, norm(lk.map) + (t ? '#' + t : '')), heading };
      const e = cands.find((c) => c.key === from.key) || cands[0];
      if (t == null) return { id: idOf(e, e.root), ambiguous: cands.length > 1, heading };
      const hit = (e.topics.get(t) || [])[0];
      return hit ? { id: idOf(e, hit), ambiguous: cands.length > 1, heading } : { id: ghost(`${lk.map}#${lk.topic}`, norm(lk.map) + '#' + t), heading };
    }
    const own = (from.topics.get(t) || [])[0];       // 1º: neste mapa
    if (own) return { id: idOf(from, own), heading };
    const asMap = (mapIndex.get(t) || []).filter((c) => c.key !== from.key);
    const others = [];                              // 2º: em outros mapas (tópicos ou raízes de mapas com esse nome)
    for (const e of [...entries].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))) {
      if (e.key === from.key) continue;
      const hit = (e.topics.get(t) || [])[0]; if (hit) others.push(idOf(e, hit));
    }
    for (const e of asMap) { const id = idOf(e, e.root); if (!others.includes(id)) others.push(id); }
    if (others.length) return { id: others[0], ambiguous: others.length > 1, heading };
    return { id: ghost(lk.topic, t), heading };
  };

  for (const e of entries) {
    walkAll(e.map, (n, level, parent) => {
      const me = idOf(e, n);
      if (hierarchy && parent) link(idOf(e, parent), me, 'hierarchy');
      for (const text of [n.title, n.notes]) {
        for (const lk of parseLinks(text)) {
          const r = resolve(lk, e);
          link(me, r.id, 'link', { ...(r.ambiguous ? { ambiguous: true } : {}), ...(lk.alias ? { alias: lk.alias } : {}) });
        }
      }
    });
    for (const r of e.map.meta.relations || []) {
      const a = e.map.find(r.from), b = e.map.find(r.to);
      if (a && b) link(idOf(e, a.node), idOf(e, b.node), 'relation', { label: r.label || '' });
    }
  }

  for (const ed of edges) { if (ed.type === 'hierarchy') continue; byId.get(ed.from).deg++; byId.get(ed.to).deg++; }
  // peso (tamanho do ponto na rede 3D): importância estilo PageRank + conteúdo próprio (ver computeWeights)
  for (const g of nodes) g.weight = (g.childCount || 0) + (g.hasNote ? 1 : 0) + g.deg;   // contagem simples (contrato antigo)
  computeWeights(nodes, edges);
  const out = new Map(), inn = new Map();
  for (const ed of edges) {
    if (!out.has(ed.from)) out.set(ed.from, []); out.get(ed.from).push(ed);
    if (!inn.has(ed.to)) inn.set(ed.to, []); inn.get(ed.to).push(ed);
  }
  return {
    nodes, edges, byId,
    outgoing: (id) => (out.get(id) || []).filter((x) => x.type !== 'hierarchy'),
    incoming: (id) => (inn.get(id) || []).filter((x) => x.type !== 'hierarchy'),
    idOf: (mapKey, topicId) => `${mapKey}::${topicId}`,
    /** Resolve um link escrito no mapa `fromKey` com o mesmo critério do grafo (usado pelo exportador do Obsidian). */
    resolveLink: (lk, fromKey) => { const e = entries.find((x) => x.key === fromKey); return e ? resolve(lk, e) : null; },
  };
}

/** Subgrafo até `depth` saltos (não direcionado) a partir de `id`. */
function neighborhood(g, id, depth = 1) {
  if (!g.byId.has(id)) return { nodes: [], edges: [] };
  const adj = new Map();
  for (const e of g.edges) {
    if (!adj.has(e.from)) adj.set(e.from, []); adj.get(e.from).push(e.to);
    if (!adj.has(e.to)) adj.set(e.to, []); adj.get(e.to).push(e.from);
  }
  const seen = new Map([[id, 0]]); let front = [id];
  for (let d = 1; d <= depth; d++) {
    const next = [];
    for (const x of front) for (const y of adj.get(x) || []) if (!seen.has(y)) { seen.set(y, d); next.push(y); }
    front = next;
  }
  return { nodes: g.nodes.filter((n) => seen.has(n.id)), edges: g.edges.filter((e) => seen.has(e.from) && seen.has(e.to)), distance: seen };
}

module.exports = { buildGraph, neighborhood, computeWeights };
