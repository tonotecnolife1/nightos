// ════════════════════════════════════════════════════════════════
// NIGHTOS · /cast/chat/[id] — Chat Room (DM or Group)
// 構成: Sticky header → Date pill → Bubbles → System msg → Image
//      → Reaction chip → Typing indicator → Composer (sticky)
// ════════════════════════════════════════════════════════════════

// ─── Icons ──────────────────────────────────────────────────────
const RIcon = ({ d, size = 16, sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'block', flexShrink: 0 }}>
    {d}
  </svg>
);
const RI = {
  back:   <polyline points="15 18 9 12 15 6"/>,
  phone:  <><path d="M4 5c0 9 6 15 15 15l1-4-5-2-2 2c-2-1-4-3-5-5l2-2-2-5z"/></>,
  more:   <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  plus:   <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  mic:    <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="22"/></>,
  send:   <><path d="M4 12l16-8-6 16-3-7-7-1z"/></>,
  doneAll:<><polyline points="2 12 7 17 12 12"/><polyline points="9 12 14 17 22 7"/></>,
  image:  <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><polyline points="3 17 9 11 15 17 21 13"/></>,
};

// ════════════════════════════════════════════════════════════════
// STICKY HEADER
// ════════════════════════════════════════════════════════════════
function CRHeader() {
  const iconBtn = (icon, label) => (
    <button aria-label={label} style={{
      width: 32, height: 32, borderRadius: 999,
      background: 'var(--glass-pearl)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      border: '1px solid var(--line)',
      color: 'var(--ink-soft)', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </button>
  );

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      padding: '52px 16px 12px',
      background:
        'linear-gradient(180deg, rgba(253,248,240,0.95) 0%, rgba(247,238,221,0.82) 100%)',
      backdropFilter: 'blur(18px) saturate(160%)',
      WebkitBackdropFilter: 'blur(18px) saturate(160%)',
      borderBottom: '1px solid var(--line)',
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, bottom: -1, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.45,
      }}/>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button aria-label="戻る" style={{
          width: 32, height: 32, borderRadius: 999,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--ink-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginLeft: -6,
        }}>
          <RIcon d={RI.back} size={20} sw={1.8}/>
        </button>

        <span style={{
          width: 32, height: 32, borderRadius: 999, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--rose-gold-soft), var(--rose-gold))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          font: '500 13px/1 var(--font-serif)',
          color: 'var(--ink)', letterSpacing: '0.02em',
          border: '1px solid rgba(255,255,255,0.7)',
          boxShadow: 'inset 0 0 0 1px rgba(168,117,96,0.22)',
        }}>ゆ</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 6,
          }}>
            <span style={{
              font: '500 17px/1.2 var(--font-serif)', color: 'var(--ink)',
              letterSpacing: '0.02em',
            }}>ゆかり</span>
            <span style={{
              font: '500 9.5px/1 var(--font-sans)', letterSpacing: '0.14em',
              color: 'var(--ink-mute)', textTransform: 'uppercase',
            }}>HELP</span>
          </div>
          <div style={{
            marginTop: 3,
            display: 'flex', alignItems: 'center', gap: 6,
            font: '400 10.5px/1 var(--font-sans)',
            color: 'var(--ink-mute)', letterSpacing: '0.08em',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: 999,
              background: 'var(--success)',
              boxShadow: '0 0 0 2px rgba(122,148,119,0.18)',
            }}/>
            2人 · オンライン
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {iconBtn(<RIcon d={RI.phone} size={15} sw={1.7}/>, '通話')}
          {iconBtn(<RIcon d={RI.more}  size={17} sw={1.8}/>, 'メニュー')}
        </div>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════
// DATE PILL (両側 hairline)
// ════════════════════════════════════════════════════════════════
function DatePill({ children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '4px 8px',
    }}>
      <span aria-hidden style={{
        flex: 1, height: 1,
        background:
          'linear-gradient(90deg, transparent, var(--line-strong) 40%, var(--line-strong) 60%, transparent)',
      }}/>
      <span style={{
        font: '400 11px/1 var(--font-sans)',
        color: 'var(--ink-mute)', letterSpacing: '0.14em',
      }}>{children}</span>
      <span aria-hidden style={{
        flex: 1, height: 1,
        background:
          'linear-gradient(90deg, transparent, var(--line-strong) 40%, var(--line-strong) 60%, transparent)',
      }}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// AVATAR (28)
// ════════════════════════════════════════════════════════════════
function MiniAvatar({ initial, tone = 'rose' }) {
  const bgs = {
    rose:  'linear-gradient(135deg, var(--rose-gold-soft), var(--rose-gold))',
    champ: 'var(--champagne-metallic)',
    wine:  'linear-gradient(135deg, var(--wine-soft), var(--wine))',
  };
  return (
    <span style={{
      width: 28, height: 28, borderRadius: 999, flexShrink: 0,
      background: bgs[tone],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      font: '500 12px/1 var(--font-serif)', color: 'var(--ink)',
      letterSpacing: '0.02em',
      border: '1px solid rgba(255,255,255,0.7)',
      boxShadow: 'inset 0 0 0 1px rgba(168,117,96,0.18)',
    }}>{initial}</span>
  );
}

// ════════════════════════════════════════════════════════════════
// BUBBLE (own / other)
// ════════════════════════════════════════════════════════════════
function Bubble({ side, avatar, hideAvatar, text, time, read, reactions, children }) {
  const isOwn = side === 'own';
  return (
    <div style={{
      display: 'flex', gap: 8,
      flexDirection: isOwn ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      padding: '0 4px',
    }}>
      {!isOwn && (
        <div style={{ width: 28, flexShrink: 0 }}>
          {!hideAvatar && avatar}
        </div>
      )}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
        gap: 4, maxWidth: '74%',
      }}>
        {children ? (
          children
        ) : (
          <div style={{
            position: 'relative',
            padding: '10px 14px',
            borderRadius: 18,
            borderBottomRightRadius: isOwn ? 6 : 18,
            borderBottomLeftRadius:  isOwn ? 18 : 6,
            background: isOwn
              ? 'linear-gradient(135deg, #D4A88B 0%, #B07A5C 55%, #A0644A 100%)'
              : 'rgba(255, 253, 248, 0.86)',
            backdropFilter: isOwn ? undefined : 'blur(16px) saturate(140%)',
            WebkitBackdropFilter: isOwn ? undefined : 'blur(16px) saturate(140%)',
            border: isOwn ? '1px solid rgba(255,255,255,0.18)' : '1px solid var(--line)',
            color: isOwn ? '#fdfcf9' : 'var(--ink)',
            font: '500 14px/1.55 var(--font-serif)',
            letterSpacing: '0.02em',
            boxShadow: isOwn ? '0 4px 14px rgba(110,42,51,0.12)' : 'var(--shadow-soft)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {text}
          </div>
        )}

        {reactions && reactions.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
            {reactions.map(r => (
              <span key={r.emoji} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 9px 3px 7px', borderRadius: 999,
                background: 'var(--pearl-warm)',
                border: '1px solid rgba(42,31,26,0.08)',
                font: '500 11px/1 var(--font-sans)',
                color: 'var(--ink-soft)', letterSpacing: '0.04em',
              }}>
                <span style={{ fontSize: 13, lineHeight: 1 }}>{r.emoji}</span>
                <span style={{
                  font: '400 11px/1 var(--font-display)',
                  color: 'var(--rose-gold-ink)',
                  fontVariantNumeric: 'tabular-nums',
                }}>{r.count}</span>
              </span>
            ))}
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          font: '400 10px/1 var(--font-display)',
          color: 'var(--ink-mute)', letterSpacing: '0.04em',
          fontVariantNumeric: 'tabular-nums',
          padding: '0 2px',
        }}>
          {isOwn && read && (
            <span style={{ color: 'var(--rose-gold-deep)', display: 'inline-flex' }}>
              <RIcon d={RI.doneAll} size={11} sw={2}/>
            </span>
          )}
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// IMAGE MESSAGE
// ════════════════════════════════════════════════════════════════
function ImageMsg() {
  return (
    <div style={{
      width: 200, height: 140, borderRadius: 16, overflow: 'hidden',
      border: '1px solid var(--line)',
      background:
        'linear-gradient(135deg, var(--wine-soft) 0%, var(--rose-gold) 50%, var(--champagne) 100%)',
      boxShadow: 'var(--shadow-soft)',
      position: 'relative',
    }}>
      {/* faux room interior — warm spotlight + table */}
      <div style={{
        position: 'absolute', inset: 0,
        background:
          'radial-gradient(ellipse 60% 35% at 50% 22%, rgba(255,238,222,0.55) 0%, transparent 70%),' +
          'radial-gradient(circle at 30% 65%, rgba(212,168,168,0.5) 0%, transparent 40%),' +
          'radial-gradient(circle at 75% 75%, rgba(184,148,85,0.4) 0%, transparent 35%)',
      }}/>
      {/* table line */}
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 28, height: 32,
        borderRadius: 18,
        background: 'linear-gradient(180deg, rgba(42,24,32,0.5), rgba(42,24,32,0.85))',
        border: '1px solid rgba(255,238,222,0.18)',
      }}/>
      {/* bottle silhouettes */}
      <div style={{
        position: 'absolute', left: 60, bottom: 42, width: 10, height: 38,
        borderRadius: '5px 5px 3px 3px',
        background: 'linear-gradient(180deg, rgba(255,238,222,0.7), rgba(110,42,51,0.6))',
      }}/>
      <div style={{
        position: 'absolute', left: 84, bottom: 42, width: 10, height: 30,
        borderRadius: '5px 5px 3px 3px',
        background: 'linear-gradient(180deg, rgba(240,226,200,0.85), rgba(184,148,85,0.7))',
      }}/>
      <div style={{
        position: 'absolute', right: 36, bottom: 42, width: 12, height: 34,
        borderRadius: '6px 6px 3px 3px',
        background: 'linear-gradient(180deg, rgba(255,238,222,0.6), rgba(110,42,51,0.7))',
      }}/>
      {/* label corner */}
      <div style={{
        position: 'absolute', left: 10, top: 10,
        padding: '3px 8px', borderRadius: 999,
        background: 'rgba(42,31,26,0.45)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        color: '#fdfcf9',
        font: '500 9px/1 var(--font-sans)', letterSpacing: '0.14em',
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        <RIcon d={RI.image} size={9} sw={1.8}/>
        IMG
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SYSTEM MSG (italic centered)
// ════════════════════════════════════════════════════════════════
function SystemMsg({ children }) {
  return (
    <div style={{
      textAlign: 'center', padding: '6px 16px',
      font: 'italic 400 11.5px/1.4 var(--font-serif)',
      color: 'var(--ink-mute)', letterSpacing: '0.04em',
    }}>
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TYPING INDICATOR
// ════════════════════════════════════════════════════════════════
function TypingIndicator({ who }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 86, zIndex: 28,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 16px 8px',
      pointerEvents: 'none',
    }}>
      <MiniAvatar initial="ゆ" tone="rose"/>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 14px', borderRadius: 16,
        background: 'rgba(255, 253, 248, 0.78)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-soft)',
      }}>
        <span style={{
          display: 'inline-flex', gap: 4,
        }}>
          {[0, 0.2, 0.4].map((delay, i) => (
            <span key={i} style={{
              width: 5, height: 5, borderRadius: 999,
              background: 'var(--champagne-deep)',
              animation: `crpulse 1.1s ${delay}s ease-in-out infinite`,
            }}/>
          ))}
        </span>
        <span style={{
          font: '400 11.5px/1 var(--font-sans)',
          color: 'var(--ink-soft)', letterSpacing: '0.04em',
        }}>{who}が入力中…</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPOSER
// ════════════════════════════════════════════════════════════════
function Composer({ value, onChange, focused, onFocus, onBlur }) {
  const iconBtn = (icon, label, onClick) => (
    <button aria-label={label} onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 999,
      background: 'transparent', border: 'none', cursor: 'pointer',
      color: 'var(--ink-soft)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {icon}
    </button>
  );

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30,
      padding: '10px 12px 30px',
      background:
        'linear-gradient(180deg, rgba(253,248,240,0) 0%, rgba(253,248,240,0.92) 24%, var(--pearl-light) 100%)',
      backdropFilter: 'blur(16px) saturate(160%)',
      WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    }}>
      <span aria-hidden style={{
        position: 'absolute', top: 0, left: 12, right: 12, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.55,
      }}/>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 6,
      }}>
        {iconBtn(<RIcon d={RI.plus} size={20} sw={1.8}/>, '添付')}

        <div style={{
          flex: 1, minWidth: 0, position: 'relative',
          background: 'var(--pearl-soft)',
          border: '1px solid var(--line-strong)',
          borderRadius: 22,
          padding: '6px 10px 6px 14px',
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: focused
            ? '0 0 0 1px var(--rose-gold-deep), inset 0 1px 2px rgba(42,31,26,0.04)'
            : 'inset 0 1px 2px rgba(42,31,26,0.04)',
        }}>
          <textarea
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="メッセージを入力…"
            rows={1}
            style={{
              flex: 1, minWidth: 0,
              border: 'none', outline: 'none', background: 'transparent',
              resize: 'none',
              padding: '6px 0',
              font: '400 14px/1.4 var(--font-sans)',
              color: 'var(--ink)', letterSpacing: '0.02em',
              maxHeight: 100,
            }}
          />
          {iconBtn(<RIcon d={RI.mic} size={16} sw={1.7}/>, '音声')}
        </div>

        <button aria-label="送信" style={{
          width: 36, height: 36, borderRadius: 999, flexShrink: 0,
          background: 'var(--rose-gold-deep)',
          color: '#fdfcf9',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(138,94,77,0.32)',
        }}>
          <RIcon d={RI.send} size={16} sw={1.8}/>
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PAGE COMPOSER
// ════════════════════════════════════════════════════════════════
function ChatRoomScreen() {
  const [draft, setDraft] = React.useState('');
  const [focused, setFocused] = React.useState(false);

  return (
    <div data-screen-label="01 Chat Room" style={{
      position: 'relative', minHeight: '100%',
      background: 'linear-gradient(180deg, #f3eadb 0%, #efe5d4 100%)',
    }}>
      <style>{`
        @keyframes crpulse {
          0%, 100% { opacity: 0.35; transform: translateY(0); }
          40%      { opacity: 1;    transform: translateY(-2px); }
        }
      `}</style>

      <CRHeader/>

      <main style={{
        padding: '16px 12px 130px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <DatePill>— 5月20日 (火) —</DatePill>

        {/* ゆかり */}
        <Bubble
          side="other"
          avatar={<MiniAvatar initial="ゆ" tone="rose"/>}
          text="お疲れさまです 🌸&#10;今日19時から同伴OKそうですか?"
          time="18:42"
        />

        {/* 自分 */}
        <Bubble
          side="own"
          text="いける!田中さんでよろしく"
          time="18:44"
          read
          reactions={[{ emoji: '🌸', count: 1 }]}
        />

        {/* ゆかり 連投 (hideAvatar) */}
        <Bubble
          side="other"
          avatar={<MiniAvatar initial="ゆ" tone="rose"/>}
          text="ありがとうございます!&#10;お店こんな感じで席押さえてます ↓"
          time="18:45"
        />

        {/* 画像 */}
        <Bubble
          side="other"
          avatar={<MiniAvatar initial="ゆ" tone="rose"/>}
          hideAvatar
          time="18:45"
        >
          <ImageMsg/>
        </Bubble>

        {/* システム */}
        <SystemMsg>あおいさんが入室しました</SystemMsg>

        {/* あおい */}
        <Bubble
          side="other"
          avatar={<MiniAvatar initial="あ" tone="champ"/>}
          text="私もヘルプ入れます!21時から手空きます"
          time="18:51"
        />

        {/* 自分 */}
        <Bubble
          side="own"
          text="助かる🙏 ボトル空きそうなのもよろしく"
          time="18:53"
          read
          reactions={[{ emoji: '🍾', count: 1 }]}
        />
      </main>

      <TypingIndicator who="ゆかり"/>
      <Composer
        value={draft}
        onChange={e => setDraft(e.target.value)}
        focused={focused}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

Object.assign(window, { ChatRoomScreen });
