'use strict';
// Logomarca: três variantes (colorida, fundo escuro e monocromática) com caminhos inteiros e sem texto arbitrário.
const test = require('node:test');
const assert = require('node:assert');
const { logoSize, logoVariant, logoMarkup, luminance } = require('../core/components/logo');

test('tamanho da logo acompanha a linha do texto e mantém a proporção do desenho', () => {
  const s = logoSize(20);
  assert.strictEqual(s.h, 24);
  assert.ok(Math.abs(s.w / s.h - 475.764 / 363.682) < 0.05);
});

test('variante: monocromática no tema desenho; fundo escuro usa a versão clara; fundo claro usa a colorida', () => {
  assert.strictEqual(logoVariant({ fill: '#ffffff', mono: true }), 'mono');
  assert.strictEqual(logoVariant({ fill: '#1e63c6' }), 'dark');
  assert.strictEqual(logoVariant({ fill: '#ffffff' }), 'color');
  assert.ok(luminance('#000000') < luminance('#ffffff'));
});

test('marcação: 33 peças, cores válidas e cor monocromática só com hex válido', () => {
  const colorful = logoMarkup({ x: 0, y: 0, fontSize: 20, variant: 'color' });
  assert.strictEqual((colorful.match(/<path /g) || []).length, 33);
  const mono = logoMarkup({ x: 0, y: 0, fontSize: 20, variant: 'mono', color: '#112233' });
  assert.ok(mono.includes('fill="#112233"'));
  assert.strictEqual(logoMarkup({ x: 0, y: 0, fontSize: 20, variant: 'mono', color: 'red"><script>' }), '');
});
