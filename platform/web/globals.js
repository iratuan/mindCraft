'use strict';
// Globais que o núcleo espera do Node e o navegador/Android não tem: Buffer e process (mínimo).
const { Buffer } = require('buffer');
if (typeof globalThis.Buffer === 'undefined') globalThis.Buffer = Buffer;
if (typeof globalThis.process === 'undefined') globalThis.process = { pid: 0, env: {}, platform: 'web', cwd: () => '/', versions: {} };
module.exports = { Buffer };
