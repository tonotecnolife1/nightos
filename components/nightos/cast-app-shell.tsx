"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { isTabBarVisible } from "./cast-nav";

/**
 * Cast アプリ共通のページコンテナ。
 *
 * - bottom tab bar (`CastTabBar`) が出る通常画面: 縦スクロールできる
 *   `min-h-dvh` コンテナ。tab bar の分だけ下余白 (`pb-28`) を確保する。
 * - tab bar を隠す全画面 (さくらママ等): ビューポート高ちょうど (`h-dvh`)
 *   の縦フレックス。`PlanBanner` と本文が高さを分け合うので、本文側 (page)
 *   を `flex-1` にすれば入力欄を画面下端にぴったり付けられる。tab bar が
 *   無いのに `pb-28` の空白が残る / 固定 `h-dvh` の二重計上で入力欄が
 *   見切れる、という両方の不具合をここで解消する。
 */
export function CastAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const fullscreen = !isTabBarVisible(pathname);

  return (
    <div
      className={cn(
        "mx-auto max-w-[520px]",
        fullscreen
          ? "flex h-dvh flex-col overflow-hidden"
          : "min-h-dvh pb-28",
      )}
    >
      {children}
    </div>
  );
}
