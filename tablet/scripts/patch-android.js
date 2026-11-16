'use strict';
/**
 * Ajustes do projeto Android que o `cap add` não faz (rodam depois de `cap sync`):
 *  1. o compartilhamento enxerga a pasta interna do app (files/braniac), onde o BRANIAC grava mapas e exportações;
 *  2. assinatura de release com a chave de tablet/keystore (fora do git). A senha é lida do arquivo na hora do build
 *     e nunca é copiada para o projeto; sem o arquivo, o release sai sem assinatura (e o build avisa);
 *  3. versão 0.7.8 (código 30), igual ao package.json.
 */
const fs = require('fs');
const path = require('path');

const androidDir = path.join(__dirname, '..', 'android', 'app');
const filePaths = path.join(androidDir, 'src', 'main', 'res', 'xml', 'file_paths.xml');
const gradle = path.join(androidDir, 'build.gradle');
if (!fs.existsSync(filePaths) || !fs.existsSync(gradle)) throw new Error('Projeto Android não encontrado: rode `npx cap add android` antes.');

// 1) caminhos do compartilhamento
let xml = fs.readFileSync(filePaths, 'utf8');
if (!xml.includes('name="braniac_data"')) {
  xml = xml.replace('</paths>', '    <files-path name="braniac_data" path="braniac/" />\n</paths>');
  fs.writeFileSync(filePaths, xml);
}

// 1b) imagem da abertura nativa (antes da página carregar): o quadro do vídeo do BRANIAC
const launchSrc = path.join(__dirname, '..', 'launch', 'splash.png');
if (fs.existsSync(launchSrc)) {
  const resDir = path.join(androidDir, 'src', 'main', 'res');
  for (const d of fs.readdirSync(resDir)) {
    const target = path.join(resDir, d, 'splash.png');
    if (/^drawable/.test(d) && fs.existsSync(target)) fs.copyFileSync(launchSrc, target);
  }
}

// 1e) cor de fundo do ícone adaptativo (mesma cor clara da logo)
const bgSrc = path.join(__dirname, '..', 'launch', 'values', 'ic_launcher_background.xml');
if (fs.existsSync(bgSrc)) fs.copyFileSync(bgSrc, path.join(androidDir, 'src', 'main', 'res', 'values', 'ic_launcher_background.xml'));

// 1d) ícone do app: o cérebro do BRANIAC em todas as densidades (launch/mipmaps)
const mipSrc = path.join(__dirname, '..', 'launch', 'mipmaps');
if (fs.existsSync(mipSrc)) {
  const resDir = path.join(androidDir, 'src', 'main', 'res');
  for (const d of fs.readdirSync(mipSrc)) {
    for (const f of fs.readdirSync(path.join(mipSrc, d))) {
      const target = path.join(resDir, d, f);
      if (fs.existsSync(path.dirname(target))) fs.copyFileSync(path.join(mipSrc, d, f), target);
    }
  }
}

// 1c) tela de abertura do Android 12+: cor de fundo e ícone central (o cérebro do vídeo), no lugar do ícone do app
const iconSrc = path.join(__dirname, '..', 'launch', 'splash_icon.png');
const stylesFile = path.join(androidDir, 'src', 'main', 'res', 'values', 'styles.xml');
if (fs.existsSync(iconSrc) && fs.existsSync(stylesFile)) {
  fs.copyFileSync(iconSrc, path.join(androidDir, 'src', 'main', 'res', 'drawable', 'splash_icon.png'));
  let st = fs.readFileSync(stylesFile, 'utf8');
  if (!st.includes('windowSplashScreenAnimatedIcon')) {
    const extra = '\n        <item name="windowSplashScreenBackground">#EEF2F7</item>\n        <item name="windowSplashScreenAnimatedIcon">@drawable/splash_icon</item>';
    st = st.replace('<item name="android:background">@drawable/splash</item>', '<item name="android:background">@drawable/splash</item>' + extra);
    fs.writeFileSync(stylesFile, st);
  }
}

// 3) versão do APK: nome 0.7.8 (código 30); sempre reaplicada, pois o `cap sync` regenera o build.gradle
const gradleVersion = fs.readFileSync(gradle, 'utf8');
fs.writeFileSync(gradle, gradleVersion.replace(/versionCode \d+/, 'versionCode 30').replace(/versionName "[^"]*"/, 'versionName "0.7.8"'));

// 2) e 3) assinatura e versão
let g = fs.readFileSync(gradle, 'utf8');
if (!g.includes('// BRANIAC: assinatura')) {
  const signing = [
    '    // BRANIAC: assinatura',
    '    signingConfigs {',
    '        release {',
    "            def senhaFile = file('../../keystore/senha.txt')",
    '            if (senhaFile.exists()) {',
    '                def senha = senhaFile.readLines()[0].trim()',
    "                storeFile file('../../keystore/mindcraft.jks')",
    '                storePassword senha',
    "                keyAlias 'mindcraft'",
    '                keyPassword senha',
    '            }',
    '        }',
    '    }',
    '',
  ].join('\n');
  g = g.replace('    buildTypes {', signing + '    buildTypes {');
  g = g.replace('    buildTypes {\n        release {', "    buildTypes {\n        release {\n            if (file('../../keystore/senha.txt').exists()) signingConfig signingConfigs.release");
  g = g.replace(/versionCode \d+/, 'versionCode 30').replace(/versionName "[^"]*"/, 'versionName "0.7.8"');
  fs.writeFileSync(gradle, g);
}
console.log('Android: compartilhamento liberado, assinatura de release e versão 0.7.8 (código 30).');
