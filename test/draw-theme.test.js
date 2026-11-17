'use strict';
// Tema "Desenho (à mão)": monocromático, flat (sem sombras nem gradientes) e com traço de mão.
const test = require('node:test');
const assert = require('node:assert');
const { THEMES, getTheme } = require('../core/components/themes');
const { MindMap, createNode } = require('../core/components/model');
const { toSVG } = require('../core/components/svg');

const sample = () => {
  const m = new MindMap(createNode('Ideia central'));
  const a = m.addChild(m.root.id, 'Primeiro');
  m.addChild(a.id, 'Filho');
  m.addChild(m.root.id, 'Segundo');
  m.meta.theme = 'draw';
  return m;
};

test('draw existe, é escolhível e marcado como desenho à mão', () => {
  assert.ok(THEMES.draw, 'tema draw deve existir');
  assert.strictEqual(getTheme('draw').sketch, true);
  assert.strictEqual(THEMES.ocean.sketch, undefined, 'só o tema à mão tem o traço');
});

test('draw é monocromático: todas as cores de fundo, traço, texto e ramos são cinzas ou preto/branco', () => {
  const t = THEMES.draw;
  const gray = (c) => /^#([0-9a-f]{2})\1\1$/i.test(c) || c === 'none';
  assert.ok(gray(t.background), 'fundo: ' + t.background);
  for (const b of t.branches) assert.ok(gray(b), 'ramo: ' + b);
  for (const l of t.levels) for (const k of ['fill', 'color', 'stroke']) if (l[k] !== undefined && l[k] !== 'branch') assert.ok(gray(l[k]), k + ': ' + l[k]);
});

test('draw é flat: nenhum gradiente nem sombra no desenho; o único filtro é o traço de mão', () => {
  const svg = toSVG(sample());
  assert.ok(!/linearGradient|radialGradient/.test(svg), 'sem gradientes');
  assert.ok(!/feDropShadow|drop-shadow|feGaussianBlur/.test(svg), 'sem sombras');
  assert.ok(svg.includes('filter="url(#mc-sketch)"'), 'traço de mão aplicado');
  assert.ok(/feDisplacementMap/.test(svg), 'o traço é um deslocamento leve, não uma sombra');
});

test('draw não muda a estrutura do mapa: o .mom e a árvore continuam iguais', () => {
  const m = sample();
  const titles = [];
  m.walk((n) => titles.push(n.title));
  assert.deepStrictEqual(titles, ['Ideia central', 'Primeiro', 'Filho', 'Segundo']);
});
