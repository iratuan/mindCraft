'use strict';
// Tema "Pixel (8 bits)" da interface: registrado no seletor, com folha de estilo ligada na página e fonte local
// (o app roda offline, então a fonte não pode vir da internet). Confere os arquivos reais, não um dublê.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const RENDERER = path.join(__dirname, '..', 'renderer');
const read = (f) => fs.readFileSync(path.join(RENDERER, f), 'utf8');

test('o tema pixel aparece no seletor e na lista de temas da interface', () => {
  assert.ok(read('index.html').includes('<option value="pixel">Pixel (8 bits)</option>'));
  assert.ok(/pixel:\s*\{\s*label:\s*'Pixel \(8 bits\)'/.test(read('renderer.js')));
  assert.ok(read('renderer.js').includes("document.body.classList.toggle('ui-pixel', name === 'pixel')"));
});

test('a folha do tema está ligada na página e define a classe ui-pixel', () => {
  assert.ok(read('index.html').includes('<link rel="stylesheet" href="pixel-theme.css">'));
  assert.ok(read('pixel-theme.css').includes('body.ui-pixel'));
});

test('a fonte pixel é um TTF local com licença OFL (sem download em tempo de execução)', () => {
  const ttf = fs.readFileSync(path.join(RENDERER, 'assets', 'fonts', 'PressStart2P-Regular.ttf'));
  assert.deepStrictEqual([...ttf.subarray(0, 4)], [0x00, 0x01, 0x00, 0x00]);   // cabeçalho TrueType
  assert.ok(read('pixel-theme.css').includes('url("assets/fonts/PressStart2P-Regular.ttf")'));
  assert.ok(fs.readFileSync(path.join(RENDERER, 'assets', 'fonts', 'PressStart2P-OFL.txt'), 'utf8').includes('SIL OPEN FONT LICENSE'));
});

test('a logomarca preta fica clara no tema escuro, mas não no desenho à mão (fundo branco)', () => {
  const css = read('style.css');
  assert.ok(css.includes('body:not(.light):not(.ui-draw) .brand img'));
  assert.ok(css.includes('filter: invert(1)'));
});
