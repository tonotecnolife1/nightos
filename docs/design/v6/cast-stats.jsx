// ════════════════════════════════════════════════════════════════
// NIGHTOS · /cast/stats — 月次/年次 成績ダッシュボード
// 構成: SubHeader → Goal progress ×2 → KPI ×3 → 担当継続 ×2
//      → AI usage → Trend chart → Annual 2×2 → Encouragement → TabBar
// ════════════════════════════════════════════════════════════════

const SIcon = ({ d, size = 14, sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'block', flexShrink: 0 }}>
    {d}
  </svg>
);
const SI = {
  back:    <polyline points="15 18 9 12 15 6"/>,
  trophy:  <><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3"/><path d="M10 13l1 4h2l1-4M8 21h8M12 17v4"/></>,
  flame:   <><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 1 1 2 1 3-3z"/></>,
  yen:     <><path d="M6 4l6 8 6-8M12 12v8M8 14h8M8 17h8"/></>,
  users:   <><circle cx="9" cy="8" r="3"/><path d="M3 21c0-3.5 3-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.5"/></>,
  douhan:  <><circle cx="9" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 21c0-3 2.5-5 6-5s6 2 6 5"/><path d="M21 21c0-2-1.5-4-4-4.5"/></>,
  sparkle: <><path d="M12 3l1.6 4.8L18 9.5l-4.4 1.7L12 16l-1.6-4.8L6 9.5l4.4-1.7z"/></>,
  home:    <><path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/></>,
  msg:     <><path d="M21 11c0 4-4 7-9 7-1 0-2-.1-3-.4L4 19l1.5-3.5C4.6 14.3 4 12.7 4 11c0-4 4-7 8.5-7s8.5 3 8.5 7z"/></>,
  cal:     <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
};

// ════════════════════════════════════════════════════════════════
// SUB HEADER
// ════════════════════════════════════════════════════════════════
function StSubHeader() {
  return (
    <header style={{
      position: 'relative',
      padding: '54px 20px 18px',
      background:
        'radial-gradient(ellipse at top right, var(--champagne-soft) 0%, transparent 60%),' +
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
          <SIcon d={SI.back} size={20} sw={1.8}/>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            margin: 0, font: '500 22px/1.2 var(--font-serif)',
            letterSpacing: '0.02em', color: 'var(--ink)',
          }}>あなたの成績</h1>
          <p style={{
            margin: '5px 0 0',
            font: '400 12px/1.4 var(--font-sans)',
            color: 'var(--ink-soft)', letterSpacing: '0.06em',
          }}>今月のがんばり · 5月</p>
        </div>
        <span style={{
          padding: '6px 12px', borderRadius: 999,
          background: 'rgba(253,248,240,0.85)',
          border: '1px solid var(--line-strong)',
          color: 'var(--ink-soft)',
          font: '500 11px/1 var(--font-sans)', letterSpacing: '0.08em',
          flexShrink: 0, marginTop: 2,
        }}>2026 / 05</span>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════
// GOAL PROGRESS CARD
// ════════════════════════════════════════════════════════════════
function GoalCard({ label, current, currentDisplay, goal, goalDisplay, unit, prefix, barColor }) {
  const pct = Math.round((current / goal) * 100);
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      padding: '16px 18px 18px',
      borderRadius: 'var(--radius-2xl)',
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
      <span aria-hidden style={{
        position: 'absolute', left: 0, top: 14, bottom: 14, width: 3,
        background: 'var(--gold-metallic)',
      }}/>

      <div style={{
        font: '500 10px/1 var(--font-sans)', letterSpacing: '0.18em',
        color: 'var(--ink-mute)', marginBottom: 10,
      }}>{label}</div>

      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap',
      }}>
        {prefix && (
          <span style={{
            font: '400 22px/1 var(--font-display)', color: 'var(--ink-soft)',
          }}>{prefix}</span>
        )}
        <span style={{
          font: '400 38px/1 var(--font-display)',
          color: 'var(--ink)', letterSpacing: '0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>{currentDisplay}</span>
        {unit && (
          <span style={{
            font: '400 13px/1 var(--font-sans)',
            color: 'var(--ink-soft)', paddingLeft: 1,
          }}>{unit}</span>
        )}
        <span style={{
          marginLeft: 'auto',
          font: '400 12px/1 var(--font-sans)',
          color: 'var(--ink-mute)', letterSpacing: '0.04em',
        }}>
          目標 {prefix}<span style={{
            font: '400 14px/1 var(--font-display)', color: 'var(--ink-soft)',
            fontVariantNumeric: 'tabular-nums',
          }}>{goalDisplay}</span>{unit}
        </span>
      </div>

      {/* progress bar */}
      <div style={{
        marginTop: 14, height: 10, borderRadius: 999,
        background: 'var(--pearl-soft)',
        position: 'relative', overflow: 'hidden',
        boxShadow: 'inset 0 1px 2px rgba(42,31,26,0.08)',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${Math.min(pct, 100)}%`,
          borderRadius: 999,
          background: barColor,
          boxShadow:
            'inset 0 1px 0 rgba(253,248,240,0.7), 0 1px 3px rgba(110,42,51,0.18)',
        }}/>
      </div>

      <div style={{
        marginTop: 8,
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      }}>
        <span style={{
          font: '400 22px/1 var(--font-display)',
          color: 'var(--rose-gold-ink)', letterSpacing: '0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}>{pct}<span style={{
          font: '400 11px/1 var(--font-sans)', color: 'var(--ink-mute)',
          paddingLeft: 2, letterSpacing: '0.04em',
        }}>%</span></span>
        <span style={{
          font: '400 11px/1 var(--font-sans)',
          color: 'var(--ink-mute)', letterSpacing: '0.04em',
        }}>残り {prefix}<span style={{
          font: '400 13px/1 var(--font-display)', color: 'var(--ink-soft)',
          fontVariantNumeric: 'tabular-nums',
        }}>{(goal - current).toLocaleString()}</span>{unit}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SMALL KPI TILE
// ════════════════════════════════════════════════════════════════
function MiniKpi({ label, value, unit, prefix, accent = 'ink', icon }) {
  const colors = {
    ink:   'var(--ink)',
    rose:  'var(--rose-gold-ink)',
    wine:  'var(--wine-deep)',
    gold:  'var(--gold-deep)',
    amber: '#c8761f',
  };
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      flex: 1, minWidth: 0,
      padding: '12px 12px 12px',
      borderRadius: 'var(--radius-2xl)',
      background: 'rgba(255, 253, 248, 0.78)',
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
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        {icon && (
          <span style={{ color: colors[accent], display: 'inline-flex' }}>
            <SIcon d={icon} size={11} sw={1.7}/>
          </span>
        )}
        <span style={{
          font: '500 9.5px/1.2 var(--font-sans)', letterSpacing: '0.14em',
          color: 'var(--ink-mute)',
        }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        {prefix && (
          <span style={{
            font: '400 12px/1 var(--font-display)', color: 'var(--ink-soft)',
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

// ════════════════════════════════════════════════════════════════
// AI USAGE CARD
// ════════════════════════════════════════════════════════════════
function AiUsageCard({ used, total }) {
  const pct = (used / total) * 100;
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      padding: '14px 16px',
      borderRadius: 'var(--radius-card)',
      background: 'rgba(255, 253, 248, 0.78)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-soft)',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.55,
      }}/>
      <span style={{
        width: 38, height: 38, borderRadius: 999, flexShrink: 0,
        background: 'rgba(245,232,210,0.6)',
        border: '1px solid rgba(184,148,85,0.32)',
        color: 'var(--wine-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <SIcon d={SI.sparkle} size={17} sw={1.7}/>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6, marginBottom: 6,
        }}>
          <span style={{
            font: '500 12px/1 var(--font-serif)', color: 'var(--ink)',
            letterSpacing: '0.02em',
          }}>今月の AI 利用</span>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{
              font: '400 20px/1 var(--font-display)',
              color: 'var(--ink)', letterSpacing: '0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}>{used}</span>
            <span style={{
              font: '400 11px/1 var(--font-sans)', color: 'var(--ink-mute)',
            }}>/ {total} 回</span>
          </span>
        </div>
        <div style={{
          height: 5, borderRadius: 999,
          background: 'var(--pearl-soft)',
          boxShadow: 'inset 0 1px 1px rgba(42,31,26,0.08)',
          overflow: 'hidden', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${pct}%`, borderRadius: 999,
            background:
              'linear-gradient(90deg, var(--champagne) 0%, var(--gold-deep) 100%)',
          }}/>
        </div>
        <div style={{
          marginTop: 6,
          font: '400 10.5px/1 var(--font-sans)',
          color: 'var(--ink-mute)', letterSpacing: '0.04em',
        }}>残り <span style={{
          font: '400 12px/1 var(--font-display)', color: 'var(--ink-soft)',
          fontVariantNumeric: 'tabular-nums',
        }}>{total - used}</span> 回 · 月末リセット</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TREND LINE CHART (SVG) — 30 days
// ════════════════════════════════════════════════════════════════
function TrendChart() {
  // 30 days of 再来店率, 50-80 range
  const data = [
    58, 60, 55, 62, 64, 60, 58, 65, 68, 70,
    66, 64, 67, 72, 70, 68, 64, 62, 66, 70,
    73, 71, 68, 70, 74, 72, 69, 71, 68, 68,
  ];
  const W = 320, H = 140, padL = 30, padR = 8, padT = 12, padB = 22;
  const minY = 40, maxY = 90;
  const xStep = (W - padL - padR) / (data.length - 1);
  const yScale = (v) => padT + (1 - (v - minY) / (maxY - minY)) * (H - padT - padB);
  const pts = data.map((v, i) => [padL + i * xStep, yScale(v)]);
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const fillPath = `${path} L${pts[pts.length-1][0]},${H-padB} L${pts[0][0]},${H-padB} Z`;
  const xTicks = [1, 5, 10, 15, 20, 25, 30];
  const yTicks = [50, 60, 70, 80];
  const last = data[data.length - 1];

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      padding: '14px 14px 12px',
      borderRadius: 'var(--radius-2xl)',
      background: 'rgba(255, 253, 248, 0.78)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-soft)',
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.55,
      }}/>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <div>
          <div style={{
            font: '500 10px/1 var(--font-sans)', letterSpacing: '0.16em',
            color: 'var(--ink-mute)',
          }}>RETENTION · 30 DAYS</div>
          <div style={{
            marginTop: 5,
            font: '500 16px/1 var(--font-serif)', color: 'var(--ink)',
            letterSpacing: '0.02em',
          }}>再来店率の動き</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            font: '400 28px/1 var(--font-display)',
            color: 'var(--rose-gold-ink)', letterSpacing: '0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}>{last}</span>
          <span style={{
            font: '400 11px/1 var(--font-sans)',
            color: 'var(--ink-mute)', letterSpacing: '0.04em',
            paddingLeft: 2,
          }}>% 現在</span>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        {/* y gridlines */}
        {yTicks.map(y => (
          <g key={y}>
            <line
              x1={padL} y1={yScale(y)} x2={W - padR} y2={yScale(y)}
              stroke="rgba(42,31,26,0.06)" strokeWidth="1"
              strokeDasharray={y === 70 ? "none" : "2 3"}
            />
            <text
              x={padL - 6} y={yScale(y) + 3}
              fill="var(--ink-mute)" textAnchor="end"
              style={{ font: '400 9px/1 var(--font-display)', letterSpacing: '0.04em' }}
            >{y}</text>
          </g>
        ))}

        {/* champagne fill */}
        <defs>
          <linearGradient id="fillG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f0e2c8" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#f0e2c8" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="lineG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#D4A88B"/>
            <stop offset="100%" stopColor="#A0644A"/>
          </linearGradient>
        </defs>
        <path d={fillPath} fill="url(#fillG)"/>
        <path d={path} fill="none" stroke="url(#lineG)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>

        {/* end dot */}
        <circle
          cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]}
          r="3.5" fill="#B07A5C" stroke="#fdfcf9" strokeWidth="1.5"
        />

        {/* x ticks */}
        {xTicks.map(t => (
          <text
            key={t}
            x={padL + (t - 1) * xStep} y={H - 4}
            fill="var(--ink-mute)" textAnchor="middle"
            style={{ font: '400 9px/1 var(--font-display)', letterSpacing: '0.04em' }}
          >{t}</text>
        ))}
      </svg>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ANNUAL 2×2 GRID
// ════════════════════════════════════════════════════════════════
function AnnualGrid() {
  return (
    <div>
      <SectionHead title="年間成績" sub="2026 ANNUAL"/>
      <div style={{
        marginTop: 12,
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
      }}>
        <MiniKpi label="年間売上" prefix="¥" value="6.2" unit="M" accent="rose" icon={SI.yen}/>
        <MiniKpi label="年間再来店率" value="65" unit="%" accent="ink"/>
        <MiniKpi label="年間新規"  value="38"  unit="人" accent="wine" icon={SI.users}/>
        <MiniKpi label="年間同伴"  value="142" unit="回" accent="gold" icon={SI.douhan}/>
      </div>
    </div>
  );
}

function SectionHead({ title, sub }) {
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
      {sub && (
        <span style={{
          font: '500 10px/1 var(--font-sans)', letterSpacing: '0.18em',
          color: 'var(--ink-mute)',
        }}>{sub}</span>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ENCOURAGEMENT (ママ message)
// ════════════════════════════════════════════════════════════════
function EncouragementCard() {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      padding: '16px 16px 16px 16px',
      borderRadius: 'var(--radius-xl)',
      background:
        'linear-gradient(180deg, var(--champagne-soft) 0%, rgba(245,232,210,0.55) 100%)',
      border: '1px solid rgba(184,148,85,0.28)',
      boxShadow: 'var(--shadow-warm)',
      display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      <span aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 1,
        background: 'var(--gold-metallic)', opacity: 0.65,
      }}/>
      <span style={{
        width: 44, height: 44, borderRadius: 999, flexShrink: 0,
        background: 'var(--gold-metallic)',
        color: '#fdfcf9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 4px 12px rgba(110,42,51,0.18)',
      }}>
        <SIcon d={SI.trophy} size={20} sw={1.7}/>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          font: '500 10px/1 var(--font-sans)', letterSpacing: '0.18em',
          color: 'var(--wine-soft)', marginBottom: 6,
        }}>
          <SIcon d={SI.sparkle} size={10} sw={1.8}/>
          FROM SAKURA MAMA
        </div>
        <div style={{
          font: '500 14.5px/1.35 var(--font-serif)', color: 'var(--ink)',
          letterSpacing: '0.02em', marginBottom: 6,
        }}>あかりさんへ</div>
        <p style={{
          margin: 0,
          font: '400 12.5px/1.7 var(--font-sans)',
          color: 'var(--ink-soft)', letterSpacing: '0.02em',
        }}>
          売上 82%、同伴 12 回の進捗ね。連続 12 日お客様に連絡できてるから、
          このペースで続けましょ ☕
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TAB BAR
// ════════════════════════════════════════════════════════════════
function StTabBar() {
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
          const on = t.key === 'home';
          return (
            <button key={t.key} style={{
              flex: 1, padding: '8px 0 6px', border: 'none', background: 'transparent',
              cursor: 'pointer', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              color: on ? 'var(--wine-deep)' : 'var(--ink-mute)',
            }}>
              <SIcon d={t.icon} size={20} sw={on ? 1.8 : 1.5}/>
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
function StatsScreen() {
  return (
    <div data-screen-label="01 Stats" style={{
      position: 'relative', minHeight: '100%',
      background: 'linear-gradient(180deg, #f3eadb 0%, #efe5d4 100%)',
      paddingBottom: 110,
    }}>
      <StSubHeader/>

      <main style={{
        padding: '18px 20px 0',
        display: 'flex', flexDirection: 'column', gap: 22,
      }}>
        {/* Goal cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <GoalCard
            label="今月の売上"
            current={820000} currentDisplay="820,000"
            goal={1000000}    goalDisplay="1,000,000"
            prefix="¥" unit=""
            barColor="var(--gold-metallic)"
          />
          <GoalCard
            label="今月の同伴"
            current={12} currentDisplay="12"
            goal={15}    goalDisplay="15"
            unit="回"
            barColor="linear-gradient(90deg, var(--champagne) 0%, var(--champagne-deep) 100%)"
          />
        </div>

        {/* 3 monthly KPIs */}
        <div style={{ display: 'flex', gap: 8 }}>
          <MiniKpi label="再来店率"   value="68" unit="%" accent="rose"/>
          <MiniKpi label="連絡達成率" value="84" unit="%" accent="ink"/>
          <MiniKpi label="今月新規"   value="4"  unit="人" accent="wine"/>
        </div>

        {/* 2 担当・継続 KPIs */}
        <div style={{ display: 'flex', gap: 8 }}>
          <MiniKpi label="担当顧客" value="24" unit="人" accent="ink" icon={SI.users}/>
          <MiniKpi label="連続連絡" value="12" unit="日" accent="amber" icon={SI.flame}/>
        </div>

        <AiUsageCard used={234} total={1000}/>

        <TrendChart/>

        <AnnualGrid/>

        <EncouragementCard/>
      </main>

      <StTabBar/>
    </div>
  );
}

Object.assign(window, { StatsScreen });
