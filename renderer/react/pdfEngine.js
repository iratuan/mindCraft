// Motor de PDF (PDF.js empacotado). O trabalho pesado (leitura/decodificação) roda num Worker próprio (bundle/pdf.worker.js).
import * as pdfjs from 'pdfjs-dist/build/pdf.min.mjs';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('bundle/pdf.worker.js', document.baseURI).href;

/** Abre um PDF a partir dos bytes (Uint8Array). Lança erro legível se o arquivo for inválido/protegido. */
export async function loadPdf(bytes) {
  try {
    const task = pdfjs.getDocument({ data: bytes, isEvalSupported: false, enableXfa: false });
    return await task.promise;
  } catch (e) {
    const n = e && e.name;
    if (n === 'PasswordException') throw new Error('Este PDF é protegido por senha; ainda não consigo abri-lo.');
    if (n === 'InvalidPDFException' || n === 'FormatError') throw new Error('Arquivo inválido: não parece um PDF íntegro.');
    throw new Error('Não consegui abrir o PDF: ' + (e && e.message ? e.message : e));
  }
}

/** Desenha a página no canvas e monta a camada de texto (selecionável). Devolve { cancel, done }. */
export function renderPage(page, scale, canvas, textDiv) {
  const vp = page.getViewport({ scale });
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.floor(vp.width * dpr); canvas.height = Math.floor(vp.height * dpr);
  canvas.style.width = Math.floor(vp.width) + 'px'; canvas.style.height = Math.floor(vp.height) + 'px';
  const task = page.render({ canvasContext: canvas.getContext('2d'), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined });
  let layer = null, cancelled = false;
  const done = (async () => {
    await task.promise;
    if (cancelled) return;
    textDiv.textContent = '';
    textDiv.style.setProperty('--scale-factor', String(vp.scale)); textDiv.style.setProperty('--total-scale-factor', String(vp.scale));
    layer = new pdfjs.TextLayer({ textContentSource: page.streamTextContent(), container: textDiv, viewport: vp });
    await layer.render();
  })();
  return { vp, done, cancel: () => { cancelled = true; try { task.cancel(); } catch { /* já concluída */ } try { layer && layer.cancel(); } catch { /* idem */ } } };
}

const strip = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ');
/** Texto simples da página (para busca), em cache pelo chamador. */
export async function pageText(doc, n) {
  const p = await doc.getPage(n); const c = await p.getTextContent();
  return strip(c.items.map((i) => i.str).join(' '));
}
export const norm = strip;
export const isRenderCancel = (e) => !!e && (e.name === 'RenderingCancelledException' || /cancel/i.test(String(e.message)));
