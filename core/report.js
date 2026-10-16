'use strict';
const { summary, todayStr, parseDate, ERR_REASONS, WEAK_MIN: S_WEAK_MIN, WEAK_ACCURACY: S_WEAK_ACC } = require('./study');

const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min` : `${m} min`);
const fmtPct = (v) => (v == null ? '—' : `${Math.round(v * 10) / 10}%`.replace('.', ','));
const fmtDate = (s) => { const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; };
const acc = (a) => (a == null ? '—' : fmtPct(a * 100));

/** Dados do relatório (mesma fonte do painel: nunca diverge dos números da tela). */
function buildReport(map, { today = todayStr() } = {}) {
  const s = summary(map, { today });
  return { title: map.root.title, s, today };
}

function examLine(s) {
  if (!s.exam) return null;
  const n = s.exam.daysLeft;
  const when = n > 0 ? `faltam ${n} dia${n === 1 ? '' : 's'}` : n === 0 ? 'é hoje' : `foi há ${-n} dia${n === -1 ? '' : 's'}`;
  return `${s.exam.name || 'Prova'} — ${fmtDate(s.exam.date)} (${when})`;
}

function toStudyMarkdown(map, opts = {}) {
  const { title, s, today } = buildReport(map, opts);
  const o = [`# Relatório de estudos — ${title}`, '', `Gerado em ${fmtDate(today)}`, ''];
  const ex = examLine(s);
  if (ex) o.push(`**Prova:** ${ex}`, '');
  o.push('## Resumo', '',
    `- Progresso geral: **${fmtPct(s.overall)}** (${s.doneLeaves} de ${s.totalLeaves} tópicos concluídos)`,
    `- Tempo estudado: ${fmtMin(s.minutes.total)} no total · ${fmtMin(s.minutes.week)} nos últimos 7 dias · ${fmtMin(s.minutes.today)} hoje`,
    `- Questões: ${s.questions.done} feitas, ${s.questions.correct} acertos (${acc(s.questions.accuracy)})${s.questions.week.done ? ` · últimos 7 dias: ${s.questions.week.correct}/${s.questions.week.done} (${acc(s.questions.week.accuracy)})` : ''}`,
    `- Sequência de estudo: ${s.streak} dia${s.streak === 1 ? '' : 's'}`);
  if (s.plan) o.push(`- Plano: ${s.plan.pendingTopics} tópicos pendentes em ${s.plan.daysLeft} dias ≈ **${String(s.plan.topicsPerDay).replace('.', ',')} tópicos/dia**`);
  o.push('', '## Por disciplina', '', '| Disciplina | Progresso | Tópicos | Tempo | Questões (acerto) | Revisões pendentes |', '|---|---:|---:|---:|---:|---:|');
  for (const d of s.disciplines) o.push(`| ${d.title.replace(/\|/g, '\\|')} | ${fmtPct(d.progress)} | ${d.done}/${d.leaves} | ${fmtMin(d.minutes)} | ${d.qDone ? `${d.qOk}/${d.qDone} (${acc(d.accuracy)})` : '—'} | ${d.due} |`);
  o.push('', `## Revisões pendentes (${s.due.length})`, '');
  if (!s.due.length) o.push('Nenhuma revisão pendente. ✔');
  for (const r of s.due) o.push(`- ${r.path.join(' › ')}${r.path.length ? ' › ' : ''}${r.title} — prevista para ${fmtDate(r.next)}${r.overdue > 0 ? ` (**${r.overdue} dia${r.overdue === 1 ? '' : 's'} de atraso**)` : ' (hoje)'}`);
  { const sim = require('./simulados'), st = sim.simuladoStats(map.meta.simulados || []);
    o.push('', `## Simulados (${st.count})`, '');
    if (!st.count) o.push('Nenhum simulado registrado.');
    else { o.push(`Média ${acc(st.avg / 100)} · melhor ${acc(st.best.pct / 100)} (${st.best.name}) · último ${acc(st.last.pct / 100)}`, ''); for (const x of st.series) o.push(`- ${fmtDate(x.d)} — ${x.name}${x.banca ? ' (' + x.banca + ')' : ''}: ${x.correct}/${x.done} (${acc(x.pct / 100)})`); o.push('', 'Disciplinas (mais fracas primeiro): ' + st.discs.map((d) => `${d.disc} ${acc(d.pct / 100)}`).join(' · ')); } }
  o.push('', `## Caderno de erros (${s.errors.total})`, '');
  if (!s.errors.total) o.push('Nenhum erro registrado.');
  else {
    o.push(Object.entries(s.errors.byWhy).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${ERR_REASONS[k]}: ${n}`).join(' · '), '');
    for (const e of s.errors.recent) o.push(`- ${[...e.path, e.title].join(' › ')} — ${ERR_REASONS[e.why]} (${fmtDate(e.d)})${e.note ? ': ' + e.note : ''}`);
  }
  o.push('', `## Pontos fracos (≥ ${S_WEAK_MIN} questões e acerto < ${Math.round(S_WEAK_ACC * 100)}%)`, '');
  if (!s.weak.length) o.push('Nenhum ponto fraco identificado.');
  for (const w of s.weak) o.push(`- ${[...w.path, w.title].join(' › ')} — ${w.correct}/${w.done} (${acc(w.accuracy)})`);
  o.push('', '## Próximos 7 dias', '');
  if (!s.upcoming.length) o.push('Nenhuma revisão agendada.');
  for (const r of s.upcoming) o.push(`- ${fmtDate(r.next)} — ${r.path.join(' › ')}${r.path.length ? ' › ' : ''}${r.title}`);
  return o.join('\n') + '\n';
}

async function toStudyDOCX(map, opts = {}) {
  const docx = require('docx'); // sob demanda: só o processo principal gera Word
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } = docx;
  const { title, s, today } = buildReport(map, opts);
  const P = (text, o = {}) => new Paragraph({ children: [new TextRun({ text, ...o })] });
  const cell = (text, o = {}) => new TableCell({ children: [new Paragraph({ alignment: o.right ? AlignmentType.RIGHT : AlignmentType.LEFT, children: [new TextRun({ text: String(text), bold: !!o.bold })] })] });
  const kids = [new Paragraph({ text: `Relatório de estudos — ${title}`, heading: HeadingLevel.TITLE }), P(`Gerado em ${fmtDate(today)}`, { italics: true })];
  const ex = examLine(s);
  if (ex) kids.push(P(`Prova: ${ex}`, { bold: true }));
  kids.push(new Paragraph({ text: 'Resumo', heading: HeadingLevel.HEADING_1 }),
    P(`Progresso geral: ${fmtPct(s.overall)} (${s.doneLeaves} de ${s.totalLeaves} tópicos concluídos)`),
    P(`Tempo estudado: ${fmtMin(s.minutes.total)} no total · ${fmtMin(s.minutes.week)} nos últimos 7 dias · ${fmtMin(s.minutes.today)} hoje`),
    P(`Questões: ${s.questions.done} feitas, ${s.questions.correct} acertos (${acc(s.questions.accuracy)})`),
    P(`Sequência de estudo: ${s.streak} dia${s.streak === 1 ? '' : 's'}`));
  if (s.plan) kids.push(P(`Plano: ${s.plan.pendingTopics} tópicos pendentes em ${s.plan.daysLeft} dias ≈ ${String(s.plan.topicsPerDay).replace('.', ',')} tópicos/dia`, { bold: true }));
  kids.push(new Paragraph({ text: 'Por disciplina', heading: HeadingLevel.HEADING_1 }));
  const head = ['Disciplina', 'Progresso', 'Tópicos', 'Tempo', 'Questões (acerto)', 'Revisões'];
  kids.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ tableHeader: true, children: head.map((h) => cell(h, { bold: true })) }),
      ...s.disciplines.map((d) => new TableRow({ children: [cell(d.title), cell(fmtPct(d.progress), { right: true }), cell(`${d.done}/${d.leaves}`, { right: true }), cell(fmtMin(d.minutes), { right: true }), cell(d.qDone ? `${d.qOk}/${d.qDone} (${acc(d.accuracy)})` : '—', { right: true }), cell(d.due, { right: true })] }))],
  }));
  kids.push(new Paragraph({ text: `Revisões pendentes (${s.due.length})`, heading: HeadingLevel.HEADING_1 }));
  if (!s.due.length) kids.push(P('Nenhuma revisão pendente.'));
  for (const r of s.due) kids.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: `${[...r.path, r.title].join(' › ')} — prevista para ${fmtDate(r.next)}${r.overdue > 0 ? ` (${r.overdue} dia${r.overdue === 1 ? '' : 's'} de atraso)` : ' (hoje)'}` })] }));
  kids.push(new Paragraph({ text: `Caderno de erros (${s.errors.total})`, heading: HeadingLevel.HEADING_1 }));
  if (!s.errors.total) kids.push(P('Nenhum erro registrado.'));
  for (const e of s.errors.recent) kids.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: `${[...e.path, e.title].join(' › ')} — ${ERR_REASONS[e.why]} (${fmtDate(e.d)})${e.note ? ': ' + e.note : ''}` })] }));
  kids.push(new Paragraph({ text: 'Pontos fracos', heading: HeadingLevel.HEADING_1 }));
  if (!s.weak.length) kids.push(P('Nenhum ponto fraco identificado.'));
  for (const w of s.weak) kids.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: `${[...w.path, w.title].join(' › ')} — ${w.correct}/${w.done} (${acc(w.accuracy)})` })] }));
  kids.push(new Paragraph({ text: 'Próximos 7 dias', heading: HeadingLevel.HEADING_1 }));
  if (!s.upcoming.length) kids.push(P('Nenhuma revisão agendada.'));
  for (const r of s.upcoming) kids.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: `${fmtDate(r.next)} — ${[...r.path, r.title].join(' › ')}` })] }));
  return Packer.toBuffer(new Document({ creator: 'MindCraft', title: `Relatório de estudos — ${title}`, sections: [{ children: kids }] }));
}

module.exports = { buildReport, toStudyMarkdown, toStudyDOCX, fmtMin, fmtPct, fmtDate, parseDate };
