'use strict';
/**
 * Layout de forças (Fruchterman–Reingold) para o grafo. Determinístico: mesma entrada + semente => mesmas posições.
 * Nós do mesmo `group` (mapa) nascem agrupados, o que dá o aspecto de "constelações" do Obsidian.
 * Retorna Map id -> {x, y} dentro de [-W/2, W/2] × [-H/2, H/2].
 */
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function forceLayout(nodes, edges, { iterations = 300, seed = 7, width, height, maxNodes = 1500, spacing = 120 } = {}) {
  const pos = new Map();
  if (!nodes.length) return pos;
  const list = nodes.length > maxNodes ? [...nodes].sort((a, b) => b.deg - a.deg).slice(0, maxNodes) : nodes; // os mais conectados
  const ids = new Set(list.map((n) => n.id));
  const E = edges.filter((e) => ids.has(e.from) && ids.has(e.to) && e.from !== e.to);
  const rnd = mulberry32(seed), n = list.length;
  // a área cresce com a raiz do nº de nós (grafos pequenos ficam compactos; grandes ganham espaço)
  const side = Math.sqrt(n) * spacing * 1.2;
  width = width || Math.max(480, side * 1.5); height = height || Math.max(320, side);
  const idx = new Map(list.map((x, i) => [x.id, i]));
  const px = new Float64Array(n), py = new Float64Array(n), dx = new Float64Array(n), dy = new Float64Array(n);

  // posição inicial: cada grupo ganha um centro num círculo; os nós ficam espalhados em volta dele
  const groups = [...new Set(list.map((x) => x.mapKey ?? '∅'))];
  const R = Math.min(width || 800, height || 600) * 0.32;
  list.forEach((x, i) => {
    const gi = groups.indexOf(x.mapKey ?? '∅'), a = (gi / groups.length) * Math.PI * 2;
    const cx = groups.length > 1 ? Math.cos(a) * R : 0, cy = groups.length > 1 ? Math.sin(a) * R : 0;
    px[i] = cx + (rnd() - 0.5) * spacing * 1.6; py[i] = cy + (rnd() - 0.5) * spacing * 1.6;
  });

  const k = spacing;
  const linked = new Uint8Array(n);                // quem tem alguma aresta VISÍVEL (inclui hierarquia); o resto é órfão
  for (const e of E) { linked[idx.get(e.from)] = 1; linked[idx.get(e.to)] = 1; }
  let t = Math.min(width, height) / 8;
  const cool = t / (iterations + 1);
  for (let it = 0; it < iterations; it++) {
    dx.fill(0); dy.fill(0);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {        // repulsão
      let ddx = px[i] - px[j], ddy = py[i] - py[j], d2 = ddx * ddx + ddy * ddy;
      if (d2 < 0.01) { ddx = rnd() - 0.5; ddy = rnd() - 0.5; d2 = 0.01; }
      const d = Math.sqrt(d2), f = (k * k) / d, fx = (ddx / d) * f, fy = (ddy / d) * f;
      dx[i] += fx; dy[i] += fy; dx[j] -= fx; dy[j] -= fy;
    }
    for (const e of E) {                                                   // atração
      const a = idx.get(e.from), b = idx.get(e.to);
      const ddx = px[a] - px[b], ddy = py[a] - py[b], d = Math.sqrt(ddx * ddx + ddy * ddy) || 0.01, f = (d * d) / k * (e.type === 'hierarchy' ? 0.5 : 1);
      dx[a] -= (ddx / d) * f; dy[a] -= (ddy / d) * f; dx[b] += (ddx / d) * f; dy[b] += (ddy / d) * f;
    }
    for (let i = 0; i < n; i++) {                                          // gravidade leve + deslocamento limitado pela "temperatura"
      const g = linked[i] ? 0.045 : 0.2; // gravidade: sem ligações voltam para perto do centro
      dx[i] -= px[i] * g; dy[i] -= py[i] * g;
      const d = Math.sqrt(dx[i] * dx[i] + dy[i] * dy[i]) || 0.01, m = Math.min(d, t);
      px[i] += (dx[i] / d) * m; py[i] += (dy[i] / d) * m;
      px[i] = Math.max(-width / 2, Math.min(width / 2, px[i])); py[i] = Math.max(-height / 2, Math.min(height / 2, py[i]));
    }
    t -= cool;
  }
  list.forEach((x, i) => pos.set(x.id, { x: px[i], y: py[i] }));
  // nós que ficaram de fora do limite de exibição são empilhados na borda, sem sumir
  for (const x of nodes) if (!pos.has(x.id)) pos.set(x.id, { x: width / 2, y: height / 2 });
  return pos;
}

module.exports = { forceLayout };
