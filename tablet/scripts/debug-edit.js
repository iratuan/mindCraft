'use strict';
// Depuração manual (Android): editar um nó na parte de baixo da tela com o teclado virtual e fechar a rede com o Voltar, mostrando cada passo.
const { connect, sh } = require('./cdp');
const wait = (ms) => new Promise((r) => setTimeout(r, ms)); const shell = (...a) => sh('shell', ...a).stdout.trim();
const ime = () => /mInputShown=true/.test(shell('dumpsys', 'input_method'));
(async () => {
  const c = await connect(); const ev = (x) => c.ev(x); const dpr = await ev('devicePixelRatio');
  await ev(`window.__pd = []; window.addEventListener('pointerdown', (e) => window.__pd.push([e.clientX, e.clientY]), true); true`); shell('input', 'tap', '1000', '1000'); await wait(300);
  const [cx, cy] = await ev('window.__pd[window.__pd.length - 1]'); const offY = 1000 - cy * dpr;
  const dev = (x, y) => [Math.round(x * dpr), Math.round(y * dpr + offY)];
  await ev(`closeHome(); closeModal(); dirty = false; newMap(); (() => { const p = map.root.children[2]; for (let i = 0; i < 7; i++) map.addChild(p.id, 'Item ' + i); })(); fit(); true`); await wait(800);
  const low = await ev(`(() => { let best = null, by = -1; map.walk((n) => { const el = document.querySelector('[data-id="' + n.id + '"]'); if (el) { const r = el.getBoundingClientRect(); if (r.bottom > by) { by = r.bottom; best = n.title; } } }); return best; })()`);
  const [nx, ny] = await ev(`(() => { let id; map.walk((n) => { if (n.title === ${JSON.stringify(low)} && !id) id = n.id; }); const r = document.querySelector('[data-id="' + id + '"]').getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; })()`);
  console.log('nó mais baixo:', low, 'em (css)', nx, ny, '| vh', await ev('innerHeight'));
  const [dx, dy] = dev(nx, ny); shell('input tap ' + dx + ' ' + dy + '; input tap ' + dx + ' ' + dy); await wait(2500);
  console.log('após duplo toque: editor aberto =', await ev('!editor.hidden'), '| teclado =', ime(), '| vh =', await ev('innerHeight'), '| vv.height =', await ev('visualViewport.height'));
  console.log('retângulos:', JSON.stringify(await ev(`(() => { const ed = editor.getBoundingClientRect(), nd = document.querySelector('[data-id="' + selectedId + '"]').getBoundingClientRect(); return { ed: [Math.round(ed.top), Math.round(ed.bottom)], nd: [Math.round(nd.top), Math.round(nd.bottom)] }; })()`)));
  shell('input', 'text', 'Abc'); await wait(900); console.log('digitou:', await ev('editor.value'));
  shell('input', 'keyevent', '66'); await wait(900); console.log('após Enter: editor aberto =', await ev('!editor.hidden'), '| teclado =', ime(), '| títulos:', JSON.stringify(await ev(`(() => { const r = []; map.walk((n) => r.push(n.title)); return r.slice(-4); })()`)));
  // rede + Voltar
  await ev(`closeModal(); true`); const [gx, gy] = await ev(`(() => { const r = document.querySelector('#rail [data-act="graph"]').getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; })()`); const [gdx, gdy] = dev(gx, gy); shell('input', 'tap', String(gdx), String(gdy)); await wait(2000);
  console.log('rede aberta =', await ev('graphOpen'), '| #graph visível =', await ev(`(() => { const e = document.querySelector('#graph'); return !e.hidden && (e.offsetWidth > 0); })()`));
  shell('input', 'keyevent', '4'); await wait(1500); console.log('após Voltar: rede aberta =', await ev('graphOpen'), '| app em primeiro plano =', /app\.mindcraft/.test(shell('dumpsys', 'activity', 'activities').split('\n').filter((l) => /topResumedActivity/.test(l)).join(' ')));
  c.close(); process.exit(0);
})().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
