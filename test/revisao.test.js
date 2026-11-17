'use strict';
// Revisão espaçada: intervalos fixos 1-7-15-30-60-120 dias, contagem de revisões de hoje e atrasadas, aviso diário.
const test = require('node:test');
const assert = require('node:assert');
const R = require('../core/services/revisao');

test('datas: chave local AAAA-MM-DD e soma de dias sem erro de fuso', () => {
  assert.strictEqual(R.addDays('2026-02-27', 1), '2026-02-28');
  assert.strictEqual(R.addDays('2026-02-28', 1), '2026-03-01');   // 2026 não é bissexto
  assert.strictEqual(R.addDays('2026-12-31', 120), '2027-04-30');
  assert.strictEqual(R.diffDays('2026-11-01', '2026-11-06'), 5);
  assert.strictEqual(R.dayKey(new Date(2026, 10, 6, 23, 59)), '2026-11-06');   // hora local, não UTC
});

test('primeira revisão agenda para amanhã; depois os intervalos seguem a escada e param em 120', () => {
  let r = null;
  const hoje = '2026-11-06';
  const seq = [];
  for (let i = 0; i < 8; i++) { r = R.markReviewed(r, hoje); seq.push(R.diffDays(hoje, r.next)); }
  assert.deepStrictEqual(seq, [1, 7, 15, 30, 60, 120, 120, 120]);
  assert.strictEqual(r.done, 8);
  assert.strictEqual(r.last, hoje);
});

test('sanitização: aceita só o formato esperado; lixo vira null (nunca quebra o carregamento)', () => {
  assert.strictEqual(R.sanitizeReview(null), null);
  assert.strictEqual(R.sanitizeReview({ done: 'x', next: '2026-11-07' }), null);
  assert.strictEqual(R.sanitizeReview({ done: 2, next: '07/11/2026' }), null);
  const ok = R.sanitizeReview({ done: 2, last: '2026-11-01', next: '2026-11-16', extra: 1 });
  assert.deepStrictEqual(ok, { done: 2, last: '2026-11-01', next: '2026-11-16' });
});

test('coleta: separa revisões de hoje, atrasadas e a previsão dos próximos 7 dias', () => {
  const hoje = '2026-11-06';
  const root = {
    id: 'r', title: 'Concurso', children: [
      { id: 'a', title: 'Direito', review: { done: 1, last: '2026-11-01', next: '2026-11-06' }, children: [
        { id: 'a1', title: 'CF/88', review: { done: 3, last: '2026-10-20', next: '2026-11-04' }, children: [] },
      ] },
      { id: 'b', title: 'Informática', review: { done: 0, last: null, next: '2026-11-08' }, children: [] },
      { id: 'c', title: 'Sem revisão', children: [] },
    ],
  };
  const c = R.collectReviews(root, hoje);
  assert.deepStrictEqual(c.counts, { today: 1, overdue: 1, total: 2 });
  assert.deepStrictEqual(c.due.map((d) => d.id), ['a', 'a1']);   // ordem do documento: hoje primeiro, depois atrasadas
  assert.strictEqual(c.due.find((d) => d.id === 'a1').overdueDays, 2);
  assert.strictEqual(c.due.find((d) => d.id === 'a1').path, 'Concurso › Direito › CF/88');
  const prox = c.upcoming.find((u) => u.date === '2026-11-08');
  assert.strictEqual(prox.count, 1);
  assert.strictEqual(c.upcoming.length, 7);
});

test('aviso diário: só quando há revisões e ainda não avisou hoje', () => {
  assert.strictEqual(R.shouldNotify({ lastDay: null, today: '2026-11-06', total: 3 }), true);
  assert.strictEqual(R.shouldNotify({ lastDay: '2026-11-06', today: '2026-11-06', total: 3 }), false);
  assert.strictEqual(R.shouldNotify({ lastDay: '2026-11-05', today: '2026-11-06', total: 0 }), false);
  assert.strictEqual(R.notificationText(3, 1), 'Hoje: 3 revisões. Além disso, 1 atrasada.');
  assert.strictEqual(R.notificationText(1, 0), 'Hoje: 1 revisão.');
});

test('persistência: a revisão sobrevive a salvar e reabrir o .mom, e lixo no arquivo vira "sem revisão"', () => {
  const { MindMap, createNode } = require('../core/components/model');
  const { readMom, writeMom } = require('../core/formats/mom');
  const m = new MindMap(createNode('Concurso'));
  m.addChild(m.root.id, 'Direito');
  const d = m.root.children[0];
  m.update(d.id, { review: R.markReviewed(null, '2026-11-06') });
  const back = readMom(writeMom(m));
  const d2 = back.root.children[0];
  assert.deepStrictEqual(d2.review, { done: 1, last: '2026-11-06', next: '2026-11-07' });
  // um .mom com campo de revisão estragado: o tópico abre, só sem revisão
  m.update(d.id, { review: { done: 'x', next: 'nunca' } });
  const bad = readMom(writeMom(m));
  assert.strictEqual(bad.root.children[0].review, undefined);
  assert.strictEqual(bad.root.children[0].title, 'Direito');
});
