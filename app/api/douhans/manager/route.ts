import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveAuthedCast } from "@/lib/nightos/api-auth";
import type { Douhan } from "@/types/nightos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cross-cast douhan reads for managers (mama / oneesan).
 *
 *   GET ?view=cancellation-counts
 *       → { counts: { [castId]: number } } — this month's cancellations
 *         per cast across the manager's store
 *   GET ?view=cancelled&castId=<id>
 *       → { douhans: Douhan[] } — a cast's cancelled douhans, newest first
 *
 * Row visibility is enforced by the douhans RLS policy ("own store"), so a
 * manager only ever sees their own store. Mock / unauthenticated callers
 * get `{ authenticated: false }` and fall back to localStorage client-side.
 */
export async function GET(req: Request) {
  const cast = await resolveAuthedCast();
  if (!cast) {
    return NextResponse.json({ authenticated: false });
  }

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view");
  const supabase = createServerSupabaseClient();

  if (view === "cancellation-counts") {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    const { data, error } = await supabase
      .from("douhans")
      .select("cast_id")
      .eq("store_id", cast.store_id)
      .eq("status", "cancelled")
      .gte("date", monthStart)
      .lte("date", monthEnd);
    if (error) {
      return NextResponse.json(
        { error: "read_failed", detail: error.message },
        { status: 500 },
      );
    }

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.cast_id] = (counts[row.cast_id] ?? 0) + 1;
    }
    return NextResponse.json({ authenticated: true, counts });
  }

  if (view === "cancelled") {
    const castId = searchParams.get("castId");
    if (!castId) {
      return NextResponse.json(
        { error: "missing_cast_id" },
        { status: 400 },
      );
    }
    const { data, error } = await supabase
      .from("douhans")
      .select("*")
      .eq("cast_id", castId)
      .eq("status", "cancelled")
      .order("date", { ascending: false });
    if (error) {
      return NextResponse.json(
        { error: "read_failed", detail: error.message },
        { status: 500 },
      );
    }
    return NextResponse.json({
      authenticated: true,
      douhans: (data ?? []).map(rowToDouhan),
    });
  }

  return NextResponse.json({ error: "unknown_view" }, { status: 400 });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToDouhan(row: any): Douhan {
  return {
    id: row.id,
    cast_id: row.cast_id,
    customer_id: row.customer_id,
    store_id: row.store_id,
    date: row.date,
    status: row.status,
    note: row.note ?? null,
    time: row.time ?? null,
    cancellation_reason: row.cancellation_reason ?? null,
    cancelled_at: row.cancelled_at ?? null,
    created_at: row.created_at ?? row.date,
  };
}
