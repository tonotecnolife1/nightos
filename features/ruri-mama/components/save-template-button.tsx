"use client";

import { BookmarkPlus, Check, Save, X } from "lucide-react";
import { useState } from "react";
import { useCastId } from "@/lib/nightos/cast-context";
import { cn } from "@/lib/utils";
import {
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
} from "@/features/templates/data/templates";
import {
  newCustomId,
  saveCustomTemplate,
} from "@/features/templates/lib/custom-template-store";

/**
 * 採用した文面を「マイテンプレに保存」する導線。
 * 文面はあらかじめ「送る本文」抽出 + 顧客名のプレースホルダ化を済ませて渡す。
 * 相談で生まれた良い文面が、次から使える型として蓄積されていく。
 */
export function SaveTemplateButton({
  defaultBody,
  defaultCategory,
}: {
  defaultBody: string;
  defaultCategory: TemplateCategory;
}) {
  const castId = useCastId();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [label, setLabel] = useState("");
  const [body, setBody] = useState(defaultBody);
  const [category, setCategory] = useState<TemplateCategory>(defaultCategory);

  const handleSave = () => {
    if (!body.trim()) return;
    saveCustomTemplate(castId, {
      id: newCustomId(),
      category,
      label: label.trim() || "さくらママ提案",
      body: body.trim(),
      description: "さくらママの相談から保存",
    });
    setSaved(true);
    setOpen(false);
  };

  if (saved) {
    return (
      <span className="inline-flex items-center gap-1 px-2 text-[11px] font-medium text-success">
        <Check size={12} /> マイテンプレに保存しました
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium border border-gold/30 bg-champagne-soft/60 text-wine-deep transition active:scale-[0.97] hover:bg-champagne-soft/80"
      >
        <BookmarkPlus size={12} />
        マイテンプレに保存
      </button>
    );
  }

  return (
    <div className="w-full space-y-2.5 rounded-card border border-gold/25 bg-pearl-warm/50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-label-sm font-semibold text-wine-deep">
          マイテンプレに保存
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="閉じる"
          className="text-ink-mute"
        >
          <X size={14} />
        </button>
      </div>

      <div>
        <label className="block text-label-sm text-ink-soft mb-1">
          タイトル
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="例: 常連さんお礼（軽め）"
          className="w-full h-9 px-3 rounded-btn bg-pearl-light border border-pearl-soft text-ink text-body-sm outline-none focus:border-gold/30"
        />
      </div>

      <div>
        <label className="block text-label-sm text-ink-soft mb-1">
          カテゴリ
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATE_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={cn(
                "h-8 px-3 rounded-full text-[11px] font-medium border transition",
                category === c.value
                  ? "bg-wine-deep text-pearl-light border-wine-deep"
                  : "bg-pearl-light text-ink-soft border-pearl-soft",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-label-sm text-ink-soft mb-1">
          文面（{`{姓}`} {`{ボトル名}`} {`{前回の話題}`} が使えます）
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 rounded-btn bg-pearl-light border border-pearl-soft text-ink text-body-sm outline-none focus:border-gold/30 resize-none"
        />
        <p className="mt-1 text-[10px] leading-snug text-ink-mute">
          お名前は自動で {`{姓}`} に置き換えました。ボトル名や前回の話題も
          {` {ボトル名} {前回の話題} `}に書き換えると、次から自動で差し込めます。
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!body.trim()}
          className={cn(
            "inline-flex items-center gap-1 h-9 px-5 rounded-pill text-label-sm font-semibold tracking-[0.04em]",
            body.trim()
              ? "bg-wine-deep text-pearl-light shadow-luxe"
              : "bg-pearl-soft text-ink-mute",
          )}
        >
          <Save size={12} />
          保存
        </button>
      </div>
    </div>
  );
}
