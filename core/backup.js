'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Backup automático dos mapas: antes de sobrescrever um arquivo ao salvar, guarda a versão anterior.
 * Fica em <userData>/backups/<hash do caminho>/ — no máximo `keep` versões, com intervalo mínimo entre elas
 * (assim uma sessão longa de edição guarda "fotos" a cada ~10 min, não uma por clique em Salvar).
 */
const keyOf = (target) => crypto.createHash('sha1').update(path.resolve(target).toLowerCase()).digest('hex').slice(0, 12);
const backupDirFor = (root, target) => path.join(root, keyOf(target));

function listBackups(dir) {
  let names;
  try { names = fs.readdirSync(dir); } catch { return []; }
  return names.filter((n) => /\.mom$/i.test(n)).map((n) => {
    const file = path.join(dir, n), st = fs.statSync(file);
    return { file, name: n, mtimeMs: st.mtimeMs, size: st.size };
  }).sort((a, b) => b.mtimeMs - a.mtimeMs || b.name.localeCompare(a.name));
}

/** @returns {string|null} caminho do backup criado, ou null se não era necessário (arquivo novo, vazio ou backup recente). */
function backupBefore(target, root, { keep = 30, minIntervalMs = 10 * 60 * 1000, now = Date.now() } = {}) {
  if (!target || !fs.existsSync(target)) return null;
  const st = fs.statSync(target);
  if (!st.isFile() || st.size === 0) return null;
  const dir = backupDirFor(root, target);
  fs.mkdirSync(dir, { recursive: true });
  const list = listBackups(dir);
  if (list[0] && now - list[0].mtimeMs < minIntervalMs) return null;
  const stamp = new Date(now).toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const base = path.basename(target, path.extname(target)).replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').slice(0, 60) || 'mapa';
  const dest = path.join(dir, `${base} — ${stamp}.mom`);
  fs.copyFileSync(target, dest);
  fs.utimesSync(dest, new Date(now), new Date(now));            // a data do arquivo = quando o backup foi feito
  fs.writeFileSync(path.join(dir, 'origem.txt'), path.resolve(target));
  for (const old of listBackups(dir).slice(keep)) fs.rmSync(old.file, { force: true });
  return dest;
}

module.exports = { backupBefore, backupDirFor, listBackups };
