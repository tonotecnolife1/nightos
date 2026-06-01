-- ═══════════════════════════════════════════════════════════════
-- NIGHTOS migration 020 — さくらママ 相談履歴のサーバー同期
-- ───────────────────────────────────────────────────────────────
-- 背景:
--   さくらママ（ruri-mama）の相談履歴 (chat-session-store) は
--   これまで localStorage のみに保存していたため、同一アカウントでも
--   端末をまたぐと同期しなかった (PC で相談 → スマホに出てこない)。
--   さらに端末内の履歴が壊れると画面が落ち、唯一の復帰手段が
--   「相談履歴をリセット」= 全削除だったため、ユーザーの資産である
--   相談履歴そのものが失われていた。
--
--   本 migration で、キャスト本人が所有する相談セッションをサーバーに
--   保存するテーブルを追加し、auth.uid() スコープの RLS を付与する。
--   これにより同一アカウントなら端末横断で整合し、片方の端末で消えても
--   サーバー / もう片方の端末から復元できる。
--
--   設計は migration 013 (cast_shifts / cast_plans) を踏襲。
--
-- ⚠️ 相談内容は本人のプライバシーに関わるため、マネージャー (mama/oneesan)
--    にも閲覧させない。RLS は本人 (own cast) のみ。
-- ═══════════════════════════════════════════════════════════════

-- ─── cast_chat_sessions ─────────────────────────────────────────
create table if not exists cast_chat_sessions (
  id            text primary key,                  -- session_<ts>_<rand>
  cast_id       text not null references nightos_casts(id) on delete cascade,
  customer_id   text,                              -- 相談相手のお客様 (任意)
  customer_name text,                              -- 表示用に非正規化保持
  title         text not null default '相談',
  messages      jsonb not null default '[]'::jsonb,-- ChatMessage[]
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists cast_chat_sessions_cast_idx
  on cast_chat_sessions (cast_id);

-- ─── RLS ────────────────────────────────────────────────────────
alter table cast_chat_sessions enable row level security;

-- anon には一切触らせない（authenticated のみ）
revoke all on cast_chat_sessions from anon;
grant select, insert, update, delete on cast_chat_sessions to authenticated;

-- 相談履歴は本人のみ全操作可。マネージャー閲覧ポリシーはあえて付けない。
create policy "cast_chat_sessions: own cast"
  on cast_chat_sessions
  for all
  using (cast_id in (select id from nightos_casts where auth_user_id = auth.uid()))
  with check (cast_id in (select id from nightos_casts where auth_user_id = auth.uid()));
