'use strict';
// Abrir um mapa do Mindomo no app REAL e ver a formatação original: tema, cor/forma/borda/fonte de cada tópico, notas (description),
// escolha do tema "Original", salvar e reabrir sem perder o tema, e o arquivo gravado continuar compatível (themes.json + HTML das notas).
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const start = require('./harness');
const { mindomo, TID } = require('./mindomo-fixture');

(async () => {
  const c = await start('MindCraft e2e — formatação original do Mindomo');
  const { js, wait, waitFor, eq, ok, t, TMP } = c;
  const SHOTS = path.join(__dirname, '..', 'evidencias', 'mindomo');
  const file = path.join(TMP, 'do-mindomo.mom'); fs.writeFileSync(file, mindomo());
  const fill = (id) => js(`(document.querySelector('[data-id="${id}"] rect, [data-id="${id}"] ellipse') || {}).getAttribute && document.querySelector('[data-id="${id}"] rect, [data-id="${id}"] ellipse').getAttribute('fill')`);
  const open = async () => { await js(`dirty = false; openPath(${JSON.stringify(file)}).then(() => true)`); await waitFor(() => js('map.root.title === "Raiz"')); await wait(300); };

  await t('abrir mantém o tema original (fundo, cores, formas, borda, fonte) e o seletor de tema oferece "Original"', async () => {
    await open();
    eq(await js('map.meta.theme'), 'custom');
    eq(await js(`document.querySelector('#theme').value`), 'custom'); const label = await js(`document.querySelector('#theme option[value="custom"]').textContent`); ok(/Original do Mindomo/.test(label), label);
    eq(await js(`document.querySelector('#theme option[value="custom"]').hidden`), false); eq(await js(`document.querySelector('.theme-card[data-theme="custom"]').hidden`), false);
    eq(await fill('a'), '#ff6961', 'cor do tópico'); eq(await js(`document.querySelector('[data-id="a"] rect').getAttribute('stroke')`), '#3c3c3c', 'borda');
    eq(await js(`document.querySelector('[data-id="a"] text').getAttribute('font-family')`).then((v) => /Kalam/.test(v)), true, 'fonte do tópico');
    eq(await js(`document.querySelector('[data-id="a"] text').getAttribute('fill')`), '#ffffff', 'cor do texto');
    eq(await js(`document.querySelector('#svg rect').getAttribute('fill')`), '#f8f8f8', 'fundo do tema'); eq(await fill('r'), '#000000', 'raiz');
    await c.shot(path.join(SHOTS, 'app-aberto.png'));
  });

  await t('as notas do Mindomo (description) aparecem no painel de notas, em Markdown', async () => {
    await js(`selectedId = 'a'; selIds = new Set(['a']); render(); true`); await wait(200);
    eq(await js(`document.querySelector('#notes').value`), 'Texto **importante** e *itálico* & mais\n\nSegundo parágrafo');
    ok(await js(`!!document.querySelector('[data-id="a"] .note-icon')`), 'ícone de nota no tópico');
  });

  await t('trocar para um tema do MindCraft e voltar ao original; desfazer funciona', async () => {
    await js(`document.querySelector('#theme').value = 'dark'; document.querySelector('#theme').dispatchEvent(new Event('change')); true`); await wait(200);
    eq(await js('map.meta.theme'), 'dark'); eq(await js(`document.querySelector('#svg rect').getAttribute('fill')`), '#14161c', 'fundo do tema Escuro'); eq(await fill('r'), '#000000', 'a formatação própria do tópico vale em qualquer tema'); eq(await fill('a'), '#ff6961'); eq(await js(`document.querySelector('#theme option[value="custom"]').hidden`), false, 'o original continua oferecido');
    await js(`document.querySelector('.theme-card[data-theme="custom"]').click(); true`); await wait(200); eq(await js('map.meta.theme'), 'custom'); eq(await fill('a'), '#ff6961');
  });

  await t('salvar e reabrir: o tema original e as cores continuam; o arquivo mantém themes.json e o HTML das notas; o original do Mindomo não foi alterado antes de salvar', async () => {
    const orig = fs.readFileSync(file); ok(JSON.parse(new AdmZip(orig).getEntry('themes.json').getData().toString())[TID], 'sanidade do original');
    await js('save(false)'); await wait(500);
    const z = new AdmZip(fs.readFileSync(file)); eq(Object.keys(JSON.parse(z.getEntry('themes.json').getData().toString())), [TID]);
    ok(/<strong>importante<\/strong>/.test(JSON.parse(z.getEntry('nodes.json').getData().toString()).find((n) => n.id === 'a').description), 'HTML da nota preservado');
    await js(`dirty = false; newMap(); true`); await wait(300); await open(); eq(await js('map.meta.theme'), 'custom'); eq(await fill('a'), '#ff6961'); eq(await js(`getLibrary && 1`), 1);
  });

  await t('editar a nota atualiza o description (escapado) e o app continua sem erros', async () => {
    await js(`selectedId = 'a'; const n = map.find('a').node; n.notes = 'editada <b>x</b>'; dirty = true; save(false)`); await wait(500);
    const out = JSON.parse(new AdmZip(fs.readFileSync(file)).getEntry('nodes.json').getData().toString()).find((n) => n.id === 'a'); eq(out.description, '<p>editada &lt;b&gt;x&lt;/b&gt;</p>');
    await open(); eq(await js(`map.find('a').node.notes`), 'editada <b>x</b>');
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });
  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
