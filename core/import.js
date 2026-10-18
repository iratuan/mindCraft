'use strict';
const { MindMap, createNode } = require('./model');
const { MARKERS } = require('./markers');

const GLYPH_TO_ID = Object.fromEntries(Object.entries(MARKERS).map(([id, m]) => [m.glyph, id]));

/** Inverso de tagText(): extrai " (60% ✓ ★)" do fim do título. Só aceita se tudo entre parênteses for reconhecido. */
function parseTags(title) {
  const m = /^(.*?)\s+\(([^()]+)\)$/.exec(title);
  if (!m) return { title };
  let progress = null;
  const markers = [];
  for (const tok of m[2].trim().split(/\s+/)) {
    const p = /^(\d{1,3})%$/.exec(tok);
    if (p && +p[1] <= 100) progress = +p[1];
    else if (GLYPH_TO_ID[tok]) markers.push(GLYPH_TO_ID[tok]);
    else return { title };
  }
  return { title: m[1], progress, markers };
}
const mk = (raw, extra = {}) => {
  const t = parseTags(raw);
  return createNode(t.title, { ...extra, markers: t.markers || [], progress: t.progress ?? null });
};

const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&amp;/g, '&');

/**
 * Markdown → mapa. Títulos (#..######) definem a hierarquia; listas ("-", "*", "+", "1.")
 * aninham por indentação abaixo do último título; parágrafos viram notas do tópico atual.
 * O primeiro "# " vira a raiz (se houver só um); sem ele, a raiz usa `fallbackTitle`.
 */
function fromMarkdown(text, fallbackTitle = 'Mapa importado') {
  const items = []; // { level, title, notes }
  const headingStack = []; // níveis de títulos abertos
  let cur = null;
  let inFence = false;
  for (const raw of text.replace(/\r\n?/g, '\n').split('\n')) {
    if (/^\s*```/.test(raw)) { inFence = !inFence; if (cur) cur.notes += (cur.notes ? '\n' : '') + raw.trim(); continue; }
    const h = !inFence && /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(raw);
    const li = !inFence && /^(\s*)(?:[-*+]|\d+[.)])\s+(.*)$/.exec(raw);
    if (h) {
      const lvl = h[1].length;
      while (headingStack.length && headingStack[headingStack.length - 1] >= lvl) headingStack.pop();
      headingStack.push(lvl);
      cur = { level: headingStack.length - 1, title: h[2], notes: '', base: headingStack.length - 1, heading: true };
      items.push(cur);
    } else if (li) {
      const indent = Math.floor(li[1].replace(/\t/g, '    ').length / 2);
      const base = [...items].reverse().find((i) => i.heading);
      cur = { level: (base ? base.level + 1 : 0) + indent, title: li[2], notes: '' };
      items.push(cur);
    } else if (raw.trim() && cur) {
      cur.notes += (cur.notes ? '\n' : '') + raw.trim().replace(/^>\s?/, '');
    }
  }
  if (!items.length) return new MindMap(createNode(fallbackTitle), { name: fallbackTitle });

  const h1 = items.filter((i) => i.level === 0 && i.heading);
  let rootItem;
  let list = items;
  if (h1.length === 1 && items[0] === h1[0]) { rootItem = h1[0]; list = items.slice(1).map((i) => ({ ...i, level: i.level - 1 })); }
  const root = rootItem ? mk(rootItem.title, { notes: rootItem.notes }) : createNode(fallbackTitle);
  const stack = [{ level: -1, node: root }];
  for (const it of list) {
    const level = Math.max(0, it.level);
    while (stack.length > 1 && stack[stack.length - 1].level >= level) stack.pop();
    // se pular níveis (ex.: H1 → H3), anexa ao ancestral mais próximo
    const n = mk(it.title, { notes: it.notes });
    stack[stack.length - 1].node.children.push(n);
    stack.push({ level, node: n });
  }
  return new MindMap(root, { name: root.title });
}

/** OPML → mapa. Atributos: text (título) e _note (notas). Vários outlines no topo ganham uma raiz sintética. */
function fromOPML(xml, fallbackTitle = 'Mapa importado') {
  const attr = (s, name) => { const m = new RegExp(`\\b${name}="([^"]*)"|\\b${name}='([^']*)'`).exec(s); return m ? unesc(m[1] ?? m[2]) : ''; };
  const title = /<title>([\s\S]*?)<\/title>/.exec(xml);
  const body = /<body[^>]*>([\s\S]*)<\/body>/.exec(xml);
  if (!body) throw new Error('OPML inválido: sem <body>');
  const tops = [];
  const stack = [];
  const re = /<outline\b([^>]*?)(\/?)>|<\/outline\s*>/g;
  let m;
  while ((m = re.exec(body[1]))) {
    if (m[0].startsWith('</')) { stack.pop(); continue; }
    const prog = attr(m[1], '_progress');
    const n = createNode(attr(m[1], 'text') || attr(m[1], 'title') || '(sem título)', {
      notes: attr(m[1], '_note'),
      markers: attr(m[1], '_markers').split(',').filter((x) => MARKERS[x]),
      progress: prog === '' ? null : Math.min(100, Math.max(0, +prog || 0)),
    });
    (stack.length ? stack[stack.length - 1] : { children: tops }).children.push(n);
    if (!m[2]) stack.push(n);
  }
  const root = tops.length === 1 ? tops[0] : createNode(title ? unesc(title[1].trim()) : fallbackTitle, { children: tops });
  return new MindMap(root, { name: root.title });
}

module.exports = { fromMarkdown, fromOPML };
