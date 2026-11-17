'use strict';
// Obsidian (desktop, Electron real): exporta a rede para um vault, atualiza ao salvar, protege a nota editada pelo usuário,
// padroniza links antigos (Mapa#Tópico -> Mapa/Tópico) com desfazer, avisa sobre pasta com notas suas e mostra a rede.
// Não abre o Obsidian de verdade (o harness define MINDCRAFT_NO_LAUNCH): confere os arquivos que o Obsidian lê.
const fs = require('fs');
const path = require('path');
const start = require('./harness');
const { MindMap, createNode } = require('../core/components/model');
const { writeMom, readMom } = require('../core/formats/mom');

(async () => {
  const c = await start('MindCraft e2e — Obsidian (exportação, atualização ao salvar, links e rede)');
  const { js, wait, waitFor, eq, ok, t, TMP } = c;
  const SHOTS = path.join(__dirname, '..', 'evidencias', 'obsidian');
  const concursos = path.join(TMP, 'concursos'), vault = path.join(TMP, 'vault-obsidian');
  const dcFile = path.join(concursos, 'Direito Constitucional.mom'), daFile = path.join(concursos, 'Direito Administrativo.mom');
  const noteFile = (mapName, title) => path.join(vault, 'MindCraft', mapName, title + '.md');
  const mdFiles = (dir) => { const out = []; const walk = (d) => { if (!fs.existsSync(d)) return; for (const it of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, it.name); if (it.isDirectory()) walk(f); else if (f.endsWith('.md')) out.push(path.relative(dir, f).split(path.sep).join('/')); } }; walk(dir); return out.sort(); };
  const status = () => js(`document.getElementById('status').textContent`);
  const clickMenu = (id) => js(`(() => { document.getElementById('gMenu').open = true; document.getElementById('${id}').click(); return true; })()`);
  fs.mkdirSync(concursos, { recursive: true }); fs.mkdirSync(vault, { recursive: true });
  fs.mkdirSync(SHOTS, { recursive: true });

  // ---- dois mapas de concurso; o de Constitucional usa o formato antigo [[Mapa#Tópico]] ----
  const dc = new MindMap(createNode('Direito Constitucional'));
  const leg = dc.addChild(dc.root.id, 'Legalidade');
  dc.update(leg.id, { notes: 'Base: [[Direito Administrativo#Atos administrativos]].' });
  dc.addChild(dc.root.id, 'Atos');
  const da = new MindMap(createNode('Direito Administrativo'));
  const aa = da.addChild(da.root.id, 'Atos administrativos');
  const lic = da.addChild(da.root.id, 'Licitações');
  da.update(aa.id, { notes: 'Legalidade: [[Direito Constitucional#Legalidade|legalidade]]. Ver [[Atos]] e [[Licitações]].' });
  da.addRelation(aa.id, lic.id, 'pré-requisito');
  writeMom(dc, dcFile); writeMom(da, daFile);

  await waitFor(() => js('typeof openPath === "function" && typeof saveCfg === "function"'));
  await js(`saveCfg({ vaultDir: ${JSON.stringify(concursos)}, scope: 'vault', obsidianDir: ${JSON.stringify(vault)} }); true`);
  await js(`openPath(${JSON.stringify(dcFile)}).then(() => true)`);
  await waitFor(() => js(`filePath === ${JSON.stringify(dcFile)}`));

  await t('exportar pela rede: o botão grava uma nota por tópico no vault, e a barra de status mostra o resultado', async () => {
    await js(`if (!graphOpen) act.graph(); true`); await wait(800);
    ok(await js(`!!document.getElementById('gExport')`), 'menu da rede não montou; graphOpen=' + await js('graphOpen') + ' erros=' + JSON.stringify(c.errors.slice(-2)));
    const before = fs.readFileSync(dcFile);
    await clickMenu('gExport');
    await wait(1500); ok((await status()).includes('nota(s) gravada'), 'barra: ' + await status());
    eq(mdFiles(vault), ['MindCraft/Direito Administrativo/Atos administrativos.md', 'MindCraft/Direito Administrativo/Direito Administrativo.md', 'MindCraft/Direito Administrativo/Licitações.md', 'MindCraft/Direito Constitucional/Atos.md', 'MindCraft/Direito Constitucional/Direito Constitucional.md', 'MindCraft/Direito Constitucional/Legalidade.md'], 'uma nota por tópico (raiz + tópicos de cada mapa)');
    eq(fs.readFileSync(dcFile).equals(before), true, 'exportar não altera o .mom (formato Mindomo)');
    ok(/Obsidian: \d+ nota\(s\) gravada/.test(await status()), await status());
    await c.shot(path.join(SHOTS, '01-exportacao.png'));
  });

  await t('o link antigo [[Mapa#Tópico]] sai no formato do Obsidian: [[MindCraft/Mapa/Tópico]], e o alias é preservado', async () => {
    const legText = fs.readFileSync(noteFile('Direito Constitucional', 'Legalidade'), 'utf8');
    ok(legText.includes('[[MindCraft/Direito Administrativo/Atos administrativos|Atos administrativos]]'), legText);
    const aaText = fs.readFileSync(noteFile('Direito Administrativo', 'Atos administrativos'), 'utf8');
    ok(aaText.includes('[[MindCraft/Direito Constitucional/Legalidade|legalidade]]'), aaText);
    ok(aaText.includes('- → pré-requisito [[MindCraft/Direito Administrativo/Licitações|Licitações]]'), 'relação exportada');
    ok(aaText.includes('mindcraft-id: "Direito Administrativo::'), 'nota identificada como do MindCraft');
  });

  await t('padronizar links deste mapa: troca o formato antigo no mapa aberto, em um desfazer, e salvar grava', async () => {
    await clickMenu('gStdLinks');
    await waitFor(async () => /padronizado/.test(await status()));
    ok(/1 link\(s\) padronizado/.test(await status()), await status());
    const note = await js(`map.root.children[0].notes`);
    ok(note.includes('[[Direito Administrativo/Atos administrativos]]') && !note.includes('#'), note);
    await c.shot(path.join(SHOTS, '02-padronizar-links.png'));
  });

  await t('Ctrl+Z desfaz a padronização; sem o desfazer o novo formato é mantido ao salvar', async () => {
    await js(`act.undo(); true`);
    const back = await js(`map.root.children[0].notes`);
    ok(back.includes('[[Direito Administrativo#Atos administrativos]]'), 'voltou ao formato antigo: ' + back);
    await clickMenu('gStdLinks'); await waitFor(async () => /padronizado/.test(await status()));
    await js(`save(false)`); await waitFor(async () => !(await js('dirty')));
    const saved = readMom(fs.readFileSync(dcFile)).root.children[0].notes;
    ok(saved.includes('[[Direito Administrativo/Atos administrativos]]'), 'gravado no .mom: ' + saved);
  });

  await t('salvar atualiza o Obsidian sem abrir diálogo: um tópico novo vira nota nova', async () => {
    await js(`(() => { map.addChild(map.root.id, 'Tópico novo', 0); map.root.children[0].notes = 'liga a [[Atos]]'; dirty = true; render(); return true; })()`);
    await js(`save(false)`);
    await waitFor(() => fs.existsSync(noteFile('Direito Constitucional', 'Tópico novo')));
    ok(!(await js(`!!document.querySelector('[data-mc-dialog]')`)), 'nenhum diálogo apareceu');
    ok(fs.readFileSync(noteFile('Direito Constitucional', 'Tópico novo'), 'utf8').includes('# Tópico novo'), 'nota criada');
  });

  await t('nota editada no Obsidian não é sobrescrita: o texto do usuário continua, e a barra avisa', async () => {
    const f = noteFile('Direito Administrativo', 'Atos administrativos');
    fs.appendFileSync(f, '\nMinha anotação no Obsidian\n');
    await js(`(() => { map.addChild(map.root.id, 'Outro tópico'); dirty = true; render(); return true; })()`);
    await js(`save(false)`);
    await waitFor(async () => /não sobrescrita/.test(await status()));
    ok(fs.readFileSync(f, 'utf8').includes('Minha anotação no Obsidian'), 'a anotação do usuário foi preservada');
    ok(/editada no Obsidian/.test(await status()), await status());
  });

  await t('escolher uma pasta que já tem notas suas avisa, e não altera essas notas', async () => {
    const foreign = path.join(TMP, 'vault-com-notas');
    fs.mkdirSync(foreign, { recursive: true }); fs.writeFileSync(path.join(foreign, 'Minha nota.md'), 'x');
    await js(`window.__dlg.folder = ${JSON.stringify(foreign)}; true`);
    await clickMenu('gObsPick');
    await waitFor(async () => /já tem 1 nota/.test(await status()));
    eq(fs.readFileSync(path.join(foreign, 'Minha nota.md'), 'utf8'), 'x');
    eq(mdFiles(foreign), ['Minha nota.md'], 'nada gravado na pasta do usuário');
    await js(`window.__dlg.folder = null; true`);
    await c.shot(path.join(SHOTS, '03-aviso-pasta.png'));
  });

  await t('a rede mostra os tópicos e as ligações (vista de rede do MindCraft, com o menu ⋯ aberto)', async () => {
    await js(`if (!graphOpen) act.graph(); true`); await waitFor(() => js(`!!document.getElementById('gsvg')`));
    await js(`document.getElementById('gMenu').open = true; true`); await wait(300);
    await c.shot(path.join(SHOTS, '04-rede-com-menu.png'));
    await js(`document.getElementById('gMenu').open = false; true`);
  });

  await t('sem pasta do Obsidian escolhida, salvar não faz nada com o Obsidian', async () => {
    const dirBefore = mdFiles(vault).length;
    await js(`saveCfg({ obsidianDir: ${JSON.stringify(path.join(TMP, 'pasta-que-nao-existe'))} }); dirty = true; render(); save(false); true`);
    await wait(400);
    eq(await js(`!!document.querySelector('[data-mc-dialog]')`), false, 'sem diálogo ao salvar');
    eq(mdFiles(vault).length, dirBefore, 'vault intocado');
  });

  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
