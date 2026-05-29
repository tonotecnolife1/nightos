"use client";

import { Loader2, Sparkles, Wine } from "lucide-react";
import { useState } from "react";
import { useCastId } from "@/lib/nightos/cast-context";
import { cn } from "@/lib/utils";

interface BottleRecommendation {
  brand: string;
  reason: string;
  tier: "premium" | "standard" | "entry";
}

interface ApiResponse {
  isStub: boolean;
  recommendations: BottleRecommendation[];
}

interface Props {
  customerId: string;
}

export function BottleSuggestion({ customerId }: Props) {
  const castId = useCastId();
  const [phase, setPhase] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [recommendations, setRecommendations] = useState<BottleRecommendation[]>(
    [],
  );
  const [isStub, setIsStub] = useState(false);

  const handleClick = async () => {
    setPhase("loading");
    try {
      const res = await fetch("/api/suggest-bottle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          castId: castId,
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = (await res.json()) as ApiResponse;
      setRecommendations(data.recommendations);
      setIsStub(data.isStub);
      setPhase("ready");
    } catch (err) {
      console.error(err);
      setPhase("error");
    }
  };

  if (phase === "idle") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 h-9 rounded-btn bg-champagne-soft/60 border border-gold/30 text-gold-deep text-label-sm font-medium active:scale-95 hover:bg-roseGold-deep hover:text-pearl-light transition-colors"
      >
        <Sparkles size={12} />
        さくらママに次のボトル候補を聞く
      </button>
    );
  }

  if (phase === "loading") {
    return (
      <div className="mt-2 flex items-center justify-center gap-2 h-9 text-gold-deep text-label-sm">
        <Loader2 size={12} className="animate-spin" />
        さくらママが選んでます…
      </div>
    );
  }

  if (phase === "error") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="w-full mt-2 h-9 rounded-btn bg-pearl-warm border border-wine/40 text-wine-deep text-label-sm"
      >
        失敗しました。もう一度試す
      </button>
    );
  }

  // ready
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <Sparkles size={12} className="text-gold-deep" />
        <span className="text-label-sm text-gold-deep font-medium">
          さくらママのおすすめ {isStub && "(デモ)"}
        </span>
      </div>
      <div className="space-y-1.5">
        {recommendations.map((rec, i) => (
          <RecommendationCard key={i} rec={rec} />
        ))}
      </div>
      <button
        type="button"
        onClick={handleClick}
        className="text-label-sm text-gold-deep underline underline-offset-2"
      >
        別の候補で作り直す
      </button>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: BottleRecommendation }) {
  const tierStyles: Record<BottleRecommendation["tier"], string> = {
    premium: "bg-rose-gold-metallic text-pearl border-roseGold",
    standard: "bg-champagne text-ink border-champagne-dark",
    entry: "bg-pearl-warm text-ink border-pearl-soft",
  };
  const tierLabels: Record<BottleRecommendation["tier"], string> = {
    premium: "プレミアム",
    standard: "スタンダード",
    entry: "エントリー",
  };
  return (
    <div className="rounded-btn border border-pearl-soft bg-pearl-warm p-2.5">
      <div className="flex items-center gap-2 mb-1">
        <Wine size={12} className="text-roseGold-dark shrink-0" />
        <span className="text-body-sm font-semibold text-ink flex-1">
          {rec.brand}
        </span>
        <span
          className={cn(
            "px-1.5 py-0.5 rounded-badge text-[10px] font-medium border",
            tierStyles[rec.tier],
          )}
        >
          {tierLabels[rec.tier]}
        </span>
      </div>
      <p className="text-label-sm text-ink-soft leading-relaxed pl-4">
        {rec.reason}
      </p>
    </div>
  );
}
