'use strict';
/**
 * Prova de compatibilidade: a rede que o Obsidian enxerga nos arquivos exportados é a MESMA rede que o
 * MindCraft calcula (buildGraph, usada pela visão de rede e pela rede 3D). A comparação é feita só com o que
 * está escrito nos .md: links do texto, hierarquia ("Parte de"/"Subtópicos") e relações ("→").
 */
const test = require('node:test');
const assert = require('node:assert');
const { MindMap, createNode } = require('../core/model');
const { buildGraph } = require('../core/graph');
const { buildObsidianVault } = require('../core/obsidian');

const T = (m, t) => { let r; m.walk((n) => { if (n.title === t && !r) r = n; }); return r; };

/** Mapas com todos os casos: links cruzados, caminho, seção, alias, fantasma, código, hierarquia, relação, tópico solto. */
function fixture() {
  const dc = new MindMap(createNode('Direito Constitucional'));
  const legal = dc.addChild(dc.root.id, 'Legalidade');
  const atos = dc.addChild(dc.root.id, 'Atos');
  dc.addChild(dc.root.id, 'Direitos Fundamentais');
  const sub = dc.addChild(legal.id, 'Reserva legal');
  dc.update(legal.id, { notes: 'Base: [[Direito Administrativo/Licitações|licitações]] e [[Mapa Inexistente#Tema]].' });
  dc.update(atos.id, { notes: '## Conceitos\n\nVeja [[Direito Administrativo#Atos administrativos]] e [[Legalidade#Reserva]].' });
  dc.update(sub.id, { notes: 'Código não é link: `[[Atos]]`. Fantasma: [[Tópico que não existe]].' });
  dc.addRelation(legal.id, atos.id, 'fundamenta');
  const da = new MindMap(createNode('Direito Administrativo'));
  const aa = da.addChild(da.root.id, 'Atos administrativos');
  const lic = da.addChild(da.root.id, 'Licitações');
  da.addChild(da.root.id, 'Atos');
  da.update(aa.id, { notes: 'Princípio: [[Direito Constitucional#Legalidade]]. Ver [[Licitações]] e [[Atos]].' });
  da.update(lic.id, { notes: '[[Atos administrativos|atos]]' });
  da.addRelation(aa.id, lic.id, 'pré-requisito');
  // tópico solto do Mindomo (sem ligação à raiz): entra na rede como raiz própria
  da.meta._momFloating = [{ node: createNode('Tópico solto', { notes: 'Liga a [[Licitações]].' }) }];
  // a chave do mapa é o nome: assim o id da nota exportada coincide com o id do grafo
  return [
    { key: 'Direito Constitucional', name: 'Direito Constitucional', map: dc },
    { key: 'Direito Administrativo', name: 'Direito Administrativo', map: da },
  ];
}

/** Lê o que está escrito num .md exportado: links do texto, hierarquia e relações (só os cabeçalhos que o exportador gera). */
function readExported(files) {
  const byPath = new Map(files.map((f) => [f.path.replace(/\.md$/, ''), f]));
  const idOf = (content) => /^mindcraft-id: "(.*)"$/m.exec(content)[1];
  const idByPath = new Map(files.map((f) => [f.path.replace(/\.md$/, ''), idOf(f.content)]));
  const target = (raw) => {                                    // [[caminho#seção|texto]] -> id do tópico, ou null (fantasma)
    const p = raw.split('|')[0].split('#')[0].trim();
    return idByPath.has(p) ? idByPath.get(p) : null;
  };
  const links = [], hier = [], rels = [];
  for (const f of files) {
    const from = idOf(f.content);
    const body = f.content.slice(f.content.indexOf('\n---\n', 4) + 5);
    const [notesPart, structural = ''] = body.split('\n\n---\n');
    for (const m of notesPart.replace(/^# .*\n/, '').matchAll(/\[\[([^\]]+)\]\]/g)) {
      const to = target(m[1]); if (to) links.push([from, to]);
    }
    let section = '';
    for (const line of structural.split('\n')) {
      if (line.startsWith('## ')) { section = line; continue; }
      const link = /\[\[([^\]]+)\]\]/.exec(line);
      if (!link) continue;
      const to = target(link[1]); if (!to) continue;
      if (line.startsWith('Parte de: ')) hier.push([to, from]);             // o pai aponta para o filho
      else if (section === '## Subtópicos') hier.push([from, to]);
      else if (section === '## Relações' && line.startsWith('- → ')) rels.push([from, to]);
    }
  }
  return { links, hier, rels };
}

/** Os mesmos três tipos de aresta, calculados pelo grafo do MindCraft. */
function fromGraph(maps) {
  const g = buildGraph(maps, { hierarchy: true });
  const pick = (type) => g.edges.filter((e) => e.type === type && g.byId.get(e.to).kind !== 'ghost' && e.from !== e.to).map((e) => [e.from, e.to]);
  return { links: pick('link'), hier: pick('hierarchy'), rels: pick('relation') };
}

const key = (pairs) => [...new Set(pairs.map((p) => p.join(' -> ')))].sort();

test('o Obsidian enxerga os mesmos links que o MindCraft: texto, hierarquia e relações', () => {
  const maps = fixture();
  const { files } = buildObsidianVault(maps);
  const seen = readExported(files), expected = fromGraph(maps);
  assert.deepEqual(key(seen.links), key(expected.links), 'links do texto');
  assert.deepEqual(key(seen.hier), key(expected.hier), 'hierarquia (pai/subtópicos)');
  assert.deepEqual(key(seen.rels), key(expected.rels), 'relações (setas)');
  assert.ok(seen.links.length >= 8 && seen.hier.length >= 4 && seen.rels.length === 2, 'o caso de teste cobre os três tipos');
});

test('links que o Obsidian não resolve (fantasmas) são os mesmos que o MindCraft marca como fantasmas', () => {
  const maps = fixture();
  const { files } = buildObsidianVault(maps);
  const g = buildGraph(maps, { hierarchy: true });
  const ghostCount = g.edges.filter((e) => g.byId.get(e.to).kind === 'ghost' && e.type === 'link').length;
  let unresolved = 0;
  for (const f of files) {
    // código entre crases não é link (no Obsidian também não é): fica de fora da contagem
    const body = f.content.slice(f.content.indexOf('\n---\n', 4) + 5).split('\n\n---\n')[0].replace(/`[^`\n]*`/g, ' ');
    for (const m of body.matchAll(/\[\[([^\]]+)\]\]/g)) {
      const p = m[1].split('|')[0].split('#')[0].trim();
      if (p.startsWith('MindCraft/') && !files.some((x) => x.path === `${p}.md`)) unresolved++;
      if (!p.startsWith('MindCraft/')) unresolved++;
    }
  }
  assert.equal(unresolved, ghostCount, 'mesma quantidade de links sem destino');
});

test('mudar a rede no MindCraft muda a rede exportada (não há cópia antiga)', () => {
  const maps = fixture();
  const before = readExported(buildObsidianVault(maps).files).links.length;
  T(maps[1].map, 'Licitações').notes = 'sem link agora';
  const after = readExported(buildObsidianVault(maps).files).links.length;
  assert.ok(after < before, 'o link removido some do Obsidian');
  assert.deepEqual(key(readExported(buildObsidianVault(maps).files).links), key(fromGraph(maps).links));
});
