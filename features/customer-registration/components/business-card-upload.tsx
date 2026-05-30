"use client";

import { AlertCircle, Camera, Check, Images, Loader2, ScanLine, X } from "lucide-react";
import { useRef, useState } from "react";
import { Card } from "@/components/nightos/card";
import { cn } from "@/lib/utils";

export interface ExtractedBusinessCard {
  name: string | null;
  job: string | null;
  store_memo: string | null;
  confidence: "high" | "medium" | "low";
}

interface Props {
  /**
   * 抽出された情報を「適用」ボタンで確定した時に呼ばれる。
   * フォーム側はこれを受けて state を更新する。
   */
  onApply: (fields: ExtractedBusinessCard) => void;
  /** 編集時、既存値を上書きしてよいか確認するため表示調整したい場合に使う */
  mode?: "new" | "edit";
}

/**
 * 名刺の写真を撮影 or 選択してアップロードし、AI で情報を抽出する。
 * 読み取り結果をユーザーが確認してから「フォームに反映」する二段階UI。
 */
export function BusinessCardUpload({ onApply, mode = "new" }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractedBusinessCard | null>(null);
  const [isStub, setIsStub] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setPreview(null);
    setResult(null);
    setIsStub(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setLoading(true);

      try {
        const res = await fetch("/api/extract-business-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: dataUrl }),
        });
        if (!res.ok) {
          throw new Error(`status ${res.status}`);
        }
        const data = (await res.json()) as {
          isStub: boolean;
          result: ExtractedBusinessCard;
        };
        setResult(data.result);
        setIsStub(data.isStub);
      } catch (err) {
        console.error("[business-card-upload] failed:", err);
        setError("名刺の読み取りに失敗しました。もう一度お試しください。");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const apply = () => {
    if (!result) return;
    onApply(result);
    reset();
  };

  const confidenceBadge =
    result?.confidence === "high"
      ? { label: "精度: 高", cls: "bg-success/10 text-success border-success/30" }
      : result?.confidence === "medium"
        ? { label: "精度: 中", cls: "bg-warning/10 text-warning border-warning/30" }
        : { label: "精度: 低", cls: "bg-wine/10 text-wine-deep border-wine/30" };

  return (
    <Card className="p-3 !border-gold/30 !bg-champagne-soft/30 space-y-2.5">
      <div className="flex items-center gap-1.5">
        <ScanLine size={14} className="text-gold-deep" />
        <span className="text-label-md text-ink font-medium">
          名刺で入力を簡単に
        </span>
        {mode === "edit" && (
          <span className="ml-auto text-[9px] text-ink-mute">
            既存値は上書きされます
          </span>
        )}
      </div>

      {!preview && !result && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 h-11 rounded-pill bg-wine-deep text-pearl-light-light shadow-luxe inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform text-label-md font-semibold tracking-[0.04em]"
          >
            <Camera size={16} />
            撮影
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex-1 h-11 rounded-pill border border-wine-deep/70 bg-transparent text-wine-deep inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform text-label-md font-medium"
          >
            <Images size={16} />
            カメラロール
          </button>
        </div>
      )}

      {preview && (
        <div className="relative rounded-btn overflow-hidden border border-pearl-soft bg-pearl-warm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="名刺プレビュー"
            className="w-full max-h-40 object-contain"
          />
          <button
            type="button"
            onClick={reset}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink/60 text-pearl-light flex items-center justify-center"
            aria-label="クリア"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-body-sm text-gold-deep py-2">
          <Loader2 size={14} className="animate-spin" />
          名刺を読み取り中…
        </div>
      )}

      {error && (
        <div className="flex items-start gap-1.5 rounded-btn bg-wine/10 border border-wine/30 text-wine-deep text-label-sm px-2.5 py-2">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-label-sm text-ink-soft">
              抽出された情報
            </span>
            <span
              className={cn(
                "text-[9px] px-1.5 py-0.5 rounded-badge border font-medium",
                confidenceBadge.cls,
              )}
            >
              {confidenceBadge.label}
            </span>
            {isStub && (
              <span className="text-[9px] text-ink-mute">（デモ応答）</span>
            )}
          </div>

          <div className="space-y-1 text-body-sm bg-pearl-warm rounded-btn border border-pearl-soft px-2.5 py-2">
            <ResultRow label="お名前" value={result.name} />
            <ResultRow label="職業" value={result.job} />
            <ResultRow label="店舗メモ" value={result.store_memo} />
          </div>

          {!result.name ? (
            <p className="text-[10px] text-wine-deep">
              お名前が読み取れませんでした。別の写真をお試しください。
            </p>
          ) : (
            <button
              type="button"
              onClick={apply}
              className="w-full h-10 rounded-pill bg-wine-deep text-pearl-light-light shadow-luxe inline-flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform text-label-md font-semibold tracking-[0.04em]"
            >
              <Check size={14} />
              フォームに反映する
            </button>
          )}
        </div>
      )}

      {/* capture="environment" — カメラを直接起動 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      {/* capture なし — OS のファイルピッカーでカメラロールから選択 */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </Card>
  );
}

function ResultRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-2">
      <span className="text-[10px] text-ink-mute shrink-0 w-16 pt-0.5">
        {label}
      </span>
      <span className="text-ink flex-1 break-words">
        {value ?? <span className="text-ink-mute">—</span>}
      </span>
    </div>
  );
}
