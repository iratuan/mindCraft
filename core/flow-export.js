'use strict';
/**
 * Fluxograma em Markdown e HTML (material para ler, imprimir e levar a outros apps).
 * Passos numerados pela sequência (1, 1.1, 1.2…), com tipo, ramo, notas, para onde segue (inclusive setas extras),
 * a lista de todos os caminhos possíveis do início ao fim e os pontos de atenção da validação.
 * O HTML traz também o diagrama em SVG (mesmas formas da tela). Tudo que é do usuário passa por escape.
 * Regras puras: nada aqui executa código.
 */
const { findStarts, successors, validateFlow, listPaths, typeOf, FLOW_LABELS } = require('./flow');
const { layoutFlow } = require('./flow-layout');
const { escapeHtml: esc } = require('./text');
const { printCss } = require('./print-style');

/**
 * Markdown de um fluxo. opts.notes (padrão true) inclui as notas dos passos. opts.generated: Map(id → parágrafos da IA)
 * para passos sem nota (entram marcados como gerados pela IA, para revisão).
 */
function toFlowMarkdown(map, opts = {}) {
  const withNotes = opts.notes !== false;
  const generated = opts.generated || new Map();
  const titleOf = new Map();
  map.walk((n) => titleOf.set(n.id, n.title || 'Sem título'));
  const out = [];

  const starts = findStarts(map);
  const { paths, truncated } = listPaths(map);
  out.push(`# ${map.meta.name || map.root.title}`, '', `Fluxograma · ${titleOf.size} passo(s) · ${paths.length}${truncated ? '+' : ''} caminho(s)`, '');

  // passos, na ordem da sequência (um ramo depois do outro)
  out.push('## Passos', '');
  const visit = (n, num, depth) => {
    const head = `${'#'.repeat(Math.min(depth + 2, 6))} ${num} ${n.title || 'Sem título'} · ${FLOW_LABELS[typeOf(n)]}`;
    out.push(head, '');
    if (n.branchLabel) out.push(`*Ramo: ${n.branchLabel}*`, '');
    if (withNotes && (n.notes || '').trim()) out.push(n.notes.trim(), '');
    else if (withNotes && generated.get(n.id)) { out.push('*Texto de revisão gerado pela IA (revise antes de usar):*', ''); for (const p of generated.get(n.id)) out.push(p, ''); }
    n.children.forEach((c, i) => visit(c, `${num}.${i + 1}`, depth + 1));
  };
  for (const s of starts) visit(s, '1', 0);

  // ligações: para onde cada passo segue, com rótulo e setas extras
  const links = [];
  map.walk((n) => {
    for (const e of successors(map, n.id)) {
      const to = titleOf.get(e.to) || '(passo removido)';
      const via = e.label ? ` (${e.label})` : '';
      links.push(`- **${titleOf.get(n.id)}** → ${to}${via}${e.kind === 'rel' ? ' — seta extra' : ''}`);
    }
  });
  if (links.length) out.push('## Ligações', '', ...links, '');

  // caminhos possíveis
  out.push('## Caminhos possíveis', '');
  if (!paths.length) out.push('Nenhum caminho do início ao fim. Veja os pontos de atenção.', '');
  paths.forEach((p, i) => {
    const parts = p.map((step, k) => {
      const name = titleOf.get(step.id) || '(passo removido)';
      if (k === 0) return name;
      const via = step.via ? `—(${step.via})→` : '→';
      return `${via} ${name}${step.loopTo ? ' ↺' : ''}`;
    });
    out.push(`${i + 1}. ${parts.join(' ')}`);
  });
  if (truncated) out.push('', `_Lista cortada: o fluxo tem mais caminhos do que o limite de ${paths.length}._`);
  out.push('');

  // pontos de atenção
  const warn = validateFlow(map);
  if (warn.length) {
    out.push('## Pontos de atenção', '');
    for (const w of warn) out.push(`- ${w.level === 'error' ? 'Erro' : 'Aviso'}: ${w.message}`);
    out.push('');
  }
  return out.join('\n');
}

const SHAPE_FILL = { start: ['#2e7d4f', '#ffffff'], end: ['#2e7d4f', '#ffffff'], decision: ['#fff1c2', '#3a2a00'], step: ['#ffffff', '#1c1c1c'] };

/** SVG do diagrama: as mesmas formas e setas da tela, em cores fixas para impressão. */
function diagramSvg(map) {
  const L = layoutFlow(map);
  const b = L.bounds, pad = 20, shapes = [];
  for (const e of L.edges) {
    const a = L.boxes.get(e.from), c = L.boxes.get(e.to);
    const x1 = a.x + a.w / 2, y1 = a.y + a.h, x2 = c.x + c.w / 2, y2 = c.y, my = (y1 + y2) / 2;
    shapes.push(`<path d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}" fill="none" stroke="#555" stroke-width="1.6" marker-end="url(#fa)"/>`);
    if (e.label) shapes.push(`<text x="${(x1 + x2) / 2}" y="${my}" font-size="12" text-anchor="middle" dominant-baseline="central" fill="#222">${esc(e.label)}</text>`);
  }
  for (const r of L.relations) {
    const a = L.boxes.get(r.from), c = L.boxes.get(r.to);
    const x1 = a.x + a.w, y1 = a.y + a.h / 2, x2 = c.x + c.w, y2 = c.y + c.h / 2, cx = Math.max(x1, x2) + 90;
    shapes.push(`<path d="M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}" fill="none" stroke="#1e63c6" stroke-width="1.5" stroke-dasharray="6 4" marker-end="url(#fa)"/>`);
    if (r.label) shapes.push(`<text x="${cx - 4}" y="${(y1 + y2) / 2}" font-size="12" text-anchor="middle" fill="#1e63c6">${esc(r.label)}</text>`);
  }
  for (const bx of L.boxes.values()) {
    const cx = bx.x + bx.w / 2, cy = bx.y + bx.h / 2, [fill, ink] = SHAPE_FILL[bx.type] || SHAPE_FILL.step;
    const pill = bx.type === 'start' || bx.type === 'end';
    const stroke = pill ? '#2e7d4f' : '#666';
    shapes.push(bx.type === 'decision'
      ? `<polygon points="${cx},${bx.y} ${bx.x + bx.w},${cy} ${cx},${bx.y + bx.h} ${bx.x},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`
      : `<rect x="${bx.x}" y="${bx.y}" width="${bx.w}" height="${bx.h}" rx="${pill ? bx.h / 2 : 10}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`);
    const top = cy - ((bx.lines.length - 1) * bx.lineHeight) / 2;
    bx.lines.forEach((l, i) => shapes.push(`<text x="${cx}" y="${top + i * bx.lineHeight}" font-size="13" text-anchor="middle" dominant-baseline="central" fill="${ink}">${esc(l)}</text>`));
  }
  return `<svg class="diagram" viewBox="${b.x - pad} ${b.y - pad} ${b.w + pad * 2} ${b.h + pad * 2}" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">`
    + `<defs><marker id="fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker></defs>${shapes.join('')}</svg>`;
}

/** HTML para impressão (A4): diagrama, passos com notas (duas colunas), caminhos e avisos. */
function toFlowHtml(map, opts = {}) {
  const withNotes = opts.notes !== false;
  const generated = opts.generated || new Map();
  const names = new Map(); map.walk((n) => names.set(n.id, n.title || 'Sem título'));
  const items = [];
  const visit = (n, num, depth) => {
    const body = [];
    if (n.branchLabel) body.push(`<p class="meta">Ramo: ${esc(n.branchLabel)}</p>`);
    if (withNotes && (n.notes || '').trim()) body.push(`<div class="notes">${esc(n.notes.trim()).replace(/\n/g, '<br>')}</div>`);
    else if (withNotes && generated.get(n.id)) body.push(`<div class="notes ai"><p class="ai-note">Texto de revisão gerado pela IA (revise antes de usar)</p>${generated.get(n.id).map((p) => `<p>${esc(p)}</p>`).join('')}</div>`);
    items.push(`<section class="step d${Math.min(depth, 5)}"><h3><span class="num">${esc(num)}</span> ${esc(n.title || 'Sem título')} <small>${esc(FLOW_LABELS[typeOf(n)])}</small></h3>${body.join('')}</section>`);
    n.children.forEach((c, i) => visit(c, `${num}.${i + 1}`, depth + 1));
  };
  for (const st of findStarts(map)) visit(st, '1', 0);
  const { paths, truncated } = listPaths(map);
  const pathItems = paths.map((p) => `<li>${esc(p.map((s, k) => (k === 0 ? (names.get(s.id) || '') : `${s.via ? `—(${s.via})→` : '→'} ${names.get(s.id) || ''}${s.loopTo ? ' ↺' : ''}`)).join(' '))}</li>`).join('');
  const warn = validateFlow(map);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(map.meta.name || map.root.title)}</title><style>${printCss(`
    .diagram { width: 100%; height: auto; max-height: 200mm; break-inside: avoid; }
    .step { margin: 0 0 2mm; }
    h3 small { color: #666; font-weight: normal; font-size: 8.5pt; }
    .paths { font-size: 9pt; } .warn { font-size: 9pt; color: #6a4b00; }
`)}</style></head><body>
    <h1>${esc(map.meta.name || map.root.title)}</h1><p class="sub">Fluxograma · ${names.size} passo(s) · ${paths.length}${truncated ? '+' : ''} caminho(s)</p>
    <h2>Diagrama</h2>${diagramSvg(map)}
    <h2>Passos</h2><div class="cols">${items.join('')}</div>
    <h2>Caminhos possíveis</h2><ol class="paths">${pathItems || '<li>Nenhum caminho do início ao fim.</li>'}</ol>
    ${truncated ? `<p class="warn">Lista cortada: o fluxo tem mais caminhos do que o limite de ${paths.length}.</p>` : ''}
    ${warn.length ? `<h2>Pontos de atenção</h2><ul class="warn">${warn.map((w) => `<li>${w.level === 'error' ? 'Erro' : 'Aviso'}: ${esc(w.message)}</li>`).join('')}</ul>` : ''}
  </body></html>`;
}

module.exports = { toFlowMarkdown, toFlowHtml };
