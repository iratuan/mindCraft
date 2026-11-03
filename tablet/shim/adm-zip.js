'use strict';
/**
 * Substituto do `adm-zip` para a versão web/Android, sobre `fflate` (JS puro). Implementa só o que o MindCraft usa:
 * new AdmZip(buffer|caminho), getEntry/getEntries (com header.size = tamanho DESCOMPACTADO, lido do diretório central,
 * sem descompactar: é o que protege contra zip bomb), addFile, updateFile, toBuffer, writeZip.
 */
const { unzipSync, zipSync } = require('fflate');
const fs = require('fs');

const toBuf = (u8) => (typeof Buffer !== 'undefined' ? Buffer.from(u8.buffer, u8.byteOffset, u8.length) : u8);

class AdmZip {
  constructor(source) {
    this._raw = null;           // bytes do zip original (para extrair sob demanda)
    this._meta = new Map();     // nome -> { size }
    this._added = new Map();    // nome -> Uint8Array (arquivos novos/alterados)
    this._order = [];
    if (source !== undefined && source !== null) {
      const bytes = typeof source === 'string' ? fs.readFileSync(source) : source;
      this._raw = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
      try { unzipSync(this._raw, { filter: (f) => { if (!f.name.endsWith('/')) { this._meta.set(f.name, { size: f.originalSize }); this._order.push(f.name); } return false; } }); }
      catch (e) { throw new Error('Arquivo zip inválido: ' + e.message); }
    }
  }
  _entry(name) {
    const added = this._added.get(name); const meta = this._meta.get(name);
    if (!added && !meta) return null;
    const self = this;
    return {
      entryName: name, isDirectory: false,
      header: { size: added ? added.length : meta.size },
      getData() {
        if (added) return toBuf(added);
        const out = unzipSync(self._raw, { filter: (f) => f.name === name });
        if (!out[name]) throw new Error('entrada ausente: ' + name);
        return toBuf(out[name]);
      },
    };
  }
  getEntry(name) { return this._entry(name); }
  getEntries() { return this._order.map((n) => this._entry(n)); }
  addFile(name, data) { if (!this._order.includes(name)) this._order.push(name); this._added.set(name, data instanceof Uint8Array ? data : new Uint8Array(data)); }
  updateFile(name, data) { if (!this._order.includes(name)) throw new Error('Entrada inexistente: ' + name); this._added.set(name, data instanceof Uint8Array ? data : new Uint8Array(data)); }
  toBuffer() {
    const files = {}; let original = null;
    for (const n of this._order) {
      if (this._added.has(n)) files[n] = this._added.get(n);
      else { original = original || unzipSync(this._raw); files[n] = original[n]; }
    }
    return toBuf(zipSync(files, { level: 6 }));
  }
  writeZip(target) { fs.writeFileSync(target, this.toBuffer()); }
}
module.exports = AdmZip;
