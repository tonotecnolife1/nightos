"use client";

import { AlertTriangle, Minus, Trash2, Wine } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Card } from "@/components/nightos/card";
import { CsvDownloadButton } from "@/components/nightos/csv-download-button";
import { cn, formatBottleRemainingPct } from "@/lib/utils";
import type { CsvColumn } from "@/lib/nightos/csv";
import type { BottleWithCustomer } from "@/lib/nightos/supabase-queries";
import { consumeBottleAction, deleteBottleAction } from "../actions";

interface Props {
  bottles: BottleWithCustomer[];
}

export function BottleListClient({ bottles: initial }: Props) {
  const [bottles, setBottles] = useState(initial);
  const [pending, startTransition] = useTransition();

  // remaining_glasses is now interpreted as a percentage (0-100). Each
  // tap here drops the remaining amount by 10 percentage points so the
  // operator can quickly track usage during a visit.
  const CONSUME_STEP = 10;
  const handleConsume = (id: string) => {
    startTransition(async () => {
      const res = await consumeBottleAction(id, CONSUME_STEP);
      if (res.ok) {
        setBottles((prev) =>
          prev.map((b) =>
            b.id === id
              ? {
                  ...b,
                  remaining_glasses: Math.max(
                    0,
                    b.remaining_glasses - CONSUME_STEP,
                  ),
                }
              : b,
          ),
        );
      }
    });
  };

  const handleDelete = (id: string, brand: string, customer: string) => {
    if (!confirm(`${customer}さんの${brand}を削除しますか？`)) return;
    startTransition(async () => {
      await deleteBottleAction(id);
      setBottles((prev) => prev.filter((b) => b.id !== id));
    });
  };

  const csvColumns: CsvColumn<BottleWithCustomer>[] = [
    { header: "ボトルID", value: (b) => b.id },
    { header: "ブランド", value: (b) => b.brand },
    { header: "顧客名", value: (b) => b.customer_name },
    { header: "残量(%)", value: (b) => b.remaining_glasses },
    { header: "総量(%)", value: (b) => b.total_glasses },
    { header: "キープ日時", value: (b) => b.kept_at },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-label-sm text-ink-mute">
          {bottles.length}本のキープボトル
        </span>
        <div className="flex items-center gap-2">
          <CsvDownloadButton
            rows={bottles}
            columns={csvColumns}
            filenamePrefix="bottles"
          />
          <Link
            href="/store/bottles/new"
            className="h-10 px-4 rounded-btn bg-wine-deep text-pearl-light-light flex items-center gap-1 shadow-soft text-label-md font-medium active:scale-95"
          >
            <Wine size={14} />
            新規登録
          </Link>
        </div>
      </div>

      {bottles.length === 0 ? (
        <Card className="p-6 text-center text-body-sm text-ink-soft">
          キープボトルがまだありません
        </Card>
      ) : (
        <div className="space-y-2">
          {bottles.map((b) => {
            // 25% を「残りわずか」、0% を「空」とみなす。
            const isLow = b.remaining_glasses <= 25;
            const isEmpty = b.remaining_glasses === 0;
            const pct =
              b.total_glasses > 0
                ? (b.remaining_glasses / b.total_glasses) * 100
                : 0;
            return (
              <Card key={b.id} className="p-4 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-body-md font-semibold text-ink">
                        {b.brand}
                      </span>
                      {isLow && !isEmpty && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-badge bg-warning/20 text-warning text-[10px] font-medium border border-warning/40">
                          <AlertTriangle size={9} />
                          残りわずか
                        </span>
                      )}
                      {isEmpty && (
                        <span className="px-1.5 py-0.5 rounded-badge bg-wine/15 text-wine-deep text-[10px] font-medium">
                          空
                        </span>
                      )}
                    </div>
                    <div className="text-label-sm text-ink-mute">
                      {b.customer_name}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-display-sm text-ink">
                      {formatBottleRemainingPct(
                        b.remaining_glasses,
                        b.total_glasses,
                      )}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-pearl-soft overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      isEmpty
                        ? "bg-wine/50"
                        : isLow
                          ? "bg-amber"
                          : "bg-rose-gold-metallic",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleConsume(b.id)}
                    disabled={pending || isEmpty}
                    className="flex items-center gap-1 h-9 px-3 rounded-btn bg-champagne border border-champagne-dark text-ink text-label-sm active:scale-95 disabled:opacity-40"
                  >
                    <Minus size={12} />
                    10%消費
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(b.id, b.brand, b.customer_name)
                    }
                    disabled={pending}
                    className="w-9 h-9 rounded-full bg-pearl-soft text-wine-deep flex items-center justify-center hover:bg-wine/10 active:scale-95 disabled:opacity-50"
                    aria-label="削除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
