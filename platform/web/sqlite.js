'use strict';
/**
 * Substituto do `node:sqlite` (DatabaseSync) para a versão web/Android, sobre `sql.js` (SQLite em WebAssembly, interface SÍNCRONA).
 * Mantém a interface que core/library.js usa: exec, prepare(...).run/get/all, close, PRAGMA, SAVEPOINT e VACUUM INTO.
 *
 * Persistência: o banco vive em memória; depois de CADA transação concluída (ou instrução solta) os bytes são gravados em `file`
 * com tmp+rename, para que fechar o app de repente nunca perca uma gravação confirmada. O motor (`SQL`) é entregue pelo hospedeiro
 * com setSql(): assim o núcleo não depende de como o .wasm é carregado (fetch no navegador, disco no Node).
 */
const fs = require('fs');
const path = require('path');

let SQL = null;
function setSql(s) { SQL = s; }
const engine = () => { const s = SQL || globalThis.__MC_SQL; if (!s) throw new Error('SQLite (WebAssembly) ainda não foi carregado: chame setSql() com o resultado de initSqlJs().'); return s; };

const READ_ONLY = /^\s*(select|pragma\s+(?!.*=)|with\s)/i;     // não altera o banco (PRAGMA com "=" altera)
const bindable = (v) => (v === undefined ? (() => { throw new Error('Valor indefinido não pode ser gravado no SQLite.'); })() : typeof v === 'boolean' ? (() => { throw new Error('Booleano não pode ser gravado no SQLite (use 0/1).'); })() : v);

class Statement {
  constructor(owner, sql) { this.o = owner; this.sql = sql; }
  _run(params, mode) {
    const o = this.o, db = o.db, st = db.prepare(this.sql);
    try {
      const vals = params.map(bindable); if (vals.length) st.bind(vals);
      if (mode === 'get') return st.step() ? st.getAsObject() : undefined;
      if (mode === 'all') { const rows = []; while (st.step()) rows.push(st.getAsObject()); return rows; }
      while (st.step()) { /* consome (INSERT/UPDATE/DELETE não devolvem linhas) */ }
      const changes = db.getRowsModified(); let id = 0;
      if (/^\s*insert|^\s*replace/i.test(this.sql)) { const r = db.exec('SELECT last_insert_rowid()'); id = r[0].values[0][0]; }
      return { changes, lastInsertRowid: id };
    } finally { st.free(); if (mode !== 'run' ? false : true) o._afterWrite(this.sql); }
  }
  run(...p) { return this._run(p, 'run'); }
  get(...p) { return this._run(p, 'get'); }
  all(...p) { return this._run(p, 'all'); }
}

class DatabaseSync {
  constructor(file) {
    const S = engine(); this.file = file; this._inTx = false; this._closed = false;
    const mem = file === ':memory:';
    let bytes; if (!mem && fs.existsSync(file)) { bytes = fs.readFileSync(file); if (!bytes.length) bytes = undefined; }
    try { this.db = new S.Database(bytes ? new Uint8Array(bytes) : undefined); }
    catch (e) { throw new Error('file is not a database: ' + e.message); }
    this._pragmas = '';
  }
  /** Reaplica o que o `export()` do sql.js perde (ele fecha e reabre o banco). */
  _reopenState() { if (this._pragmas) this.db.exec(this._pragmas); }
  _flush() {
    if (this.file === ':memory:' || this._inTx || this._closed) return;
    const bytes = this.db.export(); this._reopenState();
    const tmp = `${this.file}.tmp-${process.pid || 0}`; fs.mkdirSync(path.dirname(this.file), { recursive: true });
    try { fs.writeFileSync(tmp, bytes); fs.renameSync(tmp, this.file); } catch (e) { try { fs.rmSync(tmp, { force: true }); } catch { /* ignora */ } throw e; }
  }
  _afterWrite(sql) { if (!READ_ONLY.test(sql)) this._flush(); }
  exec(sql) {
    for (const part of String(sql).split(';')) {                // só para controlar transações e lembrar PRAGMAs de sessão
      const s = part.trim().toUpperCase();
      if (/^BEGIN/.test(s)) this._inTx = true;
      else if (/^PRAGMA\s+(FOREIGN_KEYS|BUSY_TIMEOUT)\s*=/.test(s)) this._pragmas += part.trim() + ';';
    }
    this.db.exec(sql);
    const s = String(sql).trim();
    if (/(^|;)\s*(commit|end)\b/i.test(s) || /(^|;)\s*rollback\s*$/i.test(s) && !/to\s+\w+/i.test(s)) { this._inTx = false; if (/commit|end/i.test(s)) this._flush(); }
    else if (!this._inTx && !READ_ONLY.test(s)) this._flush();
  }
  prepare(sql) {
    const s = String(sql);
    if (/^\s*vacuum\s+into\s+\?/i.test(s)) {                    // cópia consistente do banco inteiro
      const self = this;
      return { run(target) { const bytes = self.db.export(); self._reopenState(); fs.writeFileSync(target, bytes); return { changes: 0, lastInsertRowid: 0 }; }, get() { throw new Error('VACUUM INTO não devolve linhas'); }, all() { throw new Error('VACUUM INTO não devolve linhas'); } };
    }
    return new Statement(this, s);
  }
  close() { if (this._closed) return; this._flush(); this._closed = true; this.db.close(); }
}
module.exports = { DatabaseSync, setSql };
