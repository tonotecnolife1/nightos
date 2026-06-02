"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { decodeContactPayload } from "../lib/contact-payload";
import { ContactConfirm } from "./contact-confirm";

interface Props {
  /** URL の c パラメータ (base64url トークン)。 */
  token?: string;
}

/**
 * QR の URL を直接開いたときの追加ページ本体。
 * 標準カメラアプリで読み取られたケースをカバーする。
 */
export function AddPageClient({ token }: Props) {
  const payload = token ? decodeContactPayload(token) : null;

  if (!payload) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-hero border border-dashed border-line-strong bg-pearl-light/50 px-6 py-12 text-center">
        <AlertTriangle size={26} className="text-wine-deep" />
        <p className="text-body-sm text-ink-soft">
          この交換リンクは読み取れませんでした。
          <br />
          相手に QR を表示し直してもらってください。
        </p>
        <Link
          href="/cast/connect"
          className="h-11 px-6 inline-flex items-center rounded-pill bg-wine-deep text-pearl-light text-label-md font-semibold shadow-warm"
        >
          連絡先交換へ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ContactConfirm payload={payload} />
      <Link
        href="/cast/connect?tab=contacts"
        className="block text-center text-body-sm text-wine-deep underline underline-offset-2"
      >
        交換した連絡先を見る
      </Link>
    </div>
  );
}
