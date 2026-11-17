'use strict';
// Ponta a ponta do leitor de PDF dividido: abrir, selecionar trecho → tópico/nota (página + destaque), fontes no painel Notas, relink, salvar/abrir.
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const start = require('./harness');
const { readMom } = require('../core/formats/mom');

function makePdf(file, pages) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 60 }); const out = fs.createWriteStream(file);
    doc.pipe(out); out.on('finish', resolve); out.on('error', reject);
    pages.forEach((lines, i) => { if (i) doc.addPage(); doc.fontSize(16).text('Lei de Estudo — Capítulo ' + (i + 1), { underline: false }); doc.moveDown(); doc.fontSize(12); lines.forEach((l) => { doc.text(l); doc.moveDown(0.5); }); });
    doc.end();
  });
}

(async () => {
  const c = await start('MindCraft e2e — leitor de PDF dividido');
  const { js, wait, eq, ok, t, TMP, USERDATA } = c;
  const txt = (s) => js(`document.querySelector(${JSON.stringify(s)}).textContent`);
  const click = (s) => js(`document.querySelector(${JSON.stringify(s)}).click()`);
  const pdfA = path.join(TMP, 'Lei Teste ç.pdf'), pdfBig = path.join(TMP, 'grande.pdf'), bad = path.join(TMP, 'ruim.pdf'), blank = path.join(TMP, 'sem-texto.pdf');
  await makePdf(pdfA, [
    ['A crase é a fusão da preposição a com o artigo a.', 'Emprega-se a crase antes de palavras femininas.'],
    ['O princípio da legalidade exige lei prévia.', 'Ninguém será obrigado a fazer algo senão em virtude de lei.'],
    ['Licitação é o procedimento administrativo para contratar.'],
  ]);
  await makePdf(pdfBig, Array.from({ length: 60 }, (_, i) => ['Página número ' + (i + 1) + ' com texto único zebra' + (i + 1)]));
  fs.writeFileSync(bad, 'isto não é um pdf'); await new Promise((r) => { const d = new PDFDocument(); const o = fs.createWriteStream(blank); d.pipe(o); o.on('finish', r); d.rect(50, 50, 100, 100).fill('#ccc'); d.end(); });
  const settle = async () => { let last = -1; for (let i = 0; i < 40; i++) { const y = await js(`document.querySelector('#pdfScroll').scrollTop`); if (y === last) return; last = y; await wait(180); } };
  const waitText = (n) => c.waitFor(() => js(`document.querySelectorAll('.pdf-page[data-page="${n}"] .textLayer span').length > 0`), 15000);
  const selectText = async (needle, page) => { await settle(); return js(`(() => {
    const spans = [...document.querySelectorAll('.pdf-page[data-page="${page}"] .textLayer span')];
    const s = spans.find((x) => x.textContent.includes(${JSON.stringify(needle)})); if (!s) throw new Error('trecho não encontrado: ' + ${JSON.stringify(needle)});
    const r = document.createRange(); r.selectNodeContents(s.firstChild || s); const g = getSelection(); g.removeAllRanges(); g.addRange(r);
    document.querySelector('#pdfScroll').dispatchEvent(new MouseEvent('mouseup', { bubbles: true })); return s.textContent; })()`); };
  const N = (title) => `map.find(__id(${JSON.stringify(title)})).node`;

  await t('abrir o leitor divide a tela (mapa e PDF lado a lado); fechar restaura; nada suja o mapa', async () => {
    await js(`dirty = false; newMap(); map.root.children = []; map.root.title = 'Direito'; ['Crase', 'Legalidade'].forEach((x) => map.addChild(map.root.id, x)); render(); __md(__id('Crase')); true`);
    const w0 = await js(`document.querySelector('#stage').getBoundingClientRect().width`);
    await js(`window.__dlg.pdf = null; act.pdf()`); await c.waitFor(() => js(`!document.querySelector('#pdfpane').hidden && !!document.querySelector('#pdfOpen')`));
    ok((await txt('#pdfpane')).includes('Abra um PDF'), 'estado vazio'); ok((await js(`document.querySelector('#stage').getBoundingClientRect().width`)) < w0 - 200, 'o mapa cedeu espaço');
    eq(await js('dirty'), false); eq(await js('document.querySelector("#pdfpane [data-ui]").dataset.ui'), 'react');
    await js('act.pdf()'); await c.waitFor(() => js(`document.querySelector('#pdfpane').hidden`)); ok((await js(`document.querySelector('#stage').getBoundingClientRect().width`)) > w0 - 20, 'restaurou a largura');
  });

  await t('abrir um PDF: páginas, texto selecionável, contagem, navegação, zoom e busca; abrir não suja o mapa', async () => {
    await js(`window.__dlg.pdf = ${JSON.stringify(pdfA)}; act.pdf()`); await c.waitFor(() => js(`!!document.querySelector('#pdfOpen')`)); await click('#pdfOpen');
    await c.waitFor(() => js(`document.querySelectorAll('.pdf-page').length === 3`), 15000); await waitText(1);
    eq(await txt('#pdfPageCount'), '/ 3'); eq(await js('dirty'), false, 'só ler não altera o mapa'); eq(await js('(map.meta.pdfs || []).length'), 0, 'ainda não registrado');
    eq(await js(`document.querySelector('#pdfSel option:checked').textContent`), 'Lei Teste ç');
    await click('#pdfNext'); await c.waitFor(() => js(`document.querySelector('#pdfPageNum').value === '2'`), 8000);
    const z0 = await js(`document.querySelector('.pdf-page').getBoundingClientRect().width`); await click('#pdfZoomIn'); await wait(500);
    ok((await js(`document.querySelector('.pdf-page').getBoundingClientRect().width`)) > z0, 'zoom aumentou');
    await js(`(() => { const f = document.querySelector('#pdfFind'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(f, 'licitacao'); f.dispatchEvent(new Event('input', { bubbles: true })); f.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); })()`);
    await c.waitFor(() => js(`document.querySelector('#pdfPageNum').value === '3'`), 8000); ok((await txt('#pdfMsg')).includes('encontrado na p. 3'), await txt('#pdfMsg'));
  });

  await t('selecionar trecho → "＋ Tópico": cria filho do selecionado, com notas "> trecho — PDF, p. N", fonte, destaque, registro do PDF e UM desfazer', async () => {
    await click('#pdfFit'); await js(`document.querySelector('#pdfScroll').scrollTop = 0`); await wait(300); await waitText(1);
    const picked = await selectText('Emprega-se a crase antes de palavras femininas', 1); ok(picked.includes('Emprega-se'));
    await c.waitFor(() => js(`!!document.querySelector('#pdfMkTopic')`));
    const undo0 = await js('map._undo.length'); await click('#pdfMkTopic'); await c.waitFor(() => js(`!!__id('Emprega-se a crase antes de palavras femininas.')`));
    const n = N('Emprega-se a crase antes de palavras femininas.'); eq(await js(`map.find(selectedId).node.title`), 'Emprega-se a crase antes de palavras femininas.', 'o novo tópico ficou selecionado');
    eq(await js(`map.find(__id('Crase')).node.children.length`), 1, 'filho do tópico que estava selecionado');
    eq(await js(`${n}.notes`), '— Lei Teste ç, p. 1'); eq(await js(`${n}.refs.length`), 1); eq(await js(`${n}.refs[0].page`), 1); ok((await js(`${n}.refs[0].rects.length`)) >= 1, 'retângulos do destaque');
    eq(await js('map.meta.pdfs.length'), 1); eq(await js('map.meta.pdfs[0].name'), 'Lei Teste ç'); eq(await js('dirty'), true); eq(await js('map._undo.length'), undo0 + 1, 'uma única entrada de desfazer');
    ok((await txt('#pdfMsg')).includes('Tópico criado'), await txt('#pdfMsg')); eq(await js('getSelection().isCollapsed'), true);
    await c.waitFor(() => js(`document.querySelectorAll('.pdf-page[data-page="1"] .pdf-hl').length >= 1`)); ok(await js(`!!document.querySelector('#pdfChips .chip2')`), 'chip do tópico nesta página');
    await js('act.undo()'); await c.waitFor(() => js(`!__id('Emprega-se a crase antes de palavras femininas.')`)); eq(await js('(map.meta.pdfs || []).length'), 0, 'desfazer remove também o registro do PDF');
    await js('act.redo()'); await c.waitFor(() => js(`!!__id('Emprega-se a crase antes de palavras femininas.')`));
  });

  await t('"＋ Nota": acrescenta o trecho (citação em Markdown) às notas do tópico selecionado, sem criar tópico, e guarda a fonte', async () => {
    await js(`__md(__id('Legalidade')); true`); await wait(200); await click('#pdfNext'); await c.waitFor(() => js(`document.querySelector('#pdfPageNum').value === '2'`), 8000); await waitText(2);
    await selectText('O princípio da legalidade exige lei prévia', 2); await c.waitFor(() => js(`!!document.querySelector('#pdfMkNote')`));
    const kids0 = await js('map.root.children.length'); await click('#pdfMkNote'); await c.waitFor(() => js(`${N('Legalidade')}.notes.includes('legalidade')`));
    eq(await js(`${N('Legalidade')}.notes`), '> O princípio da legalidade exige lei prévia.\n> — Lei Teste ç, p. 2'); eq(await js('map.root.children.length'), kids0); eq(await js(`${N('Legalidade')}.refs[0].page`), 2);
    eq(await js('map.meta.pdfs.length'), 1, 'mesmo PDF: sem registro duplicado');
    await selectText('Ninguém será obrigado', 2); await c.waitFor(() => js(`!!document.querySelector('#pdfMkNote')`)); await click('#pdfMkNote'); await c.waitFor(() => js(`${N('Legalidade')}.refs.length === 2`));
    ok((await js(`${N('Legalidade')}.notes`)).includes('\n\n> Ninguém'), 'segunda citação separada por linha em branco');
  });

  await t('painel Notas lista as fontes; clicar leva o leitor à página; remover é desfazível; Ctrl+clique no destaque vai ao tópico', async () => {
    await js(`showPanel('notes'); __md(__id('Legalidade')); true`); await c.waitFor(() => js(`document.querySelectorAll('#refsList .ref-row').length === 2`));
    ok((await txt('#refsList')).includes('Lei Teste ç, p. 2')); ok((await txt('#refsList')).includes('“O princípio da legalidade exige lei prévia.”'));
    await js(`document.querySelector('#pdfScroll').scrollTop = 0`); await wait(200);
    await click('#refsList .ref-open'); await c.waitFor(() => js(`document.querySelector('#pdfPageNum').value === '2'`), 8000);
    await js(`__md(__id('Crase')); true`); await wait(200); await settle();
    // há cópias escondidas (largura 0) das páginas no DOM: o clique vai no destaque VISÍVEL do tópico Legalidade
    await js(`(() => { const hl = [...document.querySelectorAll('.pdf-page[data-page="2"] .pdf-hl[data-node="' + __id('Legalidade') + '"]')].find((h) => h.getBoundingClientRect().width > 0); const p = hl.closest('.pdf-page').getBoundingClientRect(), r = hl.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2; (document.elementFromPoint(cx, cy) || hl).dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true, clientX: cx, clientY: cy })); })()`);
    await wait(150); eq(await js('map.find(selectedId).node.title'), 'Legalidade', 'Ctrl+clique no destaque levou ao tópico');
    await js(`showPanel('notes'); true`); await c.waitFor(() => js(`document.querySelectorAll('#refsList .ref-row').length === 2`));
    await js(`document.querySelectorAll('#refsList .ref-del')[0].click()`); await c.waitFor(() => js(`document.querySelectorAll('#refsList .ref-row').length === 1`));
    await js('act.undo()'); await c.waitFor(() => js(`document.querySelectorAll('#refsList .ref-row').length === 2`));
  });

  await t('salvar e reabrir o .mom preserva PDFs e fontes; o leitor reabre o PDF vinculado na página certa', async () => {
    const f = path.join(TMP, 'direito.mom'); await js(`window.__dlg.save = ${JSON.stringify(f)}`); ok(await js('save(true)'));
    const back = readMom(fs.readFileSync(f)); eq(back.meta.pdfs.length, 1); let refs = 0; back.walk((n) => { refs += (n.refs || []).length; }); eq(refs, 3);
    await js('act.pdf()'); await c.waitFor(() => js(`document.querySelector('#pdfpane').hidden`));
    await js(`dirty = false; newMap(); openPath(${JSON.stringify(f)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(f)}`)); await js(`__md(__id('Legalidade')); showPanel('notes'); true`);
    await c.waitFor(() => js(`document.querySelectorAll('#refsList .ref-row').length === 2`));
    await click('#refsList .ref-open'); await c.waitFor(() => js(`document.querySelectorAll('.pdf-page').length === 3`), 15000); await c.waitFor(() => js(`document.querySelector('#pdfPageNum').value === '2'`), 8000);
  });

  await t('PDF movido/sumido: aviso claro e "Localizar o PDF…" reaponta o registro (1 desfazer), sem perder as fontes', async () => {
    const moved = path.join(TMP, 'movido', 'lei.pdf'); fs.mkdirSync(path.dirname(moved), { recursive: true }); fs.copyFileSync(pdfA, moved);
    await js('act.pdf()'); await c.waitFor(() => js(`document.querySelector('#pdfpane').hidden`));
    await js(`map.meta.pdfs[0].path = ${JSON.stringify(path.join(TMP, 'nao-existe.pdf'))}; true`);
    await js(`document.querySelectorAll('#refsList .ref-open')[0].click()`); await c.waitFor(() => js(`!!document.querySelector('#pdfErr')`), 8000);
    ok((await txt('#pdfErr')).includes('Arquivo não encontrado'), await txt('#pdfErr'));
    await js(`window.__dlg.pdf = ${JSON.stringify(moved)}; dirty = false; true`); await click('#pdfRelink');
    await c.waitFor(() => js(`document.querySelectorAll('.pdf-page').length === 3`), 15000); eq(await js('map.meta.pdfs[0].path'), moved); eq(await js('dirty'), true); eq(await js('map.meta.pdfs.length'), 1);
  });

  await t('arquivos ruins não derrubam o app: texto que não é PDF, PDF sem texto (só imagem/figura) e arquivo sumido', async () => {
    await js(`window.__dlg.pdf = ${JSON.stringify(bad)}; true`); await click('#pdfOpen'); await c.waitFor(() => js(`!!document.querySelector('#pdfErr')`), 10000);
    ok((await txt('#pdfErr')).includes('inválido') || (await txt('#pdfErr')).includes('Não consegui'), await txt('#pdfErr'));
    await js(`window.__dlg.pdf = ${JSON.stringify(blank)}; true`); await click('#pdfOpen'); await c.waitFor(() => js(`document.querySelectorAll('.pdf-page').length === 1`), 10000);
    await wait(500); eq(await js(`document.querySelectorAll('.pdf-page .textLayer span').length`), 0, 'sem texto selecionável'); eq(await js(`!!document.querySelector('#pdfErr')`), false);
    await js(`window.__dlg.pdf = ${JSON.stringify(path.join(TMP, 'nada.pdf'))}; true`); await click('#pdfOpen'); await c.waitFor(() => js(`/não encontrado/.test((document.querySelector('#pdfErr') || {}).textContent || '')`), 8000);
  });

  await t('PDF grande (60 páginas): só desenha as páginas perto da tela; busca atravessa todas; ir para a página 50 funciona', async () => {
    await js(`window.__dlg.pdf = ${JSON.stringify(pdfBig)}; true`); await click('#pdfOpen'); await c.waitFor(() => js(`document.querySelectorAll('.pdf-page').length === 60`), 15000); await waitText(1);
    const drawn = await js(`[...document.querySelectorAll('.pdf-page canvas')].filter((x) => x.width > 0).length`); ok(drawn > 0 && drawn < 20, 'páginas desenhadas: ' + drawn);
    await js(`(() => { const i = document.querySelector('#pdfPageNum'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, '50'); i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); })()`);
    await c.waitFor(() => js(`document.querySelector('#pdfPageNum').value === '50'`), 8000); await waitText(50);
    await js(`(() => { const f = document.querySelector('#pdfFind'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(f, 'zebra7'); f.dispatchEvent(new Event('input', { bubbles: true })); f.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); })()`);
    await c.waitFor(() => js(`document.querySelector('#pdfPageNum').value === '7'`), 10000);
  });

  await t('sem o leitor aberto o app é o de sempre; fechar o leitor libera tudo; arrastar o divisor muda a largura e é lembrada', async () => {
    await js('act.pdf()'); await c.waitFor(() => js(`document.querySelector('#pdfpane').hidden`));
    eq(await js(`document.querySelector('#pdfpane').textContent`), '', 'raiz React desmontada'); eq(await js(`document.body.classList.contains('pdf-open')`), false);
    await js(`window.__dlg.pdf = ${JSON.stringify(pdfA)}; act.pdf()`); await c.waitFor(() => js(`!!document.querySelector('#pdfOpen')`));
    const w0 = await js(`document.querySelector('#pdfpane').getBoundingClientRect().width`);
    // arrasto REAL do mouse (antes eram eventos sintéticos): o divisor agora usa Pointer Events e também aceita dedo e teclado (ver e2e-split.js)
    const sp = await js(`(() => { const r = document.querySelector('#pdfsplit').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 + 90 }; })()`), wcx = c.win.webContents, L = ['leftButtonDown'];
    wcx.sendInputEvent({ type: 'mouseMove', x: Math.round(sp.x), y: Math.round(sp.y) }); wcx.sendInputEvent({ type: 'mouseDown', x: Math.round(sp.x), y: Math.round(sp.y), button: 'left', clickCount: 1, modifiers: L });
    for (let k = 1; k <= 6; k++) { wcx.sendInputEvent({ type: 'mouseMove', x: Math.round(sp.x + 7 * k), y: Math.round(sp.y), button: 'left', modifiers: L }); await wait(20); }
    wcx.sendInputEvent({ type: 'mouseUp', x: Math.round(sp.x + 42), y: Math.round(sp.y), button: 'left', clickCount: 1 });
    await wait(200); const w1 = await js(`document.querySelector('#pdfpane').getBoundingClientRect().width`); ok(Math.abs(w1 - (w0 + 42)) < 4, `largura ${w0} → ${w1}`);
    eq(JSON.parse(fs.readFileSync(path.join(USERDATA, 'config.json'), 'utf8')).pdfWidth, Math.round(w1));
    await js('act.pdf()');
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
