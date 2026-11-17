'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { mdToHtml, mdToPlain, toggleTask } = require('../core/formats/markdown');

test('formatação básica: títulos, negrito, itálico, riscado, código, parágrafos e quebras de linha', () => {
  const h = mdToHtml('# Título\n\nTexto **forte** e *itálico* e _outro_ e ~~riscado~~ e `x < y`.\nsegunda linha');
  assert.match(h, /<h1>Título<\/h1>/); assert.match(h, /<strong>forte<\/strong>/); assert.match(h, /<em>itálico<\/em>/); assert.match(h, /<em>outro<\/em>/); assert.match(h, /<del>riscado<\/del>/);
  assert.match(h, /<code>x &lt; y<\/code>/); assert.match(h, /<p>Texto[\s\S]*<br>segunda linha<\/p>/);
  assert.equal(mdToHtml('###### seis'), '<h4>seis</h4>', 'níveis acima de 4 viram 4');
  assert.equal(mdToHtml('snake_case_nome e 2*3*4'), '<p>snake_case_nome e 2*3*4</p>', 'não confunde underscores/asteriscos no meio de palavras');
});

test('listas: marcadores, numeradas, aninhadas e tarefas (com índice estável)', () => {
  const h = mdToHtml('- a\n- b\n  - b1\n  - b2\n- c\n\n1. um\n2. dois\n\n- [ ] fazer\n- [x] feito');
  assert.match(h, /<ul><li>a<\/li><li>b<ul><li>b1<\/li><li>b2<\/li><\/ul><\/li><li>c<\/li><\/ul>/);
  assert.match(h, /<ol><li>um<\/li><li>dois<\/li><\/ol>/);
  assert.match(h, /<input type="checkbox" data-task="0"> fazer/); assert.match(h, /<input type="checkbox" data-task="1" checked> feito/);
  assert.equal((h.match(/<ul>/g) || []).length, (h.match(/<\/ul>/g) || []).length, 'tags balanceadas');
});

test('toggleTask: alterna a tarefa certa, ignora código, e é consistente com o renderizador', () => {
  const t = '- [ ] a\n```\n- [ ] no código\n```\n- [x] b\n  - [ ] c';
  assert.equal(toggleTask(t, 0), '- [x] a\n```\n- [ ] no código\n```\n- [x] b\n  - [ ] c');
  assert.equal(toggleTask(t, 1), '- [ ] a\n```\n- [ ] no código\n```\n- [ ] b\n  - [ ] c');
  assert.equal(toggleTask(t, 2), '- [ ] a\n```\n- [ ] no código\n```\n- [x] b\n  - [x] c');
  assert.equal(toggleTask(t, 9), t, 'índice inexistente: nada muda');
  const idx = [...mdToHtml(t).matchAll(/data-task="(\d+)"/g)].map((m) => Number(m[1])); assert.deepEqual(idx, [0, 1, 2], 'a ordem do HTML bate com toggleTask');
  let x = t; for (const k of [0, 1, 2]) x = toggleTask(x, k); assert.equal(x, '- [x] a\n```\n- [ ] no código\n```\n- [ ] b\n  - [x] c');
});

test('citação, régua, bloco de código e tabela', () => {
  assert.match(mdToHtml('> citado\n> duas'), /<blockquote>citado<br>duas<\/blockquote>/);
  assert.match(mdToHtml('a\n\n---\n\nb'), /<hr>/);
  assert.match(mdToHtml('```js\nconst a = "<b>";\n```'), /<pre><code>const a = &quot;&lt;b&gt;&quot;;<\/code><\/pre>/);
  const t = mdToHtml('| Lei | Ano |\n|---|---|\n| 8.112 | 1990 |\n| 9.784 | 1999 |');
  assert.match(t, /<th>Lei<\/th><th>Ano<\/th>/); assert.match(t, /<td>9\.784<\/td><td>1999<\/td>/);
  assert.match(mdToHtml('Lei | Ano\nsem separador'), /<p>Lei \| Ano<br>sem separador<\/p>/, 'sem linha separadora não é tabela');
});

test('links: [[wiki]] com mapa/alias, [texto](url) só http/https/mailto; imagens e javascript: não viram nada perigoso', () => {
  const h = mdToHtml('Veja [[Regência verbal]] e [[Direito#Crase|a crase]] e [site](https://exemplo.com/a?b=1) e [mau](javascript:alert(1)) e ![img](http://x/y.png)');
  assert.match(h, /<a href="#" class="wl" data-map="" data-topic="Regência verbal">Regência verbal<\/a>/);
  assert.match(h, /class="wl" data-map="Direito" data-topic="Crase">a crase<\/a>/);
  assert.match(h, /<a href="#" class="ext" data-url="https:\/\/exemplo\.com\/a\?b=1"/);
  assert.doesNotMatch(h, /href="javascript|<img|data-url="javascript/i); assert.match(h, /mau \(javascript:alert\(1\)\)/);
});

test('SEGURANÇA: HTML, scripts, atributos e entidades são sempre escapados', () => {
  const evil = ['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '**<b onclick="x()">**', '[[<script>]]', '[x](https://a.com" onmouseover="x)', '`</code><script>`', '| a |\n|---|\n| <iframe> |', '- <svg onload=1>', '# <h1>', '> <a href=x>', '\u0000 0 \u0000', '"\'><'];
  for (const e of evil) {
    const h = mdToHtml(e);
    assert.doesNotMatch(h, /<(script|img|iframe|svg|b |a href=x)/i, e);
    assert.ok(!/<[^>]+\son(click|error|load|mouseover)=/i.test(h), 'atributo de evento: ' + e);
  }
  const dom = mdToHtml('[x](https://a.com" onmouseover="x)'); assert.ok(!/ onmouseover="/.test(dom));
});

test('robustez: vazio, null, texto enorme, markdown quebrado e muitos níveis não lançam nem travam', () => {
  for (const v of ['', null, undefined, '**', '`', '```', '[', '[[', '[[]]', '|', '|--|', '- ', '1.', '>', '#', '~~', '_', '*']) { assert.equal(typeof mdToHtml(v), 'string', String(v)); assert.equal(typeof mdToPlain(v), 'string'); }
  const t0 = Date.now(); const big = ('# t\n- **a** *b* `c` [[d]] [e](https://f.g)\n\n').repeat(4000); const h = mdToHtml(big); assert.ok(Date.now() - t0 < 3000, 'tempo ' + (Date.now() - t0)); assert.ok(h.length > 1000);
  mdToHtml('- a\n' + '  '.repeat(60) + '- fundo\n- b');
  mdToHtml('*'.repeat(5000)); mdToHtml('_a'.repeat(5000)); mdToHtml('['.repeat(3000));
});

test('mdToPlain: remove símbolos para Word/PDF, mantém o conteúdo e transforma [[links]] em texto', () => {
  const p = mdToPlain('# Título\n**forte** e *it* e `cod` e ~~r~~\n- item\n  - sub\n- [ ] a fazer\n- [x] feito\n> citação\n[site](https://a.com) e [[Regência|reg.]]\n| A | B |\n|---|---|\n| 1 | 2 |\n---\n```\ncódigo\n```');
  assert.equal(p, 'Título\nforte e it e cod e r\n• item\n  • sub\n☐ a fazer\n☑ feito\n│ citação\nsite (https://a.com) e reg.\nA  |  B\n1  |  2\n────────\n    código');
  assert.equal(mdToPlain('texto simples sem nada'), 'texto simples sem nada'); assert.equal(mdToPlain('snake_case e 2*3*4'), 'snake_case e 2*3*4');
});
