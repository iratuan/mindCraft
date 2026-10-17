'use strict';
/**
 * Layout de forças (Fruchterman–Reingold) para o grafo. Determinístico: mesma entrada + semente => mesmas posições.
 *  1. Cada COMPONENTE conectado é calculado sozinho (sem moldura rígida: antes os pontos se encostavam nas bordas de um retângulo);
 *  2. os componentes são EMPACOTADOS em prateleiras (maiores primeiro), com folga entre eles;
 *  3. os pontos sem nenhuma ligação visível formam uma grade compacta embaixo, em vez de se amontoar no centro.
 * O resultado fica centrado na origem. Retorna Map id -> {x, y}. Ninguém fica sem posição (o que passa de `maxNodes` vai para a grade).
 */
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Fruchterman–Reingold em UM componente. `edges` = [a, b, peso] com índices locais. Devolve posições normalizadas (canto superior esquerdo em 0,0) e o tamanho. */
function layoutComponent(m, edges, rnd, k, iterations) {
  const px = new Float64Array(m), py = new Float64Array(m), dx = new Float64Array(m), dy = new Float64Array(m);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < m; i++) { const a = i * golden + rnd() * 0.6, r = Math.sqrt(i + 0.5) * k * 0.55; px[i] = Math.cos(a) * r; py[i] = Math.sin(a) * r; }   // espiral: já nasce espalhado
  const its = Math.max(60, Math.min(iterations, Math.round(iterations * Math.min(1, 500 / m))));
  let t = k * Math.min(3, 0.6 + Math.sqrt(m) * 0.12); const cool = t / (its + 1), cut2 = (k * 6) * (k * 6);
  for (let it = 0; it < its; it++) {
    dx.fill(0); dy.fill(0);
    for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) {            // repulsão (ignora o que está longe demais para importar)
      let ddx = px[i] - px[j], ddy = py[i] - py[j], d2 = ddx * ddx + ddy * ddy;
      if (d2 > cut2) continue;
      if (d2 < 0.01) { ddx = rnd() - 0.5; ddy = rnd() - 0.5; d2 = 0.01; }
      const d = Math.sqrt(d2), f = (k * k) / d, fx = (ddx / d) * f, fy = (ddy / d) * f;
      dx[i] += fx; dy[i] += fy; dx[j] -= fx; dy[j] -= fy;
    }
    for (const [a, b, w] of edges) {                                         // atração
      const ddx = px[a] - px[b], ddy = py[a] - py[b], d = Math.sqrt(ddx * ddx + ddy * ddy) || 0.01, f = ((d * d) / k) * w;
      dx[a] -= (ddx / d) * f; dy[a] -= (ddy / d) * f; dx[b] += (ddx / d) * f; dy[b] += (ddy / d) * f;
    }
    let cx = 0, cy = 0; for (let i = 0; i < m; i++) { cx += px[i]; cy += py[i]; } cx /= m; cy /= m;
    for (let i = 0; i < m; i++) {                                            // gravidade leve para o centro do componente + deslocamento limitado pela "temperatura"
      dx[i] -= (px[i] - cx) * 0.03; dy[i] -= (py[i] - cy) * 0.03;
      const d = Math.sqrt(dx[i] * dx[i] + dy[i] * dy[i]) || 0.01, s = Math.min(d, t);
      px[i] += (dx[i] / d) * s; py[i] += (dy[i] / d) * s;
    }
    t -= cool;
  }
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (let i = 0; i < m; i++) { x1 = Math.min(x1, px[i]); y1 = Math.min(y1, py[i]); x2 = Math.max(x2, px[i]); y2 = Math.max(y2, py[i]); }
  const pts = []; for (let i = 0; i < m; i++) pts.push({ x: px[i] - x1, y: py[i] - y1 });
  return { pts, w: x2 - x1, h: y2 - y1 };
}

function forceLayout(nodes, edges, { iterations = 300, seed = 7, maxNodes = 1500, spacing = 120 } = {}) {
  const pos = new Map();
  if (!nodes.length) return pos;
  const list = nodes.length > maxNodes ? [...nodes].sort((a, b) => b.deg - a.deg).slice(0, maxNodes) : nodes; // os mais conectados
  const n = list.length, idx = new Map(list.map((x, i) => [x.id, i]));
  const E = [];
  for (const e of edges) { const a = idx.get(e.from), b = idx.get(e.to); if (a !== undefined && b !== undefined && a !== b) E.push([a, b, e.type === 'hierarchy' ? 0.5 : 1]); }

  // componentes conexos (união-busca)
  const parent = Int32Array.from({ length: n }, (_, i) => i);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  for (const [a, b] of E) { const ra = find(a), rb = find(b); if (ra !== rb) parent[Math.max(ra, rb)] = Math.min(ra, rb); }
  const comps = new Map(); for (let i = 0; i < n; i++) { const r = find(i); (comps.get(r) || comps.set(r, []).get(r)).push(i); }
  const real = [...comps.values()].filter((c) => c.length >= 2).sort((a, b) => b.length - a.length || a[0] - b[0]);
  const orphans = [...comps.values()].filter((c) => c.length === 1).map((c) => c[0]);
  const extra = nodes.length > n ? nodes.filter((x) => !idx.has(x.id)) : [];       // fora do limite de exibição: vão para a grade

  const k = spacing * 0.8, gap = spacing * 0.9;      // comprimento ideal de uma ligação: um pouco menor que o espaçamento, para o grafo ficar compacto
  const blocks = real.map((c, ci) => {
    const local = new Map(c.map((g, i) => [g, i])), ce = [];
    for (const [a, b, w] of E) if (local.has(a) && local.has(b)) ce.push([local.get(a), local.get(b), w]);
    const r = layoutComponent(c.length, ce, mulberry32(seed * 7919 + ci * 104729 + 13), k, iterations);
    return { c, ...r };
  });

  // empacota em prateleiras: largura-alvo pela área total (proporção ~1,7:1)
  const area = blocks.reduce((s, b) => s + (b.w + gap) * (b.h + gap), 0) + (orphans.length + extra.length) * (k * 0.75) * (k * 0.75);
  const maxW = blocks.reduce((m, b) => Math.max(m, b.w), 0), target = Math.max(maxW, Math.sqrt(area) * 1.7);
  let x = 0, y = 0, rowH = 0, usedW = 0;
  const placed = [];
  for (const b of blocks) {
    if (x > 0 && x + b.w > target) { x = 0; y += rowH + gap; rowH = 0; }
    placed.push({ b, ox: x, oy: y }); x += b.w + gap; rowH = Math.max(rowH, b.h); usedW = Math.max(usedW, x - gap);
  }
  let bottom = blocks.length ? y + rowH : 0;
  for (const { b, ox, oy } of placed) b.c.forEach((g, i) => pos.set(list[g].id, { x: ox + b.pts[i].x, y: oy + b.pts[i].y }));
  const lone = [...orphans.map((i) => list[i].id), ...extra.map((e) => e.id)];
  if (lone.length) {                                                          // grade compacta para quem não tem ligações
    const cell = k * 0.75, cols = Math.max(3, Math.min(lone.length, Math.ceil(Math.max(usedW, cell * 6) / cell), Math.ceil(Math.sqrt(lone.length * 1.8))));
    const top = blocks.length ? bottom + gap * 1.4 : 0;
    lone.forEach((id, i) => pos.set(id, { x: (i % cols) * cell, y: top + Math.floor(i / cols) * cell }));
  }
  // centraliza na origem
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const p of pos.values()) { x1 = Math.min(x1, p.x); y1 = Math.min(y1, p.y); x2 = Math.max(x2, p.x); y2 = Math.max(y2, p.y); }
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; for (const p of pos.values()) { p.x -= mx; p.y -= my; }
  return pos;
}

module.exports = { forceLayout };
