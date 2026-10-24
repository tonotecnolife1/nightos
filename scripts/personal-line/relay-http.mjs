// Never follow a deployment-login redirect or print a response body/Location.
// Both may contain private deployment details. Each request is attempted once.
export async function relayRequest(url, { method = 'GET', token, payload } = {}) {
  const response = await fetch(url, {
    method, redirect: 'manual',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: payload === undefined ? undefined : JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status >= 300 && response.status < 400) throw new Error('relay_redirected');
  if (!response.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new Error([401, 403].includes(response.status) ? 'preview_access_denied' : 'relay_invalid_response');
  }
  let data;
  try { data = await response.json(); } catch { throw new Error('relay_invalid_response'); }
  return { status: response.status, ok: response.ok, data };
}

export const relayMessages = {
  relay_redirected: '中継APIが別の画面へ転送されました。Vercel Preview保護を確認してください。接続は成立していません。',
  preview_access_denied: 'Previewへのアクセスが保護されています。検証用デプロイの保護設定を担当者に確認してください。',
  relay_invalid_response: '中継APIからJSON応答を取得できません。Preview URLとデプロイ状態を確認してください。',
};
