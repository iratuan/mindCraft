---
name: mindcraft-ui-change
description: Orienta mudanças na interface do MindCraft (classica em renderer/*.js, React em renderer/react, tablet) sem quebrar desktop nem tablet - onde mexer, fachada MCView, menus, opções, responsividade e como testar. Use ao adicionar/alterar telas, botões, opções ou comportamento de toque.
---

# Mudança de interface

## Mapa
- **Clássica** (`renderer/renderer.js`, `study-ui.js`, `graph-ui.js`, `notes-ui.js`, `library-ui.js`, `sync-ui.js`, `react-bridge.js`): scripts em sequência (ordem em `index.html`) que **compartilham o escopo global** (`map`, `selectedId`, `pan`, `render`, `act`, `saveCfg`…). Estado global novo = último recurso.
- **React** (`renderer/react/*.jsx`): fatias migradas (Home, Dashboard, Biblioteca, CSV, Plano, Simulado, PDF…). Empacotado por `npm run build:ui` (`renderer/bundle/react-ui.js`, ignorado pelo lint). **A interface padrão é a React**; a clássica é a referência (`--classic` nos testes).
- **Plataforma** (`platform/web/host/*`): toque, teclado virtual, menu ☰, notificações. Só fala com a interface pela fachada **`window.MCView`** (fim de `renderer.js`) e pelos canais IPC.

## Regras
1. **Nova ação** = `act.<nome>` (aparece no menu `electron/main.js` com `send('<nome>')` **e** em `platform/web/host/menu.js`).
2. **Novo canal IPC** = tratar em `electron/main.js` **e** `platform/web/host/ipc.js` (o teste de arquitetura cobra).
3. **Nova opção persistente** = `loadCfg()/saveCfg()`; se for "configuração portátil", entra em `core/settings.js` (vai no `.mcpack`).
4. **Texto do usuário** → `textContent`/`el(tag, classe, texto)`; HTML só com `escapeHtml`.
5. **Responsivo**: meça o **espaço da própria tela** (`@container`), não a janela; alvos de toque ≥ 44 px em `pointer: coarse` (regras em `platform/web/host/tablet.css`); nada de rolagem horizontal da página.
6. **Teclado/acessibilidade**: `aria-label` em botões só-ícone, foco visível, Esc fecha o que abriu por último.
7. **Janela que abre**: em tela de toque não foca campo de texto sozinho (o teclado virtual esconderia a tela) — `initialFocus` em `react/index.jsx`.
8. **Mapa novo na tela** (desenho): `core/svg.js` + `core/layout.js` (puro, testável). Estilo de tópico novo → `themes.sanitizeStyle/resolveStyle` (valide!).

## Reordenar / arrastar tópicos
O soltar do mapa tem 3 modos pela altura do ponteiro sobre o alvo (`dropMode` em `renderer.js`): 30% de cima = antes e 30% de baixo = depois (`MindMap.moveBeside`), meio = filho (`moveMany`). A linha laranja é `#dropLine` (SVG, criada em `showDropLine`). Botões: ▲▼ na barra lateral (`data-act=moveUp/moveDown`, escondidos no tablet) e ▲▼◀▶ na barra flutuante (`platform/web/host/menu.js`). Teste: `e2e-reorder` (mouse/teclado reais) e, no tablet, `e2e-tablet` (aguarde ~1,5 s após um arrasto CDP antes de tocar num botão: o Chromium consome o 1º toque durante o fling).

## Como testar
1. `npm run check`; `npm run build:ui`.
2. e2e da área nas **duas** interfaces (padrão e `--classic`) e com **entrada real** (`sendInputEvent`) quando for interação.
3. Tablet: `npm run build:web-app` → `electron test/e2e-tablet.js` (+ `e2e-web`). Para mudança de CSS/toque rode também a bateria Android.
4. Capture (`c.shot`) e **olhe**: claro/escuro; 1280×800, 1000×640, 720×480 e retrato 800×1280.
5. Se criou/mudou fachada `MCView`: `e2e-tablet` (pinça, arrastar, editar com teclado virtual).

## Antes de crescer um arquivo
`renderer.js` ≤ 1000 linhas, `graph-ui.js`/`study-ui.js` idem (teste). Extraia lógica pura para `core/` (modelo: `graph-labels.js`) e deixe o `*-ui.js` só com DOM/eventos.
