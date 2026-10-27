'use strict';
// Modelos de concurso (pasta modelos/ → core/templates): cada CSV importa sem erro, sem tópicos repetidos e com fonte;
// core/templates-data.js precisa estar em dia com os CSV (rode `npm run build:templates`).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { fromCsv } = require('../core/csv');
const { listTemplates, createTemplateMap } = require('../core/templates');
const TEMPLATES_DATA = require('../core/templates-data');
const { render } = require('../tools/build-templates');

const DIR = path.join(__dirname, '..', 'modelos');
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.csv'));

test('modelos: há ao menos cinco modelos e todos aparecem na lista', () => {
  assert.equal(TEMPLATES_DATA.length, files.length, 'core/templates-data.js com um item por CSV');
  assert.ok(files.length >= 5, 'esperados POSCOMP, DATAPREV, BNB, TJ-CE e OAB');
  assert.equal(listTemplates().length, files.length);
});

test('modelos: core/templates-data.js está em dia com os CSV da pasta modelos/', () => {
  const onDisk = fs.readFileSync(path.join(__dirname, '..', 'core', 'templates-data.js'), 'utf8');
  assert.equal(onDisk, render(), 'rode `npm run build:templates` após mudar um CSV');
});

for (const f of files) {
  const id = f.replace(/\.csv$/, '');
  test(`modelo ${id}: importa sem erro, com disciplinas e sem tópicos repetidos`, () => {
    const { map, report } = fromCsv(fs.readFileSync(path.join(DIR, f), 'utf8'));
    assert.equal(report.errors.length, 0, JSON.stringify(report.errors));
    assert.ok(map && report.disciplines >= 3, 'ao menos três disciplinas');
    const m = createTemplateMap(id);
    assert.ok(m, 'o núcleo cria o mapa do modelo');
    for (const d of m.root.children) {
      const titles = d.children.map((t) => t.title);
      assert.equal(new Set(titles).size, titles.length, `tópico repetido em "${d.title}"`);
    }
  });
  test(`modelo ${id}: cada linha traz a fonte (notas)`, () => {
    const rows = fs.readFileSync(path.join(DIR, f), 'utf8').split(/\r?\n/).slice(1).filter(Boolean);
    assert.ok(rows.every((r) => /edital|planilha|programa|áreas|Módulo|referência/i.test(r)), 'alguma linha sem fonte');
  });
}