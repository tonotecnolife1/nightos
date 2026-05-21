"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { SakuraMamaAvatar } from "@/components/nightos/sakura-mama-avatar";
import { cn } from "@/lib/utils";
import type { LineScreenshot } from "@/types/nightos";
import type { LineSummaryResponse } from "@/app/api/line-history-summary/route";

interface Props {
  customerId: string;
  customerName: string;
  castName: string;
  screenshots: LineScreenshot[];
}

interface Cached {
  narrative: string;
  isStub: boolean;
  generatedAt: string;
  /** screenshots count used to generate — invalidate cache if more are added */
  screenshotCount: number;
}

function cacheKey(customerId: string) {
  return `nightos.line-summary.${customerId}`;
}

function loadCache(customerId: string, currentCount: number): Cached | null {
  try {
    const raw = localStorage.getItem(cacheKey(customerId));
    if (!raw) return null;
    const cached = JSON.parse(raw) as Cached;
    // Invalidate if screenshots were added/removed
    if (cached.screenshotCount !== currentCount) return null;
    return cached;
  } catch {
    return null;
  }
}

function saveCache(customerId: string, data: Cached) {
  try {
    localStorage.setItem(cacheKey(customerId), JSON.stringify(data));
  } catch {}
}

export function LineCommunicationSummary({
  customerId,
  customerName,
  castName,
  screenshots,
}: Props) {
  const [narrative, setNarrative] = useState<string | null>(null);
  const [isStub, setIsStub] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const sorted = [...screenshots].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const fetchSummary = async (force = false) => {
    if (!force) {
      const cached = loadCache(customerId, screenshots.length);
      if (cached) {
        setNarrative(cached.narrative);
        setIsStub(cached.isStub);
        return;
      }
    }
    setLoading(true);
    setError(false);
    try {
      const summaries = sorted.map((ss) => ({
        date: new Date(ss.created_at).toLocaleDateString("ja-JP"),
        summary: ss.extracted.summary,
        last_topic: ss.extracted.last_topic,
        service_tips: ss.extracted.service_tips,
        next_topics: ss.extracted.next_topics,
      }));
      const res = await fetch("/api/line-history-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, castName, summaries }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as LineSummaryResponse;
      setNarrative(data.narrative);
      setIsStub(data.isStub);
      saveCache(customerId, {
        narrative: data.narrative,
        isStub: data.isStub,
        generatedAt: data.generatedAt,
        screenshotCount: screenshots.length,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (screenshots.length > 0) void fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, screenshots.length]);

  if (screenshots.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amethyst-border bg-amethyst-muted/40 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SakuraMamaAvatar size={28} />
          <div>
            <p className="text-label-sm font-medium text-amethyst-dark">連絡の経緯</p>
            <p className="text-[10px] text-ink-muted">さくらママによる要約</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void fetchSummary(true)}
          disabled={loading}
          className="p-1.5 rounded-full text-ink-muted hover:text-amethyst-dark hover:bg-amethyst-muted transition disabled:opacity-40"
          aria-label="再生成"
        >
          <RefreshCw size={13} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center gap-2 text-body-sm text-ink-muted py-1">
          <Loader2 size={13} className="animate-spin shrink-0" />
          <span>さくらママが読み解いています…</span>
        </div>
      ) : error ? (
        <div className="text-body-sm text-ink-muted py-1">
          読み込みに失敗しました。
          <button
            type="button"
            onClick={() => void fetchSummary(true)}
            className="ml-1 text-amethyst-dark underline underline-offset-2"
          >
            再試行
          </button>
        </div>
      ) : narrative ? (
        <div className="space-y-2">
          <p className="text-body-md text-ink leading-relaxed whitespace-pre-wrap">
            {narrative}
          </p>
          {isStub && (
            <p className="text-[10px] text-ink-muted flex items-center gap-1">
              <Sparkles size={9} />
              デモ応答（本番では Claude AI が生成）
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
