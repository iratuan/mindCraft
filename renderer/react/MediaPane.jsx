import { useState, useEffect, useCallback, useRef } from 'react';
import { H, useMcRender } from './hooks.js';
import { PdfPane } from './PdfPane.jsx';
import { VideoPane } from './VideoPane.jsx';
import { BrowserPane } from './BrowserPane.jsx';

let tabCounter = 1;
const genTabId = (type) => `tab_${type}_${Date.now()}_${++tabCounter}`;

export function MediaPane({ initialTab = 'pdf', pdfOpts = {}, onClose }) {
  const h = H();
  useMcRender();
  const map = h.map();

  const [tabs, setTabs] = useState(() => {
    const firstTab = {
      id: genTabId(initialTab),
      type: initialTab,
      title: initialTab === 'pdf'
        ? (pdfOpts.name || (pdfOpts.path ? pdfOpts.path.replace(/\\/g, '/').split('/').pop() : 'Leitor de PDF'))
        : initialTab === 'video'
        ? 'Videoaula'
        : 'Navegador Web',
      pdfOpts: initialTab === 'pdf' ? pdfOpts : {},
      videoOpts: {},
      browserOpts: {},
    };
    return [firstTab];
  });

  const [activeTabId, setActiveTabId] = useState(() => (tabs[0] ? tabs[0].id : null));
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef(null);

  // Fecha o menu de nova aba ao clicar fora
  useEffect(() => {
    if (!showAddMenu) return undefined;
    const onClickOutside = (e) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showAddMenu]);

  // Criação de nova aba
  const addTab = useCallback((type, opts = {}) => {
    const id = genTabId(type);
    let title = 'Nova Aba';
    if (type === 'pdf') {
      title = opts.name || (opts.path ? opts.path.replace(/\\/g, '/').split('/').pop() : 'PDF');
    } else if (type === 'video') {
      title = opts.name || 'Vídeo';
    } else if (type === 'browser') {
      title = opts.title || (opts.url ? opts.url.replace(/^https?:\/\//i, '').slice(0, 24) : 'Navegador');
    }
    const newTab = {
      id,
      type,
      title,
      pdfOpts: type === 'pdf' ? opts : {},
      videoOpts: type === 'video' ? opts : {},
      browserOpts: type === 'browser' ? opts : {},
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
    setShowAddMenu(false);
    return id;
  }, []);

  // Fechamento de uma aba individual
  const closeTab = useCallback((tabId, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId) {
        const idx = prev.findIndex((t) => t.id === tabId);
        const nextActive = next[Math.max(0, idx - 1)] || next[0];
        setActiveTabId(nextActive ? nextActive.id : null);
      }
      return next;
    });
  }, [activeTabId]);

  // Escuta eventos externos de abertura e troca de mídia
  useEffect(() => {
    const onSwitch = (e) => {
      const d = e.detail || {};
      const type = d.tab || 'pdf';
      setTabs((prev) => {
        // Se já existe uma aba do mesmo tipo (e mesmo path/src se especificado), foca nela
        const existing = prev.find((t) => {
          if (t.type !== type) return false;
          if (type === 'pdf' && d.pdfOpts?.path && t.pdfOpts?.path) {
            return t.pdfOpts.path.toLowerCase() === d.pdfOpts.path.toLowerCase();
          }
          if (type === 'video' && d.videoOpts?.src && t.videoOpts?.src) {
            return t.videoOpts.src === d.videoOpts.src;
          }
          return true;
        });
        if (existing) {
          setActiveTabId(existing.id);
          return prev;
        }
        // Cria nova aba
        const id = genTabId(type);
        const title = type === 'pdf'
          ? (d.pdfOpts?.name || (d.pdfOpts?.path ? d.pdfOpts.path.replace(/\\/g, '/').split('/').pop() : 'PDF'))
          : type === 'video'
          ? (d.videoOpts?.name || 'Vídeo')
          : 'Navegador';
        const newTab = {
          id,
          type,
          title,
          pdfOpts: d.pdfOpts || {},
          videoOpts: d.videoOpts || {},
          browserOpts: d.browserOpts || {},
        };
        setActiveTabId(id);
        return [...prev, newTab];
      });
    };

    const onPdfOpen = (e) => {
      const d = e.detail || {};
      if (!d.path) return;
      setTabs((prev) => {
        const existing = prev.find((t) => t.type === 'pdf' && t.pdfOpts?.path?.toLowerCase() === d.path.toLowerCase());
        if (existing) {
          setActiveTabId(existing.id);
          return prev;
        }
        const id = genTabId('pdf');
        const title = d.name || d.path.replace(/\\/g, '/').split('/').pop();
        const newTab = { id, type: 'pdf', title, pdfOpts: d, videoOpts: {}, browserOpts: {} };
        setActiveTabId(id);
        return [...prev, newTab];
      });
    };

    const onVideoOpen = (e) => {
      const d = e.detail || {};
      const id = genTabId('video');
      const newTab = { id, type: 'video', title: d.name || 'Vídeo', pdfOpts: {}, videoOpts: d, browserOpts: {} };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(id);
    };

    document.addEventListener('mc:media-switch', onSwitch);
    document.addEventListener('mc:pdf-open', onPdfOpen);
    document.addEventListener('mc:video-open', onVideoOpen);

    return () => {
      document.removeEventListener('mc:media-switch', onSwitch);
      document.removeEventListener('mc:pdf-open', onPdfOpen);
      document.removeEventListener('mc:video-open', onVideoOpen);
    };
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const mapPdfs = (map && map.meta && map.meta.pdfs) || [];

  return (
    <div className="media-pane-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: 'var(--bg-panel)' }}>
      {/* Barra de Abas Multimídia da Bancada de Estudos */}
      <div style={{ display: 'flex', alignItems: 'center', height: '36px', background: 'var(--bg-bar)', borderBottom: '1px solid var(--line)', padding: '0 6px', gap: '3px' }}>
        {/* Abas Abertas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flex: 1, minWidth: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {tabs.map((t) => {
            const isActive = t.id === activeTabId;
            const icon = t.type === 'pdf' ? '📄' : t.type === 'video' ? '🎬' : '🌐';
            return (
              <div
                key={t.id}
                className={'ptab' + (isActive ? ' on' : '')}
                onClick={() => setActiveTabId(t.id)}
                title={t.title}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '28px',
                  padding: '0 8px 0 10px',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 400,
                  borderRadius: '5px',
                  background: isActive ? 'var(--bg-panel)' : 'transparent',
                  color: isActive ? 'var(--text-strong)' : 'var(--text-dim)',
                  border: isActive ? '1px solid var(--line-soft)' : '1px solid transparent',
                  cursor: 'pointer',
                  maxWidth: '160px',
                  flexShrink: 0,
                  userSelect: 'none',
                }}
              >
                <span>{icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.title}
                </span>
                <button
                  className="media-tab-close"
                  onClick={(e) => closeTab(t.id, e)}
                  title={`Fechar aba ${t.title}`}
                  aria-label={`Fechar aba ${t.title}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    color: 'inherit',
                    opacity: 0.7,
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: 0,
                    marginLeft: '2px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'inherit'; }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        {/* Botão + (Nova Aba) com menu */}
        <div style={{ position: 'relative' }} ref={addMenuRef}>
          <button
            className="icon-btn sm"
            onClick={() => setShowAddMenu((v) => !v)}
            title="Abrir nova aba de estudo"
            aria-label="Nova aba"
            style={{ width: '26px', height: '26px', fontWeight: 700 }}
          >
            ＋
          </button>
          {showAddMenu && (
            <div
              style={{
                position: 'absolute',
                top: '32px',
                left: 0,
                zIndex: 60,
                background: 'var(--bg-panel)',
                border: '1px solid var(--line)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                borderRadius: '6px',
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                minWidth: '150px',
              }}
            >
              <button
                className="btn small"
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => addTab('pdf')}
              >
                📄 Novo PDF
              </button>
              <button
                className="btn small"
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => addTab('video')}
              >
                🎬 Nova Videoaula
              </button>
              <button
                className="btn small"
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => addTab('browser')}
              >
                🌐 Nova Aba Web
              </button>
            </div>
          )}
        </div>

        {/* Botões de Ação do Painel */}
        <button
          className="link help-q"
          data-manual={activeTab?.type === 'pdf' ? 'pdf' : activeTab?.type === 'video' ? 'video' : 'navegador'}
          title="Manual de uso desta ferramenta"
          style={{ fontSize: '11px', margin: '0 4px', whiteSpace: 'nowrap' }}
        >
          Como usar?
        </button>

        <button
          className="icon-btn sm"
          onClick={onClose}
          title="Fechar bancada de estudos (Esc)"
          aria-label="Fechar bancada"
          style={{ width: '26px', height: '26px' }}
        >
          ✕
        </button>
      </div>

      {/* Conteúdo das Abas: Mantém todas montadas preservando reprodução, zoom e formulários */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {tabs.map((t) => (
          <div
            key={t.id}
            style={{
              display: t.id === activeTabId ? 'flex' : 'none',
              flexDirection: 'column',
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
            }}
          >
            {t.type === 'pdf' && <PdfPane initial={t.pdfOpts || {}} onClose={() => closeTab(t.id)} />}
            {t.type === 'video' && (
              <VideoPane
                initialSrc={t.videoOpts?.src}
                initialName={t.videoOpts?.name}
                initialTime={t.videoOpts?.time}
                onClose={() => closeTab(t.id)}
              />
            )}
            {t.type === 'browser' && (
              <BrowserPane
                initialUrl={t.browserOpts?.url}
                onClose={() => closeTab(t.id)}
              />
            )}
          </div>
        ))}

        {/* Estado Vazio / Launchpad da Bancada de Estudos quando todas as abas forem fechadas */}
        {tabs.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: '24px',
              textAlign: 'center',
              gap: '16px',
            }}
          >
            <div style={{ fontSize: '42px', opacity: 0.85 }}>📚</div>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600 }}>Bancada de Estudos Integrada</h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)', maxWidth: '340px' }}>
                Abra PDFs, videoaulas ou páginas da web ao lado do mapa para fazer anotações e vincular aos tópicos.
              </p>
            </div>

            {/* Ações Rápidas */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn small primary" onClick={() => addTab('pdf')} title="Abrir PDF (Ctrl+Shift+P)">
                📄 Abrir PDF
              </button>
              <button className="btn small primary" onClick={() => addTab('video')} title="Abrir Videoaula (Ctrl+Shift+V)">
                🎬 Abrir Vídeo
              </button>
              <button className="btn small primary" onClick={() => addTab('browser')} title="Abrir Navegador Web (Ctrl+Shift+W)">
                🌐 Navegador Web
              </button>
            </div>

            {/* Materiais Vinculados ao Mapa Atual */}
            {mapPdfs.length > 0 && (
              <div style={{ marginTop: '12px', width: '100%', maxWidth: '380px', textAlign: 'left' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  PDFs vinculados a este mapa:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {mapPdfs.map((p) => (
                    <button
                      key={p.id}
                      className="btn small"
                      style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '6px 10px' }}
                      onClick={() => addTab('pdf', { path: p.path, name: p.name })}
                    >
                      📖 {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button className="link" onClick={onClose} style={{ fontSize: '12px', marginTop: '8px' }}>
              ✕ Fechar painel lateral
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
