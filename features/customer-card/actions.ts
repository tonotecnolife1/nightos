"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCastId } from "@/lib/nightos/auth";
import {
  canEditCustomerDirectly,
  getCustomerRelationship,
} from "@/lib/nightos/customer-relationship";
import {
  deleteScreenshot,
  getCustomerContext,
  saveScreenshot,
  updateCastMemo,
  updateCustomer,
  type CastMemoInput,
} from "@/lib/nightos/supabase-queries";
import type {
  Customer,
  LineScreenshot,
  MemoExtractionResult,
} from "@/types/nightos";

export async function updateCastMemoAction(args: {
  customerId: string;
  input: CastMemoInput;
}) {
  const castId = await getCurrentCastId();
  const memo = await updateCastMemo({
    castId,
    customerId: args.customerId,
    input: args.input,
  });
  // Invalidate the customer card and home screens so updated values show up.
  revalidatePath(`/cast/customers/${args.customerId}`);
  revalidatePath("/cast/home");
  return { ok: true as const, memo };
}

export type MemoFieldKey = "last_topic" | "service_tips" | "next_topics";

/**
 * Apply selected fields from a vision-extracted memo update.
 *
 * Loads the current memo, replaces only the picked fields with the
 * extracted values, then saves both the updated memo and a record of
 * the screenshot in the history.
 */
export async function applyMemoUpdateAction(args: {
  customerId: string;
  imageData: string;
  mediaType: string;
  extraction: MemoExtractionResult;
  fieldsToApply: MemoFieldKey[];
}) {
  const castId = await getCurrentCastId();
  const context = await getCustomerContext(castId, args.customerId);
  const currentMemo = context?.memo;

  const pick = (key: MemoFieldKey, fallback: string | null) =>
    args.fieldsToApply.includes(key) ? args.extraction[key] : fallback;

  const input: CastMemoInput = {
    last_topic: pick("last_topic", currentMemo?.last_topic ?? null),
    service_tips: pick("service_tips", currentMemo?.service_tips ?? null),
    next_topics: pick("next_topics", currentMemo?.next_topics ?? null),
  };

  const memo = await updateCastMemo({
    castId,
    customerId: args.customerId,
    input,
  });

  // Record the screenshot in history regardless of which fields were applied,
  // so the cast can revisit it later.
  const screenshot: LineScreenshot = await saveScreenshot({
    customerId: args.customerId,
    castId,
    imageData: args.imageData,
    mediaType: args.mediaType,
    extracted: args.extraction,
    appliedFields: args.fieldsToApply,
  });

  revalidatePath(`/cast/customers/${args.customerId}`);
  revalidatePath("/cast/home");
  return { ok: true as const, memo, screenshot };
}

/**
 * キャスト編集可能な顧客プロフィール項目を一括更新する。
 *
 * 編集可能: name / name_kana / nickname / birthday / job / favorite_drink / region
 * 編集不可（保持）: category / store_memo / cast_id / その他システム項目
 *
 * store_memo は店舗からの共有情報なのでキャスト側からは触らない。
 */
export interface CustomerProfileEdit {
  name: string;
  name_kana: string | null;
  nickname: string | null;
  birthday: string | null;
  job: string | null;
  favorite_drink: string | null;
  region: string | null;
}

export async function updateCustomerProfileAction(args: {
  customerId: string;
  input: CustomerProfileEdit;
}): Promise<
  | { ok: true; customer: Customer | null }
  | { ok: false; error: string }
> {
  if (!args.input.name.trim()) {
    return { ok: false, error: "お名前は必須です" };
  }
  const castId = await getCurrentCastId();
  const context = await getCustomerContext(castId, args.customerId);
  if (!context) {
    return { ok: false, error: "顧客が見つかりません" };
  }
  const current = context.customer;

  // 関係性ガード: 共有プロフィールの直接編集はマスター/担当のみ。
  // ヘルプは「変更を提案」フロー（クライアント側）を使う想定。
  const relationship = getCustomerRelationship(current, castId);
  if (!canEditCustomerDirectly(relationship)) {
    return {
      ok: false,
      error: "このお客様の情報はマスター/担当のみ編集できます。「変更を提案」をご利用ください",
    };
  }

  const customer = await updateCustomer(args.customerId, {
    name: args.input.name.trim(),
    name_kana: args.input.name_kana?.trim() || null,
    nickname: args.input.nickname?.trim() || null,
    birthday: args.input.birthday,
    job: args.input.job?.trim() || null,
    favorite_drink: args.input.favorite_drink?.trim() || null,
    region: args.input.region?.trim() || null,
    // キャスト権限では触らない項目は現状値を維持
    category: current.category,
    store_memo: current.store_memo,
    cast_id: current.cast_id,
  });

  revalidatePath(`/cast/customers/${args.customerId}`);
  revalidatePath("/cast/home");
  revalidatePath("/cast/customers");
  return { ok: true, customer };
}

export async function deleteScreenshotAction(args: {
  id: string;
  customerId: string;
}) {
  await deleteScreenshot(args.id);
  revalidatePath(`/cast/customers/${args.customerId}`);
  return { ok: true as const };
}
