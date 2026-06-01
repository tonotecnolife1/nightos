"use client";

import { useEffect, useState } from "react";
import { BookOpen, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/nightos/empty-state";
import { SAKURA_MAMA_DISPLAY_NAME } from "@/lib/nightos/constants";
import {
  type PinnedMessage,
  getPinnedMessages,
  subscribePins,
} from "@/lib/nightos/chat-pin-store";
import {
  type Learning,
  type LearningsSnapshot,
  getLearningsSnapshot,
  pinsSignature,
  setLearningsSnapshot,
} from "@/lib/nightos/chat-learnings-store";

/**
 * 学び tab — asks さくらママ (AI) to read the pinned conversations and organise
 * them into a few remember-this cards. Results are cached until the pins change.
 */
export function LearningsView() {
  const [pins, setPins] = useState<PinnedMessage[]>([]);
  const [snapshot, setSnapshot] = useState<LearningsSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const refresh = () => setPins(getPinnedMessages());
    refresh();
    setSnapshot(getLearningsSnapshot());
    return subscribePins(refresh);
  }, []);

  const signature = pinsSignature(pins);
  const isStale = !!snapshot && snapshot.signature !== signature;
  const hasFresh = !!snapshot && snapshot.signature === signature;

  const organise = async () => {
    if (pins.length === 0 || loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/chat-learnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pins: pins.map((p) => ({
            content: p.content,
            senderName: p.senderName,
            memo: p.memo,
            customerName: p.customerName,
          })),
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { learnings: Learning[] };
      const snap: LearningsSnapshot = {
        learnings: data.learnings,
        signature,
        generatedAt: new Date().toISOString(),
      };
      setLearningsSnapshot(snap);
      setSnapshot(snap);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (pins.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          icon={<BookOpen size={22} />}
          title="学びはまだありません"
          description={`会話をキープすると、${SAKURA_MAMA_DISPLAY_NAME}がその内容を読み取って、覚えておくべき学びに自動で整理します。`}
          tone="amethyst"
        />
      </div>
    );
  }

  return (
    <div className="px-5 py-4 space-y-3">
      {/* Intro / action header */}
      <div className="rounded-card border border-gold/20 bg-champagne-soft/30 px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} className="text-gold-deep" />
          <span className="font-serif text-[15px] font-medium text-ink">
            {SAKURA_MAMA_DISPLAY_NAME}が学びを整理
          </span>
        </div>
        <p className="text-body-sm text-ink-soft leading-relaxed">
キープした{pins.length}件の会話から、覚えておくべきことをまとめます。
        </p>
        {(isStale || !snapshot) && (
          <button
            type="button"
            onClick={organise}
            disabled={loading}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-pill bg-wine-deep text-pearl-light px-4 py-2 text-body-sm font-medium shadow-warm disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {snapshot ? "学びを更新する" : "学びを整理する"}
          </button>
        )}
        {isStale && !loading && (
          <p className="mt-1.5 text-[11px] text-gold-deep">
キープが更新されています。整理し直すと最新になります。
          </p>
        )}
        {error && (
          <p className="mt-1.5 text-[11px] text-wine-deep">
            整理に失敗しました。もう一度お試しください。
          </p>
        )}
      </div>

      {/* Learning cards */}
      {snapshot && snapshot.learnings.length > 0 && (
        <>
          {snapshot.learnings.map((l, i) => (
            <LearningCard key={i} learning={l} />
          ))}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-ink-mute">
              {formatGeneratedAt(snapshot.generatedAt)}に整理
            </span>
            {hasFresh && (
              <button
                type="button"
                onClick={organise}
                disabled={loading}
                className="inline-flex items-center gap-1 text-[11px] text-gold-deep hover:underline disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <RefreshCw size={11} />
                )}
                整理し直す
              </button>
            )}
          </div>
        </>
      )}

      {snapshot && snapshot.learnings.length === 0 && (
        <p className="text-center text-body-sm text-ink-mute py-6">
          まだ学びを抽出できませんでした。メモを足してから整理し直してみてください。
        </p>
      )}
    </div>
  );
}

function LearningCard({ learning }: { learning: Learning }) {
  return (
    <div className="rounded-card border border-ink/[0.08] bg-pearl-light shadow-soft px-4 py-3">
      <span className="inline-block rounded-pill bg-success/10 border border-success/20 px-2 py-0.5 text-[10px] font-medium text-success tracking-[0.04em] mb-1.5">
        {learning.category}
      </span>
      <h3 className="font-serif text-[15px] leading-snug font-medium text-ink mb-1">
        {learning.title}
      </h3>
      <p className="text-body-sm text-ink-soft leading-relaxed whitespace-pre-wrap break-words">
        {learning.body}
      </p>
    </div>
  );
}

function formatGeneratedAt(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}
