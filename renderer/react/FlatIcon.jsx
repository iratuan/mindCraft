/**
 * Catálogo de Ícones Flat Vetoriais (SVG) para a interface React.
 * Padrão flat: traço uniforme, monocromático (currentColor), sem efeitos 3D nem emojis.
 */
export function FlatIcon({ name, size = 16, className = '', style = {} }) {
  const common = {
    width: size,
    height: size,
    display: 'inline-block',
    verticalAlign: 'middle',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    flexShrink: 0,
    ...style,
  };

  switch (name) {
    case 'pdf':
    case 'file':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case 'video':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <rect x="2" y="4" width="15" height="16" rx="2" />
          <polygon points="23 7 17 12 23 17" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'browser':
    case 'globe':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'book':
    case 'study':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'home':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'external':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      );
    case 'pin':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <line x1="12" y1="17" x2="12" y2="22" />
          <path d="M5 17h14v-2l-2-3V5a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7l-2 3v2z" />
        </svg>
      );
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'folder':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'link':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case 'close':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case 'arrowLeft':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      );
    case 'arrowRight':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
    case 'refresh':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      );
    case 'target':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case 'robot':
    case 'ai':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8" y2="16" />
          <line x1="16" y1="16" x2="16" y2="16" />
        </svg>
      );
    case 'clipboard':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
      );
    case 'archive':
    case 'library':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect x="1" y="3" width="22" height="5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      );
    case 'edit':
    case 'exam':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    case 'brain':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <path d="M9.5 2A4.5 4.5 0 0 0 5 6.5c0 .77.2 1.5.55 2.14A4.5 4.5 0 0 0 3 12.5C3 15 5 17 7.5 17c.17 0 .34-.01.5-.03V17a4 4 0 0 0 4 4h.5V2h-.5z" />
          <path d="M14.5 2A4.5 4.5 0 0 1 19 6.5c0 .77-.2 1.5-.55 2.14A4.5 4.5 0 0 1 21 12.5C21 15 19 17 16.5 17c-.17 0-.34-.01-.5-.03V17a4 4 0 0 1-4 4h-.5V2h.5z" />
        </svg>
      );
    case 'shield':
    case 'backup':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'restore':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      );
    case 'info':
      return (
        <svg viewBox="0 0 24 24" style={common} className={className}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    default:
      return null;
  }
}
