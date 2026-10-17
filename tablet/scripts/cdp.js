'use strict';
// Conecta ao WebView do app no Android (emulador ou aparelho USB) pelo protocolo DevTools e executa JavaScript na página.
//   node scripts/cdp.js "expressão"            → resultado
//   node scripts/cdp.js --logs [segundos]      → console da página durante N segundos (padrão 5), recarregando a página
// Requer o app aberto, versão debug (WebView depurável) e `adb` no SDK.
const { spawnSync } = require('child_process');
const http = require('http');
const path = require('path');

const sdk = process.env.ANDROID_HOME || path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');
const adb = path.join(sdk, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
const sh = (...a) => spawnSync(adb, a, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });   // dumpsys passa de 1 MB (o padrão truncava a saída)
const get = (u) => new Promise((res, rej) => http.get(u, (r) => { let b = ''; r.on('data', (d) => (b += d)); r.on('end', () => { try { res(JSON.parse(b)); } catch (e) { rej(e); } }); }).on('error', rej));

async function connect(port = 9333) {
  const pid = sh('shell', 'pidof', 'app.mindcraft.estudos').stdout.trim().split(/\s+/)[0];
  if (!pid) throw new Error('O MindCraft não está aberto no aparelho (abra o app e tente de novo).');
  const unix = sh('shell', 'cat', '/proc/net/unix').stdout; const m = new RegExp(`@(webview_devtools_remote_${pid})`).exec(unix);
  if (!m) throw new Error('WebView sem depuração (use a versão debug).');
  sh('forward', `tcp:${port}`, `localabstract:${m[1]}`);
  const pages = await get(`http://127.0.0.1:${port}/json`); const pg = pages.find((p) => p.type === 'page') || pages[0];
  if (!pg) throw new Error('Nenhuma página no WebView.');
  const ws = new WebSocket(pg.webSocketDebuggerUrl); let id = 0; const pend = new Map(); const events = [];
  ws.onmessage = (m2) => { const d = JSON.parse(m2.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } else if (d.method) events.push(d); };
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('falha ao abrir o WebSocket')); });
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.result && r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception ? r.result.exceptionDetails.exception.description : r.result.exceptionDetails.text); return r.result.result.value; };
  return { send, ev, events, close: () => ws.close(), url: pg.url };
}
module.exports = { connect, adb, sh };

if (require.main === module) {
  (async () => {
    const c = await connect(); const arg = process.argv[2];
    if (arg === '--logs') {
      await c.send('Runtime.enable'); await c.send('Log.enable'); await c.send('Page.enable'); await c.send('Page.reload', { ignoreCache: true });
      await new Promise((r) => setTimeout(r, (Number(process.argv[3]) || 5) * 1000));
      for (const e of c.events) { if (e.method === 'Runtime.consoleAPICalled') console.log('[console.' + e.params.type + ']', e.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 400)); else if (e.method === 'Runtime.exceptionThrown') console.log('[EXCEÇÃO]', (e.params.exceptionDetails.exception && e.params.exceptionDetails.exception.description || e.params.exceptionDetails.text).slice(0, 600)); else if (e.method === 'Log.entryAdded') console.log('[log.' + e.params.entry.level + ']', e.params.entry.text.slice(0, 300), e.params.entry.url || ''); }
    } else console.log(JSON.stringify(await c.ev(arg), null, 1));
    c.close(); process.exit(0);
  })().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
}
