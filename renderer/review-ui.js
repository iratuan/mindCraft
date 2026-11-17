'use strict';
/* Revisão espaçada na interface: "Revisões de hoje" (lista com botão Revisado), marcar o tópico selecionado e o aviso
   diário do sistema. A regra de datas e intervalos está em core/revisao.js; aqui só mostramos e marcamos. Usa as globais de renderer.js. */

const { collectReviews, markReviewed, dayKey, shouldNotify, notificationText } = require(path.join(core, 'services', 'revisao'));
const REVIEW_NOTIFIED_KEY = 'mc-review-notified';   // dia do último aviso (por máquina; não vai para o arquivo do mapa)
const REVIEW_CHECK_MS = 30 * 60 * 1000;

/** Marca um tópico como revisado hoje: entra no histórico de desfazer como qualquer edição. */
function markTopicReviewed(id) {
  const r = id && map.find(id);
  if (!r) { setStatus('Selecione um tópico para marcar como revisado.'); return false; }
  map.update(id, { review: markReviewed(r.node.review, dayKey()) });
  dirty = true; rev++; render();
  const next = map.find(id).node.review.next;
  setStatus(`"${r.node.title}" revisado. Próxima revisão em ${formatDay(next)}.`);
  return true;
}

function formatDay(key) {
  const [y, m, d] = key.split('-');
  return `${d}/${m}/${y}`;
}

function reviewElement(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  el.textContent = text;
  return el;
}

/** Monta a janela de revisões do dia. Tudo que vem do mapa entra com textContent (nunca HTML cru). */
function renderReviewsModal(modal) {
  const c = collectReviews(map.root, dayKey());
  modal.textContent = '';
  const box = reviewElement('div', 'modal-box review-box');
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'Revisões');
  box.append(reviewElement('h3', null, `Revisões de hoje (${c.counts.today})`));
  if (!c.due.length) box.append(reviewElement('p', 'review-empty', 'Nenhuma revisão para hoje. Use Editar › Marcar tópico como revisado para agendar.'));
  const list = (title, items) => {
    if (!items.length) return;
    box.append(reviewElement('h4', null, `${title} (${items.length})`));
    for (const d of items) {
      const row = reviewElement('div', 'review-item');
      const txt = document.createElement('div');
      txt.append(reviewElement('div', 'review-title', d.title), reviewElement('div', 'review-path', d.path));
      const btn = reviewElement('button', 'btn primary', 'Revisado');
      btn.addEventListener('click', () => { markTopicReviewed(d.id); renderReviewsModal(modal); });
      row.append(txt, btn);
      box.append(row);
    }
  };
  list('Atrasadas', c.due.filter((d) => d.overdueDays > 0));
  list('Hoje', c.due.filter((d) => d.overdueDays === 0));
  const next = c.upcoming.filter((u) => u.count > 0).map((u) => `${formatDay(u.date)}: ${u.count}`);
  box.append(reviewElement('h4', null, 'Próximos 7 dias'));
  box.append(reviewElement('p', 'review-upcoming', next.length ? next.join('  ·  ') : 'Nada agendado.'));
  const close = reviewElement('button', 'btn', 'Fechar');
  close.addEventListener('click', () => closeModal());
  box.append(close);
  modal.append(box);
}

function openReviewsModal() {
  const modal = $('#modal');
  renderReviewsModal(modal);
  modal.hidden = false;
}

/** Aviso do sistema (desktop) uma vez por dia, quando há revisões. No tablet não há aviso do sistema: só a barra de status. */
async function checkDailyReviews() {
  const today = dayKey();
  if (!map) return null;   // sem mapa aberto (tela inicial) não há o que revisar: o temporizador não pode falhar
  const c = collectReviews(map.root, today);
  if (c.counts.total > 0) setStatus(notificationText(c.counts.today, c.counts.overdue));
  let last = null;
  try { last = localStorage.getItem(REVIEW_NOTIFIED_KEY); } catch { /* sem storage: avisa a cada verificação */ }
  if (!shouldNotify({ lastDay: last, today, total: c.counts.total })) return c;
  try { localStorage.setItem(REVIEW_NOTIFIED_KEY, today); } catch { /* sem storage */ }
  try { await ipcRenderer.invoke('notify:show', { title: 'BRANIAC · Revisões', body: notificationText(c.counts.today, c.counts.overdue) }); }
  catch { /* sem aviso do sistema neste aparelho: a barra de status já mostra */ }
  return c;
}

setTimeout(checkDailyReviews, 4000);
setInterval(checkDailyReviews, REVIEW_CHECK_MS);
