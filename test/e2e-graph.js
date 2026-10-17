'use strict';
// Rede de conhecimento — rodada de aperfeiçoamento: rótulos (posição, sobreposição, modos), densidade, rótulos de relação, agrupar folhas,
// foco, legenda, busca com navegação, teclado, botões de zoom, gaveta responsiva, alvo de toque e desempenho. Grafo denso (3 mapas, ~330 tópicos).
const fs = require('fs');
const path = require('path');
const start = require('./harness');
const { openLibrary } = require('../core/library');
const { MindMap, createNode } = require('../core/model');

(async () => {
  const c = await start('MindCraft e2e — rede de conhecimento (rótulos, densidade, usabilidade, responsividade)');
  const { js, wait, waitFor, eq, ok, t, USERDATA } = c; const win = c.win; const SHOTS = path.join(__dirname, '..', 'evidencias', 'rede');
  const key = (k, extra = {}) => { win.webContents.sendInputEvent({ type: 'keyDown', keyCode: k, ...extra }); if (k.length === 1) win.webContents.sendInputEvent({ type: 'char', keyCode: k, ...extra }); win.webContents.sendInputEvent({ type: 'keyUp', keyCode: k, ...extra }); };
  const size = async (w, h) => { win.setContentSize(w, h); await wait(500); await js('window.dispatchEvent(new Event("resize")); true'); await wait(300); };

  // ---- biblioteca densa: 3 mapas × 110 tópicos, links [[...]] entre mapas, relações com rótulo, uma raiz com hostil ----
  let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const lib = openLibrary(path.join(USERDATA, 'biblioteca.db')); const names = ['Direito Administrativo', 'Português', 'Informática']; const titles = [];
  for (const [mi, name] of names.entries()) {
    const m = new MindMap(createNode(name), { name }); const ids = [m.root.id];
    for (let i = 1; i < 110; i++) { const parent = ids[Math.floor(rnd() * Math.min(ids.length, 1 + i / 2))]; const nn = m.addChild(parent, `${name.split(' ')[0]} tópico ${i} ${i % 7 === 0 ? 'com um título bem comprido para testar o corte do rótulo' : ''}`.trim()); ids.push(nn.id); titles.push({ mi, i, title: nn.title }); }
    if (mi === 0) m.addChild(m.root.id, '<img src=x onerror="window.__pwn=1">hostil');
    lib.saveMap(m, { snapshot: false });
  }
  // links entre tópicos (notas), alguns entre mapas
  for (const row of lib.listMaps()) {
    const m = lib.loadMap(row.id); const all = []; m.walk((n) => all.push(n));
    for (let k = 0; k < 45; k++) { const a = all[1 + Math.floor(rnd() * (all.length - 1))], other = titles[Math.floor(rnd() * titles.length)]; a.notes = (a.notes || '') + ` [[${other.title.replace(/[\[\]|#]/g, '')}]]`; }
    const x = all[3], y = all[9]; m.addRelation(x.id, y.id, 'depende de'); m.addRelation(all[12].id, all[20].id, 'exceção à regra');
    lib.saveMap(m, { snapshot: false });
  }
  lib.close();
  await js(`saveCfg({ scope: 'vault' }); dirty = false; true`);

  const open = async () => { await js(`closeGraph(); true`); await js('act.graph(); true'); await waitFor(() => js(`document.querySelectorAll('#gview .gn').length > 100`), 20000); await wait(400); };
  const clear = async () => { await js(`gSel = null; gHover = null; renderGraph(false); fitGraph(); true`); await wait(450); };
  const q = (code) => js(code);
  /** Retângulos (tela) dos rótulos visíveis e dos pontos visíveis. */
  const geo = () => js(`(() => { const r = (e) => { const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; };
    const labels = [...document.querySelectorAll('#gview .glabel')].filter((e) => e.style.display !== 'none' && e.parentNode.style.display !== 'none').map((e) => ({ ...r(e), t: e.textContent, node: +e.parentNode.dataset.i }));
    const nodes = [...document.querySelectorAll('#gview .gn')].filter((e) => e.style.display !== 'none').map((e) => ({ ...r(e.querySelector('circle')), i: +e.dataset.i }));
    const sv = document.querySelector('#gsvg').getBoundingClientRect(); return { labels, nodes, sv: { x: sv.left, y: sv.top, w: sv.width, h: sv.height } }; })()`);
  const overlap = (a, b, pad = 0) => a.x - pad < b.x + b.w && b.x - pad < a.x + a.w && a.y - pad < b.y + b.h && b.y - pad < a.y + a.h;
  const labelStats = async () => { const g = await geo(); let clash = 0; for (let i = 0; i < g.labels.length; i++) for (let j = i + 1; j < g.labels.length; j++) if (overlap(g.labels[i], g.labels[j], -1)) clash++; return { n: g.labels.length, clash, g }; };

  console.log('[dbg] cfg ok'); await c.ready; console.log('[dbg] ready');
  await t('grafo denso abre; fantasmas/ligações contadas; texto hostil é só texto', async () => {
    await open(); const st = await js(`document.querySelector('#gStat').textContent`); ok(/33\d tópicos|3[0-9]{2} tópicos/.test(st), st);
    eq(await js('window.__pwn'), undefined); eq(await js(`document.querySelectorAll('#gview img, #gview script').length`), 0);
    await c.shot(path.join(SHOTS, '01-denso-ajustado.png'));
  });

  await t('RÓTULOS: nenhum se sobrepõe a outro, todos dentro da tela, perto do seu ponto; quantidade limitada pela área', async () => {
    await clear(); const s = await labelStats(); ok(s.n >= 15, 'rótulos visíveis: ' + s.n); eq(s.clash, 0, 'rótulos sobrepostos');
    for (const l of s.g.labels) { ok(l.x >= s.g.sv.x - 3 && l.x + l.w <= s.g.sv.x + s.g.sv.w + 3 && l.y >= s.g.sv.y - 3 && l.y + l.h <= s.g.sv.y + s.g.sv.h + 3, 'fora da tela: ' + l.t); }
    for (const l of s.g.labels) { const nd = s.g.nodes.find((x) => x.i === l.node); const cx = nd.x + nd.w / 2, cy = nd.y + nd.h / 2; const dx = Math.max(l.x - cx, 0, cx - (l.x + l.w)), dy = Math.max(l.y - cy, 0, cy - (l.y + l.h)); ok(Math.hypot(dx, dy) <= nd.w / 2 + 14, `rótulo longe do ponto: ${l.t} (${Math.round(Math.hypot(dx, dy))}px)`); }
    const max = Math.round((s.g.sv.w * s.g.sv.h) / 9000) + 12; ok(s.n <= max, `${s.n} rótulos > orçamento ${max}`);
  });

  await t('rótulos não passam por baixo da legenda, dos botões de zoom nem da estatística', async () => {
    await clear(); const s = await labelStats(); const over = await js(`['#gLegend', '#gZoom', '#gStat'].map((q) => { const b = document.querySelector(q).getBoundingClientRect(); return { q, x: b.left, y: b.top, w: b.width, h: b.height }; })`);
    for (const o of over) for (const l of s.g.labels) ok(!overlap(l, o, -1), `rótulo "${l.t}" sobre ${o.q}`);
  });

  await t('rótulos não cobrem outros pontos (no máximo uma sobreposição leve por rótulo)', async () => {
    const s = await labelStats(); let covered = 0;
    for (const l of s.g.labels) for (const nd of s.g.nodes) if (nd.i !== l.node && overlap(l, { x: nd.x + 2, y: nd.y + 2, w: nd.w - 4, h: nd.h - 4 })) covered++;
    ok(covered <= Math.ceil(s.n * 0.1), `rótulos sobre pontos: ${covered} de ${s.n}`);
  });

  await t('DENSIDADE: compacta < normal < detalhada em rótulos e no tamanho dos pontos; a escolha é lembrada ao reabrir', async () => {
    await clear(); const res = {}; for (const d of ['compact', 'normal', 'detailed']) { await js(`(() => { const s = document.querySelector('#gDensity'); s.value = '${d}'; s.dispatchEvent(new Event('change')); return 1; })()`); await wait(450); const s = await labelStats(); const r0 = await js(`+document.querySelector('#gview .gn circle').getAttribute('r')`); res[d] = { n: s.n, clash: s.clash, r: r0 }; }
    ok(res.compact.n < res.normal.n && res.normal.n < res.detailed.n, JSON.stringify(res)); ok(res.compact.r < res.normal.r && res.normal.r < res.detailed.r, 'raio ' + JSON.stringify(res)); eq([res.compact.clash, res.normal.clash, res.detailed.clash], [0, 0, 0], 'sem sobreposição em nenhuma');
    eq(JSON.parse(fs.readFileSync(path.join(USERDATA, 'config.json'), 'utf8')).graphView.density, 'detailed');
    await c.shot(path.join(SHOTS, '02-densidade-detalhada.png'));
    await js(`closeGraph(); gBuilt = false; true`); await open(); eq(await js(`document.querySelector('#gDensity').value`), 'detailed', 'lembrou');
    await js(`(() => { const s = document.querySelector('#gDensity'); s.value = 'normal'; s.dispatchEvent(new Event('change')); return 1; })()`); await wait(400);
  });

  await t('MODOS de rótulo: nenhum (só o selecionado e vizinhos), relevantes, todos, automáticos', async () => {
    const setMode = async (m) => { await js(`(() => { const s = document.querySelector('#gLabels'); s.value = '${m}'; s.dispatchEvent(new Event('change')); return 1; })()`); await wait(350); };
    await clear(); await setMode('none'); eq((await labelStats()).n, 0, 'nenhum'); await js(`__sel0 = [...gLast.nodes.keys()].sort((a, b) => gLast.nodes[b].deg - gLast.nodes[a].deg)[0]; gSel = gLast.nodes[__sel0].id; renderGraph(false); true`); await wait(300);
    const s1 = await labelStats(); ok(s1.n >= 1 && s1.n <= 1 + (await js(`gLast.adj[__sel0].size`)), 'só o selecionado e vizinhos: ' + s1.n);
    const sel0 = await js('__sel0'); ok(s1.g.labels.some((l) => l.node === sel0), 'o selecionado tem rótulo'); await js(`gSel = null; renderGraph(false); true`);
    await setMode('relevant'); const rel = (await labelStats()).n; await setMode('auto'); const aut = (await labelStats()).n; await setMode('all'); const all = (await labelStats()).n;
    ok(rel <= aut && aut <= all, `relevantes ${rel} ≤ automáticos ${aut} ≤ todos ${all}`); const onscreen = await js(`gLast.nodes.filter((n, i) => { const x = gLast.P[i].x * gTrans.k + gTrans.x, y = gLast.P[i].y * gTrans.k + gTrans.y; return x > -40 && y > -40 && x < innerWidth && y < innerHeight; }).length`); ok(all >= Math.min(onscreen, 250) * 0.6, 'todos: ' + all + ' de ' + onscreen);
    await setMode('auto');
  });

  await t('selecionado: rótulo COMPLETO sempre visível (mesmo longo); passar o mouse mostra os vizinhos', async () => {
    const long = await js(`gLast.nodes.findIndex((n) => n.title.length > 50)`); ok(long >= 0, 'há título longo');
    await js(`gSel = gLast.nodes[${long}].id; centerSel(); renderGraph(false); true`); await wait(450);
    const s = await labelStats(); const l = s.g.labels.find((x) => x.node === long); ok(l, 'sem rótulo do selecionado'); ok(l.t.length > 38 && l.t.length <= 62, 'rótulo mais completo que o normal: ' + l.t);
    await js(`gSel = null; renderGraph(false); true`);
    await clear(); const hub = await js(`[...gLast.nodes.keys()].filter((i) => gLast.adj[i].size >= 3 && gLast.adj[i].size <= 6).pop()`); await js(`(() => { const n = document.querySelectorAll('#gview .gn')[${hub}]; n.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); return 1; })()`); await wait(200);
    const sh = await labelStats(); const neigh = await js(`[...gLast.adj[${hub}]].filter((j) => { const x = gLast.P[j].x * gTrans.k + gTrans.x, y = gLast.P[j].y * gTrans.k + gTrans.y; return x > 5 && y > 5 && x < innerWidth - 5 && y < innerHeight - 5; })`); const showing = neigh.filter((j) => sh.g.labels.some((x) => x.node === j)).length; ok(neigh.length >= 2 && showing === neigh.length, `vizinhos com rótulo: ${showing} de ${neigh.length}`);
    await js(`document.querySelectorAll('#gview .gn')[${hub}].dispatchEvent(new MouseEvent('mouseout', { bubbles: true })); true`);
  });

  await t('RELAÇÕES: o rótulo da relação ("depende de") aparece no meio da linha; some com "Rótulos: nenhum"; texto hostil é só texto', async () => {
    const rel = await js(`[...document.querySelectorAll('#gview .elabel')].map((e) => e.textContent).sort()`); ok(rel.includes('depende de') && rel.includes('exceção à regra'), rel.join('|'));
    await js(`gTrans.k = Math.max(gTrans.k, 1); applyT(); true`); await wait(300);
    const e0 = await js(`gLast.edges.findIndex((e) => e.type === 'relation' && e.label === 'depende de')`); await js(`(() => { const e = gLast.edges[${e0}]; gSel = e.from; centerSel(); renderGraph(false); return 1; })()`); await wait(450);
    eq(await js(`(() => { const t = gLast.elabels.get(${e0}); return t && t.style.display !== 'none'; })()`), true, 'visível ao selecionar uma ponta');
    await js(`(() => { const s = document.querySelector('#gLabels'); s.value = 'none'; s.dispatchEvent(new Event('change')); return 1; })()`); await wait(300);
    eq(await js(`gLast.elabels.get(${e0}).style.display`), 'none', 'escondido sem rótulos'); await js(`(() => { const s = document.querySelector('#gLabels'); s.value = 'auto'; s.dispatchEvent(new Event('change')); gSel = null; renderGraph(false); return 1; })()`);
    await js(`fitGraph(); true`); await wait(300);
  });

  await t('AGRUPAR FOLHAS: some a maioria dos pontos folha com "+N" no pai; zoom, clique no pai ou busca os abrem; desligar volta tudo', async () => {
    const total = await js(`gLast.nodes.length`); await js(`document.querySelector('#gGroup').click(); true`); await wait(500);
    const vis0 = await js(`[...document.querySelectorAll('#gview .gn')].filter((e) => e.style.display !== 'none').length`); ok(vis0 < total * 0.8 && vis0 > 10, `visíveis ${vis0} de ${total}`);
    const badge = await js(`(() => { const b = [...document.querySelectorAll('#gview .gbadge')].find((x) => x.style.display !== 'none'); return b ? b.textContent : null; })()`); ok(/^\+\d+$/.test(badge), 'selo: ' + badge);
    const p = await js(`gLast.leafCount.findIndex((n, i) => n >= 2 && gLast.nodes[i].id)`); const cnt = await js(`gLast.leafCount[${p}]`);
    await js(`(() => { const n = document.querySelectorAll('#gview .gn')[${p}]; n.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 5, clientY: 5 })); window.dispatchEvent(new MouseEvent('mouseup')); return 1; })()`); await wait(450);
    const opened = await js(`[...gLast.leafParent.keys()].filter((j) => gLast.leafParent[j] === ${p} && document.querySelectorAll('#gview .gn')[j].style.display !== 'none').length`); eq(opened, cnt, 'clicar no pai abre as folhas dele');
    await js(`gExpanded.clear(); gSel = null; renderGraph(false); true`); await wait(300);
    await js(`gTrans.k = 1.3; applyT(); true`); await wait(400); eq(await js(`[...document.querySelectorAll('#gview .gn')].filter((e) => e.style.display !== 'none').length`), total, 'com zoom todas aparecem');
    await js(`fitGraph(); true`); await wait(300); const leaf = await js(`gLast.leafParent.findIndex((p) => p >= 0)`); const title = await js(`gLast.nodes[${leaf}].title`);
    await js(`(() => { const s = document.querySelector('#gSearch'); s.value = ${JSON.stringify(title.slice(0, 25))}; s.dispatchEvent(new Event('input')); return 1; })()`); await wait(400);
    eq(await js(`document.querySelectorAll('#gview .gn')[${leaf}].style.display`), '', 'o resultado da busca aparece mesmo agrupado');
    await js(`(() => { const s = document.querySelector('#gSearch'); s.value = ''; s.dispatchEvent(new Event('input')); document.querySelector('#gGroup').click(); return 1; })()`); await wait(400);
    eq(await js(`[...document.querySelectorAll('#gview .gn')].filter((e) => e.style.display !== 'none').length`), total, 'desligar mostra tudo');
  });

  await t('FOCAR SELEÇÃO: esmaece o que não é vizinho do selecionado; desligar restaura; tecla F alterna', async () => {
    const hub = await js(`[...gLast.nodes.keys()].filter((i) => gLast.adj[i].size >= 3)[0]`); await js(`gSel = gLast.nodes[${hub}].id; renderGraph(false); true`); await wait(300);
    eq(await js(`document.querySelectorAll('#gview .gn.dim').length`), 0, 'sem foco: nada esmaecido'); key('f'); await wait(300);
    const dim = await js(`document.querySelectorAll('#gview .gn.dim').length`), keep = await js(`gLast.adj[${hub}].size + 1`); eq(dim, (await js('gLast.nodes.length')) - keep, 'só o selecionado e vizinhos ficam fortes');
    key('f'); await wait(300); eq(await js(`document.querySelectorAll('#gview .gn.dim').length`), 0); await js(`gSel = null; renderGraph(false); true`);
  });

  await t('LEGENDA clicável: ocultar um mapa tira os pontos e linhas dele (sem mudar as posições); mostrar volta; teclado também funciona', async () => {
    const before = await js(`JSON.stringify(gLast.P.slice(0, 5))`); const total = await js('gLast.nodes.length');
    const items = await js(`document.querySelectorAll('#gLegend .lg').length`); ok(items >= 3, 'itens da legenda: ' + items);
    const li = await js(`[...document.querySelectorAll('#gLegend .lg')].findIndex((x) => /Português/.test(x.textContent))`); ok(li >= 0, 'legenda do mapa Português'); await js(`document.querySelectorAll('#gLegend .lg')[${li}].click(); true`); await wait(450);
    const hidden = await js(`[...document.querySelectorAll('#gview .gn')].filter((e) => e.style.display === 'none').length`); ok(hidden >= 100, 'ocultou o mapa: ' + hidden); ok(await js(`document.querySelectorAll('#gLegend .lg')[${li}].classList.contains('off')`));
    eq(await js(`[...document.querySelectorAll('#gview .edge')].filter((l) => l.style.display === 'none').length > 100`), true, 'linhas somem junto'); eq(await js(`JSON.stringify(gLast.P.slice(0, 5))`), before, 'posições intactas');
    await js(`(() => { const l = document.querySelectorAll('#gLegend .lg')[${li}]; l.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); return 1; })()`); await wait(450);
    eq(await js(`[...document.querySelectorAll('#gview .gn')].filter((e) => e.style.display === 'none').length`), 0, 'voltou'); eq(total, await js('gLast.nodes.length'));
  });

  await t('BUSCA: contador, Enter percorre os resultados (Shift+Enter volta, dá a volta), seleciona e centraliza; o resultado tem rótulo', async () => {
    await js(`(() => { const s = document.querySelector('#gSearch'); s.value = 'Português tópico 1'; s.dispatchEvent(new Event('input')); s.focus(); return 1; })()`); await wait(400);
    const n = await js(`gLast.match.filter(Boolean).length`); ok(n >= 10, 'resultados ' + n); ok(new RegExp(`^${n} resultados$`).test(await js(`document.querySelector('#gSearchCount').textContent`)), await js(`document.querySelector('#gSearchCount').textContent`));
    key('Enter'); await wait(400); eq(await js(`document.querySelector('#gSearchCount').textContent`), `1/${n}`); const a = await js('gSel');
    key('Enter'); await wait(400); eq(await js(`document.querySelector('#gSearchCount').textContent`), `2/${n}`); ok((await js('gSel')) !== a, 'seleção andou');
    key('Enter', { modifiers: ['shift'] }); await wait(400); eq(await js(`document.querySelector('#gSearchCount').textContent`), `1/${n}`); key('Enter', { modifiers: ['shift'] }); await wait(400); eq(await js(`document.querySelector('#gSearchCount').textContent`), `${n}/${n}`, 'dá a volta para trás');
    const s = await labelStats(); ok(s.g.labels.some((l) => l.node === 0 || l.t.includes('Português')), 'resultado com rótulo');
    await c.shot(path.join(SHOTS, '03-busca.png'));
    await js(`(() => { const s = document.querySelector('#gSearch'); s.value = 'zzzz-nada'; s.dispatchEvent(new Event('input')); return 1; })()`); await wait(300); eq(await js(`document.querySelector('#gSearchCount').textContent`), 'nenhum resultado');
    await js(`(() => { const s = document.querySelector('#gSearch'); s.value = ''; s.dispatchEvent(new Event('input')); s.blur(); gSel = null; return 1; })()`); await wait(300);
  });

  await t('TECLADO: + − 0 C / setas Enter L G; teclas não atrapalham quem digita na busca', async () => {
    await js(`fitGraph(); true`); await wait(250); const k0 = await js('gTrans.k'); key('+'); await wait(120); ok((await js('gTrans.k')) > k0 * 1.2, 'zoom +'); key('-'); await wait(120); ok(Math.abs((await js('gTrans.k')) - k0) < 0.01, 'zoom −'); key('0'); await wait(200); ok(Math.abs((await js('gTrans.k')) - k0) < 0.01, '0 = ajustar');
    await js(`document.querySelector('#gSearch').focus(); true`); const before = await js('gTrans.k'); key('+'); key('0'); await wait(150); eq(await js('gTrans.k'), before, 'digitando na busca: atalhos desligados'); eq(await js(`document.querySelector('#gSearch').value`), '+0'); await js(`(() => { const s = document.querySelector('#gSearch'); s.value = ''; s.dispatchEvent(new Event('input')); s.blur(); return 1; })()`);
    await js(`gSel = null; renderGraph(false); true`); key('Right'); await wait(300); ok(await js('!!gSel'), 'seta sem seleção escolhe o mais ligado'); const first = await js('gSel');
    let moved = 0; for (const kk of ['Right', 'Left', 'Up', 'Down']) { const b = await js('gSel'); key(kk); await wait(200); if ((await js('gSel')) !== b) moved++; } ok(moved >= 1, 'setas andam entre pontos ligados: ' + moved + ' de 4');
    const sel = await js('gSel'); ok(await js(`gLast.adj[gLast.idx.get(gSel)] !== undefined`)); void first; void sel;
    key('l'); await wait(500); ok(await js(`document.querySelector('#gLocal').checked`), 'L liga só vizinhança'); ok((await js('gLast.nodes.length')) < 100, 'vizinhança: ' + (await js('gLast.nodes.length'))); key('l'); await wait(500); ok(!(await js(`document.querySelector('#gLocal').checked`)));
    key('g'); await wait(300); ok(await js(`document.querySelector('#gGroup').checked`)); key('g'); await wait(300); key('c'); await wait(250); key('/'); await wait(150); eq(await js('document.activeElement.id'), 'gSearch', '/ foca a busca'); await js(`document.activeElement.blur(); true`);
  });

  await t('BOTÕES de zoom (+ − ajustar centralizar) e roda do mouse', async () => {
    await js(`fitGraph(); true`); await wait(250); const k0 = await js('gTrans.k');
    await js(`document.querySelector('#gZoomIn').click(); true`); const k1 = await js('gTrans.k'); ok(k1 > k0 * 1.25, 'zoom in'); await js(`document.querySelector('#gZoomOut').click(); true`); ok(Math.abs((await js('gTrans.k')) - k0) < 0.01);
    await js(`for (let i = 0; i < 30; i++) document.querySelector('#gZoomIn').click(); true`); ok((await js('gTrans.k')) <= 6.0001, 'limite superior'); await js(`for (let i = 0; i < 60; i++) document.querySelector('#gZoomOut').click(); true`); ok((await js('gTrans.k')) >= 0.0999, 'limite inferior');
    await js(`document.querySelector('#gFit').click(); true`); ok(Math.abs((await js('gTrans.k')) - k0) < 0.01, 'ajustar');
    for (const id of ['gZoomIn', 'gZoomOut', 'gFit', 'gCenter', 'gSideBtn']) ok(await js(`!!document.querySelector('#${id}').getAttribute('aria-label')`), 'sem aria-label: ' + id);
  });

  await t('ALVO DE TOQUE: o círculo de toque tem pelo menos ~14 px de raio na tela em qualquer zoom (mesmo com pontos minúsculos)', async () => {
    for (const k of [0.2, 0.5, 1, 3]) { await js(`gTrans.k = ${k}; applyT(); true`); await wait(150); const r = await js(`(() => { const e = document.querySelector('#gview .gn .ghit'); return e.getBBox().width / 2 * gTrans.k; })()`); ok(r >= 13.5, `k=${k}: raio de toque ${r.toFixed(1)}px`); }
    await js(`fitGraph(); true`);
  });

  await t('RESPONSIVO: a largura que vale é a DA REDE; estreita, o painel vira gaveta que abre ao selecionar; menus "Exibir" e "⋯" abrem/fecham (fora, Esc); Esc fecha a gaveta antes da rede', async () => {
    eq(await js('gNarrow()'), false, 'tela larga: painel lateral fixo'); eq(await js(`getComputedStyle(document.querySelector('#gSide')).position`), 'static');
    await js(`document.querySelector('#gViewPop > summary').click(); true`); await wait(150); ok(await js(`document.querySelector('#gViewPop').open && document.querySelector('#gHier').getBoundingClientRect().width > 0`), 'Exibir abre e mostra as opções');
    await js(`document.querySelector('#gMenu > summary').click(); true`); await wait(150); ok(await js(`document.querySelector('#gMenu').open && !document.querySelector('#gViewPop').open`), 'abrir um menu fecha o outro');
    key('Escape'); await wait(200); ok(!(await js(`document.querySelector('#gMenu').open`)) && (await js('graphOpen')), 'Esc fecha o menu e não a rede');
    await js(`document.querySelector('#gViewPop > summary').click(); true`); await wait(100); win.webContents.sendInputEvent({ type: 'mouseDown', x: 700, y: 400, button: 'left', clickCount: 1 }); win.webContents.sendInputEvent({ type: 'mouseUp', x: 700, y: 400, button: 'left', clickCount: 1 }); await wait(250); ok(!(await js(`document.querySelector('#gViewPop').open`)), 'clicar fora fecha');
    await size(820, 640); eq(await js('gNarrow()'), true, 'rede estreita');
    ok(await js(`getComputedStyle(document.querySelector('#gSearch')).display !== 'none' && getComputedStyle(document.querySelector('#gDensity')).display !== 'none' && getComputedStyle(document.querySelector('#gClose')).display !== 'none'`), 'busca, densidade e fechar seguem visíveis');
    const bar = await js(`document.querySelector('.g-bar').getBoundingClientRect().height`); ok(bar < 130, 'barra em poucas linhas: ' + bar + 'px');
    const sideOff = await js(`document.querySelector('#gSide').getBoundingClientRect().top >= document.querySelector('#gsvg').getBoundingClientRect().bottom - 1`); ok(sideOff, 'gaveta fechada fora da tela');
    const hub = await js(`[...gLast.nodes.keys()].filter((i) => gLast.adj[i].size >= 2)[0]`); await wait(300);
    ok(!(await js(`document.querySelector('#gSide').classList.contains('open')`)), 'não abre sozinha só por a rede ter aberto com um tópico selecionado');
    await js(`gSel = gLast.nodes[${hub}].id; renderGraph(false); true`); await wait(400); ok(await js(`document.querySelector('#gSide').classList.contains('open')`), 'abriu sozinha ao escolher um ponto'); const r = await js(`(() => { const b = document.querySelector('#gSide').getBoundingClientRect(), v = document.querySelector('#gsvg').getBoundingClientRect(); return { top: b.top, vb: v.bottom, h: b.height, ph: document.querySelector('#graph').clientHeight }; })()`); ok(r.top < r.vb && r.h <= r.ph * 0.53, 'gaveta visível e ≤ ~50% da altura ' + JSON.stringify(r));
    await c.shot(path.join(SHOTS, '04-estreito-gaveta.png'));
    key('Escape'); await wait(300); ok(!(await js(`document.querySelector('#gSide').classList.contains('open')`)), 'Esc fecha a gaveta'); ok(await js('graphOpen'), 'a rede continua aberta'); key('Escape'); await wait(300); ok(!(await js('graphOpen')), '2º Esc fecha a rede');
    await js(`gSel = null; true`); await size(1280, 800); await open();
    eq(await js('gNarrow()'), false); eq(await js(`getComputedStyle(document.querySelector('#gSide')).position`), 'static');
  });
  await t('REDIMENSIONAR mantém o mesmo ponto no centro; rótulos continuam sem sobreposição em qualquer tamanho', async () => {
    await clear(); await js(`fitGraph(); true`); await wait(300); const mid = await js(`(() => { const r = document.querySelector('#gsvg').getBoundingClientRect(); return { x: (r.width / 2 - gTrans.x) / gTrans.k, y: (r.height / 2 - gTrans.y) / gTrans.k }; })()`);
    for (const [w, h] of [[1000, 700], [1400, 900], [760, 560]]) { await size(w, h); const after = await js(`(() => { const r = document.querySelector('#gsvg').getBoundingClientRect(); return { x: (r.width / 2 - gTrans.x) / gTrans.k, y: (r.height / 2 - gTrans.y) / gTrans.k }; })()`); ok(Math.hypot(after.x - mid.x, after.y - mid.y) < 3 / (await js('gTrans.k')) + 1, `centro ${w}x${h}: ${JSON.stringify(after)} vs ${JSON.stringify(mid)}`); const s = await labelStats(); eq(s.clash, 0, `sem sobreposição em ${w}x${h}`); }
    await size(1280, 800);
  });

  await t('DESEMPENHO: atualizar rótulos e redesenhar o grafo denso é rápido; arrastar/zoom não trava', async () => {
    const r = await js(`(() => { const a = performance.now(); for (let i = 0; i < 20; i++) updateLabels(); const t1 = (performance.now() - a) / 20; const b = performance.now(); renderGraph(false); const t2 = performance.now() - b; return { updateLabels: Math.round(t1 * 10) / 10, render: Math.round(t2) }; })()`);
    ok(r.updateLabels < 60 && r.render < 900, JSON.stringify(r)); fs.writeFileSync(path.join(SHOTS, 'desempenho.json'), JSON.stringify({ nos: await js('gLast.nodes.length'), ...r }, null, 1));
  });

  await t('Enter abre o tópico selecionado; Esc fecha a rede; nenhum erro de console', async () => {
    const target = await js(`gLast.nodes.findIndex((n) => n.kind === 'topic' && n.mapKey === curKey())`); await js(`gSel = gLast.nodes[${target}].id; renderGraph(false); true`); key('Enter'); await wait(500);
    ok(!(await js('graphOpen')), 'abrir o tópico fecha a rede'); await open(); key('Escape'); await wait(300); ok(!(await js('graphOpen')));
    eq(c.errors, [], 'erros de console');
  });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
