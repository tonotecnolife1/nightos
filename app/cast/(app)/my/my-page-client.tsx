"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ArrowLeft, BarChart3, Building2, ChevronRight, Crown, Settings, UserCircle, Users } from "lucide-react";
import { mockLogout } from "@/app/auth/actions";
import { InstallAppSection } from "@/components/nightos/install-app-section";
import type { CastUserRole } from "@/types/nightos";

const ROLE_LABEL: Record<CastUserRole, string> = {
  cast: "キャスト",
  store_staff: "店舗スタッフ",
  store_owner: "店舗オーナー",
};

interface Props {
  castName: string;
  storeName: string | null;
  userRole: CastUserRole;
}

export function MyPageClient({ castName, storeName, userRole }: Props) {
  const [pending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      void mockLogout();
    });
  };

  return (
    <main className="min-h-dvh bg-pearl flex flex-col">
      {/* Hero — v6 pearl glass with rose-gold halo */}
      <div
        className="relative px-6 pt-12 pb-8 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at top left, var(--rose-gold-soft) 0%, transparent 55%)," +
            "radial-gradient(ellipse at bottom right, var(--champagne-soft) 0%, transparent 60%)," +
            "linear-gradient(180deg, var(--pearl-light) 0%, var(--pearl) 100%)",
        }}
      >
        <div className="max-w-sm mx-auto">
          <Link
            href="/cast/home"
            className="inline-flex items-center gap-1 text-[12px] text-ink-mute hover:text-ink-soft mb-4"
          >
            <ArrowLeft size={14} /> ホームに戻る
          </Link>

          <div className="text-label-xs tracking-luxe text-roseGold-deep mb-2">
            NIGHTOS · MY PAGE
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full glass flex items-center justify-center shrink-0 shadow-soft">
              <UserCircle size={32} className="text-ink-soft" />
            </div>
            <div>
              <p className="font-serif text-[26px] leading-tight font-medium tracking-[0.02em] t-metallic">
                {castName}
              </p>
              <p className="text-[12px] text-ink-mute mt-1">
                {ROLE_LABEL[userRole]}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pt-6 pb-12">
        <div className="max-w-sm mx-auto space-y-4">
          {/* 所属店舗 */}
          {storeName && (
            <section className="rounded-card border border-ink/[0.06] bg-pearl-warm p-4 shadow-soft">
              <div className="flex items-center gap-2.5">
                <Building2 size={16} className="text-ink-mute shrink-0" />
                <div>
                  <p className="text-[11px] text-ink-mute">所属店舗</p>
                  <p className="text-body-md font-medium text-ink">{storeName}</p>
                </div>
              </div>
            </section>
          )}

          {/* ホーム画面に追加（インストール済みなら非表示） */}
          <InstallAppSection />

          {/* 設定リンク */}
          <Link
            href="/settings"
            className="flex items-center justify-between w-full rounded-card border border-ink/[0.06] bg-pearl-warm p-4 shadow-soft hover:border-ink/15 transition"
          >
            <div className="flex items-center gap-2.5">
              <Settings size={16} className="text-ink-mute shrink-0" />
              <span className="text-body-md text-ink">設定</span>
            </div>
            <span className="text-ink-mute text-[12px]">›</span>
          </Link>

          {/* メンバー管理 */}
          <section className="space-y-2">
            <p className="text-[11px] text-ink-mute px-1">メンバー管理</p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/mama/team"
                className="flex items-center gap-2.5 rounded-card border border-ink/[0.06] bg-pearl-warm p-3.5 shadow-soft hover:-translate-y-px hover:border-gold/40 transition will-change-transform"
              >
                <span className="w-7 h-7 rounded-full border border-gold/40 bg-pearl-warm flex items-center justify-center shrink-0">
                  <Crown size={13} className="text-gold-deep" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm font-medium text-ink">メンバー</span>
                    <ChevronRight size={11} className="text-ink-mute" />
                  </div>
                  <span className="text-[10px] text-ink-mute">育成・目標設定</span>
                </div>
              </Link>
              <Link
                href="/cast/customers"
                className="flex items-center gap-2.5 rounded-card border border-ink/[0.06] bg-pearl-warm p-3.5 shadow-soft hover:-translate-y-px hover:border-gold/40 transition will-change-transform"
              >
                <span className="w-7 h-7 rounded-full border border-gold/40 bg-pearl-warm flex items-center justify-center shrink-0">
                  <Users size={13} className="text-gold-deep" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm font-medium text-ink">全顧客</span>
                    <ChevronRight size={11} className="text-ink-mute" />
                  </div>
                  <span className="text-[10px] text-ink-mute">一覧・相関図・ファネル</span>
                </div>
              </Link>
            </div>
          </section>

          {/* 成績 */}
          <Link
            href="/cast/stats"
            className="flex items-center gap-3 rounded-card border border-ink/[0.06] bg-pearl-warm px-4 py-3 shadow-soft hover:border-gold/40 transition"
          >
            <BarChart3 size={15} className="text-ink-soft shrink-0" />
            <span className="flex-1 text-body-sm text-ink">成績・統計</span>
            <ChevronRight size={13} className="text-ink-mute" />
          </Link>

          {/* ログアウト */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={pending}
            className="w-full px-6 py-3 rounded-pill border border-ink/15 bg-pearl-warm text-body-md text-ink hover:border-ink/30 transition shadow-soft disabled:opacity-50"
          >
            ログアウト
          </button>
        </div>
      </div>
    </main>
  );
}
