'use strict';
// Fidelidade ao formato do Mindomo: tema original, estilo de cada tópico, notas (description em HTML) e round-trip sem perder o tema.
const test = require('node:test');
const assert = require('node:assert');
const AdmZip = require('adm-zip');
const { readMom, writeMom } = require('../core/formats/mom');
const { convertTheme, convertNodeStyle, htmlToMarkdown, markdownToHtml, parseFont } = require('../core/formats/mindomo');
const { sanitizeTheme, sanitizeStyle, getTheme, resolveStyle } = require('../core/components/themes');
const { layoutMap } = require('../core/components/layout');
const { toSVG } = require('../core/components/svg');
const { canonical } = require('./canonical');

const { TID, themes, node, mindomo } = require('./mindomo-fixture');
const find = (m, id) => m.find(id).node;

test('o tema original do Mindomo vira o tema do mapa (níveis, cores, fonte, fundo, linhas) e é escolhido por padrão', () => {
  const m = readMom(mindomo()); assert.strictEqual(m.meta.theme, 'custom'); const t = m.meta.customTheme;
  assert.match(t.name, /Original do Mindomo — Mapa do Mindomo/); assert.strictEqual(t.background, '#f8f8f8'); assert.strictEqual(t.levels.length, 3);
  assert.deepStrictEqual([t.levels[0].shape, t.levels[0].fill, t.levels[0].color, t.levels[0].size, t.levels[0].bold], ['round', '#0a2a6c', '#ffffff', 24, true]);
  assert.deepStrictEqual([t.levels[1].shape, t.levels[1].stroke, t.levels[1].strokeWidth, t.levels[1].edge], ['pill', '#238acc', 2, '#0047ff']);
  assert.strictEqual(t.levels[1].fill, '#e6e9e9', 'degradê vira a cor do meio');
  assert.deepStrictEqual([t.levels[2].shape, t.levels[2].fill], ['none', 'none'], '"sem forma" e "sem preenchimento"');
  assert.strictEqual(t.levels[1].font, 'Noto Sans');
});

test('estilo de cada tópico: preenchimento, forma, borda, linha, fonte (cor/tamanho/nome/negrito); só o que o tópico declara', () => {
  const m = readMom(mindomo());
  assert.deepStrictEqual(find(m, 'a').style, { fill: '#ff6961', shape: 'rect', stroke: '#3c3c3c', strokeWidth: 1, edge: '#ea5545', edgeWidth: 4, color: '#ffffff', size: 16, font: 'Kalam', bold: true });
  assert.deepStrictEqual(find(m, 'r').style, { fill: '#000000', color: '#f0f0f0', size: 26 });
  assert.deepStrictEqual(find(m, 'b').style, { bold: true }, 'negrito no título inteiro (FontRange)');
  const L = layoutMap(m); const b = L.boxes.get('a'); assert.deepStrictEqual([b.style.fill, b.style.shape, b.style.stroke, b.style.color, b.style.size], ['#ff6961', 'rect', '#3c3c3c', '#ffffff', 16]);
  assert.strictEqual(L.boxes.get('b').style.size, 12, 'o que o tópico não declara vem do tema do nível'); assert.strictEqual(L.theme.background, '#f8f8f8');
});

test('notas do Mindomo (description em HTML) aparecem como Markdown; notas já existentes têm prioridade', () => {
  const m = readMom(mindomo()); assert.strictEqual(find(m, 'a').notes, 'Texto **importante** e *itálico* & mais\n\nSegundo parágrafo');
  const z = readMom(mindomo({ nodes: [node('r', null, 0, 'R', { description: '<p>x</p>', notes: { text: 'nota própria' } })] })); assert.strictEqual(find(z, 'r').notes, 'nota própria');
});

test('round-trip: salvar no MindCraft mantém o themes.json original, o HTML das notas e o estilo; reabrir dá o mesmo mapa (estável)', () => {
  const m1 = readMom(mindomo()); const buf = writeMom(m1); const z = new AdmZip(buf);
  assert.deepStrictEqual(Object.keys(JSON.parse(z.getEntry('themes.json').getData().toString())), [TID], 'themes.json não é mais apagado');
  const nodes = JSON.parse(z.getEntry('nodes.json').getData().toString()); assert.match(nodes.find((n) => n.id === 'a').description, /<strong>importante<\/strong>/, 'HTML original intacto');
  const m2 = readMom(buf); assert.strictEqual(canonical(m2), canonical(readMom(writeMom(m2))), 'estável a partir da 2ª leitura');
  assert.deepStrictEqual(find(m2, 'a').style, find(m1, 'a').style); assert.strictEqual(m2.meta.theme, 'custom'); assert.deepStrictEqual(m2.meta.customTheme, m1.meta.customTheme);
  assert.strictEqual(find(m2, 'a').notes, find(m1, 'a').notes);
});

test('flashcards do MindCraft são preservados ao salvar e reabrir o .mom', () => {
  const m = readMom(mindomo());
  m.meta.flashcards = [
    { id: 123.5, front: 'Qual é a regra?', back: 'A resposta [[Atos]]', mapKey: 'C:\\estudos\\Direito.mom' },
    { id: 456, front: 'Conceito', back: '', mapKey: null },
  ];
  const reopened = readMom(writeMom(m));
  assert.deepStrictEqual(reopened.meta.flashcards, m.meta.flashcards);
});

test('editar a nota no MindCraft atualiza o description (HTML escapado); apagar limpa; trocar de tema e voltar ao original funciona', () => {
  const m = readMom(mindomo()); find(m, 'a').notes = 'Novo <script>alert(1)</script> **forte**\n\nOutro';
  const out = JSON.parse(new AdmZip(writeMom(m)).getEntry('nodes.json').getData().toString()).find((n) => n.id === 'a');
  assert.strictEqual(out.description, '<p>Novo &lt;script&gt;alert(1)&lt;/script&gt; <strong>forte</strong></p><p>Outro</p>'); assert.ok(!/<script/.test(out.description));
  find(m, 'a').notes = ''; assert.strictEqual(JSON.parse(new AdmZip(writeMom(m)).getEntry('nodes.json').getData().toString()).find((n) => n.id === 'a').description, '');
  m.meta.theme = 'dark'; const back = readMom(writeMom(m)); assert.strictEqual(back.meta.theme, 'dark'); assert.ok(back.meta.customTheme, 'o original continua disponível'); back.meta.theme = 'custom';
  assert.strictEqual(layoutMap(back).theme.background, '#f8f8f8');
});

test('desenho: cores, borda, elipse, sem forma, fonte e linha própria saem no SVG; nada injeta atributos', () => {
  const svg = toSVG(readMom(mindomo())); assert.match(svg, /fill="#ff6961"/); assert.match(svg, /stroke="#ea5545" stroke-width="4"/); assert.match(svg, /font-family="&#39;|font-family="'?Kalam/);
  const hostile = readMom(mindomo({ nodes: [node('r', null, 0, 'R', { style: { orientation: 101, fill_type: 0, fill_value: 'ff0000" onload="x', shape_type: 4 }, titleStyle: '<Font Color="00ff00" onload="x" Name="Evil&quot; onload=&quot;x" Size="99999" />' })] }));
  assert.deepStrictEqual(find(hostile, 'r').style, { shape: 'round', color: '#00ff00' }, JSON.stringify(find(hostile, 'r').style)); assert.ok(!/onload/.test(toSVG(hostile)));
});

test('tema/estilo hostis são recusados ou limpos (cores, fontes, números, formas)', () => {
  assert.strictEqual(sanitizeTheme(null), null); assert.strictEqual(sanitizeTheme({ levels: [] }), null);
  const t = sanitizeTheme({ name: '<b>x</b>"', background: 'red', font: 'a"><script>', branches: ['#zzz', '#112233'], levels: [{ shape: 'nuke', fill: 'url(#x)', color: 'javascript:1', size: 9999, padX: -5, stroke: '#12', font: 'a"b', edge: 'x', edgeWidth: 999 }], line: { width: [999, 'x'], curve: 'zig' } });
  assert.strictEqual(t.background, '#ffffff'); assert.deepStrictEqual(t.branches, ['#112233']); assert.ok(!/[<>"]/.test(t.name)); assert.ok(!/[<>]/.test(t.font) || t.font.startsWith('Segoe'));
  assert.deepStrictEqual(t.levels[0], { shape: 'round', fill: 'none', color: '#000000', size: 14, bold: false, padX: 8, padY: 5 }); assert.deepStrictEqual(t.line, { width: [2], curve: 'bezier' });
  assert.deepStrictEqual(sanitizeStyle({ stroke: 'x', strokeWidth: 99, edge: 1, edgeWidth: 0, font: 'ok name', shape: 'ellipse', fill: 'none' }), { font: 'ok name', shape: 'ellipse', fill: 'none' });
  assert.strictEqual(getTheme('custom', { levels: [{}] }).levels.length, 1); assert.strictEqual(getTheme('custom', null).name, getTheme('ocean').name); assert.strictEqual(getTheme('custom', { levels: 'x' }).name, getTheme('ocean').name);
});

test('conversões auxiliares: fonte, formas do Mindomo, HTML → Markdown seguro e Markdown → HTML escapado', () => {
  assert.deepStrictEqual(parseFont('<Font Color="AABBCC" Size="14.4" Name="Roboto Condensed" Bold="true" Italic="false" />'), { color: '#aabbcc', size: 14, font: 'Roboto Condensed', bold: true, italic: false });
  assert.deepStrictEqual(convertNodeStyle({ shape_type: 14 }, '', ''), { shape: 'none' }); assert.strictEqual(convertNodeStyle({ shape_type: 9 }).shape, 'pill'); assert.strictEqual(convertNodeStyle({ shape_type: 7 }).shape, 'ellipse'); assert.strictEqual(convertNodeStyle({ shape_type: 99 }).shape, 'round');
  assert.strictEqual(htmlToMarkdown('<p>a <b> b </b>c</p><ul><li>um</li><li>dois &lt;3 &#233;</li></ul><script>alert(1)</script><br>fim'), 'a **b** c\n\n- um\n- dois <3 é\n\nfim');
  assert.strictEqual(htmlToMarkdown('<img src=x onerror=alert(1)>texto'), 'texto'); assert.strictEqual(htmlToMarkdown(null), '');
  assert.strictEqual(markdownToHtml('linha1\nlinha2\n\n**n** *i* <x>'), '<p>linha1<br>linha2</p><p><strong>n</strong> <em>i</em> &lt;x&gt;</p>');
  assert.strictEqual(convertTheme({}, 'x'), null); assert.strictEqual(convertTheme({ x: { nodeStyles: [] } }, 'x'), null); assert.strictEqual(convertTheme(null, null), null);
});

test('arquivos antigos e do MindCraft não mudam: sem themes.json, tema escolhido e estilos próprios continuam como estavam', () => {
  const z = new AdmZip(); z.addFile('document.json', Buffer.from(JSON.stringify({ mapInfo: { name: 'x', rootId: 'r' }, mcWriter: 'mindcraft', mcTheme: 'neon' }))); z.addFile('nodes.json', Buffer.from(JSON.stringify([node('r', null, 0, 'R <b>', { mc: { style: { fill: '#112233', shape: 'pill' } } })])));
  const m = readMom(z.toBuffer()); assert.strictEqual(m.meta.theme, 'neon'); assert.strictEqual(m.meta.customTheme, undefined); assert.deepStrictEqual(m.root.style, { fill: '#112233', shape: 'pill' }); assert.strictEqual(m.root.title, 'R <b>');
  const out = new AdmZip(writeMom(m)); assert.strictEqual(out.getEntry('themes.json').getData().toString(), '{}');
  const plain = readMom(mindomo({ themes: {} })); assert.strictEqual(plain.meta.theme, 'ocean'); assert.strictEqual(plain.meta.customTheme, undefined);
});
