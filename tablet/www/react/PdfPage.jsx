import { useEffect, useRef, useState } from 'react';
import { renderPage, isRenderCancel } from './pdfEngine.js';

/** Uma página do PDF: canvas + camada de texto selecionável + destaques dos trechos já capturados. Só é desenhada quando está perto da tela. */
export function PdfPage({ doc, num, scale, base, hl, root }) {
  const wrap = useRef(null), canvas = useRef(null), text = useRef(null);
  const [size, setSize] = useState({ w: Math.floor(base.w * scale), h: Math.floor(base.h * scale) });
  const [vis, setVis] = useState(false);

  useEffect(() => { setSize((s) => (vis ? s : { w: Math.floor(base.w * scale), h: Math.floor(base.h * scale) })); }, [scale, base.w, base.h, vis]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => setVis(es.some((e) => e.isIntersecting)), { root: root.current, rootMargin: '900px 0px' });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, [root]);
  useEffect(() => {
    if (!vis) { if (canvas.current) { canvas.current.width = 0; canvas.current.height = 0; } if (text.current) text.current.textContent = ''; return undefined; }
    let live = true, job = null;
    (async () => {
      const page = await doc.getPage(num);
      if (!live) return;
      job = renderPage(page, scale, canvas.current, text.current);
      setSize({ w: Math.floor(job.vp.width), h: Math.floor(job.vp.height) });
      await job.done;
    })().catch((e) => { if (!isRenderCancel(e) && live) { try { window.MC.logError('PDF p. ' + num + ': ' + (e && e.message)); } catch { /* sem registro */ } } });
    return () => { live = false; if (job) job.cancel(); };
  }, [vis, scale, doc, num]);

  return (
    <div className="pdf-page" ref={wrap} data-page={num} style={{ width: size.w, height: size.h }}>
      <canvas ref={canvas} />
      <div className="pdf-hls">{hl.map((r, i) => <div key={i} className="pdf-hl" data-node={r.node} style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%` }} />)}</div>
      <div className="textLayer" ref={text} />
    </div>
  );
}
