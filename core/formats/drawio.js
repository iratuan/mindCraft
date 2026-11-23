'use strict';
/**
 * Fluxograma → Draw.io (diagrams.net): XML <mxfile><diagram><mxGraphModel>. Cada passo vira uma forma (vertex) com a
 * posição do layout do MindCraft; cada ligação vira uma seta ortogonal (edge) com o rótulo do ramo ("Sim"/"Não").
 * Só exporta (o MindCraft não lê .drawio ainda). Função pura, sem DOM: todo texto do usuário é escapado como atributo XML.
 */
const { layoutFlow } = require('../components/flow-layout');
const { escapeHtml } = require('../utils/text');

// Estilos do Draw.io por tipo de passo: início/fim em pílula, passo retangular arredondado, decisão em losango.
const STYLE = {
  start: 'ellipse;whiteSpace=wrap;html=1;arcSize=50;fillColor=#d5e8d4;strokeColor=#82b366;',
  end: 'ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;',
  step: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',
  decision: 'rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;',
};
const EDGE = 'edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;';
const EDGE_ALT = EDGE + 'dashed=1;';   // setas extras (voltas, junções): tracejadas

const attr = (s) => escapeHtml(String(s == null ? '' : s)).replace(/\n/g, '&#10;');

/** Gera o XML do Draw.io para um fluxograma. */
function toDrawio(map) {
  const { boxes, edges, relations } = layoutFlow(map);
  const cid = (id) => 'n_' + String(id).replace(/[^A-Za-z0-9_-]/g, '_');
  const cells = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>'];
  for (const b of boxes.values()) {
    cells.push(`<mxCell id="${cid(b.id)}" value="${attr(b.title)}" style="${STYLE[b.type] || STYLE.step}" vertex="1" parent="1">` +
      `<mxGeometry x="${Math.round(b.x)}" y="${Math.round(b.y)}" width="${Math.round(b.w)}" height="${Math.round(b.h)}" as="geometry"/></mxCell>`);
  }
  const edge = (id, e, style) => `<mxCell id="${id}" value="${attr(e.label)}" style="${style}" edge="1" parent="1" source="${cid(e.from)}" target="${cid(e.to)}">` +
    '<mxGeometry relative="1" as="geometry"/></mxCell>';
  edges.forEach((e, i) => cells.push(edge(`e_${i}`, e, EDGE)));
  relations.forEach((r, i) => cells.push(edge(`r_${i}`, r, EDGE_ALT)));
  const name = attr(map.meta.name || map.root.title || 'Fluxograma');
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    `<mxfile host="MindCraft"><diagram id="mindcraft-flow" name="${name}">` +
    '<mxGraphModel dx="1000" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">' +
    `<root>${cells.join('')}</root></mxGraphModel></diagram></mxfile>\n`;
}

module.exports = { toDrawio };
