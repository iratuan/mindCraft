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

/** Caderno de erros: por motivo, tópicos com mais erros e os mais recentes. */
function Errors({ s }) {
  const h = H(), e = s.errors, S = h.S;
  const max = Math.max(1, ...Object.values(e.byWhy));
  return (
    <div className="dash-sec" id="errSec">
      <h3>{`Caderno de erros (${e.total})`}</h3>
      {!e.total && <div className="empty">Nenhum erro registrado. No painel Estudo, escolha o motivo e anote o que errou: aqui aparece onde você mais tropeça.</div>}
      {e.total > 0 && (
        <>
          <div className="err-bars">{Object.entries(e.byWhy).sort((a, b) => b[1] - a[1]).map(([k, n]) => <div className="err-bar" key={k} data-why={k}><span>{S.ERR_REASONS[k]}</span><Bar pct={(n / max) * 100} style={{ flex: 1 }} /><b>{n}</b></div>)}</div>
          <div className="muted">{`${e.week} nos últimos 7 dias · mais erros em: ${e.topics.slice(0, 3).map((t) => `${t.title} (${t.count})`).join(', ')}`}</div>
          {e.recent.map((r, i) => <ReviewRow key={i} it={{ ...r, sub: `${S.ERR_REASONS[r.why]} · ${h.fmtDate(r.d)}${r.note ? ' — ' + r.note : ''}` }} onClick={() => h.goTo(r.id)} />)}
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
          <div className="sub">{`Hoje: ${h.fmtDate(today)}`}</div>
          <div className="dash-opts">
            <Option id="optReopen" label="Reabrir o último mapa ao iniciar" keyName="reopenLast" on={cfg.reopenLast !== false} refresh={refresh} />
            <Option id="optDashStart" label="Abrir este painel ao iniciar" keyName="dashOnStart" on={!!cfg.dashOnStart} refresh={refresh} />
            <Option id="optNewInLib" label="Salvar mapas novos na biblioteca" keyName="newInLibrary" on={!!cfg.newInLibrary} refresh={refresh} />
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
          <Errors s={s} />
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
        <button className="btn" id="btnTemplate" onClick={() => h.actions.newStudyTemplate()}>Novo mapa de concurso (modelo)</button>
        <button className="btn primary" id="btnDashClose" onClick={() => h.actions.closeDash()}>Fechar</button>
      </div>
    </>
  );
}
