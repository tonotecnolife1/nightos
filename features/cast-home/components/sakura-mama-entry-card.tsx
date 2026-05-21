import Link from "next/link";
import { Gem } from "lucide-react";
import { GemCard } from "@/components/nightos/card";

export function SakuraMamaEntryCard() {
  return (
    <Link
      href="/cast/sakura-mama"
      className="block hover:-translate-y-px transition will-change-transform"
    >
      <GemCard className="p-5">
        {/* subtle shine decoration */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(400px_160px_at_120%_-20%,rgba(255,255,255,0.4),transparent_60%)]"
        />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border border-gold/40 bg-pearl-warm/60 backdrop-blur-sm flex items-center justify-center">
            <Gem size={22} className="text-gold-deep" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-gold-deep mb-0.5">
              さくらママ AI
            </div>
            <div className="font-display text-[20px] leading-tight font-medium text-ink">
              さくらママに相談する
            </div>
            <div className="text-body-sm text-ink-secondary mt-0.5">
              LINE文面・接客・ボトル提案、何でも聞いてね
            </div>
          </div>
        </div>
      </GemCard>
    </Link>
  );
}
