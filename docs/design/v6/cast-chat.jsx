// ════════════════════════════════════════════════════════════════
// NIGHTOS · /cast/chat — Chat List (Team & DM)
// 構成: Header → Segmented tabs → Pinned row → Room list → Hint → TabBar
// ════════════════════════════════════════════════════════════════

// ─── Icons ──────────────────────────────────────────────────────
const HIcon = ({ d, size = 16, sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'block', flexShrink: 0 }}>
    {d}
  </svg>
);
const HI = {
  plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  pin:     <><path d="M12 2v6l3 3v3h-8v-3l3-3V2z"/><line x1="12" y1="14" x2="12" y2="22"/></>,
  at:      <><circle cx="12" cy="12" r="4"/><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1"/></>,
  store:   <><path d="M3 9l1.5-5h15L21 9"/><path d="M4 9h16v11H4z"/><path d="M9 20v-6h6v6"/></>,
  users:   <><circle cx="9" cy="8" r="3"/><path d="M3 21c0-3.5 3-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.5"/></>,
  home:    <><path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/></>,
  msg:     <><path d="M21 11c0 4-4 7-9 7-1 0-2-.1-3-.4L4 19l1.5-3.5C4.6 14.3 4 12.7 4 11c0-4 4-7 8.5-7s8.5 3 8.5 7z"/></>,
  cal:     <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
  sparkle: <><path d="M12 3l1.6 4.8L18 9.5l-4.4 1.7L12 16l-1.6-4.8L6 9.5l4.4-1.7z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></>,
  archive: <><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11h14V8"/><line x1="10" y1="13" x2="14" y2="13"/></>,
  douhan:  <><circle cx="9" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 21c0-3 2.5-5 6-5s6 2 6 5"/><path d="M21 21c0-2-1.5-4-4-4.5"/></>,
};

// ════════════════════════════════════════════════════════════════
// HEADER
// ════════════════════════════════════════════════════════════════
function ChatHeader() {
  return (
    <header style={{
      padding: '58px 20px 16px',
      background:
        'radial-gradient(ellipse at top right, var(--champagne-soft) 0%, transparent 65%),' +
        'linear-gradient(180deg, rgba(253,248,240,0.92) 0%, rgba(253,248,240,0.72) 100%)',
      backdropFilter: 'blur(18px) saturate(160%)',
      WebkitBackdropFilter: 'blur(18px) saturate(160%)',
      position: 'relative',
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.45,
      }}/>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <span style={{
            display: 'block',
            font: '500 10px/1 var(--font-sans)', letterSpacing: '0.18em',
            color: 'var(--ink-mute)', marginBottom: 6,
          }}>NIGHTOS</span>
          <h1 style={{
            margin: 0, font: '500 28px/1.15 var(--font-serif)',
            letterSpacing: '0.02em', color: 'var(--ink)',
          }}>チャット</h1>
        </div>
        <button style={{
          flexShrink: 0,
          height: 34, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
          background: 'transparent',
          color: 'var(--rose-gold-deep)',
          border: '1px solid var(--rose-gold-deep)',
          font: '600 12px/1 var(--font-sans)', letterSpacing: '0.06em',
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          <HIcon d={HI.plus} size={13} sw={2}/> 新規 DM
        </button>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════
// SEGMENTED TABS (すべて / 未読 / DM / グループ)
// ════════════════════════════════════════════════════════════════
function TabPills({ value, onChange, counts }) {
  const items = [
    { key: 'all',   label: 'すべて' },
    { key: 'unread',label: '未読',     count: counts.unread },
    { key: 'dm',    label: 'DM' },
    { key: 'group', label: 'グループ' },
  ];
  return (
    <div style={{
      display: 'flex', gap: 7, overflowX: 'auto',
      padding: '0 20px 4px', margin: '0 -20px',
      scrollbarWidth: 'none',
    }}>
      {items.map(it => {
        const on = it.key === value;
        return (
          <button key={it.key} onClick={() => onChange(it.key)} style={{
            flexShrink: 0,
            height: 32, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
            background: on ? 'var(--rose-gold-deep)' : 'rgba(253,248,240,0.85)',
            color: on ? '#fdfcf9' : 'var(--ink-soft)',
            border: on ? '1px solid var(--rose-gold-deep)' : '1px solid var(--line-strong)',
            font: `${on ? 600 : 500} 12px/1 var(--font-sans)`,
            letterSpacing: '0.04em',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            boxShadow: on ? '0 2px 8px rgba(138,94,77,0.22)' : 'none',
          }}>
            {it.label}
            {it.count != null && (
              <span style={{
                font: '400 12px/1 var(--font-display)',
                color: on ? 'rgba(253,248,240,0.85)' : 'var(--rose-gold-deep)',
                letterSpacing: '0.04em',
                fontVariantNumeric: 'tabular-nums',
              }}>{it.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PINNED ROW (店舗全体)
// ════════════════════════════════════════════════════════════════
function PinnedRow({ name, preview, unread }) {
  return (
    <button style={{
      width: '100%', cursor: 'pointer',
      position: 'relative', overflow: 'hidden',
      padding: '12px 14px 12px 16px',
      borderRadius: 'var(--radius-card)',
      background:
        'linear-gradient(135deg, var(--champagne-soft) 0%, rgba(245,232,210,0.55) 100%)',
      border: '1px solid rgba(184,148,85,0.28)',
      display: 'flex', alignItems: 'center', gap: 12,
      textAlign: 'left',
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.6,
      }}/>
      <span style={{
        width: 38, height: 38, borderRadius: 999, flexShrink: 0,
        background: 'rgba(253,248,240,0.85)',
        border: '1px solid rgba(184,148,85,0.32)',
        color: 'var(--gold-deep)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <HIcon d={HI.store} size={17} sw={1.7}/>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3,
        }}>
          <span style={{ color: 'var(--gold-deep)', display: 'inline-flex' }}>
            <HIcon d={HI.pin} size={11} sw={1.8}/>
          </span>
          <span style={{
            font: '500 14px/1.2 var(--font-serif)', color: 'var(--ink)',
            letterSpacing: '0.02em',
          }}>{name}</span>
          <span style={{
            font: '500 9.5px/1 var(--font-sans)', letterSpacing: '0.14em',
            color: 'var(--gold-deep)', textTransform: 'uppercase',
          }}>PINNED</span>
        </div>
        <div style={{
          font: '400 11.5px/1.3 var(--font-sans)', color: 'var(--ink-soft)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          letterSpacing: '0.02em',
        }}>{preview}</div>
      </div>
      {unread > 0 && (
        <UnreadDot count={unread}/>
      )}
    </button>
  );
}

function UnreadDot({ count }) {
  return (
    <span style={{
      flexShrink: 0,
      minWidth: 22, height: 22, padding: '0 7px', borderRadius: 999,
      background: 'var(--rose-gold-deep)',
      color: '#fdfcf9',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      font: '500 12px/1 var(--font-display)', letterSpacing: '0.02em',
      fontVariantNumeric: 'tabular-nums',
      boxShadow: '0 2px 6px rgba(138,94,77,0.32)',
    }}>{count}</span>
  );
}

// ════════════════════════════════════════════════════════════════
// AVATAR variants (DM / GROUP / STACK)
// ════════════════════════════════════════════════════════════════
function CustomerAvatar({ initial, tone }) {
  const bgs = {
    rose:   'linear-gradient(135deg, var(--rose-gold-soft), var(--rose-gold))',
    wine:   'linear-gradient(135deg, var(--wine-soft), var(--wine))',
    champ:  'var(--champagne-metallic)',
    cream:  'linear-gradient(135deg, #fdfcf9, var(--pearl-deep))',
  };
  return (
    <span style={{
      width: 44, height: 44, borderRadius: 999, flexShrink: 0,
      background: bgs[tone] || bgs.champ,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      font: '500 17px/1 var(--font-serif)',
      color: 'var(--ink)', letterSpacing: '0.02em',
      border: '1px solid rgba(255,255,255,0.7)',
      boxShadow: 'inset 0 0 0 1px rgba(168,117,96,0.22), 0 2px 6px rgba(168,117,96,0.12)',
    }}>{initial}</span>
  );
}

function GroupAvatar({ icon }) {
  return (
    <span style={{
      width: 44, height: 44, borderRadius: 999, flexShrink: 0,
      background: 'var(--pearl-light)',
      border: '1px solid var(--line-strong)',
      color: 'var(--rose-gold-deep)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: 'var(--shadow-soft)',
    }}>
      <HIcon d={icon} size={20} sw={1.6}/>
    </span>
  );
}

function StackAvatar({ initials, tones }) {
  return (
    <span style={{
      width: 44, height: 44, flexShrink: 0, position: 'relative',
    }}>
      {initials.map((i, idx) => (
        <span key={idx} style={{
          position: 'absolute',
          top: idx === 0 ? 0 : 12,
          left: idx === 0 ? 0 : 14,
          width: 28, height: 28, borderRadius: 999,
          background: tones[idx] === 'champ' ? 'var(--champagne-metallic)'
                    : tones[idx] === 'rose'  ? 'linear-gradient(135deg, var(--rose-gold-soft), var(--rose-gold))'
                    : 'linear-gradient(135deg, var(--wine-soft), var(--wine))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          font: '500 12px/1 var(--font-serif)', color: 'var(--ink)',
          border: '1.5px solid var(--pearl-light)',
          boxShadow: 'inset 0 0 0 1px rgba(168,117,96,0.22)',
        }}>{i}</span>
      ))}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════
// ROOM ROW
// ════════════════════════════════════════════════════════════════
function RoomRow({ avatar, name, badge, preview, time, unread, mention, isLast }) {
  const ribbon = mention
    ? 'var(--wine-soft)'
    : unread > 0
      ? 'var(--gold-metallic)'
      : null;

  return (
    <button style={{
      width: '100%', cursor: 'pointer', textAlign: 'left',
      position: 'relative',
      padding: '14px 8px 14px 16px',
      background: 'transparent', border: 'none',
      borderBottom: isLast ? 'none' : '1px solid rgba(42,31,26,0.06)',
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      {ribbon && (
        <span aria-hidden style={{
          position: 'absolute', left: 0, right: 0, top: 0, height: 4,
          background: ribbon,
        }}/>
      )}

      {avatar}

      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
        }}>
          <span style={{
            font: '500 15px/1.2 var(--font-serif)', color: 'var(--ink)',
            letterSpacing: '0.02em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            minWidth: 0,
          }}>{name}</span>
          {badge && (
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '2px 7px', borderRadius: 999,
              background: 'var(--pearl-soft)',
              color: 'var(--ink-mute)',
              border: '1px solid var(--line-strong)',
              font: '500 9.5px/1 var(--font-sans)', letterSpacing: '0.08em',
              flexShrink: 0,
            }}>{badge}</span>
          )}
          {mention && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '2px 7px 2px 5px', borderRadius: 999,
              background: 'rgba(154,93,93,0.14)',
              color: 'var(--wine-deep)',
              border: '1px solid rgba(154,93,93,0.32)',
              font: '600 9.5px/1 var(--font-sans)', letterSpacing: '0.06em',
              flexShrink: 0,
            }}>
              <HIcon d={HI.at} size={10} sw={2}/> メンション
            </span>
          )}
        </div>
        <div style={{
          font: `${unread > 0 ? 500 : 400} 12px/1.3 var(--font-sans)`,
          color: unread > 0 ? 'var(--ink)' : 'var(--ink-soft)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          letterSpacing: '0.02em',
        }}>{preview}</div>
      </div>

      <div style={{
        flexShrink: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'flex-end', gap: 6, paddingTop: 2, marginRight: 6,
        minHeight: 36,
      }}>
        <span style={{
          font: '400 11px/1 var(--font-display)',
          color: unread > 0 ? 'var(--rose-gold-deep)' : 'var(--ink-mute)',
          letterSpacing: '0.04em',
          fontVariantNumeric: 'tabular-nums',
        }}>{time}</span>
        {unread > 0 && <UnreadDot count={unread}/>}
      </div>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════
// EMPTY HINT
// ════════════════════════════════════════════════════════════════
function ArchiveHint() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 6, padding: '18px 0 4px',
      color: 'var(--ink-mute)',
    }}>
      <HIcon d={HI.archive} size={11} sw={1.6}/>
      <span style={{
        font: '400 10px/1 var(--font-sans)', letterSpacing: '0.14em',
      }}>メッセージは 30 日で自動的にアーカイブされます</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TAB BAR
// ════════════════════════════════════════════════════════════════
function ChatTabBar() {
  const tabs = [
    { key: 'home',  label: 'ホーム',     icon: HI.home },
    { key: 'cust',  label: '顧客',       icon: HI.users },
    { key: 'mama',  label: 'さくらママ', icon: HI.sparkle },
    { key: 'chat',  label: 'チャット',   icon: HI.msg },
    { key: 'sched', label: '予定',       icon: HI.cal },
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
          const on = t.key === 'chat';
          return (
            <button key={t.key} style={{
              flex: 1, padding: '8px 0 6px', border: 'none', background: 'transparent',
              cursor: 'pointer', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              color: on ? 'var(--wine-deep)' : 'var(--ink-mute)',
            }}>
              <HIcon d={t.icon} size={20} sw={on ? 1.8 : 1.5}/>
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
function ChatListScreen() {
  const [tab, setTab] = React.useState('all');

  const rooms = [
    {
      key: 'yukari',
      avatar: <CustomerAvatar initial="ゆ" tone="rose"/>,
      name: 'ゆかり', badge: 'Help',
      preview: '@あかり 今夜の同伴大丈夫ですか? 田中さん 18:00 で OK と返信もらいました',
      time: '21:42', unread: 2, mention: true,
    },
    {
      key: 'aoi',
      avatar: <CustomerAvatar initial="あ" tone="champ"/>,
      name: 'あおい', badge: 'Help',
      preview: 'OK です! 19 時半まで顧客待ちなので、その後どこかで。',
      time: '20:18', unread: 1, mention: false,
    },
    {
      key: 'douhan',
      avatar: <StackAvatar initials={['ゆ','美','玲']} tones={['rose','champ','wine']}/>,
      name: '同伴連絡', badge: 'Group',
      preview: '美月: 田中さま 18:30 銀座エントランス集合で 🙏',
      time: '19:55', unread: 0, mention: false,
    },
    {
      key: 'akari',
      avatar: <CustomerAvatar initial="美" tone="wine"/>,
      name: '美月',
      preview: 'お疲れさまでした! 明日のシフト変更の件、また連絡しますね。',
      time: '18:02', unread: 0, mention: false,
    },
    {
      key: 'mama-team',
      avatar: <GroupAvatar icon={HI.users}/>,
      name: 'ママ会議', badge: 'Group',
      preview: 'さくらママ: 来月のVIPナイト、出欠表まわします',
      time: '昨日', unread: 0, mention: false,
    },
    {
      key: 'rina',
      avatar: <CustomerAvatar initial="り" tone="champ"/>,
      name: 'りな',
      preview: '渡辺さまボトル空きそうです 🍾 タイミング見て声かけお願いします',
      time: '昨日', unread: 0, mention: false,
    },
    {
      key: 'staff',
      avatar: <GroupAvatar icon={HI.users}/>,
      name: 'キャスト全体', badge: 'Group',
      preview: 'マネージャー: 今週の出勤確定表アップしました',
      time: '5/18', unread: 0, mention: false,
    },
  ];

  const totalUnread = rooms.reduce((a, r) => a + r.unread, 0) + 3;

  // filter
  const filtered = rooms.filter(r => {
    if (tab === 'unread') return r.unread > 0;
    if (tab === 'dm')     return r.badge !== 'Group';
    if (tab === 'group')  return r.badge === 'Group';
    return true;
  });

  return (
    <div data-screen-label="01 Chat List" style={{
      position: 'relative', minHeight: '100%',
      background: 'linear-gradient(180deg, #f3eadb 0%, #efe5d4 100%)',
      paddingBottom: 110,
    }}>
      <ChatHeader/>

      <main style={{
        padding: '18px 0 0',
        display: 'flex', flexDirection: 'column', gap: 22,
      }}>
        <div style={{ padding: '0 20px' }}>
          <TabPills value={tab} onChange={setTab} counts={{ unread: totalUnread }}/>
        </div>

        {/* pinned (only on all/unread/group) */}
        {tab !== 'dm' && (
          <div style={{ padding: '0 20px' }}>
            <PinnedRow
              name="店舗全体"
              preview="マネージャー: 5/22 (金) は新規キャンペーン開始、各位準備お願いします"
              unread={3}
            />
          </div>
        )}

        {/* room list */}
        <section style={{
          marginTop: -4,
          background: 'rgba(255, 253, 248, 0.78)',
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          borderTop: '1px solid var(--line)',
          borderBottom: '1px solid var(--line)',
        }}>
          {filtered.map((r, i) => (
            <RoomRow key={r.key} {...r} isLast={i === filtered.length - 1}/>
          ))}
        </section>

        <ArchiveHint/>
      </main>

      <ChatTabBar/>
    </div>
  );
}

Object.assign(window, { ChatListScreen });
