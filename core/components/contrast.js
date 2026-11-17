'use strict';
/**
 * Contraste de cores (WCAG 2): luminância relativa, razão de contraste e ajuste até um mínimo.
 * Mantém o mapa legível em canvas claro ou escuro, ajustando cores que se confundiriam com o fundo.
 * Puro: só trabalha com cores em hexadecimal #rrggbb; qualquer outra coisa é devolvida como veio.
 */
const HEX = /^#[0-9a-fA-F]{6}$/;
const MIN_GRAPHIC = 3;     // mínimo para formas, linhas e contornos
const MIN_TEXT = 4.5;      // mínimo para texto

const isHex = (c) => HEX.test(c || '');

function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** Razão de contraste entre duas cores (1 = iguais; 21 = preto sobre branco). */
function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** Mistura a cor com branco: t = 0 não muda, t = 1 vira branco. */
function lighten(hex, t) {
  const ch = (i) => parseInt(hex.slice(i, i + 2), 16);
  const mix = (v) => Math.round(v + (255 - v) * t).toString(16).padStart(2, '0');
  return `#${mix(ch(1))}${mix(ch(3))}${mix(ch(5))}`;
}

/** Mistura a cor com preto: t = 0 não muda, t = 1 vira preto. */
function darken(hex, t) {
  const ch = (i) => parseInt(hex.slice(i, i + 2), 16);
  const mix = (v) => Math.round(v * (1 - t)).toString(16).padStart(2, '0');
  return `#${mix(ch(1))}${mix(ch(3))}${mix(ch(5))}`;
}

/** Ajusta a cor para o tom mais próximo com contraste mínimo `min`; usa preto ou branco no limite. */
function onCanvas(color, canvas, min = MIN_GRAPHIC) {
  if (!isHex(color) || !isHex(canvas) || contrast(color, canvas) >= min) return color;
  const first = luminance(canvas) < 0.5 ? lighten : darken;
  const second = first === lighten ? darken : lighten;
  for (let t = 0.05; t <= 1.001; t += 0.05) {
    const a = first(color, Math.min(t, 1));
    if (contrast(a, canvas) >= min) return a;
    const b = second(color, Math.min(t, 1));
    if (contrast(b, canvas) >= min) return b;
  }
  return contrast('#ffffff', canvas) >= contrast('#000000', canvas) ? '#ffffff' : '#000000';
}

module.exports = { MIN_GRAPHIC, MIN_TEXT, isHex, luminance, contrast, lighten, darken, onCanvas };
