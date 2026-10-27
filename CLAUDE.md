# MindCraft — guia para quem (pessoa ou IA) vai evoluir o projeto

App de **mapas mentais + gestão de estudos para concursos**. Desktop (Electron) e **tablet Android** (a MESMA interface, emulando o Electron na web, empacotada com Capacitor). Formato de arquivo compatível com o Mindomo (`.mom`). Interface e mensagens em **português do Brasil**.

## Regras de ouro (vieram do dono do projeto; não negocie)
1. **Nunca perder dados.** Gravação atômica (temporário + renomear), transação no banco, versão antes de sobrescrever, lixeira, nada é apagado sem confirmação. Em sincronização: **nunca apagar nada**.
2. **Só mudanças seguras e provadas por teste.** Teste real (entrada real, não só unitário), com evidência (captura em `docs/evidencias/`). Se mudou algo que o usuário vê, olhe a captura.
3. **Diga o que NÃO foi testado.** Sem exagero: se algo só foi provado contra um dublê (ex.: Google Drive falso), diga.
4. **Desktop e tablet funcionam juntos.** Mudança no desktop precisa continuar valendo no tablet (`npm run test:web`, `e2e-tablet`).
5. **Responda sempre em português.** Mensagens de erro para o usuário em pt-BR, claras e acionáveis.

## Comandos
| Para… | Comando |
|---|---|
| Rodar o app | `npm start` |
| Qualidade rápida (lint + unitários desktop + paridade web) | `npm run check` |
| Unitários / paridade com o núcleo do tablet | `npm test` / `npm run test:web` |
| Ponta a ponta (41 etapas, ~10 min, **desligue o emulador Android antes**; logs por etapa em `evidencias/logs/e2e/`) | `npm run e2e` |
| QA com mouse/teclado reais (82 casos) | `npm run qa` |
| Gerar capturas de evidência | `npm run evidence` |
| Montar o app web / tablet | `npm run build:web-app` · `cd tablet && npm run sync` |
| Bateria no Android (emulador, 21 testes, em blocos, ~12 min) | `cd tablet && node scripts/emulator.js` e depois `npm run android` (na raiz) |
| Instalador Windows | `CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --win --publish never` |
| APK assinado | `node tablet/scripts/release.js` |

Detalhes: `docs/TESTING.md`. Receitas passo a passo: `.claude/skills/` (release, verificar, novo módulo do núcleo, mudança de interface, teste Android, provedor de sincronização).

## Arquitetura em 30 segundos (completo em `docs/ARCHITECTURE.md`)
```
core/        Regras de negócio PURAS (CommonJS, sem Electron/DOM). Roda no Node E no navegador.   ← onde a lógica nova deve nascer
electron/    Processo principal do desktop (janela, menus, diálogos, notificações) — fino.
renderer/    Interface: scripts clássicos (escopo global compartilhado) + React por "fatias" (renderer/react). layout-ui.js = painel lateral recolhível e divisores.
platform/web Emula o Electron/Node na web: fs virtual (IndexedDB), SQLite (sql.js), zip, ipc, toque, notificações nativas.
tablet/      Projeto Capacitor (Android) + scripts de build/teste do APK.
tools/       Montadores (bundle React, núcleo web, app web).
test/        unitários (*.test.js) · e2e (e2e-*.js, Electron real) · QA (qa-tour.js) · harness.
```
Dependências só **para baixo**: `renderer → core`, `platform → core`, `electron → core`. `core` nunca importa nada de cima (teste de arquitetura garante).

## Armadilhas que já custaram caro (leia antes de mexer)
- **Módulo novo em `core/` precisa entrar em `MODULES` (`tools/build-web-core.js`)**, senão o app **quebra no tablet** ("Módulo indisponível"). `test/architecture.test.js` pega isso.
- Os scripts de `renderer/*.js` compartilham **um único escopo global** (`map`, `selectedId`, `pan`, `render`…). A camada `platform/` NÃO lê essas variáveis: usa a fachada **`window.MCView`** (fim de `renderer.js`).
- **Todo texto do usuário que vira HTML/SVG passa por `escapeHtml` (`core/text.js`).** Nunca interpole título/nota crua.
- `.mom` do Mindomo tem formatação própria: lida em `core/mindomo.js` na LEITURA; o original fica em `_mom`/`_momDoc`/`_momThemes` e é regravado intacto. Não "normalize" o que o MindCraft não entende.
- **Emulador Android ligado derruba testes do desktop** (CPU/GPU): desligue (`adb emu kill`) antes de `npm run e2e`/`qa`; ligue só para a bateria Android. Não rode nada em paralelo à bateria Android.
- `hashOf` (sincronização) usa a forma NORMALIZADA `readMom(writeMom(mapa))`: a 1ª ida e volta pelo `.mom` acrescenta campos internos.
- `viewport-fit=cover` faz o Capacitor deixar o app **sob** as barras do Android: não use. Responsividade da rede usa **container query** (largura da própria rede), não a da janela.
- PowerShell: sleeps longos são bloqueados (use laços de espera com limite); em scripts geradores evite crases aninhadas (use arquivos); `adb input text` depende do Gboard.
- **Divisores/Pointer Events**: sendInputEvent de mouse nos testes precisa de `modifiers: ['leftButtonDown']` em mouseDown/mouseMove, senão o Chromium não considera o botão apertado. O botão ‹ › fica no MEIO do divisor do painel: nos testes clique/arraste mais embaixo (`cy + 90`).
- Esc com uma janela aberta sobre o Painel de estudos é da janela (study-ui.js confere `#modal`).
- **Executores** (`tools/run-e2e.js`, `tablet/scripts/run-android.js`): saída em ARQUIVO, nunca em pipe (um pipe preso por processo-filho travava a bateria para sempre), 1 repetição que fica registrada como INSTÁVEL, limite de tempo por etapa. Processo iniciado numa chamada de ferramenta pode morrer quando ela termina: rode em segundo plano com `Start-Process` e consulte o log.
- **Seletor de arquivos do Android**: `accept` com extensão desconhecida (.mcpack, .mom) deixa o arquivo APAGADO (impossível escolher). No aparelho nativo o seletor mostra tudo e a extensão é conferida depois (`chooseInto` em `platform/web/host/ipc.js`). Para CRIAR arquivo (`pick`), MIME `application/zip` faz o Android acrescentar `.zip` ao nome: use `application/octet-stream`.
- **Nunca** apague uma pasta que contenha junction/symlink para `node_modules` (ver memória `junction-delete-danger`).
- Select nativo (`#qBanca`) não aceita texto arbitrário: use `setQBanca('…')` em testes.

## Convenções
- Comentários e mensagens em português, explicando **por quê** (não o quê). Funções curtas; ≤ ~160 colunas em código novo (há trechos antigos mais longos; o teto duro é 450).
- Limites de tamanho de arquivo (testados): `core` ≤ 600 linhas, `renderer/*.js` ≤ 1000, `renderer/react` ≤ 500, `electron` ≤ 400. Passou? Extraia uma responsabilidade.
- Erros esperados do usuário viram mensagem pt-BR; erros inesperados vão para o log (`core/errorlog.js`) e nunca derrubam o app.
- Antes de commit: `npm run check`. Commit termina com a linha `Co-Authored-By` (ver `docs/CONTRIBUTING.md`). Nunca versionar `tablet/keystore`, `node_modules`, `dist`, `_extracted`, `*.apk`, `*.exe`.

## Estrutura-alvo e próximas tarefas
- **Estrutura-alvo** (definida pelo dono): `src/main` (index, ipc-handlers, preload, services) · `src/renderer` (components, features/*, layouts, pages, routes, store) · `src/shared` (types, constants) · TypeScript + Vite. **Ainda NÃO migrado**; plano em 6 fases em `docs/ARCHITECTURE.md` §7 (ADR 016). Código novo deve já ser escrito pensando nela (lógica pura em módulos independentes; nada de estado global novo; canais IPC/constantes centralizados).
- **Já feito na v0.4.0**: manual de uso (Ajuda; `core/manual.js` — toda funcionalidade nova ganha seção, o teste de cobertura exige), painel lateral recolhível + divisores arrastáveis (`renderer/layout-ui.js`), lembrete de cópia de segurança e "Seu estudo" na tela inicial (`core/backup-reminder.js`, `core/glance.js`).

## Onde está cada decisão
`docs/DECISIONS.md` (ADRs curtas). Roadmap/ideias: `SUGESTOES.md` (parte já feita; releia antes de propor).
