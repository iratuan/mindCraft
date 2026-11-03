'use strict';
/**
 * Estilo de impressão dos materiais (estudo e fluxograma): uma escala de tamanhos só, uma família de fonte só,
 * peso do título pela prioridade e notas com a mesma tipografia do texto (sem caixa e sem títulos grandes).
 * Pensado para A4 em tinta: cinzas, sem fundos fortes. Os materiais acrescentam só o que é próprio deles.
 */

// escala (pt): texto 10 · notas 9,5 · metadados 8,5 · títulos 18 / 12,5 / 11 / 10
const BASE = `
    @page { size: A4; margin: 15mm 14mm; }
    * { box-sizing: border-box; }
    body { font-family: "Segoe UI", Arial, Helvetica, sans-serif; color: #161616; font-size: 10pt; line-height: 1.35; margin: 0; }
    h1 { font-size: 18pt; font-weight: 700; margin: 0 0 1mm; line-height: 1.2; }
    h2 { font-size: 12.5pt; font-weight: 700; margin: 5mm 0 2mm; padding-bottom: 1mm; border-bottom: 0.6pt solid #999; break-after: avoid; }
    h3 { font-size: 11pt; font-weight: 600; margin: 3mm 0 1mm; break-after: avoid; line-height: 1.25; }
    h4, h5, h6 { font-size: 10pt; font-weight: 600; margin: 2mm 0 1mm; break-after: avoid; }
    .sub { color: #555; font-size: 9pt; margin: 0 0 4mm; }
    .num { color: #555; font-weight: 600; margin-right: 1.2mm; }
    /* peso do título pela prioridade do passo/tópico: p1 é o mais pesado */
    .w3 > h2, .w3 > h3, .w3 > h4 { font-weight: 700; }
    .w2 > h2, .w2 > h3, .w2 > h4 { font-weight: 600; }
    .w1 > h2, .w1 > h3, .w1 > h4 { font-weight: 500; }
    .pri { color: #fff; font-size: 7.5pt; font-weight: 700; padding: 0.3mm 1.6mm; border-radius: 2mm; vertical-align: middle; margin-left: 1.5mm; }
    .meta { color: #555; font-size: 8.5pt; margin: 0 0 0.5mm; }
    .src { font-size: 8.5pt; color: #333; font-style: italic; margin: 0.8mm 0; }
    .links { font-size: 9pt; margin: 0.8mm 0; padding-left: 4mm; }
    .links li { margin: 0; }
    /* notas: mesma tipografia do texto, recuo pela borda da esquerda (sem caixa colorida) */
    .notes { font-size: 9.5pt; border-left: 1.2pt solid #bbb; padding: 0 0 0 2.5mm; margin: 1mm 0 2mm; }
    .notes p { margin: 0 0 1.5mm; }
    .notes h1, .notes h2, .notes h3, .notes h4, .notes h5, .notes h6 { font-size: 9.5pt; font-weight: 700; margin: 1.5mm 0 0.5mm; border: 0; padding: 0; break-after: avoid; }
    .notes ul, .notes ol { margin: 0 0 1.5mm 4mm; padding: 0; }
    .notes li { margin: 0 0 0.5mm; }
    .notes blockquote { margin: 1mm 0; padding-left: 2mm; border-left: 1pt solid #aaa; color: #333; }
    .notes table { border-collapse: collapse; font-size: 9pt; margin: 1mm 0; }
    .notes th, .notes td { border: 0.5pt solid #bbb; padding: 0.5mm 1.5mm; text-align: left; }
    .notes img { max-width: 100%; height: auto; }
    .notes.ai { border-left-color: #1e63c6; }
    .ai-note { font-size: 8.5pt; color: #1e63c6; font-style: italic; margin: 0 0 1mm; }
    code, .notes code { font-family: Consolas, "Courier New", monospace; font-size: 8.5pt; }
    .cols { column-count: 2; column-gap: 8mm; column-fill: auto; }
    .step, .topic { break-inside: avoid-column; }
`;

/** CSS completo: a base comum mais o que é próprio do material (passado em `extra`). */
function printCss(extra = '') {
  return BASE + extra;
}

/** Classe de peso para a prioridade (p1 → w3, p2 → w2, p3 → w1, sem prioridade → w0). */
const weightClass = (priority) => ({ p1: 'w3', p2: 'w2', p3: 'w1' }[priority] || 'w0');

module.exports = { printCss, weightClass };
