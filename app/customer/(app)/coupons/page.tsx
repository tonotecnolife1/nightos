import Link from "next/link";
import { Check, Clock, Gift, MapPin, Sparkles, Ticket } from "lucide-react";
import { PageHeader } from "@/components/nightos/page-header";
import { Card } from "@/components/nightos/card";
import { EmptyState } from "@/components/nightos/empty-state";
import { CURRENT_CUSTOMER_ID } from "@/lib/nightos/constants";
import {
  getCustomerCoupons,
  getCustomerStoreOverviews,
} from "@/lib/nightos/supabase-queries";
import { cn } from "@/lib/utils";
import type { Coupon, CouponType } from "@/types/nightos";

export default async function CustomerCouponsPage() {
  const [coupons, overviews] = await Promise.all([
    getCustomerCoupons(CURRENT_CUSTOMER_ID),
    getCustomerStoreOverviews(CURRENT_CUSTOMER_ID),
  ]);

  const active = coupons.filter((c) => !c.used_at);
  const used = coupons.filter((c) => c.used_at);

  // Group active coupons by store
  const storeIds = Array.from(new Set(active.map((c) => c.store_id)));
  const activeByStore = storeIds.map((storeId) => ({
    storeId,
    storeName:
      overviews.find((o) => o.store_id === storeId)?.store_name ??
      active.find((c) => c.store_id === storeId)?.store_name ??
      "（不明）",
    coupons: active.filter((c) => c.store_id === storeId),
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="クーポン"
        subtitle={`${active.length}枚使えるクーポンがあります`}
      />
      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* Active — grouped by store */}
        {activeByStore.length > 0 ? (
          activeByStore.map((group) => (
            <section key={group.storeId} className="space-y-2">
              <Link
                href={`/customer/stores/${group.storeId}`}
                className="relative flex items-center gap-1.5 pl-3.5 font-serif text-[19px] leading-[1.3] font-medium tracking-[0.02em] text-ink"
              >
                <span aria-hidden className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded bg-rose-gold-metallic" />
                <MapPin size={14} className="text-roseGold-deep" />
                {group.storeName}
              </Link>
              {group.coupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </section>
          ))
        ) : (
          <EmptyState
            icon={<Gift size={22} />}
            title="現在使えるクーポンはありません"
            description="来店回数に応じて自動的にクーポンが届きます🎁 ダイヤモンド会員になると特別な特典もあります。"
            tone="amethyst"
          />
        )}

        {/* Used — flat list */}
        {used.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-label-md text-ink-secondary font-medium">
              利用済み
            </h2>
            {used.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} isUsed />
            ))}
          </section>
        )}

        {/* How to earn */}
        <Card className="!bg-pearl-soft p-4 space-y-2">
          <h3 className="font-serif text-[16px] leading-tight font-medium tracking-[0.02em] text-ink flex items-center gap-1.5">
            <Ticket size={14} className="text-gold-deep" />
            クーポンの獲得方法
          </h3>
          <ul className="text-body-sm text-ink-soft space-y-1.5 leading-relaxed">
            <li>
              🎯 <strong>来店回数</strong> — 5回・10回の節目でドリンクサービス
            </li>
            <li>
              💰 <strong>累計利用額</strong> — ¥100,000達成で10%OFF
            </li>
            <li>
              🎂 <strong>お誕生月</strong> — シャンパンサービスを自動配信
            </li>
            <li>
              👑 <strong>VIP会員</strong> — VIPラウンジ利用など限定特典
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════ Sub-components ═══════════════

const couponTypeIcon: Record<CouponType, string> = {
  drink: "🍸",
  discount: "💰",
  birthday: "🎂",
  vip: "👑",
};

function CouponCard({
  coupon,
  isUsed,
}: {
  coupon: Coupon;
  isUsed?: boolean;
}) {
  return (
    <Card
      className={cn(
        "p-4 relative overflow-hidden",
        isUsed && "opacity-50",
      )}
    >
      {/* Ticket notch */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-pearl rounded-r-full" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-pearl rounded-l-full" />

      <div className="flex items-start gap-3 pl-2">
        <span className="text-2xl shrink-0 mt-0.5">
          {couponTypeIcon[coupon.type]}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-body-md font-semibold text-ink">
              {coupon.title}
            </span>
            {isUsed && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-badge bg-pearl-soft text-ink-muted text-[10px]">
                <Check size={8} />
                利用済
              </span>
            )}
          </div>
          <p className="text-body-sm text-ink-secondary leading-relaxed">
            {coupon.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="text-label-sm text-ink-muted flex items-center gap-1">
              <Clock size={10} />
              {coupon.valid_from} 〜 {coupon.valid_until}
            </div>
            <span className="font-mono text-label-sm text-ink-muted bg-pearl-soft px-2 py-0.5 rounded">
              {coupon.code}
            </span>
          </div>
          {isUsed && (
            <div className="text-[10px] text-ink-muted mt-1">
              {coupon.store_name}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
