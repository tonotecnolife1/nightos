"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { setStatsConsultHandoff } from "@/lib/nightos/stats-consult-store";

interface Props {
  castId: string;
  /** キャスト名。語りかけの宛名に使う。 */
  name: string;
}

interface Analysis {
  genjou: string;
  kadai: string;
  action: string;
}

interface AnalysisApiResponse extends Analysis {
  isStub: boolean;
  generatedAt: string;
}

type State =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "done"; analysis: Analysis; isStub: boolean }
  | { phase: "error" };

const SECTIONS: { key: keyof Analysis; eyebrow: string; label: string }[] = [
  { key: "genjou", eyebrow: "NOW", label: "現状" },
  { key: "kadai", eyebrow: "ISSUE", label: "課題" },
  { key: "action", eyebrow: "ACTION", label: "取るべきアクション" },
];

/**
 * さくらママに成績を分析してもらうセクション。
 * ボタンを押すと API が現状 / 課題 / アクションを語り口調で返す。
 * 「もっと相談する」でさくらママのチャットに分析を引き継いで続けられる。
 */
export function StatsAnalysis({ castId, name }: Props) {
  const router = useRouter();
  const [state, setState] = useState<State>({ phase: "idle" });

  const runAnalysis = async () => {
    setState({ phase: "loading" });
    try {
      const res = await fetch("/api/stats-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ castId }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data: AnalysisApiResponse = await res.json();
      setState({
        phase: "done",
        isStub: data.isStub,
        analysis: {
          genjou: data.genjou,
          kadai: data.kadai,
          action: data.action,
        },
      });
    } catch (err) {
      console.error("[stats-analysis] failed:", err);
      setState({ phase: "error" });
    }
  };

  const continueInChat = () => {
    if (state.phase !== "done") return;
    const { genjou, kadai, action } = state.analysis;
    const assistantReply = [
      `${name}さんの今月の成績を見させてもらったわ。`,
      `【現状】\n${genjou}`,
      `【課題】\n${kadai}`,
      `【これからやること】\n${action}`,
      "ここから先、気になるところを一緒に詰めましょ。どこから話す？",
    ].join("\n\n");
    setStatsConsultHandoff({
      castId,
      userText: "さっきの成績の分析、もう少し相談したいです。",
      assistantReply,
    });
    router.push("/cast/ruri-mama");
  };

  return (
    <section className="flex flex-col gap-3">
      <div
        className="relative overflow-hidden rounded-hero p-[18px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 20% 20%, rgba(154,93,93,0.45) 0%, transparent 60%)," +
            "radial-gradient(ellipse 60% 60% at 90% 90%, rgba(140,111,68,0.18) 0%, transparent 60%)," +
            "linear-gradient(135deg, #3A1F1F 0%, #5E3838 60%, #3A1F1F 100%)",
          border: "1px solid rgba(235,217,168,0.25)",
          boxShadow:
            "0 8px 20px rgba(45,24,24,0.55), 0 28px 56px rgba(20,10,10,0.45)",
        }}
      >
        {/* top brass edge */}
        <span
          aria-hidden
          className="absolute left-0 right-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(235,217,168,0.50) 15%, rgba(235,217,168,0.50) 85%, transparent 100%)",
          }}
        />

        {/* header */}
        <div className="flex items-center gap-3.5">
          <span
            className="w-11 h-11 rounded-full p-0.5 shrink-0 block"
            style={{
              background: "var(--v5-champ-gold)",
              boxShadow: "0 6px 18px rgba(140,111,68,0.30)",
            }}
          >
            <span
              className="w-full h-full rounded-full overflow-hidden block"
              style={{ border: "1px solid #3A1F1F" }}
            >
              <Image
                src="/cast/sakura-mama.jpg"
                alt="さくらママ"
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <div
              className="text-[10px] tracking-[0.22em] mb-0.5"
              style={{ color: "rgba(235,217,168,0.75)" }}
            >
              SAKURA MAMA · REVIEW
            </div>
            <div
              className="font-serif text-[16px] leading-[1.2] inline-block v5-metallic"
              style={{ letterSpacing: "0.04em" }}
            >
              成績をママに見てもらう
            </div>
          </div>
        </div>

        {/* body — varies by phase */}
        <div className="mt-4">
          {state.phase === "idle" && (
            <>
              <p
                className="m-0 mb-4 font-serif text-[13px] leading-[1.75] font-medium"
                style={{ color: "#fdfcf9", letterSpacing: "0.02em" }}
              >
                今月の数字を、さくらママが現状・課題・次にやることまで読み解くわ。ボタンを押してみて。
              </p>
              <button
                type="button"
                onClick={runAnalysis}
                className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-pill text-[14px] font-semibold tracking-[0.04em] active:scale-[0.99] transition"
                style={{
                  background: "var(--v5-champ-gold)",
                  color: "#3A1F1F",
                  boxShadow: "0 6px 18px rgba(140,111,68,0.35)",
                }}
              >
                <Sparkles size={16} strokeWidth={1.8} />
                さくらママに成績を見てもらう
              </button>
            </>
          )}

          {state.phase === "loading" && (
            <div
              className="flex items-center gap-2 py-4 font-serif text-[13px]"
              style={{ color: "rgba(253,252,249,0.9)" }}
            >
              <Sparkles
                size={15}
                strokeWidth={1.8}
                className="animate-shimmer"
                style={{ color: "var(--v5-champ-gold)" }}
              />
              さくらママが数字を見ているわ…
            </div>
          )}

          {state.phase === "error" && (
            <div className="flex flex-col gap-3">
              <p
                className="m-0 font-serif text-[13px] leading-[1.7]"
                style={{ color: "#fdfcf9" }}
              >
                ごめんなさい、今ちょっと数字が読み込めなかったわ。もう一度試してくれる？
              </p>
              <button
                type="button"
                onClick={runAnalysis}
                className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-pill text-[13px] font-semibold tracking-[0.04em] active:scale-[0.99] transition"
                style={{ background: "var(--v5-champ-gold)", color: "#3A1F1F" }}
              >
                もう一度見てもらう
              </button>
            </div>
          )}

          {state.phase === "done" && (
            <div className="flex flex-col gap-3.5">
              {SECTIONS.map(({ key, eyebrow, label }) => (
                <div
                  key={key}
                  className="rounded-card p-3.5"
                  style={{
                    background: "rgba(253,252,249,0.06)",
                    border: "1px solid rgba(235,217,168,0.18)",
                  }}
                >
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span
                      className="text-[9px] tracking-[0.22em]"
                      style={{ color: "rgba(235,217,168,0.7)" }}
                    >
                      {eyebrow}
                    </span>
                    <span
                      className="font-serif text-[13px] font-semibold"
                      style={{ color: "var(--v5-champ-gold-light, #ebd9a8)" }}
                    >
                      {label}
                    </span>
                  </div>
                  <p
                    className="m-0 font-serif text-[13px] leading-[1.8] font-medium"
                    style={{ color: "#fdfcf9", letterSpacing: "0.02em" }}
                  >
                    {state.analysis[key]}
                  </p>
                </div>
              ))}

              <button
                type="button"
                onClick={continueInChat}
                className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-pill text-[14px] font-semibold tracking-[0.04em] active:scale-[0.99] transition mt-0.5"
                style={{
                  background: "var(--v5-champ-gold)",
                  color: "#3A1F1F",
                  boxShadow: "0 6px 18px rgba(140,111,68,0.35)",
                }}
              >
                もっと相談する
                <ArrowRight size={16} strokeWidth={1.8} />
              </button>

              {state.isStub && (
                <p
                  className="m-0 text-[10px] leading-relaxed text-center"
                  style={{ color: "rgba(253,252,249,0.55)" }}
                >
                  ※ デモ応答モードです（ANTHROPIC_API_KEY 未設定）
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
