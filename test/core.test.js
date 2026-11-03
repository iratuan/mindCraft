'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { MindMap, createNode } = require('../core/model');
const { readMom, writeMom } = require('../core/mom');
const { layoutMap } = require('../core/layout');
const { THEMES } = require('../core/themes');

function sample() {
  const m = new MindMap(createNode('Raiz'));
  const a = m.addChild(m.root.id, 'A');
  m.addChild(a.id, 'A1');
  const b = m.addChild(m.root.id, 'B & <C>');
  m.update(b.id, { notes: 'nota\nlinha 2' });
  return m;
}

test('undo/redo e move sem ciclo', () => {
  const m = sample();
  const a = m.root.children[0];
  assert.equal(m.move(a.id, a.children[0].id), false, 'não pode mover para dentro de si');
  assert.equal(m.move(a.children[0].id, m.root.id), true);
  assert.equal(m.root.children.length, 3);
  assert.ok(m.undo());
  assert.equal(m.root.children.length, 2);
  assert.ok(m.redo());
  assert.equal(m.root.children.length, 3);
});

test('round-trip .mom preserva árvore, notas e ordem', () => {
  const m = sample();
  const back = readMom(writeMom(m));
  assert.equal(back.root.title, 'Raiz');
  assert.deepEqual(back.root.children.map((c) => c.title), ['A', 'B & <C>']);
  assert.equal(back.root.children[1].notes, 'nota\nlinha 2');
  assert.equal(back.root.children[0].children[0].title, 'A1');
});

test('layout: sem sobreposição entre irmãos, em todos os temas', () => {
  const m = new MindMap(createNode('R'));
  for (let i = 0; i < 6; i++) { const c = m.addChild(m.root.id, 'Filho ' + i); for (let j = 0; j < 3; j++) m.addChild(c.id, 'Neto ' + i + j); }
  for (const t of Object.keys(THEMES)) {
    const L = layoutMap(m, { theme: t });
    const bs = [...L.boxes.values()];
    for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
      const p = bs[i], q = bs[j];
      const overlap = p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.h && q.y < p.y + p.h;
      assert.ok(!overlap, `${t}: ${p.node.title} sobrepõe ${q.node.title}`);
    }
  }
});

test('writeMom lança erro de E/S em vez de fingir sucesso (regressão do writeZip)', () => {
  const fs = require('fs'), os = require('os'), path = require('path');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-'));
  fs.writeFileSync(path.join(dir, 'arquivo'), 'x');
  assert.throws(() => writeMom(sample(), path.join(dir, 'arquivo', 'a.mom')));
  const ok = path.join(dir, 'ok çã.mom');
  writeMom(sample(), ok);
  assert.equal(readMom(fs.readFileSync(ok)).root.title, 'Raiz');
  fs.rmSync(dir, { recursive: true, force: true });
});
