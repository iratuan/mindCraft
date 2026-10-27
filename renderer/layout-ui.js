'use strict';
// Layout do espaço de trabalho: (1) recolher/expandir o painel lateral direito e (2) redimensionar as áreas — leitor de PDF | mapa | painel lateral.
// Os divisores funcionam com mouse, DEDO e caneta (Pointer Events) e com o TECLADO (← → com o divisor em foco; Shift = passo grande; Home/End = limites;
// duplo clique restaura o tamanho padrão). Tamanhos e o estado "recolhido" são lembrados (config.json). Depende de: $, loadCfg, saveCfg (renderer.js).
(() => {
  const body = document.body, root = document.documentElement;
  const work = $('#work'), panels = $('#panels'), pdfpane = $('#pdfpane');
  const pSplit = $('#panelsSplit'), pBtn = $('#panelsToggle'), dSplit = $('#pdfsplit');
  if (!work || !panels || !pSplit || !pBtn || !dSplit) return;

  const MAP_MIN = 284;                    // largura mínima do mapa (260 úteis + as alças dos divisores) ao arrastar um divisor
  const PANEL_MIN = 220, PANEL_MAX = 560, PDF_MIN = 280;
  const cfg = () => { try { return loadCfg(); } catch { return {}; } };
  const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  /** Na versão tablet com janela estreita o painel é uma GAVETA (☷); aí não há recolher nem divisor. */
  const drawer = () => root.dataset.host === 'web' && window.innerWidth <= 1000;
  /** Em janelas estreitas com o leitor aberto o painel já sai da frente sozinho (regra de CSS): nada a recolher. */
  const autoHidden = () => body.classList.contains('pdf-open') && window.innerWidth <= 900;
  const workW = () => work.getBoundingClientRect().width;
  const railW = () => ($('#rail') ? $('#rail').getBoundingClientRect().width : 0);

  let collapsed = false;
  let raf = 0;
  // rAF junta rajadas de movimento; o setTimeout garante o aviso mesmo com a janela oculta/ocluída (aí o rAF não dispara)
  const refit = () => {
    if (raf) return;
    const go = () => { if (!raf) return; raf = 0; window.dispatchEvent(new Event('resize')); };
    raf = 1; requestAnimationFrame(go); setTimeout(go, 60);
  };

  // ---------- painel lateral: recolher / expandir ----------
  let painting = false;
  function paintToggle() {
    if (painting) return; painting = true;
    const off = collapsed && !drawer();
    body.classList.toggle('panels-collapsed', off);
    body.classList.toggle('panels-drawer', drawer());
    body.classList.toggle('panels-auto-hidden', autoHidden());
    pBtn.textContent = off ? '‹' : '›';
    const label = off ? 'Expandir o painel lateral (Ctrl+\\)' : 'Recolher o painel lateral (Ctrl+\\)';
    pBtn.title = label; pBtn.setAttribute('aria-label', label); pBtn.setAttribute('aria-expanded', String(!off));
    pSplit.setAttribute('aria-hidden', String(drawer() || autoHidden()));
    pSplit.tabIndex = off || drawer() || autoHidden() ? -1 : 0;
    pSplit.setAttribute('aria-valuenow', String(Math.round(panels.getBoundingClientRect().width)));
    painting = false;
  }
  // O botão de recolher mora NO PRÓPRIO painel (cabeçalho das abas) enquanto ele está aberto; recolhido, o painel some e o botão
  // passa para a borda, onde é o único jeito de trazê-lo de volta. Mesmo elemento e mesmo id, então os atalhos e testes não mudam.
  const placeToggle = () => { const host = collapsed ? pSplit : $('#ptabs'); if (host && pBtn.parentElement !== host) host.appendChild(pBtn); };
  function setCollapsed(v, persist = true) {
    collapsed = !!v; if (persist) saveCfg({ panelsCollapsed: collapsed });
    if (collapsed) document.body.classList.remove('panel-max');   // recolhido não pode estar maximizado
    placeToggle(); paintToggle(); refit();
    // adiado: o redesenho do mapa (resize) reescreve a barra de status
    if (typeof setStatus === 'function') setTimeout(() => setStatus(collapsed ? 'Painel lateral recolhido. Use o botão ‹ na borda direita (ou Ctrl+\\) para voltar.' : 'Painel lateral expandido.'), 60);
  }
  placeToggle();
  pBtn.addEventListener('click', (e) => { e.stopPropagation(); setCollapsed(!(collapsed && !drawer())); pBtn.blur(); });
  pBtn.addEventListener('pointerdown', (e) => e.stopPropagation());       // clicar no botão nunca inicia um arrasto do divisor
  // chamado por showPanel (renderer.js): quem pede uma aba precisa ver o painel
  window.expandPanels = () => { if (collapsed) setCollapsed(false); };

  // ---------- maximizar / restaurar: o painel da direita (botão no cabeçalho dele) e a bancada da esquerda (botão no cabeçalho dela) ----------
  // Só um dos dois fica maximizado por vez; maximizar ocupa a área de trabalho inteira; restaurar volta ao layout anterior.
  const pMax = $('#panelMax');
  function paintMax() {
    const on = document.body.classList.contains('panel-max');
    if (pMax) { pMax.classList.toggle('on', on); pMax.setAttribute('aria-pressed', String(on)); pMax.title = on ? 'Restaurar o painel' : 'Maximizar o painel'; pMax.setAttribute('aria-label', pMax.title); }
  }
  function toggleMax(kind) {
    const cls = kind + '-max';
    const on = !document.body.classList.contains(cls);
    document.body.classList.remove('panel-max', 'dock-max');
    if (on && kind === 'panel' && collapsed) setCollapsed(false);   // maximizar um painel recolhido o mostra primeiro
    if (on) document.body.classList.add(cls);
    paintMax(); refit();
    document.dispatchEvent(new CustomEvent('mc:dock-max-changed'));
  }
  window.toggleDockMax = () => toggleMax('dock');
  if (pMax) pMax.addEventListener('click', () => toggleMax('panel'));
  act.panelsToggle = () => setCollapsed(!(collapsed && !drawer()));
  if (root.dataset.host === 'web') window.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === '\\') { e.preventDefault(); act.panelsToggle(); } }, true);   // no desktop o atalho vem do menu Exibir

  // ---------- divisores arrastáveis ----------
  /**
   * @param el      elemento do divisor
   * @param o       { name, read(): px atuais, write(px): aplica (sem salvar), bounds(): [min, max], grow: +1 (arrastar p/ direita aumenta) | -1, save(px|null), reset() }
   */
  function splitter(el, o) {
    let drag = null;
    const clamp = (v) => { const [lo, hi] = o.bounds(); return Math.round(Math.max(lo, Math.min(Math.max(lo, hi), v))); };
    const apply = (v) => { o.write(clamp(v)); el.setAttribute('aria-valuenow', String(Math.round(o.read()))); refit(); };
    el.setAttribute('role', 'separator'); el.setAttribute('aria-orientation', 'vertical'); el.setAttribute('aria-label', o.name);
    // Os eventos de movimento são ouvidos na JANELA durante o arrasto (não só no divisor): vale com ou sem "captura do ponteiro" e quando o
    // divisor muda de lugar sob o dedo/mouse a cada passo.
    const move = (e) => { if (drag && e.pointerId === drag.id) apply(drag.w + o.grow * (e.clientX - drag.x)); };
    const end = (e) => {
      if (!drag || (e.pointerId !== undefined && e.pointerId !== drag.id)) return;
      drag = null; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end);
      body.classList.remove('split-dragging'); el.classList.remove('dragging'); o.save(Math.round(o.read())); refit();
    };
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button > 0) return;
      drag = { x: e.clientX, w: o.read(), id: e.pointerId };
      try { el.setPointerCapture(e.pointerId); } catch { /* sem captura o arrasto ainda funciona pela janela */ }
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
      body.classList.add('split-dragging'); el.classList.add('dragging');   // sem preventDefault: clicar no divisor também o põe em foco (aí as setas funcionam)
    });
    el.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 96 : 24, [lo, hi] = o.bounds(); let v = null;
      if (e.key === 'ArrowLeft') v = o.read() - o.grow * step; else if (e.key === 'ArrowRight') v = o.read() + o.grow * step;
      else if (e.key === 'Home') v = lo; else if (e.key === 'End') v = Math.max(lo, hi);          // Home/End = menor/maior largura possível
      else if (e.key === 'Enter' && e.target === el) { e.preventDefault(); o.reset(); apply(o.read()); return; }
      if (v == null) return;
      e.preventDefault(); e.stopPropagation(); apply(v); o.save(Math.round(o.read()));
    });
    el.addEventListener('dblclick', (e) => { if (e.target !== el) return; o.reset(); el.setAttribute('aria-valuenow', String(Math.round(o.read()))); refit(); });
  }

  // painel lateral: largura em --panels-w (as regras de CSS por tamanho de janela continuam sendo o padrão)
  const panelsDefault = () => { root.style.removeProperty('--panels-w'); const w = panels.getBoundingClientRect().width; return w; };
  splitter(pSplit, {
    name: 'Largura do painel lateral (setas ← → ajustam; Enter restaura)', grow: -1,
    read: () => panels.getBoundingClientRect().width,
    write: (v) => root.style.setProperty('--panels-w', v + 'px'),
    bounds: () => [PANEL_MIN, Math.min(PANEL_MAX, workW() - railW() - MAP_MIN - (pdfpane.hidden ? 0 : pdfpane.getBoundingClientRect().width))],
    save: (v) => saveCfg({ panelsWidth: v }),
    reset: () => { panelsDefault(); saveCfg({ panelsWidth: null }); },
  });
  // leitor de PDF | mapa
  splitter(dSplit, {
    name: 'Largura do leitor de PDF (setas ← → ajustam; Enter restaura)', grow: 1,
    read: () => pdfpane.getBoundingClientRect().width,
    write: (v) => { pdfpane.style.width = v + 'px'; },
    bounds: () => [PDF_MIN, Math.min(Math.floor(workW() * 0.7), workW() - railW() - MAP_MIN - (collapsed || drawer() || autoHidden() ? 0 : panels.getBoundingClientRect().width))],
    save: (v) => saveCfg({ pdfWidth: v }),
    reset: () => { pdfpane.style.width = Math.round(workW() * 0.46) + 'px'; saveCfg({ pdfWidth: null }); },
  });
  dSplit.tabIndex = 0; pSplit.tabIndex = 0;
  dSplit.title = 'Arraste para ajustar a largura do leitor (← → no teclado; duplo clique restaura)';
  pSplit.title = 'Arraste para ajustar a largura do painel (← → no teclado; duplo clique restaura)';

  // largura salva (só vale fora do modo gaveta) e reajuste quando a janela muda de tamanho
  // a pasta de dados só é conhecida depois que o app fica "pronto": só então dá para ler o que foi lembrado
  const applySaved = () => {
    const c = cfg(), saved = num(c.panelsWidth);
    if (saved) root.style.setProperty('--panels-w', Math.max(PANEL_MIN, Math.min(PANEL_MAX, saved)) + 'px');
    collapsed = c.panelsCollapsed === true; placeToggle(); paintToggle(); refit();
  };
  // espera a pasta de dados (definida no início do init) sem depender do fim da restauração da sessão, que pode demorar (rascunho, diálogos)
  let tries = 0; const waitCfg = () => { if (typeof userDataDir !== 'undefined' && userDataDir) applySaved(); else if (++tries < 200) setTimeout(waitCfg, 50); else applySaved(); };
  waitCfg();
  const keepFit = () => {
    paintToggle();
    if (!pdfpane.hidden && !drawer()) { const [lo, hi] = [PDF_MIN, Math.min(Math.floor(workW() * 0.7), workW() - railW() - MAP_MIN - (collapsed || autoHidden() ? 0 : panels.getBoundingClientRect().width))]; const w = pdfpane.getBoundingClientRect().width; if (w > Math.max(lo, hi) && pdfpane.style.width) pdfpane.style.width = Math.max(lo, hi) + 'px'; }
  };
  window.addEventListener('resize', keepFit);
  new MutationObserver(paintToggle).observe(body, { attributes: true, attributeFilter: ['class'] });
  paintToggle();
})();
