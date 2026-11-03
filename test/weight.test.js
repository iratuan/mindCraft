'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { MindMap, createNode } = require('../core/model');
const { buildGraph } = require('../core/graph');

// Peso do tópico (tamanho do ponto na rede 3D) = filhos diretos + nota + ligações (links e setas)
test('peso: filhos diretos, nota e ligações entram na conta', () => {
  const m = new MindMap(createNode('Raiz'));
  const a = m.addChild(m.root.id, 'A');
  m.addChild(a.id, 'A1'); m.addChild(a.id, 'A2'); m.addChild(a.id, 'A3');   // 3 filhos
  m.update(a.id, { notes: 'uma nota' });                                   // +1 nota
  const b = m.addChild(m.root.id, 'B');
  m.addRelation(a.id, b.id);                                               // +1 seta (A e B)
  const g = buildGraph([{ key: 'k', name: 'Mapa', map: m }]);
  const na = g.nodes.find((n) => n.title === 'A');
  assert.strictEqual(na.childCount, 3);
  assert.strictEqual(na.hasNote, true);
  assert.strictEqual(na.weight, 3 + 1 + na.deg);
  assert.ok(na.deg >= 1, 'a seta conta como ligação');
  const nb = g.nodes.find((n) => n.title === 'B');
  assert.strictEqual(nb.childCount, 0);
  assert.strictEqual(nb.hasNote, false);
  assert.strictEqual(nb.weight, nb.deg);
});

test('peso: nota só com espaços não conta', () => {
  const m = new MindMap(createNode('Raiz'));
  const a = m.addChild(m.root.id, 'A');
  m.update(a.id, { notes: '   \n  ' });
  const g = buildGraph([{ key: 'k', name: 'Mapa', map: m }]);
  assert.strictEqual(g.nodes.find((n) => n.title === 'A').hasNote, false);
});
