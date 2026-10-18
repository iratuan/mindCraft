'use strict';
/**
 * Emulação do processo principal do Electron para a versão web/tablet: o `ipcRenderer` que a interface espera,
 * com os MESMOS canais e formatos de resposta de electron/main.js. A interface roda sem nenhuma alteração.
 */
const dialogs = require('./dialogs');
const files = require('./files');

const DIRS = { docs: '/docs', pdfs: '/pdfs', imports: '/imports', exports: '/exports', userData: '/userdata' };
const OPEN_ACCEPT = '.mom,.md,.opml,.txt';

function createIpc({ fs, path, MindCore, host = {} }) {
  const listeners = new Map();
  const on = (ch, fn) => { if (!listeners.has(ch)) listeners.set(ch, new Set()); listeners.get(ch).add(fn); return ipcRenderer; };
  const off = (ch, fn) => { if (listeners.has(ch)) listeners.get(ch).delete(fn); return ipcRenderer; };
  const emit = (ch, ev, ...args) => { for (const fn of [...(listeners.get(ch) || [])]) { try { fn(ev || {}, ...args); } catch (e) { console.error(e); } } return true; };
  for (const d of Object.values(DIRS)) fs.mkdirSync(d, { recursive: true });

  const recentFile = () => path.join(DIRS.userData, 'recent.json');
  const loadRecent = () => { try { const l = JSON.parse(fs.readFileSync(recentFile(), 'utf8')); return Array.isArray(l) ? l.filter((p) => typeof p === 'string') : []; } catch { return []; } };
  const saveRecent = (l) => { fs.mkdirSync(DIRS.userData, { recursive: true }); fs.writeFileSync(recentFile(), JSON.stringify(l.slice(0, 12))); };

  // destinos externos escolhidos em "Salvar como" (arquivo do aparelho ↔ cópia no app). 'mirror': a cada gravação do .mom o arquivo escolhido é atualizado;
  // 'once': exportação entregue uma vez. Persistido para o Ctrl+S continuar valendo depois de fechar o app.
  const targetsFile = () => path.join(DIRS.userData, 'targets.json');
  const loadTargets = () => { try { const t = JSON.parse(fs.readFileSync(targetsFile(), 'utf8')); return t && typeof t === 'object' ? t : {}; } catch { return {}; } };
  const targets = {
    get: (p) => loadTargets()[p] || null,
    set: (p, t) => { const m = loadTargets(); m[p] = t; fs.mkdirSync(DIRS.userData, { recursive: true }); fs.writeFileSync(targetsFile(), JSON.stringify(m)); },
    del: (p) => { const m = loadTargets(); if (m[p]) { delete m[p]; fs.writeFileSync(targetsFile(), JSON.stringify(m)); } },
  };
  /** Garante a extensão do tipo (".mom") sem duplicá-la e devolve um nome seguro. */
  const withExt = (name, kind) => { let n = files.safeName(name, 'mapa'); const want = '.' + (kind || 'mom'); if (!n.toLowerCase().endsWith(want)) n = n.replace(/\.[A-Za-z0-9]{1,8}$/, '') + want; return n; };
  const uniqueIn = (dir, name) => { const ext = path.extname(name), stem = ext ? name.slice(0, -ext.length) : name; for (let i = 1; i < 1000; i++) { const n = i === 1 ? name : `${stem} (${i})${ext}`; if (!fs.existsSync(path.join(dir, n))) return n; } return name; };

  /** Escolhe um arquivo e o guarda no app; devolve o caminho virtual (ou null se cancelou). */
  const chooseInto = async (dir, accept) => { const r = await files.pick({ accept }); return r && r[0] ? files.place(fs, path, dir, r[0].name, r[0].bytes) : null; };

  const handlers = {
    'app:path': (name) => ({ userData: DIRS.userData, documents: DIRS.docs, temp: '/tmp', home: '/', downloads: DIRS.exports }[name] || '/'),
    'app:start-override': () => null,
    'dialog:confirm-discard': () => dialogs.confirmBox({ message: 'Há alterações não salvas.', detail: 'Deseja salvar antes de continuar?', buttons: ['Salvar', 'Descartar', 'Cancelar'], defaultId: 0, cancelId: 2 }),
    'dialog:confirm': (o) => dialogs.confirmBox({ message: o.message, detail: o.detail, buttons: o.buttons, defaultId: 0, cancelId: o.buttons.length - 1 }),
    'dialog:error': (msg) => { dialogs.errorBox(msg); },
    // "Salvar como": a pessoa edita o nome e escolhe o destino. .mom: documentos do app (editável, reabre pelos recentes) e/ou um arquivo do aparelho
    // escolhido no seletor do Android (mantido atualizado a cada salvar); demais formatos: arquivo do aparelho, compartilhar ou baixar.
    'dialog:save': async (kind, defaultName) => {
      kind = kind || 'mom'; const nat = host.nat, mime = files.MIME ? files.MIME[kind] : undefined;
      const opts = [];
      if (kind === 'mom') opts.push({ id: 'docs', label: 'Documentos do MindCraft', detail: 'Guardado neste app: reabre pela tela inicial e pelos recentes.' });
      if (nat) opts.push({ id: 'device', label: 'Escolher pasta e nome no aparelho…', detail: 'Downloads, Google Drive, cartão SD… A cada Salvar o arquivo escolhido é atualizado.' });
      if (kind !== 'mom') opts.push({ id: 'share', label: nat ? 'Compartilhar ou enviar…' : 'Baixar', detail: nat ? 'Abre o compartilhamento do Android (Drive, WhatsApp, e-mail…).' : 'Salva na pasta de downloads do navegador.' });
      const r = await dialogs.saveAsBox({ title: 'Salvar como', name: withExt(defaultName, kind), options: opts });
      if (!r) return null;
      const name = withExt(r.name, kind);
      if (r.dest === 'device') {
        const t = await nat.pickTarget(name, mime); if (!t) return null;                                   // o seletor do sistema também deixa mudar nome e pasta
        const shown = withExt(t.name || name, kind);
        const dir = kind === 'mom' ? DIRS.docs : DIRS.exports; fs.mkdirSync(dir, { recursive: true });
        const local = path.join(dir, kind === 'mom' ? uniqueIn(dir, shown) : shown);
        targets.set(local, { uri: t.uri, name: t.name || shown, mode: kind === 'mom' ? 'mirror' : 'once' }); return local;
      }
      const dir = r.dest === 'docs' ? DIRS.docs : DIRS.exports, target = path.join(dir, name);
      if (kind === 'mom' && fs.existsSync(target)) { const c = await dialogs.confirmBox({ message: `Já existe "${name}" nos documentos do app.`, detail: 'Substituir?', buttons: ['Substituir', 'Cancelar'], defaultId: 1, cancelId: 1 }); if (c !== 0) return null; }
      fs.mkdirSync(dir, { recursive: true }); targets.del(target); return target;
    },
    'dialog:open': () => chooseInto(DIRS.docs, OPEN_ACCEPT),
    'dialog:open-csv': () => chooseInto(DIRS.imports, '.csv,.txt'),
    'dialog:open-pdf': () => chooseInto(DIRS.pdfs, '.pdf,application/pdf'),
    'dialog:open-pack': () => chooseInto(DIRS.imports, '.mcpack,.zip'),
    'dialog:open-at': () => null,                       // "versões anteriores" por pasta de backup: não existe na versão tablet (a biblioteca guarda versões)
    'dialog:folder': () => null,                        // pasta do Obsidian/vault: sem equivalente no tablet
    'obsidian:open': () => ({ ok: false, error: 'O Obsidian não está disponível na versão tablet.' }),
    'clip:read': async () => { try { return String(await navigator.clipboard.readText()); } catch { return ''; } },
    'clip:write': async (t) => { try { await navigator.clipboard.writeText(String(t)); } catch { /* sem permissão: ignora */ } },
    'open-external': (url) => { const u = String(url || ''); if (!/^(https?:\/\/|mailto:)[^\s<>"']+$/i.test(u)) return { ok: false }; window.open(u, '_blank', 'noopener'); return { ok: true, url: u }; },
    'recent:list': () => loadRecent().map((p) => { let st = null; try { st = fs.statSync(p); } catch { /* sumiu */ } return { path: p, exists: !!st && st.isFile(), mtime: st ? st.mtimeMs : null }; }),
    'recent:add': (p) => { if (typeof p === 'string') saveRecent([p, ...loadRecent().filter((x) => x !== p)]); },
    'recent:remove': (p) => { saveRecent(loadRecent().filter((x) => x !== p)); },
    'recent:clear': () => { saveRecent([]); },
    'notify:show': async (n) => {
      const m = MindCore.notify.sanitizeNotice(n); if (!m || typeof Notification === 'undefined') return false;
      try { if (Notification.permission === 'default') await Notification.requestPermission(); if (Notification.permission !== 'granted') return false; const note = new Notification(m.title, { body: m.body }); note.onclick = () => { window.focus(); emit('menu', {}, 'review'); }; return true; } catch { return false; }
    },
    'render-export': async (fmt, data, opts = {}) => {
      const { MindMap } = MindCore.model, map = MindMap.fromJSON(data);
      if (fmt === 'docx') return MindCore.export.toDOCX(map, { ...opts, image: opts.image ? Buffer.from(opts.image) : undefined });
      if (fmt === 'study-docx') return MindCore.report.toStudyDOCX(map, opts);
      if (fmt === 'pdf') throw new Error('Exportar PDF ainda não está disponível na versão tablet. Use Word, Markdown ou imagem.');
      throw new Error('formato não suportado: ' + fmt);
    },
  };

  const ipcRenderer = {
    invoke: async (ch, ...args) => { const h = handlers[ch]; if (!h) throw new Error('Canal não suportado na versão tablet: ' + ch); return h(...args); },
    on, once: (ch, fn) => { const w = (...a) => { off(ch, w); fn(...a); }; return on(ch, w); }, off, removeListener: off, removeAllListeners: (ch) => { listeners.delete(ch); return ipcRenderer; }, emit,
    send: (ch, ...args) => { if (ch === 'dirty') { const v = args[0]; const d = v && typeof v === 'object' ? !!v.dirty : !!v; document.title = (d ? '● ' : '') + (document.title || 'MindCraft').replace(/^● /, ''); } /* 'close-now' e demais: sem janela para fechar */ },
  };
  return { ipcRenderer, handlers, DIRS, loadRecent, targets };
}
module.exports = { createIpc, DIRS };
