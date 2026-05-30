// ════════════════════════════════════════════════════════════════
// NIGHTOS · /cast/home — Cast Home Screen
// 構成: Hero (Nocturne) → KPI x3 (glass) → さくらママ Entry → Follow Target List → FAB + TabBar
// ════════════════════════════════════════════════════════════════

// ─── Icons (Lucide-style, stroke 1.6) ───────────────────────────
const Icon = ({ d, size = 18, sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'block', flexShrink: 0 }}>
    {d}
  </svg>
);
const I = {
  cal:   <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
  user:  <><circle cx="12" cy="8" r="3.5"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></>,
  userPlus: <><circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-4 3.5-7 7-7s7 3 7 7"/><path d="M19 8v6M22 11h-6"/></>,
  home:  <><path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 21c0-3.5 3-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.5"/></>,
  msg:   <><path d="M21 11c0 4-4 7-9 7-1 0-2-.1-3-.4L4 19l1.5-3.5C4.6 14.3 4 12.7 4 11c0-4 4-7 8.5-7s8.5 3 8.5 7z"/></>,
  star:  <><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></>,
  cake:  <><path d="M4 11h16v9H4z"/><path d="M4 15c2 1 4 1 4 0s2 1 4 1 4-1 4-1 2 0 4 0"/><path d="M12 7v4M8 7v4M16 7v4"/><circle cx="8" cy="5" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="16" cy="5" r="1"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></>,
  crown: <><path d="M3 8l3 9h12l3-9-5 4-4-7-4 7-5-4z"/><path d="M6 20h12"/></>,
  sparkle: <><path d="M12 3l1.6 4.8L18 9.5l-4.4 1.7L12 16l-1.6-4.8L6 9.5l4.4-1.7z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></>,
  bell:  <><path d="M6 8a6 6 0 0 1 12 0c0 5 2 7 2 7H4s2-2 2-7z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
  chev:  <polyline points="9 18 15 12 9 6"/>,
  plus:  <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  arrow: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></>,
  flame: <><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 1 1 2 1 3-3z"/></>,
};

// ─── Hero — "Luxury Lady Night" recipe (light, design-preview-v3) ─
// 背景: rose-gold-soft 左上 + champagne-soft 右下 + pearl-light→pearl
// 見出し: rose-gold-metallic クリップ serif
function ScheduleLine({ time, venue, table, isLast }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 16,
      padding: '14px 0',
      borderBottom: isLast ? 'none' : '1px solid var(--line)',
    }}>
      <div style={{
        font: '400 26px/1 var(--font-display)',
        color: 'var(--rose-gold-deep)', letterSpacing: '0.02em',
        minWidth: 76, fontVariantNumeric: 'tabular-nums',
      }}>{time}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          font: '500 22px/1.25 var(--font-serif)',
          color: 'var(--ink)', letterSpacing: '0.02em',
        }}>{table}</div>
        {venue && (
          <div style={{
            marginTop: 3,
            font: '400 11.5px/1.3 var(--font-sans)',
            color: 'var(--ink-mute)', letterSpacing: '0.04em',
          }}>{venue}</div>
        )}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      padding: '60px 20px 60px',
      background:
        'radial-gradient(ellipse at top left, var(--rose-gold-soft) 0%, transparent 55%),' +
        'radial-gradient(ellipse at bottom right, var(--champagne-soft) 0%, transparent 60%),' +
        'linear-gradient(180deg, var(--pearl-light) 0%, var(--pearl) 100%)',
    }}>
      {/* Top row — eyebrow + bell */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{
            font: '500 11px/1 var(--font-sans)', letterSpacing: '0.18em',
            color: 'var(--rose-gold-deep)',
          }}>NIGHTOS</span>
          <span style={{
            font: '400 12px/1 var(--font-display)',
            color: 'var(--ink-mute)', letterSpacing: '0.08em',
          }}>5月20日 (火)</span>
        </div>
        <button style={{
          position: 'relative', width: 38, height: 38, borderRadius: 999,
          background: 'var(--glass-pearl)',
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          border: '1px solid var(--line)',
          color: 'var(--ink-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <Icon d={I.bell} size={17} />
          <span style={{
            position: 'absolute', top: 6, right: 7, width: 7, height: 7,
            borderRadius: 999, background: 'var(--rose-gold-deep)',
            border: '1.5px solid var(--pearl-light)',
          }} />
        </button>
      </div>

      {/* Metallic headline */}
      <h1 style={{
        margin: '0 0 4px',
        font: '500 36px/1.15 var(--font-serif)',
        letterSpacing: '0.02em',
        background: 'var(--rose-gold-metallic)',
        WebkitBackgroundClip: 'text', backgroundClip: 'text',
        color: 'transparent',
      }}>Tonight</h1>
      <p style={{
        margin: '0 0 14px',
        font: '400 13px/1.6 var(--font-sans)',
        color: 'var(--ink-soft)',
        maxWidth: '32ch',
      }}>今夜の予定は 2 軒。いってらっしゃい。</p>

      {/* Schedule */}
      <div>
        <ScheduleLine time="18:00" venue="六本木" table="同伴" />
        <ScheduleLine time="20:00" venue="銀座" table="出勤" isLast />
      </div>

      {/* CTAs — solid rose-gold-deep on light bg */}
      <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
        <button style={{
          flex: 1, height: 50, borderRadius: 999, border: 'none', cursor: 'pointer',
          background: 'var(--rose-gold-deep)',
          color: '#fdfcf9',
          font: '600 14px/1 var(--font-sans)', letterSpacing: '0.04em',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: 'var(--shadow-luxe)',
        }}>
          スケジュールを見る
          <Icon d={I.arrow} size={15} sw={1.8} />
        </button>
        <button style={{
          height: 50, padding: '0 22px', borderRadius: 999, cursor: 'pointer',
          background: 'var(--glass-pearl)',
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          color: 'var(--rose-gold-ink)',
          border: '1px solid var(--line-strong)',
          font: '500 14px/1 var(--font-sans)', letterSpacing: '0.04em',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>あとで</button>
      </div>
    </section>
  );
}

// ─── KPI Card (glass-pearl, backdrop-blur 16) ───────────────────
function KpiCard({ label, value, unit, sub, accent = 'rose' }) {
  const accents = {
    rose: 'var(--rose-gold-ink)',
    gold: 'var(--gold-deep)',
    wine: 'var(--wine-deep)',
  };
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      flex: 1, minWidth: 0,
      padding: '14px 14px 14px',
      borderRadius: 'var(--radius-2xl)',
      background: 'rgba(253, 248, 240, 0.72)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-soft)',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      {/* 上端 hairline — Stack タイル左リボンと呼応 */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 2,
        background: 'var(--rose-gold-metallic)',
        opacity: 0.55,
      }}/>
      <div style={{
        font: '500 10px/1 var(--font-sans)', letterSpacing: '0.16em',
        color: 'var(--ink-mute)', textTransform: 'none',
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, whiteSpace: 'nowrap' }}>
        <span style={{
          font: '400 34px/1 var(--font-display)',
          color: accents[accent], letterSpacing: '0.01em',
        }}>{value}</span>
        {unit && (
          <span style={{
            font: '400 12px/1 var(--font-sans)', color: 'var(--ink-soft)',
            paddingLeft: 1, whiteSpace: 'nowrap',
          }}>{unit}</span>
        )}
      </div>
      {sub && (
        <div style={{ font: '400 10.5px/1.3 var(--font-sans)', color: 'var(--ink-mute)' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function KpiRow() {
  return (
    <div style={{ display: 'flex', gap: 9 }}>
      <KpiCard label="今月の同伴" value="14" unit="件" sub="先月 +3" accent="rose" />
      <KpiCard label="今月の売上" value="24.8" unit="万円" sub="目標 30万" accent="gold" />
      <KpiCard label="新規" value="3" unit="名" sub="今週" accent="wine" />
    </div>
  );
}

// ─── さくらママ Entry Card — Option 01 "Pearl Glass · Wordmark" ──
// Hero と同じ pearl + rose-gold-soft + champagne-soft グラデ。
// 見出しは rose-gold-metallic クリップで主役級。
function SakuraMamaEntry() {
  return (
    <button style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      position: 'relative', overflow: 'hidden',
      padding: '22px',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--line)',
      background:
        'radial-gradient(ellipse at top left, var(--rose-gold-soft) 0%, transparent 55%),' +
        'radial-gradient(ellipse at bottom right, var(--champagne-soft) 0%, transparent 60%),' +
        'linear-gradient(180deg, var(--pearl-light) 0%, var(--pearl) 100%)',
      boxShadow: 'var(--shadow-warm)',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 999, overflow: 'hidden', flexShrink: 0,
          border: '1px solid rgba(184,148,85,0.35)',
          boxShadow: '0 6px 18px rgba(168,117,96,0.18), inset 0 0 0 1px rgba(255,255,255,0.6)',
        }}>
          <img src="assets/sakura-mama.jpg" alt="さくらママ"
               style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            font: '500 11px/1 var(--font-sans)', letterSpacing: '0.18em',
            color: 'var(--rose-gold-deep)', marginBottom: 6,
          }}>
            <Icon d={I.sparkle} size={11} sw={1.8}/>
            <span>AIアシスタント</span>
          </div>
          <div style={{
            font: '500 26px/1.15 var(--font-serif)',
            letterSpacing: '0.02em',
            background: 'var(--rose-gold-metallic)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            color: 'transparent',
          }}>さくらママ</div>
        </div>
        <span style={{
          font: '300 32px/1 var(--font-display)',
          color: 'var(--rose-gold-deep)',
        }}>›</span>
      </div>
      <p style={{
        margin: 0,
        font: '500 14.5px/1.75 var(--font-serif)',
        color: 'var(--ink)', letterSpacing: '0.01em',
      }}>
        銀座でラストの田中さんは、最近お疲れ気味。<br/>
        ボトルを早めに開けて、ゆっくり聞き役で。
      </p>
    </button>
  );
}

// ─── Follow Target — Section header ─────────────────────────────
// 左端に rose-gold-metallic の細リボン (Stack タイルと呼応)
function SectionHead({ title, sub, count }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '2px 2px 2px 14px',
      position: 'relative',
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 4, bottom: 4, width: 3,
        borderRadius: 2,
        background: 'var(--rose-gold-metallic)',
      }}/>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h2 style={{
          margin: 0, font: '500 19px/1.3 var(--font-serif)',
          letterSpacing: '0.02em', color: 'var(--ink)',
        }}>{title}</h2>
        {count != null && (
          <span style={{
            font: '400 18px/1 var(--font-display)',
            color: 'var(--rose-gold-deep)', letterSpacing: '0.04em',
          }}>{count}</span>
        )}
      </div>
      {sub && (
        <span style={{
          font: '500 10px/1 var(--font-sans)', letterSpacing: '0.18em',
          color: 'var(--ink-mute)', textTransform: 'uppercase',
        }}>{sub}</span>
      )}
    </div>
  );
}

// ─── Follow Target — Badges ─────────────────────────────────────
function Badge({ kind }) {
  const map = {
    vip:      { text: 'VIP',      icon: I.crown,
                bg: 'transparent', color: 'var(--gold-deep)',
                border: '1px solid var(--gold)' },
    birthday: { text: '誕生日',    icon: I.cake,
                bg: '#f5dcd8', color: 'var(--wine-deep)',
                border: '1px solid rgba(154,93,93,0.25)' },
    interval: { text: '間隔空き',  icon: I.clock,
                bg: 'var(--pearl-soft)', color: 'var(--ink-soft)',
                border: '1px solid var(--line-strong)' },
    hot:      { text: '指名化',    icon: I.flame,
                bg: 'rgba(184,148,85,0.16)', color: 'var(--gold-deep)',
                border: '1px solid rgba(184,148,85,0.3)' },
  };
  const m = map[kind];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px 3px 7px', borderRadius: 999,
      background: m.bg, color: m.color, border: m.border,
      font: '500 10px/1.2 var(--font-sans)', letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      <Icon d={m.icon} size={11} sw={1.7}/> {m.text}
    </span>
  );
}

// ─── Follow Target — Priority Stack (Glass tiles) ───────────────
// 1人 = 1枚の glass-pearl タイル。左端の rose-gold-metallic リボンで
// 優先度を視覚化。上位 (rank ≤ 2) は濃く + shadow-warm、下位は淡く。
function FollowTargetCard({ name, meta, badges, initial, rank }) {
  const isTop = rank <= 2;
  const opacities = [1, 0.95, 0.9, 0.85, 0.82];
  const opacity = opacities[Math.min(rank - 1, opacities.length - 1)];
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      padding: '13px 14px 13px 20px',
      borderRadius: 'var(--radius-card)',
      background: `rgba(253, 248, 240, ${0.55 * opacity + 0.2})`,
      backdropFilter: 'blur(14px) saturate(140%)',
      WebkitBackdropFilter: 'blur(14px) saturate(140%)',
      border: '1px solid var(--line)',
      boxShadow: isTop ? 'var(--shadow-warm)' : 'var(--shadow-soft)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {/* 優先度リボン (左端) */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: isTop
          ? 'var(--rose-gold-metallic)'
          : 'linear-gradient(180deg, var(--rose-gold-soft), var(--champagne-soft))',
      }}/>

      {/* Avatar (initial) */}
      <div style={{
        width: 40, height: 40, borderRadius: 999, flexShrink: 0,
        background: 'var(--champagne-metallic)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        font: '500 16px/1 var(--font-serif)',
        color: 'var(--ink)', letterSpacing: '0.02em',
        border: '1px solid rgba(255,255,255,0.7)',
        boxShadow: 'inset 0 0 0 1px rgba(168,117,96,0.18)',
      }}>{initial}</div>

      {/* Name + badges + meta */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            font: '500 15.5px/1.2 var(--font-serif)', color: 'var(--ink)',
            letterSpacing: '0.01em',
          }}>{name}</span>
          {badges.map(b => <Badge key={b} kind={b}/>)}
        </div>
        <div style={{
          font: '400 11px/1.35 var(--font-sans)', color: 'var(--ink-soft)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{meta}</div>
      </div>

      {/* CTA — outline pill, rose-gold-deep */}
      <button style={{
        flexShrink: 0, height: 34, padding: '0 13px', borderRadius: 999,
        background: 'transparent',
        color: 'var(--rose-gold-deep)',
        border: '1px solid var(--rose-gold-deep)',
        cursor: 'pointer',
        font: '600 12px/1 var(--font-sans)', letterSpacing: '0.04em',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>連絡</button>
    </div>
  );
}

function FollowTargetList({ targets }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {targets.map((t, i) => (
        <FollowTargetCard key={t.name} {...t} rank={i + 1} />
      ))}
    </div>
  );
}

// ─── FAB (rose-gold-deep solid + shadow-luxe) ───────────────────
function FAB() {
  return (
    <button style={{
      position: 'absolute', right: 18, bottom: 96, zIndex: 30,
      width: 60, height: 60, borderRadius: 999,
      background: 'var(--rose-gold-deep)',
      color: '#fdfcf9',
      border: '1px solid rgba(255,255,255,0.18)',
      boxShadow: 'var(--shadow-luxe)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }} aria-label="新規顧客追加">
      <Icon d={I.userPlus} size={24} sw={1.8}/>
    </button>
  );
}

// ─── Bottom Tab Bar (5 tabs, gold underline indicator) ──────────
function TabBar({ active = 'home' }) {
  const tabs = [
    { key: 'home',  label: 'ホーム',     icon: I.home },
    { key: 'cust',  label: '顧客',       icon: I.users },
    { key: 'mama',  label: 'さくらママ', icon: I.sparkle },
    { key: 'chat',  label: 'チャット',   icon: I.msg },
    { key: 'sched', label: '予定',       icon: I.cal },
  ];
  return (
    <nav style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 25,
      paddingBottom: 28, paddingTop: 8,
      background: 'rgba(253,248,240,0.78)',
      backdropFilter: 'blur(16px) saturate(160%)',
      WebkitBackdropFilter: 'blur(16px) saturate(160%)',
      borderTop: '1px solid var(--line)',
    }}>
      <div style={{ display: 'flex', padding: '0 4px' }}>
        {tabs.map(t => {
          const on = t.key === active;
          return (
            <button key={t.key} style={{
              flex: 1, padding: '8px 0 6px', border: 'none', background: 'transparent',
              cursor: 'pointer', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              color: on ? 'var(--rose-gold-deep)' : 'var(--ink-mute)',
            }}>
              <Icon d={t.icon} size={20} sw={on ? 1.8 : 1.5}/>
              <span style={{
                font: `${on ? 500 : 400} 10px/1 var(--font-sans)`,
                letterSpacing: '0.06em',
                color: on ? 'var(--ink)' : 'var(--ink-mute)',
              }}>{t.label}</span>
              {on && (
                <span aria-hidden style={{
                  position: 'absolute', top: -1,
                  width: 26, height: 2.5, borderRadius: 2,
                  background: 'var(--gold-metallic)',
                  boxShadow: '0 1px 4px rgba(184,148,85,0.5)',
                }}/>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Page composer ──────────────────────────────────────────────
function CastHomeScreen() {
  const targets = [
    { name: '田中 太郎', initial: '田', badges: ['vip', 'interval'],
      meta: '12日経過 · 山崎12年キープ · 同伴狙い' },
    { name: '渡辺 美咲', initial: '渡', badges: ['birthday'],
      meta: '来週火曜が誕生日 · モエ希望' },
    { name: '高橋 健',  initial: '高', badges: ['hot'],
      meta: '3回連続来店 · 響17年キープ' },
    { name: '佐藤 一郎', initial: '佐', badges: ['vip', 'birthday'],
      meta: '今週土曜 60歳 · 最終来店 11日前' },
    { name: '森田 玲子', initial: '森', badges: ['interval'],
      meta: '18日経過 · ボウモア残少 · 連絡軽め' },
  ];

  return (
    <div data-screen-label="01 Cast Home" style={{
      position: 'relative', minHeight: '100%',
      background: '#f1e9dd',
      paddingBottom: 110,
    }}>
      <Hero/>

      <main style={{
        padding: '0 20px',
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>
        {/* KPI カードを hero の上にオーバーラップさせ、シームをブリッジ */}
        <div style={{ marginTop: -34 }}><KpiRow/></div>

        <SakuraMamaEntry/>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionHead title="今日連絡したいお客様" count={`${targets.length} 名`}
                       sub="優先度順" />
          <FollowTargetList targets={targets}/>
        </section>
      </main>

      <FAB/>
      <TabBar active="home"/>
    </div>
  );
}

Object.assign(window, { CastHomeScreen });
