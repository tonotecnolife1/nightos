"use client";

import { Check, Loader2, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/nightos/card";
import { AI_FETCH_OPTIONS, apiFetchJson, toUserMessage } from "@/lib/nightos/api-fetch";
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

/** メモのフィールドキー */
type FieldKey = "last_topic" | "service_tips" | "next_topics";

const FIELD_DEFS: { key: FieldKey; label: string }[] = [
  { key: "last_topic", label: "前回の話題" },
  { key: "service_tips", label: "接客のコツ" },
  { key: "next_topics", label: "次回話題候補" },
];

/**
 * 「最新情報でメモを更新する」ボタン。
 * タップするとアプリ内のあらゆる情報（来店履歴・ボトル・同伴・LINEスクショ）から
 * メモを再合成する。差分を確認し、更新する項目を選び、文章を編集してから適用できる。
 */
export function RefreshMemoButton({ customerId, castId, current }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<RefreshedMemo | null>(null);
  const [applied, setApplied] = useState(false);
  // 各項目を更新対象に含めるか
  const [selected, setSelected] = useState<Record<FieldKey, boolean>>({
    last_topic: true,
    service_tips: true,
    next_topics: true,
  });
  // 編集後の提案文（適用時はこの値を使う）
  const [draft, setDraft] = useState<Record<FieldKey, string>>({
    last_topic: "",
    service_tips: "",
    next_topics: "",
  });

  const fetchRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetchJson<RefreshedMemo>(
        "/api/refresh-customer-memo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId, castId }),
          ...AI_FETCH_OPTIONS,
        },
      );
      setPreview(data);
      // 提案文を編集用ドラフトに展開し、変更がある項目だけ初期選択する
      setDraft({
        last_topic: data.last_topic ?? "",
        service_tips: data.service_tips ?? "",
        next_topics: data.next_topics ?? "",
      });
      setSelected({
        last_topic: (current.last_topic ?? "") !== (data.last_topic ?? ""),
        service_tips: (current.service_tips ?? "") !== (data.service_tips ?? ""),
        next_topics: (current.next_topics ?? "") !== (data.next_topics ?? ""),
      });
    } catch (err) {
      console.error(err);
      setError(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // 選択した項目だけ編集後の値を採用し、未選択は現在の値を維持する
  const buildNextMemo = () => ({
    last_topic: selected.last_topic ? draft.last_topic.trim() || null : current.last_topic,
    service_tips: selected.service_tips ? draft.service_tips.trim() || null : current.service_tips,
    next_topics: selected.next_topics ? draft.next_topics.trim() || null : current.next_topics,
  });

  const selectedCount = FIELD_DEFS.filter((f) => selected[f.key]).length;

  const apply = () => {
    if (!preview || selectedCount === 0) return;
    const next = buildNextMemo();
    // Save to localStorage so the cast sees the new version on next load
    // In production this would be a Supabase upsert
    const key = `nightos.memo-override.${customerId}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        ...next,
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
      <Card className="p-3 !border-gold/30 !bg-champagne-soft/40 space-y-3">
        <div className="flex items-center gap-1.5">
          <RefreshCw size={14} className="text-gold-deep" />
          <span className="text-body-sm font-medium text-gold-deep">
            メモ更新プレビュー
          </span>
        </div>
        {preview.summary && (
          <p className="text-[11px] text-ink-soft bg-pearl-warm px-2 py-1.5 rounded-btn">
            {preview.summary}
          </p>
        )}
        <p className="text-[10px] text-ink-mute">
          更新する項目を選び、必要なら文章を編集してください
        </p>
        {FIELD_DEFS.map((f) => (
          <FieldRow
            key={f.key}
            label={f.label}
            before={current[f.key]}
            value={draft[f.key]}
            checked={selected[f.key]}
            onToggle={() =>
              setSelected((s) => ({ ...s, [f.key]: !s[f.key] }))
            }
            onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
          />
        ))}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={apply}
            disabled={selectedCount === 0}
            className="flex-1 h-9 rounded-btn bg-success/10 text-success border border-success/25 text-label-sm font-medium active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            <Check size={12} className="inline mr-1" />
            {selectedCount === 0
              ? "更新する項目を選択"
              : `${selectedCount}件を更新`}
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
          : "bg-champagne-soft/60 text-gold-deep border-gold/30 hover:bg-champagne-soft/80",
      )}
    >
      {loading ? (
        <>
          <Loader2 size={13} className="animate-spin" />
          メモを生成中…
        </>
      ) : (
        <>
          <RefreshCw size={13} />
          アプリ内の最新情報でメモを更新
        </>
      )}
      {error && <span className="text-wine-deep text-[10px]">{error}</span>}
    </button>
  );
}

function FieldRow({
  label,
  before,
  value,
  checked,
  onToggle,
  onChange,
}: {
  label: string;
  before: string | null;
  value: string;
  checked: boolean;
  onToggle: () => void;
  onChange: (v: string) => void;
}) {
  const changed = (before ?? "") !== (value ?? "");
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="w-3.5 h-3.5 accent-gold-deep rounded-sm"
        />
        <span className="text-[10px] text-ink-mute font-medium">{label}</span>
        {changed && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-badge bg-champagne-soft/60 text-gold-deep">
            変更あり
          </span>
        )}
      </label>
      {checked && before && changed && (
        <div className="text-[11px] text-ink-mute line-through break-words pl-2 border-l-2 border-pearl-soft">
          {before}
        </div>
      )}
      {checked ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{ fontSize: "16px" }}
          className={cn(
            "w-full max-h-40 rounded-btn border bg-pearl-warm px-2.5 py-1.5 text-ink outline-none resize-none leading-relaxed",
            changed ? "border-gold/40 focus:border-gold-deep" : "border-pearl-soft focus:border-gold/40",
          )}
        />
      ) : (
        <div className="text-[11px] text-ink-mute break-words pl-2 border-l-2 border-pearl-soft">
          更新しない（現在の内容を維持）
        </div>
      )}
    </div>
  );
}
