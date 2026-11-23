'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { buildGraph } = require('../core/components/graph');

const topic = (title, notes = '') => ({ id: title, title, notes, children: [], markers: [], progress: null });
const mapOf = (kids) => ({ root: { id: 'r', title: 'Raiz', notes: '', children: kids, markers: [] }, meta: {}, find: () => null });

test('peso da rede: tópico muito citado pesa mais que um isolado, é determinístico e limitado', () => {
  const m = mapOf([topic('A', 'veja [[Hub]]'), topic('B', 'veja [[Hub]]'), topic('C', 'veja [[Hub]]'), topic('Hub'), topic('Solto')]);
  const g1 = buildGraph([{ key: 'k', name: 'M', map: m }]);
  const g2 = buildGraph([{ key: 'k', name: 'M', map: m }]);
  const w = (g, t) => g.nodes.find((n) => n.title === t).importance;
  assert.ok(w(g1, 'Hub') > w(g1, 'A'));
  assert.ok(w(g1, 'A') > w(g1, 'Solto'));
  assert.strictEqual(w(g1, 'Hub'), w(g2, 'Hub'));
  assert.ok(g1.nodes.every((n) => Number.isFinite(n.importance) && n.rank >= 0 && n.rank <= 1));
  assert.strictEqual(Math.max(...g1.nodes.map((n) => n.rank)), 1);
});

test('peso da rede: link para tópico inexistente (fantasma) não quebra', () => {
  const g = buildGraph([{ key: 'k', name: 'M', map: mapOf([topic('A', '[[Nada]]')]) }]);
  assert.ok(g.nodes.every((n) => Number.isFinite(n.importance)));
});
