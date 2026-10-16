'use strict';
const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const core = path.join(__dirname, '..', 'core');
const { MindMap, createNode } = require(path.join(core, 'model'));
const { readMom, writeMom } = require(path.join(core, 'mom'));
const { fromMarkdown, fromOPML } = require(path.join(core, 'import'));
const { layoutMap, textWidth } = require(path.join(core, 'layout'));
const { toSVG, renderGroup } = require(path.join(core, 'svg'));
const { toMarkdown, toOPML } = require(path.join(core, 'export')); // PDF/Word: ver 'render-export' em electron/main.js
const { THEMES } = require(path.join(core, 'themes'));

const $ = (s) => document.querySelector(s);
const svg = $('#svg'), view = $('#view'), editor = $('#editor'), notes = $('#notes'), stage = $('#stage');

const { MARKERS } = require(path.join(core, 'markers'));

const S = require(path.join(core, 'study'));
const { backupBefore, backupDirFor, listBackups } = require(path.join(core, 'backup'));
const { logError } = require(path.join(core, 'errorlog'));
const { textToNodes } = require(path.join(core, 'edital'));
/** "Hoje" no formato AAAA-MM-DD; `window.__today` permite fixar a data nos testes. */
const nowStr = () => window.__today || S.todayStr();

let map, filePath = null, dirty = false, selectedId = null, selectedRel = null, L = null;
let selIds = new Set();     // seleção múltipla; selectedId é sempre o "primário" e pertence ao conjunto
let rev = 0;                // contador de alterações (usado pelo autosave)
let dashOpen = false;       // painel de estudos aberto (ver study-ui.js)
let graphOpen = false;      // rede de conhecimento aberta (ver graph-ui.js)
let relateFrom = null;      // modo "criar relação": id do tópico de origem
let hits = null;            // Set de ids encontrados pela busca
let present = null;         // { order: [ids], i } durante a apresentação
let pan = { x: 0, y: 0, k: 1 };
let notesOwner = null;      // { rel: bool, id } — a quem pertence o texto exibido no painel lateral

// ---------- ciclo de vida ----------
function newMap() {
  selectedRel = null; relateFrom = null; hits = null; selIds = new Set(); document.body.classList.remove('relating');
  if (typeof resetStudyUI === 'function') resetStudyUI();
  const root = createNode('Ideia central');
  map = new MindMap(root, { name: 'Novo mapa', theme: $('#theme').value || 'ocean' });
  ['Tópico 1', 'Tópico 2', 'Tópico 3'].forEach((t) => map.addChild(root.id, t));
  map._undo.length = 0;
  filePath = null; dirty = false; selectedId = root.id;
  render(); fit();
}

function setStatus(msg) { $('#status').textContent = msg; }

function render() {
  L = layoutMap(map, { today: nowStr() });
  // selectedId manda: se foi trocado por outro código, descarta a seleção múltipla antiga
  if (!selectedId) selIds = new Set(); else if (!selIds.has(selectedId)) selIds = new Set([selectedId]);
  for (const id of [...selIds]) if (!map.find(id)) selIds.delete(id);
  svg.setAttribute('font-family', L.theme.font);
  const visible = present ? new Set(present.order.slice(0, present.i + 1)) : null;
  // No editor o mapa fica numa "prancheta" sobre a mesa escura; na apresentação o fundo do tema ocupa a tela toda.
  stage.style.background = present ? L.theme.background : '';
  const bb = L.bounds;
  const board = present ? '' : `<defs><filter id="abs" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="3" stdDeviation="9" flood-color="#000" flood-opacity=".5"/></filter></defs>`
    + `<rect x="${bb.x}" y="${bb.y}" width="${bb.w}" height="${bb.h}" rx="3" fill="${L.theme.background}" filter="url(#abs)"/>`;
  view.innerHTML = board + renderGroup(L, { selectedId: present ? null : selectedId, selectedIds: present ? null : selIds, selectedRel, interactive: !present, visible, hits });
  view.setAttribute('transform', `translate(${pan.x} ${pan.y}) scale(${pan.k})`);
  $('#theme').value = map.meta.theme;
  const sel = selectedId && map.find(selectedId);
  const rel = selectedRel && map.meta.relations.find((r) => r.id === selectedRel);
  $('#sideTitle').textContent = $('#notesLabel').textContent = rel ? 'Rótulo da relação' : 'Notas';
  notes.disabled = !sel && !rel;
  if (document.activeElement !== notes) {
    notes.value = rel ? rel.label || '' : sel ? sel.node.notes : '';
    notesOwner = rel ? { rel: true, id: rel.id } : sel ? { rel: false, id: sel.node.id } : null;
  }
  if (typeof refreshNotesView === 'function') refreshNotesView();
  $('#progress').value = sel && sel.node.progress != null ? String(sel.node.progress) : '';
  document.title = `${dirty ? '• ' : ''}${map.root.title} — MindCraft`;
  let count = 0; map.walk(() => count++);
  setStatus(`${count} tópicos · ${filePath || 'sem arquivo'}`);
  ipcRenderer.send('dirty', { dirty, timing: typeof timer !== 'undefined' && !!timer });
  syncChrome(sel);
  autosaveTick();
}

// ---------- interface (barras e painéis) ----------
function syncChrome(sel) {
  $('#docTitle').textContent = (filePath ? path.basename(filePath) : map.root.title || 'Sem título');
  $('#dirtyDot').hidden = !dirty;
  const pct = Math.round(pan.k * 100);
  $('#zoom').value = Math.min(400, Math.max(10, pct)); $('#zoomVal').textContent = pct + '%';
  document.querySelectorAll('.theme-card').forEach((c) => c.classList.toggle('active', c.dataset.theme === map.meta.theme));
  const mk = sel ? sel.node.markers || [] : [];
  document.querySelectorAll('#markerChips .chip').forEach((c) => c.classList.toggle('active', mk.includes(c.dataset.marker)));
  const pv = sel && sel.node.progress != null ? String(sel.node.progress) : '';
  document.querySelectorAll('#progressChips .chip').forEach((c) => c.classList.toggle('active', c.dataset.value === pv));
  const fillIn = $('#fill'), shapeIn = $('#shape');
  if (sel && L.boxes.has(sel.node.id)) {
    const st = L.boxes.get(sel.node.id).style;
    if (/^#[0-9a-f]{6}$/i.test(st.fill)) fillIn.value = st.fill;
    shapeIn.value = sel.node.style.shape || '';
  }
  buildOutline();
  if (typeof syncStudy === 'function') syncStudy(sel); // study-ui.js (carregado depois)
  if (typeof syncLinks === 'function') syncLinks();    // graph-ui.js
}

let outlineSig = '';
function buildOutline() {
  const parts = [selectedId, selectedRel, hits ? [...hits].join(',') : ''];
  map.walk((n, l) => parts.push(n.id, n.title, n.collapsed, n.progress, (n.markers || []).join(), l));
  const sig = parts.join('|');
  if (sig === outlineSig) return;
  outlineSig = sig;
  const box = $('#outline');
  box.textContent = '';
  const frag = document.createDocumentFragment();
  const add = (n, depth, branch) => {
    const row = document.createElement('div');
    row.className = 'ol-row' + (n.id === selectedId ? ' sel' : '') + (hits && hits.has(n.id) ? ' hit' : '');
    row.dataset.olId = n.id; row.setAttribute('role', 'treeitem');
    row.style.paddingLeft = 8 + depth * 14 + 'px';
    const tog = document.createElement('span');
    tog.className = 'ol-tog';
    if (n.children.length) { tog.textContent = n.collapsed ? '▶' : '▼'; tog.dataset.olTog = n.id; }
    const dot = document.createElement('span');
    dot.className = 'ol-dot'; dot.style.background = branch;
    const t = document.createElement('span');
    t.className = 'ol-t'; t.textContent = n.title;
    row.append(tog, dot, t);
    if (n.progress != null) { const p = document.createElement('span'); p.className = 'ol-pct'; p.textContent = n.progress + '%'; row.append(p); }
    frag.append(row);
    if (!n.collapsed) n.children.forEach((c, i) => add(c, depth + 1, depth === 0 ? L.theme.branches[i % L.theme.branches.length] : branch));
  };
  add(map.root, 0, L.theme.branches[0]);
  box.append(frag);
  // rola SÓ a lista da Estrutura (scrollIntoView rolaria também a coluna de painéis inteira)
  const s = box.querySelector('.sel'), sc = box.parentElement;
  if (s && sc) {
    const top = s.offsetTop - box.offsetTop, bot = top + s.offsetHeight;
    if (top < sc.scrollTop) sc.scrollTop = top; else if (bot > sc.scrollTop + sc.clientHeight) sc.scrollTop = bot - sc.clientHeight;
  }
}
$('#outline').addEventListener('click', (e) => {
  const tog = e.target.closest('[data-ol-tog]');
  if (tog) { const id = tog.dataset.olTog; const s = map.find(id); if (s) change(() => map.update(id, { collapsed: !s.node.collapsed })); return; }
  const row = e.target.closest('.ol-row');
  if (!row) return;
  commitNotes();
  selectedId = row.dataset.olId; selectedRel = null; render();
  const b = L.boxes.get(selectedId); // se o tópico está fora da tela, centraliza
  if (b) {
    const r = svg.getBoundingClientRect(), sx = (b.x + b.w / 2) * pan.k + pan.x, sy = (b.y + b.h / 2) * pan.k + pan.y;
    if (sx < 20 || sy < 20 || sx > r.width - 20 || sy > r.height - 20) centerOn(selectedId);
  }
});
/** Mostra um painel lateral por vez (abas). Lembra a última aba usada. */
function showPanel(name) {
  if (!document.querySelector('.panel[data-panel="' + name + '"]')) name = 'props';
  document.querySelectorAll('#panels .panel').forEach((p) => { p.hidden = p.dataset.panel !== name; });
  document.querySelectorAll('#ptabs .ptab').forEach((b) => { const on = b.dataset.tab === name; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
  try { localStorage.setItem('mc-tab', name); } catch { /* sem storage */ }
}
document.querySelectorAll('#ptabs .ptab').forEach((b) => b.addEventListener('click', () => { showPanel(b.dataset.tab); b.blur(); }));
{ let t = 'study'; try { t = localStorage.getItem('mc-tab') || 'study'; } catch { /* sem storage */ } showPanel(t); }

/** Grava no modelo o texto do painel (notas/rótulo) para o dono ORIGINAL, mesmo que a seleção já tenha mudado. */
function commitNotes() {
  if (!notesOwner) return;
  const o = notesOwner;
  if (o.rel) {
    const r = map.meta.relations.find((x) => x.id === o.id);
    if (r && (r.label || '') !== notes.value) change(() => map.updateRelation(o.id, { label: notes.value }));
  } else {
    const s = map.find(o.id);
    if (s && (s.node.notes || '') !== notes.value) change(() => map.update(o.id, { notes: notes.value }));
  }
}

function change(fn) { const r = fn(); if (r !== false && r !== null) { dirty = true; rev++; } render(); return r; }

/** Pergunta o que fazer com alterações pendentes. Retorna true se pode prosseguir. */
async function confirmDiscard() {
  commitNotes();
  if (!dirty) return true;
  const c = await ipcRenderer.invoke('dialog:confirm-discard');
  if (c === 0) return (await save(false)) !== false;
  return c === 1;
}

/** Se o tópico está fora da área visível (ou colado na borda), desloca o mapa o mínimo necessário para mostrá-lo. */
function reveal(id, margin = 70) {
  const b = L.boxes.get(id); if (!b) return false;
  const r = svg.getBoundingClientRect();
  const x1 = b.x * pan.k + pan.x, x2 = (b.x + b.w) * pan.k + pan.x, y1 = b.y * pan.k + pan.y, y2 = (b.y + b.h) * pan.k + pan.y;
  let dx = 0, dy = 0;
  if (x1 < margin) dx = margin - x1; else if (x2 > r.width - margin) dx = Math.min(0, r.width - margin - x2);
  if (y1 < margin) dy = margin - y1; else if (y2 > r.height - margin) dy = Math.min(0, r.height - margin - y2);
  if (!dx && !dy) return false;
  pan.x += dx; pan.y += dy; render();
  return true;
}

function fit() {
  const r = svg.getBoundingClientRect();
  const { x, y, w, h } = L.bounds;
  const raw = Math.min((r.width * 0.92) / w, (r.height * 0.92) / h, 1.5); // folga em volta da prancheta
  pan.k = Math.max(0.25, raw);
  if (raw < 0.25) { // mapa enorme: abaixo de 25% nada se lê; mantém 25% centrado na raiz (use "Níveis" para recolher)
    const rb = L.boxes.get(map.root.id);
    pan.x = r.width / 2 - (rb.x + rb.w / 2) * pan.k; pan.y = r.height / 2 - (rb.y + rb.h / 2) * pan.k;
  } else {
    pan.x = (r.width - w * pan.k) / 2 - x * pan.k;
    pan.y = (r.height - h * pan.k) / 2 - y * pan.k;
  }
  render();
}

// ---------- arquivos ----------
async function openPath(p, { silent = false } = {}) {
  try {
    const ext = path.extname(p).slice(1).toLowerCase(), name = path.basename(p, path.extname(p));
    if (typeof resetStudyUI === 'function') resetStudyUI();
    map = ext === 'md' ? fromMarkdown(fs.readFileSync(p, 'utf8'), name)
      : ext === 'opml' ? fromOPML(fs.readFileSync(p, 'utf8'), name) : readMom(fs.readFileSync(p));
    // md/opml são importações: o "Salvar" pede um .mom novo em vez de sobrescrever o original
    filePath = ext === 'mom' ? p : null; dirty = ext !== 'mom'; selectedId = map.root.id; selIds = new Set(); selectedRel = null; hits = null; rev++;
    render(); fit();
    if (ext === 'mom') ipcRenderer.invoke('recent:add', p).catch(() => {});
    return true;
  } catch (e) {
    logOnly('Não foi possível abrir ' + p + ': ' + e.message);   // falha esperada (arquivo ruim): só no registro, sem console.error
    if (silent) setStatus('Não reabri o último mapa: ' + e.message); else ipcRenderer.invoke('dialog:error', 'Não foi possível abrir: ' + e.message);
    return false;
  }
}
/** Retorna true se salvou, false se cancelou ou falhou. */
async function save(as) {
  commitNotes();
  let target = filePath;
  if (!target || as) {
    target = await ipcRenderer.invoke('dialog:save', 'mom', (map.root.title || 'mapa') + '.mom');
    if (!target) return false;
    if (!/\.mom$/i.test(target)) target += '.mom';
  }
  try {
    map.meta.name = map.root.title;
    if (userDataDir) { try { backupBefore(target, path.join(userDataDir, 'backups')); } catch (e) { report('Backup falhou (o salvamento continua): ' + e.message); } }   // guarda a versão anterior
    writeMom(map, target);
  } catch (e) { ipcRenderer.invoke('dialog:error', 'Falha ao salvar: ' + e.message); return false; }
  filePath = target; dirty = false; render();
  ipcRenderer.invoke('recent:add', target).catch(() => {});
  return true;
}
const rasterize = (size = 2) => new Promise((resolve, reject) => {
  const L2 = layoutMap(map), b = L2.bounds;
  size = Math.min(size, 8000 / Math.max(b.w, b.h)); // evita estourar o limite do canvas em mapas gigantes
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = b.w * size; c.height = b.h * size;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, c.width, c.height);
    c.toBlob(async (bl) => resolve({ buf: Buffer.from(await bl.arrayBuffer()), width: b.w, height: b.h }), 'image/png');
  };
  img.onerror = reject;
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(toSVG(map));
});
async function doExport(fmt) {
  if (!fmt) return;
  commitNotes();
  const p = await ipcRenderer.invoke('dialog:save', fmt, (map.root.title || 'mapa') + '.' + fmt);
  if (!p) return;
  try {
    let data;
    if (fmt === 'pdf') data = await ipcRenderer.invoke('render-export', 'pdf', map.toJSON(), { outline: true });
    else if (fmt === 'docx') { const img = await rasterize(2); data = await ipcRenderer.invoke('render-export', 'docx', map.toJSON(), { image: img.buf, imageSize: { width: img.width, height: img.height } }); }
    else if (fmt === 'png') data = (await rasterize(2)).buf;
    else if (fmt === 'svg') data = toSVG(map);
    else if (fmt === 'md') data = toMarkdown(map);
    else if (fmt === 'opml') data = toOPML(map);
    fs.writeFileSync(p, data);
    setStatus('Exportado: ' + p);
    return p;
  } catch (e) { ipcRenderer.invoke('dialog:error', 'Falha ao exportar: ' + e.message); }
}

// ---------- ações de edição ----------
const sel = () => selectedId && map.find(selectedId);
const act = {
  child() { const s = sel(); if (!s) return; const n = change(() => map.addChild(s.node.id)); selectedId = n.id; render(); reveal(n.id); startEdit(); },
  sibling() { const s = sel(); if (!s) return; const n = s.parent ? change(() => map.addSibling(s.node.id)) : change(() => map.addChild(s.node.id)); selectedId = n.id; render(); reveal(n.id); startEdit(); },
  moveUp() { reshape('moveSibling', -1, 'Já é o primeiro tópico deste nível.'); },
  moveDown() { reshape('moveSibling', +1, 'Já é o último tópico deste nível.'); },
  indent() { reshape('indent', undefined, 'Não há irmão acima para receber este tópico como filho.'); },
  outdent() { reshape('outdent', undefined, 'Este tópico já está no primeiro nível (disciplina): não dá para subir mais.'); },
  relate() {
    if (relateFrom) return cancelRelate();
    if (!sel()) return setStatus('Selecione o tópico de origem primeiro.');
    relateFrom = selectedId; document.body.classList.add('relating');
    setStatus('Relação: clique no tópico de destino (Esc cancela).');
  },
  present() { present ? stopPresent() : startPresent(); },
  delete() {
    if (selectedRel) { const id = selectedRel; selectedRel = null; return change(() => map.removeRelation(id)); }
    const s = sel(); if (!s) return;
    const ids = targets();
    const keep = ids.length > 1 ? (map.topLevel(ids)[0] && map.find(map.topLevel(ids)[0].id).parent) : s.parent; // quem fica selecionado
    if (!keep) return setStatus('A raiz do mapa não pode ser excluída.');
    selectedId = keep.id;
    change(() => map.removeMany(ids));
    setStatus(ids.length > 1 ? `${ids.length} tópicos excluídos (Ctrl+Z desfaz tudo de uma vez)` : '');
  },
  undo() { commitNotes(); if (map.undo()) { dirty = true; rev++; selectedRel = null; render(); } },
  redo() { if (map.redo()) { dirty = true; rev++; selectedRel = null; render(); } },
  fit,
  bold() { const s = sel(); if (s) { const v = !(s.node.style.bold ?? L.boxes.get(s.node.id).style.bold); change(() => map.updateMany(targets(), { style: { bold: v } })); } },
  toggle() {
    const s = sel(); if (!s || !s.node.children.length) return;
    const v = !s.node.collapsed;
    change(() => map.updateMany(targets().filter((id) => map.find(id).node.children.length), { collapsed: v }));
  },
};
/** Reordena/muda o nível do tópico selecionado (um por vez; uma ação desfazível). */
function reshape(method, arg, failMsg) {
  const s = sel(); if (!s) return;
  if (selIds.size > 1) return setStatus('Selecione um único tópico para reordenar ou mudar de nível.');
  const id = s.node.id;
  if (change(() => map[method](id, arg) || false)) { reveal(id); setStatus(''); } else setStatus(failMsg);
}
/** Alvos das ações de formatação: todos os selecionados, ou só o primário. */
const targets = () => (selIds.size ? [...selIds] : selectedId ? [selectedId] : []);
document.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => { b.blur(); act[b.dataset.act](); }));

function cancelRelate() { relateFrom = null; document.body.classList.remove('relating'); render(); }

$('#marker').add(new Option('＋', ''));
for (const [id, m] of Object.entries(MARKERS)) $('#marker').add(new Option(`${m.glyph}  ${m.label}`, id));
$('#marker').addEventListener('change', (e) => {
  const s = sel(); if (s && e.target.value) change(() => map.toggleMarkerMany(targets(), e.target.value));
  e.target.value = '';
});
$('#progress').addEventListener('change', (e) => {
  const s = sel(); if (s) change(() => map.updateMany(targets(), { progress: e.target.value === '' ? null : +e.target.value }));
});

// ---------- busca ----------
let hitList = [], hitIdx = -1;
$('#search').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  hitList = [];
  if (q) map.walk((n) => { if (n.title.toLowerCase().includes(q) || (n.notes || '').toLowerCase().includes(q)) hitList.push(n.id); });
  hits = q ? new Set(hitList) : null; hitIdx = -1;
  render(); setStatus(q ? `${hitList.length} resultado(s) — Enter vai para o próximo` : '');
});
$('#search').addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { e.target.value = ''; e.target.dispatchEvent(new Event('input')); e.target.blur(); }
  if (e.key !== 'Enter' || !hitList.length) return;
  hitIdx = (hitIdx + 1) % hitList.length;
  // se o resultado está dentro de um ramo recolhido, expande o caminho até ele
  const path = []; (function find(n, acc) { if (n.id === hitList[hitIdx]) { path.push(...acc); return true; } return n.children.some((c) => find(c, [...acc, n])); })(map.root, []);
  const closed = path.filter((n) => n.collapsed);
  if (closed.length) closed.forEach((n) => { n.collapsed = false; });
  selectedId = hitList[hitIdx]; selectedRel = null; render(); centerOn(selectedId);
});

// ---------- apresentação ----------
function centerOn(id, k) {
  const b = L.boxes.get(id); if (!b) return;
  const r = svg.getBoundingClientRect();
  if (k) pan.k = k;
  pan.x = r.width / 2 - (b.x + b.w / 2) * pan.k; pan.y = r.height / 2 - (b.y + b.h / 2) * pan.k;
  render();
}
function presentStep(d) {
  const i = Math.min(present.order.length - 1, Math.max(0, present.i + d));
  present.i = i;
  const hud = $('#hud'); hud.hidden = false; hud.textContent = `${i + 1} / ${present.order.length}  ·  ← → navega · Esc sai`;
  render(); centerOn(present.order[i], 1.5);
}
function startPresent() {
  render(); // garante L atual; DFS em ordem de leitura (boxes é inserido em pré-ordem)
  present = { order: [...L.boxes.keys()], i: 0 };
  document.body.classList.add('presenting');
  document.documentElement.requestFullscreen?.().catch(() => {});
  setTimeout(() => presentStep(0), 150);
}
function stopPresent() {
  if (!present) return;
  present = null; $('#hud').hidden = true;
  document.body.classList.remove('presenting');
  if (document.fullscreenElement) document.exitFullscreen();
  setTimeout(() => { render(); fit(); }, 100);
}
document.addEventListener('fullscreenchange', () => { if (present && !document.fullscreenElement) stopPresent(); });

for (const [id, t] of Object.entries(THEMES)) {
  $('#theme').add(new Option(t.name, id));
  const card = document.createElement('button');
  card.className = 'theme-card'; card.dataset.theme = id; card.title = t.name;
  const sw = document.createElement('div'); sw.className = 'sw'; sw.style.background = t.background;
  for (const c of t.branches.slice(0, 4)) { const i = document.createElement('i'); i.style.background = c; sw.append(i); }
  const lb = document.createElement('span'); lb.textContent = t.name.replace(/ \(.*\)/, '');
  card.append(sw, lb);
  card.addEventListener('click', () => { $('#theme').value = id; $('#theme').dispatchEvent(new Event('change')); card.blur(); });
  $('#themeGrid').append(card);
}
$('#theme').addEventListener('change', (e) => change(() => { map.meta.theme = e.target.value; }));

// chips de marcador (alternam) e de progresso (segmentado); os <select> ocultos continuam sendo a fonte da ação
for (const [id, m] of Object.entries(MARKERS)) {
  const b = document.createElement('button');
  b.className = 'chip'; b.dataset.marker = id; b.title = m.label;
  const d = document.createElement('span'); d.className = 'dot'; d.style.background = m.color; d.textContent = m.glyph;
  b.append(d);
  b.addEventListener('click', () => { $('#marker').value = id; $('#marker').dispatchEvent(new Event('change')); b.blur(); });
  $('#markerChips').append(b);
}
for (const [v, label] of [['', '—'], ['0', '0%'], ['25', '25%'], ['50', '50%'], ['75', '75%'], ['100', '100%']]) {
  const b = document.createElement('button');
  b.className = 'chip'; b.dataset.value = v; b.textContent = label; b.title = v === '' ? 'Sem barra de progresso' : `Progresso ${label}`;
  b.addEventListener('click', () => { $('#progress').value = v; $('#progress').dispatchEvent(new Event('change')); b.blur(); });
  $('#progressChips').append(b);
}

// zoom pela barra de status (mantém o centro da vista)
function zoomTo(k) {
  const r = svg.getBoundingClientRect(), cx = r.width / 2, cy = r.height / 2;
  k = Math.min(4, Math.max(0.1, k));
  pan.x = cx - ((cx - pan.x) / pan.k) * k; pan.y = cy - ((cy - pan.y) / pan.k) * k; pan.k = k;
  render();
}
$('#zoom').addEventListener('input', (e) => zoomTo(+e.target.value / 100));
$('#zoomIn').addEventListener('click', () => zoomTo(pan.k * 1.2));
$('#zoomOut').addEventListener('click', () => zoomTo(pan.k / 1.2));

// tema claro/escuro da interface (preferência por usuário)
const setLight = (on) => { document.body.classList.toggle('light', on); try { localStorage.setItem('mc-light', on ? '1' : '0'); } catch { /* sem storage */ } };
try { if (localStorage.getItem('mc-light') === '1') document.body.classList.add('light'); } catch { /* sem storage */ }
$('#lightToggle').addEventListener('click', () => setLight(!document.body.classList.contains('light')));
$('#fill').addEventListener('input', (e) => { const s = sel(); if (s) change(() => map.updateMany(targets(), { style: { fill: e.target.value, color: contrast(e.target.value) } })); });
$('#shape').addEventListener('change', (e) => { const s = sel(); if (s) change(() => map.updateMany(targets(), { style: { shape: e.target.value || undefined } })); });
// Níveis: recolhe/expande por profundidade (essencial em editais com centenas de tópicos); uma ação desfazível
$('#levelSel').addEventListener('change', (e) => {
  const v = e.target.value; e.target.value = '';
  if (v === '') return;
  const n = v === 'all' ? Infinity : +v;
  const changed = change(() => map.showLevels(n) || false);
  fit();
  setStatus(changed ? `${changed} ramo(s) ${n === Infinity ? 'expandido(s)' : 'recolhido(s)/expandido(s)'}` : 'Os níveis já estavam assim.');
});
$('#export').addEventListener('change', async (e) => { await doExport(e.target.value); e.target.value = ''; });
// o painel edita o rótulo quando uma relação está selecionada; senão, as notas do tópico
notes.addEventListener('change', commitNotes);
notes.addEventListener('blur', () => { commitNotes(); render(); }); // re-render: o painel passa a mostrar a nova seleção

function contrast(hex) {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#111111' : '#ffffff';
}

// ---------- edição inline ----------
function startEdit() {
  const s = sel(); if (!s) return;
  const b = L.boxes.get(s.node.id);
  const w = Math.max(b.w * pan.k, 120);
  editor.hidden = false;
  editor.value = s.node.title;
  editBase = { cx: (b.x + b.w / 2) * pan.k + pan.x, top: b.y * pan.k + pan.y, minW: w, size: Math.max(12, b.style.size * pan.k), bold: !!b.style.bold };
  Object.assign(editor.style, {
    left: `${(b.x + b.w / 2) * pan.k + pan.x - w / 2}px`, top: `${b.y * pan.k + pan.y}px`,
    width: `${w}px`, height: `${Math.max(b.h * pan.k, 30)}px`, fontSize: `${Math.max(12, b.style.size * pan.k)}px`,
  });
  fitEditor(); editor.focus(); editor.select();
}
/** O campo cresce com o texto (senão a 1ª linha some quando o título quebra em várias). */
let editBase = null;
function fitEditor() {
  const sw = stage.clientWidth, sh = stage.clientHeight;
  if (editBase) { // alarga até a largura máxima de um tópico (como o layout quebra o texto) e mantém o campo dentro da área visível
    const texto = Math.max(...editor.value.split('\n').map((l) => textWidth(l, editBase.size, editBase.bold)));
    const w = Math.min(sw - 16, Math.max(editBase.minW, Math.min(260 * pan.k + 28, texto + 36)));
    editor.style.width = w + 'px';
    editor.style.left = Math.max(8, Math.min(editBase.cx - w / 2, sw - w - 8)) + 'px';
  }
  editor.style.height = 'auto';
  const borda = editor.offsetHeight - editor.clientHeight; // border-box: a altura precisa incluir as bordas, senão sobram 2 px de rolagem
  const h = Math.max(30, editor.scrollHeight + borda);
  editor.style.height = h + 'px';
  if (editBase) editor.style.top = Math.max(8, Math.min(editBase.top, sh - h - 8)) + 'px';
}
editor.addEventListener('input', fitEditor);
function endEdit(commit) {
  if (editor.hidden) return;
  editor.hidden = true;
  const s = sel();
  if (commit && s && editor.value.trim() && editor.value !== s.node.title) change(() => map.update(s.node.id, { title: editor.value.trim() }));
  stage.focus();
}
editor.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); endEdit(true); }
  else if (e.key === 'Escape') endEdit(false);
  else if (e.key === 'Tab') { e.preventDefault(); endEdit(true); act.child(); }
  e.stopPropagation();
});
editor.addEventListener('blur', () => endEdit(true));

// ---------- mouse: seleção, pan, zoom, arrastar-e-soltar ----------
const nodeAt = (el) => el && el.closest && el.closest('.node');
let drag = null;
svg.addEventListener('mousedown', (e) => {
  if (present) return;
  if (document.activeElement === notes) commitNotes(); // o blur só ocorre depois do mousedown; grava antes de trocar a seleção
  const n = nodeAt(e.target);
  if (relateFrom) { // segundo clique do modo relação
    const from = relateFrom;
    cancelRelate();
    if (n) {
      const r = change(() => map.addRelation(from, n.dataset.id));
      if (r) { selectedRel = r.id; selectedId = null; showPanel('notes'); render(); setTimeout(() => notes.focus(), 0); setStatus('Relação criada — digite um rótulo (opcional) no painel.'); } // adiado: o clique ainda vai mover o foco
      else setStatus('Relação inválida ou já existente.');
    }
    return;
  }
  const rl = e.target.closest && e.target.closest('.rel');
  if (rl) { selectedRel = rl.dataset.rel; selectedId = null; showPanel('notes'); render(); return; }
  selectedRel = null;
  const additive = e.ctrlKey || e.metaKey || (e.shiftKey && !!n); // Shift no fundo = retângulo de seleção
  if (n && additive) { // Ctrl/Shift + clique: inclui ou retira o tópico da seleção
    const id = n.dataset.id;
    if (selIds.has(id)) { selIds.delete(id); selectedId = selIds.size ? [...selIds][selIds.size - 1] : null; }
    else { selIds.add(id); selectedId = id; }
    render(); drag = null; return;
  }
  drag = { sx: e.clientX, sy: e.clientY, ox: pan.x, oy: pan.y, id: n && n.dataset.id, moved: false, target: null, marquee: !n && e.shiftKey };
  if (n) {
    const id = n.dataset.id;
    if (selIds.has(id)) selectedId = id; // clique num já selecionado: mantém o grupo (pode ser o início de um arrasto)
    else { selIds = new Set([id]); selectedId = id; }
    render();
    // Duplo clique: o navegador NÃO emite `dblclick` porque o render() acima recria o DOM entre os cliques,
    // então detectamos pelo contador de cliques do próprio mousedown (adiado para depois do foco padrão).
    if (e.detail === 2) setTimeout(() => { if (selectedId === id) startEdit(); }, 0);
  }
});
window.addEventListener('mousemove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
  if (!drag.moved && Math.hypot(dx, dy) < 5) return;
  drag.moved = true;
  if (drag.marquee) { // retângulo de seleção
    const r = stage.getBoundingClientRect(), mq = $('#marquee');
    mq.hidden = false;
    Object.assign(mq.style, { left: `${Math.min(drag.sx, e.clientX) - r.left}px`, top: `${Math.min(drag.sy, e.clientY) - r.top}px`, width: `${Math.abs(dx)}px`, height: `${Math.abs(dy)}px` });
    return;
  }
  if (!drag.id) { pan.x = drag.ox + dx; pan.y = drag.oy + dy; view.setAttribute('transform', `translate(${pan.x} ${pan.y}) scale(${pan.k})`); svg.classList.add('panning'); return; }
  const t = nodeAt(document.elementFromPoint(e.clientX, e.clientY));
  view.querySelectorAll('.drop').forEach((el) => el.classList.remove('drop'));
  drag.target = t && t.dataset.id !== drag.id ? t.dataset.id : null;
  if (drag.target) t.classList.add('drop');
});
window.addEventListener('mouseup', (e) => {
  if (!drag) return;
  svg.classList.remove('panning');
  const d = drag; drag = null;
  if (d.marquee && d.moved) {
    $('#marquee').hidden = true;
    const r = svg.getBoundingClientRect();
    const x1 = Math.min(d.sx, e.clientX) - r.left, x2 = Math.max(d.sx, e.clientX) - r.left;
    const y1 = Math.min(d.sy, e.clientY) - r.top, y2 = Math.max(d.sy, e.clientY) - r.top;
    const ids = [...L.boxes.values()].filter((b) => {
      const bx1 = b.x * pan.k + pan.x, bx2 = (b.x + b.w) * pan.k + pan.x, by1 = b.y * pan.k + pan.y, by2 = (b.y + b.h) * pan.k + pan.y;
      return bx1 < x2 && bx2 > x1 && by1 < y2 && by2 > y1;
    }).map((b) => b.id);
    selIds = new Set(ids); selectedId = ids.length ? ids[ids.length - 1] : null;
    render(); setStatus(`${ids.length} tópico(s) selecionado(s)`);
    return;
  }
  if (d.moved && d.id && d.target) {
    const ids = selIds.has(d.id) ? [...selIds] : [d.id]; // arrastar um selecionado leva o grupo todo
    const ok = change(() => map.moveMany(ids, d.target));
    if (!ok) setStatus('Movimento inválido.');
  } else if (d.moved && d.id) render();
  else if (!d.id && !d.moved && !d.marquee) { selectedId = null; render(); }
  else if (d.id && !d.moved && selIds.size > 1) { selIds = new Set([d.id]); selectedId = d.id; render(); } // clique simples reduz o grupo a um
  else if (d.marquee) { $('#marquee').hidden = true; }
});
svg.addEventListener('dblclick', (e) => { if (nodeAt(e.target)) startEdit(); });
svg.addEventListener('wheel', (e) => {
  e.preventDefault();
  const r = svg.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
  const k = Math.min(4, Math.max(0.1, pan.k * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
  pan.x = mx - ((mx - pan.x) / pan.k) * k; pan.y = my - ((my - pan.y) / pan.k) * k; pan.k = k;
  render();
}, { passive: false });

// ---------- copiar / recortar / colar ----------
let clip = null; // { text, trees } — cópia interna (mantém marcadores, progresso e notas); o texto também vai à área de transferência
const MAX_PASTE_NODES = 3000;
const outlineText = (nodes, depth = 0) => nodes.map((n) => '  '.repeat(depth) + '- ' + n.title.replace(/\s*\n\s*/g, ' ') + '\n' + outlineText(n.children, depth + 1)).join('');
const countNodes = (list) => list.reduce((a, n) => a + 1 + countNodes(n.children), 0);

async function copySelection() {
  commitNotes();
  const tops = map.topLevel(targets());
  if (!tops.length) { setStatus('Selecione um ou mais tópicos (exceto a raiz) para copiar.'); return false; }
  const trees = tops.map((n) => MindMap.cloneSubtree(n));
  const text = outlineText(tops);
  await ipcRenderer.invoke('clip:write', text);
  clip = { text, trees };
  setStatus(`${countNodes(trees)} tópico(s) copiado(s)`);
  return true;
}
async function pasteSelection() {
  commitNotes();
  const text = await ipcRenderer.invoke('clip:read');
  if (!text.trim()) { setStatus('A área de transferência está vazia.'); return; }
  const parent = selectedId || map.root.id;
  const fromInternal = clip && clip.text === text;
  const trees = fromInternal ? clip.trees.map((t) => MindMap.cloneSubtree(t, { keepStudy: false })) : textToNodes(text);
  const total = countNodes(trees);
  if (!total) { setStatus('Nada para colar.'); return; }
  if (total > MAX_PASTE_NODES) { setStatus(`Texto grande demais para colar (${total} tópicos; limite ${MAX_PASTE_NODES}).`); return; }
  let added = [];
  change(() => map.batch(() => { added = trees.map((t) => map.addSubtree(parent, t)); return true; }));
  selIds = new Set(added.map((n) => n.id)); selectedId = added[0].id; render(); reveal(added[0].id);
  setStatus(`${total} tópico(s) colado(s)${fromInternal ? '' : ' a partir do texto'}`);
}

// ---------- teclado ----------
window.addEventListener('keydown', (e) => {
  if (present) {
    e.preventDefault();
    if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter'].includes(e.key)) presentStep(1);
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) presentStep(-1);
    else if (e.key === 'Escape' || e.key === 'F5') stopPresent();
    return;
  }
  if (dashOpen || graphOpen) return; // com um painel em tela cheia aberto, os atalhos do mapa ficam desligados (Esc fecha: study-ui.js)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); $('#search').focus(); return; }
  if (e.key === 'F5') { e.preventDefault(); return startPresent(); }
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || !editor.hidden) return;
  if (e.target.tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) return; // deixa o botão focado agir
  if (e.key === 'Escape') {
    if (relateFrom) cancelRelate();
    if (selIds.size > 1) selIds = new Set([selectedId]); else selectedRel = null;
    render(); return;
  }
  // Ctrl+A/C/X/V/E não são tratados aqui: são aceleradores do menu nativo (consumidos antes da página)
  // e chegam pelo canal 'menu' — ver editCommand() abaixo.
  if (e.altKey && !e.ctrlKey && !e.metaKey) { // Alt+setas: reordenar / mudar de nível · Alt+1…5: abas do painel lateral
    const ops = { ArrowUp: 'moveUp', ArrowDown: 'moveDown', ArrowLeft: 'outdent', ArrowRight: 'indent' };
    const tabs = { 1: 'props', 2: 'study', 3: 'notes', 4: 'links', 5: 'outline' };
    if (ops[e.key]) { e.preventDefault(); return act[ops[e.key]](); }
    if (tabs[e.key]) { e.preventDefault(); return showPanel(tabs[e.key]); }
  }
  if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); return act.relate(); }
  const s = sel();
  const nav = (fn) => { e.preventDefault(); const t = fn(); if (t) { selectedId = t.id; render(); reveal(t.id); } };
  switch (e.key) {
    case 'Tab': e.preventDefault(); act.child(); break;
    case 'Enter': e.preventDefault(); act.sibling(); break;
    case 'F2': startEdit(); break;
    case 'Delete': case 'Backspace': act.delete(); break;
    case ' ': e.preventDefault(); act.toggle(); break;
    case 'ArrowRight': nav(() => s && (L.boxes.get(s.node.id).side > 0 || !s.parent ? s.node.children[0] : s.parent)); break;
    case 'ArrowLeft': nav(() => s && (L.boxes.get(s.node.id).side < 0 || !s.parent ? s.node.children[0] : s.parent)); break;
    case 'ArrowDown': nav(() => { if (!s || !s.parent) return null; const i = s.parent.children.indexOf(s.node); return s.parent.children[i + 1]; }); break;
    case 'ArrowUp': nav(() => { if (!s || !s.parent) return null; const i = s.parent.children.indexOf(s.node); return s.parent.children[i - 1]; }); break;
  }
});

/** Recortar/copiar/colar/selecionar tudo: em campo de texto agem no texto; fora dele, nos tópicos do mapa. */
async function editCommand(c) {
  const ae = document.activeElement;
  if (ae && ['TEXTAREA', 'INPUT'].includes(ae.tagName)) { document.execCommand(c === 'paste' ? 'paste' : c); return; }
  if (present || !editor.hidden) return;
  if (c === 'selectAll') { selIds = new Set(L.boxes.keys()); selectedId = selectedId || map.root.id; render(); setStatus(`${selIds.size} tópicos selecionados`); }
  else if (c === 'copy') await copySelection();
  else if (c === 'cut') { if (await copySelection()) act.delete(); }
  else if (c === 'paste') await pasteSelection();
}

ipcRenderer.on('menu', async (_e, c) => {
  const field = ['TEXTAREA', 'INPUT'].includes(document.activeElement && document.activeElement.tagName);
  if (['copy', 'cut', 'paste', 'selectAll'].includes(c)) return editCommand(c);
  if ((c === 'undo' || c === 'redo') && field) return document.execCommand(c); // desfazer texto digitado
  if (c === 'new') { if (await confirmDiscard()) newMap(); }
  else if (c === 'open') { if (await confirmDiscard()) { const p = await ipcRenderer.invoke('dialog:open'); if (p) await openPath(p); } }
  else if (c === 'save-and-close') { if (typeof timer !== 'undefined' && timer) stopTimer(); if (await save(false)) ipcRenderer.send('close-now'); }   // o tempo do cronômetro entra no arquivo salvo
  else if (c === 'restore') restoreVersion();
  else if (c === 'save') save(false);
  else if (c === 'saveAs') save(true);
  else if (c.startsWith('export:')) doExport(c.slice(7));
  else if (c === 'present') act.present();
  else act[c]?.();
});
ipcRenderer.on('open-path', async (_e, p) => { await ready; if (await confirmDiscard()) openPath(p); });
window.addEventListener('resize', () => map && render());
// erros inesperados nunca devem passar em silêncio
const logOnly = (m) => { try { if (userDataDir) logError(path.join(userDataDir, 'logs'), m); } catch { /* o registro nunca pode causar outro erro */ } };
const report = (m) => {
  setStatus('Erro: ' + m); console.error(m);
  try { if (userDataDir) logError(path.join(userDataDir, 'logs'), m); } catch { /* o registro nunca pode causar outro erro */ }
};
window.addEventListener('error', (e) => report(e.message));
window.addEventListener('unhandledrejection', (e) => report(e.reason && e.reason.message || e.reason));

// ---------- autosave e recuperação de sessão ----------
// Enquanto há alterações não salvas, um rascunho atômico (tmp + rename) é gravado em userData/drafts/session.json
// ~1,5 s após a última alteração. Ele some ao salvar/descartar; se o app cair, é oferecido na próxima abertura.
let userDataDir = null, draftRev = -1, draftTimer = null, draftExists = false;

// ---------- configuração por usuário (config.json em userData) ----------
const cfgPath = () => (userDataDir ? path.join(userDataDir, 'config.json') : null);
function loadCfg() { try { return JSON.parse(fs.readFileSync(cfgPath(), 'utf8')) || {}; } catch { return {}; } }
function saveCfg(patch) {
  const p = cfgPath(); if (!p) return;
  try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify({ ...loadCfg(), ...patch })); } catch (e) { report('Não foi possível salvar a configuração: ' + e.message); }
}
/** Pasta do vault: a escolhida pelo usuário, ou a pasta do arquivo aberto (somente leitura, limitada). */
const vaultDirEff = () => { const c = loadCfg(); return c.vaultDir || (filePath ? path.dirname(filePath) : null); };
/** Arquivo mais recente da lista de recentes que ainda existe. */
function lastRecent() {
  try {
    const list = JSON.parse(fs.readFileSync(path.join(userDataDir, 'recent.json'), 'utf8'));
    return (Array.isArray(list) ? list : []).find((p) => typeof p === 'string' && /\.mom$/i.test(p) && fs.existsSync(p)) || null;
  } catch { return null; }
}

/** Versões anteriores (backups automáticos) do arquivo aberto: o escolhido abre como mapa NOVO (o original não é tocado). */
async function restoreVersion() {
  if (!filePath) return setStatus('Salve o mapa primeiro: as versões anteriores são guardadas por arquivo.');
  const dir = backupDirFor(path.join(userDataDir, 'backups'), filePath);
  if (!listBackups(dir).length) return setStatus('Ainda não há versões anteriores deste arquivo (o backup é feito ao salvar por cima de um arquivo existente).');
  if (!(await confirmDiscard())) return;
  const p = await ipcRenderer.invoke('dialog:open-at', dir);
  if (!p) return;
  try {
    adopt(readMom(fs.readFileSync(p)));
    setStatus('Versão anterior aberta como mapa novo — use "Salvar como…". O arquivo original não foi alterado.');
  } catch (e) { ipcRenderer.invoke('dialog:error', 'Não foi possível abrir a versão: ' + e.message); }
}
const draftPath = () => (userDataDir ? path.join(userDataDir, 'drafts', 'session.json') : null);
function writeDraft() {
  const p = draftPath(); if (!p) return;
  try {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    const tmp = p + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ v: 1, filePath, savedAt: Date.now(), map: map.toJSON() }));
    fs.renameSync(tmp, p);
    draftRev = rev; draftExists = true;
  } catch (e) { report('Autosave falhou: ' + e.message); }
}
function removeDraft() {
  clearTimeout(draftTimer); draftTimer = null;
  const p = draftPath();
  if (p && draftExists) { try { fs.rmSync(p, { force: true }); draftExists = false; } catch { /* será tentado de novo */ } }
}
function autosaveTick() {
  if (!userDataDir) return;
  if (!dirty) { if (draftExists || draftTimer) removeDraft(); return; }
  if (rev !== draftRev && !draftTimer) draftTimer = setTimeout(() => { draftTimer = null; if (dirty) writeDraft(); }, 1500);
}
async function recoverSession() {
  const p = draftPath();
  if (!p || !fs.existsSync(p)) return;
  draftExists = true;
  try {
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!d || !d.map || !d.map.root || typeof d.map.root.id !== 'string' || !Array.isArray(d.map.root.children)) throw new Error('rascunho inválido');
    const when = new Date(d.savedAt).toLocaleString('pt-BR');
    const c = await ipcRenderer.invoke('dialog:confirm', {
      message: 'Encontrei um trabalho não salvo da sessão anterior.',
      detail: `${d.filePath || 'Mapa sem arquivo'} — salvo automaticamente em ${when}.`, buttons: ['Restaurar', 'Descartar'],
    });
    if (c === 0) {
      map = MindMap.fromJSON(d.map);
      if (typeof resetStudyUI === 'function') resetStudyUI();
      filePath = d.filePath || null; dirty = true; rev++; selectedId = map.root.id; selIds = new Set(); selectedRel = null; hits = null;
      render(); fit(); setStatus('Sessão anterior restaurada — salve para não perder.');
    } else removeDraft();
  } catch (e) { // rascunho ilegível: guarda como .bad (para análise) em vez de apagar
    try { fs.renameSync(p, p + '.bad'); } catch { /* ignora */ }
    draftExists = false; setStatus('Rascunho corrompido ignorado (guardado como session.json.bad).');
  }
}

let today0 = nowStr();
setInterval(() => { if (nowStr() !== today0) { today0 = nowStr(); render(); } }, 30000); // virou o dia: atualiza selos de revisão
window.addEventListener('focus', () => { if (map && nowStr() !== today0) { today0 = nowStr(); render(); } });

async function init() {
  try { userDataDir = await ipcRenderer.invoke('app:path', 'userData'); } catch { userDataDir = null; }
  await recoverSession();
  if (dirty) return;                                    // um rascunho foi restaurado: não mexe
  await new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })));   // espera os demais scripts
  const cfg = loadCfg();
  if (cfg.reopenLast !== false) { const last = lastRecent(); if (last) await openPath(last, { silent: true }); }   // app de estudo diário: volta de onde parou
  if (cfg.dashOnStart && typeof act.dash === 'function') act.dash();
}
newMap();
const ready = init(); // aberturas por linha de comando esperam a restauração (ver 'open-path')
