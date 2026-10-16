'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { MindMap, createNode } = require('../core/model');
const { writeMom } = require('../core/mom');
const { norm, parseLinks, rewriteLinks } = require('../core/links');
const { buildGraph, neighborhood } = require('../core/graph');
const { forceLayout } = require('../core/forcelayout');
const { listMoms, loadVault, clearVaultCache } = require('../core/vault');
const { exportObsidian, safeFileName, headingText, obsidianUrl } = require('../core/obsidian');

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
    'A:Atos -link> ?Mapa Fantasma#X',
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
  for (const p of pts) { assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y)); assert.ok(Math.abs(p.x) <= 800 && Math.abs(p.y) <= 500); }
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

test('Obsidian: nomes seguros, cabeçalhos compatíveis e URL do protocolo', () => {
  assert.equal(safeFileName('a/b\\c:d*e?"f<g>h|i#j^k[l]m'), 'a b c d e f g h i j k l m');
  assert.equal(safeFileName('../../etc/passwd'), 'etc passwd'); assert.equal(safeFileName('CON'), '_CON'); assert.equal(safeFileName('  ...  '), 'Mapa');
  assert.equal(safeFileName('x'.repeat(300)).length, 120); assert.equal(safeFileName(null), 'Mapa');
  assert.equal(headingText('Art. 5º: caput #1 | [x]'), 'Art. 5º caput 1 x'); assert.equal(headingText('###'), '(sem título)');
  assert.equal(obsidianUrl('C:\\Meu Vault\\Estudos ç'), 'obsidian://open?path=C%3A%5CMeu%20Vault%5CEstudos%20%C3%A7');
});

test('Obsidian: exporta um .md por mapa com [[Mapa#Tópico]] resolvido, alias, fantasmas, relações, notas e metadados', () => {
  const [dc, da] = twoMaps();
  dc.map.update(T(dc.map, 'Legalidade').id, { progress: 80 }); dc.map.toggleMarker(T(dc.map, 'Legalidade').id, 'star');
  dc.map.setExam({ name: 'TRF "2026"', date: '2026-10-30' });
  const parent = tmp(), out = path.join(parent, 'vault ç');
  const r = exportObsidian([dc, da], out);
  assert.deepEqual(fs.readdirSync(parent), ['vault ç'], 'nada escrito fora da pasta de saída');
  assert.deepEqual(fs.readdirSync(out).sort(), ['Direito Administrativo.md', 'Direito Constitucional.md']);
  const c = fs.readFileSync(path.join(out, 'Direito Constitucional.md'), 'utf8'), a = fs.readFileSync(path.join(out, 'Direito Administrativo.md'), 'utf8');
  assert.match(c, /^---\nmindcraft: true\nmapa: "Direito Constitucional"\nprova: "TRF '2026'"\ndata_prova: 2026-10-30\ntags: \[mindcraft\]\n---\n/);
  assert.match(c, /^# Direito Constitucional$/m); assert.match(c, /^## Legalidade$/m);
  assert.match(c, /\[\[Direito Administrativo#Princípios da Administração\]\] e \[\[Direito Constitucional#Legalidade\]\]\./, 'links normalizados para Mapa#Tópico');
  assert.match(c, /_Progresso: 80% · Favorito_/);
  assert.match(c, /`\[\[ignorado\]\]`/, 'código intocado'); assert.match(c, /\[\[tambem ignorado\]\]/);
  assert.match(a, /\[\[Direito Constitucional#Legalidade\|legalidade constitucional\]\]/, 'alias preservado');
  assert.match(a, /\[\[Tópico inexistente\]\]/, 'fantasma segue como [[Título]]');
  assert.match(a, /\[\[Direito Constitucional#Princípios\]\]/, '[[principios]] resolveu para outro mapa');
  assert.match(a, /- Relacionado: \[\[Direito Administrativo#Atos\]\] \(fundamenta\)/);
  assert.deepEqual(r.warnings, []);
  assert.throws(() => exportObsidian([], out), /Não há mapas/);
  fs.rmSync(parent, { recursive: true, force: true });
});

test('Obsidian: colisão de nomes, nomes perigosos, cabeçalhos duplicados e título com link', () => {
  const m1 = new MindMap(createNode('x')), m2 = new MindMap(createNode('y')), m3 = new MindMap(createNode('z'));
  m1.addChild(m1.root.id, 'Repetido'); m1.addChild(m1.root.id, 'Repetido'); m1.addChild(m1.root.id, 'Veja [[Destino|o destino]]: item #1');
  const dest = m2.addChild(m2.root.id, 'Destino');
  const dir = tmp();
  const r = exportObsidian([{ key: '1', name: '../Plano', map: m1 }, { key: '2', name: 'Plano', map: m2 }, { key: '3', name: 'con', map: m3 }], dir);
  assert.deepEqual(fs.readdirSync(dir).sort(), ['Plano (2).md', 'Plano.md', '_con.md'].sort());
  assert.ok(r.warnings.some((w) => w.includes('"Repetido"')), 'aviso de cabeçalho duplicado');
  const md = fs.readFileSync(path.join(dir, 'Plano.md'), 'utf8');
  assert.match(md, /^## Veja o destino item 1$/m, 'cabeçalho sem [[ ]] nem : #');
  assert.match(md, /Ligações do título: Veja \[\[Plano \(2\)#Destino\|o destino\]\]: item #1/);
  void dest; fs.rmSync(dir, { recursive: true, force: true });
});

test('menções sem link: acha títulos citados como palavra inteira (sem acento/caixa) e ignora os já ligados', () => {
  const { unlinkedMentions, linkify } = require('../core/mentions');
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
  const { linkify } = require('../core/mentions');
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

test('Obsidian: não sobrescreve nota que não é do MindCraft; atualiza a que é', () => {
  const [dc] = twoMaps(); const dir = tmp();
  fs.writeFileSync(path.join(dir, 'Direito Constitucional.md'), '# minha nota pessoal\nconteúdo importante\n');
  const r1 = exportObsidian([dc], dir);
  assert.equal(fs.readFileSync(path.join(dir, 'Direito Constitucional.md'), 'utf8'), '# minha nota pessoal\nconteúdo importante\n', 'nota pessoal intacta');
  assert.ok(fs.existsSync(path.join(dir, 'Direito Constitucional (MindCraft).md'))); assert.equal(r1.warnings.length, 1);
  dc.map.root.title = 'Direito Constitucional'; dc.map.update(T(dc.map, 'Legalidade').id, { progress: 10 });
  const r2 = exportObsidian([dc], dir);                                   // 2ª exportação: atualiza o arquivo do MindCraft
  assert.ok(fs.readFileSync(path.join(dir, 'Direito Constitucional (MindCraft).md'), 'utf8').includes('Progresso: 10%'));
  assert.equal(fs.readdirSync(dir).length, 2, 'não cria um arquivo novo a cada exportação'); assert.equal(r2.warnings.length, 1);
  fs.rmSync(dir, { recursive: true, force: true });
});
