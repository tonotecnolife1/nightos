"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/nightos/error-reporter";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, {
      scope: "app.error-boundary",
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 bg-pearl">
      <div className="max-w-sm text-center space-y-3">
        <h2 className="font-display text-[22px] font-medium text-ink">
          ページを読み込めませんでした
        </h2>
        <p className="text-body-sm text-ink-soft leading-relaxed">
          通信状況を確認して、もう一度お試しください。
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-6 py-3 rounded-pill bg-roseGold-deep text-pearl-light text-body-md font-semibold tracking-[0.04em] hover:-translate-y-px active:translate-y-px transition shadow-luxe will-change-transform"
        >
          もう一度試す
        </button>
        {error.digest && (
          <p className="text-[10px] text-ink-mute pt-3">
            参照ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
