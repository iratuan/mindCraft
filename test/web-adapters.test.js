'use strict';
// Adaptadores da versão web/Android (platform/web): SHA-256, zip, SQLite em WebAssembly, fs virtual e path.
// Cada um é comparado com o equivalente real do Node: o que importa é dar o MESMO resultado.
const test = require('node:test');
const assert = require('node:assert/strict');
const nodeCrypto = require('node:crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const RealZip = require('adm-zip');

const W = (f) => require('../platform/web/' + f);
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'mc-web-'));

// ---------- SHA-256 ----------
test('sha256: vetores conhecidos (vazio, abc, 1 milhão de "a") e igualdade com o crypto do Node em entradas aleatórias', () => {
  const { createHash } = W('crypto');
  assert.equal(createHash('sha256').update('').digest('hex'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(createHash('sha256').update('abc').digest('hex'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(createHash('sha256').update(Buffer.alloc(1000000, 'a')).digest('hex'), 'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0');
  let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  for (let n = 0; n <= 300; n++) {                                  // todos os tamanhos em volta dos limites de bloco (55/56/63/64/119/120…)
    const b = Buffer.from(Array.from({ length: n }, () => Math.floor(rnd() * 256)));
    assert.equal(createHash('sha256').update(b).digest('hex'), nodeCrypto.createHash('sha256').update(b).digest('hex'), 'tamanho ' + n);
  }
  for (let i = 0; i < 40; i++) {                                    // atualizações em pedaços de tamanhos variados
    const b = Buffer.from(Array.from({ length: Math.floor(rnd() * 5000) }, () => Math.floor(rnd() * 256))), h = createHash('sha256'); let o = 0;
    while (o < b.length) { const k = 1 + Math.floor(rnd() * 200); h.update(b.subarray(o, o + k)); o += k; }
    assert.equal(h.digest('hex'), nodeCrypto.createHash('sha256').update(b).digest('hex'));
  }
  assert.equal(createHash('sha256').update('ação — çãõ 日本語 🙂').digest('hex'), nodeCrypto.createHash('sha256').update('ação — çãõ 日本語 🙂').digest('hex'), 'UTF-8');
});

test('sha1: vetores conhecidos e igualdade com o crypto do Node em todos os tamanhos (usado só para nomear pastas de backup)', () => {
  const { createHash } = W('crypto');
  assert.equal(createHash('sha1').update('abc').digest('hex'), 'a9993e364706816aba3e25717850c26c9cd0d89d'); assert.equal(createHash('sha1').update('').digest('hex'), 'da39a3ee5e6b4b0d3255bfef95601890afd80709');
  let seed = 11; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  for (let n = 0; n <= 300; n++) { const b = Buffer.from(Array.from({ length: n }, () => Math.floor(rnd() * 256))); assert.equal(createHash('sha1').update(b).digest('hex'), nodeCrypto.createHash('sha1').update(b).digest('hex'), 'tamanho ' + n); }
  assert.equal(createHash('sha1').update('C:\\Users\\Ação\\mapa.mom'.toLowerCase()).digest('hex').slice(0, 12), nodeCrypto.createHash('sha1').update('C:\\Users\\Ação\\mapa.mom'.toLowerCase()).digest('hex').slice(0, 12));
});

test('sha256: digest só uma vez, algoritmo desconhecido recusado; randomBytes devolve bytes distintos do tamanho pedido', () => {
  const { createHash, randomBytes } = W('crypto'); const h = createHash('sha256'); h.update('x'); h.digest('hex');
  assert.throws(() => h.digest('hex'), /já calculado/); assert.throws(() => h.update('y'), /já calculado/); assert.throws(() => createHash('md5'), /sha256 e sha1/);
  const a = randomBytes(16), b = randomBytes(16); assert.equal(a.length, 16); assert.notEqual(a.toString('hex'), b.toString('hex')); assert.equal(randomBytes(70000).length, 70000);
});

// ---------- zip ----------
test('zip: lê zips gerados pelo adm-zip real e gera zips que o adm-zip real lê (nos dois sentidos, com acentos e binários)', () => {
  const Shim = W('adm-zip');
  const bin = Buffer.from(Array.from({ length: 5000 }, (_, i) => (i * 7) % 256));
  const real = new RealZip(); real.addFile('a.json', Buffer.from('{"x":"ação"}')); real.addFile('pasta/b.bin', bin); real.addFile('vazio.txt', Buffer.alloc(0));
  const lido = new Shim(real.toBuffer());
  assert.equal(lido.getEntry('a.json').getData().toString('utf8'), '{"x":"ação"}'); assert.ok(lido.getEntry('pasta/b.bin').getData().equals(bin)); assert.equal(lido.getEntry('vazio.txt').getData().length, 0);
  assert.equal(lido.getEntry('nao-existe'), null); assert.deepEqual(lido.getEntries().map((e) => e.entryName), ['a.json', 'pasta/b.bin', 'vazio.txt']);
  const novo = new Shim(); novo.addFile('x/y.txt', Buffer.from('olá')); novo.addFile('z.bin', bin);
  const volta = new RealZip(novo.toBuffer()); assert.equal(volta.getEntry('x/y.txt').getData().toString(), 'olá'); assert.ok(volta.getEntry('z.bin').getData().equals(bin));
});

test('zip: header.size é o tamanho DESCOMPACTADO lido do diretório central (protege contra zip bomb sem descompactar); updateFile e entrada inexistente', () => {
  const Shim = W('adm-zip'); const real = new RealZip(); real.addFile('grande.txt', Buffer.alloc(50 * 1024 * 1024, 'a'));   // 50 MB que comprimem para ~50 KB
  const bytes = real.toBuffer(); assert.ok(bytes.length < 200000, 'compactado: ' + bytes.length);
  const t0 = Date.now(); const z = new Shim(bytes); const size = z.getEntry('grande.txt').header.size;
  assert.equal(size, 50 * 1024 * 1024); assert.ok(Date.now() - t0 < 1500, 'não descompactou só para saber o tamanho: ' + (Date.now() - t0) + ' ms');
  const m = new Shim(real.toBuffer()); assert.throws(() => m.updateFile('nada', Buffer.from('x')), /inexistente/);
  const u = new Shim(new RealZip().toBuffer()); u.addFile('a', Buffer.from('1')); u.updateFile('a', Buffer.from('22')); assert.equal(new Shim(u.toBuffer()).getEntry('a').getData().toString(), '22');
});

test('zip: lixo e arquivo cortado dão erro claro (não travam, não devolvem dados falsos); writeZip e leitura por caminho', () => {
  const Shim = W('adm-zip'); const ok = new RealZip(); ok.addFile('a', Buffer.from('conteudo longo '.repeat(100))); const b = ok.toBuffer();
  for (const bad of [Buffer.from('isto não é um zip'), b.subarray(0, 20), b.subarray(0, b.length - 10), Buffer.alloc(0)]) assert.throws(() => new Shim(bad), /zip inválido|Invalid|invalid|inválido/i);
  const dir = tmp(), f = path.join(dir, 'x.zip'); const z = new Shim(); z.addFile('k', Buffer.from('v')); z.writeZip(f);
  assert.equal(new RealZip(f).getEntry('k').getData().toString(), 'v'); assert.equal(new Shim(f).getEntry('k').getData().toString(), 'v');
});

// ---------- SQLite em WebAssembly ----------
let SQL; test.before(async () => { SQL = await require('sql.js')(); W('sqlite').setSql(SQL); });
const open = (file) => new (W('sqlite').DatabaseSync)(file);

test('sqlite: criar, inserir (changes/lastInsertRowid), consultar (get/all/undefined), BLOB, acentos e valores inválidos recusados', () => {
  const db = open(':memory:'); db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY, nome TEXT, dados BLOB, n REAL)');
  const r = db.prepare('INSERT INTO t(nome, dados, n) VALUES (?,?,?)').run('Língua Portuguesa — ção', new Uint8Array([0, 1, 255]), 3.5);
  assert.deepEqual(r, { changes: 1, lastInsertRowid: 1 }); db.prepare('INSERT INTO t(nome) VALUES (?)').run('b');
  const row = db.prepare('SELECT * FROM t WHERE id = ?').get(1); assert.equal(row.nome, 'Língua Portuguesa — ção'); assert.deepEqual([...row.dados], [0, 1, 255]); assert.equal(row.n, 3.5);
  assert.equal(db.prepare('SELECT * FROM t WHERE id = 99').get(), undefined); assert.equal(db.prepare('SELECT * FROM t').all().length, 2);
  assert.equal(db.prepare('UPDATE t SET nome = ? WHERE id > 0').run('x').changes, 2); assert.equal(db.prepare('DELETE FROM t WHERE id = ?').run(1).changes, 1);
  assert.throws(() => db.prepare('INSERT INTO t(nome) VALUES (?)').run(undefined), /indefinido/); assert.throws(() => db.prepare('INSERT INTO t(nome) VALUES (?)').run(true), /Booleano/);
  assert.throws(() => db.exec('SELECT * FROM nao_existe'), /no such table/); assert.equal(db.prepare('SELECT 1 AS x').get().x, 1); db.close();
});

test('sqlite: transação confirmada é gravada NO DISCO na hora; transação aberta/revertida não toca o disco (fechar de repente não perde o confirmado)', () => {
  const f = path.join(tmp(), 'sub', 'b.db'); const db = open(f); db.exec('CREATE TABLE t (v TEXT)');
  const disk = () => { const d = open(f); try { return d.prepare('SELECT v FROM t ORDER BY v').all().map((x) => x.v); } finally { d.db.close(); } };   // outra "instância" lendo só o que está no arquivo
  db.exec('BEGIN IMMEDIATE'); db.prepare('INSERT INTO t VALUES (?)').run('a'); assert.deepEqual(disk(), [], 'ainda não confirmado: disco intacto');
  db.exec('COMMIT'); assert.deepEqual(disk(), ['a'], 'confirmado: no disco');
  db.exec('BEGIN IMMEDIATE'); db.prepare('INSERT INTO t VALUES (?)').run('b'); db.exec('ROLLBACK'); assert.deepEqual(disk(), ['a'], 'revertido: nada gravado');
  db.exec('BEGIN IMMEDIATE'); db.exec('SAVEPOINT s1'); db.prepare('INSERT INTO t VALUES (?)').run('c'); db.exec('ROLLBACK TO s1; RELEASE s1'); db.prepare('INSERT INTO t VALUES (?)').run('d'); db.exec('COMMIT'); assert.deepEqual(disk(), ['a', 'd'], 'SAVEPOINT parcial');
  db.prepare('INSERT INTO t VALUES (?)').run('e'); assert.deepEqual(disk(), ['a', 'd', 'e'], 'instrução solta (autocommit) também é gravada');
  assert.deepEqual(fs.readdirSync(path.dirname(f)), ['b.db'], 'sem arquivo temporário sobrando'); db.close();
});

test('sqlite: as regras da sessão (foreign_keys) sobrevivem às gravações em disco; chave estrangeira com ON DELETE CASCADE funciona', () => {
  const f = path.join(tmp(), 'b.db'); const db = open(f); db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  db.exec('CREATE TABLE p (id TEXT PRIMARY KEY); CREATE TABLE c (pid TEXT REFERENCES p(id) ON DELETE CASCADE, v INTEGER)');
  for (let i = 0; i < 3; i++) { db.exec('BEGIN IMMEDIATE'); db.prepare('INSERT INTO p VALUES (?)').run('p' + i); db.exec('COMMIT'); }      // várias gravações em disco seguidas
  assert.throws(() => db.prepare('INSERT INTO c VALUES (?, ?)').run('inexistente', 1), /FOREIGN KEY/);
  db.prepare('INSERT INTO c VALUES (?, ?)').run('p1', 1); db.prepare('DELETE FROM p WHERE id = ?').run('p1'); assert.equal(db.prepare('SELECT COUNT(*) AS n FROM c').get().n, 0, 'cascata');
  assert.equal(db.prepare('PRAGMA foreign_keys').get().foreign_keys, 1); db.close();
});

test('sqlite: reabrir lê o que foi gravado; PRAGMA user_version e quick_check; arquivo que não é banco é recusado; VACUUM INTO gera cópia válida', () => {
  const dir = tmp(), f = path.join(dir, 'b.db'); let db = open(f); db.exec('CREATE TABLE t (v TEXT); PRAGMA user_version = 7'); db.prepare('INSERT INTO t VALUES (?)').run('ficou'); db.close();
  db = open(f); assert.equal(db.prepare('SELECT v FROM t').get().v, 'ficou'); assert.equal(db.prepare('PRAGMA user_version').get().user_version, 7); assert.deepEqual(db.prepare('PRAGMA quick_check').all().map((x) => x.quick_check), ['ok']);
  const cp = path.join(dir, 'copia.db'); db.prepare('VACUUM INTO ?').run(cp); db.prepare('INSERT INTO t VALUES (?)').run('depois'); const c = open(cp); assert.deepEqual(c.prepare('SELECT v FROM t').all().map((x) => x.v), ['ficou']); c.close();
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM t').get().n, 2, 'o banco original segue funcionando após o backup'); db.close();
  const lixo = path.join(dir, 'lixo.db'); fs.writeFileSync(lixo, 'isto não é um banco de dados SQLite, é só texto qualquer com mais de cem bytes '.repeat(5)); assert.throws(() => open(lixo).prepare('PRAGMA quick_check').all(), /not a database|file is not/i);   // como o node:sqlite real: abre, falha no 1º uso
  fs.writeFileSync(path.join(dir, 'vazio.db'), ''); const e = open(path.join(dir, 'vazio.db')); e.exec('CREATE TABLE x (a)'); e.close();     // arquivo vazio = banco novo
});

// ---------- fs virtual e path ----------
test('fs virtual: gravar/ler/renomear/apagar/listar, erros ENOENT, texto e bytes, snapshot e restore', () => {
  const vfs = W('fs'); vfs.vfs.clear();
  assert.throws(() => vfs.writeFileSync('/pasta/a.txt', 'x'), /ENOENT/); vfs.mkdirSync('/pasta/sub', { recursive: true }); vfs.writeFileSync('/pasta/a.txt', 'olá'); vfs.writeFileSync('/pasta/sub/b.bin', new Uint8Array([1, 2, 3]));
  assert.equal(vfs.readFileSync('/pasta/a.txt', 'utf8'), 'olá'); assert.deepEqual([...vfs.readFileSync('/pasta/sub/b.bin')], [1, 2, 3]); assert.equal(vfs.existsSync('/pasta/sub'), true); assert.equal(vfs.existsSync('/nada'), false);
  assert.deepEqual(vfs.readdirSync('/pasta'), ['a.txt', 'sub']); assert.deepEqual(vfs.readdirSync('/pasta', { withFileTypes: true }).map((e) => [e.name, e.isDirectory()]), [['a.txt', false], ['sub', true]]);
  vfs.renameSync('/pasta/a.txt', '/pasta/c.txt'); assert.equal(vfs.existsSync('/pasta/a.txt'), false); assert.equal(vfs.statSync('/pasta/c.txt').size, 4);
  const snap = JSON.parse(JSON.stringify(vfs.vfs.snapshot())); vfs.rmSync('/pasta', { recursive: true }); assert.equal(vfs.existsSync('/pasta/c.txt'), false); assert.throws(() => vfs.readFileSync('/pasta/c.txt'), /ENOENT/);
  vfs.vfs.restore(snap); assert.equal(vfs.readFileSync('/pasta/c.txt', 'utf8'), 'olá'); vfs.rmSync('/nao-existe', { force: true }); assert.throws(() => vfs.rmSync('/nao-existe'), /ENOENT/);
  let n = 0; const off = vfs.vfs.onChange(() => n++); vfs.writeFileSync('/pasta/d.txt', 'y'); assert.equal(n, 1); off(); vfs.writeFileSync('/pasta/e.txt', 'z'); assert.equal(n, 1); vfs.vfs.clear();
});

test('path web: join/resolve/dirname/basename/extname iguais ao path posix do Node nos casos que o núcleo usa', () => {
  const w = W('path'), p = path.posix;
  for (const args of [['/a', 'b', 'c.mom'], ['/a/', '/b'], ['a', '..', 'b'], ['/a/b', '../c'], ['/']]) { assert.equal(w.join(...args), p.join(...args), 'join ' + args); }
  for (const x of ['/a/b/c.mom', '/a/b/', '/a', '/', '/a/./b/../c']) { assert.equal(w.dirname(x), p.dirname(x), 'dirname ' + x); assert.equal(w.basename(x), p.basename(x), 'basename ' + x); assert.equal(w.extname(x), p.extname(x), 'extname ' + x); assert.equal(w.resolve(x), p.resolve(x), 'resolve ' + x); }
  assert.equal(w.basename('/a/mapa.mom', '.mom'), 'mapa'); assert.equal(w.resolve('rel/x'), '/rel/x');
});

test('fs virtual: copyFileSync e utimesSync (o backup antes de sobrescrever precisa deles)', () => {
  const vfsMod = require('../platform/web/fs.js');
  vfsMod.mkdirSync('/docs', { recursive: true }); vfsMod.mkdirSync('/userdata/backups', { recursive: true });
  vfsMod.writeFileSync('/docs/a.mom', new Uint8Array([1, 2, 3, 4]));
  vfsMod.copyFileSync('/docs/a.mom', '/docs/b.mom'); assert.deepStrictEqual([...vfsMod.readFileSync('/docs/b.mom')], [1, 2, 3, 4]);
  vfsMod.writeFileSync('/docs/a.mom', new Uint8Array([9])); assert.deepStrictEqual([...vfsMod.readFileSync('/docs/b.mom')], [1, 2, 3, 4], 'a cópia é independente');
  assert.throws(() => vfsMod.copyFileSync('/docs/nao-existe', '/docs/c.mom'), /ENOENT/); assert.throws(() => vfsMod.copyFileSync('/docs/a.mom', '/pasta-que-nao-existe/c.mom'), /ENOENT/);
  vfsMod.utimesSync('/docs/b.mom', new Date(2020, 0, 1), new Date(2020, 0, 2)); assert.strictEqual(vfsMod.statSync('/docs/b.mom').mtimeMs, new Date(2020, 0, 2).getTime());
  assert.throws(() => vfsMod.utimesSync('/docs/nao-existe', new Date(), new Date()), /ENOENT/);
});
