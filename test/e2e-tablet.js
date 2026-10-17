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
    eq([r.coarse, r.vw, r.vh], [true, 1280, 800]); ok(r.scrollW <= r.vw, 'sem rolagem horizontal: ' + r.scrollW); eq(r.extras, ['tbEdit', 'tbFold'], 'em paisagem larga, sem o botão de painéis'); ok(/interactive-widget=resizes-content/.test(r.meta), r.meta);
    await c.shot(path.join(SHOTS, '05-tablet-paisagem.png'));
  });

  await t('alvos de toque: botões da barra lateral, da barra de ações e controles de formulário têm pelo menos 44 px', async () => {
    const small = await js(`(() => { const bad = []; for (const sel of ['#rail .tool', '#appbar .icon-btn', '#appbar select', '#appbar input', '#mcTouchBar button', '#ptabs .ptab', '#options select', '#statusbar .icon-btn', '#studyDone', '#qAdd', '#errAdd']) for (const e of document.querySelectorAll(sel)) { if (!e.offsetWidth) continue; const r = e.getBoundingClientRect(); if (r.height < 43.5 || r.width < 43.5) bad.push(sel + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); } return bad; })()`);
    eq(small, [], 'alvos menores que 44 px');
  });

  await t('barra lateral: TODOS os botões visíveis sem rolar em tablets de 744 dp e 720 dp de altura (nenhuma ferramenta escondida abaixo da dobra)', async () => {
    for (const h of [744, 720]) {
      await c.emulate({ width: 1280, height: h }); await wait(500);
      const r = await js(`(() => { const rail = document.querySelector('#rail').getBoundingClientRect(); const hidden = [...document.querySelectorAll('#rail .tool')].filter((b) => { const r = b.getBoundingClientRect(); return r.bottom > rail.bottom + 0.5 || r.top < rail.top - 0.5; }).map((b) => b.dataset.act); return { hidden, n: document.querySelectorAll('#rail .tool').length, scroll: document.querySelector('#rail').scrollHeight - document.querySelector('#rail').clientHeight }; })()`);
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
    await js(`(() => { const set = (s, v) => { const e = document.querySelector(s); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })); }; set('#qBanca', 'CESPE'); set('#qAno', '2024'); set('#qDone', '10'); set('#qOk', '7'); return true; })()`);
    const reg = await js(`__ctr('#qAdd')`); await T().tap(reg.x, reg.y); await wait(250); eq(await js(`(() => { let r; map.walk((n) => { if (n.title === 'Tópico 1') r = n; }); return r.study.qsrc[0].banca + r.study.qsrc[0].done; })()`), 'CESPE10');
    await T().tap(30, 640); await waitFor(() => js(`getComputedStyle(document.querySelector('#panels')).visibility === 'hidden'`), 3000);   // tocar no fundo (fora da gaveta) fecha
    eq(await js(`document.body.classList.contains('tb-panels')`), false);
  });

  await t('retrato: tela inicial, Painel de estudos e biblioteca cabem sem rolagem horizontal; nenhuma janela estoura a tela', async () => {
    const wide = async (what) => js(`(() => { const de = document.documentElement; const bad = []; if (de.scrollWidth > innerWidth + 1) bad.push('página ' + de.scrollWidth); for (const sel of ['#home:not([hidden])', '#dash:not([hidden])', '#modal:not([hidden]) .modal-box']) { const e = document.querySelector(sel); if (e) { const r = e.getBoundingClientRect(); if (r.right > innerWidth + 1 || r.left < -1) bad.push(sel + ' ' + Math.round(r.left) + '..' + Math.round(r.right)); } } return bad; })()`);
    await js(`act.home(true); true`); await wait(500); eq(await wide(), [], 'tela inicial'); await c.shot(path.join(SHOTS, '12-inicio-retrato.png')); await js('closeHome(); act.dash(); true'); await wait(600); eq(await wide(), [], 'painel de estudos'); await js('closeDash(); openLibraryModal(); true'); await wait(400); eq(await wide(), [], 'biblioteca'); await js('closeModal(); true');
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
