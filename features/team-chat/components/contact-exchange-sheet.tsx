"use client";

import { X } from "lucide-react";
import { ConnectClient } from "@/features/qr-contact/components/connect-client";
import type { ContactPayload } from "@/features/qr-contact/lib/contact-payload";

/** ConnectClient の初期タブ（マイQR / 読み取る / 連絡先）。 */
export type ExchangeTab = "my-qr" | "scan" | "contacts";

interface Props {
  /** 連絡先交換（マイQR）用の自分のペイロード。 */
  myPayload: ContactPayload;
  /** 開いたときに表示するタブ。検索バーの読み取りからは "scan"。 */
  initialTab?: ExchangeTab;
  onClose: () => void;
}

/**
 * チャットページ内に被せる連絡先交換シート。
 *
 * 既存の {@link ConnectClient}（マイQR / 読み取る / 連絡先）をそのまま
 * 全画面シートとして開く。専用ルートには遷移しない。検索バーの読み取り
 * アイコン・友達タブの両方から共有して開く。
 */
export function ContactExchangeSheet({
  myPayload,
  initialTab = "my-qr",
  onClose,
}: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="連絡先交換"
      className="fixed inset-0 z-[80] flex flex-col bg-pearl-light animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3 border-b border-ink/[0.06] px-5 pt-10 pb-3">
        <div className="min-w-0">
          <div className="text-label-xs tracking-luxe text-wine-deep mb-1.5">
            NIGHTOS
          </div>
          <h1 className="font-serif text-[24px] leading-[1.2] font-medium tracking-[0.02em] text-ink">
            連絡先交換
          </h1>
          <p className="mt-0.5 text-label-sm text-ink-soft">
            QRで連絡先をやりとり
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pearl-warm/70 text-ink-soft transition hover:bg-pearl-warm"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ConnectClient myPayload={myPayload} initialTab={initialTab} />
      </div>
    </div>
  );
}
