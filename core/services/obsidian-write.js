'use strict';
/**
 * Grava a exportação do Obsidian na pasta do vault escolhida pelo usuário. Regras para não perder dados:
 *   - só escreve dentro de `<vault>/MindCraft/…` (caminho que não sai da pasta é recusado);
 *   - nunca apaga nada: notas antigas que não são mais geradas só são contadas (`obsolete`);
 *   - nota que o usuário criou com o mesmo nome (sem `mindcraft-id`) não é tocada;
 *   - nota gerada que o usuário EDITOU no Obsidian (hash diferente) não é sobrescrita;
 *   - gravação atômica (temporário + renomear) e sem regravar o que não mudou.
 */
const fs = require('fs');
const path = require('path');
const { fingerprint, ID_KEY, HASH_KEY, FOLDER } = require('./obsidian');

const HASH_LINE = new RegExp(`^${HASH_KEY}: .*\\n`, 'm');

/** Lê o cabeçalho gerado pelo MindCraft. Devolve null se a nota não é nossa. */
function readOurs(text) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!m || !new RegExp(`^${ID_KEY}: `, 'm').test(m[1])) return null;
  const hashM = new RegExp(`^${HASH_KEY}: (.*)$`, 'm').exec(m[1]);
  const storedHash = hashM ? safeJson(hashM[1]) : null;
  const stripped = text.replace(HASH_LINE, '');
  const edited = !storedHash || fingerprint(stripped) !== storedHash;
  return { edited };
}

function safeJson(s) { try { return JSON.parse(s); } catch { return null; } }

/** Lista as notas do MindCraft já existentes na pasta exportada (para contar as obsoletas). */
function listOurs(dir) {
  const out = [];
  const walk = (d) => {
    let items;
    try { items = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const it of items) {
      const full = path.join(d, it.name);
      if (it.isDirectory()) walk(full);
      else if (it.isFile() && /\.md$/i.test(it.name)) out.push(full);
    }
  };
  walk(dir);
  return out;
}

/**
 * @param vaultDir pasta do vault do Obsidian (existente)
 * @param files [{ path: 'MindCraft/Mapa/Tópico.md', content }] (caminhos com '/')
 * @returns {{written:string[], unchanged:string[], skipped:{path:string, reason:string}[], obsolete:number}}
 */
function writeObsidianVault(vaultDir, files, { folder = FOLDER } = {}) {
  if (!vaultDir || !fs.existsSync(vaultDir) || !fs.statSync(vaultDir).isDirectory()) throw new Error('A pasta do vault não existe.');
  const root = path.resolve(vaultDir);
  const result = { written: [], unchanged: [], skipped: [], obsolete: 0 };
  const expected = new Set();

  for (const f of files) {
    const target = path.resolve(root, ...f.path.split('/'));
    if (!target.startsWith(root + path.sep)) { result.skipped.push({ path: f.path, reason: 'caminho fora do vault' }); continue; }
    expected.add(target);
    let existing = null;
    try { existing = fs.readFileSync(target, 'utf8'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    if (existing !== null) {
      const ours = readOurs(existing);
      if (!ours) { result.skipped.push({ path: f.path, reason: 'já existe uma nota sua com esse nome' }); continue; }
      if (ours.edited) { result.skipped.push({ path: f.path, reason: 'editada no Obsidian (não sobrescrevi)' }); continue; }
      if (existing === f.content) { result.unchanged.push(f.path); continue; }
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const tmp = `${target}.tmp-${process.pid}`;
    try {
      fs.writeFileSync(tmp, f.content, 'utf8');
      fs.renameSync(tmp, target);
    } catch (e) {
      try { fs.unlinkSync(tmp); } catch { /* o temporário pode não existir */ }
      throw e;
    }
    result.written.push(f.path);
  }

  // notas nossas que deixaram de ser geradas: contadas, nunca apagadas
  const base = path.join(root, folder);
  for (const file of listOurs(base)) {
    if (expected.has(path.resolve(file))) continue;
    try { if (readOurs(fs.readFileSync(file, 'utf8'))) result.obsolete++; } catch { /* ilegível: não é contada */ }
  }
  return result;
}

/** Quantas notas .md já existem no vault FORA da pasta MindCraft (suas). Usado para avisar sobre nomes iguais. */
function countForeignNotes(vaultDir, folder = FOLDER, limit = 5000) {
  const skip = path.resolve(vaultDir, folder);
  let n = 0, seen = 0;
  const walk = (d) => {
    let items;
    try { items = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const it of items) {
      if (++seen > limit) return;
      if (it.name.startsWith('.')) continue;
      const full = path.join(d, it.name);
      if (it.isDirectory()) { if (path.resolve(full) !== skip) walk(full); }
      else if (/\.md$/i.test(it.name)) n++;
    }
  };
  walk(path.resolve(vaultDir));
  return n;
}

module.exports = { writeObsidianVault, readOurs, countForeignNotes };
