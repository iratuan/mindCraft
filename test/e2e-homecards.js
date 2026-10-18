'use strict';
// Tela inicial: lembrete de cópia de segurança (some depois de fazer a cópia; "lembrar depois"; intervalo; restaurar de pacote que NUNCA sobrescreve)
// e o cartão "Seu estudo" (sequência, hoje, 7 dias, acerto, metas, disciplina mais atrasada). App real, mouse real.
const path = require('path');
const fs = require('fs');
const start = require('./harness');

(async () => {
  const c = await start('MindCraft e2e — tela inicial: backup e Seu estudo');
  const { js, wait, waitFor, eq, ok, t, TMP, USERDATA } = c; const wc = () => c.win.webContents; const SHOTS = path.join(__dirname, '..', 'evidencias', 'tela-inicial');
  const cfg = () => { try { return JSON.parse(fs.readFileSync(path.join(USERDATA, 'config.json'), 'utf8')); } catch { return {}; } };
  const exists = (sel) => js(`!!document.querySelector(${JSON.stringify(sel)})`);
  const text = (sel) => js(`(document.querySelector(${JSON.stringify(sel)}) || { textContent: '' }).textContent`);
  const click = async (sel) => { const p = await js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); wc().sendInputEvent({ type: 'mouseMove', x: Math.round(p.x), y: Math.round(p.y) }); wc().sendInputEvent({ type: 'mouseDown', x: Math.round(p.x), y: Math.round(p.y), button: 'left', clickCount: 1 }); wc().sendInputEvent({ type: 'mouseUp', x: Math.round(p.x), y: Math.round(p.y), button: 'left', clickCount: 1 }); await wait(350); };
  const openHome = async () => { await js(`act.home(true); true`); await waitFor(() => exists('#hmNew'), 4000); await wait(250); };
  const today = () => js('nowStr()');
  const addDays = (d, n) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };

  await c.ready;
  await t('sem biblioteca: nenhum lembrete de backup (nada a proteger); o cartão "Seu estudo" explica que ainda não há estudo', async () => {
    await js(`closeHome && closeHome(); dirty = false; newMap(); true`); await openHome();
    ok(!(await exists('#hmBackupBanner')), 'sem banner'); ok(await exists('#hmGlance'), 'cartão Seu estudo existe'); ok(/Ainda sem estudo registrado/.test(await text('#hmGlance')), 'mensagem vazia'); ok(/neste mapa/.test(await text('#hmGlance')), 'fonte: mapa aberto');
    ok(await exists('#hmBackup') && await exists('#hmRestore'), 'atalhos "Cópia de segurança" e "Restaurar cópia"'); eq(await text('#hmLastBackup'), 'Nenhuma cópia feita ainda.');
    await c.shot(path.join(SHOTS, '01-sem-estudo.png'));
  });

  await t('com estudo registrado e mapas na biblioteca: aparece o lembrete "nunca fez" e o cartão com sequência, hoje, 7 dias, acerto e a disciplina mais atrasada', async () => {
    await js(`closeHome(); dirty = false; newMap(); map.root.title = 'Plano Penal'; map.root.children = []; (() => { const d = map.addChild(map.root.id, 'Direito Penal'); map.addChild(d.id, 'Crimes contra a pessoa'); map.addChild(d.id, 'Crimes contra o patrimônio'); const e = map.addChild(map.root.id, 'Direito Civil'); map.addChild(e.id, 'Contratos'); render(); window.__ids = { a: d.children[0].id, b: d.children[1].id, c: e.children[0].id }; })(); true`);
    await js(`selectedId = __ids.a; selIds = new Set([selectedId]); render(); showPanel('study'); true`); await wait(300);
    await js(`document.querySelector('#studyMin').value = '25'; document.querySelector('#studyAddMin').click(); true`); await wait(300);
    await js(`document.querySelector('#qDone').value = '10'; document.querySelector('#qOk').value = '8'; document.querySelector('#qAdd').click(); true`); await wait(300);
    await js(`runStudy((x) => map.mutateStudy(x, (st) => S.setNext(st, '2020-01-01')), '', [__ids.a]); runStudy((x) => map.mutateStudy(x, (st) => S.setNext(st, '2020-01-01')), '', [__ids.b]); runStudy((x) => map.mutateStudy(x, (st) => S.setNext(st, '2020-01-01')), '', [__ids.c]); true`); await wait(300);
    ok(await js('moveToLibrary()'), 'mapa guardado na biblioteca'); await wait(400); await openHome();
    ok(await exists('#hmBackupBanner'), 'banner de backup'); ok(/ainda não fez nenhuma cópia/.test(await text('#hmBackupBanner')), await text('#hmBackupBanner')); ok(/fora deste aparelho/.test(await text('#hmBackupBanner')));
    ok(/em toda a biblioteca/.test(await text('#hmGlance'))); eq(await text('#glStreak b'), '1'); eq(await text('#glToday b'), '25 min'); eq(await text('#glWeek b'), '25 min'); eq(await text('#glAcc b'), '80%'); ok(/8\/10/.test(await text('#glAcc span')));
    eq(await js(`document.querySelectorAll('#glBars .gl-col').length`), 7, '7 barras'); eq(await js(`document.querySelectorAll('#glBars .gl-col i.on').length`), 1, 'só hoje tem estudo');
    ok(/Disciplina que mais precisa de você: Direito Penal — 2 revisão/.test(await text('#glLag')), await text('#glLag')); await wait(500); await c.shot(path.join(SHOTS, '02-lembrete-e-seu-estudo.png'));
  });

  await t('"Revisar agora" abre a Revisão do dia; "painel completo" abre o painel de estudos', async () => {
    await click('#glReview'); await waitFor(() => exists('#reviewBox, .review-box, [data-ui] #rvShow, #rvStart, #rvCard'), 4000).catch(() => {});
    ok(await js(`document.getElementById('home').hidden`), 'a tela inicial saiu da frente'); ok(!(await js(`document.getElementById('modal').hidden`)), 'a janela da revisão abriu');
    await js(`closeModal(); true`); await openHome(); await click('#hmGlanceDash'); await waitFor(() => js(`!document.getElementById('dash').hidden`), 4000); ok(true, 'painel aberto'); await js(`closeDash(); true`); await openHome();
  });

  await t('"Lembrar depois" esconde o aviso por 3 dias (e continua escondido ao reabrir a tela inicial)', async () => {
    await click('#hmBackupLater'); ok(!(await exists('#hmBackupBanner')), 'sumiu'); eq(cfg().backupSnoozeUntil, addDays(await today(), 3)); ok(/o lembrete volta em 3 dias/.test(await text('#status')));
    await js(`closeHome(); true`); await openHome(); ok(!(await exists('#hmBackupBanner')), 'continua escondido');
  });

  await t('passou do intervalo: o aviso volta dizendo há quantos dias; o intervalo é configurável (7/14/30/nunca) e "nunca" desliga', async () => {
    await js(`saveCfg({ lastBackup: ${JSON.stringify(addDays(await today(), -20))}, backupSnoozeUntil: null }); closeHome(); true`); await openHome();
    ok(/há 20 dias/.test(await text('#hmBackupBanner')), await text('#hmBackupBanner')); ok(/Última cópia/.test(await text('#hmLastBackup')));
    await js(`saveCfg({ lastBackup: ${JSON.stringify(addDays(await today(), -10))} }); closeHome(); true`); await openHome(); ok(!(await exists('#hmBackupBanner')), '10 dias < 14');
    await js(`(() => { const s = document.querySelector('#hmBackupEvery'); const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set; set.call(s, '7'); s.dispatchEvent(new Event('change', { bubbles: true })); })()`); await wait(300);
    eq(cfg().backupEveryDays, 7); ok(await exists('#hmBackupBanner'), 'a cada 7 dias: 10 dias já passou');
    await js(`(() => { const s = document.querySelector('#hmBackupEvery'); const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set; set.call(s, '0'); s.dispatchEvent(new Event('change', { bubbles: true })); })()`); await wait(300);
    eq(cfg().backupEveryDays, 0); ok(!(await exists('#hmBackupBanner')), 'nunca = desliga'); await js(`saveCfg({ backupEveryDays: 14, lastBackup: null }); closeHome(); true`); await openHome(); ok(await exists('#hmBackupBanner'));
  });

  const pack = path.join(TMP, 'copia-seguranca.mcpack');
  await t('"Fazer cópia agora" (diálogo de salvar → pacote real): grava o .mcpack com os mapas, o aviso some, a data da última cópia aparece e o status confirma', async () => {
    await js(`window.__dlg.save = ${JSON.stringify(pack)}; true`); await click('#hmBackupNow'); await waitFor(() => fs.existsSync(pack), 6000);
    ok(fs.statSync(pack).size > 300, 'pacote com conteúdo'); eq(fs.readFileSync(pack).slice(0, 2).toString(), 'PK', 'é um zip válido'); eq(cfg().lastBackup, await today());
    await wait(300); ok(!(await exists('#hmBackupBanner')), 'aviso sumiu'); ok(/Última cópia: /.test(await text('#hmLastBackup')), await text('#hmLastBackup')); ok(/Cópia de segurança salva: 1 mapa/.test(await text('#status')), await text('#status'));
    await c.shot(path.join(SHOTS, '03-copia-feita.png'));
  });

  await t('cancelar o diálogo de salvar NÃO conta como cópia feita (o aviso continua)', async () => {
    await js(`saveCfg({ lastBackup: null }); window.__dlg.save = null; closeHome(); true`); await openHome(); await click('#hmBackupNow'); await wait(500);
    ok(await exists('#hmBackupBanner'), 'continua avisando'); eq(cfg().lastBackup, null);
  });

  await t('Restaurar cópia: apagar um mapa da biblioteca e restaurar do pacote o traz de volta; restaurar de novo não duplica nem sobrescreve', async () => {
    const ids = await js(`getLibrary().listMaps({ today: nowStr() }).map((m) => m.id)`); eq(ids.length, 1);
    await js(`dirty = false; newMap(); getLibrary().trashMap(${JSON.stringify(ids[0])}); getLibrary().purgeMap(${JSON.stringify(ids[0])}); closeHome(); true`); await openHome(); eq(await js(`getLibrary().listMaps({ today: nowStr() }).length`), 0, 'biblioteca vazia');
    await js(`window.__dlg.pack = ${JSON.stringify(pack)}; true`); await click('#hmRestore'); await wait(600);
    eq(await js(`getLibrary().listMaps({ today: nowStr() }).map((m) => m.title)`), ['Plano Penal'], 'o mapa voltou'); ok(/Pacote restaurado: 1 novo/.test(await text('#status')), await text('#status')); ok(/Nada foi sobrescrito/.test(await text('#status')));
    await click('#hmRestore'); await wait(600); eq(await js(`getLibrary().listMaps({ today: nowStr() }).length`), 1, 'não duplicou'); ok(/0 novo/.test(await text('#status')), await text('#status'));
    await js(`window.__dlg.pack = null; true`); await click('#hmRestore'); await wait(400); eq(await js(`getLibrary().listMaps({ today: nowStr() }).length`), 1, 'cancelar não muda nada');
  });

  await t('o lembrete e o cartão não alteram o mapa aberto; nenhum erro de console', async () => {
    eq(c.errors, [], 'erros de console');
  });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
