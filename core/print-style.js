'use strict';
/**
 * Estilo de impressão dos materiais (estudo e fluxograma): uma escala de tamanhos só, uma família de fonte só,
 * peso do título pela prioridade e notas com a mesma tipografia do texto (sem caixa e sem títulos grandes).
 * Pensado para A4 em tinta: cinzas, sem fundos fortes. Os materiais acrescentam só o que é próprio deles.
 */

// Escala única (pt), três tamanhos apenas: títulos (16 / 12 / 10,5), texto (10) e secundário (9, inclusive
// notas, listas, tabelas, código, fontes e metadados). Sem tamanhos soltos: o documento fica uniforme.
// Recuo: uma única margem fixa para notas e listas; nada se acumula por nível (sem "escada" de tabulação).
const BASE = `
    @page { size: A4; margin: 15mm 14mm; }
    * { box-sizing: border-box; }
    body { font-family: "Segoe UI", Arial, Helvetica, sans-serif; color: #161616; font-size: 10pt; line-height: 1.35; margin: 0; }
    h1 { font-size: 16pt; font-weight: 700; margin: 0 0 1mm; line-height: 1.2; }
    h2 { font-size: 12pt; font-weight: 700; margin: 4mm 0 1.5mm; padding-bottom: 0.8mm; border-bottom: 0.6pt solid #999; break-after: avoid; }
    h3 { font-size: 10.5pt; font-weight: 600; margin: 2.5mm 0 0.8mm; break-after: avoid; line-height: 1.25; }
    h4, h5, h6 { font-size: 10pt; font-weight: 600; margin: 2mm 0 0.6mm; break-after: avoid; }
    .sub { color: #555; font-size: 9pt; margin: 0 0 3mm; }
    .num { color: #555; font-weight: 600; margin-right: 1mm; }
    /* peso do título pela prioridade do passo/tópico: p1 é o mais pesado */
    .w3 > h2, .w3 > h3, .w3 > h4 { font-weight: 700; }
    .w2 > h2, .w2 > h3, .w2 > h4 { font-weight: 600; }
    .w1 > h2, .w1 > h3, .w1 > h4 { font-weight: 500; }
    .pri { color: #fff; font-size: 9pt; font-weight: 700; padding: 0 1.5mm; border-radius: 2mm; vertical-align: 0.1mm; margin-left: 1mm; }
    .meta, .src, .links, .ai-note, code, .notes, .notes table { font-size: 9pt; }
    .meta { color: #555; margin: 0 0 0.4mm; }
    .src { color: #333; font-style: italic; margin: 0.6mm 0; }
    .links { margin: 0.6mm 0; padding-left: 4mm; }
    .links li { margin: 0; }
    /* notas: texto de 9 pt, recuo fixo pela borda da esquerda (sem caixa colorida) */
    .notes { border-left: 1pt solid #bbb; padding: 0 0 0 2.5mm; margin: 0.8mm 0 1.6mm; }
    .notes p { margin: 0 0 1.2mm; }
    .notes h1, .notes h2, .notes h3, .notes h4, .notes h5, .notes h6 { font-size: 9pt; font-weight: 700; margin: 1mm 0 0.4mm; border: 0; padding: 0; break-after: avoid; }
    /* listas: um recuo só, e os níveis seguintes não empurram mais o texto (evita a escada de tabulação) */
    .notes ul, .notes ol { margin: 0 0 1mm; padding-left: 4mm; }
    .notes ul ul, .notes ul ol, .notes ol ul, .notes ol ol { margin: 0; padding-left: 2.5mm; }
    .notes ul ul ul, .notes ul ol ol, .notes ol ul ul, .notes ol ol ol { padding-left: 0; }
    .notes li { margin: 0 0 0.4mm; }
    .notes blockquote { margin: 0.8mm 0; padding-left: 2mm; border-left: 0.8pt solid #aaa; color: #333; }
    .notes table { border-collapse: collapse; margin: 0.8mm 0; }
    .notes th, .notes td { border: 0.5pt solid #bbb; padding: 0.4mm 1.2mm; text-align: left; }
    .notes pre { margin: 0.8mm 0; white-space: pre-wrap; word-break: break-word; }
    .notes img { max-width: 100%; height: auto; }
    .notes.ai { border-left-color: #1e63c6; }
    .ai-note { color: #1e63c6; font-style: italic; margin: 0 0 0.8mm; }
    code, .notes code { font-family: Consolas, "Courier New", monospace; }
    .cols { column-count: 2; column-gap: 7mm; column-fill: auto; }
    .step, .topic { break-inside: avoid-column; }
`;

/** CSS completo: a base comum mais o que é próprio do material (passado em `extra`). */
function printCss(extra = '') {
  return BASE + extra;
}

/** Classe de peso para a prioridade (p1 → w3, p2 → w2, p3 → w1, sem prioridade → w0). */
const weightClass = (priority) => ({ p1: 'w3', p2: 'w2', p3: 'w1' }[priority] || 'w0');

module.exports = { printCss, weightClass };
