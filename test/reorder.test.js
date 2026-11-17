'use strict';
// Reordenar tópicos: moveSibling (Alt+↑/↓) e moveBeside (soltar entre irmãos ao arrastar).
const test = require('node:test');
const assert = require('node:assert');
const { MindMap, createNode } = require('../core/components/model');

const mk = () => {                                    // Raiz → A(a1,a2,a3), B, C, D
  const m = new MindMap(createNode('Raiz')); const id = {};
  for (const t of ['A', 'B', 'C', 'D']) id[t] = m.addChild(m.root.id, t).id;
  for (const t of ['a1', 'a2', 'a3']) id[t] = m.addChild(id.A, t).id;
  return { m, id };
};
const kids = (m, pid) => m.find(pid).node.children.map((c) => c.title).join(',');

test('moveBeside: ANTES e DEPOIS de um irmão (mesmo pai), em qualquer direção, sem perder nem duplicar ninguém', () => {
  const { m, id } = mk();
  assert.ok(m.moveBeside([id.D], id.A, 'before')); assert.strictEqual(kids(m, m.root.id), 'D,A,B,C');
  assert.ok(m.moveBeside([id.D], id.C, 'after')); assert.strictEqual(kids(m, m.root.id), 'A,B,C,D');
  assert.ok(m.moveBeside([id.A], id.C, 'after')); assert.strictEqual(kids(m, m.root.id), 'B,C,A,D');
  assert.ok(m.moveBeside([id.D], id.B, 'before')); assert.strictEqual(kids(m, m.root.id), 'D,B,C,A');
  assert.ok(m.moveBeside([id.B], id.C, 'before'), 'já está antes: continua válido'); assert.strictEqual(kids(m, m.root.id), 'D,B,C,A');
  let n = 0; m.walk(() => n++); assert.strictEqual(n, 8);
});

test('moveBeside: muda de pai ao mesmo tempo; vários tópicos mantêm a ordem do documento; os filhos vão junto', () => {
  const { m, id } = mk();
  assert.ok(m.moveBeside([id.C], id.a2, 'after')); assert.strictEqual(kids(m, id.A), 'a1,a2,C,a3'); assert.strictEqual(kids(m, m.root.id), 'A,B,D');
  const g = mk(); assert.ok(g.m.moveBeside([g.id.D, g.id.B], g.id.a1, 'before'), 'ids fora de ordem'); assert.strictEqual(kids(g.m, g.id.A), 'B,D,a1,a2,a3', 'ordem do documento (B antes de D), antes de a1');
  const h = mk(); assert.ok(h.m.moveBeside([h.id.A], h.id.D, 'after')); assert.strictEqual(kids(h.m, h.m.root.id), 'B,C,D,A'); assert.strictEqual(kids(h.m, h.id.A), 'a1,a2,a3', 'filhos acompanham');
  const k = mk(); assert.ok(k.m.moveBeside([k.id.B, k.id.C], k.id.D, 'after')); assert.strictEqual(kids(k.m, k.m.root.id), 'A,D,B,C');
});

test('moveBeside: recusa o que é inválido e não altera nada (raiz, si mesmo, dentro do próprio ramo, posição ruim, ids inexistentes)', () => {
  const { m, id } = mk(); const snap = JSON.stringify(m.toJSON());
  assert.strictEqual(m.moveBeside([id.A], m.root.id, 'before'), false, 'a raiz não tem irmãos');
  assert.strictEqual(m.moveBeside([id.A], id.A, 'after'), false); assert.strictEqual(m.moveBeside([id.A, id.B], id.B, 'before'), false, 'alvo dentro do grupo movido');
  assert.strictEqual(m.moveBeside([id.A], id.a2, 'after'), false, 'dentro do próprio ramo'); assert.strictEqual(m.moveBeside([id.B], id.C, 'meio'), false);
  assert.strictEqual(m.moveBeside([], id.C, 'before'), false); assert.strictEqual(m.moveBeside(['nao-existe'], id.C, 'before'), false); assert.strictEqual(m.moveBeside([id.B], 'nao-existe', 'before'), false);
  assert.strictEqual(JSON.stringify(m.toJSON()), snap);
});

test('moveBeside é UMA ação desfazível (e refazível), mesmo com vários tópicos', () => {
  const { m, id } = mk(); m.moveBeside([id.B, id.C], id.a1, 'before'); assert.strictEqual(kids(m, id.A), 'B,C,a1,a2,a3');
  assert.ok(m.undo()); assert.strictEqual(kids(m, m.root.id), 'A,B,C,D'); assert.strictEqual(kids(m, id.A), 'a1,a2,a3'); assert.ok(m.redo()); assert.strictEqual(kids(m, id.A), 'B,C,a1,a2,a3');
});

test('moveBeside respeita o limite de profundidade (não corrompe o mapa)', () => {
  const m = new MindMap(createNode('R')); let p = m.root.id; const ids = [];
  for (let i = 0; i < 100; i++) { p = m.addChild(p, 'n' + i).id; ids.push(p); }
  const top = m.addChild(m.root.id, 'ramo'); m.addChild(top.id, 'filho');
  const before = JSON.stringify(m.toJSON());
  let ok; try { ok = m.moveBeside([top.id], ids[ids.length - 1], 'after'); } catch { ok = false; }
  assert.ok(ok === false || JSON.stringify(m.toJSON()) !== before); let d = 0; const depth = (n, l) => { d = Math.max(d, l); n.children.forEach((c) => depth(c, l + 1)); }; depth(m.root, 0); assert.ok(d <= 101, 'profundidade ' + d);
});

test('moveSibling: sobe/desce um lugar, recusa nas pontas e na raiz, e é desfazível', () => {
  const { m, id } = mk();
  assert.ok(m.moveSibling(id.C, -1)); assert.strictEqual(kids(m, m.root.id), 'A,C,B,D'); assert.ok(m.moveSibling(id.C, -1)); assert.strictEqual(kids(m, m.root.id), 'C,A,B,D');
  assert.strictEqual(m.moveSibling(id.C, -1), false, 'já é o primeiro'); assert.strictEqual(m.moveSibling(id.D, 1), false, 'já é o último'); assert.strictEqual(m.moveSibling(m.root.id, 1), false);
  assert.ok(m.undo()); assert.strictEqual(kids(m, m.root.id), 'A,C,B,D');
});
