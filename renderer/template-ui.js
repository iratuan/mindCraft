'use strict';
// Escolha de modelo de concurso (renderer/template-ui.js): lista pesquisável dos modelos de core/templates.
// Escolher um modelo usa a mesma importação do CSV ("Criar o mapa"), com a mesma confirmação de descarte.
const { listTemplates, createTemplateMap } = require(path.join(core, 'templates'));

function openTemplatePicker() {
  if (typeof closeHome === 'function') closeHome();   // a tela inicial cobre o modal: fecha-a antes, como na importação de CSV
  closeDash();
  const m = $('#modal'); m.textContent = ''; m.hidden = false;
  const bx = el('div', 'modal-box'); bx.id = 'tplBox';
  const q = el('input'); q.type = 'text'; q.id = 'tplSearch'; q.placeholder = 'buscar por concurso, cargo ou fonte';
  const list = el('div', 'tpl-list'); list.id = 'tplList';
  const models = listTemplates();
  const draw = () => {
    list.textContent = '';
    const s = q.value.trim().toLowerCase();
    for (const t of models.filter((x) => !s || (x.title + ' ' + x.fonte).toLowerCase().includes(s))) {
      const b = el('button', 'tpl-item'); b.dataset.tpl = t.id;
      b.append(el('b', '', t.title), el('span', 'muted', `${t.topicos} tópicos em ${t.disciplinas} disciplinas`));
      b.onclick = () => chooseTemplate(t.id);
      list.append(b);
    }
    if (!list.children.length) list.append(el('div', 'empty', 'Nenhum modelo encontrado.'));
  };
  q.oninput = draw;
  const hint = el('div', 'muted', 'Escolha um modelo com as disciplinas e os tópicos do edital. Confira com o edital publicado antes de estudar.');
  const foot = el('div', 'foot');
  const generic = el('button', 'btn', 'Começar do zero (modelo genérico)'); generic.id = 'tplGeneric';
  generic.onclick = async () => { if (await confirmDiscard()) { closeModal(); newGenericTemplate(); } };
  const cancel = el('button', 'btn', 'Cancelar'); cancel.id = 'tplCancel'; cancel.onclick = closeModal;
  foot.append(el('span', 'grow'), generic, cancel);
  bx.append(el('h2', '', 'Novo mapa de concurso'), hint, q, list, foot);
  m.append(bx);
  draw(); q.focus();
}

/** Cria o mapa do modelo escolhido pela mesma rotina da importação do CSV (confirma descarte, adota o mapa). */
async function chooseTemplate(id) {
  const cm = createTemplateMap(id);
  if (!cm) { setStatus('Modelo não encontrado.'); return; }
  await applyCsvImport(cm, { name: cm.root.title, mode: 'new', close: closeModal });
}