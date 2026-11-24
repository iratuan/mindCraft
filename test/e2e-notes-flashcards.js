'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const AdmZip = require('adm-zip');
const { _electron } = require('playwright');
const { readMom } = require('../core/formats/mom');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'evidencias', 'notas-flashcards');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'mindcraft-notas-playwright-'));
const MOM = path.join(TMP, 'Concurso.mom');
const MD_ROOT = path.join(TMP, 'MindCraft', 'Concurso');
const userData = path.join(TMP, 'userData');
const bootstrap = path.join(TMP, 'main.cjs');
const appMain = path.join(ROOT, 'electron', 'main.js');
const NOTE = 'A legalidade exige atuação conforme a lei. Revise a competência e o controle. Veja [[Licitações]].';
const FRONT = 'A legalidade exige atuação conforme a lei.';
const BACK = 'Atuação vinculada ao que a lei autoriza.';

fs.writeFileSync(bootstrap, [
  "const { app } = require('electron');",
  `app.setPath('userData', ${JSON.stringify(userData)});`,
  "process.env.MINDCRAFT_START = 'blank';",
  "process.env.MINDCRAFT_NO_LAUNCH = '1';",
  `require(${JSON.stringify(appMain)});`,
].join('\n'));

async function waitForFile(file, timeout = 10000) {
  const start = Date.now();
  while (!fs.existsSync(file)) {
    if (Date.now() - start > timeout) throw new Error(`Arquivo não criado no prazo: ${file}`);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const errors = [];
  const app = await _electron.launch({
    executablePath: require(path.join(ROOT, 'node_modules', 'electron')),
    args: [bootstrap],
    timeout: 30000,
    env: { ...process.env, MINDCRAFT_START: 'blank', MINDCRAFT_NO_LAUNCH: '1' },
  });
  try {
    const page = await app.firstWindow();
    page.setDefaultTimeout(10000);
    page.on('console', (message) => {
      if (message.type() === 'error' && !/Security Warning|Content-Security/.test(message.text())) errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.locator('.node').first().waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForFunction(() => typeof map !== 'undefined' && map.root && document.querySelectorAll('.node').length > 0);

    await page.evaluate((savePath) => {
      dirty = false;
      newMap();
      map.root.title = 'Direito Constitucional';
      map.root.children = [];
      map.meta.name = map.root.title;
      window.__legal = map.addChild(map.root.id, 'Legalidade').id;
      window.__licitacoes = map.addChild(map.root.id, 'Licitações').id;
      map.update(window.__licitacoes, { notes: 'Modalidade de contratação pública e critérios de seleção.' });
      map.addRelation(window.__legal, window.__licitacoes, 'complementa');
      selectedId = window.__legal;
      selIds = new Set([selectedId]);
      render();
      showPanel('ai');
      window.__savePath = savePath;
      window.prompt = () => 'Atuação vinculada ao que a lei autoriza.';
      const invoke = ipcRenderer.invoke.bind(ipcRenderer);
      ipcRenderer.invoke = (channel, ...args) => {
        if (channel === 'ai:ask') {
          window.__aiCalls.push(args[0]);
          return Promise.resolve(args[0].mode === 'outline'
            ? { ok: true, topics: [{ title: 'Regra expressa', note: '', children: [] }] }
            : { ok: true, text: window.__noteResponse });
        }
        if (channel === 'dialog:save') return Promise.resolve(window.__savePath);
        return invoke(channel, ...args);
      };
      window.__aiCalls = [];
      window.__noteResponse = 'A legalidade exige atuação conforme a lei. Revise a competência e o controle. Veja [[Licitações]].';
    }, MOM);

    const notesCommand = 'Gere notas sobre o tópico selecionado: Direito Constitucional › Legalidade.';
    await page.locator('#aiQ').fill('comando antigo');
    await page.locator('#aiNotes').click();
    await page.locator('#aiOut').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#aiOutText').textContent(), NOTE);
    assert.equal(await page.evaluate(() => window.__aiCalls[0].question), notesCommand);
    assert.equal(await page.locator('#aiQ').inputValue(), notesCommand, 'o comando enviado fica visível até ser aplicado');
    await page.screenshot({ path: path.join(OUT, '01-nota-gerada-pela-ia.png'), animations: 'disabled' });

    await page.locator('#aiToNote').click();
    await page.waitForFunction((id) => map.find(id).node.notes.includes('[[Licitações]]'), await page.evaluate(() => window.__legal));
    assert.equal(await page.evaluate((id) => map.find(id).node.notes, await page.evaluate(() => window.__legal)), NOTE);
    assert.equal(await page.locator('#aiQ').inputValue(), '', 'aplicar a nota limpa o campo de pergunta');
    await page.screenshot({ path: path.join(OUT, '02-nota-guardada-no-topico.png'), animations: 'disabled' });

    const outlineCommand = 'Gere tópicos sobre o tópico selecionado: Direito Constitucional › Legalidade.';
    await page.locator('#aiQ').fill('comando antigo');
    await page.locator('#aiOutline').click();
    await page.locator('#aiPrev').waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => window.__aiCalls[1].question), outlineCommand);
    assert.ok((await page.locator('#aiPrev').textContent()).includes('Regra expressa'));
    await page.screenshot({ path: path.join(OUT, '02a-previa-de-topicos-gerados.png'), animations: 'disabled' });
    await page.locator('#aiInsert').click();
    await page.waitForFunction((id) => map.find(id).node.children.some((node) => node.title === 'Regra expressa'), await page.evaluate(() => window.__legal));
    assert.equal(await page.locator('#aiQ').inputValue(), '', 'aplicar os tópicos limpa o campo de pergunta');
    await page.screenshot({ path: path.join(OUT, '02b-topicos-aplicados-no-mapa.png'), animations: 'disabled' });

    await page.evaluate(() => showPanel('notes'));
    await page.locator('#nmView').click();
    const wikiLink = page.locator('#notesView a.wl');
    await wikiLink.waitFor({ state: 'visible' });
    await page.screenshot({ path: path.join(OUT, '03-link-wikilink-na-nota.png'), animations: 'disabled' });
    await wikiLink.click();
    await page.waitForFunction(() => selectedId === window.__licitacoes);
    assert.equal(await page.evaluate(() => map.find(selectedId).node.title), 'Licitações');

    await page.evaluate(() => {
      selectedId = window.__legal;
      selIds = new Set([selectedId]);
      render();
      showPanel('notes');
      setNotesMode('edit');
    });
    const notes = page.locator('#notes');
    await page.locator('#notesBar [data-fmt="flashcard"]').waitFor({ state: 'visible' });
    await notes.evaluate((element, phrase) => {
      const start = element.value.indexOf(phrase);
      if (start < 0) throw new Error('Trecho da nota gerada não encontrado para seleção.');
      element.focus();
      element.setSelectionRange(start, start + phrase.length);
    }, FRONT);
    await page.locator('#notesBar [data-fmt="flashcard"]').click();
    await page.waitForFunction(() => map.meta.flashcards?.length === 1);
    assert.equal(await page.evaluate(() => map.meta.flashcards[0].front), FRONT);
    assert.equal(await page.evaluate(() => map.meta.flashcards[0].back), BACK);
    await page.screenshot({ path: path.join(OUT, '04-flashcard-trecho-frente.png'), animations: 'disabled' });

    const card = page.locator('#flashcardPanel > div').nth(1);
    await card.click();
    await page.waitForFunction((text) => document.querySelector('#flashcardPanel > div:nth-child(2)').textContent === text, BACK);
    await page.screenshot({ path: path.join(OUT, '05-flashcard-trecho-verso.png'), animations: 'disabled' });
    await card.click();
    await page.waitForFunction((text) => document.querySelector('#flashcardPanel > div:nth-child(2)').textContent === text, FRONT);

    await page.keyboard.press('Control+Shift+g');
    await page.waitForFunction(() => map.meta.flashcards.length === 3);
    assert.deepEqual(await page.evaluate(() => map.meta.flashcards.map((item) => item.front)), [FRONT, 'Legalidade', 'Licitações']);
    await page.screenshot({ path: path.join(OUT, '06-flashcards-gerados-do-mapa.png'), animations: 'disabled' });
    await page.keyboard.press('Control+Shift+g');
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => map.meta.flashcards.length), 3, 'repetir o atalho não deve duplicar cartões dos tópicos');

    await page.locator('#flashcardPanel button').filter({ hasText: 'Próximo' }).click();
    await page.waitForFunction(() => document.querySelector('#flashcardPanel > div:nth-child(2)').textContent === 'Legalidade');
    await page.locator('#flashcardPanel button').filter({ hasText: 'Anterior' }).click();
    await page.waitForFunction((text) => document.querySelector('#flashcardPanel > div:nth-child(2)').textContent === text, FRONT);

    const saved = await page.evaluate(() => save(false));
    assert.equal(saved, true, 'o salvamento do mapa deve concluir');
    await waitForFile(MOM);
    await waitForFile(path.join(MD_ROOT, 'Legalidade.md'));
    const zip = new AdmZip(fs.readFileSync(MOM));
    assert.ok(zip.getEntry('document.json') && zip.getEntry('nodes.json'), 'o .mom deve manter a estrutura Mindomo');
    const reopened = readMom(fs.readFileSync(MOM));
    assert.equal(reopened.meta.flashcards.length, 3, 'flashcards preservados ao reabrir o .mom');
    const legalId = await page.evaluate(() => window.__legal);
    assert.ok(reopened.find(legalId).node.notes.includes('[[Licitações]]'), 'nota preservada no .mom');
    assert.deepEqual(fs.readdirSync(MD_ROOT).filter((name) => name.endsWith('.md')).sort(), [
      'Direito Constitucional.md',
      'Legalidade.md',
      'Licitações.md',
      'Regra expressa.md',
    ]);
    const legalMd = fs.readFileSync(path.join(MD_ROOT, 'Legalidade.md'), 'utf8');
    assert.ok(legalMd.includes(FRONT), 'nota gerada exportada para Markdown');
    assert.ok(legalMd.includes('[[MindCraft/Concurso/Licitações|Licitações]]'), '[[ ]] convertido em wikilink com caminho do vault');
    assert.ok(legalMd.includes('- → complementa [[MindCraft/Concurso/Licitações|Licitações]]'), 'relação explícita exportada');
    assert.ok(fs.readFileSync(path.join(MD_ROOT, 'Direito Constitucional.md'), 'utf8').includes('## Subtópicos'));
    await page.screenshot({ path: path.join(OUT, '07-mapa-salvo-mom-e-notas-md.png'), animations: 'disabled' });

    assert.deepEqual(errors, [], `A interface gerou erros: ${errors.join(' | ')}`);
    console.log('Playwright OK: geração/armazenamento de nota, wikilink navegável, flashcards, atalho, navegação, round-trip .mom e exportação por tópico para Obsidian.');
  } finally {
    const process = app.process();
    const exited = new Promise((resolve) => {
      if (process.exitCode !== null || process.signalCode !== null) resolve(true);
      else process.once('exit', () => resolve(true));
    });
    app.evaluate(({ app: electronApp }) => electronApp.exit(0)).catch(() => {});
    const closed = await Promise.race([exited, new Promise((resolve) => setTimeout(() => resolve(false), 5000))]);
    if (!closed) process.kill();
    fs.rmSync(TMP, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
