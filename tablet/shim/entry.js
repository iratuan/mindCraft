'use strict';
/**
 * Entrada do tablet (empacotada pelo tablet/scripts/build-www.js, antes dos scripts da interface).
 * - Faz `require`, `process` e `__dirname` existirem no navegador, para a interface rodar sem alterações.
 * - Carrega os arquivos do aparelho no sistema de arquivos virtual antes de a interface pedir qualquer coisa.
 * - Grava as mudanças no aparelho (sem apagar antes de gravar o que substitui) e avisa se não conseguir.
 * - Menu do tablet (toque na marca), botão Voltar do Android e pausa do app.
 */
require('./globals');   // Buffer global (o núcleo usa)
// o tablet é a plataforma "web" do layout: em janela estreita (retrato) o painel lateral vira gaveta (layout-ui.js)
document.documentElement.dataset.host = 'web';
const { Filesystem, Directory } = require('@capacitor/filesystem');
const { App } = require('@capacitor/app');
const fs = require('./fs-vfs');
const path = require('./path');
const host = require('./host');
const core = require('core-registry');   // gerado pelo build (ver tablet/scripts/build-www.js)

/* ---------- require e process para a interface ---------- */
const NATIVE = { electron: host, fs, path };
window.require = (id) => {
  const name = String(id);
  if (NATIVE[name]) return NATIVE[name];
  const base = path.basename(name);
  if (name.includes('/core/') && core[base]) return core[base];   // path.join(core, 'components', 'model') -> /app/core/model
  throw new Error('Módulo indisponível no tablet: ' + name);
};
window.process = { pid: 1, platform: 'android', env: {}, versions: {}, cwd: () => '/' };
window.__dirname = '/app/renderer';

/* ---------- carregamento e gravação no aparelho ---------- */
const NATIVE_ROOT = 'braniac/app-data';
async function walk(nativeDir, virtualDir, entries, dirs) {
  const listing = await Filesystem.readdir({ path: nativeDir, directory: Directory.Data }).catch(() => ({ files: [] }));
  for (const f of listing.files) {
    const v = virtualDir + '/' + f.name, n = nativeDir + '/' + f.name;
    if (f.type === 'directory') { dirs.push(v); await walk(n, v, entries, dirs); continue; }
    const r = await Filesystem.readFile({ path: n, directory: Directory.Data });
    entries.push([v, host.fromBase64(r.data), Date.now()]);
  }
}
async function loadFromDevice() {
  const entries = [], dirs = ['/app-data'];
  await walk(NATIVE_ROOT, '/app-data', entries, dirs);
  fs.vfs.loadRaw(entries, dirs);
}

const dirtyFiles = new Set(), goneFiles = new Set(), toShare = new Set();
let timer = null, chain = Promise.resolve(), warned = false;
fs.vfs.onChange(({ op, path: p }) => {
  if (op === 'write') { dirtyFiles.add(p); goneFiles.delete(p); if (host.sharePending.has(p)) toShare.add(p); }
  else if (op === 'delete') { goneFiles.add(p); dirtyFiles.delete(p); }
  else return;
  schedule();
});
function schedule() { clearTimeout(timer); timer = setTimeout(flush, 400); }

/** Grava primeiro (o que foi criado ou trocado), depois apaga (o que saiu). Se falhar, tenta de novo na próxima mudança. */
function flush() {
  clearTimeout(timer);
  chain = chain.then(async () => {
    for (const p of [...dirtyFiles]) {
      const bytes = fs.vfs.rawGet(p);
      if (!bytes) { dirtyFiles.delete(p); continue; }
      await Filesystem.writeFile({ path: host.nativeOf(p), directory: Directory.Data, data: host.toBase64(bytes), recursive: true });
      dirtyFiles.delete(p);
    }
    for (const p of [...goneFiles]) {
      await Filesystem.deleteFile({ path: host.nativeOf(p), directory: Directory.Data }).catch(() => {});
      goneFiles.delete(p);
    }
    for (const p of [...toShare]) {
      toShare.delete(p); host.sharePending.delete(p);
      await host.shareFile(p).catch(() => {});
    }
  }).catch(async () => {
    if (warned) return;
    warned = true;
    await host.askButtons({ message: 'Não consegui gravar no armazenamento do aparelho.', detail: 'Compartilhe o arquivo para não perder o trabalho, e tente de novo.' });
  });
  return chain;
}

/* ---------- Voltar do Android: fecha o que estiver aberto; senão volta ao início (com confirmação) ---------- */
async function onBack() {
  const top = document.querySelector('.tab-dialog-wrap, .tab-sheet');
  if (top) { top.remove(); return; }
  const modal = document.querySelector('#modal');
  if (modal && !modal.hidden) { modal.hidden = true; return; }
  if (!host.state.mapOpen) { App.exitApp(); return; }
  if (host.state.dirty) {
    const c = await host.askButtons({ message: 'Há alterações não salvas.', detail: 'Deseja salvar antes de voltar ao início?', buttons: ['Salvar', 'Descartar', 'Cancelar'] });
    if (c === 2) return;
    if (c === 0) host.emit('menu', 'save');
  }
  host.emit('menu', 'home');
}

/* ---------- arranque ---------- */
// os canais esperam esta carga (ver host.setGate); sem arquivos salvos ainda, começa vazio
host.setGate(loadFromDevice().catch(() => {}));

window.addEventListener('DOMContentLoaded', () => {
  App.addListener('backButton', onBack);
  App.addListener('pause', () => { flush(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
});

window.BRANIAC_TABLET = { flush };
