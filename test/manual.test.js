'use strict';
// Manual de uso: estrutura dos dados, busca e — o mais importante para a manutenção — COBERTURA: cada funcionalidade tem sua seção
// e todo botão "? Como usar" da interface aponta para uma seção que existe.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const M = require('../core/manual');

const KINDS = new Set(['p', 'ul', 'steps', 'tip', 'warn', 'keys', 'modelo']);
const ROOT = path.join(__dirname, '..');

test('seções: ids únicos, título, resumo e blocos válidos', () => {
  const ids = new Set();
  for (const s of M.SECTIONS) {
    assert.match(s.id, /^[a-z0-9-]+$/, s.id); assert.ok(!ids.has(s.id), 'id repetido: ' + s.id); ids.add(s.id);
    assert.ok(s.title && s.summary && s.group && s.blocks.length, s.id);
    for (const b of s.blocks) {
      assert.ok(KINDS.has(b[0]), `${s.id}: bloco desconhecido ${b[0]}`);
      if (b[0] === 'ul' || b[0] === 'steps') assert.ok(Array.isArray(b[1]) && b[1].every((x) => typeof x === 'string' && x.length > 3), s.id);
      else if (b[0] === 'keys') assert.ok(b[1].every((r) => r.length === 2 && r[0] && r[1]), s.id);
      else assert.equal(typeof b[1], 'string');
      if (b[2]) assert.ok(['desktop', 'touch'].includes(b[2].only), s.id);
    }
  }
});

test('o texto nunca carrega HTML (a janela só interpreta **negrito** e `código`)', () => {
  const all = JSON.stringify(M.SECTIONS);
  assert.ok(!/<\/?[a-z][^>]*>/i.test(all), 'tag HTML no manual');
});

test('computador e tablet: nenhuma seção fica vazia; atalhos de teclado só no computador; gestos só no tablet', () => {
  for (const host of ['desktop', 'touch']) for (const s of M.sections(host)) assert.ok(s.blocks.length > 0, `${host}/${s.id}`);
  for (const s of M.sections('touch')) assert.ok(!s.blocks.some((b) => b[0] === 'keys'), 'tablet sem tabela de teclas: ' + s.id);
  assert.ok(M.find('tablet', 'touch').blocks.some((b) => /Barra flutuante/.test(JSON.stringify(b))));
  assert.ok(M.find('atalhos', 'desktop').blocks.some((b) => b[0] === 'keys'));
});

test('cobertura: cada funcionalidade do app tem uma seção', () => {
  const need = ['primeiros-passos', 'tela-inicial', 'topicos', 'reordenar', 'selecao', 'estilo', 'notas', 'relacoes', 'busca-ajustar','salvar', 'biblioteca', 'exportar', 'edital',
    'layout', 'estudo-topico', 'caderno-erros', 'painel-estudos', 'revisao', 'simulados', 'rede', 'pdf', 'sincronizacao', 'tablet', 'atalhos', 'seguranca-dados'];
  for (const id of need) assert.ok(M.find(id), 'falta a seção: ' + id);
});

test('todo "Como usar?" da interface (data-manual / openManual) aponta para uma seção existente', () => {
  const files = [path.join(ROOT, 'renderer', 'index.html'), ...fs.readdirSync(path.join(ROOT, 'renderer', 'react')).filter((f) => /\.jsx$/.test(f)).map((f) => path.join(ROOT, 'renderer', 'react', f))];
  const refs = [];
  for (const f of files) { const t = fs.readFileSync(f, 'utf8'); for (const m of t.matchAll(/data-manual=\\?"([a-z0-9-]+)\\?"/g)) refs.push([path.basename(f), m[1]]); }
  assert.ok(refs.length >= 5, 'poucos pontos de ajuda: ' + refs.length);
  for (const [f, id] of refs) assert.ok(M.find(id), `${f}: seção inexistente "${id}"`);
});

test('busca: sem acento nem caixa, título pesa mais, todas as palavras, vazia devolve tudo', () => {
  assert.equal(M.search('', 'desktop').length, M.sections('desktop').length);
  assert.equal(M.search('REVISÃO', 'desktop')[0].id, 'revisao');
  assert.equal(M.search('revisao', 'desktop')[0].id, 'revisao');
  assert.equal(M.search('pdf', 'desktop')[0].id, 'pdf');
  assert.deepEqual(M.search('xyzzy-inexistente', 'desktop'), []);
  const a = M.search('caderno erros', 'desktop'); assert.equal(a[0].id, 'caderno-erros');
  assert.ok(M.search('cronometro', 'desktop').some((s) => s.id === 'estudo-topico'), 'acha pelo texto do corpo');
});

test('grupos: cada seção aparece uma vez, na ordem do manual', () => {
  const g = M.groups('desktop'); const ids = g.flatMap((x) => x.items.map((s) => s.id));
  assert.equal(new Set(ids).size, ids.length); assert.equal(ids.length, M.sections('desktop').length);
});
