"use client";

import { Check, Flag } from "lucide-react";
import { useState, useTransition } from "react";
import { resolveCastRequestAction } from "./cast-request-banner-action";

interface Request {
  id: string;
  cast_name: string;
  message: string;
  sent_at: string;
}

export function CastRequestBanner({ requests: initial }: { requests: Request[] }) {
  const [requests, setRequests] = useState(initial);
  const [pending, startTransition] = useTransition();

  const handleResolve = (id: string) => {
    startTransition(async () => {
      await resolveCastRequestAction(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    });
  };

  if (requests.length === 0) return null;

  return (
    <div className="space-y-2">
      {requests.map((r) => (
        <div
          key={r.id}
          className="flex items-start gap-3 rounded-card bg-roseGold-muted border border-roseGold-border p-3 animate-fade-in"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-rose-gold flex items-center justify-center shrink-0">
            <Flag size={13} className="text-pearl" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-roseGold-dark font-medium">
              {r.cast_name}さんからのリクエスト
            </div>
            <p className="text-[12px] text-ink leading-relaxed mt-0.5">
              {r.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleResolve(r.id)}
            disabled={pending}
            className="w-7 h-7 rounded-full bg-pearl-warm border border-pearl-soft flex items-center justify-center text-success hover:bg-success/10 active:scale-95 shrink-0"
            title="対応済み"
          >
            <Check size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
