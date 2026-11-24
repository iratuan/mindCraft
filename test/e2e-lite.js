'use strict';
// Ponta a ponta do MindCraft Lite no Electron real (electron/main.js + renderer/): tela inicial, mapa, gravação e reabertura do .mom,
// preservação dos dados de estudo de um arquivo antigo (passagem, sem apagar), painel de mapas e rede de conhecimento.
// Roda com: npx electron test/e2e-lite.js   · capturas em docs/evidencias/lite/
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const AdmZip = require('adm-zip');
const { makePdf } = require('./pdf-fixture');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-lite-'));
const EVID = path.join(__dirname, '..', 'docs', 'evidencias', 'lite');
fs.mkdirSync(EVID, { recursive: true });
app.setPath('userData', path.join(TMP, 'userData'));
process.env.MINDCRAFT_NO_LAUNCH = '1';
for (const s of ['disable-backgrounding-occluded-windows', 'disable-renderer-backgrounding', 'disable-background-timer-throttling']) app.commandLine.appendSwitch(s);
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, timeout = 15000) {
  const t0 = Date.now();
  for (;;) {
    try { if (await fn()) return true; } catch { /* tenta de novo */ }
    if (Date.now() - t0 > timeout) throw new Error('tempo esgotado');
    await wait(60);
  }
}

// Arquivo .mom "antigo", com dados de estudo que o Lite não mostra: têm de sobreviver a salvar e reabrir.
function makeLegacyFixture(file) {
  const z = new AdmZip();
  const doc = {
    version: 40,
    mapInfo: { id: 'fx1', name: 'Concurso', rootId: 'r', themeId: '', style: {}, template: {}, creator: { userId: 4, userName: 'Guest', firstName: 'Guest', lastName: '' } },
    mapUsers: { 4: { userId: 4, userName: 'Guest', firstName: 'Guest', lastName: '' } },
    mcSimulados: [{ id: 's1', d: '2026-10-01', name: 'Simulado 1', rows: [{ nodeId: 'a', done: 10, correct: 7 }] }],
    mcGoals: { minutesWeek: 120, questionsWeek: 50 },
    mcVideos: [{ id: 'v1', name: 'Aula 1', url: 'https://example.com/aula' }],
    mcExam: { name: 'Prova', date: '2026-12-01' },
  };
  const nodes = [
    { id: 'r', title: 'Direito', index: 0, style: { valign: 32000, halign: 32000, orientation: 101 } },
    { id: 'a', parentId: 'r', title: 'Constitucional', index: 0, style: {}, notes: { text: 'Veja [[Direito]]' },
      mc: { markers: ['p1'], study: { weight: 3, next: '2026-10-20', q: { done: 10, correct: 7 } }, videoRef: { videoId: 'v1', time: 12, title: 'Aula 1' } } },
  ];
  z.addFile('document.json', Buffer.from(JSON.stringify(doc)));
  z.addFile('nodes.json', Buffer.from(JSON.stringify(nodes)));
  z.addFile('themes.json', Buffer.from('{}'));
  z.addFile('changes.json', Buffer.from('[]'));
  fs.writeFileSync(file, z.toBuffer());
  return { doc, nodes };
}

// Arquivo do Mindomo com tópicos SOLTOS (o pai não existe na árvore): têm de aparecer no canvas, à direita do mapa.
function makeFloatingFixture(file) {
  const z = new AdmZip();
  const doc = { version: 40, mapInfo: { id: 'fx2', name: 'Soltos', rootId: 'r', themeId: '', style: {}, template: {}, creator: { userId: 4, userName: 'Guest', firstName: 'Guest', lastName: '' } }, mapUsers: {} };
  const nodes = [
    { id: 'r', title: 'Mapa principal', index: 0, style: {} },
    { id: 'a', parentId: 'r', title: 'Tópico ligado', index: 0, style: {} },
    { id: 'f1', parentId: 'fantasma', title: 'Tópico solto um com um título bem longo para ocupar espaço', index: 0, style: {} },
    { id: 'f2', parentId: 'f1', title: 'Filho do solto', index: 0, style: {} },
  ];
  z.addFile('document.json', Buffer.from(JSON.stringify(doc)));
  z.addFile('nodes.json', Buffer.from(JSON.stringify(nodes)));
  z.addFile('themes.json', Buffer.from('{}'));
  z.addFile('changes.json', Buffer.from('[]'));
  fs.writeFileSync(file, z.toBuffer());
}

async function main() {
  const results = [];
  const check = async (name, fn) => {
    try { await fn(); results.push([name, true]); console.log('  ok   ' + name); }
    catch (e) { results.push([name, false, e.message]); console.log('  FAIL ' + name + '\n       ' + e.message); }
  };
  await waitFor(() => BrowserWindow.getAllWindows().length > 0);
  const win = BrowserWindow.getAllWindows()[0];
  const errors = [];
  win.webContents.on('console-message', (e) => { const lv = e.level ?? e.level; if (lv === 'error' || lv >= 3) errors.push(e.message + " @ " + (e.sourceId || "?").split("/").pop() + ":" + (e.lineNumber || "?")); });
  const js = (code) => win.webContents.executeJavaScript(code);
  const RESET_TABS = "tabs.forEach((t) => { if (t.state) t.state.dirty = false; }); dirty = false; tabs = []; activeIdx = -1;";
  // a captura falha às vezes logo após a tela aparecer (quadro da GPU ainda não pronto): tenta de novo
  const shot = async (name) => {
    let img, last;
    for (let i = 0; i < 4 && !img; i++) { try { img = await win.webContents.capturePage(); } catch (e) { last = e; await new Promise((r) => setTimeout(r, 500)); } }
    if (!img) throw last;
    fs.writeFileSync(path.join(EVID, name + '.png'), img.toPNG());
  };
  await waitFor(() => js("!!(window.MCReact && document.getElementById('hmNew'))"));
  await waitFor(() => js("document.getElementById('splash').hidden === true"), 20000);   // a abertura sai sozinha (vídeo ou limite de 12 s)
  const target = path.join(TMP, 'mapa-lite.mom');
  const legacy = path.join(TMP, 'concurso-antigo.mom');
  const legacyData = makeLegacyFixture(legacy);

  await check('tela inicial aparece ao abrir o app', async () => {
    assert.strictEqual(await js("document.getElementById('home').hidden"), false);
    assert.ok(await js("!!document.getElementById('hmNew')"));
  });
  await shot('01-tela-inicial');

  await check('novo mapa a partir da tela inicial', async () => {
    await js("document.getElementById('hmNew').click()");
    await waitFor(() => js('typeof map !== "undefined" && map.root.children.length === 3'));
    assert.strictEqual(await js("document.getElementById('home').hidden"), true);
    assert.ok(await js("document.querySelectorAll('#view .node').length") >= 4, 'o mapa deveria mostrar a raiz e os 3 tópicos');
  });

  await check('criar tópico filho pelo código do app e refletir na tela', async () => {
    await js("act.child()");
    await js("endEdit(false)");
    const n = await js("map.walk ? (() => { let c = 0; map.walk(() => c++); return c; })() : 0");
    assert.strictEqual(n, 5, 'raiz + 3 tópicos + 1 novo');
  });

  await check('gravar .mom e reabrir: título, árvore e nota preservados', async () => {
    await js(`(() => { const r = map.find(map.root.id); map.update(map.root.children[0].id, { notes: 'Nota com [[Outro mapa]]' }); return true; })()`);
    await js(`writeMom(map, ${JSON.stringify(target)})`);
    assert.ok(fs.existsSync(target), 'arquivo não foi criado');
    await js(`openPath(${JSON.stringify(target)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.children.length === 4'));
    const notes = await js('map.root.children[0].notes');
    assert.strictEqual(notes, 'Nota com [[Outro mapa]]');
  });

  await check('arquivo antigo: dados de estudo e documento sobrevivem a abrir e salvar (não são apagados)', async () => {
    await js(RESET_TABS);   // cada teste parte de um mapa limpo (abas de testes anteriores são descartadas)
    await js(`openPath(${JSON.stringify(legacy)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Direito"'));
    const out = path.join(TMP, 'concurso-salvo.mom');
    await js(`writeMom(map, ${JSON.stringify(out)})`);
    const z = new AdmZip(out);
    const doc = JSON.parse(z.getEntry('document.json').getData().toString('utf8'));
    const nodes = JSON.parse(z.getEntry('nodes.json').getData().toString('utf8'));
    const a = nodes.find((n) => n.id === 'a');
    assert.deepStrictEqual(a.mc.study, legacyData.nodes[1].mc.study, 'estudo do tópico mudou');
    assert.deepStrictEqual(a.mc.videoRef, legacyData.nodes[1].mc.videoRef, 'referência de vídeo mudou');
    assert.deepStrictEqual(a.mc.markers, ['p1'], 'marcador de prioridade mudou');
    for (const k of ['mcSimulados', 'mcGoals', 'mcVideos', 'mcExam']) assert.deepStrictEqual(doc[k], legacyData.doc[k], k + ' mudou');
  });

  await check('rede de conhecimento mostra o mapa e os links [[ ]]', async () => {
    await js('act.graph()');
    await waitFor(() => js("document.querySelectorAll('#gview .gn').length > 0"));
    assert.ok(await js("document.querySelectorAll('#gview .gn').length") >= 2);
    await shot('02-rede-de-conhecimento');
    await js('closeGraph()');
  });

  await check('painel de mapas (dashboard) resume o mapa aberto', async () => {
    await js('act.dash()');
    await waitFor(() => js("!document.getElementById('dashCurrent') ? false : document.getElementById('dashCurrent').textContent.includes('tópicos')"));
    await shot('03-painel-de-mapas');
    await js('act.dash()');
  });

  await check('leitor de PDF abre ao lado do mapa e fecha', async () => {
    await js('act.pdf()');
    await waitFor(() => js("!document.getElementById('pdfpane').hidden"));
    await js("document.getElementById('pdfClose').click()");
    await waitFor(() => js("document.getElementById('pdfpane').hidden === true"));
  });

  await check('mapa com os painéis laterais (Estilo, Notas, Conexões, Estrutura)', async () => {
    assert.ok(await js("document.querySelectorAll('#ptabs .ptab').length") === 5, 'deveriam ser 5 abas');
    await shot('04-mapa-e-paineis');
  });

  await check('selecionar texto no PDF cria tópico e anota no tópico selecionado', async () => {
    const pdf = path.join(TMP, 'lei-teste.pdf');
    makePdf(pdf, 'Artigo quinto da Constituicao');
    await js(`window.MCReact.openPdf({ path: ${JSON.stringify(pdf)}, name: 'Lei teste' })`);
    await waitFor(() => js("!!document.querySelector('#pdfScroll .textLayer span')"), 20000);
    const select = (word) => js(`(() => { const sp = [...document.querySelectorAll('#pdfScroll .textLayer span')].find((x) => x.textContent.includes(${JSON.stringify(word)})); if (!sp) return false;
      const r = document.createRange(); r.selectNodeContents(sp); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      document.getElementById('pdfScroll').dispatchEvent(new MouseEvent('mouseup', { bubbles: true })); return true; })()`);
    assert.strictEqual(await select('Constituicao'), true, 'trecho não encontrado na camada de texto');
    await waitFor(() => js("!!document.getElementById('pdfMkTopic')"), 5000);
    await shot('05-selecao-no-pdf');
    await js("document.getElementById('pdfMkTopic').click()");
    await waitFor(() => js(`(() => { let f = false; map.walk((n) => { if (n.title.includes('Constituicao') && (n.refs || []).length) f = true; }); return f; })()`), 5000);
    await js(`(() => { const t = map.root.children.length; return t; })()`);
    assert.strictEqual(await js(`(() => { let k = 0; map.walk((n) => { if ((n.refs || []).length) k++; }); return k; })()`), 1, 'o tópico criado deveria carregar a referência do PDF');
    // anotar: seleciona de novo e manda para as notas do tópico selecionado
    await js("act.sibling ? 0 : 0");
    await select('quinto');
    await waitFor(() => js("!!document.getElementById('pdfMkNote')"), 5000);
    await js("document.getElementById('pdfMkNote').click()");
    await waitFor(() => js(`(() => { let f = false; map.walk((n) => { if ((n.notes || '').includes('quinto')) f = true; }); return f; })()`), 5000);
    await js("document.getElementById('pdfClose').click()");
  });

  await check('tópicos soltos do Mindomo entram no enquadramento: mapa e soltos inteiros na tela', async () => {
    const soltos = path.join(TMP, 'soltos.mom');
    makeFloatingFixture(soltos);
    await js(`openPath(${JSON.stringify(soltos)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Mapa principal"'));
    await wait(300);
    const r = await js(`(() => { const st = stage.getBoundingClientRect(); const boxes = []; const add = (x, y, w, h) => boxes.push({ x: x * pan.k + pan.x, y: y * pan.k + pan.y, w: w * pan.k, h: h * pan.k });
      add(L.bounds.x, L.bounds.y, L.bounds.w, L.bounds.h); for (const { fl, dx, dy } of (L.floats || [])) add(fl.bounds.x + dx, fl.bounds.y + dy, fl.bounds.w, fl.bounds.h);
      return { floats: (L.floats || []).length, stage: [st.width, st.height], boxes }; })()`);
    assert.strictEqual(r.floats, 1, 'o tópico solto deveria ser desenhado');
    for (const b of r.boxes) assert.ok(b.x >= -1 && b.y >= -1 && b.x + b.w <= r.stage[0] + 1 && b.y + b.h <= r.stage[1] + 1, 'caixa fora da tela: ' + JSON.stringify(b) + ' tela ' + r.stage);
    await shot('05-topicos-soltos');
  });

  await check('tópico solto é editável: clicar, editar o texto, criar filho e salvar', async () => {
    const soltos = path.join(TMP, 'soltos-editar.mom');
    makeFloatingFixture(soltos);
    await js(`openPath(${JSON.stringify(soltos)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Mapa principal"'));
    await wait(300);
    const pt = await js(`(() => { const r = document.querySelector('[data-id="f1"] rect').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`);
    win.webContents.sendInputEvent({ type: 'mouseDown', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    win.webContents.sendInputEvent({ type: 'mouseUp', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    await waitFor(() => js("selectedId === 'f1'"));
    await js('startEdit()');
    assert.strictEqual(await js("!document.getElementById('editor').hidden"), true, 'o campo de edição deveria abrir');
    await js(`(() => { editor.value = 'Editado no solto'; editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); return true; })()`);
    await waitFor(() => js("map.find('f1').node.title === 'Editado no solto'"));
    await js('selectedId = "f1"; selIds = new Set(["f1"]); act.child();');
    assert.strictEqual(await js("map.find('f1').node.children.length"), 2, 'o filho novo deveria entrar no tópico solto');
    const out = path.join(TMP, 'soltos-editados.mom');
    await js(`writeMom(map, ${JSON.stringify(out)})`);
    const nodes = JSON.parse(new AdmZip(out).getEntry('nodes.json').getData().toString('utf8'));
    assert.ok(nodes.find((n) => n.title === 'Editado no solto'), 'a edição não foi gravada');
    assert.strictEqual(nodes.find((n) => n.id === 'f1').parentId, 'fantasma', 'o tópico solto não deve ser reconectado à raiz');
    await shot('06-topico-solto-editado');
  });

  await check('ligar dois tópicos pelo mapa aparece na rede de conhecimento', async () => {
    const f = path.join(TMP, 'ligar.mom');
    makeFloatingFixture(f);
    await js(`openPath(${JSON.stringify(f)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Mapa principal"'));
    await wait(300);
    const at = async (id) => js(`(() => { const r = document.querySelector('[data-id="${id}"] rect').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`);
    const click = (p) => { win.webContents.sendInputEvent({ type: 'mouseDown', x: p.x, y: p.y, button: 'left', clickCount: 1 }); win.webContents.sendInputEvent({ type: 'mouseUp', x: p.x, y: p.y, button: 'left', clickCount: 1 }); };
    await js('selectedId = "a"; selIds = new Set(["a"]); render(); act.relate();');
    await wait(150);
    click(await at('f1'));
    await waitFor(() => js('map.meta.relations.length === 1'));
    const rel = await js('JSON.stringify(map.meta.relations[0])');
    assert.ok(JSON.parse(rel).from === 'a' && JSON.parse(rel).to === 'f1', 'a relação deve ir de "a" para "f1": ' + rel);
    await js('act.graph()');
    await waitFor(() => js("document.querySelectorAll('#gview .gn').length > 0"));
    const edges = await js(`(() => { const g = buildGraph(gatherMaps('map').maps); return g.edges.filter((e) => e.type === 'relation').length; })()`);
    assert.ok(edges >= 1, 'a rede deveria ter a ligação entre os tópicos');
    await wait(400);
    await shot('07-rede-com-ligacao');
    await js('closeGraph()');
  });

  await check('menu de contexto do tópico: clique direito abre as opções de texto e aplica o alinhamento', async () => {
    await js('selectedId = "a"; selIds = new Set(["a"]); render();');
    await wait(150);
    const p = await js(`(() => { const r = document.querySelector('[data-id="a"] rect').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`);
    win.webContents.sendInputEvent({ type: 'mouseDown', x: p.x, y: p.y, button: 'right', clickCount: 1 });
    win.webContents.sendInputEvent({ type: 'mouseUp', x: p.x, y: p.y, button: 'right', clickCount: 1 });
    await waitFor(() => js("!document.getElementById('ctxMenu').hidden"));
    // o menu tem grupos (não uma lista plana): Texto, Forma, Marcadores, Progresso, Estrutura, Nota e ligações
    const groups = await js("[...document.querySelectorAll('#ctxMenu .ctx-item.has-sub .ctx-label')].map((e) => e.textContent).join('|')");
    for (const g of ['Texto', 'Forma', 'Marcadores', 'Progresso', 'Estrutura', 'Nota e ligações']) assert.ok(groups.split('|').includes(g), 'grupo ausente: ' + g + ' em ' + groups);
    await shot('08-menu-de-contexto');
    // caminho real de submenus: Texto ▸ Alinhar ▸ Direita
    const clickItem = (text) => js(`(() => { const b = [...document.querySelectorAll('.ctx-menu .ctx-item')].find((x) => x.querySelector('.ctx-label').textContent === ${JSON.stringify(text)}); if (!b) return false; b.click(); return true; })()`);
    assert.strictEqual(await clickItem('Texto'), true, 'grupo Texto');
    await waitFor(() => js("[...document.querySelectorAll('.ctx-menu .ctx-label')].some((e) => e.textContent === 'Alinhar')"));
    assert.strictEqual(await clickItem('Alinhar'), true, 'grupo Alinhar');
    await waitFor(() => js("[...document.querySelectorAll('.ctx-menu .ctx-label')].some((e) => e.textContent === 'Direita')"));
    assert.strictEqual(await clickItem('Direita'), true, 'opção Direita');
    await waitFor(() => js("document.getElementById('ctxMenu').hidden === true"));
    await waitFor(() => js('map.find("a").node.style.align === "right"'));
    assert.strictEqual(await js("document.getElementById('ctxMenu').hidden"), true, 'o menu deveria fechar após a ação');
  });

  await check('Alt + arrastar liga dois tópicos; a ligação entra na rede', async () => {
    const f = path.join(TMP, 'alt-ligar.mom');
    makeFloatingFixture(f);
    await js(`openPath(${JSON.stringify(f)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Mapa principal"'));
    await wait(300);
    const at = (id) => js(`(() => { const r = document.querySelector('[data-id="${id}"] rect').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`);
    const a = await at('a'), t = await at('f1');
    win.webContents.sendInputEvent({ type: 'mouseDown', x: a.x, y: a.y, button: 'left', clickCount: 1, modifiers: ['alt'] });
    for (let i = 1; i <= 8; i++) win.webContents.sendInputEvent({ type: 'mouseMove', x: Math.round(a.x + (t.x - a.x) * i / 8), y: Math.round(a.y + (t.y - a.y) * i / 8), button: 'left', modifiers: ['alt', 'leftButtonDown'] });
    win.webContents.sendInputEvent({ type: 'mouseUp', x: t.x, y: t.y, button: 'left', clickCount: 1, modifiers: ['alt'] });
    await waitFor(() => js('map.meta.relations.length === 1'));
    const rel = JSON.parse(await js('JSON.stringify(map.meta.relations[0])'));
    assert.ok(rel.from === 'a' && rel.to === 'f1', 'ligação errada: ' + JSON.stringify(rel));
    const edges = await js(`buildGraph(gatherMaps('map').maps).edges.filter((e) => e.type === 'relation').length`);
    assert.ok(edges >= 1, 'a rede deveria mostrar a ligação');
  });

  await check('ícone de nota abre a nota do tópico em modo de edição', async () => {
    await js(RESET_TABS);   // cada teste parte de um mapa limpo (abas de testes anteriores são descartadas)
    await js(`openPath(${JSON.stringify(legacy)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Direito"'));
    await wait(300);
    const p = await js(`(() => { const r = document.querySelector('[data-id="a"] .note-icon').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`);
    win.webContents.sendInputEvent({ type: 'mouseDown', x: p.x, y: p.y, button: 'left', clickCount: 1 });
    win.webContents.sendInputEvent({ type: 'mouseUp', x: p.x, y: p.y, button: 'left', clickCount: 1 });
    await waitFor(() => js("!document.querySelector('.panel[data-panel=\"notes\"]').hidden"));
    await waitFor(() => js('document.activeElement === notes'));
    assert.strictEqual(await js('selectedId'), 'a');
    await shot('09-nota-do-topico');
  });

  await check('tecla N abre a nota do tópico selecionado (com nota nova em outro tópico)', async () => {
    await js('selectedId = "r"; selIds = new Set(["r"]); render();');
    await js("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }))");
    await waitFor(() => js('document.activeElement === notes'));
    assert.strictEqual(await js('selectedId'), 'r');
  });

  await check('assistente: sem chave, pede a chave; inserir tópicos entra em um lote desfazível; mapa trocado não recebe nada', async () => {
    await js('selectedId = "a"; selIds = new Set(["a"]); render(); showPanel("ai");');
    await waitFor(() => js("document.getElementById('aiKeyState').textContent.length > 0"));
    await js('document.getElementById("aiQ").value = "O que é o direito?"; aiRun("answer");');
    await waitFor(() => js("document.getElementById('aiMsg').textContent.includes('chave')"));
    const before = await js('map.find("a").node.children.length');
    const undoBefore = await js('map._undo.length');
    await js(`aiOutline = { map, parentId: "a", topics: [{ title: "Ramo novo", children: [{ title: "Folha", children: [] }] }, { title: "Outro ramo", children: [] }] }; aiInsert();`);
    assert.strictEqual(await js('map.find("a").node.children.length'), before + 2, 'os dois ramos deveriam entrar');
    assert.strictEqual(await js('map._undo.length'), undoBefore + 1, 'a inserção deve ser UM passo de desfazer');
    assert.strictEqual(await js("document.getElementById('aiBusy').hidden"), true, 'o indicador de carregamento deve sumir quando a resposta chega');
    await shot('11-assistente');
    await js(`aiOutline = { map: {}, parentId: "a", topics: [{ title: "Intruso", children: [] }] }; aiInsert();`);
    assert.strictEqual(await js('map.find("a").node.children.length'), before + 2, 'resposta de outro mapa não pode entrar');
    assert.ok(await js("document.getElementById('aiMsg').textContent.includes('mudou')"));
  });

  await check('tema Desenho (à mão): monocromático, sem sombras e com o traço aplicado na tela', async () => {
    await js(RESET_TABS);   // cada teste parte de um mapa limpo (abas de testes anteriores são descartadas)
    await js(`openPath(${JSON.stringify(legacy)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Direito"'));
    await js('map.meta.theme = "draw"; render();');
    await wait(300);
    assert.ok(await js("!!document.querySelector('#view g[filter=\"url(#mc-sketch)\"]')"), 'o traço de mão deveria estar aplicado');
    await shot('10-tema-desenho');
    await js('map.meta.theme = "ocean"; render();');
  });

  await check('mapa grande abre com todos os níveis visíveis e Organizar não recolhe nenhum ramo', async () => {
    const big = path.join(TMP, 'grande.mom');
    const z = new AdmZip();
    const nodes = [{ id: 'r', title: 'Raiz', index: 0, style: {} }];
    let k = 0;
    for (let i = 0; i < 12; i++) {
      const pid = 'p' + i;
      nodes.push({ id: pid, parentId: 'r', title: 'Ramo ' + i, index: i, style: {} });
      for (let j = 0; j < 12; j++) {
        const cid = 'c' + (k++);
        nodes.push({ id: cid, parentId: pid, title: 'Tópico ' + k, index: j, style: {} });
        for (let q = 0; q < 1; q++) nodes.push({ id: cid + 'x', parentId: cid, title: 'Detalhe ' + k, index: 0, style: {} });
      }
    }
    z.addFile('document.json', Buffer.from(JSON.stringify({ version: 40, mapInfo: { id: 'g', name: 'Grande', rootId: 'r', themeId: '', style: {}, template: {}, creator: { userId: 4, userName: 'Guest', firstName: 'Guest', lastName: '' } }, mapUsers: {} })));
    z.addFile('nodes.json', Buffer.from(JSON.stringify(nodes)));
    z.addFile('themes.json', Buffer.from('{}'));
    z.addFile('changes.json', Buffer.from('[]'));
    fs.writeFileSync(big, z.toBuffer());
    await js(`openPath(${JSON.stringify(big)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Raiz"'));
    await wait(300);
    const count = () => js('(() => { let n = 0, hid = 0; const v = (x) => { n++; if (x.collapsed) hid++; x.children.forEach(v); }; v(map.root); return n + "/" + hid; })()');
    const [total, hidden] = (await count()).split('/').map(Number);
    assert.strictEqual(total, 301, 'o arquivo tem 301 tópicos');
    assert.strictEqual(hidden, 0, 'abrir um mapa grande não recolhe ramos sozinho, há ' + hidden + ' recolhidos');
    assert.strictEqual(await js('map._undo.length'), 0, 'abrir não cria ação de desfazer');
    await js('organizeMap()');
    await wait(300);
    assert.strictEqual((await count()).split('/')[1], '0', 'Organizar não pode recolher ramos');
    assert.ok(/todos na disposição/.test(await js("document.querySelector('#statusbar').textContent")), 'a barra deve informar a organização');
  });

  await check('tema da interface Desenho aplica-se a toda a janela; o botão mostra o tema atual e cicla', async () => {
    await js('setUiTheme("draw")');
    assert.strictEqual(await js("document.body.classList.contains('ui-draw')"), true);
    assert.strictEqual(await js("document.getElementById('uiTheme').value"), 'draw');
    assert.match(await js("document.getElementById('lightToggle').title"), /Desenho/);
    // o botão cicla: desenho -> pixel -> escuro -> claro -> desenho (quatro cliques voltam ao início)
    const seen = [];
    for (let i = 0; i < 4; i++) { await js("document.getElementById('lightToggle').click()"); seen.push(await js("document.getElementById('uiTheme').value")); }
    assert.deepStrictEqual(seen, ['pixel', 'dark', 'light', 'draw'], 'ordem do botão de tema');
    assert.strictEqual(await js("document.body.classList.contains('ui-draw')"), true, 'depois de dar a volta, volta ao Desenho');
    await js('setUiTheme("draw")'); await wait(200); await shot('12-interface-desenho');
    await js('setUiTheme("dark")');
  });

  await check('tópicos soltos não têm moldura limitadora tracejada', async () => {
    assert.strictEqual(await js("document.querySelectorAll('#view rect[stroke-dasharray=\"6 5\"]').length"), 0);
  });

  await check('clicar no número de filhos de um tópico recolhido expande o tópico', async () => {
    const big = path.join(TMP, 'grande.mom');
    await js(`openPath(${JSON.stringify(big)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Raiz"'));
    // abrir não recolhe mais sozinho: recolhe-se um ramo aqui, para haver um número de filhos para clicar
    await js('(() => { map.find("p0").node.collapsed = true; render(); return true; })()');
    await wait(200);
    await wait(300);
    const id = await js('(() => { const b = document.querySelector(".fold-badge.collapsed"); return b ? b.dataset.fold : null; })()');
    assert.ok(id, 'deveria haver um tópico recolhido com o número de filhos');
    const p = await js(`(() => { const r = document.querySelector('.fold-badge.collapsed circle').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`);
    win.webContents.sendInputEvent({ type: 'mouseDown', x: p.x, y: p.y, button: 'left', clickCount: 1 });
    win.webContents.sendInputEvent({ type: 'mouseUp', x: p.x, y: p.y, button: 'left', clickCount: 1 });
    await waitFor(() => js(`map.find("${id}").node.collapsed === false`));
  });

  await check('canal IPC da IA recebe o modo do pedido (sem chave: mensagem de chave, não de modo)', async () => {
    const r = await js(`require('electron').ipcRenderer.invoke('ai:ask', { provider: 'groq', mode: 'notes', selection: 'Tópico de teste' })`);
    assert.strictEqual(r.ok, false);
    assert.ok(/chave/.test(r.error), 'deveria pedir a chave, obtido: ' + r.error);
    const t = await js(`require('electron').ipcRenderer.invoke('ai:test', 'claude')`);
    assert.ok(/chave do Claude/.test(t.error), 'o teste deveria usar o provedor escolhido: ' + t.error);
  });

  await check('nota gerada pela IA é guardada na nota do tópico pelo botão "Guardar na nota"', async () => {
    await js(RESET_TABS);   // cada teste parte de um mapa limpo (abas de testes anteriores são descartadas)
    await js(`openPath(${JSON.stringify(legacy)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Direito"'));
    await wait(200);
    await js('selectedId = "a"; selIds = new Set(["a"]); render();');
    // resposta da IA simulada no processo de interface: o resto do fluxo (botão, mapa, nota) é o real
    await js(`(() => { const ir = require('electron').ipcRenderer; const orig = ir.invoke.bind(ir); ir.invoke = (ch, ...a) => ch === 'ai:ask' ? Promise.resolve({ ok: true, text: 'Ideia central: legalidade. Exemplo: só a lei autoriza. Pergunta: quem pode criar obrigações?' }) : orig(ch, ...a); })()`);
    await js('document.getElementById("aiNotes").click()');
    await waitFor(() => js("!document.getElementById('aiOut').hidden"));
    const before = await js('map.find("a").node.notes');
    // clique REAL do mouse no botão (não o .click() do DOM): pega elemento que cobre o botão ou eventos bloqueados
    const bt = await js(`(() => { const r = document.getElementById('aiToNote').getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), hitId: hit && (hit.id || hit.closest('[id]')?.id) }; })()`);
    assert.strictEqual(bt.hitId, 'aiToNote', 'outro elemento cobre o botão "Guardar na nota": ' + bt.hitId);
    win.webContents.sendInputEvent({ type: 'mouseDown', x: bt.x, y: bt.y, button: 'left', clickCount: 1 });
    win.webContents.sendInputEvent({ type: 'mouseUp', x: bt.x, y: bt.y, button: 'left', clickCount: 1 });
    await waitFor(() => js('map.find("a").node.notes.includes("Ideia central: legalidade")'));
    const after = await js('map.find("a").node.notes');
    assert.ok(after.startsWith(before.trim()), 'a nota anterior deve ser preservada');
    assert.ok(after.includes('Pergunta: quem pode criar obrigações?'));
    assert.ok(!after.includes('> '), 'nota gerada é texto normal, sem citação');
  });

  await check('botão no tópico expande e recolhe os subtópicos (alterna nos dois sentidos)', async () => {
    await js(RESET_TABS);   // cada teste parte de um mapa limpo (abas de testes anteriores são descartadas)
    await js(`openPath(${JSON.stringify(legacy)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Direito"'));
    await wait(200);
    const hasBtn = await js("!!document.querySelector('[data-id=\"r\"] .fold-badge')");
    assert.ok(hasBtn, 'o tópico com subtópicos deve mostrar o botão');
    const clickBtn = async () => { const p = await js(`(() => { const r = document.querySelector('[data-id="r"] .fold-badge circle').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`); win.webContents.sendInputEvent({ type: 'mouseDown', x: p.x, y: p.y, button: 'left', clickCount: 1 }); win.webContents.sendInputEvent({ type: 'mouseUp', x: p.x, y: p.y, button: 'left', clickCount: 1 }); };
    const start = await js('map.find("r").node.collapsed');
    await clickBtn();
    await waitFor(() => js(`map.find("r").node.collapsed === ${!start}`));
    await clickBtn();
    await waitFor(() => js(`map.find("r").node.collapsed === ${start}`));
  });

  await check('material de estudo: exporta Markdown e PDF do mapa (notas, fontes e conexões incluídas)', async () => {
    await js(RESET_TABS);   // cada teste parte de um mapa limpo (abas de testes anteriores são descartadas)
    await js(`openPath(${JSON.stringify(legacy)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Direito"'));
    await wait(200);
    const md = path.join(TMP, 'material.md'), pdf = path.join(TMP, 'material.pdf');
    await js(`exportStudyTo("md", ${JSON.stringify(md)}, { notes: true, sources: true, links: true, byWeight: true })`);
    const text = fs.readFileSync(md, 'utf8');
    assert.match(text, /# Concurso/);   // título do documento = nome do mapa
    assert.match(text, /## 1\.1 Constitucional/);
    await js(`exportStudyTo("pdf", ${JSON.stringify(pdf)}, { notes: true, sources: true, links: true, byWeight: true })`);
    const buf = fs.readFileSync(pdf);
    assert.strictEqual(buf.slice(0, 5).toString('latin1'), '%PDF-', 'o arquivo deve ser um PDF');
    assert.ok(buf.length > 2000, 'PDF pequeno demais: ' + buf.length);
  });

  await check('material de estudo: janela de opções abre com as escolhas', async () => {
    await js('openExportModal()');
    await waitFor(() => js("!!document.getElementById('exportBox')"));
    assert.strictEqual(await js("document.querySelectorAll('#exportBox input[type=checkbox]').length"), 6);
    await js("document.getElementById('exCancel').click()");
    await waitFor(() => js("document.getElementById('modal').hidden === true"));
  });

  await check('prancheta de resolução: desenha com a caneta, fica ao lado do PDF e salva a página como PNG', async () => {
    await js('BOARD_API.openBoard()');
    await waitFor(() => js("!document.getElementById('boardpane').hidden"));
    await wait(200);
    const r = await js(`(() => { const c = document.getElementById('bdCanvas').getBoundingClientRect(); return { x: c.left, y: c.top, w: c.width, h: c.height }; })()`);
    const x0 = Math.round(r.x + r.w * 0.2), y0 = Math.round(r.y + r.h * 0.3);
    win.webContents.sendInputEvent({ type: 'mouseDown', x: x0, y: y0, button: 'left', clickCount: 1, modifiers: ['leftButtonDown'] });
    for (let i = 1; i <= 12; i++) win.webContents.sendInputEvent({ type: 'mouseMove', x: x0 + i * 12, y: y0 + Math.round(Math.sin(i / 2) * 20), button: 'left', modifiers: ['leftButtonDown'] });
    win.webContents.sendInputEvent({ type: 'mouseUp', x: x0 + 144, y: y0, button: 'left', clickCount: 1 });
    await wait(300);
    await waitFor(() => js('BOARD_API.boardState.pages[0].strokes.length === 1'));
    assert.ok(await js('BOARD_API.boardState.pages[0].strokes[0].pts.length') > 3, 'o traço deveria ter vários pontos');
    // a lousa é uma janela flutuante: não é coluna nem empurra o mapa
    const pos = await js("getComputedStyle(document.getElementById('boardpane')).position");
    assert.strictEqual(pos, 'fixed', 'a lousa deve ser uma janela flutuante');
    const png = path.join(TMP, 'pagina-1.png');
    await js(`BOARD_API.exportBoardTo(${JSON.stringify(png)})`);
    const img = fs.readFileSync(png);
    assert.strictEqual(img.slice(1, 4).toString('latin1'), 'PNG', 'o arquivo deve ser PNG');
    await js('BOARD_API.closeBoard()');
  });

  await check('barra do tópico: aparece com seleção, cria subtópico e exclui', async () => {
    await js(RESET_TABS);   // cada teste parte de um mapa limpo (abas de testes anteriores são descartadas)
    await js(`openPath(${JSON.stringify(legacy)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Direito"'));
    await js('selectedId = "a"; selIds = new Set(["a"]); render();');
    await waitFor(() => js("!document.getElementById('nodebar').hidden"));
    const before = await js('map.find("a").node.children.length');
    await js("document.getElementById('nbChild').click()");
    await waitFor(() => js(`map.find("a").node.children.length === ${before + 1}`));
    await js('selectedId = "r"; selIds = new Set(["r"]); render();');
    await waitFor(() => js("document.getElementById('nbDelete').disabled === true"));
  });

  await check('lousa flutuante: arrastar pelo cabeçalho move a janela e a posição é lembrada', async () => {
    await js('BOARD_API.openBoard()');
    await waitFor(() => js("!document.getElementById('boardpane').hidden"));
    await wait(150);
    const before = await js("(() => { const r = document.getElementById('boardpane').getBoundingClientRect(); return { x: r.left, y: r.top }; })()");
    const head = await js("(() => { const r = document.querySelector('#boardpane .bd-head span').getBoundingClientRect(); return { x: r.left + 4, y: r.top + 4 }; })()");
    const ev = (t, x, y) => js(`document.querySelector('#boardpane .bd-head').dispatchEvent(new PointerEvent('${t}', { pointerId: 41, pointerType: 'mouse', clientX: ${x}, clientY: ${y}, button: 0, buttons: 1, bubbles: true }))`);
    await ev('pointerdown', head.x, head.y);
    for (let k = 1; k <= 5; k++) await ev('pointermove', head.x + k * 30, head.y + k * 16);
    await ev('pointerup', head.x + 150, head.y + 80);
    await waitFor(() => js(`Math.abs(document.getElementById('boardpane').getBoundingClientRect().left - ${before.x} - 150) < 2`));
    const saved = await js('JSON.stringify(loadCfg().boardPos)');
    assert.ok(saved && saved !== 'undefined' && saved !== 'null', 'a posição deve ser lembrada');
    await js('BOARD_API.closeBoard()');
  });

  await check('barra do tópico funciona em tópico solto (adiciona, exclui e desfaz) e some com o PDF em foco', async () => {
    const soltos = path.join(TMP, 'barra-soltos.mom');
    makeFloatingFixture(soltos);
    await js(`openPath(${JSON.stringify(soltos)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Mapa principal"'));
    await js('selectedId = "f1"; selIds = new Set(["f1"]); render();');
    await waitFor(() => js("!document.getElementById('nodebar').hidden"));
    const before = await js('map.find("f1").node.children.length');
    await js("document.getElementById('nbChild').click()");
    await waitFor(() => js(`map.find("f1").node.children.length === ${before + 1}`));
    await js('selectedId = "f1"; selIds = new Set(["f1"]); render();');
    await waitFor(() => js("!document.getElementById('nodebar').hidden"));
    await js("document.getElementById('nbDelete').click()");
    await waitFor(() => js('!(map.meta._momFloating && map.meta._momFloating.length)'));
    await js('map.undo(); render();');
    await waitFor(() => js('!!(map.meta._momFloating && map.meta._momFloating.length)'));
    await js('document.body.classList.add("focus-media"); render();');
    await waitFor(() => js("document.getElementById('nodebar').hidden === true"));
    await js('document.body.classList.remove("focus-media"); render();');
  });

  await check('tópico principal se destaca pela logomarca do sistema ao lado do título', async () => {
    await js(RESET_TABS);   // cada teste parte de um mapa limpo (abas de testes anteriores são descartadas)
    await js(`openPath(${JSON.stringify(legacy)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Direito"'));
    await waitFor(() => js("document.querySelectorAll('#view g[aria-hidden=\"true\"] > path').length >= 33"));
    await shot('05-topico-principal');
  });

  await check('barra do tópico: ícones planos, com nome para leitor de tela e dica', async () => {
    await js('selectedId = "r"; selIds = new Set(["r"]); render();');
    await waitFor(() => js("!document.getElementById('nodebar').hidden"));
    const n = await js("document.querySelectorAll('#nodebar button svg').length");
    assert.strictEqual(n, 4, 'quatro botões com ícone');
    const names = await js("[...document.querySelectorAll('#nodebar button')].every((b) => b.getAttribute('aria-label') && b.title)");
    assert.ok(names, 'cada botão tem nome e dica');
    await shot('06-barra-icones');
  });

  await check('lousa: caneta desenha (com pressão) e o dedo não desenha', async () => {
    await js('BOARD_API.openBoard()');
    await waitFor(() => js("!document.getElementById('boardpane').hidden"));
    await wait(150);
    const before = await js('BOARD_API.boardState.pages[0].strokes.length');
    const pen = (type, x, y) => js(`(() => { const c = document.getElementById('bdCanvas'); c.dispatchEvent(new PointerEvent('${type}', { pointerId: 9, pointerType: 'pen', pressure: 0.8, clientX: ${x}, clientY: ${y}, button: 0, buttons: 1, bubbles: true })); return true; })()`);
    const r = await js(`(() => { const c = document.getElementById('bdCanvas').getBoundingClientRect(); return { x: c.left, y: c.top, w: c.width, h: c.height }; })()`);
    await pen('pointerdown', Math.round(r.x + r.w * 0.3), Math.round(r.y + r.h * 0.4));
    for (let i = 1; i <= 8; i++) await pen('pointermove', Math.round(r.x + r.w * 0.3) + i * 10, Math.round(r.y + r.h * 0.4) + i * 3);
    await pen('pointerup', Math.round(r.x + r.w * 0.3) + 80, Math.round(r.y + r.h * 0.4) + 24);
    await waitFor(() => js(`BOARD_API.boardState.pages[0].strokes.length === ${before + 1}`));
    // o dedo (touch) não desenha: a mão apoiada na folha não risca
    await js(`(() => { const c = document.getElementById('bdCanvas'); c.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 10, pointerType: 'touch', clientX: 100, clientY: 100, button: 0, bubbles: true })); c.dispatchEvent(new PointerEvent('pointerup', { pointerId: 10, pointerType: 'touch', clientX: 100, clientY: 100, button: 0, bubbles: true })); return true; })()`);
    await wait(100);
    assert.strictEqual(await js('BOARD_API.boardState.pages[0].strokes.length'), before + 1, 'o toque com o dedo não pode criar traço');
    await js('BOARD_API.closeBoard()');
  });

  await check('lousa: reta, quadrado e círculo desenham formas; a ferramenta escolhida fica destacada', async () => {
    await js('BOARD_API.openBoard()');
    await waitFor(() => js("!document.getElementById('boardpane').hidden"));
    await wait(150);
    const r = await js(`(() => { const c = document.getElementById('bdCanvas').getBoundingClientRect(); return { x: c.left, y: c.top, w: c.width, h: c.height }; })()`);
    const before = await js('BOARD_API.boardState.pages[0].strokes.length');
    for (const tool of ['line', 'rect', 'ellipse']) {
      await js(`document.querySelector('#boardpane [data-bd-tool="${tool}"]').click()`);
      const pressed = await js(`document.querySelector('#boardpane [data-bd-tool="${tool}"]').getAttribute('aria-pressed')`);
      assert.strictEqual(pressed, 'true', tool + ' deve ficar destacada');
      const x0 = Math.round(r.x + r.w * 0.2), y0 = Math.round(r.y + r.h * 0.6);
      await js(`(() => { const c = document.getElementById('bdCanvas'); const ev = (t, x, y) => c.dispatchEvent(new PointerEvent(t, { pointerId: 21, pointerType: 'mouse', clientX: x, clientY: y, button: 0, buttons: 1, bubbles: true })); ev('pointerdown', ${x0}, ${y0}); ev('pointermove', ${x0 + 80}, ${y0 + 40}); ev('pointerup', ${x0 + 80}, ${y0 + 40}); return true; })()`);
    }
    await waitFor(() => js(`BOARD_API.boardState.pages[0].strokes.length === ${before + 3}`));
    const tools = await js('BOARD_API.boardState.pages[0].strokes.slice(-3).map((s) => s.tool).join(",")');
    assert.strictEqual(tools, 'line,rect,ellipse', 'as três formas devem entrar como traços');
    // Shift na reta: o fim vai a múltiplo de 45°
    await js(`document.querySelector('#boardpane [data-bd-tool="line"]').click()`);
    const x1 = Math.round(r.x + r.w * 0.5), y1 = Math.round(r.y + r.h * 0.5);
    await js(`(() => { const c = document.getElementById('bdCanvas'); const ev = (t, x, y, sh) => c.dispatchEvent(new PointerEvent(t, { pointerId: 22, pointerType: 'mouse', clientX: x, clientY: y, button: 0, buttons: 1, shiftKey: sh, bubbles: true })); ev('pointerdown', ${x1}, ${y1}, false); ev('pointermove', ${x1 + 100}, ${y1 + 30}, true); ev('pointerup', ${x1 + 100}, ${y1 + 30}, true); return true; })()`);
    await waitFor(() => js(`BOARD_API.boardState.pages[0].strokes.length === ${before + 4}`));
    const end = await js('(() => { const s = BOARD_API.boardState.pages[0].strokes.at(-1); const a = s.pts[0], b = s.pts[s.pts.length - 1]; return Math.abs(Math.atan2(b.y - a.y, b.x - a.x) % (Math.PI / 4)); })()');
    assert.ok(end < 0.01, 'com Shift a reta deve ficar em múltiplo de 45°');
    await js('BOARD_API.closeBoard()');
  });

  await check('barra superior: desfazer e refazer habilitados pelo histórico e funcionam por clique', async () => {
    await js(RESET_TABS);   // cada teste parte de um mapa limpo (abas de testes anteriores são descartadas)
    await js(`openPath(${JSON.stringify(legacy)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Direito"'));
    const original = await js('map.root.title');
    await js('change(() => map.update(map.root.id, { title: "Alterado no teste" })); render();');
    await waitFor(() => js("document.getElementById('undoBtn').disabled === false"));
    await js("document.getElementById('undoBtn').click()");
    await waitFor(() => js(`map.root.title === ${JSON.stringify(original)}`));
    await waitFor(() => js("document.getElementById('redoBtn').disabled === false"));
    await js("document.getElementById('redoBtn').click()");
    await waitFor(() => js('map.root.title === "Alterado no teste"'));
    await js("document.getElementById('undoBtn').click()");
    await waitFor(() => js(`map.root.title === ${JSON.stringify(original)}`));
  });

  await check('toque: um dedo arrasta o mapa e dois dedos fazem pinça (zoom)', async () => {
    await js(RESET_TABS);   // cada teste parte de um mapa limpo (abas de testes anteriores são descartadas)
    await js(`openPath(${JSON.stringify(legacy)})`);
    await waitFor(() => js('typeof map !== "undefined" && map.root.title === "Direito"'));
    await wait(120);
    const base = await js(`(() => { const r = document.getElementById('svg').getBoundingClientRect(); return { x: r.left + 40, y: r.top + 40, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; })()`);
    const ptr = (type, id, x, y) => js(`document.getElementById('svg').dispatchEvent(new PointerEvent('${type}', { pointerId: ${id}, pointerType: 'touch', clientX: ${x}, clientY: ${y}, bubbles: true, isPrimary: ${id === 41} }))`);
    const x0 = await js('pan.x'), k0 = await js('pan.k');
    await ptr('pointerdown', 41, base.x, base.y);
    for (let i = 1; i <= 5; i++) await ptr('pointermove', 41, base.x + i * 12, base.y + i * 4);
    await ptr('pointerup', 41, base.x + 60, base.y + 20);
    await waitFor(() => js(`Math.abs(pan.x - ${x0} - 60) < 1`));
    // pinça: dois dedos se afastam no centro da tela
    await ptr('pointerdown', 42, base.cx - 40, base.cy);
    await ptr('pointerdown', 43, base.cx + 40, base.cy);
    for (let i = 1; i <= 6; i++) { await ptr('pointermove', 42, base.cx - 40 - i * 10, base.cy); await ptr('pointermove', 43, base.cx + 40 + i * 10, base.cy); }
    await ptr('pointerup', 42, base.cx - 100, base.cy); await ptr('pointerup', 43, base.cx + 100, base.cy);
    await waitFor(() => js(`pan.k > ${k0} * 1.5`));
  });

  await check('barra de menus: Visualizar abre a lousa; Escape fecha; os quatro menus existem', async () => {
    const labels = await js("[...document.querySelectorAll('#menubar .mb-label')].map((b) => b.textContent).join('|')");
    assert.strictEqual(labels, 'Arquivo|Editar|Visualizar|Ajuda');
    await js("document.querySelector('#menubar [data-mb=\"2\"]').click()");
    await waitFor(() => js("!!document.querySelector('.mb-drop [data-cmd=\"board\"]')"));
    await js("document.querySelector('.mb-drop [data-cmd=\"board\"]').click()");
    await waitFor(() => js("!document.getElementById('boardpane').hidden"));
    await js('BOARD_API.closeBoard()');
    await js("document.querySelector('#menubar [data-mb=\"0\"]').click()");
    await waitFor(() => js("!!document.querySelector('.mb-drop')"));
    await js("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))");
    await waitFor(() => js("!document.querySelector('.mb-drop')"));
  });

  await check('lousa maximizável: ocupa a área de trabalho e restaura', async () => {
    await js('BOARD_API.openBoard()');
    await waitFor(() => js("!document.getElementById('boardpane').hidden"));
    await js("document.getElementById('bdMax').click()");
    await waitFor(() => js("document.body.classList.contains('dock-max') && getComputedStyle(document.getElementById('stage')).display === 'none'"));
    const w = await js("Math.round(document.getElementById('boardpane').getBoundingClientRect().width)");
    assert.ok(w > 900, 'maximizada, a lousa deve ocupar quase toda a área de trabalho (largura ' + w + ')');
    await js("document.getElementById('bdMax').click()");
    await waitFor(() => js("!document.body.classList.contains('dock-max')"));
    await js('BOARD_API.closeBoard()');
  });

  await check('mapa aberto só fecha pelo botão ✕: tela inicial e painel de mapas não o fecham', async () => {
    await js(RESET_TABS);   // cada teste parte de um mapa limpo (abas de testes anteriores são descartadas)
    await js(`openPath(${JSON.stringify(legacy)})`);
    await waitFor(() => js('typeof map !== "undefined" && map && map.root.title === "Direito"'));
    await js('act.home(true)');
    await wait(400);
    assert.strictEqual(await js('!!(map && map.root)'), true, 'a tela inicial não pode fechar o mapa');
    await js('act.home(true)');
    await js('act.dash()');
    await wait(400);
    assert.strictEqual(await js('!!(map && map.root)'), true, 'o painel de mapas não pode fechar o mapa');
    await js('closeDash && closeDash()');
    await js('dirty = false');   // alterações de testes anteriores não devem abrir a confirmação ao fechar
    const tabsBefore = await js('tabs.length');
    await js("document.getElementById('closeMapBtn').click()");
    await waitFor(() => js(`tabs.length === ${tabsBefore - 1} || map === null`));
  });

  await check('PDF e lousa abertos juntos: painel direito recolhido, reaberto pelo botão da borda', async () => {
    await js(RESET_TABS);   // cada teste parte de um mapa limpo (abas de testes anteriores são descartadas)
    await js(`openPath(${JSON.stringify(legacy)})`);
    await waitFor(() => js('typeof map !== "undefined" && map && map.root.title === "Direito"'));
    await js('BOARD_API.openBoard()');
    await waitFor(() => js("!document.getElementById('boardpane').hidden"));
    if (await js("document.body.classList.contains('panels-collapsed')")) { await js("document.getElementById('panelsToggle').click()"); await wait(150); }
    const shown = (sel) => js(`getComputedStyle(document.getElementById('panels')).display !== 'none'`);
    assert.strictEqual(await shown(), true, 'só a lousa aberta: o painel deve aparecer');
    await js('document.body.classList.add("pdf-open")');
    await wait(150);
    assert.strictEqual(await shown(), false, 'PDF e lousa juntos: o painel deve ficar recolhido');
    await js("document.getElementById('panelsToggle').click()");
    await wait(150);
    assert.strictEqual(await shown(), true, 'o botão da borda reabre o painel');
    await js("document.getElementById('panelsToggle').click()");
    await wait(150);
    assert.strictEqual(await shown(), false, 'o botão recolhe de novo');
    await js('document.body.classList.remove("pdf-open")');
    await js('BOARD_API.closeBoard()');
  });

  await check('lousa: traço reto da caneta vira reta; curva suave continua traço livre', async () => {
    await js(RESET_TABS);   // cada teste parte de um mapa limpo (abas de testes anteriores são descartadas)
    await js(`openPath(${JSON.stringify(legacy)})`);
    await waitFor(() => js('typeof map !== "undefined" && map && map.root.title === "Direito"'));
    await js('BOARD_API.openBoard()');
    await waitFor(() => js("!document.getElementById('boardpane').hidden"));
    await wait(150);
    const r = await js(`(() => { const c = document.getElementById('bdCanvas').getBoundingClientRect(); return { x: c.left, y: c.top, w: c.width, h: c.height }; })()`);
    await js("document.querySelector('#boardpane [data-bd-tool=\"pen\"]').click()");
    const drawPen = (pts) => js(`(() => { const c = document.getElementById('bdCanvas'); const ev = (t, x, y) => c.dispatchEvent(new PointerEvent(t, { pointerId: 31, pointerType: 'pen', pressure: 0.6, clientX: x, clientY: y, button: 0, buttons: 1, bubbles: true })); const pts = ${JSON.stringify(pts)}; ev('pointerdown', pts[0][0], pts[0][1]); for (const [x, y] of pts.slice(1)) ev('pointermove', x, y); ev('pointerup', pts[pts.length - 1][0], pts[pts.length - 1][1]); return true; })()`);
    const line = Array.from({ length: 14 }, (_, i) => [r.x + r.w * 0.2 + i * 18, r.y + r.h * 0.2 + i * 12]);
    const before = await js('BOARD_API.boardState.pages[0].strokes.length');
    await drawPen(line);
    await waitFor(() => js(`BOARD_API.boardState.pages[0].strokes.length === ${before + 1}`));
    assert.strictEqual(await js('BOARD_API.boardState.pages[0].strokes.at(-1).shape && BOARD_API.boardState.pages[0].strokes.at(-1).shape.kind'), 'line', 'traço reto deve virar reta');
    const wave = Array.from({ length: 60 }, (_, i) => [r.x + r.w * 0.2 + i * 4, r.y + r.h * 0.6 + Math.sin(i / 60 * Math.PI * 2) * 40]);
    await drawPen(wave);
    await waitFor(() => js(`BOARD_API.boardState.pages[0].strokes.length === ${before + 2}`));
    assert.strictEqual(await js('!!BOARD_API.boardState.pages[0].strokes.at(-1).shape'), false, 'curva suave não pode virar forma');
    await js('BOARD_API.closeBoard()');
  });

  await check('ajustar ao canvas: após mudança de layout o mapa inteiro cabe na área visível', async () => {
    await js(RESET_TABS);   // cada teste parte de um mapa limpo (abas de testes anteriores são descartadas)
    await js(`openPath(${JSON.stringify(legacy)})`);
    await waitFor(() => js('typeof map !== "undefined" && map && map.root.title === "Direito"'));
    await js("window.dispatchEvent(new Event('resize'))");
    await wait(200);
    const fits = () => js(`(() => { const r = svg.getBoundingClientRect(); const b = L.bounds, k = pan.k; const x0 = b.x * k + pan.x, x1 = (b.x + b.w) * k + pan.x, y0 = b.y * k + pan.y, y1 = (b.y + b.h) * k + pan.y; return x0 >= -2 && y0 >= -2 && x1 <= r.width + 2 && y1 <= r.height + 2; })()`);
    assert.strictEqual(await fits(), true, 'mapa deve caber na área visível');
    await js("document.getElementById('panelsToggle').click()");
    await wait(300);
    await js("window.dispatchEvent(new Event('resize'))");
    await wait(200);
    assert.strictEqual(await fits(), true, 'ao recolher o painel, o mapa deve reajustar e caber');
    await js("document.getElementById('panelsToggle').click()");
    await wait(200);
  });

  await check('várias abas: novo mapa abre outra aba, trocar restaura o mapa e o ✕ fecha só a sua aba', async () => {
    await js(RESET_TABS);
    await js(`openPath(${JSON.stringify(legacy)})`);
    await waitFor(() => js('typeof map !== "undefined" && map && map.root.title === "Direito"'));
    await js('newMap(); render();');
    await waitFor(() => js('tabs.length === 2 && map.root.title === "Ideia central"'));
    await js(`document.querySelector('#tabbar [data-tab="0"]').click()`);
    await waitFor(() => js('map.root.title === "Direito"'));
    await js(`document.querySelector('#tabbar [data-tab="1"]').click()`);
    await waitFor(() => js('map.root.title === "Ideia central"'));
    await js(`document.querySelector('#tabbar [data-tab="0"]').querySelector('.tab-x').click()`);
    await waitFor(() => js('tabs.length === 1'));
    assert.strictEqual(await js('map.root.title'), 'Ideia central', 'fechar a aba inativa não pode trocar o mapa ativo');
    await js("document.getElementById('closeMapBtn').click()");
    await waitFor(() => js('map === null && tabs.length === 0'));
  });

  await check('lousa: cor e espessura em destaque, caneta com a espessura escolhida, zoom e excluir lousa atualiza o contador', async () => {
    await js("window.BOARD_API.openBoard()");
    await waitFor(() => js("!document.getElementById('boardpane').hidden"));
    await js(`document.querySelector('#boardpane [data-bd-color="#1e63c6"]').click()`);
    const colorOn = await js(`(() => { const b = document.querySelector('#boardpane [data-bd-color="#1e63c6"]'); const cs = getComputedStyle(b); return { on: b.classList.contains('on'), shadow: cs.boxShadow, scale: cs.transform }; })()`);
    assert.ok(colorOn.on && colorOn.shadow !== 'none' && colorOn.scale !== 'none', 'cor selecionada sem destaque: ' + JSON.stringify(colorOn));
    await js(`document.querySelector('#boardpane [data-bd-tool="eraser"]').click()`);
    await js(`document.querySelector('#boardpane [data-bd-width="8"]').click()`);
    await shot('lousa-cor-espessura-destaque');
    const tw = await js(`(() => ({ tool: window.BOARD_API.boardState.tool, width: window.BOARD_API.boardState.width, on: document.querySelector('#boardpane [data-bd-width="8"]').classList.contains('on') }))()`);
    assert.deepStrictEqual(tw, { tool: 'pen', width: 8, on: true }, 'espessura: ' + JSON.stringify(tw));
    const r = await js(`(() => { const c = document.getElementById('bdCanvas').getBoundingClientRect(); return { x: c.left, y: c.top, w: c.width, h: c.height }; })()`);
    const stroke = (x1, y1, x2, y2) => js(`(() => { const c = document.getElementById('bdCanvas'); const ev = (t, x, y) => c.dispatchEvent(new PointerEvent(t, { pointerId: 51, pointerType: 'mouse', button: 0, buttons: t === 'pointerup' ? 0 : 1, clientX: x, clientY: y, bubbles: true })); ev('pointerdown', ${x1}, ${y1}); ev('pointermove', ${x2}, ${y2}); ev('pointerup', ${x2}, ${y2}); })()`);
    await stroke(r.x + 60, r.y + 60, r.x + 180, r.y + 80);
    const last = await js(`(() => { const s = window.BOARD_API.boardState.pages[0].strokes; const k = s[s.length - 1]; return { w: k.width, c: k.color, t: k.tool }; })()`);
    assert.deepStrictEqual(last, { w: 8, c: '#1e63c6', t: 'pen' }, 'traço: ' + JSON.stringify(last));
    // zoom: 125%, a folha cresce e o ponto do centro da tela continua caindo no centro da folha
    await js("document.getElementById('bdZoomIn').click()");
    const z = await js(`(() => { const b = window.BOARD_API.boardState; const c = document.getElementById('bdCanvas'); const cr = c.getBoundingClientRect(); return { zoom: b.zoom, label: document.getElementById('bdZoomLbl').textContent, cssW: Math.round(cr.width), dpr: Math.round(c.width / cr.width * 100) / 100 }; })()`);
    assert.strictEqual(z.zoom, 1.25); assert.strictEqual(z.label, '125%');
    // mede e clica na mesma etapa: o centro da caixa da folha tem de virar o centro da folha
    await js(`(() => { const c = document.getElementById('bdCanvas'); const r = c.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; c.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 52, pointerType: 'mouse', button: 0, buttons: 1, clientX: cx, clientY: cy, bubbles: true })); c.dispatchEvent(new PointerEvent('pointerup', { pointerId: 52, pointerType: 'mouse', button: 0, buttons: 0, clientX: cx, clientY: cy, bubbles: true })); })()`);
    const centre = await js(`(() => { const s = window.BOARD_API.boardState.pages[0].strokes; const p = s[s.length - 1].pts[0]; return { x: p.x, y: p.y, w: boardLogical.w, h: boardLogical.h }; })()`);
    assert.ok(Math.abs(centre.x - centre.w / 2) < 3 && Math.abs(centre.y - centre.h / 2) < 3, 'centro com zoom fora do centro da folha: ' + JSON.stringify(centre));
    await js("document.getElementById('bdZoomLbl').click()");
    assert.strictEqual(await js("window.BOARD_API.boardState.zoom"), 1);
    // excluir lousa: pede confirmação, diminui o contador e muda a lousa atual
    const tracesBefore = await js("window.BOARD_API.boardState.pages[0].strokes.length");
    await js("document.getElementById('bdNew').click()");
    assert.strictEqual(await js("document.getElementById('bdPage').textContent"), '2 / 2');
    // dublê local só para a confirmação desta lousa (sem diálogo nativo no teste): responde "Excluir" e guarda a pergunta
    await js(`(() => { window.__realInvoke = ipcRenderer.invoke; window.__asked = []; ipcRenderer.invoke = async (ch, o) => { if (ch === 'dialog:confirm') { window.__asked.push(o.message); return 0; } return window.__realInvoke(ch, o); }; })()`);
    await js("document.getElementById('bdDelPage').click()");
    await waitFor(() => js("document.getElementById('bdPage').textContent === '1 / 1'"));
    await js("ipcRenderer.invoke = window.__realInvoke; undefined");
    const asked = await js("window.__asked[window.__asked.length - 1]");
    assert.strictEqual(asked, 'Excluir a lousa 2?');
    assert.strictEqual(await js("document.getElementById('bdDelPage').disabled"), true);
    assert.strictEqual(await js("window.BOARD_API.boardState.pages[0].strokes.length"), tracesBefore, 'a lousa 1 deve manter seus traços');
    await js("window.BOARD_API.closeBoard()");
  });

  await check('lousa: com zoom menor a folha cobre a área visível; pinça com dois dedos e rolagem com um dedo', async () => {
    await js("window.BOARD_API.openBoard()");
    await waitFor(() => js("!document.getElementById('boardpane').hidden"));
    await js("document.getElementById('bdZoomLbl').click()");
    for (let i = 0; i < 4; i++) await js("document.getElementById('bdZoomOut').click()");
    const cover = await js(`(() => { const c = document.getElementById('bdCanvas'); const w = c.parentElement; const cr = c.getBoundingClientRect(); return { zoom: window.BOARD_API.boardState.zoom, cw: Math.round(cr.width), ch: Math.round(cr.height), ww: w.clientWidth, wh: w.clientHeight }; })()`);
    assert.strictEqual(cover.zoom, 0.5);
    assert.ok(cover.cw >= cover.ww - 1 && cover.ch >= cover.wh - 1, 'a folha não cobre a área visível a 50%: ' + JSON.stringify(cover));
    await shot('lousa-zoom-50-cobre-area');
    await js("document.getElementById('bdZoomLbl').click()");
    const at = await js(`(() => { const c = document.getElementById('bdCanvas').getBoundingClientRect(); return { x: c.left + c.width / 2, y: c.top + c.height / 2 }; })()`);
    const touch = (type, id, x, y) => js(`document.getElementById('bdCanvas').dispatchEvent(new PointerEvent('${type}', { pointerId: ${id}, pointerType: 'touch', button: 0, buttons: 1, clientX: ${x}, clientY: ${y}, bubbles: true }))`);
    await touch('pointerdown', 61, at.x - 50, at.y);
    await touch('pointerdown', 62, at.x + 50, at.y);
    await touch('pointermove', 62, at.x + 150, at.y);
    await touch('pointerup', 61, at.x - 50, at.y);
    await touch('pointerup', 62, at.x + 150, at.y);
    const pinched = await js("window.BOARD_API.boardState.zoom");
    assert.ok(Math.abs(pinched - 2) < 0.01, 'pinça de 100 px para 200 px deveria dar zoom 200%: ' + pinched);
    await js("document.getElementById('bdCanvas').parentElement.scrollTop = 0; undefined");
    await touch('pointerdown', 63, at.x, at.y);
    await touch('pointermove', 63, at.x, at.y - 100);
    await touch('pointerup', 63, at.x, at.y - 100);
    const scrolled = await js("document.getElementById('bdCanvas').parentElement.scrollTop");
    assert.ok(Math.abs(scrolled - 100) < 2, 'um dedo deveria rolar 100 px: ' + scrolled);
    assert.strictEqual(await js("window.BOARD_API.boardState.pages[0].strokes.length >= 0"), true);
    await js("document.getElementById('bdZoomLbl').click()");
    await js("window.BOARD_API.closeBoard()");
  });

  await check('IA: o botão Limpar apaga o texto gerado sem mexer no mapa', async () => {
    await js("aiShowAnswer('texto de teste da IA', 'answer'); 0");
    await js("newMap(); document.querySelector('.ptab[data-tab=\"ai\"]').click(); 0");
    await waitFor(() => js("!document.querySelector('section[data-panel=\"ai\"]').hidden"));
    await shot('ia-texto-gerado-tema-escuro');
    assert.strictEqual(await js("document.getElementById('aiOut').hidden"), false);
    await js("document.getElementById('aiClear').click()");
    assert.strictEqual(await js("document.getElementById('aiOut').hidden"), true);
    assert.strictEqual(await js("document.getElementById('aiOutText').textContent"), '');
    assert.strictEqual(await js("aiAnswer"), null);
  });
  await check('tema escuro: texto secundário com contraste mínimo de 4,5:1 sobre campos', async () => {
    await js("document.body.classList.remove('light'); 0");
    const r = await js(`(() => { const cs = getComputedStyle(document.documentElement); const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }; const a = lum(cs.getPropertyValue('--text-dim').trim()), b = lum(cs.getPropertyValue('--bg-field').trim()); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); })()`);
    assert.ok(r >= 4.5, 'contraste do texto secundário sobre o campo: ' + r.toFixed(2));
  });
  await check('rede: dois dedos fazem pinça (zoom) e um dedo arrasta a vista', async () => {
    await js("openGraph(); 0");
    await waitFor(() => js("!document.getElementById('graph').hidden"));
    const at = await js(`(() => { const r = document.getElementById('gsvg').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    const k0 = await js("gTrans.k");
    const t = (type, id, x, y) => js(`document.getElementById('gsvg').dispatchEvent(new PointerEvent('${type}', { pointerId: ${id}, pointerType: 'touch', button: 0, buttons: 1, clientX: ${x}, clientY: ${y}, bubbles: true }))`);
    await t('pointerdown', 71, at.x - 50, at.y);
    await t('pointerdown', 72, at.x + 50, at.y);
    await t('pointermove', 72, at.x + 150, at.y);
    await t('pointerup', 71, at.x - 50, at.y);
    await t('pointerup', 72, at.x + 150, at.y);
    const k1 = await js("gTrans.k");
    assert.ok(k1 >= k0 * 1.9, `pinça de 100 px para 200 px deveria dobrar o zoom: ${k0} -> ${k1}`);
    const x0 = await js("gTrans.x");
    await t('pointerdown', 73, at.x, at.y);
    await t('pointermove', 73, at.x + 40, at.y);
    await t('pointerup', 73, at.x + 40, at.y);
    const x1 = await js("gTrans.x");
    assert.ok(Math.abs(x1 - x0 - 40) < 1, `um dedo deveria arrastar 40 px: ${x0} -> ${x1}`);
    await js("closeGraph(); 0");
  });
  await check('tema claro: botão primário com texto branco sobre azul (legível)', async () => {
    await js("document.body.classList.add('light'); 0");
    const c = await js(`(() => { const b = document.getElementById('aiAsk'); const cs = getComputedStyle(b); return { color: cs.color, bg: cs.backgroundColor }; })()`);
    await js("document.body.classList.remove('light'); 0");
    assert.strictEqual(c.color, 'rgb(255, 255, 255)');
    assert.notStrictEqual(c.bg, 'rgb(255, 255, 255)', 'fundo do botão primário no tema claro: ' + c.bg);
  });
  await check('rede 3D: o botão 3D mostra a rede em três dimensões com o peso dos tópicos', async () => {
    await js("openGraph(); 0");
    await waitFor(() => js("!document.getElementById('graph').hidden"));
    await js("document.getElementById('g3dBtn').click(); 0");
    await waitFor(() => js("!!document.querySelector('#g3d canvas')"), 15000);
    const r = await js(`(() => ({ aberto: document.getElementById('g3dBtn').getAttribute('aria-pressed'), svgOculto: document.getElementById('gsvg').hidden, pesos: gLast.nodes.every((n) => Number.isFinite(n.weight)) }))()`);
    assert.deepStrictEqual(r, { aberto: 'true', svgOculto: true, pesos: true });
    await new Promise((res) => setTimeout(res, 2500));   // deixa a simulação assentar antes da captura
    await shot('rede-3d-peso');
    await js("document.getElementById('g3dBtn').click(); 0");
    assert.strictEqual(await js("document.getElementById('gsvg').hidden"), false);
    await js("closeGraph(); 0");
  });
  await check('mover a vista: arrastar com a ferramenta Mover não seleciona o tópico; Organizar refaz a disposição', async () => {
    await js("newMap(); 0");
    await waitFor(() => js("!!document.querySelector('#svg .node')"));
    await js("document.querySelector('[data-act=\"handPan\"]').click(); 0");
    assert.strictEqual(await js("document.body.classList.contains('hand-pan')"), true);
    const at = await js("(() => { const r = document.querySelector('#svg .node').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()");
    const sel0 = await js("selectedId");
    const p0 = await js("pan.x");
    await js(`(() => { const n = document.querySelector('#svg .node'); n.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: ${at.x}, clientY: ${at.y} })); window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: ${at.x + 60}, clientY: ${at.y + 10} })); window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0, clientX: ${at.x + 60}, clientY: ${at.y + 10} })); return 0; })()`);
    assert.ok(Math.abs((await js("pan.x")) - p0 - 60) < 1, 'a vista deveria mover 60 px');
    assert.strictEqual(await js("selectedId"), sel0, 'o tópico não pode mudar de seleção ao mover a vista');
    await js("document.querySelector('[data-act=\"handPan\"]').click(); 0");
    assert.strictEqual(await js("document.body.classList.contains('hand-pan')"), false);
    await js("document.querySelector('[data-act=\"organize\"]').click(); 0");
    assert.strictEqual(await js("document.getElementById('status').textContent.startsWith('Mapa organizado')"), true);
  });
  await check('material de estudo: a janela oferece parágrafos da IA para tópicos sem notas (marcado por padrão)', async () => {
    await js("openExportModal(); 0");
    const r = await js("({ existe: !!document.getElementById('exAi'), marcado: document.getElementById('exAi') && document.getElementById('exAi').checked })");
    await js("document.getElementById('exCancel').click(); 0");
    assert.deepStrictEqual(r, { existe: true, marcado: true });
  });
  await check('exportação com IA: tópicos sem nota recebem parágrafos de revisão (1 a 3) no material', async () => {
    const out = path.join(TMP, 'estudo-com-ia.md');
    await js("newMap(); 0");
    await js(`(() => { window.__realInvoke = ipcRenderer.invoke; window.__aiAsk = []; ipcRenderer.invoke = async (ch, a) => { if (ch === 'ai:key-status') return { provider: 'groq', saved: true, available: true }; if (ch === 'ai:ask') { window.__aiAsk.push(a.selection); return { ok: true, paragraphs: ['Conceito essencial para a prova.', 'Ponto que a banca costuma cobrar.'] }; } return window.__realInvoke(ch, a); }; undefined; })()`);
    try {
      await js(`exportStudyTo('md', ${JSON.stringify(out)}, { notes: true, sources: true, links: true, byWeight: true, aiFill: true }).then(() => 0)`);
    } finally { await js("ipcRenderer.invoke = window.__realInvoke; undefined"); }
    const md = fs.readFileSync(out, 'utf8');
    assert.ok(md.includes('Conceito essencial para a prova.'), 'o material deveria trazer os parágrafos gerados');
    assert.ok(md.includes('gerado pela IA'), 'o texto gerado deve estar sinalizado');
    const calls = await js("window.__aiAsk.length");
    assert.ok(calls >= 1, 'a IA deveria ser consultada para o tópico sem nota');
  });
  await check('menu Ajuda mostra a versão da release', async () => {
    await js("(async () => { for (let i = 0; i < 50 && !window.braniacVersion; i++) await new Promise((r) => setTimeout(r, 100)); return 0; })()");
    const v = await js("window.braniacVersion");
    assert.ok(/^\d+\.\d+\.\d+$/.test(v), 'versão lida: ' + v);
    const label = await js(`(() => { const b = [...document.querySelectorAll('#menubar [data-mb]')].find((x) => x.textContent.trim() === 'Ajuda'); b.click(); const t = document.querySelector('.mb-item[data-cmd="about"] span').textContent; document.querySelector('.mb-drop') && document.querySelector('.mb-drop').remove(); return t; })()`);
    assert.strictEqual(label, `Versão ${v}`);
  });
  await check('fluxograma: cria, insere passo e decisão com ramos, teclado, avisos, exporta e volta ao mapa', async () => {
    await js("act.newFlow(); 0");
    await waitFor(() => js("!document.getElementById('flowpane').hidden"));
    assert.strictEqual(await js("getComputedStyle(document.getElementById('svg')).display"), 'none', 'o mapa mental sai da tela no fluxo');
    assert.strictEqual(await js("document.querySelectorAll('#flowView .flow-node').length"), 1, 'começa com o início');
    await js("(() => { flowAct('step'); flowAct('step', 'decision'); const d = selectedId; flowAct('branch'); flowSelect(d); flowAct('branch'); flowSelect(d); return 0; })()");
    assert.strictEqual(await js("document.querySelectorAll('#flowView .flow-node').length"), 5, 'início, passo, decisão e dois ramos');
    assert.strictEqual(await js("document.querySelectorAll('#flowView .flow-node.decision').length"), 1);
    // com a decisão selecionada e os dois ramos já criados, Enter só avisa (não cria um terceiro ramo)
    await js("(() => { flowKey(new KeyboardEvent('keydown', { key: 'Enter' })); return 0; })()");
    assert.strictEqual(await js("document.querySelectorAll('#flowView .flow-node').length"), 5, 'decisão cheia não ganha terceiro ramo');
    assert.match(await js("document.getElementById('status').textContent"), /já tem os dois ramos/);
    // selecionando o ramo Sim, Enter insere o passo seguinte dele
    await js("(() => { let s = null; map.walk((n) => { if (n.branchLabel === 'Sim') s = n; }); flowSelect(s.id); return 0; })()");
    await js("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); 0");
    assert.strictEqual(await js("document.querySelectorAll('#flowView .flow-node').length"), 6, 'Enter insere passo depois do ramo selecionado');
    await js("document.querySelector('#flowpane [data-flow=\"fit\"]').click(); 0");
    await shot('fluxo-visao');
    await js("document.querySelector('#flowpane [data-flow=\"info\"]').click(); 0");
    await shot('fluxo-caminhos-avisos');
    const info = await js("document.getElementById('flowInfo').textContent");
    assert.match(info, /Caminhos possíveis/);
    assert.match(info, /Avisos/);
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-fluxo-'));
    const md = path.join(dir, 'fluxo.md');
    await js(`exportStudyTo('md', ${JSON.stringify(md)}, { notes: true, aiFill: false }).then(() => 0)`);
    const text = fs.readFileSync(md, 'utf8');
    assert.match(text, /## Caminhos possíveis/);
    assert.match(text, /Sim/);
    const pdf = path.join(dir, 'fluxo.pdf');
    await js(`exportStudyTo('pdf', ${JSON.stringify(pdf)}, { notes: true, aiFill: false }).then(() => 0)`);
    assert.strictEqual(fs.readFileSync(pdf).subarray(0, 4).toString(), '%PDF', 'o fluxo sai em PDF');
    fs.mkdirSync(EVID, { recursive: true });
    fs.copyFileSync(pdf, path.join(EVID, 'fluxo-exportado.pdf'));
    await js("newMap(); 0");
    await waitFor(() => js("document.getElementById('flowpane').hidden === true"));
    assert.notStrictEqual(await js("getComputedStyle(document.getElementById('svg')).display"), 'none', 'o mapa mental volta à tela');
    fs.rmSync(dir, { recursive: true, force: true });
  });

  await check('compartilhar material: o menu e a janela têm o modo de compartilhar; o desktop prepara o arquivo em exportados', async () => {
    await js("newMap(); 0");
    await js("openExportModal('share'); 0");
    const r = await js("({ titulo: document.querySelector('#exportBox h2').textContent, pdf: document.getElementById('exPdf').textContent, md: document.getElementById('exMd').textContent })");
    await js("document.getElementById('exCancel').click(); 0");
    assert.deepStrictEqual(r, { titulo: 'Compartilhar material de estudo', pdf: 'Preparar PDF', md: 'Preparar Markdown' });
    assert.strictEqual(await js("typeof act['share-study']"), 'function');
    const p = await js("ipcRenderer.invoke('share:temp', 'material teste.md')");
    assert.ok(/exportados[\\/]material teste\.md$/.test(p), 'caminho de exportados: ' + p);   // barra do Windows ou do POSIX
  });
  await check('sem erros no console do app', async () => {
    assert.deepStrictEqual(errors, []);
  });

  const failed = results.filter((r) => !r[1]);
  console.log(`\n${results.length - failed.length}/${results.length} verificações ok`);
  if (failed.length) console.log(failed.map((f) => '  - ' + f[0] + ': ' + f[2]).join('\n'));
  app.exit(failed.length ? 1 : 0);
}

app.whenReady().then(() => { require('../electron/main.js'); main().catch((e) => { console.error('ERRO: ' + e.stack); app.exit(2); }); });
