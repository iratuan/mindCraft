---
name: mindcraft-new-core-module
description: Cria um módulo novo em core/ do MindCraft do jeito certo (puro, testável, empacotado para o tablet, documentado). Use ao adicionar uma regra de negócio, formato, provedor ou utilitário que deve valer no desktop e no tablet.
---

# Novo módulo do núcleo (`core/`)

## Decida antes
- **É lógica pura?** (entra dado, sai dado) → `core/`. Se toca tela, janela, arquivo do SO, rede → fica fora; o `core/` recebe isso por **parâmetro** (`now`, `http`, `fs`, `sleep`) para ser testável e rodar no navegador.
- **Já existe onde encaixar?** Procure em `docs/ARCHITECTURE.md` (tabela de módulos). Prefira estender com um módulo novo a inchar um existente (orçamento: `core` ≤ 600 linhas/arquivo).

## Passos
1. `core/<nome>.js` com `'use strict'`, CommonJS, cabeçalho em português dizendo **responsabilidade** e **regras de segurança** (o que valida, o que nunca faz). Exporte **só** o que outros usam.
2. **Sem dependências circulares** e sem `electron`/DOM/`renderer`/`platform` (teste de arquitetura).
3. **Pacote do tablet**: acrescente o nome em `MODULES` (`tools/build-web-core.js`). Módulo que só faz sentido no computador (usa `http`/`https` do Node) vai em `NODE_ONLY` do `test/architecture.test.js` **e** a interface só o carrega atrás de `IS_HOST ? … : require(…)`.
4. **Teste unitário** `test/<nome>.test.js` (`node:test`): caminho feliz, bordas, **entradas hostis** (texto com `<img onerror>`, números absurdos, nomes de arquivo com `..`), determinismo. Para lógica com aleatoriedade, semente fixa.
5. Texto do usuário que vira HTML/SVG → `escapeHtml` (`core/text.js`). Dado vindo de arquivo → sanitize/valide e **limite tamanhos**.
6. Rode `npm run check` (lint + arquitetura + paridade web). Se o módulo é usado pela interface, rode também o e2e da área e `npm run build:web-app` + `e2e-tablet`.
7. **Documente**: linha na tabela de módulos de `docs/ARCHITECTURE.md`; decisão não óbvia em `docs/DECISIONS.md`.

## Padrões do projeto para copiar
- Provedor/contrato pequeno (`sync`: `{list, read, write}`); função pura que devolve resultado (`graph-labels.placeLabels`); validação defensiva de arquivo (`mom.readMom`, `mindomo.convertTheme` + `themes.sanitizeTheme`).
- Gravação: temporário + `rename`; banco: `tx()` com releitura (`verify`).
- Erros esperados → `throw new Error('mensagem em português acionável')`.
