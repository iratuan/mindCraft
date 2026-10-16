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
  actions: { exportReport: (k) => exportReport(k), openImportModal: () => openImportModal(), openCsvModal: () => openCsvModal(), openPlanModal: () => openPlanModal(), openLibraryModal: () => openLibraryModal(), newStudyTemplate: () => newStudyTemplate(), closeDash: () => closeDash() },
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
