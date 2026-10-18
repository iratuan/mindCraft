# Decisões de arquitetura (ADRs curtas)

Formato: **Decisão** · Por quê · Consequências/como reverter.

**001 — Núcleo puro e portável (`core/`).** Regras de negócio sem Electron/DOM, em CommonJS. · Permite o mesmo código no desktop e no tablet e testes rápidos. · Qualquer I/O entra por parâmetro; teste de arquitetura vigia.

**002 — Tablet = a mesma interface emulando o Electron na web (`platform/web/host`).** Em vez de reescrever a UI. · ~2.800 linhas de interface reaproveitadas; desktop intocado. · Custo: manter a emulação (21 canais IPC, fs virtual); a paridade é testada (`test:web`, `e2e-web`). Reverter: reescrever a UI por fatias React (já em curso).

**003 — Compatibilidade com `.mom` do Mindomo.** Campos desconhecidos preservados; extensões em `mc*`. · O usuário migra sem perder nada e pode voltar. · Nunca "limpar" o que não entendemos; regravar `themes.json` e `description` originais.

**004 — Biblioteca SQLite com tabelas derivadas.** Fonte da verdade = colunas + `study_json`; consultas rápidas = tabelas refeitas a cada gravação. · Painéis agregados sem recalcular tudo. · Migrações versionadas (`user_version`), cópia `.bak` antes de migrar.

**005 — Nunca perder dados.** Gravação atômica, transação com releitura (`verify`), versões automáticas, lixeira, e no sync "nunca apagar" e "conflito = manter as duas". · Regra de ouro do dono do projeto. · Custo: o remoto cresce (versões antigas ficam); aposentar em `old/` é evolução futura, nunca apagar.

**006 — Sincronização com nome de arquivo = carimbo + hash do conteúdo normalizado.** `maps/<id>.<ts13>.<hash16>.mom`. · `list()` já revela o que mudou; gravar nunca sobrescreve; sem arquivo de índice (sem corrida entre aparelhos); relógio atrasado não faz edição "sumir" (carimbo monotônico). · Hash normalizado porque a ida e volta pelo `.mom` acrescenta campos na 1ª vez.

**007 — Login do Google por fluxo de dispositivo (código).** · Funciona igual no Windows e no Android, sem redirecionamento nem plugin de navegador. · Exige "ID do cliente" tipo "TVs e dispositivos de entrada limitada" e app **publicado** (senão o login vence em 7 dias). · Rede abstraída em `http({method,url,headers,body,binary})`: `net-node` (desktop) e `host/net.js` (CapacitorHttp nativo no Android).

**008 — Escopo mínimo do Drive: `drive.file`.** O app só enxerga a pasta que ele criou. · Menor risco, sem verificação do Google. · Não lê arquivos do usuário fora da pasta "MindCraft".

**009 — Formatação do Mindomo traduzida na leitura (`core/mindomo.js`).** Tema → `meta.customTheme`; estilo por tópico → `node.style`; notas HTML → Markdown. Tabelas de formas/preenchimento extraídas do código do próprio Mindomo. · Fidelidade visual sem mudar o formato. · Não reproduzidos: ícones, imagens, anexos, formas especiais, degradês (cor do meio), formatação em trechos do título.

**010 — Rede de conhecimento: layout por componentes + rótulos em lógica pura.** `forcelayout` empacota componentes; `graph-labels` posiciona rótulos (4 posições, grade espacial, orçamento por densidade). · Legibilidade e testabilidade sem DOM. · Parâmetros de densidade em `DENS` (graph-ui).

**011 — Responsividade por container query.** A rede mede a própria largura (o painel de Estudo ocupa espaço). · Funciona em janela dividida, retrato e paisagem. · Chromium ≥ 105 (Electron 44 e WebView atual).

**012 — Área segura do Android: sem `viewport-fit=cover`.** O Capacitor reserva as barras; fundo da janela e ícones das barras combinam com o app. · Comportamento igual em qualquer versão de WebView. · Verificado por `dumpsys window` + `uiautomator` (gestos, 3 botões, recorte).

**013 — Fachada `window.MCView`.** A plataforma não lê variáveis globais da interface. · Desacopla toque/teclado virtual de `renderer.js`. · Ampliar a fachada em vez de ler globais.

**016 — Estrutura-alvo `src/{main,renderer,shared}` em TypeScript (decidida em 17/10/2026).** O dono do projeto definiu a organização final (ver ARCHITECTURE §7). · Padrão conhecido do ecossistema Electron+React, separa processo principal, interface e domínio compartilhado, e viabiliza `window.api` tipada com contextIsolation. · A migração é FASEADA (6 fases) e nunca "big bang"; o tablet continua reaproveitando `shared`. Não iniciada: depende de priorização (próximas tarefas: recolher painel direito e redimensionar a divisão PDF/mapa vêm antes).

**015 — "Salvar como" do tablet com o seletor de documentos do Android (SAF).** Plugin nativo mínimo `SaveFilePlugin` (`pick` = ACTION_CREATE_DOCUMENT; `write` = grava no URI, modo `wt`, permissão persistente). O app grava SEMPRE uma cópia no armazenamento do app e, para destino externo, **espelha** os bytes a cada gravação (`targets.json`: `mirror` para `.mom`, `once` para exportações). · O usuário escolhe nome e pasta no seletor do sistema (inclusive Drive) sem o app pedir permissão ampla de armazenamento; falha de gravação nunca perde dados (a cópia no app fica). · Só Android; no navegador vale "Documentos" e "Baixar".

**014 — Testes de arquitetura e lint como parte do `npm test`/`npm run check`.** Regras viram falhas automáticas (defeitos reais: módulo fora do pacote web; canal sem tratador). · Evolução segura por qualquer pessoa/IA.
