'use strict';
// Mostra, com o CONTEÚDO completo, os erros de console da página do app no Android enquanto você executa uma ação (expressão JS) ou recarrega.
//   node scripts/console-errors.js "expressão a executar depois de ligar o monitor" [segundos]
const { connect } = require('./cdp');
(async () => {
  const c = await connect(); await c.send('Runtime.enable'); await c.send('Log.enable');
  const preview = (a) => { if (a.value !== undefined) return String(a.value); if (a.preview && a.preview.properties) return '{' + a.preview.properties.map((p) => p.name + ': ' + (p.value ?? p.type)).join(', ') + '}'; return a.description || a.type; };
  if (process.argv[2]) { try { await c.ev(process.argv[2]); } catch (e) { console.log('(a expressão lançou: ' + e.message.slice(0, 200) + ')'); } }
  await new Promise((r) => setTimeout(r, (Number(process.argv[3]) || 3) * 1000));
  for (const e of c.events) {
    if (e.method === 'Runtime.consoleAPICalled' && (e.params.type === 'error' || e.params.type === 'warning')) console.log('[console.' + e.params.type + ']', e.params.args.map(preview).join(' | ').slice(0, 600), e.params.stackTrace ? '@ ' + (e.params.stackTrace.callFrames[0] || {}).url + ':' + (e.params.stackTrace.callFrames[0] || {}).lineNumber : '');
    else if (e.method === 'Runtime.exceptionThrown') console.log('[EXCEÇÃO]', (e.params.exceptionDetails.exception && e.params.exceptionDetails.exception.description || e.params.exceptionDetails.text).slice(0, 500));
    else if (e.method === 'Log.entryAdded' && e.params.entry.level === 'error') console.log('[log.error]', e.params.entry.text.slice(0, 300), e.params.entry.url || '');
  }
  c.close(); process.exit(0);
})().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
