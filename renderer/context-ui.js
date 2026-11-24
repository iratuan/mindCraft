'use strict';
/**
 * Gerencia a máquina de estados contextual da interface (UX contextual):
 * 1. Desabilita/habilita e ajusta títulos dos botões da barra de ferramentas (#rail)
 *    de acordo com o objeto selecionado (canvas, raiz, tópico filho, relação ou seleção múltipla).
 * 2. Alterna as seções da barra de opções (#options) para refletir o objeto atual.
 * 3. Atalhos rápidos para mídias de estudo (Ctrl+Shift+V para vídeo, Ctrl+Shift+W para navegador).
 */

const NO_MAP_TITLE = 'Abra um mapa mental para usar este comando';
const NO_MAP_MSG = 'Abra ou crie um mapa para usar esta ferramenta.';
/** Ferramentas que só existem com um mapa: sem mapa, mostram a mensagem em vez de quebrar. Devolve true se pode continuar. */
/** Um mapa vazio e descartável para as telas que só LEEM o mapa atual (ex.: revisão do dia, que é da biblioteca) quando não há mapa aberto.
 *  Nunca é salvo: não está em nenhuma biblioteca nem em nenhum arquivo. */
let _emptyStub = null;
function emptyMapStub() {
  if (!_emptyStub) { const { MindMap, createNode } = require(path.join(core, 'components', 'model')); _emptyStub = new MindMap(createNode(''), { name: '' }); }
  return _emptyStub;
}
function needMap() {
  if (map) return true;
  if (typeof setStatus === 'function') setStatus(NO_MAP_MSG);
  return false;
}

function setToolBtn(btn, enabled, title) {
  if (!btn) return;
  btn.disabled = !enabled;
  if (!enabled) btn.setAttribute('aria-disabled', 'true');
  else btn.removeAttribute('aria-disabled');
  if (title) btn.title = title;
}

/**
 * Há um mapa de trabalho na tela? Não há enquanto a tela inicial está por cima (ela cobre o mapa de fundo).
 * Toda ação que mexe no mapa (ou que só faz sentido com ele aberto) depende desta única regra, inclusive o menu do desktop e o do tablet.
 */
function mapInUse() {
  return !!(map && map.root) && workspaceFocus === 'map' && !(window.MCReact && typeof window.MCReact.homeIsOpen === 'function' && window.MCReact.homeIsOpen());
}

// Foco do espaço de trabalho (0.6.0): 'map' = o mapa está ativo (ações e painel da direita); 'media' = PDF/vídeo/navegador ativo.
let workspaceFocus = 'map';
function setWorkspaceFocus(f) {
  if (f !== 'map' && f !== 'media') return;
  workspaceFocus = f;
  document.body.classList.toggle('focus-media', f === 'media');
  const tabMap = $('#tabMap');
  if (tabMap) { tabMap.classList.toggle('on', f === 'map'); tabMap.setAttribute('aria-selected', String(f === 'map')); }
  if (typeof syncContextUI === 'function') syncContextUI();
}

// O menu do desktop (electron/main.js) habilita/desabilita os próprios comandos conforme esta informação. Só avisa quando muda.
let lastMapState = null;
function notifyMapState(inUse) {
  if (inUse === lastMapState) return;
  lastMapState = inUse;
  try { ipcRenderer.send('map-state', inUse); } catch { /* sem canal com o processo principal (ex.: testes da página) */ }
}

/** Sem mapa aberto (início, ou depois de fechar o mapa): nada do mapa aparece nem fica habilitado; a tela inicial é a única coisa útil. */
function syncNoMapUI() {
  document.body.classList.add('no-map');   // sem mapa (tela inicial): o painel da direita não tem o que mostrar
  const home = !!(window.MCReact && typeof window.MCReact.homeIsOpen === 'function' && window.MCReact.homeIsOpen());
  const tabMap = $('#tabMap');
  if (tabMap) tabMap.hidden = true;
  // ferramentas que dependem do mapa (edição, rede, painel de estudos e as mídias que alimentam o mapa): desabilitadas sem mapa
  for (const a of ['child', 'sibling', 'addFloating', 'delete', 'moveUp', 'moveDown', 'relate', 'fit', 'graph', 'dash', 'pdf']) setToolBtn($(`[data-act="${a}"]`), false, NO_MAP_TITLE);
  // Início só faz sentido com a tela inicial aberta: sem mapa, não há para onde voltar
  setToolBtn($('[data-act="home"]'), home, home ? '' : 'Tela inicial');
  for (const id of ['#search', '#closeMapBtn', '#zoom', '#zoomIn', '#zoomOut']) { const el = $(id); if (el) el.disabled = true; }
  const st = $('#status'); if (st && home) st.textContent = '';
  notifyMapState(false);
  const options = $('#options'); if (options) { options.setAttribute('data-context', 'none'); options.hidden = true; }
}

function syncContextUI() {
  document.body.classList.toggle('no-map', !map);
  if (!map) { syncNoMapUI(); return; }
  const inUse = mapInUse();
  const homeNow = !!(window.MCReact && typeof window.MCReact.homeIsOpen === 'function' && window.MCReact.homeIsOpen());
  const tabMapEl = $('#tabMap');
  if (tabMapEl) tabMapEl.hidden = homeNow;            // a aba do mapa só existe com um mapa aberto (não na tela inicial)
  const st = $('#status'); if (st && homeNow) st.textContent = '';
  setToolBtn($('[data-act="graph"]'), inUse, inUse ? 'Rede de conhecimento (Ctrl+G)' : NO_MAP_TITLE);   // rede é do mapa: só com o mapa ativo
  setToolBtn($('[data-act="home"]'), true, 'Tela inicial (Ctrl+Shift+H)');
  // ferramentas que alimentam o mapa: habilitadas com um mapa aberto (o caminho sem mapa as desabilita; aqui precisam voltar)
  setToolBtn($('[data-act="dash"]'), true, 'Painel de mapas (Ctrl+E)');
  setToolBtn($('[data-act="pdf"]'), true, 'Leitor de PDF ao lado do mapa (Ctrl+Shift+P)');
  notifyMapState(inUse);
  const sel = inUse && map && selectedId && map.find(selectedId);
  const rel = inUse && map && selectedRel && map.meta.relations.find((r) => r.id === selectedRel);
  const isRoot = !!(sel && map && sel.node.id === map.root.id);
  const multi = inUse && selIds.size > 1;
  const pick = (msg) => (inUse ? msg : NO_MAP_TITLE);

  // 1. Atualização dos botões do trilho lateral (#rail)
  setToolBtn($('[data-act="child"]'), !!sel, sel ? 'Novo tópico filho (Tab)' : pick('Selecione um tópico para criar filho'));
  setToolBtn($('[data-act="addFloating"]'), inUse, inUse ? 'Novo tópico flutuante, independente da árvore' : NO_MAP_TITLE);
  setToolBtn(
    $('[data-act="sibling"]'),
    !!sel && !isRoot && !multi,
    isRoot ? 'A ideia central não tem irmãos' : multi ? 'Selecione um único tópico para criar irmão' : sel ? 'Novo tópico irmão (Enter)' : pick('Selecione um tópico para criar irmão')
  );
  setToolBtn(
    $('[data-act="delete"]'),
    (!!sel && !isRoot) || !!rel,
    isRoot ? 'A ideia central não pode ser excluída' : rel ? 'Excluir relação selecionada (Del)' : sel ? 'Excluir (Del)' : pick('Selecione um tópico ou relação para excluir')
  );
  setToolBtn(
    $('[data-act="moveUp"]'),
    !!sel && !isRoot && !multi,
    isRoot ? 'A ideia central não pode ser movida' : multi ? 'Selecione um único tópico para mover' : sel ? 'Subir tópico (Alt+↑)' : pick('Selecione um tópico para mover')
  );
  setToolBtn(
    $('[data-act="moveDown"]'),
    !!sel && !isRoot && !multi,
    isRoot ? 'A ideia central não pode ser movida' : multi ? 'Selecione um único tópico para mover' : sel ? 'Descer tópico (Alt+↓)' : pick('Selecione um tópico para mover')
  );
  setToolBtn(
    $('[data-act="relate"]'),
    !!sel && !multi,
    multi ? 'Selecione um único tópico para criar relação' : sel ? 'Seta de relação entre tópicos (R)' : pick('Selecione um tópico para iniciar relação')
  );
  setToolBtn($('[data-act="fit"]'), inUse, inUse ? 'Ajustar à tela (Ctrl+0)' : NO_MAP_TITLE);
  // Cabeçalho e barra de status também são do mapa: busca, exportação, fechar mapa e zoom
  for (const id of ['#search', '#closeMapBtn', '#zoom', '#zoomIn', '#zoomOut']) {
    const el = $(id);
    if (el) el.disabled = !inUse;
  }

  // 2. Alternância contextual da barra superior (#options) com garantia de exclusão mútua
  const options = $('#options');
  const optTopic = $('#optTopic');
  const optRel = $('#optRel');
  const optCanvas = $('#optCanvas');

  if (options && optTopic && optRel && optCanvas) {
    if (!inUse) {
      options.setAttribute('data-context', 'none');
      optTopic.hidden = true;
      optRel.hidden = true;
      optCanvas.hidden = true;
    } else if (rel) {
      options.setAttribute('data-context', 'relation');
      optTopic.hidden = true;
      optCanvas.hidden = true;
      optRel.hidden = false;

      const relLabelIn = $('#optRelLabel');
      if (relLabelIn && document.activeElement !== relLabelIn) {
        relLabelIn.value = rel.label || '';
      }
      const relColorIn = $('#optRelColor');
      if (relColorIn) relColorIn.value = rel.color || '#2680eb';
      const relStyleIn = $('#optRelStyle');
      if (relStyleIn) relStyleIn.value = rel.style || 'dashed';
    } else if (sel) {
      options.setAttribute('data-context', 'topic');
      optRel.hidden = true;
      optCanvas.hidden = true;
      optTopic.hidden = false;

      const lbl = $('#optTopicLabel');
      if (lbl) {
        // mostra o título do tópico selecionado (do mapa atual), não um rótulo fixo: evita confundir com o mapa anterior
        const t = String(sel.node.title || '').replace(/\s+/g, ' ').trim();
        lbl.textContent = multi ? `${selIds.size} tópicos` : (t.length > 28 ? t.slice(0, 27) + '…' : (t || (isRoot ? 'Ideia central' : 'Tópico')));
        lbl.title = t;
      }
    } else {
      options.setAttribute('data-context', 'canvas');
      optTopic.hidden = true;
      optRel.hidden = true;
      optCanvas.hidden = false;
    }
    // a barra de opções só existe quando tem algo a mostrar: com um tópico, os controles estão no painel Estilo (ganha-se a faixa do mapa)
    const ctx = options.getAttribute('data-context');
    options.hidden = ctx === 'none';   // no contexto de tópico a barra mostra preenchimento, forma, negrito e níveis (e a dica)
  }
}

let closingMap = false;
// fecha o último mapa aberto (sem abas restantes): descarrega o mapa e volta à tela inicial
async function closeLastMap() {
  if (closingMap) return false;
  closingMap = true;
  try {
    if (typeof commitNotes === 'function') commitNotes();
    if (typeof dirty !== 'undefined' && dirty) {
      if (typeof confirmDiscard === 'function') {
        try {
          const okk = await confirmDiscard();
          if (!okk) return false;
        } catch (err) {
          console.warn('Erro ao confirmar descarte:', err);
        }
      }
    }

    // Se havia rascunho anterior recuperado ou pendente, remove do disco
    if (typeof removeDraft === 'function') {
      try { removeDraft(); } catch { /* ignora */ }
    }

    // Fecha o leitor de PDF ao lado do mapa
    if (window.MCReact) window.MCReact.closePdf();

    // Fecha painéis auxiliares
    if (typeof closeDash === 'function') closeDash();
    if (typeof closeGraph === 'function') closeGraph();

    // Descarrega o mapa: sem mapa aberto, a tela inicial fica sozinha (nenhum mapa vazio fica por baixo dela)
    map = null;
    document.body.classList.add('no-map');
    notesOwner = null;   // o painel de notas não pode guardar um dono de um mapa já fechado
    selectedRel = null; selIds = new Set(); hits = null;

    dirty = false;
    filePath = null;
    selectedId = null;
    selIds = new Set();
    selectedRel = null;
    hits = null;

    const opt = $('#options');
    if (opt) opt.setAttribute('data-context', 'none');
    const dot = $('#dirtyDot');
    if (dot) dot.hidden = true;
    const docTitle = $('#docTitle');
    if (docTitle) docTitle.textContent = 'Sem título';

    if (window.MCReact && typeof window.MCReact.openHome === 'function') {
      window.MCReact.openHome();
    } else if (typeof act !== 'undefined' && typeof act.home === 'function') {
      act.home(true);
    }
    if (typeof setStatus === 'function') setStatus('Mapa fechado · Tela inicial');
    return true;
  } finally {
    closingMap = false;
  }
}
// o ✕ de uma aba fecha essa aba; o último mapa fecha pela tela inicial
async function closeCurrentMap() {
  if (tabs.length > 1 && activeIdx >= 0) return closeTab(activeIdx);
  const ok = await closeLastMap();
  if (ok) { tabs = []; activeIdx = -1; if (typeof renderTabs === 'function') renderTabs(); }
  return ok;
}
window.closeCurrentMap = closeCurrentMap;
// a única entrada que fecha o mapa é o botão ✕ da aba (data-act="closeMap")
if (typeof act !== 'undefined') act.closeMap = closeCurrentMap;

// Inicializa controles interativos da relação na barra de opções
function initContextUIEvents() {
  const closeMapBtn = $('#closeMapBtn');
  if (closeMapBtn) {
    const handleClose = (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeCurrentMap();
    };
    closeMapBtn.addEventListener('click', handleClose);
    closeMapBtn.addEventListener('touchend', handleClose);
  }

  // Níveis na barra do mapa: repassa a escolha ao seletor da barra do tópico (sem atributo onchange no HTML)
  const levelCanvas = $('#levelSelCanvas');
  if (levelCanvas) {
    levelCanvas.addEventListener('change', (e) => {
      const levelSel = $('#levelSel');
      levelSel.value = e.target.value;
      levelSel.dispatchEvent(new Event('change'));
    });
  }

  const relLabelIn = $('#optRelLabel');
  if (relLabelIn) {
    relLabelIn.addEventListener('input', (e) => {
      if (selectedRel) {
        change(() => map.updateRelation(selectedRel, { label: e.target.value }));
        const n = $('#notes');
        if (n && notesOwner && notesOwner.rel && notesOwner.id === selectedRel) n.value = e.target.value;
      }
    });
  }
  const relColorIn = $('#optRelColor');
  if (relColorIn) {
    relColorIn.addEventListener('change', (e) => {
      if (selectedRel) change(() => map.updateRelation(selectedRel, { color: e.target.value }));
    });
  }
  const relStyleIn = $('#optRelStyle');
  if (relStyleIn) {
    relStyleIn.addEventListener('change', (e) => {
      if (selectedRel) change(() => map.updateRelation(selectedRel, { style: e.target.value }));
    });
  }
  const relInvertBtn = $('#optRelInvert');
  if (relInvertBtn) {
    relInvertBtn.addEventListener('click', () => {
      if (selectedRel && map) {
        const r = map.meta.relations.find((x) => x.id === selectedRel);
        if (r) change(() => map.updateRelation(selectedRel, { from: r.to, to: r.from }));
      }
    });
  }
  const relDelBtn = $('#optRelDelete');
  if (relDelBtn) {
    relDelBtn.addEventListener('click', () => {
      if (selectedRel && typeof act !== 'undefined' && act.delete) act.delete();
    });
  }

  // Atalho para fechar o mapa (Ctrl+Shift+M)
  window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  });

  // Um clique no mapa devolve o foco a ele (o clique segue normalmente)
  document.addEventListener('mc:media-focus', () => setWorkspaceFocus('media'));
  document.addEventListener('mc:map-focus', () => setWorkspaceFocus('map'));
  const tabMap = $('#tabMap');
  if (tabMap) tabMap.addEventListener('click', (e) => { if (!e.target.closest('#closeMapBtn')) setWorkspaceFocus('map'); });
  const reveal = $('#panelsReveal');
  if (reveal) reveal.addEventListener('click', () => setWorkspaceFocus('map'));
  const stageEl = $('#stage');
  if (stageEl) stageEl.addEventListener('mousedown', () => { if (workspaceFocus !== 'map') setWorkspaceFocus('map'); }, true);

  // Atualiza a cada render do mapa e sempre que a tela inicial abre ou fecha (ela cobre o mapa, então muda o que está disponível)
  window.addEventListener('mc:render', syncContextUI);
  syncContextUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContextUIEvents);
} else {
  initContextUIEvents();
}
