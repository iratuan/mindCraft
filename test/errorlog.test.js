'use strict';
// Registro local de erros: nunca lança, grava uma linha por erro e limita o tamanho do arquivo.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { logError } = require('../core/errorlog');

test('grava uma linha por erro, com data e mensagem em uma linha só', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-log-'));
  assert.strictEqual(logError(path.join(dir, 'logs'), 'falha\nem duas linhas'), true);
  const lines = fs.readFileSync(path.join(dir, 'logs', 'erros.log'), 'utf8').trim().split('\n');
  assert.strictEqual(lines.length, 1);
  assert.match(lines[0], /^\d{4}-\d{2}-\d{2}T[\d:.]+Z\tfalha em duas linhas$/);
});

test('o arquivo é mantido abaixo do limite, descartando a metade mais antiga', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-log-'));
  for (let i = 0; i < 400; i++) logError(dir, 'erro ' + i + ' ' + 'x'.repeat(200), { max: 20000 });
  const size = fs.statSync(path.join(dir, 'erros.log')).size;
  assert.ok(size <= 20000 + 300, 'arquivo grande demais: ' + size);
  assert.match(fs.readFileSync(path.join(dir, 'erros.log'), 'utf8'), /erro 399 /, 'o erro mais recente deve ficar');
});

test('nunca lança: um caminho impossível devolve false', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-log-'));
  const blocker = path.join(dir, 'arquivo');
  fs.writeFileSync(blocker, 'x');
  assert.strictEqual(logError(path.join(blocker, 'sub')), false);
});
