'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { MindMap, createNode } = require('../core/model');
const { layoutMap } = require('../core/layout');
const { toSVG } = require('../core/svg');
const { toDOCX, toPDF } = require('../core/export');
const { plainLinks } = require('../core/links');

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

test('plainLinks: [[ ]] viram texto legível em documentos de leitura (Word/PDF), mas o Markdown mantém', async () => {
  assert.equal(plainLinks('Veja [[Mapa#Tópico|aquilo]], [[Outro#Alvo]], [[Raiz]] e `[[código]]`.'), 'Veja aquilo, Alvo, Raiz e `[[código]]`.');
  assert.equal(plainLinks(''), ''); assert.equal(plainLinks(null), '');
  const { m, a } = tree(); m.update(a.id, { notes: 'base: [[Direito#Legalidade|legalidade]] e [[B]]' });
  const docx = new (require('adm-zip'))(await toDOCX(m)).getEntry('word/document.xml').getData().toString();
  assert.match(docx, /base: legalidade e B/); assert.doesNotMatch(docx, /\[\[/, 'sem colchetes no Word');
  assert.match(require('../core/export').toMarkdown(m), /\[\[Direito#Legalidade\|legalidade\]\]/, 'Markdown preserva os links');
  assert.equal((await toPDF(m, { outline: true })).subarray(0, 5).toString(), '%PDF-');
});

test('indicador de nota é um ícone vetorial (não um glifo de fonte) e só aparece com nota', () => {
  const { m, a } = tree();
  assert.doesNotMatch(toSVG(m), /note-icon/);
  m.update(a.id, { notes: 'x' });
  const svg = toSVG(m);
  assert.match(svg, /class="note-icon"/); assert.doesNotMatch(svg, /✎/);
});
