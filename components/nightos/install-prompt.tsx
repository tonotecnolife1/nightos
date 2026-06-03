"use client";

import { Download, Share, PlusSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  captureInstallPrompt,
  clearInstallPrompt,
  getInstallPrompt,
  isInstalledPwa,
  isIosSafari,
  isIosInAppBrowser,
} from "@/lib/nightos/pwa";

const DISMISS_KEY = "nightos.install-prompt.dismissed-at";
const DISMISS_DAYS = 30;
const SHOW_DELAY_MS = 3000;

type IosMode = null | "safari" | "inapp";

export function InstallPrompt() {
  const [ready, setReady] = useState(false);
  const [iosMode, setIosMode] = useState<IosMode>(null);
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

    // iOS provides no programmatic install API (beforeinstallprompt is
    // Chrome/Android only). "ホーム画面に追加" lives ONLY in Safari's own
    // toolbar Share button — it is NOT in the navigator.share() sheet, and
    // it does not exist at all inside in-app browsers (LINE / Instagram).
    // So we show platform-accurate guidance instead of a misleading button.
    const mode: IosMode = isIosSafari()
      ? "safari"
      : isIosInAppBrowser()
        ? "inapp"
        : null;
    if (mode) {
      const t = window.setTimeout(() => setIosMode(mode), SHOW_DELAY_MS);
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
    setIosMode(null);
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
          className="shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-pill bg-wine-deep text-pearl-light text-[12px] font-medium shadow-soft hover:brightness-[1.02] transition"
        >
          <Download size={12} />
          追加
        </button>
      </PromptCard>
    );
  }

  if (iosMode === "safari") {
    return (
      <PromptCard onDismiss={dismiss}>
        <div className="flex-1 min-w-0">
          <div className="text-body-sm font-medium text-ink">
            ホーム画面に追加
          </div>
          <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
            画面下の
            <Share size={12} className="inline-block mx-1 -mt-0.5 align-middle text-wine-deep" />
            （共有）を押して、
            <span className="inline-flex items-center gap-0.5 mx-0.5 align-middle font-medium text-ink">
              <PlusSquare size={12} className="-mt-0.5" />
              ホーム画面に追加
            </span>
            を選んでください。
          </p>
        </div>
      </PromptCard>
    );
  }

  if (iosMode === "inapp") {
    return (
      <PromptCard onDismiss={dismiss}>
        <div className="flex-1 min-w-0">
          <div className="text-body-sm font-medium text-ink">
            Safari で開いてください
          </div>
          <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
            このアプリ内ブラウザではホーム画面に追加できません。右上のメニューから
            <span className="font-medium text-ink">「Safariで開く」</span>
            を選んでから追加してください。
          </p>
        </div>
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
      className={`fixed left-3 right-3 z-50 mx-auto max-w-md rounded-card border border-gold/30 bg-pearl-warm/95 backdrop-blur-md p-3 shadow-warm${onAction ? " cursor-pointer" : ""}`}
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
