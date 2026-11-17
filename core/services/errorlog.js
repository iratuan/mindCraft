'use strict';
const fs = require('fs');
const path = require('path');

/** Registro local de erros (nunca lança): <userData>/logs/erros.log, limitado a `max` bytes (descarta a metade mais antiga). */
function logError(dir, message, { max = 512 * 1024, now = new Date() } = {}) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'erros.log');
    if (fs.existsSync(file) && fs.statSync(file).size > max) {
      const buf = fs.readFileSync(file);
      const tail = buf.subarray(Math.floor(buf.length / 2));
      const nl = tail.indexOf(10);                                // recomeça numa linha inteira
      fs.writeFileSync(file, nl >= 0 ? tail.subarray(nl + 1) : tail);
    }
    fs.appendFileSync(file, `${now.toISOString()}\t${String(message).replace(/\s+/g, ' ').slice(0, 2000)}\n`);
    return true;
  } catch { return false; }
}

module.exports = { logError };
