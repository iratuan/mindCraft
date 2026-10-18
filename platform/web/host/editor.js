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
    if (!ed || ed.hidden || !window.MCView) return;
    try { window.MCView.refitEditor(); } catch { /* se a interface mudar, o campo continua usável (só não é reposicionado) */ }
  }
  const later = () => { clearTimeout(timer); timer = setTimeout(refit, 150); };
  window.addEventListener('resize', later);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', later);
  return { refit };
}
module.exports = { install };
