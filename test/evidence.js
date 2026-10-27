'use strict';
// Evidências das funcionalidades (npm run evidence).
// Roda cada funcionalidade no Electron REAL (ações da interface ou chamadas ao núcleo), confere o resultado e salva a
// captura ou o arquivo gerado em docs/evidencias/<área>/. Depois gera docs/evidencias/README.md, docs/evidencias/resultados.json
// e o bloco de funcionalidades do README.md (tools/evidencias-indice.js).
// O que não pode ser testado neste ambiente (conta na nuvem, vídeo de teste) fica como "não testado", com o motivo.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { clipboard } = require('electron');
const start = require('./harness');
const { escreverIndices } = require('../tools/evidencias-indice');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'evidencias');
const core = (m) => require(path.join(ROOT, 'core', m));
const AREAS = [
  ['inicio', 'Início e primeiro uso'], ['mapas', 'Editar o mapa'], ['estilo', 'Aparência e painéis'], ['estudo', 'Estudo e revisão'],
  ['importar', 'Criar e importar mapas'], ['dados', 'Dados, exportação e biblioteca'], ['midias', 'PDF, vídeo e navegador'], ['tablet', 'Tablet'],
];
const FEATURES = [];
const feat = (area, slug, title, body) => FEATURES.push({ area, slug, title, body });
const exemplo = () => core('templates').createTemplateMap('bnb-analista-sistemas-desenvolvimento-2022');   // mapa de referência para exportar
const POSCOMP_CSV = () => fs.readFileSync(path.join(ROOT, 'modelos', 'poscomp-2016-2025.csv'), 'utf8');
const naoTestado = (motivo) => Object.assign(new Error(motivo), { skip: true });

// ============================================================ início
feat('inicio', 'tela-inicial', 'Tela inicial com os atalhos para começar', async (s) => {
  await s.js(`dirty = false; act.closeMap(); true`);
  await s.waitFor(() => s.js(`(() => { const e = document.querySelector('#hmNew'); return !!e && e.getBoundingClientRect().width > 0; })()`), 8000);
  s.ok(await s.js(`!!document.querySelector('#hmTemplate') && !!document.querySelector('#hmCsv')`), 'atalhos principais presentes');
  await s.shot();
});
feat('inicio', 'sem-mapa-sem-painel', 'Sem mapa aberto, o painel lateral some e a tela fica limpa', async (s) => {
  s.ok(await s.js(`document.body.classList.contains('no-map')`), 'estado sem mapa ativo');
  s.ok(await s.js(`getComputedStyle(document.getElementById('panels')).display === 'none'`), 'painel oculto');
  await s.shot();
});
feat('inicio', 'manual-de-uso', 'Manual de uso (Ajuda → Manual de uso), com índice e busca', async (s) => {
  await s.js(`act.manual(); true`);
  await s.waitFor(() => s.js(`/Manual de uso/.test(document.body.innerText)`), 6000);
  await s.shot(); await s.key('Escape');
});
feat('inicio', 'atalhos-do-teclado', 'Lista de atalhos do teclado (F1)', async (s) => {
  await s.js(`act.help(); true`);
  await s.waitFor(() => s.js(`/Atalhos/.test(document.body.innerText)`), 6000);
  await s.shot(); await s.key('Escape');
});

// ============================================================ editar o mapa
feat('mapas', 'novo-mapa-em-branco', 'Novo mapa em branco', async (s) => {
  await s.js(`dirty = false; act.closeMap(); true`); await s.wait(400);
  await s.js(`newMap(); true`); await s.wait(400);
  s.ok(await s.js(`!!map && map.root.title === 'Ideia central'`), 'mapa novo criado (com os tópicos de exemplo)');
  await s.shot();
});
feat('mapas', 'criar-topico-filho-e-irmao', 'Criar tópico filho (Tab) e irmão (Enter)', async (s) => {
  const n0 = await s.js(`map.root.children.length`);
  await s.js(`act.child(); true`); await s.wait(250);
  s.eq(await s.js(`map.root.children.length`), n0 + 1, 'filho criado');
  await s.js(`act.sibling(); true`); await s.wait(250);
  s.eq(await s.js(`map.root.children.length`), n0 + 2, 'irmão criado');
  await s.shot();
});
feat('mapas', 'renomear-topico', 'Renomear o tópico (botão Renomear ou F2)', async (s) => {
  await s.js(`act.rename(); true`); await s.wait(300);
  s.ok(await s.js(`!document.getElementById('editor').hidden`), 'campo de edição do título aberto');
  await s.shot(); await s.key('Escape');
});
feat('mapas', 'excluir-topico', 'Excluir tópico (botão na lateral ou Del)', async (s) => {
  const n0 = await s.js(`map.root.children.length`);
  await s.js(`act.delete(); true`); await s.wait(300);
  s.eq(await s.js(`map.root.children.length`), n0 - 1, 'tópico removido');
  await s.shot();
});
feat('mapas', 'desfazer-e-refazer', 'Desfazer e refazer (Ctrl+Z e Ctrl+Y)', async (s) => {
  const n0 = await s.js(`map.root.children.length`);
  await s.js(`act.child(); true`); await s.wait(200);
  await s.js(`act.undo(); true`); await s.wait(200);
  s.eq(await s.js(`map.root.children.length`), n0, 'desfeito');
  await s.js(`act.redo(); true`); await s.wait(200);
  s.eq(await s.js(`map.root.children.length`), n0 + 1, 'refeito');
  await s.shot();
});
feat('mapas', 'recolher-ramo', 'Recolher e expandir um ramo (tecla Espaço)', async (s) => {
  await s.js(`selectedId = map.root.children[0].id; selIds = new Set([selectedId]); act.child(); true`); await s.wait(300);   // recolher exige subtópicos
  await s.js(`selectedId = map.root.children[0].id; selIds = new Set([selectedId]); render(); true`); await s.wait(300);
  await s.js(`act.toggle(); true`); await s.wait(300);   // a tecla Espaço chama esta mesma ação
  s.ok(await s.js(`!!map.find(selectedId).node.collapsed`), 'ramo recolhido');
  await s.shot(); await s.js(`act.toggle(); true`);
});
feat('mapas', 'forma-do-topico', 'Forma do tópico (barra do tópico)', async (s) => {
  await s.js(`selectedId = map.root.children[0].id; selIds = new Set([selectedId]); render(); true`); await s.wait(300);
  await s.js(`(() => { const e = document.getElementById('shape'); e.value = 'pill'; e.dispatchEvent(new Event('change', { bubbles: true })); })(); true`); await s.wait(300);
  s.ok(await s.js(`JSON.stringify(map.find(selectedId).node.style || {}).includes('pill')`), 'forma pílula aplicada');
  await s.shot();
});
feat('mapas', 'notas-e-links-entre-topicos', 'Notas e links [[entre tópicos]]', async (s) => {
  await s.js(`selectedId = map.root.children[0].id; selIds = new Set([selectedId]); render(); showPanel('notes'); true`); await s.wait(300);
  const alvo = await s.js(`map.root.children[1].title`);
  await s.js(`(() => { const e = document.getElementById('notes'); e.value = 'Ver [[' + ${JSON.stringify(alvo)} + ']]'; e.dispatchEvent(new Event('input', { bubbles: true })); commitNotes(); })(); true`); await s.wait(300);
  s.ok(await s.js(`String(map.find(selectedId).node.notes || '').includes('[[')`), 'nota com link gravada');
  await s.shot('-notas');
  await s.js(`showPanel('links'); true`); await s.wait(300);
  await s.shot('-conexoes');
});
feat('estilo', 'busca-no-mapa', 'Buscar no mapa (Ctrl+F)', async (s) => {
  const termo = await s.js(`map.root.children[0].title`);
  await s.js(`(() => { const e = document.getElementById('search'); e.value = ${JSON.stringify(termo)}; e.dispatchEvent(new Event('input', { bubbles: true })); })(); true`); await s.wait(400);
  s.ok(await s.js(`!!hits && hits.size > 0`), 'há resultados no mapa');
  await s.shot();
  await s.js(`(() => { const e = document.getElementById('search'); e.value = ''; e.dispatchEvent(new Event('input', { bubbles: true })); })(); true`); await s.wait(200);
});

// ============================================================ aparência e painéis
feat('estilo', 'tema-do-mapa', 'Tema visual do mapa (Oceano, Neon, Papel…)', async (s) => {
  await s.js(`showPanel('props'); true`); await s.wait(300);
  const antes = await s.js(`map.meta.theme || ''`);
  await s.js(`(() => { const b = [...document.querySelectorAll('#themeGrid button')].find((x) => !x.classList.contains('on')); if (b) b.click(); })(); true`); await s.wait(400);
  const depois = await s.js(`map.meta.theme || ''`);
  s.ok(depois !== antes, 'tema trocado (' + antes + ' → ' + depois + ')');
  await s.shot();
});
feat('estilo', 'marcadores', 'Marcadores de prioridade no tópico', async (s) => {
  await s.js(`showPanel('props'); true`); await s.wait(300);
  s.ok(await s.js(`!!document.getElementById('markerChips') && document.getElementById('markerChips').children.length > 0`), 'marcadores disponíveis');
  await s.shot();
});
feat('estilo', 'estrutura-em-arvore', 'Estrutura do mapa em árvore (aba Estrutura)', async (s) => {
  await s.js(`showPanel('outline'); true`); await s.wait(300);
  s.ok(await s.js(`document.getElementById('outline').children.length > 0`), 'árvore preenchida');
  await s.shot();
});
feat('estilo', 'painel-lateral-recolher', 'Recolher e reabrir o painel lateral', async (s) => {
  await s.js(`act.panelsToggle(); true`); await s.wait(400);
  await s.shot('-recolhido');
  await s.js(`act.panelsToggle(); true`); await s.wait(400);
  await s.shot('-aberto');
});
feat('estilo', 'painel-maximizar', 'Maximizar e restaurar o painel', async (s) => {
  await s.js(`document.getElementById('panelMax').click(); true`); await s.wait(400);
  s.ok(await s.js(`document.body.classList.contains('panel-max')`), 'painel maximizado');
  await s.shot();
  await s.js(`document.getElementById('panelMax').click(); true`); await s.wait(300);
});
feat('estilo', 'rede-de-conhecimento', 'Rede de conhecimento (o mapa como rede de conexões)', async (s) => {
  await s.js(`act.graph(); true`); await s.wait(900);
  await s.shot(); await s.js(`closeGraph(); true`); await s.wait(300);
});

// ============================================================ estudo e revisão
feat('estudo', 'painel-do-topico', 'Estudo do tópico: revisão, tempo e questões', async (s) => {
  await s.js(`selectedId = map.root.children[0].id; selIds = new Set([selectedId]); render(); showPanel('study'); true`); await s.wait(400);
  s.ok(await s.js(`!!document.getElementById('studyDone')`), 'botões de revisão presentes');
  await s.shot();
});
feat('estudo', 'estudei-hoje-e-errei', 'Marcar "Estudei hoje" e "Errei" (agenda a próxima revisão)', async (s) => {
  await s.js(`document.getElementById('studyDone').click(); true`); await s.wait(400);
  s.ok(await s.js(`!!map.find(selectedId).node.study && !!map.find(selectedId).node.study.next`), 'próxima revisão agendada no tópico');
  await s.shot('-estudei');
  await s.js(`document.getElementById('studyFail').click(); true`); await s.wait(300);
  await s.shot('-errei');
});
feat('estudo', 'minutos-de-estudo', 'Registrar minutos de estudo', async (s) => {
  await s.js(`(() => { const e = document.getElementById('studyMin'); e.value = '25'; e.dispatchEvent(new Event('input', { bubbles: true })); document.getElementById('studyAddMin').click(); })(); true`); await s.wait(400);
  s.ok(/25/.test(await s.js(`document.getElementById('studyForm').innerText`)), '25 min registrados');
  await s.shot();
});
feat('estudo', 'caderno-de-erros', 'Caderno de erros, com o motivo de cada erro', async (s) => {
  await s.js(`(() => { const w = document.getElementById('errWhy'); w.value = 'atencao'; w.dispatchEvent(new Event('change', { bubbles: true })); const e = document.getElementById('errNote'); e.value = 'Confundi o prazo'; e.dispatchEvent(new Event('input', { bubbles: true })); document.getElementById('errAdd').click(); })(); true`); await s.wait(400);
  s.ok(/Confundi o prazo/.test(await s.js(`document.getElementById('errList').innerText`)), 'erro registrado');
  await s.shot();
});
feat('estudo', 'painel-de-estudos', 'Painel de estudos (progresso, sequência e metas)', async (s) => {
  await s.js(`act.dash(); true`);
  await s.waitFor(() => s.js(`/Painel de estudos/.test(document.body.innerText)`), 6000);
  await s.shot(); await s.js(`closeDash(); true`); await s.wait(300);
});
feat('estudo', 'revisao-do-dia', 'Revisão do dia (tópicos vencidos)', async (s) => {
  await s.js(`act.review(); true`); await s.wait(700);
  await s.shot(); await s.key('Escape');
});
feat('estudo', 'simulado', 'Registrar simulado por disciplina', async (s) => {
  await s.js(`act.simulado(); true`); await s.wait(700);
  await s.shot(); await s.key('Escape');
});

// ============================================================ criar e importar
feat('importar', 'modelos-de-concurso', 'Novo mapa de concurso: escolher um modelo pronto', async (s) => {
  await s.js(`dirty = false; act.closeMap(); true`);
  await s.waitFor(() => s.js(`(() => { const e = document.querySelector('#hmTemplate'); return !!e && e.getBoundingClientRect().width > 0; })()`), 8000); await s.wait(300);
  await s.js(`act.template(); true`); await s.waitFor(() => s.js(`!!document.querySelector('#tplList')`), 6000);
  await s.shot('-escolha');
  await s.js(`document.querySelector('#tplList [data-tpl="bnb-analista-sistemas-desenvolvimento-2022"]').click(); true`);
  await s.waitFor(() => s.js(`!!map && map.root.title.startsWith('BNB')`), 8000); await s.wait(300);
  s.eq(await s.js(`map.root.children.length`), 6, 'disciplinas do modelo');
  await s.shot('-mapa');
});
feat('importar', 'csv-colado-da-ia', 'Importar o CSV colado (resposta da IA), com prévia', async (s) => {
  const real = await s.clipboardOk();
  await s.js(`dirty = false; act.closeMap(); true`); await s.wait(400);
  await s.js(`act.csv(); true`); await s.waitFor(() => s.js(`!!document.querySelector('#csvPaste')`), 6000);
  await s.js(`document.querySelector('#csvPaste').focus(); true`);
  if (real) { clipboard.writeText(POSCOMP_CSV()); await s.key('V', ['control']); }
  else { await s.js(`(() => { const e = document.querySelector('#csvPaste'); const dt = new DataTransfer(); dt.setData('text/plain', ${JSON.stringify(POSCOMP_CSV())}); e.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); })(); true`); }
  s.file('-colagem.txt', real ? 'Colado com Ctrl+V pela área de transferência do sistema.\n' : 'A área de transferência do sistema não estava disponível neste ambiente: o texto foi colado pelo mesmo evento de colagem que o app recebe (paste).\n');
  await s.wait(900);
  s.ok(await s.js(`!document.querySelector('#csvPreview').hidden`), 'prévia exibida');
  await s.shot('-previa');
  await s.js(`document.getElementById('csvOk').click(); true`); await s.wait(1200);
  s.ok(await s.js(`!!map && map.root.children.length === 3`), 'mapa criado com as 3 áreas');
  await s.shot('-mapa');
});
feat('importar', 'importar-edital-por-texto', 'Importar edital colando o texto do conteúdo programático', async (s) => {
  await s.js(`act.edital(); true`); await s.wait(600);
  await s.shot(); await s.key('Escape');
});

// ============================================================ dados, exportação e biblioteca
feat('dados', 'biblioteca-de-mapas', 'Biblioteca de mapas (todos os mapas guardados)', async (s) => {
  await s.js(`act.lib(); true`); await s.wait(800);
  await s.shot(); await s.key('Escape');
});
feat('dados', 'exportar-markdown', 'Exportar em Markdown (.md)', async (s) => {
  const md = core('export').toMarkdown(exemplo());
  s.ok(md.length > 100, md.length + ' caracteres'); s.file('.md', md);
});
feat('dados', 'exportar-opml', 'Exportar em OPML (para outros programas de mapas)', async (s) => {
  const xml = core('export').toOPML(exemplo());
  s.ok(xml.includes('<opml'), 'OPML válido'); s.file('.opml', xml);
});
feat('dados', 'exportar-pdf', 'Exportar em PDF', async (s) => {
  const buf = Buffer.from(await core('export').toPDF(exemplo()));
  s.ok(buf.slice(0, 4).toString() === '%PDF', 'cabeçalho de PDF'); s.file('.pdf', buf);
});
feat('dados', 'exportar-word', 'Exportar em Word (.docx)', async (s) => {
  const buf = Buffer.from(await core('export').toDOCX(exemplo()));
  s.ok(buf.slice(0, 2).toString() === 'PK', 'arquivo Word válido'); s.file('.docx', buf);
});
feat('dados', 'mindomo-mom', 'Abrir e salvar no formato do Mindomo (.mom) sem perder dados', async (s) => {
  const tmp = path.join(os.tmpdir(), 'mc-evid-' + Date.now() + '.mom');
  const mapa = exemplo(); core('mom').writeMom(mapa, tmp);
  const volta = core('mom').readMom(tmp);
  const topicos = (m) => m.root.children.reduce((n, d) => n + d.children.length, 0);
  s.eq(volta.root.children.length, mapa.root.children.length, 'disciplinas preservadas');
  s.eq(topicos(volta), topicos(mapa), 'tópicos preservados');
  s.file('.txt', 'Mapa de exemplo salvo em .mom e lido de volta: ' + volta.root.children.length + ' disciplinas e ' + topicos(volta) + ' tópicos, iguais aos do original.\n');
  fs.rmSync(tmp, { force: true });
});
feat('dados', 'agenda-ics', 'Agenda de revisões e provas (.ics, para o calendário)', async (s) => {
  const { ics, events, reviewDays } = core('ics').toIcs(exemplo());
  s.ok(ics.includes('BEGIN:VCALENDAR'), 'calendário válido');
  s.file('.ics', ics);
  s.file('-resumo.txt', 'Agenda gerada: ' + events + ' evento(s) de revisão em ' + reviewDays + ' dia(s), a partir do mapa de exemplo (BNB, sem datas de estudo marcadas).\n');
});
feat('dados', 'importar-markdown', 'Importar um mapa a partir de Markdown', async (s) => {
  const m = core('import').fromMarkdown('# Concurso\n## Disciplina\n### Tópico 1\n### Tópico 2\n');
  s.eq(m.root.children[0].children.length, 2, 'tópicos importados');
  s.file('.txt', 'Markdown com 1 disciplina e 2 tópicos → mapa com ' + m.root.children[0].children.length + ' tópicos.\n');
});
feat('dados', 'backup-pacote', 'Cópia de segurança em pacote (.mcpack) com a biblioteca', async (s) => {
  const arq = path.join(os.tmpdir(), 'mc-evid-' + Date.now() + '.mcpack');
  const r = await s.js(`(async () => { const r = getLibrary().exportPackage(${JSON.stringify(arq)}, { settings: {} }); return JSON.stringify(r || {}); })()`);
  s.ok(fs.existsSync(arq), 'pacote gerado');
  s.file('.txt', 'Pacote gerado: ' + path.basename(arq) + ' (' + (fs.existsSync(arq) ? fs.statSync(arq).size : 0) + ' bytes).\nResposta do app: ' + String(r).slice(0, 300) + '\n');
  fs.rmSync(arq, { force: true });
});

// ============================================================ PDF, vídeo e navegador
feat('midias', 'leitor-de-pdf', 'Leitor de PDF ao lado do mapa (criar tópico a partir de um trecho)', async (s) => {
  const PDFDocument = require('pdfkit'); const arq = path.join(os.tmpdir(), 'mc-evid-' + Date.now() + '.pdf');
  await new Promise((res) => { const d = new PDFDocument(); const ws = fs.createWriteStream(arq); d.pipe(ws); d.fontSize(20).text('Direito Penal: dolo e culpa'); d.moveDown().fontSize(12).text('Dolo é a vontade de realizar a conduta típica.'); d.end(); ws.on('finish', res); });
  await s.js(`newMap(); true`); await s.wait(300);
  await s.js(`window.MCReact.openPdf({ path: ${JSON.stringify(arq)}, name: 'exemplo.pdf', page: 1 }); true`);
  await s.waitFor(() => s.js(`(() => { const e = document.getElementById('pdfpane'); return !!e && e.getBoundingClientRect().width > 0; })()`), 10000);
  await s.wait(800); await s.shot();
  fs.rmSync(arq, { force: true });
});
feat('midias', 'player-de-video', 'Player de vídeo para videoaulas (arquivo local ou YouTube)', async (s) => {
  await s.js(`act.video(); true`); await s.wait(900);
  await s.shot();
  throw naoTestado('o player abre, mas não reproduz vídeo: não há arquivo de vídeo de teste neste ambiente');
});
feat('midias', 'navegador-web', 'Navegador web ao lado do mapa (questões e leis)', async (s) => {
  await s.js(`act.browser(); true`); await s.wait(900);
  s.ok(await s.js(`!!document.querySelector('#tabMedia .tab')`), 'aba do navegador criada');
  await s.shot();
});

// ============================================================ tablet
feat('tablet', 'tela-inicial-retrato', 'Tela inicial em formato de tablet (retrato)', async (s) => {
  const [w, h] = s.win.getSize(); s.win.setSize(800, 1280); await s.wait(800);
  await s.js(`dirty = false; act.closeMap(); true`); await s.wait(800);
  await s.shot(); s.win.setSize(w, h); await s.wait(500);
});

// ============================================================ não testado neste ambiente
feat('dados', 'sincronizacao-na-nuvem', 'Sincronização com Google Drive ou pasta', async () => {
  throw naoTestado('exige uma conta do Google ou uma pasta de sincronização configurada; não testado nesta rodada');
});

// ============================================================ execução
(async () => {
  const c = await start('evidências das funcionalidades');
  const { js, wait, waitFor, t } = c;
  const geradas = [];
  const key = async (k, mods = []) => { c.win.webContents.sendInputEvent({ type: 'keyDown', keyCode: k, modifiers: mods }); c.win.webContents.sendInputEvent({ type: 'keyUp', keyCode: k, modifiers: mods }); await wait(200); };
  for (const f of FEATURES) {
    const nome = f.area + '/' + f.slug;
    await t(nome + ' — ' + f.title, async () => {
      const dir = path.join(OUT, f.area); fs.mkdirSync(dir, { recursive: true });
      const s = {
        js, wait, waitFor, win: c.win, key,
        ok: (cond, msg) => { if (!cond) throw new Error(msg || 'condição falsa'); },
        eq: (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((msg || 'valores diferentes') + ': esperado ' + JSON.stringify(b) + ', obtido ' + JSON.stringify(a)); },
        shot: async (sufixo = '') => { const arq = path.join(dir, f.slug + sufixo + '.png'); await c.shot(arq); geradas.push(path.relative(OUT, arq).split(path.sep).join('/')); },
        file: (ext, dados) => { const arq = path.join(dir, f.slug + ext); fs.writeFileSync(arq, dados); geradas.push(path.relative(OUT, arq).split(path.sep).join('/')); },
        clipboardOk: async () => { try { clipboard.writeText('sonda'); return clipboard.readText() === 'sonda'; } catch { return false; } },
      };
      await f.body(s);
    });
  }
  const resultados = c.results || [];
  const linhas = FEATURES.map((f) => {
    const r = resultados.find((x) => x[0].startsWith(f.area + '/' + f.slug + ' '));
    const status = !r ? 'não executado' : !r[1] ? 'falhou' : r[2] === 'skip' ? 'não testado' : 'ok';
    const arquivos = geradas.filter((g) => g.startsWith(f.area + '/' + f.slug));
    return { area: f.area, slug: f.slug, titulo: f.title, status, arquivos, mensagem: r && !r[1] ? r[2] : '' };
  });
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'resultados.json'), JSON.stringify(linhas, null, 2), 'utf8');
  escreverIndices(linhas, AREAS, ROOT);
  await c.finish();
})().catch((e) => { console.log('ERRO:', e && e.stack); process.exit(1); });
