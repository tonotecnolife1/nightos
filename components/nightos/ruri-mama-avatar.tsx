"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type AvatarVariant = "a" | "b" | "c" | "d" | "photo";

export const AVATAR_VARIANTS: {
  id: AvatarVariant;
  label: string;
  description: string;
  src: string;
}[] = [
  {
    id: "photo",
    label: "さくらママ（実写風）",
    description: "白い着物の銀座のママ・油絵調の温かい雰囲気",
    src: "/ruri-mama-photo.jpg",
  },
  {
    id: "a",
    label: "親しみ系（イラスト）",
    description: "やわらかい雰囲気・笑顔・ピンク基調",
    src: "/ruri-mama.svg",
  },
  {
    id: "b",
    label: "大人っぽい系（イラスト）",
    description: "落ち着いた表情・しっかりメイク・パープル基調",
    src: "/ruri-mama-b.svg",
  },
  {
    id: "c",
    label: "横顔シルエット",
    description: "顔を見せず雰囲気だけ・ミステリアス",
    src: "/ruri-mama-c.svg",
  },
  {
    id: "d",
    label: "椿のロゴ風",
    description: "顔なし・椿の花とブランドモノグラム",
    src: "/ruri-mama-d.svg",
  },
];

const STORAGE_KEY = "nightos.avatar-variant";
// 実写風の着物ママをデフォルトに。銀座30年のママという設定に最もマッチ。
const DEFAULT_VARIANT: AvatarVariant = "photo";

export function getStoredVariant(): AvatarVariant {
  if (typeof window === "undefined") return DEFAULT_VARIANT;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (
    v === "a" ||
    v === "b" ||
    v === "c" ||
    v === "d" ||
    v === "photo"
  )
    return v;
  return DEFAULT_VARIANT;
}

export function setStoredVariant(variant: AvatarVariant) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, variant);
  // Notify other components in the same tab so they can re-render
  window.dispatchEvent(new CustomEvent("ruri-avatar-changed"));
}

interface Props {
  size?: number;
  className?: string;
  /** Adds a soft amethyst glow ring (used in the page header). */
  withGlow?: boolean;
  /** Override the variant — defaults to whatever's in localStorage. */
  variant?: AvatarVariant;
}

/**
 * Ruri-Mama avatar.
 *
 * Reads the chosen variant from localStorage so the cast can pick a
 * style on the picker page (`/cast/avatars`) and have it persist
 * everywhere — header, message bubbles, template generator card, etc.
 *
 * To replace with your own photo: drop the image into `public/` and
 * update the `src` field in AVATAR_VARIANTS above.
 */
export function RuriMamaAvatar({
  size = 40,
  className,
  withGlow = false,
  variant,
}: Props) {
  // SSR returns the default; on the client, we read localStorage in an
  // effect so the cast's choice is respected without a hydration warning.
  const [resolved, setResolved] = useState<AvatarVariant>(
    variant ?? DEFAULT_VARIANT,
  );

  useEffect(() => {
    if (variant) {
      setResolved(variant);
      return;
    }
    setResolved(getStoredVariant());
    const onChange = () => setResolved(getStoredVariant());
    window.addEventListener("ruri-avatar-changed", onChange);
    return () => window.removeEventListener("ruri-avatar-changed", onChange);
  }, [variant]);

  const config =
    AVATAR_VARIANTS.find((v) => v.id === resolved) ?? AVATAR_VARIANTS[0];

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden shrink-0 bg-pearl-soft border border-gold/35",
        withGlow && "shadow-warm ring-2 ring-pearl-light/60",
        className,
      )}
      style={
        withGlow
          ? {
              width: size,
              height: size,
              boxShadow:
                "0 6px 18px rgba(168,117,96,0.18), inset 0 0 0 1px rgba(255,255,255,0.6)",
            }
          : { width: size, height: size }
      }
    >
      <Image
        src={config.src}
        alt="さくらママ"
        width={size}
        height={size}
        className="object-cover"
        priority={withGlow}
        unoptimized={config.src.endsWith(".jpg") || config.src.endsWith(".png")}
      />
    </div>
  );
}
