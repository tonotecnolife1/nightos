import { ArrowRight, BarChart3, Bell, Calendar, Camera, CheckCircle2, Heart, Lock, MessageCircle, Shield, Sparkles, TrendingUp, Users, Wine, Zap } from "lucide-react";
import { PhoneFrame } from "./phone-frame";

export function Sections() {
  return (
    <>
      {/* ═══ COVER ═══ */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 py-16 bg-gradient-to-b from-[#f8f4ef] to-[#e8ddd0] print:break-after-page">
        <h1 className="text-6xl font-bold tracking-tight" style={{ fontFamily: '"Cormorant Garamond", serif' }}>NIGHTOS</h1>
        <div className="w-16 h-0.5 bg-[#c9a84c] my-5" />
        <p className="text-2xl font-semibold text-center leading-snug">
          顧客を店舗の資産に変え、<br />
          <span className="text-[#c9a84c]">店舗の売上を上げる</span>
        </p>
        <p className="text-base text-[#675d66] mt-3 max-w-sm text-center">
          キャストが辞めても顧客が残る。<br />
          スマホだけで始められる夜のお店専用ツール。
        </p>
        <div className="flex gap-6 mt-10">
          <KPI value="+15%" label="リピート率UP" />
          <KPI value="2倍" label="連絡達成率" />
          <KPI value="¥0" label="初期費用" />
        </div>
      </section>

      {/* ═══ PROBLEM ═══ */}
      <section className="px-8 py-20 bg-white print:break-after-page">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-sm text-[#c98d80] font-semibold mb-2">PROBLEM</p>
          <h2 className="text-3xl font-bold text-center mb-10">
            キャストが辞めると、<br />顧客も一緒にいなくなる
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <ProblemCard
              emoji="🚪"
              title="キャストが辞める = 客が消える"
              desc="好み・LINE履歴・信頼関係。全てキャストの頭の中にある。"
            />
            <ProblemCard
              emoji="📉"
              title="エースが抜けると売上激減"
              desc="1人の退職で売上の30〜50%を失うリスク。"
            />
            <ProblemCard
              emoji="👤"
              title="誰がVIPか分からない"
              desc="来店回数・利用額・好み。オーナーが把握できていない。"
            />
          </div>
        </div>
      </section>

      {/* ═══ SOLUTION: STORE ASSET ═══ */}
      <section className="px-8 py-20 bg-[#faf7f2] print:break-after-page">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-sm text-[#c9a84c] font-semibold mb-2">SOLUTION</p>
          <h2 className="text-3xl font-bold text-center mb-4">
            NIGHTOSは顧客データを<br />
            <span className="text-[#c9a84c]">店舗の資産</span>にする
          </h2>
          <p className="text-center text-[#675d66] mb-10">店舗の売上を上げる3つの仕組み</p>
          <div className="grid md:grid-cols-3 gap-6">
            <SolutionCard
              icon={<Users size={24} />}
              color="#c9a84c"
              number="1"
              title="顧客が店舗のファンになる"
              desc="来店客アプリでボトル残量・クーポン・ランクを管理。お客様が「キャストの客」ではなく「お店のファン」に。"
            />
            <SolutionCard
              icon={<Sparkles size={24} />}
              color="#9a7bbb"
              number="2"
              title="全キャストの売上が上がる"
              desc="AIが連絡リストを選び、LINE文面まで作成。新人でもベテラン並みのお客様への連絡が可能に。"
            />
            <SolutionCard
              icon={<Shield size={24} />}
              color="#c98d80"
              number="3"
              title="キャストが辞めても売上が落ちない"
              desc="顧客データは全て店舗に蓄積。退職しても来店履歴・好み・メモが次の担当にそのまま引き継がれる。"
            />
          </div>
        </div>
      </section>

      {/* ═══ CUSTOMER APP (来店客CRM) ═══ */}
      <section className="px-8 py-20 bg-white print:break-after-page">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge text="来店客CRM — 店舗の資産化" />
            <h2 className="text-3xl font-bold mt-3 mb-4">
              顧客が店舗と<br />直接つながるアプリ
            </h2>
            <p className="text-[#675d66] leading-relaxed mb-6">
              来店客が自分のスマホでボトル残量を確認し、クーポンを受け取り、
              複数店舗の利用状況を一元管理。<strong>キャスト経由ではなく、
              店舗と顧客が直接エンゲージメント</strong>する仕組み。
            </p>
            <FeatureList items={[
              "複数店舗のボトル残量を一覧で確認",
              "来店回数に応じたクーポン自動発行",
              "店舗ごとのランク（ブロンズ→ダイヤモンド）",
              "店舗から手動でクーポン発行 → 来店動機を作る",
            ]} />
          </div>
          <PhoneFrame caption="来店客アプリ（顧客のスマホ）">
            <MockCustomerApp />
          </PhoneFrame>
        </div>
      </section>

      {/* ═══ CAST SUPPORT ═══ */}
      <section className="px-8 py-20 bg-[#faf7f2] print:break-after-page">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <PhoneFrame caption="キャスト ホーム画面">
            <MockCastHome />
          </PhoneFrame>
          <div>
            <Badge text="キャスト支援 — 誰でも成果が出る" />
            <h2 className="text-3xl font-bold mt-3 mb-4">
              新人でもベテラン並みの<br />お客様対応ができる
            </h2>
            <p className="text-[#675d66] leading-relaxed mb-6">
              AIが今日連絡するお客様を毎朝選定し、テンプレートで文面を生成。
              さくらママAIが接客アドバイスまで。<strong>キャストの属人的スキルに
              依存しない「仕組み」で売上を上げる。</strong>
            </p>
            <FeatureList items={[
              "AIが来店間隔・誕生日・指名化チャンスを自動判定",
              "顧客名・話題・ボトル名が入ったLINEテンプレート",
              "銀座30年のさくらママAIに即座に相談",
              "接客データは全て店舗に蓄積（キャストの私物にならない）",
            ]} />
          </div>
        </div>
      </section>

      {/* ═══ SAKURA-MAMA AI ═══ */}
      <section className="px-8 py-20 bg-white print:break-after-page">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge text="AI アドバイザー" />
            <h2 className="text-3xl font-bold mt-3 mb-4">
              銀座30年の知見で<br />キャストを即戦力化
            </h2>
            <p className="text-[#675d66] leading-relaxed mb-6">
              顧客カルテを見ながら、具体的なLINE文面とアドバイスを提案。
              新人キャストも<strong>初日から的確なお客様対応</strong>ができる。
            </p>
            <FeatureList items={[
              "顧客のカテゴリ（VIP/常連/新規）に応じたトーン調整",
              "指名化の段階別戦略（3回目の壁の超え方）",
              "LINEスクショ → AIが読み取ってメモを自動更新",
              "音声入力対応 — 接客中も話すだけで相談",
            ]} />
          </div>
          <PhoneFrame caption="さくらママ AI チャット">
            <MockSakuraMama />
          </PhoneFrame>
        </div>
      </section>

      {/* ═══ DATA STAYS WITH THE STORE ═══ */}
      <section className="px-8 py-20 bg-[#faf7f2] print:break-after-page">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-sm text-[#c98d80] font-semibold mb-2">DATA CONTINUITY</p>
          <h2 className="text-3xl font-bold text-center mb-10">
            キャストが辞めても<br />顧客データは店舗に残る
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <BeforeAfter
              title="Before（今まで）"
              isDark
              items={[
                "顧客情報 → キャストの記憶の中",
                "LINE履歴 → キャストのスマホの中",
                "好み・NG → 口頭の引継ぎ（漏れる）",
                "キャスト退職 → 顧客も失う",
              ]}
            />
            <BeforeAfter
              title="After（NIGHTOS）"
              isDark={false}
              items={[
                "顧客情報 → 店舗のDBに蓄積",
                "接客メモ → カルテとして永続保存",
                "来店履歴 → 全て記録・分析可能",
                "キャスト退職 → 次の担当に即引継ぎ",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ═══ STORE DASHBOARD ═══ */}
      <section className="px-8 py-20 bg-white print:break-after-page">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <PhoneFrame caption="店舗ダッシュボード">
            <MockDashboard />
          </PhoneFrame>
          <div>
            <Badge text="経営可視化" />
            <h2 className="text-3xl font-bold mt-3 mb-4">
              顧客資産の状態が<br />数字で見える
            </h2>
            <p className="text-[#675d66] leading-relaxed mb-6">
              離脱リスク顧客、キャスト別の連絡達成率、顧客カテゴリの構成比。
              <strong>顧客資産の健康状態を定量的に把握</strong>し、先手の対策が打てる。
            </p>
            <FeatureList items={[
              "離脱リスク顧客をAIが自動検知",
              "キャスト別 ARPU・連絡達成率・指名数",
              "顧客カテゴリ構成（VIP/常連/新規の比率）",
              "トレンドグラフで推移を可視化",
            ]} />
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="px-8 py-20 bg-[#faf7f2] print:break-after-page">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">料金</h2>
          <div className="rounded-2xl bg-gradient-to-br from-[#f7f0de] to-[#f0e4cc] border border-[#c9a84c]/20 p-10">
            <div className="text-6xl font-bold" style={{ fontFamily: '"Cormorant Garamond", serif' }}>¥0</div>
            <div className="text-lg font-semibold mt-2">MVP 検証版 — 完全無料</div>
            <div className="text-sm text-[#675d66] mt-4 space-y-1">
              <p>✓ 全機能利用可能（AI込み）</p>
              <p>✓ 設備投資ゼロ（スマホだけ）</p>
              <p>✓ いつでも解約、データ削除OK</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="px-8 py-24 text-center bg-gradient-to-br from-[#9a7bbb]/10 to-[#c98d80]/10">
        <h2 className="text-3xl font-bold mb-3">
          顧客を店舗の資産に変え、<br />売上を上げませんか？
        </h2>
        <p className="text-[#675d66] mb-8">スマホで実際に動くデモをお見せします</p>
        <div className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-[#9a7bbb] to-[#c98d80] text-white font-semibold text-xl shadow-lg">
          デモを予約する <ArrowRight size={20} />
        </div>
      </section>
    </>
  );
}

// ═══════════════ Small components ═══════════════

function KPI({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold" style={{ fontFamily: '"Cormorant Garamond", serif' }}>{value}</div>
      <div className="text-xs text-[#675d66]">{label}</div>
      {sub && <div className="text-[10px] text-[#a39ba1]">{sub}</div>}
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return <div className="inline-block px-3 py-1 rounded-full bg-[#9a7bbb]/10 text-[#9a7bbb] text-xs font-semibold">{text}</div>;
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ProblemCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl bg-[#faf7f2] border border-gray-100 p-5 text-center">
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="font-bold text-base mb-2">{title}</h3>
      <p className="text-sm text-[#675d66] leading-relaxed">{desc}</p>
    </div>
  );
}

function SolutionCard({ icon, color, number, title, desc }: { icon: React.ReactNode; color: string; number: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: color }}>{number}</div>
        <h3 className="font-bold">{title}</h3>
      </div>
      <p className="text-sm text-[#675d66] leading-relaxed">{desc}</p>
    </div>
  );
}

function BeforeAfter({ title, isDark, items }: { title: string; isDark: boolean; items: string[] }) {
  return (
    <div className={`rounded-xl p-6 ${isDark ? "bg-[#f0e8e0]" : "bg-gradient-to-br from-[#f7f0de] to-[#f0e4cc] border border-[#c9a84c]/20"}`}>
      <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-[#a08060]" : "text-[#a08050]"}`}>{isDark ? "😓" : "🌟"} {title}</h3>
      <ul className="space-y-2.5 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className={isDark ? "text-[#c98d80]" : "text-emerald-500"}>{isDark ? "✕" : "✓"}</span>
            <span className={isDark ? "text-[#675d66]" : "text-[#2b232a] font-medium"}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ═══════════════ Phone screen mocks ═══════════════

function MockCustomerApp() {
  return (
    <div className="px-3">
      <div className="text-[11px] font-bold mb-0.5">田中 太郎さん</div>
      <div className="text-[8px] text-[#675d66] mb-2">3店舗を利用中</div>
      <div className="flex gap-1.5 mb-2">
        <MiniStat label="ボトル" value="5" unit="本" color="#c98d80" />
        <MiniStat label="来店" value="20" unit="回" />
        <MiniStat label="クーポン" value="5" unit="枚" color="#9a7bbb" />
      </div>
      <div className="text-[8px] font-bold mb-1">ご利用店舗</div>
      {[
        { name: "CLUB NIGHTOS 銀座本店", rank: "🥇 ゴールド", bottles: 2 },
        { name: "Lounge ÉTOILE 六本木", rank: "🥈 シルバー", bottles: 2 },
        { name: "BAR VELVET 赤坂", rank: "🥉 ブロンズ", bottles: 1 },
      ].map((s) => (
        <div key={s.name} className="rounded-lg border border-gray-100 p-2 mb-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold">{s.name}</span>
            <span className="text-[7px] px-1 py-0.5 rounded bg-[#c9a84c]/10 text-[#a08050]">{s.rank}</span>
          </div>
          <div className="text-[8px] text-[#675d66]">🍾 {s.bottles}本キープ中</div>
        </div>
      ))}
      <div className="rounded-lg bg-[#f7f0de] border border-[#c9a84c]/20 p-2 mt-1">
        <div className="text-[8px] font-bold text-[#a08050]">🎫 使えるクーポン</div>
        <div className="text-[8px] text-[#675d66]">🍸 ドリンク1杯サービス</div>
      </div>
    </div>
  );
}

function MockCastHome() {
  return (
    <div className="px-3">
      <div className="text-[11px] font-bold mb-1">おはようございます、あかりさん</div>
      <div className="flex gap-1.5 mb-2">
        <MiniStat label="指名" value="18" unit="本" color="#c98d80" />
        <MiniStat label="リピート" value="72" unit="%" color="#c98d80" />
        <MiniStat label="連絡が必要" value="7" unit="人" color="#9a7bbb" />
      </div>
      <div className="rounded-lg bg-gradient-to-r from-[#9a7bbb] to-[#6e4f8f] text-white p-2.5 mb-2">
        <div className="text-[8px] opacity-80">✨ 今朝のさくらママから</div>
        <div className="text-[9px] mt-1">あかりさん、今日は山本さんを最優先で。ドンペリの残りが2杯だから...</div>
      </div>
      <div className="text-[9px] font-bold mb-1">今日連絡するお客様</div>
      {[
        { name: "山本 隆", reason: "🎂 誕生日間近", tag: "VIP" },
        { name: "田中 太郎", reason: "📅 来店間隔空き", tag: "VIP" },
        { name: "高橋 誠", reason: "✨ 指名化チャンス", tag: "新規" },
      ].map((c) => (
        <div key={c.name} className="rounded-lg border border-gray-100 p-2 mb-1.5">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold">{c.name}</span>
            <span className="text-[7px] px-1 py-0.5 rounded bg-[#c98d80]/10 text-[#c98d80]">{c.tag}</span>
          </div>
          <div className="text-[8px] text-[#9a7bbb]">{c.reason}</div>
          <div className="flex gap-1 mt-1">
            <span className="text-[7px] px-1.5 py-0.5 rounded-full border border-gray-200 text-[#675d66]">✓ 未連絡</span>
            <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-[#c98d80]/10 text-[#c98d80]">テンプレ</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockSakuraMama() {
  return (
    <div className="px-3">
      <div className="rounded-t-lg bg-gradient-to-r from-[#9a7bbb] to-[#6e4f8f] text-white p-2 text-center">
        <div className="text-[10px] font-bold">さくらママ</div>
        <div className="text-[7px] opacity-80">銀座30年の経験者</div>
      </div>
      <div className="mt-2 flex gap-1.5">
        <div className="w-5 h-5 rounded-full bg-[#c98d80] shrink-0" />
        <div className="rounded-lg bg-gray-50 border border-gray-100 p-2 text-[8px]">
          下から相談したいことを選んでね🌸
        </div>
      </div>
      <div className="mt-2 space-y-1.5">
        {["💬 LINEで連絡したい", "✨ 接客中で困っている", "📈 営業戦略の相談"].map((label) => (
          <div key={label} className="rounded-lg border border-[#9a7bbb]/20 bg-white p-2 flex items-center justify-between">
            <span className="text-[9px] font-medium">{label}</span>
            <span className="text-[8px] text-gray-400">›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockDashboard() {
  return (
    <div className="px-3">
      <div className="text-[11px] font-bold mb-2">効果ダッシュボード</div>
      <div className="flex gap-1.5 mb-2">
        <MiniStat label="月間指名" value="32" unit="本" color="#c98d80" />
        <MiniStat label="月間売上" value="326" unit="万" />
      </div>
      <div className="rounded-lg border border-[#f59e0b]/20 bg-[#f59e0b]/5 p-2 mb-2">
        <div className="text-[8px] font-bold text-[#f59e0b]">⚠️ 離脱リスク顧客 — 3人</div>
        <div className="text-[7px] text-[#675d66] mt-1">山本隆(35日) / 木村亮介(42日)</div>
      </div>
      <div className="text-[8px] font-bold mb-1">指名数の推移</div>
      <div className="flex items-end gap-0.5 h-10 mb-2">
        {[3,2,1,2,0,2,3,2,1,0,2,1,3,2].map((v,i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-[#c98d80] to-[#d9a99e]" style={{height: `${(v/3)*100}%`}} />
        ))}
      </div>
      <div className="text-[8px] font-bold mb-1">キャスト別成績</div>
      <div className="text-[7px] space-y-1">
        <div className="flex justify-between"><span>📈 あかり</span><span>指名18 / ARPU¥460K</span></div>
        <div className="flex justify-between"><span>ゆき</span><span>指名32 / ARPU¥540K</span></div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, unit, color }: { label: string; value: string; unit?: string; color?: string }) {
  return (
    <div className="flex-1 rounded-lg bg-gray-50 border border-gray-100 p-1.5 text-center">
      <div className="text-[7px] text-gray-400">{label}</div>
      <div className="text-[12px] font-bold" style={{ color: color ?? "#2b232a", fontFamily: '"Cormorant Garamond", serif' }}>{value}<span className="text-[7px] text-gray-400">{unit}</span></div>
    </div>
  );
}
