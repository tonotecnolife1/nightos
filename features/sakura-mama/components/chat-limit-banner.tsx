"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Lock, Sparkles, Zap } from "lucide-react";
import { Card } from "@/components/nightos/card";
import {
  getChatUsage,
  isAtChatLimit,
  CHAT_FREE_LIMIT,
} from "@/lib/nightos/chat-limit-store";
import { getVenueType } from "@/lib/nightos/role-store";

export function ChatLimitBanner() {
  const [venueType, setVenueType] = useState<string>("club");
  const [usage, setUsage] = useState({ used: 0, limit: CHAT_FREE_LIMIT, remaining: CHAT_FREE_LIMIT });
  const [atLimit, setAtLimit] = useState(false);

  useEffect(() => {
    setVenueType(getVenueType());
    setUsage(getChatUsage());
    setAtLimit(isAtChatLimit());
  }, []);

  // Club mode: no limits
  if (venueType === "club") return null;

  // Cabaret mode: show usage info
  if (atLimit) {
    return (
      <div className="px-4 py-3 bg-pearl-warm border-b border-pearl-soft">
        <Card className="p-4 !border-amber !bg-amber/5">
          <div className="flex items-start gap-3">
            <Lock size={18} className="text-amber shrink-0 mt-0.5" />
            <div>
              <div className="text-body-md font-semibold text-ink">
                今日の無料チャット回数に達しました
              </div>
              <p className="text-body-sm text-ink-secondary mt-1">
                1日{CHAT_FREE_LIMIT}回まで無料でご利用いただけます。
                明日にリセットされます。
              </p>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-btn sakura-gradient text-pearl text-label-sm font-medium"
              >
                <Zap size={13} />
                プレミアムにアップグレード
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (usage.remaining <= 3) {
    return (
      <div className="px-4 py-2 flex items-center justify-center gap-2 bg-pearl-warm border-b border-pearl-soft">
        <AlertCircle size={12} className="text-amber" />
        <span className="text-label-sm text-ink-secondary">
          本日の残りチャット: {usage.remaining} / {CHAT_FREE_LIMIT}回
        </span>
      </div>
    );
  }

  return (
    <div className="px-4 py-1.5 flex items-center justify-center gap-2 bg-pearl-warm border-b border-pearl-soft">
      <Sparkles size={10} className="text-amethyst-dark" />
      <span className="text-label-sm text-ink-muted">
        無料チャット: {usage.remaining}回 残り
      </span>
    </div>
  );
}
