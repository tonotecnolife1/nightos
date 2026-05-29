"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  ClipboardList,
  Crown,
  KeyRound,
  Ticket,
  User,
  Wine,
} from "lucide-react";
import {
  getRole,
  getVenueType,
  setRole,
  setVenueType,
  type NightosRole,
} from "@/lib/nightos/role-store";
import {
  setStorePermission,
  type StorePermission,
} from "@/lib/nightos/store-permission-store";
import type { VenueType } from "@/lib/nightos/constants";

export function RoleSelector() {
  const router = useRouter();
  const [venue, setVenue] = useState<VenueType>("club");
  const [step, setStep] = useState<"venue" | "role">("venue");

  useEffect(() => {
    const existing = getRole();
    if (existing === "cast") router.replace("/cast/home");
    else if (existing === "store") router.replace("/store");
    else if (existing === "customer") router.replace("/customer/home");
    setVenue(getVenueType());
  }, [router]);

  const pickVenue = (type: VenueType) => {
    setVenue(type);
    setVenueType(type);
    setStep("role");
  };

  const pickRole = (role: NightosRole) => {
    setRole(role);
    const dest =
      role === "cast"
        ? "/cast/home"
        : role === "store"
          ? "/store"
          : "/customer/home";
    router.push(dest);
  };

  const pickStorePermission = (permission: StorePermission) => {
    setRole("store");
    setStorePermission(permission);
    router.push("/store");
  };

  return (
    <main className="min-h-dvh bg-pearl flex flex-col">
      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden px-6 pt-14 pb-12"
        style={{
          background:
            "radial-gradient(ellipse at top left, var(--rose-gold-soft) 0%, transparent 55%)," +
            "radial-gradient(ellipse at bottom right, var(--champagne-soft) 0%, transparent 60%)," +
            "linear-gradient(180deg, var(--pearl-light) 0%, var(--pearl) 100%)",
        }}
      >
        <div className="max-w-sm mx-auto">
          <div className="text-label-xs tracking-luxe text-roseGold-deep mb-2">
            NIGHTOS · WELCOME
          </div>
          <h1 className="font-serif text-[2rem] leading-[1.15] font-medium tracking-[0.02em] t-metallic">
            {step === "venue" ? "業態を選ぶ" : "役割を選ぶ"}
          </h1>
          <p className="mt-2 text-body-sm text-ink-soft">
            {step === "venue"
              ? "あなたのお店の業態に合わせます"
              : `${venue === "club" ? "クラブ" : "キャバクラ"}でのあなたの立場`}
          </p>
        </div>
      </div>

      {/* ── 本体 ── */}
      <div className="flex-1 px-6 pt-8 pb-12">
        <div className="max-w-sm mx-auto">
          {step === "venue" ? (
            <div className="grid gap-3">
              <BigCard
                icon={<Crown size={20} className="text-gold-deep" />}
                title="クラブ"
                description="ママ・お姉さんの担当制。同伴と継続来店を重視する業態"
                onClick={() => pickVenue("club")}
                accent
              />
              <BigCard
                icon={<Wine size={20} className="text-gold-deep" />}
                title="キャバクラ"
                description="指名制・フリー客中心。指名化と来店頻度を重視する業態"
                onClick={() => pickVenue("cabaret")}
              />
            </div>
          ) : (
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => setStep("venue")}
                className="self-start text-[12px] text-ink-mute hover:text-ink-soft mb-1 px-1"
              >
                ← 業態選択に戻る
              </button>

              <BigCard
                icon={<User size={20} className="text-gold-deep" />}
                title="キャスト（あかり）"
                description={
                  venue === "club"
                    ? "接客・同伴・顧客・メンバー管理"
                    : "接客・顧客・さくらママ・成績"
                }
                onClick={() => pickRole("cast")}
                accent
              />

              <BigCard
                icon={
                  <ClipboardList size={20} className="text-gold-deep" />
                }
                title="店舗スタッフ（入力担当）"
                description="顧客・来店・ボトルの入力業務"
                onClick={() => pickStorePermission("staff")}
              />

              <BigCard
                icon={<KeyRound size={20} className="text-gold-deep" />}
                title="店舗オーナー"
                description="全機能 + ダッシュボード・ファネル・AI・クーポン"
                onClick={() => pickStorePermission("owner")}
              />

              <BigCard
                icon={<Ticket size={20} className="text-gold-deep" />}
                title="来店客（田中太郎）"
                description="ボトル管理・クーポン・会員ステータス"
                onClick={() => pickRole("customer")}
              />
            </div>
          )}

          <p className="mt-6 text-[11px] text-ink-mute text-center">
            検証版のため、選択に応じて画面が切り替わります
          </p>
        </div>
      </div>
    </main>
  );
}

interface BigCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  accent?: boolean;
}

function BigCard({
  icon,
  title,
  description,
  onClick,
  accent,
}: BigCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden w-full text-left px-5 py-4 rounded-card border transition will-change-transform hover:-translate-y-px ${
        accent
          ? "border-ink/[0.08] shadow-warm"
          : "border-ink/[0.08] bg-pearl-light/85 backdrop-blur-md shadow-soft hover:shadow-warm"
      }`}
      style={
        accent
          ? {
              background:
                "radial-gradient(ellipse at top left, var(--rose-gold-soft) 0%, transparent 55%)," +
                "radial-gradient(ellipse at bottom right, var(--champagne-soft) 0%, transparent 60%)," +
                "linear-gradient(180deg, var(--pearl-light) 0%, var(--pearl) 100%)",
            }
          : undefined
      }
    >
      {accent && (
        <span
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-1 bg-rose-gold-metallic"
        />
      )}
      <div className="flex items-center gap-4">
        <span
          className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center shrink-0"
          style={{
            background: "var(--champagne-metallic)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)",
          }}
        >
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-serif text-[18px] leading-tight font-medium tracking-[0.02em] text-ink">
            {title}
          </div>
          <p className="text-[11px] text-ink-soft mt-1 leading-relaxed">
            {description}
          </p>
        </div>
        <ChevronRight
          size={18}
          className="text-ink-mute shrink-0 group-hover:text-roseGold-deep transition-colors"
        />
      </div>
    </button>
  );
}
