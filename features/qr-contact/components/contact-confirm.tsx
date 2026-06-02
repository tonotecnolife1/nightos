"use client";

import { Check, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import type { ContactPayload } from "../lib/contact-payload";
import {
  getContact,
  hasContact,
  upsertContactFromPayload,
} from "../lib/contact-store";

interface Props {
  payload: ContactPayload;
  /** 「追加済み」表示になった後に呼ばれる (一覧へ遷移する等)。 */
  onAdded?: () => void;
  /** 追加とは別のアクション (「別の人を読み取る」等)。 */
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/**
 * 読み取った連絡先のプレビュー + 追加ボタン。
 * スキャナ経由でも、QR の URL を直接開いた追加ページでも共通で使う。
 */
export function ContactConfirm({
  payload,
  onAdded,
  secondaryLabel,
  onSecondary,
}: Props) {
  const [added, setAdded] = useState(false);

  // 既に交換済みの相手なら最初から「追加済み」で表示。
  useEffect(() => {
    if (hasContact(payload.id)) setAdded(true);
  }, [payload.id]);

  const handleAdd = () => {
    upsertContactFromPayload(payload);
    setAdded(true);
    onAdded?.();
  };

  const initial = payload.name.trim().charAt(0) || "?";
  const exchangedAt = added ? getContact(payload.id)?.exchangedAt : null;

  return (
    <div className="rounded-hero border border-ink/[0.08] bg-pearl-light/85 backdrop-blur-md shadow-warm px-6 py-7 space-y-5">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-wine-deep/10 border border-wine-deep/15 flex items-center justify-center">
          <span className="font-serif text-[26px] text-wine-deep">{initial}</span>
        </div>
        <p className="mt-3 font-serif text-[20px] font-medium tracking-[0.04em] text-ink">
          {payload.name}
        </p>
        {(payload.role || payload.store) && (
          <p className="mt-0.5 text-body-sm text-ink-soft">
            {[payload.role, payload.store].filter(Boolean).join(" · ")}
          </p>
        )}
        {payload.note && (
          <p className="mt-2 text-body-sm text-ink-soft max-w-[260px]">
            {payload.note}
          </p>
        )}
      </div>

      {added ? (
        <div className="space-y-3">
          <div className="rounded-card border border-success/25 bg-success/5 px-4 py-3 flex items-center justify-center gap-1.5">
            <Check size={15} className="text-success" />
            <span className="text-body-sm font-medium text-success">
              連絡先に追加しました
            </span>
            {exchangedAt && (
              <span className="text-[10px] text-ink-mute ml-1">
                {formatDate(exchangedAt)}
              </span>
            )}
          </div>
          {secondaryLabel && onSecondary && (
            <button
              type="button"
              onClick={onSecondary}
              className="w-full h-11 rounded-btn bg-pearl-light text-wine-deep border border-line-strong shadow-soft text-label-md font-medium transition active:scale-[0.98] hover:border-wine-deep/50"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-1.5 h-12 rounded-btn bg-wine-deep text-pearl-light shadow-warm text-label-md font-semibold transition active:scale-[0.98] hover:bg-wine-deep/95"
        >
          <UserPlus size={15} />
          連絡先に追加
        </button>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
