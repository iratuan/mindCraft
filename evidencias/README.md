# Evidências do MindCraft

Geradas automaticamente por `npm run evidence` (app real em execução; data de referência dos mapas: **2026-10-20**).

## Telas

### Tela inicial
App abre com barra de ferramentas, painéis e prancheta (tema escuro).

![Tela inicial](telas/01_mapa-inicial.png)

### Mapa de estudo do concurso
Progresso agregado (barras azuis nos blocos), marcadores, relações, selos ↻ de revisão pendente e notas.

![Mapa de estudo do concurso](telas/02_mapa-de-estudo.png)

### Painel "Estudo do tópico"
Peso, próxima revisão, ciclo, tempo (cronômetro e manual) e questões do tópico selecionado.

![Painel "Estudo do tópico"](telas/03_estudo-do-topico.png)

### Painel de estudos
Contagem regressiva, progresso geral, tempo, sequência, acerto em questões, plano por dia, disciplinas e revisões.

![Painel de estudos](telas/04_painel-de-estudos.png)

### Revisões pendentes e próximos 7 dias
Fila de revisão ordenada (mais atrasada primeiro) com ✓/↻ rápidos.

![Revisões pendentes e próximos 7 dias](telas/05_revisoes-e-semana.png)

### Painel de estudos no tema claro
A interface tem tema claro/escuro.

![Painel de estudos no tema claro](telas/06_painel-claro.png)

### Mapa no tema claro
Mesmo mapa no tema claro da interface.

![Mapa no tema claro](telas/07_mapa-claro.png)

### Painel de Conexões
Links de saída, "citado em" (retrolinks) e menções sem link do tópico selecionado.

![Painel de Conexões](telas/08_conexoes-e-links.png)

### Menção sem link
O app detecta "moralidade" no texto de "Atos administrativos" e oferece transformar em [[link]].

![Menção sem link](telas/09_mencao-sem-link.png)

### Autocompletar [[
Digitar [[ nas notas sugere tópicos do mapa (e Mapa#Tópico de outros mapas do vault).

![Autocompletar [[](telas/10_autocompletar-links.png)

### Rede de conhecimento — este mapa
Grafo de forças: tópicos ligados por [[links]] e relações; o pontilhado seria um link sem destino.

![Rede de conhecimento — este mapa](telas/11_grafo-do-mapa.png)

### Grafo — detalhes do nó
Selecionar um nó mostra seus links e retrolinks no painel lateral.

![Grafo — detalhes do nó](telas/12_grafo-detalhe.png)

### Grafo — só links
Desligando "Hierarquia", sobram apenas os [[links]] e as relações (como o grafo do Obsidian).

![Grafo — só links](telas/13_grafo-so-links.png)

### Grafo — vizinhança local + busca
Só os vizinhos do nó selecionado (1 salto) e destaque da busca.

![Grafo — vizinhança local + busca](telas/14_grafo-vizinhanca.png)

### Grafo — vault com 3 mapas
Escolhendo a pasta, mapas diferentes (cores) se ligam por [[Mapa#Tópico]].

![Grafo — vault com 3 mapas](telas/15_grafo-vault.png)

### Exportação para o Obsidian
Gera um .md por mapa com [[Mapa#Tópico]] (ver exemplos/obsidian-vault/).

![Exportação para o Obsidian](telas/16_exportar-obsidian.png)

### Seleção múltipla
Ctrl/Shift+clique e retângulo de seleção; ações valem para todos os selecionados.

![Seleção múltipla](telas/17_multisselecao.png)

### Formatação em lote
Cor, marcador e progresso aplicados a vários tópicos de uma vez (um único desfazer).

![Formatação em lote](telas/18_lote-formatado.png)

### Importar edital
Cola o conteúdo programático; o app detecta disciplinas, numeração, itens a) e junta linhas quebradas do PDF.

![Importar edital](telas/19_importar-edital.png)

### Mapa gerado pelo edital
O edital virou mapa: disciplinas → itens → subitens.

![Mapa gerado pelo edital](telas/20_edital-importado.png)

### Modelo de concurso
Estrutura pronta (disciplinas × Teoria/Resumos/Questões/Revisão).

![Modelo de concurso](telas/21_modelo-concurso.png)

### Modo apresentação
Revela os tópicos um a um em tela cheia (útil para revisar em voz alta).

![Modo apresentação](telas/22_apresentacao.png)

### PDF exportado
O mapa (selos, barras, relações) e o outline em página A4, abertos no visualizador de PDF.

![PDF exportado](telas/23_pdf-exportado.png)
