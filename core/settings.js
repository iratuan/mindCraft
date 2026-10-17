'use strict';
/**
 * Configurações PORTÁTEIS (vão no pacote .mcpack para outra instalação). Só preferências de uso; nunca caminhos do computador,
 * ids de arquivos ou posições de PDF. Tudo que chega de fora é validado: valores desconhecidos ou fora do domínio são descartados.
 */
const START = ['home', 'last', 'blank'];
const isBool = (v) => typeof v === 'boolean';

function sanitizeSettings(raw) {
  const o = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return o;
  if (START.includes(raw.startScreen)) o.startScreen = raw.startScreen;
  for (const k of ['dashOnStart', 'newInLibrary', 'light', 'notifyDaily']) if (isBool(raw[k])) o[k] = raw[k];
  if (raw.pdfScale === 'fit' || (Number.isFinite(raw.pdfScale) && raw.pdfScale >= 0.25 && raw.pdfScale <= 5)) o.pdfScale = raw.pdfScale;
  if (typeof raw.notifyAt === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(raw.notifyAt)) o.notifyAt = raw.notifyAt;
  if (Number.isFinite(raw.pdfWidth) && raw.pdfWidth >= 240 && raw.pdfWidth <= 4000) o.pdfWidth = Math.round(raw.pdfWidth);
  return o;
}
module.exports = { sanitizeSettings, START };
