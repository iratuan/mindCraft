'use strict';
// Servidor FALSO do Google (OAuth de dispositivo + Drive v3 mínimo) só para os testes. Local, em http://127.0.0.1:<porta>.
// Permite injetar falhas (429, 500, 401, cota), expirar tokens, revogar o acesso e mexer nos arquivos "por fora".
const http = require('http');

function startMockGoogle() {
  const S = { agents: [], files: new Map(), seq: 0, calls: [], tokens: new Map(), refreshOk: true, deviceApproved: false, slowDown: 0, failNext: [], uploads: 0, devicePolls: 0, clientId: 'cli-123', clientSecret: 'sec-456' };
  const id = () => 'f' + (++S.seq).toString(36) + Math.random().toString(36).slice(2, 6);
  const json = (res, code, o) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
  const body = (req) => new Promise((r) => { const p = []; req.on('data', (d) => p.push(d)); req.on('end', () => r(Buffer.concat(p))); });
  const newToken = () => { const t = 'at-' + id(); S.tokens.set(t, Date.now() + 3600e3); return t; };
  S.expireAll = () => S.tokens.clear();

  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, 'http://x'); const raw = await body(req); const text = raw.toString('utf8');
    S.calls.push(req.method + ' ' + u.pathname); S.agents.push(String(req.headers['user-agent'] || ''));
    res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type'); res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (u.pathname === '/device/code') {
      const f = new URLSearchParams(text); if (f.get('client_id') !== S.clientId) return json(res, 401, { error: 'invalid_client' });
      return json(res, 200, { device_code: 'dev-1', user_code: 'ABCD-EFGH', verification_url: 'https://www.google.com/device', expires_in: 1800, interval: 1 });
    }
    if (u.pathname === '/token') {
      const f = new URLSearchParams(text);
      if (f.get('client_id') !== S.clientId || f.get('client_secret') !== S.clientSecret) return json(res, 401, { error: 'invalid_client' });
      if (f.get('grant_type') === 'refresh_token') { if (!S.refreshOk || f.get('refresh_token') !== 'rt-1') return json(res, 400, { error: 'invalid_grant' }); return json(res, 200, { access_token: newToken(), expires_in: 3600 }); }
      S.devicePolls++; if (S.slowDown > 0) { S.slowDown--; return json(res, 403, { error: 'slow_down' }); }
      if (!S.deviceApproved) return json(res, 428, { error: 'authorization_pending' });
      return json(res, 200, { access_token: newToken(), refresh_token: 'rt-1', expires_in: 3600 });
    }
    // ----- Drive -----
    if (S.failNext.length) { const f = S.failNext.shift(); if (f.when ? f.when.test(req.method + ' ' + u.pathname) : true) return json(res, f.status, f.body || { error: { message: 'falha injetada' } }); S.failNext.unshift(f); }
    const auth = /^Bearer (.+)$/.exec(req.headers.authorization || ''); if (!auth || !S.tokens.has(auth[1]) || S.tokens.get(auth[1]) < Date.now()) return json(res, 401, { error: { message: 'token inválido' } });
    const live = () => [...S.files.values()].filter((f) => !f.trashed);
    if (u.pathname === '/drive/v3/files' && req.method === 'GET') {
      const qq = u.searchParams.get('q') || ''; let list = live();
      const par = /'([^']+)' in parents/.exec(qq); if (par) list = list.filter((f) => f.parents && f.parents.includes(par[1]));
      const nm = /name='((?:[^'\\]|\\.)*)'/.exec(qq); if (nm) list = list.filter((f) => f.name === nm[1].replace(/\\(.)/g, '$1'));
      if (/mimeType='application\/vnd.google-apps.folder'/.test(qq)) list = list.filter((f) => f.mimeType === 'application/vnd.google-apps.folder');
      list.sort((a, b) => a.created - b.created || (a.id < b.id ? -1 : 1));
      const size = Number(u.searchParams.get('pageSize') || 100), start = Number(u.searchParams.get('pageToken') || 0), page = list.slice(start, start + Math.min(size, S.pageMax || size));
      return json(res, 200, { files: page.map((f) => ({ id: f.id, name: f.name, createdTime: new Date(f.created).toISOString() })), ...(start + page.length < list.length ? { nextPageToken: String(start + page.length) } : {}) });
    }
    if (u.pathname === '/drive/v3/files' && req.method === 'POST') { const m = JSON.parse(text); const f = { id: id(), name: m.name, mimeType: m.mimeType, parents: m.parents || [], created: Date.now() + S.seq }; S.files.set(f.id, f); return json(res, 200, { id: f.id }); }
    if (u.pathname === '/upload/drive/v3/files' && req.method === 'POST') {
      const b = /boundary=(.+)$/.exec(req.headers['content-type'] || '')[1]; const parts = text.split('--' + b).filter((p) => p.trim() && p.trim() !== '--');
      const meta = JSON.parse(parts[0].split('\r\n\r\n')[1].trim()); const p2 = parts[1]; const [h2, ...rest] = p2.split('\r\n\r\n'); let data = rest.join('\r\n\r\n').replace(/\r\n$/, '');
      const content = /base64/i.test(h2) ? Buffer.from(data, 'base64') : Buffer.from(data);
      if (S.quota) return json(res, 403, { error: { message: 'storageQuotaExceeded', errors: [{ reason: 'storageQuotaExceeded' }] } });
      const f = { id: id(), name: meta.name, mimeType: meta.mimeType, parents: meta.parents, content, created: Date.now() + S.seq }; S.files.set(f.id, f); S.uploads++; return json(res, 200, { id: f.id });
    }
    const one = /^\/drive\/v3\/files\/([^/]+)$/.exec(u.pathname);
    if (one && req.method === 'GET') {
      const f = S.files.get(decodeURIComponent(one[1])); if (!f) return json(res, 404, { error: { message: 'not found' } });
      if (u.searchParams.get('alt') === 'media') { res.writeHead(200, { 'Content-Type': 'application/octet-stream' }); return res.end(f.content || Buffer.alloc(0)); }
      return json(res, 200, { id: f.id, trashed: !!f.trashed });
    }
    json(res, 404, { error: { message: 'rota desconhecida ' + req.method + ' ' + u.pathname } });
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => {
    const base = 'http://127.0.0.1:' + server.address().port;
    resolve({ S, base, urls: { api: base + '/drive/v3', upload: base + '/upload/drive/v3', device: base + '/device/code', token: base + '/token' }, close: () => new Promise((r) => server.close(r)) });
  }));
}
module.exports = { startMockGoogle };
