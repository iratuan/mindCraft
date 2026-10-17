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
function toast(message, ms = 6000) { injectStyle(); const t = document.createElement('div'); t.className = 'mchost-toast'; t.setAttribute('role', 'status'); t.textContent = String(message); document.body.append(t); setTimeout(() => t.remove(), ms); }
module.exports = { confirmBox, errorBox, toast };
