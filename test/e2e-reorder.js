'use strict';
// Reordenar tópicos no app REAL com mouse e teclado reais: arrastar e soltar ENTRE irmãos (linha indicadora), Alt+setas, botões da barra,
// itens do menu, grupo de tópicos, mudar de pai ao soltar, desfazer em um passo e casos inválidos.
const path = require('path');
const { Menu } = require('electron');
const start = require('./harness');

(async () => {
  const c = await start('MindCraft e2e — reordenar tópicos');
  const { js, wait, waitFor, eq, ok, t } = c; const wc = () => c.win.webContents; const SHOTS = path.join(__dirname, '..', 'evidencias', 'reordenar');
  const mouse = (type, x, y, n = 1, extra = {}) => wc().sendInputEvent({
    type, x: Math.round(x), y: Math.round(y), button: 'left', clickCount: n,
    ...(['mouseDown', 'mouseMove'].includes(type) ? { modifiers: ['leftButtonDown'] } : {}), ...extra,
  });
  const key = async (k, mods = []) => { wc().sendInputEvent({ type: 'keyDown', keyCode: k, modifiers: mods }); wc().sendInputEvent({ type: 'keyUp', keyCode: k, modifiers: mods }); await wait(150); };
  const order = (parent) => js(`(() => { const r = map.find(__id(${JSON.stringify(parent)})); return r.node.children.map((n) => n.title).join(','); })()`);
  /** Ponto (coordenadas da janela) a `frac` da altura do tópico (0 = topo, 1 = base). */
  const at = (title, frac = 0.5) => js(`(() => { const id = __id(${JSON.stringify(title)}), b = L.boxes.get(id), r = svg.getBoundingClientRect(); return { x: r.left + (b.x + b.w / 2) * pan.k + pan.x, y: r.top + (b.y + b.h * ${frac}) * pan.k + pan.y }; })()`);
  const build = async () => {
    await js(`dirty = false; newMap(); (() => { const m = map; m.root.title = 'Raiz'; m.root.children = []; for (const t of ['A', 'B', 'C', 'D']) m.addChild(m.root.id, t); const A = m.root.children[0]; for (const t of ['a1', 'a2', 'a3']) m.addChild(A.id, t); m._undo = []; m._redo = []; selectedId = m.root.id; selIds = new Set([m.root.id]); render(); fit(); })(); true`); await wait(400);
  };
  const dragTo = async (from, to, frac, { hold = false, ctrlFirst = null } = {}) => {
    const a = await at(from, 0.5); mouse('mouseDown', a.x, a.y); await wait(40);
    const b = await at(to, frac);
    for (let i = 1; i <= 10; i++) { mouse('mouseMove', a.x + ((b.x - a.x) * i) / 10, a.y + ((b.y - a.y) * i) / 10); await wait(20); }
    await wait(60); if (hold) return b; mouse('mouseUp', b.x, b.y); await wait(250); return b;
  };
  const sel = (title) => js(`selectedId = __id(${JSON.stringify(title)}); selIds = new Set([selectedId]); render(); true`);

  await c.ready;
  await t('arrastar B para a parte de CIMA de A: vira irmão ANTES de A (linha laranja durante o arrasto; sumiu depois); desfazer em 1 passo', async () => {
    await build(); eq(await order('Raiz'), 'A,B,C,D');
    await dragTo('B', 'A', 0.12, { hold: true }); ok(await js(`!!document.querySelector('#dropLine')`), 'linha indicadora aparece'); ok(!(await js(`!!document.querySelector('.drop')`)), 'não marca como "filho"');
    ok(/CIMA ou de BAIXO/.test(await js(`document.querySelector('#status').textContent`)), 'dica na barra de status'); await c.shot(path.join(SHOTS, '01-arrastando-entre-irmaos.png'));
    const b = await at('A', 0.12); mouse('mouseUp', b.x, b.y); await wait(250);
    eq(await order('Raiz'), 'B,A,C,D'); ok(!(await js(`!!document.querySelector('#dropLine')`)), 'linha some ao soltar'); eq(await js('map.find(__id("A")).node.children.length'), 3, 'A continua com seus filhos');
    await key('Z', ['control']); eq(await order('Raiz'), 'A,B,C,D', 'um único Ctrl+Z desfaz');
  });

  await t('arrastar para a parte de BAIXO de um tópico (para frente e para trás na lista): vira irmão DEPOIS', async () => {
    await build(); await dragTo('A', 'C', 0.9); eq(await order('Raiz'), 'B,C,A,D');
    await dragTo('D', 'B', 0.9); eq(await order('Raiz'), 'B,D,C,A'); await dragTo('A', 'B', 0.1); eq(await order('Raiz'), 'A,B,D,C');
  });

  await t('arrastar para o MEIO continua tornando o tópico FILHO do alvo (comportamento anterior preservado)', async () => {
    await build(); await dragTo('C', 'B', 0.5); eq(await order('Raiz'), 'A,B,D'); eq(await order('B'), 'C');
    ok(/movido para dentro/.test(await js(`document.querySelector('#status').textContent`)));
  });

  await t('soltar ENTRE filhos de OUTRO pai muda de pai e de posição ao mesmo tempo', async () => {
    await build(); await dragTo('D', 'a2', 0.9); eq(await order('A'), 'a1,a2,D,a3'); eq(await order('Raiz'), 'A,B,C');
    await dragTo('a3', 'B', 0.1); eq(await order('Raiz'), 'A,a3,B,C'); eq(await order('A'), 'a1,a2,D');
  });

  await t('GRUPO: arrastar um tópico selecionado leva todos os selecionados, mantendo a ordem do documento', async () => {
    await build(); await js(`selIds = new Set([__id('D'), __id('B')]); selectedId = __id('D'); render(); true`); await wait(150);
    await dragTo('D', 'a1', 0.1); eq(await order('A'), 'B,D,a1,a2,a3'); eq(await order('Raiz'), 'A,C');
    await key('Z', ['control']); eq(await order('Raiz'), 'A,B,C,D'); eq(await order('A'), 'a1,a2,a3');
  });

  await t('casos inválidos não alteram nada: soltar sobre si mesmo, dentro do próprio ramo, no fundo vazio; a raiz só recebe como filha', async () => {
    await build(); const snap = await js('JSON.stringify(map.toJSON())');
    await dragTo('B', 'B', 0.1); eq(await js('JSON.stringify(map.toJSON())'), snap, 'sobre si mesmo');
    await dragTo('A', 'a2', 0.9); eq(await js('JSON.stringify(map.toJSON())'), snap, 'dentro do próprio ramo');
    const a = await at('C', 0.5); mouse('mouseDown', a.x, a.y); for (let i = 1; i <= 6; i++) { mouse('mouseMove', a.x - i * 4, a.y + 160 + i * 10); await wait(15); } mouse('mouseUp', a.x - 24, a.y + 220); await wait(200);
    eq(await order('Raiz'), 'A,B,C,D', 'soltar no vazio não muda a ordem');
    await dragTo('D', 'Raiz', 0.05); eq(await order('Raiz'), 'A,B,C,D', 'raiz: topo = filho (último), a ordem não muda'); eq(await js('map.find(__id("D")).parent.id === map.root.id'), true);
  });

  await t('BOTÕES da barra lateral (subir/descer) e ATALHOS Alt+↑/↓ (teclado real) reordenam; recusam nas pontas e com vários selecionados; desfazem', async () => {
    await build(); await sel('C'); const up = await js(`(() => { const r = document.querySelector('[data-act="moveUp"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    mouse('mouseDown', up.x, up.y); mouse('mouseUp', up.x, up.y); await wait(200); eq(await order('Raiz'), 'A,C,B,D', 'botão subir');
    const dn = await js(`(() => { const r = document.querySelector('[data-act="moveDown"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    mouse('mouseDown', dn.x, dn.y); mouse('mouseUp', dn.x, dn.y); await wait(200); eq(await order('Raiz'), 'A,B,C,D', 'botão descer');
    await sel('A'); await key('Up', ['alt']); eq(await order('Raiz'), 'A,B,C,D', 'já é o primeiro'); ok(/primeiro/.test(await js(`document.querySelector('#status').textContent`)));
    await key('Down', ['alt']); eq(await order('Raiz'), 'B,A,C,D', 'Alt+↓'); await key('Down', ['alt']); await key('Down', ['alt']); eq(await order('Raiz'), 'B,C,D,A'); await key('Down', ['alt']); ok(/último/.test(await js(`document.querySelector('#status').textContent`)));
    await key('Up', ['alt']); eq(await order('Raiz'), 'B,C,A,D', 'Alt+↑');
    await js(`selIds = new Set([__id('B'), __id('C')]); selectedId = __id('B'); render(); true`); await key('Down', ['alt']); eq(await order('Raiz'), 'B,C,A,D', 'vários selecionados: não mexe'); ok(/único tópico/.test(await js(`document.querySelector('#status').textContent`)));
    await sel('A'); await key('Left', ['alt']); eq(await order('Raiz'), 'B,C,A,D'); await sel('a2'); await key('Left', ['alt']); eq(await order('Raiz'), 'B,C,A,a2,D', 'Alt+← promove (vira irmão do pai)'); await key('Right', ['alt']); eq(await order('A'), 'a1,a3,a2', 'Alt+→ rebaixa para o irmão de cima');
  });

  await t('MENU Editar (desktop) tem subir/descer/promover/rebaixar e eles funcionam', async () => {
    const all = []; const walk = (m) => { for (const i of m.items || []) { all.push(i.label); if (i.submenu) walk(i.submenu); } }; walk(Menu.getApplicationMenu());
    for (const l of ['Subir tópico', 'Descer tópico', 'Promover', 'Rebaixar']) ok(all.some((x) => x.startsWith(l)), 'falta no menu: ' + l);
    await build(); await sel('B'); await js(`ipcRenderer.emit('menu', {}, 'moveDown'); true`); await wait(150); eq(await order('Raiz'), 'A,C,B,D'); await js(`ipcRenderer.emit('menu', {}, 'moveUp'); true`); await wait(150); eq(await order('Raiz'), 'A,B,C,D');
  });

  await t('a ordem é gravada: salvar e reabrir o mapa mantém a nova ordem; nenhum erro de console', async () => {
    await build(); await dragTo('D', 'A', 0.1); eq(await order('Raiz'), 'D,A,B,C');
    const { writeMom, readMom } = require('../core/formats/mom'); const json = await js('JSON.stringify(map.toJSON())'); const { MindMap } = require('../core/components/model'); const m = MindMap.fromJSON(JSON.parse(json)); const back = readMom(writeMom(m));
    eq(back.root.children.map((n) => n.title), ['D', 'A', 'B', 'C']); eq(c.errors, [], 'erros de console');
  });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
