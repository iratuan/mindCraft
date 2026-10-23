'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseTimestamp,
  formatTimestamp,
  isYouTubeUrl,
  extractYouTubeId,
  toYouTubeEmbedUrl,
  normalizeVideo,
  setNodeVideoRef,
  getNodeVideoRef,
} = require('../core/videorefs');

test('parseTimestamp: reconhece múltiplos formatos de carimbo de tempo', () => {
  assert.equal(parseTimestamp('00:45'), 45);
  assert.equal(parseTimestamp('01:30'), 90);
  assert.equal(parseTimestamp('01:00:00'), 3600);
  assert.equal(parseTimestamp('01:23:45'), 5025);
  assert.equal(parseTimestamp('120'), 120);
  assert.equal(parseTimestamp(75), 75);
  assert.equal(parseTimestamp('1h20m10s'), 4810);
  assert.equal(parseTimestamp('15m'), 900);
  assert.equal(parseTimestamp('45s'), 45);

  // Entradas inválidas
  assert.equal(parseTimestamp(null), null);
  assert.equal(parseTimestamp(''), null);
  assert.equal(parseTimestamp('abc'), null);
  assert.equal(parseTimestamp('-10'), null);
  assert.equal(parseTimestamp('01:85'), null); // minutos >= 60 em hh:mm
});

test('formatTimestamp: formata segundos em mm:ss ou hh:mm:ss', () => {
  assert.equal(formatTimestamp(0), '00:00');
  assert.equal(formatTimestamp(45), '00:45');
  assert.equal(formatTimestamp(90), '01:30');
  assert.equal(formatTimestamp(3600), '1:00:00');
  assert.equal(formatTimestamp(5025), '1:23:45');
  assert.equal(formatTimestamp(-10), '00:00');
});

test('isYouTubeUrl e extractYouTubeId: identifica formatos de links do YouTube', () => {
  const urls = [
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ];
  for (const [url, id] of urls) {
    assert.ok(isYouTubeUrl(url), `falhou em identificar: ${url}`);
    assert.equal(extractYouTubeId(url), id, `falhou em extrair id: ${url}`);
  }
  assert.equal(isYouTubeUrl('https://vimeo.com/12345'), false);
  assert.equal(extractYouTubeId('https://vimeo.com/12345'), null);
});

test('toYouTubeEmbedUrl: gera embed seguro com nocookie e início opcional', () => {
  const embed = toYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ', 95);
  assert.equal(embed, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?enablejsapi=1&rel=0&start=95');
  assert.equal(toYouTubeEmbedUrl('link_invalido'), null);
});

test('normalizeVideo: valida e higieniza registro de vídeo', () => {
  const v1 = normalizeVideo({ name: 'Aula 01 - Direito Constitucional', path: 'C:/aulas/aula1.mp4' });
  assert.ok(v1);
  assert.equal(v1.name, 'Aula 01 - Direito Constitucional');
  assert.equal(v1.path, 'C:/aulas/aula1.mp4');
  assert.ok(v1.id);

  const v2 = normalizeVideo({ url: 'https://youtu.be/xyz' });
  assert.ok(v2);
  assert.equal(v2.name, 'Vídeo sem título');

  assert.equal(normalizeVideo(null), null);
  assert.equal(normalizeVideo({}), null); // sem path nem url
});

test('setNodeVideoRef e getNodeVideoRef: vincula e lê referências de vídeo no nó', () => {
  const node = { id: 'n1', title: 'Controle de Constitucionalidade' };
  assert.equal(setNodeVideoRef(node, { videoId: 'v1', time: '12:30', title: 'Ação Direta' }), true);
  const ref = getNodeVideoRef(node);
  assert.ok(ref);
  assert.equal(ref.time, 750);
  assert.equal(ref.label, '🎬 12:30 - Ação Direta');

  // Remover
  setNodeVideoRef(node, null);
  assert.equal(getNodeVideoRef(node), null);
  assert.equal(node.mcVideoRef, undefined);
});
