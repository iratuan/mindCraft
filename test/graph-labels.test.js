'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { placeLabels, relationLabelAnchor, SpatialGrid, ROW_H } = require('../core/components/graph-labels');

const measure = (s) => s.length * 7;                                   // largura fictícia: 7 px por caractere
const fit = (s, max) => (measure(s) <= max ? s : s.slice(0, Math.max(1, Math.floor(max / 7) - 1)) + '…');
const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const W = 1200, H = 700;
const field = (n, seed = 1, forcedEvery = 0) => { const r = rng(seed); return Array.from({ length: n }, (_, i) => ({ id: i, x: 30 + r() * (W - 60), y: 30 + r() * (H - 60), r: 4 + r() * 12, text: `Tópico número ${i}`, score: r() * 100, forced: forcedEvery > 0 && i % forcedEvery === 0, relevant: i % 9 === 0 })); };
const rect = (it, p) => { const w = measure(p.text) + 6, cx = it.x + p.ox, cy = it.y + p.oy; return { x: cx - (p.anchor === 'middle' ? w / 2 : p.anchor === 'end' ? w : 0), y: cy - ROW_H / 2, w, h: ROW_H }; };
const overlap = (a, b, pad = 0) => a.x - pad < b.x + b.w && b.x - pad < a.x + a.w && a.y - pad < b.y + b.h && b.y - pad < a.y + a.h;
const run = (items, o = {}) => placeLabels(items, { width: W, height: H, mode: 'auto', budget: 60, gap: 4, measure, fit, ...o });

test('rótulos comuns: nenhum cobre outro rótulo, outro ponto, nem sai da tela; respeita a folga e o orçamento', () => {
  for (const seed of [1, 2, 3, 4, 5]) {
    const items = field(300, seed); const { placed, shown } = run(items, { budget: 70, gap: 4 });
    assert.ok(shown > 15 && shown <= 70, `seed ${seed}: ${shown} rótulos`); assert.strictEqual(shown, placed.size);
    const rects = [...placed].map(([id, p]) => ({ id, ...rect(items[id], p) }));
    for (let i = 0; i < rects.length; i++) {
      const a = rects[i]; assert.ok(a.x >= -2 && a.x + a.w <= W + 2 && a.y >= 0 && a.y + a.h <= H + 2, `fora da tela (seed ${seed}, #${a.id})`);
      for (let j = i + 1; j < rects.length; j++) assert.ok(!overlap(a, rects[j], 3), `rótulos ${a.id} e ${rects[j].id} se sobrepõem (seed ${seed})`);
      for (const it of items) if (it.id !== a.id) assert.ok(!overlap(a, { x: it.x - it.r, y: it.y - it.r, w: it.r * 2, h: it.r * 2 }, 3), `rótulo ${a.id} cobre o ponto ${it.id} (seed ${seed})`);
    }
  }
});

test('os de maior pontuação têm prioridade; o resultado é determinístico', () => {
  const items = field(200, 9); const a = run(items), b = run(items);
  assert.deepStrictEqual([...a.placed], [...b.placed]);
  assert.ok(a.shown >= 20, 'poucos rótulos: ' + a.shown);
  const top = [...items].sort((x, y) => y.score - x.score).slice(0, 5); assert.ok(top.filter((it) => a.placed.has(it.id)).length >= 4, 'os 5 de maior pontuação quase sempre aparecem');
});

test('forçados (selecionado, vizinhos, achados da busca) SEMPRE aparecem, mesmo fora do orçamento e em área lotada; os demais continuam sem sobrepor', () => {
  const items = field(250, 3, 5); const { placed } = run(items, { budget: 0 });
  for (const it of items) if (it.forced) assert.ok(placed.has(it.id), `forçado ${it.id} sumiu`);
  for (const p of placed.values()) if (p.big) assert.ok(p.text.length <= 40);
  const crowd = Array.from({ length: 30 }, (_, i) => ({ id: i, x: 600 + (i % 6), y: 350 + Math.floor(i / 6), r: 6, text: 'ponto ' + i, forced: true, score: 1 }));
  assert.strictEqual(run(crowd, { budget: 0 }).placed.size, 30, 'todos os forçados aparecem, mesmo empilhados');
});

test('modos: nenhum (só forçados), só relevantes, automáticos (orçamento) e todos (sem checar colisão)', () => {
  const items = field(200, 4, 17);
  const none = run(items, { mode: 'none' }).placed, rel = run(items, { mode: 'relevant' }).placed, auto = run(items, { mode: 'auto', budget: 40 }).placed, all = run(items, { mode: 'all' }).placed;
  assert.deepStrictEqual([...none.keys()].sort((x, y) => x - y), items.filter((i) => i.forced).map((i) => i.id));
  for (const id of rel.keys()) assert.ok(items[id].forced || items[id].relevant, 'só forçados e relevantes');
  assert.ok(rel.size >= none.size && auto.size >= none.size); assert.strictEqual(all.size, items.length, 'todos: um rótulo para cada ponto');
});

test('obstáculos (legenda, botões) nunca são cobertos; sem espaço em nenhum lado o rótulo comum some em vez de sobrepor', () => {
  const items = field(200, 6); const obs = [{ x: 0, y: 0, w: 260, h: 140 }, { x: W - 90, y: H - 230, w: 90, h: 230 }];
  const { placed } = run(items, { obstacles: obs, budget: 100 });
  for (const [id, p] of placed) for (const o of obs) assert.ok(!overlap(rect(items[id], p), o, 0), `rótulo ${id} sobre obstáculo`);
  const boxed = [{ id: 1, x: 100, y: 100, r: 8, text: 'preso', score: 1 }]; const wall = [{ x: 0, y: 0, w: 300, h: 300 }];
  assert.strictEqual(run(boxed, { obstacles: wall }).placed.size, 0);
});

test('texto longo é cortado (comum: 170 px; forçado: 300 px) e a posição alternativa é usada quando a de baixo está ocupada', () => {
  const long = 'x'.repeat(120);
  const { placed } = run([{ id: 1, x: 600, y: 300, r: 8, text: long, score: 1 }, { id: 2, x: 600, y: 300, r: 3, text: long, score: 0, forced: true }]);
  assert.ok(measure(placed.get(1).text) <= 170 + 7 && placed.get(1).text.endsWith('…')); assert.ok(measure(placed.get(2).text) <= 300 + 7);
  const a = { id: 1, x: 600, y: 300, r: 8, text: 'primeiro', score: 9 }, b = { id: 2, x: 600, y: 322, r: 8, text: 'segundo', score: 1 };
  const out = run([a, b]).placed; assert.ok(out.has(1) && out.has(2), 'o 2º usa outra posição'); assert.notStrictEqual(`${out.get(1).ox},${out.get(1).oy}`, `${out.get(2).ox},${out.get(2).oy}`);
});

test('desempenho: 3000 pontos em menos de 400 ms; grade espacial acha colisões e respeita "skip"', () => {
  const items = field(3000, 8); const t0 = Date.now(); run(items, { budget: 120 }); const dt = Date.now() - t0; assert.ok(dt < 400, 'demorou ' + dt + ' ms');
  const g = new SpatialGrid(); const r1 = g.put({ x: 10, y: 10, w: 20, h: 20 });
  assert.ok(g.hits({ x: 25, y: 25, w: 10, h: 10 })); assert.ok(!g.hits({ x: 100, y: 100, w: 10, h: 10 })); assert.ok(!g.hits({ x: 25, y: 25, w: 10, h: 10 }, 0, r1), 'skip ignora o próprio'); assert.ok(g.hits({ x: 33, y: 10, w: 10, h: 10 }, 5), 'folga conta');
  assert.deepStrictEqual(placeLabels([], { width: W, height: H, measure, fit }).placed.size, 0);
});

test('rótulo de relação: no meio da linha; com ponta em foco fica perto dela (a no máximo ~110 px), mesmo se a outra está longe', () => {
  const a = { x: 100, y: 100 }, b = { x: 300, y: 100 }, m = relationLabelAnchor(a, b, null); assert.deepStrictEqual([m.x, m.y, m.t], [200, 100, 0.5]);
  const far = { x: 5000, y: 100 }, f = relationLabelAnchor(a, far, 'a'); assert.ok(Math.abs(f.x - 100) <= 111 && f.t < 0.5);
  const fb = relationLabelAnchor(a, far, 'b'); assert.ok(Math.abs(fb.x - 5000) <= 111, 'em foco a ponta b: parte de b'); assert.strictEqual(fb.from, far);
  const same = relationLabelAnchor({ x: 1, y: 1 }, { x: 1, y: 1 }, 'a'); assert.ok(Number.isFinite(same.x) && Number.isFinite(same.y) && Number.isFinite(same.t), 'pontas iguais não geram NaN');
});
