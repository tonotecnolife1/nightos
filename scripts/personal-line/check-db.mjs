// Optional migration verification in an isolated, in-memory PostgreSQL WASM.
// Install PGlite separately; no app/runtime dependency or production DB access.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const { PGlite }=await import(pathToFileURL(resolve(process.argv[2])).href);
const db=new PGlite();
await db.exec(`
create role anon; create role authenticated; create role service_role bypassrls;
create schema auth; create table auth.users(id uuid primary key);
create table public.nightos_casts(id text primary key,auth_user_id uuid,user_role text);
create table public.customers(id text primary key);
insert into auth.users values ('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
insert into public.nightos_casts values ('cast1','00000000-0000-4000-8000-000000000001','cast');
grant select on public.nightos_casts to service_role;
`);
const sql=await readFile(new URL('../../supabase/migrations/021_personal_line_bridge.sql',import.meta.url),'utf8');
await db.exec(sql);await db.exec(sql); // migration is rerunnable
await db.exec(`insert into personal_line_devices(id,owner_id,cast_id,name,token_hash) values ('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','cast1','synthetic','hash');
insert into personal_line_jobs(id,device_id,owner_id,operation,ciphertext,expires_at) values ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','send','encrypted',now()+interval '2 minutes');`);
for(const role of ['anon','authenticated']){
  await db.exec('set role '+role);
  for(const table of ['personal_line_devices','personal_line_jobs','personal_line_links'])await assert.rejects(db.query('select * from '+table),/permission denied/);
  await assert.rejects(db.query("select * from claim_personal_line_job('10000000-0000-4000-8000-000000000001')"),/permission denied/);
  await db.exec('reset role');
}
await db.exec('set role service_role');
const claim=()=>db.query("select * from claim_personal_line_job('10000000-0000-4000-8000-000000000001')");
assert.equal((await claim()).rows.length,1);
assert.equal((await claim()).rows.length,0); // no reclaim / replay of running send
await db.exec("update personal_line_jobs set state='queued',owner_id='00000000-0000-4000-8000-000000000002'");
assert.equal((await claim()).rows.length,0); // mismatched ownership cannot execute
await db.exec("update personal_line_jobs set owner_id='00000000-0000-4000-8000-000000000001'; update personal_line_devices set revoked_at=now()");
assert.equal((await claim()).rows.length,0);
await db.exec("update personal_line_devices set revoked_at=null; update personal_line_jobs set expires_at=now()-interval '1 minute'");
assert.equal((await claim()).rows.length,0);
await db.exec('reset role');
await db.exec("update personal_line_jobs set expires_at=now()+interval '1 minute'; update nightos_casts set user_role='store_owner'");
await db.exec('set role service_role');
assert.equal((await claim()).rows.length,0);
await db.exec('reset role');
// Verify that the production read-only checklist also runs on the fixture.
await db.exec(await readFile(new URL('./verify-deployed-db.sql',import.meta.url),'utf8'));
await db.close();
console.log('PASS: idempotent migration, private table/function grants, no reclaim, owner binding, revocation, expiry, role change. No production database used.');
