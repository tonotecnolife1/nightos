"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HandHelping, Loader2, UserPlus } from "lucide-react";
import type { Cast, Customer, Visit } from "@/types/nightos";
import { Card } from "@/components/nightos/card";
import { CustomerFilterBar } from "./customer-filter-bar";
import {
  CustomerViewToggle,
  type CustomerView,
} from "./customer-view-toggle";
import { CustomerPriorityList } from "./customer-priority-list";
import { SORT_OPTIONS, type SortKey } from "../lib/enrich";
import { CustomerMapView } from "@/features/customer-map/components/customer-map-view";
import {
  applyCustomerFilters,
  DEFAULT_CUSTOMER_FILTERS,
  loadFilters,
  saveFilters,
  type CustomerFilters,
} from "@/lib/nightos/customer-filters";
import { cn } from "@/lib/utils";

const LS_VIEW = "nightos.customers.grouping";
const LS_FILTERS = "nightos.customers.filters";
const LS_SORT = "nightos.customers.sort";

interface Props {
  castId: string;
  allCasts: Cast[];
  allMyCustomers: Customer[];
  helpCustomers?: Customer[];
  visits?: Visit[];
}

export function CustomerPageShell({
  castId,
  allCasts,
  allMyCustomers,
  helpCustomers = [],
  visits = [],
}: Props) {
  const router = useRouter();
  const [navigating, startNavigation] = useTransition();
  const [view, setView] = useState<CustomerView>("priority");
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [filters, setFilters] = useState<CustomerFilters>(
    DEFAULT_CUSTOMER_FILTERS,
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const g = localStorage.getItem(LS_VIEW);
      if (g === "customer" || g === "cast" || g === "priority") setView(g);
      const s = localStorage.getItem(LS_SORT);
      if (
        s === "priority" ||
        s === "daysSince" ||
        s === "visitCount" ||
        s === "recentVisits" ||
        s === "name"
      )
        setSortKey(s);
    } catch {}
    setFilters(loadFilters(LS_FILTERS));
    setLoaded(true);
    // 「新規」ボタンの遷移先を先読みして体感速度を確保（Link の prefetch 相当）
    router.prefetch("/cast/customers/new");
  }, [router]);

  const updateView = (g: CustomerView) => {
    setView(g);
    try {
      localStorage.setItem(LS_VIEW, g);
    } catch {}
  };
  const updateSort = (s: SortKey) => {
    setSortKey(s);
    try {
      localStorage.setItem(LS_SORT, s);
    } catch {}
  };
  const updateFilters = (next: CustomerFilters) => {
    setFilters(next);
    saveFilters(LS_FILTERS, next);
  };

  const managerOptions = useMemo(
    () => allCasts,
    [allCasts],
  );

  const filteredMyCustomers = useMemo(
    () => applyCustomerFilters(allMyCustomers, filters),
    [allMyCustomers, filters],
  );

  const filteredHelpCustomers = useMemo(
    () => applyCustomerFilters(helpCustomers, filters),
    [helpCustomers, filters],
  );

  if (!loaded) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <CustomerViewToggle
          value={view}
          onChange={updateView}
          showHelp={helpCustomers.length > 0}
        />
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
        totalCount={allMyCustomers.length}
        filteredCount={filteredMyCustomers.length}
      />

      {view === "priority" && (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => updateSort(o.value)}
              className={cn(
                "shrink-0 h-7 px-3 rounded-pill text-[11px] font-medium whitespace-nowrap transition active:scale-95",
                sortKey === o.value
                  ? "bg-wine-deep text-pearl-light"
                  : "bg-pearl-warm text-ink-soft border border-pearl-soft",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      {filteredMyCustomers.length === 0 ? (
        <Card className="p-8 text-center text-body-sm text-ink-soft">
          該当する顧客が見つかりません
        </Card>
      ) : view === "priority" ? (
        <CustomerPriorityList
          castId={castId}
          customers={filteredMyCustomers}
          visits={visits}
          sortKey={sortKey}
        />
      ) : (
        <CustomerMapView
          customers={filteredMyCustomers}
          casts={allCasts}
          mode={view}
        />
      )}

      {helpCustomers.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-ink/[0.06]">
          <div className="flex items-center gap-1.5 px-1">
            <HandHelping size={13} className="text-champagne-dark" />
            <h3 className="text-label-md text-ink-soft font-medium">
              ヘルプで入ったお客様
            </h3>
            <span className="text-[10px] text-ink-mute ml-auto">
              {filteredHelpCustomers.length}人
            </span>
          </div>
          {filteredHelpCustomers.length === 0 ? (
            <Card className="p-6 text-center text-body-sm text-ink-mute">
              該当する顧客が見つかりません
            </Card>
          ) : view === "priority" ? (
            <CustomerPriorityList
              castId={castId}
              customers={filteredHelpCustomers}
              visits={visits}
              sortKey={sortKey}
            />
          ) : (
            <CustomerMapView
              customers={filteredHelpCustomers}
              casts={allCasts}
              mode={view}
            />
          )}
        </div>
      )}
    </div>
  );
}
