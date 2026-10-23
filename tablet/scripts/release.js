'use strict';
// Gera o APK de INSTALAÇÃO (release): compila, alinha e ASSINA com uma chave sua. Resultado: tablet/dist/MindCraft-<versão>.apk
//   node scripts/release.js
// A chave (keystore) é criada na primeira vez em tablet/keystore/ (fora do Git) com uma senha aleatória guardada em tablet/keystore/senha.txt.
// FAÇA UMA CÓPIA dessa pasta: sem a MESMA chave não é possível atualizar o app instalado (só desinstalar e instalar de novo, perdendo os dados do aparelho).
const { spawnSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const sdk = process.env.ANDROID_HOME || path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');
const run = (cmd, args, opts = {}) => { const r = spawnSync(cmd, args, { stdio: 'inherit', shell: false, ...opts }); if (r.status !== 0) { console.error(`falhou: ${path.basename(cmd)} ${args.slice(0, 3).join(' ')}…`); process.exit(r.status || 1); } };

// JDK íntegro (mesma regra do gradle.js)
function pickJdk() {
  const cands = [process.env.MINDCRAFT_JAVA_HOME, process.env.JAVA_HOME, 'C:\\Ambiente\\Android Studio\\jbr', 'C:\\Program Files\\Android\\Android Studio\\jbr', 'C:\\Ambiente\\jdk21'].filter(Boolean);
  const j = cands.find((h) => fs.existsSync(path.join(h, 'lib', 'tzdb.dat')) && fs.existsSync(path.join(h, 'bin')));
  if (!j) { console.error('Nenhum JDK íntegro encontrado. Instale o Android Studio ou defina MINDCRAFT_JAVA_HOME.'); process.exit(2); } return j;
}
const jdk = pickJdk(), exe = process.platform === 'win32' ? '.exe' : '';
const keytool = path.join(jdk, 'bin', 'keytool' + exe);

// 1) chave de assinatura (uma vez)
const ksDir = path.join(root, 'keystore'), ks = path.join(ksDir, 'mindcraft.jks'), pwFile = path.join(ksDir, 'senha.txt');
if (!fs.existsSync(ks)) {
  fs.mkdirSync(ksDir, { recursive: true }); const pw = crypto.randomBytes(18).toString('base64url');
  run(keytool, ['-genkeypair', '-v', '-keystore', ks, '-alias', 'mindcraft', '-keyalg', 'RSA', '-keysize', '4096', '-validity', '10000', '-storepass', pw, '-keypass', pw, '-dname', 'CN=MindCraft, O=MindCraft, C=BR']);
  fs.writeFileSync(pwFile, pw + '\n'); console.log('\nChave criada em ' + ks + '\nFAÇA UMA CÓPIA da pasta tablet/keystore (sem ela não há como atualizar o app instalado).\n');
}
const pw = fs.readFileSync(pwFile, 'utf8').trim();

// 2) gera a versão web, sincroniza com o projeto Android, grava a versão do app e compila o release (sem assinatura)
const pkgV = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version, [maj, min, pat] = pkgV.split('.').map(Number);
const gradleFile = path.join(root, 'android', 'app', 'build.gradle'); let gradle = fs.readFileSync(gradleFile, 'utf8');
gradle = gradle.replace(/versionCode \d+/, 'versionCode ' + (maj * 10000 + min * 100 + pat)).replace(/versionName "[^"]*"/, 'versionName "' + pkgV + '"'); fs.writeFileSync(gradleFile, gradle);   // versionCode sobe a cada versão: o Android só atualiza um app por cima se o código for maior
run(process.execPath, [path.join(root, '..', 'tools', 'build-ui.js')], { cwd: root });
run(process.execPath, [path.join(root, '..', 'tools', 'build-web-app.js')], { cwd: root });
run(process.execPath, [path.join(root, 'node_modules', '@capacitor', 'cli', 'bin', 'capacitor'), 'sync', 'android'], { cwd: root });
run(process.execPath, [path.join(__dirname, 'gradle.js'), 'assembleRelease'], { cwd: root });

// 3) alinha (zipalign) e assina (apksigner) com a ferramenta oficial do SDK
const bt = path.join(sdk, 'build-tools'); const ver = fs.readdirSync(bt).sort().pop(); const tools = path.join(bt, ver);
const rel = path.join(root, 'android', 'app', 'build', 'outputs', 'apk', 'release');
const unsigned = fs.readdirSync(rel).find((f) => /unsigned\.apk$|release\.apk$/.test(f)); if (!unsigned) { console.error('APK release não encontrado em ' + rel); process.exit(1); }
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')); const outDir = path.join(root, 'dist'); fs.mkdirSync(outDir, { recursive: true });
const aligned = path.join(outDir, 'alinhado.tmp.apk'), final = path.join(outDir, `MindCraft-${pkg.version}.apk`);
run(path.join(tools, 'zipalign' + exe), ['-f', '-p', '4', path.join(rel, unsigned), aligned]);
run(path.join(jdk, 'bin', 'java' + exe), ['-jar', path.join(tools, 'lib', 'apksigner.jar'), 'sign', '--ks', ks, '--ks-key-alias', 'mindcraft', '--ks-pass', 'pass:' + pw, '--key-pass', 'pass:' + pw, '--out', final, aligned]);
fs.rmSync(aligned, { force: true }); fs.rmSync(final + '.idsig', { force: true });
run(path.join(jdk, 'bin', 'java' + exe), ['-jar', path.join(tools, 'lib', 'apksigner.jar'), 'verify', '--print-certs', final]);
console.log(`\nAPK de instalação: ${final} (${Math.round(fs.statSync(final).size / 1024)} KB)`);
