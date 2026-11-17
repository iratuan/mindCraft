'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { MindMap, createNode } = require('../core/components/model');
const { buildStudyDoc, toHtml } = require('../core/formats/study-export');
const { toFlowHtml } = require('../core/formats/flow-export');
const f = require('../core/components/flow');
const { printCss, weightClass } = require('../core/formats/print-style');

test('estilo: escala de tamanhos única (títulos 16/12/10,5; texto 10; secundário 9)', () => {
  const css = printCss();
  assert.match(css, /body \{[^}]*font-size: 10pt/);
  assert.match(css, /h1 \{ font-size: 16pt/);
  assert.match(css, /h2 \{ font-size: 12pt/);
  assert.match(css, /h3 \{ font-size: 10\.5pt/);
  assert.match(css, /\.meta, \.src, \.links, \.ai-note, code, \.notes, \.notes table \{ font-size: 9pt/, 'notas e secundários no mesmo tamanho');
  assert.match(css, /\.notes h1, \.notes h2[^}]*font-size: 9pt/, 'títulos dentro das notas ficam no tamanho secundário');
  // só estes tamanhos aparecem no documento
  const sizes = new Set([...css.matchAll(/font-size:\s*([\d.]+)pt/g)].map((m) => m[1]));
  for (const s of sizes) assert.ok(['16', '12', '10.5', '10', '9'].includes(s) || s === '9', `tamanho fora da escala: ${s}pt`);
});

test('recuo: nenhum tópico aninhado acumula margem; listas dentro das notas têm recuo fixo por nível', () => {
  const css = printCss();
  assert.doesNotMatch(css, /\.topic \.topic \{[^}]*margin-left: [1-9]/, 'sem escada de recuo nos tópicos');
  assert.match(css, /\.notes ol ol \{ margin: 0; padding-left: 2\.5mm/, 'segundo nível de lista com recuo menor');
  assert.match(css, /\.notes ul ul ul[^}]*padding-left: 0/, 'a partir do terceiro nível o recuo não cresce');
  const m = new MindMap(createNode('Raiz'));
  const a = m.addChild(m.root.id, 'A'); const b = m.addChild(a.id, 'B'); m.addChild(b.id, 'C');
  const html = toHtml(buildStudyDoc({ root: m.root, meta: m.meta }, {}));
  assert.match(html, /\.topic \.topic \{ margin-left: 0; padding-left: 0; border-left: 0; \}/, 'estilo do material sem recuo acumulado');
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
