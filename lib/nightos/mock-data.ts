import type {
  AiChat,
  Bottle,
  Cast,
  CastGoal,
  CastMemo,
  Customer,
  Douhan,
  FollowLog,
  LineScreenshot,
  Store,
  Visit,
} from "@/types/nightos";
import { CURRENT_STORE_ID } from "./constants";

/**
 * Mutable in-memory list of imported LINE screenshots. Starts empty;
 * grows as the cast uses the import feature in the demo session.
 * Resets on server restart (mock mode only).
 */
export const mockScreenshots: LineScreenshot[] = [];

/**
 * Store → cast messages. Stored in memory, displayed as a banner on
 * the cast home screen.
 */
export interface StoreToCastMessage {
  id: string;
  cast_id: string;
  message: string;
  sent_at: string;
  read: boolean;
}

export const mockCastMessages: StoreToCastMessage[] = [
  {
    id: "cmsg1",
    cast_id: "cast1",
    message: "今夜VIP の田中様がご来店予定です。山崎12年のボトルが残り3杯なのでご案内お願いします。",
    sent_at: "2026-03-19T18:30:00+09:00",
    read: false,
  },
  {
    id: "cmsg2",
    cast_id: "cast1",
    message: "先週の高橋様の件、指名化の進捗はいかがですか？来週のミーティングで共有お願いします。",
    sent_at: "2026-03-18T17:00:00+09:00",
    read: true,
  },
  {
    id: "cmsg3",
    cast_id: "cast_oneesan2",
    message: "月末の棚卸しに向けて、ボトルの残量確認をお願いします。",
    sent_at: "2026-03-17T16:00:00+09:00",
    read: true,
  },
  {
    id: "cmsg4",
    cast_id: "cast_help2",
    message: "明日からヘルプのシフト変更があります。出勤表を確認してください。",
    sent_at: "2026-03-19T15:00:00+09:00",
    read: false,
  },
  {
    id: "cmsg5",
    cast_id: "cast_oneesan3",
    message: "渡辺様のお誕生日が近いです。サプライズの準備をお願いします。",
    sent_at: "2026-03-16T14:00:00+09:00",
    read: true,
  },
];

/**
 * Cast → store requests. Displayed on the store hub.
 */
export interface CastToStoreRequest {
  id: string;
  cast_id: string;
  cast_name: string;
  message: string;
  sent_at: string;
  resolved: boolean;
}

export const mockCastRequests: CastToStoreRequest[] = [
  {
    id: "creq1",
    cast_id: "cast1",
    cast_name: "あかり",
    message: "田中太郎様の誕生日（9月）にシャンパンタワーを企画したいです。予算と日程のご相談をお願いします。",
    sent_at: "2026-03-18T19:00:00+09:00",
    resolved: false,
  },
  {
    id: "creq2",
    cast_id: "cast_help2",
    cast_name: "あやな",
    message: "来週の土曜日、体調不良のためお休みをいただきたいです。",
    sent_at: "2026-03-17T12:00:00+09:00",
    resolved: true,
  },
  {
    id: "creq3",
    cast_id: "cast_oneesan3",
    cast_name: "もえ",
    message: "新しい名刺のデザインを変更したいです。サンプルを添付しましたのでご確認ください。",
    sent_at: "2026-03-15T14:30:00+09:00",
    resolved: false,
  },
];

// ═══════════════ Customer (来店客) mock data ═══════════════

import type { Coupon } from "@/types/nightos";

export const mockCoupons: Coupon[] = [
  {
    id: "coupon1",
    customer_id: "cust1",
    store_id: "store1",
    store_name: "CLUB NIGHTOS 銀座本店",
    type: "drink",
    title: "ドリンク1杯サービス",
    description: "10回来店達成記念 — お好きなドリンクを1杯プレゼント",
    valid_from: "2026-03-01",
    valid_until: "2026-04-30",
    used_at: null,
    code: "NIGHT-D10",
  },
  {
    id: "coupon2",
    customer_id: "cust1",
    store_id: "store1",
    store_name: "CLUB NIGHTOS 銀座本店",
    type: "birthday",
    title: "バースデーシャンパン 🥂",
    description: "お誕生月限定 — シャンパン1杯プレゼント",
    valid_from: "2026-09-01",
    valid_until: "2026-09-30",
    used_at: null,
    code: "NIGHT-BD26",
  },
  {
    id: "coupon3",
    customer_id: "cust1",
    store_id: "store1",
    store_name: "CLUB NIGHTOS 銀座本店",
    type: "vip",
    title: "VIPラウンジ無料利用",
    description: "VIP会員特典 — VIPルームを無料でご利用いただけます",
    valid_from: "2026-01-01",
    valid_until: "2026-12-31",
    used_at: null,
    code: "NIGHT-VIP",
  },
  {
    id: "coupon4",
    customer_id: "cust1",
    store_id: "store1",
    store_name: "CLUB NIGHTOS 銀座本店",
    type: "discount",
    title: "累計利用感謝 10%OFF",
    description: "累計¥300,000利用達成 — 次回会計から10%オフ",
    valid_from: "2026-02-15",
    valid_until: "2026-05-15",
    used_at: "2026-03-07T20:00:00+09:00",
    code: "NIGHT-THX10",
  },
  // ── Lounge ÉTOILE 六本木 ──
  {
    id: "coupon5",
    customer_id: "cust1",
    store_id: "store2",
    store_name: "Lounge ÉTOILE 六本木",
    type: "drink",
    title: "5回来店記念 シャンパンサービス",
    description: "5回来店達成 — グラスシャンパンを1杯プレゼント 🥂",
    valid_from: "2026-03-10",
    valid_until: "2026-05-10",
    used_at: null,
    code: "ETOILE-5V",
  },
  {
    id: "coupon6",
    customer_id: "cust1",
    store_id: "store2",
    store_name: "Lounge ÉTOILE 六本木",
    type: "discount",
    title: "初回来店ウェルカム 15%OFF",
    description: "初回ご来店のお客様限定 — 次回会計から15%オフ",
    valid_from: "2026-01-15",
    valid_until: "2026-03-15",
    used_at: "2026-02-20T21:00:00+09:00",
    code: "ETOILE-WEL",
  },
  // ── BAR VELVET 赤坂 ──
  {
    id: "coupon7",
    customer_id: "cust1",
    store_id: "store3",
    store_name: "BAR VELVET 赤坂",
    type: "drink",
    title: "新規登録キャンペーン",
    description: "アプリ登録特典 — お好きなウイスキー1杯プレゼント 🥃",
    valid_from: "2026-03-01",
    valid_until: "2026-06-01",
    used_at: null,
    code: "VELVET-NEW",
  },
];

// Fixed "today" for deterministic follow-target selection in mock mode.
// Matches the spec's reference date (last-visit dates are in early March).
export const MOCK_TODAY = new Date("2026-03-19T00:00:00+09:00");

export const mockStores: Store[] = [
  { id: CURRENT_STORE_ID, name: "CLUB NIGHTOS 銀座本店", venue_type: "club" },
  { id: "store2", name: "Lounge ÉTOILE 六本木", venue_type: "club" },
  { id: "store3", name: "BAR VELVET 赤坂", venue_type: "cabaret" },
];

// ── クラブのキャスト構成 ──
// さくらママは AI（店舗キャストではない）
//
// Senior 姉さん (top tier):
//   ゆき (cast_oneesan2) ──┐
//   もえ (cast_oneesan3) ──┤
//   れな (cast_oneesan4) ──┤
//
// Junior 姉さん (under senior):
//   あかり (cast1, under ゆき)
//   ちひろ (cast_oneesan5, under もえ)
//   かなで (cast_oneesan6, under れな)
//
// キャスト (help):
//   あやな (cast_help2, under あかり)
//   みお (cast_help3, under ちひろ)
//   さら (cast_help4, under かなで)
export const mockCasts: Cast[] = [
  // ─── Senior 姉さん ───
  {
    id: "cast_oneesan2",
    store_id: CURRENT_STORE_ID,
    name: "ゆき",
    nomination_count: 32,
    monthly_sales: 3_400_000,
    repeat_rate: 0.82,
    club_role: "oneesan",
  },
  {
    id: "cast_oneesan3",
    store_id: CURRENT_STORE_ID,
    name: "もえ",
    nomination_count: 28,
    monthly_sales: 2_900_000,
    repeat_rate: 0.79,
    club_role: "oneesan",
  },
  {
    id: "cast_oneesan4",
    store_id: CURRENT_STORE_ID,
    name: "れな",
    nomination_count: 35,
    monthly_sales: 3_600_000,
    repeat_rate: 0.84,
    club_role: "oneesan",
  },
  // ─── Junior 姉さん ───
  {
    id: "cast1",
    store_id: CURRENT_STORE_ID,
    name: "あかり",
    nomination_count: 18,
    monthly_sales: 1_840_000,
    repeat_rate: 0.72,
    club_role: "oneesan",
    assigned_oneesan_id: "cast_oneesan2", // ゆきの下
  },
  {
    id: "cast_oneesan5",
    store_id: CURRENT_STORE_ID,
    name: "ちひろ",
    nomination_count: 15,
    monthly_sales: 1_500_000,
    repeat_rate: 0.68,
    club_role: "oneesan",
    assigned_oneesan_id: "cast_oneesan3", // もえの下
  },
  {
    id: "cast_oneesan6",
    store_id: CURRENT_STORE_ID,
    name: "かなで",
    nomination_count: 20,
    monthly_sales: 2_050_000,
    repeat_rate: 0.74,
    club_role: "oneesan",
    assigned_oneesan_id: "cast_oneesan4", // れなの下
  },
  // ─── キャスト (help) ───
  {
    id: "cast_help2",
    store_id: CURRENT_STORE_ID,
    name: "あやな",
    nomination_count: 6,
    monthly_sales: 580_000,
    repeat_rate: 0.54,
    club_role: "help",
    assigned_oneesan_id: "cast1", // あかり直属
  },
  {
    id: "cast_help3",
    store_id: CURRENT_STORE_ID,
    name: "みお",
    nomination_count: 8,
    monthly_sales: 720_000,
    repeat_rate: 0.58,
    club_role: "help",
    assigned_oneesan_id: "cast_oneesan5", // ちひろ直属
  },
  {
    id: "cast_help4",
    store_id: CURRENT_STORE_ID,
    name: "さら",
    nomination_count: 5,
    monthly_sales: 480_000,
    repeat_rate: 0.50,
    club_role: "help",
    assigned_oneesan_id: "cast_oneesan6", // かなで直属
  },
  // ── Lounge ÉTOILE 六本木 ──
  {
    id: "cast3",
    store_id: "store2",
    name: "りな",
    nomination_count: 22,
    monthly_sales: 2_100_000,
    repeat_rate: 0.78,
    club_role: "oneesan",
  },
  // ── BAR VELVET 赤坂（キャバクラ） ──
  {
    id: "cast4",
    store_id: "store3",
    name: "ゆい",
    nomination_count: 10,
    monthly_sales: 980_000,
    repeat_rate: 0.60,
  },
];

// ── 同伴データ（クラブモード用） ──
export const mockDouhans: Douhan[] = [
  {
    id: "douhan1",
    cast_id: "cast1",
    customer_id: "cust1",
    store_id: CURRENT_STORE_ID,
    date: "2026-03-05",
    status: "completed",
    note: "イタリアンレストランで食事後に来店",
    created_at: "2026-03-04T15:00:00+09:00",
  },
  {
    id: "douhan2",
    cast_id: "cast1",
    customer_id: "cust3",
    store_id: CURRENT_STORE_ID,
    date: "2026-03-12",
    status: "completed",
    note: "銀座の寿司屋",
    created_at: "2026-03-11T14:00:00+09:00",
  },
  {
    id: "douhan3",
    cast_id: "cast1",
    customer_id: "cust5",
    store_id: CURRENT_STORE_ID,
    date: "2026-03-20",
    status: "scheduled",
    note: "六本木のフレンチ予約済み",
    created_at: "2026-03-18T10:00:00+09:00",
  },
  {
    id: "douhan4",
    cast_id: "cast1",
    customer_id: "cust11",
    store_id: CURRENT_STORE_ID,
    date: "2026-03-25",
    status: "scheduled",
    note: null,
    created_at: "2026-03-19T09:00:00+09:00",
  },
  // ── キャンセル例（ママ・姉さんが理由を確認できるサンプル） ──
  {
    id: "douhan5",
    cast_id: "cast1",
    customer_id: "cust2",
    store_id: CURRENT_STORE_ID,
    date: "2026-04-02",
    status: "cancelled",
    note: "新宿のフレンチ予約していた",
    cancellation_reason: "お客様の都合（仕事）",
    cancelled_at: "2026-04-01T18:30:00+09:00",
    created_at: "2026-03-25T20:00:00+09:00",
  },
  {
    id: "douhan6",
    cast_id: "cast_help2",
    customer_id: "cust4",
    store_id: CURRENT_STORE_ID,
    date: "2026-04-08",
    status: "cancelled",
    note: "前回も急なキャンセル",
    cancellation_reason: "お客様の都合（体調不良）",
    cancelled_at: "2026-04-07T22:15:00+09:00",
    created_at: "2026-03-30T19:00:00+09:00",
  },
  {
    id: "douhan7",
    cast_id: "cast_oneesan3",
    customer_id: "cust9",
    store_id: CURRENT_STORE_ID,
    date: "2026-04-10",
    status: "cancelled",
    note: null,
    cancellation_reason: "日程変更（4/15に再予約）",
    cancelled_at: "2026-04-05T11:00:00+09:00",
    created_at: "2026-03-28T16:00:00+09:00",
  },
  {
    id: "douhan8",
    cast_id: "cast_oneesan3",
    customer_id: "cust15",
    store_id: CURRENT_STORE_ID,
    date: "2026-04-12",
    status: "cancelled",
    note: null,
    cancellation_reason: "自分の都合（体調不良で出勤できず）",
    cancelled_at: "2026-04-11T14:00:00+09:00",
    created_at: "2026-04-03T20:30:00+09:00",
  },
];

export const mockCustomers: Customer[] = [
  {
    id: "cust1",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "田中 太郎",
    name_kana: "たなか たろう",
    nickname: "社長",
    birthday: "1975-09-12",
    job: "IT企業経営",
    favorite_drink: "山崎12年ロック",
    category: "vip",
    store_memo: "息子さんの大学受験の話題はNG（落ちた）",
    region: "東京都",
    created_at: "2025-04-01T19:00:00+09:00",
    referred_by_customer_id: null, // 自己来店（ルート）
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast1",
    line_exchanged_at: "2025-04-15T23:30:00+09:00",
  },
  {
    id: "cust2",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "高橋 誠",
    birthday: "1988-06-03",
    job: "金融ディーラー",
    favorite_drink: "白州ハイボール",
    category: "new",
    store_memo: null,
    region: "大阪府",
    created_at: "2026-02-20T20:00:00+09:00",
    referred_by_customer_id: "cust1", // 田中さまの紹介
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast1",
    line_exchanged_at: "2026-03-15T23:00:00+09:00",
  },
  {
    id: "cust3",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "渡辺 浩二",
    birthday: "1968-03-25",
    job: "不動産会社役員",
    favorite_drink: "マッカラン12年ロック",
    category: "vip",
    region: "北海道",
    store_memo: "有馬記念はお気に入りの話題",
    created_at: "2024-11-10T19:30:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast1",
    line_exchanged_at: "2024-11-25T22:00:00+09:00",
  },
  {
    id: "cust4",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_help2",
    name: "佐藤 健一",
    birthday: "1979-11-08",
    job: "広告代理店",
    favorite_drink: "響JH水割り",
    category: "regular",
    store_memo: null,
    created_at: "2025-07-15T20:00:00+09:00",
    referred_by_customer_id: "cust3", // 渡辺さまの紹介
    funnel_stage: "assigned",
    line_exchanged_cast_id: null,
    line_exchanged_at: null,
  },
  // ── あかり担当の追加顧客（様々なステータス） ──
  {
    id: "cust5",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "山本 隆",
    birthday: "1972-04-02",
    job: "弁護士",
    favorite_drink: "ドンペリニヨン",
    category: "vip",
    store_memo: "離婚調停中のため家庭の話題はNG。ゴルフと車が好き",
    created_at: "2025-01-10T19:00:00+09:00",
    referred_by_customer_id: "cust1", // 田中さまの紹介
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast1",
    line_exchanged_at: "2025-01-25T23:00:00+09:00",
  },
  {
    id: "cust6",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "中村 慎太郎",
    birthday: "1985-12-20",
    job: "外資系コンサル",
    favorite_drink: "白州ハイボール",
    category: "regular",
    store_memo: "出張が多い。月末に来ることが多い",
    created_at: "2025-06-01T20:00:00+09:00",
    referred_by_customer_id: "cust1", // 田中さまの紹介
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast1",
    line_exchanged_at: "2025-06-15T22:00:00+09:00",
  },
  {
    id: "cust7",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "鈴木 大輔",
    birthday: "1990-08-15",
    job: "IT スタートアップ CEO",
    favorite_drink: "ジャックダニエル",
    category: "new",
    store_memo: null,
    created_at: "2026-03-10T20:30:00+09:00",
    referred_by_customer_id: "cust5", // 山本さまの紹介
    funnel_stage: "assigned",
    line_exchanged_cast_id: null,
    line_exchanged_at: null,
  },
  {
    id: "cust8",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "木村 亮介",
    birthday: "1965-01-30",
    job: "建設会社会長",
    favorite_drink: "響21年ロック",
    category: "vip",
    store_memo: "接待利用が多い。静かなテーブル希望。犬の話が好き",
    created_at: "2024-08-01T19:00:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast1",
    line_exchanged_at: "2024-08-20T23:00:00+09:00",
  },
  {
    id: "cust9",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "小林 翔太",
    birthday: "1993-03-28",
    job: "医師（外科）",
    favorite_drink: "グレンリベット12年",
    category: "regular",
    store_memo: "夜勤明けに来ることがある。お酒は控えめ",
    created_at: "2025-09-15T21:00:00+09:00",
    referred_by_customer_id: "cust8", // 木村さまの紹介
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast1",
    line_exchanged_at: "2025-10-01T22:30:00+09:00",
  },
  {
    id: "cust10",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "松田 健太郎",
    birthday: "1980-07-07",
    job: "飲食店オーナー",
    favorite_drink: "クリュッグ",
    category: "regular",
    store_memo: "同業者なので接客の話は避ける。音楽好き（ジャズ）",
    created_at: "2025-03-20T20:00:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast1",
    line_exchanged_at: "2025-04-05T23:00:00+09:00",
  },
  {
    id: "cust11",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1",
    name: "伊藤 雅人",
    birthday: "1978-11-15",
    job: "証券会社部長",
    favorite_drink: "マッカラン18年",
    category: "vip",
    store_memo: "ワインにも詳しい。知的な会話を好む",
    created_at: "2024-12-01T19:30:00+09:00",
    referred_by_customer_id: "cust10", // 松田さまの紹介
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast1",
    line_exchanged_at: "2024-12-20T22:00:00+09:00",
  },
  // ── 店舗入力だけで担当なしのサンプル（ファネル最上段） ──
  {
    id: "cust12",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1", // とりあえず仮担当だが実質未接客
    name: "青木 康介",
    birthday: "1988-05-20",
    job: "商社マン",
    favorite_drink: null,
    category: "new",
    store_memo: "来店1回のみ、名刺交換のみ",
    created_at: "2026-03-12T20:00:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "store_only",
    line_exchanged_cast_id: null,
    line_exchanged_at: null,
  },
  {
    id: "cust13",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_help2",
    name: "藤田 一馬",
    birthday: "1992-02-10",
    job: "ベンチャー投資家",
    favorite_drink: null,
    category: "new",
    store_memo: "来店2回、担当あかり姉さん希望",
    created_at: "2026-03-15T21:00:00+09:00",
    referred_by_customer_id: "cust6",
    funnel_stage: "assigned",
    line_exchanged_cast_id: null,
    line_exchanged_at: null,
  },

  // ═══════════════ もえ姉さん 直接担当の顧客 ═══════════════
  {
    id: "cust14",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan3", // もえ
    name: "大橋 正人",
    birthday: "1970-06-18",
    job: "製薬会社執行役員",
    favorite_drink: "ドンペリロゼ",
    category: "vip",
    store_memo: "国際出張多い。ワインの知識深い",
    created_at: "2024-05-10T19:30:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_oneesan3",
    line_exchanged_at: "2024-05-20T23:00:00+09:00",
    manager_cast_id: "cast_oneesan3",
  },
  {
    id: "cust15",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan3",
    name: "石井 健司",
    birthday: "1976-08-22",
    job: "大手出版社編集長",
    favorite_drink: "マッカラン25年",
    category: "vip",
    store_memo: "文学の話題好き。お酒強い",
    created_at: "2025-03-01T20:00:00+09:00",
    referred_by_customer_id: "cust14",
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_oneesan3",
    line_exchanged_at: "2025-03-15T22:30:00+09:00",
    manager_cast_id: "cast_oneesan3",
  },
  {
    id: "cust16",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan3",
    name: "橋本 慎一",
    birthday: "1982-11-03",
    job: "外資金融VP",
    favorite_drink: "ボウモア18年",
    category: "regular",
    store_memo: "ロンドン駐在経験。スコッチ詳しい",
    created_at: "2025-07-12T19:00:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_oneesan3",
    line_exchanged_at: "2025-07-25T23:00:00+09:00",
    manager_cast_id: "cast_oneesan3",
  },
  {
    id: "cust17",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan3",
    name: "岡田 雅彦",
    birthday: "1988-01-14",
    job: "ITスタートアップCTO",
    favorite_drink: "白州12年ハイボール",
    category: "regular",
    store_memo: null,
    created_at: "2025-11-05T20:30:00+09:00",
    referred_by_customer_id: "cust15",
    funnel_stage: "assigned",
    line_exchanged_cast_id: null,
    line_exchanged_at: null,
    manager_cast_id: "cast_oneesan3",
  },

  // ═══════════════ ちひろ姉さん (もえ配下) 直接担当 ═══════════════
  {
    id: "cust18",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan5", // ちひろ
    name: "黒田 真治",
    birthday: "1985-09-30",
    job: "広告プロダクション代表",
    favorite_drink: "ジョニ黒",
    category: "regular",
    store_memo: "クリエイティブ畑。音楽の話で盛り上がる",
    created_at: "2025-08-20T19:30:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_oneesan5",
    line_exchanged_at: "2025-09-01T22:00:00+09:00",
    manager_cast_id: "cast_oneesan5",
  },
  {
    id: "cust19",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan5",
    name: "西野 博之",
    birthday: "1978-04-11",
    job: "税理士法人パートナー",
    favorite_drink: "響21年",
    category: "vip",
    store_memo: "慎重派。酒は少量を長く",
    created_at: "2025-02-18T20:00:00+09:00",
    referred_by_customer_id: "cust14",
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_oneesan5",
    line_exchanged_at: "2025-03-05T23:30:00+09:00",
    manager_cast_id: "cast_oneesan5",
  },
  {
    id: "cust20",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan5",
    name: "平野 大悟",
    birthday: "1990-12-07",
    job: "ベンチャー投資家",
    favorite_drink: "グレンモーレンジ18年",
    category: "new",
    store_memo: null,
    created_at: "2026-02-28T21:00:00+09:00",
    referred_by_customer_id: "cust18",
    funnel_stage: "assigned",
    line_exchanged_cast_id: null,
    line_exchanged_at: null,
    manager_cast_id: "cast_oneesan5",
  },

  // ═══════════════ みお (ちひろ配下キャスト) 担当 ═══════════════
  {
    id: "cust21",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_help3", // みお
    name: "森岡 隆",
    birthday: "1983-03-18",
    job: "メーカー海外営業",
    favorite_drink: "ハイボール",
    category: "regular",
    store_memo: null,
    created_at: "2025-10-02T20:00:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "assigned",
    line_exchanged_cast_id: null,
    line_exchanged_at: null,
    manager_cast_id: "cast_oneesan5", // ちひろが管理
  },
  {
    id: "cust22",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_help3",
    name: "若林 純",
    birthday: "1995-07-22",
    job: "EC系起業家",
    favorite_drink: "モエ・エ・シャンドン",
    category: "new",
    store_memo: "若い経営者。同世代の話題が好き",
    created_at: "2026-01-20T21:30:00+09:00",
    referred_by_customer_id: "cust18",
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_help3",
    line_exchanged_at: "2026-02-05T23:00:00+09:00",
    manager_cast_id: "cast_oneesan5",
  },
  {
    id: "cust23",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_help3",
    name: "三浦 啓一",
    birthday: "1972-10-15",
    job: "自動車部品メーカー専務",
    favorite_drink: "山崎18年",
    category: "vip",
    store_memo: "ゴルフ・クラシックカー好き",
    created_at: "2025-06-10T19:00:00+09:00",
    referred_by_customer_id: "cust14",
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_help3",
    line_exchanged_at: "2025-06-25T22:30:00+09:00",
    manager_cast_id: "cast_oneesan5",
  },

  // ═══════════════ れな姉さん (top senior) 直接担当 ═══════════════
  {
    id: "cust24",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan4", // れな
    name: "野口 秀樹",
    birthday: "1965-12-25",
    job: "総合商社元常務",
    favorite_drink: "サントリー響30年",
    category: "vip",
    store_memo: "リタイア後も社交で使う。歴史好き",
    created_at: "2024-02-14T19:00:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_oneesan4",
    line_exchanged_at: "2024-02-28T23:00:00+09:00",
    manager_cast_id: "cast_oneesan4",
  },
  {
    id: "cust25",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan4",
    name: "関口 大介",
    birthday: "1974-05-08",
    job: "大手IT企業役員",
    favorite_drink: "クリュッグ グランキュヴェ",
    category: "vip",
    store_memo: "ワイン・シャンパン投資も。",
    created_at: "2024-09-18T20:30:00+09:00",
    referred_by_customer_id: "cust24",
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_oneesan4",
    line_exchanged_at: "2024-10-02T22:00:00+09:00",
    manager_cast_id: "cast_oneesan4",
  },
  {
    id: "cust26",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan4",
    name: "福田 晋也",
    birthday: "1980-02-28",
    job: "建築設計事務所代表",
    favorite_drink: "タリスカー10年",
    category: "regular",
    store_memo: "建築家。意匠・芸術の話題OK",
    created_at: "2025-05-06T19:30:00+09:00",
    referred_by_customer_id: "cust25",
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_oneesan4",
    line_exchanged_at: "2025-05-20T23:30:00+09:00",
    manager_cast_id: "cast_oneesan4",
  },
  {
    id: "cust27",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan4",
    name: "宮本 光",
    birthday: "1992-09-04",
    job: "弁護士（企業法務）",
    favorite_drink: "ラフロイグ10年",
    category: "new",
    store_memo: null,
    created_at: "2026-02-05T21:00:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "assigned",
    line_exchanged_cast_id: null,
    line_exchanged_at: null,
    manager_cast_id: "cast_oneesan4",
  },

  // ═══════════════ かなで姉さん (れな配下) 直接担当 ═══════════════
  {
    id: "cust28",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan6", // かなで
    name: "長谷川 修",
    birthday: "1985-11-11",
    job: "人事コンサルティング代表",
    favorite_drink: "アランモルト",
    category: "regular",
    store_memo: null,
    created_at: "2025-04-22T20:00:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_oneesan6",
    line_exchanged_at: "2025-05-08T22:00:00+09:00",
    manager_cast_id: "cast_oneesan6",
  },
  {
    id: "cust29",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan6",
    name: "佐々木 直人",
    birthday: "1977-06-30",
    job: "不動産開発会社社長",
    favorite_drink: "響17年",
    category: "vip",
    store_memo: "ポーカー・投資の話題好き",
    created_at: "2024-12-03T19:00:00+09:00",
    referred_by_customer_id: "cust24",
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_oneesan6",
    line_exchanged_at: "2024-12-20T23:00:00+09:00",
    manager_cast_id: "cast_oneesan6",
  },
  {
    id: "cust30",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan6",
    name: "竹中 悠",
    birthday: "1988-04-25",
    job: "食品メーカー経営企画",
    favorite_drink: "アードベッグ10年",
    category: "regular",
    store_memo: null,
    created_at: "2025-08-14T20:30:00+09:00",
    referred_by_customer_id: "cust28",
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_oneesan6",
    line_exchanged_at: "2025-08-30T22:30:00+09:00",
    manager_cast_id: "cast_oneesan6",
  },
  {
    id: "cust31",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan6",
    name: "岩田 隼人",
    birthday: "1994-12-12",
    job: "スポーツエージェント",
    favorite_drink: "ジャックダニエル",
    category: "new",
    store_memo: "スポーツ選手の話題好き",
    created_at: "2026-02-22T21:30:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "assigned",
    line_exchanged_cast_id: null,
    line_exchanged_at: null,
    manager_cast_id: "cast_oneesan6",
  },

  // ═══════════════ さら (かなで配下キャスト) 担当 ═══════════════
  {
    id: "cust32",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_help4", // さら
    name: "村田 武",
    birthday: "1986-07-09",
    job: "飲食チェーン事業部長",
    favorite_drink: "ハイボール",
    category: "regular",
    store_memo: null,
    created_at: "2025-09-28T19:30:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "assigned",
    line_exchanged_cast_id: null,
    line_exchanged_at: null,
    manager_cast_id: "cast_oneesan6",
  },
  {
    id: "cust33",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_help4",
    name: "三井 康平",
    birthday: "1981-02-16",
    job: "医療機器メーカー部長",
    favorite_drink: "山崎12年",
    category: "regular",
    store_memo: "医療業界の話題NG（守秘義務）",
    created_at: "2025-11-10T20:00:00+09:00",
    referred_by_customer_id: "cust29",
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_help4",
    line_exchanged_at: "2025-11-22T22:30:00+09:00",
    manager_cast_id: "cast_oneesan6",
  },
  {
    id: "cust34",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_help4",
    name: "吉岡 翔",
    birthday: "1996-09-20",
    job: "IT企業PM",
    favorite_drink: "ジントニック",
    category: "new",
    store_memo: null,
    created_at: "2026-03-05T21:00:00+09:00",
    referred_by_customer_id: "cust30",
    funnel_stage: "assigned",
    line_exchanged_cast_id: null,
    line_exchanged_at: null,
    manager_cast_id: "cast_oneesan6",
  },

  // ═══════════════ ゆき姉さん の追加直接担当（姉さん自身も顧客を持つ） ═══════════════
  {
    id: "cust35",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan2", // ゆき本人が担当
    name: "原田 雄一",
    birthday: "1968-08-17",
    job: "不動産投資ファンドCEO",
    favorite_drink: "山崎25年",
    category: "vip",
    store_memo: "ゆき姉さんの指名、長期のVIP。機密保持意識高い",
    created_at: "2023-11-15T19:00:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_oneesan2",
    line_exchanged_at: "2023-12-01T23:00:00+09:00",
    manager_cast_id: "cast_oneesan2",
  },
  {
    id: "cust36",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan2",
    name: "井上 和彦",
    birthday: "1971-03-03",
    job: "保険会社役員",
    favorite_drink: "響ジャパニーズハーモニー",
    category: "vip",
    store_memo: "接待利用多い。芸能人の話題好き",
    created_at: "2024-07-08T20:00:00+09:00",
    referred_by_customer_id: "cust35",
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_oneesan2",
    line_exchanged_at: "2024-07-20T22:30:00+09:00",
    manager_cast_id: "cast_oneesan2",
  },
  {
    id: "cust37",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan2",
    name: "服部 朗",
    birthday: "1980-10-28",
    job: "外資系ヘッドハンター",
    favorite_drink: "グレンフィディック15年",
    category: "regular",
    store_memo: null,
    created_at: "2025-10-15T19:30:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "line_exchanged",
    line_exchanged_cast_id: "cast_oneesan2",
    line_exchanged_at: "2025-10-28T23:00:00+09:00",
    manager_cast_id: "cast_oneesan2",
  },

  // ═══════════════ 店舗登録のみ（ファネル最上段） ═══════════════
  {
    id: "cust38",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast1", // 仮担当あかり
    name: "菅原 健",
    birthday: "1985-05-15",
    job: "ITコンサル",
    favorite_drink: null,
    category: "new",
    store_memo: "来店1回、名刺交換のみ",
    created_at: "2026-03-12T20:30:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "store_only",
    line_exchanged_cast_id: null,
    line_exchanged_at: null,
    manager_cast_id: "cast_oneesan2",
  },
  {
    id: "cust39",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan3", // 仮担当もえ
    name: "坂井 啓介",
    birthday: "1978-11-20",
    job: "法律事務所パートナー",
    favorite_drink: null,
    category: "new",
    store_memo: "来店1回",
    created_at: "2026-03-14T21:00:00+09:00",
    referred_by_customer_id: null,
    funnel_stage: "store_only",
    line_exchanged_cast_id: null,
    line_exchanged_at: null,
    manager_cast_id: "cast_oneesan3",
  },
  {
    id: "cust40",
    store_id: CURRENT_STORE_ID,
    cast_id: "cast_oneesan4", // 仮担当れな
    name: "新井 啓太",
    birthday: "1983-06-25",
    job: "スタートアップ CFO",
    favorite_drink: null,
    category: "new",
    store_memo: "紹介で来店、まだ担当未確定",
    created_at: "2026-03-17T22:00:00+09:00",
    referred_by_customer_id: "cust25",
    funnel_stage: "store_only",
    line_exchanged_cast_id: null,
    line_exchanged_at: null,
    manager_cast_id: "cast_oneesan4",
  },
];

// ── 管理者（ママ/姉さん）の自動割り当て ──
// 担当者から推論: 担当が姉さん/ママなら本人、キャスト(help)なら上の姉さん
// inferManagerCastId() と同じロジックをここでも（循環import回避のため一部再実装）
function inferManagerForMock(castId: string): string | null {
  const c = mockCasts.find((x) => x.id === castId);
  if (!c) return null;
  if (c.club_role === "mama" || c.club_role === "oneesan") return c.id;
  if (c.club_role === "help" && c.assigned_oneesan_id)
    return c.assigned_oneesan_id;
  return null;
}
for (const c of mockCustomers) {
  if (c.manager_cast_id === undefined || c.manager_cast_id === null) {
    c.manager_cast_id = inferManagerForMock(c.cast_id);
  }
}

// ── デモの面白さのため、一部の顧客を明示的にゆき管理にする ──
// （あかりが「ヘルプで入ったお客様」として表示されるよう）
const OVERRIDE_MANAGER: Record<string, string> = {
  cust3: "cast_oneesan2", // 渡辺浩二 → ゆき管理（あかりがヘルプで入る）
  cust8: "cast_oneesan2", // 木村亮介 → ゆき管理
  cust11: "cast_oneesan2", // 伊藤雅人 → ゆき管理
};
for (const c of mockCustomers) {
  const override = OVERRIDE_MANAGER[c.id];
  if (override) c.manager_cast_id = override;
}

// total_glasses / remaining_glasses are now interpreted as a percentage
// (0–100). Schema columns kept the historical names to avoid a
// migration. New bottles default to 100; consume drops by 10.
export const mockBottles: Bottle[] = [
  {
    id: "btl1",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust1",
    brand: "山崎12年",
    total_glasses: 100,
    remaining_glasses: 40,
    kept_at: "2026-01-10T20:00:00+09:00",
  },
  {
    id: "btl2",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust3",
    brand: "マッカラン12年",
    total_glasses: 100,
    remaining_glasses: 15,
    kept_at: "2025-12-20T20:30:00+09:00",
  },
  {
    id: "btl3",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust1",
    brand: "白州12年",
    total_glasses: 100,
    remaining_glasses: 30,
    kept_at: "2026-02-01T20:30:00+09:00",
  },
  {
    id: "btl4",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust4",
    brand: "響 JH",
    total_glasses: 100,
    remaining_glasses: 60,
    kept_at: "2026-02-14T20:00:00+09:00",
  },
  // ── 追加顧客のボトル ──
  {
    id: "btl8",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust5",
    brand: "森伊蔵",
    total_glasses: 100,
    remaining_glasses: 25,
    kept_at: "2026-01-20T20:00:00+09:00",
  },
  {
    id: "btl9",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust8",
    brand: "響21年",
    total_glasses: 100,
    remaining_glasses: 20,
    kept_at: "2025-12-10T19:30:00+09:00",
  },
  {
    id: "btl10",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust10",
    brand: "魔王",
    total_glasses: 100,
    remaining_glasses: 80,
    kept_at: "2026-03-01T20:00:00+09:00",
  },
  {
    id: "btl11",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust11",
    brand: "マッカラン18年",
    total_glasses: 100,
    remaining_glasses: 60,
    kept_at: "2026-02-01T19:30:00+09:00",
  },
  // ── 田中太郎が Lounge ÉTOILE 六本木 でキープ ──
  {
    id: "btl5",
    store_id: "store2",
    customer_id: "cust1",
    brand: "村尾",
    total_glasses: 100,
    remaining_glasses: 60,
    kept_at: "2026-02-20T21:00:00+09:00",
  },
  {
    id: "btl6",
    store_id: "store2",
    customer_id: "cust1",
    brand: "グレンリベット12年",
    total_glasses: 100,
    remaining_glasses: 70,
    kept_at: "2026-01-30T20:30:00+09:00",
  },
  // ── 田中太郎が BAR VELVET 赤坂 でキープ ──
  {
    id: "btl7",
    store_id: "store3",
    customer_id: "cust1",
    brand: "竹鶴17年",
    total_glasses: 100,
    remaining_glasses: 90,
    kept_at: "2026-03-01T21:00:00+09:00",
  },
];

// 来店履歴（連絡リスト判定で使用）
// 田中太郎: 来店12回, 最終 2026-03-07 (12日前 → 連絡が必要)
// 高橋 誠: 来店3回, 最終 2026-03-08 (11日前 → 指名化チャンス・新規)
// 渡辺浩二: 来店20回, 最終 2026-02-28 (19日前 → 誕生日3/25間近)
// 佐藤健一: 来店8回, 最終 2026-03-12 (7日前)
export const mockVisits: Visit[] = [
  // 田中太郎 — VIPは毎週ペースで来ていたのが12日空いている → 連絡が必要
  ...generateVisitSeries({
    customer_id: "cust1",
    cast_id: "cast1",
    lastVisit: "2026-03-07",
    intervalDays: 7,
    count: 12,
    is_nominated: true,
  }),
  // 高橋誠 — 新規3回
  ...generateVisitSeries({
    customer_id: "cust2",
    cast_id: "cast1",
    lastVisit: "2026-03-08",
    intervalDays: 10,
    count: 3,
    is_nominated: false,
  }),
  // 渡辺浩二 — VIP20回
  ...generateVisitSeries({
    customer_id: "cust3",
    cast_id: "cast1",
    lastVisit: "2026-02-28",
    intervalDays: 9,
    count: 20,
    is_nominated: true,
  }),
  // 佐藤健一 — あやな担当
  ...generateVisitSeries({
    customer_id: "cust4",
    cast_id: "cast_help2",
    lastVisit: "2026-03-12",
    intervalDays: 12,
    count: 8,
    is_nominated: true,
  }),
  // ── 田中太郎の他店舗来店 ──
  // Lounge ÉTOILE 六本木 — 5回, りな指名
  ...generateVisitSeries({
    customer_id: "cust1",
    cast_id: "cast3",
    lastVisit: "2026-03-10",
    intervalDays: 14,
    count: 5,
    is_nominated: true,
    store_id: "store2",
  }),
  // BAR VELVET 赤坂 — 3回, ゆい指名
  ...generateVisitSeries({
    customer_id: "cust1",
    cast_id: "cast4",
    lastVisit: "2026-03-05",
    intervalDays: 21,
    count: 3,
    is_nominated: true,
    store_id: "store3",
  }),
  // ── 追加顧客の来店履歴（あかり担当、様々なパターン） ──
  // cust5 山本隆 — VIP、毎週来店していたが35日空き → VIP要注意
  ...generateVisitSeries({
    customer_id: "cust5",
    cast_id: "cast1",
    lastVisit: "2026-02-12",
    intervalDays: 7,
    count: 15,
    is_nominated: true,
  }),
  // cust6 中村慎太郎 — 常連、月1ペースで安定 → アクティブ
  ...generateVisitSeries({
    customer_id: "cust6",
    cast_id: "cast1",
    lastVisit: "2026-03-15",
    intervalDays: 30,
    count: 8,
    is_nominated: true,
  }),
  // cust7 鈴木大輔 — 新規、2回だけ → 新規
  ...generateVisitSeries({
    customer_id: "cust7",
    cast_id: "cast1",
    lastVisit: "2026-03-14",
    intervalDays: 5,
    count: 2,
    is_nominated: false,
  }),
  // cust8 木村亮介 — VIP、40日来てない → 休眠
  ...generateVisitSeries({
    customer_id: "cust8",
    cast_id: "cast1",
    lastVisit: "2026-02-05",
    intervalDays: 14,
    count: 25,
    is_nominated: true,
  }),
  // cust9 小林翔太 — 常連、2週間ペースだが20日空き → 連絡が必要
  ...generateVisitSeries({
    customer_id: "cust9",
    cast_id: "cast1",
    lastVisit: "2026-02-27",
    intervalDays: 14,
    count: 6,
    is_nominated: true,
  }),
  // cust10 松田健太郎 — 常連、3週間ペースで安定 → アクティブ
  ...generateVisitSeries({
    customer_id: "cust10",
    cast_id: "cast1",
    lastVisit: "2026-03-16",
    intervalDays: 21,
    count: 10,
    is_nominated: true,
  }),
  // cust11 伊藤雅人 — VIP、10日ペースで安定 → アクティブ
  ...generateVisitSeries({
    customer_id: "cust11",
    cast_id: "cast1",
    lastVisit: "2026-03-18",
    intervalDays: 10,
    count: 12,
    is_nominated: true,
  }),
  // ── あかりがゆき管理顧客にヘルプで入った来店履歴 ──
  {
    id: "help_visit_1",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust3", // 渡辺浩二 (ゆき管理)
    cast_id: "cast1", // あかりがヘルプ
    table_name: "T1",
    is_nominated: false,
    visited_at: "2026-03-18T20:30:00+09:00",
  },
  {
    id: "help_visit_2",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust8", // 木村亮介 (ゆき管理)
    cast_id: "cast1",
    table_name: "T2",
    is_nominated: false,
    visited_at: "2026-03-15T21:00:00+09:00",
  },
  {
    id: "help_visit_3",
    store_id: CURRENT_STORE_ID,
    customer_id: "cust11",
    cast_id: "cast1",
    table_name: "T3",
    is_nominated: false,
    visited_at: "2026-03-10T20:00:00+09:00",
  },

  // ═══ 新規顧客の来店履歴 ═══
  // もえ直担当
  ...generateVisitSeries({ customer_id: "cust14", cast_id: "cast_oneesan3", lastVisit: "2026-03-17", intervalDays: 8, count: 18, is_nominated: true }),
  ...generateVisitSeries({ customer_id: "cust15", cast_id: "cast_oneesan3", lastVisit: "2026-03-14", intervalDays: 12, count: 8, is_nominated: true }),
  ...generateVisitSeries({ customer_id: "cust16", cast_id: "cast_oneesan3", lastVisit: "2026-03-16", intervalDays: 14, count: 6, is_nominated: true }),
  ...generateVisitSeries({ customer_id: "cust17", cast_id: "cast_oneesan3", lastVisit: "2026-03-15", intervalDays: 18, count: 4, is_nominated: false }),
  // ちひろ直担当
  ...generateVisitSeries({ customer_id: "cust18", cast_id: "cast_oneesan5", lastVisit: "2026-03-11", intervalDays: 12, count: 7, is_nominated: true }),
  ...generateVisitSeries({ customer_id: "cust19", cast_id: "cast_oneesan5", lastVisit: "2026-03-13", intervalDays: 14, count: 9, is_nominated: true }),
  ...generateVisitSeries({ customer_id: "cust20", cast_id: "cast_oneesan5", lastVisit: "2026-03-09", intervalDays: 10, count: 2, is_nominated: false }),
  // みお (ちひろ配下) 担当
  ...generateVisitSeries({ customer_id: "cust21", cast_id: "cast_help3", lastVisit: "2026-03-12", intervalDays: 14, count: 6, is_nominated: false }),
  ...generateVisitSeries({ customer_id: "cust22", cast_id: "cast_help3", lastVisit: "2026-03-16", intervalDays: 8, count: 4, is_nominated: true }),
  ...generateVisitSeries({ customer_id: "cust23", cast_id: "cast_help3", lastVisit: "2026-03-14", intervalDays: 15, count: 7, is_nominated: true }),
  // れな直担当
  ...generateVisitSeries({ customer_id: "cust24", cast_id: "cast_oneesan4", lastVisit: "2026-03-17", intervalDays: 10, count: 22, is_nominated: true }),
  ...generateVisitSeries({ customer_id: "cust25", cast_id: "cast_oneesan4", lastVisit: "2026-03-16", intervalDays: 12, count: 15, is_nominated: true }),
  ...generateVisitSeries({ customer_id: "cust26", cast_id: "cast_oneesan4", lastVisit: "2026-03-13", intervalDays: 14, count: 8, is_nominated: true }),
  ...generateVisitSeries({ customer_id: "cust27", cast_id: "cast_oneesan4", lastVisit: "2026-03-08", intervalDays: 21, count: 2, is_nominated: false }),
  // かなで直担当
  ...generateVisitSeries({ customer_id: "cust28", cast_id: "cast_oneesan6", lastVisit: "2026-03-15", intervalDays: 14, count: 7, is_nominated: true }),
  ...generateVisitSeries({ customer_id: "cust29", cast_id: "cast_oneesan6", lastVisit: "2026-03-14", intervalDays: 9, count: 14, is_nominated: true }),
  ...generateVisitSeries({ customer_id: "cust30", cast_id: "cast_oneesan6", lastVisit: "2026-03-12", intervalDays: 16, count: 5, is_nominated: true }),
  ...generateVisitSeries({ customer_id: "cust31", cast_id: "cast_oneesan6", lastVisit: "2026-03-05", intervalDays: 12, count: 2, is_nominated: false }),
  // さら (かなで配下) 担当
  ...generateVisitSeries({ customer_id: "cust32", cast_id: "cast_help4", lastVisit: "2026-03-10", intervalDays: 14, count: 5, is_nominated: false }),
  ...generateVisitSeries({ customer_id: "cust33", cast_id: "cast_help4", lastVisit: "2026-03-13", intervalDays: 12, count: 6, is_nominated: true }),
  ...generateVisitSeries({ customer_id: "cust34", cast_id: "cast_help4", lastVisit: "2026-03-04", intervalDays: 18, count: 1, is_nominated: false }),
  // ゆき直担当（追加）
  ...generateVisitSeries({ customer_id: "cust35", cast_id: "cast_oneesan2", lastVisit: "2026-03-17", intervalDays: 8, count: 30, is_nominated: true }),
  ...generateVisitSeries({ customer_id: "cust36", cast_id: "cast_oneesan2", lastVisit: "2026-03-16", intervalDays: 10, count: 18, is_nominated: true }),
  ...generateVisitSeries({ customer_id: "cust37", cast_id: "cast_oneesan2", lastVisit: "2026-03-14", intervalDays: 12, count: 6, is_nominated: true }),

  // ═══ ヘルプで他姉さん管理顧客に入った来店（デモ充実用）═══
  // もえがれな管理のcust24にヘルプ
  { id: "help_visit_4", store_id: CURRENT_STORE_ID, customer_id: "cust24", cast_id: "cast_oneesan3", table_name: "T5", is_nominated: false, visited_at: "2026-03-11T21:00:00+09:00" },
  // ちひろがあかり管理のcust1にヘルプ
  { id: "help_visit_5", store_id: CURRENT_STORE_ID, customer_id: "cust1", cast_id: "cast_oneesan5", table_name: "T6", is_nominated: false, visited_at: "2026-03-09T20:30:00+09:00" },
  // かなでがもえ管理のcust14にヘルプ
  { id: "help_visit_6", store_id: CURRENT_STORE_ID, customer_id: "cust14", cast_id: "cast_oneesan6", table_name: "T2", is_nominated: false, visited_at: "2026-03-13T20:00:00+09:00" },
  // れながゆき管理のcust35にヘルプ
  { id: "help_visit_7", store_id: CURRENT_STORE_ID, customer_id: "cust35", cast_id: "cast_oneesan4", table_name: "T1", is_nominated: false, visited_at: "2026-03-14T21:30:00+09:00" },
];

function generateVisitSeries(opts: {
  customer_id: string;
  cast_id: string;
  lastVisit: string; // YYYY-MM-DD
  intervalDays: number;
  count: number;
  is_nominated: boolean;
  store_id?: string;
}): Visit[] {
  const storeId = opts.store_id ?? CURRENT_STORE_ID;
  const visits: Visit[] = [];
  const last = new Date(opts.lastVisit + "T20:00:00+09:00");
  for (let i = 0; i < opts.count; i++) {
    const d = new Date(last);
    d.setDate(d.getDate() - i * opts.intervalDays);
    visits.push({
      id: `visit_${opts.customer_id}_${storeId}_${i}`,
      store_id: storeId,
      customer_id: opts.customer_id,
      cast_id: opts.cast_id,
      table_name: i === 0 ? "T3" : null,
      is_nominated: opts.is_nominated,
      visited_at: d.toISOString(),
    });
  }
  return visits;
}

export const mockCastMemos: CastMemo[] = [
  {
    id: "memo1",
    customer_id: "cust1",
    cast_id: "cast1",
    last_topic: "4月のゴルフ旅行の計画",
    service_tips:
      "最初は仕事の話から入る。2杯目以降にプライベート。山崎12年ロックが定番。息子さんの受験の話題は避ける（店舗メモ参照）。",
    next_topics: "春のゴルフ旅行の持ち物、新しく開業したクライアント先",
    visit_notes: null,
    updated_at: "2026-03-07T23:30:00+09:00",
  },
  {
    id: "memo2",
    customer_id: "cust2",
    cast_id: "cast1",
    last_topic: "通い始めたジムのパーソナルトレーナーが厳しい",
    service_tips: "ボトル提案はまだ早い。まず2〜3回指名を取りに行く。",
    next_topics: "トレーニングの進捗、ボディメイク。",
    visit_notes: null,
    updated_at: "2026-03-08T23:45:00+09:00",
  },
  {
    id: "memo3",
    customer_id: "cust3",
    cast_id: "cast1",
    last_topic: "有馬記念でドウデュースの話",
    service_tips:
      "競馬と不動産の話がツボ。マッカラン12年を切らさないように店舗に共有。",
    next_topics: "春のGIシリーズ、桜花賞の予想。",
    visit_notes: null,
    updated_at: "2026-02-28T23:00:00+09:00",
  },
  // ── 追加顧客のメモ ──
  {
    id: "memo5",
    customer_id: "cust5",
    cast_id: "cast1",
    last_topic: "新車のポルシェ（タイカン）を納車した話",
    service_tips:
      "知識人タイプ。ゴルフと車の話から入ると盛り上がる。ドンペリは特別な日のみ。",
    next_topics: "ゴルフのラウンド結果、車の慣らし運転",
    visit_notes: null,
    updated_at: "2026-02-12T23:00:00+09:00",
  },
  {
    id: "memo6",
    customer_id: "cust6",
    cast_id: "cast1",
    last_topic: "海外出張（シンガポール）のお土産",
    service_tips:
      "月末に来る傾向。出張の話を聞くと喜ぶ。あまり甘いお酒は飲まない。",
    next_topics: "次の出張先、シンガポールのレストラン",
    visit_notes: null,
    updated_at: "2026-03-15T23:30:00+09:00",
  },
  {
    id: "memo7",
    customer_id: "cust7",
    cast_id: "cast1",
    last_topic: "自社のプロダクトローンチが近い",
    service_tips:
      "新規なのでまだ距離感を測っている。仕事の話が中心。ボトル提案は3回目以降。",
    next_topics: "プロダクトローンチの結果、資金調達",
    visit_notes: null,
    updated_at: "2026-03-14T23:00:00+09:00",
  },
  {
    id: "memo8",
    customer_id: "cust8",
    cast_id: "cast1",
    last_topic: "飼い犬（柴犬のコタロー）の体調",
    service_tips:
      "静かな席を好む。接待相手がいる時は控えめに。犬の話は必ず盛り上がる。",
    next_topics: "コタローの回復、春の庭づくり",
    visit_notes: null,
    updated_at: "2026-02-05T22:00:00+09:00",
  },
  {
    id: "memo9",
    customer_id: "cust9",
    cast_id: "cast1",
    last_topic: "学会発表の準備で忙しい",
    service_tips:
      "夜勤明けのことがある。疲れてる時は静かに寄り添う。お酒は1〜2杯で止める。",
    next_topics: "学会発表の結果、最近観た映画",
    visit_notes: null,
    updated_at: "2026-02-27T23:00:00+09:00",
  },
  {
    id: "memo10",
    customer_id: "cust10",
    cast_id: "cast1",
    last_topic: "自分の店のリニューアル工事",
    service_tips:
      "同業者なので接客論はNG。ジャズと料理の話で盛り上がる。シャンパン好き。",
    next_topics: "リニューアル後のメニュー、春のジャズライブ",
    visit_notes: null,
    updated_at: "2026-03-16T23:30:00+09:00",
  },
  {
    id: "memo11",
    customer_id: "cust11",
    cast_id: "cast1",
    last_topic: "ワインセラーに新しく入れたブルゴーニュ",
    service_tips:
      "知的な会話を好む。ウイスキーとワインに詳しい。褒められるのが好き。",
    next_topics: "ブルゴーニュのテイスティング、最近読んだ本",
    visit_notes: null,
    updated_at: "2026-03-18T23:00:00+09:00",
  },
  // ── ゆき姉さん（cast_oneesan2）の担当顧客 ──
  {
    id: "memo35",
    customer_id: "cust35",
    cast_id: "cast_oneesan2",
    last_topic: "新しく取得した湾岸の物件、息子のMBA進学",
    service_tips:
      "長期VIP。機密保持を最重視。同席者がいる時は仕事の話を控える。山崎25年は常時キープ。",
    next_topics: "息子のMBA出発前の壮行、春の物件視察ツアー",
    visit_notes: null,
    updated_at: "2026-03-17T23:30:00+09:00",
  },
  // ── あやな（cast_help2）の担当顧客 ──
  {
    id: "memo4",
    customer_id: "cust4",
    cast_id: "cast_help2",
    last_topic: "新しく動いている広告キャンペーンの撮影が押している",
    service_tips:
      "渡辺さま（cust3）の紹介。仕事の愚痴を聞いてほしいタイプ。響JHの水割りを切らさない。新人なので深追いせず、まず名前と顔を覚える。",
    next_topics: "撮影の仕上がり、ゴールデンウィークの予定",
    visit_notes: null,
    updated_at: "2026-03-16T23:15:00+09:00",
  },
  // ── もえ姉さん（cast_oneesan3）の担当顧客 ──
  {
    id: "memo14",
    customer_id: "cust14",
    cast_id: "cast_oneesan3",
    last_topic: "シンガポール出張の土産話、新しいブルゴーニュの輸入",
    service_tips:
      "ワインの知識深い。ドンペリロゼは特別な日のみ、普段はブルゴーニュ赤の方が話が弾む。海外出張多いので来店前にLINEで在庫確認。",
    next_topics: "次の出張先（パリの予定）、ワインオークションの結果",
    visit_notes: null,
    updated_at: "2026-03-15T23:45:00+09:00",
  },
  // ── れな姉さん（cast_oneesan4）の担当顧客 ──
  {
    id: "memo24",
    customer_id: "cust24",
    cast_id: "cast_oneesan4",
    last_topic: "戦国武将の本を読み返している、孫の入学祝い",
    service_tips:
      "歴史・古典の話題が鉄板。リタイア後で時間に余裕あり、長居傾向。響30年は3杯までで止める（飲み過ぎ注意の家族指示あり）。",
    next_topics: "桜の季節の散策、孫の入学式",
    visit_notes: null,
    updated_at: "2026-03-14T23:00:00+09:00",
  },
];

// ── キャスト目標（月次）──
// 管理者（ママ・店舗スタッフ）が設定する。未設定はデフォルト値で補完。
export const mockCastGoals: CastGoal[] = [
  {
    castId: "cast1",
    salesGoal: 1_500_000,
    douhanGoal: 4,
    note: "今月は新規からの指名化に集中して。困ったら相談して",
    setBy: "cast_oneesan2",
    updatedAt: "2026-03-01T10:00:00+09:00",
  },
  {
    castId: "cast_help2",
    salesGoal: 800_000,
    douhanGoal: 2,
    note: "LINE交換率を上げることが今月のテーマ。お客様のお名前を覚えることから",
    setBy: "cast1",
    updatedAt: "2026-03-01T11:00:00+09:00",
  },
  {
    castId: "cast_oneesan2",
    salesGoal: 3_000_000,
    douhanGoal: 8,
    note: null,
    setBy: null,
    updatedAt: "2026-03-01T09:00:00+09:00",
  },
  {
    castId: "cast_oneesan3",
    salesGoal: 2_500_000,
    douhanGoal: 6,
    note: null,
    setBy: null,
    updatedAt: "2026-03-01T09:00:00+09:00",
  },
  {
    castId: "cast_oneesan4",
    salesGoal: 2_800_000,
    douhanGoal: 7,
    note: null,
    setBy: null,
    updatedAt: "2026-03-01T09:00:00+09:00",
  },
  {
    castId: "cast_oneesan5",
    salesGoal: 2_200_000,
    douhanGoal: 5,
    note: null,
    setBy: null,
    updatedAt: "2026-03-01T09:00:00+09:00",
  },
  {
    castId: "cast_oneesan6",
    salesGoal: 2_000_000,
    douhanGoal: 5,
    note: null,
    setBy: null,
    updatedAt: "2026-03-01T09:00:00+09:00",
  },
  {
    castId: "cast_help3",
    salesGoal: 700_000,
    douhanGoal: 2,
    note: "接客の基本を固める月。ヘルプ回数を増やして経験値を積もう",
    setBy: "cast_oneesan5",
    updatedAt: "2026-03-02T10:00:00+09:00",
  },
  {
    castId: "cast_help4",
    salesGoal: 750_000,
    douhanGoal: 2,
    note: null,
    setBy: "cast_oneesan6",
    updatedAt: "2026-03-02T10:00:00+09:00",
  },
];

// ═══════════════ Follow Logs (連絡履歴) ═══════════════

export const mockFollowLogs: FollowLog[] = [
  { id: "fl1", customer_id: "cust1", cast_id: "cast1", template_type: "thanks", sent_at: "2026-03-10T20:00:00+09:00" },
  { id: "fl2", customer_id: "cust2", cast_id: "cast1", template_type: "invite", sent_at: "2026-03-08T19:30:00+09:00" },
  { id: "fl3", customer_id: "cust3", cast_id: "cast1", template_type: "birthday", sent_at: "2026-03-15T18:00:00+09:00" },
  { id: "fl4", customer_id: "cust4", cast_id: "cast1", template_type: "thanks", sent_at: "2026-03-12T21:00:00+09:00" },
  { id: "fl5", customer_id: "cust5", cast_id: "cast1", template_type: "seasonal", sent_at: "2026-03-01T17:00:00+09:00" },
  { id: "fl6", customer_id: "cust1", cast_id: "cast1", template_type: "invite", sent_at: "2026-03-16T20:30:00+09:00" },
  { id: "fl7", customer_id: "cust6", cast_id: "cast_oneesan2", template_type: "thanks", sent_at: "2026-03-14T19:00:00+09:00" },
  { id: "fl8", customer_id: "cust7", cast_id: "cast_oneesan2", template_type: "invite", sent_at: "2026-03-11T20:00:00+09:00" },
  { id: "fl9", customer_id: "cust8", cast_id: "cast_oneesan3", template_type: "thanks", sent_at: "2026-03-13T21:30:00+09:00" },
  { id: "fl10", customer_id: "cust10", cast_id: "cast_oneesan3", template_type: "birthday", sent_at: "2026-03-09T18:00:00+09:00" },
  { id: "fl11", customer_id: "cust12", cast_id: "cast_oneesan4", template_type: "seasonal", sent_at: "2026-03-07T17:00:00+09:00" },
  { id: "fl12", customer_id: "cust14", cast_id: "cast_oneesan4", template_type: "thanks", sent_at: "2026-03-18T20:00:00+09:00" },
  { id: "fl13", customer_id: "cust15", cast_id: "cast_help2", template_type: "thanks", sent_at: "2026-03-17T19:30:00+09:00" },
  { id: "fl14", customer_id: "cust16", cast_id: "cast_oneesan5", template_type: "invite", sent_at: "2026-03-06T20:00:00+09:00" },
  { id: "fl15", customer_id: "cust18", cast_id: "cast_oneesan6", template_type: "thanks", sent_at: "2026-03-05T21:00:00+09:00" },
];

// ═══════════════ AI Chats (さくらママ相談履歴) ═══════════════

export const mockAiChats: AiChat[] = [
  {
    id: "aichat1",
    cast_id: "cast1",
    customer_id: "cust1",
    messages: [
      { role: "user", content: "田中太郎さんにお礼のLINEを送りたいのですが、どう書けばいいですか？" },
      { role: "assistant", content: "田中太郎さんへのお礼LINEですね。前回の話題「息子さんの大学受験」に触れつつ、来店感謝を伝えましょう。\n\n【例文】\n田中さん、先日はありがとうございました！息子さんの受験、順調に進んでいますか？山崎12年、とても美味しかったですね。またゆっくりお話しできるのを楽しみにしています。\n\n自然に次回来店への期待を含めつつ、プライベートの話題で距離を縮められます。" },
    ],
    feedback: "helpful",
    created_at: "2026-03-15T21:00:00+09:00",
  },
  {
    id: "aichat2",
    cast_id: "cast1",
    customer_id: "cust3",
    messages: [
      { role: "user", content: "渡辺浩二さんの誕生日が近いのですが、何かサプライズのアイデアはありますか？" },
      { role: "assistant", content: "渡辺さんのお誕生日、素敵なチャンスですね！渡辺さんはワイン好き（メルロー種がお好み）で、カテゴリは常連さん。\n\n【提案】\n1. 事前にバースデーカードを手書きで用意（「いつもありがとう」のメッセージ付き）\n2. 来店時にメルロー系の特別ワインをグラスでサービス\n3. テーブル装花を少しだけ華やかに\n\n派手すぎず、でも「覚えていてくれた」と感じてもらえる演出が常連さんには響きます。" },
    ],
    feedback: "helpful",
    created_at: "2026-03-16T20:30:00+09:00",
  },
  {
    id: "aichat3",
    cast_id: "cast1",
    customer_id: "cust2",
    messages: [
      { role: "user", content: "高橋誠さんを指名に繋げたいのですが、どうアプローチすればいいですか？" },
      { role: "assistant", content: "高橋さんは来店3回目の新規のお客様ですね。IT企業の経営者で、ハイボールがお好み。\n\n指名化のポイントは「この子と話すと楽しい・居心地がいい」と思ってもらうことです。\n\n【戦略】\n1. 次回来店時に前回の話題（ゴルフの話）を自然に振る→「覚えていてくれた」感を演出\n2. 趣味のゴルフについて少し勉強して話題を広げる\n3. 「高橋さんとお話しするの楽しいです」と素直に伝える\n\n3回目は指名化の黄金タイミング。自然体で接するのがベストです。" },
    ],
    feedback: null,
    created_at: "2026-03-17T22:00:00+09:00",
  },
  {
    id: "aichat4",
    cast_id: "cast_oneesan2",
    customer_id: "cust6",
    messages: [
      { role: "user", content: "VIPの佐藤さんが最近来店頻度が減っています。どうすればいいですか？" },
      { role: "assistant", content: "佐藤さんは大切なVIPのお客様ですね。来店頻度が減った原因を探ることが大切です。\n\n【アクション】\n1. まずは軽いトーンでLINEを送る（重たくならないように）\n2. 「最近お忙しいですか？」ではなく「先日○○の話をしていて佐藤さんを思い出しました」と自然に\n3. 新しいボトルの入荷情報や季節のイベント情報をさりげなく添える\n\nVIPのお客様には「来てください」より「あなたのことを考えていました」が効きます。" },
    ],
    feedback: "helpful",
    created_at: "2026-03-14T21:30:00+09:00",
  },
  {
    id: "aichat5",
    cast_id: "cast_help2",
    customer_id: null,
    messages: [
      { role: "user", content: "接客で緊張してうまく話せません。コツはありますか？" },
      { role: "assistant", content: "新人の頃は誰でも緊張するものよ。大丈夫、慣れていきます。\n\n【すぐ使えるコツ】\n1. お客様の話を「聞く」ことに集中する（話す比率は相手7:自分3が理想）\n2. 相槌のバリエーションを増やす（「そうなんですね！」「素敵ですね」「もっと聞きたいです」）\n3. 困ったら「お仕事は何をされているんですか？」で話題を広げる\n\n上手に話す必要はありません。「あなたの話に興味があります」という姿勢が一番大切です。" },
    ],
    feedback: "helpful",
    created_at: "2026-03-18T19:00:00+09:00",
  },
];
