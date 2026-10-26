import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { H, useMcRender } from './hooks.js';
import { loadPdf, pageText, norm } from './pdfEngine.js';
import { PdfPage } from './PdfPage.jsx';
import { FlatIcon } from './FlatIcon.jsx';

const STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
const shorten = (s, n = 110) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');

/** Leitor de PDF (painel dividido ao lado do mapa). Selecionar um trecho → criar tópico ou anotar, com página e destaque. */
export function PdfPane({ initial }) {
  const h = H(); useMcRender();
  const map = h.map();
  const [src, setSrc] = useState(initial.path ? { path: initial.path, name: initial.name } : null);
  const [doc, setDoc] = useState(null);
  const [err, setErr] = useState('');
  const [base, setBase] = useState({ w: 595, h: 842 });
  const [fitScale, setFitScale] = useState(1);
  const [mode, setMode] = useState(h.loadCfg().pdfScale || 'fit');
  const [page, setPage] = useState(1);
  const [pageIn, setPageIn] = useState('1');
  const [sel, setSel] = useState(null);
  const [msg, setMsg] = useState('');
  const [query, setQuery] = useState('');
  const scroller = useRef(null), pane = useRef(null), texts = useRef(new Map()), want = useRef(initial.page || null), saveT = useRef(null), findFrom = useRef(0);
  const scale = mode === 'fit' ? fitScale : mode;

  const pdfs = map.meta.pdfs || [];
  const reg = src ? pdfs.find((p) => p.path.toLowerCase() === src.path.toLowerCase()) : null;

  // ---- abrir arquivo ----
  useEffect(() => {
    if (!src) { setDoc(null); return undefined; }
    let live = true, cur = null;
    setErr(''); setDoc(null); texts.current = new Map();
    (async () => {
      let bytes;
      try { bytes = new Uint8Array(h.fs.readFileSync(src.path)); } catch (e) { throw new Error(e && e.code === 'ENOENT' ? 'Arquivo não encontrado: ' + src.path : 'Não consegui ler o arquivo: ' + (e && e.message)); }
      const d = await loadPdf(bytes); cur = d;
      if (!live) { d.destroy(); return; }
      const p1 = await d.getPage(1), v = p1.getViewport({ scale: 1 });
      setBase({ w: v.width, h: v.height }); setDoc(d);
      const saved = (h.loadCfg().pdfPos || {})[src.path];
      if (!want.current && saved) want.current = Math.min(saved, d.numPages);
    })().catch((e) => { if (live) setErr(e.message); });
    return () => { live = false; if (cur) cur.destroy(); };
  }, [src && src.path]);

  // ---- largura disponível → escala "ajustar largura" ----
  useEffect(() => {
    const el = scroller.current; if (!el) return undefined;
    const calc = () => setFitScale(Math.max(0.3, Math.min(3, (el.clientWidth - 26) / base.w)));
    calc(); const ro = new ResizeObserver(calc); ro.observe(el);
    return () => ro.disconnect();
  }, [base.w, doc]);

  const goPage = useCallback((n, smooth = false) => {
    const el = scroller.current && scroller.current.querySelector(`[data-page="${n}"]`);
    if (el) scroller.current.scrollTo({ top: el.offsetTop - 8, behavior: smooth ? 'smooth' : 'auto' });
  }, []);
  useEffect(() => { if (doc && want.current) { const n = want.current; want.current = null; requestAnimationFrame(() => { goPage(n); setPage(n); setPageIn(String(n)); }); } }, [doc, goPage]);
  useEffect(() => { if (doc) goPage(page); }, [scale]);   // mudou o zoom: continua na mesma página

  // ---- eventos externos (abrir outro PDF/página a partir do painel Notas) ----
  useEffect(() => {
    const f = (e) => {
      const d = e.detail || {};
      if (d.page) want.current = d.page;
      if (d.path && (!src || d.path !== src.path)) setSrc({ path: d.path, name: d.name }); else if (d.page && doc) { goPage(d.page, true); setPage(d.page); setPageIn(String(d.page)); want.current = null; }
    };
    document.addEventListener('mc:pdf-open', f);
    return () => document.removeEventListener('mc:pdf-open', f);
  }, [src, doc, goPage]);

  // ---- página atual pela rolagem (e posição lembrada) ----
  const onScroll = useCallback(() => {
    setSel(null);
    const el = scroller.current; if (!el) return;
    const top = el.scrollTop + el.clientHeight * 0.3;
    let cur = 1;
    for (const p of el.querySelectorAll('.pdf-page')) { if (p.offsetTop <= top) cur = +p.dataset.page; else break; }
    setPage(cur); setPageIn(String(cur));
    clearTimeout(saveT.current);
    saveT.current = setTimeout(() => { if (src) h.saveCfg({ pdfPos: { ...(h.loadCfg().pdfPos || {}), [src.path]: cur } }); }, 700);
  }, [src && src.path]);

  // ---- seleção de texto → barra flutuante ----
  const onMouseUp = () => {
    setTimeout(() => {
      const s = window.getSelection();
      if (!s || s.isCollapsed || !s.rangeCount || !scroller.current || !scroller.current.contains(s.anchorNode)) return;
      const range = s.getRangeAt(0);
      const pageOf = (n) => (n.nodeType === 3 ? n.parentElement : n).closest('.pdf-page');
      const a = pageOf(range.startContainer), b = pageOf(range.endContainer);
      if (!a || !b) return;
      if (a !== b) { setMsg('Selecione o trecho dentro de uma única página.'); setSel(null); return; }
      const text = s.toString().replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
      if (!text) return;
      const pr = a.getBoundingClientRect(), rects = [];
      for (const r of range.getClientRects()) {
        if (r.width < 2 || r.height < 2) continue;
        const q = [(r.left - pr.left) / pr.width, (r.top - pr.top) / pr.height, r.width / pr.width, r.height / pr.height];
        if (!rects.some((x) => Math.abs(x[0] - q[0]) < 0.002 && Math.abs(x[1] - q[1]) < 0.002 && Math.abs(x[2] - q[2]) < 0.002)) rects.push(q);
      }
      const last = range.getBoundingClientRect(), box = pane.current.getBoundingClientRect();
      setMsg(''); setSel({ text, rects: rects.slice(0, 40), page: +a.dataset.page, x: Math.max(6, Math.min(box.width - 250, last.left - box.left)), y: last.bottom - box.top + 6 });
    }, 0);
  };
  const capture = (modeCap) => {
    if (!sel || !src) return;
    try {
      const r = h.pdfCapture({ source: src, page: sel.page, text: sel.text, rects: sel.rects, mode: modeCap });
      setMsg(modeCap === 'topic' ? `Tópico criado a partir do trecho (p. ${sel.page}).` : `Trecho anotado em "${r.title}" (p. ${sel.page}).`);
    } catch (e) { setMsg('Não consegui registrar o trecho: ' + e.message); }
    window.getSelection().removeAllRanges(); setSel(null);
  };
  const onClickPage = (e) => {   // Ctrl+clique num trecho já destacado → vai ao tópico
    if (!e.ctrlKey && !e.metaKey) return;
    const el = e.target.closest('.pdf-page'); if (!el) return;
    const pr = el.getBoundingClientRect(), x = (e.clientX - pr.left) / pr.width, y = (e.clientY - pr.top) / pr.height;
    // Trechos sobrepostos: vale o destaque cujo centro está mais perto do clique (o mais específico), não o primeiro da lista
    const hits = (highlights.get(+el.dataset.page) || []).filter((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
    const dist = (r) => Math.hypot(x - (r.x + r.w / 2), y - (r.y + r.h / 2));
    const hit = hits.sort((a, b) => dist(a) - dist(b))[0];
    if (hit) h.goTo(hit.node);
  };

  // ---- destaques e tópicos da página (do mapa aberto) ----
  const highlights = useMemo(() => {
    const out = new Map();
    if (!reg) return out;
    map.walk((n) => { for (const r of n.refs || []) if (r.pdf === reg.id) for (const q of r.rects) { if (!out.has(r.page)) out.set(r.page, []); out.get(r.page).push({ node: n.id, x: q[0], y: q[1], w: q[2], h: q[3] }); } });
    return out;
  }, [map, reg && reg.id, h.rev()]);
  const chips = useMemo(() => {
    const out = [];
    if (reg) map.walk((n) => { if ((n.refs || []).some((r) => r.pdf === reg.id && r.page === page)) out.push(n); });
    return out;
  }, [map, reg && reg.id, page, h.rev()]);

  // ---- buscar no PDF ----
  const find = async (fromStart) => {
    if (!doc || !query.trim()) return;
    const q = norm(query.trim()); const start = fromStart ? 1 : (findFrom.current || page) + 1;
    for (let k = 0; k < doc.numPages; k++) {
      const n = ((start - 1 + k) % doc.numPages) + 1;
      if (!texts.current.has(n)) texts.current.set(n, await pageText(doc, n));
      if (texts.current.get(n).includes(q)) { findFrom.current = n; goPage(n, true); setPage(n); setPageIn(String(n)); setMsg(`“${query.trim()}” encontrado na p. ${n}.`); return; }
    }
    setMsg(`“${query.trim()}” não foi encontrado.`);
  };

  const onOpen = async () => { const p = await h.ipc('dialog:open-pdf'); if (p) { want.current = null; setSrc({ path: p, name: h.baseName(p) }); } };
  const onRelink = async () => {
    const p = await h.ipc('dialog:open-pdf'); if (!p) return;
    if (reg) h.relinkPdf(reg.id, p);
    setSrc({ path: p, name: src.name });
  };
  const zoom = (d) => { const cur = scale; const i = STEPS.findIndex((x) => x >= cur - 0.001); const next = d > 0 ? STEPS[Math.min(STEPS.length - 1, (i < 0 ? STEPS.length - 1 : STEPS[i] > cur + 0.001 ? i : i + 1))] : STEPS[Math.max(0, (i < 0 ? STEPS.length : i) - 1)]; setMode(next); h.saveCfg({ pdfScale: next }); };
  const pageList = useMemo(() => (doc ? Array.from({ length: doc.numPages }, (_, i) => i + 1) : []), [doc]);

  return (
    <div className="pdf-box" ref={pane} data-ui="react">
      <div className="pdf-head">
        <select id="pdfSel" value={src ? src.path : ''} onChange={(e) => { const p = pdfs.find((x) => x.path === e.target.value); if (p) { want.current = null; setSrc({ path: p.path, name: p.name }); } }} title="PDFs deste mapa">
          {!src && <option value="">(nenhum PDF aberto)</option>}
          {src && !reg && <option value={src.path}>{src.name || h.baseName(src.path)}</option>}
          {pdfs.map((p) => <option key={p.id} value={p.path}>{p.name}</option>)}
        </select>
        <button className="btn small" id="pdfHelp" data-manual="pdf" title="Manual: como usar o leitor de PDF" aria-label="Ajuda do leitor de PDF">?</button>
        <button className="btn small" id="pdfOpen" onClick={onOpen} style={{ display: 'inline-flex', alignItems: 'center' }}>
          <FlatIcon name="pdf" size={13} style={{ marginRight: '5px' }} /> Abrir PDF…
        </button>
        {(doc || src) && (
          <button
            className="btn small"
            id="pdfCloseDoc"
            onClick={() => {
              if (doc) doc.destroy();
              setDoc(null);
              setSrc(null);
              setMsg('PDF fechado.');
            }}
            title="Fechar PDF atual e descarregar da memória"
            style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center' }}
          >
            <FlatIcon name="close" size={12} style={{ marginRight: '4px' }} /> Fechar PDF
          </button>
        )}
      </div>
      {doc && (
        <div className="pdf-bar">
          <button className="btn small" id="pdfPrev" disabled={page <= 1} onClick={() => { goPage(page - 1, true); }} aria-label="Página anterior" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <FlatIcon name="arrowLeft" size={11} />
          </button>
          <input id="pdfPageNum" type="text" inputMode="numeric" value={pageIn} onChange={(e) => setPageIn(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { const n = Math.max(1, Math.min(doc.numPages, parseInt(pageIn, 10) || 1)); goPage(n); setPage(n); setPageIn(String(n)); } }} aria-label="Página" />
          <span className="muted" id="pdfPageCount">{`/ ${doc.numPages}`}</span>
          <button className="btn small" id="pdfNext" disabled={page >= doc.numPages} onClick={() => { goPage(page + 1, true); }} aria-label="Próxima página" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <FlatIcon name="arrowRight" size={11} />
          </button>
          <span className="sep" />
          <button className="btn small" id="pdfZoomOut" onClick={() => zoom(-1)} title="Diminuir" style={{ fontWeight: 600 }}>−</button>
          <button className={'btn small' + (mode === 'fit' ? ' primary' : '')} id="pdfFit" onClick={() => { setMode('fit'); h.saveCfg({ pdfScale: 'fit' }); }} title="Ajustar à largura">{`${Math.round(scale * 100)}%`}</button>
          <button className="btn small" id="pdfZoomIn" onClick={() => zoom(1)} title="Aumentar" style={{ fontWeight: 600 }}>+</button>
          <span className="sep" />
          <input id="pdfFind" type="search" placeholder="Buscar no PDF…" value={query} onChange={(e) => { setQuery(e.target.value); findFrom.current = 0; }} onKeyDown={(e) => { if (e.key === 'Enter') find(false); }} />
        </div>
      )}
      {chips.length > 0 && (
        <div className="pdf-chips" id="pdfChips"><span className="muted">Tópicos nesta página:</span>{chips.map((n) => <button key={n.id} className="chip2" data-node={n.id} onClick={() => h.goTo(n.id)} title="Ir ao tópico no mapa">{shorten(n.title, 36)}</button>)}</div>
      )}
      {err && <div className="pdf-err" id="pdfErr"><div>{err}</div>{src && /não encontrado/i.test(err) && <button className="btn small primary" id="pdfRelink" onClick={onRelink}>Localizar o PDF…</button>}</div>}
      {!src && !err && (
        <div className="pdf-empty" id="pdfEmpty">
          Abra um PDF para ler ao lado do mapa. Selecione um trecho para criar um tópico ou anotar, com a página e o destaque.<br />
          <button className="btn primary" id="pdfOpen2" onClick={onOpen} style={{ display: 'inline-flex', alignItems: 'center', marginTop: '10px' }}>
            <FlatIcon name="pdf" size={14} style={{ marginRight: '6px' }} /> Abrir PDF…
          </button>
        </div>
      )}
      <div className="pdf-scroll" id="pdfScroll" ref={scroller} onScroll={onScroll} onMouseUp={onMouseUp} onMouseDown={() => setSel(null)} onClick={onClickPage}>
        {doc && pageList.map((n) => <PdfPage key={n} doc={doc} num={n} scale={scale} base={base} root={scroller} hl={highlights.get(n) || []} />)}
      </div>
      {sel && (
        <div className="pdf-sel" id="pdfSel2" style={{ left: sel.x, top: sel.y }} onMouseDown={(e) => e.preventDefault()}>
          <button className="btn small primary" id="pdfMkTopic" onClick={() => capture('topic')} title="Cria um tópico filho do selecionado com este trecho" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <FlatIcon name="plus" size={12} style={{ marginRight: '4px' }} /> Tópico
          </button>
          <button className="btn small" id="pdfMkNote" onClick={() => capture('note')} title="Acrescenta o trecho às notas do tópico selecionado" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <FlatIcon name="plus" size={12} style={{ marginRight: '4px' }} /> Nota
          </button>
        </div>
      )}
      <div className="pdf-msg" id="pdfMsg" role="status">{msg}</div>
    </div>
  );
}
