'use strict';
/**
 * Capturas do MindCraft no Android Tablet (Capacitor/WebView).
 */
const fs = require('fs');
const path = require('path');

async function captureAndroid({ andConn, shotAndroid, wait, AND_OUT, fPdf }) {
  console.log('--- INICIANDO CAPTURAS NO ANDROID TABLET (EMULADOR) ---');

  // Prepara arquivo PDF no sistema virtual de arquivos do tablet
  const pdfBytes = fs.readFileSync(fPdf);
  await andConn.ev(`(() => {
    try {
      if (window.MC && window.MC.fs) {
        const raw = ${JSON.stringify(pdfBytes.toString('base64'))};
        const bin = atob(raw);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        window.MC.fs.writeFileSync('/docs/Direito_Administrativo.pdf', bytes);
      }
    } catch (e) { /* ignore */ }
    return true;
  })()`);

  // 1. Splash Screen
  console.log('1. [Android] Splash Screen...');
  await andConn.ev(`(() => {
    const s = document.getElementById('splash');
    if (s) { s.hidden = false; s.style.display = 'flex'; s.classList.remove('splash-hide'); }
    return true;
  })()`);
  await wait(600);
  shotAndroid(path.join(AND_OUT, '01-splash-screen.png'));
  await andConn.ev(`(() => { if (typeof hideSplash === 'function') hideSplash(50); return true; })()`);
  await wait(600);

  // 2. Tela Inicial (Home)
  console.log('2. [Android] Tela Inicial (Home)...');
  await andConn.ev(`(() => {
    if (window.MCReact && window.MCReact.openHome) window.MCReact.openHome();
    if (typeof syncContextUI === 'function') syncContextUI();
    return true;
  })()`);
  await wait(700);
  shotAndroid(path.join(AND_OUT, '02-tela-inicial-home.png'));

  // 3. Mapa Mental no Editor
  console.log('3. [Android] Mapa Mental no Editor...');
  await andConn.ev(`(() => {
    if (window.MCReact && window.MCReact.closeHome) window.MCReact.closeHome();
    const { MindMap, createNode } = MindCore.model;
    const m = new MindMap(createNode('Concurso TRF 2026'), { theme: 'ocean' });
    const pt = m.addChild(m.root.id, 'Língua Portuguesa');
    const dc = m.addChild(m.root.id, 'Direito Constitucional');
    const da = m.addChild(m.root.id, 'Direito Administrativo');
    const atos = m.addChild(da.id, 'Atos Administrativos');
    atos.notes = 'Atributos e elementos dos atos administrativos.';
    const rel = m.addRelation(dc.id, da.id, 'fundamenta');
    map = m;
    filePath = null;
    dirty = false;
    selectedId = atos.id;
    selIds = new Set([atos.id]);
    render();
    fit();
    if (typeof syncContextUI === 'function') syncContextUI();
    return true;
  })()`);
  await wait(700);
  shotAndroid(path.join(AND_OUT, '03-mapa-mental-editor.png'));

  // 4. Modo de Apresentação com HUD Interativo
  console.log('4. [Android] Modo de Apresentação com HUD...');
  await andConn.ev(`(() => {
    startPresent();
    return true;
  })()`);
  await wait(500);
  await andConn.ev(`(() => {
    presentStep(1);
    return true;
  })()`);
  await wait(600);
  shotAndroid(path.join(AND_OUT, '04-modo-apresentacao-hud.png'));
  await andConn.ev(`(() => {
    stopPresent();
    return true;
  })()`);
  await wait(600);

  // 5. Bancada de Estudos - Launchpad
  console.log('5. [Android] Bancada de Estudos (Launchpad vazio)...');
  await andConn.ev(`(() => {
    if (window.MCReact) {
      window.MCReact.openPdf({});
      const closeBtn = document.querySelector('.media-pane-container .ptab button');
      if (closeBtn) closeBtn.click();
    }
    return true;
  })()`);
  await wait(700);
  shotAndroid(path.join(AND_OUT, '05-bancada-estudo-launchpad.png'));

  // 6. Bancada de Estudos - Leitor de PDF
  console.log('6. [Android] Bancada de Estudos (Leitor de PDF)...');
  await andConn.ev(`(() => {
    if (window.MCReact) {
      window.MCReact.openPdf({ path: '/docs/Direito_Administrativo.pdf', name: 'Direito Administrativo - Atos.pdf', page: 1 });
    }
    return true;
  })()`);
  await wait(700);
  shotAndroid(path.join(AND_OUT, '06-bancada-estudo-leitor-pdf.png'));

  // 7. Bancada de Estudos - Player de Vídeo
  console.log('7. [Android] Bancada de Estudos (Player de Vídeo)...');
  await andConn.ev(`(() => {
    if (window.MCReact) {
      window.MCReact.openVideo({ src: 'https://www.youtube.com/watch?v=exemplo', name: 'Aula 02 - Regime Jurídico.mp4', time: 142 });
    }
    return true;
  })()`);
  await wait(700);
  shotAndroid(path.join(AND_OUT, '07-bancada-estudo-player-video.png'));

  // 8. Bancada de Estudos - Navegador Web
  console.log('8. [Android] Bancada de Estudos (Navegador Web)...');
  await andConn.ev(`(() => {
    if (window.MCReact) {
      window.MCReact.openBrowser({ url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm' });
    }
    return true;
  })()`);
  await wait(800);
  shotAndroid(path.join(AND_OUT, '08-bancada-estudo-navegador-web.png'));

  // 9. Bancada de Estudos - Multi-Abas
  console.log('9. [Android] Bancada de Estudos (Multi-Abas)...');
  await wait(600);
  shotAndroid(path.join(AND_OUT, '09-bancada-estudo-multi-abas.png'));

  // 10. Rede de Conhecimento (Grafo)
  console.log('10. [Android] Rede de Conhecimento (Grafo)...');
  await andConn.ev(`(() => {
    if (window.MCReact && window.MCReact.closeMedia) window.MCReact.closeMedia();
    if (typeof closeDash === 'function') closeDash();
    saveCfg({ scope: 'map' });
    if (!graphOpen && typeof act !== 'undefined' && act.graph) act.graph();
    return true;
  })()`);
  await wait(900);
  shotAndroid(path.join(AND_OUT, '10-rede-conhecimento-grafo.png'));

  // 11. Painel de Estudos (Dashboard)
  console.log('11. [Android] Painel de Estudos (Dashboard)...');
  await andConn.ev(`(() => {
    if (typeof closeGraph === 'function') closeGraph();
    act.dash();
    return true;
  })()`);
  await wait(800);
  shotAndroid(path.join(AND_OUT, '11-painel-estudos-dashboard.png'));

  // 12. Caderno de Erros e Revisão Espaçada (SRS)
  console.log('12. [Android] Caderno de Erros / Revisão Espaçada...');
  await andConn.ev(`(() => {
    closeDash();
    if (window.MCReact && window.MCReact.openReview) window.MCReact.openReview();
    return true;
  })()`);
  await wait(700);
  shotAndroid(path.join(AND_OUT, '12-caderno-erros-revisao-srs.png'));

  // 13. Painel Lateral - Estrutura (Outline) e Notas
  console.log('13. [Android] Painel Lateral com Estrutura e Notas...');
  await andConn.ev(`(() => {
    if (typeof closeModal === 'function') closeModal();
    showPanel('outline');
    return true;
  })()`);
  await wait(700);
  shotAndroid(path.join(AND_OUT, '13-painel-lateral-estrutura-notas.png'));

  // 14. Barra Superior Contextual e Fechamento de Recursos
  console.log('14. [Android] Barra Superior Contextual...');
  await andConn.ev(`(() => {
    selectedId = null;
    selIds = new Set();
    selectedRel = null;
    render();
    if (typeof syncContextUI === 'function') syncContextUI();
    return true;
  })()`);
  await wait(600);
  shotAndroid(path.join(AND_OUT, '14-barra-superior-fechamento-recursos.png'));

  console.log('   ✓ Capturas do Android Tablet concluídas com sucesso.\n');
}

module.exports = { captureAndroid };
