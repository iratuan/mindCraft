'use strict';
const { MindMap, createNode } = require('./model');
const { normalizeStudy, isDateStr } = require('./study');
const { norm } = require('./links');

/**
 * CSV de edital (gerado por uma IA a partir do edital) → esqueleto do mapa.
 *
 * Colunas (cabeçalho obrigatório; ordem livre; sem acento/caixa; vários apelidos):
 *   disciplina*   nome da disciplina (vira filho da raiz)
 *   topico*       título do tópico
 *   item          numeração do edital: 1 · 1.1 · 1.1.1 → define a hierarquia dentro da disciplina
 *   nivel         alternativa a "item": 1, 2, 3… (1 = filho direto da disciplina)
 *   peso          1–5 (importância do tópico)
 *   notas         texto livre para as notas do tópico
 *   relacionados  títulos de outros tópicos separados por | ou ; → viram [[links]] nas notas
 *   progresso     0–100
 *   concurso      nome do concurso/prova (título da raiz) — basta preencher numa linha
 *   data_prova    AAAA-MM-DD ou DD/MM/AAAA — basta preencher numa linha
 *
 * O arquivo vem de fora, então nada aqui lança por causa do conteúdo: linhas ruins são puladas e relatadas.
 */
const MAX_ROWS = 5000, MAX_CELL = 5000;

const ALIASES = {
  disciplina: ['disciplina', 'materia', 'matéria', 'area', 'área', 'disciplinas'],
  topico: ['topico', 'tópico', 'assunto', 'titulo', 'título', 'conteudo', 'conteúdo', 'tema', 'topicos'],
  item: ['item', 'numero', 'número', 'num', 'numeracao', 'numeração', 'ordem', 'codigo', 'código'],
  nivel: ['nivel', 'nível', 'level', 'profundidade'],
  peso: ['peso', 'importancia', 'importância', 'prioridade', 'weight'],
  notas: ['notas', 'nota', 'observacoes', 'observações', 'observacao', 'observação', 'descricao', 'descrição', 'obs'],
  relacionados: ['relacionados', 'relacionado', 'relacoes', 'relações', 'links', 'ver_tambem', 'ver também', 'veja_tambem'],
  progresso: ['progresso', 'andamento', 'percentual'],
  concurso: ['concurso', 'prova', 'cargo', 'edital', 'exame'],
  data_prova: ['data_prova', 'dataprova', 'data da prova', 'data', 'data_da_prova'],
};
const canon = Object.fromEntries(Object.entries(ALIASES).flatMap(([k, v]) => v.map((a) => [norm(a).replace(/\s+/g, '_'), k])));

/** Decodifica o arquivo: UTF-8 (com/sem BOM); se houver caracteres inválidos, tenta Windows-1252 (Excel em português). */
function decodeCsvBuffer(buf) {
  let b = Buffer.from(buf);
  if (b.length >= 3 && b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) b = b.subarray(3);
  const utf8 = b.toString('utf8');
  return utf8.includes('�') ? new TextDecoder('windows-1252').decode(b) : utf8;
}

/** Leitor CSV (RFC 4180): aspas, aspas duplicadas, quebras de linha dentro de células, delimitador automático (, ; tab). */
function parseCsv(text) {
  const src = String(text).replace(/^\uFEFF/, '');
  const firstLine = src.split(/\r?\n/, 1)[0] || '';
  const count = (ch) => { let n = 0, q = false; for (const c of firstLine) { if (c === '"') q = !q; else if (c === ch && !q) n++; } return n; };
  const delim = [',', ';', '\t'].map((d) => [d, count(d)]).sort((a, b) => b[1] - a[1])[0];
  const D = delim[1] > 0 ? delim[0] : ',';
  const rows = []; let row = [], cell = '', q = false, i = 0, started = false;
  const endCell = () => { row.push(cell.slice(0, MAX_CELL)); cell = ''; started = false; };
  const endRow = () => { endCell(); if (row.length > 1 || row[0].trim() !== '') rows.push(row); row = []; };
  while (i < src.length) {
    const c = src[i];
    if (q) {
      if (c === '"') { if (src[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c;
    } else if (c === '"' && !started && cell === '') { q = true; started = true; }
    else if (c === D) endCell();
    else if (c === '\r') { if (src[i + 1] === '\n') i++; endRow(); }
    else if (c === '\n') endRow();
    else { cell += c; started = true; }
    i++;
  }
  if (cell !== '' || row.length) endRow();
  return { rows, delimiter: D };
}

const cleanTitle = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
function parseDate(s) {
  const t = String(s ?? '').trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (m) return isDateStr(t) ? t : null;
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(t);
  if (m) { const d = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`; return isDateStr(d) ? d : null; }
  return null;
}

/**
 * @returns {{ map: MindMap|null, report: { rows:number, imported:number, disciplines:number, skipped:number,
 *   errors:{line:number,msg:string}[], warnings:string[], delimiter:string, columns:string[] } }}
 */
function fromCsv(input, { title = 'Edital' } = {}) {
  const text = Buffer.isBuffer(input) ? decodeCsvBuffer(input) : String(input ?? '');
  const { rows, delimiter } = parseCsv(text);
  const report = { rows: 0, imported: 0, disciplines: 0, skipped: 0, errors: [], warnings: [], delimiter, columns: [] };
  if (!rows.length) { report.errors.push({ line: 0, msg: 'O arquivo está vazio.' }); return { map: null, report }; }

  const header = rows[0].map((h) => canon[norm(h).replace(/\s+/g, '_')] || null);
  report.columns = header.filter(Boolean);
  const col = (k) => header.indexOf(k);
  if (col('disciplina') < 0 || col('topico') < 0) {
    report.errors.push({ line: 1, msg: `Cabeçalho inválido: são obrigatórias as colunas "disciplina" e "topico" (encontrei: ${rows[0].map(cleanTitle).join(', ') || 'nenhuma'}).` });
    return { map: null, report };
  }
  const unknown = rows[0].filter((h, i) => !header[i] && cleanTitle(h));
  if (unknown.length) report.warnings.push(`Colunas ignoradas: ${unknown.map(cleanTitle).join(', ')}.`);
  const dup = report.columns.filter((c, i) => report.columns.indexOf(c) !== i);
  if (dup.length) report.warnings.push(`Coluna repetida (vale a primeira): ${[...new Set(dup)].join(', ')}.`);

  const body = rows.slice(1);
  if (body.length > MAX_ROWS) { report.warnings.push(`Só as primeiras ${MAX_ROWS} linhas foram lidas (o arquivo tem ${body.length}).`); body.length = MAX_ROWS; }
  report.rows = body.length;

  const root = createNode(cleanTitle(title) || 'Edital');
  const get = (r, k) => (col(k) >= 0 ? String(r[col(k)] ?? '').trim() : '');
  const discNodes = new Map(), stacks = new Map(), titlesSeen = new Set();
  let examName = '', examDate = null;
  const wanted = []; // [nó, títulos relacionados] para conferir ao final

  body.forEach((r, idx) => {
    const line = idx + 2;
    const disc = cleanTitle(get(r, 'disciplina')), top = cleanTitle(get(r, 'topico'));
    if (!disc && !top) { report.skipped++; return; }                      // linha em branco "disfarçada"
    if (!disc) { report.errors.push({ line, msg: 'Linha sem disciplina.' }); report.skipped++; return; }
    if (!top) { report.errors.push({ line, msg: `Linha sem tópico (disciplina "${disc}").` }); report.skipped++; return; }

    if (!examName && get(r, 'concurso')) examName = cleanTitle(get(r, 'concurso'));
    if (!examDate && get(r, 'data_prova')) {
      examDate = parseDate(get(r, 'data_prova'));
      if (!examDate) report.warnings.push(`Linha ${line}: data da prova inválida ("${get(r, 'data_prova')}"); use AAAA-MM-DD ou DD/MM/AAAA.`);
    }

    const key = norm(disc);
    if (!discNodes.has(key)) { const n = createNode(disc); root.children.push(n); discNodes.set(key, n); stacks.set(key, []); }
    const dnode = discNodes.get(key), stack = stacks.get(key);

    // hierarquia: "item" (1.2.3 → nível 3) > "nivel" > nível 1
    let level = 1;
    const item = get(r, 'item'), nivel = get(r, 'nivel');
    if (item) {
      const m = /^(\d+(?:\.\d+)*)\.?$/.exec(item.replace(/\s+/g, ''));
      if (m) level = m[1].split('.').length; else report.warnings.push(`Linha ${line}: item "${item}" não é uma numeração (1, 1.1…); usei o nível 1.`);
    } else if (nivel) {
      const n = Number(nivel);
      if (Number.isInteger(n) && n >= 1 && n <= 12) level = n; else report.warnings.push(`Linha ${line}: nível "${nivel}" inválido (use 1 a 12); usei o nível 1.`);
    }

    const extra = {};
    const peso = get(r, 'peso');
    if (peso) {
      const w = Number(peso);
      if (Number.isInteger(w) && w >= 1 && w <= 5) extra.study = normalizeStudy({ weight: w });
      else report.warnings.push(`Linha ${line}: peso "${peso}" inválido (use 1 a 5); ignorado.`);
    }
    const prog = get(r, 'progresso');
    if (prog) {
      const p = Number(prog.replace('%', '').replace(',', '.'));
      if (Number.isFinite(p) && p >= 0 && p <= 100) extra.progress = Math.round(p);
      else report.warnings.push(`Linha ${line}: progresso "${prog}" inválido (use 0 a 100); ignorado.`);
    }
    const rel = get(r, 'relacionados').split(/[|;]/).map(cleanTitle).filter(Boolean);
    const notes = [get(r, 'notas'), rel.length ? 'Relacionados: ' + rel.map((t) => `[[${t.replace(/[\[\]|#]/g, ' ').replace(/\s+/g, ' ').trim()}]]`).join(' · ') : ''].filter(Boolean).join('\n');
    const node = createNode(top, { ...extra, ...(notes ? { notes } : {}) });

    while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
    (stack.length ? stack[stack.length - 1].node : dnode).children.push(node);   // pulou nível? anexa ao ancestral mais próximo
    stack.push({ level, node });
    titlesSeen.add(norm(top)); report.imported++;
    if (rel.length) wanted.push([top, rel]);
  });

  if (!report.imported) { report.errors.push({ line: 0, msg: 'Nenhuma linha válida encontrada.' }); return { map: null, report }; }
  for (const k of discNodes.keys()) titlesSeen.add(k);
  const missing = new Set();
  for (const [, rel] of wanted) for (const t of rel) if (!titlesSeen.has(norm(t))) missing.add(t);
  if (missing.size) report.warnings.push(`${missing.size} tópico(s) "relacionado(s)" não existem no CSV e viraram links sem destino (nós fantasma no grafo): ${[...missing].slice(0, 6).join('; ')}${missing.size > 6 ? '…' : ''}.`);

  const name = examName || cleanTitle(title) || 'Edital';
  root.title = name;
  const map = new MindMap(root, { name });
  if (examDate) map.meta.exam = { name: examName, date: examDate };
  report.disciplines = discNodes.size;
  return { map, report };
}

const TEMPLATE_ROWS = [
  ['concurso', 'data_prova', 'disciplina', 'item', 'topico', 'peso', 'notas', 'relacionados'],
  ['TRF 2ª Região — Analista', '2026-11-29', 'Língua Portuguesa', '1', 'Compreensão e interpretação de textos', '3', '', ''],
  ['', '', 'Língua Portuguesa', '2', 'Ortografia oficial', '2', '', ''],
  ['', '', 'Língua Portuguesa', '2.1', 'Emprego do sinal indicativo de crase', '3', 'Cai muito; revisar casos facultativos.', 'Regência verbal'],
  ['', '', 'Língua Portuguesa', '3', 'Regência verbal', '3', '', 'Emprego do sinal indicativo de crase'],
  ['', '', 'Direito Constitucional', '1', 'Princípios fundamentais', '5', '', ''],
  ['', '', 'Direito Constitucional', '1.1', 'Direitos e garantias fundamentais', '5', '', 'Princípios da Administração Pública'],
  ['', '', 'Direito Administrativo', '1', 'Princípios da Administração Pública', '4', 'LIMPE.', ''],
];
const csvCell = (s) => (/[",;\n\r]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : String(s));
/** CSV de exemplo (com BOM, para o Excel abrir em UTF-8). */
const csvTemplate = () => '﻿' + TEMPLATE_ROWS.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';

/** Instruções prontas para colar numa IA junto com o edital. */
function aiPrompt() {
  return `Você vai converter o CONTEÚDO PROGRAMÁTICO de um edital de concurso em um arquivo CSV. Responda APENAS com o CSV (sem explicações, sem blocos de código).

REGRAS DO FORMATO
- Codificação UTF-8, separador vírgula (","), uma linha por tópico do edital. Use aspas duplas em células que tenham vírgula, aspas ou quebra de linha.
- A PRIMEIRA linha é o cabeçalho, exatamente: concurso,data_prova,disciplina,item,topico,peso,notas,relacionados
- disciplina (obrigatória): nome da disciplina/matéria, escrito sempre IGUAL em todas as linhas dela.
- topico (obrigatório): título curto do assunto, sem numeração no início.
- item: numeração do edital (1, 2, 2.1, 2.1.1…). Ela define a hierarquia: "2.1" é filho de "2". Reinicie a numeração em cada disciplina. Se o edital não numera, use 1, 2, 3 na ordem.
- peso: de 1 a 5 (5 = cai muito/muito importante) conforme o cargo e a banca, se você souber; senão deixe vazio.
- notas: só se o edital trouxer observação útil; senão vazio.
- relacionados: títulos de OUTROS tópicos deste mesmo CSV relacionados a este, separados por "|" (escreva o título IGUAL ao da coluna topico). Vazio se não houver.
- concurso e data_prova: preencha SOMENTE na primeira linha de dados (data no formato AAAA-MM-DD, se o edital informar).
- Não invente tópicos que não estejam no edital. Não repita linhas. Não deixe linhas em branco.

EXEMPLO
concurso,data_prova,disciplina,item,topico,peso,notas,relacionados
TRF 2ª Região — Analista,2026-11-29,Língua Portuguesa,1,Compreensão e interpretação de textos,3,,
,,Língua Portuguesa,2,Ortografia oficial,2,,
,,Língua Portuguesa,2.1,Emprego do sinal indicativo de crase,3,Cai muito,Regência verbal
,,Língua Portuguesa,3,Regência verbal,3,,Emprego do sinal indicativo de crase

EDITAL (cole abaixo o conteúdo programático):
`;
}

module.exports = { fromCsv, parseCsv, decodeCsvBuffer, csvTemplate, aiPrompt, ALIASES };
