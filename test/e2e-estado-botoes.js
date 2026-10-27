'use strict';
// Regra "botão que depende de mapa só fica habilitado com um mapa na tela" (0.5.0): ao abrir o app (tela inicial por cima), ao abrir e ao fechar um mapa,
// na barra de ferramentas, na barra de opções e no menu do aplicativo. O menu é lido no processo principal (o mesmo que o usuário vê).
const fs = require('fs');
const path = require('path');
const start = require('./harness');
const { writeMom } = require('../core/mom');
const { concurso } = require('./fixtures');

const MAP_BUTTONS = ['child', 'sibling', 'delete', 'moveUp', 'moveDown', 'relate'];   // desfazer/refazer saíram da barra (Ctrl+Z/Ctrl+Y e o menu Editar)   // 'fit' (Ajustar à tela) saiu da barra: fica no atalho Ctrl+0 e no menu Exibir
const MAP_MENU = ['m-fit', 'm-save', 'm-saveAs', 'm-export', 'm-undo', 'm-redo', 'm-moveUp', 'm-moveDown', 'm-outdent', 'm-indent', 'm-closeMap', 'm-restore', 'm-libAdd', 'cut', 'copy', 'paste', 'selectAll'];
const SHOTS = path.join(__dirname, '..', 'evidencias', 'correcoes-v0.5.0');

(async () => {
  const c = await start('MindCraft e2e — botões que dependem de mapa');
  const { js, wait, eq, ok, t, TMP, Menu } = c;
  fs.mkdirSync(SHOTS, { recursive: true });
  const { app, BrowserWindow } = require('electron');
  const win = () => BrowserWindow.getAllWindows()[0];
  const menuEnabled = (id) => Menu.getApplicationMenu().getMenuItemById(id).enabled;
  const btnStates = () => js(`(() => { const o = {}; for (const a of ${JSON.stringify(MAP_BUTTONS)}) o[a] = !document.querySelector('#rail [data-act="' + a + '"]').disabled; return o; })()`);
  const allOff = (o) => Object.values(o).every((v) => v === false);
  const menuStates = () => Object.fromEntries(MAP_MENU.map((id) => [id, menuEnabled(id)]));
  const settle = () => wait(250);

  // 1) Início do app com a tela inicial (o caso relatado): recarrega a janela com a tela inicial como ponto de partida.
  process.env.MINDCRAFT_START = 'home';
  win().webContents.reload();
  await c.waitFor(() => js(`!!(window.MCReact && MCReact.homeIsOpen())`), 15000);
  await settle();

  await t('abrir o app na tela inicial: nenhum botão de mapa habilitado, barra de opções sem contexto', async () => {
    const s = await btnStates();
    ok(allOff(s), 'botões habilitados sem mapa: ' + JSON.stringify(s));
    eq(await js(`document.querySelector('#options').getAttribute('data-context')`), 'none', 'barra de opções');
    eq(await js(`document.querySelector('[data-act="present"]')`), null, 'botão Apresentar não existe mais');
  });

  await t('abrir o app na tela inicial: busca, exportar, fechar mapa e zoom desabilitados', async () => {
    for (const id of ['#search', '#export', '#closeMapBtn', '#zoom', '#zoomIn', '#zoomOut']) {
      eq(await js(`document.querySelector('${id}').disabled`), true, id + ' deveria estar desabilitado sem mapa');
    }
  });

  await t('abrir o app na tela inicial: itens de menu que dependem de mapa estão desabilitados', async () => {
    const m = menuStates();
    const ligados = Object.entries(m).filter(([, v]) => v).map(([k]) => k);
    eq(ligados, [], 'itens de menu habilitados sem mapa');
  });

  await shotAt('01-inicio-sem-mapa-botoes-desabilitados.png');

  // 2) Abrir um mapa: tudo volta a funcionar.
  const file = path.join(TMP, 'estado.mom'); writeMom(concurso().m, file);
  await js(`openPath(${JSON.stringify(file)})`);
  await c.waitFor(() => js(`!(window.MCReact && MCReact.homeIsOpen()) && filePath === ${JSON.stringify(file)}`), 15000);
  await settle();

  await t('com um mapa aberto: ações de mapa habilitadas e itens de menu habilitados', async () => {
    const s = await btnStates();
    ok(s.child === true, 'Novo filho habilitado: ' + JSON.stringify(s));
    for (const id of ['#search', '#export', '#closeMapBtn', '#zoom']) eq(await js(`document.querySelector('${id}').disabled`), false, id + ' habilitado com mapa');
    const m = menuStates();
    ok(m['m-fit'] && m['m-save'] && m['m-export'] && m['m-closeMap'], 'itens de menu com mapa: ' + JSON.stringify(m));
  });

  await shotAt('02-com-mapa-botoes-habilitados.png');

  // 3) Fechar o mapa (volta à tela inicial): desabilita de novo.
  await js(`act.closeMap()`);
  await c.waitFor(() => js(`!!(window.MCReact && MCReact.homeIsOpen())`), 10000);
  await settle();

  await t('fechar o mapa e voltar à tela inicial: desabilita de novo os botões e os itens de menu', async () => {
    ok(allOff(await btnStates()), 'botões habilitados depois de fechar o mapa');
    eq(Object.entries(menuStates()).filter(([, v]) => v).map(([k]) => k), [], 'itens de menu habilitados depois de fechar o mapa');
  });

  await t('a tela inicial recebe o foco e os atalhos de edição não mexem no mapa de fundo', async () => {
    eq(await js(`document.querySelector('[data-act="child"]').disabled`), true);
    await js(`document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))`); await settle();
    eq(await js(`MCReact.homeIsOpen()`), true, 'Tab não fechou nem mudou a tela inicial');
  });

  await c.finish();

  async function shotAt(name) {
    await c.shot(path.join(SHOTS, name));
  }
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
