'use strict';
// Gera os índices das evidências a partir de resultados.json (criado por `npm run evidence`):
//   docs/evidencias/README.md  — tabela de funcionalidades, status e links para cada captura/arquivo
//   README.md (raiz)           — bloco de funcionalidades com links (entre os marcadores funcionalidades:inicio/fim)
const fs = require('fs');
const path = require('path');

const MARK_INI = '<!-- funcionalidades:inicio -->';
const MARK_FIM = '<!-- funcionalidades:fim -->';
const ICONE = { ok: '✅', 'não testado': '⚪', falhou: '❌', 'não executado': '⬜' };

function linkDe(arq, prefixo) {
  const nome = path.posix.basename(arq);
  return `[${nome}](${prefixo}${arq})`;
}

function tabelaArea(linhas, prefixo) {
  const out = ['| Funcionalidade | Status | Evidência |', '|---|---|---|'];
  for (const l of linhas) {
    const ev = l.arquivos.length ? l.arquivos.map((a) => linkDe(a, prefixo)).join(' · ') : (l.mensagem ? '_' + l.mensagem + '_' : '—');
    out.push(`| ${l.titulo} | ${ICONE[l.status] || ''} ${l.status} | ${ev} |`);
  }
  return out.join('\n');
}

function escreverIndices(linhas, areas, raiz) {
  const dir = path.join(raiz, 'docs', 'evidencias');
  const ok = linhas.filter((l) => l.status === 'ok').length;
  const nt = linhas.filter((l) => l.status === 'não testado').length;
  const falhas = linhas.filter((l) => l.status === 'falhou').length;
  const data = new Date().toISOString().slice(0, 10);

  // docs/evidencias/README.md (links relativos à própria pasta)
  const partesDocs = [
    '# Evidências das funcionalidades', '',
    `Gerado por \`npm run evidence\` em ${data}. Cada funcionalidade foi executada no app real (Electron); a captura ou o arquivo gerado fica ao lado do nome.`, '',
    `**Resumo:** ${ok} testadas e ok · ${nt} não testadas neste ambiente · ${falhas} falhas.`, '',
  ];
  for (const [id, titulo] of areas) {
    const ls = linhas.filter((l) => l.area === id);
    if (!ls.length) continue;
    partesDocs.push(`## ${titulo}`, '', tabelaArea(ls, ''), '');
  }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'README.md'), partesDocs.join('\n'), 'utf8');

  // bloco do README da raiz (links com o prefixo docs/evidencias/)
  const blocos = [MARK_INI, '', `Cada funcionalidade abaixo foi executada no app (${ok} testadas e ok, ${nt} não testadas neste ambiente). Atualizado em ${data} por \`npm run evidence\`; as capturas ficam em [docs/evidencias](docs/evidencias/README.md).`, ''];
  for (const [id, titulo] of areas) {
    const ls = linhas.filter((l) => l.area === id);
    if (!ls.length) continue;
    blocos.push(`### ${titulo}`, '', tabelaArea(ls, 'docs/evidencias/'), '');
  }
  blocos.push(MARK_FIM);
  const readme = path.join(raiz, 'README.md');
  let texto = fs.readFileSync(readme, 'utf8');
  const i = texto.indexOf(MARK_INI), j = texto.indexOf(MARK_FIM);
  if (i < 0 || j < 0) throw new Error('README.md sem os marcadores ' + MARK_INI + ' / ' + MARK_FIM);
  texto = texto.slice(0, i) + blocos.join('\n') + texto.slice(j + MARK_FIM.length);
  fs.writeFileSync(readme, texto, 'utf8');
  return { ok, nt, falhas };
}

module.exports = { escreverIndices };
