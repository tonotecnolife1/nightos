"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "@/components/nightos/card";
import { RuriMamaAvatar } from "@/components/nightos/ruri-mama-avatar";
import { CustomerContextPicker } from "@/features/ruri-mama/components/customer-context-picker";
import { useCastId } from "@/lib/nightos/cast-context";
import type { Bottle, CastMemo, Customer } from "@/types/nightos";
import { CategoryTabs } from "./category-tabs";
import { TemplateCard } from "./template-card";
import { TemplateEditor } from "./template-editor";
import {
  TEMPLATES,
  fillTemplate,
  surnameOf,
  type Template,
  type TemplateCategory,
} from "../data/templates";
import type { CustomTemplate } from "../lib/custom-template-store";

export interface CustomerLookup {
  customer: Customer;
  bottle: Bottle | null;
  memo: CastMemo | null;
}

interface Props {
  customers: Customer[];
  lookups: CustomerLookup[];
  initialCustomerId?: string;
}

interface AiTemplate {
  body: string;
  isStub: boolean;
  generatedAt: number;
}

export function TemplateWorkspace({
  customers,
  lookups,
  initialCustomerId,
}: Props) {
  const castId = useCastId();
  const [category, setCategory] = useState<TemplateCategory>("thanks");
  const [customerId, setCustomerId] = useState<string | undefined>(
    initialCustomerId,
  );

  // Cache AI-generated templates by customerId+category
  const [aiTemplates, setAiTemplates] = useState<
    Record<string, AiTemplate>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom user templates loaded from localStorage
  const [allCustom, setAllCustom] = useState<CustomTemplate[]>([]);
  const customForCategory = allCustom.filter((t) => t.category === category);

  const cacheKey = customerId ? `${customerId}::${category}` : "";
  const aiTemplate = cacheKey ? aiTemplates[cacheKey] : undefined;

  const ctx = useMemo(() => {
    if (!customerId) return null;
    const found = lookups.find((l) => l.customer.id === customerId);
    if (!found) return null;
    return {
      customerName: found.customer.name,
      surname: surnameOf(found.customer.name),
      bottleBrand: found.bottle?.brand ?? null,
      lastTopic: found.memo?.last_topic ?? null,
    };
  }, [customerId, lookups]);

  const visibleTemplates = TEMPLATES.filter((t) => t.category === category);

  const handleGenerateAi = async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          castId: castId,
          category,
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = (await res.json()) as { isStub: boolean; body: string };
      setAiTemplates((prev) => ({
        ...prev,
        [cacheKey]: {
          body: data.body,
          isStub: data.isStub,
          generatedAt: Date.now(),
        },
      }));
    } catch (err) {
      console.error(err);
      setError("生成に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  // When category changes, clear error
  const handleCategoryChange = (next: TemplateCategory) => {
    setCategory(next);
    setError(null);
  };

  return (
    <div className="space-y-5">
      <CustomerContextPicker
        customers={customers}
        selectedId={customerId}
        onSelect={(id) => {
          setCustomerId(id);
          setError(null);
        }}
      />

      <CategoryTabs value={category} onChange={handleCategoryChange} />

      {!customerId && (
        <div className="rounded-card bg-champagne-soft/40 border border-gold/30 px-4 py-3.5 text-body-sm text-gold-deep">
          顧客を選択すると、文面が自動で埋まります
        </div>
      )}

      {/* AI personalized template generator */}
      {customerId && (
        <div
          className="relative overflow-hidden rounded-hero border border-ink/[0.08] shadow-warm p-4 space-y-3"
          style={{
            background:
              "radial-gradient(ellipse at top left, var(--rose-gold-soft) 0%, transparent 55%)," +
              "radial-gradient(ellipse at bottom right, var(--champagne-soft) 0%, transparent 60%)," +
              "linear-gradient(180deg, var(--pearl-light) 0%, var(--pearl) 100%)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <RuriMamaAvatar size={36} />
            <div className="flex-1">
              <div className="text-label-xs tracking-luxe text-wine-deep mb-1">
                さくらママに専用文面を作ってもらう
              </div>
              <div className="text-label-sm text-ink-soft">
                この顧客のカルテを見て、ピッタリの一通を提案します
              </div>
            </div>
          </div>

          {!aiTemplate && !loading && (
            <button
              type="button"
              onClick={handleGenerateAi}
              className="w-full h-11 rounded-pill bg-wine-deep text-pearl-light shadow-luxe inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Sparkles size={16} />
              <span className="text-label-md font-semibold tracking-[0.04em]">
                専用文面を作ってもらう
              </span>
            </button>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 h-11 text-wine-deep">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-body-sm">さくらママが考え中…</span>
            </div>
          )}

          {error && (
            <div className="text-body-sm text-wine-deep">{error}</div>
          )}

          {aiTemplate && (
            <AiTemplateResult
              template={aiTemplate}
              ctx={ctx}
              customerId={customerId}
              category={category}
              onRegenerate={handleGenerateAi}
              regenerating={loading}
            />
          )}
        </div>
      )}

      {/* Custom user templates (above defaults) */}
      {customForCategory.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-label-md text-ink-soft font-medium">
            マイテンプレート
          </h3>
          {customForCategory.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              filled={ctx ? fillTemplate(t.body, ctx) : t.body}
              customerId={customerId}
              disabled={!customerId}
            />
          ))}
        </div>
      )}

      {/* Editor (always available — cast can save without picking customer) */}
      <TemplateEditor category={category} onChange={setAllCustom} />

      {/* Default templates */}
      <div className="space-y-3">
        <h3 className="text-label-md text-ink-soft font-medium">
          定型テンプレート
        </h3>
        {visibleTemplates.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            filled={ctx ? fillTemplate(t.body, ctx) : t.body}
            customerId={customerId}
            disabled={!customerId}
          />
        ))}
      </div>
    </div>
  );
}

interface AiTemplateResultProps {
  template: AiTemplate;
  ctx: {
    customerName: string;
    surname: string;
    bottleBrand: string | null;
    lastTopic: string | null;
  } | null;
  customerId: string;
  category: TemplateCategory;
  onRegenerate: () => void;
  regenerating: boolean;
}

function AiTemplateResult({
  template,
  ctx,
  customerId,
  category,
  onRegenerate,
  regenerating,
}: AiTemplateResultProps) {
  // Replace {姓} with the actual surname
  const filled = ctx ? template.body.split("{姓}").join(ctx.surname) : template.body;

  // Reuse TemplateCard for the copy/log behavior
  const aiAsTemplate: Template = {
    id: `ai-${customerId}-${category}`,
    category,
    label: "さくらママ提案",
    description: template.isStub
      ? "デモ応答（API キー未設定）"
      : "この顧客向けに生成",
    body: template.body,
  };

  return (
    <div className="space-y-2">
      <TemplateCard
        template={aiAsTemplate}
        filled={filled}
        customerId={customerId}
        disabled={false}
      />
      <button
        type="button"
        onClick={onRegenerate}
        disabled={regenerating}
        className="w-full text-label-sm text-gold-deep underline underline-offset-2 disabled:opacity-50"
      >
        別の文面で作り直す
      </button>
    </div>
  );
}
