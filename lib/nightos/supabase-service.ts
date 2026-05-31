// ─────────────────────────────────────────────────────────────
// 店舗スコープの「固定情報」参照クエリ（サービスロール）。
//
// これらは RLS をバイパスするサービスロールクライアントを使うため、
// 必ず store_id で明示的にスコープする。unstable_cache の内側から
// 呼ばれることを想定しており、cookie 等のリクエスト状態には触れない。
// 店舗ごとに変わるが更新頻度の低い「固定情報」専用。
// ─────────────────────────────────────────────────────────────
import type { Cast } from "@/types/nightos";
import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { rowToCast } from "./supabase-real";

/** 指定店舗の在籍キャスト一覧。RLS 版 getAllCastsReal と同じ並び・形。 */
export async function getAllCastsForStoreService(
  storeId: string,
): Promise<Cast[]> {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("nightos_casts")
    .select("*")
    .eq("store_id", storeId)
    .order("name");
  if (error) throw error;
  return (data ?? []).map(rowToCast);
}

/** 指定店舗の業態。 */
export async function getVenueTypeForStoreService(
  storeId: string,
): Promise<"club" | "cabaret"> {
  const supabase = createServiceSupabaseClient();
  const { data } = await supabase
    .from("nightos_stores")
    .select("venue_type")
    .eq("id", storeId)
    .maybeSingle();
  const vt = (data as any)?.venue_type;
  return vt === "club" || vt === "cabaret" ? vt : "club";
}
