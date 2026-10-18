'use strict';
// Executor da bateria ponta a ponta (npm run e2e). Fonte ÚNICA da lista de etapas (antes era uma linha gigante de "&&" no package.json).
// Cada etapa é um script Electron (test/e2e-*.js [--classic]). Uma etapa que falha é repetida UMA vez: se passar na 2ª, fica registrada como
// INSTÁVEL (aparece no resumo e no log — nada é escondido); se falhar de novo, a bateria reprova. Falhas reais não passam por "sorte" duas vezes.
const { spawnSync } = require('child_process');
const path = require('path');

const STEPS = [
  'e2e.js', 'e2e.js --classic', 'e2e-study.js', 'e2e-study.js --classic', 'e2e-network.js', 'e2e-network.js --classic', 'e2e-assistant.js', 'e2e-assistant.js --classic',
  'e2e-notes.js', 'e2e-library.js', 'e2e-library.js --classic', 'e2e-pdf.js', 'e2e-review.js', 'e2e-errors.js', 'e2e-perf.js', 'e2e-monkey.js', 'e2e-home.js', 'e2e-simulados.js',
  'e2e-hostile.js', 'e2e-failures.js', 'e2e-layout.js', 'e2e-a11y.js', 'e2e-deep.js', 'e2e-deep.js --classic', 'e2e-questions.js', 'e2e-questions.js --classic', 'e2e-notify.js',
  'e2e-web.js', 'e2e-edit.js', 'e2e-tablet.js', 'e2e-sync.js', 'e2e-sync-web.js', 'e2e-mindomo.js', 'e2e-graph.js', 'e2e-reorder.js', 'e2e-saveas.js', 'e2e-manual.js', 'e2e-split.js', 'e2e-homecards.js',
];
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const electron = require('electron');
const run = (step) => {
  const [file, ...flags] = step.split(' ');
  const r = spawnSync(electron, [path.join(__dirname, '..', 'test', file), ...flags], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, windowsHide: true, timeout: 600000, killSignal: 'SIGKILL' });
  const out = (r.stdout || '') + (r.stderr || '');
  const m = [...out.matchAll(/(\d+)\/(\d+) passaram/g)].pop();
  return { ok: r.status === 0 && !!m && m[1] === m[2], out, summary: m ? `${m[1]}/${m[2]}` : (r.error && r.error.code === 'ETIMEDOUT' ? 'TRAVOU (passou de 10 min)' : 'sem resultado (código ' + r.status + ')') };
};

const flaky = [], failed = [], t0 = Date.now();
for (const step of STEPS.filter((s) => !only || only.test(s))) {
  if (process.env.E2E_PROGRESS) console.log(`  … ${new Date().toLocaleTimeString('pt-BR')} ${step}`);
  let r = run(step), retried = false;
  if (!r.ok) { console.log(`  ↻ ${step}: falhou (${r.summary}); repetindo uma vez…`); retried = true; r = run(step); }
  if (r.ok) { if (retried) flaky.push(step); console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${step.padEnd(30)} ${r.summary}${retried ? '   [INSTÁVEL: passou só na 2ª tentativa]' : ''}`); }
  else { failed.push(step); console.log(`FAIL ${step.padEnd(30)} ${r.summary}\n${r.out.split('\n').filter((l) => /FAIL|FALHAS|esperado|Error/.test(l)).slice(0, 12).join('\n')}`); }
}
console.log(`\n${STEPS.length - failed.length}/${STEPS.length} etapas passaram em ${Math.round((Date.now() - t0) / 60000)} min` + (flaky.length ? `\nINSTÁVEIS (passaram na 2ª tentativa — investigar se repetirem): ${flaky.join(', ')}` : '') + (failed.length ? `\nREPROVADAS: ${failed.join(', ')}` : ''));
process.exit(failed.length ? 1 : 0);
