"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { requestPasswordReset } from "../actions";

export default function ResetPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    const email = String(formData.get("email") ?? "");
    startTransition(async () => {
      const result = await requestPasswordReset(formData);
      if (result?.error) setError(result.error);
      else if (result?.sent) setSubmittedEmail(email);
    });
  };

  if (submittedEmail) {
    return (
      <main className="min-h-dvh bg-pearl flex flex-col">
        <div className="bg-gradient-hero px-6 pt-14 pb-12">
          <div className="max-w-sm mx-auto">
            <h1 className="font-display text-[28px] leading-[1.3] font-medium tracking-wide text-ink">
              再設定メールを送りました
            </h1>
            <p className="mt-1.5 text-body-sm text-ink-soft">
              リンクをタップして新しいパスワードを設定してください
            </p>
          </div>
        </div>
        <div className="flex-1 px-6 pt-8 pb-12">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="rounded-card border border-ink/[0.06] bg-pearl-warm p-5 shadow-soft space-y-2">
              <p className="text-body-md text-ink">
                <span className="font-medium">{submittedEmail}</span>
              </p>
              <p className="text-body-sm text-ink-soft leading-relaxed">
                登録されているアドレスであれば、パスワード再設定用のリンクをお送りします。
              </p>
              <p className="text-[11px] text-ink-mute">
                届かない場合は迷惑メール / プロモーションタブも確認してください。
              </p>
            </div>
            <Link
              href="/auth/login"
              className="block w-full text-center px-6 py-3.5 rounded-pill border border-gold/30 bg-pearl-warm/80 text-body-md text-ink hover:border-gold/50 hover:-translate-y-px transition shadow-soft"
            >
              ログイン画面に戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-pearl flex flex-col">
      <div className="bg-gradient-hero px-6 pt-14 pb-12">
        <div className="max-w-sm mx-auto">
          <h1 className="font-display text-[28px] leading-[1.3] font-medium tracking-wide text-ink">
            パスワード再設定
          </h1>
          <p className="mt-1.5 text-body-sm text-ink-soft">
            登録メールアドレスに再設定リンクをお送りします
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-8 pb-12">
        <div className="max-w-sm mx-auto flex flex-col gap-4">
          <form action={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="text-body-sm text-ink-soft mb-1.5 block px-1">
                メールアドレス
              </span>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                required
                disabled={pending}
                className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-light text-body-md text-ink placeholder:text-ink-mute shadow-soft focus:outline-none focus:border-wine-deep"
                style={{ fontSize: "16px" }}
              />
            </label>

            <button
              type="submit"
              disabled={pending}
              className="w-full mt-2 px-6 py-3.5 rounded-pill bg-wine-deep text-pearl-light-light text-body-md font-semibold tracking-[0.04em] hover:-translate-y-px active:translate-y-px transition shadow-luxe will-change-transform disabled:opacity-50"
            >
              {pending ? "送信中..." : "再設定リンクを送る"}
            </button>
            {error && (
              <p className="text-[12px] text-[#c2575b] text-center">{error}</p>
            )}
          </form>

          <p className="text-body-sm text-ink-soft text-center">
            <Link
              href="/auth/login"
              className="text-wine-deep underline-offset-2 hover:underline"
            >
              ログイン画面に戻る
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
