import type { Cast, Customer, Visit } from "@/types/nightos";

export interface HelpVisitEntry {
  visit: Visit;
  customer: Customer;
  /** この顧客のマスター（管理者）の名前。null = 管理者なし */
  masterName: string | null;
  masterCastId: string | null;
}

export interface MasterHelpSplit {
  /** 自分がマスター（manager_cast_id === castId）の顧客 */
  masterCustomers: Customer[];
  /**
   * 自分が担当（cast_id === castId）だがマスターは他の姉さん/ママ。
   * 「他姉さん管理だが日常は私が接客」するケース。
   */
  assignedByOtherMaster: Array<{
    customer: Customer;
    masterName: string | null;
    masterCastId: string | null;
  }>;
  /**
   * 他のマスターの顧客に自分がヘルプで入った実績。
   * visit.cast_id === castId AND customer.manager_cast_id !== castId
   * AND customer.cast_id !== castId（= 一時的なヘルプ）
   */
  helpVisits: HelpVisitEntry[];
}

/**
 * ある姉さん/キャストの顧客接客を
 * 「自分のマスター顧客」と「他姉さん管理顧客へのヘルプ実績」に分離する。
 */
export function splitMasterAndHelp(args: {
  castId: string;
  customers: Customer[];
  visits: Visit[];
  allCasts: Cast[];
}): MasterHelpSplit {
  const { castId, customers, visits, allCasts } = args;
  const castById = new Map(allCasts.map((c) => [c.id, c]));
  const customerById = new Map(customers.map((c) => [c.id, c]));

  const masterCustomers = customers.filter(
    (c) => c.manager_cast_id === castId,
  );

  // 担当だがマスターは他（cast_id === me AND manager_cast_id !== me）
  const assignedByOtherMaster = customers
    .filter(
      (c) => c.cast_id === castId && c.manager_cast_id !== castId,
    )
    .map((customer) => {
      const masterCastId = customer.manager_cast_id ?? null;
      const masterName = masterCastId
        ? (castById.get(masterCastId)?.name ?? null)
        : null;
      return { customer, masterName, masterCastId };
    });

  const assignedCustomerIds = new Set(assignedByOtherMaster.map((a) => a.customer.id));

  const helpVisits: HelpVisitEntry[] = [];
  for (const v of visits) {
    if (v.cast_id !== castId) continue;
    const customer = customerById.get(v.customer_id);
    if (!customer) continue;
    // Skip if this is already a master customer or an assigned customer
    if (customer.manager_cast_id === castId) continue;
    if (assignedCustomerIds.has(customer.id)) continue;
    const masterCastId = customer.manager_cast_id ?? null;
    const masterName = masterCastId
      ? (castById.get(masterCastId)?.name ?? null)
      : null;
    helpVisits.push({ visit: v, customer, masterName, masterCastId });
  }

  helpVisits.sort(
    (a, b) =>
      new Date(b.visit.visited_at).getTime() -
      new Date(a.visit.visited_at).getTime(),
  );

  return { masterCustomers, assignedByOtherMaster, helpVisits };
}

/**
 * ヘルプ実績を顧客単位に集約（同じ顧客への複数来店をまとめる）。
 * UI で「〇〇さま 2回ヘルプ」のように集約表示したい時に使う。
 */
export interface HelpSummaryEntry {
  customer: Customer;
  masterName: string | null;
  masterCastId: string | null;
  visitCount: number;
  lastVisitedAt: string; // ISO
}

export function aggregateHelpVisitsByCustomer(
  entries: HelpVisitEntry[],
): HelpSummaryEntry[] {
  const byCustomer = new Map<string, HelpSummaryEntry>();
  for (const e of entries) {
    const existing = byCustomer.get(e.customer.id);
    if (existing) {
      existing.visitCount += 1;
      if (e.visit.visited_at > existing.lastVisitedAt) {
        existing.lastVisitedAt = e.visit.visited_at;
      }
    } else {
      byCustomer.set(e.customer.id, {
        customer: e.customer,
        masterName: e.masterName,
        masterCastId: e.masterCastId,
        visitCount: 1,
        lastVisitedAt: e.visit.visited_at,
      });
    }
  }
  return Array.from(byCustomer.values()).sort(
    (a, b) => b.lastVisitedAt.localeCompare(a.lastVisitedAt),
  );
}

/**
 * 1顧客に入った1人のヘルプの集計。
 * 「歴代ヘルプ」= マスターでも主要担当でもないキャストの来店。
 */
export interface HelpCastTally {
  cast: Cast;
  visitCount: number;
  firstHelpedAt: string; // ISO
  lastHelpedAt: string; // ISO
}

/** ある顧客の「歴代ヘルプ」名簿（複数キャストが時系列で入りうる）。 */
export interface CustomerHelpRoster {
  customer: Customer;
  masterCastId: string | null;
  masterName: string | null;
  /** lastHelpedAt 降順。同顧客に入った全ヘルプ。 */
  helps: HelpCastTally[];
}

/**
 * ある顧客に入った歴代ヘルプを接客者ごとに集約する。
 *
 * help = `visit.cast_id` が「その顧客のマスターでも主要担当でもない」来店。
 * 「初回はキャストA、2回目はキャストB」のように来店ごとに入れ替わっても、
 * その全員が `helps` に並ぶ（多対多）。
 */
export function aggregateHelpCastsByCustomer(args: {
  customer: Customer;
  visits: Visit[];
  allCasts: Cast[];
}): CustomerHelpRoster {
  const { customer, visits, allCasts } = args;
  const castById = new Map(allCasts.map((c) => [c.id, c]));
  const masterCastId = customer.manager_cast_id ?? null;
  const masterName = masterCastId
    ? (castById.get(masterCastId)?.name ?? null)
    : null;

  const tallyByCast = new Map<string, HelpCastTally>();
  for (const v of visits) {
    if (v.customer_id !== customer.id) continue;
    // マスター・主要担当の接客はヘルプではない
    if (v.cast_id === masterCastId) continue;
    if (v.cast_id === customer.cast_id) continue;
    const cast = castById.get(v.cast_id);
    if (!cast) continue;

    const existing = tallyByCast.get(v.cast_id);
    if (existing) {
      existing.visitCount += 1;
      if (v.visited_at > existing.lastHelpedAt) existing.lastHelpedAt = v.visited_at;
      if (v.visited_at < existing.firstHelpedAt) existing.firstHelpedAt = v.visited_at;
    } else {
      tallyByCast.set(v.cast_id, {
        cast,
        visitCount: 1,
        firstHelpedAt: v.visited_at,
        lastHelpedAt: v.visited_at,
      });
    }
  }

  const helps = Array.from(tallyByCast.values()).sort((a, b) =>
    b.lastHelpedAt.localeCompare(a.lastHelpedAt),
  );

  return { customer, masterCastId, masterName, helps };
}

/**
 * 指定期間でヘルプ実績を絞り込む。デフォルトは今月。
 */
export function filterHelpVisitsByPeriod(
  entries: HelpVisitEntry[],
  options: { fromIso?: string; toIso?: string; thisMonth?: boolean; today?: Date } = {},
): HelpVisitEntry[] {
  let fromIso = options.fromIso;
  let toIso = options.toIso;
  if (options.thisMonth) {
    const d = options.today ?? new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    fromIso = start.toISOString();
    toIso = end.toISOString();
  }
  return entries.filter((e) => {
    if (fromIso && e.visit.visited_at < fromIso) return false;
    if (toIso && e.visit.visited_at > toIso) return false;
    return true;
  });
}
