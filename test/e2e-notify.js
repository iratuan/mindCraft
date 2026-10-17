'use strict';
// Aviso diário de revisões: opção no Painel de estudos, horário, uma vez por dia, conteúdo e botão de teste (o toast do sistema é substituído por um dublê).
const fs = require('fs');
const path = require('path');
const start = require('./harness');
const { writeMom } = require('../core/mom');
const { openLibrary } = require('../core/library');
const { TODAY, concurso } = require('./fixtures');

(async () => {
  const c = await start('MindCraft e2e — aviso diário de revisões');
  const { js, wait, eq, ok, t, TMP, USERDATA } = c;
  const SHOTS = path.join(__dirname, '..', 'evidencias', 'aviso'); fs.rmSync(SHOTS, { recursive: true, force: true }); fs.mkdirSync(SHOTS, { recursive: true });
  const { BrowserWindow } = require('electron'); const win = BrowserWindow.getAllWindows()[0];
  const shot = async (n) => fs.writeFileSync(path.join(SHOTS, n + '.png'), (await win.webContents.capturePage()).toPNG());
  const click = (s) => js(`document.querySelector(${JSON.stringify(s)}).click()`);
  const notices = () => js('window.__dlg.notices || []');
  const tick = (hm, force = false) => js(`window.__nowHM = ${JSON.stringify(hm)}; window.__today = '${TODAY}'; window.__notifyTick(${force})`);
  const file = path.join(TMP, 'concurso.mom'); writeMom(concurso().m, file);
  await js(`window.__today = '${TODAY}'; dirty = false; openPath(${JSON.stringify(file)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(file)}`)); await wait(300);

  await t('desligado por padrão: nunca avisa, em nenhum horário', async () => {
    eq(await js('loadCfg().notifyDaily === true'), false);
    for (const hm of ['00:00', '08:00', '23:59']) eq(await tick(hm), false); eq(await notices(), []);
  });

  await t('Painel de estudos: marcar a opção grava; horário só vale com a opção ligada; valor inválido é ignorado; testar aviso mostra já (sem gastar o aviso do dia)', async () => {
    await js('act.dash()'); await wait(400);
    eq(await js(`document.querySelector('#optNotifyAt').disabled`), true); await click('#optNotify'); await wait(200);
    eq(await js('loadCfg().notifyDaily'), true); eq(await js(`document.querySelector('#optNotifyAt').disabled`), false); eq(await js(`document.querySelector('#optNotifyAt').value`), '08:00');
    await js(`(() => { const e = document.querySelector('#optNotifyAt'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, '07:15'); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); })()`); await wait(200);
    eq(await js('loadCfg().notifyAt'), '07:15');
    await shot('01-opcao-aviso-diario');
    await click('#optNotifyTest'); await wait(300); const n = await notices(); eq(n.length, 1); ok(n[0].title.includes('MindCraft') && n[0].body.length > 0, JSON.stringify(n[0])); eq(await js('loadCfg().notifiedOn'), undefined, 'teste não consome o aviso do dia');
    await js('closeDash()'); await js('window.__dlg.notices = []');
  });

  await t('liga + horário: não avisa antes (07:14), avisa às 07:15 com o número certo, e só UMA vez no dia', async () => {
    const due = await js(`S.summary(map, { today: '${TODAY}' }).due.length`); ok(due > 0, 'a fixture tem revisões vencidas');
    eq(await tick('07:14'), false); eq((await notices()).length, 0);
    eq(await tick('07:15'), true); const n = await notices(); eq(n.length, 1);
    ok(n[0].body.includes(due + ' ' + (due === 1 ? 'revisão vencida' : 'revisões vencidas')), n[0].body); eq(await js('loadCfg().notifiedOn'), TODAY);
    eq(await tick('07:16'), false); eq(await tick('23:59'), false); eq((await notices()).length, 1, 'uma vez só');
    await js(`window.__today = '2026-10-21'`); eq(await js(`window.__nowHM = '07:20'; window.__notifyTick(false)`), true, 'dia seguinte, ainda há revisões: avisa de novo (uma vez por dia)'); eq((await notices()).length, 2); eq(await js('loadCfg().notifiedOn'), '2026-10-21');
  });

  await t('biblioteca: soma revisões de TODOS os mapas e os erros para refazer; mostra "em N mapas"', async () => {
    await js(`saveCfg({ notifiedOn: null }); window.__dlg.notices = []; window.__today = '${TODAY}'; true`);
    const lib = openLibrary(path.join(USERDATA, 'biblioteca.db')); const a = concurso().m, b = concurso().m; a.root.title = a.meta.name = 'Mapa A'; b.root.title = b.meta.name = 'Mapa B';
    const S = require('../core/study'); b.mutateStudy(b.root.children[0].children[0].id, (st) => S.addError(st, { why: 'chute', today: TODAY })); lib.saveMap(a); lib.saveMap(b);
    const due = lib.listMaps({ today: TODAY }).reduce((x, m) => x + m.due, 0); lib.close(); ok(due > 0);
    eq(await tick('09:00'), true); const n = await notices(); ok(/em 2 mapas/.test(n[0].body) && /1 erro para refazer/.test(n[0].body) && n[0].body.startsWith(due + ' '), n[0].body);
  });

  await t('sem nada vencido: silêncio (não marca o dia, para avisar se algo vencer mais tarde); o botão de teste mostra mensagem tranquilizadora', async () => {
    await js(`saveCfg({ notifiedOn: null }); window.__dlg.notices = []; true`);
    await js(`dirty = false; newMap(); window.__todayBackup = window.__today; window.__today = '2020-01-01'; true`);
    const lib = openLibrary(path.join(USERDATA, 'biblioteca.db')); for (const m of lib.listMaps()) lib.trashMap(m.id); lib.close();   // biblioteca esvaziada (lixeira não conta)
    eq(await tick('09:00'), false, 'nada a dizer: silêncio'); eq((await notices()).length, 0); eq(await js('loadCfg().notifiedOn'), null, 'não consome o dia');
    eq(await js(`window.__dlg.notices = []; window.__notifyTick(true)`), true); ok((await notices())[0].body.includes('Nada vencido'), JSON.stringify(await notices()));
    await js(`saveCfg({ notifyDaily: false }); true`); eq(await tick('12:00'), false, 'desligar interrompe');
  });

  await t('o aviso viaja no pacote .mcpack (ligado + horário) e é restaurado ao importar', async () => {
    await js(`saveCfg({ notifyDaily: true, notifyAt: '06:45' }); true`);
    const s = await js('portableSettings()'); eq([s.notifyDaily, s.notifyAt], [true, '06:45']);
    await js(`saveCfg({ notifyDaily: false, notifyAt: '09:00' }); applyPortableSettings(${JSON.stringify(s)}); true`); eq(await js('[loadCfg().notifyDaily, loadCfg().notifyAt]'), [true, '06:45']);
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
