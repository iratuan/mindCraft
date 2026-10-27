'use strict';
// Maximizar e restaurar (0.6.3): o painel da direita (botão no cabeçalho dele) e a bancada da esquerda (botão no cabeçalho dela).
// Maximizado, o painel ocupa a área de trabalho; restaurar volta ao layout anterior. Só um dos dois fica maximizado por vez.
const fs = require('fs');
const path = require('path');
const start = require('./harness');
const { writeMom } = require('../core/mom');
const { concurso } = require('./fixtures');

const SHOTS = path.join(__dirname, '..', 'evidencias', 'correcoes-v0.6.3');

(async () => {
  const c = await start('MindCraft e2e — maximizar e restaurar');
  const { js, wait, eq, ok, t, TMP } = c;
  fs.mkdirSync(SHOTS, { recursive: true });
  const file = path.join(TMP, 'max.mom'); writeMom(concurso().m, file);
  await js(`openPath(${JSON.stringify(file)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(file)}`)); await wait(300);
  const shown = (sel) => js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); return !!e && getComputedStyle(e).display !== 'none'; })()`);
  const width = (sel) => js(`Math.round(document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect().width)`);
  const clickEl = (sel) => js(`document.querySelector(${JSON.stringify(sel)}).click()`);

  await t('o botão de maximizar fica no cabeçalho do painel da direita', async () => {
    ok(await js(`!!document.querySelector('#ptabs #panelMax')`), 'botão no cabeçalho das abas do painel');
    eq(await js(`document.querySelector('#panelMax').getAttribute('aria-pressed')`), 'false', 'começa restaurado');
  });

  await t('maximizar o painel da direita: ocupa a área de trabalho; mapa oculto; restaurar volta ao layout', async () => {
    const antes = await width('#panels');
    await clickEl('#panelMax'); await wait(300);
    ok(await js(`document.body.classList.contains('panel-max')`), 'classe de maximizado');
    eq(await shown('#stage'), false, 'mapa oculto enquanto o painel está maximizado');
    ok((await width('#panels')) > antes + 200, `painel mais largo: ${antes} → ${await width('#panels')}`);
    await c.shot(path.join(SHOTS, '08-painel-maximizado.png'));
    await clickEl('#panelMax'); await wait(300);
    eq(await js(`document.body.classList.contains('panel-max')`), false, 'restaurado');
    eq(await shown('#stage'), true, 'mapa de volta');
  });

  await t('maximizar um painel recolhido o mostra primeiro; recolher de novo tira o maximizado', async () => {
    await clickEl('#panelsToggle'); await wait(300);
    eq(await js(`document.body.classList.contains('panels-collapsed')`), true, 'recolhido');
    await clickEl('#panelMax'); await wait(300);
    eq(await js(`document.body.classList.contains('panels-collapsed')`), false, 'maximizar expandiu o painel');
    ok(await js(`document.body.classList.contains('panel-max')`), 'e maximizou');
    await clickEl('#panelsToggle'); await wait(300);
    eq(await js(`document.body.classList.contains('panel-max')`), false, 'recolher tirou o maximizado');
    await clickEl('#panelsToggle'); await wait(300);
  });

  await t('maximizar a bancada da esquerda: ocupa a área; restaurar volta; uma de cada vez', async () => {
    await js(`window.MCReact.openPdf({}); true`); await wait(400);
    const btn = 'button[aria-label="Maximizar a bancada"]';
    ok(await js(`!!document.querySelector('${btn}')`), 'botão de maximizar no cabeçalho da bancada');
    await clickEl(btn); await wait(300);
    ok(await js(`document.body.classList.contains('dock-max')`), 'bancada maximizada');
    eq(await shown('#stage'), false, 'mapa oculto');
    eq(await shown('#panels'), false, 'painel da direita oculto');
    ok((await width('#pdfpane')) > 800, 'bancada ocupa a área de trabalho: ' + (await width('#pdfpane')));
    await c.shot(path.join(SHOTS, '09-bancada-maximizada.png'));
    await clickEl('button[aria-label="Restaurar a bancada"]'); await wait(300);
    eq(await js(`document.body.classList.contains('dock-max')`), false, 'bancada restaurada');
    eq(await shown('#stage'), true, 'mapa de volta');
    // um de cada vez: maximizar o painel desliga a bancada
    await clickEl(btn); await wait(200);
    await js(`window.MCReact.closePdf(); true`); await wait(250);
  });

  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
