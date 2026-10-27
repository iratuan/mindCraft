import { useEffect, useRef, useState } from 'react';
import { H, useEscape, useMessage } from './hooks.js';

const count = (n) => n.children.reduce((a, c) => a + 1 + count(c), 0);
const List = ({ cls, items }) => (!items.length ? null : (
  <ul className={cls}>{items.slice(0, 8).map((t, i) => <li key={i}>{t}</li>)}{items.length > 8 && <li>{`… e mais ${items.length - 8}`}</li>}</ul>
));

// o que o app entendeu do texto: ajuda a diagnosticar um CSV que não importa (separador, colunas, linhas lidas)
const Diag = ({ rep }) => (
  <div className="csv-diag muted" id="csvDiag">
    {`Separador: ${rep.delimiter === '\t' ? 'tabulação' : `"${rep.delimiter}"`} · linhas lidas: ${rep.rows} · colunas: ${rep.columns && rep.columns.length ? rep.columns.join(', ') : '(nenhuma reconhecida)'}`}
  </div>
);

/** Importar CSV de edital (gerado por IA). Mesmos ids/atributos da versão clássica (openCsvModalClassic). */
export function CsvModal({ onClose }) {
  const h = H();
  const [msg, say] = useMessage();
  const [loaded, setLoaded] = useState(null);       // { map, report } de fromCsv
  const titleRef = useRef(null), pasteRef = useRef(null);
  useEscape(onClose);
  useEffect(() => { if (loaded && loaded.map && titleRef.current) titleRef.current.value = loaded.map.root.title; }, [loaded]);

  const sel = h.primary();
  const cm = loaded && loaded.map, rep = loaded && loaded.report;

  const onPrompt = async () => {
    try { await h.ipc('clip:write', h.csv.aiPrompt()); say('Instruções copiadas. Cole numa IA e anexe/cole o edital.', 'ok'); }
    catch (e) { say('Não consegui copiar para a área de transferência (' + e.message + '). Use "Salvar CSV de exemplo…" e leia o modelo.', 'err'); }
  };
  const onTemplate = async () => {
    const p = await h.ipc('dialog:save', 'csv', 'modelo-edital.csv'); if (!p) return;
    try { h.fs.writeFileSync(p, h.csv.csvTemplate()); say('Modelo salvo em ' + p, 'ok'); } catch (e) { say('Não consegui salvar: ' + e.message, 'err'); }
  };
  const onPick = async () => {
    const p = await h.ipc('dialog:open-csv'); if (!p) return;
    let buf; try { buf = h.fs.readFileSync(p); } catch (e) { say('Não consegui ler o arquivo: ' + e.message, 'err'); return; }
    setLoaded(h.csv.fromCsv(buf, { title: h.path.basename(p, h.path.extname(p)) })); say('');
  };
  /** Texto colado (de uma IA, e-mail ou planilha): a mesma prévia do arquivo. */
  const analyze = (text) => {
    if (!String(text || '').trim()) { setLoaded(null); say(''); return; }
    setLoaded(h.csv.fromCsv(String(text), { title: 'Edital' })); say('');
  };
  const onPasteBtn = async () => {
    let t = ''; try { t = await h.ipc('clip:read'); } catch { /* sem acesso */ }
    if (!t) { say('A área de transferência está vazia (ou o sistema não deixou ler). Cole o texto na caixa abaixo (Ctrl+V ou toque longo → Colar).', 'err'); pasteRef.current && pasteRef.current.focus(); return; }
    pasteRef.current.value = t; analyze(t);
  };
  const onOk = async () => {
    if (!cm) return;
    const mode = h.modalEl().querySelector('input[name=csvMode]:checked').value;
    await h.applyCsvImport(cm, { name: (titleRef.current.value || '').trim() || cm.root.title, mode, close: onClose });
  };

  return (
    <div className="modal-box" id="csvBox" data-ui="react">
      <h2>Importar CSV de edital (gerado por IA)</h2>
      <div className="muted">1) Copie as instruções e cole numa IA junto com o texto do edital.  2) Salve a resposta como .csv.  3) Escolha o arquivo OU cole o texto aqui mesmo: o app monta o esqueleto do mapa (disciplinas, hierarquia, pesos, prova) e você completa tópicos, notas e links.</div>
      <div className="btnrow">
        <button className="btn" id="csvPrompt" onClick={onPrompt}>Copiar instruções para a IA</button>
        <button className="btn" id="csvTemplate" onClick={onTemplate}>Salvar CSV de exemplo…</button>
        <button className="btn primary" id="csvPick" onClick={onPick}>Escolher arquivo CSV…</button>
        <button className="btn primary" id="csvClip" title="Cola o que você copiou (a resposta da IA, um e-mail, uma planilha) e já mostra a prévia" onClick={onPasteBtn}>Colar da área de transferência</button>
      </div>
      <textarea id="csvPaste" ref={pasteRef} className="csv-paste" rows={5} spellCheck={false} placeholder="…ou cole o CSV aqui (Ctrl+V / toque longo → Colar). Aceita a resposta da IA com ou sem marcações de código e até tabelas do chat."
        onPaste={(e) => { const t = e.clipboardData && e.clipboardData.getData('text'); if (t) { e.preventDefault(); e.target.value = t; analyze(t); } }}
        onChange={(e) => { clearTimeout(pasteRef.timer); const v = e.target.value; pasteRef.timer = setTimeout(() => analyze(v), 350); }} />
      <div className={'msg' + (msg.kind ? ' ' + msg.kind : '')} id="csvMsg">{msg.text}</div>
      <div className="csv-prev" id="csvPreview" hidden={!loaded}>
        {loaded && !cm && <><div className="csv-sum err">O arquivo não pôde ser importado.</div><Diag rep={rep} /><List cls="csv-err" items={rep.errors.map((e) => (e.line ? `Linha ${e.line}: ` : '') + e.msg)} /></>}
        {cm && <>
          <div className="csv-sum">{`${rep.imported} tópicos em ${rep.disciplines} disciplina(s)${cm.meta.exam ? ` · prova em ${h.fmtDate(cm.meta.exam.date)}` : ''}${rep.skipped ? ` · ${rep.skipped} linha(s) puladas` : ''}`}</div>
          <Diag rep={rep} />
          <List cls="csv-disc" items={cm.root.children.map((d) => `${d.title} — ${count(d)} tópico(s)`)} />
          <List cls="csv-err" items={rep.errors.map((e) => `Linha ${e.line}: ${e.msg}`)} />
          <List cls="csv-warn" items={rep.warnings} />
        </>}
      </div>
      <input type="text" id="csvTitle" ref={titleRef} placeholder="Nome do concurso / prova" hidden={!cm} defaultValue="" />
      <div className="opts" hidden={!cm}>
        <label><input type="radio" name="csvMode" value="new" defaultChecked />Criar um novo mapa</label>
        <label><input type="radio" name="csvMode" value="add" />{sel ? `Adicionar as disciplinas abaixo de "${sel.node.title}"` : 'Adicionar abaixo do tópico selecionado'}</label>
      </div>
      <div className="foot"><span className="grow" /><button className="btn" id="csvCancel" onClick={onClose}>Cancelar</button><button className="btn primary" id="csvOk" disabled={!cm} onClick={onOk}>Criar o mapa</button></div>
    </div>
  );
}
