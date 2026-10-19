'use strict';
// Harness compartilhado pelos testes ponta a ponta: sobe o app REAL (electron/main.js) com userData temporário,
// substitui só os diálogos nativos (não automatizáveis) e expõe utilitários para dirigir a interface.
const { app, BrowserWindow, Menu, clipboard } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = async function start(title) {
  if (process.env.CI) app.commandLine.appendSwitch('no-sandbox'); // runners Linux não têm o sandbox SUID do Chromium
  process.env.MINDCRAFT_START = 'blank';   // os testes começam num mapa em branco (a tela inicial tem testes próprios)
process.env.MINDCRAFT_NO_LAUNCH = '1'; // os testes nunca abrem o Obsidian de verdade
  const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'mc e2e çãé-'));
  const USERDATA = path.join(TMP, 'userData');
  app.setPath('userData', USERDATA);
  const results = [];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  /** Espera ativa até n() ser verdadeira (evita esperas fixas, que viram testes instáveis sob carga). */
  const waitFor = async (fn, timeout = 10000, step = 40) => { const t0 = Date.now(); for (;;) { try { if (await fn()) return true; } catch { /* tenta de novo */ } if (Date.now() - t0 > timeout) throw new Error('tempo esgotado esperando a condição'); await wait(step); } };
  const eq = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg || 'valor'}: esperado ${JSON.stringify(b)}, obtido ${JSON.stringify(a)}`); };
  const ok = (c, msg) => { if (!c) throw new Error(msg); };
  async function t(name, fn) {
    if (process.env.E2E_TRACE) console.log('  → ' + name);          // com E2E_TRACE o log mostra qual teste está rodando (para achar travamentos)
    try { await fn(); results.push([name, true]); console.log('  ok   ' + name); }
    catch (e) {
      if (e && e.skip) { results.push([name, true, 'skip']); console.log('  SKIP ' + name + '\n       ' + e.message); }
      else { results.push([name, false, e.message]); console.log('  FAIL ' + name + '\n       ' + e.message); }
    }
  }

  const ctx = { TMP, USERDATA, wait, waitFor, eq, ok, t, app, Menu, results, errors: [] };
  /** A área de transferência do SO funciona? (pode estar bloqueada: sessão travada, gerenciador de clipboard…) */
  let clipProbe = null;
  ctx.clipboardOk = async () => {
    if (clipProbe === null) { const tag = 'probe-' + Date.now(); try { await clipboard.writeText(tag); await wait(150); clipProbe = String(await clipboard.readText()) === tag; } catch { clipProbe = false; } }
    return clipProbe;
  };
  /** Chame no início de um teste que depende da área de transferência: se ela não funciona, o teste é IGNORADO (e dito claramente), não reprovado. */
  ctx.requireClipboard = async () => { if (!(await ctx.clipboardOk())) throw Object.assign(new Error('ignorado: a área de transferência do sistema está indisponível neste ambiente (não é falha do app)'), { skip: true }); };
  ctx.readClip = async () => String(await clipboard.readText());   // a API pode ser síncrona ou assíncrona conforme a versão
  ctx.writeClip = async (text) => { await clipboard.writeText(text); };
  const ready = new Promise((resolve) => {
    app.whenReady().then(async () => {
      require('../electron/main.js');
      let win;
      for (let i = 0; i < 100 && !(win = BrowserWindow.getAllWindows()[0]); i++) await wait(50);
      win.webContents.on('console-message', (e, lvl, msg, line, src) => {
        const level = e.level ?? lvl, message = e.message ?? msg;
        if ((level === 'error' || level === 3) && !/Security Warning|Content-Security/.test(message || '')) ctx.errors.push(`${message} @${String((e.sourceId ?? src) || '').split('/').pop()}:${e.lineNumber ?? line}`);
      });
      await new Promise((r) => (win.webContents.isLoading() ? win.webContents.once('did-finish-load', r) : r()));
      await wait(400);
      win.show(); win.focus(); win.webContents.focus(); await wait(200);
      ctx.win = win;
      ctx.js = (code) => win.webContents.executeJavaScript(code, true);
  await ctx.js(`(async () => { for (let i = 0; i < 300 && !(typeof map !== 'undefined' && document.querySelector('.node')); i++) await new Promise((r) => setTimeout(r, 50)); return true; })()`);   // espera o 1º desenho (disco frio)

      ctx.menu = (id) => Menu.getApplicationMenu().getMenuItemById(id).click(undefined, win, win.webContents);
      ctx.shot = async (file) => {   // capturePage às vezes falha no Chromium ("UnknownVizError": leitura do quadro da GPU) — é do ambiente, não do app: tenta de novo
  await wait(350); fs.mkdirSync(path.dirname(file), { recursive: true });
  let last; for (let i = 0; i < 4; i++) { try { fs.writeFileSync(file, (await win.webContents.capturePage()).toPNG()); return; } catch (e) { last = e; await wait(400); } }
  throw last;
};
      // dublês dos diálogos nativos; exportação, caminhos e "recentes" passam para o processo principal de verdade
      await ctx.js(`window.__dlg = { save: null, open: null, csv: null, pack: null, pdf: null, openAt: null, folder: null, discard: 1, confirm: 0, errors: [], confirms: [] };
        const realInvoke = ipcRenderer.invoke.bind(ipcRenderer);
        ipcRenderer.invoke = async (ch, ...args) => {
          if (ch === 'render-export' || ch === 'app:path' || ch === 'app:start-override' || ch === 'recent:add' || ch === 'recent:remove' || ch === 'recent:clear' || ch === 'recent:list' || ch === 'clip:read' || ch === 'clip:write' || ch === 'obsidian:open' || ch === 'open-external') return realInvoke(ch, ...args);
          if (ch === 'notify:show') { (window.__dlg.notices = window.__dlg.notices || []).push(args[0]); return true; }   // não mostra toast de verdade nos testes
          if (ch === 'dialog:save') return window.__dlg.save;
          if (ch === 'dialog:open') return window.__dlg.open;
          if (ch === 'dialog:folder') return window.__dlg.folder;
          if (ch === 'dialog:open-at') return window.__dlg.openAt;
          if (ch === 'dialog:open-csv') return window.__dlg.csv;
          if (ch === 'dialog:open-pack') return window.__dlg.pack;
          if (ch === 'dialog:open-pdf') return window.__dlg.pdf;
          if (ch === 'dialog:confirm-discard') return window.__dlg.discard;
          if (ch === 'dialog:confirm') { window.__dlg.confirms.push(args[0]); return window.__dlg.confirm; }
          if (ch === 'dialog:error') { window.__dlg.errors.push(String(args[0])); return; }
        };
        window.__id = (title) => { let r; map.walk((n) => { if (n.title === title && !r) r = n.id; }); return r; };
        window.__shape = (id) => document.querySelector('[data-id="' + id + '"]').querySelector('rect,line');
        window.__pt = (id) => { const b = L.boxes.get(id), r = svg.getBoundingClientRect(); return { x: r.left + (b.x + b.w / 2) * pan.k + pan.x, y: r.top + (b.y + b.h / 2) * pan.k + pan.y }; };
        window.__ev = (id, type, o = {}) => { const p = __pt(id); document.querySelector('[data-id="' + id + '"]').dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: p.x, clientY: p.y, ...o })); };
        window.__md = (id, o = {}) => { __ev(id, 'mousedown', o); window.dispatchEvent(new MouseEvent('mouseup')); };
        window.__key = (k, target, o = {}) => (target || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, ...o }));
        window.__drag = (from, to, o = {}) => { const a = __pt(from), b = __pt(to);
          document.querySelector('[data-id="' + from + '"]').dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: a.x, clientY: a.y, ...o }));
          window.dispatchEvent(new MouseEvent('mousemove', { clientX: b.x, clientY: b.y }));
          window.dispatchEvent(new MouseEvent('mouseup', { clientX: b.x, clientY: b.y })); };
        window.__titles = () => { const r = []; map.walk((n, l) => r.push(l + ':' + n.title)); return r; };
        true`);
      ctx.titles = () => ctx.js('__titles()');
      // --classic: roda a mesma bateria na interface clássica (referência); ctx.ui(sel) diz qual interface desenhou o elemento
      ctx.CLASSIC = process.argv.includes('--classic');
      ctx.ui = (sel) => ctx.js(`document.querySelector(${JSON.stringify(sel)}).dataset.ui || 'classic'`);
      (async () => {
        if (ctx.CLASSIC) { await waitFor(() => ctx.js('!!userDataDir')); await ctx.js('saveCfg({ reactUi: false }); true'); }
        resolve(ctx);
      })();
    });
  });
  ctx.ready = ready;
  ctx.finish = async () => {
    const failed = results.filter((r) => !r[1]), skipped = results.filter((r) => r[2] === 'skip'), ran = results.length - skipped.length;
    console.log(`\n${ran - failed.length}/${ran} passaram${skipped.length ? `, ${skipped.length} ignorado(s) por ambiente (área de transferência indisponível)` : ''}${failed.length ? ' — FALHAS: ' + failed.map((f) => f[0]).join('; ') : ''}\n`);
    try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* temporários */ }
    app.exit(failed.length ? 1 : 0);
  };
  console.log(`\n${title}\n`);
  return ready;
};
