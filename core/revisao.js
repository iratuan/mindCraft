'use strict';
/**
 * Revisão espaçada dos tópicos (regra pura: sem Electron, sem DOM, sem relógio escondido — quem chama passa a data).
 * Cada tópico pode ter `review = { done, last, next }`: quantas vezes foi revisado, a data da última e a da próxima.
 * Intervalos fixos 1-7-15-30-60-120 dias: a 1ª revisão agenda para amanhã; a partir da 6ª, sempre 120 dias.
 * Datas são chaves locais "AAAA-MM-DD" (sem horário), para que "hoje" não mude com o fuso.
 */

const INTERVALS = [1, 7, 15, 30, 60, 120];
const KEY = /^\d{4}-\d{2}-\d{2}$/;

/** Chave local "AAAA-MM-DD" de uma data (padrão: agora). */
function dayKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Soma dias a uma chave. Usa UTC só para a aritmética (não depende do fuso). */
function addDays(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

/** Dias de `a` até `b` (positivo se b é depois de a). */
function diffDays(a, b) {
  const [ya, ma, da] = a.split('-').map(Number), [yb, mb, db] = b.split('-').map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86400000);
}

/** Estado de revisão válido, ou null. Dados estranhos no arquivo nunca quebram o carregamento. */
function sanitizeReview(r) {
  if (!r || typeof r !== 'object') return null;
  if (!Number.isInteger(r.done) || r.done < 0) return null;
  if (typeof r.next !== 'string' || !KEY.test(r.next)) return null;
  const last = typeof r.last === 'string' && KEY.test(r.last) ? r.last : null;
  return { done: r.done, last, next: r.next };
}

/** Estado depois de uma revisão feita em `today`. */
function markReviewed(review, today) {
  const done = (review && Number.isInteger(review.done) ? review.done : 0) + 1;
  const step = INTERVALS[Math.min(done - 1, INTERVALS.length - 1)];
  return { done, last: today, next: addDays(today, step) };
}

/**
 * Percorre a árvore e separa o que vence hoje, o que está atrasado e a previsão dos próximos `horizon` dias.
 * `due` sai na ordem do documento, com o caminho do tópico para dar contexto.
 */
function collectReviews(root, today, horizon = 7) {
  const due = [];
  const upcoming = Array.from({ length: horizon }, (_, i) => ({ date: addDays(today, i + 1), count: 0 }));
  const walk = (node, trail) => {
    const path = [...trail, node.title];
    const r = sanitizeReview(node.review);
    if (r) {
      const diff = diffDays(today, r.next);
      if (diff <= 0) due.push({ id: node.id, title: node.title, path: path.join(' › '), next: r.next, overdueDays: -diff });
      else { const slot = upcoming[diff - 1]; if (slot) slot.count++; }
    }
    for (const c of node.children || []) walk(c, path);
  };
  walk(root, []);
  const today_ = due.filter((d) => d.overdueDays === 0).length;
  const overdue = due.length - today_;
  return { due, counts: { today: today_, overdue, total: due.length }, upcoming };
}

/** Deve avisar? Só com revisões pendentes e uma vez por dia. */
function shouldNotify({ lastDay, today, total }) {
  return total > 0 && lastDay !== today;
}

/** Texto do aviso do sistema, com plural correto. */
function notificationText(today, overdue) {
  const r = (n) => (n === 1 ? 'revisão' : 'revisões');
  const a = (n) => (n === 1 ? 'atrasada' : 'atrasadas');
  if (today > 0 && overdue > 0) return `Hoje: ${today} ${r(today)}. Além disso, ${overdue} ${a(overdue)}.`;
  if (today > 0) return `Hoje: ${today} ${r(today)}.`;
  return `${overdue} ${r(overdue)} ${a(overdue)}.`;
}

module.exports = { INTERVALS, dayKey, addDays, diffDays, sanitizeReview, markReviewed, collectReviews, shouldNotify, notificationText };
