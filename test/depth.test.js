'use strict';
// Profundidade dos tópicos: muitos níveis de subtópicos precisam funcionar em TODOS os módulos (rede, estudo, exportações, biblioteca),
// e o limite (MAX_DEPTH) precisa barrar criação/movimentação/colagem sem corromper nada.
const test = require('node:test');
const assert = require('node:assert/strict');
const { MindMap, createNode, MAX_DEPTH } = require('../core/model');
const { writeMom, readMom } = require('../core/mom');
const { openLibrary } = require('../core/library');
const { layoutMap } = require('../core/layout');
const { toSVG } = require('../core/svg');
const S = require('../core/study');
const { buildGraph } = require('../core/graph');
const { toMarkdown, toOPML } = require('../core/export');
const { fromMarkdown, fromOPML } = require('../core/import');
const { exportPlan } = require('../core/planner');
const R = require('../core/report');

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

test('biblioteca SQLite: corrente de 100 e de 400 níveis salva com verificação, relê igual e entra na busca', () => {
  const lib = openLibrary(':memory:'); const { m } = chain(MAX_DEPTH, (i) => (i === 77 ? 'agulha-profunda' : 'Nível ' + i));
  m.meta.name = 'Fundo'; const id = lib.saveMap(m, { verify: true });
  const volta = lib.loadMap(id); assert.equal(JSON.stringify(volta.root.children), JSON.stringify(m.root.children));
  const achou = lib.searchTopics('agulha-profunda'); assert.ok(achou.length >= 1, 'busca encontra tópico no nível 77');
  const g = raw(400); g.meta.name = 'Gigante'; const gid = lib.saveMap(g, { verify: true }); assert.ok(lib.loadMap(gid));
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

test('estudo: resumo, revisões e agenda enxergam tópicos em qualquer profundidade', () => {
  const { m, ids } = chain(MAX_DEPTH);
  m.mutateStudy(ids[ids.length - 1], (st) => S.setNext(st, S.addDays(TODAY, -3)));
  m.mutateStudy(ids[49], (st) => S.setNext(st, S.addDays(TODAY, 0)));
  const sum = S.summary(m, { today: TODAY });
  assert.ok(sum.due.some((d) => d.title === 'Nível ' + MAX_DEPTH && d.overdue === 3), 'revisão atrasada no nível mais fundo aparece');
  assert.ok(sum.due.some((d) => d.title === 'Nível 50' && d.path.length === 49), 'o caminho (breadcrumb) tem 49 ancestrais');
  const plan = exportPlan(m, { today: TODAY }); assert.ok(JSON.stringify(plan).includes('Nível ' + MAX_DEPTH), 'o planejamento inclui o tópico mais fundo');
});

test('exportações: Markdown/OPML do mapa fundo voltam com a mesma profundidade e os mesmos títulos', () => {
  const { m } = chain(MAX_DEPTH);
  for (const volta of [fromMarkdown(toMarkdown(m), 'x'), fromOPML(toOPML(m), 'x')]) {
    let n = 0, p = volta.root; while (p.children[0]) { p = p.children[0]; n++; }
    assert.equal(n, MAX_DEPTH); assert.equal(p.title, 'Nível ' + MAX_DEPTH);
  }
  // progresso da folha mais funda entra no cálculo geral do relatório
  let f = m.root; while (f.children[0]) f = f.children[0]; f.progress = 100;
  assert.match(R.toStudyMarkdown(m, { today: TODAY }), /1 de 1 tópicos concluídos/);
});

test('layout e SVG: mapa fundo e largo (100 níveis × ramos) não quebra nem gera coordenadas inválidas', () => {
  const m = new MindMap(createNode('Raiz')); let p = m.root;
  for (let i = 0; i < MAX_DEPTH - 1; i++) { p = m.addChild(p.id, 'Nível ' + i); for (let j = 0; j < 3; j++) m.addChild(p.id, `folha ${i}.${j}`); }
  const L = layoutMap(m); const pos = L.nodes || L.boxes || L;
  const lista = Array.isArray(pos) ? pos : Object.values(pos);
  for (const b of lista) for (const k of ['x', 'y']) if (k in b) assert.ok(Number.isFinite(b[k]), 'coordenada inválida em ' + b.id);
  const svg = toSVG(m); assert.ok(svg.length > 1000 && !/NaN|undefined/.test(svg), 'SVG sem NaN/undefined');
});

test('árvore LARGA e funda: 3000 tópicos distribuídos (ramificação 4) passa por salvar/ler/estudo/rede em tempo razoável', () => {
  const m = new MindMap(createNode('Raiz')); let frente = [m.root], total = 0, t0 = Date.now();
  m.batch(() => { for (let nivel = 0; nivel < 6 && total < 3000; nivel++) { const prox = []; for (const pai of frente) for (let k = 0; k < 4 && total < 3000; k++) { prox.push(m.addChild(pai.id, `n${nivel}-${total}`)); total++; } frente = prox; } });
  assert.equal(total, 3000);
  readMom(writeMom(m)); S.summary(m, { today: TODAY }); buildGraph([{ key: 'k', name: 'L', map: m }], { hierarchy: true }); toSVG(m);
  const lib = openLibrary(':memory:'); m.meta.name = 'Larga'; lib.loadMap(lib.saveMap(m, { verify: true }));
  assert.ok(Date.now() - t0 < 15000, 'demorou ' + (Date.now() - t0) + ' ms');
});
