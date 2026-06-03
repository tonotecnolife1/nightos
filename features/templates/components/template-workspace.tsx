"use client";

import { useEffect, useState } from "react";
import { useCastId } from "@/lib/nightos/cast-context";
import { CategoryTabs } from "./category-tabs";
import { TemplateCard } from "./template-card";
import { TemplateEditor } from "./template-editor";
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
} from "../data/templates";
import {
  applyOverride,
  loadTemplateOverrides,
  resetTemplateOverride,
  saveTemplateOverride,
  type TemplateOverride,
} from "../lib/custom-template-store";

export function TemplateWorkspace() {
  const castId = useCastId();
  const [category, setCategory] = useState<TemplateCategory>("thanks");

  // Per-cast edits applied on top of the built-in (定型) templates
  const [overrides, setOverrides] = useState<Record<string, TemplateOverride>>(
    {},
  );

  useEffect(() => {
    setOverrides(loadTemplateOverrides(castId));
  }, [castId]);

  const handleSaveOverride = (
    templateId: string,
    next: { label: string; body: string; description: string },
  ) => {
    saveTemplateOverride(castId, templateId, next);
    setOverrides(loadTemplateOverrides(castId));
  };

  const handleResetOverride = (templateId: string) => {
    resetTemplateOverride(castId, templateId);
    setOverrides(loadTemplateOverrides(castId));
  };

  const activeCat = TEMPLATE_CATEGORIES.find((c) => c.value === category);
  const visibleTemplates = TEMPLATES.filter((t) => t.category === category);

  return (
    <div className="space-y-5">
      <CategoryTabs value={category} onChange={setCategory} />

      {activeCat && (
        <p className="text-body-sm text-ink-soft leading-relaxed">
          {activeCat.description}
        </p>
      )}

      {/* マイテンプレート — このページの主役（登録・編集・削除） */}
      <TemplateEditor category={category} />

      {/* 定型テンプレート — コピーしてそのまま使えるプリセット集 */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <h3 className="text-label-md text-ink-soft font-medium">
            定型テンプレート
          </h3>
          <span className="text-label-sm text-ink-mute">
            コピーしてそのまま使えます
          </span>
        </div>
        {visibleTemplates.map((base) => {
          const t = applyOverride(base, overrides);
          return (
            <TemplateCard
              key={t.id}
              template={t}
              filled={t.body}
              editable
              isOverridden={!!overrides[t.id]}
              onSaveEdit={(next) => handleSaveOverride(t.id, next)}
              onResetEdit={() => handleResetOverride(t.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
