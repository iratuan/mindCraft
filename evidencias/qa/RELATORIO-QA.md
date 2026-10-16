# Relatório de QA por funcionalidade

Gerado por `npm run qa` em 16/10/2026, 14:47:38 — entrada real (mouse/teclado via Chromium), app executando de verdade.

**74 de 74 funcionalidades OK**.

**Medições:** Mapa de 1001 tópicos: render 35 ms, render+ajuste 107 ms

| # | Grupo | Funcionalidade | Como foi exercitada | Resultado | Captura |
|---|---|---|---|---|---|
| 1 | Mapa | Novo mapa (menu Arquivo › Novo) | Mensagem de menu "new" → mapa com raiz e 3 tópicos | ✅ OK | [01_novo-mapa-menu-arquivo-novo](01_novo-mapa-menu-arquivo-novo.png) |
| 2 | Mapa | Tab cria tópico filho; digitar e Enter confirma | Clique real no tópico → Tab → texto → Enter | ✅ OK | [02_tab-cria-topico-filho-digitar-e-enter-confirma](02_tab-cria-topico-filho-digitar-e-enter-confirma.png) |
| 3 | Mapa | Enter cria tópico irmão | Seleciona o filho → Enter → texto → Enter | ✅ OK | [03_enter-cria-topico-irmao](03_enter-cria-topico-irmao.png) |
| 4 | Mapa | F2 edita o tópico e Esc cancela | Clique → F2 → texto → Esc | ✅ OK | [04_f2-edita-o-topico-e-esc-cancela](04_f2-edita-o-topico-e-esc-cancela.png) |
| 5 | Mapa | Duplo clique edita o título (mouse real) | Duplo clique real (2 cliques seguidos) sobre o tópico | ✅ OK | [05_duplo-clique-edita-o-titulo-mouse-real](05_duplo-clique-edita-o-titulo-mouse-real.png) |
| 6 | Mapa | Excluir, Desfazer e Refazer | Delete real; botões ↶ ↷ da barra de ferramentas | ✅ OK | [06_excluir-desfazer-e-refazer](06_excluir-desfazer-e-refazer.png) |
| 7 | Mapa | Recolher e expandir ramo (Espaço) | Seleciona "Tópico 1" → Espaço → contador no ramo | ✅ OK | [07_recolhido_recolher-e-expandir-ramo-espaco](07_recolhido_recolher-e-expandir-ramo-espaco.png) |
| 8 | Mapa | Arrastar tópico para dentro de outro (mover) | Arrasto real com 6 passos intermediários | ✅ OK | [08_arrastar-topico-para-dentro-de-outro-mover](08_arrastar-topico-para-dentro-de-outro-mover.png) |
| 9 | Mapa | Relação entre tópicos com rótulo; selecionar e excluir | R → clique no destino → digitar rótulo → clicar na seta → Delete | ✅ OK | [09_rotulo_relacao-entre-topicos-com-rotulo-selecionar-e-ex](09_rotulo_relacao-entre-topicos-com-rotulo-selecionar-e-ex.png) |
| 10 | Mapa | Marcadores e progresso (chips) | Clique real nos chips da barra Propriedades | ✅ OK | [10_marcadores-e-progresso-chips](10_marcadores-e-progresso-chips.png) |
| 11 | Mapa | Cor, forma e negrito do tópico | Seletor de cor (valor injetado: o diálogo nativo não é automatizável), forma e botão B reais | ✅ OK | [11_cor-forma-e-negrito-do-topico](11_cor-forma-e-negrito-do-topico.png) |
| 12 | Mapa | Notas do tópico | Clique real no painel, digitar, clicar fora | ✅ OK | [12_notas-do-topico](12_notas-do-topico.png) |
| 13 | Mapa | Notas em Markdown: barra de formatação, Visualizar, tarefas e [[link]] clicável | Cliques e digitação reais; Ctrl+A; botões da barra; caixa de tarefa e link na visualização | ✅ OK | [13_editando_notas-em-markdown-barra-de-formatacao-visualizar](13_editando_notas-em-markdown-barra-de-formatacao-visualizar.png)<br>[13_visualizar_notas-em-markdown-barra-de-formatacao-visualizar](13_visualizar_notas-em-markdown-barra-de-formatacao-visualizar.png)<br>[13_tarefa-marcada_notas-em-markdown-barra-de-formatacao-visualizar](13_tarefa-marcada_notas-em-markdown-barra-de-formatacao-visualizar.png) |
| 14 | Mapa | Relação desenhada = conexão: aparece em Conexões nos dois tópicos e some ao excluir | R + clique no destino; aba Conexões; clique na seta + Delete | ✅ OK | [14_saida_relacao-desenhada-conexao-aparece-em-conexoes-no](14_saida_relacao-desenhada-conexao-aparece-em-conexoes-no.png)<br>[14_retrolink_relacao-desenhada-conexao-aparece-em-conexoes-no](14_retrolink_relacao-desenhada-conexao-aparece-em-conexoes-no.png) |
| 15 | Mapa | Cinco temas visuais (cartões) | Clique real em cada cartão de tema | ✅ OK | [15_dark_cinco-temas-visuais-cartoes](15_dark_cinco-temas-visuais-cartoes.png)<br>[15_paper_cinco-temas-visuais-cartoes](15_paper_cinco-temas-visuais-cartoes.png)<br>[15_neon_cinco-temas-visuais-cartoes](15_neon_cinco-temas-visuais-cartoes.png)<br>[15_mono_cinco-temas-visuais-cartoes](15_mono_cinco-temas-visuais-cartoes.png)<br>[15_ocean_cinco-temas-visuais-cartoes](15_ocean_cinco-temas-visuais-cartoes.png) |
| 16 | Mapa | Busca no mapa | Clique real na caixa, digitar, Enter navega, Esc limpa | ✅ OK | [16_busca-no-mapa](16_busca-no-mapa.png) |
| 17 | Mapa | Zoom (roda e controle), pan e ajustar | Roda do mouse real, arrastar o fundo, botão Ajustar | ✅ OK | [17_zoom-roda-e-controle-pan-e-ajustar](17_zoom-roda-e-controle-pan-e-ajustar.png) |
| 18 | Mapa | Estrutura (outline): selecionar e recolher | Clique real nas linhas e no triângulo | ✅ OK | [18_estrutura-outline-selecionar-e-recolher](18_estrutura-outline-selecionar-e-recolher.png) |
| 19 | Mapa | Abas do painel lateral e tema claro da interface | Clique real em cada aba (uma por vez) e no botão do sol | ✅ OK | [19_aba-props_abas-do-painel-lateral-e-tema-claro-da-interface](19_aba-props_abas-do-painel-lateral-e-tema-claro-da-interface.png)<br>[19_aba-study_abas-do-painel-lateral-e-tema-claro-da-interface](19_aba-study_abas-do-painel-lateral-e-tema-claro-da-interface.png)<br>[19_aba-notes_abas-do-painel-lateral-e-tema-claro-da-interface](19_aba-notes_abas-do-painel-lateral-e-tema-claro-da-interface.png)<br>[19_aba-links_abas-do-painel-lateral-e-tema-claro-da-interface](19_aba-links_abas-do-painel-lateral-e-tema-claro-da-interface.png)<br>[19_aba-outline_abas-do-painel-lateral-e-tema-claro-da-interface](19_aba-outline_abas-do-painel-lateral-e-tema-claro-da-interface.png)<br>[19_claro_abas-do-painel-lateral-e-tema-claro-da-interface](19_claro_abas-do-painel-lateral-e-tema-claro-da-interface.png) |
| 20 | Mapa | Modo apresentação | Botão ▶, setas do teclado, Esc | ✅ OK | [20_passo-3_modo-apresentacao](20_passo-3_modo-apresentacao.png) |
| 21 | Mapa | Tópico sublinhado é clicável em toda a caixa (não só nas letras) | Cliques reais no canto esquerdo e no canto direito da caixa de um tópico de nível 3 | ✅ OK | [21_topico-sublinhado-e-clicavel-em-toda-a-caixa-nao](21_topico-sublinhado-e-clicavel-em-toda-a-caixa-nao.png) |
| 22 | Mapa | Tópico novo fora da vista é trazido para a tela | Zoom alto, tópico colado na borda direita, Tab: o editor deve ficar visível | ✅ OK | [22_digitando_topico-novo-fora-da-vista-e-trazido-para-a-tela](22_digitando_topico-novo-fora-da-vista-e-trazido-para-a-tela.png) |
| 23 | Mapa | Níveis: recolher e expandir o mapa por profundidade | Seletor "Níveis" da barra de opções; um único desfazer | ✅ OK | [23_nivel-1_niveis-recolher-e-expandir-o-mapa-por-profundida](23_nivel-1_niveis-recolher-e-expandir-o-mapa-por-profundida.png)<br>[23_nivel-2_niveis-recolher-e-expandir-o-mapa-por-profundida](23_nivel-2_niveis-recolher-e-expandir-o-mapa-por-profundida.png) |
| 24 | Mapa | Editor inline cresce com títulos longos (não corta a 1ª linha) | Tab + texto de 3 linhas em zoom alto | ✅ OK | [24_digitando_editor-inline-cresce-com-titulos-longos-nao-cort](24_digitando_editor-inline-cresce-com-titulos-longos-nao-cort.png) |
| 25 | Lote | Seleção múltipla: Ctrl+clique e retângulo (Shift) | Ctrl+clique real; Shift+arrasto real no fundo | ✅ OK | [25_retangulo_selecao-multipla-ctrl-clique-e-retangulo-shift](25_retangulo_selecao-multipla-ctrl-clique-e-retangulo-shift.png) |
| 26 | Lote | Formatar vários de uma vez e desfazer em 1 passo | Chips e botão B com vários selecionados; Ctrl+Z (botão) | ✅ OK | [26_formatar-varios-de-uma-vez-e-desfazer-em-1-passo](26_formatar-varios-de-uma-vez-e-desfazer-em-1-passo.png) |
| 27 | Lote | Copiar, colar e recortar tópicos (menu) | Itens Copiar/Colar/Recortar do menu nativo | ✅ OK | [27_copiar-colar-e-recortar-topicos-menu](27_copiar-colar-e-recortar-topicos-menu.png) |
| 28 | Lote | Colar um texto externo como ramos | Área de transferência com lista numerada → Colar | ✅ OK | [28_colar-um-texto-externo-como-ramos](28_colar-um-texto-externo-como-ramos.png) |
| 29 | Estudos | CSV da IA: importar o modelo e receber o esqueleto do mapa | Menu → Escolher arquivo (clique real) → prévia → Criar o mapa | ✅ OK | [29_previa_csv-da-ia-importar-o-modelo-e-receber-o-esquelet](29_previa_csv-da-ia-importar-o-modelo-e-receber-o-esquelet.png)<br>[29_mapa_csv-da-ia-importar-o-modelo-e-receber-o-esquelet](29_mapa_csv-da-ia-importar-o-modelo-e-receber-o-esquelet.png) |
| 30 | Estudos | CSV da IA: arquivo com problemas mostra erros e avisos antes de importar | CSV com linhas sem disciplina/tópico, peso e data inválidos | ✅ OK | [30_previa-com-erros_csv-da-ia-arquivo-com-problemas-mostra-erros-e-a](30_previa-com-erros_csv-da-ia-arquivo-com-problemas-mostra-erros-e-a.png) |
| 31 | Estudos | CSV da IA: copiar as instruções e salvar o modelo de exemplo | Botões da janela de importação | ✅ OK | [31_csv-da-ia-copiar-as-instrucoes-e-salvar-o-modelo](31_csv-da-ia-copiar-as-instrucoes-e-salvar-o-modelo.png) |
| 32 | Estudos | Planilha de planejamento: exportar, editar fora do app, importar com prévia e aplicar | Janela da planilha; cliques reais; arquivo editado em disco | ✅ OK | [32_janela_planilha-de-planejamento-exportar-editar-fora-do](32_janela_planilha-de-planejamento-exportar-editar-fora-do.png)<br>[32_previa_planilha-de-planejamento-exportar-editar-fora-do](32_previa_planilha-de-planejamento-exportar-editar-fora-do.png)<br>[32_aplicada_planilha-de-planejamento-exportar-editar-fora-do](32_aplicada_planilha-de-planejamento-exportar-editar-fora-do.png) |
| 33 | Estudos | Agenda de revisões (28 dias): clicar num dia lista os tópicos | Painel de estudos; cliques reais nos dias | ✅ OK | [33_dia-seguinte_agenda-de-revisoes-28-dias-clicar-num-dia-lista-](33_dia-seguinte_agenda-de-revisoes-28-dias-clicar-num-dia-lista-.png)<br>[33_hoje-com-atrasadas_agenda-de-revisoes-28-dias-clicar-num-dia-lista-](33_hoje-com-atrasadas_agenda-de-revisoes-28-dias-clicar-num-dia-lista-.png) |
| 34 | Estudos | Pontos fracos e acerto da semana no painel | Registra 10 questões (3 acertos) pela interface e confere o ranking | ✅ OK | [34_pontos-fracos-e-acerto-da-semana-no-painel](34_pontos-fracos-e-acerto-da-semana-no-painel.png) |
| 35 | Mapa | Alt+↑ ↓ ← → reordenam e mudam o nível do tópico (teclado real) | Alt + setas; limites explicados na barra de status | ✅ OK | [35_rebaixado_alt-reordenam-e-mudam-o-nivel-do-topico-teclado-](35_rebaixado_alt-reordenam-e-mudam-o-nivel-do-topico-teclado-.png) |
| 36 | Mapa | Alt+1…5 trocam as abas do painel lateral | Teclado real | ✅ OK | [36_aba-estrutura_alt-1-5-trocam-as-abas-do-painel-lateral](36_aba-estrutura_alt-1-5-trocam-as-abas-do-painel-lateral.png) |
| 37 | Dados | Backup ao salvar e "Restaurar versão anterior" | Salva 3 vezes por cima do mesmo arquivo; abre a versão antiga como mapa novo | ✅ OK | [37_backup-ao-salvar-e-restaurar-versao-anterior](37_backup-ao-salvar-e-restaurar-versao-anterior.png) |
| 38 | Dados | Ao iniciar, o app reabre o último mapa (e o painel, se configurado) | Chama a inicialização com um arquivo recente | ✅ OK | [38_ao-iniciar-o-app-reabre-o-ultimo-mapa-e-o-painel](38_ao-iniciar-o-app-reabre-o-ultimo-mapa-e-o-painel.png) |
| 39 | Arquivos | Salvar como, reabrir e título com ponto de "não salvo" | save(true) com diálogo simulado; reabrir pelo caminho | ✅ OK | [39_sujo_salvar-como-reabrir-e-titulo-com-ponto-de-nao-sa](39_sujo_salvar-como-reabrir-e-titulo-com-ponto-de-nao-sa.png) |
| 40 | Arquivos | Arquivos recentes no menu | Menu Arquivo › Abrir recente (conferido na estrutura do menu nativo) | ✅ OK — 4 item(ns) no menu | [40_arquivos-recentes-no-menu](40_arquivos-recentes-no-menu.png) |
| 41 | Arquivos | Importar Markdown e OPML | openPath em .md e .opml (arquivos temporários) | ✅ OK | [41_importar-markdown-e-opml](41_importar-markdown-e-opml.png) |
| 42 | Arquivos | Exportar PDF, Word, PNG, SVG, Markdown e OPML | doExport() de cada formato (diálogo simulado); arquivos abertos em visualizadores para captura | ✅ OK | [42_pdf_exportar-pdf-word-png-svg-markdown-e-opml](42_pdf_exportar-pdf-word-png-svg-markdown-e-opml.png)<br>[42_png_exportar-pdf-word-png-svg-markdown-e-opml](42_png_exportar-pdf-word-png-svg-markdown-e-opml.png)<br>[42_svg_exportar-pdf-word-png-svg-markdown-e-opml](42_svg_exportar-pdf-word-png-svg-markdown-e-opml.png)<br>[42_markdown_exportar-pdf-word-png-svg-markdown-e-opml](42_markdown_exportar-pdf-word-png-svg-markdown-e-opml.png)<br>[42_opml_exportar-pdf-word-png-svg-markdown-e-opml](42_opml_exportar-pdf-word-png-svg-markdown-e-opml.png)<br>[42_docx-texto_exportar-pdf-word-png-svg-markdown-e-opml](42_docx-texto_exportar-pdf-word-png-svg-markdown-e-opml.png) |
| 43 | Arquivos | Linha de comando (CLI) para conversões | node bin/mindcraft.js … em .mom/.md → pdf/docx/svg/opml/mom e entradas inválidas | ✅ OK | [43_linha-de-comando-cli-para-conversoes](43_linha-de-comando-cli-para-conversoes.png) |
| 44 | Estudos | Modelo de concurso | Menu Arquivo › Novo mapa de concurso (modelo) | ✅ OK | [44_modelo-de-concurso](44_modelo-de-concurso.png) |
| 45 | Estudos | Importar edital colando o texto | Modal: digitar nome, colar texto, ver contagem, Importar | ✅ OK | [45_modal_importar-edital-colando-o-texto](45_modal_importar-edital-colando-o-texto.png) |
| 46 | Estudos | Mapa de estudo: progresso agregado, selos ↻, marcadores | Mapa de exemplo (concurso) aberto do disco | ✅ OK | [46_mapa-de-estudo-progresso-agregado-selos-marcador](46_mapa-de-estudo-progresso-agregado-selos-marcador.png) |
| 47 | Estudos | "Estudei hoje", "Errei", peso e próxima revisão | Clique real nos botões do painel Estudo do tópico | ✅ OK | [47_estudei_estudei-hoje-errei-peso-e-proxima-revisao](47_estudei_estudei-hoje-errei-peso-e-proxima-revisao.png) |
| 48 | Estudos | Cronômetro de estudo | Iniciar → (tempo simulado: +12 min) → Parar | ✅ OK | [48_rodando_cronometro-de-estudo](48_rodando_cronometro-de-estudo.png) |
| 49 | Estudos | Minutos e questões, com validações visíveis | Digitar valores válidos e inválidos nos campos | ✅ OK | [49_erro_minutos-e-questoes-com-validacoes-visiveis](49_erro_minutos-e-questoes-com-validacoes-visiveis.png) |
| 50 | Estudos | Estudo em lote (vários tópicos) | Ctrl+clique em 3 tópicos → "Estudei hoje" → 1 desfazer | ✅ OK | [50_estudo-em-lote-varios-topicos](50_estudo-em-lote-varios-topicos.png) |
| 51 | Estudos | Painel de estudos (visão geral) | Botão do painel na barra de ferramentas | ✅ OK | [51_topo_painel-de-estudos-visao-geral](51_topo_painel-de-estudos-visao-geral.png)<br>[51_fim_painel-de-estudos-visao-geral](51_fim_painel-de-estudos-visao-geral.png) |
| 52 | Estudos | Revisão rápida pelo painel (✓ / ↻) | Botões da fila de revisões pendentes | ✅ OK | [52_revisao-rapida-pelo-painel](52_revisao-rapida-pelo-painel.png) |
| 53 | Estudos | Data da prova: salvar, validar e limpar | Digitar nome e data; salvar sem data mostra erro | ✅ OK | [53_erro_data-da-prova-salvar-validar-e-limpar](53_erro_data-da-prova-salvar-validar-e-limpar.png) |
| 54 | Estudos | Relatório de estudos (.md e .docx) | Botões do painel; arquivos abertos para captura | ✅ OK | [54_markdown_relatorio-de-estudos-md-e-docx](54_markdown_relatorio-de-estudos-md-e-docx.png) |
| 55 | Estudos | Virada do dia: revisões "de amanhã" passam a vencer | window.__today avança 1 dia (relógio simulado) | ✅ OK — selos ↻: 3 → 4 | [55_virada-do-dia-revisoes-de-amanha-passam-a-vencer](55_virada-do-dia-revisoes-de-amanha-passam-a-vencer.png) |
| 56 | Rede | Painel Conexões: links, retrolinks e fantasmas | Selecionar tópicos com [[links]] nas notas | ✅ OK | [56_painel-conexoes-links-retrolinks-e-fantasmas](56_painel-conexoes-links-retrolinks-e-fantasmas.png) |
| 57 | Rede | Menção sem link → transformar em [[link]] | Botão [[ ]] na lista de menções | ✅ OK | [57_antes_mencao-sem-link-transformar-em-link](57_antes_mencao-sem-link-transformar-em-link.png)<br>[57_depois_mencao-sem-link-transformar-em-link](57_depois_mencao-sem-link-transformar-em-link.png) |
| 58 | Rede | Autocompletar ao digitar [[ | Digitação real no painel de notas; setas e Enter | ✅ OK | [58_lista_autocompletar-ao-digitar](58_lista_autocompletar-ao-digitar.png) |
| 59 | Rede | Link sem destino (fantasma) → criar o tópico | Botão ＋ no painel Conexões | ✅ OK | [59_link-sem-destino-fantasma-criar-o-topico](59_link-sem-destino-fantasma-criar-o-topico.png) |
| 60 | Rede | Grafo do mapa (hierarquia + links + relações) | Botão do grafo; layout de forças | ✅ OK | [60_grafo-do-mapa-hierarquia-links-relacoes](60_grafo-do-mapa-hierarquia-links-relacoes.png) |
| 61 | Rede | Grafo: selecionar nó e ver conexões | Clique real no nó | ✅ OK | [61_grafo-selecionar-no-e-ver-conexoes](61_grafo-selecionar-no-e-ver-conexoes.png) |
| 62 | Rede | Grafo: só links (sem hierarquia) | Checkbox Hierarquia | ✅ OK | [62_grafo-so-links-sem-hierarquia](62_grafo-so-links-sem-hierarquia.png) |
| 63 | Rede | Grafo: vizinhança local + busca | Checkbox Só vizinhança (do nó selecionado); busca com destaque | ✅ OK | [63_grafo-vizinhanca-local-busca](63_grafo-vizinhanca-local-busca.png) |
| 64 | Rede | Grafo: arrastar nó e dar zoom com a roda | Arrasto real de um nó; roda real sobre o grafo | ✅ OK | [64_grafo-arrastar-no-e-dar-zoom-com-a-roda](64_grafo-arrastar-no-e-dar-zoom-com-a-roda.png) |
| 65 | Rede | Grafo do vault: vários mapas ligados por [[Mapa#Tópico]] | Escolher a pasta; cores por mapa | ✅ OK | [65_grafo-do-vault-varios-mapas-ligados-por-mapa-top](65_grafo-do-vault-varios-mapas-ligados-por-mapa-top.png) |
| 66 | Rede | Navegar entre mapas pelo grafo (duplo clique real) | Duplo clique num nó de outro mapa abre o arquivo | ✅ OK | [66_navegar-entre-mapas-pelo-grafo-duplo-clique-real](66_navegar-entre-mapas-pelo-grafo-duplo-clique-real.png) |
| 67 | Rede | Exportar para o Obsidian (+ proteção de notas existentes) | Botão do grafo; arquivo .md aberto para captura | ✅ OK | [67_md_exportar-para-o-obsidian-protecao-de-notas-exist](67_md_exportar-para-o-obsidian-protecao-de-notas-exist.png) |
| 68 | Rede | Abrir no Obsidian (URL do protocolo) | Botão; o lançamento é desligado nos testes (MINDCRAFT_NO_LAUNCH) | ✅ OK — Abriria no Obsidian: obsidian://open?path=C%3A%5CUsers%5Ciratu%5CAppData%5CLocal%5CTemp%5Cmc%20e2e%20%C3%A7%C3 | [68_abrir-no-obsidian-url-do-protocolo](68_abrir-no-obsidian-url-do-protocolo.png) |
| 69 | Dados | Autosave e recuperação de sessão | Alteração → rascunho em disco → "queda" → Restaurar | ✅ OK — rascunho de 10132 bytes | [69_autosave-e-recuperacao-de-sessao](69_autosave-e-recuperacao-de-sessao.png) |
| 70 | Dados | Arquivo corrompido não derruba o app nem o mapa atual | Abrir .mom inválido | ✅ OK — Não foi possível abrir: ADM-ZIP: Invalid or unsupported zip format. No END header found | [70_arquivo-corrompido-nao-derruba-o-app-nem-o-mapa-](70_arquivo-corrompido-nao-derruba-o-app-nem-o-mapa-.png) |
| 71 | Extremos | Título enorme, HTML, emoji e caracteres especiais | Textos hostis e longos no mapa | ✅ OK | [71_titulo-enorme-html-emoji-e-caracteres-especiais](71_titulo-enorme-html-emoji-e-caracteres-especiais.png) |
| 72 | Extremos | Mapa grande (1 000 tópicos): desempenho e legibilidade | Gera 1 000 tópicos e mede layout/desenho | ✅ OK — 1001 tópicos · render 35 ms · nível 1: 26 visíveis | [72_ajustado_mapa-grande-1-000-topicos-desempenho-e-legibilid](72_ajustado_mapa-grande-1-000-topicos-desempenho-e-legibilid.png)<br>[72_nivel-1_mapa-grande-1-000-topicos-desempenho-e-legibilid](72_nivel-1_mapa-grande-1-000-topicos-desempenho-e-legibilid.png) |
| 73 | Extremos | Janela pequena (1000×640): a interface continua utilizável | Redimensiona a janela | ✅ OK | [73_pequena_janela-pequena-1000-640-a-interface-continua-uti](73_pequena_janela-pequena-1000-640-a-interface-continua-uti.png)<br>[73_painel_janela-pequena-1000-640-a-interface-continua-uti](73_painel_janela-pequena-1000-640-a-interface-continua-uti.png) |
| 74 | Extremos | Estados vazios: painel, conexões e grafo sem dados | Mapa novo sem estudos nem links | ✅ OK | [74_painel-vazio_estados-vazios-painel-conexoes-e-grafo-sem-dados](74_painel-vazio_estados-vazios-painel-conexoes-e-grafo-sem-dados.png)<br>[74_grafo-vazio_estados-vazios-painel-conexoes-e-grafo-sem-dados](74_grafo-vazio_estados-vazios-painel-conexoes-e-grafo-sem-dados.png) |

## Capturas

### 01 · Mapa › Novo mapa (menu Arquivo › Novo)
✅ Mensagem de menu "new" → mapa com raiz e 3 tópicos

![01_novo-mapa-menu-arquivo-novo.png](01_novo-mapa-menu-arquivo-novo.png)

### 02 · Mapa › Tab cria tópico filho; digitar e Enter confirma
✅ Clique real no tópico → Tab → texto → Enter

![02_tab-cria-topico-filho-digitar-e-enter-confirma.png](02_tab-cria-topico-filho-digitar-e-enter-confirma.png)

### 03 · Mapa › Enter cria tópico irmão
✅ Seleciona o filho → Enter → texto → Enter

![03_enter-cria-topico-irmao.png](03_enter-cria-topico-irmao.png)

### 04 · Mapa › F2 edita o tópico e Esc cancela
✅ Clique → F2 → texto → Esc

![04_f2-edita-o-topico-e-esc-cancela.png](04_f2-edita-o-topico-e-esc-cancela.png)

### 05 · Mapa › Duplo clique edita o título (mouse real)
✅ Duplo clique real (2 cliques seguidos) sobre o tópico

![05_duplo-clique-edita-o-titulo-mouse-real.png](05_duplo-clique-edita-o-titulo-mouse-real.png)

### 06 · Mapa › Excluir, Desfazer e Refazer
✅ Delete real; botões ↶ ↷ da barra de ferramentas

![06_excluir-desfazer-e-refazer.png](06_excluir-desfazer-e-refazer.png)

### 07 · Mapa › Recolher e expandir ramo (Espaço)
✅ Seleciona "Tópico 1" → Espaço → contador no ramo

![07_recolhido_recolher-e-expandir-ramo-espaco.png](07_recolhido_recolher-e-expandir-ramo-espaco.png)

### 08 · Mapa › Arrastar tópico para dentro de outro (mover)
✅ Arrasto real com 6 passos intermediários

![08_arrastar-topico-para-dentro-de-outro-mover.png](08_arrastar-topico-para-dentro-de-outro-mover.png)

### 09 · Mapa › Relação entre tópicos com rótulo; selecionar e excluir
✅ R → clique no destino → digitar rótulo → clicar na seta → Delete

![09_rotulo_relacao-entre-topicos-com-rotulo-selecionar-e-ex.png](09_rotulo_relacao-entre-topicos-com-rotulo-selecionar-e-ex.png)

### 10 · Mapa › Marcadores e progresso (chips)
✅ Clique real nos chips da barra Propriedades

![10_marcadores-e-progresso-chips.png](10_marcadores-e-progresso-chips.png)

### 11 · Mapa › Cor, forma e negrito do tópico
✅ Seletor de cor (valor injetado: o diálogo nativo não é automatizável), forma e botão B reais

![11_cor-forma-e-negrito-do-topico.png](11_cor-forma-e-negrito-do-topico.png)

### 12 · Mapa › Notas do tópico
✅ Clique real no painel, digitar, clicar fora

![12_notas-do-topico.png](12_notas-do-topico.png)

### 13 · Mapa › Notas em Markdown: barra de formatação, Visualizar, tarefas e [[link]] clicável
✅ Cliques e digitação reais; Ctrl+A; botões da barra; caixa de tarefa e link na visualização

![13_editando_notas-em-markdown-barra-de-formatacao-visualizar.png](13_editando_notas-em-markdown-barra-de-formatacao-visualizar.png)
![13_visualizar_notas-em-markdown-barra-de-formatacao-visualizar.png](13_visualizar_notas-em-markdown-barra-de-formatacao-visualizar.png)
![13_tarefa-marcada_notas-em-markdown-barra-de-formatacao-visualizar.png](13_tarefa-marcada_notas-em-markdown-barra-de-formatacao-visualizar.png)

### 14 · Mapa › Relação desenhada = conexão: aparece em Conexões nos dois tópicos e some ao excluir
✅ R + clique no destino; aba Conexões; clique na seta + Delete

![14_saida_relacao-desenhada-conexao-aparece-em-conexoes-no.png](14_saida_relacao-desenhada-conexao-aparece-em-conexoes-no.png)
![14_retrolink_relacao-desenhada-conexao-aparece-em-conexoes-no.png](14_retrolink_relacao-desenhada-conexao-aparece-em-conexoes-no.png)

### 15 · Mapa › Cinco temas visuais (cartões)
✅ Clique real em cada cartão de tema

![15_dark_cinco-temas-visuais-cartoes.png](15_dark_cinco-temas-visuais-cartoes.png)
![15_paper_cinco-temas-visuais-cartoes.png](15_paper_cinco-temas-visuais-cartoes.png)
![15_neon_cinco-temas-visuais-cartoes.png](15_neon_cinco-temas-visuais-cartoes.png)
![15_mono_cinco-temas-visuais-cartoes.png](15_mono_cinco-temas-visuais-cartoes.png)
![15_ocean_cinco-temas-visuais-cartoes.png](15_ocean_cinco-temas-visuais-cartoes.png)

### 16 · Mapa › Busca no mapa
✅ Clique real na caixa, digitar, Enter navega, Esc limpa

![16_busca-no-mapa.png](16_busca-no-mapa.png)

### 17 · Mapa › Zoom (roda e controle), pan e ajustar
✅ Roda do mouse real, arrastar o fundo, botão Ajustar

![17_zoom-roda-e-controle-pan-e-ajustar.png](17_zoom-roda-e-controle-pan-e-ajustar.png)

### 18 · Mapa › Estrutura (outline): selecionar e recolher
✅ Clique real nas linhas e no triângulo

![18_estrutura-outline-selecionar-e-recolher.png](18_estrutura-outline-selecionar-e-recolher.png)

### 19 · Mapa › Abas do painel lateral e tema claro da interface
✅ Clique real em cada aba (uma por vez) e no botão do sol

![19_aba-props_abas-do-painel-lateral-e-tema-claro-da-interface.png](19_aba-props_abas-do-painel-lateral-e-tema-claro-da-interface.png)
![19_aba-study_abas-do-painel-lateral-e-tema-claro-da-interface.png](19_aba-study_abas-do-painel-lateral-e-tema-claro-da-interface.png)
![19_aba-notes_abas-do-painel-lateral-e-tema-claro-da-interface.png](19_aba-notes_abas-do-painel-lateral-e-tema-claro-da-interface.png)
![19_aba-links_abas-do-painel-lateral-e-tema-claro-da-interface.png](19_aba-links_abas-do-painel-lateral-e-tema-claro-da-interface.png)
![19_aba-outline_abas-do-painel-lateral-e-tema-claro-da-interface.png](19_aba-outline_abas-do-painel-lateral-e-tema-claro-da-interface.png)
![19_claro_abas-do-painel-lateral-e-tema-claro-da-interface.png](19_claro_abas-do-painel-lateral-e-tema-claro-da-interface.png)

### 20 · Mapa › Modo apresentação
✅ Botão ▶, setas do teclado, Esc

![20_passo-3_modo-apresentacao.png](20_passo-3_modo-apresentacao.png)

### 21 · Mapa › Tópico sublinhado é clicável em toda a caixa (não só nas letras)
✅ Cliques reais no canto esquerdo e no canto direito da caixa de um tópico de nível 3

![21_topico-sublinhado-e-clicavel-em-toda-a-caixa-nao.png](21_topico-sublinhado-e-clicavel-em-toda-a-caixa-nao.png)

### 22 · Mapa › Tópico novo fora da vista é trazido para a tela
✅ Zoom alto, tópico colado na borda direita, Tab: o editor deve ficar visível

![22_digitando_topico-novo-fora-da-vista-e-trazido-para-a-tela.png](22_digitando_topico-novo-fora-da-vista-e-trazido-para-a-tela.png)

### 23 · Mapa › Níveis: recolher e expandir o mapa por profundidade
✅ Seletor "Níveis" da barra de opções; um único desfazer

![23_nivel-1_niveis-recolher-e-expandir-o-mapa-por-profundida.png](23_nivel-1_niveis-recolher-e-expandir-o-mapa-por-profundida.png)
![23_nivel-2_niveis-recolher-e-expandir-o-mapa-por-profundida.png](23_nivel-2_niveis-recolher-e-expandir-o-mapa-por-profundida.png)

### 24 · Mapa › Editor inline cresce com títulos longos (não corta a 1ª linha)
✅ Tab + texto de 3 linhas em zoom alto

![24_digitando_editor-inline-cresce-com-titulos-longos-nao-cort.png](24_digitando_editor-inline-cresce-com-titulos-longos-nao-cort.png)

### 25 · Lote › Seleção múltipla: Ctrl+clique e retângulo (Shift)
✅ Ctrl+clique real; Shift+arrasto real no fundo

![25_retangulo_selecao-multipla-ctrl-clique-e-retangulo-shift.png](25_retangulo_selecao-multipla-ctrl-clique-e-retangulo-shift.png)

### 26 · Lote › Formatar vários de uma vez e desfazer em 1 passo
✅ Chips e botão B com vários selecionados; Ctrl+Z (botão)

![26_formatar-varios-de-uma-vez-e-desfazer-em-1-passo.png](26_formatar-varios-de-uma-vez-e-desfazer-em-1-passo.png)

### 27 · Lote › Copiar, colar e recortar tópicos (menu)
✅ Itens Copiar/Colar/Recortar do menu nativo

![27_copiar-colar-e-recortar-topicos-menu.png](27_copiar-colar-e-recortar-topicos-menu.png)

### 28 · Lote › Colar um texto externo como ramos
✅ Área de transferência com lista numerada → Colar

![28_colar-um-texto-externo-como-ramos.png](28_colar-um-texto-externo-como-ramos.png)

### 29 · Estudos › CSV da IA: importar o modelo e receber o esqueleto do mapa
✅ Menu → Escolher arquivo (clique real) → prévia → Criar o mapa

![29_previa_csv-da-ia-importar-o-modelo-e-receber-o-esquelet.png](29_previa_csv-da-ia-importar-o-modelo-e-receber-o-esquelet.png)
![29_mapa_csv-da-ia-importar-o-modelo-e-receber-o-esquelet.png](29_mapa_csv-da-ia-importar-o-modelo-e-receber-o-esquelet.png)

### 30 · Estudos › CSV da IA: arquivo com problemas mostra erros e avisos antes de importar
✅ CSV com linhas sem disciplina/tópico, peso e data inválidos

![30_previa-com-erros_csv-da-ia-arquivo-com-problemas-mostra-erros-e-a.png](30_previa-com-erros_csv-da-ia-arquivo-com-problemas-mostra-erros-e-a.png)

### 31 · Estudos › CSV da IA: copiar as instruções e salvar o modelo de exemplo
✅ Botões da janela de importação

![31_csv-da-ia-copiar-as-instrucoes-e-salvar-o-modelo.png](31_csv-da-ia-copiar-as-instrucoes-e-salvar-o-modelo.png)

### 32 · Estudos › Planilha de planejamento: exportar, editar fora do app, importar com prévia e aplicar
✅ Janela da planilha; cliques reais; arquivo editado em disco

![32_janela_planilha-de-planejamento-exportar-editar-fora-do.png](32_janela_planilha-de-planejamento-exportar-editar-fora-do.png)
![32_previa_planilha-de-planejamento-exportar-editar-fora-do.png](32_previa_planilha-de-planejamento-exportar-editar-fora-do.png)
![32_aplicada_planilha-de-planejamento-exportar-editar-fora-do.png](32_aplicada_planilha-de-planejamento-exportar-editar-fora-do.png)

### 33 · Estudos › Agenda de revisões (28 dias): clicar num dia lista os tópicos
✅ Painel de estudos; cliques reais nos dias

![33_dia-seguinte_agenda-de-revisoes-28-dias-clicar-num-dia-lista-.png](33_dia-seguinte_agenda-de-revisoes-28-dias-clicar-num-dia-lista-.png)
![33_hoje-com-atrasadas_agenda-de-revisoes-28-dias-clicar-num-dia-lista-.png](33_hoje-com-atrasadas_agenda-de-revisoes-28-dias-clicar-num-dia-lista-.png)

### 34 · Estudos › Pontos fracos e acerto da semana no painel
✅ Registra 10 questões (3 acertos) pela interface e confere o ranking

![34_pontos-fracos-e-acerto-da-semana-no-painel.png](34_pontos-fracos-e-acerto-da-semana-no-painel.png)

### 35 · Mapa › Alt+↑ ↓ ← → reordenam e mudam o nível do tópico (teclado real)
✅ Alt + setas; limites explicados na barra de status

![35_rebaixado_alt-reordenam-e-mudam-o-nivel-do-topico-teclado-.png](35_rebaixado_alt-reordenam-e-mudam-o-nivel-do-topico-teclado-.png)

### 36 · Mapa › Alt+1…5 trocam as abas do painel lateral
✅ Teclado real

![36_aba-estrutura_alt-1-5-trocam-as-abas-do-painel-lateral.png](36_aba-estrutura_alt-1-5-trocam-as-abas-do-painel-lateral.png)

### 37 · Dados › Backup ao salvar e "Restaurar versão anterior"
✅ Salva 3 vezes por cima do mesmo arquivo; abre a versão antiga como mapa novo

![37_backup-ao-salvar-e-restaurar-versao-anterior.png](37_backup-ao-salvar-e-restaurar-versao-anterior.png)

### 38 · Dados › Ao iniciar, o app reabre o último mapa (e o painel, se configurado)
✅ Chama a inicialização com um arquivo recente

![38_ao-iniciar-o-app-reabre-o-ultimo-mapa-e-o-painel.png](38_ao-iniciar-o-app-reabre-o-ultimo-mapa-e-o-painel.png)

### 39 · Arquivos › Salvar como, reabrir e título com ponto de "não salvo"
✅ save(true) com diálogo simulado; reabrir pelo caminho

![39_sujo_salvar-como-reabrir-e-titulo-com-ponto-de-nao-sa.png](39_sujo_salvar-como-reabrir-e-titulo-com-ponto-de-nao-sa.png)

### 40 · Arquivos › Arquivos recentes no menu
✅ Menu Arquivo › Abrir recente (conferido na estrutura do menu nativo) — _4 item(ns) no menu_

![40_arquivos-recentes-no-menu.png](40_arquivos-recentes-no-menu.png)

### 41 · Arquivos › Importar Markdown e OPML
✅ openPath em .md e .opml (arquivos temporários)

![41_importar-markdown-e-opml.png](41_importar-markdown-e-opml.png)

### 42 · Arquivos › Exportar PDF, Word, PNG, SVG, Markdown e OPML
✅ doExport() de cada formato (diálogo simulado); arquivos abertos em visualizadores para captura

![42_pdf_exportar-pdf-word-png-svg-markdown-e-opml.png](42_pdf_exportar-pdf-word-png-svg-markdown-e-opml.png)
![42_png_exportar-pdf-word-png-svg-markdown-e-opml.png](42_png_exportar-pdf-word-png-svg-markdown-e-opml.png)
![42_svg_exportar-pdf-word-png-svg-markdown-e-opml.png](42_svg_exportar-pdf-word-png-svg-markdown-e-opml.png)
![42_markdown_exportar-pdf-word-png-svg-markdown-e-opml.png](42_markdown_exportar-pdf-word-png-svg-markdown-e-opml.png)
![42_opml_exportar-pdf-word-png-svg-markdown-e-opml.png](42_opml_exportar-pdf-word-png-svg-markdown-e-opml.png)
![42_docx-texto_exportar-pdf-word-png-svg-markdown-e-opml.png](42_docx-texto_exportar-pdf-word-png-svg-markdown-e-opml.png)

### 43 · Arquivos › Linha de comando (CLI) para conversões
✅ node bin/mindcraft.js … em .mom/.md → pdf/docx/svg/opml/mom e entradas inválidas

![43_linha-de-comando-cli-para-conversoes.png](43_linha-de-comando-cli-para-conversoes.png)

### 44 · Estudos › Modelo de concurso
✅ Menu Arquivo › Novo mapa de concurso (modelo)

![44_modelo-de-concurso.png](44_modelo-de-concurso.png)

### 45 · Estudos › Importar edital colando o texto
✅ Modal: digitar nome, colar texto, ver contagem, Importar

![45_modal_importar-edital-colando-o-texto.png](45_modal_importar-edital-colando-o-texto.png)

### 46 · Estudos › Mapa de estudo: progresso agregado, selos ↻, marcadores
✅ Mapa de exemplo (concurso) aberto do disco

![46_mapa-de-estudo-progresso-agregado-selos-marcador.png](46_mapa-de-estudo-progresso-agregado-selos-marcador.png)

### 47 · Estudos › "Estudei hoje", "Errei", peso e próxima revisão
✅ Clique real nos botões do painel Estudo do tópico

![47_estudei_estudei-hoje-errei-peso-e-proxima-revisao.png](47_estudei_estudei-hoje-errei-peso-e-proxima-revisao.png)

### 48 · Estudos › Cronômetro de estudo
✅ Iniciar → (tempo simulado: +12 min) → Parar

![48_rodando_cronometro-de-estudo.png](48_rodando_cronometro-de-estudo.png)

### 49 · Estudos › Minutos e questões, com validações visíveis
✅ Digitar valores válidos e inválidos nos campos

![49_erro_minutos-e-questoes-com-validacoes-visiveis.png](49_erro_minutos-e-questoes-com-validacoes-visiveis.png)

### 50 · Estudos › Estudo em lote (vários tópicos)
✅ Ctrl+clique em 3 tópicos → "Estudei hoje" → 1 desfazer

![50_estudo-em-lote-varios-topicos.png](50_estudo-em-lote-varios-topicos.png)

### 51 · Estudos › Painel de estudos (visão geral)
✅ Botão do painel na barra de ferramentas

![51_topo_painel-de-estudos-visao-geral.png](51_topo_painel-de-estudos-visao-geral.png)
![51_fim_painel-de-estudos-visao-geral.png](51_fim_painel-de-estudos-visao-geral.png)

### 52 · Estudos › Revisão rápida pelo painel (✓ / ↻)
✅ Botões da fila de revisões pendentes

![52_revisao-rapida-pelo-painel.png](52_revisao-rapida-pelo-painel.png)

### 53 · Estudos › Data da prova: salvar, validar e limpar
✅ Digitar nome e data; salvar sem data mostra erro

![53_erro_data-da-prova-salvar-validar-e-limpar.png](53_erro_data-da-prova-salvar-validar-e-limpar.png)

### 54 · Estudos › Relatório de estudos (.md e .docx)
✅ Botões do painel; arquivos abertos para captura

![54_markdown_relatorio-de-estudos-md-e-docx.png](54_markdown_relatorio-de-estudos-md-e-docx.png)

### 55 · Estudos › Virada do dia: revisões "de amanhã" passam a vencer
✅ window.__today avança 1 dia (relógio simulado) — _selos ↻: 3 → 4_

![55_virada-do-dia-revisoes-de-amanha-passam-a-vencer.png](55_virada-do-dia-revisoes-de-amanha-passam-a-vencer.png)

### 56 · Rede › Painel Conexões: links, retrolinks e fantasmas
✅ Selecionar tópicos com [[links]] nas notas

![56_painel-conexoes-links-retrolinks-e-fantasmas.png](56_painel-conexoes-links-retrolinks-e-fantasmas.png)

### 57 · Rede › Menção sem link → transformar em [[link]]
✅ Botão [[ ]] na lista de menções

![57_antes_mencao-sem-link-transformar-em-link.png](57_antes_mencao-sem-link-transformar-em-link.png)
![57_depois_mencao-sem-link-transformar-em-link.png](57_depois_mencao-sem-link-transformar-em-link.png)

### 58 · Rede › Autocompletar ao digitar [[
✅ Digitação real no painel de notas; setas e Enter

![58_lista_autocompletar-ao-digitar.png](58_lista_autocompletar-ao-digitar.png)

### 59 · Rede › Link sem destino (fantasma) → criar o tópico
✅ Botão ＋ no painel Conexões

![59_link-sem-destino-fantasma-criar-o-topico.png](59_link-sem-destino-fantasma-criar-o-topico.png)

### 60 · Rede › Grafo do mapa (hierarquia + links + relações)
✅ Botão do grafo; layout de forças

![60_grafo-do-mapa-hierarquia-links-relacoes.png](60_grafo-do-mapa-hierarquia-links-relacoes.png)

### 61 · Rede › Grafo: selecionar nó e ver conexões
✅ Clique real no nó

![61_grafo-selecionar-no-e-ver-conexoes.png](61_grafo-selecionar-no-e-ver-conexoes.png)

### 62 · Rede › Grafo: só links (sem hierarquia)
✅ Checkbox Hierarquia

![62_grafo-so-links-sem-hierarquia.png](62_grafo-so-links-sem-hierarquia.png)

### 63 · Rede › Grafo: vizinhança local + busca
✅ Checkbox Só vizinhança (do nó selecionado); busca com destaque

![63_grafo-vizinhanca-local-busca.png](63_grafo-vizinhanca-local-busca.png)

### 64 · Rede › Grafo: arrastar nó e dar zoom com a roda
✅ Arrasto real de um nó; roda real sobre o grafo

![64_grafo-arrastar-no-e-dar-zoom-com-a-roda.png](64_grafo-arrastar-no-e-dar-zoom-com-a-roda.png)

### 65 · Rede › Grafo do vault: vários mapas ligados por [[Mapa#Tópico]]
✅ Escolher a pasta; cores por mapa

![65_grafo-do-vault-varios-mapas-ligados-por-mapa-top.png](65_grafo-do-vault-varios-mapas-ligados-por-mapa-top.png)

### 66 · Rede › Navegar entre mapas pelo grafo (duplo clique real)
✅ Duplo clique num nó de outro mapa abre o arquivo

![66_navegar-entre-mapas-pelo-grafo-duplo-clique-real.png](66_navegar-entre-mapas-pelo-grafo-duplo-clique-real.png)

### 67 · Rede › Exportar para o Obsidian (+ proteção de notas existentes)
✅ Botão do grafo; arquivo .md aberto para captura

![67_md_exportar-para-o-obsidian-protecao-de-notas-exist.png](67_md_exportar-para-o-obsidian-protecao-de-notas-exist.png)

### 68 · Rede › Abrir no Obsidian (URL do protocolo)
✅ Botão; o lançamento é desligado nos testes (MINDCRAFT_NO_LAUNCH) — _Abriria no Obsidian: obsidian://open?path=C%3A%5CUsers%5Ciratu%5CAppData%5CLocal%5CTemp%5Cmc%20e2e%20%C3%A7%C3_

![68_abrir-no-obsidian-url-do-protocolo.png](68_abrir-no-obsidian-url-do-protocolo.png)

### 69 · Dados › Autosave e recuperação de sessão
✅ Alteração → rascunho em disco → "queda" → Restaurar — _rascunho de 10132 bytes_

![69_autosave-e-recuperacao-de-sessao.png](69_autosave-e-recuperacao-de-sessao.png)

### 70 · Dados › Arquivo corrompido não derruba o app nem o mapa atual
✅ Abrir .mom inválido — _Não foi possível abrir: ADM-ZIP: Invalid or unsupported zip format. No END header found_

![70_arquivo-corrompido-nao-derruba-o-app-nem-o-mapa-.png](70_arquivo-corrompido-nao-derruba-o-app-nem-o-mapa-.png)

### 71 · Extremos › Título enorme, HTML, emoji e caracteres especiais
✅ Textos hostis e longos no mapa

![71_titulo-enorme-html-emoji-e-caracteres-especiais.png](71_titulo-enorme-html-emoji-e-caracteres-especiais.png)

### 72 · Extremos › Mapa grande (1 000 tópicos): desempenho e legibilidade
✅ Gera 1 000 tópicos e mede layout/desenho — _1001 tópicos · render 35 ms · nível 1: 26 visíveis_

![72_ajustado_mapa-grande-1-000-topicos-desempenho-e-legibilid.png](72_ajustado_mapa-grande-1-000-topicos-desempenho-e-legibilid.png)
![72_nivel-1_mapa-grande-1-000-topicos-desempenho-e-legibilid.png](72_nivel-1_mapa-grande-1-000-topicos-desempenho-e-legibilid.png)

### 73 · Extremos › Janela pequena (1000×640): a interface continua utilizável
✅ Redimensiona a janela

![73_pequena_janela-pequena-1000-640-a-interface-continua-uti.png](73_pequena_janela-pequena-1000-640-a-interface-continua-uti.png)
![73_painel_janela-pequena-1000-640-a-interface-continua-uti.png](73_painel_janela-pequena-1000-640-a-interface-continua-uti.png)

### 74 · Extremos › Estados vazios: painel, conexões e grafo sem dados
✅ Mapa novo sem estudos nem links

![74_painel-vazio_estados-vazios-painel-conexoes-e-grafo-sem-dados.png](74_painel-vazio_estados-vazios-painel-conexoes-e-grafo-sem-dados.png)
![74_grafo-vazio_estados-vazios-painel-conexoes-e-grafo-sem-dados.png](74_grafo-vazio_estados-vazios-painel-conexoes-e-grafo-sem-dados.png)
