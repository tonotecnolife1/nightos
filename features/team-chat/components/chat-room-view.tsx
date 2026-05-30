"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock,
  Copy,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MoreMenu } from "@/components/nightos/more-menu";
import { RuriMamaAvatar } from "@/components/nightos/ruri-mama-avatar";
import { SAKURA_MAMA_CHAT_NAME } from "@/lib/nightos/constants";
import type { ChatMessage, ChatRoom } from "../types";

interface Props {
  room: ChatRoom;
  messages: ChatMessage[];
  currentCastId: string;
  currentCastName: string;
}

export function ChatRoomView({
  room,
  messages: initialMessages,
  currentCastId,
  currentCastName,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [threadOpen, setThreadOpen] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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
    navigator.clipboard.writeText(msg.content).catch(() => {});
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

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

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
    try {
      const res = await fetch("/api/team-chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          content: text,
          threadParentId: targetId ?? undefined,
        }),
      });
      if (res.ok) {
        const { message } = await res.json();
        if (message?.id) {
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
              editingId={editingId}
              editDraft={editDraft}
              setEditDraft={setEditDraft}
              onStartEdit={startEdit}
              onCancelEdit={cancelEdit}
              onCommitEdit={commitEdit}
              onDelete={handleDelete}
              onCopy={handleCopy}
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
                  editingId={editingId}
                  editDraft={editDraft}
                  setEditDraft={setEditDraft}
                  onStartEdit={startEdit}
                  onCancelEdit={cancelEdit}
                  onCommitEdit={commitEdit}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
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
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInput((prev) =>
                      prev.includes("@さくらママ") ? prev : "@さくらママ " + prev,
                    );
                  }}
                  className="shrink-0 mb-1 p-1.5 rounded-full text-gold-deep hover:bg-champagne-soft/60"
                  title="@さくらママ"
                >
                  <Sparkles size={18} />
                </button>
                <div className="flex-1">
                  <ChatTextarea
                    value={input}
                    onChange={setInput}
                    onSend={handleSend}
                    placeholder="メッセージを入力..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className={cn(
                    "shrink-0 mb-1 p-2 rounded-full transition-colors",
                    input.trim() && !sending
                      ? "bg-wine-deep text-pearl-light"
                      : "bg-pearl-soft text-ink-mute",
                  )}
                  aria-label="送信"
                  title="送信（⌘/Ctrl+Enter）"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
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
                onOpenThread={() => setThreadOpen(msg.id)}
                highlight={isSearching ? normalizedQuery : undefined}
                editingId={editingId}
                editDraft={editDraft}
                setEditDraft={setEditDraft}
                onStartEdit={startEdit}
                onCancelEdit={cancelEdit}
                onCommitEdit={commitEdit}
                onDelete={handleDelete}
                onCopy={handleCopy}
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
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => {
                setInput((prev) =>
                  prev.includes("@さくらママ") ? prev : "@さくらママ " + prev,
                );
              }}
              className="shrink-0 mb-1 p-1.5 rounded-full text-gold-deep hover:bg-champagne-soft/60"
              title="@さくらママ"
            >
              <Sparkles size={18} />
            </button>
            <div className="flex-1">
              <ChatTextarea
                value={input}
                onChange={setInput}
                onSend={handleSend}
                placeholder="メッセージを入力..."
              />
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className={cn(
                "shrink-0 mb-1 p-2 rounded-full transition-colors",
                input.trim() && !sending
                  ? "bg-wine-deep text-pearl-light"
                  : "bg-pearl-soft text-ink-mute",
              )}
              aria-label="送信"
              title="送信（⌘/Ctrl+Enter）"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <p className="text-[10px] text-ink-mute mt-1.5 pl-1">
            Enter で改行 / 送信ボタン または ⌘/Ctrl+Enter で送信
          </p>
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
  onOpenThread?: () => void;
  /** Lowercased search query to highlight; if set, matching substrings get wrapped. */
  highlight?: string;
  editingId: string | null;
  editDraft: string;
  setEditDraft: (v: string) => void;
  onStartEdit: (msg: ChatMessage) => void;
  onCancelEdit: () => void;
  onCommitEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (msg: ChatMessage) => void;
}

function MessageRow({
  msg,
  currentCastId,
  isCoaching,
  showAvatar,
  showName,
  onOpenThread,
  highlight,
  editingId,
  editDraft,
  setEditDraft,
  onStartEdit,
  onCancelEdit,
  onCommitEdit,
  onDelete,
  onCopy,
}: MessageRowProps) {
  const isMe = msg.sender_id === currentCastId;
  const time = new Date(msg.created_at);
  const timeStr = `${time.getHours()}:${String(time.getMinutes()).padStart(2, "0")}`;
  const isEditing = editingId === msg.id;
  const isDeleted = !!msg.deleted_at;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const canEdit = isMe && !msg.is_bot && !isDeleted;

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => setMenuOpen(true), 500);
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
        className={cn(
          "flex flex-col max-w-[72%]",
          isMe ? "items-end" : "items-start",
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
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
          <div
            className={cn(
              "px-3.5 py-2 text-body-md leading-relaxed whitespace-pre-wrap break-words",
              isMe
                ? "bg-wine-deep text-pearl-light rounded-2xl rounded-br-sm shadow-luxe"
                : "bg-pearl-light border border-ink/[0.08] text-ink rounded-2xl rounded-bl-sm shadow-soft",
            )}
          >
            {renderContentParts(msg.content, highlight)}
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

        {/* Action buttons (tap-revealed) */}
        {!isEditing && !isDeleted && (
          <div className={cn("flex items-center gap-2 mt-1 px-1", isMe ? "flex-row-reverse" : "flex-row")}>
            {onOpenThread && (
              <button
                type="button"
                onClick={onOpenThread}
                className="flex items-center gap-0.5 text-[10px] text-ink-mute hover:text-ink-soft"
              >
                <MessageCircle size={10} />
                返信
              </button>
            )}
            <button
              type="button"
              onClick={() => onCopy(msg)}
              className="flex items-center gap-0.5 text-[10px] text-ink-mute hover:text-ink-soft"
            >
              <Copy size={10} />
              コピー
            </button>
            {canEdit && (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-0.5 text-[10px] text-ink-mute hover:text-ink-soft"
                >
                  <MoreHorizontal size={12} />
                </button>
                {menuOpen && (
                  <div className={cn(
                    "absolute z-30 top-full mt-1 min-w-[140px] rounded-card border border-ink/[0.06] bg-pearl shadow-soft overflow-hidden",
                    isMe ? "right-0" : "left-0",
                  )}>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onStartEdit(msg);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-body-sm text-ink hover:bg-pearl-soft"
                    >
                      <Pencil size={13} />
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(msg.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-body-sm text-[#c2575b] hover:bg-[#c2575b]/5"
                    >
                      <Trash2 size={13} />
                      取り消し
                    </button>
                  </div>
                )}
              </div>
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

// ═══════════════ Simple Chat Textarea ═══════════════

function ChatTextarea({
  value,
  onChange,
  onSend,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  placeholder: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        // Cmd/Ctrl+Enter sends; plain Enter creates a newline so users
        // can compose multi-line messages without premature submission.
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          onSend();
        }
      }}
      placeholder={placeholder}
      rows={1}
      className="w-full resize-none rounded-2xl border border-ink/[0.08] bg-pearl-light px-3 py-2 text-body-md text-ink placeholder:text-ink-mute focus:outline-none focus:border-wine-deep"
      style={{ fontSize: "16px", maxHeight: "160px" }}
    />
  );
}
