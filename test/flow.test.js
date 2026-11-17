'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { MindMap, createNode } = require('../core/components/model');
const f = require('../core/components/flow');
const { layoutFlow } = require('../core/components/flow-layout');
const { toFlowMarkdown } = require('../core/formats/flow-export');
const { writeMom } = require('../core/formats/mom');
const { readMom } = require('../core/formats/mom');

const byTitle = (m, t) => { let r = null; m.walk((n) => { if (n.title === t && !r) r = n; }); return r; };

/** Início → Ler → Decisão (Sim: Avança → Fim; Não: Revisa → volta a Ler). */
function sampleFlow() {
  const m = f.createFlow('Estudo');
  const ler = f.insertStepAfter(m, m.root.id, { title: 'Ler a lei' });
  const dec = f.insertStepAfter(m, ler.id, { type: 'decision', title: 'Acertou?' });
  const sim = f.addBranch(m, dec.id, 'Sim', { title: 'Avançar' });
  const nao = f.addBranch(m, dec.id, 'Não', { title: 'Revisar' });
  f.insertStepAfter(m, sim.id, { type: 'end', title: 'Fim' });
  m.addRelation(nao.id, ler.id, 'volta');   // seta extra: laço de volta ao passo de leitura
  return { m, ler, dec, sim, nao };
}

test('fluxo: cria com início, distingue de mapa mental e insere passos na sequência', () => {
  const m = f.createFlow('X');
  assert.ok(f.isFlow(m));
  assert.strictEqual(m.root.flowType, 'start');
  assert.strictEqual(f.isFlow(new MindMap(createNode('Mapa'))), false);
  const a = f.insertStepAfter(m, m.root.id, { title: 'A' });
  const b = f.insertStepAfter(m, m.root.id, { title: 'B' });   // entra entre o início e A
  assert.deepStrictEqual(m.root.children.map((c) => c.title), ['B']);
  assert.deepStrictEqual(b.children.map((c) => c.title), ['A']);
  assert.strictEqual(a.title, 'A');
});

test('decisão: exige ramo, aceita no máximo 2 ramos e rótulos únicos', () => {
  const m = f.createFlow();
  const d = f.insertStepAfter(m, m.root.id, { type: 'decision', title: 'Q?' }) ;
  assert.throws(() => f.insertStepAfter(m, d.id, { title: 'sem ramo' }), /ramo/);
  f.addBranch(m, d.id, 'Sim');
  assert.throws(() => f.addBranch(m, d.id, 'sim'), /Já existe/);
  f.addBranch(m, d.id, 'Não');
  assert.throws(() => f.addBranch(m, d.id, 'Talvez'), /no máximo 2/);
  assert.throws(() => f.addBranch(m, m.root.id, 'Sim'), /Só uma decisão/);
});

test('fim não tem saída; só um início; fim só no final', () => {
  const m = f.createFlow();
  const e = f.insertStepAfter(m, m.root.id, { type: 'end', title: 'Fim' });
  assert.throws(() => f.insertStepAfter(m, e.id, { title: 'depois do fim' }), /não tem saída/);
  assert.throws(() => f.insertStepAfter(m, m.root.id, { type: 'start' }), /só um início/);
  const a = f.insertStepAfter(m, m.root.id, { title: 'A' });
  assert.throws(() => f.setFlowType(m, a.id, 'end'), /não tem saída/, 'passo com próximo não vira fim');
});

test('desfazer reverte a inserção de passo', () => {
  const { m, sim } = sampleFlow();
  const before = JSON.stringify(m.root);
  f.insertStepAfter(m, sim.id, { title: 'Extra' });
  assert.strictEqual(sim.children[0].title, 'Extra', 'o passo novo entra entre o ramo Sim e o próximo passo');
  assert.strictEqual(sim.children[0].children[0].title, 'Fim', 'o Fim continua ligado depois do passo novo');
  assert.ok(m.canUndo());
  m.undo();
  // desfazer restaura a árvore a partir do snapshot: busca o nó de novo (a referência antiga não vale mais)
  assert.strictEqual(byTitle(m, 'Avançar').children[0].title, 'Fim', 'o passo novo some ao desfazer');
  assert.strictEqual(JSON.stringify(m.root), before);
});

test('excluir passo sem ramos religa o anterior ao próximo; decisão sai com os ramos', () => {
  const m = f.createFlow();
  const a = f.insertStepAfter(m, m.root.id, { title: 'A' });
  const b = f.insertStepAfter(m, a.id, { title: 'B' });
  f.removeStep(m, a.id);
  assert.deepStrictEqual(m.root.children.map((c) => c.title), ['B']);
  assert.ok(b);
  const { m: m2, dec } = sampleFlow();
  const r = f.removeStep(m2, dec.id);
  assert.strictEqual(r.subtree, true);
  assert.strictEqual(byTitle(m2, 'Avançar'), null, 'os ramos saem junto com a decisão');
  assert.strictEqual(m2.meta.relations.length, 0, 'setas que apontavam para o subfluxo somem');
});

test('validação: decisão com um ramo, passo sem saída e início ausente são avisados', () => {
  const m = f.createFlow();
  const d = f.insertStepAfter(m, m.root.id, { type: 'decision', title: 'Q?' });
  f.addBranch(m, d.id, 'Sim', { title: 'Só um' });
  const msgs = f.validateFlow(m).map((w) => w.message).join(' | ');
  assert.match(msgs, /Decisão "Q\?" com 1 ramo/);
  assert.match(msgs, /Passo "Só um" sem saída/);
  const sem = new MindMap(createNode('Sem início'));
  sem.meta.kind = 'flow';
  assert.match(f.validateFlow(sem).map((w) => w.message).join(' '), /não tem início/);
  const ok = sampleFlow().m;
  assert.strictEqual(f.validateFlow(ok).filter((w) => w.level === 'error').length, 0);
});

test('caminhos: decisão gera um caminho por ramo; laço termina o caminho e não repete', () => {
  const { m } = sampleFlow();
  const { paths, truncated } = f.listPaths(m);
  assert.strictEqual(truncated, false);
  const texts = paths.map((p) => p.map((s) => s.via || '-').join('/'));
  assert.ok(texts.some((t) => t.includes('Sim')), 'caminho pelo Sim');
  const nao = paths.find((p) => p.some((s) => s.via === 'Não'));
  assert.ok(nao, 'caminho pelo Não');
  assert.ok(nao[nao.length - 1].loopTo, 'o Não volta à leitura e o caminho para ali');
  assert.ok(paths.length >= 2 && paths.length < 10, 'caminhos finitos');
});

test('caminhos: o teto corta a lista e avisa', () => {
  const m = f.createFlow();
  let cur = m.root;
  for (let i = 0; i < 4; i++) {
    const d = f.insertStepAfter(m, cur.id, { type: 'decision', title: `D${i}` });
    f.addBranch(m, d.id, 'Sim', { title: `s${i}` });
    f.addBranch(m, d.id, 'Não', { title: `n${i}` });
    cur = byTitle(m, `s${i}`);
  }
  const r = f.listPaths(m, { max: 3 });
  assert.strictEqual(r.paths.length, 3);
  assert.strictEqual(r.truncated, true);
});

test('layout: decisão abre os ramos lado a lado, filhos abaixo do pai, caixas sem sobreposição', () => {
  const { m, dec, sim, nao } = sampleFlow();
  const L = layoutFlow(m);
  const d = L.boxes.get(dec.id), s = L.boxes.get(sim.id), n = L.boxes.get(nao.id);
  assert.ok(s.y > d.y + d.h - 1 && n.y > d.y + d.h - 1, 'ramos abaixo da decisão');
  assert.ok(Math.abs(s.y - n.y) < 1, 'ramos na mesma altura');
  assert.ok(s.x + s.w <= n.x || n.x + n.w <= s.x, 'ramos lado a lado, sem sobrepor');
  const list = [...L.boxes.values()];
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j];
    const over = a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
    assert.ok(!over, `${a.title} sobrepõe ${b.title}`);
  }
  assert.ok(L.relations.length === 1 && L.edges.length === list.length - 1, 'ligações de sequência: uma por passo (menos o início)');
});

test('layout: recolher o fluxo não é usado; ramos maiores não invadem os vizinhos', () => {
  const m = f.createFlow();
  const d = f.insertStepAfter(m, m.root.id, { type: 'decision', title: 'Q' });
  const a = f.addBranch(m, d.id, 'Sim', { title: 'Um passo com um título bem longo que quebra em várias linhas do texto' });
  const b = f.addBranch(m, d.id, 'Não', { title: 'B' });
  f.insertStepAfter(m, a.id, { title: 'A2' });
  f.insertStepAfter(m, a.id, { title: 'A3' });
  f.insertStepAfter(m, b.id, { title: 'B2' });
  const L = layoutFlow(m);
  const ba = L.boxes.get(a.id), bb = L.boxes.get(b.id);
  assert.ok(ba.x + ba.w <= bb.x || bb.x + bb.w <= ba.x, 'o ramo Sim não entra no ramo Não');
});

test('.mom: tipo do passo e rótulo do ramo sobrevivem a salvar e abrir', () => {
  const { m, dec, sim } = sampleFlow();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-flow-'));
  const file = path.join(dir, 'fluxo.mom');
  writeMom(m, file);
  const back = readMom(fs.readFileSync(file));
  assert.ok(f.isFlow(back), 'a raiz continua sendo início');
  const d2 = byTitle(back, dec.title);
  assert.strictEqual(d2.flowType, 'decision');
  assert.strictEqual(byTitle(back, sim.title).branchLabel, 'Sim');
  assert.strictEqual(back.meta.relations.length, 1);
  const plain = new MindMap(createNode('Mapa'));
  plain.addChild(plain.root.id, 'Filho');
  writeMom(plain, path.join(dir, 'mapa.mom'));
  const back2 = readMom(fs.readFileSync(path.join(dir, 'mapa.mom')));
  assert.strictEqual(back2.root.flowType, undefined, 'mapa mental não ganha tipo de fluxo');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('exportação Markdown: passos numerados, notas, ramos, caminhos e pontos de atenção', () => {
  const { m, sim } = sampleFlow();
  byTitle(m, 'Ler a lei').notes = 'Anotar o artigo 5º.';
  const md = toFlowMarkdown(m);
  assert.match(md, /### 1 Estudo|## Passos/);
  assert.match(md, /Anotar o artigo 5º\./);
  assert.match(md, /\*Ramo: Sim\*/);
  assert.match(md, /## Caminhos possíveis/);
  assert.match(md, /↺/, 'laço marcado');
  assert.match(md, /seta extra/);
  assert.ok(sim);
  assert.doesNotMatch(toFlowMarkdown(m, { notes: false }), /artigo 5º/, 'sem notas quando desligado');
});
