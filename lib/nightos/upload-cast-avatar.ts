"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "cast-avatars";
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isAllowedAvatar(file: File): boolean {
  return ALLOWED_MIME.includes(file.type) && file.size <= MAX_AVATAR_BYTES;
}

export interface AvatarUploadResult {
  /** A short-lived signed URL for immediate preview. */
  url: string;
  /** The canonical storage path to persist in nightos_casts.avatar_path. */
  path: string;
}

/**
 * Upload a cast's avatar image to the private `cast-avatars` bucket under
 * `${storeId}/${castId}/avatar_${ts}.${ext}` and return a signed URL plus the
 * stored path. The caller persists the path via the `updateCastAvatar` server
 * action; the server re-signs on read so links never go stale.
 *
 * Throws on validation / upload failure so the caller can surface a message.
 */
export async function uploadCastAvatar(opts: {
  file: File;
  storeId: string;
  castId: string;
}): Promise<AvatarUploadResult> {
  const { file, storeId, castId } = opts;

  if (!isAllowedAvatar(file)) {
    throw new Error(
      "PNG / JPEG / WebP / GIF の画像（5MB まで）を選んでください。",
    );
  }
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase が未設定のためアップロードできません。");
  }

  const supabase = createClient();
  const ext = (file.name.split(".").pop() || "png").toLowerCase().slice(0, 5);
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${storeId}/${castId}/avatar_${Date.now()}_${rand}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    throw new Error(`画像のアップロードに失敗しました: ${error.message}`);
  }

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60); // 1h preview

  return { url: signed?.signedUrl ?? "", path };
}
