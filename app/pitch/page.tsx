import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Camera,
  CheckCircle2,
  Clock,
  Heart,
  MessageCircle,
  Mic,
  Sparkles,
  TrendingUp,
  Users,
  Wine,
  Zap,
} from "lucide-react";
import { RuriMamaAvatar } from "@/components/nightos/ruri-mama-avatar";
import { BASE_PLAN_NAME } from "@/lib/nightos/billing";

export default function PitchPage() {
  return (
    <div className="bg-pearl min-h-dvh">
      {/* Hero */}
      <section className="px-6 pt-12 pb-8 text-center bg-pearl-soft">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-badge bg-champagne-soft/60 text-gold-deep text-label-sm border border-gold/30 mb-4">
          <Sparkles size={12} />
          夜のお店専用
        </div>
        <h1 className="font-display text-[2.8rem] leading-[1.1] font-semibold text-ink tracking-wide mb-3">
          NIGHTOS
        </h1>
        <p className="text-display-sm text-ink mb-2">
          店舗が入力するだけで、
          <br />
          キャストの売上が上がる
        </p>
        <p className="text-body-md text-ink-soft max-w-xs mx-auto">
          夜のお店のためのAIワークスペース。
          顧客管理・お客様への連絡・接客アドバイスを1つに。
        </p>
      </section>

      {/* Problem */}
      <section className="px-6 py-8">
        <SectionTitle emoji="😰" title="こんな課題ありませんか？" />
        <div className="space-y-3 mt-4">
          <ProblemCard
            title="お客様への連絡がバラバラ"
            body="誰がいつ連絡したか分からない。ベテランが辞めると顧客情報も消える"
          />
          <ProblemCard
            title="情報がキャストに届かない"
            body="好みやNG事項をLINEグループで共有 → 見落とし。ボトル残量も口頭伝達"
          />
          <ProblemCard
            title="効果が見えない"
            body="どのキャストが頑張っているか、何が売上に効いているか分からない"
          />
        </div>
      </section>

      {/* Solution */}
      <section className="px-6 py-8 bg-pearl-soft">
        <SectionTitle emoji="✨" title="NIGHTOSの解決策" />
        <p className="text-body-md text-ink-soft mt-2 mb-5">
          店舗スタッフは<strong className="text-ink">1日5分の入力だけ</strong>。
          分析も連絡の提案もAIが自動でやります。
        </p>

        <div className="space-y-3">
          <FeatureCard
            icon={<Users size={20} />}
            tone="champagne"
            title="顧客登録（約2分）"
            body="名前・好み・担当キャストを入力 → キャストのカルテに即反映"
          />
          <FeatureCard
            icon={<Bell size={20} />}
            tone="rose"
            title="来店登録（約15秒）"
            body="テーブルと顧客を選んでタップ → キャストに自動通知"
          />
          <FeatureCard
            icon={<Wine size={20} />}
            tone="amethyst"
            title="ボトル登録（約30秒）"
            body="銘柄とオーナーを選ぶだけ → 残量管理 + 自動警告"
          />
        </div>
      </section>

      {/* Cast benefits */}
      <section className="px-6 py-8">
        <SectionTitle emoji="💫" title="キャストが得ること" />
        <p className="text-body-md text-ink-soft mt-2 mb-5">
          <strong className="text-ink">キャストの入力作業はゼロ</strong>
          。店舗が入力した情報が自動で活用されます。
        </p>

        <div className="space-y-2.5">
          <BenefitRow icon={<TrendingUp size={16} />} text="AIが「今日連絡すべき人」を自動選定" />
          <BenefitRow icon={<MessageCircle size={16} />} text="テンプレートに顧客名・ボトル名が自動挿入" />
          <BenefitRow icon={<Sparkles size={16} />} text="さくらママAIに接客やLINE文面を相談" />
          <BenefitRow icon={<Camera size={16} />} text="LINEスクショを貼ると会話内容をAIが読み取り" />
          <BenefitRow icon={<Mic size={16} />} text="音声入力対応 → 忙しい時も話すだけ" />
          <BenefitRow icon={<BarChart3 size={16} />} text="自分の指名数・リピート率が可視化" />
          <BenefitRow icon={<Heart size={16} />} text="ボトル残量が少ない時に次のおすすめを提案" />
          <BenefitRow icon={<Bell size={16} />} text="来店登録 → 30秒でキャストに通知" />
        </div>
      </section>

      {/* Ruri-Mama */}
      <section className="px-6 py-8 bg-pearl-soft">
        <div className="flex items-center gap-3 mb-4">
          <RuriMamaAvatar size={52} withGlow />
          <div>
            <h2 className="text-display-sm text-ink">さくらママAI</h2>
            <p className="text-body-sm text-ink-soft">銀座30年の経験者</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <RuriMamaFeature
            situation="来店翌日"
            action="お礼LINEの文面を、顧客カルテを見ながら提案"
          />
          <RuriMamaFeature
            situation="接客中（急ぎ）"
            action="「会話が続かない」→ 1問で具体的な切り出し方を回答"
          />
          <RuriMamaFeature
            situation="ボトル残量低下"
            action="顧客の好みに合わせた次のボトル候補を3本提案"
          />
          <RuriMamaFeature
            situation="毎朝"
            action="「今日の重点ポイント」をキャストと店舗に生成"
          />
        </div>

        <p className="text-label-sm text-gold-deep mt-4 text-center">
          一般論は言わない。必ず「顧客の情報を見て」具体的に答えます
        </p>
      </section>

      {/* Store dashboard */}
      <section className="px-6 py-8">
        <SectionTitle emoji="📊" title="店舗向け効果ダッシュボード" />
        <div className="space-y-2.5 mt-4">
          <BenefitRow icon={<TrendingUp size={16} />} text="指名数・リピート率の推移グラフ" />
          <BenefitRow icon={<Users size={16} />} text="離脱リスク顧客をAIが自動検知" />
          <BenefitRow icon={<BarChart3 size={16} />} text="キャスト別の成績・連絡達成率・ARPU" />
          <BenefitRow icon={<Zap size={16} />} text="顧客カテゴリ構成（VIP/常連/新規の比率）" />
          <BenefitRow icon={<MessageCircle size={16} />} text="キャストへの連絡機能" />
        </div>
      </section>

      {/* How to start */}
      <section className="px-6 py-8 bg-pearl-soft">
        <SectionTitle emoji="🚀" title="始め方" />
        <div className="space-y-3 mt-4">
          <StepCard step={1} title="URLを開く" body="スマホのブラウザだけでOK。専用アプリのインストール不要" />
          <StepCard step={2} title="主要顧客を登録" body="まずはVIP・常連から。1人2分で完了" />
          <StepCard step={3} title="キャストに共有" body="URLをLINEで送るだけ。ホーム画面に追加でアプリのように使える" />
          <StepCard step={4} title="今日から使える" body="初期費用ゼロ・契約不要で即スタート" />
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-8">
        <SectionTitle emoji="💰" title="料金" />
        <div className="mt-4 rounded-card bg-gradient-champagne border border-champagne-dark p-5 text-center">
          <div className="text-label-sm tracking-luxe text-wine-deep uppercase">
            {BASE_PLAN_NAME}
          </div>
          <div className="text-display-lg font-display text-ink mt-1">無料</div>
          <p className="text-body-md text-ink-soft mt-1">
            基本機能はずっと無料でご利用いただけます
          </p>
          <p className="text-label-sm text-ink-mute mt-2">
            カード登録をお願いしますが、必要に応じてだけ課金が発生します
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pt-4 pb-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 h-14 rounded-btn bg-wine-deep text-pearl-light shadow-luxe text-label-md font-medium active:scale-95 transition-transform"
        >
          デモを見る
          <ArrowRight size={16} />
        </Link>
        <p className="text-label-sm text-ink-mute mt-3">
          ↑ 実際に動くデモをご覧いただけます
        </p>
      </section>
    </div>
  );
}

// ═══════════════ Sub-components ═══════════════

function SectionTitle({ emoji, title }: { emoji: string; title: string }) {
  return (
    <h2 className="text-display-sm text-ink">
      <span className="mr-1.5">{emoji}</span>
      {title}
    </h2>
  );
}

function ProblemCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-card bg-pearl-warm border border-pearl-soft p-4 shadow-soft">
      <div className="text-body-md font-semibold text-ink mb-1">{title}</div>
      <div className="text-body-sm text-ink-soft leading-relaxed">
        {body}
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  tone,
  title,
  body,
}: {
  icon: React.ReactNode;
  tone: "champagne" | "rose" | "amethyst";
  title: string;
  body: string;
}) {
  const iconBg = {
    champagne: "bg-champagne-dark text-ink",
    rose: "bg-rose-gold-metallic text-pearl-light",
    amethyst: "bg-gold-metallic text-pearl-light",
  }[tone];
  return (
    <div className="flex gap-3 rounded-card bg-pearl-warm border border-pearl-soft p-4 shadow-soft">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <div className="text-body-md font-semibold text-ink">{title}</div>
        <div className="text-body-sm text-ink-soft leading-relaxed">
          {body}
        </div>
      </div>
    </div>
  );
}

function BenefitRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-full bg-champagne-soft/60 flex items-center justify-center shrink-0 text-gold-deep">
        {icon}
      </div>
      <span className="text-body-md text-ink leading-relaxed pt-0.5">
        {text}
      </span>
    </div>
  );
}

function RuriMamaFeature({
  situation,
  action,
}: {
  situation: string;
  action: string;
}) {
  return (
    <div className="rounded-btn bg-pearl-warm border border-gold/30 px-3 py-2.5">
      <div className="text-label-sm text-gold-deep font-medium">
        {situation}
      </div>
      <div className="text-body-sm text-ink">{action}</div>
    </div>
  );
}

function StepCard({
  step,
  title,
  body,
}: {
  step: number;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-rose-gold-metallic text-pearl-light flex items-center justify-center shrink-0 font-display text-body-lg font-semibold">
        {step}
      </div>
      <div className="flex-1 pt-0.5">
        <div className="text-body-md font-semibold text-ink">{title}</div>
        <div className="text-body-sm text-ink-soft">{body}</div>
      </div>
    </div>
  );
}
