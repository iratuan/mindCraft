'use strict';
// Simulados: cada um registra data, banca (opcional), duração e, por disciplina, questões feitas/acertos.
// O núcleo é puro: valida tudo que entra (digitado ou vindo de arquivo) e calcula a evolução.
const { isDateStr } = require('./study');

const MAX_SIMS = 500, MAX_ROWS = 100, MAX_Q = 10000, MAX_MIN = 1440;
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;
const clean = (s, n) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

/** Valida UM simulado; lança Error legível para entrada digitada. */
function checkSimulado(s) {
  if (!s || typeof s !== 'object') throw new Error('Simulado inválido.');
  if (!isDateStr(s.d)) throw new Error('Informe a data do simulado.');
  const rows = [];
  for (const r of Array.isArray(s.rows) ? s.rows : []) {
    if (!r) continue;
    const done = Number(r.done), correct = Number(r.correct === '' || r.correct == null ? 0 : r.correct);
    if (!(done > 0) && !(correct > 0)) continue;                                  // linha em branco: ignora
    const disc = clean(r.disc, 120);
    if (!disc) throw new Error('Há uma linha sem disciplina.');
    if (!Number.isInteger(done) || done < 1 || done > MAX_Q) throw new Error(`"${disc}": informe um número inteiro de questões feitas (1 a ${MAX_Q}).`);
    if (!Number.isInteger(correct) || correct < 0) throw new Error(`"${disc}": acertos devem ser um número inteiro (0 ou mais).`);
    if (correct > done) throw new Error(`"${disc}": os acertos (${correct}) não podem superar as questões feitas (${done}).`);
    rows.push({ disc, ...(typeof r.nodeId === 'string' && SAFE_ID.test(r.nodeId) ? { nodeId: r.nodeId } : {}), done, correct });
    if (rows.length > MAX_ROWS) throw new Error(`No máximo ${MAX_ROWS} disciplinas por simulado.`);
  }
  if (!rows.length) throw new Error('Preencha as questões feitas de pelo menos uma disciplina.');
  const minutes = Number.isInteger(Number(s.minutes)) && Number(s.minutes) > 0 ? Math.min(Number(s.minutes), MAX_MIN) : 0;
  return { id: typeof s.id === 'string' && SAFE_ID.test(s.id) ? s.id : null, d: s.d, name: clean(s.name, 120) || 'Simulado', ...(clean(s.banca, 80) ? { banca: clean(s.banca, 80) } : {}), ...(minutes ? { minutes } : {}), rows };
}

/** Lista vinda de arquivo: descarta o que for inválido, sem lançar; ids repetidos/ausentes são refeitos pelo chamador. */
function sanitizeSimulados(list, newId) {
  const out = [], seen = new Set();
  for (const raw of Array.isArray(list) ? list : []) {
    if (out.length >= MAX_SIMS) break;
    let s; try { s = checkSimulado(raw); } catch { continue; }
    if (!s.id || seen.has(s.id)) s.id = newId();
    seen.add(s.id); out.push(s);
  }
  return out;
}

const totals = (s) => s.rows.reduce((a, r) => ({ done: a.done + r.done, correct: a.correct + r.correct }), { done: 0, correct: 0 });
const pct = (c, d) => (d ? (c / d) * 100 : null);

/**
 * Evolução: série por data (mais antigo → mais novo), média, melhor/pior, variação do último em relação ao anterior,
 * e ranking das disciplinas pelo acerto acumulado (mais fracas primeiro) com a variação entre a 1ª e a 2ª metade dos simulados.
 */
function simuladoStats(list) {
  const sims = [...(list || [])].sort((a, b) => a.d.localeCompare(b.d) || String(a.id).localeCompare(String(b.id)));
  const series = sims.map((s) => { const t = totals(s); return { id: s.id, d: s.d, name: s.name, banca: s.banca || '', minutes: s.minutes || 0, done: t.done, correct: t.correct, pct: pct(t.correct, t.done) }; });
  const all = series.reduce((a, x) => ({ done: a.done + x.done, correct: a.correct + x.correct }), { done: 0, correct: 0 });
  const last = series[series.length - 1] || null, prev = series[series.length - 2] || null;
  const byDisc = new Map();
  sims.forEach((s, i) => { for (const r of s.rows) { const k = r.disc.toLowerCase(); const e = byDisc.get(k) || { disc: r.disc, done: 0, correct: 0, first: { done: 0, correct: 0 }, second: { done: 0, correct: 0 } }; e.done += r.done; e.correct += r.correct; const half = i < sims.length / 2 ? e.first : e.second; half.done += r.done; half.correct += r.correct; byDisc.set(k, e); } });
  const discs = [...byDisc.values()].map((e) => ({ disc: e.disc, done: e.done, correct: e.correct, pct: pct(e.correct, e.done),
    trend: e.first.done && e.second.done ? pct(e.second.correct, e.second.done) - pct(e.first.correct, e.first.done) : null }))
    .sort((a, b) => a.pct - b.pct || b.done - a.done || a.disc.localeCompare(b.disc, 'pt-BR'));
  return {
    count: series.length, series, discs,
    avg: pct(all.correct, all.done), best: series.length ? series.reduce((a, b) => (b.pct > a.pct ? b : a)) : null, worst: series.length ? series.reduce((a, b) => (b.pct < a.pct ? b : a)) : null,
    last, delta: last && prev ? last.pct - prev.pct : null,
  };
}

module.exports = { checkSimulado, sanitizeSimulados, simuladoStats, totals, MAX_SIMS, MAX_ROWS, MAX_Q };
