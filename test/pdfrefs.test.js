'use strict';
const test = require('node:test');
const assert = require('node:assert');
const AdmZip = require('adm-zip');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { MindMap, createNode } = require('../core/model');
const { readMom, writeMom } = require('../core/mom');
const { sanitizePdfs, sanitizeRefs, refLabel } = require('../core/pdfrefs');

const mk = () => { const m = new MindMap(createNode('Direito')); const a = m.addChild(m.root.id, 'Crase'); return { m, a }; };
const REF = { page: 12, quote: 'Emprega-se a crase antes de palavras femininas.', rects: [[0.1, 0.2, 0.5, 0.03], [0.1, 0.23, 0.4, 0.03]] };

test('registrar PDF: mesmo caminho = mesmo registro; id curto e seguro; relink; tudo desfazível', () => {
  const { m } = mk();
  const p = m.addPdf({ path: 'C:\\Leis\\Lei 8112.pdf' }); assert.match(p.id, /^[0-9a-f]{16}$/); assert.equal(p.name, 'Lei 8112');
  assert.equal(m.addPdf({ path: 'c:\\leis\\lei 8112.PDF' }).id, p.id, 'caminho igual (sem diferenciar caixa) não duplica'); assert.equal(m.meta.pdfs.length, 1);
  assert.equal(m.relinkPdf(p.id, 'D:\\Estudo\\Lei 8112.pdf'), true); assert.equal(m.meta.pdfs[0].path, 'D:\\Estudo\\Lei 8112.pdf');
  assert.equal(m.relinkPdf('nada', 'x'), false); assert.throws(() => m.addPdf({ path: '' }), /inválido/);
  assert.ok(m.undo()); assert.equal(m.meta.pdfs[0].path, 'C:\\Leis\\Lei 8112.pdf'); assert.ok(m.undo()); assert.equal((m.meta.pdfs || []).length, 0);
});

test('referências: anexar, remover, validar (PDF registrado, página, retângulos) e desfazer', () => {
  const { m, a } = mk(); const p = m.addPdf({ path: '/x/lei.pdf' });
  assert.equal(m.addRef(a.id, { pdf: p.id, ...REF }), true); assert.equal(m.find(a.id).node.refs.length, 1);
  assert.throws(() => m.addRef(a.id, { pdf: 'naoexiste', ...REF }), /não está registrado/);
  assert.throws(() => m.addRef(a.id, { pdf: p.id, page: 0, quote: 'x', rects: [] }), /inválida/);
  assert.equal(m.addRef('nada', { pdf: p.id, ...REF }), false);
  assert.equal(m.removeRef(a.id, 5), false); assert.equal(m.removeRef(a.id, 0), true); assert.equal(m.find(a.id).node.refs, undefined, 'sem referências, o campo some');
  assert.ok(m.undo()); assert.equal(m.find(a.id).node.refs.length, 1);
});

test('sanitizar: lixo, ids perigosos, páginas absurdas, retângulos fora de 0–1 e textos enormes', () => {
  assert.deepEqual(sanitizePdfs(null), []); assert.deepEqual(sanitizePdfs([{ id: '../x', path: 'a' }, { id: 'ok', path: '' }, { id: 'ok2', path: 'p' }, { id: 'ok2', path: 'dup' }, 5]), [{ id: 'ok2', name: 'p', path: 'p' }]);
  const r = sanitizeRefs([{ pdf: 'a"onload=', page: 1 }, { pdf: 'a', page: 1.5 }, { pdf: 'a', page: 1e9 }, { pdf: 'a', page: 3, quote: 'q'.repeat(9000), rects: [[2, -1, 5, 0.5], [0, 0, 0, 0], ['x'], [0.1, 0.1, 0.1]] }, null, 'x']);
  assert.equal(r.length, 1); assert.equal(r[0].quote.length, 2000); assert.deepEqual(r[0].rects, [[1, 0, 1, 0.5]], 'recortado para 0–1; vazios descartados');
  assert.equal(sanitizeRefs(Array.from({ length: 900 }, () => ({ pdf: 'a', page: 1 }))).length, 500);
  assert.equal(refLabel({ pdf: 'z', page: 4 }, []), 'PDF não vinculado, p. 4');
});

test('.mom: PDFs e referências sobrevivem a salvar/abrir; arquivo adulterado é saneado; mapa sem PDF não ganha campos', () => {
  const { m, a } = mk(); const p = m.addPdf({ path: '/x/lei.pdf', name: 'Lei 8.112' }); m.addRef(a.id, { pdf: p.id, ...REF });
  const back = readMom(writeMom(m));
  assert.deepEqual(back.meta.pdfs, m.meta.pdfs); assert.deepEqual(back.root.children[0].refs, m.find(a.id).node.refs);
  const plain = mk().m; const z = new AdmZip(writeMom(plain)); assert.doesNotMatch(z.readAsText('document.json'), /mcPdfs/); assert.doesNotMatch(z.readAsText('nodes.json'), /refs/);
  const zip = new AdmZip(writeMom(m)); const nodes = JSON.parse(zip.readAsText('nodes.json'));
  nodes.find((n) => n.title === 'Crase').mc.refs = [{ pdf: '<script>', page: 1 }, { pdf: p.id, page: -3 }, { pdf: p.id, page: 7, quote: 'ok', rects: [[0, 0, 0.5, 0.5]] }];
  zip.updateFile('nodes.json', Buffer.from(JSON.stringify(nodes)));
  const doc = JSON.parse(zip.readAsText('document.json')); doc.mcPdfs = [{ id: '..', path: 'x' }, ...doc.mcPdfs]; zip.updateFile('document.json', Buffer.from(JSON.stringify(doc)));
  const sane = readMom(zip.toBuffer()); assert.equal(sane.root.children[0].refs.length, 1); assert.equal(sane.root.children[0].refs[0].page, 7); assert.equal(sane.meta.pdfs.length, 1);
});
