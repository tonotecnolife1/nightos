import { describe, it, expect, afterEach } from "vitest";
import {
  isIos,
  isIosSafari,
  isIosInAppBrowser,
} from "@/lib/nightos/pwa";

// UA / platform stubs covering the browsers cast staff actually use on iOS.
const UA = {
  iosSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  iosChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1",
  iosLine:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Line/14.10.0",
  iosInstagram:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0.0",
  android:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
  desktopSafari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
};

function setUa(ua: string, opts: { platform?: string; maxTouchPoints?: number } = {}) {
  const navigator = {
    userAgent: ua,
    platform: opts.platform ?? "iPhone",
    maxTouchPoints: opts.maxTouchPoints ?? 5,
  };
  // `navigator` is a read-only getter on globalThis in Node, so define it.
  Object.defineProperty(globalThis, "navigator", {
    value: navigator,
    configurable: true,
    writable: true,
  });
  (globalThis as any).window = { navigator };
}

afterEach(() => {
  delete (globalThis as any).window;
  delete (globalThis as any).navigator;
});

describe("isIos", () => {
  it("detects iPhone", () => {
    setUa(UA.iosSafari);
    expect(isIos()).toBe(true);
  });

  it("detects iPadOS reporting a Mac UA via touch points", () => {
    setUa(UA.desktopSafari, { platform: "MacIntel", maxTouchPoints: 5 });
    expect(isIos()).toBe(true);
  });

  it("is false on a real desktop Mac (no touch)", () => {
    setUa(UA.desktopSafari, { platform: "MacIntel", maxTouchPoints: 0 });
    expect(isIos()).toBe(false);
  });

  it("is false on Android", () => {
    setUa(UA.android, { platform: "Linux armv8l" });
    expect(isIos()).toBe(false);
  });
});

describe("isIosSafari", () => {
  it("is true only for real Safari (Version/ token present)", () => {
    setUa(UA.iosSafari);
    expect(isIosSafari()).toBe(true);
  });

  it("is false for Chrome on iOS (CriOS)", () => {
    setUa(UA.iosChrome);
    expect(isIosSafari()).toBe(false);
  });

  it("is false inside the LINE in-app browser", () => {
    setUa(UA.iosLine);
    expect(isIosSafari()).toBe(false);
  });

  it("is false inside the Instagram in-app browser", () => {
    setUa(UA.iosInstagram);
    expect(isIosSafari()).toBe(false);
  });

  it("is false on Android", () => {
    setUa(UA.android, { platform: "Linux armv8l" });
    expect(isIosSafari()).toBe(false);
  });
});

describe("isIosInAppBrowser", () => {
  it("flags iOS Chrome as a non-Safari browser", () => {
    setUa(UA.iosChrome);
    expect(isIosInAppBrowser()).toBe(true);
  });

  it("flags the LINE in-app browser", () => {
    setUa(UA.iosLine);
    expect(isIosInAppBrowser()).toBe(true);
  });

  it("is false in real iOS Safari", () => {
    setUa(UA.iosSafari);
    expect(isIosInAppBrowser()).toBe(false);
  });

  it("is false on Android", () => {
    setUa(UA.android, { platform: "Linux armv8l" });
    expect(isIosInAppBrowser()).toBe(false);
  });
});
