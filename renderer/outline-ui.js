'use strict';
/* Estrutura do mapa mental (painel de tópicos). Usa as globais de renderer.js (L, map, svg, selectedId...). Carregado depois de renderer.js. */

function buildOutline() {
  if (!L || (typeof flowIsOn === 'function' && flowIsOn())) return;   // a estrutura do mapa mental não se aplica ao fluxograma
  const parts = [selectedId, selectedRel, hits ? [...hits].join(',') : ''];
  map.walk((n, l) => parts.push(n.id, n.title, n.collapsed, n.progress, (n.markers || []).join(), l));
  const sig = parts.join('|');
  if (sig === outlineSig) return;
  outlineSig = sig;
  const box = $('#outline');
  if (window.MCReact) {                                                    // interface React: monta o modelo de linhas e deixa o React pintar
    const rows = [];
    const addRow = (n, depth, branch) => {
      rows.push({ id: n.id, depth, branch, sel: n.id === selectedId, hit: !!(hits && hits.has(n.id)), title: n.title, progress: n.progress, hasChildren: n.children.length > 0, collapsed: n.collapsed });
      if (!n.collapsed) n.children.forEach((c, i) => addRow(c, depth + 1, depth === 0 ? L.theme.branches[i % L.theme.branches.length] : branch));
    };
    addRow(map.root, 0, L.theme.branches[0]);
    window.MCReact.renderOutline(rows);
  } else {
  if (window.MCReact) window.MCReact.unmountOutline();
  box.textContent = '';
  const frag = document.createDocumentFragment();
  const add = (n, depth, branch) => {
    const row = document.createElement('div');
    row.className = 'ol-row' + (n.id === selectedId ? ' sel' : '') + (hits && hits.has(n.id) ? ' hit' : '');
    row.dataset.olId = n.id; row.setAttribute('role', 'treeitem');
    row.style.paddingLeft = 8 + Math.min(depth, 8) * 14 + 'px';   // recuo limitado: níveis fundos não saem do painel
    const tog = document.createElement('span');
    tog.className = 'ol-tog';
    if (n.children.length) { tog.textContent = n.collapsed ? '▶' : '▼'; tog.dataset.olTog = n.id; }
    const dot = document.createElement('span');
    dot.className = 'ol-dot'; dot.style.background = branch;
    const t = document.createElement('span');
    t.className = 'ol-t'; t.textContent = n.title;
    if (depth > 8) { const lv = document.createElement('span'); lv.className = 'ol-lvl'; lv.textContent = depth; row.title = `${n.title} — nível ${depth}`; row.append(tog, dot, lv, t); }
    else row.append(tog, dot, t);
    if (n.progress != null) { const p = document.createElement('span'); p.className = 'ol-pct'; p.textContent = n.progress + '%'; row.append(p); }
    frag.append(row);
    if (!n.collapsed) n.children.forEach((c, i) => add(c, depth + 1, depth === 0 ? L.theme.branches[i % L.theme.branches.length] : branch));
  };
  add(map.root, 0, L.theme.branches[0]);
  box.append(frag);
  }
  // rola SÓ a lista da Estrutura (scrollIntoView rolaria também a coluna de painéis inteira)
  const s = box.querySelector('.sel'), sc = box.parentElement;
  if (s && sc) {
    const top = s.offsetTop - box.offsetTop, bot = top + s.offsetHeight;
    if (top < sc.scrollTop) sc.scrollTop = top; else if (bot > sc.scrollTop + sc.clientHeight) sc.scrollTop = bot - sc.clientHeight;
  }
}
