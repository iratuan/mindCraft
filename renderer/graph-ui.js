'use strict';
/* Rede de conhecimento (estilo Obsidian): links [[ ]] entre tópicos/mapas, retrolinks, menções sem link,
   grafo interativo e exportação para o Obsidian. Carregado depois de study-ui.js (usa os globais dele e de renderer.js). */
const { buildGraph, neighborhood } = require(path.join(core, 'graph'));
const { forceLayout } = require(path.join(core, 'forcelayout'));
const { loadVault } = require(path.join(core, 'vault'));
const { unlinkedMentions, linkify } = require(path.join(core, 'mentions'));
const { exportObsidian } = require(path.join(core, 'obsidian'));
const { norm } = require(path.join(core, 'links'));

const gesc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- coleta dos mapas ----------
const curKey = () => (filePath ? path.resolve(filePath) : '(mapa atual)');
const curName = () => (filePath ? path.basename(filePath, path.extname(filePath)) : map.root.title || 'Mapa atual');
/** O mapa aberto entra SEMPRE pela memória (com edições não salvas); os demais vêm do disco. */
function gatherMaps(scope) {
  const me = { key: curKey(), name: curName(), map, file: filePath || null };
  const base = { maps: [me], errors: [], truncated: false };
  if (scope !== 'vault') return base;
  const dir = vaultDirEff();
  if (!dir) return { ...base, noDir: true };
  const v = loadVault(dir);
  const mine = filePath ? path.resolve(filePath).toLowerCase() : null;
  const others = v.maps.filter((m) => path.resolve(m.file).toLowerCase() !== mine).map((m) => ({ key: path.resolve(m.file), name: m.name, map: m.map, file: m.file }));
  return { maps: [me, ...others], errors: v.errors, truncated: v.truncated, dir };
}
const activeScope = () => (loadCfg().scope === 'vault' && vaultDirEff() ? 'vault' : 'map');

/** Revisões pendentes nos OUTROS mapas da pasta do vault (somente leitura). */
function vaultDue(today) {
  const info = gatherMaps('vault');
  const maps = [];
  for (const mp of info.maps.slice(1)) {
    const sm = S.summary(mp.map, { today });
    if (sm.due.length) maps.push({ name: mp.name, key: mp.key, count: sm.due.length, items: sm.due.slice(0, 6) });
  }
  maps.sort((x, y) => y.count - x.count || x.name.localeCompare(y.name, 'pt-BR'));
  return { maps, scanned: info.maps.length - 1, dir: info.dir || null };
}

// ---------- navegação ----------
/** Vai até um tópico, abrindo outro mapa (com confirmação de alterações pendentes) se preciso. */
async function openTopic(n) {
  if (!n || n.kind !== 'topic') return;
  if (n.mapKey === curKey()) { closeGraph(); closeDash(); goTo(n.topicId); return true; }
  if (!fs.existsSync(n.mapKey)) { setStatus('O arquivo do mapa não existe mais: ' + n.mapKey); return false; }
  closeGraph(); closeDash();
  if (!(await confirmDiscard())) return false;
  await openPath(n.mapKey);
  if (map.find(n.topicId)) goTo(n.topicId); else setStatus('O tópico não foi encontrado no mapa aberto.');
  return true;
}
function createTopicFromLink(title) {
  const parent = selectedId || map.root.id;
  const t = title.trim();
  if (!t || /#/.test(t)) return false;                       // "Mapa#Tópico" fantasma: o mapa de destino não existe
  change(() => map.addChild(parent, t));
  setStatus(`Tópico "${t}" criado: o link agora tem destino.`);
  return true;
}

// ---------- painel "Conexões" (links, retrolinks, menções) ----------
let linksTimer = null;
function syncLinks() {
  if (typeof map === 'undefined') return;
  clearTimeout(linksTimer);
  linksTimer = setTimeout(renderLinks, 160);
}
/** Junta arestas para o MESMO tópico (um [[link]] + uma seta desenhada = uma conexão só). Mantém o rótulo da seta. */
function mergeEdges(edges, pick) {
  const m = new Map();
  for (const e of edges) {
    const k = pick(e), cur = m.get(k);
    if (!cur) m.set(k, { e, rel: e.type === 'relation', label: e.type === 'relation' ? e.label || '' : '', link: e.type === 'link' });
    else { if (e.type === 'relation') { cur.rel = true; cur.label = cur.label || e.label || ''; } if (e.type === 'link') cur.link = true; }
  }
  return [...m.values()];
}
function lkRow(g, n, { meta, ghostBtn, onClick, type, label } = {}) {
  const r = el('div', 'lk' + (n.kind === 'ghost' ? ' ghost' : ''));
  const dot = el('span', 'dot'); dot.style.background = n.kind === 'ghost' ? 'transparent' : mapColor(n.mapKey); if (n.kind === 'ghost') dot.style.border = '1px dashed var(--text-dim)';
  r.append(dot, el('span', 't', n.title));
  if (type === 'relation') { const s = el('span', 'm rel', label ? `seta · ${label}` : 'seta'); s.title = 'Relação desenhada no mapa (conta como conexão na rede)'; r.append(s); }
  if (meta) r.append(el('span', 'm', meta));
  if (ghostBtn) { const b = el('button', 'go', '＋'); b.title = 'Criar este tópico'; b.dataset.create = n.title; b.onclick = (e) => { e.stopPropagation(); ghostBtn(); }; r.append(b); }
  if (onClick) r.onclick = onClick;
  return r;
}
function renderLinks() {
  const box = $('#linksBody'); if (!box) return;
  box.textContent = '';
  const sel = primary();
  if (!sel) { box.append(el('div', 'muted', 'Selecione um tópico. Escreva [[Título]] nas notas para ligar conteúdos.')); return; }
  const info = gatherMaps(activeScope());
  const g = buildGraph(info.maps);
  const me = g.idOf(curKey(), sel.node.id);
  const out = mergeEdges(g.outgoing(me), (e) => e.to), inn = mergeEdges(g.incoming(me), (e) => e.from);
  const here = (n) => (n.mapKey === curKey() ? '' : n.mapName);

  box.append(el('h4', '', `Links deste tópico (${out.length})`));
  if (!out.length) box.append(el('div', 'muted', 'Nenhum. Digite [[ nas notas para ligar a outro tópico.'));
  for (const { e, rel, label } of out) {
    const n = g.byId.get(e.to);
    box.append(lkRow(g, n, { meta: n.kind === 'ghost' ? 'não existe' : here(n), type: rel ? 'relation' : 'link', label, onClick: () => openTopic(n), ghostBtn: n.kind === 'ghost' && !/#/.test(n.title) ? () => createTopicFromLink(n.title) : null }));
  }
  box.append(el('h4', '', `Citado em (${inn.length})`));
  if (!inn.length) box.append(el('div', 'muted', 'Nenhum tópico cita este.'));
  for (const { e, rel, label } of inn) { const n = g.byId.get(e.from); box.append(lkRow(g, n, { meta: here(n), type: rel ? 'relation' : 'link', label, onClick: () => openTopic(n) })); }

  const men = unlinkedMentions(info.maps, curKey(), sel.node);
  if (men.length) {
    box.append(el('h4', '', `Menções sem link (${men.length})`));
    for (const m of men) {
      const row = lkRow(g, { ...m, kind: 'topic' }, { meta: m.mapKey === curKey() ? '' : m.mapName, onClick: () => openTopic({ ...m, kind: 'topic' }) });
      const b = el('button', 'go', '[[ ]]'); b.title = 'Transformar em link'; b.style.width = 'auto'; b.style.padding = '0 6px'; b.dataset.linkify = m.id;
      b.onclick = (e) => { e.stopPropagation(); linkifyMention(sel.node, m); };
      row.append(b); box.append(row);
    }
  }
  if (info.noDir === undefined && activeScope() === 'map' && loadCfg().scope !== 'vault') box.append(el('div', 'muted', 'Dica: no grafo, escolha a pasta do vault para ligar este mapa a outros.'));
}
/** Troca a 1ª menção por [[link]] (nas notas; se só aparece no título, no título). */
function linkifyMention(node, m) {
  const target = m.mapKey === curKey() ? undefined : `${m.mapName}#${m.title}`;
  const inNotes = linkify(node.notes || '', m.title, { target });
  if (inNotes != null) change(() => map.update(node.id, { notes: inNotes }));
  else {
    const inTitle = linkify(node.title, m.title, { target });
    if (inTitle != null) change(() => map.update(node.id, { title: inTitle }));
    else setStatus('Não encontrei a menção para transformar em link.');
  }
}

// ---------- autocompletar [[ nas notas ----------
const sug = $('#linkSuggest');
let sugItems = [], sugIdx = 0, sugAt = null;
function hideSuggest() { sug.hidden = true; sugItems = []; sugAt = null; }
/** Posição (x, y, altura de linha) do cursor dentro de um <textarea>, medida com um espelho invisível. */
function caretXY(ta, pos) {
  const cs = getComputedStyle(ta), m = document.createElement('div');
  for (const p of ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderRightWidth', 'borderLeftWidth', 'boxSizing', 'tabSize']) m.style[p] = cs[p];
  Object.assign(m.style, { position: 'absolute', visibility: 'hidden', top: '0', left: '-9999px', width: ta.clientWidth + 'px', whiteSpace: 'pre-wrap', overflowWrap: 'break-word' });
  m.textContent = ta.value.slice(0, pos);
  const mark = document.createElement('span'); mark.textContent = ta.value.slice(pos, pos + 1) || '.'; m.append(mark); document.body.append(m);
  const r = { x: mark.offsetLeft, y: mark.offsetTop, h: parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.35 };
  m.remove(); return r;
}
function placeSuggest() {
  const c = caretXY(notes, notes.selectionStart), w = Math.min(300, notes.clientWidth);
  sug.style.width = w + 'px'; sug.style.right = 'auto';
  sug.style.left = Math.max(0, Math.min(c.x, notes.clientWidth - w)) + 'px';
  sug.style.top = (c.y - notes.scrollTop + c.h + 4) + 'px'; sug.style.bottom = 'auto'; sug.style.marginTop = '0';
}
function updateSuggest() {
  if (notes.disabled || notesOwner == null || notesOwner.rel) return hideSuggest();
  const pos = notes.selectionStart, before = notes.value.slice(0, pos);
  const m = /\[\[([^\[\]\n]*)$/.exec(before);
  if (!m) return hideSuggest();
  const q = norm(m[1]);
  const info = gatherMaps(activeScope());
  const cands = [];
  for (const mp of info.maps) {
    const own = mp.key === curKey();
    cands.push({ text: own ? mp.map.root.title : mp.name, meta: own ? 'este mapa' : 'mapa', root: true });
    mp.map.walk((n, lvl) => { if (lvl > 0) cands.push({ text: own ? n.title : `${mp.name}#${n.title}`, meta: own ? 'este mapa' : mp.name }); });
  }
  const seen = new Set();
  sugItems = cands.filter((c) => { const k = norm(c.text); if (seen.has(k) || (q && !k.includes(q))) return false; seen.add(k); return true; })
    .sort((a, b) => (norm(a.text).startsWith(q) ? 0 : 1) - (norm(b.text).startsWith(q) ? 0 : 1) || a.text.length - b.text.length).slice(0, 8);
  if (!sugItems.length) return hideSuggest();
  sugIdx = Math.min(sugIdx, sugItems.length - 1); sugAt = { start: m.index + 2, end: pos };
  sug.textContent = '';
  sugItems.forEach((c, i) => {
    const o = el('div', 'opt' + (i === sugIdx ? ' on' : ''), c.text); o.append(el('span', '', c.meta)); o.dataset.i = i;
    o.onmousedown = (e) => { e.preventDefault(); applySuggest(i); };   // mousedown: não tira o foco do campo
    sug.append(o);
  });
  sug.hidden = false; placeSuggest();
}
function applySuggest(i) {
  const c = sugItems[i]; if (!c || !sugAt) return;
  const v = notes.value, after = v.slice(sugAt.end);
  const closed = after.startsWith(']]');
  notes.value = v.slice(0, sugAt.start) + c.text + (closed ? '' : ']]') + after;
  const caret = sugAt.start + c.text.length + 2;
  notes.setSelectionRange(caret, caret);
  hideSuggest(); notes.dispatchEvent(new Event('input', { bubbles: true }));
}
notes.addEventListener('input', () => { sugIdx = 0; updateSuggest(); });
notes.addEventListener('click', updateSuggest);
notes.addEventListener('blur', () => setTimeout(hideSuggest, 150));
notes.addEventListener('keydown', (e) => {
  if (sug.hidden) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sugIdx = (sugIdx + (e.key === 'ArrowDown' ? 1 : -1) + sugItems.length) % sugItems.length; updateSuggest(); }
  else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); applySuggest(sugIdx); }
  else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); hideSuggest(); }
}, true);

// ---------- grafo ----------
let gBuilt = false;
const gOpt = { hier: true, orphans: true, local: false, depth: 1, q: '' };   // hierarquia ligada: cada mapa vira uma constelação
let gSel = null;                                  // id do nó selecionado no grafo
let gTrans = { x: 0, y: 0, k: 1 };
let gPinned = new Map();                          // posições arrastadas à mão
let gLayoutSig = '', gPos = new Map(), gLast = null;
let lastExportDir = null;
const PALETTE = (i) => `hsl(${(i * 67 + 205) % 360} 68% 60%)`;
const colorIdx = new Map();
function mapColor(key) { if (!colorIdx.has(key)) colorIdx.set(key, colorIdx.size); return PALETTE(colorIdx.get(key)); }

function buildGraphUI() {
  const root = $('#graph'); root.textContent = '';
  const bar = el('div', 'g-bar');
  const sc = el('select'); sc.id = 'gScope'; sc.append(new Option('Este mapa', 'map'), new Option('Vault (pasta)', 'vault'));
  const dirTxt = el('span', 'path'); dirTxt.id = 'gDir';
  const pick = el('button', 'btn', 'Pasta…'); pick.id = 'gPick'; pick.title = 'Escolher a pasta com seus mapas (.mom)';
  const chk = (id, label, key) => { const l = el('label'); const i = el('input'); i.type = 'checkbox'; i.id = id; i.checked = gOpt[key]; i.onchange = () => { gOpt[key] = i.checked; renderGraph(true); }; l.append(i, document.createTextNode(label)); return l; };
  const depth = el('select'); depth.id = 'gDepth'; for (const d of [1, 2, 3]) depth.append(new Option(`${d} salto${d > 1 ? 's' : ''}`, d));
  depth.onchange = () => { gOpt.depth = +depth.value; renderGraph(true); };
  const q = el('input'); q.type = 'search'; q.id = 'gSearch'; q.placeholder = 'Buscar no grafo…';
  q.oninput = () => { gOpt.q = q.value; renderGraph(false); };
  q.onkeydown = (e) => { if (e.key === 'Enter') centerOnMatch(); e.stopPropagation(); };
  const refresh = el('button', 'btn', 'Atualizar'); refresh.id = 'gRefresh'; refresh.onclick = () => renderGraph(true);
  const exp = el('button', 'btn', 'Exportar p/ Obsidian…'); exp.id = 'gExport'; exp.onclick = exportVault;
  const obs = el('button', 'btn', 'Abrir no Obsidian'); obs.id = 'gObsidian'; obs.onclick = openInObsidian;
  const close = el('button', 'btn primary', 'Fechar'); close.id = 'gClose'; close.onclick = closeGraph;
  sc.onchange = () => { saveCfg({ scope: sc.value }); renderGraph(true); };
  pick.onclick = pickVaultDir;
  bar.append(el('label', '', 'Escopo'), sc, dirTxt, pick, chk('gHier', 'Hierarquia', 'hier'), chk('gOrph', 'Sem ligações', 'orphans'), chk('gLocal', 'Só vizinhança', 'local'), depth, q, refresh, el('span', 'grow'), exp, obs, close);
  const main = el('div', 'g-main'), wrap = el('div', 'g-wrap');
  wrap.innerHTML = '<svg id="gsvg"><g id="gview"></g></svg>';
  const lg = el('div', 'g-legend'); lg.id = 'gLegend'; const st = el('div', 'g-stat'); st.id = 'gStat';
  wrap.append(lg, st);
  const side = el('aside', 'g-side'); side.id = 'gSide';
  main.append(wrap, side); root.append(bar, main);
  bindGraphEvents();
  gBuilt = true;
}

function openGraph() {
  commitNotes(); if (dashOpen) closeDash();
  if (!gBuilt) buildGraphUI();
  graphOpen = true; $('#graph').hidden = false; document.querySelector('[data-act="graph"]').classList.add('on');
  const c = loadCfg(); $('#gScope').value = c.scope === 'vault' ? 'vault' : 'map';
  gSel = selectedId ? `${curKey()}::${selectedId}` : null;
  renderGraph(true); fitGraph();
}
function closeGraph() { graphOpen = false; const g = $('#graph'); if (g) g.hidden = true; const b = document.querySelector('[data-act="graph"]'); if (b) b.classList.remove('on'); }
act.graph = () => (graphOpen ? closeGraph() : openGraph());

async function pickVaultDir() {
  const dir = await ipcRenderer.invoke('dialog:folder', 'Pasta com os seus mapas (.mom)');
  if (!dir) return;
  saveCfg({ vaultDir: dir, scope: 'vault' }); $('#gScope').value = 'vault'; renderGraph(true); fitGraph();
}

function djb(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h; }

/** Calcula o conjunto visível, o layout (em cache) e desenha. relayout=false mantém as posições (busca/seleção). */
function renderGraph(relayout) {
  const scope = $('#gScope').value === 'vault' && vaultDirEff() ? 'vault' : 'map';
  const info = gatherMaps(scope);
  const g = buildGraph(info.maps, { hierarchy: gOpt.hier });
  let nodes = g.nodes, edges = g.edges;
  if (gOpt.local) {
    const centre = gSel && g.byId.has(gSel) ? gSel : g.idOf(curKey(), selectedId || map.root.id);
    const nb = neighborhood(g, centre, gOpt.depth); nodes = nb.nodes; edges = nb.edges;
  }
  if (!gOpt.orphans) nodes = nodes.filter((n) => n.deg > 0);
  const ids = new Set(nodes.map((n) => n.id));
  edges = edges.filter((e) => ids.has(e.from) && ids.has(e.to));

  const sig = String(djb(nodes.map((n) => n.id).join('|') + '#' + edges.map((e) => `${e.from}>${e.to}${e.type[0]}`).join('|')));
  if (relayout || sig !== gLayoutSig) {
    if (sig !== gLayoutSig) { gPos = forceLayout(nodes, edges, { seed: 1 }); gLayoutSig = sig; gPinned = new Map([...gPinned].filter(([k]) => ids.has(k))); }
  }
  const idx = new Map(nodes.map((n, i) => [n.id, i]));
  const P = nodes.map((n) => gPinned.get(n.id) || gPos.get(n.id) || { x: 0, y: 0 });
  const adj = nodes.map(() => new Set());
  for (const e of edges) { adj[idx.get(e.from)].add(idx.get(e.to)); adj[idx.get(e.to)].add(idx.get(e.from)); }
  const q = norm(gOpt.q);
  const match = nodes.map((n) => !q || norm(n.title).includes(q));
  const R = (n) => Math.min(20, 6 + Math.sqrt(n.deg) * 3.2) + (n.isRoot ? 3 : 0);
  gLast = { g, nodes, edges, idx, P, adj, R, match };

  const parts = [];
  edges.forEach((e, i) => {
    const st = e.type === 'relation' ? 'stroke="#e5484d" stroke-dasharray="6 4" stroke-width="1.6" opacity=".9"' : e.type === 'hierarchy' ? 'stroke="#8a94a6" stroke-width=".9" opacity=".32"' : 'stroke="#b7c3dd" stroke-width="1.8" opacity=".85"';
    parts.push(`<line class="edge" data-e="${i}" vector-effect="non-scaling-stroke" ${st}/>`);
  });
  nodes.forEach((n, i) => {
    const ghost = n.kind === 'ghost', hit = q && match[i], sel = n.id === gSel;
    const fill = ghost ? 'none' : mapColor(n.mapKey), stroke = ghost ? 'var(--text-dim)' : sel ? '#ff9800' : 'rgba(255,255,255,.25)';
    parts.push(`<g class="gn${q && !match[i] ? ' dim' : ''}" data-i="${i}"><circle r="${R(n)}" fill="${fill}" stroke="${stroke}" stroke-width="${sel ? 3 : ghost ? 1.4 : 1}"${ghost ? ' stroke-dasharray="3 2"' : ''}/>`
      + (hit ? `<circle r="${R(n) + 5}" fill="none" stroke="#ffeb3b" stroke-width="2"/>` : '')
      + `<text class="glabel" y="${R(n)}" dy="1.45em" text-anchor="middle"${ghost ? ' font-style="italic"' : ''}>${gesc(n.title.length > 38 ? n.title.slice(0, 37) + '…' : n.title)}</text><title>${gesc(n.title)}${n.mapName ? ' — ' + gesc(n.mapName) : ' (não existe)'}</title></g>`);
  });
  $('#gview').innerHTML = parts.join('');
  gLast.labels = nodes.map((_, i) => $('#gview').querySelector(`.gn[data-i="${i}"] text`));
  positionAll();
  applyT();

  const maps = [...new Set(nodes.filter((n) => n.mapKey).map((n) => n.mapKey))];
  const lg = $('#gLegend'); lg.textContent = '';
  for (const k of maps.slice(0, 10)) { const d = el('div'); const i = el('i'); i.style.background = mapColor(k); d.append(i, document.createTextNode(g.nodes.find((n) => n.mapKey === k).mapName)); lg.append(d); }
  const ghosts = nodes.filter((n) => n.kind === 'ghost').length;
  $('#gStat').textContent = `${nodes.length - ghosts} tópicos · ${edges.filter((e) => e.type !== 'hierarchy').length} ligações · ${ghosts} sem destino · ${maps.length} mapa(s)`
    + (info.truncated ? ' · pasta grande: leitura parcial' : '') + (info.errors && info.errors.length ? ` · ${info.errors.length} arquivo(s) ilegível(is)` : '');
  $('#gDir').textContent = scope === 'vault' ? (info.dir || '') : '(somente o mapa aberto)'; $('#gDir').title = info.dir || '';
  $('#gDepth').disabled = !gOpt.local;
  renderGraphSide();
}

/** Aplica pan/zoom e informa o zoom ao CSS (--k) para os rótulos terem tamanho constante na tela. */
function applyT() {
  $('#gview').setAttribute('transform', `translate(${gTrans.x} ${gTrans.y}) scale(${gTrans.k})`);
  const sv = $('#gsvg'); sv.style.setProperty('--k', gTrans.k); sv.classList.toggle('zoomed', gTrans.k >= 1.4);
  scheduleLabels();
}

/** Rótulos têm tamanho fixo na tela; os que colidiriam com um de maior prioridade ficam ocultos até dar zoom ou passar o mouse. */
let lblTimer = null;
function scheduleLabels() { clearTimeout(lblTimer); lblTimer = setTimeout(updateLabels, 80); }
function updateLabels() {
  if (!gLast || !graphOpen || !gLast.labels) return;
  const { nodes, P, R, match, labels } = gLast, k = gTrans.k, r = $('#gsvg').getBoundingClientRect();
  const score = (i) => (nodes[i].id === gSel ? 1e6 : 0) + (gOpt.q && match[i] ? 1e5 : 0) + (nodes[i].isRoot ? 1e3 : 0) + nodes[i].deg * 10;
  const order = nodes.map((_, i) => i).sort((a, b) => score(b) - score(a));
  const placed = [];
  for (const i of order) {
    const el0 = labels[i]; if (!el0) continue;
    const w = Math.min(38, nodes[i].title.length) * 6.3 + 10, h = 15;
    const x = P[i].x * k + gTrans.x - w / 2, y = P[i].y * k + gTrans.y + R(nodes[i]) * k + 4;
    const inside = x > -4 && x + w < r.width + 4 && y > 0 && y + h < r.height + 4;
    const force = nodes[i].id === gSel || (gOpt.q && match[i]);
    const clash = placed.some((p) => x < p.x + p.w && p.x < x + w && y < p.y + p.h && p.y < y + h);
    const show = force || (inside && !clash);
    el0.style.display = show ? '' : 'none';
    if (show) placed.push({ x, y, w, h });
  }
}
function positionAll() {
  if (!gLast) return;
  const { P, edges, idx, nodes } = gLast;
  const gv = $('#gview');
  gv.querySelectorAll('.gn').forEach((el0) => { const p = P[+el0.dataset.i]; el0.setAttribute('transform', `translate(${p.x} ${p.y})`); });
  gv.querySelectorAll('.edge').forEach((l) => { const e = edges[+l.dataset.e], a = P[idx.get(e.from)], b = P[idx.get(e.to)]; l.setAttribute('x1', a.x); l.setAttribute('y1', a.y); l.setAttribute('x2', b.x); l.setAttribute('y2', b.y); });
  applyT();
  void nodes;
}
function fitGraph() {
  if (!gLast || !gLast.nodes.length) return;
  const svgEl = $('#gsvg'), r = svgEl.getBoundingClientRect();
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const p of gLast.P) { x1 = Math.min(x1, p.x); y1 = Math.min(y1, p.y); x2 = Math.max(x2, p.x); y2 = Math.max(y2, p.y); }
  const w = Math.max(40, x2 - x1), h = Math.max(40, y2 - y1), mx = 150, my = 70; // margens em pixels: sobra espaço para os rótulos
  gTrans.k = Math.max(0.1, Math.min((r.width - 2 * mx) / w, (r.height - 2 * my) / h, 2.2));
  gTrans.x = r.width / 2 - ((x1 + x2) / 2) * gTrans.k; gTrans.y = r.height / 2 - ((y1 + y2) / 2) * gTrans.k;
  applyT();
  $('#gsvg').classList.toggle('zoomed', gTrans.k >= 1.4);
}
function centerOnMatch() {
  if (!gLast) return;
  const i = gLast.match.findIndex((m, k) => m && gOpt.q && gLast.nodes[k]);
  if (i < 0) return;
  const r = $('#gsvg').getBoundingClientRect(), p = gLast.P[i];
  gTrans.k = Math.max(gTrans.k, 1.2); gTrans.x = r.width / 2 - p.x * gTrans.k; gTrans.y = r.height / 2 - p.y * gTrans.k;
  gSel = gLast.nodes[i].id; renderGraph(false);
}

function renderGraphSide() {
  const side = $('#gSide'); side.textContent = '';
  if (!gLast) return;
  const { g } = gLast;
  const n = gSel && g.byId.get(gSel);
  if (!n) {
    side.append(el('h3', '', 'Rede de conhecimento'), el('div', 'sub', 'Cada ponto é um tópico; cada linha, um [[link]] (sólida), uma relação do mapa (tracejada vermelha) ou, se ativada, a hierarquia.'),
      el('div', 'muted', 'Clique num ponto para ver conexões · duplo clique abre o tópico · arraste para reposicionar · roda do mouse dá zoom.'),
      el('div', 'muted', 'Pontos tracejados são links sem destino: crie o tópico para completar a rede.'));
    return;
  }
  side.append(el('h3', '', n.title), el('div', 'sub', n.kind === 'ghost' ? 'Link sem destino' : `${n.mapName}${n.isRoot ? ' · raiz do mapa' : ''}${n.progress != null ? ` · ${n.progress}%` : ''}`));
  const btns = el('div', 'btnrow');
  if (n.kind === 'topic') { const b = el('button', 'btn primary', 'Ir para o tópico'); b.id = 'gGo'; b.onclick = () => openTopic(n); btns.append(b); }
  else if (!/#/.test(n.title)) { const b = el('button', 'btn primary', 'Criar este tópico'); b.id = 'gCreate'; b.onclick = () => { if (createTopicFromLink(n.title)) { gSel = null; renderGraph(true); } }; btns.append(b); }
  side.append(btns);
  const list = (title, arr, pick) => {
    side.append(el('h4', '', `${title} (${arr.length})`));
    if (!arr.length) side.append(el('div', 'muted', 'Nenhum.'));
    for (const e of arr) { const o = g.byId.get(pick(e)); const r = lkRow(g, o, { meta: o.mapName && o.mapKey !== n.mapKey ? o.mapName : '', type: e.type, onClick: () => { gSel = o.id; renderGraph(false); } }); side.append(r); }
  };
  list('Links', g.outgoing(n.id), (e) => e.to); list('Citado em', g.incoming(n.id), (e) => e.from);
}

function bindGraphEvents() {
  const svgEl = $('#gsvg');
  let drag = null;
  svgEl.addEventListener('mousedown', (e) => {
    const nd = e.target.closest('.gn');
    // duplo clique no nó (o redesenho entre os cliques impede o `dblclick` nativo): abre o tópico
    if (nd && e.detail === 2) { drag = null; openTopic(gLast.nodes[+nd.dataset.i]); return; }
    drag = { sx: e.clientX, sy: e.clientY, ox: gTrans.x, oy: gTrans.y, i: nd ? +nd.dataset.i : null, moved: false };
  });
  window.addEventListener('mousemove', (e) => {
    if (!drag || !graphOpen) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    if (drag.i == null) { gTrans.x = drag.ox + dx; gTrans.y = drag.oy + dy; applyT(); svgEl.classList.add('panning'); }
    else {
      const r = svgEl.getBoundingClientRect(), p = { x: (e.clientX - r.left - gTrans.x) / gTrans.k, y: (e.clientY - r.top - gTrans.y) / gTrans.k };
      gLast.P[drag.i] = p; gPinned.set(gLast.nodes[drag.i].id, p); positionAll();
    }
  });
  window.addEventListener('mouseup', () => {
    if (!drag) return;
    svgEl.classList.remove('panning');
    const d = drag; drag = null;
    if (!graphOpen || d.moved) return;
    gSel = d.i == null ? null : gLast.nodes[d.i].id;
    renderGraph(false);
  });
  svgEl.addEventListener('dblclick', (e) => { const nd = e.target.closest('.gn'); if (nd) openTopic(gLast.nodes[+nd.dataset.i]); });
  svgEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    const r = svgEl.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    const k = Math.min(6, Math.max(0.15, gTrans.k * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
    gTrans.x = mx - ((mx - gTrans.x) / gTrans.k) * k; gTrans.y = my - ((my - gTrans.y) / gTrans.k) * k; gTrans.k = k;
    applyT();
  }, { passive: false });
  // destaque dos vizinhos ao passar o mouse (sem redesenhar)
  svgEl.addEventListener('mouseover', (e) => {
    const nd = e.target.closest('.gn'); if (!nd || drag) return;
    const i = +nd.dataset.i, keep = new Set([i, ...gLast.adj[i]]);
    keep.forEach((j) => { if (gLast.labels[j]) gLast.labels[j].style.display = ''; });
    $('#gview').querySelectorAll('.gn').forEach((x) => x.classList.toggle('dim', !keep.has(+x.dataset.i)));
    $('#gview').querySelectorAll('.edge').forEach((l) => { const ed = gLast.edges[+l.dataset.e]; l.classList.toggle('dim', !(gLast.idx.get(ed.from) === i || gLast.idx.get(ed.to) === i)); });
  });
  svgEl.addEventListener('mouseout', (e) => {
    if (!e.target.closest('.gn')) return;
    $('#gview').querySelectorAll('.dim').forEach((x) => x.classList.remove('dim'));
    scheduleLabels();
    if (gOpt.q) $('#gview').querySelectorAll('.gn').forEach((x) => { if (!gLast.match[+x.dataset.i]) x.classList.add('dim'); });
  });
}

// ---------- exportar / abrir no Obsidian ----------
function sideMsg(text, cls) { const s = $('#gSide'); const m = el('div', 'msg ' + (cls || ''), text); m.id = 'gMsg'; s.prepend(m); }
async function exportVault() {
  const dir = await ipcRenderer.invoke('dialog:folder', 'Pasta de destino (será criada a subpasta "MindCraft")');
  if (!dir) return;
  try {
    const info = gatherMaps(activeScope());
    const r = exportObsidian(info.maps, path.join(dir, 'MindCraft'));
    lastExportDir = r.dir;
    renderGraphSide();
    sideMsg(`${r.files.length} nota(s) exportada(s) para ${r.dir}.${r.warnings.length ? ' Avisos: ' + r.warnings.join(' ') : ''}`, 'ok');
    setStatus('Exportado para o Obsidian: ' + r.dir);
  } catch (e) { sideMsg('Falha ao exportar: ' + e.message, 'err'); }
}
async function openInObsidian() {
  const dir = lastExportDir || (activeScope() === 'vault' ? vaultDirEff() : null);
  if (!dir) { sideMsg('Exporte primeiro (ou escolha a pasta do vault).', 'err'); return; }
  const r = await ipcRenderer.invoke('obsidian:open', dir);
  sideMsg(r.ok ? (r.method === 'skipped' ? 'Abriria no Obsidian: ' + r.url : 'Abrindo no Obsidian…') : 'Não consegui abrir o Obsidian: ' + (r.error || ''), r.ok ? 'ok' : 'err');
}

window.addEventListener('keydown', (e) => { if (graphOpen && e.key === 'Escape' && !present) { e.stopPropagation(); closeGraph(); } }, true);
render();
