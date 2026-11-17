'use strict';
/** Marcadores vetoriais (círculo colorido + glifo): iguais na tela, no SVG e no PDF, sem depender de fonte emoji. */
const MARKERS = {
  p1: { glyph: '1', color: '#e53935', label: 'Prioridade 1' },
  p2: { glyph: '2', color: '#fb8c00', label: 'Prioridade 2' },
  p3: { glyph: '3', color: '#43a047', label: 'Prioridade 3' },
  ok: { glyph: '✓', color: '#2e9e5b', label: 'Concluído' },
  warn: { glyph: '!', color: '#d81b60', label: 'Atenção' },
  ask: { glyph: '?', color: '#1e88e5', label: 'Dúvida' },
  star: { glyph: '★', color: '#f5a623', label: 'Favorito' },
  flag: { glyph: '⚑', color: '#8e24aa', label: 'Bandeira' },
  idea: { glyph: '✦', color: '#00acc1', label: 'Ideia' },
};

/** Sufixo textual (Markdown/Word): progresso e marcadores como glifos. */
function tagText(node) {
  const parts = [];
  if (node.progress != null) parts.push(`${node.progress}%`);
  for (const m of node.markers || []) if (MARKERS[m]) parts.push(MARKERS[m].glyph);
  return parts.length ? ` (${parts.join(' ')})` : '';
}

module.exports = { MARKERS, tagText };
