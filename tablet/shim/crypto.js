'use strict';
/**
 * Substituto do `crypto` do Node para a versão web/Android: só o que o núcleo usa (SHA-256 síncrono e bytes aleatórios).
 * O `crypto.subtle` do navegador é assíncrono, e o núcleo precisa de hash síncrono; por isso o SHA-256 é implementado aqui
 * (verificado contra o `crypto` do Node em test/web-parity.test.js).
 */
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

class Sha256 {
  constructor() { this.h = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]); this.buf = new Uint8Array(64); this.fill = 0; this.len = 0; this.w = new Uint32Array(80); this.done = false; }
  update(data, enc) {
    if (this.done) throw new Error('digest já calculado');
    const b = typeof data === 'string' ? new TextEncoder().encode(data) : data instanceof Uint8Array ? data : new Uint8Array(data.buffer || data);
    if (typeof data === 'string' && enc && enc !== 'utf8' && enc !== 'utf-8') throw new Error('codificação não suportada: ' + enc);
    this.len += b.length; let i = 0;
    if (this.fill) { const take = Math.min(64 - this.fill, b.length); this.buf.set(b.subarray(0, take), this.fill); this.fill += take; i = take; if (this.fill === 64) { this._block(this.buf, 0); this.fill = 0; } }
    for (; i + 64 <= b.length; i += 64) this._block(b, i);
    if (i < b.length) { this.buf.set(b.subarray(i), 0); this.fill = b.length - i; }
    return this;
  }
  _block(p, o) {
    const w = this.w, h = this.h;
    for (let i = 0; i < 16; i++) w[i] = (p[o + 4 * i] << 24) | (p[o + 4 * i + 1] << 16) | (p[o + 4 * i + 2] << 8) | p[o + 4 * i + 3];
    for (let i = 16; i < 64; i++) {
      const a = w[i - 15], b = w[i - 2];
      const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3), s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7)), ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K[i] + w[i]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10)), maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h[0] += a; h[1] += b; h[2] += c; h[3] += d; h[4] += e; h[5] += f; h[6] += g; h[7] += hh;
  }
  digest(enc) {
    if (this.done) throw new Error('digest já calculado');
    this.done = true;
    const bits = this.len * 8, pad = new Uint8Array(((this.fill < 56 ? 56 : 120) - this.fill) + 8);
    pad[0] = 0x80;
    const hi = Math.floor(bits / 0x100000000), lo = bits >>> 0, n = pad.length;
    pad[n - 8] = hi >>> 24; pad[n - 7] = hi >>> 16; pad[n - 6] = hi >>> 8; pad[n - 5] = hi; pad[n - 4] = lo >>> 24; pad[n - 3] = lo >>> 16; pad[n - 2] = lo >>> 8; pad[n - 1] = lo;
    const keep = this.len; this.done = false; this.update(pad); this.len = keep; this.done = true;
    const out = new Uint8Array(32); for (let i = 0; i < 8; i++) { out[4 * i] = this.h[i] >>> 24; out[4 * i + 1] = this.h[i] >>> 16; out[4 * i + 2] = this.h[i] >>> 8; out[4 * i + 3] = this.h[i]; }
    if (enc === 'hex') return Array.from(out, (x) => x.toString(16).padStart(2, '0')).join('');
    if (!enc) return typeof Buffer !== 'undefined' ? Buffer.from(out) : out;
    throw new Error('codificação não suportada: ' + enc);
  }
}

/** SHA-1 (só para nomear pastas de backup; não é usado para segurança). Mesma estrutura do Sha256: blocos de 64 bytes. */
class Sha1 extends Sha256 {
  constructor() { super(); this.h = new Uint32Array([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0]); }
  _block(p, o) {
    const w = this.w; const h = this.h; const rol = (x, n) => (x << n) | (x >>> (32 - n));
    for (let i = 0; i < 16; i++) w[i] = (p[o + 4 * i] << 24) | (p[o + 4 * i + 1] << 16) | (p[o + 4 * i + 2] << 8) | p[o + 4 * i + 3];
    for (let i = 16; i < 80; i++) w[i] = rol(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
    let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4];
    for (let i = 0; i < 80; i++) {
      const f = i < 20 ? (b & c) | (~b & d) : i < 40 ? b ^ c ^ d : i < 60 ? (b & c) | (b & d) | (c & d) : b ^ c ^ d, k = i < 20 ? 0x5a827999 : i < 40 ? 0x6ed9eba1 : i < 60 ? 0x8f1bbcdc : 0xca62c1d6;
      const t = (rol(a, 5) + f + e + k + w[i]) | 0; e = d; d = c; c = rol(b, 30); b = a; a = t;
    }
    h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0; h[4] = (h[4] + e) | 0;
  }
  digest(enc) {
    if (this.done) throw new Error('digest já calculado'); this.done = true;
    const bits = this.len * 8, pad = new Uint8Array(((this.fill < 56 ? 56 : 120) - this.fill) + 8); pad[0] = 0x80;
    const hi = Math.floor(bits / 0x100000000), lo = bits >>> 0, n = pad.length;
    pad[n - 8] = hi >>> 24; pad[n - 7] = hi >>> 16; pad[n - 6] = hi >>> 8; pad[n - 5] = hi; pad[n - 4] = lo >>> 24; pad[n - 3] = lo >>> 16; pad[n - 2] = lo >>> 8; pad[n - 1] = lo;
    const keep = this.len; this.done = false; this.update(pad); this.len = keep; this.done = true;
    const out = new Uint8Array(20); for (let i = 0; i < 5; i++) { out[4 * i] = this.h[i] >>> 24; out[4 * i + 1] = this.h[i] >>> 16; out[4 * i + 2] = this.h[i] >>> 8; out[4 * i + 3] = this.h[i]; }
    if (enc === 'hex') return Array.from(out, (x) => x.toString(16).padStart(2, '0')).join('');
    if (!enc) return typeof Buffer !== 'undefined' ? Buffer.from(out) : out;
    throw new Error('codificação não suportada: ' + enc);
  }
}
function createHash(alg) { const a = String(alg).toLowerCase(); if (a === 'sha256') return new Sha256(); if (a === 'sha1') return new Sha1(); throw new Error('só sha256 e sha1 são suportados na versão web'); }
function randomBytes(n) {
  const a = new Uint8Array(n); const c = globalThis.crypto;
  if (!c || !c.getRandomValues) throw new Error('sem gerador de números aleatórios seguro neste ambiente');
  for (let i = 0; i < n; i += 65536) c.getRandomValues(a.subarray(i, Math.min(n, i + 65536)));
  return typeof Buffer !== 'undefined' ? Buffer.from(a) : a;
}
module.exports = { createHash, randomBytes };
