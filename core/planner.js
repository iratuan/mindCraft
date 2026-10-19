'use strict';
// Planilha de planejamento: exporta o mapa (ou uma disciplina) como CSV que abre direto no Excel/Planilhas,
// e lê a planilha de volta como uma lista de mudanças (prévia) que só é aplicada depois de confirmada.
// Regras de segurança: nunca apaga tópicos; célula em branco = "não mexer"; totais de tempo/questões só
// ACRESCENTAM a diferença ao dia de hoje (reimportar a mesma planilha não duplica nada); tudo vale ou nada (1 desfazer).
const study = require('./study');
const { parseCsv, decodeCsvBuffer, cleanPasted } = require('./csv');

const COLUMNS = ['id', 'disciplina', 'item', 'topico', 'peso', 'progresso', 'proxima_revisao', 'revisou_hoje', 'tempo_total_min', 'questoes_total', 'acertos_total', 'ultima_revisao', 'notas', 'data_prova'];
const ALIASES = {
  id: ['id', 'codigo', 'chave'], disciplina: ['disciplina', 'materia'], item: ['item', 'numero'], topico: ['topico', 'assunto', 'titulo'],
  peso: ['peso', 'importancia'], progresso: ['progresso', 'andamento'], proxima_revisao: ['proxima_revisao', 'proxima', 'revisar_em', 'proxima_revisao_data'],
  revisou_hoje: ['revisou_hoje', 'revisado_hoje', 'estudei_hoje'], tempo_total_min: ['tempo_total_min', 'tempo_min', 'tempo_total', 'minutos'],
  questoes_total: ['questoes_total', 'questoes', 'questoes_feitas'], acertos_total: ['acertos_total', 'acertos'],
  ultima_revisao: ['ultima_revisao', 'ultima'], notas: ['notas', 'anotacoes', 'observacoes'], data_prova: ['data_prova', 'prova', 'data_da_prova'],
};
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const canon = Object.fromEntries(Object.entries(ALIASES).flatMap(([k, v]) => v.map((a) => [a, k])));
const keyOf = (id) => 't-' + String(id).slice(0, 10);             // "t-" impede o Excel de tratar o código como número
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const lf = (s) => String(s ?? '').replace(/\r\n?/g, '\n').replace(/\s+$/g, '');
const guard = (s) => (/^[=+\-@\t\r]/.test(s) ? "'" + s : s);        // evita que o Excel execute texto começando com = + - @
const unguard = (s) => (/^'[=+\-@\t\r]/.test(s) ? s.slice(1) : s);
const cell = (v) => { const s = String(v ?? ''); return /[";\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };

function isoDate(s) {
  const t = String(s ?? '').trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(t);
  if (m && /^(\d{4}-\d{2}-\d{2})(\s.*|T.*)?$/.test(t)) { const d = `${m[1]}-${m[2]}-${m[3]}`; return study.isDateStr(d) ? d : null; }
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(t);
  if (m) { const d = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`; return study.isDateStr(d) ? d : null; }
  return null;
}
const num = (s) => { const t = String(s ?? '').trim().replace('%', '').replace(',', '.'); return t !== '' && /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN; };
const totalQ = (st) => ({ done: st.q.done, correct: st.q.correct });

/** Linhas do mapa na ordem do documento (sem a raiz, que vai numa linha própria no início). */
function* rows(map, only) {
  const rec = function* (n, depth, disc, itemPath) {
    if (depth > 0) yield { n, depth, disc: depth === 1 ? n.title : disc, item: itemPath.join('.') };
    for (let i = 0; i < n.children.length; i++) {
      const c = n.children[i];
      yield* rec(c, depth + 1, depth === 0 ? c.title : disc, depth === 0 ? [i + 1] : [...itemPath, i + 1]);
    }
  };
  for (const r of rec(map.root, 0, '', [])) if (!only || only.has(r.n.id)) yield r;
}

/** CSV (BOM + `;` + CRLF: o Excel em português abre com um duplo clique). `rootId` limita a uma disciplina/ramo. */
function exportPlan(map, { today = study.todayStr(), rootId = null } = {}) {
  let only = null;
  if (rootId && rootId !== map.root.id) {
    const f = map.find(rootId); if (!f) throw new Error('Tópico não encontrado.');
    only = new Set(); (function add(n) { only.add(n.id); n.children.forEach(add); })(f.node);
  }
  const out = [COLUMNS.join(';')];
  const line = (o) => out.push(COLUMNS.map((c) => cell(o[c] ?? '')).join(';'));
  if (!only) line({ id: keyOf(map.root.id), topico: guard(map.root.title), notas: guard(map.root.notes || ''), data_prova: map.meta.exam ? map.meta.exam.date : '' });
  for (const { n, disc, item } of rows(map, only)) {
    const st = study.normalizeStudy(n.study);
    const last = st.reviews[st.reviews.length - 1];
    line({
      id: keyOf(n.id), disciplina: guard(disc), item, topico: guard(n.title), peso: st.weight,
      progresso: n.children.length === 0 && Number.isFinite(n.progress) ? n.progress : '',
      proxima_revisao: st.next || '', revisou_hoje: last && last.d === today ? (last.ok ? 'sim' : 'errei') : '',
      tempo_total_min: study.totalMinutes(st) || '', questoes_total: st.q.done || '', acertos_total: st.q.done ? st.q.correct : '',
      ultima_revisao: st.last || '', notas: guard(n.notes || ''),
    });
  }
  return '﻿' + out.join('\r\n') + '\r\n';
}

/**
 * Lê a planilha e calcula as mudanças SEM tocar no mapa.
 * @returns {{ changes:{label:string, field:string, from:string, to:string}[], errors:{line:number,msg:string}[],
 *   warnings:string[], stats:{rows:number, matched:number, changedTopics:number, created:number}, ops:Function[] }}
 */
function diffPlan(map, input, { today = study.todayStr() } = {}) {
  let text = Buffer.isBuffer(input) ? decodeCsvBuffer(input) : String(input ?? ''), pasteNotes = [];
  if (!Buffer.isBuffer(input)) ({ text, notes: pasteNotes } = cleanPasted(text, { hints: ['topico'] }));       // texto colado (ver cleanPasted)
  const { rows: raw } = parseCsv(text);
  const R = { changes: [], errors: [], warnings: [...pasteNotes], stats: { rows: 0, matched: 0, changedTopics: 0, created: 0 }, ops: [] };
  if (!raw.length) { R.errors.push({ line: 0, msg: 'O arquivo está vazio.' }); return R; }
  const header = raw[0].map((h) => canon[norm(h)] || null);
  const ix = (k) => header.indexOf(k);
  if (ix('id') < 0 && (ix('topico') < 0 || ix('disciplina') < 0)) { R.errors.push({ line: 1, msg: 'Não parece uma planilha de planejamento: falta a coluna "id" (ou "disciplina" + "topico" para tópicos novos).' }); return R; }
  const get = (r, k) => (ix(k) >= 0 ? String(r[ix(k)] ?? '') : '');

  // índice por código (aceita o código curto "t-xxxxxxxxxx" e o id completo)
  const byKey = new Map(); const ambiguous = new Set();
  const index = (n) => { for (const k of [keyOf(n.id), n.id]) { if (byKey.has(k) && byKey.get(k) !== n) ambiguous.add(k); byKey.set(k, n); } n.children.forEach(index); };
  index(map.root);
  const seen = new Set(), plannedNew = new Set(), discCreated = new Map();
  const discOf = (name) => map.root.children.find((d) => norm(d.title) === norm(name));
  const touched = new Set();
  const push = (label, field, from, to, topic) => { R.changes.push({ label, field, from: String(from ?? ''), to: String(to ?? '') }); touched.add(topic); };

  for (let li = 1; li < raw.length; li++) {
    const r = raw[li], line = li + 1; R.stats.rows++;
    const idc = get(r, 'id').trim();
    const warn = (m) => R.warnings.push(`Linha ${line}: ${m}`);
    if (!idc) { // ---- tópico novo ----
      const title = clean(unguard(get(r, 'topico'))), disc = clean(unguard(get(r, 'disciplina')));
      if (!title && !disc) continue;
      if (!title) { R.errors.push({ line, msg: 'Linha sem código e sem tópico.' }); continue; }
      if (!disc) { R.errors.push({ line, msg: `Tópico novo "${title}" sem disciplina.` }); continue; }
      const key = norm(disc) + '|' + norm(title);
      const exist = discOf(disc);
      if (plannedNew.has(key) || (exist && exist.children.some((c) => norm(c.title) === norm(title)))) { warn(`"${title}" já existe em "${disc}"; não foi duplicado.`); continue; }
      plannedNew.add(key); R.stats.created++;
      const w = num(get(r, 'peso')), p = num(get(r, 'progresso')), nx = isoDate(get(r, 'proxima_revisao')), nt = lf(unguard(get(r, 'notas')));
      push(`${disc} › ${title}`, 'novo tópico', '', title, 'new:' + key);
      R.ops.push((m) => {
        let parent = discOf(disc) || discCreated.get(norm(disc));
        if (!parent) { parent = m.addChild(m.root.id, disc); discCreated.set(norm(disc), parent); }
        const node = m.addChild(parent.id, title);
        const patch = {}; if (nt) patch.notes = nt; if (Number.isFinite(p) && p >= 0 && p <= 100) patch.progress = Math.round(p);
        if (Object.keys(patch).length) m.update(node.id, patch);
        if (Number.isInteger(w) && w >= 1 && w <= 5) m.mutateStudy(node.id, (s) => study.setWeight(s, w));
        if (nx) m.mutateStudy(node.id, (s) => study.setNext(s, nx));
      });
      continue;
    }
    // ---- tópico existente ----
    if (ambiguous.has(idc)) { R.errors.push({ line, msg: `O código "${idc}" é ambíguo.` }); continue; }
    const node = byKey.get(idc);
    if (!node) { R.errors.push({ line, msg: `O código "${idc}" não existe neste mapa (planilha de outro mapa? o tópico foi apagado?). Linha ignorada.` }); continue; }
    if (seen.has(node.id)) { warn('código repetido; só a primeira ocorrência vale.'); continue; }
    seen.add(node.id); R.stats.matched++;
    const label = node === map.root ? node.title : `${node.title}`;
    const st0 = study.normalizeStudy(node.study);
    const isRoot = node === map.root;
    const ops = []; // mudanças deste tópico, em ordem

    // título
    const t = clean(unguard(get(r, 'topico')));
    if (t && t !== node.title) { push(label, 'tópico', node.title, t, node.id); ops.push((m) => m.update(node.id, { title: t })); }
    // notas
    if (ix('notas') >= 0 && lf(node.notes).length >= 4999) { if (get(r, 'notas').trim() !== lf(node.notes).trim()) warn('as notas deste tópico são longas demais para a planilha (limite de 5000 caracteres); mantidas as do mapa.'); }
    else if (ix('notas') >= 0) {
      const nt = lf(unguard(get(r, 'notas')));
      if (nt !== lf(node.notes) && !(nt === '' && lf(node.notes) !== '')) { push(label, 'notas', lf(node.notes).slice(0, 60), nt.slice(0, 60), node.id); ops.push((m) => m.update(node.id, { notes: nt })); }
    }
    if (isRoot) {
      const dp = get(r, 'data_prova').trim();
      if (dp) {
        const d = isoDate(dp);
        if (!d) warn(`data da prova inválida ("${dp}"); use AAAA-MM-DD ou DD/MM/AAAA.`);
        else if (!map.meta.exam || map.meta.exam.date !== d) { push(label, 'data da prova', map.meta.exam ? map.meta.exam.date : '—', d, node.id); ops.push((m) => m.setExam({ name: (m.meta.exam && m.meta.exam.name) || m.root.title, date: d })); }
      }
    } else {
      // peso
      const ws = get(r, 'peso').trim();
      if (ws) { const w = num(ws); if (!Number.isInteger(w) || w < 1 || w > 5) warn(`peso "${ws}" inválido (use 1 a 5); ignorado.`); else if (w !== st0.weight) { push(label, 'peso', st0.weight, w, node.id); ops.push((m) => m.mutateStudy(node.id, (s) => study.setWeight(s, w))); } }
      // progresso (só para tópicos sem subtópicos: nos demais é calculado)
      const ps = get(r, 'progresso').trim();
      if (ps) {
        const p = num(ps);
        if (!Number.isFinite(p) || p < 0 || p > 100) warn(`progresso "${ps}" inválido (use 0 a 100); ignorado.`);
        else if (node.children.length) warn(`"${node.title}" tem subtópicos: o progresso dele é calculado; célula ignorada.`);
        else if (Math.round(p) !== node.progress) { push(label, 'progresso', node.progress == null ? '—' : node.progress + '%', Math.round(p) + '%', node.id); ops.push((m) => m.update(node.id, { progress: Math.round(p) })); }
      }
      // revisão de hoje
      const rv = norm(get(r, 'revisou_hoje'));
      let reviewedNext = st0.next;
      if (rv) {
        const okv = ['sim', 's', 'x', '1', 'ok', 'acertei', 'revisado'].includes(rv), bad = ['errei', 'nao_lembrei', 'dificil', 'erro'].includes(rv);
        if (!okv && !bad) { if (!['nao', 'n', '0'].includes(rv)) warn(`"revisou hoje" com valor desconhecido ("${get(r, 'revisou_hoje')}"); use sim ou errei.`); }
        else {
          const after = study.reviewed(st0, { today, ok: okv });
          if (JSON.stringify(after.reviews) !== JSON.stringify(st0.reviews) || after.next !== st0.next) {
            push(label, 'revisão de hoje', st0.next ? 'próx. ' + st0.next : 'sem revisão', (okv ? 'revisou' : 'errou') + ' → próx. ' + after.next, node.id);
            ops.push((m) => m.mutateStudy(node.id, (s) => study.reviewed(s, { today, ok: okv }))); reviewedNext = after.next;
          }
        }
      }
      // próxima revisão explícita (só vale se o usuário a MUDOU em relação ao que o mapa tinha)
      const ns = get(r, 'proxima_revisao').trim();
      if (ns) {
        const d = ns === '-' ? null : isoDate(ns);
        if (ns !== '-' && !d) warn(`próxima revisão inválida ("${ns}"); use AAAA-MM-DD ou DD/MM/AAAA.`);
        else if (d !== st0.next && d !== reviewedNext) { push(label, 'próxima revisão', st0.next || '—', d || '— (removida)', node.id); ops.push((m) => m.mutateStudy(node.id, (s) => study.setNext(s, d))); }
      }
      // tempo (total → soma a diferença em HOJE)
      const ts = get(r, 'tempo_total_min').trim();
      if (ts) {
        const tot = num(ts), cur = study.totalMinutes(st0);
        if (!Number.isFinite(tot) || tot < 0) warn(`tempo "${ts}" inválido; ignorado.`);
        else if (Math.round(tot) > cur) {
          const add = Math.round(tot) - cur;
          try { study.addTime(st0, today, add); push(label, 'tempo estudado', cur + ' min', Math.round(tot) + ' min (+' + add + ' hoje)', node.id); ops.push((m) => m.mutateStudy(node.id, (s) => study.addTime(s, today, add))); }
          catch (e) { warn(e.message); }
        } else if (Math.round(tot) < cur) warn(`tempo (${Math.round(tot)} min) é menor que o já registrado (${cur} min); mantido o do mapa.`);
      }
      // questões (totais → soma a diferença em HOJE)
      const qs = get(r, 'questoes_total').trim(), as = get(r, 'acertos_total').trim();
      if (qs || as) {
        const cur = totalQ(st0), D = qs ? num(qs) : cur.done, C = as ? num(as) : cur.correct;
        if (!Number.isInteger(D) || !Number.isInteger(C) || D < 0 || C < 0) warn('questões/acertos devem ser números inteiros; ignorados.');
        else if (C > D) warn(`acertos (${C}) maiores que questões feitas (${D}); ignorados.`);
        else if (D < cur.done || C < cur.correct) warn(`questões ${D}/${C} são menores que as registradas (${cur.done}/${cur.correct}); mantido o do mapa.`);
        else if (D > cur.done || C > cur.correct) {
          const dd = D - cur.done, dc = C - cur.correct;
          if (dd <= 0 || dc > dd) warn(`questões ${D}/${C}: a diferença (${dd} feitas, ${dc} acertos) é inconsistente; ignorado.`);
          else { push(label, 'questões', `${cur.done}/${cur.correct}`, `${D}/${C} (+${dd} hoje)`, node.id); ops.push((m) => m.mutateStudy(node.id, (s) => study.addQuestions(s, dd, dc, today))); }
        }
      }
    }
    R.ops.push(...ops);
  }
  R.stats.changedTopics = touched.size;
  if (!R.stats.matched && !R.stats.created && !R.errors.length) R.errors.push({ line: 0, msg: 'Nenhuma linha da planilha corresponde a este mapa.' });
  else if (!R.stats.matched && R.stats.rows && !R.stats.created) R.errors.push({ line: 0, msg: 'Nenhuma linha da planilha corresponde a este mapa (é de outro mapa?).' });
  return R;
}

/** Aplica o resultado de diffPlan em UMA operação (um desfazer; se algo falhar, nada muda). */
function applyPlan(map, diff) {
  if (!diff || !diff.ops.length) return 0;
  map.batch(() => { for (const op of diff.ops) op(map); });
  return diff.changes.length;
}

module.exports = { exportPlan, diffPlan, applyPlan, COLUMNS, keyOf };
