import { Fragment, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { H } from './hooks.js';

let agendaSel = null;                      // dia escolhido na agenda (sobrevive aos redesenhos do painel, como na versão clássica)
const pathTxt = (r) => [...r.path].join(' › ');
const AGENDA_H = 'DSTQQSS';

const Card = ({ k, v, s, children }) => <div className="card"><div className="k">{k}</div><div className="v">{v}</div>{s != null && <div className="s">{s}</div>}{children}</div>;
const Bar = ({ pct, cls, style }) => <div className={'bar' + (cls ? ' ' + cls : '')} style={style}><i style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} /></div>;
const Tag = ({ overdue }) => <span className={'tag ' + (overdue > 0 ? 'late' : 'today')}>{overdue > 0 ? `${overdue} d de atraso` : 'hoje'}</span>;

function ReviewRow({ it, onClick, right, dataReview }) {
  return (
    <div className="rev" data-review={dataReview}>
      <div className="t" onClick={onClick}><b>{it.title}</b><span>{it.sub || pathTxt(it) || 'raiz'}</span></div>
      {right}
    </div>
  );
}

function Agenda({ s }) {
  const h = H();
  const [, set] = useState(0);
  const first = s.agenda.find((d) => d.count) || s.agenda[0];
  const pick = s.agenda.find((d) => d.date === agendaSel) || first;
  agendaSel = pick.date;
  const [y, m, d] = s.today.split('-').map(Number);
  const pads = new Date(y, m - 1, d).getDay();
  return (
    <div className="dash-sec" id="agenda">
      <h3>{`Agenda de revisões — próximos ${h.S.AGENDA_DAYS} dias`}</h3>
      <div className="agenda">
        {[...AGENDA_H].map((c, i) => <div className="ag-h" key={'h' + i}>{c}</div>)}
        {Array.from({ length: pads }, (_, i) => <div className="ag-pad" key={'p' + i} />)}
        {s.agenda.map((day) => {
          const lvl = day.count >= 4 ? 3 : day.count >= 2 ? 2 : day.count ? 1 : 0;
          const cls = 'ag-day' + (lvl ? ' has l' + lvl : '') + (day.date === s.today ? ' today' : '') + (day.items.some((x) => x.overdue > 0) ? ' late' : '') + (day.date === pick.date ? ' sel' : '');
          return (
            <button key={day.date} className={cls} data-date={day.date} title={`${h.fmtDate(day.date)}: ${day.count} revisão(ões)`} onClick={() => flushSync(() => { agendaSel = day.date; set((n) => n + 1); })}>
              <i>{String(+day.date.slice(8))}</i>{day.count ? <b>{String(day.count)}</b> : null}
            </button>
          );
        })}
      </div>
      <div className="ag-detail" id="agendaDetail">
        <div className="ag-title">{`${h.fmtDate(pick.date)} — ${pick.count} revisão(ões)${pick.date === s.today ? ' (inclui as atrasadas)' : ''}`}</div>
        {!pick.count && <div className="empty">Nada agendado para este dia.</div>}
        {pick.items.slice(0, 12).map((it) => <ReviewRow key={it.id} it={it} onClick={() => h.goTo(it.id)} right={it.overdue !== undefined ? <Tag overdue={it.overdue} /> : null} />)}
        {pick.count > 12 && <div className="empty">{`+ ${pick.count - 12} no dia`}</div>}
      </div>
    </div>
  );
}

function Weak({ s }) {
  const h = H(), S = h.S;
  return (
    <div className="dash-sec" id="weakSec">
      <h3>{`Pontos fracos (${s.weak.length})`}</h3>
      {!s.weak.length && <div className="empty">{`Nenhum: aparecem aqui os tópicos com pelo menos ${S.WEAK_MIN} questões e acerto abaixo de ${Math.round(S.WEAK_ACCURACY * 100)}%.`}</div>}
      {s.weak.map((w) => <ReviewRow key={w.id} it={w} onClick={() => h.goTo(w.id)} right={<span className="tag late">{`${w.correct}/${w.done} · ${h.pctTxt(w.accuracy * 100)}`}</span>} />)}
    </div>
  );
}

/** Metas semanais (minutos e questões nos últimos 7 dias): progresso + edição. */
function Goals({ s }) {
  const h = H(), map = h.map(), g = map.meta.goals || {};
  const [msg, setMsg] = useState({ text: '', kind: '' });
  const save = (clear) => {
    try {
      const hours = parseFloat(String(document.getElementById('goalHours').value).replace(',', '.')), q = parseInt(document.getElementById('goalQuestions').value, 10);
      const goals = clear ? null : { minutesWeek: Number.isFinite(hours) && hours > 0 ? Math.round(hours * 60) : 0, questionsWeek: Number.isFinite(q) && q > 0 ? q : 0 };
      if (!clear && !goals.minutesWeek && !goals.questionsWeek) throw new Error('Informe as horas por semana e/ou as questões por semana.');
      h.setGoals(goals); setMsg({ text: clear ? 'Metas removidas.' : 'Metas salvas.', kind: 'ok' });
    } catch (e) { setMsg({ text: e.message, kind: 'err' }); }
  };
  const row = (label, x, unit) => x && <div className="goal-row" data-goal={unit}><span>{label}</span><Bar pct={x.pct} cls={x.pct >= 100 ? 'ok' : ''} style={{ flex: 1 }} /><b>{x.pct}%</b><span className="muted">{x.left ? `faltam ${unit === 'min' ? h.fmtMin(x.left) : x.left + ' questões'}` : 'meta batida ✔'}</span></div>;
  return (
    <div className="dash-sec" id="goals">
      <h3>Metas semanais (últimos 7 dias)</h3>
      {s.goals && <div className="goal-bars">{row('Estudo', s.goals.minutes, 'min')}{row('Questões', s.goals.questions, 'q')}</div>}
      <div className="goal-form">
        <label>Horas por semana <input id="goalHours" type="text" inputMode="decimal" style={{ width: 64 }} defaultValue={g.minutesWeek ? String(g.minutesWeek / 60).replace('.', ',') : ''} key={'h' + (g.minutesWeek || 0)} /></label>
        <label>Questões por semana <input id="goalQuestions" type="text" inputMode="numeric" style={{ width: 64 }} defaultValue={g.questionsWeek ? String(g.questionsWeek) : ''} key={'q' + (g.questionsWeek || 0)} /></label>
        <button className="btn primary" id="goalSave" onClick={() => save(false)}>Salvar metas</button>
        {map.meta.goals && <button className="btn" id="goalClear" onClick={() => save(true)}>Remover</button>}
        <span className={'msg' + (msg.kind ? ' ' + msg.kind : '')} id="goalMsg">{msg.text}</span>
      </div>
    </div>
  );
}

/** Simulados: evolução (gráfico), médias, disciplinas mais fracas e os últimos registros. */
function Simulados() {
  const h = H(), list = h.map().meta.simulados || [], st = h.simuladoStats(list);
  const W = 420, HH = 110, pad = 14, pts = st.series.map((p, i) => ({ ...p, x: st.series.length === 1 ? W / 2 : pad + (i * (W - 2 * pad)) / (st.series.length - 1), y: HH - pad - (p.pct / 100) * (HH - 2 * pad) }));
  const arrow = (v) => (v == null ? '' : v > 0.5 ? ` ▲ +${Math.round(v)} pp` : v < -0.5 ? ` ▼ ${Math.round(v)} pp` : ' ▬');
  return (
    <div className="dash-sec" id="simSec">
      <h3>{`Simulados (${st.count})`}<button className="link" id="btnSim" onClick={() => h.actions.openSimulado()}>＋ registrar simulado</button></h3>
      {!st.count && <div className="empty">Nenhum simulado registrado. Use "＋ registrar simulado" para acompanhar a sua nota por disciplina ao longo do tempo.</div>}
      {st.count > 0 && (
        <>
          <div className="muted" id="simSummary">{`média ${h.pctTxt(st.avg)} · melhor ${h.pctTxt(st.best.pct)} (${st.best.name}) · último ${h.pctTxt(st.last.pct)}${arrow(st.delta)}`}</div>
          <svg className="sim-chart" viewBox={`0 0 ${W} ${HH}`} role="img" aria-label="Evolução da nota nos simulados">
            {[0, 50, 100].map((g) => <line key={g} x1={pad} x2={W - pad} y1={HH - pad - (g / 100) * (HH - 2 * pad)} y2={HH - pad - (g / 100) * (HH - 2 * pad)} className="grid" />)}
            {pts.length > 1 && <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} className="line" />}
            {pts.map((p) => <circle key={p.id} cx={p.x} cy={p.y} r="4" className="dot"><title>{`${p.name} (${h.fmtDate(p.d)}): ${h.pctTxt(p.pct)}`}</title></circle>)}
          </svg>
          <div className="sim-discs">{st.discs.slice(0, 6).map((d) => <div className="err-bar" key={d.disc} data-disc={d.disc}><span>{d.disc}</span><Bar pct={d.pct} style={{ flex: 1 }} cls={d.pct < 60 ? 'bad' : ''} /><b>{Math.round(d.pct)}%</b><span className="muted">{arrow(d.trend).trim()}</span></div>)}</div>
          {[...list].sort((a, b) => b.d.localeCompare(a.d)).slice(0, 5).map((s) => { const t = st.series.find((x) => x.id === s.id); return (
            <div className="rev" key={s.id} data-sim={s.id}><div className="t"><b>{s.name}</b><span>{`${h.fmtDate(s.d)}${s.banca ? ' · ' + s.banca : ''}${s.minutes ? ' · ' + h.fmtMin(s.minutes) : ''} · ${t.correct}/${t.done}`}</span></div><span className="tag">{h.pctTxt(t.pct)}</span><button className="mini sim-del" title="Apagar este simulado" onClick={() => h.removeSimulado(s.id)}>✕</button></div>); })}
        </>
      )}
    </div>
  );
}

/** Caderno de erros: por motivo, tópicos com mais erros e os mais recentes. */
const pctOf = (c) => (c.done ? Math.round((c.correct / c.done) * 100) : 0);

/** Acerto por banca e por ano do mapa aberto (só o que foi registrado com banca/ano). */
function QuestionsBySource({ s }) {
  const h = H(), qb = s.questionsBy, tem = (qb.banca.length > 1 || (qb.banca[0] && qb.banca[0].name !== 'Sem banca')) || qb.year.some((y) => y.year);
  const Tbl = ({ rows, label, id }) => (
    <table className="tbl" id={id}><thead><tr><th>{label}</th><th className="num">Feitas</th><th>Acerto</th></tr></thead><tbody>
      {rows.map((c) => <tr key={c.name} data-key={c.name}><td>{c.name}</td><td className="num">{`${c.correct}/${c.done}`}</td><td><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Bar pct={pctOf(c)} cls={pctOf(c) < 70 ? 'warn' : ''} style={{ flex: 1 }} /><span>{h.pctTxt(c.accuracy * 100)}</span></div></td></tr>)}
    </tbody></table>
  );
  return (
    <div className="dash-sec" id="qsrcSec">
      <h3>Questões por banca e ano</h3>
      {!tem && <div className="empty">Registre as questões informando a <b>banca</b> e o <b>ano</b> (painel Estudo) para ver aqui onde você acerta menos — cada banca tem um estilo.</div>}
      {tem && <><Tbl rows={qb.banca} label="Banca" id="qsrcBanca" /><div style={{ height: 10 }} /><Tbl rows={qb.year} label="Ano" id="qsrcYear" /></>}
    </div>
  );
}

function Errors({ s, today }) {
  const h = H(), e = s.errors, S = h.S;
  const [f, setF] = useState({ state: 'open', banca: '', year: '', why: '' });
  const set = (k) => (ev) => setF((o) => ({ ...o, [k]: ev.target.value }));
  const max = Math.max(1, ...Object.values(e.byWhy));
  const bancas = [...new Set(e.list.map((r) => r.banca).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const years = [...new Set(e.list.map((r) => r.year).filter(Boolean))].sort((a, b) => b - a);
  const rows = e.list.filter((r) => (f.state === 'all' || (f.state === 'open' ? !r.redo : !!r.redo)) && (!f.banca || r.banca === f.banca) && (!f.year || String(r.year) === f.year) && (!f.why || r.why === f.why));
  const redo = (r, ok) => h.redoError(r.id, r.i, today, ok);
  return (
    <div className="dash-sec" id="errSec">
      <h3>{`Caderno de erros (${e.total})`}</h3>
      {!e.total && <div className="empty">Nenhum erro registrado. No painel Estudo, escolha o motivo e anote o que errou: aqui aparece onde você mais tropeça.</div>}
      {e.total > 0 && (
        <>
          <div className="err-bars">{Object.entries(e.byWhy).sort((a, b) => b[1] - a[1]).map(([k, n]) => <div className="err-bar" key={k} data-why={k}><span>{S.ERR_REASONS[k]}</span><Bar pct={(n / max) * 100} style={{ flex: 1 }} /><b>{n}</b></div>)}</div>
          <div className="muted" id="errStats">{`${e.open} para refazer · ${e.redoneOk} refeito(s) e acertado(s) · ${e.redoneBad} errado(s) de novo · ${e.week} nos últimos 7 dias · mais erros em: ${e.topics.slice(0, 3).map((t) => `${t.title} (${t.count})`).join(', ')}`}</div>
          <div className="err-filters">
            <select id="errFState" aria-label="Situação" value={f.state} onChange={set('state')}><option value="open">Para refazer</option><option value="done">Já refeitos</option><option value="all">Todos</option></select>
            <select id="errFWhy" aria-label="Motivo" value={f.why} onChange={set('why')}><option value="">Todos os motivos</option>{Object.entries(S.ERR_REASONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <select id="errFBanca" aria-label="Banca" value={f.banca} onChange={set('banca')}><option value="">Todas as bancas</option>{bancas.map((b) => <option key={b} value={b}>{b}</option>)}</select>
            <select id="errFYear" aria-label="Ano" value={f.year} onChange={set('year')}><option value="">Todos os anos</option>{years.map((y) => <option key={y} value={String(y)}>{y}</option>)}</select>
          </div>
          {!rows.length && <div className="empty" id="errEmpty">{f.state === 'open' && !f.banca && !f.year && !f.why ? 'Nada para refazer. ✔' : 'Nenhum erro com esses filtros.'}</div>}
          {rows.slice(0, 40).map((r) => (
            <ReviewRow key={r.id + ':' + r.i} dataReview={undefined} it={{ ...r, sub: `${S.ERR_REASONS[r.why]} · ${h.fmtDate(r.d)}${r.banca || r.year ? ' · ' + [r.banca, r.year].filter(Boolean).join(' ') : ''}${r.note ? ' — ' + r.note : ''}` }} onClick={() => h.goTo(r.id)} right={
              r.redo
                ? <><span className={'tag ' + (r.redo.ok ? 'today' : 'late')}>{r.redo.ok ? 'acertei ao refazer' : 'errei de novo'}</span><button className="mini" title="Voltar para “refazer”" data-act="err-redo-clear" data-err={r.id + ':' + r.i} onClick={() => redo(r, null)}>↶</button></>
                : <><button className="mini" title="Refiz e acertei" data-act="err-redo-ok" data-err={r.id + ':' + r.i} onClick={() => redo(r, true)}>✔</button><button className="mini" title="Refiz e errei de novo" data-act="err-redo-bad" data-err={r.id + ':' + r.i} onClick={() => redo(r, false)}>✖</button></>
            } />
          ))}
          {rows.length > 40 && <div className="muted">{`… e mais ${rows.length - 40}. Use os filtros para refinar.`}</div>}
        </>
      )}
    </div>
  );
}

function Others({ today }) {
  const h = H();
  if (!h.hasOtherSources()) return <div />;
  let v;
  try { v = h.vaultDue(today); } catch (e) { h.reportError('Revisões de outros mapas: ' + e.message); return <div />; }
  if (!v.scanned) return <div />;
  const total = v.maps.reduce((t, m) => t + m.count, 0);
  return (
    <div className="dash-sec" id="otherMaps">
      <h3>{`Em outros mapas (${total})`}</h3>
      {!v.maps.length && <div className="empty">{`Nenhuma revisão pendente nos outros ${v.scanned} mapa(s) da pasta.`}</div>}
      {v.maps.map((mp) => (
        <Fragment key={mp.key}>
          {mp.items.map((it) => <ReviewRow key={it.id} it={{ ...it, sub: `${mp.name}${it.path.length ? ' › ' + it.path.join(' › ') : ''}` }} onClick={() => h.openTopic({ kind: 'topic', mapKey: mp.key, topicId: it.id })} right={<Tag overdue={it.overdue} />} />)}
          {mp.count > mp.items.length && <div className="empty">{`+ ${mp.count - mp.items.length} em "${mp.name}"`}</div>}
        </Fragment>
      ))}
    </div>
  );
}

function Option({ id, label, keyName, on, refresh }) {
  const h = H();
  return <label className="opt"><input type="checkbox" id={id} checked={on} onChange={(e) => { h.saveCfg({ [keyName]: e.target.checked }); refresh(); }} />{label}</label>;
}

/** Painel de estudos (sobreposição #dash). Mesma estrutura e classes da versão clássica (renderDashClassic). */
export function Dashboard() {
  const h = H(), S = h.S, map = h.map();
  const [, set] = useState(0);
  const refresh = () => set((n) => n + 1);
  const [dmsg, setDmsg] = useState({ text: '', kind: '' });
  const today = h.nowStr(), s = S.summary(map, { today }), cfg = h.loadCfg();
  const exam = s.exam;
  const start = cfg.startScreen || (cfg.reopenLast === true ? 'last' : cfg.reopenLast === false ? 'blank' : 'home');   // mesma regra da inicialização (renderer.js)
  const n = exam ? exam.daysLeft : null;
  useEffect(() => { document.getElementById('dash').dataset.ui = 'react'; }, []);

  const onSave = () => {
    try {
      const date = document.getElementById('examDate').value;
      if (!date) throw new Error('Informe a data da prova.');
      h.setExam({ name: document.getElementById('examName').value.trim(), date });
    } catch (e) { setDmsg({ text: e.message, kind: 'err' }); }
  };

  return (
    <>
      <div className="dash-head">
        <div>
          <h2>{`Painel de estudos — ${map.root.title}`}</h2>
          <div className="sub">{`Hoje: ${h.fmtDate(today)}`} <button className="link" id="dashHelp" data-manual="painel-estudos" title="Manual: como usar o painel de estudos">Como usar?</button></div>
          <div className="dash-opts">
            <label className="opt"><input type="checkbox" id="optReopen" checked={start === 'last'} onChange={(e) => { h.saveCfg({ reopenLast: e.target.checked, startScreen: e.target.checked ? 'last' : (start === 'last' ? 'home' : start) }); refresh(); }} />Reabrir o último mapa ao iniciar</label>
            <Option id="optDashStart" label="Abrir este painel ao iniciar" keyName="dashOnStart" on={!!cfg.dashOnStart} refresh={refresh} />
            <Option id="optNewInLib" label="Salvar mapas novos na biblioteca" keyName="newInLibrary" on={!!cfg.newInLibrary} refresh={refresh} />
            <Option id="optNotify" label="Avisar das revisões do dia às" keyName="notifyDaily" on={cfg.notifyDaily === true} refresh={refresh} />
            <input type="time" id="optNotifyAt" aria-label="Horário do aviso diário" value={cfg.notifyAt || '08:00'} disabled={cfg.notifyDaily !== true} onChange={(e) => { if (/^\d\d:\d\d$/.test(e.target.value)) { h.saveCfg({ notifyAt: e.target.value }); refresh(); } }} />
            <button className="btn small" id="optNotifyTest" title="Mostra um aviso agora, para conferir se o sistema o exibe" onClick={() => h.notifyTest()}>Testar aviso</button>
            <span className="muted" title="Nada é agendado no sistema: o aviso aparece se o MindCraft estiver aberto no horário (ou ao abri-lo depois dele)">só com o app aberto</span>
          </div>
        </div>
        <div className="dash-exam">
          <div className={'countdown' + (exam ? ' ' + (n < 0 ? 'past' : n === 0 ? 'today' : n <= 14 ? 'soon' : 'far') : '')}>
            {exam
              ? <><b>{n >= 0 ? String(n) : String(-n)}</b><span>{n > 0 ? (n === 1 ? 'dia para a prova' : 'dias para a prova') : n === 0 ? 'a prova é hoje' : 'dias desde a prova'}</span></>
              : <><b>—</b><span>sem data de prova</span></>}
          </div>
          <input type="text" id="examName" placeholder="Nome da prova / concurso" style={{ width: 190 }} aria-label="Nome da prova" defaultValue={exam ? exam.name : ''} key={'n' + (exam ? exam.name : '')} />
          <input type="date" id="examDate" aria-label="Data da prova" defaultValue={exam ? exam.date : ''} key={'d' + (exam ? exam.date : '')} />
          <button className="btn primary" id="examSave" onClick={onSave}>Salvar prova</button>
          <button className="btn" id="examClear" onClick={() => h.setExam(null)}>Limpar</button>
          <div className={'msg' + (dmsg.kind ? ' ' + dmsg.kind : '')} id="dashMsg" style={{ flexBasis: '100%', textAlign: 'right' }}>{dmsg.text}</div>
        </div>
      </div>

      <div className="cards">
        <Card k="Progresso geral" v={h.pctTxt(s.overall)} s={`${s.doneLeaves} de ${s.totalLeaves} tópicos concluídos`}><Bar pct={s.overall} /></Card>
        <Card k="Hoje" v={h.fmtMin(s.minutes.today)} s={`${s.reviewsToday} revisão(ões) registrada(s)`} />
        <Card k="Últimos 7 dias" v={h.fmtMin(s.minutes.week)} s={`Total: ${h.fmtMin(s.minutes.total)}`}>
          <div className="week">
            {(() => { const mx = Math.max(1, ...s.week.map((d) => d.minutes)); return s.week.map((d) => { const [y, m, dd] = d.date.split('-').map(Number); return <div key={d.date}><i style={{ height: `${(d.minutes / mx) * 100}%` }} title={`${h.fmtDate(d.date)}: ${h.fmtMin(d.minutes)}`} /><span>{'DSTQQSS'[new Date(y, m - 1, dd).getDay()]}</span></div>; }); })()}
          </div>
        </Card>
        <Card k="Sequência" v={`${s.streak} dia${s.streak === 1 ? '' : 's'}`} s={s.streak ? 'estudando sem pausa' : 'estude hoje para começar'} />
        <Card k="Questões" v={s.questions.accuracy == null ? '—' : h.pctTxt(s.questions.accuracy * 100)} s={`${s.questions.correct} acertos em ${s.questions.done}` + (s.questions.week.done ? ` · 7 dias: ${s.questions.week.correct}/${s.questions.week.done} (${h.pctTxt(s.questions.week.accuracy * 100)})` : '')} />
        {s.plan
          ? <Card k="Plano até a prova" v={`${String(s.plan.topicsPerDay).replace('.', ',')} /dia`} s={`${s.plan.pendingTopics} tópicos pendentes em ${s.plan.daysLeft} dias`} />
          : <Card k="Plano até a prova" v="—" s={s.exam ? (s.exam.daysLeft === 0 ? 'a prova é hoje' : 'prova já realizada') : 'defina a data da prova'} />}
      </div>

      <Goals s={s} />

      <div className="dash-grid">
        <div>
          <div className="dash-sec">
            <h3>Disciplinas</h3>
            {!s.disciplines.length
              ? <div className="empty">O mapa ainda não tem disciplinas (filhos da raiz). Importe o edital ou use o modelo de concurso.</div>
              : (
                <table className="tbl"><tbody>
                  <tr>{['Disciplina', 'Progresso', 'Tópicos', 'Tempo', 'Acerto', 'Rev.'].map((x) => <th key={x}>{x}</th>)}</tr>
                  {s.disciplines.map((d) => (
                    <tr className="click" key={d.id} data-goto={d.id} title="Ir para a disciplina no mapa" onClick={() => h.goTo(d.id)}>
                      <td>{d.title}</td>
                      <td><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Bar pct={d.progress} style={{ flex: 1 }} /><span>{h.pctTxt(d.progress)}</span></div></td>
                      <td className="num">{`${d.done}/${d.leaves}`}</td><td className="num">{h.fmtMin(d.minutes)}</td>
                      <td className="num">{d.qDone ? h.pctTxt(d.accuracy * 100) : '—'}</td><td className="num">{String(d.due)}</td>
                    </tr>
                  ))}
                </tbody></table>
              )}
          </div>
          <Agenda s={s} />
          <QuestionsBySource s={s} />
          <Errors s={s} today={today} />
          <Simulados />
        </div>
        <div>
          <div className="dash-sec">
            <h3>{`Revisões pendentes (${s.due.length})`}</h3>
            {!s.due.length && <div className="empty">Nenhuma revisão pendente. ✔</div>}
            {s.due.map((r) => (
              <ReviewRow key={r.id} it={r} dataReview={r.id} onClick={() => h.goTo(r.id)} right={
                <>
                  <Tag overdue={r.overdue} />
                  <button className="mini" title="Revisei (lembrei)" data-act="rev-ok" onClick={() => h.review(r.id, today, true)}>✓</button>
                  <button className="mini" title="Errei — rever amanhã" data-act="rev-bad" onClick={() => h.review(r.id, today, false)}>↻</button>
                </>
              } />
            ))}
          </div>
          <div className="dash-sec">
            <h3>Próximos 7 dias</h3>
            {!s.upcoming.length && <div className="empty">Nenhuma revisão agendada.</div>}
            {s.upcoming.map((r) => <ReviewRow key={r.id} it={r} onClick={() => h.goTo(r.id)} right={<span className="tag">{h.fmtDate(r.next)}</span>} />)}
          </div>
          <Weak s={s} />
          <Others today={today} />
        </div>
      </div>

      <div className="dash-actions">
        <button className="btn primary" id="btnReview" onClick={() => h.actions.openReview()}>Revisão do dia</button>
        <button className="btn" id="btnIcs" onClick={() => h.actions.exportIcs()}>Agenda (.ics)</button>
        <button className="btn" id="btnReportMd" onClick={() => h.actions.exportReport('md')}>Relatório (.md)</button>
        <button className="btn" id="btnReportDocx" onClick={() => h.actions.exportReport('docx')}>Relatório (.docx)</button>
        <button className="btn" id="btnEdital" onClick={() => h.actions.openImportModal()}>Importar edital…</button>
        <button className="btn" id="btnCsv" onClick={() => h.actions.openCsvModal()}>Importar CSV (IA)…</button>
        <button className="btn" id="btnPlan" onClick={() => h.actions.openPlanModal()}>Planilha de planejamento…</button>
        <button className="btn" id="btnLib" onClick={() => h.actions.openLibraryModal()}>Biblioteca de mapas…</button>
        <button className="btn" id="btnTemplate" onClick={() => h.actions.newStudyTemplate()}>Novo mapa de concurso…</button>
        <button className="btn primary" id="btnDashClose" onClick={() => h.actions.closeDash()}>Fechar</button>
      </div>
    </>
  );
}
