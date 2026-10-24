import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const previewTarget = Object.freeze({
  team: 'team_8jTCfUd9XXq1EtR410PR4L7v',
  project: 'prj_DMqHn7SrPOCBEmqcDzi2Q5e5KMCl',
  branch: 'codex/mac-line-bridge',
});

// Management API GETs only. Never print API bodies, env values, headers, or
// exception messages. In particular, list-env values are encrypted ciphertext;
// use the individual-env endpoint to compare readable values in memory.
export async function auditPreviewConfig({ token, fetchImpl = fetch } = {}) {
  if (!token) throw new Error('vercel_token_missing');
  const { team, project, branch } = previewTarget;
  async function get(path) {
    const response = await fetchImpl(`https://api.vercel.com${path}?teamId=${team}`, {
      method: 'GET', redirect: 'error',
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error('vercel_api_failed');
    try { return await response.json(); } catch { throw new Error('vercel_response_invalid'); }
  }
  const identity = await get(`/v9/projects/${project}`);
  if (identity.id !== project || identity.name !== 'nightos-app' || identity.accountId !== team) {
    throw new Error('vercel_target_mismatch');
  }
  const result = await get(`/v9/projects/${project}/env`);
  if (!Array.isArray(result.envs)) throw new Error('vercel_response_invalid');
  const envs = result.envs;
  function candidates(key, target, gitBranch) {
    return envs.filter(env => env.key === key && env.target?.includes(target)
      && (env.gitBranch ?? null) === gitBranch && !env.customEnvironmentIds?.length);
  }
  function one(entries) {
    if (entries.length > 1) throw new Error('vercel_env_ambiguous');
    return entries[0];
  }
  function production(key) { return one(candidates(key, 'production', null)); }
  function override(key) { return one(candidates(key, 'preview', branch)); }
  function preview(key) { return override(key) ?? one(candidates(key, 'preview', null)); }
  function isolated(key) {
    const env = override(key);
    return !!env && env.target.length === 1 && env.target[0] === 'preview';
  }
  const values = new Map();
  async function value(env) {
    // Sensitive Vercel variables are intentionally unreadable. A distinct
    // binding proves scope only, never that its hidden credential is correct.
    if (!env || env.type === 'sensitive') return null;
    if (!values.has(env.id)) {
      const data = await get(`/v1/projects/${project}/env/${encodeURIComponent(env.id)}`);
      if (data.id !== env.id || data.key !== env.key) throw new Error('vercel_response_invalid');
      values.set(env.id, typeof data.value === 'string' && data.value.length ? data.value : null);
    }
    return values.get(env.id);
  }
  function projectHost(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && !parsed.username && !parsed.password && !parsed.port
        && parsed.pathname === '/' && !parsed.search && !parsed.hash
        && /^[a-z0-9]+\.supabase\.co$/.test(parsed.hostname) ? parsed.hostname : null;
    } catch { return null; }
  }
  const prodHost = projectHost(await value(production('NEXT_PUBLIC_SUPABASE_URL')));
  const previewHost = projectHost(await value(preview('NEXT_PUBLIC_SUPABASE_URL')));
  const prodAnon = await value(production('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
  const previewAnon = await value(preview('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
  const checks = [
    { check: 'branch_database_bindings', pass: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'].every(isolated) },
    { check: 'different_supabase_projects', pass: !!prodHost && !!previewHost && prodHost !== previewHost },
    { check: 'different_anon_keys', pass: !!prodAnon && !!previewAnon && prodAnon !== previewAnon },
    { check: 'branch_service_role_binding', pass: isolated('SUPABASE_SERVICE_ROLE_KEY') && override('SUPABASE_SERVICE_ROLE_KEY')?.id !== production('SUPABASE_SERVICE_ROLE_KEY')?.id },
    { check: 'bridge_disabled_during_setup', pass: isolated('NIGHTOS_LINE_BRIDGE_ENABLED') && await value(override('NIGHTOS_LINE_BRIDGE_ENABLED')) === 'false' },
    { check: 'mock_auth_disabled', pass: isolated('NIGHTOS_DISABLE_MOCK_AUTH') && await value(override('NIGHTOS_DISABLE_MOCK_AUTH')) === 'true' },
  ];
  return {
    target: { project: 'nightos-app', branch }, checks,
    pass: checks.every(check => check.pass),
    // Even PASS is only a configuration comparison. No Supabase/LINE request,
    // schema check, credential validation, or deployment inspection is made.
    databaseAndDeploymentVerified: false,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  auditPreviewConfig({ token: process.env.VERCEL_TOKEN }).then(report => {
    console.log(JSON.stringify(report, null, 2));
    if (!report.pass) process.exitCode = 1;
  }).catch(() => {
    console.error('FAIL: Vercel設定を確認できません。トークンの準備状態・対象チームの権限・通信許可を確認してください。秘密値やAPI応答は表示していません。');
    process.exitCode = 1;
  });
}
