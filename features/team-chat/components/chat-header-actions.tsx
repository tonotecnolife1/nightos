"use client";

import { QrCode, X } from "lucide-react";
import { useState } from "react";
import { MoreMenu } from "@/components/nightos/more-menu";
import { ConnectClient } from "@/features/qr-contact/components/connect-client";
import { ContactList } from "@/features/qr-contact/components/contact-list";
import type { ContactPayload } from "@/features/qr-contact/lib/contact-payload";
import type { CastMember } from "../lib/supabase-queries";
import { NewDmSheet } from "./new-dm-sheet";

interface Props {
  /** 新規 DM / グループ作成シート用の同店舗キャスト一覧。 */
  storeCasts: CastMember[];
  /** 連絡先交換（マイQR）用の自分のペイロード。 */
  myPayload: ContactPayload;
}

type Sheet = "connect" | "friends";

/**
 * チャット一覧ヘッダーの操作群（＋ボタン / ☰ メニュー）。
 *
 * 「連絡先交換」「友達一覧」は専用ルートへ遷移させず、チャット画面の中で
 * 全画面シートとして開く。LINE がトークタブ内で友だち追加 / 友だち一覧を
 * 完結させているのと同じ体験を、NIGHTOS のチャット機能の中で再現する。
 */
export function ChatHeaderActions({ storeCasts, myPayload }: Props) {
  const [sheet, setSheet] = useState<Sheet | null>(null);

  return (
    <>
      <div className="flex items-center gap-1.5">
        <NewDmSheet storeCasts={storeCasts} />
        <MoreMenu
          overrides={{
            connect: () => setSheet("connect"),
            friends: () => setSheet("friends"),
          }}
        />
      </div>

      {sheet === "connect" && (
        <ChatFullSheet
          title="連絡先交換"
          subtitle="QRで連絡先をやりとり"
          onClose={() => setSheet(null)}
        >
          <ConnectClient myPayload={myPayload} />
        </ChatFullSheet>
      )}

      {sheet === "friends" && (
        <ChatFullSheet
          title="友達一覧"
          subtitle="QRで交換した連絡先"
          onClose={() => setSheet(null)}
          right={
            <button
              type="button"
              onClick={() => setSheet("connect")}
              aria-label="QRで友達を追加"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-pearl-warm/70 hover:bg-pearl-warm text-ink-soft transition"
            >
              <QrCode size={17} />
            </button>
          }
        >
          <div className="px-4 pt-3 pb-8">
            <ContactList
              linkBase="/cast/connect/contacts"
              searchable
              onAdd={() => setSheet("connect")}
            />
          </div>
        </ChatFullSheet>
      )}
    </>
  );
}

/**
 * チャット画面に被せる全画面シート。地はページと同じ pearl、上部に
 * NIGHTOS eyebrow + serif タイトルを置き、右上に閉じる導線を出す。
 */
function ChatFullSheet({
  title,
  subtitle,
  right,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[80] flex flex-col bg-pearl-light animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-10 pb-3 border-b border-ink/[0.06]">
        <div className="min-w-0">
          <div className="text-label-xs tracking-luxe text-wine-deep mb-1.5">
            NIGHTOS
          </div>
          <h1 className="font-serif text-[24px] leading-[1.2] font-medium tracking-[0.02em] text-ink truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-label-sm text-ink-soft">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 pt-1">
          {right}
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-pearl-warm/70 hover:bg-pearl-warm text-ink-soft transition"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
