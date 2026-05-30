import Link from "next/link";

export const metadata = { title: "新規登録 | NIGHTOS" };

/**
 * Legacy signup URL — replaced by per-app entry points (migration to
 * URL-split flow). Show an app picker so old bookmarks / inbound links
 * land somewhere useful.
 */
export default function SignupPicker() {
  return (
    <main className="min-h-dvh bg-pearl flex flex-col">
      <div className="bg-gradient-hero px-6 pt-14 pb-12">
        <div className="max-w-sm mx-auto">
          <h1 className="font-display text-[28px] leading-[1.3] font-medium tracking-wide text-ink">
            どのアプリで登録しますか
          </h1>
          <p className="mt-1.5 text-body-sm text-ink-soft">
            ご自身の立場に合うものを選んでください
          </p>
        </div>
      </div>
      <div className="flex-1 px-6 pt-8 pb-12">
        <div className="max-w-sm mx-auto space-y-3">
          <Pick
            href="/cast/auth/signup"
            title="キャスト"
            description="店舗から受け取った招待コードで参加。接客・顧客管理アプリ。"
          />
          <Pick
            href="/store/auth/signup"
            title="店舗オーナー / スタッフ"
            description="新しく店舗を開く、または既存店舗にスタッフとして参加。"
          />
          <Pick
            href="/customer/auth/signup"
            title="来店客"
            description="自分のキープボトル・クーポン・会員ステータスを管理。"
          />
          <p className="text-body-sm text-ink-soft text-center pt-4">
            既にアカウントをお持ちの方は{" "}
            <Link
              href="/cast/auth/login"
              className="text-wine-deep underline-offset-2 hover:underline"
            >
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function Pick({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block px-5 py-4 rounded-card border border-ink/[0.06] bg-pearl-warm hover:border-gold/40 hover:-translate-y-px transition shadow-soft"
    >
      <div className="text-body-md font-medium text-ink">{title}</div>
      <p className="text-[11px] text-ink-mute mt-0.5 leading-relaxed">
        {description}
      </p>
    </Link>
  );
}
