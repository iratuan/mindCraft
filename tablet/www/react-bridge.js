'use strict';
/* Ponte entre o app (scripts clássicos) e a interface React (renderer/react). Carregado depois de graph-ui.js e antes do pacote React.
   Expõe window.MC, que as telas React usam para ler e alterar o mapa sem conhecer o estado global. */
/** Tópico selecionado com o seu pai ({ node, parent }) ou null. */
const primary = () => (map && selectedId ? map.find(selectedId) : null);
function closeModal() { const m = $('#modal'); m.hidden = true; m.textContent = ''; }

window.MC = window.MC || {};
Object.assign(window.MC, {
  modalEl: () => $('#modal'), closeModal,
  loadCfg, saveCfg,
  change: (fn) => change(fn),
  selected: () => (primary() ? primary().node : null),
  reportError: (m) => report(m), logError: (m) => logOnly(m),
  rev: () => rev,
  copyText: (t) => ipcRenderer.invoke('clip:write', String(t)),
  createTopicFromLink: (t) => createTopicFromLink(t),
  linkifyMention: (node, m) => linkifyMention(node, m),
  mdToHtml: (t) => require(path.join(core, 'formats', 'markdown')).mdToHtml(t),
});

/** Modelo de dados do painel Conexões (links, retrolinks, menções). */
function linksModel() {
  const sel = primary();
  if (!sel) return { empty: true };
  const info = gatherMaps(activeScope()), g = buildGraph(info.maps);
  const me = g.idOf(curKey(), sel.node.id);
  const out = mergeEdges(g.outgoing(me), (e) => e.to), inn = mergeEdges(g.incoming(me), (e) => e.from);
  const here = (n) => (n.mapKey === curKey() ? '' : n.mapName);
  const row = (n, meta, extra = {}) => ({ n, title: n.title, ghost: n.kind === 'ghost', dot: n.kind === 'ghost' ? null : mapColor(n.mapKey), meta, ...extra });
  return {
    selNode: sel.node,
    out: out.map(({ e, rel, label }) => { const n = g.byId.get(e.to); return row(n, n.kind === 'ghost' ? 'não existe' : here(n), { rel, label, canCreate: n.kind === 'ghost' && !/#/.test(n.title) }); }),
    inn: inn.map(({ e, rel, label }) => { const n = g.byId.get(e.from); return row(n, here(n), { rel, label }); }),
    men: unlinkedMentions(info.maps, curKey(), sel.node).map((m) => row({ ...m, kind: 'topic' }, m.mapKey === curKey() ? '' : m.mapName, { m })),
    tip: info.noDir === undefined && activeScope() === 'map',
  };
}
function renderLinks() {
  if (!$('#linksBody') || !window.MCReact) return;
  window.MCReact.renderLinks(linksModel());
}

// ---------- leitor de PDF ----------
const shortTitle = (s, n = 110) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');
/** Cria um tópico filho (mode 'topic') ou acrescenta ao tópico selecionado (mode 'note') com o trecho do PDF. Uma ação desfazível. */
function pdfCapture({ source, page, text, rects, mode }) {
  commitNotes();
  // o trecho só vira tópico ou nota de um tópico escolhido no mapa: sem seleção, nada é criado
  if (!selectedId || !map.find(selectedId)) throw new Error('Selecione um tópico no mapa (ao lado) antes de criar algo a partir do trecho.');
  const sel = map.find(selectedId), parentId = sel.node.id;
  let target = null, title = '';
  change(() => map.batch(() => {
    const pdf = map.addPdf({ path: source.path, name: source.name });
    const ref = { pdf: pdf.id, page, quote: text, rects };
    if (mode === 'topic') {
      title = shortTitle(text);
      const n = map.addChild(parentId, title);
      map.update(n.id, { notes: (title === text ? '' : '> ' + text + '\n\n') + '— ' + pdf.name + ', p. ' + page });
      map.addRef(n.id, ref); target = n.id;
    } else {
      const cur = map.find(parentId).node; title = cur.title;
      const add = '> ' + text + '\n> — ' + pdf.name + ', p. ' + page;
      map.update(parentId, { notes: cur.notes ? cur.notes.replace(/\s+$/, '') + '\n\n' + add : add });
      map.addRef(parentId, ref); target = parentId;
    }
    return true;
  }));
  if (!target) throw new Error('Profundidade máxima: ' + require(path.join(core, 'components', 'model')).MAX_DEPTH + ' níveis de subtópicos.');   // o lote foi revertido; o leitor mostra a mensagem
  selectedId = target; selIds = new Set([target]); selectedRel = null; render(); reveal(target);
  return { id: target, title };
}
Object.assign(window.MC, {
  pdfCapture, baseName: (p) => path.basename(p).replace(/\.pdf$/i, ''),
  relinkPdf: (id, p) => { change(() => map.relinkPdf(id, p)); },
  removeRef: (nodeId, i) => { change(() => map.removeRef(nodeId, i)); },
  pdfOpenRef: (ref) => { const p = (map.meta.pdfs || []).find((x) => x.id === ref.pdf); if (!p) { setStatus('Este PDF não está vinculado ao mapa.'); return; } window.MCReact.openPdf({ path: p.path, name: p.name, page: ref.page }); },
});
act.pdf = () => { if (!needMap()) return; return window.MCReact ? window.MCReact.togglePdf() : setStatus('O leitor de PDF precisa da interface React.'); };
act.help = () => (window.MCReact ? window.MCReact.openShortcuts() : setStatus('A ajuda de atalhos precisa da interface React.'));

// ---------- painel de mapas (dashboard) ----------
function openDash() {
  commitNotes(); closeHome(); if (typeof closeGraph === 'function') closeGraph();
  $('#dash').hidden = false; document.querySelector('[data-act="dash"]')?.classList.add('on');
  window.MCReact.renderDash();
}
function closeDash() {
  if (window.MCReact) window.MCReact.unmountDash();
  $('#dash').hidden = true; document.querySelector('[data-act="dash"]')?.classList.remove('on');
}
act.dash = () => { if (!$('#dash').hidden) return closeDash(); if (!needMap()) return; return openDash(); };
Object.assign(window.MC, { openDash, closeDash });

/** Números de um mapa para o painel: tópicos, níveis, ligações ([[ ]] nas notas + setas), notas e PDFs. */
function mapStats(m) {
  let topics = 0, depth = 0, notesCount = 0, links = 0;
  m.walk((n, lvl) => {
    topics++;                               // a raiz também é um tópico
    if (lvl > depth) depth = lvl;
    if (n.notes) { notesCount++; links += (n.notes.match(/\[\[[^\]]+\]\]/g) || []).length; }
  });
  links += (m.meta.relations || []).length;
  return { topics, depth, links, notes: notesCount, withoutNotes: topics - notesCount, pdfs: (m.meta.pdfs || []).length };
}
const ago = (ms) => {
  if (!ms) return '';
  const d = Math.floor((Date.now() - ms) / 86400000);
  return d <= 0 ? 'hoje' : d === 1 ? 'ontem' : d < 30 ? `há ${d} dias` : new Date(ms).toLocaleDateString('pt-BR');
};
/** Dados do painel: o mapa aberto e os recentes (lidos do disco; arquivos muito grandes ficam de fora). */
function dashData() {
  const current = map ? { ...mapStats(map), name: map.meta.name || map.root.title, dirty, saved: filePath ? path.basename(filePath) : 'ainda não salvo' } : null;
  const maps = recentList().slice(0, 30).map((r) => {
    if (!r.exists) return { ...r, topics: null, depth: null, links: null, pdfs: null, when: '' };
    if (fs.statSync(r.path).size > 20 * 1024 * 1024) return { ...r, topics: null, depth: null, links: null, pdfs: null, when: 'arquivo grande' };
    try {
      const m = readMom(fs.readFileSync(r.path));
      return { ...r, ...mapStats(m), when: ago(r.mtime) };
    } catch (e) { return { ...r, topics: null, depth: null, links: null, pdfs: null, when: 'ilegível' }; }
  });
  const ok = maps.filter((m) => m.topics != null);
  const totals = { maps: maps.filter((m) => m.exists).length, topics: ok.reduce((a, m) => a + m.topics, 0), links: ok.reduce((a, m) => a + m.links, 0), pdfs: ok.reduce((a, m) => a + m.pdfs, 0) };
  return { current, maps, totals };
}
Object.assign(window.MC, { dashData });

// ---------- tela inicial ----------
function closeHome() { if (window.MCReact) window.MCReact.closeHome(); }
act.home = (forceOpen) => {
  if (!window.MCReact) return setStatus('A tela inicial precisa da interface React.');
  if (window.MCReact.homeIsOpen() && forceOpen !== true) return closeHome();
  commitNotes(); closeDash(); if (typeof closeGraph === 'function') closeGraph(); closeModal();
  return window.MCReact.openHome();
};
/** Mapas recentes que o próprio app registrou (recent.json), com nome, pasta e data. */
function recentList() {
  let rec = []; try { rec = JSON.parse(fs.readFileSync(path.join(userDataDir, 'recent.json'), 'utf8')); } catch { /* sem recentes */ }
  return (Array.isArray(rec) ? rec : []).filter((p) => typeof p === 'string').slice(0, 10).map((p) => {
    let st = null; try { st = fs.statSync(p); } catch { /* sumiu */ }
    return { path: p, exists: !!st && st.isFile(), mtime: st ? st.mtimeMs : null, name: path.basename(p).replace(/\.[^.]+$/, ''), dir: path.dirname(p) };
  });
}
/** Dados da tela inicial: mapas recentes e o último que ainda existe ("continuar de onde parou"). */
function homeData() {
  const recent = recentList();
  return { recent, last: recent.find((r) => r.exists) || null };
}
const homeGo = async (fn) => { await fn(); return true; };
const homeActions = {
  newBlank: () => homeGo(() => newMap()),
  openFile: async () => { const p = await ipcRenderer.invoke('dialog:open'); if (!p) return false; return openPath(p); },
  openRecent: async (r) => { if (!r.exists) { setStatus('Arquivo não encontrado: ' + r.path); return false; } return openPath(r.path); },
  openPdf: () => { if (!map) newMap(); closeHome(); return window.MCReact.openPdf({}); },   // o leitor trabalha com o mapa: ele é criado antes, só agora
  removeRecent: (p) => ipcRenderer.invoke('recent:remove', p),
  clearRecent: () => ipcRenderer.invoke('recent:clear'),
};
Object.assign(window.MC, { homeData, homeActions });

// ---------- arrastar e soltar arquivos ----------
/** .mom abre como mapa (perguntando sobre alterações pendentes); .pdf abre no leitor. Devolve true se abriu algo. */
async function handleDroppedPaths(paths) {
  const p = paths.find((x) => /\.(mom|pdf)$/i.test(x));
  if (!p) { setStatus('Arraste um arquivo .mom ou .pdf para abrir.'); return false; }
  if (/\.pdf$/i.test(p)) { if (!map) newMap(); closeHome(); window.MCReact.openPdf({ path: p, name: path.basename(p).replace(/\.pdf$/i, '') }); return true; }
  return openPath(p);
}
document.addEventListener('dragover', (e) => { if (e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files')) e.preventDefault(); });
document.addEventListener('drop', (e) => {
  e.preventDefault();                                         // sem isto o Chromium navegaria a janela para o arquivo solto
  const { webUtils } = require('electron');
  const paths = [...((e.dataTransfer && e.dataTransfer.files) || [])].map((f) => { try { return webUtils.getPathForFile(f); } catch { return ''; } }).filter(Boolean);
  handleDroppedPaths(paths);
});
Object.assign(window.MC, {
  handleDroppedPaths, openTopic: (n) => openTopic(n),
  map: () => map || emptyMapStub(),                          // o leitor e o painel leem o mapa com segurança mesmo sem mapa aberto
  primary, goTo: (id) => goTo(id),
  fs: { readFileSync: (p) => fs.readFileSync(p) },
  ipc: (ch, ...a) => ipcRenderer.invoke(ch, ...a),
});

// ---------- navegação entre tópicos e mapas (rede e painel Conexões) ----------
/** Vai até um tópico, abrindo outro mapa (com confirmação de alterações pendentes) se preciso. */
async function openTopic(n) {
  if (!n || n.kind !== 'topic') return;
  if (n.mapKey === curKey()) { closeGraph(); goTo(n.topicId); return true; }
  if (!fs.existsSync(n.mapKey)) { setStatus('O arquivo do mapa não existe mais: ' + n.mapKey); return false; }
  closeGraph();
  await openPath(n.mapKey);   // abre (ou vai até) a aba do mapa
  if (map.find(n.topicId)) goTo(n.topicId); else setStatus('O tópico não foi encontrado no mapa aberto.');
  return true;
}
/** Seleciona um tópico e rola o mapa até ele (abre os ramos recolhidos no caminho; não conta como alteração). */
function goTo(id) {
  (function open(n) {
    if (n.id === id) return true;
    if (n.children.some(open)) { n.collapsed = false; return true; }
    return false;
  })(map.root);
  selectedId = id; selIds = new Set([id]); selectedRel = null;
  render(); centerOn(id);
}
function createTopicFromLink(title) {
  const parent = selectedId || map.root.id;
  const t = title.trim();
  if (!t || /#/.test(t)) return false;                       // "Mapa#Tópico" fantasma: o mapa de destino não existe
  change(() => map.addChild(parent, t));
  setStatus(`Tópico "${t}" criado: o link agora tem destino.`);
  return true;
}
