-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS migration 017 — team chat attachments + customer link
-- ───────────────────────────────────────────────────────────────
-- チャットに画像（LINEスクショ等）を貼れるようにし、メッセージが
-- どの顧客についてのものかを（@顧客メンション / 受動検出の確認で）
-- 紐付けられるようにする。
--   - attachments: [{ url, mime, width, height }] の JSONB 配列
--   - customer_id: このメッセージが話題にしている顧客（逆カルテ連携用）
-- すべて if not exists / on conflict で冪等。
-- ═══════════════════════════════════════════════════════════════

alter table if exists team_chat_messages
  add column if not exists attachments jsonb;

alter table if exists team_chat_messages
  add column if not exists customer_id text references customers(id) on delete set null;

create index if not exists team_chat_messages_customer_idx
  on team_chat_messages(customer_id)
  where customer_id is not null;

-- ─── Supabase Storage バケット ────────────────────────────────
-- チャット添付用の private バケット。画像のみ・5MB 上限。
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'team-chat',
  'team-chat',
  false,
  5242880,
  array['image/png','image/jpeg','image/webp','image/gif']
)
on conflict (id) do nothing;

-- ─── Storage RLS: 同店舗のキャストのみ読み書き可 ──────────────
-- オブジェクトパスは `${store_id}/${room_id}/${file}` とする想定。
-- 先頭セグメント（= store_id）が自分の店舗と一致するものだけ許可。
-- auth_cast_store_id() は migration 010 で定義済み（SECURITY DEFINER）。

drop policy if exists "team-chat: read own store" on storage.objects;
create policy "team-chat: read own store"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'team-chat'
    and (storage.foldername(name))[1] = auth_cast_store_id()
  );

drop policy if exists "team-chat: insert own store" on storage.objects;
create policy "team-chat: insert own store"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'team-chat'
    and (storage.foldername(name))[1] = auth_cast_store_id()
  );

drop policy if exists "team-chat: delete own store" on storage.objects;
create policy "team-chat: delete own store"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'team-chat'
    and (storage.foldername(name))[1] = auth_cast_store_id()
  );
