"use client";

import { Bell, BellOff, Crown, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type {
  NotificationMessage,
  NotificationVisit,
} from "../notifications-data";
import { markCastMessageReadAction } from "./store-message-banner-action";

interface Props {
  messages: NotificationMessage[];
  visits: NotificationVisit[];
}

type Item =
  | ({ kind: "message"; at: string } & NotificationMessage)
  | ({ kind: "visit"; at: string } & NotificationVisit);

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffMin = Math.round((Date.now() - d.getTime()) / 60_000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}時間前`;
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})`;
}

/**
 * /cast/notifications の本文。店舗メッセージと新しい来店を時系列で 1 本の
 * リストに束ねて表示する。店舗メッセージは既読化 (dismiss) でき、来店は
 * タップで顧客カードへ遷移する。空のときは空状態を出す。
 */
export function NotificationsList({ messages, visits }: Props) {
  const [openMessages, setOpenMessages] =
    useState<NotificationMessage[]>(messages);
  const [pending, startTransition] = useTransition();

  const items = useMemo<Item[]>(() => {
    const msgItems: Item[] = openMessages.map((m) => ({
      kind: "message",
      at: m.sentAt,
      ...m,
    }));
    const visitItems: Item[] = visits.map((v) => ({
      kind: "visit",
      at: v.visitedAt,
      ...v,
    }));
    return [...msgItems, ...visitItems].sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    );
  }, [openMessages, visits]);

  const dismissMessage = (id: string) => {
    startTransition(async () => {
      await markCastMessageReadAction(id);
      setOpenMessages((prev) => prev.filter((m) => m.id !== id));
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <div
          className="w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center"
          style={{ background: "var(--champagne-soft)" }}
        >
          <BellOff size={22} className="text-gold-deep" />
        </div>
        <p className="font-serif text-[15px] font-medium text-ink">
          新しい通知はありません
        </p>
        <p className="text-[12px] text-ink-mute">
          店舗からの連絡やお客様のご来店があると、ここに表示されます。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {items.map((item) =>
        item.kind === "message" ? (
          <div
            key={`m-${item.id}`}
            className="relative overflow-hidden rounded-card border border-ink/[0.08] p-4 shadow-soft"
            style={{
              background:
                "linear-gradient(135deg, var(--champagne-soft) 0%, var(--pearl-warm) 100%)",
            }}
          >
            <span
              aria-hidden
              className="absolute left-0 top-0 bottom-0 w-1 bg-gold-metallic"
            />
            <div className="flex items-start gap-3 pl-2">
              <div
                className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center shrink-0"
                style={{
                  background: "var(--champagne-metallic)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)",
                }}
              >
                <Bell size={18} className="text-gold-deep" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-label-xs tracking-luxe text-gold-deep">
                    店舗からの連絡
                  </span>
                  <span className="text-[11px] text-ink-mute shrink-0">
                    {formatWhen(item.sentAt)}
                  </span>
                </div>
                <p className="font-serif text-[14px] leading-[1.65] font-medium tracking-[0.01em] text-ink">
                  {item.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => dismissMessage(item.id)}
                disabled={pending}
                className="p-1 rounded-full hover:bg-pearl-warm/60 text-ink-mute shrink-0"
                aria-label="既読にする"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <Link
            key={`v-${item.id}`}
            href={`/cast/customers/${item.customerId}`}
            className="block"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-card bg-pearl-warm border border-gold/25 shadow-soft transition hover:shadow-warm hover:-translate-y-px will-change-transform">
              <div className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center shrink-0">
                <Bell size={18} className="text-gold-deep" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[11px] text-ink-mute">新しい来店</span>
                  <span className="text-[11px] text-ink-mute shrink-0">
                    {formatWhen(item.visitedAt)}
                  </span>
                </div>
                <div className="text-body-md font-medium text-ink flex items-center gap-1.5 truncate">
                  {item.customerName}さま
                  {item.isNominated && (
                    <Crown size={11} className="text-gold shrink-0" />
                  )}
                </div>
                {(item.tableName || item.isNominated) && (
                  <div className="text-[11px] text-ink-soft">
                    {item.tableName && `テーブル: ${item.tableName}`}
                    {item.tableName && item.isNominated && " · "}
                    {item.isNominated && "指名"}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ),
      )}
    </div>
  );
}
