import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BaseProps extends HTMLAttributes<HTMLDivElement> {}

/** v6 neutral surface — pearl-light glass + warm shadow. */
export function Card({ className, ...rest }: BaseProps) {
  return (
    <div
      className={cn(
        "rounded-card bg-pearl-light/85 backdrop-blur-md border border-ink/[0.08] shadow-soft",
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
        <span className="text-label-sm px-2.5 py-1 rounded-badge bg-beige-dark/60 text-ink-soft">
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
        <span className="text-label-sm px-2.5 py-1 rounded-badge bg-roseGold-soft text-roseGold-deep">
          編集OK
        </span>
      </header>
      <div className="text-body-md text-ink">{children}</div>
    </section>
  );
}

/**
 * v6 premium card — pearl glass with rose-gold + champagne radial halos.
 * Used for hero CTAs (Ruri/Sakura Mama entry, member status banners).
 */
export function GemCard({ className, ...rest }: BaseProps) {
  return (
    <div
      className={cn(
        "rounded-hero text-ink shadow-warm relative overflow-hidden border border-ink/[0.08]",
        className,
      )}
      style={{
        background:
          "radial-gradient(ellipse at top left, var(--rose-gold-soft) 0%, transparent 55%)," +
          "radial-gradient(ellipse at bottom right, var(--champagne-soft) 0%, transparent 60%)," +
          "linear-gradient(180deg, var(--pearl-light) 0%, var(--pearl) 100%)",
      }}
      {...rest}
    />
  );
}
