'use strict';
// Executor da bateria Android (emulador ligado, nada em paralelo): roda test-android.js em BLOCOS (cada um é um processo novo, com a saída em arquivo)
// e junta o resultado. Um processo único e longo já foi encerrado no meio por ferramentas/sessões (e acumula estado do emulador); blocos curtos não.
// Um bloco que falha é repetido UMA vez: se passar, fica registrado como INSTÁVEL (aparece no resumo — nada é escondido).
// Uso: node scripts/run-android.js [n,n,...]   (sem argumento = todos os testes)
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOTAL = 21;                                                  // quantidade de testes de test-android.js (mantenha igual ao arquivo; conferido no fim)
const BLOCKS = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14], [15, 16, 17, 18], [19, 20, 21]];
const wanted = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
const LOGS = path.join(__dirname, '..', '..', 'evidencias', 'logs', 'android'); fs.mkdirSync(LOGS, { recursive: true });

const runBlock = (ids, attempt) => {
  const log = path.join(LOGS, `blocos-${ids[0]}-${ids[ids.length - 1]}${attempt > 1 ? '.2' : ''}.log`), fd = fs.openSync(log, 'w');
  let r; try { r = spawnSync(process.execPath, [path.join(__dirname, 'test-android.js')], { stdio: ['ignore', fd, fd], timeout: 12 * 60 * 1000, killSignal: 'SIGKILL', env: { ...process.env, ANDROID_ONLY: ids.join(',') } }); } finally { fs.closeSync(fd); }
  const out = fs.readFileSync(log, 'utf8'), lines = out.split('\n');
  // testes que NÃO estão no bloco entram como "ok" em branco no contador do script; só valem as linhas impressas (ok/FAIL)
  const ok = lines.filter((l) => /^ {2}ok {3}/.test(l)), fail = lines.filter((l) => /^ {2}FAIL /.test(l));
  const done = ok.length + fail.length;
  return { ok: ok.length, fail, out, log, complete: done === ids.length && !fail.length && r.status === 0, timedOut: !!(r.error && r.error.code === 'ETIMEDOUT') };
};

let passed = 0, ran = 0; const flaky = [], bad = [], t0 = Date.now();
for (const ids0 of BLOCKS) {
  const ids = wanted ? ids0.filter((n) => wanted.includes(n)) : ids0; if (!ids.length) continue;
  let r = runBlock(ids, 1), retried = false;
  if (!r.complete) { console.log(`  ↻ testes ${ids.join(',')}: ${r.ok}/${ids.length} ok${r.timedOut ? ' (TRAVOU)' : ''}; repetindo uma vez…\n${r.fail.map((l) => '      ' + l.slice(0, 200)).join('\n')}`); retried = true; r = runBlock(ids, 2); }
  ran += ids.length; passed += r.ok;
  if (r.complete) { if (retried) flaky.push(ids.join(',')); console.log(`ok   testes ${ids.join(',').padEnd(18)} ${r.ok}/${ids.length}${retried ? '   [INSTÁVEL: passou só na 2ª tentativa]' : ''}`); }
  else { bad.push(ids.join(',')); console.log(`FAIL testes ${ids.join(',')}: ${r.ok}/${ids.length}\n${r.fail.map((l) => '      ' + l.slice(0, 300)).join('\n')}\n      (log: ${path.relative(process.cwd(), r.log)})`); }
}
if (!wanted && ran !== TOTAL) { console.log(`ATENÇÃO: o executor conhece ${TOTAL} testes mas os blocos somam ${ran}; ajuste TOTAL/BLOCKS.`); bad.push('contagem'); }
console.log(`\n${passed}/${ran} testes Android passaram em ${Math.round((Date.now() - t0) / 60000)} min` + (flaky.length ? `\nINSTÁVEIS (passaram na 2ª tentativa): blocos ${flaky.join(' | ')}` : '') + (bad.length ? `\nREPROVADOS: blocos ${bad.join(' | ')}` : ''));
process.exit(bad.length ? 1 : 0);
