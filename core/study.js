'use strict';
/**
 * Gestão de estudos (concursos/provas): revisão espaçada, tempo, questões, progresso agregado e plano até a prova.
 * Tudo aqui é função pura sobre dados simples; datas são strings locais "AAAA-MM-DD" e a aritmética usa UTC,
 * para que horário de verão e fuso nunca desloquem um dia.
 */

/** Intervalos (dias) entre revisões: 24h, 7d, 15d, 30d, 60d, 120d — o clássico de concursos. */
const INTERVALS = [1, 7, 15, 30, 60, 120];
const MAX_MIN_PER_DAY = 1440;
/** "Ponto fraco": tópico com pelo menos WEAK_MIN questões e acerto abaixo de WEAK_ACCURACY. */
const WEAK_MIN = 5, WEAK_ACCURACY = 0.7, AGENDA_DAYS = 28;

// ---------- datas ----------
const pad = (n) => String(n).padStart(2, '0');
function todayStr(d = new Date()) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

function parseDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s));
  if (!m) return NaN;
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  const t = Date.UTC(y, mo - 1, d);
  const c = new Date(t); // rejeita datas inexistentes (2026-02-30)
  return c.getUTCFullYear() === y && c.getUTCMonth() === mo - 1 && c.getUTCDate() === d ? t : NaN;
}
const isDateStr = (s) => !Number.isNaN(parseDate(s));
function addDays(s, n) {
  const t = parseDate(s);
  if (Number.isNaN(t)) throw new Error(`Data inválida: ${s}`);
  const d = new Date(t + n * 86400000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
/** Dias de a até b (positivo se b é depois de a). */
function diffDays(a, b) { return Math.round((parseDate(b) - parseDate(a)) / 86400000); }

// ---------- estado de estudo de um tópico ----------
function emptyStudy() {
  return { weight: 1, log: {}, q: { done: 0, correct: 0 }, qlog: {}, reviews: [], stage: -1, next: null, last: null };
}
/** Normaliza (e valida) o que veio de um arquivo; nunca confia em dados externos. */
function normalizeStudy(raw) {
  const s = emptyStudy();
  if (!raw || typeof raw !== 'object') return s;
  if (Number.isInteger(raw.weight) && raw.weight >= 1 && raw.weight <= 5) s.weight = raw.weight;
  if (raw.log && typeof raw.log === 'object') {
    for (const [d, m] of Object.entries(raw.log)) if (isDateStr(d) && Number.isFinite(m) && m > 0 && m <= MAX_MIN_PER_DAY) s.log[d] = Math.round(m);
  }
  if (raw.q && Number.isInteger(raw.q.done) && Number.isInteger(raw.q.correct) && raw.q.done >= 0 && raw.q.correct >= 0 && raw.q.correct <= raw.q.done) s.q = { done: raw.q.done, correct: raw.q.correct };
  if (raw.qlog && typeof raw.qlog === 'object') { // questões por dia (arquivos antigos não têm; só passa o que for consistente)
    for (const [d, v] of Object.entries(raw.qlog)) if (isDateStr(d) && v && Number.isInteger(v.done) && Number.isInteger(v.correct) && v.done > 0 && v.correct >= 0 && v.correct <= v.done) s.qlog[d] = { done: v.done, correct: v.correct };
  }
  if (Array.isArray(raw.reviews)) s.reviews = raw.reviews.filter((r) => r && isDateStr(r.d)).map((r) => ({ d: r.d, ok: r.ok !== false }));
  if (Number.isInteger(raw.stage) && raw.stage >= -1) s.stage = raw.stage;
  if (isDateStr(raw.next)) s.next = raw.next;
  if (isDateStr(raw.last)) s.last = raw.last;
  return s;
}

/**
 * Registra uma sessão de estudo/revisão. Primeira vez: estágio 0 (revisar em 1 dia).
 * Acertou: sobe um estágio; errou/difícil: volta ao estágio 0. Idempotente no mesmo dia (não infla o estágio).
 */
function reviewed(st, { today, ok = true }) {
  if (!isDateStr(today)) throw new Error(`Data inválida: ${today}`);
  const s = normalizeStudy(st);
  const lastR = s.reviews[s.reviews.length - 1];
  if (lastR && lastR.d === today) {
    if (lastR.ok && ok) return s;                 // já registrado hoje
    if (lastR.ok && !ok) { s.reviews.pop(); s.stage = 0; s.reviews.push({ d: today, ok: false }); }
    else if (!lastR.ok && ok) return s;           // um "errei" de hoje não é desfeito por um "acertei" posterior
    else return s;
  } else {
    s.stage = s.stage < 0 ? 0 : ok ? s.stage + 1 : 0;
    s.reviews.push({ d: today, ok });
  }
  s.last = today;
  s.next = addDays(today, INTERVALS[Math.min(s.stage, INTERVALS.length - 1)]);
  return s;
}

function addTime(st, today, minutes) {
  if (!isDateStr(today)) throw new Error(`Data inválida: ${today}`);
  if (!Number.isFinite(minutes) || minutes <= 0) throw new Error('Informe um tempo maior que zero (minutos).');
  const s = normalizeStudy(st);
  const add = Math.round(minutes);
  if ((s.log[today] || 0) + add > MAX_MIN_PER_DAY) throw new Error('O tempo registrado no dia não pode passar de 24 h.');
  s.log[today] = (s.log[today] || 0) + add;
  return s;
}

function addQuestions(st, done, correct, today = null) {
  if (today !== null && !isDateStr(today)) throw new Error(`Data inválida: ${today}`);
  if (!Number.isInteger(done) || !Number.isInteger(correct) || done <= 0 || correct < 0) throw new Error('Informe números inteiros (feitas > 0, acertos ≥ 0).');
  if (correct > done) throw new Error('Os acertos não podem superar as questões feitas.');
  const s = normalizeStudy(st);
  s.q = { done: s.q.done + done, correct: s.q.correct + correct };
  if (today) { const d0 = s.qlog[today] || { done: 0, correct: 0 }; s.qlog[today] = { done: d0.done + done, correct: d0.correct + correct }; } // histórico por dia (acerto semanal)
  return s;
}

function setNext(st, date) {
  if (date !== null && !isDateStr(date)) throw new Error(`Data inválida: ${date}`);
  const s = normalizeStudy(st); s.next = date; return s;
}
function setWeight(st, w) {
  if (!Number.isInteger(w) || w < 1 || w > 5) throw new Error('Peso deve ser um inteiro de 1 a 5.');
  const s = normalizeStudy(st); s.weight = w; return s;
}

const totalMinutes = (st) => Object.values((st && st.log) || {}).reduce((a, b) => a + b, 0);
const isDue = (st, today) => !!(st && st.next && st.next <= today);

// ---------- agregação ----------
const isLeaf = (n) => n.children.length === 0;
const weightOf = (n) => (n.study && n.study.weight) || 1;
const pct = (n) => (Number.isFinite(n.progress) ? n.progress : 0);

/** Progresso agregado (0–100) de um nó pelas folhas, ponderado pelo peso. null se não houver nenhum dado. */
function rollup(node) {
  let w = 0, p = 0, any = false;
  const rec = (n) => {
    if (isLeaf(n)) { const wt = weightOf(n); w += wt; p += wt * pct(n); if (n.progress != null) any = true; }
    else n.children.forEach(rec);
  };
  rec(node);
  return any && w > 0 ? p / w : null;
}

function* walkPath(node, path = []) {
  yield [node, path];
  for (const c of node.children) yield* walkPath(c, [...path, node]);
}

function summary(map, { today = todayStr() } = {}) {
  const root = map.root;
  const weekStart = addDays(today, -6);
  const active = new Set();
  let minTotal = 0, minToday = 0, minWeek = 0, qDone = 0, qOk = 0, revToday = 0;
  const due = [], upcoming = [], perDay = {}, future = [], weak = [];
  let qWeekDone = 0, qWeekOk = 0;
  const pending = { leaves: 0, weighted: 0 };
  let totalLeaves = 0, doneLeaves = 0, wSum = 0, wProg = 0;

  const disc = new Map(); // id da disciplina -> acumulador
  for (const c of root.children) disc.set(c.id, { id: c.id, title: c.title, leaves: 0, done: 0, w: 0, wp: 0, minutes: 0, minWeek: 0, qDone: 0, qOk: 0, due: 0 });

  for (const [n, path] of walkPath(root)) {
    const st = n.study ? normalizeStudy(n.study) : null;
    const d = path.length >= 1 ? disc.get((path[1] || n).id) : null;
    if (st) {
      for (const [day, m] of Object.entries(st.log)) {
        minTotal += m; active.add(day); perDay[day] = (perDay[day] || 0) + m;
        if (day === today) minToday += m;
        if (day >= weekStart && day <= today) minWeek += m;
        if (d) { d.minutes += m; if (day >= weekStart && day <= today) d.minWeek += m; }
      }
      for (const r of st.reviews) { active.add(r.d); if (r.d === today) revToday++; }
      qDone += st.q.done; qOk += st.q.correct;
      for (const [day, v] of Object.entries(st.qlog)) {
        active.add(day);
        if (day >= weekStart && day <= today) { qWeekDone += v.done; qWeekOk += v.correct; }
      }
      if (st.q.done >= WEAK_MIN && st.q.correct / st.q.done < WEAK_ACCURACY) weak.push({ id: n.id, title: n.title, path: path.slice(1).map((x) => x.title), done: st.q.done, correct: st.q.correct, accuracy: st.q.correct / st.q.done });
      if (d) { d.qDone += st.q.done; d.qOk += st.q.correct; }
      if (st.next && st.next <= today) {
        due.push({ id: n.id, title: n.title, path: path.slice(1).map((x) => x.title), next: st.next, overdue: diffDays(st.next, today), weight: st.weight, stage: st.stage });
        if (d) d.due++;
      } else if (st.next && st.next > today && st.next <= addDays(today, AGENDA_DAYS - 1)) {
        const it = { id: n.id, title: n.title, path: path.slice(1).map((x) => x.title), next: st.next, weight: st.weight };
        future.push(it);
        if (st.next <= addDays(today, 7)) upcoming.push(it);
      }
    }
    if (isLeaf(n) && path.length >= 1) { // a raiz sem filhos não é "tópico de estudo"
      const wt = weightOf(n), p = pct(n);
      totalLeaves++; wSum += wt; wProg += wt * p;
      if (p >= 100) doneLeaves++; else { pending.leaves++; pending.weighted += wt * (100 - p) / 100; }
      if (d) { d.leaves++; d.w += wt; d.wp += wt * p; if (p >= 100) d.done++; }
    }
  }
  due.sort((a, b) => b.overdue - a.overdue || b.weight - a.weight || a.title.localeCompare(b.title, 'pt-BR'));
  upcoming.sort((a, b) => a.next.localeCompare(b.next) || b.weight - a.weight || a.title.localeCompare(b.title, 'pt-BR'));

  weak.sort((a, b) => a.accuracy - b.accuracy || b.done - a.done || a.title.localeCompare(b.title, 'pt-BR'));
  // agenda: hoje = tudo que já venceu (atrasadas + de hoje); depois, um dia por vez até AGENDA_DAYS
  future.sort((a, b) => a.next.localeCompare(b.next) || b.weight - a.weight || a.title.localeCompare(b.title, 'pt-BR'));
  const agenda = Array.from({ length: AGENDA_DAYS }, (_, i) => {
    const date = addDays(today, i);
    const items = i === 0 ? due.map((x) => ({ ...x })) : future.filter((x) => x.next === date);
    return { date, count: items.length, items };
  });

  // sequência: dias consecutivos com atividade, contados a partir de hoje (ou de ontem, se hoje ainda está vazio)
  let streak = 0, cur = active.has(today) ? today : addDays(today, -1);
  while (active.has(cur)) { streak++; cur = addDays(cur, -1); }

  const exam = map.meta && map.meta.exam && isDateStr(map.meta.exam.date) ? map.meta.exam : null;
  const daysLeft = exam ? diffDays(today, exam.date) : null;
  const plan = exam && daysLeft > 0 ? {
    daysLeft, pendingTopics: pending.leaves,
    topicsPerDay: Math.round((pending.leaves / daysLeft) * 10) / 10,
  } : null;

  return {
    today, overall: wSum ? wProg / wSum : 0, totalLeaves, doneLeaves,
    minutes: { total: minTotal, today: minToday, week: minWeek },
    week: Array.from({ length: 7 }, (_, i) => { const d = addDays(today, i - 6); return { date: d, minutes: perDay[d] || 0 }; }),
    questions: { done: qDone, correct: qOk, accuracy: qDone ? qOk / qDone : null, week: { done: qWeekDone, correct: qWeekOk, accuracy: qWeekDone ? qWeekOk / qWeekDone : null } },
    weak: weak.slice(0, 8), agenda,
    reviewsToday: revToday, streak, due, upcoming,
    disciplines: [...disc.values()].map((d) => ({ ...d, progress: d.w ? d.wp / d.w : 0, accuracy: d.qDone ? d.qOk / d.qDone : null })),
    exam: exam ? { name: exam.name || '', date: exam.date, daysLeft } : null, plan,
  };
}

module.exports = {
  INTERVALS, MAX_MIN_PER_DAY, WEAK_MIN, WEAK_ACCURACY, AGENDA_DAYS, todayStr, parseDate, isDateStr, addDays, diffDays,
  emptyStudy, normalizeStudy, reviewed, addTime, addQuestions, setNext, setWeight,
  totalMinutes, isDue, rollup, summary,
};
