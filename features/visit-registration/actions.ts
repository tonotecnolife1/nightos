"use server";

import { revalidatePath } from "next/cache";
import {
  createVisit,
  type CreateVisitInput,
} from "@/lib/nightos/supabase-queries";

export async function createVisitAction(input: CreateVisitInput) {
  if (!input.customer_id || !input.cast_id) {
    return { ok: false as const, error: "顧客と担当キャストを選んでください" };
  }
  if (input.sales_amount != null && input.sales_amount < 0) {
    return { ok: false as const, error: "金額は0以上で入力してください" };
  }
  const visit = await createVisit(input);
  revalidatePath("/store");
  revalidatePath("/store/dashboard");
  revalidatePath("/cast/home");
  // 売上・成績ページにも即時反映させる
  revalidatePath("/cast/stats");
  revalidatePath("/mama/stats");
  return { ok: true as const, visit };
}
