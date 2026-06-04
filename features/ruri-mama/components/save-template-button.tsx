"use client";

import { BookmarkPlus, Check, RefreshCw, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCastId } from "@/lib/nightos/cast-context";
import { cn } from "@/lib/utils";
import {
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
} from "@/features/templates/data/templates";
import {
  newCustomId,
  saveCustomTemplate,
  saveTemplateOverride,
} from "@/features/templates/lib/custom-template-store";
import { customTemplateCount, findTemplateById } from "../lib/template-bridge";

type Mode = "new" | "update";

/**
 * 採用した文面を「マイテンプレに保存」する導線。
 * 文面はあらかじめ「送る本文」抽出 + 顧客名のプレースホルダ化を済ませて渡す。
 *
 * seedTemplate（この案の土台になったテンプレ）がある場合は、新規保存に加えて
 * 「そのテンプレを今の文面で更新」できる。相談で磨いた文面が元の型へ還元され、
 * 使うほどマイテンプレが洗練されていく。
 */
export function SaveTemplateButton({
  defaultBody,
  defaultCategory,
  seedTemplateId,
}: {
  defaultBody: string;
  defaultCategory: TemplateCategory;
  /** この案の土台になったテンプレ id（明示シード）。生きていれば「更新」導線を出す。 */
  seedTemplateId?: string;
}) {
  const castId = useCastId();
  const [mode, setMode] = useState<Mode | null>(null);
  const [savedAs, setSavedAs] = useState<null | "new" | "update">(null);
  const [label, setLabel] = useState("");
  const [body, setBody] = useState(defaultBody);
  const [category, setCategory] = useState<TemplateCategory>(defaultCategory);
  // seedTemplateId → 実テンプレ（削除済みなら null）。表示中の label に使う。
  const [seedTemplate, setSeedTemplate] = useState<{
    id: string;
    label: string;
  } | null>(null);

  // このカテゴリに「自分の」テンプレがまだ無ければ、初回登録をそっと促す。
  // 1件でも保存すると次回から消える、自己消滅型のナッジ。
  const [firstInCategory, setFirstInCategory] = useState(false);

  useEffect(() => {
    if (!seedTemplateId) {
      setSeedTemplate(null);
    } else {
      const resolved = findTemplateById(castId, seedTemplateId);
      setSeedTemplate(
        resolved
          ? { id: resolved.template.id, label: resolved.template.label }
          : null,
      );
    }
    setFirstInCategory(customTemplateCount(castId, defaultCategory) === 0);
  }, [castId, seedTemplateId, defaultCategory]);

  // 保存導線は「保存」ひとつ。開いたら、土台テンプレがあれば既定は「更新」、
  // 無ければ「新規」。更新/新規の選択はシート内のセグメントで切り替える。
  const open = () => {
    setLabel("");
    setCategory(defaultCategory);
    setBody(defaultBody);
    setMode(seedTemplate ? "update" : "new");
  };

  const handleSaveNew = () => {
    if (!body.trim()) return;
    saveCustomTemplate(castId, {
      id: newCustomId(),
      category,
      label: label.trim() || "さくらママ提案",
      body: body.trim(),
      description: "さくらママの相談から保存",
    });
    setSavedAs("new");
    setMode(null);
  };

  const handleUpdate = () => {
    if (!body.trim() || !seedTemplate) return;
    const resolved = findTemplateById(castId, seedTemplate.id);
    if (!resolved) {
      // 元テンプレが見つからない（削除済み等）→ 新規として保存にフォールバック
      handleSaveNew();
      return;
    }
    const { template, kind } = resolved;
    if (kind === "custom") {
      saveCustomTemplate(castId, {
        id: template.id,
        category: template.category,
        label: template.label,
        body: body.trim(),
        description: template.description,
      });
    } else {
      saveTemplateOverride(castId, template.id, {
        label: template.label,
        body: body.trim(),
        description: template.description,
      });
    }
    setSavedAs("update");
    setMode(null);
  };

  if (savedAs) {
    return (
      <span className="inline-flex items-center gap-1 px-2 text-[11px] font-medium text-success">
        <Check size={12} />
        {savedAs === "update"
          ? `「${seedTemplate?.label ?? "テンプレ"}」を更新しました`
          : "マイテンプレに保存しました"}
      </span>
    );
  }

  // ── 折りたたみ：保存ボタン1つ（＋初回ナッジ）──
  if (!mode) {
    return (
      <div className="inline-flex items-center gap-2 flex-wrap">
        {!seedTemplate && firstInCategory && (
          <span className="text-[11px] text-ink-mute italic">
            気に入ったら保存→次から一瞬よ
          </span>
        )}
        <button
          type="button"
          onClick={open}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium border border-gold/30 bg-champagne-soft/60 text-wine-deep transition active:scale-[0.97] hover:bg-champagne-soft/80"
        >
          <BookmarkPlus size={12} />
          マイテンプレに保存
        </button>
      </div>
    );
  }

  // ── 展開：編集フォーム ──
  const isUpdate = mode === "update";
  return (
    <div className="w-full space-y-2.5 rounded-card border border-gold/25 bg-pearl-warm/50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-label-sm font-semibold text-wine-deep">
          マイテンプレに保存
        </span>
        <button
          type="button"
          onClick={() => setMode(null)}
          aria-label="閉じる"
          className="text-ink-mute"
        >
          <X size={14} />
        </button>
      </div>

      {/* 更新 / 新規はここで切り替える（土台テンプレがある時だけ）。 */}
      {seedTemplate && (
        <div className="flex gap-1 p-0.5 rounded-full bg-pearl-soft">
          <button
            type="button"
            onClick={() => setMode("update")}
            className={cn(
              "flex-1 min-w-0 h-8 px-2 rounded-full text-[11px] font-semibold truncate transition",
              isUpdate ? "bg-wine-deep text-pearl-light" : "text-ink-soft",
            )}
          >
            「{seedTemplate.label}」を更新
          </button>
          <button
            type="button"
            onClick={() => setMode("new")}
            className={cn(
              "flex-1 min-w-0 h-8 px-2 rounded-full text-[11px] font-semibold transition",
              !isUpdate ? "bg-wine-deep text-pearl-light" : "text-ink-soft",
            )}
          >
            新規で保存
          </button>
        </div>
      )}

      {!isUpdate && (
        <>
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
        </>
      )}

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
          {isUpdate
            ? "このテンプレの文面を上書きします。タイトル・カテゴリは変わりません。"
            : "お名前は自動で {姓} に置き換えました。"}
          {" "}ボトル名や前回の話題も{` {ボトル名} {前回の話題} `}に書き換えると、次から自動で差し込めます。
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={isUpdate ? handleUpdate : handleSaveNew}
          disabled={!body.trim()}
          className={cn(
            "inline-flex items-center gap-1 h-9 px-5 rounded-pill text-label-sm font-semibold tracking-[0.04em]",
            body.trim()
              ? "bg-wine-deep text-pearl-light shadow-luxe"
              : "bg-pearl-soft text-ink-mute",
          )}
        >
          {isUpdate ? <RefreshCw size={12} /> : <Save size={12} />}
          {isUpdate ? "更新する" : "保存"}
        </button>
      </div>
    </div>
  );
}
