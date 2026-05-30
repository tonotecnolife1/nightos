import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

// V5 Bordeaux Salon — dark bordeaux surface (Hero と地続き)。
// 写真は champagne-gold metallic フレームに包む。
export function RuriMamaEntryCard() {
  return (
    <Link
      href="/cast/ruri-mama"
      className="block hover:-translate-y-px transition will-change-transform"
    >
      <div
        className="v5-sakura-surface rounded-hero p-5 flex flex-col gap-4"
      >
        <div className="relative flex items-center gap-3.5">
          {/* Champagne-gold metallic frame around photo */}
          <div
            className="w-14 h-14 rounded-full flex-shrink-0 p-[2px]"
            style={{
              background: "var(--v5-champ-gold)",
              boxShadow: "0 6px 18px rgba(140,111,68,0.30)",
            }}
          >
            <div
              className="w-full h-full rounded-full overflow-hidden"
              style={{ border: "1px solid #3A1F1F" }}
            >
              <Image
                src="/cast/sakura-mama.jpg"
                alt="さくらママ"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="inline-flex items-center gap-1.5 mb-1.5 font-sans font-medium"
              style={{
                fontSize: 11,
                lineHeight: 1,
                letterSpacing: "0.32em",
                color: "var(--v5-gold-mid)",
              }}
            >
              <Sparkles size={11} strokeWidth={1.8} />
              <span>AIアシスタント</span>
            </div>
            <div
              className="font-serif font-normal v5-metallic"
              style={{
                fontSize: 26,
                lineHeight: 1.15,
                letterSpacing: "0.05em",
              }}
            >
              さくらママに相談する
            </div>
          </div>
          <span
            className="font-display font-light"
            style={{
              fontSize: 32,
              lineHeight: 1,
              color: "var(--v5-gold-on-dark)",
            }}
          >
            ›
          </span>
        </div>
        <p
          className="m-0 font-serif font-medium"
          style={{
            fontSize: 14.5,
            lineHeight: 1.75,
            letterSpacing: "0.02em",
            color: "var(--v5-ink-on-dark)",
          }}
        >
          LINE文面・接客・ボトル提案、何でも聞いてね。
        </p>
      </div>
    </Link>
  );
}
