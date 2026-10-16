#!/usr/bin/env node
'use strict';
// Biblioteca SQLite do MindCraft (migração dos .mom e transporte entre computadores).
//   migrar   <pasta-com-.mom> <biblioteca.db>      importa todos os .mom (só leitura nos originais; verifica cada mapa)
//   listar   <biblioteca.db>                       mapas, tópicos e revisões vencidas
//   exportar <biblioteca.db> <saida.mcpack>        pacote portátil (um arquivo) para levar a outro computador
//   importar <biblioteca.db> <pacote.mcpack> [--substituir | --ignorar]   (padrão: conflito vira cópia)
//   backup   <biblioteca.db> <copia.db>            cópia consistente do banco inteiro
const path = require('path');
const { openLibrary } = require('../core/library');

function run(argv) {
  const [cmd, a, b, ...rest] = argv;
  const need = (n) => { if (![a, b].slice(0, n).every(Boolean) || (n === 2 && !b)) throw new Error('argumentos faltando; veja o cabeçalho de bin/mindcraft-library.js'); };
  if (cmd === 'migrar') {
    need(2); const lib = openLibrary(path.resolve(b)); const r = lib.importFolder(path.resolve(a));
    for (const i of r.items) console.log(`  ${i.status.padEnd(10)} ${path.relative(path.resolve(a), i.file)}${i.error ? ' — ' + i.error : ''}`);
    console.log(`${r.files} arquivo(s): ${r.imported} importado(s), ${r.duplicated} já existia(m), ${r.failed} com erro. Originais não foram alterados.`);
    lib.close(); return r.failed ? 2 : 0;
  }
  if (cmd === 'listar') {
    need(1); const lib = openLibrary(path.resolve(a));
    for (const m of lib.listMaps()) console.log(`  ${m.title}  ·  ${m.topics} tópicos  ·  ${m.due} revisão(ões) vencida(s)  ·  ${m.exam_date ? 'prova ' + m.exam_date : 'sem prova'}`);
    lib.close(); return 0;
  }
  if (cmd === 'exportar') { need(2); const lib = openLibrary(path.resolve(a)); const r = lib.exportPackage(path.resolve(b)); console.log(`pacote com ${r.maps} mapa(s): ${path.resolve(b)}`); lib.close(); return 0; }
  if (cmd === 'importar') {
    need(2); const lib = openLibrary(path.resolve(a));
    const r = lib.importPackage(path.resolve(b), { onConflict: rest.includes('--substituir') ? 'replace' : rest.includes('--ignorar') ? 'skip' : 'copy' });
    for (const i of r.items) console.log(`  ${i.status.padEnd(22)} ${i.title}`);
    console.log(`${r.maps} mapa(s): ${r.imported} novo(s), ${r.copied} cópia(s), ${r.replaced} substituído(s), ${r.skipped} ignorado(s)/igual(is).`); lib.close(); return 0;
  }
  if (cmd === 'backup') { need(2); const lib = openLibrary(path.resolve(a)); lib.backupTo(path.resolve(b)); console.log('backup: ' + path.resolve(b)); lib.close(); return 0; }
  console.error('uso: mindcraft-library <migrar|listar|exportar|importar|backup> ... (veja o cabeçalho do arquivo)'); return 1;
}
try { process.exit(run(process.argv.slice(2))); } catch (e) { console.error('erro: ' + e.message); process.exit(1); }
