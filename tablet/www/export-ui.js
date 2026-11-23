'use strict';
/* Exportação do material de estudo: janela de opções (notas, fontes, conexões, peso e modo impressão) e as duas saídas:
   PDF (impresso pelo processo principal a partir do HTML do núcleo) e Markdown (texto para outros aplicativos de estudo).
   Usa o mesmo documento para as duas, então o conteúdo é igual. Carregado depois de renderer.js e react-bridge.js. */

const { buildStudyDoc, toMarkdown, toHtml } = require(path.join(core, 'formats', 'study-export'));

const STUDY_AI_MAX = 40;   // teto por material: cada tópico sem nota é uma chamada ao provedor
let lastStudyAi = null;    // resultado da última geração (para avisar na barra de status)
/** Barra de progresso da exportação: percentual e etapa (IA: parágrafos; PDF: etapas do processo principal). */
const exportProgress = {
  show(pct, label) {
    let box = document.getElementById('exportProg');
    if (!box) {
      box = el('div', 'export-prog'); box.id = 'exportProg'; box.setAttribute('role', 'progressbar'); box.setAttribute('aria-live', 'polite');
      box.append(el('div', 'export-prog-label'), el('div', 'export-prog-track'));
      box.lastChild.append(el('div', 'export-prog-bar'));
      document.body.append(box);
    }
    box.querySelector('.export-prog-label').textContent = `${label} ${Math.round(pct)}%`;
    box.querySelector('.export-prog-bar').style.width = Math.max(0, Math.min(100, pct)) + '%';
    box.setAttribute('aria-valuenow', String(Math.round(pct)));
    box.hidden = false;
  },
  hide() { const box = document.getElementById('exportProg'); if (box) box.hidden = true; },
};
ipcRenderer.on('export:progress', (_e, p) => { if (p && typeof p.pct === 'number') exportProgress.show(p.pct, p.label || 'Exportando…'); });
/** Parágrafos de revisão, com a IA, para os tópicos sem nota (1 a 10 parágrafos cada). Não altera o mapa: só vai para o material. */
async function studyParagraphs() {
  const snapshot = map, todo = [];
  const walk = (node, trail) => {
    const path = [...trail, node.title];
    if (!(node.notes || '').trim()) todo.push({ node, path });
    node.children.forEach((c) => walk(c, path));
  };
  walk(map.root, []);
  for (const f of map.meta._momFloating || []) walk(f.node, []);
  const list = todo.slice(0, STUDY_AI_MAX), generated = new Map();
  let error = null;
  for (let i = 0; i < list.length; i++) {
    if (map !== snapshot) { error = 'o mapa mudou durante a geração'; break; }
    setStatus(`Gerando parágrafos de revisão com a IA… (${i + 1}/${list.length})`);
    exportProgress.show(5 + (40 * i) / Math.max(1, list.length), 'Parágrafos da IA');
    const { node, path } = list[i];
    const kids = node.children.slice(0, 15).map((c) => c.title).join('; ');
    const r = await ipcRenderer.invoke('ai:ask', { provider: aiProv(), model: aiModel(), mode: 'paragraphs', question: '', selection: node.title + (kids ? `
Subtópicos: ${kids}` : ''), topic: path.join(' > ') });
    if (!r.ok) { error = r.error; break; }
    generated.set(node.id, r.paragraphs);
  }
  lastStudyAi = { generated: generated.size, total: todo.length, skipped: Math.max(0, todo.length - list.length), error };
  return generated;
}

/** Monta o documento e grava no caminho escolhido. Devolve o caminho gravado ou lança erro para o usuário. */
/** Exportação de um fluxograma (flow-export.js): mesma janela, mesma regra dos parágrafos da IA. */
async function exportFlowTo(format, target, opts = {}) {
  const { toFlowMarkdown, toFlowHtml } = require(path.join(core, 'formats', 'flow-export'));
  let generated = new Map();
  if (opts.aiFill) {
    const ks = await ipcRenderer.invoke('ai:key-status', aiProv());
    if (!ks.saved) {
      lastStudyAi = { generated: 0, total: 0, skipped: 0, error: 'sem chave de IA' };
      ipcRenderer.invoke('dialog:error', 'Para gerar os parágrafos de revisão com a IA, guarde a chave do provedor em Visualizar → Configurar IA. O material será exportado sem eles.');
    } else generated = await studyParagraphs();
  }
  const o = { notes: opts.notes !== false, generated };
  if (format === 'drawio') {   // gravação atômica (temporário + renomear), como o Markdown
    const tmp = target + '.tmp-' + process.pid;
    fs.writeFileSync(tmp, require(path.join(core, 'formats', 'drawio')).toDrawio(map), 'utf8');
    fs.renameSync(tmp, target);
    return target;
  }
  if (format === 'md') {
    const tmp = target + '.tmp-' + process.pid;
    fs.writeFileSync(tmp, toFlowMarkdown(map, o), 'utf8');
    fs.renameSync(tmp, target);
    return target;
  }
  exportProgress.show(2, 'Exportando PDF');
  const r = await ipcRenderer.invoke('export:pdf', toFlowHtml(map, o), target);
  exportProgress.hide();
  if (!r.ok) throw new Error(r.error);
  return r.path;
}

async function exportStudyTo(format, target, opts = {}) {
  if (!map) throw new Error('Abra um mapa para exportar o material de estudo.');
  commitNotes();
  lastStudyAi = null;
  if (isFlow(map)) return exportFlowTo(format, target, opts);
  if (opts.aiFill) {
    const ks = await ipcRenderer.invoke('ai:key-status', aiProv());
    if (!ks.saved) {
      lastStudyAi = { generated: 0, total: 0, skipped: 0, error: 'sem chave de IA' };
      ipcRenderer.invoke('dialog:error', 'Para gerar os parágrafos de revisão com a IA, guarde a chave do provedor em Visualizar → Configurar IA. O material será exportado sem eles.');
      opts = { ...opts, aiFill: false };
    } else {
      opts = { ...opts, generated: await studyParagraphs() };
    }
  }
  const doc = buildStudyDoc(map, opts);
  if (format === 'md') {
    const tmp = target + '.tmp-' + process.pid;
    fs.writeFileSync(tmp, toMarkdown(doc), 'utf8');
    fs.renameSync(tmp, target);
    return target;
  }
  exportProgress.show(2, 'Exportando PDF');
  const r = await ipcRenderer.invoke('export:pdf', toHtml(doc), target);
  exportProgress.hide();
  if (!r.ok) throw new Error(r.error);
  return r.path;
}

/** Janela de opções do material de estudo (a partir do menu Arquivo). */
function openExportModal(mode = 'export') {
  if (!map) return setStatus(mode === 'share' ? 'Abra um mapa para compartilhar o material de estudo.' : 'Abra um mapa para exportar o material de estudo.');
  const sharing = mode === 'share';
  const m = $('#modal'); m.textContent = ''; m.hidden = false;
  const box = el('div', 'modal-box'); box.id = 'exportBox';
  box.append(el('h2', '', sharing ? 'Compartilhar material de estudo' : 'Exportar material de estudo'));
  box.append(el('p', 'muted', sharing
    ? 'Prepara o arquivo para enviar (PDF para imprimir ou Markdown para outros apps). No tablet, abre a folha de compartilhar; no computador, mostra o arquivo na pasta e copia o caminho.'
    : 'Material de consulta com títulos por hierarquia e peso, notas, fontes (PDFs e páginas) e conexões. Escolha o que incluir:'));
  const opts = {};
  const check = (id, label, key, on) => {
    const l = el('label', 'opt'); const i = el('input'); i.type = 'checkbox'; i.id = id; i.checked = on; opts[key] = i;
    l.append(i, document.createTextNode(' ' + label)); return l;
  };
  box.append(
    check('exNotes', 'Incluir as notas dos tópicos', 'notes', true),
    check('exSources', 'Incluir fontes: PDFs vinculados, com página e trecho', 'sources', true),
    check('exLinks', 'Incluir conexões: setas com rótulo e links [[ ]]', 'links', true),
    check('exWeight', 'Ordenar por peso (prioridade 1, 2, 3 primeiro)', 'byWeight', true),
    check('exAi', 'Gerar com a IA parágrafos de revisão para os tópicos sem notas (de 1 a 10)', 'aiFill', true),
    check('exBw', 'Modo impressão em preto e branco', 'bw', false));
  const foot = el('div', 'foot');
  const cancel = el('button', 'btn', 'Cancelar'); cancel.id = 'exCancel';
  const md = el('button', 'btn', sharing ? 'Preparar Markdown' : 'Gerar Markdown'); md.id = 'exMd';
  const pdf = el('button', 'btn primary', sharing ? 'Preparar PDF' : 'Gerar PDF'); pdf.id = 'exPdf';
  const read = () => Object.fromEntries(Object.entries(opts).map(([k, i]) => [k, i.checked]));
  const onTablet = document.documentElement.dataset.host === 'web';
  const run = async (format) => {
    const fname = (map.meta.name || map.root.title || 'material') + (format === 'pdf' ? '-material-de-estudo.pdf' : format === 'drawio' ? '.drawio' : '-material-de-estudo.md');
    // compartilhar no computador não pede local: o arquivo vai para a pasta de exportados; no tablet, o salvamento já abre a folha de compartilhar
    const target = sharing && !onTablet ? await ipcRenderer.invoke('share:temp', fname) : await ipcRenderer.invoke('dialog:save-export', format, fname);
    if (!target) return;
    closeModal();
    try {
      const out = await exportStudyTo(format, target, read());
      if (sharing && !onTablet) {
        const c = await ipcRenderer.invoke('dialog:confirm', { message: 'Material pronto para compartilhar', detail: out, buttons: ['Mostrar na pasta', 'Copiar caminho', 'Fechar'] });
        if (c === 0) await ipcRenderer.invoke('share:reveal', out);
        else if (c === 1) await ipcRenderer.invoke('share:copy', out);
        setStatus('Material pronto: ' + out);
        return;
      }
      const a = lastStudyAi;
      const note = !a ? '' : a.error ? ` Parágrafos da IA: ${a.generated} de ${a.total} tópico(s) (${a.error}).` : a.total ? ` Parágrafos da IA: ${a.generated} tópico(s)${a.skipped ? `; ${a.skipped} sem geração (limite de ${STUDY_AI_MAX})` : ''}.` : '';
      setStatus('Material de estudo exportado: ' + out + note);
      if (a && a.error && a.error !== 'sem chave de IA') ipcRenderer.invoke('dialog:error', `Parágrafos da IA não gerados em todos os tópicos: ${a.error}. O material foi exportado com o que foi gerado.`);
    } catch (e) { ipcRenderer.invoke('dialog:error', 'Não foi possível exportar: ' + e.message); }
    finally { exportProgress.hide(); }
  };
  cancel.onclick = () => closeModal();
  md.onclick = () => run('md');
  pdf.onclick = () => run('pdf');
  const dio = el('button', 'btn', 'Gerar Draw.io'); dio.id = 'exDrawio'; dio.title = 'Abre no diagrams.net e na extensão Draw.io do VS Code';
  dio.onclick = () => run('drawio');
  if (isFlow(map)) foot.append(cancel, dio, md, pdf); else foot.append(cancel, md, pdf);
  box.append(foot);
  m.append(box);
  pdf.focus();
  m.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); closeModal(); } });
}

act['export-study'] = () => openExportModal('export');
act['share-study'] = () => openExportModal('share');
window.exportStudyTo = exportStudyTo;
