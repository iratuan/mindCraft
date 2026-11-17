'use strict';
// Material de estudo: peso por prioridade, notas, fontes (PDFs e páginas), conexões (setas e links) e saídas Markdown/HTML seguras.
const test = require('node:test');
const assert = require('node:assert');
const { MindMap, createNode } = require('../core/components/model');
const { buildStudyDoc, toMarkdown, toHtml, weightOf } = require('../core/formats/study-export');

function sample() {
  const m = new MindMap(createNode('Direito'));
  const a = m.addChild(m.root.id, 'Administrativo');
  const b = m.addChild(m.root.id, 'Constitucional');
  m.toggleMarker(b.id, 'p1');
  m.toggleMarker(a.id, 'p3');
  m.addChild(b.id, 'Direitos fundamentais');
  m.update(b.id, { notes: 'Veja [[Administrativo]] e **negrito**' });
  m.meta.pdfs = [{ id: 'pdf1', name: 'CF88.pdf', path: '/x/cf.pdf' }];
  m.update(b.id, { refs: [{ pdf: 'pdf1', page: 5, quote: 'Art. 5º', rects: [] }] });
  m.addRelation(a.id, b.id, 'depende de');
  return m;
}

test('peso: prioridade 1 vale mais que 2 e 3; sem marcador vale zero', () => {
  const m = sample();
  const b = m.root.children[1];
  assert.strictEqual(weightOf(b), 3);
  assert.strictEqual(weightOf(m.root.children[0]), 1);
  assert.strictEqual(weightOf(m.root), 0);
});

test('ordenar por peso: o tópico mais importante vem primeiro entre irmãos (estável)', () => {
  const m = sample();
  const doc = buildStudyDoc(m, { byWeight: true });
  assert.deepStrictEqual(doc.topics[0].children.map((t) => t.title), ['Constitucional', 'Administrativo']);
  const plain = buildStudyDoc(m, { byWeight: false });
  assert.deepStrictEqual(plain.topics[0].children.map((t) => t.title), ['Administrativo', 'Constitucional']);
});

test('numeração hierárquica no sumário e nos títulos', () => {
  const doc = buildStudyDoc(sample());
  assert.strictEqual(doc.topics[0].num, '1');
  assert.strictEqual(doc.topics[0].children[0].num, '1.1');
  assert.strictEqual(doc.topics[0].children[0].children[0].num, '1.1.1');
});

test('notas entram quando ligadas e saem quando desligadas', () => {
  const m = sample();
  const com = toMarkdown(buildStudyDoc(m, { notes: true }));
  const sem = toMarkdown(buildStudyDoc(m, { notes: false }));
  assert.match(com, /\*\*negrito\*\*/);
  assert.ok(!sem.includes('negrito'));
});

test('fontes: PDF vinculado com página e trecho, e lista final de fontes', () => {
  const m = sample();
  const md = toMarkdown(buildStudyDoc(m, { sources: true }));
  assert.match(md, /> Fonte: CF88\.pdf, p\. 5 — “Art\. 5º”/);
  assert.match(md, /## Fontes[\s\S]*CF88\.pdf \(1 trecho/);
  const off = toMarkdown(buildStudyDoc(m, { sources: false }));
  assert.ok(!off.includes('Fonte:'));
});

test('conexões: setas com rótulo nos dois sentidos e links [[ ]] do texto', () => {
  const m = sample();
  const md = toMarkdown(buildStudyDoc(m, { links: true }));
  assert.match(md, /Liga a: \*\*Constitucional\*\* \(depende de\)/);
  assert.match(md, /Ligado por: \*\*Administrativo\*\* \(depende de\)/);
  assert.match(md, /Link no texto: \[\[Administrativo\]\]/);
});

test('HTML: tudo do usuário é escapado; a nota passa pelo renderizador seguro', () => {
  const m = sample();
  m.update(m.root.children[0].id, { notes: '<img src=x onerror=alert(1)> texto' });
  m.update(m.root.id, { title: '<script>x</script>' });
  const html = toHtml(buildStudyDoc(m));
  assert.ok(!html.includes('<script>x</script>'), 'título não pode injetar script');
  assert.ok(!/<img src=x/.test(html), 'nota não pode injetar HTML');
  assert.match(html, /<!doctype html>/);
  assert.match(html, /@page \{ size: A4/);
});
