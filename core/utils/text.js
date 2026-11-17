'use strict';
// Utilitários de TEXTO compartilhados (sem dependências). Existe para ter UM lugar auditado para o que é sensível à segurança:
// tudo que vira HTML/SVG a partir de texto do usuário (títulos, notas, rótulos) passa por `escapeHtml`.

const HTML_ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapa & < > " ' — seguro para conteúdo de elemento E para valor de atributo entre aspas simples ou duplas. */
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => HTML_ESC[c]);
}

module.exports = { escapeHtml };
