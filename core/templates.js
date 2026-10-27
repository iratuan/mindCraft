'use strict';
// Modelos de mapa de concurso: lista e cria um mapa a partir de um modelo (CSV de edital, mesmo importador da "Importar edital").
// Os dados vêm de core/templates-data.js, gerado de modelos/*.csv por tools/build-templates.js.
const { fromCsv, parseCsv } = require('./csv');
const DATA = require('./templates-data');

const textOf = (t) => t.csv.join('\r\n') + '\r\n';

/** Lista os modelos com título, fonte e tamanho (sem criar mapas). */
function listTemplates() {
  return DATA.map((t) => {
    const rows = parseCsv(textOf(t)).rows;
    const r = fromCsv(textOf(t)).report;
    return { id: t.id, title: rows[1] ? rows[1][0] : t.id, fonte: rows[1] ? rows[1][6] || '' : '', disciplinas: r.disciplines, topicos: r.imported };
  });
}

/** Cria o mapa do modelo (o mesmo resultado da importação do CSV). null se o id não existir. */
function createTemplateMap(id) {
  const t = DATA.find((x) => x.id === id);
  if (!t) return null;
  return fromCsv(textOf(t)).map;
}

module.exports = { listTemplates, createTemplateMap };