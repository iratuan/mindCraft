'use strict';
// Texto hostil em TODOS os campos que viram tela: nada pode virar elemento, atributo de evento ou script — só texto.
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const start = require('./harness');
const { writeMom } = require('../core/mom');
const { openLibrary } = require('../core/library');
const { MindMap, createNode } = require('../core/model');
const S = require('../core/study');
const { TODAY, d } = require('./fixtures');

const EVIL = ['<img src=x onerror="window.__pwn=1">', '"><svg onload="window.__pwn=2">', '</title><script>window.__pwn=3</script>', "'\"><iframe srcdoc='<script>parent.__pwn=4</script>'>", '`${window.__pwn=5}`', '{{constructor.constructor("window.__pwn=6")()}}', '\u202eevil\u202c', '<a href="javascript:window.__pwn=7">x</a>'];

(async () => {
  const c = await start('MindCraft e2e — texto hostil em todas as telas');
  const { js, wait, eq, ok, t, TMP, USERDATA } = c;
  // varredura: nenhum elemento "ativo" criado a partir de texto e nenhum script executado
  const scan = () => js(`(() => {
    const bad = [];
    for (const e of document.querySelectorAll('#app *, #modal *')) {
      const tag = e.tagName.toLowerCase();
      if (['img', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form'].includes(tag)) bad.push('<' + tag + '>');
      if (tag === 'script' && !e.src) bad.push('<script> inline');
      if (tag === 'svg' && e.hasAttribute('onload')) bad.push('svg onload');
      for (const a of e.attributes) if (/^on/i.test(a.name)) bad.push(tag + '[' + a.name + ']');
      if (tag === 'a' && /^\\s*javascript:/i.test(e.getAttribute('href') || '')) bad.push('a[href=javascript:]');
    }
    return { bad, pwn: window.__pwn === undefined ? null : window.__pwn, parentPwn: window.parent && window.parent.__pwn };
  })()`);
  const clean = async (what) => { const r = await scan(); eq(r.bad, [], what + ': elementos ativos criados a partir de texto'); eq(r.pwn, null, what + ': script executou'); };

  const pdf = path.join(TMP, 'x.pdf'); await new Promise((res) => { const doc = new PDFDocument(); const o = fs.createWriteStream(pdf); doc.pipe(o); o.on('finish', res); doc.text('Texto do PDF para o teste hostil.'); doc.end(); });
  const mk = (title) => { const m = new MindMap(createNode(title)); m.meta.name = title; return m; };
  const m = mk(EVIL[0]); m.setExam({ name: EVIL[1], date: d(20) });
  EVIL.forEach((e, i) => { const n = m.addChild(m.root.id, e); m.update(n.id, { notes: `${e}\n\n**${e}** [[${e}]] [x](${e}) - [ ] ${e}\n\`\`\`\n${e}\n\`\`\`\n| a |\n|---|\n| ${e} |` });
    m.mutateStudy(n.id, (s) => S.addError(S.reviewed(s, { today: S.addDays(TODAY, -3), ok: true }), { why: i % 2 ? 'tempo' : 'atencao', note: e, today: TODAY }));
    m.mutateStudy(n.id, (s) => S.addQuestions(s, 10, i % 3, TODAY)); });
  m.addSimulado({ d: d(-3), name: EVIL[2], banca: EVIL[3], rows: [{ disc: EVIL[4], done: 10, correct: 4 }, { disc: EVIL[5], done: 10, correct: 7 }] });
  const p = m.addPdf({ path: pdf, name: EVIL[6] }); m.addRef(m.root.children[0].id, { pdf: p.id, page: 1, quote: EVIL[7], rects: [[0.1, 0.1, 0.3, 0.05]] });
  m.addRelation(m.root.children[0].id, m.root.children[1].id, EVIL[0]);
  const file = path.join(TMP, 'hostil.mom'); writeMom(m, file);
  const lib = openLibrary(path.join(USERDATA, 'biblioteca.db')); const lid = lib.saveMap(m); const lid2 = lib.saveMap(mk(EVIL[1])); lib.close();
  fs.writeFileSync(path.join(USERDATA, 'recent.json'), JSON.stringify([file, 'C:/pastas/' + EVIL[0] + '.mom', 'C:/x/' + EVIL[2] + '/b.mom']));
  const open = async () => { await js(`window.__today = '${TODAY}'; dirty = false; openPath(${JSON.stringify(file)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(file)}`)); await wait(300); };

  await t('mapa, Estrutura, Conexões, Estudo e Notas (em edição e visualizada) com texto hostil', async () => {
    await open(); await clean('mapa');
    for (const tab of ['props', 'study', 'notes', 'links', 'outline']) { await js(`showPanel('${tab}')`); for (let i = 0; i < EVIL.length; i++) { await js(`__md(map.root.children[${i}].id); renderLinks(); true`); await wait(60); } await clean('aba ' + tab); }
    await js(`showPanel('notes'); __md(map.root.children[0].id); setNotesMode('view'); true`); await wait(250); await clean('notas visualizadas'); ok((await js(`document.querySelector('#notesView').textContent`)).includes('onerror'), 'o texto aparece literal'); await js(`setNotesMode('edit')`);
    await js(`act.graph()`); await wait(700); await clean('grafo'); await js('closeGraph()');
  });

  await t('Painel de estudos (erros, simulados, metas, revisões) e Revisão do dia com texto hostil', async () => {
    await js('act.dash()'); await wait(400); await clean('painel de estudos'); const t0 = await js(`document.querySelector('#errSec').textContent + document.querySelector('#simSec').textContent`); ok(t0.includes('<img src=x'), 'texto literal no painel'); await js('closeDash()');
    await js('act.review()'); await c.waitFor(() => js(`!!document.querySelector('#rvBox')`)); for (let i = 0; i < 8; i++) { await js(`document.querySelector('#rvShow') && document.querySelector('#rvShow').click()`); await wait(80); await clean('revisão ' + i); await js(`document.querySelector('#rvSkip') && document.querySelector('#rvSkip').click()`); await wait(60); } await js('closeModal()');
    await js('act.simulado()'); await c.waitFor(() => js(`!!document.querySelector('#simBox')`)); await clean('formulário de simulado'); await js('closeModal()');
  });

  await t('tela inicial (nomes de arquivos recentes e mapas da biblioteca hostis), biblioteca, versões e lixeira', async () => {
    await js(`act.home(true)`); await c.waitFor(() => js(`!!document.querySelector('#home .hm')`)); await wait(300); await clean('tela inicial'); ok((await js(`document.querySelector('#hmRecent').textContent`)).includes('<img src=x'), 'nome literal');
    await js(`closeHome(); openLibraryModal()`); await c.waitFor(() => js(`!!document.querySelector('#libList')`)); await clean('biblioteca'); await js(`document.querySelector('#libList [data-act="versions"]').click()`); await c.waitFor(() => js(`!!document.querySelector('#verBox')`)); await clean('versões');
    await js(`(() => { const l = getLibrary(); l.trashMap(${JSON.stringify(lid2)}); })()`); await js(`openLibraryModal('trash')`); await wait(300); await clean('lixeira'); await js('closeModal()');
    await js(`(() => { const s = document.querySelector('#libSearch'); })`).catch(() => {});
  });

  await t('leitor de PDF (nome do PDF, fontes, chips) e painel de fontes com texto hostil', async () => {
    await js(`dirty = false; openPath(${JSON.stringify(file)})`); await wait(400); await js(`showPanel('notes'); __md(map.root.children[0].id); true`); await wait(200); await clean('fontes nas notas');
    await js(`MC.pdfOpenRef(map.root.children[0].refs[0])`); await c.waitFor(() => js(`document.querySelectorAll('.pdf-page').length === 1`), 15000); await wait(400); await clean('leitor de PDF'); await js('act.pdf()');
  });

  await t('importações com conteúdo hostil: CSV e planilha mostram o texto das linhas problemáticas como texto', async () => {
    const csv = path.join(TMP, 'hostil.csv'); fs.writeFileSync(csv, `disciplina;item;topico;peso;notas\n${EVIL[0]};1;${EVIL[1]};9;${EVIL[2]}\n;2;${EVIL[3]};;\n${EVIL[4]};3;;;\n`);
    await js(`dirty = false; window.__dlg.csv = ${JSON.stringify(csv)}; act.csv()`); await c.waitFor(() => js(`!!document.querySelector('#csvPick')`)); await js(`document.querySelector('#csvPick').click()`); await c.waitFor(() => js(`!document.querySelector('#csvPreview').hidden`)); await clean('prévia do CSV');
    await js('closeModal()'); await js(`window.__dlg.csv = ${JSON.stringify(csv)}; act.plan()`); await c.waitFor(() => js(`!!document.querySelector('#planPick')`)); await js(`document.querySelector('#planPick').click()`); await c.waitFor(() => js(`!document.querySelector('#planPreview').hidden`)); await clean('prévia da planilha'); await js('closeModal()');
    await js(`window.__dlg.pdf = ${JSON.stringify(path.join(TMP, 'não existe ' + EVIL[0] + '.pdf'))}; act.pdf()`); await c.waitFor(() => js(`!!document.querySelector('#pdfOpen')`)); await js(`document.querySelector('#pdfOpen').click()`); await c.waitFor(() => js(`!!document.querySelector('#pdfErr')`), 8000); await clean('erro de PDF ausente'); await js('act.pdf()');
  });

  await t('mensagens de erro e status com texto hostil (abrir arquivo inexistente/corrompido)', async () => {
    const bad = path.join(TMP, EVIL[3].replace(/[<>:"/\\|?*]/g, '_') + '.mom'); fs.writeFileSync(bad, 'lixo'); await js(`window.__dlg.errors.length = 0; openPath(${JSON.stringify(bad)})`); await wait(400);
    await clean('erro ao abrir'); await js(`setStatus(${JSON.stringify(EVIL[0])})`); await clean('status'); eq(await js(`document.querySelector('#status').children.length`), 0, 'a barra de status é só texto');
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
