"use server";

import { revalidatePath } from "next/cache";
import { markCastMessageRead } from "@/lib/nightos/supabase-queries";

export async function markCastMessageReadAction(id: string) {
  await markCastMessageRead(id);
  revalidatePath("/cast/home");
  revalidatePath("/cast/notifications");
  return { ok: true as const };
}
