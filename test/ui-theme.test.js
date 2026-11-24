'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { contrast } = require('../core/components/contrast');
const { THEMES } = require('../core/components/themes');

const RENDERER = path.join(__dirname, '..', 'renderer');
const read = (file) => fs.readFileSync(path.join(RENDERER, file), 'utf8');

test('a interface oferece somente claro e escuro, sem acoplar o tema salvo no mapa', () => {
  const html = read('index.html');
  const options = [...html.matchAll(/<option value="(dark|light|draw|pixel)">/g)].map((match) => match[1]);
  assert.deepStrictEqual(options, ['dark', 'light']);
  assert.ok(!html.includes('pixel-theme.css'));
  assert.match(read('renderer.js'), /const UI_THEMES = \{\s*dark:/);
  assert.match(read('renderer.js'), /light: \{ label: 'Claro'/);
  assert.match(read('renderer.js'), /if \(v === 'draw'\) return 'light'/);
  assert.match(read('renderer.js'), /if \(v === 'pixel'\) return 'dark'/);
  assert.ok(THEMES.ocean && THEMES.paper && THEMES.draw, 'os temas próprios dos mapas continuam disponíveis');
});

test('os acentos dos dois modos mantêm contraste para texto de botão', () => {
  const css = read('apple.css');
  const darkAccent = css.match(/--accent:\s*(#[0-9a-f]{6})/i)[1];
  const lightAccent = css.match(/body\.light\s*\{[^}]*--accent:\s*(#[0-9a-f]{6})/s)[1];
  assert.ok(contrast('#ffffff', darkAccent) >= 4.5, 'texto branco legível no botão escuro');
  assert.ok(contrast('#ffffff', lightAccent) >= 4.5, 'texto branco legível no botão claro');
  assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'animação respeita a preferência do sistema');
});
