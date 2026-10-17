'use strict';
/**
 * Aviso diário de revisões (notificação do sistema). Lógica pura e testável: quando avisar e o que dizer.
 * O aviso só acontece com o app aberto (nada é agendado no sistema operacional) e no máximo uma vez por dia.
 */
const isTime = (s) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

/** Deve avisar agora? `hm` = "HH:MM" local; `notifiedOn` = último dia avisado. */
function shouldNotify({ enabled, at = '08:00', notifiedOn = null, today, hm }) {
  return enabled === true && isTime(at) && isTime(hm) && hm >= at && notifiedOn !== today;
}

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
/** Texto do aviso, ou null se não há nada a dizer (nunca incomoda à toa). */
function buildNotice({ due = 0, dueMaps = 0, errors = 0 } = {}) {
  due = Math.max(0, Math.floor(due) || 0); errors = Math.max(0, Math.floor(errors) || 0); dueMaps = Math.max(0, Math.floor(dueMaps) || 0);
  if (!due && !errors) return null;
  const parts = [];
  if (due) parts.push(plural(due, 'revisão vencida', 'revisões vencidas') + (dueMaps > 1 ? ` em ${dueMaps} mapas` : ''));
  if (errors) parts.push(plural(errors, 'erro para refazer', 'erros para refazer'));
  return { title: 'MindCraft — hora de estudar', body: parts.join(' · ') };
}

/** Valida o que chega ao processo principal (texto simples, tamanho limitado). */
function sanitizeNotice(n) {
  if (!n || typeof n !== 'object') return null;
  const t = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
  const title = t(n.title, 80), body = t(n.body, 240);
  return title ? { title, body } : null;
}
module.exports = { isTime, shouldNotify, buildNotice, sanitizeNotice };
