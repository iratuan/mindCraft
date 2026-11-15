'use strict';
/**
 * Temas visuais. Cada tema define fundo, fonte, paleta de ramos e estilo por nível.
 * shape: 'pill' | 'rect' | 'round' | 'underline'
 */
const THEMES = {
  ocean: {
    name: 'Oceano', background: '#f3f7ff', font: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    branches: ['#0073e6', '#00a896', '#f4a261', '#e76f51', '#8e6bd8', '#2a9d8f', '#d6336c'],
    levels: [
      { shape: 'round', fill: '#0b3d91', color: '#ffffff', size: 22, bold: true, padX: 22, padY: 12 },
      { shape: 'round', fill: 'branch', color: '#ffffff', size: 16, bold: true, padX: 14, padY: 8 },
      { shape: 'underline', fill: 'none', color: '#1c2b3a', size: 13, bold: false, padX: 8, padY: 5 },
    ],
    line: { width: [5, 3, 2], curve: 'bezier' },
  },
  dark: {
    name: 'Escuro', background: '#14161c', font: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    branches: ['#4cc9f0', '#f72585', '#b5e48c', '#ffd166', '#9b5de5', '#ff9f1c', '#06d6a0'],
    levels: [
      { shape: 'round', fill: '#262b38', color: '#ffffff', size: 22, bold: true, padX: 22, padY: 12, stroke: 'branch' },
      { shape: 'round', fill: '#1d212b', color: '#ffffff', size: 16, bold: true, padX: 14, padY: 8, stroke: 'branch' },
      { shape: 'underline', fill: 'none', color: '#d7dbe6', size: 13, bold: false, padX: 8, padY: 5 },
    ],
    line: { width: [5, 3, 2], curve: 'bezier' },
  },
  paper: {
    name: 'Papel', background: '#fbf8f1', font: 'Georgia, "Times New Roman", serif',
    branches: ['#6b4f3a', '#8c6d46', '#4f6d4f', '#7a4e5e', '#47637a', '#a0522d'],
    levels: [
      { shape: 'rect', fill: '#fffdf8', color: '#3b2d22', size: 22, bold: true, padX: 22, padY: 12, stroke: '#6b4f3a' },
      { shape: 'rect', fill: '#fffdf8', color: '#3b2d22', size: 16, bold: true, padX: 12, padY: 7, stroke: 'branch' },
      { shape: 'underline', fill: 'none', color: '#3b2d22', size: 13, bold: false, padX: 6, padY: 4 },
    ],
    line: { width: [3, 2, 1.5], curve: 'elbow' },
  },
  neon: {
    name: 'Neon', background: '#0a0612', font: '"Trebuchet MS", Verdana, sans-serif',
    branches: ['#00f5d4', '#fee440', '#f15bb5', '#9b5de5', '#00bbf9', '#ff6b35'],
    levels: [
      { shape: 'round', fill: '#1a1030', color: '#ffffff', size: 22, bold: true, padX: 24, padY: 12, stroke: '#00f5d4' },
      { shape: 'round', fill: '#150d26', color: '#ffffff', size: 16, bold: true, padX: 14, padY: 8, stroke: 'branch' },
      { shape: 'underline', fill: 'none', color: '#e9e2ff', size: 13, bold: false, padX: 8, padY: 5 },
    ],
    line: { width: [4, 3, 2], curve: 'bezier' },
  },
  // Desenho à mão: monocromático e flat (sem sombras nem gradientes). `sketch` faz o desenho tremer levemente, como traço de caneta.
  draw: {
    name: 'Desenho (à mão)', background: '#f4f4f4', font: 'Segoe Print, Comic Sans MS, cursive', sketch: true,
    branches: ['#111111', '#444444', '#666666'],
    levels: [
      { shape: 'ellipse', fill: '#ffffff', color: '#111111', size: 20, bold: true, padX: 22, padY: 12, stroke: '#111111', strokeWidth: 2 },
      { shape: 'rect', fill: '#ffffff', color: '#111111', size: 16, bold: false, padX: 14, padY: 8, stroke: '#111111', strokeWidth: 1.6 },
      { shape: 'underline', fill: 'none', color: '#111111', size: 14, bold: false, padX: 8, padY: 5 },
    ],
    line: { width: [2, 1.6, 1.2], curve: 'bezier' },
  },
  mono: {
    name: 'Monocromático (impressão)', background: '#ffffff', font: 'Arial, Helvetica, sans-serif',
    branches: ['#222222', '#555555', '#777777'],
    levels: [
      { shape: 'rect', fill: '#222222', color: '#ffffff', size: 22, bold: true, padX: 20, padY: 11 },
      { shape: 'rect', fill: '#ffffff', color: '#111111', size: 16, bold: true, padX: 12, padY: 7, stroke: '#222222' },
      { shape: 'underline', fill: 'none', color: '#111111', size: 13, bold: false, padX: 6, padY: 4 },
    ],
    line: { width: [3, 2, 1.5], curve: 'elbow' },
  },
};

const SHAPES = new Set(['pill', 'rect', 'round', 'underline', 'ellipse', 'none']);
const ALIGNS = new Set(['auto', 'left', 'center', 'right']);   // auto: para fora do centro (direita à esquerda, esquerda à direita); raiz: centro
const HEX = /^#[0-9a-fA-F]{6}$/;
const FONT_NAME = /^[A-Za-z0-9][A-Za-z0-9 _-]{0,39}$/;
const num = (v, lo, hi) => Number.isFinite(v) && v >= lo && v <= hi;
/**
 * Valida o estilo de um tópico vindo de arquivo ou de colagem. Só passa o que é conhecido e seguro:
 * estes valores vão parar em atributos de SVG, então nunca podem carregar texto arbitrário.
 */
function sanitizeStyle(s) {
  const o = {};
  if (!s || typeof s !== 'object') return o;
  if (typeof s.fill === 'string' && (HEX.test(s.fill) || s.fill === 'none')) o.fill = s.fill;
  if (typeof s.color === 'string' && HEX.test(s.color)) o.color = s.color;
  if (typeof s.shape === 'string' && SHAPES.has(s.shape)) o.shape = s.shape;
  if (typeof s.align === 'string' && ALIGNS.has(s.align)) o.align = s.align;
  if (Number.isFinite(s.size) && s.size >= 6 && s.size <= 96) o.size = s.size;
  if (typeof s.bold === 'boolean') o.bold = s.bold;
  if (typeof s.italic === 'boolean') o.italic = s.italic;
  // formatação vinda do Mindomo: borda, linha que liga ao pai e fonte
  if (typeof s.stroke === 'string' && HEX.test(s.stroke)) o.stroke = s.stroke;
  if (num(s.strokeWidth, 0, 10)) o.strokeWidth = s.strokeWidth;
  if (typeof s.edge === 'string' && HEX.test(s.edge)) o.edge = s.edge;
  if (num(s.edgeWidth, 0.5, 12)) o.edgeWidth = s.edgeWidth;
  if (typeof s.font === 'string' && FONT_NAME.test(s.font)) o.font = s.font;
  return o;
}

/** Valida um tema inteiro vindo de arquivo (tema original do Mindomo). Devolve um tema seguro ou null. */
function sanitizeTheme(t) {
  if (!t || typeof t !== 'object' || !Array.isArray(t.levels) || !t.levels.length) return null;
  const color = (v, d) => (typeof v === 'string' && HEX.test(v) ? v : d);
  const levels = t.levels.slice(0, 16).map((l) => {
    l = l && typeof l === 'object' ? l : {};
    const o = { shape: SHAPES.has(l.shape) ? l.shape : 'round', fill: l.fill === 'none' || l.fill === 'branch' || HEX.test(l.fill || '') ? l.fill : 'none',
      color: color(l.color, '#000000'), size: num(l.size, 6, 96) ? l.size : 14, bold: l.bold === true, padX: num(l.padX, 0, 60) ? l.padX : 8, padY: num(l.padY, 0, 40) ? l.padY : 5 };
    if (l.italic === true) o.italic = true;
    if (typeof l.stroke === 'string' && (HEX.test(l.stroke) || l.stroke === 'branch')) o.stroke = l.stroke;
    if (num(l.strokeWidth, 0, 10)) o.strokeWidth = l.strokeWidth;
    if (typeof l.edge === 'string' && HEX.test(l.edge)) o.edge = l.edge;
    if (num(l.edgeWidth, 0.5, 12)) o.edgeWidth = l.edgeWidth;
    if (typeof l.font === 'string' && FONT_NAME.test(l.font)) o.font = l.font;
    return o;
  });
  const branches = (Array.isArray(t.branches) ? t.branches : []).filter((c) => typeof c === 'string' && HEX.test(c)).slice(0, 12);
  const font = typeof t.font === 'string' && /^[A-Za-z0-9 ,"'_-]{1,160}$/.test(t.font) ? t.font : 'Segoe UI, Roboto, Helvetica, Arial, sans-serif';
  const widths = (t.line && Array.isArray(t.line.width) ? t.line.width : []).filter((w) => num(w, 0.5, 12)).slice(0, 16);
  return { name: String(t.name || 'Original').replace(/[<>&"]/g, '').slice(0, 80), background: color(t.background, '#ffffff'), font,
    branches: branches.length ? branches : ['#0073e6', '#00a896', '#f4a261', '#e76f51'], levels,
    line: { width: widths.length ? widths : [2], curve: t.line && (t.line.curve === 'elbow' || t.line.curve === 'bezier') ? t.line.curve : 'bezier' } };
}

/** `custom` = tema do próprio mapa (id 'custom', ex.: o original do Mindomo); sem ele, vale a tabela de temas. */
function getTheme(id, custom) {
  if (id === 'custom' && custom) { const t = sanitizeTheme(custom); if (t) return t; }
  return THEMES[id] || THEMES.ocean;
}

/** Estilo efetivo de um nível (níveis >2 herdam o último) já com overrides do nó aplicados. */
function resolveStyle(theme, level, branchColor, nodeStyle = {}) {
  const base = theme.levels[Math.min(level, theme.levels.length - 1)];
  const clean = sanitizeStyle(nodeStyle); // defesa em profundidade: nunca interpola valor não validado
  const s = { ...base, ...pick(clean, ['shape', 'align', 'color', 'size', 'bold', 'italic', 'edge', 'edgeWidth', 'font']) };
  const fill = clean.fill || base.fill;
  s.fill = fill === 'branch' ? branchColor : fill;
  s.stroke = clean.stroke || (base.stroke === 'branch' ? branchColor : base.stroke);
  s.strokeWidth = clean.strokeWidth !== undefined ? clean.strokeWidth : (base.strokeWidth !== undefined ? base.strokeWidth : 2);
  if (!(s.strokeWidth > 0)) s.stroke = undefined;
  s.branch = branchColor;
  return s;
}

function pick(o, keys) {
  const r = {};
  for (const k of keys) if (o[k] !== undefined) r[k] = o[k];
  return r;
}

/** Canvas escuro (tema Pixel): adapta um tema para ter contraste sobre o fundo escuro. */
function adaptThemeToCanvas(theme, canvas) {
  if (!canvas || !/^#[0-9a-fA-F]{6}$/.test(canvas)) return theme;
  const { onCanvas } = require('./contrast');
  // ramos clareados (contraste gráfico ≥ 3:1)
  const branches = theme.branches.map((c) => onCanvas(c, canvas, 3));
  // estilos de nível adaptados (fills e strokes)
  const levels = theme.levels.map((base) => {
    const level = { ...base };
    // fill vira mais claro se não for 'none' ou 'branch'
    if (level.fill && level.fill !== 'none' && level.fill !== 'branch') {
      level.fill = onCanvas(level.fill, canvas, 3);
    }
    // stroke vira mais claro
    if (level.stroke && level.stroke !== 'branch') {
      level.stroke = onCanvas(level.stroke, canvas, 3);
    }
    return level;
  });
  return { ...theme, branches, levels };
}

/** Adapta um estilo resolvido (de resolveStyle) para o canvas escuro. */
function adaptStyleToCanvas(style, canvas, branchColor) {
  if (!canvas || !/^#[0-9a-fA-F]{6}$/.test(canvas)) return style;
  const { onCanvas } = require('./contrast');
  const s = { ...style };
  // fill vira mais claro
  if (s.fill && s.fill !== 'none') {
    s.fill = onCanvas(s.fill, canvas, 3);
  }
  // stroke vira mais claro (menos rigoroso que texto: 3:1)
  if (s.stroke) {
    s.stroke = onCanvas(s.stroke, canvas, 3);
  }
  // branch/badge cor também vira mais claro
  if (s.branch) {
    s.branch = onCanvas(s.branch, canvas, 3);
  }
  return s;
}

module.exports = { THEMES, getTheme, resolveStyle, sanitizeStyle, sanitizeTheme, adaptThemeToCanvas, adaptStyleToCanvas };