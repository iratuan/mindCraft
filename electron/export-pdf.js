'use strict';
/* Gera o PDF do material de estudo: o HTML (já escapado pelo núcleo) é carregado numa janela oculta, sem scripts,
   e impresso em A4. Nada é gravado até o usuário escolher o local no diálogo do sistema. */
const { BrowserWindow } = require('electron');
const fs = require('fs');

/** `progress(pct, label)` informa cada etapa (0 a 100) para a barra da janela de exportação. */
async function htmlToPdf(html, progress = () => {}) {
  const w = new BrowserWindow({ show: false, width: 900, height: 1200, webPreferences: { sandbox: true, javascript: false, nodeIntegration: false, contextIsolation: true } });
  try {
    progress(15, 'Montando as páginas…');
    await w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(String(html)));
    progress(55, 'Gerando o PDF…');
    return await w.webContents.printToPDF({ pageSize: 'A4', printBackground: true, preferCSSPageSize: true, margins: { marginType: 'default' } });
  } finally {
    w.destroy();
  }
}

/** Grava o PDF no caminho escolhido (arquivo temporário + renomear: uma falha no meio nunca deixa um PDF pela metade). */
async function writePdf(html, target, progress = () => {}) {
  progress(5, 'Preparando o material…');
  const buf = await htmlToPdf(html, progress);
  progress(90, 'Gravando o arquivo…');
  const tmp = target + '.tmp-' + process.pid;
  try { fs.writeFileSync(tmp, buf); fs.renameSync(tmp, target); progress(100, 'PDF pronto.'); }
  catch (e) { try { fs.rmSync(tmp, { force: true }); } catch { /* ignora */ } throw e; }
  return target;
}

module.exports = { htmlToPdf, writePdf };
