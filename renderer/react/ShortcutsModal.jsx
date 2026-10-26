import { useEscape } from './hooks.js';

const GROUPS = [
  ['Mapa', [['Tab', 'novo tópico filho'], ['Enter', 'novo tópico irmão'], ['F2', 'editar o título'], ['Espaço', 'recolher/expandir'], ['Delete', 'excluir'], ['R', 'ligar dois tópicos (relação)'],
    ['Ctrl+Z / Ctrl+Y', 'desfazer / refazer'], ['Ctrl+C / X / V', 'copiar, recortar e colar tópicos'], ['Alt+↑ ↓', 'mover o tópico entre irmãos'], ['Alt+← →', 'subir / descer de nível'],
    ['Ctrl+F', 'buscar no mapa'], ['Ctrl+0', 'ajustar à tela'], ['Ctrl+\\', 'recolher/expandir o painel lateral'], ['Ctrl + roda do mouse', 'zoom']]],
  ['Estudo', [['Ctrl+E', 'painel de estudos'], ['Ctrl+Shift+R', 'revisão do dia (recordação ativa)'], ['Ctrl+G', 'rede de conhecimento'], ['Ctrl+Shift+B', 'biblioteca de mapas'], ['Alt+1 … 5', 'abas: Estilo, Estudo, Notas, Conexões, Estrutura']]],
  ['PDF', [['Ctrl+Shift+P', 'abrir/fechar o leitor de PDF ao lado do mapa'], ['Selecionar texto', 'botões ＋ Tópico / ＋ Nota'], ['Ctrl + clique no destaque', 'ir ao tópico do trecho'], ['Arrastar o divisor', 'mudar a largura do leitor'], ['← → no divisor', 'ajustar a largura (Shift = passo grande; duplo clique restaura)']]],
  ['Notas (Markdown)', [['Ctrl+B / Ctrl+I', 'negrito / itálico'], ['Ctrl+K', 'ligar a outro tópico [[ ]]'], ['[[', 'autocompletar links']]],
  ['Arquivos', [['Ctrl+N / O / S', 'novo, abrir, salvar'], ['Ctrl+Shift+S', 'salvar como (num mapa da biblioteca: exporta uma cópia .mom)'], ['F1', 'esta ajuda']]],
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
