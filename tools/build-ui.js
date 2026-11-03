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
}).then(async () => {
  // worker do PDF.js (leitura/decodificação fora da tela principal) e o CSS da camada de texto selecionável
  await esbuild.build({ entryPoints: [path.join(root, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs')], bundle: true, outfile: path.join(path.dirname(out), 'pdf.worker.js'), format: 'iife', platform: 'browser', target: 'chrome130', legalComments: 'none', logLevel: 'warning' });
  const css = fs.readFileSync(path.join(root, 'node_modules', 'pdfjs-dist', 'web', 'pdf_viewer.css'), 'utf8').split(/\r?\n/);
  const from = css.findIndex((l) => l.startsWith('.textLayer{')), to = css.findIndex((l) => l.startsWith('.annotationLayer{'));
  if (from < 0 || to < from) throw new Error('CSS da camada de texto do PDF.js não encontrado (versão diferente?)');
  fs.writeFileSync(path.join(path.dirname(out), 'pdf.css'), css.slice(from, to).join('\n'));
  // rede 3D: 3d-force-graph (com three.js) em pacote próprio, carregado só quando a janela da Rede existe
  await esbuild.build({ entryPoints: [path.join(root, 'renderer', 'react', 'graph3d.js')], bundle: true, outfile: path.join(path.dirname(out), 'graph3d.js'), format: 'iife', platform: 'browser', target: 'chrome130', define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'none', logLevel: 'warning' });
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`interface React empacotada: ${path.relative(root, out)} (${kb} KB)`);
}, () => process.exit(1));
