'use strict';
/**
 * Gerencia a máquina de estados contextual da interface (UX contextual):
 * 1. Desabilita/habilita e ajusta títulos dos botões da barra de ferramentas (#rail)
 *    de acordo com o objeto selecionado (canvas, raiz, tópico filho, relação ou seleção múltipla).
 * 2. Alterna as seções da barra de opções (#options) para refletir o objeto atual.
 * 3. Atalhos rápidos para mídias de estudo (Ctrl+Shift+V para vídeo, Ctrl+Shift+W para navegador).
 */

function setToolBtn(btn, enabled, title) {
  if (!btn) return;
  btn.disabled = !enabled;
  if (!enabled) btn.setAttribute('aria-disabled', 'true');
  else btn.removeAttribute('aria-disabled');
  if (title) btn.title = title;
}

function syncContextUI() {
  if (!map) return;
  const sel = selectedId && map.find(selectedId);
  const rel = selectedRel && map.meta.relations.find((r) => r.id === selectedRel);
  const isRoot = !!(sel && sel.node.id === map.root.id);
  const multi = selIds.size > 1;

  // 1. Atualização dos botões do trilho lateral (#rail)
  setToolBtn($('[data-act="child"]'), !!sel, sel ? 'Novo tópico filho (Tab)' : 'Selecione um tópico para criar filho');
  setToolBtn(
    $('[data-act="sibling"]'),
    !!sel && !isRoot && !multi,
    isRoot ? 'A ideia central não tem irmãos' : multi ? 'Selecione um único tópico para criar irmão' : sel ? 'Novo tópico irmão (Enter)' : 'Selecione um tópico para criar irmão'
  );
  setToolBtn(
    $('[data-act="delete"]'),
    (!!sel && !isRoot) || !!rel,
    isRoot ? 'A ideia central não pode ser excluída' : rel ? 'Excluir relação selecionada (Del)' : sel ? 'Excluir (Del)' : 'Selecione um tópico ou relação para excluir'
  );
  setToolBtn(
    $('[data-act="moveUp"]'),
    !!sel && !isRoot && !multi,
    isRoot ? 'A ideia central não pode ser movida' : multi ? 'Selecione um único tópico para mover' : sel ? 'Subir tópico (Alt+↑)' : 'Selecione um tópico para mover'
  );
  setToolBtn(
    $('[data-act="moveDown"]'),
    !!sel && !isRoot && !multi,
    isRoot ? 'A ideia central não pode ser movida' : multi ? 'Selecione um único tópico para mover' : sel ? 'Descer tópico (Alt+↓)' : 'Selecione um tópico para mover'
  );
  setToolBtn(
    $('[data-act="relate"]'),
    !!sel && !multi,
    multi ? 'Selecione um único tópico para criar relação' : sel ? 'Relação entre tópicos (R)' : 'Selecione um tópico para iniciar relação'
  );
  setToolBtn($('[data-act="undo"]'), map._undo && map._undo.length > 0, 'Desfazer (Ctrl+Z)');
  setToolBtn($('[data-act="redo"]'), map._redo && map._redo.length > 0, 'Refazer (Ctrl+Y)');

  const hasActiveMap = !!(map && map.root && (!window.MCReact || !window.MCReact.homeIsOpen?.()));
  const presentBtn = $('[data-act="present"]');
  setToolBtn(presentBtn, hasActiveMap, hasActiveMap ? 'Apresentar mapa (F5)' : 'Abra um mapa mental para apresentar');
  if (presentBtn) {
    if (!hasActiveMap) {
      presentBtn.classList.add('disabled');
      presentBtn.style.opacity = '0.35';
      presentBtn.style.pointerEvents = 'none';
    } else {
      presentBtn.classList.remove('disabled');
      presentBtn.style.opacity = '';
      presentBtn.style.pointerEvents = '';
    }
  }

  // 2. Alternância contextual da barra superior (#options) com garantia de exclusão mútua
  const options = $('#options');
  const optTopic = $('#optTopic');
  const optRel = $('#optRel');
  const optCanvas = $('#optCanvas');

  if (options && optTopic && optRel && optCanvas) {
    if (window.MCReact && typeof window.MCReact.homeIsOpen === 'function' && window.MCReact.homeIsOpen()) {
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
        lbl.textContent = isRoot ? 'Ideia central' : multi ? `${selIds.size} tópicos` : 'Tópico';
      }
    } else {
      options.setAttribute('data-context', 'canvas');
      optTopic.hidden = true;
      optRel.hidden = true;
      optCanvas.hidden = false;
    }
  }
}

let closingMap = false;
async function closeCurrentMap() {
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

    // Fecha painéis divididos de estudo (PDF, Vídeo, Navegador)
    if (window.MCReact && typeof window.MCReact.closeMedia === 'function') {
      try { window.MCReact.closeMedia(); } catch { /* ignora */ }
    } else if (typeof closePdf === 'function') {
      try { closePdf(); } catch { /* ignora */ }
    }

    // Fecha painéis auxiliares
    if (typeof closeDash === 'function') closeDash();
    if (typeof closeGraph === 'function') closeGraph();

    // Descarrega o mapa atual da memória criando um estado limpo
    if (typeof newMap === 'function') {
      newMap();
    }

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
window.closeCurrentMap = closeCurrentMap;
if (typeof act !== 'undefined') {
  act.closeMap = closeCurrentMap;
}

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
      if (selectedRel) {
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

  // Atalhos de teclado adicionais para mídia de estudo e fechar mapa
  window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      if (e.key.toLowerCase() === 'v' && typeof act !== 'undefined' && act.video) {
        e.preventDefault();
        act.video();
      } else if (e.key.toLowerCase() === 'w' && typeof act !== 'undefined' && act.browser) {
        e.preventDefault();
        act.browser();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        closeCurrentMap();
      }
    }
  });

  // Atualiza a cada render do mapa
  window.addEventListener('mc:render', syncContextUI);
  syncContextUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContextUIEvents);
} else {
  initContextUIEvents();
}
