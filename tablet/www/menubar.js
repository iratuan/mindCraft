'use strict';
/* Barra de menus da interface (Arquivo, Editar, Visualizar, Ajuda), igual à do desktop. Cada item chama runMenuCommand(), o mesmo
   caminho do menu nativo; assim uma ação nunca tem dois comportamentos. Atalhos mostrados são os do menu nativo (electron/main.js). */

const MENU_BAR = [
  { label: 'Arquivo', items: [
    ['new', 'Novo mapa', 'Ctrl+N'], ['new-flow', 'Novo fluxograma', ''], ['open', 'Abrir…', 'Ctrl+O'], '-',
    ['save', 'Salvar', 'Ctrl+S'], ['saveAs', 'Salvar como…', 'Ctrl+Shift+S'], ['restore', 'Versões anteriores…', ''], '-',
    ['export-study', 'Exportar material de estudo…', ''], ['share-study', 'Compartilhar material de estudo…', ''], '-',
    ['home', 'Tela inicial', 'Ctrl+Shift+H'],
  ] },
  { label: 'Editar', items: [
    ['undo', 'Desfazer', 'Ctrl+Z'], '-',
    ['cut', 'Recortar', 'Ctrl+X'], ['copy', 'Copiar', 'Ctrl+C'], ['paste', 'Colar', 'Ctrl+V'], '-',
    ['selectAll', 'Selecionar tudo', 'Ctrl+A'],
  ] },
  { label: 'Visualizar', items: [
    ['fit', 'Ajustar mapa à tela', 'Ctrl+0'], ['organize', 'Auto-organizar mapa', ''], ['panelsToggle', 'Recolher ou expandir painel lateral', 'Ctrl+' + String.fromCharCode(92)], '-',
    ['dash', 'Painel de mapas', 'Ctrl+E'], ['graph', 'Rede de conhecimento', 'Ctrl+G'], ['board', 'Lousa de resolução', ''],
    ['pdf', 'Leitor de PDF', 'Ctrl+Shift+P'], '-',
    ['ai-open', 'Assistente de IA', ''], ['ai-config', 'Configurar IA', ''],
  ] },
  { label: 'Ajuda', items: [['help', 'Atalhos do teclado', 'F1'], '-', ['about', 'Versão', '']] },
];

const mbBar = document.getElementById('menubar');
// versão da release: vem do processo principal (desktop) ou do APK (tablet); o item do menu Ajuda mostra "Versão X"
(async () => { try { window.braniacVersion = await require('electron').ipcRenderer.invoke('app:version'); } catch { /* sem versão */ } })();
let mbOpen = null;   // índice do menu aberto

function mbClose() {
  if (mbOpen === null) return;
  const drop = document.querySelector('.mb-drop');
  if (drop) drop.remove();
  const label = mbBar.querySelector(`[data-mb="${mbOpen}"]`);
  if (label) label.setAttribute('aria-expanded', 'false');
  mbOpen = null;
}

function mbOpenMenu(i, label) {
  mbClose();
  mbOpen = i;
  label.setAttribute('aria-expanded', 'true');
  const drop = document.createElement('div');
  drop.className = 'mb-drop';
  drop.setAttribute('role', 'menu');
  const r = label.getBoundingClientRect();
  drop.style.left = `${Math.round(r.left)}px`;
  drop.style.top = `${Math.round(r.bottom + 4)}px`;
  for (const it of MENU_BAR[i].items) {
    if (it === '-') { const sep = document.createElement('div'); sep.className = 'mb-sep'; drop.append(sep); continue; }
    const [cmd, text0, keys] = it;
    const text = cmd === 'about' ? `Versão ${window.braniacVersion || '—'}` : text0;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'mb-item'; b.setAttribute('role', 'menuitem'); b.dataset.cmd = cmd;
    const t = document.createElement('span'); t.textContent = text;
    b.append(t);
    if (keys) { const k = document.createElement('span'); k.className = 'mb-keys'; k.textContent = keys; b.append(k); }
    b.onclick = () => { mbClose(); window.runMenuCommand(cmd); };
    drop.append(b);
  }
  document.body.append(drop);
  drop.querySelector('.mb-item')?.focus();
}

function mbBuild() {
  if (!mbBar) return;
  MENU_BAR.forEach((m, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'mb-label'; b.dataset.mb = String(i);
    b.textContent = m.label; b.setAttribute('aria-haspopup', 'menu'); b.setAttribute('aria-expanded', 'false');
    b.onclick = (e) => { e.stopPropagation(); if (mbOpen === i) mbClose(); else mbOpenMenu(i, b); };
    b.onmouseenter = () => { if (mbOpen !== null && mbOpen !== i) mbOpenMenu(i, b); };   // passar o mouse troca de menu aberto
    mbBar.append(b);
  });
}
mbBuild();
document.addEventListener('click', (e) => { if (mbOpen !== null && !e.target.closest('.mb-drop, .mb-label')) mbClose(); });
document.addEventListener('keydown', (e) => {
  if (mbOpen === null) return;
  if (e.key === 'Escape') { e.stopPropagation(); const i = mbOpen; mbClose(); mbBar.querySelector(`[data-mb="${i}"]`)?.focus(); }
  else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    e.preventDefault();
    const n = MENU_BAR.length, next = (mbOpen + (e.key === 'ArrowRight' ? 1 : n - 1)) % n;
    mbOpenMenu(next, mbBar.querySelector(`[data-mb="${next}"]`));
  }
}, true);
