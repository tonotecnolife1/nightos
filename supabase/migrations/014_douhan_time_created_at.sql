-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS migration 014 — Douhan server sync (cast 側)
-- ───────────────────────────────────────────────────────────────
-- 同伴 (douhans) もこれまで localStorage のみで端末間同期しなかった。
-- 既存の douhans テーブル (migration 003 + RLS 010 "own store") を
-- 流用して、キャスト本人の同伴を /api/cast-schedule 経由で同期する。
--
-- 既存テーブルにクライアント型 (types/nightos Douhan) が持つ 2 カラムが
-- 欠けているため追加する:
--   - time       : スケジュールのタイムライン表示・並び替え用 (任意)
--   - created_at : 登録日時。未指定時はアプリ側で date を代用していた
--
-- RLS は migration 010 の "douhans: own store" をそのまま使う
-- (同店舗のキャスト/マネージャーが店舗内同伴を読み書き可)。
-- ═══════════════════════════════════════════════════════════════

alter table douhans add column if not exists time       text;
alter table douhans add column if not exists created_at timestamptz default now();
