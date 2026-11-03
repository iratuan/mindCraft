'use strict';
/**
 * Hospedeiro do tablet: responde aos canais de IPC que a interface usa no desktop (electron/main.js), com os recursos do Android.
 * Abrir e salvar: o arquivo escolhido é copiado para a pasta do app; salvar grava lá e oferece "Compartilhar" para levar a cópia
 * para onde o usuário quiser (o Android não deixa sobrescrever o arquivo original sem permissão). Chave da IA: armazenamento seguro.
 */
const { Filesystem, Directory } = require('@capacitor/filesystem');
const { Share } = require('@capacitor/share');
const { Clipboard } = require('@capacitor/clipboard');
const { Browser } = require('@capacitor/browser');
const { FilePicker } = require('@capawesome/capacitor-file-picker');
const fs = require('./fs-vfs');
const ai = require('./ai-host');

const APP_DIR = '/app-data';                    // raiz virtual dos dados do app (no aparelho: pasta "braniac" interna)
const handlers = new Map();                     // canal -> função (invoke)
const listeners = new Map();                    // evento -> funções (eventos vindos do "processo principal")
const state = { dirty: false, mapOpen: false };
/** Barreira: os canais só respondem depois que os arquivos do aparelho foram carregados (ver entry.js). */
let gate = Promise.resolve();
const setGate = (p) => { gate = p; };
/** Exportações gravadas nesta sessão que devem ser oferecidas para compartilhar assim que forem para o disco. */
const sharePending = new Set();

const safeName = (n) => String(n || 'mapa').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').slice(0, 120) || 'mapa';
const nativeOf = (p) => 'braniac' + p;          // /app-data/x.mom -> braniac/app-data/x.mom (dentro de Directory.Data)

/** Caminho livre na pasta: acrescenta " (2)", " (3)"... sem nunca sobrescrever um arquivo existente. */
function uniquePath(dir, name) {
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 ? name.slice(dot) : '';
  const stem = ext ? name.slice(0, dot) : name;
  let p = `${dir}/${name}`;
  for (let i = 2; fs.existsSync(p); i++) p = `${dir}/${stem} (${i})${ext}`;
  return p;
}

/* ---------- caixa de diálogo própria (aceita mais de dois botões) ---------- */
function askButtons({ title = 'BRANIAC', message, detail = '', buttons = ['OK'] }) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'tab-dialog-wrap';
    wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true');
    const box = document.createElement('div'); box.className = 'tab-dialog';
    const h = document.createElement('h2'); h.textContent = title;
    const p = document.createElement('p'); p.textContent = message;
    box.append(h, p);
    if (detail) { const d = document.createElement('p'); d.className = 'tab-dialog-detail'; d.textContent = detail; box.append(d); }
    const row = document.createElement('div'); row.className = 'tab-dialog-actions';
    buttons.forEach((label, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = label;
      b.className = i === 0 ? 'tab-btn primary' : 'tab-btn';
      b.onclick = () => { wrap.remove(); resolve(i); };
      row.append(b);
    });
    box.append(row); wrap.append(box); document.body.append(wrap);
    if (row.firstChild) row.firstChild.focus();
  });
}

/* ---------- arquivos ---------- */
function toBase64(u8) {
  let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}
function fromBase64(b64) {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}

/** Copia um arquivo escolhido no seletor para uma pasta do app e devolve o caminho virtual (mapas em maps/, PDFs em pdfs/). */
async function importPicked(file, folder = 'maps') {
  let data = file.data;
  if (!data) data = (await Filesystem.readFile({ path: file.path })).data;
  const bytes = typeof data === 'string' ? fromBase64(data) : data;
  fs.mkdirSync(`${APP_DIR}/${folder}`, { recursive: true });
  const p = uniquePath(`${APP_DIR}/${folder}`, safeName(file.name));
  fs.writeFileSync(p, bytes);
  return p;
}

/** Abre a folha de compartilhamento com o arquivo já gravado (o usuário escolhe salvar em Arquivos, enviar ou copiar). */
async function shareFile(p) {
  const { uri } = await Filesystem.getUri({ path: nativeOf(p), directory: Directory.Data });
  await Share.share({ title: 'BRANIAC', text: p.slice(p.lastIndexOf('/') + 1), files: [uri], dialogTitle: 'Salvar ou enviar' }).catch(() => {});
}

/* ---------- canais (mesmos nomes e formatos do desktop) ---------- */
const reg = (channel, fn) => handlers.set(channel, fn);
reg('app:path', () => APP_DIR);
reg('app:start-override', () => null);

reg('dialog:open', async () => {
  const r = await FilePicker.pickFiles({ types: ['*/*'], limit: 1, readData: true }).catch(() => null);
  const f = r && r.files && r.files[0];
  if (!f) return null;
  if (!/\.mom$/i.test(f.name || '')) {
    await askButtons({ message: 'Escolha um arquivo .mom (mapa do Mindomo ou do BRANIAC).' });
    return null;
  }
  return importPicked(f);
});
reg('dialog:open-pdf', async () => {
  const r = await FilePicker.pickFiles({ types: ['application/pdf'], limit: 1, readData: true }).catch(() => null);
  const f = r && r.files && r.files[0];
  if (!f) return null;
  if (!/\.pdf$/i.test(f.name || '')) {
    await askButtons({ message: 'Escolha um arquivo PDF.' });
    return null;
  }
  return importPicked(f, 'pdfs');   // o leitor lê os bytes pelo sistema de arquivos do app
});
reg('dialog:open-at', async () => null);        // versões anteriores: ainda só no desktop
reg('dialog:folder', async () => null);         // rede entre mapas por pasta: ainda só no desktop
reg('dialog:save', async (defaultName) => {
  fs.mkdirSync(`${APP_DIR}/maps`, { recursive: true });
  return uniquePath(`${APP_DIR}/maps`, safeName(defaultName));
});
reg('dialog:save-export', async (kind, defaultName) => {
  fs.mkdirSync(`${APP_DIR}/exports`, { recursive: true });
  const p = uniquePath(`${APP_DIR}/exports`, safeName(defaultName));
  sharePending.add(p);                          // quando for gravado, oferece compartilhar
  return p;
});
reg('dialog:error', (msg) => askButtons({ message: String(msg) }));
reg('dialog:confirm', (o) => askButtons({ message: o.message, detail: o.detail, buttons: o.buttons }));
reg('dialog:confirm-discard', () => askButtons({
  message: 'Há alterações não salvas.', detail: 'Deseja salvar antes de continuar?', buttons: ['Salvar', 'Descartar', 'Cancelar'],
}));
// PDF: a impressão do Android ainda não está ligada ao gerador do desktop (ver tablet/README)
reg('export:pdf', async () => ({ ok: false, error: 'Exportar PDF ainda não está disponível no tablet. Use Markdown ou PNG.' }));

reg('clip:write', async (text) => { await Clipboard.write({ string: String(text) }); });
reg('clip:read', async () => String((await Clipboard.read().catch(() => ({ value: '' }))).value || ''));
reg('open-external', async (url) => {
  const u = String(url || '');
  if (!/^(https?:\/\/|mailto:)[^\s<>"']+$/i.test(u)) return { ok: false };
  await Browser.open({ url: u }).catch(() => {});
  return { ok: true };
});

const recentFile = `${APP_DIR}/recent.json`;
function loadRecent() {
  try {
    const list = JSON.parse(fs.readFileSync(recentFile, 'utf8'));
    return Array.isArray(list) ? list.filter((x) => typeof x === 'string') : [];
  } catch { return []; }
}
function saveRecent(list) {
  fs.mkdirSync(APP_DIR, { recursive: true });
  fs.writeFileSync(recentFile, JSON.stringify(list.slice(0, 12)));
}
reg('recent:list', () => loadRecent().map((p) => {
  const exists = fs.existsSync(p);
  return { path: p, exists, mtime: exists ? fs.statSync(p).mtimeMs : null };
}));
reg('recent:add', (p) => { if (typeof p === 'string') saveRecent([p, ...loadRecent().filter((x) => x !== p)]); });
reg('recent:remove', (p) => saveRecent(loadRecent().filter((x) => x !== p)));
reg('recent:clear', () => saveRecent([]));

// Mesmo envoltório do desktop (electron/main.js, aiCall): erro vira { ok: false, error } para o painel mostrar
const aiCall = (fn) => async (...args) => {
  try { return { ok: true, ...(await fn(...args)) }; } catch (e) { return { ok: false, error: (e && e.message) || 'Falha no assistente.' }; }
};
reg('ai:key-status', (provider) => ai.keyStatus(provider));
reg('ai:key-save', aiCall((provider, key) => ai.saveKey(provider, key)));
reg('ai:key-clear', (provider) => ai.clearKey(provider));
reg('ai:ask', aiCall((req) => ai.ask(req || {})));
reg('ai:test', aiCall((provider, model) => ai.test(provider, model)));
reg('ai:models', aiCall((provider) => ai.models(provider)));

/** Mesma forma de ipcRenderer.invoke: sempre devolve uma promessa. */
function invoke(channel, ...args) {
  const fn = handlers.get(channel);
  if (!fn) return Promise.reject(new Error('Recurso indisponível no tablet: ' + channel));
  return gate.then(() => fn(...args));
}
function send(channel, ...args) {
  if (channel === 'dirty') state.dirty = !!args[0];
  else if (channel === 'map-state') state.mapOpen = !!args[0];   // a interface envia um booleano (há mapa em uso)
  // 'close-now' não tem efeito no tablet: a interface já volta para a tela inicial
}
function on(channel, fn) {
  if (!listeners.has(channel)) listeners.set(channel, []);
  listeners.get(channel).push(fn);
}
/** Dispara um evento "do processo principal" (ex.: 'menu' com o nome do comando). */
function emit(channel, ...args) {
  for (const fn of listeners.get(channel) || []) fn({}, ...args);
}

module.exports = {
  ipcRenderer: { invoke, send, on },
  webUtils: { getPathForFile: () => '' },        // arrastar arquivo para o app: só no desktop
  emit, state, sharePending, shareFile, askButtons, toBase64, fromBase64, nativeOf, setGate,
};
