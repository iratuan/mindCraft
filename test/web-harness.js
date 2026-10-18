'use strict';
// Harness da VERSÃO WEB/TABLET: monta build/web/app, serve por HTTP local e abre numa janela do Chromium SEM Node
// (nodeIntegration desligado, contextIsolation e sandbox ligados) — o mesmo tipo de ambiente de um navegador/WebView.
// Cada "partição" tem seu próprio IndexedDB; reabrir a janela com a mesma partição simula fechar e abrir o app no aparelho.
const { app, BrowserWindow } = require('electron');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildApp } = require('../tools/build-web-app');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.wasm': 'application/wasm', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };

module.exports = async function start(title, { width = 1280, height = 800 } = {}) {
  if (process.env.CI) app.commandLine.appendSwitch('no-sandbox');
  app.on('window-all-closed', () => { /* reabrir a janela (simular fechar/abrir o app) não pode encerrar o processo de teste */ });
  const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'mc web çãé-'));
  app.setPath('userData', path.join(TMP, 'ud'));
  const results = [], wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (fn, timeout = 10000, step = 40) => { const t0 = Date.now(); for (;;) { try { if (await fn()) return true; } catch { /* tenta de novo */ } if (Date.now() - t0 > timeout) throw new Error('tempo esgotado esperando a condição'); await wait(step); } };
  const eq = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg || 'valor'}: esperado ${JSON.stringify(b)}, obtido ${JSON.stringify(a)}`); };
  const ok = (c, msg) => { if (!c) throw new Error(msg); };
  async function t(name, fn) {
    try { await fn(); results.push([name, true]); console.log('  ok   ' + name); }
    catch (e) { results.push([name, false, e.message]); console.log('  FAIL ' + name + '\n       ' + e.message); }
  }
  await app.whenReady();
  const built = await buildApp({ dir: path.join(TMP, 'app') });
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html', file = path.join(built.dir, rel);
    if (!file.startsWith(built.dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; res.end('não encontrado'); return; }
    res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream'); res.setHeader('Cache-Control', 'no-store'); res.end(fs.readFileSync(file));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}/index.html`;

  const ctx = { TMP, wait, waitFor, eq, ok, t, results, errors: [], url, app, partition: 'persist:mcweb-' + Date.now(), win: null };
  ctx.js = (code) => ctx.win.webContents.executeJavaScript(code, true);
  /** Abre (ou reabre) a janela do app; `partition` igual = mesmo armazenamento do aparelho. */
  ctx.open = async ({ partition = ctx.partition, dbName } = {}) => {
    if (ctx.win && !ctx.win.isDestroyed()) { ctx.win.destroy(); await wait(400); }   // deixa o armazenamento da janela anterior ser liberado
    const win = new BrowserWindow({ width, height, show: true, webPreferences: { partition, nodeIntegration: false, contextIsolation: true, sandbox: true } });
    ctx.win = win;
    win.webContents.on('console-message', (e, lvl, msg, line, src) => {
      const level = e.level ?? lvl, message = e.message ?? msg;
      if ((level === 'error' || level === 3) && !/Security Warning|Content-Security|favicon/.test(message || '')) ctx.errors.push(`${message} @${String((e.sourceId ?? src) || '').split('/').pop()}:${e.lineNumber ?? line}`);
    });
    win.webContents.on('render-process-gone', (_e, d) => ctx.errors.push('processo da página caiu: ' + d.reason));
    for (let i = 1; ; i++) { try { await win.loadURL(url); break; } catch (e) { if (i >= 4) throw e; await wait(500 * i); } }
    await waitFor(() => ctx.js(`!!(window.__mcHost && window.MCReact && typeof act !== 'undefined' && document.documentElement.dataset.host === 'web')`), 30000);
    await ctx.js(`window.__mcSaveAsAuto = true; window.__downloads = []; window.__mcDownload = ({ name, bytes }) => window.__downloads.push({ name, len: bytes.length, b64: btoa(String.fromCharCode(...bytes.subarray(0, 4000000))) }); window.__pickQueue = []; window.__mcPick = async () => window.__pickQueue.shift() || null; true`);
    if (ctx.emu) await ctx.applyEmulation();
    await wait(250); win.focus(); win.webContents.focus();
    return win;
  };
  /** Próximo seletor de arquivo devolve estes arquivos (bytes em base64): é o "usuário escolheu o arquivo". */
  /**
   * Emula um tablet (tela, "pointer: coarse", toques reais). Os toques vão pelo protocolo do Chromium (Input.dispatchTouchEvent),
   * então a página recebe pointerdown/move/up com pointerType 'touch', exatamente como num aparelho.
   */
  ctx.emulate = async ({ width = 1280, height = 800, dsf = 1 } = {}) => { ctx.emu = { width, height, dsf }; if (ctx.win) await ctx.applyEmulation(); if (ctx.win) { try { ctx.win.setContentSize(width, height); } catch { /* tamanho da janela é só estética */ } } };
  ctx.applyEmulation = async () => {
    const dbg = ctx.win.webContents.debugger; if (!dbg.isAttached()) dbg.attach('1.3');
    const { width, height, dsf } = ctx.emu;
    await dbg.sendCommand('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dsf, mobile: true, screenWidth: width, screenHeight: height });
    await dbg.sendCommand('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await dbg.sendCommand('Emulation.setEmitTouchEventsForMouse', { enabled: false });
  };
  const send = (type, pts) => ctx.win.webContents.debugger.sendCommand('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p.x, y: p.y, id: p.id ?? i + 1, radiusX: 8, radiusY: 8, force: 0.5 })) });
  ctx.touch = {
    tap: async (x, y) => { await send('touchStart', [{ x, y }]); await wait(30); await send('touchEnd', []); },
    doubleTap: async (x, y, gap = 90) => { await ctx.touch.tap(x, y); await wait(gap); await ctx.touch.tap(x, y); },
    longPress: async (x, y, ms = 750) => { await send('touchStart', [{ x, y }]); await wait(ms); await send('touchEnd', []); },
    drag: async (x1, y1, x2, y2, steps = 12) => { await send('touchStart', [{ x: x1, y: y1 }]); for (let i = 1; i <= steps; i++) { await send('touchMove', [{ x: x1 + ((x2 - x1) * i) / steps, y: y1 + ((y2 - y1) * i) / steps }]); await wait(12); } await wait(30); await send('touchEnd', []); },
    /** Pinça horizontal em torno de (cx,cy): a distância entre os dedos vai de d1 a d2 (CSS px). */
    pinch: async (cx, cy, d1, d2, steps = 14) => {
      const pts = (d) => [{ x: cx - d / 2, y: cy, id: 1 }, { x: cx + d / 2, y: cy, id: 2 }];
      await send('touchStart', pts(d1)); await wait(20);
      for (let i = 1; i <= steps; i++) { await send('touchMove', pts(d1 + ((d2 - d1) * i) / steps)); await wait(12); }
      await wait(30); await send('touchEnd', []);
    },
  };
  ctx.pickNext = (files) => ctx.js(`window.__pickQueue.push(${JSON.stringify(files)}.map((f) => ({ name: f.name, bytes: Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0)) }))); true`);
  ctx.downloads = () => ctx.js('window.__downloads');
  ctx.idle = () => ctx.js('window.__mcHost.idle()');
  ctx.shot = async (file) => { await wait(350); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, (await ctx.win.webContents.capturePage()).toPNG()); };
  ctx.finish = async () => {
    const failed = results.filter((r) => !r[1]);
    console.log(`\n${results.length - failed.length}/${results.length} passaram${failed.length ? ' — FALHAS: ' + failed.map((f) => f[0]).join('; ') : ''}`);
    try { server.close(); } catch { /* servidor */ }
    try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* temporários */ }
    app.exit(failed.length ? 1 : 0);
  };
  console.log(`\n${title}\n`);
  return ctx;
};
