"use client";

import { Check, Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/nightos/card";
import { cn } from "@/lib/utils";

interface Props {
  customerId: string;
  castId: string;
  /** 現在のメモ — 差分表示用 */
  current: {
    last_topic: string | null;
    service_tips: string | null;
    next_topics: string | null;
  };
}

interface RefreshedMemo {
  last_topic: string | null;
  service_tips: string | null;
  next_topics: string | null;
  summary: string;
}

/**
 * 「最新情報でメモを更新する」ボタン。
 * タップするとアプリ内のあらゆる情報（来店履歴・ボトル・同伴・LINEスクショ）から
 * さくらママがメモを合成する。差分を確認してから適用できる。
 */
export function RefreshMemoButton({ customerId, castId, current }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<RefreshedMemo | null>(null);
  const [applied, setApplied] = useState(false);

  const fetchRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/refresh-customer-memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, castId }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = (await res.json()) as RefreshedMemo;
      setPreview(data);
    } catch (err) {
      console.error(err);
      setError("メモの更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const apply = () => {
    if (!preview) return;
    // Save to localStorage so the cast sees the new version on next load
    // In production this would be a Supabase upsert
    const key = `nightos.memo-override.${customerId}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        last_topic: preview.last_topic,
        service_tips: preview.service_tips,
        next_topics: preview.next_topics,
        updated_at: new Date().toISOString(),
      }),
    );
    setApplied(true);
  };

  const cancel = () => {
    setPreview(null);
    setError(null);
    setApplied(false);
  };

  if (applied) {
    return (
      <Card className="p-3 !border-success/30 !bg-success/5">
        <div className="flex items-center gap-2">
          <Check size={14} className="text-success" />
          <span className="text-body-sm text-success font-medium">
            メモを更新しました
          </span>
          <button
            type="button"
            onClick={cancel}
            className="ml-auto text-[10px] text-ink-mute underline"
          >
            閉じる
          </button>
        </div>
      </Card>
    );
  }

  if (preview) {
    return (
      <Card className="p-3 !border-gold/30 !bg-champagne-soft/60/20 space-y-3">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-gold-deep" />
          <span className="text-body-sm font-medium text-gold-deep">
            メモ更新プレビュー
          </span>
        </div>
        {preview.summary && (
          <p className="text-[11px] text-ink-soft bg-pearl-warm px-2 py-1.5 rounded-btn">
            {preview.summary}
          </p>
        )}
        <DiffRow label="前回の話題" before={current.last_topic} after={preview.last_topic} />
        <DiffRow label="接客のコツ" before={current.service_tips} after={preview.service_tips} />
        <DiffRow label="次回話題候補" before={current.next_topics} after={preview.next_topics} />

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={apply}
            className="flex-1 h-9 rounded-btn bg-success/10 text-success border border-success/25 text-label-sm font-medium active:scale-[0.98]"
          >
            <Check size={12} className="inline mr-1" />
            この内容で更新
          </button>
          <button
            type="button"
            onClick={cancel}
            className="h-9 px-3 rounded-btn bg-pearl-soft text-ink-soft text-label-sm active:scale-[0.98]"
          >
            <X size={12} className="inline mr-1" />
            破棄
          </button>
        </div>
      </Card>
    );
  }

  return (
    <button
      type="button"
      onClick={fetchRefresh}
      disabled={loading}
      className={cn(
        "w-full flex items-center justify-center gap-1.5 h-10 rounded-btn border transition-all active:scale-[0.98]",
        loading
          ? "bg-pearl-soft text-ink-mute border-pearl-soft"
          : "bg-champagne-soft/60 text-gold-deep border-gold/30 hover:bg-champagne-soft/60/70",
      )}
    >
      {loading ? (
        <>
          <Loader2 size={13} className="animate-spin" />
          さくらママがメモを合成中…
        </>
      ) : (
        <>
          <Sparkles size={13} />
          アプリ内の全情報でメモを自動更新
        </>
      )}
      {error && <span className="text-wine-deep text-[10px]">{error}</span>}
    </button>
  );
}

function DiffRow({
  label,
  before,
  after,
}: {
  label: string;
  before: string | null;
  after: string | null;
}) {
  const changed = (before ?? "") !== (after ?? "");
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-ink-mute font-medium">{label}</span>
        {changed && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-badge bg-champagne-soft/60 text-gold-deep">
            変更あり
          </span>
        )}
      </div>
      {changed && before && (
        <div className="text-[11px] text-ink-mute line-through break-words pl-2 border-l-2 border-pearl-soft">
          {before}
        </div>
      )}
      <div
        className={cn(
          "text-[11px] break-words pl-2 border-l-2",
          changed ? "text-ink border-amethyst" : "text-ink-soft border-pearl-soft",
        )}
      >
        {after ?? "(なし)"}
      </div>
    </div>
  );
}
