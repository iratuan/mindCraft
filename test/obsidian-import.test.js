'use strict';
// Detecção de notas editadas no Obsidian: o importador só deve devolver notas geradas pelo MindCraft cujo hash mudou.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { MindMap, createNode } = require('../core/components/model');
const { buildObsidianVault } = require('../core/services/obsidian');
const { readOurs, detectEditedNotes } = require('../core/services/obsidian-import');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'mc-imp-'));
const at = (dir, rel) => path.join(dir, ...rel.split('/'));

function vault() {
  const dir = tmp();
  const map = new MindMap(createNode('Direito'));
  const child = map.addChild(map.root.id, 'Legalidade');
  map.update(child.id, { notes: 'Princípio da legalidade' });
  const files = buildObsidianVault([{ key: '/v/d.mom', name: 'Direito', map }]).files;
  for (const f of files) {
    const p = at(dir, f.path);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, f.content);
  }
  return { dir, files };
}

const notePath = (files) => files.find((f) => f.path.endsWith('Legalidade.md')).path;

test('nota recém-exportada não é considerada editada e devolve id e corpo', () => {
  const { dir, files } = vault();
  const ours = readOurs(fs.readFileSync(at(dir, notePath(files)), 'utf8'));
  assert.ok(ours, 'a nota gerada tem frontmatter do MindCraft');
  assert.equal(ours.edited, false);
  assert.match(ours.id, /^Direito::/);
  assert.match(ours.body, /# Legalidade/);
  assert.match(ours.body, /Princípio da legalidade/);
});

test('editar o corpo no Obsidian marca a nota como editada', () => {
  const { dir, files } = vault();
  const p = at(dir, notePath(files));
  fs.appendFileSync(p, '\nanotação feita no Obsidian\n');
  const ours = readOurs(fs.readFileSync(p, 'utf8'));
  assert.equal(ours.edited, true);
  assert.match(ours.body, /anotação feita no Obsidian/);
});

test('sem hash ou com hash trocado a nota é considerada editada', () => {
  const { dir, files } = vault();
  const p = at(dir, notePath(files));
  const text = fs.readFileSync(p, 'utf8');
  fs.writeFileSync(p, text.replace(/^mindcraft-hash: .*\n/m, ''));
  assert.equal(readOurs(fs.readFileSync(p, 'utf8')).edited, true);
  fs.writeFileSync(p, text.replace(/^mindcraft-hash: .*/m, 'mindcraft-hash: "00000000a"'));
  assert.equal(readOurs(fs.readFileSync(p, 'utf8')).edited, true);
});

test('nota do usuário sem mindcraft-id é ignorada', () => {
  const dir = tmp();
  const p = at(dir, 'MindCraft/Minha nota.md');
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, '---\ntags:\n  - pessoal\n---\n# Minha nota\n');
  assert.equal(readOurs(fs.readFileSync(p, 'utf8')), null);
});

test('detectEditedNotes encontra só as notas alteradas, em pastas aninhadas', () => {
  const { dir, files } = vault();
  const editedPath = notePath(files);
  fs.appendFileSync(at(dir, editedPath), '\nedição no Obsidian\n');
  const other = at(dir, 'MindCraft/Outra.md');
  fs.mkdirSync(path.dirname(other), { recursive: true });
  fs.writeFileSync(other, '# Minha nota\n');
  const found = detectEditedNotes(dir);
  assert.equal(found.length, 1);
  assert.equal(found[0].path.replace(/\\/g, '/'), editedPath);
  assert.match(found[0].id, /^Direito::/);
  assert.match(found[0].body, /edição no Obsidian/);
  assert.equal(found[0].fullPath, at(dir, editedPath));
});

test('vault sem a pasta MindCraft não tem notas editadas', () => {
  assert.deepStrictEqual(detectEditedNotes(tmp()), []);
});
