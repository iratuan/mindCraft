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
      panel.style.cssText = 'position:fixed;bottom:80px;right:12px;z-index:10;width:300px;max-height:340px;display:flex;flex-direction:column;gap:10px;padding:14px;background:var(--bg-panel);border:1px solid var(--line);border-radius:10px;font-size:14px;color:var(--text);line-height:1.5;';
      document.body.appendChild(panel);
    }
    if (!cards.length) { panel.innerHTML = '<div style="color:var(--text-dim);text-align:center;padding:20px;">Nenhum flashcard.<br>Selecione um trecho nas notas e clique 🃏,<br>ou pressione Ctrl+Shift+G para gerar de todas as notas do mapa.</div>'; return; }
    if (idx >= cards.length) idx = 0;
    const c = cards[idx];
    panel.innerHTML = '';
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';
    header.innerHTML = `<span style="font-weight:700;color:var(--text-strong);">🃏 ${idx + 1}/${cards.length}</span><button class="btn small" style="height:24px;padding:0 8px;font-size:11px;" title="Gerar de todas as notas do mapa">Gerar do mapa</button><button class="btn small" style="width:24px;height:24px;padding:0;" title="Fechar">✕</button>`;
    const genBtn = header.querySelectorAll('button')[0];
    genBtn.addEventListener('click', (e) => { e.stopPropagation(); generateFromMap(); });
    const closeBtn = header.querySelectorAll('button')[1];
    closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
    panel.appendChild(header);

    const card = document.createElement('div');
    card.style.cssText = 'flex:1;min-height:120px;padding:16px;background:var(--bg-app);border:1px solid var(--line);border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;text-align:center;white-space:pre-wrap;overflow:auto;font-size:15px;line-height:1.6;';
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

  // Gera flashcards a partir de todas as notas do mapa aberto
  function generateFromMap() {
    if (!map) { setStatus('Abra um mapa para gerar flashcards.'); return; }
    const walk = (node, trail) => {
      const notes = (node.notes || '').trim();
      if (notes && notes.length > 10) {
        // usa o título como frente e a nota como verso
        if (!cards.some((c) => c.front === node.title)) {
          cards.push({ id: Date.now() + Math.random(), front: node.title, back: notes, mapKey: (typeof filePath !== 'undefined' ? filePath : null) });
        }
      }
      for (const c of node.children || []) walk(c, [...trail, node.title]);
    };
    walk(map.root, []);
    for (const f of (map.meta._momFloating || [])) walk(f.node, []);
    saveCards();
    setStatus(`Flashcards gerados: ${cards.length} no total.`);
    renderPanel();
    const panel = $('#flashcardPanel');
    if (panel) panel.style.display = 'flex';
  }

  // Atalho Ctrl+Shift+F
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') { e.preventDefault(); togglePanel(); }
  });
  // Atalho Ctrl+Shift+G para gerar a partir do mapa
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'g') { e.preventDefault(); generateFromMap(); }
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
