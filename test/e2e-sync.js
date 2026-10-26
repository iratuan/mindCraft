'use strict';
// Sincronização opcional com uma pasta, no app REAL (Electron): desligada por padrão, ligar/trocar/desligar, enviar, receber, conflito (duas versões),
// mapa aberto com alterações não é trocado, pasta sumida, sincronizar sozinho ao abrir, e a biblioteca nunca perde nada.
// O "outro aparelho" é uma segunda biblioteca (outro banco) sincronizando com a MESMA pasta pelo mesmo motor.
const fs = require('fs');
const path = require('path');
const start = require('./harness');
const { openLibrary } = require('../core/library');
const { syncLibrary } = require('../core/sync');
const { FolderRemote } = require('../core/sync-folder');
const { Menu } = require('electron');
const { DriveRemote } = require('../core/sync-drive');
const { tokenSource } = require('../core/oauth-device');
const { nodeHttp } = require('../core/net-node');
const { startMockGoogle } = require('./mock-google');

(async () => {
  const c = await start('MindCraft e2e — sincronização opcional (pasta)');
  const { js, wait, waitFor, eq, ok, t, TMP, USERDATA } = c;
  const SHARED = path.join(TMP, 'drive'); fs.mkdirSync(SHARED, { recursive: true });
  const other = openLibrary(path.join(TMP, 'outro-aparelho.db')); const otherState = {};
  const otherSync = () => syncLibrary(other, new FolderRemote(SHARED), otherState);
  const cfgFile = path.join(USERDATA, 'sync.json');
  const text = (sel) => js(`(document.querySelector(${JSON.stringify(sel)}) || {}).textContent || ''`);
  const click = (sel) => js(`document.querySelector(${JSON.stringify(sel)}).click(); true`);
  const appTitles = () => js(`getLibrary().listMaps().map((m) => m.title).sort()`);
  const mkMap = (title) => js(`(() => { const m = new MindMap(createNode(${JSON.stringify(title)}), { name: ${JSON.stringify(title)} }); m.addChild(m.root.id, 'Tópico A'); m.addChild(m.root.id, 'Tópico B'); return getLibrary().saveMap(m, { snapshot: false }); })()`);
  const waitText = async (sel, re, ms = 20000) => { await waitFor(async () => re.test(await text(sel)), ms); return text(sel); };
  const syncNow = async () => { await click('#syncNow'); await waitFor(async () => /Pronto|Não sincronizou/.test(await text('#syncMsg')), 30000); return text('#syncMsg'); };

  await t('desligada por padrão: nada de arquivo de configuração, nada na pasta; o item saiu do menu de release (0.5.0)', async () => {
    await wait(1500);
    ok(!fs.existsSync(cfgFile), 'sem sync.json'); eq(fs.readdirSync(SHARED), [], 'pasta intacta');
    const all = []; const walk = (m) => { for (const i of m.items || []) { all.push(i.label); if (i.submenu) walk(i.submenu); } }; walk(Menu.getApplicationMenu());
    ok(!all.some((l) => /Sincronização/.test(l)), 'menu não deve mais ter Sincronização: ' + all.join('|'));
  });

  let idA, idB;
  await t('abre a tela; sem pasta o botão "Sincronizar agora" fica desativado', async () => {
    idA = await mkMap('Direito Administrativo'); idB = await mkMap('Português');
    await js('act.sync(); true'); await waitFor(() => js('!!document.querySelector("#syncBox")'));
    eq(await js('document.querySelector("#syncNow").disabled'), true); ok(/Desligada/.test(await text('#syncInfo')));
    await c.shot(path.join(__dirname, '..', 'evidencias', 'sync', '01-desligada.png'));
  });

  await t('escolher a pasta liga; sincronizar envia os 2 mapas (arquivos em maps/, sem temporários)', async () => {
    await js(`window.__dlg.folder = ${JSON.stringify(SHARED)}; true`); await click('#syncPick'); await waitFor(() => js('!document.querySelector("#syncNow").disabled'));
    eq(JSON.parse(fs.readFileSync(cfgFile, 'utf8')).enabled, true);
    const msg = await syncNow(); ok(/2 enviado/.test(msg), msg);
    const files = fs.readdirSync(path.join(SHARED, 'maps')); eq(files.length, 2); ok(files.every((f) => /\.mom$/.test(f) && !/tmp|teste/.test(f)), files.join());
    await c.shot(path.join(__dirname, '..', 'evidencias', 'sync', '02-enviado.png'));
    const again = await syncNow(); ok(/0 enviado\(s\), 0 recebido/.test(again) && /2 já igual/.test(again), again);
  });

  await t('o outro aparelho recebe tudo; uma edição dele chega ao app (e a versão antiga é guardada)', async () => {
    const r = await otherSync(); eq(r.pulled, 2);
    const m = other.loadMap(idA); m.update(m.root.children[0].id, { notes: 'feito no tablet — ção 😀' }); other.saveMap(m, { snapshot: false }); await otherSync();
    const msg = await syncNow(); ok(/1 recebido/.test(msg), msg);
    eq(await js(`getLibrary().loadMap(${JSON.stringify(idA)}).root.children[0].notes`), 'feito no tablet — ção 😀');
    ok(await js(`getLibrary().listSnapshots(${JSON.stringify(idA)}).some((s) => s.reason === 'antes de sincronizar')`), 'versão anterior guardada');
  });

  await t('CONFLITO: os dois editaram o mesmo mapa → as duas versões ficam; nada se perde; depois estabiliza', async () => {
    await js(`(() => { const lib = getLibrary(), m = lib.loadMap(${JSON.stringify(idB)}); m.update(m.root.id, { title: 'Português (editado no PC)' }); lib.saveMap(m, { snapshot: false }); })()`);
    const m = other.loadMap(idB); m.update(m.root.id, { title: 'Português (editado no tablet)' }); other.saveMap(m, { snapshot: false }); await otherSync();
    const msg = await syncNow(); ok(/1 conflito/.test(msg), msg);
    const ts = await appTitles(); const copies = ts.filter((x) => /^Português \(da sincronização/.test(x)); eq(copies.length, 1, ts.join('|'));
    eq(await js(`getLibrary().loadMap(${JSON.stringify(idB)}).root.title`), 'Português (editado no PC)', 'o mapa do PC continua como estava');
    eq(await js(`(() => { const l = getLibrary(); const c = l.listMaps().find((x) => /da sincronização/.test(x.title)); return l.loadMap(c.id).root.title; })()`), 'Português (editado no tablet)', 'a versão do outro aparelho está inteira na cópia');
    const n = ts.length; await syncNow(); await syncNow(); eq((await appTitles()).length, n, 'sem cópias a mais');
    await c.shot(path.join(__dirname, '..', 'evidencias', 'sync', '03-conflito.png'));
  });

  await t('mapa ABERTO com alterações não salvas NÃO é trocado: fica adiado e o texto digitado continua', async () => {
    await js(`closeModal(); openFromLibrary(${JSON.stringify(idA)}, { confirm: false }); true`); await wait(500);
    await js(`map.update(map.root.id, { title: 'rascunho que não pode sumir' }); dirty = true; render(); true`);
    const m = other.loadMap(idA); m.update(m.root.id, { title: 'mudança remota' }); other.saveMap(m, { snapshot: false }); await otherSync();
    await js('act.sync(); true'); await waitFor(() => js('!!document.querySelector("#syncBox")'));
    const msg = await syncNow(); ok(/Pronto/.test(msg), msg); ok((await text('#syncList')).includes('adiado'), await text('#syncList'));
    eq(await js('map.root.title'), 'rascunho que não pode sumir'); eq(await js('dirty'), true);
    await js('dirty = false; closeModal(); true');
  });

  await t('mapa aberto SEM alterações é atualizado na tela quando chega versão nova', async () => {
    await js(`openFromLibrary(${JSON.stringify(idA)}, { confirm: false }); true`); await wait(400);
    await js('act.sync(); true'); await waitFor(() => js('!!document.querySelector("#syncBox")'));
    const msg = await syncNow(); ok(/Pronto/.test(msg), msg); await wait(500);
    eq(await js('map.root.title'), 'mudança remota'); await js('closeModal(); true');
  });

  await t('pasta sumiu (disco desconectado): mensagem clara, nada é criado no lugar, biblioteca intacta', async () => {
    const before = await appTitles();
    const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8')); cfg.dir = path.join(TMP, 'disco-ausente', 'drive'); fs.writeFileSync(cfgFile, JSON.stringify(cfg));
    await js('act.sync(); true'); await waitFor(() => js('!!document.querySelector("#syncBox")'));
    const msg = await syncNow(); ok(/Não sincronizou: A pasta de sincronização não existe/.test(msg), msg);
    ok(!fs.existsSync(path.join(TMP, 'disco-ausente')), 'não criou a pasta'); eq(await appTitles(), before);
    cfg.dir = SHARED; fs.writeFileSync(cfgFile, JSON.stringify(cfg)); await js('closeModal(); true');
  });

  await t('sincronizar sozinho ao abrir: só se o usuário ligou; ligado, traz o que veio de fora', async () => {
    const m = other.loadMap(idB); m.update(m.root.id, { notes: 'nota nova' }); other.saveMap(m, { snapshot: false }); await otherSync();
    const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8')); cfg.auto = false; fs.writeFileSync(cfgFile, JSON.stringify(cfg));
    await js('autoSyncOnOpen()'); eq(await js(`getLibrary().loadMap(${JSON.stringify(idB)}).root.notes || ''`), '', 'desligado: não mexe');
    cfg.auto = true; fs.writeFileSync(cfgFile, JSON.stringify(cfg)); await js('autoSyncOnOpen()');
    eq(await js(`getLibrary().loadMap(${JSON.stringify(idB)}).root.notes`), 'nota nova'); ok(/Sincronizado/.test(await js('document.querySelector("#status").textContent')));
  });

  await t('desligar: mantém mapas e pasta; o botão volta a ficar desativado; configuração guarda enabled=false', async () => {
    const before = await appTitles(), files = fs.readdirSync(path.join(SHARED, 'maps')).length;
    await js('act.sync(); true'); await waitFor(() => js('!!document.querySelector("#syncBox")')); await click('#syncOff'); await wait(200);
    eq(JSON.parse(fs.readFileSync(cfgFile, 'utf8')).enabled, false); eq(await js('document.querySelector("#syncNow").disabled'), true);
    eq(await appTitles(), before); eq(fs.readdirSync(path.join(SHARED, 'maps')).length, files);
    await js('autoSyncOnOpen()'); await js('closeModal(); true');
    await c.shot(path.join(__dirname, '..', 'evidencias', 'sync', '04-desligada-de-novo.png'));
  });

  await t('GOOGLE DRIVE: entrar com código, enviar, o outro aparelho receber; desligar esquece o login (e não apaga nada)', async () => {
    const g = await startMockGoogle(); try {
      await js(`window.__syncTestUrls = ${JSON.stringify(g.urls)}; act.sync(); true`); await waitFor(() => js('!!document.querySelector("#syncBox")'));
      await js(`const k = document.querySelector('#syncKind'); k.value = 'drive'; k.onchange(); true`);
      eq(await js('document.querySelector("#syncDrive").hidden'), false); eq(await js('document.querySelector("#syncPick").hidden'), true);
      await click('#syncLogin'); ok(/Preencha/.test(await text('#syncMsg')), 'sem ID/segredo não tenta');
      await js(`document.querySelector('#syncClientId').value = ${JSON.stringify(g.S.clientId)}; document.querySelector('#syncClientSecret').value = 'segredo-errado'; true`);
      await click('#syncLogin'); await waitText('#syncUserCode', /ABCD-EFGH/); g.S.deviceApproved = true;
      await c.shot(path.join(__dirname, '..', 'evidencias', 'sync', '05-drive-codigo.png'));
      await waitFor(async () => /Não consegui entrar|Conectado/.test(await text('#syncMsg')), 20000); ok(/Não consegui entrar/.test(await text('#syncMsg')), 'segredo errado é recusado: ' + await text('#syncMsg'));
      ok(!fs.existsSync(cfgFile) || JSON.parse(fs.readFileSync(cfgFile, 'utf8')).kind !== 'drive', 'nada gravado após falha');
      await js(`document.querySelector('#syncClientSecret').value = ${JSON.stringify(g.S.clientSecret)}; true`); g.S.deviceApproved = false;
      await click('#syncLogin'); await waitText('#syncUserCode', /ABCD-EFGH/); g.S.deviceApproved = true;
      await waitFor(async () => /Conectado/.test(await text('#syncMsg')), 20000);
      const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8')); eq([cfg.enabled, cfg.kind], [true, 'drive']); ok(cfg.drive.auth.refreshToken === 'rt-1');
      const msg = await syncNow(); ok(/enviado/.test(msg) && !/problema/.test(msg), msg);
      const sent = [...g.S.files.values()].filter((f) => /\.mom$/.test(f.name)); ok(sent.length >= 3, 'arquivos no Drive falso: ' + sent.length);
      const dev = { auth: { refreshToken: 'rt-1' } }; const gt = tokenSource({ http: nodeHttp, clientId: g.S.clientId, clientSecret: g.S.clientSecret, auth: dev.auth, urls: g.urls });
      const lib2 = openLibrary(path.join(TMP, 'tablet.db')); const rep = await syncLibrary(lib2, new DriveRemote({ http: nodeHttp, getToken: gt, api: g.urls.api, upload: g.urls.upload }), {});
      ok(rep.pulled >= 3 && !rep.errors.length, JSON.stringify(rep.errors)); ok(lib2.listMaps().some((x) => x.title === 'Direito Administrativo')); lib2.close();
      await c.shot(path.join(__dirname, '..', 'evidencias', 'sync', '06-drive-conectado.png'));
      const n = [...g.S.files.values()].length; await click('#syncOff'); await wait(200);
      const off = JSON.parse(fs.readFileSync(cfgFile, 'utf8')); eq(off.enabled, false); eq(off.drive.auth, null, 'login esquecido'); ok(!/rt-1/.test(fs.readFileSync(cfgFile, 'utf8')), 'refresh token não ficou no arquivo');
      eq([...g.S.files.values()].length, n, 'nada apagado no Drive'); await js('closeModal(); true');
    } finally { await g.close(); await js('delete window.__syncTestUrls; true'); }
  });
  await t('nenhum arquivo foi apagado da pasta em toda a sessão; nenhum erro de console', async () => {
    const files = fs.readdirSync(path.join(SHARED, 'maps')); ok(files.length >= 5, files.length + ' versões guardadas na pasta');
    eq(c.errors, [], 'erros de console'); other.close();
  });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
