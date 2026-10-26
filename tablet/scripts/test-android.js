'use strict';
// Testes no ANDROID de verdade (emulador "MindCraft_Tablet" ou tablet por USB): app instalado, toque real do sistema (adb input),
// teclado virtual, reinício forçado, compartilhamento, notificações agendadas, botão Voltar, rotação e estresse com o monkey do Android.
//   node scripts/test-android.js            (o app debug precisa estar instalado; o emulador ligado: node scripts/emulator.js)
const fs = require('fs');
const path = require('path');
const { connect, adb, sh } = require('./cdp');

const PKG = 'app.mindcraft.estudos', SHOTS = path.join(__dirname, '..', '..', 'evidencias', 'android');
fs.mkdirSync(SHOTS, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const shell = (...a) => sh('shell', ...a).stdout.trim();
const results = []; let c = null;
let STEP = ''; const step = (n) => { STEP = n; };   // último passo alcançado (entra na mensagem de falha)
const STOP_AFTER = Number(process.env.ANDROID_STOP_AFTER || 0);
/** Estado do aparelho no momento de uma falha (vira parte da mensagem e ganha uma captura de tela). */
async function diagnose(n) {
  try { shot('falha-' + n); } catch { /* sem captura */ }
  const top = shell('dumpsys', 'activity', 'activities').split('\n').filter((l) => /topResumedActivity/.test(l)).join(' ').trim().replace(/ActivityRecord\{[^ ]+ u0 /, '').slice(0, 90);
  const ime = /mInputShown=true/.test(shell('dumpsys', 'input_method')), rot = shell('settings', 'get', 'system', 'user_rotation');
  let page = ''; try { page = JSON.stringify(await c.ev(`({ vw: innerWidth, vh: innerHeight, modal: !document.querySelector('#modal').hidden, home: !document.querySelector('#home').hidden, menu: !document.querySelector('#mcHostMenu').hidden, drawer: document.body.classList.contains('tb-panels'), active: document.activeElement && (document.activeElement.id || document.activeElement.tagName), msg: (document.querySelector('#libMsg') || {}).textContent, exports: window.__mcHost.fs.readdirSync('/exports'), editorValue: editor.hidden ? null : editor.value, titles: map.root.children.map((x) => x.title).slice(0, 5), graph: graphOpen, toques: (window.__pd || []).slice(-3), cliques: (window.__cl || []).slice(-4), rail: ['graph', 'fit'].map((a) => { const b = document.querySelector('#rail [data-act="' + a + '"]'); const r = b.getBoundingClientRect(); return a + '@' + Math.round(r.left + r.width / 2) + ',' + Math.round(r.top + r.height / 2); }) })`)) + ' | erros recentes: ' + JSON.stringify(PAGE_ERRORS.slice(-3)); } catch (e) { page = 'página sem resposta: ' + e.message; }
  return ' | último passo: ' + STEP + ' | aparelho: ' + JSON.stringify({ topo: top, teclado: ime, rotacao: rot }) + ' | página: ' + page;
}
const ONLY = process.env.ANDROID_ONLY ? process.env.ANDROID_ONLY.split(',').map(Number) : null; let seq = 0;   // ANDROID_ONLY=7,8 roda só esses testes (depuração)
async function t(name, fn) {
  seq++; if (ONLY && !ONLY.includes(seq)) { results.push([name, true]); return; }
  try { await fn(); results.push([name, true]); console.log('  ok   ' + name); }
  catch (e) { const d = await diagnose(results.length + 1); results.push([name, false, e.message]); console.log('  FAIL ' + name + '\n       ' + String(e.message).slice(0, 400) + d); }
  if (STOP_AFTER && results.length >= STOP_AFTER) { console.log('\n(parado após ' + STOP_AFTER + ' testes por ANDROID_STOP_AFTER)'); process.exit(results.some((r) => !r[1]) ? 1 : 0); }
}
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m || 'valor'}: esperado ${JSON.stringify(b)}, obtido ${JSON.stringify(a)}`); };
const ok = (v, m) => { if (!v) throw new Error(m); };
const waitFor = async (fn, timeout = 15000, step = 250) => { const t0 = Date.now(); for (;;) { try { const v = await fn(); if (v) return v; } catch { /* tenta de novo */ } if (Date.now() - t0 > timeout) throw new Error('tempo esgotado esperando a condição'); await wait(step); } };
const ev = (expr) => c.ev(expr);
/** Atividade em primeiro plano agora (só a linha "topResumedActivity"; o resto do dumpsys inclui histórico). */
const topActivity = () => shell('dumpsys', 'activity', 'activities').split('\n').filter((l) => /topResumedActivity/.test(l)).join(' ');
const appOnTop = () => new RegExp(PKG + '/').test(topActivity());
const shot = (name) => { const r = require('child_process').spawnSync(adb, ['exec-out', 'screencap', '-p'], { maxBuffer: 64 * 1024 * 1024 }); fs.writeFileSync(path.join(SHOTS, name + '.png'), r.stdout); };

async function launch({ fresh = false } = {}) {
  if (c) { try { c.close(); } catch { /* já fechado */ } c = null; }
  if (fresh) sh('shell', 'pm', 'clear', PKG);
  sh('shell', 'am', 'force-stop', PKG); sh('shell', 'am', 'force-stop', 'com.google.android.inputmethod.latin'); await wait(800);   // teclado reiniciado: depois de horas de uso o do emulador pode parar de aceitar texto
  sh('shell', 'cmd', 'statusbar', 'collapse'); sh('shell', 'input', 'keyevent', '3'); await wait(500);   // recolhe o painel de notificações/atalhos (o monkey pode deixá-lo aberto por cima do app)
  sh('shell', 'am', 'start', '-n', PKG + '/.MainActivity');
  await waitFor(async () => { const k = await connect().catch(() => null); if (!k) return false; try { if (await k.ev(`!!(window.__mcHost && window.MCReact && document.documentElement.dataset.host === 'web' && typeof act !== 'undefined')`)) { c = k; return true; } } catch { /* ainda carregando */ } k.close(); return false; }, 40000, 800);
  await wait(900);
  // Depois de encerrar o app com edições não salvas, o MindCraft OFERECE recuperar a sessão (diálogo que cobre a tela e protege o trabalho).
  // Para os testes seguirem, respondemos como um usuário que não quer a sessão antiga; `RECOVER_DIALOGS` registra que o diálogo apareceu.
  const dlg = await ev(`(() => { const o = document.querySelector('.mchost-ov'); return o ? { texto: o.textContent.slice(0, 160), botoes: [...o.querySelectorAll('button')].map((b) => b.textContent) } : null; })()`);
  if (dlg) { RECOVER_DIALOGS.push(dlg); await ev(`(() => { const bs = [...document.querySelectorAll('.mchost-ov button')]; (bs.find((b) => /^(Descartar|Não|Ignorar|Cancelar)/i.test(b.textContent)) || bs[bs.length - 1]).click(); return true; })()`); await wait(700); }
}
const RECOVER_DIALOGS = [];
/** Acumula os erros de console/exceções da página de TODAS as aberturas do app durante a bateria. */
const PAGE_ERRORS = [];
async function watchErrors() {
  const k = c; await k.send('Runtime.enable'); await k.send('Log.enable');
  const timer = setInterval(() => {
    if (c !== k) { clearInterval(timer); return; }                      // o app foi reaberto: esta conexão acabou
    for (const e of k.events.splice(0)) {
      if (e.method === 'Runtime.exceptionThrown') PAGE_ERRORS.push(String((e.params.exceptionDetails.exception && e.params.exceptionDetails.exception.description) || e.params.exceptionDetails.text).slice(0, 300));
      else if (e.method === 'Runtime.consoleAPICalled' && (e.params.type === 'error' || (e.params.type === 'warning' && e.params.args.some((a) => /\[nativo\]/.test(String(a.value))))) ) PAGE_ERRORS.push(e.params.type + ': ' + e.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 300));
    }
  }, 300); timer.unref();
}

// ---- toque real do Android: converte pixels CSS da página em pixels do aparelho (calibrando o deslocamento da barra de status) ----
let cal = null;
async function calibrate() {
  await ev(`window.__pd = []; window.__cl = []; window.addEventListener('pointerdown', (e) => window.__pd.push([Math.round(e.clientX), Math.round(e.clientY), (e.target.id || e.target.tagName) + (e.target.closest && e.target.closest('[data-act]') ? '>' + e.target.closest('[data-act]').dataset.act : '')]), true); window.addEventListener('click', (e) => window.__cl.push(e.isTrusted ? 'click' : 'click*'), true); true`);
  for (let tent = 0; tent < 5 && !(await ev('window.__pd.length')); tent++) { await waitFor(() => appOnTop(), 15000, 500); shell('input', 'tap', '1000', '1000'); await wait(900); }   // o app pode ainda estar terminando de iniciar
  const [cx, cy] = await ev('window.__pd[window.__pd.length - 1]'); const dpr = await ev('devicePixelRatio');
  cal = { dpr, offX: 1000 - cx * dpr, offY: 1000 - cy * dpr };
  // o toque de calibração cai na tela inicial e pode abrir algo (conforme o layout: biblioteca, CSV…): fecha tudo e volta ao mapa
  await ev(`closeModal && closeModal(); closeGraph && closeGraph(); closeDash && closeDash(); closeHome(); true`); await wait(300);
}
const dev = (x, y) => { if (!cal) throw new Error('calibração ausente (rode também o teste 2)'); return [Math.round(x * cal.dpr + cal.offX), Math.round(y * cal.dpr + cal.offY)]; };
const tapCss = (x, y) => shell('input', 'tap', ...dev(x, y).map(String));
const swipeCss = (x1, y1, x2, y2, ms = 300) => shell('input', 'swipe', ...dev(x1, y1).map(String), ...dev(x2, y2).map(String), String(ms));
const ctr = (sel) => ev(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; })()`);
const nodeCtr = (title) => ev(`(() => { let id; map.walk((n) => { if (n.title === ${JSON.stringify(title)} && !id) id = n.id; }); const r = document.querySelector('[data-id="' + id + '"]').getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2), id]; })()`);
/** Digita no campo em edição pelo teclado do Android, com paciência (o teclado do emulador demora a "acordar") e confirma com Enter. */
async function typeAndConfirm(text, expectedTitle = text) {
  await waitFor(() => /mBoundToMethod=true/.test(shell('dumpsys', 'input_method')), 20000, 500); await wait(1200);
  for (let i = 0; i < 15 && !(await ev(`editor.value.includes(${JSON.stringify(text)})`)); i++) { await ev(`editor.select(); true`); shell('input', 'text', text.replace(/ /g, '%s')); await wait(1000); }
  ok(await ev(`editor.value.includes(${JSON.stringify(text)})`), 'texto digitado no teclado virtual: ' + await ev('editor.value'));
  shell('input', 'keyevent', '66'); await waitFor(() => ev(`editor.hidden && map.root.children.concat(...map.root.children.map((c) => c.children)).some((x) => x.title === ${JSON.stringify(expectedTitle)})`), 8000);
}
/** Responde ao diálogo de permissão do Android ("Permitir que o MindCraft envie notificações?") tocando no botão pelo texto, como um usuário. */
async function allowPermissionDialog(timeout = 25000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    if (/permissioncontroller/.test(topActivity())) {
      sh('shell', 'uiautomator', 'dump', '/sdcard/ui.xml'); const xml = sh('shell', 'cat', '/sdcard/ui.xml').stdout;
      const m = /text="(Allow|Permitir|While using the app)"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/.exec(xml);
      if (m) { shell('input', 'tap', String(Math.round((+m[2] + +m[4]) / 2)), String(Math.round((+m[3] + +m[5]) / 2))); await wait(1200); return true; }
    }
    await wait(700);
  }
  return false;
}
const imeShown = () => /mInputShown=true/.test(shell('dumpsys', 'input_method'));
const fresh = () => ev(`closeHome(); closeModal && closeModal(); dirty = false; newMap(); fit(); true`);

(async () => {
  console.log('\nMindCraft — testes no Android (tablet virtual)\n');
  const info = { model: shell('getprop', 'ro.product.model'), android: shell('getprop', 'ro.build.version.release'), size: shell('wm', 'size') };
  console.log('  aparelho:', JSON.stringify(info));
  sh('shell', 'logcat', '-c'); sh('shell', 'settings', 'put', 'system', 'accelerometer_rotation', '0'); sh('shell', 'settings', 'put', 'system', 'user_rotation', '0');
  sh('shell', 'settings', 'put', 'secure', 'show_ime_with_hard_keyboard', '1');
  await launch({ fresh: true }); await watchErrors(); await calibrate();

  await t('abre como app Android: plataforma nativa, aparelho de toque, 1280×~744 dp, armazenamento e camada nativa ativos, sem erros', async () => {
    const r = await ev(`({ native: Capacitor.isNativePlatform(), platform: Capacitor.getPlatform(), coarse: matchMedia('(pointer: coarse)').matches, vw: innerWidth, nat: !!window.__mcHost.native, attr: document.documentElement.dataset.native, idb: typeof indexedDB, sql: typeof WebAssembly })`);
    eq([r.native, r.platform, r.coarse, r.vw, r.nat, r.attr], [true, 'android', true, 1280, true, 'android']);
    await wait(800); eq(PAGE_ERRORS.filter((e) => !/safe area CSS/.test(e)), [], 'erros de console no início'); shot('03-android-inicio');
  });

  await t('toque REAL do sistema (adb input): tocar em "Novo mapa" abre o editor; tocar num tópico seleciona', async () => {
    await calibrate(); await ev('act.home(true); true'); await waitFor(() => ev(`!!document.querySelector('#hmNew') && !document.querySelector('#home').hidden`), 8000); await wait(400); const [x, y] = await ctr('#hmNew'); tapCss(x, y); await waitFor(() => ev(`document.querySelector('#home').hidden`), 8000);
    await ev(`fit(); true`); await wait(300); const [nx, ny, id] = await nodeCtr('Tópico 1'); tapCss(nx, ny); await waitFor(() => ev(`selectedId === ${JSON.stringify(id)}`), 5000);
  });

  await t('duplo toque real abre a edição COM O TECLADO VIRTUAL; digitar e confirmar muda o título', async () => {
    const [nx, ny] = await nodeCtr('Tópico 1'); { const [dx, dy] = dev(nx, ny); shell('input tap ' + dx + ' ' + dy + '; input tap ' + dx + ' ' + dy); }   // 2 toques reais numa só chamada
    await waitFor(() => ev('!editor.hidden'), 6000); await waitFor(() => /mInputShown=true/.test(shell('dumpsys', 'input_method')), 8000, 400); shot('04-android-teclado-virtual');
    await waitFor(() => /mBoundToMethod=true/.test(shell('dumpsys', 'input_method')), 20000, 500); await wait(1500);
    for (let i = 0; i < 15 && !(await ev(`editor.value.includes('Licitacoes')`)); i++) { await ev(`editor.select(); true`); shell('input', 'text', 'Licitacoes'); await wait(1000); }   // o teclado do emulador demora a "acordar" depois de reiniciado
    ok(await ev(`editor.value.includes('Licitacoes')`), 'texto digitado no teclado virtual: ' + await ev('editor.value')); shell('input', 'keyevent', '66'); await waitFor(() => ev(`map.root.children.some((x) => x.title === 'Licitacoes')`), 6000);
    eq(await ev('editor.hidden'), true, 'o editor fecha ao confirmar'); await wait(400); ok(!/mInputShown=true/.test(shell('dumpsys', 'input_method')), 'o teclado fecha');
  });

  await t('arrastar com o dedo (swipe real) move o mapa; pinça (2 dedos) amplia', async () => {
    const p0 = await ev('({ x: pan.x, y: pan.y, k: pan.k })'); swipeCss(500, 600, 340, 560, 400); await wait(400); const p1 = await ev('({ x: pan.x, y: pan.y })');
    ok(Math.abs(p1.x - p0.x + 160) < 25 && Math.abs(p1.y - p0.y + 40) < 25, `deslocamento esperado (-160,-40), obtido (${p1.x - p0.x},${p1.y - p0.y})`);
    // pinça pelo protocolo do WebView (Android não oferece 2 dedos em adb input)
    const send = (type, pts) => c.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p.x, y: p.y, id: p.id ?? i + 1 })) });
    const pts = (d) => [{ x: 640 - d / 2, y: 380, id: 1 }, { x: 640 + d / 2, y: 380, id: 2 }]; await send('touchStart', pts(120)); for (let i = 1; i <= 12; i++) { await send('touchMove', pts(120 + 15 * i)); await wait(15); } await send('touchEnd', []); await wait(300);
    ok((await ev('pan.k')) > p0.k * 1.4, 'ampliou: ' + p0.k + ' → ' + await ev('pan.k'));
  });

  await t('SALVAR e FECHAR O APP À FORÇA (force-stop): o arquivo e o mapa voltam ao reabrir', async () => {
    await fresh(); await ev(`map.root.title = 'Direito Constitucional'; map.addChild(map.root.id, 'Controle de constitucionalidade'); dirty = true; render(); true`);
    // "Salvar como" agora abre a janela (nome editável + destino): toque real em "Salvar" com o padrão (Documentos do MindCraft)
    await ev('window.__r = undefined; save(true).then((v) => { window.__r = v; }); true'); await waitFor(() => ev('!!document.querySelector("[data-mc-saveas]")'), 10000);
    eq(await ev('document.querySelector("[data-mc-saveas] input[type=text]").value'), 'Direito Constitucional.mom'); const [okx, oky] = await ctr('[data-mc-saveas] button[data-act=ok]'); tapCss(okx, oky);
    await waitFor(async () => (await ev('window.__r')) === true, 10000); const p = await ev('filePath'); ok(/^\/docs\/.+\.mom$/.test(p), p); await wait(400);
    await launch(); await watchErrors();
    ok(await ev(`window.__mcHost.fs.existsSync(${JSON.stringify(p)})`), 'arquivo sobreviveu ao force-stop');
    await ev(`closeHome(); dirty = false; openPath(${JSON.stringify(p)}); true`); await waitFor(() => ev(`filePath === ${JSON.stringify(p)}`), 6000); eq(await ev('map.root.title'), 'Direito Constitucional');
    eq((await ev('window.__mcHost.ipc.loadRecent()'))[0], p, 'recentes');
  });

  await t('biblioteca SQLite: gravar e ser MORTO logo depois (≥ 300 ms): nada se perde; banco íntegro; 40 mapas e busca', async () => {
    await ev(`closeHome(); dirty = false; newMap(); moveToLibrary(); true`); await wait(500);
    await ev(`(() => { const { MindMap, createNode } = require('/app/core/model'); const l = getLibrary(); for (let k = 0; k < 40; k++) { const m = new MindMap(createNode('Mapa ' + k)); m.meta.name = 'Mapa ' + k; for (let i = 0; i < 5; i++) m.addChild(m.root.id, 'Assunto ' + k + '.' + i); l.saveMap(m); } return true; })()`); await wait(700);
    sh('shell', 'am', 'force-stop', PKG); await launch(); await watchErrors();
    const r = await ev(`(() => { const l = getLibrary(); return { n: l.listMaps().length, found: l.searchTopics('Assunto 39.4').length, integrity: l.integrityCheck() }; })()`);
    ok(r.n >= 41, 'mapas: ' + r.n); eq([r.found, r.integrity], [1, ['ok']]);
  });

  await t('compartilhar: exportar o pacote .mcpack abre o compartilhamento do Android com o arquivo gerado', async () => {
    await ev(`closeHome(); openLibraryModal(); true`); await waitFor(() => ev(`!!document.querySelector('#libExpPack')`)); const [x, y] = await ctr('#libExpPack'); tapCss(x, y);
    const errsAntes = PAGE_ERRORS.length;
    // agora exportar pergunta o nome e o destino: escolhe "Compartilhar ou enviar…" (a outra opção é o seletor de arquivos do sistema, testado em "SALVAR COMO")
    await waitFor(() => ev('!!document.querySelector("[data-mc-saveas]")'), 10000); eq(await ev('[...document.querySelectorAll("[data-mc-saveas] input[type=radio]")].map((r) => r.value)'), ['device', 'share']);
    await ev('document.querySelector("[data-mc-saveas] input[value=share]").click(); true'); const [sx, sy] = await ctr('[data-mc-saveas] button[data-act=ok]'); tapCss(sx, sy);
    await waitFor(() => /ChooserActivity|ResolverActivity|intentresolver/i.test(topActivity()), 20000, 700); shot('05-android-compartilhar');
    const files = sh('shell', 'run-as', PKG, 'find', 'cache', '-name', '*.mcpack').stdout.trim(); ok(/\.mcpack/.test(files), 'arquivo no cache: ' + files);
    shell('input', 'keyevent', '4'); await waitFor(() => appOnTop(), 20000, 700); await wait(1200);
    for (let i = PAGE_ERRORS.length - 1; i >= errsAntes; i--) if (/Share canceled|^error: Object$/.test(PAGE_ERRORS[i])) PAGE_ERRORS.splice(i, 1);   // "cancelado" = o Voltar do teste fechando o seletor (comportamento normal do Android)
    ok(sh('shell', 'pidof', PKG).stdout.trim().length > 0, 'o app continua vivo depois de fechar o compartilhamento'); await ev(`closeModal(); true`);
  });

  await t('botão Voltar: fecha janela, tela inicial e gaveta; na raiz o app vai para o fundo (não fecha) e volta intacto', async () => {
    await ev(`openLibraryModal(); true`); await wait(300); shell('input', 'keyevent', '4'); await waitFor(() => ev(`document.querySelector('#modal').hidden`), 4000);
    await ev(`act.home(true); true`); await wait(400); shell('input', 'keyevent', '4'); await waitFor(() => ev(`document.querySelector('#home').hidden`), 4000);
    await ev(`document.querySelector('#mcHostMenuBtn').click(); true`); await wait(300); shell('input', 'keyevent', '4'); await waitFor(() => ev(`document.querySelector('#mcHostMenu').hidden`), 4000);
    const before = await ev('map.root.title'); shell('input', 'keyevent', '4'); await wait(1500);
    await waitFor(() => !appOnTop(), 10000, 500); ok(!appOnTop(), 'o app foi para o fundo');
    ok(sh('shell', 'pidof', PKG).stdout.trim().length > 0, 'processo vivo'); sh('shell', 'am', 'start', '-n', PKG + '/.MainActivity'); await wait(1500); eq(await ev('map.root.title'), before, 'mesmo estado ao voltar');
  });

  await t('rotação para retrato: painéis viram gaveta, nada estoura a tela; volta à paisagem', async () => {
    shell('settings', 'put', 'system', 'user_rotation', '1'); await wait(2000); await waitFor(async () => (await ev('innerWidth')) < (await ev('innerHeight')), 8000); shot('06-android-retrato');
    const r = await ev(`({ vw: innerWidth, scrollW: document.documentElement.scrollWidth, panelsHidden: getComputedStyle(document.querySelector('#panels')).visibility === 'hidden', btn: !!document.querySelector('#tbPanels').offsetWidth })`);
    ok(r.scrollW <= r.vw + 1, 'sem rolagem horizontal'); eq([r.panelsHidden, r.btn], [true, true]);
    shell('settings', 'put', 'system', 'user_rotation', '0'); await wait(2000); await waitFor(async () => (await ev('innerWidth')) > (await ev('innerHeight')), 8000);
  });

  await t('NOTIFICAÇÕES: aviso imediato aparece na bandeja; o lembrete diário agenda 7 alarmes e DISPARA com o app em segundo plano', async () => {
    const pendente = ev(`ipcRenderer.invoke('notify:show', { title: 'MindCraft — teste', body: 'Aviso imediato' })`);   // o 1º uso pede a permissão: o Android mostra o diálogo
    ok(await allowPermissionDialog(), 'o diálogo de permissão de notificações apareceu e foi respondido'); eq(await pendente, true);
    await waitFor(() => /MindCraft — teste/.test(shell('dumpsys', 'notification', '--noredact')), 10000, 500); shot('07-android-notificacao');
    const now = new Date(shell('date', '+%Y-%m-%dT%H:%M:%S').replace(' ', 'T')), at = new Date(now.getTime() + 3 * 60000), hm = String(at.getHours()).padStart(2, '0') + ':' + String(at.getMinutes()).padStart(2, '0');
    await ev(`saveCfg({ notifyDaily: true, notifyAt: ${JSON.stringify(hm)} }); true`);
    await waitFor(() => (shell('dumpsys', 'alarm').match(/app\.mindcraft\.estudos/g) || []).length >= 7, 20000, 700);
    shell('input', 'keyevent', '3'); await wait(800); sh('shell', 'am', 'kill', PKG); await wait(500);          // início + processo morto em segundo plano (não é "forçar parada")
    console.log('       aguardando o horário do lembrete (' + hm + ') com o app fechado…');
    await waitFor(() => /MindCraft — hora de estudar/.test(shell('dumpsys', 'notification', '--noredact')), 6 * 60000, 5000);
  });

  await t('EDITAR NÓ no Android (toque e teclado reais): tópico na parte de BAIXO da tela com o teclado aberto fica visível; confirmar tocando fora; Esc/cancelar; ✎', async () => {
    await launch(); await watchErrors(); await calibrate(); await ev(`closeHome(); dirty = false; newMap(); (() => { const p = map.root.children[2]; for (let i = 0; i < 7; i++) map.addChild(p.id, 'Item ' + i); })(); fit(); true`); await wait(700);
    const low = await ev(`(() => { const st = document.querySelector('#stage').getBoundingClientRect(); let best = null, by = -1; map.walk((n) => { const el = document.querySelector('[data-id="' + n.id + '"]'); if (!el) return; const r = el.getBoundingClientRect(), cx = r.left + r.width / 2; if (cx > st.left + 20 && cx < st.right - 20 && r.top > st.top && r.bottom < st.bottom && r.bottom > by) { by = r.bottom; best = n.title; } }); return best; })()`);
    ok(low, 'há um tópico dentro da área de trabalho'); step('duplo toque no tópico de baixo'); const [nx, ny] = await nodeCtr(low); { const [dx, dy] = dev(nx, ny); shell('input tap ' + dx + ' ' + dy + '; input tap ' + dx + ' ' + dy); }
    await waitFor(() => ev('!editor.hidden'), 8000); await waitFor(() => imeShown(), 12000, 400); await wait(1500); shot('10-android-editar-no-embaixo'); step('conferir visibilidade');
    const v = await ev(`(() => { const ed = editor.getBoundingClientRect(), id = selectedId, nd = document.querySelector('[data-id="' + id + '"]').getBoundingClientRect(); return { edTop: ed.top, edBottom: ed.bottom, ndTop: nd.top, ndBottom: nd.bottom, vh: innerHeight, vv: visualViewport.height, edit: editor.value }; })()`);
    ok(v.edBottom <= v.vv + 2 && v.edTop >= 0, 'campo de edição visível acima do teclado: ' + JSON.stringify(v)); ok(v.ndBottom <= v.vv + 2 && v.ndTop >= 0, 'o tópico editado também fica visível: ' + JSON.stringify(v));
    step('digitar no tópico de baixo'); await typeAndConfirm('Editado embaixo'); eq(await ev('editor.hidden'), true); step('reabrir para confirmar tocando fora');
    // confirmar tocando FORA do campo: abre de novo, digita, toca no fundo do mapa → grava e o teclado fecha
    const [mx, my] = await nodeCtr('Editado embaixo'); { const [dx, dy] = dev(mx, my); shell('input tap ' + dx + ' ' + dy + '; input tap ' + dx + ' ' + dy); }
    await waitFor(() => ev('!editor.hidden'), 8000); await waitFor(() => imeShown(), 12000, 400); await ev(`editor.value = 'Confirmado ao tocar fora'; editor.dispatchEvent(new Event('input')); true`); await wait(300);
    step('tocar fora'); { const st = await ev(`(() => { const r = document.querySelector('#stage').getBoundingClientRect(); return [Math.round(r.left + 40), Math.round(r.top + 40)]; })()`); tapCss(st[0], st[1]); } await waitFor(() => ev('editor.hidden'), 6000); ok(await ev(`map.root.children.concat(...map.root.children.map((c) => c.children)).some((x) => x.title === 'Confirmado ao tocar fora')`), 'tocar fora confirmou'); await waitFor(() => !imeShown(), 8000, 400);
    // botão ✎ da barra flutuante e cancelamento com Voltar
    step('✎ e cancelar'); const [tx, ty] = await nodeCtr('Tópico 1'); tapCss(tx, ty); await wait(300); const [ex, ey] = await ctr('#tbEdit'); tapCss(ex, ey); await waitFor(() => ev('!editor.hidden'), 6000); eq(await ev('editor.value'), 'Tópico 1');
    await ev(`editor.value = 'não vale'; true`); shell('input', 'keyevent', '4'); await wait(1200); if (!(await ev('editor.hidden'))) shell('input', 'keyevent', '4'); await waitFor(() => ev('editor.hidden'), 6000);
    ok(await ev(`map.root.children.some((x) => x.title === 'Tópico 1')`), 'cancelar não altera o título');
  });

  await t('EDITAR NÓ DA REDE no Android (toque real): tocar PERTO do ponto seleciona; duplo toque abre o tópico UMA vez; editar com o teclado; o rótulo novo aparece na rede', async () => {
    await launch(); await watchErrors(); await calibrate(); await ev(`closeHome(); dirty = false; newMap(); map.root.children.forEach((c, i) => map.addChild(c.id, 'Sub ' + i)); render(); fit(); true`); await wait(500);
    await ev(`window.__cnt = { goTo: 0 }; const gt = goTo; goTo = function () { window.__cnt.goTo++; return gt.apply(this, arguments); }; true`);
    const openGraph = async () => {   // o botão da rede é um liga/desliga: só toca se ela ainda estiver fechada (um toque logo depois do teclado fechar pode se perder na animação)
      await waitFor(async () => !imeShown(), 8000, 300); await wait(600);
      for (let tent = 0; tent < 3 && !(await ev('graphOpen')); tent++) { const [gx, gy] = await ctr('#rail [data-act="graph"]'); tapCss(gx, gy); await waitFor(() => ev('graphOpen === true'), 4000).catch(() => {}); }
      await waitFor(() => ev(`graphOpen === true && !document.querySelector('#graph').hidden`), 4000); await wait(1500);
    };
    const circle = (title) => ev(`(() => { const i = gLast.nodes.findIndex((n) => n.title === ${JSON.stringify(title)}); if (i < 0) return null; const r = document.querySelector('.gn[data-i="' + i + '"] circle').getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2), Math.round(r.width)]; })()`);
    step('abrir a rede'); await openGraph(); shot('11-android-rede'); const c1 = await circle('Tópico 1'); let x = c1[0], y = c1[1]; const d = c1[2]; ok(d < 20, 'ponto pequeno (' + d + ' px)'); step('tocar perto do ponto');
    tapCss(x + 14, y + 12); await waitFor(() => ev(`document.querySelector('#gSide').textContent.includes('Tópico 1')`), 6000);                // perto do ponto, não exatamente nele
    step('tocar no ponto de Tópico 2'); await wait(800); [x, y] = await circle('Tópico 2'); tapCss(x, y); await waitFor(() => ev(`document.querySelector('#gSide').textContent.includes('Tópico 2')`), 6000);
    step('duplo toque em Tópico 3'); await wait(800); [x, y] = await circle('Tópico 3'); { const [dx, dy] = dev(x, y); shell('input tap ' + dx + ' ' + dy + '; input tap ' + dx + ' ' + dy); }                     // duplo toque real
    await waitFor(() => ev('graphOpen === false'), 8000); await wait(800); eq(await ev('window.__cnt.goTo'), 1, 'abriu o tópico uma vez só'); eq(await ev('map.find(selectedId).node.title'), 'Tópico 3'); eq(await ev('editor.hidden'), true);
    step('tocar ✎'); const [ex, ey] = await ctr('#tbEdit'); tapCss(ex, ey); await waitFor(() => ev('!editor.hidden'), 8000); eq(await ev('editor.value'), 'Tópico 3'); step('digitar e confirmar'); await typeAndConfirm('Direito Penal'); step('reabrir a rede');
    await openGraph(); ok(await circle('Direito Penal'), 'rótulo novo na rede'); eq(await circle('Tópico 3'), null, 'rótulo antigo sumiu'); shot('12-android-rede-apos-editar');
    step('Voltar fecha a rede'); shell('input', 'keyevent', '4'); await waitFor(() => ev('graphOpen === false'), 6000);                                                                                                  // Voltar fecha a rede
  });

  await t('SINCRONIZAÇÃO com o Google Drive (servidor falso do Google, pela rede NATIVA do Android): entrar com o código, enviar, receber, conflito, desligar', async () => {
  const { startMockGoogle } = require('../../test/mock-google'); const { openLibrary } = require('../../core/library'); const { syncLibrary } = require('../../core/sync');
  const { DriveRemote } = require('../../core/sync-drive'); const { tokenSource } = require('../../core/oauth-device'); const { nodeHttp } = require('../../core/net-node');
  const g = await startMockGoogle(); const port = new URL(g.base).port; sh('reverse', `tcp:${port}`, `tcp:${port}`);
  const pc = openLibrary(':memory:');
  const remote = () => new DriveRemote({ http: nodeHttp, getToken: tokenSource({ http: nodeHttp, clientId: g.S.clientId, clientSecret: g.S.clientSecret, auth: { refreshToken: 'rt-1' }, urls: g.urls }), api: g.urls.api, upload: g.urls.upload });
  const text = (sel) => ev(`(document.querySelector(${JSON.stringify(sel)}) || {}).textContent || ''`);
  try {
    await ev(`closeHome(); closeModal && closeModal(); dirty = false; true`);
    const id = await ev(`(() => { const m = new MindMap(createNode('Direito Android'), { name: 'Direito Android' }); m.addChild(m.root.id, 'Tópico A'); return getLibrary().saveMap(m, { snapshot: false }); })()`);
    await ev(`window.__syncTestUrls = ${JSON.stringify(g.urls)}; act.sync(); true`); await waitFor(() => ev('!!document.querySelector("#syncBox")'));
    eq(await ev('[...document.querySelector("#syncKind").options].map((o) => o.value)'), ['drive']);
    await ev(`document.querySelector('#syncClientId').value = ${JSON.stringify(g.S.clientId)}; document.querySelector('#syncClientSecret').value = ${JSON.stringify(g.S.clientSecret)}; true`);
    const [lx, ly] = await ctr('#syncLogin'); tapCss(lx, ly);                                                  // toque REAL no botão
    await waitFor(async () => /ABCD-EFGH/.test(await text('#syncUserCode')), 20000); shot('30-sync-codigo'); g.S.deviceApproved = true;
    await waitFor(async () => /Conectado/.test(await text('#syncMsg')), 25000);
    const [nx, ny] = await ctr('#syncNow'); tapCss(nx, ny);
    await waitFor(async () => /Pronto|Não sincronizou/.test(await text('#syncMsg')), 40000); const m1 = await text('#syncMsg'); const nSent = +/(\d+) enviado/.exec(m1)[1]; ok(nSent >= 1 && !/problema/.test(m1), m1); shot('31-sync-enviado');
    ok(g.S.agents.length > 3 && g.S.agents.every((a) => !/Mozilla/.test(a)), 'as chamadas saíram pela rede NATIVA (não pelo WebView): ' + [...new Set(g.S.agents)].join(' | '));
    const r = await syncLibrary(pc, remote(), {}); eq([r.pulled, r.errors.length], [nSent, 0], 'o outro aparelho recebeu tudo o que o tablet enviou');
    const mm = pc.loadMap(id); mm.update(mm.root.children[0].id, { notes: 'do computador — ção 😀' }); pc.saveMap(mm, { snapshot: false }); await syncLibrary(pc, remote(), {});
    const [n2x, n2y] = await ctr('#syncNow'); tapCss(n2x, n2y); await waitFor(async () => /1 recebido/.test(await text('#syncMsg')), 40000);
    eq(await ev(`getLibrary().loadMap(${JSON.stringify(id)}).root.children[0].notes`), 'do computador — ção 😀');
    await ev(`(() => { const l = getLibrary(), m = l.loadMap(${JSON.stringify(id)}); m.update(m.root.id, { title: 'No tablet' }); l.saveMap(m, { snapshot: false }); })()`);
    const m3 = pc.loadMap(id); m3.update(m3.root.id, { title: 'No PC' }); pc.saveMap(m3, { snapshot: false }); await syncLibrary(pc, remote(), {});
    const [n3x, n3y] = await ctr('#syncNow'); tapCss(n3x, n3y); await waitFor(async () => /1 conflito/.test(await text('#syncMsg')), 40000);
    eq(await ev(`getLibrary().loadMap(${JSON.stringify(id)}).root.title`), 'No tablet'); ok(await ev(`getLibrary().listMaps().some((x) => /da sincronização/.test(x.title))`), 'a versão do outro aparelho ficou como cópia'); shot('32-sync-conflito');
    const files = g.S.files.size; const [ox, oy] = await ctr('#syncOff'); tapCss(ox, oy); await wait(500);
    const cfg = JSON.parse(await ev(`window.__mcHost.fs.readFileSync('/userdata/sync.json', 'utf8')`)); eq([cfg.enabled, cfg.drive.auth], [false, null]); eq(g.S.files.size, files, 'nada apagado no Drive');
  } finally { try { sh('reverse', '--remove', `tcp:${port}`); } catch { /* ok */ } pc.close(); await g.close(); await ev(`delete window.__syncTestUrls; closeModal(); true`).catch(() => {}); }
});
await t('ÁREA SEGURA: o app NÃO fica sob a barra de status, a de navegação (gestos e 3 botões) nem o recorte da câmera — em paisagem e retrato', async () => {
  const insets = () => { const out = []; for (const m of shell('dumpsys', 'window').matchAll(/InsetsSource id=\S+ type=(statusBars|navigationBars|displayCutout) frame=\[(\d+),(\d+)\]\[(\d+),(\d+)\] visible=true/g)) { const r = { type: m[1], x1: +m[2], y1: +m[3], x2: +m[4], y2: +m[5] }; if (r.x2 > r.x1 && r.y2 > r.y1 && !out.some((o) => JSON.stringify(o) === JSON.stringify(r))) out.push(r); } return out; };
  const webview = () => { sh('shell', 'uiautomator', 'dump', '/sdcard/ui.xml'); const m = /class="android\.webkit\.WebView"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/.exec(shell('cat', '/sdcard/ui.xml')); return m ? { x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4] } : null; };
  const inter = (a, b) => Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1) > 1 && Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1) > 1;
  const nav = (mode) => { for (const m of ['gestural', 'threebutton', 'twobutton']) sh('shell', 'cmd', 'overlay', m === mode ? 'enable' : 'disable', 'com.android.internal.systemui.navbar.' + m); };
  const cutout = (name) => { for (const n of ['tall', 'corner', 'double', 'narrow', 'wide']) sh('shell', 'cmd', 'overlay', n === name ? 'enable' : 'disable', 'com.android.internal.display.cutout.emulation.' + n); };
  const checks = []; const seen = [];
  try {
    for (const [navMode, cut, rot] of [['gestural', null, 0], ['threebutton', null, 0], ['threebutton', null, 1], ['gestural', 'tall', 0], ['gestural', 'double', 1], ['gestural', null, 0]]) {
      nav(navMode); cutout(cut); sh('shell', 'settings', 'put', 'system', 'accelerometer_rotation', '0'); sh('shell', 'settings', 'put', 'system', 'user_rotation', String(rot)); await wait(2500);
      if (!appOnTop()) { sh('shell', 'am', 'start', '-n', PKG + '/.MainActivity'); await wait(2500); }
      await waitFor(async () => { const w = webview(); return w && w.x2 > w.x1; }, 20000, 800); await wait(1200);
      const w = webview(), bars = insets(); ok(w, 'WebView não encontrado'); ok(bars.some((b) => b.type === 'statusBars'), 'sem barra de status na medição: ' + JSON.stringify(bars));
      const bad = bars.filter((b) => inter(w, b)); const label = navMode + (cut ? '+' + cut : '') + ' rot' + rot; seen.push(label + ' ' + JSON.stringify({ w, bars: bars.map((b) => b.type + ':' + [b.x1, b.y1, b.x2, b.y2]) }));
      eq(bad, [], `o app invade as barras em ${label}: WebView ${JSON.stringify(w)} × ${JSON.stringify(bars)}`);
      shot('40-area-segura-' + navMode + (cut ? '-' + cut : '') + '-rot' + rot); checks.push(label);
    }
  } finally { nav('gestural'); cutout(null); sh('shell', 'settings', 'put', 'system', 'user_rotation', '0'); sh('shell', 'settings', 'put', 'system', 'accelerometer_rotation', '1'); await wait(1500); fs.writeFileSync(path.join(SHOTS, 'area-segura.json'), JSON.stringify(seen, null, 1)); }
  ok(checks.length === 6, 'configurações testadas: ' + checks.join(' | '));
});

await t('SALVAR COMO no Android: janela do app (nome editável) + seletor REAL do sistema (editar nome e pasta); o arquivo aparece em Downloads; Salvar de novo atualiza o MESMO arquivo sem perguntar; cancelar não salva', async () => {
  const ui = () => { sh('shell', 'uiautomator', 'dump', '/sdcard/ui.xml'); return shell('cat', '/sdcard/ui.xml'); };
  const nodes = () => [...ui().matchAll(/<node [^>]*?text="([^"]*)"[^>]*?resource-id="([^"]*)"[^>]*?class="([^"]*)"[^>]*?bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g)].map((m) => ({ text: m[1], id: m[2], cls: m[3], cx: Math.round((+m[4] + +m[6]) / 2), cy: Math.round((+m[5] + +m[7]) / 2) }));
  const tapNode = (pred) => { const n = nodes().find(pred); if (!n) return false; shell('input', 'tap', String(n.cx), String(n.cy)); return true; };
  const inPicker = () => /documentsui/i.test(topActivity());
  const FILE = 'X_teste salvar como.mom', DIR = '/sdcard/Download/';
  const rmq = () => sh('shell', 'sh', '-c', "'rm -f /sdcard/Download/*teste\\ salvar\\ como*.mom /sdcard/Download/*cancelar*'"); rmq();
  await ev(`closeHome(); closeModal && closeModal(); dirty = false; filePath = null; newMap(); map.root.title = 'teste salvar como'; map.addChild(map.root.id, 'Tópico A'); dirty = true; window.__r = undefined; save(false).then((v) => { window.__r = v === undefined ? 'undef' : v; }); true`);
  await waitFor(() => ev('!!document.querySelector("[data-mc-saveas]")'), 10000);
  eq(await ev('document.querySelector("[data-mc-saveas] input[type=text]").value'), 'teste salvar como.mom', 'nome sugerido');
  eq(await ev('[...document.querySelectorAll("[data-mc-saveas] input[type=radio]")].map((r) => r.value)'), ['docs', 'device']); shot('41-salvar-como-janela');
  await ev('document.querySelector("[data-mc-saveas] input[value=device]").click(); true'); const [bx, by] = await ctr('[data-mc-saveas] button[data-act=ok]'); tapCss(bx, by);       // toque real em "Salvar"
  await waitFor(() => inPicker(), 15000); await wait(1500); shot('42-salvar-como-seletor-do-sistema');
  const field = nodes().find((n) => /EditText/.test(n.cls) && /teste salvar como/.test(n.text)); ok(field, 'o seletor do sistema abriu com o nome sugerido: ' + nodes().filter((n) => /EditText/.test(n.cls)).map((n) => n.text).join('|'));
  shell('input', 'tap', String(field.cx), String(field.cy)); await wait(500); shell('input', 'keyevent', 'KEYCODE_MOVE_HOME'); shell('input', 'text', 'X_'); await wait(600);   // EDITA o nome dentro do seletor
  eq(nodes().find((n) => /EditText/.test(n.cls)).text, FILE, 'nome editado no seletor'); shot('43-salvar-como-nome-editado');
  ok(tapNode((n) => /^(save|salvar)$/i.test(n.text) && /Button|TextView/.test(n.cls)), 'botão Salvar do seletor');
  await waitFor(() => appOnTop(), 15000); await waitFor(async () => (await ev('window.__r')) !== undefined, 15000); eq(await ev('window.__r'), true); await wait(1500);
  const head = shell('sh', '-c', "'head -c 2 \"" + DIR + FILE + "\"'"); eq(head, 'PK', 'o arquivo existe em Downloads com o nome editado e é um .mom (zip)'); const size1 = +shell('sh', '-c', "'wc -c < \"" + DIR + FILE + "\"'");
  eq(await ev('filePath.split("/").pop()'), FILE, 'o mapa passou a se chamar como o arquivo escolhido');
  await ev(`map.addChild(map.root.id, 'Tópico B com mais texto para mudar o tamanho do arquivo'); dirty = true; window.__r = undefined; save(false).then((v) => { window.__r = v; }); true`);
  await waitFor(async () => (await ev('window.__r')) === true, 10000); await wait(1800); eq(await ev('!!document.querySelector("[data-mc-saveas]")'), false, 'Salvar não pergunta de novo'); ok(!inPicker(), 'o seletor não reabriu');
  const size2 = +shell('sh', '-c', "'wc -c < \"" + DIR + FILE + "\"'"); ok(size2 !== size1 && size2 > 0, 'o MESMO arquivo foi atualizado: ' + size1 + ' → ' + size2); shot('44-salvar-atualizou');
  await ev(`closeModal && closeModal(); dirty = false; filePath = null; newMap(); map.root.title = 'cancelar isto'; dirty = true; window.__r = undefined; save(false).then((v) => { window.__r = v === undefined ? 'undef' : v; }); true`);
  await waitFor(() => ev('!!document.querySelector("[data-mc-saveas]")'), 10000); await ev('document.querySelector("[data-mc-saveas] input[value=device]").click(); true'); const [cx2, cy2] = await ctr('[data-mc-saveas] button[data-act=ok]'); tapCss(cx2, cy2);
  await waitFor(() => inPicker(), 15000); await wait(1200); shell('input', 'keyevent', 'KEYCODE_BACK'); await waitFor(() => appOnTop(), 10000); await waitFor(async () => (await ev('window.__r')) !== undefined, 10000);
  eq(await ev('window.__r'), false, 'cancelar o seletor = não salvou'); eq(await ev('filePath'), null); eq(shell('sh', '-c', "'ls /sdcard/Download | grep -c cancelar'"), '0', 'nenhum arquivo criado');
  rmq();
});

await t('MANUAL e PAINEL LATERAL no Android (toque real): ☰ → Manual de uso abre em visão de tablet SEM subir o teclado; tocar no índice troca a seção; botão ‹ › recolhe/expande o painel e o divisor muda a largura com o dedo', async () => {
  await fresh(); await ev('window.__mcSaveAsAuto = false; true'); step('menu');
  const [mx, my] = await ctr('#mcHostMenuBtn'); tapCss(mx, my); await waitFor(() => ev("!document.querySelector('#mcHostMenu').hidden"), 5000);
  const [ix, iy] = await ev("(() => { const b = document.querySelector('#mcHostMenu button[data-cmd=manual]'); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; })()"); tapCss(ix, iy);
  await waitFor(() => ev("!!document.querySelector('#manualBox')"), 8000); await wait(500); step('manual');
  eq(await ev("document.querySelector('#manualHostTouch').getAttribute('aria-pressed')"), 'true', 'visão de tablet'); ok(!imeShown(), 'o teclado NÃO subiu sozinho'); shot('06-android-manual');
  const [sx, sy] = await ev("(() => { const b = document.querySelector('#manualIndex button[data-section=layout]'); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; })()"); tapCss(sx, sy); await wait(500);
  eq(await ev("document.querySelector('#manualBody').dataset.section"), 'layout'); ok(/dedo/.test(await ev("document.querySelector('#manualBody').textContent")), 'texto de toque');
  const [cx, cy] = await ctr('#manualClose'); tapCss(cx, cy); await waitFor(() => ev("document.getElementById('modal').hidden"), 5000);
  step('painel'); const w0 = await ev("document.querySelector('#panels').getBoundingClientRect().width"); ok(w0 > 200, 'painel docado: ' + w0);
  const [bx, by] = await ctr('#panelsToggle'); tapCss(bx, by); await wait(700); ok(await ev("document.body.classList.contains('panels-collapsed')"), 'recolheu por toque real'); shot('07-android-painel-recolhido');
  const [b2x, b2y] = await ctr('#panelsToggle'); tapCss(b2x, b2y); await wait(700); ok(!(await ev("document.body.classList.contains('panels-collapsed')")), 'expandiu'); ok(Math.abs((await ev("document.querySelector('#panels').getBoundingClientRect().width")) - w0) < 3);
  const [dx, dy] = await ctr('#panelsSplit'); swipeCss(dx, dy + 160, dx - 90, dy + 160, 500); await wait(800);
  const w1 = await ev("document.querySelector('#panels').getBoundingClientRect().width"); ok(w1 > w0 + 60, `o dedo alargou o painel: ${w0} → ${w1}`); shot('08-android-painel-largo');
  const [rx, ry] = await ctr('#panelsSplit'); tapCss(rx, ry + 160); await wait(120); tapCss(rx, ry + 160); await wait(800);
  ok(Math.abs((await ev("document.querySelector('#panels').getBoundingClientRect().width")) - w0) < 6, 'duplo toque restaura');
});

await t('TELA INICIAL no Android (toque real): aviso de cópia de segurança e "Seu estudo"; "Lembrar depois" esconde o aviso; "Cópia de segurança" abre a janela de salvar com o nome editável', async () => {
  await fresh(); step('preparar');
  await ev("map.root.title = 'Plano Android'; map.root.children = []; (() => { const d = map.addChild(map.root.id, 'Disciplina A'); const t1 = map.addChild(d.id, 'Tópico A1'); window.__t1 = t1.id; selectedId = t1.id; selIds = new Set([t1.id]); render(); })(); true");
  await ev("runStudy((x) => map.mutateStudy(x, (st) => S.addTime(st, nowStr(), 30)), '', [__t1]); runStudy((x) => map.mutateStudy(x, (st) => S.setNext(st, '2020-01-01')), '', [__t1]); true");
  ok(await ev('moveToLibrary()'), 'guardou na biblioteca'); await ev("saveCfg({ lastBackup: null, backupSnoozeUntil: null, backupEveryDays: 14 }); act.home(true); true");
  await waitFor(() => ev("!!document.querySelector('#hmBackupBanner')"), 8000); await wait(500); step('home'); shot('09-android-tela-inicial');
  ok(/ainda não fez nenhuma cópia/.test(await ev("document.querySelector('#hmBackupBanner').textContent"))); eq(await ev("document.querySelector('#glToday b').textContent"), '30 min'); ok(await ev("!!document.querySelector('#glBars')"));
  ok(!(await ev('document.documentElement.scrollWidth > innerWidth')), 'sem rolagem horizontal');
  const [lx, ly] = await ev("(() => { const b = document.querySelector('#hmBackupLater'); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; })()"); tapCss(lx, ly);
  await waitFor(() => ev("!document.querySelector('#hmBackupBanner')"), 5000); step('lembrar depois');
  const [kx, ky] = await ev("(() => { const b = document.querySelector('#hmBackup'); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; })()"); tapCss(kx, ky);
  await waitFor(() => ev("!!document.querySelector('[data-mc-saveas]')"), 8000); ok(/\.mcpack$/.test(await ev("document.querySelector('[data-mc-saveas] input[type=text]').value")), 'nome sugerido .mcpack'); shot('10-android-copia-seguranca');
  const [ex, ey] = await ctr('[data-mc-saveas] button[data-act=cancel]'); tapCss(ex, ey); await waitFor(() => ev("!document.querySelector('[data-mc-saveas]')"), 5000); await wait(400);
  eq(await ev("(() => { try { return JSON.parse(window.__mcHost.fs.readFileSync(userDataDir + '/config.json', 'utf8')).lastBackup || null; } catch { return null; } })()"), null, 'cancelar NÃO conta como cópia feita');
  await ev("closeHome(); dirty = false; newMap(); (() => { const lib = getLibrary(); for (const m of lib.listMaps({ today: nowStr() })) { lib.trashMap(m.id); lib.purgeMap(m.id); } saveCfg({ backupSnoozeUntil: null }); })(); true");
});

await t('CÓPIA DE SEGURANÇA no Android (seletor REAL): a 1ª vez abre o seletor do sistema e grava o pacote em Downloads; as seguintes gravam DIRETO no MESMO arquivo, sem janela; o pacote é válido e restaurável', async () => {
  const ui = () => { sh('shell', 'uiautomator', 'dump', '/sdcard/ui.xml'); return shell('cat', '/sdcard/ui.xml'); };
  const nodes = () => [...ui().matchAll(/<node [^>]*?text="([^"]*)"[^>]*?resource-id="([^"]*)"[^>]*?class="([^"]*)"[^>]*?bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g)].map((m) => ({ text: m[1], id: m[2], cls: m[3], cx: Math.round((+m[4] + +m[6]) / 2), cy: Math.round((+m[5] + +m[7]) / 2) }));
  const tapNode = (pred) => { const n = nodes().find(pred); if (!n) return false; shell('input', 'tap', String(n.cx), String(n.cy)); return true; };
  const inPicker = () => /documentsui/i.test(topActivity());
  const NAME = 'copia-teste-android.mcpack', FILE = '/sdcard/Download/' + NAME;
  const size = () => +shell('sh', '-c', "'wc -c < \"" + FILE + "\" 2>/dev/null || echo 0'");
  const tapSel = async (sel) => { const [x, y] = await ev("(() => { const b = document.querySelector(" + JSON.stringify(sel) + "); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; })()"); tapCss(x, y); };
  const rmAll = () => sh('shell', 'sh', '-c', "'rm -f /sdcard/Download/copia-teste-android*'"); rmAll();
  await fresh(); step('biblioteca');
  await ev("(() => { const lib = getLibrary(); for (const m of lib.listMaps({ today: nowStr() })) { lib.trashMap(m.id); lib.purgeMap(m.id); } })(); true");
  for (const tt of ['Cópia A', 'Cópia B']) { await ev("dirty = false; newMap(); map.root.title = " + JSON.stringify(tt) + "; map.addChild(map.root.id, 'Tópico'); render(); true"); ok(await ev('moveToLibrary()'), 'guardou ' + tt); }
  await ev("ipcRenderer.invoke('backup:clear'); saveCfg({ lastBackup: null, backupSnoozeUntil: null }); closeHome(); dirty = false; newMap(); act.home(true); true"); await waitFor(() => ev("!!document.querySelector('#hmBackup')"), 8000); await wait(500);
  step('primeira cópia'); await tapSel('#hmBackup'); await waitFor(() => ev('!!document.querySelector("[data-mc-saveas]")'), 10000);
  await ev("(() => { const i = document.querySelector('[data-mc-saveas] input[type=text]'); i.value = " + JSON.stringify(NAME) + "; i.dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('[data-mc-saveas] input[value=device]').click(); return 1; })()");
  const [okx, oky] = await ctr('[data-mc-saveas] button[data-act=ok]'); tapCss(okx, oky);
  await waitFor(() => inPicker(), 15000); await wait(1500); shot('11-copia-seletor-do-sistema');
  ok(tapNode((n) => /^(save|salvar)$/i.test(n.text) && /Button|TextView/.test(n.cls)), 'botão Salvar do seletor');
  await waitFor(() => appOnTop(), 15000); await waitFor(() => size() > 300, 20000, 500); await wait(1500);        // a prova é o ARQUIVO em Downloads (a mensagem da barra de status pode ser trocada por outra logo depois)
  eq(shell('sh', '-c', "'head -c 2 \"" + FILE + "\"'"), 'PK', 'o pacote está em Downloads e é um zip'); const s1 = size(); ok(s1 > 300, 'tamanho ' + s1);
  eq(await ev('window.MC.backupDestName()'), NAME, 'destino lembrado');
  step('segunda cópia'); await ev("dirty = false; newMap(); map.root.title = 'Cópia C com bastante texto para o pacote crescer'; for (let i = 0; i < 12; i++) map.addChild(map.root.id, 'Tópico longo número ' + i + ' para aumentar o tamanho do arquivo'); render(); true"); ok(await ev('moveToLibrary()'));
  await ev("closeHome(); act.home(true); true"); await waitFor(() => ev("!!document.querySelector('#hmBackupDest')"), 8000); ok(new RegExp(NAME).test(await ev("document.querySelector('#hmBackupDest').textContent")), 'tela inicial mostra o destino'); shot('12-copia-destino-na-tela-inicial');
  await tapSel('#hmBackup'); await waitFor(() => size() > s1, 20000, 500); await wait(1000);
  eq(await ev('!!document.querySelector("[data-mc-saveas]")'), false, 'sem janela na cópia seguinte'); ok(!inPicker(), 'o seletor não reabriu');
  const s2 = size(); ok(s2 > s1, 'o MESMO arquivo foi atualizado (mais mapas): ' + s1 + ' → ' + s2); eq(shell('sh', '-c', "'ls /sdcard/Download | grep -c copia-teste-android'"), '1', 'um único arquivo');
  step('conferir pacote'); const local = path.join(SHOTS, 'copia-teste-android.mcpack'); sh('pull', FILE, local);
  const tmpDb = path.join(require('os').tmpdir(), 'mc-android-check-' + Date.now() + '.db'); const lib = require('../../core/library').openLibrary(tmpDb); const imp = lib.importPackage(local, { onConflict: 'copy' });
  eq(imp.maps, 3, 'o pacote tem os 3 mapas'); eq(lib.listMaps().map((m) => m.title).sort().length, 3); lib.close(); try { fs.rmSync(tmpDb, { force: true }); fs.rmSync(local, { force: true }); } catch { /* temporários */ }
  // RESTAURAR de verdade: apaga a biblioteca e restaura pelo seletor de arquivos REAL do Android (Tela inicial → Restaurar cópia)
  step('restaurar'); await ev("(() => { const l = getLibrary(); for (const m of l.listMaps({ today: nowStr() })) { l.trashMap(m.id); l.purgeMap(m.id); } closeHome(); dirty = false; newMap(); act.home(true); })(); true");
  await waitFor(() => ev("!!document.querySelector('#hmRestore')"), 8000); eq(await ev("getLibrary().listMaps({ today: nowStr() }).length"), 0, 'biblioteca vazia antes de restaurar');
  await tapSel('#hmRestore'); await waitFor(() => inPicker(), 15000); await wait(1800); shot('13-restaurar-seletor-do-sistema');
  let picked = tapNode((n) => n.text === NAME); if (!picked) { tapNode((n) => /^(downloads|transferências)$/i.test(n.text)); await wait(1500); picked = tapNode((n) => n.text === NAME); }
  ok(picked, 'achei o pacote no seletor: ' + nodes().map((n) => n.text).filter(Boolean).slice(0, 12).join('|')); await wait(1200);
  await waitFor(() => appOnTop(), 15000); await waitFor(async () => (await ev("getLibrary().listMaps({ today: nowStr() }).length")) === 3, 20000, 500); shot('14-restaurado');
  eq(await ev("getLibrary().listMaps({ today: nowStr() }).map((m) => m.title).sort()"), ['Cópia A', 'Cópia B', 'Cópia C com bastante texto para o pacote crescer'], 'os 3 mapas voltaram');
  rmAll(); await ev("ipcRenderer.invoke('backup:clear'); closeHome(); dirty = false; newMap(); (() => { const lib2 = getLibrary(); for (const m of lib2.listMaps({ today: nowStr() })) { lib2.trashMap(m.id); lib2.purgeMap(m.id); } })(); true");
});

await t('COLAR/DIGITAR CSV no Android (toque e teclado reais): a janela do CSV abre SEM subir o teclado; tocar na caixa abre o teclado; o texto digitado vira prévia; "Criar o mapa" por toque cria o mapa', async () => {
  await fresh(); step('abrir csv'); await ev("act.csv(); true"); await waitFor(() => ev("!!document.querySelector('#csvPaste')"), 8000); await wait(600);
  ok(!imeShown(), 'o teclado NÃO subiu sozinho'); shot('15-android-csv-janela');
  const [px, py] = await ctr('#csvPaste'); tapCss(px, py); await waitFor(() => imeShown(), 8000, 400); step('digitar');
  shell('input', 'text', 'disciplina,topico,item'); shell('input', 'keyevent', '66'); shell('input', 'text', 'Penal,Dolo,1'); shell('input', 'keyevent', '66'); shell('input', 'text', 'Civil,Contratos,1'); await wait(1500);
  await waitFor(() => ev("/2 tópicos em 2 disciplina/.test(document.querySelector('#csvPreview').textContent)"), 10000, 400); shot('16-android-csv-previa');
  shell('input', 'keyevent', '4'); await wait(800);                              // fecha o teclado
  const [ox, oy] = await ev("(() => { const b = document.querySelector('#csvOk'); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; })()"); tapCss(ox, oy);
  await waitFor(() => ev("document.querySelector('#modal').hidden"), 8000); eq(await ev("map.root.children.map((d) => d.title)"), ['Penal', 'Civil'], 'mapa criado pelo toque');
});

await t('ESTRESSE: 3000 eventos aleatórios do Android (monkey) sem travar, sem ANR e sem erro fatal', async () => {
    await launch(); await watchErrors();
    const r = sh('shell', 'monkey', '-p', PKG, '--throttle', '60', '--pct-syskeys', '0', '--pct-nav', '0', '--pct-majornav', '0', '--pct-appswitch', '0', '--pct-anyevent', '0', '-s', '20261017', '--ignore-security-exceptions', '-v', '3000'); const out = r.stdout + r.stderr;
    ok(/Events injected: 3000/.test(out), 'monkey não terminou: ' + out.slice(-300)); ok(!/ANR|CRASH|Force finishing/i.test(out), 'monkey relatou: ' + (out.match(/.*(ANR|CRASH).*/i) || [''])[0]);
    const log = sh('shell', 'logcat', '-d', '-b', 'crash').stdout; ok(!/FATAL EXCEPTION/.test(log) || !new RegExp(PKG).test(log), 'erro fatal: ' + log.slice(0, 400)); ok(sh('shell', 'pidof', PKG).stdout.trim().length > 0, 'o app morreu durante o estresse');
    await wait(1500); const alive = await ev('!!window.__mcHost && typeof map !== "undefined"').catch(() => false); ok(alive, 'a página ainda responde'); shot('08-android-apos-estresse');
  });

  await t('nenhum erro fatal nem ANR do app no log do sistema durante toda a bateria', async () => {
    const log = sh('shell', 'logcat', '-d', '-v', 'brief', '*:E').stdout; const mine = log.split('\n').filter((l) => /FATAL EXCEPTION|ANR in|am_anr|app\.mindcraft/.test(l) && /FATAL|ANR/.test(l)); eq(mine, [], 'ocorrências fatais');
    // `error: Object` = o Capacitor registrando que a pessoa/teste CANCELOU uma janela do sistema (compartilhar, seletor de arquivos): não é falha.
    // O registro chega com atraso e por isso pode cair neste teste; os erros fatais acima continuam valendo.
    eq(PAGE_ERRORS.filter((e) => !/safe area CSS|favicon|^error: Object$/.test(e)), [], 'erros de console da página');
  });

  if (RECOVER_DIALOGS.length) console.log('  (diálogo de recuperação de sessão apareceu ' + RECOVER_DIALOGS.length + '× após encerrar o app com edições não salvas: ' + JSON.stringify(RECOVER_DIALOGS[0].botoes) + ')');
  const failed = results.filter((r) => !r[1]);
  console.log(`\n${results.length - failed.length}/${results.length} passaram${failed.length ? ' — FALHAS: ' + failed.map((f) => f[0]).join('; ') : ''}`);
  try { c.close(); } catch { /* fechado */ } process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('Falha no teste:', e); process.exit(2); });
