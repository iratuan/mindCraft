'use strict';
/**
 * Lembrete de cópia de segurança FORA do aparelho (pacote .mcpack ou backup do banco). Só a regra: a tela inicial mostra o resultado.
 * Estado guardado em config.json (só neste aparelho; nunca viaja no pacote): lastBackup ('AAAA-MM-DD'), backupSnoozeUntil e backupEveryDays.
 */
const { addDays, diffDays, isDateStr } = require('./study');

const DEFAULT_DAYS = 14;
const CHOICES = [7, 14, 30, 0];             // 0 = nunca lembrar
const SNOOZE_DAYS = 3;

/** Intervalo válido (7, 14, 30 ou 0 = nunca); qualquer outra coisa volta ao padrão. */
const normalizeEvery = (v) => (CHOICES.includes(v) ? v : DEFAULT_DAYS);

/**
 * @param {{today:string, lastBackup?:string, snoozeUntil?:string, everyDays?:number, maps:number}} p  maps = quantos mapas existem na biblioteca
 * @returns {{show:boolean, reason:'never'|'old'|null, days:number|null, every:number, lastBackup:string|null}}
 */
function evaluate({ today, lastBackup, snoozeUntil, everyDays, maps }) {
  const every = normalizeEvery(everyDays);
  const last = isDateStr(lastBackup) ? lastBackup : null;
  const out = { show: false, reason: null, days: last ? diffDays(last, today) : null, every, lastBackup: last };
  if (every === 0 || !(maps > 0) || !isDateStr(today)) return out;                 // desligado, ou nada a proteger
  if (isDateStr(snoozeUntil) && snoozeUntil > today) return out;                  // "lembrar depois"
  if (!last) return { ...out, show: true, reason: 'never' };
  if (out.days >= every) return { ...out, show: true, reason: 'old' };
  return out;
}

/** Data até a qual o aviso fica escondido depois de "lembrar depois". */
const snoozeDate = (today, days = SNOOZE_DAYS) => addDays(today, days);

/** Frase para a tela ("você ainda não fez…", "a última foi há 20 dias"). */
function message(r) {
  if (!r.show) return '';
  if (r.reason === 'never') return 'Você ainda não fez nenhuma cópia de segurança dos seus mapas fora deste aparelho.';
  const d = r.days;
  return `A última cópia de segurança foi ${d === 0 ? 'hoje' : d === 1 ? 'ontem' : `há ${d} dias`}.`;
}

module.exports = { DEFAULT_DAYS, CHOICES, SNOOZE_DAYS, normalizeEvery, evaluate, snoozeDate, message };
