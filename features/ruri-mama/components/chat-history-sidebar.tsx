"use client";

import { MessageCircle, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { deleteSession, type ChatSession } from "../lib/chat-session-store";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${mi}`;
}

function customerLabel(session: ChatSession): string {
  return session.customerName ? `${session.customerName}さま` : "お客様指定なし";
}

interface Props {
  open: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelect: (session: ChatSession) => void;
  onNewChat: () => void;
  /** 削除後に親側の一覧を更新するためのコールバック */
  onChanged: () => void;
}

/**
 * さくらママページの相談履歴サイドバー（ChatGPT / Claude 風ドロワー）。
 * 左上トグルで開閉。お客様で絞り込み、セッションをタップすると会話を読み込む。
 */
export function ChatHistorySidebar({
  open,
  onClose,
  sessions,
  activeSessionId,
  onSelect,
  onNewChat,
  onChanged,
}: Props) {
  const [query, setQuery] = useState("");
  // "all" | "none" | customerId
  const [filter, setFilter] = useState<string>("all");

  // 一覧に登場するお客様（重複排除）
  const customers = useMemo(() => {
    const map = new Map<string, string>();
    let hasNone = false;
    for (const s of sessions) {
      if (s.customerId && s.customerName) map.set(s.customerId, s.customerName);
      else hasNone = true;
    }
    return {
      list: Array.from(map, ([id, name]) => ({ id, name })),
      hasNone,
    };
  }, [sessions]);

  const filtered = useMemo(() => {
    let xs = sessions;
    if (filter === "none") xs = xs.filter((s) => !s.customerId);
    else if (filter !== "all") xs = xs.filter((s) => s.customerId === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      xs = xs.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.customerName?.toLowerCase().includes(q) ||
          s.messages.some((m) => m.content.toLowerCase().includes(q)),
      );
    }
    return xs;
  }, [sessions, filter, query]);

  const handleDelete = (id: string) => {
    if (!confirm("この相談履歴を削除しますか？")) return;
    deleteSession(id);
    onChanged();
  };

  return (
    <>
      {/* 背景（ドロワー表示中のオーバーレイ） */}
      {open && (
        <button
          type="button"
          aria-label="閉じる"
          onClick={onClose}
          className="absolute inset-0 z-40 bg-ink/25 backdrop-blur-[1px]"
        />
      )}

      <aside
        className={cn(
          "absolute inset-y-0 left-0 z-50 w-[86%] max-w-[330px] flex flex-col",
          "bg-pearl border-r border-pearl-soft shadow-warm",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!open}
      >
        {/* ヘッダ */}
        <div className="flex items-center gap-2 px-3.5 pt-3.5 pb-2">
          <span className="flex-1 text-[13px] font-semibold tracking-luxe text-ink">
            相談履歴
          </span>
          <button
            type="button"
            onClick={onNewChat}
            aria-label="新しい相談"
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-pill bg-pearl-light border border-gold/30 text-gold-deep text-[11px] font-medium active:scale-95"
          >
            <Plus size={13} />
            新規
          </button>
          <button
            type="button"
            aria-label="一覧を閉じる"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-mute hover:bg-pearl-warm active:scale-95"
          >
            <X size={17} />
          </button>
        </div>

        {/* 検索 */}
        <div className="px-3.5 pb-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="お客様名・キーワードで検索"
              style={{ fontSize: "13px" }}
              className="w-full h-9 pl-8 pr-3 rounded-full bg-pearl-warm border border-pearl-soft text-ink outline-none focus:border-gold/30 placeholder:text-ink-mute"
            />
          </div>
        </div>

        {/* お客様で絞り込み */}
        {(customers.list.length > 0 || customers.hasNone) && (
          <div className="px-3.5 pb-2 flex gap-1.5 overflow-x-auto">
            <FilterChip
              label="すべて"
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            {customers.list.map((c) => (
              <FilterChip
                key={c.id}
                label={`${c.name}さま`}
                active={filter === c.id}
                onClick={() => setFilter(c.id)}
              />
            ))}
            {customers.hasNone && (
              <FilterChip
                label="指定なし"
                active={filter === "none"}
                onClick={() => setFilter("none")}
              />
            )}
          </div>
        )}

        <div className="px-3.5 pb-1 text-[11px] text-ink-mute">
          {filtered.length}件の相談履歴
        </div>

        {/* セッション一覧（コンパクト 1〜2 行） */}
        <div className="flex-1 overflow-y-auto px-3 pb-28 space-y-1.5">
          {filtered.length === 0 ? (
            <div className="px-2 pt-10 flex flex-col items-center gap-2 text-center">
              <MessageCircle size={20} className="text-ink-mute" />
              <p className="text-[12px] text-ink-mute leading-relaxed">
                {sessions.length === 0
                  ? "まだ相談履歴がありません。"
                  : "該当する履歴が見つかりません。"}
              </p>
            </div>
          ) : (
            filtered.map((s) => (
              <div key={s.id} className="relative">
                <button
                  type="button"
                  onClick={() => onSelect(s)}
                  className={cn(
                    "w-full text-left rounded-card border pl-3 pr-8 py-2 transition active:scale-[0.99]",
                    s.id === activeSessionId
                      ? "bg-champagne-soft/50 border-gold/40"
                      : "bg-pearl-light border-pearl-soft hover:border-gold/30",
                  )}
                >
                  <div className="text-[13px] font-semibold text-ink truncate leading-snug">
                    {s.title}
                  </div>
                  <div className="text-[11px] text-ink-mute truncate mt-0.5">
                    <span className="text-gold-deep">{customerLabel(s)}</span>
                    {" · "}
                    {formatDate(s.updatedAt)}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  aria-label="この履歴を削除"
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-ink-mute hover:text-wine-deep hover:bg-pearl-warm"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 h-7 px-3 rounded-pill text-[11px] font-medium whitespace-nowrap transition active:scale-95",
        active
          ? "bg-wine-deep text-pearl-light"
          : "bg-pearl-warm text-ink-soft border border-pearl-soft",
      )}
    >
      {label}
    </button>
  );
}
