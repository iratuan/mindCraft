'use strict';
/**
 * Links entre conteúdos com a MESMA sintaxe do Obsidian (https://help.obsidian.md/Linking%20notes%20and%20files/Internal%20links):
 *   [[Título]]              nota (tópico) com esse título: neste mapa; senão, em outro mapa do vault
 *   [[Pasta/Título]]        caminho: o nome da pasta é o mapa (ex.: [[Direito Administrativo/Atos]]); o prefixo
 *                           MindCraft/ da pasta exportada é ignorado
 *   [[Título#Seção]]        seção (cabeçalho) dentro da nota
 *   [[Título|texto]]        com texto de exibição (alias)
 * Compatibilidade: [[Mapa#Tópico]] (escrito antes, quando "#" separava mapa e tópico) continua valendo quando NÃO existe
 * nenhum mapa com o nome "Mapa" — aí o "#" passa a ser seção, como no Obsidian. Quem resolve decide (core/graph.js).
 */
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const LINK_RE = /\[\[([^\[\]\n|#]{1,200})(?:#([^\[\]\n|]{0,200}))?(?:\|([^\[\]\n]{1,200}))?\]\]/g;

/** Remove blocos ``` e `código` para não tratar exemplos de sintaxe como links. */
const stripCode = (s) => String(s ?? '').replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ');

/**
 * Forma de um link. Campos:
 *   target   o alvo como escrito (sem #seção nem |texto)       typed  o texto antes do | como escrito
 *   note     o último trecho do alvo (o título da nota)         heading  a seção (depois de #), ou null
 *   map      o pai do alvo (pasta/mapa), ou, em [[A#B]], "A"    topic   o título dentro do mapa, ou, em [[A#B]], "B"
 *   hashForm true em [[A#B]] (sem barra): vale como mapa#tópico (legado) ou como nota#seção (Obsidian)
 *   alias    o texto depois de |, ou null
 */
function shapeLink(raw, targetRaw, headingRaw, aliasRaw) {
  const target = targetRaw.trim();
  const hasHash = headingRaw !== undefined;
  const heading = hasHash ? (headingRaw.trim() || null) : null;
  const alias = aliasRaw ? aliasRaw.trim() : null;
  const typed = hasHash ? `${target}#${headingRaw.trim()}` : target;
  const parts = target.split('/').map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) {
    const note = parts[parts.length - 1];
    return { raw, target, typed, note, heading, map: parts[parts.length - 2], topic: note, hashForm: false, alias };
  }
  if (hasHash) return { raw, target, typed, note: target, heading, map: target, topic: heading, hashForm: true, alias };
  return { raw, target, typed, note: target, heading: null, map: null, topic: target, hashForm: false, alias };
}

/** @returns {ReturnType<typeof shapeLink>[]} */
function parseLinks(text) {
  const out = [];
  for (const m of stripCode(text).matchAll(LINK_RE)) {
    const a = m[1].trim();
    if (!a) continue;
    if (!a.replace(/\//g, '').trim()) continue;
    out.push(shapeLink(m[0], m[1], m[2], m[3]));
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
    if (!a.trim()) return raw;
    const r = fn(shapeLink(raw, a, b, alias));
    return r == null ? raw : r;
  });
}

/** Troca [[Alvo|texto]] por "texto" e [[Mapa#Tópico]] por "Tópico" — para Word/PDF, onde colchetes são só ruído. */
const plainLinks = (text) => rewriteLinks(text, (lk) => lk.alias || lk.topic || lk.map);

/**
 * Padroniza a sintaxe antiga: [[Mapa#Tópico]] vira [[Mapa/Tópico]] quando "Mapa" é um mapa existente (mesmo destino).
 * Não mexe em [[Nota#Seção]] (não há mapa com esse nome) nem em links para mapas inexistentes.
 * hasMap(nome) diz se existe um mapa com esse nome. Devolve { text, count }.
 */
function migrateLegacyLinks(text, hasMap) {
  let count = 0;
  const out = rewriteLinks(text, (lk) => {
    if (!lk.hashForm || !lk.map || !lk.topic || lk.map.includes('/') || !hasMap(lk.map)) return null;
    count++;
    const target = `${lk.map}/${lk.topic}`;
    return lk.alias ? `[[${target}|${lk.alias}]]` : `[[${target}]]`;
  });
  return { text: out, count };
}

module.exports = { norm, parseLinks, rewriteLinks, plainLinks, migrateLegacyLinks, LINK_RE };
