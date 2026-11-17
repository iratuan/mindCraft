'use strict';
/**
 * Assistente de IA no tablet: mesma lógica de electron/ai-service.js, com fetch (o Capacitor faz a chamada pelo HTTP nativo,
 * então não há bloqueio de CORS). A chave fica no armazenamento seguro do aparelho (Keystore do Android), nunca no mapa.
 */
const { SecureStorage } = require('@aparajita/capacitor-secure-storage');
const ai = require('../../core/services/ai');

const TIMEOUT_MS = 60000;
const providerOf = (p) => (ai.PROVIDERS[p] ? p : ai.DEFAULT_PROVIDER);
const keyName = (provider) => 'chave-' + providerOf(provider);

async function readKey(provider) {
  try { return (await SecureStorage.getItem(keyName(provider))) || null; } catch { return null; }
}

/** Grava a chave no armazenamento seguro. Recusa chave com formato errado. */
async function saveKey(provider, key) {
  const p = providerOf(provider), k = String(key || '').trim();
  if (!ai.validKey(p, k)) throw new Error(`Essa não parece uma chave do ${ai.PROVIDERS[p].label} (começa com "${ai.PROVIDERS[p].keyHint}").`);
  await SecureStorage.setItem(keyName(p), k);
  return true;
}
async function clearKey(provider) {
  await SecureStorage.removeItem(keyName(provider)).catch(() => {});
  return true;
}
async function keyStatus(provider) {
  const p = providerOf(provider);
  return { provider: p, saved: !!(await readKey(p)), available: true };
}

/** Mensagem clara para cada situação. Sem explicação própria, mostra o motivo que a API devolveu (sem a chave). */
function httpError(status, body) {
  let apiMsg = '';
  try { const j = JSON.parse(body); apiMsg = (j.error && (j.error.message || j.error)) || j.message || ''; } catch { /* corpo não é JSON */ }
  apiMsg = ai.cleanText(typeof apiMsg === 'string' ? apiMsg : '', 240);
  if (status === 401 || status === 403) return 'A chave foi recusada pelo provedor. Confira se copiou a chave inteira e se ela está ativa. ' + (apiMsg ? '(' + apiMsg + ')' : '');
  if (status === 429) return 'Limite de uso do provedor atingido. Tente de novo em alguns minutos.' + (apiMsg ? ' (' + apiMsg + ')' : '');
  if (status >= 500) return 'O serviço do provedor está instável agora. Tente de novo em instantes.';
  return 'O provedor não atendeu o pedido (código ' + status + ')' + (apiMsg ? ': ' + apiMsg : '.');
}

async function getJsonBody(res) {
  const text = await res.text();
  if (res.status < 200 || res.status > 299) throw new Error(httpError(res.status, text));
  try { return JSON.parse(text); } catch { throw new Error('Resposta inesperada do provedor.'); }
}

async function postJson(req) {
  const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctl ? setTimeout(() => ctl.abort(), TIMEOUT_MS) : null;
  try {
    const res = await fetch(req.url, { method: 'POST', headers: req.headers, body: JSON.stringify(req.body), signal: ctl ? ctl.signal : undefined });
    return await getJsonBody(res);
  } catch (e) {
    if (e && e.name === 'AbortError') throw new Error('O assistente demorou demais para responder. Tente de novo.');
    if (e instanceof TypeError) throw new Error('Sem conexão com a internet para falar com o assistente.');
    throw e;
  } finally { if (timer) clearTimeout(timer); }
}

// Sem modelo escolhido, usa o primeiro modelo de conversa que a própria conta lista (igual ao desktop).
const modelCache = new Map();
const MODEL_TTL_MS = 10 * 60 * 1000;
async function resolveModel(provider, model) {
  if (ai.validModel(model)) return model;
  const c = modelCache.get(provider);
  if (c && Date.now() - c.at < MODEL_TTL_MS) return c.id;
  const { ids } = await models(provider);
  modelCache.set(provider, { id: ids[0], at: Date.now() });
  return ids[0];
}

async function ask({ provider, model, mode, question, selection, topic }) {
  const p = providerOf(provider);
  const apiKey = await readKey(p);
  if (!apiKey) throw new Error(`Informe a sua chave do ${ai.PROVIDERS[p].label} na aba Assistente antes de perguntar.`);
  const req = ai.buildRequest({ provider: p, model: await resolveModel(p, model), mode, question, selection, topic, apiKey });
  const text = ai.parseResponse(await postJson(req), p);
  if (mode === 'notes') {
    const n = ai.parseNote(text);
    if (!n.ok) throw new Error(n.error);
    return { text: n.text };
  }
  if (mode === 'outline') {
    const r = ai.parseOutline(text);
    if (!r.ok) throw new Error(r.error);
    return { topics: r.topics };
  }
  return { text };
}

async function models(provider) {
  const p = providerOf(provider);
  const apiKey = await readKey(p);
  if (!apiKey) throw new Error(`Guarde a chave do ${ai.PROVIDERS[p].label} antes de listar os modelos.`);
  const headers = p === 'claude'
    ? { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
    : { authorization: 'Bearer ' + apiKey };
  const url = p === 'claude' ? 'https://api.anthropic.com/v1/models' : 'https://api.groq.com/openai/v1/models';
  const res = await fetch(url, { method: 'GET', headers });
  const json = await getJsonBody(res);
  const ids = ai.pickModels((json.data || []).map((m) => m.id));
  if (!ids.length) throw new Error('A conta não tem modelos de conversa disponíveis.');
  return { ids };
}

async function test(provider, model) {
  const p = providerOf(provider);
  const apiKey = await readKey(p);
  if (!apiKey) throw new Error(`Guarde a chave do ${ai.PROVIDERS[p].label} antes de testar.`);
  const req = ai.buildRequest({ provider: p, model: await resolveModel(p, model), mode: 'answer', question: 'Responda apenas: ok', selection: 'Teste de conexão.', apiKey });
  req.body.max_tokens = 256;
  ai.parseResponse(await postJson(req), p);
  return true;
}

module.exports = { saveKey, clearKey, keyStatus, ask, models, test, httpError };
