'use strict';
// Reconhecimento de traço da caneta: reta, ângulo reto, retângulo, elipse; curva suave e rabisco ficam como estão.
const test = require('node:test');
const assert = require('node:assert');
const { classifyStroke } = require('../core/components/shapes');

const seg = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => ({ x: a.x + (b.x - a.x) * i / n, y: a.y + (b.y - a.y) * i / n }));
const join = (...parts) => parts.flatMap((p, i) => (i ? p.slice(1) : p));
// ruído determinístico (sem Math.random): mantém os testes repetíveis
const noise = (pts, amp) => pts.map((p, i) => ({ x: p.x + Math.sin(i * 12.9898) * amp, y: p.y + Math.cos(i * 78.233) * amp }));

test('reta com um pouco de tremor vira reta de início a fim', () => {
  const s = noise(seg({ x: 100, y: 100 }, { x: 400, y: 160 }, 40), 1.5);
  const r = classifyStroke(s);
  assert.ok(r && r.kind === 'line', 'deve reconhecer reta');
});

test('traço em L com ângulo reto vira poligonal de ângulos retos', () => {
  const s = noise(join(seg({ x: 100, y: 100 }, { x: 400, y: 100 }, 30), seg({ x: 400, y: 100 }, { x: 400, y: 400 }, 30)), 1);
  const r = classifyStroke(s);
  assert.ok(r && r.kind === 'poly', 'deve reconhecer poligonal');
  assert.strictEqual(r.pts.length, 3, 'início, canto e fim');
});

test('quadrado desenhado à mão fechado vira retângulo', () => {
  const s = noise(join(
    seg({ x: 100, y: 100 }, { x: 300, y: 100 }, 20), seg({ x: 300, y: 100 }, { x: 300, y: 300 }, 20),
    seg({ x: 300, y: 300 }, { x: 100, y: 300 }, 20), seg({ x: 100, y: 300 }, { x: 100, y: 100 }, 20),
  ), 1.5);
  const r = classifyStroke(s);
  assert.ok(r && r.kind === 'rect', 'deve reconhecer retângulo');
  assert.ok(Math.abs(r.w - 200) < 15 && Math.abs(r.h - 200) < 15, 'tamanho próximo do desenhado');
});

test('círculo fechado vira elipse (círculo)', () => {
  const pts = Array.from({ length: 90 }, (_, i) => {
    const t = i / 89 * Math.PI * 2 + 0.1;
    return { x: 250 + 120 * Math.cos(t), y: 250 + 120 * Math.sin(t) };
  });
  const r = classifyStroke(noise(pts, 1));
  assert.ok(r && r.kind === 'ellipse', 'deve reconhecer elipse');
  assert.ok(Math.abs(r.rx - 120) < 6 && Math.abs(r.ry - 120) < 6, 'raio próximo de 120');
});

test('curva suave em S continua curva (não é forçada a forma)', () => {
  const pts = Array.from({ length: 120 }, (_, i) => ({ x: 100 + i * 3, y: 250 + 80 * Math.sin(i / 120 * Math.PI * 2) }));
  assert.strictEqual(classifyStroke(pts), null);
});

test('rabisco aleatório continua traço livre', () => {
  const pts = Array.from({ length: 80 }, (_, i) => ({ x: 100 + (i * 37) % 300, y: 100 + (i * 53) % 280 }));
  assert.strictEqual(classifyStroke(pts), null);
});

test('traço muito curto ou com poucos pontos não é classificado', () => {
  assert.strictEqual(classifyStroke([{ x: 0, y: 0 }, { x: 5, y: 5 }]), null);
  assert.strictEqual(classifyStroke(seg({ x: 0, y: 0 }, { x: 20, y: 0 }, 3)), null);
});
