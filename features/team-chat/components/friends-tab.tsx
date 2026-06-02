"use client";

import { QrCode, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { ConnectClient } from "@/features/qr-contact/components/connect-client";
import { ContactList } from "@/features/qr-contact/components/contact-list";
import type { ContactPayload } from "@/features/qr-contact/lib/contact-payload";

interface Props {
  /** 連絡先交換（マイQR）用の自分のペイロード。 */
  myPayload: ContactPayload;
}

/**
 * チャット一覧の「友達」タブ。
 *
 * LINE の友だちタブと同じ発想で、チャットページの中に友達一覧を置く。
 * 右上の「連絡先交換」から QR でのやりとり（マイQR / 読み取り）を、
 * チャットページ内の全画面シートとして開く。専用ルートやハンバーガー
 * メニューには出さない。
 */
export function FriendsTab({ myPayload }: Props) {
  const [exchanging, setExchanging] = useState(false);

  return (
    <div className="px-4 pt-3 pb-8">
      {/* 連絡先交換への導線 — 友達一覧の先頭に常設する */}
      <button
        type="button"
        onClick={() => setExchanging(true)}
        className="mb-4 flex w-full items-center gap-3 rounded-card border border-gold/30 bg-champagne-soft/40 px-4 py-3 text-left transition active:scale-[0.99] hover:bg-champagne-soft/60"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-wine-deep text-pearl-light shadow-warm">
          <QrCode size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-body-md font-medium text-ink">
            連絡先交換
          </span>
          <span className="block text-label-sm text-ink-soft">
            QRで友達を追加する
          </span>
        </span>
        <UserPlus size={16} className="shrink-0 text-gold-deep" />
      </button>

      <ContactList
        linkBase="/cast/connect/contacts"
        searchable
        onAdd={() => setExchanging(true)}
      />

      {exchanging && (
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
              onClick={() => setExchanging(false)}
              aria-label="閉じる"
              className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pearl-warm/70 text-ink-soft transition hover:bg-pearl-warm"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConnectClient myPayload={myPayload} />
          </div>
        </div>
      )}
    </div>
  );
}
