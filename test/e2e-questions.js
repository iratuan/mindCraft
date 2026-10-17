'use strict';
// Ponta a ponta: questões por banca/ano, caderno de erros com "refazer", painel de estudos, tela inicial e restauração por pacote.
const fs = require('fs');
const path = require('path');
const start = require('./harness');
const { writeMom, readMom } = require('../core/mom');
const { openLibrary } = require('../core/library');
const { TODAY, concurso } = require('./fixtures');

const SHOTS = path.join(__dirname, '..', 'evidencias', 'questoes');

(async () => {
  const c = await start('MindCraft e2e — questões por banca/ano e erros para refazer');
  const { js, wait, eq, ok, t, TMP, USERDATA } = c;
  fs.rmSync(SHOTS, { recursive: true, force: true }); fs.mkdirSync(SHOTS, { recursive: true });
  const { BrowserWindow } = require('electron'); const win = BrowserWindow.getAllWindows()[0];
  const shot = async (name) => { const img = await win.webContents.capturePage(); fs.writeFileSync(path.join(SHOTS, name + '.png'), img.toPNG()); };
  const txt = (s) => js(`document.querySelector(${JSON.stringify(s)}).textContent`);
  const click = (s) => js(`document.querySelector(${JSON.stringify(s)}).click()`);
  const setVal = (sel, v) => js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); const proto = e.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(e, ${JSON.stringify(v)}); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  const file = path.join(TMP, 'concurso.mom'); writeMom(concurso().m, file);
  const st = (title) => js(`(() => { let r; map.walk((n) => { if (n.title === ${JSON.stringify(title)}) r = n; }); return r.study; })()`);
  const open = async () => { await js(`window.__today = '${TODAY}'; dirty = false; openPath(${JSON.stringify(file)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(file)}`)); await wait(200); };
  const select = async (title) => { await js(`showPanel('study'); __md(__id(${JSON.stringify(title)})); true`); await wait(150); };
  const setBanca = (v) => js(`setQBanca(${JSON.stringify(v)})`);
  const register = async (banca, ano, feitas, acertos) => { await setBanca(banca); await setVal('#qAno', ano); await setVal('#qDone', String(feitas)); await setVal('#qOk', String(acertos)); await click('#qAdd'); await wait(150); };
  const react = !c.CLASSIC;
  /** Estado conhecido: questões por banca/ano em 3 tópicos e 3 erros (2 com origem). */
  const buildState = async () => {
    await select('Legalidade'); await register('CESPE', '2024', 10, 4); await register('cespé', '2024', 5, 5); await register('FGV', '2023', 10, 9);
    await select('Crase'); await register('CESPE', '2023', 20, 10); await register('', '', 7, 7);
    await select('Regência'); await setBanca('Cebraspe'); await setVal('#qAno', '2022'); await setVal('#errWhy', 'confundi'); await setVal('#errNote', 'literal x teleológico'); await click('#errAdd'); await wait(150);
    await select('Crase'); await setBanca('FGV'); await setVal('#qAno', '2023'); await setVal('#errWhy', 'nao-sabia'); await click('#errAdd'); await wait(150); await setBanca(''); await setVal('#qAno', ''); await setVal('#errWhy', 'tempo'); await click('#errAdd'); await wait(150);
  };

  await t('registrar questões com banca e ano: grava o detalhe, mantém os totais, mantém banca/ano preenchidos e limpa só feitas/acertos; 1 desfazer', async () => {
    await open(); await select('Legalidade');
    const undo0 = await js('map._undo.length'); await register('CESPE', '2024', 10, 4); const s = await st('Legalidade');
    eq(s.q, { done: 10, correct: 4 }); eq(s.qsrc, [{ d: TODAY, banca: 'CESPE', year: 2024, done: 10, correct: 4 }]); eq(await js('map._undo.length'), undo0 + 1);
    ok((await txt('#studyMsg')).includes('CESPE 2024'), await txt('#studyMsg'));
    eq([await js(`document.querySelector('#qBanca').value`), await js(`document.querySelector('#qAno').value`), await js(`document.querySelector('#qDone').value`)], ['CESPE', '2024', ''], 'banca/ano ficam; números limpos');
    await js('act.undo()'); eq((await st('Legalidade')).qsrc, undefined); eq((await st('Legalidade')).q, { done: 0, correct: 0 });
    await js('act.redo()'); eq((await st('Legalidade')).q, { done: 10, correct: 4 });
  });

  await t('mesma banca com outra grafia (Cespé) soma no mesmo registro; sem banca/ano não cria detalhe; ano inválido é recusado sem registrar', async () => {
    await register('cespé', '2024', 5, 5); const s = await st('Legalidade'); eq(s.qsrc.length, 1); eq([s.qsrc[0].done, s.qsrc[0].correct], [15, 9]); eq(s.qsrc[0].banca, 'CESPE', 'mantém a grafia da primeira');
    await register('', '', 4, 2); eq((await st('Legalidade')).qsrc.length, 1, 'sem origem: só os totais'); eq((await st('Legalidade')).q, { done: 19, correct: 11 });
    const antes = JSON.stringify(await st('Legalidade')); await register('FGV', '1800', 3, 3);
    ok((await txt('#studyMsg')).includes('Ano inválido'), await txt('#studyMsg')); eq(JSON.stringify(await st('Legalidade')), antes, 'nada muda com ano inválido');
    await register('FGV', '2023', 3, 4); ok((await txt('#studyMsg')).includes('superar'), await txt('#studyMsg')); eq(JSON.stringify(await st('Legalidade')), antes, 'acertos > feitas: nada muda');
  });

  await t('sugestão de bancas (datalist) lista as já usadas no mapa; mais registros em outro tópico', async () => {
    await register('FGV', '2023', 10, 9); await select('Crase'); await register('CESPE', '2023', 20, 10); await register('FGV', '', 6, 3);
    await js(`document.querySelector('#qBanca').dispatchEvent(new Event('focus'))`);
    eq(await js(`[...document.querySelectorAll('#qBanca optgroup[label^="Já"] option')].map((o) => o.value).sort()`), ['CESPE', 'FGV']);
    const common = await js(`[...document.querySelectorAll('#qBanca optgroup[label^="Mais"] option')].map((o) => o.value)`); ok(common.includes('VUNESP') && common.includes('FCC') && !common.includes('FGV'), 'comuns sem repetir as já usadas: ' + common.join());
    eq(await js(`document.querySelector('#qBanca option[value="__outra"]').textContent`), 'Outra…');
  });

  await t('erro com banca/ano (campos compartilhados): grava origem; ✔/✖ no painel marcam como refeito; ↶ desfaz; cada ação é desfazível', async () => {
    await select('Regência'); await setBanca('Cebraspe'); await setVal('#qAno', '2022'); await setVal('#errWhy', 'confundi'); await setVal('#errNote', 'literal x teleológico'); await click('#errAdd'); await wait(150);
    eq((await st('Regência')).errs, [{ d: TODAY, why: 'confundi', note: 'literal x teleológico', banca: 'Cebraspe', year: 2022 }]);
    ok((await txt('#errList')).includes('Cebraspe 2022'), await txt('#errList'));
    await click('#errList [data-act="err-redo-ok"]'); await wait(150); eq((await st('Regência')).errs[0].redo, { d: TODAY, ok: true }); ok((await txt('#errList')).includes('refeito em') && (await txt('#errList')).includes('acertei'), await txt('#errList'));
    eq(await js(`document.querySelectorAll('#errList [data-act="err-redo-ok"], #errList [data-act="err-redo-bad"]').length`), 0, 'refeito não oferece ✔/✖'); await click('#errList [data-act="err-redo-clear"]'); await wait(150); eq((await st('Regência')).errs[0].redo, undefined);
    await click('#errList [data-act="err-redo-bad"]'); await wait(150); eq((await st('Regência')).errs[0].redo, { d: TODAY, ok: false }); ok((await txt('#errList')).includes('errei de novo'));
    await js('act.undo()'); eq((await st('Regência')).errs[0].redo, undefined, 'desfazer volta a "para refazer"');
    await select('Crase'); await setBanca('FGV'); await setVal('#qAno', '2023'); await setVal('#errWhy', 'nao-sabia'); await click('#errAdd'); await wait(150); await setBanca(''); await setVal('#qAno', ''); await setVal('#errWhy', 'tempo'); await click('#errAdd'); await wait(150);
    eq((await st('Crase')).errs.map((e) => [e.why, e.banca || null, e.year || null]), [['nao-sabia', 'FGV', 2023], ['tempo', null, null]]);
  });

  await t('texto hostil na banca: aparece como TEXTO (painel, lista de erros, datalist, painel de estudos) e nada executa', async () => {
    const EVIL = '<img src=x onerror="window.__pwn=1"><script>window.__pwn=2</script>';
    await select('Legalidade'); await register(EVIL, '2025', 5, 3); await setVal('#errWhy', 'chute'); await setVal('#errNote', EVIL); await click('#errAdd'); await wait(200);
    eq(await js('window.__pwn'), undefined); eq(await js(`document.querySelectorAll('#errList img, #errList script, #bancaList img').length`), 0);
    ok((await txt('#errList')).includes('<img src=x'), 'aparece literalmente');
    if (react) { await js(`act.dash()`); await wait(400); eq(await js('window.__pwn'), undefined); eq(await js(`document.querySelectorAll('#dash img, #dash script').length`), 0); ok((await txt('#qsrcSec')).includes('<img src=x'), 'texto literal no painel'); await js('closeDash()'); }
    // limpeza: tira os registros hostis para os testes seguintes
    for (let i = 0; i < 4; i++) { const n = await js(`(() => { let r; map.walk((x) => { if (x.title === 'Legalidade') r = x; }); return (r.study.errs || []).length; })()`); if (!n) break; await js('act.undo()'); }
    await js('act.undo(); act.undo(); true'); await wait(150);
  });

  if (react) {
    await t('Painel de estudos: tabelas "Questões por banca e por ano" (agrupa Cespé=CESPE; acerto em %, barra) e vazio amigável', async () => {
      await js(`dirty = false; openPath(${JSON.stringify(file)})`); await wait(500); await js(`act.dash()`); await wait(400);
      ok((await txt('#qsrcSec')).includes('Registre as questões informando a banca'), 'vazio amigável: ' + await txt('#qsrcSec')); await js('closeDash()');
      // reconstrói o estado com origem
      await buildState();
      await js(`act.dash()`); await wait(400);
      eq(await js(`[...document.querySelectorAll('#qsrcBanca tbody tr')].map((r) => [...r.children].slice(0, 2).map((x) => x.textContent).join(' ')).join(' | ')`), 'CESPE 19/35 | FGV 9/10');
      eq(await js(`[...document.querySelectorAll('#qsrcYear tbody tr')].map((r) => [...r.children].slice(0, 2).map((x) => x.textContent).join(' ')).join(' | ')`), '2024 9/15 | 2023 19/30');
      ok(/54[,.]3%/.test(await txt('#qsrcBanca tbody tr')), await txt('#qsrcBanca tbody tr')); ok(await js(`!!document.querySelector('#qsrcSec .bar i')`), 'barras de acerto'); await js(`document.querySelector('#qsrcSec').scrollIntoView({ block: 'start' })`); await wait(250); await shot('01-painel-por-banca-e-ano');
    });

    await t('Painel de estudos: caderno de erros — filtros (situação, motivo, banca, ano), ✔/✖ movem o erro para "refeitos", ↶ devolve, contadores', async () => {
      const rows = () => js(`[...document.querySelectorAll('#errSec .rev')].map((r) => r.querySelector('b').textContent + '·' + r.querySelector('span').textContent)`);
      await wait(200); eq(await js(`document.querySelectorAll('#errSec .rev').length`), 3, 'padrão: os 3 erros para refazer'); ok((await txt('#errStats')).startsWith('3 para refazer'), await txt('#errStats')); await js(`document.querySelector('#errSec').scrollIntoView({ block: 'start' })`); await wait(250); await shot('02-caderno-de-erros');
      await setVal('#errFBanca', 'FGV'); eq(await js(`document.querySelectorAll('#errSec .rev').length`), 1); ok((await rows())[0].includes('Crase') && (await rows())[0].includes('FGV 2023'), (await rows())[0]); await setVal('#errFBanca', '');
      await setVal('#errFYear', '2022'); eq(await js(`document.querySelectorAll('#errSec .rev').length`), 1); ok((await rows())[0].includes('Regência'), (await rows())[0]); await setVal('#errFYear', '');
      await setVal('#errFWhy', 'tempo'); eq(await js(`document.querySelectorAll('#errSec .rev').length`), 1); ok((await rows())[0].includes('Crase'), (await rows())[0]); await setVal('#errFWhy', 'nao-sabia'); await setVal('#errFBanca', 'Cebraspe'); eq(await js(`document.querySelectorAll('#errSec .rev').length`), 0, 'filtros combinados (E)'); ok(await js(`!!document.querySelector('#errEmpty')`), 'mensagem de vazio'); await setVal('#errFWhy', ''); await setVal('#errFBanca', '');
      // refazer pelo painel
      const undo0 = await js('map._undo.length'); await click('#errSec [data-act="err-redo-ok"]'); await wait(250);
      eq(await js('map._undo.length'), undo0 + 1, 'uma ação desfazível'); eq(await js(`document.querySelectorAll('#errSec .rev').length`), 2, 'saiu de "para refazer"');
      ok((await txt('#errStats')).startsWith('2 para refazer · 1 refeito(s) e acertado(s)'), await txt('#errStats'));
      await setVal('#errFState', 'done'); eq(await js(`document.querySelectorAll('#errSec .rev').length`), 1); ok((await txt('#errSec .rev')).includes('acertei ao refazer'), await txt('#errSec .rev'));
      await click('#errSec [data-act="err-redo-clear"]'); await wait(250); eq(await js(`document.querySelectorAll('#errSec .rev').length`), 0, 'voltou para "refazer"'); await setVal('#errFState', 'all'); eq(await js(`document.querySelectorAll('#errSec .rev').length`), 3);
      await js('act.undo()'); await wait(200); await js('closeDash()');
    });

    await t('tela inicial: mostra "N erro(s) para refazer" somando os mapas da biblioteca (refeitos não contam)', async () => {
      await js(`moveToLibrary()`); await wait(300); await js(`act.home(true)`); await c.waitFor(() => js(`!!document.querySelector('#home .hm')`)); await wait(300);
      ok(await js(`!!document.querySelector('#hmErrors')`), 'bloco de erros na tela inicial'); ok((await txt('#hmErrors')).startsWith('2 erro(s) para refazer'), await txt('#hmErrors')); await shot('03-tela-inicial-erros'); await js('closeHome()');
    });
  }

  await t('persistência: .mom e biblioteca guardam banca/ano/refeito; reabrir mostra o mesmo; relatório .md continua válido', async () => {
    if (!react) { await open(); await buildState(); await js('moveToLibrary()'); await wait(300); }
    const f2 = path.join(TMP, 'q-salvo.mom'); await js(`window.__dlg.save = ${JSON.stringify(f2)}`); ok(await js('save(true)')); await wait(300);
    const m = readMom(fs.readFileSync(f2)); const S = require('../core/study'); const sm = S.summary(m, { today: TODAY });
    ok(sm.questionsBy.banca.length >= 1, 'banca no arquivo salvo'); ok(sm.errors.list.some((e) => e.banca === 'FGV' && e.year === 2023), 'erro com origem no arquivo');
    const lib = openLibrary(path.join(USERDATA, 'biblioteca.db')); const by = lib.questionsBySource(); ok(by.banca.some((b) => b.name === 'CESPE' && b.done >= 35), JSON.stringify(by.banca)); lib.close();
  });

  await t('configurações viajam no pacote: exportar → mudar → importar pela janela da biblioteca restaura tema, tela inicial e opções', async () => {
    await js(`saveCfg({ startScreen: 'last', dashOnStart: true, newInLibrary: true }); setLight(true); true`);
    const pack = path.join(TMP, 'tudo.mcpack'); fs.rmSync(pack, { force: true });
    await js(`openLibraryModal()`); await c.waitFor(() => js(`!!document.querySelector('#libExpPack')`)); await js(`window.__dlg.save = ${JSON.stringify(pack)}`); await click('#libExpPack'); await c.waitFor(() => fs.existsSync(pack), 8000);
    const man = JSON.parse(new (require('adm-zip'))(pack).getEntry('manifest.json').getData().toString()); ok(man.settings && man.settings.sha256, 'pacote traz configurações com SHA-256');
    await js(`closeModal(); saveCfg({ startScreen: 'blank', dashOnStart: false, newInLibrary: false }); setLight(false); true`);
    await js(`openLibraryModal()`); await c.waitFor(() => js(`!!document.querySelector('#libImpPack')`)); await js(`window.__dlg.pack = ${JSON.stringify(pack)}`); await click('#libImpPack'); await c.waitFor(() => js(`document.body.classList.contains('light')`), 8000);
    eq(await js(`(() => { const c = loadCfg(); return [c.startScreen, c.dashOnStart, c.newInLibrary, document.body.classList.contains('light')]; })()`), ['last', true, true, true]);
    ok((await js(`document.querySelector('#libMsg') ? document.querySelector('#libMsg').textContent : document.querySelector('#modal').textContent`)).includes('Configurações restauradas'), 'avisa que restaurou');
    eq(await js(`JSON.stringify(Object.keys(loadCfg()).filter((k) => /vault|path|dir/i.test(k)))`), '[]', 'nenhum caminho entrou');
    await js(`closeModal(); true`);
  });

await t('BANCA é uma lista de seleção: bancas comuns do Brasil; escolher da lista grava o nome; "Outra…" abre um campo para digitar; a escolha fica para o próximo registro', async () => {
    await select('Regência'); await js(`setQBanca(''); true`); await wait(100);
    eq(await js(`document.querySelector('#qBanca').tagName`), 'SELECT');
    const opts = await js(`[...document.querySelectorAll('#qBanca optgroup[label^="Mais"] option')].map((o) => o.value)`);
    ok(['CEBRASPE (CESPE)', 'FGV', 'FCC', 'VUNESP', 'CESGRANRIO', 'IBFC', 'QUADRIX', 'AOCP', 'IDECAN', 'CONSULPLAN'].every((b) => opts.includes(b) || b === 'FGV'), opts.join());
    eq(await js(`document.querySelector('#qBancaOutra').hidden`), true);
    await js(`(() => { const s = document.querySelector('#qBanca'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, 'VUNESP'); s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
    eq(await js(`document.querySelector('#qBanca').value`), 'VUNESP'); eq(await js(`document.querySelector('#qBancaOutra').hidden`), true);
    await js(`(() => { const s = document.querySelector('#qBanca'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, '__outra'); s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
    eq(await js(`document.querySelector('#qBancaOutra').hidden`), false); eq(await js(`document.activeElement.id`), 'qBancaOutra', 'foco vai para o campo de texto');
    await setVal('#qBancaOutra', 'Banca Rara 123'); eq(await js(`document.querySelector('#qBanca').value`), 'Banca Rara 123');
    await setVal('#qAno', '2021'); await setVal('#qDone', '10'); await setVal('#qOk', '6'); await click('#qAdd'); await wait(200);
    eq(await js(`map.find(selectedId).node.study.qsrc.map((r) => r.banca).pop()`), 'Banca Rara 123');
    eq(await js(`document.querySelector('#qBanca').value`), 'Banca Rara 123', 'a banca fica para o próximo registro');
    await js(`document.querySelector('#qBanca').dispatchEvent(new Event('focus')); true`);
    eq(await js(`[...document.querySelectorAll('#qBanca optgroup[label^="Já"] option')].map((o) => o.value).includes('Banca Rara 123')`), true, 'agora aparece entre as já usadas');
    eq(await js(`document.querySelector('#qBanca').value`), 'Banca Rara 123', 'a escolha sobrevive a remontar a lista'); eq(await js(`document.querySelector('#qBancaOutra').hidden`), true, 'como é uma já usada, volta a ser escolha da lista');
    await js(`setQBanca('cebraspe (cespe)'); true`); eq(await js(`document.querySelector('#qBanca').value`), 'CEBRASPE (CESPE)', 'ignora caixa ao casar com a lista'); await js(`setQBanca(''); true`);
    await c.shot(require('path').join(__dirname, '..', 'evidencias', 'banca', 'selecao.png'));
  });
  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
