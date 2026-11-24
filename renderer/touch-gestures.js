'use strict';
/* Gestos no mapa: um dedo no fundo arrasta a vista, um dedo no tópico o move, dois dedos fazem pinça.
   Usa as globais do mapa de renderer.js (svg, pan, map, render, nodeAt, zoomMapAt). Carregado logo depois de renderer.js. */

// Gestos de toque: um dedo no fundo move a vista; dois dedos fazem pinça e movem a vista junto.
const touchPts = new Map();
let pinch = null, touchPan = null, touchMouseId = null, touchMouseStart = null, touchMouseMoved = false, lastTouchTap = null;
const svgRel = (e) => { const r = svg.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
function sendMouse(type, e) {
  // O gesto do tópico reutiliza o fluxo de mouse já responsável por seleção e reordenação.
  const target = type === 'mousedown' ? e.target : window;
  target.dispatchEvent(new MouseEvent(type, {
    bubbles: true, cancelable: true, clientX: e.clientX, clientY: e.clientY,
    button: 0, buttons: type === 'mouseup' ? 0 : 1, detail: type === 'mousedown' ? 1 : 0,
  }));
}
function cancelTouchDrag() {
  if (touchMouseId === null) return;
  touchMouseId = null;
  drag = null;
  clearDropMarks();
  svg.classList.remove('panning');
  const marquee = document.getElementById('marquee');
  if (marquee) marquee.hidden = true;
  touchMouseStart = null;
  touchMouseMoved = false;
}
svg.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch' || !map) return;
  touchPts.set(e.pointerId, svgRel(e));
  if (touchPts.size === 2) {
    cancelTouchDrag();
    lastTouchTap = null;
    const [a, b] = [...touchPts.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
    touchPan = null;
  } else if (touchPts.size === 1 && nodeAt(e.target)) {
    e.preventDefault();
    touchMouseId = e.pointerId;
    touchMouseStart = { x: e.clientX, y: e.clientY };
    touchMouseMoved = false;
    touchPan = null;
    svg.setPointerCapture(e.pointerId);
    sendMouse('mousedown', e);
  } else {
    e.preventDefault();
    touchPan = touchPts.size === 1 ? svgRel(e) : null;
  }
});
svg.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'touch' || !touchPts.has(e.pointerId)) return;
  touchPts.set(e.pointerId, svgRel(e));
  if (touchMouseId === e.pointerId) {
    if (touchPts.size > 1) cancelTouchDrag();
    else {
      if (Math.hypot(e.clientX - touchMouseStart.x, e.clientY - touchMouseStart.y) >= 5) touchMouseMoved = true;
      e.preventDefault();
      sendMouse('mousemove', e);
    }
  }
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
  if (touchMouseId === e.pointerId) {
    if (e.type === 'pointerup') {
      sendMouse('mouseup', e);
      if (!touchMouseMoved) {
        const now = performance.now();
        const isDoubleTap = lastTouchTap && now - lastTouchTap.time <= 450
          && Math.hypot(e.clientX - lastTouchTap.x, e.clientY - lastTouchTap.y) <= 30;
        if (isDoubleTap) {
          const target = document.elementFromPoint(e.clientX, e.clientY);
          if (nodeAt(target)) target.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, clientX: e.clientX, clientY: e.clientY }));
          lastTouchTap = null;
        } else lastTouchTap = { time: now, x: e.clientX, y: e.clientY };
      } else lastTouchTap = null;
    } else {
      cancelTouchDrag();
      lastTouchTap = null;
    }
    touchMouseId = null;
    touchMouseStart = null;
    touchMouseMoved = false;
  }
  touchPts.delete(e.pointerId);
  pinch = null;
  const rest = [...touchPts.values()];
  touchPan = rest.length === 1 ? { ...rest[0] } : null;
};
svg.addEventListener('pointerup', endTouch);
svg.addEventListener('pointercancel', endTouch);
