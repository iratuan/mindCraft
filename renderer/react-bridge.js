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
  change: (fn) => change(fn),
  selected: () => (primary() ? primary().node : null),
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
  actions: { openSimulado: () => act.simulado(), openReview: () => act.review(), exportIcs: () => exportIcs(), exportReport: (k) => exportReport(k), openImportModal: () => openImportModal(), openCsvModal: () => openCsvModal(), openPlanModal: () => openPlanModal(), openLibraryModal: () => openLibraryModal(), newStudyTemplate: () => newStudyTemplate(), closeDash: () => closeDash(), openDash: () => { if (!dashOpen) act.dash(); } },
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
    tip: info.noDir === undefined && activeScope() === 'map' && loadCfg().scope !== 'vault',
  };
}
function renderLinks() {
  if (!$('#linksBody')) return;
  if (useReactUi()) return window.MCReact.renderLinks(linksModel());
  if (window.MCReact) window.MCReact.unmountLinks();
  return renderLinksClassic();
}
Object.assign(window.MC, { copyText: (t) => ipcRenderer.invoke('clip:write', String(t)), createTopicFromLink: (t) => createTopicFromLink(t), linkifyMention: (node, m) => linkifyMention(node, m) });

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
  manual: require(path.join(core, 'manual')),
  rev: () => rev, pdfCapture, baseName: (p) => path.basename(p).replace(/\.pdf$/i, ''), logError: (m) => logOnly(m),
  relinkPdf: (id, p) => { change(() => map.relinkPdf(id, p)); },
  removeRef: (nodeId, i) => { change(() => map.removeRef(nodeId, i)); },
  pdfOpenRef: (ref) => { const p = (map.meta.pdfs || []).find((x) => x.id === ref.pdf); if (!p) { setStatus('Este PDF não está vinculado ao mapa.'); return; } window.MCReact.openPdf({ path: p.path, name: p.name, page: ref.page }); },
});
act.pdf = () => { if (!needMap()) return; return window.MCReact ? window.MCReact.togglePdf() : setStatus('O leitor de PDF precisa da interface React.'); };
act.video = () => { if (!needMap()) return; return window.MCReact ? window.MCReact.toggleVideo() : setStatus('O player de vídeo precisa da interface React.'); };
act.browser = () => { if (!needMap()) return; return window.MCReact ? window.MCReact.toggleBrowser() : setStatus('O navegador de estudo precisa da interface React.'); };

act.review = () => { closeDash(); return window.MCReact ? window.MCReact.openReview() : setStatus('A revisão do dia precisa da interface React (reactUi não pode ser false).'); };
act.simulado = () => { closeDash(); if (typeof closeHome === 'function') closeHome(); return window.MCReact ? window.MCReact.openSimulado() : setStatus('O registro de simulados precisa da interface React.'); };
act.help = () => (window.MCReact ? window.MCReact.openShortcuts() : setStatus('A ajuda de atalhos precisa da interface React.'));
/** Manual de uso (Ajuda → Manual de uso); `section` abre direto numa seção (ver core/manual.js). */
act.manual = (section) => (window.MCReact ? window.MCReact.openManual(typeof section === 'string' ? section : undefined) : setStatus('O manual precisa da interface React.'));
// qualquer botão com data-manual="<seção>" ("Como usar?") abre o manual naquela seção; vale para telas clássicas e React
document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('[data-manual]'); if (b) { e.preventDefault(); e.stopPropagation(); act.manual(b.dataset.manual); } }, true);

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
  const backup = { ...BACKUP.evaluate({ today, lastBackup: cfg.lastBackup, snoozeUntil: cfg.backupSnoozeUntil, everyDays: cfg.backupEveryDays, maps: maps.length }), maps: maps.length };
  backup.text = BACKUP.message(backup); backup.dest = backupDestName();
  let glance = null;
  try {
    const from = S.addDays(today, -6), summary = map && map.root.children.length ? S.summary(map, { today }) : null;
    glance = GLANCE.buildGlance({ today, summary, library: lib && maps.length ? { minutesByDay: lib.minutesByDay(from, today), questionsByDay: lib.questionsByDay(from, today), dueMaps } : null });
  } catch (e) { logOnly('resumo "Seu estudo": ' + e.message); }
  return { today, recent, last, exams, dueHere, backup, glance, library: { openErrors, total: maps.length, recent: maps.slice(0, 6), dueTotal: dueMaps.reduce((a, m) => a + m.due, 0), dueMaps } };
}
const BACKUP = require(path.join(core, 'backup-reminder')), GLANCE = require(path.join(core, 'glance'));
/** Registra que acabou de ser feita uma cópia de segurança (some o lembrete). Fica só neste aparelho (config.json), nunca no pacote. */
function markBackup() { saveCfg({ lastBackup: nowStr(), backupSnoozeUntil: null }); }
/** Exporta o pacote .mcpack (todos os mapas + configurações) perguntando nome e local. Devolve o resumo ou null (cancelou / sem biblioteca). */
/** Nome do arquivo lembrado como destino da cópia de segurança (só no tablet; no desktop sempre há o diálogo do sistema). */
function backupDestName() {
  try { const t = JSON.parse(fs.readFileSync(path.join(userDataDir, 'targets.json'), 'utf8')).__backup__; return t && typeof t.name === 'string' ? t.name : null; } catch { return null; }
}
/**
 * Exporta o pacote .mcpack (todos os mapas + configurações). Com destino lembrado (tablet) grava DIRETO nele; se isso falhar, avisa, esquece o destino e
 * cai no diálogo (nada se perde: o pacote é gerado antes). `ask` força o diálogo (para trocar o local). Devolve { maps, direct?, name? } ou null.
 */
async function exportPackQuick({ ask = false } = {}) {
  if (!libraryExists()) { setStatus('Ainda não há biblioteca: guarde seus mapas nela (Arquivo → Biblioteca de mapas) para exportar um pacote.'); return null; }
  if (!ask && backupDestName()) {
    const tmp = '/tmp/mindcraft-copia-' + Date.now() + '.mcpack';
    try {
      fs.mkdirSync(path.dirname(tmp), { recursive: true });
      const r = getLibrary().exportPackage(tmp, { settings: portableSettings() });
      const w = await ipcRenderer.invoke('backup:write-direct', tmp);
      markBackup(); return { ...r, direct: true, name: w.name };
    } catch (e) {
      ipcRenderer.invoke('dialog:error', 'Não consegui gravar a cópia em "' + backupDestName() + '": ' + e.message + '\nEscolha outro local agora; o aviso de cópia continua até você concluir.');
      await ipcRenderer.invoke('backup:clear');
    } finally { try { fs.rmSync(tmp, { force: true }); } catch { /* temporário */ } }
  }
  const t = await ipcRenderer.invoke('dialog:save', 'mcpack', 'meus-estudos.mcpack'); if (!t) return null;
  const r = getLibrary().exportPackage(/\.mcpack$/i.test(t) ? t : t + '.mcpack', { settings: portableSettings() });
  markBackup(); return r;
}
/** Restaura de um pacote .mcpack: NUNCA sobrescreve (conflito vira cópia). Devolve o resultado ou null (cancelou). */
async function importPackQuick() {
  const p = await ipcRenderer.invoke('dialog:open-pack'); if (!p) return null;
  const r = getLibrary().importPackage(p, { onConflict: 'copy' });
  return { ...r, nset: r.settings ? applyPortableSettings(r.settings) : 0 };
}
const homeGo = async (fn) => { if (!(await confirmDiscard())) return false; await fn(); return true; };
const homeActions = {
  newBlank: () => homeGo(() => newMap()),
  newTemplate: () => homeGo(() => newStudyTemplate()),
  openCsv: () => { closeHome(); return openCsvModal(); },
  openEdital: () => { closeHome(); return openImportModal(); },
  openLibrary: () => { closeHome(); return openLibraryModal(); },
  openPdf: () => { if (!map) newMap(); closeHome(); return window.MCReact.openPdf({}); },   // o leitor trabalha com o mapa: ele é criado antes, só agora
  review: () => { closeHome(); return act.review(); },
  simulado: () => { closeHome(); return act.simulado(); },
  openFile: async () => { if (!(await confirmDiscard())) return false; const p = await ipcRenderer.invoke('dialog:open'); if (!p) return false; return openPath(p); },
  openRecent: async (r) => { if (!r.exists) { setStatus('Arquivo não encontrado: ' + r.path); return false; } if (!(await confirmDiscard())) return false; return openPath(r.path); },
  openLib: async (id, review = false) => { if (!(await confirmDiscard())) return false; const okk = await openFromLibrary(id, { confirm: false }); if (okk && review) act.review(); return okk; },
  openLast: async () => { const l = homeData().last; if (!l) return false; return l.kind === 'lib' ? homeActions.openLib(l.id) : homeActions.openRecent({ path: l.path, exists: true }); },
  removeRecent: (p) => ipcRenderer.invoke('recent:remove', p), clearRecent: () => ipcRenderer.invoke('recent:clear'),
  backupNow: async (opts) => { const r = await exportPackQuick(opts); if (r) setStatus(r.direct ? `Cópia de segurança atualizada em "${r.name}": ${r.maps} mapa(s) e as configurações.` : `Cópia de segurança salva: ${r.maps} mapa(s) e as configurações. Guarde o arquivo fora deste aparelho (nuvem, pendrive ou outro computador).`); return !!r; },
  backupDest: () => backupDestName(),
  restorePack: async () => {
    const r = await importPackQuick(); if (!r) return false;
    setStatus(`Pacote restaurado: ${r.imported} novo(s), ${r.copied} cópia(s), ${r.skipped} igual(is)/mantido(s)${r.nset ? `; ${r.nset} configuração(ões)` : ''}. Nada foi sobrescrito.`); return true;
  },
  backupSnooze: () => { saveCfg({ backupSnoozeUntil: BACKUP.snoozeDate(nowStr()) }); setStatus('Tudo bem: o lembrete volta em ' + BACKUP.SNOOZE_DAYS + ' dias.'); },
  backupEvery: (v) => { saveCfg({ backupEveryDays: BACKUP.normalizeEvery(v), backupSnoozeUntil: null }); },
};
Object.assign(window.MC, { homeData, homeActions, markBackup, exportPackQuick, importPackQuick, backupDestName });

// ---------- aviso diário de revisões ----------
const NOTIFY = require(path.join(core, 'notify'));
/** Revisões vencidas e erros para refazer: biblioteca inteira, ou só o mapa aberto se não há biblioteca. */
function noticeCounts(today) {
  if (libraryExists()) {
    const lib = getLibrary(), maps = lib.listMaps({ today }).filter((m) => m.due > 0);
    return { due: maps.reduce((a, m) => a + m.due, 0), dueMaps: maps.length, errors: lib.openErrors(5000).length };
  }
  if (map && map.root.children.length) { const s = S.summary(map, { today }); return { due: s.due.length, dueMaps: 1, errors: s.errors.open }; }
  return { due: 0, dueMaps: 0, errors: 0 };
}
/** Confere se é hora de avisar (a cada minuto). `force` = botão "Testar aviso": mostra já, sem marcar o dia. */
async function notifyTick(force = false) {
  try {
    const cfg = loadCfg(), today = nowStr(), d = new Date(), hm = window.__nowHM || String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    if (!force && !NOTIFY.shouldNotify({ enabled: cfg.notifyDaily === true, at: cfg.notifyAt || '08:00', notifiedOn: cfg.notifiedOn, today, hm })) return false;
    const notice = NOTIFY.buildNotice(noticeCounts(today)) || (force ? { title: 'MindCraft — aviso de teste', body: 'Nada vencido agora. ✔ Os avisos aparecerão assim.' } : null);
    if (!notice) return false;
    const shown = await ipcRenderer.invoke('notify:show', notice);
    if (!force) saveCfg({ notifiedOn: today });                // no máximo uma vez por dia (mesmo se o sistema não mostrar)
    return shown;
  } catch (e) { logOnly('aviso diário: ' + e.message); return false; }
}
Object.assign(window.MC, { notifyTest: () => notifyTick(true) }); window.__notifyTick = notifyTick;
setTimeout(notifyTick, 5000); setInterval(notifyTick, 60000);

// ---------- arrastar e soltar arquivos ----------
/** .mom/.md/.opml abrem como mapa (perguntando sobre alterações pendentes); .pdf abre no leitor; o resto avisa. Devolve true se abriu algo. */
async function handleDroppedPaths(paths) {
  const p = paths.find((x) => /\.(mom|md|opml|pdf)$/i.test(x));
  if (!p) { setStatus('Arraste um arquivo .mom, .md, .opml ou .pdf para abrir.'); return false; }
  if (/\.pdf$/i.test(p)) { if (!map) newMap(); closeHome(); window.MCReact.openPdf({ path: p, name: path.basename(p).replace(/\.pdf$/i, '') }); return true; }
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
