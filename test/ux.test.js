'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { MindMap, createNode } = require('../core/components/model')
const { toSVG } = require('../core/components/svg');;
const { layoutMap } = require('../core/components/layout');
const { plainLinks } = require('../core/components/links');

function tree() {
  const m = new MindMap(createNode('R'));
  const a = m.addChild(m.root.id, 'A'), b = m.addChild(m.root.id, 'B');
  const a1 = m.addChild(a.id, 'A1'); m.addChild(a1.id, 'A1a'); m.addChild(a.id, 'A2'); m.addChild(b.id, 'B1');
  m._undo.length = 0;
  return { m, a, b, a1 };
}
const visible = (m) => [...layoutMap(m).boxes.values()].map((x) => x.node.title).sort();

test('showLevels: recolhe por profundidade, expande tudo, uma única ação desfazível, sem mudança = 0', () => {
  const { m } = tree();
  assert.equal(visible(m).length, 7);
  assert.ok(m.showLevels(1) > 0);
  assert.deepEqual(visible(m), ['A', 'B', 'R'], 'nível 1: raiz + disciplinas');
  m.showLevels(2);
  assert.deepEqual(visible(m), ['A', 'A1', 'A2', 'B', 'B1', 'R'], 'nível 2: um nível a mais; folhas intactas');
  m.showLevels(Infinity);
  assert.equal(visible(m).length, 7, 'expandir tudo');
  assert.equal(m.showLevels(Infinity), 0, 'já estava expandido: nada muda');
  assert.equal(m._undo.length, 3, 'só 3 pontos de desfazer (a chamada sem efeito não cria nenhum)');
  m.showLevels(1); assert.ok(m.undo()); assert.equal(visible(m).length, 7, 'um desfazer reverte a ação inteira');
  assert.equal(m.showLevels(0) > 0, true); assert.deepEqual(visible(m), ['R'], 'nível 0: só a raiz');
});

test('indicador de nota é um ícone vetorial (não um glifo de fonte) e só aparece com nota', () => {
  const { m, a } = tree();
  assert.doesNotMatch(toSVG(m), /note-icon/);
  m.update(a.id, { notes: 'x' });
  const svg = toSVG(m);
  assert.match(svg, /class="note-icon"/); assert.doesNotMatch(svg, /✎/);
});
