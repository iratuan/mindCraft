'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { MindMap, createNode } = require('../core/components/model');
const { writeMom } = require('../core/formats/mom');
const { norm, parseLinks, rewriteLinks } = require('../core/components/links');
const { listMoms, loadVault, clearVaultCache } = require('../core/services/vault');
const { buildGraph, neighborhood } = require('../core/components/graph');
const { forceLayout } = require('../core/components/forcelayout');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'mc-net-'));
const T = (m, title) => { let r; m.walk((n) => { if (n.title === title && !r) r = n; }); return r; };

/** Dois mapas ligados por [[links]]. */
function twoMaps() {
  const dc = new MindMap(createNode('Direito Constitucional'));
  const princ = dc.addChild(dc.root.id, 'Princípios'); const leg = dc.addChild(dc.root.id, 'Legalidade'); dc.addChild(dc.root.id, 'Direitos Fundamentais');
  dc.update(princ.id, { notes: 'Ver [[Direito Administrativo#Princípios da Administração]] e [[legalidade]].' });
  dc.update(T(dc, 'Direitos Fundamentais').id, { notes: 'exemplo em código: `[[ignorado]]` e\n```\n[[tambem ignorado]]\n```' });
  const da = new MindMap(createNode('Direito Administrativo'));
  const pa = da.addChild(da.root.id, 'Princípios da Administração'); const atos = da.addChild(da.root.id, 'Atos');
  da.update(pa.id, { notes: 'base: [[Direito Constitucional#Legalidade|legalidade constitucional]]' });
  da.update(atos.id, { notes: '[[Tópico inexistente]] · [[principios]] · [[Direito Constitucional#Não existe]] · [[Mapa Fantasma#X]]' });
  da.addRelation(pa.id, atos.id, 'fundamenta');
  return [{ key: '/v/Direito Constitucional.mom', name: 'Direito Constitucional', map: dc }, { key: '/v/Direito Administrativo.mom', name: 'Direito Administrativo', map: da }];
}
const label = (g, id) => { const n = g.byId.get(id); return n.kind === 'ghost' ? `?${n.title}` : `${n.mapName.split(' ')[1][0]}:${n.title}`; };
const edgeList = (g) => g.edges.map((e) => `${label(g, e.from)} -${e.type}> ${label(g, e.to)}`).sort();

test('links: sintaxe [[A]], [[Mapa#Tópico]], [[Mapa#]], alias; ignora código, quebras de linha e vazio', () => {
  assert.deepEqual(parseLinks('x [[A]] y [[B#C]] [[D#]] [[E|ali]] [[F#G|ali2]]').map((l) => [l.map, l.topic, l.alias]),
    [[null, 'A', null], ['B', 'C', null], ['D', null, null], [null, 'E', 'ali'], ['F', 'G', 'ali2']]);
  assert.deepEqual(parseLinks('`[[no código]]` e ```\n[[bloco]]\n``` fora [[ok]]').map((l) => l.topic), ['ok']);
  assert.deepEqual(parseLinks('[[]] [[ ]] [[a\nb]] [[[x]]] [ [y] ]').map((l) => l.topic), ['x'], 'vazio/quebra de linha não são links');
  assert.deepEqual(parseLinks('[[' + 'a'.repeat(201) + ']]'), [], 'limite de tamanho');
  assert.deepEqual(parseLinks(null), []); assert.deepEqual(parseLinks(undefined), []);
  assert.equal(norm('  Princípios   DA  Administração '), 'principios da administracao');
  assert.equal(rewriteLinks('a [[x]] `[[y]]` [[z|w]]', (l) => `<${l.topic}:${l.alias}>`), 'a <x:null> `[[y]]` <z:w>');
});

test('grafo: resolução por mapa/título (sem acento/caixa), alias, fantasmas, relações e retrolinks', () => {
  const [dc, da] = twoMaps(); const g = buildGraph([dc, da]);
  assert.deepEqual(edgeList(g), [
    'A:Atos -link> ?Mapa Fantasma',   // [[Mapa Fantasma#X]]: sem mapa com esse nome, "#X" é seção (Obsidian)
    'A:Atos -link> ?Direito Constitucional#Não existe',
    'A:Atos -link> ?Tópico inexistente',
    'A:Atos -link> C:Princípios',
    'A:Princípios da Administração -link> C:Legalidade',
    'A:Princípios da Administração -relation> A:Atos',
    'C:Princípios -link> A:Princípios da Administração',
    'C:Princípios -link> C:Legalidade',
  ].sort());
  const idLeg = g.idOf(dc.key, T(dc.map, 'Legalidade').id);
  assert.deepEqual(g.incoming(idLeg).map((e) => label(g, e.from)).sort(), ['A:Princípios da Administração', 'C:Princípios'], 'retrolinks');
  assert.equal(g.edges.find((e) => e.alias).alias, 'legalidade constitucional');
  assert.equal(g.nodes.filter((n) => n.kind === 'ghost').length, 3);
  // links em código não geram nó
  assert.ok(!g.nodes.some((n) => /ignorado/.test(n.title)));
  assert.equal(g.byId.get(idLeg).deg, 2);
});

test('grafo: prefere o próprio mapa, marca ambíguo entre mapas, hierarquia opcional e vizinhança', () => {
  const a = new MindMap(createNode('Alfa')), b = new MindMap(createNode('Beta')), c = new MindMap(createNode('Gama'));
  const x1 = b.addChild(b.root.id, 'Conceito'), x2 = c.addChild(c.root.id, 'Conceito');
  const own = a.addChild(a.root.id, 'Conceito'); const src = a.addChild(a.root.id, 'Fonte');
  a.update(src.id, { notes: '[[Conceito]]' });
  const maps = [{ key: 'a', name: 'Alfa', map: a }, { key: 'b', name: 'Beta', map: b }, { key: 'c', name: 'Gama', map: c }];
  let g = buildGraph(maps);
  assert.equal(g.byId.get(g.edges[0].to).mapName, 'Alfa', 'próprio mapa vence');
  assert.equal(g.edges[0].ambiguous, undefined);
  a.remove(own.id);
  g = buildGraph(maps);
  assert.equal(g.byId.get(g.edges[0].to).mapName, 'Beta', 'sem o próprio: 1º por ordem alfabética do mapa');
  assert.equal(g.edges[0].ambiguous, true);
  // [[Beta]] = raiz do mapa Beta
  a.update(src.id, { notes: '[[Beta]]' }); g = buildGraph(maps);
  assert.equal(g.byId.get(g.edges[0].to).isRoot, true);
  // hierarquia: não conta no grau
  const withH = buildGraph(maps, { hierarchy: true });
  assert.ok(withH.edges.some((e) => e.type === 'hierarchy'));
  assert.deepEqual(withH.nodes.map((n) => n.deg), g.nodes.map((n) => n.deg), 'grau ignora a hierarquia');
  assert.equal(withH.incoming(withH.edges[0].to).filter((e) => e.type === 'hierarchy').length, 0);
  // vizinhança
  const nb1 = neighborhood(g, g.idOf('a', src.id), 1), nb2 = neighborhood(g, g.idOf('a', src.id), 2);
  assert.equal(nb1.nodes.length, 2); assert.ok(nb2.nodes.length >= 2);
  assert.deepEqual(neighborhood(g, 'nao-existe', 1), { nodes: [], edges: [] });
  void x1; void x2;
});

test('layout de forças: determinístico, dentro dos limites, sem sobreposição e agrupa por mapa', () => {
  const nodes = [], edges = [];
  for (const k of ['A', 'B']) for (let i = 0; i < 12; i++) nodes.push({ id: k + i, mapKey: k, deg: 1 });
  for (const k of ['A', 'B']) for (let i = 1; i < 12; i++) edges.push({ from: k + (i - 1), to: k + i, type: 'link' });
  edges.push({ from: 'A0', to: 'B0', type: 'link' });
  const p1 = forceLayout(nodes, edges, { seed: 3 }), p2 = forceLayout(nodes, edges, { seed: 3 }), p3 = forceLayout(nodes, edges, { seed: 4 });
  assert.deepEqual([...p1], [...p2], 'mesma semente => mesmas posições');
  assert.notDeepEqual([...p1], [...p3]);
  const pts = [...p1.values()];
  for (const p of pts) { assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y)); assert.ok(Math.abs(p.x) <= 800 && Math.abs(p.y) <= 800, 'compacto: ' + Math.round(p.x) + ',' + Math.round(p.y)); }
  let minD = Infinity; for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) minD = Math.min(minD, Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y));
  assert.ok(minD > 5, 'nós não se sobrepõem: ' + minD);
  const d = (a, b) => Math.hypot(p1.get(a).x - p1.get(b).x, p1.get(a).y - p1.get(b).y);
  let intra = 0, ni = 0, inter = 0, ne = 0;
  for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) { if (i < j) { intra += d('A' + i, 'A' + j); ni++; } inter += d('A' + i, 'B' + j); ne++; }
  assert.ok(intra / ni < inter / ne, 'nós do mesmo mapa ficam mais perto entre si');
  assert.equal(forceLayout([], []).size, 0);
  assert.equal(forceLayout([{ id: 'x', deg: 0 }], []).size, 1);
  assert.ok(forceLayout([{ id: 'a', deg: 0 }, { id: 'b', deg: 0 }], [{ from: 'a', to: 'z', type: 'link' }]).size === 2, 'aresta para nó inexistente é ignorada');
});

test('layout de forças: 700 nós em tempo razoável; acima do limite os mais conectados são priorizados e ninguém some', () => {
  const nodes = Array.from({ length: 700 }, (_, i) => ({ id: 'n' + i, mapKey: 'M' + (i % 5), deg: i % 7 }));
  const edges = Array.from({ length: 900 }, (_, i) => ({ from: 'n' + (i % 700), to: 'n' + ((i * 7 + 3) % 700), type: 'link' }));
  const t0 = Date.now(); const p = forceLayout(nodes, edges, { iterations: 120 }); const dt = Date.now() - t0;
  assert.equal(p.size, 700); assert.ok(dt < 15000, 'tempo ' + dt + 'ms');
  const capped = forceLayout(nodes, edges, { iterations: 20, maxNodes: 100 });
  assert.equal(capped.size, 700, 'todos têm posição');
});

test('vault: lista .mom (ignora ocultos/temporários/node_modules, respeita profundidade), cache e erros por arquivo', () => {
  clearVaultCache();
  const dir = tmp();
  const [dc, da] = twoMaps();
  writeMom(dc.map, path.join(dir, 'Direito Constitucional.mom'));
  fs.mkdirSync(path.join(dir, 'sub', 'ç'), { recursive: true }); writeMom(da.map, path.join(dir, 'sub', 'ç', 'Direito Administrativo.mom'));
  fs.mkdirSync(path.join(dir, '.oculta')); writeMom(da.map, path.join(dir, '.oculta', 'x.mom'));
  fs.mkdirSync(path.join(dir, 'node_modules')); writeMom(da.map, path.join(dir, 'node_modules', 'y.mom'));
  fs.writeFileSync(path.join(dir, 'Direito Constitucional.mom.tmp-123'), 'x'); fs.writeFileSync(path.join(dir, 'ruim.mom'), 'não é zip'); fs.writeFileSync(path.join(dir, 'nota.txt'), 'x');
  fs.mkdirSync(path.join(dir, 'a', 'b', 'c', 'd'), { recursive: true }); writeMom(da.map, path.join(dir, 'a', 'b', 'c', 'd', 'fundo.mom'));
  const { files } = listMoms(dir);
  assert.deepEqual(files.map((f) => path.relative(dir, f)).sort(), ['Direito Constitucional.mom', path.join('sub', 'ç', 'Direito Administrativo.mom'), 'ruim.mom'].sort());
  const v1 = loadVault(dir);
  assert.deepEqual(v1.maps.map((m) => m.name).sort(), ['Direito Administrativo', 'Direito Constitucional']);
  assert.equal(v1.errors.length, 1); assert.ok(v1.errors[0].file.endsWith('ruim.mom'));
  const again = loadVault(dir);
  assert.strictEqual(again.maps.find((m) => m.name === 'Direito Constitucional').map, v1.maps.find((m) => m.name === 'Direito Constitucional').map, 'cache: não relê o que não mudou');
  const f = path.join(dir, 'Direito Constitucional.mom'); dc.map.root.title = 'Mudou'; writeMom(dc.map, f);
  fs.utimesSync(f, new Date(), new Date(Date.now() + 5000));
  assert.equal(loadVault(dir).maps.find((m) => m.name === 'Direito Constitucional').map.root.title, 'Mudou', 'relê quando muda');
  assert.equal(loadVault(path.join(dir, 'nao-existe')).errors.length, 1); assert.equal(loadVault(null).maps.length, 0);
  assert.equal(listMoms(dir, { maxFiles: 1 }).truncated, true);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('menções sem link: acha títulos citados como palavra inteira (sem acento/caixa) e ignora os já ligados', () => {
  const { unlinkedMentions, linkify } = require('../core/components/mentions');
  const [dc, da] = twoMaps();
  const ate = T(da.map, 'Atos'); da.map.update(ate.id, { notes: 'O princípio da LEGALIDADE se liga aos Princípios; veja [[Princípios da Administração]]. Legalidades? não. Direitos fundamentais também.' });
  const m = unlinkedMentions([dc, da], da.key, ate);
  assert.deepEqual(m.map((x) => x.title).sort(), ['Direitos Fundamentais', 'Legalidade', 'Princípios'].sort(), 'palavras inteiras; "Legalidades" não conta; já ligado ([[Princípios da Administração]]) não aparece');
  assert.deepEqual(unlinkedMentions([dc, da], da.key, T(da.map, 'Princípios da Administração')).map((x) => x.title), ['Princípios'], 'o próprio título cita a palavra Princípios (outro mapa), como no Obsidian');
  assert.equal(unlinkedMentions([dc, da], da.key, ate, { limit: 1 }).length, 1);
  const tiny = new MindMap(createNode('R')); tiny.addChild(tiny.root.id, 'Lei'); const s = tiny.addChild(tiny.root.id, 'S'); tiny.update(s.id, { notes: 'a lei manda' });
  assert.equal(unlinkedMentions([{ key: 't', name: 't', map: tiny }], 't', s).length, 0, 'títulos curtos (< 4) são ignorados');
});

test('linkify: envolve a 1ª ocorrência preservando os caracteres originais; ignora [[links]] e código', () => {
  const { linkify } = require('../core/components/mentions');
  assert.equal(linkify('O princípio da LEGALIDADE vale', 'Legalidade'), 'O princípio da [[LEGALIDADE]] vale');
  assert.equal(linkify('administração pública', 'Administração Pública'), '[[administração pública]]');
  assert.equal(linkify('Legalidades e legalidade', 'Legalidade'), 'Legalidades e [[legalidade]]', 'só palavra inteira');
  assert.equal(linkify('já [[Legalidade]] e `Legalidade` em código', 'Legalidade'), null, 'dentro de link/código não conta');
  assert.equal(linkify('a Legalidade; a Legalidade', 'Legalidade'), 'a [[Legalidade]]; a Legalidade', 'só a primeira');
  assert.equal(linkify('Direito Penal e direito', 'Direito Penal', { target: 'Mapa#Direito Penal' }), '[[Mapa#Direito Penal|Direito Penal]] e direito');
  assert.equal(linkify('nada aqui', 'Legalidade'), null); assert.equal(linkify('', 'x'), null); assert.equal(linkify('x', '***'), null);
  assert.equal(linkify('Art. 5.º (C.F.) vale', 'Art. 5.º (C.F.)'), '[[Art. 5.º (C.F.)]] vale', 'pontuação no título não quebra a expressão regular');
  assert.equal(linkify('açaí ÇA vale', 'ça'), 'açaí [[ÇA]] vale', 'acentos e maiúsculas');
});

test('layout de forças: componentes empacotados sem se sobrepor, órfãos em grade compacta, centrado na origem, excedentes sem pilha', () => {
  const nodes = [], edges = [];
  for (let c = 0; c < 6; c++) { for (let i = 0; i < 15 + c * 3; i++) nodes.push({ id: `c${c}n${i}`, mapKey: 'M' + c, deg: 1 }); for (let i = 1; i < 15 + c * 3; i++) edges.push({ from: `c${c}n${Math.floor((i - 1) / 2)}`, to: `c${c}n${i}`, type: 'hierarchy' }); }
  for (let i = 0; i < 30; i++) nodes.push({ id: 'o' + i, mapKey: 'M0', deg: 0 });
  const p = forceLayout(nodes, edges, { seed: 5 }); assert.equal(p.size, nodes.length);
  const box = (pre) => { const pts = [...p].filter(([id]) => id.startsWith(pre)).map(([, v]) => v); return { x1: Math.min(...pts.map((q) => q.x)), x2: Math.max(...pts.map((q) => q.x)), y1: Math.min(...pts.map((q) => q.y)), y2: Math.max(...pts.map((q) => q.y)) }; };
  const boxes = [0, 1, 2, 3, 4, 5].map((c) => box(`c${c}n`));
  for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) assert.ok(boxes[a].x2 < boxes[b].x1 || boxes[b].x2 < boxes[a].x1 || boxes[a].y2 < boxes[b].y1 || boxes[b].y2 < boxes[a].y1, `componentes ${a} e ${b} se sobrepõem`);
  const orph = box('o'), compsBottom = Math.max(...boxes.map((b) => b.y2)); assert.ok(orph.y1 > compsBottom, 'órfãos ficam abaixo dos componentes'); assert.ok(orph.x2 - orph.x1 < 1500 && orph.y2 - orph.y1 < 600, 'grade compacta: ' + Math.round(orph.x2 - orph.x1) + 'x' + Math.round(orph.y2 - orph.y1));
  const all = [...p.values()], cx = (Math.min(...all.map((q) => q.x)) + Math.max(...all.map((q) => q.x))) / 2, cy = (Math.min(...all.map((q) => q.y)) + Math.max(...all.map((q) => q.y))) / 2; assert.ok(Math.abs(cx) < 1 && Math.abs(cy) < 1, 'centrado');
  let minD = Infinity; for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) minD = Math.min(minD, Math.hypot(all[i].x - all[j].x, all[i].y - all[j].y)); assert.ok(minD > 20, 'distância mínima ' + minD);
  const capped = forceLayout(nodes, edges, { maxNodes: 40, iterations: 30 }); const seen = new Set([...capped.values()].map((q) => `${Math.round(q.x)},${Math.round(q.y)}`)); assert.equal(capped.size, nodes.length); assert.equal(seen.size, nodes.length, 'ninguém empilhado na mesma posição');
});