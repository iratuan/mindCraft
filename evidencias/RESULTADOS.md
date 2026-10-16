# Resultados dos testes

Executados de verdade em 16/10/2026, 15:16 (Windows 11, Electron 44, Node 24). Logs completos em `logs/`.

| Suíte | Comando | Resultado |
|---|---|---|
| Unitários + CLI (núcleo em Node puro) | `npm test` | 112 testes, 112 passaram, 0 falhas |
| Ponta a ponta — editor, arquivos, exportação | `electron test/e2e.js` | 21/21 passaram |
| Ponta a ponta — estudo, lote, autosave, clipboard | `electron test/e2e-study.js` | 18/18 passaram |
| Ponta a ponta — rede de conhecimento, vault, Obsidian | `electron test/e2e-network.js` | 13/13 passaram |
| Ponta a ponta — assistente de estudo (CSV da IA, agenda, pontos fracos, Alt+setas, backups, reabrir, cronômetro, log de erros) | `electron test/e2e-assistant.js` | 12/12 passaram |
| Ponta a ponta — notas em Markdown e relações como conexões | `electron test/e2e-notes.js` | 11/11 passaram |
| Ponta a ponta — biblioteca SQLite integrada ao app | `electron test/e2e-library.js` | 15/15 passaram |
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
