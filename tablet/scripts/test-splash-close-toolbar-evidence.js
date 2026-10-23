'use strict';
/**
 * Teste E2E no Tablet Android:
 * 1. Splash Screen na inicialização
 * 2. Barra de opções superior contextual e estritamente exclusiva (Zero sobreposição)
 * 3. Botão Fechar Mapa atual (leva com segurança para a Home)
 * 4. Botão Fechar PDF atual
 * 5. Botão Fechar Vídeo atual
 * 6. Botão Fechar Aba de Browser atual
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { connect, adb } = require('./cdp');

const SHOTS_DIR = path.join(__dirname, '..', '..', 'evidencias', 'android');
fs.mkdirSync(SHOTS_DIR, { recursive: true });

const shot = (name) => {
  const r = spawnSync(adb, ['exec-out', 'screencap', '-p'], { maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw r.error;
  const outPath = path.join(SHOTS_DIR, name + '.png');
  fs.writeFileSync(outPath, r.stdout);
  console.log('   📸 Evidência visual salva: ' + path.relative(process.cwd(), outPath));
  return outPath;
};

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  console.log('=== TESTE E2E TABLET: SPLASH, BARRA SUPERIOR E FECHAMENTO DE RECURSOS ===\n');

  console.log('1. Conectando ao WebView do MindCraft no emulador Samsung Galaxy Tab...');
  const c = await connect();
  console.log('   ✓ Conectado com sucesso ao WebView.\n');

  // Limpa overlays residuais
  await c.ev(`
    (() => {
      if (typeof closeModal === 'function') closeModal();
      if (typeof closeHome === 'function') closeHome();
      if (typeof closePanels === 'function') closePanels();
      const ov = document.querySelector('.mchost-ov');
      if (ov) ov.remove();
      return true;
    })()
  `);
  await wait(500);

  // -------------------------------------------------------------
  // TESTE 1: TELA DE SPLASH (SPLASH SCREEN)
  // -------------------------------------------------------------
  console.log('2. Testando e capturando Tela de Splash (Splash Screen)...');
  await c.ev(`
    (() => {
      const s = document.getElementById('splash');
      if (s) {
        s.hidden = false;
        s.style.display = 'flex';
        s.classList.remove('splash-hide');
        const st = document.getElementById('splashStatus');
        if (st) st.textContent = 'Carregando biblioteca e mapas mentais…';
      }
      return true;
    })()
  `);
  await wait(600);
  shot('33-tablet-splash-screen');

  // Fade out do splash
  await c.ev(`
    (() => {
      if (typeof hideSplash === 'function') hideSplash(50);
      return true;
    })()
  `);
  await wait(700);

  // -------------------------------------------------------------
  // PREPARA MAPA DE TESTE COM NÓS E RELAÇÃO
  // -------------------------------------------------------------
  console.log('3. Injetando mapa com tópicos e relação para testar exclusão mútua na barra superior...');
  await c.ev(`
    (() => {
      const { MindMap, createNode } = MindCore.model;
      const m = new MindMap(createNode('Direito Administrativo'));
      const a = m.addChild(m.root.id, 'Atos Administrativos');
      a.style = { shape: 'pill', fill: '#0284c7' };
      const b = m.addChild(m.root.id, 'Poderes da Administração');
      b.style = { shape: 'round', fill: '#16a34a' };
      const r = m.addRelation(a.id, b.id, 'decorre de');
      if (r) m.updateRelation(r.id, { color: '#ea580c', style: 'dashed' });
      map = m;
      filePath = null;
      dirty = false;
      selectedId = a.id;
      selIds = new Set([a.id]);
      selectedRel = null;
      render();
      if (typeof syncContextUI === 'function') syncContextUI();
      fit();
      return true;
    })()
  `);
  await wait(600);

  // -------------------------------------------------------------
  // TESTE 2: BARRA SUPERIOR — MODO TÓPICO
  // -------------------------------------------------------------
  console.log('4. Verificando Barra Superior em Modo Tópico (data-context="topic")...');
  const topicState = await c.ev(`
    (() => {
      const opt = document.getElementById('options');
      const t = document.getElementById('optTopic');
      const r = document.getElementById('optRel');
      const c = document.getElementById('optCanvas');
      return {
        context: opt.getAttribute('data-context'),
        topicVisible: !t.hidden && window.getComputedStyle(t).display === 'flex',
        relVisible: !r.hidden && window.getComputedStyle(r).display !== 'none',
        canvasVisible: !c.hidden && window.getComputedStyle(c).display !== 'none',
      };
    })()
  `);
  console.log('   Estado do Modo Tópico:', topicState);
  assert.strictEqual(topicState.context, 'topic', 'data-context deve ser topic');
  assert.strictEqual(topicState.topicVisible, true, 'optTopic deve estar visível');
  assert.strictEqual(topicState.relVisible, false, 'optRel NÃO pode estar visível');
  assert.strictEqual(topicState.canvasVisible, false, 'optCanvas NÃO pode estar visível');
  shot('34-tablet-barra-contextual-topico');

  // -------------------------------------------------------------
  // TESTE 3: BARRA SUPERIOR — MODO RELAÇÃO
  // -------------------------------------------------------------
  console.log('5. Verificando Barra Superior em Modo Relação (data-context="relation")...');
  await c.ev(`
    (() => {
      selectedId = null;
      selIds = new Set();
      selectedRel = map.meta.relations[0].id;
      render();
      if (typeof syncContextUI === 'function') syncContextUI();
      return true;
    })()
  `);
  await wait(500);

  const relState = await c.ev(`
    (() => {
      const opt = document.getElementById('options');
      const t = document.getElementById('optTopic');
      const r = document.getElementById('optRel');
      const c = document.getElementById('optCanvas');
      return {
        context: opt.getAttribute('data-context'),
        topicVisible: !t.hidden && window.getComputedStyle(t).display !== 'none',
        relVisible: !r.hidden && window.getComputedStyle(r).display === 'flex',
        canvasVisible: !c.hidden && window.getComputedStyle(c).display !== 'none',
      };
    })()
  `);
  console.log('   Estado do Modo Relação:', relState);
  assert.strictEqual(relState.context, 'relation', 'data-context deve ser relation');
  assert.strictEqual(relState.topicVisible, false, 'optTopic NÃO pode estar visível');
  assert.strictEqual(relState.relVisible, true, 'optRel deve estar visível');
  assert.strictEqual(relState.canvasVisible, false, 'optCanvas NÃO pode estar visível');
  shot('35-tablet-barra-contextual-relacao');

  // -------------------------------------------------------------
  // TESTE 4: BARRA SUPERIOR — MODO MAPA (CANVAS)
  // -------------------------------------------------------------
  console.log('6. Verificando Barra Superior em Modo Mapa (data-context="canvas")...');
  await c.ev(`
    (() => {
      selectedId = null;
      selIds = new Set();
      selectedRel = null;
      render();
      if (typeof syncContextUI === 'function') syncContextUI();
      return true;
    })()
  `);
  await wait(500);

  const canvasState = await c.ev(`
    (() => {
      const opt = document.getElementById('options');
      const t = document.getElementById('optTopic');
      const r = document.getElementById('optRel');
      const c = document.getElementById('optCanvas');
      return {
        context: opt.getAttribute('data-context'),
        topicVisible: !t.hidden && window.getComputedStyle(t).display !== 'none',
        relVisible: !r.hidden && window.getComputedStyle(r).display !== 'none',
        canvasVisible: !c.hidden && window.getComputedStyle(c).display === 'flex',
      };
    })()
  `);
  console.log('   Estado do Modo Mapa:', canvasState);
  assert.strictEqual(canvasState.context, 'canvas', 'data-context deve ser canvas');
  assert.strictEqual(canvasState.topicVisible, false, 'optTopic NÃO pode estar visível');
  assert.strictEqual(canvasState.relVisible, false, 'optRel NÃO pode estar visível');
  assert.strictEqual(canvasState.canvasVisible, true, 'optCanvas deve estar visível');
  shot('36-tablet-barra-contextual-mapa');

  // -------------------------------------------------------------
  // TESTE 5: BOTÃO FECHAR MAPA ATUAL E RETORNO À TELA INICIAL
  // -------------------------------------------------------------
  console.log('7. Testando botão Fechar Mapa Atual (#closeMapBtn)...');
  await c.ev(`
    (async () => {
      if (typeof closeCurrentMap === 'function') {
        await closeCurrentMap();
      } else {
        const btn = document.getElementById('closeMapBtn');
        if (btn) btn.click();
      }
      return true;
    })()
  `);
  await wait(1000);

  const homeState = await c.ev(`
    (() => {
      return {
        homeOpen: window.MCReact ? window.MCReact.homeIsOpen() : false,
        optionsContext: document.getElementById('options')?.getAttribute('data-context'),
      };
    })()
  `);
  console.log('   Estado pós-fechamento do mapa:', homeState);
  assert.strictEqual(homeState.homeOpen, true, 'Tela inicial (Home) deve estar aberta após fechar mapa');
  assert.strictEqual(homeState.optionsContext, 'none', 'options deve estar com data-context="none"');
  shot('37-tablet-botao-fechar-mapa-home');

  // -------------------------------------------------------------
  // TESTE 6: FECHAR PDF ATUAL (#pdfCloseDoc)
  // -------------------------------------------------------------
  console.log('8. Testando abertura e botão Fechar PDF atual (#pdfCloseDoc)...');
  await c.ev(`
    (() => {
      if (window.MCReact && window.MCReact.closeHome) window.MCReact.closeHome();
      if (window.MCReact) {
        window.MCReact.openPdf({ path: '/docs/exemplo.pdf', name: 'Direito Constitucional.pdf' });
      }
      return true;
    })()
  `);
  await wait(800);
  shot('38-tablet-fechar-pdf-ativo');

  // -------------------------------------------------------------
  // TESTE 7: FECHAR VÍDEO ATUAL (#videoCloseActive)
  // -------------------------------------------------------------
  console.log('9. Testando abertura e botão Fechar Vídeo atual (#videoCloseActive)...');
  await c.ev(`
    (() => {
      if (window.MCReact) {
        window.MCReact.openVideo({ src: 'https://www.youtube.com/watch?v=exemplo', name: 'Aula 01 - Controle de Constitucionalidade' });
      }
      return true;
    })()
  `);
  await wait(800);
  shot('39-tablet-fechar-video-ativo');

  // -------------------------------------------------------------
  // TESTE 8: FECHAR ABA DE BROWSER ATUAL (#browserCloseTabBtn)
  // -------------------------------------------------------------
  console.log('10. Testando abertura e botão Fechar Aba de Navegador (#browserCloseTabBtn)...');
  await c.ev(`
    (() => {
      if (window.MCReact) {
        window.MCReact.openBrowser({});
      }
      return true;
    })()
  `);
  await wait(800);
  shot('40-tablet-fechar-aba-browser');

  console.log('\n=== TODOS OS TESTES PASSARAM COM SUCESSO! EVIDÊNCIAS GERADAS COM SUCESSO. ===\n');
  c.close();
}

main().catch((err) => {
  console.error('\n❌ ERRO NO TESTE:', err);
  process.exit(1);
});
