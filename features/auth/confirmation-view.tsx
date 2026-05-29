"use client";

import Link from "next/link";

interface Props {
  email: string;
  backHref: string;
}

/**
 * Shown after a successful signup when Supabase has email confirmation
 * enabled (data.session is null until the user clicks the link).
 */
export function ConfirmationView({ email, backHref }: Props) {
  return (
    <main className="min-h-dvh bg-pearl flex flex-col">
      <div className="bg-gradient-hero px-6 pt-14 pb-12">
        <div className="max-w-sm mx-auto">
          <h1 className="font-display text-[28px] leading-[1.3] font-medium tracking-wide text-ink">
            確認メールを送信しました
          </h1>
          <p className="mt-1.5 text-body-sm text-ink-soft">
            メール本文のリンクをタップで完了します
          </p>
        </div>
      </div>
      <div className="flex-1 px-6 pt-8 pb-12">
        <div className="max-w-sm mx-auto space-y-4">
          <div className="rounded-card border border-ink/[0.06] bg-pearl-warm p-5 shadow-soft space-y-2">
            <p className="text-body-md text-ink">
              <span className="font-medium">{email}</span>
            </p>
            <p className="text-body-sm text-ink-soft leading-relaxed">
              上記のメールに送ったリンクをタップすると登録が完了します。
            </p>
            <p className="text-[11px] text-ink-mute">
              届かない場合は迷惑メール / プロモーションタブも確認してください。
            </p>
          </div>
          <Link
            href={backHref}
            className="block w-full text-center px-6 py-3.5 rounded-pill border border-gold/30 bg-pearl-warm/80 text-body-md text-ink hover:border-gold/50 hover:-translate-y-px transition shadow-soft"
          >
            ログイン画面に戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
