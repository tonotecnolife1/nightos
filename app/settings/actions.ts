"use server";

import { revalidatePath } from "next/cache";
import { reportError } from "@/lib/nightos/error-reporter";

const AVATAR_BUCKET = "cast-avatars";

async function requireSupabase(): Promise<
  | { client: import("@supabase/supabase-js").SupabaseClient }
  | { error: string }
> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { error: "Supabase が未設定のためこの機能は利用できません" };
  }
  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  return { client: createServerSupabaseClient() };
}

/**
 * Resolve the current user's active cast row (id + existing avatar_path).
 */
async function currentCastRow(
  client: import("@supabase/supabase-js").SupabaseClient,
): Promise<
  { id: string; avatar_path: string | null } | { error: string }
> {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { error: "ログインしてからお試しください。" };

  const { data, error } = await client
    .from("nightos_casts")
    .select("id, avatar_path")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (error) {
    reportError(error, { scope: "settings.currentCastRow", userId: user.id });
    return { error: `アカウント情報を取得できませんでした: ${error.message}` };
  }
  if (!data) return { error: "アカウント情報が見つかりません。" };
  return { id: data.id as string, avatar_path: (data.avatar_path as string) ?? null };
}

/**
 * Persist a freshly-uploaded avatar's storage path onto the user's active
 * cast row. The image itself is uploaded client-side via uploadCastAvatar();
 * this only records the canonical path. Any previously-stored object is
 * deleted to avoid orphaned files.
 */
export async function updateCastAvatar(
  path: string,
): Promise<{ error?: string }> {
  if (!path || typeof path !== "string") {
    return { error: "画像のパスが不正です。" };
  }

  const supabase = await requireSupabase();
  if ("error" in supabase) return supabase;

  const cast = await currentCastRow(supabase.client);
  if ("error" in cast) return cast;

  // Guard: the path must live under this cast's own folder.
  if (!path.includes(`/${cast.id}/`)) {
    return { error: "画像のパスが不正です。" };
  }

  const previous = cast.avatar_path;

  const { error } = await supabase.client
    .from("nightos_casts")
    .update({ avatar_path: path })
    .eq("id", cast.id);
  if (error) {
    reportError(error, { scope: "settings.updateCastAvatar", extra: { path } });
    return { error: `アイコンの保存に失敗しました: ${error.message}` };
  }

  // Best-effort cleanup of the old object.
  if (previous && previous !== path) {
    await supabase.client.storage.from(AVATAR_BUCKET).remove([previous]);
  }

  revalidatePath("/settings");
  revalidatePath("/cast/my");
  return {};
}

/**
 * Clear the user's avatar and delete the stored object.
 */
export async function removeCastAvatar(): Promise<{ error?: string }> {
  const supabase = await requireSupabase();
  if ("error" in supabase) return supabase;

  const cast = await currentCastRow(supabase.client);
  if ("error" in cast) return cast;

  if (!cast.avatar_path) return {};

  const { error } = await supabase.client
    .from("nightos_casts")
    .update({ avatar_path: null })
    .eq("id", cast.id);
  if (error) {
    reportError(error, { scope: "settings.removeCastAvatar" });
    return { error: `アイコンの削除に失敗しました: ${error.message}` };
  }

  await supabase.client.storage.from(AVATAR_BUCKET).remove([cast.avatar_path]);

  revalidatePath("/settings");
  revalidatePath("/cast/my");
  return {};
}
