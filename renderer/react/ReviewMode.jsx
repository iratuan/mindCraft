import { useEffect, useMemo, useState } from 'react';
import { H, useEscape } from './hooks.js';
import { FlatIcon } from './FlatIcon.jsx';

/**
 * Revisão do dia — recordação ativa: mostra só o TÓPICO (a "pergunta"); você tenta lembrar e só então revela as anotações.
 * Depois responde "Lembrei" (avança no ciclo 1-7-15-30-60-120) ou "Errei" (volta ao início: rever amanhã).
 */
export function ReviewMode({ onClose }) {
  const h = H();
  const today = h.nowStr();
  const queue = useMemo(() => h.S.summary(h.map(), { today }).due, []);   // fotografia no início: a fila não muda no meio
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [tally, setTally] = useState({ ok: 0, bad: 0, skip: 0 });
  useEscape(onClose);

  const item = queue[i];
  const found = item ? h.map().find(item.id) : null, node = found ? found.node : null;
  const finished = i >= queue.length;
  const next = (k) => { setTally((t) => ({ ...t, [k]: t[k] + 1 })); setShown(false); setI((n) => n + 1); };
  const answer = (ok) => { if (!item || !node) { next('skip'); return; } if (h.review(item.id, today, ok)) next(ok ? 'ok' : 'bad'); };

  useEffect(() => {
    const m = h.modalEl();
    const f = (e) => {
      if (finished || e.target.closest('input, textarea, select')) return;
      const k = e.key.toLowerCase();
      if (k === ' ' || k === 'enter') { e.preventDefault(); setShown(true); }
      else if (shown && k === 'y') answer(true);
      else if (shown && k === 'n') answer(false);
      else if (k === 's') next('skip');
    };
    m.addEventListener('keydown', f); return () => m.removeEventListener('keydown', f);
  });
  useEffect(() => { const b = document.getElementById(shown ? 'rvOk' : 'rvShow'); if (b) b.focus(); }, [i, shown]);

  if (finished) {
    return (
      <div className="modal-box" id="rvBox" data-ui="react">
        <h2>Revisão do dia</h2>
        <div className="rv-done" id="rvDone">
          {queue.length ? <><b>Revisão concluída ✔</b><div>{`${tally.ok} lembrei · ${tally.bad} errei (volta amanhã) · ${tally.skip} pulado(s)`}</div></> : <><b>Nenhuma revisão pendente hoje ✔</b><div>Bom trabalho! Estude um tópico novo ou resolva questões.</div></>}
        </div>
        <div className="foot"><span className="grow" /><button className="btn primary" id="rvClose" onClick={onClose}>Fechar</button></div>
      </div>
    );
  }
  const refs = node && node.refs ? node.refs : [];
  const pdfs = h.map().meta.pdfs || [];
  const errs = node && node.study && node.study.errs ? node.study.errs : [];
  const hasDetail = !!(node && ((node.notes || '').trim() || refs.length || errs.length));
  return (
    <div className="modal-box" id="rvBox" data-ui="react">
      <h2>Revisão do dia <span className="muted" id="rvCount">{`${i + 1} / ${queue.length}`}</span></h2>
      <div className="rv-card">
        <div className="rv-path">{[...item.path].join(' › ') || 'raiz'}</div>
        <div className="rv-title" id="rvTitle">{item.title}</div>
        <div className="rv-tag">{item.overdue > 0 ? `${item.overdue} dia(s) de atraso` : 'para hoje'}</div>
        {!shown && <div className="rv-hint">Tente lembrar o que você sabe sobre este tópico antes de continuar.</div>}
        {shown && (
          <div className="rv-detail" id="rvDetail">
            {!hasDetail && <div className="muted">Este tópico não tem anotações.</div>}
            {node && (node.notes || '').trim() && <div className="md" dangerouslySetInnerHTML={{ __html: h.mdToHtml(node.notes) }} />}
            {errs.length > 0 && <div className="rv-errs" id="rvErrs"><b>{`Seus erros neste tópico (${errs.length})`}</b>{errs.slice(-5).reverse().map((e, k) => <div key={k}>{`• ${h.S.ERR_REASONS[e.why]}${e.note ? ' — ' + e.note : ''}`}</div>)}</div>}
            {refs.map((r, k) => {
              const p = pdfs.find((x) => x.id === r.pdf);
              return (
                <button className="ref-open" key={k} onClick={() => h.pdfOpenRef(r)}>
                  <b style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <FlatIcon name="pdf" size={12} style={{ marginRight: '5px' }} />
                    {`${p ? p.name : 'PDF'}, p. ${r.page}`}
                  </b>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="rv-actions">
        {!shown
          ? <button className="btn primary big" id="rvShow" onClick={() => setShown(true)}>Mostrar anotações <small>(Espaço)</small></button>
          : <><button className="btn primary big" id="rvOk" onClick={() => answer(true)}>✓ Lembrei <small>(Y)</small></button><button className="btn big" id="rvBad" onClick={() => answer(false)}>↻ Errei <small>(N)</small></button></>}
        <button className="btn" id="rvSkip" onClick={() => next('skip')}>Pular <small>(S)</small></button>
        <button className="btn" id="rvGo" onClick={() => { onClose(); h.goTo(item.id); }}>Ir ao mapa</button>
      </div>
      <div className="foot"><span className="grow" /><button className="btn" id="rvClose" onClick={onClose}>Sair</button></div>
    </div>
  );
}
