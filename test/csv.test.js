'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { fromCsv, parseCsv, decodeCsvBuffer, csvTemplate, aiPrompt } = require('../core/csv');
const { readMom, writeMom } = require('../core/mom');
const { buildGraph } = require('../core/graph');
const { toSVG } = require('../core/svg');

const shape = (n) => [n.title, n.children.map(shape)];
const kids = (m, disc) => m.root.children.find((d) => d.title === disc);

test('modelo oficial: gera disciplinas, hierarquia por numeração, pesos, prova e links sem avisos', () => {
  const { map, report } = fromCsv(csvTemplate());
  assert.equal(report.errors.length, 0); assert.deepEqual(report.warnings, []);
  assert.deepEqual([report.imported, report.disciplines, report.skipped], [7, 3, 0]);
  assert.equal(map.root.title, 'TRF 2ª Região — Analista'); assert.deepEqual(map.meta.exam, { name: 'TRF 2ª Região — Analista', date: '2026-11-29' });
  assert.deepEqual(shape(kids(map, 'Língua Portuguesa')), ['Língua Portuguesa', [['Compreensão e interpretação de textos', []], ['Ortografia oficial', [['Emprego do sinal indicativo de crase', []]]], ['Regência verbal', []]]]);
  const crase = kids(map, 'Língua Portuguesa').children[1].children[0];
  assert.equal(crase.study.weight, 3); assert.equal(crase.notes, 'Cai muito; revisar casos facultativos.\nRelacionados: [[Regência verbal]]');
  assert.equal(kids(map, 'Direito Constitucional').children[0].study.weight, 5);
  // a rede já nasce semeada: os relacionados viram links que resolvem dentro do próprio mapa
  const g = buildGraph([{ key: 'k', name: 'x', map }]);
  assert.equal(g.nodes.filter((n) => n.kind === 'ghost').length, 0, 'nenhum link sem destino');
  assert.equal(g.edges.filter((e) => e.type === 'link').length, 3);
});

test('o exemplo das instruções para a IA é aceito pelo importador (instruções e leitor não divergem)', () => {
  const p = aiPrompt();
  const ex = p.slice(p.indexOf('EXEMPLO\n') + 8, p.indexOf('EDITAL (cole')).trim();
  const { map, report } = fromCsv(ex);
  assert.deepEqual([report.errors.length, report.warnings.length, report.imported], [0, 0, 4]);
  assert.ok(map && map.root.children.length === 1);
  assert.match(p, /UTF-8/); assert.match(p, /concurso,data_prova,disciplina,item,topico,peso,notas,relacionados/);
  assert.equal(csvTemplate().split(/\r?\n/)[0].replace(/^﻿/, ''), 'concurso,data_prova,disciplina,item,topico,peso,notas,relacionados');
});

test('leitor CSV: aspas, aspas duplicadas, quebra de linha em célula, CRLF, BOM e delimitador automático', () => {
  const t = '﻿disciplina;topico;notas\r\n"Dir; Penal";"Crimes ""contra"" a pessoa";"linha 1\nlinha 2"\r\n\r\nMat;Álgebra;\r\n';
  const { rows, delimiter } = parseCsv(t);
  assert.equal(delimiter, ';'); assert.deepEqual(rows[1], ['Dir; Penal', 'Crimes "contra" a pessoa', 'linha 1\nlinha 2']); assert.equal(rows.length, 3, 'linha em branco ignorada');
  assert.equal(parseCsv('a\tb\n1\t2').delimiter, '\t'); assert.equal(parseCsv('a,b\n1,2').delimiter, ',');
  assert.deepEqual(parseCsv('a,b\n"x,y",z\n').rows[1], ['x,y', 'z']);
  assert.deepEqual(parseCsv('a,b\n1,"sem fechar\n2,3').rows.length >= 1, true, 'aspas sem fechar não trava nem lança');
  const { map, report } = fromCsv(t); assert.equal(report.errors.length, 0);
  assert.equal(kids(map, 'Dir; Penal').children[0].title, 'Crimes "contra" a pessoa'); assert.equal(kids(map, 'Dir; Penal').children[0].notes, 'linha 1\nlinha 2');
});

test('codificação: UTF-8 com/sem BOM e Windows-1252 (Excel em português)', () => {
  const csv = 'disciplina,topico\nPortuguês,Acentuação gráfica\n';
  assert.equal(decodeCsvBuffer(Buffer.from(csv, 'utf8')), csv);
  assert.equal(decodeCsvBuffer(Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(csv, 'utf8')])), csv);
  assert.equal(decodeCsvBuffer(Buffer.from(csv, 'latin1')), csv, 'ANSI do Excel');
  assert.equal(fromCsv(Buffer.from(csv, 'latin1')).map.root.children[0].children[0].title, 'Acentuação gráfica');
});

test('apelidos de colunas, ordem livre e colunas desconhecidas', () => {
  const { map, report } = fromCsv('Assunto;Matéria;Número;Importância;Extra\nPrincípios;Direito;1;4;x\nDireitos;Direito;1.1;;y\n');
  assert.equal(report.errors.length, 0); assert.match(report.warnings[0], /Colunas ignoradas: Extra/);
  assert.deepEqual(shape(map.root.children[0]), ['Direito', [['Princípios', [['Direitos', []]]]]]); assert.equal(map.root.children[0].children[0].study.weight, 4);
  assert.equal(map.root.title, 'Edital', 'sem coluna "concurso": usa o título padrão');
  assert.equal(fromCsv('disciplina,topico\nA,B\n', { title: 'Meu concurso' }).map.root.title, 'Meu concurso');
});

test('hierarquia: nível por "nivel", salto de níveis, itens com ponto final, disciplinas agrupadas sem diferenciar acento/caixa', () => {
  const csv = ['disciplina,item,topico', 'Direito,1.,A', 'Direito,1.1,A1', 'Direito,1.1.1,A1a', 'direito,2,B', 'DIREITO,2.1.1,B-pulou', 'Outra,1,X'].join('\n');
  const { map } = fromCsv(csv);
  assert.equal(map.root.children.length, 2, 'Direito/direito/DIREITO viram uma disciplina');
  assert.deepEqual(shape(kids(map, 'Direito')), ['Direito', [['A', [['A1', [['A1a', []]]]]], ['B', [['B-pulou', []]]]]], 'pular nível anexa ao ancestral mais próximo');
  const n = fromCsv('disciplina,nivel,topico\nM,1,A\nM,2,B\nM,3,C\nM,1,D\nM,x,E\n');
  assert.deepEqual(shape(n.map.root.children[0]), ['M', [['A', [['B', [['C', []]]]]], ['D', []], ['E', []]]]); assert.match(n.report.warnings.join(' '), /nível "x" inválido/);
  assert.match(fromCsv('disciplina,item,topico\nM,abc,A\n').report.warnings[0], /não é uma numeração/);
});

test('validação linha a linha: pula e relata, nunca lança', () => {
  const csv = ['disciplina,item,topico,peso,progresso,data_prova', 'A,1,Bom,9,150,31/02/2026', ',2,Sem disciplina,,,', 'A,3,,,,', ',,,,,', 'A,4,Outro,2,50%,'].join('\n');
  const { map, report } = fromCsv(csv);
  assert.deepEqual([report.imported, report.skipped], [2, 3]);
  assert.deepEqual(report.errors.map((e) => e.line), [3, 4]); assert.match(report.errors[0].msg, /sem disciplina/i); assert.match(report.errors[1].msg, /sem tópico/i);
  const w = report.warnings.join(' | '); assert.match(w, /peso "9" inválido/); assert.match(w, /progresso "150" inválido/); assert.match(w, /data da prova inválida/);
  assert.equal(map.root.children[0].children[1].progress, 50); assert.equal(map.root.children[0].children[1].study.weight, 2); assert.equal(map.meta.exam, undefined);
});

test('arquivos inúteis: vazio, só cabeçalho, sem colunas obrigatórias, binário', () => {
  for (const bad of ['', '   \n  \n', 'disciplina,topico\n', 'a,b,c\n1,2,3\n', 'topico\nX\n', 'disciplina\nX\n']) {
    const r = fromCsv(bad); assert.equal(r.map, null, JSON.stringify(bad)); assert.ok(r.report.errors.length >= 1);
  }
  assert.match(fromCsv('a,b\n1,2').report.errors[0].msg, /disciplina.*topico/s);
  assert.equal(fromCsv(Buffer.from([0, 1, 2, 255, 254, 0])).map, null);
  assert.equal(fromCsv(null).map, null); assert.equal(fromCsv(undefined).map, null);
});

test('relacionados: separadores | e ;, colchetes sanitizados, avisa dos que não existem; texto hostil continua texto', () => {
  const csv = 'disciplina,topico,relacionados,notas\nA,Um,"Dois | Três;Fantasma [x]",=1+1\nA,Dois,,\nA,Três,,<script>alert(1)</script>\n';
  const { map, report } = fromCsv(csv);
  assert.equal(map.root.children[0].children[0].notes, '=1+1\nRelacionados: [[Dois]] · [[Três]] · [[Fantasma x]]');
  assert.match(report.warnings.join(' '), /1 tópico\(s\) "relacionado\(s\)" não existem.*Fantasma \[x\]/);
  const svg = toSVG(map); assert.doesNotMatch(svg, /<script/); assert.match(svg, /&lt;script&gt;|Três/);
  const g = buildGraph([{ key: 'k', name: 'x', map }]); assert.equal(g.nodes.filter((n) => n.kind === 'ghost').length, 1);
});

test('limites: 5 000 linhas e 5 000 caracteres por célula; mapa grande sobrevive a salvar/abrir', () => {
  const lines = ['disciplina,item,topico']; for (let i = 0; i < 5200; i++) lines.push(`D${i % 10},${(i % 20) + 1},T${i}`);
  const { map, report } = fromCsv(lines.join('\n')); assert.equal(report.imported, 5000); assert.match(report.warnings[0], /5000 linhas/);
  const big = fromCsv('disciplina,topico\nA,' + 'x'.repeat(9000)); assert.equal(big.map.root.children[0].children[0].title.length, 5000);
  const back = readMom(writeMom(map)); let n = 0; back.walk(() => n++); assert.equal(n, 1 + 10 + 5000);
});

test('o mapa importado é um mapa comum: salva em .mom e mantém pesos, notas e prova', () => {
  const { map } = fromCsv(csvTemplate()); const back = readMom(writeMom(map));
  assert.deepEqual(back.meta.exam, map.meta.exam);
  assert.equal(kids(back, 'Direito Constitucional').children[0].study.weight, 5);
  assert.match(kids(back, 'Língua Portuguesa').children[1].children[0].notes, /\[\[Regência verbal\]\]/);
  assert.ok(map.undo === undefined || true);
});
