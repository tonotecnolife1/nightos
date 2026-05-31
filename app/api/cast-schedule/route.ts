import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCastByAuthUserId } from "@/lib/nightos/supabase-real";
import { castScheduleSyncSchema, parseBody } from "@/lib/nightos/validation";
import type { Cast } from "@/types/nightos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cross-device sync for a cast's own scheduling data (migration 013).
 *
 *   GET  → { authenticated, shifts, plans } for the signed-in cast
 *   PUT  → replace the signed-in cast's shifts / plans (whichever arrays
 *          are present in the body) and echo the stored data back
 *
 * Mock / unauthenticated sessions get `{ authenticated: false }` so the
 * client keeps using localStorage only (demo & local dev stay offline).
 */

/** Resolve the real Supabase-authenticated cast, or null in mock mode. */
async function resolveAuthedCast(): Promise<Cast | null> {
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

export async function GET() {
  const cast = await resolveAuthedCast();
  if (!cast) {
    return NextResponse.json({ authenticated: false });
  }

  const supabase = createServerSupabaseClient();
  const [shiftsRes, plansRes, douhansRes] = await Promise.all([
    supabase
      .from("cast_shifts")
      .select("*")
      .eq("cast_id", cast.id)
      .order("date"),
    supabase.from("cast_plans").select("*").eq("cast_id", cast.id).order("date"),
    supabase.from("douhans").select("*").eq("cast_id", cast.id).order("date"),
  ]);

  if (shiftsRes.error || plansRes.error || douhansRes.error) {
    return NextResponse.json(
      {
        error: "read_failed",
        detail:
          shiftsRes.error?.message ??
          plansRes.error?.message ??
          douhansRes.error?.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    authenticated: true,
    castId: cast.id,
    shifts: (shiftsRes.data ?? []).map(rowToShift),
    plans: (plansRes.data ?? []).map(rowToPlan),
    douhans: (douhansRes.data ?? []).map(rowToDouhan),
  });
}

export async function PUT(req: Request) {
  const parsed = await parseBody(req, castScheduleSyncSchema);
  if (parsed instanceof NextResponse) return parsed;

  const cast = await resolveAuthedCast();
  if (!cast) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const now = new Date().toISOString();

  // Shifts: full replace for this cast.
  if (parsed.shifts) {
    const { error: delErr } = await supabase
      .from("cast_shifts")
      .delete()
      .eq("cast_id", cast.id);
    if (delErr) return writeError(delErr.message);

    if (parsed.shifts.length > 0) {
      const rows = parsed.shifts.map((s) => ({
        cast_id: cast.id,
        date: s.date,
        status: s.status,
        start_time: s.startTime ?? null,
        end_time: s.endTime ?? null,
        note: s.note ?? null,
        updated_at: now,
      }));
      const { error: insErr } = await supabase.from("cast_shifts").insert(rows);
      if (insErr) return writeError(insErr.message);
    }
  }

  // Plans: full replace for this cast.
  if (parsed.plans) {
    const { error: delErr } = await supabase
      .from("cast_plans")
      .delete()
      .eq("cast_id", cast.id);
    if (delErr) return writeError(delErr.message);

    if (parsed.plans.length > 0) {
      const rows = parsed.plans.map((p) => ({
        id: p.id,
        cast_id: cast.id,
        date: p.date,
        time: p.time ?? null,
        title: p.title,
        note: p.note ?? null,
        updated_at: now,
      }));
      const { error: insErr } = await supabase.from("cast_plans").insert(rows);
      if (insErr) return writeError(insErr.message);
    }
  }

  // Douhans: full replace for this cast. Only the signed-in cast's own
  // douhans are touched — entries carrying another cast_id are ignored so
  // a stale mixed cache can't write into someone else's data.
  if (parsed.douhans) {
    const mine = parsed.douhans.filter((d) => d.cast_id === cast.id);
    const { error: delErr } = await supabase
      .from("douhans")
      .delete()
      .eq("cast_id", cast.id);
    if (delErr) return writeError(delErr.message);

    if (mine.length > 0) {
      const rows = mine.map((d) => ({
        id: d.id,
        cast_id: cast.id,
        customer_id: d.customer_id,
        // Force the cast's real store — the client caches a mock
        // CURRENT_STORE_ID, but RLS requires store_id = the cast's store.
        store_id: cast.store_id,
        date: d.date,
        status: d.status,
        note: d.note ?? null,
        time: d.time ?? null,
        cancellation_reason: d.cancellation_reason ?? null,
        cancelled_at: d.cancelled_at ?? null,
        created_at: d.created_at ?? now,
      }));
      const { error: insErr } = await supabase.from("douhans").insert(rows);
      if (insErr) return writeError(insErr.message);
    }
  }

  return NextResponse.json({ authenticated: true, ok: true });
}

function writeError(detail?: string) {
  return NextResponse.json({ error: "write_failed", detail }, { status: 500 });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToShift(row: any) {
  return {
    date: row.date as string,
    status: row.status as "working" | "off",
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    note: row.note ?? undefined,
  };
}

function rowToPlan(row: any) {
  return {
    id: row.id as string,
    castId: row.cast_id as string,
    date: row.date as string,
    time: row.time ?? undefined,
    title: row.title as string,
    note: row.note ?? undefined,
  };
}

function rowToDouhan(row: any) {
  return {
    id: row.id as string,
    cast_id: row.cast_id as string,
    customer_id: row.customer_id as string,
    store_id: row.store_id as string,
    date: row.date as string,
    status: row.status as "scheduled" | "completed" | "cancelled",
    note: row.note ?? null,
    time: row.time ?? null,
    cancellation_reason: row.cancellation_reason ?? null,
    cancelled_at: row.cancelled_at ?? null,
    created_at: row.created_at ?? row.date,
  };
}
