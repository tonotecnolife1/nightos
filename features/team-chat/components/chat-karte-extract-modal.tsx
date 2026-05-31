"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertCircle, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemoExtractionResult } from "@/types/nightos";
import {
  applyMemoUpdateAction,
  type MemoFieldKey,
} from "@/features/customer-card/actions";
import { compressImage } from "@/features/customer-card/lib/compress-image";

interface Props {
  customerId: string;
  customerName: string;
  castId: string;
  image: { url: string; mime: string };
  onClose: () => void;
  onApplied: (count: number) => void;
}

type Phase =
  | { name: "loading" }
  | {
      name: "review";
      imageData: string;
      mediaType: string;
      extraction: MemoExtractionResult;
      isStub: boolean;
    }
  | { name: "error"; message: string };

const FIELD_LABELS: Record<MemoFieldKey, string> = {
  last_topic: "前回の話題",
  service_tips: "接客のコツ",
  next_topics: "次回の話題候補",
};

/** Convert a chat attachment URL into a base64 data URL the vision API accepts. */
async function toDataUrl(
  url: string,
  mime: string,
): Promise<{ dataUrl: string; mediaType: string }> {
  if (url.startsWith("data:")) return { dataUrl: url, mediaType: mime };
  const res = await fetch(url);
  const blob = await res.blob();
  const file = new File([blob], "shot", { type: blob.type || mime });
  return compressImage(file); // downscale + re-encode to keep payload small
}

/**
 * Chat-side "LINEスクショ → カルテ更新" flow. Reuses the existing
 * /api/extract-memo vision endpoint and applyMemoUpdateAction so the
 * screenshot also lands in the customer's import history.
 */
export function ChatKarteExtractModal({
  customerId,
  customerName,
  castId,
  image,
  onClose,
  onApplied,
}: Props) {
  const [phase, setPhase] = useState<Phase>({ name: "loading" });
  const [selected, setSelected] = useState<MemoFieldKey[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { dataUrl, mediaType } = await toDataUrl(image.url, image.mime);
        const res = await fetch("/api/extract-memo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: dataUrl,
            customerId,
            castId,
          }),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = (await res.json()) as {
          isStub: boolean;
          result: MemoExtractionResult;
        };
        if (cancelled) return;
        const present = (
          ["last_topic", "service_tips", "next_topics"] as MemoFieldKey[]
        ).filter((k) => data.result[k]);
        setSelected(present);
        setPhase({
          name: "review",
          imageData: dataUrl,
          mediaType,
          extraction: data.result,
          isStub: data.isStub,
        });
      } catch {
        if (!cancelled)
          setPhase({
            name: "error",
            message:
              "スクショの解析に失敗しました。画像が読み取れない可能性があります。",
          });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [image.url, image.mime, customerId, castId]);

  const toggle = (key: MemoFieldKey) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const handleSave = () => {
    if (phase.name !== "review") return;
    const { imageData, mediaType, extraction } = phase;
    startTransition(async () => {
      await applyMemoUpdateAction({
        customerId,
        imageData,
        mediaType,
        extraction,
        fieldsToApply: selected,
      });
      onApplied(selected.length);
    });
  };

  return (
    <div className="fixed inset-0 z-[70] bg-ink/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
      <div className="w-full max-w-md rounded-card bg-pearl shadow-warm max-h-[88dvh] overflow-y-auto">
        <header className="flex items-center justify-between px-4 py-3 border-b border-ink/[0.06]">
          <h3 className="text-body-md font-medium text-ink">
            <span className="text-wine-deep">{customerName}</span>
            さんのカルテに反映
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-soft hover:bg-pearl-soft"
            aria-label="閉じる"
          >
            <X size={18} />
          </button>
        </header>

        <div className="p-4">
          {phase.name === "loading" && (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 size={28} className="text-gold-deep animate-spin" />
              <p className="text-body-sm text-gold-deep font-medium">
                さくらママが読み取り中…
              </p>
            </div>
          )}

          {phase.name === "error" && (
            <div className="space-y-3 py-2">
              <div className="flex items-start gap-2 text-wine-deep">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p className="text-body-sm text-ink leading-relaxed">
                  {phase.message}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full h-10 rounded-btn bg-pearl-warm border border-gold/30 text-gold-deep text-label-md"
              >
                閉じる
              </button>
            </div>
          )}

          {phase.name === "review" && (
            <div className="space-y-4">
              {phase.isStub && (
                <div className="flex items-start gap-2 rounded-btn bg-warning/10 border border-warning/40 px-3 py-2 text-body-sm text-ink">
                  <AlertCircle size={14} className="mt-0.5 text-warning shrink-0" />
                  <span>
                    デモ応答モードのため、実際のスクショ内容は読み取られていません
                  </span>
                </div>
              )}

              <div>
                <p className="text-label-sm text-gold-deep font-medium mb-1">
                  読み取り結果
                </p>
                <p className="text-body-sm text-ink leading-relaxed">
                  {phase.extraction.summary || "（要約なし）"}
                </p>
              </div>

              {(["last_topic", "service_tips", "next_topics"] as MemoFieldKey[])
                .filter((k) => phase.extraction[k])
                .map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggle(key)}
                    className={cn(
                      "w-full text-left rounded-btn border px-3 py-2.5 transition-all",
                      selected.includes(key)
                        ? "bg-champagne-soft/40 border-gold/40 shadow-soft"
                        : "bg-pearl-warm/60 border-pearl-soft",
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={cn(
                          "w-5 h-5 rounded mt-0.5 flex items-center justify-center shrink-0 border-2",
                          selected.includes(key)
                            ? "bg-wine-deep border-wine-deep text-pearl-light"
                            : "border-ink-mute",
                        )}
                      >
                        {selected.includes(key) && (
                          <Check size={12} strokeWidth={3} />
                        )}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-label-sm text-gold-deep font-medium mb-0.5">
                          {FIELD_LABELS[key]}
                        </span>
                        <span className="block text-body-sm text-ink leading-relaxed">
                          {phase.extraction[key]}
                        </span>
                      </span>
                    </div>
                  </button>
                ))}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={pending}
                  className="flex-1 h-11 rounded-btn bg-pearl-warm border border-pearl-soft text-ink-soft text-label-md active:scale-95"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={pending || selected.length === 0}
                  className="flex-1 h-11 rounded-btn bg-wine-deep text-pearl-light text-label-md font-medium shadow-luxe disabled:opacity-60 active:scale-95"
                >
                  {pending ? "保存中…" : `${selected.length}項目を反映`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
