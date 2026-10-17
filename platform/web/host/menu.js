'use strict';
/**
 * Menu da versão tablet. No desktop os comandos ficam no menu da janela (electron/main.js); aqui um botão "☰" abre a mesma lista
 * e dispara os MESMOS comandos ('menu' + nome), tratados pela interface sem alteração.
 */
const ITEMS = [
  ['Arquivo', [['new', 'Novo mapa'], ['template', 'Novo mapa de concurso (modelo)'], ['open', 'Abrir arquivo…'], ['save', 'Salvar'], ['saveAs', 'Salvar como…'], ['home', 'Tela inicial']]],
  ['Estudo', [['review', 'Revisão do dia'], ['dash', 'Painel de estudos'], ['lib', 'Biblioteca de mapas'], ['libAdd', 'Guardar na biblioteca'], ['plan', 'Planilha de planejamento…'], ['csv', 'Importar CSV (IA)…'], ['edital', 'Importar edital…']]],
  ['Ver', [['graph', 'Rede de conhecimento'], ['pdf', 'Leitor de PDF'], ['present', 'Apresentar'], ['fit', 'Ajustar à tela'], ['help', 'Atalhos e ajuda']]],
  ['Editar', [['undo', 'Desfazer'], ['redo', 'Refazer']]],
];

function installMenu({ emit }) {
  const style = document.createElement('style');
  style.textContent = `
  #mcHostMenuBtn { position: fixed; left: 10px; bottom: 10px; z-index: 99990; width: 48px; height: 48px; border-radius: 24px; border: 1px solid var(--line-soft, #555); background: var(--bg-panel, #2b2b2b); color: var(--text-strong, #fff); font-size: 22px; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,.4); }
  #mcHostMenu { position: fixed; left: 10px; bottom: 66px; z-index: 99991; width: min(320px, calc(100vw - 20px)); max-height: calc(100vh - 90px); overflow: auto; background: var(--bg-panel, #2b2b2b); color: var(--text, #e8e8e8); border: 1px solid var(--line-soft, #555); border-radius: 14px; padding: 8px; box-shadow: 0 12px 40px rgba(0,0,0,.5); font: 15px system-ui, sans-serif; }
  #mcHostMenu h3 { margin: 10px 8px 4px; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--text-dim, #aaa); }
  #mcHostMenu button { display: block; width: 100%; min-height: 44px; text-align: left; padding: 0 12px; border: 0; border-radius: 10px; background: transparent; color: inherit; font: inherit; cursor: pointer; }
  #mcHostMenu button:hover, #mcHostMenu button:focus-visible { background: var(--bg-hover, #3a3a3a); }`;
  document.head.append(style);
  const btn = document.createElement('button'); btn.id = 'mcHostMenuBtn'; btn.type = 'button'; btn.textContent = '☰'; btn.setAttribute('aria-label', 'Menu'); btn.setAttribute('aria-haspopup', 'true'); btn.setAttribute('aria-expanded', 'false');
  const panel = document.createElement('div'); panel.id = 'mcHostMenu'; panel.hidden = true; panel.setAttribute('role', 'menu');
  for (const [group, items] of ITEMS) {
    const h = document.createElement('h3'); h.textContent = group; panel.append(h);
    for (const [cmd, label] of items) { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'menuitem'); b.dataset.cmd = cmd; b.textContent = label; b.onclick = () => { close(); emit(cmd); }; panel.append(b); }
  }
  const close = () => { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  btn.onclick = () => { panel.hidden = !panel.hidden; btn.setAttribute('aria-expanded', String(!panel.hidden)); if (!panel.hidden) panel.querySelector('button').focus(); };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { e.stopPropagation(); close(); btn.focus(); } }, true);
  document.addEventListener('pointerdown', (e) => { if (!panel.hidden && !panel.contains(e.target) && e.target !== btn) close(); }, true);
  document.body.append(btn, panel);
}
module.exports = { installMenu, ITEMS };
