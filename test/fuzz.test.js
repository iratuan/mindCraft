'use strict';
// Caça a bugs: sequências ALEATÓRIAS (com semente fixa, reproduzíveis) de operações sobre o modelo, com invariantes conferidas a cada passo,
// mais entradas hostis para Markdown, CSV, planilha, referências de PDF, .ics, .mom e biblioteca SQLite.
const test = require('node:test');
const assert = require('node:assert');
const AdmZip = require('adm-zip');
const { MindMap, createNode } = require('../core/model');
const { readMom, writeMom } = require('../core/mom');
const { openLibrary, canonical } = require('../core/library');
const { MARKERS } = require('../core/markers');
const S = require('../core/study');
const { mdToHtml, mdToPlain, toggleTask } = require('../core/markdown');
const { fromCsv, parseCsv, csvTemplate } = require('../core/csv');
const { exportPlan, diffPlan, applyPlan } = require('../core/planner');
const { sanitizeRefs, sanitizePdfs } = require('../core/pdfrefs');
const { toIcs } = require('../core/ics');
const { fromMarkdown, fromOPML } = require('../core/import');
const { toMarkdown, toOPML } = require('../core/export');
const { toSVG } = require('../core/svg');
const { buildGraph } = require('../core/graph');
const { fromEdital } = require('../core/edital');

const TODAY = '2026-10-20';
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
    if (n.study) { const s = S.normalizeStudy(n.study); if (s.weight < 1 || s.weight > 5) fail('peso'); if (s.q.correct > s.q.done) fail('acertos > feitas'); for (const e of s.errs || []) if (!S.ERR_REASONS[e.why] || e.note.length > 300) fail('erro inválido no caderno'); if (n.study.errs && !n.study.errs.length) fail('errs vazio deveria não existir'); }
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
  if (m.meta.goals && JSON.stringify(m.meta.goals) !== JSON.stringify(S.sanitizeGoals(m.meta.goals))) fail('metas inválidas');
}

function randomOp(m, r) {
  const all = ids(m), any = () => pick(r, all), non = () => pick(r, all.length > 1 ? all.slice(1) : all);
  const sub = () => all.filter(() => r() < 0.3);
  const ops = [
    ['addChild', () => m.addChild(any(), word(r))], ['addChild@0', () => m.addChild(any(), word(r), 0)], ['addSibling', () => m.addSibling(any(), word(r))],
    ['remove', () => m.remove(non())], ['removeMany', () => m.removeMany(sub())], ['move', () => m.move(non(), any(), r() < 0.5 ? 0 : undefined)], ['moveMany', () => m.moveMany(sub(), any())],
    ['moveSibling', () => m.moveSibling(non(), r() < 0.5 ? -1 : 1)], ['indent', () => m.indent(non())], ['outdent', () => m.outdent(non())],
    ['update', () => m.update(any(), { title: word(r, 30), notes: word(r, 60), progress: r() < 0.5 ? Math.floor(r() * 101) : null })],
    ['updateMany', () => m.updateMany(sub(), { collapsed: r() < 0.5 })], ['marker', () => m.toggleMarker(any(), pick(r, Object.keys(MARKERS)))], ['markerMany', () => m.toggleMarkerMany(sub(), pick(r, Object.keys(MARKERS)))],
    ['relate', () => m.addRelation(any(), any(), word(r))], ['unrelate', () => { const x = m.meta.relations[Math.floor(r() * m.meta.relations.length)]; return x ? m.removeRelation(x.id) : false; }],
    ['relabel', () => { const x = m.meta.relations[0]; return x ? m.updateRelation(x.id, { label: word(r) }) : false; }],
    ['study-ok', () => m.mutateStudy(any(), (s) => S.reviewed(s, { today: S.addDays(TODAY, Math.floor(r() * 30)), ok: r() < 0.7 }))],
    ['study-time', () => m.mutateStudy(any(), (s) => S.addTime(s, TODAY, 1 + Math.floor(r() * 90)))],
    ['study-q', () => m.mutateStudy(any(), (s) => S.addQuestions(s, 1 + Math.floor(r() * 30), Math.floor(r() * 31), TODAY))],   // pode lançar (acertos > feitas): o estado não pode mudar
    ['study-err', () => m.mutateStudy(any(), (s) => S.addError(s, { why: pick(r, ['atencao', 'tempo', 'chute', 'inventado']), note: word(r, 50), today: TODAY }))],
    ['study-unerr', () => m.mutateStudy(any(), (s) => S.removeError(s, Math.floor(r() * 3)))],
    ['goals', () => m.setGoals(r() < 0.2 ? null : { minutesWeek: pick(r, [0, 60, -1, 'x', 99999999]), questionsWeek: pick(r, [0, 10, 1.5, 200]) })],
    ['study-weight', () => m.mutateStudy(any(), (s) => S.setWeight(s, Math.floor(r() * 8) - 1))],
    ['exam', () => m.setExam(r() < 0.3 ? null : { name: word(r), date: r() < 0.8 ? S.addDays(TODAY, Math.floor(r() * 200)) : 'lixo' })],
    ['levels', () => m.showLevels(Math.floor(r() * 5))], ['autoLevels', () => m.autoLevels(1 + Math.floor(r() * 50))],
    ['pdf', () => m.addPdf({ path: pick(r, ['/a/b.pdf', '/A/B.PDF', 'C:\\x\\y.pdf', '/c/d.pdf']), name: word(r) })],
    ['ref', () => { const p = (m.meta.pdfs || [])[0]; return m.addRef(any(), { pdf: p ? p.id : 'nada', page: Math.floor(r() * 6) - 1, quote: word(r, 40), rects: [[r() * 2 - 0.5, r(), r(), r()]] }); }],
    ['unref', () => m.removeRef(any(), Math.floor(r() * 3))],
    ['paste', () => { const src = m.find(any()).node; const c = MindMap.cloneSubtree(src); return !!m.addSubtree(any(), c); }],
  ];
  return pick(r, ops);
}

test('FUZZ do modelo: 40 sementes × 120 operações aleatórias — invariantes, desfazer/refazer exatos, .mom e biblioteca sem perda', () => {
  const lib = openLibrary(':memory:'); let steps = 0, changed = 0, threw = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const r = rng(seed); const m = new MindMap(createNode(word(r)));
    for (let i = 0; i < 3 + Math.floor(r() * 3); i++) m.addChild(m.root.id, word(r));
    const log = [];
    for (let step = 0; step < 120; step++) {
      const [name, fn] = randomOp(m, r); const ctx = `seed ${seed} passo ${step} op ${name}`; log.push(name);
      const before = canonical(m), undoLen = m._undo.length;
      let res, err = null;
      try { res = fn(); } catch (e) { err = e; threw++; }
      check(m, ctx + (err ? ' (lançou: ' + err.message + ')' : ''));
      const after = canonical(m); steps++;
      if (err) assert.equal(after, before, `operação que lançou alterou o mapa — ${ctx}: ${err.message}`);
      else if (res === false || res === null || res === 0) assert.equal(after, before, `operação que "não fez nada" alterou o mapa — ${ctx}`);
      if (after !== before) {
        changed++;
        assert.ok(m._undo.length >= undoLen + 1 || m._undo.length === 200, `mudou sem entrada de desfazer — ${ctx}`);
        assert.ok(m.undo(), 'undo ' + ctx); assert.equal(canonical(m), before, `desfazer não restaurou o estado exato — ${ctx}`);
        assert.ok(m.redo(), 'redo ' + ctx); assert.equal(canonical(m), after, `refazer não reproduziu o estado — ${ctx}`);
      }
      if (step % 15 === 0) {                                                  // ida e volta pelos formatos de arquivo
        const id = lib.saveMap(m, { verify: true }); assert.equal(canonical(lib.loadMap(id)), canonical(m), `biblioteca perdeu dados — ${ctx}`);
        const back = readMom(writeMom(m)); check(back, 'releitura do .mom ' + ctx);
        const essence = (x) => JSON.stringify([x.title, x.notes, x.markers, x.progress, x.collapsed, x.study, x.refs, x.children.map(essence)]);
        assert.equal(essence(back.root), essence(m.root), `.mom NÃO preservou o texto/estado dos tópicos — ${ctx}`);
        let a = 0, b = 0; m.walk(() => a++); back.walk(() => b++); assert.equal(b, a, `.mom mudou a quantidade de tópicos — ${ctx}`);
        assert.equal(back.meta.relations.length, m.meta.relations.length, `.mom perdeu relações — ${ctx}`);
        toSVG(m); toMarkdown(m); toOPML(m); buildGraph([{ key: 'k', name: 'x', map: m }]);   // nenhum renderizador/exportador pode lançar
      }
    }
  }
  assert.ok(steps === 4800 && changed > 1500, `passos ${steps}, com mudança ${changed}`); assert.ok(threw > 0, 'a bateria exercitou operações que lançam');
});

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

test('FUZZ de importação: CSV, planilha, edital, Markdown, OPML, .mom e pacote com lixo — nunca lança e sempre devolve um resultado coerente', () => {
  const r = rng(99);
  const junk = () => { let s = ''; const n = Math.floor(r() * 30); for (let k = 0; k < n; k++) s += pick(r, [word(r, 6), ',', ';', '\t', '\n', '\r\n', '"', '""', 'disciplina', 'topico', 'item', '1.2.3', 'peso', '5', '2026-02-30', 'id', 't-0123456789']); return s; };
  const m0 = new MindMap(createNode('Base')); const d0 = m0.addChild(m0.root.id, 'Disciplina'); m0.addChild(d0.id, 'Tópico');
  for (let i = 0; i < 600; i++) {
    const s = junk(); const res = fromCsv(s); assert.ok(res.report && Array.isArray(res.report.errors) && Array.isArray(res.report.warnings), 'relatório CSV');
    if (res.map) { check(res.map, 'csv ' + JSON.stringify(s)); writeMom(res.map); }
    const d = diffPlan(m0, s, { today: TODAY }); assert.ok(Array.isArray(d.errors) && Array.isArray(d.changes) && Array.isArray(d.ops));
    const before = canonical(m0); const tmp = readMom(writeMom(m0)); if (d.ops.length) { applyPlan(tmp, d.ops.length ? diffPlan(tmp, s, { today: TODAY }) : d); check(tmp, 'planilha ' + JSON.stringify(s)); }
    assert.equal(canonical(m0), before, 'diffPlan alterou o mapa');
    parseCsv(s); fromMarkdown(s, 'x'); fromEdital(s, 'x');
    try { fromOPML(s, 'x'); } catch (e) { assert.ok(e instanceof Error); }
  }
  for (let i = 0; i < 80; i++) { try { readMom(Buffer.from(junk())); } catch (e) { assert.ok(e instanceof Error); } }
  // planilha exportada com células aleatoriamente adulteradas: aplicar nunca quebra o mapa e desfazer volta ao início
  for (let seed = 1; seed <= 60; seed++) {
    const rr = rng(seed + 1000); const m = new MindMap(createNode('Concurso')); for (let i = 0; i < 4; i++) { const dd = m.addChild(m.root.id, 'D' + i); for (let j = 0; j < 4; j++) m.addChild(dd.id, `T${i}${j}`); }
    const { rows } = parseCsv(exportPlan(m, { today: TODAY })); const h = rows[0];
    for (const row of rows.slice(1)) for (let c = 1; c < h.length; c++) if (rr() < 0.25) row[c] = pick(rr, ['', '5', '0', '-1', '99', '101', '1,5', 'sim', 'errei', '20/10/2026', '2026-13-45', '-', word(rr, 12), '9999999', 'NaN', '1e3']);
    const csv = '\uFEFF' + rows.map((x) => x.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(';')).join('\r\n');
    const d = diffPlan(m, csv, { today: TODAY }); const before = canonical(m);
    try { applyPlan(m, d); } catch (e) { assert.equal(canonical(m), before, 'aplicar falhou mas alterou o mapa'); }
    check(m, 'planilha adulterada seed ' + seed); if (canonical(m) !== before) { assert.ok(m.undo(), 'undo'); assert.equal(canonical(m), before, 'desfazer a planilha não restaurou'); }
  }
});

test('FUZZ de referências de PDF e agenda .ics: saneamento total e arquivo iCalendar sempre bem formado', () => {
  const r = rng(5);
  for (let i = 0; i < 1500; i++) {
    const refs = sanitizeRefs([{ pdf: pick(r, ['a', 'b c', '../x', 'ok_1', '', 5, null]), page: pick(r, [1, 0, -2, 1.5, '3', 1e9, 7]), quote: pick(r, [word(r, 50), 5, null, 'x'.repeat(5000)]), rects: pick(r, [[], [[0, 0, 1, 1]], [[2, 2, 2, 2]], [['a']], 'x', [[NaN, 0, 1, 1]], Array.from({ length: 100 }, () => [0.1, 0.1, 0.1, 0.1])]) }, null, 7]);
    for (const x of refs) { assert.match(x.pdf, /^[A-Za-z0-9_-]{1,64}$/); assert.ok(Number.isInteger(x.page) && x.page >= 1 && x.page <= 100000); assert.ok(x.quote.length <= 2000 && x.rects.length <= 40); for (const q of x.rects) assert.ok(q.length === 4 && q.every((v) => v >= 0 && v <= 1)); }
    sanitizePdfs([{ id: pick(r, ['a', '..', 'x y', 'ok']), path: pick(r, ['p', '', 5]), name: word(r) }]);
  }
  for (let seed = 1; seed <= 40; seed++) {
    const rr = rng(seed + 300); const m = new MindMap(createNode(word(rr, 20))); for (let i = 0; i < 6; i++) { const n = m.addChild(m.root.id, word(rr, 90)); m.mutateStudy(n.id, (s) => S.setNext(s, S.addDays(TODAY, Math.floor(rr() * 40) - 10))); }
    if (rr() < 0.5) m.setExam({ name: word(rr, 40), date: S.addDays(TODAY, 30) });
    const { ics, events } = toIcs(m, { today: TODAY, now: new Date('2026-10-20T12:00:00Z') });
    const lines = ics.split('\r\n'); assert.equal(lines.pop(), ''); assert.ok(!/[\r\n]/.test(lines.join('')), 'quebra de linha crua');
    for (const ln of lines) assert.ok(Buffer.byteLength(ln, 'utf8') <= 75, 'linha longa: ' + ln.length);
    const un = ics.replace(/\r\n /g, ''); assert.equal((un.match(/^BEGIN:VEVENT$/gm) || []).length, events); assert.equal((un.match(/^END:VEVENT$/gm) || []).length, events);
    for (const ln of un.split('\r\n').filter(Boolean)) assert.match(ln, /^[A-Z][A-Z0-9-]*(;[^:]*)?:/, 'linha sem propriedade: ' + ln);
  }
});

test('FUZZ da biblioteca: pacotes com mapas aleatórios (e conflitos) importam idênticos; importar duas vezes não duplica; lixeira e versões consistentes', () => {
  for (let seed = 1; seed <= 12; seed++) {
    const r = rng(seed + 4000), A = openLibrary(':memory:'), maps = [];
    for (let k = 0; k < 4; k++) { const m = new MindMap(createNode(word(r, 12))); m.meta.name = m.root.title; for (let i = 0; i < 30; i++) { const [, fn] = randomOp(m, r); try { fn(); } catch { /* operações inválidas lançam: ok */ } } maps.push(A.saveMap(m, { verify: true })); }
    A.trashMap(maps[0]); const pk = A.exportPackage(null).buffer; const B = openLibrary(':memory:'); const r1 = B.importPackage(pk); assert.equal(r1.maps, 3);
    for (const id of maps.slice(1)) assert.equal(canonical(B.loadMap(id)), canonical(readMom(writeMom(A.loadMap(id)))), `seed ${seed}: mapa diferente após o pacote`);
    const r2 = B.importPackage(pk); assert.equal(r2.imported + r2.copied + r2.replaced, 0, `seed ${seed}: reimportar duplicou`); assert.equal(B.listMaps().length, 3);
    assert.deepEqual(A.integrityCheck(), ['ok']); assert.deepEqual(B.integrityCheck(), ['ok']);
    for (const id of maps.slice(1)) { A.snapshot(id, 'manual'); const nid = A.restoreSnapshot(A.listSnapshots(id)[0].id); assert.ok(A.loadMap(nid)); }
  }
});

test('mapa com 3 000 tópicos e operações em massa: tempo razoável e invariantes preservadas', () => {
  const m = new MindMap(createNode('Grande')); const t0 = Date.now();
  for (let i = 0; i < 30; i++) { const d = m.addChild(m.root.id, 'D' + i); for (let j = 0; j < 99; j++) m.addChild(d.id, `T${i}.${j}`); }
  const all = ids(m).slice(1); m.removeMany(all.filter((_, i) => i % 7 === 0)); m.showLevels(1); m.showLevels(Infinity); m.autoLevels(100);
  for (const id of ids(m).slice(1, 200)) m.mutateStudy(id, (s) => S.addTime(s, TODAY, 5));
  check(m, 'grande'); const lib = openLibrary(':memory:'); const id = lib.saveMap(m, { verify: true }); assert.equal(canonical(lib.loadMap(id)), canonical(m));
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
