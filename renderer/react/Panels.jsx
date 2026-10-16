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
export function Outline({ rows }) {
  return (
    <>
      {rows.map((r) => (
        <div key={r.id} className={'ol-row' + (r.sel ? ' sel' : '') + (r.hit ? ' hit' : '')} data-ol-id={r.id} role="treeitem" style={{ paddingLeft: 8 + r.depth * 14 }}>
          <span className="ol-tog" data-ol-tog={r.hasChildren ? r.id : undefined}>{r.hasChildren ? (r.collapsed ? '▶' : '▼') : ''}</span>
          <span className="ol-dot" style={{ background: r.branch }} />
          <span className="ol-t">{r.title}</span>
          {r.progress != null && <span className="ol-pct">{r.progress + '%'}</span>}
        </div>
      ))}
    </>
  );
}
