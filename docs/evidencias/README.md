# Evidências das funcionalidades

Gerado por `npm run evidence` em 2026-10-27. Cada funcionalidade foi executada no app real (Electron); a captura ou o arquivo gerado fica ao lado do nome.

**Resumo:** 41 testadas e ok · 2 não testadas neste ambiente · 0 falhas.

## Início e primeiro uso

| Funcionalidade | Status | Evidência |
|---|---|---|
| Tela inicial com os atalhos para começar | ✅ ok | [tela-inicial.png](inicio/tela-inicial.png) |
| Sem mapa aberto, o painel lateral some e a tela fica limpa | ✅ ok | [sem-mapa-sem-painel.png](inicio/sem-mapa-sem-painel.png) |
| Manual de uso (Ajuda → Manual de uso), com índice e busca | ✅ ok | [manual-de-uso.png](inicio/manual-de-uso.png) |
| Lista de atalhos do teclado (F1) | ✅ ok | [atalhos-do-teclado.png](inicio/atalhos-do-teclado.png) |

## Editar o mapa

| Funcionalidade | Status | Evidência |
|---|---|---|
| Novo mapa em branco | ✅ ok | [novo-mapa-em-branco.png](mapas/novo-mapa-em-branco.png) |
| Criar tópico filho (Tab) e irmão (Enter) | ✅ ok | [criar-topico-filho-e-irmao.png](mapas/criar-topico-filho-e-irmao.png) |
| Renomear o tópico (botão Renomear ou F2) | ✅ ok | [renomear-topico.png](mapas/renomear-topico.png) |
| Excluir tópico (botão na lateral ou Del) | ✅ ok | [excluir-topico.png](mapas/excluir-topico.png) |
| Desfazer e refazer (Ctrl+Z e Ctrl+Y) | ✅ ok | [desfazer-e-refazer.png](mapas/desfazer-e-refazer.png) |
| Recolher e expandir um ramo (tecla Espaço) | ✅ ok | [recolher-ramo.png](mapas/recolher-ramo.png) |
| Forma do tópico (barra do tópico) | ✅ ok | [forma-do-topico.png](mapas/forma-do-topico.png) |
| Notas e links [[entre tópicos]] | ✅ ok | [notas-e-links-entre-topicos-notas.png](mapas/notas-e-links-entre-topicos-notas.png) · [notas-e-links-entre-topicos-conexoes.png](mapas/notas-e-links-entre-topicos-conexoes.png) |

## Aparência e painéis

| Funcionalidade | Status | Evidência |
|---|---|---|
| Buscar no mapa (Ctrl+F) | ✅ ok | [busca-no-mapa.png](estilo/busca-no-mapa.png) |
| Tema visual do mapa (Oceano, Neon, Papel…) | ✅ ok | [tema-do-mapa.png](estilo/tema-do-mapa.png) |
| Marcadores de prioridade no tópico | ✅ ok | [marcadores.png](estilo/marcadores.png) |
| Estrutura do mapa em árvore (aba Estrutura) | ✅ ok | [estrutura-em-arvore.png](estilo/estrutura-em-arvore.png) |
| Recolher e reabrir o painel lateral | ✅ ok | [painel-lateral-recolher-recolhido.png](estilo/painel-lateral-recolher-recolhido.png) · [painel-lateral-recolher-aberto.png](estilo/painel-lateral-recolher-aberto.png) |
| Maximizar e restaurar o painel | ✅ ok | [painel-maximizar.png](estilo/painel-maximizar.png) |
| Rede de conhecimento (o mapa como rede de conexões) | ✅ ok | [rede-de-conhecimento.png](estilo/rede-de-conhecimento.png) |

## Estudo e revisão

| Funcionalidade | Status | Evidência |
|---|---|---|
| Estudo do tópico: revisão, tempo e questões | ✅ ok | [painel-do-topico.png](estudo/painel-do-topico.png) |
| Marcar "Estudei hoje" e "Errei" (agenda a próxima revisão) | ✅ ok | [estudei-hoje-e-errei-estudei.png](estudo/estudei-hoje-e-errei-estudei.png) · [estudei-hoje-e-errei-errei.png](estudo/estudei-hoje-e-errei-errei.png) |
| Registrar minutos de estudo | ✅ ok | [minutos-de-estudo.png](estudo/minutos-de-estudo.png) |
| Caderno de erros, com o motivo de cada erro | ✅ ok | [caderno-de-erros.png](estudo/caderno-de-erros.png) |
| Painel de estudos (progresso, sequência e metas) | ✅ ok | [painel-de-estudos.png](estudo/painel-de-estudos.png) |
| Revisão do dia (tópicos vencidos) | ✅ ok | [revisao-do-dia.png](estudo/revisao-do-dia.png) |
| Registrar simulado por disciplina | ✅ ok | [simulado.png](estudo/simulado.png) |

## Criar e importar mapas

| Funcionalidade | Status | Evidência |
|---|---|---|
| Novo mapa de concurso: escolher um modelo pronto | ✅ ok | [modelos-de-concurso-escolha.png](importar/modelos-de-concurso-escolha.png) · [modelos-de-concurso-mapa.png](importar/modelos-de-concurso-mapa.png) |
| Importar o CSV colado (resposta da IA), com prévia | ✅ ok | [csv-colado-da-ia-colagem.txt](importar/csv-colado-da-ia-colagem.txt) · [csv-colado-da-ia-previa.png](importar/csv-colado-da-ia-previa.png) · [csv-colado-da-ia-mapa.png](importar/csv-colado-da-ia-mapa.png) |
| Importar edital colando o texto do conteúdo programático | ✅ ok | [importar-edital-por-texto.png](importar/importar-edital-por-texto.png) |

## Dados, exportação e biblioteca

| Funcionalidade | Status | Evidência |
|---|---|---|
| Biblioteca de mapas (todos os mapas guardados) | ✅ ok | [biblioteca-de-mapas.png](dados/biblioteca-de-mapas.png) |
| Exportar em Markdown (.md) | ✅ ok | [exportar-markdown.md](dados/exportar-markdown.md) |
| Exportar em OPML (para outros programas de mapas) | ✅ ok | [exportar-opml.opml](dados/exportar-opml.opml) |
| Exportar em PDF | ✅ ok | [exportar-pdf.pdf](dados/exportar-pdf.pdf) |
| Exportar em Word (.docx) | ✅ ok | [exportar-word.docx](dados/exportar-word.docx) |
| Abrir e salvar no formato do Mindomo (.mom) sem perder dados | ✅ ok | [mindomo-mom.txt](dados/mindomo-mom.txt) |
| Agenda de revisões e provas (.ics, para o calendário) | ✅ ok | [agenda-ics.ics](dados/agenda-ics.ics) · [agenda-ics-resumo.txt](dados/agenda-ics-resumo.txt) |
| Importar um mapa a partir de Markdown | ✅ ok | [importar-markdown.txt](dados/importar-markdown.txt) |
| Cópia de segurança em pacote (.mcpack) com a biblioteca | ✅ ok | [backup-pacote.txt](dados/backup-pacote.txt) |
| Sincronização com Google Drive ou pasta | ⚪ não testado | — |

## PDF, vídeo e navegador

| Funcionalidade | Status | Evidência |
|---|---|---|
| Leitor de PDF ao lado do mapa (criar tópico a partir de um trecho) | ✅ ok | [leitor-de-pdf.png](midias/leitor-de-pdf.png) |
| Player de vídeo para videoaulas (arquivo local ou YouTube) | ⚪ não testado | [player-de-video.png](midias/player-de-video.png) |
| Navegador web ao lado do mapa (questões e leis) | ✅ ok | [navegador-web.png](midias/navegador-web.png) |

## Tablet

| Funcionalidade | Status | Evidência |
|---|---|---|
| Tela inicial em formato de tablet (retrato) | ✅ ok | [tela-inicial-retrato.png](tablet/tela-inicial-retrato.png) |
