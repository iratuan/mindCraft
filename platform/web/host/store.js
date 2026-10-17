'use strict';
/**
 * Persistência do sistema de arquivos virtual no IndexedDB (armazenamento durável do navegador/WebView do tablet).
 * Ao abrir o app, tudo é restaurado; a cada mudança, só os arquivos alterados são regravados (em lote, com atraso curto).
 * Se a gravação falhar, as mudanças voltam para a fila e são tentadas de novo (nada é descartado em silêncio).
 */
const DB_VERSION = 1;

const openDb = (name) => new Promise((resolve, reject) => {
  const r = indexedDB.open(name, DB_VERSION);
  r.onupgradeneeded = () => { r.result.createObjectStore('files'); r.result.createObjectStore('dirs'); };
  r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error || new Error('IndexedDB indisponível'));
});
const run = (db, stores, mode, fn) => new Promise((resolve, reject) => {
  const t = db.transaction(stores, mode); let out;
  try { out = fn(t); } catch (e) { try { t.abort(); } catch { /* já abortada */ } reject(e); return; }
  t.oncomplete = () => resolve(out); t.onerror = () => reject(t.error); t.onabort = () => reject(t.error || new Error('transação abortada'));
});
const readAll = (db, store) => new Promise((resolve, reject) => {
  const out = []; const req = db.transaction(store, 'readonly').objectStore(store).openCursor();
  req.onsuccess = () => { const c = req.result; if (c) { out.push([c.key, c.value]); c.continue(); } else resolve(out); }; req.onerror = () => reject(req.error);
});

async function openStore(name, { debounceMs = 8, retryMs = 1500 } = {}) {
  const db = await openDb(name);
  let vfs = null, pending = new Map(), timer = null, inflight = Promise.resolve(), failures = 0;

  async function loadInto(fsModule) {
    const files = (await readAll(db, 'files')).map(([k, v]) => [k, v.bytes instanceof Uint8Array ? v.bytes : new Uint8Array(v.bytes), v.mtime || 0]);
    const dirs = (await readAll(db, 'dirs')).map(([k]) => k);
    fsModule.vfs.loadRaw(files, dirs); return { files: files.length, dirs: dirs.length };
  }
  function schedule(ms = debounceMs) { if (timer) return; timer = setTimeout(() => { timer = null; flushNow(); }, ms); }
  function flushNow() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (!pending.size) return inflight;
    const batch = pending; pending = new Map();
    inflight = inflight.then(() => run(db, ['files', 'dirs'], 'readwrite', (t) => {
      for (const [p, op] of batch) {
        if (op === 'put') { const b = vfs.rawGet(p); if (b) t.objectStore('files').put({ bytes: b, mtime: vfs.rawMtime(p) }, p); else t.objectStore('files').delete(p); }
        else if (op === 'mkdir') t.objectStore('dirs').put(true, p);
        else { t.objectStore('files').delete(p); t.objectStore('dirs').delete(p); }
      }
    })).then(() => { failures = 0; }, (e) => {
      failures++; for (const [p, op] of batch) if (!pending.has(p)) pending.set(p, op);          // devolve à fila: será tentado de novo
      console.error('MindCraft: falha ao gravar no armazenamento do aparelho:', e && e.message);
      try { window.dispatchEvent(new CustomEvent('mc:storage-error', { detail: { message: String(e && e.message), failures } })); } catch { /* sem window */ }
      schedule(retryMs);
    });
    return inflight;
  }
  function attach(v) {
    vfs = v;
    v.onChange(({ op, path }) => { pending.set(path, op === 'write' ? 'put' : op === 'mkdir' ? 'mkdir' : 'del'); schedule(); });
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushNow(); });
      window.addEventListener('pagehide', () => flushNow());
    }
  }
  /** Resolve quando tudo o que mudou até agora já está gravado (usado pelos testes e antes de exportar). */
  async function idle() { for (let i = 0; i < 50; i++) { flushNow(); await inflight; if (!pending.size && !timer) return true; await new Promise((r) => setTimeout(r, 10)); } return !pending.size; }
  const close = () => db.close();
  return { loadInto, attach, flushNow, idle, close, get pendingCount() { return pending.size; } };
}
module.exports = { openStore };
