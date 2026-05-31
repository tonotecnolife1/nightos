import { createBrowserClient } from "@supabase/ssr";

/**
 * ブラウザ用 Supabase クライアント。
 *
 * env が未設定のまま `createBrowserClient(undefined!, undefined!)` を
 * 呼ぶと内部で throw し、呼び出し元コンポーネントの例外がそのまま
 * `app/error.tsx`（「ページを読み込めませんでした」）に到達してしまう。
 * そのため未設定時は明示的に分かるエラーを投げ、呼び出し側が
 * `isSupabaseBrowserConfigured()` で事前ガードできるようにする。
 */
export function isSupabaseBrowserConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase の環境変数 (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) が未設定です。",
    );
  }
  return createBrowserClient(url, anonKey);
}
