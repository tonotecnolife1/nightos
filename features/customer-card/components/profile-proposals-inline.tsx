"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, HandHelping, X } from "lucide-react";
import { Card } from "@/components/nightos/card";
import {
  listPendingProfileRequestsForCustomer,
  profileFieldLabel,
  resolveProfileRequest,
  type ProfileChangeField,
  type ProfileChangeRequest,
} from "@/features/customer-management/lib/profile-change-store";

interface Props {
  customerId: string;
  /** 承認できる関係性か（マスター/担当）。false の提案者には「提案中」表示のみ。 */
  canApprove: boolean;
  /** 承認/却下の記録に残す名前 */
  approverName: string;
}

/**
 * カルテ内インライン: このお客様への「プロフィール変更提案」を表示。
 * 承認者(マスター/担当)には承認/却下ボタン、それ以外には進捗だけ見せる。
 */
export function ProfileProposalsInline({
  customerId,
  canApprove,
  approverName,
}: Props) {
  const router = useRouter();
  const [requests, setRequests] = useState<ProfileChangeRequest[]>([]);

  useEffect(() => {
    setRequests(listPendingProfileRequestsForCustomer(customerId));
  }, [customerId]);

  if (requests.length === 0) return null;

  const resolve = (id: string, resolution: "approve" | "reject") => {
    resolveProfileRequest(id, resolution, approverName);
    setRequests(listPendingProfileRequestsForCustomer(customerId));
    // 承認で値が反映された場合に最新表示へ
    router.refresh();
  };

  return (
    <section className="space-y-2">
      <header className="flex items-center gap-1.5 px-1">
        <HandHelping size={14} className="text-champagne-dark" />
        <h2 className="text-display-sm text-ink">変更提案</h2>
        <span className="text-label-sm text-ink-mute">{requests.length}件</span>
      </header>

      {requests.map((req) => (
        <Card key={req.id} className="p-3 space-y-2 !bg-champagne/20">
          <div className="flex items-center justify-between gap-2">
            <span className="text-body-sm text-ink">
              <span className="font-medium">{req.requestedByName}</span> さんからの提案
            </span>
            {!canApprove && (
              <span className="inline-flex items-center gap-1 text-[10px] text-ink-mute">
                <Clock size={10} />
                承認待ち
              </span>
            )}
          </div>

          <ul className="space-y-1">
            {(Object.keys(req.changes) as ProfileChangeField[]).map((field) => {
              const diff = req.changes[field];
              if (!diff) return null;
              return (
                <li
                  key={field}
                  className="flex items-baseline gap-2 text-[12px] text-ink"
                >
                  <span className="text-ink-mute w-20 shrink-0">
                    {profileFieldLabel(field)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="text-ink-mute line-through">
                      {diff.from ?? "未入力"}
                    </span>
                    <span className="mx-1">→</span>
                    <span className="font-medium text-wine-deep">
                      {diff.to ?? "未入力"}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          {req.reason && (
            <p className="text-[11px] text-ink-soft bg-pearl-soft rounded-lg px-2 py-1">
              理由: {req.reason}
            </p>
          )}

          {canApprove && (
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => resolve(req.id, "reject")}
                className="flex-1 h-9 rounded-pill border border-ink/[0.10] bg-pearl-soft text-body-sm text-ink-secondary hover:bg-pearl"
              >
                <X size={13} className="inline mr-1" />
                却下
              </button>
              <button
                type="button"
                onClick={() => resolve(req.id, "approve")}
                className="flex-1 h-9 rounded-pill bg-wine-deep text-pearl-light text-body-sm font-medium shadow-warm active:translate-y-[1px] transition"
              >
                <Check size={13} className="inline mr-1" />
                承認して反映
              </button>
            </div>
          )}
        </Card>
      ))}
    </section>
  );
}
