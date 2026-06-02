"use client";

import { Check, Copy, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import {
  buildContactUrl,
  type ContactPayload,
} from "../lib/contact-payload";

interface Props {
  payload: ContactPayload;
}

/**
 * 自分の連絡先 QR を表示するカード。
 * LINE の「マイQR」相当 — 相手にこれを読み取ってもらうと交換が成立する。
 */
export function MyQrCard({ payload }: Props) {
  const [origin, setOrigin] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = useMemo(
    () => (origin ? buildContactUrl(origin, payload) : ""),
    [origin, payload],
  );

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // クリップボード不可環境は無視。
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-hero border border-ink/[0.08] bg-pearl-light/85 backdrop-blur-md shadow-warm px-6 py-7 flex flex-col items-center text-center">
        <div className="flex items-center gap-1.5 text-wine-deep">
          <QrCode size={15} />
          <span className="text-label-md font-semibold tracking-[0.08em]">
            マイQR
          </span>
        </div>

        <div className="mt-5 rounded-card bg-white p-4 shadow-soft">
          {url ? (
            <QRCodeSVG
              value={url}
              size={196}
              level="M"
              marginSize={0}
              bgColor="#ffffff"
              fgColor="#2D1818"
            />
          ) : (
            <div className="w-[196px] h-[196px] animate-pulse rounded bg-pearl-soft" />
          )}
        </div>

        <p className="mt-5 font-serif text-[19px] font-medium tracking-[0.04em] text-ink">
          {payload.name}
        </p>
        <p className="mt-0.5 text-body-sm text-ink-soft">
          {[payload.role, payload.store].filter(Boolean).join(" · ")}
        </p>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        disabled={!url}
        className="w-full flex items-center justify-center gap-1.5 h-11 rounded-btn bg-pearl-light text-wine-deep border border-line-strong shadow-soft text-label-md font-medium transition active:scale-[0.98] hover:border-wine-deep/50 disabled:opacity-50"
      >
        {copied ? (
          <>
            <Check size={14} className="text-success" />
            リンクをコピーしました
          </>
        ) : (
          <>
            <Copy size={14} />
            交換リンクをコピー
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-ink-mute leading-relaxed">
        相手にこの QR を読み取ってもらうと連絡先が交換できます。
        <br />
        カメラアプリで読み取っても追加ページが開きます。
      </p>
    </div>
  );
}
