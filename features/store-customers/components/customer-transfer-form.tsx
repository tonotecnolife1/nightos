"use client";

import { ArrowRight, Check, Users } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/nightos/button";
import { Card } from "@/components/nightos/card";
import { SelectInput } from "@/components/nightos/select";
import type { Cast, Customer } from "@/types/nightos";
import { transferCustomersAction } from "../actions";

interface Props {
  customers: Customer[];
  casts: Cast[];
}

export function CustomerTransferForm({ customers, casts }: Props) {
  const [pending, startTransition] = useTransition();
  const [sourceCastId, setSourceCastId] = useState(casts[0]?.id ?? "");
  const [targetCastId, setTargetCastId] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sourceCast = casts.find((c) => c.id === sourceCastId);
  const filtered = customers.filter((c) => c.cast_id === sourceCastId);

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c) => c.id)));
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSourceChange = (id: string) => {
    setSourceCastId(id);
    setSelected(new Set());
    setSuccess(null);
    setError(null);
  };

  const submit = () => {
    setError(null);
    setSuccess(null);
    if (!targetCastId) {
      setError("移管先キャストを選択してください");
      return;
    }
    if (targetCastId === sourceCastId) {
      setError("移管元と移管先が同じです");
      return;
    }
    if (selected.size === 0) {
      setError("移管する顧客を選択してください");
      return;
    }
    startTransition(async () => {
      const res = await transferCustomersAction(
        Array.from(selected),
        targetCastId,
      );
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(
        `${res.count}人の顧客を${casts.find((c) => c.id === targetCastId)?.name ?? ""}さんへ移管しました`,
      );
      setSelected(new Set());
    });
  };

  const targetOptions = casts
    .filter((c) => c.id !== sourceCastId)
    .map((c) => ({ value: c.id, label: `${c.name}さん` }));

  const CATEGORY_LABEL: Record<string, string> = {
    vip: "VIP",
    regular: "常連",
    new: "新規",
  };
  const FUNNEL_LABEL: Record<string, string> = {
    line_exchanged: "LINE交換済み",
    assigned: "担当あり",
    store_only: "店舗登録のみ",
  };

  return (
    <div className="space-y-5">
      {/* Source + target selector */}
      <Card className="p-4 space-y-4">
        <SelectInput
          label="移管元キャスト"
          name="source_cast"
          value={sourceCastId}
          onChange={(e) => handleSourceChange(e.target.value)}
          options={casts.map((c) => ({ value: c.id, label: `${c.name}さん` }))}
          hint={`担当顧客 ${filtered.length}人`}
        />

        <div className="flex items-center justify-center gap-2 text-ink-mute">
          <ArrowRight size={16} />
        </div>

        <SelectInput
          label="移管先キャスト"
          name="target_cast"
          value={targetCastId}
          onChange={(e) => setTargetCastId(e.target.value)}
          options={[
            { value: "", label: "移管先を選択…" },
            ...targetOptions,
          ]}
        />
      </Card>

      {/* Customer checklist */}
      {filtered.length > 0 ? (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-roseGold-dark" />
              <h2 className="text-display-sm text-ink">
                {sourceCast?.name ?? ""}さんの担当顧客
              </h2>
            </div>
            <button
              type="button"
              onClick={toggleAll}
              className="text-[11px] text-gold-deep underline"
            >
              {selected.size === filtered.length ? "全選択解除" : "全選択"}
            </button>
          </div>

          <div className="space-y-1.5">
            {filtered.map((c) => {
              const isSelected = selected.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className={`w-full text-left p-3 rounded-btn border transition-all flex items-center gap-3 ${
                    isSelected
                      ? "bg-champagne-soft/60 border-gold/30"
                      : "bg-pearl-warm border-pearl-soft"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-roseGold-deep border-roseGold-deep"
                        : "border-pearl-soft bg-white"
                    }`}
                  >
                    {isSelected && <Check size={10} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-body-sm font-medium text-ink">
                        {c.name}さま
                      </span>
                      <span className="text-[10px] text-ink-mute">
                        {CATEGORY_LABEL[c.category]}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-0.5">
                      {c.job && (
                        <span className="text-[10px] text-ink-mute truncate">
                          {c.job}
                        </span>
                      )}
                      <span className="text-[10px] text-ink-mute shrink-0">
                        {FUNNEL_LABEL[c.funnel_stage ?? "store_only"]}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-ink-mute">
            {selected.size > 0
              ? `${selected.size}人を選択中`
              : "移管する顧客をタップして選択"}
          </p>
        </section>
      ) : (
        <Card className="p-4 text-center text-body-sm text-ink-mute">
          {sourceCastId ? "担当顧客がいません" : "移管元を選択してください"}
        </Card>
      )}

      {error && (
        <div className="rounded-btn bg-wine/10 border border-wine/30 text-wine-deep text-body-sm px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-btn bg-champagne border border-champagne-dark text-ink text-body-sm px-3 py-2">
          <Check size={16} className="text-roseGold-dark" />
          {success}
        </div>
      )}

      <Button
        type="button"
        variant="primary"
        fullWidth
        size="lg"
        disabled={pending || selected.size === 0 || !targetCastId}
        onClick={submit}
      >
        <ArrowRight size={16} />
        {pending
          ? "移管中…"
          : selected.size > 0
          ? `${selected.size}人を移管する`
          : "顧客を選択してください"}
      </Button>
    </div>
  );
}
