"use client";

import { Check, MessageCircle, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  clearLineExchange,
  getLineExchange,
  recordLineExchange,
} from "../lib/line-exchange-store";

interface Props {
  customerId: string;
  castId: string;
  /** モックデータ上既にLINE交換済みなら、この時点から表示を "済み" でスタート */
  initiallyExchanged?: boolean;
  initialExchangedAt?: string | null;
}

/**
 * キャストが顧客とLINE交換したことを記録するボタン。
 * - 未記録時: 大きな緑ボタン「LINE交換したよ」
 * - 記録済: 「💬 LINE交換済み」バッジ + 取り消しリンク
 * 記録後はお店のチャット通知も表示案内（現状は簡易ローカル記録のみ）
 */
export function LineExchangeButton({
  customerId,
  castId,
  initiallyExchanged,
  initialExchangedAt,
}: Props) {
  const [exchanged, setExchanged] = useState<boolean>(!!initiallyExchanged);
  const [exchangedAt, setExchangedAt] = useState<string | null>(
    initialExchangedAt ?? null,
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const local = getLineExchange(customerId);
    if (local) {
      setExchanged(true);
      setExchangedAt(local.exchangedAt);
    } else if (initiallyExchanged) {
      setExchanged(true);
      setExchangedAt(initialExchangedAt ?? null);
    }
    setLoaded(true);
  }, [customerId, initiallyExchanged, initialExchangedAt]);

  const handleExchange = () => {
    const entry = recordLineExchange(customerId, castId);
    setExchanged(true);
    setExchangedAt(entry.exchangedAt);
  };

  const handleUndo = () => {
    clearLineExchange(customerId);
    setExchanged(!!initiallyExchanged);
    setExchangedAt(initialExchangedAt ?? null);
  };

  if (!loaded) return null;

  if (exchanged) {
    const date = exchangedAt ? new Date(exchangedAt) : null;
    const dateStr = date
      ? `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
      : "";
    return (
      <div className="rounded-card border border-success/25 bg-success/5 p-3 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Check size={14} className="text-success" />
          <span className="text-body-sm font-medium text-success">
            LINE交換済み
          </span>
          {dateStr && (
            <span className="text-[10px] text-ink-mute ml-auto">
              {dateStr}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-ink-soft">
            お店に共有済み。これでファネル上位に反映されました✨
          </p>
          <button
            type="button"
            onClick={handleUndo}
            className="inline-flex items-center gap-0.5 text-[10px] text-ink-mute hover:text-wine-deep underline underline-offset-2 shrink-0 ml-2"
          >
            <Undo2 size={9} />
            取り消す
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleExchange}
      className={cn(
        "w-full flex items-center justify-center gap-1.5 h-11 rounded-btn",
        "bg-success/10 border border-success/25 text-success font-medium",
        "text-label-md transition-all active:scale-[0.98] hover:bg-success/15",
      )}
    >
      <MessageCircle size={14} />
      LINE交換したよ
    </button>
  );
}
