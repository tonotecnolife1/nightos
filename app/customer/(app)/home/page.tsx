import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Crown,
  Diamond,
  MapPin,
  Star,
  Ticket,
  User,
  Wine,
} from "lucide-react";
import { Card, GemCard } from "@/components/nightos/card";
import { Badge } from "@/components/nightos/badge";
import { EmptyState } from "@/components/nightos/empty-state";
import { RoleSwitchLink } from "@/components/nightos/role-switch-link";
import { StatCard } from "@/components/nightos/stat-card";
import { CURRENT_CUSTOMER_ID } from "@/lib/nightos/constants";
import {
  getCustomerById,
  getCustomerCoupons,
  getCustomerStoreOverviews,
} from "@/lib/nightos/supabase-queries";
import type { CustomerStoreOverview, RankTier } from "@/types/nightos";

export default async function CustomerHomePage() {
  const [customer, overviews, coupons] = await Promise.all([
    getCustomerById(CURRENT_CUSTOMER_ID),
    getCustomerStoreOverviews(CURRENT_CUSTOMER_ID),
    getCustomerCoupons(CURRENT_CUSTOMER_ID),
  ]);

  const totalBottles = overviews.reduce(
    (sum, o) => sum + o.bottles.length,
    0,
  );
  const totalVisits = overviews.reduce((sum, o) => sum + o.visit_count, 0);
  const activeCoupons = coupons.filter((c) => !c.used_at);

  // Global rank: highest rank across all stores
  const rankOrder: RankTier[] = ["diamond", "platinum", "gold", "silver", "bronze"];
  const highestRank = overviews.reduce<CustomerStoreOverview | null>((best, o) => {
    if (!best) return o;
    return rankOrder.indexOf(o.rank.tier) < rankOrder.indexOf(best.rank.tier) ? o : best;
  }, null);

  const isDiamond = highestRank?.rank.tier === "diamond";
  const isPlatinumOrAbove = highestRank?.rank.tier === "diamond" || highestRank?.rank.tier === "platinum";

  return (
    <div>
      <header
        className="relative overflow-hidden px-5 pt-12 pb-8"
        style={{
          background:
            "radial-gradient(ellipse at top left, var(--rose-gold-soft) 0%, transparent 55%)," +
            "radial-gradient(ellipse at bottom right, var(--champagne-soft) 0%, transparent 60%)," +
            "linear-gradient(180deg, var(--pearl-light) 0%, var(--pearl) 100%)",
        }}
      >
        <div className="text-label-xs tracking-luxe text-roseGold-deep mb-2">
          NIGHTOS · WELCOME
        </div>
        <p className="text-body-sm text-ink-soft mb-1">
          おかえりなさい
        </p>
        <h1 className="font-serif text-[2rem] leading-[1.15] font-medium tracking-[0.02em] t-metallic">
          {customer?.name ?? "ゲスト"}さん
        </h1>
        {customer && (
          <div className="flex items-center gap-2 mt-3">
            <Badge
              tone={
                customer.category === "vip"
                  ? "vip"
                  : customer.category === "new"
                    ? "new"
                    : "regular"
              }
            >
              {customer.category === "vip"
                ? "VIP会員"
                : customer.category === "new"
                  ? "新規"
                  : "常連"}
            </Badge>
            <span className="text-[11px] text-ink-mute">
              {overviews.length}店舗を利用中
            </span>
          </div>
        )}
      </header>

      <div className="px-5 pt-5 pb-8 space-y-5">
        {/* ── Diamond/Platinum status banner ── */}
        {isPlatinumOrAbove && highestRank && (
          <GemCard className="p-4">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(400px_160px_at_120%_-20%,rgba(255,255,255,0.4),transparent_60%)]"
            />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-pearl-warm/40 backdrop-blur-sm flex items-center justify-center">
                {isDiamond ? (
                  <Diamond size={28} className="text-ink" />
                ) : (
                  <Crown size={28} className="text-ink" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-[11px] text-ink-secondary">
                  {isDiamond ? "ダイヤモンド会員" : "プラチナ会員"}
                </div>
                <div className="font-display text-[20px] leading-tight text-ink">
                  {highestRank.rank.emoji} {highestRank.rank.label}
                </div>
                <div className="text-body-sm text-ink-secondary mt-0.5">
                  全{overviews.length}店舗で特別なおもてなしを受けられます
                </div>
              </div>
            </div>
          </GemCard>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            label="キープボトル"
            value={totalBottles}
            unit="本"
            icon={<Wine size={12} className="text-roseGold-dark" />}
            tone="rose"
          />
          <StatCard
            label="総来店"
            value={totalVisits}
            unit="回"
            icon={<Calendar size={12} className="text-ink-secondary" />}
          />
          <StatCard
            label="クーポン"
            value={activeCoupons.length}
            unit="枚"
            icon={<Ticket size={12} className="text-gold-deep" />}
            tone="amethyst"
          />
        </div>

        {/* Cross-store rank summary */}
        {overviews.length > 1 && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star size={14} className="text-gold-deep" />
              <h3 className="font-display text-[18px] leading-tight font-medium text-ink">
                店舗別ランク
              </h3>
            </div>
            <div className="space-y-2">
              {overviews.map((o) => (
                <div key={o.store_id} className="flex items-center justify-between">
                  <span className="text-body-sm text-ink">{o.store_name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-badge text-[10px] font-semibold ${rankBadgeStyles[o.rank.tier]}`}
                  >
                    {o.rank.emoji} {o.rank.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Store cards */}
        <section className="space-y-3">
          <h2 className="font-display text-[20px] leading-tight font-medium text-ink flex items-center gap-1.5 px-1">
            <MapPin size={16} className="text-gold-deep" />
            ご利用店舗
          </h2>

          {overviews.length === 0 ? (
            <EmptyState
              icon={<MapPin size={22} />}
              title="まだ来店記録がありません"
              description="店舗に来店されると、自動的にボトル・ポイント・クーポンがこちらに表示されます。"
            />
          ) : (
            overviews.map((o) => (
              <StoreCard key={o.store_id} overview={o} />
            ))
          )}
        </section>

        {/* All coupons summary */}
        {activeCoupons.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-display text-[20px] leading-tight font-medium text-ink flex items-center gap-1.5">
                <Ticket size={16} className="text-gold-deep" />
                全クーポン
              </h2>
              <Link
                href="/customer/coupons"
                className="text-[12px] text-blush-deep flex items-center gap-0.5"
              >
                すべて見る
                <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-1.5">
              {activeCoupons.slice(0, 3).map((c) => (
                <Link
                  key={c.id}
                  href={`/customer/stores/${c.store_id}`}
                  className="block"
                >
                  <Card className="!bg-gradient-champagne !border-champagne-dark p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-body-sm font-semibold text-ink truncate">
                          {c.title}
                        </div>
                        <div className="text-label-sm text-ink-muted">
                          {c.store_name} · 〜{c.valid_until}
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-ink-muted shrink-0" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <RoleSwitchLink />
      </div>
    </div>
  );
}

// ═══════════════ Sub-components ═══════════════

const rankBadgeStyles: Record<RankTier, string> = {
  diamond: "bg-gold-deep text-pearl-light",
  platinum: "bg-roseGold-deep text-pearl-light",
  gold: "bg-champagne-deep text-ink",
  silver: "bg-pearl-soft text-ink-soft",
  bronze: "bg-pearl-soft text-ink-mute",
};

function StoreCard({ overview: o }: { overview: CustomerStoreOverview }) {
  const activeCouponCount = o.coupons.filter((c) => !c.used_at).length;

  return (
    <Link
      href={`/customer/stores/${o.store_id}`}
      className="block active:scale-[0.99] transition-transform"
    >
      <Card className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-body-md font-semibold text-ink">
              {o.store_name}
            </h3>
            {o.nomination_cast && (
              <div className="flex items-center gap-1 mt-0.5 text-label-sm text-ink-secondary">
                <User size={11} />
                担当: {o.nomination_cast}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-badge text-[10px] font-semibold ${rankBadgeStyles[o.rank.tier]}`}
            >
              {o.rank.emoji} {o.rank.label}
            </span>
            <ChevronRight size={14} className="text-ink-muted" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-btn bg-pearl-soft py-1.5">
            <div className="font-display text-body-md text-ink">
              {o.visit_count}
            </div>
            <div className="text-[9px] text-ink-muted">来店</div>
          </div>
          <div className="rounded-btn bg-pearl-soft py-1.5">
            <div className="font-display text-body-md text-roseGold-dark">
              {o.bottles.length}
            </div>
            <div className="text-[9px] text-ink-muted">ボトル</div>
          </div>
          <div className="rounded-btn bg-pearl-soft py-1.5">
            <div className="font-display text-body-md text-amethyst-dark">
              {activeCouponCount}
            </div>
            <div className="text-[9px] text-ink-muted">クーポン</div>
          </div>
          <div className="rounded-btn bg-pearl-soft py-1.5">
            <div className="text-[10px]">{o.rank.emoji}</div>
            <div className="text-[9px] text-ink-muted">{o.rank.label}</div>
          </div>
        </div>

        {/* Rank progress bar */}
        {o.rank.nextTierLabel && (
          <div className="space-y-1">
            <div className="h-1.5 rounded-full bg-pearl-soft overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-champagne-dark to-gold/60 transition-all"
                style={{ width: `${Math.round(o.rank.progress * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-ink-muted">
              <span>{o.rank.label}</span>
              <span>{Math.round(o.rank.progress * 100)}% → {o.rank.nextTierLabel}</span>
            </div>
          </div>
        )}

        {o.bottles.length > 0 && (
          <div className="flex items-center gap-2 text-label-sm text-ink-secondary overflow-hidden">
            <Wine size={12} className="text-roseGold-dark shrink-0" />
            <span className="truncate">
              {o.bottles.map((b) => b.brand).join(" · ")}
            </span>
          </div>
        )}
      </Card>
    </Link>
  );
}
