'use strict';
// Sincronização OPCIONAL da biblioteca com um destino remoto (pasta compartilhada, Google Drive…).
// Regras de ouro (nada aqui roda se o usuário não ligar a sincronização):
//  - NUNCA apaga nada: nem no remoto, nem no local. Mapa excluído num lado não some do outro.
//  - Conflito (mexeu nos dois lados desde a última sincronização) = MANTÉM AS DUAS VERSÕES: o local fica e a do remoto entra como cópia.
//  - Antes de trocar um mapa local pela versão do remoto, guarda um instantâneo (versão) do atual.
//  - Tudo que vem do remoto é validado (nome, tamanho, leitura do .mom, hash no nome) e relido do banco antes de valer.
//  - O motor não conhece rede nem disco: fala com um "provedor" (list/read/write). Quem chama guarda o `state` (um JSON simples).
// Layout remoto: maps/<id>.<carimbo13>.<hash16>.mom
//  - hash16 = SHA-256 do conteúdo canônico: um list() já diz o que mudou e gravar uma versão nunca sobrescreve outra;
//  - carimbo = milissegundos, sempre MAIOR que o de qualquer versão já existente (imune a relógio atrasado): a maior é a "atual".
const crypto = require('crypto');
const { canonical } = require('./library');
const { readMom, writeMom } = require('./mom');
const { newId } = require('./model');

const NAME = /^maps\/([A-Za-z0-9_-]{1,64})\.(\d{13})\.([0-9a-f]{16})\.mom$/;
const MAX_BYTES = 64 * 1024 * 1024;
// A ida e volta pelo .mom acrescenta campos internos na 1ª vez (e é estável depois): o hash é da forma já normalizada,
// para que "o mapa daqui" e "o arquivo que o outro aparelho leu" tenham o mesmo hash.
const hashOf = (map) => crypto.createHash('sha256').update(canonical(readMom(writeMom(map)))).digest('hex').slice(0, 16);
const remoteName = (id, ts, h) => `maps/${id}.${String(ts).padStart(13, '0')}.${h}.mom`;

/** Agrupa a listagem remota por mapa, versões em ordem crescente de carimbo: Map(id → [{ name, ts, hash }]). */
function parseListing(names) {
  const by = new Map();
  for (const n of names) {
    const m = NAME.exec(n); if (!m) continue;
    if (!by.has(m[1])) by.set(m[1], []);
    by.get(m[1]).push({ name: n, ts: Number(m[2]), hash: m[3] });
  }
  for (const v of by.values()) v.sort((a, b) => a.ts - b.ts || (a.hash < b.hash ? -1 : 1));
  return by;
}

/**
 * @param lib     Library (core/library.js)
 * @param remote  provedor: { list(): Promise<string[]>, read(name): Promise<Buffer>, write(name, Buffer): Promise<void> }
 * @param state   { maps: { [id]: { base, seen[] } } } — base = última versão em que local e remoto coincidiam; seen = versões remotas já tratadas.
 * @param opts.busy  ids que NÃO devem ser tocados agora (ex.: o mapa aberto com alterações não salvas)
 * @returns relatório { pushed, pulled, conflicts, same, errors[], items[] }
 */
async function syncLibrary(lib, remote, state, { onProgress = () => {}, shouldStop = () => false, busy = new Set() } = {}) {
  if (!state.maps) state.maps = {};
  state.cache = state.cache || {};
  const rep = { pushed: 0, pulled: 0, conflicts: 0, same: 0, errors: [], items: [] };
  const item = (id, title, status) => rep.items.push({ id, title, status });
  const listing = parseListing(await remote.list());
  const local = lib.listMaps({ today: '9999-12-31' });
  const trashed = new Set(lib.listMaps({ trashed: true }).map((m) => m.id));
  const seenLocal = new Set();

  // hash local em cache por (rev, updated_at): não relê todos os mapas a cada sincronização
  const localHash = (mp) => {
    const key = `${mp.rev}|${mp.updated_at}`; const c = state.cache[mp.id];
    if (c && c.key === key) return c.hash;
    const h = hashOf(lib.loadMap(mp.id)); state.cache[mp.id] = { key, hash: h }; return h;
  };
  const known = (id) => { const s = state.maps[id]; return new Set(s ? [s.base, ...(s.seen || [])] : []); };
  const record = (id, base, rem) => { state.maps[id] = { base, seen: [...new Set([...(rem || []).map((r) => r.hash), base])].slice(-50) }; };

  for (const mp of local) {
    if (shouldStop()) break;
    seenLocal.add(mp.id);
    if (busy.has(mp.id)) { item(mp.id, mp.title, 'adiado: está aberto com alterações não salvas'); continue; }   // não troca por baixo de quem está editando
    try {
      onProgress(`Verificando "${mp.title}"…`);
      const lh = localHash(mp), st = state.maps[mp.id], rem = listing.get(mp.id) || [];
      const latest = rem[rem.length - 1], k = known(mp.id);
      const remoteChanged = !!latest && latest.hash !== lh && !k.has(latest.hash);   // a versão atual do remoto é desconhecida e diferente da minha
      const localChanged = !st || lh !== st.base;
      if (!remoteChanged) {
        if (rem.some((r) => r.hash === lh)) { record(mp.id, lh, rem); rep.same++; item(mp.id, mp.title, 'igual'); continue; }
        await push(lib, remote, mp.id, lh, rem);                                    // só o local mudou (ou nunca foi enviado)
        record(mp.id, lh, rem); rep.pushed++; item(mp.id, mp.title, 'enviado'); continue;
      }
      if (!localChanged) {                                                           // só o remoto mudou → traz (guardando versão do atual)
        await pull(lib, remote, mp.id, latest, { replace: true });
        const nh = hashOf(lib.loadMap(mp.id)); delete state.cache[mp.id];
        record(mp.id, nh, rem); rep.pulled++; item(mp.id, mp.title, 'atualizado a partir do remoto'); continue;
      }
      // os dois mudaram: mantém as duas versões. O local segue como o mapa; a do remoto entra como cópia; o local é enviado.
      await pull(lib, remote, mp.id, latest, { replace: false });
      if (!rem.some((r) => r.hash === lh)) await push(lib, remote, mp.id, lh, rem);
      record(mp.id, lh, rem); rep.conflicts++; item(mp.id, mp.title, 'conflito: as duas versões foram mantidas (a do outro aparelho entrou como cópia)');
    } catch (e) { rep.errors.push(`${mp.title}: ${e.message}`); item(mp.id, mp.title, 'erro'); }
  }

  // mapas que só existem no remoto → traz como novos (mesmo id). Os da lixeira daqui não ressuscitam sozinhos.
  for (const [id, versions] of listing) {
    if (seenLocal.has(id) || trashed.has(id) || busy.has(id) || shouldStop()) continue;
    try {
      onProgress('Trazendo um mapa novo…');
      const latest = versions[versions.length - 1];
      const title = await pull(lib, remote, id, latest, { replace: true, create: true });
      record(id, latest.hash, versions); rep.pulled++; item(id, title, 'novo (vindo do remoto)');
    } catch (e) { rep.errors.push(`${id}: ${e.message}`); }
  }
  return rep;
}

async function push(lib, remote, id, hash, rem) {
  const map = lib.loadMap(id);
  if (hashOf(map) !== hash) throw new Error('o mapa mudou durante a sincronização; tente de novo');
  const ts = Math.max(Date.now(), (rem.length ? rem[rem.length - 1].ts : 0) + 1);
  await remote.write(remoteName(id, ts, hash), writeMom(map));
}

/** Baixa e valida uma versão remota. replace: troca o mapa local (guardando versão antes); senão entra como cópia nova. */
async function pull(lib, remote, id, ver, { replace, create = false }) {
  const buf = await remote.read(ver.name);
  if (!Buffer.isBuffer(buf) && !(buf instanceof Uint8Array)) throw new Error('resposta inválida do remoto');
  if (buf.length > MAX_BYTES) throw new Error('arquivo remoto grande demais');
  const map = readMom(Buffer.from(buf));
  if (hashOf(map) !== ver.hash) throw new Error('o arquivo remoto não confere com o nome (corrompido ou alterado)');
  const title = map.meta.name || map.root.title;
  return lib.tx(() => {
    if (!replace) {
      map.meta.name = `${title} (da sincronização ${lib.now().slice(0, 16).replace('T', ' ')})`;
      const nid = lib.saveMap(map, { id: newId(), snapshot: false });
      if (canonical(lib.loadMap(nid)) !== canonical(map)) throw new Error('a verificação da cópia falhou; nada foi gravado');
      return title;
    }
    if (!create) lib.snapshot(id, 'antes de sincronizar');
    lib.saveMap(map, { id, snapshot: false });
    if (canonical(lib.loadMap(id)) !== canonical(map)) throw new Error('a verificação após trazer falhou; nada foi gravado');
    return title;
  });
}

module.exports = { syncLibrary, parseListing, hashOf, NAME };
