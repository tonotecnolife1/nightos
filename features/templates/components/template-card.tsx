"use client";

import { Check, Copy, Pencil, RotateCcw, Save, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Badge } from "@/components/nightos/badge";
import { Card } from "@/components/nightos/card";
import { cn, copyToClipboard } from "@/lib/utils";
import { recordFollowLogAction } from "../actions";
import type { Template } from "../data/templates";

interface EditValues {
  label: string;
  body: string;
  description: string;
}

interface Props {
  template: Template;
  filled: string;
  customerId?: string;
  disabled?: boolean;
  /** When true, an 編集 (edit) button is shown to customise this template. */
  editable?: boolean;
  /** True when a cast edit is currently applied (enables the reset action). */
  isOverridden?: boolean;
  /** Persist an edit to this template. */
  onSaveEdit?: (next: EditValues) => void;
  /** Restore the original built-in text. */
  onResetEdit?: () => void;
}

export function TemplateCard({
  template,
  filled,
  customerId,
  disabled,
  editable = false,
  isOverridden = false,
  onSaveEdit,
  onResetEdit,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EditValues>({
    label: template.label,
    body: template.body,
    description: template.description,
  });

  const handleCopy = () => {
    if (disabled) return;
    startTransition(async () => {
      await copyToClipboard(filled);
      // Only record a follow-up log when a customer is in context.
      if (customerId) {
        await recordFollowLogAction({
          customerId,
          templateType: template.category,
        });
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const startEdit = () => {
    setDraft({
      label: template.label,
      body: template.body,
      description: template.description,
    });
    setEditing(true);
  };

  const handleSave = () => {
    const body = draft.body.trim();
    if (!body) return;
    onSaveEdit?.({
      label: draft.label.trim() || template.label,
      body,
      description: draft.description.trim() || template.description,
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <Card className="p-4 space-y-2.5">
        <div>
          <label className="block text-label-sm text-ink-soft mb-1">
            タイトル
          </label>
          <input
            type="text"
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            placeholder="例: 丁寧に"
            className="w-full h-9 px-3 rounded-btn bg-pearl-soft border border-line text-ink text-body-sm outline-none focus:border-gold/30"
          />
        </div>
        <div>
          <label className="block text-label-sm text-ink-soft mb-1">
            文面（{`{顧客名}`} {`{姓}`} {`{ボトル名}`} {`{前回の話題}`} が使えます）
          </label>
          <textarea
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 rounded-btn bg-pearl-soft border border-line text-ink text-body-sm outline-none focus:border-gold/30 resize-none whitespace-pre-wrap"
          />
        </div>
        <div>
          <label className="block text-label-sm text-ink-soft mb-1">
            説明（任意）
          </label>
          <input
            type="text"
            value={draft.description}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
            placeholder="例: VIPや初対面のお客様向け"
            className="w-full h-9 px-3 rounded-btn bg-pearl-soft border border-line text-ink text-body-sm outline-none focus:border-gold/30"
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          {isOverridden ? (
            <button
              type="button"
              onClick={() => {
                onResetEdit?.();
                setEditing(false);
              }}
              className="inline-flex items-center gap-1 text-label-sm text-ink-soft"
            >
              <RotateCcw size={12} />
              元に戻す
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex items-center gap-1 h-9 px-3 rounded-btn bg-pearl-soft border border-line text-ink-soft text-label-sm"
            >
              <X size={12} />
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!draft.body.trim()}
              className={cn(
                "inline-flex items-center gap-1 h-9 px-5 rounded-pill text-label-sm font-semibold tracking-[0.04em]",
                draft.body.trim()
                  ? "bg-wine-deep text-pearl-light shadow-luxe"
                  : "bg-pearl-soft text-ink-mute",
              )}
            >
              <Save size={12} />
              保存
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4 space-y-3">
        <header className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge tone="neutral">{template.label}</Badge>
            <span className="text-label-sm text-ink-mute truncate">
              {template.description}
            </span>
          </div>
          {editable && (
            <button
              type="button"
              onClick={startEdit}
              className="inline-flex items-center gap-1 shrink-0 text-label-sm text-gold-deep"
            >
              <Pencil size={12} />
              編集
            </button>
          )}
        </header>
        <p className="font-serif text-body-md text-ink leading-relaxed whitespace-pre-wrap rounded-card bg-pearl-soft px-3.5 py-3 border border-line">
          {filled}
        </p>
        <div className="flex items-center justify-between">
          {isOverridden ? (
            <span className="flex items-center gap-1 text-label-sm text-ink-mute">
              <Pencil size={11} />
              編集済み
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={handleCopy}
            disabled={disabled || pending}
            className={cn(
              "inline-flex items-center gap-1.5 h-10 px-5 rounded-pill text-label-md font-semibold tracking-[0.04em] transition-all",
              disabled
                ? "bg-pearl-soft text-ink-mute cursor-not-allowed"
                : copied
                  ? "bg-success text-pearl-light shadow-soft"
                  : "bg-wine-deep text-pearl-light shadow-luxe active:scale-95",
            )}
          >
            {copied ? (
              <>
                <Check size={14} />
                コピー完了
              </>
            ) : (
              <>
                <Copy size={14} />
                {customerId ? "コピーしてLINEへ" : "コピー"}
              </>
            )}
          </button>
        </div>
      </Card>

      {copied && (
        <div className="fixed inset-x-0 bottom-24 z-[90] flex justify-center pointer-events-none">
          <div className="inline-flex items-center gap-1.5 rounded-pill bg-ink/85 text-pearl-light px-4 py-2 text-body-sm shadow-luxe">
            <Check size={14} />
            コピー完了しました
          </div>
        </div>
      )}
    </>
  );
}
