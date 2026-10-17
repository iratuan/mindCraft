'use strict';
/**
 * Hospedeiro web/tablet do MindCraft. Prepara um ambiente que se comporta como o Electron para a interface (renderer/*.js, sem alterações):
 *   1) carrega o SQLite (WebAssembly)  2) restaura os arquivos do aparelho (IndexedDB)  3) define require/electron/__dirname
 *   4) liga entrega de exportações, arrastar-e-soltar e menu  5) carrega os scripts da interface na mesma ordem do desktop.
 * O núcleo (MindCore) vem de core-browser.js, carregado antes.
 */
const { openStore } = require('./store');
const { createIpc } = require('./ipc');
const dialogs = require('./dialogs');
const files = require('./files');
const { installMenu } = require('./menu');

const loadScript = (src) => new Promise((resolve, reject) => { const s = document.createElement('script'); s.src = src; s.async = false; s.onload = () => resolve(); s.onerror = () => reject(new Error('Não consegui carregar ' + src)); document.head.append(s); });

async function boot() {
  const MC = window.MindCore, fs = MC.__fs, path = MC.__path;
  await loadScript('sql-wasm-browser.js');
  MC.__sqlite.setSql(await window.initSqlJs({ locateFile: () => 'sql-wasm-browser.wasm' }));
  const store = await openStore(window.__MC_DB_NAME || 'mindcraft-web');
  const restored = await store.loadInto(fs); store.attach(fs.vfs);
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch { /* o navegador decide */ }
  window.addEventListener('mc:storage-error', (e) => dialogs.toast('Não consegui gravar no armazenamento do aparelho (' + e.detail.message + '). Vou tentar de novo; não feche o app ainda.'));

  const ipc = createIpc({ fs, path, MindCore: MC });
  window.__dirname = '/app/renderer';
  window.require = function require(name) {
    if (name === 'electron') return { ipcRenderer: ipc.ipcRenderer, webUtils: { getPathForFile: (f) => (f && f.__mcPath) || '' } };
    if (name === 'fs' || name === 'node:fs') return fs;
    if (name === 'path' || name === 'node:path') return path;
    if (typeof name === 'string' && name.startsWith('/app/core/') && MC[name.slice('/app/core/'.length)]) return MC[name.slice('/app/core/'.length)];
    throw new Error('Módulo indisponível na versão tablet: ' + name);
  };

  // exportações (tudo que a interface grava em /exports) viram download quando a gravação termina
  const timers = new Map();
  fs.vfs.onChange(({ op, path: p }) => {
    if (op !== 'write' || !p.startsWith('/exports/') || /\.tmp-/.test(p)) return;
    clearTimeout(timers.get(p)); timers.set(p, setTimeout(() => { timers.delete(p); try { const bytes = new Uint8Array(fs.readFileSync(p)); files.deliver(path.basename(p), bytes); fs.rmSync(p, { force: true }); } catch (e) { dialogs.errorBox('Não consegui entregar o arquivo: ' + e.message); } }, 120));
  });

  // arrastar arquivos para a janela
  window.addEventListener('dragover', (e) => e.preventDefault(), true);
  window.addEventListener('drop', async (e) => {
    if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const paths = []; for (const f of e.dataTransfer.files) { const bytes = new Uint8Array(await f.arrayBuffer()); const ext = files.extOf(f.name); paths.push(files.place(fs, path, ext === 'pdf' ? '/pdfs' : ext === 'mcpack' ? '/imports' : '/docs', f.name, bytes)); }
    if (window.MC && window.MC.handleDroppedPaths) window.MC.handleDroppedPaths(paths);
  }, true);

  window.__mcHost = { store, ipc, fs, path, restored, idle: () => store.idle(), version: 1 };
  installMenu({ emit: (cmd) => ipc.ipcRenderer.emit('menu', {}, cmd) });
  // No desktop o evento "load" só acontece depois de TODOS os scripts da interface (renderer.js espera por ele antes de escolher a tela inicial).
  // Aqui os scripts entram dinamicamente, então reproduzimos a mesma ordem: a página fica "carregando" até o último script e então dispara "load".
  let ready = 'loading'; Object.defineProperty(document, 'readyState', { configurable: true, get: () => ready });
  for (const src of window.__MC_APP_SCRIPTS || []) await loadScript(src);
  document.documentElement.dataset.host = 'web';
  ready = 'complete'; window.dispatchEvent(new Event('load'));
}
boot().catch((e) => { console.error('MindCraft web: falha ao iniciar', e); document.body.insertAdjacentHTML('afterbegin', '<pre style="color:#ff8a90;padding:16px;white-space:pre-wrap">Não foi possível iniciar o MindCraft: ' + String(e && e.message).replace(/</g, '&lt;') + '</pre>'); });
