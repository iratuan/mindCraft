'use strict';
/**
 * Ponte de TOQUE → eventos de mouse (versão tablet). A interface foi feita para mouse; em vez de reescrevê-la, dedos viram os mesmos eventos:
 *   • toque rápido            → clique (selecionar); dois toques seguidos → duplo clique (editar o texto do tópico)
 *   • arrastar com 1 dedo     → arrastar fundo (mover o mapa) ou tópico (reorganizar), igual ao mouse
 *   • pinça com 2 dedos       → zoom (e arrastar o mapa junto)
 *   • toque longo (≈0,4 s)     → inclui/retira o tópico da seleção (como Ctrl+clique)
 *   • no leitor de PDF        → ao terminar de selecionar texto, avisa o painel (que espera um mouseup)
 * Só age para dedos (pointerType 'touch'); mouse e caneta seguem o caminho normal. Os eventos sintéticos são idênticos aos reais para o app.
 */
const SEL = '#svg, #gsvg';                 // mapa e rede de conhecimento
const MOVE_PX = 8, LONG_MS = 420, TAP_MS = 450,   // duplo toque: o Android usa 300 ms; 450 ms acomoda dedos mais lentos (acessibilidade) e o atraso do `adb input`
   TAP_PX = 30;   // toque longo < 500 ms: o Chrome abre o menu de contexto (e cancela o toque) aos ~500 ms

function mouse(type, x, y, o = {}) {
  return new MouseEvent(type, { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, screenX: x, screenY: y, button: 0, buttons: type === 'mouseup' || type === 'click' ? 0 : 1, detail: o.detail || 1, ctrlKey: !!o.ctrl });
}
const at = (x, y, fallback) => document.elementFromPoint(x, y) || fallback;
/**
 * Na rede de conhecimento os pontos são pequenos para um dedo (≈13 px) e o nome do nó não recebe cliques. O toque "gruda" no nó mais próximo:
 * dentro do círculo, a até 28 px dele, ou sobre o retângulo do nome (com 10 px de folga). Devolve o círculo do nó ou null.
 */
function snapNode(x, y) {
  const view = document.getElementById('gview'); if (!view) return null;
  let best = null, bestD = Infinity;
  for (const g of view.querySelectorAll('.gn')) {
    const circle = g.querySelector('circle'); if (!circle) continue;
    const r = circle.getBoundingClientRect(); let d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) - r.width / 2;
    const label = g.querySelector('text');
    if (label && label.style.display !== 'none') { const l = label.getBoundingClientRect(); if (l.width && x >= l.left - 10 && x <= l.right + 10 && y >= l.top - 10 && y <= l.bottom + 10) d = Math.min(d, 0); }
    if (d < bestD) { bestD = d; best = circle; }
  }
  return bestD <= 28 ? best : null;
}
/** Alvo do evento: o elemento sob o dedo; na rede, se não for um nó, o nó mais próximo. */
function targetAt(root, x, y) {
  const el = at(x, y, root);
  if (root && root.id === 'gsvg' && !(el.closest && el.closest('.gn'))) return snapNode(x, y) || el;
  return el;
}

function install({ vibrate = true } = {}) {
  let st = null, lastTap = { t: 0, x: 0, y: 0, n: 0 }, lastTouchUp = 0;

  function zoomAt(root, cx, cy, factor) {
    const r = root.getBoundingClientRect(), mx = cx - r.left, my = cy - r.top;
    if (root.id === 'svg' && typeof pan !== 'undefined' && typeof render === 'function') {        // mapa: zoom contínuo, igual à roda do mouse (mesma fórmula)
      const k = Math.min(4, Math.max(0.1, pan.k * factor));
      pan.x = mx - ((mx - pan.x) / pan.k) * k; pan.y = my - ((my - pan.y) / pan.k) * k; pan.k = k; render(); return;
    }
    st.acc = (st.acc || 0) + Math.log(factor) / Math.log(1.12);                                    // rede: usa a roda do mouse (passos de 12%)
    while (Math.abs(st.acc) >= 1) { const up = st.acc > 0; st.acc += up ? -1 : 1; root.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, clientX: cx, clientY: cy, deltaY: up ? -100 : 100 })); }
  }
  function panBy(root, dx, dy) {
    if (root.id === 'svg' && typeof pan !== 'undefined' && typeof render === 'function') { pan.x += dx; pan.y += dy; render(); }
  }
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y), mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const sendTap = (x, y, detail, ctrl) => {
    const tgt = targetAt(st && st.root, x, y);
    tgt.dispatchEvent(mouse('mousedown', x, y, { detail, ctrl })); window.dispatchEvent(mouse('mouseup', x, y, { detail, ctrl })); at(x, y, tgt).dispatchEvent(mouse('click', x, y, { detail, ctrl }));
  };

  function down(e) {
    if (e.pointerType !== 'touch') return;
    const root = e.target && e.target.closest ? e.target.closest(SEL) : null;
    if (st && st.root && st.ptrs.size && root === st.root) {                                 // segundo dedo na mesma superfície
      e.preventDefault(); st.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (st.phase === 'pending' || st.phase === 'long') { clearTimeout(st.timer); st.phase = 'pinch'; const [a, b] = [...st.ptrs.values()]; st.d0 = dist(a, b); st.c0 = mid(a, b); }
      return;
    }
    if (!root) return;
    e.preventDefault();
    // Com o mouse, clicar no mapa tira o foco do campo que estava sendo editado (o que CONFIRMA o texto e fecha o teclado). Aqui o pointerdown é
    // cancelado e os eventos de mouse são sintéticos (não movem o foco), então o foco é tirado explicitamente.
    const ae = document.activeElement; if (ae && ae !== document.body && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) ae.blur();
    st = { root, phase: 'pending', ptrs: new Map([[e.pointerId, { x: e.clientX, y: e.clientY }]]), sx: e.clientX, sy: e.clientY, t0: Date.now(), target: targetAt(root, e.clientX, e.clientY), id: e.pointerId };
    try { root.setPointerCapture(e.pointerId); } catch { /* captura é opcional */ }
    st.timer = setTimeout(() => {                                                              // toque longo = Ctrl+clique (seleção múltipla)
      if (!st || st.phase !== 'pending') return;
      st.phase = 'long'; if (vibrate && navigator.vibrate) { try { navigator.vibrate(15); } catch { /* sem vibração */ } }
      sendTap(st.sx, st.sy, 1, true);
    }, LONG_MS);
  }
  function move(e) {
    if (!st || e.pointerType !== 'touch' || !st.ptrs.has(e.pointerId)) return;
    e.preventDefault(); const prev = st.ptrs.get(e.pointerId), cur = { x: e.clientX, y: e.clientY }; st.ptrs.set(e.pointerId, cur);
    if (st.phase === 'pinch' && st.ptrs.size >= 2) {
      const [a, b] = [...st.ptrs.values()], d = dist(a, b), c = mid(a, b);
      if (st.d0 > 4 && d > 4) { zoomAt(st.root, c.x, c.y, d / st.d0); panBy(st.root, c.x - st.c0.x, c.y - st.c0.y); }
      st.d0 = d; st.c0 = c; return;
    }
    if (st.ptrs.size > 1 || e.pointerId !== st.id) return;
    if (st.phase === 'pending' && Math.hypot(cur.x - st.sx, cur.y - st.sy) > MOVE_PX) {          // começou a arrastar: o "mouse" desce no ponto de partida
      clearTimeout(st.timer); st.phase = 'drag'; st.target.dispatchEvent(mouse('mousedown', st.sx, st.sy, { detail: 1 }));
    }
    if (st.phase === 'drag') window.dispatchEvent(mouse('mousemove', cur.x, cur.y));
    void prev;
  }
  function up(e) {
    if (!st || e.pointerType !== 'touch' || !st.ptrs.has(e.pointerId)) return;
    e.preventDefault(); lastTouchUp = Date.now(); const cur = { x: e.clientX, y: e.clientY }; st.ptrs.delete(e.pointerId); clearTimeout(st.timer);
    if (st.phase === 'drag' && e.pointerId === st.id) { window.dispatchEvent(mouse('mouseup', cur.x, cur.y)); st = null; return; }
    if (st.phase === 'pending' && e.pointerId === st.id && e.type !== 'pointercancel') {
      const now = Date.now(), again = now - lastTap.t < TAP_MS && Math.hypot(cur.x - lastTap.x, cur.y - lastTap.y) < TAP_PX, n = again ? lastTap.n + 1 : 1;
      lastTap = { t: now, x: cur.x, y: cur.y, n }; sendTap(cur.x, cur.y, n, false);
    }
    if (!st.ptrs.size) st = null;
  }
  // O Chrome também gera 'click'/'dblclick' NATIVOS depois de um toque. Como já sintetizamos os nossos (com a contagem certa), os nativos
  // sobre o mapa/rede são descartados: sem isso o duplo toque abriria o editor duas vezes (e poderia reabri-lo depois do Enter).
  const dupNative = (e) => { if (e.isTrusted && Date.now() - lastTouchUp < 800 && e.target && e.target.closest && e.target.closest(SEL)) { e.stopImmediatePropagation(); e.preventDefault(); } };
  window.addEventListener('click', dupNative, true); window.addEventListener('dblclick', dupNative, true);
  window.addEventListener('contextmenu', (e) => { if (e.target && e.target.closest && e.target.closest(SEL)) e.preventDefault(); }, true);   // sem menu de contexto do navegador sobre o mapa
  window.addEventListener('pointerdown', down, true);
  window.addEventListener('pointermove', move, { capture: true, passive: false });
  window.addEventListener('pointerup', up, true);
  window.addEventListener('pointercancel', up, true);

  // Leitor de PDF: depois de selecionar texto com o dedo, o painel precisa do "mouseup" para mostrar "＋ Tópico / ＋ Nota"
  let selTimer = null;
  document.addEventListener('selectionchange', () => {
    clearTimeout(selTimer);
    selTimer = setTimeout(() => {
      const s = window.getSelection(), sc = document.getElementById('pdfScroll');
      if (!sc || !s || s.isCollapsed || !s.anchorNode || !sc.contains(s.anchorNode)) return;
      const r = s.getRangeAt(0).getBoundingClientRect(); sc.dispatchEvent(mouse('mouseup', r.right, r.bottom));
    }, 400);
  });
  return { dispose() { window.removeEventListener('click', dupNative, true); window.removeEventListener('dblclick', dupNative, true); window.removeEventListener('pointerdown', down, true); window.removeEventListener('pointermove', move, true); window.removeEventListener('pointerup', up, true); window.removeEventListener('pointercancel', up, true); } };
}
module.exports = { install, SEL };
