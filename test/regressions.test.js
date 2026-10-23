'use strict';
// Bugs reais já encontrados e corrigidos: cada um fica aqui para nunca mais voltar.
const test = require('node:test');
const assert = require('node:assert');
const AdmZip = require('adm-zip');
const { MindMap, createNode } = require('../core/model');
const { readMom, writeMom } = require('../core/mom');

test('texto com "tags" (ex.: matéria de Informática) NÃO é alterado ao salvar e reabrir o .mom — nem a cada ciclo', () => {
  const m = new MindMap(createNode('HTML'));
  const t = m.addChild(m.root.id, 'Tag <br> e <p> em HTML; <<b>b>; a < b > c'); m.update(t.id, { notes: 'Use <b>negrito</b> e <i>itálico</i>:\n```html\n<div class="x">oi</div>\n```' });
  let cur = m; for (let i = 0; i < 3; i++) cur = readMom(writeMom(cur));
  assert.equal(cur.root.children[0].title, 'Tag <br> e <p> em HTML; <<b>b>; a < b > c'); assert.equal(cur.root.children[0].notes, m.root.children[0].notes);
});

test('arquivos do Mindomo (sem a marca do MindCraft) continuam tendo a formatação HTML removida dos títulos e notas', () => {
  const m = new MindMap(createNode('R')); m.addChild(m.root.id, 'x');
  const z = new AdmZip(writeMom(m)); const doc = JSON.parse(z.readAsText('document.json')); delete doc.mcWriter; z.updateFile('document.json', Buffer.from(JSON.stringify(doc)));
  const nodes = JSON.parse(z.readAsText('nodes.json')); nodes.find((n) => n.title === 'x').title = '<b>Negrito</b> e<br>quebra <C>'; nodes.find((n) => n.title !== undefined && n.parentId).notes = { text: '<p>texto</p>' };
  z.updateFile('nodes.json', Buffer.from(JSON.stringify(nodes)));
  const back = readMom(z.toBuffer()); assert.equal(back.root.children[0].title, 'Negrito e\nquebra <C>'); assert.equal(back.root.children[0].notes, 'texto');
});

test('HUD de apresentação: elementos de controle e saída presentes no index.html', () => {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'renderer', 'index.html'), 'utf-8');
  assert.ok(html.includes('id="presentPrev"'), 'botão anterior da apresentação presente');
  assert.ok(html.includes('id="presentNext"'), 'botão próximo da apresentação presente');
  assert.ok(html.includes('id="presentExit"'), 'botão sair da apresentação presente');
  assert.ok(html.includes('id="presentCur"'), 'contador atual da apresentação presente');
  assert.ok(html.includes('id="presentTotal"'), 'contador total da apresentação presente');
  assert.ok(html.includes('present-ui.js'), 'script present-ui.js carregado no index.html');
});

test('Navegador Web: sanitização bloqueia protocolos perigosos e normaliza links', () => {
  const sanitize = (raw) => {
    let url = (raw || '').trim();
    if (/^(javascript|data|vbscript):/i.test(url)) return null;
    if (url === 'about:blank') return url;
    if (!/^https?:\/\//i.test(url)) {
      if (url.includes('.') && !url.includes(' ')) url = 'https://' + url;
      else url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
    }
    return url;
  };
  assert.equal(sanitize('javascript:alert(1)'), null);
  assert.equal(sanitize('data:text/html,<h1>XSS</h1>'), null);
  assert.equal(sanitize('vbscript:msgbox(1)'), null);
  assert.equal(sanitize('www.qconcursos.com'), 'https://www.qconcursos.com');
  assert.equal(sanitize('direito administrativo'), 'https://www.google.com/search?q=direito%20administrativo');
  assert.equal(sanitize('https://planalto.gov.br'), 'https://planalto.gov.br');
});

