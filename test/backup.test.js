'use strict';
// Cópia de segurança antes de sobrescrever: a versão anterior do .mom nunca se perde ao salvar por cima.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { backupBefore, backupDirFor, listBackups } = require('../core/backup');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'mc-backup-'));

test('arquivo novo (inexistente) não gera cópia: nada a guardar', () => {
  const root = tmp();
  assert.strictEqual(backupBefore(path.join(root, 'novo.mom'), path.join(root, 'backups')), null);
  assert.deepStrictEqual(listBackups(path.join(root, 'backups')), []);
});

test('arquivo existente é copiado antes de ser sobrescrito, com o conteúdo original', () => {
  const root = tmp(), target = path.join(root, 'mapa.mom'), backups = path.join(root, 'backups');
  fs.writeFileSync(target, 'versao-1');
  const made = backupBefore(target, backups);
  assert.ok(made, 'deveria criar a cópia');
  assert.strictEqual(fs.readFileSync(made, 'utf8'), 'versao-1');
  assert.strictEqual(path.dirname(made), backupDirFor(backups, target));
});

test('duas cópias seguidas dentro do intervalo mínimo viram uma só (sem uma foto por clique em Salvar)', () => {
  const root = tmp(), target = path.join(root, 'mapa.mom'), backups = path.join(root, 'backups');
  fs.writeFileSync(target, 'v1');
  const t0 = Date.now();
  assert.ok(backupBefore(target, backups, { now: t0 }));
  fs.writeFileSync(target, 'v2');
  assert.strictEqual(backupBefore(target, backups, { now: t0 + 1000 }), null);
  assert.strictEqual(listBackups(backupDirFor(backups, target)).length, 1);
});

test('o número de cópias é limitado (as mais antigas saem)', () => {
  const root = tmp(), target = path.join(root, 'mapa.mom'), backups = path.join(root, 'backups');
  fs.writeFileSync(target, 'x');
  let t = Date.now();
  for (let i = 0; i < 5; i++) { t += 60 * 60 * 1000; backupBefore(target, backups, { keep: 3, now: t }); }
  assert.strictEqual(listBackups(backupDirFor(backups, target)).length, 3);
});
