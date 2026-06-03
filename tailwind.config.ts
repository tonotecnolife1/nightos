import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ═══════════════ NIGHTOS palette v6 (Luxury Lady Night) ═══════════════
        // Source: docs/design/v6/colors_and_type.css
        pearl: {
          DEFAULT: "#faf7f2",
          light: "#fdfcf9",   // elevated card (almost white)
          warm: "#f4e9dc",    // hero gradient / reaction chip (v6: warm cream)
          soft: "#f5efe6",    // recessed section
          deep: "#e8dccb",    // divider band
        },
        // v6 signature CTA. roseGold は camelCase key (既存互換)。
        roseGold: {
          soft: "#f3d8c8",
          DEFAULT: "#dba98e",
          deep: "#8a5e4d",    // button fill — AA 5.7:1 vs cream
          ink: "#6e4736",     // text-only token (cream / pearl の上の文字)
          light: "#f3d8c8",
          dark: "#8a5e4d",
          muted: "rgba(219, 169, 142, 0.12)",
          border: "rgba(219, 169, 142, 0.30)",
        },
        // v2 blush — v6 では rose-gold 系へ吸収済みだが既存クラスのため温存。
        blush: {
          soft: "#f3d8c8",
          DEFAULT: "#dba98e",
          deep: "#8a5e4d",
          light: "#f3d8c8",
          dark: "#8a5e4d",
        },
        champagne: {
          soft: "#f5e8d2",
          DEFAULT: "#e6cda5",
          deep: "#bf9d6e",    // v6: warmer
          light: "#f5e8d2",
          dark: "#bf9d6e",
        },
        // gold = 細線 / hairline / VIP 専用。塗りには使わない。
        gold: {
          soft: "#e0c896",
          DEFAULT: "#b89455",
          deep: "#876c3e",
          light: "#e0c896",
          dark: "#876c3e",
          muted: "rgba(184, 148, 85, 0.12)",
          border: "rgba(184, 148, 85, 0.30)",
        },
        // v2 amethyst (旧 purple) — v6 では gold 系のエイリアス (back-compat)。
        amethyst: {
          DEFAULT: "#b89455",
          light: "#e0c896",
          dark: "#876c3e",
          muted: "rgba(184, 148, 85, 0.10)",
          border: "rgba(184, 148, 85, 0.30)",
        },
        // v6: 深み・hero overlay・写真の上の地。
        nocturne: {
          mist: "#dccfc1",
          dusk: "#b5a594",
          DEFAULT: "#3d2e2a",
          deep: "#3d2e2a",
        },
        // v6: VIP / danger / 強調アクセント。
        wine: {
          soft: "#d4a8a8",
          DEFAULT: "#9a5d5d",
          deep: "#5e3838",
        },
        ink: {
          DEFAULT: "#2b232a",
          soft: "#6b5a58",
          mute: "#a89a96",
          // 互換 alias
          secondary: "#6b5a58",
          muted: "#a89a96",
          onDark: "#f4e9dc",
          onDarkSoft: "#c9b8a8",
        },
        beige: {
          DEFAULT: "#f5ede0",
          dark: "#ebdcc2",
          border: "#d9c7a8",
        },
        // v6 semantic state tokens
        success: "#7a9477",  // dusty sage
        warning: "#c8a063",  // champagne-deep
        danger: "#9a5d5d",   // wine

        // ═══════════════ Legacy dark palette (旧プロダクト由来 — 互換のため残す) ═══════════════
        bg: {
          DEFAULT: "#08080d",
          card: "#111118",
          elevated: "#191920",
          sheet: "#14141c",
          hover: "#1e1e28",
        },
        text: {
          primary: "#eeeef0",
          secondary: "#85858f",
          muted: "#55555f",
        },
        // v6: state colors (semantic) と既存 emerald/rose/amber を寄せる。
        // rose/amber は破壊的変更を避け Tailwind デフォルト寄りで温存。
        emerald: "#7a9477",  // v6 dusty sage
        rose: "#ef4444",     // legacy (新規は danger を使う)
        amber: "#f59e0b",    // legacy (新規は warning を使う)
        line: {
          // v6: 半透明 ink。light theme で常用する hairline / divider。
          DEFAULT: "rgba(43, 35, 42, 0.08)",
          strong: "rgba(43, 35, 42, 0.14)",
          // legacy dark palette
          dark: "#222230",
          light: "#2c2c3a",
        },
      },
      borderRadius: {
        // ── v6 (colors_and_type.css §RADII) ──
        // 「迷ったら 1 段大きい方」。
        pill: "999px",   // ボタン全般・アバター・タブ
        sheet: "28px 28px 0 0",
        hero: "28px",    // v6 hero / large sheet
        card: "22px",    // cards / list rows (DEFAULT)
        btn: "16px",     // 入力欄など (v6: md と同義)
        badge: "999px",
      },
      boxShadow: {
        // ── v6 elevation 4-tier (Matte: drop shadow のみ, inset highlight 禁止) ──
        soft:
          "0 2px 4px rgba(168, 117, 96, 0.10), 0 6px 14px rgba(168, 117, 96, 0.12)",
        float:
          "0 4px 12px rgba(201, 141, 128, 0.14), 0 16px 32px rgba(201, 141, 128, 0.10)",
        warm:
          "0 8px 24px rgba(201, 141, 128, 0.10), 0 24px 48px rgba(184, 148, 85, 0.08)",
        luxe:
          "0 6px 16px rgba(168, 117, 96, 0.32), 0 24px 48px rgba(61, 46, 42, 0.22)",

        // ── 既存（v1 / 互換）。v2 では使わない ──
        card: "0 1px 4px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)",
        elevated: "0 8px 32px rgba(0,0,0,0.5)",
        "glow-gold": "0 0 24px rgba(201,168,76,0.08)",
        "soft-card":
          "0 2px 8px rgba(60, 40, 50, 0.06), 0 1px 2px rgba(60, 40, 50, 0.04)",
        "elevated-light": "0 12px 40px rgba(60, 40, 50, 0.12)",
        "glow-amethyst": "0 0 32px rgba(154, 123, 187, 0.2)",
        "glow-rose": "0 0 24px rgba(201, 141, 128, 0.18)",
      },
      backgroundImage: {
        // ── v6 gradients (colors_and_type.css) ──
        "rose-gold-metallic":
          "linear-gradient(135deg, #f0c5af 0%, #d4a486 50%, #a87560 100%)",
        "rose-gold-metallic-light":
          "linear-gradient(135deg, #ffeede 0%, #fce4d4 50%, #f3d8c8 100%)",
        "champagne-metallic":
          "linear-gradient(135deg, #f0e0bc 0%, #d8b88a 100%)",
        "gold-metallic":
          "linear-gradient(135deg, #e8d0a0 0%, #c8a672 50%, #8c6f44 100%)",
        "surface-nocturne":
          "linear-gradient(180deg, #2b201d 0%, #3d2e2a 60%, #4a3833 100%)",
        "hero-fade":
          "linear-gradient(180deg, transparent 0%, #faf7f2 100%)",
        // ── v2 alias (back-compat) ──
        "gradient-blush":
          "linear-gradient(135deg, #f3d8c8 0%, #dba98e 100%)",
        "gradient-hero":
          "linear-gradient(180deg, #f4e9dc 0%, #faf0e8 40%, #faf6f1 100%)",
        "gradient-rose-gold":
          "linear-gradient(135deg, #f0c5af 0%, #d4a486 50%, #a87560 100%)",
        "gradient-amethyst":
          "linear-gradient(135deg, #e8d0a0 0%, #c8a672 50%, #8c6f44 100%)",
        "gradient-pearl":
          "linear-gradient(180deg, #fdfcf9 0%, #faf7f2 50%, #f5efe6 100%)",
        "gradient-champagne":
          "linear-gradient(135deg, #f5e8d2 0%, #e6cda5 100%)",
      },
      fontFamily: {
        sans: [
          '"Noto Sans JP"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: ['"Geist Mono"', "monospace"],
        // Mixed-script display: Latin/numerals fall on Cormorant Garamond,
        // Japanese glyphs fall through to Noto Serif JP. Order matters —
        // Cormorant has no JP coverage, so JP automatically uses the next.
        display: [
          '"Cormorant Garamond"',
          '"Noto Serif JP"',
          "Georgia",
          "serif",
        ],
        // v6: 章立て / hero / SectionHead 用の mincho display
        serif: [
          '"Noto Serif JP"',
          '"Hiragino Mincho ProN"',
          "Georgia",
          "serif",
        ],
      },
      fontSize: {
        // ── v6 semantic roles (serif for display, sans for body, Cormorant for KPI) ──
        "display-xl": ["1.75rem", { lineHeight: "1.3", fontWeight: "500" }],
        "display-lg": ["2rem", { lineHeight: "1.2", fontWeight: "700" }],
        "display-md": ["1.375rem", { lineHeight: "1.3", fontWeight: "500" }],
        "display-sm": ["1.125rem", { lineHeight: "1.4", fontWeight: "500" }],
        "body-lg": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["0.875rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["0.75rem", { lineHeight: "1.5", fontWeight: "400" }],
        "label-md": ["0.875rem", { lineHeight: "1", fontWeight: "500" }],
        "label-sm": ["0.75rem", { lineHeight: "1", fontWeight: "500" }],
        "label-xs": ["0.6875rem", { lineHeight: "1", fontWeight: "500" }],
        // KPI 数字 — Cormorant Garamond (weight 400 が基本)
        "kpi-xl": ["3.5rem", { lineHeight: "1", fontWeight: "400" }],
        "kpi-md": ["2rem", { lineHeight: "1", fontWeight: "400" }],
        "kpi-sm": ["1rem", { lineHeight: "1", fontWeight: "500" }],
      },
      letterSpacing: {
        luxe: "0.18em",  // tiny eyebrows / pill labels only
      },
      keyframes: {
        // NOTE: 終端は transform: none にする。translateY(0) のままだと
        // animation-fill-mode: both で transform が残り続け、要素が stacking
        // context / fixed の containing block になってしまう。これで子孫の
        // position: fixed モーダル（顧客編集シート等）が z-index 通りに
        // ビューポート基準で重なり、フッタータブ(z-40)の下に潜らなくなる。
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "none" },
        },
        "fade-overlay": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "slide-up": "slide-up 0.3s ease-out both",
        "fade-overlay": "fade-overlay 0.2s ease-out both",
        shimmer: "shimmer 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
