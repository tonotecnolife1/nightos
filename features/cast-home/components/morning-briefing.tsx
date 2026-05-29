"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { GemCard } from "@/components/nightos/card";
import { RuriMamaAvatar } from "@/components/nightos/ruri-mama-avatar";
import { getUpcomingShifts } from "@/lib/nightos/schedule-store";

interface Props {
  castId: string;
}

interface CachedBriefing {
  briefing: string;
  isStub: boolean;
  generatedAt: string;
  cacheDate: string; // YYYY-MM-DD
}

const STORAGE_PREFIX = "nightos.morning-briefing";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadCached(castId: string): CachedBriefing | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}.${castId}`);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedBriefing;
    if (cached.cacheDate !== todayKey()) return null;
    return cached;
  } catch {
    return null;
  }
}

function saveCached(castId: string, value: CachedBriefing) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${STORAGE_PREFIX}.${castId}`,
      JSON.stringify(value),
    );
  } catch {
    // ignore quota errors
  }
}

export function MorningBriefing({ castId }: Props) {
  const [briefing, setBriefing] = useState<CachedBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBriefing = async (force = false) => {
    setLoading(true);
    setError(null);

    if (!force) {
      const cached = loadCached(castId);
      if (cached) {
        setBriefing(cached);
        setLoading(false);
        return;
      }
    }

    try {
      const today = todayKey();
      const upcomingShifts = getUpcomingShifts(today, 5);
      const res = await fetch("/api/morning-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ castId, upcomingShifts }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = (await res.json()) as {
        isStub: boolean;
        briefing: string;
        generatedAt: string;
      };
      const cached: CachedBriefing = {
        briefing: data.briefing,
        isStub: data.isStub,
        generatedAt: data.generatedAt,
        cacheDate: todayKey(),
      };
      saveCached(castId, cached);
      setBriefing(cached);
    } catch (err) {
      console.error(err);
      setError("ブリーフィングの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [castId]);

  return (
    <GemCard className="p-5">
      <div className="relative">
        <div className="inline-flex items-center gap-2 mb-3">
          <RuriMamaAvatar size={28} />
          <span className="text-label-xs tracking-luxe text-roseGold-deep">
            今朝のさくらママから
          </span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-ink-soft text-body-sm py-1">
            <Loader2 size={14} className="animate-spin" />
            <span>さくらママが今日のメモを書いてます…</span>
          </div>
        ) : error ? (
          <div className="text-body-sm text-ink-soft">{error}</div>
        ) : briefing ? (
          <p className="font-serif text-[14.5px] leading-[1.75] font-medium tracking-[0.01em] text-ink whitespace-pre-wrap">
            {briefing.briefing}
          </p>
        ) : null}

        {briefing && !loading && (
          <button
            type="button"
            onClick={() => void fetchBriefing(true)}
            className="mt-3 inline-flex items-center gap-1 text-[12px] text-ink-soft hover:text-roseGold-deep underline underline-offset-2 transition-colors"
          >
            <RefreshCw size={11} />
            別のメッセージで書き直す
          </button>
        )}
      </div>
    </GemCard>
  );
}
