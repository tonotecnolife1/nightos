"use client";

import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/nightos/card";
import { useCastId } from "@/lib/nightos/cast-context";
import { cn } from "@/lib/utils";
import {
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
} from "../data/templates";
import {
  type CustomTemplate,
  deleteCustomTemplate,
  loadCustomTemplates,
  newCustomId,
  saveCustomTemplate,
} from "../lib/custom-template-store";

interface Props {
  category: TemplateCategory;
  /** Notifies the parent when the custom template list changes. */
  onChange: (templates: CustomTemplate[]) => void;
}

interface EditorState {
  id: string;
  label: string;
  body: string;
  description: string;
}

const EMPTY_EDITOR: EditorState = {
  id: "",
  label: "",
  body: "",
  description: "",
};

export function TemplateEditor({ category, onChange }: Props) {
  const castId = useCastId();
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [customs, setCustoms] = useState<CustomTemplate[]>([]);

  // Restore on mount and when category changes
  useEffect(() => {
    const all = loadCustomTemplates(castId);
    setCustoms(all.filter((t) => t.category === category));
    onChange(all);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const refresh = () => {
    const all = loadCustomTemplates(castId);
    setCustoms(all.filter((t) => t.category === category));
    onChange(all);
  };

  const startNew = () => {
    setEditor({
      ...EMPTY_EDITOR,
      id: newCustomId(),
    });
  };

  const startEdit = (template: CustomTemplate) => {
    setEditor({
      id: template.id,
      label: template.label,
      body: template.body,
      description: template.description,
    });
  };

  const handleSave = () => {
    if (!editor) return;
    const label = editor.label.trim() || "マイテンプレート";
    const body = editor.body.trim();
    if (!body) return;
    saveCustomTemplate(castId, {
      id: editor.id,
      category,
      label,
      body,
      description: editor.description.trim() || "保存したテンプレート",
    });
    setEditor(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm("このテンプレートを削除しますか？")) return;
    deleteCustomTemplate(castId, id);
    refresh();
  };

  return (
    <Card className="!bg-pearl-warm !border-pearl-soft p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Pencil size={14} className="text-wine-deep" />
          <h3 className="text-label-md text-ink font-semibold">
            マイテンプレート
          </h3>
          <span className="text-label-sm text-ink-mute">
            {customs.length}件
          </span>
        </div>
        {!editor && (
          <button
            type="button"
            onClick={startNew}
            className="flex items-center gap-1 text-label-sm text-wine-deep"
          >
            <Plus size={12} />
            新規作成
          </button>
        )}
      </div>

      {editor && (
        <div className="space-y-2.5 rounded-btn bg-pearl-soft border border-pearl-warm p-3">
          <div>
            <label className="block text-label-sm text-ink-soft mb-1">
              タイトル
            </label>
            <input
              type="text"
              value={editor.label}
              onChange={(e) =>
                setEditor({ ...editor, label: e.target.value })
              }
              placeholder="例: 渡辺さん専用お礼"
              className="w-full h-9 px-3 rounded-btn bg-pearl-warm border border-pearl-soft text-ink text-body-sm outline-none focus:border-gold/30"
            />
          </div>
          <div>
            <label className="block text-label-sm text-ink-soft mb-1">
              文面（{`{姓}`} {`{ボトル名}`} {`{前回の話題}`} が使えます）
            </label>
            <textarea
              value={editor.body}
              onChange={(e) =>
                setEditor({ ...editor, body: e.target.value })
              }
              placeholder="{姓}さん、お礼...."
              rows={4}
              className="w-full px-3 py-2 rounded-btn bg-pearl-warm border border-pearl-soft text-ink text-body-sm outline-none focus:border-gold/30 resize-none"
            />
          </div>
          <div>
            <label className="block text-label-sm text-ink-soft mb-1">
              説明（任意）
            </label>
            <input
              type="text"
              value={editor.description}
              onChange={(e) =>
                setEditor({ ...editor, description: e.target.value })
              }
              placeholder="例: VIP向け、競馬の話題"
              className="w-full h-9 px-3 rounded-btn bg-pearl-warm border border-pearl-soft text-ink text-body-sm outline-none focus:border-gold/30"
            />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setEditor(null)}
              className="flex items-center gap-1 h-9 px-3 rounded-btn bg-pearl-warm border border-pearl-soft text-ink-soft text-label-sm"
            >
              <X size={12} />
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!editor.body.trim()}
              className={cn(
                "inline-flex items-center gap-1 h-9 px-5 rounded-pill text-label-sm font-semibold tracking-[0.04em]",
                editor.body.trim()
                  ? "bg-wine-deep text-pearl-light shadow-luxe"
                  : "bg-pearl-soft text-ink-mute",
              )}
            >
              <Save size={12} />
              保存
            </button>
          </div>
        </div>
      )}

      {customs.length === 0 && !editor ? (
        <p className="text-body-sm text-ink-mute text-center py-2">
          このカテゴリのマイテンプレートはまだありません
        </p>
      ) : (
        customs.map((t) => (
          <div
            key={t.id}
            className="rounded-btn border border-pearl-soft bg-pearl-warm p-2.5"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-label-md text-ink font-semibold">
                {t.label}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(t)}
                  className="text-label-sm text-gold-deep"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
                  className="text-label-sm text-wine-deep"
                  aria-label="削除"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
            <p className="text-body-sm text-ink-soft leading-relaxed line-clamp-2">
              {t.body}
            </p>
          </div>
        ))
      )}
    </Card>
  );
}

// Re-export categories for convenience in callers
export { TEMPLATE_CATEGORIES };
