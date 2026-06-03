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
        // ═══════════════ NIGHTOS palette (light theme) ═══════════════
        pearl: {
          DEFAULT: "#faf7f2",
          soft: "#f5efe6",
          warm: "#fdfcf9",
        },
        // ── v2 palette (design.md §1.2) ──
        // blush は warm peach 寄りの主強調色。light/dark は v2 soft/deep のエイリアス。
        blush: {
          soft: "#f4d4cf",
          DEFAULT: "#e8b9a5",
          deep: "#c98d80",
          light: "#f4d4cf",
          dark: "#c98d80",
        },
        champagne: {
          soft: "#f3e6c8",
          DEFAULT: "#e6cda5",
          deep: "#b89455",
          light: "#f3e6c8",
          dark: "#e6d6b0",
        },
        // ── 既存パレット（v2 では装飾用としては使わない）──
        roseGold: {
          DEFAULT: "#c98d80",
          light: "#d9a99e",
          dark: "#a6695c",
          muted: "rgba(201, 141, 128, 0.12)",
          border: "rgba(201, 141, 128, 0.3)",
        },
        // v2: 旧 amethyst (purple) を gold 系に振り直し（class 名は互換のため温存）。
        // 既存の text-amethyst-dark / bg-amethyst-muted などが全て gold-deep 寄りに切り替わる。
        amethyst: {
          DEFAULT: "#b89455",
          light: "#d8be86",
          dark: "#8a6e3d",
          muted: "rgba(184, 148, 85, 0.10)",
          border: "rgba(184, 148, 85, 0.30)",
        },
        ink: {
          DEFAULT: "#2b232a",
          secondary: "#675d66",
          muted: "#a39ba1",
        },
        beige: {
          DEFAULT: "#f5ede0",
          dark: "#ebdcc2",
          border: "#d9c7a8",
        },

        // ═══════════════ Legacy dark palette (旧プロダクト由来 — 互換のため残す) ═══════════════
        bg: {
          DEFAULT: "#08080d",
          card: "#111118",
          elevated: "#191920",
          sheet: "#14141c",
          hover: "#1e1e28",
        },
        // ── v2 brass gold (design.md §1.2) ──
        // 細線・小アイコン・「VIP」マーク専用。塗りには使わない。
        gold: {
          soft: "#d8be86",
          DEFAULT: "#b89455",
          deep: "#8a6e3d",
          light: "#d8be86",
          dark: "#8a6e3d",
          muted: "rgba(184, 148, 85, 0.12)",
          border: "rgba(184, 148, 85, 0.30)",
        },
        text: {
          primary: "#eeeef0",
          secondary: "#85858f",
          muted: "#55555f",
        },
        // v2 success: dusty sage (design.md §1.3) — 派手な明るい緑を avoid
        emerald: "#6b8e6f",
        rose: "#ef4444",
        amber: "#f59e0b",
        line: {
          DEFAULT: "#222230",
          light: "#2c2c3a",
        },
      },
      borderRadius: {
        // ── v2 (design.md §3.2) ──
        // 「迷ったら 1 段大きい方」が基調。
        pill: "999px",   // ボタン全般・アバター・タブ（v2 推奨）
        sheet: "28px 28px 0 0",
        // ── 互換 ──
        card: "22px",    // 既存「rounded-card」を v2 lg(22px) に合わせて拡大
        btn: "16px",     // 既存「rounded-btn」(=入力欄等にも使われている)。v2 では rounded-pill / rounded-full / rounded-2xl を優先
        badge: "999px",
      },
      boxShadow: {
        // ── v2 floating shadows (design.md §3.3) ──
        // 「机から少し浮いた」質感を 2 層シャドウで作る。
        soft:
          "0 2px 4px rgba(184, 148, 85, 0.04), 0 8px 24px rgba(184, 148, 85, 0.08)",
        float:
          "0 4px 12px rgba(201, 141, 128, 0.14), 0 16px 32px rgba(201, 141, 128, 0.10)",
        warm:
          "0 8px 24px rgba(201, 141, 128, 0.10), 0 24px 48px rgba(184, 148, 85, 0.08)",

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
        // ── v2 gradients (design.md §1, §4) ──
        "gradient-blush":
          "linear-gradient(135deg, #f4d4cf 0%, #e8b9a5 100%)",
        "gradient-hero":
          "linear-gradient(180deg, #f4d4cf 0%, #faf0e8 40%, #faf6f1 100%)",
        // v2: 旧 rose-gold / amethyst を blush + gold の深色系に振り直し。
        // text-pearl（白）でも読める明度を維持しつつ、purple/legacy rose を排除。
        "gradient-rose-gold":
          "linear-gradient(135deg, #c98d80 0%, #b08070 50%, #a6695c 100%)",
        "gradient-amethyst":
          "linear-gradient(135deg, #c98d80 0%, #a6845e 50%, #8a6e3d 100%)",
        // ── 互換（v1 の backdrop 用に残す） ──
        "gradient-pearl":
          "linear-gradient(180deg, #fdfcf9 0%, #faf7f2 50%, #f5efe6 100%)",
        "gradient-champagne":
          "linear-gradient(135deg, #f3e6c8 0%, #e6cda5 100%)",
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
      },
      fontSize: {
        "display-lg": ["2rem", { lineHeight: "1.2", fontWeight: "700" }],
        "display-md": ["1.5rem", { lineHeight: "1.3", fontWeight: "700" }],
        "display-sm": ["1.25rem", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["0.75rem", { lineHeight: "1.5", fontWeight: "400" }],
        "label-md": ["0.875rem", { lineHeight: "1", fontWeight: "500" }],
        "label-sm": ["0.75rem", { lineHeight: "1", fontWeight: "500" }],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
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
