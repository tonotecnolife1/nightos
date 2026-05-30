// ═══════════════ NIGHTOS domain types ═══════════════

import type { ClubRole, VenueType } from "@/lib/nightos/constants";

export type CustomerCategory = "vip" | "regular" | "new";

export interface Store {
  id: string;
  name: string;
  venue_type: VenueType;
  /** 8-char join code for cast / store_staff sign-ups (migration 008). */
  invite_code?: string;
}

/**
 * Account-level role bound at sign-up. Drives the URL gates in
 * middleware.ts and the post-auth redirect in app/page.tsx.
 *
 * - "cast"        : 接客側のキャスト。/cast/* のみ
 * - "store_staff" : 入力業務スタッフ。/store/* (オーナー専用ページ除く)
 * - "store_owner" : 店舗オーナー。/store/* 全て
 *
 * 来店客は cast 行ではなく customers 行に auth_user_id 経由で紐づく
 * （/customer/*）ため、ここには含めない。
 */
export type CastUserRole = "cast" | "store_staff" | "store_owner";

export interface Cast {
  id: string;
  store_id: string;
  name: string;
  nomination_count: number;
  monthly_sales: number;
  repeat_rate: number; // 0..1
  /** Account-level role (migration 008). Defaults to "cast" when absent
   *  (legacy mock data and rows from before 008 was applied). */
  user_role?: CastUserRole;
  /** Whether this cast row is the user's currently-active membership at
   *  this store (migration 009). Defaults to true for legacy data. */
  is_active?: boolean;
  /** Club only: role in the hierarchy */
  club_role?: ClubRole;
  /** Club only: the oneesan this help is assigned to */
  assigned_oneesan_id?: string;
}

// ═══════════════ Club-specific types ═══════════════

export interface Douhan {
  id: string;
  cast_id: string;
  customer_id: string;
  store_id: string;
  date: string; // YYYY-MM-DD
  status: "scheduled" | "completed" | "cancelled";
  note: string | null;
  /**
   * キャンセル理由。status === "cancelled" の時は必須。
   * ママ・姉さんがキャンセル傾向を把握するための情報。
   */
  cancellation_reason?: string | null;
  /** キャンセル日時 ISO */
  cancelled_at?: string | null;
  created_at: string;
}

export interface DouhanSummary {
  monthlyCount: number;
  monthlyGoal: number;
  thisMonthDouhans: Douhan[];
}

export interface Customer {
  id: string;
  store_id: string;
  cast_id: string;
  /** フルネーム（戸籍名・名刺名）。リスト・通知の主表示はこちら。 */
  name: string;
  /**
   * 呼び名（ニックネーム）。カルテのサブ表示・接客時の呼びかけに使用。
   * 入力推奨だが nullable。
   */
  nickname?: string | null;
  birthday: string | null; // YYYY-MM-DD
  job: string | null;
  favorite_drink: string | null;
  category: CustomerCategory;
  store_memo: string | null;
  created_at: string;

  /** 紹介してくれた既存顧客の id。null = 自己来店または店舗経由 */
  referred_by_customer_id?: string | null;

  /**
   * ファネルステージ:
   * - "store_only": 店舗スタッフが登録しただけ、担当なし
   * - "assigned":   姉さんが担当についた（初回以降）
   * - "line_exchanged": LINE交換済み（能動的フォロー可能）
   */
  funnel_stage?: "store_only" | "assigned" | "line_exchanged";

  /** LINE交換した担当キャスト id */
  line_exchanged_cast_id?: string | null;

  /** LINE交換した日時 */
  line_exchanged_at?: string | null;

  /**
   * この顧客を「管理する」ママまたは姉さんの id。
   * 現場の担当者 (cast_id) とは別概念で、上位ポジション。
   * 担当者がキャスト(help)なら、管理者はその上の姉さんかママ。
   */
  manager_cast_id?: string | null;

  /**
   * 顧客が普段活動しているエリア（都道府県名）。
   * AI が気候や季節を踏まえた提案をするために使う。null の場合は
   * 地域コンテキストを抜きで応答する。
   */
  region?: string | null;
}

// ═══════════════ Customer referral map types ═══════════════

/**
 * 顧客紹介ツリーのノード。再帰的に children を持つ。
 * ルートは referred_by_customer_id が null のお客様。
 */
export interface CustomerReferralNode {
  customer: Customer;
  assignedCastName: string | null;
  depth: number;
  children: CustomerReferralNode[];
}

/**
 * 顧客ファネル集計（店舗全体 or キャスト別）。
 */
export interface CustomerFunnelStats {
  storeOnly: number;
  assigned: number;
  lineExchanged: number;
  total: number;
  /** 担当付き転換率 (assigned + lineExchanged) / total */
  assignedRate: number;
  /** LINE交換転換率 lineExchanged / (assigned + lineExchanged) */
  lineExchangedRate: number;
}

// ═══════════════ Douhan pace stats ═══════════════

export type DouhanPaceStatus = "on_pace" | "behind" | "meeting_risk";

export interface DouhanPaceStats {
  castId: string;
  castName: string;
  thisWeekCount: number;
  weekTarget: number;
  thisMonthCount: number;
  monthTarget: number;
  /** 月末までの残り日数 */
  daysLeftInMonth: number;
  /** 今のペースで月末何回になる見込み */
  projectedMonthCount: number;
  status: DouhanPaceStatus;
}

export interface CastMemo {
  id: string;
  customer_id: string;
  cast_id: string;
  last_topic: string | null;
  service_tips: string | null;
  next_topics: string | null;
  visit_notes: string | null;
  updated_at: string;
}

export interface Bottle {
  id: string;
  store_id: string;
  customer_id: string;
  brand: string;
  total_glasses: number;
  remaining_glasses: number;
  kept_at: string;
}

export interface Visit {
  id: string;
  store_id: string;
  customer_id: string;
  cast_id: string;
  table_name: string | null;
  is_nominated: boolean;
  visited_at: string;
}

export interface FollowLog {
  id: string;
  customer_id: string;
  cast_id: string;
  template_type: "thanks" | "invite" | "birthday" | "seasonal";
  sent_at: string;
}

export interface AiChat {
  id: string;
  cast_id: string;
  customer_id: string | null;
  messages: ChatMessage[];
  feedback: "helpful" | "not_helpful" | null;
  created_at: string;
}

// ═══════════════ LINE screenshot import ═══════════════

/**
 * Result of running a LINE screenshot through the vision model.
 * Each field is the SUGGESTED new value (or null if no update).
 */
export interface MemoExtractionResult {
  /** 1-2 sentence summary of what's in the screenshot. */
  summary: string;
  last_topic: string | null;
  service_tips: string | null;
  next_topics: string | null;
  /** Confidence the model has in its extraction. */
  confidence: "high" | "medium" | "low";
}

export interface LineScreenshot {
  id: string;
  customer_id: string;
  cast_id: string;
  /** Full data URL — `data:image/jpeg;base64,...` */
  image_data: string;
  media_type: string;
  extracted: MemoExtractionResult;
  /** Which extraction fields the cast actually applied. */
  applied_fields: ("last_topic" | "service_tips" | "next_topics")[];
  created_at: string;
}

// ═══════════════ Customer (来店客) app types ═══════════════

export type CouponType = "drink" | "discount" | "birthday" | "vip";

export interface Coupon {
  id: string;
  customer_id: string;
  store_id: string;
  store_name: string;
  type: CouponType;
  title: string;
  description: string;
  valid_from: string;
  valid_until: string;
  used_at: string | null;
  code: string;
}

export interface CustomerBottleView {
  bottle: Bottle;
  store_name: string;
  cast_name: string | null;
}

export interface CustomerStoreOverview {
  store_id: string;
  store_name: string;
  visit_count: number;
  total_spent_estimate: number;
  bottles: Bottle[];
  nomination_cast: string | null;
  nomination_cast_id: string | null;
  last_visit: string | null;
  coupons: Coupon[];
  rank: CustomerRank;
}

export type RankTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface CustomerRank {
  tier: RankTier;
  label: string;
  emoji: string;
  visitCount: number;
  nextTierLabel: string | null;
  visitsToNextTier: number;
  progress: number; // 0..1
}

// ═══════════════ Derived / view types ═══════════════

export type FollowReason =
  | "interval" // 来店間隔空き
  | "birthday" // 誕生日
  | "nomination_chance"; // 指名化チャンス

export interface FollowTarget {
  customer: Customer;
  reason: FollowReason;
  reasonLabel: string;
  reasonDetail: string;
  bottle?: Bottle;
  lastTopic?: string | null;
  daysSinceLastVisit: number;
  visitCount: number;
}

export interface CastHomeSummary {
  nominationCount: number;
  repeatRate: number; // 0..1
  followTargetCount: number;
  monthlySales: number;
  /** 今月の新規顧客数 */
  newCustomerCount: number;
  /** Club mode: 今月の同伴数 */
  douhanCount?: number;
  douhanGoal?: number;
}

export interface CastHomeData {
  cast: Cast;
  summary: CastHomeSummary;
  targets: FollowTarget[];
}

export interface CustomerContext {
  customer: Customer;
  memo: CastMemo | null;
  bottles: Bottle[];
  visits: Visit[];
}

// ═══════════════ Cast goal types ═══════════════

export interface CastGoal {
  castId: string;
  /** 月次売上目標（円） */
  salesGoal: number;
  /** 月次同伴目標（回） */
  douhanGoal: number;
  /** 自由メモ — 期待値や方針を一言で */
  note: string | null;
  /** 目標を設定したキャスト ID（管理者） */
  setBy: string | null;
  updatedAt: string;
}

// ═══════════════ Ruri-Mama chat types ═══════════════

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  /**
   * 画像添付（自撮り・場の状況・ヘアメイクチェックなど）。
   * data URL 形式 (e.g. "data:image/jpeg;base64,...") で保存。
   * Claude のビジョン機能で内容を解釈。
   */
  images?: string[];
  // Present only on assistant messages when the backend stored a chatId
  id?: string;
  feedback?: "helpful" | "not_helpful" | null;
  // True when this assistant reply came from the deterministic stub
  // (ANTHROPIC_API_KEY unset or Claude call errored out)
  isStub?: boolean;
  /**
   * 3パターン選択肢。
   * 未選択の assistant メッセージに含まれる。
   * ユーザーが1つ選ぶと `content` がそのオプション内容に置き換わり、
   * `pickedOptionId` が設定される。
   */
  options?: ReplyOption[];
  pickedOptionId?: string;
}

export type ReplyOptionStyle = "safe" | "practical" | "warm";

export interface ReplyOption {
  id: "A" | "B" | "C";
  style: ReplyOptionStyle;
  label: string;
  content: string;
}

export type Intent = "follow" | "serving" | "strategy" | "freeform";

export interface HearingStep {
  id: string;
  question: string;
  options: string[];
}

export interface HearingFlow {
  intent: Intent;
  label: string;
  steps: HearingStep[];
}

export interface RuriMamaRequest {
  messages: ChatMessage[];
  customerId?: string;
  hearingContext?: Record<string, string>;
  castId: string;
  intent: Intent;
  /**
   * Recent feedback samples from the cast (excerpted assistant content
   * that was marked helpful or not). Used to bias future replies.
   */
  recentFeedback?: {
    helpful: string[];
    notHelpful: string[];
  };
  /**
   * ブラッシュアップフロー制御
   * - undefined: 通常（最初のアドバイス）
   * - "apply": 既存回答を指定方向でブラッシュアップ
   */
  refineStep?: "apply";
  /** ブラッシュアップ元の回答（user pickedOption の content） */
  previousReply?: string;
  /** ブラッシュアップの方向性（例: "もっと温かく"） */
  refinementDirection?: string;
}

export interface RuriMamaResponse {
  /**
   * 3パターンの回答選択肢。ユーザーが1つ選択して採用する。
   * 後方互換のため reply プロパティも保持（options の最初の content が入る）。
   */
  options: ReplyOption[];
  reply: string;
  /** True when the reply came from the deterministic stub path. */
  isStub: boolean;
}
