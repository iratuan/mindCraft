'use strict';
// Regressão (0.5.0): o .mom do Mindomo não pode perder nada ao passar pelo MindCraft. Antes, tópicos flutuantes, a lixeira do Mindomo,
// relações do Mindomo, o histórico (changes.json) e os demais temas eram descartados silenciosamente na gravação.
const test = require('node:test');
const assert = require('node:assert/strict');
const AdmZip = require('adm-zip');
const { readMom, writeMom } = require('../core/formats/mom');

function momFixture() {
  const z = new AdmZip();
  const nodes = [
    { id: 'raiz00000000000000000000000000001', title: 'Raiz', index: 0, style: {} },
    { id: 'filho0000000000000000000000000002', parentId: 'raiz00000000000000000000000000001', title: 'Filho A', index: 0, style: {} },
    { id: 'flutu0000000000000000000000000003', title: 'Flutuante', index: 1, style: {} },
    { id: 'neto00000000000000000000000000004', parentId: 'flutu0000000000000000000000000003', title: 'Neto do flutuante', index: 0, style: {} },
    { id: 'lixo00000000000000000000000000005', parentId: 'raiz00000000000000000000000000001', title: 'Na lixeira', index: 2, style: {}, deleted: true },
  ];
  const rel = [{ version: 40, id: 'rel00000000000000000000000000006', fromNodeId: 'filho0000000000000000000000000002', toNodeId: 'flutu0000000000000000000000000003', ctrlX1: '1', ctrlY1: '2', ctrlX2: '3', ctrlY2: '4' }];
  const changes = [{ version: 40, id: 'chg00000000000000000000000000007', order: 0, type: 128, timestamp: 1774364542382 }];
  const themes = { tema1: { id: 'tema1', nodeStyles: {}, mapStyle: {}, relationStyle: {}, boundaryStyle: {}, summaryStyle: {}, summaryNodeStyles: {}, editable: true, type: 1 },
    tema2: { id: 'tema2', nodeStyles: {}, mapStyle: {}, relationStyle: {}, boundaryStyle: {}, summaryStyle: {}, summaryNodeStyles: {}, editable: true, type: 1 } };
  const doc = { version: 40, mapInfo: { id: 'doc', name: 'Teste', rootId: 'raiz00000000000000000000000000001', themeId: 'tema1', style: {}, template: {} } };
  z.addFile('document.json', Buffer.from(JSON.stringify(doc)));
  z.addFile('nodes.json', Buffer.from(JSON.stringify(nodes)));
  z.addFile('relations.json', Buffer.from(JSON.stringify(rel)));
  z.addFile('changes.json', Buffer.from(JSON.stringify(changes)));
  z.addFile('themes.json', Buffer.from(JSON.stringify(themes)));
  return z.toBuffer();
}

const entry = (buf, name) => { const e = new AdmZip(buf).getEntry(name); return e ? JSON.parse(e.getData().toString('utf8')) : undefined; };
const titles = (m) => { const out = []; (function w(n, d) { out.push(' '.repeat(d) + n.title); n.children.forEach((c) => w(c, d + 1)); })(m.root, 0); return out.join('\n'); };

test('ida e volta de um .mom do Mindomo não perde tópicos flutuantes, lixeira, relações, histórico nem temas', () => {
  const original = momFixture();
  const m1 = readMom(original);
  assert.equal(titles(m1), 'Raiz\n Filho A', 'a árvore visível do MindCraft segue só com a raiz e o filho');
  const saved = writeMom(m1);

  const nodesIn = entry(original, 'nodes.json').map((n) => n.id).sort();
  const nodesOut = entry(saved, 'nodes.json').map((n) => n.id).sort();
  assert.deepEqual(nodesOut, nodesIn, 'todos os nós voltam (flutuante, filho dele e lixeira)');
  assert.deepEqual(entry(saved, 'changes.json'), entry(original, 'changes.json'), 'histórico do Mindomo volta igual');
  assert.deepEqual(entry(saved, 'relations.json'), entry(original, 'relations.json'), 'relação do Mindomo volta igual');
  assert.deepEqual(Object.keys(entry(saved, 'themes.json')).sort(), ['tema1', 'tema2'], 'todos os temas voltam, não só o em uso');

  // e reabrir o arquivo regravado mostra a mesma árvore
  assert.equal(titles(readMom(saved)), titles(m1));
});

test('relação do Mindomo com um tópico apagado no MindCraft não é gravada (sem referência solta)', () => {
  const m = readMom(momFixture());
  const filho = m.root.children[0];
  m.root.children = [];                      // apaga o "Filho A" pelo app
  const saved = writeMom(m);
  const rels = entry(saved, 'relations.json');
  assert.equal(rels, undefined, 'a relação que dependia do filho apagado sai do arquivo');
  assert.ok(filho);
});
