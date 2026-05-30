"use client";

import { Check, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/nightos/button";
import { BirthdayInput } from "@/components/nightos/birthday-input";
import { TextInput } from "@/components/nightos/input";
import { SelectInput } from "@/components/nightos/select";
import { TextAreaInput } from "@/components/nightos/textarea";
import {
  BusinessCardUpload,
  type ExtractedBusinessCard,
} from "@/features/customer-registration/components/business-card-upload";
import type { Cast, Customer, CustomerCategory } from "@/types/nightos";
import { deleteCustomerAction, updateCustomerAction } from "../actions";

interface Props {
  customer: Customer;
  casts: Cast[];
}

const CATEGORY_OPTIONS: { value: CustomerCategory; label: string }[] = [
  { value: "new", label: "新規" },
  { value: "regular", label: "常連" },
  { value: "vip", label: "VIP" },
];

export function EditCustomerForm({ customer, casts }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(customer.name);
  const [birthday, setBirthday] = useState(customer.birthday ?? "");
  const [job, setJob] = useState(customer.job ?? "");
  const [favoriteDrink, setFavoriteDrink] = useState(
    customer.favorite_drink ?? "",
  );
  const [category, setCategory] = useState<CustomerCategory>(customer.category);
  const [castId, setCastId] = useState(customer.cast_id);
  const [storeMemo, setStoreMemo] = useState(customer.store_memo ?? "");

  const submit = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await updateCustomerAction(customer.id, {
        name: name.trim(),
        birthday: birthday || null,
        job: job.trim() || null,
        favorite_drink: favoriteDrink.trim() || null,
        category,
        store_memo: storeMemo.trim() || null,
        cast_id: castId,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess("更新しました");
      setTimeout(() => setSuccess(null), 2500);
    });
  };

  const applyBusinessCard = (fields: ExtractedBusinessCard) => {
    if (fields.name) setName(fields.name);
    if (fields.job) setJob(fields.job);
    if (fields.store_memo) {
      setStoreMemo((prev) =>
        prev.trim() ? `${prev.trim()}\n${fields.store_memo}` : fields.store_memo ?? "",
      );
    }
  };

  const handleDelete = () => {
    if (
      !confirm(
        `${customer.name}さんを削除しますか？関連する来店履歴・ボトル・メモも全て削除されます。`,
      )
    )
      return;
    startTransition(async () => {
      await deleteCustomerAction(customer.id);
      router.push("/store/customers");
    });
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <BusinessCardUpload onApply={applyBusinessCard} mode="edit" />

      <TextInput
        label="お名前"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <BirthdayInput
        value={birthday}
        onChange={(v) => setBirthday(v)}
      />
      <TextInput
        label="職業"
        name="job"
        value={job}
        onChange={(e) => setJob(e.target.value)}
      />
      <TextInput
        label="好きなお酒"
        name="favorite_drink"
        value={favoriteDrink}
        onChange={(e) => setFavoriteDrink(e.target.value)}
      />
      <SelectInput
        label="顧客カテゴリ"
        name="category"
        value={category}
        onChange={(e) => setCategory(e.target.value as CustomerCategory)}
        options={CATEGORY_OPTIONS}
      />
      <SelectInput
        label="担当キャスト"
        name="cast_id"
        value={castId}
        onChange={(e) => setCastId(e.target.value)}
        options={casts.map((c) => ({ value: c.id, label: c.name }))}
      />
      <TextAreaInput
        label="気をつけること"
        name="store_memo"
        value={storeMemo}
        onChange={(e) => setStoreMemo(e.target.value)}
        placeholder="例: 息子さんの受験の話題はNG、仕事の愚痴は聞き流して"
        hint="全キャストと共有されます。接客前に必ず確認される項目です"
      />

      {error && (
        <div className="rounded-btn bg-wine/10 border border-wine/30 text-wine-deep text-body-sm px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-btn bg-champagne border border-champagne-dark text-ink text-body-sm px-3 py-2">
          <Check size={16} className="text-wine-deep" />
          {success}
        </div>
      )}

      <Button type="submit" variant="primary" fullWidth size="lg" disabled={pending}>
        <Save size={16} />
        {pending ? "保存中…" : "変更を保存"}
      </Button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="w-full flex items-center justify-center gap-1.5 h-10 mt-2 rounded-btn text-wine-deep border border-wine/30 hover:bg-wine/10 disabled:opacity-50"
      >
        <Trash2 size={14} />
        この顧客を削除
      </button>
    </form>
  );
}
