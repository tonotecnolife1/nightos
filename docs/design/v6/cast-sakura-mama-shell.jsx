// ════════════════════════════════════════════════════════════════
// NIGHTOS · /cast/sakura-mama — PART 1: Icons / Header / Banner /
// Customer picker / Welcome card / Suggestion chips
// ════════════════════════════════════════════════════════════════

const MIcon = ({ d, size = 16, sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'block', flexShrink: 0 }}>
    {d}
  </svg>
);
const MI = {
  back:    <polyline points="15 18 9 12 15 6"/>,
  hist:    <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><polyline points="3 3 3 8 8 8"/><polyline points="12 7 12 12 16 14"/></>,
  image:   <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><polyline points="3 17 9 11 15 17 21 13"/></>,
  send:    <><path d="M4 12l16-8-6 16-3-7-7-1z"/></>,
  sparkle: <><path d="M12 3l1.6 4.8L18 9.5l-4.4 1.7L12 16l-1.6-4.8L6 9.5l4.4-1.7z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></>,
  refresh: <><polyline points="3 12 6 9 9 12"/><path d="M6 9v6a6 6 0 0 0 12 0"/><polyline points="21 12 18 15 15 12"/><path d="M18 15V9a6 6 0 0 0-12 0"/></>,
  quote:   <><path d="M5 7h5v6c0 3-2 4-4 4M14 7h5v6c0 3-2 4-4 4"/></>,
  plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
};

// ════════════════════════════════════════════════════════════════
// HEADER — Wine glass tone
// ════════════════════════════════════════════════════════════════
function RmHeader() {
  const iconCol = (icon, label) => (
    <button aria-label={label} style={{
      background: 'transparent', border: 'none', cursor: 'pointer',
      padding: '0 2px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      color: 'rgba(253,248,240,0.78)',
    }}>
      <span style={{
        width: 30, height: 30, borderRadius: 999,
        background: 'rgba(253,248,240,0.10)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(240,226,200,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </span>
      <span style={{
        font: '500 9px/1 var(--font-sans)', letterSpacing: '0.14em',
        color: 'rgba(240,226,200,0.7)',
      }}>{label}</span>
    </button>
  );
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 25,
      padding: '52px 16px 16px',
      background:
        'radial-gradient(ellipse at top left, rgba(184,148,85,0.18) 0%, transparent 60%),' +
        'linear-gradient(180deg, var(--wine-deep) 0%, #6E2A33 100%)',
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, bottom: -1, height: 1,
        background:
          'linear-gradient(90deg, transparent 0%, var(--champagne-deep) 30%, var(--gold) 50%, var(--champagne-deep) 70%, transparent 100%)',
        opacity: 0.7,
      }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button aria-label="戻る" style={{
          width: 32, height: 32, borderRadius: 999, marginLeft: -6,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'rgba(253,248,240,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MIcon d={MI.back} size={20} sw={1.8}/>
        </button>

        <span style={{
          width: 40, height: 40, borderRadius: 999, flexShrink: 0,
          background: 'var(--champagne-metallic)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          font: '500 16px/1 var(--font-serif)',
          color: 'var(--wine-deep)', letterSpacing: '0.02em',
          border: '1px solid rgba(240,226,200,0.5)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}>桜</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            margin: 0,
            font: '500 22px/1.15 var(--font-serif)',
            letterSpacing: '0.02em',
            background:
              'linear-gradient(135deg, #ffeede 0%, #f0e2c8 60%, #d8b88a 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            color: 'transparent',
          }}>さくらママ</h1>
          <p style={{
            margin: '4px 0 0',
            font: '400 11px/1.3 var(--font-sans)',
            color: 'rgba(240,226,200,0.85)', letterSpacing: '0.06em',
          }}>銀座 30 年の経験者</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {iconCol(<MIcon d={MI.hist}  size={14} sw={1.8}/>, '履歴')}
          {iconCol(<MIcon d={MI.image} size={14} sw={1.8}/>, 'アバター')}
        </div>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════
// LIMIT BANNER
// ════════════════════════════════════════════════════════════════
function LimitBanner({ used, total, resetAt }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 16px',
      background:
        'linear-gradient(180deg, var(--champagne-soft) 0%, rgba(240,226,200,0.55) 100%)',
      borderBottom: '1px solid rgba(184,148,85,0.22)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 6,
      }}>
        <span style={{
          font: '500 10px/1 var(--font-sans)', letterSpacing: '0.16em',
          color: 'var(--gold-deep)',
        }}>TODAY</span>
        <span style={{
          font: '400 18px/1 var(--font-display)',
          color: 'var(--ink)', letterSpacing: '0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}>{used}</span>
        <span style={{
          font: '400 12px/1 var(--font-sans)',
          color: 'var(--ink-soft)',
        }}>/ {total} 回</span>
      </div>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        font: '400 10.5px/1 var(--font-sans)',
        color: 'var(--ink-soft)', letterSpacing: '0.06em',
      }}>
        <MIcon d={MI.refresh} size={11} sw={1.7}/>
        <span style={{ color: 'var(--ink-mute)' }}>リセット</span>
        <span style={{
          font: '400 12px/1 var(--font-display)',
          color: 'var(--ink)', letterSpacing: '0.04em',
          fontVariantNumeric: 'tabular-nums',
        }}>{resetAt}</span>
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CUSTOMER PICKER (horizontal pill scroll)
// ════════════════════════════════════════════════════════════════
function CustomerPicker({ value, onChange, items }) {
  return (
    <div style={{
      display: 'flex', gap: 7, overflowX: 'auto',
      padding: '0 20px', margin: '0 -20px',
      scrollbarWidth: 'none',
    }}>
      {items.map(it => {
        const on = it.key === value;
        const isAll = it.key === 'all';
        return (
          <button key={it.key} onClick={() => onChange(it.key)} style={{
            flexShrink: 0,
            height: 32, padding: isAll ? '0 14px' : '0 12px 0 6px',
            borderRadius: 999, cursor: 'pointer',
            background: on ? 'var(--wine-soft)' : 'rgba(253,248,240,0.85)',
            color: on ? '#fdfcf9' : 'var(--ink-soft)',
            border: on ? '1px solid var(--wine-soft)' : '1px solid var(--line-strong)',
            font: `${on ? 600 : 500} 12px/1 var(--font-sans)`,
            letterSpacing: '0.04em',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            boxShadow: on ? '0 2px 8px rgba(110,42,51,0.22)' : 'none',
          }}>
            {!isAll && (
              <span style={{
                width: 22, height: 22, borderRadius: 999,
                background: on ? 'rgba(253,248,240,0.18)' : 'var(--champagne-metallic)',
                color: on ? '#fdfcf9' : 'var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: '500 11px/1 var(--font-serif)',
                border: on ? '1px solid rgba(253,248,240,0.3)' : '1px solid rgba(255,255,255,0.7)',
              }}>{it.initial}</span>
            )}
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// WELCOME CARD (glass-champagne, suggestion chips)
// ════════════════════════════════════════════════════════════════
function WelcomeCard({ onPick }) {
  const suggestions = ['同伴の誘い方', 'ボトル空けたい', 'LINE 返信のコツ'];
  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      padding: '16px 16px 14px',
      borderRadius: 'var(--radius-xl)',
      background:
        'linear-gradient(180deg, rgba(245,232,210,0.85) 0%, rgba(245,239,230,0.7) 100%)',
      border: '1px solid rgba(184,148,85,0.28)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      boxShadow: 'var(--shadow-warm)',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.7,
      }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{
          width: 64, height: 64, borderRadius: 999, flexShrink: 0,
          background: 'var(--champagne-metallic)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          font: '500 28px/1 var(--font-serif)',
          color: 'var(--wine-deep)', letterSpacing: '0.02em',
          border: '1px solid rgba(240,226,200,0.6)',
          boxShadow: '0 4px 12px rgba(110,42,51,0.18), inset 0 0 0 1px rgba(255,255,255,0.6)',
        }}>桜</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            font: '500 10px/1 var(--font-sans)', letterSpacing: '0.18em',
            color: 'var(--wine-deep)', marginBottom: 6,
          }}>
            <MIcon d={MI.sparkle} size={11} sw={1.8}/>
            AI MAMA
          </span>
          <p style={{
            margin: 0,
            font: '500 15px/1.55 var(--font-serif)',
            color: 'var(--ink)', letterSpacing: '0.02em',
          }}>いらっしゃい。<br/>今日は何を相談する?</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => onPick(s)} style={{
            height: 30, padding: '0 12px', borderRadius: 999, cursor: 'pointer',
            background: 'var(--pearl-light)',
            color: 'var(--wine-deep)',
            border: '1px solid rgba(110,42,51,0.28)',
            font: '500 11.5px/1 var(--font-sans)', letterSpacing: '0.04em',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ color: 'var(--gold-deep)' }}>·</span>
            {s}
          </button>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, {
  MIcon, MI, RmHeader, LimitBanner, CustomerPicker, WelcomeCard,
});
