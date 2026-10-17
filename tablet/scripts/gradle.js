'use strict';
// Roda o Gradle do projeto Android com o SDK e um JDK utilizável desta máquina, sem alterar as variáveis de ambiente do usuário.
// O JDK escolhido precisa estar ÍNTEGRO (lib/tzdb.dat existe: sem ele qualquer Java que use datas falha, o Gradle inclusive) e ser 21+
// (exigência do Capacitor 8). Ordem: MINDCRAFT_JAVA_HOME, JAVA_HOME, JBR do Android Studio, outros JDKs conhecidos.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');
if (!fs.existsSync(sdk)) { console.error('Android SDK não encontrado em ' + sdk + '. Defina ANDROID_HOME.'); process.exit(2); }

function javaMajor(home) {
  const r = spawnSync(path.join(home, 'bin', process.platform === 'win32' ? 'java.exe' : 'java'), ['-version'], { encoding: 'utf8' });
  const m = /version "(\d+)/.exec((r.stderr || '') + (r.stdout || '')); return m ? Number(m[1]) : 0;
}
const candidates = [process.env.MINDCRAFT_JAVA_HOME, process.env.JAVA_HOME, 'C:\\Ambiente\\Android Studio\\jbr', 'C:\\Program Files\\Android\\Android Studio\\jbr', '/Applications/Android Studio.app/Contents/jbr/Contents/Home', '/opt/android-studio/jbr', 'C:\\Ambiente\\jdk21'].filter(Boolean);
const jdk = candidates.find((h) => fs.existsSync(path.join(h, 'lib', 'tzdb.dat')) && fs.existsSync(path.join(h, 'bin')) && javaMajor(h) >= 21);
if (!jdk) { console.error('Nenhum JDK 21+ íntegro encontrado (procurei: ' + candidates.join('; ') + '). Instale o Android Studio ou defina MINDCRAFT_JAVA_HOME.'); process.exit(2); }

const androidDir = path.join(__dirname, '..', 'android');
fs.writeFileSync(path.join(androidDir, 'local.properties'), 'sdk.dir=' + sdk.replace(/\\/g, '\\\\') + '\n');          // (ignorado pelo Git)
const gradlew = path.join(androidDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
console.log(`[gradle] JDK: ${jdk} | SDK: ${sdk}`);
const r = spawnSync(gradlew, process.argv.slice(2), { cwd: androidDir, stdio: 'inherit', shell: process.platform === 'win32', env: { ...process.env, JAVA_HOME: jdk, ANDROID_HOME: sdk, ANDROID_SDK_ROOT: sdk, PATH: path.join(jdk, 'bin') + path.delimiter + process.env.PATH } });
process.exit(r.status === null ? 1 : r.status);
