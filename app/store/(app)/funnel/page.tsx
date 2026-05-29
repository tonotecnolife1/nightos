import {
  Store,
  UserCheck,
  MessageCircle,
  TrendingUp,
  Users,
  Star,
} from "lucide-react";
import { Card } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import { OwnerGuard } from "@/features/store-hub/components/owner-guard";
import {
  calculateFunnelByCast,
  calculateFunnelStats,
} from "@/lib/nightos/referral-tree";
import { mockCasts, mockCustomers } from "@/lib/nightos/mock-data";
import { CURRENT_STORE_ID } from "@/lib/nightos/constants";
import { cn } from "@/lib/utils";
import type { CustomerCategory } from "@/types/nightos";

export default function StoreFunnelPage() {
  const storeCustomers = mockCustomers.filter(
    (c) => c.store_id === CURRENT_STORE_ID,
  );
  const storeCasts = mockCasts.filter((c) => c.store_id === CURRENT_STORE_ID);

  const overall = calculateFunnelStats(storeCustomers);
  const byCast = calculateFunnelByCast({
    customers: storeCustomers,
    casts: storeCasts,
  }).filter((b) => b.stats.total > 0);

  // Recent line exchanges (last 10)
  const recentLineExchanges = storeCustomers
    .filter((c) => c.line_exchanged_at)
    .sort(
      (a, b) =>
        new Date(b.line_exchanged_at!).getTime() -
        new Date(a.line_exchanged_at!).getTime(),
    )
    .slice(0, 10);

  // お連れ様貢献ランキング
  const referralCounts = new Map<string, number>();
  for (const c of storeCustomers) {
    if (c.referred_by_customer_id) {
      referralCounts.set(
        c.referred_by_customer_id,
        (referralCounts.get(c.referred_by_customer_id) ?? 0) + 1,
      );
    }
  }
  const topReferrers = Array.from(referralCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([custId, count]) => ({
      customer: storeCustomers.find((c) => c.id === custId)!,
      count,
    }))
    .filter((r) => r.customer);

  // カテゴリ別内訳
  const CATEGORIES: { value: CustomerCategory; label: string; color: string }[] =
    [
      { value: "vip", label: "VIP", color: "bg-roseGold-dark" },
      { value: "regular", label: "常連", color: "bg-gold-deep" },
      { value: "new", label: "新規", color: "bg-pearl-soft" },
    ];
  const categoryBreakdown = CATEGORIES.map(({ value, label, color }) => {
    const cats = storeCustomers.filter((c) => c.category === value);
    const lineEx = cats.filter((c) => c.funnel_stage === "line_exchanged").length;
    const assigned = cats.filter((c) => c.funnel_stage === "assigned").length;
    return { value, label, color, total: cats.length, lineEx, assigned };
  });

  return (
    <OwnerGuard>
    <div className="animate-fade-in">
      <PageHeader
        title="顧客ファネル"
        subtitle="店舗登録 → 担当付き → LINE交換"
        showBack
      />

      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* Overall funnel */}
        <section className="space-y-3">
          <h2 className="text-display-sm text-ink">店舗全体</h2>
          <FunnelRow
            icon={<Store size={14} />}
            label="店舗登録"
            count={overall.total}
            max={overall.total}
            colorClass="bg-pearl-soft"
          />
          <FunnelRow
            icon={<UserCheck size={14} />}
            label="担当付き"
            count={overall.assigned + overall.lineExchanged}
            max={overall.total}
            colorClass="bg-gradient-rose-gold"
          />
          <FunnelRow
            icon={<MessageCircle size={14} />}
            label="LINE交換済み"
            count={overall.lineExchanged}
            max={overall.total}
            colorClass="bg-gradient-amethyst"
          />

          <Card className="p-3 grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-[10px] text-ink-mute">担当転換率</div>
              <div className="text-display-sm font-display text-roseGold-dark">
                {Math.round(overall.assignedRate * 100)}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-ink-mute">LINE交換率</div>
              <div className="text-display-sm font-display text-gold-deep">
                {Math.round(overall.lineExchangedRate * 100)}%
              </div>
            </div>
          </Card>
        </section>

        {/* Category breakdown */}
        <section className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-roseGold-dark" />
            <h2 className="text-display-sm text-ink">カテゴリ別ファネル</h2>
          </div>
          {categoryBreakdown.map(({ value, label, color, total, lineEx, assigned }) => (
            <Card key={value} className="p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-body-sm font-medium text-ink">{label}</span>
                <span className="text-[10px] text-ink-mute">
                  計 {total}人 / LINE {lineEx}人
                  {total > 0 && (
                    <> ({Math.round((lineEx / total) * 100)}%)</>
                  )}
                </span>
              </div>
              {total > 0 && (
                <div className="flex gap-0.5 h-2">
                  {lineEx > 0 && (
                    <div
                      className="bg-gradient-amethyst rounded-full"
                      style={{ flex: lineEx }}
                      title={`LINE交換済み ${lineEx}`}
                    />
                  )}
                  {assigned > 0 && (
                    <div
                      className="bg-gradient-rose-gold rounded-full"
                      style={{ flex: assigned }}
                      title={`担当あり ${assigned}`}
                    />
                  )}
                  {total - lineEx - assigned > 0 && (
                    <div
                      className="bg-pearl-soft rounded-full"
                      style={{ flex: total - lineEx - assigned }}
                      title={`店舗登録のみ ${total - lineEx - assigned}`}
                    />
                  )}
                </div>
              )}
            </Card>
          ))}
        </section>

        {/* Referral ranking */}
        {topReferrers.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-gold-deep" />
              <h2 className="text-display-sm text-ink">お連れ様貢献ランキング</h2>
            </div>
            <div className="space-y-1.5">
              {topReferrers.map(({ customer, count }, i) => (
                <Card key={customer.id} className="p-2.5 flex items-center gap-3">
                  <span className="text-[11px] font-display text-ink-mute w-4 shrink-0 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-body-sm text-ink">{customer.name}さま</span>
                    {customer.job && (
                      <span className="ml-1.5 text-[10px] text-ink-mute">
                        {customer.job}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Users size={11} className="text-gold-deep" />
                    <span className="text-body-sm font-display text-gold-deep">
                      {count}人
                    </span>
                  </div>
                </Card>
              ))}
            </div>
            <p className="text-[10px] text-ink-mute px-0.5">
              お連れ様を多くご紹介いただいているお客様。特別なフォローで関係を深めましょう。
            </p>
          </section>
        )}

        {/* By cast */}
        <section className="space-y-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-roseGold-dark" />
            <h2 className="text-display-sm text-ink">キャスト別</h2>
          </div>
          {byCast.map(({ cast, stats }) => (
            <Card key={cast.id} className="p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-body-sm font-medium text-ink">
                  {cast.name}さん
                </span>
                <span className="text-[10px] text-ink-mute">
                  担当 {stats.assigned + stats.lineExchanged} → LINE{" "}
                  {stats.lineExchanged}
                  {stats.assigned + stats.lineExchanged > 0 && (
                    <> ({Math.round(stats.lineExchangedRate * 100)}%)</>
                  )}
                </span>
              </div>
              <div className="flex gap-1 h-2">
                {stats.total === 0 ? (
                  <div className="flex-1 bg-pearl-soft rounded-full" />
                ) : (
                  <>
                    {stats.storeOnly > 0 && (
                      <div
                        className="bg-pearl-soft rounded-full"
                        style={{
                          flex: stats.storeOnly,
                        }}
                        title={`店舗登録のみ ${stats.storeOnly}`}
                      />
                    )}
                    {stats.assigned > 0 && (
                      <div
                        className="bg-gradient-rose-gold rounded-full"
                        style={{ flex: stats.assigned }}
                        title={`担当あり ${stats.assigned}`}
                      />
                    )}
                    {stats.lineExchanged > 0 && (
                      <div
                        className="bg-gradient-amethyst rounded-full"
                        style={{ flex: stats.lineExchanged }}
                        title={`LINE交換済み ${stats.lineExchanged}`}
                      />
                    )}
                  </>
                )}
              </div>
              {stats.assigned + stats.lineExchanged > 0 &&
                stats.lineExchangedRate < 0.5 && (
                  <div className="text-[10px] text-amber">
                    ⚠️ LINE交換率が低い。育成支援候補
                  </div>
                )}
            </Card>
          ))}
        </section>

        {/* Recent LINE exchanges */}
        {recentLineExchanges.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-display-sm text-ink flex items-center gap-1.5">
              <MessageCircle size={14} className="text-gold-deep" />
              最近のLINE交換
            </h2>
            {recentLineExchanges.map((c) => {
              const assignedCast = storeCasts.find(
                (cast) => cast.id === (c.line_exchanged_cast_id ?? c.cast_id),
              );
              return (
                <Card key={c.id} className="p-2.5 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-champagne-soft/60 flex items-center justify-center shrink-0">
                    <MessageCircle size={11} className="text-gold-deep" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-baseline gap-2">
                    <span className="text-body-sm text-ink truncate">
                      {c.name}さま
                    </span>
                    <span className="text-[10px] text-ink-mute truncate">
                      → {assignedCast?.name ?? "—"}さん
                    </span>
                  </div>
                  <span className="text-[10px] text-ink-mute shrink-0">
                    {formatDate(c.line_exchanged_at!)}
                  </span>
                </Card>
              );
            })}
          </section>
        )}
      </div>
    </div>
    </OwnerGuard>
  );
}

function FunnelRow({
  icon,
  label,
  count,
  max,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  max: number;
  colorClass: string;
}) {
  const pct = max === 0 ? 0 : (count / max) * 100;
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-body-sm text-ink">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-body-md font-display text-ink">{count}人</span>
      </div>
      <div className="h-2 bg-pearl-soft rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
