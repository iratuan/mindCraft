'use strict';
// Depuração manual (Android): abre a rede por toque real na barra lateral e mostra o que acontece.
const { connect, sh } = require('./cdp');
const wait = (ms) => new Promise((r) => setTimeout(r, ms)); const shell = (...a) => sh('shell', ...a).stdout.trim();
(async () => {
  const c = await connect(); const ev = (x) => c.ev(x); const dpr = await ev('devicePixelRatio');
  await ev(`window.__pd = []; window.__cl = []; window.addEventListener('pointerdown', (e) => window.__pd.push([Math.round(e.clientX), Math.round(e.clientY), (e.target.id || e.target.tagName) + '.' + (e.target.getAttribute && e.target.getAttribute('class') || '')]), true); window.addEventListener('click', (e) => window.__cl.push((e.target.closest && e.target.closest('[data-act]') ? e.target.closest('[data-act]').dataset.act : e.target.tagName)), true); true`); shell('input', 'tap', '1000', '1000'); await wait(300);
  const [, cy] = await ev('window.__pd[window.__pd.length - 1]'); const offY = 1000 - cy * dpr; console.log('calibração offY =', offY);
  await ev(`closeHome(); closeModal(); dirty = false; newMap(); map.root.children.forEach((c, i) => map.addChild(c.id, 'Sub ' + i)); render(); fit(); true`); await wait(600);
  const r = await ev(`(() => { const out = {}; for (const a of ['graph', 'fit', 'pdf', 'dash']) { const b = document.querySelector('#rail [data-act="' + a + '"]').getBoundingClientRect(); out[a] = [Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2)]; } out.rail = (() => { const q = document.querySelector('#rail').getBoundingClientRect(); return [Math.round(q.top), Math.round(q.bottom)]; })(); out.vh = innerHeight; return out; })()`); console.log('posições (css):', JSON.stringify(r));
  const [gx, gy] = r.graph; const dx = Math.round(gx * dpr), dy = Math.round(gy * dpr + offY); console.log('tocando em (dispositivo)', dx, dy); shell('input', 'tap', String(dx), String(dy)); await wait(2500);
  console.log('toques recebidos:', JSON.stringify(await ev('window.__pd.slice(-2)')), '| cliques em:', JSON.stringify(await ev('window.__cl')), '| graphOpen =', await ev('graphOpen'), );
  c.close(); process.exit(0);
})().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
