'use strict';
/**
 * "Seu estudo" da tela inicial: um resumo rápido (sequência, tempo, acerto, 7 dias, metas e o que está mais atrasado).
 * Regra pura. Duas fontes: a BIBLIOTECA inteira (tempo e questões por dia, vindos do banco) ou, sem biblioteca, o resumo do mapa aberto.
 * A sequência conta dias com tempo de estudo OU questões registrados (o painel de estudos do mapa conta também as revisões).
 */
const { addDays } = require('./study');

const pct = (done, ok) => (done > 0 ? ok / done : null);

/** Dias seguidos com atividade, a partir de hoje (ou de ontem, se hoje ainda está vazio). */
function streakOf(active, today) {
  let n = 0, cur = active.has(today) ? today : addDays(today, -1);
  while (active.has(cur)) { n++; cur = addDays(cur, -1); }
  return n;
}

/** Disciplina (do mapa aberto) que mais precisa de revisão: mais revisões vencidas; empate → menor progresso. */
function laggardDiscipline(summary) {
  const ds = ((summary && summary.disciplines) || []).filter((d) => d.due > 0);
  ds.sort((a, b) => b.due - a.due || a.progress - b.progress || String(a.title).localeCompare(String(b.title), 'pt-BR'));
  return ds[0] ? { kind: 'discipline', title: ds[0].title, due: ds[0].due, progress: ds[0].progress } : null;
}

/**
 * @param {{today:string, library?:{minutesByDay:Array<{day:string,minutes:number}>, questionsByDay:Array<{day:string,done:number,correct:number}>, dueMaps:Array<{title:string,due:number}>}|null,
 *          summary?:object|null}} p   summary = resumo do mapa aberto (core/study.summary) ou null
 */
function buildGlance({ today, library = null, summary = null }) {
  const week = Array.from({ length: 7 }, (_, i) => ({ date: addDays(today, i - 6), minutes: 0, done: 0, correct: 0 }));
  const at = new Map(week.map((w) => [w.date, w]));
  let scope = 'none', streak = 0, qDone = 0, qOk = 0;

  if (library) {
    scope = 'library';
    const active = new Set();
    for (const r of library.minutesByDay) { if (r.minutes > 0) active.add(r.day); const w = at.get(r.day); if (w) w.minutes += r.minutes || 0; }
    for (const r of library.questionsByDay) { if (r.done > 0) active.add(r.day); const w = at.get(r.day); if (w) { w.done += r.done || 0; w.correct += r.correct || 0; } }
    streak = streakOf(active, today);
  } else if (summary) {
    scope = 'map';
    streak = summary.streak || 0;
    for (const w of week) { const s = (summary.week || []).find((x) => x.date === w.date); if (s) w.minutes = s.minutes || 0; }
    const q = summary.questions && summary.questions.week; if (q) { qDone = q.done || 0; qOk = q.correct || 0; }       // o resumo só dá o total da semana (não por dia)
  }

  const weekMin = week.reduce((a, w) => a + w.minutes, 0);
  if (scope === 'library') { qDone = week.reduce((a, w) => a + w.done, 0); qOk = week.reduce((a, w) => a + w.correct, 0); }
  const laggard = laggardDiscipline(summary)
    || (library && library.dueMaps && library.dueMaps[0] ? { kind: 'map', title: library.dueMaps[0].title, due: library.dueMaps[0].due, progress: null } : null);
  return {
    scope, streak, minutesToday: week[6].minutes, weekMinutes: weekMin, week,
    questions: { done: qDone, correct: qOk, accuracy: pct(qDone, qOk) },
    goals: summary && summary.goals ? summary.goals : null,
    laggard, hasData: weekMin > 0 || qDone > 0 || streak > 0,
  };
}

module.exports = { buildGlance, streakOf, laggardDiscipline };
