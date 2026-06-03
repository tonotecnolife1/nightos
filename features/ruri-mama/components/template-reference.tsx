"use client";

import { Check, Copy, FolderHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { cn, copyToClipboard } from "@/lib/utils";
import {
  fillTemplate,
  surnameOf,
  type Template,
} from "@/features/templates/data/templates";
import type { Intent } from "@/types/nightos";
import { purposeToCategory, referenceTemplates } from "../lib/template-bridge";

/**
 * 採用案の上に出す「あなたのテンプレ」参照ストリップ。
 * 相談カテゴリ（follow の purpose）に対応するマイテンプレ / 定型を、
 * 選択中の顧客の姓を差し込んで読みやすく並べ、ワンタップでコピーできる。
 */
export function TemplateReference({
  templates,
  customerName,
}: {
  templates: Template[];
  customerName?: string | null;
}) {
  if (templates.length === 0) return null;
  return (
    <div className="rounded-card border border-gold/20 bg-pearl-warm/40 px-3 py-2.5 space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] text-gold-deep">
        <FolderHeart size={12} />
        あなたのテンプレも参考にできます
      </div>
      <div className="space-y-1.5">
        {templates.map((t) => (
          <TemplateRow key={t.id} template={t} customerName={customerName} />
        ))}
      </div>
    </div>
  );
}

function TemplateRow({
  template,
  customerName,
}: {
  template: Template;
  customerName?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const filled = fillTemplate(template.body, {
    customerName: customerName ?? undefined,
    surname: customerName ? surnameOf(customerName) : undefined,
  });

  const handleCopy = async () => {
    const ok = await copyToClipboard(filled);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-btn bg-pearl-light border border-gold/15 px-2.5 py-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 text-left text-label-sm font-medium text-wine-deep truncate"
        >
          {template.label}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "shrink-0 inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-medium transition active:scale-[0.97]",
            copied
              ? "bg-success text-pearl-light"
              : "bg-champagne-soft/70 text-wine-deep border border-gold/25 hover:bg-champagne-soft",
          )}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "コピー済" : "コピー"}
        </button>
      </div>
      {open && (
        <p className="mt-1.5 text-body-sm leading-relaxed text-ink-soft whitespace-pre-wrap">
          {filled}
        </p>
      )}
    </div>
  );
}

/**
 * メッセージ（採用案）に紐づくテンプレ参照。localStorage は描画中に直接
 * 読まず effect で取得する（SSR / 再描画安定のため）。follow 以外、または
 * テンプレ非対応カテゴリでは何も出さない。
 */
export function TemplateReferenceForMessage({
  castId,
  intent,
  purpose,
  customerName,
}: {
  castId: string;
  intent?: Intent;
  purpose?: string;
  customerName?: string | null;
}) {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    if (intent !== "follow") {
      setTemplates([]);
      return;
    }
    const category = purposeToCategory(purpose);
    setTemplates(category ? referenceTemplates(castId, category) : []);
  }, [castId, intent, purpose]);

  if (templates.length === 0) return null;
  return <TemplateReference templates={templates} customerName={customerName} />;
}
