"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/nightos/page-header";
import {
  AVATAR_VARIANTS,
  RuriMamaAvatar,
  getStoredVariant,
  setStoredVariant,
  type AvatarVariant,
} from "@/components/nightos/ruri-mama-avatar";
import { cn } from "@/lib/utils";

export default function AvatarPickerPage() {
  const [picked, setPicked] = useState<AvatarVariant>("a");
  const [savedVariant, setSavedVariant] = useState<AvatarVariant>("a");

  useEffect(() => {
    const current = getStoredVariant();
    setPicked(current);
    setSavedVariant(current);
  }, []);

  const handleSelect = (variant: AvatarVariant) => {
    setPicked(variant);
    setStoredVariant(variant);
    setSavedVariant(variant);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="さくらママのイラスト"
        subtitle="お気に入りを選んでください"
        showBack
      />
      <div className="px-5 pt-4 pb-8 space-y-3">
        <p className="text-body-sm text-ink-soft leading-relaxed">
          アバターはさくらママのチャット画面・テンプレート画面・顧客カルテで
          使われます。タップした瞬間に反映されて、この端末に保存されます。
        </p>

        <div className="space-y-3">
          {AVATAR_VARIANTS.map((variant) => {
            const isSelected = savedVariant === variant.id;
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => handleSelect(variant.id)}
                className={cn(
                  "w-full text-left rounded-hero border p-4 transition-all active:scale-[0.99]",
                  isSelected
                    ? "border-wine-deep bg-champagne-soft/40 shadow-warm"
                    : "border-ink/[0.08] bg-pearl-light hover:border-gold/30 shadow-soft",
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Large preview */}
                  <RuriMamaAvatar
                    variant={variant.id}
                    size={88}
                    withGlow={isSelected}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-display-sm text-ink">
                        {variant.label}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-badge bg-wine-deep text-pearl-light text-label-sm font-medium">
                          <Check size={10} />
                          選択中
                        </span>
                      )}
                    </div>
                    <p className="text-body-sm text-ink-soft leading-relaxed">
                      {variant.description}
                    </p>
                  </div>
                </div>

                {/* Mini preview row showing all sizes that the avatar appears in */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-gold/30 flex items-center justify-around">
                    <div className="flex flex-col items-center gap-1">
                      <RuriMamaAvatar variant={variant.id} size={32} />
                      <span className="text-[10px] text-ink-mute">
                        メッセージ
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <RuriMamaAvatar variant={variant.id} size={44} />
                      <span className="text-[10px] text-ink-mute">
                        ヘッダー
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <RuriMamaAvatar variant={variant.id} size={36} />
                      <span className="text-[10px] text-ink-mute">
                        テンプレ
                      </span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-card bg-pearl-warm border border-pearl-soft p-4 text-body-sm text-ink-soft leading-relaxed">
          <p className="font-semibold text-ink mb-1">実写を使いたい場合</p>
          <p>
            お好きな写真を <code className="font-mono text-xs">public/</code> に置いて、
            <code className="font-mono text-xs">components/nightos/ruri-mama-avatar.tsx</code> 内の
            <code className="font-mono text-xs"> AVATAR_VARIANTS</code> の <code className="font-mono text-xs">src</code> を差し替えれば反映されます。
            正方形・256×256以上推奨。
          </p>
        </div>
      </div>
    </div>
  );
}
