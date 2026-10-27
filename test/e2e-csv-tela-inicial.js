'use strict';
// Regressão: importar CSV de edital a partir da TELA INICIAL (sem mapa aberto), com cliques e Ctrl+V reais.
// Antes, "Criar o mapa" falhava com "Cannot read properties of null (reading 'find')" porque as notas
// do tópico anterior ainda apontavam para um mapa já fechado; o mapa não era criado e a janela ficava aberta.
const fs = require('fs'); const path = require('path'); const { clipboard } = require('electron'); const start = require('./harness');
(async () => {
  const c = await start('CSV pela tela inicial'); const { js, wait, waitFor, eq, ok, t } = c; const wc = () => c.win.webContents;
  const CSV = 'concurso,data_prova,disciplina,item,topico,peso,notas,relacionados\n"Banco do Nordeste (BNB) — Analista de Sistemas",2022-12-04,Língua Portuguesa,1,"Compreensão e interpretação de textos",3,,\n,,Língua Portuguesa,4,"Domínio dos mecanismos de coesão textual",3,,\n,,Língua Portuguesa,4.1,"Emprego de conectores",3,,"Domínio dos mecanismos de coesão textual"\n,,Raciocínio Lógico e Quantitativo,3,"Lógica sentencial (ou proposicional)",3,,\n';
  const clickSel = async (sel) => { const p = await js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); const x = Math.round(p.x), y = Math.round(p.y); wc().sendInputEvent({ type: 'mouseDown', x, y, button: 'left', clickCount: 1 }); wc().sendInputEvent({ type: 'mouseUp', x, y, button: 'left', clickCount: 1 }); await wait(400); };
  const key = async (k, mods = []) => { wc().sendInputEvent({ type: 'keyDown', keyCode: k, modifiers: mods }); wc().sendInputEvent({ type: 'keyUp', keyCode: k, modifiers: mods }); await wait(200); };
  // o harness começa com um mapa em branco: fecha-o para chegar à tela inicial, como no uso normal
  await js('dirty = false; act.closeMap(); true'); await waitFor(() => js(`!!document.querySelector('#hmCsv')`), 6000); await wait(300);
  await t('importar pela tela inicial cria o mapa e fecha a janela (sem erro)', async () => {
    await clickSel('#hmCsv'); await waitFor(() => js(`!!document.querySelector('#csvPaste')`), 6000); await wait(300);
    await clickSel('#csvPaste'); clipboard.writeText(CSV); await key('V', ['control']); await wait(900);
    ok(await js(`!document.querySelector('#csvPreview').hidden`), 'a prévia aparece');
    await clickSel('#csvOk'); await wait(1200);
    ok(!(await js(`!!document.querySelector('#csvBox')`)), 'a janela fecha');
    eq(await js(`map ? map.root.title : null`), 'Banco do Nordeste (BNB) — Analista de Sistemas', 'o mapa foi criado com o título do concurso');
    eq(await js(`map.root.children.length`), 2, 'duas disciplinas');
    ok(!(await js(`/Erro:/.test(document.querySelector('#status') ? document.querySelector('#status').textContent : '')`)), 'a barra não mostra erro');
  });
  await t('o mapa criado pela tela inicial está em uso (nenhum erro registrado)', async () => {
    eq(await js(`typeof map.find(map.root.children[0].id)`), 'object', 'a árvore responde');
  });
  process.exit(0);
})().catch((e) => { console.log('ERRO:', e && e.stack); process.exit(1); });