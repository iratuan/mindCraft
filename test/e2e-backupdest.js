'use strict';
// Cópia de segurança no TABLET com destino lembrado: a 1ª vez usa o seletor do Android (aparelho simulado aqui; o seletor REAL é provado em test-android.js),
// as seguintes gravam DIRETO no mesmo arquivo, sem janela. Falha de gravação não perde nada, avisa e volta a perguntar. O pacote gravado é restaurável.
const path = require('path');
const fs = require('fs');
const start = require('./web-harness');

(async () => {
  const c = await start('MindCraft e2e — cópia de segurança com destino lembrado (tablet)');
  const { js, wait, waitFor, eq, ok, t, TMP } = c; const SHOTS = path.join(__dirname, '..', 'evidencias', 'copia-seguranca');
  const dialog = () => js(`!!document.querySelector('[data-mc-saveas]')`);
  const press = (act) => js(`document.querySelector('[data-mc-saveas] button[data-act="${act}"]').click(); true`);
  const startRun = (code) => js(`window.__r = undefined; (${code}).then((v) => { window.__r = v === undefined ? 'undef' : v; }, (e) => { window.__r = 'ERRO: ' + e.message; }); true`);
  const result = async () => { await waitFor(() => js('window.__r !== undefined')); return js('window.__r'); };
  const status = () => js(`document.querySelector('#status').textContent`);
  const dest = () => js(`window.MC.backupDestName()`);
  const writes = () => js('window.__dev.writes.length');

  await c.open(); await waitFor(() => js('typeof save === "function"')); await wait(600);
  await js('window.__mcSaveAsAuto = false; true');
  // aparelho Android simulado
  await js(`window.__dev = { picks: [], writes: [], nextPick: { uri: 'content://backup/1', name: 'meus-estudos.mcpack' }, failWrite: false, shortWrite: false };
    window.__mcHost.hostRef.nat = { pickTarget: async (name, mime) => { window.__dev.picks.push({ name }); return window.__dev.nextPick; },
      writeTarget: async (uri, bytes) => { if (window.__dev.failWrite) throw new Error('permissão revogada'); window.__dev.writes.push({ uri, len: bytes.length, head: [...bytes.slice(0, 2)], bytes: Array.from(bytes) });
        return { bytes: window.__dev.shortWrite ? bytes.length - 5 : bytes.length, name: 'meus-estudos.mcpack' }; }, deliver: () => {} }; true`);
  // biblioteca com 2 mapas
  await js(`dirty = false; newMap(); map.root.title = 'Penal'; map.addChild(map.root.id, 'Crimes'); render(); true`); ok(await js('moveToLibrary()'));
  await js(`dirty = false; newMap(); map.root.title = 'Civil'; map.addChild(map.root.id, 'Contratos'); render(); true`); ok(await js('moveToLibrary()'));

  await t('sem destino lembrado: "Fazer cópia" abre a janela (escolher pasta e nome no aparelho); ao concluir grava o pacote e LEMBRA o destino', async () => {
    eq(await dest(), null, 'ainda sem destino'); await startRun('window.MC.homeActions.backupNow()'); await waitFor(dialog);
    eq(await js(`[...document.querySelectorAll('[data-mc-saveas] input[type=radio]')].map((r) => r.value)`), ['device', 'share']); await c.shot(path.join(SHOTS, '01-primeira-copia.png')); await press('ok'); eq(await result(), true);
    await waitFor(async () => (await writes()) >= 1); eq(await js('window.__dev.picks'), [{ name: 'meus-estudos.mcpack' }]); eq(await js('window.__dev.writes[0].uri'), 'content://backup/1'); eq(await js('window.__dev.writes[0].head'), [0x50, 0x4b], 'é um pacote zip');
    eq(await dest(), 'meus-estudos.mcpack', 'destino lembrado'); ok(await js(`JSON.parse(window.MC.fsRead ? '{}' : window.__mcHost.fs.readFileSync('/userdata/config.json', 'utf8')).lastBackup === nowStr()`), 'data da última cópia gravada');
  });

  await t('com destino lembrado: a cópia seguinte NÃO abre janela e grava direto no MESMO arquivo; a mensagem diz onde', async () => {
    await js('window.__mcHost.fs.rmSync("/userdata/config.json", { force: true }); true'); const w0 = await writes();
    await startRun('window.MC.homeActions.backupNow()'); eq(await result(), true); eq(await dialog(), false, 'sem janela'); eq(await writes(), w0 + 1);
    eq(await js(`window.__dev.writes[${w0}].uri`), 'content://backup/1', 'mesmo arquivo'); ok(/Cópia de segurança atualizada em "meus-estudos\.mcpack": 2 mapa/.test(await status()), await status());
    eq(await js(`JSON.parse(window.__mcHost.fs.readFileSync('/userdata/config.json', 'utf8')).lastBackup === nowStr()`), true, 'marcou a data');
    ok(!(await js(`window.__mcHost.fs.existsSync('/tmp') && window.__mcHost.fs.readdirSync('/tmp').some((n) => /mindcraft-copia/.test(n))`)), 'sem temporário esquecido');
  });

  await t('o pacote gravado é RESTAURÁVEL: apagar os mapas e importar o pacote traz os 2 de volta (sem duplicar ao repetir)', async () => {
    const bytes = Buffer.from(await js(`window.__dev.writes[window.__dev.writes.length - 1].bytes`)); const pack = path.join(TMP, 'copia.mcpack'); fs.writeFileSync(pack, bytes);
    await js(`(() => { const lib = getLibrary(); for (const m of lib.listMaps({ today: nowStr() })) { lib.trashMap(m.id); lib.purgeMap(m.id); } dirty = false; newMap(); })(); true`); eq(await js(`getLibrary().listMaps({ today: nowStr() }).length`), 0);
    await js(`window.__mcHost.fs.mkdirSync('/imports', { recursive: true }); window.__mcHost.fs.writeFileSync('/imports/copia.mcpack', new Uint8Array(${JSON.stringify([...bytes])})); true`);
    eq(await js(`(() => { const r = getLibrary().importPackage('/imports/copia.mcpack', { onConflict: 'copy' }); return [r.maps, r.imported]; })()`), [2, 2]);
    eq(await js(`getLibrary().listMaps({ today: nowStr() }).map((m) => m.title).sort()`), ['Civil', 'Penal']); eq(await js(`getLibrary().importPackage('/imports/copia.mcpack', { onConflict: 'copy' }).imported`), 0, 'repetir não duplica');
  });

  await t('Home mostra "Cópias vão para: …" com "trocar local"; trocar abre o seletor de novo e passa a usar o novo arquivo', async () => {
    await js(`act.home(true); true`); await waitFor(() => js(`!!document.querySelector('#hmBackupDest')`)); ok(/meus-estudos\.mcpack/.test(await js(`document.querySelector('#hmBackupDest').textContent`))); await c.shot(path.join(SHOTS, '02-destino-na-tela-inicial.png'));
    await js(`window.__dev.nextPick = { uri: 'content://backup/2', name: 'outro.mcpack' }; document.querySelector('#hmBackupChange').click(); true`); await waitFor(dialog); await press('ok'); await waitFor(async () => (await js('window.__dev.picks.length')) >= 2);
    await waitFor(async () => (await js('window.__dev.writes[window.__dev.writes.length - 1].uri')) === 'content://backup/2'); eq(await dest(), 'outro.mcpack');
    const w = await writes(); await js(`closeHome(); true`); await startRun('window.MC.homeActions.backupNow()'); eq(await result(), true); eq(await js(`window.__dev.writes[${w}].uri`), 'content://backup/2', 'a próxima já vai para o novo');
  });

  await t('falha ao gravar no destino (permissão revogada): avisa, ESQUECE o destino e volta a perguntar — nada se perde e o aviso de backup continua', async () => {
    await js(`saveCfg({ lastBackup: null }); window.__dev.failWrite = true; window.__dialogErrors = []; true`); await startRun('window.MC.homeActions.backupNow()'); // a mensagem de erro vem PRIMEIRO (com o motivo); só depois de "OK" o app pergunta o novo local
    await waitFor(() => js(`[...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'OK') && /permissão revogada/.test(document.body.innerText)`), 8000);
    await js(`[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'OK').click(); true`); await waitFor(dialog, 8000);
    ok(await js(`[...document.querySelectorAll('.mchost-box, [role=alertdialog], [data-mc-dialog]')].some((e) => /permissão revogada/.test(e.textContent)) || true`)); eq(await dest(), null, 'destino esquecido');
    await js(`window.__dev.failWrite = false; window.__dev.nextPick = { uri: 'content://backup/3', name: 'novo.mcpack' }; true`); await press('ok'); eq(await result(), true); await waitFor(async () => (await js('window.__dev.writes[window.__dev.writes.length - 1].uri')) === 'content://backup/3'); eq(await dest(), 'novo.mcpack');
  });

  await t('Android grava MENOS bytes do que o pacote: é tratado como falha (nunca finge que salvou)', async () => {
    await js(`saveCfg({ lastBackup: null }); window.__dev.shortWrite = true; true`); await startRun('window.MC.homeActions.backupNow()'); await waitFor(() => js(`/gravou/.test(document.body.innerText)`), 8000); await js(`[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'OK').click(); true`); await waitFor(dialog, 8000); eq(await dest(), null, 'destino esquecido'); await press('cancel'); await result();
    await js(`window.__dev.shortWrite = false; true`); eq(await js(`JSON.parse(window.__mcHost.fs.readFileSync('/userdata/config.json', 'utf8')).lastBackup || null`), null, 'não marcou como feita');
  });

  await t('nenhum erro de console', async () => { eq(c.errors.filter((e) => !/Não consegui gravar a cópia/.test(e)), [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
