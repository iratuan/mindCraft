'use strict';
// Biblioteca MindCraft em SQLite (módulo nativo node:sqlite — sem dependências para compilar, funciona no Node e no Electron).
// - Um banco guarda todos os mapas (tópicos, estudo, relações, tema, prova), com instantâneos (versões) e lixeira.
// - A fonte da verdade de cada tópico são as colunas (título, notas, marcadores…) + `study_json`; as colunas
//   `weight/next_review/minutes_total/q_*` e as tabelas `study_log`/`qlog` são DERIVADAS (consultas rápidas) e refeitas a cada gravação.
// - Entrada/saída: .mom (compatível) e pacote portátil .mcpack (zip com manifest + .mom, com SHA-256 de cada mapa).
// Nunca grava nos arquivos de origem; toda gravação é uma transação (tudo ou nada); importações são verificadas ao reler.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AdmZip = require('adm-zip');
const { DatabaseSync } = require('node:sqlite');
const { MindMap, newId } = require('./model');
const { readMom, writeMom } = require('./mom');
const study = require('./study');
const { sanitizeSettings } = require('./settings');

const PACKAGE_FORMAT = 'mindcraft-library';
const MAX_ENTRY_BYTES = 64 * 1024 * 1024;
const MAX_PACKAGE_MAPS = 5000;
const SNAPSHOT_KEEP = 30;
const SNAPSHOT_MIN_MS = 10 * 60 * 1000;
const SAFE_FILE = /^maps\/[A-Za-z0-9_-]{1,64}\.mom$/;

const MIGRATIONS = [
  (db) => db.exec(`
    CREATE TABLE app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE maps (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, theme TEXT, exam_name TEXT, exam_date TEXT,
      meta_json TEXT NOT NULL DEFAULT '{}', root_id TEXT NOT NULL,
      source_path TEXT, source_hash TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      deleted_at TEXT, rev INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX maps_hash ON maps(source_hash);
    CREATE TABLE topics (
      map_id TEXT NOT NULL REFERENCES maps(id) ON DELETE CASCADE, id TEXT NOT NULL, parent_id TEXT, pos INTEGER NOT NULL,
      title TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '', collapsed INTEGER NOT NULL DEFAULT 0, progress REAL,
      markers TEXT NOT NULL DEFAULT '[]', style TEXT NOT NULL DEFAULT '{}', study_json TEXT, raw TEXT, extra TEXT,
      weight INTEGER, next_review TEXT, last_review TEXT, minutes_total INTEGER NOT NULL DEFAULT 0, q_done INTEGER NOT NULL DEFAULT 0, q_correct INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (map_id, id)
    );
    CREATE INDEX topics_children ON topics(map_id, parent_id, pos);
    CREATE INDEX topics_due ON topics(next_review) WHERE next_review IS NOT NULL;
    CREATE TABLE study_log (map_id TEXT NOT NULL REFERENCES maps(id) ON DELETE CASCADE, topic_id TEXT NOT NULL, day TEXT NOT NULL, minutes INTEGER NOT NULL, PRIMARY KEY (map_id, topic_id, day));
    CREATE INDEX study_log_day ON study_log(day);
    CREATE TABLE qlog (map_id TEXT NOT NULL REFERENCES maps(id) ON DELETE CASCADE, topic_id TEXT NOT NULL, day TEXT NOT NULL, done INTEGER NOT NULL, correct INTEGER NOT NULL, PRIMARY KEY (map_id, topic_id, day));
    CREATE INDEX qlog_day ON qlog(day);
    CREATE TABLE relations (map_id TEXT NOT NULL REFERENCES maps(id) ON DELETE CASCADE, id TEXT NOT NULL, from_id TEXT NOT NULL, to_id TEXT NOT NULL, label TEXT NOT NULL DEFAULT '', data TEXT NOT NULL, PRIMARY KEY (map_id, id));
    CREATE TABLE snapshots (id INTEGER PRIMARY KEY AUTOINCREMENT, map_id TEXT NOT NULL REFERENCES maps(id) ON DELETE CASCADE, created_at TEXT NOT NULL, reason TEXT NOT NULL, data BLOB NOT NULL);
    CREATE INDEX snapshots_map ON snapshots(map_id, id);
  `),
  // 2: questões por banca/ano e caderno de erros (tabelas DERIVADAS, refeitas a cada gravação; esta migração preenche as dos mapas já guardados)
  (db) => {
    db.exec(`
      CREATE TABLE qsrc (map_id TEXT NOT NULL REFERENCES maps(id) ON DELETE CASCADE, topic_id TEXT NOT NULL, day TEXT NOT NULL, banca TEXT NOT NULL, bkey TEXT NOT NULL, year INTEGER, done INTEGER NOT NULL, correct INTEGER NOT NULL);
      CREATE INDEX qsrc_map ON qsrc(map_id);
      CREATE TABLE qerr (map_id TEXT NOT NULL REFERENCES maps(id) ON DELETE CASCADE, topic_id TEXT NOT NULL, idx INTEGER NOT NULL, day TEXT NOT NULL, why TEXT NOT NULL, note TEXT NOT NULL, banca TEXT, year INTEGER, redo_day TEXT, redo_ok INTEGER, PRIMARY KEY (map_id, topic_id, idx));
    `);
    const insS = db.prepare('INSERT INTO qsrc(map_id,topic_id,day,banca,bkey,year,done,correct) VALUES (?,?,?,?,?,?,?,?)');
    const insE = db.prepare('INSERT INTO qerr(map_id,topic_id,idx,day,why,note,banca,year,redo_day,redo_ok) VALUES (?,?,?,?,?,?,?,?,?,?)');
    for (const t of db.prepare('SELECT map_id, id, study_json FROM topics WHERE study_json IS NOT NULL').all()) {
      let st; try { st = study.normalizeStudy(JSON.parse(t.study_json)); } catch { continue; }
      for (const r of st.qsrc || []) insS.run(t.map_id, t.id, r.d, r.banca || '', study.bancaKey(r.banca), r.year ?? null, r.done, r.correct);
      (st.errs || []).forEach((e, i) => insE.run(t.map_id, t.id, i, e.d, e.why, e.note, e.banca ?? null, e.year ?? null, e.redo ? e.redo.d : null, e.redo ? (e.redo.ok ? 1 : 0) : null));
    }
  },
];

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const nz = (v) => (v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : v);
/** JSON com chaves ordenadas: serve para comparar mapas (verificação de importação e testes). */
function stable(v) {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
  return JSON.stringify(v);
}
/** Forma canônica de um mapa para comparação (ignora só o vínculo com a biblioteca). */
function canonical(map) {
  const copy = JSON.parse(JSON.stringify({ meta: map.meta, root: map.root }));
  delete copy.meta.libId;
  // writeMom renova a data de modificação a cada gravação: ela não conta como diferença de conteúdo
  // (e o id/data de criação do documento interno, gerados de novo a cada exportação de um mapa criado no MindCraft)
  if (copy.meta._momDoc && copy.meta._momDoc.mapInfo) for (const k of ['modificationDate', 'creationDate', 'id']) delete copy.meta._momDoc.mapInfo[k];
  (function strip(n) { if (n._mom) { delete n._mom.modificationDate; delete n._mom.creationDate; } n.children.forEach(strip); })(copy.root);
  return stable(copy);
}

const KNOWN = new Set(['id', 'title', 'notes', 'collapsed', 'style', 'markers', 'progress', 'children', 'study', '_mom']);

class Library {
  constructor(file, { now = () => new Date().toISOString(), check = false } = {}) {
    this.file = file; this.now = now; this._depth = 0;
    if (file !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
    this.db = new DatabaseSync(file);
    this.db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
    if (file !== ':memory:') this.db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;');
    if (check) { const r = this.db.prepare('PRAGMA quick_check').all().map((x) => x.quick_check); if (r.length !== 1 || r[0] !== 'ok') { this.db.close(); throw new Error('O arquivo da biblioteca parece danificado (' + r.slice(0, 2).join('; ') + '). Restaure uma cópia de segurança.'); } }
    this._migrate();
  }

  _migrate() {
    const v = this.db.prepare('PRAGMA user_version').get().user_version;
    if (v > MIGRATIONS.length) throw new Error('Esta biblioteca foi criada por uma versão mais nova do MindCraft. Atualize o aplicativo para abri-la.');
    if (v > 0 && v < MIGRATIONS.length && this.file !== ':memory:') this.backupTo(`${this.file}.antes-da-v${MIGRATIONS.length}.bak`);
    for (let i = v; i < MIGRATIONS.length; i++) this.tx(() => { MIGRATIONS[i](this.db); this.db.exec(`PRAGMA user_version = ${i + 1}`); });
    this.db.prepare("INSERT OR IGNORE INTO app_meta(key, value) VALUES ('created_at', ?)").run(this.now());
  }

  /** Transação com aninhamento (SAVEPOINT): se algo lançar, tudo volta. */
  tx(fn) {
    const name = `sp${this._depth}`;
    if (this._depth === 0) this.db.exec('BEGIN IMMEDIATE'); else this.db.exec(`SAVEPOINT ${name}`);
    this._depth++;
    try {
      const r = fn();
      this._depth--;
      if (this._depth === 0) this.db.exec('COMMIT'); else this.db.exec(`RELEASE ${name}`);
      return r;
    } catch (e) {
      this._depth--;
      try { if (this._depth === 0) this.db.exec('ROLLBACK'); else this.db.exec(`ROLLBACK TO ${name}; RELEASE ${name}`); } catch { /* já desfeito */ }
      throw e;
    }
  }
  close() { this.db.close(); }
  integrityCheck() { return this.db.prepare('PRAGMA integrity_check').all().map((r) => r.integrity_check); }
  /** Cópia consistente do banco inteiro (VACUUM INTO), gravada de forma atômica. */
  backupTo(target) {
    const tmp = `${target}.tmp-${process.pid}`;
    fs.rmSync(tmp, { force: true });
    this.db.prepare('VACUUM INTO ?').run(tmp);
    fs.renameSync(tmp, target);
    return target;
  }

  // ---------- mapas ----------
  /** Grava (cria ou substitui) um mapa numa transação. Devolve o id do mapa na biblioteca. */
  saveMap(map, { id = map.meta.libId, source = null, hash = null, snapshot = 'auto', expectRev = null, verify = false } = {}) {
    return this.tx(() => {
      const now = this.now();
      id = id || newId();
      const cur = this.db.prepare('SELECT rev, created_at, source_path, source_hash FROM maps WHERE id = ?').get(id);
      if (cur && expectRev !== null && cur.rev !== expectRev) throw new Error('Conflito: o mapa foi alterado por outra operação desde que você o abriu.');
      if (cur && snapshot) this._autoSnapshot(id, snapshot === true ? 'auto' : snapshot);
      const meta = { ...map.meta }; delete meta.libId; delete meta.relations;
      const row = [map.meta.name || map.root.title, map.meta.theme || null, map.meta.exam ? map.meta.exam.name || '' : null, map.meta.exam ? map.meta.exam.date : null, stable(meta), map.root.id];
      if (cur) {
        this.db.prepare('UPDATE maps SET title=?, theme=?, exam_name=?, exam_date=?, meta_json=?, root_id=?, source_path=COALESCE(?, source_path), source_hash=COALESCE(?, source_hash), updated_at=?, deleted_at=NULL, rev=rev+1 WHERE id=?')
          .run(...row.map(nz), nz(source), nz(hash), now, id);
        for (const t of ['topics', 'study_log', 'qlog', 'qsrc', 'qerr', 'relations']) this.db.prepare(`DELETE FROM ${t} WHERE map_id = ?`).run(id);
      } else {
        this.db.prepare('INSERT INTO maps(title, theme, exam_name, exam_date, meta_json, root_id, source_path, source_hash, created_at, updated_at, id) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
          .run(...row.map(nz), nz(source), nz(hash), now, now, id);
      }
      this._writeTree(id, map);
      if (verify && canonical(this.loadMap(id, { includeTrashed: true })) !== canonical(map)) throw new Error('A verificação após gravar falhou (o mapa lido do banco difere do que estava na tela). Nada foi gravado.');
      map.meta.libId = id;
      return id;
    });
  }

  _writeTree(mapId, map) {
    const ins = this.db.prepare('INSERT INTO topics(map_id,id,parent_id,pos,title,notes,collapsed,progress,markers,style,study_json,raw,extra,weight,next_review,last_review,minutes_total,q_done,q_correct) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    const insLog = this.db.prepare('INSERT INTO study_log(map_id,topic_id,day,minutes) VALUES (?,?,?,?)');
    const insQ = this.db.prepare('INSERT INTO qlog(map_id,topic_id,day,done,correct) VALUES (?,?,?,?,?)');
    const insS = this.db.prepare('INSERT INTO qsrc(map_id,topic_id,day,banca,bkey,year,done,correct) VALUES (?,?,?,?,?,?,?,?)');
    const insE = this.db.prepare('INSERT INTO qerr(map_id,topic_id,idx,day,why,note,banca,year,redo_day,redo_ok) VALUES (?,?,?,?,?,?,?,?,?,?)');
    const seen = new Set();
    const visit = (n, parent, pos) => {
      if (seen.has(n.id)) throw new Error(`Tópico repetido no mapa: ${n.id}`);
      seen.add(n.id);
      const extra = {}; for (const k of Object.keys(n)) if (!KNOWN.has(k)) extra[k] = n[k];
      const st = n.study ? study.normalizeStudy(n.study) : null;
      ins.run(mapId, n.id, nz(parent), pos, String(n.title ?? ''), String(n.notes ?? ''), nz(!!n.collapsed), nz(n.progress), stable(n.markers || []), stable(n.style || {}),
        n.study ? stable(n.study) : null, n._mom ? stable(n._mom) : null, Object.keys(extra).length ? stable(extra) : null,
        st ? st.weight : null, st ? st.next : null, st ? st.last : null, st ? study.totalMinutes(st) : 0, st ? st.q.done : 0, st ? st.q.correct : 0);
      if (st) {
        for (const [d, m] of Object.entries(st.log)) insLog.run(mapId, n.id, d, m);
        for (const [d, q] of Object.entries(st.qlog)) insQ.run(mapId, n.id, d, q.done, q.correct);
        for (const r of st.qsrc || []) insS.run(mapId, n.id, r.d, r.banca || '', study.bancaKey(r.banca), r.year ?? null, r.done, r.correct);
        (st.errs || []).forEach((e, i) => insE.run(mapId, n.id, i, e.d, e.why, e.note, e.banca ?? null, e.year ?? null, e.redo ? e.redo.d : null, e.redo ? (e.redo.ok ? 1 : 0) : null));
      }
      n.children.forEach((c, i) => visit(c, n.id, i));
    };
    visit(map.root, null, 0);
    const insR = this.db.prepare('INSERT INTO relations(map_id,id,from_id,to_id,label,data) VALUES (?,?,?,?,?,?)');
    for (const r of map.meta.relations || []) insR.run(mapId, r.id, r.from, r.to, String(r.label ?? ''), stable(r));
  }

  /** Reconstrói o mapa exatamente como foi gravado. */
  loadMap(id, { includeTrashed = false } = {}) {
    const m = this.db.prepare('SELECT * FROM maps WHERE id = ?').get(id);
    if (!m || (m.deleted_at && !includeTrashed)) throw new Error('Mapa não encontrado na biblioteca.');
    const rows = this.db.prepare('SELECT * FROM topics WHERE map_id = ? ORDER BY parent_id, pos').all(id);
    const nodes = new Map();
    for (const r of rows) {
      const n = {
        id: r.id, title: r.title, notes: r.notes, collapsed: !!r.collapsed, style: JSON.parse(r.style), markers: JSON.parse(r.markers), progress: r.progress, children: [],
        ...(r.study_json ? { study: JSON.parse(r.study_json) } : {}), ...(r.raw ? { _mom: JSON.parse(r.raw) } : {}), ...(r.extra ? JSON.parse(r.extra) : {}),
      };
      nodes.set(r.id, n);
    }
    for (const r of rows) if (r.parent_id) { const p = nodes.get(r.parent_id); if (!p) throw new Error('Biblioteca inconsistente: tópico sem pai.'); p.children.push(nodes.get(r.id)); }
    const root = nodes.get(m.root_id);
    if (!root) throw new Error('Biblioteca inconsistente: mapa sem raiz.');
    const meta = JSON.parse(m.meta_json);
    meta.relations = this.db.prepare('SELECT data FROM relations WHERE map_id = ? ORDER BY rowid').all(id).map((r) => JSON.parse(r.data));
    meta.libId = id;
    return new MindMap(root, meta);
  }

  listMaps({ today = study.todayStr(), trashed = false } = {}) {
    return this.db.prepare(`SELECT m.id, m.title, m.theme, m.exam_name, m.exam_date, m.source_path, m.created_at, m.updated_at, m.deleted_at, m.rev,
        (SELECT COUNT(*) FROM topics t WHERE t.map_id = m.id) AS topics,
        (SELECT COUNT(*) FROM topics t WHERE t.map_id = m.id AND t.next_review IS NOT NULL AND t.next_review <= ?) AS due
      FROM maps m WHERE m.deleted_at IS ${trashed ? 'NOT ' : ''}NULL ORDER BY m.updated_at DESC, m.title`).all(today);
  }
  /** Lixeira: o mapa some da lista mas pode voltar (nada é apagado de verdade até esvaziar a lixeira). */
  trashMap(id) { return this.db.prepare('UPDATE maps SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL').run(this.now(), id).changes === 1; }
  restoreMap(id) { return this.db.prepare('UPDATE maps SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL').run(id).changes === 1; }
  /** Exclusão definitiva de UM mapa que já está na lixeira (cascata apaga tópicos, estudo, relações e versões). */
  purgeMap(id) { return this.db.prepare('DELETE FROM maps WHERE id = ? AND deleted_at IS NOT NULL').run(id).changes === 1; }
  /** Remove definitivamente os mapas que estão na lixeira há mais de `days` dias (0 = todos). */
  emptyTrash(days = 30, now = Date.parse(this.now())) {
    const limit = new Date(now - days * 86400000).toISOString();
    return this.db.prepare('DELETE FROM maps WHERE deleted_at IS NOT NULL AND deleted_at <= ?').run(limit).changes;
  }

  // ---------- versões (instantâneos) ----------
  snapshot(id, reason = 'manual') {
    return this.tx(() => {
      const data = writeMom(this.loadMap(id, { includeTrashed: true }));
      const r = this.db.prepare('INSERT INTO snapshots(map_id, created_at, reason, data) VALUES (?,?,?,?)').run(id, this.now(), reason, data);
      this.db.prepare('DELETE FROM snapshots WHERE map_id = ? AND id NOT IN (SELECT id FROM snapshots WHERE map_id = ? ORDER BY id DESC LIMIT ?)').run(id, id, SNAPSHOT_KEEP);
      return Number(r.lastInsertRowid);
    });
  }
  _autoSnapshot(id, reason) {
    const last = this.db.prepare('SELECT created_at FROM snapshots WHERE map_id = ? ORDER BY id DESC LIMIT 1').get(id);
    if (reason === 'auto' && last && Date.parse(this.now()) - Date.parse(last.created_at) < SNAPSHOT_MIN_MS) return null;
    return this.snapshot(id, reason);
  }
  listSnapshots(id) { return this.db.prepare('SELECT id, created_at, reason, length(data) AS bytes FROM snapshots WHERE map_id = ? ORDER BY id DESC').all(id); }
  /** Reabre uma versão antiga como mapa NOVO (o atual nunca é sobrescrito). */
  restoreSnapshot(snapId, { title } = {}) {
    const s = this.db.prepare('SELECT map_id, data, created_at FROM snapshots WHERE id = ?').get(snapId);
    if (!s) throw new Error('Versão não encontrada.');
    const map = readMom(Buffer.from(s.data));
    map.meta.name = title || `${map.meta.name || map.root.title} (versão de ${s.created_at.slice(0, 16).replace('T', ' ')})`;
    return this.saveMap(map, { id: newId(), snapshot: false });
  }

  // ---------- importação e exportação ----------
  /** Importa um .mom (Buffer ou caminho). Relê do banco e compara com o original; se divergir, desfaz. */
  importMom(input, { source = null, onDuplicate = 'skip' } = {}) {
    const buf = Buffer.isBuffer(input) ? input : fs.readFileSync(input);
    if (!source && typeof input === 'string') source = path.resolve(input);
    const hash = sha256(buf);
    const dup = this.db.prepare('SELECT id FROM maps WHERE source_hash = ? AND deleted_at IS NULL').get(hash);
    if (dup && onDuplicate === 'skip') return { id: dup.id, status: 'duplicado' };
    const map = readMom(buf);
    return this.tx(() => {
      const id = this.saveMap(map, { id: newId(), source, hash, snapshot: false });
      const back = this.loadMap(id);
      if (canonical(back) !== canonical(map)) throw new Error('A verificação após importar falhou: o mapa lido do banco difere do original. Nada foi gravado.');
      return { id, status: 'importado', topics: this.db.prepare('SELECT COUNT(*) c FROM topics WHERE map_id = ?').get(id).c };
    });
  }
  exportMom(id, target) { return writeMom(this.loadMap(id), target); }

  /** Migra todos os .mom de uma pasta (só leitura nos originais). Um arquivo ruim não impede os outros. */
  importFolder(dir, { recursive = true } = {}) {
    const files = [];
    const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (recursive) walk(p); } else if (/\.mom$/i.test(e.name)) files.push(p); } };
    walk(dir); files.sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const report = { files: files.length, imported: 0, duplicated: 0, failed: 0, items: [] };
    for (const f of files) {
      try {
        const r = this.importMom(f);
        if (r.status === 'importado') report.imported++; else report.duplicated++;
        report.items.push({ file: f, ...r });
      } catch (e) { report.failed++; report.items.push({ file: f, status: 'erro', error: e.message }); }
    }
    return report;
  }

  /** Pacote portátil (.mcpack): manifest.json + maps/<id>.mom, cada um com SHA-256. Leve para levar a outro computador. */
  exportPackage(target, { mapIds = null, settings = null } = {}) {
    const maps = this.listMaps().filter((m) => !mapIds || mapIds.includes(m.id));
    const zip = new AdmZip(); const items = [];
    for (const m of maps) {
      const data = writeMom(this.loadMap(m.id)); const file = `maps/${m.id}.mom`;
      zip.addFile(file, data); items.push({ id: m.id, title: m.title, file, sha256: sha256(data), topics: m.topics, updated_at: m.updated_at });
    }
    // preferências portáteis (opcionais; pacotes antigos não têm): validadas na ida e na volta
    let setItem = null;
    if (settings) { const data = Buffer.from(JSON.stringify(sanitizeSettings(settings), null, 2)); zip.addFile('settings.json', data); setItem = { file: 'settings.json', sha256: sha256(data) }; }
    zip.addFile('manifest.json', Buffer.from(JSON.stringify({ format: PACKAGE_FORMAT, version: 1, created_at: this.now(), app: 'MindCraft', maps: items, ...(setItem ? { settings: setItem } : {}) }, null, 2)));
    const buf = zip.toBuffer();
    if (target) { const tmp = `${target}.tmp-${process.pid}`; try { fs.writeFileSync(tmp, buf); fs.renameSync(tmp, target); } catch (e) { fs.rmSync(tmp, { force: true }); throw e; } }
    return { maps: items.length, bytes: buf.length, buffer: buf };
  }

  /**
   * Importa um .mcpack. Conflitos (mesmo id): igual → ignora; diferente → `onConflict`: 'copy' (padrão, importa como cópia),
   * 'replace' (guarda uma versão do atual antes) ou 'skip'. Valida manifest, nomes, tamanhos e SHA-256 antes de gravar qualquer coisa.
   */
  importPackage(input, { onConflict = 'copy' } = {}) {
    const zip = new AdmZip(input);
    const me = zip.getEntry('manifest.json');
    if (!me || me.header.size > MAX_ENTRY_BYTES) throw new Error('Pacote inválido: falta o manifest.json.');
    let man; try { man = JSON.parse(me.getData().toString('utf8')); } catch { throw new Error('Pacote inválido: manifest.json ilegível.'); }
    if (!man || man.format !== PACKAGE_FORMAT) throw new Error('Este arquivo não é um pacote do MindCraft.');
    if (!Number.isInteger(man.version) || man.version > 1) throw new Error('Pacote criado por uma versão mais nova do MindCraft. Atualize o aplicativo.');
    if (!Array.isArray(man.maps) || man.maps.length > MAX_PACKAGE_MAPS) throw new Error('Pacote inválido: lista de mapas.');
    const prepared = [];
    for (const it of man.maps) {                                  // 1) valida tudo antes de gravar qualquer coisa
      if (!it || typeof it.file !== 'string' || !SAFE_FILE.test(it.file) || typeof it.id !== 'string') throw new Error('Pacote inválido: item de mapa suspeito.');
      const e = zip.getEntry(it.file);
      if (!e || e.header.size > MAX_ENTRY_BYTES) throw new Error(`Pacote inválido: falta "${it.file}".`);
      const data = e.getData();
      if (sha256(data) !== it.sha256) throw new Error(`Pacote corrompido: a verificação (SHA-256) de "${it.title || it.file}" falhou.`);
      prepared.push({ it, data, map: readMom(data) });
    }
    let settings = null;                                          // preferências do pacote (se houver): validadas aqui; quem chama decide aplicar
    if (man.settings) {
      const se = man.settings.file === 'settings.json' ? zip.getEntry('settings.json') : null;
      if (!se || se.header.size > 65536) throw new Error('Pacote inválido: configurações ilegíveis.');
      const data = se.getData(); if (sha256(data) !== man.settings.sha256) throw new Error('Pacote corrompido: a verificação (SHA-256) das configurações falhou.');
      try { settings = sanitizeSettings(JSON.parse(data.toString('utf8'))); } catch { throw new Error('Pacote inválido: configurações ilegíveis.'); }
    }
    const report = { maps: prepared.length, imported: 0, skipped: 0, replaced: 0, copied: 0, items: [], settings };
    this.tx(() => {                                               // 2) grava tudo ou nada
      for (const { it, data, map } of prepared) {
        const hash = sha256(data), cur = this.db.prepare('SELECT id, source_hash, deleted_at FROM maps WHERE id = ?').get(it.id);
        let id = it.id, status = 'importado';
        if (cur) {
          const curBuf = writeMom(this.loadMap(it.id, { includeTrashed: true }));
          if (canonical(readMom(curBuf)) === canonical(map)) {
            if (cur.deleted_at) { this.restoreMap(it.id); report.items.push({ id: it.id, title: it.title, status: 'restaurado da lixeira' }); report.imported++; } else { report.skipped++; report.items.push({ id: it.id, title: it.title, status: 'igual' }); }
            continue;
          }
          if (onConflict === 'skip') { report.skipped++; report.items.push({ id: it.id, title: it.title, status: 'ignorado (já existe)' }); continue; }
          if (onConflict === 'replace') { this.snapshot(it.id, 'antes de importar pacote'); status = 'substituído'; report.replaced++; }
          else { id = newId(); map.meta.name = `${map.meta.name || map.root.title} (importado)`; status = 'copiado'; report.copied++; }
        } else report.imported++;
        this.saveMap(map, { id, hash, snapshot: false });
        const back = this.loadMap(id);
        if (canonical(back) !== canonical(map)) throw new Error(`A verificação após importar "${it.title}" falhou. Nada foi gravado.`);
        report.items.push({ id, title: it.title, status });
      }
    });
    return report;
  }

  // ---------- consultas (o ganho de ter um banco) ----------
  /** Revisões vencidas em TODOS os mapas, mais atrasadas primeiro. */
  dueTopics(today = study.todayStr(), limit = 500) {
    return this.db.prepare(`SELECT t.map_id AS mapId, m.title AS mapTitle, t.id AS topicId, t.title, t.next_review AS next
      FROM topics t JOIN maps m ON m.id = t.map_id WHERE m.deleted_at IS NULL AND t.next_review IS NOT NULL AND t.next_review <= ?
      ORDER BY t.next_review, m.title, t.title LIMIT ?`).all(today, limit);
  }
  /** Busca em títulos e notas de todos os mapas. */
  searchTopics(q, limit = 50) {
    const like = `%${String(q).replace(/[\\%_]/g, (c) => '\\' + c)}%`;
    return this.db.prepare(`SELECT t.map_id AS mapId, m.title AS mapTitle, t.id AS topicId, t.title, substr(t.notes, 1, 120) AS notes
      FROM topics t JOIN maps m ON m.id = t.map_id WHERE m.deleted_at IS NULL AND (t.title LIKE ? ESCAPE '\\' OR t.notes LIKE ? ESCAPE '\\')
      ORDER BY m.title, t.title LIMIT ?`).all(like, like, limit);
  }
  /** Acerto por banca e por ano em TODOS os mapas (só o que foi registrado com banca/ano). */
  questionsBySource() {
    const live = 'm.deleted_at IS NULL';
    const banca = this.db.prepare(`SELECT MIN(q.banca) AS name, q.bkey AS key, SUM(q.done) AS done, SUM(q.correct) AS correct FROM qsrc q JOIN maps m ON m.id = q.map_id WHERE ${live} GROUP BY q.bkey ORDER BY done DESC, name`).all()
      .map((r) => ({ name: r.name || 'Sem banca', key: r.key, done: r.done, correct: r.correct, accuracy: r.correct / r.done }));
    const year = this.db.prepare(`SELECT q.year AS year, SUM(q.done) AS done, SUM(q.correct) AS correct FROM qsrc q JOIN maps m ON m.id = q.map_id WHERE ${live} GROUP BY q.year ORDER BY q.year DESC`).all()
      .map((r) => ({ year: r.year, name: r.year ? String(r.year) : 'Sem ano', done: r.done, correct: r.correct, accuracy: r.correct / r.done }));
    return { banca, year };
  }
  /** Erros do caderno AINDA NÃO refeitos, em todos os mapas (mais antigos primeiro: é o que está esquecido). */
  openErrors(limit = 200) {
    return this.db.prepare(`SELECT e.map_id AS mapId, m.title AS mapTitle, e.topic_id AS topicId, t.title, e.idx, e.day AS d, e.why, e.note, e.banca, e.year
      FROM qerr e JOIN maps m ON m.id = e.map_id JOIN topics t ON t.map_id = e.map_id AND t.id = e.topic_id
      WHERE m.deleted_at IS NULL AND e.redo_day IS NULL ORDER BY e.day, m.title, t.title LIMIT ?`).all(limit);
  }
  minutesByDay(from, to) { return this.db.prepare('SELECT s.day, SUM(s.minutes) AS minutes FROM study_log s JOIN maps m ON m.id = s.map_id WHERE m.deleted_at IS NULL AND s.day BETWEEN ? AND ? GROUP BY s.day ORDER BY s.day').all(from, to); }
  questionsByDay(from, to) { return this.db.prepare('SELECT q.day, SUM(q.done) AS done, SUM(q.correct) AS correct FROM qlog q JOIN maps m ON m.id = q.map_id WHERE m.deleted_at IS NULL AND q.day BETWEEN ? AND ? GROUP BY q.day ORDER BY q.day').all(from, to); }
}

function openLibrary(file, opts) { return new Library(file, opts); }

module.exports = { openLibrary, Library, canonical, sha256, PACKAGE_FORMAT };
