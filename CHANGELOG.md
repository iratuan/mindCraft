# Histórico de mudanças

Formato livre, mais recente primeiro. Detalhes de testes: `evidencias/RESULTADOS.md`.

> **Nota de consistência (novembro/2026).** O código deste repositório (`app/`) não contém os recursos de estudo descritos nas versões 0.1.x a 0.7.1: painel de estudos, revisão do dia, caderno de erros, simulados, metas, modelos de concurso, agenda `.ics`, sincronização e manual de uso. Só restaram estilos CSS desses recursos. As entradas marcadas com ⚠️ descrevem esses recursos e foram mantidas como histórico. O que existe e foi conferido no código: mapas, rede de conhecimento, PDF, abas, Obsidian (fase 1), revisão espaçada (0.7.2), logomarca e abertura. Os trechos de mídia (vídeo e navegador) das versões 0.4.3 e 0.6.x não foram conferidos um a um.

## 0.7.4 — 07/11/2026
- **Tema Pixel: áreas de leitura claras.** O leitor de PDF e a lousa de resolução ficam com fundo claro e sem efeito retrô, para a leitura não cansar.
- **Tema Pixel: sem linhas de varredura.** O efeito de tubo de monitor foi removido; a interface segue o padrão de cores suaves.
- **Tema Pixel: contraste no mapa.** O canvas do mapa fica claro, para que o texto dos tópicos seja legível.
- **Release:** Windows (`BRANIAC Setup 0.7.4.exe`) e Android (`BRANIAC-0.7.4.apk`, código 26).

## 0.7.3 — 07/11/2026
- **Tema Pixel (8 bits) com cores mais suaves:** a paleta saturada foi trocada por tons de cinza-azulado e âmbar apagado, para não cansar a vista. Mesmo desenho (bordas em degrau, cantos retos, linhas de varredura), menos contraste de cor.
- **Release com instaladores:** Windows (`BRANIAC Setup 0.7.3.exe`), macOS (`.dmg`) e Android (`BRANIAC-0.7.3.apk`, código 25).

## 0.7.2 — 06/11/2026
- **Nova abertura:** o vídeo de abertura do BRANIAC (`braniac_video.mp4`) substitui o anterior.
- **Nova logomarca:** `logo.svg` substitui a anterior no cabeçalho, na tela inicial e no tópico raiz do mapa (`core/logo.js`, com as mesmas três variantes de cor).
- **Tema "Pixel (8 bits)":** nova opção em Tema da interface, com paleta de console, bordas em degrau e cantos retos. Títulos e menu usam a fonte pixel (Press Start 2P, licença OFL, incluída no app); os rótulos densos seguem na fonte normal, porque a fonte pixel cortaria o texto.
- **Logomarca no tema escuro:** a logo preta do cabeçalho e da tela inicial fica clara no tema escuro (no desenho à mão continua preta).
- **Revisão espaçada:** o tópico pode ser marcado como revisado (Editar › Marcar tópico como revisado). A próxima revisão segue os intervalos 1-7-15-30-60-120 dias. Visualizar › Revisões de hoje… lista as revisões de hoje e as atrasadas, com o botão Revisado e a previsão dos próximos 7 dias. A revisão fica no arquivo do mapa e pode ser desfeita (Ctrl+Z).
- **Aviso diário de revisões:** no desktop, uma vez por dia, quando há revisões pendentes, um aviso do sistema com a contagem. A barra de status mostra a contagem em qualquer aparelho.
- **Obsidian (fase 1):** exportação da rede para o vault e abertura do vault no Obsidian (ver `docs/OBSIDIAN.md`).

## 0.7.1
- **Ações do tópico na barra:** ao selecionar um tópico, a barra mostra de novo preenchimento, forma, negrito, níveis e o botão **Renomear** (F2 continua valendo). Antes, os controles de estilo ficavam só no painel Estilo.
- **Tela inicial sem painel:** sem mapa aberto, o painel lateral e o divisor somem, e a tela inicial ocupa a janela.
- **Painel lateral:** o nome da aba ativa aparece acima das abas (Estilo, Estudo, Notas, Conexões, Estrutura).
- **Barra lateral:** o botão Navegador ganhou a legenda, como os demais botões de primeiro nível.
- ⚠️ **Menus e botões:** "Novo mapa de concurso…" tem o mesmo nome no menu Arquivo, no tablet e na tela inicial.

## 0.7.0 — ⚠️ recursos não presentes neste repositório
- ⚠️ **Modelos de concurso:** "Novo mapa de concurso" abre a lista de modelos (BNB, DATAPREV, TJ-CE, POSCOMP e OAB), com busca. Escolher um modelo cria o mapa com as disciplinas e os tópicos do edital. "Começar do zero" mantém o modelo genérico.
- ⚠️ Modelos em `modelos/` (CSV) geram `core/templates-data.js` (`npm run build:templates`); o teste acusa se os dois ficarem fora de sincronia.
- ⚠️ Correção: na tela inicial de primeiro uso, "Novo mapa de concurso" estava escondido (regressão da 0.6.3).
- Correção: importar CSV pela tela inicial (0.6.4) e roda do mouse sem mapa.

## 0.6.4
- **Importar CSV pela tela inicial:** "Criar o mapa" não falha mais quando não há mapa aberto (antes, o erro "reading 'find'" deixava a janela aberta e o mapa não era criado).
- **Roda do mouse na tela inicial:** não tenta mais dar zoom num mapa inexistente.
- A prévia do CSV mostra separador, linhas lidas e colunas reconhecidas, para diagnosticar um arquivo que não importa.
- A mensagem de importação conta só os tópicos (não as disciplinas).

## 0.6.3
- **Primeiro uso:** nenhum mapa abre por padrão; a tela inicial mostra só os caminhos iniciais (novo mapa, importar edital, ler PDF, abrir arquivo, restaurar cópia e cópia de segurança).
- **Ferramentas do mapa só ativas com um mapa aberto:** Rede, Painel de estudos, PDF, vídeo e navegador. Sem mapa, atalhos e menus mostram uma mensagem em vez de falhar.
- **Maximizar e restaurar:** botões no cabeçalho do painel da direita e da bancada da esquerda (um por vez).
- **Mais área para o mapa:** controles do tópico foram para o painel Estilo; a barra de opções só aparece quando há o que mostrar. Painel da direita com abas em ícones.
- **Barra de ferramentas mais enxuta:** saíram Ajustar à tela (continua em Ctrl+0 e no menu Exibir), Desfazer e Refazer (continuam em Ctrl+Z, Ctrl+Y e no menu Editar).
- Barra de status mostra só o nome do arquivo.

## 0.6.2
- ⚠️ **Modelo de prompt para transformar o edital em PDF em planilha (CSV)**: seção "Edital em planilha (CSV) com a IA" na Ajuda, com botão **Copiar o modelo** e passo a passo de importação.

## 0.6.1
- **Layout mais limpo:** as abas ficam na mesma linha do logo (uma barra a menos no topo).
- **Bancada de mídia:** ao fechar a última aba, a bancada fecha sozinha; com uma mídia em foco, um ícone sem texto na borda direita reabre o painel do mapa.
- **Janela estreita:** a faixa de abas rola na horizontal em vez de cortar as abas.
- **Busca:** a barra de status informa quantos resultados estão nos tópicos soltos do Mindomo.
- **Rede de conhecimento:** o rótulo do nó selecionado (em negrito) não invade os vizinhos.

## 0.6.0
- **Abas do espaço de trabalho**, como em um navegador: a aba do mapa (com ✕ para fechar) e uma aba para cada PDF, vídeo ou navegador aberto (com ✕ em cada uma).
- **Foco:** com uma mídia ativa, as ações do mapa e o painel da direita ficam ocultos; o mapa continua visível e um clique nele (ou na aba do mapa) devolve o foco ao mapa.
- **Compatibilidade com o Mindomo:** tópicos soltos (sem ligação à raiz) aparecem à direita do mapa, só para leitura, e Editar → "Trazer tópicos soltos para o mapa" os traz para a árvore (Ctrl+Z desfaz). A lixeira do Mindomo, o histórico, as relações e todos os temas são preservados ao salvar.
- Correção: um arquivo `.mom` com ciclos de pai não trava mais a leitura.

## 0.5.0
- **Modo apresentação retirado** (botão ▶, tecla F5, barra flutuante, item do menu Exibir e da barra do tablet). Para simplificar o produto e reduzir riscos. Nada que o usuário já tem é apagado: mapas, notas, revisões e pacotes continuam iguais.
- **Botões que dependem de mapa aberto** só ficam habilitados com um mapa na tela. Antes, ao abrir o app (tela inicial por cima), botões como Ajustar à tela, Desfazer, Novo tópico e Relação apareciam habilitados. Vale também para o menu do desktop (Salvar, Exportar, Editar, Ajustar…) e o menu do tablet.
- Versão Android: código 500.

## 0.4.5
- **Correção no botão de fechar mapa**: o botão de fechar mapa atual (`#closeMapBtn`) agora garante a desocupação completa da memória (redefinindo o canvas com mapa limpo e redefinindo título), remove rascunhos de recuperação de sessão pendentes do disco, fecha divisões de mídia ativas (PDF, vídeo, navegador), e possui área de toque touch responsiva (36px em telas touch) e proteção contra encolhimento flex (`flex-shrink: 0`).

## 0.4.4
- **Revisão ortográfica e pontuação**: correção do posicionamento dos pontos de interrogação na interface, padronizando botões de ajuda e auxílio para `Como usar?` (ao invés de `? Como usar`), respeitando as normas gramaticais da língua portuguesa em todos os painéis (Estudo, Notas, Conexões, Painel de Estudos e Mídia).

## 0.4.3
- **Barra de ferramentas contextual sem sobreposição**: sistema de visibilidade estrita por atributo `data-context="topic|relation|canvas|none"` com exclusão mútua garantida, rolagem horizontal cinética e proteção anti-estouro em telas de qualquer proporção (incluindo tablet Samsung Galaxy Tab S10 FE+).
- **Tela de Splash (Splash Screen)**: inicialização com logotipo vetorial pulsante, barra de progresso animada, status dinâmico do boot e versão do app. Transição com fade-out suave e integração nativa com o Capacitor no Android.
- **Botões dedicados para fechar recursos ativos**:
  - **Fechar Mapa Atual** (`✕` no cabeçalho): fecha o documento atual com confirmação segura de alterações não salvas e retorna à Tela Inicial.
  - **Fechar PDF** (`✕ Fechar PDF`): descarrega o arquivo da memória e limpa a visualização.
  - **Fechar Vídeo** (`✕ Fechar Vídeo`): pausa a reprodução e reseta o player de videoaulas.
  - **Fechar Aba de Navegador** (`✕ Fechar Aba`): encerra a navegação web ativa e retorna à página limpa.
- ⚠️ **Recursos Multimídia** (videoaulas e navegador não estão neste repositório): Painel dividido de Videoaulas locais e YouTube com sincronização de timestamps em nós do mapa, e Navegador Web integrado com favoritos de concursos públicos e leis.
- **Qualidade e Testes**: 276 testes automatizados passando com 100% de paridade web (`npm run check`) e 8 novas evidências visuais no tablet.

## 0.4.2
- **CSV colado ou importado**: a janela "Importar CSV de edital" ganhou a caixa **"cole aqui"** e o botão **Colar da área de transferência** (além de escolher arquivo), com a mesma prévia. O texto colado é limpo sozinho: resposta da IA com frases e bloco de código (```csv) ou **tabela** do chat. A **planilha de planejamento** ⚠️ (não presente neste repositório) também aceita texto colado.
- **Painéis redimensionáveis mais fáceis de achar**: alças dos divisores (painel lateral e leitor de PDF | mapa) maiores e sempre visíveis; no tablet com área de toque grande.
- Testes: 41 etapas e2e (novo e2e-paste), 21 no Android (digitar CSV com o teclado real), +9 unitários.

## 0.4.1
- **Cópia de segurança no tablet com destino lembrado**: depois da 1ª cópia (seletor do Android) as seguintes gravam direto no mesmo arquivo, sem janela; a Tela inicial mostra "Cópias vão para: …" com "trocar local"; falha de gravação (permissão perdida, gravação incompleta) avisa, esquece o destino e pergunta de novo.
- **Corrigido no tablet**: "Restaurar cópia" / abrir arquivos pelo seletor do Android — arquivos .mcpack/.mom/.opml apareciam APAGADOS (impossíveis de escolher). Agora o seletor mostra tudo e a extensão é conferida depois. O pacote criado deixou de ficar com nome "x.mcpack.zip".
- ⚠️ "Seu estudo" na Tela inicial pode ser recolhido numa linha (lembrado).
- Ferramentas de teste: executores `tools/run-e2e.js` (saída em arquivo; antes um pipe preso travava a bateria) e `tablet/scripts/run-android.js` (`npm run android`, em blocos); captura de tela com nova tentativa; testes: 40 etapas e2e, 20 no Android.

## 0.4.0
- ⚠️ **Manual de uso** em **Ajuda → Manual de uso** (☰ → Manual no tablet): 25 seções com índice, busca (sem acento) e texto específico para computador/tablet; botões "? Como usar" nas telas (Estudo, Notas, Conexões, Painel de estudos, Leitor de PDF, Tela inicial).
- **Painel lateral recolhível** (botão ‹ ›, Ctrl+\\, menu Exibir) e **divisores redimensionáveis** (painel e leitor de PDF | mapa) com mouse, dedo e teclado; duplo clique/toque restaura; o mapa nunca fica espremido; tamanhos lembrados.
- **Tela inicial**: ⚠️ (o cartão "Seu estudo" não está neste repositório) aviso de **cópia de segurança** (nunca fez / passou do intervalo; "Fazer cópia agora", "Lembrar depois", intervalo 7/14/30/nunca), atalhos **Cópia de segurança** e **Restaurar cópia** (nunca sobrescreve) e o cartão **Seu estudo** (sequência, hoje, 7 dias em barras, acerto, metas e a disciplina mais atrasada com "Revisar agora").
- ⚠️ Esc com o manual aberto sobre o Painel de estudos fecha o manual (antes fechava o painel).
- Testes: 261 unitários, 39 etapas ponta a ponta, Android 19.

## 0.3.1
- **Reordenar tópicos**: arrastar e soltar ENTRE irmãos (linha indicadora; cima = antes, baixo = depois, meio = filho), botões ▲ ▼ (desktop) e ▲ ▼ ◀ ▶ (tablet), itens no menu Editar, Alt+setas continuam. Modelo: MindMap.moveBeside.
- **Salvar / Salvar como** com nome e local editáveis: janela própria no tablet (documentos do app, arquivo do aparelho pelo seletor do Android, compartilhar), arquivo escolhido atualizado a cada Salvar; no desktop o diálogo começa na pasta do arquivo atual. Plugin nativo `SaveFilePlugin`. Corrigido o backup antes de sobrescrever no tablet.
- **Tablet — botão depois do lápis** (recolher/expandir ramo): agora ⊟/⊞ conforme o estado, texto diz quantos subtópicos, desativado sem subtópicos, mensagem do que fez. Janelas de "Salvar como" não sobem o teclado sozinhas no toque.
- Executor `tools/run-e2e.js` (lista única; repete 1× e REGISTRA as etapas instáveis).
- Rede de conhecimento: corrigido índice velho do ponto sob o mouse ao redesenhar.
- Engenharia: testes de arquitetura, ESLint, graph-labels, fachada MCView, documentação e skills.

## 0.3.0 — 17/10/2026
- ⚠️ **Sincronização opcional** (desligada por padrão): pasta (ex.: Google Drive para computador) ou Google Drive direto (login por código, escopo `drive.file`). Nunca apaga; conflito mantém as duas versões.
- **Formatação original do Mindomo**: tema, estilo de cada tópico e notas (`description`) agora são desenhados; `themes.json` preservado ao salvar.
- **Rede de conhecimento**: rótulos em 4 posições sem sobreposição, rótulos de relação, densidade, agrupar folhas, foco, legenda clicável, busca com navegação, teclado, zoom por botões, gaveta responsiva, layout por componentes.
- ⚠️ **Banca** como lista de seleção (bancas comuns do Brasil + "Outra…").
- **Tablet**: app dentro da área segura (barras de status/navegação e recorte).
- **Engenharia**: `escapeHtml` único, extração de `graph-labels`, fachada `window.MCView`, ESLint, testes de arquitetura, documentação (`CLAUDE.md`, `docs/`) e skills (`.claude/skills`).

## 0.2.0 — 16/10/2026
- **Versão para tablet Android** (APK): a mesma interface emulando o Electron na web; toque, teclado virtual, Voltar, compartilhar, notificações agendadas, edição de tópicos e da rede.
- ⚠️ Aviso diário de revisões; relatório `.docx` completo; notificações agendadas no tablet.

## 0.1.x — 16/10/2026 e antes
- ⚠️ Editor de mapas mentais + gestão de estudos (revisão espaçada, questões por banca/ano, caderno de erros, metas, simulados), biblioteca SQLite, pacote `.mcpack`, leitor de PDF, rede de conhecimento (Obsidian), importação de CSV/edital, interface React por fatias.
