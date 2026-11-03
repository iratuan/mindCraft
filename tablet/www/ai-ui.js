'use strict';
/* Painel do assistente (Claude): guarda a chave, responde sobre o tópico selecionado, guarda a resposta na nota e gera tópicos
   que entram no mapa em um único lote. Regra de segurança: cada pedido guarda o mapa e o tópico de origem. Se o mapa foi fechado,
   trocado ou a tela inicial tomou o lugar, a resposta é descartada e nada é alterado. Carregado depois de renderer.js e react-bridge.js. */

let aiPending = null;   // pedido em andamento: { map, parentId }
let aiOutline = null;   // prévia de tópicos aguardando "Inserir": { map, parentId, topics }
let aiAnswer = null;    // última resposta em texto: { map, parentId, text }

const aiEl = (id) => document.getElementById(id);
/** Provedor escolhido no seletor (padrão: Groq, gratuito). A escolha fica lembrada neste computador. */
const aiProv = () => aiEl('aiProvider').value || 'groq';
/** Modelo escolhido para o provedor atual (vazio = padrão do app). Lembrado por provedor neste computador. */
const aiModelKey = () => 'mc-ai-model-' + aiProv();
const aiModel = () => aiEl('aiModel').value || '';
function aiRememberModel() { try { localStorage.setItem(aiModelKey(), aiModel()); } catch { /* sem storage */ } }
function aiRestoreModel() {
  let m = ''; try { m = localStorage.getItem(aiModelKey()) || ''; } catch { /* sem storage */ }
  const sel = aiEl('aiModel'); sel.textContent = '';
  sel.append(new Option('Modelo padrão', ''));
  if (m) sel.append(new Option(m, m));
  sel.value = m;
}

/** Mensagem curta no topo do painel. kind: 'ok' | 'err' | '' (informação). Mensagem vazia esconde. */
function aiSay(text, kind) {
  const m = aiEl('aiMsg');
  m.textContent = text || ''; m.className = 'ai-msg' + (kind ? ' ' + kind : '');
  m.hidden = !text;
}

/** Só a seleção vai para o assistente: o título e a nota do tópico selecionado (nunca o mapa inteiro). */
function aiSelectionText() {
  const s = primary();
  return s ? [s.node.title, s.node.notes].filter(Boolean).join('\n') : '';
}

/** Caminho do tópico selecionado dentro do mapa (ex.: Direito › Administrativo › Atos): o tema que contextualiza a pergunta. */
function aiTopicPath() {
  const s = primary();
  if (!s || !map) return '';
  const trail = [];
  (function walk(n) { if (n.id === s.node.id) return true; trail.push(n.title); for (const c of n.children) if (walk(c)) return true; trail.pop(); return false; })(map.root);
  return trail.concat([s.node.title]).join(' › ');
}

async function aiRefreshKey() {
  const st = await ipcRenderer.invoke('ai:key-status', aiProv());
  const badge = aiEl('aiKeyBadge');
  const label = aiEl('aiProvider').selectedOptions[0].textContent;
  badge.textContent = !st.available ? 'Indisponível' : st.saved ? 'Chave guardada' : 'Sem chave';
  badge.className = 'ai-badge ' + (st.saved && st.available ? 'ok' : st.available ? 'warn' : 'err');
  aiEl('aiKeyState').textContent = !st.available ? 'Este computador não consegue proteger a chave, então o assistente fica indisponível.'
    : st.saved ? `Chave do ${label} guardada, cifrada neste computador. Para trocar, cole outra abaixo.`
    : `Cole a chave do ${label}. Ela fica cifrada neste computador e nunca vai para o arquivo do mapa.`;
  aiEl('aiKeyClear').hidden = !st.saved;
  aiEl('aiKeyIn').disabled = !st.available;
  aiEl('aiKeySave').disabled = !st.available;
  aiEl('aiKeyBox').open = !st.saved;                  // sem chave, a seção abre sozinha; com chave, fica recolhida
}
async function aiSaveKey() {
  const r = await ipcRenderer.invoke('ai:key-save', aiProv(), aiEl('aiKeyIn').value);
  if (!r.ok) return aiSay(r.error, 'err');
  aiEl('aiKeyIn').value = '';
  aiSay('Chave guardada com segurança.', 'ok');
  aiRefreshKey();
}
async function aiClearKey() {
  await ipcRenderer.invoke('ai:key-clear', aiProv());
  aiSay('Chave removida deste computador.', 'ok');
  aiRefreshKey();
}

/** Liga o indicador de carregamento e trava os botões enquanto a resposta não chega. */
function aiBusy(on) {
  aiEl('aiBusy').hidden = !on;
  aiEl('aiAsk').disabled = on; aiEl('aiOutline').disabled = on; aiEl('aiNotes').disabled = on;
}
function aiHideResults() { aiEl('aiOut').hidden = true; aiEl('aiPrev').hidden = true; aiOutline = null; }

/** Pergunta ('answer') ou pede tópicos ('outline') sobre o tópico selecionado. */
async function aiRun(mode) {
  if (!map || !primary()) return aiSay('Selecione um tópico no mapa primeiro.', 'err');
  if (aiPending) return aiSay('Espere a resposta anterior terminar.', '');
  const question = aiEl('aiQ').value.trim();
  if (mode === 'answer' && !question) return aiSay('Escreva uma pergunta, ou use “Gerar tópicos” ou “Gerar nota”.', 'err');
  const ctx = { map, parentId: primary().node.id };
  aiPending = ctx; aiHideResults(); aiSay('', ''); aiBusy(true);
  let r;
  try { r = await ipcRenderer.invoke('ai:ask', { provider: aiProv(), model: aiModel(), mode, question, selection: aiSelectionText(), topic: aiTopicPath() }); }
  catch (e) { r = { ok: false, error: e.message }; }
  aiPending = null; aiBusy(false);
  // o mapa pode ter fechado ou trocado enquanto o assistente pensava: nada entra no mapa errado
  if (!map || map !== ctx.map) return aiSay('O mapa foi fechado ou trocado antes da resposta. Nada foi alterado.', 'err');
  if (!r.ok) return aiSay(r.error, 'err');
  if (mode === 'outline') { aiOutline = { ...ctx, topics: r.topics }; aiShowPreview(r.topics); }
  else { aiAnswer = { ...ctx, text: r.text, kind: mode }; aiShowAnswer(r.text, mode); }
}

function aiShowAnswer(text, mode) {
  aiEl('aiOutText').textContent = text;
  aiEl('aiOut').hidden = false;
  aiSay(mode === 'notes' ? 'Nota pronta, curta de propósito. Ela só entra na nota do tópico se você clicar em “Guardar na nota”.' : 'Resposta pronta. Ela não é gravada no mapa até você clicar em “Guardar na nota”.', 'ok');  aiEl('aiOut').scrollIntoView({ block: 'nearest' });   // depois da mensagem: ela ocupa espaço acima do resultado
}

/** Limpa o texto gerado pela IA da tela. Não altera o mapa nem a nota: o que já foi guardado na nota continua lá. */
function aiClearAnswer() {
  aiAnswer = null;
  aiEl('aiOutText').textContent = '';
  aiHideResults();
  aiSay('Texto da IA limpo.', 'ok');
}

/** Copia a resposta para a área de transferência. */
async function aiCopy() {
  if (!aiAnswer) return;
  await ipcRenderer.invoke('clip:write', aiAnswer.text);
  aiSay('Resposta copiada.', 'ok');
}

/** Acrescenta a resposta à nota do tópico de origem (uma ação desfazível). Só se o mapa for o mesmo. */
function aiSaveToNote() {
  const a = aiAnswer;
  if (!a) return;
  if (!map || map !== a.map || !map.find(a.parentId)) return aiSay('O tópico ou o mapa mudou. Faça a pergunta de novo.', 'err');
  const cur = map.find(a.parentId).node.notes || '';
  // nota gerada: texto normal; resposta a uma pergunta: citação com a origem
  const block = a.kind === 'notes' ? a.text : '> ' + a.text.replace(/\n/g, '\n> ') + '\n> — assistente';
  const next = (cur.trim() ? cur.replace(/\s+$/, '') + '\n\n' : '') + block;
  change(() => map.update(a.parentId, { notes: next }));
  aiSay('Resposta guardada na nota do tópico. Ctrl+Z desfaz.', 'ok');
}

/** Prévia dos tópicos em árvore, com contagem e as ações Inserir/Descartar. */
function aiShowPreview(topics) {
  const box = aiEl('aiPrev');
  const count = (list) => list.reduce((n, t) => n + 1 + count(t.children), 0);
  const list = (items) => {
    const ul = document.createElement('ul'); ul.className = 'ai-tree';
    for (const t of items) {
      const li = document.createElement('li'); li.textContent = t.title;
      if (t.note) { const nt = document.createElement('div'); nt.className = 'ai-tree-note'; nt.textContent = t.note; li.append(nt); }
      if (t.children.length) li.append(list(t.children));
      ul.append(li);
    }
    return ul;
  };
  box.textContent = '';
  const head = document.createElement('div'); head.className = 'ai-ctx-title';
  head.textContent = `Prévia: ${count(topics)} tópico(s) em ${topics.length} ramo(s)`;
  const acts = document.createElement('div'); acts.className = 'ai-actions';
  const ins = document.createElement('button'); ins.type = 'button'; ins.className = 'btn primary'; ins.id = 'aiInsert';
  ins.textContent = 'Inserir no mapa'; ins.onclick = aiInsert;
  const dis = document.createElement('button'); dis.type = 'button'; dis.className = 'btn'; dis.textContent = 'Descartar';
  dis.onclick = () => { aiOutline = null; box.hidden = true; box.textContent = ''; aiSay('Prévia descartada. Nada foi alterado.', ''); };
  acts.append(ins, dis);
  box.append(head, list(topics), acts);
  box.hidden = false;
  aiSay('Confira a prévia. Os tópicos só entram no mapa quando você clicar em “Inserir no mapa”.', '');
  box.scrollIntoView({ block: 'nearest' });
}

/** Insere a prévia como filhos do tópico de origem, em um único lote (um Ctrl+Z desfaz tudo). */
function aiInsert() {
  const o = aiOutline;
  if (!o) return;
  aiOutline = null;
  const box = aiEl('aiPrev');
  box.hidden = true; box.textContent = '';
  if (!map || map !== o.map) return aiSay('O mapa mudou. Gere os tópicos de novo.', 'err');
  if (!map.find(o.parentId)) return aiSay('O tópico escolhido não existe mais. Gere os tópicos de novo.', 'err');
  const build = (list) => list.map((t) => createNode(t.title, { notes: t.note || '', children: build(t.children) }));
  const count = (list) => list.reduce((n, t) => n + 1 + count(t.children), 0);
  try {
    change(() => map.batch(() => { for (const n of build(o.topics)) map.addSubtree(o.parentId, n); return true; }));
  } catch (e) { return aiSay(e.message, 'err'); }
  organizeMap();   // refaz a disposição com os novos filhos (o mapa pode ter ficado com ramos antigos recolhidos ou fora da vista)
  aiSay(`${count(o.topics)} tópico(s) inseridos no mapa. Ctrl+Z desfaz.`, 'ok');
}

aiEl('aiKeySave').addEventListener('click', aiSaveKey);
aiEl('aiTest').addEventListener('click', async () => {
  aiSay('Testando a conexão…', '');
  const r = await ipcRenderer.invoke('ai:test', aiProv(), aiModel());
  aiSay(r.ok ? 'Conexão confirmada: o provedor respondeu.' : r.error, r.ok ? 'ok' : 'err');
});
aiEl('aiModels').addEventListener('click', async () => {
  aiSay('Consultando os modelos da sua conta… escolha um no seletor ao lado.', '');
  const r = await ipcRenderer.invoke('ai:models', aiProv());
  if (!r.ok) return aiSay(r.error, 'err');
  const cur = aiModel(), sel = aiEl('aiModel');
  sel.textContent = ''; sel.append(new Option('Modelo padrão', ''));
  for (const id of r.ids) sel.append(new Option(id, id));
  sel.value = r.ids.includes(cur) ? cur : '';
  aiRememberModel();
  aiSay(`${r.ids.length} modelo(s) disponível(is). Escolha um e teste a conexão.`, 'ok');
});
aiEl('aiModel').addEventListener('change', aiRememberModel);
aiEl('aiProvider').value = (() => { try { return localStorage.getItem('mc-ai-provider') || 'groq'; } catch { return 'groq'; } })();
aiEl('aiProvider').addEventListener('change', () => { try { localStorage.setItem('mc-ai-provider', aiProv()); } catch { /* sem storage */ } aiSay('', ''); aiRestoreModel(); aiRefreshKey(); });
aiRestoreModel();
aiEl('aiKeyClear').addEventListener('click', aiClearKey);
aiEl('aiAsk').addEventListener('click', () => aiRun('answer'));
aiEl('aiOutline').addEventListener('click', () => aiRun('outline'));
aiEl('aiNotes').addEventListener('click', () => aiRun('notes'));
aiEl('aiCopy').addEventListener('click', aiCopy);
aiEl('aiToNote').addEventListener('click', aiSaveToNote);
aiEl('aiClear').addEventListener('click', aiClearAnswer);
aiEl('aiQ').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); aiRun('answer'); } });
document.addEventListener('mc:render', () => {
  const s = primary();
  aiEl('aiSel').textContent = map && s ? s.node.title : 'Selecione um tópico no mapa.';
});
aiRefreshKey();
/** Atalhos do menu IA: abrem a aba do assistente (a configuração de provedor e modelo fica sempre visível nela). */
act['ai-open'] = () => { showPanel('ai'); };
act['ai-config'] = () => { showPanel('ai'); aiEl('aiConfig').scrollIntoView({ block: 'nearest' }); aiEl('aiProvider').focus(); };
