'use strict';
/**
 * Edição de tópico no tablet: quando o teclado virtual abre (a área visível encolhe) com o campo de edição aberto, o mapa rola até o tópico
 * e o campo é reposicionado dentro da área que sobrou. Sem isto, um tópico na parte de baixo da tela ficava ATRÁS do teclado até a 1ª letra digitada.
 * Usa as mesmas funções da interface (reveal, fitEditor, editBase); não altera o comportamento do desktop.
 */
function install() {
  let timer = null;
  function refit() {
    const ed = document.getElementById('editor');
    if (!ed || ed.hidden || typeof selectedId === 'undefined' || !selectedId || typeof L === 'undefined') return;
    try {
      if (typeof reveal === 'function') reveal(selectedId, 90);                               // rola o mapa até o tópico caber na área visível
      const b = L.boxes.get(selectedId); if (!b) return;
      const w = Math.max(b.w * pan.k, 120);
      editBase = { cx: (b.x + b.w / 2) * pan.k + pan.x, top: b.y * pan.k + pan.y, minW: w, size: Math.max(12, b.style.size * pan.k), bold: !!b.style.bold };   // eslint-disable-line no-undef
      ed.style.top = editBase.top + 'px'; fitEditor();                                          // fitEditor mantém o campo dentro da área visível
    } catch { /* se a interface mudar, o campo continua usável (só não é reposicionado) */ }
  }
  const later = () => { clearTimeout(timer); timer = setTimeout(refit, 150); };
  window.addEventListener('resize', later);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', later);
  return { refit };
}
module.exports = { install };
