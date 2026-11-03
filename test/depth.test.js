'use strict';
// Profundidade dos tópicos: muitos níveis de subtópicos precisam funcionar em TODOS os módulos (rede, estudo, exportações, biblioteca),
// e o limite (MAX_DEPTH) precisa barrar criação/movimentação/colagem sem corromper nada.
const test = require('node:test');
const assert = require('node:assert/strict');
const { MindMap, createNode, MAX_DEPTH } = require('../core/model')
const { toSVG } = require('../core/svg');;
const { writeMom, readMom } = require('../core/mom');
const { layoutMap } = require('../core/layout');
const { buildGraph } = require('../core/graph');

const TODAY = '2026-10-20';
/** Corrente de `n` níveis abaixo da raiz, criada pela API pública (respeita o limite). */
function chain(n, titulo = (i) => 'Nível ' + i) {
  const m = new MindMap(createNode('Raiz')); let p = m.root; const ids = [];
  for (let i = 1; i <= n; i++) { p = m.addChild(p.id, titulo(i)); ids.push(p.id); }
  return { m, ids };
}
/** Corrente construída direto (para simular arquivos/importações já fundos). */
function raw(n) { const m = new MindMap(createNode('Raiz')); let p = m.root; for (let i = 1; i <= n; i++) { const c = createNode('N' + i); p.children.push(c); p = c; } return m; }

test('o limite permite exatamente MAX_DEPTH níveis e barra o seguinte', () => {
  const { m, ids } = chain(MAX_DEPTH);
  assert.equal(m.depthOf(ids[ids.length - 1]), MAX_DEPTH);
  assert.throws(() => m.addChild(ids[ids.length - 1], 'um a mais'), /Profundidade máxima/);
});

test('irmão no último nível é permitido (mesma profundidade), filho dele não', () => {
  const { m, ids } = chain(MAX_DEPTH);
  const ultimo = ids[ids.length - 1];
  const irmao = m.addSibling(ultimo, 'irmão'); assert.ok(irmao); assert.equal(m.depthOf(irmao.id), MAX_DEPTH);
  assert.throws(() => m.addChild(irmao.id), /Profundidade máxima/);
});

test('barrar não deixa rastro: nada muda e o histórico de desfazer não ganha entrada', () => {
  const { m, ids } = chain(MAX_DEPTH);
  const antes = JSON.stringify({ root: m.root, meta: m.meta }), undo = m._undo.length;
  assert.throws(() => m.addChild(ids[ids.length - 1], 'x'), /Profundidade máxima/);
  assert.equal(JSON.stringify({ root: m.root, meta: m.meta }), antes); assert.equal(m._undo.length, undo);
});

test('mover um ramo fundo para um lugar que estouraria o limite é recusado; para um lugar seguro funciona', () => {
  const m = new MindMap(createNode('Raiz'));
  const a = m.addChild(m.root.id, 'A'), b = m.addChild(m.root.id, 'B');
  let p = a; for (let i = 0; i < 60; i++) p = m.addChild(p.id, 'a' + i);          // A tem altura 60
  let q = b; for (let i = 0; i < 60; i++) q = m.addChild(q.id, 'b' + i);          // B vai a 61
  const antes = JSON.stringify(m.root);
  assert.throws(() => m.move(a.id, q.id), /Profundidade máxima/);                     // 61 + 1 + 60 > 100
  assert.equal(JSON.stringify(m.root), antes);
  assert.equal(m.move(a.id, b.id), true);                                              // 1 + 1 + 60 ok
  assert.equal(m.depthOf(p.id), 62);
});

test('colar/importar subárvore que estoura o limite é recusado por inteiro (lote revertido)', () => {
  const { m, ids } = chain(50);
  const arvore = raw(70).root;                                                         // altura 70
  const antes = JSON.stringify({ root: m.root, meta: m.meta });
  assert.throws(() => m.batch(() => { m.addSubtree(ids[ids.length - 1], MindMap.cloneSubtree(arvore)); }), /Profundidade máxima/);
  assert.equal(JSON.stringify({ root: m.root, meta: m.meta }), antes, 'nenhuma alteração parcial');
  const ok = m.addSubtree(ids[9], MindMap.cloneSubtree(raw(40).root)); assert.ok(ok);
});

test('desfazer/refazer atravessam uma corrente profunda sem perder nada', () => {
  const { m, ids } = chain(MAX_DEPTH);
  const cheio = JSON.stringify(m.root);
  for (let i = 0; i < 5; i++) m.undo();
  assert.equal(m.depthOf(ids[ids.length - 1]), -1);
  for (let i = 0; i < 5; i++) m.redo();
  assert.equal(JSON.stringify(m.root), cheio);
});

test('duplicar (cloneSubtree) é linear: 1000 níveis em poucos ms, ids novos e estrutura idêntica', () => {
  const m = raw(1000), t0 = Date.now();
  const c = MindMap.cloneSubtree(m.root);
  assert.ok(Date.now() - t0 < 500, 'demorou ' + (Date.now() - t0) + ' ms');
  let a = m.root, b = c, n = 0, ids = new Set();
  while (a) { assert.equal(a.title, b.title); assert.notEqual(a.id, b.id); ids.add(b.id); n++; a = a.children[0]; b = b.children[0]; }
  assert.equal(n, 1001); assert.equal(ids.size, 1001);
});

test('.mom: corrente de 400 níveis grava e relê idêntica; acima de 500 o arquivo é RECUSADO (nunca cortado em silêncio)', () => {
  const m = raw(400); let n = m.root; for (let i = 0; i < 400; i++) { n = n.children[0]; if (i % 100 === 0) { n.notes = 'nota ' + i; n.study = { peso: 3, next: '2026-11-01' }; } }
  const volta = readMom(writeMom(m));
  let a = m.root, b = volta.root, k = 0;
  while (a.children[0]) { a = a.children[0]; b = b.children[0]; k++; assert.equal(b.title, a.title); if (a.notes) assert.equal(b.notes, a.notes); }
  assert.equal(k, 400);
  assert.throws(() => readMom(writeMom(raw(600))), /mais de 500 níveis/);
});

test('rede de conhecimento: cada nível vira um nó, com aresta ao pai; relações entre níveis distantes viram conexões', () => {
  const { m, ids } = chain(MAX_DEPTH); m.meta.name = 'Fundo';
  m.addRelation(ids[0], ids[ids.length - 1], 'liga topo e fundo');
  const g = buildGraph([{ key: 'k', name: 'Fundo', map: m }], { hierarchy: true });
  assert.equal(g.nodes.filter((n) => n.kind === 'topic').length, MAX_DEPTH + 1);
  assert.equal(g.edges.filter((e) => e.type === 'hierarchy').length, MAX_DEPTH, 'uma aresta de hierarquia por nível');
  assert.ok(g.edges.some((e) => e.type === 'relation' && e.label === 'liga topo e fundo'), 'a relação topo↔fundo aparece como conexão');
  const so = buildGraph([{ key: 'k', name: 'Fundo', map: m }], { hierarchy: false });
  assert.ok(so.nodes.length <= g.nodes.length);
});

test('layout e SVG: mapa fundo e largo (100 níveis × ramos) não quebra nem gera coordenadas inválidas', () => {
  const m = new MindMap(createNode('Raiz')); let p = m.root;
  for (let i = 0; i < MAX_DEPTH - 1; i++) { p = m.addChild(p.id, 'Nível ' + i); for (let j = 0; j < 3; j++) m.addChild(p.id, `folha ${i}.${j}`); }
  const L = layoutMap(m); const pos = L.nodes || L.boxes || L;
  const lista = Array.isArray(pos) ? pos : Object.values(pos);
  for (const b of lista) for (const k of ['x', 'y']) if (k in b) assert.ok(Number.isFinite(b[k]), 'coordenada inválida em ' + b.id);
  const svg = toSVG(m); assert.ok(svg.length > 1000 && !/NaN|undefined/.test(svg), 'SVG sem NaN/undefined');
});
