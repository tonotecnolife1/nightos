"use client";

import { useState, useTransition } from "react";
import { updatePassword } from "../actions";

interface Props {
  email: string;
}

export default function UpdatePasswordForm({ email }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <main className="min-h-dvh bg-pearl flex flex-col">
      <div className="bg-gradient-hero px-6 pt-14 pb-12">
        <div className="max-w-sm mx-auto">
          <h1 className="font-display text-[28px] leading-[1.3] font-medium tracking-wide text-ink">
            新しいパスワード
          </h1>
          <p className="mt-1.5 text-body-sm text-ink-secondary truncate">
            {email} のパスワードを再設定します
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-8 pb-12">
        <div className="max-w-sm mx-auto flex flex-col gap-4">
          <form action={handleSubmit} className="space-y-3">
            <label className="block">
              <div className="flex items-baseline justify-between mb-1.5 px-1">
                <span className="text-body-sm text-ink-secondary">
                  新しいパスワード
                </span>
                <span className="text-[11px] text-ink-muted">8文字以上</span>
              </div>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                disabled={pending}
                className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-warm text-body-md text-ink shadow-soft focus:outline-none focus:border-blush-deep"
                style={{ fontSize: "16px" }}
              />
            </label>

            <button
              type="submit"
              disabled={pending}
              className="w-full mt-2 px-6 py-3.5 rounded-pill bg-roseGold-deep text-pearl-light text-body-md font-semibold tracking-[0.04em] hover:-translate-y-px active:translate-y-px transition shadow-luxe will-change-transform disabled:opacity-50"
            >
              {pending ? "更新中..." : "パスワードを更新"}
            </button>
            {error && (
              <p className="text-[12px] text-[#c2575b] text-center">{error}</p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
