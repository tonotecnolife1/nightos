import type { Cast, Customer, CustomerReferralNode, CustomerFunnelStats, Visit } from "@/types/nightos";

// ═══════════════ Cast-based tree ═══════════════

/**
 * キャストベースのツリーノード。
 * 管理者（ママ/姉さん）→ キャスト → 顧客 の3階層。
 * バケットは「担当 (assigned)」と「ヘルプ (help)」の2種。
 * ヘルプは来店履歴 (visits) 由来で、1顧客が複数ヘルプ配下に現れうる（多対多）。
 */
export interface CastBucketNode {
  cast: Cast | null; // null = 担当者未割り当て
  kind: "assigned" | "help";
  customers: Customer[];
}

export interface CastBasedNode {
  manager: Cast | null; // null = 管理者未割り当て
  byCast: CastBucketNode[];
  totalCustomers: number;
}

/**
 * 顧客データを「管理者→キャスト→顧客」の3階層にまとめる。
 *
 * visits を渡すと、各管理者ブロック内に「ヘルプ」バケットを追加する：
 * その管理者の顧客に、マスターでも担当でもないキャストが来店で入った実績を
 * 接客者ごとに束ねる（同じ顧客が複数ヘルプ配下に出現しうる）。
 */
export function buildCastBasedTree(args: {
  customers: Customer[];
  casts: Cast[];
  visits?: Visit[];
}): CastBasedNode[] {
  const { customers, casts, visits } = args;
  const castById = new Map(casts.map((c) => [c.id, c]));

  const byManager = new Map<string | null, Customer[]>();
  for (const c of customers) {
    const key = c.manager_cast_id ?? null;
    const list = byManager.get(key) ?? [];
    list.push(c);
    byManager.set(key, list);
  }

  // customer_id → そのお客様の全来店（ヘルプ導出用）
  const visitsByCustomer = new Map<string, Visit[]>();
  if (visits) {
    for (const v of visits) {
      const list = visitsByCustomer.get(v.customer_id) ?? [];
      list.push(v);
      visitsByCustomer.set(v.customer_id, list);
    }
  }

  const nodes: CastBasedNode[] = [];
  for (const [managerId, managerCustomers] of Array.from(byManager.entries())) {
    const manager = managerId ? (castById.get(managerId) ?? null) : null;

    // ── 担当バケット ──
    const byCast = new Map<string | null, Customer[]>();
    for (const c of managerCustomers) {
      const castKey = c.cast_id ?? null;
      const list = byCast.get(castKey) ?? [];
      list.push(c);
      byCast.set(castKey, list);
    }

    const byCastArray: CastBucketNode[] = [];
    for (const [castId, custs] of Array.from(byCast.entries())) {
      byCastArray.push({
        cast: castId ? (castById.get(castId) ?? null) : null,
        kind: "assigned",
        customers: custs,
      });
    }

    // ── ヘルプバケット（visits 由来・多対多） ──
    if (visits) {
      const helpByCast = new Map<string, Map<string, Customer>>();
      for (const c of managerCustomers) {
        for (const v of visitsByCustomer.get(c.id) ?? []) {
          // マスター・担当の接客はヘルプではない
          if (v.cast_id === managerId) continue;
          if (v.cast_id === c.cast_id) continue;
          if (!castById.has(v.cast_id)) continue;
          const bucket = helpByCast.get(v.cast_id) ?? new Map<string, Customer>();
          bucket.set(c.id, c);
          helpByCast.set(v.cast_id, bucket);
        }
      }
      for (const [castId, custMap] of Array.from(helpByCast.entries())) {
        byCastArray.push({
          cast: castById.get(castId) ?? null,
          kind: "help",
          customers: Array.from(custMap.values()),
        });
      }
    }

    // 担当 → ヘルプ の順、各種内は名前順
    byCastArray.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "assigned" ? -1 : 1;
      return (a.cast?.name ?? "zzz").localeCompare(b.cast?.name ?? "zzz");
    });

    nodes.push({
      manager,
      byCast: byCastArray,
      totalCustomers: managerCustomers.length,
    });
  }

  nodes.sort((a, b) => {
    if (!a.manager && b.manager) return 1;
    if (a.manager && !b.manager) return -1;
    return (a.manager?.name ?? "").localeCompare(b.manager?.name ?? "");
  });

  return nodes;
}

/**
 * 顧客の紹介ツリーを構築する。
 * ルート = referred_by_customer_id が null の顧客。
 * 子 = その紹介元顧客の紹介で来た顧客たち（再帰）。
 */
export function buildReferralTree(args: {
  customers: Customer[];
  casts: Cast[];
}): CustomerReferralNode[] {
  const { customers, casts } = args;
  const castMap = new Map(casts.map((c) => [c.id, c]));

  // customer_id → Customer のマップ
  const byId = new Map(customers.map((c) => [c.id, c]));

  // referrer_id → children のマップ
  const childrenMap = new Map<string | null, Customer[]>();
  for (const c of customers) {
    const key = c.referred_by_customer_id ?? null;
    const list = childrenMap.get(key) ?? [];
    list.push(c);
    childrenMap.set(key, list);
  }

  // Roots = referred_by が null or 存在しない顧客を指している
  const roots = customers.filter(
    (c) =>
      !c.referred_by_customer_id ||
      !byId.has(c.referred_by_customer_id),
  );

  const build = (cust: Customer, depth: number): CustomerReferralNode => {
    const children = (childrenMap.get(cust.id) ?? []).map((child) =>
      build(child, depth + 1),
    );
    const cast = castMap.get(cust.cast_id);
    return {
      customer: cust,
      assignedCastName: cast?.name ?? null,
      depth,
      children,
    };
  };

  return roots.map((r) => build(r, 0));
}

/**
 * ある顧客が紹介した（ツリー下に持つ）顧客の総数を返す。
 */
export function countReferrals(node: CustomerReferralNode): number {
  return (
    node.children.length +
    node.children.reduce((sum, c) => sum + countReferrals(c), 0)
  );
}

/**
 * 顧客全体 or 特定キャスト担当顧客でファネル集計。
 */
export function calculateFunnelStats(customers: Customer[]): CustomerFunnelStats {
  const storeOnly = customers.filter((c) => c.funnel_stage === "store_only").length;
  const assigned = customers.filter((c) => c.funnel_stage === "assigned").length;
  const lineExchanged = customers.filter(
    (c) => c.funnel_stage === "line_exchanged",
  ).length;
  const total = storeOnly + assigned + lineExchanged;

  const assignedPlusLine = assigned + lineExchanged;
  return {
    storeOnly,
    assigned,
    lineExchanged,
    total,
    assignedRate: total === 0 ? 0 : assignedPlusLine / total,
    lineExchangedRate:
      assignedPlusLine === 0 ? 0 : lineExchanged / assignedPlusLine,
  };
}

/**
 * キャスト別にファネル集計して返す。ダッシュボード用。
 */
export function calculateFunnelByCast(args: {
  customers: Customer[];
  casts: Cast[];
}): Array<{ cast: Cast; stats: CustomerFunnelStats }> {
  const { customers, casts } = args;
  return casts.map((cast) => {
    const assigned = customers.filter(
      (c) =>
        c.cast_id === cast.id ||
        c.line_exchanged_cast_id === cast.id,
    );
    return {
      cast,
      stats: calculateFunnelStats(assigned),
    };
  });
}
