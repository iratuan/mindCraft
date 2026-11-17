'use strict';
// Caça a bugs: sequências ALEATÓRIAS (com semente fixa, reproduzíveis) de operações sobre o modelo, com invariantes conferidas a cada passo,
// mais entradas hostis para Markdown, CSV, planilha, referências de PDF, .ics, .mom e biblioteca SQLite.
const test = require('node:test');
const assert = require('node:assert');
const AdmZip = require('adm-zip');
const { MindMap, createNode } = require('../core/components/model');
const { readMom, writeMom } = require('../core/formats/mom');
const { MARKERS } = require('../core/components/markers');
const { mdToHtml, mdToPlain, toggleTask } = require('../core/formats/markdown');
const { sanitizeRefs, sanitizePdfs } = require('../core/components/pdfrefs');
const { buildGraph } = require('../core/components/graph');
const { toSVG } = require('../core/components/svg');
const { canonical } = require('./canonical');

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const ALPHA = ['a', 'B', 'ç', 'ã', ' ', ' ', '1', '-', '_', '*', '[', ']', '(', ')', '`', '#', '>', '|', ';', ',', '"', "'", '\\', '/', '.', '!', '=', '+', '@', '<', '&', '😀', '\n', '\t', '[[', ']]', '**', '~~'];
const HOSTILE = ['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '"><svg onload=1>', '[[<b>]]', '=1+1', '@SUM(A1)', '\u0000', '\u202e', '</text><script>', '&lt;&amp;', 'javascript:alert(1)', '[x](javascript:alert(1))', '`', '```', '| a |\n|---|', '\r\n', '%s%d', '${x}', '{{x}}', '-->', '<!--'];
const word = (r, n = 8) => { let s = ''; const len = 1 + Math.floor(r() * n); for (let i = 0; i < len; i++) s += ALPHA[Math.floor(r() * ALPHA.length)]; return r() < 0.1 ? HOSTILE[Math.floor(r() * HOSTILE.length)] : s; };
const pick = (r, a) => a[Math.floor(r() * a.length)];

function ids(m) { const a = []; m.walk((n) => a.push(n.id)); return a; }

/** Invariantes que NUNCA podem quebrar, em qualquer sequência de operações. */
function check(m, ctx) {
  const fail = (msg) => { throw new Error(`${msg}  [${ctx}]`); };
  const seen = new Set();
  const visit = (n, depth) => {
    if (depth > 500) fail('profundidade absurda');
    if (typeof n.id !== 'string' || !n.id) fail('id inválido');
    if (seen.has(n.id)) fail('id repetido ' + n.id); seen.add(n.id);
    if (typeof n.title !== 'string' || typeof n.notes !== 'string') fail('título/notas não são texto');
    if (!Array.isArray(n.children) || !Array.isArray(n.markers)) fail('children/markers não são listas');
    if (n.progress != null && !(Number.isFinite(n.progress) && n.progress >= 0 && n.progress <= 100)) fail('progresso fora de 0–100: ' + n.progress);
    for (const k of n.markers) if (!MARKERS[k]) fail('marcador inválido ' + k);
    for (const r of n.refs || []) { if (!(m.meta.pdfs || []).some((p) => p.id === r.pdf)) fail('referência para PDF não registrado'); if (!Number.isInteger(r.page) || r.page < 1) fail('página'); for (const q of r.rects) if (q.some((v) => v < 0 || v > 1)) fail('retângulo fora de 0–1'); }
    n.children.forEach((c) => visit(c, depth + 1));
  };
  visit(m.root, 0);
  const rs = new Set();
  for (const r of m.meta.relations) {
    if (!seen.has(r.from) || !seen.has(r.to)) fail('relação órfã ' + r.id);
    if (r.from === r.to) fail('relação para si mesmo');
    const k = r.from + '>' + r.to; if (rs.has(k)) fail('relação duplicada'); rs.add(k);
  }
  if (new Set((m.meta.pdfs || []).map((p) => p.id)).size !== (m.meta.pdfs || []).length) fail('PDFs duplicados');
}



test('FUZZ de texto hostil: Markdown (HTML sempre seguro), tarefas, texto simples — 3 000 entradas', () => {
  const r = rng(77);
  for (let i = 0; i < 3000; i++) {
    let s = ''; const n = Math.floor(r() * 12); for (let k = 0; k < n; k++) s += word(r, 10) + (r() < 0.3 ? '\n' : r() < 0.3 ? ' ' : '');
    const h = mdToHtml(s);
    assert.ok(!/<\s*(script|img|iframe|object|embed|svg|style|link|meta)\b/i.test(h.replace(/<(\/?)(p|h[1-4]|ul|ol|li|strong|em|del|code|pre|a|blockquote|table|thead|tbody|tr|th|td|br|hr|input)\b/g, '')), 'tag perigosa: ' + JSON.stringify(s) + ' → ' + h);
    for (const tag of h.match(/<[^>]+>/g) || []) {                                // só o que o navegador interpreta como atributo: valores entre aspas são texto escapado
      const bare = tag.replace(/"[^"]*"/g, '""');
      assert.ok(!/\son\w+\s*=/i.test(bare) && !/\s(src|srcdoc|style|formaction)\s*=/i.test(bare), 'atributo perigoso: ' + tag + ' de ' + JSON.stringify(s));
      for (const m of tag.matchAll(/\shref="([^"]*)"/g)) assert.equal(m[1], '#', 'href deve ser sempre "#": ' + tag);
    }
    assert.equal(typeof mdToPlain(s), 'string'); assert.equal(typeof toggleTask(s, Math.floor(r() * 3)), 'string');
    const opens = (h.match(/<(ul|ol|li|table|tbody|thead|tr|blockquote|pre|code|strong|em|del)\b/g) || []).length, closes = (h.match(/<\/(ul|ol|li|table|tbody|thead|tr|blockquote|pre|code|strong|em|del)>/g) || []).length;
    assert.equal(opens, closes, 'tags desbalanceadas: ' + JSON.stringify(s) + ' → ' + h);
  }
});

test('mapa com 3 000 tópicos e operações em massa: tempo razoável e invariantes preservadas', () => {
  const m = new MindMap(createNode('Grande')); const t0 = Date.now();
  for (let i = 0; i < 30; i++) { const d = m.addChild(m.root.id, 'D' + i); for (let j = 0; j < 99; j++) m.addChild(d.id, `T${i}.${j}`); }
  const all = ids(m).slice(1); m.removeMany(all.filter((_, i) => i % 7 === 0)); m.showLevels(1); m.showLevels(Infinity); m.autoLevels(100);
  check(m, 'grande'); assert.equal(canonical(readMom(writeMom(m))), canonical(readMom(writeMom(m))));
  assert.ok(Date.now() - t0 < 8000, 'demorou ' + (Date.now() - t0) + ' ms');
});

test('.mom adulterado: IDs perigosos, ciclos, pais inexistentes, números/strings fora de tipo — a leitura sempre produz um mapa válido ou erro claro', () => {
  const m = new MindMap(createNode('R')); const a = m.addChild(m.root.id, 'A'); m.addChild(a.id, 'B');
  const zip = new AdmZip(writeMom(m)); const nodes = JSON.parse(zip.readAsText('nodes.json'));
  const r = rng(11);
  for (let i = 0; i < 200; i++) {
    const bad = JSON.parse(JSON.stringify(nodes));
    for (const n of bad) { if (r() < 0.3) n.parentId = pick(r, ['ciclo', n.id, 'inexistente', 5, null, bad[0].id]); if (r() < 0.2) n.id = pick(r, ['<img onerror=x>', '', 7, 'a b', 'ok-id', bad[0].id]); if (r() < 0.2) n.title = pick(r, [5, null, '<b>x</b>', word(r)]); if (r() < 0.2) n.index = pick(r, ['x', -5, 1e9, NaN]); if (r() < 0.2) n.mc = pick(r, [5, 'x', { progress: 1e9, markers: 'x', style: 7, study: { weight: 99, q: 'x' }, refs: 'x' }, { markers: ['hacker'], progress: -4 }]); }
    const z = new AdmZip(writeMom(m)); z.updateFile('nodes.json', Buffer.from(JSON.stringify(bad)));
    let map = null; try { map = readMom(z.toBuffer()); } catch (e) { assert.ok(e instanceof Error && e.message.length > 3, 'erro sem mensagem'); }
    if (map) { check(map, '.mom adulterado ' + i); writeMom(map); toSVG(map); }
  }
});
