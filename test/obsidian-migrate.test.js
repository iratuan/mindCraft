'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { migrateLegacyLinks, parseLinks } = require('../core/links');
const { countForeignNotes, writeObsidianVault } = require('../core/obsidian-write');

const maps = new Set(['direito administrativo', 'mapa b']);
const hasMap = (n) => maps.has(n.toLowerCase());

test('[[Mapa#Tópico]] vira [[Mapa/Tópico]] quando o mapa existe; alias é mantido', () => {
  const r = migrateLegacyLinks('a [[Direito Administrativo#Atos]] e [[Direito Administrativo#Atos|ver]]', hasMap);
  assert.equal(r.text, 'a [[Direito Administrativo/Atos]] e [[Direito Administrativo/Atos|ver]]');
  assert.equal(r.count, 2);
});

test('o destino não muda: a forma nova aponta para o mesmo tópico que a antiga', () => {
  const before = parseLinks('[[Mapa B#Tema]]')[0];
  const after = parseLinks(migrateLegacyLinks('[[Mapa B#Tema]]', hasMap).text)[0];
  assert.deepEqual([after.map, after.topic, after.hashForm], [before.map, before.topic, false]);
});

test('não mexe em seção de nota, em mapa inexistente, em link sem tópico e em código', () => {
  const src = '[[Atos#Conceitos]] [[Mapa Fantasma#Tema]] [[Direito Administrativo#]] `[[Direito Administrativo#Atos]]`';
  const r = migrateLegacyLinks(src, hasMap);
  assert.equal(r.text, src);
  assert.equal(r.count, 0);
});

test('a conta de links padronizados bate com o que foi trocado', () => {
  const r = migrateLegacyLinks('[[Direito Administrativo#A]] [[Mapa B#B]] [[Atos#C]]', hasMap);
  assert.equal(r.count, 2);
  assert.equal(r.text, '[[Direito Administrativo/A]] [[Mapa B/B]] [[Atos#C]]');
});

test('countForeignNotes: conta só as notas fora de MindCraft/ e ignora pastas ocultas', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-foreign-'));
  fs.writeFileSync(path.join(dir, 'Minha nota.md'), 'x');
  fs.mkdirSync(path.join(dir, 'Direito'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Direito', 'Preposição.md'), 'x');
  fs.mkdirSync(path.join(dir, '.obsidian'));
  fs.writeFileSync(path.join(dir, '.obsidian', 'config.md'), 'x');
  assert.equal(countForeignNotes(dir), 2);
  writeObsidianVault(dir, [{ path: 'MindCraft/M/A.md', content: 'x' }]);
  assert.equal(countForeignNotes(dir), 2, 'notas do MindCraft não contam como suas');
});
