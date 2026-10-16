'use strict';
// Gera renderer/bundle/react-ui.js a partir de renderer/react/*.jsx (React empacotado; nada é baixado em tempo de execução).
const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

const root = path.join(__dirname, '..');
const out = path.join(root, 'renderer', 'bundle', 'react-ui.js');
fs.mkdirSync(path.dirname(out), { recursive: true });
esbuild.build({
  entryPoints: [path.join(root, 'renderer', 'react', 'index.jsx')],
  bundle: true, outfile: out, format: 'iife', platform: 'browser', target: 'chrome130',
  jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'none', logLevel: 'warning',
}).then(() => {
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`interface React empacotada: ${path.relative(root, out)} (${kb} KB)`);
}, () => process.exit(1));
