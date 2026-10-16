'use strict';
/**
 * Links entre conteúdos, no estilo do Obsidian, escritos no título ou nas notas de um tópico:
 *   [[Tópico]]              tópico com esse título (neste mapa; senão, em outro mapa do vault)
 *   [[Mapa#Tópico]]         tópico dentro de outro mapa (o "Mapa" é o nome do arquivo ou o título da raiz)
 *   [[Mapa]]                a raiz de outro mapa
 *   [[Tópico|texto]]        com texto de exibição (alias)
 */
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const LINK_RE = /\[\[([^\[\]\n|#]{1,200})(?:#([^\[\]\n|]{0,200}))?(?:\|([^\[\]\n]{1,200}))?\]\]/g;

/** Remove blocos ``` e `código` para não tratar exemplos de sintaxe como links. */
const stripCode = (s) => String(s ?? '').replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ');

/** @returns {{raw:string, map:string|null, topic:string|null, alias:string|null}[]} */
function parseLinks(text) {
  const out = [];
  for (const m of stripCode(text).matchAll(LINK_RE)) {
    const a = m[1].trim(), b = m[2] === undefined ? undefined : m[2].trim();
    if (!a) continue;
    if (b === undefined) out.push({ raw: m[0], map: null, topic: a, alias: m[3] ? m[3].trim() : null });
    else out.push({ raw: m[0], map: a, topic: b || null, alias: m[3] ? m[3].trim() : null });
  }
  return out;
}

/** Substitui cada link por `fn(link)` (que devolve o novo texto do link, ou null para manter o original). Respeita blocos de código. */
function rewriteLinks(text, fn) {
  const src = String(text ?? '');
  const protectedRanges = [];
  for (const m of src.matchAll(/```[\s\S]*?```|`[^`\n]*`/g)) protectedRanges.push([m.index, m.index + m[0].length]);
  return src.replace(LINK_RE, (raw, a, b, alias, offset) => {
    if (protectedRanges.some(([s, e]) => offset >= s && offset < e)) return raw;
    const A = a.trim(), B = b === undefined ? undefined : b.trim();
    const link = B === undefined ? { raw, map: null, topic: A, alias: alias ? alias.trim() : null } : { raw, map: A, topic: B || null, alias: alias ? alias.trim() : null };
    const r = fn(link);
    return r == null ? raw : r;
  });
}

/** Troca [[Alvo|texto]] por "texto" e [[Mapa#Tópico]] por "Tópico" — para Word/PDF, onde colchetes são só ruído. */
const plainLinks = (text) => rewriteLinks(text, (lk) => lk.alias || lk.topic || lk.map);

module.exports = { norm, parseLinks, rewriteLinks, plainLinks, LINK_RE };
