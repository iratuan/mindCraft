'use strict';
// Ponta a ponta: registrar simulados, evolução no Painel de estudos, validações, desfazer, persistência, relatório e tela inicial.
const fs = require('fs');
const path = require('path');
const start = require('./harness');
const { writeMom, readMom } = require('../core/mom');
const { TODAY, d, concurso } = require('./fixtures');

(async () => {
  const c = await start('MindCraft e2e — simulados');
  const { js, wait, eq, ok, t, TMP } = c;
  const txt = (s) => js(`document.querySelector(${JSON.stringify(s)}).textContent`);
  const click = (s) => js(`document.querySelector(${JSON.stringify(s)}).click()`);
  const setNative = (sel, v) => js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, ${JSON.stringify(v)}); e.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  const fill = async (disc, done, ok_) => { const sel = `.sim-row[data-disc="${disc}"]`; await setNative(`${sel} .sim-done`, String(done)); await setNative(`${sel} .sim-ok`, String(ok_)); };
  const file = path.join(TMP, 'concurso.mom'); writeMom(concurso().m, file);
  const open = async () => { await js(`window.__today = '${TODAY}'; dirty = false; openPath(${JSON.stringify(file)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(file)}`)); await wait(200); };
  const openModal = async () => { await js('act.simulado()'); await c.waitFor(() => js(`!!document.querySelector('#simBox')`)); };
  const study = (title) => js(`(() => { let r; map.walk((n) => { if (n.title === ${JSON.stringify(title)}) r = n; }); return r.study; })()`);
  const qOf = async (title) => ((await study(title)) || { q: { done: 0, correct: 0 } }).q;
  const sims = () => js(`map.meta.simulados || []`);

  await t('Painel de estudos sem simulados: texto amigável; o botão abre o registro (e fecha o painel)', async () => {
    await open(); await js('act.dash()'); await wait(300); ok((await txt('#simSec')).includes('Simulados (0)') && (await txt('#simSec')).includes('Nenhum simulado registrado'), await txt('#simSec'));
    await click('#btnSim'); await c.waitFor(() => js(`!!document.querySelector('#simBox')`)); eq(await js(`document.querySelector('#dash').hidden`), true); eq(await js(`document.querySelector('#simBox').dataset.ui`), 'react');
  });

  await t('formulário: nome e data sugeridos, uma linha por disciplina do mapa, total ao vivo', async () => {
    eq(await js(`document.querySelector('#simName').value`), 'Simulado 1'); eq(await js(`document.querySelector('#simDate').value`), TODAY);
    eq(await js(`[...document.querySelectorAll('.sim-row[data-node]')].map((r) => r.dataset.disc)`), ['Língua Portuguesa', 'Direito Constitucional', 'Direito Administrativo', 'Informática']); eq(await txt('#simTotal'), 'Total: —');
    await fill('Língua Portuguesa', 20, 15); await fill('Direito Constitucional', 20, 10); eq(await txt('#simTotal'), 'Total: 25/40 (62,5%)');
    eq(await js(`document.querySelector('#simAdd').checked`), true, 'somar às questões vem marcado');
  });

  await t('validações com mensagem clara e sem gravar nada: vazio, acertos > feitas, data apagada, decimais', async () => {
    await js(`document.querySelectorAll('.sim-row .sim-done, .sim-row .sim-ok').forEach((e) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, ''); e.dispatchEvent(new Event('input', { bubbles: true })); })`);
    await click('#simSave'); ok((await txt('#simMsg')).includes('pelo menos uma disciplina'), await txt('#simMsg'));
    await fill('Informática', 5, 9); await click('#simSave'); ok((await txt('#simMsg')).includes('não podem superar'), await txt('#simMsg'));
    await fill('Informática', '2,5', 1); await click('#simSave'); ok((await txt('#simMsg')).includes('inteiro'), await txt('#simMsg'));
    await fill('Informática', 5, 3); await setNative('#simDate', ''); await click('#simSave'); ok((await txt('#simMsg')).includes('data'), await txt('#simMsg'));
    eq(await sims(), [], 'nada foi gravado'); eq(await js('dirty'), false); eq(await js(`!!document.querySelector('#simBox')`), true, 'o formulário continua aberto');
  });

  await t('registrar: grava o simulado, soma às questões das disciplinas, é UM desfazer e aparece no painel (gráfico, resumo, ranking, lista)', async () => {
    await setNative('#simDate', d(-14)); await setNative('#simName', 'Simulado TRF 1'); await js(`(() => { const e = document.querySelector('#simBanca'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(e, 'CEBRASPE (CESPE)'); e.dispatchEvent(new Event('change', { bubbles: true })); })()`); await setNative('#simMin', '210');
    await fill('Língua Portuguesa', 20, 15); await fill('Direito Constitucional', 20, 10); await fill('Informática', 0, 0);
    const q0 = await qOf('Língua Portuguesa'); const undo0 = await js('map._undo.length'); await click('#simSave'); await c.waitFor(() => js(`!document.querySelector('#simBox') || document.querySelector('#modal').hidden`));
    const l = await sims(); eq(l.length, 1); eq([l[0].name, l[0].banca, l[0].minutes, l[0].d, l[0].rows.length], ['Simulado TRF 1', 'CEBRASPE (CESPE)', 210, d(-14), 2]); eq(await js('map._undo.length'), undo0 + 1);
    const q1 = await qOf('Língua Portuguesa'); eq([q1.done - q0.done, q1.correct - q0.correct], [20, 15]); eq((await study('Língua Portuguesa')).qlog[d(-14)], { done: 20, correct: 15 }); eq(await js('dirty'), true);
    await js('act.dash()'); await wait(300); const sec = await txt('#simSec'); ok(sec.includes('Simulados (1)') && sec.includes('Simulado TRF 1') && sec.includes('CEBRASPE (CESPE)') && sec.includes('25/40') && sec.includes('62,5%'), sec);
    eq(await js(`document.querySelectorAll('#simSec .sim-chart .dot').length`), 1); eq(await js(`[...document.querySelectorAll('#simSec .err-bar')].map((b) => b.dataset.disc)`), ['Direito Constitucional', 'Língua Portuguesa'], 'mais fraca primeiro');
    await js('closeDash(); act.undo()'); eq(await sims(), []); eq((await qOf('Língua Portuguesa')).done, q0.done, 'desfazer reverte também as questões'); await js('act.redo()'); eq((await sims()).length, 1);
  });

  await t('vários simulados: evolução ordenada por data, média, melhor, variação ▲/▼; apagar (✕) é desfazível; sem a opção não mexe nas questões', async () => {
    await openModal(); await setNative('#simName', 'Simulado 2'); await setNative('#simDate', d(-7)); await fill('Língua Portuguesa', 20, 17); await fill('Direito Constitucional', 20, 14); await click('#simSave'); await c.waitFor(() => js(`document.querySelector('#modal').hidden`));
    const qBefore = JSON.stringify(await qOf('Informática'));
    await openModal(); await js(`document.querySelector('#simAdd').click()`); await setNative('#simName', 'Simulado 3'); await setNative('#simDate', d(-1)); await fill('Informática', 10, 4); await fill('Língua Portuguesa', 10, 9); await click('#simSave'); await c.waitFor(() => js(`document.querySelector('#modal').hidden`));
    eq(JSON.stringify(await qOf('Informática')), qBefore, 'sem "somar às questões", o estudo do tópico não muda'); eq((await sims()).length, 3);
    await js('act.dash()'); await wait(300); const pts = await js(`document.querySelectorAll('#simSec .sim-chart .dot').length`); eq(pts, 3); eq(await js(`document.querySelectorAll('#simSec .sim-chart polyline').length`), 1);
    const sum = await txt('#simSummary'); ok(sum.includes('melhor') && sum.includes('Simulado 2') && /último \d+,?\d*%/.test(sum), sum); ok(/[▲▼▬]/.test(sum), 'seta de variação: ' + sum);
    eq(await js(`[...document.querySelectorAll('#simSec .rev .t b')].map((b) => b.textContent)`), ['Simulado 3', 'Simulado 2', 'Simulado TRF 1'], 'lista: mais recente primeiro');
    const disc = await js(`[...document.querySelectorAll('#simSec .err-bar')].map((b) => b.dataset.disc)`); eq(disc[0], 'Informática', 'a pior (40%) vem primeiro');
    await click('#simSec .sim-del'); await wait(300); eq((await sims()).length, 2); eq(await js(`document.querySelectorAll('#simSec .sim-chart .dot').length`), 2); await js('closeDash(); act.undo()'); eq((await sims()).length, 3, 'desfazer a exclusão');
  });

  await t('persistência: salvar .mom e reabrir; biblioteca SQLite; relatório .md traz os simulados', async () => {
    const f2 = path.join(TMP, 'com-simulados.mom'); await js(`window.__dlg.save = ${JSON.stringify(f2)}`); ok(await js('save(true)'));
    eq(readMom(fs.readFileSync(f2)).meta.simulados.length, 3); await js(`dirty = false; openPath(${JSON.stringify(f2)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(f2)}`)); eq((await sims()).length, 3);
    ok(await js('moveToLibrary()')); await js('closeLibrary()'); ok(await js(`getLibrary().loadMap(map.meta.libId).meta.simulados.length === 3`));
    const md = path.join(TMP, 'rel.md'); await js(`window.__dlg.save = ${JSON.stringify(md)}; act.dash()`); await wait(300); await click('#btnReportMd'); await c.waitFor(() => fs.existsSync(md)); await js('closeDash()');
    const text = fs.readFileSync(md, 'utf8'); ok(text.includes('## Simulados (3)') && text.includes('Simulado TRF 1 (CEBRASPE (CESPE)): 25/40') && text.includes('Disciplinas (mais fracas primeiro): Informática'), text.slice(text.indexOf('## Simulados'), text.indexOf('## Simulados') + 500));
  });

  await t('tela inicial tem o atalho "Registrar simulado"; Esc fecha o formulário sem gravar', async () => {
    await js(`dirty = false; act.home(true)`); await c.waitFor(() => js(`!!document.querySelector('#home .hm')`)); await click('#hmSim'); await c.waitFor(() => js(`!!document.querySelector('#simBox')`)); eq(await js(`document.querySelector('#home').hidden`), true);
    const n = (await sims()).length; await js(`document.querySelector('#modal').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`); await wait(150); eq(await js(`document.querySelector('#modal').hidden`), true); eq((await sims()).length, n);
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
