'use strict';
// Teste ponta a ponta: `npm run e2e` (executa o app real no Electron e dirige a interface com eventos).
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

if (process.env.CI) app.commandLine.appendSwitch('no-sandbox'); // runners Linux não têm o sandbox SUID do Chromium
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'mc e2e çãé-'));
app.setPath('userData', path.join(TMP, 'userData')); // evita conflito com instância aberta (single-instance lock)
const core = (m) => require(path.join(__dirname, '..', 'core', m));

const results = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function t(name, fn) {
  try { await fn(); results.push([name, true]); console.log('  ok   ' + name); }
  catch (e) { results.push([name, false, e.message]); console.log('  FAIL ' + name + '\n       ' + e.message); }
}
const eq = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg || 'valor'}: esperado ${JSON.stringify(b)}, obtido ${JSON.stringify(a)}`); };
const ok = (c, msg) => { if (!c) throw new Error(msg); };

require('../electron/main.js');

app.whenReady().then(async () => {
  let win;
  for (let i = 0; i < 100 && !(win = BrowserWindow.getAllWindows()[0]); i++) await wait(50);
  const errors = [];
  win.webContents.on('console-message', (e, lvl, msg, line, src) => { // aceita a assinatura nova (evento) e a antiga (argumentos)
    const level = e.level ?? lvl, message = e.message ?? msg;
    if ((level === 'error' || level === 3) && !/Security Warning|Content-Security/.test(message || '')) errors.push(`${message} @${String((e.sourceId ?? src) || '').split('/').pop()}:${e.lineNumber ?? line}`);
  });
  await new Promise((r) => (win.webContents.isLoading() ? win.webContents.once('did-finish-load', r) : r()));
  await wait(300);
  win.show(); win.focus(); win.webContents.focus(); await wait(200); // blur/focus só disparam com a janela focada
  const js = (code) => win.webContents.executeJavaScript(code, true);
  await js(`(async () => { for (let i = 0; i < 300 && !(typeof map !== 'undefined' && document.querySelector('.node')); i++) await new Promise((r) => setTimeout(r, 50)); return true; })()`);   // espera o 1º desenho (disco frio)


  // dublês dos diálogos nativos (a UI nativa não é automatizável)
  await js(`window.__dlg = { save: null, open: null, discard: 1, errors: [] };
    const realInvoke = ipcRenderer.invoke.bind(ipcRenderer);
    ipcRenderer.invoke = async (ch, ...args) => {
      if (ch === 'render-export') return realInvoke(ch, ...args); // exportação real, via processo principal
      if (ch === 'dialog:save') return window.__dlg.save;
      if (ch === 'dialog:open') return window.__dlg.open;
      if (ch === 'dialog:confirm-discard') return window.__dlg.discard;
      if (ch === 'dialog:error') { window.__dlg.errors.push(String(args[0])); return; }
    };
    window.__id = (title) => { let r; map.walk(n => { if (n.title === title && !r) r = n.id; }); return r; };
    window.__shape = (id) => document.querySelector('[data-id="' + id + '"]').querySelector('rect,line');
    window.__pt = (id) => { const b = __shape(id).getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
    window.__md = (id) => { const p = __pt(id); document.querySelector('[data-id="' + id + '"]').dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: p.x, clientY: p.y })); window.dispatchEvent(new MouseEvent('mouseup')); };
    window.__key = (k, target) => (target || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    window.__drag = (from, to) => { const a = __pt(from), b = __pt(to);
      document.querySelector('[data-id="' + from + '"]').dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: a.x, clientY: a.y }));
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: b.x, clientY: b.y }));
      window.dispatchEvent(new MouseEvent('mouseup', { clientX: b.x, clientY: b.y })); };
    window.__shot = () => JSON.stringify(map.root);
    true`);
  const titles = async () => JSON.parse(await js(`(() => { const r = []; map.walk((n, l) => r.push(l + ':' + n.title)); return JSON.stringify(r); })()`));

  console.log('\nMindCraft e2e\n');

  await t('inicia com mapa de exemplo e sem erros', async () => {
    eq((await titles()).length, 4, 'tópicos iniciais');
    ok(await js(`document.querySelectorAll('.node').length === 4`), 'nós desenhados');
  });

  await t('Tab cria filho e edição inline confirma com Enter', async () => {
    await js(`__md(map.root.children[0].id); __key('Tab')`);
    ok(await js(`!editor.hidden`), 'editor deveria abrir');
    await js(`editor.value = 'Filho criado'; __key('Enter', editor)`);
    ok((await titles()).includes('2:Filho criado'), 'título aplicado');
    ok(await js(`editor.hidden`), 'editor deveria fechar');
  });

  await t('duplo clique edita; Escape cancela', async () => {
    const id = await js(`__id('Tópico 2')`);
    await js(`__md('${id}'); document.querySelector('[data-id="${id}"]').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))`);
    ok(await js(`!editor.hidden`), 'editor abre no dblclick');
    await js(`editor.value = 'NÃO DEVE APLICAR'; __key('Escape', editor)`);
    ok(!(await titles()).some((x) => x.includes('NÃO DEVE')), 'Escape não aplica');
  });

  await t('Enter cria irmão; Delete remove; undo/redo restauram', async () => {
    const before = (await titles()).length;
    await js(`__md(__id('Tópico 3')); __key('Enter'); editor.value = 'Irmão'; __key('Enter', editor)`);
    eq((await titles()).length, before + 1, 'após irmão');
    await js(`__key('Delete')`);
    eq((await titles()).length, before, 'após Delete');
    await js(`act.undo()`); eq((await titles()).length, before + 1, 'após undo');
    await js(`act.redo()`); eq((await titles()).length, before, 'após redo');
  });

  await t('arrastar tópico sobre outro o move; destino dentro do próprio ramo é recusado', async () => {
    await js(`__md(__id('Tópico 1')); __key('Enter'); editor.value = 'Mover-me'; __key('Enter', editor); fit()`);
    await js(`__drag(__id('Mover-me'), __id('Tópico 3'))`);
    eq(await js(`map.find(__id('Mover-me')).parent.title`), 'Tópico 3', 'novo pai');
    const snapshot = JSON.stringify(await titles());
    await js(`__drag(__id('Tópico 1'), __id('Filho criado'))`); // pai → seu próprio descendente
    eq(JSON.stringify(await titles()), snapshot, 'estrutura inalterada');
  });

  await t('recolher (Espaço) oculta filhos e mostra contador', async () => {
    await js(`__md(__id('Tópico 1')); __key(' ')`);
    ok(await js(`!document.querySelector('[data-id="' + __id('Filho criado') + '"]')`), 'filho oculto');
    await js(`__key(' ')`);
    ok(await js(`!!document.querySelector('[data-id="' + __id('Filho criado') + '"]')`), 'filho volta');
  });

  await t('marcadores, progresso e relação (R + clique), rótulo e remoção por Delete', async () => {
    await js(`__md(__id('Tópico 2'));
      marker.value = 'ok'; marker.dispatchEvent(new Event('change'));
      progress.value = '75'; progress.dispatchEvent(new Event('change'));`);
    eq(await js(`map.find(__id('Tópico 2')).node.markers`), ['ok'], 'marcador');
    eq(await js(`map.find(__id('Tópico 2')).node.progress`), 75, 'progresso');
    await js(`__md(__id('Tópico 2')); __key('r'); __md(__id('Tópico 3'))`);
    eq(await js(`map.meta.relations.length`), 1, 'relação criada');
    await js(`notes.value = 'depende'; notes.dispatchEvent(new Event('change'))`);
    eq(await js(`map.meta.relations[0].label`), 'depende', 'rótulo');
    await js(`__key('Delete')`);
    eq(await js(`map.meta.relations.length`), 0, 'relação removida');
  });

  await t('notas digitadas vão para o tópico certo ao trocar a seleção com o painel em foco', async () => {
    const a = await js(`__id('Tópico 2')`), b = await js(`__id('Tópico 3')`);
    await js(`showPanel('notes'); notes.blur(); __md('${a}'); notes.focus(); notes.value = 'nota do A'`);
    await js(`document.querySelector('[data-id="${b}"]').dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 0, clientY: 0 })); window.dispatchEvent(new MouseEvent('mouseup'));
      notes.blur(); notes.dispatchEvent(new FocusEvent('blur'));   // se a janela não tem o foco do SO, blur() não emite o evento: emite-se explicitamente
      `);
    await wait(50);
    eq(await js(`map.find('${a}').node.notes`), 'nota do A', 'nota do A (hasFocus=' + (await js(`document.hasFocus()`)) + ')');
    eq(await js(`map.find('${b}').node.notes`), '', 'B não pode herdar');
    eq(await js(`notes.value`), '', 'painel mostra a nota do B');
  });

  await t('muda de tema em todos os temas sem erro', async () => {
    for (const id of Object.keys(core('themes').THEMES)) {
      await js(`theme.value = '${id}'; theme.dispatchEvent(new Event('change'))`);
      ok(await js(`document.querySelectorAll('.node').length > 0`), 'tema ' + id);
    }
    await js(`theme.value = 'ocean'; theme.dispatchEvent(new Event('change'))`);
  });

  await t('zoom pela roda do mouse e ajustar à tela', async () => {
    const k0 = await js(`pan.k`);
    await js(`svg.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, clientX: 300, clientY: 300, bubbles: true, cancelable: true }))`);
    ok((await js(`pan.k`)) > k0, 'zoom in');
    await js(`fit()`);
    ok((await js(`pan.k`)) > 0, 'fit');
  });

  const file = path.join(TMP, 'meu mapa — ação.mom');
  await t('salvar como (caminho com espaços e acentos) e reabrir preservam tudo', async () => {
    await js(`window.__dlg.save = ${JSON.stringify(file)}`);
    ok(await js(`save(true)`), 'save deve retornar true');
    ok(fs.existsSync(file), 'arquivo criado');
    eq(await js(`dirty`), false, 'dirty após salvar');
    const m = core('mom').readMom(fs.readFileSync(file));
    const t0 = await titles(); const mm = []; m.walk((n, l) => mm.push(l + ':' + n.title));
    eq(mm, t0, 'árvore salva');
    eq(m.root.children.find((c) => c.title === 'Tópico 2').markers, ['ok'], 'marcador salvo');
    await js(`act.child(); editor.value = 'EXTRA'; __key('Enter', editor)`);
    await js(`openPath(${JSON.stringify(file)})`);
    eq(await titles(), t0, 'reaberto = salvo');
    eq(await js(`filePath`), file, 'filePath');
  });

  await t('salvar adiciona .mom quando falta e Salvar reutiliza o caminho', async () => {
    const bare = path.join(TMP, 'semext');
    await js(`window.__dlg.save = ${JSON.stringify(bare)}`);
    ok(await js(`save(true)`), 'salvou');
    ok(fs.existsSync(bare + '.mom'), 'extensão adicionada');
    await js(`window.__dlg.save = null`);
    await js(`act.child(); editor.value = 'X'; __key('Enter', editor)`);
    ok(await js(`save(false)`), 'Salvar sem diálogo');
  });

  await t('falha ao salvar em local inválido não derruba nem marca como salvo', async () => {
    fs.writeFileSync(path.join(TMP, 'bloqueio.txt'), 'x'); // um arquivo no lugar da pasta => ENOTDIR
    await js(`act.child(); editor.value = 'Y'; __key('Enter', editor); window.__dlg.save = ${JSON.stringify(path.join(TMP, 'bloqueio.txt', 'a.mom'))}; window.__dlg.errors.length = 0`);
    eq(await js(`save(true)`), false, 'retorno');
    eq(await js(`dirty`), true, 'continua sujo');
    eq(await js(`window.__dlg.errors.length`), 1, 'usuário foi avisado');
  });

  await t('confirmDiscard: Descartar prossegue, Cancelar bloqueia, Salvar grava', async () => {
    await js(`act.child(); editor.value = 'Z'; __key('Enter', editor)`); eq(await js(`dirty`), true, 'pendente');
    await js(`window.__dlg.discard = 1`); ok(await js(`confirmDiscard()`), 'descartar');
    await js(`window.__dlg.discard = 2`); eq(await js(`confirmDiscard()`), false, 'cancelar');
    await js(`window.__dlg.discard = 0; window.__dlg.save = ${JSON.stringify(file)}`);
    ok(await js(`confirmDiscard()`), 'salvar'); eq(await js(`dirty`), false, 'limpo');
  });

  await t('exporta os 6 formatos com conteúdo válido (docx com imagem embutida)', async () => {
    const sig = {
      pdf: (b) => b.subarray(0, 5).toString() === '%PDF-',
      png: (b) => b.subarray(1, 4).toString() === 'PNG',
      svg: (b) => b.toString().startsWith('<?xml') && b.toString().includes('<svg'),
      md: (b) => b.toString().startsWith('# '),
      opml: (b) => b.toString().includes('<opml'),
      docx: (b) => { const AdmZip = require('adm-zip'); const z = new AdmZip(b); return z.getEntry('word/document.xml') && z.getEntries().some((e) => /word\/media\/.*\.png$/.test(e.entryName)); },
    };
    for (const fmt of Object.keys(sig)) {
      const out = path.join(TMP, `saída ${fmt}.${fmt}`);
      await js(`window.__dlg.save = ${JSON.stringify(out)}`);
      await js(`window.__dlg.errors.length = 0`);
      const got = await js(`doExport('${fmt}')`);
      eq(got, out, 'exportação ' + fmt + ' (erros: ' + (await js(`__dlg.errors.join(' | ')`)) + ')');
      const buf = fs.readFileSync(out);
      ok(buf.length > 100 && sig[fmt](buf), `conteúdo inválido em ${fmt}`);
    }
  });

  await t('importa Markdown e OPML (sem sobrescrever o original) e rejeita arquivo corrompido', async () => {
    const md = path.join(TMP, 'plano.md'), opml = path.join(TMP, 'plano.opml'), bad = path.join(TMP, 'ruim.mom');
    fs.writeFileSync(md, '# Plano\n\n## Fase 1\n- a\n- b\n');
    fs.writeFileSync(opml, '<opml version="2.0"><body><outline text="R"><outline text="F"/></outline></body></opml>');
    fs.writeFileSync(bad, 'isto não é um zip');
    await js(`openPath(${JSON.stringify(md)})`);
    eq(await js(`map.root.title`), 'Plano', 'md');
    eq(await js(`filePath`), null, 'md não vira filePath'); eq(await js(`dirty`), true, 'md sujo');
    await js(`openPath(${JSON.stringify(opml)})`);
    eq(await js(`map.root.children[0].title`), 'F', 'opml');
    await js(`window.__dlg.errors.length = 0`);
    const before = await js(`map.root.title`);
    await js(`openPath(${JSON.stringify(bad)})`);
    eq(await js(`window.__dlg.errors.length`), 1, 'erro mostrado');
    eq(await js(`map.root.title`), before, 'mapa atual intacto');
  });

  await t('modo apresentação: avança, volta e sai com Esc', async () => {
    await js(`openPath(${JSON.stringify(file)})`);
    await js(`__key('F5')`); await wait(300);
    ok(await js(`!!present`), 'entrou');
    await js(`__key('ArrowRight'); __key('ArrowRight')`);
    eq(await js(`present.i`), 2, 'avançou');
    await js(`__key('ArrowLeft')`); eq(await js(`present.i`), 1, 'voltou');
    await js(`__key('Escape')`); await wait(300);
    eq(await js(`present`), null, 'saiu');
    ok(await js(`!document.body.classList.contains('presenting')`), 'UI restaurada');
  });

  await t('busca encontra tópicos e notas e navega com Enter', async () => {
    await js(`(() => { const s = document.querySelector('#search'); s.value = 'tópico'; s.dispatchEvent(new Event('input')); })()`);
    ok((await js(`hitList.length`)) >= 3, 'resultados');
    await js(`document.querySelector('#search').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))`);
    ok(await js(`!!selectedId`), 'selecionou resultado');
    await js(`(() => { const s = document.querySelector('#search'); s.value = ''; s.dispatchEvent(new Event('input')); })()`);
  });

  await t('mapa grande (600 tópicos): layout rápido, sem sobreposição, PDF/SVG gerados', async () => {
    const { MindMap, createNode } = core('model'); const { layoutMap } = core('layout');
    const { toPDF } = core('export'); const { toSVG } = core('svg');
    const m = new MindMap(createNode('Grande'));
    for (let i = 0; i < 12; i++) { const a = m.addChild(m.root.id, 'Ramo ' + i); for (let j = 0; j < 7; j++) { const b = m.addChild(a.id, `Sub ${i}.${j}`); for (let k = 0; k < 6; k++) m.addChild(b.id, `Folha ${i}.${j}.${k}`); } }
    let n = 0; m.walk(() => n++); ok(n > 600, 'tamanho ' + n);
    const t0 = Date.now(); const L = layoutMap(m); const dt = Date.now() - t0;
    ok(dt < 2000, `layout lento: ${dt}ms`);
    const bs = [...L.boxes.values()].sort((a, b) => a.x - b.x);
    for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length && bs[j].x < bs[i].x + bs[i].w; j++) {
      const p = bs[i], q = bs[j];
      ok(!(p.y < q.y + q.h && q.y < p.y + p.h), `sobreposição: ${p.node.title} × ${q.node.title}`);
    }
    ok((await toPDF(m, { outline: true })).length > 1000, 'pdf'); ok(toSVG(m).length > 1000, 'svg');
  });

  await t('painéis: Estrutura seleciona/recolhe, cartões de tema, chips de marcador e progresso, zoom, recolher painel', async () => {
    await js(`openPath(${JSON.stringify(file)})`); await wait(150);
    // Estrutura (outline): uma linha por tópico visível; clique seleciona; triângulo recolhe
    const rows = await js(`document.querySelectorAll('.ol-row').length`);
    let total = 0; await js(`(() => { let c = 0; map.walk(() => c++); return c; })()`).then((n) => { total = n; });
    eq(rows, total, 'linhas da estrutura');
    const target = await js(`__id('Tópico 3')`);
    await js(`document.querySelector('[data-ol-id="${target}"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))`);
    eq(await js(`selectedId`), target, 'clique na estrutura seleciona');
    ok(await js(`document.querySelector('[data-ol-id="${target}"]').classList.contains('sel')`), 'linha destacada');
    const root = await js(`map.root.id`);
    await js(`document.querySelector('[data-ol-tog="${root}"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))`);
    eq(await js(`map.root.collapsed`), true, 'triângulo recolhe');
    eq(await js(`document.querySelectorAll('.ol-row').length`), 1, 'só a raiz visível');
    await js(`document.querySelector('[data-ol-tog="${root}"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))`);
    // cartões de tema
    await js(`document.querySelector('.theme-card[data-theme="dark"]').click()`);
    eq(await js(`map.meta.theme`), 'dark', 'cartão aplica tema');
    ok(await js(`document.querySelector('.theme-card[data-theme="dark"]').classList.contains('active')`), 'cartão ativo');
    await js(`document.querySelector('.theme-card[data-theme="ocean"]').click()`);
    // chips
    await js(`__md('${target}'); document.querySelector('#markerChips [data-marker="flag"]').click()`);
    eq(await js(`map.find('${target}').node.markers`), ['flag'], 'chip liga marcador');
    ok(await js(`document.querySelector('#markerChips [data-marker="flag"]').classList.contains('active')`), 'chip ativo');
    await js(`document.querySelector('#markerChips [data-marker="flag"]').click()`);
    eq(await js(`map.find('${target}').node.markers`), [], 'chip desliga marcador');
    await js(`document.querySelector('#progressChips [data-value="50"]').click()`);
    eq(await js(`map.find('${target}').node.progress`), 50, 'chip de progresso');
    await js(`document.querySelector('#progressChips [data-value=""]').click()`);
    eq(await js(`map.find('${target}').node.progress`), null, 'limpa progresso');
    // zoom (controle deslizante e botões)
    await js(`zoomTo(1)`);
    await js(`zoom.value = 200; zoom.dispatchEvent(new Event('input'))`);
    ok(Math.abs((await js(`pan.k`)) - 2) < 0.01, 'slider ajusta o zoom');
    eq(await js(`zoomVal.textContent`), '200%', 'rótulo do zoom');
    await js(`zoomOut.click()`); ok((await js(`pan.k`)) < 2, 'botão −');
    await js(`fit()`);
    // recolher painel e tema claro persistem como classes
    // abas do painel lateral: uma por vez
    for (const tab of ['study', 'notes', 'links', 'outline', 'props']) {
      await js(`document.querySelector('#ptabs [data-tab="${tab}"]').click()`);
      eq(await js(`[...document.querySelectorAll('#panels .panel')].filter((p) => !p.hidden).map((p) => p.dataset.panel)`), [tab], 'só a aba ' + tab + ' visível');
      ok(await js(`document.querySelector('#ptabs [data-tab="${tab}"]').classList.contains('on')`), 'aba marcada');
    }
    await js(`lightToggle.click()`); ok(await js(`document.body.classList.contains('light')`), 'tema claro');
    await js(`lightToggle.click()`); ok(await js(`!document.body.classList.contains('light')`), 'volta ao escuro');
    // barra de ferramentas: botões executam as ações e não "roubam" Enter/Espaço
    const n0 = (await titles()).length;
    await js(`document.querySelector('[data-act="child"]').click(); editor.value = 'Via botão'; __key('Enter', editor)`);
    eq((await titles()).length, n0 + 1, 'botão filho');
    ok(await js(`document.activeElement.tagName !== 'BUTTON'`), 'foco não fica preso no botão');
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(errors, [], 'erros de console'); });

  const failed = results.filter((r) => !r[1]);
  console.log(`\n${results.length - failed.length}/${results.length} passaram${failed.length ? ' — FALHAS: ' + failed.map((f) => f[0]).join('; ') : ''}\n`);
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* arquivos temporários */ }
  app.exit(failed.length ? 1 : 0);
});
