'use strict';
const { classifyStroke } = require(path.join(core, 'shapes'));   // reconhecimento de traço da caneta (core/shapes.js)
/* Lousa de resolução: uma folha quadriculada para escrever e resolver exercícios com a caneta (ou mouse). Abre ao lado do PDF.
   Ferramentas com ícones planos na cor do tema da interface: caneta, marca-texto, borracha, cores, espessuras, desfazer,
   refazer, páginas e limpar página. O traço é suavizado por curvas que passam pelos pontos médios (sem cantos duros).
   Camadas: papel quadriculado (ao fundo, sempre) · traços terminados (fundo transparente; a borracha apaga de verdade) ·
   traço em andamento. Cada lousa é salva como PNG separado (nunca dentro do mapa), já com o quadriculado.
   Toque com o dedo não desenha (a mão apoiada não risca a folha). */

const BOARD = {
  tools: [['pen', 'Caneta'], ['highlighter', 'Marca-texto'], ['eraser', 'Borracha'], ['line', 'Reta'], ['rect', 'Quadrado'], ['ellipse', 'Círculo']],
  colors: ['#111111', '#1e63c6', '#d32f2f', '#2e7d32', '#f5a623'],
  widths: [2, 4, 8],
};
// quadriculado de referência: 24 px por quadrado (em pixels da tela), uma linha mais forte a cada 5 quadrados
const GRID = { step: 24, major: 5, paper: '#fbfbf7', minor: 'rgba(90, 130, 180, 0.22)', strong: 'rgba(90, 130, 180, 0.42)' };
// formas: guardadas como dois pontos (início e fim); Shift força 45° na reta e proporção 1:1 no quadrado e no círculo
const SHAPE = new Set(['line', 'rect', 'ellipse']);
// zoom da folha: a resolução acompanha o zoom (traço nítido), e as coordenadas continuam em unidades da folha a 100%
const BOARD_ZOOM = { min: 0.5, max: 3, step: 1.25 };
const boardState = { pages: [{ strokes: [], redo: [] }], page: 0, tool: 'pen', color: '#111111', width: 2, drawing: null, straighten: true, zoom: 1 };
let boardCanvas = null, boardCtx = null, boardBase = null, boardBaseCtx = null, boardPaper = null, boardDpr = 1;
let boardLogical = { w: 0, h: 0 };   // tamanho da folha em unidades (igual a boardSheet)
// folha: cresce para cobrir a área visível quando o zoom é menor que 100%; nunca encolhe, para nenhum traço sumir
let boardSheet = { w: 0, h: 0 };
const boardTouches = new Map();   // dedos na folha (toque): um arrasta a vista, dois fazem pinça
let boardGesture = null;          // início da pinça: distância, zoom e meio entre os dedos

const boardEl = (id) => document.getElementById(id);
const curPage = () => boardState.pages[boardState.page];

/** Traço suavizado: a curva passa pelos pontos médios entre os pontos capturados, então o desenho fica liso mesmo com a mão irregular.
    `preview` = traço em andamento (a borracha aparece cinza até soltar; ao soltar, apaga de verdade na camada). */
function boardDrawStroke(ctx, s, preview = false) {
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (s.shape && !preview) {   // traço da caneta já reconhecido: desenha a forma limpa com a cor e a espessura do traço
    const sh = s.shape;
    ctx.strokeStyle = s.color; ctx.globalAlpha = 1; ctx.lineWidth = s.width;
    ctx.beginPath();
    if (sh.kind === 'line') { ctx.moveTo(sh.pts[0].x, sh.pts[0].y); ctx.lineTo(sh.pts[1].x, sh.pts[1].y); }
    else if (sh.kind === 'poly') { ctx.moveTo(sh.pts[0].x, sh.pts[0].y); for (const v of sh.pts.slice(1)) ctx.lineTo(v.x, v.y); }
    else if (sh.kind === 'rect') ctx.rect(sh.x, sh.y, sh.w, sh.h);
    else ctx.ellipse(sh.cx, sh.cy, sh.rx, sh.ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const hl = s.tool === 'highlighter', er = s.tool === 'eraser';
  if (er && !preview) ctx.globalCompositeOperation = 'destination-out';   // apaga o que já está na camada de traços
  ctx.strokeStyle = er ? (preview ? 'rgba(60, 60, 60, 0.45)' : '#000') : s.color;
  ctx.fillStyle = ctx.strokeStyle;
  ctx.globalAlpha = hl ? 0.35 : 1;
  ctx.lineWidth = er ? s.width * 4 : hl ? s.width * 3 : s.width;
  const p = s.pts;
  if (SHAPE.has(s.tool)) {
    if (p.length < 2) { ctx.restore(); return; }
    const a = p[0], b = p[p.length - 1];
    ctx.beginPath();
    if (s.tool === 'line') { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
    else if (s.tool === 'rect') ctx.rect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    else ctx.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (p.length === 1) { ctx.beginPath(); ctx.arc(p[0].x, p[0].y, ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return; }
  ctx.beginPath();
  ctx.moveTo(p[0].x, p[0].y);
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i].x + p[i + 1].x) / 2, my = (p[i].y + p[i + 1].y) / 2;
    ctx.quadraticCurveTo(p[i].x, p[i].y, mx, my);
  }
  const last = p[p.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
  ctx.restore();
}

/** Desenha o papel quadriculado (em pixels de CSS, já com a escala do dpr aplicada). */
function drawPaper(ctx, w, h) {
  ctx.fillStyle = GRID.paper;
  ctx.fillRect(0, 0, w, h);
  ctx.lineWidth = 1;
  for (let i = 0, x = 0; x <= w; i++, x += GRID.step) {
    ctx.strokeStyle = i % GRID.major === 0 ? GRID.strong : GRID.minor;
    ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, h); ctx.stroke();
  }
  for (let i = 0, y = 0; y <= h; i++, y += GRID.step) {
    ctx.strokeStyle = i % GRID.major === 0 ? GRID.strong : GRID.minor;
    ctx.beginPath(); ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(w, Math.round(y) + 0.5); ctx.stroke();
  }
}

/** Recompõe a camada dos traços terminados da página atual (ao desfazer, limpar, trocar de página e redimensionar). */
function boardRebuild() {
  if (!boardBaseCtx) return;
  boardBaseCtx.setTransform(1, 0, 0, 1, 0, 0);
  boardBaseCtx.clearRect(0, 0, boardBase.width, boardBase.height);
  boardBaseCtx.setTransform(boardDpr, 0, 0, boardDpr, 0, 0);
  for (const s of curPage().strokes) boardDrawStroke(boardBaseCtx, s);
}

/** Mostra o papel, os traços terminados e, por cima, o traço em andamento. */
function boardRedraw() {
  if (!boardCtx) return;
  boardCtx.setTransform(1, 0, 0, 1, 0, 0);
  boardCtx.drawImage(boardPaper, 0, 0);
  boardCtx.drawImage(boardBase, 0, 0);
  boardCtx.setTransform(boardDpr, 0, 0, boardDpr, 0, 0);
  if (boardState.drawing) boardDrawStroke(boardCtx, boardState.drawing, true);
  boardInfo();
}

function boardInfo() {
  const n = boardState.pages.length;
  boardEl('bdPage').textContent = `${boardState.page + 1} / ${n}`;
  boardEl('bdPrev').disabled = boardState.page === 0;
  boardEl('bdNext').disabled = boardState.page === n - 1;
  boardEl('bdUndo').disabled = curPage().strokes.length === 0;
  boardEl('bdRedo').disabled = curPage().redo.length === 0;
  boardEl('bdDelPage').disabled = n === 1;   // sempre resta pelo menos uma lousa
  boardEl('bdZoomLbl').textContent = Math.round(boardState.zoom * 100) + '%';
  boardEl('bdZoomOut').disabled = boardState.zoom <= BOARD_ZOOM.min;
  boardEl('bdZoomIn').disabled = boardState.zoom >= BOARD_ZOOM.max;
  for (const b of document.querySelectorAll('#boardpane [data-bd-tool]')) b.setAttribute('aria-pressed', String(b.dataset.bdTool === boardState.tool));
  for (const b of document.querySelectorAll('#boardpane [data-bd-color]')) b.classList.toggle('on', b.dataset.bdColor === boardState.color);
  for (const b of document.querySelectorAll('#boardpane [data-bd-width]')) b.classList.toggle('on', +b.dataset.bdWidth === boardState.width);
  const st = boardEl('bdStraight'); if (st) st.setAttribute('aria-pressed', String(boardState.straighten));
}

/** Posição de um evento dentro da folha, em pixels da tela. */
const boardPoint = (e) => {
  const r = boardCanvas.getBoundingClientRect();
  const kx = r.width ? boardLogical.w / r.width : 1, ky = r.height ? boardLogical.h / r.height : 1;   // zoom: tela -> unidades da folha
  return { x: (e.clientX - r.left) * kx, y: (e.clientY - r.top) * ky, p: e.pressure > 0 ? e.pressure : 0.5 };
};

function boardDown(e) {
  if (e.pointerType === 'touch') return;     // dedo não desenha: a mão apoiada e a rolagem continuam funcionando
  if (e.button !== undefined && e.button !== 0) return;
  try { boardCanvas.setPointerCapture(e.pointerId); } catch { /* sem captura o traço continua pelos eventos da própria folha */ }
  const pt = boardPoint(e);
  const width = boardState.tool === 'eraser' ? boardState.width : boardState.width * (e.pointerType === 'pen' ? (0.5 + pt.p) : 1);
  boardState.drawing = { tool: boardState.tool, color: boardState.color, width, pts: [pt] };
  curPage().redo = [];
  boardRedraw();
}

function boardMove(e) {
  const s = boardState.drawing;
  if (!s) return;
  // o navegador junta movimentos rápidos (caneta e mouse) num só evento: getCoalescedEvents traz todos
  const evs = typeof e.getCoalescedEvents === 'function' && e.getCoalescedEvents().length ? e.getCoalescedEvents() : [e];
  if (SHAPE.has(s.tool)) {
    const ev = evs[evs.length - 1];
    s.pts = [s.pts[0], shapeEnd(s.tool, s.pts[0], boardPoint(ev), ev.shiftKey)];
    boardRedraw();
    return;
  }
  for (const ev of evs) s.pts.push(boardPoint(ev));
  boardRedraw();
}

/** Ponto final de uma forma: com Shift, a reta vai a múltiplos de 45° e o quadrado/círculo ganha lados iguais. */
function shapeEnd(tool, a, b, shift) {
  let dx = b.x - a.x, dy = b.y - a.y;
  if (shift && tool === 'line') {
    const len = Math.hypot(dx, dy), step = Math.PI / 4, ang = Math.round(Math.atan2(dy, dx) / step) * step;
    dx = Math.cos(ang) * len; dy = Math.sin(ang) * len;
  } else if (shift) {
    const side = Math.max(Math.abs(dx), Math.abs(dy));
    dx = Math.sign(dx || 1) * side; dy = Math.sign(dy || 1) * side;
  }
  return { x: a.x + dx, y: a.y + dy, p: b.p };
}

function boardUp() {
  const s = boardState.drawing;
  if (!s) return;
  boardState.drawing = null;
  if (SHAPE.has(s.tool) && s.pts.length < 2) { boardRedraw(); return; }   // um toque sem arrastar não cria forma
  if (s.pts.length === 1) s.pts.push({ ...s.pts[0], x: s.pts[0].x + 0.01 });   // um toque vira um ponto
  // caneta: se o traço for reta, poligonal de ângulos retos ou quadrado/círculo, vira a forma limpa (uma ação desfazível)
  if (s.tool === 'pen' && boardState.straighten) { const sh = classifyStroke(s.pts); if (sh) s.shape = sh; }
  curPage().strokes.push(s);
  boardDrawStroke(boardBaseCtx, s);   // o traço terminado vai para a camada de traços (a borracha apaga aqui)
  boardRedraw();
}

function boardUndo() { const p = curPage(); const s = p.strokes.pop(); if (s) p.redo.push(s); boardRebuild(); boardRedraw(); }
function boardRedo() { const p = curPage(); const s = p.redo.pop(); if (s) p.strokes.push(s); boardRebuild(); boardRedraw(); }

async function boardClear() {
  const choice = await ipcRenderer.invoke('dialog:confirm', { message: 'Apagar tudo desta página?', detail: 'O que estiver na folha some.', buttons: ['Apagar', 'Cancelar'] });
  if (choice !== 0) return;
  curPage().strokes = []; curPage().redo = [];
  boardRebuild(); boardRedraw();
}

function boardNewPage() {
  boardState.pages.push({ strokes: [], redo: [] });
  boardState.page = boardState.pages.length - 1;
  boardRebuild(); boardRedraw();
}
function boardGo(delta) {
  const n = boardState.page + delta;
  if (n < 0 || n >= boardState.pages.length) return;
  boardState.page = n;
  boardRebuild(); boardRedraw();
}

/** Muda o zoom mantendo o centro da vista no mesmo lugar da folha. */
/** Muda o zoom mantendo fixo o ponto da tela (cx, cy) sobre a folha: a roda, a pinça e o centro dos botões usam isso. */
function boardSetZoom(target, cx, cy) {
  const z = Math.min(BOARD_ZOOM.max, Math.max(BOARD_ZOOM.min, target));
  if (Math.abs(z - boardState.zoom) < 1e-6) return;
  const wrap = boardCanvas.parentElement;
  const before = boardCanvas.getBoundingClientRect();
  const fx = (cx - before.left) / (before.width || 1), fy = (cy - before.top) / (before.height || 1);
  boardState.zoom = z;
  fitBoard();
  const after = boardCanvas.getBoundingClientRect();
  const r = wrap.getBoundingClientRect();
  wrap.scrollLeft = fx * after.width - (cx - r.left);
  wrap.scrollTop = fy * after.height - (cy - r.top);
  boardInfo();
}
/** Zoom por degrau, no centro da área visível (botões + e −, e 100%). */
function boardZoom(factor) {
  const wrap = boardCanvas.parentElement, r = wrap.getBoundingClientRect();
  boardSetZoom(boardState.zoom * factor, r.left + wrap.clientWidth / 2, r.top + wrap.clientHeight / 2);
}

/** Toque na folha: um dedo rola a vista; dois dedos fazem pinça (zoom no meio entre eles). */
function boardPinchState() {
  const [a, b] = [...boardTouches.values()];
  return { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom: boardState.zoom, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
}
function boardTouchDown(e) {
  const wrap = boardCanvas.parentElement;
  boardTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
  try { wrap.setPointerCapture(e.pointerId); } catch { /* sem captura o gesto continua pelos eventos da folha */ }
  boardGesture = boardTouches.size === 2 ? boardPinchState() : null;
}
function boardTouchMove(e) {
  const prev = boardTouches.get(e.pointerId);
  if (!prev) return;
  boardTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (boardTouches.size === 1) {
    const wrap = boardCanvas.parentElement;
    wrap.scrollLeft -= e.clientX - prev.x; wrap.scrollTop -= e.clientY - prev.y;
  } else if (boardTouches.size === 2 && boardGesture) {
    const cur = boardPinchState();
    boardSetZoom(boardGesture.zoom * cur.dist / boardGesture.dist, cur.mid.x, cur.mid.y);
  }
}
function boardTouchUp(e) {
  if (!boardTouches.delete(e.pointerId)) return;
  boardGesture = boardTouches.size === 2 ? boardPinchState() : null;
}

/** Exclui a lousa atual (com confirmação, porque apaga o desenho). A contagem diminui e a próxima lousa vira a atual. */
async function boardDeletePage() {
  if (boardState.pages.length === 1) return;
  const n = boardState.page + 1, traces = curPage().strokes.length;
  const choice = await ipcRenderer.invoke('dialog:confirm', { message: `Excluir a lousa ${n}?`, detail: traces ? `${traces} traço(s) desta lousa serão apagados.` : 'A lousa está vazia.', buttons: ['Excluir', 'Cancelar'] });
  if (choice !== 0) return;
  boardState.pages.splice(boardState.page, 1);
  boardState.page = Math.min(boardState.page, boardState.pages.length - 1);
  boardRebuild(); boardRedraw();
}

/** Converte a folha atual em PNG (bytes): papel quadriculado, traços e nada mais. */
function boardPng() {
  return new Promise((resolve, reject) => {
    const out = document.createElement('canvas');
    out.width = boardCanvas.width; out.height = boardCanvas.height;
    const ctx = out.getContext('2d');
    ctx.drawImage(boardPaper, 0, 0);
    ctx.drawImage(boardBase, 0, 0);
    out.toBlob(async (blob) => {
      if (!blob) return reject(new Error('Não foi possível gerar a imagem da folha.'));
      resolve(Buffer.from(await blob.arrayBuffer()));
    }, 'image/png');
  });
}

/** Salva a página atual como PNG no local escolhido (arquivo temporário + renomear). */
async function exportBoardTo(target) {
  const buf = await boardPng();
  const tmp = target + '.tmp-' + process.pid;
  fs.writeFileSync(tmp, buf);
  fs.renameSync(tmp, target);
  return target;
}
async function boardExport() {
  const base = (map && (map.meta.name || map.root.title)) || 'resolucao';
  const name = `${base}-pagina-${boardState.page + 1}.png`;
  const target = await ipcRenderer.invoke('dialog:save-export', 'png', name);
  if (!target) return;
  try { await exportBoardTo(target); setStatus('Página salva como PNG: ' + target); }
  catch (e) { ipcRenderer.invoke('dialog:error', 'Não foi possível salvar a imagem: ' + e.message); }
}

/** Monta a barra de ferramentas e a folha dentro de #boardpane (uma vez). */
function boardBuild() {
  const pane = boardEl('boardpane');
  if (pane.dataset.built) return;
  pane.dataset.built = '1';
  const tool = (t, l) => `<button type="button" class="bd-ico" data-bd-tool="${t}" aria-pressed="false" aria-label="${l}" title="${l}">${iconSvg(t)}</button>`;
  const ico = (id, name, l) => `<button type="button" class="bd-ico" id="${id}" aria-label="${l}" title="${l}">${iconSvg(name)}</button>`;
  pane.innerHTML = `
    <div class="bd-head"><span>Lousa de resolução</span><span>${ico('bdMax', 'maximize', 'Maximizar a lousa (ocupa a área de trabalho)')}${ico('bdClose', 'close', 'Fechar a lousa')}</span></div>
    <div class="bd-bar" role="toolbar" aria-label="Ferramentas da lousa">
      ${BOARD.tools.map(([t, l]) => tool(t, l)).join('')}
      <button type="button" class="bd-ico" id="bdStraight" aria-pressed="true" aria-label="Endireitar traços da caneta" title="Endireitar traços da caneta (reta, ângulo reto, quadrado, círculo)">${iconSvg('snap')}</button>
      <span class="bd-sep"></span>
      ${BOARD.colors.map((c) => `<button type="button" class="bd-swatch" data-bd-color="${c}" style="background:${c}" aria-label="Cor ${c}" title="Cor"></button>`).join('')}
      <span class="bd-sep"></span>
      ${BOARD.widths.map((w) => `<button type="button" class="bd-ico bd-w" data-bd-width="${w}" aria-label="Espessura ${w}" title="Espessura ${w}"><i style="height:${w}px"></i></button>`).join('')}
      <span class="bd-sep"></span>
      ${ico('bdUndo', 'undo', 'Desfazer nesta lousa')}${ico('bdRedo', 'redo', 'Refazer nesta lousa')}${ico('bdClear', 'trash', 'Limpar o desenho desta lousa (a lousa continua)')}
    </div>
    <div class="bd-canvas-wrap"><canvas id="bdCanvas" aria-label="Folha de desenho quadriculada"></canvas></div>
    <div class="bd-foot">
      ${ico('bdPrev', 'prev', 'Página anterior')}
      <span id="bdPage"></span>
      ${ico('bdNext', 'next', 'Próxima página')}
      ${ico('bdNew', 'plus', 'Nova lousa em branco')}
      ${ico('bdDelPage', 'bin', 'Excluir esta lousa')}
      <span class="bd-sep"></span>
      ${ico('bdZoomOut', 'minus', 'Diminuir o zoom')}
      <button type="button" class="bd-zoom" id="bdZoomLbl" title="Voltar a 100%">100%</button>
      ${ico('bdZoomIn', 'plus', 'Aumentar o zoom')}
      <span class="grow"></span>
      <button type="button" class="btn primary small bd-save" id="bdExport" title="Salvar esta página como PNG">${iconSvg('save', 14)}<span>Salvar PNG</span></button>
    </div>`;
  boardCanvas = boardEl('bdCanvas'); boardCtx = boardCanvas.getContext('2d');
  boardBase = document.createElement('canvas'); boardBaseCtx = boardBase.getContext('2d');
  boardPaper = document.createElement('canvas');
  boardCanvas.addEventListener('pointerdown', boardDown);
  boardCanvas.addEventListener('pointermove', boardMove);
  boardCanvas.addEventListener('pointerup', boardUp);
  boardCanvas.addEventListener('pointercancel', boardUp);
  const wrap = boardCanvas.parentElement;
  wrap.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') boardTouchDown(e); });
  wrap.addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') boardTouchMove(e); });
  wrap.addEventListener('pointerup', (e) => { if (e.pointerType === 'touch') boardTouchUp(e); });
  wrap.addEventListener('pointercancel', (e) => { if (e.pointerType === 'touch') boardTouchUp(e); });
  boardEl('bdClose').onclick = closeBoard;
  pane.querySelector('.bd-head').addEventListener('pointerdown', boardDragStart);
  boardEl('bdMax').onclick = () => { if (window.toggleDockMax) window.toggleDockMax(); };
  for (const b of pane.querySelectorAll('[data-bd-tool]')) b.onclick = () => { boardState.tool = b.dataset.bdTool; boardInfo(); };
  for (const b of pane.querySelectorAll('[data-bd-color]')) b.onclick = () => { boardState.color = b.dataset.bdColor; boardState.tool = 'pen'; boardInfo(); };
  for (const b of pane.querySelectorAll('[data-bd-width]')) b.onclick = () => {
    boardState.width = +b.dataset.bdWidth;
    if (boardState.tool === 'eraser') boardState.tool = 'pen';   // a espessura é da caneta: com a borracha, volta a escrever
    boardInfo();
  };
  boardEl('bdStraight').onclick = () => { boardState.straighten = !boardState.straighten; boardInfo(); };
  boardEl('bdUndo').onclick = boardUndo;
  boardEl('bdRedo').onclick = boardRedo;
  boardEl('bdClear').onclick = boardClear;
  boardEl('bdPrev').onclick = () => boardGo(-1);
  boardEl('bdNext').onclick = () => boardGo(1);
  boardEl('bdNew').onclick = boardNewPage;
  boardEl('bdDelPage').onclick = boardDeletePage;
  boardEl('bdZoomOut').onclick = () => boardZoom(1 / BOARD_ZOOM.step);
  boardEl('bdZoomIn').onclick = () => boardZoom(BOARD_ZOOM.step);
  boardEl('bdZoomLbl').onclick = () => boardZoom(1 / boardState.zoom);
  // ctrl + roda do mouse: zoom no ponto do cursor (sem ctrl, a roda rola a folha normalmente)
  boardCanvas.parentElement.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    boardSetZoom(boardState.zoom * (e.deltaY < 0 ? BOARD_ZOOM.step : 1 / BOARD_ZOOM.step), e.clientX, e.clientY);
  }, { passive: false });
  boardEl('bdExport').onclick = boardExport;
  // a folha acompanha o tamanho da coluna, sem perder o desenho
  new ResizeObserver(() => fitBoard()).observe(boardEl('bdCanvas').parentElement);
}

function fitBoard() {
  if (!boardCanvas) return;
  const wrap = boardCanvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const w = wrap.clientWidth, h = wrap.clientHeight;
  if (!w || !h) return;
  const z = boardState.zoom;
  boardSheet = { w: Math.max(boardSheet.w, w, w / z), h: Math.max(boardSheet.h, h, h / z) };
  boardLogical = boardSheet;
  // resolução física = tela x zoom, limitada pelo máximo de textura do aparelho (4096 px por lado)
  const eff = Math.min(dpr * z, 4096 / Math.max(boardSheet.w, boardSheet.h));
  boardDpr = eff;
  boardCanvas.style.width = boardSheet.w * z + 'px'; boardCanvas.style.height = boardSheet.h * z + 'px';
  boardCanvas.width = Math.round(boardSheet.w * eff); boardCanvas.height = Math.round(boardSheet.h * eff);
  boardBase.width = boardCanvas.width; boardBase.height = boardCanvas.height;
  boardPaper.width = boardCanvas.width; boardPaper.height = boardCanvas.height;
  const pc = boardPaper.getContext('2d');
  pc.setTransform(eff, 0, 0, eff, 0, 0);
  drawPaper(pc, boardSheet.w, boardSheet.h);
  boardRebuild(); boardRedraw();
}

/** Posiciona a janela da lousa dentro da área visível (nunca fora da tela). Salva a posição quando `save` é verdadeiro. */
function boardPlace(x, y, save) {
  const pane = boardEl('boardpane');
  const w = pane.offsetWidth, h = pane.offsetHeight;
  const nx = Math.max(0, Math.min(x, window.innerWidth - w)), ny = Math.max(0, Math.min(y, window.innerHeight - h));
  pane.style.left = nx + 'px'; pane.style.top = ny + 'px';
  if (save) saveCfg({ boardPos: { x: nx, y: ny } });
}

/** Arrastar a janela pelo cabeçalho (botões do cabeçalho não arrastam). */
function boardDragStart(e) {
  if (e.target.closest('button')) return;
  const pane = boardEl('boardpane'), head = e.currentTarget;
  const r = pane.getBoundingClientRect();
  const ox = e.clientX - r.left, oy = e.clientY - r.top;
  const move = (ev) => boardPlace(ev.clientX - ox, ev.clientY - oy, false);
  const end = () => {
    head.removeEventListener('pointermove', move); head.removeEventListener('pointerup', end); head.removeEventListener('pointercancel', end);
    boardPlace(parseFloat(pane.style.left) || 0, parseFloat(pane.style.top) || 0, true);
  };
  try { head.setPointerCapture(e.pointerId); } catch { /* sem captura o arrasto segue pela própria janela */ }
  head.addEventListener('pointermove', move); head.addEventListener('pointerup', end); head.addEventListener('pointercancel', end);
  e.preventDefault();
}

function openBoard() {
  boardBuild();
  const pane = boardEl('boardpane');
  pane.hidden = false;
  const pos = loadCfg().boardPos || { x: 120, y: 100 };   // posição que o usuário deixou (ou o padrão)
  boardPlace(pos.x, pos.y, false);
  document.body.classList.add('board-open');
  fitBoard();
}
function closeBoard() {
  if (!boardEl('boardpane') || boardEl('boardpane').hidden) return;
  boardEl('boardpane').hidden = true;
  document.body.classList.remove('board-open');
  setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
}
function toggleBoard() { if (boardEl('boardpane').hidden) openBoard(); else closeBoard(); }

act.board = toggleBoard;
window.BOARD_API = { openBoard, closeBoard, exportBoardTo, boardPng, boardState };
