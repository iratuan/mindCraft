'use strict';
// O mapa é plano em TODOS os temas: sem sombras, sem brilhos e sem gradientes no desenho dos tópicos e das ligações.
const test = require('node:test');
const assert = require('node:assert');
const { THEMES } = require('../core/themes');
const { MindMap, createNode } = require('../core/model');
const { toSVG } = require('../core/svg');

const sample = (theme) => {
  const m = new MindMap(createNode('Raiz'));
  const a = m.addChild(m.root.id, 'Ramo A');
  m.addChild(a.id, 'Filho');
  m.addChild(m.root.id, 'Ramo B');
  m.update(a.id, { notes: 'com nota' });
  m.meta.theme = theme;
  return m;
};

for (const theme of Object.keys(THEMES)) {
  test(`mapa plano no tema ${theme}: sem sombra, brilho nem gradiente`, () => {
    const svg = toSVG(sample(theme));
    assert.ok(!/feDropShadow|drop-shadow|feGaussianBlur|feOffset|box-shadow|Gradient/i.test(svg), 'o desenho do mapa não pode ter sombra');
  });
}
