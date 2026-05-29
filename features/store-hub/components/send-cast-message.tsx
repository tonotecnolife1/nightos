"use client";

import { Check, MessageCircle, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { Card } from "@/components/nightos/card";
import { sendCastMessageAction } from "./send-cast-message-action";

interface Props {
  casts: { id: string; name: string }[];
}

export function SendCastMessage({ casts }: Props) {
  const [castId, setCastId] = useState(casts[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    startTransition(async () => {
      await sendCastMessageAction({ castId, message: message.trim() });
      const castName = casts.find((c) => c.id === castId)?.name ?? "";
      setSuccess(`${castName}さんに送りました`);
      setMessage("");
      setTimeout(() => setSuccess(null), 2500);
    });
  };

  return (
    <Card className="!bg-pearl-warm !border-pearl-soft p-4 space-y-3">
      <div className="flex items-center gap-2">
        <MessageCircle size={14} className="text-roseGold-dark" />
        <h3 className="text-label-md text-ink font-semibold">
          キャストへ連絡
        </h3>
      </div>

      <div className="flex gap-2">
        <select
          value={castId}
          onChange={(e) => setCastId(e.target.value)}
          className="h-10 px-3 rounded-btn bg-pearl-warm border border-pearl-soft text-ink text-body-sm outline-none cursor-pointer"
        >
          {casts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex-1 flex gap-1">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="今夜の指示やメモ..."
            className="flex-1 h-10 px-3 rounded-btn bg-pearl-warm border border-pearl-soft text-ink text-body-sm outline-none focus:border-champagne-dark"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={pending || !message.trim()}
            className="w-10 h-10 rounded-full bg-rose-gold-metallic text-pearl flex items-center justify-center disabled:opacity-40 active:scale-95"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-1.5 text-body-sm text-roseGold-dark">
          <Check size={14} />
          {success}
        </div>
      )}
    </Card>
  );
}
