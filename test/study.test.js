'use strict';
const test = require('node:test');
const assert = require('node:assert');
const S = require('../core/study');
const { MindMap, createNode } = require('../core/model');
const { readMom, writeMom } = require('../core/mom');
const { layoutMap } = require('../core/layout');
const { toSVG } = require('../core/svg');
const { toPDF } = require('../core/export');
const { toStudyMarkdown, toStudyDOCX } = require('../core/report');
const { textToNodes, fromEdital } = require('../core/edital');

const TODAY = '2026-10-20';

/** Mapa de conferência manual:
 *  Português: Crase (peso 2, 100%), Regência (peso 1, 50%)   => (2*100+1*50)/3 = 83,33%
 *  Direito:   Princípios (sem progresso => 0), Direitos (100%) => (0+100)/2 = 50%
 *  Geral (ponderado): (200+50+0+100)/5 = 70% */
function dataset() {
  const m = new MindMap(createNode('Concurso X'));
  const pt = m.addChild(m.root.id, 'Português'), dc = m.addChild(m.root.id, 'Direito');
  const crase = m.addChild(pt.id, 'Crase'), reg = m.addChild(pt.id, 'Regência');
  const princ = m.addChild(dc.id, 'Princípios'), dir = m.addChild(dc.id, 'Direitos');
  m.update(crase.id, { progress: 100 }); m.update(reg.id, { progress: 50 }); m.update(dir.id, { progress: 100 });
  m.mutateStudy(crase.id, (s) => S.setWeight(s, 2));
  return { m, pt, dc, crase, reg, princ, dir };
}

test('datas: aritmética em UTC (virada de mês/ano, bissexto, datas inexistentes)', () => {
  assert.equal(S.addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(S.addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(S.addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(S.addDays('2027-02-28', 1), '2027-03-01');
  assert.equal(S.addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(S.diffDays('2026-10-20', '2026-12-25'), 66);
  assert.equal(S.diffDays('2026-10-20', '2026-10-19'), -1);
  for (const bad of ['2026-02-30', '2026-13-01', '20-10-2026', '', null, undefined, '2026-1-1']) assert.equal(S.isDateStr(bad), false, String(bad));
  assert.throws(() => S.addDays('lixo', 1));
  assert.match(S.todayStr(new Date(2026, 0, 5)), /^2026-01-05$/);
});

test('revisão espaçada: 1 → 7 → 15 → 30 → 60 → 120 dias, erro volta ao início', () => {
  let s = S.emptyStudy();
  s = S.reviewed(s, { today: '2026-10-01' });
  assert.deepEqual([s.stage, s.next], [0, '2026-10-02']);
  const expected = [['2026-10-02', 1, '2026-10-09'], ['2026-10-09', 2, '2026-10-24'], ['2026-10-24', 3, '2026-11-23'], ['2026-11-23', 4, '2027-01-22'], ['2027-01-22', 5, '2027-05-22']];
  for (const [day, stage, next] of expected) { s = S.reviewed(s, { today: day }); assert.deepEqual([s.stage, s.next], [stage, next], day); }
  s = S.reviewed(s, { today: '2027-05-22' }); // além do último intervalo: permanece em 120 dias
  assert.equal(s.next, S.addDays('2027-05-22', 120));
  s = S.reviewed(s, { today: '2027-09-19', ok: false }); // errou: recomeça
  assert.deepEqual([s.stage, s.next], [0, '2027-09-20']);
  assert.equal(s.reviews.length, 8);
});

test('revisão no mesmo dia é idempotente; "errei" prevalece sobre "acertei" do mesmo dia', () => {
  let s = S.reviewed(S.emptyStudy(), { today: '2026-10-01' });
  s = S.reviewed(s, { today: '2026-10-02' });
  const before = JSON.stringify(s);
  assert.equal(JSON.stringify(S.reviewed(s, { today: '2026-10-02' })), before, 'repetir não infla o estágio');
  const f = S.reviewed(s, { today: '2026-10-02', ok: false });
  assert.deepEqual([f.stage, f.next, f.reviews.length], [0, '2026-10-03', 2]);
  assert.equal(JSON.stringify(S.reviewed(f, { today: '2026-10-02', ok: true })), JSON.stringify(f), 'acertei não desfaz o errei');
  assert.throws(() => S.reviewed(s, { today: 'ontem' }));
});

test('tempo e questões: validações e acumulação', () => {
  let s = S.addTime(S.emptyStudy(), TODAY, 45.4);
  s = S.addTime(s, TODAY, 15);
  assert.equal(s.log[TODAY], 60);
  assert.equal(S.totalMinutes(s), 60);
  for (const bad of [0, -5, NaN, Infinity, '30']) assert.throws(() => S.addTime(s, TODAY, bad), String(bad));
  assert.throws(() => S.addTime(s, TODAY, 1400), /24 h/);
  assert.equal(S.addTime(s, TODAY, 1380).log[TODAY], 1440);
  let q = S.addQuestions(S.emptyStudy(), 20, 15); q = S.addQuestions(q, 10, 10);
  assert.deepEqual(q.q, { done: 30, correct: 25 });
  for (const [d, c] of [[0, 0], [5, 6], [-1, 0], [5, -1], [2.5, 1], [5, 2.5]]) assert.throws(() => S.addQuestions(q, d, c), `${d}/${c}`);
  assert.throws(() => S.setWeight(S.emptyStudy(), 0)); assert.throws(() => S.setWeight(S.emptyStudy(), 6)); assert.throws(() => S.setWeight(S.emptyStudy(), 2.5));
  assert.equal(S.setNext(S.emptyStudy(), '2026-11-01').next, '2026-11-01');
  assert.throws(() => S.setNext(S.emptyStudy(), '2026-02-30'));
});

test('normalizeStudy rejeita lixo vindo de arquivo, sem lançar', () => {
  const s = S.normalizeStudy({ weight: 9, log: { '2026-02-30': 10, '2026-10-01': -4, '2026-10-02': 99999, '2026-10-03': 25.6 }, q: { done: 3, correct: 5 }, reviews: [{ d: 'x' }, { d: '2026-10-01', ok: false }, null], stage: -7, next: 'amanhã', last: 3 });
  assert.deepEqual(s, { weight: 1, log: { '2026-10-03': 26 }, q: { done: 0, correct: 0 }, qlog: {}, reviews: [{ d: '2026-10-01', ok: false }], stage: -1, next: null, last: null });
  assert.deepEqual(S.normalizeStudy(null), S.emptyStudy());
  assert.deepEqual(S.normalizeStudy('x'), S.emptyStudy());
});

test('resumo: progresso ponderado por disciplina e geral conferidos à mão', () => {
  const { m, pt, dc } = dataset();
  const s = S.summary(m, { today: TODAY });
  const byId = Object.fromEntries(s.disciplines.map((d) => [d.id, d]));
  assert.ok(Math.abs(byId[pt.id].progress - 250 / 3) < 1e-9, 'Português 83,33%');
  assert.equal(byId[dc.id].progress, 50);
  assert.equal(s.overall, 70);
  assert.equal(s.totalLeaves, 4); assert.equal(s.doneLeaves, 2);
  assert.deepEqual([byId[pt.id].leaves, byId[pt.id].done, byId[dc.id].leaves, byId[dc.id].done], [2, 1, 2, 1]);
  assert.equal(S.rollup(m.root), 70);
  assert.equal(S.rollup(createNode('vazio')), null);
});

test('resumo: tempo, questões, sequência, revisões vencidas e próximos dias', () => {
  const { m, pt, crase, reg, princ } = dataset();
  const yest = S.addDays(TODAY, -1), old = S.addDays(TODAY, -9);
  m.mutateStudy(crase.id, (s) => S.addTime(S.addTime(s, TODAY, 60), yest, 30));
  m.mutateStudy(reg.id, (s) => S.addTime(s, old, 100));                    // fora da janela de 7 dias
  m.mutateStudy(crase.id, (s) => S.addQuestions(s, 20, 15));
  m.mutateStudy(princ.id, (s) => S.addQuestions(s, 10, 5));
  m.mutateStudy(crase.id, (s) => S.reviewed(s, { today: TODAY }));          // próxima = amanhã
  m.mutateStudy(reg.id, (s) => S.setNext(s, S.addDays(TODAY, -3)));         // 3 dias de atraso
  m.mutateStudy(princ.id, (s) => S.setNext(s, TODAY));                      // vence hoje
  const s = S.summary(m, { today: TODAY });
  assert.deepEqual(s.minutes, { total: 190, today: 60, week: 90 });
  assert.deepEqual(s.week.map((d) => d.minutes), [0, 0, 0, 0, 0, 30, 60], 'últimos 7 dias, do mais antigo (hoje-6) até hoje');
  assert.equal(s.week[6].date, TODAY); assert.equal(s.week[0].date, S.addDays(TODAY, -6));
  assert.deepEqual([s.questions.done, s.questions.correct], [30, 20]);
  assert.ok(Math.abs(s.questions.accuracy - 20 / 30) < 1e-9);
  assert.equal(s.reviewsToday, 1);
  assert.equal(s.streak, 2, 'hoje + ontem; o dia -9 não conta (há lacuna)');
  assert.deepEqual(s.due.map((d) => [d.title, d.overdue]), [['Regência', 3], ['Princípios', 0]], 'mais atrasada primeiro');
  assert.deepEqual(s.due[0].path, ['Português']);
  assert.deepEqual(s.upcoming.map((d) => [d.title, d.next]), [['Crase', S.addDays(TODAY, 1)]]);
  const ptRow = s.disciplines.find((d) => d.id === pt.id);
  assert.deepEqual([ptRow.minutes, ptRow.minWeek, ptRow.due, ptRow.qDone], [190, 90, 1, 20]);
});

test('sequência: começa em ontem se hoje ainda está vazio; zera com lacuna', () => {
  const { m, crase } = dataset();
  assert.equal(S.summary(m, { today: TODAY }).streak, 0);
  for (const d of [-1, -2, -3]) m.mutateStudy(crase.id, (s) => S.addTime(s, S.addDays(TODAY, d), 10));
  assert.equal(S.summary(m, { today: TODAY }).streak, 3);
  m.mutateStudy(crase.id, (s) => S.addTime(s, S.addDays(TODAY, -5), 10)); // lacuna em -4
  assert.equal(S.summary(m, { today: TODAY }).streak, 3);
});

test('prova: contagem regressiva e plano de tópicos por dia', () => {
  const { m } = dataset();
  assert.equal(S.summary(m, { today: TODAY }).exam, null);
  m.setExam({ name: 'TRF 2026', date: '2026-10-30' });
  const s = S.summary(m, { today: TODAY });
  assert.deepEqual(s.exam, { name: 'TRF 2026', date: '2026-10-30', daysLeft: 10 });
  assert.deepEqual(s.plan, { daysLeft: 10, pendingTopics: 2, topicsPerDay: 0.2 });
  assert.equal(S.summary(m, { today: '2026-10-30' }).plan, null, 'no dia da prova não há plano');
  assert.equal(S.summary(m, { today: '2026-11-02' }).exam.daysLeft, -3);
  assert.throws(() => m.setExam({ name: 'x', date: '2026-02-30' }));
  assert.throws(() => m.setExam({ name: 'x' }));
  m.setExam(null); assert.equal(m.meta.exam, undefined);
});

test('modelo: erro de validação não altera o mapa nem cria ponto de desfazer', () => {
  const { m, crase } = dataset();
  const before = JSON.stringify(m.root), undos = m._undo.length;
  assert.throws(() => m.mutateStudy(crase.id, (s) => S.addQuestions(s, 3, 9)));
  assert.equal(JSON.stringify(m.root), before); assert.equal(m._undo.length, undos);
  m.mutateStudy(crase.id, (s) => S.addTime(s, TODAY, 20));
  assert.equal(m.find(crase.id).node.study.log[TODAY], 20);
  assert.ok(m.undo()); assert.equal(m.find(crase.id).node.study.log[TODAY], undefined);
  assert.equal(m.mutateStudy('inexistente', (s) => s), false);
});

test('.mom preserva estudo e prova; arquivo adulterado é normalizado', () => {
  const { m, crase } = dataset();
  m.mutateStudy(crase.id, (s) => S.reviewed(S.addTime(s, TODAY, 40), { today: TODAY }));
  m.setExam({ name: 'OAB', date: '2026-12-10' });
  const back = readMom(writeMom(m));
  const c = back.find(crase.id).node;
  assert.equal(c.study.weight, 2); assert.equal(c.study.log[TODAY], 40); assert.equal(c.study.next, S.addDays(TODAY, 1));
  assert.deepEqual(back.meta.exam, { name: 'OAB', date: '2026-12-10' });
  assert.equal(c.progress, 100);
  // adultera o arquivo: peso absurdo e data inválida de prova
  const AdmZip = require('adm-zip');
  const z = new AdmZip(writeMom(m));
  const nodes = JSON.parse(z.getEntry('nodes.json').getData().toString());
  nodes.find((n) => n.id === crase.id).mc.study.weight = 99; nodes.find((n) => n.id === crase.id).mc.progress = 500;
  z.updateFile('nodes.json', Buffer.from(JSON.stringify(nodes)));
  const doc = JSON.parse(z.getEntry('document.json').getData().toString()); doc.mcExam = { name: 'x', date: '2026-02-30' };
  z.updateFile('document.json', Buffer.from(JSON.stringify(doc)));
  const bad = readMom(z.toBuffer());
  assert.equal(bad.find(crase.id).node.study.weight, 1); assert.equal(bad.find(crase.id).node.progress, 100);
  assert.equal(bad.meta.exam, undefined);
});

test('layout: progresso agregado no pai (azul) e selo de revisão, inclusive em ramo recolhido', () => {
  const { m, pt, dc, crase, reg } = dataset();
  m.update(crase.id, { progress: 100 });
  m.mutateStudy(reg.id, (s) => S.setNext(s, S.addDays(TODAY, -1)));
  m.mutateStudy(crase.id, (s) => S.setNext(s, TODAY));
  let L = layoutMap(m, { today: TODAY });
  const bPt = L.boxes.get(pt.id);
  assert.ok(Math.abs(bPt.progress - 250 / 3) < 1e-9); assert.equal(bPt.progressAuto, true);
  assert.equal(L.boxes.get(crase.id).progressAuto, false);
  assert.equal(L.boxes.get(crase.id).due, 1); assert.equal(bPt.due, 0, 'pai expandido não soma os filhos');
  m.update(pt.id, { collapsed: true });
  L = layoutMap(m, { today: TODAY });
  assert.equal(L.boxes.get(pt.id).due, 2, 'recolhido soma as revisões dos descendentes');
  const svg = toSVG(m, { today: TODAY });
  assert.match(svg, /4c9aff/); assert.match(svg, />2<\/text>/);
  assert.equal(L.boxes.get(dc.id).due, 0);
  return toPDF(m, { today: TODAY }).then((b) => assert.equal(b.subarray(0, 5).toString(), '%PDF-'));
});

test('relatório Markdown e Word trazem os mesmos números do resumo', async () => {
  const { m, crase, reg } = dataset();
  m.mutateStudy(crase.id, (s) => S.addQuestions(S.addTime(s, TODAY, 75), 20, 15));
  m.mutateStudy(reg.id, (s) => S.setNext(s, S.addDays(TODAY, -2)));
  m.setExam({ name: 'Concurso X', date: '2026-10-30' });
  const md = toStudyMarkdown(m, { today: TODAY });
  assert.match(md, /Progresso geral: \*\*70%\*\* \(2 de 4 tópicos concluídos\)/);
  assert.match(md, /Tempo estudado: 1 h 15 min no total/);
  assert.match(md, /Questões: 20 feitas, 15 acertos \(75%\)/);
  assert.match(md, /faltam 10 dias/);
  assert.match(md, /\| Português \| 83,3% \| 1\/2 \| 1 h 15 min \| 15\/20 \(75%\) \| 1 \|/);
  assert.match(md, /Português › Regência — prevista para 18\/10\/2026 \(\*\*2 dias de atraso\*\*\)/);
  const buf = await toStudyDOCX(m, { today: TODAY });
  const doc = new (require('adm-zip'))(buf).getEntry('word/document.xml').getData().toString();
  assert.match(doc, /Relatório de estudos/); assert.match(doc, /83,3%/); assert.match(doc, /2 dias de atraso/);
});

test('modelo: operações em lote — undo único, rollback em erro, topo/cópia/mover', () => {
  const m = new MindMap(createNode('R'));
  const a = m.addChild(m.root.id, 'A'), b = m.addChild(m.root.id, 'B'), c = m.addChild(m.root.id, 'C'), a1 = m.addChild(a.id, 'A1');
  m.addRelation(a1.id, c.id, 'rel');
  assert.deepEqual(m.topLevel([a1.id, a.id, m.root.id, c.id]).map((n) => n.title), ['A', 'C'], 'sem filhos redundantes, sem raiz, na ordem do documento');
  assert.equal(m.removeMany([a.id, a1.id, c.id]), 2);
  assert.deepEqual(m.root.children.map((n) => n.title), ['B']); assert.equal(m.meta.relations.length, 0);
  assert.ok(m.undo()); assert.deepEqual(m.root.children.map((n) => n.title), ['A', 'B', 'C']); assert.equal(m.meta.relations.length, 1, 'um único desfazer restaura tudo');
  assert.equal(m.moveMany([c.id, a.id], b.id), true);
  assert.deepEqual(m.find(b.id).node.children.map((n) => n.title), ['A', 'C'], 'ordem do documento preservada');
  assert.equal(m.moveMany([b.id], a.id), false, 'não move para dentro de si mesmo');
  const snap = JSON.stringify(m.root);
  assert.throws(() => m.batch(() => { m.addChild(m.root.id, 'X'); throw new Error('falha'); }));
  assert.equal(JSON.stringify(m.root), snap, 'rollback total');
  m.updateMany([a.id, c.id], { progress: 30 });
  assert.deepEqual([m.find(a.id).node.progress, m.find(c.id).node.progress], [30, 30]);
  m.toggleMarkerMany([a.id, c.id], 'star'); assert.deepEqual(m.find(a.id).node.markers, ['star']);
  m.toggleMarkerMany([a.id, c.id], 'star'); assert.deepEqual(m.find(a.id).node.markers, [], 'todos têm => remove de todos');
  m.toggleMarker(a.id, 'ok'); m.toggleMarkerMany([a.id, c.id], 'ok');
  assert.deepEqual([m.find(a.id).node.markers, m.find(c.id).node.markers], [['ok'], ['ok']], 'misto => completa os que faltam');
});

test('cópia de subárvore: ids novos, descarta histórico de estudo, não aliasa o original', () => {
  const { m, pt, crase } = dataset();
  m.mutateStudy(crase.id, (s) => S.addTime(s, TODAY, 10));
  const copy = MindMap.cloneSubtree(m.find(pt.id).node);
  const ids = new Set(); m.walk((n) => ids.add(n.id));
  const copyIds = []; (function w(n) { copyIds.push(n.id); n.children.forEach(w); })(copy);
  assert.ok(copyIds.every((i) => !ids.has(i)), 'todos os ids são novos');
  assert.equal(copy.children[0].study, undefined, 'sem histórico de estudo');
  assert.equal(copy.children[0].progress, 100, 'mantém o conteúdo (progresso)');
  copy.title = 'mudou'; assert.equal(m.find(pt.id).node.title, 'Português');
  const kept = MindMap.cloneSubtree(m.find(pt.id).node, { keepStudy: true });
  assert.equal(kept.children[0].study.log[TODAY], 10);
  const added = m.addSubtree(m.root.id, copy); assert.equal(added.title, 'mudou'); assert.ok(m.undo());
  assert.equal(m.root.children.length, 2);
});

test('edital: numeração hierárquica, disciplinas, itens a), quebras de linha do PDF', () => {
  const txt = 'LÍNGUA PORTUGUESA\n1 Compreensão e interpretação de textos.\n2 Ortografia oficial; acentuação\ngráfica.\n2.1 Emprego do sinal indicativo de crase\n3 Regência verbal\n   a) verbos transitivos\n   b) verbos intransitivos\nDIREITO CONSTITUCIONAL:\n1. Princípios fundamentais\n1.1 Direitos e garantias\n2. Organização do Estado';
  const shape = (ns) => ns.map((n) => [n.title, shape(n.children)]);
  assert.deepEqual(shape(textToNodes(txt)), [
    ['LÍNGUA PORTUGUESA', [['Compreensão e interpretação de textos.', []], ['Ortografia oficial; acentuação gráfica.', [['Emprego do sinal indicativo de crase', []]]], ['Regência verbal', [['verbos transitivos', []], ['verbos intransitivos', []]]]]],
    ['DIREITO CONSTITUCIONAL', [['Princípios fundamentais', [['Direitos e garantias', []]]], ['Organização do Estado', []]]],
  ]);
  assert.deepEqual(shape(textToNodes('1 Direito Administrativo\n1.1 Atos\n1.1.1 Atributos\n2 Direito Penal')), [['Direito Administrativo', [['Atos', [['Atributos', []]]]]], ['Direito Penal', []]]);
  assert.deepEqual(shape(textToNodes('- Mat\n  - Álgebra\n    - Equações\n  - Geometria\n- Hist')), [['Mat', [['Álgebra', [['Equações', []]]], ['Geometria', []]]], ['Hist', []]]);
  assert.deepEqual(textToNodes(''), []); assert.deepEqual(textToNodes('   \n\n  '), []);
  assert.deepEqual(shape(textToNodes('1 A\n1.1.1 Pulou nível')), [['A', [['Pulou nível', []]]]], 'pular nível não quebra');
  const map = fromEdital(txt, 'TRF 2026');
  assert.equal(map.root.title, 'TRF 2026'); assert.equal(map.root.children.length, 2);
  const ids = new Set(); map.walk((n) => ids.add(n.id)); let n = 0; map.walk(() => n++); assert.equal(ids.size, n, 'ids únicos');
});
