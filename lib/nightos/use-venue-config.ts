"use client";

import { useEffect, useState } from "react";
import { getVenueType } from "./role-store";
import { getVenueConfig, type VenueConfig } from "./venue-config";

/**
 * クライアントコンポーネントから業態別の設定 (ラベル / フィーチャーフラグ) を読む。
 *
 * SSR と初回クライアントレンダリングでは getVenueType() が "club" を返すため
 * club 設定で描画し、マウント後に localStorage の実値で更新する
 * (hydration mismatch を避けるための定番パターン。chat-limit-banner と同様)。
 *
 * これにより「担当 / 指名」のような業態用語を各コンポーネントで個別に
 * 分岐させず、venue-config の正典に一本化できる。
 */
export function useVenueConfig(): VenueConfig {
  const [config, setConfig] = useState<VenueConfig>(() => getVenueConfig("club"));

  useEffect(() => {
    setConfig(getVenueConfig(getVenueType()));
  }, []);

  return config;
}
