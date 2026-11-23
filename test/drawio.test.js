'use strict';
const test = require('node:test');
const assert = require('node:assert');
const flow = require('../core/components/flow');
const { toDrawio } = require('../core/formats/drawio');

function sample() {
  const m = flow.createFlow('Recurso & "Prazo" <1>');
  const d = flow.insertStepAfter(m, m.root.id, { type: 'decision', title: 'Cabe recurso?' });
  flow.addBranch(m, d.id, 'Sim', { type: 'step', title: 'Interpor <apelação>' });
  flow.addBranch(m, d.id, 'Não', { type: 'end', title: 'Fim' });
  return m;
}

test('drawio: formas, setas ortogonais com rótulo e geometria; texto do usuário escapado', () => {
  const xml = toDrawio(sample());
  assert.match(xml, /^<\?xml/);
  assert.strictEqual((xml.match(/vertex="1"/g) || []).length, 4);
  assert.strictEqual((xml.match(/edge="1"/g) || []).length, 3);
  assert.match(xml, /rhombus/);
  assert.match(xml, /edgeStyle=orthogonalEdgeStyle/);
  assert.match(xml, /value="Sim"/);
  assert.match(xml, /value="Não"/);
  assert.match(xml, /<mxGeometry x="-?\d+" y="\d+" width="\d+" height="\d+" as="geometry"\/>/);
  assert.ok(!/<apelação>/.test(xml) && !/value="[^"]*<[^"]*"/.test(xml), 'sem < cru dentro de atributos');
  // toda seta aponta para formas que existem
  const ids = new Set([...xml.matchAll(/<mxCell id="(n_[^"]+)"/g)].map((x) => x[1]));
  for (const m of xml.matchAll(/(?:source|target)="([^"]+)"/g)) assert.ok(ids.has(m[1]), m[1]);
});
