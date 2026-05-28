// ════════════════════════════════════════════════════════════════
// NIGHTOS · /cast/my — マイページ (プロフィール + 設定)
// 構成: Hero (centered avatar + name) → KPI ×3 → Menu cards ×4
//      → 支援 row → Logout → Footer
// ════════════════════════════════════════════════════════════════

const MyIcon = ({ d, size = 14, sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'block', flexShrink: 0 }}>
    {d}
  </svg>
);
const MyI = {
  edit:    <><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/></>,
  chev:    <polyline points="9 18 15 12 9 6"/>,
  user:    <><circle cx="12" cy="8" r="3.5"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></>,
  key:     <><circle cx="9" cy="14" r="4"/><path d="M13 14h8M17 14v3M20 14v4"/></>,
  bell:    <><path d="M6 8a6 6 0 0 1 12 0c0 5 2 7 2 7H4s2-2 2-7z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
  sparkle: <><path d="M12 3l1.6 4.8L18 9.5l-4.4 1.7L12 16l-1.6-4.8L6 9.5l4.4-1.7z"/></>,
  cpu:     <><rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/></>,
  store:   <><path d="M3 9l1.5-5h15L21 9"/><path d="M4 9h16v11H4z"/><path d="M9 20v-6h6v6"/></>,
  shifts:  <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4"/><circle cx="12" cy="14" r="2"/></>,
  helping: <><path d="M11 12l2-2 4 4-3 3-3-3"/><path d="M3 13l5-5 3 3"/><path d="M14 6l3-3 4 4-3 3"/></>,
  palette: <><circle cx="12" cy="12" r="9"/><circle cx="8" cy="9" r="1.2"/><circle cx="12" cy="7" r="1.2"/><circle cx="16" cy="9" r="1.2"/><circle cx="9" cy="14" r="1.2"/><path d="M12 21a2 2 0 0 1-2-2c0-2 2-2 2-4s-2-2-2-4"/></>,
  globe:   <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
  info:    <><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="17"/></>,
  msg:     <><path d="M21 11c0 4-4 7-9 7-1 0-2-.1-3-.4L4 19l1.5-3.5C4.6 14.3 4 12.7 4 11c0-4 4-7 8.5-7s8.5 3 8.5 7z"/></>,
  book:    <><path d="M4 5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 0-2 2V5z"/><path d="M20 21H6a2 2 0 0 1 0-4h14"/></>,
  logout:  <><path d="M9 21H4V3h5"/><polyline points="14 17 19 12 14 7"/><line x1="19" y1="12" x2="9" y2="12"/></>,
};

// ════════════════════════════════════════════════════════════════
// HERO PROFILE
// ════════════════════════════════════════════════════════════════
function Hero() {
  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      padding: '70px 20px 28px',
      textAlign: 'center',
      background:
        'radial-gradient(ellipse at top, var(--rose-gold-soft) 0%, transparent 55%),' +
        'linear-gradient(180deg, var(--champagne-soft) 0%, var(--pearl-warm) 100%)',
    }}>
      {/* bottom hairline */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, bottom: -1, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.55,
      }}/>

      {/* edit pen — top right */}
      <button aria-label="編集" style={{
        position: 'absolute', top: 56, right: 18,
        width: 32, height: 32, borderRadius: 999,
        background: 'var(--glass-pearl)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        border: '1px solid var(--line)',
        color: 'var(--ink-soft)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <MyIcon d={MyI.edit} size={15} sw={1.7}/>
      </button>

      {/* avatar 88 */}
      <div style={{
        width: 88, height: 88, borderRadius: 999,
        margin: '0 auto 16px',
        background: 'var(--champagne-metallic)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        font: '500 36px/1 var(--font-serif)',
        color: 'var(--ink)', letterSpacing: '0.02em',
        border: '2px solid rgba(240,226,200,0.9)',
        boxShadow:
          'inset 0 0 0 1px rgba(255,255,255,0.7), 0 6px 18px rgba(176,122,92,0.22)',
      }}>あ</div>

      {/* name row — 「あかり / Akari」横並び */}
      <div style={{
        display: 'inline-flex', alignItems: 'baseline', gap: 10,
      }}>
        <h1 style={{
          margin: 0,
          font: '500 24px/1.15 var(--font-serif)',
          letterSpacing: '0.04em', color: 'var(--ink)',
        }}>あかり</h1>
        <span aria-hidden style={{
          width: 1, height: 16,
          background: 'rgba(184,148,85,0.5)', alignSelf: 'center',
        }}/>
        <span style={{
          font: 'italic 400 20px/1 var(--font-display)',
          color: 'var(--rose-gold-ink)', letterSpacing: '0.04em',
        }}>Akari</span>
      </div>

      {/* store */}
      <div style={{
        marginTop: 10,
        font: '400 13px/1 var(--font-display)',
        color: 'var(--ink-soft)', letterSpacing: '0.08em',
      }}>Ginza Club Lumière</div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// KPI ROW
// ════════════════════════════════════════════════════════════════
function StatTile({ label, value, unit, prefix }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      flex: 1, minWidth: 0,
      padding: '12px 12px 12px',
      borderRadius: 'var(--radius-2xl)',
      background: 'rgba(255, 253, 248, 0.78)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-soft)',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 1.5,
        background: 'var(--gold-metallic)', opacity: 0.55,
      }}/>
      <div style={{
        font: '500 9.5px/1.2 var(--font-sans)', letterSpacing: '0.14em',
        color: 'var(--ink-mute)',
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        {prefix && (
          <span style={{
            font: '400 13px/1 var(--font-display)', color: 'var(--ink-soft)',
          }}>{prefix}</span>
        )}
        <span style={{
          font: '400 24px/1 var(--font-display)',
          color: 'var(--ink)', letterSpacing: '0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>{value}</span>
        {unit && (
          <span style={{
            font: '400 10.5px/1 var(--font-sans)',
            color: 'var(--ink-soft)', paddingLeft: 2,
          }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

function StatsRow() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <StatTile label="在籍" value="8" unit="ヶ月"/>
      <StatTile label="担当" value="24" unit="人"/>
      <StatTile label="今月売上" prefix="¥" value="820" unit="千"/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MENU CARDS
// ════════════════════════════════════════════════════════════════
function MenuCard({ title, rows }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 2px 0 14px', position: 'relative',
      }}>
        <span aria-hidden style={{
          position: 'absolute', left: 0, top: 3, bottom: 3, width: 3,
          borderRadius: 2,
          background: 'var(--gold-metallic)',
        }}/>
        <h2 style={{
          margin: 0, font: '500 13px/1 var(--font-sans)',
          letterSpacing: '0.18em', color: 'var(--ink-mute)',
          textTransform: 'uppercase',
        }}>{title}</h2>
      </div>

      <div style={{
        borderRadius: 18,
        background: 'rgba(255, 253, 248, 0.78)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-soft)',
        overflow: 'hidden',
      }}>
        {rows.map((r, i) => (
          <MenuRow key={r.label} {...r} isLast={i === rows.length - 1}/>
        ))}
      </div>
    </section>
  );
}

function MenuRow({ icon, label, right, isLast }) {
  return (
    <button style={{
      width: '100%', cursor: 'pointer', textAlign: 'left',
      background: 'transparent', border: 'none',
      padding: '14px 14px 14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: isLast ? 'none' : '1px solid rgba(42,31,26,0.06)',
    }}>
      <span style={{
        width: 30, height: 30, borderRadius: 999,
        background: 'var(--pearl-soft)',
        color: 'var(--ink-soft)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        border: '1px solid var(--line)',
      }}>
        <MyIcon d={icon} size={14} sw={1.6}/>
      </span>
      <span style={{
        flex: 1, minWidth: 0,
        font: '500 14px/1.3 var(--font-serif)', color: 'var(--ink)',
        letterSpacing: '0.02em',
      }}>{label}</span>
      {right}
      <span style={{ color: 'var(--ink-mute)', display: 'inline-flex' }}>
        <MyIcon d={MyI.chev} size={14} sw={1.7}/>
      </span>
    </button>
  );
}

// — right-side adornments —
function MamaAvatarMini() {
  return (
    <span style={{
      width: 24, height: 24, borderRadius: 999,
      background: 'var(--champagne-metallic)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      font: '500 10px/1 var(--font-serif)',
      color: 'var(--wine-deep)', letterSpacing: '0.02em',
      border: '1px solid rgba(240,226,200,0.6)',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)',
    }}>桜</span>
  );
}

function TokenUsage({ used, total }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{
        width: 60, height: 4, borderRadius: 999,
        background: 'var(--pearl-deep)', position: 'relative', overflow: 'hidden',
      }}>
        <span style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${(used / total) * 100}%`,
          background: 'var(--gold-metallic)',
        }}/>
      </span>
      <span style={{
        font: '400 12px/1 var(--font-display)',
        color: 'var(--ink-soft)', letterSpacing: '0.04em',
        fontVariantNumeric: 'tabular-nums',
      }}>{used}<span style={{ color: 'var(--ink-mute)' }}>/{total}</span></span>
    </div>
  );
}

function MetaPill({ children, tone }) {
  const tones = {
    rose: { c: 'var(--rose-gold-ink)', bg: 'rgba(176,122,92,0.10)', bd: 'rgba(138,94,77,0.28)' },
    mute: { c: 'var(--ink-soft)',      bg: 'var(--pearl-soft)',     bd: 'var(--line-strong)' },
  };
  const t = tones[tone || 'mute'];
  return (
    <span style={{
      padding: '3px 9px', borderRadius: 999,
      background: t.bg, color: t.c, border: `1px solid ${t.bd}`,
      font: '500 11px/1 var(--font-sans)', letterSpacing: '0.06em',
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

// ════════════════════════════════════════════════════════════════
// 支援 ROW (champagne-soft band)
// ════════════════════════════════════════════════════════════════
function SupportRow() {
  const Btn = ({ icon, label }) => (
    <button style={{
      flex: 1, height: 44, borderRadius: 999, cursor: 'pointer',
      background: 'rgba(253,248,240,0.85)',
      color: 'var(--ink)',
      border: '1px solid rgba(184,148,85,0.32)',
      font: '500 12.5px/1 var(--font-serif)', letterSpacing: '0.04em',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    }}>
      <span style={{ color: 'var(--gold-deep)', display: 'inline-flex' }}>
        <MyIcon d={icon} size={14} sw={1.7}/>
      </span>
      {label}
    </button>
  );
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      padding: 12,
      borderRadius: 'var(--radius-card)',
      background:
        'linear-gradient(135deg, var(--champagne-soft) 0%, rgba(245,232,210,0.55) 100%)',
      border: '1px solid rgba(184,148,85,0.28)',
      display: 'flex', gap: 8,
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.6,
      }}/>
      <Btn icon={MyI.msg}  label="ご意見・ご要望"/>
      <Btn icon={MyI.book} label="ヘルプセンター"/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// LOGOUT
// ════════════════════════════════════════════════════════════════
function LogoutBtn() {
  return (
    <button style={{
      width: '100%', height: 48, borderRadius: 999, cursor: 'pointer',
      background: 'transparent',
      color: 'var(--wine-soft)',
      border: '1px solid var(--wine-soft)',
      font: '600 13px/1 var(--font-sans)', letterSpacing: '0.16em',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      <MyIcon d={MyI.logout} size={14} sw={1.7}/>
      ログアウト
    </button>
  );
}

// ════════════════════════════════════════════════════════════════
// FOOTER
// ════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <div style={{
      textAlign: 'center', padding: '12px 0 4px',
      font: '500 9px/1.4 var(--font-sans)',
      color: 'var(--ink-mute)', letterSpacing: '0.28em',
    }}>
      NIGHTOS — CRAFTED IN TOKYO
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PAGE COMPOSER
// ════════════════════════════════════════════════════════════════
function MyPageScreen() {
  return (
    <div data-screen-label="01 My Page" style={{
      position: 'relative', minHeight: '100%',
      background: 'linear-gradient(180deg, #f3eadb 0%, #efe5d4 100%)',
      paddingBottom: 40,
    }}>
      <Hero/>

      <main style={{
        padding: '24px 20px 0',
        display: 'flex', flexDirection: 'column', gap: 22,
      }}>
        <StatsRow/>

        <MenuCard
          title="アカウント"
          rows={[
            { icon: MyI.user, label: 'プロフィール編集' },
            { icon: MyI.key,  label: 'パスワード変更' },
            { icon: MyI.bell, label: '通知設定',
              right: <MetaPill tone="rose">ON</MetaPill> },
          ]}
        />

        <MenuCard
          title="AI 設定"
          rows={[
            { icon: MyI.sparkle, label: 'さくらママのアバター',
              right: <MamaAvatarMini/> },
            { icon: MyI.cpu, label: 'トークン使用状況',
              right: <TokenUsage used={3} total={10}/> },
          ]}
        />

        <MenuCard
          title="店舗"
          rows={[
            { icon: MyI.store,   label: '店舗情報',
              right: <MetaPill>Lumière</MetaPill> },
            { icon: MyI.shifts,  label: 'シフトルール' },
            { icon: MyI.helping, label: 'ヘルプ依頼' },
          ]}
        />

        <MenuCard
          title="アプリ"
          rows={[
            { icon: MyI.palette, label: 'テーマ',
              right: <MetaPill tone="rose">Luxe</MetaPill> },
            { icon: MyI.globe,   label: '言語',
              right: <MetaPill>日本語</MetaPill> },
            { icon: MyI.info,    label: 'バージョン',
              right: <span style={{
                font: '400 12px/1 var(--font-display)',
                color: 'var(--ink-mute)', letterSpacing: '0.04em',
                fontVariantNumeric: 'tabular-nums',
              }}>v3.1.0</span> },
          ]}
        />

        <SupportRow/>

        <LogoutBtn/>

        <Footer/>
      </main>
    </div>
  );
}

Object.assign(window, { MyPageScreen });
