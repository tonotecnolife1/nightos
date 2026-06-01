"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Check,
  Clock,
  Loader2,
  MessageCircle,
  Search,
  Sparkles,
  User,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MoreMenu } from "@/components/nightos/more-menu";
import { RuriMamaAvatar } from "@/components/nightos/ruri-mama-avatar";
import { SAKURA_MAMA_CHAT_NAME } from "@/lib/nightos/constants";
import {
  clearRoomPin,
  getRoomPin,
  setRoomPin,
  type RoomCustomerPin,
} from "@/lib/nightos/chat-room-pin-store";
import {
  getPinnedIds,
  subscribePins,
} from "@/lib/nightos/chat-pin-store";
import type { ChatAttachment, ChatMessage, ChatRoom } from "../types";
import { ChatComposer, type ComposerPayload } from "./chat-composer";
import { ChatKarteExtractModal } from "./chat-karte-extract-modal";
import { MessagePinSheet } from "./message-pin-sheet";
import {
  type AnchorRect,
  MessageActionSheet,
  PartialCopyModal,
} from "./message-action-sheet";
import {
  type MentionCustomer,
  detectCustomer,
  searchCustomers,
} from "../lib/customer-mention";
import { addChatNoteToKarteAction } from "../actions";

interface Props {
  room: ChatRoom;
  messages: ChatMessage[];
  currentCastId: string;
  currentCastName: string;
  customers: MentionCustomer[];
}

/** A pending "add this to 〈customer〉's karte?" suggestion under a message. */
interface KarteSuggestion {
  customerId: string;
  customerName: string;
  note: string;
  candidates: MentionCustomer[];
  status: "idle" | "saving" | "done";
  /** First image attachment, if the message shared a screenshot. */
  image: { url: string; mime: string } | null;
  /** How it was captured, for the success label. */
  doneVia?: "note" | "extract";
}

export function ChatRoomView({
  room,
  messages: initialMessages,
  currentCastId,
  currentCastName,
  customers,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [threadOpen, setThreadOpen] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [karteSuggestions, setKarteSuggestions] = useState<
    Record<string, KarteSuggestion>
  >({});
  const [pin, setPin] = useState<RoomCustomerPin | null>(null);
  const [pinPickerOpen, setPinPickerOpen] = useState(false);
  const [pinSheetFor, setPinSheetFor] = useState<ChatMessage | null>(null);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  // LINE風の長押しメニュー対象（canReply はスレッド内かどうかで切替）。
  // anchor は長押しした吹き出しの画面上の矩形（メニューの配置に使う）。
  const [actionFor, setActionFor] = useState<{
    msg: ChatMessage;
    canReply: boolean;
    anchor: AnchorRect;
  } | null>(null);
  const [partialCopyFor, setPartialCopyFor] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load the room's pinned customer (mechanism C) on mount / room change.
  useEffect(() => {
    setPin(getRoomPin(room.id));
  }, [room.id]);

  // Track which messages are kept (these collect in the キープ tab).
  useEffect(() => {
    const refresh = () => setPinnedIds(getPinnedIds());
    refresh();
    return subscribePins(refresh);
  }, []);

  const customerName = (id: string) =>
    customers.find((c) => c.id === id)?.name ?? "お客様";

  const addKarteSuggestion = (messageId: string, payload: ComposerPayload) => {
    if (payload.text.includes(`@${SAKURA_MAMA_CHAT_NAME}`)) return;

    const image =
      payload.attachments.find(
        (a) => a.mime?.startsWith("image/") && a.url,
      ) ?? null;
    const note =
      payload.text.replace(/@\S+\s?/g, "").trim() || payload.text.trim();

    // 対象顧客を特定: 明示メンション → 受動検出（本文の名前）→ ルームのピン。
    let customerId = payload.customerId ?? null;
    let candidates: MentionCustomer[] = [];
    if (!customerId && payload.text.trim()) {
      const detected = detectCustomer(customers, payload.text);
      if (detected) {
        customerId = detected.customer.id;
        candidates = detected.ambiguous;
      }
    }
    // ルームに顧客がピンされていれば、特定できなくてもその顧客を既定対象に。
    if (!customerId && pin) customerId = pin.customerId;
    if (!customerId) return; // 顧客が特定できない
    if (!note && !image) return; // 追加できる中身がない

    setKarteSuggestions((prev) => ({
      ...prev,
      [messageId]: {
        customerId: customerId!,
        customerName: customerName(customerId!),
        note,
        candidates,
        status: "idle",
        image: image ? { url: image.url, mime: image.mime } : null,
      },
    }));
  };

  const confirmKarte = async (messageId: string) => {
    const s = karteSuggestions[messageId];
    if (!s || s.status !== "idle") return;
    setKarteSuggestions((prev) => ({
      ...prev,
      [messageId]: { ...s, status: "saving" },
    }));
    const res = await addChatNoteToKarteAction({
      customerId: s.customerId,
      note: s.note,
    });
    setKarteSuggestions((prev) => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        status: res.ok ? "done" : "idle",
        doneVia: "note",
      },
    }));
  };

  const changeKarteTarget = (messageId: string, c: MentionCustomer) =>
    setKarteSuggestions((prev) => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        customerId: c.id,
        customerName: c.name,
      },
    }));

  const dismissKarte = (messageId: string) =>
    setKarteSuggestions((prev) => {
      const next = { ...prev };
      delete next[messageId];
      return next;
    });

  // LINEスクショ抽出モーダル（対象メッセージ）
  const [extractFor, setExtractFor] = useState<string | null>(null);
  const extractSuggestion = extractFor ? karteSuggestions[extractFor] : null;

  const finishExtract = (messageId: string) => {
    setExtractFor(null);
    setKarteSuggestions((prev) =>
      prev[messageId]
        ? {
            ...prev,
            [messageId]: {
              ...prev[messageId],
              status: "done",
              doneVia: "extract",
            },
          }
        : prev,
    );
  };

  // ── 機構C: ルームへの顧客ピン留め ───────────────────────────
  const pinCustomer = (c: MentionCustomer) => {
    setPin(setRoomPin(room.id, { id: c.id, name: c.name }));
    setPinPickerOpen(false);
  };
  const unpinCustomer = () => {
    clearRoomPin(room.id);
    setPin(null);
  };

  const patchMessage = (id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const startEdit = (msg: ChatMessage) => {
    setEditingId(msg.id);
    setEditDraft(msg.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
  };

  const commitEdit = async (id: string) => {
    const next = editDraft.trim();
    if (!next) return;
    const original = messages.find((m) => m.id === id);
    if (!original || next === original.content) {
      cancelEdit();
      return;
    }
    // Optimistic update stays even if the API doesn't have the row yet
    // (e.g. mock-only messages, tables not seeded). We only roll back
    // on a 403 — the server explicitly said the current cast isn't
    // allowed to edit this message.
    patchMessage(id, { content: next, edited_at: new Date().toISOString() });
    cancelEdit();
    try {
      const res = await fetch(`/api/team-chat/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      if (res.status === 403) {
        patchMessage(id, {
          content: original.content,
          edited_at: original.edited_at ?? null,
        });
      }
    } catch {
      // network-level failure — keep the optimistic edit
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このメッセージを取り消しますか？")) return;
    const original = messages.find((m) => m.id === id);
    if (!original) return;
    patchMessage(id, { deleted_at: new Date().toISOString() });
    try {
      const res = await fetch(`/api/team-chat/messages/${id}`, {
        method: "DELETE",
      });
      if (res.status === 403) {
        patchMessage(id, { deleted_at: original.deleted_at ?? null });
      }
    } catch {
      // network-level failure — keep the optimistic delete
    }
  };

  const handleCopy = (msg: ChatMessage) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(msg.content)
      .then(() => {
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 1500);
      })
      .catch(() => {});
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // When the user starts editing, scroll the edit textarea into view —
  // otherwise the mobile keyboard can cover the inline editor and the
  // screen only shows the "メッセージを編集中" notice.
  useEffect(() => {
    if (!editingId) return;
    // Wait a tick so the textarea has rendered and React DOM is flushed.
    const t = setTimeout(() => {
      const el = document.getElementById(`msg-${editingId}`);
      if (!el) return;
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      const textarea = el.querySelector("textarea");
      if (textarea instanceof HTMLTextAreaElement) textarea.focus();
    }, 60);
    return () => clearTimeout(t);
  }, [editingId]);

  const displayName =
    room.type === "channel"
      ? room.name!
      : room.member_names
          .filter((_, i) => room.member_ids[i] !== currentCastId)
          .join(", ");

  const memberCount = room.member_ids.length;
  const isCoaching = room.type === "coaching";

  const COACHING_CHIPS = [
    "✨ よかった点：",
    "📝 改善点：",
    "🎯 今週の振り返り：",
    "💬 目標確認：",
  ];

  // Top-level messages (not thread replies)
  const topMessages = messages.filter((m) => !m.thread_parent_id);
  const threadReplies = (parentId: string) =>
    messages.filter((m) => m.thread_parent_id === parentId);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isSearching = searchOpen && normalizedQuery.length > 0;
  const visibleTopMessages = isSearching
    ? topMessages.filter((m) =>
        m.content.toLowerCase().includes(normalizedQuery) ||
        m.sender_name.toLowerCase().includes(normalizedQuery) ||
        threadReplies(m.id).some((r) =>
          r.content.toLowerCase().includes(normalizedQuery),
        ),
      )
    : topMessages;

  const handleSend = async (rawPayload: ComposerPayload) => {
    // ルームに顧客がピンされていれば、明示メンションが無くても既定の対象にする。
    const payload: ComposerPayload =
      rawPayload.customerId || !pin
        ? rawPayload
        : { ...rawPayload, customerId: pin.customerId };
    const text = payload.text.trim();
    const attachments = payload.attachments;
    if ((!text && attachments.length === 0) || sending) return;

    setSending(true);
    setInput("");

    const mentionsAi = text.includes("@さくらママ");
    const targetId = threadOpen ?? null;
    const tempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const newMsg: ChatMessage = {
      id: tempId,
      room_id: room.id,
      sender_id: currentCastId,
      sender_name: currentCastName,
      content: text,
      attachments,
      customer_id: payload.customerId,
      thread_parent_id: targetId,
      reply_count: 0,
      mentions_ai: mentionsAi,
      is_bot: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => {
      const updated = [...prev, newMsg];
      // Update parent's reply_count
      if (targetId) {
        return updated.map((m) =>
          m.id === targetId ? { ...m, reply_count: m.reply_count + 1 } : m,
        );
      }
      return updated;
    });

    // Try to persist to Supabase. On failure, keep the optimistic row so
    // the conversation still reads naturally in mock/offline mode.
    let persistedId = tempId;
    try {
      const res = await fetch("/api/team-chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          content: text,
          threadParentId: targetId ?? undefined,
          attachments: attachments.length > 0 ? attachments : undefined,
          customerId: payload.customerId ?? undefined,
        }),
      });
      if (res.ok) {
        const { message } = await res.json();
        if (message?.id) {
          persistedId = message.id;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? { ...m, id: message.id, created_at: message.created_at }
                : m,
            ),
          );
        }
      }
    } catch {
      // keep optimistic row
    }

    // Offer to capture this into the customer's 逆カルテ (mechanism A + B).
    if (!mentionsAi) addKarteSuggestion(persistedId, payload);

    // If @さくらママ is mentioned, get AI response
    if (mentionsAi) {
      try {
        const res = await fetch("/api/chat-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.replace(/@さくらママ\s*/g, ""),
            roomId: room.id,
            castId: currentCastId,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { reply: string };
          const aiMsg: ChatMessage = {
            id: `msg_ai_${Date.now()}`,
            room_id: room.id,
            sender_id: "sakura_mama",
            sender_name: SAKURA_MAMA_CHAT_NAME,
            content: data.reply,
            thread_parent_id: targetId ?? newMsg.id,
            reply_count: 0,
            mentions_ai: false,
            is_bot: true,
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => {
            const updated = [...prev, aiMsg];
            const parentId = targetId ?? newMsg.id;
            return updated.map((m) =>
              m.id === parentId ? { ...m, reply_count: m.reply_count + 1 } : m,
            );
          });
        }
      } catch {
        // silently fail
      }
    }

    setSending(false);
  };

  // Thread view
  const activeThread = threadOpen
    ? messages.find((m) => m.id === threadOpen)
    : null;
  const activeThreadReplies = threadOpen ? threadReplies(threadOpen) : [];

  return (
    <div className="flex flex-col h-dvh">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-ink/[0.06] bg-pearl z-50 shrink-0">
        <Link
          href="/cast/chat"
          className="flex items-center gap-1 text-ink-soft shrink-0"
        >
          <ArrowLeft size={18} />
          <span className="text-label-sm">戻る</span>
        </Link>
        <div className="flex-1 text-center">
          <div className="text-body-md font-medium text-ink">
            {displayName}
          </div>
          <div className="text-label-sm text-ink-mute">{memberCount}人</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSearchOpen((v) => {
                const next = !v;
                if (!next) setSearchQuery("");
                return next;
              });
            }}
            aria-label={searchOpen ? "検索を閉じる" : "検索"}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-pearl-soft",
              searchOpen && "text-gold-deep bg-champagne-soft/60",
            )}
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
          <MoreMenu />
        </div>

      </header>

      {/* 機構C: ルームにピンした顧客のバー（カルテ導線 + 自動ひも付け） */}
      <PinBar
        pin={pin}
        pickerOpen={pinPickerOpen}
        customers={customers}
        onOpenPicker={() => setPinPickerOpen(true)}
        onClosePicker={() => setPinPickerOpen(false)}
        onPick={pinCustomer}
        onUnpin={unpinCustomer}
      />

      {searchOpen && (
        <div className="shrink-0 px-4 py-2 border-b border-ink/[0.06] bg-pearl-soft/40">
          <label className="flex items-center gap-2 rounded-2xl border border-ink/[0.08] bg-pearl-light px-3 py-2">
            <Search size={14} className="text-ink-mute shrink-0" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="メッセージを検索..."
              className="flex-1 bg-transparent text-body-sm text-ink placeholder:text-ink-mute focus:outline-none"
              style={{ fontSize: "16px" }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-ink-mute shrink-0"
                aria-label="検索をクリア"
              >
                <X size={14} />
              </button>
            )}
          </label>
          {isSearching && (
            <div className="mt-1.5 text-[11px] text-ink-mute">
              {visibleTopMessages.length}件のスレッドが一致
            </div>
          )}
        </div>
      )}

      {/* Coaching banner */}
      {isCoaching && (
        <div className="flex items-center gap-2 px-4 py-2 bg-success/5 border-b border-success/20">
          <BookOpen size={13} className="text-success shrink-0" />
          <p className="text-[11px] text-success">
            指導ノート — ここでのやり取りは育成記録として残ります
          </p>
        </div>
      )}

      {/* Thread drawer */}
      {activeThread && (
        <div className="fixed inset-0 z-50 flex flex-col bg-pearl">
          {/* Thread header */}
          <header className="flex items-center gap-3 px-4 py-3 border-b border-ink/[0.06] shrink-0">
            <button
              type="button"
              onClick={() => setThreadOpen(null)}
              className="flex items-center gap-1 text-ink-soft"
            >
              <ArrowLeft size={18} />
              <span className="text-label-sm">戻る</span>
            </button>
            <div className="flex-1 text-center text-body-md font-medium text-ink">
              スレッド
            </div>
            <div className="w-14" />
          </header>

          {/* Thread messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            <MessageRow
              msg={activeThread}
              currentCastId={currentCastId}
              isCoaching={isCoaching}
              showAvatar={true}
              showName={true}
              isPinned={pinnedIds.has(activeThread.id)}
              onLongPress={(anchor) =>
                setActionFor({ msg: activeThread, canReply: false, anchor })
              }
              editingId={editingId}
              editDraft={editDraft}
              setEditDraft={setEditDraft}
              onCancelEdit={cancelEdit}
              onCommitEdit={commitEdit}
            />
            {activeThreadReplies.length > 0 && (
              <div className="text-label-sm text-ink-mute pl-2">
                {activeThreadReplies.length} 件の返信
              </div>
            )}
            {activeThreadReplies.map((m, idx) => {
              const prev = activeThreadReplies[idx - 1];
              const isGrouped = !!prev && prev.sender_id === m.sender_id && !prev.deleted_at;
              return (
                <MessageRow
                  key={m.id}
                  msg={m}
                  currentCastId={currentCastId}
                  isCoaching={isCoaching}
                  showAvatar={!isGrouped}
                  showName={!isGrouped}
                  isPinned={pinnedIds.has(m.id)}
                  onLongPress={(anchor) =>
                    setActionFor({ msg: m, canReply: false, anchor })
                  }
                  editingId={editingId}
                  editDraft={editDraft}
                  setEditDraft={setEditDraft}
                  onCancelEdit={cancelEdit}
                  onCommitEdit={commitEdit}
                />
              );
            })}
          </div>

          {/* Thread input */}
          {/* Thread input — hidden while editing to avoid double composer. */}
          {editingId ? (
            <div className="shrink-0 border-t border-ink/[0.06] bg-pearl-soft/60 px-4 py-3 pb-safe text-center">
              <p className="text-label-sm text-ink-soft">
                メッセージを編集中...
              </p>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-[11px] text-gold-deep underline mt-0.5"
              >
                編集をやめる
              </button>
            </div>
          ) : (
            <div className="shrink-0 border-t border-ink/[0.06] bg-pearl px-4 py-3 pb-safe">
              <ChatComposer
                value={input}
                onChange={setInput}
                onSend={handleSend}
                sending={sending}
                customers={customers}
                storeId={room.store_id}
                roomId={room.id}
              />
            </div>
          )}
        </div>
      )}

      {/* Main message list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {!isSearching && topMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-champagne-soft/60 flex items-center justify-center">
              <MessageCircle size={24} className="text-gold-deep" />
            </div>
            <div>
              <p className="text-body-md font-medium text-ink">
                {room.type === "dm"
                  ? `${displayName}さんへ最初のメッセージを送りましょう`
                  : room.type === "coaching"
                  ? "指導ノートを始めましょう"
                  : `#${displayName} の最初のメッセージを送りましょう`}
              </p>
              <p className="text-body-sm text-ink-mute mt-1">
                {room.type === "coaching"
                  ? "目標・フィードバック・アドバイスをここに残せます"
                  : "メンバー全員に届きます"}
              </p>
            </div>
          </div>
        )}
        {!isSearching && topMessages.length > 0 && (
          <div className="text-center text-label-sm text-ink-mute py-4">
            これ以上メッセージはありません
          </div>
        )}
        {isSearching && visibleTopMessages.length === 0 && (
          <div className="text-center text-label-sm text-ink-mute py-8">
            一致するメッセージはありません
          </div>
        )}

        {visibleTopMessages.map((msg, idx) => {
          const prev = visibleTopMessages[idx - 1];
          const isGrouped = !!prev && prev.sender_id === msg.sender_id && !prev.deleted_at;
          const replies = threadReplies(msg.id);
          const isMe = msg.sender_id === currentCastId;
          return (
            <div key={msg.id}>
              <MessageRow
                msg={msg}
                currentCastId={currentCastId}
                isCoaching={isCoaching}
                showAvatar={!isGrouped}
                showName={!isGrouped}
                isPinned={pinnedIds.has(msg.id)}
                onLongPress={(anchor) =>
                  setActionFor({ msg, canReply: true, anchor })
                }
                highlight={isSearching ? normalizedQuery : undefined}
                editingId={editingId}
                editDraft={editDraft}
                setEditDraft={setEditDraft}
                onCancelEdit={cancelEdit}
                onCommitEdit={commitEdit}
              />
              {/* Thread preview */}
              {(msg.reply_count > 0 || replies.length > 0) && (
                <button
                  type="button"
                  onClick={() => setThreadOpen(msg.id)}
                  className={cn(
                    "mt-1 mb-2 flex items-center gap-2 text-label-sm text-gold-deep hover:underline px-2",
                    isMe ? "flex-row-reverse mr-2" : "ml-12",
                  )}
                >
                  <div className="flex -space-x-1.5">
                    {replies
                      .slice(0, 3)
                      .map((r) =>
                        r.is_bot ? (
                          <RuriMamaAvatar key={r.id} size={20} />
                        ) : (
                          <div
                            key={r.id}
                            className="w-5 h-5 rounded-full bg-pearl-soft border border-ink/[0.06] text-[8px] flex items-center justify-center text-ink-soft font-medium"
                          >
                            {r.sender_name.charAt(0)}
                          </div>
                        ),
                      )}
                  </div>
                  <span>
                    {replies.length || msg.reply_count}件の返信
                  </span>
                </button>
              )}
              {karteSuggestions[msg.id] && (
                <KarteChip
                  suggestion={karteSuggestions[msg.id]}
                  isMe={isMe}
                  onConfirm={() => confirmKarte(msg.id)}
                  onDismiss={() => dismissKarte(msg.id)}
                  onPick={(c) => changeKarteTarget(msg.id, c)}
                  onExtract={() => setExtractFor(msg.id)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Coaching quick-insert chips */}
      {isCoaching && (
        <div className="shrink-0 border-t border-ink/[0.06] bg-pearl px-4 pt-2 flex gap-1.5 overflow-x-auto">
          {COACHING_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setInput((prev) => (prev ? prev + "\n" + chip : chip))}
              className="shrink-0 px-2.5 py-1 rounded-full bg-success/10 text-success text-[11px] font-medium border border-success/20 hover:bg-success/20 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input bar — hidden while editing so the inline edit box isn't
          competing with a live composer. */}
      {editingId ? (
        <div className="shrink-0 border-t border-ink/[0.06] bg-pearl-soft/60 px-4 py-3 pb-safe text-center">
          <p className="text-label-sm text-ink-soft">
            メッセージを編集中...
          </p>
          <button
            type="button"
            onClick={cancelEdit}
            className="text-[11px] text-gold-deep underline mt-0.5"
          >
            編集をやめる
          </button>
        </div>
      ) : (
        <div className="shrink-0 border-t border-ink/[0.06] bg-pearl px-4 py-3 pb-safe">
          <ChatComposer
            value={input}
            onChange={setInput}
            onSend={handleSend}
            sending={sending}
            customers={customers}
            storeId={room.store_id}
            roomId={room.id}
          />
          <p className="text-[10px] text-ink-mute mt-1.5 pl-1">
画像は貼り付け・ドラッグでも添付可 / @さくらママ で相談・@お客様名 でカルテ連携 / 吹き出しを長押しでメニュー
          </p>
        </div>
      )}

      {extractFor && extractSuggestion?.image && (
        <ChatKarteExtractModal
          customerId={extractSuggestion.customerId}
          customerName={extractSuggestion.customerName}
          castId={currentCastId}
          image={extractSuggestion.image}
          onClose={() => setExtractFor(null)}
          onApplied={() => finishExtract(extractFor)}
        />
      )}

      {/* 吹き出し長押し → LINE風アクションメニュー */}
      {actionFor && (
        <MessageActionSheet
          anchorRect={actionFor.anchor}
          hasText={actionFor.msg.content.trim().length > 0}
          isPinned={pinnedIds.has(actionFor.msg.id)}
          canReply={actionFor.canReply}
          canEdit={
            actionFor.msg.sender_id === currentCastId &&
            !actionFor.msg.is_bot &&
            !actionFor.msg.deleted_at
          }
          onReply={() => {
            setThreadOpen(actionFor.msg.id);
            setActionFor(null);
          }}
          onCopyAll={() => {
            handleCopy(actionFor.msg);
            setActionFor(null);
          }}
          onPartialCopy={() => {
            setPartialCopyFor(actionFor.msg.content);
            setActionFor(null);
          }}
          onPin={() => {
            setPinSheetFor(actionFor.msg);
            setActionFor(null);
          }}
          onEdit={() => {
            startEdit(actionFor.msg);
            setActionFor(null);
          }}
          onDelete={() => {
            const id = actionFor.msg.id;
            setActionFor(null);
            handleDelete(id);
          }}
          onClose={() => setActionFor(null)}
        />
      )}

      {partialCopyFor !== null && (
        <PartialCopyModal
          content={partialCopyFor}
          onClose={() => setPartialCopyFor(null)}
        />
      )}

      {/* キープ / 顧客紐づけ / メモ */}
      {pinSheetFor && (
        <MessagePinSheet
          message={pinSheetFor}
          roomId={room.id}
          roomName={displayName}
          customers={customers}
          onClose={() => setPinSheetFor(null)}
          onChanged={() => setPinnedIds(getPinnedIds())}
        />
      )}

      {copiedToast && (
        <div className="fixed inset-x-0 bottom-24 z-[90] flex justify-center pointer-events-none">
          <div className="inline-flex items-center gap-1.5 rounded-pill bg-ink/85 text-pearl-light px-4 py-2 text-body-sm shadow-luxe">
            <Check size={13} />
            コピーしました
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════ Message Row ═══════════════

interface MessageRowProps {
  msg: ChatMessage;
  currentCastId: string;
  isCoaching?: boolean;
  showAvatar: boolean;
  showName: boolean;
  /** Whether this message is currently kept (キープ). */
  isPinned?: boolean;
  /** Long-press (touch) / right-click (desktop) opens the LINE風 action menu,
   *  anchored to the bubble's on-screen rect. */
  onLongPress?: (anchor: AnchorRect) => void;
  /** Lowercased search query to highlight; if set, matching substrings get wrapped. */
  highlight?: string;
  editingId: string | null;
  editDraft: string;
  setEditDraft: (v: string) => void;
  onCancelEdit: () => void;
  onCommitEdit: (id: string) => void;
}

function MessageRow({
  msg,
  currentCastId,
  isCoaching,
  showAvatar,
  showName,
  isPinned,
  onLongPress,
  highlight,
  editingId,
  editDraft,
  setEditDraft,
  onCancelEdit,
  onCommitEdit,
}: MessageRowProps) {
  const isMe = msg.sender_id === currentCastId;
  const time = new Date(msg.created_at);
  const timeStr = `${time.getHours()}:${String(time.getMinutes()).padStart(2, "0")}`;
  const isEditing = editingId === msg.id;
  const isDeleted = !!msg.deleted_at;

  const bubbleRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fireLongPress = () => {
    if (!onLongPress || !bubbleRef.current) return;
    const r = bubbleRef.current.getBoundingClientRect();
    onLongPress({ top: r.top, bottom: r.bottom, left: r.left, width: r.width });
  };
  const handleTouchStart = () => {
    if (!onLongPress || isDeleted) return;
    longPressTimer.current = setTimeout(fireLongPress, 500);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const avatarEl = msg.is_bot ? (
    <RuriMamaAvatar size={32} />
  ) : (
    <div
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-medium",
        msg.sender_role === "mama"
          ? "bg-champagne-soft text-ink"
          : msg.sender_role === "oneesan"
            ? "bg-champagne-soft/60 text-wine-deep"
            : "bg-pearl-soft text-ink-soft",
      )}
    >
      {msg.sender_name.charAt(0)}
    </div>
  );

  return (
    <div
      id={`msg-${msg.id}`}
      className={cn(
        "flex items-end gap-2 px-2",
        isMe ? "flex-row-reverse" : "flex-row",
        showAvatar ? "mt-3" : "mt-0.5",
      )}
    >
      {/* Avatar — others only */}
      {!isMe && (
        <div className="shrink-0 self-end mb-1 w-8">
          {showAvatar ? avatarEl : null}
        </div>
      )}

      {/* Bubble + meta */}
      <div
        ref={bubbleRef}
        className={cn(
          "flex flex-col max-w-[72%]",
          isMe ? "items-end" : "items-start",
          // 長押しメニューを使うため、吹き出し自体の選択/iOSコールアウトは抑止。
          // 文章の部分コピーはアクションメニューの「部分コピー」で行う。
          !isEditing && "select-none",
        )}
        style={!isEditing ? { WebkitTouchCallout: "none" } : undefined}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
        onContextMenu={(e) => {
          if (!onLongPress || isDeleted) return;
          e.preventDefault();
          fireLongPress();
        }}
      >
        {/* Sender name (others, first in group) */}
        {!isMe && showName && (
          <div className="flex items-center gap-1.5 mb-0.5 px-1">
            <span className="text-[11px] font-medium text-ink-soft">
              {msg.sender_name}
            </span>
            {msg.is_bot && (
              <span className="px-1 py-0.5 rounded text-[9px] font-medium bg-champagne-soft/60 text-gold-deep">
                AI
              </span>
            )}
            {msg.sender_role === "mama" && !msg.is_bot && (
              <span className="px-1 py-0.5 rounded text-[9px] font-medium bg-champagne-dark text-ink">
                店長
              </span>
            )}
            {isCoaching && !msg.is_bot && (
              <span className="px-1 py-0.5 rounded text-[9px] font-medium bg-success/10 text-success border border-success/20">
                指導
              </span>
            )}
          </div>
        )}

        {isDeleted ? (
          <div className="text-body-sm text-ink-mute italic px-3 py-2">
            （メッセージは取り消されました）
          </div>
        ) : isEditing ? (
          <div className="w-full space-y-1.5">
            <textarea
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  onCommitEdit(msg.id);
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  onCancelEdit();
                }
              }}
              autoFocus
              rows={2}
              className="w-full resize-none rounded-2xl border border-ink/[0.08] bg-pearl-light px-3 py-2 text-body-md text-ink focus:outline-none focus:border-wine-deep"
              style={{ fontSize: "16px" }}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onCommitEdit(msg.id)}
                disabled={!editDraft.trim()}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm font-medium",
                  editDraft.trim()
                    ? "bg-wine-deep text-pearl-light"
                    : "bg-pearl-soft text-ink-mute",
                )}
              >
                <Check size={12} />
                保存
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm text-ink-soft hover:bg-pearl-soft"
              >
                <X size={12} />
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          /* Bubble */
          <div className={cn("flex flex-col gap-1.5", isMe ? "items-end" : "items-start")}>
            {/* キープ済みタグ（吹き出しの上に明示） */}
            {isPinned && (
              <span className="inline-flex items-center gap-1 rounded-pill bg-champagne-soft/70 border border-gold/45 px-2 py-0.5 text-[10px] font-medium text-wine-deep shadow-soft">
                <Bookmark size={10} className="text-gold-deep" />
                キープ済み
              </span>
            )}
            {msg.content.trim().length > 0 && (
              <div
                className={cn(
                  "px-3.5 py-2 text-body-md leading-relaxed whitespace-pre-wrap break-words",
                  isMe
                    ? "bg-wine-deep text-pearl-light rounded-2xl rounded-br-sm shadow-luxe"
                    : "bg-pearl-light border border-ink/[0.08] text-ink rounded-2xl rounded-bl-sm shadow-soft",
                  // キープ済みはシャンパンゴールドの枠線で強調（塗りには使わない）
                  isPinned && "ring-[1.5px] ring-gold/70 ring-offset-2 ring-offset-pearl",
                )}
              >
                {renderContentParts(msg.content, highlight)}
              </div>
            )}
            {msg.attachments && msg.attachments.length > 0 && (
              <AttachmentGrid attachments={msg.attachments} />
            )}
          </div>
        )}

        {/* Timestamp + status row */}
        {!isDeleted && !isEditing && (
          <div className={cn("flex items-center gap-1.5 mt-0.5 px-1", isMe ? "flex-row-reverse" : "flex-row")}>
            <span className="text-[10px] text-ink-mute">{timeStr}</span>
            {msg.id.startsWith("tmp_") && (
              <Clock size={9} className="text-ink-mute animate-pulse" />
            )}
            {msg.edited_at && (
              <span className="text-[9px] text-ink-mute">編集済み</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════ Content renderer ═══════════════

/**
 * Split content into renderable pieces, giving the `@さくらママ` mention
 * its chip styling and (optionally) wrapping search matches in a
 * highlight <mark>.
 */
function renderContentParts(content: string, highlight?: string) {
  const mentionRe = /(@さくらママ)/g;
  const chunks = content.split(mentionRe);
  return chunks.map((chunk, i) => {
    if (chunk === "@さくらママ") {
      return (
        <span
          key={i}
          className="px-1 py-0.5 rounded bg-champagne-soft/60 text-gold-deep font-medium text-body-sm"
        >
          @さくらママ
        </span>
      );
    }
    if (!highlight) return <span key={i}>{chunk}</span>;
    return <HighlightedText key={i} text={chunk} query={highlight} />;
  });
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const out: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  while (cursor < text.length) {
    const idx = lower.indexOf(q, cursor);
    if (idx === -1) {
      out.push(<span key={key++}>{text.slice(cursor)}</span>);
      break;
    }
    if (idx > cursor) {
      out.push(<span key={key++}>{text.slice(cursor, idx)}</span>);
    }
    out.push(
      <mark
        key={key++}
        className="bg-champagne-dark/40 text-ink rounded-sm px-0.5"
      >
        {text.slice(idx, idx + q.length)}
      </mark>,
    );
    cursor = idx + q.length;
  }
  return <>{out}</>;
}

// ═══════════════ 機構C: 顧客ピンバー ═══════════════

function PinBar({
  pin,
  pickerOpen,
  customers,
  onOpenPicker,
  onClosePicker,
  onPick,
  onUnpin,
}: {
  pin: RoomCustomerPin | null;
  pickerOpen: boolean;
  customers: MentionCustomer[];
  onOpenPicker: () => void;
  onClosePicker: () => void;
  onPick: (c: MentionCustomer) => void;
  onUnpin: () => void;
}) {
  const [query, setQuery] = useState("");
  const results = searchCustomers(customers, query, 8);

  if (pin) {
    return (
      <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-gold/20 bg-champagne-soft/40">
        <span className="w-6 h-6 rounded-full bg-champagne-soft border border-gold/30 flex items-center justify-center text-[11px] font-medium text-wine-deep shrink-0">
          {pin.customerName.charAt(0)}
        </span>
        <span className="text-[12px] text-ink leading-snug">
          このトークは{" "}
          <span className="font-medium text-wine-deep">{pin.customerName}</span>{" "}
          さんの話題
        </span>
        <Link
          href={`/cast/customers/${pin.customerId}`}
          className="ml-auto inline-flex items-center gap-1 rounded-pill border border-gold/40 px-2.5 py-1 text-[11px] text-wine-deep font-medium hover:bg-champagne-soft/60"
        >
          <User size={11} />
          カルテ
        </Link>
        <button
          type="button"
          onClick={onUnpin}
          className="w-6 h-6 rounded-full flex items-center justify-center text-ink-mute hover:bg-pearl-soft shrink-0"
          aria-label="ピンを外す"
          title="ピンを外す"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  if (!pickerOpen) {
    if (customers.length === 0) return null;
    return (
      <div className="shrink-0 px-4 py-1.5 border-b border-ink/[0.06] bg-pearl-soft/30">
        <button
          type="button"
          onClick={onOpenPicker}
          className="inline-flex items-center gap-1 text-[11px] text-ink-soft hover:text-wine-deep"
        >
          <UserPlus size={12} className="text-gold-deep" />
          この相談を顧客に紐づける
        </button>
      </div>
    );
  }

  return (
    <div className="shrink-0 px-4 py-2 border-b border-gold/20 bg-champagne-soft/40 space-y-2">
      <div className="flex items-center gap-2">
        <label className="flex-1 flex items-center gap-2 rounded-2xl border border-ink/[0.08] bg-pearl-light px-3 py-1.5">
          <Search size={13} className="text-ink-mute shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="顧客を検索してピン..."
            className="flex-1 bg-transparent text-body-sm text-ink placeholder:text-ink-mute focus:outline-none"
            style={{ fontSize: "16px" }}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            onClosePicker();
          }}
          className="text-[11px] text-ink-soft shrink-0"
        >
          やめる
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {results.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onPick(c)}
            className="inline-flex items-center gap-1.5 rounded-pill border border-ink/[0.12] bg-pearl-light px-2.5 py-1 text-[12px] text-ink hover:border-gold/40"
          >
            <span className="w-5 h-5 rounded-full bg-champagne-soft/60 flex items-center justify-center text-[10px] font-medium text-wine-deep">
              {c.name.charAt(0)}
            </span>
            {c.name}
            {c.category === "vip" && (
              <span className="text-[9px] px-1 rounded bg-wine/10 text-wine-deep font-medium">
                VIP
              </span>
            )}
          </button>
        ))}
        {results.length === 0 && (
          <span className="text-[11px] text-ink-mute py-1">
            一致する顧客がいません
          </span>
        )}
      </div>
    </div>
  );
}

// ═══════════════ 逆カルテ取り込みチップ ═══════════════

function KarteChip({
  suggestion: s,
  isMe,
  onConfirm,
  onDismiss,
  onPick,
  onExtract,
}: {
  suggestion: KarteSuggestion;
  isMe: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
  onPick: (c: MentionCustomer) => void;
  onExtract: () => void;
}) {
  if (s.status === "done") {
    return (
      <div
        className={cn(
          "mt-1 mb-2 flex px-2",
          isMe ? "justify-end" : "justify-start ml-12",
        )}
      >
        <div className="inline-flex items-center gap-1.5 rounded-pill bg-success/10 border border-success/20 px-3 py-1.5 text-[12px] text-success font-medium">
          <Check size={12} />
          {s.customerName}さんのカルテに
          {s.doneVia === "extract" ? "反映しました" : "追加しました"}
        </div>
      </div>
    );
  }

  const hasImage = !!s.image;
  const hasNote = s.note.trim().length > 0;
  const alts = s.candidates.filter((c) => c.id !== s.customerId).slice(0, 3);

  return (
    <div
      className={cn(
        "mt-1 mb-2 flex px-2",
        isMe ? "justify-end" : "justify-start ml-12",
      )}
    >
      <div className="inline-flex flex-col gap-1.5 rounded-card bg-champagne-soft/40 border border-gold/25 px-3 py-2 max-w-[88%]">
        <div className="flex items-center gap-2">
          <UserPlus size={13} className="text-gold-deep shrink-0" />
          <span className="text-[12px] text-ink leading-snug">
            <span className="font-medium text-wine-deep">{s.customerName}</span>
            さんのカルテに{hasImage ? "反映しますか？" : "追加しますか？"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {hasImage && (
            <button
              type="button"
              onClick={onExtract}
              className="inline-flex items-center gap-1 rounded-pill bg-wine-deep text-pearl-light px-3 py-1 text-[12px] font-medium"
            >
              <Sparkles size={11} />
              スクショから反映
            </button>
          )}
          {hasNote && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={s.status === "saving"}
              className={cn(
                "inline-flex items-center gap-1 rounded-pill px-3 py-1 text-[12px] font-medium disabled:opacity-50",
                hasImage
                  ? "border border-gold/40 text-wine-deep"
                  : "bg-wine-deep text-pearl-light",
              )}
            >
              {s.status === "saving" ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Check size={11} />
              )}
              メモ追加
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-pill px-2.5 py-1 text-[12px] text-ink-soft hover:bg-pearl-soft"
          >
            あとで
          </button>
        </div>
        {alts.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            <span className="text-[10px] text-ink-mute">別の人:</span>
            {alts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onPick(c)}
                className="rounded-pill border border-ink/[0.15] px-2 py-0.5 text-[11px] text-ink-soft hover:border-gold/40"
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════ Attachment grid + lightbox ═══════════════

function AttachmentGrid({ attachments }: { attachments: ChatAttachment[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const images = attachments.filter((a) => a.url);
  if (images.length === 0) return null;

  return (
    <>
      <div
        className={cn(
          "grid gap-1.5 max-w-[240px]",
          images.length === 1 ? "grid-cols-1" : "grid-cols-2",
        )}
      >
        {images.map((a, i) => (
          <button
            key={`${a.url}_${i}`}
            type="button"
            onClick={() => setLightbox(a.url)}
            className="block overflow-hidden rounded-xl border border-ink/[0.08] bg-pearl-soft"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.url}
              alt="共有画像"
              className="w-full h-auto max-h-64 object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-pearl/20 text-pearl-light flex items-center justify-center"
            aria-label="閉じる"
          >
            <X size={18} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="共有画像"
            className="max-w-full max-h-full rounded-2xl object-contain"
          />
        </div>
      )}
    </>
  );
}
