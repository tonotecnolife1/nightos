"use client";

import { createClient } from "@/lib/supabase/client";
import type { ChatAttachment } from "../types";

const BUCKET = "team-chat";
export const MAX_ATTACHMENTS = 4;
export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isAllowedImage(file: File): boolean {
  return ALLOWED_MIME.includes(file.type) && file.size <= MAX_FILE_BYTES;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a chat image. In production this stores the file in the private
 * Supabase Storage `team-chat` bucket under `${storeId}/${roomId}/...` and
 * returns a signed URL for immediate display plus the path for persistence.
 *
 * Without Supabase configured (local/mock), it falls back to an inline
 * data URL so the composer still works for demos — note that inline URLs
 * do not sync to other devices.
 */
export async function uploadChatImage(opts: {
  file: File;
  storeId: string;
  roomId: string;
}): Promise<ChatAttachment> {
  const { file, storeId, roomId } = opts;

  if (!isSupabaseConfigured()) {
    return { url: await fileToDataUrl(file), path: null, mime: file.type };
  }

  const supabase = createClient();
  const ext = (file.name.split(".").pop() || "png").toLowerCase().slice(0, 5);
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${storeId || "store"}/${roomId}/${Date.now()}_${rand}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    // Bucket/policy not set up yet → degrade gracefully to inline so the
    // message still sends. (Won't sync across devices.)
    return { url: await fileToDataUrl(file), path: null, mime: file.type };
  }

  // Private bucket → signed URL for immediate optimistic display. The
  // canonical reference persisted in the DB is `path`; the server re-signs
  // on read so links never go stale.
  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60); // 1h is plenty for the current session

  return { url: signed?.signedUrl ?? "", path, mime: file.type };
}
