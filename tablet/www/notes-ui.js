'use strict';
/* Editor de notas em Markdown: barra de formatação + modo "Visualizar" (renderização segura).
   A nota continua sendo texto Markdown puro (compatível com Obsidian/exportações). Carregado depois de graph-ui.js. */
const MD = require(path.join(core, 'formats', 'markdown'));

const notesView = $('#notesView'), notesBar = $('#notesBar');
let notesMode = 'edit';
try { if (localStorage.getItem('mc-notes-mode') === 'view') notesMode = 'view'; } catch { /* sem storage */ }

/** Mostra o editor ou a visualização conforme o modo; chamado a cada render(). */
function refreshNotesView() {
  const isRel = !!(notesOwner && notesOwner.rel);
  notesBar.hidden = isRel;
  const view = notesMode === 'view' && !isRel;
  document.querySelectorAll('#nmEdit, #nmView').forEach((b) => { const on = (b.id === 'nmView') === view; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  document.querySelectorAll('#notesBar [data-fmt]').forEach((b) => { b.disabled = view || notes.disabled; });
  notes.hidden = view; notesView.hidden = !view;
  if (view) {
    const has = notesOwner && notes.value.trim();
    notesView.innerHTML = has ? MD.mdToHtml(notes.value) : `<div class="muted">${notesOwner ? 'Sem notas. Clique em Editar (ou dê duplo clique aqui) para escrever.' : 'Selecione um tópico.'}</div>`;
  }
}
function setNotesMode(mode) {
  commitNotes(); notesMode = mode;
  try { localStorage.setItem('mc-notes-mode', mode); } catch { /* sem storage */ }
  refreshNotesView();
  if (mode === 'edit' && !notes.disabled) notes.focus();
}
/** Abre a nota de um tópico: seleciona o tópico, mostra o painel Notas em modo de edição e põe o cursor no texto. */
function openNotesFor(id) {
  if (!map || !map.find(id)) return;
  if (!selIds.has(id) || selectedId !== id) { selIds = new Set([id]); selectedId = id; selectedRel = null; render(); }
  showPanel('notes'); setNotesMode('edit');
  setTimeout(() => { notes.focus(); notes.setSelectionRange(notes.value.length, notes.value.length); }, 0);
}
$('#nmEdit').addEventListener('click', () => setNotesMode('edit'));
$('#nmView').addEventListener('click', () => setNotesMode('view'));

// ---------- formatação ----------
/** Troca [a,b) por `text` usando o editor nativo (mantém o Ctrl+Z do texto). */
function replaceRange(a, b, text, selA, selB) {
  notes.focus(); notes.setSelectionRange(a, b);
  if (!document.execCommand('insertText', false, text)) notes.setRangeText(text, a, b, 'end');
  notes.setSelectionRange(selA, selB); commitNotes();
}
function wrap(pre, post, placeholder) {
  const v = notes.value, a = notes.selectionStart, b = notes.selectionEnd, sel = v.slice(a, b);
  let present = !!sel && v.slice(a - pre.length, a) === pre && v.slice(b, b + post.length) === post;
  if (present && pre[0] === '*') {                                   // ***x*** = negrito + itálico: *, ** e *** convivem
    let n = 0; while (v[a - 1 - n] === '*' && v[b + n] === '*') n++;
    present = pre === '*' ? n % 2 === 1 : n >= 2;
  }
  if (present) return replaceRange(a - pre.length, b + post.length, sel, a - pre.length, a - pre.length + sel.length); // desfaz
  const text = sel || placeholder;
  replaceRange(a, b, pre + text + post, a + pre.length, a + pre.length + text.length);
}
function prefixLines(kind) {
  const v = notes.value; let a = notes.selectionStart, b = notes.selectionEnd;
  const ls = v.lastIndexOf('\n', a - 1) + 1; let le = v.indexOf('\n', b > a && v[b - 1] === '\n' ? b - 1 : b); if (le < 0) le = v.length;
  const lines = v.slice(ls, le).split('\n');
  const RX = { ul: /^(\s*)[-*+]\s+(?!\[[ xX]\]\s)/, ol: /^(\s*)\d+[.)]\s+/, task: /^(\s*)[-*+]\s+\[[ xX]\]\s+/, quote: /^(\s*)>\s?/, h: /^(\s*)(#{1,6})\s+/ };
  let out;
  if (kind === 'h') {                                               // sem título → # → ## → ### → sem título
    out = lines.map((l) => { const m = RX.h.exec(l); const n = m ? m[2].length : 0; const base = l.replace(RX.h, '$1'); return n >= 3 ? base : '#'.repeat(n + 1) + ' ' + base.trimStart(); });
  } else if (lines.every((l) => !l.trim() || RX[kind].test(l))) {     // todas já têm: remove
    out = lines.map((l) => l.replace(RX[kind], '$1'));
  } else {                                                          // senão: adiciona (trocando outro tipo de lista)
    let n = 0;
    out = lines.map((l) => {
      if (!l.trim()) return l; n++;
      const clean = l.replace(RX.task, '$1').replace(RX.ul, '$1').replace(RX.ol, '$1').replace(kind === 'quote' ? RX.quote : /$^/, '$1');
      const ind = /^\s*/.exec(clean)[0], rest = clean.slice(ind.length);
      return ind + (kind === 'ul' ? '- ' : kind === 'ol' ? `${n}. ` : kind === 'task' ? '- [ ] ' : '> ') + rest;
    });
  }
  const text = out.join('\n'); replaceRange(ls, le, text, ls, ls + text.length);
}
const FMT = {
  bold: () => wrap('**', '**', 'negrito'), italic: () => wrap('*', '*', 'itálico'), strike: () => wrap('~~', '~~', 'riscado'), code: () => wrap('`', '`', 'código'),
  link: () => wrap('[[', ']]', 'Tópico'),
  url: () => { const a = notes.selectionStart, b = notes.selectionEnd, sel = notes.value.slice(a, b) || 'texto'; replaceRange(a, b, `[${sel}](https://)`, a + sel.length + 3, a + sel.length + 11); },
  h: () => prefixLines('h'), ul: () => prefixLines('ul'), ol: () => prefixLines('ol'), task: () => prefixLines('task'), quote: () => prefixLines('quote'),
};
notesBar.addEventListener('mousedown', (e) => { if (e.target.closest('[data-fmt]')) e.preventDefault(); });   // mantém o foco/seleção no texto
notesBar.addEventListener('click', (e) => { const b = e.target.closest('[data-fmt]'); if (b && !b.disabled && FMT[b.dataset.fmt]) FMT[b.dataset.fmt](); });
notes.addEventListener('keydown', (e) => {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
  const k = e.key.toLowerCase(), f = k === 'b' ? 'bold' : k === 'i' ? 'italic' : k === 'k' ? 'link' : null;
  if (f) { e.preventDefault(); e.stopPropagation(); FMT[f](); }
});

// ---------- cliques na visualização ----------
notesView.addEventListener('click', (e) => {
  const cb = e.target.closest('input[data-task]');
  if (cb) { notes.value = MD.toggleTask(notes.value, Number(cb.dataset.task)); commitNotes(); refreshNotesView(); return; }
  const wl = e.target.closest('a.wl');
  if (wl) {
    e.preventDefault();
    const g = buildGraph(gatherMaps(activeScope()).maps);
    const r = g.resolveLink({ map: wl.dataset.map || null, topic: wl.dataset.topic === '' ? null : wl.dataset.topic, alias: null }, curKey());
    const n = r && g.byId.get(r.id);
    if (!n) return;
    if (n.kind === 'ghost') setStatus(`"${n.title}" ainda não existe. Crie o tópico pelo painel Conexões.`); else openTopic(n);
    return;
  }
  const ext = e.target.closest('a.ext');
  if (ext) { e.preventDefault(); ipcRenderer.invoke('open-external', ext.dataset.url); }
});
notesView.addEventListener('dblclick', (e) => { if (!e.target.closest('a, input')) setNotesMode('edit'); });

// Preview de link [[...]] ao passar o mouse
let linkTip = null;
notesView.addEventListener('mouseover', (e) => {
  const wl = e.target.closest('a.wl');
  if (!wl) { if (linkTip) { linkTip.remove(); linkTip = null; } return; }
  if (linkTip) return;
  const g = buildGraph(gatherMaps(activeScope()).maps);
  const r = g.resolveLink({ map: wl.dataset.map || null, topic: wl.dataset.topic === '' ? null : wl.dataset.topic, alias: null }, curKey());
  const node = r && g.byId.get(r.id);
  if (!node || node.kind === 'ghost') return;
  const note = node.map && node.id ? (node.map.topics?.get(node.title)?.[0]?.notes || '') : '';
  linkTip = document.createElement('div');
  linkTip.className = 'link-preview';
  linkTip.style.cssText = 'position:fixed;z-index:50;max-width:320px;max-height:200px;overflow:auto;padding:8px 10px;background:var(--bg-panel);border:1px solid var(--line-soft);border-radius:8px;box-shadow:var(--shadow);font-size:12px;color:var(--text);pointer-events:none;';
  const title = document.createElement('div');
  title.style.cssText = 'font-weight:700;color:var(--text-strong);margin-bottom:4px;';
  title.textContent = node.title || 'Sem título';
  linkTip.appendChild(title);
  const preview = document.createElement('div');
  preview.textContent = (node.notes || '').slice(0, 300) || 'Sem notas.';
  preview.style.cssText = 'color:var(--text-dim);white-space:pre-wrap;';
  linkTip.appendChild(preview);
  document.body.appendChild(linkTip);
  const rect = wl.getBoundingClientRect();
  linkTip.style.left = Math.min(rect.left, window.innerWidth - 340) + 'px';
  linkTip.style.top = (rect.bottom + 6) + 'px';
});
notesView.addEventListener('mouseout', (e) => {
  if (!e.target.closest('a.wl') && linkTip) { linkTip.remove(); linkTip = null; }
});

refreshNotesView();
