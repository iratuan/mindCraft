'use strict';
// Ponta a ponta: caderno de erros (painel Estudo, Painel de estudos, revisão do dia, relatório) e metas semanais.
const fs = require('fs');
const path = require('path');
const start = require('./harness');
const { writeMom, readMom } = require('../core/mom');
const { TODAY, concurso } = require('./fixtures');

(async () => {
  const c = await start('MindCraft e2e — caderno de erros e metas semanais');
  const { js, wait, eq, ok, t, TMP } = c;
  const txt = (s) => js(`document.querySelector(${JSON.stringify(s)}).textContent`);
  const click = (s) => js(`document.querySelector(${JSON.stringify(s)}).click()`);
  const setVal = (sel, v) => js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); const proto = e.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(e, ${JSON.stringify(v)}); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  const file = path.join(TMP, 'concurso.mom'); writeMom(concurso().m, file);
  const st = (title) => js(`(() => { let r; map.walk((n) => { if (n.title === ${JSON.stringify(title)}) r = n; }); return r.study; })()`);
  const open = async () => { await js(`window.__today = '${TODAY}'; dirty = false; openPath(${JSON.stringify(file)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(file)}`)); await wait(200); };
  const select = async (title) => { await js(`showPanel('study'); __md(__id(${JSON.stringify(title)})); true`); await wait(150); };

  await t('registrar erro: exige o motivo; grava motivo + anotação + data; limpa os campos; lista no painel; 1 desfazer', async () => {
    await open(); await select('Regência');
    const before = JSON.stringify(await st('Regência')); await click('#errAdd'); ok((await txt('#studyMsg')).includes('Escolha o motivo'), await txt('#studyMsg')); eq(JSON.stringify(await st('Regência')), before, 'sem motivo, nada muda');
    const undo0 = await js('map._undo.length'); await setVal('#errWhy', 'confundi'); await setVal('#errNote', 'confundi regência com concordância'); await click('#errAdd'); await wait(150);
    const s1 = await st('Regência'); eq(s1.errs, [{ d: TODAY, why: 'confundi', note: 'confundi regência com concordância' }]); eq(await js('map._undo.length'), undo0 + 1);
    eq(await js(`document.querySelector('#errWhy').value`), ''); eq(await js(`document.querySelector('#errNote').value`), ''); eq(s1.q.done, (JSON.parse(before).q || { done: 0 }).done, 'sem marcar a opção, não conta como questão');
    ok((await txt('#errList')).includes('Confundi conceitos') && (await txt('#errList')).includes('confundi regência com concordância'), await txt('#errList')); eq(await js(`document.querySelectorAll('#errList .err-row').length`), 1);
    await js('act.undo()'); eq((await st('Regência')).errs, undefined, 'desfazer remove o erro e o campo some'); await js('act.redo()'); eq((await st('Regência')).errs.length, 1);
  });

  await t('"contar também como questão errada" soma 1 questão feita e 0 acertos (e alimenta os pontos fracos); só vale no tópico principal da seleção', async () => {
    await select('Crase'); const q0 = (await st('Crase')).q; await setVal('#errWhy', 'atencao'); await js(`document.querySelector('#errCount').checked = true`); await click('#errAdd');
    const s = await st('Crase'); eq([s.q.done, s.q.correct], [q0.done + 1, q0.correct]); eq(s.qlog[TODAY].done >= 1, true); eq(s.errs.length, 1);
    await js(`document.querySelector('#errCount').checked = false`);
    // multisseleção: erro só no tópico "principal" (como tempo e questões)
    await js(`__md(__id('Crase')); __md(__id('Regência'), { ctrlKey: true }); true`); await wait(150); const regN = (await st('Regência')).errs.length, craseN = (await st('Crase')).errs.length;
    await setVal('#errWhy', 'tempo'); await click('#errAdd'); await wait(150);
    eq((await st('Crase')).errs.length + (await st('Regência')).errs.length, craseN + regN + 1, 'exatamente 1 erro novo no total');
  });

  await t('apagar um erro pelo ✕ (desfazível); limite de 200 por tópico avisa sem alterar', async () => {
    await select('Legalidade'); await setVal('#errWhy', 'chute'); await setVal('#errNote', 'primeiro'); await click('#errAdd'); await setVal('#errWhy', 'tempo'); await setVal('#errNote', 'segundo'); await click('#errAdd');
    eq(await js(`document.querySelectorAll('#errList .err-row').length`), 2); ok((await txt('#errList .err-row')).includes('segundo'), 'mais recente primeiro');
    await click('#errList .err-row .err-del'); eq((await st('Legalidade')).errs.map((e) => e.note), ['primeiro']); await js('act.undo()'); eq((await st('Legalidade')).errs.map((e) => e.note), ['primeiro', 'segundo']);
    await js(`(() => { let n; map.walk((x) => { if (x.title === 'Legalidade') n = x; }); n.study.errs = Array.from({ length: 200 }, () => ({ d: '${TODAY}', why: 'chute', note: '' })); render(); })()`); await wait(150);
    const before = JSON.stringify(await st('Legalidade')); await setVal('#errWhy', 'outro'); await click('#errAdd'); ok((await txt('#studyMsg')).includes('200 registros'), await txt('#studyMsg')); eq(JSON.stringify(await st('Legalidade')), before);
  });

  await t('Painel de estudos: seção "Caderno de erros" (por motivo, recentes clicáveis) e vazio amigável', async () => {
    await open(); await js('act.dash()'); await wait(300); ok((await txt('#errSec')).includes('Caderno de erros (0)') && (await txt('#errSec')).includes('Nenhum erro registrado'), await txt('#errSec')); await js('closeDash()');
    await select('Regência'); await setVal('#errWhy', 'atencao'); await setVal('#errNote', 'li rápido demais'); await click('#errAdd'); await select('Crase'); await setVal('#errWhy', 'atencao'); await click('#errAdd'); await setVal('#errWhy', 'nao-sabia'); await click('#errAdd');
    await js('act.dash()'); await wait(300); const sec = await txt('#errSec'); ok(sec.includes('Caderno de erros (3)'), sec); eq(await js(`[...document.querySelectorAll('#errSec .err-bar')].map((b) => b.dataset.why + ':' + b.querySelector('b').textContent)`), ['atencao:2', 'nao-sabia:1']);
    ok(sec.includes('3 nos últimos 7 dias') && sec.includes('Crase (2)'), sec); ok(sec.includes('li rápido demais'), 'nota do erro aparece');
    await js(`document.querySelector('#errSec .rev .t').click()`); await wait(200); eq(await js(`document.querySelector('#dash').hidden`), true); ok(['Crase', 'Regência'].includes(await js('map.find(selectedId).node.title')), 'clicar leva ao tópico');
  });

  await t('Revisão do dia mostra os erros do tópico ao revelar as anotações', async () => {
    await js(`window.__today = '${TODAY}'; true`); await js('act.review()'); await c.waitFor(() => js(`!!document.querySelector('#rvTitle')`));
    for (let k = 0; k < 4 && !['Regência'].includes(await txt('#rvTitle')); k++) await click('#rvSkip');
    if ((await txt('#rvTitle')) === 'Regência') { await click('#rvShow'); await c.waitFor(() => js(`!!document.querySelector('#rvDetail')`)); ok((await txt('#rvErrs')).includes('Seus erros neste tópico (2)') || (await txt('#rvErrs')).includes('Seus erros neste tópico'), await txt('#rvErrs')); ok((await txt('#rvErrs')).includes('li rápido demais')); }
    else ok(false, 'Regência não estava na fila de revisão');
    await js(`document.querySelector('#modal').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
  });

  await t('relatório .md inclui o caderno de erros (motivos e recentes)', async () => {
    const md = path.join(TMP, 'rel.md'); await js(`window.__dlg.save = ${JSON.stringify(md)}; act.dash()`); await wait(300); await click('#btnReportMd'); await c.waitFor(() => fs.existsSync(md)); await js('closeDash()');
    const text = fs.readFileSync(md, 'utf8'); ok(text.includes('## Caderno de erros (3)') && text.includes('Falta de atenção: 2') && text.includes('li rápido demais'), text.slice(text.indexOf('## Caderno'), text.indexOf('## Caderno') + 400));
  });

  await t('erros persistem: salvar .mom, reabrir; e na biblioteca SQLite', async () => {
    const f2 = path.join(TMP, 'com-erros.mom'); await js(`window.__dlg.save = ${JSON.stringify(f2)}`); ok(await js('save(true)'));
    let total = 0; readMom(fs.readFileSync(f2)).walk((n) => { total += ((n.study && n.study.errs) || []).length; }); eq(total, 3);
    await js(`dirty = false; openPath(${JSON.stringify(f2)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(f2)}`)); await select('Crase'); eq(await js(`document.querySelectorAll('#errList .err-row').length`), 2);
    ok(await js('moveToLibrary()')); await js('closeLibrary()'); const id = await js('map.meta.libId'); ok(await js(`(() => { const m = getLibrary().loadMap(${JSON.stringify(id)}); let n = 0; m.walk((x) => { n += ((x.study && x.study.errs) || []).length; }); return n === 3; })()`));
  });

  await t('metas semanais: sem metas só o formulário; validações; horas decimais; barras de progresso; remover; persistência; desfazer', async () => {
    await open(); await js('act.dash()'); await wait(300);
    eq(await js(`document.querySelectorAll('#goals .goal-row').length`), 0, 'sem metas: sem barras');
    await click('#goalSave'); ok((await txt('#goalMsg')).includes('Informe'), await txt('#goalMsg')); eq(await js('map.meta.goals'), undefined);
    await setVal('#goalHours', 'abc'); await setVal('#goalQuestions', '-4'); await click('#goalSave'); ok((await txt('#goalMsg')).includes('Informe'), 'valores inválidos recusados'); eq(await js('map.meta.goals'), undefined);
    await setVal('#goalHours', '10'); await setVal('#goalQuestions', '100'); await click('#goalSave'); await wait(300); eq(await js('map.meta.goals'), { minutesWeek: 600, questionsWeek: 100 }); eq(await js('dirty'), true);
    const bars = await js(`[...document.querySelectorAll('#goals .goal-row')].map((r) => r.dataset.goal + ':' + r.querySelector('b').textContent)`); eq(bars.length, 2); ok(bars.every((b) => /:\d+%/.test(b)), bars.join());
    const s0 = await js(`S.summary(map, { today: nowStr() }).goals`); eq(s0.minutes.goal, 600); eq(bars[0], `min:${s0.minutes.pct}%`); eq(bars[1], `q:${s0.questions.pct}%`);
    await js(`(() => { let n; map.walk((x) => { if (x.title === 'Crase') n = x; }); map.mutateStudy(n.id, (s) => S.addQuestions(S.addTime(s, nowStr(), 60), 50, 40, nowStr())); render(); })()`); await wait(300);
    const s1 = await js(`S.summary(map, { today: nowStr() }).goals`); ok(s1.minutes.done >= 60 && s1.questions.done >= 50); eq((await txt('#goals .goal-row[data-goal="q"] b')), s1.questions.pct + '%');
    await setVal('#goalHours', '2,5'); await setVal('#goalQuestions', ''); await click('#goalSave'); await wait(250); eq(await js('map.meta.goals'), { minutesWeek: 150 }); eq(await js(`document.querySelectorAll('#goals .goal-row').length`), 1);
    const f3 = path.join(TMP, 'metas.mom'); await js(`window.__dlg.save = ${JSON.stringify(f3)}`); ok(await js('save(true)')); eq(readMom(fs.readFileSync(f3)).meta.goals, { minutesWeek: 150 });
    await js('act.dash(); true'); await wait(100); await js('act.undo()'); eq(await js('map.meta.goals'), { minutesWeek: 600, questionsWeek: 100 }, 'desfazer volta à meta anterior');
    await js('act.dash()'); await wait(300); await click('#goalClear'); await wait(250); eq(await js('map.meta.goals'), undefined); eq(await js(`!!document.querySelector('#goalClear')`), false);
    await js('closeDash()');
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
