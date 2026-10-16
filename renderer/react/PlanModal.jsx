import { useState } from 'react';
import { H, useEscape, useMessage } from './hooks.js';

const List = ({ cls, items }) => (!items.length ? null : (
  <ul className={cls}>{items.slice(0, 12).map((t, i) => <li key={i}>{t}</li>)}{items.length > 12 && <li>{`… e mais ${items.length - 12}`}</li>}</ul>
));

/** Planilha de planejamento (exportar → editar → importar com prévia). Mesmos ids da versão clássica (openPlanModalClassic). */
export function PlanModal({ onClose }) {
  const h = H();
  const [msg, say] = useMessage();
  const [diff, setDiff] = useState(null);
  useEscape(onClose);

  const map = h.map(), sel = h.primary(), scoped = sel && sel.node !== map.root;
  const can = !!(diff && diff.ops.length);

  const onExport = async () => {
    const scope = h.modalEl().querySelector('input[name=planScope]:checked').value;
    const p = await h.ipc('dialog:save', 'csv', `Planejamento - ${scope === 'sel' ? sel.node.title : map.root.title}.csv`); if (!p) return;
    try { h.fs.writeFileSync(p, h.planner.exportPlan(map, { today: h.nowStr(), rootId: scope === 'sel' ? sel.node.id : null })); say('Planilha salva em ' + p, 'ok'); }
    catch (e) { say('Não consegui salvar: ' + e.message, 'err'); }
  };
  const onPick = async () => {
    const p = await h.ipc('dialog:open-csv'); if (!p) return;
    let buf; try { buf = h.fs.readFileSync(p); } catch (e) { say('Não consegui ler o arquivo: ' + e.message, 'err'); return; }
    setDiff(h.planner.diffPlan(map, buf, { today: h.nowStr() })); say('');
  };
  const onApply = () => { if (can) h.applyPlanDiff(diff, onClose); };

  return (
    <div className="modal-box" id="planBox" data-ui="react">
      <h2>Planilha de planejamento</h2>
      <div className="muted">Exporte o mapa como planilha (abre no Excel/Planilhas), preencha peso, progresso, próxima revisão, tempo, questões e notas, e importe de volta. Você vê as mudanças antes de aplicar; nada é apagado e células em branco não alteram nada.</div>
      <div className="opts">
        <label><input type="radio" name="planScope" value="all" defaultChecked />Mapa inteiro</label>
        {scoped && <label><input type="radio" name="planScope" value="sel" />{`Só "${sel.node.title}" e seus subtópicos`}</label>}
      </div>
      <div className="btnrow">
        <button className="btn" id="planExport" onClick={onExport}>Salvar planilha…</button>
        <button className="btn primary" id="planPick" onClick={onPick}>Importar planilha editada…</button>
      </div>
      <div className={'msg' + (msg.kind ? ' ' + msg.kind : '')} id="planMsg">{msg.text}</div>
      <div className="csv-prev" id="planPreview" hidden={!diff}>
        {diff && <>
          <div className={'csv-sum' + (can ? '' : ' err')}>{can ? `${diff.changes.length} mudança(s) em ${diff.stats.changedTopics} tópico(s)${diff.stats.created ? ` · ${diff.stats.created} tópico(s) novo(s)` : ''}` : 'Nenhuma mudança a aplicar.'}</div>
          <List cls="csv-disc" items={diff.changes.map((c) => `${c.label} — ${c.field}: ${c.from || '—'} → ${c.to || '—'}`)} />
          <List cls="csv-err" items={diff.errors.map((e) => (e.line ? `Linha ${e.line}: ` : '') + e.msg)} />
          <List cls="csv-warn" items={diff.warnings} />
        </>}
      </div>
      <div className="foot"><span className="grow" /><button className="btn" id="planCancel" onClick={onClose}>Fechar</button><button className="btn primary" id="planOk" disabled={!can} onClick={onApply}>Aplicar mudanças</button></div>
    </div>
  );
}
