import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * 利用規約 — 公開前に **必ず**法務確認を取った最終版に差し替えること。
 * 本テンプレートは雛形であって法的助言ではない。
 */
export const metadata = {
  title: "利用規約 | NIGHTOS",
};

export default function TermsPage() {
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
            利用規約
          </h1>
          <p className="text-[11px] text-ink-mute mt-1">
            最終更新日: 2026年5月1日
          </p>
        </div>
      </div>

      <article className="px-6 py-10 max-w-2xl mx-auto space-y-6">
        <Section title="第1条（適用）">
          <p>
            本規約は、〔運営事業者名〕（以下「当社」）が提供する「NIGHTOS」
            （以下「本サービス」）の利用条件を定めるものです。利用者
            （以下「ユーザー」）は本規約に同意のうえ本サービスを利用するものとします。
          </p>
        </Section>

        <Section title="第2条（利用登録）">
          <ul className="list-disc pl-5 space-y-1">
            <li>登録希望者は、当社所定の方法により利用登録を申請するものとします。</li>
            <li>当社は、登録申請者が以下に該当する場合、登録を承認しないことがあります。</li>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>虚偽の情報を申告した場合</li>
              <li>過去に本規約違反等で利用停止された者</li>
              <li>反社会的勢力の関係者</li>
              <li>未成年・成年被後見人で法定代理人の同意がない場合</li>
              <li>その他当社が不適当と判断した場合</li>
            </ul>
          </ul>
        </Section>

        <Section title="第3条（アカウント管理）">
          <p>
            ユーザーは、自己の責任においてアカウント情報（メールアドレス・パスワード）
            を適切に管理するものとし、第三者に貸与・譲渡・売買してはなりません。
            アカウントの不正使用による損害について当社は一切責任を負いません。
          </p>
        </Section>

        <Section title="第4条（料金）">
          <p>
            本サービスは〔有償／無償〕で提供されます。有償プランの料金体系・
            支払方法は当社が別途定める料金表に従います。
          </p>
        </Section>

        <Section title="第5条（禁止事項）">
          <p>ユーザーは以下の行為をしてはなりません。</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>法令または公序良俗に違反する行為</li>
            <li>他のユーザーまたは第三者の権利・名誉・プライバシーを侵害する行為</li>
            <li>本サービスの運営を妨げる行為</li>
            <li>本サービスのリバースエンジニアリング、スクレイピング等</li>
            <li>当社の同意なくアカウント情報を第三者と共有する行為</li>
            <li>本サービスを他人へのなりすまし、誹謗中傷、嫌がらせ目的で利用する行為</li>
            <li>本サービスを通じて取得した顧客の個人情報を当該顧客以外への目的で利用する行為</li>
            <li>その他当社が不適切と判断する行為</li>
          </ul>
        </Section>

        <Section title="第6条（本サービスの提供の停止等）">
          <p>
            当社は、システムメンテナンス、地震・落雷・火災・停電・天災等、
            通信事業者の障害、その他当社がやむを得ないと判断した場合、
            ユーザーに事前通知なく本サービスの全部または一部の提供を停止
            することがあります。
          </p>
        </Section>

        <Section title="第7条（著作権）">
          <p>
            本サービスに含まれる文章、画像、デザイン、ロゴ、ソフトウェア等の
            著作権その他知的財産権は当社または正当な権利者に帰属します。
          </p>
          <p>
            ユーザーが本サービスに投稿したコンテンツの著作権はユーザーに帰属
            しますが、当社はサービス提供および改善の目的で当該コンテンツを
            無償で利用できるものとします。
          </p>
        </Section>

        <Section title="第8条（退会）">
          <p>
            ユーザーは、本サービスの「設定 → アカウントを削除」から退会できます。
            退会と同時にアカウントおよび関連データは完全に削除され復元できません。
          </p>
        </Section>

        <Section title="第9条（免責）">
          <p>
            当社は、本サービスに事実上または法律上の瑕疵が含まれていないこと
            （安全性、信頼性、正確性、完全性、有効性、適合性、エラーやバグが
            ないこと、権利侵害がないことを含む）を明示的にも黙示的にも保証しません。
          </p>
          <p>
            当社は、本サービスに起因してユーザーに生じた損害について、
            当社の故意または重過失に起因する場合を除き、一切の責任を負いません。
          </p>
        </Section>

        <Section title="第10条（規約の変更）">
          <p>
            当社は、必要と判断した場合、ユーザーへ事前通知のうえ本規約を
            変更することができます。変更後も継続して本サービスを利用した
            ユーザーは変更後の規約に同意したものとみなします。
          </p>
        </Section>

        <Section title="第11条（準拠法・管轄）">
          <p>
            本規約の解釈は日本法を準拠法とします。本サービスに関して紛争が
            生じた場合、〔東京地方裁判所〕を第一審の専属的合意管轄裁判所とします。
          </p>
        </Section>

        <p className="text-[11px] text-ink-mute pt-6 border-t border-ink/[0.06]">
          ⚠️ 本ページは雛形です。本番公開前に〔運営事業者名〕〔料金〕
          〔管轄裁判所〕等を貴社情報に置き換え、必ず法務担当者の
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
      <div className="text-body-sm text-ink-soft leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}
