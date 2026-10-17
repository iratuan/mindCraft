'use strict';
/**
 * Monta o app web/tablet em build/web/app/ a partir dos MESMOS arquivos da interface do desktop (renderer/), sem copiá-los à mão:
 *   index.html (gerado do renderer/index.html) + scripts da interface + style.css + bundle React/PDF  (copiados)
 *   core-browser.js (núcleo com adaptadores)  +  host.js (emulação do Electron)  +  SQLite WebAssembly.
 * Nada em renderer/, core/ ou electron/ é alterado: o desktop continua exatamente como está.
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const { build: buildCore } = require('./build-web-core');

const root = path.join(__dirname, '..');
const out = path.join(root, 'build', 'web', 'app');

function copyDir(from, to) { fs.mkdirSync(to, { recursive: true }); for (const e of fs.readdirSync(from, { withFileTypes: true })) { const a = path.join(from, e.name), b = path.join(to, e.name); if (e.isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b); } }

async function buildApp({ dir = out } = {}) {
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(path.join(root, 'renderer', 'bundle', 'react-ui.js'))) require('child_process').execFileSync(process.execPath, [path.join(__dirname, 'build-ui.js')], { stdio: 'inherit' });
  await buildCore('browser', { outfile: path.join(dir, 'core-browser.js') });
  await esbuild.build({ entryPoints: [path.join(root, 'platform', 'web', 'host', 'index.js')], bundle: true, platform: 'browser', format: 'iife', outfile: path.join(dir, 'host.js'), logLevel: 'silent', legalComments: 'none', loader: { '.css': 'text' } });

  // interface (a mesma do desktop)
  for (const f of fs.readdirSync(path.join(root, 'renderer')).filter((n) => n.endsWith('.js') || n.endsWith('.css'))) fs.copyFileSync(path.join(root, 'renderer', f), path.join(dir, f));
  copyDir(path.join(root, 'renderer', 'bundle'), path.join(dir, 'bundle'));
  for (const f of ['sql-wasm-browser.js', 'sql-wasm-browser.wasm']) fs.copyFileSync(path.join(root, 'node_modules', 'sql.js', 'dist', f), path.join(dir, f));

  // index.html: mesmos elementos; os <script> da interface passam a ser carregados pelo hospedeiro, DEPOIS de preparar o ambiente
  let html = fs.readFileSync(path.join(root, 'renderer', 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  if (!scripts.length) throw new Error('index.html sem scripts: o montador precisa ser atualizado');
  html = html.replace(/<script src="[^"]+"><\/script>\s*/g, '');
  html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, interactive-widget=resizes-content">');
  html = html.replace('</body>', `<script>window.__MC_APP_SCRIPTS = ${JSON.stringify(scripts)};</script>\n<script src="core-browser.js"></script>\n<script src="host.js"></script>\n</body>`);
  html = html.replace('</head>', '<link rel="icon" type="image/png" href="icon.png">\n</head>');
  fs.copyFileSync(path.join(root, 'build', 'icon.png'), path.join(dir, 'icon.png'));
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  fs.writeFileSync(path.join(dir, 'app-info.json'), JSON.stringify({ builtAt: new Date().toISOString(), scripts }, null, 2));
  return { dir, scripts };
}

if (require.main === module) buildApp().then((r) => { const size = (d) => fs.readdirSync(d, { withFileTypes: true }).reduce((a, e) => a + (e.isDirectory() ? size(path.join(d, e.name)) : fs.statSync(path.join(d, e.name)).size), 0); console.log(`app web montado em ${path.relative(root, r.dir)} (${Math.round(size(r.dir) / 1024)} KB); scripts da interface: ${r.scripts.join(', ')}`); }).catch((e) => { console.error('FALHA:', e.errors ? e.errors.map((x) => x.text).join('; ') : e.message); process.exit(1); });
module.exports = { buildApp };
