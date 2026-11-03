'use strict';
/**
 * Layout do fluxograma: de cima para baixo. O próximo passo fica embaixo do atual; uma decisão abre os ramos lado a lado.
 * Setas extras (relações) não entram no cálculo de posição: são desenhadas por cima, então não empurram passos.
 * Função pura: recebe o documento e devolve caixas (x, y, w, h) e as ligações. Medidas de texto vêm de core/layout.js.
 */
const { textWidth } = require('./layout');
const { typeOf } = require('./flow');

const FONT = 13;            // tamanho do texto do passo (px)
const MAX_TEXT_W = 190;     // largura máxima do texto antes de quebrar a linha
const GAP_X = 36;           // espaço horizontal entre irmãos (ramos)
const GAP_Y = 56;           // espaço vertical entre um passo e o seguinte
const SIZE = {
  start: { h: 40, padX: 26, min: 110 },
  end: { h: 40, padX: 26, min: 110 },
  step: { h: 44, padX: 22, min: 132 },
  decision: { h: 66, padX: 44, min: 150 },   // losango: precisa de mais área para o texto caber
};

/** Quebra o texto por palavras para caber em `maxW` (pixels). Sempre devolve pelo menos uma linha. */
function wrapWords(text, size, maxW) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (!words.length) return ['Sem título'];
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (cur && textWidth(t, size, false) > maxW) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);   // passo muito longo: as quatro primeiras linhas (o texto completo fica nas notas e na exportação)
}

/** Caixa de um passo: tamanho pelo texto e pelo tipo. */
function boxFor(n) {
  const t = typeOf(n);
  const s = SIZE[t];
  const lines = wrapWords(n.title, FONT, MAX_TEXT_W);
  const tw = Math.max(...lines.map((l) => textWidth(l, FONT, false)));
  const lh = FONT * 1.3;
  const w = Math.max(s.min, Math.ceil(tw + s.padX * 2));
  const h = Math.max(s.h, Math.ceil(lines.length * lh + 18));
  return { id: n.id, type: t, title: n.title || 'Sem título', lines, lineHeight: lh, w, h, x: 0, y: 0, branch: n.branchLabel || '', sub: w, kids: [] };
}

/** Largura ocupada pela subárvore: a de um passo, ou a soma dos ramos com espaço entre eles. */
function measure(n) {
  const b = boxFor(n);
  b.kids = n.children.map(measure);
  if (b.kids.length > 1) b.sub = Math.max(b.w, b.kids.reduce((s, k) => s + k.sub, 0) + (b.kids.length - 1) * GAP_X);
  else if (b.kids.length === 1) b.sub = Math.max(b.w, b.kids[0].sub);
  return b;
}

/** Posiciona a subárvore com o centro horizontal em `cx` e o topo em `y`. */
function place(b, cx, y, boxes) {
  b.x = cx - b.w / 2;
  b.y = y;
  boxes.set(b.id, b);
  if (b.kids.length === 1) {
    place(b.kids[0], cx, y + b.h + GAP_Y, boxes);
  } else if (b.kids.length > 1) {
    const total = b.kids.reduce((s, k) => s + k.sub, 0) + (b.kids.length - 1) * GAP_X;
    let left = cx - total / 2;
    for (const k of b.kids) { place(k, left + k.sub / 2, y + b.h + GAP_Y, boxes); left += k.sub + GAP_X; }
  }
}

/**
 * Calcula o layout de um fluxo. Devolve:
 * - boxes: Map(id → caixa) com x, y, w, h, tipo, linhas de texto e o rótulo do ramo;
 * - edges: ligações da sequência (do pai para o próximo), com o rótulo do ramo;
 * - relations: setas extras do documento (com rótulo), para desenhar por cima;
 * - bounds: retângulo que contém tudo (para ajustar à tela).
 */
function layoutFlow(map) {
  const root = measure(map.root);
  const boxes = new Map();
  place(root, 0, 0, boxes);
  const edges = [];
  for (const b of boxes.values()) for (const k of b.kids) edges.push({ from: b.id, to: k.id, label: k.branch });
  const relations = map.meta.relations.filter((r) => boxes.has(r.from) && boxes.has(r.to)).map((r) => ({ id: r.id, from: r.from, to: r.to, label: r.label || '' }));
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const b of boxes.values()) { x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h); }
  const bounds = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  return { boxes, edges, relations, bounds };
}

module.exports = { layoutFlow, wrapWords, GAP_X, GAP_Y };
