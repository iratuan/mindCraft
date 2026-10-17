'use strict';
// Google Drive (provedor) e login do Google (fluxo de dispositivo) contra um servidor FALSO do Google, com rede de verdade (http local).
const test = require('node:test');
const assert = require('node:assert');
const { openLibrary } = require('../core/library');
const { syncLibrary, hashOf } = require('../core/sync');
const { DriveRemote } = require('../core/sync-drive');
const { startDeviceLogin, pollDeviceLogin, tokenSource, refreshAccessToken } = require('../core/oauth-device');
const { nodeHttp } = require('../core/net-node');
const { startMockGoogle } = require('./mock-google');
const { concurso } = require('./fixtures');

const clock = (start) => { let t = Date.parse(start); const f = () => new Date(t).toISOString(); f.add = (ms) => { t += ms; }; return f; };
const device = (start = '2026-10-20T10:00:00.000Z') => { const now = clock(start); return { lib: openLibrary(':memory:', { now }), now, state: {} }; };
const addMap = (d, title) => { const { m } = concurso(); m.root.title = title; m.meta.name = title; return d.lib.saveMap(m, { snapshot: false }); };
const edit = (d, id, fn) => { d.now.add(60000); const m = d.lib.loadMap(id); fn(m); d.lib.saveMap(m, { snapshot: false }); };
const noSleep = async () => {};
async function setup(over = {}) {
  const g = await startMockGoogle(); g.S.deviceApproved = true;
  const auth = { refreshToken: 'rt-1' }; const hist = [];
  const getToken = tokenSource({ http: nodeHttp, clientId: g.S.clientId, clientSecret: g.S.clientSecret, auth, urls: g.urls, onChange: (a) => hist.push(a.accessToken) });
  const remote = (extra = {}) => new DriveRemote({ http: nodeHttp, getToken, api: g.urls.api, upload: g.urls.upload, sleep: noSleep, ...extra });
  return { g, auth, hist, remote, getToken, done: () => g.close(), ...over };
}

test('login por código: pede o código, espera (pendente/devagar) e recebe o acesso; erros claros', async () => {
  const g = await startMockGoogle(); const waits = [];
  try {
    const d = await startDeviceLogin({ http: nodeHttp, clientId: g.S.clientId, urls: g.urls }); assert.strictEqual(d.userCode, 'ABCD-EFGH'); assert.match(d.url, /google\.com\/device/);
    await assert.rejects(() => startDeviceLogin({ http: nodeHttp, clientId: 'errado', urls: g.urls }), /invalid_client|recusou/);
    await assert.rejects(() => startDeviceLogin({ http: nodeHttp, clientId: '', urls: g.urls }), /Informe/);
    let polls = 0; g.S.slowDown = 1;
    const sleep = async (ms) => { waits.push(ms); if (++polls === 4) g.S.deviceApproved = true; };
    const t = await pollDeviceLogin({ http: nodeHttp, clientId: g.S.clientId, clientSecret: g.S.clientSecret, deviceCode: d.deviceCode, interval: 1, sleep, urls: g.urls });
    assert.ok(t.accessToken && t.refreshToken === 'rt-1' && t.expiresAt > Date.now()); assert.ok(waits.some((w) => w > 1000), 'respeitou "slow_down"');
    g.S.deviceApproved = false; let n = 0;
    await assert.rejects(() => pollDeviceLogin({ http: nodeHttp, clientId: g.S.clientId, clientSecret: g.S.clientSecret, deviceCode: 'x', sleep: async () => { if (++n > 2) throw new Error('não deveria esperar tanto'); }, shouldStop: () => n >= 2, urls: g.urls }), /cancelado/);
    let t0 = 0; await assert.rejects(() => pollDeviceLogin({ http: nodeHttp, clientId: g.S.clientId, clientSecret: g.S.clientSecret, deviceCode: 'x', expiresIn: 5, sleep: noSleep, now: () => (t0 += 3000), urls: g.urls }), /expirou/);
  } finally { await g.close(); }
});

test('renovar acesso: token vencido é renovado sozinho; acesso revogado pede para entrar de novo (sem vazar o token)', async () => {
  const s = await setup();
  try {
    const t1 = await s.getToken(); s.g.S.expireAll(); const t2 = await s.getToken(true); assert.notStrictEqual(t1, t2);
    s.g.S.refreshOk = false; await assert.rejects(() => refreshAccessToken({ http: nodeHttp, clientId: s.g.S.clientId, clientSecret: s.g.S.clientSecret, refreshToken: 'rt-1', urls: s.g.urls }), (e) => e.reauth && /Entre de novo/.test(e.message) && !/rt-1|at-/.test(e.message));
    await assert.rejects(() => tokenSource({ http: nodeHttp, clientId: 'x', auth: {} })(), /Entre na conta/);
  } finally { await s.done(); }
});

test('Drive: dois aparelhos sincronizam por HTTP real (envio, recepção, conflito com as duas versões); pasta criada uma vez; mais de uma página de arquivos', async () => {
  const s = await setup(); s.g.S.pageMax = 2;
  try {
    const A = device(), B = device('2026-10-21T08:00:00.000Z'); const ids = ['Direito', 'Português', 'Informática', 'RLM', 'Contabilidade'].map((t) => addMap(A, t));
    const ra = await syncLibrary(A.lib, s.remote(), A.state); assert.deepStrictEqual([ra.pushed, ra.errors.length], [5, 0]);
    assert.strictEqual([...s.g.S.files.values()].filter((f) => f.mimeType.includes('folder')).length, 1, 'uma só pasta');
    const rb = await syncLibrary(B.lib, s.remote(), B.state); assert.deepStrictEqual([rb.pulled, rb.errors.length], [5, 0], 'paginação: veio tudo');
    for (const id of ids) assert.strictEqual(hashOf(A.lib.loadMap(id)), hashOf(B.lib.loadMap(id)), 'binário íntegro (base64) nos dois sentidos');
    edit(A, ids[0], (m) => m.update(m.root.id, { title: 'PC' })); edit(B, ids[0], (m) => m.update(m.root.id, { title: 'Tablet' }));
    await syncLibrary(A.lib, s.remote(), A.state); const rc = await syncLibrary(B.lib, s.remote(), B.state); assert.strictEqual(rc.conflicts, 1);
    assert.strictEqual(B.lib.loadMap(ids[0]).root.title, 'Tablet'); assert.ok(B.lib.listMaps().some((m) => /da sincronização/.test(m.title)));
    const up = s.g.S.uploads; await syncLibrary(A.lib, s.remote(), A.state); await syncLibrary(B.lib, s.remote(), B.state); await syncLibrary(A.lib, s.remote(), A.state);
    assert.ok(s.g.S.uploads <= up + 2, 'estabiliza (só sobe a cópia do conflito, uma vez)');
    assert.strictEqual(A.lib.listMaps().length, B.lib.listMaps().length);
  } finally { await s.done(); }
});

test('token vencido no meio: renova sozinho e continua; token inválido de verdade → "entre de novo", local intacto', async () => {
  const s = await setup();
  try {
    const A = device(); addMap(A, 'M1'); const remote = s.remote(); await remote.check(); s.g.S.expireAll();
    const r = await syncLibrary(A.lib, remote, A.state); assert.deepStrictEqual([r.pushed, r.errors.length], [1, 0]); assert.ok(s.hist.length >= 2, 'renovou o acesso');
    s.g.S.refreshOk = false; s.g.S.expireAll(); addMap(A, 'M2'); const before = A.lib.listMaps().length;
    await assert.rejects(() => syncLibrary(A.lib, s.remote(), A.state), /Entre de novo|expirou/); assert.strictEqual(A.lib.listMaps().length, before);
  } finally { await s.done(); }
});

test('falhas passageiras (429, 500) são repetidas; falha persistente vira erro claro e nada local muda', async () => {
  const s = await setup(); const sleeps = [];
  try {
    const A = device(); addMap(A, 'M1');
    s.g.S.failNext.push({ status: 429 }, { status: 500 }, { status: 503 });
    const r = await syncLibrary(A.lib, s.remote({ sleep: async (ms) => { sleeps.push(ms); } }), A.state); assert.strictEqual(r.pushed, 1); assert.ok(sleeps.length >= 3 && sleeps[1] > sleeps[0], 'espera crescente: ' + sleeps);
    const B = device('2026-10-21T08:00:00.000Z'); for (let i = 0; i < 20; i++) s.g.S.failNext.push({ status: 500, when: /\/files$/ });
    await assert.rejects(() => syncLibrary(B.lib, s.remote({ maxTries: 3 }), B.state), /ocupado|erro 500/); assert.strictEqual(B.lib.listMaps().length, 0); s.g.S.failNext.length = 0;
    const ok = await syncLibrary(B.lib, s.remote(), B.state); assert.strictEqual(ok.pulled, 1, 'depois que volta, termina');
  } finally { await s.done(); }
});

test('sem espaço no Drive: mensagem clara; o mapa local continua e é enviado quando houver espaço', async () => {
  const s = await setup();
  try {
    const A = device(); addMap(A, 'M1'); s.g.S.quota = true;
    const r = await syncLibrary(A.lib, s.remote(), A.state); assert.strictEqual(r.pushed, 0); assert.match(r.errors[0], /sem espaço/); assert.strictEqual(A.lib.listMaps().length, 1);
    s.g.S.quota = false; assert.strictEqual((await syncLibrary(A.lib, s.remote(), A.state)).pushed, 1);
  } finally { await s.done(); }
});

test('reenviar o mesmo arquivo (queda de rede no meio) não duplica; pasta apagada no Drive é recriada sem apagar nada; duas pastas → a mais antiga', async () => {
  const s = await setup();
  try {
    const A = device(); addMap(A, 'M1'); const r1 = s.remote(); await syncLibrary(A.lib, r1, A.state);
    const name = [...r1.ids.keys()][0]; const again = s.remote(); await again.list(); const cnt = s.g.S.files.size; await again.write(name, Buffer.from('qualquer')); assert.strictEqual(s.g.S.files.size, cnt, 'já existia: não cria outro');
    const fresh = s.remote(); await fresh.check(); fresh.ids.clear(); await fresh.write(name, Buffer.from('qualquer')); assert.strictEqual(s.g.S.files.size, cnt, 'mesmo sem cache local, confere antes de criar');
    const folder = r1.folderId; s.g.S.files.get(folder).trashed = true;                       // o usuário jogou a pasta na lixeira do Drive
    const r2 = await syncLibrary(A.lib, s.remote({ folderId: folder }), A.state); assert.strictEqual(r2.pushed, 1, 'repopulou a pasta nova'); assert.ok(s.g.S.files.get(folder), 'a antiga continua na lixeira, intacta');
    const folders = [...s.g.S.files.values()].filter((f) => f.mimeType.includes('folder') && !f.trashed); assert.strictEqual(folders.length, 1);
    const extra = { id: 'zzz-folder', name: 'MindCraft', mimeType: folders[0].mimeType, parents: [], created: Date.now() + 99999 }; s.g.S.files.set(extra.id, extra);
    const r3 = s.remote(); assert.strictEqual(await r3.ensureFolder(), folders[0].id, 'escolhe a mais antiga');
  } finally { await s.done(); }
});

test('arquivos estranhos na pasta do Drive são ignorados; adulterado é recusado; só HTTPS fora de 127.0.0.1', async () => {
  const s = await setup();
  try {
    const A = device(), B = device('2026-10-21T08:00:00.000Z'); const id = addMap(A, 'M1'); const r = s.remote(); await syncLibrary(A.lib, r, A.state);
    const f = r.folderId; s.g.S.files.set('x1', { id: 'x1', name: 'anotacoes.txt', mimeType: 'text/plain', parents: [f], content: Buffer.from('oi'), created: Date.now() });
    s.g.S.files.set('x2', { id: 'x2', name: '../../x.1.2.mom', mimeType: 'text/plain', parents: [f], content: Buffer.from('oi'), created: Date.now() });
    assert.deepStrictEqual((await s.remote().list()).length, 1);
    const real = [...s.g.S.files.values()].find((x) => x.name.startsWith(id)); real.content = Buffer.from('adulterado');
    const rb = await syncLibrary(B.lib, s.remote(), B.state); assert.strictEqual(rb.errors.length, 1); assert.strictEqual(B.lib.listMaps().length, 0);
    await assert.rejects(() => nodeHttp({ url: 'http://example.com/x' }), /HTTPS/);
  } finally { await s.done(); }
});
