'use strict';
// Gera a pasta de evidências (screenshots + exemplos reais de exportação + índice).  `npm run evidence`
// Reproduzível: data fixa (2026-10-20), mapas de exemplo montados pelo próprio script, app REAL em execução.
const fs = require('fs');
const path = require('path');
const { BrowserWindow } = require('electron');
const start = require('./harness');
const { MindMap, createNode } = require('../core/model');
const { writeMom } = require('../core/mom');
const { toPDF } = require('../core/export');
const { toStudyMarkdown, toStudyDOCX } = require('../core/report');
const { exportObsidian } = require('../core/obsidian');
const S = require('../core/study');

const OUT = path.join(__dirname, '..', 'evidencias');
const { TODAY, d, concurso } = require('./fixtures');

(async () => {
  // limpa SÓ o que este script gera (a pasta também guarda qa/, logs/ e RESULTADOS.md de outros scripts)
  for (const d of ['telas', 'exemplos']) fs.rmSync(path.join(OUT, d), { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'telas'), { recursive: true }); fs.mkdirSync(path.join(OUT, 'exemplos'), { recursive: true });
  const c = await start('MindCraft — gerando evidências');
  const { js, wait, TMP } = c;
  c.win.setSize(1500, 920); await wait(400);
  const index = [], failures = [];
  let n = 0;
  async function step(slug, title, proves, fn) {
    n++; const file = `${String(n).padStart(2, '0')}_${slug}.png`;
    try { await fn(); await c.shot(path.join(OUT, 'telas', file)); index.push({ file: 'telas/' + file, title, proves }); console.log('  ok   ' + file); }
    catch (e) { failures.push(`${file}: ${e.message}`); console.log('  FAIL ' + file + ' — ' + e.message); }
  }
  const mom = (name, build, dir) => { const m = new MindMap(createNode(name)); build(m); const f = path.join(dir, name + '.mom'); writeMom(m, f); return f; };

  // dados de apoio: o mapa principal fica salvo num "vault" junto com 2 mapas de apoio que apontam para ele
  const vault = path.join(TMP, 'estudos'); fs.mkdirSync(vault, { recursive: true });
  const { m: main } = concurso();
  const fMain = path.join(vault, 'Concurso TRF 2026.mom'); writeMom(main, fMain);
  mom('Resumos de Português', (m) => { const a = m.addChild(m.root.id, 'Resumo de crase'); const b = m.addChild(m.root.id, 'Resumo de regência'); m.addChild(m.root.id, 'Pegadinhas de concordância');
    m.update(a.id, { notes: 'Detalhes em [[Concurso TRF 2026#Crase]]. Cai muito junto com [[Resumo de regência]].' }); m.update(b.id, { notes: 'Ver [[Concurso TRF 2026#Regência]].' }); }, vault);
  mom('Questões comentadas', (m) => { const a = m.addChild(m.root.id, 'Questões de Direito Constitucional'); const b = m.addChild(m.root.id, 'Questões de Administrativo'); m.addChild(m.root.id, 'Erros recorrentes');
    m.update(a.id, { notes: 'Foco em [[Concurso TRF 2026#Princípios fundamentais]] e [[Concurso TRF 2026#Direitos fundamentais]].' }); m.update(b.id, { notes: 'Revisar [[Concurso TRF 2026#Atos administrativos]] e [[Concurso TRF 2026#Licitações]]. Anotar em [[Erros recorrentes]].' }); }, vault);

  await js(`window.__gn = (title) => [...document.querySelectorAll('#gview .gn')].find((x) => x.querySelector('title').textContent.split(' — ')[0].replace(' (não existe)', '') === title);
    window.__gclick = (title) => { const n = __gn(title); n.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 5, clientY: 5 })); window.dispatchEvent(new MouseEvent('mouseup')); }; true`);
  const load = async (file) => { await js(`window.__today = '${TODAY}'; (async () => { await openPath(${JSON.stringify(file)}); render(); fit(); })()`); await wait(300); };
  const quiet = () => js(`(() => { closeGraph && closeGraph(); closeDash && closeDash(); const m = document.querySelector('#modal'); m.hidden = true; m.textContent = ''; })()`);

  console.log('\nGerando telas…\n');
  await js(`window.__today = '${TODAY}'; ipcRenderer.invoke('recent:add', ${JSON.stringify(fMain)})`);

  await step('mapa-inicial', 'Tela inicial', 'App abre com barra de ferramentas, painéis e prancheta (tema escuro).', async () => { await js(`fit()`); });
  await step('mapa-de-estudo', 'Mapa de estudo do concurso', 'Progresso agregado (barras azuis nos blocos), marcadores, relações, selos ↻ de revisão pendente e notas.', async () => {
    await load(fMain); await js(`__md(__id('Princípios fundamentais'))`); });
  await step('estudo-do-topico', 'Painel "Estudo do tópico"', 'Peso, próxima revisão, ciclo, tempo (cronômetro e manual) e questões do tópico selecionado.', async () => {
    await js(`__md(__id('Regência')); showPanel('study')`); });
  await step('painel-de-estudos', 'Painel de estudos', 'Contagem regressiva, progresso geral, tempo, sequência, acerto em questões, plano por dia, disciplinas e revisões.', async () => {
    await js(`showPanel('props'); act.dash()`); });
  await step('revisoes-e-semana', 'Revisões pendentes e próximos 7 dias', 'Fila de revisão ordenada (mais atrasada primeiro) com ✓/↻ rápidos.', async () => { await js(`document.querySelector('#dash').scrollTop = 9999`); });
  await step('painel-claro', 'Painel de estudos no tema claro', 'A interface tem tema claro/escuro.', async () => { await js(`document.querySelector('#dash').scrollTop = 0; setLight(true)`); });
  await step('mapa-claro', 'Mapa no tema claro', 'Mesmo mapa no tema claro da interface.', async () => { await js(`setLight(false); closeDash(); showPanel('outline'); setLight(true)`); });
  await js(`setLight(false)`);

  await step('conexoes-e-links', 'Painel de Conexões', 'Links de saída, "citado em" (retrolinks) e menções sem link do tópico selecionado.', async () => {
    await js(`closeDash(); setLight(false); __md(__id('Legalidade')); showPanel('links'); renderLinks()`); await wait(300); });
  await step('mencao-sem-link', 'Menção sem link', 'O app detecta "moralidade" no texto de "Atos administrativos" e oferece transformar em [[link]].', async () => {
    await js(`__md(__id('Atos administrativos')); renderLinks()`); await wait(300); });
  await step('autocompletar-links', 'Autocompletar [[', 'Digitar [[ nas notas sugere tópicos do mapa (e Mapa#Tópico de outros mapas do vault).', async () => {
    await js(`showPanel('notes'); __md(__id('Redes')); notes.focus(); notes.value = 'Depende de [[seg'; notes.setSelectionRange(notes.value.length, notes.value.length); notes.dispatchEvent(new Event('input', { bubbles: true }))`); await wait(300); });
  await js(`notes.value = ''; notes.blur(); hideSuggest(); showPanel('props')`);

  await step('grafo-do-mapa', 'Rede de conhecimento — este mapa', 'Grafo de forças: tópicos ligados por [[links]] e relações; o pontilhado seria um link sem destino.', async () => {
    await js(`closeGraph(); gBuilt = false; Object.assign(gOpt, { hier: true, orphans: true, local: false, q: '' }); gPinned = new Map(); gLayoutSig = ''; saveCfg({ scope: 'map' }); act.graph()`); await wait(700);
    await js(`gSel = null; renderGraph(false)`); });
  await step('grafo-detalhe', 'Grafo — detalhes do nó', 'Selecionar um nó mostra seus links e retrolinks no painel lateral.', async () => { await js(`__gclick('Legalidade')`); });
  await step('grafo-so-links', 'Grafo — só links', 'Desligando "Hierarquia", sobram apenas os [[links]] e as relações (como o grafo do Obsidian).', async () => { await js(`document.querySelector('#gHier').click()`); await wait(500); });
  await step('grafo-vizinhanca', 'Grafo — vizinhança local + busca', 'Só os vizinhos do nó selecionado (1 salto) e destaque da busca.', async () => {
    await js(`document.querySelector('#gHier').click(); document.querySelector('#gLocal').click()`);   // hierarquia volta a ligar await wait(300);
    await js(`(() => { const s = document.querySelector('#gSearch'); s.value = 'princ'; s.dispatchEvent(new Event('input', { bubbles: true })); })()`); });
  await step('grafo-vault', 'Grafo — vault com 3 mapas', 'Escolhendo a pasta, mapas diferentes (cores) se ligam por [[Mapa#Tópico]].', async () => {
    await js(`document.querySelector('#gLocal').click(); (() => { const s = document.querySelector('#gSearch'); s.value = ''; s.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await js(`window.__dlg.folder = ${JSON.stringify(vault)}`); await js(`document.querySelector('#gPick').click()`);
    await c.waitFor(async () => (await js(`document.querySelector('#gStat').textContent`)).includes('3 mapa(s)')); await wait(900); await js(`gSel = null; renderGraph(false)`); });
  await step('exportar-obsidian', 'Exportação para o Obsidian', 'Gera um .md por mapa com [[Mapa#Tópico]] (ver exemplos/obsidian-vault/).', async () => {
    await js(`window.__dlg.folder = ${JSON.stringify(path.join(TMP, 'destino'))}`); await js(`document.querySelector('#gExport').click()`);
    await c.waitFor(() => js(`!!document.querySelector('#gMsg')`)); await js(`document.querySelector('#gObsidian').click()`); await wait(400); });
  const vaultOut = path.join(TMP, 'destino', 'MindCraft');
  if (fs.existsSync(vaultOut)) fs.cpSync(vaultOut, path.join(OUT, 'exemplos', 'obsidian-vault'), { recursive: true });

  await step('multisselecao', 'Seleção múltipla', 'Ctrl/Shift+clique e retângulo de seleção; ações valem para todos os selecionados.', async () => {
    await js(`closeGraph(); __md(__id('Crase')); __md(__id('Regência'), { ctrlKey: true }); __md(__id('Concordância'), { ctrlKey: true }); __md(__id('Princípios fundamentais'), { ctrlKey: true })`); await wait(250); });
  await step('lote-formatado', 'Formatação em lote', 'Cor, marcador e progresso aplicados a vários tópicos de uma vez (um único desfazer).', async () => {
    await js(`document.querySelector('#markerChips [data-marker="star"]').click(); document.querySelector('#progressChips [data-value="75"]').click()`); });
  await js(`act.undo(); act.undo()`);

  await step('importar-edital', 'Importar edital', 'Cola o conteúdo programático; o app detecta disciplinas, numeração, itens a) e junta linhas quebradas do PDF.', async () => {
    await js(`dirty = false; act.edital()`);
    await js(`(() => { const t = document.querySelector('#impText'); t.value = ${JSON.stringify('LÍNGUA PORTUGUESA\n1 Compreensão e interpretação de textos.\n2 Ortografia oficial; acentuação\ngráfica.\n2.1 Emprego do sinal indicativo de crase\n3 Regência verbal\n   a) verbos transitivos\n   b) verbos intransitivos\nDIREITO CONSTITUCIONAL:\n1. Princípios fundamentais\n1.1 Direitos e garantias\n2. Organização do Estado\n3. Controle de constitucionalidade\nDIREITO ADMINISTRATIVO\n1 Atos administrativos\n2 Licitações e contratos')}; t.dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('#impTitle').value = 'TRF 2026 — Edital'; })()`); });
  await step('edital-importado', 'Mapa gerado pelo edital', 'O edital virou mapa: disciplinas → itens → subitens.', async () => { await js(`document.querySelector('#impOk').click()`); await wait(600); });
  await step('modelo-concurso', 'Modelo de concurso', 'Estrutura pronta (disciplinas × Teoria/Resumos/Questões/Revisão).', async () => { await js(`dirty = false; act.template()`); await wait(700); });

  await step('apresentacao', 'Modo apresentação', 'Revela os tópicos um a um em tela cheia (útil para revisar em voz alta).', async () => {
    await load(fMain); await js(`startPresent()`); await wait(500); await js(`presentStep(1); presentStep(1); presentStep(1); presentStep(1)`); await wait(300); });
  await js(`stopPresent()`); await wait(500);

  // ---------- exemplos reais gerados (arquivos) ----------
  console.log('\nGerando exemplos de exportação…\n');
  const { m: ex } = concurso();
  fs.writeFileSync(path.join(OUT, 'exemplos', 'mapa.pdf'), await toPDF(ex, { outline: true, today: TODAY }));
  fs.writeFileSync(path.join(OUT, 'exemplos', 'relatorio-de-estudos.md'), toStudyMarkdown(ex, { today: TODAY }));
  fs.writeFileSync(path.join(OUT, 'exemplos', 'relatorio-de-estudos.docx'), await toStudyDOCX(ex, { today: TODAY }));
  fs.copyFileSync(fMain, path.join(OUT, 'exemplos', 'Concurso TRF 2026.mom'));
  // o PDF, renderizado pelo visualizador do Chromium (prova visual de que o arquivo abre e tem o conteúdo)
  try {
    const w2 = new BrowserWindow({ width: 1100, height: 800, show: false, webPreferences: { plugins: true } });
    await w2.loadFile(path.join(OUT, 'exemplos', 'mapa.pdf')); await wait(1800);
    fs.writeFileSync(path.join(OUT, 'telas', `${String(++n).padStart(2, '0')}_pdf-exportado.png`), (await w2.webContents.capturePage()).toPNG());
    index.push({ file: `telas/${String(n).padStart(2, '0')}_pdf-exportado.png`, title: 'PDF exportado', proves: 'O mapa (selos, barras, relações) e o outline em página A4, abertos no visualizador de PDF.' });
    console.log('  ok   pdf-exportado'); w2.destroy();
  } catch (e) { failures.push('pdf-exportado: ' + e.message); }

  // ---------- índice ----------
  const md = ['# Evidências do MindCraft', '', `Geradas automaticamente por \`npm run evidence\` (app real em execução; data de referência dos mapas: **${TODAY}**).`, '',
    '## Telas', '', ...index.flatMap((i) => [`### ${i.title}`, i.proves, '', `![${i.title}](${i.file})`, ''])];
  fs.writeFileSync(path.join(OUT, 'README.md'), md.join('\n'));
  fs.writeFileSync(path.join(OUT, 'telas', '_indice.json'), JSON.stringify(index, null, 2));
  console.log(`\n${index.length} telas geradas em ${OUT}${failures.length ? '\nFALHAS:\n' + failures.join('\n') : ''}\n`);
  const { app } = require('electron');
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* temporários */ }
  app.exit(failures.length ? 1 : 0);
})().catch((e) => { console.error('Falha:', e); require('electron').app.exit(2); });
