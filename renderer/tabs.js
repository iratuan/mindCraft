'use strict';
/* Várias abas de mapa. Cada aba guarda o seu estado (mapa, arquivo, alterações, vista e seleção). A aba ativa é a que está
   nas variáveis globais do mapa (map, filePath, dirty, pan, selectedId…). Trocar de aba salva o estado da atual e repõe o da outra.
   Um mapa aberto só fecha pelo botão ✕ da própria aba. Carregado depois de renderer.js e context-ui.js. */

let tabs = [];          // { state } de cada aba; a aba ativa tem state desatualizado (o estado vivo está nas globais)
let activeIdx = -1;

/** Estado vivo do mapa (globais) para guardar na aba. */
function captureActive() {
  if (typeof commitNotes === 'function') commitNotes();
  return { map, filePath, dirty, pan: { ...pan }, userZoomed, selectedId, selIds: new Set(selIds), selectedRel: null, hits: null, notesOwner: null };
}

/** Repõe um estado de aba nas globais do mapa. */
function applyTabState(st) {
  map = st.map; filePath = st.filePath; dirty = st.dirty;
  pan = { ...st.pan };
  userZoomed = !!st.userZoomed;
  selectedId = st.selectedId; selIds = new Set(st.selIds);
  selectedRel = null; hits = null; relateFrom = null; notesOwner = null;
  rev++;
}

/** Antes de carregar um mapa: abrir arquivo reaproveita a aba atual só se ela estiver vazia e sem alterações; mapa novo sempre abre aba própria. */
function beginTab(alwaysNew = false) {
  if (!alwaysNew && activeIdx >= 0 && map && !filePath && !dirty) return;   // ao abrir um arquivo, um mapa novo ainda sem nada é reaproveitado
  if (activeIdx >= 0 && tabs[activeIdx]) tabs[activeIdx].state = captureActive();
  tabs.push({ state: null });
  activeIdx = tabs.length - 1;
}

/** Caminho já aberto em alguma aba? Devolve o índice ou -1. */
function tabIndexOfPath(p) {
  if (activeIdx >= 0 && filePath && filePath.toLowerCase() === String(p).toLowerCase()) return activeIdx;
  return tabs.findIndex((t, i) => i !== activeIdx && t.state && t.state.filePath && t.state.filePath.toLowerCase() === String(p).toLowerCase());
}

function switchTab(i) {
  if (i === activeIdx || i < 0 || i >= tabs.length) return;
  const cur = captureActive();
  if (activeIdx >= 0) tabs[activeIdx].state = cur;
  activeIdx = i;
  applyTabState(tabs[i].state);
  if (typeof closeHome === 'function') closeHome();
  if (!userZoomed) fit(); else render();   // aba em modo automático volta a caber na área visível
  renderTabs();
}

/** Fecha uma aba. Com alterações não salvas, pergunta antes (Salvar / Descartar / Cancelar). */
async function closeTab(i) {
  if (i < 0 || i >= tabs.length) return false;
  if (tabs.length === 1) return closeCurrentMap();
  if (i !== activeIdx) switchTab(i);
  if (dirty && typeof confirmDiscard === 'function') {
    const go = await confirmDiscard();
    if (!go) return false;
  }
  tabs.splice(i, 1);
  const next = Math.min(i, tabs.length - 1);
  activeIdx = next;
  applyTabState(tabs[next].state);
  render(); renderTabs();
  return true;
}

/** Desenha a faixa de abas. A aba ativa mantém os ids usados pelo restante da interface (#tabMap, #docTitle, #dirtyDot, #closeMapBtn). */
function renderTabs() {
  const nav = document.getElementById('tabbar');
  if (!nav) return;
  const frag = document.createDocumentFragment();
  const titleOf = (t, i) => {
    const st = i === activeIdx ? { filePath, map } : t.state;
    if (!st || !st.map) return 'Sem título';
    const name = st.filePath ? st.filePath.split(/[\\/]/).pop().replace(/\.mom$/i, '') : (st.map.root.title || 'Sem título');
    return name;
  };
  const list = tabs.length ? tabs : [null];
  list.forEach((t, i) => {
    const active = i === activeIdx || (!tabs.length && i === 0);
    const div = document.createElement('div');
    div.className = 'tab' + (active ? ' on' : '');
    div.setAttribute('role', 'tab');
    div.setAttribute('aria-selected', String(active));
    div.tabIndex = 0;
    if (active) {
      div.id = 'tabMap';
      div.title = 'Mapa mental';
      const ico = document.createElement('span');
      ico.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 9V4M9 14l-5 4M15 14l5 4"/></svg>';
      const title = document.createElement('span');
      title.id = 'docTitle';
      title.textContent = tabs.length ? titleOf(t, i) : 'Sem título';
      const dot = document.createElement('span');
      dot.id = 'dirtyDot';
      dot.title = 'Alterações não salvas';
      dot.hidden = !dirty;
      const x = document.createElement('button');
      x.id = 'closeMapBtn'; x.type = 'button'; x.className = 'tab-x';
      x.title = 'Fechar mapa (cada aba fecha pelo seu ✕)'; x.setAttribute('aria-label', 'Fechar mapa');
      x.innerHTML = '<svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>';
      div.append(ico, title, dot, x);
    } else {
      div.dataset.tab = String(i);
      const title = document.createElement('span');
      title.textContent = titleOf(t, i);
      const x = document.createElement('button');
      x.type = 'button'; x.className = 'tab-x'; x.dataset.close = String(i);
      x.title = 'Fechar esta aba'; x.setAttribute('aria-label', 'Fechar esta aba: ' + title.textContent);
      x.innerHTML = '<svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>';
      div.append(title, x);
    }
    frag.append(div);
  });
  nav.replaceChildren(frag);
}

// cliques na faixa: trocar de aba, fechar uma aba (a ativa usa o ✕ dela)
const tabBar = document.getElementById('tabbar');
if (tabBar) tabBar.addEventListener('click', (e) => {
  const close = e.target.closest('[data-close]');
  if (close) { e.stopPropagation(); closeTab(Number(close.dataset.close)); return; }
  if (e.target.closest('#closeMapBtn')) { e.stopPropagation(); closeCurrentMap(); return; }
  const tab = e.target.closest('[data-tab]');
  if (tab) switchTab(Number(tab.dataset.tab));
});
