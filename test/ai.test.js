'use strict';
// Assistente de IA (núcleo): formato da requisição, leitura da resposta e validação da estrutura de tópicos.
const test = require('node:test');
const assert = require('node:assert');
const { buildRequest, parseResponse, parseOutline, parseNote, LIMITS, PROVIDERS, DEFAULT_PROVIDER, validKey } = require('../core/services/ai');
const API_URL = PROVIDERS.claude.url, MODEL = PROVIDERS.claude.model;

test('requisição: só o trecho selecionado vai no corpo; a chave só vai no cabeçalho', () => {
  const r = buildRequest({ provider: 'claude', mode: 'answer', question: 'O que é?', selection: 'Direito Constitucional', apiKey: 'sk-SEGREDO' });
  assert.strictEqual(r.url, API_URL);
  assert.strictEqual(r.headers['x-api-key'], 'sk-SEGREDO');
  assert.ok(!JSON.stringify(r.body).includes('sk-SEGREDO'), 'a chave não pode ir para o corpo');
  assert.strictEqual(r.body.model, MODEL);
  assert.ok(r.body.messages[0].content.includes('Direito Constitucional'));
});

test('requisição: controle de caracteres e tamanho do trecho', () => {
  const r = buildRequest({ mode: 'answer', question: 'x', selection: 'a\u0000b\n\n' + 'z'.repeat(9000), apiKey: 'k' });
  const user = r.body.messages[0].content;
  assert.ok(!/[\u0000-\u0008]/.test(user));
  assert.ok(user.length < LIMITS.selection + 200);
});

test('requisição: sem trecho ou com modo desconhecido, recusa antes de chamar', () => {
  assert.throws(() => buildRequest({ provider: 'claude', mode: 'answer', selection: '   ', apiKey: 'k' }), /Selecione/);
  assert.throws(() => buildRequest({ provider: 'claude', mode: 'hack', selection: 'x', apiKey: 'k' }), /desconhecido/);
});

test('padrão gratuito: Groq, no formato compatível com a OpenAI, com a chave só no cabeçalho', () => {
  assert.strictEqual(DEFAULT_PROVIDER, 'groq');
  const r = buildRequest({ mode: 'answer', question: 'Oi?', selection: 'Tópico', apiKey: 'gsk_SEGREDOSEGREDOSEGREDO123' });
  assert.match(r.url, /api\.groq\.com\/openai\/v1\/chat\/completions$/);
  assert.strictEqual(r.headers.authorization, 'Bearer gsk_SEGREDOSEGREDOSEGREDO123');
  assert.ok(!JSON.stringify(r.body).includes('gsk_SEGREDO'), 'a chave não pode ir para o corpo');
  assert.strictEqual(r.body.messages[0].role, 'system');
  assert.strictEqual(parseResponse({ choices: [{ message: { content: ' Resposta groq ' } }] }, 'groq'), 'Resposta groq');
});

test('chave: cada provedor aceita só o seu formato', () => {
  assert.ok(validKey('groq', 'gsk_' + 'a'.repeat(40)));
  assert.ok(!validKey('groq', 'sk-ant-abc'));
  assert.ok(validKey('claude', 'sk-ant-' + 'a'.repeat(40)));
  assert.ok(!validKey('claude', 'gsk_' + 'a'.repeat(40)));
  assert.ok(!validKey('nenhum', 'sk-' + 'a'.repeat(40)));
});

test('resposta: extrai o texto e mostra a mensagem de erro da API', () => {
  assert.strictEqual(parseResponse({ content: [{ type: 'text', text: 'Resposta' }] }, 'claude'), 'Resposta');
  assert.throws(() => parseResponse({ type: 'error', error: { message: 'chave inválida' } }, 'claude'), /recusou.*chave inválida/);
  assert.throws(() => parseResponse({ content: [] }, 'claude'), /não devolveu texto/);
  assert.throws(() => parseResponse(null, 'claude'), /inesperada/);
});

test('tópicos: cada subtópico pode trazer uma nota explicativa, limpa e limitada', () => {
  const r = parseOutline(JSON.stringify({ topics: [{ title: 'Poderes', note: '  Três poderes independentes ', children: [{ title: 'Executivo' }] }] }));
  assert.ok(r.ok);
  assert.strictEqual(r.topics[0].note, 'Três poderes independentes');
  assert.strictEqual(r.topics[0].children[0].note, '');
  const longa = parseOutline('{"topics":[{"title":"X","note":"' + 'a'.repeat(LIMITS.note + 50) + '"}]}');
  assert.strictEqual(longa.topics[0].note.length, LIMITS.note);
});
test('tópicos: aceita JSON limpo e JSON dentro de texto', () => {
  const a = parseOutline('{"topics":[{"title":"Órgãos","children":[{"title":"Executivo"}]}]}');
  assert.ok(a.ok);
  assert.deepStrictEqual(a.topics, [{ title: 'Órgãos', note: '', children: [{ title: 'Executivo', note: '', children: [] }] }]);
  const b = parseOutline('Aqui está:\n```json\n{"topics":[{"title":"A"}]}\n```');
  assert.ok(b.ok);
  assert.strictEqual(b.topics[0].title, 'A');
});

test('tópicos: texto que não é JSON ou sem lista é recusado com mensagem clara', () => {
  for (const t of ['não sei', '{"x":1}', '{"topics":[]}', '{"topics":[{"title":"   "}]}']) {
    const r = parseOutline(t);
    assert.strictEqual(r.ok, false, t);
    assert.ok(r.error.length > 10);
  }
});

test('tópicos: títulos viram texto limpo e campos estranhos são descartados', () => {
  const r = parseOutline(JSON.stringify({ topics: [{ title: '<img onerror=x>\n\tOi', children: 'x', extra: 1 }] }));
  assert.ok(r.ok);
  assert.strictEqual(r.topics[0].title, '<img onerror=x> Oi');
  assert.deepStrictEqual(r.topics[0].children, []);
  assert.ok(!('extra' in r.topics[0]));
});

test('tópicos: limite de profundidade e de quantidade é recusado, nunca cortado em silêncio', () => {
  let deep = { title: 'fim' };
  for (let i = 0; i < LIMITS.depth + 2; i++) deep = { title: 'n' + i, children: [deep] };
  assert.strictEqual(parseOutline(JSON.stringify({ topics: [deep] })).ok, false);
  const many = Array.from({ length: LIMITS.nodes + 1 }, (_, i) => ({ title: 'T' + i }));
  const r = parseOutline(JSON.stringify({ topics: many }));
  assert.strictEqual(r.ok, false);
  assert.match(r.error, /Muitos tópicos/);
});

test('nota: pedido próprio, curto e motivador (ideia, exemplo e pergunta)', () => {
  const r = buildRequest({ provider: 'groq', mode: 'notes', selection: 'Princípio da legalidade', apiKey: 'gsk_' + 'a'.repeat(30) });
  assert.match(r.body.messages[0].content, /no máximo 3 frases/);
  assert.match(r.body.messages[0].content, /pergunta/);
  assert.ok(r.body.messages[1].content.includes('Princípio da legalidade'));
});

test('nota: limite de tamanho é aplicado no código, cortando em palavra inteira', () => {
  const longo = ('palavra '.repeat(200)).trim();
  const n = parseNote(longo);
  assert.ok(n.ok);
  assert.ok(n.text.length <= LIMITS.note + 1, 'nota longa demais: ' + n.text.length);
  assert.ok(n.text.endsWith('…'));
  assert.ok(!/\s…$/.test(n.text) && /palavra…$/.test(n.text), 'corta em palavra inteira');
});

test('nota: limpa marcas de código e linhas em branco excessivas; vazia é recusada', () => {
  const n = parseNote('```text\nIdeia central.\n\n\n\nExemplo curto.\n```');
  assert.strictEqual(n.text, 'Ideia central.\n\nExemplo curto.');
  assert.strictEqual(parseNote('   ').ok, false);
});

test('modelo: o modelo escolhido na conta substitui o padrão; nome inválido volta ao padrão', () => {
  const { validModel } = require('../core/services/ai');
  const a = buildRequest({ provider: 'groq', model: 'modelo-da-conta-1', mode: 'answer', question: 'x', selection: 'y', apiKey: 'gsk_' + 'a'.repeat(30) });
  assert.strictEqual(a.body.model, 'modelo-da-conta-1');
  const b = buildRequest({ provider: 'groq', model: 'x; rm -rf /', mode: 'answer', question: 'x', selection: 'y', apiKey: 'gsk_' + 'a'.repeat(30) });
  assert.strictEqual(b.body.model, PROVIDERS.groq.model);
  assert.strictEqual(validModel('../../etc'), false);
});

test('modelos: lista só modelos de conversa, do mais útil ao menos útil', () => {
  const { pickModels } = require('../core/services/ai');
  const ids = pickModels(['whisper-large-v3', 'llama-guard-4', 'llama-3.1-8b-instant', 'openai/gpt-oss-120b', 'text-embedding-3', 'llama-3.3-70b-versatile']);
  assert.deepStrictEqual(ids, ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'llama-3.1-8b-instant']);
});

test('professor de concurso: papel padrão nas três ações, com o tema do tópico como contexto', () => {
  for (const mode of ['answer', 'notes', 'outline']) {
    const r = buildRequest({ provider: 'groq', mode, question: 'O que é?', selection: 'Ato administrativo', topic: 'Direito › Administrativo › Atos', apiKey: 'gsk_' + 'a'.repeat(30) });
    const sys = r.body.messages[0].content, user = r.body.messages[1].content;
    assert.match(sys, /professor experiente de concursos públicos/, mode);
    assert.match(sys, /não invente lei/, mode);
    assert.match(user, /Tema do tópico: Direito › Administrativo › Atos/, mode);
    assert.match(user, /Ato administrativo/, mode);
  }
});

test('professor: sem tema, o pedido segue só com o conteúdo do tópico', () => {
  const r = buildRequest({ provider: 'groq', mode: 'answer', question: 'x', selection: 'Conteúdo', apiKey: 'gsk_' + 'a'.repeat(30) });
  assert.ok(!/Tema do tópico/.test(r.body.messages[1].content));
});

test('resposta vazia: resposta cortada por limite de tokens tem mensagem própria', () => {
  assert.throws(() => parseResponse({ choices: [{ message: { content: null }, finish_reason: 'length' }] }, 'groq'), /limite de tokens/);
  assert.throws(() => parseResponse({ choices: [{ message: { content: '' }, finish_reason: 'stop' }] }, 'groq'), /não devolveu texto/);
});
