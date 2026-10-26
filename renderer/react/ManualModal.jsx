import { useMemo, useState, useEffect, useRef } from 'react';
import { H, useEscape } from './hooks.js';

/** Texto com **negrito** e `código` (único "markup" do manual). Nunca vira HTML: tudo passa pelo React como texto. */
function Inline({ text }) {
  return String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <b key={i}><Inline text={p.slice(2, -2)} /></b>;
    if (p.startsWith('`') && p.endsWith('`') && p.length > 2) return <code key={i}>{p.slice(1, -1)}</code>;
    return p;
  });
}

/** Modelo de prompt copiável (ajuda: "Transformar o edital em PDF em planilha"). O botão usa a mesma área de transferência do app. */
function ModeloCopiavel({ text }) {
  const [msg, setMsg] = useState('');
  return (
    <div className="mn-modelo">
      <pre className="mn-pre">{text}</pre>
      <div className="mn-modelo-acoes">
        <button className="btn primary" id="manualCopiarModelo" onClick={async () => { await window.MC.copyText(text); setMsg('Modelo copiado. Cole na conversa com a IA, junto com o PDF.'); }}>Copiar o modelo</button>
        {msg && <span className="muted" role="status">{msg}</span>}
      </div>
    </div>
  );
}
function Block({ b }) {
  const [kind, body] = b;
  if (kind === 'p') return <p><Inline text={body} /></p>;
  if (kind === 'ul') return <ul>{body.map((t, i) => <li key={i}><Inline text={t} /></li>)}</ul>;
  if (kind === 'steps') return <ol>{body.map((t, i) => <li key={i}><Inline text={t} /></li>)}</ol>;
  if (kind === 'tip') return <div className="mn-note tip"><b>Dica:</b> <Inline text={body} /></div>;
  if (kind === 'warn') return <div className="mn-note warn"><b>Atenção:</b> <Inline text={body} /></div>;
  if (kind === 'modelo') return <ModeloCopiavel text={body} />;
  if (kind === 'keys') return <div className="mn-keys">{body.map(([k, d]) => <div className="keys-row" key={k}><kbd>{k}</kbd><span>{d}</span></div>)}</div>;
  return null;
}

/** Manual de uso (Ajuda → Manual de uso): índice, busca e uma seção por funcionalidade; o texto muda entre computador e tablet. */
export function ManualModal({ onClose, initialSection }) {
  useEscape(onClose);
  const M = H().manual;
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const [host, setHost] = useState(coarse ? 'touch' : 'desktop');
  const [query, setQuery] = useState('');
  const [cur, setCur] = useState(() => (M.find(initialSection || 'primeiros-passos') ? initialSection || 'primeiros-passos' : 'primeiros-passos'));
  const body = useRef(null);
  const found = useMemo(() => M.search(query, host), [M, query, host]);
  const shown = query.trim() ? found : M.sections(host);
  const section = shown.find((s) => s.id === cur) || shown[0] || null;
  const idx = section ? shown.findIndex((s) => s.id === section.id) : -1;
  useEffect(() => { if (body.current) body.current.scrollTop = 0; }, [section && section.id]);
  const groups = useMemo(() => {
    const g = []; for (const s of shown) { let e = g.find((x) => x.name === s.group); if (!e) g.push(e = { name: s.group, items: [] }); e.items.push(s); } return g;
  }, [shown]);

  return (
    <div className="modal-box manual-box" id="manualBox" data-ui="react">
      <div className="mn-head">
        <h2>Manual de uso</h2>
        <span className="seg" role="group" aria-label="Mostrar instruções para">
          <button id="manualHostDesktop" className={host === 'desktop' ? 'on' : ''} aria-pressed={host === 'desktop'} onClick={() => setHost('desktop')}>Computador</button>
          <button id="manualHostTouch" className={host === 'touch' ? 'on' : ''} aria-pressed={host === 'touch'} onClick={() => setHost('touch')}>Tablet</button>
        </span>
        <input id="manualSearch" type="search" placeholder="Buscar no manual…" aria-label="Buscar no manual" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="mn-grid">
        <nav className="mn-index" id="manualIndex" aria-label="Índice do manual">
          {!shown.length && <div className="muted" id="manualNone">Nada encontrado para “{query}”.</div>}
          {groups.map((g) => (
            <div key={g.name}><h3>{g.name}</h3>
              {g.items.map((s) => <button key={s.id} data-section={s.id} className={section && s.id === section.id ? 'on' : ''} aria-current={section && s.id === section.id ? 'true' : undefined} onClick={() => setCur(s.id)}>{s.title}</button>)}
            </div>
          ))}
        </nav>
        <article className="mn-body" id="manualBody" ref={body} tabIndex={-1} data-section={section ? section.id : ''}>
          {section && <>
            <h2 className="mn-title">{section.title}</h2>
            <p className="mn-sum">{section.summary}</p>
            {section.blocks.map((b, i) => <Block b={b} key={i} />)}
            <div className="mn-nav">
              {idx > 0 ? <button className="btn" id="manualPrev" onClick={() => setCur(shown[idx - 1].id)}>← {shown[idx - 1].title}</button> : <span />}
              {idx < shown.length - 1 ? <button className="btn" id="manualNext" onClick={() => setCur(shown[idx + 1].id)}>{shown[idx + 1].title} →</button> : <span />}
            </div>
          </>}
        </article>
      </div>
      <div className="foot">
        {host === 'desktop' && <button className="btn" id="manualKeys" onClick={() => window.MCReact.openShortcuts()}>Atalhos do teclado (F1)</button>}
        <span className="grow" />
        <button className="btn primary" id="manualClose" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
