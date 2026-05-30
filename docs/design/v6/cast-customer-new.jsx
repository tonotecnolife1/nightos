// ════════════════════════════════════════════════════════════════
// NIGHTOS · /cast/customers/new — 新規顧客登録フォーム
// 構成: SubHeader → Helper hint → Field stack (10 fields)
//      → VIP toggle → Sticky CTA「登録する」
// ════════════════════════════════════════════════════════════════

// ─── Icons ──────────────────────────────────────────────────────
const NIcon = ({ d, size = 16, sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'block', flexShrink: 0 }}>
    {d}
  </svg>
);
const NI = {
  back:    <polyline points="15 18 9 12 15 6"/>,
  chev:    <polyline points="9 18 15 12 9 6"/>,
  cal:     <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
  crown:   <><path d="M3 8l3 9h12l3-9-5 4-4-7-4 7-5-4z"/><path d="M6 20h12"/></>,
  info:    <><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="17"/></>,
  check:   <polyline points="5 12 10 17 19 7"/>,
  lock:    <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>,
};

// ════════════════════════════════════════════════════════════════
// SUB HEADER
// ════════════════════════════════════════════════════════════════
function NSubHeader() {
  return (
    <header style={{
      position: 'relative',
      padding: '54px 18px 16px',
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
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <button aria-label="戻る" style={{
          width: 36, height: 36, marginTop: -2, borderRadius: 999,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--ink-soft)', marginLeft: -8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <NIcon d={NI.back} size={20} sw={1.8}/>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            margin: 0, font: '500 22px/1.2 var(--font-serif)',
            letterSpacing: '0.02em', color: 'var(--ink)',
          }}>顧客を追加</h1>
          <p style={{
            margin: '4px 0 0',
            font: '400 12px/1.4 var(--font-sans)',
            color: 'var(--ink-soft)', letterSpacing: '0.04em',
          }}>自分の担当として登録します</p>
        </div>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════
// HELPER HINT
// ════════════════════════════════════════════════════════════════
function HelperHint() {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      padding: '11px 14px 11px 13px',
      borderRadius: 'var(--radius-card)',
      background:
        'linear-gradient(135deg, var(--champagne-soft) 0%, rgba(245,232,210,0.55) 100%)',
      border: '1px solid rgba(184,148,85,0.28)',
      display: 'flex', alignItems: 'center', gap: 11,
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.55,
      }}/>
      <span style={{
        width: 26, height: 26, borderRadius: 999, flexShrink: 0,
        background: 'rgba(253,248,240,0.7)',
        border: '1px solid rgba(184,148,85,0.32)',
        color: 'var(--gold-deep)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <NIcon d={NI.info} size={14} sw={1.7}/>
      </span>
      <p style={{
        margin: 0, flex: 1, minWidth: 0,
        font: '400 12px/1.5 var(--font-sans)',
        color: 'var(--ink-soft)', letterSpacing: '0.02em',
      }}>
        LINE 交換情報は登録後の<span style={{ color: 'var(--ink)' }}>顧客カルテ</span>で追加できます
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// FIELD WRAPPER (label + optional required mark + control)
// ════════════════════════════════════════════════════════════════
function Field({ label, required, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '0 2px',
      }}>
        <label style={{
          font: '500 12px/1 var(--font-sans)', letterSpacing: '0.1em',
          color: 'var(--ink-soft)',
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          {label}
          {required && (
            <span style={{
              color: 'var(--rose-gold-deep)',
              font: '500 12px/1 var(--font-sans)',
            }}>*</span>
          )}
        </label>
        {hint && (
          <span style={{
            font: '400 10.5px/1 var(--font-sans)',
            color: 'var(--ink-mute)', letterSpacing: '0.06em',
          }}>{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── INPUT BASE (glass-pearl + ink/8 border, radius 14) ────────
const inputBaseStyle = {
  width: '100%',
  height: 48,
  padding: '0 14px',
  borderRadius: 14,
  background: 'rgba(255, 253, 248, 0.78)',
  backdropFilter: 'blur(16px) saturate(140%)',
  WebkitBackdropFilter: 'blur(16px) saturate(140%)',
  border: '1px solid rgba(42, 31, 26, 0.08)',
  color: 'var(--ink)',
  font: '500 15px/1.4 var(--font-serif)',
  letterSpacing: '0.02em',
  outline: 'none',
  boxSizing: 'border-box',
};

const FOCUS_RING = '0 0 0 1px var(--rose-gold-deep)';

// ════════════════════════════════════════════════════════════════
// TEXT INPUT
// ════════════════════════════════════════════════════════════════
function TextInput({ placeholder, type = 'text', value, onChange, focused, onFocus, onBlur }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      style={{
        ...inputBaseStyle,
        boxShadow: focused ? FOCUS_RING : 'var(--shadow-soft)',
      }}
    />
  );
}

// ════════════════════════════════════════════════════════════════
// TEXT AREA (2 rows)
// ════════════════════════════════════════════════════════════════
function TextArea({ placeholder, value, onChange, focused, onFocus, onBlur }) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      rows={2}
      style={{
        ...inputBaseStyle,
        height: 'auto',
        minHeight: 74,
        padding: '12px 14px',
        resize: 'none',
        font: '400 14px/1.55 var(--font-sans)',
        boxShadow: focused ? FOCUS_RING : 'var(--shadow-soft)',
      }}
    />
  );
}

// ════════════════════════════════════════════════════════════════
// DATE PILL (right calendar icon)
// ════════════════════════════════════════════════════════════════
function DatePill({ value, placeholder, focused, onFocus }) {
  return (
    <button onClick={onFocus} style={{
      ...inputBaseStyle, cursor: 'pointer',
      textAlign: 'left',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 10,
      boxShadow: focused ? FOCUS_RING : 'var(--shadow-soft)',
    }}>
      <span style={{
        font: '500 15px/1 var(--font-serif)',
        color: value ? 'var(--ink)' : 'var(--ink-mute)',
        letterSpacing: '0.02em',
      }}>{value || placeholder}</span>
      <span style={{ color: 'var(--rose-gold-deep)', display: 'inline-flex' }}>
        <NIcon d={NI.cal} size={15} sw={1.7}/>
      </span>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════
// SELECT PILL (champagne-soft inner edge, right chevron)
// ════════════════════════════════════════════════════════════════
function SelectPill({ value, placeholder, focused, onFocus }) {
  return (
    <button onClick={onFocus} style={{
      ...inputBaseStyle, cursor: 'pointer',
      textAlign: 'left',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 10, padding: '0 12px 0 6px',
      boxShadow: focused ? FOCUS_RING : 'var(--shadow-soft)',
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '6px 12px', borderRadius: 10,
        background: 'var(--champagne-soft)',
        border: '1px solid rgba(184,148,85,0.22)',
      }}>
        <span style={{
          width: 22, height: 22, borderRadius: 999,
          background: 'var(--champagne-metallic)',
          border: '1px solid rgba(255,255,255,0.7)',
          font: '500 11px/1 var(--font-serif)',
          color: 'var(--ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{(value || '?').slice(0, 1)}</span>
        <span style={{
          font: '500 13.5px/1 var(--font-serif)',
          color: value ? 'var(--ink)' : 'var(--ink-mute)',
          letterSpacing: '0.02em',
        }}>{value || placeholder}</span>
      </span>
      <NIcon d={NI.chev} size={14} sw={1.8} />
    </button>
  );
}

// ════════════════════════════════════════════════════════════════
// DISABLED PILL (担当キャスト固定)
// ════════════════════════════════════════════════════════════════
function DisabledPill({ value }) {
  return (
    <div style={{
      ...inputBaseStyle,
      background: 'var(--pearl-soft)',
      color: 'var(--ink-mute)',
      cursor: 'not-allowed',
      display: 'inline-flex', alignItems: 'center', gap: 10,
      font: '500 14px/1 var(--font-serif)',
      letterSpacing: '0.02em',
      boxShadow: 'none',
    }}>
      <NIcon d={NI.lock} size={13} sw={1.6}/>
      {value}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SEGMENTED (4 options, equal width)
// ════════════════════════════════════════════════════════════════
function Segmented({ options, value, onChange }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`,
      gap: 4, padding: 4,
      borderRadius: 14,
      background: 'rgba(245, 239, 230, 0.7)',
      border: '1px solid rgba(42, 31, 26, 0.08)',
    }}>
      {options.map(opt => {
        const on = opt === value;
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{
            height: 38, borderRadius: 11, border: 'none', cursor: 'pointer',
            background: on ? 'var(--pearl-light)' : 'transparent',
            color: on ? 'var(--ink)' : 'var(--ink-mute)',
            font: `${on ? 600 : 500} 12.5px/1 var(--font-sans)`,
            letterSpacing: '0.04em',
            boxShadow: on
              ? '0 1px 3px rgba(43,35,42,0.08), 0 0 0 1px var(--line)'
              : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{opt}</button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// VIP TOGGLE ROW
// ════════════════════════════════════════════════════════════════
function VipToggleRow({ on, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px',
      borderRadius: 'var(--radius-card)',
      background: 'rgba(255, 253, 248, 0.78)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-soft)',
      position: 'relative', overflow: 'hidden',
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.55,
      }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 32, height: 32, borderRadius: 999,
          background: 'transparent',
          border: '1px solid var(--gold)',
          color: 'var(--gold-deep)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <NIcon d={NI.crown} size={16} sw={1.7}/>
        </span>
        <div>
          <div style={{
            font: '500 14.5px/1.2 var(--font-serif)',
            color: 'var(--ink)', letterSpacing: '0.02em',
          }}>VIP として登録</div>
          <div style={{
            marginTop: 3,
            font: '400 11px/1.3 var(--font-sans)',
            color: 'var(--ink-mute)', letterSpacing: '0.02em',
          }}>カルテに金 ribbon と VIP バッジが付きます</div>
        </div>
      </div>

      {/* switch */}
      <button onClick={() => onChange(!on)} aria-pressed={on} style={{
        width: 50, height: 30, borderRadius: 999, border: 'none', cursor: 'pointer',
        background: on ? 'var(--rose-gold-deep)' : 'var(--pearl-deep)',
        position: 'relative', flexShrink: 0,
        boxShadow: on
          ? 'inset 0 0 0 1px var(--rose-gold-ink), 0 1px 2px rgba(110,42,51,0.18)'
          : 'inset 0 0 0 1px var(--line-strong)',
        transition: 'background .2s ease',
      }}>
        <span aria-hidden style={{
          position: 'absolute', top: 2, left: on ? 22 : 2,
          width: 26, height: 26, borderRadius: 999,
          background: '#fdfcf9',
          boxShadow: '0 1px 3px rgba(43,35,42,0.18)',
          transition: 'left .2s ease',
        }}/>
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// STICKY CTA FOOTER
// ════════════════════════════════════════════════════════════════
function StickyCta({ enabled }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30,
      paddingTop: 14, paddingLeft: 18, paddingRight: 18, paddingBottom: 30,
      background:
        'linear-gradient(180deg, rgba(253,248,240,0) 0%, rgba(253,248,240,0.95) 28%, var(--pearl-light) 100%)',
      backdropFilter: 'blur(16px) saturate(160%)',
      WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    }}>
      {/* rose-gold hairline at top */}
      <span aria-hidden style={{
        position: 'absolute', top: 0, left: 18, right: 18, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.55,
      }}/>
      <button style={{
        width: '100%', height: 52, borderRadius: 999, cursor: 'pointer',
        background: enabled ? 'var(--rose-gold-deep)' : 'var(--pearl-deep)',
        color: enabled ? '#fdfcf9' : 'var(--ink-mute)',
        border: 'none',
        font: '500 16px/1 var(--font-serif)', letterSpacing: '0.08em',
        boxShadow: enabled ? 'var(--shadow-luxe)' : 'none',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        登録する
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PAGE COMPOSER
// ════════════════════════════════════════════════════════════════
function NewCustomerScreen() {
  const [name, setName]       = React.useState('田中 太郎');
  const [kana, setKana]       = React.useState('たなか たろう');
  const [tel, setTel]         = React.useState('080-1234-5678');
  const [bday, setBday]       = React.useState('1985年 12月 3日');
  const [job, setJob]         = React.useState('IT企業 役員');
  const [hobby, setHobby]     = React.useState('ゴルフ / ワイン / 葉巻 (CAO)');
  const [memo, setMemo]       = React.useState('氷少なめ希望。長居は 2 時間程度。');
  const [referrer, setReferrer] = React.useState('佐藤 一郎 さま');
  const [channel, setChannel] = React.useState('店舗紹介');
  const [vip, setVip]         = React.useState(true);
  const [focused, setFocused] = React.useState(null);

  const focusBind = (key) => ({
    focused: focused === key,
    onFocus: () => setFocused(key),
    onBlur: () => setFocused(null),
  });

  return (
    <div data-screen-label="01 New Customer" style={{
      position: 'relative', minHeight: '100%',
      background: 'linear-gradient(180deg, #f3eadb 0%, #efe5d4 100%)',
      paddingBottom: 130,
    }}>
      <NSubHeader/>

      <main style={{
        padding: '18px 20px 0',
        display: 'flex', flexDirection: 'column', gap: 22,
      }}>
        <HelperHint/>

        {/* Field stack — gap 14 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="お名前" required>
            <TextInput placeholder="田中 太郎"
              value={name} onChange={e => setName(e.target.value)}
              {...focusBind('name')}/>
          </Field>

          <Field label="ふりがな">
            <TextInput placeholder="たなか たろう"
              value={kana} onChange={e => setKana(e.target.value)}
              {...focusBind('kana')}/>
          </Field>

          <Field label="電話番号" hint="任意">
            <TextInput type="tel" placeholder="090-0000-0000"
              value={tel} onChange={e => setTel(e.target.value)}
              {...focusBind('tel')}/>
          </Field>

          <Field label="誕生日" hint="任意">
            <DatePill value={bday} placeholder="生年月日を選択"
              focused={focused === 'bday'}
              onFocus={() => setFocused(focused === 'bday' ? null : 'bday')}/>
          </Field>

          <Field label="職業 / 業界">
            <TextInput placeholder="例: IT企業 役員"
              value={job} onChange={e => setJob(e.target.value)}
              {...focusBind('job')}/>
          </Field>

          <Field label="趣味・好きな話題">
            <TextArea placeholder="例: ゴルフ、ワイン、家族の話"
              value={hobby} onChange={e => setHobby(e.target.value)}
              {...focusBind('hobby')}/>
          </Field>

          <Field label="特記事項">
            <TextArea placeholder="氷少なめ、葉巻可、長居しない、など"
              value={memo} onChange={e => setMemo(e.target.value)}
              {...focusBind('memo')}/>
          </Field>

          <Field label="紹介者">
            <SelectPill value={referrer} placeholder="お客様 / お連れ様を選択"
              focused={focused === 'ref'}
              onFocus={() => setFocused(focused === 'ref' ? null : 'ref')}/>
          </Field>

          <Field label="担当キャスト" hint="自動">
            <DisabledPill value="あかり (あなた)"/>
          </Field>

          <Field label="来店経路">
            <Segmented
              options={['店舗紹介', '同伴', 'SNS', 'その他']}
              value={channel} onChange={setChannel}
            />
          </Field>
        </div>

        <VipToggleRow on={vip} onChange={setVip}/>
      </main>

      <StickyCta enabled={name.length > 0}/>
    </div>
  );
}

Object.assign(window, { NewCustomerScreen });
