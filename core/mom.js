'use strict';
const fs = require('fs');
const AdmZip = require('adm-zip');
const { MindMap, createNode, newId } = require('./model');
const { sanitizeStyle, sanitizeTheme, THEMES } = require('./themes');
const { convertTheme, convertNodeStyle, htmlToMarkdown, markdownToHtml } = require('./mindomo');
const { MARKERS } = require('./markers');
const { sanitizePdfs, sanitizeRefs } = require('./pdfrefs');

// Limites contra arquivos corrompidos ou maliciosos (o .mom é um ZIP vindo de fora).
const MAX_ENTRY_BYTES = 64 * 1024 * 1024;
const MAX_NODES = 200000;
const MAX_DEPTH = 500;
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;
// Campos do bloco "mc" que o MindCraft entende. Qualquer outro campo (ex.: estudo de versões antigas, vídeos) é guardado
// como veio em _mcExtra e regravado igual: o app não mostra, mas nunca apaga.
const KNOWN_MC = new Set(['markers', 'progress', 'style', 'collapsed', 'refs', 'flow']);
// Fluxograma: tipo do passo e rótulo do ramo (ex.: "Sim") ficam no bloco mc.flow; mapas mentais não gravam nada disso
const FLOW_TYPES = ['start', 'step', 'decision', 'end'];

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
    const nid = typeof old === 'string' && SAFE_ID.test(old) && !taken.has(old) ? old : newId();
    taken.add(nid); idMap.set(old, nid);
    return nid;
  };

  // Arquivos gravados pelo MindCraft têm texto PURO nos títulos/notas: nada de limpar "tags" (senão "Tag <br> em HTML" seria alterado a cada abertura).
  // Só os arquivos do Mindomo (sem esta marca) trazem formatação em HTML, que é removida.
  const fromMindCraft = doc.mcWriter === 'mindcraft';
  const clean = fromMindCraft ? (s) => String(s ?? '') : stripTags;
  const byId = new Map();
  const dups = new Set();
  for (const n of nodes) {
    if (!n || typeof n !== 'object' || n.deleted || typeof n.id !== 'string') continue;
    if (byId.has(mapId(n.id))) { dups.add(n); continue; }   // id duplicado: vale o primeiro; a cópia extra volta ao arquivo como estava
    const { id, parentId, previousId, title, index, mc, ...raw } = n;
    const nid = mapId(id);
    const m = mc && typeof mc === 'object' ? mc : {};
    const mcExtra = Object.fromEntries(Object.entries(m).filter(([k]) => !KNOWN_MC.has(k)));
    byId.set(nid, {
      node: createNode(clean(title), {
        id: nid, notes: clean(n.notes?.text ?? (typeof n.notes === 'string' ? n.notes : (!fromMindCraft && typeof n.description === 'string' ? htmlToMarkdown(n.description) : ''))),
        // extensões do MindCraft (campos próprios em "mc"), todas validadas
        markers: Array.isArray(m.markers) ? m.markers.filter((x) => typeof x === 'string' && MARKERS[x]) : [],
        progress: Number.isFinite(m.progress) ? Math.min(100, Math.max(0, m.progress)) : null,
        style: fromMindCraft ? sanitizeStyle(m.style) : convertNodeStyle(n.style, n.titleStyle, title),
        collapsed: m.collapsed === true,
        ...(Array.isArray(m.refs) && sanitizeRefs(m.refs).length ? { refs: sanitizeRefs(m.refs) } : {}),
        ...(m.flow && FLOW_TYPES.includes(m.flow.type) ? { flowType: m.flow.type } : {}),
        ...(m.flow && typeof m.flow.branchLabel === 'string' && m.flow.branchLabel ? { branchLabel: clean(m.flow.branchLabel).slice(0, 60) } : {}),
        ...(Object.keys(mcExtra).length ? { _mcExtra: mcExtra } : {}),
      }),
      parentId: typeof parentId === 'string' ? mapId(parentId) : null, index: Number.isFinite(index) ? index : 0, raw: { ...raw },
      prev: typeof previousId === 'string' ? mapId(previousId) : null,
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
    n.children = n.children.filter((c) => !seen.has(c.id));
    // nunca cortar em silêncio: um "Salvar" depois gravaria o arquivo mutilado. Recusa abrir e deixa o original intacto.
    if (depth >= MAX_DEPTH && n.children.length) throw new Error(`Arquivo .mom inválido: mais de ${MAX_DEPTH} níveis de profundidade (o arquivo não foi alterado).`);
    n.children.forEach((c) => prune(c, depth + 1));
  };
  prune(rootEntry.node, 0);
  for (const e of byId.values()) e.node._mom = e.raw;

  // tema: o do MindCraft (mcTheme) ou o tema ORIGINAL do Mindomo (themes.json), convertido e validado; o original é guardado para regravar
  const themes = get('themes.json'), tid = typeof doc.mapInfo?.themeId === 'string' ? doc.mapInfo.themeId : '';
  const custom = fromMindCraft ? sanitizeTheme(doc.mcCustomTheme) : convertTheme(themes, tid, doc.mapInfo?.name);
  const theme = doc.mcTheme === 'custom' && custom ? 'custom' : typeof doc.mcTheme === 'string' && THEMES[doc.mcTheme] ? doc.mcTheme : (!fromMindCraft && custom ? 'custom' : 'ocean');
  const map = new MindMap(rootEntry.node, { name: String(doc.mapInfo?.name || rootEntry.node.title), theme });
  map.meta._momDoc = doc; // preservado para round-trip
  // Três grupos de nós que a árvore principal não mostra. Nenhum pode sumir ao salvar:
  //  - SOLTOS: tópicos sem ligação à raiz (o Mindomo os mostra à parte). Viram _momFloating: aparecem à direita do mapa.
  //  - LIXEIRA: nós marcados como excluídos no Mindomo (e o que está dentro deles). Ficam guardados como estavam, sem aparecer.
  //  - duplicados e entradas inválidas: também voltam ao arquivo como estavam.
  const shown = new Set();
  (function walk(n) { shown.add(n.id); n.children.forEach(walk); })(rootEntry.node);
  const rawById = new Map(nodes.filter((n) => n && typeof n.id === 'string').map((n) => [n.id, n]));
  const floatTops = new Map(), floatIds = new Set();
  for (const [id, e] of byId) {
    if (shown.has(id)) continue;
    let top = e;
    const climbed = new Set([top.node.id]);   // um arquivo hostil pode ter ciclos de pai: sem isto o laço nunca termina
    while (top.parentId && byId.has(top.parentId) && !climbed.has(top.parentId)) { top = byId.get(top.parentId); climbed.add(top.node.id); }   // sobe até o topo da cadeia que o app enxerga
    const rawParent = top.parentId ? rawById.get(top.parentId) : null;
    if (rawParent && !rawParent.deleted) continue;                                 // pai existe e não está na lixeira: não é um solto
    if (rawParent && rawParent.deleted) continue;                                  // dentro da lixeira do Mindomo: fica como está
    if (!floatTops.has(top.node.id)) floatTops.set(top.node.id, top);
  }
  for (const top of floatTops.values()) (function walk(n) { floatIds.add(n.id); n.children.forEach(walk); })(top.node);
  if (floatTops.size) map.meta._momFloating = [...floatTops.values()].map((t) => ({ node: t.node, index: t.index, previousId: t.prev, parentId: t.parentId }));
  const hidden = nodes.filter((n) => {
    if (!n || typeof n !== 'object') return false;
    if (typeof n.id !== 'string') return true;                                     // inválido para o app: volta como estava
    if (dups.has(n)) return true;                                                  // cópia duplicada do mesmo id
    const mid = mapId(n.id);
    return !shown.has(mid) && !floatIds.has(mid);                                  // lixeira
  });
  if (hidden.length) map.meta._momHidden = hidden;
  if (custom) map.meta.customTheme = custom;
  // todos os temas do arquivo voltam ao themes.json (o Mindomo tem uma biblioteca de temas, não só o que está em uso)
  if (themes && typeof themes === 'object' && !Array.isArray(themes) && JSON.stringify(themes).length < 4000000) map.meta._momThemes = themes;
  if (Array.isArray(doc.mcPdfs) && sanitizePdfs(doc.mcPdfs).length) map.meta.pdfs = sanitizePdfs(doc.mcPdfs);
  // Mindomo guarda o histórico (changes.json) e as relações dele (relations.json). O MindCraft ainda não mostra as relações do Mindomo,
  // mas elas NÃO podem ser perdidas: guardamos o conteúdo original (com os ids já mapeados) e regravamos no mesmo formato.
  const changes = get('changes.json');
  if (Array.isArray(changes)) map.meta._momChanges = changes;
  const momRel = get('relations.json');
  if (Array.isArray(momRel)) {
    map.meta._momRelations = momRel.filter((r) => r && typeof r.fromNodeId === 'string' && typeof r.toNodeId === 'string')
      .map((r) => ({ ...r, fromNodeId: mapId(r.fromNodeId), toNodeId: mapId(r.toNodeId) }));
  }
  if (Array.isArray(doc.mcRelations)) {
    map.meta.relations = doc.mcRelations
      .filter((r) => r && typeof r.from === 'string' && typeof r.to === 'string' && seen.has(mapId(r.from)) && seen.has(mapId(r.to)) && mapId(r.from) !== mapId(r.to))
      .map((r) => ({ id: typeof r.id === 'string' && SAFE_ID.test(r.id) ? r.id : newId(), from: mapId(r.from), to: mapId(r.to), label: String(r.label ?? '').slice(0, 200),
        ...(typeof r.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(r.color) ? { color: r.color } : {}),
        ...(typeof r.style === 'string' && ['solid', 'dashed', 'dotted'].includes(r.style) ? { style: r.style } : {}) }));
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
    const hasExtra = !!(node._mcExtra && Object.keys(node._mcExtra).length);
    const hasFlow = (node.flowType && node.flowType !== 'step') || !!node.branchLabel;
    const hasMc = (node.markers || []).length || node.progress != null || hasStyle || node.collapsed || (node.refs && node.refs.length) || hasExtra || hasFlow;
    list.push({
      version: 40, ...raw, id: node.id, originalId: node.id,
      ...(parentId ? { parentId } : {}), ...(previousId ? { previousId } : {}),
      title: node.title, index, creationDate: raw.creationDate || now, modificationDate: now,
      style: raw.style || { valign: 32000, halign: 32000, orientation: parentId ? 0 : 101 },
      creatorId: raw.creatorId ?? 4,
      ...(node.notes ? { notes: { text: node.notes } } : {}),
      // notas do Mindomo (HTML): só reescreve se o texto mudou aqui; senão o HTML original segue intacto
      ...(typeof raw.description === 'string' && node.notes !== htmlToMarkdown(raw.description) ? { description: node.notes ? markdownToHtml(node.notes) : '' } : {}),
      ...(hasMc ? { mc: {
        ...(hasExtra ? node._mcExtra : {}),
        markers: node.markers || [], progress: node.progress,
        ...(hasStyle ? { style: node.style } : {}), ...(node.collapsed ? { collapsed: true } : {}),
        ...(node.refs && node.refs.length ? { refs: node.refs } : {}),
        ...(hasFlow ? { flow: { type: node.flowType || 'step', ...(node.branchLabel ? { branchLabel: node.branchLabel } : {}) } } : {}),
      } } : {}),
    });
    let prev = null;
    node.children.forEach((c, i) => { visit(c, node.id, prev, i); prev = c.id; });
  };
  visit(map.root, null, null, 0);
  // tópicos soltos (sem pai) voltam à posição que tinham; a lixeira e os duplicados voltam como estavam
  // o pai original do tópico solto (que não existe no arquivo) é regravado como estava: nada se perde ao salvar
  for (const f of map.meta._momFloating || []) visit(f.node, f.parentId || null, f.previousId || null, Number.isFinite(f.index) ? f.index : 0);
  for (const raw of map.meta._momHidden || []) list.push(raw);

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
  if (map.meta.customTheme) doc.mcCustomTheme = map.meta.customTheme; else delete doc.mcCustomTheme;
  if (map.meta.pdfs && map.meta.pdfs.length) doc.mcPdfs = map.meta.pdfs; else delete doc.mcPdfs;
  doc.mapInfo.name = map.meta.name || map.root.title;
  doc.mapInfo.rootId = map.root.id;
  doc.mapInfo.modificationDate = now;

  const zip = new AdmZip();
  zip.addFile('themes.json', Buffer.from(JSON.stringify(map.meta._momThemes || {})));
  zip.addFile('document.json', Buffer.from(JSON.stringify(doc)));
  zip.addFile('nodes.json', Buffer.from(JSON.stringify(list)));
  // histórico do Mindomo volta como estava; relações do Mindomo só se os dois tópicos ainda existem (sem referência solta)
  zip.addFile('changes.json', Buffer.from(JSON.stringify(map.meta._momChanges || [])));
  if (Array.isArray(map.meta._momRelations)) {
    const ids = new Set(list.map((x) => x.id));
    const rel = map.meta._momRelations.filter((r) => ids.has(r.fromNodeId) && ids.has(r.toNodeId));
    if (rel.length) zip.addFile('relations.json', Buffer.from(JSON.stringify(rel)));
  }
  zip.addFile('Document.xml',Buffer.from('<mo:map xmlns:mo="http://schemas.mindomo.com/application/version-4.4"></mo:map>'));
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
