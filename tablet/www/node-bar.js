'use strict';
/* Barra flutuante do tópico selecionado: subtópico, expandir, contrair, nota, IA e excluir. Aparece no canto inferior da área
   de trabalho só com um tópico selecionado. Cada ação usa a mesma função do menu e do teclado (act, openNotesFor, showPanel).
   Carregado depois de renderer.js e context-ui.js (usa os globais deles). */

const nodeBarEl = document.getElementById('nodebar');
if (nodeBarEl) nodeBarEl.addEventListener('mousedown', (e) => e.stopPropagation());
const NB_BUTTONS = [
  { id: 'nbChild', icon: 'child', label: 'Novo subtópico (Tab)', run: () => act.child() },
  { id: 'nbNote', icon: 'note', label: 'Escrever nota', run: () => { const s = sel(); if (s) openNotesFor(s.node.id); } },
  { id: 'nbAi', icon: 'spark', label: 'Assistente de IA', run: () => { showPanel('ai'); } },
  { id: 'nbDelete', icon: 'bin', label: 'Excluir tópico (Del)', danger: true, run: () => act.delete() },
];

/** Expande ou contrai os filhos do tópico selecionado (uma ação desfazível). */
function setSelectedCollapsed(v) {
  if (!map) return;
  const s = sel();
  if (!s || !s.node.children.length) return;
  change(() => map.update(s.node.id, { collapsed: v }));
}

function syncNodeBar() {
  if (!nodeBarEl) return;
  const s = sel();
  const homeOpen = !!(window.MCReact && window.MCReact.homeIsOpen && window.MCReact.homeIsOpen());
  const flow = typeof flowIsOn === 'function' && flowIsOn();
  const show = !!map && !!s && !homeOpen && !flow && !dashOpenNow() && !document.body.classList.contains('focus-media');
  nodeBarEl.hidden = !show;
  if (!show) return;
  // posiciona a barra flutuante ao lado do nó selecionado
  try {
    if (typeof L !== 'undefined' && L && L.boxes) {
      const b = L.boxes.get(s.node.id);
      if (b && typeof pan !== 'undefined') {
        const cx = (b.x + b.w / 2) * pan.k + pan.x;
        const top = b.y * pan.k + pan.y;
        const stage = document.getElementById('stage');
        const sr = stage ? stage.getBoundingClientRect() : { left: 0, top: 0 };
        nodeBarEl.style.left = Math.max(8, Math.min(cx - nodeBarEl.offsetWidth / 2, sr.width - nodeBarEl.offsetWidth - 8)) + 'px';
        nodeBarEl.style.top = (top - nodeBarEl.offsetHeight - 8) + 'px';
        nodeBarEl.style.transform = 'none';
        nodeBarEl.style.bottom = 'auto';
      }
    }
  } catch (e) { /* ignora posicionamento se falhar */ }
  if (!nodeBarEl.childElementCount) {
    for (const b of NB_BUTTONS) {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.id = b.id; btn.className = 'nb-btn' + (b.danger ? ' danger' : '');
      btn.innerHTML = iconSvg(b.icon, 18);   // ícone plano: a cor vem do tema; o nome vai para o leitor de tela e a dica
      btn.title = b.label; btn.setAttribute('aria-label', b.label);
      btn.onmousedown = (e) => { e.stopPropagation(); e.preventDefault(); };
      btn.onclick = (e) => { e.stopPropagation(); b.run(); };
      nodeBarEl.append(btn);
    }
  }
  const floating = (map.meta._momFloating || []).some((f) => f.node.id === s.node.id);
  document.getElementById('nbDelete').disabled = !s.parent && !floating;   // a raiz do mapa não pode ser excluída; tópico solto pode
}

/** O painel de mapas ocupa a área de trabalho: a barra não aparece sobre ele. */
function dashOpenNow() { const d = document.getElementById('dash'); return !!d && !d.hidden; }
