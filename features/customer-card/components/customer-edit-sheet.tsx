"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { BirthdayInput } from "@/components/nightos/birthday-input";
import { TextInput } from "@/components/nightos/input";
import { ALL_PREFECTURES } from "@/lib/nightos/regions";
import type { Customer } from "@/types/nightos";
import { updateCustomerProfileAction } from "../actions";

interface Props {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 顧客プロフィール一括編集シート（ライトテーマ・モバイル）。
 *
 * 編集可能項目:
 *  - 氏名(フルネーム)・呼び名(入力推奨)・誕生日・職業・好きなお酒・活動エリア
 *
 * 編集不可（このシートには出さない）項目:
 *  - 店舗からの共有情報(store_memo) / カテゴリ / ファネル / 担当キャスト
 */
export function CustomerEditSheet({ customer, isOpen, onClose }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(customer.name);
  const [nickname, setNickname] = useState(customer.nickname ?? "");
  const [birthday, setBirthday] = useState(customer.birthday ?? "");
  const [job, setJob] = useState(customer.job ?? "");
  const [favoriteDrink, setFavoriteDrink] = useState(
    customer.favorite_drink ?? "",
  );
  const [region, setRegion] = useState(customer.region ?? "");

  // シートを開き直した時に最新値で再初期化
  useEffect(() => {
    if (isOpen) {
      setName(customer.name);
      setNickname(customer.nickname ?? "");
      setBirthday(customer.birthday ?? "");
      setJob(customer.job ?? "");
      setFavoriteDrink(customer.favorite_drink ?? "");
      setRegion(customer.region ?? "");
      setError(null);
    }
  }, [isOpen, customer]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateCustomerProfileAction({
        customerId: customer.id,
        input: {
          name,
          nickname: nickname || null,
          birthday: birthday || null,
          job: job || null,
          favorite_drink: favoriteDrink || null,
          region: region || null,
        },
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-ink/40 animate-fade-overlay"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute bottom-0 left-0 right-0 max-h-[88dvh] overflow-y-auto rounded-t-[28px] bg-white shadow-warm animate-slide-up">
        <div className="sticky top-0 z-10 flex items-start justify-between bg-white border-b border-ink/[0.06] px-5 pb-3 pt-5">
          <div>
            <h2 className="font-display text-[20px] leading-tight font-medium text-ink">
              顧客情報を編集
            </h2>
            <p className="text-[11px] text-ink-muted mt-0.5">
              呼び名は入力推奨 ・ 店舗からの共有情報はここでは編集できません
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="w-8 h-8 rounded-full border border-ink/[0.08] bg-pearl-warm flex items-center justify-center text-ink-secondary hover:bg-pearl-soft"
          >
            <X size={14} />
          </button>
        </div>

        <form
          className="px-5 pt-4 pb-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {/* 呼び名 — 入力推奨 (ピンク破線) */}
          <div className="space-y-1.5">
            <label className="text-label-md text-ink font-medium flex items-center gap-2">
              呼び名
              <span className="text-[10px] px-1.5 py-0.5 rounded-badge bg-wine-soft/30 text-wine-deep font-medium">
                入力推奨
              </span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例: たっちゃん"
              style={{ fontSize: "16px" }}
              className="w-full h-11 rounded-2xl border-[1.5px] border-dashed border-wine-deep/40 bg-wine-soft/20 px-3 text-body-md text-ink outline-none focus:border-wine-deep"
            />
            <p className="text-[10px] text-ink-muted pl-1">
              接客中の呼びかけに使います
            </p>
          </div>

          {/* 編集可能項目 */}
          <TextInput
            label="お名前（フルネーム）"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 田中 太郎"
            required
          />

          <BirthdayInput value={birthday} onChange={(v) => setBirthday(v)} />

          <TextInput
            label="職業"
            name="job"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            placeholder="例: IT企業経営"
          />

          <TextInput
            label="好きなお酒"
            name="favorite_drink"
            value={favoriteDrink}
            onChange={(e) => setFavoriteDrink(e.target.value)}
            placeholder="例: 山崎12年ロック"
          />

          <div className="space-y-1.5">
            <label className="text-label-md text-ink font-medium">活動エリア</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink"
              style={{ fontSize: "16px" }}
            >
              <option value="">未設定</option>
              {ALL_PREFECTURES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-2xl bg-wine/10 border border-wine/25 text-wine-deep text-body-sm px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="flex-1 h-11 rounded-pill border border-ink/[0.10] bg-pearl-soft text-body-sm text-ink-secondary hover:bg-pearl"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={pending || !name.trim()}
              className="flex-1 h-11 rounded-pill bg-rose-gold-metallic text-ink font-medium shadow-float disabled:opacity-60 active:translate-y-[1px] transition"
            >
              <Check size={14} className="inline mr-1" />
              {pending ? "保存中…" : "保存する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
