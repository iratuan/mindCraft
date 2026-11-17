'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { MindMap, createNode } = require('../core/components/model');
const { buildObsidianVault } = require('../core/services/obsidian');
const { writeObsidianVault } = require('../core/services/obsidian-write');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'mc-obs-'));
const T = (m, title) => { let r; m.walk((n) => { if (n.title === title && !r) r = n; }); return r; };
function maps() {
  const dc = new MindMap(createNode('Direito Constitucional'));
  const legal = dc.addChild(dc.root.id, 'Legalidade'); dc.update(legal.id, { notes: 'Princípio: [[Direito Constitucional]]' });
  const da = new MindMap(createNode('Direito Administrativo'));
  da.addChild(da.root.id, 'Atos');
  return [{ key: '/v/dc.mom', name: 'Direito Constitucional', map: dc }, { key: '/v/da.mom', name: 'Direito Administrativo', map: da }];
}
const abs = (dir, rel) => path.join(dir, ...rel.split('/'));
const list = (dir) => { const out = []; const walk = (d) => { for (const it of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, it.name); if (it.isDirectory()) walk(f); else out.push(f); } }; walk(dir); return out; };

test('primeira exportação grava todas as notas; a segunda não regrava nada', () => {
  const dir = tmp(); const { files } = buildObsidianVault(maps());
  const r1 = writeObsidianVault(dir, files);
  assert.equal(r1.written.length, files.length); assert.equal(r1.skipped.length, 0);
  for (const f of files) assert.equal(fs.readFileSync(abs(dir, f.path), 'utf8'), f.content);
  const r2 = writeObsidianVault(dir, files);
  assert.equal(r2.written.length, 0); assert.equal(r2.unchanged.length, files.length);
});

test('nota criada pelo usuário com o mesmo nome (sem mindcraft-id) nunca é sobrescrita', () => {
  const dir = tmp(); const { files } = buildObsidianVault(maps());
  const target = abs(dir, 'MindCraft/Direito Constitucional/Legalidade.md');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, '# Minha nota\nnão é do MindCraft\n');
  const r = writeObsidianVault(dir, files);
  assert.ok(r.skipped.some((s) => s.path.endsWith('Legalidade.md') && /sua com esse nome/.test(s.reason)));
  assert.equal(fs.readFileSync(target, 'utf8'), '# Minha nota\nnão é do MindCraft\n');
});

test('nota gerada e EDITADA no Obsidian (corpo ou cabeçalho) não é sobrescrita', () => {
  const dir = tmp(); const { files } = buildObsidianVault(maps());
  writeObsidianVault(dir, files);
  const body = abs(dir, 'MindCraft/Direito Administrativo/Atos.md');
  fs.appendFileSync(body, '\nminha anotação no Obsidian\n');
  const head = abs(dir, 'MindCraft/Direito Constitucional/Legalidade.md');
  fs.writeFileSync(head, fs.readFileSync(head, 'utf8').replace('tags:\n  - mindcraft', 'tags:\n  - mindcraft\n  - revisar'));
  const edited = fs.readFileSync(body, 'utf8');
  const r = writeObsidianVault(dir, files);
  assert.equal(r.skipped.length, 2);
  assert.ok(r.skipped.every((s) => /editada no Obsidian/.test(s.reason)));
  assert.equal(fs.readFileSync(body, 'utf8'), edited, 'a anotação do usuário continua no arquivo');
});

test('mudança no MindCraft atualiza a nota que o usuário não editou', () => {
  const dir = tmp(); const m = maps();
  writeObsidianVault(dir, buildObsidianVault(m).files);
  T(m[1].map, 'Atos').notes = 'texto novo';
  const r = writeObsidianVault(dir, buildObsidianVault(m).files);
  assert.ok(r.written.some((p) => p.endsWith('Atos.md')));
  assert.match(fs.readFileSync(abs(dir, 'MindCraft/Direito Administrativo/Atos.md'), 'utf8'), /texto novo/);
});

test('tópico removido no MindCraft: a nota antiga continua no disco e é contada como obsoleta', () => {
  const dir = tmp(); const m = maps();
  writeObsidianVault(dir, buildObsidianVault(m).files);
  m[1].map.removeNode ? m[1].map.removeNode(T(m[1].map, 'Atos').id) : m[1].map.root.children.splice(0, 1);
  const again = buildObsidianVault(m).files;
  const r = writeObsidianVault(dir, again);
  assert.equal(r.obsolete, 1);
  assert.ok(fs.existsSync(abs(dir, 'MindCraft/Direito Administrativo/Atos.md')), 'nada é apagado');
});

test('caminho que sai do vault é recusado', () => {
  const dir = tmp();
  const r = writeObsidianVault(dir, [{ path: '../fora.md', content: 'x' }]);
  assert.equal(r.written.length, 0);
  assert.equal(r.skipped[0].reason, 'caminho fora do vault');
  assert.equal(fs.existsSync(path.join(path.dirname(dir), 'fora.md')), false);
});

test('gravação atômica: nenhum arquivo temporário sobra', () => {
  const dir = tmp(); const { files } = buildObsidianVault(maps());
  writeObsidianVault(dir, files);
  assert.ok(list(dir).every((f) => !/\.tmp-\d+$/.test(f)));
});

test('pasta do vault inexistente dá erro claro', () => {
  assert.throws(() => writeObsidianVault(path.join(os.tmpdir(), 'nao-existe-mc-' + Date.now()), []), /A pasta do vault não existe/);
});
