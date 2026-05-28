// ════════════════════════════════════════════════════════════════
// NIGHTOS · /cast/templates — メッセージテンプレート編集 + 差し込み
// 構成: SubHeader → Customer picker → Template library (2-col)
//      → Editor card (preview + textarea + placeholders + count)
//      → AI suggest pill
// ════════════════════════════════════════════════════════════════

const TIcon = ({ d, size = 14, sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'block', flexShrink: 0 }}>
    {d}
  </svg>
);
const TI = {
  back:    <polyline points="15 18 9 12 15 6"/>,
  plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  chev:    <polyline points="9 18 15 12 9 6"/>,
  send:    <><path d="M4 12l16-8-6 16-3-7-7-1z"/></>,
  copy:    <><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
  sparkle: <><path d="M12 3l1.6 4.8L18 9.5l-4.4 1.7L12 16l-1.6-4.8L6 9.5l4.4-1.7z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></>,
  msg:     <><path d="M21 11c0 4-4 7-9 7-1 0-2-.1-3-.4L4 19l1.5-3.5C4.6 14.3 4 12.7 4 11c0-4 4-7 8.5-7s8.5 3 8.5 7z"/></>,
  thanks:  <><path d="M12 21l-1.6-1.4C5 14.9 2 12.3 2 8.5A4.5 4.5 0 0 1 12 5a4.5 4.5 0 0 1 10 3.5c0 3.8-3 6.4-8.4 11.1z"/></>,
  cake:    <><path d="M4 11h16v9H4z"/><path d="M4 15c2 1 4 1 4 0s2 1 4 1 4-1 4-1 2 0 4 0"/><path d="M12 7v4M8 7v4M16 7v4"/></>,
  douhan:  <><circle cx="9" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 21c0-3 2.5-5 6-5s6 2 6 5"/><path d="M21 21c0-2-1.5-4-4-4.5"/></>,
  clock:   <><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></>,
};

// ════════════════════════════════════════════════════════════════
// SUB HEADER
// ════════════════════════════════════════════════════════════════
function TSubHeader() {
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
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <button aria-label="戻る" style={{
          width: 36, height: 36, marginTop: -2, borderRadius: 999,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--ink-soft)', marginLeft: -8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TIcon d={TI.back} size={20} sw={1.8}/>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            margin: 0, font: '500 22px/1.2 var(--font-serif)',
            letterSpacing: '0.02em', color: 'var(--ink)',
          }}>メッセージテンプレート</h1>
          <p style={{
            margin: '4px 0 0',
            font: '400 12px/1.4 var(--font-sans)',
            color: 'var(--ink-soft)', letterSpacing: '0.04em',
          }}>顧客情報を自動で挿入</p>
        </div>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════
// CUSTOMER PICKER
// ════════════════════════════════════════════════════════════════
function CustPicker({ value, onChange, items }) {
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
            background: on ? 'var(--rose-gold-deep)' : 'rgba(253,248,240,0.85)',
            color: on ? '#fdfcf9' : 'var(--ink-soft)',
            border: on ? '1px solid var(--rose-gold-deep)' : '1px solid var(--line-strong)',
            font: `${on ? 600 : 500} 12px/1 var(--font-sans)`,
            letterSpacing: '0.04em',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            boxShadow: on ? '0 2px 8px rgba(138,94,77,0.22)' : 'none',
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
// SECTION HEAD
// ════════════════════════════════════════════════════════════════
function SectionHead({ title, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '2px 2px 2px 14px', position: 'relative',
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 4, bottom: 4, width: 3,
        borderRadius: 2,
        background: 'var(--gold-metallic)',
      }}/>
      <h2 style={{
        margin: 0, font: '500 17px/1.3 var(--font-serif)',
        letterSpacing: '0.02em', color: 'var(--ink)',
      }}>{title}</h2>
      {right}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TEMPLATE CARD
// ════════════════════════════════════════════════════════════════
const TAG_STYLE = {
  thanks:   { c: 'var(--rose-gold-ink)', bg: 'rgba(176,122,92,0.10)', bd: 'rgba(138,94,77,0.28)', icon: TI.thanks, label: 'お礼' },
  birthday: { c: 'var(--wine-deep)',     bg: 'rgba(212,168,168,0.22)', bd: 'rgba(154,93,93,0.25)', icon: TI.cake,   label: '誕生日' },
  douhan:   { c: 'var(--gold-deep)',     bg: 'rgba(224,200,150,0.22)', bd: 'rgba(184,148,85,0.30)', icon: TI.douhan, label: '同伴のお誘い' },
  miss:     { c: 'var(--ink-soft)',      bg: 'var(--pearl-soft)',      bd: 'var(--line-strong)',    icon: TI.clock,  label: '久しぶり' },
};

function TplTag({ kind }) {
  const t = TAG_STYLE[kind];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px 3px 7px', borderRadius: 999,
      background: t.bg, color: t.c, border: `1px solid ${t.bd}`,
      font: '500 10px/1.2 var(--font-sans)', letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      <TIcon d={t.icon} size={10} sw={1.7}/> {t.label}
    </span>
  );
}

function TemplateCard({ tpl, active, onPick }) {
  return (
    <button onClick={onPick} style={{
      position: 'relative', overflow: 'hidden',
      padding: '12px 12px 14px',
      borderRadius: 'var(--radius-card)',
      background: active
        ? 'rgba(255, 253, 248, 0.92)'
        : 'rgba(255, 253, 248, 0.72)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      border: '1px solid var(--line)',
      boxShadow: active ? 'var(--shadow-warm), inset 0 0 0 1px var(--rose-gold-deep)' : 'var(--shadow-soft)',
      cursor: 'pointer', textAlign: 'left',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 1.5,
        background: 'var(--gold-metallic)', opacity: active ? 0.8 : 0.4,
      }}/>
      <TplTag kind={tpl.kind}/>
      <div style={{
        font: '500 13.5px/1.3 var(--font-serif)', color: 'var(--ink)',
        letterSpacing: '0.02em',
      }}>{tpl.title}</div>
      <p style={{
        margin: 0,
        font: '400 11px/1.45 var(--font-sans)',
        color: 'var(--ink-soft)', letterSpacing: '0.02em',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>{tpl.preview}</p>
      <span style={{
        position: 'absolute', bottom: 8, right: 8,
        color: 'var(--rose-gold-deep)', display: 'inline-flex',
      }}>
        <TIcon d={TI.chev} size={13} sw={1.8}/>
      </span>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════
// PREVIEW RENDERER — parses {{key}} → highlighted spans + substitution
// ════════════════════════════════════════════════════════════════
function PreviewText({ src, vars }) {
  const parts = [];
  const re = /(\{\{\s*[\w]+\s*\}\})/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(src)) !== null) {
    if (m.index > last) parts.push(src.slice(last, m.index));
    const key = m[0].replace(/[{}\s]/g, '');
    const filled = vars[key];
    parts.push(
      <span key={i++} style={{
        display: 'inline',
        padding: '1px 6px', borderRadius: 6,
        background: filled
          ? 'rgba(176,122,92,0.14)'
          : 'rgba(176,122,92,0.08)',
        color: 'var(--rose-gold-ink)',
        border: '1px dashed rgba(138,94,77,0.45)',
        font: '500 13px/1.55 var(--font-serif)',
        letterSpacing: '0.02em',
      }}>{filled || m[0]}</span>
    );
    last = m.index + m[0].length;
  }
  if (last < src.length) parts.push(src.slice(last));
  return <>{parts}</>;
}

// ════════════════════════════════════════════════════════════════
// EDITOR
// ════════════════════════════════════════════════════════════════
function Editor({ value, onChange, vars }) {
  const insertAt = React.useRef(null);
  const tplRef = React.useRef(null);
  const insertPlaceholder = (ph) => {
    onChange(value + ph);
  };
  const count = value.length;

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 'var(--radius-xl)',
      background: 'rgba(255, 253, 248, 0.78)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-warm)',
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.6,
      }}/>

      {/* head */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px 8px',
      }}>
        <div style={{ position: 'relative', paddingLeft: 12 }}>
          <span aria-hidden style={{
            position: 'absolute', left: 0, top: 2, bottom: 2, width: 3,
            borderRadius: 2,
            background: 'var(--gold-metallic)',
          }}/>
          <h3 style={{
            margin: 0, font: '500 15px/1.2 var(--font-serif)',
            letterSpacing: '0.02em', color: 'var(--ink)',
          }}>プレビュー</h3>
        </div>
        <button style={{
          height: 32, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
          background: 'var(--rose-gold-deep)',
          color: '#fdfcf9', border: 'none',
          font: '600 12px/1 var(--font-sans)', letterSpacing: '0.08em',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          boxShadow: '0 2px 8px rgba(138,94,77,0.32)',
        }}>
          <TIcon d={TI.send} size={12} sw={1.8}/>
          LINE で送る
        </button>
      </div>

      {/* preview (rendered) */}
      <div style={{
        margin: '0 14px',
        padding: '12px 14px',
        background: 'var(--pearl-light)',
        border: '1px solid var(--line)',
        borderRadius: 14,
        font: '500 13px/1.75 var(--font-serif)',
        color: 'var(--ink)', letterSpacing: '0.02em',
        whiteSpace: 'pre-wrap',
      }}>
        <PreviewText src={value} vars={vars}/>
      </div>

      {/* raw textarea */}
      <div style={{ padding: '10px 14px 8px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 6,
          font: '500 9.5px/1 var(--font-sans)', letterSpacing: '0.18em',
          color: 'var(--ink-mute)', textTransform: 'uppercase',
        }}>SOURCE — 編集</div>
        <textarea
          ref={tplRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={4}
          style={{
            width: '100%',
            padding: '10px 12px', borderRadius: 12,
            background: 'var(--pearl-soft)',
            border: '1px solid var(--line-strong)',
            color: 'var(--ink)',
            font: '400 13px/1.6 var(--font-sans)', letterSpacing: '0.02em',
            outline: 'none', resize: 'none',
            boxSizing: 'border-box',
            boxShadow: 'inset 0 1px 2px rgba(42,31,26,0.04)',
          }}
        />
      </div>

      {/* placeholder chip row */}
      <div style={{
        padding: '0 14px',
        display: 'flex', gap: 6, flexWrap: 'wrap',
      }}>
        {['{{name}}', '{{bottle}}', '{{last_visit}}', '{{birthday}}'].map(ph => (
          <button key={ph} onClick={() => insertPlaceholder(ph)} style={{
            height: 26, padding: '0 10px', borderRadius: 999, cursor: 'pointer',
            background: 'transparent',
            color: 'var(--rose-gold-ink)',
            border: '1px dashed rgba(138,94,77,0.45)',
            font: '500 11px/1 var(--font-sans)', letterSpacing: '0.04em',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <TIcon d={TI.plus} size={9} sw={2}/> {ph}
          </button>
        ))}
      </div>

      {/* count + copy */}
      <div style={{
        padding: '10px 14px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'baseline', gap: 4,
          font: '400 11px/1 var(--font-sans)',
          color: 'var(--ink-mute)', letterSpacing: '0.06em',
        }}>
          文字数
          <span style={{
            font: '400 16px/1 var(--font-display)',
            color: 'var(--ink)', letterSpacing: '0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}>{count}</span>
          <span style={{ color: 'var(--ink-mute)' }}>/ 200</span>
        </span>
        <button style={{
          height: 28, padding: '0 12px', borderRadius: 999, cursor: 'pointer',
          background: 'transparent',
          color: 'var(--ink-soft)',
          border: '1px solid var(--line-strong)',
          font: '500 11px/1 var(--font-sans)', letterSpacing: '0.06em',
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          <TIcon d={TI.copy} size={11} sw={1.7}/> コピー
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PAGE COMPOSER
// ════════════════════════════════════════════════════════════════
function TemplatesScreen() {
  const customers = [
    { key: 'all',    label: '全体' },
    { key: 'tanaka', label: '田中 太郎', initial: '田',
      vars: { name: '田中 太郎', bottle: '山崎12年', last_visit: '5月4日', birthday: '12月3日' }},
    { key: 'wata',   label: '渡辺 美咲', initial: '渡',
      vars: { name: '渡辺 美咲', bottle: 'モエ・ロゼ', last_visit: '5月12日', birthday: '5月28日' }},
    { key: 'sato',   label: '佐藤 一郎', initial: '佐',
      vars: { name: '佐藤 一郎', bottle: '響17年', last_visit: '5月10日', birthday: '6月15日' }},
  ];

  const templates = [
    { id: 'thanks', kind: 'thanks',
      title: 'お礼メッセージ (来店後)',
      body:
'{{name}} さま、本日はありがとうございました 🌸\n' +
'美味しい {{bottle}} をご一緒できてとても楽しかったです。\n' +
'お風邪などひかぬよう、お身体ご自愛くださいね。',
    },
    { id: 'bday',  kind: 'birthday',
      title: 'お誕生日メッセージ',
      body:
'{{name}} さま、お誕生日 ({{birthday}}) おめでとうございます🎂\n' +
'今年も素敵な一年になりますように。\n' +
'お祝いに、来週シャンパンご一緒できたら嬉しいです。',
    },
    { id: 'douhan', kind: 'douhan',
      title: '同伴のお誘い',
      body:
'{{name}} さま、お疲れさまです。\n' +
'今週どこかでお食事の同伴いかがですか? 銀座のいいお店、ご一緒できたら嬉しいです。',
    },
    { id: 'miss',  kind: 'miss',
      title: 'ボトル残り・久しぶり',
      body:
'{{name}} さま、{{last_visit}} ぶりです 🍾\n' +
'お預かりしている {{bottle}} がそろそろ少なめになっています。お時間あればぜひ。',
    },
  ];

  const [picked, setPicked]     = React.useState('tanaka');
  const [activeId, setActiveId] = React.useState('thanks');
  const [drafts, setDrafts]     = React.useState(
    Object.fromEntries(templates.map(t => [t.id, t.body]))
  );

  const vars = customers.find(c => c.key === picked)?.vars || {
    name: '{{name}}', bottle: '{{bottle}}', last_visit: '{{last_visit}}', birthday: '{{birthday}}',
  };
  const activeTpl = templates.find(t => t.id === activeId);
  const draft = drafts[activeId];
  const setDraft = (v) => setDrafts({ ...drafts, [activeId]: v });

  // build preview snippet (2 lines, vars substituted) for each card
  const renderPreview = (body) =>
    body.split('\n').slice(0, 2).join(' ')
      .replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] || `{{${k}}}`);

  return (
    <div data-screen-label="01 Templates" style={{
      position: 'relative', minHeight: '100%',
      background: 'linear-gradient(180deg, #f3eadb 0%, #efe5d4 100%)',
      paddingBottom: 30,
    }}>
      <TSubHeader/>

      <main style={{
        padding: '18px 20px 0',
        display: 'flex', flexDirection: 'column', gap: 22,
      }}>
        <CustPicker value={picked} onChange={setPicked} items={customers}/>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionHead title="テンプレート" right={
            <button style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: 0, color: 'var(--rose-gold-deep)',
              font: '600 11.5px/1 var(--font-sans)', letterSpacing: '0.06em',
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}>
              <TIcon d={TI.plus} size={11} sw={2}/> 新規
            </button>
          }/>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
          }}>
            {templates.map(t => (
              <TemplateCard
                key={t.id}
                tpl={{ ...t, preview: renderPreview(drafts[t.id]) }}
                active={t.id === activeId}
                onPick={() => setActiveId(t.id)}
              />
            ))}
          </div>
        </section>

        <Editor value={draft} onChange={setDraft} vars={vars}/>

        {/* AI suggest pill */}
        <button style={{
          width: '100%', height: 44, borderRadius: 999, cursor: 'pointer',
          background:
            'linear-gradient(135deg, var(--champagne-soft) 0%, rgba(245,232,210,0.55) 100%)',
          color: 'var(--wine-deep)',
          border: '1px solid rgba(184,148,85,0.32)',
          font: '500 13px/1 var(--font-serif)', letterSpacing: '0.04em',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: 'var(--shadow-soft)',
        }}>
          <TIcon d={TI.sparkle} size={14} sw={1.7}/>
          ママに添削してもらう
        </button>
      </main>
    </div>
  );
}

Object.assign(window, { TemplatesScreen });
