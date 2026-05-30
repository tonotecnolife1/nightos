"use client";

import { Check, Wine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/nightos/button";
import { SelectInput } from "@/components/nightos/select";
import type { Customer } from "@/types/nightos";
import { createBottleAction } from "../actions";
import { BrandPicker } from "./brand-picker";
import { Stepper } from "./stepper";

interface Props {
  customers: Customer[];
  initialCustomerId?: string;
  /**
   * 登録成功後に遷移する先。指定がなければ店舗のボトル一覧へ。
   * キャストは /store/* にアクセスできない（role ガードでホームへ弾かれる）
   * ため、キャスト導線では顧客詳細など cast 配下のパスを渡す。
   */
  returnTo?: string;
}

export function BottleForm({ customers, initialCustomerId, returnTo }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [brand, setBrand] = useState("");
  const [customerId, setCustomerId] = useState(initialCustomerId ?? customers[0]?.id ?? "");
  const [remainingPct, setRemainingPct] = useState(100);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setBrand("");
    setRemainingPct(100);
  };

  const submit = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await createBottleAction({
        brand: brand.trim(),
        customer_id: customerId,
        total_glasses: remainingPct,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const cust = customers.find((c) => c.id === customerId);
      setSuccess(
        `${cust?.name ?? "お客様"}さんの${res.bottle.brand}（残 約${remainingPct}%）を登録しました`,
      );
      reset();
      // 登録後はホームではなく、呼び出し元（顧客詳細など）か店舗のボトル
      // 一覧へ遷移し、登録結果を確認できるようにする
      router.push(returnTo ?? "/store/bottles");
    });
  };

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <BrandPicker value={brand} onChange={setBrand} />

      <SelectInput
        label="オーナー（お客様）"
        name="customer_id"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        options={customers.map((c) => ({
          value: c.id,
          label: c.name,
        }))}
      />

      <Stepper
        label="残量（%）"
        value={remainingPct}
        min={0}
        max={100}
        step={10}
        unit="%"
        onChange={setRemainingPct}
      />
      <p className="text-[10px] text-ink-mute -mt-3">
        新ボトル = 100% / 半分 = 50% / 残りわずか = 10〜20%
      </p>

      <div className="text-label-sm text-ink-mute">
        キープ日: 今日（{new Date().toLocaleDateString("ja-JP")}）
      </div>

      {error && (
        <div className="rounded-card bg-wine/10 border border-wine/30 text-wine-deep text-body-sm px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-card bg-champagne-soft border border-gold/30 text-ink text-body-sm px-3 py-2">
          <Check size={16} className="text-gold-deep" />
          {success}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={pending || !brand.trim()}
      >
        <Wine size={16} />
        {pending ? "登録中…" : "ボトルを登録"}
      </Button>
    </form>
  );
}
