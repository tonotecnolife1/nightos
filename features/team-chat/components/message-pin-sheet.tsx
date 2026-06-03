"use client";

import { useState } from "react";
import { Bookmark, BookmarkX, Search, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type PinnedMessage,
  getPin,
  removePin,
  upsertPin,
} from "@/lib/nightos/chat-pin-store";
import type { ChatMessage } from "../types";
import { type MentionCustomer, searchCustomers } from "../lib/customer-mention";

interface Props {
  message: ChatMessage;
  roomId: string;
  roomName: string;
  customers: MentionCustomer[];
  onClose: () => void;
  /** Called after a pin is created/updated/removed so the parent can refresh. */
  onChanged: () => void;
}

/**
 * Bottom sheet shown when a message bubble is long-pressed. Lets the cast pin
 * the message, link it to a customer, and attach a memo. The result is stored
 * in `chat-pin-store` and surfaces in the キープ / 学び tabs.
 */
export function MessagePinSheet({
  message,
  roomId,
  roomName,
  customers,
  onClose,
  onChanged,
}: Props) {
  const existing: PinnedMessage | null = getPin(message.id);
  const [memo, setMemo] = useState(existing?.memo ?? "");
  const [customer, setCustomer] = useState<{ id: string; name: string } | null>(
    existing?.customerId
      ? { id: existing.customerId, name: existing.customerName ?? "お客様" }
      : null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = searchCustomers(customers, query, 8);

  const save = () => {
    upsertPin({
      messageId: message.id,
      roomId,
      roomName,
      content: message.content,
      senderName: message.sender_name,
      messageAt: message.created_at,
      customerId: customer?.id ?? null,
      customerName: customer?.name ?? null,
      memo: memo.trim(),
    });
    onChanged();
    onClose();
  };

  const unpin = () => {
    removePin(message.id);
    onChanged();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-[24px] bg-pearl border-t border-gold/20 shadow-luxe px-5 pt-3 pb-safe animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grabber */}
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/15" />

        <div className="flex items-center gap-2 mb-3">
          <Bookmark size={15} className="text-gold-deep shrink-0" />
          <h2 className="font-serif text-[16px] font-medium text-ink">
            {existing ? "保存を編集" : "この会話を保存"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-ink-mute hover:bg-pearl-soft"
            aria-label="閉じる"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message preview */}
        <div className="rounded-card border border-ink/[0.08] bg-pearl-light px-3 py-2 mb-4">
          <p className="text-[11px] text-ink-mute mb-0.5">{message.sender_name}</p>
          <p className="text-body-sm text-ink line-clamp-3 whitespace-pre-wrap break-words">
            {message.content || "（画像）"}
          </p>
        </div>

        {/* Customer link */}
        <div className="mb-4">
          <label className="text-label-sm text-ink-soft tracking-[0.04em] mb-1.5 block">
            顧客に紐づける
          </label>
          {customer ? (
            <div className="flex items-center gap-2 rounded-pill border border-gold/30 bg-champagne-soft/40 px-3 py-1.5">
              <span className="w-6 h-6 rounded-full bg-champagne-soft flex items-center justify-center text-[11px] font-medium text-wine-deep">
                {customer.name.charAt(0)}
              </span>
              <span className="text-body-sm text-ink flex-1">{customer.name}</span>
              <button
                type="button"
                onClick={() => setCustomer(null)}
                className="text-ink-mute hover:text-ink"
                aria-label="紐づけを外す"
              >
                <X size={14} />
              </button>
            </div>
          ) : pickerOpen ? (
            <div className="space-y-2">
              <label className="flex items-center gap-2 rounded-2xl border border-ink/[0.08] bg-pearl-light px-3 py-1.5">
                <Search size={13} className="text-ink-mute shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="顧客を検索..."
                  className="flex-1 bg-transparent text-body-sm text-ink placeholder:text-ink-mute focus:outline-none"
                  style={{ fontSize: "16px" }}
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {results.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCustomer({ id: c.id, name: c.name });
                      setPickerOpen(false);
                      setQuery("");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-pill border border-ink/[0.12] bg-pearl-light px-2.5 py-1 text-[12px] text-ink hover:border-gold/40"
                  >
                    <span className="w-5 h-5 rounded-full bg-champagne-soft/60 flex items-center justify-center text-[10px] font-medium text-wine-deep">
                      {c.name.charAt(0)}
                    </span>
                    {c.name}
                  </button>
                ))}
                {results.length === 0 && (
                  <span className="text-[11px] text-ink-mute py-1">
                    一致する顧客がいません
                  </span>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              disabled={customers.length === 0}
              className="inline-flex items-center gap-1.5 rounded-pill border border-dashed border-ink/20 px-3 py-1.5 text-body-sm text-ink-soft hover:border-gold/40 disabled:opacity-50"
            >
              <User size={13} className="text-gold-deep" />
              顧客を選ぶ
            </button>
          )}
        </div>

        {/* Memo */}
        <div className="mb-4">
          <label className="text-label-sm text-ink-soft tracking-[0.04em] mb-1.5 block">
            メモ（任意）
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            placeholder="この会話で覚えておきたいこと..."
            className="w-full resize-none rounded-2xl border border-ink/[0.08] bg-pearl-light px-3 py-2 text-body-md text-ink placeholder:text-ink-mute focus:outline-none focus:border-wine-deep"
            style={{ fontSize: "16px" }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={save}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-pill bg-wine-deep text-pearl-light px-4 py-2.5 text-body-md font-medium shadow-warm"
          >
            <Bookmark size={14} />
            {existing ? "更新する" : "保存する"}
          </button>
          {existing && (
            <button
              type="button"
              onClick={unpin}
              className="inline-flex items-center justify-center gap-1.5 rounded-pill border border-ink/15 px-4 py-2.5 text-body-md text-ink-soft hover:bg-pearl-soft"
            >
              <BookmarkX size={14} />
              外す
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
