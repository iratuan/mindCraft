# Arquitetura do MindCraft

## 1. Visão geral

```
┌──────────────────────────── interface (renderer/) ─────────────────────────────┐
│  scripts clássicos (escopo global compartilhado)      React por fatias          │
│  renderer.js · study-ui · graph-ui · notes-ui         renderer/react/*.jsx      │
│  library-ui · sync-ui · react-bridge                  (Dashboard, Home, PDF…)   │
└───────────────┬───────────────────────────────────────────────┬─────────────────┘
                │ require(core/…)                               │ ipcRenderer.invoke/send
┌───────────────▼─────────────┐              ┌──────────────────▼───────────────────┐
│  core/  (regras PURAS)      │              │ canal de comunicação ("host")        │
│  modelo, estudo, .mom,      │              │  desktop: electron/main.js           │
│  biblioteca SQLite, sync,   │              │  tablet : platform/web/host/ipc.js   │
│  grafo, layout, relatórios  │              │           (emula Electron na web)    │
└───────────────▲─────────────┘              └──────────────────────────────────────┘
                │ mesmo código, outro "encanamento"
┌───────────────┴──────────────── platform/web ─────────────────────────────────┐
│ fs virtual (IndexedDB) · SQLite (sql.js/WASM) · zip (fflate) · SHA (JS) · Buffer│
│ toque · teclado virtual · notificações/Voltar/Compartilhar (Capacitor) · rede   │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Ideia central:** a lógica vive em `core/` (CommonJS puro). O desktop a usa direto (Node); o tablet a usa empacotada pelo esbuild (`core-browser.js`) com adaptadores que imitam `fs`, `node:sqlite`, `adm-zip`, `crypto`. A interface é uma só; no tablet o "hospedeiro" (`platform/web/host`) finge ser o Electron (`require`, `ipcRenderer` com os mesmos canais).

## 2. Camadas e regras de dependência

| Camada | Pasta | Pode depender de | NÃO pode |
|---|---|---|---|
| Núcleo | `core/` | só de si mesmo e de módulos Node (`fs`, `path`, `crypto`) | Electron, DOM, `renderer/`, `platform/`, `electron/` |
| Interface | `renderer/` | `core/`, canais IPC | `electron/` direto, `platform/` |
| Desktop | `electron/` | `core/` | `renderer/` |
| Plataforma web | `platform/web/` | `core/`, DOM, Capacitor | variáveis globais da interface (use `window.MCView`) |
| Testes/ferramentas | `test/`, `tools/`, `tablet/scripts` | tudo | — |

Verificadas por `test/architecture.test.js` (sem ciclos em `core/`, sem DOM/Electron no núcleo, todo módulo do núcleo no pacote web, todo canal tratado nos dois hospedeiros, orçamento de tamanho).

## 3. Módulos do núcleo (`core/`) por responsabilidade

| Grupo | Módulos | Papel |
|---|---|---|
| Modelo | `model`, `markers`, `themes`, `layout`, `svg`, `graph-labels` | árvore de tópicos, estilos, desenho (SVG puro), posicionamento de rótulos |
| Formatos | `mom`, `mindomo`, `import`, `csv`, `edital`, `markdown`, `export`, `ics`, `obsidian`, `vault` | ler/gravar `.mom` (compatível), formatação do Mindomo, importações/exportações |
| Estudo | `study`, `planner`, `simulados`, `bancas`, `report`, `notify`, `settings` | revisão espaçada, questões por banca/ano, erros, metas, simulados, relatórios, aviso diário |
| Dados | `library`, `backup`, `errorlog`, `pdfrefs` | biblioteca SQLite (transações, versões, lixeira), cópias, log |
| Rede de conhecimento | `links`, `mentions`, `graph`, `forcelayout`, `graph-labels` | links `[[…]]`, grafo, layout por componentes, rótulos |
| Sincronização | `sync` (motor), `sync-folder`, `sync-drive`, `oauth-device`, `net-node` | decide o que enviar/receber; provedores; login por código |
| Utilitários | `text` (`escapeHtml`) | segurança de texto compartilhada |

Módulos "mais dependidos" (mudar com cuidado): `study`, `model`, `links`, `markers`.

## 4. Fluxos importantes

**Salvar na biblioteca:** UI → `library.saveMap(map,{verify:true})` → transação (`BEGIN IMMEDIATE`) → grava árvore + tabelas derivadas → relê e compara (`canonical`) → só então `COMMIT`; versão automática (≥10 min) antes de sobrescrever.

**Abrir `.mom` do Mindomo:** `mom.readMom` valida (ids seguros, limites, ciclos) → `mindomo.convertTheme/convertNodeStyle/htmlToMarkdown` traduzem tema, estilo e notas → o original é preservado (`_mom`, `_momDoc`, `_momThemes`) → `writeMom` regrava tudo (incluindo `themes.json`).

**Sincronizar:** `sync.syncLibrary(lib, remote, state)`: nome remoto `maps/<id>.<carimbo13>.<hash16>.mom` (hash do conteúdo normalizado) → por mapa decide *igual / só local mudou / só remoto mudou / ambos mudaram* → conflito mantém **as duas versões**; nunca apaga. Provedor = `{list, read, write}`.

**Rede de conhecimento:** `graph.buildGraph` (nós/arestas) → `forcelayout` (componentes + empacotamento) → `graph-ui` desenha SVG → `graph-labels.placeLabels` (puro) posiciona rótulos → CSS por container query adapta ao espaço.

**Tablet:** `tools/build-web-app.js` gera `build/web/app` a partir do `renderer/index.html` do desktop → `tablet` (Capacitor) empacota → o WebView carrega, `platform/web/host/index.js` instala o Electron falso e a ponte de toque.

## 5. Formatos e armazenamento

- **`.mom`** (zip): `document.json`, `nodes.json`, `themes.json`, … Extensões do MindCraft em `mc` (por tópico) e `mc*` (no documento: `mcTheme`, `mcCustomTheme`, `mcExam`, `mcRelations`, `mcGoals`, `mcSimulados`, `mcPdfs`, `mcWriter`). Campos desconhecidos são preservados.
- **`.mcpack`** (zip): `manifest.json` (+SHA-256 de cada item) + `maps/<id>.mom` + `settings.json` opcional.
- **Biblioteca** `biblioteca.db` (SQLite, migrações em `library.js`): `maps`, `topics`, tabelas **derivadas** (`study_log`, `qlog`, `qsrc`, `qerr`, `relations`) refeitas a cada gravação, `snapshots`.
- **Configuração**: `config.json`, `sync.json` (userData; no tablet, o arquivo virtual no IndexedDB).

## 6. Estratégia de teste (resumo; ver `TESTING.md`)
Unitários do núcleo (rápidos, rodam também contra o núcleo web = **paridade**) → e2e no Electron real → QA com entrada real → bateria no Android. Defeitos pegos na prática: ver `docs/DECISIONS.md` e `evidencias/RESULTADOS.md`.

## 6.1 Novidades da v0.4.0 (onde mora cada coisa)
- **Manual** — `core/manual.js` (conteúdo em dados puros + busca; texto por aparelho: `only: 'desktop'|'touch'`) · `renderer/react/ManualModal.jsx` (janela) · `act.manual(secao)` e o clique global em `[data-manual]` ("Como usar?") em `react-bridge.js`. Regra de manutenção: **funcionalidade nova ⇒ seção no manual** (`test/manual.test.js` confere a cobertura e se todo `data-manual` aponta para uma seção).
- **Layout** — `renderer/layout-ui.js`: recolher o painel lateral (botão ‹ ›, Ctrl+\\, menu Exibir) e divisores arrastáveis (Pointer Events: mouse, dedo, caneta; teclado; duplo clique restaura). Estado em `config.json` (`panelsCollapsed`, `panelsWidth`, `pdfWidth`; locais, não vão no pacote). A largura do painel é a variável CSS `--panels-w` (as regras por tamanho de janela continuam sendo o padrão). Em modo gaveta (tablet < 1000 px) o recolher/divisor não existe.
- **Tela inicial** — `core/backup-reminder.js` (regra do lembrete: nunca fez / passou de 7·14·30 dias / adiado 3 dias) e `core/glance.js` ("Seu estudo": sequência, 7 dias, acerto, metas, disciplina mais atrasada; fonte = biblioteca inteira ou, sem ela, o mapa aberto). `homeData()`/`homeActions` em `react-bridge.js` ligam as regras à tela (`Home.jsx`). `exportPackQuick`/`importPackQuick` são a ÚNICA implementação de exportar/restaurar pacote (a janela da biblioteca também as usa). Restaurar nunca sobrescreve (conflito vira cópia).

## 7. ESTRUTURA-ALVO (definida pelo dono do projeto — 17/10/2026)

O projeto deve convergir para a organização padrão Electron + React + TypeScript abaixo. **Hoje** ele ainda está na estrutura anterior (`core/`, `electron/`, `renderer/`, `platform/`); a migração é **faseada e guiada por testes** (nunca "big bang": regra de ouro = nunca perder dados, só mudanças seguras).

```
src/
├── main/                  # PROCESSO PRINCIPAL (Electron / Node)
│   ├── index.ts           # app.whenReady, BrowserWindow, menus            ← hoje: electron/main.js
│   ├── ipc-handlers.ts    # registro centralizado dos canais IPC            ← hoje: ipcMain.handle(...) espalhados em main.js
│   ├── preload.ts         # contextBridge: expõe window.api tipada         ← NOVO (hoje a UI usa nodeIntegration)
│   └── services/          # regras que tocam disco/banco: library (SQLite), backup, vault, sync-folder/drive   ← hoje: parte de core/
├── renderer/              # FRONTEND React
│   ├── components/ · layouts/ · pages/ · routes/ · store/ · App.tsx · main.tsx
│   └── features/<nome>/{components,hooks,services}   # home, study, library, graph, notes, canvas, pdf, sync, settings   ← hoje: renderer/*.js + renderer/react/*.jsx
└── shared/                # CÓDIGO COMPARTILHADO (main + renderer + tablet)
    ├── types/             # tipos de dados e payloads IPC (MindMap, Topic, Study, SyncState…)
    └── constants/         # nomes de canais IPC, limites, bancas              ← hoje: espalhados (ex.: core/bancas.js)
assets/ · release/ · .erb/ (build) · package.json · tsconfig.json · vite.config.ts
```

**Mapa de migração do que existe** (a lógica pura continua pura e portável; o tablet continua reaproveitando-a):

| Hoje | Alvo |
|---|---|
| `core/` puro (model, study, layout, svg, graph, graph-labels, markdown, themes, mindomo, mom, csv, ics, text, bancas…) | `src/shared/` (domínio + tipos), sem Node/Electron — **continua rodando no navegador/tablet** |
| `core/` com disco/banco/rede (library, backup, errorlog, vault, obsidian, sync*, net-node) | `src/main/services/` (desktop). No tablet, a mesma interface é implementada por adaptadores (hoje `platform/web`) |
| `electron/main.js` | `src/main/{index,ipc-handlers,preload}.ts` + canais em `src/shared/constants/ipc.ts` |
| `renderer/*.js` (clássicos) + `renderer/react/*.jsx` | `src/renderer/features/*` (React + hooks + store), migrando por fatias |
| `platform/web/host` (emulação do Electron) | implementação web da MESMA `window.api` (sem emular `require`) |
| `test/` | espelha `src/` (unit ao lado do código; e2e em `test/e2e`) |

**Fases (cada uma termina com a bateria inteira verde e o app entregável):**
1. **Tipos e constantes** — canais IPC viram constantes compartilhadas; tipos do domínio em JSDoc/`.d.ts` com `checkJs` (sem mudar comportamento). Baixo risco.
2. **Ferramentas** — TypeScript + Vite (renderer) e tsc (main); migrar `tools/` para o novo build; manter `npm run check`.
3. **`src/shared`** — mover o núcleo puro para `src/shared` (módulo a módulo, com seu teste) e convertê-lo para `.ts`; `MODULES` do tablet passa a ler a pasta.
4. **`window.api` (preload + contextBridge)** — a UI deixa de usar `require`/nodeIntegration; tablet implementa a mesma API. Maior risco de segurança/compatibilidade: exige paridade completa (`e2e-web`, `e2e-tablet`, Android).
5. **Features em React** — migrar o que resta do clássico (canvas do mapa, painéis, busca, apresentação) para `features/*`, uma por vez; ao final remover `renderer/*.js`.
6. **`src/main/services`** — mover `library/sync/backup` e reorganizar `electron/`.

O teste de arquitetura (`test/architecture.test.js`) deve ser **atualizado a cada fase** para vigiar o novo layout (camadas, ciclos, orçamento de tamanho, pacote do tablet). Ver ADR 016.

## 8. Dívidas técnicas conhecidas (priorizadas)
1. **`renderer/renderer.js` (~900 linhas) concentra estado global** (`map`, `pan`, `selectedId`, `dirty`…). Caminho já em curso: migrar por fatias para React (ver `react-bridge.js`) e expor a plataforma só por `window.MCView`. Próximos candidatos: barra de ferramentas/opções, busca, apresentação.
2. **Interface clássica sem módulos** (scripts em sequência): a ordem em `index.html` importa; o teste de arquitetura vigia o básico. Migrar para módulos ES quando o último trecho clássico sair.
3. **`study-ui.js` e `graph-ui.js` misturam desenho, eventos e estado.** `graph-labels.js` foi o primeiro pedaço puro extraído; próximos: visibilidade de nós (`nodeVisible`) e navegação por setas (`stepSelection`) → `core/graph-view.js`.
4. **Duplicação nos testes e2e**: cada arquivo redefine `click/setVal/type`. Extrair `test/helpers.js` (sem mexer nos existentes de uma vez).
5. **Linhas longas** em `graph-ui.js`, `study-ui.js`, `Dashboard.jsx` (teto duro 450 colunas já vigiado). Formatar com Prettier só junto de uma fatia migrada.
6. **Sincronização**: só mapas (não configurações); Google Drive nunca exercitado contra o Google real.
7. Armazenamento do WebView não é "persistente" no Android: considerar espelho nativo.
