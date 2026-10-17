'use strict';
// O pdfkit depende de fontes e fluxos do Node; na versão tablet a exportação em PDF ainda não existe (Word, Markdown, OPML, PNG/SVG sim).
module.exports = function PDFDocument() { throw new Error('Exportar PDF ainda não está disponível na versão tablet. Use Word, Markdown ou imagem.'); };
