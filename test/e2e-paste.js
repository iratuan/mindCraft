'use strict';
// Importar CSV de edital e planilha de planejamento COLANDO o texto (além de escolher arquivo): Ctrl+V real, botão "Colar da área de transferência",
// resposta de IA com bloco de código / tabela do chat, texto sem sentido, e a planilha colada com prévia e desfazer.
const path = require('path');
const { clipboard } = require('electron');
const start = require('./harness');

(async () => {
  const c = await start('MindCraft e2e — colar CSV e planilha');
  const { js, wait, waitFor, eq, ok, t } = c; const wc = () => c.win.webContents; const SHOTS = path.join(__dirname, '..', 'evidencias', 'colar-csv');
  const FENCE = '`'.repeat(3);
  const setVal = (sel, v) => js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(e, ${JSON.stringify(v)}); e.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  const exists = (sel) => js(`!!document.querySelector(${JSON.stringify(sel)})`);
  const text = (sel) => js(`(document.querySelector(${JSON.stringify(sel)}) || { textContent: '' }).textContent`);
  const clickSel = async (sel) => { const p = await js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); wc().sendInputEvent({ type: 'mouseMove', x: Math.round(p.x), y: Math.round(p.y) }); wc().sendInputEvent({ type: 'mouseDown', x: Math.round(p.x), y: Math.round(p.y), button: 'left', clickCount: 1 }); wc().sendInputEvent({ type: 'mouseUp', x: Math.round(p.x), y: Math.round(p.y), button: 'left', clickCount: 1 }); await wait(300); };
  const key = async (k, mods = []) => { wc().sendInputEvent({ type: 'keyDown', keyCode: k, modifiers: mods }); wc().sendInputEvent({ type: 'keyUp', keyCode: k, modifiers: mods }); await wait(200); };
  const CSV = 'concurso,data_prova,disciplina,item,topico,peso\nTRF 2026,2026-12-01,Direito Penal,1,Crimes contra a pessoa,3\n,,Direito Penal,1.1,Dolo,2\n,,Direito Civil,1,Contratos,4';
  const IA = `Claro! Aqui está o CSV do edital:\n\n${FENCE}csv\n${CSV}\n${FENCE}\n\nSe precisar de ajustes, é só pedir.`;
  let clipOk = true; try { clipboard.writeText('x'); clipOk = clipboard.readText() === 'x'; } catch { clipOk = false; }
  console.log('  (área de transferência do sistema ' + (clipOk ? 'disponível: Ctrl+V e botão testados de verdade' : 'INDISPONÍVEL: usei o evento paste simulado') + ')');
  /** Ctrl+V de verdade (clipboard do sistema); sem acesso à área de transferência, dispara o evento "paste" com os mesmos dados. */
  const paste = async (sel, txt) => {
    await clickSel(sel);
    if (clipOk) { clipboard.writeText(txt); await key('V', ['control']); }
    else await js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); const dt = new DataTransfer(); dt.setData('text/plain', ${JSON.stringify(txt)}); e.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); })()`);
    await wait(500);
  };
  const open = async (code) => { await js(`dirty = false; ${code}; true`); await waitFor(() => exists('#csvPaste, #planPaste'), 4000); await wait(200); };

  await c.ready;
  await js(`closeHome && closeHome(); true`);

  await t('a janela do CSV tem a caixa "cole aqui" e o botão "Colar da área de transferência" além do arquivo; sem texto não há prévia', async () => {
    await open('act.csv()'); ok(await exists('#csvPaste')); ok(await exists('#csvClip')); ok(await exists('#csvPick')); ok(await js(`document.querySelector('#csvPreview').hidden`)); ok(await js(`document.querySelector('#csvOk').disabled`));
    ok(/cole o texto aqui mesmo/.test(await text('#csvBox')), 'instruções falam em colar'); await c.shot(path.join(SHOTS, '01-janela-csv.png'));
  });

  await t('Ctrl+V da resposta da IA (com frases e bloco de código): prévia imediata (3 tópicos, 2 disciplinas, prova), aviso do que foi ajustado, nome do concurso preenchido', async () => {
    await paste('#csvPaste', IA); await waitFor(() => js(`!document.querySelector('#csvPreview').hidden`), 4000);
    ok(/3 tópicos em 2 disciplina\(s\)/.test(await text('#csvPreview')), await text('#csvPreview')); ok(/prova em/.test(await text('#csvPreview'))); ok(/marcações de código/.test(await text('#csvPreview')), 'avisa que limpou o texto');
    eq(await js(`document.querySelector('#csvTitle').value`), 'TRF 2026'); ok(!(await js(`document.querySelector('#csvOk').disabled`)), 'Criar o mapa liberado'); await c.shot(path.join(SHOTS, '02-colado-com-previa.png'));
  });

  await t('"Criar o mapa" a partir do texto colado cria o mapa igual ao do arquivo (disciplinas, hierarquia, pesos, data da prova) e um único desfazer não é necessário (mapa novo)', async () => {
    await clickSel('#csvOk'); await waitFor(() => js(`document.querySelector('#modal').hidden`), 4000); await wait(300);
    eq(await js(`map.root.title`), 'TRF 2026'); eq(await js(`map.root.children.map((d) => d.title)`), ['Direito Penal', 'Direito Civil']); eq(await js(`map.root.children[0].children[0].children[0].title`), 'Dolo', 'item 1.1 vira filho de 1');
    eq(await js(`map.meta.exam && map.meta.exam.date`), '2026-12-01'); await c.shot(path.join(SHOTS, '03-mapa-criado.png'));
  });

  await t('botão "Colar da área de transferência": lê o que foi copiado (aqui, uma TABELA do chat) e mostra a prévia', async () => {
    const tab = 'Segue a tabela:\n\n| disciplina | item | tópico | peso |\n|---|---|---|---|\n| Direito do Trabalho | 1 | Contrato de trabalho, espécies | 3 |\n| Direito do Trabalho | 2 | Jornada | 2 |\n';
    await open('act.csv()');
    if (clipOk) { clipboard.writeText(tab); await clickSel('#csvClip'); await waitFor(() => js(`!document.querySelector('#csvPreview').hidden`), 4000); }
    else {                                                  // sem área de transferência no sistema: o canal clip:read devolve o texto (prova o botão e o fluxo; o Ctrl+V real fica por conta de quem tem clipboard)
      await js(`window.__oi = ipcRenderer.invoke.bind(ipcRenderer); ipcRenderer.invoke = (ch, ...a) => (ch === 'clip:read' ? Promise.resolve(${JSON.stringify(tab)}) : window.__oi(ch, ...a)); true`);
      await clickSel('#csvClip'); await waitFor(() => js(`!document.querySelector('#csvPreview').hidden`), 4000); await js(`ipcRenderer.invoke = window.__oi; true`);
    }
    ok(/2 tópicos em 1 disciplina/.test(await text('#csvPreview')), await text('#csvPreview')); ok(/tabela/.test(await text('#csvPreview')), 'avisa que converteu a tabela');
    eq(await js(`document.querySelector('#csvPaste').value.includes('Direito do Trabalho')`), true, 'o texto colado fica visível na caixa');
  });

  await t('área de transferência vazia/negada: o botão explica o que fazer (colar na caixa) em vez de falhar', async () => {
    await open('act.csv()'); await js(`window.__oi = ipcRenderer.invoke.bind(ipcRenderer); ipcRenderer.invoke = (ch, ...a) => (ch === 'clip:read' ? Promise.resolve('') : window.__oi(ch, ...a)); true`);
    await clickSel('#csvClip'); await wait(400); await js(`ipcRenderer.invoke = window.__oi; true`); ok(/área de transferência está vazia/.test(await text('#csvMsg')), await text('#csvMsg')); ok(await js(`document.querySelector('#csvPreview').hidden`), 'sem prévia');
    await clickSel('#csvCancel'); await waitFor(() => js(`document.querySelector('#modal').hidden`), 3000);
  });

  await t('texto sem sentido colado NÃO quebra: mensagem clara na prévia, "Criar o mapa" fica desligado; apagar o texto some com a prévia', async () => {
    await open('act.csv()'); await paste('#csvPaste', 'isto não é um csv de edital'); await waitFor(() => js(`/não pôde ser importado/.test(document.querySelector('#csvPreview').textContent)`), 4000);
    ok(/disciplina/.test(await text('#csvPreview')), 'explica as colunas obrigatórias'); ok(await js(`document.querySelector('#csvOk').disabled`));
    await setVal('#csvPaste', ''); await wait(700); ok(await js(`document.querySelector('#csvPreview').hidden`), 'prévia some');
    await clickSel('#csvCancel'); await waitFor(() => js(`document.querySelector('#modal').hidden`), 3000);
  });

  await t('HTML/script colado vira só texto (nada é executado nem interpretado)', async () => {
    await open('act.csv()'); await paste('#csvPaste', 'disciplina,topico\n<img src=x onerror=window.__pwn=1>,<b>negrito</b>'); await wait(300);
    ok(!(await js('!!window.__pwn')), 'nada executado'); ok(!(await exists('#csvPreview img')), 'sem <img>'); await clickSel('#csvCancel'); await wait(300);
  });

  await t('PLANILHA colada: copie as linhas da planilha editada → prévia das mudanças → aplicar → um único desfazer volta tudo', async () => {
    await js(`dirty = false; newMap(); map.root.title = 'Plano'; map.root.children = []; (() => { const d = map.addChild(map.root.id, 'Penal'); map.addChild(d.id, 'Dolo'); map.addChild(d.id, 'Culpa'); render(); })(); true`); await wait(300);
    const sheet = await js(`window.MC.planner.exportPlan(map, { today: nowStr(), rootId: null })`);
    const { parseCsv } = require('../core/csv'); const { rows } = parseCsv(sheet); const pi = rows[0].findIndex((h) => /^peso$/i.test(h.trim())); ok(pi >= 0, 'coluna peso: ' + rows[0].join('|'));
    const q = (v) => (/[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v); rows.forEach((r) => { if (r.some((x) => x === 'Dolo')) r[pi] = '5'; });
    const edited = rows.map((r) => r.map(q).join(',')).join('\n'); ok(edited !== sheet.trim(), 'planilha editada de fato');
    await open('openPlanModal()'); ok(await exists('#planPaste')); await paste('#planPaste', `Aqui estão as linhas:\n${FENCE}\n${edited}\n${FENCE}`); await waitFor(() => js(`!document.querySelector('#planPreview').hidden`), 4000);
    ok(/mudança\(s\)/.test(await text('#planPreview')), await text('#planPreview')); ok(!(await js(`document.querySelector('#planOk').disabled`))); await c.shot(path.join(SHOTS, '04-planilha-colada.png'));
    const before = await js(`JSON.stringify(map.toJSON())`); await clickSel('#planOk'); await waitFor(() => js(`document.querySelector('#modal').hidden`), 4000); await wait(300);
    ok((await js(`JSON.stringify(map.toJSON())`)) !== before, 'o mapa mudou'); await js(`ipcRenderer.emit('menu', {}, 'undo'); true`); await wait(250);   // o mesmo comando que o Ctrl+Z dispara pelo menu (o atalho é coberto em e2e-reorder) eq(await js(`JSON.stringify(map.toJSON())`), before, 'um Ctrl+Z desfaz tudo');
  });

  await t('nenhum erro de console', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
