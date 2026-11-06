# Plano de melhorias — MindCraft

> Rascunho para aprovação (não iniciado). Estado do repositório: `main` em `9e8030c`, versão 0.1.22.
> Ordem = prioridade. Cada item tem critério de aceite; nada entra sem teste e evidência (screenshot), conforme a regra do projeto.

## 0. Pendências antes de novas funções

| # | Item | Ação proposta |
|---|------|---------------|
| 0.1 | Commit `9e8030c` não enviado ao GitHub | Rodar `npm run check` e `git push` |
| 0.2 | `tablet/android/.../gradle-wrapper.properties` alterado sem commit (Gradle 8.14.3 → 9.7.1) | Confirmar se o APK compila com 9.7.1; depois commitar ou reverter |
| 0.3 | Branches `feature/fluxograma` e `lite` já mescladas no `main` (locais e remotas) | Apagar após confirmação |
| 0.4 | Versão inconsistente: `package.json` 0.1.22, CHANGELOG até 0.7.1, tags até `v0.7.1` | Escolher um esquema e alinhar `package.json`, CHANGELOG e tags |
| 0.5 | **Exportação para o Obsidian sumiu do código atual** (ver 1.1) | Decidir se foi intencional; se não, restaurar |
| 0.6 | Sincronização com Google Drive/pasta não testada de ponta a ponta (sem conta de teste) | Testar com conta real ou pasta configurada |

## 1. Integração com o Obsidian (prioridade do usuário)

### 1.1 Diagnóstico
- Até a versão 0.1.19 existiam `core/obsidian.js` (`exportObsidian`), o botão "Exportar p/ Obsidian…" e "Abrir no Obsidian" em `renderer/graph-ui.js`. Ambos foram removidos no commit `4a5b9a5` (release 0.1.19); `renderer/graph-ui.js` atual só carrega `core/vault`. O `build/web` ainda tem a versão antiga, por isso não serve de referência confiável.
- `core/graph.js` ainda cita "o exportador do Obsidian" num comentário e expõe `resolveLink` só para ele.
- Os testes de rede não cobrem exportação para o Obsidian; por isso a remoção não quebrou nenhum teste.

### 1.2 O que é possível
**Exportar a rede para o Obsidian de forma compatível: sim.** O Obsidian lê uma pasta de arquivos `.md`; os links `[[Nota]]`, `[[Nota#Título]]` e `[[Nota|apelido]]` viram o grafo, os retrolinks e as menções nativos. Basta gerar:
- um `.md` por mapa (ou por tópico com filhos), com o corpo = notas do tópico;
- `[[Mapa#Tópico]]` escritos com o nome de arquivo real do destino (resolvido com o mesmo `resolveLink` do grafo);
- frontmatter YAML (`id`, `mapa`, `concurso`, `progresso`, `proxima_revisao`) para as propriedades do Obsidian;
- tags `#revisar`, `#errei` etc. no formato que o Obsidian reconhece.

**Conectar o Obsidian ao MindCraft: sim, em duas formas, com custos diferentes.**
- **A. Pasta compartilhada (vault), já quase pronta.** Os dois apontam para a mesma pasta. O MindCraft escreve os `.md` e o Obsidian os mostra sozinho. Para o caminho de volta, o MindCraft lê os `.md` editados no Obsidian e propõe a importação (ver 1.4).
- **B. Plugin do Obsidian (opcional).** O Obsidian permite plugins que rodam JavaScript e falam com processos locais. Um plugin pequeno pode chamar o MindCraft por `http://127.0.0.1` com um token, para "Enviar tópico ao MindCraft" e "Abrir no MindCraft". Custo: segundo projeto (API de plugins do Obsidian), instalação manual, e manutenção a cada versão do Obsidian.
- **Ligação de navegação (já planejada):** `obsidian://open?vault=…&file=…` abre a nota exata a partir do MindCraft. O caminho inverso (`mindcraft://…`) exige registrar um protocolo no Electron.

Recomendação: começar por **A** (sem plugin, funciona com qualquer versão do Obsidian) e só depois avaliar **B**.

### 1.3 Exportação compatível (fase 1)
- Nome de arquivo sanitizado (sem `\ / : * ? " < > |`; sem `#`, `|`, `^`, `[`, `]` no nome, pois quebram o link); colisões resolvidas com sufixo.
- Pasta dentro do vault escolhido, ex.: `MindCraft/<concurso>/<mapa>.md`.
- **Nunca sobrescrever** nota que não foi criada pelo MindCraft: o cabeçalho `mindcraft-id` identifica o que é nosso.
- Idempotente: exportar duas vezes não duplica nada e não muda o que não mudou (hash guardado no frontmatter).
- Aceite: vault de teste aberto no Obsidian real; o grafo mostra as arestas esperadas; retrolinks corretos; screenshot em `docs/evidencias/obsidian/`.

### 1.4 Importação de volta (fase 2)
- Só lê arquivos com `mindcraft-id`; compara com o último hash exportado para detectar o que foi editado no Obsidian.
- Mostra um resumo (tópicos alterados, novos, removidos) e pede confirmação; nunca grava sem isso.
- Edição conflitante (nos dois lados): mantém as duas versões, como já é a regra da sincronização.
- Aceite: teste com edição real no Obsidian; desfazer (Ctrl+Z) funciona.

### 1.5 Ligação de navegação (fase 3)
- Botão "Abrir no Obsidian" no tópico (`obsidian://open`).
- Pré-visualização ao passar o mouse sobre um `[[link]]` (SUGESTOES #17).

### 1.6 Plugin do Obsidian (fase 4, opcional)
- Só depois das fases 1–3 e de decisão do usuário.

## 2. Melhorias já listadas (SUGESTOES.md)
Ver `SUGESTOES.md`. Prioridade sugerida dentro da área de estudo: agenda de revisões por semana/mês; notificação diária; relatório `.docx` com simulados; remover versões clássicas das telas migradas.

## 3. Dívidas técnicas
- Migração para TypeScript + Vite (`src/main`, `src/renderer`, `src/shared`) conforme `docs/ARCHITECTURE.md` §7 (ADR 016) — ainda não iniciada.
- Assinar o instalador e criar atualização automática.
- Rodar `npm test`, `npm run e2e` e `npm run qa` no CI em Windows, macOS e Linux.

## Decisões que dependem do usuário
1. A remoção da exportação para o Obsidian foi intencional? (Se não, entra na fase 1 já.)
2. Caminho A (pasta compartilhada) é suficiente, ou quer o plugin (B)?
3. Pasta do vault: uma só para tudo, ou uma por concurso?
4. Esquema de versão para o item 0.4.
