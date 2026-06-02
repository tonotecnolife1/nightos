import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveAuthedCast } from "@/lib/nightos/api-auth";
import {
  castChatSessionDeleteSchema,
  castChatSessionsSyncSchema,
  parseBody,
} from "@/lib/nightos/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * さくらママ 相談履歴のクロスデバイス同期 (migration 020)。
 *
 *   GET    → { authenticated, castId, sessions } 本人の全相談セッション
 *   PUT    → { sessions } を id 単位で upsert（他は消さない＝履歴を失わない）
 *   DELETE → { id } を 1 件削除
 *
 * Mock / 未認証セッションは `{ authenticated: false }` を返し、クライアントは
 * localStorage のみで動き続ける（ローカル開発 / デモはオフラインのまま）。
 */

export async function GET() {
  const cast = await resolveAuthedCast();
  if (!cast) {
    return NextResponse.json({ authenticated: false });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("cast_chat_sessions")
    .select("*")
    .eq("cast_id", cast.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "read_failed", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    authenticated: true,
    castId: cast.id,
    sessions: (data ?? []).map(rowToSession),
  });
}

export async function PUT(req: Request) {
  const parsed = await parseBody(req, castChatSessionsSyncSchema);
  if (parsed instanceof NextResponse) return parsed;

  const cast = await resolveAuthedCast();
  if (!cast) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  if (parsed.sessions.length === 0) {
    return NextResponse.json({ authenticated: true, ok: true });
  }

  const supabase = createServerSupabaseClient();
  // cast_id は常にサーバー側で確定させる（クライアントの値は信用しない / RLS と整合）。
  const rows = parsed.sessions.map((s) => ({
    id: s.id,
    cast_id: cast.id,
    customer_id: s.customerId ?? null,
    customer_name: s.customerName ?? null,
    title: s.title,
    messages: s.messages,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  }));

  const { error } = await supabase
    .from("cast_chat_sessions")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    return NextResponse.json(
      { error: "write_failed", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ authenticated: true, ok: true });
}

export async function DELETE(req: Request) {
  const parsed = await parseBody(req, castChatSessionDeleteSchema);
  if (parsed instanceof NextResponse) return parsed;

  const cast = await resolveAuthedCast();
  if (!cast) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  // RLS が own cast を保証するが、cast_id でも明示的に絞って多重防御。
  const { error } = await supabase
    .from("cast_chat_sessions")
    .delete()
    .eq("id", parsed.id)
    .eq("cast_id", cast.id);

  if (error) {
    return NextResponse.json(
      { error: "write_failed", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ authenticated: true, ok: true });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToSession(row: any) {
  return {
    id: row.id as string,
    customerId: (row.customer_id ?? null) as string | null,
    customerName: (row.customer_name ?? null) as string | null,
    title: (row.title ?? "相談") as string,
    messages: Array.isArray(row.messages) ? row.messages : [],
    createdAt: (row.created_at ?? row.updated_at) as string,
    updatedAt: (row.updated_at ?? row.created_at) as string,
  };
}
