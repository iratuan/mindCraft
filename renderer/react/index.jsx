// Interface em React, adotada por fatias: cada tela portada mantém os MESMOS ids, classes e atributos da versão clássica,
// de modo que os testes existentes (e2e e QA) valem como prova de equivalência. A ponte com o app é window.MC (ver library-ui.js).
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { LibraryModal } from './LibraryModal.jsx';
import { VersionsModal } from './VersionsModal.jsx';
import { CsvModal } from './CsvModal.jsx';
import { PlanModal } from './PlanModal.jsx';
import { Dashboard } from './Dashboard.jsx';
import { Connections, Outline, RefsBox } from './Panels.jsx';
import { PdfPane } from './PdfPane.jsx';
import { ReviewMode } from './ReviewMode.jsx';
import { ShortcutsModal } from './ShortcutsModal.jsx';
import { ManualModal } from './ManualModal.jsx';
import { Home } from './Home.jsx';
import { SimuladoModal } from './SimuladoModal.jsx';

let cur = null;
function unmount() { if (cur) { try { cur.root.unmount(); } catch { /* o nó já foi removido por outro código */ } cur = null; } }

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const visible = (e) => !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
let returnFocus = null, restoreTimer = null, pendingBack = null;
window.addEventListener('keydown', (e) => trapKeys(e), true);   // vale para qualquer janela aberta (também as clássicas), mesmo com o foco fora dela
/** Acessibilidade das janelas: papel de diálogo, foco inicial dentro dela, Tab/Shift+Tab presos nela e foco devolvido a quem a abriu. */
function trapKeys(e) {
  const m = document.getElementById('modal');
  if (e.key !== 'Tab' || !m || m.hidden) return;
  e.stopPropagation();                      // a tecla Tab é da janela: nunca chega aos atalhos do mapa
  const items = [...m.querySelectorAll(FOCUSABLE)].filter(visible);
  if (!items.length) { e.preventDefault(); return; }
  const first = items[0], last = items[items.length - 1], cur = document.activeElement;
  if (!m.contains(cur)) { e.preventDefault(); first.focus(); }
  else if (e.shiftKey && cur === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && cur === last) { e.preventDefault(); first.focus(); }
}
function initialFocus(m) {
  const box = m.querySelector('.modal-box'); if (!box) return;
  const label = box.querySelector('h2'); if (label) m.setAttribute('aria-label', label.textContent.replace(/\s+/g, ' ').trim());
  const first = (sel) => [...box.querySelectorAll(sel)].find(visible);
  // Em telas de toque o teclado virtual sobe sozinho quando um campo de texto recebe o foco: abrir uma janela não pode fazer isso (o teclado
  // esconderia metade dela). Lá o foco inicial vai para o botão principal; com mouse e teclado (desktop) nada muda.
  const touch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const typing = (e) => e && /^(INPUT|TEXTAREA)$/.test(e.tagName) && !/^(button|submit|checkbox|radio|range|color|file)$/i.test(e.type || '');
  let target = first('[data-autofocus]') || first('input:not([type=hidden]):not([type=radio]):not([type=checkbox]):not([disabled])') || first('button.primary:not([disabled])') || first(FOCUSABLE);
  if (touch && typing(target)) target = first('button.primary:not([disabled])') || first('button:not([disabled])') || box;
  if (target) { if (target === box) box.setAttribute('tabindex', '-1'); target.focus(); }
}

/** Renderiza um componente dentro do #modal (substitui o conteúdo anterior). */
function mount(Component, props) {
  const H = window.MC, m = H.modalEl();
  unmount();
  if (restoreTimer) { clearTimeout(restoreTimer); restoreTimer = null; returnFocus = pendingBack; }           // uma janela substitui a outra (ex.: Versões → Biblioteca): quem abriu continua sendo o mesmo
  else if (m.hidden && document.activeElement && document.activeElement !== document.body) returnFocus = document.activeElement;
  m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  m.textContent = ''; m.hidden = false;
  const host = document.createElement('div'); host.id = 'react-host'; m.appendChild(host);
  const root = createRoot(host); cur = { root, host };
  const close = () => {
    unmount(); H.closeModal();
    const back = returnFocus; returnFocus = null; pendingBack = back; clearTimeout(restoreTimer);
    restoreTimer = setTimeout(() => { restoreTimer = null; if (H.modalEl().hidden && back && document.contains(back) && visible(back)) back.focus(); }, 0);   // devolve o foco a quem abriu (se nenhuma outra janela tomou o lugar)
  };
  flushSync(() => root.render(<Component {...props} onClose={close} />));
  initialFocus(m);
}

// Painel de estudos: uma raiz permanente em #dash, redesenhada a cada renderDash() (mesmos gatilhos da versão clássica).
let dashRoot = null;
function renderDash() {
  const box = document.getElementById('dash');
  if (!dashRoot) { box.textContent = ''; dashRoot = createRoot(box); }
  flushSync(() => dashRoot.render(<Dashboard />));
}
function unmountDash() {
  if (!dashRoot) return;
  try { dashRoot.unmount(); } catch { /* nó já removido */ }
  dashRoot = null; const box = document.getElementById('dash'); box.textContent = ''; delete box.dataset.ui;
}

// Painéis laterais: raízes permanentes em #linksBody (Conexões) e #outline (Estrutura).
const panels = {};
function renderPanel(id, element) {
  const box = document.getElementById(id); if (!box) return;
  if (!panels[id]) { box.textContent = ''; panels[id] = createRoot(box); }
  flushSync(() => panels[id].render(element)); box.dataset.ui = 'react';
}
function unmountPanel(id) {
  if (!panels[id]) return;
  try { panels[id].unmount(); } catch { /* nó já removido */ }
  delete panels[id]; const box = document.getElementById(id); if (box) { box.textContent = ''; delete box.dataset.ui; }
}

import { MediaPane } from './MediaPane.jsx';

// Painel de estudo dividido (PDF / Vídeo / Navegador): uma raiz em #pdfpane enquanto estiver aberto.
let mediaRoot = null;
let activeMediaTab = 'pdf';
const resizeSoon = () => setTimeout(() => window.dispatchEvent(new Event('resize')), 0);   // o mapa se ajusta à nova largura

function openMedia(tab = 'pdf', opts = {}) {
  const pane = document.getElementById('pdfpane'), split = document.getElementById('pdfsplit');
  activeMediaTab = tab;
  if (mediaRoot) {
    document.dispatchEvent(new CustomEvent('mc:media-switch', { detail: { tab, pdfOpts: opts } }));
    if (opts.path || opts.page) document.dispatchEvent(new CustomEvent('mc:pdf-open', { detail: opts }));
    return;
  }
  pane.hidden = false; split.hidden = false; pane.textContent = '';
  const cfg = (window.MC && typeof window.MC.loadCfg === 'function') ? window.MC.loadCfg() : {};
  const w = cfg.pdfWidth; if (w) pane.style.width = w + 'px';
  mediaRoot = createRoot(pane);
  flushSync(() => mediaRoot.render(<MediaPane initialTab={tab} pdfOpts={opts} onClose={closeMedia} />));
  document.body.classList.add('pdf-open'); resizeSoon();
}

function closeMedia() {
  if (!mediaRoot) return;
  try { mediaRoot.unmount(); } catch { /* nó já removido */ }
  mediaRoot = null;
  const pane = document.getElementById('pdfpane'); pane.textContent = ''; pane.hidden = true; document.getElementById('pdfsplit').hidden = true;
  document.body.classList.remove('pdf-open'); resizeSoon();
}

function openPdf(opts = {}) { openMedia('pdf', opts); }
function closePdf() { closeMedia(); }
function openVideo(opts = {}) { openMedia('video', opts); }
function openBrowser(opts = {}) { openMedia('browser', opts); }
const refsRoot = { r: null };
function renderRefs() {
  const box = document.getElementById('refsBox'); if (!box) return;
  if (!refsRoot.r) { box.textContent = ''; refsRoot.r = createRoot(box); }
  flushSync(() => refsRoot.r.render(<RefsBox />));
}
document.addEventListener('mc:render', () => { if (document.getElementById('refsBox')) renderRefs(); });

// Tela inicial: sobreposição #home (raiz criada ao abrir e descartada ao fechar).
let homeRoot = null;
function openHome() {
  const box = document.getElementById('home');
  if (!homeRoot) { box.textContent = ''; homeRoot = createRoot(box); }
  box.hidden = false; box.dataset.ui = 'react';
  document.querySelector('[data-act="home"]')?.classList.add('on');
  flushSync(() => homeRoot.render(<Home onClose={closeHome} />));
  const target = box.querySelector('#hmContinue') || box.querySelector('#hmNew'); if (target) target.focus();   // teclado: Enter já age no atalho principal
}
function closeHome() {
  if (!homeRoot) return;
  try { homeRoot.unmount(); } catch { /* nó já removido */ }
  homeRoot = null; const box = document.getElementById('home'); box.hidden = true; box.textContent = ''; delete box.dataset.ui;
  document.querySelector('[data-act="home"]')?.classList.remove('on');
}

window.MCReact = {
  version: 1,
  openLibrary: (tab = 'maps') => mount(LibraryModal, { initialTab: tab }),
  openVersions: (id, opts = {}) => mount(VersionsModal, { mapId: id, back: opts.back !== false }),
  openCsv: () => mount(CsvModal, {}),
  openPlan: () => mount(PlanModal, {}),
  openReview: () => mount(ReviewMode, {}),
  openSimulado: () => mount(SimuladoModal, {}),
  openShortcuts: () => mount(ShortcutsModal, {}),
  openManual: (section) => mount(ManualModal, { initialSection: section }),
  openHome, closeHome, homeIsOpen: () => !!homeRoot, renderDash, unmountDash,
  openPdf, closePdf, togglePdf: () => (mediaRoot && activeMediaTab === 'pdf' ? closeMedia() : openPdf({})), pdfIsOpen: () => !!mediaRoot && activeMediaTab === 'pdf',
  openVideo, toggleVideo: () => (mediaRoot && activeMediaTab === 'video' ? closeMedia() : openVideo({})), videoIsOpen: () => !!mediaRoot && activeMediaTab === 'video',
  openBrowser, toggleBrowser: () => (mediaRoot && activeMediaTab === 'browser' ? closeMedia() : openBrowser({})), browserIsOpen: () => !!mediaRoot && activeMediaTab === 'browser',
  renderRefs,
  renderLinks: (model) => renderPanel('linksBody', <Connections model={model} />), unmountLinks: () => unmountPanel('linksBody'),
  renderOutline: (rows) => renderPanel('outline', <Outline rows={rows} />), unmountOutline: () => unmountPanel('outline'),
  unmount,
};
