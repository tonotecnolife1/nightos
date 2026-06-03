"use client";

import { CheckCircle, Download, Share, PlusSquare } from "lucide-react";
import { useEffect, useState } from "react";
import {
  clearInstallPrompt,
  getInstallPrompt,
  isInstalledPwa,
  isIosSafari,
  isIosInAppBrowser,
} from "@/lib/nightos/pwa";

type InstallStatus =
  | "loading"
  | "installed"
  | "available"
  | "ios"
  | "ios-inapp"
  | "unavailable";

// iOS Safari: "ホーム画面に追加" lives only in Safari's toolbar Share button,
// not in the navigator.share() sheet. So we render the exact toolbar steps.
function IosSafariSteps() {
  return (
    <p className="text-[11px] text-ink-muted leading-relaxed">
      画面下の
      <Share size={13} className="inline-block mx-1 -mt-0.5 align-middle text-wine-deep" />
      （共有）を押して、
      <span className="inline-flex items-center gap-0.5 mx-0.5 align-middle font-medium text-ink">
        <PlusSquare size={13} className="-mt-0.5" />
        ホーム画面に追加
      </span>
      を選んでください。
    </p>
  );
}

// In-app browser (LINE / Instagram など): cannot add to home screen at all.
function IosInAppSteps() {
  return (
    <p className="text-[11px] text-ink-muted leading-relaxed">
      このアプリ内ブラウザではホーム画面に追加できません。右上のメニューから{" "}
      <span className="font-medium text-ink">「Safariで開く」</span>{" "}
      を選んでから追加してください。
    </p>
  );
}

export function InstallAppSection() {
  const [status, setStatus] = useState<InstallStatus>("loading");
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const check = () => {
      if (isInstalledPwa()) { setStatus("installed"); return; }
      if (getInstallPrompt()) { setStatus("available"); return; }
      if (isIosSafari()) { setStatus("ios"); return; }
      if (isIosInAppBrowser()) { setStatus("ios-inapp"); return; }
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
            className="inline-flex items-center gap-1.5 mt-1 px-5 py-2.5 rounded-pill bg-wine-deep text-pearl-light text-body-sm font-medium shadow-soft disabled:opacity-50 hover:brightness-[1.02] transition"
          >
            <Download size={14} />
            {installing ? "追加中..." : "ホーム画面に追加"}
          </button>
        </>
      )}

      {status === "ios" && <IosSafariSteps />}

      {status === "ios-inapp" && <IosInAppSteps />}

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
      if (isIosInAppBrowser()) { setStatus("ios-inapp"); return; }
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
            className="inline-flex items-center gap-1.5 mt-1 px-5 py-2.5 rounded-pill bg-wine-deep text-pearl-light text-body-sm font-medium shadow-soft disabled:opacity-50 hover:brightness-[1.02] transition"
          >
            <Download size={14} />
            {installing ? "追加中..." : "ホーム画面に追加"}
          </button>
        </>
      )}

      {status === "ios" && <IosSafariSteps />}

      {status === "ios-inapp" && <IosInAppSteps />}

      {status === "unavailable" && (
        <p className="text-[11px] text-ink-muted leading-relaxed">
          Chrome のメニュー（右上 ⋮）→{" "}
          <span className="font-medium">ホーム画面に追加</span> から追加できます。
        </p>
      )}
    </section>
  );
}
