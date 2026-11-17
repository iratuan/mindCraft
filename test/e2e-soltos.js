'use strict';
// Tópicos independentes do Mindomo aparecem à direita; podem ser editados, excluídos ou trazidos para a árvore.
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const start = require('./harness');

const SHOTS = path.join(__dirname, '..', 'evidencias', 'correcoes-v0.5.0');

function mindomoFile(dir) {
  const z = new AdmZip();
  const nodes = [
    { id: 'raiz00000000000000000000000000001', title: 'Mapa com soltos', index: 0, style: {} },
    { id: 'filho0000000000000000000000000002', parentId: 'raiz00000000000000000000000000001', title: 'Tópico da árvore', index: 0, style: {} },
    { id: 'flutu0000000000000000000000000003', title: 'Tópico solto', index: 1, style: {} },
    { id: 'neto00000000000000000000000000004', parentId: 'flutu0000000000000000000000000003', title: 'Filho do solto', index: 0, style: {} },
  ];
  const themeId = 'tema1';
  const doc = { version: 40, mapInfo: { id: 'doc', name: 'Com soltos', rootId: 'raiz00000000000000000000000000001', themeId, style: {}, template: {} } };
  const themes = { [themeId]: { id: themeId, nodeStyles: {}, mapStyle: {}, relationStyle: {}, boundaryStyle: {}, summaryStyle: {}, summaryNodeStyles: {}, editable: true, type: 1 } };
  z.addFile('document.json', Buffer.from(JSON.stringify(doc)));
  z.addFile('nodes.json', Buffer.from(JSON.stringify(nodes)));
  z.addFile('themes.json', Buffer.from(JSON.stringify(themes)));
  z.addFile('changes.json', Buffer.from('[]'));
  const p = path.join(dir, 'com-soltos.mom');
  fs.writeFileSync(p, z.toBuffer());
  return p;
}

(async () => {
  const c = await start('MindCraft e2e — tópicos soltos do Mindomo');
  const { js, wait, eq, ok, t, TMP } = c;
  fs.mkdirSync(SHOTS, { recursive: true });
  await c.waitFor(() => js(`document.getElementById('splash').hidden`));
  const clickSel = async (sel) => {
    const p = await js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    const x = Math.round(p.x), y = Math.round(p.y);
    c.win.webContents.sendInputEvent({ type: 'mouseDown', x, y, button: 'left', clickCount: 1 });
    c.win.webContents.sendInputEvent({ type: 'mouseUp', x, y, button: 'left', clickCount: 1 });
    await wait(300);
  };
  const file = mindomoFile(TMP);
  await js(`openPath(${JSON.stringify(file)})`);
  await c.waitFor(() => js(`filePath === ${JSON.stringify(file)}`)); await wait(400);

  await t('ao abrir: o solto aparece à direita como tópico independente selecionável', async () => {
    eq(await js(`(map.meta._momFloating || []).length`), 1, 'um tópico solto guardado');
    eq(await js(`document.querySelectorAll('#svg .node').length`), 4, 'raiz, filho e subárvore solta são selecionáveis');
    eq(await js(`map.find('flutu0000000000000000000000000003').parent`), null, 'mantém-se fora da árvore');
    ok(await js(`/Tópico solto/.test(document.querySelector('#svg').textContent)`), 'o solto aparece desenhado');
    ok(await js(`/soltos/.test(document.querySelector('#status').textContent)`), 'avisa na barra de status');
  });

  await t('ajustar à tela enquadra a árvore e o solto juntos', async () => {
    await js(`act.fit()`); await wait(200);
    const k = await js(`pan.k`); ok(k > 0.2 && k <= 1.5, 'zoom razoável: ' + k);
  });
  await c.shot(path.join(SHOTS, '04-topicos-soltos-a-direita.png'));

  await t('Novo tópico flutuante fica visível na barra e é salvo fora da árvore', async () => {
    const state = await js(`(() => { const b = document.querySelector('[data-act="addFloating"]'); const r = b.getBoundingClientRect(); return { disabled: b.disabled, visible: r.width > 0 && r.height > 0, x: r.left + r.width / 2, y: r.top + r.height / 2, hit: document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.outerHTML.slice(0, 100), focus: workspaceFocus, inUse: mapInUse() }; })()`);
    ok(state.visible && !state.disabled, `ação precisa estar visível e habilitada: ${JSON.stringify(state)}`);
    await clickSel('[data-act="addFloating"]');
    const count = await js(`map.meta._momFloating.length`);
    eq(count, 2, `novo tópico independente após clique real (${JSON.stringify(state)})`);
    const id = await js(`selectedId`);
    eq(await js(`map.find(${JSON.stringify(id)}).parent`), null, 'sem pai na árvore');
    ok(await js(`document.querySelector('#svg').textContent.includes('Tópico flutuante')`), 'desenhado no mapa');
    await c.shot(path.join(__dirname, '..', 'docs', 'evidencias', 'topico-flutuante.png'));
    await js(`act.undo()`); await wait(200);
    eq(await js(`map.meta._momFloating.length`), 1, 'desfazer remove apenas o tópico criado');
  });

  await t('Trazer tópicos soltos: vira filho da raiz, aparece como nó clicável, e Ctrl+Z desfaz tudo', async () => {
    await js(`act.attachFloating()`); await wait(300);
    eq(await js(`(map.meta._momFloating || []).length`), 0, 'nenhum solto restante');
    eq(await js(`!!map.find('flutu0000000000000000000000000003') && map.find('flutu0000000000000000000000000003').parent.id === map.root.id`), true, 'o solto virou filho da raiz');
    eq(await js(`document.querySelectorAll('#svg .node').length`), 4, 'quatro nós clicáveis agora');
    await js(`act.undo()`); await wait(300);
    eq(await js(`(map.meta._momFloating || []).length`), 1, 'o desfazer devolve o solto');
    eq(await js(`map.find('flutu0000000000000000000000000003').parent`), null, 'e o tópico volta a ficar independente');
  });

  await t('salvar depois de trazer: o arquivo mantém o mesmo id de cada tópico', async () => {
    await js(`act.attachFloating()`); await wait(200);
    const out = path.join(TMP, 'salvo.mom');
    await js(`(() => { const fs = require('fs'); fs.writeFileSync(${JSON.stringify(out)}, writeMom(map)); return true; })()`);
    const z = new AdmZip(out); const nodes = JSON.parse(z.getEntry('nodes.json').getData().toString('utf8'));
    const ids = nodes.map((n) => n.id);
    ok(ids.includes('flutu0000000000000000000000000003') && ids.includes('neto00000000000000000000000000004'), 'ids preservados');
    eq(nodes.find((n) => n.id === 'flutu0000000000000000000000000003').parentId, 'raiz00000000000000000000000000001', 'o solto agora é filho da raiz');
  });

  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
