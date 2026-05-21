import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BaseProps extends HTMLAttributes<HTMLDivElement> {}

/** Neutral light card — the NIGHTOS default surface. v2 design.md §4.1 */
export function Card({ className, ...rest }: BaseProps) {
  return (
    <div
      className={cn(
        "rounded-card bg-pearl-warm border border-ink/[0.06] shadow-soft",
        className,
      )}
      {...rest}
    />
  );
}

/**
 * Store-registered info card.
 * Beige background + explicit "閲覧のみ" badge — signals the cast cannot edit.
 */
export function StoreInfoCard({
  children,
  title,
  className,
}: {
  children: ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-card bg-beige border border-beige-border px-5 py-4 shadow-soft",
        className,
      )}
    >
      <header className="flex items-center justify-between mb-3">
        <h3 className="text-label-md text-ink font-semibold">{title}</h3>
        <span className="text-label-sm px-2.5 py-1 rounded-badge bg-beige-dark/60 text-ink-secondary">
          閲覧のみ
        </span>
      </header>
      <div className="text-body-md text-ink">{children}</div>
    </section>
  );
}

/**
 * Personal-memo card.
 * Pink dashed border + "編集OK" badge — signals the cast can freely edit.
 */
export function MemoCard({
  children,
  title,
  className,
}: {
  children: ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <section className={cn("memo-dashed px-5 py-4", className)}>
      <header className="flex items-center justify-between mb-3">
        <h3 className="text-label-md text-ink font-semibold">{title}</h3>
        <span className="text-label-sm px-2.5 py-1 rounded-badge bg-blush-soft text-blush-deep">
          編集OK
        </span>
      </header>
      <div className="text-body-md text-ink">{children}</div>
    </section>
  );
}

/**
 * Premium card — used for hero CTAs (Sakura-Mama entry, member status banners).
 * v2: blush gradient instead of v1 amethyst, warm shadow instead of glow.
 */
export function GemCard({ className, ...rest }: BaseProps) {
  return (
    <div
      className={cn(
        "rounded-card bg-gradient-to-br from-blush-soft via-blush to-blush-deep text-ink shadow-warm relative overflow-hidden",
        className,
      )}
      {...rest}
    />
  );
}
