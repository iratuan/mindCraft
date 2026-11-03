import { useEscape } from './hooks.js';

const GROUPS = [
  ['Mapa', [['Tab', 'novo tópico filho'], ['Enter', 'novo tópico irmão'], ['F2', 'renomear o tópico'], ['Espaço', 'recolher/expandir o ramo'], ['Delete', 'excluir'],
    ['Ctrl+Z / Ctrl+Y', 'desfazer / refazer'], ['Ctrl+C / X / V', 'copiar, recortar e colar tópicos'], ['Alt+↑ ↓', 'mover o tópico entre irmãos'], ['Alt+← →', 'subir / descer de nível'],
    ['Ctrl+F', 'buscar no mapa'], ['Ctrl+0', 'ajustar à tela'], ['Ctrl+\\', 'recolher/expandir o painel lateral'], ['Ctrl + roda do mouse', 'zoom'],
    ['Ctrl+Shift+M', 'fechar o mapa'], ['Ctrl+Shift+H', 'tela inicial'], ['Shift + arrastar no fundo', 'selecionar vários tópicos']]],
  ['Ligações', [['R', 'seta de relação: clique no tópico de origem e depois no de destino'], ['Alt + arrastar', 'seta de relação entre dois tópicos (solte sobre o destino)'], ['Ctrl+K (nas notas)', 'link de texto [[ ]] para outro tópico ou mapa']]],
  ['Notas e IA', [['N', 'adicionar ou editar a nota do tópico'], ['Ctrl+B / Ctrl+I', 'negrito / itálico na nota'], ['[[', 'autocompletar links nas notas'],
    ['Tecla de menu / Shift+F10', 'menu de contexto do tópico']]],
  ['Janela', [['Ctrl+E', 'painel de mapas'], ['Ctrl+G', 'rede de conhecimento'], ['Ctrl+Shift+P', 'leitor de PDF ao lado do mapa'], ['Alt+1 … 5', 'abas do painel: Estilo, Notas, Conexões, Assistente, Estrutura'], ['Esc', 'fecha a janela, o menu ou a pesquisa']]],
  ['PDF', [['Selecionar texto', 'botões ＋ Tópico / ＋ Nota'], ['Ctrl + clique no destaque', 'ir ao tópico do trecho'], ['Arrastar o divisor', 'mudar a largura do leitor'], ['← → no divisor', 'ajustar a largura (Shift = passo grande; duplo clique restaura)']]],
  ['Arquivos', [['Ctrl+N / O / S', 'novo mapa, abrir, salvar (.mom)'], ['Ctrl+Shift+S', 'salvar como'], ['F1', 'esta ajuda']]],
];

/** Atalhos do teclado (F1). */
export function ShortcutsModal({ onClose }) {
  useEscape(onClose);
  return (
    <div className="modal-box" id="keysBox" data-ui="react">
      <h2>Atalhos do teclado</h2>
      <div className="keys-grid">
        {GROUPS.map(([g, rows]) => (
          <div key={g} className="keys-group"><h3>{g}</h3>{rows.map(([k, d]) => <div className="keys-row" key={k}><kbd>{k}</kbd><span>{d}</span></div>)}</div>
        ))}
      </div>
      <div className="foot"><span className="grow" /><button className="btn primary" id="keysClose" onClick={onClose}>Fechar</button></div>
    </div>
  );
}
