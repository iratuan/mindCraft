'use strict';
// Provedor de sincronização por PASTA: serve para qualquer pasta que outro programa já espelha (Google Drive para computador,
// OneDrive, Dropbox, Syncthing, pendrive…). Só mexe em <pasta>/maps/. Nunca apaga nada. Gravação atômica (temporário + renomear).
const fs = require('fs');
const path = require('path');
const { NAME } = require('./sync');

class FolderRemote {
  constructor(dir) {
    if (typeof dir !== 'string' || !dir.trim()) throw new Error('Escolha a pasta de sincronização.');
    this.dir = path.resolve(dir); this.maps = path.join(this.dir, 'maps');
  }
  /** Confere que a pasta existe e pode ser escrita (sem criar a pasta-raiz: se sumiu, não vira outra no lugar). */
  check() {
    let st; try { st = fs.statSync(this.dir); } catch { throw new Error('A pasta de sincronização não existe (ou o disco não está conectado): ' + this.dir); }
    if (!st.isDirectory()) throw new Error('O caminho escolhido não é uma pasta: ' + this.dir);
    fs.mkdirSync(this.maps, { recursive: true });
    const probe = path.join(this.maps, `.teste-${process.pid}`); fs.writeFileSync(probe, 'ok'); fs.rmSync(probe, { force: true });
  }
  async list() { this.check(); return fs.readdirSync(this.maps).map((n) => 'maps/' + n).filter((n) => NAME.test(n)); }
  async read(name) { if (!NAME.test(name)) throw new Error('nome inválido'); return fs.readFileSync(path.join(this.dir, name)); }
  async write(name, data) {
    if (!NAME.test(name)) throw new Error('nome inválido');
    const target = path.join(this.dir, name);
    if (fs.existsSync(target)) return;                         // mesmo nome = mesmo conteúdo (o hash está no nome): nada a fazer
    const tmp = path.join(this.maps, `.${path.basename(name)}.tmp-${process.pid}`);
    try { fs.writeFileSync(tmp, data); fs.renameSync(tmp, target); } catch (e) { fs.rmSync(tmp, { force: true }); throw e; }
  }
}
module.exports = { FolderRemote };
