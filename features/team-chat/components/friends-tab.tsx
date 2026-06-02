"use client";

import { QrCode, UserPlus } from "lucide-react";
import { ContactList } from "@/features/qr-contact/components/contact-list";

interface Props {
  /** 連絡先交換シートを開く。マイQR タブから開始する。 */
  onExchange: () => void;
}

/**
 * チャット一覧の「友達」タブ。
 *
 * LINE の友だちタブと同じ発想で、チャットページの中に友達一覧を置く。
 * 先頭の「連絡先交換」から QR でのやりとり（マイQR / 読み取り）を、
 * チャットページ内の全画面シートとして開く。
 */
export function FriendsTab({ onExchange }: Props) {
  return (
    <div className="px-4 pt-3 pb-8">
      {/* 連絡先交換への導線 — 友達一覧の先頭に常設する */}
      <button
        type="button"
        onClick={onExchange}
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
        onAdd={onExchange}
      />
    </div>
  );
}
