# Histórico de mudanças

Formato livre, mais recente primeiro. Detalhes de testes: `evidencias/RESULTADOS.md`.

## 0.3.1 — em preparação
- **Reordenar tópicos**: arrastar e soltar ENTRE irmãos (linha indicadora; cima = antes, baixo = depois, meio = filho), botões ▲ ▼ (desktop) e ▲ ▼ ◀ ▶ (tablet), itens no menu Editar, Alt+setas continuam. Modelo: MindMap.moveBeside.
- **Salvar / Salvar como** com nome e local editáveis: janela própria no tablet (documentos do app, arquivo do aparelho pelo seletor do Android, compartilhar), arquivo escolhido atualizado a cada Salvar; no desktop o diálogo começa na pasta do arquivo atual. Plugin nativo `SaveFilePlugin`. Corrigido o backup antes de sobrescrever no tablet.
- **Tablet — botão depois do lápis** (recolher/expandir ramo): agora ⊟/⊞ conforme o estado, texto diz quantos subtópicos, desativado sem subtópicos, mensagem do que fez. Janelas de "Salvar como" não sobem o teclado sozinhas no toque.
- Executor `tools/run-e2e.js` (lista única; repete 1× e REGISTRA as etapas instáveis).
- Rede de conhecimento: corrigido índice velho do ponto sob o mouse ao redesenhar.
- Engenharia: testes de arquitetura, ESLint, graph-labels, fachada MCView, documentação e skills.

## 0.3.0 — 17/10/2026
- **Sincronização opcional** (desligada por padrão): pasta (ex.: Google Drive para computador) ou Google Drive direto (login por código, escopo `drive.file`). Nunca apaga; conflito mantém as duas versões.
- **Formatação original do Mindomo**: tema, estilo de cada tópico e notas (`description`) agora são desenhados; `themes.json` preservado ao salvar.
- **Rede de conhecimento**: rótulos em 4 posições sem sobreposição, rótulos de relação, densidade, agrupar folhas, foco, legenda clicável, busca com navegação, teclado, zoom por botões, gaveta responsiva, layout por componentes.
- **Banca** como lista de seleção (bancas comuns do Brasil + "Outra…").
- **Tablet**: app dentro da área segura (barras de status/navegação e recorte).
- **Engenharia**: `escapeHtml` único, extração de `graph-labels`, fachada `window.MCView`, ESLint, testes de arquitetura, documentação (`CLAUDE.md`, `docs/`) e skills (`.claude/skills`).

## 0.2.0 — 16/10/2026
- **Versão para tablet Android** (APK): a mesma interface emulando o Electron na web; toque, teclado virtual, Voltar, compartilhar, notificações agendadas, edição de tópicos e da rede.
- Aviso diário de revisões; relatório `.docx` completo.

## 0.1.x — 16/10/2026 e antes
- Editor de mapas mentais + gestão de estudos (revisão espaçada, questões por banca/ano, caderno de erros, metas, simulados), biblioteca SQLite, pacote `.mcpack`, leitor de PDF, rede de conhecimento (Obsidian), importação de CSV/edital, interface React por fatias.
