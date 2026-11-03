'use strict';
/* Ícones planos (traço, sem cor própria): herdam a cor do texto atual, então seguem o tema da interface
   (escuro, claro ou desenho). Usados pela lousa e pela barra flutuante do tópico. Carregado antes deles. */

const ICON = {
  pen: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
  highlighter: '<path d="M9 11l-5 5 3 3h4l7-7z"/><path d="M13 7l4 4"/><path d="M4 21h16"/>',
  eraser: '<path d="M7 19h10"/><path d="M5 14l8-8 6 6-5 5H9z"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>',
  prev: '<path d="M15 6l-6 6 6 6"/>',
  next: '<path d="M9 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  save: '<path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  maximize: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  snap: '<path d="M4 17l5-10 5 10 6-10"/>',
  line: '<path d="M5 19L19 5"/><circle cx="5" cy="19" r="1.6"/><circle cx="19" cy="5" r="1.6"/>',
  rect: '<rect x="4" y="5" width="16" height="14" rx="1.5"/>',
  ellipse: '<circle cx="12" cy="12" r="8"/>',
  child: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H14a4 4 0 0 1 4 4v5.5"/><path d="M6 8.5V18"/>',
  expand: '<path d="M6 9l6 6 6-6"/>',
  collapse: '<path d="M6 15l6-6 6 6"/>',
  note: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9.5 13h6M9.5 17h6"/>',
  spark: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/>',
  bin: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>',
};

/** Ícone plano em SVG. `name` precisa existir em ICON (nunca vem do usuário). */
const iconSvg = (name, size = 16) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;
