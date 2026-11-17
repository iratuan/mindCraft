'use strict';
// TESTES DE ARQUITETURA: transformam as regras do projeto (docs/ARCHITECTURE.md) em verificações automáticas.
// Se um deles falhar, a mensagem diz qual regra foi quebrada e como corrigir. Vários desses defeitos já aconteceram de verdade
// (módulo novo do núcleo fora do pacote do tablet; canal de comunicação sem tratador), por isso estão aqui.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const rd = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');
const ls = (dir, re) => (fs.existsSync(path.join(ROOT, dir)) ? fs.readdirSync(path.join(ROOT, dir)).filter((f) => re.test(f)) : []);
const tree = (dir, re) => {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.posix.join(dir, entry.name);
    return entry.isDirectory() ? tree(relative, re) : re.test(entry.name) ? [relative] : [];
  });
};
const lines = (...p) => rd(...p).split('\n');
/** Remove comentários de linha/bloco para não confundir texto de documentação com código. */
const code = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');

const CORE_MODULES = tree('core', /\.js$/).map((f) => f.slice(5, -3));
const CORE_NAMES = CORE_MODULES.map((m) => path.posix.basename(m));
// módulos do núcleo que só existem no computador (usam http/https do Node); o tablet usa platform/web/host/net.js no lugar
const NODE_ONLY = ['net-node'];
// canais de comunicação que são só avisos para o processo principal do Electron e não têm equivalente no tablet
const DESKTOP_ONLY_CHANNELS = ['dirty', 'close-now'];

test('núcleo (core/) não depende de Electron, DOM, interface nem plataforma', () => {
  const bad = [];
  for (const m of CORE_MODULES) {
    const src = code(rd('core', ...`${m}.js`.split('/')));
    if (/require\(['"]electron['"]\)/.test(src)) bad.push(`${m}: usa Electron`);
    if (/\bipcRenderer\b/.test(src)) bad.push(`${m}: usa ipcRenderer`);
    if (/\b(document|window)\.(getElementById|querySelector|createElement|body|addEventListener|location|localStorage)\b/.test(src)) bad.push(`${m}: toca o DOM`);
    for (const r of src.matchAll(/require\(['"](\.\.?\/[^'"]+)['"]\)/g)) {
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(m), r[1]));
      if (/^(?:\.\.\/)+(renderer|electron|platform|tablet|tools|test)(?:\/|$)/.test(target)) bad.push(`${m}: importa ${r[1]} (camada acima)`);
    }
  }
  assert.deepStrictEqual(bad, [], 'O núcleo deve ser portável (Node e navegador). Mova a parte de interface para renderer/ ou platform/.');
});

test('núcleo (core/) não tem dependências circulares', () => {
  const deps = Object.fromEntries(CORE_MODULES.map((m) => [m, [...code(rd('core', ...`${m}.js`.split('/'))).matchAll(/require\(['"](\.\.?\/[^'"]+)['"]\)/g)]
    .map((x) => path.posix.normalize(path.posix.join(path.posix.dirname(m), x[1])).replace(/\.js$/, ''))
    .filter((name) => CORE_MODULES.includes(name))]));
  const cycles = [], done = new Set(), stack = [];
  const visit = (n) => { if (stack.includes(n)) { cycles.push([...stack.slice(stack.indexOf(n)), n].join(' → ')); return; } if (done.has(n)) return; done.add(n); stack.push(n); for (const d of deps[n] || []) visit(d); stack.pop(); };
  CORE_MODULES.forEach(visit);
  assert.deepStrictEqual([...new Set(cycles)], [], 'Ciclo entre módulos do núcleo: extraia o que é comum para um terceiro módulo.');
});


test('a interface só pede ao núcleo módulos que existem; os exclusivos do computador ficam atrás da guarda do tablet', () => {
  const missing = [];
  for (const f of ls('renderer', /\.js$/)) for (const r of rd('renderer', f).matchAll(/path\.join\(core, '([a-z-]+)'\)/g)) if (!CORE_NAMES.includes(r[1])) missing.push(`${f}: ${r[1]}`);
  assert.deepStrictEqual(missing, []);
  for (const f of ls('renderer', /\.js$/)) {
    const s = rd('renderer', f);
    for (const n of NODE_ONLY) if (s.includes(`'${n}'`)) assert.ok(/IS_HOST\s*\?/.test(s), `${f} usa o módulo exclusivo do computador "${n}" sem a guarda IS_HOST (quebra no tablet)`);
  }
});

test('módulos estão organizados por responsabilidade e o tablet empacota os caminhos organizados', () => {
  assert.deepStrictEqual(['components', 'formats', 'services', 'utils'].filter((d) => !fs.existsSync(path.join(ROOT, 'core', d))), []);
  assert.deepStrictEqual(ls('core', /\.js$/), [], 'A raiz de core/ não deve conter módulos soltos.');
  const build = rd('tablet', 'scripts', 'build-www.js');
  assert.match(build, /const visit = \(dir\)/, 'o empacotador precisa percorrer as pastas do núcleo');
  for (const m of CORE_MODULES) assert.ok(fs.existsSync(path.join(ROOT, 'core', ...`${m}.js`.split('/'))), `módulo ausente: ${m}`);
});


test('index.html: todo script existe e a ordem de carga respeita as dependências (renderer.js primeiro, bundle React por último)', () => {
  const html = rd('renderer', 'index.html'), src = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  for (const s of src) if (!s.startsWith('bundle/')) assert.ok(fs.existsSync(path.join(ROOT, 'renderer', s)), `script ausente: ${s}`);
  assert.ok(src.indexOf('renderer.js') < src.indexOf('graph-ui.js'), 'renderer.js deve vir antes dos demais scripts');
  assert.strictEqual(src[src.length - 1], 'bundle/react-ui.js', 'o bundle React deve ser o último');
});

test('orçamento de tamanho: nenhum arquivo cresce sem limite (divida antes de passar)', () => {
  const budget = [['core', /\.js$/, 600], ['renderer', /\.js$/, 1000], ['renderer/react', /\.jsx?$/, 500], ['electron', /\.js$/, 400], ['platform/web', /\.js$/, 400], ['platform/web/host', /\.js$/, 400], ['tools', /\.js$/, 300]];
  const over = [];
  for (const [dir, re, max] of budget) {
    const files = dir === 'core' ? tree(dir, re) : ls(dir, re).map((f) => path.posix.join(dir, f));
    for (const f of files) { const n = lines(f).length; if (n > max) over.push(`${f}: ${n} linhas (limite ${max})`); }
  }
  assert.deepStrictEqual(over, [], 'Arquivo grande demais: extraia uma responsabilidade para um módulo próprio (ver docs/ARCHITECTURE.md).');
});

test('sem resíduos de depuração nem execução dinâmica de código no código de produção', () => {
  const bad = [];
  const dirs = ['core', 'renderer', 'renderer/react', 'electron', 'platform/web', 'platform/web/host'];
  for (const d of dirs) {
    const files = d === 'core' ? tree(d, /\.(js|jsx)$/) : ls(d, /\.(js|jsx)$/).map((f) => path.posix.join(d, f));
    for (const f of files) {
      const src = code(rd(f));
      if (/\bconsole\.log\(/.test(src)) bad.push(`${f}: console.log`);
      if (/\bdebugger\b/.test(src)) bad.push(`${f}: debugger`);
      if (/\beval\(|new Function\(/.test(src)) bad.push(`${f}: eval/new Function`);
      if (rd(f).split('\n').some((l) => l.length > 450)) bad.push(`${f}: linha com mais de 450 colunas`);
    }
  }
  assert.deepStrictEqual(bad, []);
});

test('versões do aplicativo e do projeto do tablet andam juntas; documentos obrigatórios existem', () => {
  const app = JSON.parse(rd('package.json'));
  assert.match(app.version, /^\d+\.\d+\.\d+$/, 'versão do app deve ser X.Y.Z');
  for (const f of ['README.md', 'CLAUDE.md', 'docs/ARCHITECTURE.md', 'docs/TESTING.md', 'docs/CONTRIBUTING.md', 'docs/DECISIONS.md']) assert.ok(fs.existsSync(path.join(ROOT, f)), `documento obrigatório ausente: ${f}`);
});

test('todo módulo do núcleo tem teste unitário que o importa', () => {
  const tests = ls('test', /\.test\.js$/).map((f) => rd('test', f)).join('\n');
  assert.deepStrictEqual(CORE_NAMES.filter((m) => !new RegExp(`core/(?:components|formats|services|utils)/${m}'`).test(tests)), [], 'Módulo de core/ sem teste unitário: escreva test/<módulo>.test.js.');
});
