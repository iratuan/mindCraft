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
      { shape: 'pill', fill: '#0b3d91', color: '#ffffff', size: 22, bold: true, padX: 22, padY: 12 },
      { shape: 'round', fill: 'branch', color: '#ffffff', size: 16, bold: true, padX: 14, padY: 8 },
      { shape: 'underline', fill: 'none', color: '#1c2b3a', size: 13, bold: false, padX: 8, padY: 5 },
    ],
    line: { width: [5, 3, 2], curve: 'bezier' },
  },
  dark: {
    name: 'Escuro', background: '#14161c', font: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    branches: ['#4cc9f0', '#f72585', '#b5e48c', '#ffd166', '#9b5de5', '#ff9f1c', '#06d6a0'],
    levels: [
      { shape: 'pill', fill: '#262b38', color: '#ffffff', size: 22, bold: true, padX: 22, padY: 12, stroke: 'branch' },
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
      { shape: 'pill', fill: '#1a1030', color: '#ffffff', size: 22, bold: true, padX: 24, padY: 12, stroke: '#00f5d4' },
      { shape: 'pill', fill: '#150d26', color: '#ffffff', size: 16, bold: true, padX: 14, padY: 8, stroke: 'branch' },
      { shape: 'underline', fill: 'none', color: '#e9e2ff', size: 13, bold: false, padX: 8, padY: 5 },
    ],
    line: { width: [4, 3, 2], curve: 'bezier' },
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

function getTheme(id) {
  return THEMES[id] || THEMES.ocean;
}

const SHAPES = new Set(['pill', 'rect', 'round', 'underline']);
const HEX = /^#[0-9a-fA-F]{6}$/;
/**
 * Valida o estilo de um tópico vindo de arquivo ou de colagem. Só passa o que é conhecido e seguro:
 * estes valores vão parar em atributos de SVG, então nunca podem carregar texto arbitrário.
 */
function sanitizeStyle(s) {
  const o = {};
  if (!s || typeof s !== 'object') return o;
  if (typeof s.fill === 'string' && HEX.test(s.fill)) o.fill = s.fill;
  if (typeof s.color === 'string' && HEX.test(s.color)) o.color = s.color;
  if (typeof s.shape === 'string' && SHAPES.has(s.shape)) o.shape = s.shape;
  if (Number.isFinite(s.size) && s.size >= 6 && s.size <= 96) o.size = s.size;
  if (typeof s.bold === 'boolean') o.bold = s.bold;
  if (typeof s.italic === 'boolean') o.italic = s.italic;
  return o;
}

/** Estilo efetivo de um nível (níveis >2 herdam o último) já com overrides do nó aplicados. */
function resolveStyle(theme, level, branchColor, nodeStyle = {}) {
  const base = theme.levels[Math.min(level, theme.levels.length - 1)];
  const clean = sanitizeStyle(nodeStyle); // defesa em profundidade: nunca interpola valor não validado
  const s = { ...base, ...pick(clean, ['shape', 'color', 'size', 'bold', 'italic']) };
  const fill = clean.fill || base.fill;
  s.fill = fill === 'branch' ? branchColor : fill;
  s.stroke = base.stroke === 'branch' ? branchColor : base.stroke;
  s.branch = branchColor;
  return s;
}

function pick(o, keys) {
  const r = {};
  for (const k of keys) if (o[k] !== undefined) r[k] = o[k];
  return r;
}

module.exports = { THEMES, getTheme, resolveStyle, sanitizeStyle };
