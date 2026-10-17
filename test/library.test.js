'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AdmZip = require('adm-zip');
const { openLibrary, canonical, sha256 } = require('../core/library');
const { MindMap, createNode } = require('../core/model');
const { readMom, writeMom } = require('../core/mom');
const { fromCsv, csvTemplate } = require('../core/csv');
const S = require('../core/study');
const { concurso, TODAY } = require('./fixtures');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'mc-lib-'));
const clock = (start = '2026-10-20T10:00:00.000Z') => { let t = Date.parse(start); const f = () => new Date(t).toISOString(); f.add = (ms) => { t += ms; }; return f; };
const find = (m, title) => { let r; m.walk((n) => { if (n.title === title) r = n; }); return r; };
const rich = () => {                         // mapa com TUDO: estudo, notas, marcadores, estilo, relações, prova, recolhido, campos extras
  const m = concurso().m;
  const a = find(m, 'Legalidade'), b = find(m, 'Licitações');
  m.update(a.id, { notes: 'Regra [[Licitações]] **importante**\ncom “aspas” e 😀 acentuação ção', progress: 80, style: { fill: '#c0392b', shape: 'rect', bold: true } });
  m.toggleMarker(a.id, 'star'); b.collapsed = true; b.customField = { x: [1, 2, { y: null }] };
  m.addRelation(a.id, b.id, 'depende de'); m.setExam({ name: 'TRF 2026', date: '2026-11-29' });
  m.mutateStudy(a.id, (s) => S.addQuestions(S.addTime(S.reviewed(s, { today: TODAY, ok: true }), TODAY, 45), 20, 15, TODAY));
  return m;
};

test('esquema: cria, versiona (user_version) e passa na verificação de integridade; abrir de novo não perde nada', () => {
  const dir = tmp(), f = path.join(dir, 'lib', 'biblioteca.db');
  const lib = openLibrary(f); assert.deepEqual(lib.integrityCheck(), ['ok']);
  assert.equal(lib.db.prepare('PRAGMA user_version').get().user_version, 2); assert.equal(lib.db.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);
  const id = lib.saveMap(rich()); lib.close();
  const again = openLibrary(f); assert.equal(again.listMaps().length, 1); assert.equal(again.loadMap(id).root.title, 'Concurso TRF 2026'); again.close();
});

test('ida e volta SEM PERDA: estudo, notas Unicode, marcadores, estilo, relações, prova, recolhido e campos extras', () => {
  const lib = openLibrary(':memory:'); const m = rich(); const before = canonical(m);
  const id = lib.saveMap(m); const back = lib.loadMap(id);
  assert.equal(canonical(back), before); assert.equal(back.meta.libId, id);
  assert.equal(find(back, 'Licitações').customField.x[2].y, null); assert.equal(find(back, 'Legalidade').notes.includes('😀'), true);
  assert.deepEqual(back.meta.relations, m.meta.relations); assert.deepEqual(back.meta.exam, { name: 'TRF 2026', date: '2026-11-29' });
  assert.deepEqual(find(back, 'Legalidade').study, find(m, 'Legalidade').study);
  assert.equal(writeMom(back).length > 0, true);
});

test('a ordem dos irmãos e a hierarquia são preservadas, inclusive depois de reordenar e mover', () => {
  const lib = openLibrary(':memory:'); const m = rich();
  const lp = find(m, 'Língua Portuguesa'); m.moveSibling(lp.children[2].id, -1); m.moveSibling(lp.children[2].id, -1);
  const id = lib.saveMap(m); assert.deepEqual(lib.loadMap(id).root.children[0].children.map((c) => c.title), lp.children.map((c) => c.title));
  m.indent(find(m, 'Redes').id); lib.saveMap(m); assert.equal(canonical(lib.loadMap(id)), canonical(m));
});

test('regravar substitui (sem acumular tópicos antigos), incrementa a revisão e detecta conflito', () => {
  const lib = openLibrary(':memory:'); const m = rich(); const id = lib.saveMap(m);
  const n0 = lib.db.prepare('SELECT COUNT(*) c FROM topics').get().c;
  m.removeMany([find(m, 'Redes').id]); lib.saveMap(m);
  assert.equal(lib.db.prepare('SELECT COUNT(*) c FROM topics').get().c, n0 - 1); assert.equal(lib.listMaps()[0].rev, 1);
  assert.throws(() => lib.saveMap(m, { expectRev: 0 }), /Conflito/); lib.saveMap(m, { expectRev: 1 }); assert.equal(lib.listMaps()[0].rev, 2);
  const logs = lib.db.prepare('SELECT COUNT(*) c FROM study_log').get().c; lib.saveMap(m); assert.equal(lib.db.prepare('SELECT COUNT(*) c FROM study_log').get().c, logs, 'tabelas derivadas refeitas, sem duplicar'); assert.ok(logs > 0);
  assert.equal(id, m.meta.libId);
});

test('transação: se a gravação falha no meio (tópico repetido), o mapa anterior continua intacto', () => {
  const lib = openLibrary(':memory:'); const m = rich(); const id = lib.saveMap(m); const before = canonical(lib.loadMap(id));
  const n0 = lib.db.prepare('SELECT COUNT(*) c FROM topics').get().c; const bad = lib.loadMap(id); bad.root.children[0].children.push({ ...bad.root.children[1].children[0] });   // id repetido
  assert.throws(() => lib.saveMap(bad), /repetido/); assert.equal(canonical(lib.loadMap(id)), before); assert.equal(lib.db.prepare('SELECT COUNT(*) c FROM topics').get().c, n0);
  assert.equal(lib._depth, 0, 'sem transação pendurada'); lib.saveMap(m);
});

test('consultas SQL batem com o cálculo do aplicativo: revisões vencidas, tempo e questões por dia, busca', () => {
  const lib = openLibrary(':memory:'); const m = concurso().m; const id = lib.saveMap(m);
  const sum = S.summary(m, { today: TODAY });
  const due = lib.dueTopics(TODAY); assert.equal(due.length, sum.due.length); assert.deepEqual(due.map((d) => d.title).sort(), sum.due.map((d) => d.node ? d.node.title : d.title).sort());
  assert.ok(due.every((d) => d.next <= TODAY) && due.every((d, i) => i === 0 || due[i - 1].next <= d.next));
  let minutes = 0; m.walk((n) => { minutes += S.totalMinutes(n.study); });
  assert.equal(lib.minutesByDay('2000-01-01', '2100-01-01').reduce((a, r) => a + r.minutes, 0), minutes);
  let qd = 0, qc = 0; m.walk((n) => { if (n.study) for (const v of Object.values(S.normalizeStudy(n.study).qlog)) { qd += v.done; qc += v.correct; } });
  const q = lib.questionsByDay('2000-01-01', '2100-01-01'); assert.deepEqual([q.reduce((a, r) => a + r.done, 0), q.reduce((a, r) => a + r.correct, 0)], [qd, qc]);
  assert.equal(lib.searchTopics('licit')[0].title, 'Licitações'); assert.equal(lib.searchTopics('100%').length, 0, '% e _ são literais'); assert.equal(lib.searchTopics("x'; DROP TABLE topics;--").length, 0);
  assert.equal(lib.listMaps({ today: TODAY })[0].due, sum.due.length); assert.ok(id);
});

test('lixeira: some da lista, volta inteira, e só some de vez ao esvaziar após o prazo', () => {
  const t = clock(); const lib = openLibrary(':memory:', { now: t }); const id = lib.saveMap(rich());
  assert.equal(lib.trashMap(id), true); assert.equal(lib.listMaps().length, 0); assert.equal(lib.listMaps({ trashed: true }).length, 1); assert.throws(() => lib.loadMap(id), /não encontrado/);
  assert.equal(lib.dueTopics(TODAY).length, 0, 'mapa na lixeira não aparece nas consultas');
  assert.equal(lib.restoreMap(id), true); assert.equal(canonical(lib.loadMap(id)), canonical(rich().constructor === MindMap ? lib.loadMap(id) : null));
  lib.trashMap(id); assert.equal(lib.emptyTrash(30), 0); t.add(31 * 86400000); assert.equal(lib.emptyTrash(30), 1);
  assert.equal(lib.db.prepare('SELECT COUNT(*) c FROM topics').get().c, 0, 'cascata apaga tópicos/estudo/relações');
});

test('versões: instantâneo automático ao regravar (com intervalo mínimo), limite de 30 e restauração como mapa NOVO', () => {
  const t = clock(); const lib = openLibrary(':memory:', { now: t }); const m = rich(); const id = lib.saveMap(m);
  assert.equal(lib.listSnapshots(id).length, 0, 'primeira gravação: nada a guardar');
  m.root.title = 'v2'; t.add(1000); lib.saveMap(m); assert.equal(lib.listSnapshots(id).length, 1);
  m.root.title = 'v3'; t.add(1000); lib.saveMap(m); assert.equal(lib.listSnapshots(id).length, 1, 'dentro do intervalo não duplica');
  t.add(11 * 60000); m.root.title = 'v4'; lib.saveMap(m); assert.equal(lib.listSnapshots(id).length, 2);
  const snap = lib.listSnapshots(id).at(-1).id; const newId = lib.restoreSnapshot(snap);
  assert.notEqual(newId, id); assert.equal(lib.loadMap(newId).root.title, 'Concurso TRF 2026'); assert.equal(lib.loadMap(id).root.title, 'v4', 'o atual não foi tocado');
  for (let i = 0; i < 40; i++) lib.snapshot(id, 'manual'); assert.equal(lib.listSnapshots(id).length, 30);
});

test('importar .mom: verificado, sem tocar o arquivo de origem, duplicado é reconhecido, lixo vira erro sem derrubar o resto', () => {
  const dir = tmp(); const a = path.join(dir, 'Direito ç.mom'), b = path.join(dir, 'sub', 'Outro.mom'), bad = path.join(dir, 'ruim.mom');
  fs.mkdirSync(path.dirname(b)); writeMom(rich(), a); writeMom(fromCsv(csvTemplate()).map, b); fs.writeFileSync(bad, 'isto não é um zip');
  const hashA = sha256(fs.readFileSync(a)), mt = fs.statSync(a).mtimeMs;
  const lib = openLibrary(':memory:'); const r = lib.importFolder(dir);
  assert.deepEqual([r.files, r.imported, r.duplicated, r.failed], [3, 2, 0, 1]); assert.match(r.items.find((i) => i.status === 'erro').error, /./);
  assert.equal(sha256(fs.readFileSync(a)), hashA); assert.equal(fs.statSync(a).mtimeMs, mt, 'origem intacta');
  const r2 = lib.importFolder(dir); assert.deepEqual([r2.imported, r2.duplicated, r2.failed], [0, 2, 1], 'reexecutar não duplica');
  assert.equal(lib.listMaps().length, 2); const id = r.items.find((i) => i.file === a).id;
  assert.equal(canonical(lib.loadMap(id)), canonical(readMom(fs.readFileSync(a))));
  const out = path.join(dir, 'exportado.mom'); lib.exportMom(id, out); assert.equal(canonical(readMom(fs.readFileSync(out))), canonical(readMom(fs.readFileSync(a))));
});

test('pacote portátil: exporta tudo, importa em OUTRA biblioteca idêntico; reimportar não duplica', () => {
  const dir = tmp(); const A = openLibrary(':memory:'); const ida = A.saveMap(rich()); const idb = A.saveMap(fromCsv(csvTemplate()).map);
  const pk = path.join(dir, 'meus estudos ç.mcpack'); const e = A.exportPackage(pk); assert.equal(e.maps, 2);
  const man = JSON.parse(new AdmZip(pk).readAsText('manifest.json')); assert.equal(man.format, 'mindcraft-library'); assert.ok(man.maps.every((x) => /^[0-9a-f]{64}$/.test(x.sha256)));
  const B = openLibrary(':memory:'); const r = B.importPackage(pk); assert.deepEqual([r.imported, r.skipped, r.copied], [2, 0, 0]);
  for (const id of [ida, idb]) assert.equal(canonical(B.loadMap(id)), canonical(readMom(writeMom(A.loadMap(id)))), 'mapa idêntico no outro computador');
  const r2 = B.importPackage(pk); assert.deepEqual([r2.imported, r2.skipped], [0, 2]); assert.equal(B.listMaps().length, 2);
  const only = A.exportPackage(null, { mapIds: [ida] }); assert.equal(only.maps, 1);
});

test('pacote: conflito (mesmo mapa editado dos dois lados) vira CÓPIA por padrão; "replace" guarda uma versão antes; "skip" respeita o local', () => {
  const A = openLibrary(':memory:'); const m = rich(); const id = A.saveMap(m); const pkg = A.exportPackage(null).buffer;
  const B = openLibrary(':memory:'); B.importPackage(pkg);
  const local = B.loadMap(id); local.root.title = 'Editado no PC 2'; B.saveMap(local, { snapshot: false });
  let r = B.importPackage(pkg); assert.equal(r.copied, 1); assert.equal(B.listMaps().length, 2); assert.equal(B.loadMap(id).root.title, 'Editado no PC 2', 'o local não foi sobrescrito');
  assert.match(B.listMaps().map((x) => x.title).join('|'), /\(importado\)/);
  r = B.importPackage(pkg, { onConflict: 'skip' }); assert.equal(r.skipped, 1); assert.equal(B.listMaps().length, 2);
  r = B.importPackage(pkg, { onConflict: 'replace' }); assert.equal(r.replaced, 1); assert.equal(B.loadMap(id).root.title, 'Concurso TRF 2026'); assert.equal(B.listSnapshots(id).some((s) => /antes de importar/.test(s.reason)), true, 'versão local guardada');
  B.trashMap(id); r = B.importPackage(pkg); assert.equal(r.imported, 1, 'igual mas na lixeira: restaura'); assert.equal(B.listMaps().some((x) => x.id === id), true);
});

test('pacote: validações — não é pacote, versão futura, hash adulterado, nome de arquivo suspeito, zip quebrado; nada é gravado', () => {
  const A = openLibrary(':memory:'); A.saveMap(rich()); const good = A.exportPackage(null).buffer; const B = openLibrary(':memory:');
  const mk = (edit) => { const z = new AdmZip(good); const man = JSON.parse(z.readAsText('manifest.json')); edit(man, z); z.updateFile('manifest.json', Buffer.from(JSON.stringify(man))); return z.toBuffer(); };
  assert.throws(() => B.importPackage(Buffer.from('lixo')), /./);
  assert.throws(() => B.importPackage(writeMom(rich())), /manifest/);
  assert.throws(() => B.importPackage(mk((m) => { m.format = 'outro'; })), /não é um pacote/);
  assert.throws(() => B.importPackage(mk((m) => { m.version = 9; })), /mais nova/);
  assert.throws(() => B.importPackage(mk((m) => { m.maps[0].sha256 = '0'.repeat(64); })), /corrompido/);
  assert.throws(() => B.importPackage(mk((m) => { m.maps[0].file = '../../evil.mom'; })), /suspeito/);
  assert.throws(() => B.importPackage(mk((m, z) => { const f = m.maps[0].file; z.updateFile(f, Buffer.from('adulterado')); })), /corrompido/);
  assert.equal(B.listMaps().length, 0, 'nenhuma validação falha deixa lixo no banco');
});

test('importação atômica: se UM mapa do pacote falha na verificação, nenhum é gravado', () => {
  const A = openLibrary(':memory:'); A.saveMap(rich()); A.saveMap(fromCsv(csvTemplate()).map); const B = openLibrary(':memory:');
  const orig = B.saveMap.bind(B); let n = 0; B.saveMap = (...a) => { if (++n === 2) throw new Error('falha simulada'); return orig(...a); };
  assert.throws(() => B.importPackage(A.exportPackage(null).buffer), /falha simulada/); assert.equal(B.listMaps().length, 0);
});

test('backup do banco inteiro (VACUUM INTO) abre como biblioteca válida; biblioteca de versão futura é recusada', () => {
  const dir = tmp(), f = path.join(dir, 'a.db'); const lib = openLibrary(f); const id = lib.saveMap(rich());
  const bk = path.join(dir, 'backup.db'); lib.backupTo(bk); lib.close();
  const b = openLibrary(bk); assert.equal(canonical(b.loadMap(id)), canonical(rich().constructor ? b.loadMap(id) : null)); assert.deepEqual(b.integrityCheck(), ['ok']); b.close();
  const { DatabaseSync } = require('node:sqlite'); const d = new DatabaseSync(f); d.exec('PRAGMA user_version = 99'); d.close();
  assert.throws(() => openLibrary(f), /mais nova/);
});

test('verify: gravação verificada passa; banco danificado é recusado na abertura; purgeMap só exclui o que está na lixeira', () => {
  const dir = tmp(), f = path.join(dir, 'x.db'); const lib = openLibrary(f, { check: true }); const m = rich(); const id = lib.saveMap(m, { verify: true });
  assert.equal(lib.purgeMap(id), false, 'mapa ativo não é excluído'); lib.trashMap(id); assert.equal(lib.purgeMap(id), true); assert.equal(lib.listMaps({ trashed: true }).length, 0);
  lib.saveMap(m, { verify: true }); lib.close();
  const bytes = fs.readFileSync(f); fs.writeFileSync(f, Buffer.concat([bytes.subarray(0, 4096), Buffer.alloc(4096, 7), bytes.subarray(8192)]));
  assert.throws(() => openLibrary(f, { check: true }), /danificado|malformed|not a database|corrupt/i);
  fs.writeFileSync(f, 'isto não é um banco sqlite, é só texto.'.repeat(200)); assert.throws(() => openLibrary(f, { check: true }), /./);
});

test('desempenho: mapa de 5 000 tópicos grava e relê em poucos segundos, sem perda', () => {
  const m = new MindMap(createNode('Grande')); for (let i = 0; i < 50; i++) { const d = m.addChild(m.root.id, 'D' + i); for (let j = 0; j < 99; j++) { const t = m.addChild(d.id, `T${i}.${j}`); if (j % 7 === 0) m.mutateStudy(t.id, (s) => S.addTime(s, TODAY, 5)); } }
  const lib = openLibrary(':memory:'); const t0 = Date.now(); const id = lib.saveMap(m); const back = lib.loadMap(id); const dt = Date.now() - t0;
  assert.equal(canonical(back), canonical(m)); assert.ok(dt < 4000, `levou ${dt} ms`); assert.equal(lib.db.prepare('SELECT COUNT(*) c FROM topics').get().c, 1 + 50 + 4950);
});

test('CLI: migrar → listar → exportar → importar em outra biblioteca → backup (processos reais)', () => {
  const { spawnSync } = require('child_process'); const dir = tmp(); const bin = path.join(__dirname, '..', 'bin', 'mindcraft-library.js');
  writeMom(rich(), path.join(dir, 'a.mom')); fs.writeFileSync(path.join(dir, 'ruim.mom'), 'x');
  const run = (...a) => spawnSync(process.execPath, [bin, ...a], { encoding: 'utf8' });
  let r = run('migrar', dir, path.join(dir, 'lib1.db')); assert.equal(r.status, 2, r.stderr); assert.match(r.stdout, /1 importado\(s\).*1 com erro/s); assert.match(r.stdout, /Originais não foram alterados/);
  r = run('listar', path.join(dir, 'lib1.db')); assert.match(r.stdout, /Concurso TRF 2026.*18 tópicos/);
  r = run('exportar', path.join(dir, 'lib1.db'), path.join(dir, 'p.mcpack')); assert.equal(r.status, 0, r.stderr); assert.ok(fs.statSync(path.join(dir, 'p.mcpack')).size > 100);
  r = run('importar', path.join(dir, 'lib2.db'), path.join(dir, 'p.mcpack')); assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /1 novo/);
  r = run('importar', path.join(dir, 'lib2.db'), path.join(dir, 'p.mcpack')); assert.match(r.stdout, /1 ignorado/);
  r = run('backup', path.join(dir, 'lib2.db'), path.join(dir, 'b.db')); assert.equal(r.status, 0, r.stderr); assert.ok(fs.existsSync(path.join(dir, 'b.db')));
  assert.equal(run('importar', path.join(dir, 'lib3.db'), path.join(dir, 'a.mom')).status, 1, 'arquivo que não é pacote: erro claro');
  assert.equal(run('xyz').status, 1);
});
