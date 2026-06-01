// Client-side only — do not import in server components

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

let _deferred: BeforeInstallPromptEvent | null = null;

export function captureInstallPrompt(e: Event) {
  e.preventDefault();
  _deferred = e as BeforeInstallPromptEvent;
  window.dispatchEvent(new CustomEvent("pwa-prompt-ready"));
}

export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return _deferred;
}

export function clearInstallPrompt() {
  _deferred = null;
}

export function isInstalledPwa(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export function isIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  // iPadOS 13+ reports a Mac UA; fall back to touch-point heuristic.
  return (
    /iPhone|iPad|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

// True Safari only. Real Safari carries both "Safari" and "Version/" tokens.
// Chrome/Firefox/Edge on iOS (CriOS/FxiOS/EdgiOS) and in-app WebViews
// (LINE / Instagram / Facebook etc.) lack the "Version/" token, so they
// are excluded — those browsers cannot add to the home screen.
export function isIosSafari(): boolean {
  if (!isIos()) return false;
  const ua = window.navigator.userAgent;
  return (
    /Safari/.test(ua) &&
    /Version\//.test(ua) &&
    !/CriOS|FxiOS|EdgiOS/.test(ua)
  );
}

// iOS device, but inside an in-app browser / non-Safari browser where
// "ホーム画面に追加" is unavailable. The user must open the page in Safari.
export function isIosInAppBrowser(): boolean {
  return isIos() && !isIosSafari();
}
