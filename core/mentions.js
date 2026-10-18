'use strict';
const { norm, parseLinks, rewriteLinks } = require('./links');
const { buildGraph } = require('./graph');

/**
 * "Menções sem link" (como no Obsidian): títulos de outros tópicos que aparecem como palavra inteira no texto
 * de um tópico (título + notas), sem estarem ligados por [[ ]]. Comparação sem acento e sem diferenciar caixa.
 */
const words = (s) => ` ${norm(s).replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `;

function unlinkedMentions(maps, fromKey, node, { minLen = 4, limit = 20 } = {}) {
  const g = buildGraph(maps);
  const me = g.idOf(fromKey, node.id);
  const linked = new Set(g.outgoing(me).map((e) => e.to));
  const text = words(`${node.title}\n${rewriteLinks(node.notes || '', () => ' ')}`.replace(/\[\[[^\]]*\]\]/g, ' '));
  const out = [], seenTitles = new Set();
  for (const n of g.nodes) {
    if (n.kind !== 'topic' || n.id === me || linked.has(n.id)) continue;
    const w = words(n.title);
    if (w.trim().length < minLen) continue;
    if (text.includes(w) && !seenTitles.has(w + '|' + n.mapKey)) {
      seenTitles.add(w + '|' + n.mapKey);
      out.push({ id: n.id, mapKey: n.mapKey, topicId: n.topicId, title: n.title, mapName: n.mapName });
      if (out.length >= limit) break;
    }
  }
  return out;
}

/**
 * Envolve em [[ ]] a primeira ocorrência (palavra inteira, sem acento/caixa) de `title` em `text`,
 * preservando os caracteres originais. Ignora trechos que já estão dentro de [[ ]] ou de código.
 * @returns {string|null} novo texto, ou null se não houver ocorrência.
 */
function linkify(text, title, { target } = {}) {
  const src = String(text ?? '');
  const t = norm(title).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  if (!t) return null;
  // mapeia cada caractere original para sua forma normalizada (índices voltam ao texto original)
  let n = '';
  const map = [];
  let i = 0;
  for (const ch of src) {
    const f = ch.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, ' ');
    for (let k = 0; k < f.length; k++) { n += f[k]; map.push(i); }
    i += ch.length;
  }
  const blocked = [];
  for (const m of src.matchAll(/\[\[[^\]]*\]\]|```[\s\S]*?```|`[^`\n]*`/g)) blocked.push([m.index, m.index + m[0].length]);
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${t.split(' ').map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[ ]+')}(?![\\p{L}\\p{N}])`, 'gu');
  for (const m of n.matchAll(re)) {
    let start = map[m.index], end = map[m.index + m[0].length - 1] + 1;
    // a pontuação das pontas do título (ex.: "Art. 5.º (C.F.)") não entra na comparação, mas precisa ficar DENTRO do link
    const lead = (String(title).trim().match(/^[^\p{L}\p{N}]+/u) || [''])[0], trail = (String(title).trim().match(/[^\p{L}\p{N}]+$/u) || [''])[0];
    if (lead && src.slice(Math.max(0, start - lead.length), start) === lead) start -= lead.length;
    if (trail && src.slice(end, end + trail.length) === trail) end += trail.length;
    if (blocked.some(([a, b]) => start < b && end > a)) continue;
    const original = src.slice(start, end);
    const label = target ? `[[${target}|${original}]]` : `[[${original}]]`;
    return src.slice(0, start) + label + src.slice(end);
  }
  return null;
}

module.exports = { unlinkedMentions, linkify, parseLinks };
