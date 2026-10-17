'use strict';
// Arquivo no formato do Mindomo (themes.json + document.json + nodes.json) para os testes de fidelidade.
const AdmZip = require('adm-zip');

const TID = 'th1';
const font = (c, s, n, b) => `<Font  Color="${c}" Size="${s}" Align="left" Name="${n}" Bold="${b}" Italic="false" Underline="false" />`;
const themes = { [TID]: { id: TID, mapStyle: { fillType: '0', fillValue: 'f8f8f8' }, nodeStyles: [
  { style: { shape_type: 4, fill_type: 0, fill_value: '0a2a6c', fill_style: 18, border_thickness: 0, padding_left: 12, padding_top: 8, line_fill_value: 'fe9400', line_width: 4 }, font: font('ffffff', 24, 'Verdana', 'true') },
  { style: { shape_type: 9, fill_type: 19, fill_value: 'fdfefe,ced3d3', fill_style: 19, border_thickness: 2, border_color: '238acc', padding_left: 8, padding_top: 5, line_fill_value: '0047ff', line_width: 2 }, font: font('001b4a', 14, 'Noto Sans', 'true') },
  { style: { shape_type: 14, fill_type: 9, fill_style: 18, border_thickness: 0, padding_left: 6, padding_top: 3, line_fill_value: 'a8a9a8', line_width: 1 }, font: font('333333', 12, 'Noto Sans', 'false') },
] } };
const node = (id, parentId, index, title, extra = {}) => ({ version: 40, id, originalId: id, ...(parentId ? { parentId } : {}), title, index, style: { valign: 32000, halign: 32000, orientation: parentId ? 0 : 101 }, creatorId: 4, ...extra });
const mindomo = (over = {}) => {
  const z = new AdmZip();
  z.addFile('themes.json', Buffer.from(JSON.stringify(over.themes ?? themes)));
  z.addFile('document.json', Buffer.from(JSON.stringify({ version: 40, mapInfo: { id: 'm1', name: 'Mapa do Mindomo', rootId: 'r', themeId: TID, style: {}, template: {} }, mapUsers: {}, desktopVersion: '9.5.7' })));
  z.addFile('nodes.json', Buffer.from(JSON.stringify(over.nodes ?? [
    node('r', null, 0, 'Raiz', { style: { valign: 1, halign: 32000, orientation: 101, fill_type: 0, fill_value: '000000' }, titleStyle: '<Font Color="f0f0f0" Size="26" />' }),
    node('a', 'r', 0, 'Capítulo', { description: '<p>Texto <strong>importante</strong> e <em>itálico</em> &amp; mais</p><p>Segundo parágrafo</p>', style: { valign: 32000, halign: 32000, orientation: 0, fill_type: 0, fill_value: 'ff6961', shape_type: 3, border_color: '3c3c3c', border_thickness: 1, line_fill_value: 'ea5545', line_width: 4 }, titleStyle: '<Font Color="ffffff" Size="16" Name="Kalam" Bold="true" />' }),
    node('b', 'a', 0, 'Folha com nota parcial em negrito\nsegunda linha', { titleStyle: '<FontRange From="0" To="' + ('Folha com nota parcial em negrito\nsegunda linha'.length - 1) + '" Bold="true" ></FontRange>' }),
  ])));
  z.addFile('changes.json', Buffer.from('[]'));
  return z.toBuffer();
};
module.exports = { TID, themes, node, mindomo };
