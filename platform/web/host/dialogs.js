'use strict';
/** Diálogos próprios (no lugar dos diálogos nativos do Windows): confirmação com botões e erro. Teclado, foco e leitor de tela. */
let chain = Promise.resolve();
let seq = 0;

function injectStyle() {
  if (document.getElementById('mcHostStyle')) return;
  const s = document.createElement('style'); s.id = 'mcHostStyle';
  s.textContent = `
  .mchost-ov { position: fixed; inset: 0; z-index: 100000; background: rgba(0,0,0,.55); display: grid; place-items: center; padding: 16px; }
  .mchost-box { background: var(--bg-panel, #2b2b2b); color: var(--text, #e8e8e8); border: 1px solid var(--line-soft, #444); border-radius: 14px; padding: 18px 20px; width: min(440px, 100%); box-shadow: 0 12px 40px rgba(0,0,0,.5); font: 14px system-ui, sans-serif; }
  .mchost-box h2 { margin: 0 0 6px; font-size: 16px; color: var(--text-strong, #fff); } .mchost-box p { margin: 4px 0; white-space: pre-wrap; overflow-wrap: anywhere; } .mchost-box .d { color: var(--text-dim, #aaa); font-size: 13px; }
  .mchost-btns { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; margin-top: 16px; }
  .mchost-btns button { min-height: 44px; min-width: 88px; padding: 0 16px; border-radius: 10px; border: 1px solid var(--line-soft, #555); background: var(--bg-active, #3a3a3a); color: inherit; font: inherit; cursor: pointer; }
  .mchost-btns button.def { background: var(--accent, #2f7cf6); border-color: transparent; color: #fff; }
  .mchost-box label.f { display: block; margin: 12px 0 4px; font-size: 13px; color: var(--text-dim, #aaa); }
  .mchost-box input[type=text] { width: 100%; box-sizing: border-box; min-height: 44px; padding: 0 12px; border-radius: 10px; border: 1px solid var(--line-soft, #555); background: var(--bg-field, #1f1f1f); color: inherit; font: inherit; }
  .mchost-opt { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; margin-top: 8px; border: 1px solid var(--line-soft, #444); border-radius: 10px; cursor: pointer; min-height: 44px; }
  .mchost-opt input { margin-top: 3px; width: 20px; height: 20px; } .mchost-opt b { display: block; } .mchost-opt span.d { display: block; color: var(--text-dim, #aaa); font-size: 12.5px; }
  .mchost-opt:has(input:checked) { border-color: var(--accent, #2f7cf6); background: rgba(47,124,246,.12); }
  .mchost-toast.ok { background: #1f6b3a; }
  .mchost-toast { position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); z-index: 100001; background: #7a1f1f; color: #fff; padding: 10px 16px; border-radius: 10px; font: 13px system-ui, sans-serif; max-width: min(560px, 92vw); }
  `;
  document.head.append(s);
}

/** Mostra um diálogo e devolve o índice do botão escolhido (Esc = cancelId). Vários pedidos esperam a vez. */
function confirmBox({ title = 'MindCraft', message = '', detail = '', buttons = ['OK'], defaultId = 0, cancelId = buttons.length - 1 } = {}) {
  const run = () => new Promise((resolve) => {
    injectStyle(); const id = ++seq, prev = document.activeElement;
    const ov = document.createElement('div'); ov.className = 'mchost-ov'; ov.dataset.mcDialog = String(id);
    const box = document.createElement('div'); box.className = 'mchost-box'; box.setAttribute('role', 'alertdialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'mchost-t' + id); box.setAttribute('aria-describedby', 'mchost-m' + id);
    const h = document.createElement('h2'); h.id = 'mchost-t' + id; h.textContent = String(title);
    const p = document.createElement('p'); p.id = 'mchost-m' + id; p.textContent = String(message);
    box.append(h, p); if (detail) { const d = document.createElement('p'); d.className = 'd'; d.textContent = String(detail); box.append(d); }
    const row = document.createElement('div'); row.className = 'mchost-btns'; const els = [];
    buttons.forEach((label, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = String(label); b.dataset.idx = String(i); if (i === defaultId) b.className = 'def'; b.onclick = () => done(i); row.append(b); els.push(b); });
    box.append(row); ov.append(box); document.body.append(ov);
    function done(i) { ov.remove(); document.removeEventListener('keydown', onKey, true); try { if (prev && prev.focus) prev.focus(); } catch { /* sem foco anterior */ } resolve(i); }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(cancelId); }
      else if (e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); const i = els.indexOf(document.activeElement); els[(i + (e.shiftKey ? -1 : 1) + els.length) % els.length].focus(); }
      else e.stopPropagation();                                   // o resto do teclado pertence ao diálogo, não ao mapa por baixo
    }
    document.addEventListener('keydown', onKey, true); (els[defaultId] || els[0]).focus();
  });
  const p = chain.then(run, run); chain = p.then(() => {}, () => {}); return p;
}
const errorBox = (message) => confirmBox({ title: 'MindCraft', message: String(message), buttons: ['OK'], defaultId: 0, cancelId: 0 });
function toast(message, ms = 6000, kind = 'err') { injectStyle(); const t = document.createElement('div'); t.className = 'mchost-toast' + (kind === 'ok' ? ' ok' : ''); t.setAttribute('role', 'status'); t.textContent = String(message); document.body.append(t); setTimeout(() => t.remove(), ms); }
/**
 * "Salvar como": a pessoa EDITA O NOME do arquivo e ESCOLHE O DESTINO. `options` = [{ id, label, detail }] (a 1ª é a padrão).
 * Devolve { name, dest } ou null se cancelou. Enter confirma, Esc cancela. `window.__mcSaveAsAuto` (testes) aceita o padrão sem mostrar a janela.
 */
function saveAsBox({ title = 'Salvar como', name = '', options = [], confirmLabel = 'Salvar' } = {}) {
  if (window.__mcSaveAsAuto) return Promise.resolve({ name, dest: options[0] && options[0].id });
  const run = () => new Promise((resolve) => {
    injectStyle(); const id = ++seq, prev = document.activeElement;
    const ov = document.createElement('div'); ov.className = 'mchost-ov'; ov.dataset.mcDialog = String(id); ov.dataset.mcSaveas = '1';
    const box = document.createElement('div'); box.className = 'mchost-box'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'mchost-t' + id);
    const h = document.createElement('h2'); h.id = 'mchost-t' + id; h.textContent = title;
    const lab = document.createElement('label'); lab.className = 'f'; lab.htmlFor = 'mchost-n' + id; lab.textContent = 'Nome do arquivo';
    const inp = document.createElement('input'); inp.type = 'text'; inp.id = 'mchost-n' + id; inp.value = name; inp.maxLength = 120; inp.autocomplete = 'off'; inp.spellcheck = false; inp.setAttribute('aria-label', 'Nome do arquivo');
    box.append(h, lab, inp);
    const group = document.createElement('div'); group.setAttribute('role', 'radiogroup'); group.setAttribute('aria-label', 'Onde salvar');
    const lg = document.createElement('label'); lg.className = 'f'; lg.textContent = 'Onde salvar'; box.append(lg);
    options.forEach((o, i) => {
      const l = document.createElement('label'); l.className = 'mchost-opt'; const r = document.createElement('input'); r.type = 'radio'; r.name = 'mchost-dest' + id; r.value = o.id; r.checked = i === 0;
      const t = document.createElement('div'); const b = document.createElement('b'); b.textContent = o.label; t.append(b); if (o.detail) { const d = document.createElement('span'); d.className = 'd'; d.textContent = o.detail; t.append(d); }
      l.append(r, t); group.append(l);
    });
    box.append(group);
    const row = document.createElement('div'); row.className = 'mchost-btns'; const bc = document.createElement('button'); bc.type = 'button'; bc.textContent = 'Cancelar'; bc.dataset.act = 'cancel';
    const bs = document.createElement('button'); bs.type = 'button'; bs.className = 'def'; bs.textContent = confirmLabel; bs.dataset.act = 'ok'; row.append(bc, bs); box.append(row); ov.append(box); document.body.append(ov);
    const val = () => ({ name: inp.value.trim(), dest: (box.querySelector('input[type=radio]:checked') || {}).value });
    function done(r) { ov.remove(); document.removeEventListener('keydown', onKey, true); try { if (prev && prev.focus) prev.focus(); } catch { /* sem foco anterior */ } resolve(r); }
    bc.onclick = () => done(null); bs.onclick = () => { const v = val(); if (!v.name) { inp.focus(); return; } done(v); };
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(null); }
      else if (e.key === 'Enter' && document.activeElement === inp) { e.preventDefault(); e.stopPropagation(); bs.click(); }
      else if (e.key === 'Tab') { const f = [inp, ...box.querySelectorAll('input[type=radio]:checked'), bc, bs]; e.preventDefault(); e.stopPropagation(); const i = f.indexOf(document.activeElement); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
      else if (!/^(Arrow|Home|End| )/.test(e.key) || document.activeElement === inp) e.stopPropagation();
    }
    document.addEventListener('keydown', onKey, true);
    // teclado/mouse: foco no nome, com só o nome selecionado (sem a extensão). Toque: NÃO foca o campo (o teclado virtual subiria sozinho e cobriria a janela): o foco vai ao botão Salvar e basta tocar no nome para editar.
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) bs.focus(); else { inp.focus(); const dot = inp.value.lastIndexOf('.'); inp.setSelectionRange(0, dot > 0 ? dot : inp.value.length); }
  });
  const p = chain.then(run, run); chain = p.then(() => {}, () => {}); return p;
}
module.exports = { confirmBox, errorBox, toast, saveAsBox };
