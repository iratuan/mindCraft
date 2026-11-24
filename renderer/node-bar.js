'use strict';
/* Node-bar: barra flutuante de ações do tópico selecionado.
   Fica FORA do #stage (como último filho de document.body) para evitar que
   o mousedown do SVG intercepte os cliques. Usa position:fixed e z-index:200.
   Cada botão captura o selectedId no momento do clique — nunca depende de sel()
   que poderia retornar null se o SVG já tivesse desselecionado o nó. */

// --- cria o elemento fora do stage ---
let nodeBarEl = document.getElementById('nodebar');
if (!nodeBarEl) {
  nodeBarEl = document.createElement('div');
  nodeBarEl.id = 'nodebar';
  nodeBarEl.className = 'node-bar';
  nodeBarEl.setAttribute('role', 'toolbar');
  nodeBarEl.setAttribute('aria-label', 'Ações do tópico selecionado');
  nodeBarEl.hidden = true;
}
// Move para fora do stage (body ou #app) para evitar que o SVG intercepte
if (nodeBarEl.parentElement && nodeBarEl.parentElement.id === 'stage') {
  nodeBarEl.remove();
}
if (!nodeBarEl.parentElement) {
  (document.getElementById('app') || document.body).appendChild(nodeBarEl);
}

// --- bloqueia eventos na fase de BOLHA para que a janela não os veja ---
// IMPORTANTE: NÃO usar captura (true) aqui. Um listener de captura no contêiner
// dispara ANTES do alvo e, com stopPropagation(), impediria o clique de chegar
// aos próprios botões — era exatamente o bug que fazia a barra "fechar" sem agir.
for (const evt of ['mousedown', 'pointerdown', 'touchstart', 'mouseup', 'pointerup', 'touchend', 'click']) {
  nodeBarEl.addEventListener(evt, (e) => e.stopPropagation());
}

// --- definição dos botões ---
const NB_BUTTONS = [
  { id: 'nbChild',    icon: 'child', label: 'Novo subtópico (Tab)',        act: 'child' },
  { id: 'nbUp',       icon: 'up',    label: 'Subir tópico (Alt+↑)',       act: 'moveUp' },
  { id: 'nbDown',     icon: 'down',  label: 'Descer tópico (Alt+↓)',      act: 'moveDown' },
  { id: 'nbSep1',     sep: true },
  { id: 'nbNote',     icon: 'note',  label: 'Escrever nota',              act: 'openNote' },
  { id: 'nbAi',       icon: 'spark', label: 'Assistente de IA',           act: 'showAi' },
  { id: 'nbSep2',     sep: true },
  { id: 'nbDelete',   icon: 'bin',   label: 'Excluir tópico (Del)',       act: 'delete', danger: true },
];

/** Executa a ação capturando o selectedId naquele instante. */
function nbRun(action, capturedId) {
  if (!map) return;
  // garante que o tópico capturado ainda é o selecionado (ou força a seleção)
  if (capturedId && capturedId !== selectedId) {
    selectedId = capturedId;
    selIds = new Set([capturedId]);
  }
  switch (action) {
    case 'child':    act.child(); break;
    case 'moveUp':   act.moveUp(); break;
    case 'moveDown': act.moveDown(); break;
    case 'openNote': {
      const s = sel();
      if (s && typeof openNotesFor === 'function') openNotesFor(s.node.id);
      break;
    }
    case 'showAi':   if (typeof showPanel === 'function') showPanel('ai'); break;
    case 'delete':
      // act.delete() usa targets(), que pega TODA a seleção (selIds). A barra de
      // tópico deve excluir só o tópico sobre o qual está flutuando (e os filhos
      // dele, que remove() já leva junto) — nunca outros tópicos selecionados.
      if (capturedId) { selectedId = capturedId; selIds = new Set([capturedId]); }
      act.delete();
      break;
  }
}

/** Reconstrói os botões (só na primeira vez). */
function buildNodeBar() {
  if (nodeBarEl.childElementCount) return;
  for (const b of NB_BUTTONS) {
    if (b.sep) {
      const sep = document.createElement('span');
      sep.className = 'nb-sep';
      nodeBarEl.append(sep);
      continue;
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = b.id;
    btn.className = 'nb-btn' + (b.danger ? ' danger' : '');
    btn.innerHTML = typeof iconSvg === 'function' ? iconSvg(b.icon, 18) : b.label;
    btn.title = b.label;
    btn.setAttribute('aria-label', b.label);
    // Captura o selectedId NO MOMENTO do pointerdown, antes de qualquer outro handler.
    // Sem preventDefault(): ele pode suprimir o clique em alguns motores de renderer.
    let capturedId = null;
    btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      capturedId = selectedId;
    });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      nbRun(b.act, capturedId || selectedId);
    });
    nodeBarEl.append(btn);
  }
}

/** Posiciona a node-bar flutuando acima do nó selecionado. */
function positionNodeBar(s) {
  if (!s || typeof L === 'undefined' || !L || !L.boxes) return;
  const b = L.boxes.get(s.node.id);
  if (!b || typeof pan === 'undefined') return;
  const stage = document.getElementById('stage');
  if (!stage) return;
  const sr = stage.getBoundingClientRect();
  // coordenada do centro do nó em pixels de tela
  const cx = sr.left + (b.x + b.w / 2) * pan.k + pan.x;
  const topY = sr.top + b.y * pan.k + pan.y;
  const barW = nodeBarEl.offsetWidth || 200;
  const barH = nodeBarEl.offsetHeight || 44;
  // acima do nó, centralizado horizontalmente, com clamping para não sair da tela
  let left = cx - barW / 2;
  let top = topY - barH - 10;
  // clamp horizontal
  left = Math.max(sr.left + 8, Math.min(left, sr.right - barW - 8));
  // se não cabe acima, põe abaixo do nó
  if (top < sr.top + 8) {
    top = topY + b.h * pan.k + 10;
  }
  nodeBarEl.style.left = left + 'px';
  nodeBarEl.style.top = top + 'px';
}

function syncNodeBar() {
  if (!nodeBarEl) return;
  const s = (typeof sel === 'function') ? sel() : null;
  const homeOpen = !!(window.MCReact && window.MCReact.homeIsOpen && window.MCReact.homeIsOpen());
  const flow = typeof flowIsOn === 'function' && flowIsOn();
  const dragging = typeof drag !== 'undefined' && !!drag && !!drag.id;
  const show = !!map && !!s && !dragging && !homeOpen && !flow && !dashOpenNow() && !document.body.classList.contains('focus-media');
  nodeBarEl.hidden = !show;
  if (!show) return;
  buildNodeBar();
  positionNodeBar(s);
  // desabilita delete na raiz (exceto se é tópico solto)
  const floating = (map.meta._momFloating || []).some((f) => f.node.id === s.node.id);
  const delBtn = document.getElementById('nbDelete');
  if (delBtn) delBtn.disabled = !s.parent && !floating;
  // desabilita moveUp/moveDown na raiz
  const isRoot = s.node.id === map.root.id;
  const upBtn = document.getElementById('nbUp');
  const downBtn = document.getElementById('nbDown');
  if (upBtn) upBtn.disabled = isRoot || !s.parent;
  if (downBtn) downBtn.disabled = isRoot || !s.parent;
}

/** O painel de mapas ocupa a área de trabalho: a barra não aparece sobre ele. */
function dashOpenNow() { const d = document.getElementById('dash'); return !!d && !d.hidden; }
