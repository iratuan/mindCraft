import { H } from './hooks.js';

/** Linha de conexão (mesma estrutura de lkRow na versão clássica). */
function Row({ r, onClick, children }) {
  return (
    <div className={'lk' + (r.ghost ? ' ghost' : '')} onClick={onClick}>
      <span className="dot" style={r.ghost ? { background: 'transparent', border: '1px dashed var(--text-dim)' } : { background: r.dot }} />
      <span className="t">{r.title}</span>
      {r.rel && <span className="m rel" title="Relação desenhada no mapa (conta como conexão na rede)">{r.label ? `seta · ${r.label}` : 'seta'}</span>}
      {r.meta ? <span className="m">{r.meta}</span> : null}
      {children}
    </div>
  );
}

/** Painel "Conexões": links, retrolinks e menções sem link. O modelo vem de linksModel() (react-bridge.js). */
export function Connections({ model }) {
  const h = H();
  if (model.empty) return <div className="muted">Selecione um tópico. Escreva [[Título]] nas notas para ligar conteúdos.</div>;
  return (
    <>
      <h4>{`Links deste tópico (${model.out.length})`}</h4>
      {!model.out.length && <div className="muted">Nenhum. Digite [[ nas notas para ligar a outro tópico.</div>}
      {model.out.map((r, i) => (
        <Row key={'o' + i} r={r} onClick={() => h.openTopic(r.n)}>
          {r.canCreate && <button className="go" title="Criar este tópico" data-create={r.title} onClick={(e) => { e.stopPropagation(); h.createTopicFromLink(r.title); }}>＋</button>}
        </Row>
      ))}
      <h4>{`Citado em (${model.inn.length})`}</h4>
      {!model.inn.length && <div className="muted">Nenhum tópico cita este.</div>}
      {model.inn.map((r, i) => <Row key={'i' + i} r={r} onClick={() => h.openTopic(r.n)} />)}
      {model.men.length > 0 && <h4>{`Menções sem link (${model.men.length})`}</h4>}
      {model.men.map((r, i) => (
        <Row key={'m' + i} r={r} onClick={() => h.openTopic(r.n)}>
          <button className="go" title="Transformar em link" style={{ width: 'auto', padding: '0 6px' }} data-linkify={r.m.id} onClick={(e) => { e.stopPropagation(); h.linkifyMention(model.selNode, r.m); }}>{'[[ ]]'}</button>
        </Row>
      ))}
      {model.tip && <div className="muted">Dica: no grafo, escolha a pasta do vault para ligar este mapa a outros.</div>}
    </>
  );
}

/** Painel "Estrutura" (árvore). Os cliques continuam tratados por delegação no #outline (renderer.js). */
/** Recuo máximo (em níveis) da Estrutura: abaixo disso o texto sairia do painel; o nível exato aparece num selo. */
const OL_MAX_INDENT = 8;
export function Outline({ rows }) {
  return (
    <>
      {rows.map((r) => (
        <div key={r.id} className={'ol-row' + (r.sel ? ' sel' : '') + (r.hit ? ' hit' : '')} data-ol-id={r.id} role="treeitem" style={{ paddingLeft: 8 + Math.min(r.depth, OL_MAX_INDENT) * 14 }} title={r.depth > OL_MAX_INDENT ? `${r.title} — nível ${r.depth}` : undefined}>
          <span className="ol-tog" data-ol-tog={r.hasChildren ? r.id : undefined}>{r.hasChildren ? (r.collapsed ? '▶' : '▼') : ''}</span>
          <span className="ol-dot" style={{ background: r.branch }} />
          {r.depth > OL_MAX_INDENT && <span className="ol-lvl">{r.depth}</span>}
          <span className="ol-t">{r.title}</span>
          {r.progress != null && <span className="ol-pct">{r.progress + '%'}</span>}
        </div>
      ))}
    </>
  );
}

/** Fontes (trechos de PDF) do tópico selecionado, no painel Notas. */
import { useMcRender } from './hooks.js';
export function RefsBox() {
  const h = H(); useMcRender();
  const sel = h.primary();
  const refs = sel && sel.node.refs ? sel.node.refs : [];
  if (!refs.length) return null;
  const pdfs = h.map().meta.pdfs || [];
  return (
    <div className="refs" id="refsList">
      <div className="field-label">{`Fontes (${refs.length})`}</div>
      {refs.map((r, i) => {
        const p = pdfs.find((x) => x.id === r.pdf);
        return (
          <div className="ref-row" key={i} data-ref={i}>
            <button className="ref-open" title="Abrir o PDF nesta página" onClick={() => h.pdfOpenRef(r)}>
              <b>{`📖 ${p ? p.name : 'PDF não vinculado'}, p. ${r.page}`}</b>
              {r.quote ? <span>{`“${r.quote.length > 140 ? r.quote.slice(0, 139) + '…' : r.quote}”`}</span> : null}
            </button>
            <button className="ref-del" title="Remover esta fonte" onClick={() => h.removeRef(sel.node.id, i)}>✕</button>
          </div>
        );
      })}
    </div>
  );
}
