'use strict';
// Adaptador de rede para o Node/Electron (desktop e testes): { method, url, headers, body, binary } → { status, text }.
// Sem dependências (usa http/https do Node). Com binary:true, o corpo da resposta volta em base64. Tempo máximo por chamada: 60 s.
const http = require('http');
const https = require('https');

function nodeHttp({ method = 'GET', url, headers = {}, body = null, binary = false, timeoutMs = 60000 }) {
  return new Promise((resolve, reject) => {
    const u = new URL(url); const lib = u.protocol === 'http:' ? http : https;
    if (u.protocol !== 'https:' && !(u.protocol === 'http:' && /^(127\.0\.0\.1|localhost)$/.test(u.hostname))) return reject(new Error('só HTTPS é permitido'));
    const data = body == null ? null : Buffer.from(body);
    const req = lib.request(u, { method, headers: { ...(data ? { 'Content-Length': data.length } : {}), ...headers } }, (res) => {
      const parts = []; res.on('data', (d) => parts.push(d));
      res.on('end', () => { const buf = Buffer.concat(parts); resolve({ status: res.statusCode, text: binary && res.statusCode < 300 ? buf.toString('base64') : buf.toString('utf8') }); });
      res.on('error', reject);
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error('tempo esgotado')));
    req.on('error', reject);
    if (data) req.write(data); req.end();
  });
}
module.exports = { nodeHttp };
