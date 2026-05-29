import Link from "next/link";

export const metadata = { title: "新規登録 | NIGHTOS Store" };

/**
 * Landing page for store-side signup. Splits into "owner" (creates a
 * brand-new store) vs "staff" (joins an existing store with an invite
 * code) so the URL itself is unambiguous.
 */
export default function StoreSignupPage() {
  return (
    <main className="min-h-dvh bg-pearl flex flex-col">
      <div className="bg-gradient-hero px-6 pt-14 pb-12">
        <div className="max-w-sm mx-auto">
          <h1 className="font-display text-[28px] leading-[1.3] font-medium tracking-wide text-ink">
            新規登録（店舗）
          </h1>
          <p className="mt-1.5 text-body-sm text-ink-soft">
            ご自身の立場を選んでください
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-8 pb-12">
        <div className="max-w-sm mx-auto space-y-3">
          <Link
            href="/store/auth/signup-owner"
            className="block px-5 py-4 rounded-card border border-ink/[0.06] bg-pearl-warm hover:border-gold/40 hover:-translate-y-px transition shadow-soft"
          >
            <div className="text-body-md font-medium text-ink">店舗オーナー</div>
            <p className="text-[11px] text-ink-mute mt-0.5 leading-relaxed">
              新しく店舗を開く。登録後にキャスト/スタッフ用の招待コードが発行されます。
            </p>
          </Link>
          <Link
            href="/store/auth/signup-staff"
            className="block px-5 py-4 rounded-card border border-ink/[0.06] bg-pearl-warm hover:border-gold/40 hover:-translate-y-px transition shadow-soft"
          >
            <div className="text-body-md font-medium text-ink">店舗スタッフ</div>
            <p className="text-[11px] text-ink-mute mt-0.5 leading-relaxed">
              既存の店舗に参加。オーナーから受け取った 8 文字の招待コードが必要です。
            </p>
          </Link>

          <p className="text-body-sm text-ink-soft text-center pt-4">
            既にアカウントをお持ちの方は{" "}
            <Link href="/store/auth/login" className="text-roseGold-deep underline-offset-2 hover:underline">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
