# Catálogo Completo de Evidências Visuais — MindCraft v0.4.6

Data da rodada: **23 de Outubro de 2026**  
Ambientes capturados: **Windows 11 Desktop (x64)** e **Samsung Galaxy Tab (Android 16 Emulado)**

Este documento cataloga a rodada completa de capturas de telas de todas as funcionalidades do aplicativo, comprovando a fidelidade visual, a integridade da arquitetura e a responsividade multiplataforma (mouse/teclado no desktop e toque nos tablets).

---

## Índice Comparativo de Funcionalidades

| # | Funcionalidade | Captura Windows Desktop | Captura Android Tablet | Descrição / Validação |
|---|---|---|---|---|
| 1 | **Splash Screen** | [windows/01-splash-screen.png](windows/01-splash-screen.png) | [android/01-splash-screen.png](android/01-splash-screen.png) | Tela de abertura animada com logotipo oficial e indicador de carregamento da biblioteca. |
| 2 | **Tela Inicial (Home)** | [windows/02-tela-inicial-home.png](windows/02-tela-inicial-home.png) | [android/02-tela-inicial-home.png](android/02-tela-inicial-home.png) | Tela inicial com lista de mapas recentes, biblioteca e cartões. Botão Play (`present`) reativamente desabilitado/oculto na ausência de mapa ativo. |
| 3 | **Mapa Mental no Editor** | [windows/03-mapa-mental-editor.png](windows/03-mapa-mental-editor.png) | [android/03-mapa-mental-editor.png](android/03-mapa-mental-editor.png) | Editor principal com ideia central, tópicos temáticos, ramos orgânicos, relações pontilhadas e botão Play habilitado na barra de ferramentas. |
| 4 | **Modo Apresentação (HUD)** | [windows/04-modo-apresentacao-hud.png](windows/04-modo-apresentacao-hud.png) | [android/04-modo-apresentacao-hud.png](android/04-modo-apresentacao-hud.png) | Apresentação em tela cheia com centralização e zoom no slide atual. Barra flutuante (#hud) com Anterior, contador dinâmico com título, Próximo e botão Sair. |
| 5 | **Bancada de Estudos (Launchpad)** | [windows/05-bancada-estudo-launchpad.png](windows/05-bancada-estudo-launchpad.png) | [android/05-bancada-estudo-launchpad.png](android/05-bancada-estudo-launchpad.png) | Estado vazio convidativo da bancada integrada quando não há abas abertas, oferecendo ações rápidas e lista de materiais vinculados ao mapa. |
| 6 | **Aba Leitor de PDF** | [windows/06-bancada-estudo-leitor-pdf.png](windows/06-bancada-estudo-leitor-pdf.png) | [android/06-bancada-estudo-leitor-pdf.png](android/06-bancada-estudo-leitor-pdf.png) | Leitor de PDF com paginação, zoom ajustável e atalho para criar tópicos ou anotações a partir de citações do texto. |
| 7 | **Aba Player de Vídeo** | [windows/07-bancada-estudo-player-video.png](windows/07-bancada-estudo-player-video.png) | [android/07-bancada-estudo-player-video.png](android/07-bancada-estudo-player-video.png) | Player de videoaula com suporte a arquivos locais e links do YouTube, controle de velocidade e botão de vincular carimbo de tempo ao mapa mental. |
| 8 | **Aba Navegador Web** | [windows/08-bancada-estudo-navegador-web.png](windows/08-bancada-estudo-navegador-web.png) | [android/08-bancada-estudo-navegador-web.png](android/08-bancada-estudo-navegador-web.png) | Navegador integrado com sanitização de URLs, favoritos rápidos, aviso e botão `↗ Abrir fora` (fallback CSP/X-Frame-Options) e criação de subtópicos da página. |
| 9 | **Bancada Multi-Abas** | [windows/09-bancada-estudo-multi-abas.png](windows/09-bancada-estudo-multi-abas.png) | [android/09-bancada-estudo-multi-abas.png](android/09-bancada-estudo-multi-abas.png) | Sistema multi-abas ativo com PDF, Vídeo e Navegador abertos simultaneamente, mantendo o estado de reprodução e rolagem ao alternar. |
| 10 | **Rede de Conhecimento (Grafo)** | [windows/10-rede-conhecimento-grafo.png](windows/10-rede-conhecimento-grafo.png) | [android/10-rede-conhecimento-grafo.png](android/10-rede-conhecimento-grafo.png) | Visualização em grafo bidimensional com tópicos conectados por relações e links `[[ ]]`, permitindo navegação não linear do conhecimento. |
| 11 | **Painel de Estudos (Dashboard)** | [windows/11-painel-estudos-dashboard.png](windows/11-painel-estudos-dashboard.png) | [android/11-painel-estudos-dashboard.png](android/11-painel-estudos-dashboard.png) | Central de controle da preparação: tempo líquido estudado, questões resolvidas, taxa de acerto por disciplina, metas e cronograma da prova. |
| 12 | **Revisão Espaçada (SRS)** | [windows/12-caderno-erros-revisao-srs.png](windows/12-caderno-erros-revisao-srs.png) | [android/12-caderno-erros-revisao-srs.png](android/12-caderno-erros-revisao-srs.png) | Fila de revisão espaçada com ciclos automáticos (1, 7, 15, 30 dias) e histórico analítico do caderno de erros. |
| 13 | **Painel Lateral (Estrutura/Notas)** | [windows/13-painel-lateral-estrutura-notas.png](windows/13-painel-lateral-estrutura-notas.png) | [android/13-painel-lateral-estrutura-notas.png](android/13-painel-lateral-estrutura-notas.png) | Painel lateral com visão hierárquica completa do mapa (Outline) e editor de notas em Markdown com referências de fontes. |
| 14 | **Barra Contextual e Fechamento** | [windows/14-barra-superior-fechamento-recursos.png](windows/14-barra-superior-fechamento-recursos.png) | [android/14-barra-superior-fechamento-recursos.png](android/14-barra-superior-fechamento-recursos.png) | Barra superior contextual dinâmica com botões de fechar mapa atual, fechar PDF, fechar vídeo e fechar aba de forma segura. |

---

## Conclusão da Validação Visual
- **Paridade Total:** Todas as 14 funcionalidades foram capturadas com sucesso nas duas plataformas.
- **Layout Responsivo:** O layout do tablet ajusta alvos de toque para no mínimo 44px e acomoda a barra de ferramentas sem cortes verticais.
- **Isolamento de Estado:** A alternância entre abas preserva 100% dos estados dos componentes sem provocar perda de foco nem descarte involuntário de formulários.