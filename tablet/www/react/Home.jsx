import { useState } from 'react';
import { H } from './hooks.js';

/** Quando o arquivo foi mexido pela última vez, em palavras curtas. */
const ago = (ms) => {
  if (!ms) return '';
  const d = Math.floor((Date.now() - ms) / 86400000);
  return d <= 0 ? 'hoje' : d === 1 ? 'ontem' : d < 30 ? `há ${d} dias` : new Date(ms).toLocaleDateString('pt-BR');
};

/** Tela inicial: à esquerda, o que fazer agora; à direita, de onde parou e os mapas recentes em cartões. */
export function Home() {
  const [data, setData] = useState(() => H().homeData());
  const A = H().homeActions;
  const refresh = () => setData(H().homeData());
  const remove = async (p) => { await A.removeRecent(p); refresh(); };
  const clear = async () => { await A.clearRecent(); refresh(); };
  const last = data.last;
  return (
    <div className="hm">
      <div className="hm-start">
        <div className="hm-brand">
          <img className="hm-logo" src="assets/logo.svg" alt="" height="40" />
          <h1>BRANIAC</h1>
        </div>
        <p className="hm-lead">Seu grande cérebro para mapas mentais. Abre e salva no formato do Mindomo.</p>

        <div className="hm-actions">
          <button className="hm-action primary" id="hmNew" onClick={() => A.newBlank()}>
            <b>Novo mapa</b><span>Começa com a ideia central e três tópicos</span>
          </button>
          <button className="hm-action" id="hmOpen" onClick={() => A.openFile()}>
            <b>Abrir arquivo .mom</b><span>Um mapa do Mindomo ou salvo aqui</span>
          </button>
          <button className="hm-action" id="hmPdf" onClick={() => A.openPdf()}>
            <b>Ler um PDF</b><span>Selecione um trecho para virar tópico</span>
          </button>
          <button className="hm-action" id="hmDash" onClick={() => H().openDash()}>
            <b>Painel de mapas</b><span>Resumo dos seus mapas</span>
          </button>
        </div>
      </div>

      <div className="hm-main">
        {last && (
          <section className="hm-sec hm-continue-sec" id="hmLast">
            <h3>Continuar de onde parou</h3>
            <button className="hm-continue" id="hmContinue" onClick={() => A.openRecent(last)}>
              <b>{last.name}</b>
              <span className="muted">{last.dir} · {ago(last.mtime)}</span>
            </button>
          </section>
        )}

        <section className="hm-sec" id="hmRecent">
          <h3>
            <span>Mapas recentes</span>
            {data.recent.length > 0 && <button className="link" id="hmClear" onClick={clear}>limpar lista</button>}
          </h3>
          {data.recent.length === 0 && (
            <div className="empty">Nenhum mapa aberto ainda. Crie um novo ou arraste um arquivo .mom para esta janela.</div>
          )}
          <ul className="hm-cards">
            {data.recent.map((r) => (
              <li key={r.path} className={'hm-card' + (r.exists ? '' : ' missing')}>
                <button className="hm-card-open" disabled={!r.exists} onClick={() => A.openRecent(r)} title={r.path}>
                  <b>{r.name}</b>
                  <span className="muted">{r.exists ? `${r.dir}` : 'arquivo não encontrado'}</span>
                  <span className="hm-card-when">{r.exists ? ago(r.mtime) : ''}</span>
                </button>
                <button className="icon-btn sm hm-card-x" title="Tirar da lista (o arquivo não é apagado)" aria-label={'Tirar da lista: ' + r.name} onClick={() => remove(r.path)}>×</button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
