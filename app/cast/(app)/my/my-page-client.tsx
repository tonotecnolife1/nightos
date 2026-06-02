"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  ArrowLeft,
  Building2,
  MessageSquareText,
  Settings,
  UserCircle,
} from "lucide-react";
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
  avatarUrl?: string | null;
}

export function MyPageClient({ castName, storeName, userRole, avatarUrl }: Props) {
  const [pending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      void mockLogout();
    });
  };

  return (
    <main className="min-h-dvh bg-pearl flex flex-col">
      {/* V5 Bordeaux Salon Hero — dark wine + champagne-gold metallic */}
      <div className="v5-hero px-6 pt-12 pb-10">
        <div className="max-w-sm mx-auto relative">
          <Link
            href="/cast/home"
            className="inline-flex items-center gap-1 text-[12px] mb-4 transition"
            style={{ color: "var(--v5-ink-on-dark-mute)" }}
          >
            <ArrowLeft size={14} /> ホームに戻る
          </Link>

          <div
            className="font-sans font-medium mb-3"
            style={{
              fontSize: 11,
              lineHeight: 1,
              letterSpacing: "0.32em",
              color: "var(--v5-gold-mid)",
            }}
          >
            NIGHTOS · マイページ
          </div>

          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 p-[2px]"
              style={{
                background: "var(--v5-champ-gold)",
                boxShadow: "0 6px 18px rgba(140,111,68,0.30)",
              }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  background: "#3A1F1F",
                  color: "var(--v5-gold-on-dark)",
                }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="アイコン画像"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle size={28} strokeWidth={1.4} />
                )}
              </div>
            </div>
            <div>
              <p
                className="font-serif font-normal v5-metallic"
                style={{
                  fontSize: 28,
                  lineHeight: 1.15,
                  letterSpacing: "0.05em",
                }}
              >
                {castName}
              </p>
              <p
                className="font-sans mt-1.5"
                style={{
                  fontSize: 12,
                  letterSpacing: "0.06em",
                  color: "var(--v5-ink-on-dark-mute)",
                }}
              >
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

          {/* マイテンプレート（メッセージテンプレート集）への導線 */}
          <Link
            href="/cast/templates"
            className="flex items-center justify-between w-full rounded-card border border-ink/[0.06] bg-pearl-warm p-4 shadow-soft hover:border-ink/15 transition"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <MessageSquareText size={16} className="text-ink-mute shrink-0" />
              <div className="min-w-0">
                <p className="text-body-md text-ink">マイテンプレート</p>
                <p className="text-[11px] text-ink-mute truncate">
                  お礼・お誘いの文面とさくらママ提案
                </p>
              </div>
            </div>
            <span className="text-ink-mute text-[12px]">›</span>
          </Link>

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
