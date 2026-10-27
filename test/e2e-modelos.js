'use strict';
// Escolha de modelo de concurso no Electron real: "Novo mapa de concurso" (tela inicial) → lista → busca → escolher → mapa criado.
// Confere cada modelo contra o que o núcleo calcula (disciplinas e tópicos) e a barra de status.
const fs = require('fs'); const path = require('path'); const start = require('./harness');
const { listTemplates } = require('../core/templates');
const SHOTS = path.join(__dirname, '..', 'evidencias', 'modelos');
(async () => {
  const c = await start('escolha de modelos de concurso'); const { js, wait, waitFor, eq, ok, t } = c; const wc = () => c.win.webContents;
  fs.mkdirSync(SHOTS, { recursive: true });
  const clickSel = async (sel) => { const p = await js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); const x = Math.round(p.x), y = Math.round(p.y); wc().sendInputEvent({ type: 'mouseDown', x, y, button: 'left', clickCount: 1 }); wc().sendInputEvent({ type: 'mouseUp', x, y, button: 'left', clickCount: 1 }); await wait(400); };
  const models = listTemplates();
  const openPicker = async () => { await js('dirty = false; act.closeMap(); true'); await waitFor(() => js(`(() => { const e = document.querySelector('#hmTemplate'); return !!e && e.getBoundingClientRect().width > 0; })()`), 8000); await wait(300); await clickSel('#hmTemplate'); await waitFor(() => js(`!!document.querySelector('#tplList')`), 6000); await wait(200); };
  await t('a escolha lista os cinco modelos e a busca filtra', async () => {
    await openPicker();
    eq(await js(`document.querySelectorAll('#tplList .tpl-item').length`), models.length, 'um item por modelo');
    await c.shot(path.join(SHOTS, 'escolha-lista.png'));
    await js(`(() => { const s = document.querySelector('#tplSearch'); s.value = 'DATAPREV'; s.dispatchEvent(new Event('input')); })(); true`); await wait(200);
    eq(await js(`document.querySelectorAll('#tplList .tpl-item').length`), 1, 'busca por DATAPREV deixa um item');
    await js(`(() => { const s = document.querySelector('#tplSearch'); s.value = 'nada existe aqui'; s.dispatchEvent(new Event('input')); })(); true`); await wait(200);
    ok(await js(`/Nenhum modelo/.test(document.querySelector('#tplList').textContent)`), 'mensagem de nenhum resultado');
    await js(`(() => { const s = document.querySelector('#tplSearch'); s.value = ''; s.dispatchEvent(new Event('input')); })(); true`); await wait(200);
  });
  for (const m of models) {
    await t(`escolher "${m.title.slice(0, 40)}…" cria o mapa com ${m.disciplinas} disciplinas e ${m.topicos} tópicos`, async () => {
      await openPicker();
      await clickSel(`#tplList [data-tpl="${m.id}"]`);
      await waitFor(() => js(`!document.querySelector('#tplBox') && !!map`), 8000); await wait(400);
      eq(await js(`map.root.children.length`), m.disciplinas, 'disciplinas no mapa');
      eq(await js(`map.root.children.reduce((n, d) => n + d.children.length, 0)`), m.topicos, 'tópicos no mapa');
      eq(await js(`map.root.title`), m.title, 'título do mapa é o nome do concurso');
      await c.shot(path.join(SHOTS, m.id + '-escolhido.png'));
    });
  }
  await t('"Começar do zero" continua disponível e cria o modelo genérico', async () => {
    await js('dirty = false; act.closeMap(); true'); await waitFor(() => js(`!!document.querySelector('#hmTemplate')`), 8000); await clickSel('#hmTemplate'); await waitFor(() => js(`!!document.querySelector('#tplGeneric')`), 6000);
    await clickSel('#tplGeneric'); await waitFor(() => js(`!!map`), 6000); await wait(300);
    ok(await js(`map.root.children.length === 5`), 'modelo genérico tem as cinco disciplinas padrão');
  });
  process.exit(0);
})().catch((e) => { console.log('ERRO:', e && e.stack); process.exit(1); });