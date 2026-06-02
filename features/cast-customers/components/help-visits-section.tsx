"use client";

import Link from "next/link";
import { Calendar, ChevronRight, HandHelping, User } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { EmptyState } from "@/components/nightos/empty-state";
import { formatCustomerName } from "@/lib/utils";
import type { HelpSummaryEntry } from "@/lib/nightos/master-help-split";

interface Props {
  entries: HelpSummaryEntry[];
  title?: string;
  description?: string;
}

/**
 * 「ヘルプで入ったお客様」セクション。
 * 他の担当（メイン）の顧客への接客実績を集約表示。
 */
export function HelpVisitsSection({
  entries,
  title = "ヘルプで入ったお客様",
  description,
}: Props) {
  if (entries.length === 0) {
    return (
      <section className="space-y-2">
        <SectionHeader title={title} count={0} description={description} />
        <EmptyState
          icon={<HandHelping size={20} />}
          title="ヘルプ実績はまだありません"
          description="他の担当のお客様に接客した記録があればここに表示されます。"
        />
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <SectionHeader
        title={title}
        count={entries.length}
        description={description}
      />
      {entries.map((e) => (
        <Link
          key={e.customer.id}
          href={`/cast/customers/${e.customer.id}`}
          className="block active:scale-[0.99] transition-transform"
        >
          <Card className="p-2.5 flex items-center gap-2.5 !bg-champagne/30">
            <div className="w-8 h-8 rounded-full bg-champagne-dark/30 flex items-center justify-center shrink-0">
              <User size={12} className="text-ink-soft" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-body-sm font-medium text-ink truncate">
                  {formatCustomerName(e.customer.name)}
                </span>
                {e.masterName && (
                  <span className="text-[10px] text-ink-mute shrink-0">
                    （{e.masterName}管理）
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-ink-mute mt-0.5">
                <Calendar size={9} />
                <span>
                  最終{formatShortDate(e.lastVisitedAt)}
                  {e.visitCount > 1 && ` · ${e.visitCount}回ヘルプ`}
                </span>
              </div>
            </div>
            <ChevronRight size={13} className="text-ink-mute shrink-0" />
          </Card>
        </Link>
      ))}
    </section>
  );
}

function SectionHeader({
  title,
  count,
  description,
}: {
  title: string;
  count: number;
  description?: string;
}) {
  return (
    <header>
      <div className="flex items-baseline justify-between">
        <h2 className="text-display-sm text-ink flex items-center gap-1.5">
          <HandHelping size={15} className="text-champagne-dark" />
          {title}
        </h2>
        <span className="text-label-sm text-ink-mute">{count}人</span>
      </div>
      {description && (
        <p className="text-[10px] text-ink-mute mt-0.5">{description}</p>
      )}
    </header>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
