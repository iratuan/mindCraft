# BRANIAC

**Mapas mentais para organizar o estudo.** Monte o mapa do conteúdo, abra o PDF ao lado, marque o que já foi revisado e deixe o app avisar quando chegar a hora de revisar.

- Desktop: **Windows** (instalador). macOS e Linux: gere a partir do código (ainda não validado nessas plataformas).
- Tablet: **Android** (APK).
- Compatível com arquivos **Mindomo `.mom`**: abre, salva e preserva o que não entende.

Versão atual: **0.7.6**. Histórico completo em [CHANGELOG.md](CHANGELOG.md).

## Telas

| Tela inicial da abertura | Mapa com a logomarca nova |
|---|---|
| ![Abertura do BRANIAC](docs/evidencias/logo-splash/1-splash.png) | ![Mapa com a logomarca](docs/evidencias/logo-splash/4-mapa-logo-nova.png) |
| **Tema Pixel (8 bits)** | **Revisões de hoje** |
| ![Tema pixel](docs/evidencias/tema-pixel/2-pixel.png) | ![Revisões de hoje](docs/evidencias/revisoes/1-revisoes-hoje.png) |

## Funcionalidades

### Mapa mental
- Criar, renomear, excluir, mover e recolher tópicos (Tab e Enter para filho e irmão, F2 para renomear, Espaço para recolher).
- Desfazer e refazer (Ctrl+Z e Ctrl+Y).
- Notas e links `[[entre tópicos]]`.
- Busca no mapa (Ctrl+F).
- Marcadores de prioridade e progresso por tópico.
- Temas do mapa (Oceano, Escuro, Papel, Neon, Desenho, Monocromático).
- Fluxograma e lousa de resolução.
- **Auto-organizar o mapa:** refaz a disposição de todos os níveis (inclusive mapas com vários subtópicos em cada ramo), sem recolher nenhum ramo. Recolher é uma decisão sua, pelo controle Níveis ou pelo botão em cada tópico.

### Aparência
- **Tema da interface:** Escuro, Claro, Desenho à mão e **Pixel (8 bits)**. O Pixel usa paleta discreta, bordas em degrau e fonte pixel nos títulos; o leitor de PDF e a lousa ficam claros para a leitura, e o mapa fica em canvas escuro com contraste ajustado aos temas de mapa.
- Painel lateral recolhível (Ctrl+\\) e divisores arrastáveis.

### Estudo e revisão
- **Marcar tópico como revisado** (Editar › Marcar tópico como revisado). A próxima revisão segue os intervalos de **1, 7, 15, 30, 60 e 120 dias**; depois disso, sempre 120.
- **Revisões de hoje** (Visualizar › Revisões de hoje…): lista as revisões do dia e as atrasadas, com o botão **Revisado** e a previsão dos próximos 7 dias.
- **Aviso diário:** uma vez por dia, quando há revisões pendentes, o desktop mostra um aviso do sistema. A barra de status mostra a contagem em qualquer aparelho. O aviso só aparece com o app aberto.
- PDF ao lado do mapa.

### Dados e exportação
- Abrir e salvar arquivos `.mom`.
- Exportar o material de estudo em **PDF** e **Markdown**.
- **Rede de conhecimento:** visualiza o mapa como rede de ligações e exporta para o **Obsidian** (abre o cofre direto no Obsidian).
- Cópia de segurança e restauração de versões anteriores.
- Importar CSV (por arquivo ou colado).

## Instalar

**Windows:** baixe `BRANIAC Setup 0.7.6.exe` e execute. O instalador não é assinado, então o Windows pode mostrar um aviso de editor desconhecido: clique em "Mais informações" e depois em "Executar assim mesmo".

**Android:** baixe `BRANIAC-0.7.6.apk`, abra o arquivo e permita a instalação de fontes desconhecidas quando o aparelho pedir.

**macOS e Linux:** sem instalador publicado. Gere a partir do código (veja abaixo).

## Usar

1. Abra o app e crie um mapa novo, ou importe um CSV de conteúdo.
2. Estude cada tópico com o PDF ao lado. Ao terminar, marque o tópico como revisado.
3. Abra **Revisões de hoje** para fazer a fila do dia. Quando o aviso chegar, é o sinal para começar por ela.
4. Faça uma cópia de segurança de vez em quando e guarde o arquivo fora do computador.

Atalhos completos: **F1**.

## Para desenvolver

```bash
npm install
npm start          # abre o app
npm run check      # lint + testes unitários (228)
npm run e2e        # testes ponta a ponta no Electron real
npm run dist       # gera o instalador do Windows em dist/
```

**APK (Android):** requer JDK 21 e o Android SDK.

```bash
cd tablet
npm run sync                       # copia a interface e aplica a versão e a assinatura
cd android
./gradlew assembleRelease          # gera app/build/outputs/apk/release/app-release.apk
```

A chave de assinatura fica em `tablet/keystore/` (`mindcraft.jks` e `senha.txt`), fora do Git. **Faça uma cópia**: sem ela não é possível atualizar o app já instalado.

Estrutura: `core/` (regras de negócio puras, sem Electron nem DOM) · `electron/` (processo principal) · `renderer/` (interface) · `tablet/` (Capacitor) · `test/`.

Documentação para quem vai evoluir o projeto:
- [`CLAUDE.md`](CLAUDE.md): regras, comandos e armadilhas. Comece por aqui.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) e [`docs/DECISIONS.md`](docs/DECISIONS.md)
- [`docs/TESTING.md`](docs/TESTING.md) e [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md)
- [`CHANGELOG.md`](CHANGELOG.md)

## Limitações conhecidas

- **Recursos de estudo do histórico que não estão neste repositório:** painel de estudos, caderno de erros, simulados, metas, modelos de concurso, agenda de revisões em `.ics`, sincronização com Google Drive, navegador embutido e player de videoaulas. Eles aparecem no CHANGELOG das versões 0.1.x a 0.7.1 e foram mantidos como histórico. Os itens afetados estão marcados com ⚠️ lá.
- **Aviso diário:** só dispara com o app aberto (verifica 4 segundos após abrir e depois a cada 30 minutos). O aviso do sistema foi confirmado só no processo do app, não visto na tela do Windows.
- **Mapas grandes:** com centenas de tópicos, o botão Ajustar à tela deixa o mapa pequeno e o texto só fica legível com zoom.
- **Tablet:** o APK foi gerado e assinado, mas não foi instalado nem testado em aparelho nesta versão. No tablet não há aviso do sistema para as revisões.
- **Instaladores sem assinatura de código:** o Windows e o macOS mostram avisos na primeira execução.
- **Mindomo:** ícones, anexos, tarefas e Gantt não são importados. Relações do Mindomo são preservadas no arquivo, mas não aparecem no mapa. Tópicos soltos são só de leitura até serem trazidos para a árvore.
- **macOS e Linux:** os builds vêm do CI (`.github/workflows/build.yml`) e ainda não foram validados nessas plataformas.

## Licenças

Código sob a licença MIT (veja `package.json`). A fonte do tema pixel é a Press Start 2P, sob a licença SIL Open Font License (`renderer/assets/fonts/PressStart2P-OFL.txt`). O leitor de PDF usa o PDF.js (Mozilla, Apache 2.0); a interface usa React (MIT).
