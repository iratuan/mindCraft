'use strict';
/* Ponte do painel de estudos para a interface React (renderer/react/Dashboard.jsx). Carregado depois de library-ui.js
   (que cria window.MC e useReactUi) e antes do pacote React. */
/** Despachante: usa a versão React quando disponível; a clássica continua como reserva (reactUi:false). */
function renderDash() {
  if (useReactUi()) return window.MCReact.renderDash();
  if (window.MCReact) window.MCReact.unmountDash();       // volta para a clássica: solta a raiz React antes de reescrever o #dash
  return renderDashClassic();
}
Object.assign(window.MC, {
  S, fmtMin, pctTxt, loadCfg, saveCfg,
  hasOtherSources: () => (typeof vaultDirEff === 'function' && !!vaultDirEff()) || libraryExists(),
  vaultDue: (today) => vaultDue(today), reportError: (m) => report(m), openTopic: (n) => openTopic(n),
  review: (id, today, ok) => runStudy((x) => map.mutateStudy(x, (st) => S.reviewed(st, { today, ok })), '', [id]),
  redoError: (id, i, today, ok) => runStudy((x) => map.mutateStudy(x, (st) => S.redoError(st, i, { today, ok })), '', [id]),
  portableSettings: () => portableSettings(), applyPortableSettings: (s) => applyPortableSettings(s),
  setExam: (exam) => { change(() => map.setExam(exam)); },
  setGoals: (goals) => { change(() => map.setGoals(goals)); },
  addSimulado: (sim, opts) => { let s; change(() => { s = map.addSimulado(sim, opts); return true; }); return s; },
  removeSimulado: (id) => { change(() => map.removeSimulado(id)); },
  simuladoStats: (list) => require(path.join(core, 'simulados')).simuladoStats(list),
  mdToHtml: (t) => require(path.join(core, 'markdown')).mdToHtml(t),
  actions: { openSimulado: () => act.simulado(), openReview: () => act.review(), exportIcs: () => exportIcs(), exportReport: (k) => exportReport(k), openImportModal: () => openImportModal(), openCsvModal: () => openCsvModal(), openPlanModal: () => openPlanModal(), openLibraryModal: () => openLibraryModal(), newStudyTemplate: () => newStudyTemplate(), closeDash: () => closeDash() },
});

/** Modelo de dados do painel Conexões (links, retrolinks, menções) — a apresentação é do React. */
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
    tip: info.noDir === undefined && activeScope() === 'map' && loadCfg().scope !== 'vault',
  };
}
function renderLinks() {
  if (!$('#linksBody')) return;
  if (useReactUi()) return window.MCReact.renderLinks(linksModel());
  if (window.MCReact) window.MCReact.unmountLinks();
  return renderLinksClassic();
}
Object.assign(window.MC, { createTopicFromLink: (t) => createTopicFromLink(t), linkifyMention: (node, m) => linkifyMention(node, m) });

// ---------- leitor de PDF ----------
const shortTitle = (s, n = 110) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');
/** Cria um tópico filho (mode 'topic') ou acrescenta ao tópico selecionado (mode 'note') com o trecho do PDF. Uma ação desfazível. */
function pdfCapture({ source, page, text, rects, mode }) {
  commitNotes();
  const sel = selectedId ? map.find(selectedId) : null, parentId = sel ? sel.node.id : map.root.id;
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
  if (!target) throw new Error('Profundidade máxima: ' + require(path.join(core, 'model')).MAX_DEPTH + ' níveis de subtópicos.');   // o lote foi revertido; o leitor mostra a mensagem
  selectedId = target; selIds = new Set([target]); selectedRel = null; render(); reveal(target);
  return { id: target, title };
}
Object.assign(window.MC, {
  rev: () => rev, pdfCapture, baseName: (p) => path.basename(p).replace(/\.pdf$/i, ''), logError: (m) => logOnly(m),
  relinkPdf: (id, p) => { change(() => map.relinkPdf(id, p)); },
  removeRef: (nodeId, i) => { change(() => map.removeRef(nodeId, i)); },
  pdfOpenRef: (ref) => { const p = (map.meta.pdfs || []).find((x) => x.id === ref.pdf); if (!p) { setStatus('Este PDF não está vinculado ao mapa.'); return; } window.MCReact.openPdf({ path: p.path, name: p.name, page: ref.page }); },
});
act.pdf = () => (window.MCReact ? window.MCReact.togglePdf() : setStatus('O leitor de PDF precisa da interface React (reactUi não pode ser false).'));

// divisor arrastável entre o leitor e o mapa
(() => {
  const split = $('#pdfsplit'), pane = $('#pdfpane'); if (!split) return;
  let drag = null;
  split.addEventListener('mousedown', (e) => { drag = { x: e.clientX, w: pane.getBoundingClientRect().width }; document.body.classList.add('pdf-dragging'); e.preventDefault(); });
  window.addEventListener('mousemove', (e) => {
    if (!drag) return;
    const max = Math.floor($('#work').getBoundingClientRect().width * 0.7);
    pane.style.width = Math.max(280, Math.min(max, drag.w + e.clientX - drag.x)) + 'px';
    window.dispatchEvent(new Event('resize'));
  });
  window.addEventListener('mouseup', () => { if (!drag) return; drag = null; document.body.classList.remove('pdf-dragging'); saveCfg({ pdfWidth: Math.round(pane.getBoundingClientRect().width) }); });
})();

act.review = () => { closeDash(); return window.MCReact ? window.MCReact.openReview() : setStatus('A revisão do dia precisa da interface React (reactUi não pode ser false).'); };
act.simulado = () => { closeDash(); if (typeof closeHome === 'function') closeHome(); return window.MCReact ? window.MCReact.openSimulado() : setStatus('O registro de simulados precisa da interface React.'); };
act.help = () => (window.MCReact ? window.MCReact.openShortcuts() : setStatus('A ajuda de atalhos precisa da interface React.'));

// ---------- tela inicial ----------
function closeHome() { if (window.MCReact) window.MCReact.closeHome(); }
act.home = (forceOpen) => {
  if (!window.MCReact) return setStatus('A tela inicial precisa da interface React.');
  if (window.MCReact.homeIsOpen() && forceOpen !== true) return closeHome();
  commitNotes(); closeDash(); if (typeof closeGraph === 'function') closeGraph(); if (!$('#modal').hidden) closeModal();
  return window.MCReact.openHome();
};
/** Dados da tela inicial: recentes, "continuar de onde parou", biblioteca, próximas provas e vencidas de hoje. */
function homeData() {
  const today = nowStr(), cfg = loadCfg();
  let rec = []; try { rec = JSON.parse(fs.readFileSync(path.join(userDataDir, 'recent.json'), 'utf8')); } catch { /* sem recentes */ }
  const recent = (Array.isArray(rec) ? rec : []).filter((p) => typeof p === 'string').slice(0, 10).map((p) => {
    let st = null; try { st = fs.statSync(p); } catch { /* sumiu */ }
    return { path: p, exists: !!st && st.isFile(), mtime: st ? st.mtimeMs : null, name: path.basename(p).replace(/\.[^.]+$/, ''), dir: path.dirname(p) };
  });
  const lib = libraryExists() ? getLibrary() : null, maps = lib ? lib.listMaps({ today }) : [];
  const dueMaps = maps.filter((m) => m.due > 0).sort((a, b) => b.due - a.due);
  const exams = maps.filter((m) => m.exam_date && m.exam_date >= today).sort((a, b) => a.exam_date.localeCompare(b.exam_date)).slice(0, 3)
    .map((m) => ({ id: m.id, title: m.title, name: m.exam_name, date: m.exam_date, days: S.diffDays(today, m.exam_date) }));
  let last = null;
  const lm = cfg.lastKind === 'lib' ? maps.find((m) => m.id === cfg.lastLib) : null;
  if (lm) last = { kind: 'lib', id: lm.id, title: lm.title, topics: lm.topics, due: lm.due, examDays: lm.exam_date ? S.diffDays(today, lm.exam_date) : null, progress: null };
  else {
    const f = recent.find((r) => r.exists && /\.mom$/i.test(r.path));
    if (f) {
      last = { kind: 'file', path: f.path, dir: f.dir, title: f.name, topics: null, due: null, examDays: null, progress: null };
      try { if (fs.statSync(f.path).size < 30 * 1024 * 1024) { const sm = S.summary(readMom(fs.readFileSync(f.path)), { today }); last.title = sm.title || f.name; last.topics = sm.totalLeaves; last.due = sm.due.length; last.progress = sm.totalLeaves ? sm.overall : null; last.examDays = sm.exam ? sm.exam.daysLeft : null; } } catch { /* resumo é opcional */ }
    }
  }
  let dueHere = 0; try { dueHere = map && map.root.children.length ? S.summary(map, { today }).due.length : 0; } catch { /* sem resumo */ }
  let openErrors = 0; try { openErrors = lib ? lib.openErrors(5000).length : 0; } catch { /* sem contagem */ }
  return { today, recent, last, exams, dueHere, library: { openErrors, total: maps.length, recent: maps.slice(0, 6), dueTotal: dueMaps.reduce((a, m) => a + m.due, 0), dueMaps } };
}
const homeGo = async (fn) => { if (!(await confirmDiscard())) return false; await fn(); return true; };
const homeActions = {
  newBlank: () => homeGo(() => newMap()),
  newTemplate: () => homeGo(() => newStudyTemplate()),
  openCsv: () => { closeHome(); return openCsvModal(); },
  openEdital: () => { closeHome(); return openImportModal(); },
  openLibrary: () => { closeHome(); return openLibraryModal(); },
  openPdf: () => { closeHome(); return window.MCReact.openPdf({}); },
  review: () => { closeHome(); return act.review(); },
  simulado: () => { closeHome(); return act.simulado(); },
  openFile: async () => { if (!(await confirmDiscard())) return false; const p = await ipcRenderer.invoke('dialog:open'); if (!p) return false; return openPath(p); },
  openRecent: async (r) => { if (!r.exists) { setStatus('Arquivo não encontrado: ' + r.path); return false; } if (!(await confirmDiscard())) return false; return openPath(r.path); },
  openLib: async (id, review = false) => { if (!(await confirmDiscard())) return false; const okk = await openFromLibrary(id, { confirm: false }); if (okk && review) act.review(); return okk; },
  openLast: async () => { const l = homeData().last; if (!l) return false; return l.kind === 'lib' ? homeActions.openLib(l.id) : homeActions.openRecent({ path: l.path, exists: true }); },
  removeRecent: (p) => ipcRenderer.invoke('recent:remove', p), clearRecent: () => ipcRenderer.invoke('recent:clear'),
};
Object.assign(window.MC, { homeData, homeActions });

// ---------- arrastar e soltar arquivos ----------
/** .mom/.md/.opml abrem como mapa (perguntando sobre alterações pendentes); .pdf abre no leitor; o resto avisa. Devolve true se abriu algo. */
async function handleDroppedPaths(paths) {
  const p = paths.find((x) => /\.(mom|md|opml|pdf)$/i.test(x));
  if (!p) { setStatus('Arraste um arquivo .mom, .md, .opml ou .pdf para abrir.'); return false; }
  if (/\.pdf$/i.test(p)) { closeHome(); window.MCReact.openPdf({ path: p, name: path.basename(p).replace(/\.pdf$/i, '') }); return true; }
  if (!(await confirmDiscard())) return false;
  return openPath(p);
}
document.addEventListener('dragover', (e) => { if (e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files')) e.preventDefault(); });
document.addEventListener('drop', (e) => {
  e.preventDefault();                                         // sem isto o Chromium navegaria a janela para o arquivo solto
  const { webUtils } = require('electron');
  const paths = [...((e.dataTransfer && e.dataTransfer.files) || [])].map((f) => { try { return webUtils.getPathForFile(f); } catch { return ''; } }).filter(Boolean);
  handleDroppedPaths(paths);
});
Object.assign(window.MC, { handleDroppedPaths });
