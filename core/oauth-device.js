'use strict';
// Login do Google pelo fluxo de DISPOSITIVO (o mesmo da TV): o app mostra um código e um endereço; a pessoa digita o código em qualquer
// navegador (celular, computador). Não precisa de redirecionamento, de plugin nem de navegador embutido — serve igual no Windows e no tablet.
// Escopo mínimo: drive.file (só os arquivos que o próprio MindCraft criar). `http` é o mesmo adaptador de rede do provedor do Drive.
const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DEVICE_URL = 'https://oauth2.googleapis.com/device/code', TOKEN_URL = 'https://oauth2.googleapis.com/token';
const form = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&');
const post = async (http, url, o) => {
  const r = await http({ method: 'POST', url, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form(o) });
  let j = {}; try { j = JSON.parse(r.text || '{}'); } catch { /* resposta sem JSON */ }
  return { status: r.status, j };
};

/** 1) pede o código para mostrar à pessoa. */
async function startDeviceLogin({ http, clientId, urls = {} }) {
  if (!clientId) throw new Error('Informe o ID do cliente do Google.');
  const { status, j } = await post(http, urls.device || DEVICE_URL, { client_id: clientId, scope: SCOPE });
  if (status !== 200 || !j.device_code) throw new Error(j.error_description || j.error || `o Google recusou o pedido (${status})`);
  return { deviceCode: j.device_code, userCode: j.user_code, url: j.verification_url || j.verification_uri, interval: Math.max(1, j.interval || 5), expiresIn: j.expires_in || 1800 };
}

/** 2) espera a pessoa autorizar. Devolve { accessToken, refreshToken, expiresAt }. `shouldStop()` cancela. */
async function pollDeviceLogin({ http, clientId, clientSecret, deviceCode, interval = 5, expiresIn = 1800, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), now = Date.now, shouldStop = () => false, urls = {} }) {
  const t0 = now(); let wait = interval;
  while (now() - t0 < expiresIn * 1000) {
    if (shouldStop()) throw new Error('Login cancelado.');
    await sleep(wait * 1000);
    const { status, j } = await post(http, urls.token || TOKEN_URL, { client_id: clientId, client_secret: clientSecret, device_code: deviceCode, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' });
    if (status === 200 && j.access_token) return { accessToken: j.access_token, refreshToken: j.refresh_token || null, expiresAt: now() + (j.expires_in || 3600) * 1000 };
    if (j.error === 'authorization_pending') continue;
    if (j.error === 'slow_down') { wait += 5; continue; }
    if (j.error === 'access_denied') throw new Error('O acesso foi negado na conta do Google.');
    if (j.error === 'expired_token') break;
    throw new Error(j.error_description || j.error || `erro no login (${status})`);
  }
  throw new Error('O código expirou. Comece de novo.');
}

/** Renova o access token com o refresh token. Se o Google recusar (revogado/expirado), o erro diz para entrar de novo. */
async function refreshAccessToken({ http, clientId, clientSecret, refreshToken, now = Date.now, urls = {} }) {
  const { status, j } = await post(http, urls.token || TOKEN_URL, { client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' });
  if (status === 200 && j.access_token) return { accessToken: j.access_token, expiresAt: now() + (j.expires_in || 3600) * 1000 };
  if (j.error === 'invalid_grant') { const e = new Error('O acesso à conta do Google expirou ou foi revogado. Entre de novo.'); e.reauth = true; throw e; }
  throw new Error(j.error_description || j.error || `não consegui renovar o acesso (${status})`);
}

/** Cria o `getToken` do provedor: guarda/renova o token e avisa quem chama (para gravar o novo estado). */
function tokenSource({ http, clientId, clientSecret, auth, onChange = () => {}, now = Date.now, urls }) {
  return async (force = false) => {
    if (!auth.refreshToken) { const e = new Error('Entre na conta do Google primeiro.'); e.reauth = true; throw e; }
    if (!force && auth.accessToken && auth.expiresAt && auth.expiresAt - now() > 60000) return auth.accessToken;
    const t = await refreshAccessToken({ http, clientId, clientSecret, refreshToken: auth.refreshToken, now, urls });
    auth.accessToken = t.accessToken; auth.expiresAt = t.expiresAt; onChange(auth); return auth.accessToken;
  };
}
module.exports = { startDeviceLogin, pollDeviceLogin, refreshAccessToken, tokenSource, SCOPE };
