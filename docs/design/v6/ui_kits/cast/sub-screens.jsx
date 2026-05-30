// ════════════════════════════════════════════════════════════════
// NIGHTOS Cast UI Kit — Sub-screens
// CustomerDetailScreen, SakuraMamaScreen, TemplatesScreen
// All loaded after cast-home.jsx — share its window globals.
// ════════════════════════════════════════════════════════════════

function ScreenHeader({ title, onBack, right }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: 'rgba(253,252,249,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--line)',
      padding: '56px 18px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <button onClick={onBack} aria-label="戻る" style={{
        width: 32, height: 32, borderRadius: 999, border: 'none',
        background: 'transparent', color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}>
        <Icon d={<><line x1="20" y1="12" x2="4" y2="12"/><polyline points="11 19 4 12 11 5"/></>} size={20} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ font: '500 18px/1.2 var(--font-serif)', letterSpacing: '0.02em', color: C.ink, margin: 0 }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CustomerDetailScreen
// ─────────────────────────────────────────────────────────────
function CustomerDetailScreen({ customer, onBack }) {
  const [memo, setMemo] = React.useState(customer.personalMemo);
  return (
    <>
      <ScreenHeader title={customer.name + ' さん'} onBack={onBack} right={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 11px', borderRadius: 999,
          border: `1px solid ${C.gold}`, color: C.goldDeep,
          font: `400 11px/1 ${C.display}`, letterSpacing: '0.1em',
        }}><Icon d={I.star} size={10} /> VIP</span>
      } />
      <div style={{ padding: '14px 18px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Avatar + meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, border: `2px solid ${C.gold}`, background: C.chamSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.goldDeep, font: `300 28px/1 ${C.display}` }}>
            {customer.name[0]}
          </div>
          <div>
            <div style={{ font: '400 11px/1 var(--font-sans)', letterSpacing: '0.18em', color: C.rgDeep }}>{customer.job}</div>
            <div style={{ font: '500 22px/1.2 var(--font-serif)', color: C.ink, marginTop: 4 }}>{customer.name}</div>
            <div style={{ font: '400 12px/1.5 var(--font-sans)', color: C.inkSoft, marginTop: 2 }}>
              来店 {customer.visits} 回 · 累計 ¥{customer.totalSpend}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <StatCard label="前回来店" value={customer.daysSinceVisit} unit="日前" icon={I.clock} accent="rose" />
          <StatCard label="ボトル残" value={customer.bottleRemaining} unit="杯" icon={I.wine} accent="gold" />
        </div>

        {/* StoreInfo (beige, view-only) */}
        <section style={{ borderRadius: 22, padding: '14px 16px', background: '#f5ede0', border: '1px solid #d9c7a8' }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h3 style={{ font: '600 13px/1 var(--font-sans)', color: C.ink, margin: 0 }}>店舗からの共有情報</h3>
            <span style={{ font: '500 10px/1 var(--font-sans)', padding: '3px 10px', borderRadius: 999, background: '#ebdcc2', color: C.inkSoft }}>閲覧のみ</span>
          </header>
          <div style={{ font: '400 13px/1.7 var(--font-sans)', color: C.ink }}>
            {customer.storeInfo}
          </div>
        </section>

        {/* MemoCard (dashed rose-gold, editable) */}
        <section style={{
          borderRadius: 18, padding: '14px 16px',
          background: 'linear-gradient(180deg, rgba(243,216,200,0.30) 0%, rgba(243,216,200,0.10) 100%)',
          border: `1.5px dashed ${C.rgDeep}`,
        }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h3 style={{ font: '600 13px/1 var(--font-sans)', color: C.ink, margin: 0 }}>個人メモ</h3>
            <span style={{ font: '500 10px/1 var(--font-sans)', padding: '3px 10px', borderRadius: 999, background: C.rgSoft, color: C.rgDeep }}>編集OK</span>
          </header>
          <textarea
            value={memo} onChange={e => setMemo(e.target.value)}
            style={{
              width: '100%', minHeight: 80, padding: 10, borderRadius: 12,
              background: 'rgba(255,255,255,0.5)', border: '1px dashed rgba(168,117,96,0.3)',
              font: '400 14px/1.6 var(--font-sans)', color: C.ink, outline: 'none', resize: 'none',
              boxSizing: 'border-box',
            }}
          />
        </section>

        {/* Last topic */}
        <section style={{ borderRadius: 22, padding: 16, background: C.pearlLight, border: '1px solid var(--line)', boxShadow: C.shSoft }}>
          <div style={{ font: '500 11px/1 var(--font-sans)', letterSpacing: '0.18em', color: C.rgDeep, marginBottom: 8 }}>前回の会話</div>
          <div style={{ font: '400 14px/1.7 var(--font-sans)', color: C.ink }}>「{customer.lastTopic}」</div>
        </section>

        {/* CTA bar */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            flex: 1, height: 50, borderRadius: 999, border: '1px solid rgba(255,255,255,0.45)',
            background: C.metal, color: '#fdfcf9', textShadow: '0 1px 2px rgba(94,56,56,0.35)',
            font: '600 14px/1 var(--font-sans)', letterSpacing: '0.04em',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: C.shFloat, cursor: 'pointer',
          }}><Icon d={I.msg} size={14} /> LINE文面を作る</button>
          <button style={{
            height: 50, padding: '0 18px', borderRadius: 999,
            background: C.glassP, backdropFilter: 'blur(8px)',
            color: C.ink, border: `1px solid ${C.gold}`,
            font: '500 14px/1 var(--font-sans)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            cursor: 'pointer',
          }}><Icon d={I.sparkle} size={14} /></button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// SakuraMamaScreen — AI consult chat with header
// ─────────────────────────────────────────────────────────────
function SakuraMamaScreen({ onBack }) {
  const [messages] = React.useState([
    { role: 'mama', text: 'おかえりなさい、あかりさん。今夜はどんな相談かしら？' },
    { role: 'user', text: '田中さんに、明日のお礼の LINE 送りたいんですけど…' },
    { role: 'mama', text: 'いいわね。直近の会話で覚えてること教えてくれる？お酒の好みでも、最近の話題でも。' },
    { role: 'user', text: '山崎キープしてくれて、お子さんの受験の話してました' },
    { role: 'mama', text:
      'じゃあ、こんな文面どうかしら。\n\n「昨夜はキープありがとうございました。山崎、また残してくれて嬉しかったです。お子さんの面接、応援してるね。」\n\n＊ 山崎の話 → 翌日に触れる = 覚えてるサイン。\n＊ 受験は重い話題だから「応援」で軽く。' },
  ]);
  return (
    <>
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: C.metal,
        padding: '56px 18px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: C.shSoft,
      }}>
        <button onClick={onBack} style={{
          width: 32, height: 32, borderRadius: 999, border: 'none',
          background: 'rgba(255,255,255,0.2)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icon d={<><line x1="20" y1="12" x2="4" y2="12"/><polyline points="11 19 4 12 11 5"/></>} size={18} />
        </button>
        <div style={{ width: 40, height: 40, borderRadius: 999, border: '1px solid rgba(255,255,255,0.5)', overflow: 'hidden' }}>
          <img src="../../assets/ruri-mama-photo.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="さくらママ" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ font: '500 16px/1 var(--font-serif)', letterSpacing: '0.02em', color: '#fff', textShadow: '0 0 24px rgba(252,228,212,0.18), 0 1px 2px rgba(94,56,56,0.3)' }}>さくらママ</div>
          <div style={{ font: '400 11px/1.4 var(--font-sans)', color: 'rgba(255,255,255,0.85)' }}>銀座で 30 年・ラウンジ AI</div>
        </div>
      </div>

      <div style={{ padding: '16px 18px 120px', display: 'flex', flexDirection: 'column', gap: 12, background: C.pearl, minHeight: '100%' }}>
        {messages.map((m, i) => (
          m.role === 'mama' ? (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, maxWidth: '85%' }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, border: `1px solid ${C.gold}`, overflow: 'hidden', flexShrink: 0 }}>
                <img src="../../assets/ruri-mama-photo.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              </div>
              <div style={{
                background: C.pearlLight, border: '1px solid var(--line)', boxShadow: C.shSoft,
                borderRadius: '4px 18px 18px 18px', padding: '10px 14px',
                font: '400 14px/1.7 var(--font-sans)', color: C.ink, whiteSpace: 'pre-wrap',
              }}>{m.text}</div>
            </div>
          ) : (
            <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
              <div style={{
                background: C.metal, color: '#fdfcf9', textShadow: '0 1px 2px rgba(94,56,56,0.35)',
                border: '1px solid rgba(255,255,255,0.45)', boxShadow: C.shFloat,
                borderRadius: '18px 4px 18px 18px', padding: '10px 14px',
                font: '500 14px/1.6 var(--font-sans)',
              }}>{m.text}</div>
            </div>
          )
        ))}
      </div>

      {/* Composer */}
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 12, zIndex: 25,
        background: 'rgba(253,252,249,0.95)', backdropFilter: 'blur(12px)',
        border: '1px solid var(--pearl-soft)', borderRadius: 999,
        boxShadow: C.shLuxe, padding: 6,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <input placeholder="さくらママに聞いてみる…" style={{
          flex: 1, height: 40, padding: '0 14px', borderRadius: 999, border: 'none',
          background: 'transparent', color: C.ink, font: '400 14px/1.4 var(--font-sans)', outline: 'none',
        }} />
        <button style={{
          width: 40, height: 40, borderRadius: 999, border: 'none',
          background: C.metal, color: '#fff', boxShadow: C.shFloat,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icon d={I.send} size={16} />
        </button>
      </div>
    </>
  );
}

Object.assign(window, { ScreenHeader, CustomerDetailScreen, SakuraMamaScreen });
