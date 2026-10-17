'use strict';
/* Adaptador de rede da versão web/tablet: { method, url, headers, body, binary } → { status, text }  (mesmo contrato de core/net-node.js).
   No Android usa o plugin nativo CapacitorHttp (não depende de CORS e não passa pelo WebView); no navegador comum usa fetch.
   Só HTTPS é aceito (HTTP apenas para 127.0.0.1, usado nos testes). Com binary:true a resposta volta em base64. */
const cap = () => (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform() ? window.Capacitor : null);
const b64 = (buf) => { let s = ''; const a = new Uint8Array(buf); for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); };

async function webHttp({ method = 'GET', url, headers = {}, body = null, binary = false, timeoutMs = 60000 }) {
  const u = new URL(url);
  if (u.protocol !== 'https:' && !(u.protocol === 'http:' && /^(127\.0\.0\.1|localhost)$/.test(u.hostname))) throw new Error('só HTTPS é permitido');
  const c = cap();
  if (c) {
    const form = /application\/x-www-form-urlencoded/i.test(Object.entries(headers).find(([k]) => k.toLowerCase() === 'content-type')?.[1] || '');
    const data = body == null ? undefined : form ? Object.fromEntries(new URLSearchParams(body)) : body;   // o plugin espera um objeto nos formulários
    const r = await c.nativePromise('CapacitorHttp', 'request', { url, method, headers, data, responseType: binary ? 'arraybuffer' : 'text', connectTimeout: timeoutMs, readTimeout: timeoutMs });
    const text = typeof r.data === 'string' ? r.data : r.data == null ? '' : JSON.stringify(r.data);
    return { status: r.status, text };
  }
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method, headers, body: body == null ? undefined : body, signal: ctl.signal });
    return { status: res.status, text: binary && res.ok ? b64(await res.arrayBuffer()) : await res.text() };
  } finally { clearTimeout(t); }
}
module.exports = { webHttp };
