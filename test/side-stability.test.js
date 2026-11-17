'use strict';
// Expandir ou recolher ramos NÃO pode trocar o lado dos tópicos principais (o lado depende da altura completa dos ramos).
const test = require('node:test');
const assert = require('node:assert');
const { MindMap, createNode } = require('../core/components/model');
const { layoutMap } = require('../core/components/layout');

function build() {
  const m = new MindMap(createNode('Raiz'));
  const a = m.addChild(m.root.id, 'A');
  for (let i = 0; i < 4; i++) { const c = m.addChild(a.id, 'a' + i); m.addChild(c.id, 'x' + i); m.addChild(c.id, 'y' + i); }
  m.addChild(m.root.id, 'B'); m.addChild(m.root.id, 'C');
  return m;
}
const sides = (m) => m.root.children.map((c) => layoutMap(m).boxes.get(c.id).side);

test('recolher e expandir um ramo não muda o lado de nenhum tópico principal', () => {
  const m = build();
  const s0 = sides(m);
  m.update(m.root.children[0].id, { collapsed: true });
  assert.deepStrictEqual(sides(m), s0, 'ao recolher');
  m.update(m.root.children[0].id, { collapsed: false });
  assert.deepStrictEqual(sides(m), s0, 'ao expandir');
  m.update(m.root.children[0].children[0].id, { collapsed: true });
  assert.deepStrictEqual(sides(m), s0, 'ao recolher um neto');
});

test('os subtópicos continuam do mesmo lado do pai ao recolher', () => {
  const m = build();
  const a = m.root.children[0];
  m.update(a.id, { collapsed: true });
  const L = layoutMap(m);
  assert.ok(!L.boxes.has(a.children[0].id), 'recolhido: filhos escondidos');
  m.update(a.id, { collapsed: false });
  const L2 = layoutMap(m);
  for (const c of a.children) assert.strictEqual(L2.boxes.get(c.id).side, L2.boxes.get(a.id).side);
});
