'use strict';
/* Comandos de menu: o menu nativo do desktop e a barra de menus da interface chamam runMenuCommand(). Usa as globais de renderer.js. */

// comandos de menu (menu nativo do desktop e barra de menus da interface compartilham este caminho)
async function runMenuCommand(c) {
  const field = ['TEXTAREA', 'INPUT'].includes(document.activeElement && document.activeElement.tagName);
  if (['copy', 'cut', 'paste', 'selectAll'].includes(c)) return editCommand(c);
  if ((c === 'undo' || c === 'redo') && field) return document.execCommand(c); // desfazer texto digitado
  if (c === 'new') { newMap(); }
  if (c === 'organize') return organizeMap();
  if (c === 'new-flow') return newFlow();
  if (c === 'reviews') return openReviewsModal();
  if (c === 'reviews-all') return openUnifiedReviewsModal();
  if (c === 'home') return (typeof act !== 'undefined' && act.home) ? act.home(true) : null;
  if (c === 'review-mark') return markTopicReviewed(selectedId);
  if (c === 'about') return setStatus(`BRANIAC · versão ${window.braniacVersion || 'desconhecida'}`);
  else if (c === 'open') { const p = await ipcRenderer.invoke('dialog:open'); if (p) await openPath(p); }
  else if (c === 'save-and-close') { if (await save(false)) ipcRenderer.send('close-now'); }
  else if (c === 'restore') restoreVersion();
  else if (c === 'save') save(false);
  else if (c === 'saveAs') save(true);
  else act[c]?.();
}
window.runMenuCommand = runMenuCommand;
