import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * プライバシーポリシー — 公開前に **必ず**法務確認を取った最終版に
 * 差し替えること。本テンプレートは雛形であって法的助言ではない。
 */
export const metadata = {
  title: "プライバシーポリシー | NIGHTOS",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-pearl">
      <div className="bg-gradient-hero px-6 pt-10 pb-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[12px] text-ink-mute hover:text-ink-soft mb-3"
          >
            <ArrowLeft size={14} /> 戻る
          </Link>
          <h1 className="font-display text-[28px] leading-[1.2] font-medium tracking-wide text-ink">
            プライバシーポリシー
          </h1>
          <p className="text-[11px] text-ink-mute mt-1">
            最終更新日: 2026年5月1日
          </p>
        </div>
      </div>

      <article className="px-6 py-10 max-w-2xl mx-auto space-y-6 text-body-md text-ink leading-relaxed">
        <Section title="1. 事業者情報">
          <p>
            本サービス（以下「NIGHTOS」）は、〔運営事業者名〕（以下「当社」）が
            運営しています。お問い合わせは〔連絡先メールアドレス〕までお願いいたします。
          </p>
        </Section>

        <Section title="2. 取得する情報">
          <p>当社は、サービス提供のため以下の情報を取得します。</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>会員情報: メールアドレス、パスワード（ハッシュ化済）、源氏名、所属店舗、役割</li>
            <li>業務情報: 顧客カルテ（氏名・誕生日・職業・嗜好等）、来店履歴、ボトル管理、同伴記録、連絡履歴</li>
            <li>AI 利用ログ: さくらママ AI への入力テキスト、生成された応答（応答品質改善目的）</li>
            <li>利用ログ: アクセスログ、Cookie、デバイス情報、エラー情報</li>
          </ul>
        </Section>

        <Section title="3. 利用目的">
          <ul className="list-disc pl-5 space-y-1">
            <li>本サービスの提供・運営・改善</li>
            <li>会員管理および本人確認</li>
            <li>不正利用の防止</li>
            <li>カスタマーサポートおよびお問い合わせへの対応</li>
            <li>新機能・キャンペーンのご案内（任意でオプトアウト可能）</li>
            <li>統計的データの作成（個人を特定できない形式に限る）</li>
          </ul>
        </Section>

        <Section title="4. 第三者提供">
          <p>
            当社は、法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に
            提供しません。サービス運用上、以下のサービスへ最小限の情報を委託
            する場合があります。
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Supabase Inc.（米国）— DB / 認証基盤</li>
            <li>Vercel Inc.（米国）— アプリケーション配信</li>
            <li>Anthropic, PBC（米国）— AI 応答生成（利用者の入力テキストが学習に利用されない設定にしています）</li>
          </ul>
        </Section>

        <Section title="5. 安全管理措置">
          <p>
            通信は TLS で暗号化し、パスワードは一方向ハッシュ化したうえで
            保存しています。サーバへのアクセスは権限のある従業員に限定し、
            アクセスログを保管しています。
          </p>
        </Section>

        <Section title="6. 開示・訂正・削除請求">
          <p>
            ご本人は、当社に対し、自己の個人情報の開示・訂正・追加・削除を
            請求できます。本サービスの「設定 → アカウントを削除」から
            アカウントおよび関連情報を完全に削除できます。
          </p>
        </Section>

        <Section title="7. Cookie / アクセス解析">
          <p>
            ログイン状態の保持および統計目的で Cookie を使用します。ブラウザ設定で
            Cookie を無効化できますが、その場合一部機能がご利用いただけません。
          </p>
        </Section>

        <Section title="8. 改定">
          <p>
            本ポリシーの改定時は、本ページにて告知します。重要な変更がある場合は
            メール等で通知します。
          </p>
        </Section>

        <Section title="9. お問い合わせ窓口">
          <p>
            個人情報に関するお問い合わせは〔連絡先メールアドレス〕までご連絡
            ください。
          </p>
        </Section>

        <p className="text-[11px] text-ink-mute pt-6 border-t border-ink/[0.06]">
          ⚠️ 本ページは雛形です。本番公開前に〔運営事業者名〕〔連絡先〕
          〔特定の利用目的〕等を貴社情報に置き換え、必ず法務担当者の
          チェックを受けてください。
        </p>
      </article>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-[20px] leading-tight font-medium text-ink">
        {title}
      </h2>
      <div className="text-body-sm text-ink-soft leading-relaxed">
        {children}
      </div>
    </section>
  );
}
