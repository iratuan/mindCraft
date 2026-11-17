'use strict';
// Alinhamento do texto dos tópicos: automático para fora do centro, centro na raiz e escolha manual gravada no estilo.
const test = require('node:test');
const assert = require('node:assert');
const { MindMap, createNode } = require('../core/components/model');
const { layoutMap } = require('../core/components/layout');
const { renderGroup } = require('../core/components/svg');
const { readMom, writeMom } = require('../core/formats/mom');

function sample() {
  const m = new MindMap(createNode('Raiz'));
  for (const t of ['Direita um', 'Direita dois', 'Esquerda três', 'Esquerda quatro']) m.addChild(m.root.id, t);
  return m;
}
/** Ancoras de texto por título: 'start' (esquerda), 'middle' (centro) ou 'end' (direita). */
function anchorsByTitle(m) {
  const L = layoutMap(m);
  const svg = renderGroup(L, { interactive: false });
  const out = {};
  for (const b of L.boxes.values()) {
    const re = new RegExp(`text-anchor="(\\w+)"[^>]*>${b.lines[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<`);
    const hit = svg.match(re);
    out[b.node.title] = hit ? hit[1] : null;
  }
  return out;
}

test('automático: tópicos da direita ficam com o texto à esquerda; os da esquerda, à direita; a raiz centralizada', () => {
  const a = anchorsByTitle(sample());
  assert.strictEqual(a['Raiz'], 'middle');
  assert.strictEqual(a['Direita um'], 'start');
  assert.strictEqual(a['Direita dois'], 'start');
  assert.strictEqual(a['Esquerda três'], 'end');
  assert.strictEqual(a['Esquerda quatro'], 'end');
});

test('escolha manual vence o automático e vai para o .mom', () => {
  const m = sample();
  const d = m.root.children[0];
  m.update(d.id, { style: { align: 'center' } });
  assert.strictEqual(anchorsByTitle(m)['Direita um'], 'middle');
  m.update(d.id, { style: { align: 'right' } });
  assert.strictEqual(anchorsByTitle(m)['Direita um'], 'end');
  const f = require('path').join(require('os').tmpdir(), 'mc-align-' + Date.now() + '.mom');
  writeMom(m, f);
  const back = readMom(require('fs').readFileSync(f));
  assert.strictEqual(back.find(d.id).node.style.align, 'right');
});

test('valor de alinhamento desconhecido é descartado (nunca vai para o SVG)', () => {
  const m = sample();
  m.update(m.root.children[0].id, { style: { align: '"><script>' } });
  const a = anchorsByTitle(m);
  assert.strictEqual(a['Direita um'], 'start', 'deve voltar ao automático');
});
