# PROMPT MESTRE — Revisão Abrangente de UX, Ergonomia e Funcionalidades do Sistema

> **Como usar este prompt:**  
> Copie e cole as instruções abaixo para um agente de IA (ou adote como guia de execução em sprints de produto) para realizar uma auditoria completa, diagnóstico de usabilidade e implementação de melhorias de UX/UI e ergonomia no ecossistema **MindCraft**.

---

```markdown
# PROMPT DE AUDITORIA E REFINAMENTO DE UX E FUNCIONALIDADES — MINDCRAFT

## 1. Papel e Especialidade Requerida

Atue como um **Engenheiro de Software Sênior, Arquiteto de UX/UI e Especialista em Ergonomia Cognitiva e Design de Interação**, com vasta experiência em produtos de alto desempenho, ferramentas de produtividade para aprendizado profundo (*Deep Work*) e aplicativos híbridos multiplataforma (Desktop Windows e Tablet Android).

Sua missão é realizar uma **revisão exaustiva, diagnóstico heurístico e implementação prática de melhorias de UX (Experiência do Usuário), UI (Interface Visual), Ergonomia e Usabilidade Funcional** em todo o sistema MindCraft, preservando rigorosamente a estabilidade arquitetural e a suíte de testes existente.

**IMPORTANTE: Não recrie o aplicativo do zero.** Trabalhe sobre a base de código existente, refinando componentes, polindo interações, eliminando atritos cognitivos e elevando o nível de acabamento estético e operacional do produto.

---

## 2. Contexto do Produto e Plataformas

O **MindCraft** é um ecossistema integrado para concurseiros e estudantes de alto rendimento, construído sobre:
- **Núcleo de Domínio:** Mapas Mentais (árvore hierárquica, tópicos, conexões e relações) e Rede de Conhecimento (grafo não linear com links bidirecionais `[[ ]]`).
- **Bancada de Estudos Multimídia:** Sistema multi-abas com Leitor de PDF, Player de Vídeo (local e YouTube), Navegador Web integrado e Launchpad de materiais.
- **Painel de Desempenho e Retenção:** Dashboard de metas e cronograma de concurso, Caderno de Erros analítico e Fila de Revisão Espaçada (SRS).
- **Ambientes de Execução:**
  1. **Windows 11 Desktop (Electron):** Focado em teclado/mouse, densidade de informação, atalhos de alta produtividade e múltiplos monitores/janelas.
  2. **Tablet Android (Samsung Galaxy Tab / Capacitor):** Focado em toque/caneta stylus, alvos mínimos de 44x44px, zonas seguras contra gestos do sistema, suporte a teclado virtual e visualização fluida.

---

## 3. Diretrizes de Auditoria Heurística e UX

Analise e audite cada tela, componente e fluxo com base nas **10 Heurísticas de Usabilidade de Nielsen** adaptadas ao contexto de estudos e mapas mentais:

### 3.1 Visibilidade do Status do Sistema (Feedback Imediato)
- O usuário sempre sabe se um mapa está aberto, qual nó está selecionado e se há alterações não salvas (`dirtyDot`)?
- Ao salvar, alternar abas, avançar slides na apresentação ou registrar questões, o feedback visual é perceptível e tranquilizador, sem ser invasivo?
- O carregamento de PDFs pesados ou páginas web fornece indicação de progresso clara?

### 3.2 Correspondência entre o Sistema e o Mundo Real
- A terminologia é natural para estudantes e concurseiros (disciplina, banca, ciclo de revisão, acertos/erros, peso, edital)?
- Ícones e representações visuais refletem claramente suas funções (ex.: grafo para conexões, livro/documento para PDF, player para vídeo, alvo para metas)?

### 3.3 Controle e Liberdade do Usuário
- O cancelamento ou saída de qualquer estado transitório é imediato e seguro (tecla `Esc`, botão `✕ Fechar`, toque fora de modais)?
- No modo de apresentação, o usuário consegue sair a qualquer momento sem perder o foco ou zoom original do mapa?
- No leitor de PDF e no navegador, o fechamento ou troca de aba nunca destrói anotações ou posição de leitura sem aviso?

### 3.4 Consistência e Padrões (Design System & Design Tokens)
- A paleta de cores respeita os modos Claro e Escuro com contraste acessível (WCAG AA no mínimo, taxa >= 4.5:1 para texto regular)?
- O padrão de abas da Bancada de Estudos segue a mesma linguagem visual das abas do Painel Lateral?
- Botões primários, secundários, ícones de ação e menus suspensos possuem pesos, raios de borda e microanimações coesos?

### 3.5 Prevenção de Erros
- Ações destrutivas (excluir nós com subárvores, fechar mapa com dados não salvos, limpar histórico) possuem salvaguarda ou atalho imediato de Desfazer (`Ctrl+Z`)?
- No editor, cliques acidentais fora do nó não devem apagar seleções complexas sem necessidade?
- URLs malformatadas no navegador embutido devem ser tratadas sem quebrar a interface?

### 3.6 Reconhecimento em vez de Memorização
- O usuário precisa memorizar atalhos de teclado ou a interface oferece dicas visuais contextuais (tooltips descritivos, barra de atalhos rápidos)?
- Na seleção de um nó, os botões relevantes (estilo, nota, link, marcador) ganham destaque enquanto ações irrelevantes retrocedem?

### 3.7 Flexibilidade e Eficiência de Uso
- Usuários novatos conseguem navegar clicando e tocando intuitivamente; usuários avançados conseguem operar 100% via teclado (`Tab`, `Enter`, `F2`, `F5`, `Ctrl+F`, `Ctrl+G`, `Ctrl+Shift+M`)?
- O tablet suporta gestos intuitivos (pinça para zoom, arrasto suave, toque duplo para editar)?

### 3.8 Estética Minimalista e Redução de Carga Cognitiva
- A interface promove o estado de **fluxo de estudo** eliminando ruídos visuais e menus poluídos?
- Informações densas (ex.: estatísticas do dashboard, caderno de erros) estão organizadas em cartões legíveis com hierarquia tipográfica clara?

### 3.9 Diagnóstico e Recuperação de Falhas
- Erros de carregamento de páginas web (ex.: bloqueio por CSP / `X-Frame-Options`) apresentam botão evidente de fallback (`↗ Abrir no navegador externo`)?
- Mensagens de erro são construtivas, em português claro, explicando o motivo e como contornar o problema?

### 3.10 Ajuda e Documentação Contextual
- Há botões discretos de "Como funciona?" ou atalhos para a documentação e modal de atalhos (`F1` ou botão dedicado)?

---

## 4. Escopo Funcional Específico para Revisão e Refinamento

Você deve examinar, auditar e propor melhorias para as seguintes áreas funcionais do código:

### Módulo A — Editor de Mapas Mentais (`renderer/renderer.js`, `core/layout.js`, `core/model.js`)
1. **Ergonomia do Desenho e Canvas:**
   - Suavidade do zoom e panorâmica (*pan/zoom*).
   - Legibilidade das fontes nos nós em níveis de zoom reduzidos.
   - Espaçamento de ramos e clareza das curvas Bézier orgânicas.
   - Relações entre tópicos não hierárquicos: legibilidade das setas e rótulos.
2. **Edição e Seleção:**
   - Criação fluida de filhos (`Tab`) e irmãos (`Enter`).
   - Edição de texto em linha sem saltos ou desalinhamento do cursor.
   - Seleção múltipla por caixa delimitadora (*marquee*).
   - Indicadores visuais nos nós: selo de revisão SRS, indicador de nota existente, marcadores numéricos/prioridade.

### Módulo B — Modo de Apresentação (`renderer/present-ui.js`, `renderer/style.css`)
1. **Barra Flutuante HUD:**
   - Posicionamento ergonômico no rodapé da tela, sem cobrir o nó focado.
   - Acessibilidade visual dos botões Anterior / Próximo e botão de saída.
   - Contador de slides com título legível do nó ativo.
   - Transição suave de câmera (*easing*) entre tópicos focados.
   - Teclas de atalho funcionais: `Espaço`, `Shift+Espaço`, `Setas`, `Esc`.

### Módulo C — Bancada de Estudos Integrada (`renderer/react/MediaPane.jsx`, `renderer/react/PdfViewer.jsx`, `renderer/react/VideoViewer.jsx`, `renderer/react/BrowserViewer.jsx`)
1. **Launchpad (Estado Vazio Convidativo):**
   - Apresentação acolhedora com cartões para Adicionar PDF, Vídeo ou Link.
   - Listagem clara de materiais já vinculados ao mapa ativo.
2. **Leitor de PDF:**
   - Barra de navegação: número de página, zoom (`+`, `-`, ajustar largura).
   - Ação rápida para selecionar texto e criar tópico filho ou anotação no mapa mental.
3. **Player de Vídeo:**
   - Suporte transparente a arquivos locais e URLs do YouTube.
   - Controle de velocidade (1.0x, 1.25x, 1.5x, 2.0x).
   - Botão para capturar carimbo de tempo (*timestamp*) e vincular ao tópico selecionado.
4. **Navegador Web Embutido:**
   - Barra de navegação com sanitização de URL, recarregar e favoritos úteis (Planalto, QConcursos, Dizer o Direito).
   - Tratamento proativo de bloqueios CSP/iFrame com banner de fallback e botão `↗ Abrir fora`.
   - Atalho para transformar título da página em nó de estudo.
5. **Comportamento Multi-Abas:**
   - Alternância instantânea de abas preservando a rolagem do PDF, o tempo do vídeo e o histórico da página web.
   - Botão de fechar aba (`✕`) com alvo de toque adequado e sem fechamento acidental.
   - Divisor arrastável (*split*) com memória de largura preferida.

### Módulo D — Rede de Conhecimento / Grafo (`renderer/graph-ui.js`, `core/graph.js`)
1. **Visualização Não Linear:**
   - Distribuição de forças do grafo sem sobreposição caótica de nós.
   - Diferenciação visual entre nós do mapa ativo, nós de outros mapas e nós fantasmas (*unresolved links*).
   - Controles de densidade, profundidade de saltos (1, 2, 3) e busca com realce em tempo real.
   - Abertura de mapa ou nó ao clicar com duplo clique ou toque sustentado.

### Módulo E — Painel de Estudos, Metas e SRS (`renderer/study-ui.js`, `renderer/react/StudyDash.jsx`, `renderer/react/ReviewQueue.jsx`)
1. **Dashboard do Concurseiro:**
   - Cartão de contagem regressiva para a prova com indicação de urgência.
   - Métricas de horas líquidas e taxa de acertos por matéria com gráficos de progresso intuitivos.
2. **Caderno de Erros & Fila de Revisão:**
   - Registro rápido de acerto/erro vinculado ao nó, disciplina, banca examinadora e ano.
   - Fila de repetição espaçada exibindo revisões para Hoje, Amanhã e Próximos 7 dias.

### Módulo F — Barra de Aplicativo e Ações Globais (`renderer/context-ui.js`, `renderer/index.html`)
1. **Gerenciamento de Contexto:**
   - Botão Fechar Mapa (`closeMapBtn` / `Ctrl+Shift+M`) evidente, retornando à Tela Inicial sem travar o estado.
   - Botão Apresentar (`[data-act="present"]`) reativo: habilitado apenas quando houver mapa com tópicos carregado.
   - Alternância de tema Claro/Escuro suave e consistente em todos os componentes React e SVG.

---

## 5. Roteiro de Execução Recomendado (4 Etapas)

Execute a tarefa seguindo rigorosamente as quatro etapas abaixo:

### Etapa 1: Diagnóstico e Matriz de Gaps
- Percorra o código de cada módulo e as evidências visuais mais recentes (`docs/evidencias/`).
- Elabore uma **Matriz de Fricções de Usabilidade**, pontuando cada problema por Gravidade (Cosmético, Menor, Maior, Crítico) e Impacto no Usuário.
- Apresente um plano sucinto das intervenções propostas antes de editar o código.

### Etapa 2: Refinamento de Design Tokens e Estilos
- Padronize cores, tipografia, espaçamentos e raios no `renderer/style.css` e estilos React.
- Assegure que os alvos de clique no tablet atendam à norma de acessibilidade (mínimo de 44x44px).
- Ajuste contrastes, sombras sutis e estados `:hover`, `:active`, `:focus-visible`.

### Etapa 3: Implementação Cirúrgica das Melhorias Funcionais
- Aplique as correções funcionais e melhorias de UX nos componentes alvo.
- Respeite o orçamento arquitetural estrito:
  - `core/`: máximo 600 linhas por arquivo.
  - `renderer/`: máximo 1000 linhas por arquivo.
  - `renderer/react/`: máximo 500 linhas por arquivo.
  - `tools/`: máximo 300 linhas por arquivo.
- Mantenha a separação rígida entre lógica pura (`core/`) e interface (`renderer/`).

### Etapa 4: Validação, Testes e Evidências
- Execute a suíte de testes: `npm run check`. **Todos os testes devem passar sem nenhuma falha.**
- Reconstrua os pacotes web e sincronize com a versão tablet: `npm run build:ui` e `cd tablet && npm run sync`.
- Execute a rodada de validação visual e registre o comparativo de evolução.

---

## 6. Critérios de Sucesso e Não Regressão

Sua entrega só será considerada concluída se atender a todos os critérios abaixo:
1. **Zero Regressão:** 100% dos testes existentes aprovados em `npm run check`.
2. **Compatibilidade Multiplataforma:** O app funciona e apresenta excelente usabilidade tanto no Desktop (Electron) quanto no Tablet Android (Capacitor).
3. **Preservação de Dados:** Arquivos `.mom`, bancos SQLite de biblioteca e histórico de estudos não sofrem corrupção ou perda de dados.
4. **Acabamento Profissional:** Ausência de quebras de layout, textos cortados, botões sem rótulo acessível ou comportamentos erráticos.
5. **Documentação e Código Limpo:** Código bem comentado, livre de resíduos de depuração (`console.log`, `debugger`), seguindo o padrão arquitetural do projeto.
```
