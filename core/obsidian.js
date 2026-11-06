'use strict';
/**
 * Exportação para o Obsidian (puro: devolve arquivos, não grava nada — a gravação é em obsidian-write.js).
 *
 * Um tópico = uma nota .md. A rede do MindCraft vira o grafo do Obsidian:
 *   - [[Tópico]] / [[Mapa#Tópico]] do texto viram [[pasta/mapa/Título|texto]]: caminho completo, então títulos
 *     repetidos em mapas diferentes (ex.: "Atos administrativos" em dois concursos) não se confundem;
 *   - hierarquia (pai/filhos) e relações (setas do mapa) viram links no fim da nota;
 *   - a nota guarda a origem em `mindcraft-id` (para o gravador saber que é nossa) e um hash do conteúdo
 *     (para detectar edição feita no Obsidian e não sobrescrever o trabalho do usuário).
 *
 * Só usa dados puros (sem fs/crypto), para rodar também no navegador/tablet.
 */
const { buildGraph } = require('./graph');
const { rewriteLinks, plainLinks } = require('./links');

const FOLDER = 'MindCraft';
const ID_KEY = 'mindcraft-id';
const HASH_KEY = 'mindcraft-hash';
const RESERVED = /^(con|prn|aux|nul|com\d|lpt\d)$/i;

/** FNV-1a de 32 bits + tamanho: detecta edição, não é criptografia. */
function fingerprint(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, '0') + s.length.toString(16);
}

/** Nome de arquivo seguro no Windows, macOS e Linux, sem caracteres que quebram [[ ]] do Obsidian. */
function safeName(s, fallback = 'Sem título') {
  let t = String(s ?? '').replace(/[\\/:*?"<>|#^[\]\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').replace(/^[.\s]+|[.\s]+$/g, '').slice(0, 120).trim();
  if (!t) t = fallback;
  if (RESERVED.test(t)) t += ' (nota)';
  return t;
}

/** Texto de exibição dentro de [[alvo|texto]]: sem colchetes nem barra vertical. */
const aliasText = (s) => String(s ?? '').replace(/[[\]|]/g, ' ').replace(/\s+/g, ' ').trim();

/** Nome único (sem diferenciar maiúsculas, como o Obsidian): "Nome", "Nome (2)", ... */
function unique(name, used) {
  let cand = name, i = 2;
  while (used.has(cand.toLowerCase())) cand = `${name} (${i++})`;
  used.add(cand.toLowerCase());
  return cand;
}

/** Visita os tópicos na mesma ordem do grafo (raiz, filhos, depois os tópicos soltos do Mindomo). */
function walkTopics(map, fn) {
  const visit = (node, parent) => { fn(node, parent); for (const c of node.children) visit(c, node); };
  visit(map.root, null);
  for (const f of map.meta._momFloating || []) visit(f.node, null);
}

/** @param maps [{ key, name, map }] — mesmo formato do grafo. @returns {{files:{path,content}[], stats:object}} */
function buildObsidianVault(maps, { folder = FOLDER } = {}) {
  const g = buildGraph(maps, { hierarchy: true });

  // pasta por mapa e caminho por tópico (sem extensão), todos únicos
  const usedFolders = new Set();
  const folderOf = new Map();
  for (const m of maps) folderOf.set(m.key, unique(safeName(plainLinks(m.name), 'Mapa'), usedFolders));
  const pathOf = new Map();
  const topics = [];
  for (const m of maps) {
    const used = new Set();
    walkTopics(m.map, (n, parent) => {
      const id = `${m.key}::${n.id}`;
      const rel = `${folder}/${folderOf.get(m.key)}/${unique(safeName(plainLinks(n.title)), used)}`;
      pathOf.set(id, rel);
      topics.push({ m, n, id, parentId: parent ? `${m.key}::${parent.id}` : null });
    });
  }

  // alvo de um link: nota (caminho completo) ou, se não existe, um link "fantasma" como no Obsidian
  const wiki = (id, alias) => {
    const node = g.byId.get(id);
    if (!node) return `[[${safeName(alias)}]]`;
    if (node.kind === 'ghost') return `[[${safeName(node.title)}|${aliasText(alias || node.title)}]]`;
    const shown = aliasText(alias || plainLinks(node.title)) || 'Sem título';
    return `[[${pathOf.get(id)}|${shown}]]`;
  };

  const childrenOf = new Map(), relOut = new Map(), relIn = new Map();
  for (const e of g.edges) {
    if (e.type === 'hierarchy') { if (!childrenOf.has(e.from)) childrenOf.set(e.from, []); childrenOf.get(e.from).push(e.to); }
    if (e.type === 'relation') {
      if (!relOut.has(e.from)) relOut.set(e.from, []); relOut.get(e.from).push(e);
      if (!relIn.has(e.to)) relIn.set(e.to, []); relIn.get(e.to).push(e);
    }
  }
  const parentOf = new Map();
  for (const [p, kids] of childrenOf) for (const k of kids) parentOf.set(k, p);

  const files = [];
  let ghostCount = 0, ambiguous = 0;
  for (const { m, n, id, parentId } of topics) {
    const title = aliasText(plainLinks(n.title)) || 'Sem título';
    const notes = rewriteLinks(n.notes || '', (lk) => {
      const r = g.resolveLink(lk, m.key);
      if (!r) return null;
      if (r.ambiguous) ambiguous++;
      // mostra o texto como o usuário escreveu (fantasma: "Mapa#Tópico" inteiro, pois não há nota para ver)
      const ghost = g.byId.get(r.id)?.kind === 'ghost';
      const typed = ghost && lk.map && lk.topic ? `${lk.map}#${lk.topic}` : (lk.topic || lk.map);
      return wiki(r.id, lk.alias || typed);
    }).trim();

    const sec = [];
    const parent = parentOf.get(id) ?? parentId;
    if (parent && g.byId.has(parent)) sec.push(`Parte de: ${wiki(parent)}`);
    const kids = childrenOf.get(id) || [];
    if (kids.length) sec.push('', '## Subtópicos', ...kids.map((k) => `- ${wiki(k)}`));
    const rels = [...(relOut.get(id) || []).map((e) => `- → ${e.label ? e.label + ' ' : ''}${wiki(e.to)}`), ...(relIn.get(id) || []).map((e) => `- ← ${e.label ? e.label + ' ' : ''}${wiki(e.from)}`)];
    if (rels.length) sec.push('', '## Relações', ...rels);

    const bodyParts = [`# ${title}`];
    if (notes) bodyParts.push('', notes);
    if (sec.length) bodyParts.push('', '---', ...sec);
    const body = bodyParts.join('\n') + '\n';

    const fm = ['---', `${ID_KEY}: ${JSON.stringify(`${m.name}::${n.id}`)}`, `mapa: ${JSON.stringify(m.name)}`];
    if (n.progress != null && Number.isFinite(Number(n.progress))) fm.push(`progresso: ${Number(n.progress)}`);
    fm.push('aliases:', `  - ${JSON.stringify(title)}`, 'tags:', '  - mindcraft');
    const base = fm.join('\n') + '\n---\n' + body;               // o que o hash cobre (sem a própria linha do hash)
    const content = [...fm, `${HASH_KEY}: ${JSON.stringify(fingerprint(base))}`].join('\n') + '\n---\n' + body;
    files.push({ path: `${pathOf.get(id)}.md`, content });
  }
  for (const node of g.nodes) if (node.kind === 'ghost') ghostCount++;

  const links = files.reduce((acc, f) => acc + (f.content.match(/\[\[/g) || []).length, 0);
  return { files, stats: { maps: maps.length, notes: files.length, links, ghosts: ghostCount, ambiguous } };
}

module.exports = { buildObsidianVault, safeName, fingerprint, FOLDER, ID_KEY, HASH_KEY };
