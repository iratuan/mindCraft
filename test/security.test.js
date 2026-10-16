'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AdmZip = require('adm-zip');
const { MindMap, createNode } = require('../core/model');
const { readMom, writeMom } = require('../core/mom');
const { toSVG, renderGroup } = require('../core/svg');
const { layoutMap } = require('../core/layout');
const { sanitizeStyle } = require('../core/themes');

const walkAll = (m) => { const r = []; m.walk((n, l) => r.push([l, n])); return r; };

test('PERSISTÊNCIA: estilo, recolhido, tema, marcadores e progresso sobrevivem a salvar/abrir (regressão de perda de dados)', () => {
  const m = new MindMap(createNode('Raiz'), { theme: 'paper' });
  const a = m.addChild(m.root.id, 'A'), b = m.addChild(m.root.id, 'B'), a1 = m.addChild(a.id, 'A1');
  m.update(a.id, { style: { fill: '#ff0000', color: '#ffffff', shape: 'round', bold: false, italic: true, size: 20 }, collapsed: true });
  m.update(b.id, { style: { shape: 'underline' } });
  m.toggleMarker(a1.id, 'star'); m.update(a1.id, { progress: 33 });
  const back = readMom(writeMom(m));
  assert.equal(back.meta.theme, 'paper', 'tema do mapa');
  const A = back.root.children[0], B = back.root.children[1];
  assert.deepEqual(A.style, { fill: '#ff0000', color: '#ffffff', shape: 'round', bold: false, italic: true, size: 20 });
  assert.equal(A.collapsed, true, 'recolhido'); assert.equal(B.collapsed, false);
  assert.deepEqual(B.style, { shape: 'underline' });
  assert.deepEqual([A.children[0].markers, A.children[0].progress], [['star'], 33]);
  assert.equal(A.id, a.id, 'ids estáveis');
});

test('SEGURANÇA: estilos vindos de arquivo só passam se forem valores conhecidos e seguros', () => {
  assert.deepEqual(sanitizeStyle({ fill: '#00ff00', shape: 'pill', size: 14, bold: true }), { fill: '#00ff00', shape: 'pill', size: 14, bold: true });
  const evil = sanitizeStyle({ fill: '"><script>alert(1)</script>', color: 'red', shape: 'x" onload="y', size: 99999, bold: 'yes', italic: 1 });
  assert.deepEqual(evil, {}, 'nada de valor arbitrário');
  assert.deepEqual(sanitizeStyle(null), {}); assert.deepEqual(sanitizeStyle('x'), {});
});

test('SEGURANÇA: .mom malicioso (ids/estilo/cor de relação com aspas e tags) não injeta nada no SVG', () => {
  const m = new MindMap(createNode('Raiz'));
  const a = m.addChild(m.root.id, 'A'); const b = m.addChild(m.root.id, 'B');
  m.addRelation(a.id, b.id, '<img src=x onerror=1>');
  const z = new AdmZip(writeMom(m));
  const nodes = JSON.parse(z.getEntry('nodes.json').getData().toString());
  const na = nodes.find((n) => n.title === 'A');
  na.id = 'x" onmouseover="alert(1)'; nodes.filter((n) => n.parentId === a.id).forEach((n) => { n.parentId = na.id; });
  na.mc = { style: { fill: '"/><script>alert(1)</script>', shape: '"><x>' }, markers: ['star', '"><b>', 7] };
  z.updateFile('nodes.json', Buffer.from(JSON.stringify(nodes)));
  const doc = JSON.parse(z.getEntry('document.json').getData().toString());
  doc.mcRelations = [{ id: 'r" x="1', from: na.id, to: b.id, label: '<script>1</script>', color: '"><script>' }];
  doc.mcTheme = '"><evil>';
  z.updateFile('document.json', Buffer.from(JSON.stringify(doc)));
  const evil = readMom(z.toBuffer());
  const A = evil.root.children.find((n) => n.title === 'A');
  assert.match(A.id, /^[A-Za-z0-9_-]{1,64}$/, 'id inseguro foi substituído');
  assert.deepEqual(A.style, {}); assert.deepEqual(A.markers, ['star']);
  assert.equal(evil.meta.theme, 'ocean', 'tema desconhecido volta ao padrão');
  assert.equal(evil.meta.relations.length, 1, 'a relação sobrevive ao remapeamento de ids');
  assert.match(evil.meta.relations[0].id, /^[A-Za-z0-9_-]+$/); assert.equal(evil.meta.relations[0].color, undefined);
  const svg = toSVG(evil); const L = layoutMap(evil);
  const g = renderGroup(L, { interactive: true, selectedRel: evil.meta.relations[0].id });
  for (const out of [svg, g]) {
    assert.doesNotMatch(out, /<script|onmouseover|onerror=1>|"><x>|alert\(1\)"/, 'sem injeção');
    assert.doesNotMatch(out, /<img/, 'rótulo escapado');
  }
});

test('ROBUSTEZ: ciclos, ids duplicados, órfãos, entradas absurdas e arquivos inválidos', () => {
  const base = new MindMap(createNode('Raiz')); const a = base.addChild(base.root.id, 'A'); base.addChild(a.id, 'A1');
  const z = new AdmZip(writeMom(base));
  const nodes = JSON.parse(z.getEntry('nodes.json').getData().toString());
  const A = nodes.find((n) => n.title === 'A'), A1 = nodes.find((n) => n.title === 'A1');
  A.parentId = A1.id;                          // ciclo A -> A1 -> A
  nodes.push({ ...A1, title: 'Duplicado' });   // mesmo id de A1
  nodes.push({ id: 'orfao', parentId: 'nao-existe', title: 'Órfão', index: 0 });
  nodes.push(null, 5, { id: 7 });              // lixo
  z.updateFile('nodes.json', Buffer.from(JSON.stringify(nodes)));
  const m = readMom(z.toBuffer());
  const seen = new Set(); let n = 0; m.walk((x) => { n++; seen.add(x.id); });
  assert.equal(seen.size, n, 'nenhum nó repetido (sem laço infinito)');
  assert.equal(n < 10, true);
  assert.doesNotThrow(() => layoutMap(m)); assert.doesNotThrow(() => writeMom(m));
  // inválidos
  assert.throws(() => readMom(Buffer.from('lixo')), /zip|format|header/i);
  const empty = new AdmZip(); empty.addFile('x.txt', Buffer.from('1'));
  assert.throws(() => readMom(empty.toBuffer()), /inválido/);
  const noRoot = new AdmZip(); noRoot.addFile('document.json', Buffer.from('{}')); noRoot.addFile('nodes.json', Buffer.from('[]'));
  assert.throws(() => readMom(noRoot.toBuffer()), /raiz/);
});

test('ROBUSTEZ: cadeia profunda (2000 níveis) é recusada com mensagem clara e não estoura a pilha', () => {
  const nodes = []; let prev = null;
  for (let i = 0; i < 2000; i++) { const id = 'n' + i; nodes.push({ id, ...(prev ? { parentId: prev } : {}), title: 'N' + i, index: 0 }); prev = id; }
  const z = new AdmZip(); z.addFile('document.json', Buffer.from(JSON.stringify({ mapInfo: { rootId: 'n0', name: 'x' } }))); z.addFile('nodes.json', Buffer.from(JSON.stringify(nodes)));
  // recusa com mensagem clara (nunca estouro de pilha, nunca corte silencioso que seria gravado por cima do original)
  assert.throws(() => readMom(z.toBuffer()), (e) => e instanceof Error && !(e instanceof RangeError) && /mais de 500 níveis/.test(e.message));
});

test('GRAVAÇÃO: atômica (sem .tmp sobrando), preserva o original se falhar e aceita caminho com acentos', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-sec-'));
  const f = path.join(dir, 'meu mapa ç.mom'); const m = new MindMap(createNode('V1'));
  writeMom(m, f); assert.equal(readMom(fs.readFileSync(f)).root.title, 'V1');
  m.root.title = 'V2'; writeMom(m, f);
  assert.equal(readMom(fs.readFileSync(f)).root.title, 'V2'); assert.deepEqual(fs.readdirSync(dir), ['meu mapa ç.mom'], 'sem temporários');
  // alvo é um diretório: o rename falha, o erro sobe e nada fica para trás
  const bad = path.join(dir, 'pasta'); fs.mkdirSync(bad);
  assert.throws(() => writeMom(m, bad)); assert.deepEqual(fs.readdirSync(dir).sort(), ['meu mapa ç.mom', 'pasta']);
  fs.rmSync(dir, { recursive: true, force: true });
});
