'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { escapeHtml } = require('../core/utils/text');

test('escapeHtml: escapa os cinco caracteres perigosos, aceita null/número e não escapa duas vezes sem querer', () => {
  assert.strictEqual(escapeHtml(`<img src=x onerror="alert('x')">&`), '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;');
  assert.strictEqual(escapeHtml(null), ''); assert.strictEqual(escapeHtml(undefined), ''); assert.strictEqual(escapeHtml(42), '42');
  assert.strictEqual(escapeHtml('Direito d’água & “aspas”'), 'Direito d’água &amp; “aspas”', 'acentos e aspas tipográficas passam');
  assert.strictEqual(escapeHtml('&amp;'), '&amp;amp;', 'escapar é sempre uma operação só: quem chama escapa uma vez, na saída');
  const out = escapeHtml('"><script>'); assert.ok(!/[<>"]/.test(out));
});
