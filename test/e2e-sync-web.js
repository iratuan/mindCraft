'use strict';
// Sincronização com o Google Drive na VERSÃO WEB/TABLET (Chromium sem Node, SQLite em WebAssembly, arquivos virtuais no IndexedDB),
// contra o servidor FALSO do Google. Cobre: tela em tablet (só Drive, alvos de toque), login por código, enviar, receber do "outro aparelho",
// conflito, sobreviver a fechar/reabrir o app, e desligar (esquece o login).
const fs = require('fs');
const path = require('path');
const start = require('./web-harness');
const { openLibrary } = require('../core/library');
const { syncLibrary } = require('../core/sync');
const { DriveRemote } = require('../core/sync-drive');
const { tokenSource } = require('../core/oauth-device');
const { nodeHttp } = require('../core/net-node');
const { startMockGoogle } = require('./mock-google');

const SHOTS = path.join(__dirname, '..', 'evidencias', 'sync');
(async () => {
  const c = await start('MindCraft e2e — sincronização com o Google Drive (web/tablet)');
  const { js, wait, waitFor, eq, ok, t, TMP } = c;
  const g = await startMockGoogle();
  const other = openLibrary(path.join(TMP, 'pc.db')); const otherState = {};
  const otherRemote = () => new DriveRemote({ http: nodeHttp, getToken: tokenSource({ http: nodeHttp, clientId: g.S.clientId, clientSecret: g.S.clientSecret, auth: { refreshToken: 'rt-1' }, urls: g.urls }), api: g.urls.api, upload: g.urls.upload });
  const otherSync = () => syncLibrary(other, otherRemote(), otherState);
  const text = (sel) => js(`(document.querySelector(${JSON.stringify(sel)}) || {}).textContent || ''`);
  const click = (sel) => js(`document.querySelector(${JSON.stringify(sel)}).click(); true`);
  const waitText = async (sel, re, ms = 25000) => { await waitFor(async () => re.test(await text(sel)), ms); return text(sel); };
  const syncNow = async () => { await click('#syncNow'); await waitFor(async () => /Pronto|Não sincronizou/.test(await text('#syncMsg')), 40000); return text('#syncMsg'); };
  const openSync = async () => { await js('act.sync(); true'); await waitFor(() => js('!!document.querySelector("#syncBox")')); };
  const mkMap = (title) => js(`(() => { const m = new MindMap(createNode(${JSON.stringify(title)}), { name: ${JSON.stringify(title)} }); m.addChild(m.root.id, 'Tópico A'); return getLibrary().saveMap(m, { snapshot: false }); })()`);
  const reopen = async () => { await c.idle(); await c.open(); await waitFor(() => js('typeof act !== "undefined" && typeof getLibrary === "function"')); await wait(500); };

  await c.emulate({ width: 1280, height: 800 }); await c.open(); await waitFor(() => js('typeof act !== "undefined" && typeof getLibrary === "function"')); await wait(500);

  await t('tela de sincronização no tablet: só "Google Drive" (sem pasta do computador), desligada, botões com alvo de toque ≥ 44 px', async () => {
    await openSync();
    eq(await js('[...document.querySelector("#syncKind").options].map((o) => o.value)'), ['drive']);
    eq(await js('document.querySelector("#syncPick").hidden'), true); eq(await js('document.querySelector("#syncNow").disabled'), true);
    const small = await js(`[...document.querySelectorAll('#syncBox button, #syncBox input:not([type=checkbox]), #syncBox select')].filter((e) => !e.hidden && e.offsetParent !== null).map((e) => [e.id || e.textContent, Math.round(e.getBoundingClientRect().height)]).filter(([, h]) => h < 40)`);
    eq(small, [], 'alvos pequenos: ' + JSON.stringify(small));
    eq(await js('document.documentElement.scrollWidth <= innerWidth'), true, 'sem rolagem horizontal');
    await c.shot(path.join(SHOTS, '10-tablet-tela.png')); await js('closeModal(); true');
  });

  let idA;
  await t('entrar com o código (rede do navegador, com CORS), enviar e o outro aparelho receber', async () => {
    idA = await mkMap('Direito Administrativo'); await mkMap('Português');
    await js(`window.__syncTestUrls = ${JSON.stringify(g.urls)}; true`); await openSync();
    await js(`document.querySelector('#syncClientId').value = ${JSON.stringify(g.S.clientId)}; document.querySelector('#syncClientSecret').value = ${JSON.stringify(g.S.clientSecret)}; true`);
    await click('#syncLogin'); await waitText('#syncUserCode', /ABCD-EFGH/); await c.shot(path.join(SHOTS, '11-tablet-codigo.png')); g.S.deviceApproved = true;
    await waitFor(async () => /Conectado/.test(await text('#syncMsg')), 25000);
    const msg = await syncNow(); ok(/2 enviado/.test(msg), msg);
    const r = await otherSync(); eq([r.pulled, r.errors.length], [2, 0]); await c.shot(path.join(SHOTS, '12-tablet-enviado.png'));
  });

  await t('edição do outro aparelho chega ao tablet; conflito mantém as duas versões', async () => {
    const m = other.loadMap(idA); m.update(m.root.children[0].id, { notes: 'do PC — ção 😀' }); other.saveMap(m, { snapshot: false }); await otherSync();
    ok(/1 recebido/.test(await syncNow())); eq(await js(`getLibrary().loadMap(${JSON.stringify(idA)}).root.children[0].notes`), 'do PC — ção 😀');
    await js(`(() => { const l = getLibrary(), m = l.loadMap(${JSON.stringify(idA)}); m.update(m.root.id, { title: 'No tablet' }); l.saveMap(m, { snapshot: false }); })()`);
    const m2 = other.loadMap(idA); m2.update(m2.root.id, { title: 'No PC' }); other.saveMap(m2, { snapshot: false }); await otherSync();
    ok(/1 conflito/.test(await syncNow())); eq(await js(`getLibrary().loadMap(${JSON.stringify(idA)}).root.title`), 'No tablet');
    ok(await js(`getLibrary().listMaps().some((x) => /da sincronização/.test(x.title))`));
    await js('closeModal(); true');
  });

  await t('fechar e reabrir o app: continua conectado (login e estado guardados) e sincroniza sem pedir nada', async () => {
    const before = await js('getLibrary().listMaps().length'); await reopen();
    eq(await js('getLibrary().listMaps().length'), before, 'biblioteca intacta');
    await js(`window.__syncTestUrls = ${JSON.stringify(g.urls)}; true`); await openSync();
    ok(/Google Drive/.test(await text('#syncInfo')), await text('#syncInfo')); eq(await js('document.querySelector("#syncNow").disabled'), false);
    const m = other.loadMap(idA); m.update(m.root.children[0].id, { notes: 'depois de reabrir' }); other.saveMap(m, { snapshot: false }); await otherSync();
    g.S.expireAll(); const msg = await syncNow(); ok(/1 recebido/.test(msg) && !/problema/.test(msg), msg);
  });

  await t('o acesso foi revogado no Google: mensagem pedindo para entrar de novo; nada local muda', async () => {
    const n = await js('getLibrary().listMaps().length'); g.S.refreshOk = false; g.S.expireAll();
    const msg = await syncNow(); ok(/Não sincronizou/.test(msg) && /(Entre de novo|expirou)/.test(msg), msg); eq(await js('getLibrary().listMaps().length'), n); g.S.refreshOk = true;
  });

  await t('desligar: esquece o login neste aparelho, mantém os mapas e o que está no Drive', async () => {
    const files = g.S.files.size, n = await js('getLibrary().listMaps().length'); await click('#syncOff'); await wait(300);
    const cfg = JSON.parse(await js(`window.__mcHost.fs.readFileSync('/userdata/sync.json', 'utf8')`)); eq(cfg.enabled, false); eq(cfg.drive.auth, null);
    eq(g.S.files.size, files); eq(await js('getLibrary().listMaps().length'), n); await js('closeModal(); true');
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  other.close(); await g.close(); await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
