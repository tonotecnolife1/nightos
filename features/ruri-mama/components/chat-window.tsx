"use client";

import { useEffect, useRef, useState } from "react";
import { Info, Plus, Sparkles, Trash2 } from "lucide-react";
import { useCastId } from "@/lib/nightos/cast-context";
import { detectIntent } from "@/lib/nightos/intent-detector";
import { HEARING_FLOWS } from "../data/system-prompt";
import { recentFeedbackSamples } from "../lib/feedback-store";
import {
  newSessionId,
  saveSession,
  type ChatSession,
} from "../lib/chat-session-store";
import { ChatInput } from "./chat-input";
import { ChipOptions } from "./chip-options";
import { CustomerContextPill } from "./customer-context-pill";
import { CustomerSelectInline } from "./customer-select-inline";
import { FeedbackButtons } from "./feedback-buttons";
import { IntentPicker } from "./intent-picker";
import { MessageBubble } from "./message-bubble";
import {
  PickedOptionBadge,
  RefineTriggerButton,
  ReplyOptionPicker,
} from "./reply-option-picker";
import { RefineDirectionPicker } from "./refine-direction-picker";
import { recordChoice } from "../lib/option-choice-store";
import type { RefineDirection } from "../data/refine-directions";
import type {
  ChatMessage,
  Customer,
  HearingFlow,
  Intent,
  RuriMamaResponse,
} from "@/types/nightos";

// ═══════════════ Persistence helpers ═══════════════

const STORAGE_KEY_PREFIX = "nightos.chat";
const MAX_PERSISTED_MESSAGES = 30;

function loadStoredMessages(castId: string): ChatMessage[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}.${castId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveMessagesToStorage(castId: string, messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    // Filter out transient assistant prompts (greeting / freeform invite)
    // and trim to MAX_PERSISTED_MESSAGES so localStorage doesn't grow forever.
    const persistable = messages.filter(
      (m) => m.role !== "assistant" || (m.content.length > 0 && m !== GREETING && m !== FREEFORM_PROMPT),
    );
    const trimmed = persistable.slice(-MAX_PERSISTED_MESSAGES);
    window.localStorage.setItem(
      `${STORAGE_KEY_PREFIX}.${castId}`,
      JSON.stringify(trimmed),
    );
  } catch {
    // ignore quota errors
  }
}

function clearStoredMessages(castId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${STORAGE_KEY_PREFIX}.${castId}`);
  } catch {
    // ignore
  }
}

interface Props {
  customers: Customer[];
  helpCastNames?: Record<string, string>;
  initialCustomerId?: string;
  initialIsStubMode?: boolean;
}

type Phase =
  | { name: "intent-pick" }
  | {
      name: "hearing";
      intent: Intent;
      flow: HearingFlow;
      step: number;
      answers: Record<string, string>;
      /** Set when the user reached hearing by typing free text — that text
       *  is used as the user message instead of a synthesized one. */
      originalText?: string;
    }
  | { name: "freeform" }
  | { name: "loading" }
  | { name: "responded" };

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "いらっしゃい。下から相談したいことを選んでね。\n顧客のお名前を選んでおくと、もっと具体的に答えられるわよ。",
};

const FREEFORM_PROMPT: ChatMessage = {
  role: "assistant",
  content:
    "下の入力欄に話しかけるか、書いてみて。マイクのアイコンをタップすると音声入力もできるわよ。",
};

export function ChatWindow({
  customers,
  helpCastNames = {},
  initialCustomerId,
  initialIsStubMode = false,
}: Props) {
  const castId = useCastId();
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [phase, setPhase] = useState<Phase>({ name: "intent-pick" });
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >(initialCustomerId);
  const [stubMode, setStubMode] = useState(initialIsStubMode);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [currentSessionId] = useState(() => newSessionId());
  /** ブラッシュアップ方向選択中のメッセージ index。null = 起動されてない */
  const [refiningMessageIdx, setRefiningMessageIdx] = useState<number | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Save session to history whenever phase becomes "responded"
  useEffect(() => {
    if (phase.name !== "responded") return;
    const userMsgs = messages.filter(
      (m) => m.role === "user" && m !== GREETING && m !== FREEFORM_PROMPT,
    );
    if (userMsgs.length === 0) return;
    const customerName = selectedCustomerId
      ? customers.find((c) => c.id === selectedCustomerId)?.name ?? null
      : null;
    const session: ChatSession = {
      id: currentSessionId,
      customerId: selectedCustomerId ?? null,
      customerName,
      title: userMsgs[0]?.content.slice(0, 50) ?? "相談",
      messages: messages.filter((m) => m !== GREETING && m !== FREEFORM_PROMPT),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveSession(session);
  }, [phase, messages, selectedCustomerId, customers, currentSessionId]);

  // On mount, restore persisted chat history (if any)
  useEffect(() => {
    const stored = loadStoredMessages(castId);
    if (stored && stored.length > 0) {
      setMessages([GREETING, ...stored]);
      // If the last persisted message was an assistant reply, mark as
      // "responded" so the cast can immediately tap "新しい相談" or
      // continue typing
      const lastUserOrAi = stored[stored.length - 1];
      if (lastUserOrAi.role === "assistant") {
        setPhase({ name: "responded" });
      }
    }
    setHistoryLoaded(true);
  }, []);

  // Save on every change after the initial restore
  useEffect(() => {
    if (!historyLoaded) return;
    saveMessagesToStorage(castId, messages);
  }, [messages, historyLoaded]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, phase]);

  const handleClearHistory = () => {
    if (!confirm("これまでの相談履歴を全部削除しますか？")) return;
    clearStoredMessages(castId);
    setMessages([GREETING]);
    setPhase({ name: "intent-pick" });
  };

  const lookupCustomerName = (id: string | undefined): string | null =>
    id ? (customers.find((c) => c.id === id)?.name ?? null) : null;

  // ─────────────────────────────────────────────────────────────
  // API call helpers
  // ─────────────────────────────────────────────────────────────

  const callApi = async (
    intent: Intent,
    hearingContext: Record<string, string>,
    messagesToSend: ChatMessage[],
  ) => {
    // Abort any in-progress call before starting a new one
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase({ name: "loading" });
    try {
      const feedbackContext = recentFeedbackSamples(castId, 8);
      const res = await fetch("/api/ruri-mama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesToSend.filter((m) => m !== GREETING && m !== FREEFORM_PROMPT),
          customerId: selectedCustomerId,
          hearingContext,
          castId: castId,
          intent,
          recentFeedback: feedbackContext,
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data: RuriMamaResponse = await res.json();
      setStubMode(data.isStub);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          isStub: data.isStub,
          options: data.options && data.options.length >= 2 ? data.options : undefined,
        },
      ]);
      setPhase({ name: "responded" });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return; // silently ignore — new topic took over
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "ごめんなさい、今ちょっと電波が悪いみたい。もう一度送ってくれる？",
        },
      ]);
      setPhase({ name: "responded" });
    }
  };

  /** ユーザーが3つの選択肢から1つをピックした時のハンドラ。A/B集計用にも記録。 */
  const handleOptionPick = (messageIndex: number, opt: import("@/types/nightos").ReplyOption) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === messageIndex
          ? { ...m, pickedOptionId: opt.id, content: opt.content }
          : m,
      ),
    );
    recordChoice({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      pickedStyle: opt.style,
      pickedId: opt.id,
      pickedLabel: opt.label,
      intent: undefined, // 現状 intent を component で保持してないので将来拡張
      customerCategory: undefined,
      pickedAt: new Date().toISOString(),
      castId: castId,
    });
  };

  /** ブラッシュアップボタン押下 → 方向選択を起動 */
  const handleRefineTrigger = (messageIndex: number) => {
    setRefiningMessageIdx(messageIndex);
  };

  /** ブラッシュアップ方向選択 → APIに投げて新しい3つのオプションを取得 */
  const handleRefineDirectionPick = async (
    messageIndex: number,
    direction: RefineDirection,
  ) => {
    const srcMessage = messages[messageIndex];
    if (!srcMessage?.content) return;

    setRefiningMessageIdx(null);
    setPhase({ name: "loading" });

    try {
      const res = await fetch("/api/ruri-mama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", content: `ブラッシュアップ: ${direction.label}` },
          ],
          castId: castId,
          intent: "freeform",
          refineStep: "apply",
          previousReply: srcMessage.content,
          refinementDirection: direction.prompt,
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data: import("@/types/nightos").RuriMamaResponse = await res.json();
      setStubMode(data.isStub);
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: `「${direction.emoji} ${direction.label}」で書き直して`,
        },
        {
          role: "assistant",
          content: data.reply,
          isStub: data.isStub,
          options: data.options && data.options.length >= 2 ? data.options : undefined,
        },
      ]);
      setPhase({ name: "responded" });
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "ごめんなさい、ブラッシュアップに失敗しました。もう一度試してみて。",
        },
      ]);
      setPhase({ name: "responded" });
    }
  };

  /** Adds a NEW user message, then fires the API call with the updated history. */
  const sendNewMessage = (
    text: string,
    intent: Intent,
    hearingContext: Record<string, string>,
    images?: string[],
  ) => {
    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      images: images && images.length > 0 ? images : undefined,
    };
    const updated = [...messages, userMsg];
    setMessages(updated);
    void callApi(intent, hearingContext, updated);
  };

  /** Reuses the existing last user message (used after the typed-text → hearing path). */
  const continueWithExisting = (
    intent: Intent,
    hearingContext: Record<string, string>,
  ) => {
    void callApi(intent, hearingContext, messages);
  };

  // ─────────────────────────────────────────────────────────────
  // Event handlers
  // ─────────────────────────────────────────────────────────────

  const handleIntentPick = (intent: Intent) => {
    if (intent === "freeform") {
      // Switch to freeform input mode and add an inviting prompt
      setMessages((prev) => [...prev, FREEFORM_PROMPT]);
      setPhase({ name: "freeform" });
      return;
    }
    const flow = HEARING_FLOWS[intent];
    if (flow.steps.length === 0) {
      // No hearing — synthesize text and call API immediately
      const synthesized = synthesizeIntentText(
        intent,
        {},
        lookupCustomerName(selectedCustomerId),
      );
      sendNewMessage(synthesized, intent, {});
      return;
    }
    setPhase({ name: "hearing", intent, flow, step: 0, answers: {} });
  };

  const handleChipPick = (value: string) => {
    if (phase.name !== "hearing") return;
    const { flow, step, answers, intent, originalText } = phase;
    const stepDef = flow.steps[step];
    const nextAnswers = { ...answers, [stepDef.id]: value };
    const nextStep = step + 1;

    if (nextStep >= flow.steps.length) {
      // Last chip → fire the API call
      if (originalText) {
        // The user typed real text earlier; use it as the user message
        continueWithExisting(intent, nextAnswers);
      } else {
        const synthesized = synthesizeIntentText(
          intent,
          nextAnswers,
          lookupCustomerName(selectedCustomerId),
        );
        sendNewMessage(synthesized, intent, nextAnswers);
      }
    } else {
      setPhase({ ...phase, step: nextStep, answers: nextAnswers });
    }
  };

  const handleSkipHearing = () => {
    if (phase.name !== "hearing") return;
    const { intent, originalText } = phase;
    if (originalText) {
      continueWithExisting(intent, {});
    } else {
      const synthesized = synthesizeIntentText(
        intent,
        {},
        lookupCustomerName(selectedCustomerId),
      );
      sendNewMessage(synthesized, intent, {});
    }
  };

  const handleUserSend = (text: string, images?: string[]) => {
    // Free-form / responded / freeform / loading → just send the text as-is
    // (loading: aborts the current request and switches to the new topic)
    if (phase.name === "freeform" || phase.name === "responded" || phase.name === "loading") {
      sendNewMessage(text, "freeform", {}, images);
      return;
    }
    // If images are attached, always go to freeform (skip hearing flow)
    if (images && images.length > 0) {
      sendNewMessage(text, "freeform", {}, images);
      return;
    }
    // intent-pick (or any other state with input enabled) — detect intent
    const intent = detectIntent(text);
    const flow = HEARING_FLOWS[intent];
    if (intent === "freeform" || flow.steps.length === 0) {
      sendNewMessage(text, intent, {});
      return;
    }
    // Show the typed text as a user message and start the hearing flow
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setPhase({
      name: "hearing",
      intent,
      flow,
      step: 0,
      answers: {},
      originalText: text,
    });
  };

  const handleNewConsultation = () => {
    setPhase({ name: "intent-pick" });
  };

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  const currentHearingStep =
    phase.name === "hearing" ? phase.flow.steps[phase.step] : null;
  const isInputDisabled = phase.name === "hearing";

  const placeholder =
    phase.name === "hearing"
      ? "上から選んでね"
      : phase.name === "loading"
        ? "別の話題を送ると切り替えられます"
        : phase.name === "freeform"
          ? "話しかけてもOK"
          : phase.name === "responded"
            ? "続けて相談…"
            : "選ぶか自由に書いてもOK";

  return (
    <div className="flex flex-col h-dvh">
      {stubMode && (
        <div className="px-4 pt-3">
          <div className="flex items-start gap-2 rounded-btn bg-amber/10 border border-amber/40 text-ink px-3 py-2 text-body-sm">
            <Info size={14} className="mt-0.5 text-amber shrink-0" />
            <div className="leading-relaxed">
              <span className="font-semibold">デモ応答モード</span>です。
              本物のさくらママ（Claude AI）を有効にするには、Vercel の
              環境変数に <code className="font-mono text-xs">ANTHROPIC_API_KEY</code> を設定して
              再デプロイしてください。
            </div>
          </div>
        </div>
      )}

      {/* Persistent top pill — always visible "今の相談相手: 田中さま" */}
      <div className="sticky top-0 px-4 pt-2 pb-2 bg-pearl/95 backdrop-blur-sm border-b border-pearl-soft z-30">
        <CustomerContextPill
          customers={customers}
          selectedId={selectedCustomerId}
          onSelect={setSelectedCustomerId}
        />
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative z-0"
      >
        {messages.map((m, i) => {
          const showPicker =
            m.role === "assistant" &&
            m.options &&
            m.options.length >= 2 &&
            !m.pickedOptionId;
          const pickedOpt =
            m.pickedOptionId && m.options
              ? m.options.find((o) => o.id === m.pickedOptionId)
              : undefined;

          // Show refine button when: assistant message has picked option,
          // is the latest assistant message, and isn't currently being refined
          const isLastAssistant =
            m.role === "assistant" &&
            i === messages.findLastIndex((x) => x.role === "assistant");
          const canRefine =
            m.role === "assistant" &&
            pickedOpt !== undefined &&
            isLastAssistant &&
            phase.name !== "loading";
          const isRefiningThis = refiningMessageIdx === i;

          return (
            <div key={i} className="space-y-2">
              {showPicker ? (
                <ReplyOptionPicker
                  options={m.options!}
                  onPick={(opt) => handleOptionPick(i, opt)}
                />
              ) : (
                <>
                  {pickedOpt && <PickedOptionBadge option={pickedOpt} />}
                  <MessageBubble message={m} />
                </>
              )}

              {/* Inline customer picker — shown below the very first greeting
                  as long as we're still at the intent-pick phase. This makes
                  the selection step unmissable for new chats. */}
              {i === 0 &&
                m === GREETING &&
                phase.name === "intent-pick" && (
                  <CustomerSelectInline
                    customers={customers}
                    helpCastNames={helpCastNames}
                    selectedId={selectedCustomerId}
                    onSelect={setSelectedCustomerId}
                  />
                )}

              {/* Refine direction picker (when user taps "ブラッシュアップ") */}
              {isRefiningThis && (
                <RefineDirectionPicker
                  onPick={(dir) => handleRefineDirectionPick(i, dir)}
                  onCancel={() => setRefiningMessageIdx(null)}
                />
              )}

              {!showPicker &&
                m.role === "assistant" &&
                i > 0 &&
                m !== FREEFORM_PROMPT && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <FeedbackButtons assistantContent={m.content} />
                    {canRefine && !isRefiningThis && (
                      <RefineTriggerButton
                        onClick={() => handleRefineTrigger(i)}
                      />
                    )}
                  </div>
                )}
            </div>
          );
        })}

        {phase.name === "intent-pick" && (
          <IntentPicker onPick={handleIntentPick} />
        )}

        {currentHearingStep && (
          <ChipOptions
            question={currentHearingStep.question}
            options={currentHearingStep.options}
            onPick={handleChipPick}
            onSkip={handleSkipHearing}
          />
        )}

        {phase.name === "loading" && (
          <div className="flex items-center gap-2 text-ink-mute text-body-sm pl-2">
            <Sparkles size={14} className="text-amethyst animate-shimmer" />
            さくらママが考え中…
          </div>
        )}

        {phase.name === "responded" && (
          <div className="flex flex-col items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleNewConsultation}
              className="flex items-center gap-1.5 px-5 h-10 rounded-full bg-pearl-warm border border-amethyst-border text-amethyst-dark text-label-md font-medium shadow-soft-card active:scale-95 hover:bg-amethyst-muted"
            >
              <Plus size={14} />
              新しい相談を始める
            </button>
            {messages.length > 3 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="flex items-center gap-1 text-label-sm text-ink-mute hover:text-rose underline underline-offset-2"
              >
                <Trash2 size={11} />
                履歴を全部クリアする
              </button>
            )}
          </div>
        )}
      </div>

      <ChatInput
        onSend={handleUserSend}
        disabled={isInputDisabled}
        placeholder={placeholder}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Synthesizes a natural-sounding user message from chip selections,
// so chip-only flows still produce a user-message with enough context
// for Claude (the API route also adds a [ヒアリング回答] section
// independently — this synthesis is what shows up as the cast's
// visible message in the chat).
// ═══════════════════════════════════════════════════════════════

function synthesizeIntentText(
  intent: Intent,
  answers: Record<string, string>,
  customerName: string | null,
): string {
  const subject = customerName ? `${customerName}さま` : "お客様";

  if (intent === "follow") {
    const purpose = answers.purpose ?? "メッセージ";
    const moodLabel: Record<string, string> = {
      盛り上がった: "前回は盛り上がった様子でした。",
      落ち着いた: "前回は落ち着いた感じでした。",
      元気なかった: "前回は少し元気がない様子でした。",
      覚えてない: "前回の様子は覚えていません。",
    };
    const toneLabel: Record<string, string> = {
      親しみやすく: "親しみやすいトーンで送りたいです。",
      丁寧に: "丁寧なトーンで送りたいです。",
      甘えた感じ: "少し甘えた感じで送りたいです。",
      お任せ: "トーンはお任せします。",
    };
    const mood = answers.mood ? (moodLabel[answers.mood] ?? "") : "";
    const tone = answers.tone ? (toneLabel[answers.tone] ?? "") : "";
    return `${subject}に「${purpose}」のLINEを送りたいです。${mood}${tone}`.trim();
  }

  if (intent === "serving") {
    const situation = answers.situation ?? "対応に困っています";
    return `今、${subject}との接客中です。状況は「${situation}」。どうしたらいい？`;
  }

  if (intent === "strategy") {
    const period = answers.period ?? "最近";
    const cause = answers.cause ?? "気になることがある";
    const frequency = answers.frequency ?? "未確認";
    return `営業戦略の相談です。${period}くらいから「${cause}」という状況です。連絡の頻度は「${frequency}」。アドバイスください。`;
  }

  return `${subject}について相談したいことがあります。`;
}
