'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { MindMap, createNode } = require('../core/model');
const { readMom, writeMom } = require('../core/mom');
const { layoutMap } = require('../core/layout');
const { toSVG } = require('../core/svg');
const { toPDF, toDOCX, toMarkdown, toOPML } = require('../core/export');
const { THEMES } = require('../core/themes');

function sample() {
  const m = new MindMap(createNode('Raiz'));
  const a = m.addChild(m.root.id, 'A');
  m.addChild(a.id, 'A1');
  const b = m.addChild(m.root.id, 'B & <C>');
  m.update(b.id, { notes: 'nota\nlinha 2' });
  return m;
}

test('undo/redo e move sem ciclo', () => {
  const m = sample();
  const a = m.root.children[0];
  assert.equal(m.move(a.id, a.children[0].id), false, 'não pode mover para dentro de si');
  assert.equal(m.move(a.children[0].id, m.root.id), true);
  assert.equal(m.root.children.length, 3);
  assert.ok(m.undo());
  assert.equal(m.root.children.length, 2);
  assert.ok(m.redo());
  assert.equal(m.root.children.length, 3);
});

test('round-trip .mom preserva árvore, notas e ordem', () => {
  const m = sample();
  const back = readMom(writeMom(m));
  assert.equal(back.root.title, 'Raiz');
  assert.deepEqual(back.root.children.map((c) => c.title), ['A', 'B & <C>']);
  assert.equal(back.root.children[1].notes, 'nota\nlinha 2');
  assert.equal(back.root.children[0].children[0].title, 'A1');
});

test('layout: sem sobreposição entre irmãos, em todos os temas', () => {
  const m = new MindMap(createNode('R'));
  for (let i = 0; i < 6; i++) { const c = m.addChild(m.root.id, 'Filho ' + i); for (let j = 0; j < 3; j++) m.addChild(c.id, 'Neto ' + i + j); }
  for (const t of Object.keys(THEMES)) {
    const L = layoutMap(m, { theme: t });
    const bs = [...L.boxes.values()];
    for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
      const p = bs[i], q = bs[j];
      const overlap = p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.h && q.y < p.y + p.h;
      assert.ok(!overlap, `${t}: ${p.node.title} sobrepõe ${q.node.title}`);
    }
  }
});

test('exportadores geram saídas válidas', async () => {
  const m = sample();
  assert.match(toSVG(m), /<svg[\s\S]*B &amp; &lt;C&gt;/);
  assert.match(toMarkdown(m), /^# Raiz/);
  assert.match(toOPML(m), /B &amp; &lt;C&gt;/);
  assert.equal((await toPDF(m, { outline: true })).subarray(0, 5).toString(), '%PDF-');
  assert.equal((await toDOCX(m)).subarray(0, 2).toString(), 'PK');
});

test('importa Markdown: hierarquia, listas aninhadas e notas', () => {
  const { fromMarkdown } = require('../core/import');
  const m = fromMarkdown('# Projeto\n\n## Fase 1\n\nTexto da fase.\n\n- Tarefa A\n  - Sub A1\n- Tarefa B\n\n## Fase 2\n');
  assert.equal(m.root.title, 'Projeto');
  assert.deepEqual(m.root.children.map((c) => c.title), ['Fase 1', 'Fase 2']);
  const f1 = m.root.children[0];
  assert.equal(f1.notes, 'Texto da fase.');
  assert.deepEqual(f1.children.map((c) => c.title), ['Tarefa A', 'Tarefa B']);
  assert.equal(f1.children[0].children[0].title, 'Sub A1');
});

test('Markdown/OPML exportados voltam iguais (round-trip)', () => {
  const { fromMarkdown, fromOPML } = require('../core/import');
  const titles = (m) => { const r = []; m.walk((n, l) => r.push(l + ':' + n.title)); return r; };
  const m = sample();
  assert.deepEqual(titles(fromOPML(toOPML(m))), titles(m));
  assert.equal(fromOPML(toOPML(m)).root.children[1].notes, 'nota\nlinha 2');
  assert.deepEqual(titles(fromMarkdown(toMarkdown(m))), titles(m));
});

test('PDF com texto Unicode (acentos, grego, cirílico) não falha', async () => {
  const m = new MindMap(createNode('Ação • Ωmega • Привет'));
  m.addChild(m.root.id, 'café — naïve ≥ 3');
  const pdf = await toPDF(m, { outline: true });
  const s = pdf.toString('latin1');
  assert.match(s, /DejaVu/, 'fonte Unicode deve estar embutida');
  assert.doesNotMatch(s, /Helvetica/, 'não deve cair na fonte reserva');
});

test('marcadores, progresso e relações sobrevivem a .mom, OPML e Markdown', () => {
  const { fromMarkdown, fromOPML } = require('../core/import');
  const m = sample();
  const [a, b] = m.root.children;
  m.toggleMarker(a.id, 'star'); m.toggleMarker(a.id, 'p1'); m.toggleMarker(a.id, 'p1'); // liga e desliga
  m.update(a.id, { progress: 60 });
  const rel = m.addRelation(a.children[0].id, b.id, 'depende de');
  assert.equal(m.addRelation(a.children[0].id, b.id), null, 'sem relação duplicada');
  assert.equal(m.addRelation(a.id, a.id), null, 'sem auto-relação');

  const mom = readMom(writeMom(m));
  assert.deepEqual(mom.root.children[0].markers, ['star']);
  assert.equal(mom.root.children[0].progress, 60);
  assert.equal(mom.meta.relations[0].label, 'depende de');

  assert.deepEqual(fromOPML(toOPML(m)).root.children[0].markers, ['star']);
  assert.equal(fromOPML(toOPML(m)).root.children[0].progress, 60);
  const md = fromMarkdown(toMarkdown(m));
  assert.equal(md.root.children[0].title, 'A');
  assert.equal(md.root.children[0].progress, 60);

  m.remove(b.id);
  assert.equal(m.meta.relations.length, 0, 'remover o tópico remove suas relações');
  assert.ok(m.undo());
  assert.equal(m.meta.relations.length, 1, 'desfazer restaura a relação');
  assert.ok(rel);
});

test('layout com relações e marcadores: geometria válida e saídas geradas', async () => {
  const { layoutMap } = require('../core/layout');
  const m = sample();
  const [a, b] = m.root.children;
  m.toggleMarker(a.id, 'ok'); m.update(a.id, { progress: 30 });
  m.addRelation(a.children[0].id, b.id, 'ligação');
  const L = layoutMap(m);
  assert.equal(L.relations.length, 1);
  const g = L.relations[0].geo;
  for (const v of [g.a.x, g.a.y, g.b.x, g.b.y, g.c.x, g.c.y]) assert.ok(Number.isFinite(v));
  assert.ok(L.boxes.get(a.id).markerW > 0);
  assert.match(toSVG(m), /ligação/);
  assert.equal((await toPDF(m)).subarray(0, 5).toString(), '%PDF-');
  m.update(a.id, { collapsed: true });
  assert.equal(layoutMap(m).relations.length, 0, 'relação com tópico recolhido fica oculta');
});

test('writeMom lança erro de E/S em vez de fingir sucesso (regressão do writeZip)', () => {
  const fs = require('fs'), os = require('os'), path = require('path');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-'));
  fs.writeFileSync(path.join(dir, 'arquivo'), 'x');
  assert.throws(() => writeMom(sample(), path.join(dir, 'arquivo', 'a.mom')));
  const ok = path.join(dir, 'ok çã.mom');
  writeMom(sample(), ok);
  assert.equal(readMom(fs.readFileSync(ok)).root.title, 'Raiz');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('CLI: converte, rejeita formato/tema/arquivo inválidos com código de saída ≠ 0', () => {
  const { spawnSync } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-'));
  const cli = path.join(__dirname, '..', 'bin', 'mindcraft.js');
  const run = (...a) => spawnSync(process.execPath, [cli, ...a], { encoding: 'utf8' });
  const md = path.join(dir, 'a b.md'); fs.writeFileSync(md, '# T\n## A\n');
  for (const ext of ['pdf', 'docx', 'svg', 'opml', 'mom']) {
    const out = path.join(dir, 'saída.' + ext);
    assert.equal(run(md, out, '--theme', 'neon').status, 0, ext);
    assert.ok(fs.statSync(out).size > 50, ext);
  }
  assert.notEqual(run(md, path.join(dir, 'x.xyz')).status, 0, 'formato desconhecido');
  assert.notEqual(run(md, path.join(dir, 'x.pdf'), '--theme', 'inexistente').status, 0, 'tema inválido');
  fs.writeFileSync(path.join(dir, 'ruim.mom'), 'lixo');
  const r = run(path.join(dir, 'ruim.mom'), path.join(dir, 'x.pdf'));
  assert.notEqual(r.status, 0, 'arquivo corrompido'); assert.ok(r.stderr.length > 0, 'mensagem de erro');
  assert.notEqual(run(path.join(dir, 'nao-existe.mom'), path.join(dir, 'x.pdf')).status, 0, 'arquivo ausente');
  fs.rmSync(dir, { recursive: true, force: true });
});
