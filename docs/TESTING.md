# Testes do MindCraft

## Pirâmide

| Nível | Onde | Comando | Quando rodar |
|---|---|---|---|
| Lint | `eslint.config.js` | `npm run lint` | sempre (antes de commit) |
| Arquitetura | `test/architecture.test.js` | `npm test` | sempre — falha com a regra quebrada e como corrigir |
| Unitários do núcleo | `test/*.test.js` (≈240) | `npm test` | sempre; < 10 s |
| Paridade com o núcleo web | mesmos unitários contra `core-browser` | `npm run test:web` | sempre que mexer em `core/` ou `platform/web/` |
| Ponta a ponta (Electron real) | `test/e2e-*.js` | `electron test/e2e-x.js [--classic]` | ao mexer na interface; `npm run e2e` roda tudo (41 etapas, ~10 min; `E2E_PROGRESS=1` mostra a hora de cada etapa; o log de cada etapa fica em `evidencias/logs/e2e/`; `node tools/run-e2e.js "regex"` roda só algumas) |
| Mapa mental (Playwright no Electron) | `test/e2e-playwright-map.js` | `npm run test:map-playwright` | níveis, notas, filtro, temas, arraste real, mudança de pai, relações, rede e lousa; capturas em `docs/evidencias/mapa-mental/` |
| Notas, flashcards e Obsidian (Playwright no Electron) | `test/e2e-notes-flashcards.js` | `npm run test:notes-flashcards` | geração de notas/tópicos, links `[[ ]]`, cartões, salvamento `.mom` e notas Markdown por tópico; capturas em `docs/evidencias/notas-flashcards/` |
| Web/tablet (Chromium sem Node) | `e2e-web`, `e2e-tablet`, `e2e-sync-web` | `npm run build:web-app` antes | ao mexer em `platform/web`, CSS do tablet, toque |
| QA com entrada real | `test/qa-tour.js` | `npm run qa` | antes de entregar (82 casos, mouse/teclado reais) |
| Evidências | `test/evidence.js` | `npm run evidence` | antes de entregar (capturas em `docs/evidencias/`) |
| Estresse | `e2e-monkey`, `fuzz.test.js` | `npm run monkey` | ao mexer em entrada/edição |
| Android (emulador) | `tablet/scripts/test-android.js` (17) | ver abaixo | antes de gerar o APK |

## Regras práticas
- **Emulador Android desligado** ao rodar e2e/qa do desktop (`adb emu kill`); ligado só para a bateria Android. **Nada em paralelo** à bateria Android.
- Rode primeiro o teste mais específico da mudança; a bateria completa por último.
- `pree2e/preqa/predist` já reconstroem o bundle React; para o tablet rode `npm run build:web-app` e `cd tablet && npm run sync`.
- Um teste que falha **sem** você ter errado quase sempre é premissa errada do teste: confirme no app (captura) antes de mexer no código. E o contrário: se o teste passa "de primeira" numa mudança arriscada, faça uma **sabotagem** (quebre de propósito a linha que ele deveria proteger e veja falhar) — já pegou testes frouxos.
- Mensagem de falha deve dizer o que esperava e o que veio; não use `ok(cond)` sem texto em verificação não óbvia.

## Escrever um e2e novo (Electron)
```js
const start = require('./harness');                 // sobe electron/main.js real com userData temporário
(async () => {
  const c = await start('MindCraft e2e — título');
  const { js, wait, waitFor, eq, ok, t, TMP, USERDATA } = c;
  await t('o que deve acontecer, em frase', async () => { /* js('código na página'); eq(...); */ });
  await t('nenhum erro de console', async () => eq(c.errors, []));
  await c.finish();
})();
```
- `c.js(código)` executa na página (cuidado: não devolva funções; use `JSON.stringify` para objetos grandes).
- Diálogos nativos são dublês: `window.__dlg.folder/open/save/pack…` (ver `harness.js`).
- Entrada real: `win.webContents.sendInputEvent` (nomes de tecla do Electron: `Right`, `Enter`, `Escape`…, não `ArrowRight`).
- Capturas: `c.shot(caminho)`; guarde em `docs/evidencias/<área>/`. **Não versione capturas de mapas pessoais.**
- Registre o arquivo no script `e2e` do `package.json` (e atualize o número de etapas em `CLAUDE.md`/docs).

## Web/tablet (`web-harness`)
`start('…')` de `test/web-harness.js`: Chromium **sem Node** (`nodeIntegration` desligado), partições de IndexedDB, `c.emulate({width,height})`, `c.touch.tap/doubleTap/longPress/drag/pinch` (CDP). O servidor falso do Google (`test/mock-google.js`, com CORS) serve ao teste de sincronização.

## Android
```
node tablet/scripts/emulator.js          # liga o AVD, espera pronto
cd tablet && npm run sync && node scripts/gradle.js assembleDebug
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
node scripts/test-android.js             # ANDROID_ONLY=2,13 roda só alguns (2 = calibração de toque, necessária para os de toque)
```
Mecanismos: toque real `adb input`, teclado real, CDP do WebView (`adb forward` ao socket `webview_devtools_remote_<pid>`), `dumpsys` (barras/insets), `uiautomator dump` (limites do WebView), monkey. O Gboard precisa ser reiniciado a cada abertura (`launch()` já faz). Veja `.claude/skills/mindcraft-android-test`.

## O que NÃO é coberto (declare ao entregar)
Tablet físico; Google Drive real (só o servidor falso); Windows com "Foco/Não perturbe"; macOS/Linux; leitores de tela; grafos com milhares de pontos (medido ~800 sintéticos).
