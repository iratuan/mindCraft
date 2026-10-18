'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { escapeHtml } = require('../core/text');
const { BANCAS, OUTRA } = require('../core/bancas');
const { bancaKey } = require('../core/study');

test('escapeHtml: escapa os cinco caracteres perigosos, aceita null/número e não escapa duas vezes sem querer', () => {
  assert.strictEqual(escapeHtml(`<img src=x onerror="alert('x')">&`), '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;');
  assert.strictEqual(escapeHtml(null), ''); assert.strictEqual(escapeHtml(undefined), ''); assert.strictEqual(escapeHtml(42), '42');
  assert.strictEqual(escapeHtml('Direito d’água & “aspas”'), 'Direito d’água &amp; “aspas”', 'acentos e aspas tipográficas passam');
  assert.strictEqual(escapeHtml('&amp;'), '&amp;amp;', 'escapar é sempre uma operação só: quem chama escapa uma vez, na saída');
  const out = escapeHtml('"><script>'); assert.ok(!/[<>"]/.test(out));
});

test('bancas: lista sem repetição (ignorando caixa/acento), com as principais, e "Outra…" não colide com nome de banca', () => {
  const keys = BANCAS.map((b) => bancaKey(b)); assert.strictEqual(new Set(keys).size, BANCAS.length, 'bancas repetidas');
  for (const b of ['FGV', 'FCC', 'VUNESP', 'CESGRANRIO', 'IBFC', 'QUADRIX', 'AOCP', 'IDECAN', 'CONSULPLAN']) assert.ok(BANCAS.includes(b), 'falta ' + b);
  assert.ok(BANCAS.some((b) => /CEBRASPE/.test(b)));
  assert.ok(!BANCAS.includes(OUTRA) && /^__/.test(OUTRA), 'o marcador de "Outra…" é reservado');
  for (const b of BANCAS) assert.ok(b.length <= 60 && b === b.trim(), 'nome inválido: ' + b);
});
