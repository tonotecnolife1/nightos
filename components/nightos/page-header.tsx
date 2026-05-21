"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SakuraMamaAvatar } from "./sakura-mama-avatar";

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
  className?: string;
  tone?: "default" | "sakura";
}

export function PageHeader({
  title,
  subtitle,
  showBack,
  right,
  className,
  tone = "default",
}: Props) {
  const router = useRouter();
  const isSakura = tone === "sakura";
  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-5 py-4 backdrop-blur-md",
        isSakura
          ? "bg-gradient-blush text-ink shadow-soft"
          : "bg-pearl-warm/85 border-b border-ink/[0.06]",
        className,
      )}
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
        {isSakura && <SakuraMamaAvatar size={44} withGlow />}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-[20px] leading-tight font-medium tracking-wide text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="text-body-sm text-ink-secondary">
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
    </header>
  );
}
