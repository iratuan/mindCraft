# Histórico de mudanças

Formato livre, mais recente primeiro. Detalhes de testes: `evidencias/RESULTADOS.md`.

## 0.4.2
- **CSV colado ou importado**: a janela "Importar CSV de edital" ganhou a caixa **"cole aqui"** e o botão **Colar da área de transferência** (além de escolher arquivo), com a mesma prévia. O texto colado é limpo sozinho: resposta da IA com frases e bloco de código (```csv) ou **tabela** do chat. A **planilha de planejamento** também aceita texto colado.
- **Painéis redimensionáveis mais fáceis de achar**: alças dos divisores (painel lateral e leitor de PDF | mapa) maiores e sempre visíveis; no tablet com área de toque grande.
- Testes: 41 etapas e2e (novo e2e-paste), 21 no Android (digitar CSV com o teclado real), +9 unitários.

## 0.4.1
- **Cópia de segurança no tablet com destino lembrado**: depois da 1ª cópia (seletor do Android) as seguintes gravam direto no mesmo arquivo, sem janela; a Tela inicial mostra "Cópias vão para: …" com "trocar local"; falha de gravação (permissão perdida, gravação incompleta) avisa, esquece o destino e pergunta de novo.
- **Corrigido no tablet**: "Restaurar cópia" / abrir arquivos pelo seletor do Android — arquivos .mcpack/.mom/.opml apareciam APAGADOS (impossíveis de escolher). Agora o seletor mostra tudo e a extensão é conferida depois. O pacote criado deixou de ficar com nome "x.mcpack.zip".
- "Seu estudo" na Tela inicial pode ser recolhido numa linha (lembrado).
- Ferramentas de teste: executores `tools/run-e2e.js` (saída em arquivo; antes um pipe preso travava a bateria) e `tablet/scripts/run-android.js` (`npm run android`, em blocos); captura de tela com nova tentativa; testes: 40 etapas e2e, 20 no Android.

## 0.4.0
- **Manual de uso** em **Ajuda → Manual de uso** (☰ → Manual no tablet): 25 seções com índice, busca (sem acento) e texto específico para computador/tablet; botões "? Como usar" nas telas (Estudo, Notas, Conexões, Painel de estudos, Leitor de PDF, Tela inicial).
- **Painel lateral recolhível** (botão ‹ ›, Ctrl+\\, menu Exibir) e **divisores redimensionáveis** (painel e leitor de PDF | mapa) com mouse, dedo e teclado; duplo clique/toque restaura; o mapa nunca fica espremido; tamanhos lembrados.
- **Tela inicial**: aviso de **cópia de segurança** (nunca fez / passou do intervalo; "Fazer cópia agora", "Lembrar depois", intervalo 7/14/30/nunca), atalhos **Cópia de segurança** e **Restaurar cópia** (nunca sobrescreve) e o cartão **Seu estudo** (sequência, hoje, 7 dias em barras, acerto, metas e a disciplina mais atrasada com "Revisar agora").
- Esc com o manual aberto sobre o Painel de estudos fecha o manual (antes fechava o painel).
- Testes: 261 unitários, 39 etapas ponta a ponta, Android 19.

## 0.3.1
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
