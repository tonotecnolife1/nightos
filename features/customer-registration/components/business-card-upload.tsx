"use client";

import { AlertCircle, Camera, Check, Images, Loader2, ScanLine, X } from "lucide-react";
import { useRef, useState } from "react";
import { Card } from "@/components/nightos/card";
import { AI_FETCH_OPTIONS, apiFetchJson, toUserMessage } from "@/lib/nightos/api-fetch";
import { cn } from "@/lib/utils";

export interface ExtractedBusinessCard {
  name: string | null;
  name_kana: string | null;
  job: string | null;
  store_memo: string | null;
  confidence: "high" | "medium" | "low";
}

interface Props {
  /**
   * 抽出された情報を「適用」ボタンで確定した時に呼ばれる。
   * フォーム側はこれを受けて state を更新する。
   * 第2引数には読み取った名刺画像（data URL）を渡す。名刺そのものを
   * 保存・閲覧したい呼び出し側（既存顧客の名刺登録）が使う。新規登録
   * フォームのように画像が不要な呼び出しは無視してよい。
   */
  onApply: (fields: ExtractedBusinessCard, imageDataUrl?: string | null) => void;
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
        const data = await apiFetchJson<{
          isStub: boolean;
          result: ExtractedBusinessCard;
        }>("/api/extract-business-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: dataUrl }),
          ...AI_FETCH_OPTIONS,
        });
        setResult(data.result);
        setIsStub(data.isStub);
      } catch (err) {
        console.error("[business-card-upload] failed:", err);
        setError(`${toUserMessage(err)}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const apply = () => {
    if (!result || !result.name?.trim()) return;
    onApply(result, preview);
    reset();
  };

  const updateField = (key: keyof ExtractedBusinessCard, value: string) => {
    setResult((prev) =>
      prev ? { ...prev, [key]: value.trim() === "" ? null : value } : prev,
    );
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
            className="flex-1 h-11 rounded-pill bg-wine-deep text-pearl-light shadow-luxe inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform text-label-md font-semibold tracking-[0.04em]"
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
            <span className="text-[9px] text-ink-mute">
              （修正できます）
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

          <div className="space-y-1.5 bg-pearl-warm rounded-btn border border-pearl-soft px-2.5 py-2.5">
            <EditableRow
              label="お名前"
              value={result.name}
              onChange={(v) => updateField("name", v)}
              placeholder="例: 田中 太郎"
            />
            <EditableRow
              label="読み仮名"
              value={result.name_kana}
              onChange={(v) => updateField("name_kana", v)}
              placeholder="例: たなか たろう"
            />
            <EditableRow
              label="職業"
              value={result.job}
              onChange={(v) => updateField("job", v)}
              placeholder="会社名・肩書など"
            />
            <EditableRow
              label="店舗メモ"
              value={result.store_memo}
              onChange={(v) => updateField("store_memo", v)}
              placeholder="メモ（任意）"
              multiline
            />
          </div>

          {!result.name?.trim() && (
            <p className="text-[10px] text-wine-deep">
              お名前を入力すると反映できます。読み取れなかった場合は手で入力するか、別の写真をお試しください。
            </p>
          )}

          <button
            type="button"
            onClick={apply}
            disabled={!result.name?.trim()}
            className="w-full h-10 rounded-pill bg-wine-deep text-pearl-light shadow-luxe inline-flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform text-label-md font-semibold tracking-[0.04em] disabled:opacity-40 disabled:shadow-none disabled:active:scale-100"
          >
            <Check size={14} />
            フォームに反映する
          </button>
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

function EditableRow({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const fieldClass = cn(
    "flex-1 min-w-0 rounded-btn border border-pearl-soft bg-pearl-light px-2 py-1.5",
    "text-body-sm text-ink placeholder:text-ink-mute",
    "focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30",
  );
  return (
    <label className="flex gap-2 items-start">
      <span className="text-[10px] text-ink-mute shrink-0 w-16 pt-2">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={cn(fieldClass, "resize-none")}
        />
      ) : (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={fieldClass}
        />
      )}
    </label>
  );
}
