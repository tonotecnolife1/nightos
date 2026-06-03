// ════════════════════════════════════════════════════════════════
// NIGHTOS · /cast/home — v5 "Bordeaux Salon" (final, B-based)
//
// 上半分: wine-deep × nocturne の dark Hero (銀座のクラブのドアを
//         開けた瞬間)。CTA は champagne-gold メタリック (反転)。
//         さくらママカードもダークボルドー — Hero と地続き。
// 下半分: champagne-tinted pearl 地。KPI / Priority Stack。
//         明るく実務的、視認性高。
//
// 仕上げ要素 (variant B からの追加):
//   • Hero 上端に 1px champagne-gold エッジトリム
//   • 暖色 radial "banquette lamp" の点光源 2 つ (左上 / 右奥)
//   • Hero 下端 → 明色エリアへの "horizon" gold hairline で seam を
//     断ち切らず継ぐ
//   • Bell button が champagne-gold metallic ring (一段格上げ)
//   • TabBar を僅かに champagne 暖色側へ
//   • Section head ribbon を champagne-gold metallic に統一
//   • FAB に外周 1px champagne-gold ring (pearl 地での視認性)
//   • 日付の (金) を Cormorant italic、数値も部分 italic
// ════════════════════════════════════════════════════════════════

// ─── Gradients (local; tokens for v5) ───────────────────────────
const V5 = {
  champGold:    'linear-gradient(135deg, #EBD9A8 0%, #C8A672 50%, #8C6F44 100%)',
  champGoldSoft: 'linear-gradient(135deg, #F4E2B0 0%, #D8BC82 100%)',
  bordeaux:     'linear-gradient(135deg, #8E4C4C 0%, #5E3838 50%, #3A1F1F 100%)',
  wineMet:      'linear-gradient(135deg, #C18888 0%, #9A5D5D 50%, #5E3838 100%)',

  // Hero — banquette / wine cellar lighting
  heroBg:
    'radial-gradient(ellipse 70% 60% at 25% 15%, rgba(193,136,136,0.40) 0%, transparent 60%),' +  // top-left soft lamp
    'radial-gradient(ellipse 55% 50% at 85% 85%, rgba(140,111,68,0.30) 0%, transparent 60%),' +   // bottom-right warm pool
    'radial-gradient(ellipse 60% 60% at 100% 0%, rgba(154,93,93,0.40) 0%, transparent 55%),' +    // top-right wine wash
    'linear-gradient(180deg, #2D1818 0%, #1A0F0F 100%)',

  // Sakura Mama — same DNA, slightly cooler/darker for depth
  sakuraBg:
    'radial-gradient(ellipse 80% 70% at 20% 20%, rgba(154,93,93,0.45) 0%, transparent 60%),' +
    'radial-gradient(ellipse 60% 60% at 90% 90%, rgba(140,111,68,0.18) 0%, transparent 60%),' +
    'linear-gradient(135deg, #3A1F1F 0%, #5E3838 60%, #3A1F1F 100%)',

  // Page bg — champagne-tinted pearl to bridge dark hero
  pageBg: 'linear-gradient(180deg, #f3eadb 0%, #efe5d4 100%)',

  // Shadows
  shadowLuxe: '0 8px 20px rgba(45,24,24,0.55), 0 28px 56px rgba(20,10,10,0.45)',
  shadowWarm: '0 8px 24px rgba(94,56,56,0.14), 0 24px 48px rgba(140,111,68,0.10)',

  // Radii (couture)
  rCard: 20, r2xl: 22, rXl: 26,

  // Text on dark
  inkLight:   '#fdfcf9',
  inkLightSoft: 'rgba(253,252,249,0.72)',
  inkLightMute: 'rgba(253,252,249,0.55)',
};

// ─── Icons ──────────────────────────────────────────────────────
const IcoV5 = ({ d, size = 18, sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'block', flexShrink: 0 }}>{d}</svg>
);
const IK5 = {
  userPlus: <><circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-4 3.5-7 7-7s7 3 7 7"/><path d="M19 8v6M22 11h-6"/></>,
  home:  <><path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 21c0-3.5 3-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.5"/></>,
  msg:   <><path d="M21 11c0 4-4 7-9 7-1 0-2-.1-3-.4L4 19l1.5-3.5C4.6 14.3 4 12.7 4 11c0-4 4-7 8.5-7s8.5 3 8.5 7z"/></>,
  cake:  <><path d="M4 11h16v9H4z"/><path d="M4 15c2 1 4 1 4 0s2 1 4 1 4-1 4-1 2 0 4 0"/><path d="M12 7v4M8 7v4M16 7v4"/><circle cx="8" cy="5" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="16" cy="5" r="1"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></>,
  crown: <><path d="M3 8l3 9h12l3-9-5 4-4-7-4 7-5-4z"/><path d="M6 20h12"/></>,
  sparkle: <><path d="M12 3l1.6 4.8L18 9.5l-4.4 1.7L12 16l-1.6-4.8L6 9.5l4.4-1.7z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></>,
  bell:  <><path d="M6 8a6 6 0 0 1 12 0c0 5 2 7 2 7H4s2-2 2-7z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></>,
  cal:   <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
  arrow: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></>,
  flame: <><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 1 1 2 1 3-3z"/></>,
};

const CgV5 = ({ children }) => (
  <span style={{
    fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400,
  }}>{children}</span>
);

// ─── Schedule line (dark hero variant) ─────────────────────────
function V5Line({ time, table, venue, isLast }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 16,
      padding: '14px 0',
      borderBottom: isLast ? 'none' : '1px solid rgba(235,217,168,0.16)',
    }}>
      <div style={{
        font: '400 26px/1 var(--font-display)',
        color: '#EBD9A8', letterSpacing: '0.04em',
        minWidth: 76, fontVariantNumeric: 'tabular-nums',
      }}>{time}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          font: '500 22px/1.25 var(--font-serif)',
          color: V5.inkLight, letterSpacing: '0.02em',
        }}>{table}</div>
        {venue && (
          <div style={{
            marginTop: 3,
            font: '400 11.5px/1.3 var(--font-sans)',
            color: V5.inkLightMute, letterSpacing: '0.06em',
          }}>{venue}</div>
        )}
      </div>
    </div>
  );
}

// ─── Hero (dark Bordeaux Salon) ────────────────────────────────
function V5Hero({ bg = V5.heroBg, overlay = null }) {
  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      padding: '60px 20px 60px',
      background: bg,
    }}>
      {overlay}
      {/* Top edge trim — champagne-gold hairline (club door brass) */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 1,
        background:
          'linear-gradient(90deg, transparent 0%, rgba(235,217,168,0.55) 20%, rgba(235,217,168,0.55) 80%, transparent 100%)',
      }}/>

      {/* Top row */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{
            font: '500 11px/1 var(--font-sans)', letterSpacing: '0.32em',
            color: '#C8A672',
          }}>NIGHTOS</span>
          <span style={{
            font: '400 13px/1 var(--font-display)',
            color: V5.inkLightMute, letterSpacing: '0.06em',
          }}>
            <CgV5>5</CgV5>月<CgV5>23</CgV5>日 <span style={{ fontStyle: 'italic' }}>(金)</span>
          </span>
        </div>
        {/* Bell — champagne-gold metallic ring */}
        <button style={{
          position: 'relative', width: 38, height: 38, borderRadius: 999,
          background: 'rgba(255,255,255,0.06)',
          color: 'rgba(253,252,249,0.85)',
          border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <span aria-hidden style={{
            position: 'absolute', inset: 0, borderRadius: 999, padding: 1,
            background: V5.champGold,
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none',
          }}/>
          <IcoV5 d={IK5.bell} size={17}/>
          <span style={{
            position: 'absolute', top: 6, right: 7, width: 7, height: 7,
            borderRadius: 999, background: '#C8A672',
            border: '1.5px solid #2D1818',
          }}/>
        </button>
      </div>

      {/* Hero title — champagne-gold foil */}
      <h1 style={{
        position: 'relative',
        margin: '0 0 8px',
        font: '400 38px/1.1 var(--font-serif)',
        letterSpacing: '0.05em',
        background: V5.champGold,
        WebkitBackgroundClip: 'text', backgroundClip: 'text',
        color: 'transparent',
        filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.45))',
      }}>Tonight</h1>

      {/* Brass plate hairline — solid champagne-gold metallic */}
      <div aria-hidden style={{
        width: '32ch', maxWidth: '60%', height: 1,
        background: V5.champGold, opacity: 0.85,
        marginBottom: 14,
      }}/>

      <p style={{
        position: 'relative', margin: '0 0 14px',
        font: '400 13px/1.7 var(--font-sans)',
        color: V5.inkLightSoft, maxWidth: '32ch', letterSpacing: '0.02em',
      }}>今夜の予定は <CgV5>2</CgV5> 軒。いってらっしゃい。</p>

      <div style={{ position: 'relative' }}>
        <V5Line time="18:00" venue="六本木" table="同伴"/>
        <V5Line time="20:00" venue="銀座" table="出勤" isLast/>
      </div>

      {/* CTAs — champagne-gold solid (primary inverted on dark) + ghost */}
      <div style={{ position: 'relative', marginTop: 22, display: 'flex', gap: 10 }}>
        <button style={{
          flex: 1, height: 50, borderRadius: 999, cursor: 'pointer',
          background: V5.champGold, color: '#2D1818',
          border: '1px solid rgba(0,0,0,0.12)',
          font: '600 14px/1 var(--font-sans)', letterSpacing: '0.08em',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: V5.shadowLuxe,
        }}>
          スケジュールを見る
          <IcoV5 d={IK5.arrow} size={15} sw={1.8}/>
        </button>
        <button style={{
          height: 50, padding: '0 22px', borderRadius: 999, cursor: 'pointer',
          background: 'rgba(255,255,255,0.06)',
          color: '#EBD9A8',
          border: '1px solid rgba(235,217,168,0.45)',
          font: '500 14px/1 var(--font-sans)', letterSpacing: '0.06em',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>あとで</button>
      </div>

      {/* Horizon hairline — bottom of hero, continuing into light area */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 1,
        background:
          'linear-gradient(90deg, transparent 0%, rgba(235,217,168,0.45) 15%, rgba(235,217,168,0.45) 85%, transparent 100%)',
      }}/>
    </section>
  );
}

// ─── KPI (pearl glass tile on light page bg) ───────────────────
function V5Kpi({ label, value, unit, sub, accent }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      flex: 1, minWidth: 0,
      padding: '14px 14px',
      borderRadius: V5.r2xl,
      background: 'rgba(253, 248, 240, 0.82)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      border: '1px solid var(--line)',
      boxShadow: '0 4px 12px rgba(94,56,56,0.10), 0 16px 32px rgba(58,31,31,0.08)',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      {/* champagne-gold hairline top */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 2,
        background: V5.champGold, opacity: 0.70,
      }}/>
      <div style={{
        font: '500 10px/1 var(--font-sans)', letterSpacing: '0.20em',
        color: 'var(--ink-mute)',
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, whiteSpace: 'nowrap' }}>
        <span style={{
          font: '400 34px/1 var(--font-display)',
          color: accent, letterSpacing: '0.02em',
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

function V5KpiRow() {
  return (
    <div style={{ display: 'flex', gap: 9 }}>
      <V5Kpi label="今月の同伴" value="14"   unit="件"   sub="先月 +3"   accent="var(--wine)"/>
      <V5Kpi label="今月の売上" value="24.8" unit="万円" sub="目標 30万" accent="var(--gold-deep)"/>
      <V5Kpi label="新規"      value="3"    unit="名"   sub="今週"     accent="var(--wine-deep)"/>
    </div>
  );
}

// ─── Sakura Mama — dark bordeaux salon ─────────────────────────
function V5SakuraMama() {
  return (
    <button style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      position: 'relative', overflow: 'hidden',
      padding: 22,
      borderRadius: V5.rXl,
      border: '1px solid rgba(235,217,168,0.25)',
      background: V5.sakuraBg,
      boxShadow: V5.shadowLuxe,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* top brass edge */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 1,
        background:
          'linear-gradient(90deg, transparent 0%, rgba(235,217,168,0.50) 15%, rgba(235,217,168,0.50) 85%, transparent 100%)',
      }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* avatar — champagne-gold metallic frame */}
        <div style={{
          width: 56, height: 56, borderRadius: 999, padding: 2, flexShrink: 0,
          background: V5.champGold,
          boxShadow: '0 6px 18px rgba(140,111,68,0.30)',
        }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: 999, overflow: 'hidden',
            border: '1px solid #3A1F1F',
          }}>
            <img src={window.__resources?.sakuraMama || "assets/sakura-mama.jpg"} alt="さくらママ"
                 style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            font: '500 11px/1 var(--font-sans)', letterSpacing: '0.32em',
            color: '#C8A672', marginBottom: 6,
          }}>
            <IcoV5 d={IK5.sparkle} size={11} sw={1.8}/>
            <span>AIアシスタント</span>
          </div>
          <div style={{
            font: '400 26px/1.15 var(--font-serif)',
            letterSpacing: '0.05em',
            background: V5.champGold,
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.45))',
          }}>さくらママ</div>
        </div>
        <span style={{ font: '300 32px/1 var(--font-display)', color: '#EBD9A8' }}>›</span>
      </div>
      <p style={{
        margin: 0,
        font: '500 14.5px/1.75 var(--font-serif)',
        color: V5.inkLight, letterSpacing: '0.02em',
      }}>
        銀座でラストの田中さんは、最近お疲れ気味。<br/>
        ボトルを早めに開けて、ゆっくり聞き役で。
      </p>
    </button>
  );
}

// ─── Section head ──────────────────────────────────────────────
function V5SectionHead({ title, sub, count }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '2px 2px 2px 14px', position: 'relative',
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 4, bottom: 4, width: 3,
        borderRadius: 2, background: V5.champGold,
      }}/>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h2 style={{
          margin: 0, font: '500 19px/1.3 var(--font-serif)',
          letterSpacing: '0.04em', color: 'var(--ink)',
        }}>{title}</h2>
        {count != null && (
          <span style={{
            font: '400 18px/1 var(--font-display)',
            color: 'var(--wine-deep)', letterSpacing: '0.04em',
          }}>{count}</span>
        )}
      </div>
      {sub && (
        <span style={{
          font: '500 10px/1 var(--font-sans)', letterSpacing: '0.32em',
          color: 'var(--ink-mute)', textTransform: 'uppercase',
        }}>{sub}</span>
      )}
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────────
function V5Badge({ kind }) {
  const map = {
    vip:      { text: 'VIP',     icon: IK5.crown,
                metallic: V5.champGold, color: 'var(--gold-deep)' },
    birthday: { text: '誕生日',  icon: IK5.cake,
                bg: 'var(--wine-soft)', color: 'var(--wine-deep)',
                border: '1px solid rgba(94,56,56,0.18)' },
    interval: { text: '間隔空き', icon: IK5.clock,
                bg: 'var(--pearl-soft)', color: 'var(--ink-soft)',
                border: '1px solid var(--line-strong)' },
    hot:      { text: '指名化',  icon: IK5.flame,
                bg: 'rgba(184,148,85,0.16)', color: 'var(--gold-deep)',
                border: '1px solid rgba(184,148,85,0.3)' },
    work:     { text: '同伴',    icon: IK5.briefcase,
                bg: 'var(--wine-deep)', color: 'var(--pearl-light)',
                border: '1px solid rgba(255,255,255,0.10)' },
  };
  const m = map[kind];
  if (kind === 'vip') {
    return (
      <span style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 9px 3px 7px', borderRadius: 999,
        background: 'transparent', color: m.color,
        font: '500 10px/1.2 var(--font-sans)', letterSpacing: '0.06em', whiteSpace: 'nowrap',
      }}>
        <span aria-hidden style={{
          position: 'absolute', inset: 0, borderRadius: 999, padding: 1,
          background: m.metallic,
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none',
        }}/>
        <IcoV5 d={m.icon} size={11} sw={1.7}/> {m.text}
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px 3px 7px', borderRadius: 999,
      background: m.bg, color: m.color, border: m.border,
      font: '500 10px/1.2 var(--font-sans)', letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>
      <IcoV5 d={m.icon} size={11} sw={1.7}/> {m.text}
    </span>
  );
}

// ─── Priority tile ─────────────────────────────────────────────
function V5FollowCard({ name, meta, badges, initial, rank }) {
  const isTop = rank <= 2;
  const opacities = [1, 0.95, 0.9, 0.85, 0.82];
  const opacity = opacities[Math.min(rank - 1, opacities.length - 1)];
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      padding: '13px 14px 13px 20px',
      borderRadius: V5.rCard,
      background: `rgba(253, 248, 240, ${0.55 * opacity + 0.2})`,
      backdropFilter: 'blur(14px) saturate(140%)',
      WebkitBackdropFilter: 'blur(14px) saturate(140%)',
      border: '1px solid var(--line)',
      boxShadow: isTop ? V5.shadowWarm : 'var(--shadow-soft)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: isTop
          ? V5.champGold
          : 'linear-gradient(180deg, rgba(212,168,168,0.45), rgba(232,210,170,0.55))',
      }}/>
      <div style={{
        width: 40, height: 40, borderRadius: 999, flexShrink: 0,
        padding: 1.5, background: V5.champGold,
      }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: 999,
          background: 'var(--pearl-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          font: '400 16px/1 var(--font-serif)',
          color: 'var(--ink)', letterSpacing: '0.04em',
        }}>{initial}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            font: '500 15.5px/1.2 var(--font-serif)', color: 'var(--ink)',
            letterSpacing: '0.02em',
          }}>{name}</span>
          {badges.map(b => <V5Badge key={b} kind={b}/>)}
        </div>
        <div style={{
          font: '400 11px/1.35 var(--font-sans)', color: 'var(--ink-soft)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{meta}</div>
      </div>
      <button style={{
        flexShrink: 0, height: 34, padding: '0 13px', borderRadius: 999,
        background: 'transparent',
        color: 'var(--wine-deep)',
        border: '1px solid var(--wine-deep)',
        cursor: 'pointer',
        font: '600 12px/1 var(--font-sans)', letterSpacing: '0.06em',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>連絡</button>
    </div>
  );
}

// ─── FAB — wine-deep solid + champagne-gold outer ring ─────────
function V5FAB() {
  return (
    <button aria-label="新規顧客追加" style={{
      position: 'absolute', right: 18, bottom: 96, zIndex: 30,
      width: 60, height: 60, borderRadius: 999,
      background: 'var(--wine-deep)',
      color: 'var(--pearl-light)',
      border: 'none',
      boxShadow:
        '0 0 0 1px rgba(235,217,168,0.65), ' +
        '0 0 0 4px var(--wine-deep), ' +
        '0 0 0 5px rgba(235,217,168,0.40), ' +
        V5.shadowLuxe,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}>
      <IcoV5 d={IK5.userPlus} size={24} sw={1.8}/>
    </button>
  );
}

// ─── TabBar — champagne-warm pearl + gold underline ────────────
function V5TabBar({ active = 'home' }) {
  const tabs = [
    { key: 'home',  label: 'ホーム',     icon: IK5.home },
    { key: 'cust',  label: '顧客',       icon: IK5.users },
    { key: 'mama',  label: 'さくらママ', icon: IK5.sparkle },
    { key: 'chat',  label: 'チャット',   icon: IK5.msg },
    { key: 'sched', label: '予定',       icon: IK5.cal },
  ];
  return (
    <nav style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 25,
      paddingBottom: 28, paddingTop: 8,
      background: 'rgba(247,238,221,0.82)',
      backdropFilter: 'blur(16px) saturate(160%)',
      WebkitBackdropFilter: 'blur(16px) saturate(160%)',
      borderTop: '1px solid rgba(140,111,68,0.18)',
    }}>
      <div style={{ display: 'flex', padding: '0 4px' }}>
        {tabs.map(t => {
          const on = t.key === active;
          return (
            <button key={t.key} style={{
              flex: 1, padding: '8px 0 6px', border: 'none', background: 'transparent',
              cursor: 'pointer', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              color: on ? 'var(--wine-deep)' : 'var(--ink-mute)',
            }}>
              <IcoV5 d={t.icon} size={20} sw={on ? 1.8 : 1.5}/>
              <span style={{
                font: `${on ? 500 : 400} 10px/1 var(--font-sans)`,
                letterSpacing: '0.10em',
                color: on ? 'var(--ink)' : 'var(--ink-mute)',
              }}>{t.label}</span>
              {on && (
                <span aria-hidden style={{
                  position: 'absolute', top: -1,
                  width: 28, height: 2, borderRadius: 2,
                  background: V5.champGold,
                  boxShadow: '0 1px 4px rgba(140,111,68,0.45)',
                }}/>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Page composer ────────────────────────────────────────────
function CastHomeV5({ heroBg, heroOverlay } = {}) {
  const targets = [
    { name: '田中 太郎', initial: '田', badges: ['vip', 'interval'], meta: '12日経過 · 山崎12年キープ · 同伴狙い' },
    { name: '渡辺 美咲', initial: '渡', badges: ['birthday', 'work'], meta: '来週火曜が誕生日 · モエ希望' },
    { name: '高橋 健',  initial: '高', badges: ['hot'], meta: '3回連続来店 · 響17年キープ' },
    { name: '佐藤 一郎', initial: '佐', badges: ['vip', 'birthday'], meta: '今週土曜 60歳 · 最終来店 11日前' },
    { name: '森田 玲子', initial: '森', badges: ['interval'], meta: '18日経過 · ボウモア残少 · 連絡軽め' },
  ];

  return (
    <div data-screen-label="01 Cast Home v5 Bordeaux Salon" style={{
      position: 'relative', minHeight: '100%',
      background: V5.pageBg,
      paddingBottom: 110,
    }}>
      <V5Hero bg={heroBg} overlay={heroOverlay}/>

      <main style={{
        padding: '0 20px',
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>
        <div style={{ marginTop: -34 }}><V5KpiRow/></div>

        <V5SakuraMama/>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <V5SectionHead title="今日連絡したいお客様" count={`${targets.length} 名`} sub="優先度順"/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {targets.map((t, i) => <V5FollowCard key={t.name} {...t} rank={i + 1}/>)}
          </div>
        </section>
      </main>

      <V5FAB/>
      <V5TabBar active="home"/>
    </div>
  );
}

Object.assign(window, { CastHomeV5 });
