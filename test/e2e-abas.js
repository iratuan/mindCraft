'use strict';
// Abas do espaço de trabalho (0.6.0): o mapa e as mídias (PDF, vídeo, navegador) são abas, como em um navegador.
// Com uma mídia ativa, ações do mapa e o painel da direita ficam ocultos; clicar no mapa ou na aba do mapa volta a ele.
const fs = require('fs');
const path = require('path');
const start = require('./harness');
const { writeMom } = require('../core/mom');
const { concurso } = require('./fixtures');

const SHOTS = path.join(__dirname, '..', 'evidencias', 'correcoes-v0.6.0');

(async () => {
  const c = await start('MindCraft e2e — abas do espaço de trabalho');
  const { js, wait, eq, ok, t, TMP } = c;
  fs.mkdirSync(SHOTS, { recursive: true });
  const file = path.join(TMP, 'abas.mom'); writeMom(concurso().m, file);
  await js(`openPath(${JSON.stringify(file)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(file)}`)); await wait(300);
  const shown = (sel) => js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); return !!e && getComputedStyle(e).display !== 'none'; })()`);

  await t('com o mapa ativo: aba do mapa em destaque, ações do mapa e painel da direita visíveis', async () => {
    eq(await js(`document.body.classList.contains('focus-media')`), false);
    eq(await js(`document.querySelector('#tabMap').classList.contains('on')`), true);
    eq(await shown('#rail [data-act="child"]'), true, 'Novo filho visível');
    eq(await shown('#panels'), true, 'painel da direita visível');
  });

  await t('abrir um PDF: vira a aba ativa; ações do mapa e painel da direita somem; o mapa continua na tela', async () => {
    await js(`window.MCReact.openPdf({}); true`); await wait(400);
    eq(await js(`document.body.classList.contains('focus-media')`), true);
    eq(await shown('#rail [data-act="child"]'), false, 'Novo filho oculto');
    eq(await shown('#options'), false, 'barra de opções oculta');
    eq(await shown('#panels'), false, 'painel da direita recolhido');
    eq(await shown('#stage'), true, 'o mapa segue visível');
    eq(await js(`document.querySelectorAll('#tabMedia .tab').length`), 1, 'uma aba de PDF');
    eq(await js(`document.querySelector('#tabMedia .tab').classList.contains('on')`), true, 'a aba do PDF está ativa');
    await c.shot(path.join(SHOTS, '05-foco-no-pdf.png'));
  });

  await t('clicar na aba do mapa volta ao mapa: ações e painel da direita voltam', async () => {
    await js(`document.querySelector('#tabMap').click()`); await wait(250);
    eq(await js(`document.body.classList.contains('focus-media')`), false);
    eq(await shown('#rail [data-act="child"]'), true);
    eq(await shown('#panels'), true);
  });

  await t('clicar na aba da mídia leva o foco a ela; um clique no mapa devolve o foco ao mapa', async () => {
    await js(`document.querySelector('#tabMedia .tab').click()`); await wait(200);
    eq(await js(`document.body.classList.contains('focus-media')`), true);
    await js(`document.querySelector('#stage').dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }))`); await wait(200);
    eq(await js(`document.body.classList.contains('focus-media')`), false, 'o clique no mapa devolveu o foco');
  });

  await t('fechar a aba da mídia pelo ✕ da aba: some a aba e o foco volta ao mapa', async () => {
    await js(`document.querySelector('#tabMedia .tab').click()`); await wait(150);
    await js(`document.querySelector('#tabMedia .tab-x').click()`); await wait(300);
    eq(await js(`document.querySelectorAll('#tabMedia .tab').length`), 0, 'nenhuma aba de mídia');
    eq(await js(`document.body.classList.contains('focus-media')`), false, 'foco de volta ao mapa');
  });

  await t('o ✕ da aba do mapa fecha o mapa e volta à tela inicial', async () => {
    await js(`document.querySelector('#closeMapBtn').click()`);
    await c.waitFor(() => js(`!!(window.MCReact && MCReact.homeIsOpen())`), 8000);
    ok(await js(`MCReact.homeIsOpen()`), 'voltou à tela inicial');
  });

  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
