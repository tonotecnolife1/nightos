import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
  Wine,
  Zap,
} from "lucide-react";

export default function StorePitchDoc() {
  return (
    <div className="bg-white min-h-screen text-[#2b232a] print:text-black" style={{ fontFamily: '"Noto Sans JP", sans-serif' }}>
      {/* Cover */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 py-16 bg-gradient-to-br from-[#faf7f2] via-[#f5efe6] to-[#e8ddd0] print:break-after-page">
        <div className="text-center max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#9a7bbb]/10 text-[#9a7bbb] text-sm font-medium mb-6">
            <Sparkles size={14} />
            テスト店舗パートナー募集
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            NIGHTOS
          </h1>
          <p className="text-xl font-semibold text-[#2b232a] mb-2">
            夜のお店のための AI ワークスペース
          </p>
          <p className="text-base text-[#675d66] leading-relaxed">
            店舗が入力するだけで、キャストの売上が上がる。<br />
            AI がお客様への連絡を自動化し、指名数・リピート率を仕組みで改善します。
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Stat label="初期費用" value="¥0" />
            <Stat label="月額" value="無料" sub="テスト期間中" />
            <Stat label="導入時間" value="1時間" />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="px-8 py-16 max-w-3xl mx-auto print:break-after-page">
        <SectionHeader emoji="😰" title="お店が抱える3つの課題" />
        <div className="grid gap-4 mt-8">
          <ProblemCard
            icon={<Users size={24} />}
            color="#c98d80"
            title="お客様への連絡がバラバラ"
            items={["誰がいつ連絡したか分からない", "ベテランが辞めると顧客情報も消える", "新人は何をすればいいか分からない"]}
          />
          <ProblemCard
            icon={<MessageCircle size={24} />}
            color="#9a7bbb"
            title="情報がキャストに届かない"
            items={["好みやNG事項をLINEグループで共有 → 見落とし", "ボトル残量を口頭伝達 → 忘れる", "来店情報がリアルタイムで届かない"]}
          />
          <ProblemCard
            icon={<BarChart3 size={24} />}
            color="#c9a84c"
            title="効果測定ができない"
            items={["どのキャストが頑張っているか分からない", "指名数やリピート率の推移が見えない", "何が売上に効いているかが勘になっている"]}
          />
        </div>
      </section>

      {/* Solution */}
      <section className="px-8 py-16 bg-[#faf7f2] print:break-after-page">
        <div className="max-w-3xl mx-auto">
          <SectionHeader emoji="✨" title="NIGHTOSの解決策" />
          <p className="text-center text-[#675d66] mt-2 mb-10">
            店舗スタッフは <strong className="text-[#2b232a]">1日5分の入力だけ</strong>。分析も連絡の提案もAIが自動。
          </p>

          {/* Before/After */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#f0e8e0] p-6">
              <h3 className="text-lg font-bold text-[#a08060] mb-4">😓 Before（今まで）</h3>
              <ul className="space-y-3 text-sm text-[#675d66]">
                <li className="flex gap-2"><span className="text-[#c98d80]">✕</span> キャストが自力で連絡先を決める</li>
                <li className="flex gap-2"><span className="text-[#c98d80]">✕</span> LINE文面を毎回考える</li>
                <li className="flex gap-2"><span className="text-[#c98d80]">✕</span> 顧客の好みは記憶頼み</li>
                <li className="flex gap-2"><span className="text-[#c98d80]">✕</span> 来店はスタッフが口頭で伝える</li>
                <li className="flex gap-2"><span className="text-[#c98d80]">✕</span> 成績は月末に集計</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-[#f7f0de] to-[#f0e4cc] p-6 border border-[#c9a84c]/20">
              <h3 className="text-lg font-bold text-[#a08050] mb-4">🌟 After（NIGHTOS）</h3>
              <ul className="space-y-3 text-sm text-[#2b232a]">
                <li className="flex gap-2"><span className="text-success-500">✓</span> AIが「今日連絡すべき人」を自動選定</li>
                <li className="flex gap-2"><span className="text-success-500">✓</span> テンプレートに名前・話題が自動挿入</li>
                <li className="flex gap-2"><span className="text-success-500">✓</span> 店舗登録 → カルテに自動反映</li>
                <li className="flex gap-2"><span className="text-success-500">✓</span> 来店登録 → 30秒でキャストに通知</li>
                <li className="flex gap-2"><span className="text-success-500">✓</span> ダッシュボードでリアルタイム可視化</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Flow diagram */}
      <section className="px-8 py-16 max-w-3xl mx-auto print:break-after-page">
        <SectionHeader emoji="🔄" title="データの流れ" />
        <p className="text-center text-[#675d66] mt-2 mb-10">
          店舗が入力 → キャストが活用 → 売上が上がる
        </p>
        <div className="flex flex-col items-center gap-4">
          <FlowStep icon={<Users />} color="#c9a84c" label="店舗スタッフ" desc="顧客登録 2分 / 来店登録 15秒 / ボトル登録 30秒" />
          <Arrow />
          <FlowStep icon={<Zap />} color="#9a7bbb" label="NIGHTOS AI" desc="連絡リストの自動選定 / テンプレート生成 / さくらママAI" />
          <Arrow />
          <FlowStep icon={<Sparkles />} color="#c98d80" label="キャスト" desc="ホーム画面で確認 / コピペで LINE送信 / AIに相談" />
          <Arrow />
          <FlowStep icon={<TrendingUp />} color="#50966a" label="成果" desc="指名数↑ リピート率↑ 連絡達成率80%↑" />
        </div>
      </section>

      {/* Cast benefits visual */}
      <section className="px-8 py-16 bg-[#faf7f2] print:break-after-page">
        <div className="max-w-3xl mx-auto">
          <SectionHeader emoji="💃" title="キャストが得るもの" />
          <p className="text-center text-[#675d66] mt-2 mb-8">キャストの入力作業はゼロ。見るだけで使える。</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <BenefitCard icon={<Bell />} color="#c98d80" title="来店通知" desc="来店登録→30秒で自動通知" />
            <BenefitCard icon={<Calendar />} color="#9a7bbb" title="今日連絡するお客様" desc="AIが今日の優先顧客を選定" />
            <BenefitCard icon={<MessageCircle />} color="#c9a84c" title="テンプレート" desc="顧客名・話題が自動挿入" />
            <BenefitCard icon={<Sparkles />} color="#c98d80" title="さくらママAI" desc="接客・LINE文面を即座に相談" />
            <BenefitCard icon={<Wine />} color="#9a7bbb" title="ボトル管理" desc="残量警告+次のおすすめ提案" />
            <BenefitCard icon={<BarChart3 />} color="#c9a84c" title="成績可視化" desc="指名数・目標進捗がグラフで" />
          </div>
        </div>
      </section>

      {/* Daily routine */}
      <section className="px-8 py-16 max-w-3xl mx-auto print:break-after-page">
        <SectionHeader emoji="📅" title="1日の運用フロー" />
        <div className="mt-8 space-y-3">
          <TimelineItem time="開店前" who="店舗" action="予約客の来店登録を準備" />
          <TimelineItem time="来店時" who="店舗" action="来店登録（テーブル+顧客+指名） → 15秒" highlight />
          <TimelineItem time="30秒後" who="キャスト" action="スマホに来店通知 → カルテで好みを確認してテーブルへ" highlight />
          <TimelineItem time="営業中" who="キャスト" action="必要ならさくらママAIに接客相談" />
          <TimelineItem time="閉店後" who="キャスト" action="テンプレートからお礼LINEをコピペ送信" highlight />
          <TimelineItem time="翌朝" who="キャスト" action="ホーム画面で今日連絡するお客様を確認 → LINE" highlight />
          <TimelineItem time="週次" who="店長" action="ダッシュボードで連絡達成率・指名数を確認" />
        </div>
      </section>

      {/* What we ask */}
      <section className="px-8 py-16 bg-[#faf7f2] print:break-after-page">
        <div className="max-w-3xl mx-auto">
          <SectionHeader emoji="🤝" title="テスト協力のお願い" />
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="text-lg font-bold mb-4">お店にお願いすること</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-success-500 mt-0.5 shrink-0" /> 毎日の来店登録（15秒/件）</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-success-500 mt-0.5 shrink-0" /> キャスト2〜3名にアプリ利用</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-success-500 mt-0.5 shrink-0" /> 週1回15分のフィードバック</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-success-500 mt-0.5 shrink-0" /> 主要顧客10〜20名の初期登録</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">お店のメリット</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2"><span className="text-[#c9a84c] font-bold">✦</span> 完全無料（テスト期間中）</li>
                <li className="flex items-start gap-2"><span className="text-[#c9a84c] font-bold">✦</span> 設備投資ゼロ（スマホだけ）</li>
                <li className="flex items-start gap-2"><span className="text-[#c9a84c] font-bold">✦</span> フィードバックが機能に反映される</li>
                <li className="flex items-start gap-2"><span className="text-[#c9a84c] font-bold">✦</span> いつでも中断OK・データ削除可能</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 text-center bg-gradient-to-br from-[#9a7bbb]/10 to-[#c98d80]/10">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-3">まずはデモをご覧ください</h2>
          <p className="text-[#675d66] mb-6">
            実際に動くアプリをスマホでお見せします。<br />
            5分で「これは使える」と感じていただけるはずです。
          </p>
          <div className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#9a7bbb] to-[#c98d80] text-white font-semibold text-lg shadow-lg">
            デモのご案内はこちら
            <ArrowRight size={18} />
          </div>
          <p className="text-sm text-[#a39ba1] mt-4">テスト期間: 2週間 · 費用: 無料 · 中断: いつでもOK</p>
        </div>
      </section>
    </div>
  );
}

// ═══════════════ Sub-components ═══════════════

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <h2 className="text-2xl font-bold text-center">
      <span className="mr-2">{emoji}</span>{title}
    </h2>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-white/80 border border-[#c9a84c]/20 px-5 py-3 text-center min-w-[100px]">
      <div className="text-xs text-[#a08060] font-medium">{label}</div>
      <div className="text-2xl font-bold text-[#2b232a] mt-1" style={{ fontFamily: '"Cormorant Garamond", serif' }}>{value}</div>
      {sub && <div className="text-[10px] text-[#a39ba1] mt-0.5">{sub}</div>}
    </div>
  );
}

function ProblemCard({ icon, color, title, items }: { icon: React.ReactNode; color: string; title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 flex gap-4 shadow-sm">
      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-base mb-2">{title}</h3>
        <ul className="text-sm text-[#675d66] space-y-1">
          {items.map((item, i) => (
            <li key={i}>• {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FlowStep({ icon, color, label, desc }: { icon: React.ReactNode; color: string; label: string; desc: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 w-full max-w-md shadow-sm">
      <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: color }}>
        {icon}
      </div>
      <div>
        <div className="font-bold">{label}</div>
        <div className="text-sm text-[#675d66]">{desc}</div>
      </div>
    </div>
  );
}

function Arrow() {
  return <div className="text-2xl text-[#c9a84c]">↓</div>;
}

function BenefitCard({ icon, color, title, desc }: { icon: React.ReactNode; color: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
      <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-white" style={{ background: color }}>
        {icon}
      </div>
      <div className="font-bold text-sm">{title}</div>
      <div className="text-xs text-[#675d66] mt-1">{desc}</div>
    </div>
  );
}

function TimelineItem({ time, who, action, highlight }: { time: string; who: string; action: string; highlight?: boolean }) {
  return (
    <div className={`flex items-start gap-4 rounded-lg p-3 ${highlight ? "bg-[#faf7f2] border border-[#c9a84c]/20" : ""}`}>
      <div className="text-sm font-bold text-[#a08060] w-16 shrink-0 pt-0.5">{time}</div>
      <div className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${who === "店舗" ? "bg-[#c9a84c]/10 text-[#a08050]" : who === "キャスト" ? "bg-[#c98d80]/10 text-[#c98d80]" : "bg-[#9a7bbb]/10 text-[#9a7bbb]"}`}>{who}</div>
      <div className="text-sm text-[#2b232a]">{action}</div>
    </div>
  );
}
