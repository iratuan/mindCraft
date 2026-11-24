'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { _electron } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'evidencias', 'mapa-mental');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'mindcraft-playwright-'));
const userData = path.join(TMP, 'userData');
const bootstrap = path.join(TMP, 'main.cjs');
const appMain = path.join(ROOT, 'electron', 'main.js');
fs.writeFileSync(bootstrap, [
  "const { app } = require('electron');",
  `app.setPath('userData', ${JSON.stringify(userData)});`,
  "process.env.MINDCRAFT_START = 'blank';",
  "process.env.MINDCRAFT_NO_LAUNCH = '1';",
  `require(${JSON.stringify(appMain)});`,
].join('\n'));

const errors = [];
const shot = async (page, name) => {
  console.log(`Capturando ${name}`);
  await page.screenshot({ path: path.join(OUT, name), animations: 'disabled', timeout: 10000 });
  console.log(`Captura concluída: ${name}`);
};
const nodeByTitle = (page, title) => page.evaluate((value) => {
  let id = null;
  map.walk((node) => { if (!id && node.title === value) id = node.id; });
  return id;
}, title);
const countNodes = (page) => page.evaluate(() => {
  let count = 0;
  map.walk(() => count++);
  return count;
});
const inspectWithin = async (page, expression, id) => Promise.race([
  page.evaluate(expression, id),
  new Promise((_, reject) => setTimeout(() => reject(new Error('Avaliação do mapa excedeu 10 segundos.')), 10000)),
]);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const app = await _electron.launch({
    executablePath: require(path.join(ROOT, 'node_modules', 'electron')),
    args: [bootstrap],
    timeout: 30000,
    env: { ...process.env, MINDCRAFT_START: 'blank', MINDCRAFT_NO_LAUNCH: '1' },
  });
  try {
    const page = await app.firstWindow();
    page.setDefaultTimeout(8000);
    page.on('console', (message) => {
      if (message.type() === 'error' && !/Security Warning|Content-Security/.test(message.text())) errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.locator('.node').first().waitFor({ state: 'visible', timeout: 30000 });
    await page.locator('#splash').waitFor({ state: 'hidden', timeout: 30000 });
    await page.waitForFunction(() => typeof map !== 'undefined' && map.root && document.querySelectorAll('.node').length > 0);

    const initial = await page.evaluate(() => ({
      root: map.root.title,
      topics: document.querySelectorAll('.node').length,
      appBackground: getComputedStyle(document.querySelector('#appbar')).backgroundColor,
      accent: getComputedStyle(document.body).getPropertyValue('--accent').trim(),
      stageBackground: getComputedStyle(document.querySelector('#stage')).backgroundColor,
    }));
    console.log('Initial UI:', JSON.stringify(initial));
    assert.equal(initial.accent, '#5368d8');
    await shot(page, '00-mapa-inicial.png');

    const firstBranchId = await page.evaluate(() => map.root.children[0].id);
    const addViaToolbar = async (parentId, action, title) => {
      console.log(`Selecionando ${parentId} para ${action}`);
      await page.locator(`[data-id="${parentId}"] .hitarea`).click();
      console.log(`Abrindo ação ${action}`);
      await page.locator(`[data-act="${action}"]`).click();
      const editor = page.locator('#editor');
      await editor.waitFor({ state: 'visible' });
      console.log(`Editando ${title}`);
      await editor.fill(title);
      await editor.press('Enter');
      await editor.waitFor({ state: 'hidden' });
      console.log(`Criado ${title}`);
      const id = await nodeByTitle(page, title);
      assert.ok(id, `O botão ${action} deveria criar "${title}".`);
      return id;
    };

    const level2 = await addViaToolbar(firstBranchId, 'child', 'Playwright nível 2');
    const level3 = await addViaToolbar(level2, 'child', 'Playwright nível 3');
    const level4 = await addViaToolbar(level3, 'child', 'Playwright nível 4');
    const sibling = await addViaToolbar(level2, 'sibling', 'Playwright irmão');
    const level4Parent = await inspectWithin(page, (id) => map.find(id).parent.title, level4);
    console.log('Pai do nível 4:', level4Parent);
    assert.equal(level4Parent, 'Playwright nível 3');
    const siblingParent = await inspectWithin(page, (id) => map.find(id).parent.title, sibling);
    console.log('Pai do tópico irmão:', siblingParent);
    const level2Parent = await inspectWithin(page, (id) => map.find(id).parent.title, level2);
    assert.equal(siblingParent, level2Parent);
    console.log('Validando hierarquia de níveis');
    await page.evaluate(() => fit());
    await page.waitForTimeout(200);
    await shot(page, '01-mapa-com-varios-niveis.png');

    const beforeUndo = await countNodes(page);
    const added = await addViaToolbar(level4, 'child', 'Playwright desfazer/refazer');
    assert.equal(await countNodes(page), beforeUndo + 1);
    await page.locator('#undoBtn').click();
    await page.waitForFunction((id) => map.find(id)?.node.title === 'Tópico', added);
    await page.locator('#undoBtn').click();
    await page.waitForFunction((id) => !map.find(id), added);
    assert.equal(await countNodes(page), beforeUndo);
    await page.locator('#redoBtn').click();
    await page.waitForFunction((id) => map.find(id)?.node.title === 'Tópico', added);
    await page.locator('#redoBtn').click();
    await page.waitForFunction((id) => map.find(id)?.node.title === 'Playwright desfazer/refazer', added);
    assert.equal(await countNodes(page), beforeUndo + 1);

    await page.locator(`[data-id="${level3}"] .hitarea`).click();
    await page.locator('#ptabs [data-tab="notes"]').click();
    const note = '# Revisão\n\n- [ ] conceito importante\n- [x] exemplo aplicado\n\n[[Playwright nível 4]]';
    await page.locator('#notes').fill(note);
    await page.locator('#notes').press('Tab');
    await page.waitForFunction(({ id, value }) => map.find(id).node.notes === value, { id: level3, value: note });
    assert.equal(await page.evaluate((id) => map.find(id).node.notes, level3), note);
    await page.evaluate(() => fit());
    await page.waitForTimeout(200);
    await shot(page, '02-notas-em-edicao.png');
    await page.locator('#nmView').click();
    await page.locator('#notesView').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#notesView input[type="checkbox"]').count(), 2);
    await page.evaluate(() => fit());
    await page.waitForTimeout(200);
    await shot(page, '03-notas-renderizadas.png');

    const fullCount = await countNodes(page);
    const level2VisibleCount = await page.evaluate(() => {
      let count = 0;
      map.walk((_node, level) => { if (level <= 2) count++; });
      return count;
    });
    await page.locator('#levelSel').selectOption('2');
    await page.waitForFunction((total) => document.querySelectorAll('.node').length === total, level2VisibleCount);
    const filteredCount = await page.locator('.node').count();
    assert.ok(filteredCount < fullCount, `O filtro de níveis deveria ocultar tópicos (${filteredCount}/${fullCount}).`);
    await shot(page, '04-mapa-ate-nivel-2.png');
    await page.locator('#levelSel').selectOption('all');
    await page.waitForFunction((total) => document.querySelectorAll('.node').length === total, fullCount);
    await page.locator('#ptabs [data-tab="outline"]').click();
    await page.locator('.ol-row').first().waitFor({ state: 'visible' });
    assert.ok(await page.locator('.ol-row').count() >= fullCount);
    await shot(page, '05-painel-estrutura.png');

    await page.locator(`[data-id="${level3}"] .hitarea`).click();
    await page.locator('#ptabs [data-tab="props"]').click();
    await page.locator('.theme-card[data-theme="dark"]').click();
    assert.equal(await page.evaluate(() => map.meta.theme), 'dark');
    await page.locator('#ptabs [data-tab="notes"]').click();
    await page.locator('#nmEdit').click();
    await page.locator('#notes').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#notes').inputValue(), note);

    await page.locator('#lightToggle').click();
    assert.ok(await page.locator('body.light').count());
    await shot(page, '06-tema-claro.png');
    assert.equal(await page.evaluate(() => map.meta.theme), 'dark', 'tema da interface não altera o tema do mapa');
    await page.locator('#lightToggle').click();
    assert.equal(await page.locator('body.light').count(), 0);

    const rootBranches = await page.evaluate(() => map.root.children.map((node) => node.id));
    const dragBetween = async (sourceId, targetId, fraction, screenshot) => {
      const points = await page.evaluate(({ source, target, position }) => {
        const screenPoint = (id, vertical) => {
          const box = L.boxes.get(id);
          const bounds = svg.getBoundingClientRect();
          return {
            x: bounds.left + (box.x + box.w / 2) * pan.k + pan.x,
            y: bounds.top + (box.y + box.h * vertical) * pan.k + pan.y,
          };
        };
        const from = screenPoint(source, 0.5);
        const to = screenPoint(target, position);
        return { from, to, mode: dropMode(target, to.y) };
      }, { source: sourceId, target: targetId, position: fraction });
      assert.ok(points.from && points.to, 'tópicos de origem e destino visíveis para arrastar');
      await page.mouse.move(points.from.x, points.from.y);
      await page.mouse.down();
      await page.mouse.move(points.to.x, points.to.y, { steps: 12 });
      const marker = points.mode === 'child'
        ? page.locator(`[data-id="${targetId}"].drop`)
        : page.locator('#dropLine');
      await marker.waitFor({ state: 'visible', timeout: 5000 });
      await shot(page, screenshot);
      await page.mouse.up();
      await page.waitForTimeout(250);
    };
    await page.evaluate(() => fit());
    await dragBetween(rootBranches[1], rootBranches[0], 0.1, '07-reordenacao-antes.png');
    assert.deepEqual(await page.evaluate(() => map.root.children.map((node) => node.title)), ['Tópico 2', 'Tópico 1', 'Tópico 3']);
    await dragBetween(rootBranches[1], rootBranches[0], 0.9, '08-reordenacao-depois.png');
    assert.deepEqual(await page.evaluate(() => map.root.children.map((node) => node.title)), ['Tópico 1', 'Tópico 2', 'Tópico 3']);

    await dragBetween(rootBranches[2], rootBranches[0], 0.5, '09-arrastar-para-filho.png');
    assert.equal(await inspectWithin(page, (id) => map.find(id).parent.id, rootBranches[2]), rootBranches[0]);
    await dragBetween(rootBranches[2], rootBranches[1], 0.9, '10-restaurar-topico-raiz.png');
    assert.deepEqual(await page.evaluate(() => map.root.children.map((node) => node.title)), ['Tópico 1', 'Tópico 2', 'Tópico 3']);
    await page.evaluate(() => fit());

    await page.locator(`[data-id="${rootBranches[0]}"] .hitarea`).click();
    await page.locator('[data-act="relate"]').click();
    await page.locator(`[data-id="${rootBranches[1]}"] .hitarea`).click();
    await page.waitForFunction((ids) => {
      const relation = map.meta.relations[0];
      return relation && relation.from === ids[0] && relation.to === ids[1];
    }, [rootBranches[0], rootBranches[1]]);
    await page.locator('#ptabs [data-tab="notes"]').click();
    await page.locator('#notes').fill('Relaciona conteúdos');
    await page.locator('#notes').press('Tab');
    await page.waitForFunction(() => map.meta.relations[0].label === 'Relaciona conteúdos');
    await shot(page, '11-relacionamento.png');

    await page.locator('[data-act="graph"]').click();
    await page.locator('#graph').waitFor({ state: 'visible' });
    await shot(page, '12-rede-de-conhecimento.png');
    await page.keyboard.press('Escape');
    await page.locator('#graph').waitFor({ state: 'hidden' });

    await page.locator('[data-act="board"]').click();
    await page.locator('#boardpane').waitFor({ state: 'visible' });
    await page.locator('[data-bd-tool="pen"]').click();
    const board = await page.locator('#bdCanvas').boundingBox();
    assert.ok(board, 'canvas da lousa visível');
    await page.mouse.move(board.x + 80, board.y + 80);
    await page.mouse.down();
    await page.mouse.move(board.x + 180, board.y + 130, { steps: 8 });
    await page.mouse.up();
    await page.waitForFunction(() => window.BOARD_API.boardState.pages[0].strokes.length > 0);
    await shot(page, '13-lousa-com-traco.png');
    await page.locator('#bdUndo').click();
    await page.waitForFunction(() => window.BOARD_API.boardState.pages[0].strokes.length === 0);
    await page.locator('#bdRedo').click();
    await page.waitForFunction(() => window.BOARD_API.boardState.pages[0].strokes.length > 0);

    await page.locator('#bdClose').click();
    const reorderIds = await page.evaluate(() => {
      dirty = false;
      newMap();
      map.root.title = 'Raiz';
      map.root.children = [];
      for (const title of ['A', 'B', 'C', 'D']) map.addChild(map.root.id, title);
      const a = map.root.children[0];
      for (const title of ['a1', 'a2', 'a3']) map.addChild(a.id, title);
      map._undo = [];
      map._redo = [];
      dirty = false;
      selectedId = map.root.id;
      selIds = new Set([selectedId]);
      render();
      fit();
      const idOf = (title) => {
        let id = null;
        map.walk((node) => { if (!id && node.title === title) id = node.id; });
        return id;
      };
      return { root: map.root.id, a: idOf('A'), b: idOf('B'), d: idOf('D'), a2: idOf('a2'), a3: idOf('a3') };
    });
    await page.waitForTimeout(200);
    await dragBetween(reorderIds.d, reorderIds.a2, 0.9, '14-mover-entre-pais.png');
    assert.equal(await inspectWithin(page, (id) => map.find(id).parent.id, reorderIds.d), reorderIds.a);
    assert.deepEqual(await page.evaluate((ids) => ({
      a: map.find(ids.a).node.children.map((node) => node.title),
      root: map.root.children.map((node) => node.title),
    }), reorderIds), { a: ['a1', 'a2', 'D', 'a3'], root: ['A', 'B', 'C'] });
    await dragBetween(reorderIds.a3, reorderIds.b, 0.1, '15-mover-de-volta-para-raiz.png');
    assert.equal(await inspectWithin(page, (id) => map.find(id).parent.id, reorderIds.a3), reorderIds.root);
    assert.deepEqual(await page.evaluate(() => map.root.children.map((node) => node.title)), ['A', 'a3', 'B', 'C']);
    assert.deepEqual(await page.evaluate((id) => map.find(id).node.children.map((node) => node.title), reorderIds.a), ['a1', 'a2', 'D']);

    const touchIds = await page.evaluate(() => {
      const idOf = (title) => {
        let id = null;
        map.walk((node) => { if (!id && node.title === title) id = node.id; });
        return id;
      };
      return { source: idOf('C'), target: idOf('B') };
    });
    await page.evaluate(() => fit());
    const touchSource = await page.locator(`[data-id="${touchIds.source}"]`).boundingBox();
    const touchTarget = await page.locator(`[data-id="${touchIds.target}"]`).boundingBox();
    assert.ok(touchSource && touchTarget, 'origem e destino visíveis para arraste por toque');
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
    const at = (box) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2, id: 1, radiusX: 2, radiusY: 2, force: 1 });
    const start = at(touchSource), end = at(touchTarget);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
    for (let i = 1; i <= 12; i++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ ...start, x: start.x + (end.x - start.x) * i / 12, y: start.y + (end.y - start.y) * i / 12 }],
      });
      await page.waitForTimeout(20);
    }
    await page.locator(`[data-id="${touchIds.target}"].drop`).waitFor({ state: 'visible', timeout: 5000 });
    await shot(page, '16-arrasto-toque-tablet.png');
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForFunction(({ source, target }) => map.find(source).parent.id === target, touchIds);
    assert.equal(await inspectWithin(page, (id) => map.find(id).parent.title, touchIds.source), 'B');
    const tapBox = await page.locator(`[data-id="${touchIds.source}"]`).boundingBox();
    assert.ok(tapBox, 'tópico movido disponível para testar toque simples e duplo');
    const tapPoint = at(tapBox);
    for (let i = 0; i < 2; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [tapPoint] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      if (i === 0) {
        await page.waitForFunction((id) => selectedId === id, touchIds.source);
        await page.waitForTimeout(100);
      }
    }
    await page.waitForFunction(() => !document.getElementById('editor').hidden);
    await shot(page, '17-edicao-por-toque-duplo.png');
    await page.keyboard.press('Escape');
    const blank = await page.evaluate(() => {
      const r = svg.getBoundingClientRect();
      for (const [x, y] of [[r.left + 20, r.top + 20], [r.right - 20, r.top + 20], [r.left + 20, r.bottom - 20]]) {
        if (!nodeAt(document.elementFromPoint(x, y))) return { x, y };
      }
      return null;
    });
    assert.ok(blank, 'área vazia do canvas disponível para testar pan por toque');
    const panBefore = await page.evaluate(() => pan.x);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...blank, id: 1, radiusX: 2, radiusY: 2, force: 1 }] });
    for (let i = 1; i <= 6; i++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ ...blank, x: blank.x + i * 8, y: blank.y + i * 4, id: 1, radiusX: 2, radiusY: 2, force: 1 }],
      });
      await page.waitForTimeout(20);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForFunction((startX) => pan.x !== startX, panBefore);
    await shot(page, '18-pan-com-um-dedo-no-fundo.png');
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false });
    await cdp.detach();

    assert.deepEqual(errors, [], `A interface gerou erros: ${errors.join(' | ')}`);
    console.log(`Playwright OK: ${fullCount} tópicos, 4 níveis, notas, filtros, estrutura, temas, arraste e edição por toque, pan, reparenting, relação, rede e lousa.`);
  } finally {
    const process = app.process();
    const exited = new Promise((resolve) => {
      if (process.exitCode !== null || process.signalCode !== null) resolve(true);
      else process.once('exit', () => resolve(true));
    });
    app.evaluate(({ app: electronApp }) => electronApp.exit(0)).catch(() => {});
    const closed = await Promise.race([
      exited,
      new Promise((resolve) => setTimeout(() => resolve(false), 5000)),
    ]);
    if (!closed) process.kill();
    fs.rmSync(TMP, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
