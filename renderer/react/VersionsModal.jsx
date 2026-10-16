import { H, useEscape, useMessage, useRefresh } from './hooks.js';

/** Janela de versões de um mapa. Mesmos ids/atributos da versão clássica (openVersionsModalClassic). */
export function VersionsModal({ mapId, back, onClose }) {
  const h = H();
  const lib = h.lib();
  const [msg, say] = useMessage();
  const refresh = useRefresh();
  useEscape(onClose);
  if (!lib) return null;

  const info = lib.listMaps().find((x) => x.id === mapId);
  const snaps = lib.listSnapshots(mapId);
  const create = async () => {
    try {
      if (h.isDirty() && h.currentLibId() === mapId && !(await h.saveToLibrary())) return;
      lib.snapshot(mapId, 'manual'); say('Versão criada.', 'ok'); refresh();
    } catch (e) { say('Não consegui criar a versão: ' + e.message, 'err'); }
  };
  const restore = async (s) => {
    if (!(await h.confirmDiscard())) return;
    try {
      const nid = lib.restoreSnapshot(s.id);
      if (await h.openFromLibrary(nid, { confirm: false })) { onClose(); h.setStatus('Versão aberta como mapa novo (na biblioteca). O mapa original não foi alterado.'); }
    } catch (e) { say('Não consegui abrir a versão: ' + e.message, 'err'); }
  };

  return (
    <div className="modal-box" id="verBox" data-ui="react">
      <h2>{'Versões de "' + (info ? info.title : '?') + '"'}</h2>
      <div className="muted">Uma versão é guardada automaticamente ao salvar (no máximo a cada 10 minutos; até 30). Abrir uma versão cria um mapa NOVO: o atual nunca é sobrescrito.</div>
      <button className="btn primary" id="verNow" onClick={create}>Criar versão agora</button>
      <div className={'msg' + (msg.kind ? ' ' + msg.kind : '')} id="verMsg">{msg.text}</div>
      <div className="lib-list" id="verList">
        {!snaps.length && <div className="empty">Ainda não há versões. Elas aparecem quando você salva por cima de um mapa existente.</div>}
        {snaps.map((s) => (
          <div className="lib-row" key={s.id} data-id={String(s.id)}>
            <div className="grow"><b>{h.when(s.created_at)}</b><div className="muted">{`${s.reason} · ${Math.max(1, Math.round(s.bytes / 1024))} KB`}</div></div>
            <button className="btn small" data-act="restore-snap" data-id={String(s.id)} onClick={() => restore(s)}>Abrir como mapa novo</button>
          </div>
        ))}
      </div>
      <div className="foot"><span className="grow" /><button className="btn" id="verBack" onClick={() => { if (back) { onClose(); h.openLibrary(); } else onClose(); }}>{back ? 'Voltar à biblioteca' : 'Fechar'}</button></div>
    </div>
  );
}
