'use strict';
const fs = require('fs');
const path = require('path');
const { rewriteLinks, parseLinks } = require('./links');
const { buildGraph } = require('./graph');
const { MARKERS } = require('./markers');

/** Nome de arquivo seguro (Windows/macOS/Linux): sem separadores nem caracteres reservados, sem pontos/espaços nas pontas. */
function safeFileName(name, fallback = 'Mapa') {
  let s = String(name ?? '').replace(/[\\/:*?"<>|#^\[\]\x00-\x1f]/g, ' ')
    .split(/\s+/).filter((t) => t && !/^\.+$/.test(t)).join(' ')   // descarta "..", "." e espaços repetidos (../../x => x)
    .replace(/^\.+|[. ]+$/g, '');
  if (/^(con|prn|aux|nul|com\d|lpt\d)$/i.test(s)) s = '_' + s;
  return (s || fallback).slice(0, 120);
}
/** Texto de cabeçalho compatível com links [[Nota#Cabeçalho]] do Obsidian (que trata mal # | ^ [ ] : %). */
const headingText = (t) => String(t ?? '').replace(/[#|^\[\]:%]/g, ' ').replace(/\s+/g, ' ').trim() || '(sem título)';

/** URL do protocolo do Obsidian para abrir uma pasta como vault. */
const obsidianUrl = (dir) => `obsidian://open?path=${encodeURIComponent(dir)}`;

const brDate = (s) => s.split('-').reverse().join('/');

/**
 * Exporta os mapas como um vault do Obsidian: um .md por mapa, um cabeçalho por tópico, e todos os [[links]]
 * reescritos para [[Mapa#Tópico]] (que o Obsidian resolve nativamente, sem criar uma nota por tópico).
 * @returns {{ dir: string, files: string[], warnings: string[] }}
 */
function exportObsidian(maps, outDir) {
  if (!maps.length) throw new Error('Não há mapas para exportar.');
  const root = path.resolve(outDir);
  fs.mkdirSync(root, { recursive: true });

  const used = new Set(), fileOf = new Map();
  for (const m of maps) {                                              // nome de arquivo por mapa, sem colisões
    const base = safeFileName(m.name);
    let name = base, i = 2;
    while (used.has(name.toLowerCase())) name = `${base} (${i++})`;
    used.add(name.toLowerCase()); fileOf.set(m.key, name);
  }
  const g = buildGraph(maps.map((m) => ({ ...m, name: fileOf.get(m.key) })));
  const warnings = [];
  const files = [];

  /** [[Mapa#Tópico]] para um nó do grafo; fantasmas ficam como [[Título]] (também não resolvem no Obsidian). */
  const wiki = (id, alias) => {
    const n = g.byId.get(id);
    const tail = alias ? `|${alias.replace(/[\[\]|]/g, ' ')}` : '';
    if (!n) return null;
    if (n.kind === 'ghost') return `[[${headingText(n.title)}${tail}]]`;
    const f = fileOf.get(n.mapKey);
    return n.isRoot ? `[[${f}${tail}]]` : `[[${f}#${headingText(n.title)}${tail}]]`;
  };
  const resolveText = (text, fromKey) => rewriteLinks(text, (lk) => {
    const r = g.resolveLink(lk, fromKey);
    return r ? wiki(r.id, lk.alias) : null;
  });
  // título "limpo" para o cabeçalho: [[Alvo|texto]] vira "texto" (ou o alvo)
  const plainTitle = (t) => rewriteLinks(t, (lk) => lk.alias || lk.topic || lk.map);

  for (const m of maps) {
    const name = fileOf.get(m.key), seen = new Map(), exam = m.map.meta.exam;
    const out = ['---', 'mindcraft: true', `mapa: "${name.replace(/"/g, "'")}"`,
      ...(exam ? [`prova: "${String(exam.name || '').replace(/"/g, "'")}"`, `data_prova: ${exam.date}`] : []), 'tags: [mindcraft]', '---', ''];
    const MAX_H = 5;

    const walk = (node, depth) => {
      const id = g.idOf(m.key, node.id);
      const hd = headingText(plainTitle(node.title));
      seen.set(hd, (seen.get(hd) || 0) + 1);
      if (seen.get(hd) === 2) warnings.push(`"${hd}" aparece mais de uma vez em "${name}": links para ele apontam para a primeira ocorrência.`);
      out.push(depth === 0 ? `# ${hd}` : depth <= MAX_H ? `${'#'.repeat(depth + 1)} ${hd}` : `${'  '.repeat(depth - MAX_H - 1)}- **${hd}**`, '');
      const meta = [];
      if (node.progress != null) meta.push(`Progresso: ${node.progress}%`);
      const mk = (node.markers || []).filter((x) => MARKERS[x]).map((x) => MARKERS[x].label);
      if (mk.length) meta.push(mk.join(', '));
      if (node.study && node.study.next) meta.push(`Próxima revisão: ${brDate(node.study.next)}`);
      if (meta.length) out.push(`_${meta.join(' · ')}_`, '');
      if (parseLinks(node.title).length) out.push(`Ligações do título: ${resolveText(node.title, m.key)}`, '');
      if (node.notes) out.push(resolveText(node.notes, m.key).trim(), '');
      if (node.refs && node.refs.length) {
        const pdfs = m.map.meta.pdfs || [];
        for (const rf of node.refs) { const p = pdfs.find((x) => x.id === rf.pdf); out.push(`- Fonte: ${p ? p.name.replace(/[\r\n]+/g, ' ') : 'PDF'}, p. ${rf.page}${rf.quote ? ' — “' + rf.quote.replace(/\s+/g, ' ').slice(0, 160) + '”' : ''}`); }
        out.push('');
      }
      const rel = g.outgoing(id).filter((e) => e.type === 'relation');
      for (const e of rel) out.push(`- Relacionado: ${wiki(e.to)}${e.label ? ` (${e.label.replace(/[\r\n]+/g, ' ')})` : ''}`);
      if (rel.length) out.push('');
      node.children.forEach((c) => walk(c, depth + 1));
    };
    walk(m.map.root, 0);

    let file = path.join(root, name + '.md');
    if (path.dirname(path.resolve(file)) !== root) throw new Error('Caminho de saída inválido.'); // nunca escreve fora da pasta
    // nunca sobrescreve uma nota que não seja nossa: só substitui arquivos que já têm o marcador mindcraft: true
    if (fs.existsSync(file) && !/^---\r?\nmindcraft: true/.test(fs.readFileSync(file, 'utf8').slice(0, 200))) {
      let alt = path.join(root, name + ' (MindCraft).md'), k = 2;
      while (fs.existsSync(alt) && !/^---\r?\nmindcraft: true/.test(fs.readFileSync(alt, 'utf8').slice(0, 200))) alt = path.join(root, name + ' (MindCraft ' + k++ + ').md');
      warnings.push(`Já existia uma nota "${name}.md" que não é do MindCraft; gravei em "${path.basename(alt)}".`);
      file = alt;
    }
    fs.writeFileSync(file, out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n');
    files.push(file);
  }
  return { dir: root, files, warnings };
}

module.exports = { exportObsidian, safeFileName, headingText, obsidianUrl };
