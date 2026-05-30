"use client";

import { Download, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  captureInstallPrompt,
  clearInstallPrompt,
  getInstallPrompt,
  isInstalledPwa,
  isIosSafari,
} from "@/lib/nightos/pwa";

const DISMISS_KEY = "nightos.install-prompt.dismissed-at";
const DISMISS_DAYS = 30;
const SHOW_DELAY_MS = 3000;

export function InstallPrompt() {
  const [ready, setReady] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isInstalledPwa()) return;

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const daysAgo = (Date.now() - Number(dismissedAt)) / 86_400_000;
      if (daysAgo < DISMISS_DAYS) {
        setDismissed(true);
        return;
      }
    }

    const onPrompt = (e: Event) => {
      captureInstallPrompt(e);
      // Delay showing the popup so it doesn't interrupt landing
      window.setTimeout(() => setReady(true), SHOW_DELAY_MS);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    if (isIosSafari()) {
      const t = window.setTimeout(() => setShowIosHint(true), SHOW_DELAY_MS);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onPrompt);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    clearInstallPrompt();
    setReady(false);
    setShowIosHint(false);
    setDismissed(true);
  };

  const install = async () => {
    const prompt = getInstallPrompt();
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      clearInstallPrompt();
      setReady(false);
    } else {
      dismiss();
    }
  };

  // iOS Safari: navigator.share() opens the native share sheet where the user
  // can tap "ホーム画面に追加". This is the closest iOS allows programmatically.
  const shareToInstall = async () => {
    if (typeof navigator === "undefined" || !navigator.share) return;
    try {
      await navigator.share({
        title: "NIGHTOS",
        url: window.location.origin,
      });
    } catch {
      // user cancelled share sheet — ignore
    }
  };

  if (dismissed) return null;

  if (ready && getInstallPrompt()) {
    return (
      <PromptCard onDismiss={dismiss} onAction={install}>
        <div className="flex-1 min-w-0">
          <div className="text-body-sm font-medium text-ink">
            ホーム画面に追加できます
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">
            アプリのように起動できて、毎日の確認が早くなります
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); void install(); }}
          className="shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-pill bg-wine-deep text-pearl-light-light text-[12px] font-medium shadow-soft hover:brightness-[1.02] transition"
        >
          <Download size={12} />
          追加
        </button>
      </PromptCard>
    );
  }

  if (showIosHint) {
    return (
      <PromptCard onDismiss={dismiss} onAction={shareToInstall}>
        <div className="flex-1 min-w-0">
          <div className="text-body-sm font-medium text-ink">
            ホーム画面に追加
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
            「共有」→「ホーム画面に追加」をタップしてください
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); void shareToInstall(); }}
          className="shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-pill bg-wine-deep text-pearl-light-light text-[12px] font-medium shadow-soft hover:brightness-[1.02] transition"
        >
          <Share2 size={12} />
          共有
        </button>
      </PromptCard>
    );
  }

  return null;
}

function PromptCard({
  children,
  onDismiss,
  onAction,
}: {
  children: React.ReactNode;
  onDismiss: () => void;
  onAction?: () => void;
}) {
  return (
    <div
      className="fixed left-3 right-3 z-50 mx-auto max-w-md rounded-card border border-gold/30 bg-pearl-warm/95 backdrop-blur-md p-3 shadow-warm cursor-pointer"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 4.5rem)" }}
      role="dialog"
      aria-label="アプリのインストール"
      onClick={onAction}
    >
      <div className="flex items-start gap-3">
        {children}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          aria-label="閉じる"
          className="shrink-0 -mr-1 -mt-1 w-7 h-7 rounded-full text-ink-muted hover:text-ink hover:bg-pearl-soft flex items-center justify-center"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
