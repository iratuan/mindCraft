'use strict';
// Executor da bateria ponta a ponta (npm run e2e). Fonte ÚNICA da lista de etapas.
// Cada etapa é um script Electron (test/e2e-*.js) e grava a saída em evidencias/logs/e2e/<etapa>.log (aparece mesmo se a etapa travar).
// Uma etapa que falha é repetida UMA vez: se passar na 2ª, fica registrada como INSTÁVEL (aparece no resumo — nada é escondido);
// se falhar de novo, reprova (e mostra as últimas linhas do log, que dizem em que teste parou). Uma etapa que passa de 8 min é encerrada.
// Uso: node tools/run-e2e.js [regex das etapas]   ·   E2E_TRACE=1 mostra o teste em andamento no log   ·   E2E_PROGRESS=1 imprime a hora de cada etapa
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const STEPS = [
  'e2e.js', 'e2e-study.js', 'e2e-network.js', 'e2e-assistant.js', 
  'e2e-notes.js', 'e2e-library.js', 'e2e-pdf.js', 'e2e-review.js', 'e2e-errors.js', 'e2e-perf.js', 'e2e-monkey.js', 'e2e-home.js', 'e2e-simulados.js',
  'e2e-hostile.js', 'e2e-failures.js', 'e2e-layout.js', 'e2e-a11y.js', 'e2e-deep.js', 'e2e-questions.js', 'e2e-notify.js',
  'e2e-web.js', 'e2e-edit.js', 'e2e-tablet.js', 'e2e-sync.js', 'e2e-sync-web.js', 'e2e-mindomo.js', 'e2e-soltos.js', 'e2e-graph.js', 'e2e-reorder.js', 'e2e-saveas.js', 'e2e-manual.js', 'e2e-split.js', 'e2e-homecards.js', 'e2e-backupdest.js', 'e2e-paste.js',
];
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const electron = require('electron');
const LOGS = path.join(__dirname, '..', 'evidencias', 'logs', 'e2e'); fs.mkdirSync(LOGS, { recursive: true });
const TIMEOUT = 8 * 60 * 1000;

// Testes de TOQUE (web-harness: toques reais via Input.dispatchTouchEvent) travam de vez em quando se a janela estiver escondida (o Chromium não
// processa a entrada de uma janela oculta); eles rodam com a janela VISÍVEL. Os demais rodam escondidos para não atrapalhar quem está usando o computador.
const needsWindow = (file) => { try { return /web-harness/.test(fs.readFileSync(path.join(__dirname, '..', 'test', file), 'utf8')); } catch { return false; } };

const run = (step, attempt) => {
  const [file, ...flags] = step.split(' ');
  const log = path.join(LOGS, step.replace(/[^a-z0-9.-]+/gi, '_') + (attempt > 1 ? '.2' : '') + '.log'), fd = fs.openSync(log, 'w');
  let r; try { r = spawnSync(electron, [path.join(__dirname, '..', 'test', file), ...flags], { stdio: ['ignore', fd, fd], windowsHide: !needsWindow(file), timeout: TIMEOUT, killSignal: 'SIGKILL', env: { ...process.env, E2E_TRACE: '1' } }); } finally { fs.closeSync(fd); }
  const out = fs.readFileSync(log, 'utf8');
  const m = [...out.matchAll(/(\d+)\/(\d+) passaram/g)].pop(), timedOut = !!(r.error && r.error.code === 'ETIMEDOUT');
  return { ok: r.status === 0 && !!m && m[1] === m[2], out, log, summary: m ? `${m[1]}/${m[2]}` : (timedOut ? 'TRAVOU (passou de 8 min)' : 'sem resultado (código ' + r.status + ')') };
};
const tail = (out) => out.split('\n').filter((l) => l.trim()).slice(-6).map((l) => '      ' + l.slice(0, 200)).join('\n');

const flaky = [], failed = [], t0 = Date.now();
for (const step of STEPS.filter((s) => !only || only.test(s))) {
  if (process.env.E2E_PROGRESS) console.log(`  … ${new Date().toLocaleTimeString('pt-BR')} ${step}`);
  let r = run(step, 1), retried = false;
  if (!r.ok) { console.log(`  ↻ ${step}: falhou (${r.summary}); repetindo uma vez…\n${tail(r.out)}`); retried = true; r = run(step, 2); }
  if (r.ok) { if (retried) flaky.push(step); console.log(`ok   ${step.padEnd(30)} ${r.summary}${retried ? '   [INSTÁVEL: passou só na 2ª tentativa]' : ''}`); }
  else { failed.push(step); console.log(`FAIL ${step.padEnd(30)} ${r.summary}\n${tail(r.out)}\n      (log completo: ${path.relative(process.cwd(), r.log)})`); }
}
console.log(`\n${STEPS.filter((s) => !only || only.test(s)).length - failed.length}/${STEPS.filter((s) => !only || only.test(s)).length} etapas passaram em ${Math.round((Date.now() - t0) / 60000)} min` + (flaky.length ? `\nINSTÁVEIS (passaram na 2ª tentativa — investigar se repetirem): ${flaky.join(', ')}` : '') + (failed.length ? `\nREPROVADAS: ${failed.join(', ')}` : ''));
process.exit(failed.length ? 1 : 0);
