'use strict';
const fs = require('fs');
const path = require('path');
const { readMom } = require('./mom');

/**
 * "Vault" = uma pasta com arquivos .mom. Os links [[Mapa#Tópico]] entre eles formam a rede de conhecimento.
 * A leitura usa cache por (tamanho, data de modificação): reabrir o vault só relê o que mudou.
 */
const cache = new Map();
const IGNORE = new Set(['node_modules', '$recycle.bin', 'system volume information']);

function listMoms(dir, { maxDepth = 3, maxFiles = 500, maxVisited = 20000 } = {}) {
  const out = [];
  let truncated = false, visited = 0;
  const walk = (d, depth) => {
    let items;
    try { items = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    items.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    for (const it of items) {
      if (out.length >= maxFiles || ++visited > maxVisited) { truncated = true; return; } // pasta enorme: não trava o app
      if (it.name.startsWith('.') || IGNORE.has(it.name.toLowerCase())) continue;
      const full = path.join(d, it.name);
      if (it.isDirectory()) { if (depth < maxDepth) walk(full, depth + 1); }
      else if (it.isFile() && /\.mom$/i.test(it.name) && !/\.tmp-\d+$/i.test(it.name)) out.push(full);
    }
  };
  walk(dir, 0);
  return { files: out, truncated };
}

/** @returns {{ maps: {key, name, file, map}[], errors: {file, error}[], truncated: boolean }} */
function loadVault(dir) {
  const maps = [], errors = [];
  if (!dir || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return { maps, errors: [{ file: dir || '', error: 'Pasta inexistente.' }], truncated: false };
  const { files, truncated } = listMoms(dir);
  const live = new Set(files);
  for (const k of [...cache.keys()]) if (!live.has(k)) cache.delete(k);
  for (const file of files) {
    try {
      const st = fs.statSync(file);
      let c = cache.get(file);
      if (!c || c.mtimeMs !== st.mtimeMs || c.size !== st.size) {
        c = { mtimeMs: st.mtimeMs, size: st.size, map: readMom(fs.readFileSync(file)) };
        cache.set(file, c);
      }
      maps.push({ key: file, file, name: path.basename(file, path.extname(file)), map: c.map });
    } catch (e) { errors.push({ file, error: e.message }); }
  }
  return { maps, errors, truncated };
}

module.exports = { listMoms, loadVault, clearVaultCache: () => cache.clear() };
