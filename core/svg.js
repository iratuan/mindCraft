'use strict';
const { layoutMap, edgePoints } = require('./layout');
const { MARKERS } = require('./markers');

const { escapeHtml: esc } = require('./text');
const REL_COLOR = '#e5484d';

function edgePath(e, curve) {
  const { a, b, dir } = edgePoints(e);
  if (curve === 'elbow') {
    const mx = a.x + (b.x - a.x) / 2;
    return `M${a.x},${a.y} L${mx},${a.y} L${mx},${b.y} L${b.x},${b.y}`;
  }
  const dx = Math.abs(b.x - a.x) * 0.5 * dir;
  return `M${a.x},${a.y} C${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}`;
}

/**
 * Desenha o miolo do mapa. Opções:
 *  selectedId / selectedRel — destaque; interactive — adiciona data-id/data-rel para o editor;
 *  hits — Set de ids achados na busca.
 */
function renderGroup(L, { selectedId, selectedIds, selectedRel, interactive, hits } = {}) {
  const { theme } = L;
  const out = [];

  for (const e of L.edges) {
    const w = e.to.style.edgeWidth || theme.line.width[Math.min(e.to.level - 1, theme.line.width.length - 1)];
    out.push(`<path d="${edgePath(e, theme.line.curve)}" fill="none" stroke="${e.to.style.edge || e.to.branch}" stroke-width="${w}" stroke-linecap="round"/>`);
  }

  for (const { rel, geo } of L.relations) {
    const col = /^#[0-9a-fA-F]{6}$/.test(rel.color || '') ? rel.color : REL_COLOR, sel = selectedRel === rel.id;
    const d = `M${geo.a.x},${geo.a.y} Q${geo.c.x},${geo.c.y} ${geo.b.x},${geo.b.y}`;
    const ar = geo.arrow.map((p) => `${p.x},${p.y}`).join(' ');
    out.push(`<g${interactive ? ` data-rel="${esc(rel.id)}" class="rel"` : ''}>`
      + (interactive ? `<path d="${d}" fill="none" stroke="transparent" stroke-width="14"/>` : '')
      + `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sel ? 3.5 : 2}" stroke-dasharray="7 5" stroke-linecap="round"/>`
      + `<polygon points="${ar}" fill="${col}"/>`
      + (rel.label ? `<text x="${geo.label.x}" y="${geo.label.y - 6}" text-anchor="middle" font-size="12" font-style="italic" fill="${col}" stroke="${theme.background}" stroke-width="4" paint-order="stroke">${esc(rel.label)}</text>` : '')
      + '</g>');
  }

  for (const b of L.boxes.values()) {
    const s = b.style, n = b.node;
    const tx = b.x + b.markerW + (b.w - b.markerW) / 2;
    let shape = '';
    if (s.shape === 'underline') {
      shape = `<line x1="${b.x}" y1="${b.y + b.h}" x2="${b.x + b.w}" y2="${b.y + b.h}" stroke="${s.stroke || b.branch}" stroke-width="${s.strokeWidth || 2}"/>`;
    } else if (s.shape === 'none') {
      shape = s.fill && s.fill !== 'none' ? `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${s.fill}"/>` : '';   // "sem forma" do Mindomo: só o texto (e um fundo, se houver)
    } else if (s.shape === 'ellipse') {
      shape = `<ellipse cx="${b.x + b.w / 2}" cy="${b.y + b.h / 2}" rx="${b.w / 2}" ry="${b.h / 2}" fill="${s.fill}"${s.stroke ? ` stroke="${s.stroke}" stroke-width="${s.strokeWidth}"` : ''}/>`;
    } else {
      const r = s.shape === 'pill' ? b.h / 2 : s.shape === 'round' ? 8 : 2;
      shape = `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${r}" fill="${s.fill}"${s.stroke ? ` stroke="${s.stroke}" stroke-width="${s.strokeWidth}"` : ''}/>`;
    }
    const startY = b.y + b.h / 2 - ((b.lines.length - 1) * b.lineHeight) / 2;
    const text = b.lines.map((l, i) =>
      `<text x="${tx}" y="${startY + i * b.lineHeight}" text-anchor="middle" dominant-baseline="central" fill="${s.color}" font-size="${s.size}"${s.font ? ` font-family="${esc(`'${s.font}', ${theme.font}`)}"` : ''} font-weight="${s.bold ? 700 : 400}"${s.italic ? ' font-style="italic"' : ''}>${esc(l)}</text>`).join('');

    const markers = b.markers.map((m, i) => {
      const d = b.markerD, cx = b.x + s.padX * 0.7 + d / 2 + i * (d + 4), cy = b.y + b.h / 2;
      return `<circle cx="${cx}" cy="${cy}" r="${d / 2}" fill="${MARKERS[m].color}"/><text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="${d * 0.62}" font-weight="700">${MARKERS[m].glyph}</text>`;
    }).join('');

    const progress = b.progress != null
      ? `<rect x="${b.x}" y="${b.y + b.h + 4}" width="${b.w}" height="4" rx="2" fill="#8a94a633"/><rect x="${b.x}" y="${b.y + b.h + 4}" width="${(b.w * b.progress) / 100}" height="4" rx="2" fill="${b.progressAuto ? '#4c9aff' : '#43a047'}"/>` : '';
    const due = b.due ? `<circle cx="${b.x - 2}" cy="${b.y - 2}" r="9" fill="#e5484d" stroke="${theme.background}" stroke-width="2"/><text x="${b.x - 2}" y="${b.y - 1.5}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="${b.due > 1 ? 10 : 11}" font-weight="700">${b.due > 1 ? b.due : '↻'}</text>` : '';

    const hit = hits && hits.has(b.id) ? `<rect x="${b.x - 6}" y="${b.y - 6}" width="${b.w + 12}" height="${b.h + 12}" rx="12" fill="#ffeb3b55" stroke="#fbc02d" stroke-width="2"/>` : '';
    const sel = (selectedIds ? selectedIds.has(b.id) : selectedId === b.id)
      ? `<rect x="${b.x - 4}" y="${b.y - 4}" width="${b.w + 8}" height="${b.h + 8}" rx="10" fill="none" stroke="#ff9800" stroke-width="2.5" stroke-dasharray="5 3"/>` : '';
    const fx = b.side > 0 ? b.x + b.w + 10 : b.x - 10;
    const fold = n.children.length && n.collapsed
      ? `<circle cx="${fx}" cy="${b.y + b.h / 2}" r="9" fill="${b.branch}"/><text x="${fx}" y="${b.y + b.h / 2}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="11" font-weight="700">${n.children.length}</text>` : '';
    const note = n.notes ? `<g class="note-icon" transform="translate(${b.x + b.w - 8} ${b.y - 13})"><rect width="9" height="11" rx="1.7" fill="${theme.background}" stroke="${s.branch}" stroke-width="1.3"/><path d="M2.3 3.5h4.4M2.3 5.6h4.4M2.3 7.7h2.7" stroke="${s.branch}" stroke-width="1" stroke-linecap="round" fill="none"/></g>` : '';
    out.push(`<g${interactive ? ` data-id="${esc(b.id)}" class="node"` : ''}>${hit}${shape}<g pointer-events="none">${progress}${markers}${text}${sel}${fold}${note}${due}</g>${interactive ? `<rect class="hitarea" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="transparent" pointer-events="all"/>` : ''}</g>`);
  }
  return out.join('\n');
}

/** SVG completo e autônomo (usa o mesmo desenho do editor). */
function toSVG(map, opts = {}) {
  const L = layoutMap(map, opts);
  const { x, y, w, h } = L.bounds;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(w)}" height="${Math.ceil(h)}" viewBox="${x} ${y} ${w} ${h}" font-family="${esc(L.theme.font)}">\n<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${L.theme.background}"/>\n${renderGroup(L)}\n</svg>`;
}

module.exports = { toSVG, renderGroup };
