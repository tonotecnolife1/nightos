"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { CustomerContextPicker } from "@/features/ruri-mama/components/customer-context-picker";
import type { Bottle, CastMemo, Customer } from "@/types/nightos";
import { CategoryTabs } from "./category-tabs";
import { TemplateCard } from "./template-card";
import { TemplateEditor } from "./template-editor";
import {
  TEMPLATES,
  fillTemplate,
  surnameOf,
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

export function TemplateWorkspace({
  customers,
  lookups,
  initialCustomerId,
}: Props) {
  const [category, setCategory] = useState<TemplateCategory>("thanks");
  const [customerId, setCustomerId] = useState<string | undefined>(
    initialCustomerId,
  );

  // Custom user templates loaded from localStorage
  const [allCustom, setAllCustom] = useState<CustomTemplate[]>([]);
  const customForCategory = allCustom.filter((t) => t.category === category);

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

  // 専用文面づくりはさくらママページに委ねる。テンプレートページは
  // 「すぐ使える定型／マイテンプレート」、さくらママは「一から相談して作る」
  // と役割を分け、ここからは新しいセッションへ送り出すだけにする。
  const composeHref = customerId
    ? `/cast/ruri-mama?customerId=${encodeURIComponent(customerId)}&compose=1`
    : "/cast/ruri-mama?compose=1";

  return (
    <div className="space-y-5">
      <CustomerContextPicker
        customers={customers}
        selectedId={customerId}
        onSelect={(id) => {
          setCustomerId(id);
        }}
      />

      <CategoryTabs value={category} onChange={setCategory} />

      {!customerId && (
        <div className="rounded-card bg-champagne-soft/40 border border-gold/30 px-4 py-3.5 text-body-sm text-gold-deep">
          顧客を選択すると、文面が自動で埋まります
        </div>
      )}

      {/* さくらママ専用文面づくりへの入口 — V5 Bordeaux Salon */}
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
            前回の話題・ボトル・来店履歴をもとに、さくらママと相談しながら一通を仕上げます。新しい相談がさくらママページで始まります。
          </p>

          <Link
            href={composeHref}
            className="v5-cta-primary w-full inline-flex items-center justify-center gap-1.5 h-11 rounded-pill font-sans font-semibold text-[13px] tracking-[0.04em] active:scale-[0.98] transition"
          >
            <Sparkles size={14} strokeWidth={1.8} className="shrink-0" />
            ママに専用文面を作ってもらう
            <ArrowRight size={14} strokeWidth={1.8} className="shrink-0" />
          </Link>
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
