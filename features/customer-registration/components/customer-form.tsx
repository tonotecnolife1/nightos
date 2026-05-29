"use client";

import { Bot, Check, ChevronDown, ChevronUp, Crown, Users } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/nightos/button";
import { BirthdayInput } from "@/components/nightos/birthday-input";
import { TextInput } from "@/components/nightos/input";
import { TextAreaInput } from "@/components/nightos/textarea";
import { inferManagerCastId } from "@/lib/nightos/manager-assignment";
import type { Cast, Customer, CustomerCategory } from "@/types/nightos";
import { createCustomerAction } from "../actions";
import {
  BusinessCardUpload,
  type ExtractedBusinessCard,
} from "./business-card-upload";

interface Props {
  casts: Cast[];
  existingCustomers?: Customer[];
  initialReferrerId?: string;
  lockedCastId?: string;
  submitLabel?: string;
  successTemplate?: string;
}

const CATEGORY_OPTIONS: { value: CustomerCategory; label: string }[] = [
  { value: "new", label: "新規" },
  { value: "regular", label: "常連" },
  { value: "vip", label: "VIP" },
];

export function CustomerForm({
  casts,
  existingCustomers = [],
  initialReferrerId,
  lockedCastId,
  submitLabel,
  successTemplate,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOptional, setShowOptional] = useState(false);

  const defaultCastId = lockedCastId ?? casts[0]?.id ?? "";

  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [category, setCategory] = useState<CustomerCategory>("new");
  const [castId, setCastId] = useState(defaultCastId);
  const [storeMemo, setStoreMemo] = useState("");
  const [referrerId, setReferrerId] = useState<string>(initialReferrerId ?? "");

  const [managerId, setManagerId] = useState<string>(() =>
    inferManagerCastId(defaultCastId, casts) ?? "",
  );

  useEffect(() => {
    const inferred = inferManagerCastId(castId, casts);
    if (inferred !== null) setManagerId(inferred);
  }, [castId, casts]);

  const reset = () => {
    setName("");
    setBirthday("");
    setCategory("new");
    setCastId(defaultCastId);
    setStoreMemo("");
    setReferrerId("");
    setManagerId(inferManagerCastId(defaultCastId, casts) ?? "");
    setShowOptional(false);
  };

  const applyBusinessCard = (fields: ExtractedBusinessCard) => {
    if (fields.name) setName(fields.name);
    if (fields.store_memo) {
      setStoreMemo((prev) =>
        prev.trim() ? `${prev.trim()}\n${fields.store_memo}` : fields.store_memo ?? "",
      );
    }
  };

  const submit = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await createCustomerAction({
        name: name.trim(),
        birthday: birthday || null,
        job: null,
        favorite_drink: null,
        category,
        store_memo: storeMemo.trim() || null,
        cast_id: castId,
        referred_by_customer_id: referrerId || null,
        funnel_stage: lockedCastId ? "assigned" : "store_only",
        manager_cast_id: managerId || null,
        region: null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const template =
        successTemplate ?? "%name%さまを登録しました。";
      setSuccess(template.replace("%name%", res.customer.name));
      reset();
      setTimeout(() => setSuccess(null), 3500);
    });
  };

  const referrerOptions = existingCustomers.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {/* 名刺スキャン */}
      <BusinessCardUpload onApply={applyBusinessCard} mode="new" />

      {/* お名前（必須） */}
      <TextInput
        label="お名前"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="例: 田中 太郎"
        required
      />

      {/* 担当キャスト */}
      <div className="space-y-1.5">
        <label className="text-label-md text-ink font-medium">担当キャスト</label>
        <select
          value={castId}
          onChange={(e) => setCastId(e.target.value)}
          className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink"
          style={{ fontSize: "16px" }}
        >
          {casts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* 管理者 */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Crown size={13} className="text-gold-deep" />
          <label className="text-label-md text-ink font-medium">管理者</label>
        </div>
        <select
          value={managerId}
          onChange={(e) => setManagerId(e.target.value)}
          className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink"
          style={{ fontSize: "16px" }}
        >
          {casts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* 顧客カテゴリ */}
      <div className="space-y-1.5">
        <label className="text-label-md text-ink font-medium">カテゴリ</label>
        <div className="flex gap-2">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategory(opt.value)}
              className={`flex-1 h-10 rounded-pill border text-body-sm font-medium tracking-[0.04em] transition-all ${
                category === opt.value
                  ? "border-roseGold-deep/70 bg-roseGold-soft/40 text-roseGold-deep"
                  : "border-ink/[0.08] bg-pearl-light text-ink-soft hover:border-roseGold/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI補完ヒント */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-2xl bg-emerald/5 border border-emerald/20">
        <Bot size={14} className="text-emerald mt-0.5 shrink-0" />
        <p className="text-[11px] text-ink-secondary leading-relaxed">
          職業・好みのお酒・話題などはルリママとのチャットから自動で補完されます。
        </p>
      </div>

      {/* 追加情報（折りたたみ） */}
      <button
        type="button"
        onClick={() => setShowOptional((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl border border-ink/[0.06] bg-pearl-soft text-body-sm text-ink-secondary hover:bg-pearl-warm transition"
      >
        <span>{showOptional ? "追加情報を閉じる" : "追加情報を入力する（任意）"}</span>
        {showOptional ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {showOptional && (
        <div className="space-y-4 pt-1">
          <BirthdayInput
            value={birthday}
            onChange={(v) => setBirthday(v)}
          />

          {/* 紹介元 */}
          {referrerOptions.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-gold-deep" />
                <label className="text-label-md text-ink font-medium">どなたのご紹介？</label>
              </div>
              <select
                value={referrerId}
                onChange={(e) => setReferrerId(e.target.value)}
                className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink"
                style={{ fontSize: "16px" }}
              >
                <option value="">紹介なし</option>
                {referrerOptions.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}さま</option>
                ))}
              </select>
            </div>
          )}

          {/* 気をつけること */}
          <TextAreaInput
            label="気をつけること（任意）"
            name="store_memo"
            value={storeMemo}
            onChange={(e) => setStoreMemo(e.target.value)}
            placeholder="例: 息子さんの受験の話題はNG、仕事の愚痴は聞き流して"
            hint="全キャストと共有されます。接客前に必ず確認される項目です"
          />
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-[#c2575b]/5 border border-[#c2575b]/30 text-[#c2575b] text-body-sm px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-2xl bg-champagne-soft border border-champagne-dark text-ink text-body-sm px-3 py-2">
          <Check size={16} className="text-gold-deep" />
          {success}
        </div>
      )}

      <Button type="submit" variant="primary" fullWidth size="lg" disabled={pending || !name.trim()}>
        {pending ? "登録中…" : submitLabel ?? "登録する"}
      </Button>
    </form>
  );
}
