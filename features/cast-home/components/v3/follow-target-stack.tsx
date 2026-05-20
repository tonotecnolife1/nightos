"use client";

import Link from "next/link";
import { Cake, Clock, Crown, Flame } from "lucide-react";
import type { FollowTarget } from "@/types/nightos";
import { EmptyState } from "@/components/nightos/empty-state";

type BadgeKind = "vip" | "birthday" | "interval" | "hot";

function badgesFor(t: FollowTarget): BadgeKind[] {
  const out: BadgeKind[] = [];
  if (t.customer.category === "vip") out.push("vip");
  if (t.reason === "birthday") out.push("birthday");
  if (t.reason === "interval") out.push("interval");
  if (t.reason === "nomination_chance") out.push("hot");
  return out;
}

function Badge({ kind }: { kind: BadgeKind }) {
  const map = {
    vip: {
      icon: Crown,
      text: "VIP",
      style: {
        background: "transparent",
        color: "#8a6e3d",
        border: "1px solid #b89455",
      } as const,
    },
    birthday: {
      icon: Cake,
      text: "誕生日",
      style: {
        background: "#f5dcd8",
        color: "#5e3838",
        border: "1px solid rgba(154,93,93,0.25)",
      } as const,
    },
    interval: {
      icon: Clock,
      text: "間隔空き",
      style: {
        background: "#f5efe6",
        color: "#6b5a58",
        border: "1px solid rgba(43, 35, 42, 0.14)",
      } as const,
    },
    hot: {
      icon: Flame,
      text: "指名化",
      style: {
        background: "rgba(184,148,85,0.16)",
        color: "#8a6e3d",
        border: "1px solid rgba(184,148,85,0.3)",
      } as const,
    },
  };
  const m = map[kind];
  const Icon = m.icon;
  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap"
      style={{
        padding: "3px 9px 3px 7px",
        borderRadius: 999,
        fontSize: 10,
        lineHeight: 1.2,
        fontWeight: 500,
        letterSpacing: "0.04em",
        ...m.style,
      }}
    >
      <Icon size={11} strokeWidth={1.7} />
      {m.text}
    </span>
  );
}

function initialFor(name: string): string {
  // First non-space char — natural Japanese family-name initial.
  const stripped = name.replace(/\s/g, "");
  return stripped.charAt(0) || "?";
}

function FollowTargetTile({
  target,
  rank,
}: {
  target: FollowTarget;
  rank: number;
}) {
  const badges = badgesFor(target);
  const isTop = rank <= 2;
  const opacities = [1, 0.95, 0.9, 0.85, 0.82];
  const opacity = opacities[Math.min(rank - 1, opacities.length - 1)];

  const tileBg = `rgba(253, 248, 240, ${0.55 * opacity + 0.2})`;

  return (
    <div
      className="relative overflow-hidden border border-ink/[0.08] flex items-center"
      style={{
        padding: "13px 14px 13px 20px",
        borderRadius: 22,
        background: tileBg,
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        boxShadow: isTop
          ? "0 8px 24px rgba(201, 141, 128, 0.10), 0 24px 48px rgba(184, 148, 85, 0.08)"
          : "0 2px 4px rgba(168, 117, 96, 0.10), 0 6px 14px rgba(168, 117, 96, 0.12)",
        gap: 12,
      }}
    >
      {/* Priority ribbon (left) */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0"
        style={{
          width: 4,
          background: isTop
            ? "linear-gradient(135deg, #f0c5af 0%, #d4a486 50%, #a87560 100%)"
            : "linear-gradient(180deg, #f3d8c8, #f3e6c8)",
        }}
      />

      {/* Avatar (initial) */}
      <div
        className="rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-champagne-metallic font-display text-ink"
        style={{
          width: 40,
          height: 40,
          fontSize: 16,
          lineHeight: 1,
          fontWeight: 500,
          letterSpacing: "0.02em",
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow: "inset 0 0 0 1px rgba(168,117,96,0.18)",
        }}
      >
        {initialFor(target.customer.name)}
      </div>

      {/* Name + badges + meta */}
      <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 4 }}>
        <div className="flex items-center flex-wrap" style={{ gap: 6 }}>
          <span
            className="font-display text-ink"
            style={{
              fontSize: 15.5,
              lineHeight: 1.2,
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
          >
            {target.customer.name}
          </span>
          {badges.map((b) => (
            <Badge key={b} kind={b} />
          ))}
        </div>
        <div
          className="text-[11px] leading-[1.35] text-ink-secondary"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {target.reasonDetail}
        </div>
      </div>

      {/* CTA — outline pill */}
      <Link
        href={`/cast/chat/${target.customer.id}`}
        className="inline-flex items-center justify-center flex-shrink-0 text-rose-gold-deep"
        style={{
          height: 34,
          padding: "0 13px",
          borderRadius: 999,
          background: "transparent",
          border: "1px solid #8a5e4d",
          fontWeight: 600,
          fontSize: 12,
          lineHeight: 1,
          letterSpacing: "0.04em",
        }}
      >
        連絡
      </Link>
    </div>
  );
}

export function FollowTargetStack({ targets }: { targets: FollowTarget[] }) {
  if (targets.length === 0) {
    return (
      <EmptyState
        icon={<Clock size={22} />}
        title="今日は一息つける日"
        description="急ぎで連絡するお客様はいません。明日の準備やセルフケアに使ってください。"
        tone="amethyst"
      />
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {targets.map((t, i) => (
        <FollowTargetTile key={t.customer.id} target={t} rank={i + 1} />
      ))}
    </div>
  );
}

export function FollowSectionHead({
  title,
  count,
  sub,
}: {
  title: string;
  count?: string;
  sub?: string;
}) {
  return (
    <div
      className="flex items-baseline justify-between relative"
      style={{ padding: "2px 2px 2px 14px" }}
    >
      <span
        aria-hidden
        className="absolute bg-gradient-rose-gold-metallic"
        style={{
          left: 0,
          top: 4,
          bottom: 4,
          width: 3,
          borderRadius: 2,
        }}
      />
      <div className="flex items-baseline" style={{ gap: 10 }}>
        <h2
          className="font-display text-ink m-0"
          style={{
            fontSize: 19,
            lineHeight: 1.3,
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </h2>
        {count != null && (
          <span
            className="font-display text-rose-gold-deep"
            style={{
              fontSize: 18,
              lineHeight: 1,
              fontWeight: 400,
              letterSpacing: "0.04em",
            }}
          >
            {count}
          </span>
        )}
      </div>
      {sub && (
        <span
          className="text-ink-muted uppercase tracking-luxe"
          style={{ fontSize: 10, lineHeight: 1, fontWeight: 500 }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

