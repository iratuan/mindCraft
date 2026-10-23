import { useState, useEffect } from 'react';
import { PdfPane } from './PdfPane.jsx';
import { VideoPane } from './VideoPane.jsx';
import { BrowserPane } from './BrowserPane.jsx';

export function MediaPane({ initialTab = 'pdf', pdfOpts = {}, onClose }) {
  const [tab, setTab] = useState(initialTab);
  const [currentPdfOpts, setCurrentPdfOpts] = useState(pdfOpts);

  useEffect(() => {
    const onOpen = (e) => {
      const d = e.detail || {};
      if (d.tab) setTab(d.tab);
      if (d.pdfOpts) setCurrentPdfOpts(d.pdfOpts);
    };
    document.addEventListener('mc:media-switch', onOpen);
    return () => document.removeEventListener('mc:media-switch', onOpen);
  }, []);

  return (
    <div className="media-pane-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: 'var(--bg-panel)' }}>
      {/* Cabeçalho de Abas Multimídia */}
      <div style={{ display: 'flex', alignItems: 'center', height: '34px', background: 'var(--bg-bar)', borderBottom: '1px solid var(--line)', padding: '0 8px', gap: '4px' }}>
        <button
          className={'ptab' + (tab === 'pdf' ? ' on' : '')}
          style={{ height: '26px', padding: '0 10px', fontSize: '12px', fontWeight: tab === 'pdf' ? 700 : 400, borderRadius: '4px', border: 'none', background: tab === 'pdf' ? 'var(--bg-panel)' : 'transparent', color: tab === 'pdf' ? 'var(--text-strong)' : 'var(--text-dim)', cursor: 'pointer' }}
          onClick={() => setTab('pdf')}
        >
          📄 PDF
        </button>
        <button
          className={'ptab' + (tab === 'video' ? ' on' : '')}
          style={{ height: '26px', padding: '0 10px', fontSize: '12px', fontWeight: tab === 'video' ? 700 : 400, borderRadius: '4px', border: 'none', background: tab === 'video' ? 'var(--bg-panel)' : 'transparent', color: tab === 'video' ? 'var(--text-strong)' : 'var(--text-dim)', cursor: 'pointer' }}
          onClick={() => setTab('video')}
        >
          🎬 Vídeo
        </button>
        <button
          className={'ptab' + (tab === 'browser' ? ' on' : '')}
          style={{ height: '26px', padding: '0 10px', fontSize: '12px', fontWeight: tab === 'browser' ? 700 : 400, borderRadius: '4px', border: 'none', background: tab === 'browser' ? 'var(--bg-panel)' : 'transparent', color: tab === 'browser' ? 'var(--text-strong)' : 'var(--text-dim)', cursor: 'pointer' }}
          onClick={() => setTab('browser')}
        >
          🌐 Navegador
        </button>

        <span style={{ flex: 1 }} />

        <button
          className="link help-q"
          data-manual={tab === 'pdf' ? 'pdf' : tab === 'video' ? 'video' : 'navegador'}
          title="Manual de uso"
          style={{ fontSize: '11px', marginRight: '6px' }}
        >
          ? Como usar
        </button>

        <button
          className="icon-btn sm"
          onClick={onClose}
          title="Fechar painel de estudos multimídia (Esc / atalho)"
          aria-label="Fechar painel"
          style={{ width: '24px', height: '24px' }}
        >
          ✕
        </button>
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {tab === 'pdf' && <PdfPane initial={currentPdfOpts} onClose={onClose} />}
        {tab === 'video' && <VideoPane onClose={onClose} />}
        {tab === 'browser' && <BrowserPane onClose={onClose} />}
      </div>
    </div>
  );
}
