import { useRef, useState } from 'react';
import { H, useEscape, useMessage, useRefresh } from './hooks.js';

const small = (props) => <button className="btn small" {...props} />;

/** Janela "Biblioteca de mapas". Mesmos ids/atributos da versão clássica (library-ui.js: openLibraryModalClassic). */
export function LibraryModal({ initialTab, onClose }) {
  const h = H();
  const lib = h.lib();
  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState('');
  const [msg, say] = useMessage();
  const [report, setReport] = useState([]);
  const refresh = useRefresh();
  const conflict = useRef(null);
  useEscape(onClose);

  if (!lib) {
    return (
      <div className="modal-box" id="libBox" data-ui="react">
        <h2>Biblioteca de mapas</h2>
        <div className="msg err">{'A biblioteca não está disponível: ' + h.libError()}</div>
        <div className="foot"><span className="grow" /><button className="btn" id="libClose" onClick={onClose}>Fechar</button></div>
      </div>
    );
  }

  const guard = (fn) => async () => { try { await fn(); } catch (e) { say('Erro: ' + e.message, 'err'); } };
  const cur = h.currentLibId();
  const openMap = async (id, topicId) => {
    if (await h.openFromLibrary(id)) { onClose(); if (topicId && h.map().find(topicId)) h.goTo(topicId); }
  };
  const q = query.trim();
  const searching = q.length >= 2 && tab === 'maps';
  const hits = searching ? lib.searchTopics(q, 60) : [];
  const maps = searching ? [] : lib.listMaps({ today: h.nowStr(), trashed: tab === 'trash' });
  const inLib = h.inLibrary();

  const save = async (kind, name) => h.ipc('dialog:save', kind, name);
  const mom = (t) => (/\.mom$/i.test(t) ? t : t + '.mom');

  const onAdd = async () => {
    if (await h.moveToLibrary()) { say('Mapa guardado na biblioteca. Se veio de um arquivo, o arquivo original não foi alterado.', 'ok'); refresh(); }
  };
  const onImpFile = guard(async () => {
    const p = await h.ipc('dialog:open'); if (!p) return;
    if (!/\.mom$/i.test(p)) { say('Escolha um arquivo .mom (Markdown e OPML abrem pelo menu Abrir).', 'err'); return; }
    const r = lib.importMom(p);
    say(r.status === 'duplicado' ? 'Este arquivo já está na biblioteca.' : `Importado: ${r.topics} tópicos.`, r.status === 'duplicado' ? '' : 'ok'); refresh();
  });
  const onImpDir = guard(async () => {
    const d = await h.ipc('dialog:folder', 'Pasta com mapas .mom'); if (!d) return;
    const r = lib.importFolder(d);
    say(`${r.files} arquivo(s): ${r.imported} importado(s), ${r.duplicated} já estava(m) na biblioteca, ${r.failed} com erro. Os originais não foram alterados.`, r.failed ? 'err' : 'ok');
    setReport(r.items.filter((i) => i.status === 'erro').map((i) => `${h.basename(i.file)}: ${i.error}`)); refresh();
  });
  const onImpPack = guard(async () => {
    const p = await h.ipc('dialog:open-pack'); if (!p) return;
    const r = lib.importPackage(p, { onConflict: conflict.current.value });
    say(`Pacote com ${r.maps} mapa(s): ${r.imported} novo(s), ${r.copied} cópia(s), ${r.replaced} substituído(s), ${r.skipped} igual(is)/mantido(s).`, 'ok');
    setReport(r.items.map((i) => `${i.title} — ${i.status}`)); refresh();
  });
  const onExpPack = guard(async () => {
    const t = await save('mcpack', 'meus-estudos.mcpack'); if (!t) return;
    const r = lib.exportPackage(/\.mcpack$/i.test(t) ? t : t + '.mcpack');
    say(`Pacote salvo com ${r.maps} mapa(s). Leve esse arquivo para o outro computador e use "Importar pacote…".`, 'ok');
  });
  const onBackup = guard(async () => {
    const t = await save('db', 'biblioteca-backup.db'); if (!t) return;
    lib.backupTo(t); say('Cópia do banco salva em ' + t, 'ok');
  });

  const rowActions = (mp) => (tab === 'maps' ? (
    <>
      {small({ children: 'Abrir', 'data-act': 'open', 'data-id': mp.id, onClick: () => openMap(mp.id) })}
      {small({ children: 'Versões', 'data-act': 'versions', 'data-id': mp.id, onClick: () => h.openVersions(mp.id) })}
      {small({ children: 'Exportar .mom', 'data-act': 'export', 'data-id': mp.id, onClick: guard(async () => {
        const target = await save('mom', mp.title + '.mom'); if (!target) return;
        lib.exportMom(mp.id, mom(target)); say('Exportado para ' + target, 'ok');
      }) })}
      {small({ children: 'Excluir', 'data-act': 'trash', 'data-id': mp.id, onClick: () => {
        if (mp.id === cur) { say('Este mapa está aberto. Abra outro mapa antes de excluí-lo (ele iria para a lixeira e poderia ser recriado ao salvar).', 'err'); return; }
        lib.trashMap(mp.id); say(`"${mp.title}" foi para a lixeira (dá para restaurar).`, 'ok'); refresh();
      } })}
    </>
  ) : (
    <>
      {small({ children: 'Restaurar', 'data-act': 'restore', 'data-id': mp.id, onClick: () => { lib.restoreMap(mp.id); say(`"${mp.title}" foi restaurado.`, 'ok'); refresh(); } })}
      {small({ children: 'Excluir de vez', 'data-act': 'purge', 'data-id': mp.id, onClick: guard(async () => {
        const r = await h.ipc('dialog:confirm', { message: `Excluir "${mp.title}" definitivamente?`, detail: 'Isto apaga o mapa e todas as versões dele da biblioteca. Não dá para desfazer.', buttons: ['Excluir de vez', 'Cancelar'] });
        if (r !== 0) return;
        lib.purgeMap(mp.id); say('Excluído definitivamente.', 'ok'); refresh();
      }) })}
    </>
  ));

  return (
    <div className="modal-box" id="libBox" data-ui="react">
      <h2>Biblioteca de mapas</h2>
      <div className="muted">{'Todos os seus mapas num só lugar (banco SQLite em ' + h.libPath() + '). Os arquivos .mom originais nunca são alterados.'}</div>
      <div className="btnrow">
        <button className="btn primary" id="libAddCur" disabled={inLib} onClick={onAdd}>{inLib ? 'Mapa atual já está na biblioteca' : 'Guardar o mapa atual aqui'}</button>
        <button className="btn" id="libImpFile" onClick={onImpFile}>Importar .mom…</button>
        <button className="btn" id="libImpDir" onClick={onImpDir}>Importar pasta de .mom…</button>
      </div>
      <div className="btnrow">
        <button className="btn" id="libImpPack" onClick={onImpPack}>Importar pacote…</button>
        <select id="libConflict" ref={conflict} title="O que fazer se o mapa do pacote já existir e for diferente" defaultValue="copy">
          <option value="copy">conflito: criar cópia</option>
          <option value="replace">conflito: substituir (guarda versão)</option>
          <option value="skip">conflito: manter o meu</option>
        </select>
        <button className="btn" id="libExpPack" onClick={onExpPack}>Exportar pacote…</button>
        <button className="btn" id="libBackup" onClick={onBackup}>Backup do banco…</button>
      </div>
      <input type="search" id="libSearch" placeholder="Buscar em todos os mapas (títulos e notas)…" defaultValue="" onInput={(e) => setQuery(e.target.value)} />
      <div className="btnrow">
        <button className={'btn' + (tab === 'maps' ? ' primary' : '')} id="libTabMaps" onClick={() => setTab('maps')}>Mapas</button>
        <button className={'btn' + (tab === 'trash' ? ' primary' : '')} id="libTabTrash" onClick={() => { setTab('trash'); setQuery(''); const s = document.getElementById('libSearch'); if (s) s.value = ''; }}>Lixeira</button>
      </div>
      <div className={'msg' + (msg.kind ? ' ' + msg.kind : '')} id="libMsg">{msg.text}</div>
      <div className="csv-prev" id="libReport" hidden={!report.length}>
        <ul className="csv-warn">{report.slice(0, 10).map((t, i) => <li key={i}>{t}</li>)}{report.length > 10 && <li>{`… e mais ${report.length - 10}`}</li>}</ul>
      </div>
      <div className="lib-list" id="libList">
        {searching && !hits.length && <div className="empty">Nada encontrado.</div>}
        {hits.map((hit) => (
          <div className="lib-row hit" key={hit.mapId + hit.topicId} data-id={hit.mapId}>
            <div className="grow"><b>{hit.title}</b><div className="muted">{`${hit.mapTitle}${hit.notes ? ' — ' + hit.notes.replace(/\s+/g, ' ') : ''}`}</div></div>
            {small({ children: 'Abrir', 'data-act': 'open', 'data-id': hit.mapId, onClick: () => openMap(hit.mapId, hit.topicId) })}
          </div>
        ))}
        {!searching && !maps.length && <div className="empty">{tab === 'trash' ? 'A lixeira está vazia.' : 'Nenhum mapa na biblioteca ainda. Use "Guardar o mapa atual aqui" ou importe seus .mom.'}</div>}
        {maps.map((mp) => (
          <div className="lib-row" key={mp.id} data-id={mp.id}>
            <div className="grow">
              <b>{mp.title + (mp.id === cur ? '  (aberto)' : '')}</b>
              <div className="muted">{`${mp.topics} tópicos${mp.due ? ` · ${mp.due} revisão(ões) vencida(s)` : ''}${mp.exam_date ? ' · prova ' + h.fmtDate(mp.exam_date) : ''} · ${tab === 'trash' ? 'excluído em ' + h.when(mp.deleted_at) : 'atualizado ' + h.when(mp.updated_at)}`}</div>
            </div>
            {rowActions(mp)}
          </div>
        ))}
      </div>
      <div className="foot"><span className="grow" /><button className="btn" id="libClose" onClick={onClose}>Fechar</button></div>
    </div>
  );
}
