"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, UserCog } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { listPendingRequests } from "@/features/customer-management/lib/manager-change-store";

export function ApprovalLink() {
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCount(listPendingRequests().length);
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  return (
    <Link
      href="/store/approvals"
      className="block active:scale-[0.99] transition-transform"
    >
      <Card
        className={`p-3 ${count > 0 ? "!border-warning/30 !bg-warning/5" : "!border-pearl-soft"}`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${count > 0 ? "bg-warning/20 text-warning" : "bg-pearl-soft text-ink-mute"}`}
          >
            <UserCog size={16} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-body-sm font-semibold text-ink">
                承認キュー
              </span>
              {count > 0 && (
                <span className="text-[10px] bg-amber text-pearl px-1.5 py-0.5 rounded-badge font-semibold">
                  {count}
                </span>
              )}
            </div>
            <div className="text-[10px] text-ink-soft mt-0.5">
              {count > 0
                ? `${count}件の管理者変更申請が承認待ちです`
                : "未処理の申請はありません"}
            </div>
          </div>
          <ChevronRight size={14} className="text-ink-mute" />
        </div>
      </Card>
    </Link>
  );
}
