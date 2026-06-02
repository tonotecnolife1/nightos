"use client";

import {
  AlertCircle,
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Crown,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/nightos/button";
import { BirthdayInput } from "@/components/nightos/birthday-input";
import { TextInput } from "@/components/nightos/input";
import { TextAreaInput } from "@/components/nightos/textarea";
import { inferManagerCastId } from "@/lib/nightos/manager-assignment";
import { useAutoKana } from "@/lib/nightos/use-auto-kana";
import type { Cast, Customer, CustomerCategory } from "@/types/nightos";
import { createCustomerAction } from "../actions";
import {
  findDuplicateCandidates,
  type DuplicateCandidate,
} from "../lib/duplicate-candidates";
import {
  BusinessCardUpload,
  type ExtractedBusinessCard,
} from "./business-card-upload";

interface Props {
  casts: Cast[];
  existingCustomers?: Customer[];
  /** 重複登録チェック用の店舗全顧客インデックス（最小情報） */
  duplicateIndex?: DuplicateCandidate[];
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

// 紹介者は必須入力。ただし「紹介なし（直接来店・その他）」も明示的に選べる有効な選択肢。
// 未選択（プレースホルダ）のままでは登録不可とするため、"紹介なし" には専用の番兵値を使う。
const NO_REFERRER = "__none__";

// ネイティブ <option> はスタイル指定がないと小さく描画される端末がある。
// 開いたときのリストでも読めるよう、明示的に文字サイズ・配色・余白を与える。
const OPTION_STYLE: React.CSSProperties = {
  fontSize: "16px",
  padding: "10px 12px",
  color: "#2b232a",
  backgroundColor: "#fdfcf9",
};

export function CustomerForm({
  casts,
  existingCustomers = [],
  duplicateIndex = [],
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
  const [nameKana, setNameKana] = useState("");
  const [nickname, setNickname] = useState("");

  // 氏名の IME 変換前かなから読み仮名を自動採取（新規なので初期は未編集）。
  const autoKana = useAutoKana({ setKana: setNameKana });
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
    setNameKana("");
    setNickname("");
    setBirthday("");
    setCategory("new");
    setCastId(defaultCastId);
    setStoreMemo("");
    setReferrerId(initialReferrerId ?? "");
    setManagerId(inferManagerCastId(defaultCastId, casts) ?? "");
    setShowOptional(false);
  };

  const applyBusinessCard = (fields: ExtractedBusinessCard) => {
    if (fields.name) setName(fields.name);
    if (fields.name_kana) {
      setNameKana(fields.name_kana);
      autoKana.markKanaEdited(); // 名刺の読みを氏名入力で上書きしない
    }
    if (fields.store_memo) {
      setStoreMemo((prev) =>
        prev.trim() ? `${prev.trim()}\n${fields.store_memo}` : fields.store_memo ?? "",
      );
    }
  };

  const submit = () => {
    setError(null);
    setSuccess(null);
    if (!referrerId) {
      setError("どなたのご紹介かを選択してください（紹介なしの場合は「紹介なし」を選択）。");
      return;
    }
    startTransition(async () => {
      const res = await createCustomerAction({
        name: name.trim(),
        name_kana: nameKana.trim() || null,
        nickname: nickname.trim() || null,
        birthday: birthday || null,
        job: null,
        favorite_drink: null,
        category,
        store_memo: storeMemo.trim() || null,
        cast_id: castId,
        referred_by_customer_id:
          referrerId && referrerId !== NO_REFERRER ? referrerId : null,
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

  // 重複登録防止: 入力中の氏名/読み/呼び名から既存顧客の候補を探す
  const duplicateCandidates = useMemo(
    () =>
      findDuplicateCandidates(duplicateIndex, {
        name: name.trim(),
        nameKana: nameKana.trim(),
        nickname: nickname.trim(),
      }),
    [duplicateIndex, name, nameKana, nickname],
  );

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

      {/* お名前（必須）— フルネーム */}
      <TextInput
        label="お名前（フルネーム）"
        name="name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          autoKana.onNameChange(e.target.value);
        }}
        {...autoKana.bind}
        placeholder="例: 田中 太郎"
        required
      />

      {/* 読み仮名（任意・検索の予測に使用。氏名入力中に自動補完） */}
      <TextInput
        label="読み仮名（ひらがな）"
        name="name_kana"
        value={nameKana}
        onChange={(e) => {
          setNameKana(e.target.value);
          autoKana.markKanaEdited();
        }}
        placeholder="例: たなか たろう"
        hint="氏名の入力中に自動で補完されます。ひらがな検索に使われます"
      />

      {/* 呼び名（入力推奨） */}
      <div className="space-y-1.5">
        <label className="text-label-md text-ink font-medium flex items-center gap-2">
          呼び名
          <span className="text-[10px] px-1.5 py-0.5 rounded-badge bg-wine-soft/30 text-wine-deep font-medium">
            入力推奨
          </span>
        </label>
        <input
          type="text"
          name="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="例: 社長・たっちゃん"
          style={{ fontSize: "16px" }}
          className="w-full h-11 rounded-2xl border-[1.5px] border-dashed border-wine-deep/40 bg-wine-soft/20 px-3 text-body-md text-ink outline-none focus:border-wine-deep"
        />
        <p className="text-[10px] text-ink-muted pl-1">
          フルネームの横に表示され、検索でもヒットします（接客中の呼びかけにも）
        </p>
      </div>

      {/* 重複登録防止: 同名の既存顧客候補 */}
      {duplicateCandidates.length > 0 && (
        <div className="rounded-2xl bg-warning/10 border border-warning/30 px-3 py-2.5 space-y-2">
          <div className="flex items-center gap-1.5 text-warning">
            <AlertCircle size={14} />
            <p className="text-label-sm font-semibold">
              同じお名前のお客様がいます
            </p>
          </div>
          <p className="text-[11px] text-ink-soft">
            既に登録済みなら、新規作成せずにそのお客様のカルテをご利用ください。
          </p>
          <ul className="space-y-1">
            {duplicateCandidates.map((cand) => (
              <li key={cand.id}>
                <Link
                  href={`/cast/customers/${cand.id}`}
                  className="flex items-center gap-2 rounded-xl bg-white/70 border border-ink/[0.06] px-3 py-2 hover:border-warning/40 transition"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-body-sm font-medium text-ink">
                      {cand.name}さま
                    </span>
                    {cand.masterName && (
                      <span className="text-[10px] text-ink-mute ml-1.5">
                        （{cand.masterName}管理）
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-warning font-medium shrink-0">
                    このお客様
                  </span>
                  <ChevronRight size={13} className="text-ink-mute shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-ink-muted">
            別の方であれば、そのまま下の「{submitLabel ?? "登録する"}」で新規登録できます。
          </p>
        </div>
      )}

      {/* 担当 */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Crown size={13} className="text-gold-deep" />
          <label className="text-label-md text-ink font-medium">担当</label>
        </div>
        <select
          value={castId}
          onChange={(e) => setCastId(e.target.value)}
          className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink"
          style={{ fontSize: "16px" }}
        >
          {casts.map((c) => (
            <option key={c.id} value={c.id} style={OPTION_STYLE}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* ヘルプ */}
      <div className="space-y-1.5">
        <label className="text-label-md text-ink font-medium">ヘルプ</label>
        <select
          value={managerId}
          onChange={(e) => setManagerId(e.target.value)}
          className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink"
          style={{ fontSize: "16px" }}
        >
          {casts.map((c) => (
            <option key={c.id} value={c.id} style={OPTION_STYLE}>{c.name}</option>
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
                  ? "border-wine-deep/70 bg-champagne-soft/40 text-wine-deep"
                  : "border-ink/[0.08] bg-pearl-light text-ink-soft hover:border-gold/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 紹介者（必須）— 「紹介なし」も明示的に選べる有効な選択肢 */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Users size={13} className="text-gold-deep" />
          <label className="text-label-md text-ink font-medium">
            どなたのご紹介？
          </label>
          <span className="text-[10px] px-1.5 py-0.5 rounded-badge bg-wine-deep text-pearl-light font-medium">
            必須
          </span>
        </div>
        <select
          value={referrerId}
          onChange={(e) => setReferrerId(e.target.value)}
          required
          className={`w-full h-11 rounded-2xl border bg-pearl-warm px-3 text-body-md text-ink ${
            referrerId ? "border-ink/[0.06]" : "border-wine-deep/40"
          }`}
          style={{ fontSize: "16px" }}
        >
          <option value="" disabled style={OPTION_STYLE}>
            選択してください
          </option>
          <option value={NO_REFERRER} style={OPTION_STYLE}>
            紹介なし（直接来店・その他）
          </option>
          {referrerOptions.map((r) => (
            <option key={r.value} value={r.value} style={OPTION_STYLE}>
              {r.label}さま
            </option>
          ))}
        </select>
        <p className="text-[10px] text-ink-muted pl-1">
          紹介経由でない場合は「紹介なし」を選んでください
        </p>
      </div>

      {/* AI補完ヒント */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-2xl bg-success/5 border border-success/20">
        <Bot size={14} className="text-success mt-0.5 shrink-0" />
        <p className="text-[11px] text-ink-soft leading-relaxed">
          職業・好みのお酒・話題などはルリママとのチャットから自動で補完されます。
        </p>
      </div>

      {/* 追加情報（折りたたみ） */}
      <button
        type="button"
        onClick={() => setShowOptional((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl border border-ink/[0.06] bg-pearl-soft text-body-sm text-ink-soft hover:bg-pearl-warm transition"
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

      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="lg"
        disabled={pending || !name.trim() || !referrerId}
      >
        {pending ? "登録中…" : submitLabel ?? "登録する"}
      </Button>
    </form>
  );
}
