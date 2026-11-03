import { useState } from 'react';
import { H } from './hooks.js';

/** Painel de mapas: totais dos mapas recentes, o mapa aberto e a lista para abrir. Só leitura: nada aqui altera um mapa. */
export function Dashboard({ onClose }) {
  const [data] = useState(() => H().dashData());
  const open = (r) => H().homeActions.openRecent(r);
  const cur = data.current, t = data.totals;
  return (
    <div className="dash-page">
      <header className="dash-head">
        <h2>Painel de mapas</h2>
        <button className="btn small" id="dashClose" onClick={onClose}>Fechar</button>
      </header>

      <section className="dash-sec" id="dashTotals">
        <div className="dash-cards">
          <div className="dash-card"><b>{t.maps}</b><span>mapas recentes</span></div>
          <div className="dash-card"><b>{t.topics}</b><span>tópicos</span></div>
          <div className="dash-card"><b>{t.links}</b><span>ligações e setas</span></div>
          <div className="dash-card"><b>{t.pdfs}</b><span>PDFs ligados</span></div>
        </div>
      </section>

      <section className="dash-sec" id="dashCurrent">
        <h3>Mapa aberto</h3>
        {cur ? (
          <>
            <p className="muted">{cur.name} · {cur.saved}{cur.dirty ? ' · alterações não salvas' : ''}</p>
            <div className="dash-grid">
              <div><b>{cur.topics}</b><span>tópicos</span></div>
              <div><b>{cur.depth}</b><span>níveis</span></div>
              <div><b>{cur.links}</b><span>ligações e setas</span></div>
              <div><b>{cur.notes}</b><span>com nota</span></div>
              <div><b>{cur.withoutNotes}</b><span>sem nota</span></div>
              <div><b>{cur.pdfs}</b><span>PDFs ligados</span></div>
            </div>
          </>
        ) : <div className="empty">Nenhum mapa aberto. Abra ou crie um mapa para ver o resumo aqui.</div>}
      </section>

      <section className="dash-sec" id="dashMaps">
        <h3>Mapas recentes</h3>
        {data.maps.length === 0 && <div className="empty">Os mapas que você abrir aparecem aqui.</div>}
        {data.maps.length > 0 && (
          <table className="dash-table">
            <thead><tr><th>Mapa</th><th>Tópicos</th><th>Níveis</th><th>Ligações</th><th>PDFs</th><th>Formato</th><th>Alterado</th></tr></thead>
            <tbody>
              {data.maps.map((m) => (
                <tr key={m.path} className={m.exists ? '' : 'missing'}>
                  <td>{m.exists ? <button className="link" onClick={() => open(m)} title={m.path}>{m.name}</button> : <span className="muted">{m.name} (não encontrado)</span>}</td>
                  <td>{m.topics ?? '—'}</td><td>{m.depth ?? '—'}</td><td>{m.links ?? '—'}</td><td>{m.pdfs ?? '—'}</td>
                  <td>{m.layout ?? '—'}</td><td>{m.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
