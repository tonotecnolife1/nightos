-- Run AFTER migration 021 against the explicitly selected project, using a
-- database administrator. Catalog reads and aggregate counts only. No claim,
-- pairing, job creation, user creation, or application data changes.
begin transaction read only;

select current_database() as database_name,
       to_regclass('supabase_migrations.schema_migrations') is not null as has_migration_history;

do $$
declare applied boolean;
begin
  if to_regclass('supabase_migrations.schema_migrations') is not null then
    execute 'select exists(select 1 from supabase_migrations.schema_migrations where version = ''021'')' into applied;
    raise notice 'Migration version 021 recorded: % (manual SQL application may not record a version)', applied;
  else
    raise notice 'No CLI migration history; inspect applied schema and retain the SQL application record';
  end if;
end $$;

-- All three rows must have RLS/service_role_access=true and every direct
-- anon/authenticated privilege=false. Failures block enabling the relay.
select c.relname as table_name, c.relrowsecurity as rls,
       has_table_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') as anon_access,
       has_table_privilege('authenticated', c.oid, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') as authenticated_access,
       has_table_privilege('service_role', c.oid, 'SELECT')
         and has_table_privilege('service_role', c.oid, 'INSERT')
         and has_table_privilege('service_role', c.oid, 'UPDATE')
         and has_table_privilege('service_role', c.oid, 'DELETE') as service_role_access
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('personal_line_devices','personal_line_jobs','personal_line_links')
order by c.relname;

-- Expect one SECURITY DEFINER function with search_path="", service_role
-- execution only. Inspect its definition against migration 021 without calling it.
select p.proname, pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef as security_definer, p.proconfig,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute,
       has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_execute,
       pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'claim_personal_line_job';

select tablename, indexname, indexdef from pg_indexes
where schemaname = 'public'
  and tablename in ('personal_line_devices','personal_line_jobs','personal_line_links')
order by tablename,indexname;

select conrelid::regclass as table_name, conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid in (to_regclass('public.personal_line_devices'),to_regclass('public.personal_line_jobs'),to_regclass('public.personal_line_links'))
order by table_name,conname;

-- Counts only: never print names, email addresses, Auth IDs or LINE content.
-- This does not replace checking the intended person's real logged-in session.
select count(*) filter (where c.user_role = 'cast' and u.id is not null) as auth_bound_casts,
       count(*) filter (where c.auth_user_id is not null and u.id is null) as dangling_auth_links
from public.nightos_casts c left join auth.users u on u.id = c.auth_user_id;
select count(*) as duplicate_auth_bindings from (
  select auth_user_id from public.nightos_casts where auth_user_id is not null
  group by auth_user_id having count(*) > 1
) duplicates;

rollback;
