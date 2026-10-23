import { useState, useRef, useEffect, useCallback } from 'react';
import { H, useMcRender } from './hooks.js';
import {
  parseTimestamp,
  formatTimestamp,
  isYouTubeUrl,
  toYouTubeEmbedUrl,
  setNodeVideoRef,
  getNodeVideoRef,
} from '../../core/videorefs.js';

export function VideoPane({ onClose }) {
  const h = H();
  useMcRender();
  const map = h.map();
  const selNode = h.selected();

  const [videoSrc, setVideoSrc] = useState(() => (h.loadCfg().lastVideoSrc || ''));
  const [videoName, setVideoName] = useState(() => (h.loadCfg().lastVideoName || 'Videoaula'));
  const [urlInput, setUrlInput] = useState('');
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [feedback, setFeedback] = useState('');

  const videoRef = useRef(null);

  // Lembra a última fonte aberta
  useEffect(() => {
    if (videoSrc) {
      h.saveCfg({ lastVideoSrc: videoSrc, lastVideoName: videoName });
    }
  }, [videoSrc, videoName]);

  const say = useCallback((msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3500);
  }, []);

  // Escuta saltos disparados ao clicar em carimbos do mapa
  useEffect(() => {
    const onJump = (e) => {
      const d = e.detail || {};
      if (d.src && d.src !== videoSrc) {
        setVideoSrc(d.src);
        if (d.name) setVideoName(d.name);
      }
      if (d.time != null && videoRef.current) {
        videoRef.current.currentTime = Math.max(0, d.time);
        videoRef.current.play().catch(() => {});
        say(`Saltou para ${formatTimestamp(d.time)}`);
      }
    };
    document.addEventListener('mc:video-jump', onJump);
    return () => document.removeEventListener('mc:video-jump', onJump);
  }, [videoSrc, say]);

  // Atualização de tempo do player
  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      videoRef.current.playbackRate = playbackRate;
    }
  };

  const changeRate = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  };

  // Abrir arquivo local via IPC (se Electron) ou seletor HTML
  const openLocalVideo = async () => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        const file = await ipcRenderer.invoke('dialog:open', ['mp4', 'webm', 'mkv', 'mov', 'avi']);
        if (file) {
          setVideoSrc(file);
          const name = file.replace(/\\/g, '/').split('/').pop().replace(/\.[^.]+$/, '');
          setVideoName(name);
          say(`Vídeo carregado: ${name}`);
        }
      } catch (err) {
        say('Erro ao abrir vídeo: ' + err.message);
      }
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/mp4,video/webm,video/ogg';
      input.onchange = (e) => {
        const f = e.target.files && e.target.files[0];
        if (f) {
          const url = URL.createObjectURL(f);
          setVideoSrc(url);
          setVideoName(f.name.replace(/\.[^.]+$/, ''));
          say(`Vídeo carregado: ${f.name}`);
        }
      };
      input.click();
    }
  };

  // Confirmar URL (YouTube ou link direto)
  const confirmUrl = () => {
    const raw = urlInput.trim();
    if (!raw) return;
    setVideoSrc(raw);
    const isYt = isYouTubeUrl(raw);
    setVideoName(isYt ? 'Aula do YouTube' : 'Vídeo Online');
    setShowUrlDialog(false);
    setUrlInput('');
    say(isYt ? 'YouTube carregado' : 'Vídeo online carregado');
  };

  // 1. Criar novo tópico filho neste instante
  const captureInstantAsChild = () => {
    if (!selNode) {
      say('Selecione um tópico no mapa para receber o novo subtópico.');
      return;
    }
    const t = Math.floor(currentTime);
    const stamp = formatTimestamp(t);
    const title = `[${stamp}] ${videoName}`;
    const n = h.change(() => {
      const child = map.addChild(selNode.id, title);
      if (child) {
        setNodeVideoRef(child, { videoId: videoSrc, time: t, title: videoName });
        child.notes = (child.notes ? child.notes + '\n\n' : '') + `🎬 Vídeo: ${videoName} (${stamp})\n${videoSrc}`;
      }
      return child;
    });
    if (n) {
      say(`Criado tópico filho no minuto ${stamp}`);
    }
  };

  // 2. Vincular este instante ao tópico selecionado
  const linkInstantToSelected = () => {
    if (!selNode) {
      say('Selecione um tópico no mapa para vincular este instante.');
      return;
    }
    const t = Math.floor(currentTime);
    const stamp = formatTimestamp(t);
    h.change(() => {
      setNodeVideoRef(selNode, { videoId: videoSrc, time: t, title: videoName });
      const tag = `🎬 [${stamp}]`;
      if (!selNode.title.includes('🎬')) {
        selNode.title = `${tag} ${selNode.title}`;
      }
    });
    say(`Instante ${stamp} vinculado ao tópico "${selNode.title}"`);
  };

  const isYt = isYouTubeUrl(videoSrc);
  const ytEmbed = isYt ? toYouTubeEmbedUrl(videoSrc, currentTime) : null;
  const currentRef = selNode ? getNodeVideoRef(selNode) : null;

  return (
    <div className="video-pane" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)' }}>
      {/* Barra de Ferramentas do Vídeo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', background: 'var(--bg-bar)', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
        <button className="btn small" onClick={openLocalVideo} title="Abrir arquivo de vídeo do computador">
          📂 Abrir Vídeo…
        </button>
        <button className="btn small" onClick={() => setShowUrlDialog((v) => !v)} title="Assistir vídeo do YouTube ou link web">
          🔗 YouTube / URL
        </button>
        {videoSrc && (
          <button
            className="btn small"
            id="videoCloseActive"
            onClick={() => {
              if (videoRef.current) videoRef.current.pause();
              setVideoSrc('');
              setVideoName('');
              say('Vídeo fechado.');
            }}
            title="Fechar vídeo atual e descarregar reprodução"
            style={{ color: '#ef4444' }}
          >
            ✕ Fechar Vídeo
          </button>
        )}

        <span className="vsep" style={{ margin: '0 4px' }} />

        {/* Velocidade */}
        <label className="opt" style={{ fontSize: '12px' }} title="Velocidade da aula">
          Vel.:
          <select
            value={playbackRate}
            onChange={(e) => changeRate(+e.target.value)}
            style={{ height: '24px', padding: '0 4px', fontSize: '11px', background: 'var(--bg-field)', border: '1px solid var(--line-soft)', color: 'var(--text)' }}
          >
            <option value="0.75">0.75x</option>
            <option value="1">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="1.75">1.75x</option>
            <option value="2">2.0x</option>
          </select>
        </label>

        <span className="grow" />
        <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
          {formatTimestamp(currentTime)} / {formatTimestamp(duration)}
        </span>
      </div>

      {/* Diálogo rápido para URL */}
      {showUrlDialog && (
        <div style={{ display: 'flex', gap: '6px', padding: '6px 10px', background: 'var(--bg-hover)', borderBottom: '1px solid var(--line)' }}>
          <input
            type="url"
            placeholder="Cole o link do YouTube ou URL do vídeo…"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmUrl(); if (e.key === 'Escape') setShowUrlDialog(false); }}
            style={{ flex: 1, height: '26px', padding: '0 8px', fontSize: '12px', background: 'var(--bg-field)', border: '1px solid var(--line-soft)', color: 'var(--text)', borderRadius: '4px' }}
          />
          <button className="btn small primary" onClick={confirmUrl}>Carregar</button>
          <button className="btn small" onClick={() => setShowUrlDialog(false)}>✕</button>
        </div>
      )}

      {/* Área de Visualização do Player */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!videoSrc ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>
            <div style={{ fontSize: '38px', marginBottom: '8px' }}>🎬</div>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Player de Videoaulas</div>
            <div style={{ fontSize: '12px', maxWidth: '300px', lineHeight: 1.4, color: '#888' }}>
              Abra um vídeo local ou cole um link do YouTube para estudar acompanhando o mapa mental.
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button className="btn small primary" onClick={openLocalVideo}>📂 Abrir do disco</button>
              <button className="btn small" onClick={() => setShowUrlDialog(true)}>🔗 YouTube / Link</button>
            </div>
          </div>
        ) : isYt ? (
          <iframe
            src={ytEmbed}
            title={videoName}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            style={{ width: '100%', height: '100%', outline: 'none', objectFit: 'contain' }}
          />
        )}
      </div>

      {/* Barra de Integração com o Mapa Mental */}
      <div style={{ padding: '8px 10px', background: 'var(--bg-bar)', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className="btn small primary"
            onClick={captureInstantAsChild}
            title="Cria um novo tópico filho do selecionado gravando este minuto exato do vídeo"
          >
            ＋ Tópico em {formatTimestamp(currentTime)}
          </button>
          <button
            className="btn small"
            onClick={linkInstantToSelected}
            title="Vincula este instante ao tópico já selecionado no mapa"
          >
            📌 Vincular ao tópico
          </button>
          {currentRef && (
            <span style={{ fontSize: '11px', color: 'var(--accent)', marginLeft: '4px' }}>
              Tópico atual: {currentRef.label}
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
