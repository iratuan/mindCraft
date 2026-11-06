'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { MindMap, createNode } = require('../core/model');
const { buildObsidianVault, safeName, fingerprint } = require('../core/obsidian');

const T = (m, title) => { let r; m.walk((n) => { if (n.title === title && !r) r = n; }); return r; };
const noteOf = (files, title, mapName) => files.find((f) => f.path === `MindCraft/${mapName}/${title}.md`);

/** Dois mapas com links cruzados, relação, hierarquia, fantasmas e um título repetido ("Atos") em mapas diferentes. */
function twoMaps() {
  const dc = new MindMap(createNode('Direito Constitucional'));
  const princ = dc.addChild(dc.root.id, 'Princípios'); dc.addChild(dc.root.id, 'Legalidade'); dc.addChild(dc.root.id, 'Direitos Fundamentais');
  dc.addChild(dc.root.id, 'Atos');
  dc.update(princ.id, { notes: 'Ver [[Direito Administrativo#Princípios da Administração]] e [[legalidade]].' });
  dc.update(T(dc, 'Direitos Fundamentais').id, { notes: 'exemplo em código: `[[ignorado]]`' });
  const da = new MindMap(createNode('Direito Administrativo'));
  const pa = da.addChild(da.root.id, 'Princípios da Administração'); const atos = da.addChild(da.root.id, 'Atos');
  da.update(pa.id, { notes: 'base: [[Direito Constitucional#Legalidade|legalidade constitucional]]' });
  da.update(atos.id, { notes: '[[Tópico inexistente]] · [[Mapa Fantasma#X]] · [[Atos]] mesmo' });
  da.addRelation(pa.id, atos.id, 'fundamenta');
  return [{ key: '/v/Direito Constitucional.mom', name: 'Direito Constitucional', map: dc }, { key: '/v/Direito Administrativo.mom', name: 'Direito Administrativo', map: da }];
}

test('safeName: remove caracteres proibidos, evita nomes reservados e vazios', () => {
  assert.equal(safeName('a/b:c*?"<>|#^[x]'), 'a b c x');
  assert.equal(safeName('CON'), 'CON (nota)');
  assert.equal(safeName('   '), 'Sem título');
  assert.equal(safeName('...'), 'Sem título');
  assert.ok(safeName('x'.repeat(300)).length <= 120);
});

test('fingerprint: estável e sensível a qualquer alteração', () => {
  assert.equal(fingerprint('abc'), fingerprint('abc'));
  assert.notEqual(fingerprint('abc'), fingerprint('abd'));
});

test('exporta uma nota por tópico, em pastas por mapa, com caminhos únicos dentro de MindCraft/', () => {
  const { files, stats } = buildObsidianVault(twoMaps());
  assert.equal(files.length, 8, 'DC: raiz+3+Atos = 5; DA: raiz+2 = 3');
  assert.equal(stats.notes, 8);
  const paths = files.map((f) => f.path);
  assert.equal(new Set(paths.map((p) => p.toLowerCase())).size, paths.length, 'nenhum caminho repetido');
  assert.ok(paths.every((p) => p.startsWith('MindCraft/') && p.endsWith('.md')));
  assert.ok(noteOf(files, 'Atos', 'Direito Constitucional'), 'título repetido em outro mapa não se confunde');
  assert.ok(noteOf(files, 'Atos', 'Direito Administrativo'));
});

test('[[Mapa#Tópico]] vira link com caminho completo (o Obsidian resolve sem ambiguidade) e preserva o texto', () => {
  const { files } = buildObsidianVault(twoMaps());
  const princ = noteOf(files, 'Princípios', 'Direito Constitucional').content;
  assert.ok(princ.includes('[[MindCraft/Direito Administrativo/Princípios da Administração|Princípios da Administração]]'), princ);
  assert.ok(princ.includes('[[MindCraft/Direito Constitucional/Legalidade|legalidade]]'), 'sem alias, mostra o texto original');
  const pa = noteOf(files, 'Princípios da Administração', 'Direito Administrativo').content;
  assert.ok(pa.includes('[[MindCraft/Direito Constitucional/Legalidade|legalidade constitucional]]'), 'alias preservado');
});

test('links para tópicos inexistentes viram links "fantasmas" (como no Obsidian); código não é tratado como link', () => {
  const { files } = buildObsidianVault(twoMaps());
  const atos = noteOf(files, 'Atos', 'Direito Administrativo').content;
  assert.ok(atos.includes('[[Tópico inexistente|Tópico inexistente]]'));
  assert.ok(atos.includes('[[Mapa Fantasma X|Mapa Fantasma#X]]'));
  const dr = noteOf(files, 'Direitos Fundamentais', 'Direito Constitucional').content;
  assert.ok(dr.includes('`[[ignorado]]`'), 'código de exemplo fica como está');
});

test('hierarquia e relações viram links no fim da nota (pai, subtópicos, setas)', () => {
  const { files } = buildObsidianVault(twoMaps());
  const pa = noteOf(files, 'Princípios da Administração', 'Direito Administrativo').content;
  assert.ok(pa.includes('Parte de: [[MindCraft/Direito Administrativo/Direito Administrativo|Direito Administrativo]]'));
  assert.ok(pa.includes('- → fundamenta [[MindCraft/Direito Administrativo/Atos|Atos]]'));
  const atos = noteOf(files, 'Atos', 'Direito Administrativo').content;
  assert.ok(atos.includes('- ← fundamenta [[MindCraft/Direito Administrativo/Princípios da Administração|Princípios da Administração]]'));
  const raiz = noteOf(files, 'Direito Administrativo', 'Direito Administrativo').content;
  assert.ok(raiz.includes('## Subtópicos') && raiz.includes('- [[MindCraft/Direito Administrativo/Atos|Atos]]'));
});

test('frontmatter: id da origem, mapa, alias, tag e hash para detectar edição', () => {
  const { files } = buildObsidianVault(twoMaps());
  const c = noteOf(files, 'Atos', 'Direito Administrativo').content;
  assert.ok(c.startsWith('---\nmindcraft-id: "Direito Administrativo::'), c.slice(0, 120));
  assert.ok(c.includes('mapa: "Direito Administrativo"'));
  assert.ok(c.includes('aliases:\n  - "Atos"'));
  assert.ok(c.includes('tags:\n  - mindcraft'));
  assert.match(c, /\nmindcraft-hash: "[0-9a-f]+"\n---\n# Atos\n/);
});

test('saída determinística: exportar o mesmo mapa duas vezes dá o mesmo resultado', () => {
  const m = twoMaps();
  assert.deepEqual(buildObsidianVault(m).files, buildObsidianVault(m).files);
});

test('dois mapas com o mesmo nome ganham pastas diferentes', () => {
  const a = new MindMap(createNode('Direito')); a.addChild(a.root.id, 'X');
  const b = new MindMap(createNode('Direito')); b.addChild(b.root.id, 'Y');
  const { files } = buildObsidianVault([{ key: '/a.mom', name: 'Direito', map: a }, { key: '/b.mom', name: 'Direito', map: b }]);
  const dirs = new Set(files.map((f) => f.path.split('/')[1]));
  assert.deepEqual([...dirs].sort(), ['Direito', 'Direito (2)']);
});

test('mapa vazio ou sem tópicos não gera notas', () => {
  assert.equal(buildObsidianVault([]).files.length, 0);
});
