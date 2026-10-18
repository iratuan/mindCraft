'use strict';
// "Salvar como" na versão web/tablet: a pessoa EDITA O NOME e ESCOLHE O DESTINO (documentos do app, arquivo do aparelho pelo seletor do Android, compartilhar/baixar).
// O seletor do Android é simulado por um "aparelho falso" injetado (`__mcHost.hostRef.nat`); o seletor REAL é provado na bateria Android (test-android.js).
const fs = require('fs');
const path = require('path');
const start = require('./web-harness');
const { readMom } = require('../core/mom');

(async () => {
  const c = await start('MindCraft e2e — Salvar como (nome e local editáveis)');
  const { js, wait, waitFor, eq, ok, t, TMP } = c; const SHOTS = path.join(__dirname, '..', 'evidencias', 'salvar-como');
  const vfs = (p) => js(`window.__mcHost.fs.existsSync(${JSON.stringify(p)})`);
  const ls = (d) => js(`window.__mcHost.fs.readdirSync(${JSON.stringify(d)}).sort()`);
  const dialog = () => js(`!!document.querySelector('[data-mc-saveas]')`);
  const setName = (v) => js(`(() => { const i = document.querySelector('[data-mc-saveas] input[type=text]'); i.value = ${JSON.stringify(v)}; i.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
  const press = (act) => js(`document.querySelector('[data-mc-saveas] button[data-act="${act}"]').click(); true`);
  const startSave = (code) => js(`window.__r = undefined; (${code}).then((v) => { window.__r = v === undefined ? 'undef' : v; }); true`);
  const result = async () => { await waitFor(() => js('window.__r !== undefined')); return js('window.__r'); };
  const bytesOf = (p) => js(`Array.from(window.__mcHost.fs.readFileSync(${JSON.stringify(p)}))`).then((a) => Buffer.from(a));
  const newMap = (title) => js(`dirty = false; filePath = null; newMap(); map.root.title = ${JSON.stringify(title)}; map.addChild(map.root.id, 'Tópico A'); selectedId = map.root.id; render(); dirty = true; true`);

  await c.open(); await waitFor(() => js('typeof save === "function"')); await wait(600);
  await js('window.__mcSaveAsAuto = false; true');

  await t('Salvar de um mapa NOVO abre a janela com o nome sugerido (editável) e o destino; o foco vai ao nome e a extensão fica de fora da seleção', async () => {
    await newMap('Direito Administrativo'); await startSave('save(false)'); await waitFor(dialog);
    eq(await js(`document.querySelector('[data-mc-saveas] input[type=text]').value`), 'Direito Administrativo.mom');
    eq(await js(`document.activeElement === document.querySelector('[data-mc-saveas] input[type=text]')`), true, 'foco no nome');
    eq(await js(`(() => { const i = document.querySelector('[data-mc-saveas] input[type=text]'); return [i.selectionStart, i.selectionEnd]; })()`), [0, 'Direito Administrativo'.length], 'seleciona só o nome');
    eq(await js(`[...document.querySelectorAll('[data-mc-saveas] input[type=radio]')].map((r) => r.value)`), ['docs'], 'sem aparelho nativo: só "Documentos do MindCraft"');
    ok(/Onde salvar/.test(await js(`document.querySelector('[data-mc-saveas]').textContent`))); await c.shot(path.join(SHOTS, '01-janela.png'));
    await press('cancel'); eq(await result(), false, 'cancelar não salva'); eq(await vfs('/docs/Direito Administrativo.mom'), false); eq(await js('dirty'), true, 'continua com alterações');
  });

  await t('editar o nome e salvar: o arquivo nasce com o nome ESCOLHIDO (extensão .mom garantida), o mapa passa a ser esse arquivo e fica "limpo"', async () => {
    await startSave('save(false)'); await waitFor(dialog); await setName('Plano de estudos 2026'); await press('ok'); eq(await result(), true);
    ok(await vfs('/docs/Plano de estudos 2026.mom'), (await ls('/docs')).join()); eq(await js('filePath'), '/docs/Plano de estudos 2026.mom'); eq(await js('dirty'), false);
    const m = readMom(await bytesOf('/docs/Plano de estudos 2026.mom')); eq(m.root.title, 'Direito Administrativo');
  });

  await t('Ctrl+S depois disso NÃO pergunta de novo (atualiza o mesmo arquivo); "Salvar como…" pergunta, com o nome atual, e cria um arquivo NOVO sem mexer no anterior', async () => {
    await js(`map.addChild(map.root.id, 'Tópico B'); dirty = true; true`); await startSave('save(false)'); eq(await result(), true); eq(await dialog(), false, 'sem janela no Salvar');
    eq(readMom(await bytesOf('/docs/Plano de estudos 2026.mom')).root.children.length, 5, 'o Ctrl+S gravou o Tópico B');
    const bk = await js("window.__mcHost.fs.vfs.paths().files.filter((p) => p.startsWith('/userdata/backups'))"); ok(bk.length >= 1, 'backup da versão anterior criado antes de sobrescrever: ' + JSON.stringify(bk));
    await startSave('save(true)'); await waitFor(dialog); eq(await js(`document.querySelector('[data-mc-saveas] input[type=text]').value`), 'Direito Administrativo.mom', 'sugere o título do mapa');
    await setName('Cópia com outro nome.mom'); await press('ok'); eq(await result(), true);
    eq(await js('filePath'), '/docs/Cópia com outro nome.mom'); eq((await ls('/docs')).filter((n) => /Plano|Cópia/.test(n)), ['Cópia com outro nome.mom', 'Plano de estudos 2026.mom']); eq(readMom(await bytesOf('/docs/Plano de estudos 2026.mom')).root.children.length, 5, 'o original ficou como estava');
  });

  await t('nome vazio é recusado (a janela continua); Enter confirma; Esc cancela; nome hostil vira nome seguro sem pastas', async () => {
    await js(`dirty = true; true`); await startSave('save(true)'); await waitFor(dialog); await setName('   '); await press('ok'); await wait(150); eq(await dialog(), true, 'continua aberta'); eq(await js('window.__r'), undefined);
    await js(`document.querySelector('[data-mc-saveas] input[type=text]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); true`); eq(await result(), false);
    await startSave('save(true)'); await waitFor(dialog); await setName('../../etc/passwd<>:"|?*.mom'); await js(`document.querySelector('[data-mc-saveas] input[type=text]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })); true`); eq(await result(), true, 'Enter confirma');
    const names = await ls('/docs'); ok(names.some((n) => /^passwd_{2,}.*\.mom$/.test(n) || /passwd/.test(n)), names.join()); eq(await vfs('/etc/passwd.mom'), false); ok((await js('filePath')).startsWith('/docs/'), await js('filePath'));
  });

  await t('mesmo nome de arquivo já existente: pergunta antes de substituir; "Cancelar" não altera o arquivo existente', async () => {
    const before = (await bytesOf('/docs/Plano de estudos 2026.mom')).length; await js(`map.addChild(map.root.id, 'Tópico C'); dirty = true; true`);
    await startSave('save(true)'); await waitFor(dialog); await setName('Plano de estudos 2026'); await press('ok');
    await waitFor(() => js(`!!document.querySelector('[data-mc-dialog]:not([data-mc-saveas])')`)); ok(/Já existe/.test(await js(`document.querySelector('[data-mc-dialog]:not([data-mc-saveas])').textContent`)));
    await js(`document.querySelector('[data-mc-dialog]:not([data-mc-saveas]) button[data-idx="1"]').click(); true`); eq(await result(), false); eq((await bytesOf('/docs/Plano de estudos 2026.mom')).length, before, 'intacto');
  });

  await t('exportar (Markdown): a janela deixa editar o nome e a entrega usa o nome escolhido', async () => {
    await js(`window.__downloads.length = 0; true`); await startSave(`doExport('md')`); await waitFor(dialog);
    eq(await js(`[...document.querySelectorAll('[data-mc-saveas] input[type=radio]')].map((r) => r.value)`), ['share'], 'sem aparelho nativo: "Baixar"'); ok(/\.md$/.test(await js(`document.querySelector('[data-mc-saveas] input[type=text]').value`)));
    await setName('Resumo da semana'); await press('ok'); await waitFor(async () => (await js('window.__downloads.length')) > 0, 8000);
    eq(await js('window.__downloads[0].name'), 'Resumo da semana.md');
  });

  // ---------- aparelho Android simulado (seletor de documentos do sistema) ----------
  await js(`window.__dev = { picks: [], writes: [], nextPick: null, failWrite: false };
    window.__mcHost.hostRef.nat = { pickTarget: async (name, mime) => { window.__dev.picks.push({ name, mime }); return window.__dev.nextPick; },
      writeTarget: async (uri, bytes) => { if (window.__dev.failWrite) throw new Error('permissão revogada'); window.__dev.writes.push({ uri, len: bytes.length, head: [...bytes.slice(0, 2)] }); return { bytes: bytes.length }; }, deliver: () => {} }; true`);

  await t('APARELHO: a janela oferece "Escolher pasta e nome no aparelho…"; o seletor do sistema devolve o arquivo escolhido (nome editado lá) e cada Salvar o ATUALIZA', async () => {
    await newMap('Mapa para o aparelho'); await js(`window.__dev.nextPick = { uri: 'content://docs/1', name: 'Meu Mapa (Drive).mom' }; true`); await startSave('save(false)'); await waitFor(dialog);
    eq(await js(`[...document.querySelectorAll('[data-mc-saveas] input[type=radio]')].map((r) => r.value)`), ['docs', 'device']); await c.shot(path.join(SHOTS, '02-janela-aparelho.png'));
    await js(`document.querySelector('[data-mc-saveas] input[value="device"]').click(); true`); await setName('rascunho do dia'); await press('ok'); eq(await result(), true);
    eq(await js('window.__dev.picks'), [{ name: 'rascunho do dia.mom', mime: 'application/octet-stream' }], 'o seletor recebe o nome que a pessoa digitou');
    await waitFor(async () => (await js('window.__dev.writes.length')) >= 1); eq(await js('window.__dev.writes[0].uri'), 'content://docs/1'); eq(await js('window.__dev.writes[0].head'), [0x50, 0x4b], 'é um .mom (zip) válido');
    eq(await js('filePath'), '/docs/Meu Mapa (Drive).mom', 'o mapa passa a ter o nome escolhido no seletor'); ok(await vfs('/docs/Meu Mapa (Drive).mom'), 'cópia segura no app');
    await js(`map.addChild(map.root.id, 'Mais um'); dirty = true; true`); await startSave('save(false)'); eq(await result(), true); eq(await dialog(), false, 'Ctrl+S não pergunta');
    await waitFor(async () => (await js('window.__dev.writes.length')) >= 2); eq(await js('window.__dev.writes[1].uri'), 'content://docs/1', 'atualiza o MESMO arquivo escolhido'); ok((await js('window.__dev.writes[1].len')) !== (await js('window.__dev.writes[0].len')));
  });

  await t('a escolha sobrevive a fechar e reabrir o app: Ctrl+S continua atualizando o arquivo do aparelho', async () => {
    await c.idle(); await c.open(); await waitFor(() => js('typeof save === "function"')); await wait(800); await js('window.__mcSaveAsAuto = false; true');
    await js(`window.__dev = { picks: [], writes: [], nextPick: null, failWrite: false }; window.__mcHost.hostRef.nat = { writeTarget: async (uri, bytes) => { if (window.__dev.failWrite) throw new Error('permissão revogada'); window.__dev.writes.push({ uri, len: bytes.length }); return {}; }, pickTarget: async () => window.__dev.nextPick, deliver: () => {} }; true`);
    await js(`openPath('/docs/Meu Mapa (Drive).mom'); true`); await waitFor(() => js('filePath === "/docs/Meu Mapa (Drive).mom"')); await wait(300);
    await js(`map.addChild(map.root.id, 'Depois de reabrir'); dirty = true; true`); await startSave('save(false)'); eq(await result(), true); await waitFor(async () => (await js('window.__dev.writes.length')) >= 1); eq(await js('window.__dev.writes[0].uri'), 'content://docs/1');
  });

  await t('cancelar o seletor do sistema não salva nada nem deixa lixo; falha ao gravar no aparelho mostra mensagem clara e a cópia no app continua segura', async () => {
    await js(`window.__dev.picks.length = 0; window.__dev.nextPick = null; true`); await newMap('Não deve ser salvo'); const before = await ls('/docs');
    await startSave('save(false)'); await waitFor(dialog); await js(`document.querySelector('[data-mc-saveas] input[value="device"]').click(); true`); await press('ok'); eq(await result(), false); eq(await ls('/docs'), before, 'nada criado'); eq(await js('filePath'), null);
    await js(`window.__dev.nextPick = { uri: 'content://docs/2', name: 'Falha.mom' }; window.__dev.failWrite = true; true`); await startSave('save(false)'); await waitFor(dialog); await js(`document.querySelector('[data-mc-saveas] input[value="device"]').click(); true`); await press('ok'); eq(await result(), true);
    await waitFor(() => js(`!!document.querySelector('[data-mc-dialog]:not([data-mc-saveas])')`), 8000); const msg = await js(`document.querySelector('[data-mc-dialog]:not([data-mc-saveas])').textContent`); ok(/Não consegui gravar em "Falha.mom"/.test(msg) && /permissão revogada/.test(msg) && /Salvar como/.test(msg), msg);
    ok(await vfs('/docs/Falha.mom'), 'a cópia no app existe'); await js(`document.querySelector('[data-mc-dialog]:not([data-mc-saveas]) button').click(); window.__dev.failWrite = false; true`);
  });

  await t('exportar PARA O APARELHO (não .mom): grava no arquivo escolhido uma vez e não deixa resto em /exports; a opção "Compartilhar" continua existindo', async () => {
    await js(`window.__dev.writes.length = 0; window.__dev.nextPick = { uri: 'content://docs/3', name: 'resumo.md' }; true`); await startSave(`doExport('md')`); await waitFor(dialog);
    eq(await js(`[...document.querySelectorAll('[data-mc-saveas] input[type=radio]')].map((r) => r.value)`), ['device', 'share']); await js(`document.querySelector('[data-mc-saveas] input[value="device"]').checked = true; true`); await press('ok');
    await waitFor(async () => (await js('window.__dev.writes.length')) >= 1, 8000); eq(await js('window.__dev.writes[0].uri'), 'content://docs/3'); await wait(300); eq(await ls('/exports'), [], '/exports limpo');
    eq(await js(`Object.keys(JSON.parse(window.__mcHost.fs.readFileSync('/userdata/targets.json', 'utf8'))).filter((k) => k.startsWith('/exports/'))`), [], 'destino de uso único removido');
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
