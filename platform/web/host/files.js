'use strict';
/** Arquivos na versão web/tablet: escolher (seletor do sistema), copiar para a área do app e entregar (download/compartilhar). */
const MIME = { mom: 'application/octet-stream', mcpack: 'application/zip', db: 'application/vnd.sqlite3', md: 'text/markdown', csv: 'text/csv', txt: 'text/plain', ics: 'text/calendar', opml: 'text/x-opml', svg: 'image/svg+xml', png: 'image/png', pdf: 'application/pdf', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
const extOf = (n) => { const m = /\.([A-Za-z0-9]{1,8})$/.exec(n); return m ? m[1].toLowerCase() : ''; };

/** Nome seguro: sem pastas, sem caracteres de controle/proibidos, tamanho limitado. */
function safeName(name, fallback = 'arquivo') {
  let n = String(name ?? '').split(/[\\/]/).pop().replace(/[\u0000-\u001f\u007f<>:"|?*]/g, '_').replace(/^\.+/, '').trim().slice(0, 120);
  return n || fallback;
}
const bytesEqual = (a, b) => { if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; };

/**
 * Escolhe arquivo(s). Devolve [{ name, bytes }] ou null se cancelou.
 * `window.__mcPick` (testes) substitui o seletor nativo, que não dá para automatizar.
 */
async function pick({ accept = '', multiple = false } = {}) {
  if (typeof window.__mcPick === 'function') { const r = await window.__mcPick({ accept, multiple }); return r && r.length ? r.map((f) => ({ name: f.name, bytes: f.bytes instanceof Uint8Array ? f.bytes : new Uint8Array(f.bytes) })) : null; }
  return new Promise((resolve) => {
    const input = document.createElement('input'); input.type = 'file'; if (accept) input.accept = accept; input.multiple = !!multiple; input.style.display = 'none'; document.body.append(input);
    let settled = false; const finish = async (files) => {
      if (settled) return; settled = true; input.remove();
      if (!files || !files.length) return resolve(null);
      try { resolve(await Promise.all([...files].map(async (f) => ({ name: f.name, bytes: new Uint8Array(await f.arrayBuffer()) })))); } catch { resolve(null); }
    };
    input.addEventListener('change', () => finish(input.files)); input.addEventListener('cancel', () => finish(null));
    window.addEventListener('focus', () => setTimeout(() => { if (!input.files || !input.files.length) finish(null); }, 800), { once: true });   // navegadores sem o evento "cancel"
    input.click();
  });
}

/** Copia bytes para `dir` no armazenamento do app. Mesmo nome + mesmo conteúdo = reaproveita; mesmo nome e conteúdo diferente = "nome (2).ext" (nunca sobrescreve). */
function place(fs, path, dir, name, bytes) {
  fs.mkdirSync(dir, { recursive: true }); const base = safeName(name), ext = path.extname(base), stem = ext ? base.slice(0, -ext.length) : base;
  for (let i = 1; i < 1000; i++) {
    const p = path.join(dir, i === 1 ? base : `${stem} (${i})${ext}`);
    if (!fs.existsSync(p)) { fs.writeFileSync(p, bytes); return p; }
    if (bytesEqual(new Uint8Array(fs.readFileSync(p)), bytes)) return p;
  }
  throw new Error('Muitos arquivos com o mesmo nome em ' + dir);
}

/** Entrega um arquivo ao usuário (download). `window.__mcDownload` (testes) intercepta. */
function deliver(name, bytes) {
  if (typeof window.__mcDownload === 'function') return window.__mcDownload({ name, bytes });
  const blob = new Blob([bytes], { type: MIME[extOf(name)] || 'application/octet-stream' }), url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.style.display = 'none'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
module.exports = { pick, place, deliver, safeName, extOf };
