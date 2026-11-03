'use strict';
/* Gestos de toque no mapa: um dedo no fundo arrasta a vista; dois dedos fazem pinça (zoom no centro entre eles).
   Usa as globais do mapa de renderer.js (svg, pan, map, render, nodeAt, zoomMapAt). Carregado logo depois de renderer.js. */

// gestos de toque: um dedo no fundo arrasta o mapa; dois dedos dão pinça (zoom no centro entre eles) e movem a vista junto
const touchPts = new Map();
let pinch = null, touchPan = null;
const svgRel = (e) => { const r = svg.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
svg.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch' || !map) return;
  touchPts.set(e.pointerId, svgRel(e));
  if (touchPts.size === 2) {
    const [a, b] = [...touchPts.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
    touchPan = null;
  } else if (touchPts.size === 1 && !nodeAt(e.target)) {
    touchPan = svgRel(e);
  } else touchPan = null;
});
svg.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'touch' || !touchPts.has(e.pointerId)) return;
  touchPts.set(e.pointerId, svgRel(e));
  if (touchPts.size === 2 && pinch) {
    const [a, b] = [...touchPts.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    if (pinch.d > 0 && d > 0) zoomMapAt(mx, my, d / pinch.d);
    pan.x += mx - pinch.mx; pan.y += my - pinch.my;
    pinch = { d, mx, my };
    render();
  } else if (touchPts.size === 1 && touchPan) {
    const p = svgRel(e);
    pan.x += p.x - touchPan.x; pan.y += p.y - touchPan.y;
    touchPan = p;
    render();
  }
});
const endTouch = (e) => {
  if (e.pointerType !== 'touch') return;
  touchPts.delete(e.pointerId);
  pinch = null;
  const rest = [...touchPts.values()];
  touchPan = rest.length === 1 ? { ...rest[0] } : null;
};
svg.addEventListener('pointerup', endTouch);
svg.addEventListener('pointercancel', endTouch);
