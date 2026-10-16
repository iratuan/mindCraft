'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const S = require('../core/study');
const { MindMap, createNode } = require('../core/model');
const { writeMom, readMom } = require('../core/mom');
const { backupBefore, backupDirFor, listBackups } = require('../core/backup');
const { logError } = require('../core/errorlog');
const { toStudyMarkdown, toStudyDOCX } = require('../core/report');

const TODAY = '2026-10-20';
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'mc-asst-'));

function base() {
  const m = new MindMap(createNode('Concurso'));
  const d1 = m.addChild(m.root.id, 'Disciplina 1'), d2 = m.addChild(m.root.id, 'Disciplina 2');
  const a = m.addChild(d1.id, 'A'), b = m.addChild(d1.id, 'B'), c = m.addChild(d2.id, 'C'), d = m.addChild(d2.id, 'D');
  return { m, d1, d2, a, b, c, d };
}

test('questões por dia: acumula, valida a data, normaliza lixo e alimenta o acerto semanal e a sequência', () => {
  let s = S.addQuestions(S.emptyStudy(), 10, 7, TODAY); s = S.addQuestions(s, 10, 7, TODAY);
  assert.deepEqual(s.qlog[TODAY], { done: 20, correct: 14 }); assert.deepEqual(s.q, { done: 20, correct: 14 });
  assert.throws(() => S.addQuestions(s, 5, 2, '2026-02-30'), /Data inválida/);
  assert.deepEqual(S.addQuestions(S.emptyStudy(), 5, 2).qlog, {}, 'sem data: só o total (compatível com o uso antigo)');
  assert.deepEqual(S.normalizeStudy({ qlog: { '2026-10-01': { done: 5, correct: 9 }, 'x': { done: 1, correct: 1 }, '2026-10-02': { done: 4, correct: 3 }, '2026-10-03': null } }).qlog, { '2026-10-02': { done: 4, correct: 3 } });
  assert.deepEqual(S.normalizeStudy({ q: { done: 3, correct: 1 } }).qlog, {}, 'arquivo antigo sem qlog continua válido');

  const { m, a, b } = base();
  m.mutateStudy(a.id, (x) => S.addQuestions(x, 10, 8, S.addDays(TODAY, -6)));   // dentro da janela de 7 dias
  m.mutateStudy(b.id, (x) => S.addQuestions(x, 10, 2, S.addDays(TODAY, -7)));   // fora
  const sum = S.summary(m, { today: TODAY });
  assert.deepEqual(sum.questions.week, { done: 10, correct: 8, accuracy: 0.8 });
  assert.deepEqual([sum.questions.done, sum.questions.correct], [20, 10], 'o total conta tudo');
  assert.equal(sum.streak, 0, 'há atividade em -6 e -7 mas não hoje/ontem');
  m.mutateStudy(a.id, (x) => S.addQuestions(x, 5, 5, S.addDays(TODAY, -1)));    // questões contam como atividade
  assert.equal(S.summary(m, { today: TODAY }).streak, 1);
});

test('pontos fracos: ≥ 5 questões e acerto < 70%, do pior para o melhor', () => {
  const { m, a, b, c, d } = base();
  m.mutateStudy(a.id, (x) => S.addQuestions(x, 10, 4, TODAY));   // 40%  -> fraco
  m.mutateStudy(b.id, (x) => S.addQuestions(x, 10, 7, TODAY));   // 70%  -> NÃO (limite exclusivo)
  m.mutateStudy(c.id, (x) => S.addQuestions(x, 4, 0, TODAY));    // 0% mas só 4 questões -> NÃO
  m.mutateStudy(d.id, (x) => S.addQuestions(x, 20, 6, TODAY));   // 30%  -> fraco (pior)
  const w = S.summary(m, { today: TODAY }).weak;
  assert.deepEqual(w.map((x) => [x.title, Math.round(x.accuracy * 100), x.done]), [['D', 30, 20], ['A', 40, 10]]);
  assert.deepEqual(w[0].path, ['Disciplina 2']);
  for (let i = 0; i < 12; i++) { const n = m.addChild(m.root.id, 'T' + i); m.mutateStudy(n.id, (x) => S.addQuestions(x, 10, 1, TODAY)); }
  assert.equal(S.summary(m, { today: TODAY }).weak.length, 8, 'no máximo 8');
});

test('agenda de 28 dias: hoje reúne atrasadas + de hoje; depois um dia por vez; além de 27 dias fica fora', () => {
  const { m, a, b, c, d } = base();
  m.mutateStudy(a.id, (x) => S.setNext(x, S.addDays(TODAY, -3)));   // atrasada
  m.mutateStudy(b.id, (x) => S.setNext(x, TODAY));                  // hoje
  m.mutateStudy(c.id, (x) => S.setNext(x, S.addDays(TODAY, 5)));
  m.mutateStudy(d.id, (x) => S.setNext(x, S.addDays(TODAY, 27)));   // último dia da agenda
  const n = m.addChild(m.root.id, 'Longe'); m.mutateStudy(n.id, (x) => S.setNext(x, S.addDays(TODAY, 28)));
  const ag = S.summary(m, { today: TODAY }).agenda;
  assert.equal(ag.length, 28); assert.equal(ag[0].date, TODAY); assert.equal(ag[27].date, S.addDays(TODAY, 27));
  assert.deepEqual(ag[0].items.map((x) => x.title).sort(), ['A', 'B']); assert.equal(ag[0].count, 2);
  assert.deepEqual(ag[5].items.map((x) => x.title), ['C']); assert.deepEqual(ag[27].items.map((x) => x.title), ['D']);
  assert.equal(ag.reduce((t, x) => t + x.count, 0), 4, 'o item do dia 28 não aparece');
  assert.deepEqual(ag[0].items.find((x) => x.title === 'A').overdue, 3);
  const up = S.summary(m, { today: TODAY }).upcoming.map((x) => x.title);
  assert.deepEqual(up, ['C'], 'a lista de 7 dias continua igual');
});

test('reordenar e mudar de nível: Alt+setas (modelo) — limites, desfazer, relações e estado recolhido', () => {
  const { m, d1, d2, a, b } = base();
  assert.equal(m.moveSibling(a.id, -1), false, 'primeiro não sobe'); assert.equal(m.moveSibling(b.id, +1), false, 'último não desce');
  assert.equal(m.moveSibling(a.id, +1), true); assert.deepEqual(m.find(d1.id).node.children.map((x) => x.title), ['B', 'A']);
  assert.equal(m.moveSibling(m.root.id, +1), false, 'a raiz não se move');
  assert.ok(m.undo()); assert.deepEqual(m.find(d1.id).node.children.map((x) => x.title), ['A', 'B']);
  // indent: B vira filho de A
  m.addRelation(b.id, d2.id, 'liga');
  assert.equal(m.indent(a.id), false, 'sem irmão anterior não rebaixa');
  m.update(a.id, { collapsed: true });
  assert.equal(m.indent(b.id), true); assert.deepEqual(m.find(a.id).node.children.map((x) => x.title), ['B']); assert.equal(m.find(a.id).node.collapsed, false, 'o pai abre para mostrar o filho');
  assert.equal(m.meta.relations.length, 1, 'relações sobrevivem à mudança de nível');
  // outdent: B volta a ser irmão de A, logo depois
  assert.equal(m.outdent(b.id), true); assert.deepEqual(m.find(d1.id).node.children.map((x) => x.title), ['A', 'B']);
  assert.equal(m.outdent(d1.id), false, 'disciplinas (filhos da raiz) não saem da raiz');
  assert.equal(m.outdent(a.id), true, 'um tópico sob a disciplina pode ser promovido a disciplina'); assert.ok(m.undo());
  assert.equal(m.outdent(m.root.id), false);
  // cada operação é um único desfazer
  const before = JSON.stringify(m.root); m.indent(b.id); m.undo(); assert.equal(JSON.stringify(m.root), before);
  // nenhum ciclo é possível: indent/outdent só mexem com irmão/avô
  let n = 0; m.walk(() => n++); assert.equal(n, 7);
});

test('backup: guarda a versão anterior antes de sobrescrever; respeita intervalo mínimo e limite; um diretório por arquivo', () => {
  const root = tmp(), dir = tmp();
  const f = path.join(dir, 'meu mapa ç.mom'), g = path.join(dir, 'outro.mom');
  assert.equal(backupBefore(f, root), null, 'arquivo novo: nada a guardar');
  const m1 = new MindMap(createNode('V1')); writeMom(m1, f); writeMom(m1, g);
  fs.writeFileSync(path.join(dir, 'vazio.mom'), ''); assert.equal(backupBefore(path.join(dir, 'vazio.mom'), root), null, 'arquivo vazio não vira backup');
  const t0 = Date.parse('2026-10-20T10:00:00Z');
  const b1 = backupBefore(f, root, { now: t0 });
  assert.ok(b1 && fs.existsSync(b1)); assert.equal(readMom(fs.readFileSync(b1)).root.title, 'V1', 'o backup é a versão anterior');
  m1.root.title = 'V2'; writeMom(m1, f);
  assert.equal(backupBefore(f, root, { now: t0 + 60_000 }), null, 'menos de 10 min: não duplica');
  const b2 = backupBefore(f, root, { now: t0 + 11 * 60_000 }); assert.ok(b2 && b2 !== b1); assert.equal(readMom(fs.readFileSync(b2)).root.title, 'V2');
  assert.notEqual(backupDirFor(root, f), backupDirFor(root, g), 'um diretório por arquivo');
  assert.equal(fs.readFileSync(path.join(backupDirFor(root, f), 'origem.txt'), 'utf8'), path.resolve(f));
  for (let i = 0; i < 6; i++) backupBefore(f, root, { now: t0 + (20 + i * 15) * 60_000, keep: 3 });
  const l = listBackups(backupDirFor(root, f)); assert.equal(l.length, 3, 'mantém só os 3 mais novos'); assert.ok(l[0].mtimeMs > l[2].mtimeMs);
  assert.equal(fs.readFileSync(f).length > 0, true, 'o arquivo original nunca é tocado pelo backup');
  fs.rmSync(root, { recursive: true, force: true }); fs.rmSync(dir, { recursive: true, force: true });
});

test('registro de erros: acrescenta linhas, limita o tamanho e nunca lança', () => {
  const d = tmp();
  assert.equal(logError(d, 'falhou\n com quebra'), true);
  const f = path.join(d, 'erros.log'); assert.match(fs.readFileSync(f, 'utf8'), /^\d{4}-\d\d-\d\dT[\d:.]+Z\tfalhou com quebra\n$/);
  for (let i = 0; i < 200; i++) logError(d, 'x'.repeat(100) + i, { max: 4000 });
  assert.ok(fs.statSync(f).size < 6000, 'tamanho limitado: ' + fs.statSync(f).size); assert.match(fs.readFileSync(f, 'utf8').split('\n').slice(-2)[0], /199$/, 'a linha mais nova fica');
  assert.equal(fs.readFileSync(f, 'utf8').split('\n')[0].includes('\t'), true, 'recomeça numa linha inteira');
  assert.equal(logError(path.join(f, 'dentro-de-arquivo'), 'x'), false, 'caminho impossível: devolve false, não lança');
  assert.equal(logError(d, 'a'.repeat(5000)), true); fs.rmSync(d, { recursive: true, force: true });
});

test('relatório inclui acerto da semana e pontos fracos (Markdown e Word)', async () => {
  const { m, a, c } = base();
  m.mutateStudy(a.id, (x) => S.addQuestions(x, 10, 4, TODAY)); m.mutateStudy(c.id, (x) => S.addQuestions(x, 10, 9, TODAY));
  const md = toStudyMarkdown(m, { today: TODAY });
  assert.match(md, /últimos 7 dias: 13\/20 \(65%\)/); assert.match(md, /## Pontos fracos/); assert.match(md, /Disciplina 1 › A — 4\/10 \(40%\)/); assert.doesNotMatch(md, /Disciplina 2 › C — 9\/10/);
  const doc = new (require('adm-zip'))(await toStudyDOCX(m, { today: TODAY })).getEntry('word/document.xml').getData().toString();
  assert.match(doc, /Pontos fracos/); assert.match(doc, /4\/10 \(40%\)/);
});

test('autoLevels: escolhe o maior nível que cabe em N tópicos visíveis (mínimo 1) e é uma ação desfazível', () => {
  const m = new MindMap(createNode('R'));
  for (let i = 0; i < 5; i++) { const d = m.addChild(m.root.id, 'D' + i); for (let j = 0; j < 40; j++) { const t = m.addChild(d.id, 'T' + i + '.' + j); if (j < 4) m.addChild(t.id, 'S' + j); } }
  m._undo.length = 0;
  const vis = () => [...require('../core/layout').layoutMap(m).boxes.values()].length;
  assert.equal(m.autoLevels(120), 1); assert.equal(vis(), 6, '5 disciplinas + raiz');
  assert.ok(m.undo()); assert.equal(vis(), 1 + 5 + 200 + 20, 'desfazer reabre tudo');
  assert.equal(m.autoLevels(220), 2, 'cabe até o nível 2 (206 ≤ 220 < 226)'); assert.equal(vis(), 206);
  assert.equal(m.autoLevels(10000), 3, 'tudo cabe: nada é recolhido'); assert.equal(vis(), 226);
  assert.equal(new MindMap(createNode('só raiz')).autoLevels(), 1, 'mapa mínimo não quebra');
});
