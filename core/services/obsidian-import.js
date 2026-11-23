'use strict';
/**
 * Detecta notas do MindCraft editadas no Obsidian (sincronização bidirecional, fase 1: detecção).
 * Lê os .md da pasta MindCraft/, compara o hash armazenado com o hash do conteúdo atual.
 * Devolve a lista de notas editadas com seu conteúdo para revisão/importação.
 */
const fs = require('fs');
const path = require('path');
const { fingerprint, ID_KEY, HASH_KEY } = require('./obsidian');

function readOurs(text) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!m || !new RegExp(`^${ID_KEY}: `, 'm').test(m[1])) return null;
  const hashM = new RegExp(`^${HASH_KEY}: (.*)$`, 'm').exec(m[1]);
  const storedHash = hashM ? (function (s) { try { return JSON.parse(s); } catch { return null; } })(hashM[1]) : null;
  const stripped = text.replace(new RegExp(`^${HASH_KEY}: .*\\n`, 'm'), '');
  const edited = !storedHash || fingerprint(stripped) !== storedHash;
  const idM = new RegExp(`^${ID_KEY}: (.*)$`, 'm').exec(m[1]);
  const id = idM ? (function (s) { try { return JSON.parse(s); } catch { return null; } })(idM[1]) : null;
  // extrai o corpo (após o frontmatter)
  const bodyM = /^---\n[\s\S]*?\n---\n([\s\S]*)$/.exec(text);
  const body = bodyM ? bodyM[1].trim() : '';
  return { edited, id, body, storedHash };
}

function detectEditedNotes(vaultDir, folder = 'MindCraft') {
  const base = path.join(vaultDir, folder);
  const result = [];
  const walk = (d) => {
    let items;
    try { items = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const it of items) {
      const full = path.join(d, it.name);
      if (it.isDirectory()) walk(full);
      else if (it.isFile() && /\.md$/i.test(it.name)) {
        try {
          const text = fs.readFileSync(full, 'utf8');
          const ours = readOurs(text);
          if (ours && ours.edited) {
            result.push({ path: path.relative(vaultDir, full), id: ours.id, body: ours.body, fullPath: full });
          }
        } catch { /* ilegível: ignora */ }
      }
    }
  };
  walk(base);
  return result;
}

module.exports = { detectEditedNotes, readOurs };
