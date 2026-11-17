'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { MindMap, createNode } = require('../core/components/model');
const { parseParagraphs, LIMITS } = require('../core/services/ai');
const { buildStudyDoc, toMarkdown, toHtml } = require('../core/formats/study-export');

test('parágrafos da IA: separados por linha em branco, sem marcação, de 1 a 3', () => {
  const r = parseParagraphs('Primeiro.\n\n- Segundo\n\n## Terceiro\n\n');
  assert.ok(r.ok);
  assert.deepStrictEqual(r.paragraphs, ['Primeiro.', 'Segundo', 'Terceiro']);
  const muitos = Array.from({ length: 6 }, (_, i) => `Parágrafo ${i + 1}.`).join('\n\n');
  assert.strictEqual(parseParagraphs(muitos).paragraphs.length, LIMITS.paragraphs);
  assert.strictEqual(parseParagraphs('   ').ok, false);
});

test('material: tópico sem nota recebe os parágrafos gerados; com nota, não', () => {
  const m = new MindMap(createNode('Raiz'));
  const semNota = m.addChild(m.root.id, 'Sem nota');
  const comNota = m.addChild(m.root.id, 'Com nota');
  m.update(comNota.id, { notes: 'Nota do aluno' });
  const generated = new Map([[semNota.id, ['Parágrafo de revisão.']], [comNota.id, ['Não deve aparecer.']]]);
  const doc = buildStudyDoc({ root: m.root, meta: m.meta }, { generated });
  const md = toMarkdown(doc);
  assert.ok(md.includes('Parágrafo de revisão.'), 'tópico sem nota deve trazer o texto gerado');
  assert.ok(md.includes('gerado pela IA'), 'o texto gerado deve estar sinalizado');
  assert.ok(md.includes('Nota do aluno') && !md.includes('Não deve aparecer.'), 'nota existente tem prioridade');
  const html = toHtml(doc);
  assert.ok(html.includes('Parágrafo de revisão.') && !html.includes('Não deve aparecer.'));
});

test('material impresso: os tópicos saem sempre em duas colunas', () => {
  const m = new MindMap(createNode('Raiz'));
  m.addChild(m.root.id, 'Um');
  const html = toHtml(buildStudyDoc({ root: m.root, meta: m.meta }, {}));
  assert.ok(html.includes('<div class="cols">'), 'os tópicos devem estar num bloco de duas colunas');
  assert.ok(/\.cols\s*\{[^}]*column-count:\s*2/.test(html), 'o CSS deve definir duas colunas');
});
