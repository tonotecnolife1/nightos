"use client";

import { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { loadCancelledDouhansForCast } from "@/lib/nightos/douhan-store";
import { formatCustomerName } from "@/lib/utils";
import type { Customer, Douhan } from "@/types/nightos";

interface Props {
  castId: string;
  /** 顧客名解決用（全顧客） */
  customers: Customer[];
}

/**
 * ママ・姉さんがキャストのキャンセル履歴を見るためのクライアントコンポーネント。
 * localStorage 上の共有同伴ストアから最新データを読む。
 * （キャスト側がキャンセルすると即座に反映される）
 */
export function CancelledDouhanSection({ castId, customers }: Props) {
  const [items, setItems] = useState<Douhan[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadCancelledDouhansForCast(castId));
    setLoaded(true);
  }, [castId]);

  const customerById = new Map(customers.map((c) => [c.id, c]));

  return (
    <section className="space-y-2">
      <header className="relative flex items-center justify-between pl-3.5">
        <span aria-hidden className="absolute left-0 top-1 bottom-1 w-[3px] rounded bg-rose-gold-metallic" />
        <h2 className="font-serif text-[19px] leading-[1.3] font-medium tracking-[0.02em] text-ink flex items-center gap-1.5">
          <XCircle size={15} className="text-wine-deep" />
          同伴キャンセル履歴
        </h2>
        <span className="text-label-xs tracking-luxe text-ink-mute uppercase">
          {loaded ? `${items.length}件` : "..."}
        </span>
      </header>

      {!loaded ? (
        <Card className="p-4 text-center text-body-sm text-ink-mute">
          読み込み中...
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-4 text-center text-body-sm text-ink-mute">
          キャンセル履歴はありません
        </Card>
      ) : (
        items.map((d) => {
          const customer = customerById.get(d.customer_id);
          return (
            <Card
              key={d.id}
              className="p-3 !bg-wine/5 !border-wine/25 space-y-1"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-body-sm font-medium text-ink truncate">
                  {customer ? formatCustomerName(customer.name) : "（顧客不明）"}
                </span>
                <span className="text-[10px] text-ink-mute shrink-0">
                  {formatDouhanDate(d.date)}
                </span>
              </div>
              <div className="text-[11px] text-ink-soft">
                <span className="text-wine-deep font-medium">理由:</span>{" "}
                {d.cancellation_reason ?? "（理由未入力）"}
              </div>
              {d.note && (
                <div className="text-[10px] text-ink-mute truncate">
                  予定: {d.note}
                </div>
              )}
              {d.cancelled_at && (
                <div className="text-[9px] text-ink-mute">
                  キャンセル日時: {formatDateTime(d.cancelled_at)}
                </div>
              )}
            </Card>
          );
        })
      )}
    </section>
  );
}

function formatDouhanDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00+09:00");
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${month}/${day}（${weekdays[d.getDay()]}）`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${m}/${day} ${hh}:${mm}`;
}
