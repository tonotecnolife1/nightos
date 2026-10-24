import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateOrigin } from './bridge.mjs';
import { relayRequest, relayMessages } from './relay-http.mjs';

// No credentials, pairing, MCP process, DB writes, or LINE sends. The poll
// handler rejects missing Authorization before looking up or claiming jobs.
export async function checkPreview(value) {
  const origin = validateOrigin(value);
  const response = await relayRequest(origin + '/api/personal-line/bridge/poll', { method: 'POST', payload: {} });
  if (response.status === 401 && response.data?.error === 'device_authentication_required') return;
  if (response.status === 503 && response.data?.error === 'bridge_not_configured') throw new Error('bridge_not_configured');
  throw new Error('unexpected_relay_response');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  checkPreview(process.argv[2]).then(() => {
    console.log('PASS: 中継APIへ到達し、未認証端末のJSON 401を確認しました。DB・本人認証・Mac/LINE接続は別途検証が必要です。');
  }).catch(error => {
    const messages = { ...relayMessages, bridge_not_configured: '中継APIへ到達しましたが、サーバーのLINE接続設定が未完了です。' };
    console.error('FAIL: ' + (messages[error.message] ?? '到達性を確認できません。HTTPSのPreview URLと通信許可を確認してください。'));
    process.exitCode = 1;
  });
}
