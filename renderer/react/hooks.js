import { useEffect, useState, useCallback } from 'react';

export const H = () => window.MC;

/** Escape fecha o modal (o mesmo comportamento da versão clássica, que escuta no #modal). */
export function useEscape(onClose) {
  useEffect(() => {
    const m = H().modalEl();
    const f = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    m.addEventListener('keydown', f);
    return () => m.removeEventListener('keydown', f);
  }, [onClose]);
}

/** Mensagem de status do modal: { text, kind } onde kind é '', 'ok' ou 'err'. */
export function useMessage() {
  const [msg, setMsg] = useState({ text: '', kind: '' });
  const say = useCallback((text, kind = '') => setMsg({ text: text || '', kind }), []);
  return [msg, say];
}

/** Força um novo render (os dados vêm do banco de forma síncrona a cada render). */
export function useRefresh() {
  const [, set] = useState(0);
  return useCallback(() => set((n) => n + 1), []);
}
