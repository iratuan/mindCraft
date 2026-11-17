'use strict';
/* Serviço de IA do processo principal: guarda a chave de cada provedor criptografada pelo sistema (safeStorage) e faz a chamada HTTPS.
   A chave nunca vai para a tela, para o log nem para o config.json. O texto enviado é só o trecho selecionado. */
const path = require('path');
const fs = require('fs');
const https = require('https');
const { safeStorage } = require('electron');
const ai = require('../core/services/ai');

const TIMEOUT_MS = 60000;
const providerOf = (p) => (ai.PROVIDERS[p] ? p : ai.DEFAULT_PROVIDER);
const keyPath = (userData, provider) => path.join(userData, 'ai', 'chave-' + providerOf(provider) + '.bin');

/** Grava a chave cifrada (arquivo temporário + renomear). Recusa chave com formato errado ou se o sistema não puder cifrar. */
function saveKey(userData, provider, key) {
  const p = providerOf(provider), k = String(key || '').trim();
  if (!ai.validKey(p, k)) throw new Error(`Essa não parece uma chave do ${ai.PROVIDERS[p].label} (começa com "${ai.PROVIDERS[p].keyHint}").`);
  if (!safeStorage.isEncryptionAvailable()) throw new Error('O sistema não consegue proteger a chave neste computador. Ela não foi guardada.');
  const file = keyPath(userData, p), tmp = file + '.tmp';
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(tmp, safeStorage.encryptString(k));
  fs.renameSync(tmp, file);
  return true;
}
function readKey(userData, provider) {
  try { return safeStorage.decryptString(fs.readFileSync(keyPath(userData, provider))); } catch { return null; }
}
function clearKey(userData, provider) { try { fs.rmSync(keyPath(userData, provider), { force: true }); } catch { /* sem chave, sem problema */ } return true; }
function keyStatus(userData, provider) {
  const p = providerOf(provider);
  return { provider: p, saved: fs.existsSync(keyPath(userData, p)), available: safeStorage.isEncryptionAvailable() };
}

/** Mensagem clara para cada situação. Para códigos sem explicação própria, mostra o motivo que a API devolveu (sem a chave). */
function httpError(status, body) {
  let apiMsg = '';
  try { const j = JSON.parse(body); apiMsg = (j.error && (j.error.message || j.error)) || j.message || ''; } catch { /* corpo não é JSON */ }
  apiMsg = ai.cleanText(typeof apiMsg === 'string' ? apiMsg : '', 240);
  if (status === 401 || status === 403) return 'A chave foi recusada pelo provedor. Confira se copiou a chave inteira e se ela está ativa. ' + (apiMsg ? '(' + apiMsg + ')' : '');
  if (status === 429) return 'Limite de uso do provedor atingido. Tente de novo em alguns minutos.' + (apiMsg ? ' (' + apiMsg + ')' : '');
  if (status >= 500) return 'O serviço do provedor está instável agora. Tente de novo em instantes.';
  return 'O provedor não atendeu o pedido (código ' + status + ')' + (apiMsg ? ': ' + apiMsg : '.');
}

// Sem modelo escolhido, o app usa o primeiro modelo de conversa que a própria conta lista (o nome fixo pode ter saído da conta).
const modelCache = new Map();   // provedor -> { id, at }
const MODEL_TTL_MS = 10 * 60 * 1000;
async function resolveModel(userData, provider, model) {
  if (ai.validModel(model)) return model;
  const c = modelCache.get(provider);
  if (c && Date.now() - c.at < MODEL_TTL_MS) return c.id;
  const { ids } = await models(userData, provider);
  modelCache.set(provider, { id: ids[0], at: Date.now() });
  return ids[0];
}

/** Chamada HTTPS. Devolve o JSON da resposta ou lança erro com mensagem para o usuário. */
function post(req) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(req.body);
    const u = new URL(req.url);
    const r = https.request({ hostname: u.hostname, path: u.pathname + u.search, method: 'POST', headers: { ...req.headers, 'content-length': Buffer.byteLength(data) }, timeout: TIMEOUT_MS }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { if (body.length < 2000000) body += c; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode > 299) return reject(new Error(httpError(res.statusCode, body)));
        try { resolve(JSON.parse(body)); } catch { reject(new Error('Resposta inesperada do provedor.')); }
      });
    });
    r.on('timeout', () => { r.destroy(new Error('O assistente demorou demais para responder. Tente de novo.')); });
    r.on('error', (e) => reject(new Error(e && e.message && /ENOTFOUND|ECONNREFUSED|EAI_AGAIN/.test(e.message) ? 'Sem conexão com a internet para falar com o assistente.' : (e.message || 'Falha de rede.'))));
    r.end(data);
  });
}

/** Pergunta ou pede tópicos sobre o trecho selecionado. Devolve { text } ou { topics }, ou lança erro para o usuário. */
async function ask(userData, { provider, model, mode, question, selection, topic }) {
  const p = providerOf(provider);
  const apiKey = readKey(userData, p);
  if (!apiKey) throw new Error(`Informe a sua chave do ${ai.PROVIDERS[p].label} na aba Assistente antes de perguntar.`);
  const req = ai.buildRequest({ provider: p, model: await resolveModel(userData, p, model), mode, question, selection, topic, apiKey });
  const text = ai.parseResponse(await post(req), p);
  if (mode === 'notes') {
    const n = ai.parseNote(text);
    if (!n.ok) throw new Error(n.error);
    return { text: n.text };
  }
  if (mode === 'paragraphs') {
    const r = ai.parseParagraphs(text);
    if (!r.ok) throw new Error(r.error);
    return { paragraphs: r.paragraphs };
  }
  if (mode === 'outline') {
    const r = ai.parseOutline(text);
    if (!r.ok) throw new Error(r.error);
    return { topics: r.topics };
  }
  return { text };
}

/** Lista os modelos disponíveis para esta chave (a própria conta diz quais estão ativos). */
function getJson(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const r = https.request({ hostname: u.hostname, path: u.pathname + u.search, method: 'GET', headers, timeout: TIMEOUT_MS }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { if (body.length < 2000000) body += c; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode > 299) return reject(new Error(httpError(res.statusCode, body)));
        try { resolve(JSON.parse(body)); } catch { reject(new Error('Resposta inesperada do provedor.')); }
      });
    });
    r.on('timeout', () => r.destroy(new Error('O provedor demorou demais para responder.')));
    r.on('error', () => reject(new Error('Sem conexão com a internet para falar com o assistente.')));
    r.end();
  });
}
async function models(userData, provider) {
  const p = providerOf(provider);
  const apiKey = readKey(userData, p);
  if (!apiKey) throw new Error(`Guarde a chave do ${ai.PROVIDERS[p].label} antes de listar os modelos.`);
  const json = p === 'claude'
    ? await getJson('https://api.anthropic.com/v1/models', { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' })
    : await getJson('https://api.groq.com/openai/v1/models', { authorization: 'Bearer ' + apiKey });
  const ids = ai.pickModels((json.data || []).map((m) => m.id));
  if (!ids.length) throw new Error('A conta não tem modelos de conversa disponíveis.');
  return { ids };
}

/** Teste de conexão: uma pergunta mínima, para confirmar a chave sem gastar tokens. */
async function test(userData, provider, model) {
  const p = providerOf(provider);
  const apiKey = readKey(userData, p);
  if (!apiKey) throw new Error(`Guarde a chave do ${ai.PROVIDERS[p].label} antes de testar.`);
  const req = ai.buildRequest({ provider: p, model: await resolveModel(userData, p, model), mode: 'answer', question: 'Responda apenas: ok', selection: 'Teste de conexão.', apiKey });
  req.body.max_tokens = 256;   // margem para modelos que raciocinam antes de responder (o teste continua barato)
  ai.parseResponse(await post(req), p);
  return true;
}

module.exports = { saveKey, clearKey, keyStatus, ask, test, models, httpError };
