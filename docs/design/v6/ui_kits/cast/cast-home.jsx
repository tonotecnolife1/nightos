// ════════════════════════════════════════════════════════════════
// NIGHTOS · Cast Home — Luxury Lady Night (v3)
// Recreates /cast/home from tonotecnolife1/nightos with v3 palette.
// Components (all global):
//   Hero — pearl→champagne gradient + serif title + circle icons
//   StatCards — 3 KPI cards (Cormorant numerals)
//   MorningBriefing — さくらママ from card (GemCard nocturne ver)
//   RuriMamaEntryCard — premium CTA card with avatar
//   FollowTargetList — sortable list, contacted progress, cards
//   FollowTargetCard — single customer card with action pills
//   FAB — floating action button (rose-gold metallic)
//   TabBar — bottom floating pill nav (Home / Customers / Mama / Chat / Schedule)
// ════════════════════════════════════════════════════════════════

const C = { // theme tokens read from CSS vars
  pearl: 'var(--pearl)',
  pearlLight: 'var(--pearl-light)',
  pearlSoft: 'var(--pearl-soft)',
  pearlDeep: 'var(--pearl-deep)',
  ink: 'var(--ink)',
  inkSoft: 'var(--ink-soft)',
  inkMute: 'var(--ink-mute)',
  line: 'var(--line)',
  rg: 'var(--rose-gold)',
  rgSoft: 'var(--rose-gold-soft)',
  rgDeep: 'var(--rose-gold-deep)',
  metal: 'var(--rose-gold-metallic)',
  metalLight: 'var(--rose-gold-metallic-light)',
  cham: 'var(--champagne)',
  chamSoft: 'var(--champagne-soft)',
  chamDeep: 'var(--champagne-deep)',
  gold: 'var(--gold)',
  goldSoft: 'var(--gold-soft)',
  goldDeep: 'var(--gold-deep)',
  noct: 'var(--nocturne-deep)',
  noctDusk: 'var(--nocturne-dusk)',
  wine: 'var(--wine)',
  wineSoft: 'var(--wine-soft)',
  wineDeep: 'var(--wine-deep)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  glassP: 'var(--glass-pearl)',
  glassC: 'var(--glass-champagne)',
  glassN: 'var(--glass-nocturne)',
  shSoft: 'var(--shadow-soft)',
  shFloat: 'var(--shadow-float)',
  shLuxe: 'var(--shadow-luxe)',
  serif: 'var(--font-serif)',
  sans: 'var(--font-sans)',
  display: 'var(--font-display)',
};

// ───────────────────────────────────────────────────────────────
// Lucide-style inline icons (stroke 1.6, currentColor)
// ───────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, fill = 'none', sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);
const I = {
  cal:   <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
  user:  <><circle cx="12" cy="8" r="3.5"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></>,
  home:  <><path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 21c0-3.5 3-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.5"/></>,
  msg:   <><path d="M21 11c0 4-4 7-9 7-1 0-2-.1-3-.4L4 19l1.5-3.5C4.6 14.3 4 12.7 4 11c0-4 4-7 8.5-7s8.5 3 8.5 7z"/></>,
  star:  <><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></>,
  heart: <><path d="M12 21s-7-4.5-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-7 10-7 10-1.5 1-3 1-4 0z"/></>,
  trend: <><polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/></>,
  bookmark: <><path d="M6 3h12v18l-6-4-6 4V3z"/></>,
  cake:  <><rect x="3" y="9" width="18" height="11" rx="1.5"/><path d="M3 13h18M12 9v11"/><path d="M8 9c-1-2 0-4 2-4s2 2 2 2-1-2 1-2 3 2 2 4"/></>,
  gift:  <><rect x="3" y="9" width="18" height="11" rx="1.5"/><line x1="3" y1="13" x2="21" y2="13"/><line x1="12" y1="9" x2="12" y2="20"/><path d="M8 9c-1-2 0-4 2-4s2 2 2 2-1-2 1-2 3 2 2 4"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></>,
  wine:  <><path d="M8 3h8l-1 6c0 3 0 5-3 5s-3-2-3-5l-1-6z"/><path d="M12 14v7M8 21h8"/></>,
  check: <polyline points="20 6 9 17 4 12"/>,
  chev:  <polyline points="9 18 15 12 9 6"/>,
  gem:   <><polygon points="6 3 18 3 22 9 12 21 2 9"/><polyline points="11 3 8 9 12 21"/><polyline points="13 3 16 9 12 21"/><path d="M2 9h20"/></>,
  refresh: <><polyline points="3 12 6 9 9 12"/><path d="M6 9v3a8 8 0 0 0 14 5"/><polyline points="21 12 18 15 15 12"/><path d="M18 15v-3a8 8 0 0 0-14-5"/></>,
  plus:  <><line x1="12" y1="4" x2="12" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/></>,
  sparkle: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></>,
  bell:  <><path d="M6 8a6 6 0 0 1 12 0c0 5 2 7 2 7H4s2-2 2-7z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
  send:  <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
};

// ───────────────────────────────────────────────────────────────
// Hero — top banner with greeting + meta pills + icons
// ───────────────────────────────────────────────────────────────
function Hero({ name = 'あかり', shifts = '今夜 19:00 銀座 · 22:00 青山', notifCount = 2, onBell }) {
  return (
    <div style={{
      position: 'relative',
      // 56px clears iOS status bar + dynamic island. 20px lateral, 22px bottom.
      padding: '56px 20px 22px',
      background:
        `radial-gradient(ellipse 80% 40% at 20% 10%, ${'#f3d8c8'}77 0%, transparent 60%),` +
        `radial-gradient(ellipse 70% 60% at 100% 100%, ${'#f5e8d2'}aa 0%, transparent 55%),` +
        `linear-gradient(180deg, var(--pearl-light) 0%, var(--pearl) 100%)`,
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ font: '500 10px/1 var(--font-sans)', letterSpacing: '0.22em', color: C.rgDeep }}>TONIGHT</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <IconBtn icon={I.cal} />
          <IconBtn icon={I.bell} badge={notifCount} onClick={onBell} />
          <IconBtn icon={I.user} />
        </div>
      </div>
      <h1 style={{
        font: '500 22px/1.3 var(--font-serif)', letterSpacing: '0.01em', margin: '0 0 4px',
        color: C.rgDeep,
      }}>
        {`おかえりなさい、${name}さん`}
      </h1>
      <div style={{ font: '400 13px/1.5 var(--font-sans)', color: C.inkSoft }}>
        {shifts}
      </div>
      <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Pill>本日の予定 4 件</Pill>
        <Pill tone="champagne">同伴 ¥4.8万</Pill>
        <Pill tone="gold">VIP 2 名</Pill>
      </div>
    </div>
  );
}

function IconBtn({ icon, badge, onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'relative', width: 36, height: 36, borderRadius: 999,
      background: 'rgba(253,252,249,0.95)',
      border: '1px solid rgba(168,117,96,0.20)', boxShadow: C.shSoft,
      color: C.inkSoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', flexShrink: 0,
    }}>
      <Icon d={icon} size={16} />
      {badge ? (
        <span style={{
          position: 'absolute', top: -2, right: -2,
          minWidth: 16, height: 16, padding: '0 4px',
          borderRadius: 999, background: C.wine, color: '#fff',
          font: '500 10px/16px var(--font-sans)', textAlign: 'center',
          border: '1.5px solid var(--pearl-light)',
        }}>{badge}</span>
      ) : null}
    </button>
  );
}

function Pill({ children, tone = 'default' }) {
  const t = {
    default:   { bg: 'rgba(248,241,230,0.9)', color: C.inkSoft, border: '1px solid var(--line)' },
    champagne: { bg: C.chamSoft, color: C.goldDeep, border: '1px solid var(--gold-soft)' },
    gold:      { bg: 'transparent', color: C.goldDeep, border: '1px solid var(--gold)' },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 11px', borderRadius: 999,
      ...t,
      font: `400 11px/1.4 ${C.display}`, letterSpacing: '0.06em',
    }}>{children}</span>
  );
}

// ───────────────────────────────────────────────────────────────
// StatCards — 3 KPI cards
// ───────────────────────────────────────────────────────────────
function StatCard({ label, value, unit, icon, accent = 'default' }) {
  const accents = {
    default: C.ink, rose: C.rgDeep, gold: C.goldDeep, wine: C.wineDeep,
  };
  return (
    <div style={{
      borderRadius: 22, padding: '12px 14px',
      background: C.pearlLight, border: '1px solid var(--line)', boxShadow: C.shSoft,
      display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: '400 11px/1 var(--font-sans)', color: C.inkMute, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <span style={{ color: C.gold, display: 'flex' }}><Icon d={icon} size={11} /></span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ font: `400 28px/1 ${C.display}`, color: accents[accent] }}>{value}</span>
        {unit && <span style={{ font: '400 11px/1 var(--font-sans)', color: C.inkMute }}>{unit}</span>}
      </div>
    </div>
  );
}

function StatCards({ summary }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
      <StatCard label="今月の指名" value={summary.nominations} unit="本" icon={I.bookmark} accent="rose" />
      <StatCard label="再来店率" value={summary.repeatPct} unit="%" icon={I.heart} accent="rose" />
      <StatCard label="新規" value={summary.newCustomers} unit="人" icon={I.users} accent="gold" />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// MorningBriefing — Glass nocturne card with avatar + serif copy
// ───────────────────────────────────────────────────────────────
function MorningBriefing({ message }) {
  return (
    <div style={{
      borderRadius: 22, padding: 16, position: 'relative', overflow: 'hidden',
      background:
        `radial-gradient(ellipse 60% 50% at 90% 0%, rgba(243,216,200,0.45) 0%, transparent 60%),` +
        `linear-gradient(135deg, ${C.noctDusk} 0%, ${C.noct} 100%)`,
      boxShadow: C.shLuxe, color: '#f6ead8',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${C.gold}`, overflow: 'hidden', background: C.pearlSoft }}>
          <img src="../../assets/ruri-mama-photo.jpg" alt="さくらママ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ font: '500 11px/1 var(--font-sans)', letterSpacing: '0.22em', color: C.rgSoft }}>FROM さくらママ</div>
          <div style={{ font: '500 13px/1 var(--font-serif)', color: '#f8ede0', marginTop: 4 }}>今朝の一言</div>
        </div>
        <button style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: C.rgSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon d={I.refresh} size={13} />
        </button>
      </div>
      <p style={{ font: '400 14px/1.7 var(--font-sans)', color: 'rgba(252,240,224,0.92)', margin: 0, whiteSpace: 'pre-wrap' }}>
        {message}
      </p>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Ruri-Mama Entry Card — premium CTA
// ───────────────────────────────────────────────────────────────
function RuriMamaEntryCard({ onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left',
      borderRadius: 22, padding: 16, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(135deg, ${'#fce4d4'} 0%, ${'#f0c5af'} 60%, ${'#dba98e'} 100%)`,
      boxShadow: C.shLuxe, border: '1px solid rgba(255,255,255,0.5)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(400px 160px at 110% -10%, rgba(255,255,255,0.5), transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 999, border: `1px solid ${C.gold}`, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.goldDeep, flexShrink: 0 }}>
        <Icon d={I.gem} size={22} />
      </div>
      <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
        <div style={{ font: '400 11px/1 var(--font-display)', letterSpacing: '0.18em', color: C.wineDeep }}>SAKURA-MAMA · AI</div>
        <div style={{ font: '500 19px/1.25 var(--font-serif)', color: C.ink, marginTop: 4 }}>さくらママに相談する</div>
        <div style={{ font: '400 12px/1.4 var(--font-sans)', color: 'rgba(43,35,42,0.75)', marginTop: 4 }}>LINE文面・接客・ボトル提案、何でも聞いてね</div>
      </div>
      <span style={{ position: 'relative', font: `400 26px/1 ${C.display}`, color: C.wineDeep }}>›</span>
    </button>
  );
}

// ───────────────────────────────────────────────────────────────
// FollowTargetCard — single customer with reason + actions
// ───────────────────────────────────────────────────────────────
function ReasonTag({ reason }) {
  const map = {
    birthday:   { icon: I.gift,  bg: '#d4a8a8',   color: '#5e3838',   text: '誕生日' },
    interval:   { icon: I.clock, bg: C.pearlSoft, color: C.ink, text: '間隔空き', border: `1px solid ${C.goldSoft}` },
    nomination: { icon: I.trend, bg: '#bf9d6e', color: C.ink, text: '指名化チャンス' },
  };
  const m = map[reason] || map.interval;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 999,
      background: m.bg, color: m.color, border: m.border || 'none',
      font: '500 10px/1.2 var(--font-sans)',
    }}>
      <Icon d={m.icon} size={10} /> {m.text}
    </span>
  );
}
function CategoryTag({ cat }) {
  const m = {
    vip:     { bg: 'transparent', color: C.goldDeep, border: `1px solid ${C.gold}`, text: 'VIP' },
    new:     { bg: '#f3d8c8',   color: '#6e4736',   text: '新規' },
    regular: { bg: '#e6cda5', color: C.ink,  text: '常連' },
  }[cat];
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 999,
      background: m.bg, color: m.color, border: m.border || 'none',
      font: '500 9px/1.2 var(--font-sans)', letterSpacing: '0.04em',
    }}>{m.text}</span>
  );
}

function FollowTargetCard({ target, contacted, onToggle }) {
  const { id, name, category, reason, reasonDetail, bottle, lastTopic } = target;
  return (
    <div style={{
      borderRadius: 22, background: C.pearlLight, border: '1px solid var(--line)',
      boxShadow: C.shSoft, overflow: 'hidden',
      opacity: contacted ? 0.55 : 1, transition: 'opacity 0.3s',
    }}>
      {contacted && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 14px', background: 'rgba(122,148,119,0.10)',
          borderBottom: '1px solid rgba(122,148,119,0.20)',
          font: '500 11px/1.2 var(--font-sans)', color: C.success,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon d={I.check} size={11} /> 連絡済み
          </span>
          <button onClick={() => onToggle(id)} style={{
            border: 'none', background: 'transparent', color: C.inkMute,
            font: '400 11px/1 var(--font-sans)', textDecoration: 'underline', cursor: 'pointer',
          }}>戻す</button>
        </div>
      )}
      <div style={{ padding: '12px 14px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <ReasonTag reason={reason} />
          <span style={{ font: '400 10px/1.3 var(--font-sans)', color: C.inkMute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reasonDetail}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <div style={{ font: '500 15px/1.3 var(--font-serif)', color: C.ink, letterSpacing: '0.02em' }}>{name}</div>
          <CategoryTag cat={category} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, font: '400 11px/1.5 var(--font-sans)', color: C.inkSoft }}>
          {bottle && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ color: C.gold, display: 'flex' }}><Icon d={I.wine} size={11} /></span>
              <span>{bottle}</span>
            </div>
          )}
          {lastTopic && <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>前回: {lastTopic}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '8px 14px 12px', borderTop: '1px solid rgba(43,35,42,0.04)' }}>
        {!contacted ? (
          <button onClick={() => onToggle(id)} style={{
            flex: 1, height: 36, borderRadius: 999, border: '1px solid rgba(255,255,255,0.4)',
            background: C.metal, color: '#fdfcf9', textShadow: '0 1px 2px rgba(94,56,56,0.35)',
            font: '600 12px/1 var(--font-sans)', letterSpacing: '0.04em',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            boxShadow: C.shFloat, cursor: 'pointer',
          }}><Icon d={I.check} size={12} /> 連絡した</button>
        ) : (<div style={{ flex: 1 }} />)}
        <button style={{
          height: 36, padding: '0 12px', borderRadius: 999,
          background: 'transparent', color: C.rgDeep, border: `1px solid ${C.gold}`,
          font: '500 12px/1 var(--font-sans)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          cursor: 'pointer',
        }}><Icon d={I.msg} size={11} /> LINE</button>
        <button style={{
          height: 36, padding: '0 12px', borderRadius: 999,
          background: 'transparent', color: C.goldDeep, border: `1px solid ${C.gold}`,
          font: '500 12px/1 var(--font-sans)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          cursor: 'pointer',
        }}><Icon d={I.sparkle} size={11} /> 相談</button>
      </div>
    </div>
  );
}

function FollowTargetList({ targets, contacted, onToggle }) {
  const done = targets.filter(t => contacted.has(t.id)).length;
  const total = targets.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const sorted = [...targets].sort((a, b) =>
    (contacted.has(a.id) ? 1 : 0) - (contacted.has(b.id) ? 1 : 0)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 999, background: C.pearlSoft, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: C.metal, transition: 'width .4s' }} />
        </div>
        <span style={{ font: `400 14px/1 ${C.display}`, color: done === total ? C.success : C.inkMute, letterSpacing: '0.04em' }}>
          {done}/{total}
        </span>
      </div>
      {sorted.map(t => (
        <FollowTargetCard key={t.id} target={t} contacted={contacted.has(t.id)} onToggle={onToggle} />
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// FAB — floating action button
// ───────────────────────────────────────────────────────────────
function FAB({ onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 18, bottom: 92, zIndex: 30,
      width: 56, height: 56, borderRadius: 999,
      background: C.metal, color: '#fff',
      border: '1px solid rgba(255,255,255,0.5)',
      boxShadow: C.shLuxe,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}>
      <Icon d={I.plus} size={22} />
    </button>
  );
}

// ───────────────────────────────────────────────────────────────
// TabBar — bottom floating pill nav
// ───────────────────────────────────────────────────────────────
function TabBar({ active, onChange }) {
  const tabs = [
    { key: 'home',     label: 'ホーム',     icon: I.home },
    { key: 'cust',     label: '顧客',       icon: I.users },
    { key: 'mama',     label: 'さくらママ', icon: I.sparkle },
    { key: 'chat',     label: 'チャット',   icon: I.msg },
    { key: 'sched',    label: '予定',       icon: I.cal },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 12, left: 12, right: 12, zIndex: 25,
    }}>
      <div style={{
        background: 'rgba(253,252,249,0.95)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(184,148,85,0.25)', borderRadius: 999,
        boxShadow: C.shLuxe,
        padding: 6, display: 'flex',
      }}>
        {tabs.map(t => {
          const isActive = t.key === active;
          return (
            <button key={t.key} onClick={() => onChange(t.key)} style={{
              flex: 1, height: 46, borderRadius: 999, border: 'none', background: 'transparent',
              color: isActive ? C.rgDeep : C.inkMute,
              position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
              cursor: 'pointer',
            }}>
              <Icon d={t.icon} size={18} sw={1.5} />
              <span style={{ font: `${isActive ? 500 : 400} 9px/1 var(--font-sans)`, letterSpacing: '0.05em', color: isActive ? C.ink : C.inkMute }}>
                {t.label}
              </span>
              {isActive && (
                <span style={{
                  position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                  width: 20, height: 1.5, borderRadius: 2, background: C.gold,
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Empty state — used when contacted = all
// ───────────────────────────────────────────────────────────────
function AllDoneBanner() {
  return (
    <div style={{
      borderRadius: 18, padding: '12px 14px', textAlign: 'center',
      background: 'rgba(122,148,119,0.08)', border: '1px solid rgba(122,148,119,0.20)',
    }}>
      <div style={{ font: '500 12px/1.4 var(--font-sans)', color: C.success }}>
        全員に連絡できた。おつかれさまでした 🌸
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// SectionHead — small serif heading w/ subdued numeral
// ───────────────────────────────────────────────────────────────
function SectionHead({ title, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 2px' }}>
      <h2 style={{ font: '500 18px/1.3 var(--font-serif)', letterSpacing: '0.02em', color: C.ink, margin: 0 }}>{title}</h2>
      {sub && <span style={{ font: `400 14px/1 ${C.display}`, color: C.inkMute, letterSpacing: '0.04em' }}>{sub}</span>}
    </div>
  );
}

Object.assign(window, {
  C, I, Icon, Hero, IconBtn, Pill, StatCards, StatCard,
  MorningBriefing, RuriMamaEntryCard,
  FollowTargetList, FollowTargetCard, FAB, TabBar,
  AllDoneBanner, SectionHead,
});
