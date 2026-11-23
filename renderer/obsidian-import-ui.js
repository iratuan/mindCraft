'use strict';
/* Importação de notas editadas no Obsidian: detecta e lista para revisão. */
(function () {
  const $ = (s) => document.querySelector(s);

  async function checkEditedNotes() {
    if (!vaultDirEff || !vaultDirEff()) { setStatus('Escolha a pasta do vault do Obsidian primeiro.'); return; }
    const dir = vaultDirEff();
    const { detectEditedNotes } = require(path.join(core, 'services', 'obsidian-import'));
    const edited = detectEditedNotes(dir);
    if (!edited.length) { setStatus('Nenhuma nota editada no Obsidian desde a última exportação.'); return; }
    const modal = $('#modal');
    modal.textContent = '';
    const box = document.createElement('div');
    box.className = 'modal-box';
    box.style.maxWidth = '640px';
    box.innerHTML = `<h3>Notas editadas no Obsidian (${edited.length})</h3><p class="muted">Estas notas foram alteradas no Obsidian. Revise e copie o conteúdo de volta se quiser.</p>`;
    const list = document.createElement('div');
    list.style.cssText = 'max-height:400px;overflow:auto;';
    for (const e of edited) {
      const row = document.createElement('div');
      row.style.cssText = 'padding:8px 0;border-bottom:1px solid var(--line-soft);';
      row.innerHTML = `<div style="font-weight:600;color:var(--text-strong);">${e.id || e.path}</div><div style="font-size:11px;color:var(--text-dim);margin:4px 0;">${e.body.slice(0, 200)}${e.body.length > 200 ? '…' : ''}</div>`;
      const btn = document.createElement('button');
      btn.className = 'btn small';
      btn.textContent = 'Copiar conteúdo';
      btn.addEventListener('click', () => { navigator.clipboard.writeText(e.body); setStatus('Conteúdo copiado. Cole na nota do tópico correspondente.'); });
      row.appendChild(btn);
      list.appendChild(row);
    }
    box.appendChild(list);
    const close = document.createElement('button');
    close.className = 'btn';
    close.textContent = 'Fechar';
    close.addEventListener('click', () => { modal.hidden = true; });
    box.appendChild(close);
    modal.appendChild(box);
    modal.hidden = false;
  }

  // expõe para menu
  window.checkEditedNotes = checkEditedNotes;
})();
