'use strict';
// Injeção de falhas: o app NUNCA pode perder o que está na tela quando o disco, o arquivo ou o banco falham.
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const start = require('./harness');
const { writeMom, readMom } = require('../core/mom');
const { MindMap, createNode } = require('../core/model');
const { DatabaseSync } = require('node:sqlite');

(async () => {
  const c = await start('MindCraft e2e — falhas de disco, arquivo e banco');
  const { js, wait, eq, ok, t, TMP, USERDATA } = c;
  const errs = () => js('window.__dlg.errors.slice()');
  const mk = (title, kids = ['a', 'b']) => { const m = new MindMap(createNode(title)); m.meta.name = title; kids.forEach((k) => m.addChild(m.root.id, k)); return m; };
  const dirOf = (d) => fs.readdirSync(d).sort();

  await t('salvar numa pasta que não existe: avisa, o mapa continua aberto e "não salvo", e o rascunho protege o trabalho', async () => {
    await js(`dirty = false; newMap(); map.root.title = 'Trabalho importante'; map.addChild(map.root.id, 'não pode perder'); dirty = true; rev++; render(); window.__dlg.errors.length = 0; true`);
    await js(`window.__dlg.save = ${JSON.stringify(path.join(TMP, 'pasta-que-nao-existe', 'x.mom'))}`); eq(await js('save(true)'), false);
    ok((await errs()).some((e) => e.includes('Falha ao salvar')), JSON.stringify(await errs())); eq(await js('dirty'), true); eq(await js('filePath'), null); eq(await js('map.root.title'), 'Trabalho importante');
    const draft = path.join(USERDATA, 'drafts', 'session.json'); await c.waitFor(() => fs.existsSync(draft), 6000); ok(JSON.stringify(JSON.parse(fs.readFileSync(draft, 'utf8')).map.root).includes('não pode perder'), 'rascunho com o trabalho');
  });

  await t('salvar por cima de um arquivo SOMENTE LEITURA: o original fica intacto, não sobra arquivo temporário e o mapa segue "não salvo"', async () => {
    const dir = path.join(TMP, 'ro'); fs.mkdirSync(dir); const f = path.join(dir, 'protegido.mom'); writeMom(mk('Original'), f); fs.chmodSync(f, 0o444); const before = fs.readFileSync(f);
    await js(`window.__dlg.errors.length = 0; filePath = ${JSON.stringify(f)}; map.root.title = 'Alterado'; dirty = true; render(); true`); eq(await js('save(false)'), false);
    ok((await errs()).some((e) => e.includes('Falha ao salvar')), JSON.stringify(await errs())); ok(Buffer.compare(fs.readFileSync(f), before) === 0, 'o arquivo original não mudou'); eq(dirOf(dir), ['protegido.mom'], 'sem .tmp sobrando'); eq(await js('dirty'), true);
    fs.chmodSync(f, 0o666); eq(await js('save(false)'), true); eq(readMom(fs.readFileSync(f)).root.title, 'Alterado', 'liberado o arquivo, salvar funciona'); eq(await js('dirty'), false);
  });

  await t('banco da biblioteca TRAVADO por outro processo: o salvamento falha com aviso, nada se perde, e funciona assim que o banco é liberado', async () => {
    const dbFile = path.join(USERDATA, 'biblioteca.db');
    await js(`dirty = false; newMap(); map.root.title = 'Na biblioteca'; map.addChild(map.root.id, 'x'); render(); true`); ok(await js('moveToLibrary()'));
    await js(`map.root.title = 'Alterado enquanto travado'; map.addChild(map.root.id, 'novo tópico'); dirty = true; rev++; render(); window.__dlg.errors.length = 0; true`);
    const nKids = await js('map.root.children.length');
    const other = new DatabaseSync(dbFile); other.exec('BEGIN IMMEDIATE');                 // outro processo segurando a escrita
    const t0 = Date.now(); const r = await js('save(false)'); const took = Date.now() - t0;
    eq(r, false); ok(took >= 4000 && took < 15000, 'esperou o banco (busy_timeout) por ' + took + ' ms'); ok((await errs()).some((e) => e.includes('Falha ao salvar na biblioteca') && /locked|bloquead|busy/i.test(e)), JSON.stringify(await errs()));
    eq(await js('dirty'), true); eq(await js('map.root.title'), 'Alterado enquanto travado'); eq(await js('map.root.children.length'), nKids, 'o que estava na tela continua');
    other.exec('ROLLBACK'); other.close();
    eq(await js('save(false)'), true); eq(await js('dirty'), false); ok(await js(`getLibrary().loadMap(map.meta.libId).root.children.length === ${nKids}`), 'gravou tudo depois de liberar');
  });

  await t('arquivos .mom ruins (cortado ao meio, zip bomba, vazio, outro formato): erro claro, o mapa aberto e o "não salvo" ficam intactos', async () => {
    const good = writeMom(mk('Bom')); const cut = path.join(TMP, 'cortado.mom'); fs.writeFileSync(cut, good.subarray(0, Math.floor(good.length / 2)));
    const bomb = path.join(TMP, 'bomba.mom'); const z = new AdmZip(); z.addFile('document.json', Buffer.from('{}')); z.addFile('nodes.json', Buffer.alloc(70 * 1024 * 1024, 32)); fs.writeFileSync(bomb, z.toBuffer());
    const empty = path.join(TMP, 'vazio.mom'); fs.writeFileSync(empty, ''); const other = path.join(TMP, 'foto.mom'); fs.writeFileSync(other, Buffer.from('\x89PNG\r\n\x1a\n lixo'));
    await js(`dirty = false; newMap(); map.root.title = 'Aberto e sujo'; dirty = true; render(); true`);
    for (const f of [cut, bomb, empty, other]) {
      await js(`window.__dlg.errors.length = 0; true`); eq(await js(`openPath(${JSON.stringify(f)})`), false, path.basename(f)); ok((await errs()).some((e) => e.includes('Não foi possível abrir')), path.basename(f) + ': ' + JSON.stringify(await errs()));
      eq(await js('map.root.title'), 'Aberto e sujo', path.basename(f) + ': mapa aberto intacto'); eq(await js('dirty'), true); eq(await js('filePath'), null);
    }
  });

  await t('pacote e exportações para um destino inválido: mensagem na própria janela, sem derrubar nada', async () => {
    await js(`dirty = false; closeModal(); openLibraryModal(); true`); await c.waitFor(() => js(`!!document.querySelector('#libExpPack')`));
    await js(`window.__dlg.save = ${JSON.stringify(path.join(TMP, 'sem-pasta', 'p.mcpack'))}; document.querySelector('#libExpPack').click()`); await c.waitFor(() => js(`/Erro/.test(document.querySelector('#libMsg').textContent)`), 8000);
    eq(await js(`document.querySelector('#libMsg').classList.contains('err')`), true); await js(`window.__dlg.save = ${JSON.stringify(path.join(TMP, 'sem-pasta', 'b.db'))}; document.querySelector('#libBackup').click()`); await c.waitFor(() => js(`/Erro/.test(document.querySelector('#libMsg').textContent)`), 8000);
    eq(await js(`document.querySelectorAll('#libList .lib-row').length > 0`), true, 'a janela continua funcionando'); await js('closeModal()');
    await js(`window.__dlg.save = ${JSON.stringify(path.join(TMP, 'sem-pasta', 'a.ics'))}; act.dash()`); await wait(300); await js(`window.__dlg.errors.length = 0; document.querySelector('#btnIcs').click()`); await wait(500); ok((await errs()).some((e) => e.includes('agenda')), JSON.stringify(await errs())); await js('closeDash()');
  });

  await t('a lista de recentes com arquivo ilegível/sumido e uma biblioteca danificada não impedem a tela inicial de abrir', async () => {
    fs.writeFileSync(path.join(USERDATA, 'recent.json'), '{ isto não é json'); await js(`closeHome(); act.home(true)`); await c.waitFor(() => js(`!!document.querySelector('#home .hm')`)); eq(await js(`document.querySelectorAll('#hmRecent .hm-row').length`), 0); await js('closeHome()');
    fs.writeFileSync(path.join(USERDATA, 'recent.json'), JSON.stringify([path.join(TMP, 'cortado.mom'), 5, null, path.join(TMP, 'ro', 'protegido.mom')])); await js(`act.home(true)`); await c.waitFor(() => js(`!!document.querySelector('#home .hm')`));
    ok((await js(`document.querySelectorAll('#hmRecent .hm-row').length`)) >= 2, 'itens válidos aparecem, lixo é ignorado'); await js('closeHome()');
  });

  await t('nenhum erro de console além dos erros esperados (cada falha injetada foi tratada com aviso)', async () => {
    const unexpected = c.errors.filter((e) => !/Backup falhou|Autosave falhou|Não foi possível abrir|Biblioteca indisponível/.test(e)); eq(unexpected, [], 'erros inesperados de console');
  });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
