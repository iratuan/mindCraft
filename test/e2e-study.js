'use strict';
// Ponta a ponta dos recursos de estudo, edição em lote e segurança de dados.  `npm run e2e` roda este e o e2e.js.
const fs = require('fs');
const path = require('path');
const start = require('./harness');

const TODAY = '2026-10-20';
const readMomTitles = (f) => { const m = require('../core/mom').readMom(fs.readFileSync(f)); const r = []; m.walk((n, l) => r.push(l + ':' + n.title)); return r; };
// Mapa de conferência (mesmos valores do teste unitário): Português 83,33% · Direito 50% · geral 70%
const DATASET = `(() => {
  window.__today = '${TODAY}';
  const m = new MindMap(createNode('Concurso X'));
  const pt = m.addChild(m.root.id, 'Português'), dc = m.addChild(m.root.id, 'Direito');
  const crase = m.addChild(pt.id, 'Crase'), reg = m.addChild(pt.id, 'Regência');
  const princ = m.addChild(dc.id, 'Princípios'), dir = m.addChild(dc.id, 'Direitos');
  m.update(crase.id, { progress: 100 }); m.update(reg.id, { progress: 50 }); m.update(dir.id, { progress: 100 });
  m.mutateStudy(crase.id, (s) => S.setWeight(s, 2));
  m._undo.length = 0;
  adopt(m); dirty = false; render();
  return true;
})()`;

(async () => {
  const c = await start('MindCraft e2e — estudo, lote e segurança de dados');
  const { js, wait, eq, ok, t, TMP, USERDATA } = c;
  const N = (id) => `map.find(__id('${id}')).node`;
  const val = (sel) => js(`document.querySelector('${sel}').value`);
  const txt = (sel) => js(`document.querySelector('${sel}').textContent`);
  const click = (sel) => js(`document.querySelector('${sel}').click()`);
  const setVal = (sel, v, ev = 'input') => js(`(() => { const e = document.querySelector('${sel}'); e.value = ${JSON.stringify(v)}; e.dispatchEvent(new Event('${ev}', { bubbles: true })); })()`);
  const msg = () => txt('#studyMsg');
  const msgCls = () => js(`document.querySelector('#studyMsg').className`);
  const card = (k) => js(`(() => { const c = [...document.querySelectorAll('#dash .card')].find((x) => x.querySelector('.k').textContent === ${JSON.stringify(k)}); return c ? c.querySelector('.v').textContent + '|' + c.querySelector('.s').textContent : null; })()`);

  await t('modelo de concurso cria 5 disciplinas × 4 etapas e pede confirmação só se houver alterações', async () => {
    await js(`act.template()`); await wait(200);
    eq(await js(`__titles().length`), 26, 'tópicos do modelo');
    eq(await js(`map.root.title`), 'Concurso — nome da prova');
    eq(await js(`dirty`), true, 'modelo é um mapa novo não salvo');
    await js(`window.__dlg.discard = 2`);          // Cancelar
    await js(`act.template()`); await wait(200);
    eq(await js(`__titles().length`), 26, 'cancelar não substitui o mapa');
    await js(`window.__dlg.discard = 1`);
  });

  await t('importar edital: contagem ao vivo, validação, novo mapa e adicionar abaixo do tópico', async () => {
    const edital = 'LÍNGUA PORTUGUESA\n1 Compreensão e interpretação de textos.\n2 Ortografia oficial; acentuação\ngráfica.\n2.1 Emprego do sinal indicativo de crase\n3 Regência verbal\n   a) verbos transitivos\n   b) verbos intransitivos\nDIREITO CONSTITUCIONAL:\n1. Princípios fundamentais\n1.1 Direitos e garantias\n2. Organização do Estado';
    await js(`dirty = false; act.edital()`);
    ok(await js(`!document.querySelector('#modal').hidden`), 'modal aberto');
    await click('#impOk');
    eq(await txt('#impErr'), 'Cole algum texto com tópicos.', 'validação de vazio');
    ok(await js(`!document.querySelector('#modal').hidden`), 'continua aberto');
    await setVal('#impText', edital);
    eq(await txt('#impCount'), '11 tópicos detectados', 'contagem');
    await setVal('#impTitle', 'TRF 2026', 'input');
    await click('#impOk'); await wait(200);
    ok(await js(`document.querySelector('#modal').hidden`), 'modal fechado');
    eq(await js(`map.root.title`), 'TRF 2026'); eq(await js(`map.root.children.map((x) => x.title)`), ['LÍNGUA PORTUGUESA', 'DIREITO CONSTITUCIONAL']);
    eq(await js(`__titles().length`), 12, 'raiz + 11');
    eq(await js(`dirty`), true);
    // adicionar abaixo do tópico selecionado
    const before = await js(`__titles().length`);
    await js(`__md(__id('Organização do Estado')); act.edital()`);
    await setVal('#impText', '- Federalismo\n  - União\n- Municípios');
    await js(`document.querySelector('input[name=impMode][value=add]').checked = true`);
    await click('#impOk'); await wait(100);
    eq(await js(`__titles().length`), before + 3);
    eq(await js(`map.find(__id('Organização do Estado')).node.children.map((x) => x.title)`), ['Federalismo', 'Municípios']);
    eq(await js(`map.find(__id('Federalismo')).node.children[0].title`), 'União');
    // cancelar fecha sem alterar
    await js(`act.edital()`); await click('#impCancel');
    ok(await js(`document.querySelector('#modal').hidden`), 'cancelar fecha');
  });

  await t('painel do tópico: estudei hoje agenda +1 dia, é idempotente, "errei" reinicia o ciclo, desfaz em 1 passo', async () => {
    await js(DATASET);
    await js(`__md(__id('Crase'))`);
    ok(await js(`!document.querySelector('#studyForm').hidden`), 'formulário visível');
    eq(await val('#studyWeight'), '2', 'peso exibido');
    eq(await txt('#studyDone'), '✓ Estudei hoje', 'rótulo da 1ª vez');
    await click('#studyDone');
    let st = await js(`${N('Crase')}.study`);
    eq([st.stage, st.next, st.last, st.reviews.length], [0, '2026-10-21', TODAY, 1], 'após estudar');
    eq(await msgCls(), 'msg ok');
    ok((await txt('#studyInfo')).includes('Última: 20/10/2026'), 'info da última sessão');
    eq(await txt('#studyDone'), '✓ Revisei hoje (lembrei)');
    await click('#studyDone');
    eq(await js(`${N('Crase')}.study.reviews.length`), 1, 'idempotente no mesmo dia');
    await click('#studyFail');
    st = await js(`${N('Crase')}.study`);
    eq([st.stage, st.next, st.reviews.length, st.reviews[0].ok], [0, '2026-10-21', 1, false], 'errei no mesmo dia prevalece');
    await setVal('#studyNext', '2026-10-25', 'change');
    eq(await js(`${N('Crase')}.study.next`), '2026-10-25', 'reagendada');
    await setVal('#studyNext', '', 'change');
    eq(await js(`${N('Crase')}.study.next`), null, 'removida');
    await setVal('#studyWeight', '5', 'change');
    eq(await js(`${N('Crase')}.study.weight`), 5);
    await js(`act.undo()`); eq(await js(`${N('Crase')}.study.weight`), 2, 'undo desfaz o peso');
    await js(`act.undo()`); eq(await js(`${N('Crase')}.study.next`), '2026-10-25', 'undo desfaz a limpeza da data');
  });

  await t('minutos e questões: entradas inválidas são recusadas sem alterar nada', async () => {
    await js(DATASET); await js(`__md(__id('Regência'))`);
    const log = () => js(`${N('Regência')}.study ? ${N('Regência')}.study.log : {}`);
    const undos = () => js(`map._undo.length`);
    const u0 = await undos();
    for (const [v, re] of [['0', /maior que zero/], ['-5', /maior que zero/], ['1500', /24 h/], ['', /maior que zero/]]) {
      await setVal('#studyMin', v); await click('#studyAddMin');
      ok(re.test(await msg()), `minutos "${v}": ${await msg()}`); eq(await msgCls(), 'msg err');
    }
    eq(await log(), {}, 'nada registrado'); eq(await undos(), u0, 'nenhum ponto de desfazer criado');
    await setVal('#studyMin', '30'); await click('#studyAddMin');
    eq((await log())[TODAY], 30); eq(await val('#studyMin'), '', 'campo limpo após sucesso');
    ok((await txt('#studyTime')).includes('Hoje: 30 min'), 'resumo de tempo');
    for (const [d, o, re] of [['5', '7', /superar/], ['0', '0', /inteiros/], ['5', '', /inteiros/], ['', '3', /inteiros/]]) {
      await setVal('#qDone', d); await setVal('#qOk', o); await click('#qAdd');
      ok(re.test(await msg()), `questões ${d}/${o}: ${await msg()}`);
    }
    eq(await js(`${N('Regência')}.study.q`), { done: 0, correct: 0 });
    await setVal('#qDone', '10'); await setVal('#qOk', '7'); await click('#qAdd');
    await setVal('#qDone', '10'); await setVal('#qOk', '10'); await click('#qAdd');
    eq(await txt('#studyQ'), 'Total: 17/20 (85%)');
  });

  await t('cronômetro: registra minutos no tópico de origem, descarta < 30 s e permite mover', async () => {
    await js(DATASET);
    await js(`__md(__id('Crase'))`); await click('#timerBtn');
    ok(await js(`document.body.classList.contains('timing')`), 'cronômetro ativo');
    eq(await txt('#timerBtn'), '■ Parar');
    await js(`timer.start -= 5 * 60000`); await click('#timerBtn');
    eq(await js(`${N('Crase')}.study.log['${TODAY}']`), 5, '5 minutos registrados');
    ok(!(await js(`document.body.classList.contains('timing')`)), 'cronômetro parado');
    await click('#timerBtn'); await click('#timerBtn');         // < 30 s
    eq(await js(`${N('Crase')}.study.log['${TODAY}']`), 5, 'menos de 30 s não conta');
    ok((await msg()).includes('Menos de 30 s'));
    // inicia em Crase, troca a seleção, move o cronômetro: o tempo vai para Crase
    await click('#timerBtn'); await js(`timer.start -= 3 * 60000; __md(__id('Regência'))`);
    eq(await txt('#timerBtn'), '▶ Mover cronômetro para cá');
    await click('#timerBtn');
    eq(await js(`${N('Crase')}.study.log['${TODAY}']`), 8, '3 min foram para Crase');
    eq(await js(`timer.id === __id('Regência')`), true, 'cronômetro agora em Regência');
    await js(`timer.start -= 60000`);
    await js(`act.template = act.template; resetStudyUI()`);   // trocar de mapa zera o cronômetro sem registrar
    eq(await js(`timer`), null);
    // tópico apagado durante a contagem não derruba o app
    await js(`__md(__id('Regência'))`); await click('#timerBtn'); await js(`timer.start -= 120000; __key('Delete')`);
    await js(`document.querySelector('#timerBtn').click()`);
    ok(true);
  });

  await t('vários tópicos selecionados: estudar vale para todos e desfaz num único passo', async () => {
    await js(DATASET);
    await js(`__md(__id('Crase')); __md(__id('Regência'), { ctrlKey: true }); __md(__id('Princípios'), { ctrlKey: true })`);
    eq(await js(`selIds.size`), 3);
    ok((await txt('#studyMulti')).startsWith('3 tópicos selecionados'), 'aviso de lote');
    await click('#studyDone');
    for (const n of ['Crase', 'Regência', 'Princípios']) eq(await js(`${N(n)}.study.next`), '2026-10-21', n);
    eq(await js(`map.find(__id('Direitos')).node.study`), undefined, 'não selecionado não muda');
    await js(`act.undo()`);
    for (const n of ['Crase', 'Regência', 'Princípios']) eq(await js(`${N(n)}.study ? ${N(n)}.study.next : null`), null, 'undo ' + n);
  });

  await t('selo de revisão pendente no mapa (individual e somado em ramo recolhido) e virada do dia', async () => {
    await js(DATASET);
    ok(!(await js(`view.textContent.includes('↻')`)), 'sem selo no início');
    await js(`map.mutateStudy(__id('Crase'), (s) => S.setNext(s, '${TODAY}')); map.mutateStudy(__id('Regência'), (s) => S.setNext(s, '2026-10-18')); render()`);
    eq(await js(`[...view.querySelectorAll('text')].filter((x) => x.textContent === '↻').length`), 2, 'dois selos individuais');
    await js(`map.update(__id('Português'), { collapsed: true }); render()`);
    eq(await js(`[...view.querySelectorAll('text')].some((x) => x.textContent === '2')`), true, 'ramo recolhido soma 2');
    await js(`map.update(__id('Português'), { collapsed: false }); map.mutateStudy(__id('Princípios'), (s) => S.setNext(s, '2026-10-21')); render()`);
    const before = await js(`L.boxes.get(__id('Princípios')).due`);
    await js(`window.__today = '2026-10-21'; render()`);   // virou o dia
    eq([before, await js(`L.boxes.get(__id('Princípios')).due`)], [0, 1], 'revisão de amanhã vence com a virada do dia');
    await js(`window.__today = '${TODAY}'; render()`);
  });

  await t('painel de estudos: números conferem com o cálculo manual, revisão rápida, navegação e atalhos desligados', async () => {
    await js(DATASET);
    await js(`map.mutateStudy(__id('Crase'), (s) => S.addQuestions(S.addTime(s, '${TODAY}', 75), 20, 15));
      map.mutateStudy(__id('Regência'), (s) => S.setNext(s, '2026-10-18'));
      map.mutateStudy(__id('Princípios'), (s) => S.setNext(s, '${TODAY}'));
      map.setExam({ name: 'Concurso X', date: '2026-10-30' }); render()`);
    await click('[data-act="dash"]');
    ok(await js(`!document.querySelector('#dash').hidden`), 'painel aberto');
    eq(await card('Progresso geral'), '70%|2 de 4 tópicos concluídos');
    eq((await card('Hoje')).split('|')[0], '1 h 15 min');
    eq(await card('Questões'), '75%|15 acertos em 20');
    eq(await card('Plano até a prova'), '0,2 /dia|2 tópicos pendentes em 10 dias');
    eq(await js(`document.querySelector('.countdown b').textContent`), '10');
    eq(await js(`[...document.querySelectorAll('#dash .tbl tr.click')].map((r) => r.children[0].textContent + ' ' + r.children[1].textContent.trim())`),
      ['Português 83,3%', 'Direito 50%']);
    eq(await js(`[...document.querySelectorAll('#dash [data-review]')].map((r) => r.querySelector('b').textContent + ' ' + r.querySelector('.tag').textContent)`),
      ['Regência 2 d de atraso', 'Princípios hoje'], 'ordem: mais atrasada primeiro');
    // atalhos do mapa desligados com o painel aberto
    const n0 = await js(`__titles().length`);
    await js(`__md = __md; document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }))`);
    eq(await js(`__titles().length`), n0, 'Delete não apaga com o painel aberto');
    // revisão rápida ✓ atualiza o painel
    await js(`document.querySelector('[data-review="' + __id('Regência') + '"] [data-act="rev-ok"]').click()`);
    eq(await js(`${N('Regência')}.study.next`), '2026-10-21'); eq(await js(`document.querySelectorAll('#dash [data-review]').length`), 1, 'lista encolheu');
    // prova: validação, salvar e limpar
    await setVal('#examDate', ''); await click('#examSave');
    eq(await txt('#dashMsg'), 'Informe a data da prova.');
    await setVal('#examName', 'TRF'); await setVal('#examDate', '2026-11-05'); await click('#examSave');
    eq(await js(`map.meta.exam`), { name: 'TRF', date: '2026-11-05' }); eq(await js(`document.querySelector('.countdown b').textContent`), '16');
    await click('#examClear'); eq(await js(`map.meta.exam`), undefined);
    eq(await txt('.countdown span'), 'sem data de prova');
    // navegar até a disciplina fecha o painel e seleciona
    await js(`document.querySelector('#dash .tbl tr.click').click()`);
    ok(await js(`document.querySelector('#dash').hidden`), 'painel fechado'); eq(await js(`selectedId === __id('Português')`), true);
    // Esc fecha
    await click('[data-act="dash"]'); await js(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
    ok(await js(`document.querySelector('#dash').hidden`), 'Esc fecha');
  });

  await t('relatório de estudos (.md e .docx) sai do painel com os mesmos números', async () => {
    await js(DATASET);
    await js(`map.mutateStudy(__id('Crase'), (s) => S.addQuestions(S.addTime(s, '${TODAY}', 75), 20, 15)); map.setExam({ name: 'Concurso X', date: '2026-10-30' }); render(); act.dash()`);
    const md = path.join(TMP, 'rel estudos.md'), dx = path.join(TMP, 'rel estudos.docx');
    await js(`window.__dlg.save = ${JSON.stringify(md)}`); await click('#btnReportMd'); await c.waitFor(() => fs.existsSync(md) && fs.statSync(md).size > 100);
    const mdTxt = fs.readFileSync(md, 'utf8');
    for (const re of [/Progresso geral: \*\*70%\*\*/, /faltam 10 dias/, /1 h 15 min/, /15 acertos \(75%\)/, /\| Português \| 83,3% \|/]) ok(re.test(mdTxt), 'md: ' + re);
    await js(`window.__dlg.save = ${JSON.stringify(dx)}`); await click('#btnReportDocx'); await c.waitFor(() => fs.existsSync(dx) && fs.statSync(dx).size > 1000);
    const doc = new (require('adm-zip'))(fs.readFileSync(dx)).getEntry('word/document.xml').getData().toString();
    ok(/83,3%/.test(doc) && /Relatório de estudos/.test(doc), 'docx com os números');
    await click('#btnDashClose');
  });

  await t('seleção múltipla: Ctrl+clique, retângulo (Shift), Selecionar tudo pelo menu, excluir em lote com 1 desfazer', async () => {
    await js(`(() => { const m = new MindMap(createNode('R')); for (const t of ['T1','T2','T3','T4','T5','T6']) m.addChild(m.root.id, t);
      m.addChild(m.root.id && m.find(m.root.children[1].id).node.id, 'T2a'); m._undo.length = 0; adopt(m); dirty = false; fit(); })()`);
    await js(`__md(__id('T1')); __md(__id('T2'), { ctrlKey: true })`); eq(await js(`selIds.size`), 2);
    await js(`__md(__id('T1'), { ctrlKey: true })`); eq(await js(`[...selIds]`), [await js(`__id('T2')`)], 'Ctrl+clique retira');
    // retângulo com Shift cobrindo todo o svg
    await js(`(() => { const r = svg.getBoundingClientRect();
      svg.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, shiftKey: true, clientX: r.left + 2, clientY: r.top + 2 }));
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: r.right - 2, clientY: r.bottom - 2 }));
      window.dispatchEvent(new MouseEvent('mouseup', { clientX: r.right - 2, clientY: r.bottom - 2 })); })()`);
    eq(await js(`selIds.size === L.boxes.size`), true, 'retângulo selecionou tudo'); ok(await js(`document.querySelector('#marquee').hidden`), 'retângulo some');
    await js(`__md(__id('T6'))`); eq(await js(`selIds.size`), 1);
    c.menu('selectAll'); await wait(80); eq(await js(`selIds.size === L.boxes.size`), true, 'Selecionar tudo (menu)');
    // raiz incluída na seleção: só os demais saem; 1 desfazer restaura tudo
    const n0 = await js(`__titles().length`);
    await js(`__key('Delete')`);
    eq(await js(`__titles()`), ['0:R'], 'tudo menos a raiz');
    await js(`act.undo()`); eq(await js(`__titles().length`), n0, 'um desfazer restaura todos');
    // excluir dois (um com filho)
    await js(`__md(__id('T2')); __md(__id('T3'), { ctrlKey: true }); __key('Delete')`);
    eq((await c.titles()).includes('1:T2a'), false, 'filho de T2 saiu junto'); eq(await js(`selectedId === map.root.id`), true, 'seleção vai para o pai');
    await js(`act.undo()`);
  });

  await t('arrastar um grupo move todos; formatação, marcador e progresso valem para todos os selecionados', async () => {
    await js(`__md(__id('T1')); __md(__id('T2'), { ctrlKey: true }); __drag(__id('T1'), __id('T3'))`);
    eq(await js(`map.find(__id('T3')).node.children.map((x) => x.title)`), ['T1', 'T2'], 'grupo movido para T3');
    eq(await js(`map.find(__id('T3')).node.children[1].children.map((x) => x.title)`), ['T2a'], 'subárvore acompanha');
    await js(`act.undo()`);
    // arrastar para dentro de um dos próprios selecionados é recusado
    await js(`__md(__id('T2')); __md(__id('T2a'), { ctrlKey: true }); __md(__id('T4'), { ctrlKey: true })`);
    const snap = JSON.stringify(await c.titles());
    await js(`__drag(__id('T4'), __id('T2a'))`); eq(JSON.stringify(await c.titles()), snap, 'destino dentro do grupo recusado');
    // formatação em lote
    await js(`__md(__id('T4')); __md(__id('T5'), { ctrlKey: true })`);
    await click('#progressChips [data-value="50"]'); await click('#markerChips [data-marker="star"]'); await click('[data-act="bold"]');
    await setVal('#fill', '#ff0000', 'input');
    for (const n of ['T4', 'T5']) {
      eq(await js(`${N(n)}.progress`), 50, n + ' progresso'); eq(await js(`${N(n)}.markers`), ['star'], n + ' marcador');
      eq(await js(`${N(n)}.style.bold`), false, n + ' negrito alternado (o tema já era negrito)'); eq(await js(`${N(n)}.style.fill`), '#ff0000', n + ' cor');
    }
    await click('[data-act="bold"]');
    for (const n of ['T4', 'T5']) eq(await js(`${N(n)}.style.bold`), true, n + ' negrito volta');
    eq(await js(`${N('T6')}.progress`), null, 'não selecionado intacto');
    await click('#markerChips [data-marker="star"]'); eq(await js(`${N('T4')}.markers`), [], 'todos têm → remove de todos');
    await js(`act.undo(); act.undo(); act.undo(); act.undo(); act.undo()`);
  });

  await t('copiar/recortar/colar tópicos pelo MENU: preserva conteúdo, descarta histórico de estudo, ids novos', async () => {
    await c.requireClipboard();
    await js(`(() => { window.__today = '${TODAY}'; const m = new MindMap(createNode('R'));
      const a = m.addChild(m.root.id, 'Origem A'), b = m.addChild(m.root.id, 'Origem B'), d = m.addChild(m.root.id, 'Destino');
      m.addChild(a.id, 'A1'); m.update(a.id, { progress: 40, notes: 'nota A' }); m.toggleMarker(a.id, 'star');
      m.mutateStudy(a.id, (s) => S.addTime(s, '${TODAY}', 30)); m._undo.length = 0; adopt(m); dirty = false; fit(); })()`);
    await js(`__md(__id('Origem A')); __md(__id('Origem B'), { ctrlKey: true })`);
    c.menu('copy'); await wait(80);
    const clipTxt = await c.readClip();
    ok(clipTxt.includes('- Origem A\n  - A1\n- Origem B'), 'texto na área de transferência: ' + JSON.stringify(clipTxt));
    await js(`__md(__id('Destino'))`); c.menu('paste'); await wait(100);
    const kids = await js(`map.find(__id('Destino')).node.children`);
    eq(kids.map((k) => k.title), ['Origem A', 'Origem B']); eq(kids[0].children.map((k) => k.title), ['A1']);
    eq([kids[0].progress, kids[0].notes, kids[0].markers], [40, 'nota A', ['star']], 'conteúdo preservado');
    eq(kids[0].study, undefined, 'histórico de estudo não é copiado');
    const ids = await js(`(() => { const s = new Set(); let n = 0; map.walk((x) => { s.add(x.id); n++; }); return [s.size, n]; })()`);
    eq(ids[0], ids[1], 'ids únicos após colar'); eq(await js(`selIds.size`), 2, 'colados ficam selecionados');
    await js(`act.undo()`); eq(await js(`map.find(__id('Destino')).node.children.length`), 0, 'colar = 1 desfazer');
    // recortar
    await js(`__md(__id('Origem B'))`); c.menu('cut'); await wait(80);
    eq((await c.titles()).includes('1:Origem B'), false, 'recortado saiu'); ok((await c.readClip()).includes('- Origem B'));
    await js(`__md(__id('Destino'))`); c.menu('paste'); await wait(80);
    eq(await js(`map.find(__id('Destino')).node.children.map((x) => x.title)`), ['Origem B']);
    await js(`act.undo(); act.undo()`);
    // raiz não é copiável
    await js(`__md(map.root.id)`); await js(`selIds = new Set([map.root.id]); selectedId = map.root.id`); c.menu('copy'); await wait(50);
    ok((await txt('#status')).includes('Selecione um ou mais tópicos'), 'raiz recusada');
  });

  await t('colar texto de fora vira ramos (edital/lista); vazio e grande demais são recusados', async () => {
    await c.requireClipboard();
    await js(`__md(__id('Destino'))`);
    await c.writeClip('1 Direito Penal\n1.1 Crimes contra a pessoa\n2 Processo Penal');
    c.menu('paste'); await wait(100);
    eq(await js(`map.find(__id('Destino')).node.children.map((x) => x.title)`), ['Direito Penal', 'Processo Penal']);
    eq(await js(`map.find(__id('Direito Penal')).node.children.map((x) => x.title)`), ['Crimes contra a pessoa']);
    await js(`act.undo()`);
    const n0 = await js(`__titles().length`);
    await c.writeClip('   \n  '); c.menu('paste'); await wait(60);
    ok((await txt('#status')).includes('vazia'), 'vazio: ' + (await txt('#status'))); eq(await js(`__titles().length`), n0);
    await c.writeClip(Array.from({ length: 3001 }, (_, i) => `- item ${i}`).join('\n')); c.menu('paste'); await wait(150);
    ok((await txt('#status')).includes('grande demais'), 'limite: ' + (await txt('#status'))); eq(await js(`__titles().length`), n0, 'nada colado');
  });

  await t('dentro de um campo de texto, Copiar/Colar/Selecionar tudo agem no texto e não nos tópicos', async () => {
    await c.requireClipboard();
    const n0 = await js(`__titles().length`);
    await js(`showPanel('notes'); __md(__id('Destino')); notes.focus(); notes.value = 'texto da nota'`);
    c.menu('selectAll'); await wait(60); c.menu('copy'); await wait(60);
    eq(await c.readClip(), 'texto da nota', 'copiou o texto selecionado do campo');
    eq(await js(`selIds.size`), 1, 'seleção de tópicos intacta'); eq(await js(`__titles().length`), n0);
    await js(`notes.blur()`);
  });

  await t('autosave: grava rascunho atômico, apaga ao salvar; recuperação restaura, descarta ou isola arquivo corrompido', async () => {
    const draft = path.join(USERDATA, 'drafts', 'session.json');
    await js(DATASET); await js(`newMap()`); eq(fs.existsSync(draft), false, 'sem rascunho num mapa limpo');
    await js(`act.child(); editor.value = 'Trabalho importante'; __key('Enter', editor)`);
    await c.waitFor(() => fs.existsSync(draft));
    ok(fs.existsSync(draft), 'rascunho gravado'); ok(!fs.existsSync(draft + '.tmp'), 'sem arquivo temporário sobrando');
    ok(JSON.stringify(JSON.parse(fs.readFileSync(draft, 'utf8')).map.root).includes('Trabalho importante'), 'conteúdo no rascunho');
    const file = path.join(TMP, 'sessão ç.mom');
    await js(`window.__dlg.save = ${JSON.stringify(file)}`); ok(await js(`save(true)`));
    ok(!fs.existsSync(draft), 'salvar remove o rascunho');
    // "queda": o rascunho sobra no disco e o app reabre -> Restaurar (volta o conteúdo E o caminho do arquivo)
    await js(`act.child(); editor.value = 'Recuperar-me'; __key('Enter', editor)`); await c.waitFor(() => fs.existsSync(draft));
    ok(fs.existsSync(draft), 'novo rascunho');
    await js(`draftExists = false; newMap()`);                 // simula reinício: estado limpo, rascunho ainda no disco
    ok(fs.existsSync(draft), 'rascunho sobreviveu ao "reinício"');
    await js(`window.__dlg.confirm = 0; window.__dlg.confirms.length = 0`); await js(`recoverSession()`); await wait(100);   // Restaurar
    ok((await c.titles()).some((x) => x.endsWith(':Recuperar-me')), 'restaurou o conteúdo'); eq(await js(`dirty`), true, 'restaurado fica "não salvo"');
    eq(await js(`filePath`), file, 'restaurou o caminho do arquivo');
    ok((await js(`window.__dlg.confirms[0].detail`)).includes('sessão ç.mom'), 'diálogo informa o arquivo');
    // salvar o restaurado grava no mesmo arquivo e limpa o rascunho
    await js(`window.__dlg.save = null`); ok(await js(`save(false)`)); await wait(50);
    ok(!fs.existsSync(draft), 'salvar o restaurado remove o rascunho');
    ok(readMomTitles(file).some((x) => x.endsWith(':Recuperar-me')), 'o arquivo contém o trabalho recuperado');
    // outro "reinício": agora o usuário escolhe Descartar
    await js(`act.child(); editor.value = 'Lixo'; __key('Enter', editor)`); await c.waitFor(() => fs.existsSync(draft));
    await js(`draftExists = false; newMap()`);
    await js(`window.__dlg.confirm = 1`); await js(`recoverSession()`); await wait(100);
    ok(!fs.existsSync(draft), 'descartar remove o rascunho'); ok(!(await c.titles()).some((x) => x.endsWith(':Lixo')), 'descartado não volta');    // arquivo corrompido: não trava, é guardado como .bad
    fs.writeFileSync(draft, '{ isto não é json'); await js(`draftExists = false`);
    const t0 = await js(`__titles().length`);
    await js(`recoverSession()`); await wait(100);
    ok(!fs.existsSync(draft) && fs.existsSync(draft + '.bad'), 'corrompido vira .bad'); ok((await txt('#status')).includes('corrompido'));
    eq(await js(`__titles().length`), t0, 'mapa atual intacto');
    fs.writeFileSync(draft, JSON.stringify({ v: 1, map: { root: { id: 5 } } })); await js(`draftExists = false; recoverSession()`); await wait(100);
    ok(fs.existsSync(draft + '.bad'), 'estrutura inválida também isolada');
  });

  await t('arquivos recentes: gravados em userData, listados no menu e ausentes são ignorados', async () => {
    const f = path.join(TMP, 'recente ã.mom');
    await js(DATASET); await js(`window.__dlg.save = ${JSON.stringify(f)}`); ok(await js(`save(true)`)); await wait(200);
    const list = JSON.parse(fs.readFileSync(path.join(USERDATA, 'recent.json'), 'utf8'));
    eq(list[0], f, 'último salvo no topo');
    await js(`ipcRenderer.invoke('recent:add', ${JSON.stringify(path.join(TMP, 'nao-existe.mom'))})`); await wait(200);
    const menu = c.Menu.getApplicationMenu();
    const arq = menu.items.find((i) => i.label === 'Arquivo').submenu.items.find((i) => i.label === 'Abrir recente');
    const labels = arq.submenu.items.map((i) => i.label);
    ok(labels.includes(f), 'arquivo existente aparece no menu'); ok(!labels.some((l) => l.includes('nao-existe')), 'arquivo ausente é omitido');
    // clicar no item reabre o arquivo
    await js(`newMap()`);
    arq.submenu.items.find((i) => i.label === f).click(undefined, c.win, c.win.webContents); await wait(400);
    eq(await js(`filePath`), f); eq(await js(`map.root.title`), 'Concurso X');
  });

  await t('estudo e prova sobrevivem a salvar → abrir pela interface; painel mostra os mesmos números', async () => {
    await js(DATASET);
    await js(`map.mutateStudy(__id('Crase'), (s) => S.reviewed(S.addQuestions(S.addTime(s, '${TODAY}', 75), 20, 15), { today: '${TODAY}' })); map.setExam({ name: 'Concurso X', date: '2026-10-30' }); render()`);
    const f = path.join(TMP, 'estudos persistidos.mom');
    await js(`window.__dlg.save = ${JSON.stringify(f)}`); ok(await js(`save(true)`));
    await js(`newMap()`); await js(`openPath(${JSON.stringify(f)})`); await wait(200);
    eq(await js(`${N('Crase')}.study.next`), '2026-10-21'); eq(await js(`${N('Crase')}.study.q`), { done: 20, correct: 15 });
    eq(await js(`map.meta.exam`), { name: 'Concurso X', date: '2026-10-30' });
    await js(`act.dash()`);
    eq(await card('Progresso geral'), '70%|2 de 4 tópicos concluídos'); eq(await card('Questões'), '75%|15 acertos em 20');
    await js(`act.dash()`);
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });

  await t('o painel de estudos foi desenhado pela interface esperada (React ou clássica, conforme --classic)', async () => {
    await js(`dirty = false; closeDash(); act.dash()`); await wait(200); eq(await c.ui('#dash'), c.CLASSIC ? 'classic' : 'react'); await js('closeDash()');
  });

  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
