'use strict';
/* Rede de conhecimento: links [[ ]] entre tópicos e mapas, retrolinks, menções sem link e grafo interativo.
   Os mapas vêm do mapa aberto ou da pasta escolhida (vault). Carregado depois de renderer.js (usa os globais dele). */
const { buildGraph, neighborhood } = require(path.join(core, 'components', 'graph'));
const { forceLayout } = require(path.join(core, 'components', 'forcelayout'));
const { placeLabels, relationLabelAnchor } = require(path.join(core, 'components', 'graph-labels'));
const { loadVault } = require(path.join(core, 'services', 'vault'));
const { getTheme } = require(path.join(core, 'components', 'themes'));
const { unlinkedMentions, linkify } = require(path.join(core, 'components', 'mentions'));
const { norm, migrateLegacyLinks } = require(path.join(core, 'components', 'links'));

const { escapeHtml: gesc } = require(path.join(core, 'utils', 'text'));

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

// ---------- navegação ----------
/** Vai até um tópico, abrindo outro mapa (com confirmação de alterações pendentes) se preciso. */
async function openTopic(n) {
  if (!n || n.kind !== 'topic') return;
  if (n.mapKey === curKey()) { closeGraph(); goTo(n.topicId); return true; }
  if (!fs.existsSync(n.mapKey)) { setStatus('O arquivo do mapa não existe mais: ' + n.mapKey); return false; }
  closeGraph();
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
  linksTimer = setTimeout(() => renderLinks(), 160);
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
const gOpt = { hier: true, orphans: true, local: false, depth: 1, q: '', density: 'auto', labels: 'auto', group: false, focus: false };   // hierarquia ligada: cada mapa vira uma constelação
let gSel = null;                                  // id do nó selecionado no grafo
const gTrans = { x: 0, y: 0, k: 1 };
let gPinned = new Map();                          // posições arrastadas à mão
let gLayoutSig = '', gPos = new Map(), gLast = null;
const gHiddenMaps = new Set();                      // mapas ocultados pela legenda (só some do desenho: o layout não muda)
const gExpanded = new Set();                        // pais cujas folhas foram abertas (modo "agrupar folhas")
let gHover = null;                                // índice do nó sob o mouse (válido só para o desenho atual)
let gHoverId = null;                              // id do mesmo nó: sobrevive ao redesenho; o índice é refeito a partir dele
let gSideSel = null;                              // seleção para a qual o painel de detalhes já foi mostrado
let gMatchPos = -1;                               // resultado da busca em foco (Enter percorre; -1 = ainda nenhum)
const PALETTE = (i) => `hsl(${(i * 67 + 205) % 360} 68% 60%)`;
const colorIdx = new Map();
function mapColor(key) { if (!colorIdx.has(key)) colorIdx.set(key, colorIdx.size); return PALETTE(colorIdx.get(key)); }

/** Densidade: escala dos pontos, folga entre rótulos, quantos rótulos cabem por área e a partir de que zoom as folhas agrupadas se abrem. */
const DENS = { compact: { rs: 0.8, gap: 10, budget: 0.5, open: 1.6 }, normal: { rs: 1, gap: 4, budget: 1, open: 1.1 }, detailed: { rs: 1.2, gap: 1, budget: 2.2, open: 0.7 } };
// densidade pela quantidade de tópicos: poucos pontos ganham folga e rótulos; muitos, compactação para caber na tela
const densFor = (n) => (n <= 40 ? 'detailed' : n <= 150 ? 'normal' : 'compact');
const gDens = () => DENS[gOpt.density === 'auto' ? densFor(gLast ? gLast.nodes.length : 0) : gOpt.density] || DENS.normal;
/** Cores do tema do mapa, por tópico: cada ramo do mapa usa a cor do seu ramo no tema (a mesma do desenho do mapa). */
function themeBranchColors(map) {
  const t = getTheme(map.meta.theme, map.meta.customTheme), out = new Map(), pal = t.branches;
  out.set(map.root.id, pal[0]);
  map.root.children.forEach((c, i) => { const col = pal[i % pal.length]; (function walk(n) { out.set(n.id, col); n.children.forEach(walk); })(c); });
  // tópicos soltos do Mindomo: cada um é uma raiz própria, com a cor do primeiro ramo do tema
  for (const f of map.meta._momFloating || []) (function walk(n) { out.set(n.id, pal[0]); n.children.forEach(walk); })(f.node);
  return out;
}
/** Luminância simples: texto escuro sobre fundo claro e claro sobre escuro. */
const isDarkHex = (hex) => { const n = parseInt(String(hex).slice(1), 16) || 0, r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) < 140; };
const gR = (n) => (Math.min(20, 6 + Math.sqrt(n.deg) * 3.2) + (n.isRoot ? 3 : 0)) * gDens().rs;
const gView = () => (loadCfg().graphView || {});

/** Largura de um texto de 12 px (canvas, com cache): é o que decide se um rótulo cabe sem encostar em outro. */
const _mctx = document.createElement('canvas').getContext('2d'); const _mw = new Map();
function textW(s) { let w = _mw.get(s); if (w === undefined) { _mctx.font = '12px Segoe UI, Roboto, Arial, sans-serif'; w = _mctx.measureText(s).width; if (_mw.size > 5000) _mw.clear(); _mw.set(s, w); } return w; }
function fitText(s, max) {
  if (textW(s) <= max) return s;
  let lo = 1, hi = s.length; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (textW(s.slice(0, mid) + '…') <= max) lo = mid; else hi = mid - 1; }
  return s.slice(0, lo).trimEnd() + '…';
}

function buildGraphUI() {
  const root = $('#graph'); if (!root) return; root.textContent = ''; root.tabIndex = -1;
  const v = gView(); if (['auto', 'compact', 'normal', 'detailed'].includes(v.density)) gOpt.density = v.density; if (['auto', 'all', 'relevant', 'none'].includes(v.labels)) gOpt.labels = v.labels; gOpt.group = !!v.group; gOpt.focus = !!v.focus;
  if (typeof v.hier === 'boolean') gOpt.hier = v.hier; if (typeof v.orphans === 'boolean') gOpt.orphans = v.orphans;
  if (typeof v.local === 'boolean') gOpt.local = v.local; if ([1, 2, 3].includes(v.depth)) gOpt.depth = v.depth;
  const bar = el('div', 'g-bar');
  const sc = el('select'); sc.id = 'gScope'; sc.title = 'De onde vêm os tópicos'; sc.append(new Option('Este mapa', 'map'), new Option('Vault (pasta)', 'vault'));
  const dirTxt = el('div', 'path'); dirTxt.id = 'gDir';
  const pick = el('button', 'btn', 'Pasta…'); pick.id = 'gPick'; pick.title = 'Escolher a pasta com seus mapas (.mom)';
  const remember = () => saveCfg({ graphView: { density: gOpt.density, labels: gOpt.labels, group: gOpt.group, focus: gOpt.focus, hier: gOpt.hier, orphans: gOpt.orphans, local: gOpt.local, depth: gOpt.depth } });
  const chk = (id, label, key, after) => { const l = el('label'); const i = el('input'); i.type = 'checkbox'; i.id = id; i.checked = gOpt[key]; i.onchange = () => { gOpt[key] = i.checked; if (after) after(); else renderGraph(true); }; l.append(i, document.createTextNode(label)); return l; };
  const depth = el('select'); depth.id = 'gDepth'; depth.title = 'Quantos saltos a partir do tópico selecionado'; for (const d of [1, 2, 3]) depth.append(new Option(`${d} salto${d > 1 ? 's' : ''}`, d));
  depth.value = String(gOpt.depth);
  depth.onchange = () => { gOpt.depth = +depth.value; remember(); renderGraph(true); };
  // o alcance só faz sentido com "Só a vizinhança": aparece junto dela
  const depthRow = el('div', 'g-depth-row'); depthRow.append(el('span', '', 'Alcance: '), depth); depthRow.hidden = !gOpt.local;
  const q = el('input'); q.type = 'search'; q.id = 'gSearch'; q.placeholder = 'Buscar no grafo…';
  const cnt = el('span', 'g-count'); cnt.id = 'gSearchCount';
  q.oninput = () => { gOpt.q = q.value; gMatchPos = -1; renderGraph(false); };
  q.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); centerOnMatch(e.shiftKey ? -1 : 1); } e.stopPropagation(); };
  const dens = el('select'); dens.id = 'gDensity'; dens.title = 'Densidade: tamanho dos pontos, folga e quantidade de rótulos'; dens.append(new Option('Densidade: automática', 'auto'), new Option('Densidade: compacta', 'compact'), new Option('Densidade: normal', 'normal'), new Option('Densidade: detalhada', 'detailed')); dens.value = gOpt.density;
  dens.onchange = () => { gOpt.density = dens.value; remember(); renderGraph(false); };
  const lab = el('select'); lab.id = 'gLabels'; lab.title = 'Rótulos dos pontos'; lab.append(new Option('Rótulos: automáticos', 'auto'), new Option('Rótulos: todos', 'all'), new Option('Rótulos: só relevantes', 'relevant'), new Option('Rótulos: nenhum', 'none')); lab.value = gOpt.labels;
  lab.onchange = () => { gOpt.labels = lab.value; remember(); updateLabels(); };
  const refresh = el('button', 'btn', 'Atualizar'); refresh.id = 'gRefresh'; refresh.title = 'Recalcula as posições (as que você arrastou são mantidas)'; refresh.onclick = () => renderGraph(true);
  const close = el('button', 'btn primary', 'Fechar'); close.id = 'gClose'; close.onclick = closeGraph;
  sc.onchange = () => { saveCfg({ scope: sc.value }); renderGraph(true); };
  pick.onclick = pickVaultDir;
  // menus (<details>): "Exibir" guarda as opções de visualização; "⋯" guarda o que se usa pouco. Fecham ao clicar fora ou com Esc.
  const pop = (id, label, title, ...kids) => { const d = el('details', 'g-pop'); d.id = id; const s = el('summary', 'btn', label); s.title = title; const b = el('div', 'g-popbox'); b.append(...kids); d.append(s, b); return d; };
  const reshape = () => { remember(); renderGraph(true); };
  const viewPop = pop('gViewPop', 'Exibir ▾', 'Opções de exibição da rede', chk('gHier', 'Hierarquia dos mapas', 'hier', reshape), chk('gOrph', 'Pontos sem ligações', 'orphans', reshape), chk('gLocal', 'Só a vizinhança do selecionado', 'local', () => { depthRow.hidden = !gOpt.local; reshape(); }), depthRow,
    chk('gGroup', 'Agrupar folhas (+N)', 'group', () => { remember(); renderGraph(false); }), chk('gFocus', 'Focar a seleção', 'focus', () => { remember(); paintDim(); updateLabels(); }));
  // Obsidian: a pasta é o vault que o usuário abre no Obsidian; a exportação só grava em <vault>/MindCraft
  const obsDirTxt = el('div', 'path'); obsDirTxt.id = 'gObsDir'; obsDirTxt.textContent = loadCfg().obsidianDir || '(nenhuma pasta escolhida)'; obsDirTxt.title = loadCfg().obsidianDir || '';
  const obsPick = el('button', 'btn', 'Escolher pasta…'); obsPick.id = 'gObsPick'; obsPick.title = 'Escolher o vault do Obsidian (a pasta que você abre no Obsidian)'; obsPick.onclick = () => { closePops(); chooseObsidianDir(); };
  const obsExp = el('button', 'btn', 'Exportar para o Obsidian'); obsExp.id = 'gExport'; obsExp.title = 'Grava uma nota por tópico em <vault>/MindCraft (o Obsidian lê a rede como grafo)'; obsExp.onclick = () => { closePops(); exportObsidian(); };
  const obsOpen = el('button', 'btn', 'Abrir no Obsidian'); obsOpen.id = 'gObsidian'; obsOpen.title = 'Abre a pasta do vault no Obsidian'; obsOpen.onclick = () => { closePops(); openInObsidian(); };
  // ao salvar um mapa, o vault acompanha (ligado por padrão quando há uma pasta do Obsidian)
  const obsAuto = el('label'); const obsAutoBox = el('input'); obsAutoBox.type = 'checkbox'; obsAutoBox.id = 'gObsAuto';
  obsAutoBox.checked = loadCfg().obsidianAuto !== false;
  obsAutoBox.onchange = () => saveCfg({ obsidianAuto: obsAutoBox.checked });
  obsAuto.append(obsAutoBox, document.createTextNode('Atualizar ao salvar o mapa'));
  const stdLinks = el('button', 'btn', 'Padronizar links deste mapa'); stdLinks.id = 'gStdLinks';
  stdLinks.title = 'Troca [[Mapa#Tópico]] (formato antigo) por [[Mapa/Tópico]] (formato do Obsidian). Salvar grava; Ctrl+Z desfaz.';
  stdLinks.onclick = () => { closePops(); standardizeLinks(); };
  const menuPop = pop('gMenu', '⋯', 'Mais opções', el('div', 'muted', 'Pasta dos mapas'), dirTxt, pick, el('div', 'muted', 'Obsidian'), obsDirTxt, obsPick, obsExp, obsOpen, obsAuto, stdLinks);
  function closePops() { for (const d of bar.querySelectorAll('details[open]')) d.open = false; }
  document.addEventListener('mousedown', (e) => { if (!bar.contains(e.target)) closePops(); }, true);
  bar.addEventListener('toggle', (e) => { if (e.target.open) for (const d of bar.querySelectorAll('details[open]')) if (d !== e.target) d.open = false; }, true);
  const b3 = el('button', 'btn', '3D'); b3.id = 'g3dBtn'; b3.title = 'Rede em 3D: o tamanho do ponto mostra o peso (filhos, notas e ligações)'; b3.setAttribute('aria-pressed', 'false');
  b3.onclick = () => setGraph3d(!gMode3d);
  bar.append(sc, q, cnt, dens, lab, viewPop, b3, refresh, el('span', 'grow'), menuPop, close);
  const main = el('div', 'g-main'), wrap = el('div', 'g-wrap');
  wrap.innerHTML = '<svg id="gsvg"><g id="gview"></g></svg><div id="g3d" hidden></div>';
  const lg = el('div', 'g-legend'); lg.id = 'gLegend'; const st = el('div', 'g-stat'); st.id = 'gStat';
  const zoom = el('div', 'g-zoom'); zoom.id = 'gZoom';
  const zb = (id, txt, title, fn) => { const b = el('button', 'btn', txt); b.id = id; b.title = title; b.setAttribute('aria-label', title); b.onclick = fn; return b; };
  zoom.append(zb('gZoomIn', '+', 'Aproximar (+)', () => zoomBy(1.3)), zb('gZoomOut', '−', 'Afastar (−)', () => zoomBy(1 / 1.3)), zb('gFit', '⤢', 'Ajustar tudo na tela (0)', () => fitGraph()), zb('gCenter', '◎', 'Centralizar a seleção (C)', () => centerSel()),
    zb('gSideBtn', 'ℹ', 'Detalhes do ponto selecionado', () => toggleSide()));
  wrap.append(lg, st, zoom);
  const side = el('aside', 'g-side'); side.id = 'gSide';
  main.append(wrap, side); root.append(bar, main);
  bindGraphEvents();
  if (typeof ResizeObserver === 'function') {                        // ao girar o tablet ou mudar a janela, o mesmo ponto continua no centro
    let last = null; new ResizeObserver(() => {
      const sv = $('#gsvg'); if (!sv || !graphOpen) { last = null; return; }
      const r = sv.getBoundingClientRect(); if (last && (r.width !== last.w || r.height !== last.h) && r.width > 0) { gTrans.x += (r.width - last.w) / 2; gTrans.y += (r.height - last.h) / 2; applyT(); }
      last = { w: r.width, h: r.height }; placeZoom();
    }).observe($('#gsvg'));
  }
  gBuilt = true;
}

/** Rede em 3D (three.js via 3d-force-graph, em renderer/bundle/graph3d.js). O peso de cada tópico dá o tamanho do ponto. */
let gMode3d = false, g3 = null;
function setGraph3d(on) {
  if (on && !window.ForceGraph3D) { setStatus('A rede 3D não carregou neste aparelho.'); return; }
  gMode3d = on;
  const b = $('#g3dBtn'); if (b) b.setAttribute('aria-pressed', String(on));
  $('#gsvg').hidden = on; $('#g3d').hidden = !on;
  if (on) render3d(); else if (g3) g3.pauseAnimation();
}
/** Textura radial com um anel: transparente no centro (onde fica o nó), um pico em `peak` e desvanece até a borda. */
function ringTexture3d(peak, width, rgb) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  const a = (k) => `rgba(${rgb}, ${k})`;
  gr.addColorStop(0, a(0)); gr.addColorStop(peak - width, a(0)); gr.addColorStop(peak, a(1)); gr.addColorStop(Math.min(1, peak + width * 1.6), a(0)); gr.addColorStop(1, a(0));
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  return new window.THREE.CanvasTexture(c);
}
/** A cor do tema vem como hsl(205 68% 60%), que o three.js não lê: o navegador converte para #rrggbb. */
let colorCtx3d = null;
function cssToHex3d(css) {
  if (!colorCtx3d) colorCtx3d = document.createElement('canvas').getContext('2d');
  colorCtx3d.fillStyle = '#888888'; colorCtx3d.fillStyle = css;
  return colorCtx3d.fillStyle;
}
let contourTex3d = null, glowTex3d = null;
/** Um tópico na rede 3D: esfera colorida, contorno branco fino e um brilho colorido que cresce com o peso (val = 1 + peso). */
function node3d(n) {
  const T = window.THREE, w = Math.max(0, n.val - 1);
  const r = 3 + Math.sqrt(n.val) * 1.8, col = new T.Color(cssToHex3d(n.color));
  contourTex3d = contourTex3d || ringTexture3d(0.44, 0.025, '255,255,255');
  glowTex3d = glowTex3d || ringTexture3d(0.6, 0.15, '255,255,255');   // o anel do brilho começa logo fora da esfera (somar por cima do nó saturava a cor)
  const group = new T.Group();
  // o sprite tem 5 raios de lado: o nó ocupa 40% da metade, então o anel fica logo fora da esfera
  const contour = new T.Sprite(new T.SpriteMaterial({ map: contourTex3d, color: 0xffffff, transparent: true, depthWrite: false, opacity: 0.9 }));
  contour.scale.setScalar(r * 5);
  const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTex3d, color: col, blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity: Math.min(0.9, 0.35 + w / 40) }));
  glow.scale.setScalar(r * (5 + Math.min(6, w / 6)));
  const body = new T.Mesh(new T.SphereGeometry(r, 24, 16), new T.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.08 + Math.min(0.35, w / 80), roughness: 0.5, metalness: 0.0 }));
  group.add(glow, contour, body);
  return group;
}
function render3d() {
  if (!gMode3d || !gLast || !window.ForceGraph3D) return;
  const host = $('#g3d');
  const data = {
    nodes: gLast.nodes.map((n) => ({ id: n.id, name: n.title + (n.kind === 'ghost' ? ' (sem tópico)' : ''), val: 1 + (n.importance ?? n.weight ?? 0), color: n.kind === 'ghost' ? '#8a8f98' : mapColor(n.mapKey || '') })),
    links: gLast.edges.map((e) => ({ source: e.from, target: e.to })),
  };
  if (!g3) {
    g3 = window.ForceGraph3D()(host).nodeLabel('name').nodeThreeObject(node3d).nodeThreeObjectExtend(false)
      .linkColor(() => '#ffffff').linkOpacity(0.55).linkWidth(0.4)
      .onNodeClick((n) => { gSel = n.id; setStatus(`Selecionado: ${n.name}. No mapa 2D, duplo clique abre o tópico.`); });
  }
  g3.backgroundColor('#06080d').width(host.clientWidth || 600).height(host.clientHeight || 400).graphData(data).resumeAnimation();
}

function openGraph() {
  if (typeof closeHome === 'function') closeHome();
  commitNotes();
  if (!gBuilt) buildGraphUI();
  graphOpen = true; $('#graph').hidden = false; document.querySelector('[data-act="graph"]').classList.add('on');
  const c = loadCfg(); $('#gScope').value = c.scope === 'vault' ? 'vault' : 'map';
  gSel = selectedId ? `${curKey()}::${selectedId}` : null; gHover = null; gHoverId = null; gSideSel = gSel;
  renderGraph(true); fitGraph();
}
function closeGraph() { graphOpen = false; if (g3) g3.pauseAnimation(); const g = $('#graph'); if (g) g.hidden = true; const b = document.querySelector('[data-act="graph"]'); if (b) b.classList.remove('on'); }
act.graph = () => { if (graphOpen) return closeGraph(); if (!needMap()) return; return openGraph(); };

async function pickVaultDir() {
  const dir = await ipcRenderer.invoke('dialog:folder', 'Pasta com os seus mapas (.mom)');
  if (!dir) return;
  saveCfg({ vaultDir: dir, scope: 'vault' }); $('#gScope').value = 'vault'; renderGraph(true); fitGraph();
}

/** Escolhe o vault do Obsidian (pasta que o usuário abre no Obsidian). Devolve o caminho ou null. */
async function chooseObsidianDir() {
  const dir = await ipcRenderer.invoke('dialog:folder', 'Pasta do vault do Obsidian (recomendo uma pasta só para o MindCraft)');
  if (!dir) return null;
  saveCfg({ obsidianDir: dir });
  const t = $('#gObsDir'); if (t) { t.textContent = dir; t.title = dir; }
  // vault que já tem notas suas: nomes iguais podem confundir os links antigos delas
  try {
    const n = require(path.join(core, 'services', 'obsidian-write')).countForeignNotes(dir);
    if (n) setStatus(`Atenção: esta pasta já tem ${n} nota(s) suas. Um vault só para o MindCraft evita nomes iguais.`);
  } catch { /* o aviso é opcional */ }
  return dir;
}

/** Troca [[Mapa#Tópico]] por [[Mapa/Tópico]] nos títulos e notas deste mapa, num só desfazer. Salvar grava. */
function standardizeLinks() {
  const names = new Set(gatherMaps(vaultDirEff() ? 'vault' : 'map').maps.map((m) => norm(m.name)));
  const hasMap = (n) => names.has(norm(n));
  let total = 0;
  change(() => map.batch(() => {
    const fix = (node) => {
      const t = migrateLegacyLinks(node.title, hasMap), no = migrateLegacyLinks(node.notes || '', hasMap);
      if (!t.count && !no.count) return;
      total += t.count + no.count;
      map.update(node.id, { title: t.text, notes: no.text });
    };
    const visit = (node) => { fix(node); for (const c of node.children) visit(c); };
    visit(map.root);
    for (const f of map.meta._momFloating || []) visit(f.node);
    return total > 0;
  }));
  setStatus(total ? `${total} link(s) padronizado(s) para Mapa/Tópico. Salve o mapa para gravar (Ctrl+Z desfaz).` : 'Nenhum link no formato antigo neste mapa.');
}

/** Chamada ao salvar um mapa: atualiza o vault sem abrir diálogos. Só roda com pasta escolhida e a opção ligada. */
function autoObsidian() {
  const c = loadCfg();
  if (!c.obsidianDir || c.obsidianAuto === false) return;
  exportObsidian({ quiet: true }).catch(() => { /* a falha já aparece na barra de status */ });
}

/** Exporta os mapas (o aberto + os da pasta do vault, se houver) como notas do Obsidian. Nunca apaga nada. */
async function exportObsidian({ quiet = false } = {}) {
  let dir = loadCfg().obsidianDir;
  if (!dir || !fs.existsSync(dir)) {
    if (quiet) return;                                  // a pasta sumiu: o salvamento não pede nada
    dir = await chooseObsidianDir();
  }
  if (!dir) return;
  let mod;
  try { mod = { build: require(path.join(core, 'services', 'obsidian')).buildObsidianVault, write: require(path.join(core, 'services', 'obsidian-write')).writeObsidianVault }; }
  catch { setStatus('A exportação para o Obsidian não está disponível neste aparelho.'); return; }
  try {
    const info = gatherMaps(vaultDirEff() ? 'vault' : 'map');
    const built = mod.build(info.maps);
    const r = mod.write(dir, built.files);
    const parts = [`Obsidian: ${r.written.length} nota(s) gravada(s)`, `${r.unchanged.length} já em dia`];
    if (r.skipped.length) parts.push(`${r.skipped.length} não sobrescrita(s) (${r.skipped[0].reason}${r.skipped.length > 1 ? ' e outras' : ''})`);
    if (r.obsolete) parts.push(`${r.obsolete} antiga(s) sem tópico correspondente (mantida(s))`);
    if (info.errors && info.errors.length) parts.push(`${info.errors.length} mapa(s) com erro de leitura ficaram de fora`);
    const msg = parts.join(' · ') + '. Use "Abrir no Obsidian" para abrir o vault.';
    setStatus(msg); if (!quiet) sideMsg(msg, 'ok');     // ao salvar, só a barra de status: não interrompe o trabalho
  } catch (e) {
    const msg = 'Não consegui exportar para o Obsidian: ' + (e.message || e);
    setStatus(msg); sideMsg(msg, 'err');
  }
}

/** Abre a pasta do vault no Obsidian (pelo processo principal, que valida a pasta). */
async function openInObsidian() {
  const dir = loadCfg().obsidianDir;
  if (!dir) { sideMsg('Escolha primeiro a pasta do vault do Obsidian (⋯ › Obsidian › Escolher pasta).', 'err'); return; }
  const r = await ipcRenderer.invoke('obsidian:open', dir);
  if (!r || !r.ok) { sideMsg(r && r.error ? r.error : 'Não consegui abrir o Obsidian.', 'err'); return; }
  sideMsg(r.method === 'skipped' ? 'Abriria no Obsidian: ' + r.url : 'Abrindo o vault no Obsidian…', 'ok');
}

function djb(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h; }

/** Calcula o conjunto visível, o layout (em cache) e desenha. relayout=false mantém as posições (busca/seleção). */
function renderGraph(relayout) {
  const scope = $('#gScope').value === 'vault' && vaultDirEff() ? 'vault' : 'map';
  const info = gatherMaps(scope);
  // cores do tema: por tópico (ramo do próprio mapa) e o fundo/texto seguem o tema do mapa aberto
  const gColor = new Map();
  for (const mp of info.maps) for (const [id, col] of themeBranchColors(mp.map)) gColor.set(`${mp.key}::${id}`, col);
  const curTheme = getTheme(map.meta.theme, map.meta.customTheme), gBg = curTheme.background;
  const relCol = isDarkHex(gBg) ? '#ff8a8f' : '#c62828';   // seta de relação: cor de contraste com o fundo do tema
  const gRoot = document.getElementById('graph');
  if (gRoot) { gRoot.style.setProperty('--g-bg', gBg); gRoot.style.setProperty('--g-text', isDarkHex(gBg) ? '#f2f2f2' : '#1c1c1c'); }
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
  const adj = nodes.map(() => new Set()), inc = nodes.map(() => []);
  edges.forEach((e, ei) => { const a = idx.get(e.from), b = idx.get(e.to); adj[a].add(b); adj[b].add(a); inc[a].push(ei); inc[b].push(ei); });
  gHover = gHoverId !== null && idx.has(gHoverId) ? idx.get(gHoverId) : null;   // o redesenho pode ter mudado o conjunto de pontos: nunca reaproveite o índice antigo
  const q = norm(gOpt.q);
  const match = nodes.map((n) => !q || norm(n.title).includes(q));
  // folhas da hierarquia (só uma ligação, e ela é "pai → este"): podem ficar agrupadas no pai ("+N") até haver zoom
  const leafParent = nodes.map(() => -1), leafCount = nodes.map(() => 0);
  nodes.forEach((n, i) => { if (inc[i].length === 1) { const e = edges[inc[i][0]]; if (e.type === 'hierarchy' && idx.get(e.to) === i) { leafParent[i] = idx.get(e.from); leafCount[leafParent[i]]++; } } });
  const R = gR;
  gLast = { g, nodes, edges, idx, P, adj, inc, R, match, leafParent, leafCount, info };
  render3d();

  const parts = [];
  edges.forEach((e, i) => {
    const ec = gColor.get(e.to) || curTheme.branches[0];   // a ligação leva a cor do ramo do tópico de chegada
    const st = e.type === 'relation' ? `stroke="${relCol}" stroke-dasharray="6 4" stroke-width="1.6" opacity=".9"` : e.type === 'hierarchy' ? `stroke="${ec}" stroke-width=".9" opacity=".45"` : `stroke="${ec}" stroke-width="1.8" opacity=".85"`;
    parts.push(`<line class="edge" data-e="${i}" vector-effect="non-scaling-stroke" ${st}/>`);
  });
  edges.forEach((e, i) => { if (e.type === 'relation' && e.label) parts.push(`<text class="elabel" data-e="${i}" text-anchor="middle" dominant-baseline="central" style="display:none">${gesc(e.label.length > 40 ? e.label.slice(0, 39) + '…' : e.label)}</text>`); });
  nodes.forEach((n, i) => {
    const ghost = n.kind === 'ghost', hit = q && match[i], sel = n.id === gSel, r = R(n);
    const fill = ghost ? 'none' : (gColor.get(n.id) || mapColor(n.mapKey)), stroke = ghost ? 'var(--text-dim)' : sel ? '#ff9800' : 'var(--g-text, #fff)';
    const prog = n.progress != null && !ghost ? `<circle class="gprog" r="${r + 3.5}" fill="none" stroke="#43a047" stroke-width="2.2" pathLength="100" stroke-dasharray="${Math.max(0, Math.min(100, n.progress))} 100" transform="rotate(-90)"/>` : '';
    parts.push(`<g class="gn${q && !match[i] ? ' dim' : ''}" data-i="${i}"><circle r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sel ? 3 : ghost ? 1.4 : 1}"${ghost ? ' stroke-dasharray="3 2"' : ''}/>`
      + `<circle class="ghit" style="--r:${r}px" fill="transparent" stroke="none"/>` + prog
      + (hit ? `<circle r="${r + 5}" fill="none" stroke="#ffeb3b" stroke-width="2"/>` : '')
      + (leafCount[i] ? `<g class="gbadge" style="display:none"><circle r="8" cx="${r * 0.8}" cy="${-r * 0.8}" fill="#455a7a" stroke="rgba(255,255,255,.55)" stroke-width="1"/><text class="gbt" x="${r * 0.8}" y="${-r * 0.8}" text-anchor="middle" dominant-baseline="central">+${leafCount[i]}</text></g>` : '')
      + `<text class="glabel" text-anchor="middle" dominant-baseline="central"${ghost ? ' font-style="italic"' : ''} data-full="${gesc(n.title)}" style="display:none">${gesc(n.title.length > 38 ? n.title.slice(0, 37) + '…' : n.title)}</text><title>${gesc(n.title)}${n.mapName ? ' — ' + gesc(n.mapName) + (n.deg ? ` · ${n.deg} ligaç${n.deg > 1 ? 'ões' : 'ão'}` : '') : ' (não existe)'}</title></g>`);
  });
  $('#gview').innerHTML = parts.join('');
  const gv = $('#gview');
  gLast.gn = nodes.map((_, i) => gv.querySelector(`.gn[data-i="${i}"]`));
  gLast.labels = gLast.gn.map((x) => x && x.querySelector('.glabel'));
  gLast.lines = [...gv.querySelectorAll('.edge')];
  gLast.elabels = new Map([...gv.querySelectorAll('.elabel')].map((x) => [+x.dataset.e, x]));
  positionAll();
  applyT();

  const maps = [...new Set(nodes.filter((n) => n.mapKey).map((n) => n.mapKey))];
  const lg = $('#gLegend'); lg.textContent = '';
  for (const k of maps.slice(0, 12)) {
    const d = el('div', 'lg' + (gHiddenMaps.has(k) ? ' off' : '')); d.title = gHiddenMaps.has(k) ? 'Mostrar este mapa' : 'Ocultar este mapa'; d.setAttribute('role', 'button'); d.tabIndex = 0; d.dataset.map = k;
    const i = el('i'); i.style.background = mapColor(k); d.append(i, document.createTextNode(g.nodes.find((n) => n.mapKey === k).mapName));
    const flip = () => { if (gHiddenMaps.has(k)) gHiddenMaps.delete(k); else gHiddenMaps.add(k); renderGraph(false); };
    d.onclick = flip; d.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); flip(); } };
    lg.append(d);
  }
  if (maps.length > 12) lg.append(el('div', 'muted', `… e mais ${maps.length - 12} mapa(s)`));
  const ghosts = nodes.filter((n) => n.kind === 'ghost').length;
  gLast.statBase = `${nodes.length - ghosts} tópicos · ${edges.filter((e) => e.type !== 'hierarchy').length} ligações · ${ghosts} sem destino · ${maps.length} mapa(s)`
    + (info.truncated ? ' · pasta grande: leitura parcial' : '') + (info.errors && info.errors.length ? ` · ${info.errors.length} arquivo(s) ilegível(is)` : '');
  $('#gStat').textContent = gLast.statBase;
  $('#gDir').textContent = scope === 'vault' ? (info.dir || '') : '(somente o mapa aberto)'; $('#gDir').title = info.dir || '';
  $('#gDepth').disabled = !gOpt.local;
  const nm = match.filter(Boolean).length; $('#gSearchCount').textContent = q ? (nm ? (gMatchPos >= 0 ? `${gMatchPos + 1}/${nm}` : `${nm} resultado${nm > 1 ? 's' : ''}`) : 'nenhum resultado') : '';
  renderGraphSide();
}

/** Aplica pan/zoom e informa o zoom ao CSS (--k) para os rótulos terem tamanho constante na tela. */
function applyT() {
  $('#gview').setAttribute('transform', `translate(${gTrans.x} ${gTrans.y}) scale(${gTrans.k})`);
  const sv = $('#gsvg'); sv.style.setProperty('--k', gTrans.k); sv.classList.toggle('zoomed', gTrans.k >= 1.4);
  scheduleLabels();
}
function zoomBy(f) {
  const r = $('#gsvg').getBoundingClientRect(), mx = r.width / 2, my = r.height / 2, k = Math.min(6, Math.max(0.1, gTrans.k * f));
  gTrans.x = mx - ((mx - gTrans.x) / gTrans.k) * k; gTrans.y = my - ((my - gTrans.y) / gTrans.k) * k; gTrans.k = k; applyT();
}

/** Quais pontos aparecem agora: some o que a legenda ocultou e, no modo "agrupar folhas", as folhas de pais fechados (até haver zoom, seleção, busca ou abrir o pai). */
function nodeVisible(i) {
  const { nodes, leafParent, match, adj, idx } = gLast, n = nodes[i];
  if (n.mapKey && gHiddenMaps.has(n.mapKey)) return false;
  if (!gOpt.group || leafParent[i] < 0) return true;                       // só as folhas de hierarquia podem ficar agrupadas
  const parent = nodes[leafParent[i]];
  if (gTrans.k >= gDens().open || n.id === gSel || (gOpt.q && match[i]) || gPinned.has(n.id) || gExpanded.has(parent.id)) return true;
  if (gHover !== null && (gHover === i || adj[gHover].has(i))) return true;   // passar o mouse no pai (ou na folha) mostra as folhas
  const sel = gSel && idx.has(gSel) ? idx.get(gSel) : null; return sel !== null && leafParent[i] === sel;   // selecionar o pai abre as folhas dele
}
/** Quem fica esmaecido: a vizinhança do ponto sob o mouse; senão (se ligado "Focar seleção") a do selecionado; senão o que não casa com a busca. */
function paintDim() {
  if (!gLast) return;
  const { nodes, adj, idx, edges, match, gn, lines } = gLast; const q = gOpt.q;
  const centre = gHover !== null && adj[gHover] ? gHover : gOpt.focus && gSel && idx.has(gSel) ? idx.get(gSel) : null;
  const keep = centre !== null ? new Set([centre, ...adj[centre]]) : null;
  gn.forEach((x, i) => { if (x) x.classList.toggle('dim', keep ? !keep.has(i) : !!q && !match[i]); });
  lines.forEach((l) => { const ed = edges[+l.dataset.e]; l.classList.toggle('dim', centre !== null && !(idx.get(ed.from) === centre || idx.get(ed.to) === centre)); });
  void nodes;
}

/**
 * Rótulos: tamanho fixo na tela, medidos de verdade. Cada um tenta 4 posições (embaixo, à direita, em cima, à esquerda) e só some se nenhuma estiver livre;
 * a quantidade é limitada pela área (densidade). O selecionado, o sob o mouse, seus vizinhos e os resultados da busca sempre aparecem.
 */
let lblTimer = null;
function scheduleLabels() { clearTimeout(lblTimer); lblTimer = setTimeout(updateLabels, 60); }
function updateLabels() {
  if (!gLast || !graphOpen || !gLast.labels) return;
  const { nodes, P, R, match, labels, gn, adj, edges, idx, elabels } = gLast, k = gTrans.k, r = $('#gsvg').getBoundingClientRect(), D = gDens();
  const mode = gOpt.labels, hov = gHover, selI = gSel && idx.has(gSel) ? idx.get(gSel) : null;
  const vis = nodes.map((_, i) => nodeVisible(i));
  gn.forEach((x, i) => { if (x) x.style.display = vis[i] ? '' : 'none'; });
  gLast.lines.forEach((l) => { const ed = edges[+l.dataset.e]; l.style.display = vis[idx.get(ed.from)] && vis[idx.get(ed.to)] ? '' : 'none'; });
  gn.forEach((x, i) => { const b = x && x.querySelector('.gbadge'); if (b) b.style.display = gOpt.group && vis[i] && gLast.leafCount[i] && gLast.leafParent.some((p, j) => p === i && !vis[j]) ? '' : 'none'; });
  const scr = nodes.map((_, i) => ({ x: P[i].x * k + gTrans.x, y: P[i].y * k + gTrans.y, r: R(nodes[i]) * k }));
  const onScreen = (i) => scr[i].x > -40 && scr[i].x < r.width + 40 && scr[i].y > -40 && scr[i].y < r.height + 40;
  const near = new Set(); for (const c of [hov, selI]) if (c !== null && c !== undefined) { near.add(c); adj[c].forEach((j) => near.add(j)); }
  const isForced = (i) => near.has(i) || !!(gOpt.q && match[i]);
  const score = (i) => (i === selI ? 1e7 : 0) + (i === hov ? 1e7 : 0) + (gOpt.q && match[i] ? 1e6 : 0) + (near.has(i) ? 1e5 : 0) + (nodes[i].isRoot ? 1e3 : 0) + nodes[i].deg * 10 + (gLast.leafCount[i] || 0);
  const items = []; nodes.forEach((n, i) => { if (vis[i] && labels[i] && onScreen(i)) items.push({ id: i, x: scr[i].x, y: scr[i].y, r: scr[i].r, text: labels[i].dataset.full, forced: isForced(i), score: score(i), relevant: n.isRoot || n.deg >= 4, big: i === selI || i === hov }); });
  const obstacles = [];   // o que flutua sobre o desenho também ocupa lugar
  for (const sel of ['#gLegend', '#gZoom', '#gStat']) { const o = $(sel); if (!o || o.hidden) continue; const bb = o.getBoundingClientRect(); if (bb.width) obstacles.push({ x: bb.left - r.left - 4, y: bb.top - r.top - 4, w: bb.width + 8, h: bb.height + 8 }); }
  const budget = Math.max(10, Math.round(D.budget * (r.width * r.height) / 9000));
  // o rótulo do nó selecionado/apontado fica em negrito (classe "big") e é mais largo: a medição reserva 8% a mais só para ele
  const { placed, shown } = placeLabels(items, { width: r.width, height: r.height, obstacles, mode, budget, gap: D.gap, measure: (s, it) => textW(s) * (it && it.big ? 1.08 : 1), fit: fitText });
  labels.forEach((el0, i) => {
    if (!el0) return;
    const p = placed.get(i);
    if (!p) { if (el0.style.display !== 'none') el0.style.display = 'none'; return; }
    if (el0.textContent !== p.text) el0.textContent = p.text;
    el0.setAttribute('x', p.ox / k); el0.setAttribute('y', p.oy / k); el0.setAttribute('text-anchor', p.anchor); el0.style.display = '';
    el0.classList.toggle('big', i === selI || i === hov);
  });
  // rótulos das relações: no meio da linha; aparecem com zoom, ou quando ligam o ponto selecionado/sob o mouse
  for (const [ei, t] of elabels) {
    const e = edges[ei], ia = idx.get(e.from), ib = idx.get(e.to);
    const focusEnd = ia === selI || ia === hov ? 'a' : ib === selI || ib === hov ? 'b' : null;     // ponta em foco: o rótulo fica perto dela
    const an = relationLabelAnchor(scr[ia], scr[ib], focusEnd), from = focusEnd === 'b' ? ib : ia, to = focusEnd === 'b' ? ia : ib;
    const ok = vis[ia] && vis[ib] && an.x > 0 && an.x < r.width && an.y > 0 && an.y < r.height && (k >= 0.9 || focusEnd !== null) && mode !== 'none';
    t.style.display = ok ? '' : 'none'; if (ok) { t.setAttribute('x', P[from].x + (P[to].x - P[from].x) * an.t); t.setAttribute('y', P[from].y + (P[to].y - P[from].y) * an.t - 8 / k); }
  }
  gLast.shown = shown;
  $('#gStat').textContent = gLast.statBase + (nodes.length > 20 ? ` · ${shown} rótulo(s)` : '');
}
function positionAll() {
  if (!gLast) return;
  const { P, edges, idx, gn, lines, nodes } = gLast;
  gn.forEach((el0, i) => { if (el0) el0.setAttribute('transform', `translate(${P[i].x} ${P[i].y})`); });
  lines.forEach((l) => { const e = edges[+l.dataset.e], a = P[idx.get(e.from)], b = P[idx.get(e.to)]; l.setAttribute('x1', a.x); l.setAttribute('y1', a.y); l.setAttribute('x2', b.x); l.setAttribute('y2', b.y); });
  paintDim();
  applyT();
  void nodes;
}
function fitGraph() {
  if (!gLast || !gLast.nodes.length) return;
  const svgEl = $('#gsvg'), r = svgEl.getBoundingClientRect();
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  gLast.P.forEach((p, i) => { if (!nodeVisible(i)) return; x1 = Math.min(x1, p.x); y1 = Math.min(y1, p.y); x2 = Math.max(x2, p.x); y2 = Math.max(y2, p.y); });
  if (x1 === Infinity) return;
  const w = Math.max(40, x2 - x1), h = Math.max(40, y2 - y1), mx = Math.min(150, r.width * 0.12), my = Math.min(70, r.height * 0.1); // margens em pixels: sobra espaço para os rótulos
  gTrans.k = Math.max(0.1, Math.min((r.width - 2 * mx) / w, (r.height - 2 * my) / h, 2.2));
  gTrans.x = r.width / 2 - ((x1 + x2) / 2) * gTrans.k; gTrans.y = r.height / 2 - ((y1 + y2) / 2) * gTrans.k;
  applyT();
  $('#gsvg').classList.toggle('zoomed', gTrans.k >= 1.4);
}
function centerSel() {
  if (!gLast || !gSel || !gLast.idx.has(gSel)) return;
  const r = $('#gsvg').getBoundingClientRect(), p = gLast.P[gLast.idx.get(gSel)];
  gTrans.k = Math.max(gTrans.k, 1.2); gTrans.x = r.width / 2 - p.x * gTrans.k; gTrans.y = r.height / 2 - p.y * gTrans.k; applyT();
}
/** Enter na busca vai para o resultado seguinte (Shift+Enter, o anterior). */
function centerOnMatch(dir = 1) {
  if (!gLast || !gOpt.q) return;
  const list = []; gLast.match.forEach((m, i) => { if (m) list.push(i); });
  const n = list.length; if (!n) return;
  gMatchPos = gMatchPos < 0 ? (dir > 0 ? 0 : n - 1) : (gMatchPos + dir + n) % n;
  const i = list[gMatchPos], r = $('#gsvg').getBoundingClientRect(), p = gLast.P[i];
  gTrans.k = Math.max(gTrans.k, 1.2); gTrans.x = r.width / 2 - p.x * gTrans.k; gTrans.y = r.height / 2 - p.y * gTrans.k;
  gSel = gLast.nodes[i].id; renderGraph(false);
}

/** Em telas estreitas o painel de detalhes vira uma gaveta embaixo; ela abre sozinha ao selecionar um ponto. */
const gNarrow = () => { const e = $('#graph'); return e.clientWidth <= 760 || e.clientHeight <= 480; };   // mede a própria rede (o painel de Estudo ao lado também come largura)
function toggleSide(force) { const s = $('#gSide'); if (!s) return; const open = force === undefined ? !s.classList.contains('open') : force; s.classList.toggle('open', open); $('#gSideBtn').setAttribute('aria-pressed', String(open)); placeZoom(); }
/** Com a gaveta aberta, os botões de zoom (e o ℹ que a fecha) sobem para ficar acima dela, em vez de ficarem cobertos. */
function placeZoom() { const s = $('#gSide'), z = $('#gZoom'); if (!s || !z) return; z.style.bottom = gNarrow() && s.classList.contains('open') ? (s.offsetHeight + 12) + 'px' : ''; }

function renderGraphSide() {
  const side = $('#gSide'); side.textContent = '';
  if (!gLast) return;
  const { g } = gLast;
  const n = gSel && g.byId.get(gSel);
  if (!n) {
    gSideSel = gSel;
    side.append(el('h3', '', 'Rede de conhecimento'), el('div', 'sub', 'Cada ponto é um tópico; cada linha, um [[link]] (sólida), uma relação do mapa (tracejada vermelha, com o rótulo dela) ou, se ativada, a hierarquia.'),
      el('div', 'muted', 'Toque/clique num ponto para ver conexões · duplo toque abre o tópico · arraste para reposicionar · roda ou botões +/− dão zoom.'),
      el('div', 'muted', 'Teclado: setas navegam entre pontos ligados · Enter abre · + − 0 zoom · C centraliza · F foca a seleção · / busca.'),
      el('div', 'muted', 'Pontos tracejados são links sem destino: crie o tópico para completar a rede. O tamanho do ponto mostra quantas ligações ele tem; o anel verde, o progresso.'));
    return;
  }
  side.append(el('h3', '', n.title), el('div', 'sub', n.kind === 'ghost' ? 'Link sem destino' : `${n.mapName}${n.isRoot ? ' · raiz do mapa' : ''}${n.progress != null ? ` · ${n.progress}%` : ''}${n.deg ? ` · ${n.deg} ligaç${n.deg > 1 ? 'ões' : 'ão'}` : ''}`));
  const btns = el('div', 'btnrow');
  if (n.kind === 'topic') { const b = el('button', 'btn primary', 'Ir para o tópico'); b.id = 'gGo'; b.onclick = () => openTopic(n); btns.append(b); }
  else if (!/#/.test(n.title)) { const b = el('button', 'btn primary', 'Criar este tópico'); b.id = 'gCreate'; b.onclick = () => { if (createTopicFromLink(n.title)) { gSel = null; renderGraph(true); } }; btns.append(b); }
  side.append(btns);
  const list = (title, arr, pick) => {
    side.append(el('h4', '', `${title} (${arr.length})`));
    if (!arr.length) side.append(el('div', 'muted', 'Nenhum.'));
    for (const e of arr) { const o = g.byId.get(pick(e)); const r = lkRow(g, o, { meta: o.mapName && o.mapKey !== n.mapKey ? o.mapName : '', type: e.type, label: e.label, onClick: () => { gSel = o.id; renderGraph(false); } }); side.append(r); }
  };
  list('Links', g.outgoing(n.id), (e) => e.to); list('Citado em', g.incoming(n.id), (e) => e.from);
  if (gNarrow() && gSel !== gSideSel) toggleSide(true);
  gSideSel = gSel;
  placeZoom();
}

/** Setas: vai para o ponto ligado ao selecionado que estiver mais na direção da tecla (sem selecionado, começa pelo de mais ligações). */
function stepSelection(dx, dy) {
  if (!gLast || !gLast.nodes.length) return;
  const { nodes, idx, adj, P } = gLast; const cur = gSel && idx.has(gSel) ? idx.get(gSel) : null;
  if (cur === null) { let best = 0; nodes.forEach((n, i) => { if (nodeVisible(i) && n.deg + (n.isRoot ? 1 : 0) > nodes[best].deg + (nodes[best].isRoot ? 1 : 0)) best = i; }); gSel = nodes[best].id; renderGraph(false); centerSel(); return; }
  let best = -1, bs = -Infinity;
  for (const j of adj[cur]) {
    if (!nodeVisible(j)) continue;
    const vx = P[j].x - P[cur].x, vy = P[j].y - P[cur].y, len = Math.hypot(vx, vy) || 1, dot = (vx * dx + vy * dy) / len;
    if (dot > 0.35 && dot - len / 4000 > bs) { bs = dot - len / 4000; best = j; }
  }
  if (best >= 0) { gSel = nodes[best].id; renderGraph(false); }
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
    const id = d.i == null ? null : gLast.nodes[d.i].id;
    if (id && gOpt.group && gLast.leafCount[d.i]) { if (gExpanded.has(id)) gExpanded.delete(id); else gExpanded.add(id); }   // clicar num pai com folhas agrupadas as abre/fecha
    gSel = id;
    renderGraph(false);
  });
  svgEl.addEventListener('dblclick', (e) => { const nd = e.target.closest('.gn'); if (nd) openTopic(gLast.nodes[+nd.dataset.i]); });
  svgEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    const r = svgEl.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    const k = Math.min(6, Math.max(0.1, gTrans.k * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
    gTrans.x = mx - ((mx - gTrans.x) / gTrans.k) * k; gTrans.y = my - ((my - gTrans.y) / gTrans.k) * k; gTrans.k = k;
    applyT();
  }, { passive: false });
  // toque: um dedo arrasta a vista; dois dedos dão pinça (zoom no meio entre eles) e movem a vista junto
  const gTouch = new Map();
  let gPinch = null;
  const gRel = (e) => { const r = svgEl.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const gPinchState = () => {
    const [a, b] = [...gTouch.values()];
    return { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, k: gTrans.k, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
  };
  svgEl.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    gTouch.set(e.pointerId, gRel(e));
    try { svgEl.setPointerCapture(e.pointerId); } catch { /* sem captura, o gesto segue pelos eventos da rede */ }
    gPinch = gTouch.size === 2 ? gPinchState() : null;
  });
  svgEl.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'touch' || !gTouch.has(e.pointerId)) return;
    const prev = gTouch.get(e.pointerId), cur = gRel(e);
    gTouch.set(e.pointerId, cur);
    if (gTouch.size === 1) { gTrans.x += cur.x - prev.x; gTrans.y += cur.y - prev.y; applyT(); }
    else if (gTouch.size === 2 && gPinch) {
      const st = gPinchState();
      const k = Math.min(6, Math.max(0.1, gPinch.k * st.dist / gPinch.dist));
      const mx = st.mid.x, my = st.mid.y;
      gTrans.x = mx - ((mx - gTrans.x) / gTrans.k) * k; gTrans.y = my - ((my - gTrans.y) / gTrans.k) * k; gTrans.k = k;
      applyT();
    }
  });
  const gTouchEnd = (e) => {
    if (e.pointerType !== 'touch' || !gTouch.delete(e.pointerId)) return;
    gPinch = gTouch.size === 2 ? gPinchState() : null;
  };
  svgEl.addEventListener('pointerup', gTouchEnd);
  svgEl.addEventListener('pointercancel', gTouchEnd);
  // destaque dos vizinhos ao passar o mouse (sem redesenhar)
  svgEl.addEventListener('mouseover', (e) => {
    const nd = e.target.closest('.gn'); if (!nd || drag) return;
    gHover = +nd.dataset.i; gHoverId = gLast.nodes[gHover].id; paintDim(); updateLabels();
  });
  svgEl.addEventListener('mouseout', (e) => {
    if (!e.target.closest('.gn')) return;
    gHover = null; gHoverId = null; paintDim(); scheduleLabels();
  });
}

function sideMsg(text, cls) { const s = $('#gSide'); const m = el('div', 'msg ' + (cls || ''), text); m.id = 'gMsg'; s.prepend(m); }

window.addEventListener('keydown', (e) => {
  if (!graphOpen) return;
  if (e.key === 'Escape') { const open = document.querySelector('#graph .g-bar details[open]'); if (open) { e.stopPropagation(); open.open = false; return; } e.stopPropagation(); if (gNarrow() && $('#gSide').classList.contains('open')) toggleSide(false); else closeGraph(); return; }
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(tag) || e.ctrlKey || e.metaKey || e.altKey) return;      // digitando num campo: as teclas são dele
  const k = e.key; let used = true;
  if (k === '+' || k === '=') zoomBy(1.3); else if (k === '-' || k === '_') zoomBy(1 / 1.3); else if (k === '0') fitGraph();
  else if (k === 'c' || k === 'C') centerSel();
  else if (k === 'f' || k === 'F') { $('#gFocus').click(); }
  else if (k === 'l' || k === 'L') { $('#gLocal').click(); }
  else if (k === 'g' || k === 'G') { $('#gGroup').click(); }
  else if (k === '/') { $('#gSearch').focus(); }
  else if (k === 'ArrowLeft') stepSelection(-1, 0); else if (k === 'ArrowRight') stepSelection(1, 0); else if (k === 'ArrowUp') stepSelection(0, -1); else if (k === 'ArrowDown') stepSelection(0, 1);
  else if (k === 'Enter' && gSel && gLast && gLast.g.byId.get(gSel)) openTopic(gLast.g.byId.get(gSel));
  else used = false;
  if (used) { e.preventDefault(); e.stopPropagation(); }
}, true);
if (map) render();   // no boot não há mapa ainda (a tela inicial aparece antes)
