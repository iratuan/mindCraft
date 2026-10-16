'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { toIcs, fold } = require('../core/ics');
const { concurso, TODAY, d } = require('./fixtures');

const unfold = (s) => s.replace(/\r\n /g, '');
const NOW = new Date('2026-10-20T12:00:00Z');

test('agenda .ics: um evento de dia inteiro por dia com revisões (atrasadas caem em hoje) + a prova com alerta', () => {
  const m = concurso().m; m.setExam({ name: 'TRF 2ª Região, "1ª fase"', date: d(25) });
  const r = toIcs(m, { today: TODAY, now: NOW }); const t = unfold(r.ics);
  assert.ok(r.ics.startsWith('BEGIN:VCALENDAR\r\n') && r.ics.endsWith('END:VCALENDAR\r\n')); assert.ok(!/[^\r]\n/.test(r.ics), 'só CRLF');
  assert.equal((t.match(/BEGIN:VEVENT/g) || []).length, r.events); assert.equal(r.exam, true);
  assert.match(t, new RegExp(`DTSTART;VALUE=DATE:${TODAY.replace(/-/g, '')}`)); assert.match(t, /SUMMARY:Revisões \(3\) — Concurso TRF 2026/);
  assert.match(t, /DESCRIPTION:• Direitos fundamentais \(atrasada\)\\n• Princípios fundamentais\\n• Regência \(atrasada\)/);
  assert.match(t, /SUMMARY:PROVA: TRF 2ª Região\\, "1ª fase"/); assert.match(t, /BEGIN:VALARM[\s\S]*TRIGGER:-P0D/);
  assert.ok(r.reviewDays >= 4 && r.events === r.reviewDays + 1);
  const hoje = t.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g).find((e) => e.includes(`DTSTART;VALUE=DATE:${TODAY.replace(/-/g, '')}`)); assert.match(hoje, /DTEND;VALUE=DATE:20261021/);
});

test('UIDs estáveis (reimportar não duplica), escape de vírgula/ponto e vírgula/barra e quebra de linha', () => {
  const m = concurso().m; const a = toIcs(m, { today: TODAY, now: NOW }).ics, b = toIcs(m, { today: TODAY, now: new Date('2027-01-01T00:00:00Z') }).ics;
  const uids = (x) => unfold(x).match(/UID:.+/g); assert.deepEqual(uids(a), uids(b)); assert.equal(new Set(uids(a)).size, uids(a).length);
  let n; m.walk((x) => { if (x.title === 'Crase') n = x; }); n.title = 'Crase; acento, grave \\ e\ncrase'; const t = unfold(toIcs(m, { today: TODAY, now: NOW }).ics);
  assert.match(t, /• Crase\\; acento\\, grave \\\\ e\\ncrase/);
});

test('linhas longas são dobradas em 75 octetos sem quebrar caracteres UTF-8', () => {
  const long = 'DESCRIPTION:' + 'ação — coração '.repeat(30); const f = fold(long);
  for (const part of f.split('\r\n')) assert.ok(Buffer.byteLength(part, 'utf8') <= 75, part.length);
  assert.equal(f.replace(/\r\n /g, ''), long); assert.ok(!f.includes('�'));
});

test('sem revisões nem prova: calendário válido e vazio; só revisões futuras não atrasam; raiz sem estudo é ignorada', () => {
  const { MindMap, createNode } = require('../core/model'); const m = new MindMap(createNode('Vazio'));
  const r = toIcs(m, { today: TODAY, now: NOW }); assert.deepEqual([r.events, r.reviewDays, r.exam], [0, 0, false]); assert.match(r.ics, /BEGIN:VCALENDAR[\s\S]*END:VCALENDAR/);
});
