'use strict';
/**
 * Material de estudo: transforma o mapa em um documento para ler e imprimir (Markdown e HTML, que vira PDF no processo principal).
 * Regras puras, sem Electron. Peso = prioridade dos marcadores (1 > 2 > 3; sem marcador = 0). Com "ordenar por peso", os irmãos
 * mais importantes vêm primeiro (a ordenação é estável: o restante mantém a ordem do mapa).
 */
const { parseLinks } = require('./links');
const { mdToHtml } = require('./markdown');
const { MARKERS } = require('./markers');
const { escapeHtml: esc } = require('./text');

const WEIGHT = { p1: 3, p2: 2, p3: 1 };
const DEFAULTS = { notes: true, sources: true, links: true, byWeight: true, maxDepth: Infinity, bw: false };

/** Peso de um tópico: o maior peso entre seus marcadores de prioridade. */
const weightOf = (n) => Math.max(0, ...(n.markers || []).map((m) => WEIGHT[m] || 0));

/** Irmãos ordenados por peso (estável): os de peso maior primeiro. */
function orderChildren(children, byWeight) {
  return byWeight ? [...children].sort((a, b) => weightOf(b) - weightOf(a)) : children;
}

/** Monta o documento: uma árvore de seções numeradas, com notas, fontes (PDFs e páginas) e conexões (setas e links). */
function buildStudyDoc(map, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const pdfs = map.meta.pdfs || [];
  const pdfById = new Map(pdfs.map((p) => [p.id, p]));
  const titleOf = new Map();
  const roots = [map.root, ...(map.meta._momFloating || []).map((f) => f.node)];
  for (const r of roots) (function walk(n) { titleOf.set(n.id, n.title); n.children.forEach(walk); })(r);
  const relOut = new Map(), relIn = new Map();
  for (const r of map.meta.relations || []) {
    if (!relOut.has(r.from)) relOut.set(r.from, []);
    if (!relIn.has(r.to)) relIn.set(r.to, []);
    relOut.get(r.from).push({ to: r.to, label: r.label || '' });
    relIn.get(r.to).push({ from: r.from, label: r.label || '' });
  }
  const usage = new Map();   // PDF -> quantos trechos citados
  const visit = (node, depth, num) => {
    const ref = (node.refs || []).map((r) => {
      const p = pdfById.get(r.pdf);
      const name = p ? p.name : 'PDF removido';
      usage.set(name, (usage.get(name) || 0) + 1);
      return { pdf: name, page: r.page, quote: String(r.quote || '').slice(0, 400) };
    });
    const links = { out: [], in: [], text: [] };
    if (o.links) {
      for (const r of relOut.get(node.id) || []) links.out.push({ title: titleOf.get(r.to) || '(tópico removido)', label: r.label });
      for (const r of relIn.get(node.id) || []) links.in.push({ title: titleOf.get(r.from) || '(tópico removido)', label: r.label });
      for (const l of parseLinks(node.notes || '')) links.text.push(l.map ? `${l.map}#${l.topic || ''}` : (l.topic || ''));
    }
    const item = {
      num, title: node.title, depth, weight: weightOf(node), priority: (node.markers || []).find((m) => WEIGHT[m]) || null,
      progress: node.progress ?? null, notes: o.notes ? (node.notes || '').trim() : '',
      generated: (o.generated && o.generated.get(node.id)) || [],
      sources: o.sources ? ref : [], links: o.links ? links : { out: [], in: [], text: [] }, children: [],
    };
    if (depth < o.maxDepth) orderChildren(node.children, o.byWeight).forEach((c, i) => item.children.push(visit(c, depth + 1, `${num}.${i + 1}`)));
    return item;
  };
  const topics = [visit(map.root, 1, '1')];
  (map.meta._momFloating || []).forEach((f, i) => topics.push(visit(f.node, 1, `S${i + 1}`)));
  const sources = pdfs.map((p) => ({ name: p.name, uses: usage.get(p.name) || 0 }));   // todos os PDFs vinculados ao mapa
  return { title: map.meta.name || map.root.title, date: new Date().toLocaleDateString('pt-BR'), count: countItems(topics), topics, sources, options: o };
}
const countItems = (list) => list.reduce((n, t) => n + 1 + countItems(t.children), 0);

/** Lista de cima para baixo, para o sumário. */
function walkItems(list, fn) { for (const t of list) { fn(t); walkItems(t.children, fn); } }

/** Markdown: material de consulta, com sumário, títulos por nível, notas, fontes e conexões. */
function toMarkdown(doc) {
  const out = [`# ${doc.title}`, '', `Material de estudo · ${doc.date} · ${doc.count} tópico(s)`, ''];
  out.push('## Sumário', '');
  walkItems(doc.topics, (t) => out.push(`${'  '.repeat(t.depth - 1)}- ${t.num} ${t.title}${t.priority ? ` (prioridade ${t.priority.slice(1)})` : ''}`));
  out.push('');
  const body = (t) => {
    out.push(`${'#'.repeat(Math.min(t.depth + 1, 6))} ${t.num} ${t.title}${t.priority ? ` · prioridade ${t.priority.slice(1)}` : ''}`, '');
    if (t.progress !== null) out.push(`*Progresso: ${t.progress}%*`, '');
    if (t.notes) out.push(t.notes, '');
    else if (t.generated.length) { out.push('*Texto de revisão gerado pela IA (revise antes de usar):*', ''); for (const p of t.generated) out.push(p, ''); }
    for (const s of t.sources) out.push(`> Fonte: ${s.pdf}, p. ${s.page}${s.quote ? ` — “${s.quote}”` : ''}`, '');
    const c = t.links;
    if (c.out.length || c.in.length || c.text.length) {
      for (const l of c.out) out.push(`- Liga a: **${l.title}**${l.label ? ` (${l.label})` : ''}`);
      for (const l of c.in) out.push(`- Ligado por: **${l.title}**${l.label ? ` (${l.label})` : ''}`);
      for (const l of c.text) out.push(`- Link no texto: [[${l}]]`);
      out.push('');
    }
    t.children.forEach(body);
  };
  doc.topics.forEach(body);
  if (doc.options.sources && doc.sources.length) {
    out.push('## Fontes', '');
    for (const s of doc.sources) out.push(`- ${s.name}${s.uses ? ` (${s.uses} trecho(s) citado(s))` : ''}`);
    out.push('');
  }
  return out.join('\n');
}

const PRIORITY_COLOR = (p, bw) => (bw ? '#222' : (MARKERS[p] || {}).color || '#666');

/** HTML para impressão (A4). Tudo do usuário passa por escapeHtml; as notas passam pelo renderizador Markdown seguro. */
function toHtml(doc) {
  const sec = (t) => {
    const h = Math.min(t.depth + 1, 5);
    const badge = t.priority ? `<span class="pri" style="background:${PRIORITY_COLOR(t.priority, doc.options.bw)}">P${esc(t.priority.slice(1))}</span>` : '';
    const parts = [`<section class="topic d${t.depth}"><h${h}><span class="num">${esc(t.num)}</span> ${esc(t.title)} ${badge}</h${h}>`];
    if (t.progress !== null) parts.push(`<p class="meta">Progresso ${esc(String(t.progress))}%</p>`);
    if (t.notes) parts.push(`<div class="notes">${mdToHtml(t.notes)}</div>`);
    else if (t.generated.length) parts.push(`<div class="notes ai"><p class="ai-note">Texto de revisão gerado pela IA (revise antes de usar)</p>${t.generated.map((p) => `<p>${esc(p)}</p>`).join('')}</div>`);
    for (const s of t.sources) parts.push(`<p class="src">Fonte: ${esc(s.pdf)}, p. ${esc(String(s.page))}${s.quote ? ` — “${esc(s.quote)}”` : ''}</p>`);
    const c = t.links;
    if (c.out.length || c.in.length || c.text.length) {
      parts.push('<ul class="links">');
      for (const l of c.out) parts.push(`<li>Liga a <b>${esc(l.title)}</b>${l.label ? ` (${esc(l.label)})` : ''}</li>`);
      for (const l of c.in) parts.push(`<li>Ligado por <b>${esc(l.title)}</b>${l.label ? ` (${esc(l.label)})` : ''}</li>`);
      for (const l of c.text) parts.push(`<li>Link no texto <code>[[${esc(l)}]]</code></li>`);
      parts.push('</ul>');
    }
    parts.push(...t.children.map(sec), '</section>');
    return parts.join('');
  };
  const toc = [];
  walkItems(doc.topics, (t) => toc.push(`<li class="l${t.depth}"><span class="num">${esc(t.num)}</span> ${esc(t.title)}</li>`));
  const srcs = doc.options.sources && doc.sources.length
    ? `<section class="sources"><h2>Fontes</h2><ul>${doc.sources.map((s) => `<li>${esc(s.name)}${s.uses ? ` (${s.uses} trecho(s))` : ''}</li>`).join('')}</ul></section>` : '';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(doc.title)}</title><style>
    @page { size: A4; margin: 18mm 16mm; }
    body { font-family: "Segoe UI", Arial, sans-serif; color: #1c1c1c; font-size: 11pt; line-height: 1.45; }
    h1 { font-size: 24pt; margin: 0 0 4px; } .sub { color: #555; margin: 0 0 18px; }
    h2 { font-size: 15pt; border-bottom: 1px solid #bbb; padding-bottom: 3px; break-after: avoid; }
    .toc { list-style: none; padding: 0; columns: 2; } .toc li { break-inside: avoid; padding: 1px 0; }
    .toc .l2, .toc .l3 { padding-left: 14px; } .toc .l4, .toc .l5, .toc .l6 { padding-left: 28px; color: #555; font-size: 10pt; }
    .topic { break-inside: auto; margin-top: 10px; } .topic .topic { margin-left: 14px; border-left: 2px solid #ddd; padding-left: 10px; }
    h2, h3, h4, h5, h6 { break-after: avoid; } h3 { font-size: 13.5pt; } h4 { font-size: 12pt; } h5 { font-size: 11pt; }
    .num { color: #555; font-weight: 600; margin-right: 4px; }
    .pri { color: #fff; font-size: 8.5pt; font-weight: 700; padding: 1px 6px; border-radius: 9px; vertical-align: middle; margin-left: 6px; }
    .meta { color: #666; font-size: 9.5pt; margin: 2px 0; }
    .notes { background: #f6f6f4; border-left: 3px solid #999; padding: 6px 10px; margin: 6px 0; }
    .notes p { margin: 4px 0; } .notes blockquote { color: #444; border-left: 2px solid #aaa; margin: 4px 0; padding-left: 8px; }
    .src { font-size: 9.5pt; color: #333; margin: 4px 0; font-style: italic; }
    .links { font-size: 10pt; color: #333; margin: 4px 0; padding-left: 18px; }
    .sources ul { font-size: 10.5pt; } code { font-size: 9.5pt; }
    section.sources { break-before: auto; margin-top: 18px; }
    /* o material sempre sai em duas colunas (o título e o sumário ficam na largura toda) */
    .cols { column-count: 2; column-gap: 9mm; column-fill: auto; }
  </style></head><body>
    <h1>${esc(doc.title)}</h1><p class="sub">Material de estudo · ${esc(doc.date)} · ${doc.count} tópico(s)</p>
    <h2>Sumário</h2><ul class="toc">${toc.join('')}</ul>
    <div class="cols">${doc.topics.map(sec).join('')}</div>
    ${srcs}
  </body></html>`;
}

module.exports = { buildStudyDoc, toMarkdown, toHtml, weightOf, orderChildren, DEFAULTS };
