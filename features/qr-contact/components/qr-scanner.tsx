"use client";

import { Camera, CameraOff, ImagePlus, Keyboard } from "lucide-react";
import jsQR from "jsqr";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  type ContactPayload,
  parseContactFromText,
} from "../lib/contact-payload";

interface Props {
  /** QR から有効な連絡先が読み取れたとき。 */
  onFound: (payload: ContactPayload) => void;
}

type CameraState = "idle" | "starting" | "running" | "denied" | "unsupported";

/**
 * QR スキャナ。
 * - メインはカメラ + jsQR (iOS Safari でも動くよう BarcodeDetector に依存しない)
 * - カメラ不可の環境向けに「写真から読み取る」「コードを貼り付け」のフォールバック
 */
export function QrScanner({ onFound }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [camera, setCamera] = useState<CameraState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const handleFound = useCallback(
    (payload: ContactPayload) => {
      stopCamera();
      setCamera("idle");
      onFound(payload);
    },
    [onFound, stopCamera],
  );

  const scanLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }
    const w = video.videoWidth;
    const h = video.videoHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const image = ctx.getImageData(0, 0, w, h);
    const code = jsQR(image.data, w, h, { inversionAttempts: "dontInvert" });
    if (code) {
      const payload = parseContactFromText(code.data);
      if (payload) {
        handleFound(payload);
        return;
      }
    }
    rafRef.current = requestAnimationFrame(scanLoop);
  }, [handleFound]);

  const startCamera = useCallback(async () => {
    setError(null);
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setCamera("unsupported");
      return;
    }
    setCamera("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      // iOS Safari でインライン再生させるための属性。
      video.setAttribute("playsinline", "true");
      await video.play();
      setCamera("running");
      rafRef.current = requestAnimationFrame(scanLoop);
    } catch (e) {
      const name = (e as { name?: string })?.name;
      if (name === "NotAllowedError" || name === "SecurityError") {
        setCamera("denied");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setCamera("unsupported");
      } else {
        setCamera("denied");
        setError("カメラを起動できませんでした。");
      }
    }
  }, [scanLoop]);

  // アンマウント時に確実にカメラを止める。
  useEffect(() => stopCamera, [stopCamera]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setManualError(null);
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(bitmap, 0, 0);
      const image = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
      const code = jsQR(image.data, bitmap.width, bitmap.height, {
        inversionAttempts: "attemptBoth",
      });
      const payload = code ? parseContactFromText(code.data) : null;
      if (payload) {
        handleFound(payload);
      } else {
        setManualError("この画像から連絡先 QR を読み取れませんでした。");
      }
    } catch {
      setManualError("画像を読み込めませんでした。");
    }
  };

  const handleManualSubmit = () => {
    const payload = parseContactFromText(manual);
    if (payload) {
      handleFound(payload);
    } else {
      setManualError("有効な交換リンク / コードではありません。");
    }
  };

  return (
    <div className="space-y-4">
      {/* カメラビューポート */}
      <div className="relative aspect-square w-full overflow-hidden rounded-hero bg-[#1A0F0F] border border-ink/[0.08] shadow-warm">
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            camera === "running" ? "opacity-100" : "opacity-0",
          )}
          muted
          playsInline
        />
        <canvas ref={canvasRef} className="hidden" />

        {camera === "running" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-56 w-56 rounded-[28px] border-2 border-pearl-light/70 shadow-[0_0_0_2000px_rgba(26,15,15,0.45)]" />
            <span className="absolute bottom-6 text-[12px] tracking-[0.08em] text-pearl-light/90">
              QR を枠に合わせてください
            </span>
          </div>
        )}

        {camera !== "running" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
            {camera === "denied" ? (
              <>
                <CameraOff size={30} className="text-pearl-light/70" />
                <p className="text-body-sm text-pearl-light/80">
                  カメラを使えませんでした。
                  <br />
                  下の方法でも読み取れます。
                </p>
              </>
            ) : camera === "unsupported" ? (
              <>
                <CameraOff size={30} className="text-pearl-light/70" />
                <p className="text-body-sm text-pearl-light/80">
                  この端末ではカメラを使えません。
                  <br />
                  写真かコード貼り付けをご利用ください。
                </p>
              </>
            ) : (
              <>
                <Camera size={30} className="text-pearl-light/70" />
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={camera === "starting"}
                  className="h-11 px-6 rounded-pill bg-pearl-light text-wine-deep text-label-md font-semibold shadow-warm transition active:scale-[0.98] disabled:opacity-60"
                >
                  {camera === "starting"
                    ? "起動中…"
                    : "カメラで読み取る"}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-center text-body-sm text-wine-deep">{error}</p>}

      {/* フォールバック: 写真から読み取る */}
      <label className="flex items-center justify-center gap-1.5 h-11 rounded-btn bg-pearl-light text-wine-deep border border-line-strong shadow-soft text-label-md font-medium transition active:scale-[0.98] hover:border-wine-deep/50 cursor-pointer">
        <ImagePlus size={14} />
        写真から読み取る
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </label>

      {/* フォールバック: コード貼り付け */}
      <div className="rounded-card border border-ink/[0.08] bg-pearl-light/70 px-4 py-3 space-y-2">
        <div className="flex items-center gap-1.5 text-ink-soft">
          <Keyboard size={13} />
          <span className="text-label-sm font-medium">交換リンクを貼り付け</span>
        </div>
        <textarea
          value={manual}
          onChange={(e) => {
            setManual(e.target.value);
            setManualError(null);
          }}
          rows={2}
          placeholder="https://… または コード"
          className="w-full resize-none rounded-btn border border-line-strong bg-white px-3 py-2 text-body-sm text-ink outline-none focus:border-wine-deep/50"
        />
        <button
          type="button"
          onClick={handleManualSubmit}
          disabled={!manual.trim()}
          className="w-full h-10 rounded-btn bg-wine-deep text-pearl-light text-label-md font-semibold shadow-warm transition active:scale-[0.98] disabled:opacity-50"
        >
          読み取る
        </button>
      </div>

      {manualError && (
        <p className="text-center text-body-sm text-wine-deep">{manualError}</p>
      )}
    </div>
  );
}
