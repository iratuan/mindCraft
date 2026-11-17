'use strict';
/**
 * Material de estudo: transforma o mapa em um documento para ler e imprimir (Markdown e HTML, que vira PDF no processo principal).
 * Regras puras, sem Electron. Peso = prioridade dos marcadores (1 > 2 > 3; sem marcador = 0). Com "ordenar por peso", os irmãos
 * mais importantes vêm primeiro (a ordenação é estável: o restante mantém a ordem do mapa).
 */
const { parseLinks } = require('../components/links');
const { mdToHtml } = require('./markdown');
const { MARKERS } = require('../components/markers');
const { escapeHtml: esc } = require('../utils/text');
const { printCss, weightClass } = require('./print-style');

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
    const parts = [`<section class="topic d${t.depth} ${weightClass(t.priority)}"><h${h}><span class="num">${esc(t.num)}</span> ${esc(t.title)} ${badge}</h${h}>`];
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
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(doc.title)}</title><style>${printCss(`
    .toc { list-style: none; padding: 0; columns: 2; column-gap: 7mm; font-size: 9pt; margin: 0 0 2mm; }
    .toc li { break-inside: avoid; padding: 0; margin: 0; }
    /* sumário nivelado à esquerda: o número (1.1.2) já mostra a hierarquia, sem recuo crescente */
    .toc .l3, .toc .l4, .toc .l5, .toc .l6 { color: #444; }
    .topic { margin-top: 1.5mm; }
    /* tópicos filhos: sem recuo acumulado; a hierarquia aparece pelo título e pelo número */
    .topic .topic { margin-left: 0; padding-left: 0; border-left: 0; }
    section.sources { margin-top: 4mm; break-before: auto; }
    .sources ul { font-size: 9pt; margin: 0 0 0 4mm; padding: 0; }
`)}</style></head><body>
    <h1>${esc(doc.title)}</h1><p class="sub">Material de estudo · ${esc(doc.date)} · ${doc.count} tópico(s)</p>
    <h2>Sumário</h2><ul class="toc">${toc.join('')}</ul>
    <div class="cols">${doc.topics.map(sec).join('')}</div>
    ${srcs}
  </body></html>`;
}

module.exports = { buildStudyDoc, toMarkdown, toHtml, weightOf, orderChildren, DEFAULTS };
