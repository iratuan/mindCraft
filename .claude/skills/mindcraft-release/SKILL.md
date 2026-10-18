---
name: mindcraft-release
description: Gera uma versão do MindCraft (sobe versão, testa tudo, instalador Windows e APK assinado do tablet, teste de fumaça, documentação, commit e push). Use quando o usuário pedir "gere o apk/instalador", "nova versão" ou "entregue".
---

# Receita de release do MindCraft

Pré-requisitos desta máquina: Git do Laragon (`C:\laragon\bin\git\cmd` no PATH), JDK íntegro ≥ 21 (o `tablet/scripts/gradle.js` escolhe o do Android Studio; o `C:\Ambiente\jdk21` está incompleto), Android SDK em `%LOCALAPPDATA%\Android\Sdk`.

## Passos
1. **Versão**: edite `version` em `package.json` **e** `tablet/package.json` (têm que ser iguais — o teste de arquitetura confere). `versionCode` do APK é calculado (`maior*10000 + menor*100 + correção`).
2. **Verificação completa** (skill `mindcraft-verify`): `npm run check`; emulador desligado → `npm run e2e` e `npm run qa`; emulador ligado → bateria Android 16/16. Tudo verde, senão pare.
3. **APK assinado**: `node tablet/scripts/release.js` (faz build da UI, do app web, `cap sync`, `assembleRelease`, zipalign, apksigner e verifica). Saída: `tablet/dist/MindCraft-<versão>.apk`. A chave está em `tablet/keystore` (senha em `senha.txt`) — **nunca versionar** e **lembrar o usuário de guardar cópia**.
4. **Instalador Windows**: `CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --win --publish never` → `dist/MindCraft Setup <versão>.exe` (~116 MB).
5. **Fumaça do APK release** (emulador ligado): `adb uninstall app.mindcraft.estudos` (a assinatura difere do debug) → `adb install -r tablet/dist/MindCraft-<v>.apk` → conferir `versionName/versionCode` e `DEBUGGABLE` ausente → abrir, tocar "Novo mapa", `monkey -p app.mindcraft.estudos --throttle 60 -v 2000`, `logcat -b crash` sem `FATAL`. Guarde capturas em `evidencias/android/`.
6. **Docs**: `README.md` (versão e seções), `evidencias/RESULTADOS.md` (números reais + o que NÃO foi testado), memória do projeto se houver fato novo.
7. **Commit e push** (autorizado para `https://github.com/iratuan/mindCraft.git`): `git add -A`; confirme que **não** entram `tablet/keystore`, `node_modules`, `dist`, `*.apk`, `*.exe`, `_extracted`; mensagem em arquivo (`git commit -F`) terminando com `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`; `git push origin HEAD`.
8. **Resposta final ao usuário** (português): caminhos dos dois arquivos; aviso da cópia do keystore; como instalar (fontes desconhecidas); o que mudou; o que foi testado e o que **não** foi.

## Armadilhas
- Evidências com mapas pessoais do usuário **não** vão para o repositório (apague antes do `git add`).
- Se `npm run build:web-app` falhar com "Expected } but found -": nome de módulo com hífen precisa estar entre aspas na entrada do esbuild (já tratado em `build-web-core.js`).
- Módulo novo de `core/` fora de `MODULES` → app quebra no tablet; o teste de arquitetura avisa.
- Notificações: `isExactNotification:false` (senão o Android abre a tela "Alarmes e lembretes").
