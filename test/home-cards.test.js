'use strict';
// Regras puras dos cartões da tela inicial: lembrete de cópia de segurança e "Seu estudo".
const test = require('node:test');
const assert = require('node:assert/strict');
const B = require('../core/backup-reminder');
const G = require('../core/glance');

test('lembrete de backup: nada a proteger, desligado ou data inválida → nunca mostra', () => {
  assert.equal(B.evaluate({ today: '2026-10-18', maps: 0 }).show, false, 'sem mapas');
  assert.equal(B.evaluate({ today: '2026-10-18', maps: 5, everyDays: 0 }).show, false, 'desligado');
  assert.equal(B.evaluate({ today: 'ontem', maps: 5 }).show, false);
});

test('lembrete de backup: nunca fez → mostra; fez recentemente → não; passou do intervalo → mostra com os dias', () => {
  const r = B.evaluate({ today: '2026-10-18', maps: 3 }); assert.deepEqual([r.show, r.reason, r.days, r.every], [true, 'never', null, 14]);
  assert.equal(B.evaluate({ today: '2026-10-18', maps: 3, lastBackup: '2026-10-10' }).show, false, '8 dias < 14');
  const o = B.evaluate({ today: '2026-10-18', maps: 3, lastBackup: '2026-10-04' }); assert.deepEqual([o.show, o.reason, o.days], [true, 'old', 14], 'exatamente 14 dias já mostra');
  assert.equal(B.evaluate({ today: '2026-10-18', maps: 3, lastBackup: '2026-10-11', everyDays: 7 }).show, true, 'a cada 7 dias');
  assert.equal(B.evaluate({ today: '2026-10-18', maps: 3, lastBackup: '2026-09-01', everyDays: 0 }).show, false);
});

test('lembrete de backup: "lembrar depois" esconde até a data; intervalos inválidos viram o padrão; texto da mensagem', () => {
  assert.equal(B.evaluate({ today: '2026-10-18', maps: 3, snoozeUntil: '2026-10-21' }).show, false);
  assert.equal(B.evaluate({ today: '2026-10-21', maps: 3, snoozeUntil: '2026-10-21' }).show, true, 'no dia marcado volta');
  assert.equal(B.snoozeDate('2026-10-30'), '2026-11-02');
  assert.equal(B.normalizeEvery(99), 14); assert.equal(B.normalizeEvery(undefined), 14); assert.equal(B.normalizeEvery(0), 0); assert.equal(B.normalizeEvery('7'), 14);
  assert.match(B.message(B.evaluate({ today: '2026-10-18', maps: 1 })), /ainda não fez/);
  assert.match(B.message(B.evaluate({ today: '2026-10-18', maps: 1, lastBackup: '2026-09-28' })), /há 20 dias/);
  assert.equal(B.message({ show: false }), '');
});

test('seu estudo (biblioteca): sequência, 7 dias, acerto e o mapa mais atrasado', () => {
  const g = G.buildGlance({ today: '2026-10-18', library: {
    minutesByDay: [{ day: '2026-10-18', minutes: 30 }, { day: '2026-10-17', minutes: 45 }, { day: '2026-10-15', minutes: 20 }, { day: '2026-10-01', minutes: 99 }],
    questionsByDay: [{ day: '2026-10-16', done: 10, correct: 7 }, { day: '2026-10-18', done: 10, correct: 9 }],
    dueMaps: [{ title: 'Penal', due: 7 }, { title: 'Civil', due: 2 }] } });
  assert.equal(g.scope, 'library'); assert.equal(g.streak, 4, '18,17,16(questões),15');
  assert.equal(g.minutesToday, 30); assert.equal(g.weekMinutes, 95, 'o dia 01 está fora da janela');
  assert.deepEqual(g.week.map((w) => w.date), ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18']);
  assert.deepEqual([g.questions.done, g.questions.correct, Math.round(g.questions.accuracy * 100)], [20, 16, 80]);
  assert.deepEqual(g.laggard, { kind: 'map', title: 'Penal', due: 7, progress: null }); assert.equal(g.hasData, true);
});

test('seu estudo: a sequência continua se hoje ainda está vazio (conta a partir de ontem) e zera com um dia em branco', () => {
  const lib = (days) => ({ minutesByDay: days.map((day) => ({ day, minutes: 10 })), questionsByDay: [], dueMaps: [] });
  assert.equal(G.buildGlance({ today: '2026-10-18', library: lib(['2026-10-17', '2026-10-16']) }).streak, 2);
  assert.equal(G.buildGlance({ today: '2026-10-18', library: lib(['2026-10-16']) }).streak, 0);
  assert.equal(G.buildGlance({ today: '2026-10-18', library: lib([]) }).hasData, false);
});

test('seu estudo (mapa aberto): usa o resumo; a disciplina mais atrasada tem mais revisões vencidas (empate: menor progresso)', () => {
  const summary = { streak: 3, week: [{ date: '2026-10-18', minutes: 40 }, { date: '2026-10-17', minutes: 10 }], questions: { week: { done: 8, correct: 4 } },
    goals: { minutes: { goal: 600, done: 50, pct: 8, left: 550 }, questions: null },
    disciplines: [{ title: 'A', due: 2, progress: 50 }, { title: 'B', due: 5, progress: 80 }, { title: 'C', due: 5, progress: 20 }, { title: 'D', due: 0, progress: 0 }] };
  const g = G.buildGlance({ today: '2026-10-18', summary });
  assert.equal(g.scope, 'map'); assert.equal(g.streak, 3); assert.equal(g.weekMinutes, 50); assert.equal(g.minutesToday, 40);
  assert.deepEqual([g.questions.done, g.questions.accuracy], [8, 0.5]); assert.equal(g.laggard.title, 'C'); assert.equal(g.goals.minutes.pct, 8);
  assert.equal(G.buildGlance({ today: '2026-10-18', summary: { ...summary, disciplines: [{ title: 'D', due: 0, progress: 0 }] } }).laggard, null, 'nada vencido → sem destaque');
  assert.equal(G.buildGlance({ today: '2026-10-18' }).scope, 'none');
});
