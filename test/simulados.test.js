'use strict';
const test = require('node:test');
const assert = require('node:assert');
const AdmZip = require('adm-zip');
const { MindMap, createNode } = require('../core/model');
const { readMom, writeMom } = require('../core/mom');
const { openLibrary, canonical } = require('../core/library');
const { checkSimulado, sanitizeSimulados, simuladoStats } = require('../core/simulados');
const S = require('../core/study');

const mk = () => { const m = new MindMap(createNode('Concurso')); const pt = m.addChild(m.root.id, 'Português'), dc = m.addChild(m.root.id, 'Direito'); return { m, pt, dc }; };
const sim = (d, name, pt, dc, extra = {}) => ({ d, name, ...extra, rows: [{ disc: 'Português', nodeId: pt && pt.id, done: 20, correct: pt ? 15 : 0, ...(pt ? {} : {}) }, { disc: 'Direito', nodeId: dc && dc.id, done: 20, correct: 10 }] });

test('validar: normaliza texto e limites; recusa dados incoerentes com mensagem clara', () => {
  const ok = checkSimulado({ d: '2026-10-10', name: '  Simulado   1 ', banca: ' Cebraspe ', minutes: '180', rows: [{ disc: 'Português', done: '30', correct: '24' }, { disc: 'Em branco', done: '', correct: '' }, { disc: 'Direito', done: 20, correct: '' }] });
  assert.deepEqual(ok, { id: null, d: '2026-10-10', name: 'Simulado 1', banca: 'Cebraspe', minutes: 180, rows: [{ disc: 'Português', done: 30, correct: 24 }, { disc: 'Direito', done: 20, correct: 0 }] });
  assert.equal(checkSimulado({ d: '2026-10-10', rows: [{ disc: 'A', done: 1 }] }).name, 'Simulado');
  for (const [bad, re] of [[null, /inválido/], [{ d: 'x', rows: [] }, /data/i], [{ d: '2026-10-10', rows: [] }, /pelo menos uma/], [{ d: '2026-10-10', rows: [{ disc: 'A', done: 5, correct: 9 }] }, /não podem superar/], [{ d: '2026-10-10', rows: [{ disc: 'A', done: 1.5, correct: 0 }] }, /inteiro/], [{ d: '2026-10-10', rows: [{ disc: 'A', done: 99999, correct: 0 }] }, /1 a 10000/], [{ d: '2026-10-10', rows: [{ disc: '  ', done: 5, correct: 1 }] }, /sem disciplina/], [{ d: '2026-10-10', rows: [{ disc: 'A', done: 5, correct: -1 }] }, /acertos/]]) assert.throws(() => checkSimulado(bad), re, JSON.stringify(bad));
  assert.equal(checkSimulado({ d: '2026-10-10', minutes: 99999, rows: [{ disc: 'A', done: 2, correct: 1 }] }).minutes, 1440); assert.equal(checkSimulado({ d: '2026-10-10', minutes: -5, rows: [{ disc: 'A', done: 2, correct: 1 }] }).minutes, undefined);
});

test('registrar no mapa: ação desfazível; com "somar às questões" alimenta o histórico das disciplinas (e o resumo/pontos fracos)', () => {
  const { m, pt, dc } = mk(); const undo0 = m._undo.length;
  const s = m.addSimulado(sim('2026-10-10', 'Sim 1', pt, dc), { addToQuestions: true });
  assert.match(s.id, /^[0-9a-f]{16}$/); assert.equal(m.meta.simulados.length, 1); assert.equal(m._undo.length, undo0 + 1, 'uma única entrada de desfazer');
  assert.deepEqual(m.find(pt.id).node.study.q, { done: 20, correct: 15 }); assert.deepEqual(m.find(dc.id).node.study.qlog['2026-10-10'], { done: 20, correct: 10 });
  assert.equal(S.summary(m, { today: '2026-10-12' }).questions.done, 40);
  assert.ok(m.undo()); assert.equal(m.meta.simulados, undefined); assert.equal(m.find(pt.id).node.study, undefined, 'desfazer reverte também as questões'); assert.ok(m.redo()); assert.equal(m.meta.simulados.length, 1);
  const m2 = mk(); m2.m.addSimulado(sim('2026-10-10', 'Sim', m2.pt, m2.dc)); assert.equal(m2.m.find(m2.pt.id).node.study, undefined, 'sem a opção, as questões dos tópicos não mudam');
});

test('falha no meio não deixa nada pela metade; limites; remover (e desfazer)', () => {
  const { m, pt } = mk(); const before = JSON.stringify(m.toJSON());
  assert.throws(() => m.addSimulado({ d: '2026-10-10', rows: [{ disc: 'A', done: 3, correct: 4 }] }), /superar/); assert.equal(JSON.stringify(m.toJSON()), before);
  const s = m.addSimulado({ d: '2026-10-10', rows: [{ disc: 'Português', nodeId: pt.id, done: 5, correct: 3 }] }); assert.equal(m.removeSimulado('nada'), false); assert.equal(m.removeSimulado(s.id), true); assert.equal(m.meta.simulados, undefined); assert.ok(m.undo()); assert.equal(m.meta.simulados.length, 1);
  m.meta.simulados = Array.from({ length: 500 }, (_, i) => ({ id: 'i' + i, d: '2026-10-10', name: 'x', rows: [{ disc: 'A', done: 1, correct: 0 }] })); assert.throws(() => m.addSimulado({ d: '2026-10-10', rows: [{ disc: 'A', done: 1, correct: 0 }] }), /500 simulados/);
});

test('estatísticas: série por data, média, melhor/pior, variação e ranking de disciplinas com tendência', () => {
  const L = [
    { id: 'a', d: '2026-09-01', name: 'S1', rows: [{ disc: 'Português', done: 20, correct: 10 }, { disc: 'Direito', done: 20, correct: 16 }] },
    { id: 'b', d: '2026-10-01', name: 'S2', rows: [{ disc: 'Português', done: 20, correct: 14 }, { disc: 'Direito', done: 20, correct: 14 }] },
    { id: 'c', d: '2026-09-15', name: 'S1b', banca: 'FCC', minutes: 120, rows: [{ disc: 'português', done: 10, correct: 5 }] },
  ];
  const st = simuladoStats(L);
  assert.deepEqual(st.series.map((x) => [x.name, Math.round(x.pct)]), [['S1', 65], ['S1b', 50], ['S2', 70]], 'ordenado por data'); assert.equal(st.count, 3);
  assert.equal(Math.round(st.avg * 10) / 10, 65.6); assert.equal(st.best.name, 'S2'); assert.equal(st.worst.name, 'S1b'); assert.equal(Math.round(st.delta), 20, 'último (70) − anterior (50)');
  assert.deepEqual(st.discs.map((x) => [x.disc, x.done, x.correct]), [['Português', 50, 29], ['Direito', 40, 30]], 'agrupa sem diferenciar caixa; mais fraca primeiro');
  assert.ok(st.discs[0].trend > 0, 'melhorou entre a 1ª e a 2ª metade'); assert.deepEqual(simuladoStats([]), { count: 0, series: [], discs: [], avg: null, best: null, worst: null, last: null, delta: null });
  assert.equal(simuladoStats([L[0]]).delta, null, 'um só simulado: sem variação');
});

test('persistência: .mom, biblioteca SQLite e saneamento de arquivo adulterado', () => {
  const { m, pt, dc } = mk(); m.addSimulado(sim('2026-10-10', 'Sim A', pt, dc, { banca: 'Cebraspe', minutes: 180 }));
  assert.deepEqual(readMom(writeMom(m)).meta.simulados, m.meta.simulados);
  const lib = openLibrary(':memory:'); const id = lib.saveMap(m, { verify: true }); assert.equal(canonical(lib.loadMap(id)), canonical(m));
  const z = new AdmZip(writeMom(m)); const doc = JSON.parse(z.readAsText('document.json'));
  doc.mcSimulados = [{ d: 'x', rows: [] }, { id: '<x>', d: '2026-10-11', name: 5, rows: [{ disc: 'A', done: 10, correct: 99 }] }, { id: 'ok', d: '2026-10-12', name: '<b>Z</b>', rows: [{ disc: 'A', done: 10, correct: 7 }] }, { id: 'ok', d: '2026-10-13', rows: [{ disc: 'B', done: 4, correct: 1 }] }, null, 'x'];
  z.updateFile('document.json', Buffer.from(JSON.stringify(doc))); const back = readMom(z.toBuffer()).meta.simulados;
  assert.equal(back.length, 2); assert.equal(back[0].name, '<b>Z</b>', 'texto puro'); assert.notEqual(back[0].id, back[1].id, 'id repetido é refeito'); assert.ok(back.every((x) => /^[A-Za-z0-9_-]+$/.test(x.id)));
  assert.equal(sanitizeSimulados('lixo', () => 'n').length, 0);
});
