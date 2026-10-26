'use strict';
// Desempenho na interface real com um mapa grande: cada operação comum precisa continuar fluida (limites generosos, para não oscilar).
const start = require('./harness');

(async () => {
  const c = await start('MindCraft e2e — desempenho com mapa grande (3 000 tópicos)');
  const { js, wait, eq, ok, t } = c;
  const time = async (code) => js(`(async () => { const t0 = performance.now(); ${code}; await new Promise((r) => setTimeout(r, 0)); return Math.round(performance.now() - t0); })()`);
  const LIMITS = {};

  await t('montar o mapa grande e desenhar (render + Níveis + Ajustar)', async () => {
    const ms = await time(`dirty = false; newMap(); map.root.children = []; map.root.title = 'Grande';
      for (let i = 0; i < 30; i++) { const d = map.addChild(map.root.id, 'Disciplina ' + i); for (let j = 0; j < 99; j++) { const n = map.addChild(d.id, 'Tópico ' + i + '.' + j); if (j % 5 === 0) map.mutateStudy(n.id, (s) => S.reviewed(s, { today: nowStr(), ok: true })); } }
      render(); fit()`);
    console.log('      · montar+render:', ms, 'ms'); ok(ms < 8000, 'montar e desenhar levou ' + ms + ' ms');
  });

  await t('selecionar, recolher, desfazer e a Estrutura (React) acompanham sem travar', async () => {
    const sel = await time(`for (let k = 0; k < 20; k++) { selectedId = [...L.boxes.keys()][k + 5]; render(); }`); console.log('      · 20 seleções:', sel, 'ms'); ok(sel < 6000, '20 seleções: ' + sel + ' ms');
    const lv = await time(`map.showLevels(1); render(); map.showLevels(Infinity); render()`); console.log('      · níveis 1 ↔ tudo:', lv, 'ms'); ok(lv < 6000, 'níveis: ' + lv + ' ms');
    const ol = await time(`showPanel('outline'); map.root.children[0].title = 'x' + Date.now(); render()`); console.log('      · Estrutura repintada:', ol, 'ms'); ok(ol < 4000, 'estrutura: ' + ol + ' ms');
    ok((await js(`document.querySelectorAll('#outline .ol-row').length`)) > 2000, 'a Estrutura lista os tópicos visíveis');
    const un = await time(`act.undo(); act.redo()`); console.log('      · desfazer+refazer:', un, 'ms'); ok(un < 6000, 'desfazer/refazer: ' + un + ' ms');
  });

  await t('painel de estudos, Conexões, busca e relatório com 3 000 tópicos', async () => {
    const dash = await time(`act.dash(); `); console.log('      · painel de estudos:', dash, 'ms'); ok(dash < 4000, 'painel: ' + dash + ' ms'); await js('closeDash()');
    const lk = await time(`showPanel('links'); renderLinks()`); console.log('      · Conexões:', lk, 'ms'); ok(lk < 3000, 'conexões: ' + lk + ' ms');
    const sr = await time(`const s = document.querySelector('#search'); s.value = 'Tópico 29.9'; s.dispatchEvent(new Event('input', { bubbles: true }))`); console.log('      · busca:', sr, 'ms'); ok(sr < 3000, 'busca: ' + sr + ' ms');
  });

  await t('salvar em arquivo e na biblioteca (com verificação) e reabrir', async () => {
    const path = require('path'); const f = path.join(c.TMP, 'grande.mom'); await js(`window.__dlg.save = ${JSON.stringify(f)}`);
    const sv = await time(`await save(true)`); console.log('      · salvar .mom:', sv, 'ms'); ok(sv < 8000, 'salvar .mom: ' + sv + ' ms');
    const lib = await time(`await moveToLibrary()`); console.log('      · guardar na biblioteca (verificado):', lib, 'ms'); ok(lib < 15000, 'biblioteca: ' + lib + ' ms');
    const op = await time(`await openPath(${JSON.stringify(f)})`); console.log('      · abrir .mom:', op, 'ms'); ok(op < 8000, 'abrir: ' + op + ' ms');
  });

  await t('biblioteca com 300 mapas: tela inicial, janela da biblioteca, busca em todos e revisões vencidas continuam rápidas', async () => {
    const path = require('path'); const { openLibrary } = require('../core/library'); const { MindMap, createNode } = require('../core/model'); const SS = require('../core/study');
    const lib = openLibrary(path.join(c.USERDATA, 'biblioteca.db')); const t0 = Date.now();
    lib.tx(() => { for (let k = 0; k < 300; k++) { const m = new MindMap(createNode('Mapa ' + k)); m.meta.name = 'Mapa ' + k; for (let i = 0; i < 6; i++) { const d = m.addChild(m.root.id, 'Disc ' + i); for (let j = 0; j < 4; j++) { const n = m.addChild(d.id, `Assunto ${k}.${i}.${j}`); if (j === 0) m.mutateStudy(n.id, (st) => SS.setNext(st, SS.addDays('2026-10-20', -1))); } } if (k % 10 === 0) m.setExam({ name: 'Prova ' + k, date: SS.addDays('2026-10-20', 20 + k) }); lib.saveMap(m, { snapshot: false }); } });
    lib.close(); console.log('      · preparar 300 mapas:', Date.now() - t0, 'ms');
    const home = await time(`window.__today = '2026-10-20'; act.home(true)`); console.log('      · tela inicial:', home, 'ms'); ok(home < 2500, 'tela inicial: ' + home + ' ms');
    const todayTxt = await js(`document.querySelector('#hmToday').textContent`); ok(todayTxt.includes('1800 revisão(ões) vencida(s)') && todayTxt.includes('em 300 mapa(s)'), todayTxt); await js('closeHome()');
    const mod = await time(`openLibraryModal()`); console.log('      · janela da biblioteca (300 linhas):', mod, 'ms'); ok(mod < 3000, 'janela: ' + mod + ' ms'); eq(await js(`document.querySelectorAll('#libList .lib-row').length`), 301);
    const sr = await time(`const s = document.querySelector('#libSearch'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(s, 'Assunto 299.5'); s.dispatchEvent(new Event('input', { bubbles: true }))`); console.log('      · busca em 300 mapas:', sr, 'ms'); ok(sr < 2000, 'busca: ' + sr + ' ms'); ok((await js(`document.querySelectorAll('#libList .hit').length`)) >= 1, 'achou'); await js('closeModal()');
    const pk = path.join(c.TMP, 'tudo.mcpack'); const exp = await time('getLibrary().exportPackage(' + JSON.stringify(pk) + ')'); console.log('      · exportar pacote (300 mapas):', exp, 'ms'); ok(exp < 15000, 'pacote: ' + exp + ' ms');
  });

  await t('nenhum erro de console', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
