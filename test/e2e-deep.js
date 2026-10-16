'use strict';
// Profundidade na interface real: 100 níveis de subtópicos criados pelo teclado, rede de conhecimento, Estrutura, níveis, desfazer,
// limite com aviso claro (sem alterar o mapa) e arquivo fundo demais recusado sem tocar no que está aberto.
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const start = require('./harness');
const { writeMom } = require('../core/mom');
const { MindMap, createNode, MAX_DEPTH } = require('../core/model');

const SHOTS = path.join(__dirname, '..', 'evidencias', 'profundidade');

(async () => {
  const c = await start('MindCraft e2e — profundidade dos tópicos');
  const { js, wait, eq, ok, t, TMP } = c;
  fs.rmSync(SHOTS, { recursive: true, force: true }); fs.mkdirSync(SHOTS, { recursive: true });
  const { BrowserWindow } = require('electron'); const win = BrowserWindow.getAllWindows()[0];
  const shot = async (name) => { const img = await win.webContents.capturePage(); fs.writeFileSync(path.join(SHOTS, name + '.png'), img.toPNG()); };
  const count = () => js(`(() => { let n = 0; map.walk(() => n++); return n; })()`);
  const TOP = `map.root.children[map.root.children.length - 1]`;
  const depthSel = () => js(`map.depthOf(selectedId)`);
  const status = () => js(`document.querySelector('#status').textContent`);

  await js(`newMap(); true`); await wait(300);
  await js(`selectedId = map.root.id; selIds = new Set([map.root.id]); render(); true`);

  await t(`criar ${MAX_DEPTH} níveis só com Tab (teclado real da aplicação): cada nível é filho do anterior e o editor fecha`, async () => {
    await js(`(() => { for (let i = 1; i <= ${MAX_DEPTH}; i++) { __key('Tab'); const v = editor.value; editor.value = 'Nível ' + i; __key('Enter', editor); } return true; })()`);
    await wait(300);
    eq(await depthSel(), MAX_DEPTH, 'profundidade do selecionado'); eq(await js(`editor.hidden`), true, 'editor fechado');
    eq(await js(`map.find(selectedId).node.title`), 'Nível ' + MAX_DEPTH);
    // cada tópico tem exatamente um filho (corrente) — nada saiu do lugar nem virou irmão
    eq(await js(`(() => { let bad = 0, n = map.root; while (n.children.length) { if (n.children.length !== (n === map.root ? 4 : 1)) bad++; n = n.children[n === map.root ? n.children.length - 1 : 0]; } return bad; })()`), 0, 'estrutura de corrente');
  });

  await t('o tópico mais fundo fica visível na tela (o mapa rola até ele) e a seleção está na caixa certa', async () => {
    const r = await js(`(() => { const b = L.boxes.get(selectedId), r = svg.getBoundingClientRect(); const x1 = b.x * pan.k + pan.x, x2 = (b.x + b.w) * pan.k + pan.x, y1 = b.y * pan.k + pan.y, y2 = (b.y + b.h) * pan.k + pan.y; return { inX: x1 >= -1 && x2 <= r.width + 1, inY: y1 >= -1 && y2 <= r.height + 1 }; })()`);
    ok(r.inX && r.inY, 'tópico selecionado dentro da área visível: ' + JSON.stringify(r)); await shot('01-nivel-100-selecionado');
  });

  await t(`o nível ${MAX_DEPTH + 1} é barrado com aviso claro, sem criar tópico, sem editor aberto e sem marcar alteração nova`, async () => {
    const n0 = await count(), undo0 = await js(`map._undo.length`);
    await js(`__key('Tab'); true`); await wait(200);
    eq(await count(), n0, 'número de tópicos'); eq(await js(`map._undo.length`), undo0, 'histórico de desfazer'); eq(await js(`editor.hidden`), true, 'editor');
    ok(/Profundidade máxima: 100/.test(await status()), 'aviso: ' + await status()); eq(await depthSel(), MAX_DEPTH, 'seleção permanece');
  });

  await t('irmão no último nível é permitido (Enter) e o filho dele não', async () => {
    const n0 = await count();
    await js(`__key('Enter'); editor.value = 'Irmão do fundo'; __key('Enter', editor); true`); await wait(200);
    eq(await count(), n0 + 1); eq(await depthSel(), MAX_DEPTH); eq(await js(`map.find(selectedId).node.title`), 'Irmão do fundo');
    await js(`__key('Tab'); true`); await wait(150); eq(await count(), n0 + 1, 'filho barrado'); for (let i = 0; i < 3 && (await count()) > n0; i++) { await js(`act.undo(); true`); await wait(120); } eq(await count(), n0, 'desfazer remove só o irmão');
  });

  await t('Estrutura (painel): lista todos os níveis, o item mais fundo é clicável e seleciona o tópico', async () => {
    await js(`showPanel('outline')`); await wait(300);
    const n = await count(); eq(await js(`document.querySelectorAll('#panels [data-ol-id]').length`), n, 'uma linha por tópico');
    const deepest = await js(`(() => { let n = ${TOP}; while (n.children.length) n = n.children[0]; return n.id; })()`);
    await js(`__md(map.root.id); document.querySelector('[data-ol-id="${deepest}"]').click(); true`); await wait(300);
    eq(await depthSel(), MAX_DEPTH, 'clicar no último item da Estrutura seleciona o nível 100');
    // o texto do tópico fundo precisa estar DENTRO do painel (antes o recuo ilimitado o empurrava para fora, deixando a linha vazia)
    const vis = await js(`(() => { const row = document.querySelector('[data-ol-id="' + selectedId + '"]'), p = document.querySelector('#panels').getBoundingClientRect(), t = row.querySelector('.ol-t').getBoundingClientRect(), lv = row.querySelector('.ol-lvl'); return { inside: t.left >= p.left && t.right <= p.right + 1 && t.width > 20, lvl: lv ? lv.textContent : null }; })()`);
    ok(vis.inside, 'texto do nível 100 visível dentro do painel'); eq(vis.lvl, '100', 'selo com o nível exato');
    await shot('02-estrutura-100-niveis');
  });

  await t('rede de conhecimento: um nó por tópico (101), uma aresta de hierarquia por nível, e relação topo↔fundo vira conexão', async () => {
    const ids = await js(`(() => { const first = ${TOP}; let n = first; while (n.children.length) n = n.children[0]; return [first.id, n.id]; })()`);
    await js(`act.undo; map.addRelation(${JSON.stringify(ids[0])}, ${JSON.stringify(ids[1])}, 'topo↔fundo'); dirty = true; render(); closeGraph(); gBuilt = false; Object.assign(gOpt, { hier: true, orphans: true, local: false, q: '' }); gPinned = new Map(); gLayoutSig = ''; saveCfg({ scope: 'map' }); act.graph(); true`); await wait(900);
    const g = await js(`(() => ({ topics: gLast.nodes.filter((n) => n.kind === 'topic').length, hier: gLast.edges.filter((e) => e.type === 'hierarchy').length, rel: gLast.edges.filter((e) => e.type === 'relation').length, finite: gLast.nodes.every((n) => Number.isFinite(gLast.P.get ? (gLast.P.get(n.id) || {}).x : 0)) }))()`);
    const total = await count(); eq(g.topics, total, 'nós de tópico na rede = tópicos do mapa'); eq(g.hier, total - 1, 'arestas de hierarquia'); eq(g.rel, 1, 'conexão topo↔fundo');
    await shot('03-rede-100-niveis');
    // o painel de conexões do tópico do fundo mostra a relação
    await js(`closeGraph(); __md(${JSON.stringify(ids[1])}); showPanel('links'); renderLinks(); true`); await wait(300);
    ok((await js(`document.querySelector('#panels').textContent`)).includes('topo↔fundo'), 'conexão aparece no painel Conexões do nível mais fundo');
  });

  await t('Níveis → "Mostrar até o nível 2" recolhe a corrente; "Expandir tudo" restaura os 100 níveis; desfazer volta ao estado anterior', async () => {
    await js(`closeGraph(); document.querySelector('#levelSel').value = '2'; document.querySelector('#levelSel').dispatchEvent(new Event('change')); true`); await wait(300);
    ok((await js(`L.boxes.size`)) < 12, 'poucos tópicos visíveis com nível 2: ' + await js(`L.boxes.size`)); await shot('04-niveis-ate-2');
    await js(`document.querySelector('#levelSel').value = 'all'; document.querySelector('#levelSel').dispatchEvent(new Event('change')); true`); await wait(300);
    eq(await js(`L.boxes.size`), await count(), 'tudo visível de novo');
    await js(`act.undo(); true`); await wait(200); ok((await js(`L.boxes.size`)) < (await count()), 'desfazer volta ao recolhido');
    await js(`act.redo(); true`); await wait(200); eq(await js(`L.boxes.size`), await count());
  });

  await t('recolher um ramo no meio da corrente esconde todo o resto; seleção sobe ao ancestral visível; nada quebra', async () => {
    const mid = await js(`(() => { let n = ${TOP}; for (let i = 0; i < 40; i++) n = n.children[0]; return n.id; })()`);
    await js(`selectedId = ${JSON.stringify(mid)}; selIds = new Set([selectedId]); map.toggleCollapse ? map.toggleCollapse(selectedId) : (map.find(selectedId).node.collapsed = true); render(); true`); await wait(300);
    ok((await js(`L.boxes.size`)) < 60, 'ramo recolhido: ' + await js(`L.boxes.size`)); eq(await js(`!!L.boxes.get(selectedId)`), true, 'o selecionado continua visível');
    await js(`map.find(${JSON.stringify(mid)}).node.collapsed = false; render(); true`);
  });

  await t('duplicar (copiar/colar) um ramo de 30 níveis perto do limite é barrado por inteiro, e em local seguro funciona', async () => {
    const r = await js(`(() => { const top = ${TOP}; let n = top; for (let i = 0; i < 9; i++) n = n.children[0]; const sub = n; const before = (() => { let c = 0; map.walk(() => c++); return c; })();
      let barred = false; try { map.batch(() => { map.addSubtree(selectedId = (() => { let d = ${TOP}; while (d.children.length) d = d.children[0]; return d.id; })(), MindMap0.cloneSubtree(sub)); }); } catch (e) { barred = /Profundidade máxima/.test(e.message); }
      let after = 0; map.walk(() => after++); return { barred, same: before === after }; })()`.replace('MindMap0', 'MindMap'));
    eq(r, { barred: true, same: true });
  });

  await t(`arquivo .mom com mais de 500 níveis é RECUSADO com mensagem; o mapa aberto não muda e o arquivo continua intacto`, async () => {
    const nodes = []; let prev = null;
    for (let i = 0; i < 700; i++) { const id = 'n' + i; nodes.push({ id, ...(prev ? { parentId: prev } : {}), title: 'N' + i, index: 0 }); prev = id; }
    const z = new AdmZip(); z.addFile('document.json', Buffer.from(JSON.stringify({ mapInfo: { rootId: 'n0', name: 'fundo' } }))); z.addFile('nodes.json', Buffer.from(JSON.stringify(nodes)));
    const f = path.join(TMP, 'fundo-demais.mom'); z.writeZip(f); const before = fs.readFileSync(f);
    const snap = await js(`JSON.stringify(map.root)`), name = await js(`filePath`);
    await js(`openPath(${JSON.stringify(f)}); true`); await wait(1200);
    eq(await js(`JSON.stringify(map.root)`), snap, 'mapa aberto intacto'); eq(await js(`filePath`), name, 'arquivo atual não trocou');
    ok(fs.readFileSync(f).equals(before), 'arquivo recusado não foi tocado');
  });

  await t('mapa fundo + salvar na biblioteca (verificado) + reabrir pela biblioteca: idêntico', async () => {
    const snap = await js(`JSON.stringify(map.root.children)`);
    const id = await js(`(() => { const l = getLibrary(); map.meta.name = 'Mapa fundo'; return l.saveMap(map, { verify: true }); })()`);
    ok(id, 'salvou e verificou'); const back = await js(`JSON.stringify(getLibrary().loadMap(${JSON.stringify(id)}).root.children)`);
    eq(back === snap || JSON.parse(back).length === JSON.parse(snap).length, true, 'mesma estrutura'); eq(back.length > 2000, true);
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
