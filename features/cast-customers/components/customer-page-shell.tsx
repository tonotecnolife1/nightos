"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import type { Cast, Customer } from "@/types/nightos";
import { Card } from "@/components/nightos/card";
import { CustomerFilterBar } from "./customer-filter-bar";
import { CustomerMapView } from "@/features/customer-map/components/customer-map-view";
import {
  CustomerScopeToggle,
  type CustomerScope,
} from "./customer-scope-toggle";
import { loadPriorities, setPriority } from "../lib/priority-store";
import {
  applyCustomerFilters,
  DEFAULT_CUSTOMER_FILTERS,
  loadFilters,
  saveFilters,
  type CustomerFilters,
} from "@/lib/nightos/customer-filters";

const LS_SCOPE = "nightos.customers.scope";
const LS_FILTERS = "nightos.customers.filters";

interface Props {
  castId: string;
  allCasts: Cast[];
  allMyCustomers: Customer[];
  helpCustomers?: Customer[];
  /** 登録直後の遷移などで初期表示するビュー。localStorage より優先する。 */
  initialScope?: CustomerScope;
}

export function CustomerPageShell({
  castId,
  allCasts,
  allMyCustomers,
  helpCustomers = [],
  initialScope,
}: Props) {
  const router = useRouter();
  const [navigating, startNavigation] = useTransition();
  // ヘルプ顧客が居ない（キャバ等）のに help 指定が来た場合は担当へフォールバック。
  const resolvedInitialScope: CustomerScope | undefined =
    initialScope === "help" && helpCustomers.length === 0
      ? "tantou"
      : initialScope;
  const [scope, setScope] = useState<CustomerScope>(
    resolvedInitialScope ?? "tantou",
  );
  const [filters, setFilters] = useState<CustomerFilters>(
    DEFAULT_CUSTOMER_FILTERS,
  );
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (resolvedInitialScope) {
      // 明示指定（登録直後の遷移など）を優先し、次回の手動表示にも残す。
      setScope(resolvedInitialScope);
      try {
        localStorage.setItem(LS_SCOPE, resolvedInitialScope);
      } catch {}
    } else {
      try {
        const s = localStorage.getItem(LS_SCOPE);
        if (s === "tantou" || s === "help") setScope(s);
      } catch {}
    }
    setFilters(loadFilters(LS_FILTERS));
    setStarred(new Set(Object.keys(loadPriorities(castId))));
    setLoaded(true);
    // 「新規」ボタンの遷移先を先読みして体感速度を確保（Link の prefetch 相当）
    router.prefetch("/cast/customers/new");
  }, [router, castId, resolvedInitialScope]);

  const updateScope = (s: CustomerScope) => {
    setScope(s);
    try {
      localStorage.setItem(LS_SCOPE, s);
    } catch {}
  };
  const updateFilters = (next: CustomerFilters) => {
    setFilters(next);
    saveFilters(LS_FILTERS, next);
  };

  // 星のオン/オフ。priority-store を「星 = 優先度1 / なし = 0」として流用し
  // キャストごとに localStorage 保存する。
  const toggleStar = (customerId: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(customerId)) {
        next.delete(customerId);
        setPriority(castId, customerId, 0);
      } else {
        next.add(customerId);
        setPriority(castId, customerId, 1);
      }
      return next;
    });
  };

  const managerOptions = useMemo(() => allCasts, [allCasts]);

  const filteredMyCustomers = useMemo(
    () => applyCustomerFilters(allMyCustomers, filters),
    [allMyCustomers, filters],
  );

  const filteredHelpCustomers = useMemo(
    () => applyCustomerFilters(helpCustomers, filters),
    [helpCustomers, filters],
  );

  // 担当: 自分の担当顧客を紹介チェーンで表示。
  // ヘルプ: ヘルプで入った顧客を担当キャスト別にグルーピングして表示。
  const isHelp = scope === "help";
  const activeCustomers = isHelp ? filteredHelpCustomers : filteredMyCustomers;
  const activeTotal = isHelp ? helpCustomers.length : allMyCustomers.length;
  const activeMode = isHelp ? "cast" : "customer";

  if (!loaded) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <CustomerScopeToggle value={scope} onChange={updateScope} />
        <button
          type="button"
          onClick={() => startNavigation(() => router.push("/cast/customers/new"))}
          disabled={navigating}
          aria-busy={navigating}
          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-[linear-gradient(135deg,#eccd8b_0%,#c9a45c_100%)] text-[#3a241c] text-[12px] font-semibold shadow-[0_6px_16px_-6px_rgba(201,164,92,0.7)] active:scale-95 transition-transform disabled:opacity-80 disabled:active:scale-100"
        >
          {navigating ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              開いています…
            </>
          ) : (
            <>
              <UserPlus size={14} />
              新規
            </>
          )}
        </button>
      </div>

      <CustomerFilterBar
        filters={filters}
        onChange={updateFilters}
        managerOptions={managerOptions}
        castOptions={allCasts}
        totalCount={activeTotal}
        filteredCount={activeCustomers.length}
      />

      {activeCustomers.length === 0 ? (
        <Card className="p-8 text-center text-body-sm text-ink-soft">
          {isHelp
            ? "ヘルプで入ったお客様はいません"
            : "該当する顧客が見つかりません"}
        </Card>
      ) : (
        <CustomerMapView
          customers={activeCustomers}
          casts={allCasts}
          mode={activeMode}
          starredIds={starred}
          onToggleStar={toggleStar}
        />
      )}
    </div>
  );
}
