import { useRef, useState } from 'react';
import { H, useEscape, useMessage } from './hooks.js';

/** Registrar um simulado: data, banca, duração e, por disciplina do mapa, questões feitas e acertos. */
export function SimuladoModal({ onClose }) {
  const h = H(); const map = h.map();
  const discs = map.root.children.length ? map.root.children.map((c) => ({ id: c.id, title: c.title })) : [{ id: null, title: 'Geral' }];
  const [msg, say] = useMessage();
  const [, tick] = useState(0);
  const root = useRef(null);
  const n = (map.meta.simulados || []).length;
  useEscape(onClose);

  const read = () => {
    const q = (s) => root.current.querySelector(s);
    return {
      d: q('#simDate').value, name: q('#simName').value, banca: q('#simBanca').value, minutes: q('#simMin').value,
      rows: [...root.current.querySelectorAll('.sim-row[data-disc]')].map((r) => ({ disc: r.dataset.disc, nodeId: r.dataset.node || undefined, done: r.querySelector('.sim-done').value, correct: r.querySelector('.sim-ok').value })),
    };
  };
  const totals = () => {
    let done = 0, ok = 0;
    if (root.current) for (const r of root.current.querySelectorAll('.sim-row[data-disc]')) { const d = parseInt(r.querySelector('.sim-done').value, 10), c = parseInt(r.querySelector('.sim-ok').value, 10); if (d > 0) { done += d; ok += Math.max(0, Math.min(c || 0, d)); } }
    return { done, ok };
  };
  const t = totals();
  const save = () => {
    try {
      const sim = read(); sim.minutes = parseInt(sim.minutes, 10) || 0;
      h.addSimulado(sim, { addToQuestions: root.current.querySelector('#simAdd').checked });
      onClose(); h.setStatus('Simulado registrado.');
    } catch (e) { say(e.message, 'err'); }
  };

  return (
    <div className="modal-box" id="simBox" data-ui="react" ref={root}>
      <h2>Registrar simulado</h2>
      <div className="muted">Informe, por disciplina, as questões feitas e os acertos. A evolução aparece no Painel de estudos.</div>
      <div className="sim-top">
        <label>Nome <input id="simName" type="text" maxLength={120} defaultValue={`Simulado ${n + 1}`} /></label>
        <label>Banca <input id="simBanca" type="text" maxLength={80} placeholder="opcional" /></label>
        <label>Data <input id="simDate" type="date" defaultValue={h.nowStr()} /></label>
        <label>Duração (min) <input id="simMin" type="text" inputMode="numeric" style={{ width: 70 }} placeholder="opcional" /></label>
      </div>
      <div className="sim-table">
        <div className="sim-row head"><span>Disciplina</span><span>Feitas</span><span>Acertos</span></div>
        {discs.map((d) => (
          <div className="sim-row" key={d.id || 'geral'} data-disc={d.title} data-node={d.id || ''}>
            <span>{d.title}</span>
            <input className="sim-done" type="text" inputMode="numeric" aria-label={`Questões feitas em ${d.title}`} onInput={() => tick((x) => x + 1)} />
            <input className="sim-ok" type="text" inputMode="numeric" aria-label={`Acertos em ${d.title}`} onInput={() => tick((x) => x + 1)} />
          </div>
        ))}
      </div>
      <div className="sim-total" id="simTotal">{t.done ? `Total: ${t.ok}/${t.done} (${Math.round((t.ok / t.done) * 1000) / 10}%)`.replace('.', ',') : 'Total: —'}</div>
      <label className="opt"><input type="checkbox" id="simAdd" defaultChecked /> somar às questões de cada disciplina (alimenta acerto e pontos fracos)</label>
      <div className={'msg' + (msg.kind ? ' ' + msg.kind : '')} id="simMsg">{msg.text}</div>
      <div className="foot"><span className="grow" /><button className="btn" id="simCancel" onClick={onClose}>Cancelar</button><button className="btn primary" id="simSave" onClick={save}>Registrar</button></div>
    </div>
  );
}
