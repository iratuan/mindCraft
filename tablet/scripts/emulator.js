'use strict';
// Liga o tablet virtual (AVD "MindCraft_Tablet") e espera o Android terminar de iniciar; `--stop` desliga.
//   node scripts/emulator.js            → liga e aguarda
//   node scripts/emulator.js --stop     → desliga
// Importante: o emulador consome CPU/GPU; não o deixe ligado enquanto roda as baterias de teste do desktop.
const { spawn, spawnSync } = require('child_process');
const path = require('path');

const sdk = process.env.ANDROID_HOME || path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');
const exe = (n) => path.join(sdk, n.startsWith('emulator') ? 'emulator' : 'platform-tools', process.platform === 'win32' ? n + '.exe' : n);
const adb = (...a) => spawnSync(exe('adb'), a, { encoding: 'utf8' });

if (process.argv.includes('--stop')) { adb('emu', 'kill'); console.log('emulador desligado'); process.exit(0); }
if (adb('devices').stdout.includes('emulator-')) console.log('emulador já está ligado');
else { spawn(exe('emulator'), ['-avd', 'MindCraft_Tablet', '-no-snapshot-save', '-no-audio', '-no-boot-anim', '-gpu', 'auto'], { detached: true, stdio: 'ignore' }).unref(); console.log('ligando o tablet virtual…'); }
const t0 = Date.now();
(function wait() {
  const b = adb('shell', 'getprop', 'sys.boot_completed').stdout.trim();
  if (b === '1') { console.log(`pronto em ${Math.round((Date.now() - t0) / 1000)} s: ${adb('shell', 'getprop', 'ro.product.model').stdout.trim()}, Android ${adb('shell', 'getprop', 'ro.build.version.release').stdout.trim()}, ${adb('shell', 'wm', 'size').stdout.trim()}`); process.exit(0); }
  if (Date.now() - t0 > 300000) { console.error('o emulador não terminou de iniciar em 5 min'); process.exit(1); }
  setTimeout(wait, 3000);
})();
