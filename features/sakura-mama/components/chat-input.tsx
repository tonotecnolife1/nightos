"use client";

import { ImagePlus, Mic, MicOff, Send, X, Zap } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { AutoResizeTextarea } from "@/components/nightos/auto-resize-textarea";
import { cn } from "@/lib/utils";
import { useVoiceInput } from "../use-voice-input";

interface Props {
  onSend: (text: string, images?: string[]) => void;
  onSkipHearing?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_IMAGES = 3;
const MAX_IMAGE_DIMENSION = 1200; // px — compress larger images

export function ChatInput({
  onSend,
  onSkipHearing,
  disabled,
  placeholder = "話しかけてもOK・書いてもOK",
}: Props) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const voice = useVoiceInput({
    onResult: (transcript) => {
      setText(transcript);
    },
  });

  const submit = () => {
    const t = text.trim();
    if ((!t && images.length === 0) || disabled) return;
    // Provide a default text if user sends image-only
    const message = t || (images.length > 0 ? "この写真についてアドバイスください" : "");
    onSend(message, images.length > 0 ? images : undefined);
    setText("");
    setImages([]);
    if (voice.recording) voice.stop();
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const room = MAX_IMAGES - images.length;
    const toProcess = files.slice(0, room);

    const compressed: string[] = [];
    for (const f of toProcess) {
      const dataUrl = await compressImage(f);
      if (dataUrl) compressed.push(dataUrl);
    }
    setImages((prev) => [...prev, ...compressed].slice(0, MAX_IMAGES));
    e.target.value = ""; // allow re-select same file
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="sticky bottom-0 px-4 pt-3 pb-safe bg-gradient-to-t from-pearl via-pearl/95 to-transparent">
      {voice.recording && (
        <div className="mb-2 flex items-center justify-center gap-2 text-blush-dark">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blush-dark opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blush-dark" />
          </span>
          <span className="text-label-sm font-medium">話してください…</span>
        </div>
      )}
      {voice.error && !voice.recording && (
        <div className="mb-2 text-center text-label-sm text-rose">
          {voice.error}
        </div>
      )}

      {/* Image preview row */}
      {images.length > 0 && (
        <div className="mb-2 flex gap-2 overflow-x-auto scroll-x">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative w-16 h-16 rounded-btn overflow-hidden border border-amethyst-border shrink-0"
            >
              <Image
                src={img}
                alt={`upload-${i}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-pearl flex items-center justify-center"
                aria-label="画像を削除"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 rounded-2xl border border-amethyst-border bg-pearl-warm shadow-soft-card px-3 py-2">
        <AutoResizeTextarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          minRows={1}
          maxRows={6}
          disabled={disabled}
          className="py-2"
          enterKeyHint="enter"
        />

        {/* Image upload */}
        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95",
              "bg-amethyst-muted text-amethyst-dark border border-amethyst-border hover:bg-amethyst hover:text-pearl",
              disabled && "opacity-40 cursor-not-allowed",
            )}
            aria-label="画像を添付"
            title="写真を添付（最大3枚）"
          >
            <ImagePlus size={16} />
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="hidden"
        />

        {voice.supported && (
          <button
            type="button"
            onClick={voice.toggle}
            disabled={disabled}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95",
              voice.recording
                ? "bg-blush-dark text-pearl shadow-glow-rose"
                : "bg-amethyst-muted text-amethyst-dark border border-amethyst-border hover:bg-amethyst hover:text-pearl",
              disabled && "opacity-40 cursor-not-allowed",
            )}
            aria-label={voice.recording ? "音声入力を停止" : "音声入力を開始"}
            title={voice.recording ? "音声入力を停止" : "マイクで話す"}
          >
            {voice.recording ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}

        {onSkipHearing && (
          <button
            type="button"
            onClick={onSkipHearing}
            className="h-10 px-3 rounded-btn text-label-sm text-amethyst-dark bg-amethyst-muted border border-amethyst-border shrink-0 active:scale-95"
            title="ヒアリングをスキップ"
          >
            <Zap size={14} className="inline mr-1" />
            お任せ
          </button>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={disabled || (!text.trim() && images.length === 0)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95",
            (text.trim() || images.length > 0) && !disabled
              ? "rose-gradient text-pearl shadow-glow-rose"
              : "bg-pearl-soft text-ink-muted",
          )}
          aria-label="送信"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

/**
 * 画像を圧縮して data URL に変換。長辺が MAX_IMAGE_DIMENSION を超える場合は縮小。
 */
async function compressImage(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new window.Image();
      img.onerror = () => resolve(null);
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          const ratio = Math.min(
            MAX_IMAGE_DIMENSION / width,
            MAX_IMAGE_DIMENSION / height,
          );
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
