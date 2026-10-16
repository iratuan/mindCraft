'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { exportPlan, diffPlan, applyPlan, COLUMNS } = require('../core/planner');
const { parseCsv } = require('../core/csv');
const { readMom, writeMom } = require('../core/mom');
const { fromCsv, csvTemplate } = require('../core/csv');
const S = require('../core/study');

const TODAY = '2026-10-20';
const mk = () => fromCsv(csvTemplate()).map;
const find = (m, title) => { let r; m.walk((n) => { if (n.title === title) r = n; }); return r; };
/** simula a edição na planilha: troca o valor de uma coluna na linha do tópico */
function edit(csv, title, changes) {
  const { rows } = parseCsv(csv); const h = rows[0], ti = h.indexOf('topico');
  for (const r of rows.slice(1)) if (r[ti] === title) for (const [k, v] of Object.entries(changes)) r[h.indexOf(k)] = v;
  return '﻿' + rows.map((r) => r.map((c) => (/[";\r\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c)).join(';')).join('\r\n') + '\r\n';
}
const snap = (m) => JSON.stringify({ r: m.root, x: m.meta });

test('exportar: cabeçalho, uma linha por tópico (+ raiz), códigos seguros, BOM e ";" para o Excel', () => {
  const m = mk(); const csv = exportPlan(m, { today: TODAY });
  assert.ok(csv.startsWith('﻿') && csv.includes('\r\n'));
  const { rows, delimiter } = parseCsv(csv); assert.equal(delimiter, ';'); assert.deepEqual(rows[0], COLUMNS);
  assert.equal(rows.length, 1 + 1 + 10, 'cabeçalho + raiz + 3 disciplinas + 7 tópicos');
  assert.ok(rows.slice(1).every((r) => /^t-[0-9a-f]{10}$/.test(r[0])), 'código curto com prefixo (o Excel não o converte em número)');
  const crase = rows.find((r) => r[3] === 'Emprego do sinal indicativo de crase'); assert.deepEqual([crase[1], crase[2], crase[4]], ['Língua Portuguesa', '1.2.1', '3']);
  assert.equal(rows[1][13], '2026-11-29', 'data da prova na linha da raiz');
});

test('exportar só uma disciplina; id inexistente falha com mensagem', () => {
  const m = mk(); const d = m.root.children[1];
  const { rows } = parseCsv(exportPlan(m, { today: TODAY, rootId: d.id }));
  assert.ok(rows.slice(1).every((r) => r[1] === d.title)); let cnt = 0; d.children.forEach(function w(n) { cnt += 1; n.children.forEach(w); }); assert.equal(rows.length, 1 + 1 + cnt);
  assert.throws(() => exportPlan(m, { rootId: 'nada' }), /não encontrado/);
});

test('ida e volta sem editar: nenhuma mudança (idempotente) e o mapa fica idêntico', () => {
  const m = mk(); const before = snap(m);
  const d = diffPlan(m, exportPlan(m, { today: TODAY }), { today: TODAY });
  assert.deepEqual([d.changes.length, d.errors.length, d.warnings.length, d.ops.length], [0, 0, 0, 0]);
  assert.equal(d.stats.matched, 11); assert.equal(snap(m), before);
});

test('editar na planilha atualiza o mapa: título, peso, progresso, notas, próxima revisão, prova — 1 desfazer', () => {
  const m = mk(); const csv0 = exportPlan(m, { today: TODAY });
  let csv = edit(csv0, 'Regência verbal', { topico: 'Regência verbal e nominal', peso: '4', progresso: '60%', proxima_revisao: '25/10/2026', notas: 'Revisar "a" e "em".\nVer exercícios' });
  csv = edit(csv, 'TRF 2ª Região — Analista', { data_prova: '15/12/2026' });
  const d = diffPlan(m, csv, { today: TODAY });
  assert.deepEqual(d.errors, []); assert.deepEqual(d.warnings, []);
  assert.deepEqual(d.changes.map((c) => c.field).sort(), ['data da prova', 'notas', 'peso', 'progresso', 'próxima revisão', 'tópico'].sort());
  const undoBefore = m._undo.length;
  assert.equal(applyPlan(m, d), 6);
  const n = find(m, 'Regência verbal e nominal');
  assert.deepEqual([n.study.weight, n.progress, n.study.next, n.notes], [4, 60, '2026-10-25', 'Revisar "a" e "em".\nVer exercícios']);
  assert.equal(m.meta.exam.date, '2026-12-15');
  assert.equal(m._undo.length, undoBefore + 1, 'uma única entrada de desfazer');
  assert.ok(m.undo()); assert.equal(find(m, 'Regência verbal').study.weight, 3); assert.equal(m.meta.exam.date, '2026-11-29');
});

test('tempo e questões: totais acrescentam a diferença a hoje; reimportar não duplica; valor menor é recusado', () => {
  const m = mk(); const csv0 = exportPlan(m, { today: TODAY });
  const csv = edit(csv0, 'Regência verbal', { tempo_total_min: '90', questoes_total: '20', acertos_total: '15' });
  const d = diffPlan(m, csv, { today: TODAY }); assert.deepEqual(d.errors.concat(d.warnings), []); applyPlan(m, d);
  const n = find(m, 'Regência verbal');
  assert.deepEqual([S.totalMinutes(n.study), n.study.log[TODAY], n.study.q, n.study.qlog[TODAY]], [90, 90, { done: 20, correct: 15 }, { done: 20, correct: 15 }]);
  const again = diffPlan(m, csv, { today: TODAY }); assert.equal(again.changes.length, 0, 'mesma planilha de novo: nada a fazer');
  const less = diffPlan(m, edit(csv0, 'Regência verbal', { tempo_total_min: '30', questoes_total: '5', acertos_total: '2' }), { today: TODAY });
  assert.equal(less.changes.length, 0); assert.match(less.warnings.join(' '), /menor que o já registrado/); assert.match(less.warnings.join(' '), /menores que as registradas/);
  const bad = diffPlan(m, edit(csv0, 'Ortografia oficial', { questoes_total: '10', acertos_total: '12' }), { today: TODAY }); assert.match(bad.warnings.join(' '), /maiores que questões/);
  const day = diffPlan(m, edit(csv0, 'Princípios da Administração Pública', { tempo_total_min: '2000' }), { today: TODAY }); assert.match(day.warnings.join(' '), /24 h/);
});

test('"revisou hoje": sim agenda a próxima revisão pelo intervalo; errei volta ao início; repetir não infla', () => {
  const m = mk(); const csv0 = exportPlan(m, { today: TODAY });
  const d = diffPlan(m, edit(csv0, 'Regência verbal', { revisou_hoje: 'sim' }), { today: TODAY }); applyPlan(m, d);
  const n = find(m, 'Regência verbal'); assert.deepEqual([n.study.stage, n.study.next, n.study.last], [0, '2026-10-21', TODAY]);
  const csv1 = exportPlan(m, { today: TODAY }); assert.ok(parseCsv(csv1).rows.some((r) => r[3] === 'Regência verbal' && r[7] === 'sim'), 'exporta "sim" no dia');
  assert.equal(diffPlan(m, csv1, { today: TODAY }).changes.length, 0, 'reimportar no mesmo dia não muda nada');
  assert.match(diffPlan(m, edit(csv0, 'Princípios da Administração Pública', { revisou_hoje: 'talvez' }), { today: TODAY }).warnings[0], /valor desconhecido/);
  const e = diffPlan(m, edit(csv0, 'Regência verbal', { revisou_hoje: 'errei' }), { today: TODAY }); applyPlan(m, e); assert.equal(find(m, 'Regência verbal').study.reviews.at(-1).ok, false);
});

test('próxima revisão: data explícita vence a automática; "-" remove; inválida avisa', () => {
  const m = mk(); const csv0 = exportPlan(m, { today: TODAY });
  applyPlan(m, diffPlan(m, edit(csv0, 'Regência verbal', { revisou_hoje: 'sim', proxima_revisao: '2026-11-01' }), { today: TODAY }));
  assert.equal(find(m, 'Regência verbal').study.next, '2026-11-01');
  applyPlan(m, diffPlan(m, edit(exportPlan(m, { today: TODAY }), 'Regência verbal', { proxima_revisao: '-' }), { today: TODAY })); assert.equal(find(m, 'Regência verbal').study.next, null);
  assert.match(diffPlan(m, edit(csv0, 'Princípios da Administração Pública', { proxima_revisao: '31/02/2026' }), { today: TODAY }).warnings[0], /inválida/);
});

test('células em branco não apagam nada; remover linhas da planilha não apaga tópicos', () => {
  const m = mk(); find(m, 'Princípios da Administração Pública').notes = 'minha nota'; find(m, 'Princípios da Administração Pública').progress = 40; const before = snap(m);
  const { rows } = parseCsv(exportPlan(m, { today: TODAY })); const h = rows[0];
  const blank = rows.filter((r) => r[3] === 'Princípios da Administração Pública').map((r) => { const c = [...r]; for (const k of ['peso', 'progresso', 'notas', 'proxima_revisao', 'tempo_total_min']) c[h.indexOf(k)] = ''; return c; });
  const csv = [h, ...blank].map((r) => r.join(';')).join('\r\n');
  const d = diffPlan(m, csv, { today: TODAY }); assert.deepEqual([d.changes.length, d.errors.length], [0, 0]); applyPlan(m, d); assert.equal(snap(m), before);
});

test('o que o Excel faz: datas DD/MM/AAAA, vírgula decimal, ANSI (Windows-1252), CRLF e aspas', () => {
  const m = mk(); const csv0 = exportPlan(m, { today: TODAY });
  const csv = edit(csv0, 'Princípios da Administração Pública', { topico: 'Princípios - endereçamento', progresso: '33,6', proxima_revisao: '5/11/2026' });
  const d = diffPlan(m, Buffer.from(csv.replace('﻿', ''), 'latin1'), { today: TODAY }); assert.deepEqual(d.errors.concat(d.warnings), []);
  applyPlan(m, d); const n = find(m, 'Princípios - endereçamento'); assert.deepEqual([n.progress, n.study.next], [34, '2026-11-05']);
});

test('fórmulas: textos que começam com = + - @ são protegidos na exportação e voltam intactos', () => {
  const m = mk(); { const q = find(m, 'Princípios da Administração Pública'); q.title = '=SOMA(A1)'; q.notes = '-cuidado'; }
  const csv = exportPlan(m, { today: TODAY }); const { rows } = parseCsv(csv);
  const r = rows.find((x) => x[3].includes('SOMA')); assert.equal(r[3], "'=SOMA(A1)"); assert.equal(r[12], "'-cuidado");
  assert.equal(diffPlan(m, csv, { today: TODAY }).changes.length, 0, 'ida e volta sem mudanças');
});

test('tópicos novos: entram sob a disciplina (cria se faltar), sem duplicar; sem disciplina é erro', () => {
  const m = mk(); const csv0 = exportPlan(m, { today: TODAY });
  const add = ['', 'Língua Portuguesa', '', 'Concordância nominal', '3', '25', '2026-10-30', '', '', '', '', '', 'cai muito', ''];
  const add2 = ['', 'Matemática', '', 'Porcentagem', '2', '', '', '', '', '', '', '', '', ''];
  const bad = ['', '', '', 'Órfão', '', '', '', '', '', '', '', '', '', ''];
  const csv = csv0 + [add, add, add2, bad].map((r) => r.join(';')).join('\r\n') + '\r\n';
  const d = diffPlan(m, csv, { today: TODAY });
  assert.equal(d.stats.created, 2); assert.match(d.warnings.join(' '), /já existe/); assert.match(d.errors[0].msg, /sem disciplina/);
  applyPlan(m, d);
  const lp = m.root.children.find((x) => x.title === 'Língua Portuguesa'); const n = lp.children.find((x) => x.title === 'Concordância nominal');
  assert.deepEqual([n.study.weight, n.progress, n.study.next, n.notes], [3, 25, '2026-10-30', 'cai muito']);
  assert.equal(m.root.children.find((x) => x.title === 'Matemática').children[0].title, 'Porcentagem');
  assert.equal(diffPlan(m, csv, { today: TODAY }).stats.created, 0, 'reimportar não duplica');
});

test('planilha de outro mapa, vazia, sem colunas ou lixo: erro claro e o mapa não muda', () => {
  const m = mk(), other = fromCsv(csvTemplate()).map; const before = snap(m);
  assert.match(diffPlan(m, exportPlan(other, { today: TODAY }), { today: TODAY }).errors.map((e) => e.msg).join(' '), /não existe neste mapa|Nenhuma linha/);
  for (const bad of ['', 'a;b\n1;2\n', Buffer.from([0, 255, 1, 2]), null, 'id;topico\nt-0000000000;x\n']) {
    const d = diffPlan(m, bad, { today: TODAY }); assert.ok(d.errors.length >= 1, String(bad)); assert.equal(applyPlan(m, d) >= 0, true);
  }
  assert.equal(snap(m), before);
});

test('progresso de tópico com subtópicos é ignorado com aviso; progresso fora de 0–100 também', () => {
  const m = mk(); const csv0 = exportPlan(m, { today: TODAY });
  assert.match(diffPlan(m, edit(csv0, 'Ortografia oficial', { progresso: '50' }), { today: TODAY }).warnings[0], /subtópicos/);
  assert.match(diffPlan(m, edit(csv0, 'Princípios da Administração Pública', { progresso: '150', peso: '9' }), { today: TODAY }).warnings.join(' '), /progresso "150" inválido/);
});

test('nada é aplicado pela prévia; falha no meio de applyPlan desfaz tudo', () => {
  const m = mk(); const before = snap(m);
  const d = diffPlan(m, edit(exportPlan(m, { today: TODAY }), 'Princípios da Administração Pública', { peso: '5', progresso: '10' }), { today: TODAY });
  assert.equal(snap(m), before, 'diffPlan não altera o mapa'); assert.equal(d.changes.length, 2);
  d.ops.push(() => { throw new Error('falha simulada'); });
  assert.throws(() => applyPlan(m, d), /falha simulada/); assert.equal(snap(m), before, 'tudo ou nada');
});

test('o mapa continua válido ao salvar/abrir depois de aplicar uma planilha grande', () => {
  const m = mk(); let csv = exportPlan(m, { today: TODAY });
  const { rows } = parseCsv(csv); const h = rows[0];
  for (const r of rows.slice(1)) { r[h.indexOf('peso')] = '5'; r[h.indexOf('notas')] = 'ç ã é "x"; y\nlinha 2'; }
  csv = rows.map((r) => r.map((c) => (/[";\r\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c)).join(';')).join('\r\n');
  applyPlan(m, diffPlan(m, csv, { today: TODAY })); const back = readMom(writeMom(m));
  assert.equal(find(back, 'Princípios da Administração Pública').notes, 'ç ã é "x"; y\nlinha 2'); assert.equal(find(back, 'Princípios da Administração Pública').study.weight, 5);
});
