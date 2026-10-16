'use strict';
// Ponta a ponta da rede de conhecimento (estilo Obsidian): links [[ ]], retrolinks, menções, grafo, vault e exportação.
const fs = require('fs');
const path = require('path');
const start = require('./harness');
const { MindMap, createNode } = require('../core/model');
const { writeMom, readMom } = require('../core/mom');

(async () => {
  const c = await start('MindCraft e2e — rede de conhecimento (links, grafo, vault, Obsidian)');
  const { js, wait, eq, ok, t, TMP, USERDATA } = c;
  const click = (sel) => js(`document.querySelector('${sel}').click()`);
  const txt = (sel) => js(`document.querySelector('${sel}').textContent`);
  const setVal = (sel, v, ev = 'input') => js(`(() => { const e = document.querySelector('${sel}'); e.value = ${JSON.stringify(v)}; e.dispatchEvent(new Event('${ev}', { bubbles: true })); })()`);
  // leitura estruturada do painel "Conexões"
  const links = async () => { await js('renderLinks()'); return js(`(() => { const out = []; let cur = null; for (const el of document.querySelector('#linksBody').children) {
    if (el.tagName === 'H4') { cur = { h: el.textContent, rows: [] }; out.push(cur); } else if (el.classList.contains('lk') && cur) cur.rows.push(el.querySelector('.t').textContent + (el.querySelector('.m') ? '|' + el.querySelector('.m').textContent : '')); } return out; })()`); };
  const rowsOf = (secs, prefix) => (secs.find((s) => s.h.startsWith(prefix)) || { rows: [] }).rows;

  // helpers dentro da página
  await js(`window.__gn = (title) => [...document.querySelectorAll('#gview .gn')].find((x) => x.querySelector('title').textContent.split(' — ')[0].replace(' (não existe)', '') === title);
    window.__gclick = (title) => { const n = __gn(title); n.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 5, clientY: 5 })); window.dispatchEvent(new MouseEvent('mouseup')); };
    window.__gcount = () => ({ nodes: document.querySelectorAll('#gview .gn').length, edges: document.querySelectorAll('#gview .edge').length });
    window.__setup = () => { const m = new MindMap(createNode('Estudos')); const p = m.addChild(m.root.id, 'Princípios'), l = m.addChild(m.root.id, 'Legalidade'), mo = m.addChild(m.root.id, 'Moralidade'); m.addChild(m.root.id, 'Isolado');
      m.update(p.id, { notes: 'Base: [[Legalidade]] e [[Inexistente]].' }); m.update(mo.id, { notes: 'Parente da legalidade, mas sem a impessoalidade.' }); m._undo.length = 0; adopt(m); dirty = false; selectedId = m.root.id; render(); return true; };
    true`);

  await t('links nas notas viram conexões: links de saída, retrolinks e link sem destino (fantasma)', async () => {
    await js(`__setup()`); await js(`__md(__id('Legalidade'))`);
    let s = await links();
    eq(rowsOf(s, 'Links deste'), [], 'Legalidade não cita ninguém'); eq(rowsOf(s, 'Citado em'), ['Princípios']);
    await js(`__md(__id('Princípios'))`); s = await links();
    eq(rowsOf(s, 'Links deste').sort(), ['Inexistente|não existe', 'Legalidade'].sort());
    eq(s.find((x) => x.h.startsWith('Links deste')).h, 'Links deste tópico (2)');
    ok(await js(`!!document.querySelector('#linksBody [data-create="Inexistente"]')`), 'botão de criar para o fantasma');
    // criar o tópico completa a rede
    await js(`document.querySelector('#linksBody [data-create="Inexistente"]').click()`); await wait(50);
    ok((await c.titles()).some((x) => x.endsWith(':Inexistente')), 'tópico criado'); eq(await js(`map.find(selectedId).node.title`), 'Princípios', 'continua no tópico de origem (para seguir escrevendo links)');
    await js(`__md(__id('Princípios'))`); s = await links();
    eq(rowsOf(s, 'Links deste').sort(), ['Inexistente', 'Legalidade'], 'o link agora tem destino');
    await js(`act.undo()`); await js(`__md(__id('Princípios'))`); s = await links();
    ok(rowsOf(s, 'Links deste').includes('Inexistente|não existe'), 'desfazer volta a ser fantasma');
  });

  await t('clicar numa conexão navega até o tópico; maiúsculas e acentos são ignorados na resolução', async () => {
    await js(`__setup()`); await js(`__md(__id('Princípios'))`); await links();
    await js(`[...document.querySelectorAll('#linksBody .lk')].find((r) => r.querySelector('.t').textContent === 'Legalidade').click()`); await wait(100);
    eq(await js(`map.find(selectedId).node.title`), 'Legalidade');
    await js(`map.update(__id('Moralidade'), { notes: 'veja [[LEGALIDADE]] e [[principios]]' }); __md(__id('Legalidade'))`);
    eq(rowsOf(await links(), 'Citado em').sort(), ['Moralidade', 'Princípios']);
  });

  await t('menções sem link: detecta o título citado em texto livre e transforma em [[link]] com um clique (desfazível)', async () => {
    await js(`__setup()`); await js(`__md(__id('Moralidade'))`);
    let s = await links();
    eq(rowsOf(s, 'Menções sem link'), ['Legalidade'], 'só palavras inteiras (impessoalidade não é tópico)');
    await js(`document.querySelector('#linksBody [data-linkify]').click()`); await wait(80);
    eq(await js(`map.find(__id('Moralidade')).node.notes`), 'Parente da [[legalidade]], mas sem a impessoalidade.', 'preserva a grafia original');
    s = await links(); eq(rowsOf(s, 'Menções sem link'), [], 'deixa de ser menção'); eq(rowsOf(s, 'Links deste'), ['Legalidade']);
    await js(`__md(__id('Legalidade'))`); eq(rowsOf(await links(), 'Citado em').sort(), ['Moralidade', 'Princípios']);
    await js(`act.undo()`); eq(await js(`map.find(__id('Moralidade')).node.notes`), 'Parente da legalidade, mas sem a impessoalidade.');
  });

  await t('autocompletar [[ nas notas: filtra, navega com setas, insere com Enter, Esc fecha e não reabre sem [[', async () => {
    await js(`__setup()`); await js(`showPanel('notes'); __md(__id('Isolado')); notes.focus()`);
    const type = (v) => js(`(() => { notes.value = ${JSON.stringify(v)}; notes.setSelectionRange(notes.value.length, notes.value.length); notes.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    const opts = () => js(`[...document.querySelectorAll('#linkSuggest .opt')].map((o) => o.firstChild.textContent)`);
    await type('ver [[le'); ok(await js(`!document.querySelector('#linkSuggest').hidden`), 'lista aberta');
    eq(await opts(), ['Legalidade'], 'filtra por "le" sem acento/caixa');
    await type('ver [[ali'); eq(await opts(), ['Legalidade', 'Moralidade'], 'ordenado: mais curtos/começo primeiro');
    await js(`__key('ArrowDown', notes)`); eq(await js(`document.querySelector('#linkSuggest .opt.on').firstChild.textContent`), 'Moralidade');
    await js(`__key('Enter', notes)`);
    eq(await js(`notes.value`), 'ver [[Moralidade]]', 'inseriu e fechou o link'); eq(await js(`notes.selectionStart`), 'ver [[Moralidade]]'.length, 'cursor depois de ]]');
    ok(await js(`document.querySelector('#linkSuggest').hidden`), 'lista fechada');
    await type('texto sem colchetes'); ok(await js(`document.querySelector('#linkSuggest').hidden`));
    await type('ver [[Prin'); await js(`__key('Escape', notes)`); ok(await js(`document.querySelector('#linkSuggest').hidden`), 'Esc fecha');
    await type('ver [[Prin'); await js(`document.querySelector('#linkSuggest .opt').dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))`);
    eq(await js(`notes.value`), 'ver [[Princípios]]', 'clique também insere');
    await js(`notes.value = 'x [[Legal]] y'; notes.setSelectionRange(9, 9); notes.dispatchEvent(new Event('input', { bubbles: true })); __key('Enter', notes)`);
    eq(await js(`notes.value`), 'x [[Legalidade]] y', 'não duplica ]] já existente');
    await js(`notes.blur()`); await wait(200);
  });

  await t('grafo (este mapa): nós, ligações, fantasma, seleção, busca, vizinhança, hierarquia, sem ligações, arrastar', async () => {
    await js(`__setup()`);
    await js(`closeGraph(); Object.assign(gOpt, { hier: false, orphans: true, local: false, q: '' }); gBuilt = false; gSel = null; gPinned = new Map(); gLayoutSig = ''`);   // estado limpo
    await click('[data-act="graph"]'); await c.waitFor(() => js(`document.querySelectorAll('#gview .gn').length > 0`));
    ok(await js(`!document.querySelector('#graph').hidden`), 'grafo aberto');
    eq(await js(`__gcount()`), { nodes: 6, edges: 2 }, '5 tópicos + 1 fantasma; 2 links (Princípios→Legalidade, →Inexistente)');
    ok((await txt('#gStat')).includes('5 tópicos · 2 ligações · 1 sem destino'), await txt('#gStat'));
    ok(await js(`!!__gn('Inexistente').querySelector('circle[stroke-dasharray]')`), 'fantasma tracejado');
    await js(`__gclick('Legalidade')`);
    eq(await txt('#gSide h3'), 'Legalidade'); ok((await txt('#gSide')).includes('Citado em (1)'));
    // busca destaca e esmaece o resto
    await setVal('#gSearch', 'moral');
    eq(await js(`document.querySelectorAll('#gview .gn.dim').length`), 5, 'só 1 de 6 fica nítido'); ok(await js(`!__gn('Moralidade').classList.contains('dim')`));
    await setVal('#gSearch', '');
    // só vizinhança do selecionado
    await js(`document.querySelector('#gLocal').click()`);
    eq(await js(`__gcount()`), { nodes: 2, edges: 1 }, 'Legalidade + Princípios');
    await js(`document.querySelector('#gLocal').click()`);
    // sem ligações
    await js(`document.querySelector('#gOrph').click()`);
    eq(await js(`__gcount().nodes`), 3, 'só quem tem ligação: Princípios, Legalidade e o fantasma');
    await js(`document.querySelector('#gOrph').click()`);
    // hierarquia
    await js(`document.querySelector('#gHier').click()`);
    eq(await js(`__gcount().edges`), 2 + 4, 'hierarquia soma 4 arestas pai→filho');
    await js(`document.querySelector('#gHier').click()`);
    // arrastar um nó e reposicionar: a posição sobrevive a um novo desenho
    const before = await js(`gLast.P[gLast.idx.get(gLast.g.idOf(curKey(), __id('Legalidade')))]`);
    await js(`(() => { const n = __gn('Legalidade'); n.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 300, clientY: 300 }));
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 380, clientY: 340 })); window.dispatchEvent(new MouseEvent('mouseup', { clientX: 380, clientY: 340 })); })()`);
    const moved = await js(`gLast.P[gLast.idx.get(gLast.g.idOf(curKey(), __id('Legalidade')))]`);
    ok(Math.hypot(moved.x - before.x, moved.y - before.y) > 20, 'nó se moveu');
    await js(`renderGraph(false)`);
    eq(await js(`gLast.P[gLast.idx.get(gLast.g.idOf(curKey(), __id('Legalidade')))]`), moved, 'posição mantida após redesenhar');
    // duplo clique abre o tópico e fecha o grafo
    await js(`__gn('Moralidade').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))`); await wait(150);
    ok(await js(`document.querySelector('#graph').hidden`), 'grafo fechou'); eq(await js(`map.find(selectedId).node.title`), 'Moralidade');
  });

  await t('o grafo oculto não cobre o mapa (regressão: display:flex vencia o atributo hidden)', async () => {
    await js(`__setup(); fit()`); await wait(100);
    ok(await js(`getComputedStyle(document.querySelector('#graph')).display === 'none'`), 'grafo display:none');
    ok(await js(`getComputedStyle(document.querySelector('#dash')).display === 'none'`), 'painel display:none');
    ok(await js(`(() => { const p = __pt(__id('Legalidade')); const e = document.elementFromPoint(p.x, p.y); return !!(e && e.closest('.node')); })()`), 'o ponto sobre um tópico atinge o tópico');
  });

  await t('Esc fecha o grafo; abrir o painel de estudos fecha o grafo; atalhos do mapa ficam desligados', async () => {
    await js(`__setup()`); await click('[data-act="graph"]'); await c.waitFor(() => js(`document.querySelectorAll('#gview .gn').length > 0`));
    const n0 = await js(`__titles().length`);
    await js(`document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }))`); eq(await js(`__titles().length`), n0, 'Delete não apaga');
    await js(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`); ok(await js(`document.querySelector('#graph').hidden`), 'Esc fecha');
    await click('[data-act="graph"]'); await click('[data-act="dash"]');
    ok(await js(`document.querySelector('#graph').hidden && !document.querySelector('#dash').hidden`), 'um painel por vez'); await click('[data-act="dash"]');
  });

  // ---------- vault de verdade: arquivos .mom em disco ----------
  const vault = path.join(TMP, 'meu vault ç');
  fs.mkdirSync(path.join(vault, 'sub'), { recursive: true });
  const mk = (name, build, dir = vault) => { const m = new MindMap(createNode(name)); build(m); const f = path.join(dir, name + '.mom'); writeMom(m, f); return f; };
  const fAdm = mk('Direito Administrativo', (m) => { const a = m.addChild(m.root.id, 'Princípios da Administração'); m.addChild(m.root.id, 'Atos'); m.update(a.id, { notes: 'Base constitucional: [[Direito Constitucional#Legalidade|legalidade]]. Ver também [[Informática#Segurança]].' }); });
  const fInf = mk('Informática', (m) => { m.addChild(m.root.id, 'Segurança'); m.addChild(m.root.id, 'Redes'); }, path.join(vault, 'sub'));
  const fDc = path.join(vault, 'Direito Constitucional.mom');

  await t('vault: escolher a pasta liga os mapas por [[Mapa#Tópico]]; o mapa aberto entra com edições NÃO salvas', async () => {
    await js(`(() => { const m = new MindMap(createNode('Direito Constitucional')); const l = m.addChild(m.root.id, 'Legalidade'); const p = m.addChild(m.root.id, 'Princípios');
      m.update(p.id, { notes: 'Compare com [[Direito Administrativo#Princípios da Administração]].' }); m._undo.length = 0; adopt(m); dirty = false; render(); return true; })()`);
    await js(`window.__dlg.save = ${JSON.stringify(fDc)}`); ok(await js(`save(true)`));
    // edição NÃO salva: novo link só em memória
    await js(`map.update(__id('Legalidade'), { notes: 'Veja [[Informática#Redes]] (não salvo)' }); dirty = true; rev++; render()`);
    await click('[data-act="graph"]'); await c.waitFor(() => js(`document.querySelectorAll('#gview .gn').length > 0`));
    await js(`window.__dlg.folder = ${JSON.stringify(vault)}`); await click('#gPick'); await c.waitFor(async () => (await txt('#gStat')).includes('3 mapa(s)'));
    eq(await js(`$('#gScope').value`), 'vault'); eq(JSON.parse(fs.readFileSync(path.join(USERDATA, 'config.json'), 'utf8')).vaultDir, vault, 'pasta persistida');
    ok((await txt('#gStat')).includes('3 mapa(s)'), await txt('#gStat'));
    ok((await txt('#gStat')).includes('0 sem destino'), 'todos os links entre mapas resolvem: ' + (await txt('#gStat')));
    const names = await js(`[...document.querySelectorAll('#gLegend div')].map((d) => d.textContent).sort()`);
    eq(names, ['Direito Administrativo', 'Direito Constitucional', 'Informática']);
    // aresta vinda da edição não salva (Legalidade -> Redes) e as vindas do disco
    const edges = await js(`gLast.edges.filter((e) => e.type === 'link').map((e) => gLast.g.byId.get(e.from).title + '>' + gLast.g.byId.get(e.to).title).sort()`);
    eq(edges, ['Legalidade>Redes', 'Princípios da Administração>Legalidade', 'Princípios da Administração>Segurança', 'Princípios>Princípios da Administração'].sort());
    // painel de conexões em modo vault: retrolinks vindos de OUTRO arquivo
    await js(`closeGraph(); __md(__id('Legalidade'))`); const s = await links();
    eq(rowsOf(s, 'Citado em'), ['Princípios da Administração|Direito Administrativo']);
    eq(rowsOf(s, 'Links deste'), ['Redes|Informática']);
  });

  await t('vault: duplo clique em tópico de outro mapa abre o arquivo (com confirmação se houver alterações)', async () => {
    await click('[data-act="graph"]'); await c.waitFor(() => js(`document.querySelectorAll('#gview .gn').length > 0`));
    // há alteração pendente (edição não salva): Cancelar bloqueia a troca
    ok(await js(`dirty`), 'há alterações pendentes'); await js(`window.__dlg.discard = 2`);
    await js(`__gn('Segurança').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))`); await wait(300);
    eq(await js(`filePath`), fDc, 'cancelar manteve o mapa aberto'); eq(await js(`dirty`), true);
    // Descartar: abre o outro arquivo e seleciona o tópico
    await click('[data-act="graph"]'); await c.waitFor(() => js(`document.querySelectorAll('#gview .gn').length > 0`)); await js(`window.__dlg.discard = 1`);
    await js(`__gn('Segurança').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))`); await c.waitFor(() => js(`path.resolve(filePath) === path.resolve(${JSON.stringify(fInf)})`));
    eq(await js(`path.resolve(filePath)`), path.resolve(fInf)); eq(await js(`map.find(selectedId).node.title`), 'Segurança');
    ok(await js(`document.querySelector('#graph').hidden`), 'grafo fechado');
    eq(fs.readFileSync(fDc).length > 0, true);
  });

  await t('exportar para o Obsidian: um .md por mapa com [[Mapa#Tópico]], sem sobrescrever notas pessoais; abrir no Obsidian (sem lançar)', async () => {
    await js(`openPath(${JSON.stringify(fDc)})`); await wait(300);
    const out = path.join(TMP, 'saida obsidian');
    fs.mkdirSync(path.join(out, 'MindCraft'), { recursive: true });
    fs.writeFileSync(path.join(out, 'MindCraft', 'Informática.md'), '# minha nota pessoal\n');
    await click('[data-act="graph"]'); await c.waitFor(() => js(`document.querySelectorAll('#gview .gn').length > 0`));
    await js(`window.__dlg.folder = ${JSON.stringify(out)}`); await click('#gExport'); await c.waitFor(() => js(`!!document.querySelector('#gMsg')`));
    const dir = path.join(out, 'MindCraft');
    eq(fs.readdirSync(dir).sort(), ['Direito Administrativo.md', 'Direito Constitucional.md', 'Informática (MindCraft).md', 'Informática.md']);
    eq(fs.readFileSync(path.join(dir, 'Informática.md'), 'utf8'), '# minha nota pessoal\n', 'nota pessoal intacta');
    const adm = fs.readFileSync(path.join(dir, 'Direito Administrativo.md'), 'utf8');
    ok(adm.includes('[[Direito Constitucional#Legalidade|legalidade]]') && adm.includes('[[Informática#Segurança]]'), 'links entre mapas'); ok(adm.startsWith('---\nmindcraft: true'));
    ok((await txt('#gMsg')).includes('3 nota(s) exportada(s)') && (await txt('#gMsg')).includes('não é do MindCraft'), await txt('#gMsg'));
    await click('#gObsidian'); await c.waitFor(async () => (await txt('#gMsg')).includes('obsidian://'));
    ok((await txt('#gMsg')).includes('obsidian://open?path=' + encodeURIComponent(dir)), await txt('#gMsg'));
    await click('#gClose');
  });

  await t('segurança: título/nota com HTML não vira marcação no grafo nem no painel de conexões', async () => {
    await js(`(() => { const m = new MindMap(createNode('<img src=x onerror=window.__pwned=1>')); const a = m.addChild(m.root.id, '"><svg onload=window.__pwned=1>'); m.update(a.id, { notes: '[[<b>fantasma</b>]] [[Mapa"><x>#y]]' }); adopt(m); render(); })()`);
    await js(`__md(__id('"><svg onload=window.__pwned=1>'))`); await links(); await click('[data-act="graph"]'); await c.waitFor(() => js(`document.querySelectorAll('#gview .gn').length > 0`));
    eq(await js(`document.querySelectorAll('#gview img, #gview svg svg, #linksBody img, #linksBody b, #gSide img').length`), 0, 'nenhum elemento injetado');
    eq(await js(`window.__pwned`), undefined, 'nenhum script executou'); await click('#gClose');
  });

  await t('vault grande (40 mapas × 25 tópicos com links cruzados): carrega, resolve e desenha em tempo razoável', async () => {
    const big = path.join(TMP, 'vault grande'); fs.mkdirSync(big);
    for (let i = 0; i < 40; i++) {
      const m = new MindMap(createNode('Disciplina ' + i));
      for (let j = 0; j < 25; j++) { const n = m.addChild(m.root.id, `Tópico ${i}.${j}`); if (j % 3 === 0) m.update(n.id, { notes: `Ver [[Disciplina ${(i + 1) % 40}#Tópico ${(i + 1) % 40}.${j}]] e [[Tópico ${i}.${(j + 1) % 25}]]` }); }
      writeMom(m, path.join(big, `Disciplina ${i}.mom`));
    }
    await js(`__setup()`); await js(`closeGraph(); Object.assign(gOpt, { hier: false, orphans: true, local: false, q: '' }); gBuilt = false; gPinned = new Map(); gLayoutSig = ''`);
    await js(`saveCfg({ vaultDir: ${JSON.stringify(big)}, scope: 'vault' })`);
    const t0 = Date.now(); await click('[data-act="graph"]'); await js(`renderGraph(true)`); const dt = Date.now() - t0;
    ok(dt < 25000, `demorou ${dt} ms`);
    const stat = await txt('#gStat'); ok(stat.includes('41 mapa(s)'), stat);
    const cnt = await js(`__gcount()`); ok(cnt.nodes > 1000 && cnt.edges > 500, JSON.stringify(cnt));
    await click('#gClose'); await js(`saveCfg({ scope: 'map' })`);
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  void readMom;
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
