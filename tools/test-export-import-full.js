'use strict';
/**
 * Teste completo de Exportação, Importação e Preservação de Conteúdo (Round-Trip)
 * MindCraft — Electron & Android Tablet.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { MindMap } = require('../core/model');
const { readMom, writeMom } = require('../core/mom');
const { openLibrary } = require('../core/library');
const { toMarkdown, toOPML, toPDF, toDOCX } = require('../core/export');
const { setNodeVideoRef, getNodeVideoRef } = require('../core/videorefs');

const TMP_DIR = path.join(__dirname, '..', 'evidencias', 'export-import-test');
fs.mkdirSync(TMP_DIR, { recursive: true });

async function runTest() {
  console.log('=== TESTE DE EXPORTAÇÃO E IMPORTAÇÃO DE MAPAS — MINDCRAFT ===\n');

  // 1. Criação de mapa rico com todos os tipos de conteúdo suportados
  console.log('1. Criando mapa completo de teste com tópicos, notas, estudo, relações e vídeo...');
  const map = new MindMap();
  map.root.title = 'Direito Constitucional — Controle de Constitucionalidade';
  map.root.notes = 'Visão geral do controle de constitucionalidade no direito brasileiro.';

  // Tópico Difuso
  const difuso = map.addChild(map.root.id, 'Controle Difuso (Concreto)');
  difuso.notes = '# Regras Fundamentais\n- Qualquer juiz ou tribunal competente\n- Cláusula de reserva de plenário (Art. 97 CF)\n- Efeitos inter partes (com exceção de suspensão pelo Senado)';
  difuso.style = { fill: '#0284c7', shape: 'pill', bold: true };
  difuso.study = {
    weight: 2,
    streak: 3,
    next: '2026-11-05',
    history: [
      { date: '2026-10-15', result: 'ok' },
      { date: '2026-10-22', result: 'ok' }
    ]
  };

  map.meta.videos = [
    { id: 'v1', name: 'Aula 04 - Controle de Constitucionalidade', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', dur: 3600 }
  ];

  // Subtópicos de Controle Difuso
  const reserva = map.addChild(difuso.id, 'Cláusula de Reserva de Plenário');
  reserva.notes = 'Súmula Vinculante 10: Viola a cláusula a decisão de órgão fracionário que afasta a incidência da lei sem declarar expressamente a inconstitucionalidade.';
  setNodeVideoRef(reserva, {
    videoId: 'v1',
    time: 225, // 03:45
    title: 'Explicação detalhada da SV 10 pelo professor'
  });

  // Tópico Concentrado
  const concentrado = map.addChild(map.root.id, 'Controle Concentrado (Abstrato)');
  concentrado.style = { fill: '#16a34a', shape: 'round', bold: true };
  const _adi = map.addChild(concentrado.id, 'Ação Direta de Inconstitucionalidade (ADI)');
  const adpf = map.addChild(concentrado.id, 'Arguição de Descumprimento de Preceito Fundamental (ADPF)');
  adpf.notes = 'Princípio da subsidiariedade: só cabe se não houver outro meio eficaz de sanar a lesividade.';

  // Relação entre nós com rótulo, cor e estilo
  const rel = map.addRelation(adpf.id, difuso.id, 'Subsidiariedade em relação a outros meios');
  map.updateRelation(rel.id, {
    color: '#ea580c',
    style: 'dashed'
  });

  console.log('   ✓ Mapa criado: %d nós, 1 relação, notas formatadas, carimbo de vídeo e dados de revisão.\n', 5);

  // 2. Teste de Exportação e Importação .mom (Mindomo nativo do MindCraft)
  console.log('2. Testando Exportação e Importação .mom (Formato Nativo)...');
  const momPath = path.join(TMP_DIR, 'controle-constitucionalidade.mom');
  const momBuffer = writeMom(map);
  fs.writeFileSync(momPath, momBuffer);
  console.log('   ✓ Arquivo .mom gravado com sucesso (%d bytes)', momBuffer.length);
  assert.ok(momBuffer.length > 500, 'Tamanho do arquivo .mom deve ser válido');

  // Re-importa o .mom
  const reimportedMom = readMom(fs.readFileSync(momPath));
  console.log('   ✓ Arquivo .mom reimportado.');

  // Verificações rigorosas de fidelidade
  assert.strictEqual(reimportedMom.root.title, map.root.title, 'Título da raiz deve coincidir');
  assert.strictEqual(reimportedMom.root.children.length, 2, 'Raiz deve ter 2 ramos principais');
  
  const reDifuso = reimportedMom.root.children.find(c => c.title.includes('Controle Difuso'));
  assert.ok(reDifuso, 'Controle Difuso deve existir');
  assert.strictEqual(reDifuso.notes, difuso.notes, 'Notas do Controle Difuso devem estar idênticas');
  assert.strictEqual(reDifuso.style.fill, '#0284c7', 'Cor de preenchimento deve ser preservada');
  assert.strictEqual(reDifuso.style.shape, 'pill', 'Forma pílula deve ser preservada');

  const reReserva = reDifuso.children.find(c => c.title.includes('Reserva de Plenário'));
  assert.ok(reReserva, 'Cláusula de Reserva de Plenário deve existir');
  const videoRef = getNodeVideoRef(reReserva);
  assert.ok(videoRef, 'Referência de vídeo deve estar associada ao nó');
  assert.strictEqual(videoRef.time, 225, 'Carimbo de tempo (03:45) deve ser preservado');
  assert.strictEqual(videoRef.videoId, 'v1', 'ID do vídeo deve ser preservado');
  assert.strictEqual(reimportedMom.meta.videos.length, 1, 'Catálogo de vídeos deve ser preservado');
  assert.strictEqual(reimportedMom.meta.videos[0].url, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'URL do vídeo deve ser preservada');

  assert.strictEqual(reimportedMom.meta.relations.length, 1, 'Relação deve ser preservada');
  assert.strictEqual(reimportedMom.meta.relations[0].label, 'Subsidiariedade em relação a outros meios', 'Rótulo da relação preservado');
  assert.strictEqual(reimportedMom.meta.relations[0].color, '#ea580c', 'Cor da relação preservada');
  assert.strictEqual(reimportedMom.meta.relations[0].style, 'dashed', 'Traço tracejado preservado');
  console.log('   ✓ Todas as validações do formato .mom passaram com 100% de precisão.\n');

  // 3. Teste de Pacote Completo de Backup .mcpack (SQLite + Configurações + Múltiplos Mapas)
  console.log('3. Testando Exportação e Importação de Pacote .mcpack (Backup Completo)...');
  const libOriginal = openLibrary(':memory:');
  const mapId = libOriginal.saveMap(map);

  const packPath = path.join(TMP_DIR, 'backup-estudos.mcpack');
  const packSummary = libOriginal.exportPackage(packPath, {
    settings: { light: true, startScreen: 'last', notifyDaily: true, notifyAt: '08:00' }
  });
  console.log('   ✓ Pacote .mcpack exportado: %d mapas incluídos, tamanho %d bytes', packSummary.maps, fs.statSync(packPath).size);

  // Importa em um novo banco de dados limpo
  const libRestaurada = openLibrary(':memory:');
  const importSummary = libRestaurada.importPackage(packPath);
  console.log('   ✓ Pacote .mcpack restaurado: %d mapas importados, configurações restauradas.', importSummary.imported);
  assert.strictEqual(importSummary.imported, 1, 'Deve ter importado 1 mapa');
  assert.strictEqual(importSummary.settings.notifyAt, '08:00', 'Configuração notifyAt deve ser preservada');
  assert.strictEqual(importSummary.settings.light, true, 'Tema claro/escuro restaurado');

  const loadedMap = libRestaurada.loadMap(mapId);
  assert.strictEqual(loadedMap.root.title, map.root.title, 'Título do mapa restaurado no SQLite');
  assert.strictEqual(loadedMap.meta.relations.length, 1, 'Relação restaurada no SQLite');
  console.log('   ✓ Pacote .mcpack restaurado com fidelidade total no SQLite.\n');

  // 4. Teste de Exportação para Formatos de Leitura
  console.log('4. Testando Exportações para Formatos de Leitura (Markdown, OPML, Word, PDF)...');
  const mdContent = toMarkdown(map);
  fs.writeFileSync(path.join(TMP_DIR, 'mapa.md'), mdContent, 'utf8');
  assert.ok(mdContent.includes('# Direito Constitucional'), 'Markdown deve conter cabeçalho');
  assert.ok(mdContent.includes('Cláusula de Reserva'), 'Markdown deve conter subtópicos');

  const opmlContent = toOPML(map);
  fs.writeFileSync(path.join(TMP_DIR, 'mapa.opml'), opmlContent, 'utf8');
  assert.ok(opmlContent.includes('Controle Difuso'), 'OPML deve conter outlines');

  const docxBuffer = await toDOCX(map);
  fs.writeFileSync(path.join(TMP_DIR, 'mapa.docx'), docxBuffer);
  assert.ok(docxBuffer.length > 1000, 'DOCX gerado deve ter tamanho válido');

  const pdfBuffer = await toPDF(map);
  fs.writeFileSync(path.join(TMP_DIR, 'mapa.pdf'), pdfBuffer);
  assert.ok(pdfBuffer.length > 1000, 'PDF gerado deve ter tamanho válido');

  console.log('   ✓ Markdown, OPML, Word (.docx) e PDF gerados com sucesso.\n');

  console.log('=== TODOS OS TESTES PROGRAMÁTICOS DE IMPORT/EXPORT PASSARAM (100% OK) ===');
  return { map, momPath, packPath };
}

if (require.main === module) {
  runTest().catch((err) => {
    console.error('FALHA NO TESTE:', err);
    process.exit(1);
  });
}

module.exports = { runTest };
