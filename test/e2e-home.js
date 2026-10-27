'use strict';
// Ponta a ponta da TELA INICIAL: início configurável, continuar, recentes, atalhos, biblioteca, provas, arrastar e soltar, bloqueio de navegação.
const fs = require('fs');
const path = require('path');
const start = require('./harness');
const { writeMom } = require('../core/mom');
const { openLibrary } = require('../core/library');
const { MindMap, createNode } = require('../core/model');
const S = require('../core/study');
const { TODAY, concurso, d } = require('./fixtures');

(async () => {
  const c = await start('MindCraft e2e — tela inicial');
  const { js, wait, eq, ok, t, TMP, USERDATA } = c;
  const txt = (s) => js(`document.querySelector(${JSON.stringify(s)}).textContent`);
  const click = (s) => js(`document.querySelector(${JSON.stringify(s)}).click()`);
  const homeOpen = () => js(`!document.querySelector('#home').hidden && !!document.querySelector('#home .hm')`);
  const cfgFile = path.join(USERDATA, 'config.json'), recentFile = path.join(USERDATA, 'recent.json'), dbFile = path.join(USERDATA, 'biblioteca.db');
  const f1 = path.join(TMP, 'Direito Penal.mom'), f2 = path.join(TMP, 'Português.mom'), f3 = path.join(TMP, 'Informática.mom'), gone = path.join(TMP, 'sumiu.mom');
  const mk = (title, kids, exam) => { const m = new MindMap(createNode(title)); m.meta.name = title; for (const k of kids) m.addChild(m.root.id, k); if (exam) m.setExam(exam); return m; };
  writeMom(mk('Direito Penal', ['Crimes', 'Penas']), f1); writeMom(mk('Português', ['Crase', 'Regência']), f2); writeMom(mk('Informática', ['Redes']), f3);
  const setRecent = (list) => fs.writeFileSync(recentFile, JSON.stringify(list));
  const reinit = async (cfg) => { await js(`dirty = false; closeHome(); newMap(); window.__dlg.discard = 1; true`); if (cfg === null) fs.rmSync(cfgFile, { force: true }); else fs.writeFileSync(cfgFile, JSON.stringify(cfg)); await js('init()'); await wait(400); };
  const row = (sel) => js(`[...document.querySelectorAll(${JSON.stringify(sel)})].map((r) => r.querySelector('b').textContent)`);

  await t('início configurável: padrão = tela inicial; reabrir o último; mapa em branco; compatível com a opção antiga', async () => {
    setRecent([f1, f2]);
    await reinit({}); ok(await homeOpen(), 'sem configuração: abre a tela inicial'); eq(await js(`document.querySelector('#home').dataset.ui`), 'react'); eq(await js('filePath'), null);
    await reinit({ startScreen: 'blank' }); eq(await homeOpen(), false); eq(await js('filePath'), null);
    await reinit({ startScreen: 'last' }); await c.waitFor(() => js(`filePath === ${JSON.stringify(f1)}`)); eq(await homeOpen(), false);
    await reinit({ reopenLast: true }); await c.waitFor(() => js(`filePath === ${JSON.stringify(f1)}`)); eq(await homeOpen(), false, 'opção antiga reopenLast:true = reabrir');
    await reinit({ reopenLast: false }); eq(await homeOpen(), false); eq(await js('filePath'), null);
    await reinit({ startScreen: 'home', reopenLast: true }); ok(await homeOpen(), 'a nova opção vence a antiga');
    await reinit({ startScreen: 'home' }); await click('#hmClose'); eq(await homeOpen(), false, 'fechar volta ao mapa em branco');
  });

  await t('conteúdo: continuar de onde parou, recentes (inclui arquivo sumido), saudação e data', async () => {
    setRecent([f2, f1, gone, f3]); await reinit({ startScreen: 'home' });
    ok((await txt('.hm-head h1')).match(/^(Bom dia|Boa tarde|Boa noite)!$/)); ok((await txt('.hm-head .sub')).length > 8);
    ok((await txt('#hmContinue')).includes('Continuar de onde parou') && (await txt('#hmContinue')).includes('Português') && (await txt('#hmContinue')).includes('2 tópicos'), await txt('#hmContinue'));
    eq(await row('#hmRecent .hm-row'), ['Português', 'Direito Penal', 'sumiu', 'Informática']); eq(await js(`[...document.querySelectorAll('#hmRecent .hm-row')].map((r) => r.classList.contains('missing'))`), [false, false, true, false]);
    ok((await txt('#hmRecent .hm-row.missing')).includes('arquivo não encontrado'));
    await click('#hmRecent .hm-row.missing .hm-open'); await wait(150); ok(await homeOpen(), 'abrir um arquivo sumido avisa e mantém a tela'); ok((await txt('#status')).includes('Arquivo não encontrado'), await txt('#status'));
  });

  await t('abrir recente / continuar: abre o mapa, fecha a tela inicial; alterações pendentes perguntam (cancelar mantém tudo)', async () => {
    await js(`closeHome(); newMap(); map.root.title = 'Não salvo'; dirty = true; render(); window.__dlg.discard = 2; act.home(true)`); await c.waitFor(() => homeOpen());
    await click('#hmContinue'); await wait(300); eq(await js('map.root.title'), 'Não salvo', 'cancelou: nada mudou'); ok(await homeOpen()); eq(await js('dirty'), true);
    await js('window.__dlg.discard = 1'); await click('#hmRecent .hm-row:nth-child(3) .hm-open'); await c.waitFor(() => js(`filePath === ${JSON.stringify(f1)}`)); eq(await homeOpen(), false); eq(await js('map.root.title'), 'Direito Penal'); eq(await js('dirty'), false);
    await js(`act.home(true)`); await c.waitFor(() => homeOpen()); await click('#hmContinue'); await c.waitFor(() => js(`filePath === ${JSON.stringify(f1)}`)); eq(await homeOpen(), false, 'o primeiro recente (o último aberto) é o "continuar"');
  });

  await t('atalhos: novo em branco, modelo de concurso, abrir arquivo (cancelar mantém a tela), CSV, edital, biblioteca, PDF e revisão', async () => {
    await js(`act.home(true)`); await c.waitFor(() => homeOpen()); await click('#hmNew'); await c.waitFor(() => js(`!document.querySelector('#home') || document.querySelector('#home').hidden`)); eq(await js('filePath'), null); ok(await js('map.root.children.length') >= 0);
    await js(`act.home(true)`); await c.waitFor(() => homeOpen()); await click('#hmTemplate'); await c.waitFor(() => js(`!!document.querySelector('#tplList')`)); await click('#tplGeneric'); await c.waitFor(() => js(`map.root.title.startsWith('Concurso')`)); eq(await homeOpen(), false); ok((await js('map.root.children.length')) >= 5, 'modelo com disciplinas');
    await js(`dirty = false; act.home(true)`); await c.waitFor(() => homeOpen()); await js('window.__dlg.open = null'); await click('#hmOpen'); await wait(300); ok(await homeOpen(), 'cancelar o diálogo mantém a tela inicial');
    await js(`window.__dlg.open = ${JSON.stringify(f3)}`); await click('#hmOpen'); await c.waitFor(() => js(`filePath === ${JSON.stringify(f3)}`)); eq(await homeOpen(), false);
    const modals = { '#hmCsv': '#csvBox', '#hmEdital': '#impTitle', '#hmLib': '#libBox' };
    for (const [btn, sel] of Object.entries(modals)) { await js(`act.home(true)`); await c.waitFor(() => homeOpen()); await click(btn); await c.waitFor(() => js(`!!document.querySelector(${JSON.stringify(sel)})`)); eq(await homeOpen(), false, btn + ' fecha a tela inicial'); await js(`closeModal()`); }
    await js(`act.home(true)`); await c.waitFor(() => homeOpen()); await click('#hmPdf'); await c.waitFor(() => js(`!document.querySelector('#pdfpane').hidden`)); eq(await homeOpen(), false); await js('act.pdf()');
    await js(`act.home(true)`); await c.waitFor(() => homeOpen()); await click('#hmReview'); await c.waitFor(() => js(`!!document.querySelector('#rvBox')`)); eq(await homeOpen(), false); await js(`closeModal()`);
  });

  await t('lista de recentes: ✕ tira um (arquivo e menu), "limpar lista" esvazia; os arquivos em si não são tocados', async () => {
    setRecent([f1, f2, f3]); await js(`act.home(true)`); await c.waitFor(() => homeOpen()); await wait(200);
    await click('#hmRecent .hm-row:nth-child(3) .hm-x'); await c.waitFor(async () => (await row('#hmRecent .hm-row')).length === 2);   // 3º filho = 2ª linha (o 1º filho é o título)
    eq(JSON.parse(fs.readFileSync(recentFile, 'utf8')), [f1, f3]); eq(await row('#hmRecent .hm-row'), ['Direito Penal', 'Informática']); ok(fs.existsSync(f2), 'o arquivo continua no disco');
    const recentMenu = c.Menu.getApplicationMenu().items.find((i) => i.label === 'Arquivo').submenu.items.find((i) => i.label === 'Abrir recente').submenu.items.map((i) => i.label); ok(!recentMenu.includes(f2) && recentMenu.includes(f1), recentMenu.join('|'));
    await click('#hmClearRecent'); await c.waitFor(() => js(`document.querySelectorAll('#hmRecent .hm-row').length === 0`)); ok((await txt('#hmRecent')).includes('Nenhum arquivo aberto ainda')); eq(JSON.parse(fs.readFileSync(recentFile, 'utf8')), []); eq(await js(`!!document.querySelector('#hmClearRecent')`), false);
  });

  await t('biblioteca na tela inicial: mapas recentes, revisões vencidas (e atalho para revisar) e próximas provas ordenadas', async () => {
    const lib = openLibrary(dbFile); const a = concurso().m; a.root.title = a.meta.name = 'Concurso A'; a.setExam({ name: 'Prova A', date: d(30) });
    const b = mk('Concurso B', ['X', 'Y'], { name: 'Prova B', date: d(5) }); const e = mk('Concurso C (sem prova)', ['Z']); const past = mk('Concurso D', ['W'], { name: 'Antiga', date: d(-3) });
    const idA = lib.saveMap(a), idB = lib.saveMap(b); lib.saveMap(e); lib.saveMap(past); lib.close();
    await js(`window.__today = '${TODAY}'; dirty = false; closeHome(); act.home(true)`); await c.waitFor(() => homeOpen()); await wait(300);
    ok((await txt('#hmLibList')).includes('Concurso A') && (await txt('#hmLibList')).includes('Concurso C') && (await txt('#hmLibAll')).includes('ver todos (4)'), await txt('#hmLibList'));
    eq(await js(`[...document.querySelectorAll('#hmExams .hm-exam')].map((x) => x.querySelector('b').textContent + '|' + x.querySelector('span').textContent.split(' · ')[1])`), ['Prova B|em 5 dias', 'Prova A|em 30 dias'], 'só provas futuras, a mais próxima primeiro');
    eq(await js(`document.querySelector('#hmExams .hm-exam').classList.contains('soon')`), true, 'prova em ≤ 14 dias destacada');
    const todayTxt = await txt('#hmToday'); ok(/\d+ revisão\(ões\) vencida\(s\)/.test(todayTxt) && todayTxt.includes('em 1 mapa(s)') && todayTxt.includes('Concurso A'), todayTxt);
    await click('#hmToday .hm-chip'); await c.waitFor(() => js(`!!document.querySelector('#rvBox')`), 10000); eq(await js('map.meta.libId'), idA); eq(await homeOpen(), false, 'chip abre o mapa já na revisão do dia'); await js('closeModal()');
    await js(`dirty = false; act.home(true)`); await c.waitFor(() => homeOpen()); await click('#hmExams .hm-exam'); await c.waitFor(() => js(`map.meta.libId === ${JSON.stringify(idB)}`)); eq(await js('map.root.title'), 'Concurso B'); eq(await homeOpen(), false);
    await js(`dirty = false; act.home(true)`); await c.waitFor(() => homeOpen()); await click('#hmLibAll'); await c.waitFor(() => js(`!!document.querySelector('#libBox')`)); eq(await homeOpen(), false); await js('closeModal()');
  });

  await t('"continuar de onde parou" usa a biblioteca quando o último mapa veio dela; sem nada para continuar o cartão não aparece', async () => {
    await js(`dirty = false; closeHome(); window.__dlg.discard = 1; true`); fs.writeFileSync(cfgFile, JSON.stringify({ startScreen: 'home', lastKind: 'lib', lastLib: await js('map.meta.libId') })); await js(`act.home(true)`); await c.waitFor(() => homeOpen());
    ok((await txt('#hmContinue')).includes('Concurso B') && (await txt('#hmContinue')).includes('Biblioteca'), await txt('#hmContinue')); ok((await txt('#hmContinue')).includes('prova em 5 dias'), await txt('#hmContinue'));
    await js(`window.__dlg.discard = 1`); await click('#hmContinue'); await c.waitFor(() => js(`map.root.title === 'Concurso B' && !document.querySelector('#home .hm')`));
    fs.writeFileSync(cfgFile, JSON.stringify({ startScreen: 'home' })); setRecent([gone]); await js(`act.home(true)`); await c.waitFor(() => homeOpen()); eq(await js(`!!document.querySelector('#hmContinue')`), false, 'sem último válido: sem cartão');
  });

  await t('Esc, botão da barra, menu e atalho alternam a tela; abrir painel de estudos/grafo a fecha; mapa aberto não é alterado', async () => {
    await js(`closeHome(); dirty = false; true`); const before = await js(`JSON.stringify(map.root)`);
    await click('[data-act="home"]'); await c.waitFor(() => homeOpen()); await js(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`); await c.waitFor(() => js(`document.querySelector('#home').hidden`));
    await js(`ipcRenderer.emit('menu', {}, 'home')`); await c.waitFor(() => homeOpen()); await js(`ipcRenderer.emit('menu', {}, 'home')`); await c.waitFor(() => js(`document.querySelector('#home').hidden`));
    ok(c.Menu.getApplicationMenu().items.find((i) => i.label === 'Arquivo').submenu.items.some((i) => i.label === 'Tela inicial' && i.accelerator === 'CmdOrCtrl+Shift+H'));
    await js(`act.home(true)`); await c.waitFor(() => homeOpen()); await js('act.dash()'); await wait(200); eq(await js(`document.querySelector('#home').hidden`), true); await js('closeDash()');
    await js(`act.home(true)`); await c.waitFor(() => homeOpen()); await js('act.graph()'); await wait(200); eq(await js(`document.querySelector('#home').hidden`), true); await js('closeGraph && closeGraph()');
    await js(`act.home(true)`); await c.waitFor(() => homeOpen()); await js(`document.querySelector('#hmStart').value`); eq(await js('dirty'), false); eq(await js(`JSON.stringify(map.root)`), before);
  });

  await t('opção "Ao iniciar" grava no config.json e vale na próxima inicialização', async () => {
    await js(`closeHome(); act.home(true)`); await c.waitFor(() => homeOpen());
    await js(`(() => { const s = document.querySelector('#hmStart'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, 'last'); s.dispatchEvent(new Event('change', { bubbles: true })); })()`); await wait(200);
    eq(JSON.parse(fs.readFileSync(cfgFile, 'utf8')).startScreen, 'last'); eq(await js(`document.querySelector('#hmStart').value`), 'last');
    setRecent([f3]); await reinit(JSON.parse(fs.readFileSync(cfgFile, 'utf8'))); await c.waitFor(() => js(`filePath === ${JSON.stringify(f3)}`)); eq(await homeOpen(), false);
  });

  await t('arrastar e soltar: .mom abre (perguntando sobre pendências), .pdf abre no leitor, outros avisam; soltar NUNCA navega a janela', async () => {
    await js(`closeHome(); dirty = false; window.__dlg.discard = 1; true`);
    ok(await js(`MC.handleDroppedPaths([${JSON.stringify(f2)}])`)); eq(await js('filePath'), f2);
    await js(`map.root.title = 'pendente'; dirty = true; window.__dlg.discard = 2; true`); eq(await js(`MC.handleDroppedPaths([${JSON.stringify(f1)}])`), false); eq(await js('filePath'), f2, 'cancelou: continua no mesmo mapa'); eq(await js('map.root.title'), 'pendente');
    await js(`window.__dlg.discard = 1; true`); ok(await js(`MC.handleDroppedPaths([${JSON.stringify(f1)}])`)); eq(await js('filePath'), f1);
    const pdf = path.join(TMP, 'x.pdf'); await new Promise((res) => { const P = require('pdfkit'); const doc = new P(); const o = fs.createWriteStream(pdf); doc.pipe(o); o.on('finish', res); doc.text('Texto do PDF solto'); doc.end(); });
    ok(await js(`MC.handleDroppedPaths(['C:/lixo.txt', ${JSON.stringify(pdf)}])`)); await c.waitFor(() => js(`document.querySelectorAll('.pdf-page').length === 1`), 15000); await js('act.pdf()');
    eq(await js(`MC.handleDroppedPaths(['C:/foto.png'])`), false); ok((await txt('#status')).includes('Arraste um arquivo'), await txt('#status'));
    const prevented = await js(`(() => { const dt = new DataTransfer(); dt.items.add(new File(['x'], 'foto.png', { type: 'image/png' })); const ov = new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true }); document.body.dispatchEvent(ov); const dr = new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }); document.body.dispatchEvent(dr); return [ov.defaultPrevented, dr.defaultPrevented]; })()`);
    eq(prevented, [true, true], 'dragover e drop são tratados (sem navegar)');
    const href = await js('location.href'); await js(`location.href = 'file:///C:/Windows/win.ini'; true`).catch(() => {}); await wait(500); eq(await js('location.href'), href, 'a janela não navegou para outro arquivo'); eq(await js(`typeof map`), 'object');
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
