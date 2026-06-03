"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * 画面遷移の即時フィードバック用の上部進捗バー。
 *
 * リンクをタップした「その瞬間」に細いバーを表示し、遷移が確定
 * （pathname の変化）したら満タン → フェイドアウトで消す。
 * loading.tsx が出るまでのわずかな無反応時間を埋め、「ちゃんと押せたか」
 * の不安を解消する。document のクリックを捕捉するためアプリ全体に効き、
 * 個別リンクの改修は不要。
 *
 * 注: Next の <Link> は SPA 遷移のため click で preventDefault するので、
 *     defaultPrevented では判定しない（capture フェーズで素の click を拾う）。
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }, []);

  const finish = useCallback(() => {
    clearTimers();
    setProgress(100);
    timers.current.push(
      setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 300),
    );
  }, [clearTimers]);

  const start = useCallback(() => {
    clearTimers();
    setActive(true);
    setProgress(8);
    // 90% で頭打ちにしながらゆっくり進め「処理中」を演出する
    timers.current.push(setTimeout(() => setProgress(38), 120));
    timers.current.push(setTimeout(() => setProgress(65), 420));
    timers.current.push(setTimeout(() => setProgress(82), 1100));
    timers.current.push(setTimeout(() => setProgress(90), 2400));
    // pathname が変わらないケース（同一ルート等）の取りこぼし対策
    timers.current.push(setTimeout(() => finish(), 10000));
  }, [clearTimers, finish]);

  // リンクのタップを捕捉して即開始
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      const targetAttr = anchor.getAttribute("target");
      if (targetAttr && targetAttr !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // 同一URL（遷移なし／ハッシュのみ）は無視
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      start();
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  // 戻る/進む（popstate）でも開始
  useEffect(() => {
    function onPopState() {
      start();
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [start]);

  // 遷移確定（pathname 変化）で完了。初回マウントは無視。
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    finish();
  }, [pathname, finish]);

  // アンマウント時にタイマーを掃除
  useEffect(() => clearTimers, [clearTimers]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        pointerEvents: "none",
        opacity: active ? 1 : 0,
        transition: "opacity 250ms ease",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #9c6b2f, #e4c989)",
          boxShadow: "0 0 8px rgba(196, 160, 99, 0.7)",
          borderRadius: "0 3px 3px 0",
          transition: "width 350ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </div>
  );
}
