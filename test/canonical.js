'use strict';
// Forma canônica de um mapa para comparar dois mapas por conteúdo (ignora datas de gravação e ids internos do Mindomo).
// Portado da antiga biblioteca SQLite: os testes continuam verificando o mesmo round-trip do .mom.
function stable(v) {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
  return JSON.stringify(v);
}
function canonical(map) {
  const copy = JSON.parse(JSON.stringify({ meta: map.meta, root: map.root }));
  // writeMom renova a data de modificação a cada gravação: ela não conta como diferença de conteúdo
  if (copy.meta._momDoc && copy.meta._momDoc.mapInfo) for (const k of ['modificationDate', 'creationDate', 'id']) delete copy.meta._momDoc.mapInfo[k];
  (function strip(n) { if (n._mom) { delete n._mom.modificationDate; delete n._mom.creationDate; } n.children.forEach(strip); })(copy.root);
  return stable(copy);
}
module.exports = { canonical, stable };
