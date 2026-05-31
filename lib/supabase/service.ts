import { createClient } from "@supabase/supabase-js";

/**
 * サービスロール Supabase クライアント。
 *
 * RLS を**バイパス**するため、呼び出し側は必ずクエリを明示的に
 * スコープすること（例: `.eq("store_id", storeId)`）。store_id を
 * 付け忘れると他店舗のデータが返る／キャッシュに混入する危険がある。
 *
 * cookie やリクエスト状態を一切読まないので、`unstable_cache` の
 * 内側（リクエストスコープ外）から安全に呼べる。
 */
export function createServiceSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

/** サービスロールキーが設定済みか。未設定なら従来の RLS 経路にフォールバックする。 */
export function isServiceRoleConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
