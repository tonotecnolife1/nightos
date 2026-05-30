"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { signupAsOwner } from "@/app/auth/actions";
import { ConfirmationView } from "./confirmation-view";
import { cn } from "@/lib/utils";

type VenueType = "club" | "cabaret";

export default function SignupOwnerForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [venueType, setVenueType] = useState<VenueType>("cabaret");

  const handleSubmit = (formData: FormData) => {
    setError(null);
    setSubmittedEmail(String(formData.get("email") ?? ""));
    formData.set("venueType", venueType);
    startTransition(async () => {
      const result = await signupAsOwner(formData);
      if (result?.error) setError(result.error);
      else if (result?.pendingConfirmation) setPendingConfirmation(true);
    });
  };

  if (pendingConfirmation) {
    return <ConfirmationView email={submittedEmail} backHref="/store/auth/login" />;
  }

  return (
    <main className="min-h-dvh bg-pearl flex flex-col">
      <div className="bg-gradient-hero px-6 pt-14 pb-12">
        <div className="max-w-sm mx-auto">
          <h1 className="font-display text-[28px] leading-[1.3] font-medium tracking-wide text-ink">
            新規登録（店舗オーナー）
          </h1>
          <p className="mt-1.5 text-body-sm text-ink-soft">
            新しい店舗を開く。登録後に招待コードを発行
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-8 pb-12">
        <div className="max-w-sm mx-auto flex flex-col gap-5">
          <form action={handleSubmit} className="space-y-4">
            <section className="space-y-2">
              <div className="text-body-sm text-ink-soft px-1">業態</div>
              <div className="grid grid-cols-2 gap-2">
                <Choice
                  active={venueType === "cabaret"}
                  onClick={() => setVenueType("cabaret")}
                  label="キャバクラ"
                />
                <Choice
                  active={venueType === "club"}
                  onClick={() => setVenueType("club")}
                  label="クラブ"
                />
              </div>
            </section>

            <Field label="店舗名">
              <input
                type="text"
                name="newStoreName"
                placeholder="例: Club 夜桜"
                required
                maxLength={80}
                disabled={pending}
                className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-light shadow-soft text-body-md text-ink placeholder:text-ink-mute shadow-soft focus:outline-none focus:border-wine-deep"
                style={{ fontSize: "16px" }}
              />
            </Field>

            <Field label="お名前">
              <input
                type="text"
                name="name"
                placeholder="例: ママ"
                required
                maxLength={40}
                disabled={pending}
                className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-light shadow-soft text-body-md text-ink placeholder:text-ink-mute shadow-soft focus:outline-none focus:border-wine-deep"
                style={{ fontSize: "16px" }}
              />
            </Field>

            <Field label="メールアドレス">
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                required
                disabled={pending}
                className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-light shadow-soft text-body-md text-ink placeholder:text-ink-mute shadow-soft focus:outline-none focus:border-wine-deep"
                style={{ fontSize: "16px" }}
              />
            </Field>

            <Field label="パスワード" hint="8文字以上">
              <input
                type="password"
                name="password"
                required
                minLength={8}
                disabled={pending}
                className="w-full px-4 py-3 rounded-2xl border border-ink/[0.08] bg-pearl-light shadow-soft text-body-md text-ink shadow-soft focus:outline-none focus:border-wine-deep"
                style={{ fontSize: "16px" }}
              />
            </Field>

            <button
              type="submit"
              disabled={pending}
              className="w-full mt-2 px-6 py-3.5 rounded-pill bg-wine-deep text-pearl-light text-body-md font-semibold tracking-[0.04em] hover:-translate-y-px active:translate-y-px transition shadow-luxe will-change-transform disabled:opacity-50"
            >
              {pending ? "登録中..." : "店舗を開く"}
            </button>
            {error && <p className="text-[12px] text-[#c2575b] text-center leading-relaxed">{error}</p>}
          </form>

          <p className="text-body-sm text-ink-soft text-center">
            <Link href="/store/auth/signup-staff" className="text-wine-deep underline-offset-2 hover:underline">
              既存の店舗にスタッフとして参加
            </Link>
            {"  ·  "}
            <Link href="/store/auth/login" className="text-wine-deep underline-offset-2 hover:underline">
              ログイン
            </Link>
          </p>

          <p className="text-[11px] text-ink-mute text-center leading-relaxed">
            登録すると{" "}
            <Link href="/legal/terms" className="underline underline-offset-2">利用規約</Link>
            {" "}と{" "}
            <Link href="/legal/privacy" className="underline underline-offset-2">プライバシーポリシー</Link>
            {" "}に同意したとみなされます
          </p>
        </div>
      </div>
    </main>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5 px-1">
        <span className="text-body-sm text-ink-soft">{label}</span>
        {hint && <span className="text-[11px] text-ink-mute">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function Choice({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "py-3 rounded-pill text-body-sm font-semibold tracking-[0.04em] border transition",
        active
          ? "border-wine-deep bg-wine-deep text-pearl-light shadow-luxe"
          : "border-ink/[0.08] bg-pearl-light text-ink-soft hover:border-gold/30 hover:-translate-y-px shadow-soft",
      )}
    >
      {label}
    </button>
  );
}
