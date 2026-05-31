import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  mockCasts,
  mockCustomers,
  mockBottles,
  mockVisits,
  mockCastMemos,
  mockDouhans,
  mockCastGoals,
  mockStores,
  mockCoupons,
  mockCastMessages,
  mockCastRequests,
  mockFollowLogs,
  mockAiChats,
} from "@/lib/nightos/mock-data";
import {
  mockChatRooms,
  mockChatMessages,
} from "@/features/team-chat/lib/mock-chat-data";
import { isSetupRequestAuthorized } from "@/lib/nightos/admin-gate";

/**
 * POST /api/setup
 * Supabase にスキーマ＋テストデータを一括投入する。
 * 一度実行すれば OK。重複は ON CONFLICT で無視。
 *
 * 🔒 Gated by `NIGHTOS_SETUP_SECRET` env (≥16 chars). Returns 404 if
 * unset — production deployments should NOT set this unless they
 * intentionally want to seed demo data into prod.
 */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!isSetupRequestAuthorized(secret)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 400 },
    );
  }

  const supabase = createServerSupabaseClient();
  const log: string[] = [];

  try {
    // 1. Create tables via raw SQL (idempotent)
    const { error: schemaErr } = await supabase.rpc("exec_sql", {
      sql: SCHEMA_SQL,
    });
    if (schemaErr) {
      log.push(`Schema via RPC failed (expected if RPC not set up): ${schemaErr.message}`);
      log.push("Skipping schema creation — apply migrations manually via Supabase Dashboard > SQL Editor");
    } else {
      log.push("Schema applied successfully");
    }

    // 2. Seed stores
    const { error: storeErr } = await supabase
      .from("nightos_stores")
      .upsert(
        mockStores.map((s) => ({ id: s.id, name: s.name })),
        { onConflict: "id" },
      );
    log.push(storeErr ? `Stores: ${storeErr.message}` : `Stores: ${mockStores.length} upserted`);

    // 3. Seed casts
    const castRows = mockCasts
      .filter((c) => c.store_id === "store1")
      .map((c) => ({
        id: c.id,
        store_id: c.store_id,
        name: c.name,
        nomination_count: c.nomination_count,
        monthly_sales: c.monthly_sales,
        repeat_rate: c.repeat_rate,
        club_role: c.club_role ?? null,
        assigned_oneesan_id: c.assigned_oneesan_id ?? null,
      }));
    // Insert without assigned_oneesan_id first (to avoid FK issues)
    const castsNoRef = castRows.map((c) => ({ ...c, assigned_oneesan_id: null }));
    const { error: castErr } = await supabase
      .from("nightos_casts")
      .upsert(castsNoRef, { onConflict: "id" });
    log.push(castErr ? `Casts (base): ${castErr.message}` : `Casts: ${castRows.length} upserted`);

    // Update assigned_oneesan_id
    for (const c of castRows.filter((c) => c.assigned_oneesan_id)) {
      await supabase
        .from("nightos_casts")
        .update({ assigned_oneesan_id: c.assigned_oneesan_id })
        .eq("id", c.id);
    }
    log.push("Cast hierarchy updated");

    // 4. Seed customers (without referral links first)
    const custRows = mockCustomers
      .filter((c) => c.store_id === "store1")
      .map((c) => ({
        id: c.id,
        store_id: c.store_id,
        cast_id: c.cast_id,
        name: c.name,
        birthday: c.birthday,
        job: c.job,
        favorite_drink: c.favorite_drink,
        category: c.category,
        store_memo: c.store_memo,
        funnel_stage: c.funnel_stage ?? "store_only",
        line_exchanged_cast_id: c.line_exchanged_cast_id ?? null,
        line_exchanged_at: c.line_exchanged_at ?? null,
        manager_cast_id: c.manager_cast_id ?? null,
        region: c.region ?? null,
      }));
    const { error: custErr } = await supabase
      .from("customers")
      .upsert(custRows, { onConflict: "id" });
    log.push(custErr ? `Customers: ${custErr.message}` : `Customers: ${custRows.length} upserted`);

    // 5. Seed bottles
    const bottleRows = mockBottles
      .filter((b) => b.store_id === "store1")
      .map((b) => ({
        id: b.id,
        store_id: b.store_id,
        customer_id: b.customer_id,
        brand: b.brand,
        total_glasses: b.total_glasses,
        remaining_glasses: b.remaining_glasses,
        kept_at: b.kept_at,
      }));
    const { error: bottleErr } = await supabase
      .from("bottles")
      .upsert(bottleRows, { onConflict: "id" });
    log.push(bottleErr ? `Bottles: ${bottleErr.message}` : `Bottles: ${bottleRows.length} upserted`);

    // 6. Seed cast memos
    const memoRows = mockCastMemos.map((m) => ({
      id: m.id,
      customer_id: m.customer_id,
      cast_id: m.cast_id,
      last_topic: m.last_topic,
      service_tips: m.service_tips,
      next_topics: m.next_topics,
      visit_notes: m.visit_notes,
      updated_at: m.updated_at,
    }));
    const { error: memoErr } = await supabase
      .from("cast_memos")
      .upsert(memoRows, { onConflict: "id" });
    log.push(memoErr ? `Memos: ${memoErr.message}` : `Memos: ${memoRows.length} upserted`);

    // 7. Seed visits (batch in chunks to avoid payload limits)
    const visitRows = mockVisits
      .filter((v) => v.store_id === "store1")
      .map((v) => ({
        id: v.id,
        store_id: v.store_id,
        customer_id: v.customer_id,
        cast_id: v.cast_id,
        table_name: v.table_name,
        is_nominated: v.is_nominated,
        sales_amount: v.sales_amount,
        visited_at: v.visited_at,
      }));
    let visitOk = 0;
    let visitFail = 0;
    for (let i = 0; i < visitRows.length; i += 100) {
      const chunk = visitRows.slice(i, i + 100);
      const { error: vErr } = await supabase
        .from("visits")
        .upsert(chunk, { onConflict: "id" });
      if (vErr) visitFail += chunk.length;
      else visitOk += chunk.length;
    }
    log.push(`Visits: ${visitOk} upserted, ${visitFail} failed`);

    // 8. Seed douhans
    const douhanRows = mockDouhans.map((d) => ({
      id: d.id,
      cast_id: d.cast_id,
      customer_id: d.customer_id,
      store_id: d.store_id,
      date: d.date,
      status: d.status,
      note: d.note ?? null,
      cancellation_reason: d.cancellation_reason ?? null,
      cancelled_at: d.cancelled_at ?? null,
    }));
    const { error: douhanErr } = await supabase
      .from("douhans")
      .upsert(douhanRows, { onConflict: "id" });
    log.push(douhanErr ? `Douhans: ${douhanErr.message}` : `Douhans: ${douhanRows.length} upserted`);

    // 9. Seed cast goals
    const goalRows = mockCastGoals.map((g) => ({
      cast_id: g.castId,
      sales_goal: g.salesGoal,
      douhan_goal: g.douhanGoal,
      note: g.note,
      set_by: g.setBy,
      updated_at: g.updatedAt,
    }));
    const { error: goalErr } = await supabase
      .from("cast_goals")
      .upsert(goalRows, { onConflict: "cast_id" });
    log.push(goalErr ? `Goals: ${goalErr.message}` : `Goals: ${goalRows.length} upserted`);

    // 10. Seed follow_logs
    const followLogRows = mockFollowLogs.map((fl) => ({
      id: fl.id,
      customer_id: fl.customer_id,
      cast_id: fl.cast_id,
      template_type: fl.template_type,
      sent_at: fl.sent_at,
    }));
    const { error: flErr } = await supabase
      .from("follow_logs")
      .upsert(followLogRows, { onConflict: "id" });
    log.push(flErr ? `Follow logs: ${flErr.message}` : `Follow logs: ${followLogRows.length} upserted`);

    // 11. Seed ai_chats
    const aiChatRows = mockAiChats.map((ac) => ({
      id: ac.id,
      cast_id: ac.cast_id,
      customer_id: ac.customer_id,
      messages: JSON.stringify(ac.messages),
      feedback: ac.feedback,
      created_at: ac.created_at,
    }));
    const { error: acErr } = await supabase
      .from("ai_chats")
      .upsert(aiChatRows, { onConflict: "id" });
    log.push(acErr ? `AI chats: ${acErr.message}` : `AI chats: ${aiChatRows.length} upserted`);

    // 12. Seed cast_messages
    const castMsgRows = mockCastMessages.map((cm) => ({
      id: cm.id,
      cast_id: cm.cast_id,
      message: cm.message,
      sent_at: cm.sent_at,
      read: cm.read,
    }));
    const { error: cmErr } = await supabase
      .from("cast_messages")
      .upsert(castMsgRows, { onConflict: "id" });
    log.push(cmErr ? `Cast messages: ${cmErr.message}` : `Cast messages: ${castMsgRows.length} upserted`);

    // 13. Seed cast_requests
    const castReqRows = mockCastRequests.map((cr) => ({
      id: cr.id,
      cast_id: cr.cast_id,
      cast_name: cr.cast_name,
      message: cr.message,
      sent_at: cr.sent_at,
      resolved: cr.resolved,
    }));
    const { error: crErr } = await supabase
      .from("cast_requests")
      .upsert(castReqRows, { onConflict: "id" });
    log.push(crErr ? `Cast requests: ${crErr.message}` : `Cast requests: ${castReqRows.length} upserted`);

    // 14. Seed coupons
    const couponRows = mockCoupons.map((c) => ({
      id: c.id,
      customer_id: c.customer_id,
      store_id: c.store_id,
      store_name: c.store_name,
      type: c.type,
      title: c.title,
      description: c.description,
      valid_from: c.valid_from,
      valid_until: c.valid_until,
      used_at: c.used_at,
      code: c.code,
    }));
    const { error: cpErr } = await supabase
      .from("coupons")
      .upsert(couponRows, { onConflict: "id" });
    log.push(cpErr ? `Coupons: ${cpErr.message}` : `Coupons: ${couponRows.length} upserted`);

    // 15. Seed team chat rooms / members / messages
    const teamRoomRows = mockChatRooms.map((r) => ({
      id: r.id,
      store_id: r.store_id,
      type: r.type,
      name: r.name,
      visible_to_seniors: r.visible_to_seniors,
      created_at: r.created_at,
    }));
    const { error: tcRoomErr } = await supabase
      .from("team_chat_rooms")
      .upsert(teamRoomRows, { onConflict: "id" });
    log.push(
      tcRoomErr
        ? `Team chat rooms: ${tcRoomErr.message}`
        : `Team chat rooms: ${teamRoomRows.length} upserted`,
    );

    const teamMemberRows = mockChatRooms.flatMap((r) =>
      r.member_ids.map((castId) => ({ room_id: r.id, cast_id: castId })),
    );
    const { error: tcMemErr } = await supabase
      .from("team_chat_room_members")
      .upsert(teamMemberRows, { onConflict: "room_id,cast_id" });
    log.push(
      tcMemErr
        ? `Team chat members: ${tcMemErr.message}`
        : `Team chat members: ${teamMemberRows.length} upserted`,
    );

    const teamMsgRows = mockChatMessages.map((m) => ({
      id: m.id,
      room_id: m.room_id,
      sender_id: m.sender_id,
      sender_name: m.sender_name,
      sender_role: m.sender_role ?? null,
      content: m.content,
      thread_parent_id: m.thread_parent_id,
      mentions_ai: m.mentions_ai,
      is_bot: m.is_bot,
      created_at: m.created_at,
    }));
    // Parents first so thread_parent_id FK resolves
    const parents = teamMsgRows.filter((m) => !m.thread_parent_id);
    const replies = teamMsgRows.filter((m) => m.thread_parent_id);
    const { error: tcParentErr } = await supabase
      .from("team_chat_messages")
      .upsert(parents, { onConflict: "id" });
    const { error: tcReplyErr } = await supabase
      .from("team_chat_messages")
      .upsert(replies, { onConflict: "id" });
    const tcMsgErr = tcParentErr ?? tcReplyErr;
    log.push(
      tcMsgErr
        ? `Team chat messages: ${tcMsgErr.message}`
        : `Team chat messages: ${teamMsgRows.length} upserted`,
    );

    return NextResponse.json({
      success: true,
      log,
      summary: {
        stores: mockStores.length,
        casts: castRows.length,
        customers: custRows.length,
        bottles: bottleRows.length,
        memos: memoRows.length,
        visits: visitRows.length,
        douhans: douhanRows.length,
        goals: goalRows.length,
        follow_logs: followLogRows.length,
        ai_chats: aiChatRows.length,
        cast_messages: castMsgRows.length,
        cast_requests: castReqRows.length,
        coupons: couponRows.length,
        team_chat_rooms: teamRoomRows.length,
        team_chat_members: teamMemberRows.length,
        team_chat_messages: teamMsgRows.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, log },
      { status: 500 },
    );
  }
}

// Schema SQL — matches 002 + 003 migrations
const SCHEMA_SQL = `
-- Parent tables
CREATE TABLE IF NOT EXISTS nightos_stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nightos_casts (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES nightos_stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nomination_count INT DEFAULT 0,
  monthly_sales BIGINT DEFAULT 0,
  repeat_rate NUMERIC(4,3) DEFAULT 0,
  club_role TEXT CHECK (club_role IN ('mama', 'oneesan', 'help')),
  assigned_oneesan_id TEXT REFERENCES nightos_casts(id) ON DELETE SET NULL,
  auth_user_id UUID UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES nightos_stores(id) ON DELETE CASCADE,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  birthday TEXT,
  job TEXT,
  favorite_drink TEXT,
  category TEXT DEFAULT 'regular' CHECK (category IN ('vip', 'regular', 'new')),
  store_memo TEXT,
  referred_by_customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  funnel_stage TEXT DEFAULT 'store_only' CHECK (funnel_stage IN ('store_only', 'assigned', 'line_exchanged')),
  line_exchanged_cast_id TEXT REFERENCES nightos_casts(id) ON DELETE SET NULL,
  line_exchanged_at TIMESTAMPTZ,
  manager_cast_id TEXT REFERENCES nightos_casts(id) ON DELETE SET NULL,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE customers ADD COLUMN IF NOT EXISTS region TEXT;

CREATE TABLE IF NOT EXISTS cast_memos (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE CASCADE,
  last_topic TEXT,
  service_tips TEXT,
  next_topics TEXT,
  visit_notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, cast_id)
);

CREATE TABLE IF NOT EXISTS bottles (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES nightos_stores(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  total_glasses INT DEFAULT 20,
  remaining_glasses INT DEFAULT 20,
  kept_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES nightos_stores(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE SET NULL,
  table_name TEXT,
  is_nominated BOOLEAN DEFAULT FALSE,
  visited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follow_logs (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE CASCADE,
  template_type TEXT CHECK (template_type IN ('thanks', 'invite', 'birthday', 'seasonal')),
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_chats (
  id TEXT PRIMARY KEY,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  messages JSONB DEFAULT '[]'::JSONB,
  feedback TEXT CHECK (feedback IN ('helpful', 'not_helpful') OR feedback IS NULL),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS line_screenshots (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE CASCADE,
  image_data TEXT NOT NULL,
  media_type TEXT NOT NULL,
  extracted JSONB,
  applied_fields TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS douhans (
  id TEXT PRIMARY KEY,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  store_id TEXT REFERENCES nightos_stores(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  note TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cast_goals (
  cast_id TEXT PRIMARY KEY REFERENCES nightos_casts(id) ON DELETE CASCADE,
  sales_goal BIGINT DEFAULT 1000000,
  douhan_goal INT DEFAULT 3,
  note TEXT,
  set_by TEXT REFERENCES nightos_casts(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cast_messages (
  id TEXT PRIMARY KEY,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS cast_requests (
  id TEXT PRIMARY KEY,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE CASCADE,
  cast_name TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  store_id TEXT REFERENCES nightos_stores(id) ON DELETE CASCADE,
  store_name TEXT,
  type TEXT CHECK (type IN ('drink', 'discount', 'birthday', 'vip')),
  title TEXT NOT NULL,
  description TEXT,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  code TEXT
);

CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  page TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Team chat (Phase 2) ───
CREATE TABLE IF NOT EXISTS team_chat_rooms (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES nightos_stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('channel', 'dm', 'coaching')),
  name TEXT,
  visible_to_seniors BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_chat_room_members (
  room_id TEXT REFERENCES team_chat_rooms(id) ON DELETE CASCADE,
  cast_id TEXT REFERENCES nightos_casts(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (room_id, cast_id)
);

CREATE TABLE IF NOT EXISTS team_chat_messages (
  id TEXT PRIMARY KEY,
  room_id TEXT REFERENCES team_chat_rooms(id) ON DELETE CASCADE,
  sender_id TEXT,
  sender_name TEXT NOT NULL,
  sender_role TEXT,
  content TEXT NOT NULL,
  thread_parent_id TEXT REFERENCES team_chat_messages(id) ON DELETE CASCADE,
  mentions_ai BOOLEAN DEFAULT FALSE,
  is_bot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);
`;
