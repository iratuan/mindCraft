'use strict';
// `path` (POSIX) para a versão web/Android: o subconjunto que o núcleo usa. Raiz virtual "/".
function normalizeParts(p) { const out = []; for (const s of p.split('/')) { if (!s || s === '.') continue; if (s === '..') out.pop(); else out.push(s); } return out; }
const isAbsolute = (p) => String(p).startsWith('/');
const resolve = (...args) => { let r = ''; for (let i = args.length - 1; i >= 0 && !isAbsolute(r); i--) { const a = String(args[i]); if (a) r = a + (r ? '/' + r : ''); } if (!isAbsolute(r)) r = '/' + r; return '/' + normalizeParts(r).join('/'); };
const normalize = (p) => { p = String(p); const abs = isAbsolute(p), parts = normalizeParts(p).join('/'); return (abs ? '/' : '') + parts || (abs ? '/' : '.'); };
const join = (...args) => normalize(args.filter((a) => String(a)).join('/') || '.');
const dirname = (p) => { p = String(p); if (/^\/+$/.test(p)) return '/'; p = p.replace(/\/+$/, ''); const i = p.lastIndexOf('/'); return i < 0 ? '.' : i === 0 ? '/' : p.slice(0, i); };
const basename = (p, ext) => { p = String(p).replace(/\/+$/, ''); let b = p.slice(p.lastIndexOf('/') + 1); if (ext && b.endsWith(ext) && b !== ext) b = b.slice(0, -ext.length); return b; };
const extname = (p) => { const b = basename(p), i = b.lastIndexOf('.'); return i <= 0 ? '' : b.slice(i); };
module.exports = { sep: '/', isAbsolute, resolve, normalize, join, dirname, basename, extname };
