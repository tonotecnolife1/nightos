import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarPlus,
  ClipboardList,
  Clock,
  Filter,
  Users2,
  UserPlus,
  Users,
  Wine,
} from "lucide-react";
import { StatCard } from "@/components/nightos/stat-card";
import { StoreBriefing } from "@/features/store-hub/components/store-briefing";
import { SendCastMessage } from "@/features/store-hub/components/send-cast-message";
import { IssueCoupon } from "@/features/store-hub/components/issue-coupon";
import { CastRequestBanner } from "@/features/store-hub/components/cast-request-banner";
import { OwnerOnly } from "@/features/store-hub/components/owner-only";
import { ApprovalLink } from "@/features/store-hub/components/approval-link";
import { StorePermissionBadge } from "@/features/store-hub/components/store-permission-badge";
import { RoleSwitchLink } from "@/components/nightos/role-switch-link";
import { getAllCasts, getAllCustomers, getStoreDashboardData, getUnresolvedCastRequests } from "@/lib/nightos/supabase-queries";

export default async function StoreHubPage() {
  const [data, casts, customers, castRequests] = await Promise.all([
    getStoreDashboardData(),
    getAllCasts(),
    getAllCustomers(),
    getUnresolvedCastRequests(),
  ]);

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
          NIGHTOS · STORE HUB
        </div>
        <p className="text-body-sm text-ink-soft mb-1">店舗管理</p>
        <h1 className="font-serif text-[1.75rem] leading-[1.15] font-medium tracking-[0.02em] t-metallic">
          CLUB NIGHTOS 銀座本店
        </h1>
        <div className="mt-3">
          <StorePermissionBadge />
        </div>
      </header>

      <div className="px-5 pt-5 pb-8 space-y-5">
        {/* Registration shortcuts — 最頻使用アクションを最上部に */}
        <section className="space-y-2.5">
          <h2 className="text-body-sm text-ink-secondary px-1">登録</h2>
          <div className="grid grid-cols-3 gap-2">
            <ShortcutCard
              href="/store/customers/new"
              icon={<UserPlus size={20} className="text-gold-deep" />}
              label="顧客"
            />
            <ShortcutCard
              href="/store/visits/new"
              icon={<CalendarPlus size={20} className="text-gold-deep" />}
              label="来店"
            />
            <ShortcutCard
              href="/store/bottles/new"
              icon={<Wine size={20} className="text-gold-deep" />}
              label="ボトル"
            />
          </div>
        </section>

        {/* Quick stats — owner only */}
        <OwnerOnly>
          <div className="grid grid-cols-3 gap-2.5">
            <StatCard
              label="月間指名"
              value={data.totalNominations}
              unit="本"
              tone="rose"
            />
            <StatCard
              label="月間売上"
              value={`${Math.round(data.totalSales / 10_000)}`}
              unit="万円"
            />
            <StatCard
              label="連絡達成率"
              value={Math.round(data.averageFollowRate * 100)}
              unit="%"
              tone="amethyst"
            />
          </div>
        </OwnerOnly>

        {/* Cast requests — owner only (manages cast communication) */}
        <OwnerOnly>
          {castRequests.length > 0 && (
            <CastRequestBanner requests={castRequests} />
          )}
        </OwnerOnly>

        {/* Store AI Briefing — owner only */}
        <OwnerOnly>
          <StoreBriefing />
        </OwnerOnly>

        {/* No-casts guidance — owner only */}
        {casts.length === 0 && (
          <OwnerOnly>
            <div className="rounded-card border border-ink/[0.06] bg-pearl-warm p-4 flex items-start gap-3">
              <span className="w-10 h-10 rounded-full border border-gold/40 bg-champagne-soft flex items-center justify-center shrink-0">
                <Users2 size={18} className="text-gold-deep" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-body-md font-medium text-ink">キャストがまだ登録されていません</div>
                <div className="text-[11px] text-ink-muted mt-0.5">
                  メンバーを追加すると、売上管理・連絡フォロー・メッセージ送信などの機能が使えるようになります。
                </div>
              </div>
            </div>
          </OwnerOnly>
        )}

        {/* Send message to cast — owner only */}
        {casts.length > 0 && (
          <OwnerOnly>
            <SendCastMessage casts={casts.map((c) => ({ id: c.id, name: c.name }))} />
          </OwnerOnly>
        )}

        {/* Issue coupon — owner only */}
        <OwnerOnly>
          <IssueCoupon customers={customers.map((c) => ({ id: c.id, name: c.name }))} />
        </OwnerOnly>

        {/* Approval queue — owner only */}
        <OwnerOnly>
          <ApprovalLink />
        </OwnerOnly>

        {/* Data management (both staff and owner) */}
        <section className="space-y-2.5">
          <h2 className="text-body-sm text-ink-secondary px-1">
            データ確認・編集
          </h2>
          <div className="space-y-2">
            <ListLink
              href="/store/customers"
              icon={<Users size={18} />}
              label="顧客一覧"
              description="検索・編集・削除"
            />
            <ListLink
              href="/store/visits"
              icon={<ClipboardList size={18} />}
              label="来店履歴"
              description="直近の来店記録の確認・取消"
            />
            <ListLink
              href="/store/bottles"
              icon={<Wine size={18} />}
              label="ボトル管理"
              description="残量管理・消費記録"
            />
          </div>
        </section>

        {/* Owner-only management section */}
        <OwnerOnly>
          <section className="space-y-2.5">
            <h2 className="text-body-sm text-ink-secondary flex items-center gap-1.5 px-1">
              オーナー管理
              <StorePermissionBadge />
            </h2>
            <div className="space-y-2">
              <ListLink
                href="/store/dashboard"
                icon={<BarChart3 size={18} />}
                label="効果ダッシュボード"
                description="売上推移・キャスト成績・ROI"
              />
              <ListLink
                href="/store/funnel"
                icon={<Filter size={18} />}
                label="顧客ファネル"
                description="店舗登録 → 担当 → LINE交換"
              />
              <ListLink
                href="/store/douhan-pace"
                icon={<Clock size={18} />}
                label="同伴ペース"
                description="週2/月7 ノルマ達成状況"
              />
            </div>
          </section>
        </OwnerOnly>

        <RoleSwitchLink />
      </div>
    </div>
  );
}

function ShortcutCard({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-card border border-ink/[0.06] bg-pearl-warm p-3 flex flex-col items-center gap-2 hover:-translate-y-px hover:border-gold/40 transition shadow-soft will-change-transform"
    >
      <span className="w-11 h-11 rounded-full border border-gold/40 bg-gradient-to-br from-pearl-warm to-champagne-soft/60 flex items-center justify-center">
        {icon}
      </span>
      <span className="text-[11px] text-ink font-medium">{label}</span>
    </Link>
  );
}

function ListLink({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-card border border-ink/[0.06] bg-pearl-warm shadow-soft hover:-translate-y-px hover:border-gold/40 transition will-change-transform"
    >
      <div className="p-3.5">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full border border-gold/40 bg-pearl-warm flex items-center justify-center text-gold-deep shrink-0">
            {icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-body-md font-medium text-ink">{label}</div>
            <div className="text-[11px] text-ink-muted">{description}</div>
          </div>
          <ArrowRight size={14} className="text-ink-muted shrink-0" />
        </div>
      </div>
    </Link>
  );
}
