"use client";

import { Image as ImageIcon, Plus, RotateCcw, ScanLine, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Card } from "@/components/nightos/card";
import {
  BusinessCardUpload,
  type ExtractedBusinessCard,
} from "@/features/customer-registration/components/business-card-upload";
import {
  clearBusinessCard,
  getBusinessCard,
  saveBusinessCard,
  type StoredBusinessCard,
} from "@/lib/nightos/business-card-store";
import { cn } from "@/lib/utils";

interface Props {
  customerId: string;
  customerName: string;
}

/**
 * 既存顧客のカルテに置く名刺セクション。
 *  - 未登録: 「名刺を登録」導線（タップで読み取り UI を展開）
 *  - 登録済: 名刺画像と抽出情報を確認表示。「登録し直す」「削除」も可能
 *
 * 名刺データはローカル（localStorage）に顧客単位で保存する。
 * customer-photo-upload と同じく端末内に閉じた補助情報という扱い。
 */
export function BusinessCardSection({ customerId, customerName }: Props) {
  const [card, setCard] = useState<StoredBusinessCard | null>(null);
  const [registering, setRegistering] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCard(getBusinessCard(customerId));
    setHydrated(true);
  }, [customerId]);

  const handleApply = (
    fields: ExtractedBusinessCard,
    imageDataUrl?: string | null,
  ) => {
    const next: StoredBusinessCard = {
      ...fields,
      image: imageDataUrl ?? null,
      capturedAt: new Date().toISOString(),
    };
    saveBusinessCard(customerId, next);
    setCard(next);
    setRegistering(false);
  };

  const handleRemove = () => {
    if (!window.confirm(`${customerName}さんの名刺を削除しますか？`)) return;
    clearBusinessCard(customerId);
    setCard(null);
    setRegistering(false);
  };

  // SSR / 初期化前はストレージ未読込なのでプレースホルダを返す（ガタつき防止）
  if (!hydrated) {
    return <div className="h-20 rounded-card bg-pearl-warm/40 animate-pulse" />;
  }

  return (
    <div className="space-y-3">
      {card && !registering && (
        <StoredCardView card={card} />
      )}

      {registering ? (
        <BusinessCardUpload
          onApply={handleApply}
          mode={card ? "edit" : "new"}
        />
      ) : card ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRegistering(true)}
            className="flex-1 h-9 rounded-pill border border-wine-deep/70 bg-transparent text-wine-deep inline-flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform text-label-sm font-medium"
          >
            <RotateCcw size={13} />
            登録し直す
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="h-9 px-3 rounded-pill border border-ink/[0.10] bg-pearl-warm text-ink-mute inline-flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform text-label-sm"
            aria-label="名刺を削除"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRegistering(true)}
          className="w-full rounded-card border-[1.5px] border-dashed border-gold/40 bg-champagne-soft/30 px-4 py-4 inline-flex items-center justify-center gap-2 text-wine-deep active:scale-[0.99] transition-transform"
        >
          <Plus size={15} />
          <span className="text-label-md font-medium">名刺を登録</span>
        </button>
      )}
    </div>
  );
}

function StoredCardView({ card }: { card: StoredBusinessCard }) {
  const confidence =
    card.confidence === "high"
      ? { label: "精度: 高", cls: "bg-success/10 text-success border-success/30" }
      : card.confidence === "medium"
        ? { label: "精度: 中", cls: "bg-warning/10 text-warning border-warning/30" }
        : { label: "精度: 低", cls: "bg-wine/10 text-wine-deep border-wine/30" };

  return (
    <Card className="p-3 space-y-2.5">
      <div className="flex items-center gap-1.5">
        <ScanLine size={14} className="text-gold-deep" />
        <span className="text-label-md text-ink font-medium">登録済みの名刺</span>
        <span
          className={cn(
            "ml-auto text-[9px] px-1.5 py-0.5 rounded-badge border font-medium",
            confidence.cls,
          )}
        >
          {confidence.label}
        </span>
      </div>

      {card.image ? (
        <div className="rounded-btn overflow-hidden border border-pearl-soft bg-pearl-warm">
          <Image
            src={card.image}
            alt="登録済みの名刺"
            width={400}
            height={240}
            className="w-full max-h-40 object-contain"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex items-center gap-1.5 rounded-btn bg-pearl-warm border border-pearl-soft px-2.5 py-3 text-ink-mute text-label-sm">
          <ImageIcon size={13} />
          画像は保存されていません
        </div>
      )}

      <dl className="space-y-1 text-body-sm bg-pearl-warm rounded-btn border border-pearl-soft px-2.5 py-2">
        <InfoRow label="お名前" value={card.name} />
        <InfoRow label="読み仮名" value={card.name_kana} />
        <InfoRow label="職業" value={card.job} />
        <InfoRow label="店舗メモ" value={card.store_memo} />
      </dl>

      <p className="text-[10px] text-ink-mute">
        登録: {formatCapturedAt(card.capturedAt)}
      </p>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-2">
      <dt className="text-[10px] text-ink-mute shrink-0 w-16 pt-0.5">{label}</dt>
      <dd className="text-ink flex-1 break-words whitespace-pre-wrap">
        {value ?? <span className="text-ink-mute">—</span>}
      </dd>
    </div>
  );
}

function formatCapturedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
