---
name: mindcraft-sync-provider
description: Acrescenta um novo destino de sincronização ao MindCraft (ex.: OneDrive, Dropbox, WebDAV) seguindo o contrato do motor core/sync.js, com testes contra um servidor falso e sem nunca apagar dados. Use ao estender a sincronização.
---

# Novo provedor de sincronização

O motor (`core/sync.js`) **não sabe de rede nem de disco**. Ele recebe um provedor e decide por mapa: igual / só local mudou / só remoto mudou / **ambos mudaram → manter as duas**. **Nunca apaga.**

## Contrato
```js
{ list(): Promise<string[]>,                 // nomes "maps/<id>.<ts13>.<hash16>.mom" (ignore o que não casar com NAME)
  read(name): Promise<Buffer>,
  write(name, data: Buffer): Promise<void>   // idempotente: mesmo nome = mesmo conteúdo → se já existe, não faz nada
  /* opcional */ check(): Promise<void> }     // falha com mensagem pt-BR acionável (pasta sumiu, sem login…)
```
Nomes remotos: ver `core/sync.js` (`NAME`, `parseListing`). **Nunca** implemente `delete`.

## Passos
1. `core/sync-<nome>.js`: classe com o contrato; rede **injetada** (`http({method,url,headers,body,binary}) → {status,text}`; `binary:true` devolve base64). Reaproveite `core/net-node.js` (desktop) e `platform/web/host/net.js` (tablet, CapacitorHttp).
2. **Robustez**: renove token em 401 **uma vez**; repita 429/5xx com espera crescente (`sleep` injetável); mensagens claras para "sem espaço", "acesso revogado → entre de novo", "pasta removida" (recriar sem apagar). Antes de criar um arquivo, **confira se já existe** (reenvio após queda de rede não pode duplicar). Paginação de listagem.
3. **Segurança**: só HTTPS (HTTP só `127.0.0.1` em teste); escopo mínimo; tokens nunca em log/erro; "Desligar" esquece o login.
4. `MODULES` em `tools/build-web-core.js` (e `NODE_ONLY` no teste de arquitetura se usar `http` do Node).
5. **Testes**: copie `test/sync-drive.test.js` + `test/mock-google.js` — servidor falso com falhas injetáveis (401, 429, 500, cota, arquivo adulterado, pasta na lixeira, duas pastas, paginação). Teste de motor com o provedor novo (`test/sync.test.js` usa `MemRemote`). Sabotagem: remova a checagem de duplicata/renovação de token e confirme que um teste falha.
6. **UI**: `renderer/sync-ui.js` (`makeRemote(cfg)` escolhe o provedor; adicione a opção em `kind`); `test/e2e-sync.js` (desktop) e `e2e-sync-web.js` (tablet) cobrindo login, enviar, receber, conflito, desligar, erro.
7. Documente em `docs/DECISIONS.md` e `README.md` — incluindo **o que não foi testado** (serviço real).
