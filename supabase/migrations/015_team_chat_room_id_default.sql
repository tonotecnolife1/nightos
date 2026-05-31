-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS team chat — room id default (015)
-- ───────────────────────────────────────────────────────────────
-- migration 004 defined team_chat_rooms.id as a text PK with no
-- default. Any insert that omitted `id` therefore failed with a
-- not-null violation — which silently broke "新しいチャット"
-- (createDmRoomAction returned null, so the client never navigated
-- to the new room and just fell back to the list).
--
-- The application now generates the id explicitly, but we add a DB
-- default here as defense-in-depth so an omitted id can never break
-- room creation again. gen_random_uuid() is built in on Supabase.
-- ALTER TABLE IF EXISTS / SET DEFAULT は冪等。
-- ═══════════════════════════════════════════════════════════════

alter table if exists team_chat_rooms
  alter column id set default gen_random_uuid()::text;
