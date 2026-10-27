'use strict';
// Gera core/templates-data.js a partir de modelos/*.csv (os CSV são a fonte; NÃO edite o gerado à mão).
//   node tools/build-templates.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const DIR = path.join(root, 'modelos');
const OUT = path.join(root, 'core', 'templates-data.js');

function render() {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.csv')).sort();
  const items = files.map((f) => {
    const text = fs.readFileSync(path.join(DIR, f), 'utf8').replace(/^\uFEFF/, '');
    const lines = text.split(/\r?\n/).filter((l) => l.length);
    return '  { id: ' + JSON.stringify(f.replace(/\.csv$/, '')) + ', csv: [\n' + lines.map((l) => '    ' + JSON.stringify(l)).join(',\n') + ',\n  ] },';
  });
  return "'use strict';\n// GERADO por tools/build-templates.js a partir de modelos/*.csv. Não edite à mão: rode `node tools/build-templates.js`.\nmodule.exports = [\n" + items.join('\n') + '\n];\n';
}

if (require.main === module) {
  fs.writeFileSync(OUT, render(), 'utf8');
  console.log('gerado:', path.relative(root, OUT));
}
module.exports = { render };