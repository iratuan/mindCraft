'use strict';
/* Menu de contexto do tópico em árvore: grupos com submenus (menu → submenu → ação).
   Abre com o botão direito, com a tecla de menu ou com Shift+F10 sobre um tópico. Submenus abrem ao passar o mouse, ao tocar
   (tablet) ou com as setas do teclado. Tudo grava pelo mesmo caminho dos controles da barra (change + map), então desfazer e salvar valem.
   Carregado depois de renderer.js, context-ui.js e ai-ui.js (usa os globais deles). */

const CTX_FONTS = [['', 'Padrão do tema'], ['Segoe UI', 'Segoe UI'], ['Arial', 'Arial'], ['Georgia', 'Georgia'], ['Times New Roman', 'Times New Roman'],
  ['Verdana', 'Verdana'], ['Trebuchet MS', 'Trebuchet MS'], ['Consolas', 'Consolas']];
const CTX_ALIGNS = [['auto', 'Automático'], ['left', 'Esquerda'], ['center', 'Centro'], ['right', 'Direita']];
const CTX_SHAPES = [['', 'Padrão do tema'], ['pill', 'Pílula'], ['round', 'Arredondado'], ['rect', 'Retângulo'], ['ellipse', 'Elipse'], ['underline', 'Sublinhado'], ['none', 'Sem forma']];
const CTX_PROGRESS = [[null, 'Sem barra'], [0, '0%'], [25, '25%'], [50, '50%'], [75, '75%'], [100, '100%']];
const ctxEl = document.getElementById('ctxMenu');
let ctxLevels = [];   // painéis abertos: [0] é o menu principal (#ctxMenu), depois os submenus

/** Estilo efetivo do tópico (já com o tema e os overrides), ou {} se não estiver na tela. */
function ctxStyle(id) { const b = L && L.boxes.get(id); return b ? b.style : {}; }

/** Grava um estilo em todos os tópicos selecionados, como uma única ação desfazível. */
function ctxApply(style) {
  if (!map) return;
  const ids = targets();
  if (!ids.length) return;
  change(() => map.updateMany(ids, { style }));
}

function ctxHide() {
  ctxLevels.slice(1).forEach((el) => el.remove());
  ctxLevels = [];
  ctxEl.hidden = true; ctxEl.textContent = '';
}

/** Duplica o tópico (com a subárvore) logo depois dele, como um novo irmão. Uma ação desfazível. */
function ctxDuplicate(id) {
  if (!map) return;
  const r = map.find(id);
  if (!r || !r.parent) return setStatus('A raiz não pode ser duplicada.');
  const copy = MindMap.cloneSubtree(r.node);
  change(() => map.addSubtree(r.parent.id, copy, r.parent.children.indexOf(r.node) + 1));
  setStatus('Tópico duplicado. Ctrl+Z desfaz.');
}

/** Árvore do menu do tópico `id`: cada grupo tem `children`; cada ação tem `run`. */
function ctxTree(id) {
  if (!map) return [];
  const st = ctxStyle(id);
  const own = (map.find(id) || {}).node || {};
  const ids = () => targets();
  const align = own.style && own.style.align ? own.style.align : 'auto';
  const font = own.style && own.style.font ? own.style.font : '';
  const shape = own.style && own.style.shape ? own.style.shape : '';
  const size = Math.round(st.size || 16);
  const marks = own.markers || [];
  const hasKids = own.children && own.children.length > 0;
  return [
    { label: 'Texto', children: [
      { label: 'Alinhar', children: CTX_ALIGNS.map(([v, l]) => ({ label: l, checked: align === v, run: () => ctxApply({ align: v }) })) },
      { label: 'Fonte', children: CTX_FONTS.map(([v, l]) => ({ label: l, checked: font === v, run: () => ctxApply({ font: v || undefined }) })) },
      { label: 'Aumentar', hint: size + ' pt', run: () => ctxApply({ size: Math.min(96, size + 2) }) },
      { label: 'Diminuir', run: () => ctxApply({ size: Math.max(6, size - 2) }) },
      { label: 'Negrito', checked: !!st.bold, run: () => ctxApply({ bold: !st.bold }) },
      { label: 'Itálico', checked: !!st.italic, run: () => ctxApply({ italic: !st.italic }) },
      { label: 'Cor do texto', color: true, value: /^#[0-9a-f]{6}$/i.test(st.color || '') ? st.color : '#ffffff', onColor: (c) => ctxApply({ color: c }) },
    ] },
    { label: 'Forma', children: CTX_SHAPES.map(([v, l]) => ({ label: l, checked: shape === v, run: () => ctxApply({ shape: v || undefined }) })) },
    { label: 'Marcadores', children: Object.entries(MARKERS).map(([k, m]) => ({
      label: m.label, checked: marks.includes(k), run: () => change(() => map.toggleMarkerMany(ids(), k)) })) },
    { label: 'Progresso', children: CTX_PROGRESS.map(([v, l]) => ({ label: l, checked: (own.progress ?? null) === v, run: () => change(() => map.updateMany(ids(), { progress: v })) })) },
    { label: 'Estrutura', children: [
      { label: 'Novo tópico filho', hint: 'Tab', run: () => act.child() },
      { label: 'Novo tópico irmão', hint: 'Enter', run: () => act.sibling() },
      { label: 'Novo tópico flutuante', run: () => act.addFloating() },
      { label: 'Duplicar', run: () => ctxDuplicate(id) },
      { label: 'Subir', hint: 'Alt+↑', run: () => act.moveUp() },
      { label: 'Descer', hint: 'Alt+↓', run: () => act.moveDown() },
      { label: own.collapsed ? 'Expandir ramo' : 'Recolher ramo', hint: 'Espaço', disabled: !hasKids, run: () => act.toggle() },
    ] },
    { label: 'Nota e ligações', children: [
      { label: own.notes ? 'Editar nota' : 'Adicionar nota', hint: 'N', run: () => openNotesFor(id) },
      { label: 'Gerar nota com IA', run: () => { showPanel('ai'); const b = document.getElementById('aiNotes'); if (b) b.click(); } },
      { label: 'Seta de relação', hint: 'R', run: () => act.relate() },
      { label: 'Ver conexões', run: () => showPanel('links') },
    ] },
    { sep: true },
    { label: 'Copiar', hint: 'Ctrl+C', run: () => editCommand('copy') },
    { label: 'Colar', hint: 'Ctrl+V', run: () => editCommand('paste') },
    { label: 'Renomear', hint: 'F2', run: () => startEdit() },
    { label: 'Excluir', hint: 'Del', danger: true, run: () => act.delete() },
  ];
}

/** Uma lista de um nível. Grupos (com `children`) abrem o submenu; ações executam e fecham tudo. */
function ctxList(items, depth) {
  const box = document.createElement('div');
  box.className = 'ctx-list'; box.setAttribute('role', 'menu');
  for (const it of items) {
    if (it.sep) { const s = document.createElement('div'); s.className = 'ctx-sep'; s.setAttribute('role', 'separator'); box.append(s); continue; }
    if (it.color) { box.append(ctxColorRow(it)); continue; }
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'ctx-item' + (it.danger ? ' danger' : '') + (it.children ? ' has-sub' : '');
    b.setAttribute('role', it.children ? 'menuitem' : 'menuitemradio');
    b.setAttribute('aria-haspopup', it.children ? 'menu' : 'false');
    b.setAttribute('aria-checked', it.checked === undefined ? 'false' : String(!!it.checked));
    b.disabled = !!it.disabled;
    const mark = document.createElement('span'); mark.className = 'ctx-mark'; mark.textContent = it.checked ? '✓' : '';
    const txt = document.createElement('span'); txt.className = 'ctx-label'; txt.textContent = it.label;
    b.append(mark, txt);
    if (it.hint) { const h = document.createElement('span'); h.className = 'ctx-hint'; h.textContent = it.hint; b.append(h); }
    if (it.children) {
      const arrow = document.createElement('span'); arrow.className = 'ctx-arrow'; arrow.textContent = '›'; arrow.setAttribute('aria-hidden', 'true'); b.append(arrow);
      b.onmouseenter = () => ctxOpenSub(b, it.children, depth);
      b.onclick = (e) => { e.stopPropagation(); ctxOpenSub(b, it.children, depth); };   // toque: abre o submenu
    } else {
      b.onmouseenter = () => ctxCloseFrom(depth + 1);
      b.onclick = (e) => { e.stopPropagation(); if (it.run) { ctxHide(); it.run(); } };
    }
    box.append(b);
  }
  return box;
}

/** Linha de cor: o seletor de cor fica dentro do menu e aplica ao mudar. */
function ctxColorRow(it) {
  const row = document.createElement('label'); row.className = 'ctx-item ctx-color';
  const txt = document.createElement('span'); txt.className = 'ctx-label'; txt.textContent = it.label;
  const input = document.createElement('input'); input.type = 'color'; input.value = it.value; input.setAttribute('aria-label', it.label);
  input.oninput = () => it.onColor(input.value);
  row.append(txt, input);
  return row;
}

/** Posiciona um painel ao lado de uma âncora, do lado que couber na tela. */
function ctxPlace(panel, anchorRect) {
  const w = panel.offsetWidth, h = panel.offsetHeight;
  let x = anchorRect.right + 2;
  if (x + w > window.innerWidth - 8) x = anchorRect.left - w - 2;
  const y = Math.max(8, Math.min(anchorRect.top - 4, window.innerHeight - h - 8));
  panel.style.left = Math.max(8, x) + 'px';
  panel.style.top = y + 'px';
}

/** Abre o submenu `items` ao lado do grupo `anchor`, fechando qualquer submenu mais profundo. */
function ctxOpenSub(anchor, items, depth) {
  ctxCloseFrom(depth + 1);
  for (const b of ctxLevels[depth].querySelectorAll('.ctx-item')) b.setAttribute('aria-expanded', b === anchor ? 'true' : 'false');
  const panel = document.createElement('div');
  panel.className = 'ctx-menu ctx-menu-sub'; panel.setAttribute('role', 'menu');
  panel.append(ctxList(items, depth + 1));
  document.body.append(panel);
  ctxLevels.push(panel);
  ctxPlace(panel, anchor.getBoundingClientRect());
  const first = panel.querySelector('.ctx-item:not(:disabled)'); if (first) first.focus();
}

/** Fecha os níveis a partir de `depth` (inclusive) para baixo. O menu principal (#ctxMenu) nunca é removido aqui. */
function ctxCloseFrom(depth) {
  while (ctxLevels.length > depth && ctxLevels.length > 1) { const el = ctxLevels.pop(); el.remove(); }
}

/** Abre o menu junto do ponto (coordenadas da janela), sem sair da janela. */
function ctxOpen(x, y, id) {
  if (!ctxSelect(id)) return;
  ctxHide();
  const title = document.createElement('div'); title.className = 'ctx-title'; title.textContent = 'Tópico';
  ctxEl.append(title, ctxList(ctxTree(id), 0));
  ctxEl.hidden = false;
  ctxLevels = [ctxEl];
  ctxEl.style.left = Math.max(8, Math.min(x, window.innerWidth - ctxEl.offsetWidth - 8)) + 'px';
  ctxEl.style.top = Math.max(8, Math.min(y, window.innerHeight - ctxEl.offsetHeight - 8)) + 'px';
  const first = ctxEl.querySelector('.ctx-item:not(:disabled)'); if (first) first.focus();
}

/** Garante que o tópico clicado é o que está selecionado (um clique direito fora da seleção troca a seleção). */
function ctxSelect(id) {
  if (!map.find(id)) return false;
  if (!selIds.has(id)) { selIds = new Set([id]); selectedId = id; selectedRel = null; render(); }
  return true;
}

/** Setas: ↓/↑ percorrem o nível atual, → abre o submenu, ← volta ao nível de cima, Enter executa. */
function ctxKeys(e) {
  const level = ctxLevels[ctxLevels.length - 1];
  const items = [...level.querySelectorAll('.ctx-item:not(:disabled)')];
  const at = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[(at + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus(); }
  else if (e.key === 'ArrowRight' && items[at] && items[at].classList.contains('has-sub')) { e.preventDefault(); items[at].click(); }
  else if (e.key === 'ArrowLeft' && ctxLevels.length > 1) {
    e.preventDefault(); ctxCloseFrom(ctxLevels.length - 1);
    ctxLevels[ctxLevels.length - 1].querySelector('.ctx-item.has-sub[aria-expanded="true"]')?.focus();
  }
  else if (e.key === 'Enter' && items[at]) { e.preventDefault(); items[at].click(); }
}

svg.addEventListener('contextmenu', (e) => {
  const n = nodeAt(e.target);
  e.preventDefault();
  if (!n) return ctxHide();
  ctxOpen(e.clientX, e.clientY, n.dataset.id);
});
// tecla de menu (ou Shift+F10) com um tópico selecionado: abre junto dele
window.addEventListener('keydown', (e) => {
  if (!ctxEl.hidden) return ctxKeys(e);
  if (!(e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey))) return;
  if (!selectedId || (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))) return;
  e.preventDefault();
  const el = svg.querySelector(`[data-id="${selectedId}"] rect`);
  const r = el ? el.getBoundingClientRect() : { left: 80, bottom: 80 };
  ctxOpen(r.left, r.bottom, selectedId);
});
// fecha ao clicar fora (de qualquer nível); Esc fecha um nível por vez; redimensionar fecha tudo
window.addEventListener('mousedown', (e) => { if (!ctxEl.hidden && !ctxLevels.some((el) => el.contains(e.target))) ctxHide(); }, true);
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || ctxEl.hidden) return;
  e.stopPropagation();
  if (ctxLevels.length > 1) ctxCloseFrom(ctxLevels.length - 1); else ctxHide();
}, true);
window.addEventListener('resize', () => ctxHide());
