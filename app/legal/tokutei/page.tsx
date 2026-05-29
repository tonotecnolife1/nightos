import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * 特定商取引法に基づく表記
 *
 * 有償サービスを提供する場合は法律上必須。無償の場合でも掲示が
 * 推奨される（信用面）。本テンプレートは雛形であって法的助言ではない。
 */
export const metadata = {
  title: "特定商取引法に基づく表記 | NIGHTOS",
};

export default function TokuteiPage() {
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
            特定商取引法に基づく表記
          </h1>
        </div>
      </div>

      <article className="px-6 py-10 max-w-2xl mx-auto">
        <dl className="rounded-card border border-ink/[0.06] bg-pearl-warm p-6 shadow-soft divide-y divide-ink/[0.06]">
          <Row label="販売事業者">〔運営事業者名（法人なら会社名）〕</Row>
          <Row label="所在地">
            〒〔郵便番号〕<br />
            〔都道府県・市区町村・番地・建物名〕
          </Row>
          <Row label="代表責任者">〔代表者氏名〕</Row>
          <Row label="連絡先">
            電話番号: 〔電話番号〕<br />
            メール: 〔連絡先メールアドレス〕<br />
            <span className="text-[11px] text-ink-mute">
              受付時間: 〔平日 10:00–18:00〕
            </span>
          </Row>
          <Row label="販売価格">
            各プランの料金ページに表示された金額（消費税込み）
          </Row>
          <Row label="商品代金以外の必要料金">
            通信料はお客様のご負担となります
          </Row>
          <Row label="支払方法">クレジットカード（Visa / Mastercard / JCB / Amex）</Row>
          <Row label="支払時期">月額プランは毎月当社所定日に決済</Row>
          <Row label="サービス提供時期">
            お申込み完了後、即時ご利用いただけます
          </Row>
          <Row label="返品・キャンセル">
            サービスの性質上、決済後の返金は原則行いません。詳細は利用規約に従います。
          </Row>
        </dl>

        <p className="text-[11px] text-ink-mute pt-6">
          ⚠️ 本ページは雛形です。本番公開前に〔事業者名〕〔住所〕〔電話番号〕等を
          実際の情報に置き換え、必ず法務担当者のチェックを受けてください。
          無償サービスのみで提供する場合でも本表記の掲示が推奨されます。
        </p>
      </article>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-body-sm text-ink-soft">{label}</dt>
      <dd className="text-body-sm text-ink leading-relaxed">{children}</dd>
    </div>
  );
}
