import { describe, expect, it, vi } from 'vitest';
import { auditPreviewConfig, previewTarget } from '../scripts/personal-line/check-preview-config.mjs';

function fixture({ isolated = true, sharedUrl = false, sharedAnon = false, sensitiveUrl = false, wrongTarget = false } = {}) {
  const envs: any[] = [];
  const decrypted = new Map();
  function add(key: string, value: string, branch: string | null, type = 'encrypted') {
    const env = { id: `id-${envs.length}`, key, type, target: branch ? ['preview'] : ['production', 'preview'], gitBranch: branch, value: 'ciphertext-not-a-url' };
    envs.push(env);
    decrypted.set(env.id, { ...env, value });
  }
  add('NEXT_PUBLIC_SUPABASE_URL', 'https://production.supabase.co', null);
  add('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'production-anon-secret', null);
  add('SUPABASE_SERVICE_ROLE_KEY', 'production-service-secret', null, 'sensitive');
  if (isolated) {
    add('NEXT_PUBLIC_SUPABASE_URL', sharedUrl ? 'https://production.supabase.co/' : 'https://preview.supabase.co', previewTarget.branch, sensitiveUrl ? 'sensitive' : 'encrypted');
    add('NEXT_PUBLIC_SUPABASE_ANON_KEY', sharedAnon ? 'production-anon-secret' : 'preview-anon-secret', previewTarget.branch);
    add('SUPABASE_SERVICE_ROLE_KEY', 'preview-service-secret', previewTarget.branch, 'sensitive');
  }
  add('NIGHTOS_LINE_BRIDGE_ENABLED', 'false', previewTarget.branch);
  add('NIGHTOS_DISABLE_MOCK_AUTH', 'true', previewTarget.branch);
  const fetchImpl = vi.fn(async (url: string) => {
    const path = new URL(url).pathname;
    if (path.endsWith('/env')) return Response.json({ envs });
    if (path.includes('/env/')) return Response.json(decrypted.get(path.split('/').at(-1)));
    return Response.json({ id: previewTarget.project, name: 'nightos-app', accountId: wrongTarget ? 'other-team' : previewTarget.team });
  });
  return { envs, fetchImpl };
}

describe('Preview DB configuration boundary', () => {
  it('detects inherited production DB credentials without exposing their values', async () => {
    const { fetchImpl } = fixture({ isolated: false });
    const report = await auditPreviewConfig({ token: 'vercel-secret', fetchImpl });
    expect(report.pass).toBe(false);
    expect(report.checks.find(item => item.check === 'different_supabase_projects')?.pass).toBe(false);
    const output = JSON.stringify(report);
    expect(output).not.toMatch(/secret|supabase\.co|ciphertext/);
  });
  it('reads encrypted values individually and limits every request to Vercel GETs', async () => {
    const { fetchImpl } = fixture();
    const report = await auditPreviewConfig({ token: 'vercel-secret', fetchImpl });
    expect(report.pass).toBe(true);
    expect(report.databaseAndDeploymentVerified).toBe(false);
    for (const [url, options] of fetchImpl.mock.calls as any) {
      expect(new URL(url).origin).toBe('https://api.vercel.com');
      expect(new URL(url).searchParams.get('teamId')).toBe(previewTarget.team);
      expect(options.method).toBe('GET');
      expect(options.redirect).toBe('error');
      expect(options).not.toHaveProperty('body');
    }
    expect(fetchImpl.mock.calls.some(([url]) => url.includes('/v1/'))).toBe(true);
  });
  it.each([{ sharedUrl: true }, { sharedAnon: true }, { sensitiveUrl: true }])('fails closed on reused or unreadable credentials: %j', async options => {
    expect((await auditPreviewConfig({ token: 'token', ...fixture(options) })).pass).toBe(false);
  });
  it('does not accept a branch entry also targeting production', async () => {
    const f = fixture();
    f.envs.find(env => env.key === 'SUPABASE_SERVICE_ROLE_KEY' && env.gitBranch).target.push('production');
    expect((await auditPreviewConfig({ token: 'token', fetchImpl: f.fetchImpl })).pass).toBe(false);
  });
  it('rejects ambiguous overrides instead of selecting one arbitrarily', async () => {
    const f = fixture();
    f.envs.push({ ...f.envs.find(env => env.key === 'NEXT_PUBLIC_SUPABASE_URL' && env.gitBranch), id: 'duplicate' });
    await expect(auditPreviewConfig({ token: 'token', fetchImpl: f.fetchImpl })).rejects.toThrow('vercel_env_ambiguous');
  });
  it('stops before reading envs if the project belongs to a different team', async () => {
    const { fetchImpl } = fixture({ wrongTarget: true });
    await expect(auditPreviewConfig({ token: 'token', fetchImpl })).rejects.toThrow('vercel_target_mismatch');
    expect(fetchImpl).toHaveBeenCalledOnce();
  });
  it('does not expose API response text on an authorization failure', async () => {
    const fetchImpl = vi.fn(async () => new Response('private upstream detail', { status: 403 }));
    await expect(auditPreviewConfig({ token: 'token', fetchImpl })).rejects.toThrow('vercel_api_failed');
    expect(fetchImpl).toHaveBeenCalledOnce();
  });
});
