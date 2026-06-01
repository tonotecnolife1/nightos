"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import {
  listPendingProfileRequests,
  type ProfileChangeRequest,
} from "@/features/customer-management/lib/profile-change-store";

interface Props {
  /** 承認者となるキャスト（自分宛て＋オーナー宛て null を表示） */
  castId: string;
}

/**
 * 顧客一覧の上部に出す「承認待ちの変更提案」インボックス。
 * 個別カルテを開かずとも、自分が承認すべき提案に気づける導線。
 */
export function ProfileProposalInbox({ castId }: Props) {
  const [requests, setRequests] = useState<ProfileChangeRequest[]>([]);

  useEffect(() => {
    setRequests(listPendingProfileRequests(castId));
  }, [castId]);

  if (requests.length === 0) return null;

  return (
    <section className="rounded-card border border-warning/30 bg-warning/5 px-3 py-2.5 space-y-2">
      <header className="flex items-center gap-1.5 text-warning">
        <Inbox size={14} />
        <h2 className="text-label-sm font-semibold">承認待ちの変更提案</h2>
        <span className="ml-auto text-[11px] text-ink-mute">{requests.length}件</span>
      </header>
      <ul className="space-y-1">
        {requests.map((req) => (
          <li key={req.id}>
            <Link
              href={`/cast/customers/${req.customerId}`}
              className="flex items-center gap-2 rounded-xl bg-white/70 border border-ink/[0.06] px-3 py-2 hover:border-warning/40 transition"
            >
              <div className="flex-1 min-w-0">
                <span className="text-body-sm font-medium text-ink">
                  {req.customerName}さま
                </span>
                <span className="text-[10px] text-ink-mute ml-1.5">
                  {req.requestedByName}さんの提案
                </span>
              </div>
              <ChevronRight size={13} className="text-ink-mute shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
