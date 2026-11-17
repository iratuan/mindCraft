'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { MindMap, createNode } = require('../core/components/model');
const { parseLinks } = require('../core/components/links');
const { buildObsidianVault } = require('../core/services/obsidian');

const T = (m, t) => { let r; m.walk((n) => { if (n.title === t && !r) r = n; }); return r; };
const noteOf = (files, title, mapName) => files.find((f) => f.path === `MindCraft/${mapName}/${title}.md`);

/** Sintaxe do Obsidian: [[Nota]], [[Pasta/Nota]], [[Nota#Seção]], [[Nota|texto]] e combinações. */
test('analisador: as formas de link do Obsidian viram campos estáveis', () => {
  const [a, b, c, d] = parseLinks('[[Atos]] [[Direito Administrativo/Atos#Conceitos|ver]] [[Atos#Conceitos]] [[MindCraft/Mapa/Tópico]]');
  assert.deepEqual([a.note, a.map, a.heading, a.alias], ['Atos', null, null, null]);
  assert.deepEqual([b.map, b.note, b.heading, b.alias, b.hashForm], ['Direito Administrativo', 'Atos', 'Conceitos', 'ver', false], 'caminho com seção e alias');
  assert.deepEqual([c.note, c.heading, c.hashForm], ['Atos', 'Conceitos', true], '# sem barra é ambíguo: resolvido depois');
  assert.deepEqual([d.map, d.topic], ['Mapa', 'Tópico'], 'o prefixo MindCraft/ da exportação não atrapalha');
});

test('[[Mapa#Tópico]] (legado) continua apontando para o tópico quando o mapa existe', () => {
  const m = new MindMap(createNode('Direito Administrativo'));
  m.addChild(m.root.id, 'Atos');
  const other = new MindMap(createNode('Mapa B'));
  other.update(other.root.id, { notes: 'veja [[Direito Administrativo#Atos]]' });
  const { files } = buildObsidianVault([
    { key: '/a.mom', name: 'Direito Administrativo', map: m },
    { key: '/b.mom', name: 'Mapa B', map: other },
  ]);
  const raiz = noteOf(files, 'Mapa B', 'Mapa B').content;
  assert.ok(raiz.includes('veja [[MindCraft/Direito Administrativo/Atos|Atos]]'), raiz);
});

test('[[Nota#Seção]] com seção existente: o link leva à seção; sem seção, vai para a nota e conta a falta', () => {
  const m = new MindMap(createNode('Direito'));
  const at = m.addChild(m.root.id, 'Atos');
  m.update(at.id, { notes: '## Conceitos\n\ntexto' });
  const src = m.addChild(m.root.id, 'Origem');
  m.update(src.id, { notes: 'ok [[Atos#Conceitos]] e [[Atos#Inexistente]]' });
  const { files, stats } = buildObsidianVault([{ key: '/d.mom', name: 'Direito', map: m }]);
  const origem = noteOf(files, 'Origem', 'Direito').content;
  assert.ok(origem.includes('[[MindCraft/Direito/Atos#Conceitos|Atos#Conceitos]]'), origem);
  assert.ok(origem.includes('[[MindCraft/Direito/Atos|Atos#Inexistente]]'), 'seção inexistente: link vai para a nota');
  assert.equal(stats.headingsMissing, 1);
});

test('[[Pasta/Nota]] aponta para um tópico de outro mapa pelo caminho, com alias', () => {
  const a = new MindMap(createNode('Constitucional'));
  a.addChild(a.root.id, 'Atos');
  const b = new MindMap(createNode('Administrativo'));
  b.update(b.root.id, { notes: 'Ver [[Constitucional/Atos|atos do Estado]].' });
  const { files } = buildObsidianVault([
    { key: '/a.mom', name: 'Constitucional', map: a },
    { key: '/b.mom', name: 'Administrativo', map: b },
  ]);
  const raiz = noteOf(files, 'Administrativo', 'Administrativo').content;
  assert.ok(raiz.includes('[[MindCraft/Constitucional/Atos|atos do Estado]]'), raiz);
});

test('título com alias e seção juntos: [[Atos#Conceitos|resumo]]', () => {
  const m = new MindMap(createNode('Direito'));
  const at = m.addChild(m.root.id, 'Atos'); m.update(at.id, { notes: '# Conceitos\n' });
  const src = m.addChild(m.root.id, 'Origem'); m.update(src.id, { notes: '[[Atos#Conceitos|resumo]]' });
  const { files } = buildObsidianVault([{ key: '/d.mom', name: 'Direito', map: m }]);
  assert.ok(noteOf(files, 'Origem', 'Direito').content.includes('[[MindCraft/Direito/Atos#Conceitos|resumo]]'));
});

test('a grafia da seção é comparada sem acento e sem caixa, como o Obsidian busca cabeçalhos', () => {
  const m = new MindMap(createNode('Direito'));
  const at = m.addChild(m.root.id, 'Atos'); m.update(at.id, { notes: '## Atos Vinculados\n' });
  const src = m.addChild(m.root.id, 'Origem'); m.update(src.id, { notes: '[[Atos#atos vinculados]]' });
  const { files, stats } = buildObsidianVault([{ key: '/d.mom', name: 'Direito', map: m }]);
  assert.ok(noteOf(files, 'Origem', 'Direito').content.includes('[[MindCraft/Direito/Atos#atos vinculados|Atos#atos vinculados]]'));
  assert.equal(stats.headingsMissing, 0);
});
