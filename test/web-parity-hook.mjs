// Gancho de paridade: `node --import ./test/web-parity-hook.mjs --test test/*.test.js`
// Faz os testes unitários do desktop rodarem contra o núcleo "versão web" (SHA-256 em JS, zip via fflate, SQLite em WebAssembly).
// Os testes não mudam: qualquer require de core/<módulo> devolve a versão empacotada com os adaptadores.
import Module, { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const require = createRequire(import.meta.url);

// O build é feito UMA vez antes (npm run test:web): cada processo de teste só carrega, sem reconstruir (evita corrida entre processos).
if (!fs.existsSync(path.join(root, 'build', 'web', 'parity-core.js'))) throw new Error('Rode antes: node tools/build-web-core.js parity (ou npm run test:web).');
globalThis.__MC_SQL = await require('sql.js')();             // motor SQLite (WebAssembly) carregado uma vez
const bundle = require(path.join(root, 'build', 'web', 'parity-core.js'));
const coreDir = path.join(root, 'core') + path.sep;

const load = Module._load;
Module._load = function (request, parent, isMain) {
  if (/^\.{1,2}\//.test(request) || path.isAbsolute(request)) {
    let file; try { file = Module._resolveFilename(request, parent, isMain); } catch { file = null; }
    if (file && file.startsWith(coreDir)) { const name = path.basename(file, '.js'); if (Object.prototype.hasOwnProperty.call(bundle, name)) return bundle[name]; }
  }
  return load.apply(this, arguments);
};
