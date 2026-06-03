"use client";

import { useState } from "react";
import { CategoryTabs } from "./category-tabs";
import { TemplateCard } from "./template-card";
import { TemplateEditor } from "./template-editor";
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
} from "../data/templates";

export function TemplateWorkspace() {
  const [category, setCategory] = useState<TemplateCategory>("thanks");

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
        {visibleTemplates.map((t) => (
          <TemplateCard key={t.id} template={t} filled={t.body} />
        ))}
      </div>
    </div>
  );
}
