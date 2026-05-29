"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, Clock, UserCog, X } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { EmptyState } from "@/components/nightos/empty-state";
import {
  listPendingRequests,
  resolveRequest,
  setManagerOverride,
  type ManagerChangeRequest,
} from "@/features/customer-management/lib/manager-change-store";

const OWNER_NAME = "店舗オーナー"; // デモ用 — 本番はログイン情報から

export function ApprovalQueue() {
  const [requests, setRequests] = useState<ManagerChangeRequest[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    setRequests(listPendingRequests());
    setLoaded(true);
  };

  const approve = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    // Apply the manager change
    setManagerOverride(req.customerId, req.toManagerId);
    resolveRequest(id, "approve", OWNER_NAME);
    refresh();
  };

  const reject = (id: string) => {
    resolveRequest(id, "reject", OWNER_NAME);
    refresh();
  };

  if (!loaded) return null;

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={<Check size={22} />}
        title="承認待ちの申請はありません"
        description="キャストから管理者変更の申請が出ると、ここに表示されます。"
      />
    );
  }

  return (
    <div className="space-y-2">
      {requests.map((req) => {
        const date = new Date(req.requestedAt);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
        return (
          <Card key={req.id} className="p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] text-ink-mute">
              <Clock size={10} />
              <span>{dateStr}</span>
              <span>·</span>
              <span>申請者: {req.requestedByName}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <UserCog size={13} className="text-gold-deep shrink-0" />
              <span className="text-body-sm font-medium text-ink">
                {req.customerName}さま
              </span>
            </div>

            <div className="flex items-center gap-2 text-body-sm bg-pearl-soft rounded-btn px-3 py-2">
              <span className="text-ink-soft">
                {req.fromManagerName ?? "未割り当て"}
              </span>
              <ArrowRight size={12} className="text-ink-mute shrink-0" />
              <span className="text-ink font-medium">
                {req.toManagerName ?? "未割り当て"}
              </span>
            </div>

            {req.reason && (
              <div className="text-[11px] text-ink-soft bg-pearl-warm rounded-btn px-2 py-1.5">
                理由: {req.reason}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => approve(req.id)}
                className="flex-1 h-9 rounded-btn bg-success/10 text-success border border-success/25 text-label-sm font-medium active:scale-[0.98] flex items-center justify-center gap-1"
              >
                <Check size={12} />
                承認する
              </button>
              <button
                type="button"
                onClick={() => reject(req.id)}
                className="h-9 px-4 rounded-btn bg-pearl-soft text-ink-soft text-label-sm active:scale-[0.98] flex items-center gap-1"
              >
                <X size={12} />
                却下
              </button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
