'use strict';
// Depuração manual (Android), parte 2: duplo toque real num nó da rede (abre o tópico) e toque no ✎.
const { connect, sh } = require('./cdp');
const wait = (ms) => new Promise((r) => setTimeout(r, ms)); const shell = (...a) => sh('shell', ...a).stdout.trim();
(async () => {
  const c = await connect(); const ev = (x) => c.ev(x); const dpr = await ev('devicePixelRatio'); const offY = 48; const dev = (x, y) => [Math.round(x * dpr), Math.round(y * dpr + offY)];
  await ev(`closeHome(); closeModal(); closeGraph(); dirty = false; newMap(); map.root.children.forEach((c, i) => map.addChild(c.id, 'Sub ' + i)); render(); fit(); window.__cnt = { goTo: 0 }; const gt = goTo; goTo = function () { window.__cnt.goTo++; return gt.apply(this, arguments); }; window.__pd = []; window.addEventListener('pointerdown', (e) => window.__pd.push([Math.round(e.clientX), Math.round(e.clientY), (e.target.id || e.target.tagName)]), true); true`); await wait(600);
  shell('input', 'tap', ...dev(31, 511).map(String)); await wait(2000); console.log('rede aberta:', await ev('graphOpen'));
  const [x, y] = await ev(`(() => { const i = gLast.nodes.findIndex((n) => n.title === 'Tópico 3'); const r = document.querySelector('.gn[data-i="' + i + '"] circle').getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; })()`);
  const [dx, dy] = dev(x, y); shell('input tap ' + dx + ' ' + dy + '; input tap ' + dx + ' ' + dy); await wait(2500);
  console.log('após duplo toque: rede aberta =', await ev('graphOpen'), '| goTo =', await ev('window.__cnt.goTo'), '| selecionado =', await ev('selectedId && map.find(selectedId) && map.find(selectedId).node.title'), '| toques:', JSON.stringify(await ev('window.__pd.slice(-3)')));
  const e = await ev(`(() => { const r = document.querySelector('#tbEdit').getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2), Math.round(r.width), getComputedStyle(document.querySelector('#tbEdit')).display]; })()`); console.log('✎ em (css):', JSON.stringify(e));
  const [ex, ey] = dev(e[0], e[1]); shell('input', 'tap', String(ex), String(ey)); await wait(2500);
  console.log('após tocar ✎: editor aberto =', await ev('!editor.hidden'), '| valor =', await ev('editor.value'), '| toques:', JSON.stringify(await ev('window.__pd.slice(-2)')), '| menu aberto =', await ev(`!document.querySelector('#mcHostMenu').hidden`));
  const ime = () => /mInputShown=true/.test(shell('dumpsys', 'input_method')); console.log('teclado =', ime(), '| ligado ao editor =', /mBoundToMethod=true/.test(shell('dumpsys', 'input_method')));
  await wait(2000); shell('input', 'text', 'Direito%sPenal'); await wait(1500); console.log('após digitar: valor =', JSON.stringify(await ev('editor.value')), '| aberto =', await ev('!editor.hidden'));
  shell('input', 'keyevent', '66'); await wait(1500); console.log('após Enter: aberto =', await ev('!editor.hidden'), '| títulos =', JSON.stringify(await ev('(() => { const r = []; map.walk((n) => r.push(n.title)); return r; })()')), '| IME =', ime());
  c.close(); process.exit(0);
})().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
