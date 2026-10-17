'use strict';
/**
 * Menu e barra flutuante da versão tablet. No desktop os comandos ficam no menu da janela (electron/main.js) e nos atalhos de teclado;
 * aqui um botão "☰" abre a mesma lista e dispara os MESMOS comandos ('menu' + nome). Em aparelhos de toque a barra ganha botões para o que
 * no desktop é só teclado: Editar (F2), Recolher/Expandir (Espaço) e a gaveta de Painéis (em janelas estreitas).
 */
const ITEMS = [
  ['Arquivo', [['new', 'Novo mapa'], ['template', 'Novo mapa de concurso (modelo)'], ['open', 'Abrir arquivo…'], ['save', 'Salvar'], ['saveAs', 'Salvar como…'], ['home', 'Tela inicial']]],
  ['Estudo', [['review', 'Revisão do dia'], ['dash', 'Painel de estudos'], ['lib', 'Biblioteca de mapas'], ['libAdd', 'Guardar na biblioteca'], ['sync', 'Sincronização (opcional)…'], ['plan', 'Planilha de planejamento…'], ['csv', 'Importar CSV (IA)…'], ['edital', 'Importar edital…']]],
  ['Ver', [['graph', 'Rede de conhecimento'], ['pdf', 'Leitor de PDF'], ['present', 'Apresentar'], ['fit', 'Ajustar à tela'], ['help', 'Atalhos e ajuda']]],
  ['Editar', [['undo', 'Desfazer'], ['redo', 'Refazer']]],
];

function installMenu({ emit, css = '' }) {
  const style = document.createElement('style');
  style.textContent = `${css}
  #mcHostMenu { position: fixed; left: 10px; bottom: 124px; z-index: 99991; width: min(340px, calc(100vw - 20px)); max-height: calc(100vh - 150px); overflow: auto; background: var(--bg-panel, #2b2b2b); color: var(--text, #e8e8e8); border: 1px solid var(--line-soft, #555); border-radius: 14px; padding: 8px; box-shadow: 0 12px 40px rgba(0,0,0,.5); font: 15px system-ui, sans-serif; }
  #mcHostMenu h3 { margin: 10px 8px 4px; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--text-dim, #aaa); }
  #mcHostMenu button { display: block; width: 100%; min-height: 44px; text-align: left; padding: 0 12px; border: 0; border-radius: 10px; background: transparent; color: inherit; font: inherit; cursor: pointer; }
  #mcHostMenu button:hover, #mcHostMenu button:focus-visible { background: var(--bg-hover, #3a3a3a); }`;
  document.head.append(style);

  const bar = document.createElement('div'); bar.id = 'mcTouchBar'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Menu e ações rápidas');
  const mk = (id, label, text, cls = '') => { const b = document.createElement('button'); b.type = 'button'; b.id = id; b.textContent = text; b.setAttribute('aria-label', label); b.title = label; if (cls) b.className = cls; return b; };
  const btn = mk('mcHostMenuBtn', 'Menu', '☰'); btn.setAttribute('aria-haspopup', 'true'); btn.setAttribute('aria-expanded', 'false');
  const edit = mk('tbEdit', 'Editar o texto do tópico', '✎', 'tb-extra'), fold = mk('tbFold', 'Recolher ou expandir o ramo', '⇕', 'tb-extra'), panels = mk('tbPanels', 'Painéis (Estudo, Notas, Conexões…)', '☷', 'tb-extra tb-panels-btn');
  panels.setAttribute('aria-expanded', 'false');
  bar.append(btn, edit, fold, panels);

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
  edit.onclick = () => key('F2'); fold.onclick = () => key(' ');

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
