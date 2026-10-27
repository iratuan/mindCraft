# Como contribuir

## Princípios (SOLID aplicado ao projeto)
- **Responsabilidade única:** um módulo de `core/` faz uma coisa (estudo ≠ biblioteca ≠ sincronização). Se o arquivo passa do orçamento de linhas (`test/architecture.test.js`), extraia.
- **Aberto/fechado:** novos formatos/provedores entram como **módulos novos** atrás de um contrato pequeno (ex.: provedor de sincronização = `{ list, read, write }`; passos da interface por fatia React), sem editar a lógica existente.
- **Substituição:** qualquer provedor de sincronização funciona no motor sem ele saber qual é (pasta, Drive, em memória nos testes). Mantenha o contrato.
- **Segregação de interfaces:** a plataforma só vê `window.MCView`; a interface só vê os canais IPC documentados; o motor de sync só vê o provedor.
- **Inversão de dependência:** o núcleo não conhece Electron/DOM/rede; recebe `http`, `fs`, `now`, `sleep` por parâmetro (por isso é testável e roda no tablet).

## Estilo
- Português claro nos comentários (explique o **porquê**) e nas mensagens ao usuário (acionáveis: o que houve + o que fazer).
- JS moderno CommonJS no núcleo; sem dependências novas no núcleo sem necessidade (portabilidade web). Dependência nova → justifique em `docs/DECISIONS.md`.
- Funções curtas, nomes descritivos, sem estado global novo. Estado compartilhado da interface clássica fica em `renderer.js` e só é exposto por fachadas.
- ≤ ~160 colunas em código novo. `npm run lint` precisa sair **sem avisos**.
- Sem `console.log`, `debugger`, `eval` (teste de arquitetura barra).

## Segurança (checklist de revisão)
- Texto do usuário → HTML/SVG: `escapeHtml` (`core/text.js`) ou `textContent`; nunca `innerHTML` com texto cru.
- Valores de arquivos externos (`.mom`, `.mcpack`, CSV, pasta remota) vão por **validação/sanitização** antes de virar atributo/estilo/nome de arquivo (`themes.sanitizeStyle/sanitizeTheme`, `SAFE_ID`, `SAFE_FILE`, limites de tamanho).
- Rede: só HTTPS (HTTP só para `127.0.0.1` em testes); tokens nunca em log nem em mensagem de erro.
- Arquivos: gravar em temporário e renomear; nunca seguir caminho vindo de fora sem restringir à pasta do app.

## Mudando o quê? Lista de verificação
| Mudança | Faça também |
|---|---|
| Novo módulo em `core/` | acrescente em `MODULES` (`tools/build-web-core.js`); teste `test/<módulo>.test.js`; rode `npm run test:web` |
| Novo canal IPC | trate em `electron/main.js` **e** `platform/web/host/ipc.js` (ou liste em `DESKTOP_ONLY_CHANNELS` do teste de arquitetura, com motivo) |
| Nova opção de interface | `loadCfg/saveCfg`; se deve viajar no `.mcpack`: `core/settings.js`; teste e2e; veja no tablet (alvos ≥ 44 px) |
| Novo comando de menu | `electron/main.js` (menu) **e** `platform/web/host/menu.js`; `act.<comando>` na interface |
| Mudança em `.mom`/biblioteca | migração (`library.js` `MIGRATIONS`), compatibilidade com arquivos antigos, teste de round-trip |
| Mudança visual | capture antes/depois; verifique claro/escuro e tablet (paisagem e retrato) |
| Toque/tablet | `e2e-tablet` + bateria Android (`test-android.js`) |

## Definição de pronto
1. `npm run check` verde (lint, unitários, paridade web).
2. e2e relevantes verdes (e `npm run e2e` completo antes de entregar).
3. Capturas/evidências atualizadas; `docs/evidencias/README.md` com **o que foi e o que NÃO foi testado**.
4. README/docs atualizados (e `CLAUDE.md` se mudou comando, regra ou armadilha).
5. Nenhum dado de usuário nas evidências; nenhum segredo no repositório.

## Commits
Mensagem curta em português (sem acento se o shell reclamar), corpo em tópicos. Termina com:
```
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```
Nunca versionar: `tablet/keystore`, `node_modules`, `dist`, `build`, `_extracted`, `*.apk`, `*.exe`, bancos `.db`.

## Versões
`package.json` e `tablet/package.json` andam juntas (teste de arquitetura confere). `versionCode` do Android = `maior*10000 + menor*100 + correção`. Receita completa: `.claude/skills/mindcraft-release`.
