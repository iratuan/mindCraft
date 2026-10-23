import { useState, useRef, useEffect, useCallback } from 'react';
import { H, useMcRender } from './hooks.js';

const QUICK_BOOKMARKS = [
  { name: 'Constituição (CF/88)', url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm' },
  { name: 'Código Civil', url: 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm' },
  { name: 'Código Penal', url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm' },
  { name: 'QConcursos', url: 'https://www.qconcursos.com' },
  { name: 'Tec Concursos', url: 'https://www.tecconcursos.com.br' },
  { name: 'Dizer o Direito', url: 'https://www.dizerodireito.com.br' },
];

export function BrowserPane({ initialUrl, onClose }) {
  const h = H();
  useMcRender();
  const map = h.map();
  const selNode = h.selected();

  const [currentUrl, setCurrentUrl] = useState(() => (initialUrl || h.loadCfg().lastBrowserUrl || 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm'));
  const [addressBar, setAddressBar] = useState(currentUrl);
  const [pageTitle, setPageTitle] = useState('Navegador de Estudo');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const webviewRef = useRef(null);
  const iframeRef = useRef(null);

  const say = useCallback((msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3500);
  }, []);

  const navigateTo = useCallback((targetUrl) => {
    let url = (targetUrl || '').trim();
    if (!url) return;

    // Sanitização e segurança de URLs
    if (/^(javascript|data|vbscript):/i.test(url)) {
      say('Protocolo não permitido por segurança.');
      return;
    }
    if (url === 'about:blank') {
      setCurrentUrl('about:blank');
      setAddressBar('');
      setPageTitle('Aba em branco');
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
      }
    }
    setCurrentUrl(url);
    setAddressBar(url);
    h.saveCfg({ lastBrowserUrl: url });
    setIsLoading(true);
  }, [h, say]);

  const openExternal = useCallback(() => {
    if (!currentUrl || currentUrl === 'about:blank') return;
    try {
      if (window.require) {
        const { shell } = window.require('electron');
        shell.openExternal(currentUrl);
      } else {
        window.open(currentUrl, '_blank', 'noopener,noreferrer');
      }
      say('Página aberta no navegador externo.');
    } catch (e) {
      say('Erro ao abrir externamente: ' + e.message);
    }
  }, [currentUrl, say]);

  // Eventos do Webview (Electron)
  useEffect(() => {
    const el = webviewRef.current;
    if (!el) return undefined;

    const onStart = () => setIsLoading(true);
    const onStop = () => {
      setIsLoading(false);
      try {
        setCanGoBack(el.canGoBack());
        setCanGoForward(el.canGoForward());
        const u = el.getURL();
        if (u) { setAddressBar(u); setCurrentUrl(u); }
        const t = el.getTitle();
        if (t) setPageTitle(t);
      } catch { /* webview descarregado */ }
    };
    const onTitle = (e) => { if (e.title) setPageTitle(e.title); };

    el.addEventListener('did-start-loading', onStart);
    el.addEventListener('did-stop-loading', onStop);
    el.addEventListener('page-title-updated', onTitle);

    return () => {
      el.removeEventListener('did-start-loading', onStart);
      el.removeEventListener('did-stop-loading', onStop);
      el.removeEventListener('page-title-updated', onTitle);
    };
  }, [currentUrl]);

  const goBack = () => {
    if (webviewRef.current && webviewRef.current.canGoBack()) webviewRef.current.goBack();
    else if (iframeRef.current) window.history.back();
  };

  const goForward = () => {
    if (webviewRef.current && webviewRef.current.canGoForward()) webviewRef.current.goForward();
    else if (iframeRef.current) window.history.forward();
  };

  const reload = () => {
    if (webviewRef.current) webviewRef.current.reload();
    else if (iframeRef.current) iframeRef.current.src = currentUrl;
  };

  // 1. Vincular URL ao tópico selecionado
  const linkUrlToSelected = () => {
    if (!selNode) {
      say('Selecione um tópico no mapa para vincular esta página.');
      return;
    }
    h.change(() => {
      const linkNote = `🌐 [${pageTitle || 'Link de Estudo'}](${currentUrl})`;
      selNode.notes = (selNode.notes ? selNode.notes + '\n\n' : '') + linkNote;
    });
    say(`URL vinculada às notas do tópico "${selNode.title}"`);
  };

  // 2. Criar novo tópico com esta página
  const createTopicFromPage = () => {
    if (!selNode) {
      say('Selecione um tópico no mapa para criar o subtópico.');
      return;
    }
    const cleanTitle = (pageTitle && pageTitle !== 'Navegador de Estudo' ? pageTitle : addressBar)
      .slice(0, 80)
      .replace(/[\r\n]+/g, ' ');
    const n = h.change(() => {
      const child = map.addChild(selNode.id, cleanTitle);
      if (child) {
        child.notes = `🌐 Fonte: ${currentUrl}`;
      }
      return child;
    });
    if (n) {
      say(`Criado subtópico "${cleanTitle}" com link da página`);
    }
  };

  const isElectron = typeof window !== 'undefined' && window.process && window.process.type;

  return (
    <div className="browser-pane" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)' }}>
      {/* Barra de Navegação */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'var(--bg-bar)', borderBottom: '1px solid var(--line)' }}>
        <button className="icon-btn sm" onClick={goBack} disabled={!canGoBack} title="Voltar página">◀</button>
        <button className="icon-btn sm" onClick={goForward} disabled={!canGoForward} title="Avançar página">▶</button>
        <button className="icon-btn sm" onClick={reload} title="Recarregar página">{isLoading ? '⏳' : '↻'}</button>
        <button className="icon-btn sm" onClick={() => navigateTo('https://www.google.com')} title="Página inicial">🏠</button>

        {/* Input de endereço */}
        <input
          type="text"
          value={addressBar}
          onChange={(e) => setAddressBar(e.target.value)}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigateTo(addressBar);
            else if (e.key === 'Escape') setAddressBar(currentUrl);
          }}
          placeholder="Digite a URL ou pesquise na web…"
          style={{ flex: 1, height: '26px', padding: '0 8px', fontSize: '12px', background: 'var(--bg-field)', border: '1px solid var(--line-soft)', borderRadius: '4px', color: 'var(--text)' }}
        />
        <button className="btn small primary" onClick={() => navigateTo(addressBar)}>Ir</button>
        <button
          className="btn small"
          onClick={openExternal}
          title="Abrir esta página no navegador padrão do sistema"
          style={{ whiteSpace: 'nowrap' }}
        >
          ↗ Abrir fora
        </button>
        <button
          className="btn small"
          id="browserCloseTabBtn"
          onClick={() => {
            if (onClose) onClose();
            else {
              setCurrentUrl('about:blank');
              setAddressBar('');
              setPageTitle('Aba Encerrada');
              say('Aba do navegador fechada.');
            }
          }}
          title="Fechar esta aba do navegador"
          style={{ color: '#ef4444' }}
        >
          ✕ Fechar Aba
        </button>
      </div>

      {/* Linha de Favoritos Rápidos */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--bg-hover)', borderBottom: '1px solid var(--line)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)' }}>Favoritos:</span>
        {QUICK_BOOKMARKS.map((bm) => (
          <button
            key={bm.name}
            className="chip"
            style={{ fontSize: '11px', padding: '2px 8px', height: '22px' }}
            onClick={() => navigateTo(bm.url)}
            title={bm.url}
          >
            {bm.name}
          </button>
        ))}
      </div>

      {/* Aviso de fallback para CSP/X-Frame-Options quando em iframe */}
      {!isElectron && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 10px', background: 'rgba(234, 179, 8, 0.12)', borderBottom: '1px solid rgba(234, 179, 8, 0.25)', fontSize: '11px', color: 'var(--text)' }}>
          <span>ℹ Se o site bloquear exibição integrada (CSP/X-Frame-Options), use <b>↗ Abrir fora</b>.</span>
          <button className="link" onClick={openExternal} style={{ fontSize: '11px', cursor: 'pointer' }}>Abrir no navegador</button>
        </div>
      )}

      {/* Área da Página Web */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', background: '#fff' }}>
        {isElectron ? (
          <webview
            ref={webviewRef}
            src={currentUrl}
            partition="persist:mindcraft-study"
            allowpopups="true"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <iframe
            ref={iframeRef}
            src={currentUrl}
            title={pageTitle}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        )}
      </div>

      {/* Barra de Integração com o Mapa */}
      <div style={{ padding: '8px 10px', background: 'var(--bg-bar)', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className="btn small primary"
            onClick={createTopicFromPage}
            title="Cria um subtópico com o título e endereço desta página"
          >
            ＋ Criar subtópico desta página
          </button>
          <button
            className="btn small"
            onClick={linkUrlToSelected}
            title="Adiciona o link da página atual nas notas do tópico selecionado"
          >
            📌 Vincular URL ao tópico
          </button>
          {selNode && (
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Alvo: <b>{selNode.title}</b>
            </span>
          )}
        </div>
        {feedback && (
          <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}>
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}
