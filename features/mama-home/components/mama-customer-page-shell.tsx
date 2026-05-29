"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/nightos/card";
import { CustomerFilterBar } from "@/features/cast-customers/components/customer-filter-bar";
import { CustomerMapView } from "@/features/customer-map/components/customer-map-view";
import { ViewGroupingToggle, type ViewGrouping } from "./view-grouping-toggle";
import {
  applyCustomerFilters,
  DEFAULT_CUSTOMER_FILTERS,
  loadFilters,
  saveFilters,
  type CustomerFilters,
} from "@/lib/nightos/customer-filters";
import type { Cast, Customer } from "@/types/nightos";

const LS_GROUPING = "nightos.mama-customers.grouping";
const LS_FILTERS = "nightos.mama-customers.filters";

interface Props {
  customers: Array<Customer & { cast_name: string }>;
  allCasts: Cast[];
}

/**
 * ママ/姉さんアプリの顧客一覧シェル。
 * 顧客ベース（紹介チェーン）とキャストベース（管理者→担当→顧客）の相関図を
 * 縦階層で表示する。フィルターで絞り込み可能。
 */
export function MamaCustomerPageShell({ customers, allCasts }: Props) {
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
    () =>
      allCasts.filter(
        (c) => c.club_role === "mama" || c.club_role === "oneesan",
      ),
    [allCasts],
  );

  const filteredCustomers = useMemo(
    () => applyCustomerFilters(customers, filters),
    [customers, filters],
  );

  if (!loaded) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ViewGroupingToggle value={grouping} onChange={updateGrouping} />
      </div>

      <CustomerFilterBar
        filters={filters}
        onChange={updateFilters}
        managerOptions={managerOptions}
        castOptions={allCasts}
        totalCount={customers.length}
        filteredCount={filteredCustomers.length}
      />

      {filteredCustomers.length === 0 ? (
        <Card className="p-8 text-center text-body-sm text-ink-soft">
          該当する顧客が見つかりません
        </Card>
      ) : (
        <CustomerMapView
          customers={filteredCustomers}
          casts={allCasts}
          mode={grouping}
        />
      )}
    </div>
  );
}
