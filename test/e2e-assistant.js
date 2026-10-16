'use strict';
// Ponta a ponta do "assistente de estudo": importação de CSV (IA), agenda, pontos fracos, Alt+setas, backups,
// restaurar versão, reabrir o último mapa, cronômetro ao fechar e registro de erros.
const fs = require('fs');
const path = require('path');
const start = require('./harness');
const { readMom, writeMom } = require('../core/mom');
const { csvTemplate, aiPrompt } = require('../core/csv');
const { backupDirFor, listBackups } = require('../core/backup');
const { TODAY, d, concurso } = require('./fixtures');
const S = require('../core/study');

(async () => {
  const CLASSIC = process.argv.includes('--classic');            // mesma bateria na interface clássica (referência) e na React
  const c = await start('MindCraft e2e — assistente de estudo (CSV, agenda, backups…) — ' + (CLASSIC ? 'interface clássica' : 'interface React'));
  const { js, wait, eq, ok, t, TMP, USERDATA } = c;
  await js(`saveCfg({ reactUi: ${CLASSIC ? 'false' : 'true'} }); true`);
  const ui = (sel) => js(`document.querySelector(${JSON.stringify(sel)}).dataset.ui || 'classic'`);
  const trace = (k) => { if (process.env.E2E_TRACE) console.log('      · passo', k); };
  const txt = (s) => js(`document.querySelector(${JSON.stringify(s)}).textContent`);
  const click = (s) => js(`document.querySelector(${JSON.stringify(s)}).click()`);
  const alt = (key) => js(`document.body.dispatchEvent(new KeyboardEvent('keydown', { key: ${JSON.stringify(key)}, altKey: true, bubbles: true }))`);
  const order = (title) => js(`map.find(__id(${JSON.stringify(title)})).node.children.map((x) => x.title)`);
  const N = (title) => `map.find(__id(${JSON.stringify(title)})).node`;
  const mfile = path.join(TMP, 'concurso.mom'), csvFile = path.join(TMP, 'edital ç.csv');
  writeMom(concurso().m, mfile);
  const open = async (f) => { await js(`window.__today = '${TODAY}'; dirty = false; openPath(${JSON.stringify(f)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(f)}`)); await wait(150); };
  const csvFlow = async (file) => { // abre a janela do CSV e escolhe o arquivo
    await js(`window.__dlg.csv = ${JSON.stringify(file)}; dirty = false; ipcRenderer.emit('menu', {}, 'csv')`);
    await c.waitFor(() => js(`!document.querySelector('#modal').hidden && !!document.querySelector('#csvPick')`));
    await click('#csvPick'); await c.waitFor(() => js(`!document.querySelector('#csvPreview').hidden`));
  };

  await t('CSV: modelo salvo, instruções copiadas, prévia correta e mapa-esqueleto criado (com prova, pesos, hierarquia e links)', async () => {
    trace(1);await js(`dirty = false; ipcRenderer.emit('menu', {}, 'csv')`); await c.waitFor(() => js(`!!document.querySelector('#csvPick')`));
    const tpl = path.join(TMP, 'modelo.csv'); await js(`window.__dlg.save = ${JSON.stringify(tpl)}`); await click('#csvTemplate'); await c.waitFor(() => fs.existsSync(tpl));
    trace(2);eq(fs.readFileSync(tpl, 'utf8'), csvTemplate(), 'o modelo salvo é o oficial');
    trace(3);const clipOk = await c.clipboardOk(); await click('#csvPrompt'); await c.waitFor(async () => /Instruções copiadas|Não consegui copiar/.test(await txt('#csvMsg'))); if (clipOk) ok((await txt('#csvMsg')).includes('Instruções copiadas'), 'mensagem de confirmação: ' + await txt('#csvMsg'));
    eq(await ui('#csvBox'), CLASSIC ? 'classic' : 'react', 'versão da interface em uso');
    if (clipOk) await c.waitFor(async () => (await c.readClip()).replace(/\r\n/g, '\n') === aiPrompt());   // o Windows converte \n em \r\n; sem clipboard no SO, só a mensagem é verificada
    trace(4);await click('#csvCancel'); ok(await js(`document.querySelector('#modal').hidden`));
    trace(5);await csvFlow(tpl);
    const prev = await txt('#csvPreview'); ok(prev.includes('7 tópicos em 3 disciplina(s) · prova em 29/11/2026'), prev); ok(prev.includes('Língua Portuguesa — 4 tópico(s)'));
    trace(6);eq(await js(`document.querySelector('#csvOk').disabled`), false); eq(await js(`document.querySelector('#csvTitle').value`), 'TRF 2ª Região — Analista');
    trace(7);await click('#csvOk'); await c.waitFor(() => js(`map.root.title === 'TRF 2ª Região — Analista'`));
    trace(8);eq(await js(`map.root.children.map((x) => x.title)`), ['Língua Portuguesa', 'Direito Constitucional', 'Direito Administrativo']);
    trace(9);eq(await js(`map.meta.exam`), { name: 'TRF 2ª Região — Analista', date: '2026-11-29' }); eq(await js(`dirty`), true); eq(await js(`filePath`), null);
    trace(10);eq(await js(`${N('Princípios fundamentais')}.study.weight`), 5); eq(await js(`${N('Emprego do sinal indicativo de crase')}.children.length`), 0);
    trace(11);eq(await js(`map.find(__id('Ortografia oficial')).node.children.map((x) => x.title)`), ['Emprego do sinal indicativo de crase']);
    // a rede nasce semeada: os "relacionados" viram links que resolvem
    trace(12);await js(`__md(__id('Emprego do sinal indicativo de crase')); renderLinks()`); await wait(150);
    trace(13);eq(await js(`[...document.querySelectorAll('#linksBody .lk .t')].map((e) => e.textContent).slice(0, 1)`), ['Regência verbal'], 'o link de saída aponta para o tópico relacionado');
    trace(14);ok((await js(`[...document.querySelectorAll('#linksBody h4')].map((e) => e.textContent)`)).some((h) => h.startsWith('Links deste tópico (1)')), 'tem 1 link de saída');
    trace(15);ok(await js(`document.querySelector('#modal').hidden`));
  });

  await t('CSV: arquivos ruins mostram o motivo, não criam nada e não derrubam o app', async () => {
    const t0 = await js(`map.root.title`);
    for (const [name, body, re] of [['vazio.csv', '', /vazio/], ['semcol.csv', 'a,b\n1,2\n', /obrigatórias/], ['soheader.csv', 'disciplina,topico\n', /Nenhuma linha válida/]]) {
      const f = path.join(TMP, name); fs.writeFileSync(f, body); await csvFlow(f);
      ok(re.test(await txt('#csvPreview')), name + ': ' + (await txt('#csvPreview'))); eq(await js(`document.querySelector('#csvOk').disabled`), true, name);
      await click('#csvCancel');
    }
    eq(await js(`map.root.title`), t0, 'mapa atual intacto');
    // linhas com problemas: importa as boas e relata as ruins (com o número da linha)
    const f = path.join(TMP, 'misto.csv'); fs.writeFileSync(f, 'disciplina;item;topico;peso\nDireito;1;Bom;9\n;2;Sem disciplina;\nDireito;3;;\nDireito;4;Outro;2\n', 'latin1');
    await csvFlow(f); const prev = await txt('#csvPreview');
    ok(prev.includes('2 tópicos em 1 disciplina(s)') && prev.includes('2 linha(s) puladas') && prev.includes('Linha 3: Linha sem disciplina') && prev.includes('Linha 4:') && prev.includes('peso "9" inválido'), prev);
    await js(`document.querySelector('#csvTitle').value = 'Meu concurso'`); await click('#csvOk'); await c.waitFor(() => js(`map.root.title === 'Meu concurso'`));
    eq(await js(`map.root.children[0].children.map((x) => x.title)`), ['Bom', 'Outro']);
  });

  await t('CSV: adicionar abaixo do tópico selecionado; mapa grande abre recolhido até o nível 2', async () => {
    await open(mfile);
    const f = path.join(TMP, 'extra.csv'); fs.writeFileSync(f, 'disciplina,item,topico\nNova disciplina,1,Alfa\nNova disciplina,1.1,Beta\n');
    await js(`__md(__id('Informática'))`); await csvFlow(f);
    await js(`document.querySelector('input[name=csvMode][value=add]').checked = true`); await click('#csvOk'); await c.waitFor(() => js(`!!__id('Nova disciplina')`));
    eq(await order('Informática'), ['Segurança da informação', 'Redes', 'Nova disciplina']); eq(await order('Nova disciplina'), ['Alfa']);
    // 200 linhas => > 150 tópicos => abre até o nível 2
    const lines = ['disciplina,item,topico']; for (let i = 0; i < 200; i++) lines.push(`D${i % 5},${(i % 10) + 1},T${i}`);
    const big = path.join(TMP, 'grande.csv'); fs.writeFileSync(big, lines.join('\n')); await csvFlow(big); await click('#csvOk'); await c.waitFor(() => js(`map.root.children.length === 5`));
    ok((await txt('#status')).includes('abri até o nível 1'), await txt('#status')); eq(await js(`L.boxes.size`), 6, 'raiz + 5 disciplinas (200 tópicos escondidos)');
  });

  await t('agenda de 28 dias: contagens, dia de hoje com atrasadas, detalhe ao clicar e navegação até o tópico', async () => {
    await open(mfile); await js(`act.dash()`); await wait(250);
    eq(await js(`document.querySelectorAll('#agenda .ag-day').length`), 28); eq(await js(`document.querySelectorAll('#agenda .ag-pad').length`), 2, '20/10/2026 é terça-feira');
    eq(await js(`document.querySelector('#agenda .ag-day.today b').textContent`), '3'); ok(await js(`document.querySelector('#agenda .ag-day.today').classList.contains('late')`), 'atrasadas em vermelho');
    eq(await js(`[...document.querySelectorAll('#agendaDetail .rev b')].map((e) => e.textContent).sort()`), ['Direitos fundamentais', 'Princípios fundamentais', 'Regência']);
    eq(await js(`document.querySelectorAll('#agenda .ag-day.has').length`), 4, 'dias com revisão: hoje, +1, +2 e +6');
    await js(`document.querySelector('#agenda .ag-day[data-date="${d(1)}"]').click()`); eq(await js(`[...document.querySelectorAll('#agendaDetail .rev b')].map((e) => e.textContent)`), ['Atos administrativos']);
    await js(`document.querySelector('#agenda .ag-day[data-date="${d(10)}"]').click()`); ok((await txt('#agendaDetail')).includes('Nada agendado'));
    await js(`document.querySelector('#agenda .ag-day[data-date="${d(2)}"]').click(); document.querySelector('#agendaDetail .rev .t').click()`);
    ok(await js(`document.querySelector('#dash').hidden`), 'painel fecha'); eq(await js(`map.find(selectedId).node.title`), 'Legalidade');
  });

  await t('pontos fracos e acerto semanal: ranking pela UI, registro de questões por dia e relatório', async () => {
    await open(mfile); await js(`act.dash()`); await wait(200);
    eq(await js(`[...document.querySelectorAll('#weakSec .rev')].map((r) => r.querySelector('b').textContent + '|' + r.querySelector('.tag').textContent)`), ['Atos administrativos|12/25 · 48%']);
    await js(`act.dash(); showPanel('study'); __md(__id('Licitações'))`);
    await js(`document.querySelector('#qDone').value = '10'; document.querySelector('#qOk').value = '3'; document.querySelector('#qAdd').click()`);
    eq(await js(`${N('Licitações')}.study.qlog['${TODAY}']`), { done: 10, correct: 3 });
    await js(`act.dash()`); await wait(200);
    eq(await js(`[...document.querySelectorAll('#weakSec .rev b')].map((e) => e.textContent)`), ['Licitações', 'Atos administrativos'], 'pior primeiro');
    const sub = await js(`[...document.querySelectorAll('#dash .card')].find((x) => x.querySelector('.k').textContent === 'Questões').querySelector('.s').textContent`);
    ok(/7 dias: 3\/10 \(30%\)/.test(sub), sub);
    const md = path.join(TMP, 'rel.md'); await js(`window.__dlg.save = ${JSON.stringify(md)}`); await click('#btnReportMd'); await c.waitFor(() => fs.existsSync(md));
    ok(/## Pontos fracos/.test(fs.readFileSync(md, 'utf8')) && /Licitações — 3\/10 \(30%\)/.test(fs.readFileSync(md, 'utf8')));
    await js(`act.dash()`);
  });

  await t('Alt+setas reordenam e mudam de nível (1 desfazer cada); limites e multisseleção explicam em vez de falhar', async () => {
    await js(`dirty = false; newMap(); ['Tópico 1', 'Tópico 2', 'Tópico 3'].forEach((x) => 0); true`);
    await js(`__md(__id('Tópico 2'))`); await alt('ArrowUp'); eq(await js(`map.root.children.map((x) => x.title)`), ['Tópico 2', 'Tópico 1', 'Tópico 3']);
    await alt('ArrowUp'); ok((await txt('#status')).includes('primeiro'), await txt('#status')); await alt('ArrowDown'); eq(await js(`map.root.children.map((x) => x.title)`), ['Tópico 1', 'Tópico 2', 'Tópico 3']);
    await alt('ArrowRight'); eq(await order('Tópico 1'), ['Tópico 2'], 'rebaixou: virou filho do irmão anterior'); await alt('ArrowLeft'); eq(await js(`map.root.children.map((x) => x.title)`), ['Tópico 1', 'Tópico 2', 'Tópico 3']);
    await alt('ArrowLeft'); ok((await txt('#status')).includes('primeiro nível'), await txt('#status'));
    await js(`act.undo()`); eq(await order('Tópico 1'), ['Tópico 2'], 'um desfazer reverte uma operação');
    await js(`__md(__id('Tópico 1')); __md(__id('Tópico 3'), { ctrlKey: true })`); await alt('ArrowUp'); ok((await txt('#status')).includes('único tópico'), await txt('#status'));
    await js(`__md(map.root.id)`); await alt('ArrowDown'); await alt('ArrowRight'); eq(await js(`map.root.children.length`) > 0, true, 'a raiz não se move e nada quebra');
    for (const [k, p] of [['1', 'props'], ['2', 'study'], ['3', 'notes'], ['4', 'links'], ['5', 'outline']]) { await alt(k); eq(await js(`[...document.querySelectorAll('#panels .panel')].filter((x) => !x.hidden).map((x) => x.dataset.panel)`), [p], 'Alt+' + k); }
    await alt('1');
  });

  await t('backup automático ao salvar por cima; restaurar versão abre como mapa NOVO sem tocar o original', async () => {
    const f = path.join(TMP, 'estudo ç.mom'), root = path.join(USERDATA, 'backups');
    await js(`dirty = false; newMap(); map.root.title = 'Versão 1'; render()`); await js(`window.__dlg.save = ${JSON.stringify(f)}`); ok(await js(`save(true)`));
    eq(listBackups(backupDirFor(root, f)).length, 0, 'primeiro salvamento: nada a guardar');
    await js(`map.root.title = 'Versão 2'; dirty = true; save(false)`); await c.waitFor(() => listBackups(backupDirFor(root, f)).length === 1);
    const b = listBackups(backupDirFor(root, f))[0]; eq(readMom(fs.readFileSync(b.file)).root.title, 'Versão 1', 'o backup é a versão anterior');
    await js(`map.root.title = 'Versão 3'; dirty = true; save(false)`); await wait(300); eq(listBackups(backupDirFor(root, f)).length, 1, 'salvar de novo em seguida não duplica (intervalo mínimo)');
    eq(readMom(fs.readFileSync(f)).root.title, 'Versão 3');
    await js(`window.__dlg.openAt = ${JSON.stringify(b.file)}; window.__dlg.discard = 1; dirty = false; restoreVersion()`); await c.waitFor(() => js(`map.root.title === 'Versão 1'`));
    eq(await js(`filePath`), null, 'abre como mapa novo'); eq(await js(`dirty`), true); eq(readMom(fs.readFileSync(f)).root.title, 'Versão 3', 'o original não foi tocado');
    ok((await txt('#status')).includes('Versão anterior aberta como mapa novo'));
    await js(`dirty = false; newMap(); restoreVersion()`); ok((await txt('#status')).includes('Salve o mapa primeiro'));
  });

  await t('reabrir o último mapa e o painel ao iniciar (configurável); sem arquivo recente não faz nada', async () => {
    const f = path.join(TMP, 'estudo ç.mom');
    await js(`removeDraft(); dirty = false; newMap(); saveCfg({ reopenLast: true, dashOnStart: false })`); await js(`init()`); await c.waitFor(() => js(`filePath === ${JSON.stringify(f)}`));
    eq(await js(`map.root.title`), 'Versão 3', 'voltou de onde parou');
    await js(`saveCfg({ reopenLast: false }); dirty = false; newMap()`); await js(`init()`); await wait(300); eq(await js(`filePath`), null, 'com a opção desligada começa em branco');
    await js(`saveCfg({ reopenLast: true, dashOnStart: true }); dirty = false; newMap(); closeDash()`); await js(`init()`); await c.waitFor(() => js(`!document.querySelector('#dash').hidden`));
    ok(await js(`document.querySelector('#optDashStart').checked && document.querySelector('#optReopen').checked`), 'opções refletem a configuração');
    await js(`document.querySelector('#optReopen').click(); document.querySelector('#optDashStart').click()`);
    eq(JSON.parse(fs.readFileSync(path.join(USERDATA, 'config.json'), 'utf8')).reopenLast, false, 'a opção do painel grava na configuração'); eq(JSON.parse(fs.readFileSync(path.join(USERDATA, 'config.json'), 'utf8')).dashOnStart, false);
    await js(`closeDash(); saveCfg({ reopenLast: true, startScreen: 'last' })`);
    // arquivo recente que não existe mais é ignorado; arquivo corrompido não mostra diálogo
    fs.writeFileSync(path.join(USERDATA, 'recent.json'), JSON.stringify([path.join(TMP, 'sumiu.mom')])); await js(`dirty = false; newMap()`); await js(`init()`); await wait(300); eq(await js(`filePath`), null);
    const bad = path.join(TMP, 'ruim.mom'); fs.writeFileSync(bad, 'lixo'); fs.writeFileSync(path.join(USERDATA, 'recent.json'), JSON.stringify([bad])); await js(`window.__dlg.errors.length = 0; dirty = false; newMap()`); await js(`init()`); await wait(400);
    eq(await js(`window.__dlg.errors.length`), 0, 'sem diálogo de erro ao reabrir automaticamente'); ok((await txt('#status')).includes('Não reabri o último mapa'), await txt('#status'));
  });

  await t('cronômetro rodando ao fechar: o tempo é registrado no tópico e salvo antes de fechar; o aviso sabe do cronômetro', async () => {
    await open(mfile); await js(`showPanel('study'); __md(__id('Licitações'))`); await click('#timerBtn');
    await js(`window.__sent = []; window.__origSend = ipcRenderer.send.bind(ipcRenderer); ipcRenderer.send = (ch, ...a) => { window.__sent.push([ch, ...a]); if (ch !== 'close-now') window.__origSend(ch, ...a); }; true`);
    await js(`timer.start -= 5 * 60000; render()`);
    const last = await js(`window.__sent.filter((x) => x[0] === 'dirty').pop()`); eq(last[1], { dirty: false, timing: true }, 'o processo principal fica sabendo do cronômetro');
    await js(`ipcRenderer.emit('menu', {}, 'save-and-close')`); await c.waitFor(() => js(`window.__sent.some((x) => x[0] === 'close-now')`));
    eq(await js(`timer`), null);
    const saved = readMom(fs.readFileSync(mfile)); let lic; saved.walk((n) => { if (n.title === 'Licitações') lic = n; });
    eq(lic.study.log[TODAY], 5, '5 min gravados no arquivo');
    await js(`ipcRenderer.send = window.__origSend; true`);
  });

  await t('registro de erros: erros inesperados vão para logs/erros.log; falha esperada ao abrir arquivo também, sem console.error', async () => {
    const log = path.join(USERDATA, 'logs', 'erros.log');
    await js(`report('falha inventada pelo teste')`); ok(fs.readFileSync(log, 'utf8').includes('falha inventada pelo teste'));
    await js(`dirty = false; openPath(${JSON.stringify(path.join(TMP, 'ruim.mom'))})`); await c.waitFor(() => /Não foi possível abrir/.test(fs.readFileSync(log, 'utf8')));
    const arq = c.Menu.getApplicationMenu().items.find((i) => i.label === 'Arquivo').submenu.items.map((i) => i.label);
    for (const l of ['Restaurar versão anterior…', 'Abrir pasta de backups', 'Abrir pasta de registros de erro', 'Importar CSV de edital (gerado por IA)…']) ok(arq.includes(l), 'menu sem "' + l + '"');
  });

  await t('planilha de planejamento: exporta, edita fora do app, mostra a prévia e aplica tudo de uma vez (1 desfazer); reimportar não duplica', async () => {
    const { parseCsv } = require('../core/csv');
    await open(mfile); const title = await js('map.root.title');
    await js(`dirty = false; ipcRenderer.emit('menu', {}, 'plan')`); await c.waitFor(() => js("!!document.querySelector('#planExport')"));
    const out = path.join(TMP, 'plano ç.csv'); await js(`window.__dlg.save = ${JSON.stringify(out)}`); await click('#planExport'); await c.waitFor(() => fs.existsSync(out));
    eq(await ui('#planBox'), CLASSIC ? 'classic' : 'react', 'versão da interface em uso'); ok((await txt('#planMsg')).includes('Planilha salva'), await txt('#planMsg'));
    const { rows } = parseCsv(fs.readFileSync(out, 'utf8')); const h = rows[0]; const r = rows.find((x) => x[h.indexOf('topico')] === 'Licitações');
    ok(r, 'linha de Licitações na planilha'); r[h.indexOf('peso')] = '5'; r[h.indexOf('progresso')] = '70'; r[h.indexOf('tempo_total_min')] = String(Number(r[h.indexOf('tempo_total_min')] || 0) + 45);
    const rr = rows.find((x) => x[h.indexOf('topico')] === 'Legalidade'); rr[h.indexOf('notas')] = 'revisar com a súmula';
    rows.push(['', 'Direito Administrativo', '', 'Improbidade administrativa', '3', '', '', '', '', '', '', '', '', ''].slice(0, h.length));
    const edited = path.join(TMP, 'plano editado.csv'); fs.writeFileSync(edited, '\uFEFF' + rows.map((x) => x.join(';')).join('\r\n'), 'utf8');
    await js(`window.__dlg.csv = ${JSON.stringify(edited)}`); await click('#planPick'); await c.waitFor(() => js("!document.querySelector('#planPreview').hidden"));
    const prev = await txt('#planPreview'); ok(/4 mudança\(s\)|\d+ mudança\(s\)/.test(prev) && prev.includes('Licitações — peso') && prev.includes('Improbidade administrativa') && prev.includes('revisar com a súmula'), prev);
    eq(await js(`${N('Licitações')}.study.weight`) === 5, false, 'a prévia NÃO altera o mapa'); eq(await js('dirty'), false);
    await click('#planOk'); await c.waitFor(() => js('dirty'));
    const lic = N('Licitações'); eq(await js(`${lic}.study.weight`), 5); eq(await js(`${lic}.progress`), 70); ok((await js(`${lic}.study.log['${TODAY}']`)) >= 45);
    eq(await js(`${N('Legalidade')}.notes`), 'revisar com a súmula'); ok(await js(`!!__id('Improbidade administrativa')`), 'tópico novo criado'); eq(await js('map.root.title'), title);
    ok((await txt('#status')).includes('Planilha aplicada'), await txt('#status'));
    await js('act.undo()'); eq(await js(`${N('Licitações')}.study.weight === 5`), false, 'um desfazer reverte tudo'); eq(await js("!!__id('Improbidade administrativa')"), false);
    await js('act.redo()');
    // reimportar a mesma planilha: nada a fazer
    await js(`dirty = false; ipcRenderer.emit('menu', {}, 'plan')`); await c.waitFor(() => js("!!document.querySelector('#planPick')")); await click('#planPick'); await c.waitFor(() => js("!document.querySelector('#planPreview').hidden"));
    ok((await txt('#planPreview')).includes('Nenhuma mudança a aplicar') || /warn|já existe/.test(await txt('#planPreview')), await txt('#planPreview')); eq(await js("document.querySelector('#planOk').disabled"), true);
    await click('#planCancel');
    // planilha de OUTRO mapa é recusada com explicação
    const other = path.join(TMP, 'outro.csv'); fs.writeFileSync(other, 'id;topico;peso\nt-0123456789;X;5\n'); await js(`window.__dlg.csv = ${JSON.stringify(other)}; ipcRenderer.emit('menu', {}, 'plan')`);
    await c.waitFor(() => js("!!document.querySelector('#planPick')")); await click('#planPick'); await c.waitFor(() => js("!document.querySelector('#planPreview').hidden"));
    ok((await txt('#planPreview')).includes('não existe neste mapa'), await txt('#planPreview')); eq(await js("document.querySelector('#planOk').disabled"), true); await click('#planCancel');
    // exportar só a disciplina selecionada
    await js(`__md(__id('Informática')); ipcRenderer.emit('menu', {}, 'plan')`); await c.waitFor(() => js("!!document.querySelector('input[name=planScope][value=sel]')"));
    await js("document.querySelector('input[name=planScope][value=sel]').checked = true"); const part = path.join(TMP, 'parte.csv'); await js(`window.__dlg.save = ${JSON.stringify(part)}`); await click('#planExport'); await c.waitFor(() => fs.existsSync(part));
    const pr = parseCsv(fs.readFileSync(part, 'utf8')).rows.slice(1); ok(pr.length >= 2 && pr.every((x) => x[1] === 'Informática'), 'só a disciplina: ' + pr.length); await click('#planCancel');
  });

  await t('nenhum erro de console durante toda a sessão (além do erro inventado de propósito)', async () => {
    const real = c.errors.filter((e) => !/falha inventada pelo teste/.test(e)); eq(real, [], 'erros de console');
  });

  void S;
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
