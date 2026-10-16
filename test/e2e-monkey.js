'use strict';
// "Macaco": centenas de ações REAIS de interface em ordem aleatória (semente fixa → reproduzível), com invariantes conferidas a cada passo:
// árvore válida, seleção existente, sem erros de console nem diálogos de erro, e — o mais importante — "sem alterações" ⇒ o que está no disco/biblioteca É o que está na tela.
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const start = require('./harness');
const { concurso } = require('./fixtures');
const { writeMom } = require('../core/mom');

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const SEEDS = (process.env.MONKEY_SEEDS || '1,2,3').split(',').map(Number), STEPS = Number(process.env.MONKEY_STEPS || 150);

(async () => {
  const c = await start('MindCraft e2e — macaco (ações aleatórias de interface com invariantes)');
  const { js, wait, eq, ok, t, TMP, USERDATA } = c;
  const pdf = path.join(TMP, 'macaco.pdf');
  await new Promise((res) => { const d = new PDFDocument({ size: 'A4', margin: 60 }); const o = fs.createWriteStream(pdf); d.pipe(o); o.on('finish', res); d.fontSize(14).text('Licitação é o procedimento administrativo.'); d.moveDown(); d.text('Moralidade e publicidade orientam a contratação.'); d.addPage(); d.text('Dispensa de licitação ocorre nos casos de lei.'); d.end(); });
  const seedMap = path.join(TMP, 'semente.mom'); writeMom(concurso().m, seedMap);

  // ---- ferramentas dentro da página ----
  await js(`
    window.__nodes = () => { const a = []; map.walk((n) => a.push(n)); return a; };
    window.__vis = () => [...L.boxes.keys()];
    window.__stable = (v) => (Array.isArray(v) ? '[' + v.map(__stable).join(',') + ']' : v && typeof v === 'object' ? '{' + Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => JSON.stringify(k) + ':' + __stable(v[k])).join(',') + '}' : JSON.stringify(v));
    window.__ess = (n) => __stable([n.title, n.notes, n.markers, n.progress, n.study, n.refs, n.children.map(__ess)]);
    window.__problems = async () => {
      const out = [], seen = new Set();
      const visit = (n, d) => {
        if (d > 300) out.push('profundidade'); if (seen.has(n.id)) out.push('id repetido ' + n.id); seen.add(n.id);
        if (typeof n.title !== 'string' || typeof n.notes !== 'string' || !Array.isArray(n.children) || !Array.isArray(n.markers)) out.push('nó malformado ' + n.id);
        if (n.progress != null && !(n.progress >= 0 && n.progress <= 100)) out.push('progresso ' + n.progress);
        n.children.forEach((c2) => visit(c2, d + 1));
      };
      visit(map.root, 0);
      for (const r of map.meta.relations) { if (!seen.has(r.from) || !seen.has(r.to)) out.push('relação órfã'); if (r.from === r.to) out.push('relação para si mesmo'); }
      for (const sm of map.meta.simulados || []) { if (!sm.rows.length || sm.rows.some((x) => !(x.done >= 1 && x.correct >= 0 && x.correct <= x.done))) out.push('simulado inválido'); }
      if (map.meta.goals && JSON.stringify(map.meta.goals) !== JSON.stringify(S.sanitizeGoals(map.meta.goals))) out.push('metas inválidas');
      for (const n of __nodes()) for (const e of (n.study && n.study.errs) || []) if (!S.ERR_REASONS[e.why]) out.push('erro com motivo inválido');
      for (const n of __nodes()) for (const rf of n.refs || []) if (!(map.meta.pdfs || []).some((p) => p.id === rf.pdf)) out.push('fonte sem PDF');
      if (selectedId && !seen.has(selectedId)) out.push('seleção aponta para tópico inexistente');
      for (const id of selIds) if (!seen.has(id)) out.push('multisseleção com tópico inexistente');
      if (!L || !L.boxes.has(map.root.id)) out.push('layout sem a raiz');
      if (!dirty && filePath) { try { const disk = readMom(fs.readFileSync(filePath)); if (__ess(disk.root) !== __ess(map.root)) out.push('SEM ALTERAÇÕES, mas o arquivo difere da tela'); } catch (e) { out.push('arquivo ilegível: ' + e.message); } }
      if (!dirty && map.meta.libId) { try { const lm = getLibrary().loadMap(map.meta.libId); if (__ess(lm.root) !== __ess(map.root)) out.push('SEM ALTERAÇÕES, mas a biblioteca difere da tela'); } catch (e) { out.push('biblioteca: ' + e.message); } }
      return out;
    };
    window.__modalOpen = () => !document.querySelector('#modal').hidden;
    window.__closeAll = () => { const m = document.querySelector('#modal'); if (!m.hidden) m.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); if (!m.hidden) closeModal(); if (typeof closeDash === 'function') closeDash(); if (window.MCReact && MCReact.homeIsOpen()) closeHome(); if (typeof closeGraph === 'function') closeGraph(); if (present) { __key('Escape'); } };
    true`);

  const saveTargets = [path.join(TMP, 'm1.mom'), path.join(TMP, 'm2.mom')];
  const actions = [
    ['selecionar', (r) => `{ if (present) return; const v = __vis(); __md(v[${Math.floor(r() * 1000)} % v.length]); }`],
    ['multisselecionar', (r) => `{ if (present) return; const v = __vis(); __md(v[${Math.floor(r() * 1000)} % v.length], { ctrlKey: true }); }`],
    ['filho+texto', (r) => `{ act.child(); if (!editor.hidden) { editor.value = ${JSON.stringify('T' + Math.floor(r() * 99) + (r() < 0.2 ? ' <b>&"' : ''))}; __key('Enter', editor); } }`],
    ['filho+esc', () => `{ act.child(); if (!editor.hidden) __key('Escape', editor); }`],
    ['irmão', (r) => `{ act.sibling(); if (!editor.hidden) { editor.value = 'S${Math.floor(r() * 99)}'; __key('Enter', editor); } }`],
    ['excluir', () => `act.delete()`], ['desfazer', () => `act.undo()`], ['refazer', () => `act.redo()`],
    ['tecla Tab', () => `__key('Tab')`], ['tecla Enter', () => `__key('Enter')`], ['tecla Delete', () => `__key('Delete')`], ['tecla Espaço', () => `__key(' ')`],
    ['Alt+seta', (r) => `__key(${JSON.stringify(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'][Math.floor(r() * 4)])}, null, { altKey: true })`],
    ['seta', (r) => `__key(${JSON.stringify(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'][Math.floor(r() * 4)])})`],
    ['marcador', (r) => `{ const b = [...document.querySelectorAll('#markerChips .chip')]; if (b.length) b[${Math.floor(r() * 99)} % b.length].click(); }`],
    ['progresso', (r) => `{ const b = [...document.querySelectorAll('#progressChips .chip')]; if (b.length) b[${Math.floor(r() * 99)} % b.length].click(); }`],
    ['tema', (r) => `{ const b = [...document.querySelectorAll('.theme-card')]; b[${Math.floor(r() * 99)} % b.length].click(); }`],
    ['notas digitar', (r) => `{ if (!notes.disabled) { showPanel('notes'); setNotesMode('edit'); notes.value = ${JSON.stringify('nota ' + Math.floor(r() * 99) + (r() < 0.3 ? '\n- [ ] tarefa\n**x** [[Crase]]' : ''))}; notes.dispatchEvent(new Event('change', { bubbles: true })); } }`],
    ['notas visualizar', () => `{ showPanel('notes'); setNotesMode('view'); const cb = document.querySelector('#notesView input[type=checkbox]'); if (cb) cb.click(); setNotesMode('edit'); }`],
    ['notas formatar', (r) => `{ if (!notes.disabled) { showPanel('notes'); setNotesMode('edit'); const b = [...document.querySelectorAll('#notesBar [data-fmt]')]; notes.focus(); notes.setSelectionRange(0, notes.value.length); b[${Math.floor(r() * 99)} % b.length].click(); } }`],
    ['estudei', () => `document.querySelector('#studyDone').click()`], ['errei', () => `document.querySelector('#studyFail').click()`],
    ['minutos', (r) => `{ document.querySelector('#studyMin').value = ${JSON.stringify(String(Math.floor(r() * 120) - 5))}; document.querySelector('#studyAddMin').click(); }`],
    ['questões', (r) => `{ document.querySelector('#qDone').value = ${Math.floor(r() * 30)}; document.querySelector('#qOk').value = ${Math.floor(r() * 35)}; document.querySelector('#qAdd').click(); }`],
    ['peso', (r) => `{ const s = document.querySelector('#studyWeight'); s.value = '${1 + Math.floor(r() * 5)}'; s.dispatchEvent(new Event('change', { bubbles: true })); }`],
    ['erro', (r) => `{ const w = document.querySelector('#errWhy'); w.value = ${JSON.stringify(['atencao', 'tempo', 'chute', ''][Math.floor(r() * 4)])}; document.querySelector('#errNote').value = 'n${Math.floor(r() * 9)}'; document.querySelector('#errCount').checked = ${r() < 0.5}; document.querySelector('#errAdd').click(); }`],
    ['apagar erro', () => `{ const b = document.querySelector('#errList .err-del'); if (b) b.click(); }`],
    ['metas', (r) => `{ if (!dashOpen) act.dash(); const h = document.querySelector('#goalHours'), q = document.querySelector('#goalQuestions'); if (h) { h.value = ${JSON.stringify(['', '5', '2,5', 'abc', '-1'][Math.floor(r() * 5)])}; q.value = ${JSON.stringify(['', '40', 'x', '0'][Math.floor(r() * 4)])}; document.querySelector('#goalSave').click(); if (${r() < 0.3}) { const c = document.querySelector('#goalClear'); if (c) c.click(); } } }`],
    ['início', () => `act.home()`],
    ['início: clicar', (r) => `{ if (!window.MCReact.homeIsOpen()) return; window.__dlg.discard = ${Math.floor(r() * 3)}; window.__dlg.open = null; const b = [...document.querySelectorAll('#home .hm-big, #home .hm-open, #home .hm-continue, #home .hm-chip, #home .hm-exam')]; if (b.length) b[${Math.floor(r() * 999)} % b.length].click(); }`],
    ['arrastar arquivo', (r) => `{ window.__dlg.discard = ${Math.floor(r() * 3)}; return MC.handleDroppedPaths([${JSON.stringify(r() < 0.5 ? seedMap : pdf)}, 'C:/x.txt']); }`],
    ['simulado', (r) => `(async () => { act.simulado(); await new Promise((x) => setTimeout(x, 60)); const rows = [...document.querySelectorAll('.sim-row[data-disc]')]; if (!rows.length) return; const set = (e, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })); }; rows.forEach((row, i) => { if (i < 2) { set(row.querySelector('.sim-done'), '${5 + Math.floor(r() * 20)}'); set(row.querySelector('.sim-ok'), '${Math.floor(r() * 26)}'); } }); document.querySelector('#simAdd').checked = ${r() < 0.5}; document.querySelector('#simSave').click(); })()`],
    ['apagar simulado', () => `{ act.dash(); const b = document.querySelector('#simSec .sim-del'); if (b) b.click(); }`],
    ['aba', (r) => `showPanel(['props', 'study', 'notes', 'links', 'outline'][${Math.floor(r() * 5)}])`],
    ['painel de estudos', () => `act.dash()`], ['agenda: dia', (r) => `{ if (dashOpen) { const d = [...document.querySelectorAll('#agenda .ag-day')]; if (d.length) d[${Math.floor(r() * 99)} % d.length].click(); } }`],
    ['painel: ✓', () => `{ if (dashOpen) { const b = document.querySelector('#dash [data-act="rev-ok"]'); if (b) b.click(); } }`],
    ['grafo', () => `act.graph()`], ['biblioteca', () => `act.lib()`], ['PDF', () => `act.pdf()`], ['revisão', () => `act.review()`], ['atalhos', () => `act.help()`],
    ['csv', () => `act.csv()`], ['planilha', () => `act.plan()`],
    ['PDF: abrir', () => `{ window.__dlg.pdf = ${JSON.stringify(pdf)}; if (!window.MCReact.pdfIsOpen()) act.pdf(); const b = document.querySelector('#pdfOpen'); if (b) b.click(); }`],
    ['PDF: capturar', (r) => `(async () => { const sp = document.querySelector('.pdf-page .textLayer span'); if (!sp) return; const rg = document.createRange(); rg.selectNodeContents(sp.firstChild || sp); const g = getSelection(); g.removeAllRanges(); g.addRange(rg); document.querySelector('#pdfScroll').dispatchEvent(new MouseEvent('mouseup', { bubbles: true })); await new Promise((x) => setTimeout(x, 80)); const b = document.querySelector('${r() < 0.5 ? '#pdfMkTopic' : '#pdfMkNote'}'); if (b) b.click(); })()`],
    ['buscar', (r) => `{ const s = document.querySelector('#search'); s.value = ${JSON.stringify(['t', 'a', 'crase', 'zzz', '['][Math.floor(r() * 5)])}; s.dispatchEvent(new Event('input', { bubbles: true })); s.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); }`],
    ['ajustar', () => `act.fit()`], ['zoom roda', (r) => `{ document.querySelector('#svg').dispatchEvent(new WheelEvent('wheel', { deltaY: ${r() < 0.5 ? -120 : 120}, ctrlKey: true, bubbles: true, clientX: 400, clientY: 300 })); }`],
    ['níveis', (r) => `{ const s = document.querySelector('#levelSel'); s.value = ${JSON.stringify(String(1 + Math.floor(r() * 3)))}; s.dispatchEvent(new Event('change', { bubbles: true })); }`],
    ['estrutura: clicar', (r) => `{ const rows = [...document.querySelectorAll('#outline .ol-row')]; if (rows.length) rows[${Math.floor(r() * 999)} % rows.length].click(); }`],
    ['estrutura: ▶', (r) => `{ const t = [...document.querySelectorAll('#outline [data-ol-tog]')]; if (t.length) t[${Math.floor(r() * 999)} % t.length].click(); }`],
    ['relação', (r) => `{ if (present) return; __key('r'); const v = __vis(); if (v.length > 1) __md(v[${Math.floor(r() * 1000)} % v.length]); __key('Escape'); }`],
    ['conexões', () => `{ showPanel('links'); renderLinks(); }`],
    ['salvar', (r) => `{ window.__dlg.save = ${JSON.stringify(saveTargets[Math.floor(r() * 2)])}; return save(false); }`],
    ['salvar como', (r) => `{ window.__dlg.save = ${JSON.stringify(saveTargets[Math.floor(r() * 2)])}; return save(true); }`],
    ['guardar na biblioteca', () => `moveToLibrary()`],
    ['novo mapa', (r) => `{ window.__dlg.discard = ${Math.floor(r() * 3)}; window.__dlg.save = ${JSON.stringify(saveTargets[0])}; return confirmDiscard().then((okk) => { if (okk) newMap(); }); }`],
    ['abrir arquivo', (r) => `{ window.__dlg.discard = ${Math.floor(r() * 3)}; window.__dlg.save = ${JSON.stringify(saveTargets[1])}; return confirmDiscard().then((okk) => okk && openPath(${JSON.stringify(r() < 0.5 || !fs.existsSync(saveTargets[0]) ? seedMap : saveTargets[0])})); }`],
    ['abrir da biblioteca', (r) => `{ window.__dlg.discard = ${Math.floor(r() * 3)}; window.__dlg.save = ${JSON.stringify(saveTargets[1])}; const l = getLibrary(); const ms = l ? l.listMaps() : []; if (!ms.length) return; return openFromLibrary(ms[${Math.floor(r() * 99)} % ms.length].id); }`],
    ['exportar md', () => `{ window.__dlg.save = ${JSON.stringify(path.join(TMP, 'x.md'))}; return doExport('md'); }`],
    ['apresentar', () => `act.present()`],
    ['fechar tudo', () => `__closeAll()`],
  ];

  for (const seed of SEEDS) {
    await t(`macaco semente ${seed}: ${STEPS} ações aleatórias de interface sem violar nenhuma invariante`, async () => {
      const r = rng(seed * 7919); const log = [];
      await js(`window.__dlg.discard = 1; dirty = false; window.__today = '2026-10-20'; closeLibrary(); true`);
      await js(`(async () => { __closeAll(); await openPath(${JSON.stringify(seedMap)}); })()`);
      for (let step = 1; step <= STEPS; step++) {
        const [name, mk] = actions[Math.floor(r() * actions.length)]; const code = mk(r); log.push(`${step}:${name}`);
        const errs0 = c.errors.length;
        try { await js(`(async () => { await (async () => { ${code.startsWith('{') ? code : 'return ' + code} })(); })()`); }
        catch (e) { const diag = await js(`JSON.stringify({ present: !!present, boxes: L.boxes.size, dom: document.querySelectorAll('[data-id]').length, dashOpen, selectedId: !!selectedId, modal: __modalOpen(), graphHidden: document.querySelector('#graph').hidden, hits: !!hits, editorHidden: editor.hidden })`).catch(() => '?'); throw new Error(`ação "${name}" lançou exceção na página (semente ${seed}, passo ${step}): ${e.message} ${diag}\n   últimas ações: ${log.slice(-10).join(' → ')}`); }
        await wait(r() < 0.3 ? 120 : 35);
        if (r() < 0.45) await js('__closeAll(); true');
        const problems = await js('__problems()'), dlgErr = await js('window.__dlg.errors.length');
        if (c.errors.length > errs0 || problems.length || dlgErr) throw new Error(`INVARIANTE violada após "${name}" (semente ${seed}, passo ${step}): ${JSON.stringify(problems)} ${c.errors.slice(errs0).join(' | ')} ${dlgErr ? 'diálogos de erro: ' + JSON.stringify(await js('window.__dlg.errors')) : ''}\n   últimas ações: ${log.slice(-12).join(' → ')}`);
      }
      await js(`__closeAll(); true`);
    });
  }
  await t('nenhum erro de console durante toda a sessão aleatória', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
