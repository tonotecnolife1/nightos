import {
  getCustomerContext,
  getRecentVisitsForCast,
  getUnreadCastMessages,
} from "@/lib/nightos/supabase-queries";

/**
 * 通知のひとまとまり。メニューのバッジ件数 (count) と、通知一覧ページ
 * (/cast/notifications) の本文 (messages / visits) の単一のデータソース。
 *
 * 通知は 2 種類:
 *  - 店舗からの連絡 (未読の store → cast メッセージ)
 *  - 新しい来店 (直近 RECENT_VISIT_WINDOW_MS 以内に担当客が来店)
 *
 * 来店の「既読」状態はトースト用に各端末の localStorage で持っているが、
 * サーバ側バッジ / 一覧では「直近 1 営業夜ぶんの来店」を新着とみなす。
 */

/** 「新しい来店」とみなす時間窓 = 直近 24 時間 (1 営業夜)。 */
const RECENT_VISIT_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface NotificationMessage {
  id: string;
  message: string;
  sentAt: string;
}

export interface NotificationVisit {
  id: string;
  customerId: string;
  customerName: string;
  isNominated: boolean;
  tableName: string | null;
  visitedAt: string;
}

export interface CastNotifications {
  messages: NotificationMessage[];
  visits: NotificationVisit[];
  /** バッジに出す未読件数 = messages + visits。 */
  count: number;
}

export async function getCastNotifications(
  castId: string,
): Promise<CastNotifications> {
  const sinceIso = new Date(Date.now() - RECENT_VISIT_WINDOW_MS).toISOString();

  const [rawMessages, rawVisits] = await Promise.all([
    getUnreadCastMessages(castId),
    getRecentVisitsForCast(castId, sinceIso),
  ]);

  // 来店通知は顧客名を引いてから返す (一覧で「{name}さま」を出すため)。
  const visits: NotificationVisit[] = await Promise.all(
    rawVisits.map(async (v) => {
      const ctx = await getCustomerContext(castId, v.customer_id);
      return {
        id: v.id,
        customerId: v.customer_id,
        customerName: ctx?.customer.name ?? "（不明）",
        isNominated: v.is_nominated,
        tableName: v.table_name,
        visitedAt: v.visited_at,
      };
    }),
  );

  const messages: NotificationMessage[] = rawMessages.map((m) => ({
    id: m.id,
    message: m.message,
    sentAt: m.sent_at,
  }));

  return {
    messages,
    visits,
    count: messages.length + visits.length,
  };
}
