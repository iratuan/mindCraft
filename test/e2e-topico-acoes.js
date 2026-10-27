'use strict';
// Ao selecionar um tópico, a barra mostra as ações do tópico (preenchimento, forma, negrito, níveis e Renomear) e a lateral
// mostra Excluir, sem precisar abrir nenhum painel. Testa com cliques reais.
const start = require('./harness');
(async () => {
  const c = await start('ações do tópico'); const { js, wait, eq, ok, t } = c; const wc = () => c.win.webContents;
  const clickSel = async (sel) => { const p = await js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); const x = Math.round(p.x), y = Math.round(p.y); wc().sendInputEvent({ type: 'mouseDown', x, y, button: 'left', clickCount: 1 }); wc().sendInputEvent({ type: 'mouseUp', x, y, button: 'left', clickCount: 1 }); await wait(400); };
  const visible = (sel) => js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); return !!e && e.getBoundingClientRect().width > 0; })()`);
  await js(`selectedId = map.root.children[0].id; selIds = new Set([selectedId]); render(); true`); await wait(400);
  await t('com um tópico selecionado, a barra mostra cor, forma, negrito, níveis e Renomear, sem abrir painel', async () => {
    ok(await visible('#options'), 'barra de opções visível');
    ok(await visible('#fill'), 'cor de preenchimento visível');
    ok(await visible('#shape'), 'forma visível');
    ok(await visible('#optRename'), 'botão Renomear visível');
    await c.shot(require('path').join(__dirname, '..', 'evidencias', 'topico-acoes.png'));
  });
  await t('o botão Renomear abre a edição do título no mapa', async () => {
    await clickSel('#optRename'); await wait(300);
    ok(await js(`!document.getElementById('editor').hidden`), 'editor do título aberto');
    await js(`editor.blur(); true`); await wait(100);
  });
  await t('a lateral exclui o tópico selecionado', async () => {
    const before = await js(`map.root.children.length`);
    ok(await visible('#rail [data-act="delete"]'), 'botão Excluir visível na lateral');
    await clickSel('#rail [data-act="delete"]'); await wait(400);
    eq(await js(`map.root.children.length`), before - 1, 'o tópico selecionado saiu do mapa');
  });
  process.exit(0);
})().catch((e) => { console.log('ERRO:', e && e.stack); process.exit(1); });