"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HandHelping, UserPlus } from "lucide-react";
import type { Cast, Customer } from "@/types/nightos";
import { Card } from "@/components/nightos/card";
import { CustomerFilterBar } from "./customer-filter-bar";
import { CustomerMapView } from "@/features/customer-map/components/customer-map-view";
import {
  ViewGroupingToggle,
  type ViewGrouping,
} from "@/features/mama-home/components/view-grouping-toggle";
import {
  applyCustomerFilters,
  DEFAULT_CUSTOMER_FILTERS,
  loadFilters,
  saveFilters,
  type CustomerFilters,
} from "@/lib/nightos/customer-filters";

const LS_GROUPING = "nightos.customers.grouping";
const LS_FILTERS = "nightos.customers.filters";

interface Props {
  allCasts: Cast[];
  allMyCustomers: Customer[];
  helpCustomers?: Customer[];
}

export function CustomerPageShell({ allCasts, allMyCustomers, helpCustomers = [] }: Props) {
  const [grouping, setGrouping] = useState<ViewGrouping>("customer");
  const [filters, setFilters] = useState<CustomerFilters>(
    DEFAULT_CUSTOMER_FILTERS,
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const g = localStorage.getItem(LS_GROUPING);
      if (g === "customer" || g === "cast") setGrouping(g);
    } catch {}
    setFilters(loadFilters(LS_FILTERS));
    setLoaded(true);
  }, []);

  const updateGrouping = (g: ViewGrouping) => {
    setGrouping(g);
    try {
      localStorage.setItem(LS_GROUPING, g);
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
        <ViewGroupingToggle value={grouping} onChange={updateGrouping} />
        <Link
          href="/cast/customers/new"
          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-[linear-gradient(135deg,#eccd8b_0%,#c9a45c_100%)] text-[#3a241c] text-[12px] font-semibold shadow-[0_6px_16px_-6px_rgba(201,164,92,0.7)] active:scale-95 transition-transform"
        >
          <UserPlus size={14} />
          新規
        </Link>
      </div>

      <CustomerFilterBar
        filters={filters}
        onChange={updateFilters}
        managerOptions={managerOptions}
        castOptions={allCasts}
        totalCount={allMyCustomers.length}
        filteredCount={filteredMyCustomers.length}
      />

      {filteredMyCustomers.length === 0 ? (
        <Card className="p-8 text-center text-body-sm text-ink-soft">
          該当する顧客が見つかりません
        </Card>
      ) : (
        <CustomerMapView
          customers={filteredMyCustomers}
          casts={allCasts}
          mode={grouping}
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
          ) : (
            <CustomerMapView
              customers={filteredHelpCustomers}
              casts={allCasts}
              mode={grouping}
            />
          )}
        </div>
      )}
    </div>
  );
}
