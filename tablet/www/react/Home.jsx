import { useState } from 'react';
import { H } from './hooks.js';
import { ActionButton, ContinueCard, RecentCard } from './home-parts.jsx';

/** Tela inicial: à esquerda, o que fazer agora; à direita, de onde parou e os mapas recentes em cartões. */
export function Home() {
  const [data, setData] = useState(() => H().homeData());
  const A = H().homeActions;
  const refresh = () => setData(H().homeData());
  const remove = async (p) => { await A.removeRecent(p); refresh(); };
  const clear = async () => { await A.clearRecent(); refresh(); };
  return (
    <div className="hm">
      <div className="hm-start">
        <div className="hm-brand">
          <img className="hm-logo" src="assets/logo.svg" alt="" height="40" />
          <h1>BRANIAC</h1>
        </div>
        <p className="hm-lead">Seu grande cérebro para mapas mentais. Abre e salva no formato do Mindomo. Cada nota vira um arquivo Markdown que o Obsidian lê.</p>
        <div className="hm-actions">
          <ActionButton id="hmNew" primary title="Novo mapa" hint="Começa com a ideia central e três tópicos" onClick={() => A.newBlank()} />
          <ActionButton id="hmOpen" title="Abrir arquivo .mom" hint="Um mapa do Mindomo ou salvo aqui" onClick={() => A.openFile()} />
          <ActionButton id="hmPdf" title="Ler um PDF" hint="Selecione um trecho para virar tópico" onClick={() => A.openPdf()} />
          <ActionButton id="hmDash" title="Painel de mapas" hint="Resumo dos seus mapas" onClick={() => H().openDash()} />
          <ActionButton id="hmFlash" title="Flashcards" hint="Revise seus cartões de estudo" onClick={() => { if (window.toggleFlashcardPanel) window.toggleFlashcardPanel(); }} />
        </div>
      </div>

      <div className="hm-main">
        {data.last && <ContinueCard last={data.last} onOpen={A.openRecent} />}
        <section className="hm-sec" id="hmRecent">
          <h3>
            <span>Mapas recentes</span>
            {data.recent.length > 0 && <button className="link" id="hmClear" onClick={clear}>limpar lista</button>}
          </h3>
          {data.recent.length === 0 && (
            <div className="empty">Nenhum mapa aberto ainda. Crie um novo, arraste um arquivo .mom para esta janela, ou importe uma pasta do Obsidian para começar seu segundo cérebro.</div>
          )}
          <ul className="hm-cards">
            {data.recent.map((r) => <RecentCard key={r.path} item={r} onOpen={A.openRecent} onRemove={remove} />)}
          </ul>
        </section>
      </div>
    </div>
  );
}
