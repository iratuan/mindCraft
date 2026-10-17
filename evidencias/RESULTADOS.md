# Resultados dos testes

Executados de verdade em 16/10/2026, 20:14 (Windows 11, Electron 44, Node 24). Logs completos em `logs/`.

| Suíte | Comando | Resultado |
|---|---|---|
| Unitários + CLI (núcleo em Node puro) | `npm test` | 112 testes, 112 passaram, 0 falhas |
| Ponta a ponta — editor, arquivos, exportação | `electron test/e2e.js` | 21/21 passaram |
| Ponta a ponta — estudo, lote, autosave, clipboard | `electron test/e2e-study.js` | 18/18 passaram |
| Ponta a ponta — rede de conhecimento, vault, Obsidian | `electron test/e2e-network.js` | 13/13 passaram |
| Ponta a ponta — assistente de estudo (CSV da IA, agenda, pontos fracos, Alt+setas, backups, reabrir, cronômetro, log de erros) | `electron test/e2e-assistant.js` (React) e `--classic` | 12/12 + 12/12 passaram |
| Ponta a ponta — notas em Markdown e relações como conexões | `electron test/e2e-notes.js` | 11/11 passaram |
| Ponta a ponta — biblioteca SQLite integrada ao app | `electron test/e2e-library.js` (React) e `--classic` | 15/15 + 15/15 passaram |
| **QA por funcionalidade, com entrada REAL** (mouse/teclado via Chromium) | `npm run qa` | **75 de 75 funcionalidades OK**, 0 erros de console, ~105 capturas em `qa/` |

- `qa/RELATORIO-QA.md`: tabela com a funcionalidade, como foi exercitada, o resultado e a(s) captura(s) de cada uma (Mapa 22 · Lote 4 · Arquivos 5 · Estudos 12 · Rede 13 · Dados 2 · Extremos 4).
- `telas/`: 23 telas de apresentação do produto (dados de um concurso fictício) · `exemplos/`: PDF, Word, relatório e vault do Obsidian gerados de verdade.
- Desempenho medido: mapa de 1 001 tópicos desenhado em ~20 ms (render síncrono; a pintura do navegador vem depois).

### Observação sobre estabilidade
O caso "zoom do grafo pela roda" do QA, que usa entrada simulada do sistema, oscilou em ~1 de cada 3–4 rodadas completas e passa 3/3 isolado. Não foi reproduzido como defeito do app (o diagnóstico fica ligado no teste para capturar o estado quando acontecer).

## O que o QA com entrada real descobriu (todos corrigidos)
1. **Duplo clique para editar não funcionava**: o `mousedown` recria o DOM do mapa, então o navegador nunca emitia `dblclick`. Agora é detectado pelo contador de cliques (mapa e grafo).
2. **Novo tópico podia ficar fora da tela**, com o editor digitando às cegas → o mapa agora rola até o tópico novo (Tab, Enter, setas, colar).
3. **Painéis laterais empilhados deixavam Notas/Conexões/Estrutura abaixo da dobra** → viraram **abas** (Estilo · Estudo · Notas · Conexões · Estrutura).
4. **Tópicos sublinhados quase não tinham área clicável** → área de acerto do tamanho da caixa.
5. **Decorações (✎, ↻, contadores) roubavam cliques do tópico vizinho** → ficam insensíveis ao mouse.
6. **Mapa de 1 000 tópicos: Ajustar caía para 3 % (ilegível)** → seletor **Níveis** (recolher/expandir por profundidade, 1 desfazer), zoom mínimo no Ajustar e abertura já recolhida de editais grandes.
7. **Editor inline cortava a primeira linha** e depois ficava estreito demais → cresce e alarga, e fica dentro da área visível.
8. **Indicador de nota era um glifo de fonte quase invisível** → ícone vetorial.
9. **Links `[[ ]]` apareciam crus no Word e no PDF** → viram texto normal (o Markdown/Obsidian mantém os colchetes).
10. **Autocompletar `[[` abria longe do cursor e cortado** → abre junto ao cursor.
11. **Janela pequena: abas colidiam** → painel e abas responsivos.
12. **Script de evidências apagava `qa/` e `logs/`** → agora só limpa o que ele mesmo gera.

## Não testado / fora do alcance
- macOS e Linux (CI escrito, nunca executado); assinatura de código; atualização automática.
- Caixas de diálogo nativas (abrir/salvar/escolher pasta/confirmar fechar) — simuladas.
- Atalhos do menu nativo pela tecla física (testados pelo clique no item de menu).
- Abrir de fato o Obsidian (`MINDCRAFT_NO_LAUNCH=1` nos testes; só a URL é verificada).
- Leitores de tela e acessibilidade; telas de alta densidade (HiDPI) e múltiplos monitores.

## Rodada "assistente de estudo" (CSV da IA e revisão como concurseiro)
- **Importar CSV de edital (IA)**: modelo + instruções prontas para colar numa IA; prévia com contagens, **erros por linha** e avisos antes de criar; novo mapa ou adicionar sob o tópico selecionado; planilhas do Excel (ANSI, `;`) aceitas; mapas grandes abrem recolhidos automaticamente (`autoLevels`).
- Bugs de QA desta rodada: botões do painel de estudos ficaram abaixo da dobra (o teste agora rola até eles); o teste de instruções copiadas compara com a área de transferência só quando o SO a permite.
- **Não testado**: IA real gerando o CSV; macOS/Linux; diálogos nativos de arquivo; Obsidian real; leitores de tela.

## Planilha de planejamento
- Núcleo (`core/planner.js`): 15 testes unitários — ida e volta sem editar = nenhuma mudança; edição de título/peso/progresso/notas/revisão/prova com 1 desfazer; tempo/questões idempotentes; "revisou hoje"; células em branco; datas/vírgula/ANSI do Excel; proteção contra fórmulas (= + - @); tópicos novos sem duplicar; planilha de outro mapa/lixo; tudo-ou-nada.
- Interface: e2e (exportar, editar fora do app, prévia sem alterar o mapa, aplicar, desfazer, reimportar, planilha de outro mapa, exportar só uma disciplina) e QA com cliques reais e capturas (`qa/30_*`).
- **Limitação do teste**: o atalho Ctrl+Z enviado como entrada simulada falhou em 1 das rodadas completas (passa isolado; o atalho é tratado pelo menu nativo e não deu para reproduzir fora da bateria longa). O QA usa o botão Desfazer. Não foi verificado em um Excel real (só CSVs gerados como o Excel os grava).

## Notas em Markdown e relações na rede
- Núcleo `core/markdown.js` (renderizador próprio, sem biblioteca): 8 testes unitários, incluindo segurança (script, atributos de evento, `javascript:`, imagens), robustez (texto de 4 000 blocos < 3 s, entradas quebradas) e coerência entre o HTML e a alternância de tarefas.
- Relações: 5 testes unitários (conexão de saída/entrada, vizinhança, desfazer, Obsidian, Word limpo) + e2e (Conexões nos dois tópicos, junção com `[[link]]`, exclusão) + QA com cliques reais (`qa/13_*`, `qa/14_*`).
- **Correção de erro de descrição**: eu havia dito que a relação desenhada ainda não aparecia em Conexões; já aparecia (marcada como "seta"). Agora mostra o rótulo e junta com o `[[link]]` do mesmo par.
- Achado do QA: o caso antigo "Notas do tópico" digitava sem a aba Notas aberta (passava por acaso); agora abre a aba por clique real.
- **Não testado**: editor WYSIWYG (não implementado de propósito: reescreveria o texto das notas); abrir links http no navegador de verdade (testado só o pedido ao sistema, que em teste não abre nada); Word/PDF com tabelas Markdown são convertidos em texto com barras.

## Biblioteca SQLite integrada ao aplicativo (etapa 2)
- 15 testes ponta a ponta: banco só criado quando usado; padrão continua arquivo; salvar sem diálogo + releitura; regravar sem duplicar; **mover arquivo para a biblioteca sem alterar o original (hash e data conferidos)**; janela; confirmação de descarte; versões; lixeira (mapa aberto protegido, exclusão definitiva com confirmação); importar pasta/arquivo; pacote portátil (idêntico em outra biblioteca, adulterado recusado); backup; busca; rascunho com vínculo; reabrir último e fallback; rede entre mapas da biblioteca; **banco danificado não derruba o app nem é apagado**.
- Unitários: +1 (verificação na gravação, banco danificado, exclusão definitiva). QA com cliques reais e Ctrl+S real: `qa/69_*`.
- Achados dos testes: comparação de mapas precisava ignorar datas que o .mom renova; o rascunho exige simular reinício com `draftExists=false`.
- **Não testado**: biblioteca com milhares de mapas; uso simultâneo do banco pelo app e pela linha de comando; macOS/Linux; migração dos seus .mom reais (rode `bin/mindcraft-library.js migrar` ou use "Importar pasta de .mom…" na janela).

## Etapa 3 — interface React (primeiras fatias)
- Telas em React: Biblioteca, Versões, Importar CSV, Planilha de planejamento. **A mesma bateria de testes roda na interface clássica e na React** (e2e-library e e2e-assistant, com asserção de qual interface está ativa); o QA completo (75/75, entrada real) roda com a React.
- Achados: o teste de "copiar instruções" lia a mensagem antes da cópia terminar (condição de corrida; agora espera); copiar para a área de transferência passou a mostrar erro claro se o sistema recusar.
- **Não testado**: Linux/macOS; CI nunca executado (workflow atualizado para Node 24 e build do pacote React).

## Etapa 3 (continuação) — painel de estudos e painéis laterais em React
- Em React agora: Painel de estudos (#dash), Conexões (#linksBody) e Estrutura (#outline). Mesmas classes/ids; a lógica de dados continua no código existente (modelo de linhas/links) e o React cuida só da apresentação.
- Suítes rodadas nas DUAS interfaces (React e `--classic`): e2e do editor 21+21, estudo 19+19, rede 15+15, assistente 12+12, biblioteca 15+15; notas 11; QA com entrada real 75/75 (usa React). Cada suíte confere qual interface desenhou (`data-ui`).
- **Erro real encontrado pelos testes e corrigido**: sair da apresentação em menos de 150 ms gerava um erro (`presentStep` rodava com a apresentação já encerrada).
- Fica de fora de propósito: editor SVG, grafo e painéis Estilo/Estudo/Notas (ver README).
- **Não testado**: Linux/macOS; CI (nunca executado).

## Rodada "excelente auxiliar de estudos" — leitor de PDF, revisão do dia, agenda .ics, atalhos
- **Resultados**: unitários 122/122 (+10: referências de PDF no .mom/biblioteca/Obsidian, .ics); e2e do leitor 11/11 (PDF real gerado com pdfkit: texto selecionável, tópico/nota com página e destaque, 1 desfazer, fontes no painel Notas, relink, salvar/reabrir, PDF inválido/sem texto/ausente, 60 páginas com desenho só das páginas próximas, divisor arrastável); revisão/.ics/atalhos 7/7; demais suítes inalteradas (nas duas interfaces); **QA com entrada real 77/77** (duplo clique real numa palavra do PDF → ＋ Tópico; capturas `qa/70_*`, `qa/71_*`), 0 erros de console.
- **Erros reais achados pelos testes e corrigidos**: a "Revisão do dia" lia `map.find()` como se devolvesse o nó (devolve {node,parent}) e mostrava "sem anotações"; barra de seleção do PDF some ao rolar (comportamento correto) — os testes agora esperam a rolagem assentar.
- **Não testado**: PDFs muito grandes (centenas de MB) e PDFs digitalizados com OCR; leitura em Linux/macOS; PDF de outra codificação de fontes exótica; abrir o .ics num calendário real (só o formato foi validado).

## Rodada "caça a bugs" + caderno de erros e metas semanais
- **Resultados**: unitários 136/136 (inclui 7 de fuzz: 40 sementes × 120 operações = 4 800 passos no modelo, texto hostil ×3 000, importações com lixo, referências/.ics, pacotes de biblioteca aleatórios, mapa de 3 000 tópicos, .mom adulterado); e2e todas as suítes passaram (editor, estudo, rede, assistente, biblioteca, notas nas duas interfaces + PDF 11, revisão 7, **erros e metas 9**, **desempenho 5**, **macaco 4**); QA com entrada real **78/78**, 0 erros de console. Varreduras longas do macaco: 6×250, 20×300 e 12×300 (com as novas ações) — todas verdes no final.
- **Bugs reais achados (e corrigidos, com teste de regressão)**: (1) **o .mom alterava o texto do usuário** ao reabrir (tags como `<br>` em títulos/notas eram "limpas"; instável a cada ciclo) — agora só arquivos do Mindomo sofrem a limpeza (marca `mcWriter`); (2) **seleção apontando para tópico inexistente** após desfazer/refazer; (3) **tópico selecionado escondido por um ramo recolhido** causava erro (`reading 'w'`) ao criar filho/editar/navegar — agora a seleção vai para o ancestral visível; (4) ao sair da **apresentação** o editor ficava ~100 ms sem tópicos clicáveis (e o 1º passo agendado podia rodar já encerrado); (5) o teste da Revisão do dia expôs que `map.find()` devolve {node,parent}.
- **Desempenho (3 000 tópicos, interface real)**: ~108 ms por seleção, painel de estudos ~100 ms, Estrutura (React) ~170 ms, desfazer+refazer ~200 ms, salvar .mom ~140 ms, guardar na biblioteca com verificação ~180 ms, abrir ~270 ms.
- **Não testado**: Linux/macOS; PDFs gigantes/escaneados; uso simultâneo do banco por duas instâncias; CI.

## Rodada "tela inicial + simulados"
- **Resultados**: unitários 141/141 (+5 simulados); e2e todas as suítes verdes (18 execuções): **tela inicial 11/11**, **simulados 8/8**, erros/metas 9, desempenho 5, macaco 4, leitor de PDF 11, revisão 7 e as demais nas duas interfaces; QA com entrada real **80/80**; macaco longo (12 × 300 ações, com início, simulado e arrastar arquivo) verde.
- **Achados dos testes**: (1) o modal de simulado quebrava ao digitar (a linha de cabeçalho da tabela entrava na leitura dos campos → React desmontava a janela); (2) o `e2e.js` original não usava o harness e a tela inicial passou a cobrir o mapa (corrigido forçando o início em branco nos testes por IPC — variável de ambiente não chega ao processo da janela); (3) um caso do QA que falha deixava o grafo/painel abertos e derrubava os seguintes (agora cada falha fecha as sobreposições). Continua intermitente (já conhecido): "Grafo: arrastar nó e dar zoom com a roda" no QA completo (passa isolado).
- **Segurança**: soltar um arquivo na janela (ou clicar num link) não navega mais a janela para outra página (`will-navigate` bloqueado) — antes isso podia perder o trabalho aberto.
- **Não testado**: soltar arquivo pelo gerenciador do Windows (testei a lógica e os eventos de arrastar/soltar, não o gesto do SO); Linux/macOS; CI.

## Rodada de testes e melhorias (robustez, layout e teclado)
- **Resultados**: unitários 141/141 (e também nos fusos UTC, São Paulo, Auckland, Kolkata, Kiritimati e St. John's — inclusive a virada de horário de verão); e2e: **22 suítes verdes** (novas: texto hostil 7, falhas injetadas 7, layout 4, acessibilidade 11; desempenho agora com 300 mapas na biblioteca 6); QA com entrada real **81 casos** (inclui Tab/Shift+Tab/Delete/Esc reais nas janelas); macaco longo verde.
- **Bug real e sério corrigido**: com uma janela aberta (biblioteca, simulado, CSV…) ou a tela inicial, **Tab criava tópicos no mapa de baixo e Delete/Backspace podiam apagar o selecionado** quando o foco estava num botão. Agora o teclado pertence a quem está na frente (teste de regressão verificado por mutação: falha sem a correção, passa com ela).
- **Melhorias**: janelas pequenas (painel de estudos em 1 coluna sem rolagem horizontal; leitor de PDF não espreme o mapa em janelas < 900 px); janelas com papel de diálogo, rótulo, foco inicial, Tab preso e foco devolvido; tela inicial com foco no atalho principal; tabela de simulado com mais altura em telas baixas.
- **Verificado e sem defeitos**: nenhum texto hostil vira elemento/script em nenhuma tela (mapa, painéis, grafo, revisão, simulados, erros, tela inicial, biblioteca, leitor, prévias de CSV/planilha, erros); falhas de disco/arquivo/banco não perdem o que está na tela (rascunho, "não salvo", sem arquivo temporário sobrando; banco travado espera 5 s e avisa); desempenho com 300 mapas (tela inicial ~60 ms, janela ~50 ms, busca ~8 ms, pacote ~230 ms).
- **Não testado**: leitor de tela real (NVDA/Narrador) — só rótulos, foco e papéis; Linux/macOS; CI.

## Profundidade dos tópicos (subtópicos dentro de subtópicos)
- **Sondagem**: corrente de 100 a 5000 níveis em 13 módulos. Até 1000 tudo funcionava; com 2000 a biblioteca estourava a pilha; com 5000 quase tudo falhava. Duplicar ramo era quadrático (770 ms em 1000 níveis, 4,9 s em 2000).
- **Correções**: limite de **100 níveis** ao criar/mover/colar (aviso claro, lote revertido, sem entrada no histórico); duplicar agora é linear (770 ms → 5 ms); **.mom com mais de 500 níveis agora é recusado em vez de cortado em silêncio** (risco real de perda de dados ao salvar por cima); na Estrutura, níveis fundos ficavam **invisíveis** (recuo sem limite) — agora recuo limitado e selo com o nível; o aviso do limite era apagado pela barra de status e foi corrigido.
- **Testes**: unitários 155/155 (+14 de profundidade: limite exato, irmão no último nível, mover/colar que estourariam, desfazer/refazer, .mom, biblioteca, rede, estudo, exportações Markdown/OPML, layout/SVG, árvore larga de 3000 tópicos); e2e de profundidade 12/12 nos dois modos (100 níveis só com Tab, nível 101 barrado, Estrutura, rede com relação topo↔fundo, níveis 1–4/tudo, recolher no meio, colar barrado, arquivo fundo recusado, biblioteca); QA 81/81; todas as 24 execuções e2e verdes. Capturas em `evidencias/profundidade/`.
- **Não testado**: mapas com milhares de níveis criados à mão (o limite impede), desempenho do desenho do mapa com mais de ~20 mil tópicos.

## Questões por banca/ano, erros para refazer e configurações no pacote
- **Novo**: banca e ano em cada registro de questões e de erros; acerto por banca e por ano (painel, relatório .md, biblioteca inteira); erros "para refazer" (✔ acertei / ✖ errei de novo / ↶ desfazer) com filtros; aviso na tela inicial; **configurações portáteis dentro do .mcpack** (SHA-256; só preferências, nunca caminhos) restauradas ao importar.
- **Biblioteca**: esquema v2 (tabelas derivadas `qsrc` e `qerr`); bancos antigos migram sozinhos, com cópia de segurança antes e preenchimento a partir dos mapas já guardados (testado).
- **Testes**: unitários 170/170 (+15: limpeza/validação, soma por dia+banca+ano, limites, normalização, fuzz com semente fixa, resumo, relatório, biblioteca, migração v1→v2, pacote com configurações adulteradas/hostis/antigo); e2e de questões 11/11 (React) e 8/8 (clássico); todas as 26 execuções e2e verdes; QA com entrada real 82/82 sem erros de console; macaco verde. Capturas em `evidencias/questoes/`.
- **Corrigido no caminho**: botão novo de "refazer" colidia com o seletor do botão apagar (teste pegou); importar pacote grava `startScreen` explicitamente (o teste antigo gravava só o campo legado).
- **Não testado**: restauração entre dois computadores reais (só entre duas bibliotecas na mesma máquina); pacotes com milhares de mapas e configurações; Linux/macOS.

## Relatório .docx completo
- O .docx agora traz **Simulados** (média, melhor, último, tabela e disciplinas mais fracas), **Questões por banca e ano** e a situação/origem dos erros — igual ao .md (antes só o .md tinha).
- Teste unitário novo (171/171 no total): falha sem a mudança e passa com ela; sem dados não aparecem as seções extras; banca hostil é escapada no XML. e2e de estudo (19/19), erros (9/9) e simulados (8/8) seguem verdes.
- Não testado: abrir o .docx no Word/LibreOffice (conferi só o XML interno).
