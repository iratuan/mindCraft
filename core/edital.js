'use strict';
const { MindMap, createNode } = require('./model');

/**
 * Converte texto colado (edital de concurso, lista de tópicos, outline com recuo) em árvore de tópicos.
 *
 * Reconhece, por linha:
 *   "1 Título", "1. Título", "1.2 Título", "1.2.3) Título" → nível = quantidade de números;
 *   "a) item", "b. item"                                   → filho do último item numerado;
 *   "- item", "* item", "• item" com recuo                 → nível pelo recuo;
 *   linha sem número, em MAIÚSCULAS ou terminada em ":"     → disciplina/bloco (nível 1);
 *   linha sem número que continua a anterior (quebra de linha do PDF) → é emendada ao item anterior.
 */
const NUM = /^(\d+(?:\.\d+)*)\s*[.)\-–—:]?\s+(\S.*)$/;
const LETTER = /^([a-zA-Z])\s*[).]\s+(\S.*)$/;
const BULLET = /^(\s*)[-*+•·▪●○]\s+(\S.*)$/;

const isHeading = (s) => {
  const letters = s.replace(/[^A-Za-zÀ-ÿ]/g, '');
  return (letters.length >= 3 && letters === letters.toUpperCase()) || /:\s*$/.test(s);
};
const clean = (s) => s.replace(/\s+/g, ' ').trim();

/** Retorna array de nós raiz (cada um com `children`). */
function textToNodes(text) {
  const lines = String(text).replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n').filter((l) => l.trim());
  const items = []; // { level, title }
  let hasHeading = false;
  let lastNumLevel = 0;

  // 1ª passada: há blocos/disciplinas (linhas sem número em maiúsculas ou terminadas em ':')?
  for (const raw of lines) {
    const t = raw.trim();
    if (!NUM.test(t) && !LETTER.test(t) && !BULLET.test(raw) && isHeading(t)) { hasHeading = true; break; }
  }
  const base = hasHeading ? 1 : 0;

  for (const raw of lines) {
    const t = raw.trim();
    let m;
    if ((m = NUM.exec(t))) {
      const depth = m[1].split('.').length;
      lastNumLevel = base + depth;
      items.push({ level: lastNumLevel, title: clean(m[2]) });
    } else if ((m = LETTER.exec(t)) && items.length) {
      items.push({ level: lastNumLevel + 1, title: clean(m[2]) });
    } else if ((m = BULLET.exec(raw))) {
      const indent = Math.floor(m[1].length / 2);
      items.push({ level: base + 1 + indent, title: clean(m[2]), bullet: true });
      lastNumLevel = base + indent;
    } else if (isHeading(t)) {
      items.push({ level: 0, title: clean(t.replace(/:\s*$/, '')) });
      lastNumLevel = 0;
    } else if (items.length && !/[.;:!?]$/.test(items[items.length - 1].title) && !/^[A-ZÀ-Ý]/.test(t)) {
      items[items.length - 1].title = clean(items[items.length - 1].title + ' ' + t); // continuação de linha
    } else {
      // linha solta: irmã do item anterior (ou primeiro nível se não houver)
      const prev = items[items.length - 1];
      items.push({ level: prev ? prev.level : base, title: clean(t) });
    }
  }

  // blocos têm nível 0 (se existirem) => relativo; normaliza para que o menor nível seja 0
  const min = items.length ? Math.min(...items.map((i) => i.level)) : 0;
  const roots = [];
  const stack = [];
  for (const it of items) {
    const level = it.level - min;
    const node = createNode(it.title);
    while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
    // se pular níveis (ex.: 1 → 1.1.1), anexa ao ancestral mais próximo
    (stack.length ? stack[stack.length - 1].node.children : roots).push(node);
    stack.push({ level, node });
  }
  return roots;
}

/** Edital → mapa: a raiz é o concurso/prova e os blocos/itens de topo viram disciplinas. */
function fromEdital(text, title = 'Edital') {
  const roots = textToNodes(text);
  const root = createNode(title);
  root.children = roots;
  return new MindMap(root, { name: title });
}

module.exports = { textToNodes, fromEdital };
