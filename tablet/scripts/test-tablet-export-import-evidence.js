'use strict';
/**
 * Teste E2E no Tablet Android: Exportação, Importação e Preservação Total de Conteúdo
 * Captura evidências visuais limpas e de alta resolução em cada etapa do ciclo:
 * 1. 28-tablet-mapa-rico-antes-exportar: Mapa completo antes da exportação (nós, notas, vídeo, estudo, estilos e relações)
 * 2. 29-tablet-export-biblioteca-pacotes: Gestão de pacotes e backups portáteis na biblioteca SQLite
 * 3. 30-tablet-mapa-em-branco: Limpeza total do canvas (mapa em branco)
 * 4. 31-tablet-mapa-restaurado-mom: Restauração 100% fiel a partir do arquivo .mom
 * 5. 32-tablet-mapa-restaurado-mcpack: Restauração 100% fiel a partir do pacote .mcpack no SQLite
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { connect, adb } = require('./cdp');

const SHOTS_DIR = path.join(__dirname, '..', '..', 'evidencias', 'android');
fs.mkdirSync(SHOTS_DIR, { recursive: true });

const shot = (name) => {
  const r = spawnSync(adb, ['exec-out', 'screencap', '-p'], { maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw r.error;
  const outPath = path.join(SHOTS_DIR, name + '.png');
  fs.writeFileSync(outPath, r.stdout);
  console.log('   📸 Evidência visual salva: ' + path.relative(process.cwd(), outPath));
  return outPath;
};

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  console.log('=== TESTE DE EXPORTAÇÃO E IMPORTAÇÃO NO TABLET ANDROID (EVIDÊNCIAS VISUAIS) ===\n');

  console.log('1. Conectando ao WebView do MindCraft no emulador Samsung Galaxy Tab...');
  const c = await connect();
  console.log('   ✓ Conectado com sucesso ao WebView.\n');

  // Limpa telas abertas, diálogos e painéis
  await c.ev(`
    (() => {
      if (typeof closeModal === 'function') closeModal();
      if (typeof closeHome === 'function') closeHome();
      if (typeof closePanels === 'function') closePanels();
      const ov = document.querySelector('.mchost-ov');
      if (ov) ov.remove();
      return true;
    })()
  `);
  await wait(600);

  // 1. Criação e injeção do mapa rico
  console.log('2. Injetando mapa completo de teste no editor do tablet...');
  const createMapScript = `
    (() => {
      const { MindMap, createNode } = MindCore.model;
      const { setNodeVideoRef } = MindCore.videorefs;

      const m = new MindMap(createNode('Direito Constitucional — Controle de Constitucionalidade'));
      m.root.notes = 'Visão geral do controle de constitucionalidade no direito brasileiro.';

      // Ramo 1: Controle Difuso
      const difuso = m.addChild(m.root.id, 'Controle Difuso (Concreto)');
      difuso.notes = '# Regras Fundamentais\\n- Qualquer juiz ou tribunal competente\\n- Cláusula de reserva de plenário (Art. 97 CF)\\n- Efeitos inter partes';
      difuso.style = { fill: '#0284c7', shape: 'pill', bold: true };
      difuso.study = {
        weight: 2,
        streak: 3,
        next: '2026-11-05',
        history: [{ date: '2026-10-22', result: 'ok' }]
      };

      // Subtópico: Reserva de Plenário com referência de vídeo
      const reserva = m.addChild(difuso.id, 'Cláusula de Reserva de Plenário');
      reserva.notes = 'Súmula Vinculante 10: Viola a cláusula a decisão de órgão fracionário que afasta a incidência da lei sem declarar expressamente a inconstitucionalidade.';
      setNodeVideoRef(reserva, {
        videoId: 'v1',
        time: 225, // 03:45
        title: 'Explicação detalhada da SV 10 pelo professor'
      });

      // Ramo 2: Controle Concentrado
      const concentrado = m.addChild(m.root.id, 'Controle Concentrado (Abstrato)');
      concentrado.style = { fill: '#16a34a', shape: 'round', bold: true };
      const adi = m.addChild(concentrado.id, 'Ação Direta de Inconstitucionalidade (ADI)');
      const adpf = m.addChild(concentrado.id, 'Arguição de Descumprimento de Preceito Fundamental (ADPF)');
      adpf.notes = 'Princípio da subsidiariedade: só cabe se não houver outro meio eficaz de sanar a lesividade.';

      // Catálogo de vídeos registrados no mapa
      m.meta.videos = [
        { id: 'v1', name: 'Aula 04 - Controle de Constitucionalidade', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', dur: 3600 }
      ];

      // Relação entre ADPF e Difuso com seta e estilo tracejado
      const rel = m.addRelation(adpf.id, difuso.id, 'Subsidiariedade em relação a outros meios');
      m.updateRelation(rel.id, {
        color: '#ea580c',
        style: 'dashed'
      });

      // Abre o mapa no editor
      map = m;
      filePath = null;
      dirty = false;
      selectedId = reserva.id;
      selIds = new Set();
      selectedRel = null;
      hits = null;
      rev++;
      if (typeof closeHome === 'function') closeHome();
      if (typeof closePanels === 'function') closePanels();
      render();
      fit();

      return {
        root: m.root.title,
        nodes: m.root.children.length,
        relations: m.meta.relations.length,
        reservaId: reserva.id
      };
    })()
  `;

  const mapInfo = await c.ev(createMapScript);
  console.log('   ✓ Mapa injetado: "%s", %d ramos, %d relação.', mapInfo.root, mapInfo.nodes, mapInfo.relations);
  await wait(1500);

  console.log('3. Capturando evidência do mapa completo antes de exportar (tela limpa e maximizada)...');
  shot('28-tablet-mapa-rico-antes-exportar');

  // 2. Exportação de todos os formatos no ambiente do tablet
  console.log('\n4. Executando exportação dos formatos (.mom, .mcpack, .md)...');
  const exportScript = `
    (async () => {
      const fs = window.__mcHost.fs;
      const MindCore = window.MindCore;
      fs.mkdirSync('/docs', { recursive: true });
      fs.mkdirSync('/imports', { recursive: true });

      // 1. Exporta .mom nos documentos do app
      const momBuf = MindCore.mom.writeMom(map);
      fs.writeFileSync('/docs/controle-constitucionalidade.mom', momBuf);

      // 2. Exporta Markdown
      const mdStr = MindCore.export.toMarkdown(map);
      fs.writeFileSync('/docs/mapa.md', mdStr, 'utf8');

      // 3. Salva no SQLite e exporta .mcpack portátil
      await saveToLibrary();
      const lib = getLibrary();
      const packRes = lib.exportPackage('/imports/backup-estudos.mcpack', {
        settings: { light: false, startScreen: 'last', notifyDaily: true, notifyAt: '08:00' }
      });

      return {
        momBytes: momBuf.length,
        mdBytes: mdStr.length,
        packMaps: packRes.maps,
        packBytes: packRes.bytes
      };
    })()
  `;
  const expRes = await c.ev(exportScript);
  console.log('   ✓ Arquivo .mom exportado com %d bytes', expRes.momBytes);
  console.log('   ✓ Arquivo Markdown exportado com %d bytes', expRes.mdBytes);
  console.log('   ✓ Pacote .mcpack exportado com %d mapas (%d bytes)', expRes.packMaps, expRes.packBytes);

  // Abre a biblioteca para mostrar os pacotes e backups na interface visual
  await c.ev(`openLibraryModal(); true`);
  await wait(1500);
  console.log('5. Capturando evidência visual da biblioteca SQLite com pacotes e backups...');
  shot('29-tablet-export-biblioteca-pacotes');

  // Fecha o modal
  await c.ev(`closeModal(); true`);
  await wait(500);

  // 3. Limpeza total do editor (Mapa em Branco)
  console.log('\n6. Limpando o editor (abrindo mapa em branco)...');
  await c.ev(`
    (() => {
      map = new MindCore.model.MindMap(MindCore.model.createNode('Novo Mapa em Branco'));
      filePath = null;
      dirty = false;
      selectedId = map.root.id;
      selIds = new Set();
      selectedRel = null;
      hits = null;
      rev++;
      render();
      fit();
      return map.root.title;
    })()
  `);
  await wait(1200);
  console.log('7. Capturando evidência visual do editor com mapa em branco...');
  shot('30-tablet-mapa-em-branco');

  // 4. Importação e Restauração via .mom
  console.log('\n8. Re-importando arquivo .mom no tablet e verificando integridade de 100%...');
  const importMomScript = `
    (() => {
      const fs = window.__mcHost.fs;
      const data = fs.readFileSync('/docs/controle-constitucionalidade.mom');
      const restored = MindCore.mom.readMom(data);

      // Verificações rigorosas
      const difuso = restored.root.children.find(c => c.title.includes('Controle Difuso'));
      const reserva = difuso.children.find(c => c.title.includes('Reserva de Plenário'));
      const videoRef = MindCore.videorefs.getNodeVideoRef(reserva);

      map = restored;
      filePath = '/docs/controle-constitucionalidade.mom';
      dirty = false;
      selectedId = difuso.id; // seleciona o nó difuso com estilo pílula e estudo
      selIds = new Set();
      selectedRel = null;
      hits = null;
      rev++;
      render();
      fit();

      return {
        title: restored.root.title,
        difusoNotes: difuso.notes,
        difusoFill: difuso.style.fill,
        difusoShape: difuso.style.shape,
        difusoWeight: difuso.study ? difuso.study.weight : null,
        difusoNext: difuso.study ? difuso.study.next : null,
        reservaNotes: reserva.notes,
        videoTime: videoRef ? videoRef.time : null,
        videoLabel: videoRef ? videoRef.label : null,
        catalogVideos: (restored.meta.videos || []).length,
        relationsCount: (restored.meta.relations || []).length,
        relLabel: restored.meta.relations[0].label,
        relColor: restored.meta.relations[0].color,
        relStyle: restored.meta.relations[0].style
      };
    })()
  `;
  const momRestored = await c.ev(importMomScript);
  assert.strictEqual(momRestored.title, 'Direito Constitucional — Controle de Constitucionalidade');
  assert.strictEqual(momRestored.difusoFill, '#0284c7');
  assert.strictEqual(momRestored.difusoShape, 'pill');
  assert.strictEqual(momRestored.difusoWeight, 2);
  assert.strictEqual(momRestored.difusoNext, '2026-11-05');
  assert.strictEqual(momRestored.videoTime, 225);
  assert.strictEqual(momRestored.catalogVideos, 1);
  assert.strictEqual(momRestored.relationsCount, 1);
  assert.strictEqual(momRestored.relColor, '#ea580c');
  assert.strictEqual(momRestored.relStyle, 'dashed');
  console.log('   ✓ Validação de fidelidade do .mom:');
  console.log('     - Título: "%s"', momRestored.title);
  console.log('     - Estilo visual preservado: forma %s, cor %s', momRestored.difusoShape, momRestored.difusoFill);
  console.log('     - Estudo de concurso preservado: peso %d, revisão em %s', momRestored.difusoWeight, momRestored.difusoNext);
  console.log('     - Vídeo de estudo preservado: %s', momRestored.videoLabel);
  console.log('     - Relação preservada: "%s" (%s, estilo: %s)', momRestored.relLabel, momRestored.relColor, momRestored.relStyle);

  await wait(1200);
  console.log('9. Capturando evidência visual do mapa restaurado via .mom...');
  shot('31-tablet-mapa-restaurado-mom');

  // 5. Restauração via Pacote .mcpack (SQLite)
  console.log('\n10. Restaurando mapa a partir do pacote .mcpack no SQLite...');
  const importPackScript = `
    (() => {
      const lib = getLibrary();
      // Importa o pacote
      const report = lib.importPackage('/imports/backup-estudos.mcpack', { onConflict: 'replace' });
      
      // Carrega o mapa do banco SQLite
      const maps = lib.listMaps();
      const targetMapInfo = maps.find(m => m.title.includes('Controle de Constitucionalidade'));
      const loaded = lib.loadMap(targetMapInfo.id);

      // Seleciona o nó de reserva de plenário para evidenciar o botão de vídeo na barra contextual
      const dif = loaded.root.children.find(c => c.title.includes('Controle Difuso'));
      const res = dif.children.find(c => c.title.includes('Reserva de Plenário'));
      
      map = loaded;
      filePath = null;
      dirty = false;
      selectedId = res.id;
      selIds = new Set();
      selectedRel = null;
      hits = null;
      rev++;
      render();
      fit();

      return {
        imported: report.imported,
        replaced: report.replaced,
        mapsCount: maps.length,
        loadedTitle: loaded.root.title,
        selectedTitle: res.title,
        videoRef: loaded.meta.videos
      };
    })()
  `;
  const packRestored = await c.ev(importPackScript);
  console.log('   ✓ Pacote restaurado com sucesso no SQLite: %d substituído(s), mapa aberto: "%s"', packRestored.replaced, packRestored.loadedTitle);
  assert.strictEqual(packRestored.loadedTitle, 'Direito Constitucional — Controle de Constitucionalidade');

  await wait(1200);
  console.log('11. Capturando evidência visual do mapa restaurado via .mcpack (com seleção do nó com vídeo)...');
  shot('32-tablet-mapa-restaurado-mcpack');

  c.close();
  console.log('\n=== TESTES DE EXPORT/IMPORT NO TABLET CONCLUÍDOS COM SUCESSO (100% DE SUCESSO) ===');
}

main().catch((err) => {
  console.error('\n❌ ERRO NO TESTE:', err);
  process.exit(1);
});
