// Interface em React, adotada por fatias: cada tela portada mantém os MESMOS ids, classes e atributos da versão clássica,
// de modo que os testes existentes (e2e e QA) valem como prova de equivalência. A ponte com o app é window.MC (ver library-ui.js).
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { LibraryModal } from './LibraryModal.jsx';
import { VersionsModal } from './VersionsModal.jsx';
import { CsvModal } from './CsvModal.jsx';
import { PlanModal } from './PlanModal.jsx';

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

window.MCReact = {
  version: 1,
  openLibrary: (tab = 'maps') => mount(LibraryModal, { initialTab: tab }),
  openVersions: (id, opts = {}) => mount(VersionsModal, { mapId: id, back: opts.back !== false }),
  openCsv: () => mount(CsvModal, {}),
  openPlan: () => mount(PlanModal, {}),
  unmount,
};
