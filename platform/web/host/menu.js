'use strict';
/**
 * Menu e barra flutuante da versão tablet. No desktop os comandos ficam no menu da janela (electron/main.js) e nos atalhos de teclado;
 * aqui um botão "☰" abre a mesma lista e dispara os MESMOS comandos ('menu' + nome). Em aparelhos de toque a barra ganha botões para o que
 * no desktop é só teclado: Editar (F2), Recolher/Expandir (Espaço) e a gaveta de Painéis (em janelas estreitas).
 */
const ITEMS = [
  ['Arquivo', [['new', 'Novo mapa'], ['template', 'Novo mapa de concurso (modelo)'], ['open', 'Abrir arquivo…'], ['save', 'Salvar'], ['saveAs', 'Salvar como…'], ['home', 'Tela inicial']]],
  ['Estudo', [['review', 'Revisão do dia'], ['dash', 'Painel de estudos'], ['lib', 'Biblioteca de mapas'], ['libAdd', 'Guardar na biblioteca'], ['sync', 'Sincronização (opcional)…'], ['plan', 'Planilha de planejamento…'], ['csv', 'Importar CSV (IA)…'], ['edital', 'Importar edital…']]],
  ['Ver', [['graph', 'Rede de conhecimento'], ['pdf', 'Leitor de PDF'], ['video', 'Player de Vídeo (videoaulas)'], ['browser', 'Navegador Web (questões e leis)'], ['present', 'Apresentar'], ['fit', 'Ajustar à tela'], ['panelsToggle', 'Painel lateral: recolher/expandir'], ['manual', 'Manual de uso'], ['help', 'Atalhos do teclado']]],
  ['Editar', [['undo', 'Desfazer'], ['redo', 'Refazer'], ['moveUp', 'Subir tópico'], ['moveDown', 'Descer tópico'], ['outdent', 'Promover (subir um nível)'], ['indent', 'Rebaixar (virar filho do irmão de cima)']]],
];

function installMenu({ emit, css = '' }) {
  const style = document.createElement('style');
  style.textContent = `${css}
  #mcHostMenu { position: fixed; left: 10px; bottom: 124px; z-index: 99991; width: min(340px, calc(100vw - 20px)); max-height: calc(100vh - 150px); overflow: auto; background: var(--bg-panel, #2b2b2b); color: var(--text, #e8e8e8); border: 1px solid var(--line-soft, #555); border-radius: 14px; padding: 8px; box-shadow: 0 12px 40px rgba(0,0,0,.5); font: 15px system-ui, sans-serif; }
  #mcHostMenu h3 { margin: 10px 8px 4px; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--text-dim, #aaa); }
  #mcHostMenu button { display: block; width: 100%; min-height: 44px; text-align: left; padding: 0 12px; border: 0; border-radius: 10px; background: transparent; color: inherit; font: inherit; cursor: pointer; }
  #mcHostMenu button:hover, #mcHostMenu button:focus-visible { background: var(--bg-hover, #3a3a3a); }`;
  document.head.append(style);

  const ICONS = {
    menu: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    fold: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    expand: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>',
    up: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
    down: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>',
    out: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    in: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    panels: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',
  };

  const bar = document.createElement('div'); bar.id = 'mcTouchBar'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Menu e ações rápidas');
  const mk = (id, label, iconSvg, fallbackText, cls = '') => {
    const b = document.createElement('button');
    b.type = 'button';
    b.id = id;
    b.setAttribute('aria-label', label);
    b.title = label;
    if (cls) b.className = cls;
    b.innerHTML = `${iconSvg}<span style="display:none">${fallbackText}</span>`;
    return b;
  };
  const btn = mk('mcHostMenuBtn', 'Menu', ICONS.menu, '☰'); btn.setAttribute('aria-haspopup', 'true'); btn.setAttribute('aria-expanded', 'false');
  const edit = mk('tbEdit', 'Editar o texto do tópico', ICONS.edit, '✎', 'tb-extra');
  const fold = mk('tbFold', 'Recolher ou expandir o ramo', ICONS.fold, '⊟', 'tb-extra');
  const panels = mk('tbPanels', 'Painéis (Estudo, Notas, Conexões…)', ICONS.panels, '☷', 'tb-extra tb-panels-btn');
  panels.setAttribute('aria-expanded', 'false');
  // reordenar sem teclado (no desktop é Alt+setas): sobe/desce entre irmãos, promove/rebaixa de nível
  const up = mk('tbUp', 'Subir o tópico (trocar com o irmão de cima)', ICONS.up, '▲', 'tb-extra');
  const down = mk('tbDown', 'Descer o tópico (trocar com o irmão de baixo)', ICONS.down, '▼', 'tb-extra');
  const out = mk('tbOut', 'Promover: subir um nível', ICONS.out, '◀', 'tb-extra');
  const inn = mk('tbIn', 'Rebaixar: virar filho do irmão de cima', ICONS.in, '▶', 'tb-extra');
  up.onclick = () => emit('moveUp'); down.onclick = () => emit('moveDown'); out.onclick = () => emit('outdent'); inn.onclick = () => emit('indent');
  bar.append(btn, edit, fold, up, down, out, inn, panels);

  const panel = document.createElement('div'); panel.id = 'mcHostMenu'; panel.hidden = true; panel.setAttribute('role', 'menu');
  for (const [group, items] of ITEMS) {
    const h = document.createElement('h3'); h.textContent = group; panel.append(h);
    for (const [cmd, label] of items) { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'menuitem'); b.dataset.cmd = cmd; b.textContent = label; b.onclick = () => { close(); emit(cmd); }; panel.append(b); }
  }
  // A "cortina" (scrim) cobre a tela atrás do menu/gaveta. Tocar nela só FECHA: o fechamento acontece no 'click' (depois de soltar o dedo), com a
  // cortina ainda no lugar; se fechasse no pointerdown o 'click' seguinte cairia no botão que estava por baixo (ex.: "Apresentar").
  const syncScrim = () => { scrim.hidden = panel.hidden && !document.body.classList.contains('tb-panels'); };
  const close = () => { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); syncScrim(); };
  btn.onclick = () => { closePanels(); panel.hidden = !panel.hidden; btn.setAttribute('aria-expanded', String(!panel.hidden)); syncScrim(); if (!panel.hidden) panel.querySelector('button').focus(); };

  // teclas que no desktop são só teclado: mesmos eventos que a interface já trata
  const key = (k) => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  edit.onclick = () => key('F2'); fold.onclick = () => emit('toggle');
  // ⊟ = recolher o ramo (esconde os subtópicos) · ⊞ = expandir. Desativado quando o tópico não tem subtópicos. O texto diz quantos subtópicos mexem.
  const syncFold = () => {
    const st = window.MCView && window.MCView.branchState ? window.MCView.branchState() : { can: false };
    fold.disabled = !st.can;
    const isCol = st.can && st.collapsed;
    fold.innerHTML = `${isCol ? ICONS.expand : ICONS.fold}<span style="display:none">${isCol ? '⊞' : '⊟'}</span>`;
    const lbl = !st.can ? 'Recolher ou expandir o ramo (selecione um tópico que tenha subtópicos)' : st.collapsed ? `Expandir o ramo: mostrar ${st.count} subtópico(s)` : `Recolher o ramo: esconder ${st.count} subtópico(s)`;
    fold.title = lbl; fold.setAttribute('aria-label', lbl);
  };

  // Visibilidade e estado contextual da barra do tablet:
  // Os botões de manipulação de tópicos só respondem quando há seleção ativa e adequada.
  const syncBar = () => {
    const graph = document.getElementById('graph');
    if (graph && !graph.hidden) {
      if (!panel.hidden) close();
      return;
    }

    const hasSel = window.MCView && window.MCView.hasSelection ? window.MCView.hasSelection() : false;
    const isRoot = window.MCView && window.MCView.isRoot ? window.MCView.isRoot() : false;

    edit.disabled = !hasSel;
    up.disabled = !hasSel || isRoot;
    down.disabled = !hasSel || isRoot;
    out.disabled = !hasSel || isRoot;
    inn.disabled = !hasSel || isRoot;

    [edit, up, down, out, inn].forEach((b) => {
      b.style.opacity = b.disabled ? '0.35' : '1';
      b.style.pointerEvents = b.disabled ? 'none' : 'auto';
    });

    syncFold();
  };
  window.addEventListener('mc:render', syncBar);
  new MutationObserver(syncBar).observe(document.body, { attributes: true, subtree: true, attributeFilter: ['hidden', 'class'] });
  syncBar();

  // gaveta de painéis (janela estreita)
  const scrim = document.createElement('div'); scrim.id = 'tbScrim'; scrim.hidden = true;
  const openPanels = () => { document.body.classList.add('tb-panels'); panels.setAttribute('aria-expanded', 'true'); close(); syncScrim(); };
  function closePanels() { document.body.classList.remove('tb-panels'); panels.setAttribute('aria-expanded', 'false'); syncScrim(); }
  panels.onclick = () => (document.body.classList.contains('tb-panels') ? closePanels() : openPanels());
  scrim.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); closePanels(); close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 1000) closePanels(); });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { e.stopPropagation(); close(); btn.focus(); } else if (e.key === 'Escape' && document.body.classList.contains('tb-panels')) { closePanels(); } }, true);
  document.body.append(bar, panel, scrim);
  return { closePanels, openPanels };
}
module.exports = { installMenu, ITEMS };
