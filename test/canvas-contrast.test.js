'use strict';
// Canvas escuro (tema Pixel): com a opção canvas, o texto sem caixa e os ramos de todo tema de mapa precisam de contraste
// sobre o fundo escuro. Sem a opção, a saída fica como antes (exportação e demais temas não mudam).
const test = require('node:test');
const assert = require('node:assert');
const { THEMES } = require('../core/themes');
const { MindMap, createNode } = require('../core/model');
const { layoutMap } = require('../core/layout');
const { renderGroup } = require('../core/svg');

const CANVAS = '#1c1f26';

function lum(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(a, b) {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// mapa com 3 níveis: o nível 3 (texto sem caixa no Oceano, Papel, Desenho e Monocromático) é o que mais precisa de ajuste
function sampleMap(theme) {
  const m = new MindMap(createNode('Ideia central'));
  const a = m.addChild(m.root.id, 'Primeiro');
  const b = m.addChild(a.id, 'Filho');
  m.addChild(b.id, 'Neto');
  m.addChild(m.root.id, 'Segundo');
  m.meta.theme = theme;
  return m;
}

// cor do texto de um rótulo no SVG
function textFill(svg, label) {
  const re = new RegExp(`<text[^>]*fill="(#[0-9a-fA-F]{6})"[^>]*>${label}</text>`);
  const m = svg.match(re);
  assert.ok(m, `rótulo "${label}" não encontrado no SVG`);
  return m[1];
}

// cores dos ramos (caminhos de ligação) no SVG
function edgeStrokes(svg) {
  return [...svg.matchAll(/<path d="[^"]*" fill="none" stroke="(#[0-9a-fA-F]{6})" stroke-width="[\d.]+" stroke-linecap="round"\/>/g)].map((m) => m[1]);
}

for (const theme of Object.keys(THEMES)) {
  test(`${theme}: com canvas escuro, texto do nível 3 tem contraste ≥ 4,5:1`, () => {
    const L = layoutMap(sampleMap(theme), { canvas: CANVAS });
    const svg = renderGroup(L, { interactive: false, canvas: CANVAS });
    const fill = textFill(svg, 'Neto');
    const style = THEMES[theme].levels[2];
    if (style.fill === 'none' || style.fill === undefined) {
      assert.ok(contrast(fill, CANVAS) >= 4.5, `${theme}: texto ${fill} tem ${contrast(fill, CANVAS).toFixed(2)}:1 sobre o canvas`);
      assert.strictEqual(fill, '#ffffff', theme + ': texto sem moldura sobre o canvas escuro deve ser branco');
    }
  });

  test(`${theme}: com canvas escuro, todos os ramos têm contraste ≥ 3:1`, () => {
    const L = layoutMap(sampleMap(theme), { canvas: CANVAS });
    const svg = renderGroup(L, { interactive: false, canvas: CANVAS });
    const strokes = edgeStrokes(svg);
    assert.ok(strokes.length >= 3, 'deveria haver ramos no SVG');
    for (const c of strokes) assert.ok(contrast(c, CANVAS) >= 3, `${theme}: ramo ${c} tem ${contrast(c, CANVAS).toFixed(2)}:1`);
  });

  test(`${theme}: sem a opção canvas, as cores do tema saem inalteradas`, () => {
    const L = layoutMap(sampleMap(theme));  // sem canvas no layout
    const svg = renderGroup(L, { interactive: false });  // sem canvas no render
    const ramos = THEMES[theme].branches.map((x) => x.toLowerCase());
    for (const c of edgeStrokes(svg)) assert.ok(ramos.includes(c.toLowerCase()), 'ramo fora da paleta do tema: ' + c);
    const direct = renderGroup(L, { interactive: false, canvas: null });
    assert.strictEqual(direct, svg, 'canvas null deve ser igual a não passar a opção');
  });
}
