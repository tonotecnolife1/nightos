"use client";

import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/nightos/card";
import { SakuraMamaAvatar } from "@/components/nightos/sakura-mama-avatar";

interface CachedBriefing {
  briefing: string;
  isStub: boolean;
  cacheDate: string;
}

const STORAGE_KEY = "nightos.store-briefing";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function StoreBriefing() {
  const [briefing, setBriefing] = useState<CachedBriefing | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBriefing = async (force = false) => {
    setLoading(true);
    if (!force) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as CachedBriefing;
          if (cached.cacheDate === todayKey()) {
            setBriefing(cached);
            setLoading(false);
            return;
          }
        }
      } catch {}
    }
    try {
      const res = await fetch("/api/store-briefing", { method: "POST" });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = (await res.json()) as { isStub: boolean; briefing: string };
      const cached: CachedBriefing = {
        briefing: data.briefing,
        isStub: data.isStub,
        cacheDate: todayKey(),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
      setBriefing(cached);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBriefing();
  }, []);

  return (
    <Card className="!bg-gradient-champagne !border-champagne-dark p-4">
      <div className="flex items-center gap-2 mb-2">
        <SakuraMamaAvatar size={28} />
        <span className="text-label-sm text-ink-secondary font-medium uppercase tracking-wider">
          <Sparkles size={11} className="inline mr-1" />
          今夜の重点ポイント
        </span>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-ink-secondary text-body-sm py-1">
          <Loader2 size={14} className="animate-spin" />
          さくらママが今夜の準備メモを書いてます…
        </div>
      ) : briefing ? (
        <>
          <p className="text-body-md text-ink leading-relaxed whitespace-pre-wrap">
            {briefing.briefing}
          </p>
          <button
            type="button"
            onClick={() => void fetchBriefing(true)}
            className="mt-2 inline-flex items-center gap-1 text-label-sm text-ink-secondary hover:text-ink underline underline-offset-2"
          >
            <RefreshCw size={11} />
            書き直す
          </button>
        </>
      ) : null}
    </Card>
  );
}
