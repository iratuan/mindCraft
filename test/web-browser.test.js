'use strict';
// O núcleo empacotado para o NAVEGADOR/ANDROID roda num ambiente SEM Node (sem require, process, fs): só globais de navegador.
// Executa um fluxo completo de estudo: mapa → questões por banca → erros → .mom → biblioteca SQLite → pacote → "reiniciar" → relatório.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { build } = require('../tools/build-web-core');

let ctx, bundleSize;
test.before(async () => {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'mc-wb-')), 'core-browser.js');
  await build('browser', { outfile: out }); const code = fs.readFileSync(out, 'utf8'); bundleSize = code.length;
  const SQL = await require('sql.js')();
  const sandbox = { console, TextEncoder, TextDecoder, crypto: require('node:crypto').webcrypto, setTimeout, clearTimeout, queueMicrotask,
    Uint8Array, Uint16Array, Uint32Array, Int32Array, ArrayBuffer, DataView, __MC_SQL: SQL };   // só o que um navegador/WebView oferece (tipos do hospedeiro para não cruzar "realms")
  ctx = vm.createContext(sandbox); vm.runInContext(code, ctx, { filename: 'core-browser.js' });
});
/** Executa uma função DENTRO do ambiente sem Node (ela vê `MindCore` e os globais do navegador, nada do teste). */
const inBrowser = (fn, arg) => JSON.parse(vm.runInContext('JSON.stringify((' + fn.toString() + ')(' + JSON.stringify(arg === undefined ? null : arg) + '))', ctx));

test('o pacote do navegador carrega sem recursos do Node e tem tamanho razoável', () => {
  const r = inBrowser(() => ({ req: typeof require, mod: typeof module, proc: typeof process, core: typeof MindCore, keys: ['study', 'model', 'mom', 'library', 'csv', 'planner', 'report', 'graph', 'layout', 'svg', 'notify', 'settings'].every((k) => !!MindCore[k]) }));
  assert.equal(r.req, 'undefined'); assert.equal(r.mod, 'undefined'); assert.equal(r.core, 'object'); assert.equal(r.keys, true);
  assert.ok(bundleSize < 2.5 * 1024 * 1024, 'tamanho do pacote: ' + Math.round(bundleSize / 1024) + ' KB');
});

test('fluxo completo no ambiente sem Node: estudo, .mom, biblioteca SQLite verificada, pacote, reinício e relatório', () => {
  const r = inBrowser(() => {
    const { model, study: S, mom, library, report, planner, notify, graph, layout, svg, settings } = MindCore; const { MindMap, createNode } = model; const out = {};
    const m = new MindMap(createNode('Concurso')); m.meta.name = 'Concurso';
    const d = m.addChild(m.root.id, 'Direito'), t = m.addChild(d.id, 'Atos');
    m.mutateStudy(t.id, (s) => S.addQuestions(s, 20, 13, '2026-10-20', { banca: 'CESPE', year: 2024 }));
    m.mutateStudy(t.id, (s) => S.addError(s, { why: 'confundi', note: 'ação', today: '2026-10-20', banca: 'CESPE', year: 2024 }));
    m.mutateStudy(t.id, (s) => S.reviewed(s, { today: '2026-10-20', ok: true }));
    out.summary = S.summary(m, { today: '2026-10-21' });
    const buf = mom.writeMom(m); out.momBytes = buf.length; const back = mom.readMom(buf);
    out.momSame = JSON.stringify(S.summary(back, { today: '2026-10-21' }).questionsBy) === JSON.stringify(out.summary.questionsBy);
    // biblioteca no sistema de arquivos virtual (persiste a cada transação)
    const lib = library.openLibrary('/dados/biblioteca.db'); const id = lib.saveMap(m, { verify: true });
    out.bySource = lib.questionsBySource().banca; out.openErrors = lib.openErrors().length; out.due = lib.dueTopics('2026-10-21').length;
    // pacote com configurações → outra biblioteca (em memória)
    const pk = lib.exportPackage('/dados/tudo.mcpack', { settings: { startScreen: 'last', light: true, notifyDaily: true, notifyAt: '07:30', vaultDir: '/segredo' } });
    const lib2 = library.openLibrary(':memory:'); const rep = lib2.importPackage('/dados/tudo.mcpack');
    out.pack = { maps: pk.maps, imported: rep.imported, settings: rep.settings, by2: lib2.questionsBySource().banca.length };
    // "reiniciar o app": fotografa o armazenamento, apaga tudo da memória, restaura, reabre
    lib.close(); const fsv = MindCore.__fs; const snap = JSON.parse(JSON.stringify(fsv.vfs.snapshot())); fsv.vfs.clear(); out.apagado = fsv.existsSync('/dados/biblioteca.db'); fsv.vfs.restore(snap);
    const again = library.openLibrary('/dados/biblioteca.db'); const loaded = again.loadMap(id);
    out.reopened = { title: loaded.root.title, kids: loaded.root.children.length, qs: again.questionsBySource().banca[0].done, integrity: again.integrityCheck() };
    out.md = report.toStudyMarkdown(m, { today: '2026-10-21' }).includes('Questões por banca e ano');
    out.plan = typeof planner.exportPlan(m, { today: '2026-10-21' }) === 'string';
    out.notice = notify.buildNotice({ due: 2, dueMaps: 1, errors: 1 });
    out.graph = graph.buildGraph([{ key: 'k', name: 'x', map: m }], { hierarchy: true }).nodes.length;
    out.layout = !!layout.layoutMap(m).bounds; out.svg = svg.toSVG(m).includes('<svg');
    out.settings = settings.sanitizeSettings({ startScreen: 'blank', evil: 1 });
    out.sha = library.sha256(Buffer.from('abc')); out.id = model.newId().length;
    return out;
  });
  assert.deepEqual(r.summary.questionsBy.banca.map((b) => [b.name, b.done, b.correct]), [['CESPE', 20, 13]]); assert.equal(r.momSame, true); assert.ok(r.momBytes > 300);
  assert.deepEqual(r.bySource.map((b) => [b.name, b.done]), [['CESPE', 20]]); assert.equal(r.openErrors, 1); assert.equal(r.due, 1);
  assert.deepEqual(r.pack, { maps: 1, imported: 1, settings: { startScreen: 'last', light: true, notifyDaily: true, notifyAt: '07:30' }, by2: 1 });
  assert.equal(r.apagado, false, 'a memória foi apagada de verdade'); assert.deepEqual(r.reopened, { title: 'Concurso', kids: 1, qs: 20, integrity: ['ok'] }, 'o banco voltou idêntico depois de "reiniciar"');
  assert.equal(r.md, true); assert.equal(r.plan, true); assert.deepEqual(r.notice, { title: 'MindCraft — hora de estudar', body: '2 revisões vencidas · 1 erro para refazer' });
  assert.equal(r.graph, 3); assert.equal(r.layout, true); assert.equal(r.svg, true); assert.deepEqual(r.settings, { startScreen: 'blank' });
  assert.equal(r.sha, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'); assert.equal(r.id, 32);
});

test('o .mom feito no desktop é lido pela web e o .mom feito na web é lido pelo desktop, com o mesmo conteúdo', () => {
  const desktop = require('../core/mom'), { MindMap, createNode } = require('../core/model'), S = require('../core/study');
  const m = new MindMap(createNode('Mapa')); const a = m.addChild(m.root.id, 'A'); m.mutateStudy(a.id, (s) => S.addQuestions(s, 5, 4, '2026-10-20', { banca: 'FGV', year: 2023 }));
  const viaWeb = inBrowser((b64) => { const { mom, study: S2 } = MindCore; const mm = mom.readMom(Buffer.from(b64, 'base64')); return { q: S2.summary(mm, { today: '2026-10-20' }).questionsBy, back: Buffer.from(mom.writeMom(mm)).toString('base64') }; }, desktop.writeMom(m).toString('base64'));
  assert.deepEqual(viaWeb.q.banca.map((b) => [b.name, b.done, b.correct]), [['FGV', 5, 4]], 'a web lê o .mom feito no desktop');
  const lido = desktop.readMom(Buffer.from(viaWeb.back, 'base64')); assert.deepEqual(S.summary(lido, { today: '2026-10-20' }).questionsBy, S.summary(m, { today: '2026-10-20' }).questionsBy, 'o desktop lê o .mom feito na web');
});
