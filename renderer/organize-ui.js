'use strict';
/* Organizar o mapa: refaz a disposição dos tópicos (inclusive depois de inserir muitos filhos) e ajusta à tela.
   Usa as globais de renderer.js (map, render, fit, setStatus). Carregado depois de renderer.js. */

let handPan = false;   // ferramenta Mover a vista (barra lateral); o mousedown do mapa consulta este estado
act.handPan = () => { handPan = !handPan; document.body.classList.toggle('hand-pan', handPan); document.querySelectorAll('[data-act="handPan"]').forEach((b) => b.setAttribute('aria-pressed', String(handPan))); };
act.organize = () => organizeMap();

/** Organizar: refaz a disposição de TODOS os níveis do mapa (inclusive após inserir muitos filhos) e ajusta a vista à tela.
    Não recolhe nenhum ramo: o que estiver expandido continua visível; recolher é decisão do usuário (Níveis, setas). */
function organizeMap() {
  if (!map) return;
  let total = 0, depth = 0;
  map.walk((n, l) => { total++; depth = Math.max(depth, l); });
  render(); fit();
  setStatus(`Mapa organizado: ${total} tópicos em ${depth + 1} níveis, todos na disposição. Use Ctrl+0 para ajustar à tela.`);
}
