// Interface em React, adotada por fatias: cada tela portada mantém os MESMOS ids, classes e atributos da versão clássica,
// de modo que os testes existentes (e2e e QA) valem como prova de equivalência. A ponte com o app é window.MC (ver library-ui.js).
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { LibraryModal } from './LibraryModal.jsx';
import { VersionsModal } from './VersionsModal.jsx';
import { CsvModal } from './CsvModal.jsx';
import { PlanModal } from './PlanModal.jsx';
import { Dashboard } from './Dashboard.jsx';
import { Connections, Outline } from './Panels.jsx';

let cur = null;
function unmount() { if (cur) { try { cur.root.unmount(); } catch { /* o nó já foi removido por outro código */ } cur = null; } }

/** Renderiza um componente dentro do #modal (substitui o conteúdo anterior). */
function mount(Component, props) {
  const H = window.MC, m = H.modalEl();
  unmount();
  m.textContent = ''; m.hidden = false;
  const host = document.createElement('div'); host.id = 'react-host'; m.appendChild(host);
  const root = createRoot(host); cur = { root, host };
  const close = () => { unmount(); H.closeModal(); };
  flushSync(() => root.render(<Component {...props} onClose={close} />));
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

window.MCReact = {
  version: 1,
  openLibrary: (tab = 'maps') => mount(LibraryModal, { initialTab: tab }),
  openVersions: (id, opts = {}) => mount(VersionsModal, { mapId: id, back: opts.back !== false }),
  openCsv: () => mount(CsvModal, {}),
  openPlan: () => mount(PlanModal, {}),
  renderDash, unmountDash,
  renderLinks: (model) => renderPanel('linksBody', <Connections model={model} />), unmountLinks: () => unmountPanel('linksBody'),
  renderOutline: (rows) => renderPanel('outline', <Outline rows={rows} />), unmountOutline: () => unmountPanel('outline'),
  unmount,
};
