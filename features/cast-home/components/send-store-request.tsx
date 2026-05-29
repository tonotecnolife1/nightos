"use client";

import { Check, ChevronDown, ChevronUp, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { sendStoreRequestAction } from "./send-store-request-action";

interface Props {
  castId: string;
  castName: string;
}

export function SendStoreRequest({ castId, castName }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    startTransition(async () => {
      await sendStoreRequestAction({ castId, castName, message: message.trim() });
      setMessage("");
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setOpen(false); }, 1500);
    });
  };

  return (
    <div className="rounded-card bg-pearl-warm border border-pearl-soft shadow-soft-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left active:bg-pearl-soft"
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px]">📋</span>
          <span className="text-[11px] font-medium text-ink">店舗へリクエスト</span>
        </div>
        {open ? <ChevronUp size={12} className="text-ink-mute" /> : <ChevronDown size={12} className="text-ink-mute" />}
      </button>

      {open && (
        <div className="px-4 pb-3 pt-1">
          {success ? (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald font-medium py-1">
              <Check size={12} />
              送信しました
            </div>
          ) : (
            <div className="flex gap-1.5">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="VIPルーム準備、シャンパン用意 など"
                style={{ fontSize: "13px" }}
                className="flex-1 h-9 px-3 rounded-full bg-pearl-soft border border-pearl-soft text-ink outline-none focus:border-champagne-dark placeholder:text-ink-mute"
                onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={pending || !message.trim()}
                className="w-9 h-9 rounded-full bg-gradient-champagne text-ink flex items-center justify-center disabled:opacity-40 active:scale-95"
              >
                <Send size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
