'use strict';
// Depuração manual: duplo toque real num tópico e digitação pelo teclado do Android; mostra o que o editor recebeu e o estado do teclado.
const { connect, sh } = require('./cdp');
const wait = (ms) => new Promise((r) => setTimeout(r, ms)); const shell = (...a) => sh('shell', ...a).stdout.trim();
(async () => {
  const c = await connect(); const dpr = await c.ev('devicePixelRatio');
  await c.ev(`closeHome(); closeModal(); dirty = false; newMap(); fit(); window.__pd = []; window.addEventListener('pointerdown', (e) => window.__pd.push([e.clientX, e.clientY]), true); true`); await wait(500);
  shell('input', 'tap', '1000', '1000'); await wait(300); const [cx, cy] = await c.ev('window.__pd[window.__pd.length - 1]'); const offY = 1000 - cy * dpr;
  const [nx, ny] = await c.ev(`(() => { let id; map.walk((n) => { if (n.title === 'Tópico 1' && !id) id = n.id; }); const r = document.querySelector('[data-id="' + id + '"]').getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; })()`);
  const X = Math.round(nx * dpr), Y = Math.round(ny * dpr + offY); shell('input tap ' + X + ' ' + Y + '; input tap ' + X + ' ' + Y);
  await wait(1500);
  const st = async (label) => console.log(label.padEnd(34), JSON.stringify(await c.ev(`({ editorOpen: !editor.hidden, value: editor.value, focused: document.activeElement && document.activeElement.id, selStart: editor.selectionStart, selEnd: editor.selectionEnd })`)), '| IME:', /mInputShown=true/.test(shell('dumpsys', 'input_method')));
  await st('depois do duplo toque');
  shell('input', 'text', 'Abc'); await wait(800); await st('depois de "input text Abc"');
  shell('input', 'keyevent', '29', '30', '31'); await wait(800); await st('depois de keyevent a b c');   // KEYCODE_A,B,C
  console.log('janela com foco:', shell('dumpsys', 'window').split('\n').filter((l) => /mCurrentFocus/.test(l)).join(' ').trim().slice(0, 140));
  console.log('IME ativo:', shell('settings', 'get', 'secure', 'default_input_method'), '| teclado físico mostra IME:', shell('settings', 'get', 'secure', 'show_ime_with_hard_keyboard'));
  c.close(); process.exit(0);
})().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
