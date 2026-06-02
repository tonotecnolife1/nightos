"use client";

import Image from "next/image";
import { Loader2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { CustomerContextPicker } from "@/features/ruri-mama/components/customer-context-picker";
import { AI_FETCH_OPTIONS, apiFetchJson, toUserMessage } from "@/lib/nightos/api-fetch";
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
      const data = await apiFetchJson<{ isStub: boolean; body: string }>(
        "/api/generate-template",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId,
            castId: castId,
            category,
          }),
          ...AI_FETCH_OPTIONS,
        },
      );
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
      setError(toUserMessage(err));
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

      {/* AI personalized template generator — V5 Bordeaux Salon */}
      {customerId && (
        <div className="v5-sakura-surface rounded-hero p-5 flex flex-col gap-4">
          {/* Header: framed photo + eyebrow */}
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-full flex-shrink-0 p-[2px]"
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
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="inline-flex items-center gap-1.5 mb-1 font-sans font-medium"
                style={{
                  fontSize: 11,
                  lineHeight: 1,
                  letterSpacing: "0.32em",
                  color: "var(--v5-gold-mid)",
                }}
              >
                <Sparkles size={11} strokeWidth={1.8} />
                <span>さくらママの専用文面</span>
              </div>
              <div
                className="font-serif font-normal v5-metallic"
                style={{ fontSize: 19, lineHeight: 1.2, letterSpacing: "0.04em" }}
              >
                この顧客にピッタリの一通
              </div>
            </div>
          </div>

          <p
            className="m-0 text-body-sm"
            style={{ color: "var(--v5-ink-on-dark-soft)", lineHeight: 1.7 }}
          >
            前回の話題・ボトル・来店履歴を読んで、選んだカテゴリの文面を提案します。
          </p>

          {!aiTemplate && !loading && (
            <button
              type="button"
              onClick={handleGenerateAi}
              className="v5-cta-primary w-full inline-flex items-center justify-center gap-1.5 h-11 rounded-pill font-sans font-semibold text-[13px] tracking-[0.04em] active:scale-[0.98] transition"
            >
              <Sparkles size={14} strokeWidth={1.8} className="shrink-0" />
              専用文面を作ってもらう
            </button>
          )}

          {loading && (
            <div
              className="flex items-center justify-center gap-2 h-11 text-body-sm"
              style={{ color: "var(--v5-ink-on-dark-soft)" }}
            >
              <Loader2 size={16} className="animate-spin" />
              <span>さくらママが考え中…</span>
            </div>
          )}

          {error && (
            <div
              className="text-body-sm"
              style={{ color: "var(--v5-ink-on-dark-soft)" }}
            >
              {error}
            </div>
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
        className="w-full text-label-sm underline underline-offset-2 disabled:opacity-50"
        style={{ color: "var(--v5-gold-on-dark)" }}
      >
        別の文面で作り直す
      </button>
    </div>
  );
}
