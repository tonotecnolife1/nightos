"use client";

import { AlertCircle, Check, Copy, Users } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/nightos/badge";
import { Card } from "@/components/nightos/card";
import { cn, copyToClipboard } from "@/lib/utils";
import { recordFollowLogAction } from "../actions";
import type { Template } from "../data/templates";

// Track template usage per customer to warn about duplicates
const USAGE_KEY = "nightos.template-usage";

interface UsageRecord {
  templateId: string;
  customerId: string;
  castId: string;
  usedAt: string;
}

function getRecentUsages(): UsageRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as UsageRecord[];
    // Only keep last 30 days
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return all.filter((u) => new Date(u.usedAt).getTime() > cutoff);
  } catch {
    return [];
  }
}

function recordUsage(templateId: string, customerId: string, castId: string) {
  if (typeof window === "undefined") return;
  const usages = getRecentUsages();
  usages.push({
    templateId,
    customerId,
    castId,
    usedAt: new Date().toISOString(),
  });
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(usages));
  } catch {
    // quota
  }
}

interface Props {
  template: Template;
  filled: string;
  customerId?: string;
  disabled?: boolean;
  castId?: string;
}

export function TemplateCard({
  template,
  filled,
  customerId,
  disabled,
  castId = "cast1",
}: Props) {
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const [usedBefore, setUsedBefore] = useState(false);

  useEffect(() => {
    if (!customerId) return;
    const usages = getRecentUsages();
    const match = usages.find(
      (u) => u.templateId === template.id && u.customerId === customerId,
    );
    setUsedBefore(!!match);
  }, [customerId, template.id]);

  const handleCopy = () => {
    if (disabled || !customerId) return;
    startTransition(async () => {
      await copyToClipboard(filled);
      await recordFollowLogAction({
        customerId,
        templateType: template.category,
      });
      recordUsage(template.id, customerId, castId);
      setCopied(true);
      setUsedBefore(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <Card className="p-4 space-y-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{template.label}</Badge>
          <span className="text-label-sm text-ink-mute">
            {template.description}
          </span>
        </div>
      </header>
      <p className="font-serif text-body-md text-ink leading-relaxed whitespace-pre-wrap rounded-card bg-pearl-soft px-3.5 py-3 border border-line">
        {filled}
      </p>
      <div className="flex items-center justify-between">
        {usedBefore ? (
          <span className="flex items-center gap-1 text-label-sm text-warning">
            <AlertCircle size={12} />
            このお客様に送信済み
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={handleCopy}
          disabled={disabled || pending || !customerId}
          className={cn(
            "inline-flex items-center gap-1.5 h-10 px-5 rounded-pill text-label-md font-semibold tracking-[0.04em] transition-all",
            disabled || !customerId
              ? "bg-pearl-soft text-ink-mute cursor-not-allowed"
              : copied
                ? "bg-success text-pearl-light-light shadow-soft"
                : "bg-wine-deep text-pearl-light-light shadow-luxe active:scale-95",
          )}
        >
          {copied ? (
            <>
              <Check size={14} />
              コピー＆記録完了
            </>
          ) : (
            <>
              <Copy size={14} />
              コピーしてLINEへ
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
