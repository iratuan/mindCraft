'use strict';
/**
 * Monta tablet/www: a MESMA interface do desktop (renderer/), o núcleo (core/) empacotado e a camada do Android (tablet/shim).
 * Nada da interface é reescrito: a camada de substituição entra antes dos scripts e fornece require('electron'|'fs'|'path'),
 * process e __dirname. Rode com `npm run build:www` (dentro de tablet/) ou antes de `npx cap sync android`.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');        // raiz do projeto (renderer/, core/)
const TABLET = path.resolve(__dirname, '..');             // tablet/ (shim/, www/, android/)
const WWW = path.join(TABLET, 'www');
const BUILD = path.join(TABLET, 'build');
const esbuild = require(path.join(ROOT, 'node_modules', 'esbuild'));

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  }
}

/** Registro do núcleo: cada módulo de core/ vira um objeto que a interface pode pedir pelo nome (require(path.join(core, 'model'))). */
function writeCoreRegistry() {
  const names = fs.readdirSync(path.join(ROOT, 'core')).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3)).sort();
  const lines = names.map((n) => `  ${JSON.stringify(n)}: require(${JSON.stringify(path.join(ROOT, 'core', n + '.js').replace(/\\/g, '/'))}),`);
  fs.mkdirSync(BUILD, { recursive: true });
  fs.writeFileSync(path.join(BUILD, 'core-registry.js'), `'use strict';\n// Gerado por tablet/scripts/build-www.js: não editar.\nmodule.exports = {\n${lines.join('\n')}\n};\n`);
  return names.length;
}

function main() {
  fs.rmSync(WWW, { recursive: true, force: true });
  fs.mkdirSync(WWW, { recursive: true });

  // 1) a interface do desktop, sem alterações
  copyDir(path.join(ROOT, 'renderer'), WWW);

  // 2) camada do Android: CSS dos diálogos e do menu, e o pacote com o núcleo e os substitutos de Node
  fs.copyFileSync(path.join(TABLET, 'shim', 'tablet.css'), path.join(WWW, 'tablet.css'));
  const modules = writeCoreRegistry();
  const shim = (f) => path.join(TABLET, 'shim', f);
  esbuild.buildSync({
    entryPoints: [shim('entry.js')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    outfile: path.join(WWW, 'tablet-bundle.js'),
    alias: {
      fs: shim('fs-vfs.js'),
      path: shim('path.js'),
      crypto: shim('crypto.js'),
      buffer: path.join(TABLET, 'node_modules', 'buffer', 'index.js'),
      'adm-zip': shim('adm-zip.js'),
      'core-registry': path.join(BUILD, 'core-registry.js'),
    },
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'warning',
  });

  // 3) index.html: viewport e a camada entram antes de qualquer script da interface
  const html = fs.readFileSync(path.join(WWW, 'index.html'), 'utf8');
  let out = html;
  if (!/name="viewport"/.test(out)) out = out.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">');
  out = out.replace('</head>', '<link rel="stylesheet" href="tablet.css">\n</head>');
  // rodapé da abertura com a versão da release (package.json)
  const appVersion = JSON.parse(fs.readFileSync(path.join(TABLET, 'package.json'), 'utf8')).version;
  out = out.replace(/(id="splashVersion">)[^<]*/, `$1BRANIAC · v${appVersion}`);
  const firstScript = out.indexOf('<script');
  if (firstScript < 0) throw new Error('index.html sem scripts: não dá para inserir a camada do Android');
  out = out.slice(0, firstScript) + '<script src="tablet-bundle.js"></script>\n' + out.slice(firstScript);
  fs.writeFileSync(path.join(WWW, 'index.html'), out);

  console.log(`www pronto: interface do desktop + ${modules} módulos do núcleo + camada do Android.`);
}

main();
