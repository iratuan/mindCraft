/** Peças pequenas da tela inicial: cada uma recebe só o que precisa (dados + ações), sem tocar em estado global. */

/** Quando o arquivo foi mexido pela última vez, em palavras curtas. */
export const ago = (ms) => {
  if (!ms) return '';
  const d = Math.floor((Date.now() - ms) / 86400000);
  return d <= 0 ? 'hoje' : d === 1 ? 'ontem' : d < 30 ? `há ${d} dias` : new Date(ms).toLocaleDateString('pt-BR');
};

/** Botão grande de ação da coluna da esquerda. */
export function ActionButton({ id, title, hint, primary, onClick }) {
  return (
    <button className={'hm-action' + (primary ? ' primary' : '')} id={id} onClick={onClick}>
      <b>{title}</b><span>{hint}</span>
    </button>
  );
}

/** "Continuar de onde parou": o último mapa que ainda existe. */
export function ContinueCard({ last, onOpen }) {
  return (
    <section className="hm-sec hm-continue-sec" id="hmLast">
      <h3>Continuar de onde parou</h3>
      <button className="hm-continue" id="hmContinue" onClick={() => onOpen(last)}>
        <b>{last.name}</b>
        <span className="muted">{last.dir} · {ago(last.mtime)}</span>
      </button>
    </section>
  );
}

/** Cartão de um mapa recente; o × só tira da lista (o arquivo não é apagado). */
export function RecentCard({ item, onOpen, onRemove }) {
  return (
    <li className={'hm-card' + (item.exists ? '' : ' missing')}>
      <button className="hm-card-open" disabled={!item.exists} onClick={() => onOpen(item)} title={item.path}>
        <b>{item.name}</b>
        <span className="muted">{item.exists ? `${item.dir}` : 'arquivo não encontrado'}</span>
        <span className="hm-card-when">{item.exists ? ago(item.mtime) : ''}</span>
      </button>
      <button className="icon-btn sm hm-card-x" title="Tirar da lista (o arquivo não é apagado)" aria-label={'Tirar da lista: ' + item.name} onClick={() => onRemove(item.path)}>×</button>
    </li>
  );
}
