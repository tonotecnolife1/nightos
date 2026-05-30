"use client";

import { BellRing, CalendarPlus, Check, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/nightos/button";
import { SelectInput } from "@/components/nightos/select";
import { cn } from "@/lib/utils";
import type { Cast, Customer } from "@/types/nightos";
import { createVisitAction } from "../actions";
import { CustomerSearchList } from "./customer-search-list";
import { TableGrid } from "./table-grid";

interface Props {
  casts: Cast[];
  customers: Customer[];
  initialCustomerId?: string;
}

export function VisitForm({ casts, customers, initialCustomerId }: Props) {
  const [pending, startTransition] = useTransition();
  const [tableId, setTableId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(initialCustomerId ?? null);
  const [castId, setCastId] = useState<string>(() => {
    if (initialCustomerId) {
      const cust = customers.find((c) => c.id === initialCustomerId);
      return cust?.cast_id ?? casts[0]?.id ?? "";
    }
    return casts[0]?.id ?? "";
  });
  const [isNominated, setIsNominated] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // When a customer is picked, auto-preselect their primary cast to save time.
  const pickCustomer = (id: string | null) => {
    setCustomerId(id);
    if (id) {
      const cust = customers.find((c) => c.id === id);
      if (cust) setCastId(cust.cast_id);
    }
  };

  const reset = () => {
    setTableId(null);
    setCustomerId(null);
    setIsNominated(false);
  };

  const submit = () => {
    setError(null);
    setSuccess(null);
    if (!customerId || !castId) {
      setError("顧客と担当キャストを選んでください");
      return;
    }
    startTransition(async () => {
      const res = await createVisitAction({
        customer_id: customerId,
        cast_id: castId,
        table_name: tableId,
        is_nominated: isNominated,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const cust = customers.find((c) => c.id === customerId);
      const cast = casts.find((c) => c.id === castId);
      setSuccess(
        `${cust?.name ?? "顧客"}さんの来店を${cast?.name ?? "担当"}に通知しました`,
      );
      reset();
      setTimeout(() => setSuccess(null), 3500);
    });
  };

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <TableGrid value={tableId} onChange={setTableId} />

      <CustomerSearchList
        customers={customers}
        value={customerId}
        onChange={pickCustomer}
      />

      <SelectInput
        label="担当キャスト"
        name="cast_id"
        value={castId}
        onChange={(e) => setCastId(e.target.value)}
        options={casts.map((c) => ({ value: c.id, label: c.name }))}
      />

      {/* Nomination toggle */}
      <div>
        <div className="text-label-md text-ink font-medium mb-2">来店種別</div>
        <div className="grid grid-cols-2 gap-2">
          <NominationOption
            label="フリー"
            active={!isNominated}
            onClick={() => setIsNominated(false)}
            icon={null}
          />
          <NominationOption
            label="指名あり"
            active={isNominated}
            onClick={() => setIsNominated(true)}
            icon={<Sparkles size={14} />}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-card bg-wine/10 border border-wine/30 text-wine-deep text-body-sm px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-card bg-champagne-soft border border-gold/30 text-ink text-body-sm px-3 py-2">
          <BellRing size={16} className="text-gold-deep" />
          {success}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={pending}
      >
        <CalendarPlus size={16} />
        {pending ? "登録中…" : "来店を登録してキャストに通知"}
      </Button>
    </form>
  );
}

function NominationOption({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-12 rounded-pill border flex items-center justify-center gap-1.5 text-label-md font-medium tracking-[0.04em] transition-all active:scale-95",
        active
          ? "bg-wine-deep text-pearl-light-light border-wine-deep shadow-luxe"
          : "bg-pearl-light border-ink/[0.08] text-ink-soft hover:border-gold/30 shadow-soft",
      )}
    >
      {active && <Check size={14} />}
      {icon}
      {label}
    </button>
  );
}
