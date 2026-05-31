-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS migration 013 — Cast schedule server sync
-- ───────────────────────────────────────────────────────────────
-- 背景:
--   出勤シフト (schedule-store) と「その他の予定」(plan-store) は
--   これまで localStorage のみに保存していたため、同一アカウントでも
--   端末をまたぐと同期しなかった (PC で登録 → スマホで見えない)。
--
-- 本 migration で、キャスト本人が所有する 2 種類のスケジュールを
-- サーバーに保存するテーブルを追加し、auth.uid() スコープの RLS を
-- 付与する。これにより同一アカウントなら端末横断で整合する。
--
--   - cast_shifts : 1 日 1 行の出勤/公休 (PK: cast_id + date)
--   - cast_plans  : 1 日複数行のその他の予定 (PK: id)
--
-- ⚠️ 同伴 (douhans) は既存テーブル + ママ/姉さん共有のため本 migration の
--    対象外。別途対応する。
-- ═══════════════════════════════════════════════════════════════

-- ─── cast_shifts ────────────────────────────────────────────────
create table if not exists cast_shifts (
  cast_id    text not null references nightos_casts(id) on delete cascade,
  date       text not null,                         -- YYYY-MM-DD
  status     text not null default 'working'
             check (status in ('working', 'off')),
  start_time text,                                  -- HH:mm
  end_time   text,                                  -- HH:mm
  note       text,
  updated_at timestamptz not null default now(),
  primary key (cast_id, date)
);

create index if not exists cast_shifts_cast_idx on cast_shifts (cast_id);

-- ─── cast_plans ─────────────────────────────────────────────────
create table if not exists cast_plans (
  id         text primary key,
  cast_id    text not null references nightos_casts(id) on delete cascade,
  date       text not null,                         -- YYYY-MM-DD
  time       text,                                  -- HH:mm (任意)
  title      text not null,
  note       text,
  updated_at timestamptz not null default now()
);

create index if not exists cast_plans_cast_idx on cast_plans (cast_id);

-- ─── RLS ────────────────────────────────────────────────────────
alter table cast_shifts enable row level security;
alter table cast_plans  enable row level security;

-- anon には一切触らせない（authenticated のみ）
revoke all on cast_shifts from anon;
revoke all on cast_plans  from anon;
grant select, insert, update, delete on cast_shifts to authenticated;
grant select, insert, update, delete on cast_plans  to authenticated;

-- 自分の出勤シフトは全操作可。同店舗のマネージャー (mama/oneesan) は閲覧のみ。
create policy "cast_shifts: own cast"
  on cast_shifts
  for all
  using (cast_id in (select id from nightos_casts where auth_user_id = auth.uid()))
  with check (cast_id in (select id from nightos_casts where auth_user_id = auth.uid()));

create policy "cast_shifts: store manager select"
  on cast_shifts
  for select
  using (
    exists (
      select 1 from nightos_casts nc
       where nc.auth_user_id = auth.uid()
         and nc.store_id = auth_cast_store_id()
         and nc.club_role in ('mama', 'oneesan')
    )
  );

-- その他の予定は本人のみ全操作可。
create policy "cast_plans: own cast"
  on cast_plans
  for all
  using (cast_id in (select id from nightos_casts where auth_user_id = auth.uid()))
  with check (cast_id in (select id from nightos_casts where auth_user_id = auth.uid()));
