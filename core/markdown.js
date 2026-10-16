'use strict';
// Markdown das notas: renderizador próprio, pequeno e SEGURO (todo texto é escapado; só gera um conjunto fixo de tags),
// conversor para texto simples (Word/PDF) e alternância de tarefas. O texto da nota continua sendo Markdown puro.
const { rewriteLinks, plainLinks } = require('./links');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const SAFE_URL = /^(https?:\/\/|mailto:)[^\s<>"']+$/i;
const FENCE = /^\s{0,3}(```|~~~)/;
const LIST = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const TASK = /^\[( |x|X)\]\s+(.*)$/;
const TASK_LINE = /^(\s*(?:[-*+]|\d{1,9}[.)])\s+)\[( |x|X)\](\s)/;
const HR = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
const TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
const MAX_CHARS = 200000;

/** Inline: código, [[links]], [texto](url), negrito, itálico, riscado. Tudo escapado antes de virar tag. */
function inline(src) {
  const stash = [];
  const hold = (html) => { stash.push(html); return `\u0000${stash.length - 1}\u0000`; };
  let s = String(src).replace(/\u0000/g, '');
  s = s.replace(/(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/g, (_m, _t, code) => hold(`<code>${esc(code.trim())}</code>`));
  s = rewriteLinks(s, (lk) => hold(`<a href="#" class="wl" data-map="${esc(lk.map || '')}" data-topic="${esc(lk.topic == null ? '' : lk.topic)}">${esc(lk.alias || lk.topic || lk.map)}</a>`));
  s = s.replace(/!?\[([^\]\n]*)\]\(([^)\s]*)\)/g, (m, text, url) => {
    if (m.startsWith('!')) return hold(esc(text));                 // imagens não são exibidas
    return SAFE_URL.test(url) ? hold(`<a href="#" class="ext" data-url="${esc(url)}" title="${esc(url)}">${esc(text || url)}</a>`) : hold(esc(text) + ` (${esc(url)})`);
  });
  s = esc(s);
  s = s.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
    .replace(/__(?=\S)([\s\S]*?\S)__/g, '<strong>$1</strong>')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>')
    .replace(/(?<![*\w])\*(?=[^\s*])([^*\n]*?[^\s*])\*(?![*\w])/g, '<em>$1</em>')
    .replace(/(?<![\w_])_(?=[^\s_])([^_\n]*?[^\s_])_(?![\w_])/g, '<em>$1</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_m, i) => stash[Number(i)]);
}

const cells = (line) => { let t = line.trim(); if (t.startsWith('|')) t = t.slice(1); if (t.endsWith('|')) t = t.slice(0, -1); return t.split('|').map((c) => c.trim()); };

/** Markdown → HTML seguro. As caixas de tarefa levam data-task (índice na ordem do texto, igual a toggleTask). */
function mdToHtml(text) {
  const lines = String(text ?? '').slice(0, MAX_CHARS).replace(/\r\n?/g, '\n').split('\n');
  const out = []; let i = 0, task = 0;
  const isBlockStart = (l) => FENCE.test(l) || /^\s{0,3}#{1,6}\s/.test(l) || HR.test(l) || /^\s{0,3}>/.test(l) || LIST.test(l);
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (FENCE.test(l)) {                                              // bloco de código
      const mark = FENCE.exec(l)[1]; const code = []; i++;
      while (i < lines.length && !lines[i].trim().startsWith(mark)) { code.push(lines[i]); i++; }
      i++; out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`); continue;
    }
    const h = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec(l);
    if (h) { const n = Math.min(h[1].length, 4); out.push(`<h${n}>${inline(h[2])}</h${n}>`); i++; continue; }
    if (HR.test(l)) { out.push('<hr>'); i++; continue; }
    if (/^\s{0,3}>/.test(l)) {                                        // citação
      const q = []; while (i < lines.length && /^\s{0,3}>/.test(lines[i])) { q.push(lines[i].replace(/^\s{0,3}>\s?/, '')); i++; }
      out.push(`<blockquote>${q.map(inline).join('<br>')}</blockquote>`); continue;
    }
    if (l.includes('|') && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1]) && lines[i + 1].includes('-')) {   // tabela
      const head = cells(l); i += 2; const body = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes('|')) { body.push(cells(lines[i])); i++; }
      out.push('<table><thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>'
        + body.map((r) => '<tr>' + head.map((_h, k) => `<td>${inline(r[k] || '')}</td>`).join('') + '</tr>').join('') + '</tbody></table>');
      continue;
    }
    if (LIST.test(l)) {                                               // listas (com níveis por recuo e tarefas)
      const stack = []; let html = '';
      while (i < lines.length) {
        const m = LIST.exec(lines[i]); if (!m) break;
        const depth = Math.floor(m[1].replace(/\t/g, '  ').length / 2), ord = /\d/.test(m[2][0]), tag = ord ? 'ol' : 'ul';
        while (stack.length && stack[stack.length - 1].depth > depth) { html += `</li></${stack.pop().tag}>`; }
        if (stack.length && stack[stack.length - 1].depth === depth) html += '</li>';
        else { html += `<${tag}>`; stack.push({ depth, tag }); }
        const t = TASK.exec(m[3]);
        if (t) html += `<li class="task"><input type="checkbox" data-task="${task++}"${t[1] === ' ' ? '' : ' checked'}> ${inline(t[2])}`;
        else html += `<li>${inline(m[3])}`;
        i++;
      }
      while (stack.length) html += `</li></${stack.pop().tag}>`;
      out.push(html); continue;
    }
    const para = [l]; i++;                                            // parágrafo
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) { para.push(lines[i]); i++; }
    out.push(`<p>${para.map(inline).join('<br>')}</p>`);
  }
  return out.join('\n');
}

/** Alterna a n-ésima tarefa `- [ ]`/`- [x]` do texto (mesma numeração do renderizador; ignora blocos de código). */
function toggleTask(text, index) {
  const lines = String(text ?? '').split('\n'); let n = 0, fence = null;
  for (let k = 0; k < lines.length; k++) {
    const f = FENCE.exec(lines[k]);
    if (fence) { if (lines[k].trim().startsWith(fence)) fence = null; continue; }
    if (f) { fence = f[1]; continue; }
    const m = TASK_LINE.exec(lines[k]);
    if (m && n++ === index) {
      lines[k] = lines[k].replace(TASK_LINE, (_a, pre, mark, sp) => `${pre}[${mark === ' ' ? 'x' : ' '}]${sp}`); return lines.join('\n');
    }
  }
  return text;
}

/** Markdown → texto simples legível (Word/PDF): sem símbolos de formatação; [[links]] viram o texto do link. */
function mdToPlain(text) {
  const lines = String(text ?? '').replace(/\r\n?/g, '\n').split('\n'); const out = []; let fence = null;
  for (let l of lines) {
    const f = FENCE.exec(l);
    if (fence) { if (l.trim().startsWith(fence)) fence = null; else out.push('    ' + l); continue; }
    if (f) { fence = f[1]; continue; }
    if (HR.test(l)) { out.push('────────'); continue; }
    if (TABLE_SEP.test(l) && l.includes('-') && l.includes('|')) continue;
    if (l.includes('|') && /^\s*\|.*\|\s*$/.test(l)) l = cells(l).join('  |  ');
    l = l.replace(/^\s{0,3}#{1,6}\s+/, '').replace(/^\s{0,3}>\s?/, '│ ');
    l = l.replace(/^(\s*)[-*+]\s+\[( )\]\s+/, '$1☐ ').replace(/^(\s*)[-*+]\s+\[[xX]\]\s+/, '$1☑ ').replace(/^(\s*)[-*+]\s+/, '$1• ');
    l = l.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, '$1 ($2)');
    l = l.replace(/`([^`]+)`/g, '$1').replace(/\*\*(\S(?:.*?\S)?)\*\*/g, '$1').replace(/__(\S(?:.*?\S)?)__/g, '$1').replace(/~~(\S(?:.*?\S)?)~~/g, '$1')
      .replace(/(?<![*\w])\*([^\s*][^*]*?)\*(?![*\w])/g, '$1').replace(/(?<![\w_])_([^\s_][^_]*?)_(?![\w_])/g, '$1');
    out.push(l);
  }
  return plainLinks(out.join('\n'));
}

module.exports = { mdToHtml, mdToPlain, toggleTask };
