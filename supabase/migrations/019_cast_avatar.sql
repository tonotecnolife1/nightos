-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS migration 019 — キャストのアイコン画像（プロフィール写真）
-- ───────────────────────────────────────────────────────────────
-- 各キャストが自分のアイコン画像を設定できるようにする。
--   - nightos_casts.avatar_path: private バケット内のオブジェクトパス。
--     表示側は読み込み時に署名付き URL を都度発行する（パスは失効しない）。
--   - cast-avatars: 画像専用の private バケット（5MB 上限）。
-- オブジェクトパスは `${store_id}/${cast_id}/...` を想定。
-- すべて if not exists / on conflict で冪等。
-- ═══════════════════════════════════════════════════════════════

alter table if exists nightos_casts
  add column if not exists avatar_path text;

-- ─── Supabase Storage バケット ────────────────────────────────
-- アイコン画像用の private バケット。画像のみ・5MB 上限。
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cast-avatars',
  'cast-avatars',
  false,
  5242880,
  array['image/png','image/jpeg','image/webp','image/gif']
)
on conflict (id) do nothing;

-- ─── Storage RLS ──────────────────────────────────────────────
-- 読み取り: 同店舗のキャスト全員（チーム表示のため）。
-- 書き込み/削除: 自分の cast フォルダ（`${store_id}/${cast_id}/...`）のみ。
-- auth_cast_store_id() は migration 010 で定義済み（SECURITY DEFINER）。

drop policy if exists "cast-avatars: read own store" on storage.objects;
create policy "cast-avatars: read own store"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'cast-avatars'
    and (storage.foldername(name))[1] = auth_cast_store_id()
  );

drop policy if exists "cast-avatars: insert own cast" on storage.objects;
create policy "cast-avatars: insert own cast"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'cast-avatars'
    and (storage.foldername(name))[1] = auth_cast_store_id()
    and (storage.foldername(name))[2] in (
      select id from nightos_casts where auth_user_id = auth.uid()
    )
  );

drop policy if exists "cast-avatars: update own cast" on storage.objects;
create policy "cast-avatars: update own cast"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'cast-avatars'
    and (storage.foldername(name))[2] in (
      select id from nightos_casts where auth_user_id = auth.uid()
    )
  );

drop policy if exists "cast-avatars: delete own cast" on storage.objects;
create policy "cast-avatars: delete own cast"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'cast-avatars'
    and (storage.foldername(name))[2] in (
      select id from nightos_casts where auth_user_id = auth.uid()
    )
  );
