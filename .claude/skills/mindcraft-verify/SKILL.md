---
name: mindcraft-verify
description: Decide e roda os testes certos para uma mudança no MindCraft (lint, unitários, paridade web, e2e, QA, tablet, Android) na ordem certa e relata o que foi e o que NÃO foi testado. Use depois de qualquer alteração de código e antes de commit/entrega.
---

# Verificar uma mudança no MindCraft

Regra do projeto: **só entregue o que foi provado por teste real e diga o que NÃO foi testado.**

## 1. Sempre (rápido)
```
npm run check        # eslint (0 avisos) + unitários + arquitetura + paridade com o núcleo web
```
Falhou em `architecture.test.js`? A mensagem diz a regra quebrada (módulo fora de `MODULES`, canal IPC sem tratador, arquivo grande demais…). Corrija a causa, não o teste.

## 2. Escolha pelo que mudou
| Mudou… | Rode também |
|---|---|
| `core/` | `npm run test:web` (já no `check`); e2e da área (`e2e-study`, `e2e-library`, …) |
| Interface clássica (`renderer/*.js`) | e2e da área nas duas interfaces (`electron test/e2e-x.js` e `… --classic`); `npm run qa` |
| React (`renderer/react`) | `npm run build:ui` + e2e da área (a interface padrão é a React) |
| Rede de conhecimento | `e2e-graph`, `e2e-network` (+`--classic`), `e2e-edit`, e no tablet `e2e-tablet` |
| `platform/web`, CSS do tablet, toque | `npm run build:web-app` → `e2e-web`, `e2e-tablet`, `e2e-sync-web` |
| Sincronização | `test/sync.test.js`, `sync-drive.test.js`, `e2e-sync`, `e2e-sync-web` |
| `.mom`/Mindomo | `mindomo.test.js`, `e2e-mindomo`; rode a leitura dos seus mapas reais (somente leitura) |
| Algo que o usuário vê | `npm run evidence` e **olhe as capturas** |
| Android (insets, notificação, toque, rede nativa) | bateria Android (skill `mindcraft-android-test`) |

## 3. Antes de entregar
1. **Desligue o emulador Android** (`adb emu kill`) → `npm run e2e` (39 etapas, ~17 min; rode em segundo plano e acompanhe o log) → `npm run qa`.
2. Ligue o emulador → bateria Android completa (19 testes) — **sem nada em paralelo**.
3. Atualize `evidencias/RESULTADOS.md` (números reais) e os docs.

## 4. Sabotagem (teste do teste)
Se uma mudança arriscada passou "de primeira", quebre de propósito a linha que o teste deveria proteger e confirme que falha; depois restaure. (Já revelou testes frouxos e premissas erradas.)

## 5. Como relatar
Liste: o que rodou e resultado (números), o que corrigiu no caminho, **o que NÃO foi testado** (tablet físico, Google real, etc.). Sem adjetivos de sobra.
