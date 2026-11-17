'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AdmZip = require('adm-zip');
const { MindMap, createNode } = require('../core/components/model');
const { buildGraph, neighborhood } = require('../core/components/graph');
const { writeMom, readMom } = require('../core/formats/mom');

function mk() {
  const m = new MindMap(createNode('Direito'));
  const a = m.addChild(m.root.id, 'Crase'), b = m.addChild(m.root.id, 'Regência'), c = m.addChild(m.root.id, 'Isolado');
  return { m, a, b, c };
}
const g1 = (m) => buildGraph([{ key: 'k', name: 'Direito', map: m }]);

test('uma relação desenhada é uma conexão lógica da rede: saída em A, entrada (retrolink) em B, vizinhança e grau', () => {
  const { m, a, b, c } = mk(); m.addRelation(a.id, b.id, 'depende de');
  const g = g1(m), A = g.idOf('k', a.id), B = g.idOf('k', b.id);
  assert.deepEqual(g.outgoing(A).map((e) => [e.type, e.to, e.label]), [['relation', B, 'depende de']]);
  assert.deepEqual(g.incoming(B).map((e) => [e.type, e.from]), [['relation', A]]);
  assert.equal(g.byId.get(A).deg, 1); assert.equal(g.byId.get(B).deg, 1); assert.equal(g.byId.get(g.idOf('k', c.id)).deg, 0);
  assert.deepEqual(neighborhood(g, A, 1).nodes.map((n) => n.title).sort(), ['Crase', 'Regência']);
});

test('apagar a relação desfaz a conexão (e desfazer a traz de volta); nada fica escrito nas notas', () => {
  const { m, a, b } = mk(); const r = m.addRelation(a.id, b.id, 'x');
  m.removeRelation(r.id); assert.equal(g1(m).edges.length, 0); assert.equal(m.find(a.id).node.notes, '');
  assert.ok(m.undo()); assert.equal(g1(m).edges.length, 1);
});

test('relação + [[link]] entre o mesmo par: duas arestas de tipos diferentes (a interface as junta numa só linha)', () => {
  const { m, a, b } = mk(); m.addRelation(a.id, b.id, 'x'); m.update(a.id, { notes: 'ver [[Regência]]' });
  assert.deepEqual(g1(m).edges.map((e) => e.type).sort(), ['link', 'relation']);
});
