'use strict';
// Posicionamento de RÓTULOS da rede de conhecimento — lógica PURA (sem DOM): recebe pontos já em coordenadas de tela e devolve onde cada rótulo vai.
// Separado de renderer/graph-ui.js para ser testável sem tela (test/graph-labels.test.js) e reutilizável (ex.: exportar a rede como imagem).
//
// Regras:
//  - cada rótulo tenta 4 posições (embaixo, à direita, em cima, à esquerda) e só some se nenhuma estiver livre;
//  - um rótulo nunca cobre outro rótulo, outro ponto, nem um obstáculo (legenda, botões…), respeitando uma folga (`gap`);
//  - a quantidade de rótulos "comuns" é limitada por um orçamento (densidade); os `forced` (selecionado, vizinhos, achados da busca) sempre aparecem;
//  - determinístico: mesma entrada → mesma saída.

const ROW_H = 15;                 // altura reservada para uma linha de rótulo (px de tela)
const CELL = 80;                  // lado da célula da grade espacial

/** Grade espacial de retângulos: inserir e consultar colisão em ~O(1) por célula. */
class SpatialGrid {
  constructor(cell = CELL) { this.cell = cell; this.cells = new Map(); }
  _key(cx, cy) { return cx * 100003 + cy; }
  put(b) {
    const c = this.cell;
    for (let cx = Math.floor(b.x / c); cx <= Math.floor((b.x + b.w) / c); cx++) for (let cy = Math.floor(b.y / c); cy <= Math.floor((b.y + b.h) / c); cy++) {
      const k = this._key(cx, cy); (this.cells.get(k) || this.cells.set(k, []).get(k)).push(b);
    }
    return b;
  }
  /** `b` encosta (com folga `gap`) em algum retângulo guardado, exceto `skip`? */
  hits(b, gap = 0, skip = null) {
    const c = this.cell;
    for (let cx = Math.floor((b.x - gap) / c); cx <= Math.floor((b.x + b.w + gap) / c); cx++) for (let cy = Math.floor((b.y - gap) / c); cy <= Math.floor((b.y + b.h + gap) / c); cy++) {
      const l = this.cells.get(this._key(cx, cy)); if (!l) continue;
      for (const o of l) if (o !== skip && b.x - gap < o.x + o.w && o.x < b.x + b.w + gap && b.y - gap < o.y + o.h && o.y < b.y + b.h + gap) return true;
    }
    return false;
  }
}

/**
 * @param items  [{ id, x, y, r, text, forced?, score?, relevant? }] — x,y,r em px de tela; só os pontos visíveis e na tela.
 * @param o      { width, height, obstacles?:[{x,y,w,h}], mode:'auto'|'all'|'relevant'|'none', budget:number, gap:number, measure(text)->px, fit(text,maxPx)->text }
 * @returns { placed: Map(id → { text, ox, oy, anchor, big }), shown }  (ox/oy = deslocamento do CENTRO do ponto até o CENTRO do texto, em px de tela)
 */
function placeLabels(items, o) {
  const { width, height, obstacles = [], mode = 'auto', budget = Infinity, gap = 0, measure, fit } = o;
  const placed = new Map(); let shown = 0;
  const grid = new SpatialGrid();
  const order = items.map((it, n) => [it, n]).sort((a, b) => (b[0].score || 0) - (a[0].score || 0) || a[1] - b[1]).map((x) => x[0]);
  const circ = new Map();
  for (const it of order) circ.set(it.id, grid.put({ x: it.x - it.r, y: it.y - it.r, w: it.r * 2, h: it.r * 2 }));
  for (const b of obstacles) if (b.w > 0 && b.h > 0) grid.put({ ...b });
  for (const it of order) {
    const forced = !!it.forced;
    const allowed = mode === 'all' ? true : mode === 'none' ? forced : mode === 'relevant' ? (forced || !!it.relevant) : (forced || shown < budget);
    if (!allowed) continue;
    const text = fit(it.text, forced ? 300 : 170), w = measure(text, it) + 6, off = it.r + 4;
    const cands = [
      { x: it.x - w / 2, y: it.y + off, anchor: 'middle', ox: 0, oy: off + ROW_H / 2 },
      { x: it.x + off, y: it.y - ROW_H / 2, anchor: 'start', ox: off, oy: 0 },
      { x: it.x - w / 2, y: it.y - off - ROW_H, anchor: 'middle', ox: 0, oy: -off - ROW_H / 2 },
      { x: it.x - off - w, y: it.y - ROW_H / 2, anchor: 'end', ox: -off, oy: 0 },
    ];
    let pick = null;
    if (mode === 'all') pick = cands[0];                                           // "todos": sem checar colisão
    else for (const c of cands) { const b = { x: c.x, y: c.y, w, h: ROW_H }; if (b.x >= -2 && b.x + w <= width + 2 && b.y >= 0 && b.y + ROW_H <= height + 2 && !grid.hits(b, gap, circ.get(it.id))) { pick = c; break; } }
    if (!pick && forced) pick = cands[0];                                          // o que o usuário pediu nunca some (mesmo sobre outros)
    if (!pick) continue;
    grid.put({ x: pick.x, y: pick.y, w, h: ROW_H }); shown++;
    placed.set(it.id, { text, ox: pick.ox, oy: pick.oy, anchor: pick.anchor, big: forced });
  }
  return { placed, shown };
}

/**
 * Onde pôr o rótulo de uma ligação entre os pontos `a` e `b` (px de tela). Normalmente no meio; se uma das pontas está em foco
 * (selecionada/sob o mouse), perto dela — mesmo que a outra esteja longe, fora da tela.
 * @returns { from, to, t } posição = from + (to - from) * t, com `from` a ponta em foco (ou `a`).
 */
function relationLabelAnchor(a, b, focusEnd) {
  const from = focusEnd === 'b' ? b : a, to = focusEnd === 'b' ? a : b;
  let t = 0.5;
  if (focusEnd) { const len = Math.hypot(a.x - b.x, a.y - b.y) || 1; t = Math.min(0.5, 110 / len); }
  return { from, to, t, x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}

module.exports = { placeLabels, relationLabelAnchor, SpatialGrid, ROW_H };
