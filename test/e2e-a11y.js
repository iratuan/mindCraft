'use strict';
// Acessibilidade das janelas: papel de diálogo, foco inicial, Tab preso na janela e foco devolvido a quem a abriu; tela inicial com foco e rótulos.
const start = require('./harness');
const { writeMom } = require('../core/mom');
const path = require('path');
const { concurso, TODAY } = require('./fixtures');

(async () => {
  const c = await start('MindCraft e2e — acessibilidade (foco, teclado, rótulos)');
  const { js, wait, eq, ok, t, TMP } = c;
  const file = path.join(TMP, 'concurso.mom'); writeMom(concurso().m, file);
  await js(`window.__today = '${TODAY}'; dirty = false; openPath(${JSON.stringify(file)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(file)}`)); await wait(300);
  await js(`(() => { const b = document.createElement('button'); b.id = 'opener'; b.textContent = 'abridor'; b.style.cssText = 'position:fixed;left:2px;bottom:2px;z-index:1'; document.body.appendChild(b); return true; })()`);
  const key = (k, o = {}) => js(`(document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: ${JSON.stringify(k)}, bubbles: true, cancelable: true, shiftKey: ${!!o.shift} }))`);
  const state = () => js(`(() => { const m = document.querySelector('#modal'), box = m.querySelector('.modal-box'); const f = [...box.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled])')].filter((e) => e.offsetWidth || e.offsetHeight); const a = document.activeElement; return { role: m.getAttribute('role'), modal: m.getAttribute('aria-modal'), label: m.getAttribute('aria-label'), inside: box.contains(a), idx: f.indexOf(a), n: f.length, firstId: f[0] && (f[0].id || f[0].tagName), lastId: f[f.length - 1] && (f[f.length - 1].id || f[f.length - 1].tagName), active: a && (a.id || a.tagName) }; })()`);
  const focusIdx = (which) => js(`(() => { const box = document.querySelector('#modal .modal-box'); const f = [...box.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled])')].filter((e) => e.offsetWidth || e.offsetHeight); (${which === 'last' ? 'f[f.length - 1]' : 'f[0]'}).focus(); return true; })()`);

  const modals = { 'biblioteca': [`openLibraryModal()`, '#libBox'], 'importar CSV': [`act.csv()`, '#csvBox'], 'planilha': [`act.plan()`, '#planBox'], 'revisão do dia': [`act.review()`, '#rvBox'], 'atalhos (F1)': [`act.help()`, '#keysBox'], 'simulado': [`act.simulado()`, '#simBox'] };
  for (const [name, [open, sel]] of Object.entries(modals)) {
    await t(`${name}: papel de diálogo, foco inicial dentro, Tab/Shift+Tab presos, Esc fecha e devolve o foco`, async () => {
      await js(`document.querySelector('#opener').focus(); true`); eq(await js(`document.activeElement.id`), 'opener');
      await js(open); await c.waitFor(() => js(`!!document.querySelector(${JSON.stringify(sel)})`)); await wait(150);
      let s = await state(); eq([s.role, s.modal], ['dialog', 'true']); ok(s.label && s.label.length > 3, 'rótulo: ' + s.label); ok(s.inside, 'foco inicial dentro da janela: ' + s.active); ok(s.n >= 1, 'tem controles focáveis');
      await focusIdx('last'); await key('Tab'); s = await state(); eq(s.idx, 0, 'Tab no último vai ao primeiro');
      if (s.n > 1) { await key('Tab', { shift: true }); s = await state(); eq(s.idx, s.n - 1, 'Shift+Tab no primeiro vai ao último'); }
      await js(`document.body.focus(); document.activeElement.blur(); true`); await key('Tab'); s = await state(); ok(s.inside, 'Tab com o foco fora traz o foco para a janela');
      await js(`document.querySelector('#modal').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`); await wait(200);
      eq(await js(`document.querySelector('#modal').hidden`), true); eq(await js(`document.activeElement.id`), 'opener', 'foco devolvido a quem abriu');
    });
  }

  await t('versões (aberta pela biblioteca): foco dentro e "Voltar" mantém a janela com foco', async () => {
    if (!(await js(`(getLibrary() ? getLibrary().listMaps().length : 0)`))) await js(`moveToLibrary()`);
    await js(`openLibraryModal()`); await c.waitFor(() => js(`!!document.querySelector('#libList [data-act="versions"]')`));
    await js(`const r = document.querySelector('#libList [data-act="versions"]'); r && r.click(); true`); await c.waitFor(() => js(`!!document.querySelector('#verBox')`)); let s = await state(); ok(s.inside, 'foco dentro (versões): ' + s.active);
    await js(`document.querySelector('#verBack').click()`); await c.waitFor(() => js(`!!document.querySelector('#libBox')`)); await wait(150); s = await state(); ok(s.inside, 'foco dentro ao voltar: ' + s.active); await js('closeModal(); true');
  });

  await t('tela inicial: foco no atalho principal ao abrir; botões com nome acessível; Esc fecha', async () => {
    await js(`act.home(true)`); await c.waitFor(() => js(`!!document.querySelector('#home .hm')`)); await wait(200);
    ok(await js(`document.querySelector('#home').contains(document.activeElement)`), 'foco dentro da tela inicial: ' + await js('document.activeElement.id || document.activeElement.tagName'));
    const unnamed = await js(`[...document.querySelectorAll('#home button, #home select')].filter((b) => !(b.textContent || '').trim() && !b.getAttribute('aria-label') && !b.title).map((b) => b.className)`); eq(unnamed, [], 'botões sem nome acessível');
    await js(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`); await wait(150); eq(await js(`document.querySelector('#home').hidden`), true);
  });

  await t('controles sem texto têm nome acessível nas telas principais (barra, painéis, leitor de PDF, painel de estudos)', async () => {
    const lacking = () => js(`[...document.querySelectorAll('button, select, input:not([type=hidden])')].filter((e) => (e.offsetWidth || e.offsetHeight) && !(e.textContent || '').trim() && !e.getAttribute('aria-label') && !e.title && !e.placeholder && !(e.labels && e.labels.length) && !e.closest('label')).map((e) => (e.id || e.className || e.tagName) + '/' + (e.closest('[id]') || {}).id)`);
    eq(await lacking(), [], 'janela principal');
    await js('act.dash()'); await wait(300); eq(await lacking(), [], 'painel de estudos'); await js('closeDash(); act.pdf()'); await c.waitFor(() => js(`!!document.querySelector('#pdfOpen')`)); eq(await lacking(), [], 'leitor de PDF'); await js('act.pdf()');
  });

  await t('REGRESSÃO: com janela/tela inicial abertas ou foco nos painéis, Tab/Delete/Enter/setas NÃO mexem no mapa (antes Tab criava tópicos e Delete podia apagar)', async () => {
    const snap = () => js(`JSON.stringify([map.root, map.meta.relations]) + '|' + map._undo.length`);
    const press = async (target) => { for (const k of ['Tab', 'Delete', 'Backspace', 'Enter', 'ArrowDown', 'ArrowRight', ' ']) await js(`(${target}).dispatchEvent(new KeyboardEvent('keydown', { key: ${JSON.stringify(k)}, bubbles: true, cancelable: true }))`); await wait(150); };
    await js(`closeHome(); closeModal(); __md(__id('Crase')); true`); await wait(150); const base = await snap();
    await js(`openLibraryModal()`); await c.waitFor(() => js(`!!document.querySelector('#libList')`)); await press(`document.querySelector('#libClose')`); eq(await snap(), base, 'janela da biblioteca'); await js('closeModal()');
    await js(`act.simulado()`); await c.waitFor(() => js(`!!document.querySelector('#simBox')`)); await press(`document.querySelector('#simCancel')`); eq(await snap(), base, 'janela de simulado'); await js('closeModal()');
    await js(`act.home(true)`); await c.waitFor(() => js(`!!document.querySelector('#home .hm')`)); await press(`document.querySelector('#hmClose')`); await press('document.body'); eq(await snap(), base, 'tela inicial'); await js('closeHome()');
    await js(`showPanel('study')`); await press(`document.querySelector('#studyWeight')`); eq(await snap(), base, 'select do painel Estudo'); await press(`document.querySelector('#ptabs .ptab')`); eq(await snap(), base, 'abas dos painéis');
    await js(`act.pdf()`); await c.waitFor(() => js(`!!document.querySelector('#pdfOpen')`)); await press(`document.querySelector('#pdfOpen')`); eq(await snap(), base, 'botões do leitor de PDF'); await js('act.pdf()');
    // controle positivo: com o foco no mapa, Tab continua criando um tópico filho
    await js(`document.body.focus(); __key('Tab'); true`); await wait(150); ok((await snap()) !== base, 'Tab no mapa cria tópico (atalho preservado)'); ok(await js('!editor.hidden'), 'editor aberto'); await js(`__key('Escape', editor); act.undo(); true`);
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
