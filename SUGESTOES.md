# Sugestões de melhoria — MindCraft como suíte de gestão de estudos

Baseadas no QA por funcionalidade (62 casos, entrada real) e na revisão das 82 capturas. Ordem = o que eu faria primeiro.
O que já foi corrigido por causa do QA está em `evidencias/RESULTADOS.md`; aqui estão só as **melhorias novas**.

## 1. Estudo (o que mais agrega ao seu objetivo)
1. **Agenda de revisões** (visão semana/mês) + notificação do sistema "hoje: 7 revisões". Hoje o painel mostra uma lista; falta ver a carga dos próximos dias e evitar picos.
2. **Plano semanal por disciplina**: meta de horas/semana × realizado (barra), em vez de só "tópicos/dia". Cruza com o peso da disciplina no edital (nº de questões).
3. **Peso por disciplina** (nº de questões da prova) além do peso por tópico: o "progresso geral" passaria a refletir a nota esperada, não só a contagem de tópicos.
4. **Repetição espaçada adaptativa (SM-2/FSRS)**: hoje os intervalos são fixos (1-7-15-30-60-120). Usar a facilidade de cada tópico (acertos/erros em questões) reduz revisões inúteis.
5. **Evolução das questões**: gráfico de acerto por semana e por disciplina, e ranking "tópicos em que mais erro" (já temos feitas/acertos por tópico; falta a série temporal).
6. **Caderno de erros → flashcards**: transformar notas marcadas em cartões de revisão (frente/verso) dentro do próprio mapa.
7. **Cronômetro que sobrevive ao fechamento** (hoje os minutos só são gravados ao parar) + modo Pomodoro com pausas.
8. **Painel unificado do vault**: "o que revisar hoje em TODOS os meus mapas" (vários concursos/matérias em arquivos separados).
9. **Histórico/versões e backup**: snapshots diários do mapa (restaurar ontem) e cópia automática para uma pasta sincronizada.

## 2. Mapa e edição
10. **Indentar/desindentar e reordenar pelo teclado** (Tab/Shift+Tab no modo lista, Alt+↑/↓), como num outliner — digitar edital assim é mais rápido que criar nós.
11. **Modo "foco no ramo"**: mostrar só a disciplina escolhida (zoom no ramo) — complementa o seletor Níveis em editais de 800+ tópicos.
12. **Layout alternativo** (árvore à direita / organograma / lista indentada) para mapas muito grandes; hoje todos os tópicos de um lado empilham numa coluna alta.
13. **Rótulos de relação com "pílula" e desvio automático**: o texto da seta às vezes encosta no texto de um tópico (visível nas capturas do PDF/PNG).
14. **Anexos e links externos** por tópico (PDF da aula com página, URL, imagem) e abertura com um clique.
15. **Busca global no vault** (texto de todas as notas e títulos) e **tags** (`#revisar`, `#errei`) com filtros.
16. **Cabeçalho do painel de estudos mais organizado**: o bloco da prova (nome/data/salvar) fica solto ao lado do título; agrupar num cartão.

## 3. Rede de conhecimento
17. **Pré-visualização ao passar o mouse** num `[[link]]` e **links diretos para a nota do Obsidian** (abrir a nota exata via `obsidian://open?vault=…&file=…`).
18. **Filtros do grafo por tag/status** (só pendentes de revisão, só uma disciplina) e **cor por progresso**.
19. **Mapa → Obsidian de duas vias** (reimportar as edições feitas no `.md`), hoje a exportação é só de ida.

## 4. Qualidade e distribuição
20. **Rodar `npm test`, `npm run e2e` e `npm run qa` no CI nos três sistemas** (hoje só no Windows) e **assinar** os instaladores; **atualização automática**.
21. **Segurança**: migrar o renderer para `contextIsolation` + `preload` (hoje usa `nodeIntegration`, aceitável só porque carrega apenas arquivos locais) e adicionar CSP.
22. **Acessibilidade**: foco visível em todas as abas/botões, atalhos `Alt+1…5` para as abas, navegação do grafo pelo teclado, tema de alto contraste, leitor de tela.
23. **Internacionalização**: textos separados em arquivos de idioma (hoje fixos em português).
24. **Telemetria local de falhas** (log de erros em arquivo) para você me enviar quando algo der errado no uso real.

## Revisão "como concurseiro" (rodada final)
**Feito:** aba **Estudo** como padrão ao abrir pela primeira vez (a escolha seguinte é lembrada); importação de edital por CSV; agenda de 28 dias; pontos fracos; reabrir último mapa; backups; Alt+setas.
**Mantido de propósito (não descartado):** marcadores, cores/formas por tópico, 5 temas, apresentação e exportações PNG/SVG/OPML — são do mapa mental em si, não atrapalham o fluxo de estudo, e removê-los arriscaria mapas existentes. Candidatos a esconder em um futuro "modo estudo" se a tela ficar carregada: marcadores 🚩/💡, relações × links `[[ ]]` (funções parecidas — hoje as relações servem para setas visuais e os links para a rede).
**Descartado:** repetição espaçada adaptativa (SM-2/FSRS) e peso por disciplina no cálculo — sem dados reais de uso, o ganho não compensa o risco de agendar mal; os intervalos fixos 1-7-15-30-60-120 são previsíveis.
**Próximos passos úteis:** testar um CSV gerado por uma IA real com um edital seu e anotar o que ela erra (ajusto as instruções); assinar o instalador; testar macOS/Linux via CI.

## Próximas melhorias sugeridas (depois do leitor de PDF)
1. **Questões por banca/ano/assunto** e **caderno de erros** (motivo do erro) — mostra onde você mais erra.
2. **Simulados cronometrados** com nota por disciplina e evolução.
3. **Metas semanais** (horas e questões) com aviso no painel.
4. **Notificação diária** com o número de revisões vencidas.
5. **Destaques com cores** no PDF e lista de todos os trechos de um PDF; copiar o PDF para dentro do pacote .mcpack (opcional).
6. **Remover as versões clássicas** das telas migradas e migrar a casca (React) depois de um período de uso.
7. **Assinar o instalador** e criar atualização automática.
