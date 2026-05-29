"use client";

import {
  AlertCircle,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  History,
  Loader2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { Card } from "@/components/nightos/card";
import { cn } from "@/lib/utils";
import type {
  CastMemo,
  Customer,
  LineScreenshot,
  MemoExtractionResult,
} from "@/types/nightos";
import {
  applyMemoUpdateAction,
  deleteScreenshotAction,
  type MemoFieldKey,
} from "../actions";
import { compressImage } from "../lib/compress-image";
import { ImageLightbox } from "./image-lightbox";

interface Props {
  customer: Customer;
  memo: CastMemo | null;
  screenshots: LineScreenshot[];
}

type Phase =
  | { name: "idle" }
  | { name: "compressing" }
  | { name: "extracting"; imageData: string; mediaType: string }
  | {
      name: "review";
      imageData: string;
      mediaType: string;
      extraction: MemoExtractionResult;
      isStub: boolean;
    }
  | { name: "saving" }
  | { name: "success"; appliedCount: number }
  | { name: "error"; message: string };

export function LineImportPanel({ customer, memo, screenshots }: Props) {
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [historyOpen, setHistoryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilePick = async (file: File) => {
    setPhase({ name: "compressing" });
    try {
      const { dataUrl, mediaType } = await compressImage(file);
      setPhase({ name: "extracting", imageData: dataUrl, mediaType });

      const res = await fetch("/api/extract-memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: dataUrl,
          customerId: customer.id,
          castId: customer.cast_id,
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = (await res.json()) as {
        isStub: boolean;
        result: MemoExtractionResult;
      };
      setPhase({
        name: "review",
        imageData: dataUrl,
        mediaType,
        extraction: data.result,
        isStub: data.isStub,
      });
    } catch (err) {
      console.error(err);
      setPhase({
        name: "error",
        message:
          "画像の解析に失敗しました。別のスクショで試すか、しばらくしてから再度お試しください。",
      });
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset so the same file can be selected again
    if (!file) return;
    void handleFilePick(file);
  };

  const reset = () => setPhase({ name: "idle" });

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-display-sm text-ink flex items-center gap-1.5">
          <Camera size={16} className="text-gold-deep" />
          LINEから自動更新
        </h3>
      </header>

      <Card className="!bg-champagne-soft/60 !border-gold/30 p-4">
        {phase.name === "idle" && (
          <IdleState
            onPick={() => fileInputRef.current?.click()}
            screenshotCount={screenshots.length}
          />
        )}

        {(phase.name === "compressing" || phase.name === "extracting") && (
          <LoadingState
            label={
              phase.name === "compressing"
                ? "画像を準備中…"
                : "さくらママが読み取り中…"
            }
          />
        )}

        {phase.name === "review" && (
          <ReviewPanel
            customer={customer}
            memo={memo}
            extraction={phase.extraction}
            imageData={phase.imageData}
            mediaType={phase.mediaType}
            isStub={phase.isStub}
            onCancel={reset}
            onSaved={(applied) =>
              setPhase({ name: "success", appliedCount: applied })
            }
          />
        )}

        {phase.name === "success" && (
          <SuccessState count={phase.appliedCount} onContinue={reset} />
        )}

        {phase.name === "error" && (
          <ErrorState message={phase.message} onRetry={reset} />
        )}
      </Card>

      {/* Hidden file input — opens photo picker on mobile, file picker on desktop */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Past screenshots */}
      {screenshots.length > 0 && (
        <Card className="!bg-pearl-warm p-4">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-1.5 text-label-md font-medium text-ink">
              <History size={14} className="text-ink-soft" />
              過去の取り込み履歴
              <span className="text-label-sm text-ink-mute ml-1">
                {screenshots.length}件
              </span>
            </div>
            {historyOpen ? (
              <ChevronUp size={16} className="text-ink-mute" />
            ) : (
              <ChevronDown size={16} className="text-ink-mute" />
            )}
          </button>
          {historyOpen && (
            <div className="space-y-2 mt-3">
              {screenshots.map((s) => (
                <ScreenshotHistoryRow
                  key={s.id}
                  screenshot={s}
                  customerId={customer.id}
                />
              ))}
            </div>
          )}
        </Card>
      )}
    </section>
  );
}

// ═══════════════ Sub-components ═══════════════

function IdleState({
  onPick,
  screenshotCount,
}: {
  onPick: () => void;
  screenshotCount: number;
}) {
  return (
    <div className="space-y-3 text-center">
      <p className="text-body-sm text-gold-deep leading-relaxed">
        LINEのスクリーンショットを取り込むと、
        <br />
        会話の内容を読み取って個人メモを自動更新します
      </p>
      <button
        type="button"
        onClick={onPick}
        className="w-full h-12 rounded-btn bg-roseGold-deep text-pearl shadow-luxe flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <Camera size={18} />
        <span className="text-label-md font-medium">スクショを選ぶ</span>
      </button>
      <p className="text-label-sm text-ink-mute">
        ※ 写真ライブラリから選択 · 最大1400pxに自動圧縮
        {screenshotCount > 0 && ` · 過去${screenshotCount}件取り込み済み`}
      </p>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <Loader2
        size={28}
        className="text-gold-deep animate-spin"
      />
      <p className="text-body-sm text-gold-deep font-medium">{label}</p>
    </div>
  );
}

function SuccessState({
  count,
  onContinue,
}: {
  count: number;
  onContinue: () => void;
}) {
  return (
    <div className="text-center py-3 space-y-3">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/20 text-success">
        <Check size={22} />
      </div>
      <p className="text-body-md text-ink">
        {count > 0
          ? `${count}項目を反映しました`
          : "履歴に保存しました"}
      </p>
      <button
        type="button"
        onClick={onContinue}
        className="text-label-md text-gold-deep underline underline-offset-2"
      >
        続けて取り込む
      </button>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 text-wine-deep">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <p className="text-body-sm text-ink leading-relaxed">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="w-full h-10 rounded-btn bg-pearl-warm border border-gold/30 text-gold-deep text-label-md active:scale-95"
      >
        もう一度試す
      </button>
    </div>
  );
}

interface ReviewPanelProps {
  customer: Customer;
  memo: CastMemo | null;
  extraction: MemoExtractionResult;
  imageData: string;
  mediaType: string;
  isStub: boolean;
  onCancel: () => void;
  onSaved: (appliedCount: number) => void;
}

function ReviewPanel({
  customer,
  memo,
  extraction,
  imageData,
  mediaType,
  isStub,
  onCancel,
  onSaved,
}: ReviewPanelProps) {
  const fields: {
    key: MemoFieldKey;
    label: string;
    current: string | null;
    suggested: string | null;
  }[] = [
    {
      key: "last_topic",
      label: "前回の話題",
      current: memo?.last_topic ?? null,
      suggested: extraction.last_topic,
    },
    {
      key: "service_tips",
      label: "接客のコツ",
      current: memo?.service_tips ?? null,
      suggested: extraction.service_tips,
    },
    {
      key: "next_topics",
      label: "次回の話題候補",
      current: memo?.next_topics ?? null,
      suggested: extraction.next_topics,
    },
  ];

  // Only show fields where the suggestion exists AND differs from current
  const updatableFields = fields.filter(
    (f) => f.suggested !== null && f.suggested !== f.current,
  );

  const [selected, setSelected] = useState<MemoFieldKey[]>(
    updatableFields.map((f) => f.key),
  );
  const [pending, startTransition] = useTransition();

  const toggle = (key: MemoFieldKey) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      await applyMemoUpdateAction({
        customerId: customer.id,
        imageData,
        mediaType,
        extraction,
        fieldsToApply: selected,
      });
      onSaved(selected.length);
    });
  };

  return (
    <div className="space-y-4">
      {isStub && (
        <div className="flex items-start gap-2 rounded-btn bg-warning/10 border border-warning/40 px-3 py-2 text-body-sm text-ink">
          <AlertCircle size={14} className="mt-0.5 text-warning shrink-0" />
          <span>
            デモ応答モードのため、実際のスクショ内容は読み取られていません
          </span>
        </div>
      )}

      {/* Image preview thumbnail */}
      <div className="flex gap-3">
        <div className="w-20 h-20 rounded-btn overflow-hidden border border-gold/30 shrink-0 bg-pearl-warm relative">
          {/* Use unoptimized for data URLs */}
          <Image
            src={imageData}
            alt="LINEスクショ"
            fill
            sizes="80px"
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-label-sm text-gold-deep font-medium mb-1">
            読み取り結果
          </p>
          <p className="text-body-sm text-ink leading-relaxed">
            {extraction.summary || "（要約なし）"}
          </p>
          <ConfidenceBadge confidence={extraction.confidence} />
        </div>
      </div>

      {/* Diff fields */}
      {updatableFields.length === 0 ? (
        <div className="rounded-btn bg-pearl-warm border border-pearl-soft px-3 py-3 text-body-sm text-ink-soft text-center">
          メモを更新する必要はなさそうです
        </div>
      ) : (
        <div className="space-y-2.5">
          <p className="text-label-sm text-gold-deep font-medium">
            更新する項目を選んでください
          </p>
          {updatableFields.map((field) => (
            <FieldDiff
              key={field.key}
              label={field.label}
              current={field.current}
              suggested={field.suggested!}
              checked={selected.includes(field.key)}
              onToggle={() => toggle(field.key)}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="flex-1 h-11 rounded-btn bg-pearl-warm border border-pearl-soft text-ink-soft text-label-md active:scale-95"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || (updatableFields.length > 0 && selected.length === 0)}
          className="flex-1 h-11 rounded-btn bg-roseGold-deep text-pearl-light text-label-md font-medium shadow-luxe disabled:opacity-60 active:scale-95"
        >
          {pending
            ? "保存中…"
            : updatableFields.length === 0
              ? "履歴だけ保存"
              : `${selected.length}項目を反映`}
        </button>
      </div>
    </div>
  );
}

function ConfidenceBadge({
  confidence,
}: {
  confidence: MemoExtractionResult["confidence"];
}) {
  const labels = {
    high: { text: "確信度: 高", cls: "bg-success/15 text-success" },
    medium: { text: "確信度: 中", cls: "bg-warning/15 text-warning" },
    low: { text: "確信度: 低", cls: "bg-wine/15 text-wine-deep" },
  };
  const { text, cls } = labels[confidence];
  return (
    <span
      className={cn(
        "inline-block mt-1.5 px-2 py-0.5 rounded-badge text-[10px] font-medium",
        cls,
      )}
    >
      {text}
    </span>
  );
}

function FieldDiff({
  label,
  current,
  suggested,
  checked,
  onToggle,
}: {
  label: string;
  current: string | null;
  suggested: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full text-left rounded-btn border px-3 py-2.5 transition-all",
        checked
          ? "bg-pearl-warm border-amethyst shadow-soft"
          : "bg-pearl-warm/60 border-pearl-soft",
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "w-5 h-5 rounded mt-0.5 flex items-center justify-center shrink-0 border-2",
            checked
              ? "bg-roseGold-deep border-roseGold-deep text-pearl-light"
              : "border-ink-muted",
          )}
        >
          {checked && <Check size={12} strokeWidth={3} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-label-sm text-gold-deep font-medium mb-1">
            {label}
          </div>
          <div className="text-body-sm text-ink leading-relaxed">
            <span className="text-ink-mute">→ </span>
            {suggested}
          </div>
          {current && (
            <div className="text-label-sm text-ink-mute line-through mt-0.5 leading-relaxed">
              {current}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function ScreenshotHistoryRow({
  screenshot,
  customerId,
}: {
  screenshot: LineScreenshot;
  customerId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("このLINEスクショを履歴から削除しますか？")) return;
    startTransition(async () => {
      await deleteScreenshotAction({ id: screenshot.id, customerId });
    });
  };

  const date = new Date(screenshot.created_at);
  const dateLabel = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="rounded-btn border border-pearl-soft bg-pearl-warm/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2 text-left active:bg-pearl-soft"
      >
        {/* Thumbnail — separate tap target to open lightbox */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
          className="w-12 h-12 rounded-btn overflow-hidden border border-pearl-soft shrink-0 bg-pearl-soft relative hover:opacity-80 active:scale-95 transition-all"
          aria-label="画像を拡大"
        >
          <Image
            src={screenshot.image_data}
            alt="LINEスクショ"
            fill
            sizes="48px"
            className="object-cover"
            unoptimized
          />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-label-sm text-ink-mute">{dateLabel}</div>
          <div className="text-body-sm text-ink truncate">
            {screenshot.extracted.summary || "(要約なし)"}
          </div>
        </div>
      </button>
      {lightbox && (
        <ImageLightbox
          src={screenshot.image_data}
          alt="LINEスクショ"
          onClose={() => setLightbox(false)}
        />
      )}
      {expanded && (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-pearl-soft">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setLightbox(true)}
              className="hover:opacity-90 active:scale-[0.99] transition-all"
            >
              <Image
                src={screenshot.image_data}
                alt="LINEスクショ"
                width={400}
                height={600}
                className="rounded-btn border border-pearl-soft max-h-96 w-auto object-contain"
                unoptimized
              />
            </button>
          </div>
          {screenshot.applied_fields.length > 0 ? (
            <div className="text-label-sm text-gold-deep">
              <Sparkles size={10} className="inline mr-1" />
              反映したフィールド: {screenshot.applied_fields.join(", ")}
            </div>
          ) : (
            <div className="text-label-sm text-ink-mute">
              履歴のみ保存（メモは更新せず）
            </div>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="flex items-center gap-1 text-label-sm text-wine-deep hover:underline disabled:opacity-50"
          >
            <Trash2 size={12} />
            履歴から削除
          </button>
        </div>
      )}
    </div>
  );
}
