"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Search, UserPlus, Users, X } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { cn } from "@/lib/utils";
import {
  addReferrerChangeRequest,
  listPendingReferrerRequestsForCustomer,
  loadReferrerOverrides,
  resolveReferrerRequest,
  type ReferrerChangeRequest,
} from "@/features/customer-management/lib/referrer-change-store";

export interface ReferrerCandidate {
  id: string;
  name: string;
  /** 紹介者の担当（承認者の解決に使う）。manager 優先 → 担当 → null。 */
  managerCastId: string | null;
}

interface Props {
  customerId: string;
  customerName: string;
  /** 登録時に設定された紹介者ID（mock 由来）。override が無ければこれを使う。 */
  initialReferrerId: string | null;
  /** 紹介者候補（自分自身を除く店舗の全顧客）。 */
  candidates: ReferrerCandidate[];
  allCasts: { id: string; name: string }[];
  currentCastId: string;
  currentCastName: string;
}

const NO_REFERRER = "__none__";

/**
 * カルテ上の「紹介者」表示 + 変更フロー。
 * 変更は紹介者側の担当キャストの承認が必須なので、選択 → 承認申請 → 承認で反映。
 */
export function ReferrerSection({
  customerId,
  customerName,
  initialReferrerId,
  candidates,
  allCasts,
  currentCastId,
  currentCastName,
}: Props) {
  const router = useRouter();
  const [override, setOverride] = useState<string | null | undefined>(undefined);
  const [pending, setPending] = useState<ReferrerChangeRequest | null>(null);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [reason, setReason] = useState("");
  const [query, setQuery] = useState("");
  const [justSent, setJustSent] = useState(false);

  const refresh = () => {
    const overrides = loadReferrerOverrides();
    if (customerId in overrides) setOverride(overrides[customerId]);
    const reqs = listPendingReferrerRequestsForCustomer(customerId);
    setPending(reqs[0] ?? null);
  };

  useEffect(() => {
    refresh();
    // customerId 変更時のみ再読込
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const candidateMap = useMemo(() => {
    const m = new Map<string, ReferrerCandidate>();
    for (const c of candidates) m.set(c.id, c);
    return m;
  }, [candidates]);

  // 検索クエリで絞り込んだ候補
  const filteredCandidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter((c) => c.name.toLowerCase().includes(q));
  }, [candidates, query]);

  // 現在有効な紹介者ID（override 優先）
  const effectiveReferrerId =
    override !== undefined ? override : initialReferrerId;
  const currentReferrer = effectiveReferrerId
    ? candidateMap.get(effectiveReferrerId)
    : null;

  const castName = (id: string | null) =>
    id ? allCasts.find((c) => c.id === id)?.name ?? null : null;

  // 承認者: 変更先の紹介者の担当を優先、無ければ変更元、どちらも不在ならオーナー(null)
  const resolveApprover = (
    toId: string | null,
    fromId: string | null,
  ): string | null => {
    const to = toId ? candidateMap.get(toId)?.managerCastId ?? null : null;
    if (to) return to;
    const from = fromId ? candidateMap.get(fromId)?.managerCastId ?? null : null;
    return from;
  };

  const submit = () => {
    const toId = selected === NO_REFERRER ? null : selected || null;
    const fromId = effectiveReferrerId ?? null;
    if (toId === fromId) return;
    const approverCastId = resolveApprover(toId, fromId);
    addReferrerChangeRequest({
      customerId,
      customerName,
      fromReferrerId: fromId,
      fromReferrerName: fromId ? candidateMap.get(fromId)?.name ?? null : null,
      toReferrerId: toId,
      toReferrerName: toId ? candidateMap.get(toId)?.name ?? null : null,
      requestedByCastId: currentCastId,
      requestedByName: currentCastName,
      approverCastId,
      approverName: castName(approverCastId),
      reason: reason.trim() || null,
    });
    // NOTE: 実運用ではここで紹介者の担当へチャット通知（sendCastRequest）を送る。
    setJustSent(true);
    setEditing(false);
    setSelected("");
    setReason("");
    setQuery("");
    refresh();
    setTimeout(() => setJustSent(false), 2500);
  };

  const resolve = (resolution: "approve" | "reject") => {
    if (!pending) return;
    resolveReferrerRequest(pending.id, resolution, currentCastName);
    refresh();
    router.refresh();
  };

  // 自分が承認者か（紹介者の担当 or オーナーフォールバック）
  const iAmApprover =
    !!pending &&
    (pending.approverCastId === currentCastId ||
      pending.approverCastId === null);

  return (
    <section className="space-y-2">
      <Card className="px-3 py-2.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* ラベル + 現在の紹介者を 1 行に圧縮（重要度低めの補助情報） */}
          <div className="flex items-center gap-1.5 min-w-0">
            <Users size={12} className="text-gold-deep shrink-0" />
            <span className="text-[11px] font-medium text-ink-secondary shrink-0">
              紹介者
            </span>
            {!editing && (
              <span className="text-[12px] text-ink-soft truncate min-w-0">
                {currentReferrer ? (
                  <span className="text-ink">{currentReferrer.name}さま</span>
                ) : (
                  <span className="text-ink-mute">紹介なし（直接来店・その他）</span>
                )}
              </span>
            )}
          </div>
          {!pending && !editing && (
            <button
              type="button"
              onClick={() => {
                setSelected(effectiveReferrerId ?? NO_REFERRER);
                setQuery("");
                setEditing(true);
              }}
              className="inline-flex items-center gap-1 h-6 px-2 rounded-pill border border-ink/[0.10] bg-pearl-warm text-[10px] text-ink-secondary hover:border-gold/40 hover:text-ink transition shrink-0"
            >
              <UserPlus size={10} />
              変更
            </button>
          )}
        </div>

        {/* 送信直後フィードバック */}
        {justSent && (
          <div className="flex items-start gap-1.5 rounded-xl bg-warning/10 border border-warning/30 px-3 py-2">
            <Clock size={13} className="text-warning shrink-0 mt-0.5" />
            <p className="text-[11px] text-ink-soft leading-relaxed">
              紹介者の担当へ変更依頼を送信しました。承認されると反映されます。
            </p>
          </div>
        )}

        {/* 承認待ちバッジ */}
        {pending && !justSent && (
          <div className="space-y-2 rounded-xl bg-warning/10 border border-warning/30 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-warning">
              <Clock size={12} />
              <span className="text-[11px] font-semibold">変更を承認待ち</span>
            </div>
            <p className="text-[12px] text-ink">
              <span className="text-ink-mute line-through">
                {pending.fromReferrerName
                  ? `${pending.fromReferrerName}さま`
                  : "紹介なし"}
              </span>
              <span className="mx-1.5">→</span>
              <span className="font-medium text-wine-deep">
                {pending.toReferrerName
                  ? `${pending.toReferrerName}さま`
                  : "紹介なし"}
              </span>
            </p>
            {pending.reason && (
              <p className="text-[11px] text-ink-soft bg-pearl-soft rounded-lg px-2 py-1">
                理由: {pending.reason}
              </p>
            )}
            {iAmApprover ? (
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => resolve("reject")}
                  className="flex-1 h-9 rounded-pill border border-ink/[0.10] bg-pearl-soft text-body-sm text-ink-secondary hover:bg-pearl"
                >
                  <X size={13} className="inline mr-1" />
                  却下
                </button>
                <button
                  type="button"
                  onClick={() => resolve("approve")}
                  className="flex-1 h-9 rounded-pill bg-wine-deep text-pearl-light text-body-sm font-medium shadow-warm active:translate-y-[1px] transition"
                >
                  <Check size={13} className="inline mr-1" />
                  承認して反映
                </button>
              </div>
            ) : (
              <p className="text-[10px] text-ink-mute">
                {pending.approverName
                  ? `${pending.approverName}さんの承認待ちです`
                  : "店舗オーナーの承認待ちです"}
              </p>
            )}
          </div>
        )}

        {/* 変更フォーム */}
        {editing && (
          <div className="space-y-2.5 pt-0.5">
            {/* 検索付き紹介者ピッカー（候補が多くても探しやすいよう検索を用意） */}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="紹介者を名前で検索"
                className="w-full h-10 rounded-btn border border-pearl-soft bg-pearl-warm pl-9 pr-3 text-ink placeholder:text-ink-mute"
                style={{ fontSize: "16px" }}
              />
            </div>
            <div className="max-h-56 overflow-y-auto rounded-btn border border-pearl-soft bg-pearl-warm divide-y divide-pearl-soft/60">
              <button
                type="button"
                onClick={() => setSelected(NO_REFERRER)}
                className={cn(
                  "flex items-center justify-between gap-2 w-full px-3 py-2.5 text-left text-[15px] transition",
                  selected === NO_REFERRER
                    ? "bg-wine-deep/[0.06] text-wine-deep font-medium"
                    : "text-ink hover:bg-pearl-soft/50",
                )}
              >
                紹介なし（直接来店・その他）
                {selected === NO_REFERRER && (
                  <Check size={16} className="text-wine-deep shrink-0" />
                )}
              </button>
              {filteredCandidates.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelected(c.id)}
                  className={cn(
                    "flex items-center justify-between gap-2 w-full px-3 py-2.5 text-left text-[15px] transition",
                    selected === c.id
                      ? "bg-wine-deep/[0.06] text-wine-deep font-medium"
                      : "text-ink hover:bg-pearl-soft/50",
                  )}
                >
                  {c.name}さま
                  {selected === c.id && (
                    <Check size={16} className="text-wine-deep shrink-0" />
                  )}
                </button>
              ))}
              {filteredCandidates.length === 0 && (
                <p className="px-3 py-4 text-[13px] text-ink-mute text-center">
                  「{query.trim()}」に一致する紹介者がいません
                </p>
              )}
            </div>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="変更理由（任意）"
              className="w-full h-9 rounded-btn border border-pearl-soft bg-pearl-warm px-3 text-body-sm text-ink placeholder:text-ink-mute"
              style={{ fontSize: "16px" }}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setSelected("");
                  setReason("");
                  setQuery("");
                }}
                className="flex-1 h-10 rounded-btn border border-ink/[0.10] bg-pearl-soft text-body-sm text-ink-secondary"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={
                  (selected === NO_REFERRER ? null : selected || null) ===
                  (effectiveReferrerId ?? null)
                }
                className={cn(
                  "flex-1 h-10 rounded-btn text-body-sm font-medium transition-all active:scale-[0.98]",
                  (selected === NO_REFERRER ? null : selected || null) ===
                    (effectiveReferrerId ?? null)
                    ? "bg-pearl-soft text-ink-mute cursor-not-allowed"
                    : "bg-wine-deep text-pearl-light shadow-warm",
                )}
              >
                変更を依頼する
              </button>
            </div>
            <p className="text-[10px] text-ink-mute leading-relaxed">
              紹介者の担当キャストの承認後に反映されます。
            </p>
          </div>
        )}
      </Card>
    </section>
  );
}
