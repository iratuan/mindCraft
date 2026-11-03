'use strict';
/**
 * Reconhecimento de traço à mão livre (lousa): decide se um traço da caneta deve virar uma forma limpa.
 * Regras puras, sem DOM. Todas as tolerâncias são frações do comprimento do traço, então o resultado não depende da escala.
 *
 * Classes:
 *  - 'line'    : reta (todos os pontos perto da reta início–fim)
 *  - 'poly'    : poligonal de ângulos retos (curvas de 70° a 110° nos vértices)
 *  - 'rect'    : traço fechado com quatro cantos retos
 *  - 'ellipse' : traço fechado que se ajusta a uma elipse (círculo incluído)
 *  - null      : curva suave ou rabisco; o traço fica como foi desenhado
 */

const N = 64;                 // pontos após reamostragem por comprimento de arco
const TOL = { line: 0.03, closeGap: 0.08, ellipse: 0.04, minLen: 40 };
const CORNER_TURN = 50;       // graus: mudança de direção que conta como canto
const RIGHT = [70, 110];      // faixa aceita para um canto de ângulo reto

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** Comprimento total do traço. */
function pathLength(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1], pts[i]);
  return L;
}

/** Reamostra o traço em N pontos igualmente espaçados ao longo do caminho. */
function resample(pts, n = N) {
  const L = pathLength(pts);
  if (L === 0) return pts.slice(0, 1);
  const step = L / (n - 1), out = [{ ...pts[0] }];
  let acc = 0, i = 1, prev = pts[0];
  while (out.length < n - 1 && i < pts.length) {
    const d = dist(prev, pts[i]);
    if (acc + d >= step) {
      const t = (step - acc) / d;
      const q = { x: prev.x + (pts[i].x - prev.x) * t, y: prev.y + (pts[i].y - prev.y) * t };
      out.push(q); prev = q; acc = 0;
    } else { acc += d; prev = pts[i]; i++; }
  }
  out.push({ ...pts[pts.length - 1] });
  return out;
}

/** Maior distância perpendicular dos pontos à reta a–b. */
function maxLineDev(pts, a, b) {
  const L = dist(a, b) || 1e-9;
  let m = 0;
  for (const p of pts) {
    const d = Math.abs((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y)) / L;
    if (d > m) m = d;
  }
  return m;
}

/** Ângulo (graus, 0–180) entre dois vetores: quanto a direção muda. */
function turnAngle(v1, v2) {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (m === 0) return 0;
  return Math.acos(Math.max(-1, Math.min(1, dot / m))) * 180 / Math.PI;
}

/**
 * Cantos: máximos locais da mudança de direção, com janela w, acima de CORNER_TURN.
 * Em traço fechado a lista é tratada como circular (o canto da emenda também conta).
 */
function findCorners(p, w = 4, closed = false) {
  const n = p.length;
  const q = closed ? [...p.slice(n - w), ...p, ...p.slice(0, w)] : p;
  const off = closed ? w : 0;
  const turns = [];
  for (let i = w; i < q.length - w; i++) {
    const v1 = { x: q[i].x - q[i - w].x, y: q[i].y - q[i - w].y };
    const v2 = { x: q[i + w].x - q[i].x, y: q[i + w].y - q[i].y };
    turns.push({ i: i - off, t: turnAngle(v1, v2) });
  }
  const corners = [];
  for (let k = 0; k < turns.length; k++) {
    const { i, t } = turns[k];
    if (t < CORNER_TURN) continue;
    const near = turns.filter((o) => Math.abs(o.i - i) <= w);
    if (near.every((o) => o.t <= t)) {
      if (!corners.length || i - corners[corners.length - 1].i > w) corners.push({ i: ((i % n) + n) % n, t });
    }
  }
  // em traço fechado, o último canto e o primeiro podem ser o mesmo (a emenda): fica o de maior mudança
  if (closed && corners.length > 1) {
    const a = corners[0], b = corners[corners.length - 1];
    const gap = Math.min(Math.abs(a.i - b.i), n - Math.abs(a.i - b.i));
    if (gap <= w) { if (b.t > a.t) corners[0] = b; corners.pop(); }
  }
  return corners;
}

/** Ajuste por caixa envolvente: a elipse de eixos alinhados que melhor cobre os pontos fechados. */
function ellipseFit(p, L) {
  const xs = p.map((q) => q.x), ys = p.map((q) => q.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = (y1 - y0) / 2;
  if (rx < 1 || ry < 1) return null;
  let err = 0;
  for (const q of p) {
    const r = Math.sqrt(((q.x - cx) / rx) ** 2 + ((q.y - cy) / ry) ** 2);
    err += Math.abs(r - 1) * Math.min(rx, ry);
  }
  err /= p.length;
  return err <= TOL.ellipse * L ? { kind: 'ellipse', cx, cy, rx, ry } : null;
}

/**
 * Classifica um traço da caneta. `pts` são pontos {x, y} na ordem em que foram desenhados.
 * Devolve { kind, ... } com a forma limpa, ou null para manter o traço como foi desenhado.
 */
function classifyStroke(pts) {
  if (!Array.isArray(pts) || pts.length < 6) return null;
  const L = pathLength(pts);
  if (L < TOL.minLen) return null;
  const p = resample(pts);
  const a = p[0], b = p[p.length - 1];
  const closed = dist(a, b) <= TOL.closeGap * L;

  if (!closed && maxLineDev(p, a, b) <= TOL.line * L) {
    return { kind: 'line', pts: [a, b] };
  }

  const corners = findCorners(p, 4, closed);
  const turns = corners.map((c) => c.t);
  const allRight = corners.length > 0 && turns.every((t) => t >= RIGHT[0] && t <= RIGHT[1]);

  if (closed) {
    if (corners.length === 4 && allRight) {
      const vs = corners.map((c) => p[c.i]);
      const x0 = Math.min(...vs.map((v) => v.x)), x1 = Math.max(...vs.map((v) => v.x));
      const y0 = Math.min(...vs.map((v) => v.y)), y1 = Math.max(...vs.map((v) => v.y));
      return { kind: 'rect', x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    }
    if (corners.length === 0) return ellipseFit(p, L);
    return null;
  }

  if (allRight && corners.length <= 5) {
    const vertices = [a, ...corners.map((c) => p[c.i]), b];
    return { kind: 'poly', pts: vertices };
  }
  return null;
}

module.exports = { classifyStroke, resample, pathLength, findCorners, TOL };
