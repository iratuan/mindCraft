'use strict';
// Depuração manual no Android: abre a biblioteca, toca de verdade em "Exportar pacote…" e mostra o que aconteceu (diálogos, atividades, erros).
const { connect, sh } = require('./cdp');
const wait = (ms) => new Promise((r) => setTimeout(r, ms)); const shell = (...a) => sh('shell', ...a).stdout.trim();
(async () => {
  const c = await connect(); await c.send('Runtime.enable');
  const dpr = await c.ev('devicePixelRatio'); await c.ev(`window.__pd = []; window.addEventListener('pointerdown', (e) => window.__pd.push([e.clientX, e.clientY]), true); true`);
  shell('input', 'tap', '1000', '1000'); await wait(300); const [cx, cy] = await c.ev('window.__pd[window.__pd.length - 1]'); const offY = 1000 - cy * dpr, offX = 1000 - cx * dpr; console.log('calibração:', { dpr, offX, offY });
  await c.ev(`closeHome(); closeModal(); openLibraryModal(); true`); await wait(800);
  const r = await c.ev(`(() => { const e = document.querySelector('#libExpPack'); const b = e.getBoundingClientRect(); const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return { rect: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], onTop: top && (top.id || top.tagName), vh: innerHeight, modalScroll: document.querySelector('#modal').scrollTop }; })()`); console.log('botão:', JSON.stringify(r));
  const x = Math.round((r.rect[0] + r.rect[2] / 2) * dpr + offX), y = Math.round((r.rect[1] + r.rect[3] / 2) * dpr + offY); console.log('toque real em', x, y);
  await c.ev(`window.__sv = []; window.addEventListener('click', (e) => window.__sv.push('click:' + (e.target.id || e.target.tagName)), true); true`);
  shell('input', 'tap', String(x), String(y)); await wait(4000);
  console.log('cliques recebidos:', JSON.stringify(await c.ev('window.__sv')), '| msg:', await c.ev(`(document.querySelector('#libMsg') || {}).textContent`));
  console.log('atividade em primeiro plano:', shell('dumpsys', 'activity', 'activities').split('\n').filter((l) => /topResumedActivity/.test(l)).join(' ').trim().slice(0, 160));
  c.close(); process.exit(0);
})().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
