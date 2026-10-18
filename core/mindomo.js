'use strict';
// Fidelidade ao formato do MINDOMO: traduz o tema do mapa (themes.json), o estilo de cada tópico (style + titleStyle) e as notas (description, em HTML)
// para o que o MindCraft sabe desenhar. As tabelas de formas e de estilos de preenchimento vêm do próprio código do Mindomo (NodeViewShapeType, FillStyle).
// Tudo que sai daqui é VALIDADO (cores #rrggbb, números em faixas, nomes de fonte seguros): vira atributo de SVG e nunca carrega texto arbitrário.
// O arquivo original NÃO é alterado: o que o MindCraft não entende continua guardado no `_mom` de cada tópico e no documento original.
const { sanitizeTheme, sanitizeStyle } = require('./themes');

const HEX6 = /^[0-9a-fA-F]{6}$/;
const hex = (v) => (typeof v === 'string' && HEX6.test(v.trim()) ? '#' + v.trim().toLowerCase() : null);
const num = (v) => { const n = typeof v === 'number' ? v : parseFloat(v); return Number.isFinite(n) ? n : null; };
const bool = (v) => (v === true || v === 'true' ? true : v === false || v === 'false' ? false : null);
const mix = (a, b) => '#' + [1, 3, 5].map((i) => Math.round((parseInt(a.slice(i, i + 2), 16) + parseInt(b.slice(i, i + 2), 16)) / 2).toString(16).padStart(2, '0')).join('');

// NodeViewShapeType do Mindomo → formas do MindCraft
const SHAPE = { 1: 'underline', 2: 'underline', 3: 'rect', 4: 'round', 5: 'round', 6: 'round', 7: 'ellipse', 8: 'ellipse', 9: 'pill', 10: 'ellipse', 11: 'rect', 12: 'round', 13: 'rect', 14: 'none' };
const shapeOf = (t) => { const n = num(t); return n === null ? null : (SHAPE[n] || 'round'); };

/** Preenchimento: "rrggbb" liso; "rrggbb,rrggbb" (degradê) vira a cor do meio; tipos 2 (transparente) e 9 (sem preenchimento) viram "none". */
function fillOf(type, value) {
  if (typeof value === 'string' && value) {
    const parts = value.split(',').map((p) => hex(p)).filter(Boolean);
    if (parts.length >= 2) return mix(parts[0], parts[parts.length - 1]);
    if (parts.length === 1) return parts[0];
  }
  const t = num(type);
  return t === 2 || t === 9 ? 'none' : null;
}

/** `<Font Color="…" Size="…" Name="…" Bold="…" Italic="…"/>` → { color, size, font, bold, italic } (só o que vier). */
function parseFont(s) {
  const out = {}; if (typeof s !== 'string') return out;
  const tag = /<Font\b([^>]*)\/?>/i.exec(s); if (!tag) return out;
  const attr = (n) => { const m = new RegExp('\\b' + n + '="([^"]*)"', 'i').exec(tag[1]); return m ? m[1] : null; };
  const c = hex(attr('Color')), z = num(attr('Size')), nm = attr('Name'), b = bool(attr('Bold')), i = bool(attr('Italic'));
  if (c) out.color = c; if (z !== null) out.size = Math.round(z); if (nm) out.font = nm; if (b !== null) out.bold = b; if (i !== null) out.italic = i;
  return out;
}
/** Negrito aplicado ao título INTEIRO (`<FontRange From="0" To="n" Bold="true">`); trechos parciais não são desenhados. */
function wholeTitleBold(titleStyle, title) {
  if (typeof titleStyle !== 'string') return null;
  const r = /<FontRange\b([^>]*)>/i.exec(titleStyle); if (!r) return null;
  const g = (n) => { const m = new RegExp('\\b' + n + '="([^"]*)"', 'i').exec(r[1]); return m ? m[1] : null; };
  const from = num(g('From')), to = num(g('To')), b = bool(g('Bold'));
  return from === 0 && to !== null && to >= String(title ?? '').length - 1 && b !== null ? b : null;
}

/** Campos de aparência que UM tópico declara (só o que o arquivo traz; o resto vem do tema do nível). */
function convertNodeStyle(style, titleStyle, title) {
  const s = style && typeof style === 'object' ? style : {}, o = {};
  const fill = fillOf(s.fill_type, s.fill_value); if (fill) o.fill = fill;
  const shape = shapeOf(s.shape_type); if (shape) o.shape = shape;
  const bc = hex(s.border_color); if (bc) o.stroke = bc;
  const bt = num(s.border_thickness); if (bt !== null) o.strokeWidth = Math.max(0, Math.min(10, bt));
  const ec = hex(s.line_fill_value); if (ec) o.edge = ec;
  const ew = num(s.line_width); if (ew !== null && ew > 0) o.edgeWidth = Math.min(12, ew);
  const f = parseFont(titleStyle); if (f.color) o.color = f.color; if (f.size) o.size = f.size; if (f.font) o.font = f.font; if (f.bold !== undefined) o.bold = f.bold; if (f.italic !== undefined) o.italic = f.italic;
  const wb = wholeTitleBold(titleStyle, title); if (wb !== null && o.bold === undefined) o.bold = wb;
  return sanitizeStyle(o);
}

/** Um nível do tema do Mindomo (nodeStyles[i]) → nível do tema do MindCraft. */
function levelOf(ns, i) {
  const s = (ns && ns.style) || {}, f = parseFont(ns && ns.font);
  const fillStyle = num(s.fill_style), bt = num(s.border_thickness) ?? 0, bc = hex(s.border_color);
  const lvl = {
    shape: shapeOf(s.shape_type) || 'round', fill: fillOf(s.fill_type, s.fill_value) || 'none',
    color: f.color || '#000000', size: f.size || (i === 0 ? 20 : 14), bold: f.bold === true, italic: f.italic === true,
    padX: Math.max(3, num(s.padding_left) ?? 8), padY: Math.max(2, num(s.padding_top) ?? 5),
  };
  if (bc && bt > 0 && fillStyle !== 18) { lvl.stroke = bc; lvl.strokeWidth = Math.min(10, bt); }
  const ec = hex(s.line_fill_value); if (ec) lvl.edge = ec;
  const ew = num(s.line_width); if (ew !== null && ew > 0) lvl.edgeWidth = Math.min(12, ew);
  if (f.font) lvl.font = f.font;
  return lvl;
}

/** themes.json[themeId] → tema do MindCraft (validado) ou null se não houver/for inválido. */
function convertTheme(themes, themeId, name) {
  const t = themes && typeof themes === 'object' && typeof themeId === 'string' ? themes[themeId] : null;
  if (!t || !Array.isArray(t.nodeStyles) || !t.nodeStyles.length) return null;
  const levels = t.nodeStyles.slice(0, 16).map(levelOf);
  const ms = t.mapStyle || {};
  const bg = num(ms.fillType) === 0 || ms.fillType === '0' ? hex(ms.fillValue) : null;
  const l1 = levels[1] || levels[0];
  const palette = ['#0073e6', '#00a896', '#f4a261', '#e76f51', '#8e6bd8', '#2a9d8f', '#d6336c'];
  return sanitizeTheme({
    name: `Original do Mindomo${name ? ' — ' + String(name).slice(0, 40) : ''}`, background: bg || '#ffffff',
    font: `${levels.map((l) => l.font).find(Boolean) || 'Segoe UI'}, Segoe UI, Roboto, Helvetica, Arial, sans-serif`,
    branches: [l1.edge, ...palette].filter(Boolean).slice(0, 8), levels,
    line: { width: levels.slice(1).map((l) => l.edgeWidth || 2), curve: 'bezier' },
  });
}

// ---------- notas: HTML do Mindomo (`description`) ⇄ Markdown do MindCraft ----------
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') { const c = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(c) && c > 0 && c < 0x110000 ? String.fromCodePoint(c) : ''; }
  return ENT[e.toLowerCase()] ?? m;
});
const wrap = (inner, mark) => { const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(inner); return m[2] ? m[1] + mark + m[2] + mark + m[3] : inner; };
/** HTML simples (p, br, strong/b, em/i, ul/ol/li, títulos) → Markdown em texto puro. Nunca devolve HTML. */
function htmlToMarkdown(html) {
  let s = String(html ?? '').slice(0, 400000);
  s = s.replace(/<\s*(script|style)\b[\s\S]*?<\/\s*\1\s*>/gi, '');
  s = s.replace(/<\s*(em|i)\b[^>]*>([\s\S]*?)<\/\s*\1\s*>/gi, (m, t, inner) => wrap(inner, '*'));
  s = s.replace(/<\s*(strong|b)\b[^>]*>([\s\S]*?)<\/\s*\1\s*>/gi, (m, t, inner) => wrap(inner, '**'));
  s = s.replace(/<\s*br\s*\/?>/gi, '\n').replace(/<\s*li\b[^>]*>/gi, '\n- ').replace(/<\/\s*li\s*>/gi, '').replace(/<\/\s*(p|div|ul|ol|h[1-6]|tr)\s*>/gi, '\n').replace(/<\s*(p|div|h[1-6])\b[^>]*>/gi, '\n');
  s = s.replace(/<[^>]*>/g, '');
  s = decode(s).replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/(\S)[ \t]{2,}(?=\S)/g, '$1 ').replace(/\n{3,}/g, '\n\n');
  return s.trim();
}
const escHtml = require('./text').escapeHtml;
/** Markdown simples → HTML do Mindomo (parágrafos, **negrito**, *itálico*), com TUDO escapado. */
function markdownToHtml(md) {
  const inline = (t) => escHtml(t).replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  return String(md ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p) => '<p>' + p.split('\n').map(inline).join('<br>') + '</p>').join('');
}

module.exports = { convertTheme, convertNodeStyle, htmlToMarkdown, markdownToHtml, parseFont, SHAPE };
