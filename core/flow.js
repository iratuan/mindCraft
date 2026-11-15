'use strict';
/**
 * Fluxograma: um documento que usa o mesmo modelo do mapa (árvore + relações) com regras de fluxo.
 * - Filhos de um passo = próximos passos (sequência). Um passo comum tem no máximo um próximo; para bifurcar, use uma decisão.
 * - Decisão: 1 a 2 ramos (MAX_BRANCHES), cada ramo com rótulo ("Sim", "Não") guardado no próprio filho (branchLabel).
 * - Setas extras (relações do modelo) = caminhos alternativos, voltas (laços) e junções entre ramos.
 * - Tipos: start (início, um por fluxo), step (passo), decision (decisão), end (fim, sem saída).
 * Regras puras, sem DOM. Quem chama decide o que mostrar; aqui só há regras, caminhos e validação.
 */
const { MindMap, createNode } = require('./model');

const FLOW_TYPES = ['start', 'step', 'decision', 'end'];
const FLOW_LABELS = { start: 'Início', step: 'Passo', decision: 'Decisão', end: 'Fim' };
const MAX_BRANCHES = 2;
const DEFAULT_BRANCHES = ['Sim', 'Não'];
const MAX_PATHS = 200;     // teto de caminhos listados (fluxos muito ramificados são cortados e avisados)
const MAX_PATH_LEN = 60;   // teto de passos por caminho

const typeOf = (n) => (FLOW_TYPES.includes(n.flowType) ? n.flowType : 'step');

/** É um fluxograma? A raiz de um fluxo é sempre um "início" (o tipo fica salvo no arquivo). */
function isFlow(map) {
  return map.meta.kind === 'flow' || map.root.flowType === 'start';
}

/** Cria um fluxo novo: a raiz é o início. */
function createFlow(title = 'Fluxograma') {
  return new MindMap(createNode(title, { flowType: 'start' }), { kind: 'flow', name: title });
}

const nodeOf = (map, id) => { const r = map.find(id); return r ? r.node : null; };
const isLeaf = (n) => n.children.length === 0;

/** Insere um passo logo depois do selecionado. Em decisão, é preciso dizer o ramo (ex.: "Sim"). */
function insertStepAfter(map, id, { type = 'step', title, branch } = {}) {
  const r = map.find(id);
  if (!r) throw new Error('Passo não encontrado.');
  if (!FLOW_TYPES.includes(type)) throw new Error('Tipo de passo desconhecido.');
  if (type === 'start') throw new Error('Um fluxo tem só um início.');
  const t = typeOf(r.node);
  if (t === 'end') throw new Error('O fim não tem saída. Insira o passo antes dele, selecionando o passo anterior.');
  if (t === 'decision') {
    if (!branch) throw new Error('Escolha o ramo da decisão (ex.: Sim ou Não).');
    return addBranch(map, id, branch, { type, title });
  }
  if (type === 'end' && r.node.children.length) throw new Error('O fim deve ficar no final: insira-o depois do último passo.');
  map._snapshot();
  const n = createNode(title || FLOW_LABELS[type], { flowType: type });
  if (type !== 'end') {
    // o passo novo entra no meio da sequência: os próximos passos passam a ser dele
    n.children = r.node.children;
    r.node.children = [n];
  } else {
    r.node.children.push(n);
  }
  r.node.collapsed = false;
  return n;
}

/** Adiciona um ramo a uma decisão. Rótulo obrigatório e único; no máximo MAX_BRANCHES ramos. */
function addBranch(map, decisionId, label, { type = 'step', title } = {}) {
  const r = map.find(decisionId);
  if (!r) throw new Error('Decisão não encontrada.');
  if (typeOf(r.node) !== 'decision') throw new Error('Só uma decisão tem ramos.');
  const text = String(label || '').trim();
  if (!text) throw new Error('O ramo precisa de um rótulo (ex.: Sim ou Não).');
  if (r.node.children.length >= MAX_BRANCHES) throw new Error(`Uma decisão tem no máximo ${MAX_BRANCHES} ramos.`);
  if (r.node.children.some((c) => (c.branchLabel || '').toLowerCase() === text.toLowerCase())) throw new Error(`Já existe um ramo "${text}".`);
  if (type === 'start') throw new Error('Um fluxo tem só um início.');
  map._snapshot();
  const n = createNode(title || FLOW_LABELS[type], { flowType: type, branchLabel: text.slice(0, 60) });
  r.node.children.push(n);
  r.node.collapsed = false;
  return n;
}

/** Muda o tipo de um passo, com as regras do tipo. Mudar para decisão não apaga nada (a validação avisa). */
function setFlowType(map, id, type) {
  const r = map.find(id);
  if (!r) throw new Error('Passo não encontrado.');
  if (!FLOW_TYPES.includes(type)) throw new Error('Tipo de passo desconhecido.');
  if (type === 'start' && findStarts(map).some((n) => n.id !== id)) throw new Error('Um fluxo tem só um início.');
  if (type === 'end' && r.node.children.length) throw new Error('O fim não tem saída: remova ou mova os próximos passos antes.');
  map._snapshot();
  r.node.flowType = type;
  return r.node;
}

/**
 * Exclui um passo. Com um só próximo passo, o fluxo se religa (anterior → próximo) e as setas do passo somem.
 * Decisão ou passo com mais de um próximo: o subfluxo sai junto (a interface deve confirmar antes).
 */
function removeStep(map, id) {
  const r = map.find(id);
  if (!r) throw new Error('Passo não encontrado.');
  if (!r.parent) throw new Error('O início do fluxo não pode ser excluído.');
  const n = r.node;
  const sub = n.children.length > 1 || typeOf(n) === 'decision';
  if (!sub && n.children.length === 1) {
    map._snapshot();
    const i = r.parent.children.indexOf(n);
    const next = n.children[0];
    if (typeOf(r.parent) === 'decision') next.branchLabel = n.branchLabel || next.branchLabel;   // o ramo continua com o mesmo rótulo
    r.parent.children.splice(i, 1, next);
    map.meta.relations = map.meta.relations.filter((x) => x.from !== n.id && x.to !== n.id);
    return { removed: 1, subtree: false };
  }
  const count = [];
  map.walk((x) => count.push(x), n);
  map.remove(id);
  return { removed: count.length, subtree: sub };
}

/** Início(s) do fluxo. Um fluxo bem formado tem exatamente um. */
function findStarts(map) {
  const out = [];
  map.walk((n) => { if (typeOf(n) === 'start') out.push(n); });
  return out;
}

/** Saídas de um passo: próximos da sequência (com rótulo de ramo) e setas extras (kind 'rel'). */
function successors(map, id) {
  const n = nodeOf(map, id);
  if (!n) return [];
  const seq = n.children.map((c) => ({ to: c.id, label: c.branchLabel || '', kind: 'seq' }));
  const rel = map.meta.relations.filter((x) => x.from === id).map((x) => ({ to: x.to, label: x.label || '', kind: 'rel' }));
  return [...seq, ...rel];
}

/** Liga dois passos com uma seta extra (relação). Sobrescreve seta anterior do mesmo par. Rótulo opcional. */
function connect(map, fromId, toId, label = '') {
  const from = nodeOf(map, fromId);
  const to = nodeOf(map, toId);
  if (!from) throw new Error('Passo de saída não encontrado.');
  if (!to) throw new Error('Passo de entrada não encontrado.');
  if (fromId === toId) throw new Error('Um passo não pode ligar para si mesmo.');
  const existing = map.meta.relations.find((r) => r.from === fromId && r.to === toId);
  if (existing) {
    // atualiza o rótulo da seta que já existe
    map._snapshot();
    existing.label = String(label).slice(0, 60);
  } else {
    // cria a nova relação
    map._snapshot();
    const rel = { id: 'r' + Date.now() + '-' + Math.random().toString(36).slice(2, 9), from: fromId, to: toId, label: String(label).slice(0, 60) };
    if (!Array.isArray(map.meta.relations)) map.meta.relations = [];
    map.meta.relations.push(rel);
  }
}

/** Remove a seta extra entre dois passos. */
function disconnect(map, fromId, toId) {
  map._snapshot();
  map.meta.relations = map.meta.relations.filter((r) => !(r.from === fromId && r.to === toId));
}

/** Regras de fluxo: lista de avisos (nunca bloqueia a edição). Cada aviso aponta o passo. */
function validateFlow(map) {
  const warn = [];
  const starts = findStarts(map);
  if (!starts.length) warn.push({ level: 'error', id: null, message: 'O fluxo não tem início.' });
  if (starts.length > 1) warn.push({ level: 'error', id: starts[1].id, message: 'Há mais de um início no fluxo.' });
  map.walk((n) => {
    const t = typeOf(n);
    const name = n.title || 'Sem título';
    if (t === 'decision') {
      const k = n.children.length;
      if (k !== MAX_BRANCHES) warn.push({ level: 'warn', id: n.id, message: `Decisão "${name}" com ${k} ramo(s); o correto são ${MAX_BRANCHES} (ex.: Sim e Não).` });
      for (const c of n.children) if (!c.branchLabel) warn.push({ level: 'warn', id: c.id, message: `Ramo sem rótulo após a decisão "${name}".` });
    } else if (t === 'end' && n.children.length) {
      warn.push({ level: 'error', id: n.id, message: `O fim "${name}" tem saídas; o fim não pode ter próximos passos.` });
    } else if (t !== 'end' && t !== 'decision' && n.children.length > 1) {
      // passo comum (não decisão, não fim) com múltiplos filhos: não é válido. Deve usar decisão ou relações.
      warn.push({ level: 'error', id: n.id, message: `Passo "${name}" com ${n.children.length} próximos filhos; a estrutura não é válida. Para bifurcar, use uma decisão; para caminhos alternativos, use setas extras.` });
    }
    if (t !== 'end' && t !== 'decision' && isLeaf(n) && !map.meta.relations.some((x) => x.from === n.id)) {
      warn.push({ level: 'warn', id: n.id, message: `Passo "${name}" sem saída: marque como Fim ou acrescente o próximo passo.` });
    }
  });
  return warn;
}

/**
 * Todos os caminhos do início até um fim (ou até um passo sem saída), pela sequência e pelas setas extras.
 * Uma seta de volta a um passo já percorrido (laço) termina o caminho com `loopTo: true` no último passo.
 * Cada caminho é uma lista de { id, via } onde `via` é o rótulo da seta que chegou ao passo ("" se não há rótulo).
 * Devolve { paths, truncated }: truncated = true quando o teto (MAX_PATHS ou MAX_PATH_LEN) cortou a lista.
 */
function listPaths(map, { max = MAX_PATHS, maxLen = MAX_PATH_LEN } = {}) {
  const paths = [];
  let truncated = false;
  const starts = findStarts(map);
  if (!starts.length) return { paths, truncated };
  const walkFrom = (id, trail, seen) => {
    if (paths.length >= max) { truncated = true; return; }
    const outs = successors(map, id);
    if (typeOf(nodeOf(map, id)) === 'end' || !outs.length) { paths.push(trail.slice()); return; }
    if (trail.length >= maxLen) { truncated = true; paths.push(trail.slice()); return; }
    for (const e of outs) {
      if (seen.has(e.to)) { paths.push([...trail, { id: e.to, via: e.label, loopTo: true }]); continue; }
      seen.add(e.to);
      trail.push({ id: e.to, via: e.label });
      walkFrom(e.to, trail, seen);
      trail.pop();
      seen.delete(e.to);
      if (paths.length >= max) { truncated = true; return; }
    }
  };
  for (const s of starts) walkFrom(s.id, [{ id: s.id, via: '' }], new Set([s.id]));
  return { paths, truncated };
}

module.exports = {
  FLOW_TYPES, FLOW_LABELS, MAX_BRANCHES, DEFAULT_BRANCHES, MAX_PATHS,
  isFlow, createFlow, insertStepAfter, addBranch, setFlowType, removeStep,
  findStarts, successors, validateFlow, listPaths, typeOf, connect, disconnect,
};
