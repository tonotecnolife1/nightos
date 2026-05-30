// ════════════════════════════════════════════════════════════════
// NIGHTOS · /cast/customers/[id] — Customer Detail (カルテ)
// 構成: SubHeader → Hero → 紹介/LINE row → 写真UP → 担当行 → KPI 4
//      → Quick actions → LINE Exchange Card
//      → Collapsible ×3 (来店・店舗 / メモ・AI / LINE履歴)
//      → Sticky Action Footer (LINE + 電話)
// ════════════════════════════════════════════════════════════════

// ─── Icons (Lucide-style, stroke 1.6) ───────────────────────────
const DIcon = ({ d, size = 16, sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'block', flexShrink: 0 }}>
    {d}
  </svg>
);
const DI = {
  back:    <polyline points="15 18 9 12 15 6"/>,
  chev:    <polyline points="9 18 15 12 9 6"/>,
  chevDn:  <polyline points="6 9 12 15 18 9"/>,
  edit:    <><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/></>,
  crown:   <><path d="M3 8l3 9h12l3-9-5 4-4-7-4 7-5-4z"/><path d="M6 20h12"/></>,
  cake:    <><path d="M4 11h16v9H4z"/><path d="M4 15c2 1 4 1 4 0s2 1 4 1 4-1 4-1 2 0 4 0"/><path d="M12 7v4M8 7v4M16 7v4"/><circle cx="8" cy="5" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="16" cy="5" r="1"/></>,
  line:    <><path d="M21 11c0 4-4 7-9 7-1 0-2-.1-3-.4L4 19l1.5-3.5C4.6 14.3 4 12.7 4 11c0-4 4-7 8.5-7s8.5 3 8.5 7z"/></>,
  check:   <polyline points="5 12 10 17 19 7"/>,
  plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  camera:  <><path d="M4 7h4l2-2h4l2 2h4v12H4z"/><circle cx="12" cy="13" r="3.5"/></>,
  phone:   <><path d="M4 5c0 9 6 15 15 15l1-4-5-2-2 2c-2-1-4-3-5-5l2-2-2-5z"/></>,
  cal:     <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
  bottle:  <><path d="M10 3h4v4l2 3v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10l2-3z"/><line x1="10" y1="14" x2="14" y2="14"/></>,
  users:   <><circle cx="9" cy="8" r="3"/><path d="M3 21c0-3.5 3-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.5"/></>,
  arrow:   <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></>,
  sparkle: <><path d="M12 3l1.6 4.8L18 9.5l-4.4 1.7L12 16l-1.6-4.8L6 9.5l4.4-1.7z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></>,
  swap:    <><path d="M7 7h11l-3-3M17 17H6l3 3"/></>,
  upload:  <><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 20h16"/></>,
  msg2:    <><path d="M4 5h16v12H7l-3 3z"/></>,
  msg:     <><path d="M21 11c0 4-4 7-9 7-1 0-2-.1-3-.4L4 19l1.5-3.5C4.6 14.3 4 12.7 4 11c0-4 4-7 8.5-7s8.5 3 8.5 7z"/></>,
  home:    <><path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/></>,
  yen:     <><path d="M6 4l6 8 6-8M12 12v8M8 14h8M8 17h8"/></>,
};

// ════════════════════════════════════════════════════════════════
// 0) SUB HEADER (戻る + 顧客カルテ)
// ════════════════════════════════════════════════════════════════
function DSubHeader() {
  return (
    <header style={{
      position: 'relative',
      padding: '54px 18px 14px',
      background:
        'linear-gradient(180deg, rgba(253,248,240,0.92) 0%, rgba(253,248,240,0.72) 100%)',
      backdropFilter: 'blur(18px) saturate(160%)',
      WebkitBackdropFilter: 'blur(18px) saturate(160%)',
      borderBottom: '1px solid var(--line)',
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, bottom: -1, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.45,
      }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button aria-label="戻る" style={{
          width: 36, height: 36, borderRadius: 999,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--ink-soft)', marginLeft: -8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <DIcon d={DI.back} size={20} sw={1.8}/>
        </button>
        <h1 style={{
          margin: 0, font: '500 22px/1.2 var(--font-serif)',
          letterSpacing: '0.02em', color: 'var(--ink)',
        }}>顧客カルテ</h1>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════
// 1) CUSTOMER HEADER (Hero card)
// ════════════════════════════════════════════════════════════════
function CustomerHero({ name, kana, initial, photoUrl, intervalDays, badges }) {
  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      padding: '20px 18px 16px',
      borderRadius: 'var(--radius-xl)',
      background:
        'linear-gradient(180deg, var(--champagne-soft) 0%, var(--pearl) 100%)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-warm)',
    }}>
      {/* top hairline */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.55,
      }}/>

      {/* edit button (top right) */}
      <button aria-label="編集" style={{
        position: 'absolute', top: 14, right: 14,
        width: 34, height: 34, borderRadius: 999,
        background: 'var(--glass-pearl)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        border: '1px solid var(--line)',
        color: 'var(--ink-soft)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <DIcon d={DI.edit} size={15} sw={1.7}/>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* avatar 72px */}
        {photoUrl ? (
          <img src={photoUrl} alt={name} style={{
            width: 72, height: 72, borderRadius: 999, objectFit: 'cover',
            flexShrink: 0,
            border: '1px solid rgba(184,148,85,0.35)',
            boxShadow: '0 4px 14px rgba(168,117,96,0.18), inset 0 0 0 1px rgba(255,255,255,0.6)',
          }}/>
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: 999, flexShrink: 0,
            background: 'var(--champagne-metallic)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            font: '500 28px/1 var(--font-serif)',
            color: 'var(--ink)', letterSpacing: '0.02em',
            border: '1px solid rgba(255,255,255,0.7)',
            boxShadow: 'inset 0 0 0 1px rgba(168,117,96,0.22), 0 4px 14px rgba(168,117,96,0.18)',
          }}>{initial}</div>
        )}

        {/* name + kana + interval */}
        <div style={{ flex: 1, minWidth: 0, paddingRight: 30 }}>
          <div style={{
            font: '400 10.5px/1 var(--font-sans)',
            color: 'var(--ink-mute)', letterSpacing: '0.12em',
            marginBottom: 4,
          }}>{kana}</div>
          <h2 style={{
            margin: '0 0 8px',
            font: '500 22px/1.15 var(--font-serif)',
            letterSpacing: '0.02em', color: 'var(--ink)',
          }}>{name}</h2>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            height: 24, padding: '0 10px', borderRadius: 999,
            background: 'transparent',
            color: 'var(--rose-gold-deep)',
            border: '1px solid var(--rose-gold-deep)',
            font: '600 10.5px/1 var(--font-sans)', letterSpacing: '0.08em',
          }}>
            <span style={{
              width: 4, height: 4, borderRadius: 999,
              background: 'var(--rose-gold-deep)',
            }}/>
            {intervalDays}日ぶり
          </span>
        </div>
      </div>

      {/* hairline */}
      <div aria-hidden style={{
        height: 1, margin: '14px 0 12px',
        background: 'var(--line)',
      }}/>

      {/* badges row */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {badges.map(b => <HeroBadge key={b.kind} {...b}/>)}
      </div>
    </section>
  );
}

function HeroBadge({ kind, text }) {
  const map = {
    vip:      { icon: DI.crown, color: 'var(--gold-deep)',
                bg: 'transparent', border: '1px solid var(--gold)' },
    birthday: { icon: DI.cake,  color: 'var(--wine-deep)',
                bg: 'rgba(212,168,168,0.22)', border: '1px solid rgba(154,93,93,0.25)' },
    line:     { icon: DI.line,  color: 'var(--gold-deep)',
                bg: 'rgba(224,200,150,0.22)', border: '1px solid rgba(184,148,85,0.3)' },
  };
  const m = map[kind];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px 4px 8px', borderRadius: 999,
      background: m.bg, color: m.color, border: m.border,
      font: '500 11px/1.2 var(--font-sans)', letterSpacing: '0.04em',
    }}>
      <DIcon d={m.icon} size={11} sw={1.7}/> {text}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════
// 2) FUNNEL / 紹介者 ROW
// ════════════════════════════════════════════════════════════════
function ChainRow() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      padding: '0 4px',
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 9px 4px 7px', borderRadius: 999,
        background: 'rgba(224,200,150,0.22)',
        color: 'var(--gold-deep)',
        border: '1px solid rgba(184,148,85,0.3)',
        font: '500 10.5px/1.2 var(--font-sans)', letterSpacing: '0.06em',
      }}>
        <DIcon d={DI.check} size={11} sw={2}/> LINE交換済
      </span>
      <div style={{
        flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 4,
        font: '400 11.5px/1.4 var(--font-sans)', color: 'var(--ink-mute)',
      }}>
        <span>ご本人:</span>
        <span style={{ color: 'var(--ink-soft)', font: '500 12px/1.4 var(--font-serif)' }}>
          田中 太郎さま
        </span>
      </div>
      <button style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        padding: 0, color: 'var(--rose-gold-deep)',
        font: '600 11.5px/1 var(--font-sans)', letterSpacing: '0.04em',
        display: 'inline-flex', alignItems: 'center', gap: 3,
      }}>
        <DIcon d={DI.plus} size={11} sw={2}/> お連れ様を登録
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 3) 写真アップロード ZONE
// ════════════════════════════════════════════════════════════════
function PhotoUploadZone() {
  return (
    <button style={{
      width: '100%', cursor: 'pointer',
      padding: '14px',
      borderRadius: 'var(--radius-card)',
      background: 'rgba(245,239,230,0.5)',
      border: '1px dashed rgba(176,122,92,0.35)',
      color: 'var(--ink-mute)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      font: '400 12.5px/1 var(--font-sans)', letterSpacing: '0.06em',
    }}>
      <DIcon d={DI.camera} size={15} sw={1.6}/>
      タップして写真を追加
    </button>
  );
}

// ════════════════════════════════════════════════════════════════
// 4) 担当・管理 ROW
// ════════════════════════════════════════════════════════════════
function ManagementRow() {
  const Mini = ({ label, name }) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
      <span style={{
        font: '500 10px/1 var(--font-sans)', letterSpacing: '0.16em',
        color: 'var(--ink-mute)',
      }}>{label}</span>
      <span style={{
        font: '500 13px/1 var(--font-serif)', color: 'var(--ink)',
        letterSpacing: '0.02em',
      }}>{name}</span>
    </div>
  );
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px',
      borderRadius: 'var(--radius-card)',
      background: 'rgba(253, 248, 240, 0.72)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      border: '1px solid var(--line)',
    }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Mini label="管理" name="あかり"/>
        <span aria-hidden style={{
          width: 1, height: 14, background: 'var(--line-strong)',
        }}/>
        <Mini label="担当" name="ゆかり"/>
      </div>
      <button style={{
        height: 24, padding: '0 10px', borderRadius: 999,
        background: 'transparent',
        color: 'var(--ink-soft)',
        border: '1px solid var(--line-strong)',
        cursor: 'pointer',
        font: '500 10.5px/1 var(--font-sans)', letterSpacing: '0.06em',
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        <DIcon d={DI.swap} size={10} sw={1.8}/> 変更
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 5) CUSTOMER STATS (KPI 4)
// ════════════════════════════════════════════════════════════════
function StatTile({ label, value, unit, prefix, accent = 'ink' }) {
  const colors = {
    ink:  'var(--ink)',
    rose: 'var(--rose-gold-ink)',
    wine: 'var(--wine-deep)',
  };
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      flex: 1, minWidth: 0,
      padding: '12px 11px 11px',
      borderRadius: 'var(--radius-2xl)',
      background: 'rgba(247,238,221,0.82)',
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
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 2, whiteSpace: 'nowrap',
      }}>
        {prefix && (
          <span style={{
            font: '400 13px/1 var(--font-display)',
            color: 'var(--ink-soft)',
          }}>{prefix}</span>
        )}
        <span style={{
          font: '400 24px/1 var(--font-display)',
          color: colors[accent], letterSpacing: '0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>{value}</span>
        {unit && (
          <span style={{
            font: '400 10.5px/1 var(--font-sans)',
            color: 'var(--ink-soft)', paddingLeft: 1,
          }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

function StatsRow() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <StatTile label="来店回数" value="28" unit="回" accent="ink"/>
        <StatTile label="累計売上" value="420" unit="千円" prefix="¥" accent="rose"/>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <StatTile label="ボトル"   value="3"   unit="本" accent="ink"/>
        <StatTile label="次回ボトル予想" value="5/30" accent="wine"/>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 6) QUICK ACTIONS
// ════════════════════════════════════════════════════════════════
function QuickActions() {
  const Btn = ({ icon, label }) => (
    <button style={{
      flex: 1,
      height: 44, borderRadius: 999, cursor: 'pointer',
      background: 'var(--pearl-soft)',
      color: 'var(--ink)',
      border: '1px solid var(--line-strong)',
      font: '600 12.5px/1 var(--font-sans)', letterSpacing: '0.06em',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    }}>
      <span style={{ color: 'var(--rose-gold-deep)', display: 'inline-flex' }}>
        <DIcon d={icon} size={15} sw={1.7}/>
      </span>
      {label}
    </button>
  );
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Btn icon={DI.cal}    label="来店を記録"/>
      <Btn icon={DI.bottle} label="ボトルを記録"/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 7) LINE EXCHANGE CARD
// ════════════════════════════════════════════════════════════════
function LineExchangeCard({ exchangedAt }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      padding: '14px 16px',
      borderRadius: 'var(--radius-card)',
      background:
        'linear-gradient(135deg, rgba(224,200,150,0.32) 0%, rgba(240,226,200,0.45) 100%)',
      border: '1px solid rgba(184,148,85,0.32)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.6,
      }}/>
      <div style={{
        width: 36, height: 36, borderRadius: 999, flexShrink: 0,
        background: 'var(--pearl-light)',
        border: '1px solid rgba(184,148,85,0.4)',
        color: 'var(--gold-deep)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <DIcon d={DI.check} size={18} sw={2}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          font: '500 10px/1 var(--font-sans)', letterSpacing: '0.16em',
          color: 'var(--gold-deep)', marginBottom: 4,
        }}>LINE EXCHANGED</div>
        <div style={{
          font: '500 14px/1.3 var(--font-serif)', color: 'var(--ink)',
          letterSpacing: '0.02em',
        }}>
          LINE 交換済み{' '}
          <span style={{
            font: '400 14px/1 var(--font-display)',
            color: 'var(--ink-soft)', letterSpacing: '0.04em',
            fontVariantNumeric: 'tabular-nums',
          }}>{exchangedAt}</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COLLAPSIBLE WRAPPER
// ════════════════════════════════════════════════════════════════
function Collapsible({ title, sub, defaultOpen = false, children }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <button onClick={() => setOpen(!open)} style={{
        all: 'unset',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 4px 14px 14px', cursor: 'pointer',
        position: 'relative',
      }}>
        <span aria-hidden style={{
          position: 'absolute', left: 0, top: 16, bottom: 16, width: 3,
          borderRadius: 2,
          background: 'var(--gold-metallic)',
        }}/>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h3 style={{
            margin: 0, font: '500 17px/1.3 var(--font-serif)',
            letterSpacing: '0.02em', color: 'var(--ink)',
          }}>{title}</h3>
          {sub && (
            <span style={{
              font: '500 10px/1 var(--font-sans)', letterSpacing: '0.16em',
              color: 'var(--ink-mute)', textTransform: 'uppercase',
            }}>{sub}</span>
          )}
        </div>
        <span style={{
          width: 28, height: 28, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink-soft)',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform .2s ease',
        }}>
          <DIcon d={DI.chevDn} size={16} sw={1.8}/>
        </span>
      </button>
      {open && (
        <div style={{
          paddingTop: 4, paddingBottom: 4,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {children}
        </div>
      )}
    </section>
  );
}

// ─── thin section separator ────────────────────────────────────
function ThinDivider() {
  return (
    <div aria-hidden style={{ height: 1, background: 'rgba(42,31,26,0.06)' }}/>
  );
}

// ════════════════════════════════════════════════════════════════
// 8a) VISIT HISTORY TIMELINE
// ════════════════════════════════════════════════════════════════
function VisitRow({ date, dow, duration, sales, douhan, isLast }) {
  return (
    <div style={{
      display: 'flex', gap: 14, position: 'relative',
      padding: '12px 0',
      borderBottom: isLast ? 'none' : '1px solid var(--line)',
    }}>
      {/* date stamp */}
      <div style={{
        width: 56, flexShrink: 0, textAlign: 'right',
      }}>
        <div style={{
          font: '400 22px/1 var(--font-display)',
          color: 'var(--rose-gold-ink)', letterSpacing: '0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}>{date}</div>
        <div style={{
          font: '400 10px/1.3 var(--font-sans)',
          color: 'var(--ink-mute)', letterSpacing: '0.1em',
          marginTop: 3,
        }}>{dow}</div>
      </div>

      {/* vertical line */}
      <div aria-hidden style={{
        width: 1, alignSelf: 'stretch',
        background: 'var(--line-strong)',
        position: 'relative',
      }}>
        <span style={{
          position: 'absolute', top: 8, left: -3.5,
          width: 8, height: 8, borderRadius: 999,
          background: 'var(--pearl-light)',
          border: '1.5px solid var(--rose-gold-deep)',
        }}/>
      </div>

      {/* details */}
      <div style={{
        flex: 1, minWidth: 0, paddingTop: 4,
        display: 'flex', flexDirection: 'column', gap: 5,
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
        }}>
          <span style={{
            font: '500 13.5px/1.2 var(--font-serif)', color: 'var(--ink)',
            letterSpacing: '0.02em',
          }}>滞在 {duration}</span>
          {douhan && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '2px 7px 2px 6px', borderRadius: 999,
              background: 'rgba(176,122,92,0.10)',
              color: 'var(--rose-gold-deep)',
              border: '1px solid rgba(138,94,77,0.28)',
              font: '500 9.5px/1.2 var(--font-sans)', letterSpacing: '0.08em',
            }}>
              <DIcon d={DI.users} size={10} sw={1.7}/> 同伴
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{
            font: '400 16px/1 var(--font-display)',
            color: 'var(--ink-soft)', letterSpacing: '0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}>¥{sales}</span>
        </div>
      </div>
    </div>
  );
}

function VisitHistory() {
  const visits = [
    { date: '4/28', dow: 'SUN', duration: '2h 40m', sales: '38,000', douhan: true },
    { date: '4/14', dow: 'SUN', duration: '1h 50m', sales: '22,000', douhan: false },
    { date: '3/30', dow: 'SAT', duration: '3h 10m', sales: '52,000', douhan: true },
    { date: '3/12', dow: 'TUE', duration: '2h 05m', sales: '28,000', douhan: false },
    { date: '2/25', dow: 'SUN', duration: '4h 20m', sales: '78,000', douhan: false },
  ];
  return (
    <div style={{
      padding: '4px 18px 4px 16px',
      borderRadius: 'var(--radius-card)',
      background: 'rgba(253, 248, 240, 0.72)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      border: '1px solid var(--line)',
    }}>
      {visits.map((v, i) => (
        <VisitRow key={v.date} {...v} isLast={i === visits.length - 1}/>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 8b) STORE INFO GRID
// ════════════════════════════════════════════════════════════════
function InfoField({ label, value, span }) {
  return (
    <div style={{
      gridColumn: span ? `span ${span}` : undefined,
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{
        font: '500 9.5px/1 var(--font-sans)', letterSpacing: '0.16em',
        color: 'var(--ink-mute)',
      }}>{label}</div>
      <div style={{
        font: '500 13.5px/1.45 var(--font-serif)', color: 'var(--ink)',
        letterSpacing: '0.02em',
      }}>{value}</div>
    </div>
  );
}

function StoreInfo() {
  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: 'var(--radius-card)',
      background: 'rgba(253, 248, 240, 0.72)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      border: '1px solid var(--line)',
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 14px',
    }}>
      <InfoField label="お店"   value="銀座 ルナ"/>
      <InfoField label="住所"   value="銀座 7-8-1"/>
      <InfoField label="ご職業" value="IT企業 役員"/>
      <InfoField label="ご趣味" value="ゴルフ / ワイン"/>
      <InfoField span={2} label="特記事項" value="氷少なめ希望。タバコは葉巻 (CAO)。"/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 9) MEMO / AI 提案
// ════════════════════════════════════════════════════════════════
function MemoBlock({ label, body, accent }) {
  return (
    <div style={{
      padding: '12px 14px',
      borderRadius: 'var(--radius-card)',
      background: 'rgba(253, 248, 240, 0.72)',
      border: '1px solid var(--line)',
      position: 'relative', overflow: 'hidden',
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: accent,
      }}/>
      <div style={{
        font: '500 12.5px/1.3 var(--font-serif)', color: 'var(--ink)',
        letterSpacing: '0.04em', marginBottom: 6,
      }}>{label}</div>
      <p style={{
        margin: 0,
        font: '400 12.5px/1.7 var(--font-sans)', color: 'var(--ink-soft)',
        letterSpacing: '0.01em',
      }}>{body}</p>
    </div>
  );
}

function MemoSection() {
  return (
    <>
      <MemoBlock
        label="前回の話題 — LAST"
        body="娘さんの就職決まったお祝いで来店。山崎を開けて、奥さまには内緒のサプライズと話されていた。"
        accent="var(--gold-metallic)"
      />
      <MemoBlock
        label="サービスのコツ — TIPS"
        body="氷少なめ。長居しない (2時間程度)。聞き役で良く、無理に乾杯を促さない。葉巻 (CAO) を勧めると喜ばれる。"
        accent="linear-gradient(180deg, var(--champagne-soft), var(--champagne))"
      />
      <MemoBlock
        label="次回の話題 — NEXT"
        body="ゴルフコンペが 5月末。前回ベスト 88 で更新狙い。新しいドライバーを試した感想を聞く。"
        accent="linear-gradient(180deg, var(--rose-gold-soft), var(--rose-gold))"
      />
      <button style={{
        alignSelf: 'flex-start',
        height: 38, padding: '0 16px', borderRadius: 999, cursor: 'pointer',
        background: 'transparent',
        color: 'var(--rose-gold-deep)',
        border: '1px solid var(--rose-gold-deep)',
        font: '600 12px/1 var(--font-sans)', letterSpacing: '0.06em',
        display: 'inline-flex', alignItems: 'center', gap: 7,
      }}>
        <DIcon d={DI.sparkle} size={13} sw={1.7}/>
        ママに次回トピックを聞く
      </button>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
// 10) LINE / 連絡履歴
// ════════════════════════════════════════════════════════════════
function ScreenshotThumb({ label, tone }) {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: 10, flexShrink: 0,
      background: tone,
      border: '1px solid var(--line-strong)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--ink-mute)',
      font: '400 9px/1 var(--font-sans)', letterSpacing: '0.06em',
    }}>{label}</div>
  );
}

function LineHistorySection() {
  const thumbs = [
    { label: '5/14', tone: 'linear-gradient(135deg, #efe4d2, #d8c2a0)' },
    { label: '5/06', tone: 'linear-gradient(135deg, #f0e2c8, #e0c896)' },
    { label: '4/28', tone: 'linear-gradient(135deg, #f3d8c8, #dba98e)' },
    { label: '4/18', tone: 'linear-gradient(135deg, #f5efe6, #e8dccb)' },
    { label: '3/29', tone: 'linear-gradient(135deg, #efe4d2, #c8a672)' },
  ];
  return (
    <>
      {/* thumbs row */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto',
        scrollbarWidth: 'none',
        padding: '2px 0',
      }}>
        {thumbs.map(t => <ScreenshotThumb key={t.label} {...t}/>)}
      </div>

      {/* summary */}
      <div style={{
        padding: '14px 16px',
        borderRadius: 'var(--radius-card)',
        background: 'rgba(253, 248, 240, 0.72)',
        border: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <Summary label="最終やりとり" value="2日前 (5月19日 23:14)"/>
        <Summary label="状態" value="既読 — 返信待ち" pill="rose"/>
        <Summary label="トーン" value="軽め · 落ち着いた敬語"/>
      </div>

      <button style={{
        alignSelf: 'flex-start',
        height: 38, padding: '0 16px', borderRadius: 999, cursor: 'pointer',
        background: 'transparent',
        color: 'var(--rose-gold-deep)',
        border: '1px solid var(--rose-gold-deep)',
        font: '600 12px/1 var(--font-sans)', letterSpacing: '0.06em',
        display: 'inline-flex', alignItems: 'center', gap: 7,
      }}>
        <DIcon d={DI.upload} size={13} sw={1.8}/>
        スクショから読み込む
      </button>
    </>
  );
}

function Summary({ label, value, pill }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12,
    }}>
      <span style={{
        font: '500 10.5px/1 var(--font-sans)', letterSpacing: '0.14em',
        color: 'var(--ink-mute)',
      }}>{label}</span>
      {pill ? (
        <span style={{
          padding: '3px 9px', borderRadius: 999,
          background: 'rgba(176,122,92,0.10)',
          color: 'var(--rose-gold-deep)',
          border: '1px solid rgba(138,94,77,0.28)',
          font: '500 11px/1 var(--font-sans)', letterSpacing: '0.04em',
        }}>{value}</span>
      ) : (
        <span style={{
          font: '500 12.5px/1.3 var(--font-serif)', color: 'var(--ink)',
          letterSpacing: '0.02em', textAlign: 'right',
        }}>{value}</span>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 11) STICKY ACTION FOOTER
// ════════════════════════════════════════════════════════════════
function StickyActions() {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 88, zIndex: 28,
      paddingTop: 12, paddingLeft: 18, paddingRight: 18, paddingBottom: 14,
      background:
        'linear-gradient(180deg, rgba(253,248,240,0) 0%, rgba(253,248,240,0.92) 28%, var(--pearl-light) 100%)',
      backdropFilter: 'blur(16px) saturate(160%)',
      WebkitBackdropFilter: 'blur(16px) saturate(160%)',
      borderTop: '1px solid var(--line)',
      display: 'flex', gap: 10,
    }}>
      <button style={{
        flex: 1, height: 52, borderRadius: 999, cursor: 'pointer',
        background: 'var(--rose-gold-deep)',
        color: '#fdfcf9', border: 'none',
        font: '600 14px/1 var(--font-sans)', letterSpacing: '0.06em',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: 'var(--shadow-luxe)',
      }}>
        <DIcon d={DI.msg2} size={16} sw={1.8}/>
        LINE を送る
      </button>
      <button aria-label="電話" style={{
        width: 52, height: 52, borderRadius: 999, cursor: 'pointer',
        background: 'var(--pearl-light)',
        color: 'var(--rose-gold-ink)',
        border: '1px solid var(--rose-gold-ink)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'var(--shadow-soft)',
      }}>
        <DIcon d={DI.phone} size={17} sw={1.8}/>
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 12) TAB BAR (顧客 active)
// ════════════════════════════════════════════════════════════════
function DTabBar() {
  const tabs = [
    { key: 'home',  label: 'ホーム',     icon: DI.home },
    { key: 'cust',  label: '顧客',       icon: DI.users },
    { key: 'mama',  label: 'さくらママ', icon: DI.sparkle },
    { key: 'chat',  label: 'チャット',   icon: DI.msg },
    { key: 'sched', label: '予定',       icon: DI.cal },
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
          const on = t.key === 'cust';
          return (
            <button key={t.key} style={{
              flex: 1, padding: '8px 0 6px', border: 'none', background: 'transparent',
              cursor: 'pointer', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              color: on ? 'var(--wine-deep)' : 'var(--ink-mute)',
            }}>
              <DIcon d={t.icon} size={20} sw={on ? 1.8 : 1.5}/>
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

// ════════════════════════════════════════════════════════════════
// PAGE COMPOSER
// ════════════════════════════════════════════════════════════════
function CustomerDetailScreen() {
  const customer = {
    name: '田中 太郎',
    kana: 'たなか たろう',
    initial: '田',
    photoUrl: null,
    intervalDays: 23,
    badges: [
      { kind: 'vip',      text: 'VIP' },
      { kind: 'birthday', text: '誕生日 12月3日' },
      { kind: 'line',     text: 'LINE済' },
    ],
  };

  return (
    <div data-screen-label="01 Customer Detail" style={{
      position: 'relative', minHeight: '100%',
      background: 'linear-gradient(180deg, #f3eadb 0%, #efe5d4 100%)',
      paddingBottom: 180,
    }}>
      <DSubHeader/>

      <main style={{
        padding: '18px 20px 0',
        display: 'flex', flexDirection: 'column', gap: 22,
      }}>
        <CustomerHero {...customer}/>

        <ChainRow/>

        <PhotoUploadZone/>

        <ManagementRow/>

        <StatsRow/>

        <QuickActions/>

        <LineExchangeCard exchangedAt="2026/3/12"/>

        <ThinDivider/>

        <Collapsible title="来店・店舗情報" sub="LAST 5" defaultOpen>
          <VisitHistory/>
          <StoreInfo/>
        </Collapsible>

        <ThinDivider/>

        <Collapsible title="メモ・AI提案" sub="3 BLOCKS">
          <MemoSection/>
        </Collapsible>

        <ThinDivider/>

        <Collapsible title="LINE・連絡履歴" sub="5 SCREENSHOTS">
          <LineHistorySection/>
        </Collapsible>
      </main>

      <StickyActions/>
      <DTabBar/>
    </div>
  );
}

Object.assign(window, { CustomerDetailScreen });
