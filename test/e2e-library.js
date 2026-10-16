'use strict';
// Ponta a ponta da biblioteca SQLite integrada ao app: salvar/abrir, mover, versões, lixeira, importar/exportar, rascunho, rede entre mapas.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const start = require('./harness');
const { readMom, writeMom } = require('../core/mom');
const { openLibrary, canonical, sha256 } = require('../core/library');
const { csvTemplate, fromCsv } = require('../core/csv');
const { TODAY, d, concurso } = require('./fixtures');

(async () => {
  const c = await start('MindCraft e2e — biblioteca SQLite');
  const { js, wait, eq, ok, t, TMP, USERDATA } = c;
  const txt = (s) => js(`document.querySelector(${JSON.stringify(s)}).textContent`);
  const click = (s) => js(`document.querySelector(${JSON.stringify(s)}).click()`);
  const dbFile = path.join(USERDATA, 'biblioteca.db');
  const hash = (f) => sha256(fs.readFileSync(f));
  const rows = () => js(`[...document.querySelectorAll('#libList .lib-row')].map((r) => r.querySelector('b').textContent)`);
  const openModal = async (tab) => { await js(`dirty = false; ${tab ? `openLibraryModal('${tab}')` : `ipcRenderer.emit('menu', {}, 'lib')`}`); await c.waitFor(() => js(`!!document.querySelector('#libBox')`)); };
  const clickRow = (title, act) => js(`(() => { const r = [...document.querySelectorAll('#libList .lib-row')].find((x) => x.querySelector('b').textContent.startsWith(${JSON.stringify(title)})); r.querySelector('[data-act="${act}"]').click(); })()`);
  const fileMap = path.join(TMP, 'concurso lib.mom'); writeMom(concurso().m, fileMap);

  await t('o banco só é criado quando usado; mapas novos continuam indo para arquivo por padrão (nada muda para quem não usa)', async () => {
    eq(fs.existsSync(dbFile), false, 'sem biblioteca criada no arranque');
    await js(`dirty = false; newMap(); map.root.title = 'Padrão'; render()`); await js(`window.__dlg.save = ${JSON.stringify(path.join(TMP, 'padrao.mom'))}`);
    ok(await js('save(false)')); eq(await js('filePath'), path.join(TMP, 'padrao.mom')); eq(await js('!!map.meta.libId'), false); eq(fs.existsSync(dbFile), false);
    eq(JSON.parse(fs.readFileSync(path.join(USERDATA, 'config.json'), 'utf8')).lastKind, 'file');
  });

  await t('opção "mapas novos na biblioteca": Ctrl+S não pergunta onde salvar, grava no banco, relê para conferir e marca como "na biblioteca"', async () => {
    await js(`saveCfg({ newInLibrary: true }); dirty = false; newMap(); map.root.children = []; map.root.title = 'Direito Penal'; map.addChild(map.root.id, 'Crimes contra a pessoa'); render(); window.__dlg.save = null`);
    ok(await js('save(false)'), 'salvou sem diálogo'); eq(await js('filePath'), null); const id = await js('map.meta.libId'); ok(id && /^[0-9a-f]{32}$/.test(id), 'id ' + id);
    eq(await js('dirty'), false); ok((await txt('#status')).includes('na biblioteca'), await txt('#status'));
    eq(await js(`document.title.includes('•')`), false);
    const lib = openLibrary(dbFile); const m = lib.loadMap(id); eq(m.root.title, 'Direito Penal'); eq(m.root.children[0].title, 'Crimes contra a pessoa'); lib.close();
    eq(JSON.parse(fs.readFileSync(path.join(USERDATA, 'config.json'), 'utf8')).lastLib, id);
  });

  await t('editar e salvar de novo atualiza a MESMA entrada (sem duplicar); Salvar como… exporta uma cópia .mom e o mapa continua na biblioteca', async () => {
    const id = await js('map.meta.libId'); await js(`map.addChild(map.root.id, 'Crimes contra o patrimônio'); dirty = true; render()`); ok(await js('save(false)'));
    const lib = openLibrary(dbFile); eq(lib.listMaps().length, 1); eq(lib.loadMap(id).root.children.length, 2); lib.close();
    const cp = path.join(TMP, 'copia penal.mom'); await js(`window.__dlg.save = ${JSON.stringify(cp)}`); ok(await js('save(true)'));
    eq(readMom(fs.readFileSync(cp)).root.children.length, 2, 'cópia correta'); eq(await js('map.meta.libId'), id, 'continua na biblioteca'); eq(await js('filePath'), null);
    ok((await txt('#status')).includes('continua na biblioteca') || (await js('dirty')) === false);
  });

  await t('mover um arquivo .mom para a biblioteca: o ARQUIVO ORIGINAL NÃO É ALTERADO; salvar depois grava só no banco', async () => {
    const h0 = hash(fileMap), mt = fs.statSync(fileMap).mtimeMs;
    await js(`dirty = false; openPath(${JSON.stringify(fileMap)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(fileMap)}`));
    await js(`map.root.title = 'Concurso TRF (editado)'; dirty = true; render()`);
    ipcMoveOk: { ok(await js('moveToLibrary()'), 'moveu'); }
    eq(await js('filePath'), null); eq(await js('dirty'), false); const id = await js('map.meta.libId'); ok(id);
    eq(hash(fileMap), h0, 'o arquivo de origem não mudou'); eq(fs.statSync(fileMap).mtimeMs, mt);
    ok((await txt('#status')).includes('não foi alterado'), await txt('#status'));
    await js(`map.root.title = 'Concurso TRF (v2)'; dirty = true; render()`); ok(await js('save(false)')); eq(hash(fileMap), h0, 'salvar depois não toca o arquivo');
    const lib = openLibrary(dbFile); const m = lib.loadMap(id); eq(m.root.title, 'Concurso TRF (v2)');
    eq(lib.listMaps().find((x) => x.id === id).source_path, path.resolve(fileMap), 'origem registrada'); lib.close();
    eq(await js('moveToLibrary()'), false, 'já está na biblioteca'); ok((await txt('#status')).includes('já está'));
  });

  await t('janela da biblioteca: lista os mapas com contagens, abre pelo botão, e o aberto fica marcado', async () => {
    await openModal(); const r = await rows(); eq(r.length, 2); ok(r.some((x) => x.startsWith('Concurso TRF (v2)') && x.includes('(aberto)')), r.join('|')); ok(r.some((x) => x.startsWith('Direito Penal')));
    ok((await txt('#libList')).includes('tópicos'));
    await clickRow('Direito Penal', 'open'); await c.waitFor(() => js(`map.root.title === 'Direito Penal'`)); eq(await js('document.querySelector("#modal").hidden'), true);
    eq(await js('dirty'), false); eq(await js('map.root.children.length'), 2);
  });

  await t('abrir outro mapa com alterações não salvas pergunta antes (cancelar mantém tudo)', async () => {
    await js(`map.root.title = 'Direito Penal (não salvo)'; dirty = true; render(); window.__dlg.discard = 2`);
    await js(`openLibraryModal()`); await c.waitFor(() => js(`!!document.querySelector('#libList')`)); await clickRow('Concurso TRF', 'open'); await wait(300);
    eq(await js('map.root.title'), 'Direito Penal (não salvo)', 'cancelou: nada mudou'); eq(await js('dirty'), true);
    await js(`window.__dlg.discard = 1`); await clickRow('Concurso TRF', 'open'); await c.waitFor(() => js(`map.root.title.startsWith('Concurso TRF')`));
    const lib = openLibrary(dbFile); ok(!lib.listMaps().some((x) => x.title.includes('não salvo')), 'descartado não foi gravado'); lib.close();
  });

  await t('versões: criar agora, abrir como mapa NOVO (o atual intacto); salvar por cima gera versão automática', async () => {
    await js(`window.__dlg.discard = 1; dirty = false`); const id = await js('map.meta.libId');
    await js(`openVersionsModal(${JSON.stringify(id)})`); await c.waitFor(() => js(`!!document.querySelector('#verList')`));
    const n0 = await js(`document.querySelectorAll('#verList .lib-row').length`); ok(n0 >= 1, 'a gravação por cima do mapa importado já gerou uma versão automática');
    await click('#verNow'); await c.waitFor(() => js(`document.querySelectorAll('#verList .lib-row').length === ${n0 + 1}`)); eq(await txt('#verMsg'), 'Versão criada.');
    await js(`map.root.title = 'Concurso TRF (v3)'; dirty = true; render()`); ok(await js('save(false)'));
    await js(`document.querySelector('[data-act="restore-snap"]').click()`); await c.waitFor(() => js(`map.root.title === 'Concurso TRF (v2)' && map.meta.libId !== ${JSON.stringify(id)}`));
    const lib = openLibrary(dbFile); eq(lib.loadMap(id).root.title, 'Concurso TRF (v3)', 'o mapa original ficou como estava'); eq(lib.listMaps().length, 3); lib.close();
    ok((await txt('#status')).includes('Versão aberta como mapa novo'), await txt('#status'));
    await js(`dirty = false; restoreVersion()`); await c.waitFor(() => js(`!!document.querySelector('#verList')`)); await click('#verBack'); await wait(100); eq(await js('document.querySelector("#modal").hidden'), true, 'sem voltar à biblioteca quando veio do editor');
  });

  await t('lixeira: excluir manda para a lixeira (restaurável); o mapa aberto não pode ser excluído; excluir de vez pede confirmação', async () => {
    await openModal(); const before = (await rows()).length;
    await clickRow('Concurso TRF (v2)', 'trash'); await wait(100); ok((await txt('#libMsg')).includes('Este mapa está aberto'), await txt('#libMsg'));
    await clickRow('Concurso TRF (v3)', 'trash'); await wait(100); eq((await rows()).length, before - 1);
    await click('#libTabTrash'); await wait(100); eq(await rows(), ['Concurso TRF (v3)']);
    await clickRow('Concurso TRF (v3)', 'restore'); await wait(100); eq((await rows()).length, 0); await click('#libTabMaps'); await wait(100); eq((await rows()).length, before);
    await clickRow('Concurso TRF (v3)', 'trash'); await click('#libTabTrash'); await wait(100);
    await js(`window.__dlg.confirm = 1`); await clickRow('Concurso TRF (v3)', 'purge'); await wait(150); eq((await rows()).length, 1, 'cancelou a exclusão definitiva');
    await js(`window.__dlg.confirm = 0`); await clickRow('Concurso TRF (v3)', 'purge'); await wait(150); eq((await rows()).length, 0);
    const lib = openLibrary(dbFile); eq(lib.listMaps({ trashed: true }).length, 0); lib.close();
  });

  await t('importar pasta de .mom: relata erros, não altera originais, reexecutar não duplica; importar .mom avulso', async () => {
    const dir = path.join(TMP, 'pasta mom'); fs.mkdirSync(dir, { recursive: true });
    writeMom(fromCsv(csvTemplate()).map, path.join(dir, 'a.mom')); const m2 = concurso().m; m2.root.title = 'Outro concurso'; writeMom(m2, path.join(dir, 'b.mom')); fs.writeFileSync(path.join(dir, 'ruim.mom'), 'lixo');
    const h = hash(path.join(dir, 'a.mom')); await openModal(); const n0 = (await rows()).length;
    await js(`window.__dlg.folder = ${JSON.stringify(dir)}`); await click('#libImpDir'); await c.waitFor(() => js(`/importado/.test(document.querySelector('#libMsg').textContent)`));
    ok((await txt('#libMsg')).includes('2 importado(s)') && (await txt('#libMsg')).includes('1 com erro'), await txt('#libMsg')); ok((await txt('#libReport')).includes('ruim.mom'));
    eq((await rows()).length, n0 + 2); eq(hash(path.join(dir, 'a.mom')), h);
    await click('#libImpDir'); await c.waitFor(() => js(`/2 já estava/.test(document.querySelector('#libMsg').textContent)`)); eq((await rows()).length, n0 + 2, 'sem duplicar');
    const solo = path.join(TMP, 'solo.mom'); const m3 = concurso().m; m3.root.title = 'Avulso'; writeMom(m3, solo); await js(`window.__dlg.open = ${JSON.stringify(solo)}`); await click('#libImpFile'); await c.waitFor(() => js(`/Importado: \\d+ tópicos/.test(document.querySelector('#libMsg').textContent)`));
    await click('#libImpFile'); await c.waitFor(() => js(`/já está na biblioteca/.test(document.querySelector('#libMsg').textContent)`));
    await js(`window.__dlg.open = ${JSON.stringify(path.join(dir, 'a.md'))}`); fs.writeFileSync(path.join(dir, 'a.md'), '# x'); await click('#libImpFile'); await wait(150); ok((await txt('#libMsg')).includes('Escolha um arquivo .mom'));
  });

  await t('pacote portátil: exportar e importar em OUTRA biblioteca (simulada) sem perda; conflito vira cópia; pacote adulterado é recusado', async () => {
    const pk = path.join(TMP, 'estudos.mcpack'); await openModal(); await js(`window.__dlg.save = ${JSON.stringify(pk)}`); await click('#libExpPack'); await c.waitFor(() => fs.existsSync(pk));
    ok((await txt('#libMsg')).includes('Pacote salvo')); const lib = openLibrary(dbFile); const total = lib.listMaps().length;
    const other = openLibrary(':memory:'); const r = other.importPackage(pk); eq(r.maps, total); eq(r.imported, total);
    for (const m of lib.listMaps()) eq(canonical(other.loadMap(m.id)), canonical(readMom(writeMom(lib.loadMap(m.id)))), 'idêntico: ' + m.title);
    other.close(); lib.close();
    // reimportar no próprio app: tudo igual → nada novo
    await js(`window.__dlg.pack = ${JSON.stringify(pk)}`); await click('#libImpPack'); await c.waitFor(() => js(`/Pacote com/.test(document.querySelector('#libMsg').textContent)`)); ok((await txt('#libMsg')).includes('0 novo(s)'), await txt('#libMsg'));
    eq((await rows()).length, total);
    // adulterado
    const AdmZip = require('adm-zip'); const z = new AdmZip(pk); const man = JSON.parse(z.readAsText('manifest.json')); z.updateFile(man.maps[0].file, Buffer.from('adulterado')); const bad = path.join(TMP, 'adulterado.mcpack'); z.writeZip(bad);
    await js(`window.__dlg.pack = ${JSON.stringify(bad)}`); await click('#libImpPack'); await c.waitFor(() => js(`/corrompido/.test(document.querySelector('#libMsg').textContent)`)); eq((await rows()).length, total, 'nada foi gravado');
    // backup do banco
    const bk = path.join(TMP, 'bk.db'); await js(`window.__dlg.save = ${JSON.stringify(bk)}`); await click('#libBackup'); await c.waitFor(() => fs.existsSync(bk)); const b = openLibrary(bk, { check: true }); eq(b.listMaps().length, total); b.close();
  });

  await t('busca em todos os mapas pela biblioteca abre o mapa e vai ao tópico', async () => {
    await openModal(); await js(`(() => { const s = document.querySelector('#libSearch'); s.value = 'Licita'; s.dispatchEvent(new Event('input', { bubbles: true })); })()`); await wait(150);
    ok((await js(`document.querySelectorAll('#libList .hit').length`)) >= 1, 'achou'); await js(`document.querySelector('#libList .hit [data-act="open"]').click()`);
    await c.waitFor(() => js(`!document.querySelector('#modal') || document.querySelector('#modal').hidden`)); await wait(200); eq(await js('map.find(selectedId).node.title'), 'Licitações');
  });

  await t('rascunho de sessão preserva o vínculo com a biblioteca; "reabrir o último" abre pelo banco; mapa que sumiu cai no arquivo recente', async () => {
    const id = await js('map.meta.libId'); await js(`map.root.title = 'Rascunho lib'; dirty = true; rev++; render(); writeDraft()`);
    const d0 = JSON.parse(fs.readFileSync(path.join(USERDATA, 'drafts', 'session.json'), 'utf8')); eq(d0.map.meta.libId, id);
    await js(`window.__dlg.confirm = 0; draftExists = false; dirty = false; newMap()`); await js('recoverSession()'); await c.waitFor(() => js(`map.root.title === 'Rascunho lib'`)); eq(await js('map.meta.libId'), id); eq(await js('dirty'), true);
    ok(await js('save(false)')); const lib = openLibrary(dbFile); eq(lib.loadMap(id).root.title, 'Rascunho lib'); lib.close();
    await js(`removeDraft(); dirty = false; newMap(); saveCfg({ reopenLast: true, lastKind: 'lib', lastLib: ${JSON.stringify(id)} })`); await js('init()'); await c.waitFor(() => js(`map.meta.libId === ${JSON.stringify(id)}`)); eq(await js('map.root.title'), 'Rascunho lib');
    await js(`dirty = false; newMap(); saveCfg({ lastKind: 'lib', lastLib: 'nao-existe' })`); fs.writeFileSync(path.join(USERDATA, 'recent.json'), JSON.stringify([fileMap])); await js('init()'); await wait(500);
    eq(await js('filePath'), fileMap, 'caiu no último arquivo'); eq(await js('window.__dlg.errors.length'), 0, 'sem diálogo de erro');
  });

  await t('rede de conhecimento entre mapas da biblioteca: [[Mapa#Tópico]] resolve, aparece em Conexões, abre o outro mapa e o painel mostra revisões de outros mapas', async () => {
    const lib = openLibrary(dbFile); const a = concurso().m; a.root.title = a.meta.name = 'Rede A'; const b = concurso().m; b.root.title = b.meta.name = 'Rede B';
    const lg = (() => { let r; b.walk((n) => { if (n.title === 'Legalidade') r = n; }); return r; })(); lg.title = 'Princípio da Legalidade';
    const ida = lib.saveMap(a), idb = lib.saveMap(b); lib.close();
    await js(`window.__today = '${TODAY}'; saveCfg({ scope: 'vault' }); dirty = false; closeLibrary()`); await js(`openFromLibrary(${JSON.stringify(ida)}, { confirm: false })`); await c.waitFor(() => js(`map.root.title === 'Rede A'`));
    await js(`(() => { let n; map.walk((x) => { if (x.title === 'Atos administrativos') n = x; }); map.update(n.id, { notes: 'ver [[Rede B#Princípio da Legalidade]]' }); selectedId = n.id; render(); showPanel('links'); renderLinks(); })()`); await wait(400);
    const lk = await js(`[...document.querySelectorAll('#linksBody .lk')].map((r) => [...r.querySelectorAll('.t, .m')].map((x) => x.textContent).join(' | '))`);
    ok(lk.some((x) => x.startsWith('Princípio da Legalidade | Rede B')), 'link para outro mapa da biblioteca: ' + JSON.stringify(lk));
    await js('dirty = true'); ok(await js('save(false)'), 'o link foi salvo na biblioteca');
    await js(`document.querySelector('#linksBody .lk:not(.ghost)').click()`); await c.waitFor(() => js(`map.root.title === 'Rede B'`)); await wait(200);
    eq(await js('map.find(selectedId).node.title'), 'Princípio da Legalidade'); eq(await js('map.meta.libId'), idb);
    await js(`showPanel('links'); renderLinks()`); await wait(300);
    ok((await js(`[...document.querySelectorAll('#linksBody h4')].map((h) => h.textContent)`)).some((h) => h.startsWith('Citado em (1)')), 'retrolink vindo do outro mapa');
    await js(`act.dash()`); await wait(400); ok((await txt('#otherMaps')).includes('Rede A'), 'revisões de outro mapa da biblioteca no painel: ' + await txt('#otherMaps'));
    await js(`closeDash(); saveCfg({ scope: 'map' })`);
  });

  await t('biblioteca danificada: o app avisa, não cai, continua salvando em arquivo; nenhum dado do banco é apagado', async () => {
    await js(`closeLibrary(); dirty = false`); const keep = path.join(TMP, 'banco-bom.db'); fs.copyFileSync(dbFile, keep);
    fs.writeFileSync(dbFile, 'isto não é um banco de dados sqlite. '.repeat(300)); fs.rmSync(dbFile + '-wal', { force: true }); fs.rmSync(dbFile + '-shm', { force: true });
    await js(`newMap(); map.root.title = 'Sem biblioteca'; render()`); eq(await js('getLibrary() === null'), true); ok((await js('_libErr')).length > 5);
    await js(`saveCfg({ newInLibrary: true }); window.__dlg.save = ${JSON.stringify(path.join(TMP, 'fallback.mom'))}`); ok(await js('save(false)'), 'salvou em arquivo mesmo assim'); eq(await js('filePath'), path.join(TMP, 'fallback.mom'));
    await openModal(); ok((await txt('#libBox')).includes('não está disponível'), 'a janela explica'); await click('#libClose');
    eq(await js('act.libAdd().then(() => document.title.length > 0)'), true);
    ok(fs.readFileSync(dbFile, 'utf8').startsWith('isto não é'), 'o arquivo ruim não foi sobrescrito nem apagado'); fs.copyFileSync(keep, dbFile); await js(`closeLibrary(); saveCfg({ newInLibrary: false })`);
    eq(await js('getLibrary() !== null'), true, 'com o banco restaurado volta a funcionar'); eq(await js('getLibrary().listMaps().length >= 3'), true);
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  void d; void crypto;
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
