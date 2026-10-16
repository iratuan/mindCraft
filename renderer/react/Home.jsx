import { useEffect, useState } from 'react';
import { H } from './hooks.js';

const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; };
const WEEK = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const ago = (ms) => { if (!ms) return ''; const d = Math.floor((Date.now() - ms) / 86400000); return d <= 0 ? 'hoje' : d === 1 ? 'ontem' : d < 30 ? `há ${d} dias` : new Date(ms).toLocaleDateString('pt-BR'); };
const daysTxt = (n) => (n === 0 ? 'é hoje!' : n === 1 ? 'amanhã' : `em ${n} dias`);

/** Tela inicial: atalhos, continuar de onde parou, arquivos recentes, biblioteca, próximas provas e o resumo de hoje. */
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
        <button className="btn" id="hmClose" onClick={onClose}>Fechar (Esc)</button>
      </div>

      {d.last && (
        <button className="hm-continue" id="hmContinue" onClick={act(A.openLast)} title="Abrir de onde você parou">
          <span className="hm-tag">Continuar de onde parou</span>
          <b>{d.last.title}</b>
          <span className="muted">{[d.last.kind === 'lib' ? 'Biblioteca' : d.last.dir, d.last.topics ? `${d.last.topics} tópicos` : null, d.last.progress != null ? `${Math.round(d.last.progress)}% concluído` : null, d.last.due ? `${d.last.due} revisão(ões) vencida(s)` : null, d.last.examDays != null && d.last.examDays >= 0 ? `prova ${daysTxt(d.last.examDays)}` : null].filter(Boolean).join(' · ')}</span>
        </button>
      )}

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
        <span className="muted">Dica: você também pode arrastar um arquivo .mom, .md, .opml ou .pdf para a janela.</span>
      </div>
    </div>
  );
}
