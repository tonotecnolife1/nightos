-- ═══════════════════════════════════════════════════════════════
-- 「クラブとのこ」オーナーアカウント作成スクリプト
-- ───────────────────────────────────────────────────────────────
-- 使い方:
--   1. Supabase Dashboard → SQL Editor を開く
--   2. このファイルの内容を貼り付ける
--   3. 下の「▼ ここだけ書き換える ▼」3 行を実際の値に変更
--   4. Run で実行
--
-- 何が起きるか:
--   * 指定メール/パスワードの Supabase Auth ユーザーを作成
--     （既に同じメールがあれば再利用して紐付けし直す）
--   * 「クラブとのこ」に user_role='store_owner' のキャスト行を作成
--     （オーナーは club_role='mama' 相当）
--   * tonoko@gmail.com（キャスト）はそのまま。別アカウントとして併存
--
-- 冪等: 何度実行しても重複オーナーは増えない（同じメールは再利用）。
--
-- ⚠️ auth.users への直接 INSERT は GoTrue のバージョン差で
--    まれに失敗します（例: identities.provider_id 不在）。その場合は
--    末尾「方法B」の手順（Dashboard でユーザー作成 → cast 行のみ SQL）
--    を使ってください。
-- ═══════════════════════════════════════════════════════════════

do $$
declare
  -- ▼ ここだけ書き換える ▼ ───────────────────────────────────────
  owner_email    text := 'owner.tonoko@gmail.com';  -- オーナーのログインメール
  owner_password text := 'ChangeMe2026!';           -- 初期パスワード（8文字以上）
  owner_name     text := 'とのこママ';               -- 源氏名 / 表示名
  -- ▲ ここだけ書き換える ▲ ───────────────────────────────────────

  v_store_id text;
  v_user_id  uuid;
  v_cast_id  text;
begin
  -- crypt / gen_salt / gen_random_uuid のため
  create extension if not exists pgcrypto;

  -- 1. 「とのこ」を含む店舗の ID を取得
  select id into v_store_id
  from nightos_stores
  where name like '%とのこ%'
  order by created_at
  limit 1;

  if v_store_id is null then
    raise exception '店舗名に「とのこ」を含む店舗が見つかりません。店舗名を確認してください。';
  end if;

  -- 2. Auth ユーザー: 既存なら再利用、なければ作成
  select id into v_user_id from auth.users where email = owner_email;

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id, 'authenticated', 'authenticated', owner_email,
      crypt(owner_password, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'store_owner',
        'store_id', v_store_id,
        'display_name', owner_name
      ),
      now(), now(),
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_user_id, v_user_id::text,
      jsonb_build_object(
        'sub', v_user_id::text,
        'email', owner_email,
        'email_verified', true
      ),
      'email', now(), now(), now()
    );

    raise notice 'Auth ユーザーを作成しました: %', owner_email;
  else
    raise notice 'Auth ユーザーは既存です。再利用します: %', owner_email;
  end if;

  -- 3. このユーザーの有効な cast 行があるか
  select id into v_cast_id
  from nightos_casts
  where auth_user_id = v_user_id and is_active = true
  limit 1;

  if v_cast_id is null then
    v_cast_id := 'cast_owner_' || left(replace(v_user_id::text, '-', ''), 12);

    insert into nightos_casts (
      id, store_id, name, user_role, club_role,
      auth_user_id, is_active
    ) values (
      v_cast_id, v_store_id, owner_name, 'store_owner', 'mama',
      v_user_id, true
    );
    raise notice 'store_owner キャスト行を作成しました: %', v_cast_id;
  else
    -- 既存行をオーナーに昇格 & 店舗を「クラブとのこ」に合わせる
    update nightos_casts
       set user_role = 'store_owner',
           club_role = 'mama',
           store_id  = v_store_id,
           name      = owner_name
     where id = v_cast_id;
    raise notice '既存キャスト行を store_owner に更新しました: %', v_cast_id;
  end if;

  -- 4. canonical メタデータ補強（finalize-signup の短絡用）
  update auth.users
     set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
       || jsonb_build_object(
            'role', 'store_owner',
            'store_id', v_store_id,
            'cast_id', v_cast_id,
            'display_name', owner_name
          )
   where id = v_user_id;

  raise notice '完了 ✅  store=% / user=% / cast=%', v_store_id, v_user_id, v_cast_id;
end $$;

-- ─── 確認クエリ（実行後にオーナーが作られたか確認） ──────────────
select c.id        as cast_id,
       c.name,
       c.user_role,
       c.club_role,
       c.is_active,
       u.email
from nightos_casts c
join auth.users u on u.id = c.auth_user_id
where c.store_id = (
        select id from nightos_stores where name like '%とのこ%'
        order by created_at limit 1
      )
order by c.user_role;


-- ═══════════════════════════════════════════════════════════════
-- 方法B: auth.users への直接 INSERT が失敗する場合のフォールバック
-- ───────────────────────────────────────────────────────────────
-- 1) Supabase Dashboard → Authentication → Users → "Add user"
--    - Email / Password を入力し、"Auto Confirm User" を ON で作成
--    - 作成後、そのユーザーの UUID（User UID）をコピー
-- 2) 以下を UUID と表示名を埋めて実行:
--
-- insert into nightos_casts (id, store_id, name, user_role, club_role, auth_user_id, is_active)
-- values (
--   'cast_owner_tonoko',
--   (select id from nightos_stores where name like '%とのこ%' order by created_at limit 1),
--   'とのこママ',
--   'store_owner', 'mama',
--   'ここに Dashboard でコピーした UUID',
--   true
-- );
-- ═══════════════════════════════════════════════════════════════
