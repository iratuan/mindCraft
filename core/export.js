'use strict';
const path = require('path');
const PDFDocument = require('pdfkit');
const docx = require('docx');
const { layoutMap, edgePoints } = require('./layout');
const { MARKERS, tagText } = require('./markers');
const { mdToPlain } = require('./markdown');

// ---------- Markdown / OPML / texto ----------
function toMarkdown(map) {
  const out = [`# ${map.root.title}`, ''];
  if (map.root.notes) out.push(map.root.notes, '');
  const rec = (n, depth) => {
    for (const c of n.children) {
      if (depth < 4) out.push('', `${'#'.repeat(depth + 2)} ${c.title}${tagText(c)}`, '');
      else out.push(`${'  '.repeat(depth - 4)}- ${c.title}${tagText(c)}`);
      if (c.notes) out.push(depth < 4 ? c.notes : `${'  '.repeat(depth - 3)}> ${c.notes}`, '');
      rec(c, depth + 1);
    }
  };
  rec(map.root, 0);
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

const xesc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function toOPML(map) {
  const rec = (n, ind) => {
    const attrs = `text="${xesc(n.title)}"${n.notes ? ` _note="${xesc(n.notes)}"` : ''}${(n.markers || []).length ? ` _markers="${n.markers.join(',')}"` : ''}${n.progress != null ? ` _progress="${n.progress}"` : ''}`;
    if (!n.children.length) return `${ind}<outline ${attrs}/>`;
    return `${ind}<outline ${attrs}>\n${n.children.map((c) => rec(c, ind + '  ')).join('\n')}\n${ind}</outline>`;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n  <head><title>${xesc(map.root.title)}</title></head>\n  <body>\n${rec(map.root, '    ')}\n  </body>\n</opml>\n`;
}

// ---------- PDF ----------
/**
 * Opções: { outline: true } acrescenta páginas com o conteúdo em tópicos após o mapa.
 * A primeira página tem o tamanho do mapa (sem cortes); o conteúdo em tópicos usa A4.
 */
function toPDF(map, opts = {}) {
  const L = layoutMap(map, opts);
  const { x, y, w, h } = L.bounds;
  const MAX = 3000; // limite de página do PDF ~ 14400pt; reduz mapas gigantes
  const k = Math.min(1, MAX / Math.max(w, h));
  const doc = new PDFDocument({ size: [w * k, h * k], margin: 0, info: { Title: map.root.title, Producer: 'MindCraft' } });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise((res) => doc.on('end', () => res(Buffer.concat(chunks))));

  // DejaVu embutida => acentos e alfabetos grego/cirílico corretos; Helvetica só como reserva
  const F = { regular: 'Helvetica', bold: 'Helvetica-Bold', italic: 'Helvetica-Oblique' };
  try {
    const dir = path.dirname(require.resolve('dejavu-fonts-ttf/package.json')) + '/ttf/';
    doc.registerFont('MC', dir + 'DejaVuSans.ttf');
    doc.registerFont('MC-Bold', dir + 'DejaVuSans-Bold.ttf');
    doc.registerFont('MC-Italic', dir + 'DejaVuSans-Oblique.ttf');
    Object.assign(F, { regular: 'MC', bold: 'MC-Bold', italic: 'MC-Italic' });
  } catch { /* sem a fonte: segue com Helvetica */ }

  doc.save();
  doc.scale(k).translate(-x, -y);
  doc.rect(x, y, w, h).fill(L.theme.background);

  for (const e of L.edges) {
    const { a, b, dir } = edgePoints(e);
    const lw = L.theme.line.width[Math.min(e.to.level - 1, L.theme.line.width.length - 1)];
    doc.lineWidth(lw).lineCap('round').strokeColor(e.to.branch);
    doc.moveTo(a.x, a.y);
    if (L.theme.line.curve === 'elbow') {
      const mx = a.x + (b.x - a.x) / 2;
      doc.lineTo(mx, a.y).lineTo(mx, b.y).lineTo(b.x, b.y);
    } else {
      const dx = Math.abs(b.x - a.x) * 0.5 * dir;
      doc.bezierCurveTo(a.x + dx, a.y, b.x - dx, b.y, b.x, b.y);
    }
    doc.stroke();
  }
  for (const { rel, geo } of L.relations) {
    const col = rel.color || '#e5484d';
    doc.lineWidth(2).strokeColor(col).dash(7, { space: 5 }).moveTo(geo.a.x, geo.a.y).quadraticCurveTo(geo.c.x, geo.c.y, geo.b.x, geo.b.y).stroke().undash();
    doc.polygon(...geo.arrow.map((p) => [p.x, p.y])).fill(col);
    if (rel.label) doc.font(F.italic).fontSize(12).fillColor(col).text(rel.label, geo.label.x - 100, geo.label.y - 20, { width: 200, align: 'center', lineBreak: false });
  }
  for (const b of L.boxes.values()) {
    const s = b.style;
    if (s.shape === 'underline') {
      doc.lineWidth(2).strokeColor(b.branch).moveTo(b.x, b.y + b.h).lineTo(b.x + b.w, b.y + b.h).stroke();
    } else {
      const r = s.shape === 'pill' ? b.h / 2 : s.shape === 'round' ? 8 : 2;
      doc.roundedRect(b.x, b.y, b.w, b.h, r);
      if (s.stroke) doc.lineWidth(2).fillAndStroke(s.fill, s.stroke); else doc.fill(s.fill);
    }
    doc.font(s.bold ? F.bold : s.italic ? F.italic : F.regular).fontSize(s.size).fillColor(s.color);
    // a DejaVu é mais larga que a estimativa do layout: reduz o corpo até a linha mais larga caber
    const widest = Math.max(...b.lines.map((l) => doc.widthOfString(l)));
    const room = b.w - b.markerW;
    const size = widest > room - 4 ? s.size * ((room - 4) / widest) : s.size;
    doc.fontSize(size);
    const top = b.y + b.h / 2 - (b.lines.length * b.lineHeight) / 2;
    b.lines.forEach((l, i) => doc.text(l, b.x + b.markerW, top + i * b.lineHeight + (b.lineHeight - size) / 2, { width: room, align: 'center', lineBreak: false }));
    b.markers.forEach((m, i) => {
      const d = b.markerD, cx = b.x + s.padX * 0.7 + d / 2 + i * (d + 4), cy = b.y + b.h / 2;
      doc.circle(cx, cy, d / 2).fill(MARKERS[m].color);
      doc.font(F.bold).fontSize(d * 0.62).fillColor('#ffffff').text(MARKERS[m].glyph, cx - d / 2, cy - d * 0.31, { width: d, align: 'center', lineBreak: false });
    });
    if (b.progress != null) {
      doc.roundedRect(b.x, b.y + b.h + 4, b.w, 4, 2).fillOpacity(0.25).fill('#8a94a6').fillOpacity(1);
      doc.roundedRect(b.x, b.y + b.h + 4, (b.w * b.progress) / 100, 4, 2).fill(b.progressAuto ? '#4c9aff' : '#43a047');
    }
    if (b.due) { // selo "revisão pendente" (↻, ou a quantidade em ramos recolhidos)
      doc.circle(b.x - 2, b.y - 2, 9).lineWidth(2).fillAndStroke('#e5484d', L.theme.background);
      doc.font(F.bold).fontSize(b.due > 1 ? 10 : 11).fillColor('#ffffff').text(b.due > 1 ? String(b.due) : '↻', b.x - 11, b.y - 8, { width: 18, align: 'center', lineBreak: false });
    }
  }
  doc.restore();

  if (opts.outline) {
    doc.addPage({ size: 'A4', margin: 56 });
    doc.font(F.bold).fontSize(20).fillColor('#000').text(map.root.title).moveDown(0.6);
    const rec = (n, depth) => {
      for (const c of n.children) {
        doc.font(depth < 2 ? F.bold : F.regular).fontSize(Math.max(10, 15 - depth * 1.5)).fillColor('#000')
          .text(c.title + tagText(c), 56 + depth * 18, undefined, { width: 483 - depth * 18, bulletRadius: 1.5 });
        if (c.notes) doc.font(F.italic).fontSize(9.5).fillColor('#555').text(mdToPlain(c.notes), 56 + depth * 18 + 10, undefined, { width: 473 - depth * 18 });
        doc.moveDown(0.25);
        rec(c, depth + 1);
      }
    };
    rec(map.root, 0);
  }
  doc.end();
  return done;
}

// ---------- DOCX ----------
/** Documento Word: título, tópicos como títulos (H1-H6) e notas como parágrafos. `image` (PNG Buffer) opcional é inserido no topo. */
async function toDOCX(map, opts = {}) {
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, ImageRun, PageBreak } = docx;
  const H = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6];
  const children = [new Paragraph({ text: map.root.title, heading: HeadingLevel.TITLE })];
  if (opts.image) {
    const { width, height } = opts.imageSize || { width: 600, height: 400 };
    const scale = Math.min(1, 600 / width);
    children.push(new Paragraph({ children: [new ImageRun({ type: 'png', data: opts.image, transformation: { width: width * scale, height: height * scale } })] }));
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }
  if (map.root.notes) for (const line of mdToPlain(map.root.notes).split('\n')) children.push(new Paragraph(line));
  const rec = (n, depth) => {
    for (const c of n.children) {
      children.push(new Paragraph({ text: c.title + tagText(c), heading: H[Math.min(depth, 5)] }));
      if (c.notes) for (const line of mdToPlain(c.notes).split('\n')) children.push(new Paragraph({ children: [new TextRun({ text: line })] }));
      rec(c, depth + 1);
    }
  };
  rec(map.root, 0);
  const d = new Document({ creator: 'MindCraft', title: map.root.title, sections: [{ children }] });
  return Packer.toBuffer(d);
}

module.exports = { toMarkdown, toOPML, toPDF, toDOCX };

