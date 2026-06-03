-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS migration 016 — team_chat RLS / grants
-- ───────────────────────────────────────────────────────────────
-- 背景:
--   migration 010 で全センシティブテーブルの RLS を再有効化したが、
--   team_chat_rooms / team_chat_room_members / team_chat_messages の
--   3 テーブルが対象から漏れていた。grant / policy が噛み合わず、
--   authenticated ロール（anon key + ユーザーセッション）での
--   INSERT / SELECT が成立しないため、「新しいチャット」で相手を
--   選んでも findOrCreateDmRoom の room INSERT が失敗し、
--   createDmRoomAction が null を返して画面遷移しない。
--
-- 本 migration で 010 と同じセキュリティモデル（店舗スコープ）に
-- 揃える:
--   1. authenticated にテーブル権限を付与（RLS とは別レイヤ）
--   2. anon の書き込みを剥奪
--   3. RLS 有効化 + auth_cast_store_id() ベースの店舗スコープポリシー
--
-- auth_cast_store_id() は migration 010 で定義済み（SECURITY DEFINER）。
-- すべて drop ... if exists / enable（冪等）で再実行可能。
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. authenticated へのテーブル権限 ───────────────────────
grant select, insert, update, delete on team_chat_rooms        to authenticated;
grant select, insert, update, delete on team_chat_room_members to authenticated;
grant select, insert, update, delete on team_chat_messages     to authenticated;

-- ─── 2. anon の書き込み剥奪 ──────────────────────────────────
revoke insert, update, delete on team_chat_rooms        from anon;
revoke insert, update, delete on team_chat_room_members from anon;
revoke insert, update, delete on team_chat_messages     from anon;

-- ─── 3. RLS 有効化 ───────────────────────────────────────────
alter table team_chat_rooms        enable row level security;
alter table team_chat_room_members enable row level security;
alter table team_chat_messages     enable row level security;

-- ─── 4. team_chat_rooms: 同店舗スコープ ──────────────────────
-- ルームは自店舗のものだけ読み書き可。auth_cast_store_id() は
-- nightos_casts を SECURITY DEFINER で引くため他テーブルの RLS と
-- 再帰しない。
drop policy if exists "team_chat_rooms: same store" on team_chat_rooms;
create policy "team_chat_rooms: same store"
  on team_chat_rooms
  for all
  using (store_id = auth_cast_store_id())
  with check (store_id = auth_cast_store_id());

-- ─── 5. team_chat_room_members: 自店舗ルームのメンバー行 ─────
-- room_id 経由で team_chat_rooms を参照。rooms 側ポリシーは
-- members を参照しないので無限再帰しない。
drop policy if exists "team_chat_members: same store" on team_chat_room_members;
create policy "team_chat_members: same store"
  on team_chat_room_members
  for all
  using (
    exists (
      select 1 from team_chat_rooms r
       where r.id = room_id
         and r.store_id = auth_cast_store_id()
    )
  )
  with check (
    exists (
      select 1 from team_chat_rooms r
       where r.id = room_id
         and r.store_id = auth_cast_store_id()
    )
  );

-- ─── 6. team_chat_messages: 自店舗ルームのメッセージ ────────
drop policy if exists "team_chat_messages: same store" on team_chat_messages;
create policy "team_chat_messages: same store"
  on team_chat_messages
  for all
  using (
    exists (
      select 1 from team_chat_rooms r
       where r.id = room_id
         and r.store_id = auth_cast_store_id()
    )
  )
  with check (
    exists (
      select 1 from team_chat_rooms r
       where r.id = room_id
         and r.store_id = auth_cast_store_id()
    )
  );

-- ─── 動作確認（SQL Editor で実行）──────────────────────────────
--   select tablename, rowsecurity from pg_tables
--    where schemaname = 'public' and tablename like 'team_chat%';
--   -- 期待: rowsecurity = true の 3 行
--
--   select grantee, table_name, privilege_type
--     from information_schema.role_table_grants
--    where table_name like 'team_chat%' and grantee = 'authenticated';
--   -- 期待: select/insert/update/delete が 3 テーブル分
