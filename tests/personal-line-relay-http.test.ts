import { afterEach, describe, expect, it, vi } from 'vitest';
import { relayRequest } from '../scripts/personal-line/relay-http.mjs';
import { checkPreview } from '../scripts/personal-line/check-preview.mjs';

afterEach(() => vi.unstubAllGlobals());
describe('Mac relay deployment boundary', () => {
  it('rejects a Preview login redirect without following it or retrying the request', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 302, headers: { Location: 'https://vercel.com/login?private=value' } }));
    vi.stubGlobal('fetch', fetch);
    await expect(relayRequest('https://preview.test/api', { method: 'PATCH', token: 'device-secret', payload: { result: 'encrypted' } })).rejects.toThrow('relay_redirected');
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][1].redirect).toBe('manual');
  });
  it.each([200, 401, 403])('does not interpret HTML HTTP %s as an app connection', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Login</html>', { status, headers: { 'Content-Type': 'text/html' } })));
    await expect(checkPreview('https://preview.test')).rejects.toThrow(status === 200 ? 'relay_invalid_response' : 'preview_access_denied');
  });
  it('accepts only the expected unauthenticated JSON error, without sending a credential or starting MCP', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ error: 'device_authentication_required' }, { status: 401 }));
    vi.stubGlobal('fetch', fetch);
    await expect(checkPreview('https://preview.test')).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][0]).toBe('https://preview.test/api/personal-line/bridge/poll');
    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('Authorization');
    expect(fetch.mock.calls[0][1].body).toBe('{}');
  });
  it.each([
    [503, { error: 'bridge_not_configured' }, 'bridge_not_configured'],
    [200, { job: null }, 'unexpected_relay_response'],
    [401, { error: 'other_error' }, 'unexpected_relay_response'],
  ])('does not claim readiness from HTTP %s with a different response', async (status, body, error) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(body, { status: status as number })));
    await expect(checkPreview('https://preview.test')).rejects.toThrow(error as string);
  });
  it('rejects malformed JSON without exposing response text', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('private invalid response', { headers: { 'Content-Type': 'application/json' } })));
    await expect(relayRequest('https://preview.test')).rejects.toThrow('relay_invalid_response');
  });
});
