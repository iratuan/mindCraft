'use strict';
// Manual de uso no app REAL (Electron, mouse e teclado reais): menu Ajuda, índice, busca, navegação, "Como usar?" em cada tela,
// Esc devolve ao app, a tela inicial tem o botão, e o texto muda entre Computador e Tablet.
const path = require('path');
const { Menu } = require('electron');
const start = require('./harness');

(async () => {
  const c = await start('MindCraft e2e — manual de uso');
  const { js, wait, waitFor, eq, ok, t } = c; const wc = () => c.win.webContents; const SHOTS = path.join(__dirname, '..', 'evidencias', 'manual');
  const key = async (k, mods = []) => { wc().sendInputEvent({ type: 'keyDown', keyCode: k, modifiers: mods }); wc().sendInputEvent({ type: 'keyUp', keyCode: k, modifiers: mods }); await wait(150); };
  const open = () => js(`!!document.querySelector('#manualBox')`);
  const current = () => js(`document.querySelector('#manualBody').dataset.section`);
  const clickEl = async (sel) => { const p = await js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); wc().sendInputEvent({ type: 'mouseMove', x: Math.round(p.x), y: Math.round(p.y) }); wc().sendInputEvent({ type: 'mouseDown', x: Math.round(p.x), y: Math.round(p.y), button: 'left', clickCount: 1 }); wc().sendInputEvent({ type: 'mouseUp', x: Math.round(p.x), y: Math.round(p.y), button: 'left', clickCount: 1 }); await wait(250); };
  const typeInto = async (sel, text) => { await js(`document.querySelector(${JSON.stringify(sel)}).focus(); true`); for (const ch of text) wc().sendInputEvent({ type: 'char', keyCode: ch }); await wait(250); };

  await c.ready;
  await t('Ajuda → Manual de uso (item de menu REAL) abre o manual na 1ª seção; Esc fecha e o foco volta', async () => {
    const ajuda = Menu.getApplicationMenu().items.find((i) => i.label === 'Ajuda'); const item = ajuda.submenu.items.find((i) => i.label === 'Manual de uso'); ok(item, 'item "Manual de uso" no menu Ajuda');
    ok(ajuda.submenu.items.some((i) => i.label === 'Atalhos do teclado' && i.accelerator === 'F1'), 'F1 continua nos atalhos');
    await js('closeHome && closeHome(); true'); item.click(); await waitFor(open, 4000);
    eq(await current(), 'primeiros-passos'); ok((await js(`document.querySelectorAll('#manualIndex button').length`)) >= 20, 'índice completo');
    ok(/\bTab\b/.test(await js(`document.querySelector('#manualBody').textContent`)), 'no computador cita as teclas (Tab, Enter…)');
    await c.shot(path.join(SHOTS, '01-manual-aberto.png'));
    await key('Escape'); await waitFor(async () => !(await open()), 3000); ok(await js(`document.getElementById('modal').hidden`), 'janela fechou');
  });

  await t('índice: clicar numa seção mostra o conteúdo; anterior/próxima navegam; cada seção abre sem erro', async () => {
    await js(`act.manual(); true`); await waitFor(open, 3000);
    await clickEl('#manualIndex button[data-section="reordenar"]'); eq(await current(), 'reordenar'); ok(/linha laranja/.test(await js(`document.querySelector('#manualBody').textContent`)));
    await clickEl('#manualNext'); eq(await current(), 'selecao'); await clickEl('#manualPrev'); eq(await current(), 'reordenar');
    const ids = await js(`[...document.querySelectorAll('#manualIndex button')].map((b) => b.dataset.section)`);
    for (const id of ids) { await clickEl(`#manualIndex button[data-section="${id}"]`); eq(await current(), id); ok((await js(`document.querySelector('#manualBody').textContent.length`)) > 80, 'conteúdo de ' + id); }
    await c.shot(path.join(SHOTS, '02-secao-pdf.png'));
  });

  await t('busca (digitando de verdade): sem acento acha "revisão"; resultado sem nada mostra aviso; limpar restaura o índice', async () => {
    await typeInto('#manualSearch', 'revisao');
    const res = await js(`[...document.querySelectorAll('#manualIndex button')].map((b) => b.dataset.section)`); eq(res[0], 'revisao'); ok(res.length < 12, 'filtrou: ' + res.length); eq(await current(), 'revisao');
    await c.shot(path.join(SHOTS, '03-busca.png'));
    await js(`(() => { const i = document.querySelector('#manualSearch'); i.select(); return 1; })()`); await key('Backspace'); await typeInto('#manualSearch', 'zzqqxx'); ok(await js(`!!document.querySelector('#manualNone')`), 'aviso de nada encontrado'); eq(await js(`document.querySelectorAll('#manualIndex button').length`), 0);
    await js(`(() => { const i = document.querySelector('#manualSearch'); i.select(); return 1; })()`); await key('Backspace'); await wait(250); ok((await js(`document.querySelectorAll('#manualIndex button').length`)) >= 20, 'índice voltou');
  });

  await t('Computador × Tablet: o texto muda (teclas × gestos) e a escolha é por clique', async () => {
    await clickEl('#manualIndex button[data-section="topicos"]'); ok(/F2/.test(await js(`document.querySelector('#manualBody').textContent`)), 'computador cita F2');
    await clickEl('#manualHostTouch'); eq(await js(`document.querySelector('#manualHostTouch').getAttribute('aria-pressed')`), 'true'); const body = await js(`document.querySelector('#manualBody').textContent`);
    ok(/toque duas vezes/i.test(body) && !/Delete/.test(body), 'tablet fala de toque, sem teclas'); ok(!(await js(`!!document.querySelector('#manualKeys')`)), 'sem botão de atalhos no tablet'); await c.shot(path.join(SHOTS, '04-visao-tablet.png'));
    await clickEl('#manualHostDesktop'); ok(/F2/.test(await js(`document.querySelector('#manualBody').textContent`)));
  });

  await t('botão "Atalhos do teclado (F1)" do manual abre os atalhos; Fechar volta ao mapa', async () => {
    await clickEl('#manualKeys'); await waitFor(() => js(`!!document.querySelector('#keysBox')`), 3000); await key('Escape'); await wait(200);
    ok(await js(`document.getElementById('modal').hidden`));
  });

  await t('"Como usar?" em cada tela abre o manual na seção certa (Estudo, Notas, Painel de estudos, Leitor de PDF, Tela inicial)', async () => {
    await js(`closeHome && closeHome(); showPanel('study'); newMap(); true`); await wait(300);
    await js(`document.querySelector('.help-q[data-manual="estudo-topico"]').click(); true`); await waitFor(open, 3000); eq(await current(), 'estudo-topico'); await key('Escape'); await wait(200);
    await js(`showPanel('notes'); true`); await wait(150); await js(`document.querySelector('#notesHelp').click(); true`); await waitFor(open, 3000); eq(await current(), 'notas'); await key('Escape'); await wait(200);
    await js(`act.dash(); true`); await waitFor(() => js(`!!document.querySelector('#dashHelp')`), 4000); await clickEl('#dashHelp'); await waitFor(open, 3000); eq(await current(), 'painel-estudos'); await key('Escape'); await wait(300);
    ok(await js(`!document.getElementById('dash').hidden`), 'o painel de estudos continua aberto por baixo'); await js(`act.dash(); true`); await wait(200);
    await js(`window.MCReact.openPdf({}); true`); await waitFor(() => js(`!!document.querySelector('#pdfHelp')`), 4000); await clickEl('#pdfHelp'); await waitFor(open, 3000); eq(await current(), 'pdf'); await key('Escape'); await wait(200); await js(`window.MCReact.closePdf(); true`);
    await js(`act.home(true); true`); await waitFor(() => js(`!!document.querySelector('#hmManual')`), 4000); await c.shot(path.join(SHOTS, '05-tela-inicial-botao-manual.png')); await clickEl('#hmManual'); await waitFor(open, 3000); eq(await current(), 'primeiros-passos');
    await key('Escape'); await wait(200); ok(await js(`!document.getElementById('home').hidden`), 'a tela inicial continua aberta por baixo');
  });

  await t('texto malicioso na busca não vira HTML; o manual não altera o mapa nem deixa erros de console', async () => {
    await js(`closeHome(); newMap(); dirty = false; true`); const before = await js('JSON.stringify(map.toJSON())');
    await js(`act.manual(); true`); await waitFor(open, 3000); await typeInto('#manualSearch', '<img src=x onerror=window.__pwn=1>'); await wait(300);
    ok(!(await js(`!!document.querySelector('#manualBox img')`)), 'sem <img>'); ok(!(await js('!!window.__pwn')), 'nada executado'); eq(await js(`document.querySelector('#manualNone').textContent.includes('<img')`), true, 'mostra o texto, como texto');
    await key('Escape'); await wait(200); eq(await js('JSON.stringify(map.toJSON())'), before, 'mapa intacto'); ok(!(await js('dirty')), 'nada ficou "alterado"');
  });
  await t('nenhum erro de console durante todo o manual', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
