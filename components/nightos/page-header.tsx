"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RuriMamaAvatar } from "./ruri-mama-avatar";

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
  className?: string;
  tone?: "default" | "ruri";
}

// v6: sticky header — glass-pearl + serif title。tone="ruri" は rose-gold halo。
export function PageHeader({
  title,
  subtitle,
  showBack,
  right,
  className,
  tone = "default",
}: Props) {
  const router = useRouter();
  const isRuri = tone === "ruri";
  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-5 py-4 backdrop-blur-md border-b",
        isRuri
          ? "border-roseGold/20"
          : "bg-pearl-light/80 border-ink/[0.08]",
        className,
      )}
      style={
        isRuri
          ? {
              background:
                "radial-gradient(ellipse at top left, var(--rose-gold-soft) 0%, transparent 55%)," +
                "radial-gradient(ellipse at bottom right, var(--champagne-soft) 0%, transparent 60%)," +
                "linear-gradient(180deg, var(--pearl-light) 0%, var(--pearl) 100%)",
            }
          : undefined
      }
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="戻る"
            className="p-1.5 -ml-1.5 rounded-full transition-colors text-ink hover:bg-pearl-soft"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        {isRuri && <RuriMamaAvatar size={44} withGlow />}
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-[20px] leading-tight font-medium tracking-[0.02em] text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="text-body-sm text-ink-soft">
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
    </header>
  );
}
