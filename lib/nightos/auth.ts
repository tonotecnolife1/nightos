import { cookies } from "next/headers";
import type { Cast, CastUserRole, Customer } from "@/types/nightos";
import {
  CURRENT_CAST_ID,
  CURRENT_MAMA_ID,
  VENUE_TYPE_STORAGE_KEY,
} from "./constants";
import { isMockAuthDisabled } from "./env";
import { mockCasts } from "./mock-data";

/**
 * Account-level role surfaced from the DB. `null` = unauthenticated or
 * legacy session without a cast / customer row.
 */
export type AccountRole = CastUserRole | "customer";

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export interface AuthSession {
  userId: string;
  cast: Cast;
}

/**
 * Get the current authenticated cast from the Supabase session.
 * Falls back to mock cast when Supabase is not configured.
 *
 * In mock mode, reads from a cookie `nightos.mock-cast-id` so the
 * role selector can switch between personas without real auth.
 */
export async function getCurrentCast(): Promise<Cast | null> {
  if (!isSupabaseConfigured()) {
    return getMockCast();
  }

  try {
    const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { getCastByAuthUserId } = await import("./supabase-real");
      const cast = await getCastByAuthUserId(user.id);
      if (cast) return cast;
    }
    // Supabase configured but no session: fall back to mock cookie if allowed
    return getMockCast();
  } catch {
    return getMockCast();
  }
}

/**
 * Get the current cast ID for queries. Returns the authenticated
 * cast's ID, or falls back to the hardcoded mock ID.
 */
export async function getCurrentCastId(): Promise<string> {
  const cast = await getCurrentCast();
  return cast?.id ?? CURRENT_CAST_ID;
}

/**
 * For manager views: get the cast ID of the current user if they
 * have a management role (mama/oneesan), otherwise fall back to
 * CURRENT_MAMA_ID.
 */
export async function getCurrentManagerId(): Promise<string> {
  const cast = await getCurrentCast();
  if (cast && (cast.club_role === "mama" || cast.club_role === "oneesan")) {
    return cast.id;
  }
  return CURRENT_MAMA_ID;
}

/**
 * Check if the current session is authenticated (real or mock).
 */
export async function isAuthenticated(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    // Without Supabase, only mock auth can authenticate — and only if enabled.
    if (isMockAuthDisabled()) return false;
    return !!cookies().get("nightos.mock-cast-id")?.value;
  }
  try {
    const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return true;
    // Supabase configured but no session: fall back to mock cookie if allowed
    if (isMockAuthDisabled()) return false;
    return !!cookies().get("nightos.mock-cast-id")?.value;
  } catch {
    return false;
  }
}

function getMockCast(): Cast | null {
  if (isMockAuthDisabled()) return null;
  const cookieStore = cookies();
  const mockCastId = cookieStore.get("nightos.mock-cast-id")?.value;
  if (!mockCastId) return null;
  return mockCasts.find((c) => c.id === mockCastId) ?? null;
}

/**
 * Returns the customers row owned by the signed-in user (migration 008).
 * Used by /customer/* layouts to enforce role and to scope queries.
 */
export async function getCurrentCustomer(): Promise<Customer | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { getCustomerByAuthUserIdReal } = await import("./supabase-real");
    return await getCustomerByAuthUserIdReal(user.id);
  } catch {
    return null;
  }
}

/**
 * Resolve the account-level role of the signed-in user.
 *
 * Priority:
 *   1. nightos_casts row → cast.user_role
 *   2. customers row with auth_user_id → "customer"
 *   3. mock cookie (dev only, when NIGHTOS_DISABLE_MOCK_AUTH unset)
 *      treated as "cast"
 *   4. null (not signed in / no profile yet)
 */
export async function getCurrentRole(): Promise<AccountRole | null> {
  const cast = await getCurrentCast();
  if (cast) return (cast.user_role ?? "cast") as CastUserRole;

  const customer = await getCurrentCustomer();
  if (customer) return "customer";

  return null;
}

/**
 * Resolve the venue type for the current cast's store.
 * Falls back to "club" for mock sessions and unauthenticated users.
 */
export async function getCurrentVenueType(): Promise<"club" | "cabaret"> {
  const cast = await getCurrentCast();

  // Real, authenticated account: the store's venue_type is authoritative.
  // Resolve it FIRST so a real club account always shows club KPIs, even if a
  // stale demo cookie (set while trying キャバクラ) is still in the browser.
  if (cast && isSupabaseConfigured()) {
    try {
      const { getVenueTypeForCastReal } = await import("./supabase-real");
      return await getVenueTypeForCastReal(cast.id);
    } catch {
      // fall through to cookie / default
    }
  }

  // Mock / demo / role selector: honor the client-set override cookie, since
  // there is no per-store auth to resolve venue_type from.
  const override = cookies().get(VENUE_TYPE_STORAGE_KEY)?.value;
  if (override === "club" || override === "cabaret") return override;

  return "club";
}

/** Where the role is supposed to land after sign-in. */
export function homePathForRole(role: AccountRole): string {
  switch (role) {
    case "cast":
      return "/cast/home";
    case "store_owner":
    case "store_staff":
      return "/store";
    case "customer":
      return "/customer/home";
  }
}

