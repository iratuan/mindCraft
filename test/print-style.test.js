'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { MindMap, createNode } = require('../core/model');
const { buildStudyDoc, toHtml } = require('../core/study-export');
const { toFlowHtml } = require('../core/flow-export');
const f = require('../core/flow');
const { printCss, weightClass } = require('../core/print-style');

test('estilo: escala de tamanhos única (texto 10pt, notas 9,5pt, títulos decrescentes)', () => {
  const css = printCss();
  assert.match(css, /body \{[^}]*font-size: 10pt/);
  assert.match(css, /h1 \{ font-size: 18pt/);
  assert.match(css, /h2 \{ font-size: 12\.5pt/);
  assert.match(css, /h3 \{ font-size: 11pt/);
  assert.match(css, /\.notes \{ font-size: 9\.5pt/);
  assert.match(css, /\.notes h1, \.notes h2[^}]*font-size: 9\.5pt/, 'títulos dentro das notas ficam no tamanho do texto');
  assert.doesNotMatch(css, /font-size: 1[4-9]pt[^}]*\.notes/, 'nenhuma nota com fonte grande');
});

test('peso do título: prioridade 1 é o mais pesado; sem prioridade, peso normal', () => {
  assert.strictEqual(weightClass('p1'), 'w3');
  assert.strictEqual(weightClass('p2'), 'w2');
  assert.strictEqual(weightClass('p3'), 'w1');
  assert.strictEqual(weightClass(null), 'w0');
  const css = printCss();
  assert.match(css, /\.w3 > h2, \.w3 > h3, \.w3 > h4 \{ font-weight: 700/);
  const m = new MindMap(createNode('Raiz'));
  const a = m.addChild(m.root.id, 'Importante');
  m.toggleMarker(a.id, 'p1');
  const html = toHtml(buildStudyDoc({ root: m.root, meta: m.meta }, {}));
  assert.ok(html.includes('class="topic d2 w3"'), 'o tópico (nível 2) com prioridade 1 sai com peso w3');
});

test('notas: o HTML de impressão usa a mesma escala do texto e não traz caixa de fundo', () => {
  const m = new MindMap(createNode('Raiz'));
  const a = m.addChild(m.root.id, 'Tema');
  m.update(a.id, { notes: '# Título da nota\n\nTexto com **negrito**.\n\n- item' });
  const html = toHtml(buildStudyDoc({ root: m.root, meta: m.meta }, {}));
  assert.match(html, /class="notes"/);
  assert.doesNotMatch(html, /background: #f6f6f4/, 'sem a caixa cinza antiga');
  assert.ok(html.includes('<strong>negrito</strong>') || html.includes('<b>negrito</b>'), 'negrito do Markdown continua');
});

test('fluxo: impressão usa a mesma base de estilo', () => {
  const m = f.createFlow('Fluxo');
  f.insertStepAfter(m, m.root.id, { title: 'Passo' });
  const html = toFlowHtml(m, {});
  assert.match(html, /font-size: 10pt/);
  assert.match(html, /\.diagram \{/);
});
