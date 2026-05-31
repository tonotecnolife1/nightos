import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCastByAuthUserId } from "./supabase-real";
import type { Cast } from "@/types/nightos";

/**
 * Resolve the cast backed by a *real* Supabase Auth session, or null.
 *
 * Unlike `getCurrentCast` (lib/nightos/auth) this never falls back to the
 * mock cookie — API routes use it so mock / unauthenticated callers get a
 * clean `{ authenticated: false }` and the client stays on localStorage.
 */
export async function resolveAuthedCast(): Promise<Cast | null> {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return await getCastByAuthUserId(user.id);
  } catch {
    return null;
  }
}
