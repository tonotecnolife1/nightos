/**
 * ブラッシュアップの方向性選択肢（chips）。
 * ハードコードだが「別のアプローチ」「カスタム入力」を末尾に置くことで拡張性を残す。
 */

export interface RefineDirection {
  id: string;
  emoji: string;
  label: string;
  /** Claude に渡す具体的な指示（プロンプト用） */
  prompt: string;
}

export const REFINE_DIRECTIONS: RefineDirection[] = [
  {
    id: "warmer",
    emoji: "🌸",
    label: "もっと温かく",
    prompt: "もっと温度感のある、相手の心に触れる表現に書き直して。感情の機微を大事に。",
  },
  {
    id: "shorter",
    emoji: "✂️",
    label: "もっと短く",
    prompt: "2〜3行で収まる超コンパクトな文面にして。本質だけ残す。",
  },
  {
    id: "lighter",
    emoji: "☕",
    label: "もっと軽く",
    prompt: "重くならないよう、肩の力を抜いた軽やかな口調に。営業感もさらに薄める。",
  },
  {
    id: "more-specific",
    emoji: "🎯",
    label: "もっと具体的に",
    prompt: "抽象的な部分を具体的な話題・状況・台詞まで落として、実用度を上げる。",
  },
  {
    id: "different-angle",
    emoji: "🎨",
    label: "別のアプローチで",
    prompt: "前回とは全く違う切り口・戦略で書き直す。同じ型にこだわらない。",
  },
  {
    id: "formal",
    emoji: "👔",
    label: "もっと丁寧に",
    prompt: "よりフォーマルで品格ある言い回しに。VIP相手に使える格に引き上げる。",
  },
];
