// ════════════════════════════════════════════════════════════════
// NIGHTOS · /cast/sakura-mama — PART 2: Bubbles / Quote chip /
// Example card / Composer / Page composer
// ════════════════════════════════════════════════════════════════

// ─── Avatar ─────────────────────────────────────────────────────
function MamaAvatar() {
  return (
    <span style={{
      width: 36, height: 36, borderRadius: 999, flexShrink: 0,
      background: 'var(--champagne-metallic)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      font: '500 14px/1 var(--font-serif)',
      color: 'var(--wine-deep)', letterSpacing: '0.02em',
      border: '1px solid rgba(240,226,200,0.6)',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5), 0 2px 6px rgba(110,42,51,0.12)',
    }}>桜</span>
  );
}

// ─── Quote chip (顧客カードのミニ chip, bubble 内に埋め込み) ────
function QuoteCustomerChip({ initial, name, meta }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 10px 6px 6px', borderRadius: 12,
      background: 'rgba(253,248,240,0.6)',
      border: '1px solid rgba(184,148,85,0.32)',
      boxShadow: 'inset 0 0 0 1px rgba(240,226,200,0.4)',
      marginTop: 8, marginBottom: 2,
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 999,
        background: 'var(--champagne-metallic)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        font: '500 11px/1 var(--font-serif)',
        color: 'var(--ink)',
        border: '1px solid rgba(255,255,255,0.7)',
      }}>{initial}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{
          font: '500 12px/1 var(--font-serif)', color: 'var(--ink)',
          letterSpacing: '0.02em',
        }}>{name}</span>
        <span style={{
          font: '400 9.5px/1 var(--font-sans)',
          color: 'var(--ink-mute)', letterSpacing: '0.04em',
        }}>{meta}</span>
      </div>
    </div>
  );
}

// ─── Bubble ─────────────────────────────────────────────────────
function MamaBubble({ side, hideName, time, children }) {
  const isOwn = side === 'own';
  return (
    <div style={{
      display: 'flex', gap: 8,
      flexDirection: isOwn ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      padding: '0 4px',
    }}>
      {!isOwn && (
        <div style={{ width: 36, flexShrink: 0 }}>
          {!hideName && <MamaAvatar/>}
        </div>
      )}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
        gap: 4, maxWidth: '78%',
      }}>
        {!isOwn && !hideName && (
          <span style={{
            font: '500 10px/1 var(--font-sans)', letterSpacing: '0.16em',
            color: 'var(--wine-soft)', textTransform: 'uppercase',
            paddingLeft: 2,
          }}>さくらママ</span>
        )}
        <div style={{
          padding: '11px 15px',
          borderRadius: 18,
          borderBottomRightRadius: isOwn ? 6 : 18,
          borderBottomLeftRadius:  isOwn ? 18 : 6,
          background: isOwn
            ? 'linear-gradient(135deg, #D4A88B 0%, #B07A5C 55%, #A0644A 100%)'
            : 'linear-gradient(180deg, var(--champagne-soft) 0%, rgba(245,232,210,0.85) 100%)',
          border: isOwn ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(184,148,85,0.28)',
          color: isOwn ? '#fdfcf9' : 'var(--ink)',
          font: '500 14px/1.65 var(--font-serif)',
          letterSpacing: '0.02em',
          boxShadow: isOwn
            ? '0 4px 14px rgba(110,42,51,0.16)'
            : '0 2px 8px rgba(184,148,85,0.10)',
        }}>
          {children}
        </div>
        <span style={{
          font: '400 10px/1 var(--font-display)',
          color: 'var(--ink-mute)', letterSpacing: '0.04em',
          fontVariantNumeric: 'tabular-nums',
          padding: '0 2px',
        }}>{time}</span>
      </div>
    </div>
  );
}

// ─── Example phrase card (cream 内枠) — bubble 内に埋め込み ─────
function ExampleCard({ title, lines }) {
  return (
    <div style={{
      marginTop: 10,
      padding: '11px 13px',
      borderRadius: 14,
      background: 'rgba(253,252,249,0.85)',
      border: '1px dashed rgba(110,42,51,0.32)',
      boxShadow: 'inset 0 0 0 1px rgba(245,232,210,0.6)',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 7,
        font: '500 9.5px/1 var(--font-sans)', letterSpacing: '0.18em',
        color: 'var(--wine-soft)', textTransform: 'uppercase',
      }}>
        <MIcon d={MI.quote} size={10} sw={1.8}/> {title}
      </div>
      {lines.map((l, i) => (
        <p key={i} style={{
          margin: i === 0 ? 0 : '6px 0 0',
          font: '400 13px/1.7 var(--font-serif)',
          color: 'var(--ink)', letterSpacing: '0.02em',
        }}>{l}</p>
      ))}
    </div>
  );
}

// ─── Composer (suggestion chips + textarea + send) ──────────────
function MamaComposer({ value, onChange, focused, onFocus, onBlur, onSuggest }) {
  const suggestions = ['もっと詳しく', '具体例ある?', '了解'];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30,
      padding: '10px 12px 24px',
      background:
        'linear-gradient(180deg, rgba(253,248,240,0) 0%, rgba(253,248,240,0.92) 22%, var(--pearl-light) 100%)',
      backdropFilter: 'blur(16px) saturate(160%)',
      WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    }}>
      <span aria-hidden style={{
        position: 'absolute', top: 0, left: 12, right: 12, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.55,
      }}/>

      {/* suggestion chips */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 10, padding: '0 4px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => onSuggest(s)} style={{
            flexShrink: 0,
            height: 28, padding: '0 12px', borderRadius: 999, cursor: 'pointer',
            background: 'transparent',
            color: 'var(--wine-deep)',
            border: '1px solid rgba(110,42,51,0.28)',
            font: '500 11.5px/1 var(--font-sans)', letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}>{s}</button>
        ))}
      </div>

      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 8,
      }}>
        <div style={{
          flex: 1, minWidth: 0,
          background: 'var(--pearl-soft)',
          border: '1px solid var(--line-strong)',
          borderRadius: 22,
          padding: '6px 14px',
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: focused
            ? '0 0 0 1px var(--wine-soft), inset 0 1px 2px rgba(42,31,26,0.04)'
            : 'inset 0 1px 2px rgba(42,31,26,0.04)',
        }}>
          <textarea
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="ママに相談する…"
            rows={1}
            style={{
              flex: 1, minWidth: 0,
              border: 'none', outline: 'none', background: 'transparent',
              resize: 'none', padding: '6px 0',
              font: '400 14px/1.4 var(--font-sans)',
              color: 'var(--ink)', letterSpacing: '0.02em',
              maxHeight: 100,
            }}
          />
        </div>

        <button aria-label="送信" style={{
          width: 36, height: 36, borderRadius: 999, flexShrink: 0,
          background: 'var(--wine-soft)',
          color: '#fdfcf9',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(110,42,51,0.32)',
        }}>
          <MIcon d={MI.send} size={16} sw={1.8}/>
        </button>
      </div>

      <p style={{
        margin: '8px 0 0', textAlign: 'center',
        font: '400 9px/1.4 var(--font-sans)',
        color: 'var(--ink-mute)', letterSpacing: '0.06em',
      }}>ChatGPT / Claude 製 — 個人情報は入力しないでください</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PAGE COMPOSER
// ════════════════════════════════════════════════════════════════
function RuriMamaScreen() {
  const customers = [
    { key: 'all',    label: '全体' },
    { key: 'tanaka', label: '田中 太郎', initial: '田' },
    { key: 'wata',   label: '渡辺 美咲', initial: '渡' },
    { key: 'sato',   label: '佐藤 一郎', initial: '佐' },
    { key: 'taka',   label: '高橋 健',   initial: '高' },
  ];
  const [picked, setPicked] = React.useState('tanaka');
  const [draft,  setDraft]  = React.useState('');
  const [focused,setFocused]= React.useState(false);

  return (
    <div data-screen-label="01 Sakura Mama" style={{
      position: 'relative', minHeight: '100%',
      background: 'linear-gradient(180deg, #f3eadb 0%, #efe5d4 100%)',
    }}>
      <RmHeader/>

      <LimitBanner used={3} total={10} resetAt="23:00"/>

      <main style={{
        padding: '16px 20px 230px',
        display: 'flex', flexDirection: 'column', gap: 18,
      }}>
        <CustomerPicker value={picked} onChange={setPicked} items={customers}/>

        <WelcomeCard onPick={(s) => setDraft(s)}/>

        {/* conversation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
          <MamaBubble side="other" time="22:14">
            最近の田中さま、来店間隔が空いてきたわね。
            <QuoteCustomerChip initial="田" name="田中 太郎"
              meta="最終来店 5/4 · 23 日経過 · 山崎キープ"/>
            あの方は寂しがり屋。LINE で少し触れてあげるといいわよ。
          </MamaBubble>

          <MamaBubble side="own" time="22:15">
            LINE で何送ったらいい?
          </MamaBubble>

          <MamaBubble side="other" hideName time="22:15">
            鉄板は <span style={{ color: 'var(--wine-soft)', fontWeight: 600 }}>3 行</span>。
            お礼 + お天気の話 + 次回の提案。例文を考えるわね。
            <ExampleCard title="EXAMPLE — TANAKA" lines={[
              '田中さま、先日はありがとうございました 🌸',
              '東京は急に暑くなってきましたね。お身体崩されていませんか?',
              '来週、新しいシャンパンが入りました。よかったら一杯いかがですか?',
            ]}/>
          </MamaBubble>

          <MamaBubble side="own" time="22:17">
            完璧。これそのまま送ってみる
          </MamaBubble>
        </div>
      </main>

      <MamaComposer
        value={draft}
        onChange={e => setDraft(e.target.value)}
        focused={focused}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onSuggest={(s) => setDraft(s)}
      />
    </div>
  );
}

Object.assign(window, {
  MamaAvatar, QuoteCustomerChip, MamaBubble, ExampleCard, MamaComposer,
  RuriMamaScreen,
});
