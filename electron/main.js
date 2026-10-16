'use strict';
const { app, BrowserWindow, Menu, dialog, ipcMain, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

// O app só carrega arquivos locais (renderer/index.html), por isso o renderer usa nodeIntegration.
const OPENABLE = /\.(mom|md|opml)$/i;
const isMac = process.platform === 'darwin';
let win = null;
let dirty = false;        // espelho do estado "alterações não salvas" do renderer
let timing = false;       // cronômetro de estudo em andamento
let forceClose = false;
let pendingFile = argvFile(process.argv, app.isPackaged);

function argvFile(argv, packaged) {
  return argv.slice(packaged ? 1 : 2).find((a) => OPENABLE.test(a));
}

// ---------- arquivos recentes (persistidos em userData/recent.json) ----------
const recentFile = () => path.join(app.getPath('userData'), 'recent.json');
const draftFile = () => path.join(app.getPath('userData'), 'drafts', 'session.json');
function loadRecent() {
  try {
    const list = JSON.parse(fs.readFileSync(recentFile(), 'utf8'));
    return Array.isArray(list) ? list.filter((p) => typeof p === 'string').slice(0, 10) : [];
  } catch { return []; }
}
function saveRecent(list) {
  try { fs.mkdirSync(path.dirname(recentFile()), { recursive: true }); fs.writeFileSync(recentFile(), JSON.stringify(list)); } catch { /* sem recentes não é fatal */ }
}
function addRecent(p) {
  const list = [p, ...loadRecent().filter((x) => x !== p)].slice(0, 10);
  saveRecent(list);
  try { app.addRecentDocument(p); } catch { /* só macOS/Windows */ }
  buildMenu();
}

/** Abre uma subpasta fixa de userData no gerenciador de arquivos (só 'backups' e 'logs'). */
function openUserSub(name) {
  if (!['backups', 'logs'].includes(name)) return;
  const dir = path.join(app.getPath('userData'), name);
  try { fs.mkdirSync(dir, { recursive: true }); require('electron').shell.openPath(dir); } catch { /* sem pasta, sem problema */ }
}

function buildMenu() {
  const send = (ch) => () => win && win.webContents.send('menu', ch);
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { label: 'Arquivo', submenu: [
      { label: 'Tela inicial', accelerator: 'CmdOrCtrl+Shift+H', click: send('home') },
      { label: 'Novo', accelerator: 'CmdOrCtrl+N', click: send('new') },
      { label: 'Abrir…', accelerator: 'CmdOrCtrl+O', click: send('open') },
      { label: 'Restaurar versão anterior…', click: send('restore') },
      { label: 'Abrir pasta de backups', click: () => openUserSub('backups') },
      { label: 'Abrir pasta de registros de erro', click: () => openUserSub('logs') },
      { type: 'separator' },
      { label: 'Abrir recente', submenu: (() => {
        const items = loadRecent().filter((p) => fs.existsSync(p)).map((p) => ({ label: p, click: () => win && win.webContents.send('open-path', p) }));
        return items.length ? [...items, { type: 'separator' }, { label: 'Limpar lista', click: () => { saveRecent([]); buildMenu(); } }] : [{ label: '(vazio)', enabled: false }];
      })() },
      { label: 'Salvar', accelerator: 'CmdOrCtrl+S', click: send('save') },
      { label: 'Salvar como…', accelerator: 'CmdOrCtrl+Shift+S', click: send('saveAs') },
      { label: 'Biblioteca de mapas…', accelerator: 'CmdOrCtrl+Shift+B', click: send('lib') },
      { label: 'Guardar este mapa na biblioteca', click: send('libAdd') },
      { type: 'separator' },
      { label: 'Novo mapa de concurso (modelo)', click: send('template') },
      { label: 'Importar edital (colar texto)…', click: send('edital') },
      { label: 'Importar CSV de edital (gerado por IA)…', click: send('csv') },
      { label: 'Planilha de planejamento (exportar / importar)…', click: send('plan') },
      { type: 'separator' },
      { label: 'Exportar', submenu: ['pdf', 'docx', 'png', 'svg', 'md', 'opml'].map((f) => ({ label: f.toUpperCase(), click: send('export:' + f) })) },
      { type: 'separator' },
      isMac ? { role: 'close', label: 'Fechar' } : { role: 'quit', label: 'Sair' },
    ] },
    { label: 'Editar', submenu: [
      { label: 'Desfazer', accelerator: 'CmdOrCtrl+Z', click: send('undo') },
      { label: 'Refazer', accelerator: isMac ? 'Shift+Cmd+Z' : 'Ctrl+Y', click: send('redo') },
      { type: 'separator' },
      // itens próprios (não 'role'): em campos de texto agem no texto; no mapa, nos tópicos (ver editCommand no renderer)
      { id: 'cut', label: 'Recortar', accelerator: 'CmdOrCtrl+X', click: send('cut') },
      { id: 'copy', label: 'Copiar', accelerator: 'CmdOrCtrl+C', click: send('copy') },
      { id: 'paste', label: 'Colar', accelerator: 'CmdOrCtrl+V', click: send('paste') },
      { id: 'selectAll', label: 'Selecionar tudo', accelerator: 'CmdOrCtrl+A', click: send('selectAll') },
    ] },
    { label: 'Exibir', submenu: [
      { label: 'Ajustar à tela', accelerator: 'CmdOrCtrl+0', click: send('fit') },
      { label: 'Apresentar', accelerator: 'F5', click: send('present') },
      { label: 'Painel de estudos', accelerator: 'CmdOrCtrl+E', click: send('dash') },
      { label: 'Rede de conhecimento', accelerator: 'CmdOrCtrl+G', click: send('graph') },
      { label: 'Revisão do dia', accelerator: 'CmdOrCtrl+Shift+R', click: send('review') },
      { label: 'Leitor de PDF (dividir a tela)', accelerator: 'CmdOrCtrl+Shift+P', click: send('pdf') },
      { type: 'separator' },
      { role: 'togglefullscreen', label: 'Tela cheia' },
      { role: 'toggleDevTools', label: 'Ferramentas de desenvolvedor' },
    ] },
    { label: 'Ajuda', submenu: [
      { label: 'Atalhos do teclado', accelerator: 'F1', click: send('help') },
    ] },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 720, minHeight: 480, title: 'MindCraft', backgroundColor: '#f3f7ff',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  // a janela só mostra o app: soltar um arquivo ou clicar num link nunca a leva para outra página (perderia o trabalho aberto)
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  win.webContents.on('did-finish-load', () => {
    if (pendingFile) { win.webContents.send('open-path', pendingFile); pendingFile = null; }
  });
  win.on('closed', () => { win = null; });

  // Fechar com alterações pendentes: Salvar / Descartar / Cancelar
  win.on('close', (e) => {
    if (forceClose || !(dirty || timing)) return;
    e.preventDefault();
    const choice = dialog.showMessageBoxSync(win, {
      type: 'warning', buttons: ['Salvar', 'Descartar', 'Cancelar'], defaultId: 0, cancelId: 2,
      title: 'MindCraft', message: dirty ? 'Há alterações não salvas.' : 'O cronômetro de estudo está rodando.',
      detail: timing ? 'Salvar registra o tempo do cronômetro no tópico e grava o arquivo. Descartar perde esse tempo.' : 'Deseja salvar antes de sair?',
    });
    if (choice === 0) win.webContents.send('menu', 'save-and-close');
    else if (choice === 1) { try { fs.rmSync(draftFile(), { force: true }); } catch { /* sem rascunho */ } forceClose = true; win.close(); }
  });
  buildMenu();
}

const FILTERS = {
  mom: [{ name: 'Mapa mental (.mom)', extensions: ['mom'] }],
  pdf: [{ name: 'PDF', extensions: ['pdf'] }], docx: [{ name: 'Word', extensions: ['docx'] }],
  png: [{ name: 'PNG', extensions: ['png'] }], svg: [{ name: 'SVG', extensions: ['svg'] }],
  csv: [{ name: 'CSV (edital)', extensions: ['csv', 'txt'] }], ics: [{ name: 'Agenda (iCalendar)', extensions: ['ics'] }],
  mcpack: [{ name: 'Pacote MindCraft (.mcpack)', extensions: ['mcpack'] }], db: [{ name: 'Banco SQLite (.db)', extensions: ['db'] }],
  md: [{ name: 'Markdown', extensions: ['md'] }], opml: [{ name: 'OPML', extensions: ['opml'] }],
};
ipcMain.handle('dialog:open', async () => {
  const r = await dialog.showOpenDialog(win, { properties: ['openFile'], filters: [
    { name: 'Mapas e outlines', extensions: ['mom', 'md', 'opml'] }, ...FILTERS.mom, ...FILTERS.md, ...FILTERS.opml] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('dialog:save', async (_e, kind, defaultName) => {
  const r = await dialog.showSaveDialog(win, { filters: FILTERS[kind], defaultPath: defaultName });
  return r.canceled ? null : r.filePath;
});
ipcMain.handle('dialog:error', (_e, msg) => { dialog.showErrorBox('MindCraft', String(msg)); });
// 0 = Salvar, 1 = Descartar, 2 = Cancelar
ipcMain.handle('dialog:confirm-discard', async () => (await dialog.showMessageBox(win, {
  type: 'warning', buttons: ['Salvar', 'Descartar', 'Cancelar'], defaultId: 0, cancelId: 2,
  title: 'MindCraft', message: 'Há alterações não salvas.', detail: 'Deseja salvar antes de continuar?',
})).response);
// PDF e Word são gerados aqui: o pdfkit/docx dependem da resolução de módulos "de Node", que no renderer
// (nodeIntegration) usa condições de navegador e falha (ex.: '#standard-fonts/Helvetica').
ipcMain.handle('render-export', async (_e, fmt, data, opts = {}) => {
  const { MindMap } = require('../core/model');
  const { toPDF, toDOCX } = require('../core/export');
  const map = MindMap.fromJSON(data);
  if (fmt === 'pdf') return toPDF(map, opts);
  if (fmt === 'docx') return toDOCX(map, { ...opts, image: opts.image ? Buffer.from(opts.image) : undefined });
  if (fmt === 'study-docx') return require('../core/report').toStudyDOCX(map, opts);
  throw new Error('formato não suportado: ' + fmt);
});
// Área de transferência: o Electron 40+ removeu clipboard do renderer e tornou a API assíncrona no processo principal.
ipcMain.handle('clip:read', async () => String((await clipboard.readText()) ?? ''));
ipcMain.handle('clip:write', async (_e, text) => { await clipboard.writeText(String(text)); });
ipcMain.handle('dialog:open-csv', async () => {
  const r = await dialog.showOpenDialog(win, { title: 'CSV do edital', properties: ['openFile'], filters: FILTERS.csv });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('dialog:open-pdf', async () => {
  const r = await dialog.showOpenDialog(win, { title: 'Abrir PDF', properties: ['openFile'], filters: FILTERS.pdf });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('dialog:open-pack', async () => {
  const r = await dialog.showOpenDialog(win, { title: 'Pacote MindCraft', properties: ['openFile'], filters: FILTERS.mcpack });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('dialog:open-at', async (_e, dir) => {
  const r = await dialog.showOpenDialog(win, { title: 'Versões anteriores', defaultPath: String(dir), properties: ['openFile'], filters: FILTERS.mom });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('dialog:folder', async (_e, title) => {
  const r = await dialog.showOpenDialog(win, { title: title || 'Escolher pasta', properties: ['openDirectory', 'createDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});
// Abre uma pasta no Obsidian (protocolo obsidian://). No Windows, se o executável do usuário existir, ele é usado diretamente;
// MINDCRAFT_NO_LAUNCH=1 (testes) só devolve a URL, sem abrir nada.
ipcMain.handle('obsidian:open', async (_e, dir) => {
  const { obsidianUrl } = require('../core/obsidian');
  const url = obsidianUrl(String(dir));
  if (process.env.MINDCRAFT_NO_LAUNCH === '1') return { ok: true, method: 'skipped', url };
  try {
    const exe = process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Obsidian', 'Obsidian.exe')
      : process.platform === 'darwin' ? '/Applications/Obsidian.app/Contents/MacOS/Obsidian' : null;
    if (exe && fs.existsSync(exe)) {
      require('child_process').spawn(exe, [url], { detached: true, stdio: 'ignore' }).unref();
      return { ok: true, method: 'exe', url };
    }
    await require('electron').shell.openExternal(url);
    return { ok: true, method: 'protocol', url };
  } catch (e) { return { ok: false, error: e.message, url }; }
});
// Links http(s)/mailto das notas: abre no navegador padrão (nunca navega a janela do app). Em testes só valida.
ipcMain.handle('open-external', async (_e, url) => {
  const u = String(url || '');
  if (!/^(https?:\/\/|mailto:)[^\s<>"']+$/i.test(u)) return { ok: false };
  if (process.env.MINDCRAFT_NO_LAUNCH === '1') return { ok: true, url: u, method: 'skipped' };
  try { await require('electron').shell.openExternal(u); return { ok: true, url: u }; } catch (e) { return { ok: false, error: e.message }; }
});
// Testes: força o modo de início ('home' | 'last' | 'blank') só na 1ª inicialização; no uso normal é sempre null.
ipcMain.handle('app:start-override', () => process.env.MINDCRAFT_START || null);
ipcMain.handle('app:path', (_e, name) => app.getPath(name));
// Tela inicial: lista (com existência e data), remover um e limpar. Só devolve caminhos que o próprio app registrou.
ipcMain.handle('recent:list', () => loadRecent().map((p) => { let st = null; try { st = fs.statSync(p); } catch { /* sumiu */ } return { path: p, exists: !!st && st.isFile(), mtime: st ? st.mtimeMs : null }; }));
ipcMain.handle('recent:remove', (_e, p) => { saveRecent(loadRecent().filter((x) => x !== p)); buildMenu(); });
ipcMain.handle('recent:clear', () => { saveRecent([]); buildMenu(); });
ipcMain.handle('recent:add', (_e, p) => { if (typeof p === 'string') addRecent(p); });
ipcMain.handle('dialog:confirm', async (_e, o) => (await dialog.showMessageBox(win, {
  type: 'question', buttons: o.buttons, defaultId: 0, cancelId: o.buttons.length - 1, title: 'MindCraft', message: o.message, detail: o.detail,
})).response);
ipcMain.on('dirty', (_e, v) => { if (v && typeof v === 'object') { dirty = !!v.dirty; timing = !!v.timing; } else { dirty = !!v; timing = false; } });
ipcMain.on('close-now', () => { forceClose = true; if (win) win.close(); });

// instância única: abrir um .mom com o app já aberto reaproveita a janela
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (_e, argv) => {
    const f = argvFile(argv, app.isPackaged);
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); if (f) win.webContents.send('open-path', f); }
  });
  app.whenReady().then(createWindow);
  app.on('activate', () => { if (!win && app.isReady()) createWindow(); });
}
app.on('window-all-closed', () => { if (!isMac) app.quit(); });
app.on('open-file', (e, p) => { e.preventDefault(); if (win) win.webContents.send('open-path', p); else pendingFile = p; });
