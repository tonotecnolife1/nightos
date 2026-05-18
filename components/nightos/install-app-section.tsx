"use client";

import { CheckCircle, Download, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  clearInstallPrompt,
  getInstallPrompt,
  isInstalledPwa,
  isIosSafari,
} from "@/lib/nightos/pwa";

type InstallStatus = "loading" | "installed" | "available" | "ios" | "unavailable";

const shareToInstall = async () => {
  if (typeof navigator === "undefined" || !navigator.share) return;
  try {
    await navigator.share({ title: "NIGHTOS", url: window.location.origin });
  } catch {}
};

export function InstallAppSection() {
  const [status, setStatus] = useState<InstallStatus>("loading");
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const check = () => {
      if (isInstalledPwa()) { setStatus("installed"); return; }
      if (getInstallPrompt()) { setStatus("available"); return; }
      if (isIosSafari()) { setStatus("ios"); return; }
      setStatus("unavailable");
    };
    check();
    window.addEventListener("pwa-prompt-ready", check);
    return () => window.removeEventListener("pwa-prompt-ready", check);
  }, []);

  const handleInstall = async () => {
    const prompt = getInstallPrompt();
    if (!prompt) return;
    setInstalling(true);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      clearInstallPrompt();
      setStatus("installed");
    }
    setInstalling(false);
  };

  if (status === "loading" || status === "installed") return null;

  return (
    <section className="rounded-card border border-gold/30 bg-gradient-to-br from-pearl-warm to-champagne-soft/40 p-4 shadow-soft space-y-2">
      <h2 className="font-display text-[18px] leading-tight font-medium text-ink">
        ホーム画面に追加
      </h2>

      {status === "available" && (
        <>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            アプリとして起動できるようになります。毎日の確認が早くなります。
          </p>
          <button
            type="button"
            onClick={handleInstall}
            disabled={installing}
            className="inline-flex items-center gap-1.5 mt-1 px-5 py-2.5 rounded-pill bg-gradient-blush text-ink text-body-sm font-medium shadow-soft disabled:opacity-50 hover:brightness-[1.02] transition"
          >
            <Download size={14} />
            {installing ? "追加中..." : "ホーム画面に追加"}
          </button>
        </>
      )}

      {status === "ios" && (
        <>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            「共有」→「ホーム画面に追加」をタップしてください
          </p>
          <button
            type="button"
            onClick={shareToInstall}
            className="inline-flex items-center gap-1.5 mt-1 px-5 py-2.5 rounded-pill bg-gradient-blush text-ink text-body-sm font-medium shadow-soft hover:brightness-[1.02] transition"
          >
            <Share2 size={14} />
            共有を開く
          </button>
        </>
      )}

      {status === "unavailable" && (
        <p className="text-[11px] text-ink-muted leading-relaxed">
          Chrome のメニュー（右上 ⋮）→{" "}
          <span className="font-medium">ホーム画面に追加</span> から追加できます。
        </p>
      )}
    </section>
  );
}

/** Settings ページ用：インストール済みでも常に表示するバリアント */
export function InstallAppSectionAlways() {
  const [status, setStatus] = useState<InstallStatus>("loading");
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const check = () => {
      if (isInstalledPwa()) { setStatus("installed"); return; }
      if (getInstallPrompt()) { setStatus("available"); return; }
      if (isIosSafari()) { setStatus("ios"); return; }
      setStatus("unavailable");
    };
    check();
    window.addEventListener("pwa-prompt-ready", check);
    return () => window.removeEventListener("pwa-prompt-ready", check);
  }, []);

  const handleInstall = async () => {
    const prompt = getInstallPrompt();
    if (!prompt) return;
    setInstalling(true);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      clearInstallPrompt();
      setStatus("installed");
    }
    setInstalling(false);
  };

  if (status === "loading") return null;

  return (
    <section className="rounded-card border border-ink/[0.06] bg-pearl-warm p-4 shadow-soft space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-[18px] leading-tight font-medium text-ink">
          アプリとして使う
        </h2>
        {status === "installed" && (
          <span className="flex items-center gap-1 text-[11px] text-ink-muted">
            <CheckCircle size={13} className="text-emerald-500" />
            インストール済み
          </span>
        )}
      </div>

      {status === "installed" && (
        <p className="text-[11px] text-ink-muted">
          ホーム画面からアプリとして起動できます。
        </p>
      )}

      {status === "available" && (
        <>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            ホーム画面に追加すると、アプリのように起動できます。
          </p>
          <button
            type="button"
            onClick={handleInstall}
            disabled={installing}
            className="inline-flex items-center gap-1.5 mt-1 px-5 py-2.5 rounded-pill bg-gradient-blush text-ink text-body-sm font-medium shadow-soft disabled:opacity-50 hover:brightness-[1.02] transition"
          >
            <Download size={14} />
            {installing ? "追加中..." : "ホーム画面に追加"}
          </button>
        </>
      )}

      {status === "ios" && (
        <>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            「共有」→「ホーム画面に追加」をタップしてください
          </p>
          <button
            type="button"
            onClick={shareToInstall}
            className="inline-flex items-center gap-1.5 mt-1 px-5 py-2.5 rounded-pill bg-gradient-blush text-ink text-body-sm font-medium shadow-soft hover:brightness-[1.02] transition"
          >
            <Share2 size={14} />
            共有を開く
          </button>
        </>
      )}

      {status === "unavailable" && (
        <p className="text-[11px] text-ink-muted leading-relaxed">
          Chrome のメニュー（右上 ⋮）→{" "}
          <span className="font-medium">ホーム画面に追加</span> から追加できます。
        </p>
      )}
    </section>
  );
}
