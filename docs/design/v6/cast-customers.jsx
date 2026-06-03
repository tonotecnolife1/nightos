// ════════════════════════════════════════════════════════════════
// NIGHTOS · /cast/customers — Customer List Screen
// 構成: Glass Sub-header → Funnel KPI ×3 → 紹介チェーン → Filter pills
//      → Grouping toggle → Customer Stack ×5 → Help Section ×2
//      → FAB (UserPlus) + TabBar (顧客 active)
// 言語: cast-home と同一トークン (Luxury Lady Night v3)
// ════════════════════════════════════════════════════════════════

// ─── Icons (Lucide-style, stroke 1.6) ───────────────────────────
const CIcon = ({ d, size = 18, sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'block', flexShrink: 0 }}>
    {d}
  </svg>
);
const CI = {
  back:      <polyline points="15 18 9 12 15 6"/>,
  chev:      <polyline points="9 18 15 12 9 6"/>,
  plus:      <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  crown:     <><path d="M3 8l3 9h12l3-9-5 4-4-7-4 7-5-4z"/><path d="M6 20h12"/></>,
  cake:      <><path d="M4 11h16v9H4z"/><path d="M4 15c2 1 4 1 4 0s2 1 4 1 4-1 4-1 2 0 4 0"/><path d="M12 7v4M8 7v4M16 7v4"/><circle cx="8" cy="5" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="16" cy="5" r="1"/></>,
  line:      <><rect x="3" y="4" width="18" height="14" rx="4"/><path d="M7 21l3-3M17 21l-3-3"/><path d="M7 9v3M7 9h2M11 9v3M11 9l2 3v-3M15 9h2M15 9v3h2"/></>,
  gitBranch: <><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="11" r="2"/><path d="M6 7v10"/><path d="M18 9V8a4 4 0 0 0-4-4H9"/><path d="M6 13h6a4 4 0 0 0 4-4"/></>,
  helping:   <><path d="M11 12l2-2 4 4-3 3-3-3"/><path d="M3 13l5-5 3 3"/><path d="M14 6l3-3 4 4-3 3"/><path d="M8 18l-2 2-3-3 2-2"/></>,
  home:      <><path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/></>,
  users:     <><circle cx="9" cy="8" r="3"/><path d="M3 21c0-3.5 3-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.5"/></>,
  sparkle:   <><path d="M12 3l1.6 4.8L18 9.5l-4.4 1.7L12 16l-1.6-4.8L6 9.5l4.4-1.7z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></>,
  msg:       <><path d="M21 11c0 4-4 7-9 7-1 0-2-.1-3-.4L4 19l1.5-3.5C4.6 14.3 4 12.7 4 11c0-4 4-7 8.5-7s8.5 3 8.5 7z"/></>,
  cal:       <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
  userPlus:  <><circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-4 3.5-7 7-7s7 3 7 7"/><path d="M19 8v6M22 11h-6"/></>,
};

// ─── Sub-header (Glass pearl, sticky-like band) ─────────────────
function SubHeader({ count }) {
  return (
    <header style={{
      position: 'relative',
      padding: '54px 18px 18px',
      background:
        'linear-gradient(180deg, rgba(253,248,240,0.92) 0%, rgba(253,248,240,0.72) 100%)',
      backdropFilter: 'blur(18px) saturate(160%)',
      WebkitBackdropFilter: 'blur(18px) saturate(160%)',
      borderBottom: '1px solid var(--line)',
    }}>
      {/* metallic hairline at bottom */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, bottom: -1, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.45,
      }}/>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, minWidth: 0 }}>
          <button aria-label="戻る" style={{
            width: 36, height: 36, marginTop: -2, borderRadius: 999,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--ink-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginLeft: -8,
          }}>
            <CIcon d={CI.back} size={20} sw={1.8}/>
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              margin: 0,
              font: '500 26px/1.15 var(--font-serif)',
              letterSpacing: '0.02em', color: 'var(--ink)',
            }}>顧客リスト</h1>
            <div style={{
              marginTop: 4,
              display: 'flex', alignItems: 'baseline', gap: 5,
            }}>
              <span style={{
                font: '400 22px/1 var(--font-display)',
                color: 'var(--rose-gold-deep)', letterSpacing: '0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>{count}</span>
              <span style={{
                font: '400 11.5px/1 var(--font-sans)',
                color: 'var(--ink-soft)', letterSpacing: '0.08em',
              }}>人のお客様</span>
            </div>
          </div>
        </div>
        <button style={{
          flexShrink: 0,
          height: 36, padding: '0 14px', borderRadius: 999,
          background: 'transparent',
          color: 'var(--rose-gold-deep)',
          border: '1px solid var(--rose-gold-deep)',
          cursor: 'pointer',
          font: '600 12px/1 var(--font-sans)', letterSpacing: '0.04em',
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          <CIcon d={CI.plus} size={13} sw={2}/> 新規
        </button>
      </div>
    </header>
  );
}

// ─── Funnel KPI Card ────────────────────────────────────────────
function FunnelKpi({ label, value, unit, sub, tone = 'default' }) {
  const tones = {
    default: 'var(--ink)',
    rose:    'var(--rose-gold-ink)',
    wine:    'var(--wine-deep)',
  };
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      flex: 1, minWidth: 0,
      padding: '13px 13px 12px',
      borderRadius: 'var(--radius-2xl)',
      background: 'rgba(253, 248, 240, 0.72)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-soft)',
      display: 'flex', flexDirection: 'column', gap: 5,
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 2,
        background: 'var(--gold-metallic)', opacity: 0.55,
      }}/>
      <div style={{
        font: '500 9.5px/1.2 var(--font-sans)', letterSpacing: '0.14em',
        color: 'var(--ink-mute)',
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{
          font: '400 30px/1 var(--font-display)',
          color: tones[tone], letterSpacing: '0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>{value}</span>
        {unit && (
          <span style={{
            font: '400 11px/1 var(--font-sans)', color: 'var(--ink-soft)',
          }}>{unit}</span>
        )}
      </div>
      {sub && (
        <div style={{ font: '400 10px/1.3 var(--font-sans)', color: 'var(--ink-mute)' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function FunnelKpiRow() {
  return (
    <div style={{ display: 'flex', gap: 9 }}>
      <FunnelKpi label="店舗登録のみ" value="48" unit="人" sub="未接客 +5" tone="default"/>
      <FunnelKpi label="担当あり"     value="32" unit="人" sub="今月新規 4" tone="rose"/>
      <FunnelKpi label="LINE交換済"   value="21" unit="人" sub="65% 到達" tone="wine"/>
    </div>
  );
}

// ─── Section header (cast-home と同じ左 ribbon) ─────────────────
function SectionHead({ title, sub, count, icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '2px 2px 2px 14px',
      position: 'relative',
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 4, bottom: 4, width: 3,
        borderRadius: 2,
        background: 'var(--gold-metallic)',
      }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && (
          <span style={{ color: 'var(--rose-gold-deep)', display: 'inline-flex' }}>
            <CIcon d={icon} size={15} sw={1.7}/>
          </span>
        )}
        <h2 style={{
          margin: 0, font: '500 16px/1.3 var(--font-serif)',
          letterSpacing: '0.02em', color: 'var(--ink)',
        }}>{title}</h2>
        {count != null && (
          <span style={{
            font: '400 16px/1 var(--font-display)',
            color: 'var(--rose-gold-deep)', letterSpacing: '0.04em',
            fontVariantNumeric: 'tabular-nums',
          }}>{count}</span>
        )}
      </div>
      {sub && (
        <span style={{
          font: '500 9.5px/1 var(--font-sans)', letterSpacing: '0.18em',
          color: 'var(--ink-mute)', textTransform: 'uppercase',
        }}>{sub}</span>
      )}
    </div>
  );
}

// ─── 紹介チェーン Indicator (Champagne soft band) ────────────────
function ChainIndicator() {
  return (
    <button style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      position: 'relative', overflow: 'hidden',
      padding: '14px 14px 14px 16px',
      borderRadius: 'var(--radius-card)',
      background:
        'linear-gradient(135deg, var(--champagne-soft) 0%, rgba(245,232,210,0.55) 100%)',
      border: '1px solid var(--line)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.65,
      }}/>
      <div style={{
        width: 38, height: 38, borderRadius: 999, flexShrink: 0,
        background: 'rgba(253,248,240,0.7)',
        border: '1px solid rgba(184,148,85,0.28)',
        color: 'var(--gold-deep)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CIcon d={CI.gitBranch} size={18} sw={1.6}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          font: '500 10px/1 var(--font-sans)', letterSpacing: '0.16em',
          color: 'var(--gold-deep)', marginBottom: 5,
        }}>お連れ様の繋がり</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{
            font: '400 24px/1 var(--font-display)',
            color: 'var(--ink)', letterSpacing: '0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}>3</span>
          <span style={{
            font: '400 12px/1 var(--font-sans)', color: 'var(--ink-soft)',
          }}>本のチェーン · 7名が連鎖</span>
        </div>
      </div>
      <span style={{
        font: '300 24px/1 var(--font-display)',
        color: 'var(--rose-gold-deep)', flexShrink: 0,
      }}>›</span>
    </button>
  );
}

// ─── Filter pill cluster (horizontal scroll) ────────────────────
function FilterPills({ active, onChange }) {
  const items = ['すべて', 'VIP', '誕生日近い', 'LINE未交換', '最近来店'];
  return (
    <div style={{
      display: 'flex', gap: 7, overflowX: 'auto',
      paddingBottom: 4, margin: '0 -20px', padding: '0 20px 4px',
      scrollbarWidth: 'none',
    }}>
      {items.map(it => {
        const on = it === active;
        return (
          <button key={it} onClick={() => onChange?.(it)} style={{
            flexShrink: 0,
            height: 32, padding: on ? '0 16px' : '0 14px',
            borderRadius: 999, cursor: 'pointer',
            background: on ? 'var(--rose-gold-deep)' : 'rgba(253,248,240,0.85)',
            color: on ? '#fdfcf9' : 'var(--ink-soft)',
            border: on
              ? '1px solid var(--rose-gold-deep)'
              : '1px solid var(--line-strong)',
            font: `${on ? 600 : 500} 12px/1 var(--font-sans)`,
            letterSpacing: '0.04em', whiteSpace: 'nowrap',
            boxShadow: on
              ? '0 2px 8px rgba(138,94,77,0.22)'
              : 'none',
          }}>{it}</button>
        );
      })}
    </div>
  );
}

// ─── Grouping toggle (right-aligned segmented) ──────────────────
function GroupingToggle({ value, onChange }) {
  const opts = [
    { key: 'cust', label: 'お客様' },
    { key: 'cast', label: '担当別' },
  ];
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{
        font: '500 10px/1 var(--font-sans)', letterSpacing: '0.18em',
        color: 'var(--ink-mute)', textTransform: 'uppercase',
      }}>GROUP BY</span>
      <div style={{
        display: 'inline-flex',
        padding: 3, borderRadius: 999,
        background: 'rgba(245,239,230,0.75)',
        border: '1px solid var(--line)',
      }}>
        {opts.map(o => {
          const on = o.key === value;
          return (
            <button key={o.key} onClick={() => onChange?.(o.key)} style={{
              height: 26, padding: '0 12px', borderRadius: 999,
              border: 'none', cursor: 'pointer',
              background: on ? 'var(--pearl-light)' : 'transparent',
              color: on ? 'var(--ink)' : 'var(--ink-mute)',
              font: `${on ? 600 : 500} 11px/1 var(--font-sans)`,
              letterSpacing: '0.08em',
              boxShadow: on
                ? '0 1px 3px rgba(43,35,42,0.08), 0 0 0 1px var(--line)'
                : 'none',
            }}>{o.label}</button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Customer badges (VIP / 誕生日 / LINE) ──────────────────────
function CBadge({ kind }) {
  const map = {
    vip:      { text: 'VIP', icon: CI.crown,
                bg: 'transparent', color: 'var(--gold-deep)',
                border: '1px solid var(--gold)' },
    birthday: { text: '誕生日', icon: CI.cake,
                bg: 'rgba(212,168,168,0.22)', color: 'var(--wine-deep)',
                border: '1px solid rgba(154,93,93,0.25)' },
    line:     { text: 'LINE', icon: CI.msg,
                bg: 'rgba(224,200,150,0.22)', color: 'var(--gold-deep)',
                border: '1px solid rgba(184,148,85,0.3)' },
  };
  const m = map[kind];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3.5,
      padding: '2.5px 8px 2.5px 6px', borderRadius: 999,
      background: m.bg, color: m.color, border: m.border,
      font: '500 9.5px/1.2 var(--font-sans)', letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      <CIcon d={m.icon} size={10} sw={1.7}/> {m.text}
    </span>
  );
}

// ─── 更新ありマーク — 通知ドット + 細pill。バッジ群とは別軸 ─────
function UpdateMark() {
  return (
    <span aria-label="情報更新あり" style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2.5px 9px 2.5px 7px', borderRadius: 999,
      background: 'rgba(138,94,77,0.10)',
      color: 'var(--rose-gold-deep)',
      border: '1px solid rgba(138,94,77,0.32)',
      font: '600 9.5px/1.2 var(--font-sans)', letterSpacing: '0.06em',
      whiteSpace: 'nowrap',
    }}>
      <span aria-hidden style={{
        width: 6, height: 6, borderRadius: 999,
        background: 'var(--rose-gold-deep)',
        boxShadow: '0 0 0 2px rgba(138,94,77,0.18)',
      }}/>
      更新あり
    </span>
  );
}

// ─── Customer Card (Priority Stack 風) ──────────────────────────
function CustomerCard({ name, initial, badges = [], visits, lastSeen, cast,
                        intervalDays, rank, isHelp, updated }) {
  const isTop = !isHelp && rank <= 2;
  const opacity = isHelp ? 0.85 : 1;
  const isVip = badges.includes('vip');
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      padding: '12px 12px 12px 18px',
      borderRadius: 'var(--radius-card)',
      background: `rgba(253, 248, 240, ${0.55 * opacity + 0.18})`,
      backdropFilter: 'blur(14px) saturate(140%)',
      WebkitBackdropFilter: 'blur(14px) saturate(140%)',
      border: '1px solid var(--line)',
      boxShadow: isTop ? 'var(--shadow-warm)' : 'var(--shadow-soft)',
      display: 'flex', alignItems: 'center', gap: 11,
      opacity,
    }}>
      {/* 左 4px ribbon */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: isVip
          ? 'var(--gold-metallic)'
          : 'linear-gradient(180deg, var(--champagne-soft), var(--rose-gold-soft))',
      }}/>

      {/* Avatar */}
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
          {updated && <UpdateMark/>}
          {badges.map(b => <CBadge key={b} kind={b}/>)}
        </div>
        <div style={{
          font: '400 11px/1.35 var(--font-sans)', color: 'var(--ink-soft)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          letterSpacing: '0.02em',
        }}>
          来店 {visits}回 · {lastSeen}前 · 担当 <span style={{ color: 'var(--ink)' }}>{cast}</span>
        </div>
      </div>

      {/* Right — chevron */}
      <span style={{
        flexShrink: 0,
        font: '300 24px/1 var(--font-display)',
        color: 'var(--rose-gold-deep)',
      }}>›</span>
    </div>
  );
}

// ─── FAB ─────────────────────────────────────────────────────────
function FAB() {
  return (
    <button style={{
      position: 'absolute', right: 18, bottom: 96, zIndex: 30,
      width: 60, height: 60, borderRadius: 999,
      background: 'var(--wine-deep)',
      color: '#fdfcf9',
      border: 'none',
      boxShadow:
        '0 0 0 1px rgba(235,217,168,0.65), ' +
        '0 0 0 4px var(--wine-deep), ' +
        '0 0 0 5px rgba(235,217,168,0.40), ' +
        '0 8px 20px rgba(45,24,24,0.55), 0 28px 56px rgba(20,10,10,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }} aria-label="新規顧客追加">
      <CIcon d={CI.userPlus} size={24} sw={1.8}/>
    </button>
  );
}

// ─── Bottom TabBar (5 tabs, 顧客 active) ────────────────────────
function TabBar({ active = 'cust' }) {
  const tabs = [
    { key: 'home',  label: 'ホーム',     icon: CI.home },
    { key: 'cust',  label: '顧客',       icon: CI.users },
    { key: 'mama',  label: 'さくらママ', icon: CI.sparkle },
    { key: 'chat',  label: 'チャット',   icon: CI.msg },
    { key: 'sched', label: '予定',       icon: CI.cal },
  ];
  return (
    <nav style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 25,
      paddingBottom: 28, paddingTop: 8,
      background: 'rgba(247,238,221,0.82)',
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
              color: on ? 'var(--wine-deep)' : 'var(--ink-mute)',
            }}>
              <CIcon d={t.icon} size={20} sw={on ? 1.8 : 1.5}/>
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

// ─── Help section divider ───────────────────────────────────────
function HelpDivider({ count }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '6px 2px',
    }}>
      <span aria-hidden style={{
        flex: 1, height: 1,
        background:
          'linear-gradient(90deg, transparent, var(--line-strong) 30%, var(--line-strong) 70%, transparent)',
      }}/>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        color: 'var(--ink-mute)',
      }}>
        <CIcon d={CI.helping} size={13} sw={1.6}/>
        <span style={{
          font: '500 10px/1 var(--font-sans)', letterSpacing: '0.18em',
          color: 'var(--ink-mute)', textTransform: 'uppercase',
        }}>ヘルプで入ったお客様</span>
        <span style={{
          font: '400 13px/1 var(--font-display)',
          color: 'var(--rose-gold-deep)', letterSpacing: '0.04em',
        }}>{count}</span>
      </div>
      <span aria-hidden style={{
        flex: 1, height: 1,
        background:
          'linear-gradient(90deg, transparent, var(--line-strong) 30%, var(--line-strong) 70%, transparent)',
      }}/>
    </div>
  );
}

// ─── Page composer ──────────────────────────────────────────────
function CastCustomersScreen() {
  const [filter, setFilter] = React.useState('すべて');
  const [group, setGroup] = React.useState('cust');

  const customers = [
    { name: '田中 太郎', initial: '田', badges: ['vip', 'line'],
      visits: 24, lastSeen: '3日', cast: '美月',   intervalDays: 12, updated: true },
    { name: '渡辺 美咲', initial: '渡', badges: ['birthday', 'line'],
      visits: 11, lastSeen: '5日', cast: 'さくら', intervalDays: 5,  updated: true },
    { name: '高橋 健',   initial: '高', badges: ['line'],
      visits: 18, lastSeen: '2日', cast: '美月',   intervalDays: 8 },
    { name: '佐藤 一郎', initial: '佐', badges: ['vip', 'birthday'],
      visits: 32, lastSeen: '11日', cast: '玲奈',  intervalDays: 18 },
    { name: '森田 玲子', initial: '森', badges: [],
      visits: 6,  lastSeen: '18日', cast: 'ゆき',  intervalDays: 22 },
  ];
  const helpCustomers = [
    { name: '山下 翔',   initial: '山', badges: ['line'],
      visits: 4, lastSeen: '7日',  cast: '美月 (ヘルプ)', intervalDays: 9, updated: true },
    { name: '中村 雅彦', initial: '中', badges: [],
      visits: 2, lastSeen: '14日', cast: 'さくら (ヘルプ)', intervalDays: 16 },
  ];

  return (
    <div data-screen-label="01 Cast Customers" style={{
      position: 'relative', minHeight: '100%',
      background: 'linear-gradient(180deg, #f3eadb 0%, #efe5d4 100%)',
      paddingBottom: 110,
    }}>
      <SubHeader count={customers.length + helpCustomers.length}/>

      <main style={{
        padding: '20px 20px 0',
        display: 'flex', flexDirection: 'column', gap: 22,
      }}>
        <FunnelKpiRow/>

        <ChainIndicator/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FilterPills active={filter} onChange={setFilter}/>
          <GroupingToggle value={group} onChange={setGroup}/>
        </div>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionHead title="お客様" count={`${customers.length} 名`}/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {customers.map((c, i) => (
              <CustomerCard key={c.name} {...c} rank={i + 1}/>
            ))}
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <HelpDivider count={`${helpCustomers.length} 名`}/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {helpCustomers.map((c, i) => (
              <CustomerCard key={c.name} {...c} rank={i + 1} isHelp/>
            ))}
          </div>
        </section>
      </main>

      <FAB/>
      <TabBar active="cust"/>
    </div>
  );
}

Object.assign(window, { CastCustomersScreen });
