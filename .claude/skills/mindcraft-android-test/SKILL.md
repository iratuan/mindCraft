---
name: mindcraft-android-test
description: Roda, depura e estende os testes do MindCraft no Android (emulador, adb, CDP do WebView, toque/teclado reais, dumpsys/uiautomator, monkey). Use para validar o APK, investigar falha no tablet ou acrescentar um teste Android.
---

# Testes no Android (emulador)

> Rode com `npm run android` (na raiz; blocos de testes, 1 repetição registrada como instável, logs em `evidencias/logs/android/`; `node tablet/scripts/run-android.js 18,19` roda só alguns). A bateria tem **20 testes** (18 = cópia de segurança com o seletor REAL + restaurar pelo seletor de arquivos) (16 = manual + painel lateral por toque real; 17 = tela inicial com aviso de cópia de segurança) (o 15 é o "Salvar como" com o seletor REAL de documentos: `uiautomator` acha o campo de nome e o botão Salvar do `com.google.android.documentsui`).

## Ambiente
- SDK: `%LOCALAPPDATA%\Android\Sdk` (platform-tools, emulator, build-tools 36.1.0, android-36, imagem `google_apis_playstore x86_64`). AVD tablet 2560×1600.
- JDK: `tablet/scripts/gradle.js` escolhe um JDK íntegro (≥21) sem mexer no `JAVA_HOME` do usuário.
- **Desligue o emulador antes de testes do desktop** (`adb emu kill`); **nada em paralelo** à bateria Android (reiniciar app/teclado no meio invalida).

## Fluxo
```
npm run build:web-app && cd tablet && npm run sync
node scripts/gradle.js assembleDebug
node scripts/emulator.js                      # liga e espera
adb uninstall app.mindcraft.estudos ; adb install -r android/app/build/outputs/apk/debug/app-debug.apk
node scripts/test-android.js                  # 16 testes (~10 min); ANDROID_ONLY=2,13 para alguns (o 2 calibra o toque)
```
Rode a bateria em segundo plano gravando em `evidencias/logs/android-teste.txt` e acompanhe com laço de espera (linha final "FIM").

## O que cada mecanismo prova
- **CDP** (`tablet/scripts/cdp.js`): conecta ao socket `webview_devtools_remote_<pid>` (via `adb forward`) e executa JS na página — mesma API que o harness do Electron.
- **Toque real**: `adb shell input tap/swipe` (coordenadas calibradas no teste 2: `calibrate()`); duplo toque ≤ 450 ms/30 px.
- **Teclado virtual**: `adb shell input text` depende do Gboard — `launch()` reinicia `com.google.android.inputmethod.latin` a cada abertura.
- **Insets/área segura**: `dumpsys window` (`InsetsSource … statusBars/navigationBars/displayCutout`) × `uiautomator dump` (limites do `android.webkit.WebView`). Configurações: `cmd overlay enable com.android.internal.systemui.navbar.threebutton`, `…display.cutout.emulation.tall`, `settings put system user_rotation`.
- **Notificações**: o diálogo de permissão é real — `allowPermissionDialog()` toca "Permitir" achando o botão por `uiautomator`.
- **Rede nativa** (Drive): servidor falso no PC + `adb reverse tcp:PORTA tcp:PORTA`; só HTTP em `127.0.0.1` é permitido (`network_security_config.xml`).
- **Estresse**: `monkey -p app.mindcraft.estudos --throttle 60 --pct-syskeys 0 --pct-nav 0 --pct-majornav 0 --pct-appswitch 0 -v 3000`.

## Escrever um teste novo
Use `await t('frase do que deve acontecer', async () => { … })` (índice = ordem no arquivo; atualize números de `ANDROID_ONLY` nos docs). Helpers: `ev(js)`, `ctr(sel)` (centro em px CSS), `tapCss(x,y)`, `swipeCss`, `shot(nome)`, `waitFor`, `eq/ok`, `shell(...)`, `sh(...)`. Termine **restaurando** o que mudou no sistema (overlays, rotação) num `finally`.

## Armadilhas conhecidas
- Painel de notificações aberto pelo monkey cobre o app: `launch()` já faz `cmd statusbar collapse` + HOME.
- App encerrado com edição não salva mostra o diálogo "Restaurar/Descartar" por cima.
- `offsetParent` é `null` em elementos `position: fixed` — use `getClientRects()` para medir visibilidade.
- Estado do emulador instável (UnknownVizError etc.) costuma ser CPU saturada: reinicie o AVD.
- Nada foi testado em aparelho físico; diga isso ao entregar.
