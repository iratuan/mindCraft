'use strict';
const { app, BrowserWindow, Menu, dialog, ipcMain, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

// O app só carrega arquivos locais (renderer/index.html), por isso o renderer usa nodeIntegration.
const OPENABLE = /\.mom$/i;
const isMac = process.platform === 'darwin';
let win = null;
let dirty = false;        // espelho do estado "alterações não salvas" do renderer
let forceClose = false;
let pendingFile = argvFile(process.argv, app.isPackaged);

// Comandos que só fazem sentido com um mapa aberto (a tela inicial cobre o mapa). Começam desabilitados.
// O renderer informa a situação ('map-state') e aqui só se aplica; reconstruir o menu reaplica o último estado.
const MAP_COMMANDS = ['m-save', 'm-saveAs', 'm-exportStudy', 'm-undo', 'm-redo', 'm-moveUp', 'm-moveDown', 'm-outdent', 'm-indent',
  'cut', 'copy', 'paste', 'selectAll', 'm-fit', 'm-organize'];
let mapInUse = false;
function applyMapCommands() {
  const menu = Menu.getApplicationMenu();
  if (!menu) return;
  for (const id of MAP_COMMANDS) { const item = menu.getMenuItemById(id); if (item) item.enabled = mapInUse; }
}
ipcMain.on('map-state', (_e, inUse) => { mapInUse = !!inUse; applyMapCommands(); });

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

/** Abre a pasta de cópias de segurança (backups) no gerenciador de arquivos. */
function openBackups() {
  const dir = path.join(app.getPath('userData'), 'backups');
  try { fs.mkdirSync(dir, { recursive: true }); require('electron').shell.openPath(dir); } catch { /* sem pasta, sem problema */ }
}

function buildMenu() {
  const send = (ch) => () => win && win.webContents.send('menu', ch);
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { label: 'Arquivo', submenu: [
      { label: 'Tela inicial', accelerator: 'CmdOrCtrl+Shift+H', click: send('home') },
      { label: 'Novo mapa', accelerator: 'CmdOrCtrl+N', click: send('new') },
      { label: 'Abrir…', accelerator: 'CmdOrCtrl+O', click: send('open') },
      { label: 'Abrir recente', submenu: (() => {
        const items = loadRecent().filter((p) => fs.existsSync(p)).map((p) => ({ label: p, click: () => win && win.webContents.send('open-path', p) }));
        return items.length ? [...items, { type: 'separator' }, { label: 'Limpar lista', click: () => { saveRecent([]); buildMenu(); } }] : [{ label: '(vazio)', enabled: false }];
      })() },
      { type: 'separator' },
      { id: 'm-save', label: 'Salvar', accelerator: 'CmdOrCtrl+S', click: send('save') },
      { id: 'm-exportStudy', label: 'Exportar material de estudo (PDF e Markdown)…', click: send('export-study') },
      { id: 'm-saveAs', label: 'Salvar como…', accelerator: 'CmdOrCtrl+Shift+S', click: send('saveAs') },
      { label: 'Versões anteriores…', click: send('restore') },
      { label: 'Abrir pasta de cópias de segurança', click: openBackups },
      { type: 'separator' },
      isMac ? { role: 'close', label: 'Fechar' } : { role: 'quit', label: 'Sair' },
    ] },
    { label: 'Editar', submenu: [
      { id: 'm-undo', label: 'Desfazer', accelerator: 'CmdOrCtrl+Z', click: send('undo') },
      { id: 'm-redo', label: 'Refazer', accelerator: isMac ? 'Shift+Cmd+Z' : 'Ctrl+Y', click: send('redo') },
      { type: 'separator' },
      { id: 'm-moveUp', label: 'Subir tópico (Alt+↑)', click: send('moveUp') },
      { id: 'm-moveDown', label: 'Descer tópico (Alt+↓)', click: send('moveDown') },
      { id: 'm-outdent', label: 'Promover — subir um nível (Alt+←)', click: send('outdent') },
      { id: 'm-indent', label: 'Rebaixar — virar filho do irmão de cima (Alt+→)', click: send('indent') },
      { type: 'separator' },
      // itens próprios (não 'role'): em campos de texto agem no texto; no mapa, nos tópicos (ver editCommand no renderer)
      { id: 'cut', label: 'Recortar', accelerator: 'CmdOrCtrl+X', click: send('cut') },
      { id: 'copy', label: 'Copiar', accelerator: 'CmdOrCtrl+C', click: send('copy') },
      { id: 'paste', label: 'Colar', accelerator: 'CmdOrCtrl+V', click: send('paste') },
      { id: 'selectAll', label: 'Selecionar tudo', accelerator: 'CmdOrCtrl+A', click: send('selectAll') },
    ] },
    { label: 'Exibir', submenu: [
      { id: 'm-fit', label: 'Ajustar à tela', accelerator: 'CmdOrCtrl+0', click: send('fit') },
      { id: 'm-organize', label: 'Auto-organizar mapa', click: send('organize') },
      { label: 'Painel de mapas (dashboard)', accelerator: 'CmdOrCtrl+E', click: send('dash') },
      { label: 'Painel lateral (recolher/expandir)', accelerator: 'CmdOrCtrl+\\', click: send('panelsToggle') },
      { label: 'Lousa de resolução', click: send('board') },
      { label: 'Rede de conhecimento', accelerator: 'CmdOrCtrl+G', click: send('graph') },
      { label: 'Leitor de PDF (dividir a tela)', accelerator: 'CmdOrCtrl+Shift+P', click: send('pdf') },
      { type: 'separator' },
      { role: 'togglefullscreen', label: 'Tela cheia' },
    ] },
    { label: 'IA', submenu: [
      { label: 'Configurar provedor e modelo…', click: send('ai-config') },
      { label: 'Abrir o Assistente', click: send('ai-open') },
    ] },
    { label: 'Ajuda', submenu: [
      { label: 'Atalhos do teclado', accelerator: 'F1', click: send('help') },
    ] },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  applyMapCommands();
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 720, minHeight: 480, title: 'BRANIAC', backgroundColor: '#f3f7ff',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: { nodeIntegration: true, contextIsolation: false, webviewTag: false },
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
    if (forceClose || !dirty) return;
    e.preventDefault();
    const choice = dialog.showMessageBoxSync(win, {
      type: 'warning', buttons: ['Salvar', 'Descartar', 'Cancelar'], defaultId: 0, cancelId: 2,
      title: 'BRANIAC', message: 'Há alterações não salvas.', detail: 'Deseja salvar antes de sair?',
    });
    if (choice === 0) win.webContents.send('menu', 'save-and-close');
    else if (choice === 1) { try { fs.rmSync(draftFile(), { force: true }); } catch { /* sem rascunho */ } forceClose = true; win.close(); }
  });
  buildMenu();
}

// Só .mom: o formato do Mindomo é a única forma de salvar e abrir o mapa
const MOM = [{ name: 'Mapa mental (.mom)', extensions: ['mom'] }];
const PDF = [{ name: 'PDF', extensions: ['pdf'] }];
ipcMain.handle('dialog:open', async () => {
  const r = await dialog.showOpenDialog(win, { properties: ['openFile'], filters: MOM });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('dialog:save', async (_e, defaultName) => {
  const r = await dialog.showSaveDialog(win, { filters: MOM, defaultPath: defaultName });
  return r.canceled ? null : r.filePath;
});
ipcMain.handle('dialog:error', (_e, msg) => { dialog.showErrorBox('BRANIAC', String(msg)); });
// 0 = Salvar, 1 = Descartar, 2 = Cancelar
ipcMain.handle('dialog:confirm-discard', async () => (await dialog.showMessageBox(win, {
  type: 'warning', buttons: ['Salvar', 'Descartar', 'Cancelar'], defaultId: 0, cancelId: 2,
  title: 'BRANIAC', message: 'Há alterações não salvas.', detail: 'Deseja salvar antes de continuar?',
})).response);
// Área de transferência: o Electron 40+ removeu clipboard do renderer e tornou a API assíncrona no processo principal.
ipcMain.handle('clip:read', async () => String((await clipboard.readText()) ?? ''));
ipcMain.handle('clip:write', async (_e, text) => { await clipboard.writeText(String(text)); });
ipcMain.handle('dialog:open-pdf', async () => {
  const r = await dialog.showOpenDialog(win, { title: 'Abrir PDF', properties: ['openFile'], filters: PDF });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('dialog:open-at', async (_e, dir) => {
  const r = await dialog.showOpenDialog(win, { title: 'Versões anteriores', defaultPath: String(dir), properties: ['openFile'], filters: MOM });
  return r.canceled ? null : r.filePaths[0];
});
// resultado { ok, path } ou { ok:false, error } para a interface (sem expor detalhes internos)
// Exportação do material de estudo: o diálogo escolhe o local; o PDF é impresso a partir do HTML do núcleo
ipcMain.handle('dialog:save-export', async (_e, kind, defaultName) => {
  const filters = kind === 'pdf' ? [{ name: 'PDF', extensions: ['pdf'] }] : kind === 'png' ? [{ name: 'Imagem PNG', extensions: ['png'] }] : [{ name: 'Markdown', extensions: ['md'] }];
  const r = await dialog.showSaveDialog(win, { filters, defaultPath: defaultName });
  return r.canceled ? null : r.filePath;
});
// o progresso chega à janela de exportação pelo canal 'export:progress' (percentual e etapa)
ipcMain.handle('export:pdf', async (e, html, target) => {
  const send = (pct, label) => { if (!e.sender.isDestroyed()) e.sender.send('export:progress', { pct, label }); };
  try { return { ok: true, path: await require('./export-pdf').writePdf(html, target, send) }; }
  catch (err) { return { ok: false, error: err.message || 'Falha ao exportar.' }; }
});
// Pasta de mapas (.mom) para a rede de conhecimento entre mapas
ipcMain.handle('dialog:folder', async (_e, title) => {
  const r = await dialog.showOpenDialog(win, { title: title || 'Escolher pasta', properties: ['openDirectory', 'createDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});
// Assistente de IA (Claude): a chave fica cifrada no disco (ver ai-service.js); os canais devolvem { ok, error } com mensagem para o usuário
const aiService = require('./ai-service');
// o primeiro argumento de um canal IPC é sempre o evento do Electron: não pode chegar à função de negócio
const aiCall = (fn) => async (_event, ...args) => { try { return { ok: true, ...(await fn(...args)) }; } catch (e) { return { ok: false, error: e.message || 'Falha no assistente.' }; } };
ipcMain.handle('ai:key-status', (_e, provider) => aiService.keyStatus(app.getPath('userData'), provider));
ipcMain.handle('ai:key-save', aiCall((provider, key) => aiService.saveKey(app.getPath('userData'), provider, key)));
ipcMain.handle('ai:key-clear', (_e, provider) => aiService.clearKey(app.getPath('userData'), provider));
ipcMain.handle('ai:ask', aiCall((req) => aiService.ask(app.getPath('userData'), req || {})));
ipcMain.handle('ai:test', aiCall((provider, model) => aiService.test(app.getPath('userData'), provider, model)));
ipcMain.handle('ai:models', aiCall((provider) => aiService.models(app.getPath('userData'), provider)));
// Links http(s)/mailto das notas: abre no navegador padrão (nunca navega a janela do app). Em testes só valida.
ipcMain.handle('open-external', async (_e, url) => {
  const u = String(url || '');
  if (!/^(https?:\/\/|mailto:)[^\s<>"']+$/i.test(u)) return { ok: false };
  if (process.env.MINDCRAFT_NO_LAUNCH === '1') return { ok: true, url: u, method: 'skipped' };
  try { await require('electron').shell.openExternal(u); return { ok: true, url: u }; } catch (e) { return { ok: false, error: e.message }; }
});
// Testes: força o modo de início ('home' | 'blank') só na 1ª inicialização; no uso normal é sempre null.
ipcMain.handle('app:start-override', () => process.env.MINDCRAFT_START || null);
ipcMain.handle('app:path', (_e, name) => app.getPath(name));
// Tela inicial: lista (com existência e data), remover um e limpar. Só devolve caminhos que o próprio app registrou.
ipcMain.handle('recent:list', () => loadRecent().map((p) => { let st = null; try { st = fs.statSync(p); } catch { /* sumiu */ } return { path: p, exists: !!st && st.isFile(), mtime: st ? st.mtimeMs : null }; }));
ipcMain.handle('recent:remove', (_e, p) => { saveRecent(loadRecent().filter((x) => x !== p)); buildMenu(); });
ipcMain.handle('recent:clear', () => { saveRecent([]); buildMenu(); });
ipcMain.handle('recent:add', (_e, p) => { if (typeof p === 'string') addRecent(p); });
ipcMain.handle('dialog:confirm', async (_e, o) => (await dialog.showMessageBox(win, {
  type: 'question', buttons: o.buttons, defaultId: 0, cancelId: o.buttons.length - 1, title: 'BRANIAC', message: o.message, detail: o.detail,
})).response);
ipcMain.on('dirty', (_e, v) => { dirty = !!v; });
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
