'use strict';
// Gera os ícones do app Android (launcher normal, redondo e camada "adaptive") a partir do logotipo do desktop (build/icon.png).
//   npx electron scripts/make-icons.js        (rode de dentro de tablet/; usa o Electron já instalado para redimensionar e arredondar)
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', 'build', 'icon.png');
const RES = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
const LEGACY = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };           // ic_launcher.png / ic_launcher_round.png
const ADAPTIVE = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };      // ic_launcher_foreground.png (camada de 108 dp)
const BG = '#1b1b1b';

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { offscreen: false } });
  await win.loadURL('data:text/html,<canvas id=c></canvas>');
  const data = 'data:image/png;base64,' + fs.readFileSync(SRC).toString('base64');
  const render = (mode, size) => win.webContents.executeJavaScript(`(async () => {
    const img = new Image(); img.src = ${JSON.stringify(data)}; await img.decode();
    const c = document.getElementById('c'); c.width = c.height = ${size}; const g = c.getContext('2d'); g.clearRect(0, 0, ${size}, ${size}); g.imageSmoothingQuality = 'high';
    const mode = ${JSON.stringify(mode)};
    if (mode === 'foreground') { const s = ${size} * 0.62; g.drawImage(img, (${size} - s) / 2, (${size} - s) / 2, s, s); }                          // dentro da zona segura do ícone adaptativo
    else if (mode === 'round') { g.fillStyle = ${JSON.stringify(BG)}; g.beginPath(); g.arc(${size} / 2, ${size} / 2, ${size} / 2, 0, Math.PI * 2); g.fill(); g.save(); g.clip(); const s = ${size} * 0.74; g.drawImage(img, (${size} - s) / 2, (${size} - s) / 2, s, s); g.restore(); }
    else { const r = ${size} * 0.2; g.fillStyle = ${JSON.stringify(BG)}; g.beginPath(); g.roundRect(0, 0, ${size}, ${size}, r); g.fill(); const s = ${size} * 0.78; g.drawImage(img, (${size} - s) / 2, (${size} - s) / 2, s, s); }
    return c.toDataURL('image/png').split(',')[1];
  })()`);
  const write = (dir, name, b64) => { const p = path.join(RES, dir, name); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, Buffer.from(b64, 'base64')); };
  for (const [d, px] of Object.entries(LEGACY)) { write('mipmap-' + d, 'ic_launcher.png', await render('square', px)); write('mipmap-' + d, 'ic_launcher_round.png', await render('round', px)); }
  for (const [d, px] of Object.entries(ADAPTIVE)) write('mipmap-' + d, 'ic_launcher_foreground.png', await render('foreground', px));
  fs.writeFileSync(path.join(RES, 'values', 'ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${BG}</color>\n</resources>\n`);
  console.log('ícones gerados em', RES);
  app.exit(0);
}).catch((e) => { console.error(e); app.exit(1); });
