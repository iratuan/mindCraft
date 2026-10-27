'use strict';
/* Interface de gestão de estudos. Carregado depois de renderer.js: usa o estado e as funções globais dele
   (map, change, render, selectedId, selIds, targets, S, nowStr, confirmDiscard, centerOn…). */
const R = require(path.join(core, 'report'));
const { fromEdital } = require(path.join(core, 'edital'));
const { fromCsv, csvTemplate, aiPrompt } = require(path.join(core, 'csv'));
const planner = require(path.join(core, 'planner'));

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const fmtMin = R.fmtMin, fmtDate = R.fmtDate;
const pctTxt = (v) => (v == null ? '—' : `${Math.round(v * 10) / 10}%`.replace('.', ','));

// ---------- mensagens ----------
function msg(text, kind) {
  const m = $('#studyMsg'); if (!m) return;
  m.textContent = text || ''; m.className = 'msg' + (kind ? ' ' + kind : '');
  if (text) setStatus(text);
}

// ---------- executa uma ação de estudo (uma única ação desfazível; erro de validação não altera nada) ----------
function runStudy(fn, okMsg, ids = targets()) {
  try {
    change(() => map.batch(() => { ids.forEach((id) => fn(id)); return true; }));
    msg(okMsg || '', okMsg ? 'ok' : '');
    return true;
  } catch (e) { msg(e.message, 'err'); return false; }
}
const primary = () => selectedId && map.find(selectedId);

// ---------- cronômetro ----------
let timer = null; // { id, start (ms), day }
const clock = (ms) => { const t = Math.floor(ms / 1000); return [Math.floor(t / 3600), Math.floor(t / 60) % 60, t % 60].map((n) => String(n).padStart(2, '0')).join(':'); };
function tickTimer() { $('#timerVal').textContent = timer ? clock(Date.now() - timer.start) : '00:00:00'; }
setInterval(tickTimer, 1000);

function startTimer() {
  const p = primary(); if (!p) return;
  if (timer) stopTimer();
  timer = { id: p.node.id, start: Date.now(), day: nowStr() };
  document.body.classList.add('timing'); tickTimer(); render();
  msg(`Cronômetro em "${p.node.title}".`, 'ok');
}
/** Para o cronômetro e registra os minutos no tópico em que ele foi iniciado (mesmo que a seleção tenha mudado). */
function stopTimer() {
  if (!timer) return;
  const t = timer; timer = null;
  document.body.classList.remove('timing'); tickTimer();
  const ms = Date.now() - t.start;
  if (ms < 30000) { msg('Menos de 30 s — não registrado.', ''); render(); return; }
  const minutes = Math.max(1, Math.round(ms / 60000));
  const node = map.find(t.id);
  if (!node) { msg('O tópico do cronômetro não existe mais.', 'err'); render(); return; }
  runStudy((id) => map.mutateStudy(id, (s) => S.addTime(s, t.day, minutes)), `${minutes} min registrados em "${node.node.title}".`, [t.id]);
}
$('#timerBtn').addEventListener('click', () => { timer && selectedId === timer.id ? stopTimer() : startTimer(); $('#timerBtn').blur(); });

// ---------- painel "Estudo do tópico" ----------
function syncStudy(sel) {
  const form = $('#studyForm'), empty = $('#studyEmpty');
  if (!sel) { form.hidden = true; empty.hidden = false; }
  else {
    form.hidden = false; empty.hidden = true;
    const st = S.normalizeStudy(sel.node.study), n = targets().length;
    const multi = $('#studyMulti'); multi.hidden = n <= 1;
    if (n > 1) multi.textContent = `${n} tópicos selecionados: peso, revisão e data valem para todos; tempo e questões, só para "${sel.node.title}".`;
    if (document.activeElement !== $('#studyWeight')) $('#studyWeight').value = String(st.weight);
    if (document.activeElement !== $('#studyNext')) $('#studyNext').value = st.next || '';
    const ok = st.reviews.filter((r) => r.ok).length;
    $('#studyInfo').textContent = st.last
      ? `Última: ${fmtDate(st.last)} · ciclo ${Math.min(st.stage + 1, S.INTERVALS.length)}/${S.INTERVALS.length} · ${st.reviews.length} sessão(ões), ${ok} sem erro`
      : 'Ainda não estudado — a 1ª sessão agenda a revisão para amanhã.';
    $('#studyDone').textContent = st.last ? '✓ Revisei hoje (lembrei)' : '✓ Estudei hoje';
    const today = nowStr();
    $('#studyTime').textContent = `Hoje: ${fmtMin(st.log[today] || 0)} · Total: ${fmtMin(S.totalMinutes(st))}`;
    $('#studyQ').textContent = st.q.done ? `Total: ${st.q.correct}/${st.q.done} (${pctTxt((st.q.correct / st.q.done) * 100)})` : 'Nenhuma questão registrada.';
    renderErrList(sel);
    $('#timerBtn').textContent = timer && timer.id === sel.node.id ? '■ Parar' : timer ? '▶ Mover cronômetro para cá' : '▶ Iniciar';
  }
  if (dashOpen) renderDash();
}

/** Lista de erros do tópico selecionado (mais recentes primeiro) com botão de apagar. */
function renderErrList(sel) {
  const box = $('#errList'); if (!box) return;
  box.textContent = '';
  const errs = (S.normalizeStudy(sel.node.study).errs || []).map((e, i) => ({ ...e, i })).reverse();
  if (!errs.length) { box.append(el('div', 'muted', 'Nenhum erro registrado neste tópico.')); return; }
  box.append(el('div', 'muted', `${errs.length} erro(s) registrado(s):`));
  for (const e of errs.slice(0, 12)) {
    const row = el('div', 'err-row'); row.dataset.err = String(e.i);
    const src = [e.banca, e.year].filter(Boolean).join(' ');
    const t = el('div', 'grow'); t.append(el('b', '', S.ERR_REASONS[e.why]), el('span', 'muted', ` · ${fmtDate(e.d)}${src ? ' · ' + src : ''}${e.note ? ' — ' + e.note : ''}`));
    if (e.redo) t.append(el('span', 'err-redo ' + (e.redo.ok ? 'ok' : 'bad'), ` · refeito em ${fmtDate(e.redo.d)}: ${e.redo.ok ? 'acertei' : 'errei de novo'}`));
    const redo = (ok, label, title, act) => { const b = el('button', 'err-redo-btn', label); b.title = title; b.dataset.act = act; b.onclick = () => runStudy((id) => map.mutateStudy(id, (s) => S.redoError(s, e.i, { today: nowStr(), ok })), ok === null ? 'Voltou para "refazer".' : ok ? 'Refeito: acertou.' : 'Refeito: errou de novo.', [sel.node.id]); return b; };
    const del = el('button', 'err-del', '✕'); del.title = 'Apagar este erro'; del.dataset.act = 'err-del'; del.onclick = () => runStudy((id) => map.mutateStudy(id, (s) => S.removeError(s, e.i)), 'Erro apagado.', [sel.node.id]);
    row.append(t, ...(e.redo ? [redo(null, '↶', 'Desfazer: voltar para "refazer"', 'err-redo-clear')] : [redo(true, '✔', 'Refiz e acertei', 'err-redo-ok'), redo(false, '✖', 'Refiz e errei de novo', 'err-redo-bad')]), del); box.append(row);
  }
  if (errs.length > 12) box.append(el('div', 'muted', `… e mais ${errs.length - 12} (mais antigos)`));
}
$('#errAdd').addEventListener('click', () => {
  const why = $('#errWhy').value, note = $('#errNote').value, count = $('#errCount').checked;
  if (!why) { msg('Escolha o motivo do erro.', 'err'); return; }
  const today = nowStr();
  const origin = { banca: $('#qBanca').value, year: $('#qAno').value };
  if (runStudy((id) => map.mutateStudy(id, (s) => { const r = S.addError(s, { why, note, today, ...origin }); return count ? S.addQuestions(r, 1, 0, today, origin) : r; }), 'Erro registrado no caderno.', selectedId ? [selectedId] : [])) { $('#errNote').value = ''; $('#errWhy').value = ''; }
});
// ---------- banca: lista de seleção (as já usadas neste mapa + as mais comuns no Brasil + "Outra…") ----------
// `#qBanca.value` continua sendo o NOME da banca (ou ''), venha da lista ou da opção "Outra…": quem lê o campo não precisa saber a diferença.
const { BANCAS, OUTRA } = require(path.join(core, 'bancas'));
{
  const sel = $('#qBanca'), outra = $('#qBancaOutra'), proto = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  const opt = (v, t) => { const o = document.createElement('option'); o.value = v; o.textContent = t ?? v; return o; };
  const group = (label, names) => { const g = document.createElement('optgroup'); g.label = label; for (const n of names) g.append(opt(n)); return g; };
  /** Remonta a lista mantendo a escolha atual. Só as bancas já usadas neste mapa custam uma consulta; por isso roda ao abrir a lista, não a cada seleção. */
  const fill = () => {
    const keep = sel.value, eff = outra.hidden ? keep : outra.value;
    let used = []; try { used = S.summary(map, { today: nowStr() }).questionsBy.banca.filter((b) => b.name !== 'Sem banca').map((b) => b.name); } catch { /* sem sugestões */ }
    const seen = new Set(used.map((n) => S.bancaKey(n))); const common = BANCAS.filter((n) => !seen.has(S.bancaKey(n)));
    sel.textContent = ''; sel.append(opt('', 'Banca (opcional)'));
    if (used.length) sel.append(group('Já usadas neste mapa', used));
    sel.append(group('Mais comuns em concursos', common), opt(OUTRA, 'Outra…'));
    api.set(eff);
  };
  const api = {
    get: () => (sel.selectedIndex >= 0 && proto.get.call(sel) === OUTRA ? outra.value : proto.get.call(sel)),
    set: (v) => {
      v = String(v ?? '').trim();
      const has = [...sel.options].find((o) => o.value !== OUTRA && S.bancaKey(o.value) === S.bancaKey(v) && v);
      if (!v) { proto.set.call(sel, ''); outra.hidden = true; outra.value = ''; }
      else if (has) { proto.set.call(sel, has.value); outra.hidden = true; outra.value = ''; }
      else { proto.set.call(sel, OUTRA); outra.hidden = false; outra.value = v; }
    },
  };
  Object.defineProperty(sel, 'value', { get: api.get, set: api.set, configurable: true });
  sel.addEventListener('focus', fill); sel.addEventListener('mousedown', () => { if (document.activeElement !== sel) fill(); });
  sel.addEventListener('change', () => { outra.hidden = proto.get.call(sel) !== OUTRA; if (!outra.hidden) outra.focus(); });
  fill(); window.setQBanca = api.set;
}
$('#studyDone').addEventListener('click', () => { runStudy((id) => map.mutateStudy(id, (s) => S.reviewed(s, { today: nowStr(), ok: true })), 'Sessão registrada. Próxima revisão agendada.'); $('#studyDone').blur(); });
$('#studyFail').addEventListener('click', () => { runStudy((id) => map.mutateStudy(id, (s) => S.reviewed(s, { today: nowStr(), ok: false })), 'Registrado: rever amanhã.'); $('#studyFail').blur(); });
$('#studyWeight').addEventListener('change', (e) => runStudy((id) => map.mutateStudy(id, (s) => S.setWeight(s, +e.target.value)), 'Peso atualizado.'));
$('#studyNext').addEventListener('change', (e) => { if (!runStudy((id) => map.mutateStudy(id, (s) => S.setNext(s, e.target.value || null)), e.target.value ? 'Revisão reagendada.' : 'Revisão removida.')) render(); });
$('#studyAddMin').addEventListener('click', () => {
  const v = +$('#studyMin').value;
  if (runStudy((id) => map.mutateStudy(id, (s) => S.addTime(s, nowStr(), v)), `${v} min registrados.`, selectedId ? [selectedId] : [])) $('#studyMin').value = '';
});
$('#qAdd').addEventListener('click', () => {
  const d = Number($('#qDone').value), c = Number($('#qOk').value === '' ? NaN : $('#qOk').value);
  const origin = { banca: $('#qBanca').value, year: $('#qAno').value };   // banca/ano ficam preenchidos: costuma-se registrar várias vezes da mesma prova
  if (runStudy((id) => map.mutateStudy(id, (s) => S.addQuestions(s, d, c, nowStr(), origin)), `${c}/${d} questões registradas${origin.banca.trim() || origin.year ? ' (' + [origin.banca.trim(), origin.year].filter(Boolean).join(' ') + ')' : ''}.`, selectedId ? [selectedId] : [])) { $('#qDone').value = ''; $('#qOk').value = ''; }
});

// ---------- painel de estudos (sobreposição) ----------
function openDash() { commitNotes(); if (typeof closeHome === 'function') closeHome(); if (typeof closeGraph === 'function') closeGraph(); dashOpen = true; $('#dash').hidden = false; document.querySelector('[data-act="dash"]').classList.add('on'); renderDash(); }
function closeDash() { dashOpen = false; $('#dash').hidden = true; document.querySelector('[data-act="dash"]').classList.remove('on'); }
act.dash = () => { if (dashOpen) return closeDash(); if (!needMap()) return; return openDash(); };

function goTo(id) {
  closeDash();
  (function open(n) { // abre os ramos recolhidos no caminho (só visualização: não conta como alteração)
    if (n.id === id) return true;
    if (n.children.some(open)) { n.collapsed = false; return true; }
    return false;
  })(map.root);
  selectedId = id; selIds = new Set([id]); selectedRel = null;
  render(); centerOn(id);
}

function card(k, v, s) { const c = el('div', 'card'); c.append(el('div', 'k', k), el('div', 'v', v)); if (s != null) c.append(el('div', 's', s)); return c; }
function bar(pct, cls) { const b = el('div', 'bar' + (cls ? ' ' + cls : '')); const i = el('i'); i.style.width = `${Math.max(0, Math.min(100, pct))}%`; b.append(i); return b; }
const pathTxt = (r) => [...r.path].join(' › ');

let agendaSel = null; // dia escolhido na agenda (sobrevive aos redesenhos do painel)
const tagFor = (overdue) => el('span', 'tag ' + (overdue > 0 ? 'late' : 'today'), overdue > 0 ? `${overdue} d de atraso` : 'hoje');
function reviewRow(it, onClick, rightEl) {
  const row = el('div', 'rev'); const t = el('div', 't'); t.append(el('b', '', it.title), el('span', '', it.sub || pathTxt(it) || 'raiz')); t.onclick = onClick;
  row.append(t); if (rightEl) row.append(rightEl); return row;
}

/** Agenda: calendário dos próximos ${S.AGENDA_DAYS} dias com o nº de revisões por dia; clicar num dia lista os tópicos. */
function agendaSection(s) {
  const sec = el('div', 'dash-sec'); sec.id = 'agenda';
  sec.append(el('h3', '', `Agenda de revisões — próximos ${S.AGENDA_DAYS} dias`));
  const grid = el('div', 'agenda'), detail = el('div', 'ag-detail'); detail.id = 'agendaDetail';
  for (const h of 'DSTQQSS') grid.append(el('div', 'ag-h', h));
  const [y, m, d] = s.today.split('-').map(Number);
  for (let i = 0; i < new Date(y, m - 1, d).getDay(); i++) grid.append(el('div', 'ag-pad'));
  const show = (day) => {
    agendaSel = day.date; detail.textContent = '';
    detail.append(el('div', 'ag-title', `${fmtDate(day.date)} — ${day.count} revisão(ões)${day.date === s.today ? ' (inclui as atrasadas)' : ''}`));
    if (!day.count) detail.append(el('div', 'empty', 'Nada agendado para este dia.'));
    for (const it of day.items.slice(0, 12)) detail.append(reviewRow(it, () => goTo(it.id), it.overdue !== undefined ? tagFor(it.overdue) : null));
    if (day.count > 12) detail.append(el('div', 'empty', `+ ${day.count - 12} no dia`));
  };
  const cells = [];
  for (const day of s.agenda) {
    const lvl = day.count >= 4 ? 3 : day.count >= 2 ? 2 : day.count ? 1 : 0;
    const b = el('button', 'ag-day' + (lvl ? ' has l' + lvl : '') + (day.date === s.today ? ' today' : '') + (day.items.some((x) => x.overdue > 0) ? ' late' : ''));
    b.dataset.date = day.date; b.title = `${fmtDate(day.date)}: ${day.count} revisão(ões)`;
    b.append(el('i', '', String(+day.date.slice(8)))); if (day.count) b.append(el('b', '', String(day.count)));
    b.onclick = () => { cells.forEach((x) => x.b.classList.remove('sel')); b.classList.add('sel'); show(day); };
    cells.push({ b, day }); grid.append(b);
  }
  const pick = cells.find((c) => c.day.date === agendaSel) || cells.find((c) => c.day.count) || cells[0];
  pick.b.classList.add('sel'); show(pick.day);
  sec.append(grid, detail);
  return sec;
}

/** Pontos fracos: tópicos com ≥ ${S.WEAK_MIN} questões e acerto < ${Math.round(S.WEAK_ACCURACY * 100)}%. */
function weakSection(s) {
  const sec = el('div', 'dash-sec'); sec.id = 'weakSec';
  sec.append(el('h3', '', `Pontos fracos (${s.weak.length})`));
  if (!s.weak.length) sec.append(el('div', 'empty', `Nenhum: aparecem aqui os tópicos com pelo menos ${S.WEAK_MIN} questões e acerto abaixo de ${Math.round(S.WEAK_ACCURACY * 100)}%.`));
  for (const w of s.weak) sec.append(reviewRow(w, () => goTo(w.id), el('span', 'tag late', `${w.correct}/${w.done} · ${pctTxt(w.accuracy * 100)}`)));
  return sec;
}

/** Revisões pendentes nos outros mapas da pasta do vault (lê os arquivos; não altera nada). */
function otherMapsSection(today) {
  const none = () => el('div');
  if (typeof vaultDue !== 'function' || typeof vaultDirEff !== 'function' || (!vaultDirEff() && !libraryExists())) return none();
  let v; try { v = vaultDue(today); } catch (e) { report('Revisões de outros mapas: ' + e.message); return none(); }
  if (!v.scanned) return none();
  const total = v.maps.reduce((t, m) => t + m.count, 0);
  const sec = el('div', 'dash-sec'); sec.id = 'otherMaps';
  sec.append(el('h3', '', `Em outros mapas (${total})`));
  if (!v.maps.length) sec.append(el('div', 'empty', `Nenhuma revisão pendente nos outros ${v.scanned} mapa(s) da pasta.`));
  for (const mp of v.maps) {
    for (const it of mp.items) sec.append(reviewRow({ ...it, sub: `${mp.name}${it.path.length ? ' › ' + it.path.join(' › ') : ''}` }, () => openTopic({ kind: 'topic', mapKey: mp.key, topicId: it.id }), tagFor(it.overdue)));
    if (mp.count > mp.items.length) sec.append(el('div', 'empty', `+ ${mp.count - mp.items.length} em "${mp.name}"`));
  }
  return sec;
}

function renderDashClassic() {
  const box = $('#dash'); box.textContent = '';
  const today = nowStr(), s = S.summary(map, { today });

  // cabeçalho + prova
  const head = el('div', 'dash-head');
  const ttl = el('div'); ttl.append(el('h2', '', `Painel de estudos — ${map.root.title}`), el('div', 'sub', `Hoje: ${fmtDate(today)}`));
  const ex = el('div', 'dash-exam');
  const cd = el('div', 'countdown');
  if (s.exam) {
    const n = s.exam.daysLeft;
    cd.append(el('b', '', n >= 0 ? String(n) : String(-n)), el('span', '', n > 0 ? (n === 1 ? 'dia para a prova' : 'dias para a prova') : n === 0 ? 'a prova é hoje' : 'dias desde a prova'));
    cd.classList.add(n < 0 ? 'past' : n === 0 ? 'today' : n <= 14 ? 'soon' : 'far');
  } else cd.append(el('b', '', '—'), el('span', '', 'sem data de prova'));
  const nm = el('input'); nm.type = 'text'; nm.id = 'examName'; nm.placeholder = 'Nome da prova / concurso'; nm.value = s.exam ? s.exam.name : ''; nm.style.width = '190px'; nm.setAttribute('aria-label', 'Nome da prova');
  const dt = el('input'); dt.type = 'date'; dt.id = 'examDate'; dt.value = s.exam ? s.exam.date : ''; dt.setAttribute('aria-label', 'Data da prova');
  const sv = el('button', 'btn primary', 'Salvar prova'); sv.id = 'examSave';
  const clr = el('button', 'btn', 'Limpar'); clr.id = 'examClear';
  const dmsg = el('div', 'msg'); dmsg.id = 'dashMsg'; dmsg.style.flexBasis = '100%'; dmsg.style.textAlign = 'right';
  sv.onclick = () => {
    try { if (!dt.value) throw new Error('Informe a data da prova.'); change(() => map.setExam({ name: nm.value.trim(), date: dt.value })); }
    catch (e) { const m = $('#dashMsg'); if (m) { m.textContent = e.message; m.className = 'msg err'; } }
  };
  clr.onclick = () => change(() => map.setExam(null));
  ex.append(cd, nm, dt, sv, clr, dmsg);
  const opts = el('div', 'dash-opts'), cfg = loadCfg();
  const chk = (id, label, on, key) => { const l = el('label', 'opt'); const i = el('input'); i.type = 'checkbox'; i.id = id; i.checked = on; i.onchange = () => saveCfg({ [key]: i.checked }); l.append(i, document.createTextNode(label)); return l; };
  opts.append(chk('optReopen', 'Reabrir o último mapa ao iniciar', cfg.reopenLast !== false, 'reopenLast'), chk('optDashStart', 'Abrir este painel ao iniciar', !!cfg.dashOnStart, 'dashOnStart'), chk('optNewInLib', 'Salvar mapas novos na biblioteca', !!cfg.newInLibrary, 'newInLibrary'));
  ttl.append(opts);
  head.append(ttl, ex);

  // cartões
  const cards = el('div', 'cards');
  const c1 = card('Progresso geral', pctTxt(s.overall), `${s.doneLeaves} de ${s.totalLeaves} tópicos concluídos`); c1.append(bar(s.overall));
  const c2 = card('Hoje', fmtMin(s.minutes.today), `${s.reviewsToday} revisão(ões) registrada(s)`);
  const c3 = card('Últimos 7 dias', fmtMin(s.minutes.week), `Total: ${fmtMin(s.minutes.total)}`);
  const wk = el('div', 'week'), mx = Math.max(1, ...s.week.map((d) => d.minutes));
  for (const d of s.week) { const [y, m, dd] = d.date.split('-').map(Number); const col = el('div'); const b = el('i'); b.style.height = `${(d.minutes / mx) * 100}%`; b.title = `${fmtDate(d.date)}: ${fmtMin(d.minutes)}`; col.append(b, el('span', '', 'DSTQQSS'[new Date(y, m - 1, dd).getDay()])); wk.append(col); }
  c3.append(wk);
  const c4 = card('Sequência', `${s.streak} dia${s.streak === 1 ? '' : 's'}`, s.streak ? 'estudando sem pausa' : 'estude hoje para começar');
  const c5 = card('Questões', s.questions.accuracy == null ? '—' : pctTxt(s.questions.accuracy * 100), `${s.questions.correct} acertos em ${s.questions.done}` + (s.questions.week.done ? ` · 7 dias: ${s.questions.week.correct}/${s.questions.week.done} (${pctTxt(s.questions.week.accuracy * 100)})` : ''));
  const c6 = s.plan ? card('Plano até a prova', `${String(s.plan.topicsPerDay).replace('.', ',')} /dia`, `${s.plan.pendingTopics} tópicos pendentes em ${s.plan.daysLeft} dias`)
    : card('Plano até a prova', '—', s.exam ? (s.exam.daysLeft === 0 ? 'a prova é hoje' : 'prova já realizada') : 'defina a data da prova');
  cards.append(c1, c2, c3, c4, c5, c6);

  // disciplinas
  const left = el('div');
  const secD = el('div', 'dash-sec'); secD.append(el('h3', '', 'Disciplinas'));
  if (!s.disciplines.length) secD.append(el('div', 'empty', 'O mapa ainda não tem disciplinas (filhos da raiz). Importe o edital ou use o modelo de concurso.'));
  else {
    const t = el('table', 'tbl'), th = el('tr');
    for (const h of ['Disciplina', 'Progresso', 'Tópicos', 'Tempo', 'Acerto', 'Rev.']) th.append(el('th', '', h));
    t.append(th);
    for (const d of s.disciplines) {
      const tr = el('tr', 'click'); tr.dataset.goto = d.id; tr.title = 'Ir para a disciplina no mapa';
      const pc = el('td'); const row = el('div'); row.style.display = 'flex'; row.style.gap = '8px'; row.style.alignItems = 'center';
      const pb = bar(d.progress); pb.style.flex = '1'; row.append(pb, el('span', '', pctTxt(d.progress))); pc.append(row);
      tr.append(el('td', '', d.title), pc, el('td', 'num', `${d.done}/${d.leaves}`), el('td', 'num', fmtMin(d.minutes)), el('td', 'num', d.qDone ? pctTxt(d.accuracy * 100) : '—'), el('td', 'num', String(d.due)));
      tr.onclick = () => goTo(d.id);
      t.append(tr);
    }
    secD.append(t);
  }
  left.append(secD, agendaSection(s));

  // revisões
  const right = el('div');
  const secR = el('div', 'dash-sec'); secR.append(el('h3', '', `Revisões pendentes (${s.due.length})`));
  if (!s.due.length) secR.append(el('div', 'empty', 'Nenhuma revisão pendente. ✔'));
  for (const r of s.due) {
    const row = el('div', 'rev'); row.dataset.review = r.id;
    const t = el('div', 't'); t.append(el('b', '', r.title), el('span', '', pathTxt(r) || 'raiz')); t.onclick = () => goTo(r.id);
    row.append(t, el('span', 'tag ' + (r.overdue > 0 ? 'late' : 'today'), r.overdue > 0 ? `${r.overdue} d de atraso` : 'hoje'));
    const ok = el('button', 'mini', '✓'); ok.title = 'Revisei (lembrei)'; ok.dataset.act = 'rev-ok';
    const bad = el('button', 'mini', '↻'); bad.title = 'Errei — rever amanhã'; bad.dataset.act = 'rev-bad';
    ok.onclick = () => runStudy((id) => map.mutateStudy(id, (st) => S.reviewed(st, { today, ok: true })), '', [r.id]);
    bad.onclick = () => runStudy((id) => map.mutateStudy(id, (st) => S.reviewed(st, { today, ok: false })), '', [r.id]);
    row.append(ok, bad); secR.append(row);
  }
  const secU = el('div', 'dash-sec'); secU.append(el('h3', '', 'Próximos 7 dias'));
  if (!s.upcoming.length) secU.append(el('div', 'empty', 'Nenhuma revisão agendada.'));
  for (const r of s.upcoming) {
    const row = el('div', 'rev'); const t = el('div', 't'); t.append(el('b', '', r.title), el('span', '', pathTxt(r) || 'raiz')); t.onclick = () => goTo(r.id);
    row.append(t, el('span', 'tag', fmtDate(r.next))); secU.append(row);
  }
  right.append(secR, secU, weakSection(s), otherMapsSection(today));

  const grid = el('div', 'dash-grid'); grid.append(left, right);

  // ações
  const act2 = el('div', 'dash-actions');
  const b = (id, label, fn, cls) => { const x = el('button', 'btn' + (cls ? ' ' + cls : ''), label); x.id = id; x.onclick = fn; return x; };
  act2.append(
    b('btnReview', 'Revisão do dia', () => act.review(), 'primary'),
    b('btnIcs', 'Agenda (.ics)', () => exportIcs()),
    b('btnReportMd', 'Relatório (.md)', () => exportReport('md')),
    b('btnReportDocx', 'Relatório (.docx)', () => exportReport('docx')),
    b('btnEdital', 'Importar edital…', () => openImportModal()),
    b('btnCsv', 'Importar CSV (IA)…', () => openCsvModal()),
    b('btnPlan', 'Planilha de planejamento…', () => openPlanModal()),
    b('btnLib', 'Biblioteca de mapas…', () => openLibraryModal()),
    b('btnTemplate', 'Novo mapa de concurso…', () => newStudyTemplate()),
    b('btnDashClose', 'Fechar', () => closeDash(), 'primary'));

  box.append(head, cards, grid, act2);
}

/** Agenda de revisões e data da prova em .ics (Google Agenda, Outlook…). Só grava o arquivo escolhido. */
async function exportIcs() {
  const p = await ipcRenderer.invoke('dialog:save', 'ics', `Agenda de estudos - ${map.root.title}.ics`);
  if (!p) return null;
  try {
    const r = require(path.join(core, 'ics')).toIcs(map, { today: nowStr() });
    fs.writeFileSync(p, r.ics, 'utf8');
    const text = `Agenda salva: ${r.reviewDays} dia(s) com revisões${r.exam ? ' + a prova' : ''}. Importe o arquivo no seu calendário.`;
    setStatus(text); const m = $('#dashMsg'); if (m) { m.textContent = text; m.className = 'msg ok'; }
    return p;
  } catch (e) { ipcRenderer.invoke('dialog:error', 'Falha ao exportar a agenda: ' + e.message); return null; }
}

async function exportReport(kind) {
  const p = await ipcRenderer.invoke('dialog:save', kind, `Relatório de estudos - ${map.root.title}.${kind}`);
  if (!p) return;
  try {
    const today = nowStr();
    const data = kind === 'md' ? R.toStudyMarkdown(map, { today }) : await ipcRenderer.invoke('render-export', 'study-docx', map.toJSON(), { today });
    fs.writeFileSync(p, data);
    setStatus('Relatório salvo: ' + p);
    const m = $('#dashMsg'); if (m) { m.textContent = 'Relatório salvo.'; m.className = 'msg ok'; }
    return p;
  } catch (e) { ipcRenderer.invoke('dialog:error', 'Falha ao exportar o relatório: ' + e.message); }
}

// ---------- adotar um mapa novo (modelo/edital) ----------
function adopt(m) {
  if (typeof closeHome === 'function') closeHome();
  resetStudyUI();
  map = m; filePath = null; dirty = true; rev++;
  selectedId = map.root.id; selIds = new Set(); selectedRel = null; hits = null;
  render(); fit();
}
function resetStudyUI() {
  timer = null; document.body.classList.remove('timing'); tickTimer(); closeDash(); msg('');
}

/** "Novo mapa de concurso": abre a escolha de modelos (template-ui.js); o genérico continua em newGenericTemplate. */
function newStudyTemplate() { openTemplatePicker(); }
async function newGenericTemplate() {
  if (!(await confirmDiscard())) return;
  const root = createNode('Concurso — nome da prova');
  for (const d of ['Língua Portuguesa', 'Raciocínio Lógico', 'Direito Constitucional', 'Direito Administrativo', 'Informática']) {
    const dn = createNode(d);
    dn.children = ['Teoria', 'Resumos e mapas', 'Questões', 'Revisão'].map((t) => createNode(t));
    root.children.push(dn);
  }
  adopt(new MindMap(root, { name: 'Concurso', theme: $('#theme').value || 'ocean' }));
  setStatus('Modelo criado: renomeie as disciplinas e detalhe os tópicos do edital (ou use "Importar edital").');
}
act.template = newStudyTemplate;

// ---------- importar edital (texto colado) ----------
function closeModal() { $('#modal').hidden = true; $('#modal').textContent = ''; }
function openImportModal() {
  closeDash();
  const m = $('#modal'); m.textContent = ''; m.hidden = false;
  const bx = el('div', 'modal-box');
  const h = el('h2', '', 'Importar edital / lista de tópicos');
  const hint = el('div', 'muted', 'Cole o conteúdo programático. Reconhece "1", "1.1", "1.1.1", itens "a)", marcadores "-", disciplinas em MAIÚSCULAS ou terminadas em ":" e junta linhas quebradas do PDF.');
  const title = el('input'); title.type = 'text'; title.id = 'impTitle'; title.placeholder = 'Nome do concurso / prova'; title.value = map && map.root.title && map.root.title !== 'Ideia central' ? map.root.title : '';
  const ta = el('textarea'); ta.id = 'impText'; ta.placeholder = 'LÍNGUA PORTUGUESA\n1 Compreensão e interpretação de textos\n2 Ortografia oficial; acentuação gráfica\n2.1 Emprego do sinal indicativo de crase\n…';
  const opts = el('div', 'opts');
  const mk = (val, label, checked) => { const l = el('label'); const r = el('input'); r.type = 'radio'; r.name = 'impMode'; r.value = val; r.checked = checked; l.append(r, document.createTextNode(label)); return l; };
  const selNode = primary();
  opts.append(mk('new', 'Criar um novo mapa', true), mk('add', selNode ? `Adicionar abaixo de "${selNode.node.title}"` : 'Adicionar ao tópico selecionado', false));
  const count = el('span', 'muted'); count.id = 'impCount'; count.textContent = '0 tópicos detectados';
  const err = el('span', 'msg err'); err.id = 'impErr';
  const foot = el('div', 'foot');
  const ok = el('button', 'btn primary', 'Importar'); ok.id = 'impOk';
  const cancel = el('button', 'btn', 'Cancelar'); cancel.id = 'impCancel';
  foot.append(count, el('span', 'grow'), err, cancel, ok);
  bx.append(h, hint, title, ta, opts, foot); m.append(bx);

  const parse = () => textToNodes(ta.value);
  const total = (ns) => ns.reduce((a, n) => a + 1 + total(n.children), 0);
  ta.addEventListener('input', () => { count.textContent = `${total(parse())} tópicos detectados`; err.textContent = ''; });
  cancel.onclick = closeModal;
  m.onkeydown = (e) => { if (e.key === 'Escape') { e.stopPropagation(); closeModal(); } };
  ok.onclick = async () => {
    const trees = parse(), n = total(trees), mode = m.querySelector('input[name=impMode]:checked').value;
    if (!n) { err.textContent = 'Cole algum texto com tópicos.'; return; }
    if (n > MAX_PASTE_NODES) { err.textContent = `Texto grande demais (${n} tópicos; limite ${MAX_PASTE_NODES}).`; return; }
    if (mode === 'new') {
      if (!(await confirmDiscard())) return;
      closeModal(); adopt(fromEdital(ta.value, title.value.trim() || 'Edital'));
      if (n > 150) { const lv = map.autoLevels(120); render(); fit(); setStatus(`${n} tópicos importados; mapa grande: abri até o nível ${lv} (use "Níveis" para expandir).`); }
      else setStatus(`${n} tópicos importados do edital.`);
    } else {
      const parent = selectedId || map.root.id; let added = [];
      closeModal();
      change(() => map.batch(() => { added = trees.map((t) => map.addSubtree(parent, t)); return true; }));
      if (!added.length) return;
      selIds = new Set(added.map((x) => x.id)); selectedId = added[0].id; render();
      setStatus(`${n} tópicos adicionados.`);
    }
  };
  ta.focus();
}
act.edital = openImportModal;

// ---------- importar CSV de edital (gerado por uma IA) ----------
/** Janela: instruções para a IA → escolher o .csv → PRÉVIA (contagens, erros, avisos) → criar o mapa-esqueleto. */
function openCsvModalClassic() {
  closeDash();
  const m = $('#modal'); m.textContent = ''; m.hidden = false;
  const bx = el('div', 'modal-box'); bx.id = 'csvBox';
  const hint = el('div', 'muted', '1) Copie as instruções e cole numa IA junto com o texto do edital.  2) Salve a resposta como .csv.  3) Escolha o arquivo: o app monta o esqueleto do mapa (disciplinas, hierarquia, pesos, prova) e você completa tópicos, notas e links.');
  const mkBtn = (id, label, cls) => { const b = el('button', 'btn' + (cls ? ' ' + cls : ''), label); b.id = id; return b; };
  const bPrompt = mkBtn('csvPrompt', 'Copiar instruções para a IA'), bTpl = mkBtn('csvTemplate', 'Salvar CSV de exemplo…'), bPick = mkBtn('csvPick', 'Escolher arquivo CSV…', 'primary');
  const row = el('div', 'btnrow'); row.append(bPrompt, bTpl, bPick);
  const msg = el('div', 'msg'); msg.id = 'csvMsg';
  const prev = el('div', 'csv-prev'); prev.id = 'csvPreview'; prev.hidden = true;
  const title = el('input'); title.type = 'text'; title.id = 'csvTitle'; title.placeholder = 'Nome do concurso / prova'; title.hidden = true;
  const opts = el('div', 'opts'); opts.hidden = true;
  const mk = (val, label, checked) => { const l = el('label'); const r = el('input'); r.type = 'radio'; r.name = 'csvMode'; r.value = val; r.checked = checked; l.append(r, document.createTextNode(label)); return l; };
  const selNode = primary();
  opts.append(mk('new', 'Criar um novo mapa', true), mk('add', selNode ? `Adicionar as disciplinas abaixo de "${selNode.node.title}"` : 'Adicionar abaixo do tópico selecionado', false));
  const ok = mkBtn('csvOk', 'Criar o mapa', 'primary'); ok.disabled = true;
  const cancel = mkBtn('csvCancel', 'Cancelar');
  const foot = el('div', 'foot'); foot.append(el('span', 'grow'), cancel, ok);
  bx.append(el('h2', '', 'Importar CSV de edital (gerado por IA)'), hint, row, msg, prev, title, opts, foot); m.append(bx);

  let loaded = null;
  const say = (t, kind) => { msg.textContent = t || ''; msg.className = 'msg' + (kind ? ' ' + kind : ''); };
  const count = (n) => n.children.reduce((a, c) => a + 1 + count(c), 0);
  cancel.onclick = closeModal;
  m.onkeydown = (e) => { if (e.key === 'Escape') { e.stopPropagation(); closeModal(); } };
  bPrompt.onclick = async () => { try { await ipcRenderer.invoke('clip:write', aiPrompt()); say('Instruções copiadas. Cole numa IA e anexe/cole o edital.', 'ok'); } catch (e) { say('Não consegui copiar para a área de transferência (' + e.message + '). Use "Salvar CSV de exemplo…" e leia o modelo.', 'err'); } };
  bTpl.onclick = async () => {
    const p = await ipcRenderer.invoke('dialog:save', 'csv', 'modelo-edital.csv'); if (!p) return;
    try { fs.writeFileSync(p, csvTemplate(), 'utf8'); say('Modelo salvo em ' + p, 'ok'); } catch (e) { say('Não consegui salvar: ' + e.message, 'err'); }
  };
  bPick.onclick = async () => {
    const p = await ipcRenderer.invoke('dialog:open-csv'); if (!p) return;
    let buf; try { buf = fs.readFileSync(p); } catch (e) { say('Não consegui ler o arquivo: ' + e.message, 'err'); return; }
    const base = path.basename(p, path.extname(p));
    loaded = fromCsv(buf, { title: base });
    const { map: cm, report: r } = loaded;
    prev.textContent = ''; prev.hidden = false;
    const list = (cls, items) => { if (!items.length) return; const u = el('ul', cls); for (const t of items.slice(0, 8)) u.append(el('li', '', t)); if (items.length > 8) u.append(el('li', '', `… e mais ${items.length - 8}`)); prev.append(u); };
    if (!cm) { prev.append(el('div', 'csv-sum err', 'O arquivo não pôde ser importado.')); list('csv-err', r.errors.map((e) => (e.line ? `Linha ${e.line}: ` : '') + e.msg)); ok.disabled = true; title.hidden = opts.hidden = true; say(''); return; }
    const exam = cm.meta.exam ? ` · prova em ${fmtDate(cm.meta.exam.date)}` : '';
    prev.append(el('div', 'csv-sum', `${r.imported} tópicos em ${r.disciplines} disciplina(s)${exam}${r.skipped ? ` · ${r.skipped} linha(s) puladas` : ''}`));
    list('csv-disc', cm.root.children.map((d) => `${d.title} — ${count(d)} tópico(s)`));
    list('csv-err', r.errors.map((e) => `Linha ${e.line}: ${e.msg}`)); list('csv-warn', r.warnings);
    title.hidden = opts.hidden = false; title.value = cm.root.title; ok.disabled = false; say('');
  };
  ok.onclick = async () => {
    if (!loaded || !loaded.map) return;
    await applyCsvImport(loaded.map, { name: title.value.trim() || loaded.map.root.title, mode: m.querySelector('input[name=csvMode]:checked').value, close: closeModal });
  };
}
/** "Criar o mapa" da importação de CSV (compartilhado pelas interfaces clássica e React). `close` fecha a janela. */
async function applyCsvImport(cm, { name, mode, close }) {
  // só os tópicos: não conta a raiz nem as disciplinas (senão a mensagem diz 33 para 31 tópicos)
  let total = 0; cm.walk(() => total++); total -= 1 + cm.root.children.length;
  if (mode === 'new') {
    if (!(await confirmDiscard())) return false;
    close(); cm.root.title = name; cm.meta.name = name; if (cm.meta.exam && !cm.meta.exam.name) cm.meta.exam.name = name;
    adopt(cm);
    if (total > 150) { const lv = map.autoLevels(120); render(); fit(); setStatus(`${total} tópicos importados do CSV; mapa grande: abri até o nível ${lv} (use "Níveis" para expandir).`); }
    else setStatus(`${total} tópicos importados do CSV. Agora complete os tópicos, as notas e os links.`);
  } else {
    const parent = selectedId || map.root.id; let added = [];
    close();
    change(() => map.batch(() => { added = cm.root.children.map((t) => map.addSubtree(parent, t)); return true; }));
    if (!added.length) return true;
    selIds = new Set(added.map((x) => x.id)); selectedId = added[0].id; render(); reveal(added[0].id);
    setStatus(`${total} tópicos adicionados do CSV (a data da prova só é aplicada ao criar um mapa novo).`);
  }
  return true;
}
act.csv = () => openCsvModal();

// ---------- planilha de planejamento (exporta, você edita no Excel, importa de volta) ----------
function openPlanModalClassic() {
  closeDash();
  const m = $('#modal'); m.textContent = ''; m.hidden = false;
  const bx = el('div', 'modal-box'); bx.id = 'planBox';
  const hint = el('div', 'muted', 'Exporte o mapa como planilha (abre no Excel/Planilhas), preencha peso, progresso, próxima revisão, tempo, questões e notas, e importe de volta. Você vê as mudanças antes de aplicar; nada é apagado e células em branco não alteram nada.');
  const mkBtn = (id, label, cls) => { const b = el('button', 'btn' + (cls ? ' ' + cls : ''), label); b.id = id; return b; };
  const sel = primary(), scoped = sel && sel.node !== map.root;
  const opts = el('div', 'opts');
  const mk = (val, label, checked) => { const l = el('label'); const r = el('input'); r.type = 'radio'; r.name = 'planScope'; r.value = val; r.checked = checked; l.append(r, document.createTextNode(label)); return l; };
  opts.append(mk('all', 'Mapa inteiro', true)); if (scoped) opts.append(mk('sel', `Só "${sel.node.title}" e seus subtópicos`, false));
  const bExp = mkBtn('planExport', 'Salvar planilha…'), bPick = mkBtn('planPick', 'Importar planilha editada…', 'primary');
  const row = el('div', 'btnrow'); row.append(bExp, bPick);
  const msg = el('div', 'msg'); msg.id = 'planMsg';
  const prev = el('div', 'csv-prev'); prev.id = 'planPreview'; prev.hidden = true;
  const ok = mkBtn('planOk', 'Aplicar mudanças', 'primary'); ok.disabled = true; const cancel = mkBtn('planCancel', 'Fechar');
  const foot = el('div', 'foot'); foot.append(el('span', 'grow'), cancel, ok);
  bx.append(el('h2', '', 'Planilha de planejamento'), hint, opts, row, msg, prev, foot); m.append(bx);
  const say = (t, kind) => { msg.textContent = t || ''; msg.className = 'msg' + (kind ? ' ' + kind : ''); };
  let diff = null;
  cancel.onclick = closeModal; m.onkeydown = (e) => { if (e.key === 'Escape') { e.stopPropagation(); closeModal(); } };
  bExp.onclick = async () => {
    const scope = m.querySelector('input[name=planScope]:checked').value;
    const p = await ipcRenderer.invoke('dialog:save', 'csv', `Planejamento - ${scope === 'sel' ? sel.node.title : map.root.title}.csv`); if (!p) return;
    try { fs.writeFileSync(p, planner.exportPlan(map, { today: nowStr(), rootId: scope === 'sel' ? sel.node.id : null }), 'utf8'); say('Planilha salva em ' + p, 'ok'); }
    catch (e) { say('Não consegui salvar: ' + e.message, 'err'); }
  };
  bPick.onclick = async () => {
    const p = await ipcRenderer.invoke('dialog:open-csv'); if (!p) return;
    let buf; try { buf = fs.readFileSync(p); } catch (e) { say('Não consegui ler o arquivo: ' + e.message, 'err'); return; }
    diff = planner.diffPlan(map, buf, { today: nowStr() });
    prev.textContent = ''; prev.hidden = false; ok.disabled = !diff.ops.length; say('');
    const list = (cls, items) => { if (!items.length) return; const u = el('ul', cls); for (const t of items.slice(0, 12)) u.append(el('li', '', t)); if (items.length > 12) u.append(el('li', '', `… e mais ${items.length - 12}`)); prev.append(u); };
    const s = diff.stats;
    prev.append(el('div', 'csv-sum' + (diff.ops.length ? '' : ' err'), diff.ops.length ? `${diff.changes.length} mudança(s) em ${s.changedTopics} tópico(s)${s.created ? ` · ${s.created} tópico(s) novo(s)` : ''}` : 'Nenhuma mudança a aplicar.'));
    list('csv-disc', diff.changes.map((c) => `${c.label} — ${c.field}: ${c.from || '—'} → ${c.to || '—'}`));
    list('csv-err', diff.errors.map((e) => (e.line ? `Linha ${e.line}: ` : '') + e.msg)); list('csv-warn', diff.warnings);
  };
  ok.onclick = () => { if (diff && diff.ops.length) applyPlanDiff(diff, closeModal); };
}
/** "Aplicar mudanças" da planilha (compartilhado pelas interfaces clássica e React). Tudo ou nada; 1 desfazer. */
function applyPlanDiff(d, close) {
  close(); let n = 0;
  try { change(() => { n = planner.applyPlan(map, d); return true; }); } catch (e) { ipcRenderer.invoke('dialog:error', 'Não consegui aplicar a planilha (nada foi alterado): ' + e.message); return false; }
  render(); setStatus(`Planilha aplicada: ${n} mudança(s). Ctrl+Z desfaz tudo de uma vez.`);
  return true;
}
act.plan = () => openPlanModal();

// atalho: Esc fecha o painel de estudos
// Esc fecha o painel — mas, com uma janela aberta por cima dele (ex.: o manual), o Esc é da janela
window.addEventListener('keydown', (e) => { if (dashOpen && e.key === 'Escape' && $('#modal').hidden) { e.stopPropagation(); closeDash(); } }, true);

if (map) render(); // primeira renderização com o painel de estudo montado (no boot não há mapa: a tela inicial aparece antes)

// Renomear o tópico selecionado (botão da barra de opções e F2): abre a edição do título no próprio mapa.
act.rename = () => startEdit();
