'use strict';
/**
 * Integração com o Android (Capacitor), ativada SÓ quando o app roda empacotado como .apk; no navegador comum nada disto é usado.
 * Fala com os plugins nativos por `Capacitor.nativePromise` (já presente na ponte do Capacitor; não precisa empacotar os módulos JS):
 *   • entregar arquivos (exportações, backups) pela janela de compartilhamento do Android (Drive, Arquivos, e-mail…)
 *   • notificações: imediata e AGENDADAS para os próximos dias (funcionam com o app fechado)
 *   • botão Voltar (fecha a camada aberta; na raiz, minimiza em vez de fechar o app) e gravação ao sair do app
 */
const REMINDER_IDS = [1001, 1002, 1003, 1004, 1005, 1006, 1007];       // um alarme por dia, nos próximos 7 dias
const REMINDER_DAYS = REMINDER_IDS.length;

const cap = () => (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform() ? window.Capacitor : null);
const isNative = () => !!cap();
/** Chama um plugin nativo; se falhar, registra QUAL chamada falhou (o Capacitor só imprime "Object") e repassa o erro. */
const call = (plugin, method, opts) => cap().nativePromise(plugin, method, opts || {}).catch((e) => { try { console.warn('[nativo] ' + plugin + '.' + method + ' falhou: ' + (e && (e.message || JSON.stringify(e)))); } catch { /* sem log */ } throw e; });
const listen = (plugin, event, fn) => cap().addListener(plugin, event, fn);

function toBase64(bytes) { let s = ''; const CH = 0x8000; for (let i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH)); return btoa(s); }

/** Próximas ocorrências do horário HH:MM (a primeira só se ainda não passou hoje, com 1 min de folga). */
function nextTimes(hm, count, now = new Date()) {
  const [h, m] = hm.split(':').map(Number), out = [];
  for (let d = 0; out.length < count && d < count + 2; d++) { const t = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, h, m, 0, 0); if (t.getTime() > now.getTime() + 60000) out.push(t); }
  return out;
}

function installNative({ ipc, fs, store, dialogs, emitMenu, readCfg }) {
  if (!isNative()) return null;
  const state = { permission: null, lastSig: null };

  // ---------- arquivos: compartilhar ----------
  // O Android só aceita UM compartilhamento por vez ("Can't share while sharing is in progress"): as entregas entram numa fila e, se o
  // sistema ainda estiver mostrando o compartilhamento anterior, esperam e tentam de novo (nada se perde, nenhum erro confuso para o usuário).
  let shareChain = Promise.resolve();
  function deliver(name, bytes) {
    const run = async () => {
      try {
        const w = await call('Filesystem', 'writeFile', { path: 'mindcraft/' + name, data: toBase64(bytes), directory: 'CACHE', recursive: true });
        for (let tent = 0; ; tent++) {
          try { await call('Share', 'share', { title: name, text: name, url: w.uri, dialogTitle: 'Salvar ou enviar "' + name + '"' }); return; }
          catch (e) { if (/in progress/i.test(String(e && (e.message || e))) && tent < 20) { await new Promise((r) => setTimeout(r, 1500)); continue; } throw e; }
        }
      } catch (e) { if (!/cancel/i.test(String(e && (e.message || e)))) dialogs.errorBox('Não consegui compartilhar o arquivo: ' + (e && e.message || e)); }
    };
    shareChain = shareChain.then(run, run); return shareChain;
  }

  // ---------- notificações ----------
  async function ensurePermission(ask) {
    let p = (await call('LocalNotifications', 'checkPermissions')).display;
    if (p !== 'granted' && ask && p !== 'denied') p = (await call('LocalNotifications', 'requestPermissions')).display;
    state.permission = p; return p === 'granted';
  }
  async function ensureChannel() { try { await call('LocalNotifications', 'createChannel', { id: 'estudo', name: 'Lembretes de estudo', description: 'Revisões do dia e erros para refazer', importance: 4 }); } catch { /* canal já existe */ } }
  async function showNow(n) {
    if (!(await ensurePermission(true))) return false;
    await ensureChannel();
    await call('LocalNotifications', 'schedule', { notifications: [{ id: 2000 + Math.floor(Math.random() * 900), title: n.title, body: n.body, channelId: 'estudo', isExactNotification: false, schedule: { at: new Date(Date.now() + 700).toISOString(), allowWhileIdle: true } }] });
    return true;
  }
  // isExactNotification:false em TODAS as notificações: o padrão do plugin é "exata", o que leva o usuário à tela especial "Alarmes e lembretes" das
  // configurações do Android. Um lembrete de estudo não precisa de precisão de segundo (o Android entrega em poucos minutos, mesmo em modo de economia).
  /** Agenda os lembretes dos próximos dias com o número ATUAL de revisões (o 1º) e um texto geral (os demais); refeito sempre que o app sai de cena. */
  async function syncReminders({ force = false } = {}) {
    let cfg = {}; try { cfg = readCfg() || {}; } catch { /* sem configuração */ }
    const on = cfg.notifyDaily === true, at = /^([01]\d|2[0-3]):[0-5]\d$/.test(cfg.notifyAt || '') ? cfg.notifyAt : '08:00';
    let notice = null;
    if (on) { try { notice = window.MindCore.notify.buildNotice(window.noticeCounts(window.nowStr())); } catch { /* sem contagem */ } }
    const sig = on + '|' + at + '|' + (notice ? notice.body : '') + '|' + new Date().toDateString();
    if (!force && sig === state.lastSig) return false; state.lastSig = sig;
    await call('LocalNotifications', 'cancel', { notifications: REMINDER_IDS.map((id) => ({ id })) });
    if (!on) return false;
    if (!(await ensurePermission(true))) return false;
    await ensureChannel();
    const times = nextTimes(at, REMINDER_DAYS);
    await call('LocalNotifications', 'schedule', { notifications: times.map((t, i) => ({ id: REMINDER_IDS[i], title: 'MindCraft — hora de estudar', channelId: 'estudo', isExactNotification: false,
      body: i === 0 && notice ? notice.body : 'Abra o MindCraft para ver suas revisões e os erros para refazer.', schedule: { at: t.toISOString(), allowWhileIdle: true } })) });
    return true;
  }
  ipc.handlers['notify:show'] = async (n) => { const m = window.MindCore.notify.sanitizeNotice(n); if (!m) return false; try { return await showNow(m); } catch { return false; } };
  ipc.handlers['open-external'] = async (url) => { const u = String(url || ''); if (!/^(https?:\/\/|mailto:)[^\s<>"']+$/i.test(u)) return { ok: false }; try { await call('App', 'openUrl', { url: u }); return { ok: true, url: u }; } catch (e) { return { ok: false, error: String(e && e.message || e) }; } };
  try { listen('LocalNotifications', 'localNotificationActionPerformed', () => emitMenu('review')); } catch { /* sem toque na notificação */ }

  // mudou a opção "avisar das revisões": reagenda (config.json é gravado pela interface)
  let t1 = null; fs.vfs.onChange(({ op, path: p }) => { if (op === 'write' && p === '/userdata/config.json') { clearTimeout(t1); t1 = setTimeout(() => syncReminders().catch(() => {}), 600); } });

  // ---------- ciclo de vida ----------
  const leave = () => { try { store.flushNow(); } catch { /* sem armazenamento */ } syncReminders().catch(() => {}); };
  listen('App', 'pause', leave); listen('App', 'resume', () => { syncReminders().catch(() => {}); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') leave(); });

  // ---------- botão Voltar ----------
  // (offsetParent é nulo em elementos de posição fixa, como as janelas: não serve para saber se algo está visível)
  const vis = (sel) => { const e = document.querySelector(sel); return !!e && !e.hidden && (e.offsetWidth > 0 || e.offsetHeight > 0 || e.getClientRects().length > 0) && getComputedStyle(e).visibility !== 'hidden'; };
  function onBack() {
    const esc = (target) => (target || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    if (document.querySelector('.mchost-ov')) return esc(document);                     // diálogo do app
    if (vis('#mcHostMenu')) return esc(document);                                        // menu ☰
    if (document.body.classList.contains('tb-panels')) return esc(document);             // gaveta de painéis
    if (vis('#modal')) return esc(document.querySelector('#modal'));                      // janelas (biblioteca, CSV…): o Esc delas escuta no próprio #modal
    if (vis('#graph') || vis('#dash') || vis('#home')) return esc(document.body);        // rede, painel de estudos, tela inicial
    if (!document.querySelector('#editor').hidden) return esc(document.querySelector('#editor'));
    if (typeof window.act === 'object' && vis('#pdfpane')) return window.act.pdf();     // leitor de PDF
    return call('App', 'minimizeApp').catch(() => {});                                   // raiz: vai para o fundo (não fecha o app)
  }
  listen('App', 'backButton', onBack);
  return { deliver, showNow, syncReminders, onBack, ensurePermission, isNative: true };
}
module.exports = { installNative, isNative, nextTimes, toBase64 };
