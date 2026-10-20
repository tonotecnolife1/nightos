-- Personal LINE relay. Body / draft / confirmation / result are AES-GCM
-- ciphertext. Keys stay in the owner's browser and paired Mac, never here.
-- No store/manager policies, and no direct anon/authenticated table grants.
create table if not exists public.personal_line_devices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  cast_id text not null references public.nightos_casts(id) on delete cascade,
  name text not null,
  pair_hash text,
  pair_expires_at timestamptz,
  token_hash text unique,
  paired_at timestamptz,
  last_seen timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.personal_line_jobs (
  id uuid primary key,
  device_id uuid not null references public.personal_line_devices(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  operation text not null check (operation in ('status','chats','contacts','messages','prepare','send','draft_status')),
  state text not null default 'queued' check (state in ('queued','running','awaiting_confirmation','completed','failed','unknown','expired','cancelled')),
  ciphertext text not null check (length(ciphertext) <= 700000),
  result text,
  form text,
  confirmation text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists personal_line_jobs_queue on public.personal_line_jobs(device_id,created_at) where state='queued';
create index if not exists personal_line_jobs_expiry on public.personal_line_jobs(expires_at);
create index if not exists personal_line_devices_owner on public.personal_line_devices(owner_id);
create table if not exists public.personal_line_links (
  device_id uuid not null references public.personal_line_devices(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  chat_id text not null,
  customer_id text not null references public.customers(id) on delete cascade,
  primary key (device_id,chat_id)
);
alter table public.personal_line_devices enable row level security;
alter table public.personal_line_jobs enable row level security;
alter table public.personal_line_links enable row level security;
revoke all on public.personal_line_devices, public.personal_line_jobs, public.personal_line_links from anon, authenticated;
grant all on public.personal_line_devices, public.personal_line_jobs, public.personal_line_links to service_role;

-- At-most-once claim, including when two workers race. Running jobs are NEVER
-- reclaimed after a crash; their send result becomes unknown and needs review.
create or replace function public.claim_personal_line_job(p_device uuid)
returns setof public.personal_line_jobs language sql security definer set search_path = '' as $$
  update public.personal_line_jobs set state='running'
  where id = (
    select j.id from public.personal_line_jobs j
    join public.personal_line_devices d on d.id=j.device_id and d.owner_id=j.owner_id
    join public.nightos_casts c on c.id=d.cast_id and c.auth_user_id=d.owner_id and c.user_role='cast'
    where j.device_id=p_device and d.revoked_at is null and d.token_hash is not null
      and j.state='queued' and j.expires_at > now()
    order by j.created_at limit 1 for update of j skip locked
  ) returning *;
$$;
revoke all on function public.claim_personal_line_job(uuid) from public, anon, authenticated;
grant execute on function public.claim_personal_line_job(uuid) to service_role;
