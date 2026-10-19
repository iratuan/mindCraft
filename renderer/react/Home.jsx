import { useEffect, useState } from 'react';
import { H } from './hooks.js';

const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; };
const WEEK = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const ago = (ms) => { if (!ms) return ''; const d = Math.floor((Date.now() - ms) / 86400000); return d <= 0 ? 'hoje' : d === 1 ? 'ontem' : d < 30 ? `há ${d} dias` : new Date(ms).toLocaleDateString('pt-BR'); };
const hm = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min` : `${m} min`);
const DOW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const daysTxt = (n) => (n === 0 ? 'é hoje!' : n === 1 ? 'amanhã' : `em ${n} dias`);

/** Tela inicial: atalhos, continuar de onde parou, arquivos recentes, biblioteca, próximas provas e o resumo de hoje. */
/** "Seu estudo": sequência, hoje, 7 dias (barras), acerto, metas e o que está mais atrasado. */
function Glance({ g, onReview, onDash, collapsed, onToggle }) {
  if (!g || g.scope === 'none') return null;
  if (collapsed) {                                    // uma linha só: quem prefere os atalhos e os recentes no topo recolhe o cartão (a escolha é lembrada)
    return (
      <div className="hm-sec hm-glance mini" id="hmGlance">
        <div className="gl-mini"><span><b>Seu estudo</b> <span className="muted">· {g.streak} {g.streak === 1 ? 'dia seguido' : 'dias seguidos'} · hoje {hm(g.minutesToday)} · 7 dias {hm(g.weekMinutes)}{g.laggard ? ` · atrasado: ${g.laggard.title}` : ''}</span></span> <button className="link" id="hmGlanceToggle" aria-expanded="false" onClick={onToggle}>mostrar</button></div>
      </div>
    );
  }
  const max = Math.max(30, ...g.week.map((w) => w.minutes));
  const acc = g.questions.accuracy;
  return (
    <div className="hm-sec hm-glance" id="hmGlance">
      <h3><span>Seu estudo <span className="muted">· {g.scope === 'library' ? 'em toda a biblioteca' : 'neste mapa'}</span></span> <span className="hm-links"><button className="link" id="hmGlanceDash" onClick={onDash}>painel completo</button> <button className="link" id="hmGlanceToggle" aria-expanded="true" onClick={onToggle}>recolher</button></span></h3>
      {!g.hasData && <div className="empty">Ainda sem estudo registrado nos últimos dias. Registre o tempo ou as questões no painel <b>Estudo</b> e o resumo aparece aqui.</div>}
      {g.hasData && <>
        <div className="gl-tiles">
          <div className="gl-tile" id="glStreak" title="Dias seguidos com tempo de estudo ou questões registrados (o painel de estudos do mapa conta também as revisões)"><b>{g.streak}</b><span>{g.streak === 1 ? 'dia seguido' : 'dias seguidos'}</span></div>
          <div className="gl-tile" id="glToday"><b>{hm(g.minutesToday)}</b><span>hoje</span></div>
          <div className="gl-tile" id="glWeek"><b>{hm(g.weekMinutes)}</b><span>nos últimos 7 dias</span></div>
          <div className="gl-tile" id="glAcc"><b>{acc == null ? '—' : Math.round(acc * 100) + '%'}</b><span>{acc == null ? 'sem questões na semana' : `de acerto (${g.questions.correct}/${g.questions.done})`}</span></div>
        </div>
        <div className="gl-bars" id="glBars" role="img" aria-label={'Minutos estudados por dia: ' + g.week.map((w) => `${w.date.slice(8)}/${w.date.slice(5, 7)} ${w.minutes} min`).join(', ')}>
          {g.week.map((w) => <div className="gl-col" key={w.date} title={`${w.date.slice(8)}/${w.date.slice(5, 7)}: ${w.minutes} min${w.done ? ` · ${w.correct}/${w.done} questões` : ''}`}><i style={{ height: Math.max(w.minutes ? 4 : 1, Math.round((w.minutes / max) * 100)) + '%' }} className={w.minutes ? 'on' : ''} /><small>{DOW[new Date(w.date + 'T12:00:00').getDay()]}</small></div>)}
        </div>
      </>}
      {g.goals && (g.goals.minutes || g.goals.questions) && <div className="gl-goals" id="glGoals">
        {g.goals.minutes && <div title="Meta de horas da semana"><span>Meta de estudo</span><div className="gl-bar"><i style={{ width: g.goals.minutes.pct + '%' }} /></div><small>{g.goals.minutes.pct}% · faltam {hm(g.goals.minutes.left)}</small></div>}
        {g.goals.questions && <div title="Meta de questões da semana"><span>Meta de questões</span><div className="gl-bar"><i style={{ width: g.goals.questions.pct + '%' }} /></div><small>{g.goals.questions.pct}% · faltam {g.goals.questions.left}</small></div>}
      </div>}
      {g.laggard && <div className="gl-lag" id="glLag">
        <span>🎯 {g.laggard.kind === 'discipline' ? 'Disciplina que mais precisa de você: ' : 'Mapa mais atrasado: '}<b>{g.laggard.title}</b> — {g.laggard.due} revisão(ões) vencida(s){g.laggard.progress != null ? ` · ${Math.round(g.laggard.progress)}% concluído` : ''}</span>
        <button className="btn small" id="glReview" onClick={onReview}>Revisar agora</button>
      </div>}
    </div>
  );
}

export function Home({ onClose }) {
  const h = H();
  const [d, setD] = useState(() => h.homeData());
  const refresh = () => setD(h.homeData());
  const cfg = h.loadCfg();
  const start = cfg.startScreen || (cfg.reopenLast === true ? 'last' : cfg.reopenLast === false ? 'blank' : 'home');
  const today = new Date();
  const A = h.homeActions;
  const act = (fn) => async () => { await fn(); };

  useEffect(() => {
    const f = (e) => { if (e.key === 'Escape' && document.getElementById('modal').hidden) { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f);
  }, [onClose]);

  const Big = ({ id, icon, title, sub, onClick, primary }) => <button className={'hm-big' + (primary ? ' primary' : '')} id={id} onClick={onClick}><span className="hm-ico">{icon}</span><b>{title}</b><small>{sub}</small></button>;

  return (
    <div className="hm" data-ui="react">
      <div className="hm-head">
        <div><h1>{`${greet()}!`}</h1><div className="sub">{`${WEEK[today.getDay()].replace(/^./, (c) => c.toUpperCase())}, ${today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`}</div></div>
        <span className="hm-headbtns"><button className="btn" id="hmManual" data-manual="primeiros-passos" title="Manual de uso: como usar cada funcionalidade">📘 Manual</button><button className="btn" id="hmClose" onClick={onClose}>Fechar (Esc)</button></span>
      </div>

      {d.backup && d.backup.show && (
        <div className="hm-backup" id="hmBackupBanner" role="alert">
          <span className="hm-ico">🛡</span>
          <div className="grow"><b>Faça uma cópia de segurança</b><div>{d.backup.text} Guarde o arquivo <b>fora deste aparelho</b> (nuvem, pendrive ou outro computador).</div></div>
          <button className="btn primary" id="hmBackupNow" onClick={act(async () => { if (await A.backupNow()) refresh(); })}>Fazer cópia agora</button>
          <button className="btn" id="hmBackupLater" title="Lembrar de novo em 3 dias" onClick={() => { A.backupSnooze(); refresh(); }}>Lembrar depois</button>
        </div>
      )}

      {d.last && (
        <button className="hm-continue" id="hmContinue" onClick={act(A.openLast)} title="Abrir de onde você parou">
          <span className="hm-tag">Continuar de onde parou</span>
          <b>{d.last.title}</b>
          <span className="muted">{[d.last.kind === 'lib' ? 'Biblioteca' : d.last.dir, d.last.topics ? `${d.last.topics} tópicos` : null, d.last.progress != null ? `${Math.round(d.last.progress)}% concluído` : null, d.last.due ? `${d.last.due} revisão(ões) vencida(s)` : null, d.last.examDays != null && d.last.examDays >= 0 ? `prova ${daysTxt(d.last.examDays)}` : null].filter(Boolean).join(' · ')}</span>
        </button>
      )}

      <Glance g={d.glance} collapsed={cfg.glanceCollapsed === true} onToggle={() => { h.saveCfg({ glanceCollapsed: cfg.glanceCollapsed !== true }); refresh(); }} onReview={act(A.review)} onDash={act(async () => { onClose(); h.actions.openDash && h.actions.openDash(); })} />

      <div className="hm-actions">
        <Big id="hmNew" icon="＋" title="Novo mapa" sub="em branco" onClick={act(A.newBlank)} primary={!d.last} />
        <Big id="hmTemplate" icon="🎯" title="Novo mapa de concurso" sub="modelo com disciplinas" onClick={act(A.newTemplate)} />
        <Big id="hmCsv" icon="🤖" title="Importar edital (CSV da IA)" sub="esqueleto pronto" onClick={act(A.openCsv)} />
        <Big id="hmEdital" icon="📋" title="Colar o edital" sub="texto vira tópicos" onClick={act(A.openEdital)} />
        <Big id="hmOpen" icon="📂" title="Abrir arquivo…" sub=".mom, .md, .opml" onClick={act(A.openFile)} />
        <Big id="hmLib" icon="🗄" title="Biblioteca de mapas" sub="todos os seus mapas" onClick={act(A.openLibrary)} />
        <Big id="hmPdf" icon="📖" title="Ler um PDF" sub="ao lado do mapa" onClick={act(A.openPdf)} />
        <Big id="hmSim" icon="📝" title="Registrar simulado" sub="nota por disciplina" onClick={act(A.simulado)} />
        <Big id="hmReview" icon="🧠" title="Revisão do dia" sub={d.dueHere ? `${d.dueHere} vencida(s) neste mapa` : 'recordação ativa'} onClick={act(A.review)} />
        <Big id="hmBackup" icon="🛡" title="Cópia de segurança" sub="pacote .mcpack com tudo" onClick={act(async () => { if (await A.backupNow()) refresh(); })} />
        <Big id="hmRestore" icon="♻" title="Restaurar cópia" sub="de um pacote .mcpack" onClick={act(async () => { if (await A.restorePack()) refresh(); })} />
      </div>

      <div className="hm-cols">
        <div className="hm-col">
          <div className="hm-sec" id="hmRecent">
            <h3>Arquivos recentes {d.recent.length > 0 && <button className="link" id="hmClearRecent" onClick={async () => { await A.clearRecent(); refresh(); }}>limpar lista</button>}</h3>
            {!d.recent.length && <div className="empty">Nenhum arquivo aberto ainda. Os últimos 10 aparecem aqui.</div>}
            {d.recent.map((r) => (
              <div className={'hm-row' + (r.exists ? '' : ' missing')} key={r.path} data-path={r.path}>
                <button className="hm-open" onClick={act(() => A.openRecent(r))} title={r.path}><b>{r.name}</b><span className="muted">{r.exists ? `${r.dir} · ${ago(r.mtime)}` : 'arquivo não encontrado'}</span></button>
                <button className="hm-x" title="Tirar da lista" onClick={async () => { await A.removeRecent(r.path); refresh(); }}>✕</button>
              </div>
            ))}
          </div>
        </div>
        <div className="hm-col">
          <div className="hm-sec" id="hmToday">
            <h3>Hoje</h3>
            {d.library.total === 0 && <div className="empty">A biblioteca está vazia. Guarde seus mapas nela para ver aqui as revisões e provas de todos eles.</div>}
            {d.library.total > 0 && (d.library.dueTotal
              ? <div className="hm-today"><b>{`${d.library.dueTotal} revisão(ões) vencida(s)`}</b><span className="muted">{`em ${d.library.dueMaps.length} mapa(s) da biblioteca`}</span>
                {d.library.dueMaps.slice(0, 4).map((m) => <button className="hm-chip" key={m.id} data-id={m.id} onClick={act(() => A.openLib(m.id, true))}>{`${m.title} (${m.due})`}</button>)}</div>
              : <div className="hm-today"><b>Nada vencido na biblioteca ✔</b><span className="muted">Estude um tópico novo ou resolva questões.</span></div>)}
            {d.library.openErrors > 0 && <div className="hm-today" id="hmErrors"><b>{`${d.library.openErrors} erro(s) para refazer`}</b><span className="muted">no caderno de erros dos seus mapas — refazer a questão é a melhor revisão.</span></div>}
          </div>
          <div className="hm-sec" id="hmExams">
            <h3>Próximas provas</h3>
            {!d.exams.length && <div className="empty">Nenhuma prova cadastrada nos mapas da biblioteca. Defina a data no Painel de estudos.</div>}
            {d.exams.map((e) => <button className={'hm-exam ' + (e.days <= 14 ? 'soon' : '')} key={e.id} data-id={e.id} onClick={act(() => A.openLib(e.id))}><b>{e.name || e.title}</b><span>{`${new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR')} · ${daysTxt(e.days)}`}</span></button>)}
          </div>
          <div className="hm-sec" id="hmLibList">
            <h3>Biblioteca {d.library.total > 0 && <button className="link" id="hmLibAll" onClick={act(A.openLibrary)}>ver todos ({d.library.total})</button>}</h3>
            {d.library.recent.map((m) => <div className="hm-row" key={m.id} data-id={m.id}><button className="hm-open" onClick={act(() => A.openLib(m.id))}><b>{m.title}</b><span className="muted">{`${m.topics} tópicos${m.due ? ` · ${m.due} vencida(s)` : ''}${m.exam_date ? ' · prova ' + new Date(m.exam_date + 'T12:00:00').toLocaleDateString('pt-BR') : ''}`}</span></button></div>)}
          </div>
        </div>
      </div>

      <div className="hm-foot">
        <label>Ao iniciar o MindCraft:{' '}
          <select id="hmStart" value={start} onChange={(e) => { h.saveCfg({ startScreen: e.target.value }); refresh(); }}>
            <option value="home">mostrar esta tela inicial</option>
            <option value="last">reabrir o último mapa</option>
            <option value="blank">começar com um mapa em branco</option>
          </select>
        </label>
        <label>Lembrar da cópia de segurança:{' '}
          <select id="hmBackupEvery" value={d.backup ? d.backup.every : 14} onChange={(e) => { A.backupEvery(+e.target.value); refresh(); }}>
            <option value={7}>a cada 7 dias</option><option value={14}>a cada 14 dias</option><option value={30}>a cada 30 dias</option><option value={0}>nunca</option>
          </select>
        </label>
        {d.backup && d.backup.dest && <span className="muted" id="hmBackupDest">Cópias vão para: <b>{d.backup.dest}</b> <button className="link" id="hmBackupChange" onClick={act(async () => { if (await A.backupNow({ ask: true })) refresh(); })}>trocar local</button></span>}
        <span className="muted" id="hmLastBackup">{d.backup && d.backup.lastBackup ? `Última cópia: ${new Date(d.backup.lastBackup + 'T12:00:00').toLocaleDateString('pt-BR')}` : 'Nenhuma cópia feita ainda.'}</span>
        <span className="muted">Dica: você também pode arrastar um arquivo .mom, .md, .opml ou .pdf para a janela.</span>
      </div>
    </div>
  );
}
