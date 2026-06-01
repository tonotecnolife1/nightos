"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, StickyNote, User, X } from "lucide-react";
import { EmptyState } from "@/components/nightos/empty-state";
import {
  type PinnedMessage,
  getPinnedMessages,
  removePin,
  subscribePins,
} from "@/lib/nightos/chat-pin-store";

/**
 * キープ tab — the running collection of message bubbles the cast kept
 * (via long-press), each with its optional customer link and memo.
 */
export function PinnedList() {
  const [pins, setPins] = useState<PinnedMessage[]>([]);

  useEffect(() => {
    const refresh = () => setPins(getPinnedMessages());
    refresh();
    return subscribePins(refresh);
  }, []);

  if (pins.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          icon={<Bookmark size={22} />}
          title="キープはまだありません"
          description="大事な会話の吹き出しを長押しして、キープ・顧客の紐づけ・メモを残すとここに溜まっていきます。"
          tone="amethyst"
        />
      </div>
    );
  }

  return (
    <div className="px-5 py-4 space-y-3">
      {pins.map((p) => (
        <PinCard key={p.id} pin={p} onRemove={() => removePin(p.messageId)} />
      ))}
    </div>
  );
}

function PinCard({ pin, onRemove }: { pin: PinnedMessage; onRemove: () => void }) {
  return (
    <div className="rounded-card border border-ink/[0.08] bg-pearl-light shadow-soft px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Bookmark size={12} className="text-gold-deep shrink-0" />
        <span className="text-label-sm text-ink-soft truncate">{pin.roomName}</span>
        <span className="text-[10px] text-ink-mute ml-auto shrink-0 font-display tracking-[0.04em]">
          {formatDate(pin.pinnedAt)}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="w-6 h-6 rounded-full flex items-center justify-center text-ink-mute hover:bg-pearl-soft shrink-0"
          aria-label="キープを外す"
          title="キープを外す"
        >
          <X size={13} />
        </button>
      </div>

      <p className="text-[11px] text-ink-mute mb-0.5">{pin.senderName}</p>
      <p className="text-body-sm text-ink whitespace-pre-wrap break-words">
        {pin.content || "（画像）"}
      </p>

      {pin.memo && pin.memo.trim().length > 0 && (
        <div className="mt-2 flex items-start gap-1.5 rounded-btn bg-champagne-soft/30 border border-gold/15 px-2.5 py-1.5">
          <StickyNote size={12} className="text-gold-deep shrink-0 mt-0.5" />
          <p className="text-[12px] text-ink-soft whitespace-pre-wrap break-words">
            {pin.memo}
          </p>
        </div>
      )}

      {pin.customerId && (
        <Link
          href={`/cast/customers/${pin.customerId}`}
          className="mt-2 inline-flex items-center gap-1.5 rounded-pill border border-gold/30 bg-champagne-soft/40 px-2.5 py-1 text-[11px] text-wine-deep font-medium hover:bg-champagne-soft/60"
        >
          <User size={11} />
          {pin.customerName ?? "お客様"}のカルテ
        </Link>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
