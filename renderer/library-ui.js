'use strict';
/* Biblioteca de mapas (SQLite): salvar/abrir pela biblioteca, janela de gerenciamento (importar, pacotes, versões, lixeira),
   e mapas da biblioteca na rede de conhecimento. Carregado por último (usa os globais de renderer.js, study-ui.js e graph-ui.js).
   Regra de ouro: um mapa tem UMA casa — um arquivo .mom (filePath) OU a biblioteca (map.meta.libId). Nada é apagado sem lixeira,
   e nenhum arquivo .mom de origem é alterado por importar/mover para a biblioteca. */
const { openLibrary, canonical } = require(path.join(core, 'library'));

let _lib = null, _libErr = null;
const libPath = () => (userDataDir ? path.join(userDataDir, 'biblioteca.db') : null);
const libraryExists = () => { try { return !!libPath() && fs.existsSync(libPath()); } catch { return false; } };
/** Abre a biblioteca na primeira necessidade (e só então cria o arquivo). Devolve null (com motivo em _libErr) se não puder. */
function getLibrary() {
  if (_lib) return _lib;
  if (!userDataDir) { _libErr = 'a pasta de dados do aplicativo não está disponível'; return null; }
  try { _lib = openLibrary(libPath(), { check: true }); _libErr = null; }
  catch (e) { _libErr = e.message; logOnly('Biblioteca indisponível: ' + e.message); setStatus('Biblioteca indisponível: ' + e.message); }
  return _lib;
}
function closeLibrary() { try { if (_lib) _lib.close(); } catch { /* já fechada */ } _lib = null; _libCache.clear(); }
window.addEventListener('beforeunload', closeLibrary);

const inLibrary = () => !!(map && map.meta.libId);
const libMapKey = (id) => 'lib:' + id;
const libIdOfKey = (k) => (typeof k === 'string' && k.startsWith('lib:') ? k.slice(4) : null);
const when = (iso) => { try { return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }); } catch { return iso; } };
const libFail = (m) => ipcRenderer.invoke('dialog:error', m);

// ---------- salvar / abrir ----------
/** Ctrl+S de um mapa da biblioteca: grava numa transação e RELÊ para conferir; se falhar, nada muda e o mapa continua aberto (e no rascunho). */
async function saveToLibrary() {
  commitNotes();
  const lib = getLibrary();
  if (!lib) { libFail('A biblioteca não está disponível: ' + _libErr + '\nSeu mapa continua aberto; use "Salvar como…" para guardar um arquivo .mom.'); return false; }
  try { map.meta.name = map.root.title; lib.saveMap(map, { verify: true }); }
  catch (e) { libFail('Falha ao salvar na biblioteca (suas alterações continuam abertas): ' + e.message); return false; }
  filePath = null; dirty = false; saveCfg({ lastKind: 'lib', lastLib: map.meta.libId }); render();
  return true;
}
/** "Salvar como…" de um mapa da biblioteca: exporta uma CÓPIA .mom; o mapa continua na biblioteca. */
async function exportCopyMom() {
  commitNotes();
  const target = await ipcRenderer.invoke('dialog:save', 'mom', (map.root.title || 'mapa') + '.mom'); if (!target) return false;
  try { writeMom(map, /\.mom$/i.test(target) ? target : target + '.mom'); } catch (e) { libFail('Falha ao exportar: ' + e.message); return false; }
  setStatus('Cópia .mom salva em ' + target + '. O mapa continua na biblioteca.');
  return true;
}
/** Copia o mapa aberto (arquivo ou novo) para a biblioteca, que passa a ser a casa dele. O arquivo de origem não é alterado. */
async function moveToLibrary() {
  if (!map) return false;
  if (inLibrary()) { setStatus('Este mapa já está na biblioteca.'); return false; }
  commitNotes();
  const lib = getLibrary();
  if (!lib) { libFail('A biblioteca não está disponível: ' + _libErr); return false; }
  const from = filePath;
  try { map.meta.name = map.root.title; lib.saveMap(map, { source: from ? path.resolve(from) : null, verify: true }); }
  catch (e) { libFail('Não consegui guardar na biblioteca (nada foi alterado): ' + e.message); return false; }
  filePath = null; dirty = false; saveCfg({ lastKind: 'lib', lastLib: map.meta.libId }); render();
  setStatus(from ? 'Mapa guardado na biblioteca. O arquivo original não foi alterado: ' + from : 'Mapa guardado na biblioteca.');
  return true;
}
async function openFromLibrary(id, { confirm = true, silent = false } = {}) {
  if (confirm && !(await confirmDiscard())) return false;
  const lib = getLibrary();
  if (!lib) { if (silent) setStatus('Biblioteca indisponível: ' + _libErr); else libFail('A biblioteca não está disponível: ' + _libErr); return false; }
  try {
    const m = lib.loadMap(id);
    if (typeof resetStudyUI === 'function') resetStudyUI();
    map = m; filePath = null; dirty = false; selectedId = map.root.id; selIds = new Set(); selectedRel = null; hits = null; rev++;
    if (typeof closeHome === 'function') closeHome();
    render(); fit(); saveCfg({ lastKind: 'lib', lastLib: id });
    return true;
  } catch (e) {
    logOnly('Não foi possível abrir da biblioteca: ' + e.message);
    if (silent) setStatus('Não reabri o último mapa: ' + e.message); else libFail('Não foi possível abrir da biblioteca: ' + e.message);
    return false;
  }
}

// ---------- janela da biblioteca ----------
function openLibraryModalClassic(tab = 'maps') {
  closeDash();
  const m = $('#modal'); m.textContent = ''; m.hidden = false;
  const bx = el('div', 'modal-box'); bx.id = 'libBox'; m.append(bx);
  m.onkeydown = (e) => { if (e.key === 'Escape') { e.stopPropagation(); closeModal(); } };
  const lib = getLibrary();
  const close = el('button', 'btn', 'Fechar'); close.id = 'libClose'; close.onclick = closeModal;
  if (!lib) {
    bx.append(el('h2', '', 'Biblioteca de mapas'), el('div', 'msg err', 'A biblioteca não está disponível: ' + _libErr), (() => { const f = el('div', 'foot'); f.append(el('span', 'grow'), close); return f; })());
    return;
  }
  const mkBtn = (id, label, cls) => { const b = el('button', 'btn' + (cls ? ' ' + cls : ''), label); b.id = id; return b; };
  const msg = el('div', 'msg'); msg.id = 'libMsg';
  const say = (t, kind) => { msg.textContent = t || ''; msg.className = 'msg' + (kind ? ' ' + kind : ''); };
  const list = el('div', 'lib-list'); list.id = 'libList';
  const sum = el('div', 'csv-prev'); sum.id = 'libReport'; sum.hidden = true;
  const showReport = (lines) => { sum.textContent = ''; const u = el('ul', 'csv-warn'); for (const t of lines.slice(0, 10)) u.append(el('li', '', t)); if (lines.length > 10) u.append(el('li', '', `… e mais ${lines.length - 10}`)); sum.append(u); sum.hidden = !lines.length; };

  const bAdd = mkBtn('libAddCur', inLibrary() ? 'Mapa atual já está na biblioteca' : 'Guardar o mapa atual aqui', 'primary'); bAdd.disabled = inLibrary();
  const bFile = mkBtn('libImpFile', 'Importar .mom…'), bDir = mkBtn('libImpDir', 'Importar pasta de .mom…'), bPack = mkBtn('libImpPack', 'Importar pacote…');
  const conflict = el('select'); conflict.id = 'libConflict'; conflict.title = 'O que fazer se o mapa do pacote já existir e for diferente';
  for (const [v, t] of [['copy', 'conflito: criar cópia'], ['replace', 'conflito: substituir (guarda versão)'], ['skip', 'conflito: manter o meu']]) { const o = el('option', '', t); o.value = v; conflict.append(o); }
  const bExp = mkBtn('libExpPack', 'Exportar pacote…'), bBk = mkBtn('libBackup', 'Backup do banco…');
  const row1 = el('div', 'btnrow'); row1.append(bAdd, bFile, bDir);
  const row2 = el('div', 'btnrow'); row2.append(bPack, conflict, bExp, bBk);
  const search = el('input'); search.type = 'search'; search.id = 'libSearch'; search.placeholder = 'Buscar em todos os mapas (títulos e notas)…';
  const tabs = el('div', 'btnrow'); const tMaps = mkBtn('libTabMaps', 'Mapas'), tTrash = mkBtn('libTabTrash', 'Lixeira'); tabs.append(tMaps, tTrash);
  const foot = el('div', 'foot'); foot.append(el('span', 'grow'), close);
  bx.append(el('h2', '', 'Biblioteca de mapas'), el('div', 'muted', 'Todos os seus mapas num só lugar (banco SQLite em ' + libPath() + '). Os arquivos .mom originais nunca são alterados.'), row1, row2, search, tabs, msg, sum, list, foot);

  let curTab = tab;
  const act1 = (label, id, data, fn) => { const b = el('button', 'btn small', label); b.dataset.act = id; b.dataset.id = data; b.onclick = fn; return b; };
  const openMap = async (id, topicId) => { if (await openFromLibrary(id)) { closeModal(); if (topicId && map.find(topicId)) goTo(topicId); } };
  function render_() {
    tMaps.classList.toggle('primary', curTab === 'maps'); tTrash.classList.toggle('primary', curTab === 'trash');
    list.textContent = '';
    const q = search.value.trim();
    if (q.length >= 2 && curTab === 'maps') {
      const hits = lib.searchTopics(q, 60);
      if (!hits.length) list.append(el('div', 'empty', 'Nada encontrado.'));
      for (const h of hits) {
        const r = el('div', 'lib-row hit'); r.dataset.id = h.mapId;
        const t = el('div', 'grow'); t.append(el('b', '', h.title), el('div', 'muted', `${h.mapTitle}${h.notes ? ' — ' + h.notes.replace(/\s+/g, ' ') : ''}`)); r.append(t, act1('Abrir', 'open', h.mapId, () => openMap(h.mapId, h.topicId)));
        list.append(r);
      }
      return;
    }
    const maps = lib.listMaps({ today: nowStr(), trashed: curTab === 'trash' });
    if (!maps.length) list.append(el('div', 'empty', curTab === 'trash' ? 'A lixeira está vazia.' : 'Nenhum mapa na biblioteca ainda. Use "Guardar o mapa atual aqui" ou importe seus .mom.'));
    for (const mp of maps) {
      const r = el('div', 'lib-row'); r.dataset.id = mp.id;
      const t = el('div', 'grow'); const cur = mp.id === map.meta.libId;
      t.append(el('b', '', mp.title + (cur ? '  (aberto)' : '')), el('div', 'muted', `${mp.topics} tópicos${mp.due ? ` · ${mp.due} revisão(ões) vencida(s)` : ''}${mp.exam_date ? ' · prova ' + fmtDate(mp.exam_date) : ''} · ${curTab === 'trash' ? 'excluído em ' + when(mp.deleted_at) : 'atualizado ' + when(mp.updated_at)}`));
      r.append(t);
      if (curTab === 'maps') {
        r.append(act1('Abrir', 'open', mp.id, () => openMap(mp.id)), act1('Versões', 'versions', mp.id, () => openVersionsModal(mp.id)),
          act1('Exportar .mom', 'export', mp.id, async () => {
            const target = await ipcRenderer.invoke('dialog:save', 'mom', mp.title + '.mom'); if (!target) return;
            try { lib.exportMom(mp.id, /\.mom$/i.test(target) ? target : target + '.mom'); say('Exportado para ' + target, 'ok'); } catch (e) { say('Não consegui exportar: ' + e.message, 'err'); }
          }),
          act1('Excluir', 'trash', mp.id, () => {
            if (cur) { say('Este mapa está aberto. Abra outro mapa antes de excluí-lo (ele iria para a lixeira e poderia ser recriado ao salvar).', 'err'); return; }
            lib.trashMap(mp.id); say(`"${mp.title}" foi para a lixeira (dá para restaurar).`, 'ok'); render_();
          }));
      } else {
        r.append(act1('Restaurar', 'restore', mp.id, () => { lib.restoreMap(mp.id); say(`"${mp.title}" foi restaurado.`, 'ok'); render_(); }),
          act1('Excluir de vez', 'purge', mp.id, async () => {
            if ((await ipcRenderer.invoke('dialog:confirm', { message: `Excluir "${mp.title}" definitivamente?`, detail: 'Isto apaga o mapa e todas as versões dele da biblioteca. Não dá para desfazer.', buttons: ['Excluir de vez', 'Cancelar'] })) !== 0) return;
            lib.purgeMap(mp.id); say('Excluído definitivamente.', 'ok'); render_();
          }));
      }
      list.append(r);
    }
  }
  tMaps.onclick = () => { curTab = 'maps'; render_(); }; tTrash.onclick = () => { curTab = 'trash'; search.value = ''; render_(); };
  search.oninput = () => render_();
  bAdd.onclick = async () => { if (await moveToLibrary()) { say('Mapa guardado na biblioteca. Se veio de um arquivo, o arquivo original não foi alterado.', 'ok'); render_(); bAdd.disabled = true; bAdd.textContent = 'Mapa atual já está na biblioteca'; } };
  const guard = async (fn) => { try { await fn(); } catch (e) { say('Erro: ' + e.message, 'err'); } };
  bFile.onclick = () => guard(async () => {
    const p = await ipcRenderer.invoke('dialog:open'); if (!p) return;
    if (!/\.mom$/i.test(p)) { say('Escolha um arquivo .mom (Markdown e OPML abrem pelo menu Abrir).', 'err'); return; }
    const r = lib.importMom(p); say(r.status === 'duplicado' ? 'Este arquivo já está na biblioteca.' : `Importado: ${r.topics} tópicos.`, r.status === 'duplicado' ? '' : 'ok'); render_();
  });
  bDir.onclick = () => guard(async () => {
    const d = await ipcRenderer.invoke('dialog:folder', 'Pasta com mapas .mom'); if (!d) return;
    const r = lib.importFolder(d);
    say(`${r.files} arquivo(s): ${r.imported} importado(s), ${r.duplicated} já estava(m) na biblioteca, ${r.failed} com erro. Os originais não foram alterados.`, r.failed ? 'err' : 'ok');
    showReport(r.items.filter((i) => i.status === 'erro').map((i) => `${path.basename(i.file)}: ${i.error}`)); render_();
  });
  bPack.onclick = () => guard(async () => {
    const p = await ipcRenderer.invoke('dialog:open-pack'); if (!p) return;
    const r = lib.importPackage(p, { onConflict: conflict.value });
    const nset = r.settings ? applyPortableSettings(r.settings) : 0;
    say(`Pacote com ${r.maps} mapa(s): ${r.imported} novo(s), ${r.copied} cópia(s), ${r.replaced} substituído(s), ${r.skipped} igual(is)/mantido(s).${nset ? ` Configurações restauradas (${nset}).` : ''}`, 'ok');
    showReport(r.items.map((i) => `${i.title} — ${i.status}`)); render_();
  });
  bExp.onclick = () => guard(async () => {
    const t = await ipcRenderer.invoke('dialog:save', 'mcpack', 'meus-estudos.mcpack'); if (!t) return;
    const r = lib.exportPackage(/\.mcpack$/i.test(t) ? t : t + '.mcpack', { settings: portableSettings() }); say(`Pacote salvo com ${r.maps} mapa(s) e as configurações. Leve esse arquivo para o outro computador e use "Importar pacote…".`, 'ok');
  });
  bBk.onclick = () => guard(async () => {
    const t = await ipcRenderer.invoke('dialog:save', 'db', 'biblioteca-backup.db'); if (!t) return;
    lib.backupTo(t); say('Cópia do banco salva em ' + t, 'ok');
  });
  render_();
}

function openVersionsModalClassic(id, { back = true } = {}) {
  const lib = getLibrary(); if (!lib) return;
  const m = $('#modal'); m.textContent = ''; m.hidden = false;
  const bx = el('div', 'modal-box'); bx.id = 'verBox'; m.append(bx);
  m.onkeydown = (e) => { if (e.key === 'Escape') { e.stopPropagation(); closeModal(); } };
  const info = lib.listMaps().find((x) => x.id === id);
  const msg = el('div', 'msg'); msg.id = 'verMsg'; const say = (t, k) => { msg.textContent = t || ''; msg.className = 'msg' + (k ? ' ' + k : ''); };
  const list = el('div', 'lib-list'); list.id = 'verList';
  const bNow = el('button', 'btn primary', 'Criar versão agora'); bNow.id = 'verNow';
  const bBack = el('button', 'btn', back ? 'Voltar à biblioteca' : 'Fechar'); bBack.id = 'verBack'; bBack.onclick = () => (back ? openLibraryModal() : closeModal());
  const foot = el('div', 'foot'); foot.append(el('span', 'grow'), bBack);
  bx.append(el('h2', '', 'Versões de "' + (info ? info.title : '?') + '"'), el('div', 'muted', 'Uma versão é guardada automaticamente ao salvar (no máximo a cada 10 minutos; até 30). Abrir uma versão cria um mapa NOVO: o atual nunca é sobrescrito.'), bNow, msg, list, foot);
  const draw = () => {
    list.textContent = '';
    const snaps = lib.listSnapshots(id);
    if (!snaps.length) list.append(el('div', 'empty', 'Ainda não há versões. Elas aparecem quando você salva por cima de um mapa existente.'));
    for (const s of snaps) {
      const r = el('div', 'lib-row'); r.dataset.id = String(s.id);
      const t = el('div', 'grow'); t.append(el('b', '', when(s.created_at)), el('div', 'muted', `${s.reason} · ${Math.max(1, Math.round(s.bytes / 1024))} KB`)); r.append(t);
      const b = el('button', 'btn small', 'Abrir como mapa novo'); b.dataset.act = 'restore-snap'; b.dataset.id = String(s.id);
      b.onclick = async () => {
        if (!(await confirmDiscard())) return;
        try { const nid = lib.restoreSnapshot(s.id); if (await openFromLibrary(nid, { confirm: false })) { closeModal(); setStatus('Versão aberta como mapa novo (na biblioteca). O mapa original não foi alterado.'); } }
        catch (e) { say('Não consegui abrir a versão: ' + e.message, 'err'); }
      };
      r.append(b); list.append(r);
    }
  };
  bNow.onclick = async () => {
    try {
      if (dirty && map.meta.libId === id && !(await saveToLibrary())) return;
      lib.snapshot(id, 'manual'); say('Versão criada.', 'ok'); draw();
    } catch (e) { say('Não consegui criar a versão: ' + e.message, 'err'); }
  };
  draw();
}

// ---------- rede de conhecimento: mapas da biblioteca ----------
const _libCache = new Map();    // id -> { rev, updated, map }  (evita reler o banco a cada atualização do painel)
/** Mapas da biblioteca para a rede (exceto o aberto e os que são cópia do arquivo aberto). */
function libraryNetworkMaps() {
  if (!libraryExists()) return [];
  const lib = getLibrary(); if (!lib) return [];
  const out = [], keep = new Set(), curFile = filePath ? path.resolve(filePath).toLowerCase() : null;
  for (const mp of lib.listMaps()) {
    if (mp.id === (map && map.meta.libId)) continue;
    if (curFile && mp.source_path && path.resolve(mp.source_path).toLowerCase() === curFile) continue;
    let c = _libCache.get(mp.id);
    if (!c || c.rev !== mp.rev || c.updated !== mp.updated_at) { try { c = { rev: mp.rev, updated: mp.updated_at, map: lib.loadMap(mp.id) }; _libCache.set(mp.id, c); } catch (e) { logOnly('Rede: mapa da biblioteca ilegível: ' + e.message); continue; } }
    keep.add(mp.id); out.push({ key: libMapKey(mp.id), name: mp.title, map: c.map, file: null, source: mp.source_path || null });
  }
  for (const k of [..._libCache.keys()]) if (!keep.has(k)) _libCache.delete(k);
  return out;
}
const libraryHasMaps = () => { if (!libraryExists()) return false; const lib = getLibrary(); return !!lib && lib.listMaps().length > 0; };

// ---------- ponte com a interface React (renderer/react → renderer/bundle/react-ui.js) ----------
// Despachantes: usam a versão React quando o pacote foi carregado; a clássica continua disponível (reactUi:false na configuração)
// como reserva e como referência de equivalência nos testes.
const useReactUi = () => !!window.MCReact && loadCfg().reactUi !== false;
function openLibraryModal(tab = 'maps') { if (useReactUi()) { closeDash(); return window.MCReact.openLibrary(tab); } return openLibraryModalClassic(tab); }
function openVersionsModal(id, opts = {}) { if (useReactUi()) return window.MCReact.openVersions(id, opts); return openVersionsModalClassic(id, opts); }
function openCsvModal() { if (useReactUi()) { closeDash(); return window.MCReact.openCsv(); } return openCsvModalClassic(); }
function openPlanModal() { if (useReactUi()) { closeDash(); return window.MCReact.openPlan(); } return openPlanModalClassic(); }
window.MC = {
  fs: { readFileSync: (p) => fs.readFileSync(p), writeFileSync: (p, d) => fs.writeFileSync(p, d, 'utf8') }, path: { basename: (p, e) => path.basename(p, e), extname: (p) => path.extname(p) },
  csv: { fromCsv, csvTemplate, aiPrompt }, planner, primary: () => primary(), applyCsvImport, applyPlanDiff,
  modalEl: () => $('#modal'), closeModal: () => closeModal(),
  lib: getLibrary, libError: () => _libErr, libPath, nowStr: () => nowStr(), fmtDate: (d) => fmtDate(d), when,
  ipc: (ch, ...a) => ipcRenderer.invoke(ch, ...a), basename: (p) => path.basename(p),
  map: () => map, currentLibId: () => (map && map.meta.libId) || null, inLibrary, isDirty: () => dirty,
  openFromLibrary, moveToLibrary, saveToLibrary, confirmDiscard: () => confirmDiscard(), goTo: (id) => goTo(id), setStatus: (t) => setStatus(t),
  openLibrary: (tab) => openLibraryModal(tab), openVersions: (id, o) => openVersionsModal(id, o),
};

act.lib = () => openLibraryModal();
act.libAdd = async () => { await moveToLibrary(); };
