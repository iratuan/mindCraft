'use strict';
/* Sincronização OPCIONAL da biblioteca com (a) uma pasta — ex.: a pasta do Google Drive para computador, OneDrive, Dropbox, pendrive — ou
   (b) o Google Drive direto (entrando na conta com um código; escopo mínimo drive.file: o app só enxerga a pasta "MindCraft" que ele mesmo cria).
   Vem DESLIGADA: enquanto não houver o arquivo sync.json em userData, nada daqui roda sozinho. Nunca apaga nada (nem local, nem remoto);
   conflito = as duas versões ficam. A regra de decisão está em core/sync.js (testada); aqui só há a tela e a guarda do estado.
   Carregado depois de library-ui.js (usa getLibrary, el, $, closeModal, ipcRenderer, userDataDir, map, dirty, setStatus). */
const { syncLibrary } = require(path.join(core, 'sync'));
const { FolderRemote } = require(path.join(core, 'sync-folder'));
const { DriveRemote } = require(path.join(core, 'sync-drive'));
const { startDeviceLogin, pollDeviceLogin, tokenSource } = require(path.join(core, 'oauth-device'));
const IS_HOST = typeof window.__mcHost !== 'undefined';                 // versão web/tablet: sem pasta do computador, só Google Drive
const syncHttp = IS_HOST ? window.__mcHost.http : require(path.join(core, 'net-node')).nodeHttp;

const syncFile = () => (userDataDir ? path.join(userDataDir, 'sync.json') : null);
function loadSyncCfg() {
  try { const c = JSON.parse(fs.readFileSync(syncFile(), 'utf8')); return c && typeof c === 'object' ? c : null; } catch { return null; }
}
function saveSyncCfg(c) {
  const f = syncFile(); if (!f) throw new Error('a pasta de dados do aplicativo não está disponível');
  const tmp = f + '.tmp-' + Date.now(); try { fs.writeFileSync(tmp, JSON.stringify(c, null, 1)); fs.renameSync(tmp, f); } catch (e) { try { fs.rmSync(tmp, { force: true }); } catch { /* ok */ } throw e; }
}
const syncWhen = (t) => { try { return new Date(t).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }); } catch { return ''; } };
/** Endereços do Google podem ser trocados só por endereços LOCAIS (testes); qualquer outra coisa é ignorada. */
const safeUrls = (u) => (u && Object.values(u).every((x) => /^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(String(x))) ? u : undefined);

/** Monta o provedor da configuração salva. Tokens renovados e o id da pasta do Drive são gravados na hora. */
function makeRemote(cfg) {
  if (cfg.kind === 'drive') {
    const d = cfg.drive || {}; const urls = safeUrls(d.urls);
    if (!d.auth || !d.auth.refreshToken) throw new Error('Entre na conta do Google primeiro.');
    const getToken = tokenSource({ http: syncHttp, clientId: d.clientId, clientSecret: d.clientSecret, auth: d.auth, urls: urls && { device: urls.device, token: urls.token }, onChange: () => saveSyncCfg(cfg) });
    return new DriveRemote({ http: syncHttp, getToken, folderId: d.folderId || null, ...(urls ? { api: urls.api, upload: urls.upload } : {}) });
  }
  return new FolderRemote(cfg.dir);
}

let _syncing = false;
/** Roda uma sincronização com a configuração salva. Devolve o relatório (ou lança). O estado só é gravado depois de terminar. */
async function runSync({ onProgress } = {}) {
  if (_syncing) throw new Error('Já existe uma sincronização em andamento.');
  const cfg = loadSyncCfg(); if (!cfg || !cfg.enabled) throw new Error('A sincronização está desligada.');
  const lib = getLibrary(); if (!lib) throw new Error('A biblioteca não está disponível: ' + _libErr);
  _syncing = true;
  try {
    const remote = makeRemote(cfg);
    const busy = new Set(); if (map && map.meta.libId && dirty) busy.add(map.meta.libId);
    const rep = await syncLibrary(lib, remote, cfg.state || (cfg.state = {}), { onProgress, busy });
    if (cfg.kind === 'drive' && remote.folderId) cfg.drive.folderId = remote.folderId;
    cfg.last = { at: Date.now(), pushed: rep.pushed, pulled: rep.pulled, conflicts: rep.conflicts, same: rep.same, errors: rep.errors.length };
    saveSyncCfg(cfg);
    const cur = map && map.meta.libId;                                   // o mapa aberto (sem alterações) foi trocado por uma versão mais nova: recarrega
    if (cur && !dirty && rep.items.some((i) => i.id === cur && /^atualizado/.test(i.status))) await openFromLibrary(cur, { confirm: false, silent: true });
    return rep;
  } finally { _syncing = false; }
}

function openSyncModal() {
  closeDash();
  const m = $('#modal'); m.textContent = ''; m.hidden = false;
  const bx = el('div', 'modal-box'); bx.id = 'syncBox'; m.append(bx);
  let loginCancel = null;
  const close = () => { if (loginCancel) loginCancel(); closeModal(); };
  m.onkeydown = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  const msg = el('div', 'msg'); msg.id = 'syncMsg'; const say = (t, k) => { msg.textContent = t || ''; msg.className = 'msg' + (k ? ' ' + k : ''); };
  const list = el('div', 'lib-list'); list.id = 'syncList';
  const info = el('div', 'muted'); info.id = 'syncInfo';
  const kind = el('select'); kind.id = 'syncKind'; kind.title = 'Onde guardar a cópia';
  for (const [v, t] of IS_HOST ? [['drive', 'Google Drive']] : [['folder', 'Uma pasta do computador (ex.: a do Google Drive para computador)'], ['drive', 'Google Drive (entrar na conta)']]) { const o = el('option', '', t); o.value = v; kind.append(o); }
  const bPick = el('button', 'btn primary'); bPick.id = 'syncPick';
  const bNow = el('button', 'btn'); bNow.id = 'syncNow'; bNow.textContent = 'Sincronizar agora';
  const bOff = el('button', 'btn'); bOff.id = 'syncOff'; bOff.textContent = 'Desligar';
  const lab = el('label', 'row'); const auto = el('input'); auto.type = 'checkbox'; auto.id = 'syncAuto'; lab.append(auto, document.createTextNode(' Sincronizar sozinho ao abrir o MindCraft'));
  // --- Google Drive: ID do cliente + entrar com código ---
  const drv = el('div', 'syncdrive'); drv.id = 'syncDrive';
  const inId = el('input'); inId.id = 'syncClientId'; inId.placeholder = 'ID do cliente (…apps.googleusercontent.com)'; inId.autocomplete = 'off'; inId.spellcheck = false;
  const inSec = el('input'); inSec.id = 'syncClientSecret'; inSec.type = 'password'; inSec.placeholder = 'Segredo do cliente'; inSec.autocomplete = 'off';
  const bLogin = el('button', 'btn primary'); bLogin.id = 'syncLogin'; bLogin.textContent = 'Entrar com o Google';
  const codeBox = el('div', 'msg'); codeBox.id = 'syncCode'; codeBox.hidden = true;
  const how = el('details'); how.append(el('summary', '', 'Como obter o ID e o segredo do cliente (uma vez, grátis)'));
  const ol = el('ol'); for (const t of [
    'Acesse console.cloud.google.com, crie um projeto e ative a "Google Drive API".',
    'Em "Tela de consentimento OAuth", escolha "Externo", preencha o nome e seu e-mail e PUBLIQUE o app ("Em produção"). Se ficar em "Teste", o login vence a cada 7 dias.',
    'Em "Credenciais" > "Criar credenciais" > "ID do cliente OAuth", tipo "TVs e dispositivos de entrada limitada".',
    'Copie o ID do cliente e o segredo do cliente para os campos acima. O MindCraft só pede o acesso mínimo (arquivos que ele mesmo criar).']) ol.append(el('li', '', t));
  how.append(ol);
  drv.append(inId, inSec, bLogin, codeBox, how);
  const bClose = el('button', 'btn', 'Fechar'); bClose.id = 'syncClose'; bClose.onclick = close;
  const foot = el('div', 'foot'); foot.append(el('span', 'grow'), bClose);
  const row = el('div', 'btnrow'); row.append(bPick, bNow, bOff);
  bx.append(el('h2', '', 'Sincronização (opcional)'),
    el('div', 'muted', 'Mantém a biblioteca igual em mais de um aparelho. Nada é apagado: se o mesmo mapa mudou nos dois lados, as duas versões ficam (a do outro aparelho entra como cópia). Antes de trazer uma versão nova, o mapa atual ganha uma versão guardada. Vem desligada.'),
    kind, info, drv, row, lab, msg, list, foot);

  const cur = () => loadSyncCfg();
  const draw = () => {
    const c = cur(), on = !!(c && c.enabled), k = on ? c.kind : kind.value;
    if (on) kind.value = c.kind || 'folder';
    kind.disabled = on; drv.hidden = on || kind.value !== 'drive'; bPick.hidden = kind.value !== 'folder';
    const where = on ? (c.kind === 'drive' ? 'Google Drive (pasta "MindCraft")' : 'Pasta: ' + c.dir) : '';
    info.textContent = on ? `${where}${c.last ? ` · última vez: ${syncWhen(c.last.at)} (${c.last.pushed} enviado(s), ${c.last.pulled} recebido(s), ${c.last.conflicts} conflito(s)${c.last.errors ? `, ${c.last.errors} erro(s)` : ''})` : ' · ainda não sincronizou'}` : 'Desligada.';
    bPick.textContent = 'Escolher a pasta…'; bNow.disabled = !on; bOff.disabled = !on; auto.disabled = !on; auto.checked = !!(on && c.auto);
    if (k === 'drive' && !on && c && c.drive) { inId.value = inId.value || c.drive.clientId || ''; }
  };
  kind.onchange = () => { say(''); draw(); };
  bPick.onclick = async () => {
    const d = await ipcRenderer.invoke('dialog:folder', 'Pasta de sincronização (ex.: a pasta do Google Drive)'); if (!d) return;
    try {
      new FolderRemote(d).check();
      const old = cur(); const same = old && old.kind !== 'drive' && old.dir && path.resolve(old.dir).toLowerCase() === path.resolve(d).toLowerCase();
      saveSyncCfg({ enabled: true, kind: 'folder', dir: d, auto: !!(old && old.auto), state: same ? old.state : {}, last: same ? old.last : null });
      say(same ? 'Pasta mantida.' : 'Pasta definida. Clique em "Sincronizar agora".', 'ok');
    } catch (e) { say('Não consegui usar essa pasta: ' + e.message, 'err'); }
    draw();
  };
  bLogin.onclick = async () => {
    const clientId = inId.value.trim(), clientSecret = inSec.value.trim();
    if (!clientId || !clientSecret) { say('Preencha o ID e o segredo do cliente (veja "Como obter" abaixo).', 'err'); return; }
    const urls = safeUrls((cur() && cur().drive && cur().drive.urls) || (window.__syncTestUrls || undefined));
    bLogin.disabled = true; say('Pedindo o código ao Google…'); let stop = false; loginCancel = () => { stop = true; };
    try {
      const dv = await startDeviceLogin({ http: syncHttp, clientId, urls: urls && { device: urls.device } });
      codeBox.hidden = false; codeBox.textContent = ''; const big = el('b', '', dv.userCode); big.id = 'syncUserCode'; big.style.fontSize = '1.6em'; big.style.letterSpacing = '0.1em';
      codeBox.append(el('div', '', 'No celular ou no computador, abra '), el('b', '', dv.url), el('div', '', ' e digite o código:'), big);
      if (/^https:\/\//.test(dv.url)) { const o = el('button', 'btn small', 'Abrir a página'); o.id = 'syncOpenUrl'; o.onclick = () => ipcRenderer.invoke('open-external', dv.url); codeBox.append(o); }
      say('Aguardando você autorizar na página do Google…');
      const t = await pollDeviceLogin({ http: syncHttp, clientId, clientSecret, deviceCode: dv.deviceCode, interval: dv.interval, expiresIn: dv.expiresIn, shouldStop: () => stop, urls: urls && { token: urls.token } });
      const old = cur(); const keep = old && old.kind === 'drive' && old.drive && old.drive.clientId === clientId;
      saveSyncCfg({ enabled: true, kind: 'drive', auto: !!(old && old.auto), state: keep ? old.state : {}, last: keep ? old.last : null, drive: { clientId, clientSecret, folderId: keep ? old.drive.folderId : null, auth: { refreshToken: t.refreshToken, accessToken: t.accessToken, expiresAt: t.expiresAt }, ...(urls ? { urls } : {}) } });
      codeBox.hidden = true; say('Conectado ao Google Drive. Clique em "Sincronizar agora".', 'ok');
    } catch (e) { codeBox.hidden = true; say(stop ? 'Login cancelado.' : 'Não consegui entrar: ' + e.message, 'err'); }
    loginCancel = null; bLogin.disabled = false; draw();
  };
  bOff.onclick = () => {
    const c = cur(); if (c) { c.enabled = false; if (c.kind === 'drive' && c.drive) c.drive.auth = null; try { saveSyncCfg(c); } catch (e) { say('Erro: ' + e.message, 'err'); return; } }
    say('Sincronização desligada' + (c && c.kind === 'drive' ? ' e login do Google esquecido neste aparelho' : '') + '. Seus mapas e os arquivos remotos não foram alterados.', 'ok'); draw();
  };
  auto.onchange = () => { const c = cur(); if (!c) return; c.auto = auto.checked; try { saveSyncCfg(c); } catch (e) { say('Erro: ' + e.message, 'err'); } };
  bNow.onclick = async () => {
    bNow.disabled = true; say('Sincronizando…'); list.textContent = '';
    try {
      const r = await runSync({ onProgress: (t) => { say(t); } });
      say(`Pronto: ${r.pushed} enviado(s), ${r.pulled} recebido(s), ${r.conflicts} conflito(s) mantido(s) com as duas versões, ${r.same} já igual(is).${r.errors.length ? ` ${r.errors.length} com problema (veja abaixo).` : ''}`, r.errors.length ? 'err' : 'ok');
      for (const it of r.items.filter((x) => x.status !== 'igual').slice(0, 60)) { const row_ = el('div', 'lib-row'); row_.append(el('div', 'grow', `${it.title} — ${it.status}`)); list.append(row_); }
      for (const e of r.errors.slice(0, 20)) { const row_ = el('div', 'lib-row'); row_.append(el('div', 'grow', 'Erro: ' + e)); list.append(row_); }
    } catch (e) { say('Não sincronizou: ' + e.message, 'err'); }
    draw();
  };
  draw();
}
act.sync = () => openSyncModal();

/** Sincronização automática ao abrir (só se o usuário ligou). Silenciosa: só o status, e erros vão para o log. */
async function autoSyncOnOpen() {
  try {
    const c = loadSyncCfg(); if (!c || !c.enabled || !c.auto || !libraryExists()) return;
    const r = await runSync();
    setStatus(`Sincronizado: ${r.pushed} enviado(s), ${r.pulled} recebido(s)${r.conflicts ? `, ${r.conflicts} conflito(s) com cópia` : ''}${r.errors.length ? `, ${r.errors.length} erro(s)` : ''}.`);
  } catch (e) { logOnly('Sincronização automática não rodou: ' + e.message); }
}
setTimeout(autoSyncOnOpen, 5000);
