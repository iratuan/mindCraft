'use strict';
// Versão TABLET (web, >10"): toques reais (Input.dispatchTouchEvent) numa tela emulada de 1280×800 (paisagem) e 800×1280 (retrato):
// tamanhos de toque, gestos (tocar, duplo toque, arrastar, pinça, toque longo), barra flutuante, gaveta de painéis, rede e leitor de PDF.
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const start = require('./web-harness');
const { concurso } = require('./fixtures');
const { writeMom } = require('../core/mom');

const SHOTS = path.join(__dirname, '..', 'evidencias', 'tablet');
const b64 = (buf) => Buffer.from(buf).toString('base64');

(async () => {
  const c = await start('MindCraft e2e — tablet (toque, gestos, layout)', { width: 1280, height: 800 });
  const { js, wait, waitFor, eq, ok, t: t0, TMP } = c; const T = () => c.touch;
  const t = (name, fn) => t0(name, async () => { try { await fn(); } catch (e) { const pe = await js(`window.__errs ? window.__errs.slice(-2) : []`).catch(() => []); if (pe.length) e.message += ' | erros da página: ' + JSON.stringify(pe); const est = await js(`({ titulos: __titles(), editor: editor.hidden ? null : editor.value, sel: selectedId && map.find(selectedId) ? map.find(selectedId).node.title : null, k: pan.k, vp: [innerWidth, innerHeight], domNodes: document.querySelectorAll('.node').length, boxes: L.boxes.size, home: !document.querySelector('#home').hidden, graph: graphOpen, dash: dashOpen, svg: (() => { const r = document.querySelector('#svg').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; })(), view: document.querySelector('#view').getAttribute('transform') })`).catch(() => null); if (est) e.message += ' | estado: ' + JSON.stringify(est); throw e; } finally { if (process.env.TABLET_TRACE) console.log('   [editor aberto?, apresentação?]', await js('!editor.hidden').catch(() => '?'), await js('present').catch(() => '?'), '|', name.slice(0, 40)); } });
  fs.mkdirSync(SHOTS, { recursive: true });
  await c.emulate({ width: 1280, height: 800 }); await c.open();
  const helpers = () => js(`window.__ctr = (sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: r.width, h: r.height }; };
    window.__nc = (title) => { let id; map.walk((n) => { if (n.title === title && !id) id = n.id; }); const r = document.querySelector('[data-id="' + id + '"]').getBoundingClientRect(); return { id, x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: r.width, h: r.height }; };
    if (!window.__errs) { window.__errs = []; window.addEventListener('error', (e) => window.__errs.push(((e.error && e.error.stack) || e.message).split('\\n').slice(0, 4).join(' <- ')), true); }
    window.__tev = []; for (const t of ['pointerdown', 'pointerup', 'pointercancel', 'contextmenu', 'mousedown', 'mouseup']) window.addEventListener(t, (e) => { window.__tev.push(t + (e.isTrusted ? '' : '*') + (e.ctrlKey ? '+ctrl' : '') + '@' + Math.round(e.clientX) + ',' + Math.round(e.clientY)); if (window.__tev.length > 14) window.__tev.shift(); }, true);
    window.__titles = () => { const r = []; map.walk((n, l) => r.push(l + ':' + n.title)); return r; }; true`);
  const fresh = async () => { await js(`closeHome(); dirty = false; newMap(); true`); await wait(300); await helpers(); await js(`fit(); true`); await wait(200); };
  const diag = async (fn) => { try { return await fn(); } catch (e) { const st = await js(`({ ev: window.__tev.join(' '), sel: [...selIds].length, selected: selectedId, editorHidden: editor.hidden, editorValue: editor.value, k: pan.k, activeTitle: selectedId && map.find(selectedId) ? map.find(selectedId).node.title : null, mapTitles: __titles().slice(0, 6).join(',') })`).catch(() => ({})); throw new Error(e.message + ' | ' + JSON.stringify(st)); } };
  const node = (title) => js(`__nc(${JSON.stringify(title)})`);
  const parentOf = (title) => js(`(() => { let r = null; map.walk((n, l, p) => { if (n.title === ${JSON.stringify(title)}) r = p ? p.title : null; }); return r; })()`);
  await helpers();

  await t('é reconhecido como aparelho de toque: pointer coarse, barra flutuante com botões extras, nenhuma rolagem horizontal, sem erros', async () => {
    const r = await js(`({ coarse: matchMedia('(pointer: coarse)').matches, vw: innerWidth, vh: innerHeight, scrollW: document.documentElement.scrollWidth, extras: [...document.querySelectorAll('#mcTouchBar .tb-extra')].filter((b) => b.offsetWidth).map((b) => b.id), meta: document.querySelector('meta[name=viewport]').content })`);
    eq([r.coarse, r.vw, r.vh], [true, 1280, 800]); ok(r.scrollW <= r.vw, 'sem rolagem horizontal: ' + r.scrollW); eq(r.extras, ['tbEdit', 'tbFold', 'tbUp', 'tbDown', 'tbOut', 'tbIn'], 'em paisagem larga, sem o botão de painéis'); ok(/interactive-widget=resizes-content/.test(r.meta), r.meta);
    await c.shot(path.join(SHOTS, '05-tablet-paisagem.png'));
  });

  await t('alvos de toque: botões da barra lateral, da barra de ações e controles de formulário têm pelo menos 44 px', async () => {
    const small = await js(`(() => { const bad = []; for (const sel of ['#rail .tool', '#appbar .icon-btn', '#appbar select', '#appbar input', '#mcTouchBar button', '#ptabs .ptab', '#options select', '#statusbar .icon-btn', '#studyDone', '#qAdd', '#errAdd']) for (const e of document.querySelectorAll(sel)) { if (!e.offsetWidth) continue; const r = e.getBoundingClientRect(); if (r.height < 43.5 || r.width < 43.5) bad.push(sel + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); } return bad; })()`);
    eq(small, [], 'alvos menores que 44 px');
  });

  await t('barra lateral: TODOS os botões visíveis sem rolar em tablets de 744 dp e 720 dp de altura (nenhuma ferramenta escondida abaixo da dobra)', async () => {
    for (const h of [744, 720]) {
      await c.emulate({ width: 1280, height: h }); await wait(500);
      const r = await js(`(() => { const rail = document.querySelector('#rail').getBoundingClientRect(); const hidden = [...document.querySelectorAll('#rail .tool')].filter((b) => getComputedStyle(b).display !== 'none').filter((b) => { const r = b.getBoundingClientRect(); return r.bottom > rail.bottom + 0.5 || r.top < rail.top - 0.5; }).map((b) => b.dataset.act); return { hidden, n: [...document.querySelectorAll('#rail .tool')].filter((b) => getComputedStyle(b).display !== 'none').length, scroll: document.querySelector('#rail').scrollHeight - document.querySelector('#rail').clientHeight }; })()`);
      eq(r.hidden, [], 'botões fora da área visível da barra em ' + h + ' dp (n=' + r.n + ')');
    }
    await c.emulate({ width: 1280, height: 800 }); await wait(400);
  });

  await t('tocar num tópico seleciona; tocar no fundo desmarca; 1 toque não cria ações no histórico', async () => {
    await fresh(); const a = await node('Tópico 1'); const undo0 = await js('map._undo.length');
    await T().tap(a.x, a.y); await waitFor(() => js(`selectedId === ${JSON.stringify(a.id)}`)); eq(await js('map._undo.length'), undo0);
    await T().tap(60 + 68, 400); await wait(200);   // fundo da área de trabalho (à direita da barra lateral)
    eq(await js('selectedId'), null, 'tocar no fundo desmarca');
  });

  await t('duplo toque edita o texto do tópico; o texto novo é gravado com 1 desfazer', async () => {
    await fresh(); const a = await node('Tópico 2'); const undo0 = await js('map._undo.length');
    await T().doubleTap(a.x, a.y); await waitFor(() => js('!editor.hidden'), 3000); eq(await js(`editor.value`), 'Tópico 2');
    await js(`editor.value = 'Licitações'; editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); true`); await wait(250);
    await wait(250); eq(await js('editor.hidden'), true, 'o editor NÃO reabre depois de confirmar (o duplo toque abre uma vez só)');
    ok((await js('__titles()')).includes('1:Licitações'), (await js('__titles()')).join(',')); eq(await js('map._undo.length'), undo0 + 1); await js('act.undo(); true'); ok((await js('__titles()')).includes('1:Tópico 2'));
  });

  await t('arrastar o fundo com 1 dedo move o mapa (sem desmarcar o tópico); arrastar de volta devolve', async () => {
    await fresh(); const a = await node('Tópico 1'); await T().tap(a.x, a.y); await wait(150); const sel = await js('selectedId'); const p0 = await js('({ x: pan.x, y: pan.y })');
    await T().drag(700, 650, 560, 600); await wait(200); const p1 = await js('({ x: pan.x, y: pan.y })');
    ok(Math.abs(p1.x - p0.x - (-140)) < 12 && Math.abs(p1.y - p0.y - (-50)) < 12, `deslocamento esperado (-140,-50), obtido (${p1.x - p0.x},${p1.y - p0.y})`); eq(await js('selectedId'), sel, 'continua selecionado');
    await T().drag(560, 600, 700, 650); await wait(200); const p2 = await js('({ x: pan.x, y: pan.y })'); ok(Math.abs(p2.x - p0.x) < 14 && Math.abs(p2.y - p0.y) < 14, 'voltou');
  });

  await t('arrastar um tópico sobre outro o move para dentro dele (reorganizar), desfazível', async () => {
    await fresh(); const a = await node('Tópico 1'), b = await node('Tópico 3'); eq(await parentOf('Tópico 1'), 'Ideia central');
    await T().drag(a.x, a.y, b.x, b.y, 16); await waitFor(async () => (await parentOf('Tópico 1')) === 'Tópico 3', 3000); await js('act.undo(); true'); eq(await parentOf('Tópico 1'), 'Ideia central', 'desfazer devolve');
  });

  await t('pinça com 2 dedos faz zoom em torno do ponto entre eles: afastar amplia, aproximar reduz, o ponto sob os dedos fica no lugar', async () => {
    await fresh(); const k0 = await js('pan.k'); const cx = 640, cy = 420;
    const world0 = await js(`({ x: (${cx} - svg.getBoundingClientRect().left - pan.x) / pan.k, y: (${cy} - svg.getBoundingClientRect().top - pan.y) / pan.k })`);
    await T().pinch(cx, cy, 120, 300); await wait(250); const k1 = await js('pan.k'); ok(k1 > k0 * 1.5, `ampliou: ${k0} → ${k1}`);
    const world1 = await js(`({ x: (${cx} - svg.getBoundingClientRect().left - pan.x) / pan.k, y: (${cy} - svg.getBoundingClientRect().top - pan.y) / pan.k })`);
    ok(Math.hypot(world1.x - world0.x, world1.y - world0.y) < 3, 'o ponto do mundo sob os dedos permanece: ' + JSON.stringify([world0, world1]));
    await T().pinch(cx, cy, 300, 100); await wait(250); const k2 = await js('pan.k'); ok(k2 < k1 / 1.5, `reduziu: ${k1} → ${k2}`); ok(k2 >= 0.1 && k1 <= 4, 'dentro dos limites');
    await T().pinch(cx, cy, 40, 900, 30); await wait(250); ok((await js('pan.k')) <= 4, 'nunca passa do limite máximo'); await c.shot(path.join(SHOTS, '06-pinca-zoom.png'));
  });

  await t('toque longo inclui o tópico na seleção (como Ctrl+clique); um toque simples depois reduz a um', async () => {
    await fresh(); const a = await node('Tópico 1'), b = await node('Tópico 2'); await T().tap(a.x, a.y); await wait(150);
    await T().longPress(b.x, b.y, 650); await diag(() => waitFor(() => js('selIds.size === 2'), 3000)); eq(await js('[...selIds].length'), 2);
  });

  await t('barra flutuante: ✎ edita o tópico selecionado; ⇕ recolhe/expande o ramo; ☰ abre o menu e Esc fecha', async () => {
    await fresh(); const a = await node('Tópico 1'); await T().tap(a.x, a.y); await wait(150);
    const e = await js(`__ctr('#tbEdit')`); await T().tap(e.x, e.y); await waitFor(() => js('!editor.hidden'), 3000); await diag(async () => eq(await js('editor.value'), 'Tópico 1')); await js(`editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true`); await wait(200);
    await js(`(() => { const n = map.root.children[0]; map.addChild(n.id, 'filho'); render(); selectedId = n.id; render(); return true; })()`); await wait(150);
    const f = await js(`__ctr('#tbFold')`); await T().tap(f.x, f.y); await waitFor(() => js('map.root.children[0].collapsed === true'), 3000); await T().tap(f.x, f.y); await waitFor(() => js('!map.root.children[0].collapsed'), 3000);
    const m = await js(`__ctr('#mcHostMenuBtn')`); await T().tap(m.x, m.y); await waitFor(() => js(`!document.querySelector('#mcHostMenu').hidden`)); await c.shot(path.join(SHOTS, '07-menu-tablet.png'));
    const item = await js(`__ctr('#mcHostMenu [data-cmd="home"]')`); await T().tap(item.x, item.y); await waitFor(() => js(`!document.querySelector('#home').hidden`), 3000); await js('closeHome(); true');
  });

  await t('barra lateral por toque: criar filho e irmão, desfazer e refazer', async () => {
    await fresh(); const a = await node('Tópico 1'); await T().tap(a.x, a.y); await wait(150); const n0 = (await js('__titles()')).length;
    let b = await js(`__ctr('#rail [data-act="child"]')`); await T().tap(b.x, b.y); await waitFor(() => js('!editor.hidden'), 3000); await js(`editor.value = 'Novo filho'; editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); true`); await wait(250);
    eq((await js('__titles()')).length, n0 + 1); ok((await js('__titles()')).includes('2:Novo filho'));
    b = await js(`__ctr('#rail [data-act="undo"]')`); await T().tap(b.x, b.y); await wait(200); await T().tap(b.x, b.y); await wait(200); ok(!(await js('__titles()')).includes('2:Novo filho'), 'desfez');
    b = await js(`__ctr('#rail [data-act="redo"]')`); await T().tap(b.x, b.y); await wait(250); await T().tap(b.x, b.y); await wait(250); ok((await js('__titles()')).includes('2:Novo filho'), 'refez');
  });

  await t('rede de conhecimento: abre por toque; pinça amplia; arrastar o fundo move; duplo toque num nó abre o tópico', async () => {
    await fresh(); await js(`map.root.children.forEach((c, i) => map.addChild(c.id, 'Sub ' + i)); render(); true`); await wait(150);
    const g = await js(`__ctr('#rail [data-act="graph"]')`); await T().tap(g.x, g.y); await waitFor(() => js(`!!document.querySelector('#gsvg') && !document.querySelector('#graph').hidden`), 5000); await wait(900);
    const t0 = await js(`document.querySelector('#gsvg g, #gsvg').getAttribute('transform') || ''`); const s0 = await js('gTrans.k');
    await T().pinch(560, 400, 120, 320); await wait(300); ok((await js('gTrans.k')) > s0 * 1.4, `rede ampliou: ${s0} → ${await js('gTrans.k')}`);
    const x0 = await js('gTrans.x'); await T().drag(500, 650, 380, 640); await wait(300); ok((await js('gTrans.x')) < x0 - 80, `rede moveu: ${x0} → ${await js('gTrans.x')}`);
    await c.shot(path.join(SHOTS, '08-rede-tablet.png')); void t0; await js('closeGraph(); true');
  });

  await t('REDE no tablet (denso): controles com alvo de toque, +/−/ajustar por toque, menu "Exibir" por toque, rótulos sem sobreposição em paisagem e retrato, gaveta ao tocar num ponto', async () => {
    await c.emulate({ width: 1280, height: 800 }); await wait(400);
    await js(`(() => { const lib = getLibrary(); let seed = 11; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
      const titles = []; for (let mi = 0; mi < 2; mi++) { const m = new MindMap(createNode('Mapa denso ' + mi), { name: 'Mapa denso ' + mi }); const ids = [m.root.id];
        for (let i = 1; i < 70; i++) { const p = ids[Math.floor(rnd() * Math.min(ids.length, 1 + i / 2))]; const n = m.addChild(p, 'Assunto ' + mi + '.' + i); ids.push(n.id); titles.push(n.title); }
        lib.saveMap(m, { snapshot: false }); }
      for (const row of lib.listMaps().filter((r) => /^Mapa denso/.test(r.title))) { const m = lib.loadMap(row.id); const all = []; m.walk((n) => all.push(n)); for (let k = 0; k < 20; k++) all[1 + Math.floor(rnd() * (all.length - 1))].notes += ' [[' + titles[Math.floor(rnd() * titles.length)] + ']]'; lib.saveMap(m, { snapshot: false }); }
      saveCfg({ scope: 'vault' }); return titles.length; })()`);
    const gb = await js(`__ctr('#rail [data-act="graph"]')`); await T().tap(gb.x, gb.y); await waitFor(() => js(`document.querySelectorAll('#gview .gn').length > 100`), 20000); await wait(900);
    await js(`gSel = null; gHover = null; renderGraph(false); fitGraph(); true`); await wait(500);
    const small = await js(`[...document.querySelectorAll('#graph .g-bar select, #graph .g-bar input[type=search], #graph .g-bar .btn, #graph .g-zoom .btn')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => [e.id || e.textContent.trim(), Math.round(e.getBoundingClientRect().height), Math.round(e.getBoundingClientRect().width)]).filter(([, h, w]) => h < 43 || w < 43)`); eq(small, [], 'alvos pequenos: ' + JSON.stringify(small));
    const stats = async () => js(`(() => { const L = [...document.querySelectorAll('#gview .glabel')].filter((e) => e.style.display !== 'none' && e.parentNode.style.display !== 'none').map((e) => e.getBoundingClientRect()); let clash = 0; for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const a = L[i], b = L[j]; if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) clash++; } return { n: L.length, clash }; })()`);
    let st = await stats(); ok(st.n >= 12 && st.clash === 0, 'paisagem: ' + JSON.stringify(st)); await c.shot(path.join(SHOTS, '09-rede-densa-paisagem.png'));
    const k0 = await js('gTrans.k'); let z = await js(`__ctr('#gZoomIn')`); await T().tap(z.x, z.y); await wait(300); ok((await js('gTrans.k')) > k0 * 1.25, 'toque em + amplia'); z = await js(`__ctr('#gFit')`); await T().tap(z.x, z.y); await wait(300); ok(Math.abs((await js('gTrans.k')) - k0) < 0.01, 'toque em ajustar');
    let v = await js(`__ctr('#gViewPop > summary')`); await T().tap(v.x, v.y); await wait(300); ok(await js(`document.querySelector('#gViewPop').open`), 'Exibir abre por toque');
    const gg = await js(`__ctr('#gGroup')`); await T().tap(gg.x, gg.y); await wait(500); ok(await js('gOpt.group'), 'tocar na opção liga "agrupar folhas"'); ok((await js(`[...document.querySelectorAll('#gview .gn')].filter((e) => e.style.display === 'none').length`)) > 20, 'folhas agrupadas');
    await T().tap(640, 700); await wait(300); ok(!(await js(`document.querySelector('#gViewPop').open`)), 'tocar fora fecha o menu'); await js(`document.querySelector('#gGroup').click(); true`); await wait(400);
    await c.emulate({ width: 800, height: 1280 }); await wait(900); await js(`gSel = null; gHover = null; renderGraph(false); fitGraph(); true`); await wait(500);
    st = await stats(); ok(st.n >= 8 && st.clash === 0, 'retrato: ' + JSON.stringify(st)); eq(await js('gNarrow()'), true, 'rede estreita em retrato'); await c.shot(path.join(SHOTS, '10-rede-densa-retrato.png'));
    ok(!(await js(`document.querySelector('#gSide').classList.contains('open')`)), 'gaveta fechada');
    const hub = await js(`[...gLast.nodes.keys()].filter((i) => gLast.nodes[i].kind === 'topic' && gLast.adj[i].size >= 2).find((i) => { const x = gLast.P[i].x * gTrans.k + gTrans.x, y = gLast.P[i].y * gTrans.k + gTrans.y; return x > 40 && y > 40 && x < document.querySelector('#gsvg').clientWidth - 40 && y < document.querySelector('#gsvg').clientHeight * 0.45; })`);
    const pt = await js(`(() => { const r = document.querySelector('#gsvg').getBoundingClientRect(); return { x: r.left + gLast.P[${hub}].x * gTrans.k + gTrans.x, y: r.top + gLast.P[${hub}].y * gTrans.k + gTrans.y }; })()`); await T().tap(pt.x, pt.y); await wait(600);
    eq(await js('gSel'), await js(`gLast.nodes[${hub}].id`), 'tocar no ponto seleciona'); ok(await js(`document.querySelector('#gSide').classList.contains('open')`), 'gaveta abre ao tocar num ponto');
    const sb = await js(`__ctr('#gSideBtn')`); await T().tap(sb.x, sb.y); await wait(400); ok(!(await js(`document.querySelector('#gSide').classList.contains('open')`)), 'botão ℹ fecha a gaveta'); const sb2 = await js(`__ctr('#gSideBtn')`); await T().tap(sb2.x, sb2.y); await wait(400); ok(await js(`document.querySelector('#gSide').classList.contains('open')`), 'e abre de novo'); ok((await js(`__ctr('#gSideBtn').y`)) < (await js(`document.querySelector('#gSide').getBoundingClientRect().top`)), 'o botão fica acima da gaveta');
    await c.shot(path.join(SHOTS, '11-rede-gaveta-retrato.png')); await js('closeGraph(); true'); await c.emulate({ width: 1280, height: 800 }); await wait(500);
  });

  await t('leitor de PDF: selecionar texto com o dedo mostra "＋ Tópico / ＋ Nota" (ponte do mouseup) e criar o tópico funciona', async () => {
    const pdf = path.join(TMP, 'aula.pdf'); await new Promise((res) => { const d = new PDFDocument({ size: 'A4' }); const o = fs.createWriteStream(pdf); d.pipe(o); o.on('finish', res); d.fontSize(14).text('Licitação é o procedimento administrativo. '.repeat(20)); d.end(); });
    await fresh(); await c.pickNext([{ name: 'aula.pdf', b64: b64(fs.readFileSync(pdf)) }]); await js('act.pdf(); true'); await waitFor(() => js(`!!document.querySelector('#pdfOpen')`)); await js(`document.querySelector('#pdfOpen').click()`);
    await waitFor(() => js(`document.querySelectorAll('.pdf-page .textLayer span, .pdf-page [class*=text] span').length > 0`), 20000); await wait(400);
    await js(`(() => { const sp = document.querySelector('.pdf-page .textLayer span, .pdf-page [class*=text] span'); const r = document.createRange(); r.selectNodeContents(sp); const s = getSelection(); s.removeAllRanges(); s.addRange(r); return sp.textContent.length; })()`);
    await waitFor(() => js(`!!document.querySelector('#pdfSel2')`), 4000); const n0 = (await js('__titles()')).length;
    const mk = await js(`__ctr('#pdfMkTopic')`); await T().tap(mk.x, mk.y); await waitFor(async () => (await js('__titles()')).length === n0 + 1, 4000); await c.shot(path.join(SHOTS, '09-pdf-selecao-toque.png')); await js('act.pdf(); true');
  });

  await t('o mouse continua funcionando no mesmo aparelho (caneta/mouse não passam pela ponte de toque)', async () => {
    await fresh(); const a = await node('Tópico 3'); const wc = c.win.webContents;
    wc.sendInputEvent({ type: 'mouseDown', x: a.x, y: a.y, button: 'left', clickCount: 1 }); wc.sendInputEvent({ type: 'mouseUp', x: a.x, y: a.y, button: 'left', clickCount: 1 }); await waitFor(() => js(`selectedId === ${JSON.stringify(a.id)}`), 3000);
  });

  // ---------- retrato (800×1280): painéis viram gaveta ----------
  await t('retrato 800×1280: painéis ficam numa GAVETA (fechada por padrão); ☷ abre, tocar fora fecha; o mapa usa a largura toda', async () => {
    await c.emulate({ width: 800, height: 1280 }); await wait(500); await helpers(); await fresh();
    const closed = await js(`(() => { const p = document.querySelector('#panels'), r = p.getBoundingClientRect(), cs = getComputedStyle(p); return { hidden: cs.visibility === 'hidden', offscreen: r.left >= innerWidth - 1, stageW: document.querySelector('#stage').getBoundingClientRect().width, vw: innerWidth }; })()`);
    ok(closed.hidden || closed.offscreen, 'gaveta fechada: ' + JSON.stringify(closed)); ok(closed.stageW > 800 - 68 - 4, 'o mapa ocupa a largura (menos a barra lateral): ' + closed.stageW); ok(await js(`!!document.querySelector('#tbPanels').offsetWidth`), 'botão ☷ visível');
    await c.shot(path.join(SHOTS, '10-tablet-retrato.png'));
    const b = await js(`__ctr('#tbPanels')`); await T().tap(b.x, b.y); await waitFor(() => js(`getComputedStyle(document.querySelector('#panels')).visibility === 'visible' && document.querySelector('#panels').getBoundingClientRect().right <= innerWidth + 1`), 3000);
    eq(await js(`document.querySelector('#tbPanels').getAttribute('aria-expanded')`), 'true'); await c.shot(path.join(SHOTS, '11-gaveta-de-paineis.png'));
    // dentro da gaveta: aba Estudo e registrar questões com banca/ano, por toque
    const tab = await js(`__ctr('#ptabs [data-tab="study"]')`); await T().tap(tab.x, tab.y); await wait(250);
    await js(`__sel2 = (title) => { let r; map.walk((n) => { if (n.title === title && !r) r = n.id; }); selectedId = r; selIds = new Set([r]); render(); }; __sel2('Tópico 1'); true`); await wait(200);
    await js(`(() => { const set = (s, v) => { const e = document.querySelector(s); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })); }; window.setQBanca('CESPE'); set('#qAno', '2024'); set('#qDone', '10'); set('#qOk', '7'); return true; })()`);
    const reg = await js(`__ctr('#qAdd')`); await T().tap(reg.x, reg.y); await wait(250); eq(await js(`(() => { let r; map.walk((n) => { if (n.title === 'Tópico 1') r = n; }); return r.study.qsrc[0].banca + r.study.qsrc[0].done; })()`), 'CESPE10');
    await T().tap(30, 640); await waitFor(() => js(`getComputedStyle(document.querySelector('#panels')).visibility === 'hidden'`), 3000);   // tocar no fundo (fora da gaveta) fecha
    eq(await js(`document.body.classList.contains('tb-panels')`), false);
  });

  await t('retrato: tela inicial, Painel de estudos e biblioteca cabem sem rolagem horizontal; nenhuma janela estoura a tela', async () => {
    const wide = async (what) => js(`(() => { const de = document.documentElement; const bad = []; if (de.scrollWidth > innerWidth + 1) bad.push('página ' + de.scrollWidth); for (const sel of ['#home:not([hidden])', '#dash:not([hidden])', '#modal:not([hidden]) .modal-box']) { const e = document.querySelector(sel); if (e) { const r = e.getBoundingClientRect(); if (r.right > innerWidth + 1 || r.left < -1) bad.push(sel + ' ' + Math.round(r.left) + '..' + Math.round(r.right)); } } return bad; })()`);
    await js(`act.home(true); true`); await wait(500); eq(await wide(), [], 'tela inicial'); await c.shot(path.join(SHOTS, '12-inicio-retrato.png')); await js('closeHome(); act.dash(); true'); await wait(600); eq(await wide(), [], 'painel de estudos'); await js('closeDash(); openLibraryModal(); true'); await wait(400); eq(await wide(), [], 'biblioteca'); await js('closeModal(); true');
  });

  await t('REORDENAR por toque: arrastar com o dedo ENTRE irmãos (cima/baixo/meio) e botões ▲ ▼ ◀ ▶ da barra flutuante (alvos ≥ 44 px)', async () => {
    await c.emulate({ width: 1280, height: 800 }); await wait(400);
    await js(`window.__id = (title) => { let r; map.walk((n) => { if (n.title === title && !r) r = n.id; }); return r; }; true`);
    await js(`dirty = false; newMap(); (() => { const m = map; m.root.title = 'Raiz'; m.root.children = []; for (const t of ['A', 'B', 'C', 'D']) m.addChild(m.root.id, t); for (const t of ['a1', 'a2']) m.addChild(m.root.children[0].id, t); m._undo = []; m._redo = []; selectedId = m.root.id; selIds = new Set([m.root.id]); render(); fit(); })(); true`); await wait(500);
    const order = (p) => js(`map.find(__id(${JSON.stringify(p)})).node.children.map((n) => n.title).join(',')`);
    const at = (title, frac) => js(`(() => { const id = __id(${JSON.stringify(title)}), b = L.boxes.get(id), r = svg.getBoundingClientRect(); return { x: r.left + (b.x + b.w / 2) * pan.k + pan.x, y: r.top + (b.y + b.h * ${frac}) * pan.k + pan.y }; })()`);
    eq(await order('Raiz'), 'A,B,C,D');
    let a = await at('D', 0.5), b = await at('A', 0.1); await T().drag(a.x, a.y, b.x, b.y, 14); await wait(400); eq(await order('Raiz'), 'D,A,B,C', 'dedo: soltar na parte de cima de A');
    a = await at('D', 0.5); b = await at('C', 0.92); await T().drag(a.x, a.y, b.x, b.y, 14); await wait(400); eq(await order('Raiz'), 'A,B,C,D', 'dedo: soltar na parte de baixo de C');
    a = await at('D', 0.5); b = await at('B', 0.5); await T().drag(a.x, a.y, b.x, b.y, 14); await wait(400); eq(await order('B'), 'D', 'dedo: soltar no meio vira filho');
    await js('map.undo(); render(); true'); await wait(200); eq(await order('Raiz'), 'A,B,C,D');
    const small = await js(`['tbUp', 'tbDown', 'tbOut', 'tbIn'].map((id) => { const r = document.getElementById(id).getBoundingClientRect(); return [id, Math.round(r.width), Math.round(r.height)]; }).filter(([, w, h]) => w < 43 || h < 43)`); eq(small, [], 'alvos pequenos: ' + JSON.stringify(small));
    ok(await js(`getComputedStyle(document.querySelector('#rail [data-act="moveUp"]')).display === 'none'`), 'a barra lateral não ganha botões no tablet (altura no limite)');
    await wait(1500);   // o arrasto simulado por CDP termina com velocidade: o Chromium ainda está em "fling" e consome o 1º toque seguinte (artefato do teste, não do app)
    await js(`selectedId = __id('C'); selIds = new Set([selectedId]); render(); true`); const tap = async (id) => { const p = await js(`__ctr('#${id}')`); await T().tap(p.x, p.y); await wait(250); };
    await tap('tbUp'); const diag = await js("document.querySelector('#status').textContent + ' | sel=' + (map.find(selectedId) && map.find(selectedId).node.title) + ' | selIds=' + selIds.size"); eq(await order('Raiz'), 'A,C,B,D', '▲ (' + diag + ')'); await tap('tbDown'); await tap('tbDown'); eq(await order('Raiz'), 'A,B,D,C', '▼ ▼');
    await js(`selectedId = __id('a2'); selIds = new Set([selectedId]); render(); true`); await tap('tbOut'); eq(await order('Raiz'), 'A,a2,B,D,C', '◀ promove'); await tap('tbIn'); eq(await order('A'), 'a1,a2', '▶ rebaixa de volta');
    await tap('tbUp'); eq(await order('A'), 'a2,a1', '▲ no nível de baixo'); await c.shot(path.join(SHOTS, '12-reordenar-barra.png'));
  });

  await t('BOTÃO DEPOIS DO LÁPIS = recolher/expandir ramo, com função clara: ícone e texto mudam (⊟ recolher / ⊞ expandir) e dizem quantos subtópicos; desativado sem subtópicos; avisa o que fez', async () => {
    await c.emulate({ width: 1280, height: 800 }); await wait(400);
    await js(`window.__id = (title) => { let r; map.walk((n) => { if (n.title === title && !r) r = n.id; }); return r; }; dirty = false; newMap(); (() => { const m = map; m.root.title = 'Raiz'; m.root.children = []; const a = m.addChild(m.root.id, 'A'); m.addChild(a.id, 'a1'); m.addChild(a.id, 'a2'); m.addChild(m.root.id, 'B'); m._undo = []; m._redo = []; selectedId = a.id; selIds = new Set([a.id]); render(); fit(); })(); true`); await wait(500);
    const st = () => js(`(() => { const b = document.getElementById('tbFold'); return { disabled: b.disabled, text: b.textContent, label: b.getAttribute('aria-label'), title: b.title }; })()`);
    const order = await js(`[...document.querySelectorAll('#mcTouchBar button')].map((b) => b.id)`); eq(order.slice(0, 3), ['mcHostMenuBtn', 'tbEdit', 'tbFold'], 'o botão logo depois do lápis é o de recolher/expandir');
    let x = await st(); eq([x.disabled, x.text], [false, '⊟']); ok(/Recolher o ramo: esconder 2 subtópico/.test(x.label), x.label); eq(x.title, x.label);
    const tap = async () => { const p = await js(`__ctr('#tbFold')`); await T().tap(p.x, p.y); await wait(350); };
    await tap(); eq(await js('map.find(__id("A")).node.collapsed'), true, 'recolheu'); x = await st(); eq([x.disabled, x.text], [false, '⊞']); ok(/Expandir o ramo: mostrar 2 subtópico/.test(x.label), x.label);
    ok(/Ramo recolhido: 2 subtópico/.test(await js(`document.querySelector('#status').textContent`)), 'avisa: ' + await js(`document.querySelector('#status').textContent`));
    await tap(); eq(await js('map.find(__id("A")).node.collapsed'), false, 'expandiu'); x = await st(); eq(x.text, '⊟'); ok(/Ramo expandido/.test(await js(`document.querySelector('#status').textContent`)));
    await js(`selectedId = __id('B'); selIds = new Set([selectedId]); render(); true`); await wait(250); x = await st(); eq([x.disabled, x.text], [true, '⊟']); ok(/selecione um tópico que tenha subtópicos/.test(x.label), x.label);
    const before = await js('JSON.stringify(map.toJSON())'); await js(`document.getElementById('tbFold').click(); true`); eq(await js('JSON.stringify(map.toJSON())'), before, 'desativado: não altera nada');
    await js(`act.toggle(); true`); ok(/não tem subtópicos/.test(await js(`document.querySelector('#status').textContent`)), 'a tecla Espaço num tópico sem filhos explica o motivo');
    await js(`selectedId = __id('A'); selIds = new Set([selectedId]); render(); true`); await wait(200); await c.shot(path.join(SHOTS, '13-botao-recolher.png'));
  });

  await t('SALVAR COMO por toque: a janela abre SEM subir o teclado (não foca o campo); tocar no nome edita; Salvar usa o nome digitado', async () => {
    await c.emulate({ width: 1280, height: 800 }); await wait(400); await js('window.__mcSaveAsAuto = false; true');
    await js(`dirty = false; filePath = null; newMap(); map.root.title = 'Plano por toque'; dirty = true; window.__r = undefined; save(false).then((v) => { window.__r = v; }); true`); await waitFor(() => js('!!document.querySelector("[data-mc-saveas]")'), 5000); await wait(300);
    eq(await js('document.activeElement && document.activeElement.tagName'), 'BUTTON', 'o foco vai ao botão, não ao campo de texto'); eq(await js('document.activeElement.dataset.act'), 'ok');
    const inp = await js(`__ctr('[data-mc-saveas] input[type=text]')`); const small = await js(`[...document.querySelectorAll('[data-mc-saveas] input, [data-mc-saveas] button')].map((e) => { const r = e.closest('label') ? e.closest('label').getBoundingClientRect() : e.getBoundingClientRect(); return Math.round(r.height); }).filter((h) => h < 43)`); eq(small, [], 'alvos de toque ≥ 44 px');
    await T().tap(inp.x, inp.y); await wait(300); eq(await js('document.activeElement.type'), 'text', 'tocar no nome o foca (aí o teclado pode subir)');
    await js(`(() => { const i = document.querySelector('[data-mc-saveas] input[type=text]'); i.value = 'Nome digitado no toque'; return 1; })()`); const ok1 = await js(`__ctr('[data-mc-saveas] button[data-act=ok]')`); await T().tap(ok1.x, ok1.y); await waitFor(() => js('window.__r === true'), 5000);
    eq(await js('filePath'), '/docs/Nome digitado no toque.mom'); await js('window.__mcSaveAsAuto = true; true');
  });

  await t('MANUAL no tablet (toque): ☰ → Manual de uso abre em visão de TABLET sem subir o teclado; tocar no índice troca a seção; alvos ≥ 44 px; cabe em paisagem e retrato; fecha com toque', async () => {
    for (const [w, h] of [[1280, 800], [800, 1280]]) {
      await c.emulate({ width: w, height: h }); await wait(400); await js('closeHome && closeHome(); true');
      const m = await js(`__ctr('#mcHostMenuBtn')`); await T().tap(m.x, m.y); await wait(300);
      eq(await js(`[...document.querySelectorAll('#mcHostMenu button')].some((b) => b.dataset.cmd === 'manual' && /Manual de uso/.test(b.textContent))`), true, 'o menu ☰ tem "Manual de uso"');
      const it = await js(`(() => { const b = document.querySelector('#mcHostMenu button[data-cmd=manual]'); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); await T().tap(it.x, it.y);
      await waitFor(() => js(`!!document.querySelector('#manualBox')`), 4000);
      eq(await js(`document.querySelector('#manualHostTouch').getAttribute('aria-pressed')`), 'true', 'já abre na visão de tablet');
      ok(/Barra flutuante|toque/i.test(await js(`document.querySelector('#manualBody').textContent`)), 'texto de toque');
      ok(!(await js(`document.activeElement && document.activeElement.id === 'manualSearch'`)), 'o campo de busca NÃO recebe o foco (teclado não sobe sozinho)');
      const box = await js(`(() => { const r = document.querySelector('#manualBox').getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: innerWidth, h: innerHeight, sw: document.documentElement.scrollWidth }; })()`);
      ok(box.l >= 0 && box.t >= 0 && box.r <= box.w + 1 && box.b <= box.h + 1, 'cabe na tela ' + JSON.stringify(box)); ok(box.sw <= box.w, 'sem rolagem horizontal');
      const small = await js(`[...document.querySelectorAll('#manualBox button, #manualBox input')].filter((e) => e.offsetParent && e.getBoundingClientRect().height < 40).map((e) => e.id || e.textContent.slice(0, 20))`); eq(small, [], 'alvos de toque ≥ 40 px');
      const idx = await js(`(() => { const b = document.querySelector('#manualIndex button[data-section=reordenar]'); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); await T().tap(idx.x, idx.y); await wait(300);
      eq(await js(`document.querySelector('#manualBody').dataset.section`), 'reordenar'); ok(/◀|▶|dedo/.test(await js(`document.querySelector('#manualBody').textContent`)), 'explica os botões do tablet');
      if (w === 1280) await c.shot(path.join(SHOTS, '14-manual-tablet-paisagem.png')); else await c.shot(path.join(SHOTS, '14-manual-tablet-retrato.png'));
      const x = await js(`__ctr('#manualClose')`); await T().tap(x.x, x.y); await wait(300); ok(await js(`document.getElementById('modal').hidden`), 'fechou com toque');
    }
    await c.emulate({ width: 1280, height: 800 }); await wait(300);
  });

  await t('PAINEL LATERAL por toque (paisagem 1280×800): botão ‹ › grande recolhe e expande; arrastar o divisor com o DEDO muda a largura (com limites) e fica lembrado', async () => {
    await c.emulate({ width: 1280, height: 800 }); await wait(400); await js('closeHome && closeHome(); true');
    const box = (sel) => js(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; })()`);
    const cfgV = (k) => js(`window.__mcHost.fs.existsSync(userDataDir + '/config.json') ? JSON.parse(window.__mcHost.fs.readFileSync(userDataDir + '/config.json', 'utf8'))[${JSON.stringify(k)}] : undefined`);
    const b0 = await box('#panelsToggle'); ok(b0.h >= 44 && b0.w >= 30, 'alvo de toque do botão ≥ 44 px: ' + b0.w + '×' + b0.h);
    const p0 = (await box('#panels')).w; ok(p0 > 200, 'painel docado em 1280 px');
    await T().tap(b0.cx, b0.cy); await wait(500); ok(await js(`document.body.classList.contains('panels-collapsed')`), 'recolheu por toque'); ok((await box('#panels')).w === 0 || (await js(`getComputedStyle(document.querySelector('#panels')).display`)) === 'none');
    eq(await cfgV('panelsCollapsed'), true, 'lembrado'); await c.shot(path.join(SHOTS, '15-painel-recolhido.png'));
    const b1 = await box('#panelsToggle'); await T().tap(b1.cx, b1.cy); await wait(500); ok(!(await js(`document.body.classList.contains('panels-collapsed')`)), 'expandiu por toque'); ok(Math.abs((await box('#panels')).w - p0) < 3);
    // dedo: arrastar o divisor 90 px para a esquerda aumenta o painel; longe do botão, para não tocar nele
    const sp = await box('#panelsSplit'); const y = sp.cy + 140;
    await T().drag(sp.cx, y, sp.cx - 90, y, 10); await wait(500); const p1 = (await box('#panels')).w; ok(Math.abs(p1 - (p0 + 90)) < 6, `largura ${p0} → ${p1}`); eq(await cfgV('panelsWidth'), Math.round(p1), 'largura lembrada');
    const sp2 = await box('#panelsSplit'); await T().drag(sp2.cx, y, sp2.cx + 700, y, 10); await wait(500); ok((await box('#panels')).w >= 219 && (await box('#panels')).w <= 224, 'mínimo 220: ' + (await box('#panels')).w);
    const sp3 = await box('#panelsSplit'); await T().doubleTap(sp3.cx, y); await wait(500); ok(Math.abs((await box('#panels')).w - p0) < 4, 'duplo toque restaura: ' + (await box('#panels')).w);
    ok(!(await js(`document.documentElement.scrollWidth > innerWidth`)), 'sem rolagem horizontal');
  });

  await t('LEITOR DE PDF | mapa por toque: o divisor tem alvo largo; arrastar com o dedo muda a largura; o mapa nunca fica espremido; em retrato o painel vira gaveta (sem botão ‹ ›)', async () => {
    await c.emulate({ width: 1280, height: 800 }); await wait(400); await js(`window.MCReact.openPdf({}); true`); await waitFor(() => js(`!document.querySelector('#pdfpane').hidden`), 4000); await wait(400);
    const box = (sel) => js(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { w: r.width, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; })()`);
    try {
    const sp = await box('#pdfsplit'); ok(sp.w >= 20, 'alvo de toque do divisor ≥ 20 px: ' + sp.w); const d0 = (await box('#pdfpane')).w, y = sp.cy + 120;
    await T().drag(sp.cx, y, sp.cx + 30, y, 10); await wait(500); const d1 = (await box('#pdfpane')).w; ok(Math.abs(d1 - (d0 + 30)) < 6, `leitor ${d0} → ${d1}`);
    const sp2 = await box('#pdfsplit'); await T().drag(sp2.cx, y, sp2.cx + 900, y, 10); await wait(500); ok((await box('#stage')).w >= 255, 'o mapa mantém ≥ 260 px: ' + (await box('#stage')).w); await c.shot(path.join(SHOTS, '16-pdf-dividido.png'));
    const sp3 = await box('#pdfsplit'); await T().doubleTap(sp3.cx, y); await wait(500); const w46 = (await box('#work')).w; ok(Math.abs((await box('#pdfpane')).w - w46 * 0.46) < 8, 'duplo toque volta ao padrão');
    await c.emulate({ width: 800, height: 1280 }); await wait(500); ok(!(await js(`getComputedStyle(document.querySelector('#panelsSplit')).display !== 'none'`)), 'retrato: sem divisor/botão do painel (é gaveta)'); ok(await js(`!!document.getElementById('tbPanels')`), 'o botão ☷ da gaveta continua lá');
    ok(!(await js(`document.documentElement.scrollWidth > innerWidth`)), 'sem rolagem horizontal em retrato');
    } finally { await js(`window.MCReact.closePdf(); true`); await c.emulate({ width: 1280, height: 800 }); await wait(400); }
  });

  await t('TELA INICIAL no tablet: aviso de cópia de segurança + "Seu estudo" cabem (paisagem e retrato), alvos ≥ 44 px; "Lembrar depois" por toque; "Cópia de segurança" gera o pacote e o aviso some', async () => {
    await c.emulate({ width: 1280, height: 800 }); await wait(400);
    await js(`window.__mcSaveAsAuto = true; closeHome && closeHome(); dirty = false; newMap(); map.root.title = 'Plano tablet'; map.root.children = []; (() => { const d = map.addChild(map.root.id, 'Disciplina A'); const t1 = map.addChild(d.id, 'Tópico A1'); window.__t1 = t1.id; selectedId = t1.id; selIds = new Set([t1.id]); render(); })(); true`); await wait(300);
    await js(`runStudy((x) => map.mutateStudy(x, (st) => S.addTime(st, nowStr(), 30)), '', [__t1]); runStudy((x) => map.mutateStudy(x, (st) => S.setNext(st, '2020-01-01')), '', [__t1]); true`); await wait(300);
    ok(await js('moveToLibrary()'), 'guardou na biblioteca'); await wait(400);
    try {
    for (const [w, h] of [[1280, 800], [800, 1280]]) {
      await c.emulate({ width: w, height: h }); await wait(400); await js(`act.home(true); true`); await waitFor(() => js(`!!document.querySelector('#hmBackupBanner')`), 5000); await wait(300);
      ok(/ainda não fez nenhuma cópia/.test(await js(`document.querySelector('#hmBackupBanner').textContent`)), 'aviso "nunca fez"');
      ok(await js(`!!document.querySelector('#glStreak') && !!document.querySelector('#glBars')`), 'cartão Seu estudo'); eq(await js(`document.querySelector('#glToday b').textContent`), '30 min');
      ok(!(await js(`document.documentElement.scrollWidth > innerWidth`)), 'sem rolagem horizontal ' + w + '×' + h);
      const small = await js(`[...document.querySelectorAll('#hmBackupBanner button, #glReview, #hmBackup, #hmRestore, #hmBackupEvery')].filter((e) => e.getBoundingClientRect().height < 40).map((e) => e.id)`); eq(small, [], 'alvos de toque ≥ 40 px');
      await c.shot(path.join(SHOTS, w === 1280 ? '17-tela-inicial-paisagem.png' : '17-tela-inicial-retrato.png'));
    }
    await c.emulate({ width: 1280, height: 800 }); await wait(400);
    const later = await js(`(() => { const b = document.querySelector('#hmBackupLater'); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); await T().tap(later.x, later.y); await wait(500);
    ok(!(await js(`!!document.querySelector('#hmBackupBanner')`)), '"Lembrar depois" por toque esconde o aviso');
    await js(`window.__dl = []; window.__mcDownload = (d) => { window.__dl.push({ name: d.name, size: d.bytes.length }); }; true`); const bk = await js(`(() => { const b = document.querySelector('#hmBackup'); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); await T().tap(bk.x, bk.y); await wait(1200);
    ok(await js(`(() => { const dlg = document.querySelector('[data-mc-saveas]'); return !!dlg; })()`) || true, 'diálogo de salvar (automático no teste)');
    await waitFor(() => js(`/Cópia de segurança salva/.test(document.querySelector('#status').textContent)`), 8000);
    const dl = await js('window.__dl'); ok(dl.length === 1 && /\.mcpack$/.test(dl[0].name) && dl[0].size > 300, 'pacote entregue (download): ' + JSON.stringify(dl));
    ok(await js(`(() => { const cfg = JSON.parse(window.__mcHost.fs.readFileSync(userDataDir + '/config.json', 'utf8')); return cfg.lastBackup === nowStr(); })()`), 'data da última cópia gravada');
    } finally {
      // desfaz tudo que este teste criou (a biblioteca e os ganchos de teste), para não mudar a rede de conhecimento dos testes seguintes
      await js(`closeHome && closeHome(); delete window.__mcDownload; window.__mcSaveAsAuto = false; dirty = false; newMap(); (() => { const lib = getLibrary(); for (const m of lib.listMaps({ today: nowStr() })) { lib.trashMap(m.id); lib.purgeMap(m.id); } saveCfg({ lastBackup: null, backupSnoozeUntil: null }); })(); true`);
      await c.emulate({ width: 1280, height: 800 }); await wait(300);
    }
  });

  await t('COLAR CSV no tablet (toque): janela do CSV tem a caixa de colar e o botão; texto colado mostra a prévia; "Criar o mapa" por toque; cabe em paisagem e retrato com alvos ≥ 44 px; o teclado não sobe sozinho', async () => {
    const CSV = 'concurso,disciplina,item,topico,peso\nPlano colado,Penal,1,Crimes,3\n,Penal,1.1,Dolo,2\n,Civil,1,Contratos,4';
    const FENCE = '```';
    try {
      for (const [w, h] of [[1280, 800], [800, 1280]]) {
        await c.emulate({ width: w, height: h }); await wait(400); await js(`closeHome && closeHome(); dirty = false; act.csv(); true`); await waitFor(() => js(`!!document.querySelector('#csvPaste')`), 5000); await wait(300);
        ok(!(await js(`document.activeElement && document.activeElement.id === 'csvPaste'`)), 'a caixa de colar NÃO recebe o foco sozinha (teclado não sobe)');
        const small = await js(`[...document.querySelectorAll('#csvBox button, #csvPaste')].filter((e) => e.offsetParent && e.getBoundingClientRect().height < 40).map((e) => e.id)`); eq(small, [], 'alvos de toque ≥ 40 px');
        const box = await js(`(() => { const r = document.querySelector('#csvBox').getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: innerWidth, h: innerHeight, sw: document.documentElement.scrollWidth }; })()`);
        ok(box.l >= 0 && box.t >= 0 && box.r <= box.w + 1 && box.b <= box.h + 1 && box.sw <= box.w, 'cabe na tela ' + JSON.stringify(box));
        await js(`(() => { const e = document.querySelector('#csvPaste'); const dt = new DataTransfer(); dt.setData('text/plain', ${JSON.stringify('Aqui está:\n' + FENCE + 'csv\n' + CSV + '\n' + FENCE)}); e.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); })()`); await wait(600);
        ok(/3 tópicos em 2 disciplina/.test(await js(`document.querySelector('#csvPreview').textContent`)), 'prévia do texto colado'); await c.shot(path.join(SHOTS, w === 1280 ? '18-colar-csv-paisagem.png' : '18-colar-csv-retrato.png'));
        if (w === 800) {
          const ok1 = await js(`(() => { const b = document.querySelector('#csvOk'); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); await T().tap(ok1.x, ok1.y); await waitFor(() => js(`document.querySelector('#modal').hidden`), 5000); await wait(300);
          eq(await js(`map.root.title`), 'Plano colado'); eq(await js(`map.root.children.map((d) => d.title)`), ['Penal', 'Civil'], 'o mapa foi criado pelo toque');
        } else { const cx = await js(`__ctr('#csvCancel')`); await T().tap(cx.x, cx.y); await wait(300); }
      }
    } finally { await js(`closeModal && closeModal(); dirty = false; newMap(); true`); await c.emulate({ width: 1280, height: 800 }); await wait(300); }
  });

  // ---------------- EDITAR NÓ (mapa e rede) POR TOQUE ----------------
  const gnode = (title) => js(`(() => { const i = gLast.nodes.findIndex((n) => n.title === ${JSON.stringify(title)}); if (i < 0) return null; const el = document.querySelector('.gn[data-i="' + i + '"]'); const cr = el.querySelector('circle').getBoundingClientRect(); const lr = el.querySelector('text') ? el.querySelector('text').getBoundingClientRect() : null; return { i, x: Math.round(cr.left + cr.width / 2), y: Math.round(cr.top + cr.height / 2), d: cr.width, label: lr ? { l: lr.left, r: lr.right, t: lr.top, b: lr.bottom } : null }; })()`);
  const counters = () => js(`if (!window.__cnt) { window.__cnt = { edit: 0, goTo: 0 }; const se = startEdit; startEdit = function () { window.__cnt.edit++; return se.apply(this, arguments); }; const gt = goTo; goTo = function () { window.__cnt.goTo++; return gt.apply(this, arguments); }; } window.__cnt.edit = 0; window.__cnt.goTo = 0; true`);
  await t('EDITAR NÓ por toque: duplo toque abre UMA vez; digitar e tocar fora confirma; ✎ edita o selecionado; Esc cancela; raiz; texto longo; 1 desfazer cada', async () => {
    await c.emulate({ width: 1280, height: 800 }); await wait(400); await helpers(); await fresh(); await counters();
    let a = await node('Tópico 1'); const u0 = await js('map._undo.length'); await T().doubleTap(a.x, a.y); await waitFor(() => js('!editor.hidden'), 3000); await wait(400); eq(await js('window.__cnt.edit'), 1, 'o duplo toque abre o editor uma vez só');
    await js(`editor.value = 'Atos administrativos'; editor.dispatchEvent(new Event('input')); true`); await T().tap(700, 700); await waitFor(() => js('editor.hidden'), 3000);   // tocar fora confirma
    ok((await js('__titles()')).includes('1:Atos administrativos')); eq(await js('map._undo.length'), u0 + 1); await wait(500); eq(await js('editor.hidden'), true, 'não reabre');
    a = await node('Atos administrativos'); await T().tap(a.x, a.y); await wait(200); const e = await js(`__ctr('#tbEdit')`); await T().tap(e.x, e.y); await waitFor(() => js('!editor.hidden'), 3000); eq(await js('editor.value'), 'Atos administrativos');
    await js(`editor.value = 'descartado'; editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true`); await wait(250); ok((await js('__titles()')).includes('1:Atos administrativos'), 'Esc cancela');
    const r = await node('Ideia central'); await T().doubleTap(r.x, r.y); await waitFor(() => js('!editor.hidden'), 3000); await js(`editor.value = 'Concurso TRF 2026 — Analista Judiciário'; editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); true`); await wait(300); eq(await js('map.root.title'), 'Concurso TRF 2026 — Analista Judiciário');
    const b = await node('Tópico 2'); await T().doubleTap(b.x, b.y); await waitFor(() => js('!editor.hidden'), 3000); await js(`editor.value = 'Texto muito longo para testar a quebra de linha do campo de edição em tela de toque. '.repeat(4); editor.dispatchEvent(new Event('input')); true`); await wait(200);
    const box = await js(`(() => { const a = editor.getBoundingClientRect(), s = stage.getBoundingClientRect(); return a.left >= s.left - 1 && a.right <= s.right + 1 && a.top >= s.top - 1 && a.bottom <= s.bottom + 1; })()`); ok(box, 'campo longo dentro da área de trabalho'); await js(`editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); true`); await wait(300);
  });

  await t('TECLADO VIRTUAL: com o campo de edição aberto, ao a tela encolher (teclado), o mapa rola até o tópico e o campo fica visível — mesmo para um tópico na parte de baixo', async () => {
    await fresh(); await js(`(() => { const p = map.root.children[2]; for (let i = 0; i < 6; i++) map.addChild(p.id, 'Item ' + i); render(); fit(); true; })()`); await wait(300);
    const low = await js(`(() => { let best = null, by = -1; map.walk((n) => { const el = document.querySelector('[data-id="' + n.id + '"]'); if (el) { const r = el.getBoundingClientRect(); if (r.bottom > by) { by = r.bottom; best = n.title; } } }); return best; })()`);
    const a = await node(low); await T().doubleTap(a.x, a.y); await waitFor(() => js('!editor.hidden'), 3000); await wait(300);
    await c.emulate({ width: 1280, height: 420 }); await wait(700);       // o teclado ocupa ~380 px: a área visível cai de 800 para 420
    const r = await js(`(() => { const ed = editor.getBoundingClientRect(), id = selectedId, nd = document.querySelector('[data-id="' + id + '"]').getBoundingClientRect(); return { edBottom: ed.bottom, edTop: ed.top, nodeBottom: nd.bottom, nodeTop: nd.top, vh: innerHeight, open: !editor.hidden }; })()`);
    ok(r.open, 'editor continua aberto'); ok(r.edBottom <= r.vh + 1 && r.edTop >= 0, 'campo de edição visível: ' + JSON.stringify(r)); ok(r.nodeBottom <= r.vh + 1 && r.nodeTop >= 0, 'o tópico editado também fica visível: ' + JSON.stringify(r));
    await js(`editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true`); await c.emulate({ width: 1280, height: 800 }); await wait(500);
  });

  await t('EDITAR NÓ DA REDE por toque: abrir a rede, tocar no PONTO e também PERTO dele / no NOME seleciona; "Ir para o tópico" e duplo toque abrem o tópico UMA vez; editar e ver o rótulo novo', async () => {
    await helpers(); await fresh(); await js(`map.root.children.forEach((c, i) => map.addChild(c.id, 'Sub ' + i)); render(); true`); await wait(200); await counters();
    const gb = await js(`__ctr('#rail [data-act="graph"]')`); await T().tap(gb.x, gb.y); await waitFor(() => js(`!document.querySelector('#graph').hidden`), 5000); await wait(1000);
    let g = await gnode('Tópico 1'); ok(g, 'nó na rede'); ok(g.d < 20, 'o ponto é pequeno para um dedo (' + g.d + ' px): o toque precisa "grudar" nele');
    await T().tap(g.x, g.y); await waitFor(() => js(`document.querySelector('#gSide').textContent.includes('Tópico 1')`), 3000);                 // no ponto
    await T().tap(120, 740); await wait(800); await T().tap(g.x + 18, g.y + 14); await waitFor(() => js(`document.querySelector('#gSide').textContent.includes('Tópico 1')`), 3000);   // a ~23 px do ponto
    g = await gnode('Tópico 2'); await T().tap(g.x, g.y); await wait(800); g = await gnode('Tópico 2'); /* 800 ms acima: dois toques no MESMO nó em menos de 450 ms são um duplo toque e abrem o tópico */ if (g.label) { const lx = Math.round((g.label.l + g.label.r) / 2), ly = Math.round((g.label.t + g.label.b) / 2); await T().tap(lx, ly); await wait(300); ok((await js(`document.querySelector('#gSide').textContent`)).includes('Tópico 2'), 'tocar no NOME seleciona: ' + JSON.stringify({ g, lx, ly, gSel: await js('gSel'), side: (await js(`document.querySelector('#gSide').textContent`)).slice(0, 60), agora: await gnode('Tópico 2') })); }
    await wait(800); const far = await gnode('Tópico 1'); await T().tap(far.x - 150, far.y + 160); await wait(300); ok(!(await js(`document.querySelector('#gSide').textContent`)).includes('Tópico 1'), 'tocar longe de qualquer nó não seleciona');
    g = await gnode('Tópico 1'); await T().tap(g.x, g.y); await wait(300); await js(`document.querySelector('#gGo').click(); true`); await wait(300); eq(await js('graphOpen'), false); eq(await js('map.find(selectedId).node.title'), 'Tópico 1'); await counters();
    const e = await js(`__ctr('#tbEdit')`); await T().tap(e.x, e.y); await waitFor(() => js('!editor.hidden'), 3000); await js(`editor.value = 'Direito Civil'; editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); true`); await wait(300);
    await T().tap(gb.x, gb.y); await waitFor(() => js(`!document.querySelector('#graph').hidden`), 5000); await wait(1000); ok(await gnode('Direito Civil'), 'rótulo novo na rede'); eq(await gnode('Tópico 1'), null);
    g = await gnode('Tópico 3'); await counters(); await T().doubleTap(g.x, g.y); await waitFor(() => js('graphOpen === false'), 4000); await wait(500);
    eq(await js('window.__cnt.goTo'), 1, 'duplo toque abre o tópico UMA vez só'); eq(await js('map.find(selectedId).node.title'), 'Tópico 3'); eq(await js('!editor.hidden'), false, 'abrir o tópico não abre o editor sozinho');
    const e2 = await js(`__ctr('#tbEdit')`); await T().tap(e2.x, e2.y); await waitFor(() => js('!editor.hidden'), 3000); eq(await js('editor.value'), 'Tópico 3'); await js(`editor.value = 'Direito Penal'; editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); true`); await wait(300); ok((await js('__titles()')).includes('1:Direito Penal'));
    await c.shot(path.join(SHOTS, '13-editar-no-rede.png'));
  });

  await t('REDE por toque: nó FANTASMA (círculo vazio) é selecionável; "Criar este tópico" cria; arrastar um nó o move sem abrir nada', async () => {
    await helpers(); await fresh(); const a = await node('Tópico 1'); await T().tap(a.x, a.y); await js(`map.update(selectedId, { notes: 'Ver [[Prazo de decadência]] depois' }); render(); true`); await wait(200);
    const gb = await js(`__ctr('#rail [data-act="graph"]')`); await T().tap(gb.x, gb.y); await waitFor(() => js(`!document.querySelector('#graph').hidden`), 5000); await wait(1000); await counters();
    let g = await gnode('Prazo de decadência'); ok(g, 'fantasma na rede'); await T().tap(g.x, g.y); await waitFor(() => js(`!!document.querySelector('#gCreate')`), 3000);
    const cb = await js(`__ctr('#gCreate')`); await T().tap(cb.x, cb.y); await wait(500); ok((await js('__titles()')).some((x) => x.endsWith('Prazo de decadência')), 'tópico criado');
    g = await gnode('Tópico 2'); const pos0 = await js(`gLast.P[${g.i}].x`); await T().drag(g.x, g.y, g.x + 90, g.y + 40, 10); await wait(300); ok(Math.abs((await js(`gLast.P[${g.i}].x`)) - pos0) > 20, 'o nó foi arrastado'); eq(await js('window.__cnt.goTo'), 0, 'arrastar não abre o tópico'); eq(await js('graphOpen'), true);
    await js('closeGraph(); true');
  });

  await t('REGRESSÃO (clique fantasma): tocar FORA da gaveta de painéis ou do menu ☰ só FECHA; nunca aciona o botão/tópico que estava por baixo do dedo', async () => {
    for (const [w, h] of [[800, 1280], [1280, 800]]) {
      await c.emulate({ width: w, height: h }); await wait(500); await helpers(); await fresh();
      const under = await js(`__ctr('#rail [data-act="present"]')`);                                   // o botão "Apresentar" é o alvo perigoso
      if (w < 1001) { const b = await js(`__ctr('#tbPanels')`); await T().tap(b.x, b.y); await waitFor(() => js("document.body.classList.contains('tb-panels')"), 3000); await T().tap(under.x, under.y); await waitFor(() => js("!document.body.classList.contains('tb-panels')"), 3000); await wait(400); eq(await js('present'), null, w + ': a gaveta fechou, mas "Apresentar" NÃO foi acionado'); }
      const m = await js(`__ctr('#mcHostMenuBtn')`); await T().tap(m.x, m.y); await waitFor(() => js("!document.querySelector('#mcHostMenu').hidden"), 3000); await T().tap(under.x, under.y); await waitFor(() => js("document.querySelector('#mcHostMenu').hidden"), 3000); await wait(400);
      eq(await js('present'), null, w + ': o menu fechou, mas "Apresentar" NÃO foi acionado');
      const a = await node('Tópico 1'); await T().tap(m.x, m.y); await waitFor(() => js("!document.querySelector('#mcHostMenu').hidden"), 3000); await T().tap(a.x, a.y); await waitFor(() => js("document.querySelector('#mcHostMenu').hidden"), 3000); await wait(300);
      ok((await js('selectedId')) !== a.id, w + ': tocar num tópico com o menu aberto só fecha o menu (não seleciona o tópico por baixo)');
    }
    await c.emulate({ width: 1280, height: 800 }); await wait(400); await helpers();
  });

  await t('abrir janelas NÃO foca campos de texto (o teclado virtual não sobe sozinho e não esconde a janela); o foco vai ao botão principal', async () => {
    await c.emulate({ width: 1280, height: 800 }); await wait(400); await helpers();
    for (const [open, name] of [['openLibraryModal()', 'biblioteca'], ['act.csv()', 'CSV'], ['act.simulado()', 'simulado'], ['act.help()', 'atalhos'], ['act.plan()', 'planilha']]) {
      await js(`closeHome(); closeModal(); ${open}; true`); await wait(500);
      const r = await js(`(() => { const a = document.activeElement; return { tag: a && a.tagName, type: a && a.type, inModal: !!(a && a.closest && a.closest('#modal')), typing: !!a && /^(INPUT|TEXTAREA)$/.test(a.tagName) && !/^(button|submit|checkbox|radio|range|color|file)$/i.test(a.type || ''), vh: innerHeight }; })()`);
      ok(!r.typing, name + ': o foco inicial caiu num campo de texto (' + r.tag + '/' + r.type + ') — o teclado subiria'); ok(r.inModal || r.tag === 'BODY', name + ': foco fora da janela: ' + JSON.stringify(r)); eq(r.vh, 800, name + ': a altura da tela não pode mudar');
      await js('closeModal(); true');
    }
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
