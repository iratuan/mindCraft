'use strict';
/**
 * Empacota o núcleo (core/) com os adaptadores da versão web/Android (platform/web/):
 *   - build/web/parity-core.js  → roda no Node, mas com crypto/zip/SQLite SUBSTITUTOS. Serve para provar equivalência:
 *                                 `npm run test:web` executa os mesmos testes unitários do desktop contra ele.
 *   - build/web/core-browser.js → para o navegador/Android (sem Node): `npm run build:web`.
 * Nada disso altera o desktop: o app Electron continua usando core/ diretamente.
 */
const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

const root = path.join(__dirname, '..');
const W = (f) => path.join(root, 'platform', 'web', f);
const out = path.join(root, 'build', 'web');

/** Módulos do núcleo que fazem parte da versão web (os que dependem de pastas do sistema ficam de fora). */
const MODULES = ['study', 'model', 'mom', 'library', 'graph', 'markdown', 'csv', 'templates', 'templates-data', 'planner', 'simulados', 'report', 'layout', 'svg', 'notify', 'settings', 'pdfrefs', 'ics', 'links', 'mentions', 'markers', 'themes', 'forcelayout', 'import', 'edital', 'export', 'vault', 'obsidian', 'errorlog', 'backup', 'manual', 'backup-reminder', 'glance', 'sync', 'sync-folder', 'sync-drive', 'oauth-device', 'bancas', 'mindomo', 'text', 'graph-labels', 'videorefs'];

const entry = (extra = '') => MODULES.map((m) => `${JSON.stringify(m)}: require(${JSON.stringify(path.join(root, 'core', m + '.js'))})`).join(',\n  ') + extra;

async function build(mode, { outfile } = {}) {
  fs.mkdirSync(out, { recursive: true });
  const common = { bundle: true, logLevel: 'silent', legalComments: 'none', sourcemap: false };
  const alias = { 'node:sqlite': W('sqlite.js'), 'adm-zip': W('adm-zip.js'), crypto: W('crypto.js'), 'node:crypto': W('crypto.js') };
  const NO_PDF = W('pdfkit-stub.js');
  const stdin = (code) => ({ contents: code, resolveDir: root, loader: 'js' });
  if (mode === 'parity') {
    return esbuild.build({ ...common, platform: 'node', format: 'cjs', outfile: outfile || path.join(out, 'parity-core.js'), alias, external: ['docx', 'pdfkit'],
      stdin: stdin(`module.exports = {\n  ${entry(`,\n  __sqlite: require(${JSON.stringify(W('sqlite.js'))})`)}\n};`) });
  }
  if (mode === 'browser') {
    return esbuild.build({ ...common, platform: 'browser', format: 'iife', globalName: 'MindCore', outfile: outfile || path.join(out, 'core-browser.js'),
      alias: { ...alias, pdfkit: NO_PDF, fs: W('fs.js'), path: W('path.js'), os: W('os.js'), zlib: W('empty.js'), 'node:fs': W('fs.js'), 'node:path': W('path.js') },
      inject: [W('globals.js')], define: { 'process.env.NODE_ENV': '"production"' },
      stdin: stdin(`module.exports = {\n  ${entry(`,\n  __sqlite: require(${JSON.stringify(W('sqlite.js'))}),\n  __fs: require(${JSON.stringify(W('fs.js'))}),\n  __path: require(${JSON.stringify(W('path.js'))})`)}\n};`) });
  }
  throw new Error('modo desconhecido: ' + mode);
}

if (require.main === module) {
  (async () => {
    const modes = process.argv.slice(2).length ? process.argv.slice(2) : ['parity', 'browser'];
    for (const m of modes) {
      try { await build(m); const f = m === 'parity' ? 'parity-core.js' : 'core-browser.js'; console.log(`núcleo web (${m}): build/web/${f} (${Math.round(fs.statSync(path.join(out, f)).size / 1024)} KB)`); }
      catch (e) { console.error(`FALHA no modo ${m}:`); for (const x of (e.errors || [e])) console.error('  ', x.text || x.message, x.location ? `(${x.location.file}:${x.location.line})` : ''); process.exitCode = 1; }
    }
  })();
}
module.exports = { build, MODULES };
