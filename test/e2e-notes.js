'use strict';
// Ponta a ponta: editor de notas em Markdown (barra, visualizar, tarefas, links, segurança) e relações como conexões na rede.
const start = require('./harness');

(async () => {
  const c = await start('MindCraft e2e — notas em Markdown e relações');
  const { js, wait, eq, ok, t } = c;
  const txt = (s) => js(`document.querySelector(${JSON.stringify(s)}).textContent`);
  const click = (s) => js(`document.querySelector(${JSON.stringify(s)}).click()`);
  const fmt = (f) => click(`#notesBar [data-fmt="${f}"]`);
  const nodeOf = (title) => `map.find(__id(${JSON.stringify(title)})).node`;
  const setNotes = (v, a = 0, b = v.length) => js(`(() => { showPanel('notes'); const n = document.querySelector('#notes'); n.focus(); n.value = ${JSON.stringify(v)}; n.setSelectionRange(${a}, ${b}); return true; })()`);
  const val = () => js(`document.querySelector('#notes').value`);
  const saved = (title) => js(`${nodeOf(title)}.notes`);

  await t('abre com o editor de texto; a barra de formatação existe e vale só para o texto de tópicos', async () => {
    await js(`dirty = false; newMap(); map.root.title = 'Direito'; ['Crase', 'Regência', 'Isolado'].forEach((x) => map.addChild(map.root.id, x)); render(); __md(__id('Crase')); showPanel('notes')`);
    await wait(150);
    eq(await js(`document.querySelector('#notes').hidden`), false); eq(await js(`document.querySelector('#notesView').hidden`), true);
    eq(await js(`document.querySelectorAll('#notesBar [data-fmt]').length`), 11); eq(await js(`document.querySelector('#notesBar').hidden`), false);
  });

  await t('negrito/itálico/riscado/código/link: envolve a seleção, clicar de novo desfaz, sem seleção insere modelo; grava no mapa', async () => {
    await setNotes('texto', 0, 5); await fmt('bold'); eq(await val(), '**texto**'); eq(await saved('Crase'), '**texto**', 'gravou no mapa');
    eq(await js(`[document.querySelector('#notes').selectionStart, document.querySelector('#notes').selectionEnd]`), [2, 7], 'a seleção continua no texto');
    await fmt('bold'); eq(await val(), 'texto', 'segundo clique remove');
    await setNotes('a b', 2, 3); await fmt('italic'); eq(await val(), 'a *b*'); await setNotes('x', 0, 1); await fmt('strike'); eq(await val(), '~~x~~'); await setNotes('c', 0, 1); await fmt('code'); eq(await val(), '`c`');
    await setNotes('Regência', 0, 8); await fmt('link'); eq(await val(), '[[Regência]]');
    await setNotes('', 0, 0); await fmt('bold'); eq(await val(), '**negrito**'); eq(await js(`window.getSelection && document.querySelector('#notes').value.slice(document.querySelector('#notes').selectionStart, document.querySelector('#notes').selectionEnd)`), 'negrito');
    await setNotes('site', 0, 4); await fmt('url'); eq(await val(), '[site](https://)');
  });

  await t('Ctrl+B / Ctrl+I / Ctrl+K no campo de notas formatam o texto (e não mexem no estilo do tópico)', async () => {
    const before = await js(`JSON.stringify(${nodeOf('Crase')}.style)`);
    await setNotes('palavra', 0, 7);
    await js(`document.querySelector('#notes').dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true, cancelable: true }))`); eq(await val(), '**palavra**');
    await js(`document.querySelector('#notes').dispatchEvent(new KeyboardEvent('keydown', { key: 'i', ctrlKey: true, bubbles: true, cancelable: true }))`); eq(await val(), '***palavra***');
    eq(await js(`JSON.stringify(${nodeOf('Crase')}.style)`), before, 'estilo do tópico intacto');
  });

  await t('prefixos de linha: título (cicla #→##→###→nada), lista, numerada, tarefa, citação — alterna e troca de tipo', async () => {
    await setNotes('titulo', 0, 6); await fmt('h'); eq(await val(), '# titulo'); await fmt('h'); eq(await val(), '## titulo'); await fmt('h'); eq(await val(), '### titulo'); await fmt('h'); eq(await val(), 'titulo');
    await setNotes('a\nb\nc', 0, 5); await fmt('ul'); eq(await val(), '- a\n- b\n- c'); await fmt('ul'); eq(await val(), 'a\nb\nc', 'clique de novo remove');
    await js(`(() => { const n = document.querySelector('#notes'); n.setSelectionRange(0, n.value.length); })()`); await fmt('ol'); eq(await val(), '1. a\n2. b\n3. c');
    await js(`(() => { const n = document.querySelector('#notes'); n.setSelectionRange(0, n.value.length); })()`); await fmt('task'); eq(await val(), '- [ ] a\n- [ ] b\n- [ ] c', 'numerada → tarefa');
    await js(`(() => { const n = document.querySelector('#notes'); n.setSelectionRange(0, n.value.length); })()`); await fmt('quote'); eq(await val(), '> a\n> b\n> c');
    eq(await saved('Crase'), '> a\n> b\n> c', 'gravado');
    await setNotes('só esta\noutra', 0, 0); await fmt('ul'); eq(await val(), '- só esta\noutra', 'só a linha do cursor');
  });

  await t('Visualizar: renderiza título, listas, tabela, código; textarea some; modo é lembrado ao trocar de tópico; Editar volta', async () => {
    await setNotes('# Crase\n\n**Regra:** use _à_ antes de feminino.\n\n- [ ] estudar\n- [x] resumir\n\n| Caso | Crase |\n|---|---|\n| a casa | não |\n\n`código`\n\n> lembrar');
    await click('#nmView'); await wait(100);
    eq(await js(`document.querySelector('#notes').hidden`), true); eq(await js(`document.querySelector('#notesView').hidden`), false);
    const h = await js(`document.querySelector('#notesView').innerHTML`);
    ok(/<h1>Crase<\/h1>/.test(h) && /<strong>Regra:<\/strong>/.test(h) && /<em>à<\/em>/.test(h) && /<table>/.test(h) && /<code>código<\/code>/.test(h) && /<blockquote>/.test(h), h);
    eq(await js(`document.querySelectorAll('#notesView input[type=checkbox]').length`), 2);
    eq(await js(`document.querySelector('#nmView').classList.contains('on')`), true); eq(await js(`document.querySelector('#notesBar [data-fmt="bold"]').disabled`), true, 'formatar só no modo Editar');
    await js(`__md(__id('Regência'))`); await wait(100); ok((await txt('#notesView')).includes('Sem notas'), 'outro tópico, ainda em Visualizar'); eq(await js(`document.querySelector('#notesView').hidden`), false);
    await js(`__md(__id('Crase'))`); await wait(100); ok((await txt('#notesView')).includes('Regra:'));
    await click('#nmEdit'); await wait(100); eq(await js(`document.querySelector('#notes').hidden`), false); ok((await val()).startsWith('# Crase'), 'o texto Markdown está intacto');
    await click('#nmView');
  });

  await t('tarefas: clicar na caixa na visualização alterna [ ]/[x] no texto e grava no mapa (1 desfazer)', async () => {
    await js(`document.querySelectorAll('#notesView input[type=checkbox]')[0].click()`); await wait(100);
    ok((await saved('Crase')).includes('- [x] estudar') && (await saved('Crase')).includes('- [x] resumir'), await saved('Crase'));
    eq(await js(`document.querySelectorAll('#notesView input[type=checkbox]:checked').length`), 2, 'visualização atualizada');
    await js(`document.querySelectorAll('#notesView input[type=checkbox]')[1].click()`); await wait(100); ok((await saved('Crase')).includes('- [ ] resumir'));
    ok(await js(`map.undo()`)); ok((await saved('Crase')).includes('- [x] resumir'), 'desfazer volta o último clique');
  });

  await t('[[link]] na visualização abre o tópico; link que não existe avisa; link da internet vai ao navegador (sem navegar o app)', async () => {
    await setNotes('Veja [[Regência]] e [[Não existe]] e [site](https://exemplo.com/x) e [mau](javascript:alert(1)).'); await click('#nmView'); await wait(100);
    const href0 = await js('location.href');
    await js(`document.querySelectorAll('#notesView a.wl')[1].click()`); await wait(100); ok((await txt('#status')).includes('ainda não existe'), await txt('#status')); eq(await js(`map.find(selectedId).node.title`), 'Crase');
    await js(`document.querySelectorAll('#notesView a.wl')[0].click()`); await wait(150); eq(await js(`map.find(selectedId).node.title`), 'Regência', 'abriu o tópico ligado');
    await js(`__md(__id('Crase'))`); await wait(100);
    await js(`window.__open = []; const o = ipcRenderer.invoke.bind(ipcRenderer); ipcRenderer.invoke = (ch, ...a) => { if (ch === 'open-external') window.__open.push(a[0]); return o(ch, ...a); }; true`);
    await js(`document.querySelector('#notesView a.ext').click()`); await wait(150); eq(await js('window.__open'), ['https://exemplo.com/x']); eq(await js('location.href'), href0, 'a janela do app não navegou');
    eq(await js(`document.querySelectorAll('#notesView a').length`), 3, 'o link javascript: não virou link');
    eq(await js(`ipcRenderer.invoke('open-external', 'javascript:alert(1)')`), { ok: false }); eq((await js(`ipcRenderer.invoke('open-external', 'file:///C:/Windows/notepad.exe')`)).ok, false);
    eq((await js(`ipcRenderer.invoke('open-external', 'https://exemplo.com')`)).method, 'skipped', 'em teste não abre nada');
  });

  await t('SEGURANÇA: HTML/script na nota nunca executa nem vira elemento; duplo clique na visualização volta a editar', async () => {
    await setNotes('<script>window.__pwn=1</script><img src=x onerror="window.__pwn=2"><b onclick="window.__pwn=3">x</b> [[<img src=x onerror=window.__pwn=4>]]'); await click('#nmView'); await wait(200);
    eq(await js('window.__pwn'), undefined); eq(await js(`document.querySelectorAll('#notesView script, #notesView img, #notesView b').length`), 0);
    ok((await txt('#notesView')).includes('<script>'), 'aparece como texto');
    await js(`document.querySelector('#notesView').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))`); await wait(100); eq(await js(`document.querySelector('#notes').hidden`), false);
  });

  await t('relação desenhada = conexão na rede: aparece em Conexões nos DOIS tópicos (com rótulo), junta com [[link]] do mesmo par, some ao apagar', async () => {
    await click('#nmEdit'); await setNotes(''); await js(`dirty = false; map.addRelation(__id('Crase'), __id('Regência'), 'depende de'); render(); __md(__id('Crase')); showPanel('links'); renderLinks()`); await wait(250);
    const rows = () => js(`[...document.querySelectorAll('#linksBody .lk')].map((r) => [...r.querySelectorAll('.t, .m')].map((x) => x.textContent).join(' | '))`);
    eq(await rows(), ['Regência | seta · depende de'], 'saída em Crase');
    await js(`__md(__id('Regência')); renderLinks()`); await wait(250); eq(await rows(), ['Crase | seta · depende de'], 'retrolink em Regência');
    ok((await js(`[...document.querySelectorAll('#linksBody h4')].map((h) => h.textContent)`)).includes('Citado em (1)'));
    await js(`map.update(__id('Crase') && map.find(__id('Crase')).node.id, { notes: 'ver [[Regência]]' }); __md(__id('Crase')); renderLinks()`); await wait(250);
    eq(await rows(), ['Regência | seta · depende de'], 'link + seta para o mesmo tópico = uma linha só'); ok((await js(`[...document.querySelectorAll('#linksBody h4')].map((h) => h.textContent)`)).includes('Links deste tópico (1)'));
    await js(`map.update(map.find(__id('Crase')).node.id, { notes: '' }); map.removeRelation(map.meta.relations[0].id); render(); __md(__id('Crase')); renderLinks()`); await wait(250);
    eq(await rows(), [], 'sem relação, sem conexão');
  });

  await t('rótulo de relação: painel mostra texto simples, sem barra de formatação', async () => {
    await js(`map.addRelation(__id('Crase'), __id('Isolado'), 'rotulo'); render(); selectedRel = map.meta.relations[0].id; selectedId = null; showPanel('notes'); render()`); await wait(150);
    eq(await js(`document.querySelector('#notesBar').hidden`), true); eq(await js(`document.querySelector('#notes').hidden`), false); eq(await val(), 'rotulo'); eq(await txt('#notesLabel'), 'Rótulo da relação');
  });

  await t('nenhum erro de console durante toda a sessão', async () => { eq(c.errors, [], 'erros de console'); });

  await c.finish();
})().catch((e) => { console.error('Falha no harness:', e); require('electron').app.exit(2); });
