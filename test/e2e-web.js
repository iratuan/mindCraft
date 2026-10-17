'use strict';
// Ponta a ponta da VERSÃO WEB/TABLET: a MESMA interface do desktop, num Chromium SEM Node (sem require/fs/process reais),
// com o hospedeiro emulando o Electron. Cobre: inicialização, salvar/abrir, durabilidade (reabrir e até "travar"), biblioteca SQLite,
// estudo (questões por banca, erros), pacote entre desktop↔web, PDF, menu, diálogos, arrastar-e-soltar e recursos ainda indisponíveis.
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const start = require('./web-harness');
const { writeMom, readMom } = require('../core/mom');
const { openLibrary } = require('../core/library');
const S = require('../core/study');
const { TODAY, concurso } = require('./fixtures');

const SHOTS = path.join(__dirname, '..', 'evidencias', 'web');
const b64 = (buf) => Buffer.from(buf).toString('base64');

(async () => {
  const c = await start('MindCraft e2e — versão web/tablet (sem Node)');
  const { js, wait, waitFor, eq, ok, t, TMP } = c;
  fs.rmSync(SHOTS, { recursive: true, force: true }); fs.mkdirSync(SHOTS, { recursive: true });
  const txt = (s) => js(`document.querySelector(${JSON.stringify(s)}).textContent`);
  const click = (s) => js(`document.querySelector(${JSON.stringify(s)}).click()`);
  const setVal = (sel, v) => js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); const proto = e.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(e, ${JSON.stringify(v)}); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  const select = async (title) => { await js(`showPanel('study'); __sel(${JSON.stringify(title)}); true`); await wait(150); };
  const reopen = async () => { await c.idle(); await c.open(); };
  const vfsHas = (p) => js(`window.__mcHost.fs.existsSync(${JSON.stringify(p)})`);

  await c.open();
  // utilitários de teste dentro da página (não fazem parte do app)
  const helpers = async () => js(`window.__sel = (title) => { let r; map.walk((n) => { if (n.title === title && !r) r = n.id; }); selectedId = r; selIds = new Set([r]); render(); return r; }; window.__st = (title) => { let r; map.walk((n) => { if (n.title === title) r = n; }); return r.study; }; true`);
  await helpers();

  await t('inicia sem Node: ambiente emulado, tela inicial, interface React, nenhum erro de console', async () => {
    const r = await js(`({ host: document.documentElement.dataset.host, nodeVersion: (typeof process !== 'undefined' && process.versions && process.versions.node) || null, req: typeof require, home: !document.querySelector('#home').hidden, ui: document.querySelector('#home').dataset.ui, scripts: window.__MC_APP_SCRIPTS.length, menuBtn: !!document.querySelector('#mcHostMenuBtn') })`);
    eq([r.host, r.nodeVersion, r.req, r.home, r.ui, r.menuBtn], ['web', null, 'function', true, 'react', true]); ok(r.scripts >= 7, 'scripts da interface');
    await c.shot(path.join(SHOTS, '01-tela-inicial.png'));
  });

  await t('editar e salvar um mapa: .mom vai para os documentos do app, "recentes" registra, e tudo sobrevive a fechar e reabrir o app', async () => {
    await js(`closeHome(); newMap(); map.root.title = 'Direito Administrativo'; const a = map.addChild(map.root.id, 'Licitações'); selectedId = a.id; render(); dirty = true; true`); await wait(150);
    ok(await js(`save(true)`), 'salvou'); const p = await js('filePath'); ok(/^\/docs\/.+\.mom$/.test(p), 'caminho: ' + p); eq(await js('dirty'), false);
    ok(await vfsHas(p)); eq(await js(`window.__mcHost.ipc.loadRecent()`), [p]);
    await reopen(); await helpers(); ok(await vfsHas(p), 'o arquivo sobreviveu ao reinício');
    await js(`closeHome(); dirty = false; openPath(${JSON.stringify(p)}); true`); await waitFor(() => js(`filePath === ${JSON.stringify(p)}`));
    eq(await js('map.root.title'), 'Direito Administrativo'); eq(await js(`map.root.children.map((x) => x.title).includes('Licitações')`), true);
    eq((await js(`window.__mcHost.ipc.loadRecent()`))[0], p);
  });

  await t('desfazer e refazer funcionam; o .mom salvo na web é lido pelo desktop (mesmo conteúdo)', async () => {
    await js('act.undo(); true'); await js('act.redo(); true');
    const p = await js('filePath'); const bytes = await js(`Array.from(window.__mcHost.fs.readFileSync(${JSON.stringify(p)}))`);
    const m = readMom(Buffer.from(bytes)); eq(m.root.title, 'Direito Administrativo'); ok(m.root.children.some((x) => x.title === 'Licitações'));
  });

  await t('biblioteca SQLite: guardar, verificar, buscar; e o BANCO inteiro sobrevive a fechar e reabrir', async () => {
    ok(await js(`moveToLibrary(); inLibrary()`), 'mapa na biblioteca'); const id = await js('map.meta.libId'); await c.idle();
    await reopen(); await helpers();
    const r = await js(`(() => { const l = getLibrary(); return { n: l.listMaps().length, title: l.loadMap(${JSON.stringify(id)}).root.title, found: l.searchTopics('Licita').length, integrity: l.integrityCheck() }; })()`);
    eq(r, { n: 1, title: 'Direito Administrativo', found: 1, integrity: ['ok'] });
  });

  await t('DURABILIDADE: depois de guardar na biblioteca, mesmo com o app TRAVANDO sem aviso (sem fechar direito), nada se perde', async () => {
    await js(`closeHome(); dirty = false; openFromLibrary(getLibrary().listMaps()[0].id, { confirm: false }); true`); await waitFor(() => js('inLibrary()'));
    await js(`map.root.title = 'Alterado antes de travar'; dirty = true; save(false); true`); await waitFor(() => js('dirty === false'), 5000); await wait(300);   // janela de risco real: o navegador grava no aparelho de forma assíncrona (ordem de ~10–50 ms); se o app morrer DENTRO dela, a última gravação se perde   // a gravação no aparelho é assíncrona (≈30 ms)
    c.win.webContents.forcefullyCrashRenderer(); await wait(600);
    await c.open(); await helpers(); c.errors = c.errors.filter((e) => !/processo da página caiu/.test(e));
    eq(await js(`getLibrary().listMaps().map((m) => m.title)`), ['Alterado antes de travar'], 'a gravação confirmada sobreviveu');
    eq(await js(`getLibrary().integrityCheck()`), ['ok']);
  });

  await t('estudo: questões por banca/ano, erro com origem, refazer, Painel de estudos (React) — e tudo persiste', async () => {
    await js(`closeHome(); window.__today = '${TODAY}'; openFromLibrary(getLibrary().listMaps()[0].id, { confirm: false }); true`); await waitFor(() => js(`inLibrary()`));
    await js(`map.addChild(map.root.id, 'Crase'); render(); true`); await select('Crase');
    const setBanca = (v) => js(`setQBanca(${JSON.stringify(v)})`);
    const reg = async (b, y, d, o) => { await setBanca(b); await setVal('#qAno', y); await setVal('#qDone', String(d)); await setVal('#qOk', String(o)); await click('#qAdd'); await wait(120); };
    await reg('CESPE', '2024', 10, 4); await reg('cespé', '2024', 5, 5); await reg('FGV', '2023', 10, 9);
    await setBanca('FGV'); await setVal('#qAno', '2023'); await setVal('#errWhy', 'confundi'); await setVal('#errNote', 'literal x teleológico'); await click('#errAdd'); await wait(150);
    const s = await js(`__st('Crase')`); eq(s.qsrc.map((r) => [r.banca, r.year, r.done, r.correct]), [['CESPE', 2024, 15, 9], ['FGV', 2023, 10, 9]]); eq(s.errs[0].banca, 'FGV');
    await js('act.dash()'); await wait(500);
    eq(await js(`[...document.querySelectorAll('#qsrcBanca tbody tr')].map((r) => [...r.children].slice(0, 2).map((x) => x.textContent).join(' ')).join(' | ')`), 'CESPE 9/15 | FGV 9/10');
    await js(`document.querySelector('#errSec').scrollIntoView()`); await click('#errSec [data-act="err-redo-ok"]'); await wait(300);
    ok((await txt('#errStats')).startsWith('0 para refazer · 1 refeito(s)'), await txt('#errStats')); await c.shot(path.join(SHOTS, '02-painel-de-estudos.png')); await js('closeDash(); true');
    await js('save(false)'); await c.idle(); await reopen(); await helpers();
    const by = await js(`getLibrary().questionsBySource().banca.map((b) => [b.name, b.done])`); eq(by, [['CESPE', 15], ['FGV', 10]]);
  });

  await t('pacote .mcpack: a web EXPORTA (download) e o DESKTOP importa; o desktop EXPORTA e a web importa — com configurações', async () => {
    // web → desktop
    await js(`saveCfg({ startScreen: 'last', notifyDaily: true, notifyAt: '07:45' }); closeHome(); openLibraryModal(); true`); await waitFor(() => js(`!!document.querySelector('#libExpPack')`));
    await click('#libExpPack'); await waitFor(async () => (await c.downloads()).length === 1, 8000);
    const dl = (await c.downloads())[0]; ok(/\.mcpack$/.test(dl.name) && dl.len > 500, JSON.stringify({ n: dl.name, len: dl.len })); eq(await vfsHas('/exports/' + dl.name), false, 'o arquivo temporário foi limpo depois da entrega');
    const pack = Buffer.from(dl.b64, 'base64'); eq(pack.subarray(0, 2).toString(), 'PK');
    const desk = openLibrary(path.join(TMP, 'desk.db')); const rep = desk.importPackage(pack); eq([rep.imported, rep.settings.notifyAt, rep.settings.startScreen], [1, '07:45', 'last']);
    eq(desk.questionsBySource().banca.map((b) => [b.name, b.done]), [['CESPE', 15], ['FGV', 10]]); eq(desk.openErrors().length, 0, 'o erro foi refeito'); desk.close();
    // desktop → web (em outro "aparelho": partição nova, vazia)
    const fresh = openLibrary(path.join(TMP, 'desk2.db')); const m = concurso().m; m.root.title = m.meta.name = 'Do desktop'; m.setExam({ name: 'TRF', date: '2026-12-01' }); fresh.saveMap(m);
    const pk = fresh.exportPackage(null, { settings: { startScreen: 'blank', light: true } }); fresh.close();
    await c.open({ partition: 'persist:aparelho2-' + Date.now() }); await helpers();
    await c.pickNext([{ name: 'do-desktop.mcpack', b64: b64(pk.buffer) }]); await js('closeHome(); openLibraryModal(); true'); await waitFor(() => js(`!!document.querySelector('#libImpPack')`));
    await click('#libImpPack'); await waitFor(() => js(`getLibrary().listMaps().length === 1`), 8000);
    eq(await js(`getLibrary().listMaps()[0].title`), 'Do desktop'); eq(await js(`[loadCfg().startScreen, document.body.classList.contains('light')]`), ['blank', true]); ok((await txt('#libMsg')).includes('Configurações restauradas'), await txt('#libMsg'));
    eq(await js(`getLibrary().loadMap(getLibrary().listMaps()[0].id).root.children.length`), concurso().m.root.children.length);
    await c.shot(path.join(SHOTS, '03-biblioteca-importada.png')); await js('closeModal(); true');
  });

  await t('leitor de PDF: escolher o arquivo, ver a página, e o PDF fica guardado no aparelho', async () => {
    const pdf = path.join(TMP, 'aula.pdf'); await new Promise((res) => { const d = new PDFDocument({ size: 'A4' }); const o = fs.createWriteStream(pdf); d.pipe(o); o.on('finish', res); d.fontSize(14).text('Licitação é o procedimento administrativo. '.repeat(20)); d.end(); });
    await c.pickNext([{ name: 'aula.pdf', b64: b64(fs.readFileSync(pdf)) }]); await js('act.pdf(); true'); await waitFor(() => js(`!!document.querySelector('#pdfOpen')`)); await click('#pdfOpen');
    await waitFor(() => js(`document.querySelectorAll('.pdf-page').length === 1`), 20000); await wait(500);
    ok(await vfsHas('/pdfs/aula.pdf'), 'guardado em /pdfs'); ok((await js(`document.querySelector('#pdfPageCount').textContent`)).includes('1'), 'contagem de páginas'); await c.shot(path.join(SHOTS, '04-leitor-de-pdf.png')); await js('act.pdf(); true');
  });

  await t('importar CSV de edital pelo seletor de arquivos: pré-visualização e mapa criado', async () => {
    const csv = 'id;disciplina;item;topico;peso\n1;Direito;1;Princípios;3\n2;Direito;2;Atos administrativos;4\n3;Português;1;Crase;2\n';
    await c.pickNext([{ name: 'edital.csv', b64: b64(csv) }]); await js('act.csv(); true'); await waitFor(() => js(`!!document.querySelector('#csvPick')`)); await click('#csvPick');
    await waitFor(() => js(`!document.querySelector('#csvPreview').hidden`), 8000); ok((await txt('#csvPreview')).includes('Direito'), await txt('#csvPreview'));
    await setVal('#csvTitle', 'Concurso de teste'); await js(`dirty = false; true`); await click('#csvOk'); await wait(500);
    eq(await js(`map.root.title`), 'Concurso de teste'); ok((await js(`(() => { let n = 0; map.walk(() => n++); return n; })()`)) >= 5, 'tópicos criados'); await js('closeModal && closeModal(); true');
  });

  await t('menu ☰: abre, lista os comandos do desktop, dispara o mesmo comando; o aviso "alterações não salvas" é um diálogo real (Descartar/Cancelar)', async () => {
    await js(`closeHome(); dirty = true; map.root.title = 'sujo'; true`);
    await click('#mcHostMenuBtn'); eq(await js(`document.querySelector('#mcHostMenu').hidden`), false); ok((await js(`document.querySelectorAll('#mcHostMenu button[data-cmd]').length`)) >= 15, 'itens do menu');
    await click('#mcHostMenu [data-cmd="new"]'); await waitFor(() => js(`!!document.querySelector('.mchost-ov')`)); ok((await txt('.mchost-box')).includes('alterações não salvas'), await txt('.mchost-box'));
    await click('.mchost-btns button[data-idx="2"]'); await wait(300); eq(await js(`map.root.title`), 'sujo', 'Cancelar mantém o mapa'); eq(await js(`!!document.querySelector('.mchost-ov')`), false);
    await click('#mcHostMenuBtn'); await click('#mcHostMenu [data-cmd="new"]'); await waitFor(() => js(`!!document.querySelector('.mchost-ov')`));
    await js(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`); await wait(300); eq(await js(`map.root.title`), 'sujo', 'Esc = Cancelar');
    await click('#mcHostMenuBtn'); await click('#mcHostMenu [data-cmd="new"]'); await waitFor(() => js(`!!document.querySelector('.mchost-ov')`)); await click('.mchost-btns button[data-idx="1"]'); await wait(400);
    eq(await js(`map.root.title`), 'Ideia central', 'Descartar abre um mapa novo'); eq(await js('dirty'), false);
  });

  await t('arrastar e soltar um .mom na janela abre o mapa (arquivo vai para os documentos do app)', async () => {
    const m = concurso().m; m.root.title = m.meta.name = 'Arrastado'; const bytes = writeMom(m);
    await js(`(async () => { const dt = new DataTransfer(); dt.items.add(new File([Uint8Array.from(atob(${JSON.stringify(b64(bytes))}), (c) => c.charCodeAt(0))], 'arrastado.mom')); window.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true })); })()`);
    await waitFor(() => js(`filePath === '/docs/arrastado.mom'`), 8000); eq(await js('map.root.title'), 'Arrastado');
  });

  await t('recursos ainda indisponíveis no tablet avisam com clareza (sem travar): PDF exportado, pasta do Obsidian, aviso sem permissão', async () => {
    await js(`window.__r = {}; ipcRenderer.invoke('render-export', 'pdf', map.toJSON(), {}).catch((e) => { window.__r.pdf = e.message; }); true`); await waitFor(() => js(`!!window.__r.pdf`));
    ok((await js('window.__r.pdf')).includes('tablet'), await js('window.__r.pdf'));
    eq(await js(`ipcRenderer.invoke('dialog:folder', 'x')`), null); eq((await js(`ipcRenderer.invoke('obsidian:open', '/x')`)).ok, false);
    // notificação: dublê do Notification do navegador (o do Chromium/Electron concede permissão sozinho e mostraria um aviso de verdade)
    await js(`window.__notes = []; window.Notification = class { constructor(t, o) { window.__notes.push({ t, body: o && o.body }); this.me = this; window.__lastNote = this; } static get permission() { return window.__perm; } static requestPermission() { return Promise.resolve(window.__perm = window.__grant ? 'granted' : 'denied'); } }; window.__perm = 'denied'; true`);
    eq(await js(`ipcRenderer.invoke('notify:show', { title: 'x', body: 'y' })`), false, 'sem permissão do sistema → não mostra, não quebra'); eq(await js('window.__notes.length'), 0);
    await js(`window.__perm = 'default'; window.__grant = true; true`); eq(await js(`ipcRenderer.invoke('notify:show', { title: 'MindCraft — hora de estudar', body: '2 revisões vencidas' })`), true, 'permissão concedida → mostra');
    eq(await js('window.__notes'), [{ t: 'MindCraft — hora de estudar', body: '2 revisões vencidas' }]); eq(await js(`ipcRenderer.invoke('notify:show', { body: 'sem título' })`), false);
    await js(`window.__menu = []; ipcRenderer.on('menu', (e, c) => window.__menu.push(c)); window.__lastNote.onclick(); true`); eq(await js('window.__menu'), ['review'], 'clicar no aviso abre a Revisão do dia');
    eq(await js(`ipcRenderer.invoke('open-external', 'javascript:alert(1)')`), { ok: false });
    await js(`ipcRenderer.invoke('dialog:error', 'Falha de teste <b>x</b>'); true`); await waitFor(() => js(`!!document.querySelector('.mchost-ov')`)); ok((await txt('.mchost-box')).includes('<b>x</b>'), 'texto literal, sem HTML'); await click('.mchost-btns button');
    await waitFor(() => js(`!document.querySelector('.mchost-ov')`));
  });

  await t('nomes de arquivo hostis não escapam da área do app (../, caracteres de controle, nome gigante)', async () => {
    await js(`window.__r = {}; true`);
    for (const name of ['../../etc/passwd.mom', 'a\u0000b<c>.mom', 'x'.repeat(400) + '.mom', '..', '']) {
      await c.pickNext([{ name, b64: b64(writeMom(concurso().m)) }]); const p = await js(`ipcRenderer.invoke('dialog:open')`);
      ok(typeof p === 'string' && p.startsWith('/docs/') && !p.slice(6).includes('/') && !/[\u0000-\u001f<>]/.test(p) && p.length < 140, 'caminho seguro: ' + JSON.stringify(p));
    }
    ok((await js(`window.__mcHost.fs.readdirSync('/')`)).every((n) => ['docs', 'pdfs', 'imports', 'exports', 'userdata', 'tmp'].includes(n)), 'nada fora das pastas do app: ' + (await js(`window.__mcHost.fs.readdirSync('/')`)).join(','));
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
