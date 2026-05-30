import { notFound } from "next/navigation";
import {
  AlertTriangle,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Coins,
  Sparkles,
  Ticket,
  User,
  Wine,
} from "lucide-react";
import { PageHeader } from "@/components/nightos/page-header";
import { Card } from "@/components/nightos/card";
import { Badge } from "@/components/nightos/badge";
import { CURRENT_CUSTOMER_ID } from "@/lib/nightos/constants";
import { getCustomerStoreOverviews } from "@/lib/nightos/supabase-queries";
import { cn, formatBottleRemainingPct, formatCurrency } from "@/lib/utils";
import type { Coupon, CustomerRank, CouponType, RankTier } from "@/types/nightos";

export default async function CustomerStoreDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const overviews = await getCustomerStoreOverviews(CURRENT_CUSTOMER_ID);
  const store = overviews.find((o) => o.store_id === params.id);
  if (!store) notFound();

  const activeCoupons = store.coupons.filter((c) => !c.used_at);
  const usedCoupons = store.coupons.filter((c) => c.used_at);

  return (
    <div className="animate-fade-in">
      <PageHeader title={store.store_name} showBack />

      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* Rank */}
        <RankCard rank={store.rank} />

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="relative overflow-hidden rounded-hero bg-pearl-light/85 backdrop-blur-md border border-ink/[0.08] shadow-soft px-3 py-3 text-center">
            <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-rose-gold-metallic opacity-60" />
            <Calendar size={14} className="mx-auto text-ink-soft mb-1" />
            <div className="font-display text-[1.5rem] leading-none font-normal tabular-nums text-ink">
              {store.visit_count}
            </div>
            <div className="text-label-xs tracking-luxe text-ink-mute mt-1">来店回数</div>
          </div>
          <div className="relative overflow-hidden rounded-hero bg-pearl-light/85 backdrop-blur-md border border-ink/[0.08] shadow-soft px-3 py-3 text-center">
            <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-rose-gold-metallic opacity-60" />
            <Coins size={14} className="mx-auto text-wine-deep mb-1" />
            <div className="font-display text-[1rem] leading-none font-medium tabular-nums text-wine-deep">
              {formatCurrency(store.total_spent_estimate)}
            </div>
            <div className="text-label-xs tracking-luxe text-ink-mute mt-1">累計利用</div>
          </div>
          <div className="relative overflow-hidden rounded-hero bg-pearl-light/85 backdrop-blur-md border border-ink/[0.08] shadow-soft px-3 py-3 text-center">
            <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-rose-gold-metallic opacity-60" />
            <Ticket size={14} className="mx-auto text-gold-deep mb-1" />
            <div className="font-display text-[1.5rem] leading-none font-normal tabular-nums text-gold-deep">
              {activeCoupons.length}
            </div>
            <div className="text-label-xs tracking-luxe text-ink-mute mt-1">使えるクーポン</div>
          </div>
        </div>

        {/* Cast (指名) */}
        {store.nomination_cast && (
          <section className="space-y-2">
            <h2 className="relative font-serif text-[19px] leading-[1.3] font-medium tracking-[0.02em] text-ink flex items-center gap-1.5 pl-3.5">
              <span aria-hidden className="absolute left-0 top-1 bottom-1 w-[3px] rounded bg-rose-gold-metallic" />
              <User size={16} className="text-wine-deep" />
              担当キャスト
            </h2>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-ink font-serif text-[18px] leading-none font-medium tracking-[0.02em] border border-gold/35"
                  style={{
                    background: "var(--champagne-metallic)",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)",
                  }}
                >
                  {store.nomination_cast.charAt(0)}
                </div>
                <div>
                  <div className="font-serif text-[16px] leading-tight font-medium tracking-[0.01em] text-ink">
                    {store.nomination_cast}
                  </div>
                  <div className="text-label-xs tracking-luxe text-ink-mute">
                    指名キャスト
                  </div>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Bottles */}
        <section className="space-y-2">
          <h2 className="relative font-serif text-[19px] leading-[1.3] font-medium tracking-[0.02em] text-ink flex items-center gap-1.5 pl-3.5"><span aria-hidden className="absolute left-0 top-1 bottom-1 w-[3px] rounded bg-rose-gold-metallic" />
            <Wine size={16} className="text-wine-deep" />
            キープボトル
            <span className="text-label-sm text-ink-mute">
              {store.bottles.length}本
            </span>
          </h2>
          {store.bottles.length === 0 ? (
            <Card className="p-4 text-center text-body-sm text-ink-soft">
              この店舗にキープボトルはありません
            </Card>
          ) : (
            store.bottles.map((b) => {
              const isLow = b.remaining_glasses <= 5;
              const pct =
                b.total_glasses > 0
                  ? (b.remaining_glasses / b.total_glasses) * 100
                  : 0;
              return (
                <Card key={b.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-body-md font-semibold text-ink">
                      {b.brand}
                    </span>
                    <span className="text-body-sm text-ink-soft">
                      残 {formatBottleRemainingPct(
                        b.remaining_glasses,
                        b.total_glasses,
                      )}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-pearl-soft overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        isLow ? "bg-warning" : "bg-rose-gold-metallic",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {isLow && (
                    <div className="flex items-center gap-1 text-label-sm text-warning">
                      <AlertTriangle size={11} />
                      残りわずか
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </section>

        {/* Coupons */}
        <section className="space-y-2">
          <h2 className="relative font-serif text-[19px] leading-[1.3] font-medium tracking-[0.02em] text-ink flex items-center gap-1.5 pl-3.5"><span aria-hidden className="absolute left-0 top-1 bottom-1 w-[3px] rounded bg-rose-gold-metallic" />
            <Sparkles size={16} className="text-gold-deep" />
            クーポン
          </h2>

          {activeCoupons.length > 0 && (
            <div className="space-y-2">
              {activeCoupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          )}

          {activeCoupons.length === 0 && (
            <Card className="p-4 text-center text-body-sm text-ink-soft">
              この店舗で使えるクーポンはありません
            </Card>
          )}

          {usedCoupons.length > 0 && (
            <div className="space-y-2 mt-3">
              <h3 className="text-label-md text-ink-soft font-medium">
                利用済み
              </h3>
              {usedCoupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} isUsed />
              ))}
            </div>
          )}
        </section>

        {/* Last visit */}
        {store.last_visit && (
          <div className="text-label-sm text-ink-mute text-center">
            最終来店:{" "}
            {new Date(store.last_visit).toLocaleDateString("ja-JP")}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════ Sub-components ═══════════════

const tierColors: Record<RankTier, { bg: string; border: string; text: string }> = {
  diamond: { bg: "bg-gold-metallic", border: "border-gold", text: "text-pearl-light" },
  platinum: { bg: "bg-rose-gold-metallic", border: "border-wine-deep", text: "text-pearl-light" },
  gold: { bg: "bg-champagne-metallic", border: "border-gold", text: "text-ink" },
  silver: { bg: "bg-pearl-light", border: "border-line-strong", text: "text-ink" },
  bronze: { bg: "bg-pearl-light", border: "border-line-strong", text: "text-ink-soft" },
};

function RankCard({ rank }: { rank: CustomerRank }) {
  const colors = tierColors[rank.tier];
  return (
    <Card className={`!${colors.bg} !${colors.border} p-5 space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{rank.emoji}</span>
          <div>
            <div className={`text-display-sm font-semibold ${colors.text}`}>
              {rank.label}ランク
            </div>
            <div className={`text-label-sm ${rank.tier === "diamond" || rank.tier === "platinum" ? "text-pearl-light/80" : "text-ink-soft"}`}>
              来店 {rank.visitCount}回
            </div>
          </div>
        </div>
      </div>
      {rank.nextTierLabel && (
        <div>
          <div className="flex items-center justify-between text-label-sm mb-1">
            <span className={rank.tier === "diamond" || rank.tier === "platinum" ? "text-pearl-light/80" : "text-ink-soft"}>
              次のランク: {rank.nextTierLabel}
            </span>
            <span className={rank.tier === "diamond" || rank.tier === "platinum" ? "text-pearl-light" : "text-ink"}>
              あと{rank.visitsToNextTier}回
            </span>
          </div>
          <div className="h-2 rounded-full bg-pearl/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-pearl"
              style={{ width: `${rank.progress * 100}%` }}
            />
          </div>
        </div>
      )}
      {!rank.nextTierLabel && (
        <div className={`text-label-sm ${colors.text}`}>
          最高ランクに到達しています ✨
        </div>
      )}
    </Card>
  );
}

const couponTypeIcon: Record<CouponType, string> = {
  drink: "🍸",
  discount: "💰",
  birthday: "🎂",
  vip: "👑",
};

function CouponCard({ coupon, isUsed }: { coupon: Coupon; isUsed?: boolean }) {
  return (
    <Card className={cn("p-3 relative overflow-hidden", isUsed && "opacity-50")}>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-pearl rounded-r-full" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-pearl rounded-l-full" />
      <div className="flex items-center gap-3 pl-2">
        <span className="text-xl">{couponTypeIcon[coupon.type]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-body-sm font-semibold text-ink truncate">
              {coupon.title}
            </span>
            {isUsed && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-badge bg-pearl-soft text-ink-mute text-[10px]">
                <Check size={8} />
                利用済
              </span>
            )}
          </div>
          <div className="text-label-sm text-ink-mute flex items-center gap-1">
            <Clock size={9} />
            〜{coupon.valid_until}
            <span className="ml-1 font-mono text-[10px] bg-pearl-soft px-1.5 rounded">
              {coupon.code}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
