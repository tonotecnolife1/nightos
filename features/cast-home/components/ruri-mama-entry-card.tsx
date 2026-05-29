import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

// v6: Pearl Glass · Wordmark entry. radial halo + rose-gold metallic headline.
export function RuriMamaEntryCard() {
  return (
    <Link
      href="/cast/ruri-mama"
      className="block hover:-translate-y-px transition will-change-transform"
    >
      <div
        className="relative overflow-hidden rounded-hero border border-ink/[0.08] shadow-warm p-5 flex flex-col gap-4"
        style={{
          background:
            "radial-gradient(ellipse at top left, var(--rose-gold-soft) 0%, transparent 55%)," +
            "radial-gradient(ellipse at bottom right, var(--champagne-soft) 0%, transparent 60%)," +
            "linear-gradient(180deg, var(--pearl-light) 0%, var(--pearl) 100%)",
        }}
      >
        <div className="relative flex items-center gap-3.5">
          <div
            className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border border-gold/35"
            style={{
              boxShadow:
                "0 6px 18px rgba(168,117,96,0.18), inset 0 0 0 1px rgba(255,255,255,0.6)",
            }}
          >
            <Image
              src="/cast/sakura-mama.jpg"
              alt="さくらママ"
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 text-label-xs tracking-luxe text-roseGold-deep mb-1.5">
              <Sparkles size={11} strokeWidth={1.8} />
              <span>AIアシスタント</span>
            </div>
            <div className="font-display text-[1.5rem] leading-[1.15] font-medium tracking-[0.02em] t-metallic">
              さくらママに相談する
            </div>
          </div>
          <span className="font-display text-[2rem] leading-none font-light text-roseGold-deep">
            ›
          </span>
        </div>
        <p className="m-0 font-serif text-[0.9rem] leading-[1.75] font-medium tracking-[0.01em] text-ink">
          LINE文面・接客・ボトル提案、何でも聞いてね。
        </p>
      </div>
    </Link>
  );
}
