"use client";

import { Check, ChevronDown, Copy, Heart, MessageSquareQuote, Sparkles, Wand2, Zap } from "lucide-react";
import { useState } from "react";
import { cn, copyToClipboard } from "@/lib/utils";
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
  /** 「どれもしっくりこない → 別の3案を作る」導線。未指定なら非表示。 */
  onRequestMore?: () => void;
}

export function ReplyOptionPicker({ options, onPick, onRequestMore }: Props) {
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

      {/* Horizontal scroll — A/B/C を横に並べてスワイプで見比べ。
          items-stretch で 3 枚の縦の高さを一番大きいカードに揃える。 */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory items-stretch">
        {options.map((opt) => (
          <OptionCard
            key={opt.id}
            option={opt}
            isSelected={selectedId === opt.id}
            locked={!!selectedId}
            onPick={() => handlePick(opt)}
          />
        ))}

        {/* どれも違うとき → 別の3案を作る導線（末尾カード） */}
        {onRequestMore && (
          <button
            type="button"
            onClick={onRequestMore}
            disabled={!!selectedId}
            className={cn(
              "flex-shrink-0 w-[58vw] max-w-[190px] snap-start rounded-card border border-dashed border-gold/40 bg-pearl-warm/40",
              "flex flex-col items-center justify-center gap-2 px-4 py-6 text-center transition-all",
              "self-stretch active:scale-[0.98]",
              selectedId ? "opacity-50 cursor-not-allowed" : "hover:bg-pearl-warm/70 hover:border-gold/60",
            )}
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-champagne-soft/70 text-wine-deep">
              <Wand2 size={16} />
            </span>
            <span className="text-label-sm font-semibold text-wine-deep">
              どれも違う？
            </span>
            <span className="text-[11px] leading-snug text-ink-soft">
              別の切り口で
              <br />
              もう3案つくる
            </span>
          </button>
        )}
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
  isSelected = false,
  locked = false,
  picked = false,
  onPick,
}: {
  option: ReplyOption;
  isSelected?: boolean;
  locked?: boolean;
  /** 選択確定後の読み取り専用表示（全幅・CTAなし・選択済みスタイル）。 */
  picked?: boolean;
  onPick?: () => void;
}) {
  const [showDetail, setShowDetail] = useState(false);
  const [copied, setCopied] = useState(false);
  const Icon = STYLE_ICON[option.style];
  const tone = STYLE_TONE[option.style];
  const chosen = picked || isSelected;

  const sections = parseSections(option.content);
  const messageSection = sections.find((s) => s.name.includes("文面"));
  // 文面があればそれを主役に、無ければ先頭セクション（アドバイス等）を主役に
  const primary = messageSection ?? sections[0];
  const details = messageSection
    ? sections.filter((s) => s !== messageSection)
    : sections.slice(1);
  const hasMessage = !!messageSection;

  const handleCopy = async () => {
    const ok = await copyToClipboard(primary.body);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div
      className={cn(
        // flex flex-col + 高さストレッチで、横並び 3 枚の縦の高さを揃える
        "rounded-card border bg-pearl-light transition-all flex flex-col",
        picked
          ? "w-full"
          : "flex-shrink-0 w-[78vw] max-w-[260px] snap-start h-full",
        chosen ? "border-gold/60 shadow-warm" : "border-gold/25 shadow-soft",
        isSelected && "scale-[1.01]",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
        <div className={cn("flex items-center gap-1.5 text-label-sm font-semibold", tone.accent)}>
          {chosen ? (
            <Check size={13} className="animate-fade-in" />
          ) : (
            <Icon size={13} />
          )}
          <span>パターン{option.id}</span>
          <span className="text-[10px] font-normal text-ink-mute">· {option.label}</span>
        </div>
        {picked && (
          <span className="text-[10px] font-medium text-gold-deep">選択済み</span>
        )}
      </div>

      {/* 文面 — 送る本文。LINE プレビュー風の淡いボックスで見比べやすく。
          flex-1 でこのセクションを伸ばし、CTA を常にカード下端へ揃える。 */}
      <div className={cn("px-3 flex-1", picked ? "pb-3" : "pb-2.5")}>
        {hasMessage && (
          <div className="flex items-center gap-1 text-[10px] text-ink-mute mb-1">
            <MessageSquareQuote size={10} className="text-gold-deep" />
            送る文面
          </div>
        )}
        {/* 送る文面は実際にコピーして送る本文。通常のチャット文
            （message-bubble の text-[12px]/leading-[1.7]）とサイズを揃え、
            やり取りとパターン文面の文字サイズの段差をなくす */}
        <div
          className={cn(
            "rounded-btn px-3 py-2 text-[12px] whitespace-pre-wrap leading-[1.7] text-ink",
            hasMessage ? "bg-champagne-soft/60 border border-gold/20" : "",
          )}
        >
          {primary.body}
        </div>

        {/* 文面をコピー — LINE 等に貼り付けやすいよう本文のすぐ下に常設。
            picked（確定後）は主役アクションとして全幅・濃色で大きく出す。 */}
        {hasMessage && (
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "mt-2 inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-all active:scale-[0.98]",
              picked
                ? "w-full h-10 text-label-md"
                : "w-full h-9 text-label-sm",
              copied
                ? "bg-success text-pearl-light shadow-soft"
                : picked
                  ? // 確定後は主役アクションとして濃色で大きく
                    "bg-wine-deep text-pearl-light shadow-warm hover:opacity-90"
                  : // 選択前は下部の「この文面を使う」と競合しないよう控えめに
                    "bg-champagne-soft/70 text-wine-deep border border-gold/30 hover:bg-champagne-soft",
            )}
          >
            {copied ? (
              <>
                <Check size={14} />
                コピーしました
              </>
            ) : (
              <>
                <Copy size={14} />
                文面をコピー
              </>
            )}
          </button>
        )}

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
                  <div key={idx} className="text-[11px] leading-[1.5] text-ink-soft">
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

      {/* Action — 選択確定後 (picked) は CTA を出さない */}
      {!picked && (
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
      )}
    </div>
  );
}

/**
 * 選択確定後に表示する「選んだパターン」カード。
 * 選択前と同じカードUI（送る文面ボックス＋解説折りたたみ）を全幅で維持する。
 */
export function PickedOptionCard({ option }: { option: ReplyOption }) {
  return <OptionCard option={option} picked />;
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
