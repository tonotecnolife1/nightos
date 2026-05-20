import Link from "next/link";
import { Sparkles } from "lucide-react";

interface Props {
  /** Hint preview line. Falls back to a calm default. */
  hint?: string;
}

export function SakuraMamaEntry({ hint }: Props) {
  return (
    <Link
      href="/cast/ruri-mama"
      className="block w-full text-left relative overflow-hidden bg-hero-pearl border border-ink/[0.08] shadow-warm"
      style={{
        padding: 22,
        borderRadius: 28,
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3.5">
          {/* Avatar — champagne metallic ring, no asset required */}
          <div
            className="rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-champagne-metallic"
            style={{
              width: 56,
              height: 56,
              border: "1px solid rgba(184,148,85,0.35)",
              boxShadow:
                "0 6px 18px rgba(168,117,96,0.18), inset 0 0 0 1px rgba(255,255,255,0.6)",
            }}
          >
            <Sparkles size={22} strokeWidth={1.6} className="text-rose-gold-deep" />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="inline-flex items-center gap-1.5 mb-1.5 text-rose-gold-deep tracking-luxe text-[11px] leading-none"
              style={{ fontWeight: 500 }}
            >
              <Sparkles size={11} strokeWidth={1.8} />
              <span>AIアシスタント</span>
            </div>
            <div
              className="text-metallic font-display"
              style={{
                fontSize: 26,
                lineHeight: 1.15,
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}
            >
              さくらママ
            </div>
          </div>
          <span
            className="font-display text-rose-gold-deep"
            style={{ fontSize: 32, lineHeight: 1, fontWeight: 300 }}
            aria-hidden
          >
            ›
          </span>
        </div>
        <p
          className="font-display text-ink m-0"
          style={{
            fontSize: 14.5,
            lineHeight: 1.75,
            fontWeight: 500,
            letterSpacing: "0.01em",
          }}
        >
          {hint ?? "LINE文面・接客・ボトル提案、なんでも聞いてね。"}
        </p>
      </div>
    </Link>
  );
}
