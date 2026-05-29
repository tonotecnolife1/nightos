"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { changeStore, deleteAccount, mockLogout } from "../auth/actions";
import type { CastUserRole } from "@/types/nightos";
import { InstallAppSectionAlways } from "@/components/nightos/install-app-section";

interface Props {
  email: string;
  castName: string | null;
  userRole: CastUserRole | null;
  currentStoreName: string | null;
  storeInviteInfo: { name: string; inviteCode: string } | null;
}

const ROLE_LABEL: Record<CastUserRole, string> = {
  cast: "キャスト",
  store_staff: "店舗スタッフ",
  store_owner: "店舗オーナー",
};

export default function SettingsClient({
  email,
  castName,
  userRole,
  currentStoreName,
  storeInviteInfo,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [confirmText, setConfirmText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Store change (cast / store_staff only — owners can't transfer)
  const [showStoreChange, setShowStoreChange] = useState(false);
  const [newInviteCode, setNewInviteCode] = useState("");
  const [storeChangeError, setStoreChangeError] = useState<string | null>(null);
  const canChangeStore =
    userRole === "cast" || userRole === "store_staff";

  const handleChangeStore = () => {
    setStoreChangeError(null);
    const formData = new FormData();
    formData.set(
      "inviteCode",
      newInviteCode.replace(/[\s-]/g, "").toUpperCase(),
    );
    startTransition(async () => {
      const result = await changeStore(formData);
      if (result?.error) setStoreChangeError(result.error);
      // Success path triggers a redirect — nothing to do here.
    });
  };

  const copyInviteCode = async () => {
    if (!storeInviteInfo) return;
    try {
      await navigator.clipboard.writeText(storeInviteInfo.inviteCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — user can long-press select instead
    }
  };

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount();
      if (result?.error) setError(result.error);
    });
  };

  const handleLogout = () => {
    startTransition(() => {
      void mockLogout();
    });
  };

  const canDelete = confirmText === "削除する";

  return (
    <main className="min-h-dvh bg-pearl flex flex-col">
      <div className="bg-gradient-hero px-6 pt-12 pb-8">
        <div className="max-w-sm mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[12px] text-ink-mute hover:text-ink-soft mb-3"
          >
            <ArrowLeft size={14} /> ホームに戻る
          </Link>
          <h1 className="font-display text-[26px] leading-[1.2] font-medium tracking-wide text-ink">
            設定
          </h1>
        </div>
      </div>

      <div className="flex-1 px-6 pt-6 pb-12">
        <div className="max-w-sm mx-auto space-y-5">
          {/* アカウント情報 */}
          <section className="rounded-card border border-ink/[0.06] bg-pearl-warm p-4 shadow-soft space-y-2">
            <h2 className="font-display text-[18px] leading-tight font-medium text-ink">
              アカウント
            </h2>
            <dl className="space-y-1.5 text-body-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-mute shrink-0">メール</dt>
                <dd className="text-ink truncate">{email}</dd>
              </div>
              {castName && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-mute shrink-0">源氏名</dt>
                  <dd className="text-ink">{castName}</dd>
                </div>
              )}
              {userRole && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-mute shrink-0">役割</dt>
                  <dd className="text-ink">{ROLE_LABEL[userRole]}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* オーナーのみ: 招待コード */}
          {storeInviteInfo && (
            <section className="rounded-card border border-gold/30 bg-gradient-to-br from-pearl-warm to-champagne-soft/40 p-4 shadow-soft space-y-3">
              <div>
                <h2 className="font-display text-[18px] leading-tight font-medium text-ink">
                  店舗の招待コード
                </h2>
                <p className="text-[11px] text-ink-mute mt-0.5">
                  {storeInviteInfo.name} のキャスト・スタッフ用
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-3 rounded-2xl border border-gold/30 bg-pearl-warm text-ink font-mono tracking-[0.2em] text-center text-body-md">
                  {storeInviteInfo.inviteCode}
                </code>
                <button
                  type="button"
                  onClick={copyInviteCode}
                  className="shrink-0 inline-flex items-center gap-1 px-4 py-3 rounded-pill border border-gold/30 bg-pearl-warm text-body-sm text-ink hover:border-gold/50 transition shadow-soft"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "コピー済み" : "コピー"}
                </button>
              </div>
              <p className="text-[11px] text-ink-mute leading-relaxed">
                このコードを所属キャスト・スタッフに伝えると、新規登録時に
                このお店に参加できます。コードを知らない人は加入できません。
              </p>
            </section>
          )}

          {/* キャスト・スタッフのみ: 店舗変更 */}
          {canChangeStore && (
            <section className="rounded-card border border-ink/[0.06] bg-pearl-warm p-4 shadow-soft space-y-3">
              <div>
                <h2 className="font-display text-[18px] leading-tight font-medium text-ink">
                  所属店舗
                </h2>
                {currentStoreName && (
                  <p className="text-[11px] text-ink-mute mt-0.5">
                    現在: {currentStoreName}
                  </p>
                )}
              </div>

              {!showStoreChange ? (
                <button
                  type="button"
                  onClick={() => setShowStoreChange(true)}
                  className="inline-block px-5 py-2.5 rounded-pill border border-gold/30 bg-pearl-warm text-body-sm text-ink hover:border-gold/50 transition shadow-soft"
                >
                  店舗を変更
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-[12px] text-ink-soft leading-relaxed">
                    新しい店舗の招待コード（8文字）を入力してください。
                    <span className="block mt-1 text-ink-mute">
                      ※ 過去の店舗での履歴（来店・ボトル・メモ）は元の店舗側に残ります。
                    </span>
                  </p>
                  <input
                    type="text"
                    value={newInviteCode}
                    onChange={(e) =>
                      setNewInviteCode(
                        e.target.value
                          .replace(/[\s-]/g, "")
                          .toUpperCase()
                          .slice(0, 8),
                      )
                    }
                    placeholder="例: AB23CD45"
                    aria-label="新しい店舗の招待コード"
                    disabled={pending}
                    autoCapitalize="characters"
                    className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-light text-body-md text-ink placeholder:text-ink-mute shadow-soft focus:outline-none focus:border-roseGold-deep tracking-[0.2em] font-mono uppercase"
                    style={{ fontSize: "16px" }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowStoreChange(false);
                        setNewInviteCode("");
                        setStoreChangeError(null);
                      }}
                      disabled={pending}
                      className="flex-1 px-4 py-2.5 rounded-pill border border-ink/15 bg-pearl-warm text-body-sm text-ink disabled:opacity-50"
                    >
                      キャンセル
                    </button>
                    <button
                      type="button"
                      onClick={handleChangeStore}
                      disabled={newInviteCode.length !== 8 || pending}
                      className="flex-1 px-4 py-2.5 rounded-pill bg-roseGold-deep text-pearl-light text-body-sm font-semibold tracking-[0.04em] shadow-luxe hover:-translate-y-px transition disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {pending ? "変更中..." : "変更を確定"}
                    </button>
                  </div>
                  {storeChangeError && (
                    <p className="text-[12px] text-[#c2575b] leading-relaxed">
                      {storeChangeError}
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {/* アプリとして使う */}
          <InstallAppSectionAlways />

          {/* パスワード */}
          <section className="rounded-card border border-ink/[0.06] bg-pearl-warm p-4 shadow-soft space-y-2">
            <h2 className="font-display text-[18px] leading-tight font-medium text-ink">
              パスワード
            </h2>
            <p className="text-[11px] text-ink-mute leading-relaxed">
              再設定リンクをメールでお送りします
            </p>
            <Link
              href="/auth/reset-password"
              className="inline-block mt-1 px-5 py-2.5 rounded-pill border border-gold/30 bg-pearl-warm text-body-sm text-ink hover:border-gold/50 transition shadow-soft"
            >
              パスワードを変更
            </Link>
          </section>

          {/* ログアウト */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={pending}
            className="w-full px-6 py-3 rounded-pill border border-ink/15 bg-pearl-warm text-body-md text-ink hover:border-ink/30 transition shadow-soft disabled:opacity-50"
          >
            ログアウト
          </button>

          {/* 退会 */}
          <section className="rounded-card border border-[#c2575b]/30 bg-pearl-warm p-4 space-y-3 mt-8">
            <h2 className="font-display text-[18px] leading-tight font-medium text-[#c2575b]">
              アカウントを削除
            </h2>
            <p className="text-body-sm text-ink-soft leading-relaxed">
              退会するとアカウントと、登録した顧客・来店・ボトル・メモ等の情報が
              <span className="font-medium text-ink">すべて完全に削除</span>
              され、復元できなくなります。
            </p>

            {!showConfirm ? (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="text-body-sm text-[#c2575b] underline-offset-2 hover:underline"
              >
                退会する
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-[12px] text-ink-soft">
                  確認のため、下の枠に
                  <span className="font-medium text-[#c2575b]"> 削除する </span>
                  と入力してください
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={pending}
                  className="w-full px-3 py-2.5 rounded-2xl border border-ink/[0.08] bg-pearl-warm text-body-md text-ink shadow-soft focus:outline-none focus:border-[#c2575b]"
                  style={{ fontSize: "16px" }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirm(false);
                      setConfirmText("");
                      setError(null);
                    }}
                    disabled={pending}
                    className="flex-1 px-4 py-2.5 rounded-pill border border-ink/15 bg-pearl-warm text-body-sm text-ink disabled:opacity-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!canDelete || pending}
                    className="flex-1 px-4 py-2.5 rounded-pill bg-[#c2575b] text-pearl text-body-sm font-medium hover:brightness-[1.05] disabled:opacity-50 disabled:hover:brightness-100"
                  >
                    {pending ? "削除中..." : "削除する"}
                  </button>
                </div>
                {error && (
                  <p className="text-[12px] text-[#c2575b]">{error}</p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
