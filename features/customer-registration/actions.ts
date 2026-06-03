"use server";

import { revalidatePath } from "next/cache";
import {
  createCustomer,
  type CreateCustomerInput,
} from "@/lib/nightos/supabase-queries";

export async function createCustomerAction(input: CreateCustomerInput) {
  if (!input.name.trim() || !input.cast_id) {
    return { ok: false as const, error: "名前と担当キャストは必須です" };
  }
  let customer;
  try {
    customer = await createCustomer(input);
  } catch (err) {
    // DB保存に失敗した場合は「登録できなかった」ことを明示する。
    // ここで握りつぶすと、保存されていないのに成功表示になり
    // 一覧・重複チェックから見えなくなる。
    console.error("[createCustomerAction] failed:", err);
    return {
      ok: false as const,
      error: "登録に失敗しました。通信状況を確認してもう一度お試しください。",
    };
  }
  revalidatePath("/store");
  revalidatePath("/store/dashboard");
  revalidatePath("/cast/home");
  revalidatePath("/cast/customers");
  return { ok: true as const, customer };
}
