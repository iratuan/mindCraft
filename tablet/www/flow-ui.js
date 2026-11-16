'use strict';
/* Fluxograma: visão própria (SVG) para documentos do tipo fluxo (core/flow.js, core/flow-layout.js).
   Usa as globais de renderer.js (map, selectedId, selIds, selectedRel, change, render, setStatus, dirty, rev, filePath,
   beginTab, commitNotes, syncChrome, autosaveTick, ipcRenderer, $, path, core). Carregado depois de renderer.js.
   O mapa mental não muda: render() só desvia para cá quando o documento é um fluxo. Tudo que o usuário escreve passa
   pelo escape de HTML antes de virar SVG. */

const flowRules = require(path.join(core, 'flow'));
const { layoutFlow } = require(path.join(core, 'flow-layout'));
const { escapeHtml: flowEsc } = require(path.join(core, 'text'));

let flowOn = false;                 // a visão de fluxo está na tela?
let flowView = { x: 40, y: 40, k: 1 };
let flowFitPending = true;          // ajusta à tela na primeira vez que o fluxo aparece
let flowLast = null;                // última layout (para cliques, ajuste e edição no lugar)
let flowInfoOpen = false;           // painel de caminhos e avisos
const flowTouches = new Map();      // dedos sobre o fundo do fluxo (pinça e arrasto)
let flowGesture = null;
let flowDrag = null;
let flowLinkMode = false;           // modo de ligação ativa?
let flowLinkFrom = null;            // id do passo de origem ao ligar

const flowPaneEl = () => document.getElementById('flowpane');
const flowSvgEl = () => document.getElementById('flowSvg');
const flowGroupEl = () => document.getElementById('flowView');
const flowIsOn = () => flowOn;

/** Liga/desliga a visão de fluxo: o desenho do mapa some e o fluxo aparece no mesmo lugar. */
function flowMode(on) {
  if (flowOn === on) return;
  flowOn = on;
  const p = flowPaneEl(); if (p) p.hidden = !on;
  if (typeof svg !== 'undefined') svg.style.display = on ? 'none' : '';
  const nb = document.getElementById('nodebar'); if (nb && on) nb.hidden = true;   // a barra do tópico do mapa não aparece sobre o fluxo
  if (on) flowFitPending = true;
}

/** Barra de status, título e painel de notas: o mesmo que o mapa mostra depois de desenhar. */
function flowTail(sel) {
  document.title = `${dirty ? '• ' : ''}${map.root.title} — BRANIAC`;
  let count = 0; map.walk(() => count++);
  setStatus(`Fluxo · ${count} passo(s) · ${filePath ? path.basename(filePath) : 'sem arquivo'}`);
  ipcRenderer.send('dirty', dirty);
  syncChrome(sel);
  autosaveTick();
  window.dispatchEvent(new Event('mc:render'));
}

/** Desenha o fluxo: ligações da sequência, setas extras por cima e os passos. */
function flowRender() {
  if (!flowPaneEl() || !flowGroupEl()) return;
  if (selectedId && !map.find(selectedId)) { selectedId = map.root.id; selIds = new Set([selectedId]); }
  flowLast = layoutFlow(map);
  const L = flowLast, parts = [];
  for (const e of L.edges) parts.push(flowEdgeSvg(L.boxes.get(e.from), L.boxes.get(e.to), e.label));
  for (const r of L.relations) parts.push(flowRelSvg(L.boxes.get(r.from), L.boxes.get(r.to), r.label, r.id === selectedRel, r.id));
  for (const b of L.boxes.values()) parts.push(flowBoxSvg(b, b.id === selectedId || selIds.has(b.id)));
  flowGroupEl().innerHTML = parts.join('');
  if (flowFitPending && L.boxes.size) { flowFitPending = false; flowFit(); }
  else flowApplyView();
  flowInfoRefresh();
}

function flowApplyView() {
  const g = flowGroupEl();
  if (g) g.setAttribute('transform', `translate(${flowView.x} ${flowView.y}) scale(${flowView.k})`);
}

/** Ajusta o fluxo inteiro à área visível (também é o botão "Ajustar"). */
function flowFit() {
  if (!flowLast || !flowLast.boxes.size || !flowSvgEl()) return;
  const r = flowSvgEl().getBoundingClientRect();
  if (!r.width || !r.height) return;
  const pad = 40, b = flowLast.bounds;
  const k = Math.min(1.2, Math.max(0.2, Math.min((r.width - pad * 2) / Math.max(1, b.w), (r.height - pad * 2) / Math.max(1, b.h))));
  flowView = { k, x: (r.width - b.w * k) / 2 - b.x * k, y: (r.height - b.h * k) / 2 - b.y * k };
  flowApplyView();
}

/** Forma e texto de um passo. Início e fim em pílula, decisão em losango, passo em retângulo arredondado. */
function flowBoxSvg(b, selected) {
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  let shape;
  if (b.type === 'decision') shape = `<polygon points="${cx},${b.y} ${b.x + b.w},${cy} ${cx},${b.y + b.h} ${b.x},${cy}"/>`;
  else if (b.type === 'start' || b.type === 'end') shape = `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.h / 2}"/>`;
  else shape = `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="10"/>`;
  const top = cy - ((b.lines.length - 1) * b.lineHeight) / 2;
  const texts = b.lines.map((l, i) => `<text x="${cx}" y="${top + i * b.lineHeight}" text-anchor="middle" dominant-baseline="central">${flowEsc(l)}</text>`).join('');
  const isSrc = flowLinkMode && flowLinkFrom === b.id;
  return `<g class="flow-node ${b.type}${selected ? ' sel' : ''}${isSrc ? ' link-src' : ''}" data-id="${flowEsc(b.id)}">${shape}${texts}</g>`;
}

/** Seta da sequência: sai de baixo do passo e entra em cima do próximo; o rótulo do ramo fica no meio. */
function flowEdgeSvg(a, b, label) {
  const x1 = a.x + a.w / 2, y1 = a.y + a.h, x2 = b.x + b.w / 2, y2 = b.y;
  const my = (y1 + y2) / 2;
  const lab = label ? flowLabelSvg((x1 + x2) / 2, my, label) : '';
  return `<path class="flow-edge" d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}" marker-end="url(#flowArrow)"/>${lab}`;
}

/** Seta extra (relação do modelo): curva tracejada pela direita, para voltas e junções sem empurrar os passos. */
function flowRelSvg(a, b, label, selected, relId) {
  const x1 = a.x + a.w, y1 = a.y + a.h / 2, x2 = b.x + b.w, y2 = b.y + b.h / 2;
  const cx = Math.max(x1, x2) + 90;
  const lab = label ? flowLabelSvg(cx - 4, (y1 + y2) / 2, label) : '';
  const dataId = relId ? ` data-id="${flowEsc(relId)}"` : '';
  return `<g class="flow-rel${selected ? ' sel' : ''}"${dataId}><path d="M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}" marker-end="url(#flowArrow)"/>${lab}</g>`;
}

function flowLabelSvg(x, y, text) {
  const w = textWidth(text, 12, false) + 12;
  return `<g class="flow-label"><rect x="${x - w / 2}" y="${y - 10}" width="${w}" height="20" rx="6"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${flowEsc(text)}</text></g>`;
}

/** Seleciona um passo (ou o fundo, com null) e redesenha. Mantém o painel de notas no passo escolhido. */
function flowSelect(id) {
  selectedId = id || map.root.id;
  selIds = new Set([selectedId]);
  selectedRel = null;
  flowLinkFrom = null;  // cancela ligação se estava em modo de ligação
  render();
}

/** Executa uma ação de fluxo com as regras do core. Erros de regra viram aviso na barra de status, nunca travam. */
function flowAct(action, arg) {
  const sel = selectedId && map.find(selectedId) ? selectedId : map.root.id;
  const node = map.find(sel).node;
  try {
    if (action === 'step') {
      if (flowRules.typeOf(node) === 'decision') {
        const used = node.children.map((c) => (c.branchLabel || '').toLowerCase());
        const free = flowRules.DEFAULT_BRANCHES.find((t) => !used.includes(t.toLowerCase()));
        if (!free) return setStatus('Esta decisão já tem os dois ramos. Selecione um passo de ramo para continuar a partir dele.');
        const n = change(() => flowRules.addBranch(map, sel, free, { type: 'step' }));
        if (n) flowSelect(n.id);
        return;
      }
      const n = change(() => flowRules.insertStepAfter(map, sel, { type: arg || 'step' }));
      if (n) flowSelect(n.id);
    } else if (action === 'branch') {
      if (flowRules.typeOf(node) !== 'decision') return setStatus('Ramos existem só em decisões: selecione uma decisão e tente de novo.');
      const used = node.children.map((c) => (c.branchLabel || '').toLowerCase());
      const free = flowRules.DEFAULT_BRANCHES.find((t) => !used.includes(t.toLowerCase())) || `Ramo ${node.children.length + 1}`;
      const n = change(() => flowRules.addBranch(map, sel, free, { type: 'step' }));
      if (n) flowSelect(n.id);
    } else if (action === 'type') {
      change(() => flowRules.setFlowType(map, sel, arg));
    } else if (action === 'delete') {
      flowDelete(sel);
    } else if (action === 'link') {
      flowToggleLinkMode();
    }
  } catch (e) {
    setStatus(e.message);
  }
}

/** Remove uma seta extra (relação) entre dois passos. */
async function flowDeleteRelation() {
  if (!selectedRel) return;
  const rel = map.meta.relations.find((r) => r.id === selectedRel);
  if (!rel) return;
  const fromNode = map.find(rel.from);
  const toNode = map.find(rel.to);
  if (!fromNode || !toNode) return;
  try {
    change(() => flowRules.disconnect(map, rel.from, rel.to));
    flowSelect(map.root.id);
    setStatus(`Seta removida de "${fromNode.node.title}" para "${toNode.node.title}".`);
  } catch (e) {
    setStatus(e.message);
  }
}

/** Exclui um passo. Com subfluxo (decisão ou vários próximos), pede confirmação porque sai junto. */
async function flowDelete(id) {
  const r = map.find(id);
  if (!r || !r.parent) return setStatus('O início do fluxo não pode ser excluído.');
  const node = r.node, t = flowRules.typeOf(node);
  const sub = node.children.length > 1 || t === 'decision';
  if (sub || (node.notes || '').trim()) {
    const count = []; map.walk((x) => count.push(x), node);
    const detail = sub ? `${count.length - 1} passo(s) depois dele também saem.` : 'As notas deste passo também saem.';
    const c = await ipcRenderer.invoke('dialog:confirm', { message: `Excluir "${node.title || 'passo'}"?`, detail, buttons: ['Excluir', 'Cancelar'] });
    if (c !== 0) return;
  }
  try {
    const parentId = r.parent.id;
    change(() => flowRules.removeStep(map, id));
    flowSelect(map.find(parentId) ? parentId : map.root.id);
  } catch (e) { setStatus(e.message); }
}

/** Edição do título no próprio passo (duplo clique ou F2), ou rótulo de uma seta extra. Enter grava; Esc cancela. */
function flowRename(id, relId) {
  const pane = flowPaneEl();
  if (!pane) return;
  const old = pane.querySelector('#flowEdit'); if (old) old.remove();
  const sr = flowSvgEl().getBoundingClientRect(), pr = pane.getBoundingClientRect();

  let text, x, y, w;
  if (relId) {
    // Editar rótulo de uma seta: tenta usar a posição do rótulo no layout
    const rel = map.meta.relations.find((r) => r.id === relId);
    if (!rel) return;
    text = rel.label || '';
    // posição aproximada: centro da tela
    x = sr.left - pr.left + sr.width / 2;
    y = sr.top - pr.top + sr.height / 2;
    w = 200;
  } else {
    // Editar título de um passo
    const b = flowLast && flowLast.boxes.get(id);
    if (!b) return;
    text = map.find(id) ? map.find(id).node.title || '' : '';
    x = sr.left - pr.left + flowView.x + b.x * flowView.k;
    y = sr.top - pr.top + flowView.y + b.y * flowView.k;
    w = Math.max(120, b.w * flowView.k);
  }

  const inp = document.createElement('input');
  inp.id = 'flowEdit'; inp.className = 'flow-edit'; inp.value = text;
  inp.style.left = `${x}px`;
  inp.style.top = `${y}px`;
  inp.style.width = `${w}px`;
  pane.append(inp);
  inp.focus(); inp.select();
  let done = false;
  const finish = (save) => {
    if (done) return; done = true;
    const v = inp.value.trim();
    inp.remove();
    if (save && v !== text) {
      if (relId) {
        const rel = map.meta.relations.find((r) => r.id === relId);
        if (rel) change(() => rel.label = v.slice(0, 60));
      } else if (map.find(id) && v !== map.find(id).node.title) {
        change(() => map.update(id, { title: v.slice(0, 120) }));
      }
    }
    render();
  };
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); finish(true); } else if (e.key === 'Escape') { e.preventDefault(); finish(false); } e.stopPropagation(); });
  inp.addEventListener('blur', () => finish(true));
}

/** Painel de avisos e caminhos, e a linha de contagem. Clicar num aviso seleciona o passo. */
function flowInfoRefresh() {
  const info = document.getElementById('flowInfo');
  const count = document.getElementById('flowCount');
  const warn = flowRules.validateFlow(map);
  const { paths, truncated } = flowRules.listPaths(map);
  if (count) count.textContent = `${paths.length}${truncated ? '+' : ''} caminho(s) · ${warn.length} aviso(s)`;
  const typeSel = document.getElementById('flowType');
  if (typeSel && selectedId && map.find(selectedId)) typeSel.value = flowRules.typeOf(map.find(selectedId).node);
  if (!info || !flowInfoOpen) return;
  const names = new Map(); map.walk((n) => names.set(n.id, n.title || 'Sem título'));
  const warnHtml = warn.length
    ? warn.map((w) => `<li class="${w.level}">${w.id ? `<button type="button" data-flow-sel="${flowEsc(w.id)}">${flowEsc(w.message)}</button>` : flowEsc(w.message)}</li>`).join('')
    : '<li class="ok">Nenhum aviso: o fluxo segue as regras.</li>';
  const pathHtml = paths.length
    ? paths.map((p, i) => `<li>${flowEsc(p.map((s, k) => {
      const nm = names.get(s.id) || '(passo removido)';
      if (k === 0) return nm;
      return `${s.via ? `—(${s.via})→` : '→'} ${nm}${s.loopTo ? ' ↺' : ''}`;
    }).join(' '))}</li>`).join('')
    : '<li class="ok">Nenhum caminho do início ao fim.</li>';
  info.innerHTML = `<h3>Avisos</h3><ul>${warnHtml}</ul><h3>Caminhos possíveis${truncated ? ' (lista cortada)' : ''}</h3><ol>${pathHtml}</ol>`;
  info.hidden = false;
}

/** Cria um fluxo novo numa aba nova (ou na aba atual, se ela estiver vazia). */
function newFlow() {
  commitNotes();
  beginTab(true);
  map = flowRules.createFlow('Fluxograma');
  filePath = null; dirty = false; hits = null; relateFrom = null; notesOwner = null;
  selectedId = map.root.id; selIds = new Set([selectedId]); selectedRel = null;
  rev++;
  if (typeof closeHome === 'function') closeHome();
  flowFitPending = true;
  render();
}

/** Ativa/desativa o modo de ligação (ligar passos com seta extra). */
function flowToggleLinkMode() {
  flowLinkMode = !flowLinkMode;
  flowLinkFrom = null;
  const pane = flowPaneEl();
  if (pane) pane.classList.toggle('link-mode', flowLinkMode);
  if (flowLinkMode) setStatus('Modo ligar ativo: Alt+clique no passo de saída, depois Alt+clique no passo de entrada.');
  else setStatus('Modo ligar desativado.');
  flowRender();
}

/** Completa ou inicia uma ligação entre passos (com Alt+clique). */
function flowLinkNode(id) {
  if (!flowLinkMode) return;
  if (!flowLinkFrom) {
    flowLinkFrom = id;
    flowRender();  // redesenha para destacar o nó de origem
  } else {
    // ligação: origem → destino
    if (flowLinkFrom === id) {
      setStatus('Não é possível ligar um passo para si mesmo.');
      flowLinkFrom = null;
    } else {
      try {
        flowRules.connect(map, flowLinkFrom, id, '');
        dirty = true;
        rev++;
        change(() => render());
        setStatus(`Seta criada de "${map.find(flowLinkFrom).node.title}" para "${map.find(id).node.title}".`);
        flowLinkFrom = null;
      } catch (err) {
        setStatus(`Erro ao ligar: ${err.message}`);
        flowLinkFrom = null;
      }
    }
    flowRender();
  }
}

/** Teclado do fluxo: Enter passo, Tab ramo, Delete excluir, F2 renomear, Esc limpa. Devolve true se tratou a tecla. */
function flowKey(e) {
  if (!flowOn) return false;
  if (!$('#modal').hidden || (window.MCReact && window.MCReact.homeIsOpen())) return false;
  if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return false;
  if (e.ctrlKey || e.metaKey || e.altKey) return false;   // Ctrl+Z, Ctrl+S etc. continuam globais
  const id = selectedId && map.find(selectedId) ? selectedId : null;
  switch (e.key) {
    case 'Enter': flowAct('step'); break;
    case 'Tab': e.preventDefault(); flowAct('branch'); return true;
    case 'Delete': case 'Backspace':
      if (selectedRel) flowDeleteRelation();
      else if (id) flowDelete(id);
      break;
    case 'F2': if (id || selectedRel) flowRename(id, selectedRel); break;
    case 'Escape': flowLinkMode ? flowToggleLinkMode() : flowSelect(map.root.id); break;
    default: return false;
  }
  e.preventDefault();
  return true;
}

/** Zoom com a roda do mouse, no ponto do cursor. */
function flowZoomAt(cx, cy, factor) {
  const k = Math.min(3, Math.max(0.2, flowView.k * factor));
  flowView = { k, x: cx - ((cx - flowView.x) / flowView.k) * k, y: cy - ((cy - flowView.y) / flowView.k) * k };
  flowApplyView();
}

function flowPoint(e) { const r = flowSvgEl().getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

function flowPinchState() {
  const [a, b] = [...flowTouches.values()];
  return { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, k: flowView.k, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
}

/** Ligação dos eventos do fluxo: arrastar o fundo (mouse ou um dedo), pinça (dois dedos), roda, clique, duplo clique. */
function flowBind() {
  const S = flowSvgEl();
  if (!S || S.dataset.bound) return;
  S.dataset.bound = '1';
  S.addEventListener('pointerdown', (e) => {
    const onNode = e.target.closest && e.target.closest('.flow-node');
    if (e.pointerType === 'touch') {
      flowTouches.set(e.pointerId, flowPoint(e));
      try { S.setPointerCapture(e.pointerId); } catch { /* sem captura o gesto segue pelos eventos do fluxo */ }
      flowGesture = flowTouches.size === 2 ? flowPinchState() : null;
      if (flowTouches.size === 1 && !onNode) flowDrag = { sx: e.clientX, sy: e.clientY, ox: flowView.x, oy: flowView.y, moved: false };
      return;
    }
    if (e.button !== 0 || onNode) return;
    flowDrag = { sx: e.clientX, sy: e.clientY, ox: flowView.x, oy: flowView.y, moved: false };
  });
  S.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' && flowTouches.has(e.pointerId)) {
      flowTouches.set(e.pointerId, flowPoint(e));
      if (flowTouches.size === 2 && flowGesture) {
        const st = flowPinchState();
        const k = Math.min(3, Math.max(0.2, flowGesture.k * st.dist / flowGesture.dist));
        flowView = { k, x: st.mid.x - ((st.mid.x - flowView.x) / flowView.k) * k, y: st.mid.y - ((st.mid.y - flowView.y) / flowView.k) * k };
        flowApplyView();
        return;
      }
      if (flowTouches.size === 1 && flowDrag) { flowView.x = flowDrag.ox + (e.clientX - flowDrag.sx); flowView.y = flowDrag.oy + (e.clientY - flowDrag.sy); flowApplyView(); flowDrag.moved = true; }
      return;
    }
    if (!flowDrag) return;
    const dx = e.clientX - flowDrag.sx, dy = e.clientY - flowDrag.sy;
    if (!flowDrag.moved && Math.hypot(dx, dy) < 4) return;
    flowDrag.moved = true;
    flowView.x = flowDrag.ox + dx; flowView.y = flowDrag.oy + dy;
    flowApplyView();
  });
  const up = (e) => {
    if (e.pointerType === 'touch') {
      flowTouches.delete(e.pointerId);
      flowGesture = flowTouches.size === 2 ? flowPinchState() : null;
      if (flowTouches.size === 0) flowDrag = null;
      return;
    }
    flowDrag = null;
  };
  S.addEventListener('pointerup', up);
  S.addEventListener('pointercancel', up);
  S.addEventListener('click', (e) => {
    if (flowDrag && flowDrag.moved) return;
    const nd = e.target.closest && e.target.closest('.flow-node');
    const rel = e.target.closest && e.target.closest('.flow-rel');
    if (nd) {
      // Alt+clique em um nó: inicia/completa ligação
      if (e.altKey && flowLinkMode) {
        flowLinkNode(nd.dataset.id);
        e.preventDefault();
      } else {
        flowSelect(nd.dataset.id);
      }
    } else if (rel) {
      // Clique em uma seta: seleciona a relação
      const relId = rel.dataset.id;
      if (relId) {
        selectedRel = relId;
        selectedId = null;
        selIds = new Set();
        render();
      }
    } else {
      flowSelect(map.root.id);
    }
  });
  S.addEventListener('dblclick', (e) => {
    const nd = e.target.closest && e.target.closest('.flow-node');
    const rel = e.target.closest && e.target.closest('.flow-rel');
    if (nd) flowRename(nd.dataset.id);
    else if (rel) flowRename(null, rel.dataset.id);
  });
  S.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = flowPoint(e);
    flowZoomAt(p.x, p.y, e.deltaY < 0 ? 1.15 : 1 / 1.15);
  }, { passive: false });
}

/** Barra de ações do fluxo: os botões e a lista de tipos. Carregado uma vez. */
function flowBindBar() {
  const bar = document.querySelector('#flowpane .flow-bar');
  if (!bar || bar.dataset.bound) return;
  bar.dataset.bound = '1';
  bar.addEventListener('click', (e) => {
    const b = e.target.closest('[data-flow]');
    if (!b) return;
    const a = b.dataset.flow;
    if (a === 'fit' || a === 'organize') { flowFit(); if (a === 'organize') setStatus('Fluxo ajustado à tela.'); }
    else if (a === 'info') { flowInfoOpen = !flowInfoOpen; flowInfoRefresh(); const i = document.getElementById('flowInfo'); if (i) i.hidden = !flowInfoOpen; }
    else if (a === 'delete') flowAct('delete');
    else if (a === 'link') flowAct('link');
    else if (a === 'branch') flowAct('branch');
    else flowAct('step', a);
  });
  const typeSel = document.getElementById('flowType');
  if (typeSel) typeSel.addEventListener('change', () => flowAct('type', typeSel.value));
  const info = document.getElementById('flowInfo');
  if (info) info.addEventListener('click', (e) => {
    const b = e.target.closest('[data-flow-sel]');
    if (b) flowSelect(b.dataset.flowSel);
  });
  flowBind();
}
flowBindBar();

// ações no menu e na barra lateral (o mapa mental continua usando as suas)
act.newFlow = () => newFlow();
