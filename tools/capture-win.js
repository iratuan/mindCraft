'use strict';
/**
 * Capturas do MindCraft no Windows Desktop (Electron).
 */
const path = require('path');

async function captureWindows({ safeJs, wait, shotWin, WIN_OUT, fMain, fPdf, TODAY }) {
  console.log('--- INICIANDO CAPTURAS NO WINDOWS DESKTOP ---');

  // 1. Splash Screen
  console.log('1. [Windows] Capturando Splash Screen...');
  await safeJs(`
    const s = document.getElementById('splash');
    if (s) { s.hidden = false; s.style.display = 'flex'; s.classList.remove('splash-hide'); }
    return true;
  `);
  await wait(500);
  await shotWin(path.join(WIN_OUT, '01-splash-screen.png'));
  await safeJs(`if (typeof hideSplash === 'function') hideSplash(50); return true;`);
  await wait(500);

  // 2. Tela Inicial (Home) - Play oculto/desabilitado
  console.log('2. [Windows] Capturando Tela Inicial (Home)...');
  await safeJs(`
    if (window.MCReact && window.MCReact.openHome) window.MCReact.openHome();
    if (typeof syncContextUI === 'function') syncContextUI();
    return true;
  `);
  await wait(600);
  await shotWin(path.join(WIN_OUT, '02-tela-inicial-home.png'));

  // 3. Mapa Mental no Editor Principal - Play ativo
  console.log('3. [Windows] Capturando Mapa Mental no Editor Principal...');
  await safeJs(`
    window.__today = '${TODAY}';
    if (window.MCReact && window.MCReact.closeHome) window.MCReact.closeHome();
    await openPath(${JSON.stringify(fMain)});
    render();
    fit();
    selectedId = __id('Princípios fundamentais');
    selIds = new Set([selectedId]);
    render();
    if (typeof syncContextUI === 'function') syncContextUI();
    return true;
  `);
  await wait(600);
  await shotWin(path.join(WIN_OUT, '03-mapa-mental-editor.png'));

  // 4. Modo de Apresentação com Nova Barra Flutuante (HUD)
  console.log('4. [Windows] Capturando Modo de Apresentação com HUD Interativo...');
  await safeJs(`startPresent(); return true;`);
  await wait(400);
  await safeJs(`presentStep(1); presentStep(1); return true;`);
  await wait(500);
  await shotWin(path.join(WIN_OUT, '04-modo-apresentacao-hud.png'));
  await safeJs(`stopPresent(); return true;`);
  await wait(500);

  // 5. Bancada de Estudos - Estado Vazio / Launchpad
  console.log('5. [Windows] Capturando Bancada de Estudos (Launchpad vazio)...');
  await safeJs(`
    if (window.MCReact) {
      window.MCReact.openPdf({});
      const closeBtn = document.querySelector('.media-pane-container .ptab button');
      if (closeBtn) closeBtn.click();
    }
    return true;
  `);
  await wait(600);
  await shotWin(path.join(WIN_OUT, '05-bancada-estudo-launchpad.png'));

  // 6. Bancada de Estudos - Leitor de PDF
  console.log('6. [Windows] Capturando Bancada de Estudos (Leitor de PDF)...');
  await safeJs(`
    if (window.MCReact) {
      window.MCReact.openPdf({ path: ${JSON.stringify(fPdf)}, name: 'Direito Administrativo - Atos.pdf', page: 1 });
    }
    return true;
  `);
  await wait(700);
  await shotWin(path.join(WIN_OUT, '06-bancada-estudo-leitor-pdf.png'));

  // 7. Bancada de Estudos - Player de Vídeo
  console.log('7. [Windows] Capturando Bancada de Estudos (Player de Vídeo)...');
  await safeJs(`
    if (window.MCReact) {
      window.MCReact.openVideo({ src: 'https://www.youtube.com/watch?v=exemplo', name: 'Aula 02 - Regime Jurídico.mp4', time: 142 });
    }
    return true;
  `);
  await wait(700);
  await shotWin(path.join(WIN_OUT, '07-bancada-estudo-player-video.png'));

  // 8. Bancada de Estudos - Navegador Web
  console.log('8. [Windows] Capturando Bancada de Estudos (Navegador Web)...');
  await safeJs(`
    if (window.MCReact) {
      window.MCReact.openBrowser({ url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm' });
    }
    return true;
  `);
  await wait(800);
  await shotWin(path.join(WIN_OUT, '08-bancada-estudo-navegador-web.png'));

  // 9. Bancada de Estudos - Multi-Abas Simultâneas
  console.log('9. [Windows] Capturando Bancada de Estudos (Multi-Abas Simultâneas)...');
  await wait(500);
  await shotWin(path.join(WIN_OUT, '09-bancada-estudo-multi-abas.png'));

  // 10. Rede de Conhecimento (Grafo)
  console.log('10. [Windows] Capturando Rede de Conhecimento (Grafo)...');
  await safeJs(`
    if (window.MCReact && window.MCReact.closeMedia) window.MCReact.closeMedia();
    if (typeof closeDash === 'function') closeDash();
    saveCfg({ scope: 'map' });
    if (!graphOpen && typeof act !== 'undefined' && act.graph) act.graph();
    return true;
  `);
  await wait(800);
  await shotWin(path.join(WIN_OUT, '10-rede-conhecimento-grafo.png'));

  // 11. Painel de Estudos (Dashboard)
  console.log('11. [Windows] Capturando Painel de Estudos (Dashboard)...');
  await safeJs(`
    if (typeof closeGraph === 'function') closeGraph();
    act.dash();
    return true;
  `);
  await wait(800);
  await shotWin(path.join(WIN_OUT, '11-painel-estudos-dashboard.png'));

  // 12. Caderno de Erros e Revisão Espaçada (SRS)
  console.log('12. [Windows] Capturando Caderno de Erros / Revisão Espaçada...');
  await safeJs(`
    closeDash();
    if (window.MCReact && window.MCReact.openReview) window.MCReact.openReview();
    return true;
  `);
  await wait(700);
  await shotWin(path.join(WIN_OUT, '12-caderno-erros-revisao-srs.png'));

  // 13. Painel Lateral - Estrutura (Outline) e Notas
  console.log('13. [Windows] Capturando Painel Lateral com Estrutura e Notas...');
  await safeJs(`
    if (typeof closeModal === 'function') closeModal();
    showPanel('outline');
    selectedId = __id('Princípios fundamentais');
    selIds = new Set([selectedId]);
    render();
    return true;
  `);
  await wait(600);
  await shotWin(path.join(WIN_OUT, '13-painel-lateral-estrutura-notas.png'));

  // 14. Barra Superior Contextual e Fechamento de Recursos
  console.log('14. [Windows] Capturando Barra Superior Contextual...');
  await safeJs(`
    selectedId = null;
    selIds = new Set();
    selectedRel = null;
    render();
    if (typeof syncContextUI === 'function') syncContextUI();
    return true;
  `);
  await wait(500);
  await shotWin(path.join(WIN_OUT, '14-barra-superior-fechamento-recursos.png'));

  console.log('   ✓ Capturas do Windows Desktop concluídas com sucesso.\n');
}

module.exports = { captureWindows };
