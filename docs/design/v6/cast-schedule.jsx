// ════════════════════════════════════════════════════════════════
// NIGHTOS · /cast/schedule — Cast Schedule (Calendar) Screen
// 構成: Header → Month switcher → Summary (3-col) → Calendar Grid
//        → Selected Day Sheet → FAB + TabBar
// Luxury Lady Night v3. cast-home と同じトークン・コンポーネント言語。
// ════════════════════════════════════════════════════════════════

// ─── Icons (Lucide-style, stroke 1.6) ───────────────────────────
const SchedIcon = ({ d, size = 18, sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'block', flexShrink: 0 }}>
    {d}
  </svg>
);
const SI = {
  cal:    <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
  home:   <><path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/></>,
  users:  <><circle cx="9" cy="8" r="3"/><path d="M3 21c0-3.5 3-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.5"/></>,
  msg:    <><path d="M21 11c0 4-4 7-9 7-1 0-2-.1-3-.4L4 19l1.5-3.5C4.6 14.3 4 12.7 4 11c0-4 4-7 8.5-7s8.5 3 8.5 7z"/></>,
  sparkle:<><path d="M12 3l1.6 4.8L18 9.5l-4.4 1.7L12 16l-1.6-4.8L6 9.5l4.4-1.7z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></>,
  chevL:  <polyline points="15 18 9 12 15 6"/>,
  chevR:  <polyline points="9 18 15 12 9 6"/>,
  plus:   <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  arrow:  <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></>,
  edit:   <><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/></>,
};

// ════════════════════════════════════════════════════════════════
// 1) HEADER — 戻る + 大見出し「スケジュール」 + 今日へ pill
// ════════════════════════════════════════════════════════════════
function SchedHeader({ onToToday }) {
  return (
    <header style={{
      position: 'relative',
      padding: '58px 18px 14px',
      background:
        'radial-gradient(ellipse at top left, var(--rose-gold-soft) 0%, transparent 60%),' +
        'radial-gradient(ellipse at top right, var(--champagne-soft) 0%, transparent 65%),' +
        'linear-gradient(180deg, var(--pearl-light) 0%, var(--pearl) 100%)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12,
      }}>
        {/* back chevron — glass-pearl micro button */}
        <button aria-label="戻る" style={{
          width: 38, height: 38, borderRadius: 999,
          background: 'var(--glass-pearl)',
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          border: '1px solid var(--line)',
          color: 'var(--ink-soft)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SchedIcon d={SI.chevL} size={17} sw={1.8} />
        </button>

        {/* 今日へ pill — pearl-warm + rose-gold-ink border */}
        <button onClick={onToToday} style={{
          height: 32, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
          background: 'var(--pearl-light)',
          border: '1px solid var(--rose-gold-ink)',
          color: 'var(--rose-gold-ink)',
          font: '600 11px/1 var(--font-sans)', letterSpacing: '0.12em',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: 999,
            background: 'var(--rose-gold-deep)',
          }}/>
          今日へ
        </button>
      </div>

      {/* large title */}
      <span style={{
        display: 'block', marginTop: 14,
        font: '500 10px/1 var(--font-sans)', letterSpacing: '0.18em',
        color: 'var(--ink-mute)',
      }}>NIGHTOS</span>
      <h1 style={{
        margin: '6px 2px 0',
        font: '500 28px/1.2 var(--font-serif)',
        letterSpacing: '0.02em',
        color: 'var(--ink)',
      }}>スケジュール</h1>
      <p style={{
        margin: '4px 2px 0',
        font: '400 11.5px/1.4 var(--font-sans)', color: 'var(--ink-mute)',
        letterSpacing: '0.06em',
      }}>シフトと同伴予定を月で確認</p>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════
// 2) MONTH SWITCHER — Pearl Glass bar + ChevL / ChevR pills
// ════════════════════════════════════════════════════════════════
function MonthSwitcher({ year, month }) {
  const chev = (icon, label) => (
    <button aria-label={label} style={{
      width: 34, height: 34, borderRadius: 999,
      background: 'var(--glass-pearl)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      border: '1px solid var(--line)',
      color: 'var(--ink-soft)', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <SchedIcon d={icon} size={15} sw={1.8} />
    </button>
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'rgba(253, 248, 240, 0.72)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-soft)',
      }}>
        {chev(SI.chevL, '前の月')}

        {/* center title — Cormorant numerals + Noto Serif 年/月 */}
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 4,
          color: 'var(--ink)',
        }}>
          <span style={{
            font: '400 22px/1 var(--font-display)', letterSpacing: '0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}>{year}</span>
          <span style={{
            font: '500 13px/1 var(--font-serif)', color: 'var(--ink-soft)',
            letterSpacing: '0.04em',
          }}>年</span>
          <span style={{
            marginLeft: 8,
            font: '400 28px/1 var(--font-display)',
            color: 'var(--rose-gold-ink)', letterSpacing: '0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}>{month}</span>
          <span style={{
            font: '500 13px/1 var(--font-serif)', color: 'var(--ink-soft)',
            letterSpacing: '0.04em',
          }}>月</span>
        </div>

        {chev(SI.chevR, '次の月')}
      </div>
      {/* rose-gold hairline divider */}
      <div aria-hidden style={{
        height: 1, margin: '10px 6px 0',
        background:
          'linear-gradient(90deg, transparent 0%, rgba(184,148,85,0.45) 20%, ' +
          'rgba(168,117,96,0.55) 50%, rgba(184,148,85,0.45) 80%, transparent 100%)',
      }}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 3) SUMMARY — 3-column glass tile (出勤 / 公休 / 同伴予定)
// ════════════════════════════════════════════════════════════════
function SummaryTile({ workDays, offDays, douhanDays }) {
  const Cell = ({ label, value, unit, accent }) => (
    <div style={{
      flex: 1, minWidth: 0,
      display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start',
    }}>
      <div style={{
        font: '500 10px/1 var(--font-sans)', letterSpacing: '0.16em',
        color: 'var(--ink-mute)',
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{
          font: '400 26px/1 var(--font-display)',
          color: accent, letterSpacing: '0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>{value}</span>
        <span style={{
          font: '400 11px/1 var(--font-sans)', color: 'var(--ink-soft)',
        }}>{unit}</span>
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      padding: '14px 16px',
      borderRadius: 'var(--radius-2xl)',
      background: 'rgba(253, 248, 240, 0.72)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-soft)',
      display: 'flex', gap: 8,
    }}>
      {/* 上端 hairline — cast-home KPI と同じ */}
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 2,
        background: 'var(--gold-metallic)', opacity: 0.55,
      }}/>
      <Cell label="出勤"     value={workDays}   unit="日" accent="var(--ink)" />
      <span aria-hidden style={{ width: 1, background: 'var(--line)', alignSelf: 'stretch' }}/>
      <Cell label="公休"     value={offDays}    unit="日" accent="var(--ink)" />
      <span aria-hidden style={{ width: 1, background: 'var(--line)', alignSelf: 'stretch' }}/>
      <Cell label="同伴予定" value={douhanDays} unit="件" accent="var(--rose-gold-deep)" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 4) CALENDAR GRID
// ════════════════════════════════════════════════════════════════
const DOW = ['日', '月', '火', '水', '木', '金', '土'];

function dowColor(idx) {
  if (idx === 0) return 'var(--wine)';          // 日
  if (idx === 6) return 'var(--champagne-deep)'; // 土
  return 'var(--ink-mute)';
}

function CalendarCell({ day, dow, status, douhan, isToday, isSelected, onSelect }) {
  const isOff = status === 'off';
  const isWork = status === 'work';

  // base bg
  let bg = 'transparent';
  if (isOff)      bg = 'var(--pearl-soft)';
  if (isSelected) bg = 'rgba(253, 248, 240, 0.92)';

  // number color
  let numColor = 'var(--ink)';
  if (isOff)             numColor = 'var(--ink-mute)';
  else if (dow === 0)    numColor = 'var(--wine)';
  else if (dow === 6)    numColor = 'var(--champagne-deep)';

  // ring (today / selected)
  let ring = 'none';
  if (isSelected)    ring = 'inset 0 0 0 1px var(--rose-gold-deep)';
  else if (isToday)  ring = 'inset 0 0 0 1px var(--gold)';

  return (
    <button onClick={onSelect} style={{
      position: 'relative', aspectRatio: '1 / 1.05',
      padding: 0, border: 'none', cursor: day ? 'pointer' : 'default',
      background: bg,
      borderRadius: 12,
      boxShadow:
        (isSelected ? 'var(--shadow-warm), ' : '') + ring,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      paddingTop: 8,
    }}>
      {/* 出勤 上端 hairline — rose-gold-metallic, extra-thin */}
      {isWork && (
        <span aria-hidden style={{
          position: 'absolute', left: 6, right: 6, top: 0, height: 1.5,
          background: 'var(--gold-metallic)', opacity: 0.7,
          borderRadius: 1,
        }}/>
      )}

      {/* 同伴予定 — 右上 champagne-deep dot */}
      {douhan && day && (
        <span aria-hidden style={{
          position: 'absolute', top: 5, right: 5,
          width: 5, height: 5, borderRadius: 999,
          background: 'var(--champagne-deep)',
          boxShadow: '0 0 0 1.5px rgba(253,248,240,0.9)',
        }}/>
      )}

      {/* 日付 */}
      {day && (
        <span style={{
          font: '400 20px/1 var(--font-display)',
          color: numColor,
          letterSpacing: '0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}>{day}</span>
      )}

      {/* 出勤 dot — small rose-gold-deep dot below number */}
      {isWork && (
        <span aria-hidden style={{
          marginTop: 6,
          width: 4, height: 4, borderRadius: 999,
          background: 'var(--rose-gold-deep)',
        }}/>
      )}
      {isOff && (
        <span aria-hidden style={{
          marginTop: 6,
          font: '500 8px/1 var(--font-sans)',
          letterSpacing: '0.14em',
          color: 'var(--ink-mute)',
        }}>休</span>
      )}
    </button>
  );
}

function CalendarGrid({ firstWeekday, daysInMonth, schedule, today, selected, onSelect }) {
  // build cells: leading blanks + days
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{
      padding: '14px 12px 12px',
      borderRadius: 'var(--radius-2xl)',
      background: 'rgba(253, 248, 240, 0.55)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-soft)',
    }}>
      {/* DOW header */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 4, marginBottom: 8, padding: '0 2px',
      }}>
        {DOW.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center',
            font: '500 11px/1 var(--font-sans)',
            letterSpacing: '0.18em',
            color: dowColor(i),
            paddingBottom: 6,
            borderBottom: '1px solid var(--line)',
          }}>{d}</div>
        ))}
      </div>

      {/* cells */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 4,
      }}>
        {cells.map((d, i) => (
          <CalendarCell
            key={i}
            day={d}
            dow={i % 7}
            status={d ? schedule.statusFor(d) : null}
            douhan={d ? schedule.hasDouhan(d) : false}
            isToday={d === today}
            isSelected={d === selected}
            onSelect={d ? () => onSelect(d) : undefined}
          />
        ))}
      </div>

      {/* legend */}
      <div style={{
        display: 'flex', gap: 14, justifyContent: 'center',
        marginTop: 12, paddingTop: 10,
        borderTop: '1px solid var(--line)',
      }}>
        <LegendDot color="var(--rose-gold-deep)" label="出勤" />
        <LegendDot color="var(--ink-mute)" label="公休" filled />
        <LegendDot color="var(--champagne-deep)" label="同伴予定" />
      </div>
    </div>
  );
}

function LegendDot({ color, label, filled }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{
        width: 6, height: 6, borderRadius: 999,
        background: filled ? 'var(--pearl-deep)' : color,
        border: filled ? '1px solid var(--line-strong)' : 'none',
      }}/>
      <span style={{
        font: '400 10.5px/1 var(--font-sans)',
        letterSpacing: '0.08em',
        color: 'var(--ink-soft)',
      }}>{label}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 5) SELECTED DAY DETAIL SHEET
// ════════════════════════════════════════════════════════════════
function StatusPill({ status }) {
  if (status === 'off') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 11px', borderRadius: 999,
        background: 'var(--pearl-soft)',
        color: 'var(--ink-soft)',
        border: '1px solid var(--line-strong)',
        font: '500 11px/1 var(--font-sans)', letterSpacing: '0.1em',
      }}>公休</span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 999,
      background: 'var(--rose-gold-deep)',
      color: '#fdfcf9',
      font: '600 11px/1 var(--font-sans)', letterSpacing: '0.12em',
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: 999, background: '#fdfcf9',
      }}/>
      出勤
    </span>
  );
}

function CustomerChip({ initial, name, time }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 12px 6px 6px', borderRadius: 999,
      background: 'var(--pearl-light)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-soft)',
    }}>
      <span style={{
        width: 26, height: 26, borderRadius: 999,
        background: 'var(--champagne-metallic)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        font: '500 12px/1 var(--font-serif)',
        color: 'var(--ink)',
        border: '1px solid rgba(255,255,255,0.7)',
        boxShadow: 'inset 0 0 0 1px rgba(168,117,96,0.18)',
      }}>{initial}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{
          font: '500 12.5px/1 var(--font-serif)', color: 'var(--ink)',
          letterSpacing: '0.02em',
        }}>{name}</span>
        <span style={{
          font: '400 9.5px/1 var(--font-display)',
          color: 'var(--rose-gold-ink)', letterSpacing: '0.04em',
        }}>{time}</span>
      </div>
    </div>
  );
}

function SelectedDaySheet({ day }) {
  const { date, dow, status, start, end, douhan } = day;
  return (
    <section style={{
      position: 'relative',
      marginTop: 18,
      padding: '20px 20px 22px',
      borderTopLeftRadius: 28, borderTopRightRadius: 28,
      borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
      background: 'var(--pearl-light)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-warm)',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* sheet grip — quiet hairline accent */}
      <span aria-hidden style={{
        position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
        width: 34, height: 3, borderRadius: 999,
        background: 'var(--gold-metallic)', opacity: 0.6,
      }}/>

      {/* heading row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <h2 style={{
            margin: 0,
            font: '500 22px/1.2 var(--font-serif)',
            color: 'var(--ink)', letterSpacing: '0.02em',
          }}>
            <span style={{
              font: '400 26px/1 var(--font-display)',
              color: 'var(--rose-gold-ink)', letterSpacing: '0.02em',
              marginRight: 2,
              fontVariantNumeric: 'tabular-nums',
            }}>5</span>月
            <span style={{
              font: '400 26px/1 var(--font-display)',
              color: 'var(--rose-gold-ink)', letterSpacing: '0.02em',
              margin: '0 1px 0 4px',
              fontVariantNumeric: 'tabular-nums',
            }}>{date}</span>日
          </h2>
          <span style={{
            font: '400 13px/1 var(--font-serif)', color: 'var(--ink-soft)',
            letterSpacing: '0.04em',
          }}>({dow})</span>
        </div>
        <StatusPill status={status} />
      </div>

      {status === 'work' ? (
        <>
          {/* time */}
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 10,
            padding: '10px 14px',
            background: 'var(--pearl-soft)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--line)',
          }}>
            <span style={{
              font: '500 10px/1 var(--font-sans)', letterSpacing: '0.18em',
              color: 'var(--ink-mute)',
            }}>SHIFT</span>
            <span style={{
              font: '400 24px/1 var(--font-display)',
              color: 'var(--ink)', letterSpacing: '0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}>{start}</span>
            <SchedIcon d={SI.arrow} size={13} sw={1.6} />
            <span style={{
              font: '400 13px/1 var(--font-serif)', color: 'var(--ink-soft)',
            }}>翌</span>
            <span style={{
              font: '400 24px/1 var(--font-display)',
              color: 'var(--ink)', letterSpacing: '0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}>{end}</span>
          </div>

          {/* douhan section */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 8,
              marginBottom: 10,
            }}>
              <span aria-hidden style={{
                width: 3, height: 14, borderRadius: 2,
                background: 'var(--gold-metallic)',
                alignSelf: 'center',
              }}/>
              <h3 style={{
                margin: 0,
                font: '500 14px/1 var(--font-serif)', color: 'var(--ink)',
                letterSpacing: '0.02em',
              }}>同伴予定</h3>
              <span style={{
                font: '400 13px/1 var(--font-display)',
                color: 'var(--rose-gold-deep)', letterSpacing: '0.04em',
              }}>{douhan.length}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {douhan.map(c => (
                <CustomerChip key={c.name} {...c} />
              ))}
            </div>
          </div>

          {/* CTA — シフトを変更 (rose-gold-deep outline pill) */}
          <button style={{
            alignSelf: 'flex-start',
            height: 38, padding: '0 18px', borderRadius: 999, cursor: 'pointer',
            background: 'transparent',
            color: 'var(--rose-gold-deep)',
            border: '1px solid var(--rose-gold-deep)',
            font: '600 12.5px/1 var(--font-sans)', letterSpacing: '0.06em',
            display: 'inline-flex', alignItems: 'center', gap: 7,
            marginTop: 2,
          }}>
            <SchedIcon d={SI.edit} size={13} sw={1.8} />
            シフトを変更
          </button>
        </>
      ) : (
        <>
          <div style={{
            padding: '14px 16px',
            background: 'var(--pearl-soft)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--line)',
            font: '500 13.5px/1.6 var(--font-serif)',
            color: 'var(--ink-soft)', letterSpacing: '0.02em',
          }}>
            この日はお休みです。ゆっくりお過ごしください。
          </div>
          <button style={{
            alignSelf: 'flex-start',
            height: 38, padding: '0 18px', borderRadius: 999, cursor: 'pointer',
            background: 'transparent',
            color: 'var(--rose-gold-deep)',
            border: '1px solid var(--rose-gold-deep)',
            font: '600 12.5px/1 var(--font-sans)', letterSpacing: '0.06em',
            display: 'inline-flex', alignItems: 'center', gap: 7,
          }}>
            <SchedIcon d={SI.edit} size={13} sw={1.8} />
            シフトを変更
          </button>
        </>
      )}
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// 6) FAB — シフト追加
// ════════════════════════════════════════════════════════════════
function SchedFAB() {
  return (
    <button aria-label="シフト追加" style={{
      position: 'absolute', right: 18, bottom: 96, zIndex: 30,
      height: 52, padding: '0 20px 0 18px', borderRadius: 999,
      background: 'var(--wine-deep)',
      color: '#fdfcf9',
      border: 'none',
      boxShadow:
        '0 0 0 1px rgba(235,217,168,0.65), ' +
        '0 0 0 3px var(--wine-deep), ' +
        '0 0 0 4px rgba(235,217,168,0.40), ' +
        '0 8px 20px rgba(45,24,24,0.55), 0 28px 56px rgba(20,10,10,0.45)',
      display: 'inline-flex', alignItems: 'center', gap: 8,
      cursor: 'pointer',
      font: '600 13px/1 var(--font-sans)', letterSpacing: '0.08em',
    }}>
      <SchedIcon d={SI.plus} size={20} sw={2} />
      シフト追加
    </button>
  );
}

// ════════════════════════════════════════════════════════════════
// 7) TAB BAR — 5 tabs, 予定 active
// ════════════════════════════════════════════════════════════════
function SchedTabBar() {
  const tabs = [
    { key: 'home',  label: 'ホーム',     icon: SI.home },
    { key: 'cust',  label: '顧客',       icon: SI.users },
    { key: 'mama',  label: 'さくらママ', icon: SI.sparkle },
    { key: 'chat',  label: 'チャット',   icon: SI.msg },
    { key: 'sched', label: '予定',       icon: SI.cal },
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
          const on = t.key === 'sched';
          return (
            <button key={t.key} style={{
              flex: 1, padding: '8px 0 6px', border: 'none', background: 'transparent',
              cursor: 'pointer', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              color: on ? 'var(--wine-deep)' : 'var(--ink-mute)',
            }}>
              <SchedIcon d={t.icon} size={20} sw={on ? 1.8 : 1.5}/>
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
// SCHEDULE DATA (spec convention: May 20 = 火 → May 1 = 木)
// ════════════════════════════════════════════════════════════════
const OFF_DAYS    = new Set([3, 10, 11, 17, 24, 25, 31]);
const DOUHAN_DAYS = new Set([5, 8, 13, 20, 22, 27]);

const SCHEDULE_API = {
  statusFor: (d) => OFF_DAYS.has(d) ? 'off' : 'work',
  hasDouhan: (d) => DOUHAN_DAYS.has(d),
};

const DAY_DETAIL_20 = {
  date: 20, dow: '火',
  status: 'work',
  start: '19:00', end: '01:00',
  douhan: [
    { initial: '田', name: '田中 太郎', time: '18:00 銀座' },
    { initial: '渡', name: '渡辺 美咲', time: '18:30 六本木' },
  ],
};

// ════════════════════════════════════════════════════════════════
// PAGE COMPOSER
// ════════════════════════════════════════════════════════════════
function CastScheduleScreen() {
  const [selected, setSelected] = React.useState(20);
  const today = 21;

  return (
    <div data-screen-label="02 Cast Schedule" style={{
      position: 'relative', minHeight: '100%',
      background: 'linear-gradient(180deg, #f3eadb 0%, #efe5d4 100%)',
      paddingBottom: 110,
    }}>
      <SchedHeader onToToday={() => setSelected(today)} />

      <main style={{
        padding: '0 18px',
        display: 'flex', flexDirection: 'column', gap: 22,
        marginTop: -6,
      }}>
        <MonthSwitcher year={2026} month={5} />

        <SummaryTile workDays={24} offDays={7} douhanDays={6} />

        <CalendarGrid
          firstWeekday={4}   /* May 1 2026 = Thu (per spec) */
          daysInMonth={31}
          schedule={SCHEDULE_API}
          today={today}
          selected={selected}
          onSelect={setSelected}
        />

        <SelectedDaySheet day={DAY_DETAIL_20} />
      </main>

      <SchedFAB />
      <SchedTabBar />
    </div>
  );
}

Object.assign(window, { CastScheduleScreen });
