'use strict';
// CSV COLADO (resposta de uma IA/chat, planilha, e-mail): limpeza antes de ler e prévia igual à do arquivo.
const test = require('node:test');
const assert = require('node:assert/strict');
const { fromCsv, cleanPasted } = require('../core/csv');
const { diffPlan, exportPlan } = require('../core/planner');
const { MindMap, createNode } = require('../core/model');

const FENCE = '`'.repeat(3);
const CSV = 'concurso,data_prova,disciplina,item,topico,peso\nTRF 2026,2026-12-01,Direito Penal,1,Crimes contra a pessoa,3\n,,Direito Penal,1.1,Dolo,2\n,,Direito Civil,1,Contratos,4';

test('CSV puro colado funciona como o arquivo (sem avisos de limpeza)', () => {
  const r = fromCsv(CSV); assert.equal(r.report.imported, 3); assert.equal(r.report.disciplines, 2); assert.deepEqual(r.report.warnings, []); assert.equal(r.map.root.title, 'TRF 2026');
});

test('resposta da IA com bloco de código e frases antes/depois: só o CSV é lido', () => {
  const txt = `Claro! Aqui está o CSV do edital:\n\n${FENCE}csv\n${CSV}\n${FENCE}\n\nSe precisar de ajustes, é só pedir.`;
  const r = fromCsv(txt); assert.equal(r.report.imported, 3); assert.equal(r.report.errors.length, 0); assert.match(r.report.warnings.join(' '), /marcações de código/);
  assert.equal(cleanPasted(txt).text, CSV, 'nada de frases soltas virando linhas');
});

test('bloco de código sem fechar (resposta cortada) e com ```csv na 1ª linha também funcionam', () => {
  const r = fromCsv(`${FENCE}csv\n${CSV}`); assert.equal(r.report.imported, 3);
});

test('tabela Markdown do chat vira CSV (traços ignorados, vírgulas dentro das células preservadas, | escapado)', () => {
  const t = 'Segue a tabela:\n\n| disciplina | item | tópico | peso |\n|---|:---:|---|---|\n| Civil | 1 | Contratos, parte geral | 3 |\n| Civil | 1.1 | Vícios \\| defeitos | 2 |\n';
  const r = fromCsv(t); assert.equal(r.report.imported, 2); assert.match(r.report.warnings.join(' '), /tabela/);
  const civil = r.map.root.children[0]; assert.equal(civil.children[0].title, 'Contratos, parte geral'); assert.equal(civil.children[0].children[0].title, 'Vícios | defeitos');
});

test('texto antes do cabeçalho é ignorado; cabeçalho com acento e ponto e vírgula (Excel pt-BR) também', () => {
  const r = fromCsv('Veja abaixo:\nDisciplina;Item;Tópico;Peso\nPenal;1;Dolo;3'); assert.equal(r.report.imported, 1); assert.match(r.report.warnings.join(' '), /antes do cabeçalho/);
});

test('espaço não separável, BOM e quebras de linha do Windows não atrapalham', () => {
  const r = fromCsv('﻿disciplina,topico\r\nPenal,Dolo eventual\r\n'); assert.equal(r.report.imported, 1); assert.equal(r.map.root.children[0].children[0].title, 'Dolo eventual');
});

test('lixo colado não quebra: vazio e texto sem cabeçalho dão mensagem clara, sem lançar erro', () => {
  assert.equal(fromCsv('').map, null); assert.match(fromCsv('   \n  ').report.errors[0].msg, /vazio/);
  const r = fromCsv('isto não é um csv de edital'); assert.equal(r.map, null); assert.match(r.report.errors[0].msg, /disciplina/);
  assert.doesNotThrow(() => fromCsv(FENCE + FENCE + FENCE)); assert.doesNotThrow(() => cleanPasted(null));
});

test('arquivo (Buffer) NÃO passa pela limpeza de texto colado: o comportamento do arquivo não muda', () => {
  const r = fromCsv(Buffer.from(CSV)); assert.deepEqual(r.report.warnings, []);
});

test('planilha de planejamento colada: lê o texto copiado do Excel (tabulações) e aceita bloco de código', () => {
  const m = new MindMap(createNode('Plano')); const d = m.addChild(m.root.id, 'Penal'); m.addChild(d.id, 'Dolo');
  const csv = exportPlan(m, { today: '2026-10-18' }); const lines = csv.split(/\r?\n/).filter(Boolean);
  const hdr = lines[0].split(/[,;]/); assert.ok(hdr.includes('peso'), 'cabeçalho da planilha tem peso');
  const direct = diffPlan(m, csv, { today: '2026-10-18' }); assert.equal(direct.errors.length, 0);
  const wrapped = diffPlan(m, `Aqui:\n${FENCE}\n${csv}\n${FENCE}\nfim`, { today: '2026-10-18' }); assert.equal(wrapped.errors.length, 0); assert.match(wrapped.warnings.join(' '), /marcações de código/);
});
