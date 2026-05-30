"use client";

import { useEffect, useState } from "react";
import { Check, Crown, UserCog, X } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { cn } from "@/lib/utils";
import type { Cast } from "@/types/nightos";
import {
  addHistoryEntry,
  addRequest,
  loadManagerOverrides,
  setManagerOverride,
} from "../lib/manager-change-store";
import { getStorePermission } from "@/lib/nightos/store-permission-store";

interface Props {
  customerId: string;
  customerName: string;
  currentManagerId: string | null;
  allCasts: Cast[];
  /** 申請者情報（ログイン者） */
  requesterCastId: string;
  requesterName: string;
}

/**
 * 顧客カルテ上の「管理者を変更」ボタン。
 * - オーナー（権限あり）: 即適用 + 履歴記録
 * - 非オーナー: 承認申請キューに積む（履歴にはまだ残らない）
 */
export function ChangeManagerButton({
  customerId,
  customerName,
  currentManagerId,
  allCasts,
  requesterCastId,
  requesterName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [override, setOverride] = useState<string | null | undefined>(undefined);
  const [submitted, setSubmitted] = useState<"pending" | "applied" | null>(null);

  useEffect(() => {
    setIsOwner(getStorePermission() === "owner");
    const overrides = loadManagerOverrides();
    if (customerId in overrides) setOverride(overrides[customerId]);
  }, [customerId]);

  // The effective current manager: override takes precedence over prop
  const effectiveManagerId =
    override !== undefined ? override : currentManagerId;

  const managers = allCasts;

  const currentManager = effectiveManagerId
    ? allCasts.find((c) => c.id === effectiveManagerId)
    : null;

  const submit = () => {
    const targetId = selected || null;
    const targetManager = targetId ? allCasts.find((c) => c.id === targetId) : null;

    if (isOwner) {
      // Direct apply
      setManagerOverride(customerId, targetId);
      addHistoryEntry({
        customerId,
        customerName,
        fromManagerId: effectiveManagerId ?? null,
        fromManagerName: currentManager?.name ?? null,
        toManagerId: targetId,
        toManagerName: targetManager?.name ?? null,
        changedByCastId: requesterCastId,
        changedByName: requesterName,
        mode: "direct",
        reason: reason.trim() || null,
      });
      setOverride(targetId);
      setSubmitted("applied");
    } else {
      // Request approval
      addRequest({
        customerId,
        customerName,
        fromManagerId: effectiveManagerId ?? null,
        fromManagerName: currentManager?.name ?? null,
        toManagerId: targetId,
        toManagerName: targetManager?.name ?? null,
        requestedByCastId: requesterCastId,
        requestedByName: requesterName,
        reason: reason.trim() || null,
      });
      setSubmitted("pending");
    }

    setTimeout(() => {
      setOpen(false);
      setSubmitted(null);
      setSelected("");
      setReason("");
    }, 2000);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[10px] font-medium",
          "bg-champagne border border-champagne-dark text-ink-soft hover:bg-champagne-dark active:scale-[0.97]",
        )}
      >
        <UserCog size={10} />
        管理者変更
      </button>
    );
  }

  if (submitted === "applied") {
    return (
      <Card className="p-3 !border-success/30 !bg-success/5">
        <div className="flex items-center gap-1.5 text-success text-body-sm">
          <Check size={14} />
          管理者を変更しました
        </div>
      </Card>
    );
  }

  if (submitted === "pending") {
    return (
      <Card className="p-3 !border-warning/30 !bg-warning/5">
        <div className="text-warning text-body-sm font-medium">
          承認申請を送信しました
        </div>
        <p className="text-[10px] text-ink-soft mt-1">
          店舗オーナーの承認後に反映されます
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-3 !border-gold/30 !bg-champagne-soft/60/20 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-gold-deep">
          <Crown size={13} />
          <span className="text-body-sm font-medium">管理者を変更</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-ink-mute p-0.5"
          aria-label="キャンセル"
        >
          <X size={14} />
        </button>
      </div>

      <div>
        <div className="text-[10px] text-ink-mute mb-0.5">
          現在: {currentManager?.name ?? "未割り当て"}
        </div>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full h-10 rounded-btn border border-pearl-soft bg-pearl-warm px-3 text-body-sm text-ink"
          style={{ fontSize: "16px" }}
        >
          <option value="">管理者なし</option>
          {managers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}さん
            </option>
          ))}
        </select>
      </div>

      <div>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="変更理由（任意）"
          className="w-full h-9 rounded-btn border border-pearl-soft bg-pearl-warm px-3 text-body-sm text-ink placeholder:text-ink-mute"
          style={{ fontSize: "16px" }}
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={selected === (effectiveManagerId ?? "")}
        className={cn(
          "w-full h-10 rounded-btn text-label-md font-medium transition-all active:scale-[0.98]",
          selected === (effectiveManagerId ?? "")
            ? "bg-pearl-soft text-ink-mute cursor-not-allowed"
            : isOwner
              ? "bg-wine-deep text-pearl-light shadow-luxe-card"
              : "bg-champagne-dark text-ink shadow-soft",
        )}
      >
        {isOwner ? "即適用（オーナー権限）" : "承認を申請する"}
      </button>

      {!isOwner && (
        <p className="text-[10px] text-ink-mute">
          オーナーの承認が必要です。申請後、店舗スタッフ（オーナー）画面の承認キューに表示されます。
        </p>
      )}
    </Card>
  );
}
