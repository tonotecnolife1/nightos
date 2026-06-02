import type {
  Bottle,
  Cast,
  CastGoal,
  CastHomeData,
  CastMemo,
  Customer,
  CustomerCategory,
  CustomerContext,
  FollowLog,
  LineScreenshot,
  MemoExtractionResult,
  Visit,
} from "@/types/nightos";
import { selectFollowTargets } from "@/features/cast-home/data/follow-selector";
import { inferManagerCastId } from "./manager-assignment";
import {
  MOCK_TODAY,
  mockBottles,
  mockCastGoals,
  mockCastMemos,
  mockCastMessages,
  mockCasts,
  mockCustomers,
  mockDouhans,
  mockScreenshots,
  mockStores,
  mockVisits,
  type StoreToCastMessage,
} from "./mock-data";
import {
  MOCK_FOLLOW_RATE,
  MOCK_NOMINATION_TREND,
  MOCK_REPEAT_TREND,
  type RepeatPoint,
  type TrendPoint,
} from "./store-mock-data";
import { CURRENT_STORE_ID, DEMO_CAST_IDS } from "./constants";
import {
  buildMonthlyRepeatTrend,
  monthlyRepeatRate,
  monthlySales,
  yearlyRepeatRate,
  yearlySales,
} from "./stats-trend";
import {
  consumeBottleReal,
  createBottleReal,
  createCustomerReal,
  createVisitReal,
  deleteBottleReal,
  deleteCustomerReal,
  deleteScreenshotReal,
  deleteVisitReal,
  getAllBottlesReal,
  getAllCastsReal,
  getAllCustomersReal,
  getCastByIdReal,
  getCastGoalReal,
  getCastHomeDataReal,
  getCustomerByIdReal,
  getCustomerContextReal,
  getCustomersForCastReal,
  getCustomersForOnesanReal,
  getHelpCastNamesForOnesanReal,
  getVisitsForCustomersReal,
  getRecentVisitsForCastReal,
  getRecentVisitsReal,
  getScreenshotsForCustomerReal,
  getSubordinateCastsReal,
  getTeamCustomersReal,
  getCastStatsDataReal,
  getStoreDashboardDataReal,
  recordFollowLogReal,
  saveScreenshotReal,
  setCastGoalReal,
  transferCustomersReal,
  updateCastClubRoleReal,
  updateCastMemoReal,
  updateCustomerReal,
  // ── B4: real persistence for previously-mock-only features ──
  sendCastMessageReal,
  getUnreadCastMessagesReal,
  markCastMessageReadReal,
  sendCastRequestReal,
  getUnresolvedCastRequestsReal,
  resolveCastRequestReal,
  getDouhanSummaryReal,
  getCustomerCouponsReal,
  getCustomerBottleViewsReal,
  getCustomerStoreOverviewsReal,
} from "./supabase-real";

// ─────────────────────────────────────────────────────────────
// NIGHTOS queries with a mock-data fallback.
//
// Each public function tries the real Supabase implementation
// when env vars are configured, falling back to the in-memory
// mock on any error so misconfiguration never crashes the app.
//
// IMPORTANT: we check env vars BEFORE calling the Supabase client
// factory, because `createServerSupabaseClient` does not tolerate
// undefined URL/anon key — it throws at runtime.
// ─────────────────────────────────────────────────────────────

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Wraps a real Supabase call with a mock fallback. Logs the error
 * and returns the mock value when the real call throws so the app
 * keeps working even if the DB schema is out of sync.
 */
async function withFallback<T>(
  name: string,
  real: () => Promise<T>,
  mock: () => T | Promise<T>,
): Promise<T> {
  if (!isSupabaseConfigured()) return mock();
  try {
    return await real();
  } catch (err) {
    console.error(`[supabase] ${name} failed, falling back to mock:`, err);
    return mock();
  }
}

export async function getCastHomeData(castId: string): Promise<CastHomeData> {
  return withFallback(
    "getCastHomeData",
    () => getCastHomeDataReal(castId, new Date()),
    () => getCastHomeDataMock(castId),
  );
}

export async function getCustomersForCast(
  castId: string,
): Promise<Customer[]> {
  // Demo personas (akari etc.) should always look rich. If the DB is
  // empty for them — most often because Production hasn't been seeded
  // yet — fall back to mock. Real testers always get DB results so an
  // empty DB stays empty (we render a CTA).
  const mockFor = () => mockCustomers.filter((c) => c.cast_id === castId);
  if (!isSupabaseConfigured()) return mockFor();
  try {
    const real = await getCustomersForCastReal(castId);
    if (real.length === 0 && DEMO_CAST_IDS.includes(castId)) return mockFor();
    return real;
  } catch (err) {
    console.error(
      "[supabase] getCustomersForCast failed, falling back to mock:",
      err,
    );
    return mockFor();
  }
}

/** For oneesan: own customers + assigned help casts' customers, plus a helpCastId→name map. */
export async function getCustomersForOneesan(castId: string): Promise<{
  customers: Customer[];
  helpCastNames: Record<string, string>;
}> {
  const helpCasts = mockCasts.filter((c) => c.assigned_oneesan_id === castId);
  const helpIds = helpCasts.map((c) => c.id);
  const helpNamesMock = Object.fromEntries(helpCasts.map((c) => [c.id, c.name]));
  const allIds = [castId, ...helpIds];

  const mockFallback = () => ({
    customers: mockCustomers.filter((c) => allIds.includes(c.cast_id ?? "")),
    helpCastNames: helpNamesMock,
  });

  if (!isSupabaseConfigured()) return mockFallback();
  try {
    const [customers, helpCastNames] = await Promise.all([
      getCustomersForOnesanReal(castId),
      getHelpCastNamesForOnesanReal(castId),
    ]);
    if (customers.length === 0 && DEMO_CAST_IDS.includes(castId)) return mockFallback();
    return { customers, helpCastNames };
  } catch {
    return mockFallback();
  }
}

export async function getCustomerContext(
  castId: string,
  customerId: string,
): Promise<CustomerContext | null> {
  // Same demo-aware contract as getCustomersForCast: mock fallback for
  // seeded personas when the DB has nothing to serve.
  if (!isSupabaseConfigured()) {
    return getCustomerContextMock(castId, customerId);
  }
  try {
    const real = await getCustomerContextReal(castId, customerId);
    if (real) return real;
    if (DEMO_CAST_IDS.includes(castId)) {
      return getCustomerContextMock(castId, customerId);
    }
    return null;
  } catch (err) {
    console.error(
      "[supabase] getCustomerContext failed, falling back to mock:",
      err,
    );
    return getCustomerContextMock(castId, customerId);
  }
}

export async function getCastById(castId: string): Promise<Cast | null> {
  return withFallback(
    "getCastById",
    () => getCastByIdReal(castId),
    () => mockCasts.find((c) => c.id === castId) ?? null,
  );
}

// ═══════════════ Store-side queries ═══════════════

export async function getAllCasts(): Promise<Cast[]> {
  return withFallback(
    "getAllCasts",
    () => getAllCastsReal(),
    () => [...mockCasts],
  );
}

/**
 * mama/姉さん配下のキャスト一覧を取得（自分は含まない）。
 * - ママ: 同じ店舗の全キャスト
 * - お姉さん: 自分配下のキャスト（直属＋孫弟子まで再帰的に収集）
 */
export async function getSubordinateCasts(leaderCastId: string): Promise<Cast[]> {
  return withFallback(
    "getSubordinateCasts",
    () => getSubordinateCastsReal(leaderCastId),
    () => getSubordinateCastsMock(leaderCastId),
  );
}

function getSubordinateCastsMock(leaderCastId: string): Cast[] {
  const leader = mockCasts.find((c) => c.id === leaderCastId);
  if (!leader) return [];

  if (leader.club_role === "mama") {
    return mockCasts.filter(
      (c) => c.store_id === leader.store_id && c.id !== leader.id,
    );
  }

  if (leader.club_role === "oneesan") {
    const result: Cast[] = [];
    const queue: string[] = [leader.id];
    const seen = new Set<string>([leader.id]);
    while (queue.length > 0) {
      const parentId = queue.shift()!;
      const children = mockCasts.filter(
        (c) =>
          c.store_id === leader.store_id &&
          c.assigned_oneesan_id === parentId &&
          !seen.has(c.id),
      );
      for (const child of children) {
        seen.add(child.id);
        result.push(child);
        queue.push(child.id);
      }
    }
    return result;
  }

  return [];
}

/**
 * お店全体の顧客一覧（mama/姉さん用）。
 * 自分 + 配下のキャストが担当する顧客すべてを返す。
 */
export async function getTeamCustomers(
  leaderCastId: string,
): Promise<Array<Customer & { cast_name: string }>> {
  return withFallback(
    "getTeamCustomers",
    () => getTeamCustomersReal(leaderCastId),
    () => getTeamCustomersMock(leaderCastId),
  );
}

async function getTeamCustomersMock(
  leaderCastId: string,
): Promise<Array<Customer & { cast_name: string }>> {
  const team = await getSubordinateCasts(leaderCastId);
  const teamIds = new Set([leaderCastId, ...team.map((c) => c.id)]);
  const customers = mockCustomers.filter((c) => teamIds.has(c.cast_id));
  return customers.map((c) => {
    const cast = mockCasts.find((x) => x.id === c.cast_id);
    return { ...c, cast_name: cast?.name ?? "不明" };
  });
}

/**
 * All customers in the store, sorted so recently-visited ones are on top
 * (matches spec: "最近の来店客が上位表示").
 */
/** 指定顧客群の全来店（接客者を問わず）。歴代ヘルプの多対多集約に使う。 */
export async function getVisitsForCustomers(
  customerIds: string[],
): Promise<Visit[]> {
  return withFallback(
    "getVisitsForCustomers",
    () => getVisitsForCustomersReal(customerIds),
    () => {
      const set = new Set(customerIds);
      return mockVisits.filter((v) => set.has(v.customer_id));
    },
  );
}

export async function getAllCustomers(): Promise<Customer[]> {
  return withFallback(
    "getAllCustomers",
    () => getAllCustomersReal(),
    () => getAllCustomersMock(),
  );
}

// ═══════════════ Store CRUD: customers ═══════════════

export interface UpdateCustomerInput {
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
}

export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput,
): Promise<Customer | null> {
  return withFallback(
    "updateCustomer",
    () => updateCustomerReal(id, input),
    () => updateCustomerMock(id, input),
  );
}

function updateCustomerMock(
  id: string,
  input: UpdateCustomerInput,
): Customer | null {
  const idx = mockCustomers.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  const updated: Customer = {
    ...mockCustomers[idx],
    name: input.name,
    name_kana:
      input.name_kana !== undefined
        ? input.name_kana
        : mockCustomers[idx].name_kana,
    nickname:
      input.nickname !== undefined
        ? input.nickname
        : mockCustomers[idx].nickname,
    birthday: input.birthday,
    job: input.job,
    favorite_drink: input.favorite_drink,
    category: input.category,
    store_memo: input.store_memo,
    region: input.region,
    cast_id: input.cast_id,
  };
  mockCustomers[idx] = updated;
  return updated;
}

/**
 * Bulk-transfer customers to a new cast (担当移管).
 * Only updates cast_id; all other fields are preserved.
 */
export async function transferCustomers(
  customerIds: string[],
  newCastId: string,
): Promise<void> {
  return withFallback(
    "transferCustomers",
    () => transferCustomersReal(customerIds, newCastId),
    () => {
      for (const id of customerIds) {
        const idx = mockCustomers.findIndex((c) => c.id === id);
        if (idx >= 0) {
          mockCustomers[idx] = { ...mockCustomers[idx], cast_id: newCastId };
        }
      }
    },
  );
}

const DEFAULT_SALES_GOAL = 1_000_000;
const DEFAULT_DOUHAN_GOAL = 3;

export async function getCastGoal(castId: string): Promise<CastGoal> {
  return withFallback(
    "getCastGoal",
    async () => {
      const result = await getCastGoalReal(castId);
      return result ?? {
        castId,
        salesGoal: DEFAULT_SALES_GOAL,
        douhanGoal: DEFAULT_DOUHAN_GOAL,
        note: null,
        setBy: null,
        updatedAt: new Date().toISOString(),
      };
    },
    () => {
      const found = mockCastGoals.find((g) => g.castId === castId);
      if (found) return found;
      return {
        castId,
        salesGoal: DEFAULT_SALES_GOAL,
        douhanGoal: DEFAULT_DOUHAN_GOAL,
        note: null,
        setBy: null,
        updatedAt: new Date().toISOString(),
      };
    },
  );
}

export async function setCastGoal(
  castId: string,
  input: { salesGoal: number; douhanGoal: number; note: string | null; setBy: string | null },
): Promise<CastGoal> {
  return withFallback(
    "setCastGoal",
    () => setCastGoalReal(castId, input),
    () => {
      const idx = mockCastGoals.findIndex((g) => g.castId === castId);
      const updated: CastGoal = {
        castId,
        salesGoal: input.salesGoal,
        douhanGoal: input.douhanGoal,
        note: input.note,
        setBy: input.setBy,
        updatedAt: new Date().toISOString(),
      };
      if (idx >= 0) {
        mockCastGoals[idx] = updated;
      } else {
        mockCastGoals.push(updated);
      }
      return updated;
    },
  );
}

export async function deleteCustomer(id: string): Promise<void> {
  return withFallback(
    "deleteCustomer",
    () => deleteCustomerReal(id),
    () => deleteCustomerMock(id),
  );
}

function deleteCustomerMock(id: string): void {
  const idx = mockCustomers.findIndex((c) => c.id === id);
  if (idx >= 0) mockCustomers.splice(idx, 1);
  // Cascade: also remove dependent rows from the in-memory mocks
  for (let i = mockBottles.length - 1; i >= 0; i--) {
    if (mockBottles[i].customer_id === id) mockBottles.splice(i, 1);
  }
  for (let i = mockVisits.length - 1; i >= 0; i--) {
    if (mockVisits[i].customer_id === id) mockVisits.splice(i, 1);
  }
  for (let i = mockCastMemos.length - 1; i >= 0; i--) {
    if (mockCastMemos[i].customer_id === id) mockCastMemos.splice(i, 1);
  }
  for (let i = mockScreenshots.length - 1; i >= 0; i--) {
    if (mockScreenshots[i].customer_id === id) mockScreenshots.splice(i, 1);
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  return withFallback(
    "getCustomerById",
    () => getCustomerByIdReal(id),
    () => mockCustomers.find((c) => c.id === id) ?? null,
  );
}

// ═══════════════ Store CRUD: visits ═══════════════

export interface VisitWithNames extends Visit {
  customer_name: string;
  cast_name: string;
}

export async function getRecentVisits(limit = 50): Promise<VisitWithNames[]> {
  return withFallback(
    "getRecentVisits",
    () => getRecentVisitsReal(limit),
    () => getRecentVisitsMock(limit),
  );
}

function getRecentVisitsMock(limit: number): VisitWithNames[] {
  return [...mockVisits]
    .sort(
      (a, b) =>
        new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime(),
    )
    .slice(0, limit)
    .map((v) => ({
      ...v,
      customer_name:
        mockCustomers.find((c) => c.id === v.customer_id)?.name ?? "（不明）",
      cast_name: mockCasts.find((c) => c.id === v.cast_id)?.name ?? "（不明）",
    }));
}

export async function deleteVisit(id: string): Promise<void> {
  return withFallback(
    "deleteVisit",
    () => deleteVisitReal(id),
    () => deleteVisitMock(id),
  );
}

function deleteVisitMock(id: string): void {
  const idx = mockVisits.findIndex((v) => v.id === id);
  if (idx >= 0) mockVisits.splice(idx, 1);
}

// ═══════════════ Store CRUD: bottles ═══════════════

export interface BottleWithCustomer extends Bottle {
  customer_name: string;
  cast_id: string | null;
}

export async function getAllBottles(): Promise<BottleWithCustomer[]> {
  return withFallback(
    "getAllBottles",
    () => getAllBottlesReal(),
    () => getAllBottlesMock(),
  );
}

function getAllBottlesMock(): BottleWithCustomer[] {
  return [...mockBottles]
    .sort((a, b) => a.remaining_glasses - b.remaining_glasses)
    .map((b) => {
      const customer = mockCustomers.find((c) => c.id === b.customer_id);
      return {
        ...b,
        customer_name: customer?.name ?? "（不明）",
        cast_id: customer?.cast_id ?? null,
      };
    });
}

export async function consumeBottle(
  id: string,
  glasses = 1,
): Promise<Bottle | null> {
  return withFallback(
    "consumeBottle",
    () => consumeBottleReal(id, glasses),
    () => consumeBottleMock(id, glasses),
  );
}

function consumeBottleMock(id: string, glasses: number): Bottle | null {
  const idx = mockBottles.findIndex((b) => b.id === id);
  if (idx < 0) return null;
  const next = {
    ...mockBottles[idx],
    remaining_glasses: Math.max(0, mockBottles[idx].remaining_glasses - glasses),
  };
  mockBottles[idx] = next;
  return next;
}

export async function deleteBottle(id: string): Promise<void> {
  return withFallback(
    "deleteBottle",
    () => deleteBottleReal(id),
    () => deleteBottleMock(id),
  );
}

function deleteBottleMock(id: string): void {
  const idx = mockBottles.findIndex((b) => b.id === id);
  if (idx >= 0) mockBottles.splice(idx, 1);
}

function getAllCustomersMock(): Customer[] {
  const latestVisit = new Map<string, number>();
  for (const v of mockVisits) {
    const t = new Date(v.visited_at).getTime();
    const prev = latestVisit.get(v.customer_id) ?? 0;
    if (t > prev) latestVisit.set(v.customer_id, t);
  }
  return [...mockCustomers].sort((a, b) => {
    const av = latestVisit.get(a.id) ?? 0;
    const bv = latestVisit.get(b.id) ?? 0;
    return bv - av;
  });
}

export interface StoreDashboardData {
  totalNominations: number;
  totalSales: number;
  averageRepeatRate: number;
  averageFollowRate: number;
  nominationTrend: TrendPoint[];
  repeatTrend: RepeatPoint[];
  castStats: {
    cast: Cast;
    followRate: number;
    customerCount: number;
    monthlyVisits: number;
  }[];
}

export async function getStoreDashboardData(): Promise<StoreDashboardData> {
  return withFallback(
    "getStoreDashboardData",
    () => getStoreDashboardDataReal(CURRENT_STORE_ID),
    () => getStoreDashboardDataMock(),
  );
}

function getStoreDashboardDataMock(): StoreDashboardData {
  const castStats = mockCasts.map((cast) => {
    const customers = mockCustomers.filter((c) => c.cast_id === cast.id);
    const visits = mockVisits.filter((v) => v.cast_id === cast.id);
    return {
      cast,
      followRate: MOCK_FOLLOW_RATE[cast.id] ?? 0,
      customerCount: customers.length,
      monthlyVisits: visits.length,
    };
  });

  const totalNominations = mockCasts.reduce(
    (s, c) => s + c.nomination_count,
    0,
  );
  const totalSales = mockCasts.reduce((s, c) => s + c.monthly_sales, 0);
  const averageRepeatRate =
    mockCasts.reduce((s, c) => s + c.repeat_rate, 0) / mockCasts.length;
  const averageFollowRate =
    castStats.reduce((s, c) => s + c.followRate, 0) / castStats.length;

  return {
    totalNominations,
    totalSales,
    averageRepeatRate,
    averageFollowRate,
    nominationTrend: MOCK_NOMINATION_TREND,
    repeatTrend: MOCK_REPEAT_TREND,
    castStats,
  };
}

// ═══════════════ Mutations (mock only for PR-2/PR-3) ═══════════════

export interface CastMemoInput {
  last_topic: string | null;
  service_tips: string | null;
  next_topics: string | null;
}

/**
 * Update (or create) a cast's personal memo for a customer.
 * In mock mode the change is in-memory only and lasts until the server
 * process restarts — good enough for the MVP validation loop.
 */
export async function updateCastClubRole(
  castId: string,
  clubRole: "mama" | "oneesan" | "help",
  assignedOnesanId: string | null,
): Promise<void> {
  if (!isSupabaseConfigured()) return; // mock: no-op (in-memory only)
  try {
    await updateCastClubRoleReal(castId, clubRole, assignedOnesanId);
  } catch (err) {
    console.error("[supabase] updateCastClubRole failed:", err);
    throw err;
  }
}

export async function updateCastMemo(args: {
  castId: string;
  customerId: string;
  input: CastMemoInput;
}): Promise<CastMemo> {
  return withFallback(
    "updateCastMemo",
    () => updateCastMemoReal(args),
    () => updateCastMemoMock(args),
  );
}

/**
 * Record that a cast copied/sent a template message.
 * Mock mode just logs to the server console — the UI still gets a
 * success so the UX feels real.
 */
export async function recordFollowLog(args: {
  castId: string;
  customerId: string;
  templateType: FollowLog["template_type"];
}): Promise<FollowLog> {
  return withFallback(
    "recordFollowLog",
    () => recordFollowLogReal(args),
    () => recordFollowLogMock(args),
  );
}

// ═══════════════ Mock implementations ═══════════════

function updateCastMemoMock(args: {
  castId: string;
  customerId: string;
  input: CastMemoInput;
}): CastMemo {
  const existingIdx = mockCastMemos.findIndex(
    (m) => m.cast_id === args.castId && m.customer_id === args.customerId,
  );
  const updated: CastMemo = {
    id: existingIdx >= 0 ? mockCastMemos[existingIdx].id : `memo_${Date.now()}`,
    customer_id: args.customerId,
    cast_id: args.castId,
    last_topic: args.input.last_topic,
    service_tips: args.input.service_tips,
    next_topics: args.input.next_topics,
    visit_notes:
      existingIdx >= 0 ? mockCastMemos[existingIdx].visit_notes : null,
    updated_at: new Date().toISOString(),
  };
  if (existingIdx >= 0) {
    mockCastMemos[existingIdx] = updated;
  } else {
    mockCastMemos.push(updated);
  }
  return updated;
}

function recordFollowLogMock(args: {
  castId: string;
  customerId: string;
  templateType: FollowLog["template_type"];
}): FollowLog {
  const log: FollowLog = {
    id: `follow_${Date.now()}`,
    customer_id: args.customerId,
    cast_id: args.castId,
    template_type: args.templateType,
    sent_at: new Date().toISOString(),
  };
  // eslint-disable-next-line no-console
  console.log("[nightos] follow_log recorded (mock):", log);
  return log;
}

// ═══════════════ Store-side create mutations ═══════════════

export interface CreateCustomerInput {
  name: string;
  /** 氏名の読み仮名（ひらがな）。検索の予測用。任意。 */
  name_kana?: string | null;
  /** 呼び名（任意・入力推奨）。カルテのサブ表示等に使用。 */
  nickname?: string | null;
  birthday: string | null;
  job: string | null;
  favorite_drink: string | null;
  category: CustomerCategory;
  store_memo: string | null;
  cast_id: string;
  /** 紹介元顧客 id（紹介で来た時） */
  referred_by_customer_id?: string | null;
  /** 初期ファネルステージ。未指定 = "store_only" */
  funnel_stage?: "store_only" | "assigned" | "line_exchanged";
  /** LINE交換済みで登録時、交換日時（ISO） */
  line_exchanged_at?: string | null;
  /** 管理者キャスト id（ママor姉さん）。未指定なら null。 */
  manager_cast_id?: string | null;
  /** 所属店舗 id。未指定ならログイン中のキャストの店舗を引く。 */
  store_id?: string;
  /** 普段の活動エリア（都道府県）。AI が天気・気候を推論するのに使う。 */
  region?: string | null;
}

export async function createCustomer(
  input: CreateCustomerInput,
): Promise<Customer> {
  const storeId = input.store_id ?? (await resolveStoreIdForCast(input.cast_id));
  // 書き込みは読み取りと違い、サイレントに mock へフォールバックしてはいけない。
  // フォールバックするとメモリ上のモックにだけ保存され、本番DBには残らないため
  // 「登録しました」と表示されるのに一覧・重複チェックから見えなくなる
  // （= 今回のバグ）。Supabase 設定時は失敗を必ず呼び出し側へ伝える。
  if (!isSupabaseConfigured()) {
    return createCustomerMock({ ...input, store_id: storeId });
  }
  return createCustomerReal({ ...input, storeId });
}

/**
 * Look up the store_id of the given cast so newly created customers
 * land in the right store. Falls back to CURRENT_STORE_ID for legacy
 * mock mode.
 */
async function resolveStoreIdForCast(castId: string): Promise<string> {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const { createServerSupabaseClient } = await import(
        "@/lib/supabase/server"
      );
      const supabase = createServerSupabaseClient();
      const { data } = await supabase
        .from("nightos_casts")
        .select("store_id")
        .eq("id", castId)
        .maybeSingle();
      const storeId = (data?.store_id as string | undefined) ?? null;
      if (storeId) return storeId;
    } catch {
      // fall through
    }
  }
  return CURRENT_STORE_ID;
}

function createCustomerMock(input: CreateCustomerInput): Customer {
  const stage = input.funnel_stage ?? "store_only";
  const customer: Customer = {
    id: `cust_${Date.now()}`,
    store_id: input.store_id ?? CURRENT_STORE_ID,
    cast_id: input.cast_id,
    name: input.name,
    name_kana: input.name_kana ?? null,
    nickname: input.nickname ?? null,
    birthday: input.birthday,
    job: input.job,
    favorite_drink: input.favorite_drink,
    category: input.category,
    store_memo: input.store_memo,
    created_at: new Date().toISOString(),
    referred_by_customer_id: input.referred_by_customer_id ?? null,
    funnel_stage: stage,
    line_exchanged_cast_id:
      stage === "line_exchanged" ? input.cast_id : null,
    line_exchanged_at:
      stage === "line_exchanged"
        ? input.line_exchanged_at ?? new Date().toISOString()
        : null,
    manager_cast_id:
      input.manager_cast_id ?? inferManagerCastId(input.cast_id, mockCasts),
    region: input.region ?? null,
  };
  mockCustomers.push(customer);
  return customer;
}

export interface CreateVisitInput {
  customer_id: string;
  cast_id: string;
  table_name: string | null;
  is_nominated: boolean;
  /** お会計金額（円）。未入力は 0。 */
  sales_amount?: number;
}

export async function createVisit(input: CreateVisitInput): Promise<Visit> {
  return withFallback(
    "createVisit",
    () => createVisitReal({ ...input, storeId: CURRENT_STORE_ID }),
    () => createVisitMock(input),
  );
}

function createVisitMock(input: CreateVisitInput): Visit {
  const visit: Visit = {
    id: `visit_${Date.now()}`,
    store_id: CURRENT_STORE_ID,
    customer_id: input.customer_id,
    cast_id: input.cast_id,
    table_name: input.table_name,
    is_nominated: input.is_nominated,
    sales_amount: input.sales_amount ?? 0,
    visited_at: new Date().toISOString(),
  };
  mockVisits.push(visit);
  return visit;
}

export interface CreateBottleInput {
  customer_id: string;
  brand: string;
  total_glasses: number;
}

export async function createBottle(input: CreateBottleInput): Promise<Bottle> {
  return withFallback(
    "createBottle",
    () => createBottleReal({ ...input, storeId: CURRENT_STORE_ID }),
    () => createBottleMock(input),
  );
}

function createBottleMock(input: CreateBottleInput): Bottle {
  const bottle: Bottle = {
    id: `btl_${Date.now()}`,
    store_id: CURRENT_STORE_ID,
    customer_id: input.customer_id,
    brand: input.brand,
    total_glasses: input.total_glasses,
    remaining_glasses: input.total_glasses,
    kept_at: new Date().toISOString(),
  };
  mockBottles.push(bottle);
  return bottle;
}

// ═══════════════ LINE screenshot history ═══════════════

export async function getScreenshotsForCustomer(
  castId: string,
  customerId: string,
  allForCustomer = false,
): Promise<LineScreenshot[]> {
  return withFallback(
    "getScreenshotsForCustomer",
    () => getScreenshotsForCustomerReal(castId, customerId, allForCustomer),
    () => getScreenshotsForCustomerMock(castId, customerId, allForCustomer),
  );
}

function getScreenshotsForCustomerMock(
  castId: string,
  customerId: string,
  allForCustomer = false,
): LineScreenshot[] {
  return mockScreenshots
    .filter((s) => s.customer_id === customerId && (allForCustomer || s.cast_id === castId))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
}

export interface SaveScreenshotInput {
  customerId: string;
  castId: string;
  imageData: string; // data URL
  mediaType: string;
  extracted: MemoExtractionResult;
  appliedFields: LineScreenshot["applied_fields"];
}

export async function saveScreenshot(
  input: SaveScreenshotInput,
): Promise<LineScreenshot> {
  return withFallback(
    "saveScreenshot",
    () => saveScreenshotReal(input),
    () => saveScreenshotMock(input),
  );
}

function saveScreenshotMock(input: SaveScreenshotInput): LineScreenshot {
  const screenshot: LineScreenshot = {
    id: `shot_${Date.now()}`,
    customer_id: input.customerId,
    cast_id: input.castId,
    image_data: input.imageData,
    media_type: input.mediaType,
    extracted: input.extracted,
    applied_fields: input.appliedFields,
    created_at: new Date().toISOString(),
  };
  mockScreenshots.push(screenshot);
  return screenshot;
}

export async function deleteScreenshot(id: string): Promise<void> {
  return withFallback(
    "deleteScreenshot",
    async () => {
      await deleteScreenshotReal(id);
    },
    () => {
      const idx = mockScreenshots.findIndex((s) => s.id === id);
      if (idx >= 0) mockScreenshots.splice(idx, 1);
    },
  );
}

// ═══════════════ Mock implementations ═══════════════

// ═══════════════ Cast personal stats ═══════════════

export interface CastStatsData {
  cast: Cast;
  monthly: {
    sales: number;
    repeatRate: number;
    followRate: number;
    newCustomerCount: number;
    /** 担当している顧客の総数 */
    totalCustomerCount: number;
    /** 今月の同伴完了数 */
    douhanCount: number;
  };
  yearly: {
    sales: number;
    repeatRate: number;
    newCustomerCount: number;
    douhanCount: number;
  };
  targets: {
    salesGoal: number;
    douhanGoal: number;
  };
  /** Last 4 weeks of repeat rate for THIS cast only. */
  repeatTrend: { week: string; label: string; rate: number }[];
  /** Last 6 months of repeat rate for THIS cast only (month-granularity chart). */
  repeatTrendMonthly: { id: string; label: string; rate: number }[];
  /** A 0..1 follow streak score for the last 7 days. */
  followStreakDays: number;
}

/**
 * @param refDate 集計の基準日。省略時は「今」(mock は MOCK_TODAY / real は new Date)。
 *   過去月を表示する場合はその月の月末を渡すことで、当月分を丸ごと集計できる。
 */
export async function getCastStatsData(
  castId: string,
  refDate?: Date,
): Promise<CastStatsData> {
  return withFallback(
    "getCastStatsData",
    () => getCastStatsDataReal(castId, CURRENT_STORE_ID, refDate),
    () => getCastStatsDataMock(castId, refDate),
  );
}

async function getCastStatsDataMock(
  castId: string,
  refDate?: Date,
): Promise<CastStatsData> {
  const cast = mockCasts.find((c) => c.id === castId);
  if (!cast) throw new Error(`Cast not found: ${castId}`);

  // Pick the matching column from the store-side trend fixtures.
  // あかり→cast1, ゆき→cast2 column, others fallback to cast2.
  const trendKey: "cast1" | "cast2" = castId === "cast1" ? "cast1" : "cast2";
  const repeatTrend = MOCK_REPEAT_TREND.map((p) => ({
    week: p.week,
    label: p.label,
    rate: p[trendKey],
  }));
  const goal = await getCastGoal(castId);
  const targets = {
    salesGoal: goal.salesGoal,
    douhanGoal: goal.douhanGoal,
  };

  // Mock follow streak — generated from MOCK_FOLLOW_RATE
  const followRate = MOCK_FOLLOW_RATE[castId] ?? 0;
  const followStreakDays = Math.round(followRate * 7);

  // Customers
  const myCustomers = mockCustomers.filter((c) => c.cast_id === castId);
  const myCustomerIds = myCustomers.map((c) => c.id);
  const now = refDate ?? MOCK_TODAY;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthNewCount = myCustomers.filter(
    (c) => new Date(c.created_at) >= monthStart,
  ).length;

  // Yearly stats
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearNewCount = myCustomers.filter(
    (c) => new Date(c.created_at) >= yearStart,
  ).length;
  const yearDouhans = mockDouhans.filter(
    (d) => d.cast_id === castId && new Date(d.date) >= yearStart && d.status === "completed",
  ).length;

  const monthDouhansCompleted = mockDouhans.filter(
    (d) =>
      d.cast_id === castId &&
      new Date(d.date) >= monthStart &&
      new Date(d.date) <= now &&
      d.status === "completed",
  ).length;

  return {
    cast,
    monthly: {
      // visits.sales_amount からの実集計（静的 monthly_sales は使わない）
      sales: monthlySales(mockVisits, castId, now),
      repeatRate: monthlyRepeatRate(mockVisits, castId, myCustomerIds, now),
      followRate,
      newCustomerCount: monthNewCount,
      totalCustomerCount: myCustomers.length,
      douhanCount: monthDouhansCompleted,
    },
    yearly: {
      sales: yearlySales(mockVisits, castId, now),
      repeatRate: yearlyRepeatRate(mockVisits, castId, myCustomerIds, now),
      newCustomerCount: yearNewCount,
      douhanCount: yearDouhans,
    },
    targets,
    repeatTrend,
    repeatTrendMonthly: buildMonthlyRepeatTrend(
      mockVisits,
      castId,
      myCustomerIds,
      now,
      6,
    ),
    followStreakDays,
  };
}

/**
 * Returns visits for a cast that happened after `sinceIso`.
 * Used by the cast home polling notification widget.
 */
export async function getRecentVisitsForCast(
  castId: string,
  sinceIso: string,
): Promise<Visit[]> {
  return withFallback(
    "getRecentVisitsForCast",
    () => getRecentVisitsForCastReal(castId, sinceIso),
    () => getRecentVisitsForCastMock(castId, sinceIso),
  );
}

function getRecentVisitsForCastMock(
  castId: string,
  sinceIso: string,
): Visit[] {
  const since = new Date(sinceIso).getTime();
  return mockVisits
    .filter((v) => v.cast_id === castId && new Date(v.visited_at).getTime() > since)
    .sort(
      (a, b) =>
        new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime(),
    );
}

function getCastHomeDataMock(castId: string): CastHomeData {
  const cast = mockCasts.find((c) => c.id === castId);
  if (!cast) {
    throw new Error(`Cast not found: ${castId}`);
  }

  const myCustomers = mockCustomers.filter((c) => c.cast_id === castId);
  const myVisits = mockVisits.filter((v) => v.cast_id === castId);
  const myBottles = mockBottles.filter((b) =>
    myCustomers.some((c) => c.id === b.customer_id),
  );
  const myMemos = mockCastMemos.filter((m) => m.cast_id === castId);

  const targets = selectFollowTargets({
    customers: myCustomers,
    visits: myVisits,
    bottles: myBottles,
    memos: myMemos,
    today: MOCK_TODAY,
  });

  // Count new customers this month
  const now = MOCK_TODAY;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newCustomerCount = myCustomers.filter(
    (c) => new Date(c.created_at) >= monthStart,
  ).length;

  // Count douhans this month (club mode)
  const monthDouhans = mockDouhans.filter(
    (d) =>
      d.cast_id === castId &&
      new Date(d.date) >= monthStart &&
      new Date(d.date) <= now,
  );

  return {
    cast,
    summary: {
      nominationCount: cast.nomination_count,
      repeatRate: cast.repeat_rate,
      followTargetCount: targets.length,
      monthlySales: cast.monthly_sales,
      newCustomerCount,
      douhanCount: monthDouhans.filter((d) => d.status === "completed").length,
      douhanGoal: 8,
    },
    targets,
  };
}

function getCustomerContextMock(
  castId: string,
  customerId: string,
): CustomerContext | null {
  // Cast can read any customer they share visibility with — not just
  // direct cast_id matches. The customer list shows master + assigned
  // customers, so detail must allow both.
  const customer = mockCustomers.find((c) => c.id === customerId);
  if (!customer) return null;
  const memo =
    mockCastMemos.find(
      (m) => m.customer_id === customerId && m.cast_id === castId,
    ) ?? null;
  const bottles: Bottle[] = mockBottles.filter(
    (b) => b.customer_id === customerId,
  );
  const visits = mockVisits
    .filter((v) => v.customer_id === customerId)
    .sort(
      (a, b) =>
        new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime(),
    );
  return { customer, memo, bottles, visits };
}

// ═══════════════ Douhan (同伴) ═══════════════

export async function getDouhanSummary(
  castId: string,
): Promise<import("@/types/nightos").DouhanSummary> {
  return withFallback(
    "getDouhanSummary",
    () => getDouhanSummaryReal(castId, new Date()),
    () => getDouhanSummaryMock(castId),
  );
}

function getDouhanSummaryMock(
  castId: string,
): import("@/types/nightos").DouhanSummary {
  const now = MOCK_TODAY;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const thisMonthDouhans = mockDouhans.filter(
    (d) =>
      d.cast_id === castId &&
      new Date(d.date) >= monthStart &&
      new Date(d.date) <= monthEnd,
  );

  return {
    monthlyCount: thisMonthDouhans.filter((d) => d.status === "completed").length,
    monthlyGoal: 8,
    thisMonthDouhans,
  };
}

// ═══════════════ Store → Cast messaging ═══════════════

export async function sendCastMessage(args: {
  castId: string;
  message: string;
}): Promise<StoreToCastMessage> {
  return withFallback(
    "sendCastMessage",
    () => sendCastMessageReal(args),
    () => {
      const msg: StoreToCastMessage = {
        id: `msg_${Date.now()}`,
        cast_id: args.castId,
        message: args.message,
        sent_at: new Date().toISOString(),
        read: false,
      };
      mockCastMessages.push(msg);
      return msg;
    },
  );
}

export async function getUnreadCastMessages(
  castId: string,
): Promise<StoreToCastMessage[]> {
  return withFallback(
    "getUnreadCastMessages",
    () => getUnreadCastMessagesReal(castId),
    () =>
      mockCastMessages
        .filter((m) => m.cast_id === castId && !m.read)
        .sort(
          (a, b) =>
            new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime(),
        ),
  );
}

export async function markCastMessageRead(id: string): Promise<void> {
  await withFallback(
    "markCastMessageRead",
    () => markCastMessageReadReal(id),
    () => {
      const msg = mockCastMessages.find((m) => m.id === id);
      if (msg) msg.read = true;
    },
  );
}

// ═══════════════ Customer (来店客) queries ═══════════════

import type {
  Coupon,
  CustomerBottleView,
  CustomerRank,
  CustomerStoreOverview,
  RankTier,
} from "@/types/nightos";
import { mockCoupons } from "./mock-data";

const RANK_TIERS: {
  tier: RankTier;
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

function computeCustomerRank(visitCount: number): CustomerRank {
  let currentIdx = RANK_TIERS.length - 1;
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (visitCount >= RANK_TIERS[i].minVisits) {
      currentIdx = i;
      break;
    }
  }
  const current = RANK_TIERS[currentIdx];
  const next = currentIdx > 0 ? RANK_TIERS[currentIdx - 1] : null;
  const visitsToNext = next ? next.minVisits - visitCount : 0;
  const rangeStart = current.minVisits;
  const rangeEnd = next ? next.minVisits : current.minVisits + 10;
  const progress =
    rangeEnd > rangeStart
      ? Math.min(1, (visitCount - rangeStart) / (rangeEnd - rangeStart))
      : 1;

  return {
    tier: current.tier,
    label: current.label,
    emoji: current.emoji,
    visitCount,
    nextTierLabel: next ? next.label : null,
    visitsToNextTier: Math.max(0, visitsToNext),
    progress,
  };
}

export async function getCustomerStoreOverviews(
  customerId: string,
): Promise<CustomerStoreOverview[]> {
  return withFallback(
    "getCustomerStoreOverviews",
    () => getCustomerStoreOverviewsReal(customerId),
    () => getCustomerStoreOverviewsMock(customerId),
  );
}

function getCustomerStoreOverviewsMock(
  customerId: string,
): CustomerStoreOverview[] {
  // For MVP: aggregate from mock data. One overview per store the customer has bottles at.
  const customerBottles = mockBottles.filter(
    (b) => b.customer_id === customerId,
  );
  const customerVisits = mockVisits.filter(
    (v) => v.customer_id === customerId,
  );

  const storeIdSet = new Set([
    ...customerBottles.map((b) => b.store_id),
    ...customerVisits.map((v) => v.store_id),
  ]);
  const storeIds = Array.from(storeIdSet);

  const overviews: CustomerStoreOverview[] = [];
  for (const storeId of storeIds) {
    const store = mockStores.find((s) => s.id === storeId);
    const bottles = customerBottles.filter((b) => b.store_id === storeId);
    const visits = customerVisits
      .filter((v) => v.store_id === storeId)
      .sort(
        (a, b) =>
          new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime(),
      );
    const nominatedVisits = visits.filter((v) => v.is_nominated);
    const castId = nominatedVisits[0]?.cast_id;
    const cast = castId ? mockCasts.find((c) => c.id === castId) : null;

    const storeCoupons = mockCoupons.filter(
      (c) => c.customer_id === customerId && c.store_id === storeId,
    );

    overviews.push({
      store_id: storeId,
      store_name: store?.name ?? "（不明）",
      visit_count: visits.length,
      total_spent_estimate:
        visits.length *
        (mockCustomers.find((c) => c.id === customerId)?.category === "vip"
          ? 40_000
          : 22_000),
      bottles,
      nomination_cast: cast?.name ?? null,
      nomination_cast_id: castId ?? null,
      last_visit: visits[0]?.visited_at ?? null,
      coupons: storeCoupons,
      rank: computeCustomerRank(visits.length),
    });
  }
  return overviews;
}

export async function getCustomerBottleViews(
  customerId: string,
): Promise<CustomerBottleView[]> {
  return withFallback(
    "getCustomerBottleViews",
    () => getCustomerBottleViewsReal(customerId),
    () => {
      const bottles = mockBottles.filter((b) => b.customer_id === customerId);
      return bottles.map((bottle) => {
        const store = mockStores.find((s) => s.id === bottle.store_id);
        const customer = mockCustomers.find((c) => c.id === customerId);
        const cast = customer
          ? mockCasts.find((c) => c.id === customer.cast_id)
          : null;
        return {
          bottle,
          store_name: store?.name ?? "（不明）",
          cast_name: cast?.name ?? null,
        };
      });
    },
  );
}

export async function getCustomerCoupons(
  customerId: string,
): Promise<Coupon[]> {
  return withFallback(
    "getCustomerCoupons",
    () => getCustomerCouponsReal(customerId),
    () =>
      mockCoupons
        .filter((c) => c.customer_id === customerId)
        .sort((a, b) => {
          if (!a.used_at && b.used_at) return -1;
          if (a.used_at && !b.used_at) return 1;
          return (
            new Date(b.valid_until).getTime() -
            new Date(a.valid_until).getTime()
          );
        }),
  );
}

// ═══════════════ Cast → Store requests ═══════════════

import { mockCastRequests, type CastToStoreRequest } from "./mock-data";

export async function sendCastRequest(args: {
  castId: string;
  castName: string;
  message: string;
}): Promise<CastToStoreRequest> {
  return withFallback(
    "sendCastRequest",
    () => sendCastRequestReal(args),
    () => {
      const req: CastToStoreRequest = {
        id: `req_${Date.now()}`,
        cast_id: args.castId,
        cast_name: args.castName,
        message: args.message,
        sent_at: new Date().toISOString(),
        resolved: false,
      };
      mockCastRequests.push(req);
      return req;
    },
  );
}

export async function getUnresolvedCastRequests(): Promise<CastToStoreRequest[]> {
  return withFallback(
    "getUnresolvedCastRequests",
    () => getUnresolvedCastRequestsReal(),
    () =>
      mockCastRequests
        .filter((r) => !r.resolved)
        .sort(
          (a, b) =>
            new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime(),
        ),
  );
}

export async function resolveCastRequest(id: string): Promise<void> {
  await withFallback(
    "resolveCastRequest",
    () => resolveCastRequestReal(id),
    () => {
      const req = mockCastRequests.find((r) => r.id === id);
      if (req) req.resolved = true;
    },
  );
}
