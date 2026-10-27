'use strict';
// QA exaustivo, funcionalidade por funcionalidade, com ENTRADA REAL (mouse/teclado enviados ao Chromium) e uma
// captura por funcionalidade.  `npm run qa`  =>  evidencias/qa/*.png + RELATORIO-QA.md
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { BrowserWindow, app } = require('electron');
const start = require('./harness');
const { MindMap, createNode } = require('../core/model');
const { writeMom, readMom } = require('../core/mom');
const { TODAY, d, concurso } = require('./fixtures');
const S = require('../core/study');

const OUT = path.join(__dirname, '..', 'evidencias', 'qa');

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  const c = await start('MindCraft — QA exaustivo por funcionalidade');
  const { wait, eq, ok, win, TMP, USERDATA } = c;
  // js(): executa na página e, se lançar, devolve a PILHA REAL do erro (o executeJavaScript só diz "Script failed to execute")
  const js = async (code) => {
    const r = await c.js(`(async () => { try { return await eval(${JSON.stringify(code)}); } catch (e) { return { __err: String((e && e.stack) || e) }; } })()`);
    if (r && typeof r === 'object' && r.__err) throw new Error('PÁGINA: ' + r.__err.split('\n').slice(0, 2).join(' ⏎ ') + '  ⟵ ' + code.slice(0, 90).replace(/\s+/g, ' '));
    return r;
  };
  win.setSize(1500, 920); await wait(500);
  const rows = [], metrics = [];
  let n = 0;
  const pad = (k) => String(k).padStart(2, '0');
  const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);

  // ---------- entrada real ----------
  const needClip = async () => { if (!(await c.clipboardOk())) throw Object.assign(new Error('ignorado: a área de transferência do sistema está indisponível neste ambiente (não é falha do app)'), { skip: true }); };
  const ev = (o) => win.webContents.sendInputEvent(o);
  const md = (x, y, o = {}) => ev({ type: 'mouseDown', x: Math.round(x), y: Math.round(y), button: 'left', clickCount: o.cc || 1, modifiers: o.mods || [] });
  const mu = (x, y, o = {}) => ev({ type: 'mouseUp', x: Math.round(x), y: Math.round(y), button: 'left', clickCount: o.cc || 1, modifiers: o.mods || [] });
  const mv = (x, y, o = {}) => ev({ type: 'mouseMove', x: Math.round(x), y: Math.round(y), modifiers: o.mods || [] });
  const click = async (x, y, o = {}) => { mv(x, y); md(x, y, o); mu(x, y, o); await wait(70); };
  const dbl = async (x, y) => { mv(x, y); md(x, y); mu(x, y); md(x, y, { cc: 2 }); mu(x, y, { cc: 2 }); await wait(120); };
  const drag = async (a, b, o = {}) => { mv(a.x, a.y); md(a.x, a.y, o); await wait(30); for (let i = 1; i <= 6; i++) { mv(a.x + ((b.x - a.x) * i) / 6, a.y + ((b.y - a.y) * i) / 6, o); await wait(15); } mu(b.x, b.y, o); await wait(90); };
  const focusWin = () => { if (!win.isFocused()) { win.show(); win.focus(); } win.webContents.focus(); };   // o Chromium descarta teclas se a janela perdeu o foco do SO
  const key = async (keyCode, mods = []) => { focusWin(); ev({ type: 'keyDown', keyCode, modifiers: mods }); ev({ type: 'keyUp', keyCode, modifiers: mods }); await wait(110); };
  const type = async (text) => { await win.webContents.insertText(text); await wait(50); };
  const wheel = async (x, y, dy) => { focusWin(); mv(x, y); ev({ type: 'mouseWheel', x, y, deltaX: 0, deltaY: dy }); await wait(120); };
  /** Gira a roda até `cond()` ficar verdadeira (até 3 tentativas): o evento é assíncrono. */
  const wheelUntil = async (x, y, dy, cond) => { for (let i = 0; i < 3; i++) { await wheel(x, y, dy); try { await c.waitFor(cond, 1200, 60); return true; } catch { /* tenta de novo */ } } return false; };
  const rectOf = (sel) => js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; if (e.scrollIntoView && e.closest('#home')) e.scrollIntoView({ block: 'nearest' }); const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height }; })()`);
  const clickSel = async (sel, o) => { const r = await rectOf(sel); if (!r) throw new Error('elemento não encontrado: ' + sel); await click(r.x, r.y, o); };
  const P = (title) => js(`__pt(__id(${JSON.stringify(title)}))`);
  const clickNode = async (title, o) => { const p = await P(title); await click(p.x, p.y, o); };
  const blank = async () => { const r = await rectOf('#svg'); await click(r.x - r.w / 2 + 70, r.y + r.h / 2 - 50); };   // canto vazio do mapa
  const sel = () => js(`map.find(selectedId) ? map.find(selectedId).node.title : null`);
  const val = (s) => js(`document.querySelector(${JSON.stringify(s)}).value`);
  const txt = (s) => js(`document.querySelector(${JSON.stringify(s)}).textContent`);
  const setVal = (s, v, e = 'input') => js(`(() => { const x = document.querySelector(${JSON.stringify(s)}); x.value = ${JSON.stringify(v)}; x.dispatchEvent(new Event('${e}', { bubbles: true })); })()`);
  const titles = () => js('__titles()');
  const N = (t) => `map.find(__id(${JSON.stringify(t)})).node`;
  const reset = async () => { focusWin(); await js(`if (!editor.hidden) endEdit(false); closeGraph && closeGraph(); closeDash && closeDash(); const m = document.querySelector('#modal'); m.hidden = true; m.textContent = ''; document.activeElement && document.activeElement.blur(); window.__today = '${TODAY}'; showPanel('props'); setLight(false); true`); };

  // ---------- visualização de arquivos exportados (para a captura) ----------
  async function peek(file, kind) {
    const w = new BrowserWindow({ width: 1100, height: 760, show: false, webPreferences: { plugins: true } });
    try {
      if (kind === 'text') {
        const t = fs.readFileSync(file, 'utf8');
        await w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`<body style="font:13px Consolas,monospace;background:#1e1e1e;color:#ddd;padding:18px;white-space:pre-wrap"><b style="color:#7cc4ff">${path.basename(file)}</b>\n\n${t.replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 4500)}</body>`));
      } else await w.loadFile(file);
      await wait(kind === 'pdf' ? 1800 : 500);
      return (await w.webContents.capturePage()).toPNG();
    } finally { w.destroy(); }
  }
  async function peekHtml(html) {
    const w = new BrowserWindow({ width: 1100, height: 700, show: false });
    try { await w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html)); await wait(400); return (await w.webContents.capturePage()).toPNG(); } finally { w.destroy(); }
  }
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  // ---------- registro por funcionalidade ----------
  const only = process.env.QA_ONLY ? process.env.QA_ONLY.split(',').map(Number) : null;   // depuração: QA_ONLY=1,2 roda só esses casos
  async function feature(group, title, how, fn) {
    n++;
    if (only && !only.includes(n)) return;
    const files = [];
    const shot = async (suffix, png) => {
      const f = `${pad(n)}${suffix ? '_' + suffix : ''}_${slug(title)}.png`;
      if (png) fs.writeFileSync(path.join(OUT, f), png); else await c.shot(path.join(OUT, f));
      files.push(f);
    };
    let status = 'OK', note = '';
    try {
      await reset();
      const tab = /Estudei|Cronômetro|Minutos e questões|Estudo em lote/.test(title) ? 'study' : /Conexões|Menção|fantasma/.test(title) ? 'links' : /Autocompletar|Notas do tópico/.test(title) ? 'notes' : /Estrutura/.test(title) ? 'outline' : null;
      if (tab) await clickSel(`#ptabs [data-tab="${tab}"]`);
      if (/^(Estudos|Rede)$/.test(group) && !/Modelo de concurso|Importar edital|Grafo|Navegar|Obsidian/.test(title)) await openMain();   // estado conhecido
      const r = await Promise.race([fn({ shot }), new Promise((_, rej) => setTimeout(() => rej(new Error('tempo limite da funcionalidade (70 s)')), 70000))]);
      if (typeof r === 'string') note = r;
    } catch (e) {
      status = e && e.skip ? 'IGNORADO' : 'FALHA'; note = String(e.message).split('\n')[0];
      // uma falha não pode deixar sobreposições abertas (grafo, painel, janela, tela inicial) bloqueando os casos seguintes
      try { await js("(() => { try { if (typeof closeGraph === 'function') closeGraph(); } catch {} try { closeDash(); } catch {} try { if (!document.querySelector('#modal').hidden) closeModal(); } catch {} try { if (window.MCReact) { MCReact.closeHome(); if (MCReact.pdfIsOpen()) MCReact.closePdf(); } } catch {} return true; })()"); } catch { /* sem página */ }
    }
    if (!files.length) { try { await shot(); } catch { /* sem captura */ } }
    rows.push({ n, group, title, how, status, note, files });
    console.log(`  ${status === 'OK' ? 'ok  ' : status === 'IGNORADO' ? 'SKIP' : 'FAIL'} ${pad(n)} ${group} › ${title}${note && status !== 'OK' ? '\n         ' + note : ''}`);
  }

  // ---------- dados de apoio ----------
  const vault = path.join(TMP, 'estudos'); fs.mkdirSync(vault, { recursive: true });
  const { m: main } = concurso();
  const fMain = path.join(vault, 'Concurso TRF 2026.mom'); writeMom(main, fMain);
  const mk = (name, build) => { const m = new MindMap(createNode(name)); build(m); const f = path.join(vault, name + '.mom'); writeMom(m, f); return f; };
  mk('Resumos de Português', (m) => { const a = m.addChild(m.root.id, 'Resumo de crase'); const b = m.addChild(m.root.id, 'Resumo de regência'); m.addChild(m.root.id, 'Pegadinhas de concordância'); m.update(a.id, { notes: 'Detalhes em [[Concurso TRF 2026#Crase]]. Cai junto com [[Resumo de regência]].' }); m.update(b.id, { notes: 'Ver [[Concurso TRF 2026#Regência]].' }); });
  mk('Questões comentadas', (m) => { const a = m.addChild(m.root.id, 'Questões de Direito Constitucional'); const b = m.addChild(m.root.id, 'Questões de Administrativo'); m.addChild(m.root.id, 'Erros recorrentes'); m.update(a.id, { notes: 'Foco em [[Concurso TRF 2026#Princípios fundamentais]] e [[Concurso TRF 2026#Direitos fundamentais]].' }); m.update(b.id, { notes: 'Revisar [[Concurso TRF 2026#Atos administrativos]] e [[Concurso TRF 2026#Licitações]]. Anotar em [[Erros recorrentes]].' }); });
  const openMain = async () => { await js(`window.__today = '${TODAY}'; (async () => { dirty = false; await openPath(${JSON.stringify(fMain)}); render(); fit(); })()`); await c.waitFor(() => js(`filePath && path.basename(filePath) === 'Concurso TRF 2026.mom'`)); await wait(250); };
  const freshMap = async () => { await reset(); await js(`dirty = false; newMap()`); await wait(150); };
  await js(`window.__gclick = (t) => { const n = __gn(t); n.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 5, clientY: 5 })); window.dispatchEvent(new MouseEvent('mouseup')); }; true`);
  await js(`window.__today = '${TODAY}'; window.__gn = (t) => [...document.querySelectorAll('#gview .gn')].find((x) => x.querySelector('title').textContent.split(' — ')[0].replace(' (não existe)', '') === t); true`);

  console.log('\n— MAPA: edição —\n');
  await feature('Mapa', 'Novo mapa (menu Arquivo › Novo)', 'Mensagem de menu "new" → mapa com raiz e 3 tópicos', async () => {
    win.webContents.send('menu', 'new'); await wait(300);
    eq((await titles()).length, 4, 'tópicos do mapa novo'); eq(await js('dirty'), false);
  });
  await feature('Mapa', 'Tab cria tópico filho; digitar e Enter confirma', 'Clique real no tópico → Tab → texto → Enter', async () => {
    await clickNode('Tópico 1'); await key('Tab'); ok(await js('!editor.hidden'), 'editor aberto'); await type('Filho criado pelo teclado'); await key('Enter');
    await c.waitFor(() => js('editor.hidden')); ok((await titles()).includes('2:Filho criado pelo teclado'), 'filho criado'); ok(await js('editor.hidden'), 'editor fechado');
  });
  await feature('Mapa', 'Enter cria tópico irmão', 'Seleciona o filho → Enter → texto → Enter', async () => {
    await clickNode('Filho criado pelo teclado'); await key('Enter'); await c.waitFor(() => js('!editor.hidden')); await type('Irmão criado'); await key('Enter'); await c.waitFor(() => js('editor.hidden'));
    ok((await titles()).includes('2:Irmão criado'), 'irmão criado no mesmo nível');
  });
  await feature('Mapa', 'F2 edita o tópico e Esc cancela', 'Clique → F2 → texto → Esc', async () => {
    await clickNode('Tópico 3'); await key('F2'); ok(await js('!editor.hidden'), 'editor abriu'); await type('NÃO DEVE SALVAR'); await key('Escape');
    ok(!(await titles()).some((x) => x.includes('NÃO DEVE')), 'Esc descartou'); ok((await titles()).includes('1:Tópico 3'));
  });
  await feature('Mapa', 'Duplo clique edita o título (mouse real)', 'Duplo clique real (2 cliques seguidos) sobre o tópico', async () => {
    const p = await P('Tópico 2'); await dbl(p.x, p.y);
    ok(await js('!editor.hidden'), 'o duplo clique REAL deve abrir o editor (o DOM é recriado entre os cliques)');
    await type('Tópico 2 renomeado'); await key('Enter'); ok((await titles()).includes('1:Tópico 2 renomeado'));
  });
  await feature('Mapa', 'Excluir, Desfazer e Refazer', 'Delete real; botões ↶ ↷ da barra de ferramentas', async ({ shot }) => {
    await clickNode('Irmão criado'); const n0 = (await titles()).length; await key('Delete'); eq((await titles()).length, n0 - 1, 'excluiu');
    await js('act.undo()'); eq((await titles()).length, n0, 'desfez'); await js('act.redo()'); eq((await titles()).length, n0 - 1, 'refez');
    await js('act.undo()'); eq((await titles()).length, n0);
  });
  await feature('Mapa', 'Recolher e expandir ramo (Espaço)', 'Seleciona "Tópico 1" → Espaço → contador no ramo', async ({ shot }) => {
    await clickNode('Tópico 1'); await key('Space'); ok(await js(`${N('Tópico 1')}.collapsed`), 'recolhido');
    const nf = await js(`${N('Tópico 1')}.children.length`); ok(await js(`[...view.querySelectorAll('text')].some((t) => t.textContent === ${JSON.stringify(String(nf))})`), 'contador de filhos escondidos = ' + nf); await shot('recolhido');
    await key('Space'); ok(!(await js(`${N('Tópico 1')}.collapsed`)), 'expandido');
  });
  await feature('Mapa', 'Arrastar tópico para dentro de outro (mover)', 'Arrasto real com 6 passos intermediários', async () => {
    const a = await P('Irmão criado').catch(() => null);
    await js('act.fit()'); await clickNode('Tópico 1'); const A = await P('Filho criado pelo teclado'), B = await P('Tópico 3');
    await js(`window.__rec = []; if (!window.__recOn) { window.__recOn = true; for (const t of ['mousedown', 'mousemove', 'mouseup']) window.addEventListener(t, (e) => { if (window.__rec.length < 40) window.__rec.push(t[5] + ':' + Math.round(e.clientX) + ',' + Math.round(e.clientY) + ':' + (e.target.closest && e.target.closest('.node') ? 'nó' : e.target.tagName)); }, true); } true`);
    await drag(A, B);
    const pai = await js(`map.find(__id('Filho criado pelo teclado')).parent.title`);
    if (pai !== 'Tópico 3') throw new Error(`pai=${pai}; A=${JSON.stringify(A)} B=${JSON.stringify(B)}; eventos=${JSON.stringify(await js('window.__rec'))}; drag=${await js('JSON.stringify(drag)')}; status=${await txt('#status')}`);
    void a;
  });
  await feature('Mapa', 'Relação entre tópicos com rótulo; selecionar e excluir', 'R → clique no destino → digitar rótulo → clicar na seta → Delete', async ({ shot }) => {
    await clickNode('Tópico 2 renomeado'); await key('R'); ok(await js(`document.body.classList.contains('relating')`), 'modo relação');
    await clickNode('Tópico 3'); eq(await js('map.meta.relations.length'), 1); ok(await js('document.activeElement === notes'), 'foco no painel do rótulo');
    await type('contradiz'); await shot('rotulo'); await blank(); // clique no vazio do mapa: tira o foco do campo e confirma o rótulo
    eq(await js('map.meta.relations[0].label'), 'contradiz');
    const pr = await js(`(() => { const p = view.querySelector('.rel path:last-of-type'); const b = view.querySelector('.rel').getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; })()`);
    const hit = await js(`(() => { const r = view.querySelector('.rel path'); const L = r.getTotalLength(); const m = r.getScreenCTM(); const pt = r.getPointAtLength(L / 2); const s = svg.createSVGPoint(); s.x = pt.x; s.y = pt.y; const q = s.matrixTransform(m); return { x: q.x, y: q.y }; })()`);
    await click(hit.x, hit.y); ok(await js('!!selectedRel'), 'relação selecionada pelo clique'); await key('Delete'); eq(await js('map.meta.relations.length'), 0, 'excluída'); void pr;
  });
  await feature('Mapa', 'Marcadores e progresso (chips)', 'Clique real nos chips da barra Propriedades', async () => {
    await clickNode('Tópico 3'); await clickSel('#markerChips [data-marker="star"]'); await clickSel('#markerChips [data-marker="p1"]'); await clickSel('#progressChips [data-value="75"]');
    eq(await js(`${N('Tópico 3')}.markers`), ['star', 'p1']); eq(await js(`${N('Tópico 3')}.progress`), 75);
    await clickSel('#markerChips [data-marker="p1"]'); eq(await js(`${N('Tópico 3')}.markers`), ['star'], 'clicar de novo remove');
  });
  await feature('Mapa', 'Cor, forma e negrito do tópico', 'Seletor de cor (valor injetado: o diálogo nativo não é automatizável), forma e botão B reais', async () => {
    await clickNode('Tópico 3'); await setVal('#fill', '#c0392b'); await js(`(() => { const s = document.querySelector('#shape'); s.value = 'rect'; s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
    await clickSel('[data-act="bold"]'); const st = await js(`${N('Tópico 3')}.style`);
    eq([st.fill, st.shape, st.bold], ['#c0392b', 'rect', false], 'o tema já é negrito: o botão desliga');
  });
  await feature('Mapa', 'Notas do tópico', 'Clique real no painel, digitar, clicar fora', async ({ shot }) => {
    await clickNode('Tópico 3'); await clickSel('#ptabs [data-tab="notes"]'); await clickSel('#notes'); await type('Anotação de teste com acentuação: ação, coração.'); await blank();
    eq(await js(`${N('Tópico 3')}.notes`), 'Anotação de teste com acentuação: ação, coração.'); ok(await js(`view.querySelectorAll('.note-icon').length >= 1`), 'ícone de nota no mapa');
  });
  await feature('Mapa', 'Notas em Markdown: barra de formatação, Visualizar, tarefas e [[link]] clicável', 'Cliques e digitação reais; Ctrl+A; botões da barra; caixa de tarefa e link na visualização', async ({ shot }) => {
    await clickNode('Tópico 3'); await clickSel('#ptabs [data-tab="notes"]'); await clickSel('#notes'); await key('A', ['control']); await clickSel('#notesBar [data-fmt="bold"]');
    eq(await js(`${N('Tópico 3')}.notes`), '**Anotação de teste com acentuação: ação, coração.**', 'negrito pela barra');
    const alvo = await js('map.root.children[0].title'); await clickSel('#notes'); await key('A', ['control']);
    await type(`# Plano de estudo\nLer [[${alvo}]] e **revisar** a *crase*\n- [ ] resumo\n- [ ] 20 questões\n\n| Dia | Meta |\n|---|---|\n| seg | 10 q |`);
    await shot('editando'); await clickSel('#nmView'); await wait(150); await shot('visualizar');
    ok(await js("document.querySelector('#notesView h1') && document.querySelector('#notesView table') && document.querySelectorAll('#notesView input[type=checkbox]').length === 2"), 'renderizou');
    await clickSel('#notesView input[type=checkbox]'); ok((await js(`${N('Tópico 3')}.notes`)).includes('- [x] resumo'), 'tarefa marcada pelo clique'); await shot('tarefa-marcada');
    await clickSel('#notesView a.wl'); await wait(200); eq(await js('map.find(selectedId).node.title'), alvo, 'o link abriu o tópico');
    await clickNode('Tópico 3'); await wait(150); await clickSel('#nmEdit'); ok(await js("!document.querySelector('#notes').hidden"), 'voltou a editar'); eq((await js('document.querySelector("#notes").value')).split('\n')[0], '# Plano de estudo');
  });
  await feature('Mapa', 'Relação desenhada = conexão: aparece em Conexões nos dois tópicos e some ao excluir', 'R + clique no destino; aba Conexões; clique na seta + Delete', async ({ shot }) => {
    await clickNode('Tópico 2 renomeado'); await key('R'); await clickNode('Tópico 3'); eq(await js('map.meta.relations.length'), 1); await type('reforça'); await blank();
    const rows = () => js("[...document.querySelectorAll('#linksBody .lk')].map((r) => [...r.querySelectorAll('.t, .m')].map((x) => x.textContent).join(' | '))");
    await clickNode('Tópico 2 renomeado'); await clickSel('#ptabs [data-tab="links"]'); await c.waitFor(async () => (await rows()).length >= 1);
    eq(await rows(), ['Tópico 3 | seta · reforça'], 'saída'); await shot('saida');
    await clickNode('Tópico 3'); await c.waitFor(async () => (await rows()).some((r) => r.startsWith('Tópico 2 renomeado'))); ok((await rows()).includes('Tópico 2 renomeado | seta · reforça'), 'retrolink'); await shot('retrolink');
    const hit = await js(`(() => { const r = view.querySelector('.rel path'); const L = r.getTotalLength(); const m = r.getScreenCTM(); const pt = r.getPointAtLength(L / 2); const s = svg.createSVGPoint(); s.x = pt.x; s.y = pt.y; const q = s.matrixTransform(m); return { x: q.x, y: q.y }; })()`);
    await click(hit.x, hit.y); await key('Delete'); eq(await js('map.meta.relations.length'), 0); await clickNode('Tópico 3'); await c.waitFor(async () => !(await rows()).some((r) => /seta/.test(r)));
    await clickSel('#ptabs [data-tab="notes"]');
  });
  await feature('Mapa', 'Cinco temas visuais (cartões)', 'Clique real em cada cartão de tema', async ({ shot }) => {
    for (const t of ['dark', 'paper', 'neon', 'mono', 'ocean']) { await clickSel(`.theme-card[data-theme="${t}"]`); eq(await js('map.meta.theme'), t); await wait(150); await shot(t); }
  });
  await feature('Mapa', 'Busca no mapa', 'Clique real na caixa, digitar, Enter navega, Esc limpa', async () => {
    await clickSel('#search'); await type('tópico'); ok((await js('hitList.length')) >= 2, 'resultados'); await key('Enter'); ok(await js('!!selectedId'), 'selecionou resultado');
    await key('Escape'); eq(await val('#search'), '', 'Esc limpa');
  });
  await feature('Mapa', 'Zoom (roda e controle), pan e ajustar', 'Roda do mouse real, arrastar o fundo, botão Ajustar', async ({ shot }) => {
    const k0 = await js('pan.k'); const r = await rectOf('#svg'); ok(await wheelUntil(r.x, r.y, 240, async () => (await js('pan.k')) > k0), 'zoom in pela roda (deltaY do Chromium é invertido em relação ao DOM)');
    const x0 = await js('pan.x'); await drag({ x: r.x - 300, y: r.y + 250 }, { x: r.x - 200, y: r.y + 270 }); ok((await js('pan.x')) !== x0, 'pan arrastando o fundo');
    await js('act.fit()'); ok(Math.abs((await js('pan.k')) - k0) < 0.3, 'ajustar volta ao enquadramento');
  });
  await feature('Mapa', 'Estrutura (outline): selecionar e recolher', 'Clique real nas linhas e no triângulo', async () => {
    const rows0 = await js(`document.querySelectorAll('.ol-row').length`);
    const r = await rectOf('.ol-row:nth-child(2)'); await click(r.x, r.y); ok(await js('!!selectedId'));
    const tog = await rectOf('.ol-tog[data-ol-tog]'); await click(tog.x, tog.y);
    ok((await js(`document.querySelectorAll('.ol-row').length`)) < rows0, 'recolher na estrutura oculta linhas'); await click(tog.x, tog.y);
  });
  await feature('Mapa', 'Abas do painel lateral e tema claro da interface', 'Clique real em cada aba (uma por vez) e no botão do sol', async ({ shot }) => {
    await clickNode('Tópico 1');
    for (const t of ['props', 'study', 'notes', 'links', 'outline']) { await clickSel(`#ptabs [data-tab="${t}"]`); eq(await js(`[...document.querySelectorAll('#panels .panel')].filter((p) => !p.hidden).map((p) => p.dataset.panel)`), [t]); await shot('aba-' + t); }
    await clickSel('#ptabs [data-tab="props"]');
    await clickSel('#lightToggle'); ok(await js(`document.body.classList.contains('light')`)); await wait(150); await shot('claro'); await clickSel('#lightToggle');
  });

  await feature('Mapa', 'Tópico sublinhado é clicável em toda a caixa (não só nas letras)', 'Cliques reais no canto esquerdo e no canto direito da caixa de um tópico de nível 3', async ({ shot }) => {
    await openMain(); await js('act.fit()');
    for (const [titulo, rel] of [['Crase', 0.06], ['Crase', 0.94], ['Redes', 0.05]]) {
      await blank(); const p = await js(`(() => { const b = L.boxes.get(__id(${JSON.stringify(titulo)})); return { x: (b.x + b.w * ${rel}) * pan.k + pan.x + svg.getBoundingClientRect().left, y: (b.y + b.h / 2) * pan.k + pan.y + svg.getBoundingClientRect().top, shape: b.style.shape }; })()`);
      eq(p.shape, 'underline', 'o teste exige um tópico sublinhado'); await click(p.x, p.y); eq(await sel(), titulo, `clique a ${Math.round(rel * 100)}% da largura de "${titulo}"`);
    }
  });
  await feature('Mapa', 'Tópico novo fora da vista é trazido para a tela', 'Zoom alto, tópico colado na borda direita, Tab: o editor deve ficar visível', async ({ shot }) => {
    await freshMap(); await js(`pan.k = 3; render(); const b = L.boxes.get(__id('Tópico 1')); const r = svg.getBoundingClientRect(); pan.x = r.width - 30 - (b.x + b.w) * pan.k; pan.y = r.height / 2 - (b.y + b.h / 2) * pan.k; render()`);
    await clickNode('Tópico 1'); await key('Tab'); await type('Filho além da borda'); await shot('digitando');
    const v = await js(`(() => { const e = editor.getBoundingClientRect(), r = svg.getBoundingClientRect(); return { dentro: e.left >= r.left - 1 && e.right <= r.right + 1 && e.top >= r.top - 1 && e.bottom <= r.bottom + 1, e: [Math.round(e.left), Math.round(e.right)], r: [Math.round(r.left), Math.round(r.right)] }; })()`);
    ok(v.dentro, 'o editor ficou fora da área visível ' + JSON.stringify(v)); await key('Enter');
  });

  await feature('Mapa', 'Níveis: recolher e expandir o mapa por profundidade', 'Seletor "Níveis" da barra de opções; um único desfazer', async ({ shot }) => {
    await openMain(); const total = await js('L.boxes.size'); const lv = (v) => js(`(() => { const s = document.querySelector('#levelSel'); s.value = '${v}'; s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
    await lv('1'); await wait(250); eq(await js('L.boxes.size'), 5, 'nível 1: raiz + 4 disciplinas'); await shot('nivel-1');
    await lv('2'); await wait(250); ok((await js('L.boxes.size')) > 5 && (await js('L.boxes.size')) <= total, 'nível 2 mostra os tópicos'); await shot('nivel-2');
    await lv('all'); await wait(250); eq(await js('L.boxes.size'), total, 'expandir tudo'); await js('act.undo()'); eq(await js('L.boxes.size') < total, true, 'desfazer volta ao estado anterior');
  });
  await feature('Mapa', 'Editor inline cresce com títulos longos (não corta a 1ª linha)', 'Tab + texto de 3 linhas em zoom alto', async ({ shot }) => {
    await freshMap(); await js('pan.k = 2.2; render()'); await clickNode('Tópico 1'); await key('Tab');
    await type('Um título bem comprido para forçar a quebra em várias linhas dentro do editor do tópico, sem esconder o começo do texto'); await shot('digitando');
    const e = await js(`({ sh: editor.scrollHeight, ch: editor.clientHeight, top: editor.scrollTop })`); ok(e.sh <= e.ch + 3 && e.top === 0, 'texto cortado dentro do editor: ' + JSON.stringify(e));
    const v = await js(`(() => { const q = editor.getBoundingClientRect(), r = svg.getBoundingClientRect(); return { dentro: q.left >= r.left - 1 && q.right <= r.right + 1 && q.top >= r.top - 1 && q.bottom <= r.bottom + 1, w: Math.round(q.width), h: Math.round(q.height) }; })()`);
    ok(v.dentro, 'o editor deve ficar dentro da área visível: ' + JSON.stringify(v)); ok(v.w >= 300, 'o campo deve alargar para o texto não virar uma coluna de uma palavra por linha: ' + v.w + ' px'); await key('Enter');
  });

  console.log('\n— SELEÇÃO E EDIÇÃO EM LOTE —\n');
  await feature('Lote', 'Seleção múltipla: Ctrl+clique e retângulo (Shift)', 'Ctrl+clique real; Shift+arrasto real no fundo', async ({ shot }) => {
    await freshMap(); await clickNode('Tópico 1'); await clickNode('Tópico 2', { mods: ['control'] }); eq(await js('selIds.size'), 2); await clickNode('Tópico 2', { mods: ['control'] }); eq(await js('selIds.size'), 1, 'Ctrl+clique retira');
    const r = await rectOf('#svg'); await drag({ x: r.x - r.w / 2 + 6, y: r.y - r.h / 2 + 6 }, { x: r.x + r.w / 2 - 6, y: r.y + r.h / 2 - 6 }, { mods: ['shift'] });
    eq(await js('selIds.size === L.boxes.size'), true, 'retângulo pegou todos'); await shot('retangulo');
  });
  await feature('Lote', 'Formatar vários de uma vez e desfazer em 1 passo', 'Chips e botão B com vários selecionados; Ctrl+Z (botão)', async () => {
    await clickNode('Tópico 1'); await clickNode('Tópico 3', { mods: ['control'] }); await clickSel('#progressChips [data-value="50"]'); await clickSel('#markerChips [data-marker="ok"]');
    for (const t of ['Tópico 1', 'Tópico 3']) { eq(await js(`${N(t)}.progress`), 50, t); eq(await js(`${N(t)}.markers`), ['ok'], t); }
    await js('act.undo()'); await js('act.undo()'); eq(await js(`${N('Tópico 1')}.progress`), null);
  });
  await feature('Lote', 'Copiar, colar e recortar tópicos (menu)', 'Itens Copiar/Colar/Recortar do menu nativo', async () => {
    await needClip();
    await clickNode('Tópico 1'); c.menu('copy'); await wait(120); await clickNode('Tópico 2'); c.menu('paste'); await wait(150);
    eq(await js(`${N('Tópico 2')}.children.map((x) => x.title)`), ['Tópico 1'], 'colou como filho'); await js('act.undo()');
    await clickNode('Tópico 3'); c.menu('cut'); await wait(150); ok(!(await titles()).includes('1:Tópico 3'), 'recortou'); await js('act.undo()');
  });
  await feature('Lote', 'Colar um texto externo como ramos', 'Área de transferência com lista numerada → Colar', async () => {
    await needClip();
    await c.writeClip('1 Direito Penal\n1.1 Crimes contra a pessoa\n2 Processo Penal'); await clickNode('Tópico 1'); c.menu('paste'); await wait(200);
    eq(await js(`${N('Tópico 1')}.children.map((x) => x.title)`), ['Direito Penal', 'Processo Penal']);
  });

  console.log('\n— ASSISTENTE DE ESTUDO (novas funções) —\n');
  const csvDir = path.join(TMP, 'csv'); fs.mkdirSync(csvDir, { recursive: true });
  const csvOpen = async (file) => { await js(`window.__dlg.csv = ${JSON.stringify(file)}; dirty = false; ipcRenderer.emit('menu', {}, 'csv')`); await c.waitFor(() => js(`!document.querySelector('#modal').hidden && !!document.querySelector('#csvPick')`)); await clickSel('#csvPick'); await c.waitFor(() => js(`!document.querySelector('#csvPreview').hidden`)); };
  await feature('Estudos', 'CSV da IA: importar o modelo e receber o esqueleto do mapa', 'Menu → Escolher arquivo (clique real) → prévia → Criar o mapa', async ({ shot }) => {
    const f = path.join(csvDir, 'edital-modelo.csv'); fs.writeFileSync(f, require('../core/csv').csvTemplate()); await csvOpen(f); await shot('previa');
    ok((await txt('#csvPreview')).includes('7 tópicos em 3 disciplina(s) · prova em 29/11/2026'), await txt('#csvPreview'));
    await clickSel('#csvOk'); await c.waitFor(() => js(`map.root.title === 'TRF 2ª Região — Analista'`)); await wait(250);
    eq(await js('map.root.children.length'), 3); eq(await js('map.meta.exam.date'), '2026-11-29'); await shot('mapa');
  });
  await feature('Estudos', 'CSV da IA: arquivo com problemas mostra erros e avisos antes de importar', 'CSV com linhas sem disciplina/tópico, peso e data inválidos', async ({ shot }) => {
    const f = path.join(csvDir, 'edital-sujo.csv'); fs.writeFileSync(f, 'disciplina;item;topico;peso;data_prova\nDireito;1;Princípios;9;31/02/2026\n;2;Sem disciplina;;\nDireito;3;;;\nDireito;1.1;Direitos;3;\nDireito;1.1.1;Remédios;;\n', 'latin1');
    await csvOpen(f); const p = await txt('#csvPreview'); await shot('previa-com-erros');
    ok(p.includes('3 tópicos em 1 disciplina(s)') && p.includes('2 linha(s) puladas') && p.includes('Linha 3:') && p.includes('Linha 4:') && p.includes('peso "9" inválido') && p.includes('data da prova inválida'), p);
    await clickSel('#csvCancel'); ok(await js("document.querySelector('#modal').hidden"));
  });
  await feature('Estudos', 'CSV da IA: copiar as instruções e salvar o modelo de exemplo', 'Botões da janela de importação', async ({ shot }) => {
    await js(`dirty = false; ipcRenderer.emit('menu', {}, 'csv')`); await c.waitFor(() => js("!!document.querySelector('#csvPick')"));
    const tpl = path.join(csvDir, 'modelo-salvo.csv'); await js(`window.__dlg.save = ${JSON.stringify(tpl)}`);
    await clickSel('#csvTemplate'); await c.waitFor(() => fs.existsSync(tpl)); eq(fs.readFileSync(tpl, 'utf8'), require('../core/csv').csvTemplate());
    await clickSel('#csvPrompt'); ok((await txt('#csvMsg')).includes('Instruções copiadas')); await shot();
    await clickSel('#csvCancel');
  });
  await feature('Estudos', 'Planilha de planejamento: exportar, editar fora do app, importar com prévia e aplicar', 'Janela da planilha; cliques reais; arquivo editado em disco', async ({ shot }) => {
    const { parseCsv } = require('../core/csv'); const pdir = path.join(TMP, 'plano'); fs.mkdirSync(pdir, { recursive: true });
    await js(`dirty = false; ipcRenderer.emit('menu', {}, 'plan')`); await c.waitFor(() => js("!!document.querySelector('#planExport')")); await shot('janela');
    const out = path.join(pdir, 'planejamento.csv'); await js(`window.__dlg.save = ${JSON.stringify(out)}`); await clickSel('#planExport'); await c.waitFor(() => fs.existsSync(out));
    const { rows } = parseCsv(fs.readFileSync(out, 'utf8')); const h = rows[0]; const col = (k) => h.indexOf(k);
    const row = (t) => rows.find((x) => x[col('topico')] === t);
    row('Licitações')[col('peso')] = '5'; row('Licitações')[col('progresso')] = '70'; row('Licitações')[col('tempo_total_min')] = String(Number(row('Licitações')[col('tempo_total_min')] || 0) + 45);
    row('Legalidade')[col('revisou_hoje')] = 'sim'; row('Moralidade')[col('notas')] = 'Súmula Vinculante 13';
    rows.push(['', 'Direito Administrativo', '', 'Improbidade administrativa', '3', '', '', '', '', '', '', '', '', ''].slice(0, h.length)); rows.push(['t-ffffffffff', '', '', 'Fantasma', '', '', '', '', '', '', '', '', '', ''].slice(0, h.length));
    const ed = path.join(pdir, 'planejamento-editado.csv'); fs.writeFileSync(ed, '\uFEFF' + rows.map((x) => x.join(';')).join('\r\n'), 'utf8');
    await js(`window.__dlg.csv = ${JSON.stringify(ed)}`); await clickSel('#planPick'); await c.waitFor(() => js("!document.querySelector('#planPreview').hidden")); await shot('previa');
    const p = await txt('#planPreview'); ok(p.includes('Licitações — peso: 3 → 5') || p.includes('Licitações — peso'), p); ok(p.includes('Improbidade administrativa') && p.includes('não existe neste mapa') && p.includes('Súmula Vinculante 13'), p);
    eq(await js("document.querySelector('#planOk').disabled"), false); await clickSel('#planOk'); await c.waitFor(() => js("!!__id('Improbidade administrativa')")); await wait(250);
    eq(await js(`${N('Licitações')}.progress`), 70); eq(await js(`${N('Moralidade')}.notes`), 'Súmula Vinculante 13'); ok((await txt('#status')).includes('Planilha aplicada'), await txt('#status')); await shot('aplicada');
    await js('act.undo()'); await wait(200); ok(await js("!__id('Improbidade administrativa')"), 'Desfazer (botão) reverte a planilha inteira de uma vez'); await js('act.redo()'); await wait(200); ok(await js("!!__id('Improbidade administrativa')"), 'Refazer reaplica');
  });
  await feature('Estudos', 'Agenda de revisões (28 dias): clicar num dia lista os tópicos', 'Painel de estudos; cliques reais nos dias', async ({ shot }) => {
    await clickSel('[data-act="dash"]'); await c.waitFor(() => js("!!document.querySelector('#agenda .ag-day')"));
    await js("document.querySelector('#dash').scrollTop = 520"); await wait(200);
    const d1 = await rectOf('#agenda .ag-day[data-date="' + S.addDays(TODAY, 1) + '"]'); await click(d1.x, d1.y);
    eq(await js("[...document.querySelectorAll('#agendaDetail .rev b')].map((e) => e.textContent)"), ['Atos administrativos']); await shot('dia-seguinte');
    const d0 = await rectOf('#agenda .ag-day.today'); await click(d0.x, d0.y); ok((await js("document.querySelectorAll('#agendaDetail .rev').length")) >= 3, 'hoje reúne as atrasadas'); await shot('hoje-com-atrasadas');
  });
  await feature('Estudos', 'Pontos fracos e acerto da semana no painel', 'Registra 10 questões (3 acertos) pela interface e confere o ranking', async ({ shot }) => {
    await clickNode('Licitações'); await clickSel('#ptabs [data-tab="study"]'); await clickSel('#qDone'); await type('10'); await clickSel('#qOk'); await type('3'); await clickSel('#qAdd');
    eq(await js(`${N('Licitações')}.study.qlog['${TODAY}']`), { done: 10, correct: 3 });
    await clickSel('[data-act="dash"]'); await c.waitFor(() => js("!!document.querySelector('#weakSec')")); await js("document.querySelector('#dash').scrollTop = 9999"); await wait(200);
    eq(await js("[...document.querySelectorAll('#weakSec .rev b')].map((e) => e.textContent)"), ['Licitações', 'Atos administrativos']); await shot();
  });
  await feature('Mapa', 'Alt+↑ ↓ ← → reordenam e mudam o nível do tópico (teclado real)', 'Alt + setas; limites explicados na barra de status', async ({ shot }) => {
    await freshMap(); await clickNode('Tópico 2');
    await key('Up', ['alt']); eq(await js('map.root.children.map((x) => x.title)'), ['Tópico 2', 'Tópico 1', 'Tópico 3']);
    await key('Up', ['alt']); ok((await txt('#status')).includes('primeiro'), await txt('#status'));
    await key('Down', ['alt']); await key('Right', ['alt']); eq(await js(`${N('Tópico 1')}.children.map((x) => x.title)`), ['Tópico 2'], 'rebaixou'); await shot('rebaixado');
    await key('Left', ['alt']); eq(await js('map.root.children.map((x) => x.title)'), ['Tópico 1', 'Tópico 2', 'Tópico 3']);
    await key('Left', ['alt']); ok((await txt('#status')).includes('primeiro nível'), await txt('#status'));
  });
  await feature('Mapa', 'Alt+1…5 trocam as abas do painel lateral', 'Teclado real', async ({ shot }) => {
    for (const [k, p] of [['1', 'props'], ['2', 'study'], ['3', 'notes'], ['4', 'links'], ['5', 'outline']]) { await key(k, ['alt']); eq(await js("[...document.querySelectorAll('#panels .panel')].filter((x) => !x.hidden).map((x) => x.dataset.panel)"), [p], 'Alt+' + k); }
    await shot('aba-estrutura');
  });
  await feature('Dados', 'Backup ao salvar e "Restaurar versão anterior"', 'Salva 3 vezes por cima do mesmo arquivo; abre a versão antiga como mapa novo', async ({ shot }) => {
    const f = path.join(TMP, 'caderno ç.mom'), { backupDirFor, listBackups } = require('../core/backup');
    await js("dirty = false; newMap(); map.root.title = 'Caderno v1'; render()"); await js(`window.__dlg.save = ${JSON.stringify(f)}`); ok(await js('save(true)'));
    await js("map.root.title = 'Caderno v2'; dirty = true; save(false)"); await c.waitFor(() => listBackups(backupDirFor(path.join(USERDATA, 'backups'), f)).length === 1);
    await js("map.root.title = 'Caderno v3'; dirty = true; save(false)"); await wait(300); eq(listBackups(backupDirFor(path.join(USERDATA, 'backups'), f)).length, 1, 'o intervalo mínimo evita duplicar');
    const b = listBackups(backupDirFor(path.join(USERDATA, 'backups'), f))[0].file;
    await js(`window.__dlg.openAt = ${JSON.stringify(b)}; window.__dlg.discard = 1; dirty = false; restoreVersion()`); await c.waitFor(() => js("map.root.title === 'Caderno v1'"));
    eq(await js('filePath'), null); eq(readMom(fs.readFileSync(f)).root.title, 'Caderno v3', 'o original não foi tocado'); ok((await txt('#status')).includes('Versão anterior aberta como mapa novo'));
  });
  await feature('Dados', 'Ao iniciar, o app reabre o último mapa (e o painel, se configurado)', 'Chama a inicialização com um arquivo recente', async ({ shot }) => {
    const f = path.join(TMP, 'caderno ç.mom'); await js(`removeDraft(); dirty = false; newMap(); saveCfg({ reopenLast: true, dashOnStart: true }); closeDash(); true`);
    await js('init()'); await c.waitFor(() => js(`filePath === ${JSON.stringify(f)}`)); await c.waitFor(() => js("!document.querySelector('#dash').hidden")); eq(await js('map.root.title'), 'Caderno v3');
    await js("saveCfg({ dashOnStart: false }); closeDash(); true");
  });

  console.log('\n— ARQUIVOS —\n');
  await feature('Arquivos', 'Salvar como, reabrir e título com ponto de "não salvo"', 'save(true) com diálogo simulado; reabrir pelo caminho', async ({ shot }) => {
    await freshMap(); await clickNode('Tópico 1'); await key('Tab'); await type('Alteração'); await key('Enter');
    ok(await js(`!document.querySelector('#dirtyDot').hidden`), 'ponto azul de alterações pendentes'); await shot('sujo');
    const f = path.join(TMP, 'QA salvar çã.mom'); await js(`window.__dlg.save = ${JSON.stringify(f)}`); ok(await js('save(true)'));
    ok(await js(`document.querySelector('#dirtyDot').hidden`), 'ponto some após salvar'); eq(await txt('#docTitle'), 'QA salvar çã.mom');
    await js('newMap()'); await js(`openPath(${JSON.stringify(f)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(f)}`)); ok((await titles()).includes('2:Alteração'));
  });
  await feature('Arquivos', 'Arquivos recentes no menu', 'Menu Arquivo › Abrir recente (conferido na estrutura do menu nativo)', async ({ shot }) => {
    await js(`ipcRenderer.invoke('recent:add', ${JSON.stringify(fMain)})`); await c.waitFor(() => fs.existsSync(path.join(USERDATA, 'recent.json')) && fs.readFileSync(path.join(USERDATA, 'recent.json'), 'utf8').includes('Concurso TRF 2026'));
    const list = JSON.parse(fs.readFileSync(path.join(USERDATA, 'recent.json'), 'utf8')); ok(list.length >= 1, 'recent.json');
    const arq = c.Menu.getApplicationMenu().items.find((i) => i.label === 'Arquivo').submenu.items.find((i) => i.label === 'Abrir recente');
    const labels = arq.submenu.items.map((i) => i.label).filter(Boolean); ok(labels.some((l) => l.includes('Concurso TRF 2026')), 'item no menu');
    await shot('', await peekHtml(`<body style="font:14px Segoe UI;background:#262626;color:#eee;padding:30px"><h3>Arquivo › Abrir recente</h3>${labels.map((l) => `<div style="padding:5px 10px;border-bottom:1px solid #444">${esc(l)}</div>`).join('')}</body>`));
    return `${labels.length} item(ns) no menu`;
  });
  await feature('Arquivos', 'Importar Markdown e OPML', 'openPath em .md e .opml (arquivos temporários)', async () => {
    const md = path.join(TMP, 'plano.md'), op = path.join(TMP, 'plano.opml');
    fs.writeFileSync(md, '# Plano de estudos\n\n## Semana 1\n- Constitucional\n  - Princípios\n- Português\n## Semana 2\nRevisão geral.\n'); fs.writeFileSync(op, '<opml version="2.0"><body><outline text="Raiz OPML"><outline text="Item A"><outline text="Sub A1"/></outline><outline text="Item B" _note="com nota"/></outline></body></opml>');
    await js('dirty = false'); await js(`openPath(${JSON.stringify(md)})`); await wait(250); eq(await js('map.root.title'), 'Plano de estudos'); ok((await titles()).includes('3:Princípios')); eq(await js('filePath'), null, 'importação não vira o arquivo atual');
    await js('dirty = false'); await js(`openPath(${JSON.stringify(op)})`); await wait(250); eq(await js('map.root.title'), 'Raiz OPML');
  });
  let exported = {};
  await feature('Arquivos', 'Exportar PDF, Word, PNG, SVG, Markdown e OPML', 'doExport() de cada formato (diálogo simulado); arquivos abertos em visualizadores para captura', async ({ shot }) => {
    await openMain(); const out = (e) => path.join(TMP, 'exp mapa.' + e);
    for (const f of ['pdf', 'docx', 'png', 'svg', 'md', 'opml']) { await js(`window.__dlg.save = ${JSON.stringify(out(f))}`); eq(await js(`doExport('${f}')`), out(f), f); exported[f] = out(f); ok(fs.statSync(out(f)).size > 100, 'arquivo vazio: ' + f); }
    await shot('pdf', await peek(out('pdf'), 'pdf')); await shot('png', await peek(out('png'))); await shot('svg', await peek(out('svg')));
    await shot('markdown', await peek(out('md'), 'text')); await shot('opml', await peek(out('opml'), 'text'));
    const dx = new (require('adm-zip'))(fs.readFileSync(out('docx'))); ok(dx.getEntries().some((e) => /word\/media\/.*\.png$/.test(e.entryName)), 'docx com imagem');
    const plain = dx.getEntry('word/document.xml').getData().toString().replace(/<w:p[ >]/g, '\n<w:p ').replace(/<[^>]+>/g, '').replace(/\n+/g, '\n').trim();
    await shot('docx-texto', await peekHtml(`<body style="font:13px Consolas;background:#1e1e1e;color:#ddd;padding:18px;white-space:pre-wrap"><b style="color:#7cc4ff">exp mapa.docx — texto extraído do word/document.xml</b>\n\n${esc(plain).slice(0, 3500)}</body>`));
  });
  await feature('Arquivos', 'Linha de comando (CLI) para conversões', 'node bin/mindcraft.js … em .mom/.md → pdf/docx/svg/opml/mom e entradas inválidas', async ({ shot }) => {
    const cli = path.join(__dirname, '..', 'bin', 'mindcraft.js'), run = (...a) => spawnSync(process.execPath, [cli, ...a], { encoding: 'utf8', env: { ...process.env, ELECTRON_RUN_AS_NODE: '' } });
    const lines = [];
    for (const ext of ['pdf', 'docx', 'svg', 'opml', 'mom']) { const r = run(fMain, path.join(TMP, 'cli.' + ext), '--theme', 'paper'); lines.push(`$ mindcraft "Concurso TRF 2026.mom" cli.${ext} --theme paper → exit ${r.status} ${r.stdout.trim()}`); eq(r.status, 0, ext); }
    const bad = [['mapa.xyz'], [fMain, path.join(TMP, 'x.pdf'), '--theme', 'inexistente'], [path.join(TMP, 'nao-existe.mom'), path.join(TMP, 'y.pdf')]];
    for (const a of bad) { const r = run(...a); lines.push(`$ mindcraft ${a.map((x) => path.basename(x)).join(' ')} → exit ${r.status}  ${(r.stderr || '').trim().split('\n')[0]}`); ok(r.status !== 0, 'deveria falhar: ' + a.join(' ')); }
    await shot('', await peekHtml(`<body style="font:13px Consolas;background:#1e1e1e;color:#ddd;padding:24px;white-space:pre-wrap">${esc(lines.join('\n\n'))}</body>`));
  });

  console.log('\n— ESTUDOS —\n');
  await feature('Estudos', 'Modelo de concurso', 'Menu Arquivo › Novo mapa de concurso (modelo)', async () => {
    await js('dirty = false'); win.webContents.send('menu', 'template'); await c.waitFor(() => js(`map.root.title === 'Concurso — nome da prova'`)); eq((await titles()).length, 26);
  });
  await feature('Estudos', 'Importar edital colando o texto', 'Modal: digitar nome, colar texto, ver contagem, Importar', async ({ shot }) => {
    await js('dirty = false'); win.webContents.send('menu', 'edital'); await c.waitFor(() => js(`!document.querySelector('#modal').hidden`));
    await clickSel('#impTitle'); await key('A', ['control']); await type('TRF 2026 — Edital');
    await clickSel('#impText'); await type('LÍNGUA PORTUGUESA\n1 Compreensão e interpretação de textos.\n2 Ortografia oficial; acentuação\ngráfica.\n2.1 Emprego do sinal indicativo de crase\n3 Regência verbal\n   a) verbos transitivos\n   b) verbos intransitivos\nDIREITO CONSTITUCIONAL:\n1. Princípios fundamentais\n1.1 Direitos e garantias\n2. Organização do Estado\n3. Controle de constitucionalidade');
    eq(await txt('#impCount'), '12 tópicos detectados'); await shot('modal'); await clickSel('#impOk'); await c.waitFor(() => js(`map.root.title === 'TRF 2026 — Edital'`));
    eq(await js('map.root.children.map((x) => x.title)'), ['LÍNGUA PORTUGUESA', 'DIREITO CONSTITUCIONAL']);
  });

  await openMain();
  await feature('Estudos', 'Mapa de estudo: progresso agregado, selos ↻, marcadores', 'Mapa de exemplo (concurso) aberto do disco', async () => {
    ok(await js(`[...view.querySelectorAll('text')].filter((t) => t.textContent === '↻').length`) >= 2, 'selos de revisão'); ok(await js(`/4c9aff/.test(view.innerHTML)`), 'barra azul agregada nos blocos');
  });
  await feature('Estudos', '"Estudei hoje", "Errei", peso e próxima revisão', 'Clique real nos botões do painel Estudo do tópico', async ({ shot }) => {
    await clickNode('Moralidade'); eq(await txt('#studyDone'), '✓ Estudei hoje'); await clickSel('#studyDone');
    let st = await js(`${N('Moralidade')}.study`); eq([st.stage, st.next], [0, S.addDays(TODAY, 1)]); await shot('estudei');
    await clickSel('#studyFail'); st = await js(`${N('Moralidade')}.study`); eq([st.stage, st.reviews[0].ok], [0, false]);
    await js(`(() => { const s = document.querySelector('#studyWeight'); s.value = '4'; s.dispatchEvent(new Event('change', { bubbles: true })); })()`); eq(await js(`${N('Moralidade')}.study.weight`), 4);
    await setVal('#studyNext', S.addDays(TODAY, 9), 'change'); eq(await js(`${N('Moralidade')}.study.next`), S.addDays(TODAY, 9));
  });
  await feature('Estudos', 'Cronômetro de estudo', 'Iniciar → (tempo simulado: +12 min) → Parar', async ({ shot }) => {
    await clickNode('Licitações'); await clickSel('#timerBtn'); ok(await js(`document.body.classList.contains('timing')`)); await js('timer.start -= 12 * 60000; tickTimer()'); await shot('rodando');
    await clickSel('#timerBtn'); eq(await js(`${N('Licitações')}.study.log['${TODAY}']`), 12); ok(!(await js(`document.body.classList.contains('timing')`)));
  });
  await feature('Estudos', 'Minutos e questões, com validações visíveis', 'Digitar valores válidos e inválidos nos campos', async ({ shot }) => {
    await clickNode('Licitações'); await clickSel('#studyMin'); await type('0'); await clickSel('#studyAddMin'); ok((await txt('#studyMsg')).includes('maior que zero'), await txt('#studyMsg')); await shot('erro');
    await clickSel('#studyMin'); await key('A', ['control']); await type('45'); await clickSel('#studyAddMin'); eq(await js(`${N('Licitações')}.study.log['${TODAY}']`), 45);
    await clickSel('#qDone'); await type('10'); await clickSel('#qOk'); await type('12'); await clickSel('#qAdd'); ok((await txt('#studyMsg')).includes('superar'));
    await clickSel('#qOk'); await key('A', ['control']); await type('8'); await clickSel('#qAdd'); eq(await js(`${N('Licitações')}.study.q`), { done: 10, correct: 8 }); eq(await txt('#studyQ'), 'Total: 8/10 (80%)');
  });
  await feature('Estudos', 'Estudo em lote (vários tópicos)', 'Ctrl+clique em 3 tópicos → "Estudei hoje" → 1 desfazer', async () => {
    await clickNode('Concordância'); await clickNode('Organização do Estado', { mods: ['control'] }); await clickNode('Redes', { mods: ['control'] });
    const picked = await js(`[...selIds].map((id) => map.find(id).node.title)`); eq(picked.sort(), ['Concordância', 'Organização do Estado', 'Redes'].sort(), 'seleção dos 3 tópicos'); ok((await txt('#studyMulti')).startsWith('3 tópicos')); await clickSel('#studyDone');
    for (const t of ['Concordância', 'Organização do Estado', 'Redes']) eq(await js(`${N(t)}.study.next`), S.addDays(TODAY, 1), t);
    await js('act.undo()'); eq(await js(`${N('Redes')}.study`), undefined, 'um desfazer reverte os 3');
  });
  await feature('Estudos', 'Painel de estudos (visão geral)', 'Botão do painel na barra de ferramentas', async ({ shot }) => {
    await clickSel('[data-act="dash"]'); ok(await js(`!document.querySelector('#dash').hidden`)); await shot('topo'); await js(`document.querySelector('#dash').scrollTop = 9999`); await wait(150); await shot('fim'); await js(`document.querySelector('#dash').scrollTop = 0`);
  });
  await feature('Estudos', 'Revisão rápida pelo painel (✓ / ↻)', 'Botões da fila de revisões pendentes', async ({ shot }) => {
    await js('act.dash()'); await wait(200); const n0 = await js(`document.querySelectorAll('#dash [data-review]').length`); ok(n0 >= 1, 'há revisões');
    await clickSel('#dash [data-review] [data-act="rev-ok"]'); eq(await js(`document.querySelectorAll('#dash [data-review]').length`), n0 - 1, 'a fila encolheu');
  });
  await feature('Estudos', 'Data da prova: salvar, validar e limpar', 'Digitar nome e data; salvar sem data mostra erro', async ({ shot }) => {
    await js('act.dash()'); await wait(200); await clickSel('#examDate'); await key('A', ['control']); await key('Delete'); await clickSel('#examSave'); eq(await txt('#dashMsg'), 'Informe a data da prova.'); await shot('erro');
    await setVal('#examDate', S.addDays(TODAY, 12)); await clickSel('#examName'); await key('A', ['control']); await type('OAB 1ª fase'); await clickSel('#examSave');
    eq(await js('map.meta.exam'), { name: 'OAB 1ª fase', date: S.addDays(TODAY, 12) }); eq(await txt('.countdown b'), '12'); await clickSel('#examClear'); eq(await js('map.meta.exam'), undefined);
  });
  await feature('Estudos', 'Relatório de estudos (.md e .docx)', 'Botões do painel; arquivos abertos para captura', async ({ shot }) => {
    await js(`map.setExam({ name: 'TRF — 2ª Região', date: '${S.addDays(TODAY, 25)}' }); render(); act.dash()`); await wait(200); const md = path.join(TMP, 'rel.md'), dx = path.join(TMP, 'rel.docx');
    await js(`window.__dlg.save = ${JSON.stringify(md)}`); await js(`document.querySelector('#btnReportMd').scrollIntoView({ block: 'center' })`); await wait(150); await clickSel('#btnReportMd'); await c.waitFor(() => fs.existsSync(md) && fs.statSync(md).size > 100);
    await js(`window.__dlg.save = ${JSON.stringify(dx)}`); await js(`document.querySelector('#btnReportDocx').scrollIntoView({ block: 'center' })`); await wait(150); await clickSel('#btnReportDocx'); await c.waitFor(() => fs.existsSync(dx) && fs.statSync(dx).size > 1000);
    await shot('markdown', await peek(md, 'text')); ok(/Progresso geral/.test(fs.readFileSync(md, 'utf8')));
  });
  await feature('Estudos', 'Virada do dia: revisões "de amanhã" passam a vencer', 'window.__today avança 1 dia (relógio simulado)', async ({ shot }) => {
    await clickSel('#btnDashClose').catch(() => {}); await js('closeDash()'); const b = await js(`[...view.querySelectorAll('text')].filter((t) => t.textContent === '↻').length`);
    await js(`window.__today = '${S.addDays(TODAY, 1)}'; render()`); const a = await js(`[...view.querySelectorAll('text')].filter((t) => t.textContent === '↻').length`); ok(a > b, `selos ${b} → ${a}`); await js(`window.__today = '${TODAY}'; render()`);
    return `selos ↻: ${b} → ${a}`;
  });

  console.log('\n— REDE DE CONHECIMENTO —\n');
  await feature('Rede', 'Painel Conexões: links, retrolinks e fantasmas', 'Selecionar tópicos com [[links]] nas notas', async ({ shot }) => {
    await js(`['props', 'study', 'outline'].forEach((p) => document.querySelector('[data-panel="' + p + '"]').classList.add('closed'))`); await clickNode('Legalidade'); await js('renderLinks()'); await wait(150);
    const t = await js(`[...document.querySelectorAll('#linksBody .lk .t')].map((e) => e.textContent)`); ok(t.includes('Princípios fundamentais') && t.includes('Princípios da Administração'), 'retrolinks de Legalidade: ' + t);
  });
  await feature('Rede', 'Menção sem link → transformar em [[link]]', 'Botão [[ ]] na lista de menções', async ({ shot }) => {
    await clickNode('Atos administrativos'); await js('renderLinks()'); await wait(150); await shot('antes'); await clickSel('#linksBody [data-linkify]'); await wait(150);
    ok((await js(`${N('Atos administrativos')}.notes`)).includes('[[moralidade]]'), 'virou link'); await js('renderLinks()'); await shot('depois'); await js('act.undo()');
  });
  await feature('Rede', 'Autocompletar ao digitar [[', 'Digitação real no painel de notas; setas e Enter', async ({ shot }) => {
    await clickNode('Redes'); await clickSel('#notes'); await type('Depende de [[seg'); ok(await js('!document.querySelector("#linkSuggest").hidden'), 'lista aberta');
    const pos = await js(`(() => { const p = document.querySelector('#linkSuggest').getBoundingClientRect(), n = notes.getBoundingClientRect(); return { dy: Math.round(p.top - n.top), cabe: p.bottom <= innerHeight && p.left >= n.left - 1 && p.right <= innerWidth }; })()`);
    ok(pos.dy >= 0 && pos.dy < 120 && pos.cabe, 'a lista deve abrir junto ao cursor e dentro da janela: ' + JSON.stringify(pos)); await shot('lista');
    await key('Enter'); eq(await js('notes.value'), 'Depende de [[Segurança da informação]]'); await blank();
  });
  await feature('Rede', 'Link sem destino (fantasma) → criar o tópico', 'Botão ＋ no painel Conexões', async () => {
    await clickNode('Crase'); await clickSel('#ptabs [data-tab="notes"]'); await clickSel('#notes'); await key('A', ['control']); await type('Ver [[Tema inexistente]] depois.'); await blank(); await clickNode('Crase');
    await clickSel('#ptabs [data-tab="links"]'); await js('renderLinks()'); await wait(150);
    const n0 = (await titles()).length; await clickSel('#linksBody [data-create]'); eq((await titles()).length, n0 + 1); ok((await titles()).some((x) => x.endsWith(':Tema inexistente')));
  });
  await js(`closeDash(); ['props', 'study', 'outline'].forEach((p) => document.querySelector('[data-panel="' + p + '"]').classList.remove('closed')); true`);
  const ensureGraph = async (scope = 'map') => {
    if (await js('graphOpen')) return;
    await openMain();
    await js(`saveCfg({ scope: '${scope}' }); Object.assign(gOpt, { hier: true, orphans: true, local: false, q: '' }); gBuilt = false; gPinned = new Map(); gLayoutSig = ''; true`);
    await clickSel('[data-act="graph"]'); await c.waitFor(() => js(`document.querySelectorAll('#gview .gn').length > 0`)); await wait(350);
  };
  const gsel = async () => js('gSel && gLast.g.byId.get(gSel) && gLast.g.byId.get(gSel).title');
  await feature('Rede', 'Grafo do mapa (hierarquia + links + relações)', 'Botão do grafo; layout de forças', async ({ shot }) => {
    await js(`saveCfg({ scope: 'map' }); Object.assign(gOpt, { hier: true, orphans: true, local: false, q: '' }); gBuilt = false; gPinned = new Map(); gLayoutSig = ''; true`); await clickSel('[data-act="graph"]');
    await c.waitFor(() => js(`document.querySelectorAll('#gview .gn').length > 0`)); await wait(300); ok((await txt('#gStat')).includes('ligações'), await txt('#gStat'));
  });
  await feature('Rede', 'Grafo: selecionar nó e ver conexões', 'Clique real no nó', async () => { await ensureGraph();
    const r = await js(`(() => { const e = __gn('Legalidade').querySelector('circle').getBoundingClientRect(); return { x: e.x + e.width / 2, y: e.y + e.height / 2 }; })()`);
    await click(r.x, r.y); eq(await gsel(), 'Legalidade'); ok((await txt('#gSide')).includes('Citado em'));
  });
  const viewMenu = async () => { if (!(await js(`document.querySelector('#gViewPop').open`))) await clickSel('#gViewPop > summary'); await wait(120); };
  const moreMenu = async () => { if (!(await js(`document.querySelector('#gMenu').open`))) await clickSel('#gMenu > summary'); await wait(120); };
  await feature('Rede', 'Grafo: só links (sem hierarquia)', 'Checkbox Hierarquia', async () => { await ensureGraph(); await viewMenu(); await clickSel('#gHier'); ok(!(await js('gOpt.hier'))); });
  await feature('Rede', 'Grafo: vizinhança local + busca', 'Checkbox Só vizinhança (do nó selecionado); busca com destaque', async () => { await ensureGraph();
    await js(`__gclick('Legalidade')`); await viewMenu(); await clickSel('#gLocal'); const nodesLocal = await js(`gLast.nodes.length`); ok(nodesLocal < (await js(`gLast.g.nodes.length`)), 'filtrou a vizinhança: ' + nodesLocal);
    await clickSel('#gSearch'); await type('princ'); ok((await js(`gLast.match.filter(Boolean).length`)) >= 1, 'a busca destaca vizinhos');
  });
  await feature('Rede', 'Grafo: arrastar nó e dar zoom com a roda', 'Arrasto real de um nó; roda real sobre o grafo', async () => { await ensureGraph();
    await js(`(() => { const s = document.querySelector('#gSearch'); s.value = ''; s.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    const nodeAt = () => js(`(() => { const e = __gn('Legalidade').querySelector('circle').getBoundingClientRect(); return { x: e.x + e.width / 2, y: e.y + e.height / 2 }; })()`);
    const a = await nodeAt(); await drag(a, { x: a.x + 90, y: a.y - 60 }); const b = await nodeAt(); ok(Math.hypot(b.x - a.x, b.y - a.y) > 50, 'nó acompanhou o mouse');
    const k0 = await js('gTrans.k'); const okW = await wheelUntil(b.x, b.y, 240, async () => (await js('gTrans.k')) > k0);
    if (!okW) { const sr = await rectOf('#gsvg'); const top = await js(`(() => { const e = document.elementFromPoint(${b.x}, ${b.y}); return e ? (e.id || e.tagName + '.' + (e.getAttribute('class') || '')) : null; })()`); throw new Error('zoom do grafo pela roda: ' + JSON.stringify({ k0, k: await js('gTrans.k'), b, svg: sr, noPonto: top })); }
  });
  await feature('Rede', 'Grafo do vault: vários mapas ligados por [[Mapa#Tópico]]', 'Escolher a pasta; cores por mapa', async () => {
    await ensureGraph(); await js(`window.__dlg.folder = ${JSON.stringify(vault)}`); await moreMenu(); await clickSel('#gPick'); await c.waitFor(async () => (await txt('#gStat')).includes('3 mapa(s)')); await wait(900); await js('fitGraph()'); await wait(200);
    ok((await txt('#gStat')).includes('0 sem destino'), await txt('#gStat'));
  });
  await feature('Rede', 'Navegar entre mapas pelo grafo (duplo clique real)', 'Duplo clique num nó de outro mapa abre o arquivo', async ({ shot }) => {
    await ensureGraph('vault'); await js('window.__dlg.discard = 1; dirty = false');
    await js(`window.__dlg.folder = ${JSON.stringify(vault)}`); if (!(await js(`!!__gn('Resumo de crase')`))) { await moreMenu(); await clickSel('#gPick'); await c.waitFor(async () => (await txt('#gStat')).includes('3 mapa(s)')); await wait(700); }
    const r = await js(`(() => { const e = __gn('Resumo de crase').querySelector('circle').getBoundingClientRect(); return { x: e.x + e.width / 2, y: e.y + e.height / 2 }; })()`);
    await dbl(r.x, r.y); await c.waitFor(() => js(`filePath && path.basename(filePath) === 'Resumos de Português.mom'`)); eq(await sel(), 'Resumo de crase'); ok(await js('document.querySelector("#graph").hidden'));
  });
  await feature('Rede', 'Exportar para o Obsidian (+ proteção de notas existentes)', 'Botão do grafo; arquivo .md aberto para captura', async ({ shot }) => {
    await openMain(); const out = path.join(TMP, 'obsidian'); fs.mkdirSync(path.join(out, 'MindCraft'), { recursive: true }); fs.writeFileSync(path.join(out, 'MindCraft', 'Questões comentadas.md'), '# minha nota pessoal\n');
    await clickSel('[data-act="graph"]'); await c.waitFor(() => js(`document.querySelectorAll('#gview .gn').length > 0`)); await js(`window.__dlg.folder = ${JSON.stringify(out)}`); await moreMenu(); await clickSel('#gExport'); await c.waitFor(() => js(`!!document.querySelector('#gMsg')`));
    const dir = path.join(out, 'MindCraft'); const files = fs.readdirSync(dir).sort(); ok(files.includes('Questões comentadas (MindCraft).md') && files.includes('Concurso TRF 2026.md'), files.join(', ')); eq(fs.readFileSync(path.join(dir, 'Questões comentadas.md'), 'utf8'), '# minha nota pessoal\n');
    await shot('md', await peek(path.join(dir, 'Concurso TRF 2026.md'), 'text'));
  });
  await feature('Rede', 'Abrir no Obsidian (URL do protocolo)', 'Botão; o lançamento é desligado nos testes (MINDCRAFT_NO_LAUNCH)', async () => {
    await ensureGraph('vault'); await js(`window.__dlg.folder = ${JSON.stringify(vault)}`); await moreMenu(); await clickSel('#gPick'); await c.waitFor(async () => (await txt('#gStat')).includes('3 mapa(s)'));
    await moreMenu(); await clickSel('#gObsidian'); await c.waitFor(async () => (await txt('#gMsg')).includes('obsidian://')); return (await txt('#gMsg')).slice(0, 110);
  });
  await js('closeGraph()');

  console.log('\n— DADOS E ROBUSTEZ —\n');
  await feature('Dados', 'Biblioteca de mapas (SQLite): guardar, salvar, abrir, versões e lixeira', 'Janela da biblioteca; cliques reais nos botões; Ctrl+S real salva no banco', async ({ shot }) => {
    const { openLibrary } = require('../core/library'); const dbf = path.join(USERDATA, 'biblioteca.db');
    await js("closeLibrary(); dirty = false; true"); await js("window.__dlg.discard = 1; true");
    await js("openLibraryModal(); true"); await c.waitFor(() => js("!!document.querySelector('#libAddCur')")); await shot('vazia');
    await clickSel('#libAddCur'); await c.waitFor(() => js("!!map.meta.libId")); const id = await js('map.meta.libId');
    await c.waitFor(async () => (await js("document.querySelectorAll('#libList .lib-row').length")) === 1); await shot('mapa-guardado');
    await clickSel('#libClose'); eq(await js('dirty'), false);
    const leaf = await js('(() => { let t; map.walk((n) => { if (!n.children.length && !t) t = n.title; }); return t; })()'); await clickNode(leaf); await key('F2'); await key('A', ['control']); await type('Editado e salvo no banco'); await key('Enter'); ok(await js('dirty'), 'editou');
    await key('S', ['control']); await c.waitFor(async () => !(await js('dirty'))); const lib = openLibrary(dbf); const m = lib.loadMap(id); let found = false; m.walk((n) => { if (n.title === 'Editado e salvo no banco') found = true; }); lib.close(); ok(found, 'Ctrl+S real gravou no banco');
    await js("openLibraryModal(); true"); await c.waitFor(() => js("!!document.querySelector('#libList [data-act=versions]')")); await clickSel('#libList [data-act="versions"]');
    await c.waitFor(() => js("!!document.querySelector('#verNow')")); await clickSel('#verNow'); await c.waitFor(() => js("document.querySelectorAll('#verList .lib-row').length >= 1")); await shot('versoes'); await clickSel('#verBack');
    await c.waitFor(() => js("!!document.querySelector('#libTabTrash')")); await clickSel('#libTabTrash'); await wait(150); await shot('lixeira-vazia'); await clickSel('#libClose');
  });
  await feature('Estudos', 'Leitor de PDF dividido: selecionar um trecho cria tópico com página e destaque', 'Tela dividida; duplo clique real numa palavra do PDF; botão ＋ Tópico; Ctrl+clique no destaque', async ({ shot }) => {
    const PDFDocument = require('pdfkit'); const pdf = path.join(TMP, 'Lei de Licitações.pdf');
    await new Promise((res) => { const d = new PDFDocument({ size: 'A4', margin: 70 }); const o = fs.createWriteStream(pdf); d.pipe(o); o.on('finish', res);
      d.fontSize(20).text('Lei 14.133 — Licitações'); d.moveDown(); d.fontSize(15).text('Licitação é o procedimento administrativo que antecede os contratos públicos.'); d.moveDown(); d.text('Moralidade e publicidade orientam toda a contratação.'); d.addPage(); d.fontSize(15).text('Dispensa de licitação ocorre nos casos previstos em lei.'); d.end(); });
    await js("dirty = false; ipcRenderer.emit('menu', {}, 'pdf'); true"); await c.waitFor(() => js("!!document.querySelector('#pdfOpen')")); await shot('leitor-vazio');
    await js(`window.__dlg.pdf = ${JSON.stringify(pdf)}; true`); await clickSel('#pdfOpen'); await c.waitFor(() => js("document.querySelectorAll('.pdf-page .textLayer span').length > 3"), 15000);
    let last = ''; await c.waitFor(async () => { const cur = await js("(() => { const p = document.querySelector('.pdf-page'), sc = document.querySelector('#pdfScroll'); return p.getBoundingClientRect().width + '|' + sc.scrollTop + '|' + document.querySelectorAll('.pdf-page .textLayer span').length; })()"); const same = cur === last; last = cur; return same; }, 10000, 500);   // layout assentou (largura ajustada, rolagem parada)
    const w = await js(`(() => { const s = [...document.querySelectorAll('.pdf-page[data-page="1"] .textLayer span')].find((x) => x.textContent.startsWith('Licitação é')); const r = s.getBoundingClientRect(); return { x: r.left + 14, y: r.top + r.height / 2 }; })()`);
    await dbl(w.x, w.y); await c.waitFor(() => js("!!document.querySelector('#pdfMkTopic')"), 6000); await shot('trecho-selecionado');
    await clickSel('#pdfMkTopic'); await c.waitFor(() => js("!!__id('Licitação')"), 6000);
    eq(await js("map.find(__id('Licitação')).node.refs[0].page"), 1); eq(await js("map.meta.pdfs[0].name"), 'Lei de Licitações'); await wait(500); await shot('topico-criado');
    ok(await js("document.querySelectorAll('.pdf-hl').length >= 1"), 'destaque desenhado'); ok(await js("!!document.querySelector('#pdfChips .chip2')"), 'chip do tópico nesta página');
    await js("document.querySelector('#tabMap').click()"); await clickSel('#ptabs [data-tab="notes"]'); await c.waitFor(() => js("!!document.querySelector('#refsList')")); await shot('fontes-nas-notas');
    // fechar a última aba deixa a bancada aberta no launchpad (de propósito); o ✕ do cabeçalho é que fecha a bancada
    await clickSel('#tabMedia .tab-x'); await c.waitFor(() => js("document.querySelectorAll('#pdfpane .media-tab-close').length === 0"));   // o ✕ da aba agora é o da faixa do topo
  });
  await feature('Estudos', 'Revisão do dia (recordação ativa) e tela de atalhos (F1)', 'Cliques reais: Mostrar anotações → Lembrei / Errei; atalho de teclado Espaço', async ({ shot }) => {
    await js("dirty = false; ipcRenderer.emit('menu', {}, 'review'); true"); await c.waitFor(() => js("!!document.querySelector('#rvTitle')")); await shot('pergunta');
    const t1 = await txt('#rvTitle'); await clickSel('#rvShow'); await c.waitFor(() => js("!!document.querySelector('#rvDetail')")); await shot('resposta');
    await clickSel('#rvOk'); await c.waitFor(async () => (await txt('#rvCount')).startsWith('2 /')); ok((await js(`(() => { let r; map.walk((n) => { if (n.title === ${JSON.stringify(t1)}) r = n; }); return r.study.next > '${TODAY}'; })()`)), 'Lembrei agendou a próxima revisão');
    focusWin(); await key(' '); await c.waitFor(() => js("!!document.querySelector('#rvDetail')")); await clickSel('#rvBad'); await c.waitFor(async () => (await txt('#rvCount')).startsWith('3 /'));
    await clickSel('#rvSkip'); await c.waitFor(() => js("!!document.querySelector('#rvDone')")); await shot('concluida'); await clickSel('#rvClose');
    await js("ipcRenderer.emit('menu', {}, 'help'); true"); await c.waitFor(() => js("!!document.querySelector('#keysBox')")); await shot('atalhos'); await clickSel('#keysClose');
  });
  await feature('Estudos', 'Caderno de erros e metas semanais (painel Estudo e Painel de estudos)', 'Cliques e digitação reais; motivo por seletor; botão ＋ Erro; metas digitadas', async ({ shot }) => {
    const leaf = await js('(() => { let t; map.walk((n, l) => { if (l === 2 && !t) t = n.title; }); return t; })()'); await clickNode(leaf); await clickSel('#ptabs [data-tab="study"]'); await wait(150);
    await setVal('#errWhy', 'confundi', 'change'); await clickSel('#errNote'); await type('confundi crase com acento grave'); await wait(150); await clickSel('#errAdd');
    await c.waitFor(() => js("document.querySelectorAll('#errList .err-row').length === 1"), 8000); await shot('painel-estudo');
    await setVal('#errWhy', 'atencao', 'change'); await wait(150); await clickSel('#errAdd'); await c.waitFor(() => js("document.querySelectorAll('#errList .err-row').length === 2"), 8000);
    await js('act.dash()'); await wait(300); await js("document.querySelector('#dash').scrollTop = 600"); await wait(200); await shot('painel-erros-e-metas');
    await js("document.querySelector('#goals').scrollIntoView({ block: 'center' })"); await wait(200); await clickSel('#goalHours'); await key('A', ['control']); await type('6'); await clickSel('#goalQuestions'); await key('A', ['control']); await type('80'); await clickSel('#goalSave');
    await c.waitFor(() => js("!!map.meta.goals && map.meta.goals.minutesWeek === 360 && map.meta.goals.questionsWeek === 80")); await wait(300); await js("document.querySelector('#goals').scrollIntoView({ block: 'center' })"); await wait(200); await shot('metas-salvas');
    ok(await js("document.querySelectorAll('#goals .goal-row').length === 2"), 'barras das duas metas'); ok((await txt('#errSec')).includes('Caderno de erros (2)'), await txt('#errSec'));
    await js("document.querySelector('#errSec').scrollIntoView({ block: 'center' })"); await wait(200); await clickSel('#errSec .rev .t'); await wait(200); ok(await js("document.querySelector('#dash').hidden"), 'clicar num erro leva ao tópico');
  });
  await feature('Estudos', 'Tela inicial: continuar, recentes, atalhos e biblioteca', 'Menu Início; cliques reais no cartão "continuar", numa linha de recentes e em "Novo mapa"', async ({ shot }) => {
    const recentFile = path.join(USERDATA, 'recent.json'); const f1 = path.join(TMP, 'Inicio A.mom'), f2 = path.join(TMP, 'Inicio B.mom');
    const mkm = (t, kids) => { const mm = new MindMap(createNode(t)); mm.meta.name = t; for (const k of kids) mm.addChild(mm.root.id, k); return mm; }; writeMom(mkm('Inicio A', ['a1', 'a2']), f1); writeMom(mkm('Inicio B', ['b1']), f2);
    fs.writeFileSync(recentFile, JSON.stringify([f1, f2, path.join(TMP, 'sumiu.mom')])); await js("dirty = false; window.__dlg.discard = 1; ipcRenderer.emit('menu', {}, 'home'); true"); await c.waitFor(() => js("!!document.querySelector('#home .hm')")); await wait(400); await shot('inicio');
    await clickSel('#hmRecent .hm-row:nth-child(3) .hm-open'); await c.waitFor(() => js(`filePath === ${JSON.stringify(f2)}`)); ok(await js("document.querySelector('#home').hidden"), 'abrir um recente fecha a tela inicial');
    await js("ipcRenderer.emit('menu', {}, 'home'); true"); await c.waitFor(() => js("!!document.querySelector('#home .hm')")); await clickSel('#hmContinue'); await c.waitFor(() => js(`filePath === ${JSON.stringify(f2)}`));
    await js("ipcRenderer.emit('menu', {}, 'home'); true"); await c.waitFor(() => js("!!document.querySelector('#home .hm')")); await clickSel('#hmNew'); await c.waitFor(() => js("document.querySelector('#home').hidden")); eq(await js('filePath'), null); await shot('novo-mapa');
  });
  await feature('Estudos', 'Simulados: registrar por disciplina e acompanhar a evolução', 'Formulário com digitação real; Painel de estudos com gráfico', async ({ shot }) => {
    await js("dirty = false; act.simulado(); true"); await c.waitFor(() => js("!!document.querySelector('#simBox')")); await wait(200);
    const rows = await js("[...document.querySelectorAll('.sim-row[data-disc] .sim-done')].map((e, i) => i)"); ok(rows.length >= 2, 'linhas por disciplina');
    await clickSel('.sim-row[data-disc]:nth-of-type(2) .sim-done'); await type('20'); await clickSel('.sim-row[data-disc]:nth-of-type(2) .sim-ok'); await type('14');
    await clickSel('.sim-row[data-disc]:nth-of-type(3) .sim-done'); await type('20'); await clickSel('.sim-row[data-disc]:nth-of-type(3) .sim-ok'); await type('9'); await wait(150); await shot('formulario');
    ok((await txt('#simTotal')).includes('23/40'), await txt('#simTotal')); await clickSel('#simSave'); await c.waitFor(() => js("document.querySelector('#modal').hidden")); ok(await js("(map.meta.simulados || []).length === 1"));
    await js("act.dash()"); await wait(300); await js("document.querySelector('#simSec').scrollIntoView({ block: 'center' })"); await wait(200); await shot('painel'); ok((await txt('#simSec')).includes('Simulados (1)'), await txt('#simSec'));
  });
  await feature('Mapa', 'Teclado real nas janelas: Tab circula só dentro delas, Esc fecha e o mapa nunca é alterado', 'Teclas reais (Tab, Shift+Tab, Delete, Esc) com a janela da biblioteca e a tela inicial abertas', async ({ shot }) => {
    const snap = () => js("JSON.stringify(map.root) + '|' + map._undo.length"); const base = await snap();
    await js("document.body.focus(); ipcRenderer.emit('menu', {}, 'lib'); true"); await c.waitFor(() => js("!!document.querySelector('#libList')")); focusWin(); await wait(200);
    for (let i = 0; i < 25; i++) { await key('Tab'); const inside = await js("document.querySelector('#modal .modal-box').contains(document.activeElement)"); if (!inside) throw new Error('o foco saiu da janela no Tab nº ' + (i + 1)); }
    for (let i = 0; i < 6; i++) { await key('Tab', ['shift']); ok(await js("document.querySelector('#modal .modal-box').contains(document.activeElement)"), 'Shift+Tab'); }
    await key('Delete'); await key('Backspace'); eq(await snap(), base, 'Delete/Backspace com a janela aberta não mexem no mapa'); await shot('janela-com-foco');
    await key('Escape'); await c.waitFor(() => js("document.querySelector('#modal').hidden")); eq(await snap(), base);
    await js("ipcRenderer.emit('menu', {}, 'home'); true"); await c.waitFor(() => js("!!document.querySelector('#home .hm')")); focusWin(); for (let i = 0; i < 6; i++) await key('Tab'); await key('Delete'); eq(await snap(), base, 'tela inicial aberta: teclas não mexem no mapa'); await key('Escape'); await c.waitFor(() => js("document.querySelector('#home').hidden"));
  });
  await feature('Estudos', 'Questões por banca e ano + caderno de erros para refazer', 'Digitar banca/ano, registrar, ver as tabelas no painel de estudos e refazer um erro com o mouse', async ({ shot }) => {
    await clickNode('Licitações'); await clickSel('#ptabs [data-tab="study"]');
    await js(`document.querySelector('#qBanca').focus()`); await key('Down'); eq(await js(`document.querySelector('#qBanca').value`), 'CEBRASPE (CESPE)', 'seta escolhe a 1ª banca da lista'); await clickSel('#qAno'); await type('2024'); await clickSel('#qDone'); await type('20'); await clickSel('#qOk'); await type('13'); await clickSel('#qAdd');
    ok((await txt('#studyMsg')).includes('CEBRASPE (CESPE) 2024'), await txt('#studyMsg'));
    await clickSel('#qDone'); await type('10'); await clickSel('#qOk'); await type('9'); await clickSel('#qAdd');
    await setVal('#errWhy', 'confundi', 'change'); await clickSel('#errNote'); await type('pregão x concorrência'); await clickSel('#errAdd'); await wait(200);
    ok((await txt('#errList')).includes('CEBRASPE (CESPE) 2024'), await txt('#errList')); await shot('questoes-painel-estudo');
    await clickSel('[data-act="dash"]'); await wait(500);
    const q = await js("document.querySelector('#qsrcSec').scrollIntoView(); document.querySelector('#qsrcBanca tbody').textContent");
    ok(q.includes('CEBRASPE (CESPE)') && q.includes('22/30'), q); await shot('questoes-por-banca');
    await clickSel('#errSec [data-act="err-redo-ok"]'); await wait(300); ok((await txt('#errStats')).startsWith('0 para refazer'), await txt('#errStats'));
    await clickSel('[data-act="dash"]'); await wait(200);
  });
  await feature('Dados', 'Autosave e recuperação de sessão', 'Alteração → rascunho em disco → "queda" → Restaurar', async ({ shot }) => {
    await openMain(); const draft = path.join(USERDATA, 'drafts', 'session.json'); await clickNode('Moralidade'); await key('Tab'); await type('Trabalho que não pode se perder'); await key('Enter');
    await c.waitFor(() => fs.existsSync(draft)); const size = fs.statSync(draft).size; await js('draftExists = false; newMap()'); ok(fs.existsSync(draft), 'rascunho sobrevive');
    await js('window.__dlg.confirm = 0'); await js('recoverSession()'); await wait(300); ok((await titles()).some((x) => x.endsWith(':Trabalho que não pode se perder')), 'restaurado'); eq(await js('dirty'), true);
    ok((await js('window.__dlg.confirms[0].detail')).includes('Concurso TRF 2026.mom'), 'diálogo cita o arquivo'); return `rascunho de ${size} bytes`;
  });
  await feature('Dados', 'Arquivo corrompido não derruba o app nem o mapa atual', 'Abrir .mom inválido', async ({ shot }) => {
    await js('dirty = false'); const bad = path.join(TMP, 'corrompido.mom'); fs.writeFileSync(bad, 'isto não é um zip'); const t0 = await js('map.root.title'); await js('window.__dlg.errors.length = 0');
    await js(`openPath(${JSON.stringify(bad)})`); await wait(250); eq(await js('window.__dlg.errors.length'), 1); eq(await js('map.root.title'), t0); return (await js('window.__dlg.errors[0]')).slice(0, 90);
  });

  console.log('\n— CASOS EXTREMOS E ESTADOS VAZIOS —\n');
  await feature('Extremos', 'Título enorme, HTML, emoji e caracteres especiais', 'Textos hostis e longos no mapa', async ({ shot }) => {
    await freshMap(); await js(`(() => { const m = map; m.update(m.root.children[0].id, { title: 'Um título realmente muito longo para testar a quebra de linha automática dentro do tópico sem estourar o layout do mapa mental nem sobrepor vizinhos '.repeat(2) });
      m.update(m.root.children[1].id, { title: '<img src=x onerror=alert(1)> & "aspas" <b>negrito?</b>' }); m.update(m.root.children[2].id, { title: 'Emoji 😀🎓 — acentuação: çãõ ü — 日本語 — عربى' }); render(); fit(); })()`);
    ok(await js(`view.querySelectorAll('img').length === 0`), 'HTML escapado'); const b = await js(`(() => { const x = [...L.boxes.values()].map((q) => q.w); return Math.max(...x); })()`); ok(b < 420, 'largura máxima do tópico: ' + b);
  });
  await feature('Extremos', 'Mapa grande (1 000 tópicos): desempenho e legibilidade', 'Gera 1 000 tópicos e mede layout/desenho', async ({ shot }) => {
    const t = await js(`(async () => { const m = new MindMap(createNode('Mapa grande')); for (let i = 0; i < 25; i++) { const a = m.addChild(m.root.id, 'Disciplina ' + i); for (let j = 0; j < 39; j++) m.addChild(a.id, 'Tópico ' + i + '.' + j); }
      adopt(m); dirty = false; const t0 = performance.now(); render(); const t1 = performance.now(); fit(); return { render: Math.round(t1 - t0), total: Math.round(performance.now() - t0), nodes: m.root.children.length * 40 + 1 }; })()`);
    metrics.push(`Mapa de ${t.nodes} tópicos: render ${t.render} ms, render+ajuste ${t.total} ms`); ok(t.render < 3000, 'render lento: ' + t.render + ' ms');
    ok((await js('pan.k')) >= 0.25, 'o Ajustar não pode reduzir abaixo de 25%: ' + (await js('pan.k'))); await shot('ajustado');
    await js(`(() => { const s = document.querySelector('#levelSel'); s.value = '1'; s.dispatchEvent(new Event('change', { bubbles: true })); })()`); await wait(300);
    const vis = await js('L.boxes.size'); ok(vis <= 30, 'nível 1 mostra só as disciplinas: ' + vis); ok((await js('pan.k')) > 0.5, 'após recolher, o mapa fica legível (zoom ' + (await js('pan.k')) + ')'); await shot('nivel-1');
    return `${t.nodes} tópicos · render ${t.render} ms · nível 1: ${vis} visíveis`;
  });
  await feature('Extremos', 'Janela pequena (1000×640): a interface continua utilizável', 'Redimensiona a janela', async ({ shot }) => {
    await js('dirty = false; newMap()'); win.setSize(1000, 640); await wait(500); const ov = await js(`({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })`); ok(ov.sw <= ov.cw + 2, 'sem rolagem horizontal da página: ' + JSON.stringify(ov));
    const cut = await js(`[...document.querySelectorAll('#ptabs .ptab')].filter((b) => b.scrollWidth > b.clientWidth + 1).map((b) => b.textContent)`); eq(cut, [], 'rótulos de abas cortados'); await shot('pequena');
    await clickSel('[data-act="dash"]'); await wait(300); await shot('painel'); await js('closeDash()'); win.setSize(1500, 920); await wait(400);
  });
  await feature('Extremos', 'Estados vazios: painel, conexões e grafo sem dados', 'Mapa novo sem estudos nem links', async ({ shot }) => {
    await js(`saveCfg({ scope: 'map' }); dirty = false; newMap()`); await clickSel('[data-act="dash"]'); await wait(250); ok((await txt('#dash')).includes('sem data de prova')); await shot('painel-vazio'); await js('closeDash()');
    await clickSel('[data-act="graph"]'); await wait(500); await shot('grafo-vazio'); await js('closeGraph()');
  });

  // ---------- relatório ----------
  const ok_ = rows.filter((r) => r.status === 'OK').length, ign_ = rows.filter((r) => r.status === 'IGNORADO').length, fail_ = rows.filter((r) => r.status === 'FALHA').length;
  const relatorio = ['# Relatório de QA por funcionalidade', '', `Gerado por \`npm run qa\` em ${new Date().toLocaleString('pt-BR')} — entrada real (mouse/teclado via Chromium), app executando de verdade.`, '',
    `**${ok_} de ${rows.length} funcionalidades OK**${ign_ ? `, ${ign_} ignorada(s) por limitação do ambiente (veja abaixo)` : ''}${fail_ ? ` — **${fail_} FALHA(S)**` : ''}.`, '', ...(metrics.length ? ['**Medições:** ' + metrics.join(' · '), ''] : []),
    '| # | Grupo | Funcionalidade | Como foi exercitada | Resultado | Captura |', '|---|---|---|---|---|---|',
    ...rows.map((r) => `| ${r.n} | ${r.group} | ${r.title} | ${r.how} | ${r.status === 'OK' ? '✅ OK' : r.status === 'IGNORADO' ? '⏭ IGNORADO' : '❌ FALHA'}${r.note ? ' — ' + r.note.replace(/\|/g, '/') : ''} | ${r.files.map((f) => `[${f.replace(/\.png$/, '')}](${f})`).join('<br>')} |`), '', '## Capturas', '',
    ...rows.flatMap((r) => [`### ${pad(r.n)} · ${r.group} › ${r.title}`, `${r.status === 'OK' ? '✅' : r.status === 'IGNORADO' ? '⏭' : '❌'} ${r.how}${r.note ? ` — _${r.note}_` : ''}`, '', ...r.files.map((f) => `![${f}](${f})`), ''])];
  fs.writeFileSync(path.join(OUT, 'RELATORIO-QA.md'), relatorio.join('\n'));
  fs.writeFileSync(path.join(OUT, 'resultado.json'), JSON.stringify({ rows, metrics, errosDeConsole: c.errors }, null, 2));
  console.log(`\n${ok_}/${rows.length} funcionalidades OK${ign_ ? `, ${ign_} ignorada(s) por ambiente` : ''}  ·  erros de console: ${c.errors.length}\n`);
  if (c.errors.length) console.log(c.errors.slice(0, 5).join('\n'));
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* temporários */ }
  app.exit(fail_ || c.errors.length ? 1 : 0);
})().catch((e) => { console.error('Falha no QA:', e); require('electron').app.exit(2); });
