'use strict';
// Provedor de sincronização para o GOOGLE DRIVE (API REST v3, escopo mínimo "drive.file": o app só enxerga o que ele mesmo criou).
// Tudo vive numa pasta "MindCraft" criada pelo app. NUNCA apaga nada. Não conhece rede: recebe `http(req)` e `getToken()` (testáveis).
//   http({ method, url, headers, body, binary })  →  { status, text }   (corpo SEMPRE texto; com binary:true a resposta vem em base64)
// Nomes remotos do motor ("maps/<id>.<ts>.<hash>.mom") viram arquivos "<id>.<ts>.<hash>.mom" dentro da pasta.
const { NAME } = require('./sync');

const FOLDER_MIME = 'application/vnd.google-apps.folder';
const API = 'https://www.googleapis.com/drive/v3', UPLOAD = 'https://www.googleapis.com/upload/drive/v3';
const q = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

class DriveError extends Error { constructor(msg, status) { super(msg); this.status = status; } }

class DriveRemote {
  /**
   * @param o.http       função de rede (ver acima)
   * @param o.getToken   async (forceRefresh) → access token válido
   * @param o.folderId   id da pasta já conhecida (guardado depois da 1ª vez) — opcional
   * @param o.sleep      async (ms) — injetável para os testes
   */
  constructor({ http, getToken, folderId = null, folderName = 'MindCraft', api = API, upload = UPLOAD, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), maxTries = 5 }) {
    Object.assign(this, { http, getToken, folderId, folderName, api, upload, sleep, maxTries }); this.ids = new Map();
  }

  /** Uma chamada com renovação do token (401) e nova tentativa em falhas passageiras (429/5xx/rede). */
  async call(method, url, { headers = {}, body = null, binary = false } = {}) {
    let refreshed = false, lastErr;
    for (let i = 0; i < this.maxTries; i++) {
      let res;
      try { res = await this.http({ method, url, headers: { Authorization: 'Bearer ' + (await this.getToken(false)), ...headers }, body, binary }); }
      catch (e) { lastErr = new DriveError('sem conexão com o Google Drive (' + e.message + ')', 0); await this.sleep(400 * 2 ** i); continue; }
      if (res.status >= 200 && res.status < 300) return res;
      if (res.status === 401 && !refreshed) { refreshed = true; await this.getToken(true); continue; }
      if (res.status === 429 || res.status >= 500) { lastErr = new DriveError(`o Google Drive está ocupado (erro ${res.status})`, res.status); await this.sleep(500 * 2 ** i); continue; }
      let reason = ''; try { const j = JSON.parse(res.text); reason = (j.error && (j.error.message || j.error.errors && j.error.errors[0].reason)) || ''; } catch { /* sem detalhe */ }
      if (res.status === 401) throw new DriveError('o acesso à conta do Google expirou ou foi revogado; entre de novo', 401);
      if (res.status === 403 && /storageQuota|quota/i.test(res.text)) throw new DriveError('o Google Drive está sem espaço', 403);
      if (res.status === 403 && /rateLimit|userRateLimit/i.test(res.text)) { lastErr = new DriveError('limite de uso do Google Drive; tente em instantes', 403); await this.sleep(1000 * 2 ** i); continue; }
      if (res.status === 404) throw new DriveError('não encontrado no Google Drive', 404);
      throw new DriveError(`erro do Google Drive (${res.status})${reason ? ': ' + reason : ''}`, res.status);
    }
    throw lastErr || new DriveError('o Google Drive não respondeu', 0);
  }

  /** Acha (ou cria) a pasta. Se houver mais de uma (dois aparelhos criaram juntos), usa a MAIS ANTIGA — todos escolhem a mesma. */
  async ensureFolder() {
    if (this.folderId) {
      try { const r = await this.call('GET', `${this.api}/files/${encodeURIComponent(this.folderId)}?fields=id,trashed`); const j = JSON.parse(r.text); if (!j.trashed) return this.folderId; }
      catch (e) { if (e.status !== 404) throw e; }
      this.folderId = null;                                             // sumiu ou foi para a lixeira do Drive: procura/cria de novo (nada é apagado por nós)
    }
    const found = JSON.parse((await this.call('GET', `${this.api}/files?q=${encodeURIComponent(`mimeType='${FOLDER_MIME}' and name='${q(this.folderName)}' and trashed=false`)}&orderBy=createdTime&fields=files(id,createdTime)&pageSize=10`)).text).files || [];
    if (found.length) return (this.folderId = found[0].id);
    const made = JSON.parse((await this.call('POST', `${this.api}/files?fields=id`, { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: this.folderName, mimeType: FOLDER_MIME }) })).text);
    // corrida: outro aparelho pode ter criado ao mesmo tempo; reconfere e fica com a mais antiga
    const again = JSON.parse((await this.call('GET', `${this.api}/files?q=${encodeURIComponent(`mimeType='${FOLDER_MIME}' and name='${q(this.folderName)}' and trashed=false`)}&orderBy=createdTime&fields=files(id,createdTime)&pageSize=10`)).text).files || [];
    return (this.folderId = (again[0] && again[0].id) || made.id);
  }

  async check() { await this.ensureFolder(); }

  async list() {
    const folder = await this.ensureFolder(); const out = []; this.ids.clear(); let page = '';
    do {
      const url = `${this.api}/files?q=${encodeURIComponent(`'${folder}' in parents and trashed=false`)}&fields=${encodeURIComponent('nextPageToken,files(id,name)')}&pageSize=1000${page ? '&pageToken=' + encodeURIComponent(page) : ''}`;
      const j = JSON.parse((await this.call('GET', url)).text);
      for (const f of j.files || []) { const n = 'maps/' + f.name; if (NAME.test(n)) { this.ids.set(n, f.id); out.push(n); } }
      page = j.nextPageToken || '';
    } while (page);
    return out;
  }

  async read(name) {
    if (!NAME.test(name)) throw new Error('nome inválido');
    const id = this.ids.get(name); if (!id) throw new DriveError('arquivo não encontrado no Google Drive', 404);
    const r = await this.call('GET', `${this.api}/files/${encodeURIComponent(id)}?alt=media`, { binary: true });
    return Buffer.from(r.text, 'base64');                               // com binary:true o adaptador de rede devolve o corpo em base64
  }

  async write(name, data) {
    if (!NAME.test(name)) throw new Error('nome inválido');
    const folder = await this.ensureFolder(), fname = name.slice(5);
    if (this.ids.has(name)) return;                                      // já enviado (mesmo nome = mesmo conteúdo)
    // reenvio depois de uma queda de rede: confere se o arquivo já chegou antes de criar outro
    const dup = JSON.parse((await this.call('GET', `${this.api}/files?q=${encodeURIComponent(`'${folder}' in parents and name='${q(fname)}' and trashed=false`)}&fields=files(id)&pageSize=1`)).text).files || [];
    if (dup.length) { this.ids.set(name, dup[0].id); return; }
    const boundary = 'mc' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: fname, parents: [folder], mimeType: 'application/octet-stream' })}\r\n` +
      `--${boundary}\r\nContent-Type: application/octet-stream\r\nContent-Transfer-Encoding: base64\r\n\r\n${Buffer.from(data).toString('base64')}\r\n--${boundary}--`;
    const r = JSON.parse((await this.call('POST', `${this.upload}/files?uploadType=multipart&fields=id`, { headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body })).text);
    this.ids.set(name, r.id);
  }
}
module.exports = { DriveRemote, DriveError };
