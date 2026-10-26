'use strict';
// Botões de fechar (0.5.0): cada janela, painel e aba tem um jeito claro de fechar, e o botão faz exatamente o que o nome diz.
// Cobre a bancada de estudos (PDF/Vídeo/Navegador), o Painel de estudos, a Rede de conhecimento, janelas de diálogo e o mapa.
const fs = require('fs');
const path = require('path');
const start = require('./harness');
const { writeMom } = require('../core/mom');
const { concurso } = require('./fixtures');

const SHOTS = path.join(__dirname, '..', 'evidencias', 'correcoes-v0.5.0');

(async () => {
  const c = await start('MindCraft e2e — botões de fechar');
  const { js, wait, eq, ok, t, TMP } = c;
  fs.mkdirSync(SHOTS, { recursive: true });
  const click = (sel) => js(`document.querySelector(${JSON.stringify(sel)}).click()`);
  const exists = (sel) => js(`!!document.querySelector(${JSON.stringify(sel)})`);
  const paneHidden = () => js(`document.querySelector('#pdfpane').hidden`);
 const openTabs = (kinds) => js(`window.MCReact.openMedia(${JSON.stringify(kinds[0])}, {}); true`);
  const file = path.join(TMP, 'fechar.mom'); writeMom(concurso().m, file);
  await js(`openPath(${JSON.stringify(file)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(file)}`)); await wait(300);

  await t('bancada: o ✕ de uma aba fecha só essa aba e a bancada continua aberta com as outras', async () => {
    await openTabs(['pdf']); await wait(300);
    await js(`window.MCReact.openMedia('video', {}); true`); await wait(300);
    eq(await js(`document.querySelectorAll('#pdfpane .media-tab-close').length`), 2, 'duas abas abertas');
    await shotAt('03-bancada-duas-abas.png');
    await click('#pdfpane .media-tab-close'); await wait(300);   // fecha a primeira (PDF)
    eq(await js(`document.querySelectorAll('#pdfpane .media-tab-close').length`), 1, 'sobrou uma aba');
    eq(await paneHidden(), false, 'a bancada continua aberta');
  });

  await t('bancada: o ✕ do cabeçalho fecha a bancada inteira, sem botões duplicados de fechar', async () => {
    ok(!(await exists('#pdfClose')), 'o ícone duplicado do leitor de PDF foi retirado');
    eq(await js(`[...document.querySelectorAll('#pdfpane button')].some((b) => /Fechar painel lateral/.test(b.textContent))`), false, 'o botão duplicado do estado vazio foi retirado');
    await click('#pdfpane [aria-label="Fechar bancada"]'); await wait(400);
    eq(await paneHidden(), true, 'bancada fechada');
    eq(await js(`document.body.classList.contains('pdf-open')`), false, 'o mapa voltou a ocupar a largura toda');
  });

  await t('Painel de estudos: "Fechar" e Esc fecham o painel', async () => {
    await js(`act.dash()`); await wait(400);
    eq(await js(`dashOpen`), true, 'painel aberto');
    await click('#btnDashClose'); await wait(200);
    eq(await js(`dashOpen`), false, 'fechou pelo botão Fechar');
    await js(`act.dash()`); await wait(300);
    await js(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`); await wait(200);
    eq(await js(`dashOpen`), false, 'fechou com Esc');
  });

  await t('Rede de conhecimento: "Fechar" fecha a janela', async () => {
    await js(`act.graph()`); await wait(500);
    eq(await js(`graphOpen`), true, 'rede aberta');
    await click('#gClose'); await wait(200);
    eq(await js(`graphOpen`), false, 'rede fechada pelo botão');
  });

  await t('janela de diálogo: "Fechar" fecha e devolve o mapa sem alterar nada', async () => {
    await js(`act.help()`); await wait(400);
    eq(await js(`!document.querySelector('#modal').hidden`), true, 'atalhos abertos');
    await click('#keysClose'); await wait(200);
    eq(await js(`document.querySelector('#modal').hidden`), true, 'fechou');
  });

  await t('✕ do mapa (cabeçalho) fecha o mapa e volta à tela inicial', async () => {
    await click('#closeMapBtn'); await c.waitFor(() => js(`!!(window.MCReact && MCReact.homeIsOpen())`), 8000);
    ok(await js(`MCReact.homeIsOpen()`), 'voltou à tela inicial');
    eq(await js(`document.querySelector('#closeMapBtn').disabled`), true, 'o ✕ do mapa fica desabilitado sem mapa');
  });

  await c.finish();

  async function shotAt(name) {
    await c.shot(path.join(SHOTS, name));
  }
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
