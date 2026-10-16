'use strict';
// Agenda de estudos em .ics (iCalendar, RFC 5545): importável no Google Agenda, Outlook, Apple Calendar.
// Gera eventos de DIA INTEIRO: um por dia com revisões agendadas (lista os tópicos) e a data da prova (com alertas).
const study = require('./study');

const esc = (s) => String(s ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const ymd = (d) => d.replace(/-/g, '');
/** Dobra linhas com mais de 75 octetos (UTF-8), como manda a RFC (continuação = CRLF + espaço). */
function fold(line) {
  const out = []; let cur = '', bytes = 0;
  for (const ch of line) {
    const n = Buffer.byteLength(ch, 'utf8');
    if (bytes + n > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0; }
    cur += ch; bytes += n;
  }
  out.push(cur);
  return out.join('\r\n ');
}
const stamp = (now) => now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/**
 * @param {import('./model').MindMap} map
 * @param {{ today?: string, now?: Date }} opts  `today` (AAAA-MM-DD): só entram revisões de hoje em diante (atrasadas caem em hoje).
 * @returns {{ ics: string, events: number, reviewDays: number, exam: boolean }}
 */
function toIcs(map, { today = study.todayStr(), now = new Date() } = {}) {
  const byDay = new Map();
  map.walk((n, level) => {
    if (level === 0 || !n.study || !study.isDateStr(n.study.next)) return;
    const day = n.study.next < today ? today : n.study.next;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push({ title: n.title, late: n.study.next < today });
  });
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MindCraft//Agenda de estudos//PT-BR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', `X-WR-CALNAME:${esc('Estudos — ' + (map.root.title || 'MindCraft'))}`];
  const dtstamp = stamp(now), uidBase = String(map.root.id).slice(0, 16);
  let events = 0;
  const event = (uid, day, summary, description, alarmDaysBefore = null) => {
    const end = study.addDays(day, 1);
    L.push('BEGIN:VEVENT', `UID:${uid}@mindcraft`, `DTSTAMP:${dtstamp}`, `DTSTART;VALUE=DATE:${ymd(day)}`, `DTEND;VALUE=DATE:${ymd(end)}`, `SUMMARY:${esc(summary)}`, `DESCRIPTION:${esc(description)}`, 'TRANSP:TRANSPARENT');
    if (alarmDaysBefore !== null) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(summary)}`, `TRIGGER:-P${alarmDaysBefore}D`, 'END:VALARM');
    L.push('END:VEVENT'); events++;
  };
  for (const day of [...byDay.keys()].sort()) {
    const items = byDay.get(day).sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
    event(`rev-${uidBase}-${ymd(day)}`, day, `Revisões (${items.length}) — ${map.root.title}`, items.map((i) => `• ${i.title}${i.late ? ' (atrasada)' : ''}`).join('\n'));
  }
  const exam = map.meta.exam && study.isDateStr(map.meta.exam.date) ? map.meta.exam : null;
  if (exam) event(`prova-${uidBase}`, exam.date, `PROVA: ${exam.name || map.root.title}`, `Data da prova cadastrada no MindCraft (${map.root.title}).`, 0);
  L.push('END:VCALENDAR');
  return { ics: L.map(fold).join('\r\n') + '\r\n', events, reviewDays: byDay.size, exam: !!exam };
}

module.exports = { toIcs, fold };
