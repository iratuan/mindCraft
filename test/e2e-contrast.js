'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const start = require('./harness');
const { app } = require('electron');

async function main() {
  const c = await start('Contraste no canvas claro');
  await c.waitFor(() => c.js("document.getElementById('splash').hidden"), 20000);
  await c.t('texto sem forma mantém contraste ao trocar para o tema claro', async () => {
    await c.js('newMap()');
    const id = await c.js(`(() => {
      const parent = map.root.children[0];
      const node = map.addChild(parent.id, 'Texto sem forma');
      map.update(node.id, { style: { shape: 'none', fill: 'none', color: '#ffffff' } });
      render(); fit();
      return node.id;
    })()`);
    await c.js('setUiTheme("light")');
    const result = await c.js(`(() => {
      const color = document.querySelector('#view [data-id=${JSON.stringify(id)}] text').getAttribute('fill');
      const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      const lum = (hex) => { const c = rgb(hex); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
      const a = lum(color), b = lum('#c7c7c7');
      return { color, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
    })()`);
    assert.ok(result.ratio >= 4.5, `texto ${result.color} tem contraste ${result.ratio.toFixed(2)}:1`);
    await c.shot(path.join(__dirname, '..', 'docs', 'evidencias', 'lite', '14-contraste-canvas-claro.png'));
  });
  await c.finish();
}

main().catch((error) => {
  console.error(error);
  app.exit(2);
});
