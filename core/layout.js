'use strict';
const { getTheme, resolveStyle } = require('./themes');
const { MARKERS } = require('./markers');
const { todayStr, isDue } = require('./study');

/** Uma passada: progresso agregado pelas folhas (ponderado por peso) e quantas revisões vencem em cada subárvore. */
function studyViews(root, today) {
  const out = new Map();
  const rec = (n) => {
    const selfDue = isDue(n.study, today) ? 1 : 0;
    if (!n.children.length) {
      const w = (n.study && n.study.weight) || 1;
      const v = { w, p: w * (Number.isFinite(n.progress) ? n.progress : 0), any: n.progress != null, subDue: selfDue, selfDue };
      out.set(n.id, { ...v, roll: v.any ? Number.isFinite(n.progress) ? n.progress : 0 : null });
      return v;
    }
    const acc = { w: 0, p: 0, any: false, subDue: selfDue, selfDue };
    for (const c of n.children) { const v = rec(c); acc.w += v.w; acc.p += v.p; acc.any = acc.any || v.any; acc.subDue += v.subDue; }
    out.set(n.id, { ...acc, roll: acc.any && acc.w ? acc.p / acc.w : null });
    return acc;
  };
  rec(root);
  return out;
}

const H_GAP = [70, 46, 32]; // distância horizontal pai→filho por nível
const V_GAP = 12;

/** Estimativa de largura de texto (sem depender de canvas, para funcionar em Node puro). */
function textWidth(text, size, bold) {
  let w = 0;
  for (const ch of text) {
    w += /[ilI.,;:'|!]/.test(ch) ? 0.3 : /[mwMW@]/.test(ch) ? 0.85 : /[A-Z]/.test(ch) ? 0.68 : ch.codePointAt(0) > 0x2e80 ? 1 : 0.54;
  }
  return w * size * (bold ? 1.06 : 1);
}

function wrap(text, size, bold, maxW) {
  const lines = [];
  for (const para of String(text || ' ').split('\n')) {
    let cur = '';
    for (const word of para.split(/\s+/)) {
      const t = cur ? cur + ' ' + word : word;
      if (cur && textWidth(t, size, bold) > maxW) { lines.push(cur); cur = word; } else cur = t;
    }
    lines.push(cur);
  }
  return lines;
}

/**
 * Calcula o layout. Retorna { boxes: Map(id→box), edges: [{from,to,...}], bounds, theme }.
 * box: { id, x, y, w, h, level, side, lines, style, node }  (x,y = canto superior esquerdo)
 */
function layoutMap(map, opts = {}) {
  const theme = getTheme(opts.theme || map.meta.theme);
  const maxW = opts.maxTextWidth || 260;
  const boxes = new Map();
  const views = studyViews(map.root, opts.today || todayStr());

  const measure = (node, level, branch) => {
    const st = resolveStyle(theme, level, branch, node.style);
    const lines = wrap(node.title, st.size, st.bold, maxW);
    const tw = Math.max(...lines.map((l) => textWidth(l, st.size, st.bold)));
    const lh = st.size * 1.25;
    const nm = (node.markers || []).filter((m) => MARKERS[m]).length;
    const md = Math.round(st.size * 1.05);
    const markerW = nm ? Math.ceil(nm * (md + 4) + st.padX * 0.3) : 0;
    const box = {
      id: node.id, node, level, style: st, lines, lineHeight: lh,
      markerW, markerD: md, markers: (node.markers || []).filter((m) => MARKERS[m]),
      // progresso: o do próprio tópico, ou o agregado pelas folhas (azul na tela) quando ele não tem valor próprio
      progress: node.progress != null ? node.progress : views.get(node.id).roll,
      progressAuto: node.progress == null && views.get(node.id).roll != null,
      due: node.collapsed ? views.get(node.id).subDue : views.get(node.id).selfDue,
      w: Math.ceil(tw + st.padX * 2 + markerW), h: Math.ceil(lines.length * lh + st.padY * 2),
      x: 0, y: 0, side: 1, branch, subtreeH: 0,
    };
    boxes.set(node.id, box);
    return box;
  };

  // 1ª passada: medir e calcular a altura de cada subárvore
  const prep = (node, level, branch) => {
    const b = measure(node, level, branch);
    const kids = node.collapsed ? [] : node.children;
    b.kids = kids.map((c, i) => prep(c, level + 1, level === 0 ? theme.branches[i % theme.branches.length] : branch));
    const kh = b.kids.reduce((s, k) => s + k.subtreeH, 0) + Math.max(0, b.kids.length - 1) * V_GAP;
    b.subtreeH = Math.max(b.h, kh);
    return b;
  };
  const root = prep(map.root, 0, theme.branches[0]);

  // 2ª passada: posicionar. Raiz ao centro; filhos divididos em dois lados equilibrados pela altura.
  const place = (b, x, centerY, side) => {
    b.side = side;
    b.x = side > 0 ? x : x - b.w;
    b.y = centerY - b.h / 2;
    const gap = H_GAP[Math.min(b.level, H_GAP.length - 1)];
    const total = b.kids.reduce((s, k) => s + k.subtreeH, 0) + Math.max(0, b.kids.length - 1) * V_GAP;
    let y = centerY - total / 2;
    const childX = side > 0 ? b.x + b.w + gap : b.x - gap;
    for (const k of b.kids) {
      place(k, childX, y + k.subtreeH / 2, side);
      y += k.subtreeH + V_GAP;
    }
  };

  const mode = opts.direction || 'both'; // 'both' | 'right'
  root.x = -root.w / 2; root.y = -root.h / 2;
  if (mode === 'right') {
    const total = root.kids.reduce((s, k) => s + k.subtreeH, 0) + Math.max(0, root.kids.length - 1) * V_GAP;
    root.x = 0; root.y = -root.h / 2;
    let y = -total / 2;
    for (const k of root.kids) { place(k, root.w + H_GAP[0], y + k.subtreeH / 2, 1); y += k.subtreeH + V_GAP; }
  } else {
    // divide em direita/esquerda minimizando a diferença de altura (ordem preservada)
    const hs = root.kids.map((k) => k.subtreeH);
    const sum = hs.reduce((a, b) => a + b, 0);
    let acc = 0, cut = 0;
    for (let i = 0; i < hs.length; i++) { if (acc + hs[i] / 2 <= sum / 2) { acc += hs[i]; cut = i + 1; } }
    if (hs.length > 1 && cut === 0) cut = 1;
    const place2 = (list, side) => {
      const total = list.reduce((s, k) => s + k.subtreeH, 0) + Math.max(0, list.length - 1) * V_GAP;
      let y = -total / 2;
      const x = side > 0 ? root.w / 2 + H_GAP[0] : -root.w / 2 - H_GAP[0];
      for (const k of list) { place(k, x, y + k.subtreeH / 2, side); y += k.subtreeH + V_GAP; }
    };
    place2(root.kids.slice(0, cut), 1);
    place2(root.kids.slice(cut), -1);
  }

  const edges = [];
  for (const b of boxes.values()) for (const k of b.kids || []) edges.push({ from: b, to: k });

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const b of boxes.values()) {
    minX = Math.min(minX, b.x); minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.w); maxY = Math.max(maxY, b.y + b.h);
  }
  const pad = opts.padding ?? 40;
  const bounds = { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
  const relations = (map.meta.relations || []).map((r) => ({ rel: r, geo: relationGeometry(boxes, r) })).filter((r) => r.geo);
  // curvas de relação e barras de progresso podem sair da caixa dos tópicos
  const grow = (px, py) => {
    const x2 = bounds.x + bounds.w, y2 = bounds.y + bounds.h;
    bounds.x = Math.min(bounds.x, px - pad / 2); bounds.y = Math.min(bounds.y, py - pad / 2);
    bounds.w = Math.max(x2, px + pad / 2) - bounds.x; bounds.h = Math.max(y2, py + pad / 2) - bounds.y;
  };
  for (const { geo } of relations) { grow(geo.c.x, geo.c.y); grow(geo.label.x, geo.label.y); }
  for (const b of boxes.values()) if (b.progress != null) grow(b.x, b.y + b.h + 10);
  return { boxes, edges, relations, bounds, theme, root };
}

/** Ponto de ancoragem de uma aresta: lado do pai voltado para o filho e lado do filho voltado para o pai. */
function edgePoints({ from, to }) {
  const dir = to.x + to.w / 2 >= from.x + from.w / 2 ? 1 : -1;
  const a = { x: dir > 0 ? from.x + from.w : from.x, y: from.y + from.h / 2 };
  const underline = to.style.shape === 'underline';
  const b = { x: dir > 0 ? to.x : to.x + to.w, y: underline ? to.y + to.h : to.y + to.h / 2 };
  return { a, b, dir };
}

/** Interseção do raio centro→ponto com a borda do retângulo (com margem). */
function clip(b, tx, ty, m = 5) {
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2, dx = tx - cx, dy = ty - cy;
  if (!dx && !dy) return { x: cx, y: cy };
  const s = 1 / Math.max(Math.abs(dx) / (b.w / 2 + m), Math.abs(dy) / (b.h / 2 + m));
  return { x: cx + dx * s, y: cy + dy * s };
}

/** Curva quadrática entre dois tópicos, com ponta de seta e posição do rótulo. null se algum estiver oculto (recolhido). */
function relationGeometry(boxes, rel) {
  const fa = boxes.get(rel.from), tb = boxes.get(rel.to);
  if (!fa || !tb) return null;
  const ac = { x: fa.x + fa.w / 2, y: fa.y + fa.h / 2 }, bc = { x: tb.x + tb.w / 2, y: tb.y + tb.h / 2 };
  const dist = Math.hypot(bc.x - ac.x, bc.y - ac.y) || 1;
  const c = { x: (ac.x + bc.x) / 2 - ((bc.y - ac.y) / dist) * dist * 0.22, y: (ac.y + bc.y) / 2 + ((bc.x - ac.x) / dist) * dist * 0.22 };
  const a = clip(fa, c.x, c.y), b = clip(tb, c.x, c.y, 7);
  const ang = Math.atan2(b.y - c.y, b.x - c.x), L = 11, W = 0.42;
  const arrow = [b, { x: b.x - L * Math.cos(ang - W), y: b.y - L * Math.sin(ang - W) }, { x: b.x - L * Math.cos(ang + W), y: b.y - L * Math.sin(ang + W) }];
  return { a, b, c, arrow, label: { x: 0.25 * a.x + 0.5 * c.x + 0.25 * b.x, y: 0.25 * a.y + 0.5 * c.y + 0.25 * b.y } };
}

module.exports = { layoutMap, edgePoints, relationGeometry, textWidth };

