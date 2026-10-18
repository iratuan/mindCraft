'use strict';
// Painel lateral (recolher/expandir) e divisores redimensionáveis (leitor de PDF | mapa | painel) com MOUSE e TECLADO reais.
const path = require('path');
const fs = require('fs');
const { Menu } = require('electron');
const start = require('./harness');

(async () => {
  const c = await start('MindCraft e2e — painel recolhível e divisores');
  const { js, wait, waitFor, eq, ok, t, USERDATA } = c; const wc = () => c.win.webContents; const SHOTS = path.join(__dirname, '..', 'evidencias', 'divisores');
  const key = async (k, mods = []) => { wc().sendInputEvent({ type: 'keyDown', keyCode: k, modifiers: mods }); wc().sendInputEvent({ type: 'keyUp', keyCode: k, modifiers: mods }); await wait(150); };
  const rect = (sel) => js(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; })()`);
  const W = async (sel) => (await rect(sel)).w;
  const cfg = () => { try { return JSON.parse(fs.readFileSync(path.join(USERDATA, 'config.json'), 'utf8')); } catch { return {}; } };
  const mouse = (type, x, y, n = 1) => wc().sendInputEvent({ type, x: Math.round(x), y: Math.round(y), button: 'left', clickCount: n, ...(type === 'mouseUp' || type === 'mouseMove' && DOWN ? {} : {}), modifiers: type === 'mouseDown' || (type === 'mouseMove' && DOWN) ? ['leftButtonDown'] : [] });
  let DOWN = false;
  /** Arrasta um divisor de verdade (mouse): do centro dele até `dx` pixels para o lado. */
  const dragSplit = async (sel, dx) => {
    const r = await rect(sel); const y = r.cy + 90; mouse('mouseMove', r.cx, y); mouse('mouseDown', r.cx, y); DOWN = true;
    for (let i = 1; i <= 10; i++) { wc().sendInputEvent({ type: 'mouseMove', x: Math.round(r.cx + (dx * i) / 10), y: Math.round(y), button: 'left', modifiers: ['leftButtonDown'] }); await wait(15); }
    DOWN = false; mouse('mouseUp', r.cx + dx, y); await wait(250);
  };
  const click = async (sel, n = 1, dy = 0) => { const r = await rect(sel), y = r.cy + dy; mouse('mouseMove', r.cx, y); for (let i = 1; i <= n; i++) { mouse('mouseDown', r.cx, y, i); mouse('mouseUp', r.cx, y, i); } await wait(300); };   // dy: longe do botão ‹ › que fica no meio do divisor
  const collapsed = () => js(`document.body.classList.contains('panels-collapsed')`);
  const hidden = () => js(`getComputedStyle(document.querySelector('#panels')).display === 'none'`);

  await c.ready;
  await js(`closeHome && closeHome(); newMap(); true`); await wait(400);

  await t('botão ‹ › na borda: recolhe o painel (mapa ganha a largura dele), expande de volta, lembra no config.json e avisa na barra de status', async () => {
    ok(!(await collapsed())); const p0 = await W('#panels'), s0 = await W('#stage'); ok(p0 > 200, 'painel aberto: ' + p0);
    eq(await js(`document.querySelector('#panelsToggle').textContent`), '›'); ok(/Recolher o painel lateral/.test(await js(`document.querySelector('#panelsToggle').title`)));
    await c.shot(path.join(SHOTS, '01-painel-aberto.png'));
    await click('#panelsToggle'); ok(await collapsed(), 'recolheu'); ok(await hidden(), 'painel escondido'); const s1 = await W('#stage'); ok(s1 > s0 + p0 - 6, `mapa ganhou a largura do painel: ${s0} → ${s1}`);
    eq(await js(`document.querySelector('#panelsToggle').textContent`), '‹'); eq(await js(`document.querySelector('#panelsToggle').getAttribute('aria-expanded')`), 'false'); ok(/Expandir o painel lateral/.test(await js(`document.querySelector('#panelsToggle').title`)));
    ok(/Painel lateral recolhido/.test(await js(`document.querySelector('#status').textContent`)), 'avisa o que fez'); eq(cfg().panelsCollapsed, true, 'lembrado'); await c.shot(path.join(SHOTS, '02-painel-recolhido.png'));
    await click('#panelsToggle'); ok(!(await collapsed())); ok(Math.abs((await W('#panels')) - p0) < 3, 'voltou à largura'); eq(cfg().panelsCollapsed, false);
  });

  await t('menu Exibir → "Painel lateral" faz o mesmo; pedir uma aba (Alt+2) com o painel recolhido o EXPANDE; o mapa não é alterado', async () => {
    const before = await js('JSON.stringify(map.toJSON())');
    const item = Menu.getApplicationMenu().items.find((i) => i.label === 'Exibir').submenu.items.find((i) => /Painel lateral/.test(i.label)); ok(item, 'item no menu Exibir'); eq(item.accelerator, 'CmdOrCtrl+\\');
    item.click(); await wait(300); ok(await collapsed(), 'menu recolheu'); item.click(); await wait(300); ok(!(await collapsed()), 'menu expandiu');
    item.click(); await wait(300); ok(await collapsed()); await js(`showPanel('notes'); true`); await wait(300); ok(!(await collapsed()), 'showPanel expande'); eq(await js(`document.querySelector('#panels .panel:not([hidden])').dataset.panel`), 'notes');
    await key('2', ['alt']); await wait(200); eq(await js(`document.querySelector('#panels .panel:not([hidden])').dataset.panel`), 'study');
    eq(await js('JSON.stringify(map.toJSON())'), before, 'mapa intacto');
  });

  await t('arrastar o divisor do painel (mouse real): muda a largura, respeita mínimo e máximo, é lembrado; duplo clique restaura o padrão', async () => {
    const p0 = await W('#panels'); await dragSplit('#panelsSplit', -100); const p1 = await W('#panels'); ok(Math.abs(p1 - (p0 + 100)) < 4, `painel ${p0} → ${p1}`); eq(cfg().panelsWidth, Math.round(p1)); await c.shot(path.join(SHOTS, '03-painel-mais-largo.png'));
    await dragSplit('#panelsSplit', 900); const p2 = await W('#panels'); ok(p2 >= 219 && p2 <= 224, 'mínimo 220: ' + p2);
    await dragSplit('#panelsSplit', -1500); const p3 = await W('#panels'); ok(p3 <= 561 && p3 > p2, 'máximo 560: ' + p3); ok((await W('#stage')) >= 255, 'o mapa mantém largura útil: ' + (await W('#stage')));
    await click('#panelsSplit', 2, 120); ok(Math.abs((await W('#panels')) - p0) < 4, 'duplo clique restaura: ' + (await W('#panels'))); eq(cfg().panelsWidth, null);
  });

  await t('teclado: divisor em foco — ← → ajustam, Shift = passo grande, Home/End = limites, Enter restaura', async () => {
    await js(`document.querySelector('#panelsSplit').focus(); true`); const p0 = await W('#panels');
    await key('Left'); ok(Math.abs((await W('#panels')) - (p0 + 24)) < 3, 'Left aumenta o painel em 24'); await key('Right'); ok(Math.abs((await W('#panels')) - p0) < 3);
    await key('Left', ['shift']); ok(Math.abs((await W('#panels')) - (p0 + 96)) < 3, 'Shift = 96');
    await key('Home'); ok((await W('#panels')) <= 224, 'Home = mínimo'); await key('End'); ok((await W('#panels')) >= 540, 'End = máximo'); await key('Return'); ok(Math.abs((await W('#panels')) - p0) < 4, 'Enter restaura');
    eq(await js(`document.querySelector('#panelsSplit').getAttribute('role')`), 'separator'); ok(/Largura do painel/.test(await js(`document.querySelector('#panelsSplit').getAttribute('aria-label')`)));
  });

  await t('leitor de PDF | mapa: o divisor tem alça e foco, arrasta com mouse real, lembra, respeita limites e o mapa nunca fica espremido', async () => {
    await js(`window.MCReact.openPdf({}); true`); await waitFor(() => js(`!document.querySelector('#pdfpane').hidden`), 4000); await wait(300);
    const d0 = await W('#pdfpane'); ok(d0 > 280, 'leitor aberto: ' + d0); eq(await js(`document.querySelector('#pdfsplit').getAttribute('role')`), 'separator'); ok((await W('#pdfsplit')) >= 8, 'área de arrasto larga o bastante');
    await c.shot(path.join(SHOTS, '04-pdf-e-mapa.png'));
    await dragSplit('#pdfsplit', 50); const d1 = await W('#pdfpane'); ok(Math.abs(d1 - (d0 + 50)) < 4, `leitor ${d0} → ${d1}`); eq(cfg().pdfWidth, Math.round(d1));
    await dragSplit('#pdfsplit', -900); ok((await W('#pdfpane')) >= 279 && (await W('#pdfpane')) <= 284, 'mínimo 280: ' + (await W('#pdfpane')));
    await dragSplit('#pdfsplit', 2000); ok((await W('#stage')) >= 255, 'o mapa mantém ≥ 260 px: ' + (await W('#stage'))); await c.shot(path.join(SHOTS, '05-pdf-largo.png'));
    await click('#pdfsplit', 1, 120); eq(await js(`document.activeElement.id`), 'pdfsplit', 'clicar no divisor o coloca em foco (as setas passam a valer)'); const d2 = await W('#pdfpane'); await key('Left'); const d3 = await W('#pdfpane'); ok(Math.abs(d3 - (d2 - 24)) < 3, 'seta ← diminui o leitor em 24: ' + d2 + ' → ' + d3); await key('Home'); ok((await W('#pdfpane')) <= 284, 'Home');
    await click('#pdfsplit', 2, 120); const w46 = await W('#work'); ok(Math.abs((await W('#pdfpane')) - w46 * 0.46) < 6, 'duplo clique volta aos 46%'); eq(cfg().pdfWidth, null);
  });

  await t('com o leitor aberto, recolher o painel lateral dá ainda mais espaço ao mapa e os dois divisores convivem', async () => {
    const s0 = await W('#stage'); await click('#panelsToggle'); ok(await collapsed()); ok((await W('#stage')) > s0 + 200, `mapa ${s0} → ${await W('#stage')}`);
    await dragSplit('#pdfsplit', 200); ok((await W('#stage')) >= 255); await c.shot(path.join(SHOTS, '06-pdf-com-painel-recolhido.png'));
    await click('#panelsToggle'); ok(!(await collapsed())); ok((await W('#stage')) >= 255, 'ao expandir o painel o mapa ainda cabe: ' + (await W('#stage')));
    await js(`window.MCReact.closePdf(); true`); await wait(200); ok(await js(`document.querySelector('#pdfpane').hidden`));
  });

  await t('recolhido é lembrado ao recarregar o app; presentation (F5) esconde o botão; nenhum erro de console', async () => {
    await click('#panelsToggle'); ok(await collapsed()); eq(cfg().panelsCollapsed, true);
    wc().reload(); await waitFor(() => js(`typeof map !== 'undefined' && !!document.querySelector('#panelsToggle')`).catch(() => false), 15000, 300); await waitFor(() => collapsed(), 8000, 300).catch(() => {});
    ok(await collapsed(), 'continua recolhido depois de recarregar: ' + JSON.stringify(cfg())); eq(await js(`document.querySelector('#panelsToggle').textContent`), '‹');
    await js(`closeHome && closeHome(); act.panelsToggle(); true`); await wait(300); ok(!(await collapsed()), 'expandido de novo'); eq(cfg().panelsCollapsed, false);
    eq(c.errors, [], 'erros de console');
  });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
