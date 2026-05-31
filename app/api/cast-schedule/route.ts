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
  const [shiftsRes, plansRes] = await Promise.all([
    supabase
      .from("cast_shifts")
      .select("*")
      .eq("cast_id", cast.id)
      .order("date"),
    supabase.from("cast_plans").select("*").eq("cast_id", cast.id).order("date"),
  ]);

  if (shiftsRes.error || plansRes.error) {
    return NextResponse.json(
      {
        error: "read_failed",
        detail: shiftsRes.error?.message ?? plansRes.error?.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    authenticated: true,
    castId: cast.id,
    shifts: (shiftsRes.data ?? []).map(rowToShift),
    plans: (plansRes.data ?? []).map(rowToPlan),
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
