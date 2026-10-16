'use strict';
// Ponta a ponta: Revisão do dia (recordação ativa), agenda .ics e tela de atalhos.
const fs = require('fs');
const path = require('path');
const start = require('./harness');
const { writeMom } = require('../core/mom');
const { TODAY, d, concurso } = require('./fixtures');

(async () => {
  const c = await start('MindCraft e2e — revisão do dia, agenda .ics e atalhos');
  const { js, wait, eq, ok, t, TMP } = c;
  const txt = (s) => js(`document.querySelector(${JSON.stringify(s)}).textContent`);
  const click = (s) => js(`document.querySelector(${JSON.stringify(s)}).click()`);
  const key = (k) => js(`document.querySelector('#modal').dispatchEvent(new KeyboardEvent('keydown', { key: ${JSON.stringify(k)}, bubbles: true, cancelable: true }))`);
  const file = path.join(TMP, 'concurso.mom'); const base = concurso().m;
  base.walk((n) => { if (n.title === 'Regência') n.notes = 'Verbos **transitivos** pedem [[Crase]].\n<script>window.__pwn = 1</script>'; });
  writeMom(base, file);
  const study = (title) => js(`(() => { let r; map.walk((n) => { if (n.title === ${JSON.stringify(title)}) r = n; }); return r.study; })()`);
  const open = async () => { await js(`window.__today = '${TODAY}'; dirty = false; openPath(${JSON.stringify(file)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(file)}`)); await wait(200); };

  await t('Revisão do dia pelo painel: mostra só o tópico (pergunta); anotações aparecem ao pedir, renderizadas e seguras', async () => {
    await open(); await js('act.dash()'); await wait(250); await click('#btnReview'); await c.waitFor(() => js(`!!document.querySelector('#rvBox')`));
    eq(await js(`document.querySelector('#rvBox').dataset.ui`), 'react'); eq(await txt('#rvCount'), '1 / 3'); eq(await js(`document.querySelector('#dash').hidden`), true, 'o painel fechou');
    const first = await txt('#rvTitle'); ok(['Regência', 'Direitos fundamentais', 'Princípios fundamentais'].includes(first), first); eq(await js(`!!document.querySelector('#rvDetail')`), false, 'anotações escondidas');
    // vai direto ao tópico com notas: pula até "Regência"
    for (let k = 0; k < 3 && (await txt('#rvTitle')) !== 'Regência'; k++) await click('#rvSkip');
    eq(await txt('#rvTitle'), 'Regência'); await click('#rvShow'); await c.waitFor(() => js(`!!document.querySelector('#rvDetail')`));
    ok((await js(`document.querySelector('#rvDetail .md').innerHTML`)).includes('<strong>transitivos</strong>')); eq(await js(`document.querySelectorAll('#rvDetail script').length`), 0); eq(await js('window.__pwn'), undefined);
    ok((await txt('#rvDetail')).includes('<script>'), 'HTML aparece como texto');
  });

  await t('Lembrei avança o ciclo e agenda a próxima revisão; Errei volta ao início (amanhã); Pular não altera nada; cada resposta = 1 desfazer', async () => {
    await open(); await js(`act.review()`); await c.waitFor(() => js(`!!document.querySelector('#rvBox')`));
    const items = []; // percorre a fila: 1º Lembrei, 2º Errei, 3º Pular
    const t1 = await txt('#rvTitle'); const s1 = await study(t1); await click('#rvShow'); const undo0 = await js('map._undo.length'); await click('#rvOk');
    const a1 = await study(t1); eq(a1.stage, s1.stage + 1, 'subiu um estágio'); ok(a1.next > TODAY, 'próxima revisão no futuro: ' + a1.next); eq(a1.last, TODAY); eq(await js('map._undo.length'), undo0 + 1, 'um desfazer'); items.push(t1);
    eq(await txt('#rvCount'), '2 / 3');
    const t2 = await txt('#rvTitle'); await key(' '); await c.waitFor(() => js(`!!document.querySelector('#rvDetail')`)); await key('n'); await c.waitFor(() => js(`document.querySelector('#rvCount').textContent === '3 / 3'`));
    const a2 = await study(t2); eq(a2.stage, 0); eq(a2.next, d(1), 'errei: amanhã'); eq(a2.reviews.at(-1).ok, false);
    const t3 = await txt('#rvTitle'); const s3 = await study(t3); await key('s'); await c.waitFor(() => js(`!!document.querySelector('#rvDone')`)); eq(JSON.stringify(await study(t3)), JSON.stringify(s3), 'pular não muda o estudo');
    ok((await txt('#rvDone')).includes('Revisão concluída') && (await txt('#rvDone')).includes('1 lembrei · 1 errei (volta amanhã) · 1 pulado(s)'), await txt('#rvDone'));
    await click('#rvClose'); eq(await js(`document.querySelector('#modal').hidden`), true);
    await js('act.undo()'); eq((await study(t2)).stage > 0 || (await study(t2)).next !== d(1), true, 'desfazer reverte o "errei"');
  });

  await t('sem revisões pendentes: mensagem amigável; Y/N só valem depois de revelar; Esc sai', async () => {
    await js(`window.__today = '${d(-30)}'; dirty = false; true`); await js('act.review()'); await c.waitFor(() => js(`!!document.querySelector('#rvDone')`)); ok((await txt('#rvDone')).includes('Nenhuma revisão pendente hoje'), await txt('#rvDone')); await click('#rvClose');
    await open(); await js('act.review()'); await c.waitFor(() => js(`!!document.querySelector('#rvTitle')`)); const t0 = await txt('#rvTitle'); const s0 = JSON.stringify(await study(t0));
    await key('y'); await wait(150); eq(await txt('#rvTitle'), t0, 'Y antes de mostrar não faz nada'); eq(JSON.stringify(await study(t0)), s0);
    await key('Escape'); await wait(100); eq(await js(`document.querySelector('#modal').hidden`), true);
  });

  await t('revisão mostra as fontes (PDF) do tópico e o botão "Ir ao mapa" seleciona o tópico', async () => {
    await open(); await js(`(() => { let n; map.walk((x) => { if (x.title === 'Regência') n = x; }); const p = map.addPdf({ path: ${JSON.stringify(path.join(TMP, 'x.pdf'))}, name: 'Gramática' }); map.addRef(n.id, { pdf: p.id, page: 33, quote: 'q', rects: [] }); return true; })()`);
    await js('act.review()'); await c.waitFor(() => js(`!!document.querySelector('#rvTitle')`));
    for (let k = 0; k < 3 && (await txt('#rvTitle')) !== 'Regência'; k++) await click('#rvSkip');
    await click('#rvShow'); await c.waitFor(() => js(`!!document.querySelector('#rvDetail .ref-open')`)); ok((await txt('#rvDetail')).includes('📖 Gramática, p. 33'));
    await click('#rvGo'); await wait(200); eq(await js('map.find(selectedId).node.title'), 'Regência'); eq(await js(`document.querySelector('#modal').hidden`), true);
  });

  await t('agenda .ics pelo painel: arquivo válido com revisões e prova; cancelar o diálogo não grava nada', async () => {
    await open(); await js(`map.setExam({ name: 'TRF 2026', date: '${d(40)}' }); act.dash()`); await wait(250);
    const out = path.join(TMP, 'agenda ç.ics'); await js(`window.__dlg.save = null`); await click('#btnIcs'); await wait(300); eq(fs.existsSync(out), false);
    await js(`window.__dlg.save = ${JSON.stringify(out)}`); await click('#btnIcs'); await c.waitFor(() => fs.existsSync(out));
    const ics = fs.readFileSync(out, 'utf8'); ok(ics.startsWith('BEGIN:VCALENDAR') && ics.includes('SUMMARY:PROVA: TRF 2026') && /SUMMARY:Revisões \(\d+\)/.test(ics) && !/[^\r]\n/.test(ics));
    ok((await txt('#dashMsg')).includes('Agenda salva'), await txt('#dashMsg')); await js('closeDash()');
  });

  await t('F1 abre os atalhos (agrupados), Esc fecha; o mapa não é alterado', async () => {
    await js(`dirty = false; ipcRenderer.emit('menu', {}, 'help')`); await c.waitFor(() => js(`!!document.querySelector('#keysBox')`));
    ok((await txt('#keysBox')).includes('Ctrl+Shift+R') && (await txt('#keysBox')).includes('Alt+1 … 5') && (await txt('#keysBox')).includes('leitor de PDF')); ok((await js(`document.querySelectorAll('#keysBox .keys-row').length`)) >= 25);
    await key('Escape'); await wait(100); eq(await js(`document.querySelector('#modal').hidden`), true); eq(await js('dirty'), false);
    const m = c.Menu.getApplicationMenu(); ok(m.items.some((i) => i.label === 'Ajuda' && i.submenu.items.some((x) => x.accelerator === 'F1')), 'item de menu Ajuda');
    ok(m.items.find((i) => i.label === 'Exibir').submenu.items.some((x) => x.label === 'Revisão do dia' && x.accelerator === 'CmdOrCtrl+Shift+R'));
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
