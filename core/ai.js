'use strict';
/**
 * Assistente de IA: regras puras, sem rede nem Electron. O processo principal faz a chamada HTTP;
 * aqui ficam os formatos de requisição e de resposta de cada provedor e a validação da estrutura de tópicos.
 * Só o texto selecionado pelo usuário vai para o modelo: nunca o mapa inteiro.
 *
 * Provedores:
 *  - groq (PADRÃO): camada gratuita, sem cartão. Formato compatível com a OpenAI.
 *  - claude (opcional): API da Anthropic, com chave própria do console.
 */

const PROVIDERS = {
  groq: {
    label: 'Groq (gratuito)',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.1-8b-instant',   // cota diária alta e poucos tokens por pedido
    keyHint: 'gsk_…',
    keyPattern: /^gsk_[\x21-\x7e]{20,300}$/,
    format: 'openai',
  },
  claude: {
    label: 'Claude (Anthropic)',
    url: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-5-5',
    keyHint: 'sk-ant-…',
    keyPattern: /^sk-[\x21-\x7e]{16,300}$/,
    format: 'anthropic',
  },
};
const DEFAULT_PROVIDER = 'groq';
const MAX_TOKENS = 1200;
const LIMITS = { depth: 6, nodes: 80, title: 120, selection: 4000, question: 1000, note: 600, paragraphs: 3 };   // nota: curta, para motivar o estudo

// Papel padrão: professor de concurso público. Vale para as três ações (perguntar, nota e tópicos).
const TEACHER = 'Você é um professor experiente de concursos públicos brasileiros, em português do Brasil. '
  + 'Ensina com foco na prova: vá direto ao ponto, use linguagem clara, cite a base legal ou o conceito-chave quando houver, '
  + 'aponte pegadinhas comuns de banca e, quando fizer sentido, a diferença entre conceitos parecidos. '
  + 'Use somente o tema e o conteúdo fornecidos como base. Se o conteúdo não bastar, diga isso e não invente lei, artigo ou jurisprudência. '
  + 'Lembre que a legislação pode ter sido alterada: confira o texto oficial e o edital.';
const SYSTEM_ANSWER = TEACHER + ' Responda à pergunta do aluno com objetividade, em até 8 frases.';
// Nota curta: uma ideia central, um exemplo e uma pergunta para testar a memória (recordação ativa).
const SYSTEM_NOTES = TEACHER + ' Escreva uma nota de estudo para o aluno revisar o tema. '
  + 'Formato: no máximo 3 frases curtas ou 3 tópicos. Inclua (1) a ideia central em uma frase, (2) um exemplo muito breve de cobrança em prova e '
  + '(3) uma pergunta de múltipla escolha ou de recordação que faça o aluno lembrar o assunto. Sem introdução, sem título. Até ' + LIMITS.note + ' caracteres.';
// Parágrafos de revisão (material para impressão), usados quando o tópico não tem nota: de 1 a 3 parágrafos, com foco em
// revisão para concurso público (o que cai, como cobrar, o que confundir).
const SYSTEM_PARAGRAPHS = TEACHER + ' Escreva de 1 a 3 parágrafos de revisão sobre o tema, voltados à revisão para concurso público: '
  + 'o conceito essencial, como a banca costuma cobrar e o ponto que candidatos confundem. Use texto corrido, sem títulos, sem listas e sem introdução. '
  + 'Use 1 parágrafo para tema simples e 3 para tema complexo. Cada parágrafo com 2 a 4 frases. Separe os parágrafos com uma linha em branco.';
const SYSTEM_OUTLINE = TEACHER + ' Organize o conteúdo em tópicos para um mapa mental de estudo. '
  + 'Responda SOMENTE com JSON no formato {"topics":[{"title":"...","note":"...","children":[...]}]}, sem texto antes ou depois. '
  + 'Cada tópico pode ter uma "note" curta (uma ou duas frases) que explica o tópico para o estudo; use "" quando não houver o que explicar. '
  + 'Títulos curtos (até 8 palavras). No máximo ' + LIMITS.depth + ' níveis e ' + LIMITS.nodes + ' tópicos no total.';

/** Limpa um texto vindo do usuário ou do modelo: sem caracteres de controle, espaços reduzidos, tamanho limitado. */
function cleanText(v, max) {
  return String(v ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Modelos de conversa da conta, do mais útil para o estudo ao menos útil. Modelos de áudio, moderação e embeddings ficam de fora. */
function pickModels(ids) {
  const ok = [...new Set((ids || []).map(String))].filter((id) => validModel(id) && !/whisper|tts|guard|embed|moderat|safeguard|prompt-guard/i.test(id));
  const rank = (id) => (/versatile|gpt-oss|instruct|sonnet|opus|haiku/i.test(id) ? 0 : /instant|llama|qwen|mixtral/i.test(id) ? 1 : 2);
  return ok.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

/** Valida o formato da chave do provedor (sem nunca ecoar a chave). */
function validKey(provider, key) {
  const p = PROVIDERS[provider];
  return !!p && p.keyPattern.test(String(key || '').trim());
}

/** Monta a requisição HTTP para o provedor. A chave entra só no cabeçalho, que o chamador nunca registra. */
/** Nome de modelo seguro (vai na URL/corpo): letras, números e . _ / - */
const validModel = (m) => /^[A-Za-z0-9._/-]{1,100}$/.test(String(m || '')) && !String(m || '').includes('..');

function buildRequest({ provider = DEFAULT_PROVIDER, model, mode, question, selection, topic, apiKey }) {
  const p = PROVIDERS[provider];
  if (!p) throw new Error('Provedor de IA desconhecido.');
  const useModel = validModel(model) ? model : p.model;   // o modelo escolhido na conta tem prioridade sobre o padrão
  if (!['outline', 'answer', 'notes', 'paragraphs'].includes(mode)) throw new Error('Modo de IA desconhecido.');
  const sel = cleanText(selection, LIMITS.selection);
  // tema do tópico: o caminho dentro do mapa (ex.: Direito > Administrativo > Atos), usado como contexto de estudo
  const tema = cleanText(topic, 300);
  const q = cleanText(question, LIMITS.question);
  if (!sel) throw new Error('Selecione um tópico ou escreva um trecho antes de perguntar.');
  const ctx = (tema ? `Tema do tópico: ${tema}\n` : '') + `Conteúdo do tópico:\n${sel}`;
  const user = mode === 'outline' ? `Organize em tópicos o conteúdo abaixo:\n\n${ctx}`
    : mode === 'notes' ? `Escreva a nota de estudo para este tópico:\n\n${ctx}`
    : mode === 'paragraphs' ? `Escreva os parágrafos de revisão para este tópico:

${ctx}`
    : `${ctx}\n\nPergunta do aluno: ${q || 'Explique o tópico de forma resumida, do jeito que cairia em prova.'}`;
  const system = mode === 'outline' ? SYSTEM_OUTLINE : mode === 'notes' ? SYSTEM_NOTES : mode === 'paragraphs' ? SYSTEM_PARAGRAPHS : SYSTEM_ANSWER;
  const key = String(apiKey || '');
  if (p.format === 'anthropic') {
    return {
      url: p.url,
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: { model: useModel, max_tokens: MAX_TOKENS, system, messages: [{ role: 'user', content: user }] },
    };
  }
  return {
    url: p.url,
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
    body: { model: useModel, max_tokens: MAX_TOKENS, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] },
  };
}

/** Extrai o texto da resposta de cada formato. Erros da API viram mensagens claras (sem ecoar a chave). */
function parseResponse(json, provider = DEFAULT_PROVIDER) {
  const p = PROVIDERS[provider];
  if (!json || typeof json !== 'object' || !p) throw new Error('Resposta inesperada do assistente.');
  if (json.type === 'error' || json.error) {
    const msg = json.error && json.error.message ? String(json.error.message) : 'erro desconhecido';
    throw new Error('O assistente recusou o pedido: ' + cleanText(msg, 200));
  }
  let text = '';
  if (p.format === 'anthropic') {
    const parts = Array.isArray(json.content) ? json.content : [];
    text = parts.filter((x) => x && x.type === 'text' && typeof x.text === 'string').map((x) => x.text).join('\n').trim();
  } else {
    const ch = json.choices && json.choices[0];
    const c = ch && ch.message;
    text = c && typeof c.content === 'string' ? c.content.trim() : '';
    // o modelo gastou o limite de tokens antes de escrever a resposta (comum em modelos que raciocinam antes de responder)
    if (!text && ch && ch.finish_reason === 'length') throw new Error('O assistente parou antes de terminar a resposta (limite de tokens). Tente de novo ou escolha outro modelo.');
  }
  if (!text) throw new Error('O assistente não devolveu texto. Tente de novo ou escolha outro modelo.');
  return text;
}

/** Nota curta: limpa, sem marcas de código, e cortada em um limite de palavra se passar do tamanho. */
/** Parágrafos de revisão: separados por linha em branco, sem marcação, de 1 a LIMITS.paragraphs (3). */
function parseParagraphs(text) {
  const t = String(text || '').replace(/```[a-z]*\n?/gi, '').replace(/\r/g, '').trim();
  const parts = t.split(/\n\s*\n/).map((p) => cleanText(p.replace(/^\s*(#+|[-*•]|\d+[.)])\s+/gm, ''), 1200)).filter(Boolean);
  if (!parts.length) return { ok: false, error: 'O assistente não devolveu parágrafos utilizáveis. Tente de novo.' };
  return { ok: true, paragraphs: parts.slice(0, LIMITS.paragraphs) };
}

function parseNote(text) {
  let t = String(text || '').replace(/```[a-z]*\n?/gi, '').replace(/\r/g, '').trim();
  t = t.split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!t) return { ok: false, error: 'O assistente não devolveu uma nota utilizável. Tente de novo.' };
  if (t.length > LIMITS.note) {
    const cut = t.slice(0, LIMITS.note), sp = cut.lastIndexOf(' ');
    t = (sp > LIMITS.note * 0.6 ? cut.slice(0, sp) : cut).replace(/[,;:\s]+$/, '') + '…';
  }
  return { ok: true, text: t };
}

/** Pega o JSON de dentro do texto (aceita cerca de código ```json e texto em volta). */
function extractJson(text) {
  const t = String(text || '').trim();
  try { return JSON.parse(t); } catch { /* segue */ }
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch { /* segue */ } }
  return null;
}

/**
 * Valida a estrutura de tópicos devolvida pelo modelo. Nunca confia no conteúdo: títulos viram texto limpo,
 * profundidade e quantidade têm teto, e nada além de title/children é aproveitado.
 * Devolve { ok, topics } ou { ok:false, error }.
 */
function parseOutline(text) {
  const obj = extractJson(text);
  if (!obj || !Array.isArray(obj.topics)) return { ok: false, error: 'O assistente não devolveu uma lista de tópicos válida. Tente de novo.' };
  let count = 0;
  const walk = (list, depth) => {
    const out = [];
    for (const it of list) {
      if (!it || typeof it !== 'object') continue;
      const title = cleanText(it.title, LIMITS.title);
      if (!title) continue;
      if (++count > LIMITS.nodes) throw new Error(`Muitos tópicos (máximo ${LIMITS.nodes}). Selecione um trecho menor.`);
      const node = { title, note: cleanText(it.note, LIMITS.note), children: [] };
      if (Array.isArray(it.children) && it.children.length) {
        if (depth + 1 >= LIMITS.depth) throw new Error(`Estrutura profunda demais (máximo ${LIMITS.depth} níveis).`);
        node.children = walk(it.children, depth + 1);
      }
      out.push(node);
    }
    return out;
  };
  try {
    const topics = walk(obj.topics, 0);
    if (!topics.length) return { ok: false, error: 'O assistente não devolveu nenhum tópico utilizável.' };
    return { ok: true, topics };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

module.exports = { PROVIDERS, DEFAULT_PROVIDER, LIMITS, buildRequest, parseResponse, parseOutline, parseNote, parseParagraphs, cleanText, validKey, validModel, pickModels };
