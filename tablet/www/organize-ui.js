'use strict';
/* Organizar o mapa: refaz a disposição dos tópicos (inclusive depois de inserir muitos filhos) e ajusta à tela.
   Usa as globais de renderer.js (map, render, fit, change, setStatus) e AUTO_ORGANIZE_LIMIT. Carregado depois de renderer.js. */

let handPan = false;   // ferramenta Mover a vista (barra lateral); o mousedown do mapa consulta este estado
act.handPan = () => { handPan = !handPan; document.body.classList.toggle('hand-pan', handPan); document.querySelectorAll('[data-act="handPan"]').forEach((b) => b.setAttribute('aria-pressed', String(handPan))); };
act.organize = () => organizeMap();

/** Organizar: refaz a disposição dos tópicos (inclusive após inserir muitos filhos) e ajusta o mapa à tela. É desfazível. */
function organizeMap() {
  if (!map) return;
  const visible = (n) => 1 + (n.collapsed ? 0 : n.children.reduce((s, c) => s + visible(c), 0));
  let level = false;
  if (visible(map.root) > AUTO_ORGANIZE_LIMIT) level = change(() => map.autoLevels(AUTO_ORGANIZE_LIMIT) || false);
  render(); fit();
  setStatus(level ? `Mapa organizado: ramos mais profundos recolhidos (nível ${level}). Ctrl+Z desfaz.` : 'Mapa organizado: disposição refeita e vista ajustada.');
}
