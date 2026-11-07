# MindCraft ↔ Obsidian — formato e compatibilidade

Objetivo: desenhar os mapas no MindCraft e ver a **mesma rede** no Obsidian (grafo, retrolinks, busca) e na visão de rede do próprio MindCraft (2D e 3D).

## Como funciona

1. Você salva o mapa no MindCraft → o `.mom` é gravado (formato Mindomo, sem alteração).
2. Se a pasta do Obsidian estiver escolhida e "Atualizar ao salvar o mapa" estiver ligado (menu ⋯ da rede), o MindCraft gera/atualiza as notas em `<pasta do Obsidian>/MindCraft/`.
3. No Obsidian, abra **a pasta que contém `MindCraft/`** como vault. O grafo mostra a rede.

A exportação é **uma via**: o Obsidian lê, o MindCraft escreve. Edições feitas no Obsidian nas notas geradas não são importadas de volta; o MindCraft detecta a edição e **não sobrescreve** a nota.

## Mapeamento

| MindCraft / Mindomo | Obsidian | Observação |
|---|---|---|
| Mapa (`.mom`) | pasta `MindCraft/<mapa>/` | nomes repetidos ganham `(2)` |
| Tópico | nota `.md` | um arquivo por tópico; o grafo do Obsidian é por nota |
| `[[Título]]` no texto | `[[MindCraft/Mapa/Título\|Título]]` | caminho completo: títulos repetidos não se misturam |
| `[[Mapa/Tópico]]` | mesmo link | sintaxe do Obsidian |
| `[[Tópico#Seção]]` | `[[…/Tópico#Seção\|…]]` | a seção precisa existir na nota; senão o link vai só para a nota |
| `[[Mapa#Tópico]]` (legado) | mesmo destino | vale como mapa#tópico se existir um mapa "Mapa"; senão, nota#seção |
| `[[X]]` sem destino | link "fantasma" | o Obsidian mostra como nota inexistente, igual ao MindCraft |
| Hierarquia (pai/filhos) | "Parte de:" e "## Subtópicos" | links no fim da nota |
| Relação (seta do mapa) | "## Relações" com `→` / `←` | o rótulo da seta vai junto |
| Progresso | `progresso:` no cabeçalho | propriedade do Obsidian |
| Tópico solto do Mindomo | nota própria | entra na rede como raiz, como no MindCraft |

Cabeçalho de cada nota:
```yaml
---
mindcraft-id: "Mapa::id-do-topico"   # origem; é o que diz "esta nota é minha"
mapa: "Mapa"
progresso: 60                         # quando existe
aliases:
  - "Título"
tags:
  - mindcraft
mindcraft-hash: "..."                 # impressão do conteúdo; detecta edição no Obsidian
---
```

## Garantias

- **Nunca apaga.** Notas que deixaram de ser geradas (tópico removido, mapa renomeado) ficam no disco e são contadas como "antigas".
- **Não sobrescreve o que é seu.** Nota com o mesmo nome criada por você (sem `mindcraft-id`) é pulada.
- **Não sobrescreve edição.** Se você mudou uma nota gerada no Obsidian (corpo ou cabeçalho), ela é pulada e o aviso aparece na barra de status.
- **Gravação atômica** (arquivo temporário + renomear) e **sem regravar o que não mudou**.
- Caminhos limitados a 50/80 caracteres por parte, para não estourar o limite de 260 caracteres do Windows.
- O `.mom` não é tocado pela exportação.

## Compatibilidade, por sistema

- **MindCraft:** a rede exportada é calculada pela mesma função do grafo (`core/graph.js`) usada pela visão 2D e pela rede 3D. O teste `test/obsidian-network.test.js` lê os `.md` e compara com o grafo: links do texto, hierarquia e relações batem.
- **Mindomo:** nada muda no `.mom`. Tópicos soltos e relações são preservados na leitura.
- **Obsidian:** a sintaxe segue a documentação oficial de links internos e aliases. Os arquivos foram checados por leitura (links resolvem, nenhum quebrado). **Não foi testado no Obsidian aberto** — ver abaixo.

## Limites conhecidos

- **Não testado no Obsidian real.** Recomendo abrir uma cópia da pasta `MindCraft/` como vault de teste antes de usar com seu vault pessoal.
- **Sem volta.** Editar no Obsidian não altera o MindCraft.
- **Renomear um tópico ou mapa** cria uma nota nova; a antiga fica como "antiga" (não é apagada). Não há renomeação em cadeia ainda.
- **Não exportado:** marcadores, cores, formas, temas, anexos (PDF), embeds `![[…]]`, links de bloco `[[Nota#^id]]`.
- **Nomes iguais em vault com notas suas:** o aviso de escolha da pasta aparece, mas a exportação não impede o conflito. Links gerados usam o caminho completo; links antigos escritos só com o nome (`[[Preposição]]`) podem ser afetados.
- **Varredura da pasta:** com a pasta do vault configurada, cada salvamento relê os `.mom` da pasta (até 500 arquivos, com cache). Pastas muito grandes podem deixar o salvamento mais lento.

## Decisões tomadas

1. **Vault dedicado.** Recomendado: uma pasta só para o MindCraft, aberta no Obsidian como vault separado. Se a pasta já tiver notas suas, o MindCraft avisa na hora de escolhê-la (ao ver a contagem, nada é alterado).
2. **Forma única de link.** A forma do Obsidian (`[[Mapa/Tópico]]`) é a padrão. Os textos antigos `[[Mapa#Tópico]]` não são alterados sozinhos: no menu ⋯ da rede, "Padronizar links deste mapa" troca só os links que apontam para mapas existentes. Vale por mapa, num só desfazer (Ctrl+Z), e só grava quando você salva.
3. **Sem volta.** O Obsidian lê; o MindCraft escreve. Importar edições do Obsidian fica fora do escopo.
