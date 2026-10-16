# MindCraft

Editor de mapas mentais **e gerenciador de estudos** (concursos e provas) para Windows, macOS e Linux, em Node/Electron.
Compatível com arquivos `.mom`. Código próprio — só o formato de arquivo é compatível com o Mindomo.

## Uso
```
npm install
npm start                  # editor
npm test                   # 48 testes unitários (núcleo em Node puro + CLI)
npm run e2e                # 52 cenários ponta a ponta no Electron real (no Linux: xvfb-run -a npm run e2e)
npm run qa                 # QA por funcionalidade com ENTRADA REAL (62 casos, ~80 capturas em evidencias/qa/)
npm run evidence           # regenera a pasta evidencias/ (telas + exemplos)
npm run dist               # instalador do SO atual em dist/ (NSIS / DMG / AppImage)
node bin/mindcraft.js mapa.mom saida.pdf --theme dark --outline
```
CLI: entrada `.mom | .md | .opml`; saída `.pdf | .docx | .svg | .md | .opml | .mom`.

## Gestão de estudos
- **Edital → mapa:** cole o conteúdo programático (numeração `1`, `1.1`, itens `a)`, disciplinas em MAIÚSCULAS, linhas quebradas do PDF) ou use o **modelo de concurso**.
- **Revisão espaçada** (1 → 7 → 15 → 30 → 60 → 120 dias): "Estudei hoje", "Errei" reinicia o ciclo; idempotente no mesmo dia.
- **Por tópico:** peso (1–5), progresso, cronômetro/minutos, questões (feitas/acertos), próxima revisão. Valem para vários tópicos selecionados.
- **Selos no mapa:** ↻ revisão vencida (somados em ramos recolhidos) e progresso agregado dos tópicos-pai (ponderado pelo peso).
- **Painel de estudos (Ctrl+E):** contagem regressiva da prova, progresso geral e por disciplina, tempo hoje/7 dias, sequência, acerto em questões, plano (tópicos/dia), fila de revisões com ✓/↻ rápidos.
- **Relatório** `.md` / `.docx` com os mesmos números do painel.

### Importar CSV de edital (gerado por IA)
Arquivo → **Importar CSV de edital (gerado por IA)…** (ou botão no Painel de estudos). Passos: (1) **Copiar instruções para a IA** e cole numa IA junto com o texto do edital; (2) salve a resposta como `.csv`; (3) **Escolher arquivo CSV** — a prévia mostra quantos tópicos entram, as linhas com problema e os avisos; (4) **Criar o mapa**.
Colunas: `concurso, data_prova, disciplina*, item, topico*, peso (1–5), notas, relacionados (separados por | ou ;), progresso (0–100), nivel` (* obrigatórias; ordem livre; vírgula, ponto e vírgula ou tab; UTF-8 ou ANSI do Excel). `item` (1, 1.1, 1.1.1) define a hierarquia; `relacionados` viram links `[[ ]]` e já semeiam a rede de conhecimento. Linhas inválidas são puladas e listadas; nada é gravado até você confirmar. **Salvar CSV de exemplo…** gera o modelo.

### Notas em Markdown
O painel **Notas** tem a barra de formatação (negrito Ctrl+B, itálico Ctrl+I, riscado, título, lista, numerada, tarefas, citação, código, `[[ ]]` Ctrl+K e link da internet) e dois modos: **Editar** (texto Markdown, com autocompletar de `[[`) e **Visualizar** (formatado: títulos, listas, **tarefas que você marca com um clique**, tabelas, código, citações; `[[links]]` abrem o tópico; links http(s) abrem no navegador). Duplo clique na visualização volta a editar. A nota continua sendo texto Markdown puro (compatível com Obsidian); no Word/PDF os símbolos viram texto limpo. HTML digitado na nota nunca é executado.

### Relações desenhadas na rede de conhecimento
A seta desenhada entre dois tópicos (tecla R) é uma conexão lógica: aparece no painel **Conexões** dos dois tópicos (com o rótulo; "seta · rótulo"), no grafo e na exportação para o Obsidian (`Relacionado: [[…]] (rótulo)`). Se existir também um `[[link]]` para o mesmo tópico, aparece uma linha só. Excluir a seta desfaz a conexão. Relações valem dentro do mesmo mapa; entre mapas use `[[Mapa#Tópico]]`.

### Planilha de planejamento (exportar → editar no Excel → importar)
Arquivo → **Planilha de planejamento…** (ou botão no Painel de estudos). **Salvar planilha…** gera um CSV (abre com duplo clique no Excel/Planilhas) do mapa inteiro ou só da disciplina selecionada, com uma linha por tópico. Edite: `topico` (renomeia), `peso` (1–5), `progresso` (0–100, só tópicos sem subtópicos), `proxima_revisao` (AAAA-MM-DD ou DD/MM/AAAA; `-` remove), `revisou_hoje` (sim / errei), `tempo_total_min`, `questoes_total`, `acertos_total`, `notas` e `data_prova` (linha da raiz). **Importar planilha editada…** mostra a prévia das mudanças, avisos e erros por linha; só ao clicar em **Aplicar mudanças** o mapa é alterado, numa única operação (Ctrl+Z desfaz tudo).
Regras de segurança: nunca apaga tópicos; célula em branco não altera nada; tempo e questões são *totais* — só a diferença para maior é somada a hoje (reimportar a mesma planilha não duplica; valores menores que o registrado são recusados); linhas sem `id` com `disciplina` + `topico` criam tópicos novos sob a disciplina (sem duplicar); planilha de outro mapa é recusada. Não altere a coluna `id`.

## Rede de conhecimento (estilo Obsidian)
- Escreva `[[Tópico]]`, `[[Mapa#Tópico]]` ou `[[Tópico|texto]]` no título/notas. **Autocompletar** ao digitar `[[`.
- Painel **Conexões**: links, **citado em** (retrolinks) e **menções sem link** (transforma em `[[link]]` com um clique). Link sem destino vira nó "fantasma" (dá para criar o tópico).
- **Grafo (Ctrl+G):** este mapa ou **vault** (pasta com vários `.mom`), cores por mapa, hierarquia opcional, só vizinhança, busca, arrastar nós, rótulos sem sobreposição.
- **Exportar para o Obsidian:** um `.md` por mapa com `[[Mapa#Tópico]]` resolvidos; **nunca sobrescreve** uma nota que não seja do MindCraft. "Abrir no Obsidian" usa o protocolo `obsidian://` (ou o executável instalado no Windows).

## Interface React (etapa 3 — migração por fatias)
A interface está migrando para **React 18**, uma tela por vez, sem reescrever tudo de uma vez. O código-fonte fica em `renderer/react/*.jsx` e é empacotado (esbuild) em `renderer/bundle/react-ui.js` — nada é baixado em tempo de execução. `npm start`, `npm run e2e`, `npm run qa` e `npm run dist` geram o pacote sozinhos (`npm run build:ui` gera à mão; a pasta `bundle/` não vai para o Git).
- **Já em React:** Biblioteca de mapas, Versões, Importar CSV de edital, Planilha de planejamento, **Painel de estudos** (cartões, agenda, pontos fracos, revisões) e os painéis **Conexões** e **Estrutura**.
- **Segurança da migração:** cada tela portada mantém os MESMOS ids/classes da versão clássica (que continua no código como reserva). Os testes rodam nas duas interfaces (`--classic`) e conferem qual está em uso. Para voltar à clássica sem recompilar: `reactUi: false` em `config.json`.
- **Fica como está, de propósito (por ora):** o editor do mapa e o grafo (motores SVG imperativos, compartilhados com a exportação PDF/Word/PNG/SVG — reescrevê-los em React traria risco sem ganho; a ideia é hospedá-los dentro de componentes React) e os painéis de formulário Estilo, Estudo e Notas (HTML estático ligado a atalhos e ao cronômetro; migrar junto com a casca do aplicativo, quando a versão clássica das telas já migradas puder ser removida).

## Biblioteca de mapas no aplicativo (etapa 2)
Menu **Arquivo → Biblioteca de mapas…** (Ctrl+Shift+B). Um mapa tem **uma casa**: um arquivo `.mom` **ou** a biblioteca.
- **Guardar este mapa na biblioteca** copia o mapa (o arquivo `.mom` de origem não é alterado). Depois, **Ctrl+S salva no banco** (gravação verificada: o app relê e compara; se falhar, nada muda e o mapa continua aberto). **Salvar como…** num mapa da biblioteca exporta uma cópia `.mom`.
- A janela lista os mapas (tópicos, revisões vencidas, prova), **abre**, mostra **versões** (abre uma versão como mapa novo; nunca sobrescreve), manda para a **lixeira** (restaurável; o mapa aberto não pode ser excluído), **exporta .mom**, **busca em todos os mapas**, importa **.mom / pasta de .mom / pacote .mcpack**, exporta **pacote** e faz **backup do banco**.
- Opção no Painel de estudos: **Salvar mapas novos na biblioteca** (desligada por padrão: sem ela nada muda no seu fluxo atual com arquivos).
- **Rede de conhecimento**: os mapas da biblioteca entram na rede (`[[Mapa#Tópico]]`, Conexões, grafo, Obsidian) e no "Em outros mapas" do painel de estudos. Um arquivo já migrado vale pela cópia da biblioteca.
- O reabrir-o-último, o rascunho de sessão (autosave) e o aviso ao fechar funcionam também para mapas da biblioteca. Se o banco estiver danificado, o app avisa e continua funcionando com arquivos; o arquivo ruim nunca é apagado.

## Biblioteca SQLite (etapa 1 da migração React + SQLite)
`core/library.js` guarda todos os mapas num banco SQLite (módulo nativo `node:sqlite`, sem compilar nada): tópicos, estudo, relações, tema e prova, com **versões** (até 30 por mapa), **lixeira** e consultas entre mapas (revisões vencidas, tempo e questões por dia, busca). O aplicativo atual ainda usa arquivos `.mom`; a biblioteca é a base da próxima etapa (interface em React).
Linha de comando (`bin/mindcraft-library.js`):
- `migrar <pasta> <biblioteca.db>` — importa todos os `.mom` (os originais nunca são alterados; cada mapa é relido do banco e comparado antes de valer; reexecutar não duplica).
- `listar <biblioteca.db>` · `backup <biblioteca.db> <copia.db>`.
- `exportar <biblioteca.db> <saida.mcpack>` — **pacote portátil** (um arquivo, com SHA-256 de cada mapa) para levar a outro computador.
- `importar <biblioteca.db> <pacote.mcpack> [--substituir | --ignorar]` — valida tudo antes de gravar; mapa igual é ignorado; mapa diferente com o mesmo id vira **cópia** (nunca sobrescreve em silêncio).

## Interface
- Painel lateral em **abas** (Estilo · Estudo · Notas · Conexões · Estrutura), um por vez; tema escuro/claro; barra de **Níveis** (recolher/expandir o mapa por profundidade — editais grandes abrem recolhidos).

## Edição e segurança dos dados
- Seleção múltipla (Ctrl/Shift+clique, retângulo com Shift, Ctrl+A), mover/formatar/excluir em lote com **um único desfazer**; copiar/recortar/colar tópicos (e colar texto/edital como ramos).
- **Autosave** com recuperação após queda; **arquivos recentes**; confirmação ao fechar com alterações; gravação atômica (arquivo temporário + renomear).
- `.mom` lido com validação defensiva (ids, estilos, ciclos, tamanho) — nada vindo do arquivo vai direto para o HTML.

## Estrutura
`core/` (Node puro: modelo, layout, temas, mom, import, export, estudo, edital, links, grafo, vault, obsidian, relatório) · `electron/` · `renderer/` · `test/` · `evidencias/`

## Documentos
- `evidencias/RESULTADOS.md` (resultados reais e bugs achados) · `evidencias/qa/RELATORIO-QA.md` (cada funcionalidade com captura) · `SUGESTOES.md` (próximos passos).

## Limitações conhecidas
- Do `.mom` do Mindomo importa estrutura, títulos e notas; ícones, anexos, tarefas e Gantt são ignorados (campos desconhecidos são preservados ao salvar). Marcadores, progresso, estudo, relações e estilos são extensões do MindCraft em campos próprios.
- PDF: fonte DejaVu (latim, grego, cirílico); sem CJK.
- Builds de macOS e Linux vêm do CI (`.github/workflows/build.yml`), ainda não executado; localmente só o Windows foi construído e testado.
- Instalador sem assinatura de código (SmartScreen/Gatekeeper mostrarão aviso).
- Diálogos nativos (abrir/salvar/escolher pasta/confirmar) são simulados nos testes; atalhos do menu nativo são testados pelo clique no item do menu, não pela tecla.
- O cronômetro não sobrevive a um fechamento do app (os minutos só são gravados ao parar).
