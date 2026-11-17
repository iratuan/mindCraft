'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { luminance, contrast, lighten, darken, onCanvas, MIN_GRAPHIC, MIN_TEXT } = require('../core/components/contrast');

test('luminance(hex): WCAG 2.0 relative luminance', () => {
  assert.strictEqual(luminance('#ffffff'), 1.0, 'branco é 1.0');
  assert.strictEqual(luminance('#000000'), 0.0, 'preto é 0.0');
  assert.ok(luminance('#888888') > 0 && luminance('#888888') < 1, 'cinza está no meio');
  // Na fórmula WCAG: verde tem peso 0.7152, vermelho tem 0.2126, então verde > vermelho
  assert.ok(luminance('#00ff00') > luminance('#ff0000'), 'verde > vermelho (WCAG pesa verde mais)');
});

test('contrast(a, b): razão de contraste (1..21)', () => {
  assert.strictEqual(contrast('#ffffff', '#000000'), 21, 'branco sobre preto = 21');
  assert.strictEqual(contrast('#000000', '#ffffff'), 21, 'ordem não importa');
  assert.ok(contrast('#888888', '#888888') === 1, 'cores iguais = 1');
  assert.ok(contrast('#ffffff', '#eeeeee') > 1 && contrast('#ffffff', '#eeeeee') < 2, 'branco e quase-branco < 2');
});

test('lighten(hex, t): mistura com branco', () => {
  const l0 = lighten('#000000', 0);
  assert.strictEqual(l0, '#000000', 't=0 retorna a cor original');
  const l1 = lighten('#000000', 1);
  assert.strictEqual(l1, '#ffffff', 't=1 vira branco');
  const l05 = lighten('#000000', 0.5);
  assert.ok(l05 !== '#000000' && l05 !== '#ffffff', 't=0.5 está no meio');
  assert.ok(contrast(lighten('#000000', 0), lighten('#000000', 0.5)) > contrast(lighten('#000000', 0), lighten('#000000', 0.1)), 'mais claro = contraste maior');
});

test('darken(hex, t): mistura com preto', () => {
  assert.strictEqual(darken('#ffffff', 0), '#ffffff', 't=0 retorna a cor original');
  assert.strictEqual(darken('#ffffff', 1), '#000000', 't=1 vira preto');
  assert.ok(contrast(darken('#ffffff', 0.5), '#ffffff') > 1, 'escurecer aumenta o contraste com branco');
});

test('onCanvas(color, canvas, min): adapta cor ao canvas escuro', () => {
  const canvas = '#1c1f26';
  const bright = '#ffffff';
  const veryDark = '#1a1a1a';

  // cor brilhante no canvas escuro: já tem contraste, volta igual
  assert.strictEqual(onCanvas(bright, canvas, MIN_GRAPHIC), bright, 'branco já atende o mínimo');

  // cor muito escura: precisa ser clareada
  const adapted = onCanvas(veryDark, canvas, MIN_GRAPHIC);
  assert.ok(contrast(adapted, canvas) >= MIN_GRAPHIC, 'cor adaptada atende o mínimo 3:1');
  assert.ok(adapted !== veryDark, 'cor foi clareada');

  // sem canvas (null ou undefined): retorna como veio
  assert.strictEqual(onCanvas(veryDark, null, MIN_GRAPHIC), veryDark, 'canvas null retorna a cor original');
  assert.strictEqual(onCanvas(veryDark, undefined, MIN_GRAPHIC), veryDark, 'canvas undefined retorna a cor original');

  // cor não-hexadecimal: retorna como veio
  assert.strictEqual(onCanvas('rgb(0,0,0)', canvas, MIN_GRAPHIC), 'rgb(0,0,0)', 'cor não-hex não é adaptada');

  // mínimo de texto (4.5:1) é mais rigoroso que gráficos (3:1)
  const textAdapted = onCanvas(veryDark, canvas, MIN_TEXT);
  assert.ok(contrast(textAdapted, canvas) >= MIN_TEXT, 'com MIN_TEXT atende 4.5:1');
  assert.ok(contrast(textAdapted, canvas) > contrast(onCanvas(veryDark, canvas, MIN_GRAPHIC), canvas), 'texto > gráficos');
});

test('onCanvas: escurece cores com pouco contraste em canvas claro', () => {
  const canvas = '#c7c7c7';
  const adapted = onCanvas('#ffffff', canvas, MIN_TEXT);
  assert.ok(contrast(adapted, canvas) >= MIN_TEXT, 'cor adaptada atende 4,5:1');
  assert.ok(adapted !== '#ffffff', 'branco foi escurecido');
});

test('onCanvas: branco no limite', () => {
  const canvas = '#1c1f26';
  // pedindo contraste maior que o máximo possível (21 entre preto e branco)
  const result = onCanvas('#1a1a1a', canvas, 22);  // 22 é impossível
  assert.strictEqual(result, '#ffffff', 'branco é o fallback quando nada atinge');
});

test('onCanvas: ramp de clareamento', () => {
  const canvas = '#1c1f26';
  const dark = '#2a2a2a';
  const adapted = onCanvas(dark, canvas, MIN_GRAPHIC);
  assert.ok(contrast(adapted, canvas) >= MIN_GRAPHIC);
  // incrementos de 5% vão sendo testados até achar o contraste
  const steps = [];
  for (let t = 0.05; t <= 1; t += 0.05) {
    const c = lighten(dark, t);
    steps.push({ t, c, ok: contrast(c, canvas) >= MIN_GRAPHIC });
  }
  const first = steps.find((s) => s.ok);
  assert.ok(first, 'pelo menos um passo do ramp atende o mínimo');
});
