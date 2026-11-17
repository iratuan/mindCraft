'use strict';
// PDFs vinculados ao mapa: registro de arquivos (meta.pdfs) e referências de trechos por tópico (node.refs).
// Tudo que vem de arquivo (.mom) ou de fora passa por aqui: nada é confiado.
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_PDFS = 200, MAX_REFS = 500, MAX_RECTS = 40, MAX_QUOTE = 2000, MAX_PAGE = 100000;
const clamp01 = (n) => Math.min(1, Math.max(0, n));

/** [{ id, name, path }] — ids únicos e seguros; nomes/caminhos limitados. */
function sanitizePdfs(list) {
  const out = [], seen = new Set();
  for (const p of Array.isArray(list) ? list : []) {
    if (out.length >= MAX_PDFS) break;
    if (!p || typeof p.id !== 'string' || !SAFE_ID.test(p.id) || seen.has(p.id) || typeof p.path !== 'string' || !p.path) continue;
    seen.add(p.id);
    out.push({ id: p.id, name: String(p.name ?? '').slice(0, 200) || baseName(p.path), path: p.path.slice(0, 1000) });
  }
  return out;
}
const baseName = (p) => String(p).split(/[\\/]/).pop().replace(/\.pdf$/i, '').slice(0, 200) || 'PDF';

/** [{ pdf, page, quote, rects:[[x,y,w,h]…] }] — retângulos normalizados (0–1) pela página; páginas e textos limitados. */
function sanitizeRefs(list) {
  const out = [];
  for (const r of Array.isArray(list) ? list : []) {
    if (out.length >= MAX_REFS) break;
    if (!r || typeof r.pdf !== 'string' || !SAFE_ID.test(r.pdf) || !Number.isInteger(r.page) || r.page < 1 || r.page > MAX_PAGE) continue;
    const rects = (Array.isArray(r.rects) ? r.rects : []).slice(0, MAX_RECTS)
      .filter((q) => Array.isArray(q) && q.length === 4 && q.every((n) => Number.isFinite(n)))
      .map((q) => q.map(clamp01)).filter((q) => q[2] > 0 && q[3] > 0);
    out.push({ pdf: r.pdf, page: r.page, quote: String(r.quote ?? '').slice(0, MAX_QUOTE), rects });
  }
  return out;
}

/** Texto curto de uma referência: "Nome, p. 12". */
const refLabel = (ref, pdfs) => { const p = (pdfs || []).find((x) => x.id === ref.pdf); return `${p ? p.name : 'PDF não vinculado'}, p. ${ref.page}`; };

module.exports = { sanitizePdfs, sanitizeRefs, refLabel, baseName, SAFE_ID, MAX_REFS };
