'use strict';
// Layout em janelas pequenas: nenhuma tela pode estourar a janela (rolagem horizontal da página, modal maior que a tela sem rolagem,
// botões essenciais fora de alcance). Capturas ficam em evidencias/layout/ para conferência visual.
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const start = require('./harness');
const { writeMom } = require('../core/mom');
const { openLibrary } = require('../core/library');
const { TODAY, concurso, d } = require('./fixtures');

const SIZES = [[720, 480], [1000, 640], [1280, 800]];
const SHOTS = path.join(__dirname, '..', 'evidencias', 'layout');

(async () => {
  const c = await start('MindCraft e2e — layout em janelas pequenas');
  const { js, wait, eq, ok, t, TMP, USERDATA } = c;
  fs.rmSync(SHOTS, { recursive: true, force: true }); fs.mkdirSync(SHOTS, { recursive: true });
  const { BrowserWindow } = require('electron'); const win = BrowserWindow.getAllWindows()[0];
  const m = concurso().m; m.setExam({ name: 'TRF 2026', date: d(30) }); m.addSimulado({ d: d(-5), name: 'Simulado 1', rows: [{ disc: 'Língua Portuguesa', done: 20, correct: 14 }, { disc: 'Direito Constitucional', done: 20, correct: 9 }] });
  const file = path.join(TMP, 'concurso.mom'); writeMom(m, file);
  const lib = openLibrary(path.join(USERDATA, 'biblioteca.db')); for (let i = 0; i < 12; i++) { const x = concurso().m; x.root.title = x.meta.name = 'Concurso número ' + i + ' com um título bem comprido para testar quebra de linha'; x.setExam({ name: 'Prova ' + i, date: d(10 + i * 9) }); lib.saveMap(x); } lib.close();
  fs.writeFileSync(path.join(USERDATA, 'recent.json'), JSON.stringify(Array.from({ length: 10 }, (_, i) => path.join(TMP, `Arquivo com nome comprido de estudo número ${i}.mom`)).concat(file)));
  const pdf = path.join(TMP, 'x.pdf'); await new Promise((res) => { const doc = new PDFDocument({ size: 'A4' }); const o = fs.createWriteStream(pdf); doc.pipe(o); o.on('finish', res); doc.fontSize(14).text('Licitação é o procedimento administrativo. '.repeat(30)); doc.end(); });
  const resize = async (w, h) => { win.setSize(w, h); await wait(500); };
  const problems = (what) => js(`(() => {
    const out = [], vw = innerWidth, vh = innerHeight, de = document.documentElement;
    if (de.scrollWidth > vw + 1) out.push('a página rola na horizontal (' + de.scrollWidth + ' > ' + vw + ')');
    if (document.body.scrollWidth > vw + 1) out.push('o corpo rola na horizontal');
    const box = [...document.querySelectorAll('#modal:not([hidden]) .modal-box')][0];
    if (box) { const r = box.getBoundingClientRect(); if (r.right > vw + 1 || r.left < -1) out.push('modal estoura na largura (' + Math.round(r.left) + '..' + Math.round(r.right) + ' de ' + vw + ')'); if ((r.bottom > vh + 1 || r.top < -1) && !(getComputedStyle(box).overflowY !== 'visible' || box.scrollHeight > box.clientHeight)) out.push('modal estoura na altura sem rolagem'); }
    for (const sel of ['#home:not([hidden])', '#dash:not([hidden])']) { const o = document.querySelector(sel); if (o && o.scrollWidth > o.clientWidth + 2) out.push(sel + ' tem rolagem horizontal'); }
    const st = document.querySelector('#stage').getBoundingClientRect(); if (st.width < 120) out.push('a área do mapa ficou estreita demais (' + Math.round(st.width) + 'px)');
    return out;
  })()`).then((p) => ({ what, p }));
  const shot = async (name, w, h) => { const img = await win.webContents.capturePage(); fs.writeFileSync(path.join(SHOTS, `${name}-${w}x${h}.png`), img.toPNG()); };
  const screens = {
    'inicio': async () => { await js(`dirty = false; openPath(${JSON.stringify(file)})`); await c.waitFor(() => js(`filePath === ${JSON.stringify(file)}`)); await js('act.home(true)'); await c.waitFor(() => js(`!!document.querySelector('#home .hm')`)); await wait(300); },
    'painel': async () => { await js(`closeHome(); window.__today = '${TODAY}'; act.dash()`); await wait(400); },
    'biblioteca': async () => { await js(`closeDash(); openLibraryModal()`); await c.waitFor(() => js(`!!document.querySelector('#libList')`)); await wait(200); },
    'simulado': async () => { await js(`closeModal(); act.simulado()`); await c.waitFor(() => js(`!!document.querySelector('#simBox')`)); await wait(200); },
    'revisao': async () => { await js(`closeModal(); act.review()`); await c.waitFor(() => js(`!!document.querySelector('#rvBox')`)); await wait(200); },
    'atalhos': async () => { await js(`closeModal(); act.help()`); await c.waitFor(() => js(`!!document.querySelector('#keysBox')`)); await wait(200); },
    'csv': async () => { await js(`closeModal(); act.csv()`); await c.waitFor(() => js(`!!document.querySelector('#csvBox')`)); await wait(200); },
    'pdf-dividido': async () => { await js(`closeModal(); window.__dlg.pdf = ${JSON.stringify(pdf)}; act.pdf()`); await c.waitFor(() => js(`!!document.querySelector('#pdfOpen')`)); await js(`document.querySelector('#pdfOpen').click()`); await c.waitFor(() => js(`document.querySelectorAll('.pdf-page').length === 1`), 15000); await wait(500); },
    'notas': async () => { await js(`act.pdf(); showPanel('notes'); __md(map.root.children[0].id); true`); await wait(300); },
  };
  for (const [w, h] of SIZES) {
    await t(`${w}×${h}: todas as telas cabem na janela (sem rolagem horizontal da página, modais dentro da tela)`, async () => {
      await resize(w, h); const found = [];
      for (const [name, open] of Object.entries(screens)) { await open(); await wait(200); const r = await problems(name); await shot(name, w, h); for (const x of r.p) found.push(`${name}: ${x}`); }
      await js(`closeModal(); closeDash(); closeHome(); if (MCReact.pdfIsOpen()) act.pdf(); true`); eq(found, [], `problemas de layout em ${w}×${h}`);
    });
  }
  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
