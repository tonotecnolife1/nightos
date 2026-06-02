"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Lock,
  MessageSquarePlus,
  Pencil,
} from "lucide-react";
import { Card, StoreInfoCard } from "@/components/nightos/card";
import type { Customer } from "@/types/nightos";
import { CustomerEditSheet } from "./customer-edit-sheet";

/** 顧客ごとに「閉じた」状態を覚えるための localStorage キー接頭辞 */
const COLLAPSED_PREFIX = "nightos:customer-info-collapsed:";

interface Props {
  customer: Customer;
  /** マスター/担当なら直接編集、それ以外（ヘルプ）は「変更を提案」 */
  canEditDirectly: boolean;
  requesterCastId: string;
  requesterName: string;
  approverCastId: string | null;
}

/**
 * 顧客情報セクション。3層の編集可否を視覚で区別する：
 *  - 🌸 入力推奨   : ピンク破線（呼び名）
 *  - ✏️  編集可能   : デフォルトカード（誕生日・職業・好きなお酒・活動エリア）
 *  - 🔒 閲覧のみ   : ベージュ背景（店舗からの共有情報・カテゴリ・ファネル）
 *
 * 「編集」ボタン → CustomerEditSheet（BottomSheet）で一括編集。
 */
export function CustomerInfoSection({
  customer,
  canEditDirectly,
  requesterCastId,
  requesterName,
  approverCastId,
}: Props) {
  const [editing, setEditing] = useState(false);
  // 覚えたら見ない情報なので、キャストが畳んだ状態を顧客ごとに記憶する。
  // 初期表示は「開いた」状態（店舗からの注意書きなどを隠さない）→ ハイドレーション後に復元。
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(COLLAPSED_PREFIX + customer.id) === "1") {
      setOpen(false);
    }
  }, [customer.id]);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          COLLAPSED_PREFIX + customer.id,
          next ? "0" : "1",
        );
      }
      return next;
    });
  };

  // 畳んだときに「誰か」だけは分かるよう、ひと目の要約を作る
  const summary =
    [customer.nickname, customer.job].filter(Boolean).join(" ・ ") ||
    "呼び名・基本情報・店舗からの共有メモ";

  return (
    <section className="space-y-3">
      {/* セクション見出し（タップで開閉） + 編集 / 提案ボタン */}
      <header className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="flex items-center gap-1.5 text-left"
        >
          <h2 className="font-display text-[20px] leading-tight font-medium text-ink">
            顧客情報
          </h2>
          {open ? (
            <ChevronUp size={16} className="text-ink-mute" />
          ) : (
            <ChevronDown size={16} className="text-ink-mute" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 h-8 px-3 rounded-pill border border-ink/[0.10] bg-pearl-warm text-label-sm text-ink-secondary hover:border-gold/40 hover:text-ink transition"
        >
          {canEditDirectly ? (
            <>
              <Pencil size={12} />
              編集
            </>
          ) : (
            <>
              <MessageSquarePlus size={12} />
              変更を提案
            </>
          )}
        </button>
      </header>

      {open ? (
        <>
          {/* 🌸 入力推奨: 呼び名 */}
          <NicknameRow
            nickname={customer.nickname ?? null}
            onEdit={() => setEditing(true)}
          />

          {/* ✏️ 編集可能: 誕生日 / 職業 / 好きなお酒 / 活動エリア */}
          <EditableAttributesCard customer={customer} onEdit={() => setEditing(true)} />

          {/* 🔒 閲覧のみ: 店舗からの共有情報 */}
          <StoreSharedInfoCard customer={customer} />
        </>
      ) : (
        // 畳んだ状態: ひと目の要約だけ。タップで再表示。
        <button
          type="button"
          onClick={toggle}
          className="w-full text-left rounded-card border border-ink/[0.06] bg-pearl-warm/40 px-4 py-2.5 hover:border-gold/40 transition"
        >
          <p className="text-body-sm text-ink-soft truncate">{summary}</p>
          <p className="text-[10px] text-ink-mute mt-0.5">タップで詳しく表示</p>
        </button>
      )}

      <CustomerEditSheet
        customer={customer}
        isOpen={editing}
        onClose={() => setEditing(false)}
        canEditDirectly={canEditDirectly}
        requesterCastId={requesterCastId}
        requesterName={requesterName}
        approverCastId={approverCastId}
      />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 入力推奨: 呼び名（ピンク破線）
// ─────────────────────────────────────────────────────────────

function NicknameRow({
  nickname,
  onEdit,
}: {
  nickname: string | null;
  onEdit: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="w-full text-left rounded-card border-[1.5px] border-dashed border-wine-deep/40 bg-wine-soft/20 px-4 py-3 hover:bg-wine-soft/30 transition"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-label-sm font-semibold text-wine-deep">
              呼び名
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-badge bg-wine-soft/30 text-wine-deep font-medium">
              入力推奨
            </span>
          </div>
          {nickname ? (
            <p className="text-body-md text-ink font-medium">{nickname}</p>
          ) : (
            <p className="text-body-sm text-wine-deep/80">
              未入力 — タップして登録
            </p>
          )}
        </div>
        <Pencil size={14} className="text-wine-deep shrink-0" />
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 編集可能: 基本属性 4 項目
// ─────────────────────────────────────────────────────────────

function EditableAttributesCard({
  customer,
  onEdit,
}: {
  customer: Customer;
  onEdit: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-label-sm font-semibold text-ink-secondary">
          基本情報
        </span>
        <button
          type="button"
          onClick={onEdit}
          aria-label="編集"
          className="text-ink-muted hover:text-ink-secondary"
        >
          <Pencil size={13} />
        </button>
      </div>
      <dl className="space-y-2.5">
        <AttrRow label="誕生日" value={formatBirthday(customer.birthday)} />
        <AttrRow label="職業" value={customer.job} />
        <AttrRow label="好きなお酒" value={customer.favorite_drink} />
        <AttrRow label="活動エリア" value={customer.region ?? null} />
      </dl>
    </Card>
  );
}

function AttrRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="text-label-sm text-ink-muted w-20 shrink-0">{label}</dt>
      <dd className="flex-1 text-body-md text-ink">
        {value ?? <span className="text-ink-muted">未入力</span>}
      </dd>
    </div>
  );
}

function formatBirthday(raw: string | null): string | null {
  if (!raw) return null;
  const [yr, mo, da] = raw.split("-");
  if (!mo || !da) return raw;
  const base = `${parseInt(mo, 10)}月${parseInt(da, 10)}日`;
  return yr && yr !== "0000" ? `${yr}年${base}` : base;
}

// ─────────────────────────────────────────────────────────────
// 閲覧のみ: 店舗からの共有情報
// ─────────────────────────────────────────────────────────────

function StoreSharedInfoCard({ customer }: { customer: Customer }) {
  if (!customer.store_memo) return null;
  return (
    <StoreInfoCard title="店舗からの共有情報">
      <div className="flex gap-2.5 rounded-2xl bg-warning/15 border border-warning/30 px-3 py-2.5">
        <AlertTriangle size={15} className="text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-label-sm font-semibold text-warning mb-1">
            気をつけること
          </p>
          <p className="text-body-sm text-ink leading-relaxed whitespace-pre-wrap">
            {customer.store_memo}
          </p>
        </div>
      </div>
      <p className="mt-2 flex items-center gap-1 text-[10px] text-ink-muted">
        <Lock size={9} /> 店舗側のみ編集可能
      </p>
    </StoreInfoCard>
  );
}