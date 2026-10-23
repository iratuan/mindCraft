'use strict';
/**
 * Referências e carimbos de tempo de vídeo para estudo (videoaulas e cursos).
 * Regras puras: formato de timestamp, extração de IDs de vídeo (local e YouTube),
 * e associação bidirecional de carimbos de tempo com tópicos do mapa.
 */

/**
 * Converte string de tempo para segundos.
 * Aceita: "hh:mm:ss", "mm:ss", "ss", "1h20m15s", "10m30s", "45s".
 * Devolve null se a entrada for inválida ou negativa.
 */
function parseTimestamp(val) {
  if (val == null) return null;
  if (typeof val === 'number') return Number.isFinite(val) && val >= 0 ? Math.floor(val) : null;
  const str = String(val).trim();
  if (!str) return null;

  // Formato com sufixos: 1h20m30s, 15m, 45s
  if (/[hms]/i.test(str)) {
    const h = (str.match(/(\d+)\s*h/i) || [])[1] || 0;
    const m = (str.match(/(\d+)\s*m/i) || [])[1] || 0;
    const s = (str.match(/(\d+)\s*s/i) || [])[1] || 0;
    const total = (+h) * 3600 + (+m) * 60 + (+s);
    return total >= 0 ? total : null;
  }

  // Formato digital separado por dois pontos: hh:mm:ss ou mm:ss
  const parts = str.split(':').map((p) => p.trim());
  if (parts.length > 3 || parts.some((p) => !/^\d+$/.test(p))) return null;
  if (parts.length === 3) {
    const [h, m, s] = parts.map(Number);
    if (m >= 60 || s >= 60) return null;
    return h * 3600 + m * 60 + s;
  }
  if (parts.length === 2) {
    const [m, s] = parts.map(Number);
    if (s >= 60) return null;
    return m * 60 + s;
  }
  if (parts.length === 1) {
    const s = Number(parts[0]);
    return Number.isFinite(s) && s >= 0 ? Math.floor(s) : null;
  }
  return null;
}

/** Formata segundos em "mm:ss" ou "hh:mm:ss". */
function formatTimestamp(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const p = (n) => String(n).padStart(2, '0');
  if (hrs > 0) return `${hrs}:${p(mins)}:${p(secs)}`;
  return `${p(mins)}:${p(secs)}`;
}

/** Verifica se a URL é do YouTube (domínio ou encurtador). */
function isYouTubeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(url.trim());
}

/** Extrai o identificador (11 caracteres) de um link do YouTube. */
function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  const m1 = clean.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#&?]{11})/i);
  if (m1 && m1[1]) return m1[1];
  const m2 = clean.match(/youtube\.com\/shorts\/([^#&?]{11})/i);
  if (m2 && m2[1]) return m2[1];
  return null;
}

/** Gera a URL segura para iframe embed (youtube-nocookie). */
function toYouTubeEmbedUrl(url, startSec = 0) {
  const id = extractYouTubeId(url);
  if (!id) return null;
  const s = Math.max(0, Math.floor(Number(startSec) || 0));
  const startParam = s > 0 ? `&start=${s}` : '';
  return `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1&rel=0${startParam}`;
}

/** Valida e normaliza um registro de vídeo no mapa mental. */
function normalizeVideo(v) {
  if (!v || typeof v !== 'object') return null;
  const name = String(v.name || v.title || 'Vídeo sem título').trim().slice(0, 150);
  const id = String(v.id || ('v_' + Math.random().toString(36).slice(2, 10)));
  const path = typeof v.path === 'string' && v.path.trim() ? v.path.trim() : null;
  const url = typeof v.url === 'string' && v.url.trim() ? v.url.trim() : null;
  if (!path && !url) return null;
  const dur = typeof v.dur === 'number' && v.dur >= 0 ? Math.floor(v.dur) : null;
  return { id, name, path, url, dur };
}

/** Adiciona ou atualiza uma referência de vídeo em um nó. */
function setNodeVideoRef(node, ref) {
  if (!node) return false;
  if (!ref) { delete node.mcVideoRef; return true; }
  const time = parseTimestamp(ref.time);
  if (time == null) return false;
  node.mcVideoRef = {
    videoId: String(ref.videoId || ''),
    time,
    title: ref.title ? String(ref.title).trim().slice(0, 120) : '',
  };
  return true;
}

/** Devolve a referência de vídeo do nó ou null. */
function getNodeVideoRef(node) {
  if (!node || !node.mcVideoRef) return null;
  const r = node.mcVideoRef;
  if (typeof r.time !== 'number' || r.time < 0) return null;
  return {
    videoId: r.videoId || '',
    time: r.time,
    title: r.title || '',
    label: `🎬 ${formatTimestamp(r.time)}${r.title ? ' - ' + r.title : ''}`,
  };
}

module.exports = {
  parseTimestamp,
  formatTimestamp,
  isYouTubeUrl,
  extractYouTubeId,
  toYouTubeEmbedUrl,
  normalizeVideo,
  setNodeVideoRef,
  getNodeVideoRef,
};
