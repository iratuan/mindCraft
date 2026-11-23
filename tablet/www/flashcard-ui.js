'use strict';
/* Flashcards a partir de notas: seleciona um trecho nas notas e cria um cartão (frente/verso).
   Armazena em map.meta.flashcards. Painel de revisão com virar o cartão. */
(function () {
  const $ = (s) => document.querySelector(s);
  let cards = [], idx = 0, flipped = false;

  function loadCards() {
    try { cards = (map && map.meta && Array.isArray(map.meta.flashcards)) ? map.meta.flashcards : []; }
    catch { cards = []; }
    idx = 0; flipped = false;
  }

  function saveCards() {
    if (!map) return;
    if (!map.meta) map.meta = {};
    map.meta.flashcards = cards;
    dirty = true;
  }

  // Botão na barra de notas: "Criar flashcard do trecho selecionado"
  function addFlashcardBtn() {
    const bar = $('#notesBar');
    if (!bar || bar.querySelector('[data-fmt="flashcard"]')) return;
    const btn = document.createElement('button');
    btn.setAttribute('data-fmt', 'flashcard');
    btn.title = 'Criar flashcard do trecho selecionado (frente = seleção, verso = você digita)';
    btn.textContent = '🃏';
    btn.addEventListener('click', (e) => { e.preventDefault(); createCard(); });
    bar.appendChild(btn);
  }

  function createCard() {
    const notes = $('#notes');
    if (!notes) return;
    const sel = notes.value.slice(notes.selectionStart, notes.selectionEnd).trim();
    if (!sel) { setStatus('Selecione um trecho nas notas para criar o flashcard.'); return; }
    const back = prompt('Verso do cartão (resposta):');
    if (back === null) return;
    cards.push({ id: Date.now(), front: sel, back: back.trim(), mapKey: (typeof filePath !== 'undefined' ? filePath : null) });
    saveCards();
    setStatus(`Flashcard criado. Total: ${cards.length}.`);
    renderPanel();
  }

  function renderPanel() {
    let panel = $('#flashcardPanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'flashcardPanel';
      panel.style.cssText = 'position:fixed;bottom:80px;right:12px;z-index:10;width:280px;max-height:320px;display:flex;flex-direction:column;gap:8px;padding:12px;background:var(--bg-panel);border:1px solid var(--line-soft);border-radius:12px;box-shadow:var(--shadow);font-size:13px;color:var(--text);';
      document.body.appendChild(panel);
    }
    if (!cards.length) { panel.innerHTML = '<div style="color:var(--text-dim);text-align:center;padding:20px;">Nenhum flashcard. Selecione um trecho nas notas e clique 🃏.</div>'; return; }
    if (idx >= cards.length) idx = 0;
    const c = cards[idx];
    panel.innerHTML = '';
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';
    header.innerHTML = `<span style="font-weight:700;color:var(--text-strong);">🃏 ${idx + 1}/${cards.length}</span><button class="btn small" style="width:24px;height:24px;padding:0;" title="Fechar">✕</button>`;
    header.querySelector('button').addEventListener('click', () => { panel.style.display = 'none'; });
    panel.appendChild(header);

    const card = document.createElement('div');
    card.style.cssText = 'flex:1;min-height:120px;padding:12px;background:var(--bg-field);border:1px solid var(--line-soft);border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;text-align:center;white-space:pre-wrap;overflow:auto;';
    card.textContent = flipped ? c.back : c.front;
    card.addEventListener('click', () => { flipped = !flipped; renderPanel(); });
    panel.appendChild(card);

    const hint = document.createElement('div');
    hint.style.cssText = 'font-size:10px;color:var(--text-dim);text-align:center;';
    hint.textContent = flipped ? 'Clique para ver a frente' : 'Clique para ver o verso';
    panel.appendChild(hint);

    const nav = document.createElement('div');
    nav.style.cssText = 'display:flex;gap:6px;justify-content:space-between;';
    const prev = document.createElement('button'); prev.className = 'btn small'; prev.textContent = '← Anterior'; prev.disabled = idx === 0;
    prev.addEventListener('click', () => { if (idx > 0) { idx--; flipped = false; renderPanel(); } });
    const del = document.createElement('button'); del.className = 'btn small'; del.textContent = 'Excluir'; del.style.color = 'var(--danger)';
    del.addEventListener('click', () => { cards.splice(idx, 1); if (idx >= cards.length) idx = Math.max(0, cards.length - 1); flipped = false; saveCards(); renderPanel(); });
    const next = document.createElement('button'); next.className = 'btn small'; next.textContent = 'Próximo →'; next.disabled = idx >= cards.length - 1;
    next.addEventListener('click', () => { if (idx < cards.length - 1) { idx++; flipped = false; renderPanel(); } });
    nav.append(prev, del, next);
    panel.appendChild(nav);
  }

  // Toggle do painel
  function togglePanel() {
    let panel = $('#flashcardPanel');
    if (!panel) { renderPanel(); panel = $('#flashcardPanel'); }
    if (panel.style.display === 'none') { panel.style.display = 'flex'; renderPanel(); }
    else panel.style.display = 'none';
  }

  // Atalho Ctrl+Shift+F
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') { e.preventDefault(); togglePanel(); }
  });

  // Inicializa quando o mapa carrega
  const orig = window.expandPanels;
  const init = () => { loadCards(); addFlashcardBtn(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
  else setTimeout(init, 500);
  // Recarrega cards quando o mapa muda
  const mo = new MutationObserver(() => { if (map) loadCards(); });
  if (document.body) mo.observe(document.body, { childList: true, subtree: true });
})();
