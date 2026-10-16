#!/usr/bin/env node
'use strict';
// CLI: mindcraft <entrada.mom|.md|.opml> <saida.(pdf|docx|svg|md|opml|mom)> [--theme ocean|dark|paper|neon|mono] [--outline]
const fs = require('fs');
const path = require('path');
const { readMom, writeMom } = require('../core/mom');
const { fromMarkdown, fromOPML } = require('../core/import');
const { toSVG } = require('../core/svg');
const { toPDF, toDOCX, toMarkdown, toOPML } = require('../core/export');
const { THEMES } = require('../core/themes');

async function main(argv) {
  const args = argv.filter((a) => !a.startsWith('--'));
  const flag = (n) => argv.includes(`--${n}`);
  const ti = argv.indexOf('--theme');
  const theme = ti >= 0 ? argv[ti + 1] : undefined;
  if (args.length < 2 || (theme && !THEMES[theme])) {
    console.error('uso: mindcraft <entrada.mom> <saida.pdf|docx|svg|md|opml|mom> [--theme ' + Object.keys(THEMES).join('|') + '] [--outline]');
    return 1;
  }
  const [inp, out] = args.filter((a) => a !== theme);
  const inExt = path.extname(inp).slice(1).toLowerCase();
  const title = path.basename(inp, path.extname(inp));
  const map = inExt === 'md' ? fromMarkdown(fs.readFileSync(inp, 'utf8'), title)
    : inExt === 'opml' ? fromOPML(fs.readFileSync(inp, 'utf8'), title)
      : readMom(fs.readFileSync(inp));
  if (theme) map.meta.theme = theme;
  const ext = path.extname(out).slice(1).toLowerCase();
  const writers = {
    pdf: () => toPDF(map, { outline: flag('outline') }),
    docx: () => toDOCX(map),
    svg: () => toSVG(map),
    md: () => toMarkdown(map),
    opml: () => toOPML(map),
    mom: () => writeMom(map),
  };
  if (!writers[ext]) { console.error(`formato não suportado: .${ext}`); return 1; }
  fs.writeFileSync(out, await writers[ext]());
  console.log(`ok: ${out}`);
  return 0;
}

main(process.argv.slice(2)).then((c) => process.exit(c), (e) => { console.error(e.message); process.exit(1); });
