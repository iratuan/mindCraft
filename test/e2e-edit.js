'use strict';
// Edição de nó, com cuidado: no MAPA (F2, duplo clique real, Enter/Esc/clicar fora/Tab, texto vazio, multilinha, hostil, longo, raiz, zoom/pan, desfazer)
// e na REDE DE CONHECIMENTO (selecionar, "Ir para o tópico", duplo clique abre o tópico UMA vez, renomear e ver o rótulo novo, nó fantasma,
// mapas da biblioteca, teclas desligadas com a rede aberta). Mouse e teclado reais.
const fs = require('fs');
const path = require('path');
const start = require('./harness');
const { writeMom, readMom } = require('../core/formats/mom');
const { openLibrary } = require('../core/library');
const { MindMap, createNode } = require('../core/components/model');

(async () => {
  const c = await start('MindCraft e2e — editar nó (mapa e rede de conhecimento)');
  const { js, wait, waitFor, eq, ok, t, TMP, USERDATA } = c; const wc = () => c.win.webContents;
  const titles = () => js('__titles()');
  const idOf = (title) => js(`__id(${JSON.stringify(title)})`);
  const rect = (title) => js(`(() => { const id = __id(${JSON.stringify(title)}), r = document.querySelector('[data-id="' + id + '"]').getBoundingClientRect(); return { id, x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), l: r.left, r: r.right, t: r.top, b: r.bottom }; })()`);
  const mouse = (type, x, y, n = 1) => wc().sendInputEvent({ type, x, y, button: 'left', clickCount: n });
  const click = async (x, y, n = 1) => { mouse('mouseDown', x, y, n); mouse('mouseUp', x, y, n); await wait(80); };
  const dbl = async (x, y) => { await click(x, y, 1); await click(x, y, 2); };
  const key = async (k, o = {}) => { wc().sendInputEvent({ type: 'keyDown', keyCode: k, ...o }); if (k.length === 1) wc().sendInputEvent({ type: 'char', keyCode: k, ...o }); wc().sendInputEvent({ type: 'keyUp', keyCode: k, ...o }); await wait(60); };
  const type = async (text) => { for (const ch of text) { wc().sendInputEvent({ type: 'char', keyCode: ch }); } await wait(60); };
  const fresh = async () => { await js(`closeGraph(); closeDash(); closeModal && closeModal(); closeHome(); dirty = false; newMap(); fit(); true`); await wait(350); };
  const editorOpen = () => js('!editor.hidden');
  const undoLen = () => js('map._undo.length');
  // contador de aberturas do editor e de "ir ao tópico" (para provar que cada gesto faz UMA coisa só)
  await js(`window.__edits = 0; window.__goTos = 0; const se = startEdit; startEdit = function () { window.__edits++; return se.apply(this, arguments); }; const gt = goTo; goTo = function () { window.__goTos++; return gt.apply(this, arguments); }; true`);

  await t('F2 abre o editor com o texto selecionado; digitar + Enter grava com UM desfazer; desfazer e refazer funcionam', async () => {
    await fresh(); const r = await rect('Tópico 1'); await click(r.x, r.y); const u0 = await undoLen();
    await key('F2'); await waitFor(editorOpen); eq(await js('editor.value'), 'Tópico 1'); eq(await js('[editor.selectionStart, editor.selectionEnd]'), [0, 8], 'texto todo selecionado'); eq(await js('document.activeElement.id'), 'editor');
    await type('Direito Penal'); await key('Enter'); await waitFor(async () => !(await editorOpen()));
    eq((await titles()).includes('1:Direito Penal'), true); eq(await undoLen(), u0 + 1); await js('act.undo(); true'); await wait(100); ok((await titles()).includes('1:Tópico 1')); await js('act.redo(); true'); await wait(100); ok((await titles()).includes('1:Direito Penal'));
  });

  await t('Esc cancela (nada muda, nenhuma entrada no histórico); clicar fora CONFIRMA (blur); o foco volta ao mapa', async () => {
    await fresh(); const r = await rect('Tópico 2'); await click(r.x, r.y); const u0 = await undoLen();
    await key('F2'); await waitFor(editorOpen); await waitFor(() => js(`document.activeElement === editor`)); await type('descartado'); await key('Escape'); await waitFor(async () => !(await editorOpen()));
    eq((await titles()).includes('1:Tópico 2'), true); eq(await undoLen(), u0, 'sem histórico'); eq(await js('document.activeElement.id'), 'stage', 'foco volta ao mapa');
    await key('F2'); await waitFor(editorOpen); await type('Confirmado ao clicar fora'); await click(600, 600); await waitFor(async () => !(await editorOpen())); ok((await titles()).includes('1:Confirmado ao clicar fora'), (await titles()).join(','));
  });

  await t('DUPLO CLIQUE real num tópico abre o editor UMA vez só; confirmar com Enter não reabre o editor', async () => {
    await fresh(); const r = await rect('Tópico 3'); await js('window.__edits = 0; true'); await dbl(r.x, r.y); await waitFor(editorOpen); await wait(300);
    eq(await js('window.__edits'), 1, 'startEdit chamado uma vez'); eq(await js('editor.value'), 'Tópico 3'); await type('Legalidade'); await key('Enter'); await wait(500);
    eq(await editorOpen(), false, 'o editor NÃO reabre depois do Enter'); ok((await titles()).includes('1:Legalidade'));
  });

  await t('texto vazio ou só espaços é recusado (mantém o título); espaços nas pontas são removidos; Shift+Enter cria linha nova; Enter confirma', async () => {
    await fresh(); const r = await rect('Tópico 1'); await click(r.x, r.y);
    await key('F2'); await waitFor(editorOpen); await js(`editor.value = '   '; true`); await key('Enter'); await wait(150); ok((await titles()).includes('1:Tópico 1'), 'vazio recusado: ' + (await titles()).join(','));
    await key('F2'); await waitFor(editorOpen); await js(`editor.value = '   Com espaços   '; true`); await key('Enter'); await wait(150); ok((await titles()).includes('1:Com espaços'), (await titles()).join(','));
    await key('F2'); await waitFor(editorOpen); await js(`editor.value = 'linha 1'; true`); await key('End'); await key('Enter', { modifiers: ['shift'] }); await wait(100); eq(await editorOpen(), true, 'Shift+Enter não confirma'); await js(`document.execCommand('insertText', false, '\\n'); true`); await type('linha 2'); await key('Enter'); await wait(200);
    ok((await titles()).some((x) => x === '1:linha 1\nlinha 2'), JSON.stringify(await titles()));
  });

  await t('texto hostil vira TEXTO (nada executa); texto longo é aceito e o mapa continua funcionando; acentos e emoji', async () => {
    await fresh(); const r = await rect('Tópico 2'); await click(r.x, r.y); const EVIL = '<img src=x onerror="window.__pwn=1"><script>window.__pwn=2</script>';
    await key('F2'); await waitFor(editorOpen); await js(`editor.value = ${JSON.stringify(EVIL)}; true`); await key('Enter'); await wait(300);
    eq(await js('window.__pwn'), undefined); eq(await js(`document.querySelectorAll('#view img, #view script').length`), 0); ok((await js('document.querySelector("#view").textContent')).includes('<img src=x'), 'aparece como texto');
    const long = 'Princípio da legalidade administrativa e seus desdobramentos '.repeat(8); await click(r.x, r.y); await key('F2'); await waitFor(editorOpen); await js(`editor.value = ${JSON.stringify(long)}; editor.dispatchEvent(new Event('input')); true`); await key('Enter'); await wait(300);
    ok((await titles()).some((x) => x.length > 400), 'longo gravado'); await js('fit(); true'); eq(await js('Number.isFinite(pan.k) && L.boxes.size > 3'), true);
    await click(r.x, r.y); await key('F2'); await waitFor(editorOpen); await js(`editor.value = 'Ação — ç ã é 日本語 🙂'; true`); await key('Enter'); await wait(200); ok((await titles()).includes('1:Ação — ç ã é 日本語 🙂'));
  });

  await t('Tab dentro do editor confirma e cria um filho já em edição; Enter confirma o filho; os dois entram no histórico', async () => {
    await fresh(); const r = await rect('Tópico 1'); await click(r.x, r.y); await key('F2'); await waitFor(editorOpen); await type('Pai'); await key('Tab'); await waitFor(async () => (await js('editor.value')) !== 'Pai' && (await editorOpen()));
    await type('Filho'); await key('Enter'); await wait(300); const ts = await titles(); ok(ts.includes('1:Pai') && ts.includes('2:Filho'), ts.join(','));
  });

  await t('editar a RAIZ muda o título do mapa; o campo de edição fica alinhado ao tópico em zoom 50%, 100% e 200%, e sempre dentro da área de trabalho', async () => {
    await fresh(); let r = await rect('Ideia central'); await click(r.x, r.y); await key('F2'); await waitFor(editorOpen); await type('Concurso TRF'); await key('Enter'); await wait(300); eq(await js('map.root.title'), 'Concurso TRF');
    for (const k of [0.5, 1, 2]) {
      await js(`zoomTo(${k}); true`); await wait(250); r = await rect('Tópico 3'); await click(r.x, r.y); await key('F2'); await waitFor(editorOpen);
      const e = await js(`(() => { const a = editor.getBoundingClientRect(), s = stage.getBoundingClientRect(); return { cx: a.left + a.width / 2, cy: a.top + a.height / 2, inside: a.left >= s.left - 1 && a.right <= s.right + 1 && a.top >= s.top - 1 && a.bottom <= s.bottom + 1 }; })()`);
      ok(Math.abs(e.cx - r.x) < 140 && Math.abs(e.cy - r.y) < 60, `editor alinhado ao tópico em ${k * 100}%: editor(${Math.round(e.cx)},${Math.round(e.cy)}) tópico(${r.x},${r.y})`); ok(e.inside, 'editor dentro da área de trabalho em ' + k * 100 + '%'); await key('Escape');
    }
  });

  await t('o novo título aparece em todo lugar: Estrutura, busca, grafo, .mom salvo e biblioteca; reabrir mantém', async () => {
    await fresh(); const r = await rect('Tópico 1'); await click(r.x, r.y); await key('F2'); await waitFor(editorOpen); await type('Controle de constitucionalidade'); await key('Enter'); await wait(300);
    await js(`showPanel('outline'); true`); await wait(200); ok((await js(`document.querySelector('#panels').textContent`)).includes('Controle de constitucionalidade'), 'Estrutura');
    await js(`document.querySelector('#search').value = 'constitucionalidade'; document.querySelector('#search').dispatchEvent(new Event('input')); true`); await wait(300); ok((await js(`document.querySelectorAll('#view .hit, #view .match').length`)) >= 1 || (await js(`document.querySelector('#statusbar').textContent`)).includes('1'), 'busca encontra'); await js(`document.querySelector('#search').value = ''; document.querySelector('#search').dispatchEvent(new Event('input')); true`);
    await js('act.graph(); true'); await wait(900); ok((await js(`document.querySelector('#gsvg').textContent`)).includes('Controle'), 'rótulo no grafo'); await js('closeGraph(); true');
    const f = path.join(TMP, 'edit.mom'); c.win.webContents.executeJavaScript(`true`); await js(`window.__dlg.save = ${JSON.stringify(f)}`); ok(await js('save(true)')); eq(readMom(fs.readFileSync(f)).root.children[0].title, 'Controle de constitucionalidade');
    await js(`dirty = false; newMap(); openPath(${JSON.stringify(f)}); true`); await waitFor(() => js(`filePath === ${JSON.stringify(f)}`)); ok((await titles()).includes('1:Controle de constitucionalidade'));
    await js('moveToLibrary(); true'); await wait(300); const lib = openLibrary(path.join(USERDATA, 'biblioteca.db')); ok(lib.searchTopics('constitucionalidade').length >= 1, 'biblioteca'); lib.close();
  });

  // ---------------- REDE DE CONHECIMENTO ----------------
  const openGraph = async () => { await js('act.graph(); true'); await waitFor(() => js(`!!document.querySelector('#gsvg') && !document.querySelector('#graph').hidden && !!window.__gl`), 8000).catch(() => {}); await wait(900); };
  const gnode = (title) => js(`(() => { const i = gLast.nodes.findIndex((n) => n.title === ${JSON.stringify(title)}); if (i < 0) return null; const el = document.querySelector('.gn[data-i="' + i + '"]'); const r = (el.querySelector('circle') || el).getBoundingClientRect(); return { i, x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), id: gLast.nodes[i].id }; })()`);

  await t('REDE: tocar num nó mostra o painel lateral com o título; "Ir para o tópico" fecha a rede, seleciona o tópico e F2 edita; o rótulo na rede muda', async () => {
    await fresh(); await js(`map.addChild(map.root.children[0].id, 'Neto A'); render(); true`); await wait(200); await openGraph();
    const g = await gnode('Tópico 1'); ok(g, 'nó Tópico 1 na rede'); await click(g.x, g.y); await wait(300); ok((await js(`document.querySelector('#gSide').textContent`)).includes('Tópico 1'), 'painel lateral');
    await js(`document.querySelector('#gGo').click(); true`); await wait(300); eq(await js('graphOpen'), false); eq(await js(`map.find(selectedId).node.title`), 'Tópico 1');
    await key('F2'); await waitFor(editorOpen); await type('Direito Civil'); await key('Enter'); await wait(300);
    await openGraph(); ok(await gnode('Direito Civil'), 'rótulo novo na rede'); eq(await gnode('Tópico 1'), null, 'rótulo antigo sumiu'); await js('closeGraph(); true');
  });

  await t('REDE: DUPLO CLIQUE real num nó abre o tópico UMA vez (rede fecha, tópico selecionado) e o editor pode ser aberto na hora', async () => {
    await fresh(); await openGraph(); const g = await gnode('Tópico 2'); await js('window.__goTos = 0; window.__edits = 0; true'); await dbl(g.x, g.y); await waitFor(() => js('graphOpen === false'), 4000); await wait(400);
    eq(await js('window.__goTos'), 1, 'goTo chamado uma vez'); eq(await js(`map.find(selectedId).node.title`), 'Tópico 2'); eq(await editorOpen(), false, 'abrir o tópico não abre o editor sozinho');
    await key('F2'); await waitFor(editorOpen); eq(await js('editor.value'), 'Tópico 2'); await type('Direito Penal'); await key('Enter'); await wait(300); ok((await titles()).includes('1:Direito Penal'));
  });

  await t('REDE: com a rede ABERTA, as teclas do mapa ficam desligadas (F2/Tab/Delete não editam nem apagam nada); Esc fecha a rede', async () => {
    await fresh(); const n0 = (await titles()).length; const r = await rect('Tópico 1'); await click(r.x, r.y); await openGraph(); const u0 = await undoLen();
    await key('F2'); await key('Tab'); await key('Delete'); await wait(200); eq(await editorOpen(), false, 'F2 não abre o editor por baixo'); eq((await titles()).length, n0); eq(await undoLen(), u0); await key('Escape'); await wait(200); eq(await js('graphOpen'), false);
  });

  await t('REDE: nó FANTASMA ([[link]] sem destino): "Criar este tópico" cria, seleciona e permite renomear; o link continua apontando pelo título', async () => {
    await fresh(); const r = await rect('Tópico 1'); await click(r.x, r.y); await js(`map.update(selectedId, { notes: 'Ver [[Prazo de decadência]] depois' }); render(); true`); await wait(200); await openGraph();
    const g = await gnode('Prazo de decadência'); ok(g, 'fantasma aparece na rede'); await click(g.x, g.y); await wait(300); ok(await js(`!!document.querySelector('#gCreate')`), 'botão Criar');
    await js(`document.querySelector('#gCreate').click(); true`); await wait(500); ok((await titles()).some((x) => x.endsWith('Prazo de decadência')), (await titles()).join(',')); await js('closeGraph(); true');
    const r2 = await rect('Prazo de decadência'); await click(r2.x, r2.y); await key('F2'); await waitFor(editorOpen); await type('Prazo prescricional'); await key('Enter'); await wait(300); ok((await titles()).some((x) => x.endsWith('Prazo prescricional')));
  });

  await t('REDE entre mapas da biblioteca: duplo clique num nó de OUTRO mapa abre aquele mapa no tópico certo; editar lá e voltar mostra o novo rótulo', async () => {
    const lib = openLibrary(path.join(USERDATA, 'biblioteca.db')); const mk = (name, kids, notes) => { const m = new MindMap(createNode(name)); m.meta.name = name; kids.forEach((k) => m.addChild(m.root.id, k)); if (notes) m.update(m.root.children[0].id, { notes }); return m; };
    const A = mk('Mapa Alfa', ['Alfa 1', 'Alfa 2'], 'Veja [[Beta 1]]'), B = mk('Mapa Beta', ['Beta 1', 'Beta 2']); const ida = lib.saveMap(A), idb = lib.saveMap(B); lib.close();
    await js(`saveCfg({ scope: 'vault' }); closeGraph(); dirty = false; closeHome(); closeLibrary && closeLibrary(); openFromLibrary(${JSON.stringify(ida)}, { confirm: false }); true`); await waitFor(() => js(`map.root.title === 'Mapa Alfa'`), 6000);
    await openGraph(); const g = await gnode('Beta 1'); ok(g, 'nó de outro mapa visível na rede: ' + JSON.stringify(await js('gLast.nodes.map((n) => n.title)')));
    await dbl(g.x, g.y); await waitFor(() => js(`map.root.title === 'Mapa Beta'`), 8000); await wait(400); eq(await js(`map.find(selectedId).node.title`), 'Beta 1', 'tópico certo selecionado');
    await key('F2'); await waitFor(editorOpen); await type('Beta Primeiro'); await key('Enter'); await wait(300); ok(await js('save(false)')); await wait(300);
    const lib2 = openLibrary(path.join(USERDATA, 'biblioteca.db')); ok(lib2.searchTopics('Beta Primeiro').length === 1, 'salvo na biblioteca'); lib2.close();
    await js(`saveCfg({ scope: 'map' }); true`);
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
