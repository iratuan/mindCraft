'use strict';
const fs = require('fs');
const AdmZip = require('adm-zip');
const { MindMap, createNode, newId } = require('./model');
const { normalizeStudy, isDateStr, sanitizeGoals } = require('./study');
const { sanitizeStyle, THEMES } = require('./themes');
const { MARKERS } = require('./markers');
const { sanitizePdfs, sanitizeRefs } = require('./pdfrefs');

// Limites contra arquivos corrompidos ou maliciosos (o .mom é um ZIP vindo de fora).
const MAX_ENTRY_BYTES = 64 * 1024 * 1024;
const MAX_NODES = 200000;
const MAX_DEPTH = 500;
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;

// Remove apenas tags de formatação conhecidas; texto literal como "<C>" é preservado.
const stripTags = (s) => String(s ?? '')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/?(?:b|i|u|em|strong|span|div|p|font|a)\b[^>]*>/gi, '');

/** Lê um arquivo .mom (zip com document.json + nodes.json) e devolve um MindMap. Nunca confia no conteúdo. */
function readMom(source) {
  const zip = new AdmZip(source);
  const get = (name) => {
    const e = zip.getEntry(name);
    if (!e) return null;
    if (e.header.size > MAX_ENTRY_BYTES) throw new Error(`Arquivo .mom inválido: "${name}" é grande demais.`);
    return JSON.parse(e.getData().toString('utf8'));
  };
  const doc = get('document.json');
  const nodes = get('nodes.json');
  if (!doc || typeof doc !== 'object' || !Array.isArray(nodes)) throw new Error('Arquivo .mom inválido: faltam document.json/nodes.json');
  if (nodes.length > MAX_NODES) throw new Error('Arquivo .mom inválido: tópicos demais.');

  // ids vão parar em atributos HTML/SVG: só passam os "seguros"; os demais ganham id novo (mapeado em todas as referências)
  const idMap = new Map();
  const taken = new Set();
  const mapId = (old) => {
    if (idMap.has(old)) return idMap.get(old);
    let nid = typeof old === 'string' && SAFE_ID.test(old) && !taken.has(old) ? old : newId();
    taken.add(nid); idMap.set(old, nid);
    return nid;
  };

  // Arquivos gravados pelo MindCraft têm texto PURO nos títulos/notas: nada de limpar "tags" (senão "Tag <br> em HTML" seria alterado a cada abertura).
  // Só os arquivos do Mindomo (sem esta marca) trazem formatação em HTML, que é removida.
  const fromMindCraft = doc.mcWriter === 'mindcraft';
  const clean = fromMindCraft ? (s) => String(s ?? '') : stripTags;
  const byId = new Map();
  for (const n of nodes) {
    if (!n || typeof n !== 'object' || n.deleted || typeof n.id !== 'string') continue;
    if (byId.has(mapId(n.id)) ) continue;       // id duplicado: vale o primeiro
    const { id, parentId, previousId, title, index, mc, ...raw } = n;
    const nid = mapId(id);
    const m = mc && typeof mc === 'object' ? mc : {};
    byId.set(nid, {
      node: createNode(clean(title), {
        id: nid, notes: clean(n.notes?.text ?? (typeof n.notes === 'string' ? n.notes : '')),
        // extensões do MindCraft (campos próprios em "mc"), todas validadas
        markers: Array.isArray(m.markers) ? m.markers.filter((x) => typeof x === 'string' && MARKERS[x]) : [],
        progress: Number.isFinite(m.progress) ? Math.min(100, Math.max(0, m.progress)) : null,
        style: sanitizeStyle(m.style),
        collapsed: m.collapsed === true,
        ...(m.study ? { study: normalizeStudy(m.study) } : {}),
        ...(Array.isArray(m.refs) && sanitizeRefs(m.refs).length ? { refs: sanitizeRefs(m.refs) } : {}),
      }),
      parentId: typeof parentId === 'string' ? mapId(parentId) : null, index: Number.isFinite(index) ? index : 0, raw: { ...raw },
    });
  }

  // ordena irmãos por index e monta a árvore
  const kids = new Map();
  for (const [id, e] of byId) {
    if (!e.parentId || !byId.has(e.parentId)) continue;
    if (!kids.has(e.parentId)) kids.set(e.parentId, []);
    kids.get(e.parentId).push(e);
    e.id = id;
  }
  for (const [pid, list] of kids) {
    list.sort((a, b) => a.index - b.index);
    byId.get(pid).node.children = list.map((e) => e.node);
  }
  const rootId = typeof doc.mapInfo?.rootId === 'string' ? mapId(doc.mapInfo.rootId) : null;
  const rootEntry = byId.get(rootId) || [...byId.values()].find((e) => !e.parentId || !byId.has(e.parentId));
  if (!rootEntry) throw new Error('Mapa sem tópico raiz');

  // corta ciclos e profundidade absurda: percorre a partir da raiz, cada nó só pode aparecer uma vez
  const seen = new Set();
  const prune = (n, depth) => {
    seen.add(n.id);
    n.children = depth >= MAX_DEPTH ? [] : n.children.filter((c) => !seen.has(c.id));
    n.children.forEach((c) => prune(c, depth + 1));
  };
  prune(rootEntry.node, 0);
  for (const e of byId.values()) e.node._mom = e.raw;

  const theme = typeof doc.mcTheme === 'string' && THEMES[doc.mcTheme] ? doc.mcTheme : 'ocean';
  const map = new MindMap(rootEntry.node, { name: String(doc.mapInfo?.name || rootEntry.node.title), theme });
  map.meta._momDoc = doc; // preservado para round-trip
  if (doc.mcExam && isDateStr(doc.mcExam.date)) map.meta.exam = { name: String(doc.mcExam.name || '').slice(0, 120), date: doc.mcExam.date };
  if (sanitizeGoals(doc.mcGoals)) map.meta.goals = sanitizeGoals(doc.mcGoals);
  if (Array.isArray(doc.mcPdfs) && sanitizePdfs(doc.mcPdfs).length) map.meta.pdfs = sanitizePdfs(doc.mcPdfs);
  if (Array.isArray(doc.mcRelations)) {
    map.meta.relations = doc.mcRelations
      .filter((r) => r && typeof r.from === 'string' && typeof r.to === 'string' && seen.has(mapId(r.from)) && seen.has(mapId(r.to)) && mapId(r.from) !== mapId(r.to))
      .map((r) => ({ id: typeof r.id === 'string' && SAFE_ID.test(r.id) ? r.id : newId(), from: mapId(r.from), to: mapId(r.to), label: String(r.label ?? '').slice(0, 200),
        ...(typeof r.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(r.color) ? { color: r.color } : {}) }));
  }
  return map;
}

/** Grava um MindMap como .mom compatível (mantém campos desconhecidos lidos na importação). */
function writeMom(map, target) {
  const now = new Date().toISOString();
  const list = [];
  const visit = (node, parentId, previousId, index) => {
    const raw = node._mom || {};
    const hasStyle = node.style && Object.keys(node.style).length;
    const hasMc = (node.markers || []).length || node.progress != null || node.study || hasStyle || node.collapsed || (node.refs && node.refs.length);
    list.push({
      version: 40, ...raw, id: node.id, originalId: node.id,
      ...(parentId ? { parentId } : {}), ...(previousId ? { previousId } : {}),
      title: node.title, index, creationDate: raw.creationDate || now, modificationDate: now,
      style: raw.style || { valign: 32000, halign: 32000, orientation: parentId ? 0 : 101 },
      creatorId: raw.creatorId ?? 4,
      ...(node.notes ? { notes: { text: node.notes } } : {}),
      ...(hasMc ? { mc: {
        markers: node.markers || [], progress: node.progress,
        ...(hasStyle ? { style: node.style } : {}), ...(node.collapsed ? { collapsed: true } : {}),
        ...(node.study ? { study: node.study } : {}),
        ...(node.refs && node.refs.length ? { refs: node.refs } : {}),
      } } : {}),
    });
    let prev = null;
    node.children.forEach((c, i) => { visit(c, node.id, prev, i); prev = c.id; });
  };
  visit(map.root, null, null, 0);

  const doc = map.meta._momDoc || {
    version: 40,
    mapInfo: {
      id: newId(), name: map.meta.name || map.root.title, type: 0, mapType: 0,
      creationDate: now, rootId: map.root.id, themeId: '', style: {}, template: {},
      creator: { userId: 4, userName: 'Guest', firstName: 'Guest', lastName: '' },
    },
    mapUsers: { 4: { userId: 4, userName: 'Guest', firstName: 'Guest', lastName: '' } },
  };
  doc.mcWriter = 'mindcraft';                    // texto puro nos títulos/notas (ver readMom)
  doc.mcRelations = map.meta.relations || [];
  doc.mcTheme = map.meta.theme || 'ocean';
  if (map.meta.exam) doc.mcExam = map.meta.exam; else delete doc.mcExam;
  if (map.meta.pdfs && map.meta.pdfs.length) doc.mcPdfs = map.meta.pdfs; else delete doc.mcPdfs;
  if (map.meta.goals) doc.mcGoals = map.meta.goals; else delete doc.mcGoals;
  doc.mapInfo.name = map.meta.name || map.root.title;
  doc.mapInfo.rootId = map.root.id;
  doc.mapInfo.modificationDate = now;

  const zip = new AdmZip();
  zip.addFile('themes.json', Buffer.from('{}'));
  zip.addFile('document.json', Buffer.from(JSON.stringify(doc)));
  zip.addFile('nodes.json', Buffer.from(JSON.stringify(list)));
  zip.addFile('changes.json', Buffer.from('[]'));
  zip.addFile('Document.xml', Buffer.from('<mo:map xmlns:mo="http://schemas.mindomo.com/application/version-4.4"></mo:map>'));
  const buf = zip.toBuffer();
  if (target) {
    // grava num arquivo temporário e renomeia: uma falha no meio nunca deixa o arquivo original pela metade
    const tmp = target + '.tmp-' + process.pid;
    try { fs.writeFileSync(tmp, buf); fs.renameSync(tmp, target); }
    catch (e) { try { fs.rmSync(tmp, { force: true }); } catch { /* ignora */ } throw e; }
  }
  return buf;
}

module.exports = { readMom, writeMom };
