/**
 * Real Supabase implementations for the NIGHTOS query layer.
 *
 * Each function does ONE Supabase round trip (or a few when joining
 * tables) and maps the result to the same domain types the mock
 * implementations return. The public API in `supabase-queries.ts`
 * calls these when `NEXT_PUBLIC_SUPABASE_URL` is set, with a try/
 * catch fallback to the mock impl on any error so misconfiguration
 * never crashes the app.
 *
 * Schema: see supabase/migrations/002_nightos_schema.sql. IDs are
 * TEXT (e.g. "cast1", "cust1") so the same ids work in mock and DB
 * mode.
 *
 * NOT YET TESTED against a live Supabase project — I (Claude) don't
 * have credentials in the sandbox. Apply the migration + seed and
 * point NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY at
 * the project to verify.
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  Bottle,
  Cast,
  CastHomeData,
  CastMemo,
  Coupon,
  CouponType,
  Customer,
  CustomerBottleView,
  CustomerCategory,
  CustomerContext,
  CustomerStoreOverview,
  Douhan,
  DouhanSummary,
  FollowLog,
  LineScreenshot,
  MemoExtractionResult,
  Visit,
} from "@/types/nightos";
import type { StoreToCastMessage, CastToStoreRequest } from "./mock-data";
import type { TrendPoint, RepeatPoint } from "./store-mock-data";
import type { StoreDashboardData, CastStatsData } from "./supabase-queries";
import { selectFollowTargets } from "@/features/cast-home/data/follow-selector";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ═══════════════ Read ═══════════════

export async function getCastByIdReal(castId: string): Promise<Cast | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("nightos_casts")
    .select("*")
    .eq("id", castId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToCast(data);
}

export async function getAllCastsReal(): Promise<Cast[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("nightos_casts")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []).map(rowToCast);
}

export async function getCustomersForCastReal(
  castId: string,
): Promise<Customer[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("cast_id", castId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToCustomer);
}

export async function getCustomersForOnesanReal(
  castId: string,
): Promise<Customer[]> {
  const supabase = createServerSupabaseClient();
  const { data: helps } = await supabase
    .from("nightos_casts")
    .select("id")
    .eq("assigned_oneesan_id", castId)
    .eq("is_active", true);
  const allIds = [castId, ...(helps ?? []).map((h) => h.id)];
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .in("cast_id", allIds)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToCustomer);
}

export async function getHelpCastNamesForOnesanReal(
  castId: string,
): Promise<Record<string, string>> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("nightos_casts")
    .select("id, name")
    .eq("assigned_oneesan_id", castId)
    .eq("is_active", true);
  return Object.fromEntries((data ?? []).map((r) => [r.id, r.name]));
}

export async function getAllCustomersReal(): Promise<Customer[]> {
  const supabase = createServerSupabaseClient();
  // Sort by latest visit so the registration form shows recent customers first
  const { data: customers, error: cErr } = await supabase
    .from("customers")
    .select("*");
  if (cErr) throw cErr;
  if (!customers) return [];

  const { data: visits, error: vErr } = await supabase
    .from("visits")
    .select("customer_id, visited_at")
    .order("visited_at", { ascending: false });
  if (vErr) throw vErr;

  const latestVisit = new Map<string, number>();
  for (const v of visits ?? []) {
    const t = new Date(v.visited_at).getTime();
    if (!latestVisit.has(v.customer_id) || latestVisit.get(v.customer_id)! < t) {
      latestVisit.set(v.customer_id, t);
    }
  }
  return customers.map(rowToCustomer).sort((a, b) => {
    const av = latestVisit.get(a.id) ?? 0;
    const bv = latestVisit.get(b.id) ?? 0;
    return bv - av;
  });
}

export async function getCustomerContextReal(
  castId: string,
  customerId: string,
): Promise<CustomerContext | null> {
  const supabase = createServerSupabaseClient();
  const { data: customer, error: cErr } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .maybeSingle();
  if (cErr) throw cErr;
  if (!customer) return null;

  // Same-store check: a cast can read any customer in their store, but
  // not customers from another tenant.
  const { data: castRow } = await supabase
    .from("nightos_casts")
    .select("store_id")
    .eq("id", castId)
    .maybeSingle();
  if (castRow && castRow.store_id && customer.store_id !== castRow.store_id) {
    return null;
  }

  const [{ data: memo }, { data: bottles }, { data: visits }] = await Promise.all([
    supabase
      .from("cast_memos")
      .select("*")
      .eq("customer_id", customerId)
      .eq("cast_id", castId)
      .maybeSingle(),
    supabase.from("bottles").select("*").eq("customer_id", customerId),
    supabase
      .from("visits")
      .select("*")
      .eq("customer_id", customerId)
      .order("visited_at", { ascending: false }),
  ]);

  return {
    customer: rowToCustomer(customer),
    memo: memo ? rowToCastMemo(memo) : null,
    bottles: (bottles ?? []).map(rowToBottle),
    visits: (visits ?? []).map(rowToVisit),
  };
}

export async function getCastHomeDataReal(
  castId: string,
  today: Date,
): Promise<CastHomeData> {
  const supabase = createServerSupabaseClient();
  const cast = await getCastByIdReal(castId);
  if (!cast) throw new Error(`Cast not found: ${castId}`);

  const [
    { data: customers },
    { data: visits },
    { data: bottles },
    { data: memos },
  ] = await Promise.all([
    supabase.from("customers").select("*").eq("cast_id", castId),
    supabase.from("visits").select("*").eq("cast_id", castId),
    supabase.from("bottles").select("*"),
    supabase.from("cast_memos").select("*").eq("cast_id", castId),
  ]);

  const myCustomers = (customers ?? []).map(rowToCustomer);
  const myVisits = (visits ?? []).map(rowToVisit);
  const customerIds = new Set(myCustomers.map((c) => c.id));
  const myBottles = (bottles ?? [])
    .map(rowToBottle)
    .filter((b) => customerIds.has(b.customer_id));
  const myMemos = (memos ?? []).map(rowToCastMemo);

  const targets = selectFollowTargets({
    customers: myCustomers,
    visits: myVisits,
    bottles: myBottles,
    memos: myMemos,
    today,
  });

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const newCustomerCount = myCustomers.filter(
    (c) => new Date(c.created_at) >= monthStart,
  ).length;

  return {
    cast,
    summary: {
      nominationCount: cast.nomination_count,
      repeatRate: cast.repeat_rate,
      followTargetCount: targets.length,
      monthlySales: cast.monthly_sales,
      newCustomerCount,
    },
    targets,
  };
}

export async function getRecentVisitsForCastReal(
  castId: string,
  sinceIso: string,
): Promise<Visit[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("visits")
    .select("*")
    .eq("cast_id", castId)
    .gt("visited_at", sinceIso)
    .order("visited_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToVisit);
}

export async function getScreenshotsForCustomerReal(
  castId: string,
  customerId: string,
  allForCustomer = false,
): Promise<LineScreenshot[]> {
  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("line_screenshots")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (!allForCustomer) {
    query = query.eq("cast_id", castId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(rowToScreenshot);
}

// ═══════════════ Write ═══════════════

export async function updateCastClubRoleReal(
  castId: string,
  clubRole: "mama" | "oneesan" | "help",
  assignedOnesanId: string | null,
): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("nightos_casts")
    .update({ club_role: clubRole, assigned_oneesan_id: assignedOnesanId })
    .eq("id", castId);
  if (error) throw error;
}

export async function updateCastMemoReal(args: {
  castId: string;
  customerId: string;
  input: {
    last_topic: string | null;
    service_tips: string | null;
    next_topics: string | null;
  };
}): Promise<CastMemo> {
  const supabase = createServerSupabaseClient();
  const id = `memo_${args.castId}_${args.customerId}`;
  const { data, error } = await supabase
    .from("cast_memos")
    .upsert({
      id,
      customer_id: args.customerId,
      cast_id: args.castId,
      last_topic: args.input.last_topic,
      service_tips: args.input.service_tips,
      next_topics: args.input.next_topics,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return rowToCastMemo(data);
}

export async function recordFollowLogReal(args: {
  castId: string;
  customerId: string;
  templateType: FollowLog["template_type"];
}): Promise<FollowLog> {
  const supabase = createServerSupabaseClient();
  const id = `follow_${Date.now()}`;
  const { data, error } = await supabase
    .from("follow_logs")
    .insert({
      id,
      customer_id: args.customerId,
      cast_id: args.castId,
      template_type: args.templateType,
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return rowToFollowLog(data);
}

export async function createCustomerReal(input: {
  storeId: string;
  name: string;
  name_kana?: string | null;
  nickname?: string | null;
  birthday: string | null;
  job: string | null;
  favorite_drink: string | null;
  category: CustomerCategory;
  store_memo: string | null;
  cast_id: string;
  referred_by_customer_id?: string | null;
  funnel_stage?: "store_only" | "assigned" | "line_exchanged";
  line_exchanged_at?: string | null;
  manager_cast_id?: string | null;
  region?: string | null;
}): Promise<Customer> {
  const supabase = createServerSupabaseClient();
  const id = `cust_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const stage = input.funnel_stage ?? "store_only";
  const { data, error } = await supabase
    .from("customers")
    .insert({
      id,
      store_id: input.storeId,
      cast_id: input.cast_id,
      name: input.name,
      name_kana: input.name_kana ?? null,
      nickname: input.nickname ?? null,
      birthday: input.birthday,
      job: input.job,
      favorite_drink: input.favorite_drink,
      category: input.category,
      store_memo: input.store_memo,
      referred_by_customer_id: input.referred_by_customer_id ?? null,
      funnel_stage: stage,
      line_exchanged_cast_id:
        stage === "line_exchanged" ? input.cast_id : null,
      line_exchanged_at:
        stage === "line_exchanged"
          ? input.line_exchanged_at ?? new Date().toISOString()
          : null,
      manager_cast_id: input.manager_cast_id ?? null,
      region: input.region ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToCustomer(data);
}

export async function createVisitReal(input: {
  storeId: string;
  customer_id: string;
  cast_id: string;
  table_name: string | null;
  is_nominated: boolean;
}): Promise<Visit> {
  const supabase = createServerSupabaseClient();
  const id = `visit_${Date.now()}`;
  const { data, error } = await supabase
    .from("visits")
    .insert({
      id,
      store_id: input.storeId,
      customer_id: input.customer_id,
      cast_id: input.cast_id,
      table_name: input.table_name,
      is_nominated: input.is_nominated,
      visited_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return rowToVisit(data);
}

export async function createBottleReal(input: {
  storeId: string;
  customer_id: string;
  brand: string;
  total_glasses: number;
}): Promise<Bottle> {
  const supabase = createServerSupabaseClient();
  const id = `btl_${Date.now()}`;
  const { data, error } = await supabase
    .from("bottles")
    .insert({
      id,
      store_id: input.storeId,
      customer_id: input.customer_id,
      brand: input.brand,
      total_glasses: input.total_glasses,
      remaining_glasses: input.total_glasses,
      kept_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return rowToBottle(data);
}

export async function saveScreenshotReal(input: {
  customerId: string;
  castId: string;
  imageData: string;
  mediaType: string;
  extracted: MemoExtractionResult;
  appliedFields: LineScreenshot["applied_fields"];
}): Promise<LineScreenshot> {
  const supabase = createServerSupabaseClient();
  const id = `shot_${Date.now()}`;
  const { data, error } = await supabase
    .from("line_screenshots")
    .insert({
      id,
      customer_id: input.customerId,
      cast_id: input.castId,
      image_data: input.imageData,
      media_type: input.mediaType,
      extracted: input.extracted,
      applied_fields: input.appliedFields,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToScreenshot(data);
}

export async function deleteScreenshotReal(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("line_screenshots")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ═══════════════ Subordinate / team queries ═══════════════

export async function getSubordinateCastsReal(
  leaderCastId: string,
): Promise<Cast[]> {
  const supabase = createServerSupabaseClient();
  const leader = await getCastByIdReal(leaderCastId);
  if (!leader) return [];

  if (leader.club_role === "mama") {
    const { data, error } = await supabase
      .from("nightos_casts")
      .select("*")
      .eq("store_id", leader.store_id)
      .neq("id", leader.id);
    if (error) throw error;
    return (data ?? []).map(rowToCast);
  }

  if (leader.club_role === "oneesan") {
    const { data: allCasts, error } = await supabase
      .from("nightos_casts")
      .select("*")
      .eq("store_id", leader.store_id);
    if (error) throw error;
    const casts = (allCasts ?? []).map(rowToCast);
    const result: Cast[] = [];
    const queue = [leader.id];
    const seen = new Set([leader.id]);
    while (queue.length > 0) {
      const parentId = queue.shift()!;
      for (const c of casts) {
        if (c.assigned_oneesan_id === parentId && !seen.has(c.id)) {
          seen.add(c.id);
          result.push(c);
          queue.push(c.id);
        }
      }
    }
    return result;
  }

  return [];
}

export async function getTeamCustomersReal(
  leaderCastId: string,
): Promise<Array<Customer & { cast_name: string }>> {
  const team = await getSubordinateCastsReal(leaderCastId);
  const teamIds = [leaderCastId, ...team.map((c) => c.id)];

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .in("cast_id", teamIds);
  if (error) throw error;

  const castsById = new Map(team.map((c) => [c.id, c]));
  return (data ?? []).map((row: any) => ({
    ...rowToCustomer(row),
    cast_name: castsById.get(row.cast_id)?.name ?? "不明",
  }));
}

// ═══════════════ CRUD: customers (real) ═══════════════

export async function updateCustomerReal(
  id: string,
  input: {
    name: string;
    name_kana?: string | null;
    nickname?: string | null;
    birthday: string | null;
    job: string | null;
    favorite_drink: string | null;
    category: CustomerCategory;
    store_memo: string | null;
    region: string | null;
    cast_id: string;
  },
): Promise<Customer | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .update({
      name: input.name,
      name_kana: input.name_kana ?? null,
      nickname: input.nickname ?? null,
      birthday: input.birthday,
      job: input.job,
      favorite_drink: input.favorite_drink,
      category: input.category,
      store_memo: input.store_memo,
      region: input.region,
      cast_id: input.cast_id,
    })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToCustomer(data) : null;
}

export async function transferCustomersReal(
  customerIds: string[],
  newCastId: string,
): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("customers")
    .update({ cast_id: newCastId })
    .in("id", customerIds);
  if (error) throw error;
}

export async function deleteCustomerReal(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}

export async function getCustomerByIdReal(
  id: string,
): Promise<Customer | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToCustomer(data) : null;
}

// ═══════════════ CRUD: visits (real) ═══════════════

export async function getRecentVisitsReal(
  limit: number,
): Promise<Array<Visit & { customer_name: string; cast_name: string }>> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("visits")
    .select("*, customers!inner(name), nightos_casts!inner(name)")
    .order("visited_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...rowToVisit(row),
    customer_name: row.customers?.name ?? "（不明）",
    cast_name: row.nightos_casts?.name ?? "（不明）",
  }));
}

export async function deleteVisitReal(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("visits").delete().eq("id", id);
  if (error) throw error;
}

// ═══════════════ CRUD: bottles (real) ═══════════════

export async function getAllBottlesReal(): Promise<
  Array<Bottle & { customer_name: string; cast_id: string | null }>
> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("bottles")
    .select("*, customers!inner(name, cast_id)")
    .order("remaining_glasses", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...rowToBottle(row),
    customer_name: row.customers?.name ?? "（不明）",
    cast_id: row.customers?.cast_id ?? null,
  }));
}

export async function consumeBottleReal(
  id: string,
  glasses: number,
): Promise<Bottle | null> {
  const supabase = createServerSupabaseClient();
  const { data: current } = await supabase
    .from("bottles")
    .select("remaining_glasses")
    .eq("id", id)
    .maybeSingle();
  if (!current) return null;
  const newRemaining = Math.max(0, current.remaining_glasses - glasses);
  const { data, error } = await supabase
    .from("bottles")
    .update({ remaining_glasses: newRemaining })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToBottle(data) : null;
}

export async function deleteBottleReal(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("bottles").delete().eq("id", id);
  if (error) throw error;
}

// ═══════════════ Cast goals (real) ═══════════════

import type { CastGoal } from "@/types/nightos";

export async function getCastGoalReal(castId: string): Promise<CastGoal | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("cast_goals")
    .select("*")
    .eq("cast_id", castId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    castId: data.cast_id,
    salesGoal: Number(data.sales_goal),
    douhanGoal: data.douhan_goal,
    note: data.note,
    setBy: data.set_by,
    updatedAt: data.updated_at,
  };
}

export async function setCastGoalReal(
  castId: string,
  input: { salesGoal: number; douhanGoal: number; note: string | null; setBy: string | null },
): Promise<CastGoal> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("cast_goals")
    .upsert({
      cast_id: castId,
      sales_goal: input.salesGoal,
      douhan_goal: input.douhanGoal,
      note: input.note,
      set_by: input.setBy,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return {
    castId: data.cast_id,
    salesGoal: Number(data.sales_goal),
    douhanGoal: data.douhan_goal,
    note: data.note,
    setBy: data.set_by,
    updatedAt: data.updated_at,
  };
}

// ═══════════════ Dashboard aggregations ═══════════════

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getStoreDashboardDataReal(
  storeId: string,
): Promise<StoreDashboardData> {
  const supabase = createServerSupabaseClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * DAY_MS).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS).toISOString();

  const [castsRes, custsRes, visitsRes, nomVisitsRes, followRes] =
    await Promise.all([
      supabase.from("nightos_casts").select("*").eq("store_id", storeId),
      supabase
        .from("customers")
        .select("id, cast_id")
        .eq("store_id", storeId),
      supabase
        .from("visits")
        .select("cast_id, customer_id, is_nominated, visited_at")
        .eq("store_id", storeId)
        .gte("visited_at", monthStart),
      supabase
        .from("visits")
        .select("cast_id, visited_at")
        .eq("store_id", storeId)
        .eq("is_nominated", true)
        .gte("visited_at", fourteenDaysAgo),
      supabase
        .from("follow_logs")
        .select("cast_id")
        .gte("sent_at", thirtyDaysAgo),
    ]);

  const casts = (castsRes.data ?? []).map(rowToCast);

  // Customer count per cast
  const custCount = new Map<string, number>();
  for (const r of custsRes.data ?? []) {
    custCount.set(r.cast_id, (custCount.get(r.cast_id) ?? 0) + 1);
  }

  // Visit count per cast (this month)
  const visitCount = new Map<string, number>();
  for (const v of visitsRes.data ?? []) {
    visitCount.set(v.cast_id, (visitCount.get(v.cast_id) ?? 0) + 1);
  }

  // Follow rate per cast
  const followCount = new Map<string, number>();
  for (const f of followRes.data ?? []) {
    followCount.set(f.cast_id, (followCount.get(f.cast_id) ?? 0) + 1);
  }
  const followRateOf = (castId: string) => {
    const cc = custCount.get(castId) ?? 0;
    if (cc === 0) return 0;
    return Math.min(1, (followCount.get(castId) ?? 0) / cc);
  };

  const castStats = casts.map((cast) => ({
    cast,
    followRate: followRateOf(cast.id),
    customerCount: custCount.get(cast.id) ?? 0,
    monthlyVisits: visitCount.get(cast.id) ?? 0,
  }));

  const totalNominations = casts.reduce((s, c) => s + c.nomination_count, 0);
  const totalSales = casts.reduce((s, c) => s + c.monthly_sales, 0);
  const averageRepeatRate =
    casts.length > 0
      ? casts.reduce((s, c) => s + c.repeat_rate, 0) / casts.length
      : 0;
  const rates = castStats.map((s) => s.followRate);
  const averageFollowRate =
    rates.length > 0 ? rates.reduce((s, r) => s + r, 0) / rates.length : 0;

  // Nomination trend: top 2 casts → cast1/cast2 columns
  const sorted = [...casts].sort(
    (a, b) => b.nomination_count - a.nomination_count,
  );
  const cast1Id = sorted[0]?.id ?? "";
  const cast2Id = sorted[1]?.id ?? "";

  const trendBuckets = new Map<string, { cast1: number; cast2: number }>();
  for (let d = 0; d < 14; d++) {
    const date = new Date(now.getTime() - (13 - d) * DAY_MS);
    trendBuckets.set(date.toISOString().slice(0, 10), { cast1: 0, cast2: 0 });
  }
  for (const v of nomVisitsRes.data ?? []) {
    const key = new Date(v.visited_at).toISOString().slice(0, 10);
    const bucket = trendBuckets.get(key);
    if (!bucket) continue;
    if (v.cast_id === cast1Id) bucket.cast1++;
    else if (v.cast_id === cast2Id) bucket.cast2++;
  }
  const nominationTrend: TrendPoint[] = Array.from(trendBuckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, c]) => ({ date, ...c }));

  // Repeat trend: approximate from cast repeat_rate with weekly decay
  const c1Rate = casts.find((c) => c.id === cast1Id)?.repeat_rate ?? 0;
  const c2Rate = casts.find((c) => c.id === cast2Id)?.repeat_rate ?? 0;
  const repeatTrend: RepeatPoint[] = [1, 2, 3, 4].map((w) => ({
    week: `w${w}`,
    label: `${w}週目`,
    cast1: Math.max(0, c1Rate - (4 - w) * 0.04),
    cast2: Math.max(0, c2Rate - (4 - w) * 0.04),
  }));

  return {
    totalNominations,
    totalSales,
    averageRepeatRate,
    averageFollowRate,
    nominationTrend,
    repeatTrend,
    castStats,
  };
}

export async function getCastStatsDataReal(
  castId: string,
  storeId: string,
): Promise<CastStatsData> {
  const supabase = createServerSupabaseClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [castRes, custsRes, visitsRes, goalRes, douhansRes, followRes] =
    await Promise.all([
      supabase
        .from("nightos_casts")
        .select("*")
        .eq("id", castId)
        .maybeSingle(),
      supabase
        .from("customers")
        .select("*")
        .eq("store_id", storeId),
      supabase
        .from("visits")
        .select("*")
        .eq("store_id", storeId)
        .gte("visited_at", yearStart.toISOString()),
      supabase
        .from("cast_goals")
        .select("*")
        .eq("cast_id", castId)
        .maybeSingle(),
      supabase
        .from("douhans")
        .select("*")
        .eq("cast_id", castId)
        .gte("date", yearStart.toISOString().slice(0, 10)),
      supabase
        .from("follow_logs")
        .select("cast_id, sent_at")
        .eq("cast_id", castId),
    ]);

  if (!castRes.data) throw new Error(`Cast not found: ${castId}`);
  const cast = rowToCast(castRes.data);
  const customers = (custsRes.data ?? []).map(rowToCustomer);
  const visits = (visitsRes.data ?? []).map(rowToVisit);

  // Goal
  const goal = goalRes.data
    ? {
        salesGoal: goalRes.data.sales_goal,
        douhanGoal: goalRes.data.douhan_goal,
      }
    : { salesGoal: 1_000_000, douhanGoal: 3 };

  // Follow rate (last 30 days / my customers)
  const myCustomers = customers.filter((c) => c.cast_id === castId);
  const recentFollows = (followRes.data ?? []).filter(
    (f) =>
      new Date(f.sent_at).getTime() > now.getTime() - 30 * DAY_MS,
  );
  const followRate =
    myCustomers.length > 0
      ? Math.min(1, recentFollows.length / myCustomers.length)
      : 0;
  const followStreakDays = Math.round(followRate * 7);

  // Monthly stats
  const monthNewCount = myCustomers.filter(
    (c) => new Date(c.created_at).getTime() >= monthStart.getTime(),
  ).length;
  const monthDouhans = (douhansRes.data ?? []).filter(
    (d: any) =>
      new Date(d.date).getTime() >= monthStart.getTime() &&
      new Date(d.date).getTime() <= now.getTime() &&
      d.status === "completed",
  ).length;

  // Yearly stats
  const yearNewCount = myCustomers.filter(
    (c) => new Date(c.created_at).getTime() >= yearStart.getTime(),
  ).length;
  const yearDouhans = (douhansRes.data ?? []).filter(
    (d: any) => d.status === "completed",
  ).length;

  // Repeat trend (4 weeks) — approximate from cast repeat_rate
  const repeatTrend = [1, 2, 3, 4].map((w) => ({
    week: `w${w}`,
    label: `${w}週目`,
    rate: Math.max(0, cast.repeat_rate - (4 - w) * 0.04),
  }));

  return {
    cast,
    monthly: {
      sales: cast.monthly_sales,
      repeatRate: cast.repeat_rate,
      followRate,
      newCustomerCount: monthNewCount,
      totalCustomerCount: myCustomers.length,
      douhanCount: monthDouhans,
    },
    yearly: {
      sales: cast.monthly_sales * 3,
      repeatRate: Math.max(0, cast.repeat_rate - 0.03),
      newCustomerCount: yearNewCount,
      douhanCount: yearDouhans,
    },
    targets: {
      salesGoal: goal.salesGoal,
      douhanGoal: goal.douhanGoal,
    },
    repeatTrend,
    followStreakDays,
  };
}

// ═══════════════ Auth helper ═══════════════

export async function getCastByAuthUserId(authUserId: string): Promise<Cast | null> {
  const supabase = createServerSupabaseClient();
  // Only consider active memberships (migration 009). Inactive rows
  // belong to former store memberships and should not resolve to the
  // user's current cast.
  const { data, error } = await supabase
    .from("nightos_casts")
    .select("*")
    .eq("auth_user_id", authUserId)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToCast(data) : null;
}

// ═══════════════ Row → type mappers ═══════════════

function rowToCast(row: any): Cast {
  return {
    id: row.id,
    store_id: row.store_id,
    name: row.name,
    nomination_count: row.nomination_count ?? 0,
    monthly_sales: Number(row.monthly_sales ?? 0),
    repeat_rate: Number(row.repeat_rate ?? 0),
    user_role: (row.user_role ?? "cast") as Cast["user_role"],
    is_active: row.is_active === undefined ? true : Boolean(row.is_active),
    club_role: row.club_role ?? undefined,
    assigned_oneesan_id: row.assigned_oneesan_id ?? undefined,
  };
}

function rowToCustomer(row: any): Customer {
  return {
    id: row.id,
    store_id: row.store_id,
    cast_id: row.cast_id,
    name: row.name,
    name_kana: row.name_kana ?? null,
    nickname: row.nickname ?? null,
    birthday: row.birthday,
    job: row.job,
    favorite_drink: row.favorite_drink,
    category: (row.category ?? "regular") as CustomerCategory,
    store_memo: row.store_memo,
    created_at: row.created_at,
    referred_by_customer_id: row.referred_by_customer_id ?? null,
    funnel_stage: row.funnel_stage ?? "store_only",
    line_exchanged_cast_id: row.line_exchanged_cast_id ?? null,
    line_exchanged_at: row.line_exchanged_at ?? null,
    manager_cast_id: row.manager_cast_id ?? null,
    region: row.region ?? null,
  };
}

function rowToCastMemo(row: any): CastMemo {
  return {
    id: row.id,
    customer_id: row.customer_id,
    cast_id: row.cast_id,
    last_topic: row.last_topic,
    service_tips: row.service_tips,
    next_topics: row.next_topics,
    visit_notes: row.visit_notes,
    updated_at: row.updated_at,
  };
}

function rowToBottle(row: any): Bottle {
  return {
    id: row.id,
    store_id: row.store_id,
    customer_id: row.customer_id,
    brand: row.brand,
    total_glasses: row.total_glasses,
    remaining_glasses: row.remaining_glasses,
    kept_at: row.kept_at,
  };
}

function rowToVisit(row: any): Visit {
  return {
    id: row.id,
    store_id: row.store_id,
    customer_id: row.customer_id,
    cast_id: row.cast_id,
    table_name: row.table_name,
    is_nominated: Boolean(row.is_nominated),
    visited_at: row.visited_at,
  };
}

function rowToFollowLog(row: any): FollowLog {
  return {
    id: row.id,
    customer_id: row.customer_id,
    cast_id: row.cast_id,
    template_type: row.template_type,
    sent_at: row.sent_at,
  };
}

function rowToScreenshot(row: any): LineScreenshot {
  return {
    id: row.id,
    customer_id: row.customer_id,
    cast_id: row.cast_id,
    image_data: row.image_data,
    media_type: row.media_type,
    extracted: row.extracted,
    applied_fields: row.applied_fields ?? [],
    created_at: row.created_at,
  };
}

function rowToDouhan(row: any): Douhan {
  return {
    id: row.id,
    cast_id: row.cast_id,
    customer_id: row.customer_id,
    store_id: row.store_id,
    date: row.date,
    status: row.status,
    note: row.note ?? null,
    cancellation_reason: row.cancellation_reason ?? null,
    cancelled_at: row.cancelled_at ?? null,
    created_at: row.created_at ?? row.date,
  };
}

function rowToCoupon(row: any): Coupon {
  return {
    id: row.id,
    customer_id: row.customer_id,
    store_id: row.store_id,
    store_name: row.store_name ?? "",
    type: (row.type ?? "drink") as CouponType,
    title: row.title,
    description: row.description ?? "",
    valid_from: row.valid_from,
    valid_until: row.valid_until,
    used_at: row.used_at ?? null,
    code: row.code ?? "",
  };
}

function rowToCastMessage(row: any): StoreToCastMessage {
  return {
    id: row.id,
    cast_id: row.cast_id,
    message: row.message,
    sent_at: row.sent_at,
    read: Boolean(row.read),
  };
}

function rowToCastRequest(row: any): CastToStoreRequest {
  return {
    id: row.id,
    cast_id: row.cast_id,
    cast_name: row.cast_name,
    message: row.message,
    sent_at: row.sent_at,
    resolved: Boolean(row.resolved),
  };
}

// ═══════════════ Cast → Store messaging (cast_messages) ═══════════════

export async function sendCastMessageReal(args: {
  castId: string;
  message: string;
}): Promise<StoreToCastMessage> {
  const supabase = createServerSupabaseClient();
  const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const sent_at = new Date().toISOString();
  const { data, error } = await supabase
    .from("cast_messages")
    .insert({
      id,
      cast_id: args.castId,
      message: args.message,
      sent_at,
      read: false,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToCastMessage(data);
}

export async function getUnreadCastMessagesReal(
  castId: string,
): Promise<StoreToCastMessage[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("cast_messages")
    .select("*")
    .eq("cast_id", castId)
    .eq("read", false)
    .order("sent_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToCastMessage);
}

export async function markCastMessageReadReal(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("cast_messages")
    .update({ read: true })
    .eq("id", id);
  if (error) throw error;
}

// ═══════════════ Cast → Store requests (cast_requests) ═══════════════

export async function sendCastRequestReal(args: {
  castId: string;
  castName: string;
  message: string;
}): Promise<CastToStoreRequest> {
  const supabase = createServerSupabaseClient();
  const id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const sent_at = new Date().toISOString();
  const { data, error } = await supabase
    .from("cast_requests")
    .insert({
      id,
      cast_id: args.castId,
      cast_name: args.castName,
      message: args.message,
      sent_at,
      resolved: false,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToCastRequest(data);
}

export async function getUnresolvedCastRequestsReal(): Promise<
  CastToStoreRequest[]
> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("cast_requests")
    .select("*")
    .eq("resolved", false)
    .order("sent_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToCastRequest);
}

export async function resolveCastRequestReal(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("cast_requests")
    .update({ resolved: true })
    .eq("id", id);
  if (error) throw error;
}

// ═══════════════ Douhan summary (douhans) ═══════════════

export async function getDouhanSummaryReal(
  castId: string,
  today: Date,
): Promise<DouhanSummary> {
  const supabase = createServerSupabaseClient();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);

  const { data, error } = await supabase
    .from("douhans")
    .select("*")
    .eq("cast_id", castId)
    .gte("date", monthStart)
    .lte("date", monthEnd)
    .order("date", { ascending: true });
  if (error) throw error;

  const douhans = (data ?? []).map(rowToDouhan);

  // Pull goal from cast_goals if available; otherwise fall back to 8.
  const { data: goal } = await supabase
    .from("cast_goals")
    .select("douhan_goal")
    .eq("cast_id", castId)
    .maybeSingle();
  const monthlyGoal = (goal?.douhan_goal as number | undefined) ?? 8;

  return {
    monthlyCount: douhans.filter((d) => d.status === "completed").length,
    monthlyGoal,
    thisMonthDouhans: douhans,
  };
}

// ═══════════════ Customer queries (coupons / overviews / bottle views) ═══════════════

export async function getCustomerCouponsReal(
  customerId: string,
): Promise<Coupon[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("customer_id", customerId);
  if (error) throw error;

  return (data ?? []).map(rowToCoupon).sort((a, b) => {
    // Unused first, then by valid_until desc
    if (!a.used_at && b.used_at) return -1;
    if (a.used_at && !b.used_at) return 1;
    return (
      new Date(b.valid_until).getTime() - new Date(a.valid_until).getTime()
    );
  });
}

export async function getCustomerBottleViewsReal(
  customerId: string,
): Promise<CustomerBottleView[]> {
  const supabase = createServerSupabaseClient();

  const { data: bottles, error: bErr } = await supabase
    .from("bottles")
    .select("*")
    .eq("customer_id", customerId);
  if (bErr) throw bErr;
  if (!bottles || bottles.length === 0) return [];

  const storeIds = Array.from(new Set(bottles.map((b: any) => b.store_id)));
  const { data: stores } = await supabase
    .from("nightos_stores")
    .select("id, name")
    .in("id", storeIds);
  const storeMap = new Map(
    (stores ?? []).map((s: any) => [s.id, s.name as string]),
  );

  // Resolve "regular cast" — the one most recently nominated by this
  // customer. Falls back to the customer.cast_id field.
  const { data: customer } = await supabase
    .from("customers")
    .select("cast_id")
    .eq("id", customerId)
    .maybeSingle();
  const castId = (customer as any)?.cast_id as string | undefined;
  let castName: string | null = null;
  if (castId) {
    const { data: cast } = await supabase
      .from("nightos_casts")
      .select("name")
      .eq("id", castId)
      .maybeSingle();
    castName = ((cast as any)?.name as string | undefined) ?? null;
  }

  return bottles.map((b: any) => ({
    bottle: rowToBottle(b),
    store_name: storeMap.get(b.store_id) ?? "（不明）",
    cast_name: castName,
  }));
}

const RANK_TIERS_REAL: {
  tier: import("@/types/nightos").RankTier;
  label: string;
  emoji: string;
  minVisits: number;
}[] = [
  { tier: "diamond", label: "ダイヤモンド", emoji: "💎", minVisits: 50 },
  { tier: "platinum", label: "プラチナ", emoji: "👑", minVisits: 20 },
  { tier: "gold", label: "ゴールド", emoji: "🥇", minVisits: 10 },
  { tier: "silver", label: "シルバー", emoji: "🥈", minVisits: 5 },
  { tier: "bronze", label: "ブロンズ", emoji: "🥉", minVisits: 0 },
];

function computeRank(
  visitCount: number,
): import("@/types/nightos").CustomerRank {
  let currentIdx = RANK_TIERS_REAL.length - 1;
  for (let i = 0; i < RANK_TIERS_REAL.length; i++) {
    if (visitCount >= RANK_TIERS_REAL[i].minVisits) {
      currentIdx = i;
      break;
    }
  }
  const current = RANK_TIERS_REAL[currentIdx];
  const next = currentIdx > 0 ? RANK_TIERS_REAL[currentIdx - 1] : null;
  const rangeStart = current.minVisits;
  const rangeEnd = next ? next.minVisits : current.minVisits + 10;
  return {
    tier: current.tier,
    label: current.label,
    emoji: current.emoji,
    visitCount,
    nextTierLabel: next ? next.label : null,
    visitsToNextTier: Math.max(0, next ? next.minVisits - visitCount : 0),
    progress:
      rangeEnd > rangeStart
        ? Math.min(1, Math.max(0, (visitCount - rangeStart) / (rangeEnd - rangeStart)))
        : 1,
  };
}

export async function getCustomerStoreOverviewsReal(
  customerId: string,
): Promise<CustomerStoreOverview[]> {
  const supabase = createServerSupabaseClient();

  const [bottlesRes, visitsRes, couponsRes, customerRes] = await Promise.all([
    supabase.from("bottles").select("*").eq("customer_id", customerId),
    supabase
      .from("visits")
      .select("*")
      .eq("customer_id", customerId)
      .order("visited_at", { ascending: false }),
    supabase.from("coupons").select("*").eq("customer_id", customerId),
    supabase
      .from("customers")
      .select("category")
      .eq("id", customerId)
      .maybeSingle(),
  ]);
  if (bottlesRes.error) throw bottlesRes.error;
  if (visitsRes.error) throw visitsRes.error;
  if (couponsRes.error) throw couponsRes.error;

  const bottles = (bottlesRes.data ?? []).map(rowToBottle);
  const visits = (visitsRes.data ?? []).map(rowToVisit);
  const coupons = (couponsRes.data ?? []).map(rowToCoupon);
  const isVip = (customerRes.data as any)?.category === "vip";

  const storeIdSet = new Set<string>([
    ...bottles.map((b) => b.store_id),
    ...visits.map((v) => v.store_id),
  ]);
  const storeIds = Array.from(storeIdSet);
  if (storeIds.length === 0) return [];

  // Look up store names + relevant cast names in parallel.
  const nominatedCastIds = Array.from(
    new Set(
      visits.filter((v) => v.is_nominated && v.cast_id).map((v) => v.cast_id!),
    ),
  );
  const [storesRes, castsRes] = await Promise.all([
    supabase.from("nightos_stores").select("id, name").in("id", storeIds),
    nominatedCastIds.length > 0
      ? supabase.from("nightos_casts").select("id, name").in("id", nominatedCastIds)
      : Promise.resolve({ data: [] as any[], error: null }),
  ]);
  const storeMap = new Map(
    (storesRes.data ?? []).map((s: any) => [s.id as string, s.name as string]),
  );
  const castMap = new Map(
    (castsRes.data ?? []).map((c: any) => [c.id as string, c.name as string]),
  );

  return storeIds.map((storeId) => {
    const storeBottles = bottles.filter((b) => b.store_id === storeId);
    const storeVisits = visits.filter((v) => v.store_id === storeId);
    const nomination = storeVisits.find((v) => v.is_nominated && v.cast_id);
    const storeCoupons = coupons.filter((c) => c.store_id === storeId);
    return {
      store_id: storeId,
      store_name: storeMap.get(storeId) ?? "（不明）",
      visit_count: storeVisits.length,
      total_spent_estimate: storeVisits.length * (isVip ? 40_000 : 22_000),
      bottles: storeBottles,
      nomination_cast: nomination?.cast_id
        ? (castMap.get(nomination.cast_id) ?? null)
        : null,
      nomination_cast_id: nomination?.cast_id ?? null,
      last_visit: storeVisits[0]?.visited_at ?? null,
      coupons: storeCoupons,
      rank: computeRank(storeVisits.length),
    };
  });
}

// ═══════════════ Onboarding (migration 008) ═══════════════════

/**
 * Generate an 8-char human-friendly invite code.
 * Excludes 0/O/1/I/L to avoid confusion when a user types it in.
 */
const INVITE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateInviteCode(): string {
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += INVITE_ALPHABET[
      Math.floor(Math.random() * INVITE_ALPHABET.length)
    ];
  }
  return out;
}

/**
 * Look up a store by invite code (case-insensitive, hyphens stripped).
 * Returns null if not found. Used during cast / store_staff onboarding.
 */
export async function getStoreByInviteCodeReal(
  rawCode: string,
): Promise<{ id: string; name: string; venue_type: "club" | "cabaret" } | null> {
  const normalized = rawCode.replace(/[\s-]/g, "").toUpperCase();
  if (!normalized) return null;

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("nightos_stores")
    .select("id, name, venue_type")
    .eq("invite_code", normalized)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id as string,
    name: data.name as string,
    venue_type: ((data.venue_type as string) ?? "cabaret") as
      | "club"
      | "cabaret",
  };
}

/**
 * Get the venue_type for the store a cast belongs to.
 * Returns "club" as a safe fallback if not found.
 */
export async function getVenueTypeForCastReal(
  castId: string,
): Promise<"club" | "cabaret"> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("nightos_casts")
    .select("store_id")
    .eq("id", castId)
    .maybeSingle();
  if (!data?.store_id) return "club";

  const { data: store } = await supabase
    .from("nightos_stores")
    .select("venue_type")
    .eq("id", data.store_id)
    .maybeSingle();

  const vt = (store as any)?.venue_type;
  return vt === "club" || vt === "cabaret" ? vt : "club";
}

/**
 * Look up the customer row owned by the signed-in user.
 * Returns null if the user signed up as a non-customer role.
 */
export async function getCustomerByAuthUserIdReal(
  authUserId: string,
): Promise<Customer | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToCustomer(data) : null;
}

