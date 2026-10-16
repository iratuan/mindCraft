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
  setExam: (exam) => { change(() => map.setExam(exam)); },
  mdToHtml: (t) => require(path.join(core, 'markdown')).mdToHtml(t),
  actions: { openReview: () => act.review(), exportIcs: () => exportIcs(), exportReport: (k) => exportReport(k), openImportModal: () => openImportModal(), openCsvModal: () => openCsvModal(), openPlanModal: () => openPlanModal(), openLibraryModal: () => openLibraryModal(), newStudyTemplate: () => newStudyTemplate(), closeDash: () => closeDash() },
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
act.help = () => (window.MCReact ? window.MCReact.openShortcuts() : setStatus('A ajuda de atalhos precisa da interface React.'));
