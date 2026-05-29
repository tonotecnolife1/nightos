"use client";

import { Bell, X } from "lucide-react";
import { useState, useTransition } from "react";
import { markCastMessageReadAction } from "./store-message-banner-action";

interface StoreMessage {
  id: string;
  message: string;
  sent_at: string;
}

interface Props {
  castId: string;
  initialMessages: StoreMessage[];
}

export function StoreMessageBanner({ initialMessages }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [pending, startTransition] = useTransition();

  if (messages.length === 0) return null;

  const dismiss = (id: string) => {
    startTransition(async () => {
      await markCastMessageReadAction(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    });
  };

  return (
    <div className="space-y-2">
      {messages.map((m) => (
        <div
          key={m.id}
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
              <div className="text-label-xs tracking-luxe text-gold-deep mb-1.5">
                店舗からの連絡
              </div>
              <p className="font-serif text-[14px] leading-[1.65] font-medium tracking-[0.01em] text-ink">
                {m.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dismiss(m.id)}
              disabled={pending}
              className="p-1 rounded-full hover:bg-pearl-warm/60 text-ink-mute shrink-0"
              aria-label="閉じる"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
