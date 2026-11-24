'use strict';
// Evidência: ações da barra flutuante do tópico (#nodebar) com CLIQUES REAIS no app Electron.
// Cobre: posicionamento acima do nó, criar filho, subir/descer, nota, IA e excluir.
const start = require('./harness');
const path = require('path');
(async () => {
  const c = await start('node-bar: ações com cliques reais');
  const { js, wait, eq, ok, t } = c;
  const wc = () => c.win.webContents;

  const rect = async (sel) => {
    const p = await js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width/2, y: r.top + r.height/2, w: r.width, h: r.height, top: r.top, bottom: r.bottom }; })()`);
    ok(p, 'elemento encontrado: ' + sel);
    return p;
  };
  const clickSel = async (sel) => {
    const p = await rect(sel);
    const x = Math.round(p.x), y = Math.round(p.y);
    wc().sendInputEvent({ type: 'mouseMove', x, y });
    wc().sendInputEvent({ type: 'mouseDown', x, y, button: 'left', clickCount: 1 });
    wc().sendInputEvent({ type: 'mouseUp', x, y, button: 'left', clickCount: 1 });
    await wait(500);
  };
  const visible = (sel) => js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); return !!e && !e.hidden && e.getBoundingClientRect().width > 0; })()`);
  const closeEditor = () => js(`(() => { const ed = document.getElementById('editor'); if (ed && !ed.hidden) ed.blur(); return true; })()`);
  const select = (id) => js(`selectedId = ${JSON.stringify(id)}; selIds = new Set([selectedId]); render(); true`);

  // a abertura (splash) cobre a janela e intercepta cliques reais até sair
  await c.waitFor(() => js(`document.getElementById('splash').hidden`), 20000);

  // mapa com 3 filhos; seleciona o do meio
  await js(`(() => {
    while (map.root.children.length < 3) map.addChild(map.root.id);
    selectedId = map.root.children[1].id; selIds = new Set([selectedId]); render();
    return true;
  })()`);
  await wait(500);

  await t('a barra aparece flutuando acima do tópico selecionado', async () => {
    ok(await visible('#nodebar'), 'node-bar visível');
    const bar = await rect('#nodebar');
    const node = await js(`(() => { const b = L.boxes.get(selectedId), r = svg.getBoundingClientRect(); return { cx: r.left + (b.x + b.w/2) * pan.k + pan.x, top: r.top + b.y * pan.k + pan.y }; })()`);
    ok(bar.bottom <= node.top + 4, 'barra fica acima do nó (bar.bottom <= node.top)');
    ok(Math.abs(bar.x - node.cx) < bar.w, 'barra centralizada sobre o nó');
    await c.shot(path.join(__dirname, '..', 'evidencias', 'nodebar-flutuando.png'));
  });

  await t('clique em Novo subtópico cria um filho do tópico selecionado', async () => {
    const host = await js(`selectedId`);
    const before = await js(`map.find(${JSON.stringify(host)}).node.children.length`);
    ok(await visible('#nbChild'), 'botão Novo subtópico visível');
    await clickSel('#nbChild');
    const after = await js(`map.find(${JSON.stringify(host)}).node.children.length`);
    eq(after, before + 1, 'um novo filho foi criado');
    await closeEditor();
    await select(host);
    await wait(300);
  });

  await t('clique em Escrever nota abre o painel de notas em edição', async () => {
    await clickSel('#nbNote');
    ok(await js(`!document.querySelector('.panel[data-panel="notes"]').hidden`), 'painel Notas visível');
    ok(await js(`document.activeElement === notes`), 'foco no campo de notas');
    await js(`notes.blur(); true`);
  });

  await t('clique em Assistente de IA abre o painel de IA', async () => {
    await clickSel('#nbAi');
    ok(await js(`!document.querySelector('.panel[data-panel="ai"]').hidden`), 'painel IA visível');
  });

  await t('clique em Subir e Descer reordena preservando cor, nota, filhos e setas', async () => {
    await select(await js(`map.root.children[1].id`));
    await wait(300);
    const id = await js(`selectedId`);
    await js(`(() => {
      map.update(${JSON.stringify(id)}, { notes: 'Nota que deve sobreviver', style: { fill: '#ff3300' }, markers: ['importante'], progress: 40 });
      window.__nbFilho = map.addChild(${JSON.stringify(id)}, 'Filho do alvo').id;
      window.__nbRel = map.addRelation(${JSON.stringify(id)}, map.root.children[0].id, 'seta').id;
      return true;
    })()`);
    await wait(200);
    const idx = () => js(`map.root.children.findIndex((n) => n.id === ${JSON.stringify(id)})`);
    eq(await idx(), 1, 'tópico começa na posição 1');
    await clickSel('#nbUp');
    eq(await idx(), 0, 'Subir moveu para a posição 0');
    await select(id);
    await wait(300);
    await clickSel('#nbDown');
    eq(await idx(), 1, 'Descer voltou para a posição 1');
    const after = await js(`(() => {
      const n = map.find(${JSON.stringify(id)}).node, f = map.find(window.__nbFilho);
      return { notes: n.notes, fill: n.style.fill, markers: n.markers, progress: n.progress,
        filho: !!f, paiDoFilho: f && f.parent.id, seta: map.meta.relations.some((r) => r.id === window.__nbRel) };
    })()`);
    eq(after.notes, 'Nota que deve sobreviver', 'nota preservada');
    eq(after.fill, '#ff3300', 'cor preservada');
    eq(after.markers, ['importante'], 'marcador preservado');
    eq(after.progress, 40, 'progresso preservado');
    eq(after.filho, true, 'filho continua no mapa');
    eq(after.paiDoFilho, id, 'filho continua com o mesmo pai');
    eq(after.seta, true, 'seta (relação) preservada');
  });

  await t('clique em Excluir remove o tópico selecionado', async () => {
    await select(await js(`map.root.children[1].id`));
    await wait(300);
    const before = await js(`map.root.children.length`);
    await clickSel('#nbDelete');
    const after = await js(`map.root.children.length`);
    eq(after, before - 1, 'tópico excluído');
  });

  await t('Excluir da barra remove só o tópico selecionado e seus filhos, não o grupo selecionado', async () => {
    await js(`(() => {
      while (map.root.children.length < 3) map.addChild(map.root.id);
      const a = map.root.children[0], b = map.root.children[1];
      const filho = map.addChild(b.id);
      window.__nbA = a.id; window.__nbB = b.id; window.__nbFilho = filho.id;
      selectedId = b.id; selIds = new Set([a.id, b.id]); render();
      return true;
    })()`);
    await wait(400);
    ok(await js(`selIds.size === 2 && selectedId === window.__nbB`), 'dois tópicos selecionados; barra sobre o segundo');
    await clickSel('#nbDelete');
    ok(await js(`!map.find(window.__nbB)`), 'tópico da barra foi excluído');
    ok(await js(`!map.find(window.__nbFilho)`), 'filho do tópico foi excluído junto');
    ok(await js(`!!map.find(window.__nbA)`), 'o outro tópico selecionado permaneceu');
  });

  await c.shot(path.join(__dirname, '..', 'evidencias', 'nodebar-acoes.png'));
  await c.finish();
})().catch((e) => { console.log('ERRO:', e && e.stack); process.exit(1); });
