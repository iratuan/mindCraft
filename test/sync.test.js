'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { openLibrary, canonical } = require('../core/library');
const { syncLibrary, parseListing, hashOf } = require('../core/sync');
const { FolderRemote } = require('../core/sync-folder');
const { writeMom, readMom } = require('../core/mom');
const S = require('../core/study');
const { concurso, TODAY } = require('./fixtures');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'mc-sync-'));
const clock = (start) => { let t = Date.parse(start); const f = () => new Date(t).toISOString(); f.add = (ms) => { t += ms; }; return f; };
/** Remoto em memória (mesmo contrato do provedor). `fail` simula queda de rede. */
class MemRemote {
  constructor() { this.files = new Map(); this.writes = 0; this.fail = null; }
  async list() { if (this.fail === 'list') throw new Error('sem rede'); return [...this.files.keys()]; }
  async read(n) { if (!this.files.has(n)) throw new Error('não existe'); return Buffer.from(this.files.get(n)); }
  async write(n, d) { if (this.fail === 'write') throw new Error('sem rede'); if (!this.files.has(n)) { this.files.set(n, Buffer.from(d)); this.writes++; } }
}
const device = (start = '2026-10-20T10:00:00.000Z') => { const now = clock(start); const lib = openLibrary(':memory:', { now }); return { lib, now, state: {} }; };
const sync = (d, r, o) => syncLibrary(d.lib, r, d.state, o);
const addMap = (d, title) => { const { m } = concurso(); m.root.title = title; m.meta.name = title; return d.lib.saveMap(m, { snapshot: false }); };
const edit = (d, id, fn) => { d.now.add(60000); const m = d.lib.loadMap(id); fn(m); d.lib.saveMap(m, { snapshot: false }); };
const titles = (d) => d.lib.listMaps().map((x) => x.title).sort();
const same = (a, b, id) => assert.strictEqual(hashOf(a.lib.loadMap(id)), hashOf(b.lib.loadMap(id)));

test('1ª sincronização envia tudo; a 2ª não envia nada (nada a fazer)', async () => {
  const A = device(), R = new MemRemote(); const i1 = addMap(A, 'Direito'), i2 = addMap(A, 'Português');
  const r1 = await sync(A, R); assert.deepStrictEqual([r1.pushed, r1.errors.length], [2, 0]); assert.strictEqual(R.files.size, 2);
  const w = R.writes; const r2 = await sync(A, R); assert.deepStrictEqual([r2.pushed, r2.pulled, r2.same, r2.conflicts], [0, 0, 2, 0]); assert.strictEqual(R.writes, w);
  assert.ok(i1 && i2);
});

test('outro aparelho recebe os mapas idênticos (incl. estudo) e depois só acompanha as mudanças', async () => {
  const A = device(), B = device('2026-10-21T08:00:00.000Z'), R = new MemRemote();
  const id = addMap(A, 'Direito');
  edit(A, id, (m) => { const n = m.root.children[0]; m.mutateStudy(n.id, (s) => S.addQuestions(S.addTime(S.reviewed(s, { today: TODAY, ok: true }), TODAY, 45), 20, 15, TODAY)); });
  await sync(A, R); const rb = await sync(B, R); assert.strictEqual(rb.pulled, 1); same(A, B, id);
  edit(A, id, (m) => { m.update(m.root.children[0].id, { notes: 'novo texto ção 😀' }); }); await sync(A, R);
  const rb2 = await sync(B, R); assert.strictEqual(rb2.pulled, 1); same(A, B, id);
  assert.ok(B.lib.listSnapshots(id).some((s) => s.reason === 'antes de sincronizar'), 'versão do mapa antigo guardada antes de trocar');
  const rb3 = await sync(B, R); assert.deepStrictEqual([rb3.pulled, rb3.pushed], [0, 0]);
});

test('mudou só no tablet: o computador recebe; mudou só no computador: o tablet recebe (ida e volta, sem eco)', async () => {
  const A = device(), B = device('2026-10-21T08:00:00.000Z'), R = new MemRemote(); const id = addMap(A, 'M');
  await sync(A, R); await sync(B, R);
  edit(B, id, (m) => m.update(m.root.id, { title: 'Feito no tablet' })); await sync(B, R);
  const ra = await sync(A, R); assert.strictEqual(ra.pulled, 1); assert.strictEqual(A.lib.loadMap(id).root.title, 'Feito no tablet');
  const w = R.writes; await sync(A, R); await sync(B, R); assert.strictEqual(R.writes, w, 'nenhuma gravação de eco');
});

test('CONFLITO (os dois mudaram): as duas versões ficam; nada se perde; converge sem criar cópias infinitas', async () => {
  const A = device(), B = device('2026-10-21T08:00:00.000Z'), R = new MemRemote(); const id = addMap(A, 'Direito');
  await sync(A, R); await sync(B, R);
  edit(A, id, (m) => m.update(m.root.id, { title: 'Versão do PC' })); edit(B, id, (m) => m.update(m.root.id, { title: 'Versão do tablet' }));
  await sync(A, R);
  const rb = await sync(B, R); assert.strictEqual(rb.conflicts, 1);
  assert.strictEqual(B.lib.loadMap(id).root.title, 'Versão do tablet', 'o mapa local continua sendo o do aparelho');
  const copies = B.lib.listMaps().filter((x) => /da sincronização/.test(x.title)); assert.strictEqual(copies.length, 1);
  assert.strictEqual(B.lib.loadMap(copies[0].id).root.title, 'Versão do PC', 'a versão do outro aparelho está inteira na cópia');
  for (let i = 0; i < 3; i++) { await sync(A, R); await sync(B, R); }
  assert.strictEqual(B.lib.listMaps().length, 2, 'estável no B'); assert.strictEqual(A.lib.listMaps().length, 2, 'estável no A (o mapa e a cópia; nada de cópias da cópia)');
  assert.deepStrictEqual(titles(A), titles(B), 'os dois aparelhos convergem para o mesmo conjunto'); same(A, B, id);
});

test('relógio atrasado num aparelho não faz a edição dele "sumir" para os outros', async () => {
  const A = device('2026-10-20T10:00:00.000Z'), B = device('2020-01-01T00:00:00.000Z'), R = new MemRemote(); const id = addMap(A, 'M');
  await sync(A, R); await sync(B, R);
  edit(B, id, (m) => m.update(m.root.id, { title: 'B com relógio de 2020' })); await sync(B, R);
  const ra = await sync(A, R); assert.strictEqual(ra.pulled, 1); assert.strictEqual(A.lib.loadMap(id).root.title, 'B com relógio de 2020');
});

test('excluir (lixeira) NÃO se espalha e NÃO apaga nada do remoto; o excluído não ressuscita sozinho', async () => {
  const A = device(), B = device('2026-10-21T08:00:00.000Z'), R = new MemRemote(); const id = addMap(A, 'M');
  await sync(A, R); await sync(B, R); const n = R.files.size;
  B.lib.trashMap(id); await sync(B, R); assert.strictEqual(R.files.size, n, 'remoto intacto'); assert.strictEqual(B.lib.listMaps().length, 0, 'continua na lixeira do B');
  await sync(A, R); assert.strictEqual(A.lib.listMaps().length, 1, 'no A continua existindo');
});

test('arquivo remoto adulterado ou corrompido: erro claro, o local não muda, os outros mapas sincronizam', async () => {
  const A = device(), B = device('2026-10-21T08:00:00.000Z'), R = new MemRemote(); const i1 = addMap(A, 'Bom'), i2 = addMap(A, 'Ruim');
  await sync(A, R);
  const bad = [...R.files.keys()].find((k) => k.includes(i2)); R.files.set(bad, Buffer.from('isto não é um mapa'));
  const rb = await sync(B, R); assert.strictEqual(rb.errors.length, 1); assert.deepStrictEqual(titles(B), ['Bom']);
  // conteúdo VÁLIDO porém diferente do que o nome promete (adulterado)
  const other = concurso().m; other.root.title = 'Outro'; R.files.set(bad, writeMom(other));
  const rb2 = await sync(B, R); assert.strictEqual(rb2.errors.length, 1); assert.match(rb2.errors[0], /não confere/); assert.deepStrictEqual(titles(B), ['Bom']); assert.ok(i1);
});

test('queda de rede no meio: nada fica pela metade; ao voltar, termina sem duplicar', async () => {
  const A = device(), R = new MemRemote(); addMap(A, 'M1'); addMap(A, 'M2');
  R.fail = 'write'; const r1 = await sync(A, R); assert.strictEqual(r1.pushed, 0); assert.strictEqual(r1.errors.length, 2); assert.strictEqual(R.files.size, 0);
  R.fail = 'list'; await assert.rejects(() => sync(A, R), /sem rede/);
  R.fail = null; const r2 = await sync(A, R); assert.strictEqual(r2.pushed, 2); assert.strictEqual(R.files.size, 2);
});

test('nomes hostis ou estranhos na pasta remota são ignorados', async () => {
  const names = ['maps/../../x.mom', 'maps/a.0000000000001.0123456789abcdef.mom', 'maps/a b.1.2.mom', 'maps/ok.1.mom', 'x/maps/a.0000000000001.0123456789abcdef.mom', 'maps/.tmp'];
  const p = parseListing(names); assert.deepStrictEqual([...p.keys()], ['a']);
});

test('parar no meio (shouldStop) deixa tudo consistente', async () => {
  const A = device(), R = new MemRemote(); addMap(A, 'a'); addMap(A, 'b'); addMap(A, 'c');
  let n = 0; const r = await sync(A, R, { shouldStop: () => n++ >= 1 }); assert.strictEqual(r.pushed, 1);
  const r2 = await sync(A, R); assert.deepStrictEqual([r2.pushed, r2.same], [2, 1]);
});

test('os testes de pasta: provedor por pasta (Drive para computador etc.) — atômico, só em maps/, rejeita nomes ruins', async () => {
  const dir = tmp(), A = device(), B = device('2026-10-21T08:00:00.000Z'); const id = addMap(A, 'Direito');
  const F = new FolderRemote(dir);
  await sync(A, F); const files = fs.readdirSync(path.join(dir, 'maps')); assert.strictEqual(files.length, 1); assert.ok(!files.some((f) => /tmp|teste/.test(f)));
  fs.writeFileSync(path.join(dir, 'maps', 'conflito (1).mom'), 'lixo'); fs.writeFileSync(path.join(dir, 'maps', '.x.tmp-1'), 'lixo');   // restos de outros programas
  const rb = await sync(B, new FolderRemote(dir)); assert.deepStrictEqual([rb.pulled, rb.errors.length], [1, 0]); same(A, B, id);
  await assert.rejects(() => F.read('../x'), /inválido/); await assert.rejects(() => F.write('maps/../x', Buffer.from('a')), /inválido/);
  assert.throws(() => new FolderRemote(path.join(dir, 'nao-existe')).check(), /não existe/);
  await assert.rejects(() => new FolderRemote(path.join(dir, 'nao-existe')).list(), /não existe/);
  assert.ok(!fs.existsSync(path.join(dir, 'nao-existe')), 'não cria a pasta-raiz sozinha');
  assert.throws(() => new FolderRemote(''), /Escolha/);
});

test('mapa grande e muitos mapas: sincroniza e a 2ª rodada não relê tudo (cache por revisão)', async () => {
  const A = device(), R = new MemRemote(); for (let i = 0; i < 60; i++) addMap(A, 'Mapa ' + i);
  const t0 = Date.now(); const r1 = await sync(A, R); assert.strictEqual(r1.pushed, 60);
  let loads = 0; const orig = A.lib.loadMap.bind(A.lib); A.lib.loadMap = (...a) => { loads++; return orig(...a); };
  const r2 = await sync(A, R); assert.strictEqual(r2.same, 60); assert.strictEqual(loads, 0, 'sem reler os mapas se nada mudou');
  assert.ok(Date.now() - t0 < 20000);
});

test('hashOf ignora só o vínculo com a biblioteca/datas internas: mesmo conteúdo → mesmo hash; conteúdo diferente → hash diferente', () => {
  const a = concurso().m, b = readMom(writeMom(a)); assert.strictEqual(hashOf(a), hashOf(b)); b.root.title = 'x'; assert.notStrictEqual(hashOf(a), hashOf(b));
});

test('mapa aberto com alterações (busy) não é trocado por baixo; é sincronizado depois', async () => {
  const A = device(), B = device('2026-10-21T08:00:00.000Z'), R = new MemRemote(); const id = addMap(A, 'M');
  await sync(A, R); await sync(B, R);
  edit(A, id, (m) => m.update(m.root.id, { title: 'do PC' })); await sync(A, R);
  const rb = await sync(B, R, { busy: new Set([id]) }); assert.strictEqual(rb.pulled, 0); assert.match(rb.items[0].status, /adiado/); assert.notStrictEqual(B.lib.loadMap(id).root.title, 'do PC');
  const rb2 = await sync(B, R); assert.strictEqual(rb2.pulled, 1); assert.strictEqual(B.lib.loadMap(id).root.title, 'do PC');
});
