'use strict';
const test = require('node:test');
const assert = require('node:assert');
const AdmZip = require('adm-zip');
const { MindMap, createNode } = require('../core/model');
const { readMom, writeMom } = require('../core/mom');
const { openLibrary, canonical } = require('../core/library');
const S = require('../core/study');

const TODAY = '2026-10-20';
const mk = () => { const m = new MindMap(createNode('Concurso')); const d = m.addChild(m.root.id, 'Direito'); const a = m.addChild(d.id, 'Crase'); const b = m.addChild(d.id, 'Regência'); return { m, a, b }; };

test('caderno de erros: registrar com motivo e nota; validações; sem o campo quando vazio (arquivos antigos não mudam)', () => {
  assert.equal(S.emptyStudy().errs, undefined); assert.equal(S.normalizeStudy({ weight: 3 }).errs, undefined, 'sem erros, sem o campo');
  let st = S.addError(null, { why: 'atencao', note: '  trocou "a" por "à"  ', today: TODAY });
  assert.deepEqual(st.errs, [{ d: TODAY, why: 'atencao', note: 'trocou "a" por "à"' }]);
  st = S.addError(st, { why: 'nao-sabia', today: TODAY }); assert.equal(st.errs.length, 2); assert.equal(st.errs[1].note, '');
  assert.throws(() => S.addError(st, { why: 'inventado', today: TODAY }), /motivo/i); assert.throws(() => S.addError(st, { why: 'tempo', today: 'x' }), /Data inválida/);
  assert.equal(S.addError(st, { why: 'tempo', note: 'x'.repeat(900), today: TODAY }).errs[2].note.length, 300);
  let full = st; for (let i = 0; i < S.MAX_ERRS - 2; i++) full = S.addError(full, { why: 'chute', today: TODAY }); assert.throws(() => S.addError(full, { why: 'chute', today: TODAY }), /200 registros/);
  const rm = S.removeError(st, 0); assert.equal(rm.errs.length, 1); assert.equal(rm.errs[0].why, 'nao-sabia'); assert.equal(S.removeError(rm, 0).errs, undefined); assert.throws(() => S.removeError(st, 9), /não encontrado/);
});

test('normalizeStudy descarta erros inválidos (motivo/data/nota fora do padrão) e limita o tamanho', () => {
  const s = S.normalizeStudy({ errs: [{ d: TODAY, why: 'atencao', note: 5 }, { d: 'x', why: 'atencao' }, { d: TODAY, why: 'hacker' }, null, 'x', { d: TODAY, why: 'chute', note: 'y'.repeat(999) }] });
  assert.deepEqual(s.errs.map((e) => [e.why, e.note.length]), [['atencao', 1], ['chute', 300]]);
  assert.equal(S.normalizeStudy({ errs: 'x' }).errs, undefined);
  assert.equal(S.normalizeStudy({ errs: Array.from({ length: 500 }, () => ({ d: TODAY, why: 'chute' })) }).errs.length, 200);
});

test('resumo: erros por motivo, da semana, por tópico e os mais recentes', () => {
  const { m, a, b } = mk();
  m.mutateStudy(a.id, (s) => S.addError(S.addError(s, { why: 'atencao', today: '2026-10-10' }), { why: 'confundi', note: 'crase x acento', today: TODAY }));
  m.mutateStudy(b.id, (s) => S.addError(s, { why: 'atencao', note: 'verbo', today: S.addDays(TODAY, -3) }));
  const e = S.summary(m, { today: TODAY }).errors;
  assert.deepEqual([e.total, e.week], [3, 2]); assert.deepEqual(e.byWhy, { atencao: 2, confundi: 1 });
  assert.deepEqual(e.topics.map((t) => [t.title, t.count]), [['Crase', 2], ['Regência', 1]]);
  assert.deepEqual(e.recent.map((r) => [r.title, r.why, r.d]), [['Crase', 'confundi', TODAY], ['Regência', 'atencao', '2026-10-17'], ['Crase', 'atencao', '2026-10-10']]);
  assert.deepEqual(e.recent[0].path, ['Direito']); assert.deepEqual(S.summary(new MindMap(createNode('x')), { today: TODAY }).errors, { total: 0, week: 0, open: 0, redoneOk: 0, redoneBad: 0, byWhy: {}, list: [], topics: [], recent: [] });
});

test('erros sobrevivem a .mom, biblioteca SQLite e cópia de tópico; o estudo é descartado ao colar (como já era)', () => {
  const { m, a } = mk(); m.mutateStudy(a.id, (s) => S.addError(s, { why: 'tempo', note: 'faltou tempo', today: TODAY }));
  const back = readMom(writeMom(m)); assert.deepEqual(back.find(a.id).node.study.errs, m.find(a.id).node.study.errs);
  const lib = openLibrary(':memory:'); const id = lib.saveMap(m, { verify: true }); assert.equal(canonical(lib.loadMap(id)), canonical(m));
  assert.equal(MindMap.cloneSubtree(m.find(a.id).node).study, undefined, 'colar não leva o histórico de estudo');
  assert.ok(MindMap.cloneSubtree(m.find(a.id).node, { keepStudy: true }).study.errs);
});

test('metas semanais: validar, guardar, persistir (.mom e biblioteca), desfazer; progresso nos últimos 7 dias', () => {
  const { m, a } = mk();
  assert.deepEqual(S.sanitizeGoals({ minutesWeek: 600, questionsWeek: 120 }), { minutesWeek: 600, questionsWeek: 120 }); assert.equal(S.sanitizeGoals({ minutesWeek: 0, questionsWeek: -3 }), null);
  assert.deepEqual(S.sanitizeGoals({ minutesWeek: 99999999, questionsWeek: 1.5 }), { minutesWeek: 10080 }); assert.equal(S.sanitizeGoals('x'), null); assert.equal(S.sanitizeGoals(null), null);
  assert.equal(S.summary(m, { today: TODAY }).goals, null, 'sem metas: null');
  m.setGoals({ minutesWeek: 300, questionsWeek: 50 }); assert.deepEqual(m.meta.goals, { minutesWeek: 300, questionsWeek: 50 });
  m.mutateStudy(a.id, (s) => S.addQuestions(S.addTime(s, TODAY, 120), 20, 15, TODAY)); m.mutateStudy(a.id, (s) => S.addTime(s, S.addDays(TODAY, -10), 500));   // fora dos 7 dias: não conta
  const g = S.summary(m, { today: TODAY }).goals;
  assert.deepEqual(g.minutes, { goal: 300, done: 120, pct: 40, left: 180 }); assert.deepEqual(g.questions, { goal: 50, done: 20, pct: 40, left: 30 });
  m.mutateStudy(a.id, (s) => S.addTime(s, S.addDays(TODAY, -1), 400)); assert.equal(S.summary(m, { today: TODAY }).goals.minutes.pct, 100, 'passou da meta: 100% (sem estourar a barra)');
  m.setGoals({ minutesWeek: 60, questionsWeek: 0 }); assert.deepEqual(m.meta.goals, { minutesWeek: 60 }); assert.equal(S.summary(m, { today: TODAY }).goals.questions, null);
  assert.throws(() => m.setGoals({ minutesWeek: 'abc' }), /inteiros positivos/); assert.throws(() => m.setGoals(5), /inválidas/);
  const back = readMom(writeMom(m)); assert.deepEqual(back.meta.goals, { minutesWeek: 60 });
  const lib = openLibrary(':memory:'); const id = lib.saveMap(m); assert.deepEqual(lib.loadMap(id).meta.goals, { minutesWeek: 60 });
  m.setGoals(null); assert.equal(m.meta.goals, undefined); assert.ok(m.undo()); assert.deepEqual(m.meta.goals, { minutesWeek: 60 });
  const z = new AdmZip(writeMom(m)); const doc = JSON.parse(z.readAsText('document.json')); doc.mcGoals = { minutesWeek: '<x>', questionsWeek: -1 }; z.updateFile('document.json', Buffer.from(JSON.stringify(doc)));
  assert.equal(readMom(z.toBuffer()).meta.goals, undefined, 'arquivo adulterado: metas inválidas ignoradas');
});
