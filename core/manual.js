'use strict';
/**
 * Manual de uso do MindCraft: conteúdo (dados puros, em pt-BR) + busca. Mora no núcleo para valer no desktop E no tablet
 * (a janela do manual, em renderer/react/ManualModal.jsx, só desenha estes dados).
 *
 * Formato de cada seção: { id, group, title, summary, keywords, blocks }.
 * Blocos: ['p', texto] · ['ul', [textos]] · ['steps', [textos]] · ['tip', texto] · ['warn', texto] · ['keys', [[tecla, ação]]].
 * Qualquer bloco aceita o 3º item { only: 'desktop' | 'touch' } para aparecer só num dos dois.
 * Texto simples; **negrito** e `código` são o único "markup" (a janela os interpreta sem nunca criar HTML a partir do texto).
 */

const SECTIONS = [
  // ------------------------------------------------------------------ começar
  { id: 'primeiros-passos', group: 'Começar', title: 'Primeiros passos', summary: 'Do zero ao primeiro mapa de estudo.',
    keywords: 'iniciar começar tela inicial novo mapa concurso edital tour',
    blocks: [
      ['p', 'O MindCraft é um editor de **mapas mentais** feito para **estudar para concursos e provas**: você monta o mapa da matéria, e o app cuida das revisões, do tempo, das questões e dos erros.'],
      ['steps', [
        'Na **Tela inicial**, escolha **Novo mapa de concurso** (modelo com disciplinas) ou **Importar edital** (o conteúdo programático vira tópicos).',
        'Selecione um tópico e use **Tab** (filho) e **Enter** (irmão) para ir montando o mapa.',
        'Abra a aba **Estudo** (painel à direita) e registre o que estudou: **✓ Estudei hoje** agenda as revisões sozinho.',
        'Todo dia abra a **Revisão do dia** e veja o **Painel de estudos** para saber o que está atrasado.',
        'Salve com **Ctrl+S**. O app também guarda um rascunho automático e pede confirmação antes de perder alterações.',
      ], { only: 'desktop' }],
      ['steps', [
        'Na **Tela inicial**, escolha **Novo mapa de concurso** (modelo com disciplinas) ou **Importar edital** (o conteúdo programático vira tópicos).',
        'Toque num tópico para selecioná-lo e use os botões da barra flutuante (☰ ✎ ⊟ ▲ ▼ ◀ ▶) ou o menu ☰ para criar e editar.',
        'Abra o painel **Estudo** (botão ☷) e registre o que estudou: **✓ Estudei hoje** agenda as revisões sozinho.',
        'Todo dia abra a **Revisão do dia** (menu ☰ → Estudo) e veja o **Painel de estudos**.',
        'Toque em ☰ → **Salvar**. O app guarda uma cópia automática e avisa antes de perder alterações.',
      ], { only: 'touch' }],
      ['tip', 'Para voltar à Tela inicial a qualquer momento: botão da casa (barra da esquerda) ou **Ctrl+Shift+H**. Para este manual: menu **Ajuda → Manual de uso**.', { only: 'desktop' }],
      ['tip', 'Para voltar à Tela inicial a qualquer momento: menu ☰ → **Tela inicial**. Para este manual: menu ☰ → **Manual de uso**.', { only: 'touch' }],
    ] },
  { id: 'tela-inicial', group: 'Começar', title: 'Tela inicial', summary: 'Atalhos, continuar de onde parou, recentes e provas.',
    keywords: 'home recentes continuar iniciar abrir último',
    blocks: [
      ['p', 'Abre ao iniciar o app. Mostra **Continuar de onde parou** (último mapa, com tópicos, progresso, revisões vencidas e dias para a prova), os **atalhos** (novo mapa, modelo de concurso, importar edital, abrir, biblioteca, PDF, simulado, revisão do dia), os **arquivos recentes**, o resumo de **Hoje** e as **Próximas provas**.'],
      ['ul', ['**Seu estudo**: sequência de dias, tempo de hoje e dos últimos 7 dias (com um gráfico de barras), acerto em questões, metas da semana e a **disciplina que mais precisa de você** (a com mais revisões vencidas), com o botão **Revisar agora**. Com biblioteca, os números somam **todos os mapas**; sem ela, valem para o mapa aberto. A sequência conta os dias com **tempo de estudo ou questões registrados**.',
        '**Recolher**: o cartão tem o botão **recolher/mostrar** (vira uma linha só e a escolha fica lembrada), para quem prefere os atalhos e os arquivos recentes no topo.',
        '**Aviso de cópia de segurança**: aparece quando você ainda não fez uma cópia ou já passou o intervalo (padrão: 14 dias). Veja a seção **Segurança dos seus dados**.',
        '**✕** ao lado de um recente só tira o item da lista — o arquivo nunca é apagado.', 'Arquivo que mudou de lugar aparece esmaecido ("não encontrado").', '**Ao iniciar o MindCraft** (rodapé): escolha entre mostrar esta tela, reabrir o último mapa ou começar em branco.']],
      ['tip', 'Arraste um arquivo `.mom`, `.md`, `.opml` ou `.pdf` para a janela para abri-lo.', { only: 'desktop' }],
    ] },

  // ------------------------------------------------------------------ mapa
  { id: 'topicos', group: 'Mapa', title: 'Criar e editar tópicos', summary: 'Filho, irmão, editar título, apagar, desfazer.',
    keywords: 'tópico nó filho irmão editar título excluir apagar desfazer refazer f2 tab enter',
    blocks: [
      ['keys', [['Tab', 'novo tópico filho'], ['Enter', 'novo tópico irmão'], ['F2 ou duplo clique', 'editar o título'], ['Esc', 'cancelar a edição'], ['Delete', 'excluir o tópico (e o que está dentro dele)'], ['Ctrl+Z / Ctrl+Y', 'desfazer / refazer']], { only: 'desktop' }],
      ['ul', [
        'Toque no tópico para selecioná-lo; **toque duas vezes** (ou use ✎ na barra) para editar o título — a janela de edição sobe acima do teclado.',
        'Use o menu ☰ → Editar para desfazer/refazer e as ações de criar tópico.',
        'O botão ⊟/⊞ recolhe ou expande o ramo do tópico (mostra quantos subtópicos mexe).',
      ], { only: 'touch' }],
      ['p', 'Cada alteração pode ser **desfeita**, inclusive ações em lote (mover vários tópicos, importar planilha, capturar do PDF contam como **um** desfazer).'],
      ['warn', 'Excluir um tópico exclui também os subtópicos dele. Se errar, **desfaça** logo em seguida.'],
    ] },
  { id: 'reordenar', group: 'Mapa', title: 'Reordenar e mover tópicos', summary: 'Arrastar entre irmãos, botões ▲▼, promover e rebaixar.',
    keywords: 'ordem mover arrastar subir descer promover rebaixar nível irmão filho alt',
    blocks: [
      ['p', '**Arrastando**: solte o tópico na parte de **cima** do alvo para ficar **antes** dele, na de **baixo** para ficar **depois** (uma linha laranja mostra o ponto exato) e no **meio** para torná-lo **filho** do alvo. Funciona entre pais diferentes e com vários tópicos selecionados (a ordem do mapa é mantida).'],
      ['keys', [['Alt+↑ / Alt+↓', 'subir / descer entre os irmãos'], ['Alt+← / Alt+→', 'promover (subir um nível) / rebaixar (virar filho do irmão de cima)']], { only: 'desktop' }],
      ['p', 'Também há os botões **▲ ▼** na barra da esquerda e os itens do menu **Editar**.', { only: 'desktop' }],
      ['p', 'Na barra flutuante: **▲ ▼** sobem/descem entre irmãos; **◀** promove e **▶** rebaixa. Também dá para arrastar com o dedo, como no computador.', { only: 'touch' }],
      ['tip', 'Soltar um tópico sobre si mesmo, dentro do próprio ramo ou no vazio não altera nada.'],
    ] },
  { id: 'selecao', group: 'Mapa', title: 'Selecionar vários, copiar e colar', summary: 'Ações em lote com um único desfazer.',
    keywords: 'seleção múltipla ctrl shift retângulo copiar recortar colar lote',
    blocks: [
      ['ul', [
        '**Ctrl+clique** soma/tira um tópico; **Shift+clique** seleciona o intervalo; arrastar com **Shift** desenha um retângulo; **Ctrl+A** seleciona tudo.',
        '**Ctrl+C / Ctrl+X / Ctrl+V** copiam, recortam e colam tópicos (com os subtópicos). Colar um **texto** ou um **edital** cria ramos de tópicos.',
        'Formatar, mover, excluir e registrar estudo valem para **todos** os selecionados de uma vez.',
      ], { only: 'desktop' }],
      ['ul', [
        'Um **toque longo** num tópico funciona como Ctrl+clique (soma à seleção).',
        'Formatar, mover e registrar estudo valem para todos os selecionados. (Copiar, recortar e colar tópicos são atalhos de teclado do computador; no tablet use o teclado físico, se tiver um.)',
      ], { only: 'touch' }],
    ] },
  { id: 'estilo', group: 'Mapa', title: 'Estilo, marcadores, progresso e níveis', summary: 'Cores, formas, temas e recolher por profundidade.',
    keywords: 'tema cor forma negrito marcador progresso níveis recolher expandir claro escuro',
    blocks: [
      ['ul', [
        'Aba **Estilo**: tema do mapa (visual completo), **marcadores** e **progresso** (0–100%) do tópico selecionado.',
        'Barra de opções: **Preenchimento**, **Forma** e **B** (negrito) do tópico; **Níveis** recolhe/expande o mapa inteiro até uma profundidade (editais grandes abrem recolhidos).',
        'O ícone de sol, no canto superior direito, alterna entre tema **claro** e **escuro**.',
        '**Espaço** recolhe/expande o ramo do tópico selecionado.',
      ]],
      ['p', 'Em mapas abertos do Mindomo, o tema original aparece como **Original do Mindomo** e é mantido ao salvar.'],
    ] },
  { id: 'notas', group: 'Mapa', title: 'Notas em Markdown e [[links]]', summary: 'Anotações formatadas por tópico, ligadas entre si.',
    keywords: 'notas markdown negrito lista tarefa tabela link colchetes obsidian backlinks',
    blocks: [
      ['p', 'A aba **Notas** guarda um texto por tópico. Há dois modos: **Editar** (Markdown, com barra de formatação) e **Visualizar** (formatado: títulos, listas, tabelas, citações, código e **tarefas** que você marca com um toque).'],
      ['ul', [
        'Digite **`[[`** para **ligar a outro tópico** (ou a outro mapa: `[[Mapa#Tópico]]`) — o autocompletar sugere os nomes.',
        'O painel **Conexões** mostra os links, quem **cita** o tópico e as **menções sem link** (um clique as transforma em `[[link]]`).',
        'Links da internet (`http://…`) abrem no navegador. HTML digitado na nota **nunca** é executado.',
      ]],
      ['keys', [['Ctrl+B / Ctrl+I', 'negrito / itálico'], ['Ctrl+K', 'ligar a outro tópico [[ ]]']], { only: 'desktop' }],
    ] },
  { id: 'relacoes', group: 'Mapa', title: 'Relações entre tópicos (setas)', summary: 'Ligações lógicas com rótulo ("depende de").',
    keywords: 'relação seta ligar conectar rótulo r conexão',
    blocks: [
      ['steps', ['Selecione um tópico e use o botão **Relação** da barra (ou a tecla **R**).', 'Clique no tópico de destino. A seta aparece no mapa.', 'Selecione a seta para dar um **rótulo** (aba Notas).']],
      ['p', 'A relação aparece no painel **Conexões** dos dois tópicos, na **Rede de conhecimento** e na exportação para o Obsidian. Excluir a seta desfaz a conexão.'],
    ] },
  { id: 'layout', group: 'Mapa', title: 'Painel lateral e divisores', summary: 'Recolher o painel direito e redimensionar as áreas.',
    keywords: 'painel lateral recolher expandir esconder divisor redimensionar largura arrastar pdf mapa tela dividida gaveta',
    blocks: [
      ['p', 'O **painel lateral** (Estilo, Estudo, Notas, Conexões, Estrutura) pode ser **recolhido** para dar o espaço todo ao mapa — e expandido de novo quando precisar.'],
      ['ul', [
        '**Botão ‹ ›** na borda entre o mapa e o painel: **›** recolhe, **‹** expande. O estado fica **lembrado** na próxima vez que abrir o app.',
        '**Ctrl+\\** ou **Exibir → Painel lateral (recolher/expandir)** fazem o mesmo. Pedir uma aba (por exemplo **Alt+2**) com o painel recolhido o **expande** sozinho.',
        '**Largura**: arraste o divisor (a alça ┃ ao lado do botão). O painel vai de 220 a 560 px; **duplo clique** no divisor volta ao tamanho padrão.',
        '**Teclado**: com o divisor em foco (clique nele ou use **Tab**), **← →** ajustam de 24 em 24 px (com **Shift**, 96 px), **Home**/**End** vão ao menor/maior tamanho e **Enter** restaura o padrão.',
      ], { only: 'desktop' }],
      ['ul', [
        '**Botão ‹ ›** (grande, na borda direita do mapa): **›** recolhe o painel, **‹** expande. O estado fica **lembrado**.',
        '**Largura**: **arraste o divisor com o dedo**; **dois toques** nele voltam ao tamanho padrão.',
        'Em telas **estreitas** (tablet em pé, abaixo de 1000 px) o painel vira uma **gaveta**: abra e feche com o botão **☷** da barra flutuante — aí não há botão ‹ › nem divisor.',
      ], { only: 'touch' }],
      ['p', '**Leitor de PDF | mapa**: com o PDF aberto a tela se divide e o divisor entre os dois também é arrastável — com o **mouse**, o **dedo** ou as **setas do teclado** (**duplo clique/toque** restaura os 46%). O mapa **nunca fica espremido**: o divisor não deixa o mapa ficar com menos de ~260 px.'],
      ['tip', 'Para ler o PDF com o máximo de espaço: recolha o painel lateral e alargue o leitor; depois traga o painel de volta com o botão ‹.'],
    ] },
  { id: 'busca-apresentar', group: 'Mapa', title: 'Buscar, ajustar à tela e apresentar', summary: 'Achar um tópico, enquadrar o mapa, modo apresentação.',
    keywords: 'buscar procurar zoom ajustar tela apresentar presentation f5 pinça',
    blocks: [
      ['ul', [
        '**Buscar no mapa** (Ctrl+F) destaca os tópicos que contêm o texto.',
        '**Ajustar à tela** (Ctrl+0) enquadra o mapa todo; o controle de **zoom** fica na barra de status.',
        '**Apresentar** (F5) revela o mapa **tópico a tópico** em tela cheia: **← →** navegam e **Esc** sai.',
      ], { only: 'desktop' }],
      ['ul', [
        '**Buscar no mapa** destaca os tópicos que contêm o texto.',
        '**Pinça** (dois dedos) dá zoom; **arrastar** no vazio move o mapa; ☰ → **Ajustar à tela** enquadra tudo.',
        '☰ → **Apresentar** revela o mapa tópico a tópico em tela cheia (Esc ou o botão Voltar sai).',
      ], { only: 'touch' }],
    ] },

  // ------------------------------------------------------------------ arquivos
  { id: 'salvar', group: 'Arquivos e dados', title: 'Salvar, Salvar como e abrir', summary: 'Nome e local do arquivo, rascunho automático.',
    keywords: 'salvar como arquivo nome pasta local downloads documentos abrir recente autosave rascunho',
    blocks: [
      ['p', 'Os mapas são arquivos **.mom** (compatíveis com o Mindomo). A gravação é **segura**: o app escreve num arquivo temporário e só então troca o definitivo, e guarda uma cópia antes de sobrescrever.'],
      ['ul', [
        '**Ctrl+S** salva. Num mapa novo (ou em **Ctrl+Shift+S**, Salvar como) o diálogo do sistema deixa mudar **nome e pasta**; ele começa na pasta do arquivo atual.',
        '**Arquivo → Abrir recente** e a Tela inicial listam os últimos arquivos. **Arquivo → Restaurar versão anterior…** volta a uma cópia de segurança.',
        'Se o app fechar sem salvar, o **rascunho automático** é oferecido na próxima abertura.',
      ], { only: 'desktop' }],
      ['ul', [
        '☰ → **Salvar** num mapa novo (ou **Salvar como…**) abre uma janela com o **nome editável** e o destino: **Documentos do MindCraft** (reabre pela Tela inicial), **Escolher pasta e nome no aparelho…** (Downloads, Google Drive, cartão SD) ou, nas exportações, **Compartilhar**.',
        'Depois de escolher um arquivo do aparelho, **cada Salvar o atualiza**. Se a gravação no local escolhido falhar, a cópia dentro do app continua segura e a mensagem diz como escolher outro local.',
        'Toque no campo do **nome** para editá-lo (o teclado só sobe quando você toca nele).',
      ], { only: 'touch' }],
      ['warn', 'O tablet guarda os dados no armazenamento do app. Exporte um **pacote .mcpack** de vez em quando (Biblioteca → Exportar pacote) e guarde fora do aparelho.', { only: 'touch' }],
    ] },
  { id: 'biblioteca', group: 'Arquivos e dados', title: 'Biblioteca de mapas', summary: 'Todos os mapas num banco seguro, com versões e lixeira.',
    keywords: 'biblioteca banco sqlite versões lixeira busca mcpack pacote backup importar exportar',
    blocks: [
      ['p', 'Abra em **Arquivo → Biblioteca de mapas** (Ctrl+Shift+B). Guarda **todos os seus mapas** num banco local e permite: abrir, ver **versões** (abre uma versão como mapa novo — nunca sobrescreve), mandar para a **lixeira** (restaurável), **exportar .mom**, **buscar em todos os mapas** e importar `.mom`, pasta de `.mom` ou pacote `.mcpack`.', { only: 'desktop' }],
      ['p', 'Abra pelo menu ☰ → **Biblioteca de mapas**. Guarda **todos os seus mapas** e permite: abrir, ver **versões**, mandar para a **lixeira** (restaurável), **exportar**, **buscar em todos os mapas** e importar/exportar o pacote `.mcpack`.', { only: 'touch' }],
      ['ul', [
        '**Guardar este mapa na biblioteca** copia o mapa (o arquivo original não é alterado). Depois disso **Salvar grava no banco**, com conferência.',
        '**Exportar pacote** gera um `.mcpack` com **todos os mapas e as configurações** — é a forma de levar tudo para outro aparelho. **Importar pacote** restaura sem sobrescrever sem avisar.',
        '**Backup do banco** faz uma cópia exata do banco inteiro.',
      ]],
    ] },
  { id: 'exportar', group: 'Arquivos e dados', title: 'Exportar o mapa', summary: 'PDF, Word, PNG, SVG, Markdown e OPML.',
    keywords: 'exportar pdf word docx png svg markdown opml relatório obsidian imprimir',
    blocks: [
      ['p', 'O botão **Exportar** (canto superior direito) gera **PDF, Word (.docx), PNG, SVG, Markdown e OPML** do mapa. O **Painel de estudos** também gera um **relatório** (.md ou .docx) com os mesmos números do painel.'],
      ['p', 'A **Rede de conhecimento** exporta para o **Obsidian**: um `.md` por mapa, sem nunca sobrescrever uma nota que não seja do MindCraft.', { only: 'desktop' }],
      ['tip', 'No tablet a exportação de PDF e a pasta do Obsidian ainda não existem; os demais formatos podem ser salvos ou compartilhados.', { only: 'touch' }],
    ] },
  { id: 'edital', group: 'Arquivos e dados', title: 'Importar edital e planilha de planejamento', summary: 'Edital vira mapa; edite os dados no Excel e volte.',
    keywords: 'edital csv ia planilha excel importar conteúdo programático modelo concurso',
    blocks: [
      ['ul', [
        '**Colar o edital**: cole o conteúdo programático (numeração `1`, `1.1`, itens `a)`, disciplinas em MAIÚSCULAS) e ele vira tópicos.',
        '**Novo mapa de concurso**: modelo pronto com disciplinas.',
        '**Importar CSV de edital (gerado por IA)**: copie as instruções para a IA junto com o texto do edital, salve a resposta como `.csv` e escolha o arquivo. A **prévia** mostra quantos tópicos entram e as linhas com problema; nada é gravado até você confirmar.',
      ]],
      ['p', '**Planilha de planejamento**: salve o mapa (ou uma disciplina) como CSV, edite no Excel — peso, progresso, próxima revisão, tempo, questões, notas — e **importe de volta**. Você vê a prévia das mudanças e só então clica em **Aplicar** (uma única operação, desfazível). A planilha **nunca apaga tópicos**.'],
    ] },

  // ------------------------------------------------------------------ estudo
  { id: 'estudo-topico', group: 'Estudo', title: 'Estudo do tópico (aba Estudo)', summary: 'Peso, revisão espaçada, tempo e questões.',
    keywords: 'estudei hoje errei revisão espaçada peso cronômetro tempo minutos questões banca ano acertos ciclo',
    blocks: [
      ['p', 'Selecione um tópico e abra a aba **Estudo**. Vale para **vários tópicos** selecionados.'],
      ['ul', [
        '**Peso (1–5)**: importância do tópico; pesa no progresso das disciplinas.',
        '**✓ Estudei / revisei hoje**: agenda a próxima revisão no ciclo **1 → 7 → 15 → 30 → 60 → 120 dias**. **↻ Errei** volta ao início do ciclo (rever amanhã). Repetir no mesmo dia não avança o ciclo.',
        '**Tempo**: cronômetro (▶ Iniciar / ■ Parar) ou **＋ minutos** manual.',
        '**Questões**: informe **banca**, **ano**, quantas **feitas** e quantos **acertos**, e clique em **Registrar** — alimenta o acerto por banca e ano e os pontos fracos.',
        '**Caderno de erros**: veja a seção própria.',
      ]],
      ['p', 'No mapa, o selo **↻** marca revisão vencida (somada nos ramos recolhidos) e os tópicos-pai mostram o **progresso agregado**.'],
      ['tip', 'Com o cronômetro rodando, o app avisa antes de fechar para não perder os minutos.', { only: 'desktop' }],
    ] },
  { id: 'caderno-erros', group: 'Estudo', title: 'Caderno de erros', summary: 'Anote o motivo, refaça e acompanhe.',
    keywords: 'erro caderno motivo atenção chute refazer refiz acertei',
    blocks: [
      ['steps', ['Na aba **Estudo**, escolha o **motivo** (falta de atenção, não sabia, confundi conceitos, falta de tempo, chutei, outro).', 'Escreva o que errou e como evitar e clique **＋ Erro**.', 'Marque **contar também como questão errada** para somar 1 questão feita sem acerto.']],
      ['ul', [
        'No **Painel de estudos** o caderno tem filtros (situação, motivo, banca, ano). Marque **✔ refiz e acertei** ou **✖ errei de novo** — tudo é desfazível.',
        'A **Revisão do dia** mostra "Seus erros neste tópico", e a **Tela inicial** avisa quantos erros ainda estão para refazer.',
      ]],
      ['tip', 'Refazer a questão errada é uma das melhores revisões. Use o filtro "para refazer".'],
    ] },
  { id: 'painel-estudos', group: 'Estudo', title: 'Painel de estudos', summary: 'Visão geral: prova, progresso, metas, revisões e pontos fracos.',
    keywords: 'painel dashboard progresso meta semanal agenda ics prova contagem regressiva plano relatório sequência pontos fracos',
    blocks: [
      ['p', 'Abra com **Ctrl+E** (ou o botão do gráfico na barra da esquerda).', { only: 'desktop' }],
      ['p', 'Abra pelo botão do gráfico na barra da esquerda ou pelo menu ☰ → **Painel de estudos**.', { only: 'touch' }],
      ['ul', [
        '**Prova**: defina a data e veja a contagem regressiva; o **plano** calcula quantos tópicos por dia faltam.',
        '**Progresso** geral e por disciplina, **tempo** hoje e nos últimos 7 dias, **sequência** de dias estudados e **acerto** em questões (por banca e por ano).',
        '**Metas semanais**: horas e/ou questões por semana, com barras dos últimos 7 dias.',
        '**Fila de revisões** com ✓/↻ rápidos, **pontos fracos** e **simulados** com gráfico de evolução.',
        '**Agenda (.ics)**: gera um evento por dia com revisões e a data da prova, para o Google Agenda/Outlook (reexportar não duplica).',
        '**Aviso diário**: ligue "Avisar das revisões do dia às" e escolha o horário (no máximo um aviso por dia, só se houver algo a dizer).',
        '**Relatório** em `.md`/`.docx`.',
      ]],
    ] },
  { id: 'revisao', group: 'Estudo', title: 'Revisão do dia', summary: 'Recordação ativa: tente lembrar antes de ver.',
    keywords: 'revisão do dia recordação ativa lembrei errei pular vencidas',
    blocks: [
      ['p', 'Abra em **Ctrl+Shift+R**, no botão do Painel de estudos ou na Tela inicial.', { only: 'desktop' }],
      ['p', 'Abra pelo menu ☰ → **Revisão do dia** ou pela Tela inicial.', { only: 'touch' }],
      ['steps', ['Aparece **só o título** do tópico vencido: tente lembrar o conteúdo de cabeça.', 'Toque em **Mostrar anotações** para conferir.', 'Responda **Lembrei** (a revisão avança no ciclo) ou **Errei** (volta ao início). **Pular** deixa para depois.']],
      ['keys', [['Espaço', 'mostrar anotações'], ['Y', 'lembrei'], ['N', 'errei'], ['S', 'pular']], { only: 'desktop' }],
      ['p', 'Cada resposta é um desfazer.'],
    ] },
  { id: 'simulados', group: 'Estudo', title: 'Simulados', summary: 'Registre provas completas e acompanhe a evolução.',
    keywords: 'simulado prova nota disciplina evolução média melhor',
    blocks: [
      ['steps', ['Na Tela inicial (ou no Painel de estudos) clique em **Registrar simulado**.', 'Informe nome, **banca**, data, duração e, por disciplina, as questões **feitas** e os **acertos** (o total aparece ao vivo).', 'Marque **somar às questões de cada disciplina** para alimentar o acerto e os pontos fracos.']],
      ['p', 'O Painel de estudos mostra o **gráfico de evolução**, a média, o melhor e o último (com ▲/▼), as **disciplinas mais fracas** e os últimos simulados (✕ apaga, desfazível).'],
    ] },
  { id: 'rede', group: 'Estudo', title: 'Rede de conhecimento', summary: 'O grafo dos seus tópicos e links, estilo Obsidian.',
    keywords: 'grafo rede conhecimento vault obsidian links vizinhança rótulos densidade',
    blocks: [
      ['p', 'Abra com **Ctrl+G** (ou o botão da rede na barra da esquerda).', { only: 'desktop' }],
      ['p', 'Abra pelo botão da rede na barra da esquerda ou por ☰ → **Rede de conhecimento**.', { only: 'touch' }],
      ['ul', [
        'Escolha ver **este mapa** ou o **vault** (vários mapas da biblioteca, com cores por mapa).',
        'Toque/clique num ponto para ver detalhes; **duplo clique** abre o tópico no mapa. Arraste os pontos para reorganizar.',
        'Use a **busca**, **Focar a seleção**, **Só vizinhança** e **Agrupar folhas** para lidar com mapas grandes; **Rótulos** e **Densidade** controlam o que aparece.',
        'O **tamanho** do ponto mostra quantas ligações ele tem; o **anel verde**, o progresso.',
        'Links sem destino viram pontos "fantasma" — dá para criar o tópico a partir deles.',
      ]],
    ] },
  { id: 'pdf', group: 'Estudo', title: 'Leitor de PDF ao lado do mapa', summary: 'Leia a apostila e capture trechos para o mapa.',
    keywords: 'pdf apostila ler capturar trecho citação fonte divisor localizar',
    blocks: [
      ['p', 'Abra com **Ctrl+Shift+P** ou pelo botão do PDF na barra da esquerda. A tela se divide: **PDF à esquerda, mapa à direita**. **Arraste o divisor** entre as áreas para ajustar a largura (a medida é lembrada).', { only: 'desktop' }],
      ['p', 'Abra pelo botão do PDF na barra da esquerda ou por ☰ → **Leitor de PDF**. A tela se divide: **PDF à esquerda, mapa à direita**.', { only: 'touch' }],
      ['ul', [
        '**Selecione um trecho** do PDF e use **＋ Tópico** (cria um filho do tópico selecionado, com o trecho nas notas e a fonte "PDF, p. N") ou **＋ Nota** (acrescenta o trecho como citação às notas). Cada ação é **um** desfazer.',
        'As **fontes** aparecem na aba Notas ("📖 PDF, p. N"): clicar abre o PDF na página.',
        'O leitor lembra a **página onde você parou**, tem busca no texto e zoom.',
        'O mapa guarda só o **caminho** do PDF. Se o arquivo mudou de lugar, use **Localizar o PDF…** — as fontes são preservadas.',
        'PDF com senha ou só com imagem abre com aviso (sem texto não há o que selecionar).',
      ]],
    ] },

  // ------------------------------------------------------------------ sincronização / tablet
  { id: 'sincronizacao', group: 'Arquivos e dados', title: 'Sincronização opcional', summary: 'Mesma biblioteca no computador e no tablet.',
    keywords: 'sincronizar google drive pasta nuvem tablet computador código',
    blocks: [
      ['p', 'Vem **desligada**: nada roda até você ligar em **Arquivo → Sincronização (opcional)…** (no tablet: ☰ → Estudo → Sincronização).'],
      ['ul', [
        '**Pasta** (só no computador): qualquer pasta que outro programa já espelha (Google Drive para computador, OneDrive, Dropbox, pendrive).',
        '**Google Drive** (computador e tablet): entre com um **código** (você o digita em google.com/device). O MindCraft só enxerga a pasta "MindCraft" que ele mesmo cria.',
      ]],
      ['warn', 'Regras de segurança: a sincronização **nunca apaga** nada. Se o mesmo mapa mudou nos dois lados, **as duas versões ficam** (a do outro aparelho entra como cópia). Sincroniza os **mapas**, não as configurações.'],
    ] },
  { id: 'tablet', group: 'Tablet', title: 'Usando no tablet', summary: 'Gestos, barra flutuante e painéis.',
    keywords: 'tablet toque gesto pinça toque longo barra flutuante painéis gaveta voltar',
    blocks: [
      ['ul', [
        '**Tocar** = clicar · **duplo toque** = editar o título · **toque longo** = somar à seleção · **arrastar** no vazio = mover o mapa · **pinça** = zoom.',
        '**Barra flutuante**: ☰ (menu com todos os comandos), ✎ editar, ⊟/⊞ recolher/expandir o ramo, ▲▼◀▶ reordenar, ☷ abrir/fechar os painéis (Estilo, Estudo, Notas, Conexões, Estrutura).',
        'O botão **Voltar** do Android fecha a janela aberta, a tela inicial ou os painéis; na tela principal o app vai para o segundo plano (não fecha).',
        '**Notificações**: o aviso diário de revisões funciona mesmo com o app fechado (sem pedir "alarme exato").',
      ], { only: 'touch' }],
      ['p', 'A mesma interface roda no **tablet Android** (APK). No tablet há: toque, barra flutuante, gaveta de painéis, janela de "Salvar como" com seletor de arquivos do sistema, compartilhar pacotes e notificações. Esta seção é detalhada no próprio tablet (menu ☰ → Manual de uso).', { only: 'desktop' }],
    ] },
  { id: 'atalhos', group: 'Referência', title: 'Atalhos do teclado', summary: 'Lista completa (também em F1).',
    keywords: 'atalhos teclado f1 ctrl alt',
    blocks: [
      ['keys', [
        ['Tab / Enter / F2 / Delete', 'filho / irmão / editar / excluir'], ['Espaço', 'recolher/expandir ramo'], ['Alt+↑ ↓ ← →', 'mover entre irmãos / mudar de nível'], ['R', 'relação entre tópicos'],
        ['Ctrl+Z / Ctrl+Y', 'desfazer / refazer'], ['Ctrl+C / X / V', 'copiar, recortar, colar'], ['Ctrl+F · Ctrl+0 · F5', 'buscar · ajustar à tela · apresentar'],
        ['Ctrl+E · Ctrl+G · Ctrl+Shift+R', 'painel de estudos · rede · revisão do dia'], ['Ctrl+\\', 'recolher/expandir o painel lateral'], ['Ctrl+Shift+B · Ctrl+Shift+P · Ctrl+Shift+H', 'biblioteca · PDF · tela inicial'],
        ['Ctrl+N / O / S · Ctrl+Shift+S', 'novo, abrir, salvar · salvar como'], ['F1', 'janela de atalhos'],
      ], { only: 'desktop' }],
      ['p', 'No tablet os comandos ficam no menu ☰ e na barra flutuante. Com teclado físico conectado, os mesmos atalhos do computador valem.', { only: 'touch' }],
    ] },
  { id: 'seguranca-dados', group: 'Referência', title: 'Segurança dos seus dados', summary: 'Como o app evita perder o seu trabalho.',
    keywords: 'dados segurança backup perder cópia atômica rascunho lixeira versões restaurar',
    blocks: [
      ['ul', [
        '**Gravação atômica**: o arquivo só é trocado depois de gravado por inteiro.',
        '**Cópia antes de sobrescrever** e **versões** na biblioteca (até 30 por mapa); a **lixeira** guarda o que você excluiu.',
        '**Rascunho automático** após uma queda e **aviso** ao fechar com alterações pendentes.',
        'Ações em lote (importar planilha, capturar do PDF, mover vários) são **um desfazer**.',
        'A sincronização **nunca apaga** nada.',
      ]],
      ['p', '**Aviso de cópia de segurança**: na **Tela inicial** aparece o aviso "Faça uma cópia de segurança" quando você ainda não fez nenhuma ou já passou o intervalo. **Fazer cópia agora** gera o pacote `.mcpack` (todos os mapas e as configurações) e pergunta onde salvar; **Lembrar depois** esconde o aviso por 3 dias. No rodapé da Tela inicial escolha o intervalo (**7, 14 ou 30 dias, ou nunca**) e veja a data da última cópia.'],
      ['p', '**Restaurar cópia** (Tela inicial): escolha um pacote `.mcpack` e os mapas voltam para a biblioteca. **Nunca sobrescreve**: se um mapa já existir e for diferente, o do pacote entra como **cópia**; o que já está igual é ignorado. As configurações do pacote também são restauradas.'],
      ['p', '**Tablet — destino lembrado**: na primeira cópia o Android abre o seletor de arquivos (você escolhe a pasta e o nome, por exemplo no Google Drive ou no cartão SD). '
        + 'Depois disso, **Fazer cópia agora** grava **direto nesse arquivo**, sem perguntar, e a Tela inicial mostra **"Cópias vão para: …"** com **trocar local**. '
        + 'Se o Android recusar a gravação (permissão perdida), o app avisa, esquece o destino e pergunta de novo — o aviso de cópia só some quando uma cópia é concluída. '
        + 'O arquivo é substituído a cada cópia: se quiser guardar versões, troque o local de vez em quando.', { only: 'touch' }],
      ['warn', 'Guarde o pacote **fora do aparelho** (nuvem, pendrive, outro computador): é o que protege você se o aparelho quebrar ou for formatado. O aviso só some quando a cópia é gerada — **cancelar** o diálogo não conta.'],
    ] },
];

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const kindOk = (block, host) => { const o = block[2]; return !o || !o.only || o.only === host; };
const textOf = (block) => (block[0] === 'ul' || block[0] === 'steps' ? block[1].join(' ') : block[0] === 'keys' ? block[1].map((r) => r.join(' ')).join(' ') : block[1]);

/** Seções com os blocos válidos para o aparelho ('desktop' | 'touch'); seções que ficariam sem conteúdo são omitidas. */
function sections(host = 'desktop') {
  return SECTIONS.map((s) => ({ ...s, blocks: s.blocks.filter((b) => kindOk(b, host)) })).filter((s) => s.blocks.length);
}

/** Busca (sem caixa nem acentos); devolve as seções ordenadas por relevância: título > palavras-chave/resumo > texto. */
function search(query, host = 'desktop') {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (!words.length) return sections(host);
  const out = [];
  for (const s of sections(host)) {
    const title = norm(s.title), meta = norm(s.summary + ' ' + s.keywords), body = norm(s.blocks.map(textOf).join(' '));
    let score = 0, all = true;
    for (const w of words) {
      const hit = title.includes(w) ? 6 : meta.includes(w) ? 3 : body.includes(w) ? 1 : 0;
      if (!hit) { all = false; break; }
      score += hit;
    }
    if (all) out.push({ s, score });
  }
  return out.sort((a, b) => b.score - a.score || SECTIONS.indexOf(a.s) - SECTIONS.indexOf(b.s)).map((x) => x.s);
}

const find = (id, host = 'desktop') => sections(host).find((s) => s.id === id) || null;
const groups = (host = 'desktop') => { const g = []; for (const s of sections(host)) { let e = g.find((x) => x.name === s.group); if (!e) g.push(e = { name: s.group, items: [] }); e.items.push(s); } return g; };

module.exports = { SECTIONS, sections, search, find, groups };
