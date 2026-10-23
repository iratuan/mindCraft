'use strict';
/* Modo de Apresentação e HUD interativo de navegação.
   Carregado depois de renderer.js: usa o estado e as funções globais dele
   (map, L, pan, selectedId, render, fit, setStatus, centerOn, $...). */

let presentSavedState = null;

function updatePresentHud(i) {
  const hud = $('#hud');
  if (!hud || !present) return;
  hud.hidden = false;
  const cur = $('#presentCur'); if (cur) cur.textContent = String(i + 1);
  const total = $('#presentTotal'); if (total) total.textContent = String(present.order.length);
  const prevBtn = $('#presentPrev'); if (prevBtn) prevBtn.disabled = (i <= 0);
  const nextBtn = $('#presentNext'); if (nextBtn) nextBtn.disabled = (i >= present.order.length - 1);

  const nodeId = present.order[i];
  const node = map && map.find(nodeId)?.node;
  const title = (node ? node.title : '') || 'Sem título';
  const titleEl = $('#presentTitle');
  if (titleEl) titleEl.textContent = title;
}

function presentStep(d) {
  if (!present) return; // saiu da apresentação antes do 1º passo agendado
  const i = Math.min(present.order.length - 1, Math.max(0, present.i + d));
  present.i = i;
  updatePresentHud(i);
  render();
  centerOn(present.order[i], 1.5);
}

function initPresentEvents() {
  const prevBtn = $('#presentPrev');
  if (prevBtn) prevBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); presentStep(-1); };
  const nextBtn = $('#presentNext');
  if (nextBtn) nextBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); presentStep(1); };
  const exitBtn = $('#presentExit');
  if (exitBtn) exitBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); stopPresent(); };
}

function startPresent() {
  if (!map || (window.MCReact && window.MCReact.homeIsOpen())) {
    setStatus('Abra um mapa mental para apresentar.');
    return;
  }
  render(); // garante L atual; DFS em ordem de leitura (boxes é inserido em pré-ordem)
  const order = [...L.boxes.keys()];
  if (!order.length) {
    setStatus('O mapa não possui tópicos visíveis para apresentar.');
    return;
  }
  presentSavedState = { pan: { ...pan }, selectedId };
  present = { order, i: 0 };
  document.body.classList.add('presenting');
  try { document.documentElement.requestFullscreen?.().catch(() => {}); } catch { /* ignora */ }
  updatePresentHud(0);
  setTimeout(() => presentStep(0), 150);
}

function stopPresent() {
  if (!present) return;
  present = null;
  const hud = $('#hud');
  if (hud) hud.hidden = true;
  document.body.classList.remove('presenting');
  if (document.fullscreenElement) {
    try { document.exitFullscreen().catch(() => {}); } catch { /* ignora */ }
  }
  if (presentSavedState) {
    pan = { ...presentSavedState.pan };
    selectedId = presentSavedState.selectedId;
    presentSavedState = null;
  }
  render(); // o editor volta na hora
  setTimeout(() => { if (!present) { render(); fit(); } }, 100);
}

document.addEventListener('fullscreenchange', () => { if (present && !document.fullscreenElement) stopPresent(); });
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPresentEvents);
} else {
  initPresentEvents();
}
