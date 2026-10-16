'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AdmZip = require('adm-zip');
const { MindMap, createNode } = require('../core/model');
const { buildGraph, neighborhood } = require('../core/graph');
const { exportObsidian } = require('../core/obsidian');
const { toDOCX, toMarkdown } = require('../core/export');
const { writeMom, readMom } = require('../core/mom');

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

test('a relação é exportada ao Obsidian como [[link]] com o rótulo; o formato .mom guarda e recupera a relação', () => {
  const { m, a, b } = mk(); m.addRelation(a.id, b.id, 'depende de');
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-rel-')); exportObsidian([{ key: 'k', name: 'Direito', map: m }], out);
  const text = fs.readFileSync(path.join(out, 'Direito.md'), 'utf8'); fs.rmSync(out, { recursive: true, force: true });
  assert.match(text, /- Relacionado: \[\[Direito#Regência\]\] \(depende de\)/);
  const back = readMom(writeMom(m)); assert.equal(back.meta.relations.length, 1); assert.equal(g1(back).edges[0].type, 'relation');
});

test('Word: notas em Markdown saem como texto limpo (sem ** # - [ ] ...); Markdown exportado mantém o original', async () => {
  const { m, a } = mk(); m.update(a.id, { notes: '# Atenção\n**crase** antes de *palavra* feminina\n- [x] ler\n- [ ] revisar\n[[Regência]]' });
  const zip = new AdmZip(await toDOCX(m)); const xml = zip.readAsText('word/document.xml');
  assert.doesNotMatch(xml, /\*\*|# Atenção|\[ \]|\[x\]|\[\[/); assert.match(xml, /Atenção/); assert.match(xml, /crase antes de palavra feminina/); assert.match(xml, /☑ ler/); assert.match(xml, /☐ revisar/);
  assert.match(toMarkdown(m), /\*\*crase\*\*/);
});
