'use strict';
// Questões por banca/ano, caderno de erros com "refazer", derivadas na biblioteca e configurações portáteis no pacote.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AdmZip = require('adm-zip');
const S = require('../core/study');
const { MindMap, createNode } = require('../core/model');
const { writeMom, readMom } = require('../core/mom');
const { openLibrary } = require('../core/library');
const { sanitizeSettings } = require('../core/settings');

const TODAY = '2026-10-20';
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'mc-q-'));
const q = (st, done, correct, o = {}, day = TODAY) => S.addQuestions(st, done, correct, day, o);

test('banca/ano: limpeza, chave sem caixa/acento, anos válidos', () => {
  assert.equal(S.cleanBanca('  CESPE   /  CEBRASPE  '), 'CESPE / CEBRASPE');
  assert.equal(S.cleanBanca('x'.repeat(200)).length, 60); assert.equal(S.cleanBanca(null), ''); assert.equal(S.cleanBanca(undefined), '');
  assert.equal(S.bancaKey('Cespé'), S.bancaKey('CESPE')); assert.equal(S.bancaKey(' FGV '), 'fgv');
  assert.equal(S.cleanYear(2024), 2024); assert.equal(S.cleanYear('2019'), 2019); assert.equal(S.cleanYear(''), null); assert.equal(S.cleanYear(null), null);
  for (const bad of [1949, 2101, 20.5, 'abc', '19', NaN, Infinity, {}, [], '2024.5', -2024]) assert.equal(S.cleanYear(bad), null, String(bad));
});

test('addQuestions com banca/ano: totais e por-dia continuam iguais; detalhe só quando informado; soma no mesmo dia+banca+ano', () => {
  let s = S.emptyStudy();
  s = q(s, 10, 7);                                   // sem origem: não cria detalhe
  assert.equal(s.qsrc, undefined); assert.deepEqual(s.q, { done: 10, correct: 7 });
  s = q(s, 10, 6, { banca: 'CESPE', year: 2024 }); s = q(s, 5, 5, { banca: 'cespé', year: 2024 });   // mesma banca (acento/caixa) e ano
  s = q(s, 8, 2, { banca: 'FGV' }); s = q(s, 4, 3, { year: 2022 });
  assert.deepEqual(s.q, { done: 37, correct: 23 }); assert.deepEqual(s.qlog[TODAY], { done: 37, correct: 23 });
  assert.equal(s.qsrc.length, 3);
  assert.deepEqual(s.qsrc.find((r) => r.banca === 'CESPE'), { d: TODAY, banca: 'CESPE', year: 2024, done: 15, correct: 11 });
  assert.deepEqual(s.qsrc.find((r) => r.banca === 'FGV'), { d: TODAY, banca: 'FGV', done: 8, correct: 2 });
  assert.deepEqual(s.qsrc.find((r) => r.year === 2022), { d: TODAY, year: 2022, done: 4, correct: 3 });
  // dia diferente = registro novo
  s = S.addQuestions(s, 2, 1, '2026-10-21', { banca: 'CESPE', year: 2024 }); assert.equal(s.qsrc.length, 4);
});

test('ano inválido é recusado SEM registrar nada (nem no total)', () => {
  const s = q(S.emptyStudy(), 5, 5, { banca: 'FGV', year: 2020 }); const antes = JSON.stringify(s);
  for (const year of [1900, 3000, 'abc', 20.5]) assert.throws(() => q(s, 3, 3, { banca: 'FGV', year }), /Ano inválido/);
  assert.equal(JSON.stringify(s), antes, 'o estado original não é alterado');
  assert.throws(() => q(s, 3, 4, { banca: 'FGV' }), /acertos/); assert.throws(() => q(s, 0, 0, { banca: 'FGV' }), /inteiros/);
});

test('normalizeStudy valida qsrc vindo de arquivo: descarta lixo, mescla duplicados, nunca confia', () => {
  const raw = { qsrc: [
    { d: TODAY, banca: 'FGV', year: 2023, done: 10, correct: 5 }, { d: TODAY, banca: 'fgv', year: 2023, done: 4, correct: 4 },   // duplicado por chave → soma
    { d: 'ontem', banca: 'FGV', done: 1, correct: 1 }, { d: TODAY, banca: 'X', done: 3, correct: 4 }, { d: TODAY, banca: 'X', done: 0, correct: 0 },
    { d: TODAY, done: 3, correct: 1 },                                                                                          // sem banca nem ano → descartado
    { d: TODAY, banca: 'Y', year: 1800, done: 2, correct: 1 }, null, 7, 'x', { d: TODAY, banca: 'Z', done: 1.5, correct: 1 },
  ] };
  const s = S.normalizeStudy(raw);
  assert.deepEqual(s.qsrc, [{ d: TODAY, banca: 'FGV', year: 2023, done: 14, correct: 9 }, { d: TODAY, banca: 'Y', done: 2, correct: 1 }]);
  assert.equal(S.normalizeStudy({ qsrc: 'lixo' }).qsrc, undefined); assert.equal(S.normalizeStudy({ qsrc: [] }).qsrc, undefined);
  assert.equal(JSON.stringify(S.normalizeStudy(S.normalizeStudy(raw))), JSON.stringify(s), 'idempotente');
});

test('limite de registros por banca/ano por tópico: recusa com mensagem, sem perder nada', () => {
  let s = S.emptyStudy(), d = '2026-01-01';
  const day = (i) => { const t = new Date(Date.UTC(2020, 0, 1) + i * 86400000); return t.toISOString().slice(0, 10); };
  for (let i = 0; i < S.MAX_QSRC; i++) s = S.addQuestions(s, 1, 1, day(i), { banca: 'B' });
  assert.equal(s.qsrc.length, S.MAX_QSRC);
  assert.throws(() => S.addQuestions(s, 1, 1, day(S.MAX_QSRC), { banca: 'B' }), /já tem 500 registros/);
  s = S.addQuestions(s, 2, 1, day(3), { banca: 'B' }); assert.equal(s.qsrc.length, S.MAX_QSRC, 'mesmo dia+banca soma, não cria entrada');
});

test('caderno de erros: banca/ano, refazer (acertou/errou), desmarcar e validação', () => {
  let s = S.addError(S.emptyStudy(), { why: 'confundi', note: 'literal x teleológico', today: TODAY, banca: ' Cebraspe ', year: '2023' });
  assert.deepEqual(s.errs[0], { d: TODAY, why: 'confundi', note: 'literal x teleológico', banca: 'Cebraspe', year: 2023 });
  assert.throws(() => S.addError(s, { why: 'confundi', today: TODAY, year: 1000 }), /Ano inválido/);
  s = S.redoError(s, 0, { today: '2026-10-25', ok: true }); assert.deepEqual(s.errs[0].redo, { d: '2026-10-25', ok: true });
  s = S.redoError(s, 0, { today: '2026-10-26', ok: false }); assert.deepEqual(s.errs[0].redo, { d: '2026-10-26', ok: false }, 'refazer de novo substitui');
  s = S.redoError(s, 0, { ok: null }); assert.equal(s.errs[0].redo, undefined, 'desmarcar volta a "para refazer"');
  assert.throws(() => S.redoError(s, 5, { today: TODAY, ok: true }), /não encontrado/); assert.throws(() => S.redoError(s, 0, { today: 'x', ok: true }), /Data inválida/); assert.throws(() => S.redoError(s, 0, { today: TODAY, ok: 'sim' }), /acertou/);
  // vindo de arquivo: redo malformado é descartado
  const n = S.normalizeStudy({ errs: [{ d: TODAY, why: 'atencao', redo: { d: 'x', ok: true } }, { d: TODAY, why: 'atencao', redo: { d: TODAY, ok: 'sim' } }, { d: TODAY, why: 'atencao', redo: { d: TODAY, ok: false }, banca: 5, year: 'abc' }] });
  assert.equal(n.errs[0].redo, undefined); assert.equal(n.errs[1].redo, undefined); assert.deepEqual(n.errs[2].redo, { d: TODAY, ok: false }); assert.equal(n.errs[2].year, undefined);
  // removeError reindexa
  const t = S.addError(S.addError(S.emptyStudy(), { why: 'atencao', today: TODAY }), { why: 'chute', today: TODAY }); assert.equal(S.removeError(t, 0).errs[0].why, 'chute');
});

function mapa() {
  const m = new MindMap(createNode('Concurso')); m.meta.name = 'Concurso';
  const d1 = m.addChild(m.root.id, 'Direito'), d2 = m.addChild(m.root.id, 'Português');
  const a = m.addChild(d1.id, 'Atos'), b = m.addChild(d2.id, 'Crase');
  m.mutateStudy(a.id, (st) => q(st, 10, 4, { banca: 'CESPE', year: 2024 }));
  m.mutateStudy(a.id, (st) => q(st, 10, 9, { banca: 'FGV', year: 2023 }));
  m.mutateStudy(b.id, (st) => q(st, 20, 10, { banca: 'cespé', year: 2023 }));
  m.mutateStudy(b.id, (st) => q(st, 5, 5));
  m.mutateStudy(a.id, (st) => S.addError(st, { why: 'nao-sabia', note: 'prazo', today: '2026-10-10', banca: 'CESPE', year: 2024 }));
  m.mutateStudy(a.id, (st) => S.addError(st, { why: 'atencao', today: '2026-10-12' }));
  m.mutateStudy(b.id, (st) => S.addError(st, { why: 'confundi', today: '2026-10-18', banca: 'FGV' }));
  m.mutateStudy(a.id, (st) => S.redoError(st, 1, { today: '2026-10-15', ok: true }));
  return { m, a, b };
}

test('summary: acerto por banca e por ano (agrupa Cespé=CESPE; sem origem fica de fora do detalhe) e erros abertos/refeitos', () => {
  const { m } = mapa(); const s = S.summary(m, { today: TODAY });
  assert.deepEqual(s.questionsBy.banca.map((x) => [x.name, x.done, x.correct]), [['CESPE', 30, 14], ['FGV', 10, 9]]);
  assert.ok(Math.abs(s.questionsBy.banca[0].accuracy - 14 / 30) < 1e-9);
  assert.deepEqual(s.questionsBy.year.map((x) => [x.year, x.done, x.correct]), [[2024, 10, 4], [2023, 30, 19]]);
  assert.equal(s.questions.done, 45, 'o total geral continua incluindo as questões sem banca');
  assert.deepEqual([s.errors.total, s.errors.open, s.errors.redoneOk, s.errors.redoneBad], [3, 2, 1, 0]);
  assert.deepEqual(s.errors.list.map((e) => [e.why, !!e.redo]), [['confundi', false], ['nao-sabia', false], ['atencao', true]], 'para refazer primeiro, mais novos antes');
  assert.ok(s.errors.list.every((e) => Number.isInteger(e.i) && e.id), 'cada item sabe o índice e o tópico (para marcar como refeito)');
});

test('.mom: banca/ano e "refeito" sobrevivem a gravar e reabrir', () => {
  const { m } = mapa(); const volta = readMom(writeMom(m));
  assert.deepEqual(S.summary(volta, { today: TODAY }).questionsBy, S.summary(m, { today: TODAY }).questionsBy);
  assert.deepEqual(S.summary(volta, { today: TODAY }).errors.list, S.summary(m, { today: TODAY }).errors.list);
});

test('biblioteca: derivadas por banca/ano e erros abertos; viram resultado ao salvar e SOMEM com a lixeira', () => {
  const lib = openLibrary(path.join(tmp(), 'b.db')); const { m } = mapa(); const id = lib.saveMap(m, { verify: true });
  const by = lib.questionsBySource();
  assert.deepEqual(by.banca.map((x) => [x.name, x.done, x.correct]), [['CESPE', 30, 14], ['FGV', 10, 9]]);
  assert.deepEqual(by.year.map((x) => [x.year, x.done]), [[2024, 10], [2023, 30]]);
  const open = lib.openErrors(); assert.deepEqual(open.map((e) => e.why), ['nao-sabia', 'confundi'], 'mais antigos primeiro; o refeito não aparece');
  assert.ok(open[0].mapTitle && open[0].title && open[0].topicId);
  // regravar com um erro refeito: some da lista
  const m2 = lib.loadMap(id); const a = m2.root.children[0].children[0]; m2.mutateStudy(a.id, (st) => S.redoError(st, 0, { today: TODAY, ok: false })); lib.saveMap(m2, { id });
  assert.deepEqual(lib.openErrors().map((e) => e.why), ['confundi']);
  lib.trashMap(id); assert.deepEqual(lib.questionsBySource(), { banca: [], year: [] }); assert.deepEqual(lib.openErrors(), []);
  lib.restoreMap(id); assert.equal(lib.questionsBySource().banca.length, 2);
});

test('biblioteca: soma de VÁRIOS mapas por banca/ano', () => {
  const lib = openLibrary(':memory:'); lib.saveMap(mapa().m); const m2 = mapa().m; m2.meta.name = 'Outro'; lib.saveMap(m2);
  assert.deepEqual(lib.questionsBySource().banca.map((x) => [x.name, x.done]), [['CESPE', 60], ['FGV', 20]]);
});

test('MIGRAÇÃO: biblioteca criada antes (v1, sem tabelas de questões) é atualizada, preenchida e continua íntegra; faz cópia de segurança', () => {
  const dir = tmp(), f = path.join(dir, 'b.db'); const lib = openLibrary(f); const { m } = mapa(); const id = lib.saveMap(m);
  lib.db.exec('DROP TABLE qsrc; DROP TABLE qerr; PRAGMA user_version = 1'); lib.close();     // simula a versão anterior
  const again = openLibrary(f);
  assert.equal(again.db.prepare('PRAGMA user_version').get().user_version, 2); assert.deepEqual(again.integrityCheck(), ['ok']);
  assert.deepEqual(again.questionsBySource().banca.map((x) => [x.name, x.done]), [['CESPE', 30], ['FGV', 10]], 'preenchido a partir dos mapas já guardados');
  assert.equal(again.openErrors().length, 2); assert.equal(again.loadMap(id).root.children.length, 2);
  assert.ok(fs.readdirSync(dir).some((n) => /antes-da-v2/.test(n)), 'cópia de segurança antes de migrar: ' + fs.readdirSync(dir).join(','));
});

// ---------- configurações portáteis no pacote ----------
test('settings: só chaves e valores conhecidos; nada de caminhos; lixo é descartado', () => {
  assert.deepEqual(sanitizeSettings({ startScreen: 'home', dashOnStart: true, newInLibrary: false, light: true, pdfScale: 'fit', pdfWidth: 420.4 }), { startScreen: 'home', dashOnStart: true, newInLibrary: false, light: true, pdfScale: 'fit', pdfWidth: 420 });
  assert.deepEqual(sanitizeSettings({ vaultDir: 'C:\\Users\\x', lastLib: 'abc', pdfPos: { 'C:\\a.pdf': 3 }, recent: ['a'], __proto__: { x: 1 }, startScreen: 'javascript:alert(1)', dashOnStart: 'sim', pdfScale: 99, pdfWidth: 5, light: 1 }), {});
  for (const bad of [null, undefined, 5, 'x', [], [1]]) assert.deepEqual(sanitizeSettings(bad), {});
  assert.deepEqual(sanitizeSettings({ pdfScale: 1.5 }), { pdfScale: 1.5 });
});

test('pacote: exporta e importa mapas COM configurações; verificação SHA-256 das configurações; pacote antigo sem configurações continua importando', () => {
  const dir = tmp(), a = openLibrary(path.join(dir, 'a.db')); a.saveMap(mapa().m);
  const pack = path.join(dir, 'x.mcpack'); a.exportPackage(pack, { settings: { startScreen: 'last', light: true, vaultDir: 'C:\\segredo' } });
  const zip = new AdmZip(pack); assert.ok(zip.getEntry('settings.json')); assert.ok(!zip.getEntry('settings.json').getData().toString().includes('segredo'), 'caminho local não vai no pacote');
  const b = openLibrary(path.join(dir, 'b.db')); const rep = b.importPackage(pack);
  assert.deepEqual(rep.settings, { startScreen: 'last', light: true }); assert.equal(rep.imported, 1);
  assert.deepEqual(b.questionsBySource().banca.map((x) => [x.name, x.done]), [['CESPE', 30], ['FGV', 10]], 'questões por banca chegam na outra instalação');
  assert.equal(b.openErrors().length, 2);
  // sem configurações → settings null
  const p2 = path.join(dir, 'y.mcpack'); a.exportPackage(p2); assert.equal(openLibrary(':memory:').importPackage(p2).settings, null);
  // adulterado: troca o conteúdo das configurações sem atualizar o hash → recusa e NADA é gravado
  const z = new AdmZip(pack); z.updateFile('settings.json', Buffer.from('{"startScreen":"blank"}')); const bad = path.join(dir, 'z.mcpack'); z.writeZip(bad);
  const c = openLibrary(':memory:'); assert.throws(() => c.importPackage(bad), /SHA-256\) das configurações/); assert.equal(c.listMaps().length, 0);
  // configurações com conteúdo hostil (hash correto) → sanitizadas
  const h = new AdmZip(pack); const evil = Buffer.from(JSON.stringify({ startScreen: '<script>', vaultDir: 'C:\\x', light: false })); h.updateFile('settings.json', evil);
  const man = JSON.parse(h.getEntry('manifest.json').getData().toString()); man.settings.sha256 = require('crypto').createHash('sha256').update(evil).digest('hex'); h.updateFile('manifest.json', Buffer.from(JSON.stringify(man)));
  const hp = path.join(dir, 'h.mcpack'); h.writeZip(hp); assert.deepEqual(openLibrary(':memory:').importPackage(hp).settings, { light: false });
  // manifest apontando para arquivo estranho
  const g = new AdmZip(pack); const man2 = JSON.parse(g.getEntry('manifest.json').getData().toString()); man2.settings.file = '../../x'; g.updateFile('manifest.json', Buffer.from(JSON.stringify(man2))); const gp = path.join(dir, 'g.mcpack'); g.writeZip(gp);
  assert.throws(() => openLibrary(':memory:').importPackage(gp), /configurações ilegíveis/);
});

test('relatório .md: seção "Questões por banca e ano" só aparece com dados; erros mostram origem e situação; tabela escapa "|"', () => {
  const R = require('../core/report');
  const vazio = new MindMap(createNode('x')); vazio.meta.name = 'x';
  assert.ok(!/Questões por banca e ano/.test(R.toStudyMarkdown(vazio, { today: TODAY })));
  const { m } = mapa(); m.mutateStudy(m.root.children[1].children[0].id, (st) => q(st, 3, 1, { banca: 'A|B' }));
  const md = R.toStudyMarkdown(m, { today: TODAY });
  assert.match(md, /## Questões por banca e ano/); assert.match(md, /\| CESPE \| 14\/30 \| 46[,.]7% \|/); assert.match(md, /\| A\\\|B \| 1\/3 \|/);
  assert.match(md, /2 para refazer · 1 refeito\(s\) e acertado\(s\) · 0 errado\(s\) de novo/); assert.match(md, /CESPE 2024/); assert.match(md, /refeito em 15\/10\/2026: acertei/);
});

test('FUZZ (semente fixa): lixo aleatório em qsrc/errs/settings nunca gera estado inválido, é idempotente e nunca lança', () => {
  let seed = 20261016; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const val = () => pick([null, undefined, 0, -1, 1, 2, 3.5, NaN, Infinity, '', 'x', '2026-10-20', '2026-02-30', '2024', 'CESPE', '<b>', 'a'.repeat(300), true, false, [], {}, [1], { a: 1 }, 1e9, 2024, 1949, 2101]);
  const obj = () => { const o = {}; for (const k of ['d', 'banca', 'year', 'done', 'correct', 'why', 'note', 'redo', 'ok']) if (rnd() < 0.7) o[k] = rnd() < 0.15 ? { d: val(), ok: val() } : val(); return o; };
  const isDate = (d) => S.isDateStr(d);
  for (let i = 0; i < 4000; i++) {
    const raw = { qsrc: rnd() < 0.9 ? Array.from({ length: Math.floor(rnd() * 8) }, obj) : val(), errs: rnd() < 0.9 ? Array.from({ length: Math.floor(rnd() * 6) }, obj) : val() };
    const s = S.normalizeStudy(raw);
    for (const r of s.qsrc || []) { assert.ok(isDate(r.d) && Number.isInteger(r.done) && Number.isInteger(r.correct) && r.done > 0 && r.correct >= 0 && r.correct <= r.done); assert.ok(r.banca || r.year); if (r.year) assert.ok(S.cleanYear(r.year) === r.year); if (r.banca) assert.ok(r.banca.length <= 60 && r.banca === S.cleanBanca(r.banca)); }
    for (const e of s.errs || []) { assert.ok(isDate(e.d) && S.ERR_REASONS[e.why]); assert.ok(e.note.length <= S.MAX_ERR_NOTE); if (e.redo) assert.ok(isDate(e.redo.d) && typeof e.redo.ok === 'boolean'); }
    assert.equal(JSON.stringify(S.normalizeStudy(s)), JSON.stringify(s));
    const sumSrc = (s.qsrc || []).reduce((a, r) => a + r.done, 0); void sumSrc;
  }
  for (let i = 0; i < 2000; i++) { const o = sanitizeSettings(pick([{}, { startScreen: val(), dashOnStart: val(), newInLibrary: val(), light: val(), pdfScale: val(), pdfWidth: val() }, val()])); assert.ok(Object.values(o).every((v) => ['string', 'boolean', 'number'].includes(typeof v))); assert.deepEqual(sanitizeSettings(o), o); }
});
