'use strict';
/**
 * Sistema de arquivos VIRTUAL (na memória) para a versão web/Android: o mesmo subconjunto do `fs` do Node que o núcleo usa
 * (readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, rmSync, readdirSync, statSync).
 * O hospedeiro (navegador/Android) persiste o conteúdo em armazenamento durável: `vfs.snapshot()` / `vfs.restore(obj)`
 * e `vfs.onChange(cb)` avisam quando algo mudou (a camada de plataforma grava no IndexedDB ou no disco do aparelho).
 */
const path = require('./path');

const files = new Map();      // caminho absoluto -> Uint8Array
const dirs = new Set(['/']);
const listeners = new Set();
const enoent = (p, op) => Object.assign(new Error(`ENOENT: no such file or directory, ${op} '${p}'`), { code: 'ENOENT', path: p });
const norm = (p) => path.resolve(String(p));
const changed = () => { for (const f of listeners) { try { f(); } catch { /* ouvinte com defeito não derruba a gravação */ } } };
const toBytes = (d) => (typeof d === 'string' ? new TextEncoder().encode(d) : d instanceof Uint8Array ? new Uint8Array(d) : new Uint8Array(d.buffer ? d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength) : d));
const asBuffer = (u8) => (typeof Buffer !== 'undefined' ? Buffer.from(u8.buffer, u8.byteOffset, u8.length) : u8);

function mkdirSync(p, o = {}) {
  p = norm(p); if (dirs.has(p)) return;
  const parent = path.dirname(p);
  if (!dirs.has(parent)) { if (o.recursive) mkdirSync(parent, o); else throw enoent(parent, 'mkdir'); }
  dirs.add(p); changed();
}
function writeFileSync(p, data) {
  p = norm(p); const parent = path.dirname(p); if (!dirs.has(parent)) throw enoent(p, 'open');
  files.set(p, toBytes(data)); changed();
}
function readFileSync(p, enc) {
  p = norm(p); const b = files.get(p); if (!b) throw enoent(p, 'open');
  if (enc) { if (!/^utf-?8$/i.test(typeof enc === 'string' ? enc : enc.encoding)) throw new Error('codificação não suportada'); return new TextDecoder().decode(b); }
  return asBuffer(new Uint8Array(b));
}
const existsSync = (p) => { p = norm(p); return files.has(p) || dirs.has(p); };
function renameSync(a, b) {
  a = norm(a); b = norm(b); const d = files.get(a); if (!d) throw enoent(a, 'rename');
  if (!dirs.has(path.dirname(b))) throw enoent(b, 'rename'); files.delete(a); files.set(b, d); changed();
}
function rmSync(p, o = {}) {
  p = norm(p);
  if (files.delete(p)) { changed(); return; }
  if (dirs.has(p)) { const pre = p === '/' ? '/' : p + '/'; if (!o.recursive && [...files.keys(), ...dirs].some((k) => k !== p && k.startsWith(pre))) throw new Error(`ENOTEMPTY: ${p}`); for (const k of [...files.keys()]) if (k.startsWith(pre)) files.delete(k); for (const k of [...dirs]) if (k !== '/' && (k === p || k.startsWith(pre))) dirs.delete(k); changed(); return; }
  if (!o.force) throw enoent(p, 'rm');
}
function readdirSync(p, o = {}) {
  p = norm(p); if (!dirs.has(p)) throw enoent(p, 'scandir');
  const pre = p === '/' ? '/' : p + '/', names = new Map();
  for (const k of files.keys()) if (k.startsWith(pre) && !k.slice(pre.length).includes('/')) names.set(k.slice(pre.length), false);
  for (const k of dirs) if (k !== p && k.startsWith(pre) && !k.slice(pre.length).includes('/')) names.set(k.slice(pre.length), true);
  const list = [...names.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  return o.withFileTypes ? list.map(([name, isDir]) => ({ name, isDirectory: () => isDir, isFile: () => !isDir })) : list.map(([n]) => n);
}
function statSync(p) {
  p = norm(p); const f = files.get(p);
  if (f) return { isFile: () => true, isDirectory: () => false, size: f.length, mtimeMs: 0 };
  if (dirs.has(p)) return { isFile: () => false, isDirectory: () => true, size: 0, mtimeMs: 0 };
  throw enoent(p, 'stat');
}
const vfs = {
  snapshot: () => ({ files: [...files].map(([k, v]) => [k, Array.from(v)]), dirs: [...dirs] }),
  restore: (s) => { files.clear(); dirs.clear(); dirs.add('/'); for (const d of s.dirs || []) dirs.add(d); for (const [k, v] of s.files || []) files.set(k, new Uint8Array(v)); },
  onChange: (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
  clear: () => { files.clear(); dirs.clear(); dirs.add('/'); },
};
module.exports = { mkdirSync, writeFileSync, readFileSync, existsSync, renameSync, rmSync, readdirSync, statSync, unlinkSync: (p) => rmSync(p), vfs };
