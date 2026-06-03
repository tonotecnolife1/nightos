"use client";

import Link from "next/link";
import Image from "next/image";
import { Loader2, MessageCircle, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AI_FETCH_OPTIONS, apiFetchJson } from "@/lib/nightos/api-fetch";
import { getUpcomingShifts } from "@/lib/nightos/schedule-store";
import { pullCastSchedule } from "@/lib/nightos/schedule-sync";

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

/**
 * さくらママ統合カード (V5 Bordeaux Salon)。
 * 「今朝のさくらママから」のメッセージと「相談する」導線を一つの
 * dark bordeaux サーフェスにまとめる。アクションは
 *  - メッセージを更新する (今日のブリーフィングを再生成)
 *  - さくらママに相談する (チャットへ)
 * の2つに集約。
 */
export function SakuraMamaCard({ castId }: Props) {
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
      // Reconcile shifts with the server first so the briefing reflects
      // schedules registered on other devices (migration 013).
      await pullCastSchedule();
      const upcomingShifts = getUpcomingShifts(today, 5);
      const data = await apiFetchJson<{
        isStub: boolean;
        briefing: string;
        generatedAt: string;
      }>("/api/morning-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ castId, upcomingShifts }),
        ...AI_FETCH_OPTIONS,
      });
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
      setError("メッセージの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [castId]);

  return (
    <div className="v5-sakura-surface rounded-hero p-5 flex flex-col gap-4">
      {/* Header: framed photo + eyebrow */}
      <div className="flex items-center gap-3.5">
        <div
          className="w-14 h-14 rounded-full flex-shrink-0 p-[2px]"
          style={{
            background: "var(--v5-champ-gold)",
            boxShadow: "0 6px 18px rgba(140,111,68,0.30)",
          }}
        >
          <div
            className="w-full h-full rounded-full overflow-hidden"
            style={{ border: "1px solid #3A1F1F" }}
          >
            <Image
              src="/cast/sakura-mama.jpg"
              alt="さくらママ"
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="inline-flex items-center gap-1.5 mb-1.5 font-sans font-medium"
            style={{
              fontSize: 11,
              lineHeight: 1,
              letterSpacing: "0.32em",
              color: "var(--v5-gold-mid)",
            }}
          >
            <Sparkles size={11} strokeWidth={1.8} />
            <span>今朝のさくらママから</span>
          </div>
          <div
            className="font-serif font-normal v5-metallic"
            style={{ fontSize: 22, lineHeight: 1.15, letterSpacing: "0.05em" }}
          >
            さくらママ
          </div>
        </div>
      </div>

      {/* Briefing message */}
      {loading ? (
        <div
          className="flex items-center gap-2 text-body-sm py-1"
          style={{ color: "var(--v5-ink-on-dark-soft)" }}
        >
          <Loader2 size={14} className="animate-spin" />
          <span>さくらママが今日のメモを書いてます…</span>
        </div>
      ) : error ? (
        <p className="text-body-sm" style={{ color: "var(--v5-ink-on-dark-soft)" }}>
          {error}
        </p>
      ) : briefing ? (
        <p
          className="m-0 font-serif font-medium whitespace-pre-wrap"
          style={{
            fontSize: 14.5,
            lineHeight: 1.75,
            letterSpacing: "0.02em",
            color: "var(--v5-ink-on-dark)",
          }}
        >
          {briefing.briefing}
        </p>
      ) : null}

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch gap-2.5">
        <button
          type="button"
          onClick={() => void fetchBriefing(true)}
          disabled={loading}
          className="v5-cta-ghost inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-pill font-sans font-medium text-[13px] tracking-[0.04em] whitespace-nowrap active:scale-[0.98] transition disabled:opacity-50"
        >
          <RefreshCw size={13} strokeWidth={1.8} className="shrink-0" />
          メッセージを更新
        </button>
        <Link
          href="/cast/ruri-mama"
          className="v5-cta-primary flex-1 inline-flex items-center justify-center gap-1.5 h-11 rounded-pill font-sans font-semibold text-[13px] tracking-[0.04em] whitespace-nowrap active:scale-[0.98] transition"
        >
          <MessageCircle size={14} strokeWidth={1.8} className="shrink-0" />
          さくらママに相談する
        </Link>
      </div>
    </div>
  );
}
