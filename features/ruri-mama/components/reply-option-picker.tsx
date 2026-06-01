"use client";

import { Check, ChevronDown, Heart, MessageSquareQuote, Sparkles, Wand2, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ReplyOption, ReplyOptionStyle } from "@/types/nightos";

const STYLE_ICON: Record<ReplyOptionStyle, typeof Heart> = {
  safe: Heart,
  practical: Zap,
  warm: Sparkles,
};

/**
 * Style → 控えめなアクセント。塗りつぶしは使わず、アイコン/ラベルの色と
 * バッジ用の淡い chip のみ。V5 Bordeaux Salon の wine / champagne で統一。
 */
const STYLE_TONE: Record<ReplyOptionStyle, { accent: string; chip: string }> = {
  safe: {
    accent: "text-wine-deep",
    chip: "bg-champagne-soft/60 text-wine-deep",
  },
  practical: {
    accent: "text-gold-deep",
    chip: "bg-champagne text-ink",
  },
  warm: {
    accent: "text-gold-deep",
    chip: "bg-champagne-soft/60 text-gold-deep",
  },
};

interface Section {
  name: string;
  body: string;
}

/**
 * さくらママの content は「【文面例】…【なぜ効く】…」のように
 * 【見出し】区切りで複数セクションを持つ。これを分解して、
 * 文面（送る本文）と解説（状況分析・なぜ効く 等）に振り分ける。
 */
function parseSections(content: string): Section[] {
  const re = /【([^】]+)】/g;
  const heads: { name: string; index: number; len: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    heads.push({ name: m[1], index: m.index, len: m[0].length });
  }
  if (heads.length === 0) {
    return [{ name: "", body: content.trim() }];
  }
  return heads.map((h, i) => {
    const start = h.index + h.len;
    const end = i + 1 < heads.length ? heads[i + 1].index : content.length;
    return { name: h.name, body: content.slice(start, end).trim() };
  });
}

interface Props {
  options: ReplyOption[];
  onPick: (option: ReplyOption) => void;
}

export function ReplyOptionPicker({ options, onPick }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handlePick = (opt: ReplyOption) => {
    if (selectedId) return; // prevent double-tap
    setSelectedId(opt.id);
    // brief delay so the selected state is visible before the picker collapses
    setTimeout(() => onPick(opt), 400);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] text-ink-mute px-1">
        <Sparkles size={11} className="text-gold-deep" />
        3つの文面から選んでください
      </div>

      {/* Horizontal scroll — A/B/C を横に並べてスワイプで見比べ */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory items-start">
        {options.map((opt) => (
          <OptionCard
            key={opt.id}
            option={opt}
            isSelected={selectedId === opt.id}
            locked={!!selectedId}
            onPick={() => handlePick(opt)}
          />
        ))}
      </div>

      {selectedId && (
        <p className="text-[11px] text-gold-deep px-1 animate-fade-in flex items-center gap-1">
          <Check size={11} />
          パターン{selectedId}を選択しました。反映中…
        </p>
      )}
    </div>
  );
}

function OptionCard({
  option,
  isSelected,
  locked,
  onPick,
}: {
  option: ReplyOption;
  isSelected: boolean;
  locked: boolean;
  onPick: () => void;
}) {
  const [showDetail, setShowDetail] = useState(false);
  const Icon = STYLE_ICON[option.style];
  const tone = STYLE_TONE[option.style];

  const sections = parseSections(option.content);
  const messageSection = sections.find((s) => s.name.includes("文面"));
  // 文面があればそれを主役に、無ければ先頭セクション（アドバイス等）を主役に
  const primary = messageSection ?? sections[0];
  const details = messageSection
    ? sections.filter((s) => s !== messageSection)
    : sections.slice(1);
  const hasMessage = !!messageSection;

  return (
    <div
      className={cn(
        "flex-shrink-0 w-[78vw] max-w-[260px] snap-start rounded-card border bg-pearl-light transition-all",
        isSelected
          ? "border-gold/60 shadow-warm scale-[1.01]"
          : "border-gold/25 shadow-soft",
      )}
    >
      {/* Header */}
      <div className="flex items-center px-3 pt-2.5 pb-1.5">
        <div className={cn("flex items-center gap-1.5 text-label-sm font-semibold", tone.accent)}>
          {isSelected ? (
            <Check size={13} className="animate-fade-in" />
          ) : (
            <Icon size={13} />
          )}
          <span>パターン{option.id}</span>
          <span className="text-[10px] font-normal text-ink-mute">· {option.label}</span>
        </div>
      </div>

      {/* 文面 — 送る本文。LINE プレビュー風の淡いボックスで見比べやすく */}
      <div className="px-3 pb-2.5">
        {hasMessage && (
          <div className="flex items-center gap-1 text-[10px] text-ink-mute mb-1">
            <MessageSquareQuote size={10} className="text-gold-deep" />
            送る文面
          </div>
        )}
        <div
          className={cn(
            "rounded-btn px-3 py-2 text-body-sm whitespace-pre-wrap leading-relaxed text-ink",
            hasMessage ? "bg-champagne-soft/60 border border-gold/20" : "",
          )}
        >
          {primary.body}
        </div>

        {/* 解説（状況分析・なぜ効く 等）は折りたたみ — 縦長を防ぐ */}
        {details.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setShowDetail((v) => !v)}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-gold-deep hover:opacity-80 transition-opacity"
            >
              <ChevronDown
                size={12}
                className={cn("transition-transform", showDetail && "rotate-180")}
              />
              {showDetail ? "解説を閉じる" : "なぜ効く？解説を見る"}
            </button>
            {showDetail && (
              <div className="mt-1.5 space-y-1.5 animate-fade-in">
                {details.map((s, idx) => (
                  <div key={idx} className="text-body-sm leading-relaxed text-ink-soft">
                    {s.name && (
                      <span className="text-[11px] font-semibold text-wine-deep">
                        {s.name}：
                      </span>
                    )}
                    <span className="whitespace-pre-wrap">{s.body}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Action */}
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={onPick}
          disabled={locked}
          className={cn(
            "w-full h-9 rounded-full text-label-sm font-semibold transition-all active:scale-[0.98]",
            isSelected
              ? "bg-wine-deep text-pearl-light"
              : locked
                ? "bg-pearl-soft text-ink-mute cursor-not-allowed"
                : "bg-wine-deep text-pearl-light shadow-warm hover:opacity-90",
          )}
        >
          {isSelected ? (
            <span className="inline-flex items-center gap-1">
              <Check size={13} /> 選択済み
            </span>
          ) : hasMessage ? (
            "この文面を使う"
          ) : (
            "このアドバイスを使う"
          )}
        </button>
      </div>
    </div>
  );
}

export function PickedOptionBadge({ option }: { option: ReplyOption }) {
  const tone = STYLE_TONE[option.style];
  const Icon = STYLE_ICON[option.style];
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-badge text-[10px] font-medium mb-1",
        tone.chip,
      )}
    >
      <Check size={10} />
      <Icon size={9} />
      パターン{option.id} · {option.label}
    </div>
  );
}

export function RefineTriggerButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium border border-gold/30 transition-all active:scale-[0.97]",
        disabled
          ? "bg-pearl-soft text-ink-mute cursor-not-allowed"
          : "bg-champagne-soft/60 text-gold-deep hover:bg-champagne-soft/80",
      )}
    >
      <Wand2 size={11} />
      この文面をブラッシュアップする
    </button>
  );
}
