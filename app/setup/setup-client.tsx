"use client";

import { useState } from "react";
import { Card } from "@/components/nightos/card";
import { Button } from "@/components/nightos/button";

interface Props {
  /**
   * The setup secret passed through from the page-level server gate.
   * Already validated server-side; reused here only as a query string
   * to authenticate the same admin against the API routes.
   */
  secret: string;
}

export default function SetupClient({ secret }: Props) {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<any>(null);
  const [schemaStatus, setSchemaStatus] = useState<"idle" | "info">("idle");
  const [authStatus, setAuthStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [authResult, setAuthResult] = useState<any>(null);

  const qs = `?secret=${encodeURIComponent(secret)}`;

  const runSetup = async () => {
    setStatus("running");
    try {
      const res = await fetch(`/api/setup${qs}`, { method: "POST" });
      const data = await res.json();
      setResult(data);
      setStatus(res.ok ? "done" : "error");
    } catch (err: any) {
      setResult({ error: err.message });
      setStatus("error");
    }
  };

  const runAuthSetup = async () => {
    setAuthStatus("running");
    try {
      const res = await fetch(`/api/setup-auth${qs}`, { method: "POST" });
      const data = await res.json();
      setAuthResult(data);
      setAuthStatus(res.ok ? "done" : "error");
    } catch (err: any) {
      setAuthResult({ error: err.message });
      setAuthStatus("error");
    }
  };

  return (
    <main className="bg-pearl min-h-dvh px-6 py-12">
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="font-display text-2xl font-semibold text-ink">
          NIGHTOS セットアップ
        </h1>

        <Card className="p-4 space-y-4">
          <h2 className="text-body-md font-semibold text-ink">
            Step 1: スキーマ作成
          </h2>
          <p className="text-body-sm text-ink-soft">
            Supabase Dashboard → SQL Editor で以下のSQLを実行してください。
          </p>
          <button
            type="button"
            onClick={() => setSchemaStatus("info")}
            className="text-body-sm text-gold-deep underline"
          >
            SQL を表示
          </button>
          {schemaStatus === "info" && (
            <div className="bg-pearl-soft rounded-btn p-3 text-[11px] text-ink-soft max-h-48 overflow-y-auto font-mono">
              <p>Supabase Dashboard → SQL Editor に移動し、</p>
              <p className="font-semibold mt-1">supabase/migrations/002_nightos_schema.sql</p>
              <p>と</p>
              <p className="font-semibold">supabase/migrations/003_schema_additions.sql</p>
              <p className="mt-1">の内容を順番に貼り付けて実行してください。</p>
              <p className="mt-2 text-warning">※ テーブルが既に存在する場合は IF NOT EXISTS で安全にスキップされます。</p>
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-4">
          <h2 className="text-body-md font-semibold text-ink">
            Step 2: テストデータ投入
          </h2>
          <p className="text-body-sm text-ink-soft">
            ボタンを押すと、モックデータと同じテストデータが Supabase に投入されます。
            キャスト9名・顧客38名・来店履歴・ボトル・同伴・目標・連絡履歴・AI相談・メッセージ・クーポンなど全て含みます。
          </p>

          <Button
            variant="primary"
            onClick={runSetup}
            disabled={status === "running"}
            className="w-full"
          >
            {status === "running" ? "投入中..." : "テストデータを投入"}
          </Button>

          {status === "done" && result && (
            <div className="bg-success/10 border border-success/20 rounded-btn p-3 space-y-1">
              <p className="text-body-sm font-semibold text-success">
                セットアップ完了
              </p>
              {result.summary && (
                <div className="text-[11px] text-ink-soft grid grid-cols-2 gap-x-4">
                  <span>店舗: {result.summary.stores}</span>
                  <span>キャスト: {result.summary.casts}</span>
                  <span>顧客: {result.summary.customers}</span>
                  <span>ボトル: {result.summary.bottles}</span>
                  <span>メモ: {result.summary.memos}</span>
                  <span>来店: {result.summary.visits}</span>
                  <span>同伴: {result.summary.douhans}</span>
                  <span>目標: {result.summary.goals}</span>
                  <span>連絡履歴: {result.summary.follow_logs}</span>
                  <span>AI相談: {result.summary.ai_chats}</span>
                  <span>メッセージ: {result.summary.cast_messages}</span>
                  <span>申請: {result.summary.cast_requests}</span>
                  <span>クーポン: {result.summary.coupons}</span>
                </div>
              )}
              {result.log && (
                <details className="text-[10px] text-ink-mute mt-2">
                  <summary>詳細ログ</summary>
                  <ul className="mt-1 space-y-0.5">
                    {result.log.map((l: string, i: number) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {status === "error" && result && (
            <div className="bg-wine/10 border border-wine/20 rounded-btn p-3">
              <p className="text-body-sm font-semibold text-wine-deep">
                エラーが発生しました
              </p>
              <p className="text-[11px] text-ink-soft mt-1">
                {result.error}
              </p>
              {result.log && (
                <details className="text-[10px] text-ink-mute mt-2">
                  <summary>詳細ログ</summary>
                  <ul className="mt-1 space-y-0.5">
                    {result.log.map((l: string, i: number) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-4">
          <h2 className="text-body-md font-semibold text-ink">
            Step 3 (任意): メールログイン用テストアカウント作成
          </h2>
          <p className="text-body-sm text-ink-soft">
            Supabase Auth に 5 名のテストユーザー（akari@test.nightos など）を作成し、
            既存のキャストレコードに紐付けます。メール/パスワードでの実ログインが可能になります。
          </p>
          <p className="text-[11px] text-ink-mute bg-warning/10 border border-warning/20 rounded-btn p-2">
            <strong>必要な環境変数:</strong> SUPABASE_SERVICE_ROLE_KEY
            （Supabase Dashboard → Project Settings → API → service_role secret）
          </p>

          <Button
            variant="ghost"
            onClick={runAuthSetup}
            disabled={authStatus === "running"}
            className="w-full"
          >
            {authStatus === "running" ? "作成中..." : "Auth ユーザーを作成"}
          </Button>

          {authStatus === "done" && authResult && (
            <div className="bg-success/10 border border-success/20 rounded-btn p-3 space-y-2">
              <p className="text-body-sm font-semibold text-success">
                Auth セットアップ完了
              </p>
              {authResult.accounts && authResult.accounts.length > 0 && (
                <div className="text-[11px] text-ink-soft space-y-1">
                  <p className="font-semibold">作成済みアカウント:</p>
                  <ul className="space-y-0.5 font-mono">
                    {authResult.accounts.map((a: any, i: number) => (
                      <li key={i}>
                        {a.email} / {a.password} → {a.castName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {authResult.log && (
                <details className="text-[10px] text-ink-mute">
                  <summary>詳細ログ</summary>
                  <ul className="mt-1 space-y-0.5">
                    {authResult.log.map((l: string, i: number) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {authStatus === "error" && authResult && (
            <div className="bg-wine/10 border border-wine/20 rounded-btn p-3">
              <p className="text-body-sm font-semibold text-wine-deep">
                エラーが発生しました
              </p>
              <p className="text-[11px] text-ink-soft mt-1">
                {authResult.error}
              </p>
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-2">
          <h2 className="text-body-md font-semibold text-ink">
            Step 4: ログインして確認
          </h2>
          <p className="text-body-sm text-ink-soft">
            セットアップ完了後、
            <a href="/auth/login" className="text-gold-deep underline ml-1">
              ログインページ
            </a>
            からキャストを選択（デモ）またはメール/パスワードでログインしてください。
          </p>
        </Card>
      </div>
    </main>
  );
}
