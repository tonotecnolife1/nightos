"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AI_FETCH_OPTIONS, apiFetchJson, toUserMessage } from "@/lib/nightos/api-fetch";
import { getVenueType } from "@/lib/nightos/role-store";
import type { VenueType } from "@/lib/nightos/constants";
import type { MentionCustomer } from "../lib/customer-mention";

interface Props {
  open: boolean;
  onClose: () => void;
  castId: string;
  /** 報告を書くヘルプ本人の名前 */
  helperName: string;
  /** このキャストが接客に関わる顧客（@メンション候補と同じ一覧） */
  customers: MentionCustomer[];
  /** 確定した報告をチャットに送信する。customerId は逆カルテ紐付け用。 */
  onSubmit: (report: string, customerId: string) => void;
}

type ApiResult = { report: string; masterName?: string | null; isStub: boolean };

type Step = "compose" | "review";

/** さくらママへの「相談」クイック方向性。 */
const REFINE_CHIPS: { label: string; direction: string }[] = [
  { label: "もっと簡潔に", direction: "全体を短く、要点だけに絞って簡潔にしてください。" },
  { label: "引き継ぎを厚く", direction: "「引き継ぎ / 次回」を、担当がすぐ動けるよう具体的に充実させてください。" },
  { label: "やわらかく", direction: "スタッフ間の連絡として、やわらかく温かい言い回しにしてください。" },
  { label: "事実だけに", direction: "推測や脚色を省き、確認できた事実だけの淡々とした報告にしてください。" },
];

/**
 * ヘルプ報告シート。
 *
 * ヘルプで入ったキャストが「報告したい」タイミングで開き、
 *  1) 対象のお客様 + 気づいたメモを入れて自動でドラフト生成
 *  2) さくらママに相談しながら編集（方向性を伝えて書き直し / 直接編集）
 *  3) 決定したら担当への報告としてチャットに送信
 * という流れを 1 つのモーダルで完結させる。
 */
export function HelpReportSheet({
  open,
  onClose,
  castId,
  helperName,
  customers,
  onSubmit,
}: Props) {
  const [step, setStep] = useState<Step>("compose");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState("");
  const [report, setReport] = useState("");
  const [direction, setDirection] = useState("");
  const [loading, setLoading] = useState<null | "generate" | "refine">(null);
  const [isStub, setIsStub] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const venueType: VenueType = typeof window !== "undefined" ? getVenueType() : "club";

  const selectedCustomer = customers.find((c) => c.id === customerId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s|　/g, "");
    if (!q) return customers.slice(0, 30);
    return customers
      .filter((c) =>
        [c.name, c.nickname ?? "", c.name_kana ?? ""]
          .join("")
          .toLowerCase()
          .replace(/\s|　/g, "")
          .includes(q),
      )
      .slice(0, 30);
  }, [customers, query]);

  if (!open) return null;

  const reset = () => {
    setStep("compose");
    setCustomerId(null);
    setQuery("");
    setNotes("");
    setReport("");
    setDirection("");
    setLoading(null);
    setIsStub(false);
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const generate = async () => {
    if (!customerId || loading) return;
    setLoading("generate");
    setError(null);
    try {
      const data = await apiFetchJson<ApiResult>("/api/help-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate",
          castId,
          customerId,
          helperName,
          notes: notes.trim() || undefined,
          venueType,
        }),
        ...AI_FETCH_OPTIONS,
      });
      setReport(data.report);
      setIsStub(data.isStub);
      setStep("review");
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setLoading(null);
    }
  };

  const refine = async (dir: string) => {
    const d = dir.trim();
    if (!d || !report.trim() || loading) return;
    setLoading("refine");
    setError(null);
    try {
      const data = await apiFetchJson<ApiResult>("/api/help-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "refine",
          castId,
          previousReport: report,
          direction: d,
          venueType,
        }),
        ...AI_FETCH_OPTIONS,
      });
      setReport(data.report);
      setIsStub(data.isStub);
      setDirection("");
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setLoading(null);
    }
  };

  const submit = () => {
    if (!report.trim() || !customerId) return;
    onSubmit(report.trim(), customerId);
    close();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-ink/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-3">
      <div className="w-full sm:max-w-md bg-pearl sm:rounded-card shadow-warm flex flex-col h-dvh sm:h-auto sm:max-h-[92dvh]">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-ink/[0.06] shrink-0">
          {step === "review" ? (
            <button
              type="button"
              onClick={() => setStep("compose")}
              className="flex items-center gap-1 text-ink-soft shrink-0"
            >
              <ArrowLeft size={18} />
              <span className="text-label-sm">戻る</span>
            </button>
          ) : (
            <span className="w-12 shrink-0" />
          )}
          <div className="flex-1 min-w-0 text-center">
            <div className="inline-flex items-center gap-1.5 text-body-md font-medium text-ink">
              <Sparkles size={15} className="text-gold-deep" />
              ヘルプ報告
            </div>
            <div className="text-label-sm text-ink-mute">
              {step === "compose" ? "担当さんへ送る報告を作成" : "さくらママと仕上げる"}
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-soft hover:bg-pearl-soft shrink-0"
            aria-label="閉じる"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-btn bg-wine/5 border border-wine/30 px-3 py-2 text-body-sm text-ink">
              <AlertCircle size={14} className="mt-0.5 text-wine-deep shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ───────── Step 1: compose ───────── */}
          {step === "compose" && (
            <>
              <div>
                <p className="text-label-sm text-gold-deep font-medium mb-1.5">
                  1. 誰のヘルプに入りましたか？
                </p>
                {selectedCustomer ? (
                  <button
                    type="button"
                    onClick={() => setCustomerId(null)}
                    className="w-full flex items-center justify-between rounded-btn bg-champagne-soft/40 border border-gold/40 px-3 py-2.5 text-left"
                  >
                    <span className="text-body-md text-ink font-medium">
                      {selectedCustomer.name}
                      {selectedCustomer.nickname && (
                        <span className="text-ink-mute text-body-sm">
                          （{selectedCustomer.nickname}）
                        </span>
                      )}
                      さま
                    </span>
                    <span className="text-label-sm text-gold-deep">変更</span>
                  </button>
                ) : (
                  <>
                    <label className="flex items-center gap-2 rounded-btn border border-ink/[0.08] bg-pearl-light px-3 py-2 mb-2">
                      <Search size={14} className="text-ink-mute shrink-0" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="お客様を検索..."
                        className="flex-1 bg-transparent text-body-sm text-ink placeholder:text-ink-mute focus:outline-none"
                        style={{ fontSize: "16px" }}
                      />
                    </label>
                    <div className="max-h-44 overflow-y-auto rounded-btn border border-pearl-soft divide-y divide-ink/[0.04]">
                      {filtered.length === 0 ? (
                        <p className="px-3 py-4 text-center text-body-sm text-ink-mute">
                          該当するお客様がいません
                        </p>
                      ) : (
                        filtered.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setCustomerId(c.id);
                              setQuery("");
                            }}
                            className="w-full text-left px-3 py-2.5 hover:bg-champagne-soft/30 active:bg-champagne-soft/40"
                          >
                            <span className="text-body-sm text-ink">
                              {c.name}
                              {c.nickname && (
                                <span className="text-ink-mute">（{c.nickname}）</span>
                              )}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              <div>
                <p className="text-label-sm text-gold-deep font-medium mb-1.5">
                  2. 今日の様子・気づいたこと
                  <span className="text-ink-mute font-normal">（任意）</span>
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="例: 仕事が一段落して機嫌よく、ゴルフの話で盛り上がりました。来週また来たいとのこと。"
                  className="w-full rounded-btn border border-ink/[0.08] bg-pearl-light px-3 py-2.5 text-body-sm text-ink placeholder:text-ink-mute leading-relaxed resize-none focus:outline-none focus:border-gold/40"
                  style={{ fontSize: "16px" }}
                />
                <p className="mt-1 text-[11px] text-ink-mute">
                  メモが無くても、カルテの情報からさくらママが下書きを作ります。
                </p>
              </div>

              <button
                type="button"
                onClick={generate}
                disabled={!customerId || loading !== null}
                className="w-full h-12 rounded-btn bg-wine-deep text-pearl-light text-label-md font-medium shadow-luxe disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading === "generate" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    さくらママが作成中…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    報告を自動作成
                  </>
                )}
              </button>
            </>
          )}

          {/* ───────── Step 2: review ───────── */}
          {step === "review" && (
            <>
              {isStub && (
                <div className="flex items-start gap-2 rounded-btn bg-warning/10 border border-warning/40 px-3 py-2 text-body-sm text-ink">
                  <AlertCircle size={14} className="mt-0.5 text-warning shrink-0" />
                  <span>デモ応答モードです（AI 未接続）。内容は手で整えてください。</span>
                </div>
              )}

              <div>
                <p className="text-label-sm text-gold-deep font-medium mb-1.5">
                  報告ドラフト（そのまま編集できます）
                </p>
                <textarea
                  value={report}
                  onChange={(e) => setReport(e.target.value)}
                  rows={12}
                  disabled={loading === "refine"}
                  className="w-full rounded-btn border border-ink/[0.08] bg-pearl-light px-3 py-2.5 text-body-sm text-ink leading-relaxed resize-none focus:outline-none focus:border-gold/40 disabled:opacity-60"
                  style={{ fontSize: "16px" }}
                />
              </div>

              {/* さくらママに相談 */}
              <div className="rounded-card bg-pearl-warm/60 border border-pearl-soft p-3 space-y-2.5">
                <p className="inline-flex items-center gap-1.5 text-label-sm text-gold-deep font-medium">
                  <Sparkles size={13} />
                  さくらママに相談して直す
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {REFINE_CHIPS.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => refine(chip.direction)}
                      disabled={loading !== null}
                      className="rounded-full bg-pearl-light border border-gold/30 px-3 py-1.5 text-label-sm text-gold-deep disabled:opacity-50 active:scale-95"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") refine(direction);
                    }}
                    placeholder="例: 同伴のお誘いも添えて"
                    disabled={loading !== null}
                    className="flex-1 min-w-0 rounded-btn border border-ink/[0.08] bg-pearl-light px-3 py-2 text-body-sm text-ink placeholder:text-ink-mute focus:outline-none focus:border-gold/40 disabled:opacity-60"
                    style={{ fontSize: "16px" }}
                  />
                  <button
                    type="button"
                    onClick={() => refine(direction)}
                    disabled={!direction.trim() || loading !== null}
                    className="shrink-0 h-9 px-3 rounded-btn bg-pearl-warm border border-gold/30 text-gold-deep text-label-sm font-medium disabled:opacity-50 active:scale-95 flex items-center gap-1"
                  >
                    {loading === "refine" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "直す"
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer (review only) */}
        {step === "review" && (
          <footer className="shrink-0 border-t border-ink/[0.06] p-3 bg-pearl">
            <button
              type="button"
              onClick={submit}
              disabled={!report.trim() || loading !== null}
              className="w-full h-12 rounded-btn bg-wine-deep text-pearl-light text-label-md font-medium shadow-luxe disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Send size={16} />
              この内容で報告を送信
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
